/**
 * Télécharge les SFX Hub depuis Mixkit (licence Mixkit — usage projet).
 * NE PAS générer de fichiers vides : lancer `npm run download:sounds` si les MP3 manquent.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'assets', 'sounds');
mkdirSync(outDir, { recursive: true });

const FILES = {
  'ambient.mp3': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  'match_start.mp3': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  'near_miss.mp3': 'https://assets.mixkit.co/active_storage/sfx/2097/2097-preview.mp3',
  'goal.mp3': 'https://assets.mixkit.co/active_storage/sfx/2096/2096-preview.mp3',
  'red_card.mp3': 'https://assets.mixkit.co/active_storage/sfx/2803/2803-preview.mp3',
  'penalty.mp3': 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  'chaos.mp3': 'https://assets.mixkit.co/active_storage/sfx/1245/1245-preview.mp3',
  'end_match.mp3': 'https://assets.mixkit.co/active_storage/sfx/2090/2090-preview.mp3',
  'chat_boom.mp3': 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
};

for (const [name, url] of Object.entries(FILES)) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${name}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) {
    console.warn(`WARN ${name}: fichier très petit (${buf.length} bytes)`);
  }
  writeFileSync(join(outDir, name), buf);
  console.log(`OK ${name} (${buf.length} bytes)`);
}
