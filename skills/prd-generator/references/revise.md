# Revision Reference

Apply a targeted change to an existing PRD, then re-derive everything that
depends on it.

## Rules

- Identify every section the change touches before editing anything.
- Keep the rest of the document byte-stable — don't renumber or reword sections
  the user didn't ask about.
- Show a short before/after of the changed lines, not the whole document.
- Re-run the validator, then re-export. Stale exports are worse than no exports.

## Change → affected sections

| Request | Update these |
|---------|--------------|
| Add feature | Features (pick a priority) + User Story + Acceptance Criteria + Timeline phase; if P0, also Success Metrics |
| Remove feature | the same set, in reverse; if anything else depended on it, say so |
| Modify feature | Features + its story + its criteria; check Risks and Technical Requirements still hold |
| Change priority | Features buckets + the P0 checklist in exports; a P1 → P0 bump usually needs a Timeline change too |
| Move timeline | Timeline + any Risk whose mitigation depended on the schedule |
| Add risk | Risks & Mitigation only |
| Clarify a section | that section — expand, don't duplicate content elsewhere |
| Change language | regenerate the whole file in the new language; section headings stay English |

## Completion Criteria

- Change applied and consistent across Features / User Stories / Acceptance
  Criteria / Timeline.
- `validate_prd.mjs` passes.
- Exports regenerated if any existed before.
- User confirmed the diff.
