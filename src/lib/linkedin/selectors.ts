/**
 * Resilient LinkedIn Selectors based on ARIA roles and labels.
 * These are more stable than CSS classes which change frequently.
 * 
 * Pattern: Use Playwright's getByRole, getByLabel, or getByText.
 */
export const SELECTORS = {
  // Profile Page
  profile: {
    // Heading 1 is usually the person's name on their profile
    name: { role: 'heading' as const, level: 1 },
    
    // Primary buttons
    connect: { role: 'button' as const, name: /^Connect$/i, exact: true },
    message: { role: 'button' as const, name: /^Message$/i, exact: true },
    
    // Dropdown / Overflow menu
    more: { role: 'button' as const, name: /More actions/i },
    
    // Connection Flow
    addNote: { role: 'button' as const, name: /Add a note/i },
    customMessage: { role: 'textbox' as const, name: /Custom message/i },
    send: { role: 'button' as const, name: /^Send$/i, exact: true },
    sendWithoutNote: { role: 'button' as const, name: /Send without a note/i },
  },
  
  // Feed / Navigation
  nav: {
    home: { role: 'link' as const, name: /^Home$/i, exact: true },
    me: { role: 'button' as const, name: /Me/i },
  },
  
  // Messaging
  messaging: {
    // Message box on profile or in message center
    textbox: { role: 'textbox' as const, name: /Write a message/i },
    send: { role: 'button' as const, name: /^Send$/i, exact: true },
    
    // CSS-based fallbacks for messaging list where ARIA might be complex
    unreadCard: '.msg-conversation-card--unread',
    participantName: '.msg-conversation-card__participant-names',
  }
} as const;

export type SelectorMap = typeof SELECTORS;
