# Research: Phase 2 - Core Dashboard & Lead Management

## Objective
Implement a professional dashboard with lead management capabilities, including CSV import and filtering.

## UI/UX: AdminDek Style
AdminDek is characterized by a sleek, modern sidebar, top navigation, and card-based layout for data visualization.
- **Sidebar:** Collapsible, containing links to Dashboard, Leads, Campaigns, Billing.
- **Theme:** Support for Light/Dark mode (using `next-themes`).
- **Layout:** `src/app/dashboard/layout.tsx` will house the Sidebar and Topbar.

## Lead Management
- **Schema:** Existing `Lead` model in Prisma is sufficient.
- **DataTable:** Use `@tanstack/react-table` (shadcn `table` component) for the leads list.
- **Filtering:** Implement client-side or server-side filtering for `Region` and `Status`.
- **CSV Import:**
  - Library: `papaparse` for client-side parsing.
  - Flow: User uploads CSV -> Parse locally -> Validate -> Send batches to Server Action -> Bulk create in Database.
  - Endpoint/Action: `importLeadsAction`.

## Usage Tracking
- **Logic:** Each lead import or campaign start should check `User.usage_count`.
- **Limits:** Free trial (5 uses or 7 days).
- **Implementation:** Middleware or utility function to check and increment usage.

## Required Components (shadcn)
- `sidebar`
- `table`
- `dropdown-menu`
- `dialog`
- `badge`
- `tabs`
- `toast` (sonner)

## Dependencies to Install
- `papaparse`
- `@tanstack/react-table`
- `lucide-react` (already installed)
- `next-themes`
- `sonner`

## Technical Considerations
- **Tailwind 4:** Ensure all new components are styled using Tailwind 4's CSS-only approach.
- **Next.js 15/16:** Use Server Actions and `await cookies()` where necessary.
- **Performance:** Bulk imports should be handled in batches to avoid server timeouts.
