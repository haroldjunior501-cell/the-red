import type { H2HDetail } from '../services/footballService';

export type LiveStatRow = {
  key: string;
  label: string;
  home: number;
  away: number;
  isPercent?: boolean;
};

export type ParsedLiveMatchStats = {
  possessionHome: number;
  possessionAway: number;
  dangerousHome: number;
  dangerousAway: number;
  rows: LiveStatRow[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function findStatArrays(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  const out: Record<string, unknown>[] = [];

  const pushRows = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const row of arr) {
      const o = asRecord(row);
      if (o) out.push(o);
    }
  };

  for (const key of ['statistics', 'stats', 'match_stats', 'team_statistics'] as const) {
    pushRows(data[key]);
    pushRows(root[key]);
  }

  const homeBlock = asRecord(data.home ?? data.localteam ?? data.team1);
  const awayBlock = asRecord(data.away ?? data.visitorteam ?? data.team2);
  if (homeBlock) out.push({ ...homeBlock, _side: 'home' });
  if (awayBlock) out.push({ ...awayBlock, _side: 'away' });

  return out;
}

function labelFromKey(key: string): string {
  const map: Record<string, string> = {
    shots_on_target: 'Tirs cadrés',
    shots_on_goal: 'Tirs cadrés',
    shots_off_target: 'Tirs non cadrés',
    shots_off_goal: 'Tirs non cadrés',
    blocked_shots: 'Tirs contrés',
    corners: 'Corners',
    corner_kicks: 'Corners',
    dangerous_attacks: 'Attaques dangereuses',
    ball_possession: 'Possession',
    possession: 'Possession',
    fouls: 'Fautes',
    offsides: 'Hors-jeu',
  };
  return map[key] ?? key.replace(/_/g, ' ');
}

/** Extrait stats comparatives depuis la réponse live-score-api (formats variables). */
export function parseLiveMatchStats(payload: unknown): ParsedLiveMatchStats {
  const rows = findStatArrays(payload);
  const byKey = new Map<string, { home: number; away: number; isPercent?: boolean }>();

  for (const row of rows) {
    const side = String(row._side ?? row.type ?? '').toLowerCase();
    const type = String(row.type ?? row.name ?? row.stat ?? '').toLowerCase();
    const value = asNumber(row.value ?? row.total ?? row.count, 0);
    if (!type) continue;
    const cur = byKey.get(type) ?? { home: 0, away: 0 };
    if (side.includes('home') || side.includes('local') || side === '1') {
      cur.home = value;
    } else if (side.includes('away') || side.includes('visitor') || side === '2') {
      cur.away = value;
    } else {
      cur.home = asNumber(row.home ?? row.home_value, cur.home);
      cur.away = asNumber(row.away ?? row.away_value, cur.away);
    }
    if (type.includes('possession') || String(row.value).includes('%')) {
      cur.isPercent = true;
    }
    byKey.set(type, cur);
  }

  const statRows: LiveStatRow[] = [];
  const order = [
    'shots_on_target',
    'shots_on_goal',
    'shots_off_target',
    'shots_off_goal',
    'blocked_shots',
    'corners',
    'corner_kicks',
    'dangerous_attacks',
    'fouls',
    'offsides',
  ];

  for (const key of order) {
    const v = byKey.get(key);
    if (v && (v.home > 0 || v.away > 0)) {
      statRows.push({ key, label: labelFromKey(key), home: v.home, away: v.away, isPercent: v.isPercent });
    }
  }

  for (const [key, v] of byKey) {
    if (order.includes(key)) continue;
    if (key.includes('possession')) continue;
    if (v.home > 0 || v.away > 0) {
      statRows.push({ key, label: labelFromKey(key), home: v.home, away: v.away, isPercent: v.isPercent });
    }
  }

  const poss = byKey.get('ball_possession') ?? byKey.get('possession');
  let possessionHome = poss?.home ?? 50;
  let possessionAway = poss?.away ?? 50;
  if (possessionHome + possessionAway === 0) {
    possessionHome = 50;
    possessionAway = 50;
  }

  const da = byKey.get('dangerous_attacks');
  return {
    possessionHome,
    possessionAway,
    dangerousHome: da?.home ?? 0,
    dangerousAway: da?.away ?? 0,
    rows: statRows,
  };
}

export type ParsedH2HSummary = {
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  homeWins: number;
  draws: number;
  awayWins: number;
};

export function h2hDetailToParsedSummary(detail: H2HDetail | null): ParsedH2HSummary | null {
  if (!detail) return null;
  const total = detail.winsTeam1 + detail.draws + detail.winsTeam2;
  if (total === 0 && detail.matches.length === 0) return null;
  const t = Math.max(total, 1);
  return {
    homeWins: detail.winsTeam1,
    draws: detail.draws,
    awayWins: detail.winsTeam2,
    homeWinPct: Math.round((detail.winsTeam1 / t) * 100),
    drawPct: Math.round((detail.draws / t) * 100),
    awayWinPct: Math.round((detail.winsTeam2 / t) * 100),
  };
}

export function parseH2HSummary(payload: unknown, homeName: string, awayName: string): ParsedH2HSummary | null {
  const root = asRecord(payload);
  if (!root) return null;
  const data = asRecord(root.data) ?? root;
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;

  const matches = data.matches ?? data.h2h ?? data.last_matches;
  if (Array.isArray(matches)) {
    for (const m of matches) {
      const row = asRecord(m);
      if (!row) continue;
      const hs = asNumber(row.home_score ?? row.score_home, 0);
      const as_ = asNumber(row.away_score ?? row.score_away, 0);
      if (hs > as_) homeWins++;
      else if (hs < as_) awayWins++;
      else draws++;
    }
  } else {
    homeWins = asNumber(data.home_wins ?? data.team1_wins, 0);
    awayWins = asNumber(data.away_wins ?? data.team2_wins, 0);
    draws = asNumber(data.draws, 0);
  }

  const total = homeWins + draws + awayWins;
  if (total === 0) return null;

  return {
    homeWins,
    draws,
    awayWins,
    homeWinPct: Math.round((homeWins / total) * 100),
    drawPct: Math.round((draws / total) * 100),
    awayWinPct: Math.round((awayWins / total) * 100),
  };
}
