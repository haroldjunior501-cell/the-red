/**
 * Calendrier phase de groupes CDM 2026 (source FIFA).
 * Chaque poule (4 équipes) : 3 journées × 2 matchs, enchaînement fixe du tirage au sort —
 * ce n'est pas une répartition aléatoire des affiches entre les onglets.
 */
import { COUNTRIES } from '../constants/countries';
import type { GamesFixture } from '../types/games.types';
import type { PronoPhaseKey } from '../types/pronos.types';
import type { PopularProno, PronoMatch } from '../types/pronos.types';
import { formatKickoffLabel } from '../utils/liveMatchUtils';
import { fixtureMatchesPhase } from '../utils/pronosCalendarPhases';

export type WcJournee = 'j1' | 'j2' | 'j3';

export type Wc2026Team = {
  name: string;
  code: string;
  flag: string;
};

export type Wc2026Match = {
  id: string;
  home: Wc2026Team;
  away: Wc2026Team;
  date: string;
  time: string;
  group: string;
  journee: WcJournee;
  kickoffMs: number;
};

export type MatchScheduleStatus = 'scheduled' | 'live' | 'finished';

type MatchSeed = {
  id: string;
  home: string;
  away: string;
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  group: string;
  journee: WcJournee;
};

function team(code: string): Wc2026Team {
  const row = COUNTRIES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() || c.code.replace(/-/g, '') === code.replace(/-/g, '')
  );
  return {
    code: row?.code ?? code,
    name: row?.name ?? code,
    flag: row?.flag ?? '🏳️',
  };
}

/** Heure locale Est (stades USA/Mexique/Canada). */
function kickoffMsET(y: number, m: number, d: number, hh: number, mm: number): number {
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00-04:00`;
  return new Date(iso).getTime();
}

function dateLabel(y: number, m: number, d: number): string {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${d} ${months[m - 1]}`;
}

function buildMatch(seed: MatchSeed): Wc2026Match {
  const kickoffMs = kickoffMsET(seed.y, seed.m, seed.d, seed.hh, seed.mm);
  return {
    id: seed.id,
    home: team(seed.home),
    away: team(seed.away),
    date: dateLabel(seed.y, seed.m, seed.d),
    time: `${String(seed.hh).padStart(2, '0')}:${String(seed.mm).padStart(2, '0')}`,
    group: `Groupe ${seed.group}`,
    journee: seed.journee,
    kickoffMs,
  };
}

