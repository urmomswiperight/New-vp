# Use official Microsoft Playwright image
FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Expose CDP port
EXPOSE 3000

# Start Playwright in server mode using the PORT environment variable
CMD ["sh", "-c", "npx playwright run-server --port $PORT --host 0.0.0.0"]
