import path from 'path';
import fs from 'fs';
import os from 'os';
import prisma from '@/lib/prisma';
import { connectToBrowserless } from '@/lib/browser';

export interface FollowUpResult {
    success: boolean;
    sentLeads: string[];
    error?: string;
}

export async function runLinkedInFollowUp(
    message: string,
    daysDelay: number = 3
): Promise<FollowUpResult> {
    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

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
    
    console.log('Follow-Up: Attempting connection...');
    let browser;
    try {
        browser = await connectToBrowserless();
    } catch (e: any) {
        return { success: false, sentLeads: [], error: `CONNECTION_FAILED: ${e.message}` };
    }
    
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
                await context.close().catch(() => {});
            }
        }

        return { success: true, sentLeads };

    } catch (error: any) {
        console.error('Follow-Up Fatal Error:', error);
        return { success: false, sentLeads: [], error: error.message };
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}
