import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('node_modules/stockfish');
const dest = path.resolve('public/engine');
function walk(dir) { if(!fs.existsSync(dir))return []; return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const files=walk(root);
const candidates=files.filter(f=>/lite-single\.js$/i.test(f));
if(!candidates.length) { console.error('Não foi encontrado Stockfish lite-single no pacote. Verifique a versão instalada.'); process.exit(1); }
const js=candidates.sort((a,b)=>a.length-b.length)[0];
const prefix=js.slice(0,-3);
const assets=files.filter(f=>f===js||f.startsWith(prefix+'.'));
fs.mkdirSync(dest,{recursive:true});
for(const f of assets)fs.copyFileSync(f,path.join(dest,path.basename(f)));
fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify({script:path.basename(js)},null,2));
console.log('Stockfish pronto:',assets.map(f=>path.basename(f)).join(', '));
