import path from 'path';
import fs from 'fs';
import os from 'os';
import prisma from '@/lib/prisma';
import { connectToBrowserless, injectLinkedInAuth, checkSessionHealth } from '@/lib/browser';

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
    
    console.log('Follow-Up: Connecting...');
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
            
            // Inject auth state
            await injectLinkedInAuth(context);

            const page = await context.newPage();

            try {
                const isHealthy = await checkSessionHealth(page);
                if (!isHealthy) {
                    throw new Error('SESSION_INVALID: Please update your LI_SESSION.');
                }

                console.log(`Follow-Up: Navigating to ${lead.firstName} (${lead.linkedinUrl})`);
                await page.goto(lead.linkedinUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
                await page.waitForTimeout(4000);

                // Check for AuthWall
                if (await page.$('.authwall-container')) {
                    throw new Error('AUTHWALL: Session invalid or blocked.');
                }

                // Verify profile loaded
                const nameHeader = await page.getByRole('heading', { level: 1 }).filter({ hasText: /[a-zA-Z]/ }).first();
                if (!await nameHeader.isVisible()) {
                    throw new Error('PROFILE_NOT_LOADED');
                }

                // Click "Message" button
                const messageBtn = await page.getByRole('button', { name: /Message/i }).first();
                if (await messageBtn.isVisible()) {
                    await messageBtn.click();
                    await page.waitForTimeout(2000);

                    // Type follow-up message
                    const editor = await page.getByRole('textbox', { name: /Type a message/i }).first();
                    if (!await editor.isVisible()) {
                        // Fallback to class-based selector for editor
                        const fallbackEditor = await page.waitForSelector('.msg-form__contenteditable', { timeout: 5000 }).catch(() => null);
                        if (fallbackEditor) {
                            const personalizedMessage = message.replace(/\[Name\]/g, lead.firstName || 'there');
                            await fallbackEditor.fill(personalizedMessage);
                        } else {
                            throw new Error('MESSAGE_EDITOR_NOT_FOUND');
                        }
                    } else {
                        const personalizedMessage = message.replace(/\[Name\]/g, lead.firstName || 'there');
                        await editor.fill(personalizedMessage);
                    }
                    
                    await page.waitForTimeout(1000);
                    const sendBtn = await page.getByRole('button', { name: /Send/i }).first();
                    await sendBtn.click();
                    await page.waitForTimeout(2000);

                    // Update Database
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: { status: 'Followed Up' }
                    });
                    sentLeads.push(lead.email);
                    console.log(`Follow-Up: Sent to ${lead.firstName}`);
                } else {
                    throw new Error('MESSAGE_BUTTON_NOT_FOUND');
                }
            } catch (err: any) {
                console.error(`Follow-Up: Failed for ${lead.firstName}:`, err.message);
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
