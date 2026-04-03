import path from 'path';
import fs from 'fs';
import os from 'os';
import prisma from '@/lib/prisma';

export interface FollowUpResult {
    success: boolean;
    sentLeads: string[];
    error?: string;
}

export async function runLinkedInFollowUp(
    message: string,
    daysDelay: number = 3
): Promise<FollowUpResult> {
    // 1. Setup imports (Vercel compatibility)
    const { chromium: baseChromium } = await import('playwright-core');
    const { addExtra } = await import('playwright-extra');
    const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth');
    
    const chromium = addExtra(baseChromium);
    try { chromium.use(StealthPlugin()); } catch (e) {}

    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

    const auth = process.env.BROWSERLESS_WSS;
    if (!auth) throw new Error('BROWSERLESS_WSS is not defined.');

    // 2. Fetch Leads eligible for follow-up
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysDelay);

    const eligibleLeads = await prisma.lead.findMany({
        where: {
            status: 'Contacted (LinkedIn)',
            updatedAt: { lte: cutoffDate }
        },
        take: 5 // Limit per run to stay safe
    });

    if (eligibleLeads.length === 0) {
        return { success: true, sentLeads: [] };
    }

    console.log(`Follow-Up: Found ${eligibleLeads.length} leads to nudge.`);
    
    console.log('Follow-Up: Connecting to Browserless.io...');
    let browser;
    let retries = 3;
    while (retries > 0) {
        try {
            browser = await chromium.connectOverCDP(auth);
            break;
        } catch (e: any) {
            retries--;
            if (retries === 0) throw e;
            console.warn(`Follow-Up: Connection failed, retrying in 5s... (${retries} left). Error: ${e.message}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    if (!browser) throw new Error('Failed to connect to Browserless after retries.');
    
    const sentLeads: string[] = [];

    try {
        for (const lead of eligibleLeads) {
            if (!lead.linkedinUrl) continue;

            const context = await browser.newContext();
            const page = await context.newPage();

            try {
                console.log(`Follow-Up: Navigating to ${lead.firstName} (${lead.linkedinUrl})`);
                await page.goto(lead.linkedinUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
                await page.waitForTimeout(4000);

                // Click "Message" button
                const messageBtn = await page.$('button:has-text("Message")');
                if (messageBtn) {
                    await messageBtn.click();
                    await page.waitForTimeout(2000);

                    // Type follow-up message
                    // Note: LinkedIn messaging UI can vary, this targets the standard pop-up
                    const editor = await page.waitForSelector('.msg-form__contenteditable[role="textbox"]', { timeout: 10000 });
                    if (editor) {
                        const personalizedMessage = message.replace(/\[Name\]/g, lead.firstName || 'there');
                        await editor.fill(personalizedMessage);
                        await page.waitForTimeout(1000);
                        
                        const sendBtn = await page.waitForSelector('.msg-form__send-button');
                        await sendBtn.click();
                        await page.waitForTimeout(2000);

                        // Update Database
                        await prisma.lead.update({
                            where: { id: lead.id },
                            data: { status: 'Followed Up' }
                        });
                        sentLeads.push(lead.email);
                        console.log(`Follow-Up: Sent to ${lead.firstName}`);
                    }
                }
            } catch (err) {
                console.error(`Follow-Up: Failed for ${lead.firstName}:`, err);
            } finally {
                await context.close();
            }
        }

        return { success: true, sentLeads };

    } catch (error: any) {
        console.error('Follow-Up Fatal Error:', error);
        return { success: false, sentLeads: [], error: error.message };
    } finally {
        await browser.close();
    }
}
