# Pricing Decision — Review Dispute Agent

> Decision date: 2026-06-03 · Model: pay-per-removal (no-win-no-fee) · **$499 per removed review**

## Context

The product charges per removed Google review. The landing shipped with a placeholder `$99`. This doc replaces that guess with a benchmarked decision. Marginal cost is ~zero (self-hosted Ollama, not a paid LLM API), so the price is optimized for **conversion and perceived value**, not cost recovery — any price that converts is profitable at this stage.

Key downstream metrics the user will watch:
1. **Conversion rate** — is the value being perceived (driving signups → connected profiles → paid removals)?
2. **Revenue vs. real removal rate** — once the GBP API approval lands and real disputes run, does $499 × actual-removal-rate compensate? (Early on it always does, given ~zero marginal cost.)

## Benchmark (US, June 2026)

**Direct competitors — review removal services:**

| Player | Price / removal | Model | Notes |
|--------|-----------------|-------|-------|
| ReviewsEraser | $199 flat | per removal | cheap, high-volume |
| RenewLocal | $550 | per removal | mid |
| Reputation Resolutions | **$1,500** | pay-after-removal, claims 90% success | premium |
| RepSpert | undisclosed (quote) | pay-on-removal, **policy-violations only** | closest positioning twin |
| Market range | **$299–$1,500** | mostly no-win-no-fee | — |

**Reputation SaaS (the budget contractors already accept):**
- Birdeye $299–449/mo per location; Podium ~$399/mo+. Neither removes any review — monitoring/response/collection only.

**Three insights:**
1. **Right axis = single flat price per removal.** Nearly all competitors charge flat per removal, not by violation type/severity. Keeps it simple, matches the landing's "per review removed."
2. **Market removal success is <10% for non-fake reviews** — but we only target **policy violations** (like RepSpert), where removal is far more likely. This justifies premium pricing honestly.
3. **Contractors already spend $300–450/mo on reputation tooling that removes nothing.** A tangible per-removal outcome has ample price headroom.

## Decision

- **Price: $499 per removed review.** Above the market midpoint, well under the $1,500 ceiling. Signals quality/trust without scaring; trivial against a $10k+ lost job. Avoids the "too cheap = scam" trap the benchmark flagged for low-priced "guaranteed removal" services.
- **Model: no-win-no-fee, pure.** Charge $499 only on confirmed removal; zero on DENIED/CLOSED_LOST. This is the market-standard trust trigger ("only pay when it comes down") and is already what the billing code implements. No deposit (benchmark warns non-refundable deposits read as a scam).
- **Eligibility unchanged:** only genuine Google policy violations are disputed (the product's core rule and moat). This is what makes a premium price defensible and the removal rate high.
- **Communication:** anchor the price against the cost of a lost job — "$499 per removed review — less than one lost job." Reinforces the existing ROI hero on the landing.

## Why not the alternatives

- **$199–249 (cheap):** maximizes raw conversion but risks signaling "scam" in a trust-based purchase, and leaves large margin on the table given zero marginal cost.
- **$750+ (premium):** great margin, but with no social proof yet, a high price stalls the first customers needed to build proof.
- **Tiered by violation type / deposit / setup fee:** benchmark shows the market is flat-per-removal; added complexity hurts the clean "only pay when it comes down" promise without evidence it lifts revenue.

## Revenue intuition (zero marginal cost)

Revenue ≈ (clients) × (disputable violating reviews per client) × (removal rate) × $499. Because marginal cost is ~zero, every removal is ~pure margin in the Ollama phase. The lever to watch is **removal rate** (unknown until GBP API approval) — if it proves low (<~15% even on well-triaged policy cases), revisit the model before scaling marketing. The $499 number itself is safe to launch with and easy to change (single constant in `site-config.ts`).

## Implementation

- `src/components/landing/site-config.ts`: `PRICE_PER_REMOVAL` `'$99'` → `'$499'`; refine `PRICING.body` / `highlight` to carry the "less than one lost job" anchor.
- Billing already charges per `Client.pricePerRemovalCents`; update the default from `9900` to `49900` in the Prisma schema for new clients (existing test data unaffected). Existing clients can be updated individually.

## Status

Decided. Not yet reflected in code — see Implementation. Final number will be validated against real conversion + removal data once the GBP API approval lands and the soft launch begins.
