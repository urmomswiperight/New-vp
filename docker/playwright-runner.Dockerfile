# Use official Microsoft Playwright image
FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Expose CDP port
EXPOSE 3000

# Copy health check wrapper
COPY health-check.js .

# Start the health check wrapper that manages Playwright
CMD ["node", "health-check.js"]
