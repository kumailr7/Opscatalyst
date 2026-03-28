import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.NavBar({ githubUrl: "https://github.com/kumailr7/Devops-Dojo" }),
    Component.Darkmode(),
    Component.AuroraBackground(),
  ],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/kumailr7/Devops-Dojo"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.BentoHome(),
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta({showReadingTime:true}),
    Component.TagList(), 
    Component.Author(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.RecentNotes({ linkToMore: "tags/" , limit: 3, showTags: false })),
    Component.DesktopOnly(
      Component.Explorer({
        sortFn: (a, b) => {
          if ((!a.file && !b.file) || (a.file && b.file)) {
            return a.displayName.localeCompare(b.displayName)
          }
          // folders first, loose files (About Me, Readme) last
          if (a.file && !b.file) return 1
          return -1
        },
      }),
    ),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.Graph(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
