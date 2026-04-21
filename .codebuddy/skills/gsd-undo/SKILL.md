---
name: gsd-undo
description: Safe git revert. Roll back phase or plan commits using the phase manifest with dependency checks.
---


<objective>
Safe git revert — roll back GSD phase or plan commits using the phase manifest, with dependency checks and a confirmation gate before execution.

Three modes:
- **--last N**: Show recent GSD commits for interactive selection
- **--phase NN**: Revert all commits for a phase (manifest + git log fallback)
- **--plan NN-MM**: Revert all commits for a specific plan
</objective>

<execution_context>
@D:/New-vp-main/.codebuddy/get-shit-done/workflows/undo.md
@D:/New-vp-main/.codebuddy/get-shit-done/references/ui-brand.md
@D:/New-vp-main/.codebuddy/get-shit-done/references/gate-prompts.md
</execution_context>

<context>
{{GSD_ARGS}}
</context>

<process>
Execute the undo workflow from @D:/New-vp-main/.codebuddy/get-shit-done/workflows/undo.md end-to-end.
</process>