const SEEDS: MatchSeed[] = [
  // Journée 1 — 11–17 juin (FIFA)
  { id: '400021443', home: 'MX', away: 'ZA', y: 2026, m: 6, d: 11, hh: 15, mm: 0, group: 'A', journee: 'j1' },
  { id: '400021441', home: 'KR', away: 'CZ', y: 2026, m: 6, d: 11, hh: 21, mm: 0, group: 'A', journee: 'j1' },
  { id: '400021449', home: 'CA', away: 'BA', y: 2026, m: 6, d: 12, hh: 15, mm: 0, group: 'B', journee: 'j1' },
  { id: '400021458', home: 'US', away: 'PY', y: 2026, m: 6, d: 12, hh: 21, mm: 0, group: 'D', journee: 'j1' },
  { id: '400021453', home: 'HT', away: 'GB-SCT', y: 2026, m: 6, d: 13, hh: 15, mm: 0, group: 'C', journee: 'j1' },
  { id: '400021463', home: 'AU', away: 'TR', y: 2026, m: 6, d: 13, hh: 18, mm: 0, group: 'D', journee: 'j1' },
  { id: '400021456', home: 'BR', away: 'MA', y: 2026, m: 6, d: 13, hh: 21, mm: 0, group: 'C', journee: 'j1' },
  { id: '400021447', home: 'QA', away: 'CH', y: 2026, m: 6, d: 13, hh: 21, mm: 0, group: 'B', journee: 'j1' },
  { id: '400021467', home: 'CI', away: 'EC', y: 2026, m: 6, d: 14, hh: 15, mm: 0, group: 'E', journee: 'j1' },
  { id: '400021464', home: 'DE', away: 'CW', y: 2026, m: 6, d: 14, hh: 18, mm: 0, group: 'E', journee: 'j1' },
  { id: '400021470', home: 'NL', away: 'JP', y: 2026, m: 6, d: 14, hh: 21, mm: 0, group: 'F', journee: 'j1' },
  { id: '400021474', home: 'SE', away: 'TN', y: 2026, m: 6, d: 14, hh: 21, mm: 0, group: 'F', journee: 'j1' },
  { id: '400021486', home: 'SA', away: 'UY', y: 2026, m: 6, d: 15, hh: 18, mm: 0, group: 'H', journee: 'j1' },
  { id: '400021482', home: 'ES', away: 'CV', y: 2026, m: 6, d: 15, hh: 18, mm: 0, group: 'H', journee: 'j1' },
  { id: '400021476', home: 'IR', away: 'NZ', y: 2026, m: 6, d: 15, hh: 21, mm: 0, group: 'G', journee: 'j1' },
  { id: '400021478', home: 'BE', away: 'EG', y: 2026, m: 6, d: 15, hh: 21, mm: 0, group: 'G', journee: 'j1' },
  { id: '400021490', home: 'FR', away: 'SN', y: 2026, m: 6, d: 16, hh: 15, mm: 0, group: 'I', journee: 'j1' },
  { id: '400021488', home: 'IQ', away: 'NO', y: 2026, m: 6, d: 16, hh: 18, mm: 0, group: 'I', journee: 'j1' },
  { id: '400021496', home: 'AR', away: 'DZ', y: 2026, m: 6, d: 16, hh: 21, mm: 0, group: 'J', journee: 'j1' },
  { id: '400021498', home: 'AT', away: 'JO', y: 2026, m: 6, d: 16, hh: 21, mm: 0, group: 'J', journee: 'j1' },
  { id: '400021510', home: 'GH', away: 'PA', y: 2026, m: 6, d: 17, hh: 15, mm: 0, group: 'L', journee: 'j1' },
  { id: '400021507', home: 'GB-ENG', away: 'HR', y: 2026, m: 6, d: 17, hh: 18, mm: 0, group: 'L', journee: 'j1' },
  { id: '400021502', home: 'PT', away: 'CD', y: 2026, m: 6, d: 17, hh: 21, mm: 0, group: 'K', journee: 'j1' },
  { id: '400021504', home: 'UZ', away: 'CO', y: 2026, m: 6, d: 17, hh: 21, mm: 0, group: 'K', journee: 'j1' },

  // Journée 2 — 18–23 juin
  { id: '400021440', home: 'CZ', away: 'ZA', y: 2026, m: 6, d: 18, hh: 15, mm: 0, group: 'A', journee: 'j2' },
  { id: '400021446', home: 'CH', away: 'BA', y: 2026, m: 6, d: 18, hh: 18, mm: 0, group: 'B', journee: 'j2' },
  { id: '400021450', home: 'CA', away: 'QA', y: 2026, m: 6, d: 18, hh: 21, mm: 0, group: 'B', journee: 'j2' },
  { id: '400021442', home: 'MX', away: 'KR', y: 2026, m: 6, d: 18, hh: 21, mm: 0, group: 'A', journee: 'j2' },
  { id: '400021457', home: 'BR', away: 'HT', y: 2026, m: 6, d: 19, hh: 15, mm: 0, group: 'C', journee: 'j2' },
  { id: '400021454', home: 'GB-SCT', away: 'MA', y: 2026, m: 6, d: 19, hh: 18, mm: 0, group: 'C', journee: 'j2' },
  { id: '400021460', home: 'TR', away: 'PY', y: 2026, m: 6, d: 19, hh: 21, mm: 0, group: 'D', journee: 'j2' },
  { id: '400021462', home: 'US', away: 'AU', y: 2026, m: 6, d: 19, hh: 21, mm: 0, group: 'D', journee: 'j2' },
  { id: '400021469', home: 'DE', away: 'CI', y: 2026, m: 6, d: 20, hh: 15, mm: 0, group: 'E', journee: 'j2' },
  { id: '400021465', home: 'EC', away: 'CW', y: 2026, m: 6, d: 20, hh: 18, mm: 0, group: 'E', journee: 'j2' },
  { id: '400021472', home: 'NL', away: 'SE', y: 2026, m: 6, d: 20, hh: 21, mm: 0, group: 'F', journee: 'j2' },
  { id: '400021475', home: 'TN', away: 'JP', y: 2026, m: 6, d: 20, hh: 21, mm: 0, group: 'F', journee: 'j2' },
  { id: '400021487', home: 'UY', away: 'CV', y: 2026, m: 6, d: 21, hh: 15, mm: 0, group: 'H', journee: 'j2' },
  { id: '400021483', home: 'ES', away: 'SA', y: 2026, m: 6, d: 21, hh: 18, mm: 0, group: 'H', journee: 'j2' },
  { id: '400021477', home: 'BE', away: 'IR', y: 2026, m: 6, d: 21, hh: 21, mm: 0, group: 'G', journee: 'j2' },
  { id: '400021480', home: 'NZ', away: 'EG', y: 2026, m: 6, d: 21, hh: 21, mm: 0, group: 'G', journee: 'j2' },
  { id: '400021491', home: 'NO', away: 'SN', y: 2026, m: 6, d: 22, hh: 15, mm: 0, group: 'I', journee: 'j2' },
  { id: '400021492', home: 'FR', away: 'IQ', y: 2026, m: 6, d: 22, hh: 18, mm: 0, group: 'I', journee: 'j2' },
  { id: '400021494', home: 'AR', away: 'AT', y: 2026, m: 6, d: 22, hh: 21, mm: 0, group: 'J', journee: 'j2' },
  { id: '400021499', home: 'JO', away: 'DZ', y: 2026, m: 6, d: 22, hh: 21, mm: 0, group: 'J', journee: 'j2' },
  { id: '400021506', home: 'GB-ENG', away: 'GH', y: 2026, m: 6, d: 23, hh: 15, mm: 0, group: 'L', journee: 'j2' },
  { id: '400021511', home: 'PA', away: 'HR', y: 2026, m: 6, d: 23, hh: 18, mm: 0, group: 'L', journee: 'j2' },
  { id: '400021503', home: 'PT', away: 'UZ', y: 2026, m: 6, d: 23, hh: 21, mm: 0, group: 'K', journee: 'j2' },
  { id: '400021501', home: 'CO', away: 'CD', y: 2026, m: 6, d: 23, hh: 21, mm: 0, group: 'K', journee: 'j2' },

  // Journée 3 — 24–27 juin
  { id: '400021455', home: 'GB-SCT', away: 'BR', y: 2026, m: 6, d: 24, hh: 15, mm: 0, group: 'C', journee: 'j3' },
  { id: '400021452', home: 'MA', away: 'HT', y: 2026, m: 6, d: 24, hh: 15, mm: 0, group: 'C', journee: 'j3' },
  { id: '400021451', home: 'CH', away: 'CA', y: 2026, m: 6, d: 24, hh: 18, mm: 0, group: 'B', journee: 'j3' },
  { id: '400021448', home: 'BA', away: 'QA', y: 2026, m: 6, d: 24, hh: 18, mm: 0, group: 'B', journee: 'j3' },
  { id: '400021444', home: 'CZ', away: 'MX', y: 2026, m: 6, d: 24, hh: 21, mm: 0, group: 'A', journee: 'j3' },
  { id: '400021445', home: 'ZA', away: 'KR', y: 2026, m: 6, d: 24, hh: 21, mm: 0, group: 'A', journee: 'j3' },
  { id: '400021468', home: 'CW', away: 'CI', y: 2026, m: 6, d: 25, hh: 15, mm: 0, group: 'E', journee: 'j3' },
  { id: '400021466', home: 'EC', away: 'DE', y: 2026, m: 6, d: 25, hh: 18, mm: 0, group: 'E', journee: 'j3' },
  { id: '400021471', home: 'JP', away: 'SE', y: 2026, m: 6, d: 25, hh: 21, mm: 0, group: 'F', journee: 'j3' },
  { id: '400021473', home: 'TN', away: 'NL', y: 2026, m: 6, d: 25, hh: 21, mm: 0, group: 'F', journee: 'j3' },
  { id: '400021459', home: 'TR', away: 'US', y: 2026, m: 6, d: 25, hh: 21, mm: 0, group: 'D', journee: 'j3' },
  { id: '400021461', home: 'PY', away: 'AU', y: 2026, m: 6, d: 25, hh: 21, mm: 0, group: 'D', journee: 'j3' },
  { id: '400021489', home: 'NO', away: 'FR', y: 2026, m: 6, d: 26, hh: 15, mm: 0, group: 'I', journee: 'j3' },
  { id: '400021493', home: 'SN', away: 'IQ', y: 2026, m: 6, d: 26, hh: 18, mm: 0, group: 'I', journee: 'j3' },
  { id: '400021479', home: 'EG', away: 'IR', y: 2026, m: 6, d: 26, hh: 21, mm: 0, group: 'G', journee: 'j3' },
  { id: '400021481', home: 'NZ', away: 'BE', y: 2026, m: 6, d: 26, hh: 21, mm: 0, group: 'G', journee: 'j3' },
  { id: '400021485', home: 'CV', away: 'SA', y: 2026, m: 6, d: 26, hh: 21, mm: 0, group: 'H', journee: 'j3' },
  { id: '400021484', home: 'UY', away: 'ES', y: 2026, m: 6, d: 26, hh: 21, mm: 0, group: 'H', journee: 'j3' },
  { id: '400021508', home: 'PA', away: 'GB-ENG', y: 2026, m: 6, d: 27, hh: 15, mm: 0, group: 'L', journee: 'j3' },
  { id: '400021509', home: 'HR', away: 'GH', y: 2026, m: 6, d: 27, hh: 18, mm: 0, group: 'L', journee: 'j3' },
  { id: '400021497', home: 'DZ', away: 'AT', y: 2026, m: 6, d: 27, hh: 21, mm: 0, group: 'J', journee: 'j3' },
  { id: '400021495', home: 'JO', away: 'AR', y: 2026, m: 6, d: 27, hh: 21, mm: 0, group: 'J', journee: 'j3' },
  { id: '400021505', home: 'CO', away: 'PT', y: 2026, m: 6, d: 27, hh: 21, mm: 0, group: 'K', journee: 'j3' },
  { id: '400021500', home: 'CD', away: 'UZ', y: 2026, m: 6, d: 27, hh: 21, mm: 0, group: 'K', journee: 'j3' },
];

