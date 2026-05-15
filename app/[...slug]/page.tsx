import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { getPostBySlug, getAllPosts, getAllTags, getAllFolders } from "../lib/markdown"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Search from "../components/Search"

interface PageProps {
  params: {
    slug: string[]
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug.split("/"),
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const slug = params.slug.join("/")
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: "Not Found",
    }
  }

  return {
    title: post.frontmatter.title || "Untitled",
    description: post.frontmatter.description || "",
  }
}

export default function PostPage({ params }: PageProps) {
  const slug = params.slug.join("/")
  const post = getPostBySlug(slug)
  const tags = getAllTags()
  const folders = getAllFolders()

  if (!post) {
    notFound()
  }

  return (
    <>
      <Header />
      <div className="main-layout">
        <aside className="sidebar-left">
          <Search />

          <div className="sidebar-section">
            <h3 className="section-title">Folders</h3>
            <ul className="folder-list">
              {folders.slice(0, 10).map((folder) => (
                <li key={folder.folder} className="folder-item">
                  <Link href={`/folder/${folder.folder}`}>{folder.folder}</Link>
                  <span className="folder-count">{folder.posts.length}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">Tags</h3>
            <div className="tag-list">
              {tags.slice(0, 15).map((tag) => (
                <span key={tag} className="tag-item">
                  <Link href={`/tags/${tag}`}>{tag}</Link>
                </span>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <article>
            <header className="page-header">
              <h1 className="page-title">{post.frontmatter.title || "Untitled"}</h1>
              <div className="page-meta">
                {post.frontmatter.date && (
                  <span>
                    {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              {post.frontmatter.tags && (
                <div className="page-tags">
                  {post.frontmatter.tags.map((tag: string) => (
                    <Link key={tag} href={`/tags/${tag}`} className="post-tag">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            <div className="mdx-content">
              <MDXRemote source={post.content} />
            </div>

            <Link href="/" className="back-link">
              ← Back to Home
            </Link>
          </article>
        </main>
      </div>
      <Footer />
    </>
  )
}
