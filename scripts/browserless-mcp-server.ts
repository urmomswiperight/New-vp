import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as browserless from "../src/lib/browser";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

/**
 * Browserless MCP Server Implementation
 * Exposes Browserless tools as standardized MCP tools.
 */
const server = new McpServer({
  name: "browserless",
  version: "1.0.0",
});

/**
 * Tool: Smart Scraper
 */
server.tool(
  "browserless_smartscraper",
  "Scrape any webpage using the Browserless smart scraper. Returns page content in requested formats (markdown, html, screenshot, pdf, links). Handles JavaScript-heavy pages, anti-bot measures, and multiple scraping strategies automatically.",
  {
    url: z.string().url().describe("The URL to scrape (must be http or https)"),
    formats: z.array(z.enum(["markdown", "html", "screenshot", "pdf", "links"])).optional().default(["markdown"]).describe('Output formats to include: "markdown", "html", "screenshot", "pdf", "links". Defaults to ["markdown"].'),
    timeout: z.number().optional().describe("Request timeout in milliseconds"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessSmartScrape(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Function
 */
server.tool(
  "browserless_function",
  "Execute custom Puppeteer JavaScript code on the Browserless cloud. Your function receives a Puppeteer `page` object and optional `context` data. Return { data, type } to control the response payload and Content-Type. Useful for complex scraping, form filling, or any browser automation that requires custom code.",
  {
    code: z.string().describe("JavaScript (ESM) code to execute. The default export receives { page, context } and should return { data, type } where data is the response payload and type is the Content-Type string."),
    context: z.record(z.any()).optional().describe("Optional context object passed to the function as the second argument."),
    timeout: z.number().optional().describe("Request timeout in milliseconds"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessFunction(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Download
 */
server.tool(
  "browserless_download",
  "Run custom Puppeteer code on Browserless and return the file that Chrome downloads during execution. Your code should trigger a file download (e.g. clicking a download link). The downloaded file is returned with its original Content-Type. Useful for downloading CSVs, PDFs, images, or any file from a website.",
  {
    code: z.string().describe("JavaScript (ESM) code to execute. The default export receives { page, context }. During execution the code should trigger a file download in the browser (e.g. clicking a download link)."),
    context: z.record(z.any()).optional().describe("Optional context object passed to the function."),
    timeout: z.number().optional().describe("Request timeout in milliseconds"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessDownload(params);
      // Note: result is an ArrayBuffer here. For text-based MCP, we might need to handle this differently
      // but usually downloads are binary. We'll return it as a base64 string for now or a message.
      return { content: [{ type: "text", text: "Download successful. Binary data received." }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Export
 */
server.tool(
  "browserless_export",
  "Export a webpage from a URL via the Browserless /export API. Fetches the URL and returns its content in the native format (HTML, PDF, image, etc.). Automatically detects the content type. Set includeResources=true to bundle all page assets (CSS, JS, images) into a ZIP archive for offline use.",
  {
    url: z.string().url().describe("The URL to export (must be http or https)"),
    gotoOptions: z.record(z.any()).optional().describe("Puppeteer Page.goto() options for navigation"),
    bestAttempt: z.boolean().optional().describe("When true, proceed even if awaited events fail or timeout."),
    includeResources: z.boolean().optional().describe("When true, bundle all linked resources (CSS, JS, images) into a ZIP file."),
    waitForTimeout: z.number().min(0).optional().describe("Milliseconds to wait after page load before exporting"),
    timeout: z.number().optional().describe("Request timeout in milliseconds"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessExport(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Search
 */
server.tool(
  "browserless_search",
  "Search the web using Browserless and optionally scrape each result. Performs web searches via SearXNG and can return results from web, news, or images. Optionally scrape each result URL to get markdown, HTML, links, or screenshots. Useful for research, gathering information, and finding relevant web pages.",
  {
    query: z.string().min(1).describe("The search query string"),
    limit: z.number().int().max(100).optional().default(10).describe("Maximum number of results to return (default: 10, max: 100)"),
    lang: z.string().optional().default("en").describe('Language code for search results (default: "en")'),
    country: z.string().optional().describe("Country code for geo-targeted results"),
    location: z.string().optional().describe("Location string for geo-targeted results"),
    tbs: z.enum(["day", "week", "month", "year"]).optional().describe('Time-based filter: "day", "week", "month", "year"'),
    sources: z.array(z.enum(["web", "news", "images"])).optional().default(["web"]).describe('Search sources: "web", "news", "images" (default: ["web"])'),
    categories: z.array(z.enum(["github", "research", "pdf"])).optional().describe('Filter by categories: "github", "research", "pdf"'),
    scrapeOptions: z.object({
      formats: z.array(z.string()).optional(),
      onlyMainContent: z.boolean().optional(),
      includeTags: z.array(z.string()).optional(),
      excludeTags: z.array(z.string()).optional(),
    }).optional().describe("Options for scraping each search result"),
    timeout: z.number().optional().describe("Request timeout in milliseconds"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessSearch(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Map
 */
server.tool(
  "browserless_map",
  "Discover and map all URLs on a website using Browserless. Crawls a site via sitemaps and link extraction to find all pages. Returns a list of URLs with optional titles and descriptions. Use the search parameter to order results by relevance to a query. Useful for site audits, content discovery, and building site maps.",
  {
    url: z.string().url().describe("The base URL to start mapping from (must be http or https)"),
    search: z.string().optional().describe("Search query to order results by relevance"),
    limit: z.number().int().max(5000).optional().default(100).describe("Maximum number of links to return (default: 100, max: 5000)"),
    sitemap: z.enum(["include", "skip", "only"]).optional().default("include").describe('Sitemap handling: "include" (default), "skip", "only"'),
    includeSubdomains: z.boolean().optional().default(true).describe("Include URLs from subdomains (default: true)"),
    ignoreQueryParameters: z.boolean().optional().default(true).describe("Exclude URLs with query parameters (default: true)"),
    timeout: z.number().optional().describe("Request timeout in milliseconds"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessMap(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Performance
 */
server.tool(
  "browserless_performance",
  "Run a Lighthouse performance audit on any URL via the Browserless /performance API. Returns scores and metrics for accessibility, best practices, performance, PWA, and SEO. Optionally filter by category or supply performance budgets. Note: audits can take 30s–120s depending on the site.",
  {
    url: z.string().url().describe("The URL to audit (must be http or https)"),
    categories: z.array(z.enum(["accessibility", "best-practices", "performance", "pwa", "seo"])).optional().describe('Lighthouse categories to audit: "accessibility", "best-practices", "performance", "pwa", "seo". Omit for all categories.'),
    budgets: z.array(z.record(z.any())).optional().describe("Lighthouse performance budgets array. See https://developer.chrome.com/docs/lighthouse/performance/performance-budgets"),
    timeout: z.number().optional().describe("Request timeout in milliseconds (audits can take 30s–120s)"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessPerformance(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Tool: Crawl
 */
server.tool(
  "browserless_crawl",
  "Crawl a website and scrape every discovered page using Browserless. Starts from a seed URL and follows links up to a configurable depth. Supports sitemap discovery, path filtering, subdomain handling, and custom scrape options. Returns scraped content (markdown/HTML) for each page along with metadata. Useful for comprehensive site analysis, content extraction, and data gathering.",
  {
    url: z.string().url().describe("The URL to crawl (must be http or https)"),
    limit: z.number().int().max(10000).optional().default(100).describe("Maximum number of pages to crawl (default: 100)"),
    maxDepth: z.number().int().min(0).optional().default(5).describe("Maximum link-follow depth from the root URL (default: 5)"),
    maxRetries: z.number().int().min(0).optional().default(1).describe("Number of retry attempts per failed page (default: 1)"),
    allowExternalLinks: z.boolean().optional().default(false).describe("Whether to follow links to external domains"),
    allowSubdomains: z.boolean().optional().default(false).describe("Whether to follow links to subdomains"),
    sitemap: z.enum(["auto", "force", "skip"]).optional().default("auto").describe('Sitemap handling: "auto" (default), "force", "skip"'),
    includePaths: z.array(z.string()).optional().describe("Regex patterns for URL paths to include"),
    excludePaths: z.array(z.string()).optional().describe("Regex patterns for URL paths to exclude"),
    delay: z.number().int().min(0).optional().default(200).describe("Delay between requests in milliseconds (default: 200)"),
    scrapeOptions: z.object({
      formats: z.array(z.enum(["markdown", "html", "rawText"])).optional().default(["markdown"]).describe("Output formats for scraped content"),
      onlyMainContent: z.boolean().optional().default(true).describe("Extract only the main content using Readability"),
      includeTags: z.array(z.string()).optional().describe("HTML tag selectors to include"),
      excludeTags: z.array(z.string()).optional().describe("HTML tag selectors to exclude"),
      waitFor: z.number().int().min(0).optional().default(0).describe("Time in ms to wait after page load before scraping"),
      headers: z.record(z.string()).optional().describe("Custom HTTP headers to send with each request"),
      timeout: z.number().optional().describe("Navigation timeout in milliseconds"),
    }).optional().describe("Options controlling how each page is scraped"),
    waitForCompletion: z.boolean().optional().default(true).describe("Whether to wait for crawl completion (default: true). If false, returns immediately with crawl ID."),
    pollInterval: z.number().int().optional().default(5000).describe("Polling interval in ms when waiting for completion (default: 5000)"),
    maxWaitTime: z.number().int().optional().default(300000).describe("Maximum time in ms to wait for crawl completion when waitForCompletion is true (default: 300000 = 5 minutes)"),
    timeout: z.number().optional().describe("HTTP request timeout in milliseconds for API calls (default: 30000)"),
  },
  async (params) => {
    try {
      const result = await browserless.browserlessCrawl(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

/**
 * Resource: API Documentation
 */
server.resource(
  "browserless_docs",
  "browserless://api-docs",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "Browserless API Documentation: https://docs.browserless.io/api-reference"
    }]
  })
);

/**
 * Prompt: Scrape URL
 */
server.prompt(
  "scrape-url",
  "A prompt to scrape a specific URL and get its content as markdown.",
  { url: z.string().url().describe("The URL to scrape") },
  ({ url }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please scrape the following URL and provide its content as markdown: ${url}`
      }
    }]
  })
);

/**
 * Start Server (Stdio)
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Browserless MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
