import { defineConfig } from 'astro/config';

// Vercel supplies VERCEL_PROJECT_PRODUCTION_URL. Set SITE_URL for a custom domain.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
