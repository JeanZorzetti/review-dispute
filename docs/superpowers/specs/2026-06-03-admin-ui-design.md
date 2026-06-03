# Admin UI — Design Spec

> Internal single-operator console for ReviewShield. Lets the owner onboard clients and work the human-in-the-loop dispute queue without using curl.

## Context — por que esta tela

O produto está deployado e o pipeline funciona, mas as ações do operador (cadastrar cliente, aprovar/submeter/negar disputes, disparar cron) só existem como rotas de API cruas. Operar isso no `curl` é inviável no dia a dia. Quando a GBP API aprovar, o operador precisa de uma caixa de trabalho pronta para processar disputes reais.

Esta é a única frente de código que ainda destrava valor operacional enquanto duas dependências externas (aprovação da GBP API + distribuição) seguem pendentes.

**Resultado pretendido:** um console interno, protegido por senha, onde o dono (único operador) gerencia todos os clientes e trabalha a fila de disputes ponta a ponta.

## Decisões travadas (do brainstorm)

| Decisão | Escolha |
|---------|---------|
| Operador | **Single-operator (só o dono)** — sem portal por-cliente, sem multi-tenant |
| Auth | **Senha única via env (`ADMIN_PASSWORD`)** + cookie de sessão httpOnly |
| Telas no MVP | Fila de disputes · Gestão de clientes · Disparar cron manual |
| Fora do MVP | Inserir review manual via UI (operador optou por fora) |
| Submeter dispute | **Humano-no-loop:** admin mostra o caso + link do Google; operador submete manualmente lá e marca "submitted" no admin. Sem automação de browser. |
| Marcar removido | **Manual + automático** — botão no admin (com confirm, pois cobra) E o `reconcile` automático continua |
| Estilo | Tailwind + shadcn (mesma stack da landing), tom utilitário/denso (ferramenta, não marketing) |

## Autenticação

- `ADMIN_PASSWORD` em env var (EasyPanel). `ADMIN_SESSION_SECRET` (ou reuso do `CRON_SECRET`) assina o cookie de sessão.
- `/admin/login` → form de senha → compara com a env → seta cookie httpOnly assinado.
- `requireAdmin()` aplicado no `app/admin/layout.tsx` protege tudo sob `/admin` exceto `/login`. Sem cookie válido → redirect para `/admin/login`.
- Login errado → mensagem genérica ("invalid password"), sem vazar se a env existe.
- Filosofia idêntica ao `isAuthorizedCron` já existente (segredo em env), com sessão via cookie em vez de header.

## Telas

### 1. Fila de disputes — `/admin` (a caixa de trabalho)

Disputes agrupados por estado, na ordem do fluxo: **READY** (precisam de você) → **SUBMITTED** (aguardando Google) → **REMOVED/BILLED** (resolvidos). Filtro por estado no topo com contadores.

**Card READY** mostra: cliente · tipo de violação · força do caso · texto do review original · o **argumento montado pelo agente** com botão **Copy** · link **Open Google report flow** · ações **Mark as submitted** / **Mark denied**.

Fluxo do operador: lê o caso → copia o argumento → abre o fluxo do Google → submete manualmente lá → clica "Mark as submitted" (card move para SUBMITTED).

**Card SUBMITTED** mostra: cliente · violação · há quanto tempo submetido · ações **Mark removed** (com confirm, dispara cobrança) / **Mark denied**.

### 2. Gestão de clientes — `/admin/clients`

- **Listar** clientes com contadores por estado (reviews/ready/submitted/removed) e status de conexão (tem `oauthTokens`? tem `gbpLocationId`?).
- **New client**: form (`businessName`, `email`, `pricePerRemovalCents` default 49900) → cria registro. O cliente conecta o Google depois via OAuth (preenche tokens). Este é o onboarding manual que destrava antes do self-service.

### 3. Operações (cron manual)

Botões no admin: **Run sync + triage** e **Run reconcile + billing** — disparam sob demanda o mesmo trabalho dos crons agendados, para todos os clientes conectados. Cada um mostra um toast com o resultado (ex: "Synced 3 clients, 7 new reviews, 2 disputes built").

