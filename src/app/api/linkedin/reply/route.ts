import { NextResponse } from 'next/server';
import { connectToBrowserless, injectLinkedInAuth, checkSessionHealth } from '@/lib/browser';

export async function POST(req: Request) {
    const { threadUrl, message } = await req.json().catch(() => ({}));
    const secretHeader = req.headers.get('X-Outreach-Secret');

    if (secretHeader !== process.env.OUTREACH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!threadUrl || !message) {
        return NextResponse.json({ error: 'Missing threadUrl or message' }, { status: 400 });
    }

    let browser;
    try {
        browser = await connectToBrowserless();
        const context = await browser.newContext();
        await injectLinkedInAuth(context);
        const page = await context.newPage();

        const isHealthy = await checkSessionHealth(page);
        if (!isHealthy) {
            console.warn('⚠️ LinkedIn Health: Verification failed for reply, but proceeding anyway...');
        }

        console.log(`LinkedIn Reply: Navigating to thread ${threadUrl}...`);
        await page.goto(threadUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);

        // Type the message into the active conversation
        const editor = await page.waitForSelector('.msg-form__contenteditable', { timeout: 10000 });
        if (editor) {
            await editor.click();
            await page.keyboard.type(message, { delay: 50 });
            await page.waitForTimeout(1000);
            
            const sendBtn = await page.waitForSelector('.msg-form__send-button', { timeout: 5000 });
            await sendBtn.click();
            console.log('✅ LinkedIn Reply: Message sent successfully.');
            
            await context.close();
            await browser.close();
            return NextResponse.json({ success: true, status: 'Sent' });
        }

        throw new Error('MESSAGE_EDITOR_NOT_FOUND');
    } catch (error: any) {
        console.error('LinkedIn Reply Error:', error.message);
        if (browser) await browser.close();
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
