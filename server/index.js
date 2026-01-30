import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.cwd();

async function createServer() {
  const app = express();

  let vite;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(base, 'dist/client'), { index: false }));
  }

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template;
      let render;

      if (!isProduction) {
        template = await fs.readFile(path.resolve(base, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
      } else {
        template = await fs.readFile(path.resolve(base, 'dist/client/index.html'), 'utf-8');
        render = (await import(path.resolve(base, 'dist/server/entry-server.js'))).render;
      }

      const { html: appHtml, dehydratedState } = await render(url, {});

      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace(
          `<!--ssr-state-->`,
          `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)}</script>`,
        );

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      console.error('SSR Error:', e);
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      // SSR 실패 시 클라이언트 사이드 렌더링으로 폴백
      try {
        const template = isProduction
          ? await fs.readFile(path.resolve(base, 'dist/client/index.html'), 'utf-8')
          : await fs.readFile(path.resolve(base, 'index.html'), 'utf-8');
        const fallbackHtml = template.replace(`<!--ssr-outlet-->`, '<div id="root"></div>');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        res.status(500).send('Internal Server Error');
      }
    }
  });

  return { app };
}

createServer().then(({ app }) => {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
});
