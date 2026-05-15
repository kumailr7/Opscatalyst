import Link from "next/link"
import { getAllPosts, getAllTags, getAllFolders } from "./lib/markdown"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Search from "./components/Search"

export default function Home() {
  const posts = getAllPosts()
  const tags = getAllTags()
  const folders = getAllFolders()

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative w-full min-h-[500px] flex flex-col justify-center px-6 md:px-24 py-20 obsidian-gradient overflow-hidden">
        <div className="absolute right-0 top-0 w-2/3 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
              Priority 01 // Featured
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface leading-[0.9]">
            Architecting <br />
            Resilience in <br />
            <span className="text-primary">Multi-Cloud</span> Infrastructure
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed font-light">
            An editorial deep-dive into the protocols and patterns required to build fault-tolerant
            systems across distributed cloud providers.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-primary text-on-primary px-8 py-4 font-bold uppercase tracking-widest text-sm rounded-md transition-all hover:brightness-110 active:scale-[0.98] flex items-center gap-3">
              Execute Protocol
              <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
            </button>
            <button className="bg-secondary-container text-on-secondary-container px-8 py-4 font-bold uppercase tracking-widest text-sm rounded-md transition-all hover:bg-surface-container-highest active:scale-[0.98]">
              View Schematics
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="min-h-screen">
        {/* Latest Articles Grid */}
        <section className="px-6 md:px-24 py-16 bg-surface">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase">
                Latest Transmissions
              </h2>
              <div className="h-1 w-12 bg-primary"></div>
            </div>
            <Link
              className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all"
              href="/folders"
            >
              View All Archives
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {posts.slice(0, 4).map((post, index) => (
              <Link key={post.slug} href={`/${post.slug}`} className="group cursor-pointer">
                <div className="relative aspect-video mb-6 overflow-hidden rounded-sm bg-surface-container-low">
                  <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-low group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary/30">
                      article
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-primary tracking-widest font-bold uppercase">
                    {index === 0
                      ? "Manual // Lvl 4"
                      : index === 1
                        ? "Standard // API"
                        : "Ops // Interface"}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-sm text-on-surface-variant/70 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Technical Block */}
        <section className="px-6 md:px-24 py-16 border-y border-outline-variant/10 bg-surface-container-lowest">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black tracking-tighter">Engineered for Precision</h2>
              <p className="text-on-surface-variant leading-relaxed">
                The Dojo provides high-fidelity training modules for site reliability engineers. Our
                curriculum focuses on the intersection of infrastructure as code and architectural
                resilience.
              </p>
              <ul className="space-y-4 font-mono text-sm">
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>PROVISIONING_AUTOMATION: 100%</span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>OBSERVABILITY_STACK: DEPLOYED</span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>SECURITY_PROTOCOL: COMPLIANT</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/20 shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/20 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-error/40"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                  <div className="w-3 h-3 rounded-full bg-on-surface-variant/40"></div>
                </div>
                <span className="text-[10px] font-mono ml-4 text-on-surface-variant/60 uppercase">
                  Dojo-Shell // system_check.sh
                </span>
              </div>
              <div className="font-mono text-sm text-primary/80 space-y-1">
                <p>
                  <span className="text-on-surface-variant/40">$</span> initiate --protocol
                  resilience-v4
                </p>
                <p className="text-on-surface-variant">Checking infrastructure status...</p>
                <p className="text-on-surface-variant">[OK] Cluster API responsive</p>
                <p className="text-on-surface-variant">[OK] Load Balancer healthy</p>
                <p>
                  <span className="text-on-surface-variant/40">$</span> deploy --target=multi-cloud
                </p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Content */}
        <section className="px-6 md:px-24 py-16 bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Folders & Tags Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="section-title">Folders</h3>
                <ul className="space-y-2">
                  {folders.slice(0, 8).map((folder) => (
                    <li key={folder.folder} className="folder-item">
                      <Link href={`/folder/${folder.folder}`}>{folder.folder}</Link>
                      <span className="folder-count">{folder.posts.length}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="section-title">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 12).map((tag) => (
                    <span key={tag} className="tag-item">
                      <Link href={`/tags/${tag}`}>#{tag}</Link>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* All Posts */}
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-8">
                All Transmissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(0, 12).map((post) => (
                  <Link key={post.slug} href={`/${post.slug}`} className="group">
                    <div className="content-card h-full">
                      <div className="content-card-title">{post.title}</div>
                      {post.date && (
                        <div className="content-card-meta">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                      {post.description && (
                        <div className="content-card-desc mt-2">{post.description}</div>
                      )}
                      {post.tags &&
                        post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block mt-3 mr-2 text-[10px] font-mono text-primary"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
