/** Adoucit le bleu néon (#1a6fff) vers la palette confortable. */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(process.cwd(), 'src');

const REPLACEMENTS = [
  ['#1a6fff', '#5a8ec4'],
  ['#1A6FFF', '#5a8ec4'],
  ['#4d8fff', '#7aa8d4'],
  ['#4D8FFF', '#7aa8d4'],
  ['#0d3d8a', '#3d5f82'],
  ['#00b4ff', '#6eb8d4'],
  ['rgba(26,111,255,', 'rgba(90, 142, 196,'],
  ['rgba(26, 111, 255,', 'rgba(90, 142, 196,'],
  ['#05080f', '#070b14'],
  ['#080c16', '#0b111c'],
  ['#0b1220', '#0f1623'],
  ['#101928', '#131c2c'],
  ['#141f30', '#1a2436'],
  ['#f0f4ff', '#e4e9f2'],
  ['#e5382b', '#d9554a'],
  ['#c9a84c', '#bfa968'],
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
  if (file.endsWith('colors.ts')) continue;
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of REPLACEMENTS) text = text.split(from).join(to);
  if (text !== before) {
    writeFileSync(file, text, 'utf8');
    touched += 1;
  }
}

console.log(`Softened ${touched} files`);
