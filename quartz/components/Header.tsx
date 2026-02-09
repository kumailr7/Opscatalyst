import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? <header>{children}</header> : null
}

Header.css = `
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 1.5rem 0;
  padding: 0;
}

header h1 {
  margin: 0;
  flex: auto;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
