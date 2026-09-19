#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { readPrd, validate, report, featureBuckets, priorityOf, sameTopic } from './lib.mjs'

const FORMATS = ['tasks', 'roadmap', 'cursorrules', 'all']

function args(argv) {
  const out = { file: null, format: 'all', out: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--format' || a === '-f') out.format = argv[++i]
    else if (a === '--out' || a === '-o') out.out = argv[++i]
    else if (a === '--help' || a === '-h') out.help = true
    else if (!out.file) out.file = a
  }
  return out
}

const sec = (prd, key) => prd.found.get(key)
const bodyText = (unit) =>
  unit
    .body.join('\n')
    .replace(/^[-*]\s+/gm, '')
    .trim()

function phases(prd) {
  const t = sec(prd, 'Timeline')
  if (!t) return []
  return t.body
    .map((l) => l.match(/^\s*[-*]\s+\*\*(.+?)\*\*\s*(?:\(([^)]*)\))?\s*:?\s*(.*)$/))
    .filter(Boolean)
    .map((m) => ({ label: m[1].trim(), window: (m[2] ?? '').trim(), deliverables: m[3].trim() }))
    .filter((p) => p.label)
}

function criteriaFor(prd, title) {
  const a = sec(prd, 'Acceptance Criteria')
  if (!a) return []
  const block = a.blocks.find((b) => sameTopic(b.heading, title))
  if (!block) return []
  return block.body
    .map((l) => l.replace(/^\s*[-*]\s+/, '').trim())
    .filter((l) => /given|when|then|diberikan|ketika|maka/i.test(l))
}

function tasksDoc(prd) {
  const f = sec(prd, 'Features')
  const tasks = []
  for (const b of featureBuckets(f)) {
    const priority = priorityOf(b.label)
    if (!priority) continue
    b.items.forEach((title, i) => {
      tasks.push({
        id: `${priority}-${i + 1}`,
        title,
        priority,
        acceptanceCriteria: criteriaFor(prd, title),
      })
    })
  }
  return {
    project: prd.title,
    source: prd.file,
    generated: new Date().toISOString().slice(0, 10),
    tasks,
  }
}

const mermaidSafe = (s) => s.replace(/["`]/g, "'").replace(/&/g, 'and').replace(/\|/g, '/')

function roadmapDoc(prd, outName) {
  const ps = phases(prd)
  const lines = [`# ${prd.title} — Roadmap`, '', `Source: ${outName}`, '']
  if (ps.length) {
    lines.push('```mermaid', 'flowchart LR')
    ps.forEach((p, i) => {
      const detail = p.deliverables || p.window
      const label = mermaidSafe(p.label) + (detail ? `<br/>${mermaidSafe(detail)}` : '')
      lines.push(`  P${i + 1}["${label}"]`)
    })
    for (let i = 0; i < ps.length - 1; i++) lines.push(`  P${i + 1} --> P${i + 2}`)
    lines.push('```', '', '| Phase | Window | Deliverables |', '|-------|--------|--------------|')
    for (const p of ps) lines.push(`| ${p.label} | ${p.window || '—'} | ${p.deliverables || '—'} |`)
  } else {
    lines.push('_No parseable `- **Phase** (window): deliverables` lines in the Timeline section._')
  }
  return lines.join('\n') + '\n'
}

function cursorrulesDoc(prd, rel) {
  const f = sec(prd, 'Features')
  const buckets = featureBuckets(f)
  const p0 = buckets.filter((b) => priorityOf(b.label) === 'P0').flatMap((b) => b.items)
  const deferred = buckets
    .filter((b) => /out of scope|di luar|jangan|tunda/i.test(b.label))
    .flatMap((b) => b.all)
  const tech = sec(prd, 'Technical Requirements')
  const problem = sec(prd, 'Problem Statement')

  const out = [
    `# ${prd.title} — build rules`,
    '',
    `Source of truth: ${rel}. Do not widen scope beyond the P0 list below.`,
    '',
    '## Problem',
    problem ? bodyText(problem).split('\n')[0] : '_missing_',
    '',
    '## Stack & constraints',
  ]
  if (tech) out.push(...bodyText(tech).split('\n').filter(Boolean).slice(0, 8))
  else out.push('_missing_')
  out.push('', '## Definition of done (P0)')
  out.push(...p0.map((t) => `- [ ] ${t}`))
  if (deferred.length) {
    out.push('', '## Do not build in this phase')
    out.push(...deferred.slice(0, 10).map((t) => `- ${t}`))
  }
  return out.slice(0, 60).join('\n') + '\n'
}

const a = args(process.argv.slice(2))

if (a.help) {
  console.log(`usage: node export_prd.mjs <PRD.md> [--format ${FORMATS.join('|')}] [--out <dir>]`)
  process.exit(0)
}
if (!a.file) {
  console.log(`usage: node export_prd.mjs <PRD.md> [--format ${FORMATS.join('|')}] [--out <dir>]`)
  process.exit(1)
}
if (!FORMATS.includes(a.format)) {
  console.log(`FAIL  unknown --format "${a.format}" (want ${FORMATS.join('|')})`)
  process.exit(1)
}
if (!existsSync(a.file)) {
  console.log(`FAIL  file not found: ${a.file}`)
  process.exit(1)
}

const prd = readPrd(a.file)
const res = validate(prd)
if (res.fails.length) {
  console.log(report(prd, res))
  console.log('cannot export a PRD that fails validation — fix the PRD first')
  process.exit(1)
}

const base = prd.file.split(/[\\/]/).pop().replace(/\.md$/i, '')
const dir = a.out ?? dirname(prd.file)
if (a.out && !existsSync(dir)) mkdirSync(dir, { recursive: true })

const wanted = a.format === 'all' ? ['tasks', 'roadmap', 'cursorrules'] : [a.format]
const wrote = []

for (const fmt of wanted) {
  const target = join(
    dir,
    fmt === 'tasks' ? `${base}.tasks.json` : fmt === 'roadmap' ? `${base}.roadmap.md` : `${base}.cursorrules`,
  )
  if (fmt === 'tasks') {
    const doc = tasksDoc(prd)
    writeFileSync(target, JSON.stringify(doc, null, 2) + '\n')
    wrote.push(`wrote ${target} (${doc.tasks.length} tasks)`)
  } else if (fmt === 'roadmap') {
    const doc = roadmapDoc(prd, `${base}.md`)
    writeFileSync(target, doc)
    wrote.push(`wrote ${target} (${phases(prd).length} phases)`)
  } else {
    const doc = cursorrulesDoc(prd, prd.file)
    writeFileSync(target, doc)
    const n = doc.split('\n').filter((l) => l.startsWith('- [ ]')).length
    wrote.push(`wrote ${target} (${n} P0 items)`)
  }
}

console.log(wrote.join('\n'))
