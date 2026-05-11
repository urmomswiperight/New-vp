import path from 'path';
import fs from 'fs';
import os from 'os';
import prisma from '@/lib/prisma';
import { connectToBrowserless, injectLinkedInAuth } from '@/lib/browser';

export interface FollowUpResult {
    success: boolean;
    sentLeads: string[];
    error?: string;
}

/**
 * Multi-stage LinkedIn follow-up logic.
 * Stages:
 * 0: Initial request sent.
 * 1: Day 3 nudge.
 * 2: Day 7 value-add.
 * 3: Day 14 break-up.
 */
export async function runLinkedInFollowUp(
    stages: Record<number, { message: string, delay: number }> = {
        1: { message: "Hi [Name], just checking if you saw my last message. Would love to hear your thoughts!", delay: 3 },
        2: { message: "Hi [Name], I thought you might find this case study interesting regarding our AI automation work: [Link]. Let me know if it sparks any ideas!", delay: 7 },
        3: { message: "Hi [Name], I haven't heard back, so I'll assume now isn't the best time. I'll check back in a few months. All the best!", delay: 14 }
    },
    externalBrowser?: any
): Promise<FollowUpResult> {
    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

    const sentLeads: string[] = [];
    
    let browser = externalBrowser;
    let ownBrowser = false;

    if (!browser) {
        console.log('Follow-Up: No external browser provided. Connecting to Browserless...');
        try {
            browser = await connectToBrowserless();
            ownBrowser = true;
        } catch (e: unknown) {
            return { success: false, sentLeads: [], error: `CONNECTION_FAILED: ${(e as Error).message}` };
        }
    } else {
        console.log('Follow-Up: Using provided stealth browser.');
    }

    try {
        for (const [stepStr, config] of Object.entries(stages)) {
            const step = parseInt(stepStr);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - config.delay);

            const eligibleLeads = await prisma.lead.findMany({
                where: {
                    status: { in: ['Contacted (LinkedIn)', 'Followed Up'] },
                    followUpStep: step - 1, // Current step is one less than target
                    updatedAt: { lte: cutoffDate },
                    sentiment: null // ONLY follow up if they haven't replied (sentiment is empty)
                },
                take: 20
            });

            if (eligibleLeads.length === 0) continue;

            console.log(`Follow-Up Step ${step}: Found ${eligibleLeads.length} leads.`);

            for (const lead of eligibleLeads) {
                if (!lead.linkedinUrl) continue;

                const context = await browser.newContext();
                await injectLinkedInAuth(context);
                const page = await context.newPage();

                try {
                    const cleanUrl = lead.linkedinUrl.split('?')[0].replace(/\/$/, '');
                    await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    await page.waitForTimeout(4000);

                    // Click "Message" button
                    const messageBtn = await page.getByRole('button', { name: /Message/i }).first();
                    if (await messageBtn.isVisible()) {
                        await messageBtn.click();
                        await page.waitForTimeout(2000);

                        const personalizedMessage = config.message.replace(/\[Name\]/g, lead.firstName || 'there');
                        
                        // Try to find the editor
                        const editor = await page.getByRole('textbox', { name: /Type a message/i }).first();
                        if (await editor.isVisible()) {
                            await editor.fill(personalizedMessage);
                        } else {
                            const fallbackEditor = await page.waitForSelector('.msg-form__contenteditable', { timeout: 5000 }).catch(() => null);
                            if (fallbackEditor) await (fallbackEditor as any).fill(personalizedMessage);
                        }
                        
                        await page.waitForTimeout(1000);
                        const sendBtn = await page.getByRole('button', { name: /Send/i }).first();
                        await sendBtn.click();
                        await page.waitForTimeout(2000);

                        // Update Database
                        await prisma.lead.update({
                            where: { id: lead.id },
                            data: { 
                                status: 'Followed Up',
                                followUpStep: step
                            }
                        });
                        sentLeads.push(lead.email);
                        console.log(`Follow-Up Step ${step}: Sent to ${lead.firstName}`);
                    }
                } catch (err: unknown) {
                    console.error(`Follow-Up Failed for ${lead.firstName}:`, (err as Error).message);
                } finally {
                    await context.close().catch(() => {});
                }
            }
        }

        return { ["success"]: true, ["sentLeads"]: sentLeads };

    } catch (e: unknown) {
        console.error('Follow-Up Fatal Error:', e);
        return { 
            ["success"]: false, 
            ["sentLeads"]: [], 
            ["error"]: (e as Error).message || String(e) 
        };
    } finally {
        if (ownBrowser && browser) await browser.close().catch(() => {});
    }
}
