FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# EasyPanel passes service env vars as build-args. Expose at BUILD time:
# - DATABASE_URL: server components touched during page-data collection reach the DB.
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: NEXT_PUBLIC_* vars are inlined into the client
#   bundle at build time (NOT read at runtime), so it must be present here or the
#   Payment Element silently has no key.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
# `output: standalone` does NOT bundle public/ -- Next expects it copied by hand. Without this
# line everything in public/ 404s in production while serving fine in dev (globe.svg was 404 in
# prod before this).
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
