# syntax=docker/dockerfile:1

# ============================================
# Base stage
# ============================================
FROM node:24-slim AS base
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ============================================
# Build stage
# ============================================
FROM base AS builder
WORKDIR /app

# Set DATABASE_URL for Prisma generate
ENV DATABASE_URL="file:/app/data/database.db"

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory for build-time database access
RUN mkdir -p /app/data

# Generate Prisma Client
RUN npx prisma generate

# Run migrations to create tables for build
RUN npx prisma migrate deploy

# Build Next.js
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --omit=dev

# Generate Prisma Client for production
RUN npx prisma generate

# Copy public assets
COPY --from=builder /app/public ./public

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Set up standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Overwrite Prisma client in standalone with the one we generated
# (standalone bundles its own node_modules, so we need to update it)
RUN cp -r /app/node_modules/.prisma ./node_modules/.prisma || true
RUN cp -r /app/node_modules/@prisma ./node_modules/@prisma || true

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/database.db"

# Start the application
CMD ["./docker-entrypoint.sh"]
