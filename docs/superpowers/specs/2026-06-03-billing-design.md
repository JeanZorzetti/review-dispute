# Billing (Stripe) — Design Spec

> Make ReviewShield actually chargeable. Client picks a billing method at onboarding (saved card → auto-charge, or invoice per removal). $499 per removed review.

## Context — por que esta mudança

O billing foi implementado no MVP do produto (`chargeRemovals` + `StripeGateway`), mas a implementação atual cria um `PaymentIntent` com `confirm:false` — **isso não cobra ninguém**, só cria uma intenção rascunho. Não há captura de meio de pagamento em lugar nenhum. Setar `STRIPE_SECRET_KEY` removeria o erro, mas o produto continuaria não-cobrável.

Para faturar de verdade, o cliente precisa ter um meio de pagamento associado. Decisão de produto: oferecer **dois métodos** e deixar o cliente escolher no onboarding — cartão salvo (auto-charge) ou invoice por remoção.

**Resultado pretendido:** quando um review é removido, o cliente é cobrado de verdade ($499) pelo método que escolheu — automaticamente (cartão) ou via invoice (link de pagamento).

## Decisões travadas (do brainstorm)

| Decisão | Escolha |
|---------|---------|
| Métodos | **Dois:** `card` (auto-charge) e `invoice` (pay per removal) |
| Quando escolhe | **No onboarding, persistido** em `Client.billingMethod` |
| Momento da captura | **Logo após conectar o Google** → redirect para `/onboarding/billing` |
| Escopo | **Self-service completo** (construir mesmo sem poder testar o passo do OAuth ainda) |
| Mitigação do "no escuro" | Billing **testável isoladamente** com Stripe test mode, sem depender do OAuth do Google |
| Confirmação de invoice | **Webhook do Stripe** (`invoice.paid`) |

## Modelo de dados (schema + migration)

- `Client.billingMethod: String?` — `'card'` | `'invoice'` | `null` (não escolhido)
- `Client.stripeCustomerId: String?` — Stripe Customer, criado quando o cliente escolhe o método
- `Charge.status: String @default("issued")` — `'issued'` | `'paid'`
- `Charge.stripeInvoiceId: String?` — para o caminho invoice (rastrear pagamento via webhook)

> Gotcha (memória Compass): `stripeCustomerId` NÃO é portável test↔live. `getOrCreateCustomer` verifica/cria sob demanda, então a troca test→live se auto-corrige.

## Fluxo

```
1. Cliente conecta Google (OAuth) → tokens salvos
2. Callback redireciona para /onboarding/billing (NÃO direto pro dashboard)
3. "Choose how you'll pay when we remove a review":
     ○ Save a card — auto-charged on each removal
     ○ Get an invoice — pay per removal
   - card    → SetupIntent + Payment Element → salva payment_method no Customer → billingMethod='card'
   - invoice → cria Customer (sem cartão) → billingMethod='invoice'
4. → /dashboard
```

Na remoção (`chargeRemovals`, review vira REMOVED):
- `billingMethod === 'card'` → PaymentIntent com customer+payment_method salvos, `confirm:true`, `off_session:true` → cobra na hora.
- `billingMethod === 'invoice'` → cria Stripe Invoice de $499, finaliza, Stripe envia hosted invoice page → cliente paga; pagamento confirmado via webhook `invoice.paid`.

## Arquitetura

```
prisma/schema.prisma                       # MODIFY: Client.billingMethod/stripeCustomerId; Charge.status/stripeInvoiceId
src/lib/stripe.ts                          # MODIFY: expand StripeGateway
src/units/billing/billing.ts               # MODIFY: chargeRemovals branches on billingMethod
src/units/billing/setup-billing.ts         # CREATE: chooseBillingMethod + setup helpers
app/onboarding/billing/page.tsx            # CREATE: choose-method page (server)
app/onboarding/billing/BillingChoice.tsx   # CREATE: client — radio + Stripe Payment Element
app/onboarding/billing/actions.ts          # CREATE: server actions (createSetupIntent, confirmCard, chooseInvoice)
app/api/auth/google/callback/route.ts      # MODIFY: redirect → /onboarding/billing
app/api/webhooks/stripe/route.ts           # CREATE: invoice.paid / payment_intent.succeeded
```

