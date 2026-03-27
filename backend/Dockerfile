FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

RUN npm run db:generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npm run db:generate

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
