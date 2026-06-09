FROM node:22-slim AS base

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_DIR=/data

RUN mkdir -p /data

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/src/styles ./src/styles
COPY --from=base /app/DESIGN.md ./DESIGN.md

EXPOSE 3000

CMD ["node", "server.js"]
