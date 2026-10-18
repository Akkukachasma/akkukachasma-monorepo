# Build stage — Debian for Puppeteer Chrome for Testing compatibility
FROM oven/bun:1-debian AS builder

WORKDIR /var/www/api

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/var/www/api/.cache/puppeteer

COPY package*.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate
RUN bun run build

# Chrome for Testing (needs unzip to extract)
RUN apt-get update \
  && apt-get install -y --no-install-recommends unzip ca-certificates \
  && bunx puppeteer browsers install chrome \
  && rm -rf /var/lib/apt/lists/*

# Production stage
FROM oven/bun:1-debian AS production

WORKDIR /var/www/api

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/var/www/api/.cache/puppeteer
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium
ENV XDG_DATA_HOME=/tmp/.chromium

# OS libs Chrome needs + curl for healthchecks
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /tmp/.chromium \
  && chmod 777 /tmp/.chromium

COPY package*.json bun.lock ./

RUN bun install --frozen-lockfile --prod

COPY --from=builder /var/www/api/prisma ./prisma
COPY --from=builder /var/www/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /var/www/api/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /var/www/api/dist ./dist
COPY --from=builder /var/www/api/src/mail/templates ./dist/src/mail/templates
COPY --from=builder /var/www/api/src/mail/templates ./mail/templates
COPY --from=builder /var/www/api/pincodes.json ./pincodes.json
COPY --from=builder /var/www/api/.cache/puppeteer ./.cache/puppeteer

EXPOSE 8000

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["bun run prisma/seeds && exec bun dist/src/main"]
