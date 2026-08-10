FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./

RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create non-root user
RUN useradd -m -u 1001 appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 5000

CMD ["node", "server.js"]