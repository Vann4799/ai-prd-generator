# PRD Generator Skill

Generate a comprehensive Product Requirements Document (PRD) through a warm,
conversational interview. Works with Qoder CLI, Claude Code, Codex, OpenCode,
and Hermes Agent.

The skill interviews in short rounds instead of making you write a spec, mines
an existing repo to pre-fill answers it can prove, then exports the PRD to
Markdown, a JSON task list, a Mermaid roadmap, and a hand-off prompt for coding
agents.

## Install

The skill lives in `skills/prd-generator/`. Point your agent at that folder:

```bash
git clone https://github.com/Vann4799/ai-prd-generator.git /tmp/aiprd

# Qoder CLI / Claude Code
cp -r /tmp/aiprd/skills/prd-generator ~/.agents/skills/   # or ~/.claude/skills/

# Codex / OpenCode
cp -r /tmp/aiprd/skills/prd-generator ~/.codex/skills/

# Hermes Agent
hermes skills add /tmp/aiprd/skills/prd-generator
```

Restart the session (or reload skills) so the new skill is discovered.

## Use

```
Buat PRD untuk aplikasi kasir toko kelontong
Generate a PRD for my expense tracking app
Buat PRD buat D:\ALL PROJECT\Venesx
```

The agent then:

1. Registers the six phases as tracked tasks, so progress is visible and no
   step gets dropped halfway through.
2. Reads the repo if one exists and shows you a pre-filled draft.
3. Asks the gaps in 4 rounds of at most 4 questions — plus a 5th round only
   when the project touches payments, personal data, integrations, or
   post-launch maintenance.
4. Writes `docs/PRD-<slug>.md` from the template.
5. Runs the validator and fixes every `FAIL` before calling it done.
6. Gives a 3-5 sentence non-technical summary, then exports on request.

## Layout

```
skills/prd-generator/
├── SKILL.md                       workflow, tone, ask-user tool mapping
├── references/
│   ├── interview.md               16 questions in 4 rounds, +1 conditional, pre-fill table
│   ├── generate.md                per-section writing rules
│   ├── revise.md                  change → affected sections
│   └── export.md                  export formats and script usage
├── assets/
│   └── prd-structure.md           fill-in PRD template
└── scripts/
    ├── lib.mjs                    shared PRD parser + completeness checks
    ├── validate_prd.mjs           deterministic PRD validation
    └── export_prd.mjs             PRD → tasks.json / roadmap.md / .cursorrules
```

`references/` is loaded only for the phase that needs it, so the whole interview
script does not sit in the context window the entire session.

## Scripts

Both are dependency-free Node (≥18) and can be run directly on any PRD file.

```bash
node scripts/validate_prd.mjs docs/PRD-kasirtoko.md
node scripts/export_prd.mjs docs/PRD-kasirtoko.md --format all --out docs/
```

The validator checks all 11 required sections, leftover `[placeholders]` and
`TODO:` strings, a non-empty P0 list, a user story plus acceptance criteria for
every P0 feature, a "so that" clause per story, and summary length. It exits
non-zero on any failure, so it drops cleanly into CI or a pre-commit hook.

The exporter refuses to run on a PRD that fails validation — exports are always
derived from the document, never maintained by hand beside it.

## Customising

Edit the files rather than the workflow:

- `references/interview.md` — add, drop, or reorder questions; keep the round
  size at 4 or fewer
- `references/generate.md` + `assets/prd-structure.md` — sections and their
  rules; add a heading to `REQUIRED` in `scripts/lib.mjs` if you want it enforced
- `references/export.md` + `scripts/export_prd.mjs` — new export targets

## Related tools & spec discovery

- [MySpec](https://myspec.dev) — Web-based interactive spec discovery platform that compiles guided developer interviews into 4-file specification bundles (`constitution.md`, `requirements.md`, `solution.md`, `tasks.md`) with Model Context Protocol (MCP) server integration for Claude Code, Codex, and Cursor.

## License

MIT
