# Phase 4: AI Onboarding & Research (Local-First AI)

**Researched:** 2024-05-23 (Updated 2026-02-28)
**Domain:** AI Integration & Market Research
**Stack:** $0 Total Cost, Local-First (Ollama)

## <user_constraints>
- **Total Cost:** $0 (No credit card required)
- **AI Engine:** Local Ollama (`http://localhost:11434/api/chat`)
- **Preferred Model:** DeepSeek-v2 or Llama 3 (Ollama does not host proprietary OpenAI GPT-4o, but provides high-quality open-source alternatives).
- **Core Features:** Meeting Summarization, Competitor Research (via Perplexity or similar $0 alternatives if possible).
</user_constraints>

## AI Strategy

### 1. Meeting Summarization
- **Mechanism:** Users upload meeting transcripts (text/VTT) to the dashboard.
- **Processing:** Next.js sends transcript to n8n.
- **AI Task:** n8n calls local Ollama with a specialized prompt to:
    - Summarize key points.
    - Extract action items.
    - Identify core pain points mentioned by the prospect.
- **Output:** Report stored in Supabase and displayed on a new "Research" tab in the dashboard.

### 2. Competitor Research
- **Mechanism:** Triggered automatically after a meeting summary is generated (using the prospect's company name).
- **Processing:** n8n uses a search engine node (e.g., DuckDuckGo, which is free) or an HTTP request to a free search API to identify competitors.
- **AI Task:** Ollama analyzes the search results to create a "Battle Card" for the prospect.
- **Output:** Pushed to the dashboard as a PDF or interactive report.

## Technical Architecture

### Data Flow
1. **Upload:** `src/app/dashboard/research/page.tsx` handles transcript upload.
2. **Trigger:** API route `/api/research/summarize` triggers n8n.
3. **n8n Workflow:**
    - Call Ollama for summary.
    - Call DuckDuckGo (or similar) for competitor names.
    - Call Ollama to analyze competitors.
    - Save all results back to Supabase.
4. **UI Update:** Dashboard reflects "Research Complete" and shows the data.

## Common Pitfalls
- **Model Size:** Large transcripts might exceed context windows of smaller local models (e.g., Llama 3 8B).
- **Search Limits:** Free search APIs often have strict rate limits.
- **Accuracy:** Open-source models need careful prompting for high-quality summarization.
