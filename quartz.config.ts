import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "DevOps-Dojo",
    enableSPA: false,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-H0G1YKHC31"
    },
    baseUrl: "devops-dojo.vercel.app",
    ignorePatterns: ["private", "Templates", ".obsidian", "Personal", "Archive", "Omnivore", "**/*.excalidraw.md", "rawNotes"],
    defaultDateType: "modified",
    locale: "en-US",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Plus Jakarta Sans",
        body: "DM Sans",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#fafafa",
          lightgray: "#e8e8e8",
          gray: "#a1a1aa",
          darkgray: "#52525b",
          dark: "#18181b",
          secondary: "#6366f1",
          tertiary: "#8b5cf6",
          highlight: "rgba(99, 102, 241, 0.12)",
          textHighlight: "rgba(251, 191, 36, 0.35)",
        },
        darkMode: {
          light: "#0f0f12",
          lightgray: "#27272a",
          gray: "#71717a",
          darkgray: "#d4d4d8",
          dark: "#fafafa",
          secondary: "#818cf8",
          tertiary: "#a78bfa",
          highlight: "rgba(129, 140, 248, 0.15)",
          textHighlight: "rgba(251, 191, 36, 0.25)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.TableOfContents({ maxDepth: 4 }),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "poimandres",
        },
        keepBackground: true,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false, enableCheckbox: true}),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        rssLimit: 10,
        rssFullHtml: true
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
