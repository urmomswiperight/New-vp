# Phase 1 Research: Payment Gateway Pivot (Ethiopia)

**Researched:** 2024-07-31
**Goal:** Replace Stripe/Lemon Squeezy with a viable payment method for an Ethiopian SaaS.

## <user_constraints>
- **Location:** Ethiopia (Stripe not supported).
- **Blocker:** Lemon Squeezy ID verification rejected.
- **Proposed Solution:** Redirect to Fiverr Gig for payment.
- **Requirement:** Support $500/mo subscription model.
</user_constraints>

---

## Option 1: Fiverr Redirection (User's Proposal)

Fiverr is an online marketplace, not a payment gateway. Using it as a "checkout" for an external SaaS is a **high-friction, high-cost** manual process.

### Architecture Pattern: Manual Activation
1. **User Action:** Clicks "Pay on Fiverr" in the dashboard.
2. **Redirection:** User is sent to a custom Fiverr Gig link.
3. **Requirement:** In the Fiverr Order Requirements, the user must provide their **App User ID** or **Email**.
4. **Processing:** The user pays Fiverr (Fiverr takes 20%).
5. **Validation:** You (the admin) receive a notification from Fiverr. You manually update the user's status in Supabase.

### Don't Hand-Roll (Pitfalls)
- **TOS Risk:** Fiverr's Terms of Service prohibit "circumventing" their platform. While selling a service on Fiverr is fine, using it to pay for an external software subscription might lead to account flags if not handled as a "Gig".
- **Commission:** Fiverr takes **20%**. For a $500 payment, you only receive $400.
- **Payout Delay:** Fiverr holds funds for 14 days (or 7 for Pro/Top Rated).
- **Recurring Billing:** Fiverr does not support automated recurring billing for external SaaS. Users would have to buy a new "Gig" every month.

---

## Option 2: Chapa (Recommended Professional Solution)

Chapa (chapa.co) is the leading Ethiopian payment gateway designed for SaaS and international/domestic payments.

### Why Standard for Ethiopia
- **Supports Local:** Telebirr, CBEBirr, M-Pesa.
- **Supports International:** Visa, Mastercard.
- **Next.js Friendly:** Has a documented API and community wrappers.
- **SaaS Focus:** Explicitly supports subscription-based models.

### Architecture Pattern: Chapa Integration
**Redirection Flow:**
```typescript
// src/app/api/billing/chapa/route.ts
export async function POST(req: Request) {
  const { userId, email, amount } = await req.json();
  
  const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      currency: "ETB", // or USD if supported
      email: email,
      tx_ref: `tx-${userId}-${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/chapa`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      customization: {
        title: "AI Marketing Agent Subscription",
        description: "Monthly access to the AI Marketing Agent",
      },
    }),
  });

  const data = await response.json();
  return Response.json({ checkoutUrl: data.data.checkout_url });
}
```

---

## Option 3: Telebirr (Local Direct)

If your target market is 100% Ethiopian, a direct Telebirr integration is the most friction-less for customers.

### Pitfalls
- **Complexity:** Requires handling RSA encryption/decryption for payloads.
- **Manual Setup:** Requires applying for a merchant account via Ethio Telecom.

---

## Architecture Patterns: Manual vs. Automated

| Feature | Fiverr Redirection | Chapa Integration |
|---------|-------------------|-------------------|
| **Speed to Implement** | Very Fast (1 hour) | Moderate (1-2 days) |
| **User Experience** | Poor (External site, manual) | Excellent (Native checkout) |
| **Fees** | **20%** | ~3.5% + fixed fee |
| **Automation** | Manual Admin Update | Fully Automated Webhooks |
| **Scalability** | Low (Admin overhead) | High |

---

## Code Examples: Manual Activation System (Fiverr fallback)

If you stick with Fiverr, you need a "Pending Approval" state in your DB:

```sql
ALTER TABLE public.users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.users ADD COLUMN fiverr_order_id TEXT;
```

**Workflow:**
1. User submits their Fiverr Order ID in a form on your `/billing` page.
2. Status becomes `pending_manual_verification`.
3. You check Fiverr, verify the order, and run a simple SQL command or use a hidden admin page to set status to `active`.

## Ready for Strategy Change?
The Fiverr solution is "easy" but will cost you **$100 per user per month** in fees and requires manual work. 

**My Recommendation:** Use **Chapa**. It is the professional way to build a SaaS in Ethiopia. 
If you want to proceed with Fiverr for "Day 1" speed, I can help you build the "Manual Verification" flow.
