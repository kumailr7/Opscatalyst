import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const currYear = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`footer ${displayClass ?? ""}`}>
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo">DevOps-Dojo</span>
            <p class="footer-tagline">© Engineered for Precision</p>
          </div>
          <ul class="footer-links">
            <li>
              <a href="#">System Status</a>
            </li>
            <li>
              <a href="#">API Docs</a>
            </li>
            <li>
              <a href="#">Changelog</a>
            </li>
            <li>
              <a href="#">Security</a>
            </li>
          </ul>
          <div class="footer-social">
            <a
              href="https://github.com/kumailr7/Devops-Dojo"
              class="social-btn"
              aria-label="GitHub"
            >
              <span class="material-symbols-outlined">terminal</span>
            </a>
            <a href="https://linkedin.com/in/kumail-rizvi" class="social-btn" aria-label="LinkedIn">
              <span class="material-symbols-outlined">cloud_sync</span>
            </a>
          </div>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
