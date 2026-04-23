#!/usr/bin/env node
/**
 * fetch-stock-pack.mjs
 *
 * Downloads a curated pack of Unsplash photos based on scripts/stock-queries.json
 * and writes them + a manifest to public/stock/.
 *
 * Run:
 *   UNSPLASH_ACCESS_KEY=your_key node scripts/fetch-stock-pack.mjs
 *
 * Idempotent: skips photo IDs already present in the manifest. Respects
 * Unsplash's licensing by recording photographer attribution for each image.
 *
 * Rate limiting: basic 1s delay between API calls (well under demo 50/hr limit).
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const queriesPath = path.join(__dirname, 'stock-queries.json')
const outDir      = path.join(repoRoot, 'public', 'stock')
const manifestPath = path.join(outDir, 'manifest.json')

const key = process.env.UNSPLASH_ACCESS_KEY
if (!key) {
  console.error('✘ UNSPLASH_ACCESS_KEY is not set.')
  console.error('  Get a free dev key at https://unsplash.com/developers and run:')
  console.error('    UNSPLASH_ACCESS_KEY=xxx node scripts/fetch-stock-pack.mjs')
  process.exit(1)
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function readJson(p, fallback) {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'))
  } catch {
    return fallback
  }
}

async function writeJson(p, obj) {
  await fs.writeFile(p, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

async function downloadImage(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(dest, buf)
}

async function main() {
  await fs.mkdir(outDir, { recursive: true })

  const queriesFile = await readJson(queriesPath, { queries: [] })
  const manifest = await readJson(manifestPath, { images: [] })
  const seen = new Set(manifest.images.map(i => i.id))

  for (const { q, count } of queriesFile.queries) {
    console.log(`▶ ${q} (${count})`)
    const url = `https://api.unsplash.com/search/photos?per_page=${count}&orientation=landscape&query=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: {
        'Accept-Version': 'v1',
        Authorization: `Client-ID ${key}`,
      },
    })
    if (!res.ok) {
      console.error(`  ✘ API error ${res.status} for "${q}"`)
      await sleep(1000)
      continue
    }
    const data = await res.json()

    for (const photo of data.results ?? []) {
      if (seen.has(photo.id)) continue
      const ext = 'jpg'
      const filename = `${slugify(q)}-${photo.id}.${ext}`
      const dest = path.join(outDir, filename)
      try {
        await downloadImage(photo.urls.regular, dest)
        manifest.images.push({
          id: photo.id,
          filename,
          query: q,
          photographer: photo.user?.name ?? null,
          photographer_url: photo.user?.links?.html ?? null,
          source: 'unsplash',
          source_url: photo.links?.html ?? null,
          width: photo.width,
          height: photo.height,
          alt: photo.alt_description || photo.description || q,
        })
        seen.add(photo.id)
        console.log(`  ✓ ${filename}`)
      } catch (err) {
        console.error(`  ✘ ${filename}: ${err.message}`)
      }
      await sleep(150)
    }
    await sleep(1000)
  }

  await writeJson(manifestPath, manifest)
  console.log(`\n✓ Manifest written: ${manifest.images.length} total images.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