**Expanded `StripeGateway` interface** (each isolated, testable in test mode):
- `getOrCreateCustomer(client)` → ensures Stripe Customer
- `createSetupIntent(customerId)` → for Payment Element to save a card
- `chargeSavedCard(customerId, paymentMethodId, amountCents, description)` → auto-charge (confirm:true, off_session)
- `createInvoice(customerId, amountCents, description)` → invoice path, returns `{ invoiceId }`
- `verifyWebhook(payload, signature)` → validates + parses event

**Layers:** gateway (`stripe.ts`) is the only thing that talks to Stripe; everything else goes through it. `setup-billing.ts` orchestrates method choice. `billing.ts` branches on method, keeps idempotency (no double charge). `/onboarding/billing` is the UI (`@stripe/react-stripe-js` Payment Element). Webhook endpoint isolated, signature-verified.

**New deps:** `@stripe/stripe-js` + `@stripe/react-stripe-js` (front Payment Element). Server `stripe` SDK already installed.

## Tratamento de erros

| Situação | Comportamento |
|----------|---------------|
| Cartão recusado no auto-charge (off_session) | `chargeSavedCard` lança; review fica REMOVED **sem** BILLED; admin mostra "charge failed — retry"; remoção não se perde |
| Cliente sem `billingMethod` na remoção | `chargeRemovals` pula o cliente e loga; não quebra o lote |
| Webhook assinatura inválida | 400, ignora; só processa eventos válidos |
| Webhook duplicado | idempotente por `stripeInvoiceId`/paymentIntentId; marcar pago 2x é no-op |
| SetupIntent falha no front | Payment Element mostra erro inline; `billingMethod` não grava até o cartão salvar |
| `STRIPE_SECRET_KEY` ausente | gateway lança erro claro; onboarding mostra "billing temporarily unavailable", não quebra |

## Testing

- `stripe.ts` gateway contra **Stripe test mode** (test keys): getOrCreateCustomer, createSetupIntent, chargeSavedCard (cartão `4242…`), createInvoice. Isto tira do "construir no escuro".
- `chargeRemovals` branched: mock gateway → `card`→chargeSavedCard, `invoice`→createInvoice, sem método→pula, idempotente.
- `setup-billing.ts`: chooseBillingMethod persiste o campo.
- Webhook: payload assinado válido/inválido → atualiza/ignora `Charge.status`.
- UI `/onboarding/billing`: glue, verificação manual.

## Verificação end-to-end (testável já, sem Google)

1. Criar cliente no `/admin` → acessar `/onboarding/billing?clientId=...`.
2. "card" → Payment Element → `4242 4242 4242 4242` → confirma → `billingMethod='card'` + `stripeCustomerId` (conferir no Stripe test dashboard).
3. "invoice" (outro cliente) → `billingMethod='invoice'`.
4. Simular remoção (admin mark-removed ou SQL) → `chargeRemovals`: card → PaymentIntent succeeded no Stripe test; invoice → Invoice criada/finalizada.
5. Disparar webhook teste (Stripe CLI `stripe trigger invoice.paid`) → `Charge.status='paid'`.
6. `npm run build` verde.

## Out of scope (YAGNI)

- Trocar de método depois (fica com o escolhido; mudar = falar com o operador).
- Cobrança recorrente/assinatura (é pay-per-removal).
- Dunning/retry automático de cartão recusado (admin faz retry manual).
- Múltiplas moedas (USD só).
- Reembolso via UI (faz no Stripe direto).
