# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencies
FROM base AS deps
WORKDIR /app
# libc6-compat is often needed for some Node libraries on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- CONFIGURATION ---
# Set default API URL here. Next.js "bakes" this into the JS at build time.
# If your backend changes URL, you must rebuild the image.
ARG NEXT_PUBLIC_API_URL=https://ab-server-115286204440.us-central1.run.app
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# ---------------------

ENV NEXT_TELEMETRY_DISABLED=1

# Build the app
RUN npm run build

# 4. Runner (Production Image)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Copy the build output (.next folder)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy node_modules (Required for standard mode)
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json (Required for npm start)
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]