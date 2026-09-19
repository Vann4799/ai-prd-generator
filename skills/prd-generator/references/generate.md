# Generation Reference

Write the PRD into `assets/prd-structure.md`. Fill every section; where the
user was unsure, add the question to *Open Questions* instead of inventing an
answer.

## Style

- Concise — every line carries information.
- Tables for comparisons, checklists for features, Given/When/Then for criteria.
- Concrete examples over abstractions ("struk thermal 58mm", not "print
  output").
- No filler: never "It is important to note that…", "This section will…".
- Write in the language chosen at Q16. Section headings stay in English so the
  validator and exporter can parse them.

## Section rules

| Section | Must contain |
|---------|--------------|
| 1. Project Overview | name, type, 1-2 sentence description, version/date/author |
| 2. Problem Statement | the problem, why it matters now, current workaround + its cost |
| 3. Target Users | named primary persona, secondary roles, real counts from Q9 |
| 4. Features | P0 / P1 / P2 buckets, every P0 item checkable; out-of-scope list from Q12 |
| 5. User Stories | one `###` block per P0 feature: As a / I want / So that |
| 6. Acceptance Criteria | at least one Given/When/Then per user story |
| 7. Technical Requirements | stack, platform, dependencies, performance target |
| 8. Success Metrics | measurable KPI + how it is measured + target value |
| 9. Timeline | phases with deliverables and dates or durations |
| 10. Risks & Mitigation | table, each row risk → impact → mitigation |
| 11. Non-Technical Summary | 3-5 plain sentences, zero jargon |
| 12. Open Questions | anything the user could not answer |

Derive user stories from the P0 list only — a story for a feature that isn't
P0 means the feature list is wrong, not the story list.

For codebase-aware PRDs, section 7 must reflect what the repo actually uses
(real deps and versions), and section 9 should be phased against what already
exists versus what is net-new.

## Finish

1. Save to the agreed path (`docs/PRD-<slug>.md`, or `PRD.md` at root).
2. Run `node scripts/validate_prd.mjs <file>` and clear every FAIL.
3. Then produce the non-technical summary in chat, per SKILL.md step 4.
