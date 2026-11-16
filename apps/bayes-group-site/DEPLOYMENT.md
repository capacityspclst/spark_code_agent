# DEPLOYMENT.md

## Static deployment
The site is prerendered to static HTML files in the `dist/` folder. Upload the entire `dist/` directory to a static host. No SPA rewrite rule is needed because each page has its own `index.html`. Unknown addresses return `404.html`.
