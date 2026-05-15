import { NextResponse } from "next/server"
import { getAllPosts } from "../../lib/markdown"

export async function GET() {
  const posts = getAllPosts()
  return NextResponse.json(posts)
}
