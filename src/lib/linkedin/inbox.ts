import path from 'path';
import fs from 'fs';
import os from 'os';
import prisma from '@/lib/prisma';
import { connectToBrowserless, injectLinkedInAuth, checkSessionHealth } from '@/lib/browser';

export interface InboxCheckResult {
    success: boolean;
    repliedLeads: string[];
    error?: string;
}

export async function checkLinkedInInbox(): Promise<InboxCheckResult> {
    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

    console.log('Inbox Check: Connecting...');
    let browser;
    try {
        browser = await connectToBrowserless();
    } catch (e: any) {
        return { success: false, repliedLeads: [], error: `CONNECTION_FAILED: ${e.message}` };
    }
    
    const context = await browser.newContext();
    
    // Inject auth state
    await injectLinkedInAuth(context);

    const page = await context.newPage();
    const repliedLeads: string[] = [];

    try {
        // 2. Navigate to LinkedIn Messaging
        console.log('Inbox Check: Navigating to Messaging...');
        await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        // Check for AuthWall
        if (await page.$('.authwall-container')) {
            throw new Error('AUTHWALL: Session invalid or blocked.');
        }

        // 3. Scan for "Unread" or "New" messages
        const unreadConversations = await page.$$('.msg-conversation-card--unread');
        console.log(`Inbox Check: Found ${unreadConversations.length} unread conversations.`);

        for (const conv of unreadConversations) {
            try {
                const nameElement = await conv.$('.msg-conversation-card__participant-names');
                const name = await nameElement?.innerText();

                if (name) {
                    console.log(`Inbox Check: Processing unread message from ${name}`);
                    const [firstName, ...lastNameParts] = name.split(' ');
                    const lastName = lastNameParts.join(' ');

                    const lead = await prisma.lead.findFirst({
                        where: {
                            firstName: { contains: firstName, mode: 'insensitive' },
                            lastName: { contains: lastName, mode: 'insensitive' },
                            status: { in: ['Contacted', 'Contacted (LinkedIn)'] }
                        }
                    });

                    if (lead) {
                        await prisma.lead.update({
                            where: { id: lead.id },
                            data: { status: 'Replied' }
                        });
                        repliedLeads.push(lead.email);
                        console.log(`Inbox Check: Updated ${name} to 'Replied'.`);
                    }
                }
            } catch (err) {
                console.error('Error processing conversation card:', err);
            }
        }

        return { success: true, repliedLeads };

    } catch (error: any) {
        console.error('Inbox Check Fatal Error:', error);
        return { success: false, repliedLeads: [], error: error.message };
    } finally {
        await context.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
    }
}
