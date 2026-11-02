import type { MatchEvent, MatchEventType } from '../types/live.types';
import type { ParsedApiMatchEvent } from '../types/planetEvents';
import type { PremiumMatchEvent, PremiumMatchEventType } from '../types/liveMatchEvent';

const HOME = '#2979FF';
const AWAY = '#E5382B';
const GOLD = '#F0B429';
const SUB = '#43D17A';

export function teamGlowColor(team: 'home' | 'away'): string {
  return team === 'home' ? HOME : AWAY;
}

export function eventAccentColor(type: PremiumMatchEventType, team: 'home' | 'away'): string {
  if (type === 'yellow_card') return GOLD;
  if (type === 'red_card') return AWAY;
  if (type === 'substitution') return SUB;
  return team === 'home' ? HOME : AWAY;
}

function parseMinuteLabel(raw: string | number | undefined): { minute: number; extraMinute?: number } {
  if (typeof raw === 'number' && raw > 0) return { minute: raw };
  const s = String(raw ?? '').trim().replace("'", '');
  if (!s) return { minute: 0 };
  const plus = s.match(/^(\d+)\+(\d+)$/);
  if (plus) return { minute: Number(plus[1]), extraMinute: Number(plus[2]) };
  const n = Number(s);
  return { minute: Number.isFinite(n) ? n : 0 };
}

function mapLegacyType(t: MatchEventType): PremiumMatchEventType {
  if (t === 'goal' || t === 'penalty') return 'goal';
  if (t === 'yellowcard') return 'yellow_card';
  if (t === 'redcard') return 'red_card';
  return 'substitution';
}

function mapApiType(raw: string): PremiumMatchEventType {
  const t = raw.toLowerCase();
  if (t.includes('goal') || t.includes('pen')) return 'goal';
  if (t.includes('yellow')) return 'yellow_card';
  if (t.includes('red')) return 'red_card';
  return 'substitution';
}

export function formatEventMinute(event: PremiumMatchEvent): string {
  if (event.extraMinute != null && event.extraMinute > 0) {
    return `${event.minute}+${event.extraMinute}'`;
  }
  if (event.minute > 0) return `${event.minute}'`;
  return "0'";
}

export function premiumEventFromLegacy(e: MatchEvent): PremiumMatchEvent {
  const { minute, extraMinute } = parseMinuteLabel(e.minute);
  return {
    id: e.id,
    minute,
    extraMinute,
    type: mapLegacyType(e.type),
    team: e.team,
    playerName: e.player_name,
  };
}

export function premiumEventFromApi(
  e: ParsedApiMatchEvent,
  homeId: string,
  awayId: string,
  homeCode: string,
  awayCode: string,
  row?: Record<string, unknown>
): PremiumMatchEvent {
  const hId = homeId.toUpperCase();
  const aId = awayId.toUpperCase();
  const hCode = homeCode.toUpperCase();
  const aCode = awayCode.toUpperCase();
  const tc = e.teamCode.toUpperCase();
  const team: 'home' | 'away' =
    tc === hId || tc === hCode || (hCode.length >= 3 && tc.includes(hCode.slice(0, 3))) ? 'home' : 'away';

  const extraRaw = row?.extra_minute ?? row?.extra_time ?? row?.injury_time;
  const extraMinute =
    typeof extraRaw === 'number' && extraRaw > 0
      ? extraRaw
      : parseMinuteLabel(String(row?.minute ?? e.minute)).extraMinute;

  const minute =
    e.minute != null && e.minute > 0
      ? e.minute
      : parseMinuteLabel(String(row?.minute ?? row?.time)).minute;

  const assistName =
    asStr(row?.assist) ||
    asStr(row?.assist_name) ||
    asStr(row?.related_player) ||
    asStr(row?.related_player_name);

  const incoming =
    asStr(row?.player_in) || asStr(row?.substitute) || asStr(row?.player_on);
  const outgoing =
    asStr(row?.player_out) || asStr(row?.player_off) || asStr(row?.player);

  const type = mapApiType(e.type);
  const isSub = type === 'substitution';

  return {
    id: e.id,
    minute,
    extraMinute,
    type,
    team,
    playerName: isSub ? incoming || e.playerName || 'Joueur' : e.playerName || 'Joueur',
    assistName: type === 'goal' ? assistName : undefined,
    incomingPlayer: isSub ? incoming : undefined,
    outgoingPlayer: isSub ? outgoing : undefined,
    reason:
      asStr(row?.reason) ||
      asStr(row?.comment) ||
      (type === 'yellow_card' ? 'Faute tactique' : type === 'red_card' ? 'Faute dangereuse' : undefined),
  };
}

function asStr(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim()) return v.trim();
  return undefined;
}

/** Fusionne événements API + match, triés du plus récent au plus ancien. */
export function mergePremiumEvents(
  apiEvents: PremiumMatchEvent[],
  matchEvents: MatchEvent[]
): PremiumMatchEvent[] {
  const byId = new Map<string, PremiumMatchEvent>();
  for (const e of matchEvents.map(premiumEventFromLegacy)) {
    byId.set(e.id, e);
  }
  for (const e of apiEvents) {
    byId.set(e.id, e);
  }
  return [...byId.values()].sort((a, b) => {
    const ma = a.minute + (a.extraMinute ?? 0) * 0.01;
    const mb = b.minute + (b.extraMinute ?? 0) * 0.01;
    return mb - ma;
  });
}
