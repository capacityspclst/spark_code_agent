# DEPLOYMENT.md

## Static deployment
`npm run build` runs `vite build`, bundles the server renderer and then prerenders one HTML file per page into `dist/`:

- `dist/index.html` (/)
- `dist/services/index.html`
- `dist/training/index.html`
- `dist/engagements/index.html`
- `dist/about/index.html`
- `dist/contact/index.html`
- `dist/404.html`

Upload the `dist/` folder as it is to any static host. There is no backend. The photos are in `dist/images` (copied from `public/images`).

No SPA rewrite rule or fallback is needed, because every page is its own file. Do not add a `_redirects` catch-all or an index.html fallback in the server config.

Unknown addresses get `404.html`. Configure this on hosts that need it, for example nginx:

```nginx
location / {
  try_files $uri $uri/ =404;
}
error_page 404 /404.html;
```

To check a deployment, open `/services` (200, its own title) and an unknown address such as `/no-such-page` (status 404 showing "Page not found").

## SEO files
`dist/` also contains `robots.txt` (allows everything and points to the sitemap), `sitemap.xml` (the six pages at https://thebayesgroup.com) and `favicon.svg` (linked from every page). They are copied from `public/`.

## Security headers
Set these headers on the host:

- `Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS only)
- Serve everything over HTTPS and cache `assets/` (hashed file names) for a long time.
