import { readFileSync } from 'node:fs'

const REQUIRED = [
  ['Project Overview', /project overview|ringkasan project/i],
  ['Problem Statement', /problem statement|pernyataan masalah/i],
  ['Target Users', /target users|pengguna sasaran/i],
  ['Features', /features|fitur/i],
  ['User Stories', /user stories|cerita pengguna/i],
  ['Acceptance Criteria', /acceptance criteria|kriteria penerimaan/i],
  ['Technical Requirements', /technical requirements|kebutuhan teknis/i],
  ['Success Metrics', /success metrics|metrik sukses|\bkpi\b/i],
  ['Timeline', /timeline|jadwal|milestone/i],
  ['Risks', /risks|risiko/i],
  ['Non-Technical Summary', /non-technical summary|ringkasan non-teknis/i],
]

const CHECKBOX = /^\s*[-*]\s*\[[ xX]\]\s*(.+?)\s*$/

export function readPrd(file) {
  return parsePrd(readFileSync(file, 'utf8'), file)
}

export function parsePrd(raw, file = '(input)') {
  const lines = raw.split(/\r?\n/)
  let title = ''
  const sections = []
  const blocks = []
  let current = null
  let block = null
  let fence = false

  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence
    if (fence) return

    const h1 = line.match(/^#\s+(.+)$/)
    if (h1 && !title) {
      title = h1[1].trim()
      return
    }
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) {
      current = { heading: h2[1].trim(), level: 2, line: i + 1, body: [], blocks: [] }
      sections.push(current)
      block = null
      return
    }
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3 && current) {
      block = { heading: h3[1].trim(), line: i + 1, body: [] }
      current.blocks.push(block)
      blocks.push(block)
      return
    }
    if (current) (block ? block.body : current.body).push(line)
  })

  const found = new Map()
  const used = new Set()
  for (const [key, re] of REQUIRED) {
    const hit = sections.find((s) => !used.has(s) && re.test(s.heading))
    if (hit) {
      found.set(key, hit)
      used.add(hit)
    }
  }

  return { file, raw, lines, title, sections, found }
}

const BULLET = /^\s*[-*]\s+(?:\[[ xX]\]\s*)?(.+?)\s*$/

export function featureBuckets(section) {
  const buckets = section.blocks.map((b) => ({
    label: b.heading,
    items: b.body.map((l) => l.match(CHECKBOX)?.[1]).filter(Boolean),
    all: b.body.map((l) => l.match(BULLET)?.[1]).filter(Boolean),
  }))
  const loose = section.body.map((l) => l.match(CHECKBOX)?.[1]).filter(Boolean)
  if (loose.length) buckets.unshift({ label: 'Unbucketed', items: loose, all: loose })
  return buckets
}

export function priorityOf(label) {
  if (/\bp0\b|must[-\s]?have|wajib/i.test(label)) return 'P0'
  if (/\bp1\b|should[-\s]?have|seharusnya/i.test(label)) return 'P1'
  if (/\bp2\b|nice[-\s]?have/i.test(label)) return 'P2'
  return null
}

const clean = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const sameTopic = (a, b) => {
  const x = clean(a)
  const y = clean(b)
  return x && y && (x.includes(y) || y.includes(x))
}

const text = (unit) => [unit.heading, ...unit.body].join('\n')

export function validate(prd) {
  const fails = []
  const warns = []

  if (!prd.title) fails.push('no H1 title found')

  for (const [key] of REQUIRED) {
    const sec = prd.found.get(key)
    if (!sec) fails.push(`missing section: ${key}`)
    else if (!sec.body.join('').trim() && !sec.blocks.length)
      fails.push(`section is empty: ${key}`)
  }

  const placeholders = []
  let fence = false
  prd.lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence
    if (fence) return
    for (const m of line.matchAll(/\[([^\]\n]{1,60})\](?!\()/g)) {
      const v = m[1].trim()
      if (v && !/^[xX]$/.test(v) && !/^\s+$/.test(v)) placeholders.push(i + 1)
    }
  })
  if (placeholders.length)
    fails.push(
      `${placeholders.length} unfilled placeholder(s), first on line ${placeholders[0]}`,
    )

  const todos = prd.lines
    .map((l, i) => (/TODO:/.test(l) ? i + 1 : 0))
    .filter(Boolean)
  if (todos.length) fails.push(`${todos.length} leftover TODO:, first on line ${todos[0]}`)

  const features = prd.found.get('Features')
  let p0 = []
  if (features) {
    const buckets = featureBuckets(features)
    p0 = buckets.filter((b) => priorityOf(b.label) === 'P0').flatMap((b) => b.items)
    if (!p0.length) fails.push('no Must-Have (P0) features listed')
  }

  const stories = prd.found.get('User Stories')
  if (stories) {
    for (const b of stories.blocks) {
      const t = text(b)
      if (!/so that|sehingga|agar\b/i.test(t))
        fails.push(`user story "${b.heading}" has no "so that" clause`)
    }
    const critSec = prd.found.get('Acceptance Criteria')
    const critBlocks = critSec?.blocks ?? []
    for (const f of p0) {
      const story = stories.blocks.find((b) => sameTopic(b.heading, f))
      if (!story) {
        fails.push(`P0 feature "${f}" has no user story`)
        continue
      }
      const hasCriteria =
        critBlocks.some((b) => sameTopic(b.heading, f)) ||
        /given|diberikan/i.test(text(story)) ||
        critBlocks.some((b) => sameTopic(b.heading, story.heading))
      if (!hasCriteria) fails.push(`P0 feature "${f}" has no acceptance criteria`)
    }
    if (critSec && !critSec.blocks.length && !/given|diberikan/i.test(critSec.body.join('\n')))
      fails.push('Acceptance Criteria section has no Given/When/Then entries')
  }

  const summary = prd.found.get('Non-Technical Summary')
  if (summary) {
    const body = summary.body.join(' ').trim()
    const n = (body.match(/[.!?](\s|$)/g) ?? []).length
    if (!body) fails.push('non-technical summary is empty')
    else if (n < 3) warns.push(`non-technical summary has ~${n} sentence(s), aim for 3-5`)
    else if (n > 7) warns.push(`non-technical summary is long (${n} sentences), trim to 3-5`)
  }

  return { fails, warns, p0Count: p0.length, sections: prd.found.size }
}

export function report(prd, res) {
  const out = [`PRD: ${prd.file}`, `title: ${prd.title || '(none)'}`]
  for (const f of res.fails) out.push(`FAIL  ${f}`)
  for (const w of res.warns) out.push(`WARN  ${w}`)
  out.push(
    res.fails.length
      ? `${res.fails.length} failed, ${res.warns.length} warning(s) — fix before publishing`
      : `PASS  ${res.sections}/11 sections, ${res.p0Count} P0 features, ${res.warns.length} warning(s)`,
  )
  return out.join('\n')
}
