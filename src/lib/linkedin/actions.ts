import type { Page } from 'playwright-core';
import { SELECTORS } from './selectors';

/**
 * Sends a connection request to a LinkedIn profile.
 * Handles primary Connect button and the "More" menu fallback.
 */
export async function sendConnectionRequest(page: Page, note?: string): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('🔍 Checking for Connection status (Multi-Strategy Hunter)...');

        // Log what we see
        const buttons = await page.locator('button').allTextContents();
        console.log('📍 Visible Buttons:', buttons.filter(b => b.length < 20).join(', '));

        // 0. Check for Pending or Already Connected
        const pendingBtn = page.getByRole(SELECTORS.profile.pending.role, { name: SELECTORS.profile.pending.name });
        const messageBtn = page.getByRole(SELECTORS.profile.message.role, { name: SELECTORS.profile.message.name });
        
        if (await pendingBtn.isVisible()) {
            console.log('ℹ️ Connection already pending. Marking as successful.');
            return { ["success"]: true };
        }
        if (await messageBtn.isVisible()) {
            console.log('ℹ️ Already connected (Message button visible). Marking as successful.');
            return { ["success"]: true };
        }

        // 1. Try primary Connect button
        let connectBtn = page.getByRole(SELECTORS.profile.connect.role, { 
            name: SELECTORS.profile.connect.name, 
            exact: SELECTORS.profile.connect.exact 
        });
        
        // 2. Check for Follow button (if Connect not primary)
        const followBtn = page.getByRole(SELECTORS.profile.follow.role, { name: SELECTORS.profile.follow.name });
        if (await followBtn.isVisible()) {
            console.log('ℹ️ Found Follow button. Skipping connect request.');
            return { ["success"]: true };
        }

        if (!(await connectBtn.isVisible())) {
            console.log('⚠️ Connect button not primary. Checking "More" menu...');
            const moreBtn = page.getByRole(SELECTORS.profile.more.role, { name: SELECTORS.profile.more.name })
                         .or(page.getByRole(SELECTORS.profile.moreActions.role, { name: SELECTORS.profile.moreActions.name }));
            
            if (await moreBtn.isVisible()) {
                await moreBtn.click();
                await page.waitForTimeout(1000 + Math.random() * 500);
                
                // Redefine connectBtn within the dropdown
                connectBtn = page.getByRole(SELECTORS.profile.connect.role, { 
                    name: SELECTORS.profile.connect.name,
                    exact: SELECTORS.profile.connect.exact
                }).filter({ visible: true });
            }
        }

        if (!(await connectBtn.isVisible())) {
            return { ["success"]: false, ["error"]: 'CONNECT_BUTTON_NOT_FOUND' };
        }

        console.log('👆 Clicking Connect button...');
        await connectBtn.click();
        await page.waitForTimeout(1000 + Math.random() * 500);

        // 3. Handle "Add a note" or "Send without a note"
        if (note) {
            console.log('📝 Adding personalized note...');
            const addNoteBtn = page.getByRole(SELECTORS.profile.addNote.role, { 
                name: SELECTORS.profile.addNote.name 
            });
            
            if (await addNoteBtn.isVisible()) {
                await addNoteBtn.click();
                await page.waitForTimeout(500 + Math.random() * 500);
                
                const textArea = page.getByRole(SELECTORS.profile.customMessage.role, { 
                    name: SELECTORS.profile.customMessage.name 
                });
                
                await typeHumanLike(page, textArea, note);
                await page.waitForTimeout(500 + Math.random() * 500);
                
                const sendBtn = page.getByRole(SELECTORS.profile.send.role, { 
                    name: SELECTORS.profile.send.name,
                    exact: SELECTORS.profile.send.exact
                });
                await sendBtn.click();
            } else {
                console.log('⚠️ Could not find "Add a note" button. Sending without note...');
                const sendWithoutNote = page.getByRole(SELECTORS.profile.sendWithoutNote.role, { 
                    name: SELECTORS.profile.sendWithoutNote.name 
                });
                if (await sendWithoutNote.isVisible()) {
                    await sendWithoutNote.click();
                } else {
                    return { ["success"]: false, ["error"]: 'COULD_NOT_ADD_NOTE_OR_SEND' };
                }
            }
        } else {
            console.log('⏩ Sending without note...');
            const sendWithoutNote = page.getByRole(SELECTORS.profile.sendWithoutNote.role, { 
                name: SELECTORS.profile.sendWithoutNote.name 
            });
            if (await sendWithoutNote.isVisible()) {
                await sendWithoutNote.click();
            } else {
                const sendBtn = page.getByRole(SELECTORS.profile.send.role, { 
                    name: SELECTORS.profile.send.name,
                    exact: SELECTORS.profile.send.exact
                });
                if (await sendBtn.isVisible()) {
                    await sendBtn.click();
                } else {
                    return { ["success"]: false, ["error"]: 'COULD_NOT_SEND_WITHOUT_NOTE' };
                }
            }
        }

        await page.waitForTimeout(2000);
        console.log('✅ Connection request sent successfully.');
        return { ["success"]: true };
    } catch (e: unknown) {
        return { ["success"]: false, ["error"]: (e as Error).message || String(e) };
    }
}

/**
 * Sends a message to a LinkedIn profile (assuming already connected).
 */
export async function sendMessage(page: Page, message: string): Promise<{ success: boolean; error?: string }> {
    try {
        const messageBtn = page.getByRole(SELECTORS.profile.message.role, { 
            name: SELECTORS.profile.message.name,
            exact: SELECTORS.profile.message.exact
        });
        
        if (!(await messageBtn.isVisible())) {
            return { ["success"]: false, ["error"]: 'MESSAGE_BUTTON_NOT_FOUND' };
        }
        
        await messageBtn.click();
        await page.waitForTimeout(1000 + Math.random() * 500);
        
        const textArea = page.getByRole(SELECTORS.messaging.textbox.role, { 
            name: SELECTORS.messaging.textbox.name 
        });
        
        if (!(await textArea.isVisible())) {
            return { ["success"]: false, ["error"]: 'MESSAGE_TEXTBOX_NOT_FOUND' };
        }
        
        await typeHumanLike(page, textArea, message);
        await page.waitForTimeout(500 + Math.random() * 500);
        
        const sendBtn = page.getByRole(SELECTORS.messaging.send.role, { 
            name: SELECTORS.messaging.send.name,
            exact: SELECTORS.messaging.send.exact
        });
        await sendBtn.click();
        
        return { ["success"]: true };
    } catch (e: unknown) {
        return { ["success"]: false, ["error"]: (e as Error).message || String(e) };
    }
}

/**
 * Types text with a human-like delay between characters.
 */
async function typeHumanLike(page: Page, locator: any, text: string) {
    await locator.focus();
    for (const char of text) {
        // Randomize delay between 60ms and 150ms
        const delay = 60 + Math.random() * 90;
        await page.keyboard.type(char, { delay });
        
        // Occasionally pause to mimic a human "thinking" or correcting
        if (Math.random() < 0.05) {
            await page.waitForTimeout(500 + Math.random() * 500);
        }
    }
}
