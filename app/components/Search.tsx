"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { PostMeta } from "../lib/markdown"

export default function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PostMeta[]>([])
  const [showResults, setShowResults] = useState(false)
  const [posts, setPosts] = useState<PostMeta[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/search")
      .then((res) => res.json())
      .then((data) => setPosts(data))
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length > 0) {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.description?.toLowerCase().includes(query.toLowerCase()),
      )
      setResults(filtered.slice(0, 10))
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [query, posts])

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        onFocus={() => query.length > 0 && setShowResults(true)}
      />
      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((post) => (
            <Link
              key={post.slug}
              href={`/${post.slug}`}
              className="search-result-item"
              onClick={() => setShowResults(false)}
            >
              <div style={{ fontWeight: 500 }}>{post.title}</div>
              {post.description && (
                <div style={{ fontSize: "0.85em", color: "var(--darkgray)", marginTop: "0.25rem" }}>
                  {post.description.slice(0, 100)}...
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
