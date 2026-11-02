import { countryMeta } from '../services/gamesService';
import type { FantasyPlayer, FantasyPosition } from '../types/games.types';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function mapApiPosition(apiPos: string): FantasyPosition {
  const p = apiPos.toLowerCase();
  if (p.includes('goal') || p === 'gk') return 'GK';
  if (p.includes('def') || p.includes('back')) return 'DEF';
  if (p.includes('mid')) return 'MID';
  return 'ATT';
}

export function shortNameFrom(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return full.slice(0, 12);
  return parts[parts.length - 1] ?? full;
}

export function calculateFantasyPrice(goals: number, rating: number, assists: number): number {
  const base = 7;
  const goalBonus = goals * 0.3;
  const assistBonus = assists * 0.15;
  const ratingBonus = (rating - 7) * 1.5;
  return Math.min(17, Math.max(7, Math.round(base + goalBonus + ratingBonus + assistBonus)));
}

function pushPlayer(
  out: FantasyPlayer[],
  row: Record<string, unknown>,
  teamName: string,
  countryCode: string,
  idx: number
): void {
  const name = asString(row.name ?? row.player_name ?? row.full_name);
  if (!name) return;
  const position = mapApiPosition(asString(row.position ?? row.pos ?? row.role));
  const goals = asNumber(row.goals ?? row.goal, 0);
  const assists = asNumber(row.assists ?? row.assist, 0);
  const rating = asNumber(row.rating ?? row.avg_rating, 7);
  const jerseyNumber = asNumber(row.number ?? row.jersey ?? row.shirt_number, (idx % 23) + 1);
  const meta = countryMeta(countryCode);
  const price = calculateFantasyPrice(goals, rating, assists);
  const fantasyPoints = Math.round(goals * 10 + assists * 6 + rating * 4);

  out.push({
    id: asString(row.id ?? row.player_id) || `${countryCode}-${name}-${idx}`,
    name,
    shortName: shortNameFrom(name),
    country: teamName || meta.name,
    countryCode: countryCode.toUpperCase(),
    jerseyNumber,
    position,
    price,
    goals,
    assists,
    rating,
    fantasyPoints,
    totalPoints: fantasyPoints,
  });
}

function extractPlayerRows(payload: unknown): FantasyPlayer[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  const candidates: unknown[] = [];

  for (const key of ['players', 'squads', 'participants', 'teams'] as const) {
    const arr = data[key];
    if (Array.isArray(arr)) candidates.push(...arr);
  }

  const players: FantasyPlayer[] = [];
  for (const item of candidates) {
    const team = asRecord(item);
    if (!team) continue;
    const teamName = asString(team.name ?? team.team_name);
    const countryCode =
      asString(team.country_code ?? team.iso ?? team.code).toUpperCase() ||
      asString(team.id).slice(0, 3).toUpperCase();
    const squad = team.players ?? team.squad ?? team.roster;
    if (Array.isArray(squad)) {
      squad.forEach((p, idx) => {
        const pr = asRecord(p);
        if (pr) pushPlayer(players, pr, teamName, countryCode, idx);
      });
    } else {
      const pr = asRecord(team.player);
      if (pr) pushPlayer(players, pr, teamName, countryCode, 0);
    }
  }

  if (players.length) return players;

  const flat = data.players;
  if (Array.isArray(flat)) {
    flat.forEach((p, idx) => {
      const pr = asRecord(p);
      if (pr) {
        pushPlayer(
          players,
          pr,
          asString(pr.team_name ?? pr.country),
          asString(pr.country_code ?? pr.iso ?? 'UNK'),
          idx
        );
      }
    });
  }
  return players;
}

export function parseFantasyPlayersFromParticipants(payload: unknown): FantasyPlayer[] {
  return extractPlayerRows(payload);
}
