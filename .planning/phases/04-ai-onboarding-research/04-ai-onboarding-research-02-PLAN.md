---
phase: 04-ai-onboarding-research
plan: 02
type: execute
wave: 2
depends_on: ["04-ai-onboarding-research-01"]
files_modified: ["n8n_research_workflow.json", "src/app/dashboard/research/page.tsx"]
autonomous: true
requirements: [AI-COMPETITORS, BATTLE-CARD-UI]
user_setup: []

must_haves:
  truths:
    - "n8n can search for competitors based on a company name/industry"
    - "Ollama generates a 'Battle Card' (Strengths/Weaknesses) for each competitor"
    - "Dashboard displays competitor research alongside the meeting summary"
  artifacts:
    - path: "n8n_research_workflow.json"
      provides: "Updated n8n workflow with competitor search"
    - path: "src/app/dashboard/research/page.tsx"
      provides: "UI for competitor battle cards"
  key_links:
    - from: "n8n"
      to: "DuckDuckGo / Search API"
      via: "HTTP Request / Search Node"
    - from: "n8n"
      to: "Ollama"
      via: "HTTP Request to localhost:11434"
---

<objective>
Automate competitor research by integrating a search engine into the n8n research workflow and using local AI to analyze the findings, presenting them as "Battle Cards" in the dashboard.

Purpose: Provides users with instant competitive intelligence after every discovery call.
Output: An enhanced n8n research workflow and updated dashboard UI.
</objective>

<execution_context>
@C:/Users/mikiy/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/mikiy/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-ai-onboarding-research/RESEARCH.md
@.planning/phases/04-ai-onboarding-research/04-ai-onboarding-research-01-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Competitor Research n8n Logic</name>
  <files>n8n_research_workflow.json</files>
  <action>
    Update `n8n_research_workflow.json`:
    1. **Extract Company Name**: Use Ollama to identify the prospect's company name and industry from the transcript if not explicitly provided.
    2. **Search Node**: Add a DuckDuckGo node (or HTTP request to a free search engine) to search for "[Industry] competitors" or "[Company] competitors".
    3. **Competitor Analysis (Ollama)**: Send the search results to Ollama with a prompt:
       - "Based on these search results, identify the top 3 competitors and for each, provide: 1. Name, 2. Key Strength, 3. How we beat them (Value Prop)."
    4. **Consolidate JSON**: Merge the meeting summary and competitor battle cards into a single JSON response.
  </action>
  <verify>
    Test the workflow with a known company/industry and verify that it returns both the summary and a structured list of competitors.
  </verify>
  <done>n8n can perform automated competitor research using local AI.</done>
</task>

<task type="auto">
  <name>Task 2: Dashboard Battle Card UI</name>
  <files>src/app/dashboard/research/page.tsx</files>
  <action>
    Update `src/app/dashboard/research/page.tsx`:
    1. Define a `Competitor` interface and update `SummaryResult` to include `competitors`.
    2. Add a "Competitor Intelligence" section to the results view.
    3. Implement a "Battle Card" grid to display competitor names, strengths, and your competitive edge (using shadcn `Card` and `Badge`).
  </action>
  <verify>
    Run the full research flow from the UI and confirm the competitor battle cards appear below the meeting summary.
  </verify>
  <done>Competitive intelligence is visually presented in the dashboard.</done>
</task>

</tasks>

<verification>
Verify end-to-end: Transcript upload -> n8n summarizes AND researches competitors -> UI displays full report with battle cards.
</verification>

<success_criteria>
- n8n workflow performs external search.
- Ollama analyzes search results accurately.
- Dashboard displays structured competitor data.
</success_criteria>

<output>
After completion, create `.planning/phases/04-ai-onboarding-research/04-ai-onboarding-research-02-SUMMARY.md`
</output>
