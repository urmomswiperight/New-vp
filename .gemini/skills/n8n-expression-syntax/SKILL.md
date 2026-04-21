---
name: n8n-expression-syntax
description: Validate n8n expression syntax and fix common errors. Use when writing n8n expressions, using {{}} syntax, accessing $json/$node variables, troubleshooting expression errors, or working with webhook data in workflows.
---

# n8n Expression Syntax

Expert guide for writing correct n8n expressions in workflows.

---

## Expression Format

All dynamic content in n8n uses **double curly braces**: `{{expression}}`

**Examples**:
- ✅ `{{$json.email}}`
- ✅ `{{$json.body.name}}`
- ✅ `{{$node["HTTP Request"].json.data}}`

---

## Core Variables

### $json - Current Node Output
`{{$json.fieldName}}`, `{{$json['field with spaces']}}`

### $node - Reference Other Nodes
`{{$node["Node Name"].json.fieldName}}`
- Node names **must** be in quotes and are **case-sensitive**.

### $now - Current Timestamp
`{{$now}}`, `{{$now.toFormat('yyyy-MM-dd')}}`

### $env - Environment Variables
`{{$env.API_KEY}}`

---

## 🚨 CRITICAL: Webhook Data Structure

**Most Common Mistake**: Webhook data is **NOT** at the root! It is nested under `.body`.

```javascript
❌ WRONG: {{$json.name}}
✅ CORRECT: {{$json.body.name}}
```

---

## Validation Rules

1. **Always Use {{}}**: Expressions **must** be wrapped.
2. **Use Quotes for Spaces**: `{{$json['field name']}}`, `{{$node["HTTP Request"].json}}`.
3. **Match Exact Node Names**: references are **case-sensitive**.
4. **No Nested {{}}**: Don't double-wrap.
5. **No {{}} in Code Nodes**: Code nodes use direct JS/Python access.

---

## Common Patterns

### Access Nested Fields
`{{$json.user.email}}`, `{{$json.data[0].name}}`

### Conditional Content
`{{$json.status === 'active' ? 'Active' : 'Inactive'}}`, `{{$json.email || 'default@example.com'}}`

### Date Manipulation
`{{$now.plus({days: 7}).toFormat('yyyy-MM-dd')}}`

---

## Summary

**Essential Rules**:
1. Wrap expressions in {{ }}
2. Webhook data is under `.body`
3. No {{ }} in Code nodes
4. Quote node names with spaces
5. Node names are case-sensitive
---
