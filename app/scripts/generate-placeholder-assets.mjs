/** Génère des PNG minimaux pour icon/splash (évite erreurs Expo si fichiers absents). */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const root = join(process.cwd(), 'assets');
const files = [
  'icon.png',
  'splash-icon.png',
  'adaptive-icon.png',
  'favicon.png',
  'images/trophy.png',
];

mkdirSync(join(root, 'images'), { recursive: true });
for (const rel of files) {
  const path = join(root, rel);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, PNG_1x1);
  console.log('wrote', rel);
}
