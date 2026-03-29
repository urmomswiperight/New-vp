---
name: n8n-node-configuration
description: Operation-aware node configuration guidance. Use when configuring nodes, understanding property dependencies, determining required fields, choosing between get_node detail levels, or learning common configuration patterns by node type.
---

# n8n Node Configuration

Expert guidance for operation-aware node configuration with property dependencies.

---

## Configuration Philosophy

**Progressive disclosure**: Start minimal, add complexity as needed.
- `get_node` with `detail: "standard"` covers 95% of use cases.

---

## Core Concepts

### 1. Operation-Aware Configuration
Required fields change based on the selected `resource` and `operation`.
Example: Slack `post` needs `channel`, but `update` needs `messageId`.

### 2. Property Dependencies
Fields appear/disappear based on other field values (`displayOptions`).
Example: HTTP Request `body` only shows when `sendBody` is true.

### 3. Progressive Discovery
1. `get_node({detail: "standard"})` - **Default/Recommended**.
2. `get_node({mode: "search_properties", propertyQuery: "..."})` - Find specific fields.
3. `get_node({detail: "full"})` - Use only if needed.

---

## Configuration Workflow

1. Identify node type and operation.
2. `get_node` (standard detail).
3. Configure required fields.
4. Validate (`validate_node`).
5. If field unclear → `search_properties`.
6. Add optional fields → Validate again → Deploy.

---

## Common Node Patterns

- **Resource/Operation Nodes**: Slack, Google Sheets, Airtable.
- **HTTP-Based Nodes**: HTTP Request, Webhook.
- **Database Nodes**: Postgres, MySQL (Query vs Insert/Update).
- **Conditional Nodes**: IF, Switch (Binary vs Unary operators).

---

## Best Practices

- **Start Minimal**: Don't over-configure upfront.
- **Validate Iteratively**: Configure → Validate → Fix → Repeat.
- **Respect Operation Context**: Always check requirements when changing operations.
- **Trust Auto-Sanitization**: Let the system fix operator structures.

---
