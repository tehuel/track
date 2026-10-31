FROM oven/bun:alpine
WORKDIR /app

# Install production dependencies
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy application source and assets
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./

# Default environment configuration
ENV PORT=3000
ENV DB_PATH=/data/tracker.db
VOLUME ["/data"]

EXPOSE 3000
CMD ["bun", "src/index.ts"]
