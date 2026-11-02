import type { GamesFixture } from '../types/games.types';
import type { PronoPhaseKey } from '../types/pronos.types';
import {
  fixtureMatchesPhase,
  resolveFixturePronoPhase,
} from './pronosCalendarPhases';

export { fixtureMatchesPhase, resolveFixturePronoPhase };

/** @deprecated Préférer `resolveFixturePronoPhase`. */
export function resolveFixturePhase(fixture: GamesFixture): PronoPhaseKey | null {
  return resolveFixturePronoPhase(fixture);
}

/** Compat tests / ancien code API round string. */
export function inferGroupPhase(_fixture: GamesFixture): PronoPhaseKey | null {
  return resolveFixturePronoPhase(_fixture);
}
