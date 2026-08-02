# Devops-Dojo — Repository Context

Deep-dive companion to [`CLAUDE.md`](./CLAUDE.md). Where the two disagree, this
document reflects what was actually found in the code/content/history as of
2026-08-01 — CLAUDE.md contains some stale/aspirational claims called out
below.

## 1. What this repo is

A personal DevOps knowledge base and blog by **Kumail Rizvi**, built by
**forking upstream Quartz 4.3.0** (`jackyzha0/quartz`) rather than scaffolding
fresh — the repo shares full git history with upstream (1323 commits total,
618 touching `quartz/`), with periodic `"Quartz sync: <date>"` merge commits
layered under the author's own customizations. Deployed to
`devops-dojo.ninja` via Vercel. Origin remote: `git@kumailr7:kumailr7/Devops-Dojo.git`
(SSH alias `kumailr7`), default/current branch `v4`.

⚠️ **A "Quartz sync" commit (`6c4bc329`, Aug 22 2024) actually merged in a
stranger's site config**, not just upstream framework code — it changed
`baseUrl` to `notes.yxy.ninja` and switched `analytics.provider` from
upstream's default `"plausible"` to `"google"` with a hardcoded `tagId:
"G-H0G1YKHC31"`. `baseUrl` was corrected in later commits, but the foreign
Google Analytics tag ID was carried forward unnoticed in every commit since —
meaning **every real visitor to devops-dojo.ninja was sending pageview data
to that other person's GA4 property** until this was found and removed
(§5/§6). Treat other values touched in that same "sync" commit (fonts,
colors, ignore patterns) as possibly copied-from-elsewhere too, not
necessarily original to this repo.

The project has been rebranded at least twice in its history — content still
carries traces of two earlier names, **"Ops-Catalyst"** (`content/Readme.md`)
and **"Opscatalyst"** (stale links in `content/index.md` pointing to
`kumailr7.github.io/Opscatalyst`) — before settling on "Devops-Dojo".

## 2. Architecture: stock Quartz vs. custom

Quartz is vendored in full under `quartz/` (not a git submodule or npm
dependency — `package.json` still literally identifies as
`@jackyzha0/quartz` v4.3.0). Three build stages (`quartz/processors/`:
parse → filter → emit) run transformer/filter/emitter plugins configured in
`quartz.config.ts`.

**Configured pipeline** (`quartz.config.ts`):
- Transformers: FrontMatter, TableOfContents (`maxDepth: 4`, wired twice —
  redundant, harmless), CreatedModifiedDate, SyntaxHighlighting
  (`github-light` / `poimandres`), ObsidianFlavoredMarkdown (checkboxes on),
  GitHubFlavoredMarkdown, CrawlLinks (`shortest`), Description, Latex (KaTeX).
- Filters: RemoveDrafts only.
- Emitters: AliasRedirects, ComponentResources, ContentPage, FolderPage,
  TagPage, ContentIndex (sitemap + RSS, limit 10), Assets, Static,
  NotFoundPage.
- **Unused but present in the codebase**: `Citations`, `OxHugoFlavouredMarkdown`,
  `HardLineBreaks` transformers; `ExplicitPublish` filter; `CNAME` emitter
  (makes sense — Vercel custom domain, not GitHub Pages).

**Custom, non-stock pieces added on top of the fork** (confirmed absent from
stock Quartz via commit history — `9f8b880`, `2e22996`, `0b0c7a7`, `05bdbf6`):
- `quartz/components/NavBar.tsx`, `BentoHome.tsx`, `AuroraBackground.tsx` —
  a bespoke "Architectural Terminal / Magic Bento" homepage, replacing
  stock's plain `PageTitle` header.
- `quartz/components/scripts/bento.inline.ts`, `vercelInsights.inline.ts` —
  Vercel Analytics/Speed Insights wiring.
- `quartz/styles/custom.scss` — custom theme layer.
- Full custom color palette + Google Fonts trio (Space Grotesk / Manrope /
  JetBrains Mono) in `quartz.config.ts`, not stock defaults.
- Typewriter effect on article titles (`05bdbf6`).
- **Orphaned component**: `Comments.tsx` (giscus) exists and is exported but
  is never wired into `quartz.layout.ts` (`afterBody: []`) — dead code,
  comments are not actually live on the site.

**Layout** (`quartz.layout.ts`): header = NavBar + Darkmode + AuroraBackground;
content pages get BentoHome, Breadcrumbs, ArticleTitle, ContentMeta (reading
time), TagList; left sidebar = Search, RecentNotes (desktop, limit 3),
Explorer (custom sort: folders first, loose files last); right sidebar =
TableOfContents (desktop), Backlinks, Graph.

## 3. Content inventory (`content/`)

**74 markdown files** across 7 top-level categories:

| Category | Count | Notes |
|---|---|---|
| AWS | 26 | Largest — Compute/ECS, Database, Networking, Security, Storage, Disaster Recovery |
| Security | 18 | + `Authentication/` subtree (JWT, OIDC, SSO, cookies, etc.) |
| System Design | 15 | Architectures, Cache, Compute, Load Balancers, Monitoring, Proxy |
| Kubernetes | 5 | Fundamentals, Monitoring, Security (Part-1/2) |
| Helm | 3 | Incl. flagship 855-line "Advance-topics.md" |
| Cloud-Native | 2 | Cilium/Tetragon, Envoy Proxy |
| IAC | 1 | Pulumi (566 lines) |

Every substantive category folder has its own `assets/` subfolder (13 total,
~98 PNGs). Only 2 posts pair a `.drawio` source with its `.png` export
(S3 Replication, ECR Pull Through Cache) — despite CLAUDE.md's stated
Mermaid/drawio preference, most diagrams in practice are plain screenshots.
`Security/assets/` is the largest (55 images).

**Deepest/flagship posts** (by length): `Helm/Advance-topics.md` (855 lines),
`IAC/Pulumi/Unleashing Pulumi.md` (566), `Kubernetes Security (Part-2)` (446),
`Helm/Creating Helm Charts.md` (428), `Security/Docker Image Hardening.md`
(388), `AWS/Storage/S3 Replication.md` (378).

**Thinnest/stub posts** (11–15 lines, glossary-style, no real elaboration):
`AWS/Storage/DataSync.md`, `AWS/Networking/AWS Transit Gateway.md`,
`Security/Authentication/Authentication.md`,
`Security/Terminologies/Shift-left Security.md`,
`AWS/Disaster Recovery/AWS Backup.md`, `AWS/Networking/AWS Subnet.md`.

### Frontmatter: two generations in practice

CLAUDE.md documents one frontmatter template, but only **2024+ posts**
actually use the full schema (`Author`, `Author Profile`, `tags`,
`Creation Date`, `Last Date`, `DocID`, `drafts`, `References`, `description`,
`Github Link`). **Pre-2024 posts** (most of System Design, Security theory
notes, `JWT.md`, `Load Balancer.md`) use a stripped legacy schema with only
`Author`/`Author Profile`/`tags`/`Creation Date`/`Last Date`/`References` —
no `DocID`, `drafts`, or `description` fields exist at all in those files.

- **`DocID`** present in only 13/74 files, all recent — convention confirmed
  as `{2-letter prefix}-{2-digit year}` (`SR-26`, `EC-26`, `KS-1-24`, etc.).
- **`drafts`**: no file anywhere is `drafts: true` — nothing is actually
  unpublished; the field is present-but-unused as a real workflow gate.
- **`tags`** casing is genuinely inconsistent (`aws` vs `Kubernetes` vs
  `system_design`) — CLAUDE.md's "use consistently per section" guidance is
  aspirational, not enforced by any linter.

### Root content files & known debris

- `content/index.md` — homepage; entire curated-links section still points
  to the old `kumailr7.github.io/Opscatalyst` GitHub Pages domain, not the
  live Vercel site. Networking section flagged "(Under heavy revision)".
- `content/About Me.md` — just embeds a `bento.me/kumail-rizvi` iframe, no
  actual prose bio in the file.
- `content/Readme.md` — separate from the repo-root README; has a
  bot-appended "Last verified deployment" timestamp line, suggesting some
  automation already touches this file.
- `content/WIKI.md` — a newer "Knowledge Index" scaffold with placeholder
  "(Empty - Agent to populate)" sections — looks like automation/agent
  tooling scaffolding rather than organic content.
- **`content/Test`** — a stray plain *file* (44 bytes, not a folder)
  containing `Testing Agent Publishing Loop Agent Note.md`, likely leftover
  debris from a prior automation test. Candidate for cleanup.
- Filename typo: `System Design/Architectures/Micro-servercies Architecture.md`.

## 4. `docs/` — vendored upstream, not part of the live build

`docs/` (index, `advanced/`, `features/`, `plugins/`, `tags/`, `images/`) is
almost entirely **stock upstream Quartz documentation**, inherited from the
fork — its git history is upstream commits, and it references
`jackyzha0/quartz` throughout. It is **not** built into the live site:
`quartz.config.ts` builds `content/` → `public/` (per `vercel.json`), and no
CI workflow touches `docs/`.

The one exception is `docs/deploy-vercel.md`, a short custom guide written by
the author (commit `9f8b880`) — but it still references the old repo name
`kumailr7/Opscatalyst`, a stale rename artifact.

⚠️ **Hazard**: `package.json`'s `"docs"` script
(`quartz build --serve -d docs`) is an upstream leftover for building
*Quartz's own* docs site. Running `npm run docs` would overwrite this
vendored folder with generated HTML — not something anyone should run here.

## 5. CI/CD, deployment, and config

- **`.github/workflows/ci.yaml`** ("Build and Test") — triggers on PR/push to
  `v4`. Both jobs are gated `if: github.repository == 'jackyzha0/quartz'`,
  an inherited upstream guard that means **this workflow never actually runs
  on this fork** (repo name mismatch). Effectively dead as-is.
- **`.github/workflows/deployment.yml`** ("Deploy to Vercel") — the only
  *active* pipeline. Triggers on push to `v4`; `npm ci` → `npx quartz build`
  → `vercel --prod` using `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`
  secrets. Recent commit history shows this was actively debugged for
  Vercel CLI/deployment errors.
- **Node version drift**: `.node-version` pins `20.9.0`, `ci.yaml` uses
  Node 20, but `deployment.yml` (the pipeline that actually runs) uses
  **Node 22** — inconsistent, worth reconciling if build issues ever appear.
- **`Dockerfile`** — simple two-stage `node:20-slim` build, final `CMD`
  is `npx quartz build --serve`. No `EXPOSE`.
- **`docker-compose.yml` does not exist anywhere in the repo** — this
  directly contradicts CLAUDE.md, which describes "Docker Compose (Node app
  on :3000, Postgres :5432, Redis :6380)" and lists it as a key file. There
  is no Postgres/Redis dependency at all; this is a static site generator
  with no database. **CLAUDE.md should be corrected** — this appears to be
  stale/copy-pasted documentation.
- **`makefile`** — trivial, single `sync` target (`npm run quartz sync`).
- **`vercel.json`** — `outputDirectory: "public"`, `cleanUrls: true`,
  `trailingSlash: false`.
- **`LICENSE.txt`** — MIT, still attributed to "(c) 2021 jackyzha0" (upstream
  author), not re-licensed/re-attributed to this fork.
- **`CODE_OF_CONDUCT.md`** — stock Citizen Code of Conduct, unmodified,
  still references the "Quartz community" and upstream contact email.
- **`templates/Chapter.md`** — the actual Obsidian Templater template new
  posts are created from; matches the modern frontmatter schema in
  CLAUDE.md.

## 6. Cleanup / accuracy backlog

**✅ Done:** foreign Google Analytics tag (`G-H0G1YKHC31`, belonging to
`notes.yxy.ninja`) removed from `quartz.config.ts` — `analytics` is now
`null`. Set up your own analytics provider (Plausible, GA4, Umami, etc.)
in that same field when ready.

Concrete, low-risk items surfaced by this survey that a future pass could
address:

1. Fix CLAUDE.md's Docker Compose / Postgres / Redis claims — none of that
   exists in this repo.
2. Remove or repurpose `content/Test` (stray debris file).
3. Fix stale `Opscatalyst`/GitHub Pages links in `content/index.md` and
   `docs/deploy-vercel.md` to point at the current Vercel/devops-dojo.ninja
   identity.
4. Fix typo: "Micro-servercies" → "Microservices".
5. Reconcile Node version across `.node-version` (20.9.0), `ci.yaml` (20),
   and `deployment.yml` (22).
6. Decide the fate of `ci.yaml` — it's currently a no-op due to the
   inherited `jackyzha0/quartz` repo-name gate; either fix the condition or
   remove the dead workflow.
7. Either wire up `Comments.tsx` (giscus) in `quartz.layout.ts` or remove it
   if comments aren't wanted.
8. Remove the duplicate `TableOfContents()` transformer registration in
   `quartz.config.ts`.
9. `content/WIKI.md` placeholder sections ("Agent to populate") are
   unresolved scaffolding — either populate or remove.
