---
phase: 01-technical-foundation
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - "package.json"
  - "package-lock.json"
  - "next.config.mjs"
  - "tsconfig.json"
  - "tailwind.config.ts"
  - "src/app/globals.css"
  - "src/app/layout.tsx"
  - "src/app/page.tsx"
  - "src/components/ui/"
  - "src/lib/utils.ts"
  - "components.json"
autonomous: true
requirements:
  - "FOUND-01"

must_haves:
  truths:
    - "The Next.js application can be started locally using `npm run dev`."
    - "The base UI styles from Tailwind CSS are applied correctly."
    - "A shadcn/ui component (e.g., Button) can be imported and rendered without errors."
  artifacts:
    - path: "next.config.mjs"
      provides: "Next.js 15 configuration."
    - path: "tailwind.config.ts"
      provides: "Tailwind CSS configuration for the AdminDek theme."
    - path: "components.json"
      provides: "shadcn/ui configuration."
    - path: "src/app/layout.tsx"
      provides: "The root layout with Tailwind CSS classes applied."
  key_links:
    - from: "src/app/layout.tsx"
      to: "src/app/globals.css"
      via: "CSS import"
      pattern: "import './globals.css'"
---

<objective>
Initialize the Next.js 15 project and set up the foundational UI layer with Tailwind CSS and shadcn/ui, establishing the "AdminDek" visual style.

Purpose: To create a runnable, styled application shell, providing the canvas for all subsequent feature development.
Output: A new Next.js 15 project with TypeScript, Tailwind CSS, and shadcn/ui configured and ready for use.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/01-technical-foundation.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Initialize Next.js 15 Project</name>
  <files>
    - "package.json"
    - "next.config.mjs"
    - "tsconfig.json"
    - "src/app/layout.tsx"
    - "src/app/page.tsx"
  </files>
  <action>
    Initialize a new Next.js 15 project in the current directory. Use the App Router and TypeScript. This command will set up the basic project structure and dependencies.
    Command: `npx create-next-app@latest . --typescript --tailwind --eslint --src-dir --app --import-alias "@/*"`
  </action>
  <verify>
    Run `npm run dev`. The default Next.js welcome page should be accessible at http://localhost:3000.
  </verify>
  <done>
    A runnable Next.js 15 application exists and can be started without errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Configure shadcn/ui</name>
  <files>
    - "components.json"
    - "tailwind.config.ts"
    - "src/app/globals.css"
    - "src/lib/utils.ts"
  </files>
  <action>
    Initialize shadcn/ui to manage UI components. This will configure `tailwind.config.ts` and `globals.css` for the "AdminDek" theme (using the "Default" style and "Slate" color). This setup is non-interactive.
    Command: `npx --yes shadcn@latest init --yes --cwd . --style default --base-color slate --components-dir 'src/components' --lib-dir 'src/lib' --utils 'src/lib/utils' --tailwind-css-file 'src/app/globals.css' --tailwind-config 'tailwind.config.ts' --tailwind-base-color 'slate' --typescript --rsc`
  </action>
  <verify>
    Check that `components.json` has been created and `tailwind.config.ts` has been updated with shadcn/ui plugin and theme settings.
  </verify>
  <done>
    shadcn/ui is configured, and the project is ready for adding UI components.
  </done>
</task>

<task type="auto">
  <name>Task 3: Add Initial UI Component and Icons</name>
  <files>
    - "src/components/ui/button.tsx"
    - "package.json"
    - "package-lock.json"
  </files>
  <action>
    Add the `button` component from shadcn/ui and the `lucide-react` library for icons, as specified in the research. This validates that the shadcn/ui setup is working correctly.
    
    1. Install `lucide-react`: `npm install lucide-react`
    2. Add the button component: `npx --yes shadcn@latest add button`
  </action>
  <verify>
    The file `src/components/ui/button.tsx` exists. `lucide-react` is listed as a dependency in `package.json`.
  </verify>
  <done>
    A core UI component and icon set are available for use in the project.
  </done>
</task>

</tasks>

<verification>
1. Run `npm install` to ensure all dependencies are present.
2. Run `npm run dev`. The application should start on `http://localhost:3000` without any errors.
3. The default page should render with correct Tailwind CSS styling (e.g., no default browser styles).
</verification>

<success_criteria>
- The project is fully initialized and runnable.
- The UI foundation for the "AdminDek" theme is in place.
- All tasks are complete, and the specified files have been created or modified.
</success_criteria>

<output>
After completion, create `.planning/phases/01-technical-foundation/01-technical-foundation-01-SUMMARY.md`
</output>
