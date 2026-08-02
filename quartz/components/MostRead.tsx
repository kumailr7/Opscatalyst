import { readFileSync } from "node:fs"
import path from "node:path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import style from "./styles/recentNotes.scss"

interface MostReadEntry {
  slug: string
  visits: number
}

function readEntries(): MostReadEntry[] {
  try {
    const raw = readFileSync(
      path.join(process.cwd(), "quartz", "static", "most-read.json"),
      "utf-8",
    )
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default (() => {
  const MostRead: QuartzComponent = ({ allFiles, fileData, displayClass }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const entries = readEntries()
    if (entries.length === 0) return null

    const pages = entries
      .map(({ slug, visits }) => {
        const page = allFiles.find((f) => f.slug === slug)
        return page ? { page, visits } : null
      })
      .filter((x): x is { page: (typeof allFiles)[number]; visits: number } => x !== null)

    if (pages.length === 0) return null

    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h3>Most Read</h3>
        <ul class="recent-ul">
          {pages.map(({ page }) => {
            const title = page.frontmatter?.title ?? page.slug
            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <h3>
                      <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                        {title}
                      </a>
                    </h3>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  MostRead.css = style
  return MostRead
}) satisfies QuartzComponentConstructor
