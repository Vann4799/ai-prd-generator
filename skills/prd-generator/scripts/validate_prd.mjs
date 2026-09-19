#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readPrd, validate, report } from './lib.mjs'

const file = process.argv[2]

if (!file || file === '--help' || file === '-h') {
  console.log('usage: node validate_prd.mjs <PRD.md>\nexit 0 when the PRD has no FAIL lines')
  process.exit(file ? 0 : 1)
}

if (!existsSync(file)) {
  console.log(`FAIL  file not found: ${file}`)
  process.exit(1)
}

const prd = readPrd(file)
const res = validate(prd)
console.log(report(prd, res))
process.exit(res.fails.length ? 1 : 0)
