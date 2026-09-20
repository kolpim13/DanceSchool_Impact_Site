import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await mkdir('dist/vendor', { recursive: true });
await cp('node_modules/openapi-fetch/dist/index.mjs', 'dist/vendor/openapi-fetch.js');
await cp('.build', 'dist/src', { recursive: true });
async function copyHtmlFiles(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const source = path.join(dir, item.name);
    if (item.isDirectory()) await copyHtmlFiles(source);
    else if (source.endsWith('.html')) {
      const destination = path.join('dist', source);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination);
    }
  }
}
await copyHtmlFiles('src/mobile');
async function copyStyles(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const source = path.join(dir, item.name);
    if (item.isDirectory()) await copyStyles(source);
    else if (source.endsWith('.css')) {
      const destination = path.join('dist', source);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination);
    }
  }
}
await copyStyles('src');
await writeFile('dist/index.html', await readFile('index.html'));
console.log('Built static registration page in dist/');
