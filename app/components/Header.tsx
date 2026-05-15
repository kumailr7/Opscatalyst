"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function Header() {
  const [theme, setTheme] = useState("dark")
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
    document.documentElement.classList.add("dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-surface/80 dark:bg-[#131314]/80 backdrop-blur-xl fixed top-0 w-full border-b border-outline-variant/20 shadow-sm z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black tracking-widest text-[#ffb4aa] font-mono">
              DevOps-Dojo
            </Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link
                href="/"
                className="font-bold uppercase text-sm text-[#ffb4aa] border-b-2 border-[#ffb4aa] pb-1 transition-colors"
              >
                Articles
              </Link>
              <Link
                href="/folders"
                className="font-bold uppercase text-sm text-on-surface-variant hover:text-[#ffb4aa] transition-colors"
              >
                Folders
              </Link>
              <Link
                href="/tags"
                className="font-bold uppercase text-sm text-on-surface-variant hover:text-[#ffb4aa] transition-colors"
              >
                Tags
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-on-surface-variant hover:text-primary transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-lg border border-outline-variant/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                System Live
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-surface/60 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl glass-panel rounded-xl shadow-2xl border border-outline-variant/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg border-b-2 border-outline-variant">
                <span className="material-symbols-outlined text-primary">search</span>
                <input
                  className="search-input"
                  placeholder="Search Architecture, Protocols, or Systems..."
                  type="text"
                  autoFocus
                />
                <span className="text-[10px] font-mono text-on-surface-variant/40 border border-on-surface-variant/20 px-2 py-1 rounded uppercase tracking-tighter">
                  esc
                </span>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/60">
                  Filter by Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                    #kubernetes
                  </button>
                  <button className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold hover:bg-surface-container-highest">
                    #optimization
                  </button>
                  <button className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold hover:bg-surface-container-highest">
                    #security
                  </button>
                  <button className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold hover:bg-surface-container-highest">
                    #telemetry
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 text-[10px] font-mono text-on-surface-variant/40 flex justify-between uppercase tracking-widest">
              <span>42 Results cached</span>
              <span>Last Index: 2m ago</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
