# Phase 3: n8n Outreach Engine - Plan 02 Summary (Updated for Local rotation & Ollama)

## Objective
Develop the Cold Email outreach logic in n8n, incorporating AI-powered personalization (Ollama), account rotation, and jitter/staggered sending.

## Completed Tasks
- [x] **Local DB Initialization**: Created `User`, `Lead`, `SenderAccount`, and `Campaign` tables in local PostgreSQL via `pg` driver.
- [x] **Account Import**: Imported 8 email accounts from CSV into `SenderAccount` table.
- [x] **Lead Import**: Imported 5000 leads from CSV into `Lead` table.
- [x] **Account Rotation**: Added n8n nodes to fetch all sender accounts and select one at random for each lead.
- [x] **Ollama Integration**: Replaced OpenAI node with HTTP Request node pointing to local Ollama (`http://localhost:11434/api/chat`) using DeepSeek-v2.
- [x] **Dynamic SMTP**: Configured SMTP node to use dynamic host, port, user, and password from the selected sender account.
- [x] **Status Sync**: Maintains lead status updates to 'Contacted (Email)' in the local database.

## Technical Details
- **Rotation Logic**: Code node uses `Math.random()` to pick from the `SenderAccount` pool.
- **AI Model**: DeepSeek-v2 via Ollama (No cloud dependency).
- **Sender Pool**: 8 accounts (GMX & Mailo).

## Next Steps
Proceed to Phase 3 Plan 03: Develop LinkedIn workflow.
