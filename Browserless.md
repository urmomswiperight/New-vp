# Browsers as a Service

Browsers as a Service (BaaS) lets you connect Puppeteer or Playwright to managed browsers over WebSocket. Run your existing automation code by changing the connection URL to point at Browserless. No infrastructure management required.

If you want a declarative GraphQL workflow, browser-side reconnection, or an IDE-driven session model, use [BrowserQL](https://docs.browserless.io/browserql/start) instead. If you only need one-off HTTP tasks like screenshots, PDFs, or scraping, use [REST APIs](https://docs.browserless.io/rest-apis/intro).

## How It Works​

BaaS exposes a WebSocket endpoint. You pass your API token and any launch parameters in the URL, then use the standard Puppeteer `connect()` or Playwright `connectOverCDP()` methods. Browserless starts a managed browser and hands control to your script.

```
import puppeteer from "puppeteer-core";const browser = await puppeteer.connect({  browserWSEndpoint: "wss://production-sfo.browserless.io?token=YOUR_API_TOKEN_HERE",});const page = await browser.newPage();await page.goto("https://example.com");console.log(await page.title());await browser.close();
```

Browserless is available in multiple regions. Replace `production-sfo` in the examples above with your preferred regional endpoint. See [Regional Endpoints](https://docs.browserless.io/baas/connection-url-patterns#regional-endpoints) for available regions.

See the [Quick Start guide](https://docs.browserless.io/baas/quick-start) for full setup instructions, including how to get your API token.

## When to Use BaaS v2​

BaaS is the right choice when you already have Puppeteer or Playwright code and want to run it in the cloud without rewriting it. It gives you full programmatic control over the browser, which is useful for complex workflows with branching logic, dynamic interactions, or tightly coupled multi-step sequences.

Running browsers at scale introduces real operational overhead: Chrome instances leak memory over time, concurrent sessions compete for CPU and RAM, and self-hosted infrastructure requires ongoing security patching and capacity planning. BaaS offloads all of that. Browserless manages the browser pool, handles resource isolation between sessions, and keeps the runtime up to date. Your automation scales without the infrastructure burden.

## Key Features​

- Persistent sessions: Reconnect to the same browser across requests and maintain state between operations.
- Stealth mode: Enable bot detection evasion by passing stealth launch parameters in the connection URL.
- LiveURL: Hand off a browser session to a human for interaction, then resume automation.
- Regional load balancing: Distribute sessions across multiple geographic regions.
- Launch options: Control timeouts, concurrency limits, and queuing behavior.

## Browser Endpoints​

Six browsers are available. Connect by changing the path in your WebSocket URL:

| Path | Browser | Notes |
| --- | --- | --- |
| /chromium | Chromium | Open-source build. Recommended for most automation tasks. |
| /chrome | Chrome | Google Chrome binary. Use when a site requires Chrome-specific features or codecs. |
| /stealth | Stealth | Privacy-hardened browser with fingerprint randomization and ad blocking. |
| /firefox/playwright | Firefox | Playwright native protocol only. |
| /webkit/playwright | WebKit | Playwright native protocol only. |
| /edge/playwright | Edge | Playwright native protocol only. |

For protocol variants, stealth combinations, and a full feature matrix, see [Connection URL Patterns](https://docs.browserless.io/baas/connection-url-patterns) and [Supported Browsers](https://docs.browserless.io/baas/infrastructure/supported-browsers).

## Authentication​

BaaS connections require an API token included in the WebSocket URL. See the [Quick Start guide](https://docs.browserless.io/baas/quick-start) for connection examples.

## Session Limits​

BaaS session durations depend on your subscription plan:

| Plan | Maximum Session Duration |
| --- | --- |
| Free | 1 minute |
| Prototyping (20k) | 15 minutes |
| Starter (180k) | 30 minutes |
| Scale (500k) and above | 60 minutes |
| Enterprise (self-hosted) | Custom |

## Next Steps​

Ready to dive deeper into BaaS? Explore these key areas to maximize your browser automation capabilities:

[Creating a SessionLearn how to establish browser sessions with Puppeteer or Playwright for your automation needs.](https://docs.browserless.io/baas/session-management/standard-sessions)
[Avoiding bot detectionLearn techniques and strategies to bypass sophisticated bot detection systems and CAPTCHAs.](https://docs.browserless.io/baas/bot-detection/unblocking)
[Using Hybrid AutomationCombine automated scripts with human intervention for complex workflows and debugging scenarios.](https://docs.browserless.io/baas/interactive-browser-sessions/hybrid-automation)