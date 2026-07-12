# Handoff — ReviewShield (review-dispute-agent)

Última atualização: 2026-07-12

## Feito (12/07 — "Confirmar deploy em produção")

- **Deploy em prod CONFIRMADO**: `reviewshield.nimblabs.com` no ar rodando o código da main.
  - `/`, `/login`, `/blog`, `/fake-review-checker` → 200; `/dashboard` → `/login`, `/admin` → `/admin/login` (middleware ok).
  - **Probe E2E do pipeline**: `POST /api/checker` em prod devolveu 200 com classificação real (`FAKE_NO_EXPERIENCE`, HIGH, 0.9, eligible) e `runId` persistido → **DB + Ollama + classificador de triage funcionando em prod** (~39s de inferência).
- **Bug corrigido** (`5a1d137`): redirects de route handlers usavam `request.url`, que atrás do proxy EasyPanel resolve para `0.0.0.0:3000` — magic-link login, callback OAuth e logout dead-endavam. Fix: base nos redirects = `SITE_URL` (src/lib/site.ts). 109 testes verdes + tsc limpo antes do push.

## Pendências (bloqueiam o fluxo de disputa E2E completo)

1. **`GOOGLE_CLIENT_ID` (e conferir `GOOGLE_CLIENT_SECRET`) FALTANDO no EasyPanel** — `/api/auth/google` redireciona com `client_id=undefined`. Sem isso, nenhum cliente consegue conectar o GBP. `GOOGLE_REDIRECT_URI` já está setada (correta). Env vars esperadas: ver `.env.example`.
2. Depois de setar as envs: rodar o fluxo de disputa ponta a ponta com uma conta GBP real (onboarding OAuth → sync reviews → disputa → submit).
3. Conferir no EasyPanel se as demais envs do `.env.example` estão setadas (RESEND_API_KEY, STRIPE_*, TOKEN_ENCRYPTION_KEY, CLIENT/ADMIN_SESSION_SECRET, CRON_SECRET) — não testáveis de fora.

## Gotchas

- Prisma 7 lê a `url` do `prisma.config.ts`, não do schema.
- `request.url` em route handler atrás do EasyPanel = bind interno (`0.0.0.0:3000`). Redirects sempre via `SITE_URL`.
- `SITE_URL` é constante hard-coded em `src/lib/site.ts` (não env).
