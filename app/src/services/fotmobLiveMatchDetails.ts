/**
 * Parseur matchDetails FotMob pour le centre Live THE RED
 * (score, chronologie, stats, compositions).
 */
import { fotmobGet, num, rec, str } from './fotmobHttp';
import type { MatchEvent, MatchEventType, LiveMatchStatus } from '../types/live.types';
import type { PremiumMatchEvent } from '../types/liveMatchEvent';
import type { ParsedLiveMatchStats, LiveStatRow } from '../utils/liveMatchStatsParse';

export type FotmobLiveMatchBundle = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  status: LiveMatchStatus;
  competition: string;
  events: MatchEvent[];
  premiumEvents: PremiumMatchEvent[];
  stats: ParsedLiveMatchStats | null;
  /** Format attendu par LiveLineupsPanel */
  lineups: Record<string, unknown> | null;
  homeName: string;
  awayName: string;
  homeId: string;
  awayId: string;
};

const STAT_LABELS: Record<string, string> = {
  BallPossesion: 'Possession',
  expected_goals: 'xG',
  total_shots: 'Tirs',
  ShotsOnTarget: 'Tirs cadrés',
  BigChanceCreated: 'Grosses occasions',
  touches_opp_box: 'Touches surface adv.',
  accurate_passes: 'Passes réussies',
  CornerTakes: 'Corners',
  FoulsCommitted: 'Fautes',
  YellowCards: 'Cartons jaunes',
  RedCards: 'Cartons rouges',
  saves: 'Arrêts',
};

function mapStatus(headerStatus: Record<string, unknown> | null): LiveMatchStatus {
  if (!headerStatus) return 'upcoming';
  if (headerStatus.cancelled) return 'upcoming';
  if (headerStatus.finished) return 'finished';
  if (!headerStatus.started) return 'upcoming';
  const reason = str(rec(headerStatus.reason)?.short ?? rec(headerStatus.reason)?.long).toUpperCase();
  if (reason.includes('HT') || reason.includes('HALF')) return 'halftime';
  if (reason.includes('ET') || reason.includes('EXTRA')) return 'extra_time';
  if (reason.includes('PEN')) return 'penalties';
  return 'live';
}

function minuteFromStatus(headerStatus: Record<string, unknown> | null, status: LiveMatchStatus): string {
  if (!headerStatus) return '';
  if (status === 'finished') return 'FT';
  if (status === 'halftime') return 'HT';
  if (status === 'upcoming') return '';
  const live = rec(headerStatus.liveTime) ?? rec(headerStatus);
  const min = num(live?.min ?? live?.minute ?? headerStatus.minute);
  const added = num(live?.addedTime ?? live?.injuryTime);
  if (min == null) {
    const reason = str(rec(headerStatus.reason)?.short);
    return reason || "'";
  }
  if (added && added > 0) return `${min}+${added}`;
  return String(min);
}

function mapEventType(raw: string, card?: string, goalDesc?: string): MatchEventType | null {
  const t = raw.toLowerCase();
  if (t === 'goal') {
    if (String(goalDesc).toLowerCase().includes('pen')) return 'penalty';
    return 'goal';
  }
  if (t === 'card') {
    const c = String(card ?? '').toLowerCase();
    if (c.includes('red')) return 'redcard';
    return 'yellowcard';
  }
  if (t === 'substitution') return 'substitution';
  return null;
}

function mapPremiumType(
  raw: string,
  card?: string
): PremiumMatchEvent['type'] | null {
  const t = raw.toLowerCase();
  if (t === 'goal') return 'goal';
  if (t === 'card') {
    const c = String(card ?? '').toLowerCase();
    return c.includes('red') ? 'red_card' : 'yellow_card';
  }
  if (t === 'substitution') return 'substitution';
  return null;
}

function parseEvents(payload: unknown): { events: MatchEvent[]; premium: PremiumMatchEvent[] } {
  const root = rec(payload) ?? {};
  const content = rec(root.content) ?? {};
  const facts = rec(content.matchFacts) ?? {};
  const block = rec(facts.events) ?? {};
  const list = Array.isArray(block.events) ? block.events : [];
  const events: MatchEvent[] = [];
  const premium: PremiumMatchEvent[] = [];

  for (const row of list) {
    const o = rec(row);
    if (!o) continue;
    const typeRaw = str(o.type);
    const card = str(o.card);
    const legacyType = mapEventType(typeRaw, card, str(o.goalDescription));
    const premiumType = mapPremiumType(typeRaw, card);
    if (!legacyType || !premiumType) continue;

    const minute = num(o.time, 0) ?? 0;
    const extra = num(o.overloadTime);
    const team: 'home' | 'away' = o.isHome === true ? 'home' : 'away';
    const player = rec(o.player);
    let playerName = str(o.nameStr ?? o.fullName ?? player?.name, '—');
    let assistName: string | undefined;
    let incomingPlayer: string | undefined;
    let outgoingPlayer: string | undefined;

    if (premiumType === 'substitution' && Array.isArray(o.swap) && o.swap.length >= 2) {
      const inn = rec(o.swap[0]);
      const out = rec(o.swap[1]);
      incomingPlayer = str(inn?.name);
      outgoingPlayer = str(out?.name);
      playerName = incomingPlayer || playerName;
    }
    if (premiumType === 'goal') {
      assistName = str(o.assistInput) || undefined;
    }

    const id = str(o.eventId ?? o.reactKey, `${typeRaw}-${minute}-${playerName}`);
    const minuteLabel =
      extra != null && extra > 0 ? `${minute}+${extra}` : String(minute || '');

    events.push({
      id,
      type: legacyType,
      minute: minuteLabel,
      player_name: playerName,
      team,
    });

    premium.push({
      id,
      minute,
      extraMinute: extra != null && extra > 0 ? extra : undefined,
      type: premiumType,
      team,
      playerName,
      assistName,
      incomingPlayer,
      outgoingPlayer,
    });
  }

  return { events, premium };
}

