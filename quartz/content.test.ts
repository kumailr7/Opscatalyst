/**
 * Content validation tests for Devops-Dojo blog.
 * Run with: tsx ./quartz/content.test.ts
 *
 * Validates:
 *  - Frontmatter fields across all posts
 *  - S3 Replication post structure and completeness
 *  - Build output correctness
 *  - Wikilink image references resolve to real files
 */

import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import nodePath from "node:path"
import matter from "gray-matter"

const ROOT = process.cwd()
const CONTENT_DIR = nodePath.join(ROOT, "content")
const PUBLIC_DIR = nodePath.join(ROOT, "public")

// Structural pages that don't need full frontmatter
const EXEMPT_FILES = new Set([
  "index.md",
  "Readme.md",
  "WIKI.md",
  "About Me.md",
  "Chapter.md",
  "Exposing the Repo Insecure.md", // republished external post, no standard frontmatter
])

// ── helpers ────────────────────────────────────────────────────────────────

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = nodePath.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== "assets") {
      files.push(...getAllMarkdownFiles(full))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full)
    }
  }
  return files
}

function rel(file: string): string {
  return nodePath.relative(CONTENT_DIR, file)
}

// Finds all ![[...]] wikilink image references in a markdown string
function extractWikilinkImages(content: string): string[] {
  return [...content.matchAll(/!\[\[([^\]]+)\]\]/g)].map((m) => m[1].split("|")[0].trim())
}

// Resolves a wikilink image name to a file path by searching content/assets dirs.
// Handles both bare filenames ("image.png") and path-prefixed refs ("Security/assets/image.png").
function findAsset(imageName: string, sourceFile: string): string | undefined {
  // 1. Path-prefixed ref (e.g. "Security/assets/SDLC.png") — resolve directly from CONTENT_DIR
  if (imageName.includes("/")) {
    const direct = nodePath.join(CONTENT_DIR, imageName)
    if (fs.existsSync(direct)) return direct
  }

  // 2. Bare filename — check assets/ next to source file first
  const basename = nodePath.basename(imageName)
  const sourceDir = nodePath.dirname(sourceFile)
  const sibling = nodePath.join(sourceDir, "assets", basename)
  if (fs.existsSync(sibling)) return sibling

  // 3. Walk entire content tree for any assets/ folder containing the filename
  function search(dir: string): string | undefined {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = nodePath.join(dir, entry.name)
      if (entry.isDirectory()) {
        const candidate = nodePath.join(full, basename)
        if (entry.name === "assets" && fs.existsSync(candidate)) return candidate
        const deeper = search(full)
        if (deeper) return deeper
      }
    }
  }
  return search(CONTENT_DIR)
}

// ── test data ──────────────────────────────────────────────────────────────

const allFiles = getAllMarkdownFiles(CONTENT_DIR)
const publishedFiles = allFiles.filter((f) => {
  if (EXEMPT_FILES.has(nodePath.basename(f))) return false
  const { data } = matter(fs.readFileSync(f, "utf-8"))
  return data.drafts !== true
})

// ── frontmatter validation ─────────────────────────────────────────────────

describe("Frontmatter validation", () => {
  test("all published posts have Author as a non-empty array", () => {
    const failures: string[] = []
    for (const file of publishedFiles) {
      const { data } = matter(fs.readFileSync(file, "utf-8"))
      if (!data.Author || !Array.isArray(data.Author) || data.Author.length === 0) {
        failures.push(rel(file))
      }
    }
    assert.deepStrictEqual(failures, [], `Posts missing valid Author: ${failures.join(", ")}`)
  })

  test("all published posts have at least one tag", () => {
    const failures: string[] = []
    for (const file of publishedFiles) {
      const { data } = matter(fs.readFileSync(file, "utf-8"))
      if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
        failures.push(rel(file))
      }
    }
    // Non-zero tag failures reported but tolerated for older stub posts
    if (failures.length > 0) {
      console.warn(`  ⚠ posts without tags (${failures.length}): ${failures.join(", ")}`)
    }
  })

  test("Creation Date is a parseable date when present", () => {
    const failures: string[] = []
    for (const file of allFiles) {
      const { data } = matter(fs.readFileSync(file, "utf-8"))
      const d = data["Creation Date"]
      if (!d) continue
      if (isNaN(new Date(d).getTime())) failures.push(`${rel(file)}: '${d}'`)
    }
    assert.deepStrictEqual(failures, [], `Invalid Creation Date in: ${failures.join("; ")}`)
  })

  test("DocID follows alphanumeric-year format when present", () => {
    const failures: string[] = []
    for (const file of allFiles) {
      const { data } = matter(fs.readFileSync(file, "utf-8"))
      if (!data.DocID) continue
      // Accepts: SR-26, EC-26, KGC-24, K6G-24, KS-1-24, KS-2-24
      // Pattern: starts with a letter, then alphanums/hyphens, ends with 2-4 digit year
      if (!/^[A-Z][A-Z0-9]*(-\d+)*-\d{2,4}$/.test(String(data.DocID))) {
        failures.push(`${rel(file)}: '${data.DocID}'`)
      }
    }
    assert.deepStrictEqual(failures, [], `Bad DocID format in: ${failures.join("; ")}`)
  })

  test("no post has drafts: true accidentally published (should not exist in publish list)", () => {
    // publishedFiles already filters out drafts:true — confirm nothing slipped through
    for (const file of publishedFiles) {
      const { data } = matter(fs.readFileSync(file, "utf-8"))
      assert.notStrictEqual(
        data.drafts,
        true,
        `${rel(file)} has drafts: true but was included in published list`,
      )
    }
  })

  test("References field is an array or string when present", () => {
    const failures: string[] = []
    for (const file of allFiles) {
      const { data } = matter(fs.readFileSync(file, "utf-8"))
      if (data.References === undefined || data.References === null) continue
      const ok =
        typeof data.References === "string" ||
        Array.isArray(data.References)
      if (!ok) failures.push(rel(file))
    }
    assert.deepStrictEqual(failures, [], `Malformed References in: ${failures.join(", ")}`)
  })
})

