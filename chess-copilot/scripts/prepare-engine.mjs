import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('node_modules/stockfish');
const dest = path.resolve('public/engine');
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}
const files = walk(root);
const jsFiles = files.filter(f => /stockfish.*(?:lite|single).*\.js$/i.test(path.basename(f)));
const candidates = jsFiles.length ? jsFiles : files.filter(f => /^stockfish.*\.js$/i.test(path.basename(f)));
const js = candidates.sort((a,b) => {
  const score = f => (/single/i.test(f) ? 0 : 10) + (/lite/i.test(f) ? 0 : 5) + f.length / 1000;
  return score(a) - score(b);
})[0];
if (!js) {
  console.error('Nenhum arquivo JavaScript do Stockfish encontrado. Arquivos:', files.slice(0,40));
  process.exit(1);
}
const prefix = js.slice(0, -3);
const assets = files.filter(f => f === js || f.startsWith(prefix + '.'));
fs.mkdirSync(dest, { recursive: true });
for (const f of assets) fs.copyFileSync(f, path.join(dest, path.basename(f)));
fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify({ script: path.basename(js) }, null, 2));
console.log('Stockfish pronto:', assets.map(f => path.basename(f)).join(', '));
