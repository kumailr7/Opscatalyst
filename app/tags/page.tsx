import Link from "next/link"
import { getAllTags } from "../lib/markdown"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <>
      <Header />
      <main className="container">
        <div className="main-content" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="page-header">
            <h1 className="page-title">All Tags</h1>
            <p className="hero-subtitle">{tags.length} tags found</p>
          </div>
          <div className="tag-list" style={{ marginTop: "1rem" }}>
            {tags.map((tag) => (
              <span key={tag} className="tag-item">
                <Link href={`/tags/${tag}`}>{tag}</Link>
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
