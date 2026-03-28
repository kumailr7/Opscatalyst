import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface NavBarOptions {
  githubUrl?: string
}

export default ((opts?: NavBarOptions) => {
  const NavBar: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    const title = cfg?.pageTitle ?? "DevOps-Dojo"
    const baseDir = pathToRoot(fileData.slug!)
    const githubUrl = opts?.githubUrl ?? "https://github.com/kumailr7/Devops-Dojo"

    return (
      <nav class="navbar">
        {/* Logo */}
        <a href={baseDir} class="navbar-logo">
          <span class="navbar-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 8.5l1.5 1.5L6 11.5 7 12.5l2.5-2.5L7 7.5 6 8.5zm5.5 5H17v-1.5h-5.5V13.5z"/>
            </svg>
          </span>
          <span id="navbar-decrypt" class="navbar-logo-text">{title}</span>
        </a>
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
  function decrypt(el){
    const final=el.dataset.final||el.textContent;
    el.dataset.final=final;
    let frame=0;const frames=28;
    const id=setInterval(()=>{
      el.textContent=final.split('').map((ch,i)=>{
        if(ch===' ')return ' ';
        if(i<Math.floor(frame/frames*final.length))return ch;
        return CHARS[Math.floor(Math.random()*CHARS.length)];
      }).join('');
      if(++frame>frames){clearInterval(id);el.textContent=final;}
    },35);
  }
  function init(){
    const el=document.getElementById('navbar-decrypt');
    if(!el)return;
    decrypt(el);
    el.closest('a').addEventListener('mouseenter',()=>decrypt(el));
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
  else{init();}
})();
` }} />

        {/* Actions */}
        <div class="navbar-actions">
          <a href={githubUrl} class="navbar-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </nav>
    )
  }

  NavBar.css = `
/* ── Architectural Terminal NavBar ─────────────────────────────── */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 0.875rem 0;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(64, 71, 81, 0.2);
  /* Glass panel */
  background: rgba(11, 19, 38, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* ── Logo ──────────────────────────────────────────────────────── */
.navbar-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none !important;
  background: none !important;
  padding: 0 !important;
  font-family: var(--headerFont);
  font-weight: 700;
  font-size: 1.9rem;
  letter-spacing: -0.05em;
  transition: opacity 0.2s ease;
}
.navbar-logo-icon {
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.navbar-logo-text {
  background: linear-gradient(135deg, var(--secondary) 0%, #00a8c4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.navbar-logo:hover {
  opacity: 0.82;
}

/* ── Desktop nav links ─────────────────────────────────────────── */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  font-family: var(--headerFont);
  letter-spacing: -0.01em;
}

.navbar-link {
  color: var(--gray);
  text-decoration: none !important;
  font-size: 0.88rem;
  font-weight: 400;
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  transition: color 0.2s ease;
}
.navbar-link:hover {
  color: var(--secondary) !important;
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
}

/* ── Actions area ──────────────────────────────────────────────── */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  background: rgba(23, 31, 51, 0.9);
  border: 1px solid rgba(64, 71, 81, 0.25);
  border-radius: 6px;
  color: var(--gray);
  font-size: 0.82rem;
  font-family: var(--bodyFont);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.navbar-search-trigger:hover {
  background: rgba(34, 42, 61, 1);
  border-color: rgba(76, 214, 251, 0.3);
  color: var(--dark);
}
.navbar-search-trigger kbd {
  font-size: 0.68rem;
  padding: 0.08rem 0.3rem;
  background: rgba(45, 52, 73, 0.8);
  border-radius: 3px;
  color: var(--gray);
  font-family: var(--codeFont);
  letter-spacing: 0;
}

.navbar-github {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--gray);
  text-decoration: none !important;
  background: none !important;
  border-radius: 6px;
  padding: 0 !important;
  transition: background 0.2s ease, color 0.2s ease;
}
.navbar-github:hover {
  background: rgba(34, 42, 61, 0.9) !important;
  color: var(--secondary) !important;
}
`

  return NavBar
}) satisfies QuartzComponentConstructor
