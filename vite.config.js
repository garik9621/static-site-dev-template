import { resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

// Автоматически собираем все HTML-файлы из корня проекта
const htmlFiles = readdirSync(resolve(__dirname, 'src'))
  .filter((file) => file.endsWith('.html'));

const input = Object.fromEntries(
  htmlFiles.map((file) => [
    file.replace('.html', ''),
    resolve(__dirname, 'src', file),
  ]),
);

function svgSpriteInline(iconsDir) {
  function buildSprite() {
    const dir = resolve(iconsDir);
    let files;
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.svg'));
    } catch {
      return '';
    }

    const symbols = files.map((file) => {
      const id = file.replace('.svg', '');
      const content = readFileSync(resolve(dir, file), 'utf-8');
      return content
        .replace(/<svg([^>]*)>/, (_, attrs) => {
          const viewBox = attrs.match(/viewBox="[^"]*"/)?.[0] || '';
          return `<symbol id="${id}" ${viewBox}>`;
        })
        .replace(/<\/svg>/, '</symbol>');
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>`;
  }

  const placeholder = '<!--SVG_SPRITE-->';

  return {
    name: 'svg-sprite-inline',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const originalEnd = res.end;
        res.end = function (chunk, ...args) {
          if (typeof chunk === 'string' && chunk.includes(placeholder)) {
            chunk = chunk.replace(placeholder, buildSprite());
          }
          return originalEnd.call(this, chunk, ...args);
        };
        next();
      });
    },

    transformIndexHtml(html) {
      return html.replace(placeholder, buildSprite());
    },
  };
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input,
    },
  },
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/components'),
    }),
    svgSpriteInline(resolve(__dirname, 'src/icons')),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
