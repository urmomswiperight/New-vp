import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { connectToBrowserless, injectLinkedInAuth, checkSessionHealth } from "../src/lib/browser";
import { injectFullStorageState, checkLoginHealth } from "../src/lib/linkedin/session";
import { sendConnectionRequest } from "../src/lib/linkedin/actions";
import { SELECTORS } from "../src/lib/linkedin/selectors";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

/**
 * LinkedIn MCP Server Implementation
 * Exposes internal LinkedIn automation logic as standardized MCP tools.
 */
const server = new McpServer({
  name: "linkedin-automation",
  version: "1.0.0",
});

/**
 * Tool: LinkedIn Outreach
 */
server.tool(
  "linkedin_outreach",
  "Sends a LinkedIn connection request with a personalized message to a specific profile URL.",
  {
    profileUrl: z.string().url().describe("The LinkedIn profile URL (e.g., https://www.linkedin.com/in/name)"),
    message: z.string().describe("The personalized message to send with the connection request"),
    dailyLimit: z.number().optional().default(25).describe("Maximum number of connection requests to send per day (safety limit)"),
  },
  async ({ profileUrl, message, dailyLimit }) => {
    let browser;
    let context;
    try {
        const baseDir = os.tmpdir();
        const userDataDir = path.join(baseDir, '.playwright-sessions');
        if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

        const today = new Date().toISOString().split('T')[0];
        const limitFile = path.join(userDataDir, 'daily_count.json');
        let dailyData = { date: today, count: 0 };
        if (fs.existsSync(limitFile)) {
            try {
                const savedData = JSON.parse(fs.readFileSync(limitFile, 'utf8'));
                if (savedData.date === today) dailyData = savedData;
            } catch (e) {}
        }

        if (dailyData.count >= dailyLimit) {
            return {
                content: [{ type: "text", text: "Error: DAILY_LIMIT_REACHED" }],
                isError: true
            };
        }

        browser = await connectToBrowserless();
        context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

        const sessionJson = process.env.LI_SESSION;
        if (sessionJson) await injectFullStorageState(context, sessionJson);

        const page = await context.newPage();
        const health = await checkLoginHealth(page);
        if (health !== 'LOGGED_IN') {
            return {
                content: [{ type: "text", text: `Error: SESSION_UNHEALTHY: ${health}` }],
                isError: true
            };
        }

        let cleanUrl = profileUrl.split('?')[0].replace(/\/$/, '');
        await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000 + Math.random() * 2000);

        const nameHeader = page.getByRole(SELECTORS.profile.name.role, { level: SELECTORS.profile.name.level });
        if (!(await nameHeader.isVisible())) {
            return {
                content: [{ type: "text", text: "Error: PROFILE_NOT_LOADED" }],
                isError: true
            };
        }

        const result = await sendConnectionRequest(page, message);

        if (result.success) {
            dailyData.count++;
            fs.writeFileSync(limitFile, JSON.stringify(dailyData));
            return {
                content: [{ type: "text", text: `Success: Connection request sent. Total today: ${dailyData.count}` }]
            };
        } else {
            return {
                content: [{ type: "text", text: `Error: ${result.error}` }],
                isError: true
            };
        }

    } catch (err: any) {
        return {
            content: [{ type: "text", text: `Fatal Error: ${err.message}` }],
            isError: true
        };
    } finally {
        if (context) await context.close();
        if (browser) await browser.close();
    }
  }
);

/**
 * Tool: LinkedIn Health Check
 */
server.tool(
    "linkedin_health_check",
    "Verifies if the current LinkedIn session is active and logged in.",
    {},
    async () => {
        let browser;
        try {
            browser = await connectToBrowserless();
            const context = await browser.newContext();
            const sessionJson = process.env.LI_SESSION;
            if (sessionJson) await injectFullStorageState(context, sessionJson);
            const page = await context.newPage();
            const health = await checkLoginHealth(page);
            return {
                content: [{ type: "text", text: `LinkedIn Session Status: ${health}` }]
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Health Check Failed: ${err.message}` }],
                isError: true
            };
        } finally {
            if (browser) await browser.close();
        }
    }
);

/**
 * Start Server (Stdio)
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LinkedIn MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
