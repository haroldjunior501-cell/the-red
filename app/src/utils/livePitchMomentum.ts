import type { LiveMatch } from '../types/live.types';
import type { PremiumMatchEvent } from '../types/liveMatchEvent';
import type { ParsedLiveMatchStats } from './liveMatchStatsParse';

export type TimelineGoal = {
  id: string;
  minute: number;
  team: 'home' | 'away';
};

export type LivePitchMomentumState = {
  isUpcoming: boolean;
  isLive: boolean;
  attackingTeam: 'home' | 'away';
  attackTeamName: string;
  homeAbbrev: string;
  awayAbbrev: string;
  timerLabel: string;
  halfLabel: string;
  minute: number;
  progressPct: number;
  timelineGoals: TimelineGoal[];
  ball: { x: number; y: number };
  attackWedgePoints: string;
  homeColor: string;
  awayColor: string;
};

const HOME_COLOR = '#2979ff';
const AWAY_COLOR = '#e5383b';

export function teamAbbrev(name: string, code: string): string {
  const c = code.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (c.length >= 3) return c.slice(0, 3);
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}${parts[1][1] ?? ''}`.toUpperCase().slice(0, 3);
  return name.slice(0, 3).toUpperCase();
}

export function parseMatchMinute(raw: string | undefined): { minute: number; half: 1 | 2 } {
  if (!raw) return { minute: 0, half: 1 };
  const cleaned = raw.replace(/[^\d+]/g, ' ');
  const base = Number(cleaned.split(/\s+/)[0]);
  const extra = raw.includes('+') ? Number(raw.split('+')[1]?.replace(/\D/g, '') || 0) : 0;
  const total = (Number.isFinite(base) ? base : 0) + extra;
  return { minute: total, half: total > 45 ? 2 : 1 };
}

/** Position 0–100 sur la timeline (mi-temps visible vers 48%). */
export function minuteToTimelinePct(minute: number): number {
  const m = Math.max(0, Math.min(120, minute));
  if (m <= 45) return (m / 45) * 47;
  return 50 + ((m - 45) / 45) * 47;
}

function computeBallPosition(
  attackingTeam: 'home' | 'away',
  stats: ParsedLiveMatchStats | null,
  events: PremiumMatchEvent[]
): { x: number; y: number } {
  const possHome = stats?.possessionHome ?? 50;
  const possAway = stats?.possessionAway ?? 50;
  const daH = stats?.dangerousHome ?? 0;
  const daA = stats?.dangerousAway ?? 0;
  const daTotal = daH + daA || 1;

  let x = attackingTeam === 'home' ? 0.58 + (possHome / 100) * 0.22 : 0.42 - (possAway / 100) * 0.22;
  let y = 0.5 + (daH - daA) / daTotal * 0.12;

  const lastEv = [...events].sort((a, b) => b.minute - a.minute)[0];
  if (lastEv) {
    y += lastEv.team === 'home' ? -0.06 : 0.06;
    x += lastEv.team === 'home' ? 0.08 : -0.08;
  }

  return {
    x: Math.max(0.12, Math.min(0.88, x)),
    y: Math.max(0.18, Math.min(0.82, y)),
  };
}

/** Trapèze zone d'attaque (viewBox 0 0 100 65). */
export function buildAttackWedge(attackingTeam: 'home' | 'away', intensity: number): string {
  const t = Math.max(0.35, Math.min(1, intensity));
  const depth = 38 * t;
  const spread = 22 + 8 * t;

  if (attackingTeam === 'home') {
    const x0 = 50;
    const y0 = 32.5;
    return [
      `${x0},${y0}`,
      `${50 + depth},${y0 - spread}`,
      `98,${y0 - spread}`,
      `98,${y0 + spread}`,
      `${50 + depth},${y0 + spread}`,
    ].join(' ');
  }

  const x0 = 50;
  const y0 = 32.5;
  return [
    `${x0},${y0}`,
    `${50 - depth},${y0 - spread}`,
    `2,${y0 - spread}`,
    `2,${y0 + spread}`,
    `${50 - depth},${y0 + spread}`,
  ].join(' ');
}

export function buildLivePitchMomentum(
  match: LiveMatch,
  stats: ParsedLiveMatchStats | null,
  events: PremiumMatchEvent[]
): LivePitchMomentumState {
  const isUpcoming = match.status === 'upcoming';
  const isLive =
    match.status === 'live' ||
    match.status === 'halftime' ||
    match.status === 'extra_time' ||
    match.status === 'penalties';

  const { minute, half } = parseMatchMinute(match.minute);
  const homeAbbrev = teamAbbrev(match.home_name, match.home_country_code);
  const awayAbbrev = teamAbbrev(match.away_name, match.away_country_code);

  const attackingTeam: 'home' | 'away' = stats
    ? stats.possessionHome >= stats.possessionAway
      ? 'home'
      : 'away'
    : 'home';

  const attackTeamName = attackingTeam === 'home' ? match.home_name : match.away_name;
  const poss = attackingTeam === 'home' ? stats?.possessionHome ?? 50 : stats?.possessionAway ?? 50;
  const da = attackingTeam === 'home' ? stats?.dangerousHome ?? 0 : stats?.dangerousAway ?? 0;
  const intensity = poss / 100 + Math.min(da / 80, 0.35);

  const ball = isUpcoming
    ? { x: 0.5, y: 0.5 }
    : computeBallPosition(attackingTeam, stats, events);

  const timelineGoals: TimelineGoal[] = events
    .filter((e) => e.type === 'goal')
    .map((e) => ({
      id: e.id,
      minute: e.minute + (e.extraMinute ?? 0),
      team: e.team,
    }));

  const timerLabel = isUpcoming
    ? match.kickoff_label ?? 'À venir'
    : match.status === 'halftime'
      ? 'Mi-temps'
      : half === 2
        ? `2e | ${minute}'`
        : `${minute}'`;

  return {
    isUpcoming,
    isLive,
    attackingTeam,
    attackTeamName,
    homeAbbrev,
    awayAbbrev,
    timerLabel,
    halfLabel: half === 2 ? '2e' : '1re',
    minute,
    progressPct: isUpcoming ? 0 : minuteToTimelinePct(minute),
    timelineGoals,
    ball,
    attackWedgePoints: buildAttackWedge(attackingTeam, intensity),
    homeColor: HOME_COLOR,
    awayColor: AWAY_COLOR,
  };
}
