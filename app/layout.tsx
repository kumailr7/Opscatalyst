import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DevOps-Dojo",
  description: "A precision-focused learning resource for mastering DevOps practices",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="selection:bg-primary/30 bg-surface text-on-surface min-h-screen">
        {children}
      </body>
    </html>
  )
}
