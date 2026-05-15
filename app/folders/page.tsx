import Link from "next/link"
import { getAllFolders } from "../lib/markdown"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function FoldersPage() {
  const folders = getAllFolders()

  return (
    <>
      <Header />
      <main className="container">
        <div className="main-content" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="page-header">
            <h1 className="page-title">All Folders</h1>
            <p className="hero-subtitle">{folders.length} folders</p>
          </div>

          <div style={{ marginTop: "1rem" }}>
            {folders.map((folder) => (
              <div key={folder.folder} className="content-card">
                <Link href={`/folder/${folder.folder}`}>
                  <div className="content-card-title">{folder.folder}</div>
                  <div className="content-card-meta">{folder.posts.length} posts</div>
                </Link>
                <ul style={{ listStyle: "none", marginTop: "0.75rem" }}>
                  {folder.posts.slice(0, 5).map((post) => (
                    <li key={post.slug} style={{ marginBottom: "0.25rem" }}>
                      <Link
                        href={`/${post.slug}`}
                        style={{ fontSize: "0.85rem", color: "var(--on-surface-variant)" }}
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                  {folder.posts.length > 5 && (
                    <li style={{ fontSize: "0.8rem", color: "var(--primary)" }}>
                      +{folder.posts.length - 5} more...
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
