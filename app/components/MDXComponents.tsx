import Link from "next/link"

function CustomLink({ href, children, ...props }: any) {
  if (href?.startsWith("/") || href?.startsWith("#")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

export const components = {
  a: CustomLink,
  table: (props: any) => (
    <table style={{ borderCollapse: "collapse", width: "100%", margin: "1rem 0" }} {...props} />
  ),
  th: (props: any) => (
    <th
      style={{
        border: "1px solid var(--lightgray)",
        padding: "0.5rem",
        background: "var(--highlight)",
      }}
      {...props}
    />
  ),
  td: (props: any) => (
    <td style={{ border: "1px solid var(--lightgray)", padding: "0.5rem" }} {...props} />
  ),
  hr: (props: any) => (
    <hr
      style={{ border: "none", borderTop: "1px solid var(--lightgray)", margin: "2rem 0" }}
      {...props}
    />
  ),
  img: (props: any) => <img style={{ maxWidth: "100%", borderRadius: "8px" }} {...props} />,
  blockquote: (props: any) => <blockquote className="callout" {...props} />,
}
