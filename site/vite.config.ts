import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// A relative base lets the same build serve from a GitHub Pages project path or a local preview.
export default defineConfig({ base: './', plugins: [tailwindcss()] });
