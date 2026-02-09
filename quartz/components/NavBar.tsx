import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface NavBarOptions {
  githubUrl?: string
}

export default ((opts?: NavBarOptions) => {
  const NavBar: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    const title = cfg?.pageTitle ?? "DevOps-Dojo"
    const baseDir = pathToRoot(fileData.slug!)
    const githubUrl = opts?.githubUrl ?? "https://github.com/kumailr7/Opscatalyst"

    return (
      <nav class="navbar">
        <a href={baseDir} class="navbar-logo">
          <span class="navbar-logo-icon">⚡</span>
          <span class="navbar-logo-text">{title}</span>
        </a>
        <div class="navbar-actions">
          <button
            type="button"
            class="navbar-search-trigger"
            aria-label="Search"
            onClick={() => document.getElementById("search-button")?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>Search</span>
            <kbd>/</kbd>
          </button>
          <a href={githubUrl} class="navbar-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </nav>
    )
  }

  NavBar.css = `
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 0.75rem 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--lightgray);
}

.navbar-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--dark);
  font-weight: 600;
  font-size: 1.25rem;
  transition: opacity 0.2s ease;
}
.navbar-logo:hover {
  opacity: 0.85;
}
.navbar-logo-icon {
  font-size: 1.35rem;
}
.navbar-logo-text {
  font-family: var(--headerFont);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar-search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: var(--lightgray);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--darkgray);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.navbar-search-trigger:hover {
  background: color-mix(in srgb, var(--secondary) 15%, var(--lightgray));
  color: var(--dark);
}
.navbar-search-trigger kbd {
  font-size: 0.75rem;
  padding: 0.15rem 0.35rem;
  background: var(--light);
  border-radius: 4px;
  border: 1px solid var(--gray);
}

.navbar-github {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  color: var(--darkgray);
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: background 0.2s ease, color 0.2s ease;
}
.navbar-github:hover {
  background: var(--lightgray);
  color: var(--dark);
}
`

  return NavBar
}) satisfies QuartzComponentConstructor
