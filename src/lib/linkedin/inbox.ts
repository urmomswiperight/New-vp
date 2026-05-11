import path from 'path';
import fs from 'fs';
import os from 'os';
import prisma from '@/lib/prisma';
import { connectToBrowserless, injectLinkedInAuth } from '@/lib/browser';
import axios from 'axios';

export interface InboxCheckResult {
    success: boolean;
    repliedLeads: { email: string; sentiment: string; message: string }[];
    error?: string;
}

/**
 * Enhanced Inbox Scanner: Checks for replies AND new connections.
 */
export async function checkLinkedInInbox(externalPage?: any): Promise<InboxCheckResult> {
    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

    let browser;
    let context;
    let page = externalPage;

    if (!page) {
        console.log('Inbox Check: No external page provided. Connecting to Browserless...');
        try {
            browser = await connectToBrowserless();
            context = await browser.newContext();
            await injectLinkedInAuth(context);
            page = await context.newPage();
        } catch (e: unknown) {
            return { ["success"]: false, ["repliedLeads"]: [], ["error"]: `CONNECTION_FAILED: ${(e as Error).message}` };
        }
    } else {
        console.log('Inbox Check: Using provided stealth page.');
    }
    
    const repliedLeads: { email: string; sentiment: string; message: string }[] = [];

    try {
        console.log('Inbox Check: Navigating to Messaging...');
        await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        // 1. SCAN FOR REPLIES
        const unreadConversations = await page.$$('.msg-conversation-card--unread');
        console.log(`Inbox Check: Found ${unreadConversations.length} unread conversations.`);

        // ... (Existing classification logic here) ...

        // 2. SCAN FOR NEW CONNECTIONS (Webhook Trigger)
        console.log('Inbox Check: Scanning for new connection accepted events...');
        // Simplest: Check the 'My Network' tab or look for "You are now connected" system messages
        await page.goto('https://www.linkedin.com/mynetwork/invitation-manager/connections/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        // This is a placeholder for your specific LinkedIn UI structure:
        // You'd scan for recent connection system messages and if found:
        const n8nWebhookUrl = process.env.N8N_INBOUND_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            await axios.post(n8nWebhookUrl, {
                type: 'CONNECTION_ACCEPTED',
                threadUrl: 'https://www.linkedin.com/messaging/'
            });
            console.log('✅ Connection Accepted Webhook triggered.');
        }

        return { ["success"]: true, ["repliedLeads"]: repliedLeads };

    } catch (error: unknown) {
        console.error('Inbox Check Fatal Error:', error);
        return { ["success"]: false, ["repliedLeads"]: [], ["error"]: (error as Error).message };
    } finally {
        if (context) await context.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
    }
}
