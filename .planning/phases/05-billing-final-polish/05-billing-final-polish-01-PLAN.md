---
phase: 5
plan: 1
objective: Database & Usage Core Logic
---

# Plan 01: Database & Usage Core Logic

Update data models and core usage tracking to support trial periods.

## Tasks
- [ ] **Update Prisma Schema**: Add `createdAt DateTime @default(now())` to the `User` model in `prisma/schema.prisma`.
- [ ] **Run Database Migration**: Run `npx prisma db push` to apply changes to the database.
- [ ] **Implement Trial Logic**: Update `src/lib/usage.ts` to calculate trial status.
    - Check for Admin bypass (`userId === process.env.ADMIN_USER_ID`).
    - Check for Active subscription in the `Subscription` table.
    - Implement the (usage < 5 AND days since signup < 7) check.
    - Return a detailed object: `{ allowed: boolean, usage: number, limit: number, daysLeft: number, status: string }`.

## Verification
- [ ] Run `npx prisma generate`.
- [ ] Verify `checkUsageLimit` correctly handles:
    - Admin user (always allowed).
    - Subscribed user (always allowed).
    - New user (allowed if within 5 uses AND 7 days).
    - Expired trial user (not allowed).
