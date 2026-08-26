#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CATEGORIES = ['academic', 'promotion', 'work']
const MARKER_FILE = 'manifest.json'

function usage() {
  return 'Usage: stage-design-systems.mjs --destination <absolute-dir> --academic <file> --promotion <file> --work <file>'
}

function parseArgs(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (key === undefined || !key.startsWith('--') || value === undefined) throw new Error(usage())
    values.set(key.slice(2), value)
  }
  const destination = values.get('destination')
  if (destination === undefined || !path.isAbsolute(destination)) throw new Error('--destination must be absolute')
  const sources = CATEGORIES.map((category) => {
    const source = values.get(category)
    if (source === undefined || !path.isAbsolute(source)) throw new Error(`--${category} must be absolute`)
    return { category, source }
  })
  return { destination: path.resolve(destination), sources }
}

function styleMarkers(category, content) {
  const marker = /<!--\s*=+\s*套件:\s*([a-z_]+)\/([a-z0-9-]+)\s*=+\s*-->/gu
  const matches = [...content.matchAll(marker)]
  if (matches.length !== 6) throw new Error(`${category} requires 6 style markers; received ${matches.length}`)
  const slugs = matches.map((match) => {
    if (match[1] !== category || match[2] === undefined) {
      throw new Error(`${category} contains an invalid category marker`)
    }
    return match[2]
  })
  if (new Set(slugs).size !== slugs.length) throw new Error(`${category} contains duplicate style slugs`)
  if ((content.match(/## PART A\b/gu) ?? []).length !== 6 || (content.match(/## PART B\b/gu) ?? []).length !== 6) {
    throw new Error(`${category} requires 6 PART A and 6 PART B sections`)
  }
  return slugs
}

async function exists(target) {
  return stat(target).then(() => true).catch(() => false)
}

async function main() {
  const { destination, sources } = parseArgs(process.argv.slice(2))
  if (await exists(destination)) {
    throw new Error(`destination already exists: ${destination}`)
  }
  const parent = path.dirname(destination)
  await mkdir(parent, { recursive: true })
  const temporary = await mkdtemp(path.join(parent, '.ppt-design-systems-'))
  try {
    const manifestSources = []
    for (const { category, source } of sources) {
      const content = await readFile(source, 'utf8')
      const slugs = styleMarkers(category, content)
      const fileName = `${category}.md`
      await writeFile(path.join(temporary, fileName), content, { encoding: 'utf8', mode: 0o600 })
      manifestSources.push({
        category,
        fileName,
        sha256: createHash('sha256').update(content).digest('hex'),
        styles: slugs,
      })
    }
    await writeFile(path.join(temporary, MARKER_FILE), `${JSON.stringify({
      format: 'dsh-ppt-design-systems-v1',
      styleCount: 18,
      sources: manifestSources,
    }, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, destination)
    process.stdout.write(`${JSON.stringify({ destination, styleCount: 18 })}\n`)
  } catch (error) {
    await rm(temporary, { recursive: true, force: true })
    throw error
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
