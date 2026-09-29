#!/usr/bin/env node
// Repo test suite: the validator and exporter must behave as documented, and
// the skill folder must keep the shape its own conventions demand.
// Dependency-free; run with `node tests/run.mjs`. Exit 0 = everything passed.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL = join(ROOT, 'skills', 'prd-generator')
const VALIDATE = join(SKILL, 'scripts', 'validate_prd.mjs')
const EXPORT = join(SKILL, 'scripts', 'export_prd.mjs')
const GOOD = join(ROOT, 'tests', 'fixtures', 'good', 'PRD.md')
const BAD = join(ROOT, 'tests', 'fixtures', 'bad', 'PRD.md')

let failed = 0
let ran = 0
const check = (name, ok, detail = '') => {
  ran++
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail && !ok ? ` — ${detail}` : ''}`)
  if (!ok) failed++
}
const run = (script, args) => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [script, ...args], { encoding: 'utf8' }) }
  } catch (e) {
    return { code: e.status ?? -1, out: (e.stdout ?? '') + (e.stderr ?? '') }
  }
}

/* ---- validator ---- */

const good = run(VALIDATE, [GOOD])
check('a clean PRD passes', good.code === 0 && /\bPASS\b/.test(good.out), good.out)
check('and reports zero warnings', /0 warning\(s\)/.test(good.out), good.out)
check('and counts both P0 features', /2 P0 features/.test(good.out), good.out)

const bad = run(VALIDATE, [BAD])
check('a broken PRD exits non-zero', bad.code === 1, `exit ${bad.code}`)
for (const [label, needle] of [
  ['a missing section is a FAIL', /FAIL.*missing section: Risks/s],
  ['an unfilled placeholder is a FAIL', /FAIL.*placeholder/s],
  ['a leftover TODO is a FAIL', /FAIL.*TODO/s],
  ['a story without a "so that" is a FAIL', /FAIL.*so that/s],
  ['a P0 feature with no story is a FAIL', /FAIL.*no user story/s],
  ['a P0 feature with no criteria is a FAIL', /FAIL.*no acceptance criteria/s],
  ['a one-sentence summary is a WARN', /WARN.*non-technical summary/s],
])
  check(label, needle.test(bad.out), 'not reported')

/* ---- exporter ---- */

const out = mkdtempSync(join(tmpdir(), 'prd-export-'))
const exp = run(EXPORT, [GOOD, '--format', 'all', '--out', out])
const written = ['PRD.tasks.json', 'PRD.roadmap.md', 'PRD.cursorrules']
check('the exporter exits 0 on a valid PRD', exp.code === 0, exp.out)
check('and writes all three targets', written.every((f) => existsSync(join(out, f))), written.filter((f) => !existsSync(join(out, f))).join(', '))
const tasks = JSON.parse(readFileSync(join(out, 'PRD.tasks.json'), 'utf8'))
check('tasks.json carries the P0 work first', Array.isArray(tasks.tasks) && tasks.tasks.length >= 2 && /barcode checkout/i.test(tasks.tasks[0].title ?? tasks.tasks[0].name ?? ''), JSON.stringify(tasks).slice(0, 120))
check('the roadmap draws the phases as a flow', /flowchart LR/.test(readFileSync(join(out, 'PRD.roadmap.md'), 'utf8')) && /Phase 1/.test(readFileSync(join(out, 'PRD.roadmap.md'), 'utf8')))
check('the hand-off names the deferred scope', /multi-store sync/i.test(readFileSync(join(out, 'PRD.cursorrules'), 'utf8')))
check('the exporter refuses a PRD that fails validation', run(EXPORT, [BAD, '--out', out]).code === 1)
rmSync(out, { recursive: true, force: true })

/* ---- skill shape (the conventions this repo was built to) ---- */

const skillMd = readFileSync(join(SKILL, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n')
const fm = skillMd.match(/^---\n([\s\S]*?)\n---/)
check('SKILL.md has frontmatter', !!fm)
check('frontmatter names the skill', /^name: prd-generator$/m.test(fm?.[1] ?? ''))
const desc = (fm?.[1] ?? '').match(/^description: >-\n([\s\S]*?)^\w/m)?.[1] ?? ''
check('description is a single trigger paragraph under 1024 chars', desc.length > 80 && desc.length <= 1024, `${desc.length} chars`)
check('body stays under 500 lines', skillMd.split('\n').length < 500)
check('no README or CHANGELOG inside the skill folder',
  !readdirSync(SKILL).some((f) => /^(README|CHANGELOG|CONTRIBUTING)\.md$/i.test(f)))

const mentioned = new Set([...skillMd.matchAll(/(?:references|assets|scripts)\/[\w.-]+/g)].map((m) => m[0]))
for (const dir of ['references', 'assets', 'scripts'])
  for (const f of readdirSync(join(SKILL, dir)))
    check(`${dir}/${f} is referenced from SKILL.md`, mentioned.has(`${dir}/${f}`))

/* ---- repo shape ---- */

for (const f of ['README.md', 'LICENSE', 'package.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', 'cli/index.mjs'])
  check(`${f} exists`, existsSync(join(ROOT, f)))
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
check('the npm package declares the installer as its bin', pkg.bin?.['prd-generator'] === 'cli/index.mjs')
check('and ships the skill folder it installs', (pkg.files ?? []).includes('skills'))
const plugin = JSON.parse(readFileSync(join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'))
check('the plugin manifest points at the skill folder', plugin.skills?.includes('./skills/'))
const version = skillMd.match(/^version:\s*([\d.]+)$/m)?.[1]
check(`SKILL.md, package.json and plugin.json agree on version (${version})`,
  version === plugin.version && version === pkg.version)

/* ---- installer ---- */

const CLI = join(ROOT, 'cli', 'index.mjs')
const listed = run(CLI, ['--list'])
check('the installer lists every host',
  listed.code === 0 && ['Claude Code', 'Codex / OpenCode', 'Qoder CLI', 'Hermes Agent'].every((l) => listed.out.includes(l)), listed.out)
check('and names the Hermes command instead of copying it', /hermes skills add/.test(listed.out))

const sandbox = mkdtempSync(join(tmpdir(), 'prd-host-'))
const first = run(CLI, ['--dir', sandbox])
check('the installer copies the skill into a host directory',
  first.code === 0 && existsSync(join(sandbox, 'prd-generator', 'SKILL.md')), first.out)
check('including the reference files', existsSync(join(sandbox, 'prd-generator', 'references', 'interview.md')))
const second = run(CLI, ['--dir', sandbox])
check('a second run refuses to clobber without --force', /already installed/.test(second.out), second.out)
check('--force overwrites', run(CLI, ['--dir', sandbox, '--force']).code === 0)
check('the installed copy still validates its own fixture',
  run(join(sandbox, 'prd-generator', 'scripts', 'validate_prd.mjs'), [GOOD]).code === 0)
rmSync(sandbox, { recursive: true, force: true })

console.log(failed ? `\n${failed} of ${ran} check(s) failed` : `\n${ran} checks passed`)
process.exit(failed ? 1 : 0)