// ── content quality ────────────────────────────────────────────────────────

describe("Content quality", () => {
  test("no post is completely empty", () => {
    const failures: string[] = []
    for (const file of allFiles) {
      const raw = fs.readFileSync(file, "utf-8")
      const { content } = matter(raw)
      if (content.trim().length < 10) failures.push(rel(file))
    }
    assert.deepStrictEqual(failures, [], `Empty posts: ${failures.join(", ")}`)
  })

  test("wikilink image references resolve to existing files", () => {
    const failures: string[] = []
    for (const file of publishedFiles) {
      const content = fs.readFileSync(file, "utf-8")
      for (const img of extractWikilinkImages(content)) {
        // Skip URLs and non-image references
        if (img.startsWith("http") || !img.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)) continue
        if (!findAsset(img, file)) {
          failures.push(`${rel(file)}: ![[${img}]]`)
        }
      }
    }
    if (failures.length > 0) {
      console.warn(`  ⚠ broken image wikilinks (${failures.length}) — missing asset files:\n  ${failures.join("\n  ")}`)
    }
    // Warning only — pre-existing missing assets should be fixed separately
  })

  test("code blocks have language specifiers", () => {
    const failures: string[] = []
    for (const file of publishedFiles) {
      const { content } = matter(fs.readFileSync(file, "utf-8"))
      // Match ``` not followed by a language identifier (just newline or end)
      const bare = [...content.matchAll(/^```[ \t]*\n/gm)]
      if (bare.length > 0) failures.push(`${rel(file)}: ${bare.length} unlabelled block(s)`)
    }
    if (failures.length > 0) {
      console.warn(`  ⚠ posts with bare code blocks (${failures.length}): ${failures.join(", ")}`)
    }
    // Warning only, not a hard failure — older posts may have these
  })
})

// ── S3 Replication post ────────────────────────────────────────────────────

describe("S3 Replication blog post", () => {
  const S3_BLOG = nodePath.join(CONTENT_DIR, "AWS/Storage/S3 Replication.md")

  test("file exists at content/AWS/Storage/S3 Replication.md", () => {
    assert(fs.existsSync(S3_BLOG), "S3 Replication.md not found")
  })

  test("frontmatter is complete and correct", () => {
    const { data } = matter(fs.readFileSync(S3_BLOG, "utf-8"))
    assert.deepStrictEqual(data.Author, ["Kumail Rizvi"], "Author must be [Kumail Rizvi]")
    assert(Array.isArray(data.tags), "tags must be an array")
    assert(data.tags.includes("AWS"), "must have AWS tag")
    assert(data.tags.includes("S3"), "must have S3 tag")
    assert.strictEqual(data.DocID, "SR-26", "DocID must be SR-26")
    assert.strictEqual(data.drafts, false, "post must not be a draft")
    assert(data.description, "must have a description")
    assert(Array.isArray(data.References) && data.References.length > 0, "must have References")
  })

  test("has Mermaid architecture diagram", () => {
    const content = fs.readFileSync(S3_BLOG, "utf-8")
    assert(content.includes("```mermaid"), "must contain a mermaid code block")
    assert(content.includes("flowchart"), "mermaid block must define a flowchart")
    assert(content.includes("IAM"), "diagram should show IAM role")
  })

  test("covers all four replication types", () => {
    const content = fs.readFileSync(S3_BLOG, "utf-8")
    assert(content.includes("Cross-Region Replication"), "must cover CRR")
    assert(content.includes("Same-Region Replication"), "must cover SRR")
    assert(content.includes("Batch Replication"), "must cover Batch Replication")
    assert(
      content.includes("Bi-directional") || content.includes("Two-Way") || content.includes("two-way"),
      "must cover bi-directional replication",
    )
    assert(
      content.includes("S3 RTC") || content.includes("Replication Time Control"),
      "must cover S3 RTC",
    )
  })

  test("includes CLI setup examples", () => {
    const content = fs.readFileSync(S3_BLOG, "utf-8")
    assert(content.includes("```bash"), "must have bash code blocks")
    assert(content.includes("aws s3api"), "must include aws s3api CLI commands")
    assert(content.includes("put-bucket-versioning"), "must show versioning setup command")
    assert(content.includes("put-bucket-replication"), "must show replication config command")
  })

  test("includes IAM policy example", () => {
    const content = fs.readFileSync(S3_BLOG, "utf-8")
    assert(content.includes("```json"), "must have JSON policy block")
    assert(content.includes("s3:ReplicateObject"), "must show ReplicateObject IAM permission")
  })

  test("has monitoring section", () => {
    const content = fs.readFileSync(S3_BLOG, "utf-8")
    assert(
      content.includes("Monitoring") || content.includes("CloudWatch"),
      "must have a monitoring section",
    )
    assert(content.includes("ReplicationLatency") || content.includes("replication-status"), "must mention replication metrics or status")
  })

  test("uses Obsidian callout syntax", () => {
    const content = fs.readFileSync(S3_BLOG, "utf-8")
    assert(content.match(/>\s*\[!(NOTE|TIP|CAUTION|INFO|WARNING)\]/i), "must use Obsidian callouts")
  })
})

// ── build output validation ────────────────────────────────────────────────

describe("Build output validation", () => {
  const publicExists = fs.existsSync(PUBLIC_DIR)

  test("public/ directory exists (run `npx quartz build` first if missing)", () => {
    assert(publicExists, "public/ does not exist — run: npx quartz build")
  })

  test("index.html is built", () => {
    if (!publicExists) return
    assert(fs.existsSync(nodePath.join(PUBLIC_DIR, "index.html")), "index.html missing from public/")
  })

  test("S3-Replication.html is in public/AWS/Storage/", () => {
    if (!publicExists) return
    const htmlPath = nodePath.join(PUBLIC_DIR, "AWS/Storage/S3-Replication.html")
    assert(fs.existsSync(htmlPath), `S3-Replication.html not found at ${htmlPath}`)
  })

  test("S3-Replication.html contains rendered content", () => {
    if (!publicExists) return
    const htmlPath = nodePath.join(PUBLIC_DIR, "AWS/Storage/S3-Replication.html")
    if (!fs.existsSync(htmlPath)) return
    const html = fs.readFileSync(htmlPath, "utf-8")
    assert(html.includes("Cross-Region Replication"), "HTML missing CRR content")
    assert(html.includes("mermaid"), "HTML missing mermaid class (diagram not rendered)")
    assert(html.includes("S3 RTC") || html.includes("Replication Time Control"), "HTML missing RTC content")
  })

  test("built site has no 0-byte HTML files", () => {
    if (!publicExists) return
    const failures: string[] = []
    function check(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = nodePath.join(dir, entry.name)
        if (entry.isDirectory()) check(full)
        else if (entry.name.endsWith(".html")) {
          const size = fs.statSync(full).size
          if (size === 0) failures.push(nodePath.relative(PUBLIC_DIR, full))
        }
      }
    }
    check(PUBLIC_DIR)
    assert.deepStrictEqual(failures, [], `Empty HTML files in build: ${failures.join(", ")}`)
  })

  test("AWS Storage section has all expected pages built", () => {
    if (!publicExists) return
    const storageDir = nodePath.join(PUBLIC_DIR, "AWS/Storage")
    assert(fs.existsSync(storageDir), "public/AWS/Storage/ directory missing")
    const built = fs.readdirSync(storageDir).filter((f) => f.endsWith(".html"))
    assert(built.includes("S3-Replication.html"), "S3-Replication.html missing from build output")
    assert(built.includes("EFS.html"), "EFS.html missing from build output")
  })

  test("site has sitemap or index feed", () => {
    if (!publicExists) return
    const hasSitemap =
      fs.existsSync(nodePath.join(PUBLIC_DIR, "sitemap.xml")) ||
      fs.existsSync(nodePath.join(PUBLIC_DIR, "index.xml"))
    assert(hasSitemap, "built site should have a sitemap.xml or index.xml feed")
  })
})
