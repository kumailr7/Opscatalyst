// Fetches the top-viewed pages from Matomo (last 30 days) at build time and
// writes them to quartz/static/most-read.json, which MostRead.tsx reads
// synchronously during the Quartz build to render a static (no client JS,
// no exposed token) "Most Read" list. Never fails the build: on any error
// (missing token, network issue, Matomo down) it writes an empty list.

import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"

const OUT_PATH = path.join(process.cwd(), "quartz", "static", "most-read.json")
const MATOMO_HOST = "https://analytics.devops-dojo.ninja"
const SITE_ID = "1"
const LIMIT = 5

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function urlToSlug(rawUrl) {
  try {
    const { pathname } = new URL(rawUrl)
    let slug = decodeURIComponent(pathname).replace(/^\/+/, "").replace(/\/+$/, "")
    slug = slug.replace(/\.html?$/, "")
    return slug
  } catch {
    return null
  }
}

function isContentSlug(slug) {
  if (!slug) return false
  if (slug === "" || slug === "index" || slug === "404" || slug === "about") return false
  if (slug.startsWith("tags") || slug.startsWith("static")) return false
  return true
}

async function main() {
  const token = process.env.MATOMO_API_TOKEN
  if (!token) {
    console.warn("[fetch-most-read] MATOMO_API_TOKEN not set, skipping (empty result)")
    await writeResult([])
    return
  }

  const today = new Date()
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const query = new URLSearchParams({
    module: "API",
    method: "Actions.getPageUrls",
    idSite: SITE_ID,
    period: "range",
    date: `${isoDate(monthAgo)},${isoDate(today)}`,
    format: "JSON",
    flat: "1",
  })

  // Matomo rejects token_auth passed via URL query string for security;
  // it must be sent in the POST body instead.
  const body = new URLSearchParams({ token_auth: token })

  try {
    const res = await fetch(`${MATOMO_HOST}/index.php?${query.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      throw new Error(`Matomo API returned HTTP ${res.status}`)
    }
    const rows = await res.json()
    if (!Array.isArray(rows)) {
      throw new Error(`Unexpected Matomo response: ${JSON.stringify(rows).slice(0, 200)}`)
    }

    const bySlug = new Map()
    for (const row of rows) {
      const slug = urlToSlug(row.url)
      if (!isContentSlug(slug)) continue
      const visits = Number(row.nb_visits ?? 0)
      bySlug.set(slug, (bySlug.get(slug) ?? 0) + visits)
    }

    const top = [...bySlug.entries()]
      .map(([slug, visits]) => ({ slug, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, LIMIT)

    await writeResult(top)
    console.log(`[fetch-most-read] wrote ${top.length} entries`)
  } catch (err) {
    console.warn(`[fetch-most-read] failed, writing empty result: ${err.message}`)
    await writeResult([])
  }
}

async function writeResult(data) {
  await mkdir(path.dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(data, null, 2))
}

main()
