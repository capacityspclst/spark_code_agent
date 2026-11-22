import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AppRoutes } from './App';
import { getPageMeta, NOT_FOUND_PAGE } from './seo';

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  );
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildPageHtml(template: string, url: string): string {
  // remove existing meta tags etc.
  let html = template.replace(/<title[^>]*>.*?<\/title>/s, '');
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<link\s+rel="icon"[^>]*>/gi, '');

  const meta = getPageMeta(url);
  const titleTag = `<title>${escapeAttr(meta.title)}</title>`;
  const descTag = `<meta name="description" content="${escapeAttr(meta.description)}">`;
  const ogTitle = `<meta property="og:title" content="${escapeAttr(meta.title)}">`;
  const ogDesc = `<meta property="og:description" content="${escapeAttr(meta.description)}">`;
  const ogType = `<meta property="og:type" content="website">`;
  const ogSite = `<meta property="og:site_name" content="${escapeAttr('The Bayes Group')}">`;
  const canonical = `<link rel="canonical" href="${escapeAttr('https://thebayesgroup.com' + meta.path)}">`;
  const icon = `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`;

  const headInsert = [titleTag, descTag, ogTitle, ogDesc, ogType, ogSite, canonical, icon].join('\n');

  // Insert before </head>
  html = html.replace('</head>', `${headInsert}\n</head>`);

  // Insert rendered content into #root
  const rendered = render(url);
  // Remove any <title> elements inside SVGs to avoid duplicate <title> tags in the document head.
  const sanitized = rendered.replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, (svg) =>
    svg.replace(/<title[^>]*>.*?<\/title>/gi, ''),
  );
  html = html.replace('<div id="root"></div>', `<div id="root">${sanitized}</div>`);

  return html;
}
