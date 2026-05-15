import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentDirectory = path.join(process.cwd(), "content")

export interface Post {
  slug: string
  frontmatter: {
    title?: string
    date?: string
    tags?: string[]
    description?: string
    [key: string]: any
  }
  content: string
}

export interface PostMeta {
  slug: string
  title: string
  date?: string
  tags?: string[]
  description?: string
}

function getMDXFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return []
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries
    .filter((entry) => !entry.name.startsWith("."))
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return getMDXFiles(fullPath)
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath]
      }
      return []
    })

  return files
}

export function getAllPosts(): PostMeta[] {
  const files = getMDXFiles(contentDirectory)

  return files
    .map((file) => {
      const relativePath = path.relative(contentDirectory, file)
      const slug = relativePath.replace(/\.md$/, "").replace(/\\/g, "/")
      const fileContents = fs.readFileSync(file, "utf8")
      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title || slug.split("/").pop() || "Untitled",
        date: data.date?.toString(),
        tags: data.tags || [],
        description: data.description || "",
      }
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.md$/, "")
  const fullPath = path.join(contentDirectory, `${realSlug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    frontmatter: data,
    content,
  }
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set<string>()

  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => tags.add(tag))
    }
  })

  return Array.from(tags).sort()
}

export function getPostsByTag(tag: string): PostMeta[] {
  const posts = getAllPosts()
  return posts.filter((post) => post.tags?.includes(tag))
}

export function getAllFolders(): { folder: string; posts: PostMeta[] }[] {
  const posts = getAllPosts()
  const folderMap = new Map<string, PostMeta[]>()

  posts.forEach((post) => {
    const parts = post.slug.split("/")
    if (parts.length > 1) {
      const folder = parts[0]
      if (!folderMap.has(folder)) {
        folderMap.set(folder, [])
      }
      folderMap.get(folder)!.push(post)
    }
  })

  return Array.from(folderMap.entries())
    .map(([folder, folderPosts]) => ({ folder, posts: folderPosts }))
    .sort((a, b) => a.folder.localeCompare(b.folder))
}
