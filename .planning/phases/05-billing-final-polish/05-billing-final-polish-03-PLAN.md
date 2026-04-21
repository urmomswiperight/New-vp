---
phase: 5
plan: 3
objective: Billing UI & Final Polish
---

# Plan 03: Billing UI & Final Polish

Finalize the user-facing billing dashboard and usage feedback.

## Tasks
- [ ] **Enhance Usage Tracker**: Update `src/components/dashboard/usage-tracker.tsx` to:
    - Receive `usage`, `limit`, and `daysLeft` from `usageStatus`.
    - Display "X days left in trial" if in trial mode.
    - Display "Y/5 uses" more prominently.
- [ ] **Finalize Billing Page**: Update `src/app/dashboard/billing/page.tsx` to:
    - Display current subscription status (Active/Pending/Inactive).
    - Provide a detailed usage breakdown.
    - Show the trial countdown.
    - Add a clear "Go Pro" button for active trial users.
    - Include Lemon Squeezy checkout link alongside Fiverr options.
- [ ] **Admin Verification**: Verify that the `ADMIN_USER_ID` environment variable correctly bypasses all UI and API limits.
- [ ] **General Polish**:
    - Ensure all UI elements follow the 'AdminDek' style.
    - Final check for error messages and loading states.

## Verification
- [ ] Manual check of the dashboard for trial users vs. subscribed users.
- [ ] Verify that the billing page correctly reflects the subscription status in the database.
- [ ] Confirm that Lemon Squeezy checkout opens correctly.
