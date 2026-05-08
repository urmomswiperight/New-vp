import { chromium } from 'playwright';
import { injectFullStorageState, checkLoginHealth, performLogin, loadSessionFromDb, saveSessionToDb } from '../src/lib/linkedin/session';
import { sendConnectionRequest, sendMessage } from '../src/lib/linkedin/actions';
import { runLinkedInFollowUp } from '../src/lib/linkedin/follow-up';
import { checkLinkedInInbox } from '../src/lib/linkedin/inbox';
import prisma from '../src/lib/prisma';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
    const mode = process.env.MODE || 'OUTREACH';
    console.log(`🚀 Starting LinkedIn Worker in mode: ${mode}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        locale: 'en-US'
    });

    try {
        // 1. Load Session
        const sessionJson = await loadSessionFromDb();
        if (sessionJson) {
            await injectFullStorageState(context, sessionJson);
        }

        const page = await context.newPage();

        // 2. Health Check
        console.log('🔍 Checking login status...');
        let loginStatus = await checkLoginHealth(page);

        if (loginStatus === 'LOGGED_OUT') {
            console.warn('⚠️ Session invalid. Attempting automated login...');
            const loggedIn = await performLogin(page);
            if (!loggedIn) {
                console.error('❌ Login failed. Stopping.');
                process.exit(1);
            }
        } else if (loginStatus === 'CHALLENGED') {
            console.error('❌ Account challenged (CAPTCHA/2FA). Stopping.');
            process.exit(1);
        }

        // 3. Mode Selection
        switch (mode) {
            case 'OUTREACH':
                await handleOutreach(page, context);
                break;
            case 'FOLLOW_UP':
                await handleFollowUp(); // This uses its own browser management currently, but I'll refactor it later if needed
                break;
            case 'CHECK_INBOX':
                await handleInboxCheck();
                break;
            case 'REPLY':
                await handleReply(page, context);
                break;
            default:
                console.error(`❌ Unknown mode: ${mode}`);
        }

        // 4. Save state if successful
        await saveSessionToDb(context);

    } catch (error: any) {
        console.error('❌ Fatal Script Error:', error.message);
        process.exit(1);
    } finally {
        await context.close().catch(() => {});
        await browser.close().catch(() => {});
        console.log('👋 Worker finished.');
    }
}

async function handleOutreach(page: any, context: any) {
    const profileUrl = process.env.PROFILE_URL;
    const message = process.env.MESSAGE;
    const leadId = process.env.LEAD_ID;

    if (!profileUrl || !message) throw new Error('Missing PROFILE_URL or MESSAGE');

    console.log(`Navigating to profile: ${profileUrl}`);
    await page.goto(profileUrl.split('?')[0].replace(/\/$/, ''), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const result = await sendConnectionRequest(page, message);
    if (result.success) {
        console.log('✅ Outreach successful!');
        if (leadId) {
            await prisma.lead.update({
                where: { id: leadId },
                data: { status: 'Sent', lastMessage: message, updatedAt: new Date() }
            });
        }
    } else {
        throw new Error(`Outreach failed: ${result.error}`);
    }
}

async function handleFollowUp() {
    console.log('Running automated follow-ups...');
    const result = await runLinkedInFollowUp();
    if (result.success) {
        console.log(`✅ Follow-ups complete. Sent to ${result.sentLeads.length} leads.`);
    } else {
        throw new Error(`Follow-up failed: ${result.error}`);
    }
}

async function handleInboxCheck() {
    console.log('Scanning inbox for replies...');
    const result = await checkLinkedInInbox();
    if (result.success) {
        console.log(`✅ Inbox scan complete. Found ${result.repliedLeads.length} new replies.`);
    } else {
        throw new Error(`Inbox check failed: ${result.error}`);
    }
}

async function handleReply(page: any, context: any) {
    const threadUrl = process.env.THREAD_URL;
    const message = process.env.MESSAGE;

    if (!threadUrl || !message) throw new Error('Missing THREAD_URL or MESSAGE');

    console.log(`Navigating to thread: ${threadUrl}`);
    await page.goto(threadUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const editor = await page.waitForSelector('.msg-form__contenteditable', { timeout: 10000 });
    if (editor) {
        await editor.click();
        await page.keyboard.type(message, { delay: 50 });
        const sendBtn = await page.waitForSelector('.msg-form__send-button', { timeout: 5000 });
        await sendBtn.click();
        console.log('✅ Reply sent successfully.');
    } else {
        throw new Error('MESSAGE_EDITOR_NOT_FOUND');
    }
}

run();
