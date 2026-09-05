import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoutes = new Set(['/', '/index.html', '/demo', '/privacy', '/terms', '/about']);

export default defineConfig({
  plugins: [{
    name: 'preview-static-web-app-404',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://preview.local').pathname;
        const acceptsDocument = request.headers.accept?.includes('text/html');
        if (!acceptsDocument || appRoutes.has(pathname) || pathname === '/404.html') {
          next();
          return;
        }
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(readFileSync(resolve('dist/404.html')));
      });
    },
  }],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
