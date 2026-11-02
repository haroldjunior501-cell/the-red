/** Remplace les verts UI GOALYA par la palette bleue (hors couleurs nations type #009C3B). */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(process.cwd(), 'src');

const REPLACEMENTS = [
  ['#00C853', '#1a6fff'],
  ['#00c853', '#1a6fff'],
  ['#00FF85', '#1a6fff'],
  ['#00ff85', '#1a6fff'],
  ['#00E676', '#4d8fff'],
  ['#00e676', '#4d8fff'],
  ['#69F0AE', '#4d8fff'],
  ['#69f0ae', '#4d8fff'],
  ['#00FF87', '#4d8fff'],
  ['#009940', '#0d3d8a'],
  ['rgba(0,255,133,', 'rgba(26,111,255,'],
  ['rgba(0,200,83,', 'rgba(26,111,255,'],
  ['rgba(0,230,118,', 'rgba(77,143,255,'],
  ['#050E07', '#05080f'],
  ['#050e07', '#05080f'],
  ['#080C09', '#080c16'],
  ['#080c09', '#080c16'],
  ['#0A1209', '#0b1220'],
  ['#0a1209', '#0b1220'],
  ['#0D1410', '#0b1220'],
  ['#0d1410', '#0b1220'],
  ['#0C1C0E', '#0b1220'],
  ['#0c1c0e', '#0b1220'],
  ['#0D1F11', '#0b1220'],
  ['#0d1f11', '#0b1220'],
  ['#7A9A80', '#8896ab'],
  ['#7a9a80', '#8896ab'],
  ['#8A9A8E', '#8896ab'],
  ['#8a9a8e', '#8896ab'],
  ['#FFB800', '#c9a84c'],
  ['#ffb800', '#c9a84c'],
  ['#FF3B3B', '#e5382b'],
  ['#ff3b3b', '#e5382b'],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.ts', '.tsx'].includes(extname(p))) out.push(p);
  }
  return out;
}

let touched = 0;
for (const file of walk(root)) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of REPLACEMENTS) {
    text = text.split(from).join(to);
  }
  if (text !== before) {
    writeFileSync(file, text, 'utf8');
    touched += 1;
  }
}

console.log(`Updated ${touched} files under src/`);
