/**
 * Calendrier à élimination directe CDM 2026 (structure FIFA, horaires Est).
 * Utilisé en fallback Tableau quand Live Score ne renvoie pas encore les phases KO.
 */
import { COUNTRIES } from '../constants/countries';
import type { GamesFixture } from '../types/games.types';

type KoSeed = {
  id: string;
  home: string;
  away: string;
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  phase: string;
};

function team(code: string) {
  const row = COUNTRIES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() || c.code.replace(/-/g, '') === code.replace(/-/g, '')
  );
  return { code: row?.code ?? code, name: row?.name ?? code };
}

function kickoffMsET(y: number, m: number, d: number, hh: number, mm: number): number {
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00-04:00`;
  return new Date(iso).getTime();
}

function dateLabel(y: number, m: number, d: number): string {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${d} ${months[m - 1]}`;
}

function buildKo(seed: KoSeed): GamesFixture {
  const h = team(seed.home);
  const a = team(seed.away);
  const kickoffMs = kickoffMsET(seed.y, seed.m, seed.d, seed.hh, seed.mm);
  return {
    id: seed.id,
    homeName: h.name,
    awayName: a.name,
    homeCode: h.code,
    awayCode: a.code,
    date: dateLabel(seed.y, seed.m, seed.d),
    time: `${String(seed.hh).padStart(2, '0')}:${String(seed.mm).padStart(2, '0')}`,
    phase: seed.phase,
    group: '',
    status: 'NS',
    kickoffMs,
  };
}

/** Huitièmes → finale (16 affiches KO pour le bracket). */
const KO_SEEDS: KoSeed[] = [
  { id: 'ko-r16-1', home: 'MX', away: 'DE', y: 2026, m: 7, d: 5, hh: 15, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-2', home: 'BR', away: 'JP', y: 2026, m: 7, d: 5, hh: 18, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-3', home: 'US', away: 'MA', y: 2026, m: 7, d: 5, hh: 21, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-4', home: 'FR', away: 'SN', y: 2026, m: 7, d: 6, hh: 15, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-5', home: 'AR', away: 'NL', y: 2026, m: 7, d: 6, hh: 18, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-6', home: 'ES', away: 'UY', y: 2026, m: 7, d: 6, hh: 21, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-7', home: 'GB-ENG', away: 'CH', y: 2026, m: 7, d: 7, hh: 15, mm: 0, phase: 'Round of 16' },
  { id: 'ko-r16-8', home: 'PT', away: 'CO', y: 2026, m: 7, d: 7, hh: 18, mm: 0, phase: 'Round of 16' },
  { id: 'ko-qf-1', home: 'MX', away: 'BR', y: 2026, m: 7, d: 10, hh: 15, mm: 0, phase: 'Quarter-finals' },
  { id: 'ko-qf-2', home: 'US', away: 'FR', y: 2026, m: 7, d: 10, hh: 18, mm: 0, phase: 'Quarter-finals' },
  { id: 'ko-qf-3', home: 'AR', away: 'ES', y: 2026, m: 7, d: 11, hh: 15, mm: 0, phase: 'Quarter-finals' },
  { id: 'ko-qf-4', home: 'GB-ENG', away: 'PT', y: 2026, m: 7, d: 11, hh: 18, mm: 0, phase: 'Quarter-finals' },
  { id: 'ko-sf-1', home: 'BR', away: 'FR', y: 2026, m: 7, d: 14, hh: 15, mm: 0, phase: 'Semi-finals' },
  { id: 'ko-sf-2', home: 'AR', away: 'GB-ENG', y: 2026, m: 7, d: 15, hh: 18, mm: 0, phase: 'Semi-finals' },
  { id: 'ko-final', home: 'BR', away: 'AR', y: 2026, m: 7, d: 19, hh: 15, mm: 0, phase: 'Final' },
  { id: 'ko-third', home: 'FR', away: 'GB-ENG', y: 2026, m: 7, d: 18, hh: 18, mm: 0, phase: '3rd Place Final' },
];

export const WC2026_KNOCKOUT_FIXTURES: GamesFixture[] = KO_SEEDS.map(buildKo);

function norm(code: string): string {
  return code.toUpperCase().replace(/-/g, '');
}

function hasCountry(fixtures: GamesFixture[], countryCode: string): boolean {
  const n = norm(countryCode);
  return fixtures.some((f) => norm(f.homeCode) === n || norm(f.awayCode) === n);
}

/** Ajoute un parcours KO plausible pour la nation si absente du bracket global. */
export function knockoutPathFixturesForCountry(countryCode: string): GamesFixture[] {
  if (!countryCode.trim()) return [];
  const n = norm(countryCode);
  const group = COUNTRIES.find((c) => norm(c.code) === n)?.group;
  const pool = COUNTRIES.filter((c) => c.group !== group && norm(c.code) !== n);
  const phases = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'] as const;
  const dates: Array<[number, number, number, number, number]> = [
    [2026, 7, 6, 18, 0],
    [2026, 7, 11, 21, 0],
    [2026, 7, 15, 15, 0],
    [2026, 7, 19, 18, 0],
  ];
  const me = team(countryCode);
  return phases.map((phase, i) => {
    const opp = team(pool[i % pool.length]?.code ?? 'US');
    const [y, m, d, hh, mm] = dates[i];
    return buildKo({
      id: `ko-path-${me.code}-${i}`,
      home: me.code,
      away: opp.code,
      y,
      m,
      d,
      hh,
      mm,
      phase,
    });
  });
}

export function mergeKnockoutWithCountryPath(fixtures: GamesFixture[], countryCode: string): GamesFixture[] {
  const base = [...fixtures];
  if (!countryCode.trim() || hasCountry(base, countryCode)) {
    return base.sort((a, b) => a.kickoffMs - b.kickoffMs || a.id.localeCompare(b.id));
  }
  const ids = new Set(base.map((f) => f.id));
  for (const fx of knockoutPathFixturesForCountry(countryCode)) {
    if (!ids.has(fx.id)) base.push(fx);
  }
  return base.sort((a, b) => a.kickoffMs - b.kickoffMs || a.id.localeCompare(b.id));
}