## Arquitetura

```
src/
├── lib/
│   └── admin-auth.ts            # verifyPassword(), createSession(), requireAdmin()
├── units/
│   ├── tracker/
│   │   └── mark-removed.ts      # markRemovedManually(disputeId) — NOVO
│   └── operations/
│       └── run-all.ts           # runSyncAllClients(), runReconcileAllClients() — extraídas das crons
app/
├── admin/
│   ├── layout.tsx               # requireAdmin + navbar (Disputes · Clients · logout)
│   ├── login/page.tsx           # form de senha (público)
│   ├── page.tsx                 # fila de disputes
│   ├── clients/page.tsx         # gestão de clientes
│   └── actions.ts               # server actions
└── api/
    ├── cron/sync/route.ts       # MODIFY: chama runSyncAllClients()
    └── cron/reconcile/route.ts  # MODIFY: chama runReconcileAllClients()
```

**Camadas isoladas:**
- **Auth** (`admin-auth.ts`): cookie httpOnly assinado; `requireAdmin()` protege `/admin/*`.
- **Server actions** (`app/admin/actions.ts`): ponte fina UI↔domínio. Cada action chama `requireAdmin()` e depois a função de domínio. Sem lógica de negócio nova.
- **Domínio**: reusa o que existe (`markSubmitted`, `markDenied`, `buildDisputes`, `syncReviews`, `runTriage`, `reconcile`, `chargeRemovals`) + 2 novas funções.

**DRY — reuso crítico:** o corpo de cada cron route é extraído para `runSyncAllClients()` / `runReconcileAllClients()`. Tanto a rota de cron quanto o botão do admin chamam essas funções — uma fonte só de verdade, evita divergência.

**Nova função `markRemovedManually(disputeId)`:** transição SUBMITTED→REMOVED + cria outcome REMOVED (igual ao que o `reconcile` faz após 2 confirmações). Reusa o state machine. A server action que a chama em seguida dispara `chargeRemovals`.

## Tratamento de erros

- Server action que falha (ex: transição ilegal via `assertTransition`) → captura, retorna erro para a UI exibir toast vermelho, não quebra a página.
- `markRemovedManually` → `chargeRemovals`: se `STRIPE_SECRET_KEY` ausente (estado atual), a função lança erro claro; a UI mostra "billing not configured" em vez de quebrar. Esperado e tratado.
- Login errado → mensagem genérica.
- Páginas `/admin` tocam o banco em runtime → seguir o padrão do `/dashboard` (`export const dynamic = 'force-dynamic'` + tolerar DB indisponível no build) para não repetir o build-break.

## Testing

- `admin-auth.ts`: teste unitário (senha certa/errada, sessão válida/inválida).
- `markRemovedManually`: teste igual aos do tracker (transição + outcome + idempotência).
- `run-all.ts`: teste de integração com mocks (orquestra sync→triage / reconcile→bill).
- Páginas e actions de UI: sem teste automatizado (presentation/glue) — verificação manual. Decisão deliberada, consistente com a landing.

## Verificação end-to-end

1. Setar `ADMIN_PASSWORD` → `/admin` sem login redireciona para `/login`; senha certa entra; senha errada mostra erro genérico.
2. `/admin/clients` → criar cliente → aparece com contadores zerados.
3. Com um dispute READY no banco → aparece na fila com argumento + botão Copy; "Mark as submitted" move para SUBMITTED.
4. "Mark removed" (confirm) → REMOVED → cobra via Stripe, ou erro claro "billing not configured" se Stripe ausente. "Mark denied" → CLOSED_LOST, sem cobrar.
5. "Run sync + triage" → toast com resultado.
6. `npm run build` passa; rotas `/admin/*` são dinâmicas (ƒ), não quebram o build.

## Out of scope (YAGNI)

- Portal por-cliente com login próprio; multi-operador / roles.
- Automação de browser para submeter no Google.
- Inserir review manual via UI (operador optou por fora — testar via SQL/cron até o Google aprovar).
- Edição do argumento do dispute (usa o que o agente gerou).
- Naming/branding (já definido: ReviewShield).
