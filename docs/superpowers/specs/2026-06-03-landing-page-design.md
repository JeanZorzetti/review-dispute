# Landing Page — Design Spec

> Product: Review Dispute Agent (AgaaS — removes policy-violating Google reviews for US contractors, pay-on-removal).
> Replaces the default Next.js placeholder at `app/page.tsx`.

## Context — por que esta página

O app está deployado (`sofia-review-dispute.7c17iw.easypanel.host`) mas a home ainda é o placeholder do `create-next-app`. A landing é o rosto do produto e o ponto de entrada da distribuição (soft launch quando a GBP API aprovar). Sem ela, qualquer tráfego cai numa página de boilerplate — perda total.

O produto cobra por resultado (review removido) e tem uma regra ética central: **remove apenas reviews que violam a política do Google**, nunca clientes legítimos insatisfeitos. A landing precisa ter impacto comercial (ROI) **e** transmitir essa integridade — senão soa como "apagamos críticas", o que queima a marca e atrai o cliente errado.

**Resultado pretendido:** uma landing em inglês, focada no contractor americano, que comunica o valor em segundos, mata objeções de risco, e leva ao CTA "Connect Google".

## Decisões travadas (do brainstorm)

| Decisão | Escolha |
|---------|---------|
| Idioma | Inglês (mercado US) |
| Público | Contractor final (roofer / HVAC / plumber) — B2B direto |
| CTA | **"Connect Google"** → `/api/auth/google` (self-service; funcional no lançamento pós-aprovação GBP) |
| Ângulo do herói | ROI / dinheiro perdido, com a promessa honesta logo na seção seguinte |
| Estilo visual | **Bold Contractor**: fundo escuro (`#16181d`), laranja-construção (`#ff5b35`), headings uppercase pesados, industrial/urgente |
| Prova social | **Fora por enquanto** — sem inventar depoimento falso. Adicionar quando houver remoções reais |

## Identidade visual

- **Cores:** base escura `#16181d` / `#1c1f26` (seções alternadas), texto `#ffffff` / secundário `#b8bcc4`, acento `#ff5b35` (CTA, labels, números).
- **Tipografia:** sans-serif do sistema; headings `font-weight: 800–900`, `text-transform: uppercase` nos títulos de seção e herói.
- **Botões:** laranja sólido, peso 800, uppercase, cantos levemente arredondados (`5px`).
- **Tom:** direto, masculino, "mão na massa". Frases curtas. Fala a língua de quem perde contrato por causa de um review falso.
- **Nome de trabalho:** "ReviewShield" (placeholder — naming final fora do escopo desta página; usar como string única num arquivo de config pra trocar fácil).

## Estrutura — 7 seções (ordem aprovada)

1. **Header** — logo + botão "Connect Google" (sticky no topo).
2. **Hero** — H1 ROI: *"Stop losing jobs to fake reviews."* Subhead: *"We remove policy-violating reviews. You only pay when one comes down."* + CTA primário.
3. **A promessa honesta** — *"We only remove reviews that break Google's rules."* Lista os tipos (fake, competitor, extortion, off-topic) e deixa explícito que cliente legítimo insatisfeito **não** é alvo — e que é por isso que o Google aprova as remoções.
4. **O problema (dor + dinheiro)** — ancorar no custo real: *"One fake 1-star from a competitor can cost a $20k job in the same week."* Pontos de apoio: peso do ranking local, % de clientes que leem reviews antes de contratar, custo de um contrato perdido.
5. **Como funciona (3 passos)** — (1) Connect your Google profile · (2) We flag & dispute the policy-violating ones · (3) Pay only when removed.
6. **Pricing (pay-on-results)** — destaque grande: *"$X per removed review. No monthly fee. No removal, no charge."* (valor exato a definir; usar placeholder de preço claramente marcado).
7. **FAQ** — mata objeções de risco: *Is this legal? · Will Google ban me? · What if you can't remove it? · How long does it take?*
8. **CTA final + footer** — repetição do "Connect Google" + footer mínimo (nome, links legais placeholder).

## Arquitetura técnica

Componentização por seção — cada seção é um componente isolado, fácil de editar/reordenar sem tocar nas outras. Server components estáticos (sem dados dinâmicos; a landing não toca o banco).

```
app/
├── page.tsx                      # monta as seções em ordem (substitui o placeholder)
└── (marketing)/                  # opcional: agrupar estilos da landing
src/
├── components/landing/
│   ├── site-config.ts            # nome do produto, preço, URLs CTA — single source of truth
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── HonestPromise.tsx
│   ├── Problem.tsx
│   ├── HowItWorks.tsx
│   ├── Pricing.tsx
│   ├── Faq.tsx                   # client component (accordion interativo)
│   └── Footer.tsx
```

- **Estilo:** o projeto foi scaffoldado **sem Tailwind** (`--no-tailwind`). O CSS já em uso é CSS Modules + globals. Manter o padrão: um `landing.module.css` por seção ou um módulo compartilhado com as variáveis de cor. NÃO introduzir Tailwind agora (evita reescrever config e divergir do resto do projeto).
- **Fonte de verdade:** `site-config.ts` exporta `PRODUCT_NAME`, `PRICE_PER_REMOVAL`, `CONNECT_URL = '/api/auth/google'`. Toda seção lê daqui — trocar nome/preço é um lugar só.
- **CTA:** todos os botões "Connect Google" são `<a href={CONNECT_URL}>` — leva ao OAuth já existente. Sem JS.
- **FAQ:** único componente interativo (accordion). Client component pequeno e isolado.
- **Responsivo:** mobile-first (contractor provavelmente abre no celular). Hero e "como funciona" empilham em coluna no mobile.
- **SEO/meta:** `metadata` export no `page.tsx` (title, description, OG tags) — importa pro canal de distribuição.

## Out of scope (YAGNI)

- Prova social / depoimentos (sem dados reais — adicionar depois).
- Waitlist / captura de email (CTA é self-service "Connect Google").
- Blog, multi-página, i18n (uma página, inglês).
- Tailwind ou nova lib de UI.
- Animações pesadas (pode ter micro-transições CSS, mas nada de GSAP/Lenis nesta entrega).
- Naming/branding final e preço definitivo (placeholders em `site-config.ts`).

## Verificação

- `npm run build` passa (landing é estática, não toca DB — não repete o problema do `/dashboard`).
- `npm run dev` → abrir `/` e conferir as 7 seções na ordem, no estilo Bold Contractor, responsivo no mobile (DevTools).
- Todos os botões "Connect Google" apontam para `/api/auth/google` (redireciona pro OAuth — 307).
- FAQ accordion abre/fecha.
- Lighthouse rápido: sem erros graves de acessibilidade/contraste (laranja sobre escuro deve passar AA).
