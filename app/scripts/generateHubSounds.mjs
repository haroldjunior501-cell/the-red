import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'assets', 'sounds');
mkdirSync(outDir, { recursive: true });

function writeWav(fileName, durationSec, frequency, volume = 0.35) {
  const sampleRate = 22050;
  const sampleCount = Math.floor(sampleRate * durationSec);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t * 8) * Math.max(0, 1 - t / durationSec);
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), 44 + i * 2);
  }

  writeFileSync(join(outDir, fileName), buffer);
}

writeWav('goal.wav', 2.2, 180, 0.45);
writeWav('near_miss.wav', 1.4, 260, 0.28);
writeWav('penalty.wav', 4.8, 72, 0.32);
writeWav('red_card.wav', 0.9, 420, 0.5);
writeWav('chat_explode.wav', 1.8, 140, 0.3);
writeWav('historic.wav', 2.8, 110, 0.42);
writeWav('viral_ping.wav', 0.45, 880, 0.25);
writeWav('chaos_loop.wav', 3.2, 95, 0.35);
writeWav('ambient.wav', 4.5, 55, 0.18);

console.log(`Generated placeholder sounds in ${outDir}`);