export const WC2026_MATCHES: Wc2026Match[] = SEEDS.map(buildMatch);

export function findWc2026MatchById(id: string): Wc2026Match | undefined {
  return WC2026_MATCHES.find((m) => m.id === id);
}

export function getMatchesByJournee(journee: WcJournee): Wc2026Match[] {
  return WC2026_MATCHES.filter((m) => m.journee === journee);
}

/** Matchs d’une phase de prono (ouverture, jour calendaire, KO). */
export function getMatchesByPhase(phase: PronoPhaseKey): Wc2026Match[] {
  return WC2026_MATCHES.filter((m) => fixtureMatchesPhase(wcMatchToFixture(m), phase));
}

export function getMatchScheduleStatus(match: Wc2026Match, durationHours = 2): MatchScheduleStatus {
  const now = Date.now();
  const endMs = match.kickoffMs + durationHours * 60 * 60 * 1000;
  if (now < match.kickoffMs) return 'scheduled';
  if (now >= endMs) return 'finished';
  return 'live';
}

function wcMatchToFixture(m: Wc2026Match): GamesFixture {
  const phaseNum = m.journee === 'j1' ? '1' : m.journee === 'j2' ? '2' : '3';
  return {
    id: m.id,
    homeName: m.home.name,
    awayName: m.away.name,
    homeCode: m.home.code,
    awayCode: m.away.code,
    date: m.date,
    time: m.time,
    phase: `Group Stage - ${phaseNum}`,
    group: m.group,
    status: getMatchScheduleStatus(m) === 'live' ? 'LIVE' : 'NS',
    kickoffMs: m.kickoffMs,
  };
}

export function wc2026ToPronoMatches(): PronoMatch[] {
  return WC2026_MATCHES.map((m) => {
    const fx = wcMatchToFixture(m);
    return {
      ...fx,
      kickoff_label: `${m.date} · ${m.time}`,
    };
  });
}

export function getDefaultPopularPronos(matchId: string): PopularProno[] {
  return [
    { score: '2-1', percentage: 28 },
    { score: '1-1', percentage: 22 },
    { score: '1-0', percentage: 18 },
    { score: '0-0', percentage: 12 },
    { score: '2-0', percentage: 10 },
    { score: '3-1', percentage: 6 },
  ];
}

export function canSubmitWcProno(match: Wc2026Match): boolean {
  return getMatchScheduleStatus(match) === 'scheduled';
}