function parseStats(payload: unknown): ParsedLiveMatchStats | null {
  const root = rec(payload) ?? {};
  const content = rec(root.content) ?? {};
  const statsRoot = rec(content.stats) ?? {};
  const periods = rec(statsRoot.Periods) ?? {};
  const all = rec(periods.All) ?? {};
  const groups = Array.isArray(all.stats) ? all.stats : [];
  const rows: LiveStatRow[] = [];
  let possessionHome = 50;
  let possessionAway = 50;
  let dangerousHome = 0;
  let dangerousAway = 0;

  for (const group of groups) {
    const g = rec(group);
    const inner = Array.isArray(g?.stats) ? g!.stats : [];
    for (const s of inner) {
      const o = rec(s);
      if (!o) continue;
      const key = str(o.key ?? o.title);
      const vals = Array.isArray(o.stats) ? o.stats : [];
      const home = Number(vals[0] ?? 0);
      const away = Number(vals[1] ?? 0);
      if (!Number.isFinite(home) || !Number.isFinite(away)) continue;
      const label = STAT_LABELS[key] ?? str(o.title, key);
      const isPercent = key.toLowerCase().includes('possession') || str(o.format) === 'percent';
      rows.push({ key, label, home, away, isPercent });
      if (key === 'BallPossesion' || key.toLowerCase().includes('possession')) {
        possessionHome = home;
        possessionAway = away;
      }
      if (key.includes('touches_opp') || key.toLowerCase().includes('dangerous')) {
        dangerousHome = home;
        dangerousAway = away;
      }
    }
  }

  if (!rows.length) return null;
  return { possessionHome, possessionAway, dangerousHome, dangerousAway, rows };
}

function lineupNames(side: unknown): string[] {
  const block = rec(side);
  if (!block) return [];
  const starters = Array.isArray(block.starters) ? block.starters : [];
  const names: string[] = [];
  for (const p of starters) {
    const o = rec(p);
    const n = str(o?.name ?? o?.fullName).trim();
    if (n) names.push(n);
  }
  return names.slice(0, 11);
}

function parseLineups(payload: unknown): Record<string, unknown> | null {
  const root = rec(payload) ?? {};
  const content = rec(root.content) ?? {};
  const lineup = rec(content.lineup);
  if (!lineup) return null;
  const home = lineupNames(lineup.homeTeam);
  const away = lineupNames(lineup.awayTeam);
  if (!home.length && !away.length) return null;
  return {
    home: { lineup: home, formation: str(rec(lineup.homeTeam)?.formation) },
    away: { lineup: away, formation: str(rec(lineup.awayTeam)?.formation) },
  };
}

export function parseFotmobLiveMatchDetails(
  payload: unknown,
  matchIdFallback = ''
): FotmobLiveMatchBundle | null {
  const root = rec(payload);
  if (!root) return null;
  const header = rec(root.header) ?? {};
  const general = rec(root.general) ?? {};
  const teams = Array.isArray(header.teams) ? header.teams : [];
  const home = rec(teams[0]) ?? {};
  const away = rec(teams[1]) ?? {};
  const headerStatus = rec(header.status);
  const status = mapStatus(headerStatus);
  const { events, premium } = parseEvents(payload);

  return {
    matchId: str(general.matchId ?? matchIdFallback),
    homeScore: num(home.score, 0) ?? 0,
    awayScore: num(away.score, 0) ?? 0,
    minute: minuteFromStatus(headerStatus, status),
    status,
    competition: str(general.leagueName ?? general.parentLeagueName, 'Match'),
    events,
    premiumEvents: premium,
    stats: parseStats(payload),
    lineups: parseLineups(payload),
    homeName: str(home.name, 'Home'),
    awayName: str(away.name, 'Away'),
    homeId: str(home.id),
    awayId: str(away.id),
  };
}

export async function fetchFotmobLiveMatchDetails(
  matchId: string,
  force = false
): Promise<FotmobLiveMatchBundle | null> {
  if (!matchId) return null;
  const json = await fotmobGet(`/matchDetails?matchId=${encodeURIComponent(matchId)}`, {
    ttlMs: force ? 0 : 12_000,
    force,
  });
  return parseFotmobLiveMatchDetails(json, matchId);
}
