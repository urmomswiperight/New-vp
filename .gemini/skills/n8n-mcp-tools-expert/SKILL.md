---
name: n8n-mcp-tools-expert
description: Expert guide for using n8n-mcp MCP tools effectively. Use when searching for nodes, validating configurations, accessing templates, managing workflows, or using any n8n-mcp tool. Provides tool selection guidance, parameter formats, and common patterns.
---

# n8n MCP Tools Expert

Master guide for using n8n-mcp MCP server tools to build workflows.

---

## Tool Categories

1. **Node Discovery** (search_nodes, get_node)
2. **Configuration Validation** (validate_node, validate_workflow)
3. **Workflow Management** (n8n_create_workflow, n8n_update_partial_workflow)
4. **Template Library** (search_templates, get_template, n8n_deploy_template)

---

## Critical: nodeType Formats

### Format 1: Search/Validate Tools
Use **SHORT** prefix: `"nodes-base.slack"`, `"nodes-base.httpRequest"`

### Format 2: Workflow Tools
Use **FULL** prefix: `"n8n-nodes-base.slack"`, `"n8n-nodes-base.httpRequest"`

---

## Tool Selection Guide

### Finding a Node
1. `search_nodes({query: "keyword"})`
2. `get_node({nodeType: "nodes-base.name"})`

### Validating Configuration
1. `validate_node({nodeType, config, profile: "runtime"})`

### Managing Workflows
1. `n8n_create_workflow({...})`
2. `n8n_update_partial_workflow({id, operations: [...]})`

---

## Common Mistakes

1. **Wrong nodeType Format**: Mixing `nodes-base` and `n8n-nodes-base`.
2. **Token Waste**: Using `detail="full"` in `get_node` when `standard` suffices.
3. **Skipping Profiles**: Not specifying `profile: "runtime"` during validation.
4. **Manual sourceIndex**: Not using smart parameters like `branch: "true"` or `case: 0`.

---

## Best Practices

- Use `get_node({detail: "standard"})` (default).
- Specify validation profile explicitly.
- Use `intent` parameter in workflow updates for better AI responses.
- Iterate workflows (avg 56s between edits) rather than one-shot creation.
- Use `n8n_deploy_template` for quick starts.

---
