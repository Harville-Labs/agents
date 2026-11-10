import { existsSync } from 'node:fs';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Relative asset paths (the default) let the build serve from the
// GitHub Pages project path or a local preview without setting paths.base.
// Raw HTML pages live in static/ (the field guide). The prerender crawler doesn't map /guide/ to
// static/guide/index.html, so a 404 is fine only when that file exists.
export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
      prerender: {
        handleHttpError: ({ path, message }) => {
          if (path.endsWith('/') && existsSync(`static${path}index.html`)) return;
          throw new Error(message);
        },
      },
    }),
  ],
});
