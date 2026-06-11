# --- install all deps  ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- compile TypeScript ---
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY server.ts ./
COPY src ./src
RUN npm run build

# --- production runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache postgresql-client \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nodejs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY node-pg-migrate.json ./
COPY migrations ./migrations
COPY seed.sql ./
COPY scripts/entrypoint.sh ./scripts/entrypoint.sh

RUN chmod +x scripts/entrypoint.sh \
  && chown -R nodejs:nodejs /app

USER nodejs
EXPOSE 4000
ENTRYPOINT ["./scripts/entrypoint.sh"]
