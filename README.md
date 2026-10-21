# HayahLab website

Static site (HTML/CSS/JS) plus one Vercel serverless function for the inquiry form. No build step.

## Run locally
`npx vercel dev` (runs the page and `/api/inquiry`). For a quick look without the form API: `python3 -m http.server 8000`.

## Configure
1. `site-config.js`: add your email, confirm WhatsApp, set your domain.
2. Search/replace `hayahlab.com` in `index.html`, `work/ashgrove.html`, `sitemap.xml`, `robots.txt`.
3. Form: create a free Resend account, verify your domain, then set `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` in Vercel > Settings > Environment Variables (see `.env.example`). Until set, the form says it isn't connected and points visitors to WhatsApp.

## Deploy
Push to GitHub, import the repo in Vercel (framework: Other, no build command), add the env vars, deploy, then add your domain.

## Add projects
Duplicate `work/ashgrove.html`, add a card in `index.html`, add the URL to `sitemap.xml`.
