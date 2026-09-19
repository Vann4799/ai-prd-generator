# Export Reference

Derive every export from the PRD file — never keep a second hand-written copy
of the task list, or the two drift apart.

## Formats

| Format | Produced by | Contents |
|--------|-------------|----------|
| Markdown PRD | the file itself | full document, shareable as-is |
| Task list JSON | `export_prd.mjs --format tasks` | `<basename>.tasks.json`: project, source, generated date, and tasks with `id`, `title`, `priority`, `acceptanceCriteria` |
| Roadmap | `export_prd.mjs --format roadmap` | `<basename>.roadmap.md`: Mermaid `flowchart LR` over the Timeline phases plus a phase / window / deliverables table |
| Hand-off prompt | `export_prd.mjs --format cursorrules` | `<basename>.cursorrules`: problem, stack constraints, P0 definition of done, out-of-scope prohibitions. Works verbatim as a Cursor rule or a Claude/Codex system prompt |

`<basename>` is the PRD filename without `.md`, so `docs/PRD-kasirtoko.md`
yields `PRD-kasirtoko.tasks.json` and friends.

## Usage

```bash
node scripts/export_prd.mjs <path-to-PRD.md> --format all --out <dir>
```

Omit `--out` to write beside the PRD. Valid `--format` values: `tasks`,
`roadmap`, `cursorrules`, `all` (default `all`). The script prints one
`wrote <file> (<n> …)` line per artifact and a non-zero exit code if the PRD
fails validation first — fix the PRD, don't edit the exports.

## Rules for hand-off prompts

When generating a coding-tool prompt (cursorrules / system prompt):

- Lead with the problem statement, not the feature list.
- State out-of-scope items as explicit prohibitions ("Do not build
  e-commerce in this phase").
- Keep the P0 checklist as the definition of done.
- Cap at ~60 lines; the PRD stays the source of truth, linked by path.
