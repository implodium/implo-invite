# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build Astro application
RUN npm run build


# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Copy the built Astro application
COPY --from=builder /app/dist ./dist

# The Node adapter may require runtime dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4321

# Start Astro's Node server
CMD ["node", "./dist/server/entry.mjs"]
