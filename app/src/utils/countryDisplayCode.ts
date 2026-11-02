import { COUNTRIES } from '../constants/countries';
import { LIVESCORE_TEAM_ID_BY_ISO } from '../constants/worldCupLiveScore';
import { iso3ToIso2, teamNameToIso2 } from './fotmobCountryCodes';

/** Code pays GOALYA (ISO-2 ou GB-SCT) pour affichage drapeau / classements. */
export function resolveCountryDisplayCode(opts: {
  iso?: string;
  teamId?: string;
  teamName?: string;
}): string {
  const raw = (opts.iso ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}(-[A-Z]{2,4})?$/.test(raw) && !/^\d+$/.test(raw)) {
    return raw;
  }

  const tid = String(opts.teamId ?? '').trim();
  if (tid) {
    for (const [code, id] of Object.entries(LIVESCORE_TEAM_ID_BY_ISO)) {
      if (id === tid) return code;
    }
  }

  const name = (opts.teamName ?? '').trim();
  if (name) {
    const fromName = teamNameToIso2(name);
    if (fromName) return fromName;
    const row = COUNTRIES.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (row) return row.code;
  }

  if (raw && /^[A-Z]{3}$/.test(raw)) {
    const iso2 = iso3ToIso2(raw);
    if (iso2.length === 2) return iso2;
  }

  return raw.length === 2 ? raw : 'UNK';
}

export function countryFlagFromCode(code: string): string {
  const key = resolveCountryDisplayCode({ iso: code });
  const row = COUNTRIES.find(
    (c) =>
      c.code.toUpperCase() === key.toUpperCase() ||
      c.code.replace(/-/g, '').toUpperCase() === key.replace(/-/g, '').toUpperCase()
  );
  if (row?.flag) return row.flag;
  return '';
}
