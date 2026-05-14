import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import Homepage from "../Homepage"

const Content: QuartzComponent = ({ fileData, tree, allFiles, cfg }: QuartzComponentProps) => {
  // Check if this is the index/home page
  if (fileData.slug === "index") {
    return <Homepage allFiles={allFiles} fileData={fileData} cfg={cfg} tree={tree} />
  }

  // For all other pages, render the normal content
  const content = htmlToJsx(fileData.filePath!, tree)
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  return <article class={classString}>{content}</article>
}

export default (() => Content) satisfies QuartzComponentConstructor
