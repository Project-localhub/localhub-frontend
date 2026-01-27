import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '..');

const app = express();

app.use('/assets', express.static(path.resolve(base, 'dist/client/assets'), { maxAge: '1y' }));

app.use('*', async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await fs.readFile(path.resolve(base, 'dist/client/index.html'), 'utf-8');
    const { render } = await import(path.resolve(base, 'dist/server/entry-server.js'));

    const { html: appHtml, queryState } = await render(url, {});

    const html = template
      .replace(`<!--ssr-outlet-->`, appHtml)
      .replace(
        `<!--ssr-state-->`,
        `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(queryState)}</script>`,
      );

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    console.error('SSR Error:', e);
    res.status(500).send('Internal Server Error');
  }
});

export default app;

