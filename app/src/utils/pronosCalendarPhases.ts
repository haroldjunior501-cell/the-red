import type { PronoPhaseDef } from '../constants/pronosPhases';
import { KNOCKOUT_PRONO_PHASES } from '../constants/pronosPhases';
import type { GamesFixture } from '../types/games.types';
import type { PronoMatch, PronoPhaseKey } from '../types/pronos.types';

/** Match d’ouverture CDM 2026 (Mexique – Afrique du Sud). */
export const OPENING_PRONO_MATCH_ID = '400021443';

/** Fuseau des stades CDM 2026 (seeds `wc2026Matches`). */
const CDM_CALENDAR_TZ = 'America/New_York';

export function isGroupDayPhase(phase: PronoPhaseKey): phase is `day-${string}` {
  return phase.startsWith('day-');
}

function calendarDateParts(kickoffMs: number): { y: string; m: string; d: string } | null {
  if (!kickoffMs || kickoffMs <= 0) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CDM_CALENDAR_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(kickoffMs));
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  if (!y || !m || !d) return null;
  return { y, m, d };
}

export function dayPhaseKeyFromKickoff(kickoffMs: number): `day-${string}` | null {
  const p = calendarDateParts(kickoffMs);
  if (!p) return null;
  return `day-${p.y}-${p.m}-${p.d}`;
}

function isGroupStageFixture(fixture: GamesFixture): boolean {
  const round = fixture.phase.toLowerCase();
  return (
    round.includes('group') ||
    round.includes('groupe') ||
    round.includes('phase de group') ||
    fixture.group != null
  );
}

function roundLower(fixture: GamesFixture): string {
  return fixture.phase.toLowerCase();
}

function matchesKnockoutRound(fixture: GamesFixture, phase: PronoPhaseKey): boolean {
  const round = roundLower(fixture);
  switch (phase) {
    case 'r16':
      return (
        round.includes('round of 16') ||
        round.includes('1/8') ||
        round.includes('huitième') ||
        round.includes('huitièmes') ||
        round.includes('r16')
      );
    case 'qf':
      return round.includes('quarter') || round.includes('1/4') || round.includes('quart');
    case 'sf':
      return (round.includes('semi') || round.includes('demi')) && !round.includes('quarter');
    case 'final':
      return (
        (round.includes('final') || round.includes('finale')) &&
        !round.includes('semi') &&
        !round.includes('quarter') &&
        !round.includes('3rd')
      );
    default:
      return false;
  }
}

function isOpeningFixture(fixture: GamesFixture): boolean {
  if (fixture.id === OPENING_PRONO_MATCH_ID) return true;
  const round = fixture.phase.toLowerCase();
  return round.includes('opening') || round.includes('ouverture') || round.includes('inaugural');
}

/** Phase de prono pour un match de phase de groupes (ouverture ou jour calendaire). */
export function resolveGroupPronoPhase(fixture: GamesFixture): PronoPhaseKey | null {
  if (!isGroupStageFixture(fixture)) return null;
  if (isOpeningFixture(fixture)) return 'opening';
  const day = dayPhaseKeyFromKickoff(fixture.kickoffMs);
  return day;
}

export function resolveFixturePronoPhase(fixture: GamesFixture): PronoPhaseKey | null {
  const group = resolveGroupPronoPhase(fixture);
  if (group) return group;
  for (const k of KNOCKOUT_PRONO_PHASES) {
    if (matchesKnockoutRound(fixture, k.key)) return k.key;
  }
  return null;
}

export function fixtureMatchesPhase(fixture: GamesFixture, phase: PronoPhaseKey): boolean {
  if (phase === 'opening') {
    return isOpeningFixture(fixture);
  }
  if (isGroupDayPhase(phase)) {
    if (isOpeningFixture(fixture)) return false;
    if (!isGroupStageFixture(fixture)) return false;
    return dayPhaseKeyFromKickoff(fixture.kickoffMs) === phase;
  }
  if (!isGroupStageFixture(fixture)) {
    return matchesKnockoutRound(fixture, phase);
  }
  return false;
}

function formatDayPhaseLabel(dayKey: `day-${string}`): string {
  const iso = dayKey.slice(4);
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long', timeZone: CDM_CALENDAR_TZ });
  const dayMonth = d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: CDM_CALENDAR_TZ,
  });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${dayMonth}`;
}

function countMatchesForPhase(fixtures: PronoMatch[], phase: PronoPhaseKey): number {
  return fixtures.filter((f) => fixtureMatchesPhase(f, phase)).length;
}

/** Onglets dynamiques : ouverture → jours calendaires → phases KO. */
export function buildPronoPhasesFromFixtures(fixtures: PronoMatch[]): PronoPhaseDef[] {
  const phases: PronoPhaseDef[] = [];

  if (countMatchesForPhase(fixtures, 'opening') > 0) {
    phases.push({ key: 'opening', label: "Match d'ouverture" });
  }

  const dayKeys = new Set<`day-${string}`>();
  for (const f of fixtures) {
    if (f.id === OPENING_PRONO_MATCH_ID) continue;
    if (!isGroupStageFixture(f)) continue;
    const day = dayPhaseKeyFromKickoff(f.kickoffMs);
    if (day) dayKeys.add(day);
  }

  [...dayKeys]
    .sort((a, b) => a.localeCompare(b))
    .forEach((dayKey, index) => {
      phases.push({
        key: dayKey,
        label: formatDayPhaseLabel(dayKey),
        subtitle: `Journée ${index + (phases.some((p) => p.key === 'opening') ? 2 : 1)}`,
      });
    });

  for (const ko of KNOCKOUT_PRONO_PHASES) {
    if (countMatchesForPhase(fixtures, ko.key) > 0) {
      phases.push(ko);
    }
  }

  return phases;
}

export function journeeHintForPhase(phase: PronoPhaseKey, matchCount: number): string | null {
  if (phase === 'opening') {
    return "Match d'ouverture — tu peux pronostiquer dès maintenant, jusqu'au coup d'envoi.";
  }
  if (isGroupDayPhase(phase)) {
    const n = matchCount;
    return n === 1
      ? "1 match ce jour — affiche déjà connue : pronostique maintenant, fermé au coup d'envoi."
      : `${n} matchs ce jour — toutes les affiches sont connues : pronostique chaque match avant le coup d'envoi.`;
  }
  if (phase === 'r16' || phase === 'qf' || phase === 'sf' || phase === 'final') {
    return matchCount === 0
      ? 'Tableau à élimination directe — disponible après la phase de groupes (juillet).'
      : `${matchCount} match(s) — pronostique avant le coup d’envoi.`;
  }
  return null;
}

export function pickDefaultPronoPhase(
  phases: PronoPhaseDef[],
  fixtures: PronoMatch[],
  saved: Record<string, { matchId: string }>
): PronoPhaseKey {
  const withMatches = phases.filter((p) => countMatchesForPhase(fixtures, p.key) > 0);
  if (!withMatches.length) return 'opening';

  const now = Date.now();
  for (const phase of withMatches) {
    const inPhase = fixtures.filter((f) => fixtureMatchesPhase(f, phase.key));
    const hasUpcomingUnsaved = inPhase.some((m) => m.kickoffMs > now && !saved[m.id]);
    if (hasUpcomingUnsaved) return phase.key;
  }
  return withMatches[0].key;
}
