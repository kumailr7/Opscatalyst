import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-12 px-8 border-t border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full max-w-7xl mx-auto">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[#ffb4aa] font-bold text-xl font-mono tracking-widest">
            DevOps-Dojo
          </span>
          <p className="text-xs tracking-widest uppercase text-on-surface-variant/60">
            © Engineered for Precision
          </p>
        </div>

        <div className="flex gap-8">
          <Link
            href="/folders"
            className="text-xs tracking-widest uppercase text-on-surface-variant/60 hover:text-on-surface transition-all"
          >
            Folders
          </Link>
          <Link
            href="/tags"
            className="text-xs tracking-widest uppercase text-on-surface-variant/60 hover:text-on-surface transition-all"
          >
            Tags
          </Link>
          <span className="text-xs tracking-widest uppercase text-on-surface-variant/60">
            System Status
          </span>
        </div>

        <div className="flex gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-sm bg-surface-container-high border border-outline-variant/20 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">terminal</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-sm bg-surface-container-high border border-outline-variant/20 hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">cloud_sync</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
