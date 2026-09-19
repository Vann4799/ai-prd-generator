# PRD Template

Fill every bracket. Delete this line and the "Usage" footer once done — the
validator flags leftover `[...]` placeholders.

```markdown
# [Project Name] PRD

## 1. Project Overview
- **Project Name**: [name]
- **Type**: [website | mobile app | desktop app | web + mobile]
- **Description**: [1-2 sentences]
- **Version**: [0.1]
- **Date**: [YYYY-MM-DD]
- **Author**: [author]

## 2. Problem Statement
[What breaks today, why it matters now, and what the current workaround costs.]

## 3. Target Users
- **Primary**: [persona — role, age band, tech comfort]
- **Secondary**: [other roles]
- **Count**: [expected users]
- **Needs**: [what they need from this]
- **Goals**: [what success looks like for them]

## 4. Features

### Must-Have (P0)
- [ ] [Feature 1]
- [ ] [Feature 2]

### Should-Have (P1)
- [ ] [Feature 3]

### Nice-to-Have (P2)
- [ ] [Feature 4]

### Out of Scope
- [Explicitly deferred item]

## 5. User Stories

### [Feature 1]
- **As a** [user type]
- **I want** [capability]
- **So that** [benefit]

## 6. Acceptance Criteria

### [Feature 1]
- Given [context], when [action], then [outcome]

## 7. Technical Requirements
- **Tech Stack**: [stack]
- **Platform**: [targets and minimums]
- **Dependencies**: [external services, libraries]
- **Performance**: [measurable target]

## 8. Success Metrics
- **[KPI]** — measured by [instrument], target [value]

## 9. Timeline
- **Phase 1** ([dates or duration]): [deliverables]
- **Phase 2** ([dates or duration]): [deliverables]
- **Launch**: [date]

## 10. Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [risk] | [high / medium / low] | [strategy] |

## 11. Non-Technical Summary
[3-5 sentences a person outside software can read. No jargon, no tool names.]
```

## Optional sections

Add only when the matching interview trigger fired — never to look thorough:

- **Business Model** — the app charges or takes a cut
- **Compliance** — personal data, documents, or health/financial records
- **Integrations** — a third-party system is in scope (name it, direction, failure mode)
- **Maintenance** — someone other than the builder operates it after launch
- **Open Questions** — anything the user could not answer
- **Data Model**, **Accessibility** — only when they carry real content

## Usage

1. Copy the block above into the target file.
2. Replace every `[placeholder]`.
3. Run `node scripts/validate_prd.mjs <file>` and clear all FAIL lines.
