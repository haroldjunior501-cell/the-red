import { COUNTRIES } from '../constants/countries';
import { WC_GROUP_ENTRIES } from '../constants/liveGroups';
import { countryMeta } from '../services/gamesService';
import { formatKickoffLabel } from '../utils/liveMatchUtils';
import type { BracketPrediction, Duel, FantasyPlayer, GamesFixture, NationPower, NationRank } from '../types/games.types';
import type { LiveGroupStandings, Standing } from '../types/live.types';

const DAY = 86_400_000;

function futureKickoff(daysFromNow: number, hour = 20): number {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

/** Puissances nationales fictives (échelle « M » comme sur la maquette). */
const SIM_POWER_BASE: { code: string; power: number; supporters: number; dailyGain: number }[] = [
  { code: 'FR', power: 78_400_000, supporters: 112_000, dailyGain: 2_100_000 },
  { code: 'BR', power: 71_200_000, supporters: 98_000, dailyGain: 1_850_000 },
  { code: 'AR', power: 58_600_000, supporters: 67_000, dailyGain: 1_420_000 },
  { code: 'ES', power: 52_100_000, supporters: 54_000, dailyGain: 1_280_000 },
  { code: 'DE', power: 48_900_000, supporters: 51_000, dailyGain: 1_150_000 },
  { code: 'MA', power: 44_300_000, supporters: 38_000, dailyGain: 980_000 },
  { code: 'US', power: 41_800_000, supporters: 28_000, dailyGain: 920_000 },
  { code: 'MX', power: 36_500_000, supporters: 19_000, dailyGain: 760_000 },
  { code: 'JP', power: 33_200_000, supporters: 43_000, dailyGain: 640_000 },
  { code: 'SN', power: 28_700_000, supporters: 9_000, dailyGain: 520_000 },
  { code: 'PT', power: 26_400_000, supporters: 22_000, dailyGain: 480_000 },
  { code: 'NL', power: 24_100_000, supporters: 18_000, dailyGain: 440_000 },
];

export function getSimNationPowers(): Record<string, NationPower> {
  const out: Record<string, NationPower> = {};
  SIM_POWER_BASE.forEach((row) => {
    out[row.code] = {
      power: row.power,
      supporterCount: row.supporters,
      dailyGain: row.dailyGain,
      weeklyGain: row.dailyGain * 5,
    };
  });
  return out;
}

export function getSimNationPowerForUser(countryCode: string): NationPower {
  const code = countryCode.toUpperCase();
  const row = SIM_POWER_BASE.find((n) => n.code === code) ?? SIM_POWER_BASE[0];
  return {
    power: row.power,
    supporterCount: row.supporters,
    dailyGain: row.dailyGain,
    weeklyGain: row.dailyGain * 5,
  };
}

export function pulseSimNationPower(prev: NationPower): NationPower {
  const bump = Math.round(40_000 + Math.random() * 90_000);
  const daily = Math.round(8_000 + Math.random() * 22_000);
  return {
    ...prev,
    power: prev.power + bump,
    dailyGain: prev.dailyGain + daily,
    weeklyGain: prev.weeklyGain + daily,
  };
}

export function getSimWorldRanking(limit = 12): NationRank[] {
  const powers = getSimNationPowers();
  return SIM_POWER_BASE.slice(0, limit).map((row, idx) => {
    const meta = countryMeta(row.code);
    const p = powers[row.code];
    return {
      code: row.code,
      flag: meta.flag,
      name: meta.name,
      power: p?.power ?? row.power,
      rank: idx + 1,
      dailyGain: p?.dailyGain ?? row.dailyGain,
      supporterCount: p?.supporterCount ?? row.supporters,
    };
  });
}

export function getSimUpcomingFixtures(): GamesFixture[] {
  return getSimPronosCatalog().filter((f) => {
    const p = f.phase.toLowerCase();
    return p.includes('group') || p.includes('groupe');
  });
}

/** Catalogue complet pronos (toutes phases) pour la démo. */
export function getSimPronosCatalog(): GamesFixture[] {
  const rows: GamesFixture[] = [
    {
      id: 'sim-fix-1',
      homeName: 'France',
      awayName: 'Brésil',
      homeCode: 'FR',
      awayCode: 'BR',
      date: '',
      time: '',
      phase: 'Group Stage - 1',
      group: 'Groupe I',
      status: 'NS',
      kickoffMs: futureKickoff(2, 21),
    },
    {
      id: 'sim-fix-2',
      homeName: 'Maroc',
      awayName: 'Espagne',
      homeCode: 'MA',
      awayCode: 'ES',
      date: '',
      time: '',
      phase: 'Group Stage - 2',
      group: 'Groupe C',
      status: 'NS',
      kickoffMs: futureKickoff(3, 18),
    },
    {
      id: 'sim-fix-3',
      homeName: 'Argentine',
      awayName: 'Allemagne',
      homeCode: 'AR',
      awayCode: 'DE',
      date: '',
      time: '',
      phase: 'Group Stage - 3',
      group: 'Groupe J',
      status: 'NS',
      kickoffMs: futureKickoff(4, 15),
    },
    {
      id: 'sim-fix-4',
      homeName: 'États-Unis',
      awayName: 'Mexique',
      homeCode: 'US',
      awayCode: 'MX',
      date: '',
      time: '',
      phase: 'Group Stage - 1',
      group: 'Groupe D',
      status: 'NS',
      kickoffMs: futureKickoff(5, 20),
    },
    {
      id: 'sim-fix-5',
      homeName: 'Portugal',
      awayName: 'Pays-Bas',
      homeCode: 'PT',
      awayCode: 'NL',
      date: '',
      time: '',
      phase: 'Group Stage - 2',
      group: 'Groupe K',
      status: 'NS',
      kickoffMs: futureKickoff(6, 17),
    },
    {
      id: 'sim-r16-1',
      homeName: 'France',
      awayName: 'Maroc',
      homeCode: 'FR',
      awayCode: 'MA',
      date: '',
      time: '',
      phase: 'Round of 16',
      group: 'Tableau',
      status: 'NS',
      kickoffMs: futureKickoff(14),
    },
    {
      id: 'sim-qf-1',
      homeName: 'France',
      awayName: 'Brésil',
      homeCode: 'FR',
      awayCode: 'BR',
      date: '',
      time: '',
      phase: 'Quarter-finals',
      group: 'Tableau',
      status: 'NS',
      kickoffMs: futureKickoff(21),
    },
    {
      id: 'sim-sf-1',
      homeName: 'France',
      awayName: 'Argentine',
      homeCode: 'FR',
      awayCode: 'AR',
      date: '',
      time: '',
      phase: 'Semi-finals',
      group: 'Tableau',
      status: 'NS',
      kickoffMs: futureKickoff(28),
    },
    {
      id: 'sim-final',
      homeName: 'France',
      awayName: 'Brésil',
      homeCode: 'FR',
      awayCode: 'BR',
      date: '',
      time: '',
      phase: 'Final',
      group: 'Tableau',
      status: 'NS',
      kickoffMs: futureKickoff(35),
    },
  ];
  return rows;
}

export function getSimPopularPronos(_matchId: string): { score: string; percentage: number }[] {
  return [
    { score: '2-1', percentage: 28 },
    { score: '1-1', percentage: 22 },
    { score: '1-0', percentage: 18 },
    { score: '0-0', percentage: 12 },
    { score: '3-1', percentage: 9 },
  ];
}

export function getSimBracketFixtures(): GamesFixture[] {
  const base = [
    { id: 'sim-r16-1', homeName: 'France', awayName: 'Maroc', homeCode: 'FR', awayCode: 'MA', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(28, 12) },
    { id: 'sim-r16-2', homeName: 'Brésil', awayName: 'Espagne', homeCode: 'BR', awayCode: 'ES', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(28, 16) },
    { id: 'sim-r16-3', homeName: 'Argentine', awayName: 'Allemagne', homeCode: 'AR', awayCode: 'DE', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(29, 12) },
    { id: 'sim-r16-4', homeName: 'Angleterre', awayName: 'Portugal', homeCode: 'GB-ENG', awayCode: 'PT', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(29, 16) },
    { id: 'sim-r16-5', homeName: 'Mexique', awayName: 'États-Unis', homeCode: 'MX', awayCode: 'US', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(30, 12) },
    { id: 'sim-r16-6', homeName: 'Japon', awayName: 'Pays-Bas', homeCode: 'JP', awayCode: 'NL', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(30, 16) },
    { id: 'sim-r16-7', homeName: 'Belgique', awayName: 'Croatie', homeCode: 'BE', awayCode: 'HR', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(31, 12) },
    { id: 'sim-r16-8', homeName: 'Sénégal', awayName: 'Suisse', homeCode: 'SN', awayCode: 'CH', phase: 'Huitièmes de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(31, 16) },
    { id: 'sim-qf-1', homeName: 'France', awayName: 'Brésil', homeCode: 'FR', awayCode: 'BR', phase: 'Quarts de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(35, 16) },
    { id: 'sim-qf-2', homeName: 'Argentine', awayName: 'Angleterre', homeCode: 'AR', awayCode: 'GB-ENG', phase: 'Quarts de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(36, 12) },
    { id: 'sim-qf-3', homeName: 'Mexique', awayName: 'Japon', homeCode: 'MX', awayCode: 'JP', phase: 'Quarts de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(36, 16) },
    { id: 'sim-qf-4', homeName: 'Belgique', awayName: 'Sénégal', homeCode: 'BE', awayCode: 'SN', phase: 'Quarts de finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(37, 12) },
    { id: 'sim-sf-1', homeName: 'France', awayName: 'Argentine', homeCode: 'FR', awayCode: 'AR', phase: 'Demi-finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(42, 20) },
    { id: 'sim-sf-2', homeName: 'Brésil', awayName: 'Mexique', homeCode: 'BR', awayCode: 'MX', phase: 'Demi-finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(43, 20) },
    { id: 'sim-third', homeName: 'Argentine', awayName: 'Mexique', homeCode: 'AR', awayCode: 'MX', phase: 'Petite finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(46, 16) },
    { id: 'sim-final', homeName: 'France', awayName: 'Brésil', homeCode: 'FR', awayCode: 'BR', phase: 'Finale', group: 'Tableau', status: 'NS', kickoffMs: futureKickoff(47, 20) },
  ];
  return base.map((r) => ({
    ...r,
    date: '',
    time: '',
    kickoff_label: formatKickoffLabel(r.kickoffMs),
  }));
}

export function getSimFantasyPlayers(): FantasyPlayer[] {
  const roster: { name: string; code: string; position: FantasyPlayer['position']; price: number; goals: number; rating: number }[] = [
    { name: 'Mbappé', code: 'FR', position: 'ATT', price: 16, goals: 42, rating: 8.9 },
    { name: 'Griezmann', code: 'FR', position: 'ATT', price: 12, goals: 28, rating: 8.2 },
    { name: 'Tchouaméni', code: 'FR', position: 'MID', price: 11, goals: 6, rating: 8.0 },
    { name: 'Saliba', code: 'FR', position: 'DEF', price: 10, goals: 2, rating: 8.1 },
    { name: 'Lloris', code: 'FR', position: 'GK', price: 8, goals: 0, rating: 7.8 },
    { name: 'Vinícius Jr', code: 'BR', position: 'ATT', price: 15, goals: 38, rating: 8.8 },
    { name: 'Rodrygo', code: 'BR', position: 'ATT', price: 12, goals: 22, rating: 8.3 },
    { name: 'Casemiro', code: 'BR', position: 'MID', price: 11, goals: 8, rating: 8.0 },
    { name: 'Messi', code: 'AR', position: 'ATT', price: 17, goals: 45, rating: 9.1 },
    { name: 'Álvarez', code: 'AR', position: 'ATT', price: 13, goals: 24, rating: 8.4 },
    { name: 'Pedri', code: 'ES', position: 'MID', price: 12, goals: 10, rating: 8.5 },
    { name: 'Morata', code: 'ES', position: 'ATT', price: 11, goals: 26, rating: 8.0 },
    { name: 'Hakimi', code: 'MA', position: 'DEF', price: 10, goals: 5, rating: 8.2 },
    { name: 'Ounahi', code: 'MA', position: 'MID', price: 9, goals: 7, rating: 7.9 },
    { name: 'Musiala', code: 'DE', position: 'MID', price: 13, goals: 18, rating: 8.6 },
    { name: 'Kane', code: 'EN', position: 'ATT', price: 14, goals: 35, rating: 8.7 },
    { name: 'Pulisic', code: 'US', position: 'ATT', price: 11, goals: 19, rating: 8.1 },
    { name: 'Lozano', code: 'MX', position: 'ATT', price: 10, goals: 16, rating: 7.9 },
    { name: 'Ronaldo', code: 'PT', position: 'ATT', price: 14, goals: 40, rating: 8.5 },
    { name: 'Gakpo', code: 'NL', position: 'ATT', price: 11, goals: 17, rating: 8.0 },
  ];
  return roster.map((p, idx) => {
    const meta = countryMeta(p.code);
    const assists = Math.max(2, Math.floor(p.goals / 4));
    const fantasyPoints = Math.round(p.goals * 10 + assists * 6 + p.rating * 4);
    return {
      id: `sim-fantasy-${p.code}-${idx}`,
      name: p.name,
      shortName: p.name.split(' ').pop() ?? p.name,
      country: meta.name,
      countryCode: p.code,
      jerseyNumber: (idx % 23) + 1,
      position: p.position,
      price: p.price,
      goals: p.goals,
      assists,
      rating: p.rating,
      fantasyPoints,
      totalPoints: fantasyPoints,
      isCaptain: idx === 0,
    };
  });
}

export function createSimDuel(userId: string, userName: string, countryCode: string): Duel {
  const code = countryCode.toUpperCase();
  const meta = countryMeta(code);
  const oppCode = code === 'FR' ? 'BR' : 'FR';
  const oppMeta = countryMeta(oppCode);
  return {
    id: `sim-duel-${userId}`,
    player1: {
      userId,
      country: code,
      flag: meta.flag,
      points: 420,
      name: userName || 'Toi',
    },
    player2: {
      userId: 'sim-opponent',
      country: oppCode,
      flag: oppMeta.flag,
      points: 380,
      name: oppCode === 'BR' ? 'Supporter BR' : 'Supporter FR',
    },
    matchIds: ['sim-fix-1', 'sim-fix-2'],
    status: 'active',
  };
}

export function getSimGroupStandings(): LiveGroupStandings[] {
  return WC_GROUP_ENTRIES.map((entry) => {
    const teamsInGroup = COUNTRIES.filter((c) => c.group === entry.letter);
    const teams: Standing[] = teamsInGroup.map((c, idx) => ({
      position: idx + 1,
      team_name: c.name,
      country_code: c.code,
      points: idx === 0 ? 6 : idx === 1 ? 4 : idx === 2 ? 3 : 0,
      goal_difference: 3 - idx,
      played: 2,
      wins: idx === 0 ? 2 : idx === 1 ? 1 : 0,
    }));
    return {
      name: entry.name,
      id: entry.id,
      letter: entry.letter,
      teams,
    };
  });
}

/** Quelques vainqueurs déjà choisis sur le tableau (démo). */
export function getSimTableauPredictions(): BracketPrediction[] {
  return [
    { matchId: 'sim-r16-1', round: 'r16', predictedWinner: 'France', predictedWinnerCode: 'FR' },
    { matchId: 'sim-r16-2', round: 'r16', predictedWinner: 'Brésil', predictedWinnerCode: 'BR' },
  ];
}

/** Pronos déjà enregistrés en démo (pour voir l’état « validé »). */
export function getSimSavedPronos(): Record<string, { matchId: string; homeScore: number; awayScore: number; predictedScorer?: string; submittedAt: number; pointsAwarded?: number }> {
  return {
    'sim-fix-1': {
      matchId: 'sim-fix-1',
      homeScore: 2,
      awayScore: 1,
      predictedScorer: 'Mbappé',
      submittedAt: Date.now() - DAY,
      pointsAwarded: 120,
    },
  };
}
