# Deploy DevOps-Dojo to Vercel

The repo is set up to deploy on **Vercel** via `vercel.json`. You can keep using **GitHub Pages** or switch to Vercel.

## Deploy on Vercel

1. **Push the repo** (including `vercel.json`) to GitHub.

2. **Import the project in Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
   - Click **Add New…** → **Project**.
   - Import your GitHub repo (e.g. `kumailr7/Opscatalyst`).
   - Vercel will detect the config from `vercel.json`:
     - **Build Command:** `npx quartz build`
     - **Output Directory:** `public`
     - **Install Command:** `npm ci`
   - Click **Deploy**.

3. **Custom domain (optional)**  
   The site is set to `baseUrl: "devops-dojo.vercel.app"`. To use a custom domain on Vercel:
   - In the Vercel project: **Settings** → **Domains** → add your domain.
   - In your DNS, add the CNAME record Vercel shows (usually `cname.vercel-dns.com`).
   - Update `baseUrl` in `quartz.config.ts` to match your custom domain.
   - If you use the default Vercel URL (e.g. `devops-dojo.vercel.app`) instead, set `baseUrl` in `quartz.config.ts` to that URL so sitemap/RSS/OG links are correct.

4. **Automatic deploys**  
   Each push to the branch you connected (e.g. `v4` or `main`) will trigger a new build and deploy.

## Turn off GitHub Pages (optional)

If you no longer want GitHub Pages:

1. In the repo: **Settings** → **Pages** → set **Source** to “None” (or delete the GitHub Actions deployment).
2. Optionally remove or disable the workflow:  
   `.github/workflows/deployment.yml` (rename to `deployment.yml.bak` or delete the file and push).

Your workflow stays the same: write in Obsidian, push to the repo; Vercel will build and deploy.
