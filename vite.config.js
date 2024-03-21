import { resolve } from 'path';
import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import eslint from 'vite-plugin-eslint';
import fs from 'fs';

function generateInputObject() {
  const srcDir = resolve(__dirname, 'src');
  const files = fs.readdirSync(srcDir);
  const input = {};

  files.forEach((file) => {
    if (file.endsWith('.html')) {
      const name = file.split('.')[0];
      input[name] = resolve(srcDir, file);
    }
  });

  return input;
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_PROJECT_VERSION': JSON.stringify(
      require('./package.json').version,
    ),
  },
  publicDir: 'public',
  root: resolve(__dirname, 'src'),
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: generateInputObject(),
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 8080,
  },
  plugins: [
    eslint({
      cache: false,
      fix: true,
    }),
    ViteMinifyPlugin({}),
  ],
});
