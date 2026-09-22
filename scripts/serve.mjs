// import http from 'node:http';
// import { readFile } from 'node:fs/promises';
// import path from 'node:path';
// const root = path.resolve('dist');
// const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.ttf': 'font/ttf' };

// /** Forward all backend response headers (notably Set-Cookie, dropped by default) to the browser. */
// function buildProxyHeaders(headers) {
//   const result = { 'Content-Type': headers.get('content-type') ?? 'application/octet-stream' };
//   const cookies = headers.getSetCookie?.() ?? [];
//   if (cookies.length) result['Set-Cookie'] = cookies;
//   return result;
// }

// http.createServer(async (req, res) => {
//   try {
//     const requestUrl = new URL(req.url, 'http://localhost');
//     const pathname = decodeURIComponent(requestUrl.pathname);
//     if (pathname.startsWith('/api/') || pathname.startsWith('/media/people')) {
//       const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
//       const backendResponse = await fetch(`http://127.0.0.1:8000${requestUrl.pathname}${requestUrl.search}`, {
//         method: req.method,
//         headers: req.headers,
//         body: hasBody ? req : undefined,
//         duplex: hasBody ? 'half' : undefined
//       });
//       res.writeHead(backendResponse.status, buildProxyHeaders(backendResponse.headers));
//       res.end(Buffer.from(await backendResponse.arrayBuffer()));
//       return;
//     }
//     const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
//     if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
//     const data = await readFile(file);
//     res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
//     res.end(data);
//   } catch { res.writeHead(404).end('Not found'); }
// }).listen(4173, '0.0.0.0', () => console.log('Preview: http://localhost:4173'));


import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Assumes this file is located at scripts/serve.mjs.
const root = fileURLToPath(new URL('../dist/', import.meta.url));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function isBackendPath(pathname) {
  return (
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/media' ||
    pathname.startsWith('/media/') ||
    pathname === '/docs' ||
    pathname.startsWith('/docs/') ||
    pathname === '/redoc' ||
    pathname === '/openapi.json'
  );
}

function proxyToBackend(req, res, url) {
  const upstream = http.request(
    {
      hostname: '127.0.0.1',
      port: 8000,
      path: url.pathname + url.search,
      method: req.method,
      headers: req.headers,
    },
    (backendResponse) => {
      // Preserves Set-Cookie arrays, Location, and other response headers.
      res.writeHead(
        backendResponse.statusCode ?? 502,
        backendResponse.headers,
      );

      backendResponse.on('error', () => res.destroy());
      backendResponse.pipe(res);
    },
  );

  upstream.on('error', (error) => {
    console.error('Backend proxy error:', error.message);

    if (!res.headersSent) {
      res.writeHead(502, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
      res.end('Backend unavailable');
    } else {
      res.destroy();
    }
  });

  req.on('aborted', () => upstream.destroy());

  res.on('close', () => {
    if (!res.writableEnded) upstream.destroy();
  });

  req.pipe(upstream);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (isBackendPath(url.pathname)) {
      proxyToBackend(req, res, url);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }

    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, file);

    // Prevent requests from escaping the dist directory.
    if (
      relative === '..' ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    ) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // Supports / and page directories such as /registration/.
    if ((await stat(file)).isDirectory()) {
      file = path.join(file, 'index.html');
    }

    const data = await readFile(file);

    res.writeHead(200, {
      'Content-Type':
        types[path.extname(file).toLowerCase()] ??
        'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-store',
    });

    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    const status =
      error instanceof URIError
        ? 400
        : ['ENOENT', 'ENOTDIR'].includes(error.code)
          ? 404
          : 500;

    if (status === 500) console.error(error);

    res.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
    });

    res.end(
      {
        400: 'Invalid request',
        404: 'Not found',
        500: 'Internal server error',
      }[status],
    );
  }
});

server.on('error', (error) => {
  console.error('Preview server failed:', error.message);
  process.exitCode = 1;
});

server.listen(4173, '127.0.0.1', () => {
  console.log('Local preview: http://127.0.0.1:4173');
  console.log('For phone testing, open your Caddy HTTPS address.');
});