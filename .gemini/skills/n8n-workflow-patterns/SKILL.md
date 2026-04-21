---
name: n8n-workflow-patterns
description: Proven workflow architectural patterns from real n8n workflows. Use when building new workflows, designing workflow structure, choosing workflow patterns, planning workflow architecture, or asking about webhook processing, HTTP API integration, database operations, AI agent workflows, or scheduled tasks.
---

# n8n Workflow Patterns

Proven architectural patterns for building n8n workflows.

---

## The 7 Core Patterns

1. **Webhook Processing**: Webhook → Validate → Transform → Respond.
2. **HTTP API Integration**: Trigger → HTTP Request → Transform → Action.
3. **Database Operations**: Schedule → Query → Transform → Write.
4. **AI Agent Workflow**: Trigger → AI Agent (Model + Tools + Memory).
5. **Scheduled Tasks**: Schedule → Fetch → Process → Deliver.
6. **Agentic Outreach**: Research → Enrich → Score → AI Draft → HITL → Act.
7. **Hyper-Personalization**: Scrape (LinkedIn/Web) → Extract Context → LLM Icebreaker → Personalize.

---

## Modern Outreach Best Practices (from n8nworkflows.xyz)

- **Multi-Stage Enrichment**: Don't trigger outreach directly from a list. Use tools like Apollo, Apify, or Bright Data to research the lead first.
- **AI-Powered Personalization**: Use LLMs (GPT-4o, Claude) to draft "Icebreakers" based on recent LinkedIn posts or company news.
- **Modular Sub-Workflows**: Break complex logic (Error Handling, Data Formatting) into reusable sub-workflows called via the **Execute Workflow** node.
- **Human-in-the-Loop (HITL)**: Implement an "Approval Loop" via Slack or a dashboard before sending the actual outreach.
- **Account Rotation**: Use SMTP Rotation and multi-account management for scaling to bypass rate limits.
- **RAG (Retrieval-Augmented Generation)**: Integrate vector databases (Supabase, Pinecone) to provide AI agents with company context.
- **Error Recovery**: Include "Auto-Retry" engines and "Auto-heal" logic using AI to analyze failures.

---

## Workflow Creation Checklist

- **Planning**: Identify pattern, list nodes, plan data flow and error handling.
- **Implementation**: Create trigger, add sources, configure auth, add logic.
- **Validation**: `validate_node` for each, then `validate_workflow`.
- **Deployment**: Review settings, activate (`activateWorkflow`), monitor.

---

## Data Flow Patterns

- **Linear**: Simple single path.
- **Branching**: `IF` / `Switch` routing.
- **Parallel**: Independent branches → `Merge`.
- **Loop**: `Split in Batches` for large datasets.
- **Error Handler**: Separate flow for failures.

---

## Common Gotchas

- **Webhook Nesting**: Access data via `$json.body.field`.
- **Multiple Items**: Nodes process all inputs unless "Execute Once" is set.
- **Auth**: Use the Credentials section, not parameters.
- **Expression Braces**: Missing `{{ }}` makes expressions literal text.

---

## Best Practices

- Start with the simplest pattern.
- Plan structure before building.
- Use error handling on all workflows.
- Iterate (avg 56s between edits).
- Use descriptive node names and Document with notes.

---
