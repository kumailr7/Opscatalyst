import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "DEVOPS-DOJO",
    enableSPA: false,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-H0G1YKHC31"
    },
    baseUrl: "devops-dojo.ninja",
    ignorePatterns: ["private", "Templates", ".obsidian", "Personal", "Archive", "Omnivore", "**/*.excalidraw.md", "rawNotes"],
    defaultDateType: "modified",
    locale: "en-US",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Space Grotesk",
        body: "Manrope",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#eef2ff",
          lightgray: "#cbd5e1",
          gray: "#64748b",
          darkgray: "#1e293b",
          dark: "#0b1326",
          secondary: "#00829c",
          tertiary: "#418600",
          highlight: "rgba(0, 130, 156, 0.1)",
          textHighlight: "rgba(65, 134, 0, 0.2)",
        },
        darkMode: {
          light: "#060e20",
          lightgray: "#404751",
          gray: "#8a919d",
          darkgray: "#c0c7d3",
          dark: "#dae2fd",
          secondary: "#4cd6fb",
          tertiary: "#70e000",
          highlight: "rgba(76, 214, 251, 0.1)",
          textHighlight: "rgba(112, 224, 0, 0.2)",
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
