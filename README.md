# PRD Generator Skill

[![test suite](https://github.com/Vann4799/ai-prd-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/Vann4799/ai-prd-generator/actions/workflows/ci.yml)
[![release](https://img.shields.io/github/v/release/Vann4799/ai-prd-generator)](https://github.com/Vann4799/ai-prd-generator/releases)
[![node >= 18](https://img.shields.io/badge/node-%E2%89%A518-brightgreen)](package.json)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Generate a Product Requirements Document through a short conversational
interview instead of making someone write one. Works with Claude Code, Codex,
OpenCode, Hermes Agent, and Qoder CLI.

The skill interviews in rounds of at most four questions, reads an existing repo
first and pre-fills every answer the code can prove, writes the PRD from a fixed
template, validates it with a deterministic script, and exports it to a JSON task
list, a Mermaid roadmap, and a hand-off file for coding agents. The interview is
bilingual — natural Indonesian or English, whichever the user speaks.

Why it exists: a PRD written from a blank page is either a wish list or a wall of
text. This one is interviewed out of you, checked by a script, and exported into
the formats the build actually consumes.

## Install

The skill itself lives in [`skills/prd-generator/`](skills/prd-generator) —
`SKILL.md` plus its references, template and scripts.

### One command

```bash
npx github:Vann4799/ai-prd-generator --list   # see what it would touch
npx github:Vann4799/ai-prd-generator          # install into detected agents
```

It copies `skills/prd-generator/` into each agent skills folder it finds
(`~/.claude/skills`, `~/.codex/skills`, `~/.agents/skills`), refuses to overwrite
without `--force`, and prints the `hermes skills add` command instead of guessing
at Hermes. `--host claude,qoder` or `--dir <path>` narrow it down. No network, no
dependencies.

### Claude Code plugin

```
/plugin marketplace add Vann4799/ai-prd-generator
/plugin install prd-generator@vann4799-prd
```

### By hand

```bash
git clone https://github.com/Vann4799/ai-prd-generator.git /tmp/aiprd
```

Then copy `skills/prd-generator/` into whichever skills directory your agent
reads. `~` is `%USERPROFILE%` on Windows.

#### Claude Code

```bash
cp -r /tmp/aiprd/skills/prd-generator ~/.claude/skills/
```

#### Codex / OpenCode

```bash
cp -r /tmp/aiprd/skills/prd-generator ~/.codex/skills/
```

#### Hermes Agent

```bash
hermes skills add /tmp/aiprd/skills/prd-generator
```

#### Qoder CLI

```bash
cp -r /tmp/aiprd/skills/prd-generator ~/.agents/skills/
```

Restart the session (or reload skills) so the new skill is discovered.

## Use

```
Write a PRD for my grocery-store POS app
Generate a PRD for this repo and pre-fill what the code already proves
Turn this idea into requirements: a booking app for barbershops
Revise the PRD — cut P1 down to two features and re-export
```

The agent then:

1. Registers the six phases as tracked tasks, so progress is visible and no step
   gets dropped halfway through.
2. Reads the repo if one exists and shows a pre-filled draft, asking only about
   the gaps it cannot evidence.
3. Asks 16 questions in 4 rounds — basics, problem and context, features and
   scope, tech and timeline — plus a 5th round only when the project touches
   payments, personal data, integrations, or post-launch maintenance.
4. Writes `docs/PRD-<slug>.md` from the template.
5. Runs the validator and clears every `FAIL` before calling it done.
6. Gives a 3-5 sentence non-technical summary, then exports on request.

## What the validator enforces

Not vibes — exit codes. On the shipped fixtures:

```text
$ node scripts/validate_prd.mjs tests/fixtures/good/PRD.md
PASS  11/11 sections, 2 P0 features, 0 warning(s)

$ node scripts/validate_prd.mjs tests/fixtures/bad/PRD.md
FAIL  missing section: Risks
FAIL  1 unfilled placeholder(s), first on line 7
FAIL  1 leftover TODO:, first on line 40
FAIL  user story "Barcode checkout" has no "so that" clause
FAIL  P0 feature "Barcode checkout" has no acceptance criteria
FAIL  P0 feature "Offline sales queue" has no user story
WARN  non-technical summary has ~1 sentence(s), aim for 3-5
6 failed, 1 warning(s) — fix before publishing
```

Eleven required sections, no leftover `[placeholders]` or `TODO:` strings, a
non-empty P0 bucket, a user story *and* acceptance criteria for every P0 feature,
a "so that" clause in every story, and a summary a layperson can read. The
exporter refuses to run on a PRD that fails, so exports never drift from the
document.

## Layout

```
.
├── cli/index.mjs                      npx installer: detect hosts, copy the skill
├── tests/run.mjs                      47 checks: validator, exporter, shape, installer
├── tests/fixtures/{good,bad}/         a passing PRD and one that must fail
├── .claude-plugin/                    plugin.json + marketplace.json
├── .github/workflows/ci.yml           the suite on Node 18 / 20 / 22
└── skills/prd-generator/
    ├── SKILL.md                       workflow, tone, ask-user tool mapping
    ├── references/
    │   ├── interview.md               16 questions in 4 rounds, +1 conditional, pre-fill rules
    │   ├── generate.md                per-section writing rules
    │   ├── revise.md                  change → affected sections
    │   └── export.md                  export formats and script usage
    ├── assets/prd-structure.md        fill-in PRD template
    └── scripts/
        ├── lib.mjs                    shared PRD parser + completeness checks
        ├── validate_prd.mjs           deterministic PRD validation
        └── export_prd.mjs             PRD → tasks.json / roadmap.md / .cursorrules
```

`references/` is loaded only for the phase that needs it, so the whole interview
script does not sit in the context window the entire session.

## The format

Eleven numbered sections, P0/P1/P2 buckets, and stories tied to features by name
— that tie is what lets the validator prove every P0 item has a story and
criteria:

```markdown
## 4. Features
### Must-Have (P0)
- [ ] Barcode checkout

## 5. User Stories
### Barcode checkout
- **As a** cashier
- **I want** to scan an item and see the running total immediately
- **So that** a queue of five people clears in under two minutes

## 6. Acceptance Criteria
### Barcode checkout
- Given an item exists in the stock book, when the cashier scans its barcode,
  then the item and price appear on the sale screen within one second.
```

The full template is `assets/prd-structure.md`; optional sections (business
model, compliance, integrations, maintenance) are added only when the interview
earned them.

## Scripts

Both are dependency-free Node (≥18) and run on any PRD file.

```bash
node scripts/validate_prd.mjs docs/PRD-shelf.md
node scripts/export_prd.mjs docs/PRD-shelf.md --format all --out docs/
```

The exporter writes `<name>.tasks.json` (P0 first, acceptance criteria attached
per task), `<name>.roadmap.md` (Mermaid flow plus a phase table), and
`<name>.cursorrules` (context, definition of done, and what not to build this
phase). It refuses to run on a PRD that fails validation.

## Tests and CI

```bash
node tests/run.mjs      # 47 checks, no dependencies, exit 0 = green
```

The suite asserts the good fixture passes with zero warnings and both P0
features counted; that the bad fixture exits 1 and names each failure; that the
exporter writes all three targets, orders P0 work first, and refuses an invalid
PRD; that the skill keeps its own conventions (frontmatter, description length,
under 500 lines, no README inside the skill folder, every bundled file linked
from `SKILL.md`); and that the installer copies, refuses to clobber, and leaves
behind a working validator. CI runs it on Node 18, 20 and 22.

## Customising

Edit the files rather than the workflow:

- `references/interview.md` — add, drop, or reorder questions; keep each round at
  four or fewer
- `references/generate.md` + `assets/prd-structure.md` — sections and their
  rules; add a heading to `REQUIRED` in `scripts/lib.mjs` to enforce a new one
- `references/export.md` + `scripts/export_prd.mjs` — new export targets
- `cli/index.mjs` → `HOSTS` — another agent's skills directory

## Related tools & spec discovery

- [MySpec](https://myspec.dev) — web-based interactive spec discovery that
  compiles guided developer interviews into four-file specification bundles with
  an MCP server for Claude Code, Codex, and Cursor.

## License

MIT
