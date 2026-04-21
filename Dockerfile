FROM n8nio/n8n:latest

USER root

# Install dependencies for Playwright and development
# Since we are not sure of the base OS (it might be a hardened minimal image),
# we will try to detect and install accordingly, or just stick to npm if possible.

# Basic check and install
RUN (apt-get update && apt-get install -y curl git python3 make g++ libnss3 libgbm1 libasound2) || \
    (apk add --no-cache curl git python3 make g++ nss chromium freetype harfbuzz) || \
    echo "Could not find apt or apk, skipping system package install"

# Install global tools
RUN npm install -g ts-node typescript playwright

# Set up working directory for scripts access
WORKDIR /home/node/app

# Playwright settings
ENV PLAYWRIGHT_BROWSERS_PATH=/home/node/pw-browsers
# Only download if not using system chromium
RUN if [ -f /usr/bin/chromium-browser ]; then \
      echo "Using system chromium"; \
    else \
      npx playwright install chromium; \
    fi

USER node
EXPOSE 5678
