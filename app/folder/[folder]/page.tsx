import { notFound } from "next/navigation"
import Link from "next/link"
import { getAllFolders, getAllPosts } from "../../lib/markdown"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

interface PageProps {
  params: {
    folder: string
  }
}

export async function generateStaticParams() {
  const folders = getAllFolders()
  return folders.map((f) => ({ folder: f.folder }))
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Folder: ${params.folder}`,
  }
}

export default function FolderPage({ params }: PageProps) {
  const folderName = params.folder
  const allPosts = getAllPosts()
  const posts = allPosts.filter((post) => post.slug.startsWith(folderName + "/"))

  if (posts.length === 0) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="main-content" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="page-header">
            <h1 className="page-title">{folderName}</h1>
            <p className="hero-subtitle">{posts.length} posts in this folder</p>
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
