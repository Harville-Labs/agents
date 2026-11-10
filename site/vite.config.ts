import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// One prerendered page. Relative asset paths (the default) let the build serve from the
// GitHub Pages project path or a local preview without setting paths.base.
export default defineConfig({
  plugins: [tailwindcss(), sveltekit({ preprocess: vitePreprocess(), adapter: adapter() })],
});
