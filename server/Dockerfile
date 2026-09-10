# Bun runtime (debian-based: has OpenSSL for Prisma)
FROM oven/bun:1

WORKDIR /app

# Install deps first for layer caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# App source
COPY . .

# Generate Prisma client (native engine matches this image)
RUN bunx prisma generate

ENV NODE_ENV=production
EXPOSE 3001

# DATABASE_URL is only available at runtime on Render, so push schema then boot.
# db push is idempotent; safe to run on every start for this demo.
CMD ["sh", "-c", "bunx prisma db push --skip-generate && bun src/index.ts"]
