/**
 * Coupe du monde FIFA 2026 — Live Score API (source principale compétition).
 * FotMob = enrichissement joueurs (voir footballHybridService).
 * @see https://live-score-api.com/world-cup-api
 */
export const WC_COMPETITION_ID = '362';
export const WC_SEASON = '2026';

/**
 * IDs équipe côté Live Score (`competition_id=362`). Valeurs issues des exemples officiels du site.
 * Les codes ISO manquants peuvent être complétés après un appel `competitions/participants.json`.
 */
export const LIVESCORE_TEAM_ID_BY_ISO: Record<string, string> = {
  FR: '1439',
  SN: '1460',
  NO: '2677',
  BR: '1448',
  MA: '1435',
  HT: '2777',
  SCO: '1741',
  US: '1849',
  PY: '4040',
  AU: '1440',
  DE: '1449',
  CW: '2732',
  CI: '1628',
  EC: '1847',
  NL: '1649',
  JP: '1458',
  TN: '1455',
  BE: '1453',
  EG: '215',
  IR: '1436',
  NZ: '5345',
  ES: '1438',
  CV: '1608',
  SA: '1432',
  UY: '1434',
  AR: '1443',
  DZ: '1528',
  AT: '2684',
  JO: '1790',
  PT: '1437',
  UZ: '1776',
  CO: '1457',
  EN: '1456',
  GB: '1456',
  HR: '211',
  GH: '214',
  PA: '1454',
  MX: '1450',
  ZA: '2767',
  KR: '1452',
  CA: '1674',
  QA: '1427',
  CH: '208',
};
