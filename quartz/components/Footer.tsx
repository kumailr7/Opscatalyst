import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const currYear = new Date().getFullYear()
    const links = opts?.links ?? {}
    const githubUrl = links["GitHub"] ?? "https://github.com/kumailr7/Devops-Dojo"

    return (
      <footer class={`at-footer ${displayClass ?? ""}`}>
        <div class="at-footer-inner">
          {/* Left: branding */}
          <div class="at-footer-brand">
            <span class="at-footer-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 8.5l1.5 1.5L6 11.5 7 12.5l2.5-2.5L7 7.5 6 8.5zm5.5 5H17v-1.5h-5.5V13.5z"/>
              </svg>
              DevOps-Dojo
            </span>
            <p class="at-footer-copy">
              © {currYear} Kumail Rizvi. Built for the persistent developer.
            </p>
          </div>

          {/* Center: social links */}
          <div class="at-footer-links">
            <a href="https://twitter.com/kumailr7" class="at-footer-link" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href={githubUrl} class="at-footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/kumail-rizvi/" class="at-footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="/index.xml" class="at-footer-link">RSS</a>
          </div>

          {/* Right: status indicator */}
          <div class="at-footer-status">
            <span class="at-status-dot"></span>
            <span class="at-status-text">All Systems Nominal</span>
          </div>
        </div>
      </footer>
    )
  }

  Footer.css = `
/* ── Architectural Terminal Footer ─────────────────────────────── */
.at-footer {
  margin-top: 4rem;
  border-top: 1px solid rgba(64, 71, 81, 0.2);
  padding: 2.5rem 0 2rem;
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  -webkit-font-smoothing: antialiased;
  width: 100%;
}

.at-footer-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Branding */
.at-footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.at-footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--headerFont);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--secondary) 0%, #00a8c4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: var(--secondary);
}
.at-footer-logo svg {
  color: var(--secondary);
  -webkit-text-fill-color: initial;
  flex-shrink: 0;
}
.at-footer-copy {
  color: var(--gray);
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
}

/* Social links */
.at-footer-links {
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
}
.at-footer-link {
  color: var(--gray) !important;
  text-decoration: none !important;
  background: none !important;
  padding: 0 !important;
  font-weight: 400;
  opacity: 0.8;
  transition: opacity 0.2s ease, color 0.2s ease;
}
.at-footer-link:hover {
  color: var(--secondary) !important;
  opacity: 1;
}

/* Status indicator */
.at-footer-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.at-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--tertiary);
  animation: at-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
.at-status-text {
  color: var(--tertiary);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.01em;
}

@keyframes at-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

@media (max-width: 600px) {
  .at-footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
}
`

  return Footer
}) satisfies QuartzComponentConstructor
