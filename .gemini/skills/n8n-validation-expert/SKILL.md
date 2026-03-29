---
name: n8n-validation-expert
description: Interpret validation errors and guide fixing them. Use when encountering validation errors, validation warnings, false positives, operator structure issues, or need help understanding validation results. Also use when asking about validation profiles, error types, or the validation loop process.
---

# n8n Validation Expert

Expert guide for interpreting and fixing n8n validation errors.

---

## Validation Philosophy

**Validate early, validate often.** Validation is an iterative process (usually 2-3 cycles).

---

## Error Severity Levels

1. **Errors (Must Fix)**: Blocks execution (e.g., `missing_required`, `invalid_value`, `invalid_expression`).
2. **Warnings (Should Fix)**: Doesn't block execution but indicates potential issues (e.g., `best_practice`, `deprecated`).
3. **Suggestions (Optional)**: Improvements (e.g., `optimization`).

---

## Validation Profiles

- **minimal**: Fast, only required fields.
- **runtime (Recommended)**: Balanced, catches real errors (types, values, dependencies).
- **ai-friendly**: Reduces false positives for AI workflows.
- **strict**: Maximum safety, many warnings.

---

## Auto-Sanitization System

Automatically fixes common issues on workflow update:
- **Binary Operators**: Removes `singleValue`.
- **Unary Operators**: Adds `singleValue: true`.
- **IF/Switch Metadata**: Adds required conditions options.

---

## Workflow Validation

`validate_workflow` checks:
1. Individual node configurations.
2. Connection integrity (no broken references).
3. Expression syntax and references.
4. Logical flow (no circular dependencies).

---

## Best Practices

- Validate after every significant change.
- Read error messages completely (they contain fix guidance).
- Fix errors iteratively.
- Use `runtime` profile for pre-deployment.
- Trust auto-sanitization for operator issues.

---
