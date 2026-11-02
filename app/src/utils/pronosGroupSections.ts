import { COUNTRIES } from '../constants/countries';
import { WC_GROUP_ENTRIES } from '../constants/liveGroups';
import { groupLetterFromName } from '../constants/liveGroups';
import type { PronoMatch, PronoPhaseKey } from '../types/pronos.types';
import { journeeHintForPhase } from './pronosCalendarPhases';
import { groupMatchesByDate } from './pronosFixtures';

export type PronoSection = {
  sectionKey: string;
  label: string;
  teamsLabel: string;
  items: PronoMatch[];
};

export function journeeHint(phase: PronoPhaseKey, matchCount: number): string | null {
  return journeeHintForPhase(phase, matchCount);
}

function teamsInGroup(letter: string): string {
  return COUNTRIES.filter((c) => c.group === letter)
    .map((c) => c.name)
    .join(' · ');
}

function isKnockoutPhase(phase: PronoPhaseKey): boolean {
  return phase === 'r16' || phase === 'qf' || phase === 'sf' || phase === 'final';
}

/** Groupes par poule (phase de groupes) ou par date (KO). */
export function groupMatchesForPhase(matches: PronoMatch[], phase: PronoPhaseKey): PronoSection[] {
  if (isKnockoutPhase(phase)) {
    return groupMatchesByDate(matches).map((day) => ({
      sectionKey: `ko-${day.dateKey}`,
      label: day.label,
      teamsLabel: '',
      items: day.items,
    }));
  }
  return groupMatchesByPoule(matches);
}

/** Regroupe les matchs d’une journée par poule A→L (ordre officiel). */
export function groupMatchesByPoule(matches: PronoMatch[]): PronoSection[] {
  const order = WC_GROUP_ENTRIES.map((e) => e.letter);
  const byLetter = new Map<string, PronoMatch[]>();

  for (const m of matches) {
    const letter = groupLetterFromName(m.group ?? '');
    const list = byLetter.get(letter) ?? [];
    list.push(m);
    byLetter.set(letter, list);
  }

  return order
    .filter((letter) => byLetter.has(letter))
    .map((letter) => {
      const items = (byLetter.get(letter) ?? []).sort((a, b) => a.kickoffMs - b.kickoffMs);
      return {
        sectionKey: `group-${letter}`,
        label: `Groupe ${letter}`,
        teamsLabel: teamsInGroup(letter),
        items,
      };
    });
}
