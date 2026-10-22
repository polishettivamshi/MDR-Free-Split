import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {defineConfig, type Plugin} from 'vite';
import {resolveSiteUrl} from './site.config.ts';

const rootDir = import.meta.dirname;

/**
 * Substitutes `%VITE_SITE_URL%` / `%SITE_URL%` with the resolved canonical
 * site URL.
 *
 * Two different mechanisms are needed:
 * - `index.html` goes through the HTML transform pipeline, where the
 *   placeholder is replaced before the file is written.
 * - Files in `public/` are copied verbatim by Vite after the bundle is
 *   written, so they are re-written in `closeBundle` instead.
 */
const siteUrlPlugin = (siteUrl: string): Plugin => {
  const substitute = (html: string) =>
    html.replaceAll('%VITE_SITE_URL%', siteUrl).replaceAll('%SITE_URL%', siteUrl);
  const publicFiles = ['robots.txt', 'sitemap.xml'];

  return {
    name: 'site-url',
    enforce: 'pre',

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return substitute(html);
      },
    },

    closeBundle() {
      for (const file of publicFiles) {
        const source = path.resolve(rootDir, 'public', file);
        if (!fs.existsSync(source)) continue;

        const target = path.resolve(rootDir, 'dist', file);
        const contents = substitute(fs.readFileSync(source, 'utf8'));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, contents, 'utf8');
      }
    },
  };
};

export default defineConfig(() => {
  const siteUrl = resolveSiteUrl();

  return {
    plugins: [react(), tailwindcss(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
