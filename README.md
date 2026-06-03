# ReviewShield (Review Dispute Agent)

AI-powered Google Business Profile review dispute automation. Watches for violating reviews, builds dispute cases, submits them, tracks removals, and bills clients per removal.

**Production:** https://reviewshield.nimblabs.com

## Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI — prod: `https://reviewshield.nimblabs.com/api/auth/google/callback` |
| `OLLAMA_BASE_URL` | Base URL of the self-hosted Ollama instance used for review triage (e.g. `http://ollama:11434`) |
| `OLLAMA_MODEL` | Ollama model tag (defaults to `qwen2.5:7b-instruct`) |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing (`sk_test_…` / `sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — `NEXT_PUBLIC_` prefix required (read client-side by the Payment Element) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook endpoint at `/api/webhooks/stripe` |
| `CRON_SECRET` | Bearer token that cron jobs must supply in the `Authorization` header |
| `ADMIN_PASSWORD` | Password for the internal `/admin` console |
| `ADMIN_SESSION_SECRET` | Secret used to sign the admin session cookie |

## External configuration (production)

- **Domain:** point `reviewshield.nimblabs.com` to the service (EasyPanel domain + DNS).
- **Google OAuth Console:** add `https://reviewshield.nimblabs.com/api/auth/google/callback` to the OAuth client's Authorized redirect URIs (must match `GOOGLE_REDIRECT_URI` exactly).
- **Stripe webhook:** create an endpoint at `https://reviewshield.nimblabs.com/api/webhooks/stripe` listening to at least `invoice.paid`; copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
- **Cron jobs:** schedule `POST /api/cron/sync` and `POST /api/cron/reconcile` with header `Authorization: Bearer $CRON_SECRET`.

## Database Setup

Run migrations before starting the app:

```bash
npx prisma migrate deploy
```

## Running with Docker

```bash
docker build -t review-dispute-agent .
docker run -p 3000:3000 --env-file .env review-dispute-agent
```

## Cron Jobs

Set up two recurring HTTP POST jobs (e.g. via [cron-job.org](https://cron-job.org)) with the header `Authorization: Bearer $CRON_SECRET`:

| Job | URL | Recommended interval |
|---|---|---|
| Sync reviews + triage | `POST /api/cron/sync` | Every 6 hours |
| Reconcile removals + bill | `POST /api/cron/reconcile` | Every 12 hours |

## Human Actions

| Endpoint | Description |
|---|---|
| `POST /api/disputes/:id/submit` | Mark a dispute as submitted to Google |
| `POST /api/disputes/:id/deny` | Record a Google denial and close the case |

## Google OAuth Onboarding

Direct clients to `GET /api/auth/google?state=<client-email>` to authorize GBP access. Tokens are stored automatically on callback.
