import { getFirestore } from '../firebaseAdmin.js';

type PlayerIndexEntry = {
  fotmobId: string;
  name: string;
  photo: string;
};

let playerIndex: Map<string, PlayerIndexEntry> | null = null;
let indexBuiltAt = 0;
const INDEX_TTL_MS = 1000 * 60 * 30;

function normalizeKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lastName(name: string): string {
  const parts = normalizeKey(name).split(' ');
  return parts[parts.length - 1] ?? normalizeKey(name);
}

async function buildIndexFromFantasyTeams(): Promise<Map<string, PlayerIndexEntry>> {
  const map = new Map<string, PlayerIndexEntry>();
  const fs = getFirestore();
  const snap = await fs.collection('fantasy_teams').get();

  for (const doc of snap.docs) {
    const data = doc.data() as {
      players?: { id: string; name: string; shortName?: string; isCaptain?: boolean }[];
      playerIds?: string[];
    };
    const players = data.players ?? [];
    for (const p of players) {
      const fid = String(p.id ?? '').trim();
      if (!fid || fid.startsWith('guest_')) continue;
      const entry: PlayerIndexEntry = {
        fotmobId: fid,
        name: p.name,
        photo: `https://images.fotmob.com/image_resources/playerimages/${fid}.png`,
      };
      const keys = new Set([
        normalizeKey(p.name),
        normalizeKey(p.shortName ?? p.name),
        lastName(p.name),
      ]);
      for (const k of keys) {
        if (k.length >= 2 && !map.has(k)) map.set(k, entry);
      }
      map.set(fid, entry);
    }
  }

  return map;
}

export async function ensurePlayerIndex(): Promise<Map<string, PlayerIndexEntry>> {
  if (playerIndex && Date.now() - indexBuiltAt < INDEX_TTL_MS) return playerIndex;
  playerIndex = await buildIndexFromFantasyTeams();
  indexBuiltAt = Date.now();
  return playerIndex;
}

export function resolveFotmobPlayerId(
  index: Map<string, PlayerIndexEntry>,
  opts: { playerId?: string; playerName?: string }
): string | null {
  const rawId = opts.playerId?.trim();
  if (rawId && index.has(rawId)) return rawId;
  if (rawId && /^\d+$/.test(rawId)) return rawId;

  const name = opts.playerName?.trim();
  if (!name) return null;
  const full = normalizeKey(name);
  const hit = index.get(full) ?? index.get(lastName(name));
  return hit?.fotmobId ?? null;
}

export function invalidatePlayerIndex(): void {
  playerIndex = null;
  indexBuiltAt = 0;
}
