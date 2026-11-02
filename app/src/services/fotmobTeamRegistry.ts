import { FOTMOB_WORLD_CUP_2026_TEAMS } from '../constants/fotmob';
import { LIVESCORE_TEAM_ID_BY_ISO } from '../constants/worldCupLiveScore';
import { iso3ToIso2, teamNameToIso2 } from '../utils/fotmobCountryCodes';

type Registry = {
  iso2ByTeamId: Record<string, string>;
  teamIdByIso2: Record<string, string>;
};

let registry: Registry | null = null;

function buildBaseRegistry(): Registry {
  const iso2ByTeamId: Record<string, string> = {};
  const teamIdByIso2: Record<string, string> = {};

  for (const t of FOTMOB_WORLD_CUP_2026_TEAMS) {
    const id = String(t.teamId);
    const iso2 = iso3ToIso2(t.countryCode);
    iso2ByTeamId[id] = iso2;
    if (!teamIdByIso2[iso2]) teamIdByIso2[iso2] = id;
  }

  return { iso2ByTeamId, teamIdByIso2 };
}

export function mergeTeamsIntoRegistry(
  teams: { id: string | number; name: string }[]
): void {
  const base = registry ?? buildBaseRegistry();
  for (const t of teams) {
    const id = String(t.id);
    if (base.iso2ByTeamId[id]) continue;
    const iso2 = teamNameToIso2(t.name);
    if (!iso2) continue;
    base.iso2ByTeamId[id] = iso2;
    if (!base.teamIdByIso2[iso2]) base.teamIdByIso2[iso2] = id;
  }
  registry = base;
}

export function getFotmobTeamRegistry(): Registry {
  if (!registry) registry = buildBaseRegistry();
  return registry;
}

export function getFotmobTeamIdForCountry(isoCode: string): string | undefined {
  const code = iso3ToIso2(isoCode);
  return getFotmobTeamRegistry().teamIdByIso2[code];
}

/** Résout un id Live Score, ISO ou id FotMob vers l’id équipe FotMob. */
export function resolveFotmobTeamIdFromRef(ref: string): string | null {
  const r = ref.trim();
  if (!r) return null;
  const reg = getFotmobTeamRegistry();
  if (reg.iso2ByTeamId[r]) return r;

  const iso = iso3ToIso2(r);
  const byIso = reg.teamIdByIso2[iso];
  if (byIso) return byIso;

  for (const [code, lsId] of Object.entries(LIVESCORE_TEAM_ID_BY_ISO)) {
    if (lsId === r) return reg.teamIdByIso2[code] ?? null;
  }
  return null;
}

export function getIso2ForFotmobTeamId(teamId: string): string | null {
  return getFotmobTeamRegistry().iso2ByTeamId[String(teamId)] ?? null;
}

export function resolveIso2ForFotmobTeamId(teamId: string, excludeIso2?: string): string | null {
  const iso = getIso2ForFotmobTeamId(teamId);
  if (!iso) return null;
  if (iso === excludeIso2) return iso;
  return iso;
}
