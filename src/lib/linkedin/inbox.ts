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
 * Uses AI to classify the sentiment of a LinkedIn message.
 * Prioritizes Local Ollama (via ngrok) -> OpenAI -> Heuristics.
 */
async function classifyMessage(text: string): Promise<{ sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL', reasoning: string }> {
    try {
        console.log('AI: Classifying message...');
        
        const ollamaUrl = process.env.OLLAMA_URL;
        const ollamaModel = process.env.OLLAMA_MODEL || "deepseek-v3.1:671b-cloud";
        const openAiKey = process.env.OPENAI_API_KEY;
        
        // 1. Try Ollama (Local/ngrok)
        if (ollamaUrl) {
            console.log(`AI: Using Ollama (${ollamaModel}) at ${ollamaUrl}`);
            try {
                const response = await axios.post(`${ollamaUrl}/api/chat`, {
                    model: ollamaModel,
                    messages: [
                        { 
                            role: "system", 
                            content: "You are a professional sales assistant. Analyze the LinkedIn reply and classify it as POSITIVE (interested, booked call, asking questions), NEGATIVE (not interested, stop, wrong person), or NEUTRAL (generic thanks, out of office). Output strictly JSON format: {\"sentiment\": \"POSITIVE|NEGATIVE|NEUTRAL\", \"reasoning\": \"...\"}" 
                        },
                        { role: "user", content: text }
                    ],
                    stream: false,
                    format: "json"
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000 // Ollama can be slow
                });

                if (response.data?.message?.content) {
                    return JSON.parse(response.data.message.content);
                }
            } catch (ollamaErr: unknown) {
                console.warn('⚠️ Ollama failed, falling back...', (ollamaErr as Error).message);
            }
        }

        // 2. Try OpenAI Fallback
        if (openAiKey) {
            console.log('AI: Using OpenAI fallback...');
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a sales assistant. Classify the LinkedIn message sentiment: POSITIVE, NEGATIVE, or NEUTRAL. Output strictly JSON: {\"sentiment\": \"POSITIVE|NEGATIVE|NEUTRAL\", \"reasoning\": \"...\"}" 
                    },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            }, {
                headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' }
            });

            return JSON.parse(response.data.choices[0].message.content);
        }

        // 3. Basic heuristic fallback
        const lower = text.toLowerCase();
        if (lower.includes('interested') || lower.includes('call') || lower.includes('zoom') || lower.includes('meeting')) {
            return { sentiment: 'POSITIVE', reasoning: 'Heuristic: Interest keywords found.' };
        }
        if (lower.includes('not interested') || lower.includes('remove') || lower.includes('stop')) {
            return { sentiment: 'NEGATIVE', reasoning: 'Heuristic: Opt-out keywords found.' };
        }
        return { sentiment: 'NEUTRAL', reasoning: 'Heuristic: No clear indicators.' };
    } catch (e) {
        console.error('AI Classification failed:', e);
        return { sentiment: 'NEUTRAL', reasoning: 'Error during classification.' };
    }
}

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
            return { success: false, repliedLeads: [], error: `CONNECTION_FAILED: ${(e as Error).message}` };
        }
    } else {
        console.log('Inbox Check: Using provided stealth page.');
    }
    
    const repliedLeads: { email: string; sentiment: string; message: string }[] = [];

    try {
        console.log('Inbox Check: Navigating to Messaging...');
        await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        if (await page.$('.authwall-container')) {
            throw new Error('AUTHWALL: Session invalid or blocked.');
        }

        const unreadConversations = await page.$$('.msg-conversation-card--unread');
        console.log(`Inbox Check: Found ${unreadConversations.length} unread conversations.`);

        for (const conv of unreadConversations) {
            try {
                const nameElement = await conv.$('.msg-conversation-card__participant-names');
                const name = await nameElement?.innerText();

                if (name) {
                    console.log(`Inbox Check: Processing message from ${name}`);
                    await conv.click();
                    await page.waitForTimeout(2000);

                    // Get the last message text
                    const messages = await page.$$('.msg-s-event-listitem__body');
                    const lastMessageElement = messages[messages.length - 1];
                    const lastMessageText = await lastMessageElement?.innerText() || "";

                    const [firstName, ...lastNameParts] = name.split(' ');
                    const lastName = lastNameParts.join(' ');

                    const lead = await prisma.lead.findFirst({
                        where: {
                            firstName: { contains: firstName, mode: 'insensitive' },
                            lastName: { contains: lastName, mode: 'insensitive' }
                        }
                    });

                        if (lead) {
                        const { sentiment } = await classifyMessage(lastMessageText);
                        
                        const updatedLead = await prisma.lead.update({
                            where: { id: lead.id },
                            data: { 
                                status: sentiment === 'NEGATIVE' ? 'Opted Out' : 'Replied',
                                sentiment: sentiment,
                                lastMessage: lastMessageText
                            }
                        });

                        repliedLeads.push({ email: lead.email, sentiment, message: lastMessageText });
                        console.log(`Inbox Check: Updated ${name} (${sentiment}).`);

                        // --- NEW: Trigger n8n Webhook for Conversational AI ---
                        try {
                            const n8nWebhookUrl = process.env.N8N_INBOUND_WEBHOOK_URL;
                            if (n8nWebhookUrl) {
                                await axios.post(n8nWebhookUrl, {
                                    type: 'LINKEDIN_MESSAGE',
                                    leadId: updatedLead.id,
                                    firstName: updatedLead.firstName,
                                    company: updatedLead.company,
                                    lastMessage: lastMessageText,
                                    sentiment: sentiment,
                                    threadUrl: `https://www.linkedin.com/messaging/` // Playwright will find the thread
                                }, {
                                    headers: { 'Content-Type': 'application/json' }
                                });
                                console.log(`n8n Webhook triggered for ${name}`);
                            }
                        } catch (webhookErr: unknown) {
                            console.error('Failed to trigger n8n webhook:', (webhookErr as Error).message);
                        }
                    }
                }
            } catch (err: unknown) {
                console.error('Error processing conversation card:', (err as Error).message);
            }
        }

        return { success: true, repliedLeads };

    } catch (error: unknown) {
        console.error('Inbox Check Fatal Error:', error);
        return { success: false, repliedLeads: [], error: (error as Error).message };
    } finally {
        if (context) await context.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
    }
}
