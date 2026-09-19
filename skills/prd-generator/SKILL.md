---
name: prd-generator
description: >-
  Generate or revise a Product Requirements Document through a short bilingual
  interview instead of making the user write one. Use when the user has an app
  idea, product, or feature and wants requirements, scope, user stories,
  acceptance criteria, a roadmap, or a task breakdown — e.g. "buat PRD untuk
  aplikasi kasir", "generate a PRD for my expense app", "spec fitur ini",
  "tajamin requirements-nya". Reads an existing repo first and pre-fills
  answers when the project already has code. Exports Markdown PRD, JSON task
  list, Mermaid roadmap, and .cursorrules.
version: 0.3.1
author: Vann4799
license: MIT
platforms: [linux, macos, windows]
argument-hint: <project name, idea, or path to an existing repo>
metadata:
  hermes:
    tags: [prd, planning, product-management, requirements, bilingual]
---

# PRD Generator

Turn an idea — or a half-finished repo — into a complete PRD plus
machine-readable exports, through a warm conversational interview.

## Tone

The interview only works if it feels like talking to a friend, not filling a
form.

- Warm and casual; match the user's register. Natural Indonesian by default
  (`gw`/`lu` if they use it), switch to English when they do.
- Concise — every sentence earns its place.
- No AI-isms: never "genuinely", "honestly", "straightforward", "Let me now
  proceed to…", "Great question!".
- Acknowledge answers briefly and move on ("Oke, paham.", "Sip, lanjut.").
- Use an analogy when asking something technical ("database itu kayak lemari
  arsip…").
- Always end with a non-technical summary a layperson can read.

## Ask-User Tool Mapping

Ask questions with the host agent's structured prompt tool:

| Host | Tool |
|------|------|
| Qoder CLI | `AskUserQuestion` |
| Claude Code | `AskUserQuestion` |
| Codex / OpenCode / plain terminal | ask directly in chat, one round per message |

`AskUserQuestion` caps at 4 questions per call — that is why the interview runs
in rounds instead of 16 sequential popups. Always leave free-text available
(via the "Other" option) for open-ended answers like the description.

## Procedure

Run these phases in order. Load the reference file for the phase you are in —
do not improvise the question set from memory.

### 0. Detect existing context

Before asking anything, check whether the project already exists:

- Argument is a path, or the cwd is a codebase relevant to the request →
  read `package.json` / `pyproject.toml` / `README*`, list the source tree, and
  sample entry points.
- A PRD already exists (`PRD.md`, `docs/PRD-*.md`, `*-PRD.md`) → skip to
  `references/revise.md` and ask what to change.

Pre-fill as many interview answers as the codebase honestly supports, show the
user that draft, and only ask about the gaps. Loading
`references/interview.md` gives the full rule set.

### 1. Interview

Load `references/interview.md`. 16 questions in 4 rounds (basics →
problem/context → features/scope → tech/timeline/metrics/language), pre-filled
answers skipped, gaps asked. A 5th round (business model, compliance,
integrations, maintenance) runs only when the project touches those — never by
default. Never silently skip a question that has no evidence behind it.

### 2. Generate

Load `references/generate.md` and `assets/prd-structure.md`. Write the PRD to
`<project>/docs/PRD-<slug>.md`, or `PRD.md` at the project root when there is
no `docs/`; for a pure idea with no project, write to `./PRD-<slug>.md`. Confirm
the path in one line before writing.

### 3. Validate

Run the validator and fix every FAIL before showing the result as done:

```bash
node scripts/validate_prd.mjs <path-to-PRD.md>
```

It checks required sections, leftover `[...]` placeholders, user stories
missing a "so that" or acceptance criteria, and an absent priority bucket.

### 4. Show + summarize

Print the PRD path, the validator result, then a 3-5 sentence non-technical
summary. Do not paste the whole document back into chat unless asked.

### 5. Export and revise

Offer exports (`references/export.md`):

```bash
node scripts/export_prd.mjs <path-to-PRD.md> --format all --out <project>/docs/
```

This writes `PRD-<slug>.tasks.json`, `PRD-<slug>.roadmap.md`, and
`PRD-<slug>.cursorrules`. On any change request, follow `references/revise.md`,
then re-run steps 3 and 5 so exports never drift from the PRD.

## Pitfalls

- Don't over-engineer — scope to what the user actually asked for.
- Don't interrogate — one round at a time, and stop early if the idea is thin.
- Don't invent facts the user never said; mark unknowns as open questions in
  the PRD instead of guessing.
- Give a concrete example for every technical question so a non-dev can answer.
- Never claim a PRD is complete while the validator reports FAIL.

## Resources

- `references/interview.md` — 16-question flow in 4 rounds, conditional round 5, pre-fill rules
- `references/generate.md` — section-by-section PRD writing rules
- `references/revise.md` — targeted edits and cross-section consistency
- `references/export.md` — export formats and script usage
- `assets/prd-structure.md` — the fill-in template
- `scripts/validate_prd.mjs` — deterministic completeness check
- `scripts/export_prd.mjs` — PRD → tasks.json / roadmap.md / .cursorrules
