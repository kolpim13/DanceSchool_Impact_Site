import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.ttf': 'font/ttf' };
http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname.startsWith('/api/') || pathname.startsWith('/media/people')) {
      const backendResponse = await fetch(`http://127.0.0.1:8000${requestUrl.pathname}${requestUrl.search}`, { method: req.method, headers: req.headers });
      res.writeHead(backendResponse.status, { 'Content-Type': backendResponse.headers.get('content-type') ?? 'application/octet-stream' });
      res.end(Buffer.from(await backendResponse.arrayBuffer()));
      return;
    }
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4173, '0.0.0.0', () => console.log('Preview: http://localhost:4173'));
