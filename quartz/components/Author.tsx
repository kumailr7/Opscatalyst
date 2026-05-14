import style from "./styles/author.scss"
import { FullSlug, _stripSlashes, joinSegments, pathToRoot } from "../util/path"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { URL } from "url"
import { hostname } from "os"
import { range } from "d3"
import { JSXInternal } from "preact/src/jsx"

const profilePhotos: Record<string, string> = {
  default: "https://i.imgflip.com/4sqpkj.png",
  "Kumail Rizvi": "https://i.imgflip.com/4sqpkj.png",
}

const defaultAuthor = {
  name: "Kumail Rizvi",
  role: "DevOps Architect",
  link: "https://linkedin.com/in/kumail-rizvi",
}

function createAuthorElement(author: string, link: string, role?: string) {
  author = author.trim()
  link = link.trim()

  var knownAuthor = author in profilePhotos
  const image_element = (
    <img src={knownAuthor ? profilePhotos[author] : profilePhotos["default"]} alt="" />
  )

  return (
    <div class="authorWLink">
      <a href={link}>
        {image_element}
        <div class="author-info">
          <span class="author-name">{author}</span>
          {role && <span class="author-role">{role}</span>}
        </div>
      </a>
    </div>
  )
}

function cleanTooManyAuthors(authorsElements: JSXInternal.Element[], maxShown: number = 3) {
  if (authorsElements.length <= maxShown) {
    return authorsElements
  }

  var shownElements = authorsElements.slice(0, maxShown)
  var hiddenAuthors = (
    <div class="hiddenAuthors">
      {" "}
      <div class="hiddenAuthorsContainer">
        {authorsElements.slice(maxShown, authorsElements.length)}
      </div>
    </div>
  )
  return [...shownElements, hiddenAuthors]
}

function Author({ fileData }: QuartzComponentProps) {
  const authors = fileData.frontmatter?.["Author"] ?? [defaultAuthor.name]
  const authorRoles = fileData.frontmatter?.["Author Role"] ?? [defaultAuthor.role]
  const authorLinks = fileData.frontmatter?.["Author Profile"] ?? [defaultAuthor.link]
  var authorsElements: JSXInternal.Element[] = []

  if (authors) {
    for (var i of range(authors.length)) {
      var link = ""
      if (i < authorLinks?.length) {
        link = authorLinks[i]
      } else {
        link = defaultAuthor.link
      }

      var role = ""
      if (i < authorRoles?.length) {
        role = authorRoles[i]
      }

      authorsElements.push(createAuthorElement(authors[i], link, role))
    }

    return <div class="author">{cleanTooManyAuthors(authorsElements)}</div>
  } else {
    return <p></p>
  }
}

Author.css = style

export default (() => Author) satisfies QuartzComponentConstructor
