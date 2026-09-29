#!/usr/bin/env node
// Installer for the prd-generator skill. Copies the skill folder into
// whichever agent directories exist on this machine — nothing else, no network.
//
//   npx github:Vann4799/ai-prd-generator            # detect hosts, install
//   npx github:Vann4799/ai-prd-generator --list     # show what it would do
//   npx github:Vann4799/ai-prd-generator --host claude,qoder --force
//   npx github:Vann4799/ai-prd-generator --dir /path/to/agents/skills
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, lstatSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_NAME = 'prd-generator'
const SOURCE = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', SKILL_NAME)

/** `dir` is relative to the home folder; `command` hosts are installed by their own CLI. */
const HOSTS = [
  { id: 'claude', label: 'Claude Code', dir: '.claude/skills' },
  { id: 'codex', label: 'Codex / OpenCode', dir: '.codex/skills' },
  { id: 'qoder', label: 'Qoder CLI', dir: '.agents/skills' },
  { id: 'hermes', label: 'Hermes Agent', command: `hermes skills add "${SOURCE}"` },
]

const USAGE = `usage: prd-generator [--host a,b|all] [--dir <path>] [--force] [--list]
       prd-generator --help

hosts: ${HOSTS.map((h) => h.id).join(', ')}
`

function args(argv) {
  const out = { hosts: [], dirs: [], force: false, list: false, help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') out.help = true
    else if (a === '--force') out.force = true
    else if (a === '--list' || a === '-l') out.list = true
    else if (a === '--host') out.hosts.push(...String(argv[++i]).split(','))
    else if (a === '--dir') out.dirs.push(argv[++i])
    else {
      console.log(`unknown argument: ${a}\n\n${USAGE}`)
      process.exit(2)
    }
  }
  return out
}

const copyTree = (from, to) => {
  mkdirSync(to, { recursive: true })
  for (const entry of readdirSync(from)) {
    const src = join(from, entry)
    if (statSync(src).isDirectory()) copyTree(src, join(to, entry))
    else copyFileSync(src, join(to, entry))
  }
}

const exists = (p) => existsSync(p) && lstatSync(p).isDirectory()

function targets(a) {
  // An explicit --dir is the whole answer: never also write into a detected
  // home directory, or a scripted install could land in a real agent folder.
  if (a.dirs.length)
    return { copies: a.dirs.map((d) => ({ label: '--dir', to: join(d, SKILL_NAME) })), commands: [], unknown: [] }
  const wanted = a.hosts.includes('all') ? HOSTS.map((h) => h.id) : a.hosts
  const picked = wanted.length ? HOSTS.filter((h) => wanted.includes(h.id)) : HOSTS.filter((h) => h.dir && exists(join(homedir(), dirname(h.dir))))
  return {
    copies: picked.filter((h) => h.dir).map((h) => ({ label: h.label, to: join(homedir(), h.dir, SKILL_NAME) })),
    commands: picked.filter((h) => h.command).map((h) => ({ label: h.label, command: h.command })),
    unknown: wanted.filter((id) => !HOSTS.some((h) => h.id === id)),
  }
}

const a = args(process.argv.slice(2))
if (a.help) {
  console.log(USAGE)
  process.exit(0)
}
if (!exists(SOURCE)) {
  console.log(`FAIL  skill folder not found next to the installer:\n      ${SOURCE}`)
  process.exit(1)
}

const t = targets(a)
for (const id of t.unknown) console.log(`WARN  no such host "${id}" — known: ${HOSTS.map((h) => h.id).join(', ')}`)

if (a.list || !t.copies.length) {
  console.log(`source: ${SOURCE}\n`)
  for (const h of HOSTS)
    console.log(`${h.dir ? ' copy  ' : ' manual'}  ${h.label.padEnd(18)} ${h.dir ?? h.command}`)
  if (!a.list)
    console.log('\nNo agent directory detected. Install one explicitly:\n  prd-generator --host claude\n  prd-generator --dir <path-to-your-skills-folder>')
  process.exit(a.list || t.copies.length ? 0 : 1)
}

let installed = 0
for (const { label, to } of t.copies) {
  if (exists(to) && !a.force) {
    console.log(`skip   ${label.padEnd(18)} ${to}\n       already installed — --force to overwrite`)
    continue
  }
  copyTree(SOURCE, to)
  const ok = existsSync(join(to, 'SKILL.md'))
  console.log(`${ok ? 'ok     ' : 'FAIL   '}${label.padEnd(18)} ${relative(homedir(), to)}`)
  if (ok) installed++
}
for (const { label, command } of t.commands)
  console.log(`manual  ${label.padEnd(18)} run: ${command}`)

console.log(
  installed
    ? `\n${installed} host(s) updated. Restart the session or reload skills, then ask for a PRD.`
    : '\nNothing installed.',
)
process.exit(installed || t.copies.length === 0 ? 0 : 1)
