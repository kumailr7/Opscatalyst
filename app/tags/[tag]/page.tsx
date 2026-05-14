import { notFound } from "next/navigation"
import Link from "next/link"
import { getAllTags, getPostsByTag } from "../../lib/markdown"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

interface PageProps {
  params: {
    tag: string
  }
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Tag: ${params.tag}`,
  }
}

export default function TagPage({ params }: PageProps) {
  const posts = getPostsByTag(params.tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="main-content" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="page-header">
            <h1 className="page-title">#{params.tag}</h1>
            <p className="hero-subtitle">{posts.length} posts tagged</p>
          </div>

          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug} className="post-list-item">
                <Link href={`/${post.slug}`}>
                  <div className="post-list-title">{post.title}</div>
                  {post.date && (
                    <div className="post-list-meta">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  {post.description && <div className="post-list-desc">{post.description}</div>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  )
}
