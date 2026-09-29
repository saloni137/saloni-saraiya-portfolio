import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
export const GET: APIRoute = ({ site }) => {
  const paths = ['/', '/resume/', ...projects.map((project) => `/work/${project.slug}/`)];
  const entries = site
    ? paths
        .map((path) => `<url><loc>${new URL(path, site).href.replace(/&/g, '&amp;')}</loc></url>`)
        .join('')
    : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
