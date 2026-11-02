export type NextMatchResult = {
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
  phase: string;
  fixtureId: string;
  homeId: string;
  awayId: string;
  homeLogo?: string;
  awayLogo?: string;
  goalsHome: number | null;
  goalsAway: number | null;
  statusShort: string;
  elapsed: number | null;
};

export type LiveMatchResult = {
  score: { home: number; away: number };
  minute: number | null;
  recentEvents: { type: string; detail: string; minute?: number }[];
  fixtureId: string;
  date: string;
  home: { id: string; name: string; logo?: string };
  away: { id: string; name: string; logo?: string };
  phase: string;
  statusShort: string;
  elapsed: number | null;
};
