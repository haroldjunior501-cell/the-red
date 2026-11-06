/**
 * Parseur match FotMob — adapté de FootballIntelligence (`lib/fotmob/match.ts`).
 * Sert Face-à-face / Forme / Blessés pour THE RED.
 */
import { fotmobPlayerImageUrl, fotmobTeamLogoUrl } from '../constants/fotmob';
import type { FormChar, FormMatchDetail, H2HDetail, H2HMatchDetail, Injury } from './footballService';
import { fotmobGet, num, rec, str } from './fotmobHttp';

function mapResult(v: unknown): FormChar {
  if (typeof v === 'number') {
    if (v > 0) return 'G';
    if (v < 0) return 'P';
    return 'N';
  }
  const s = str(v).toUpperCase();
  if (s === 'W' || s === 'WIN' || s === 'G' || s === '1') return 'G';
  if (s === 'D' || s === 'DRAW' || s === 'N' || s === '0') return 'N';
  if (s === 'L' || s === 'LOSS' || s === 'P' || s === '-1') return 'P';
  return 'N';
}

/** Forme FotMob actuelle = tableau de matchs (pas `{ form: [] }`). */
function formRowsFromBlock(block: unknown): unknown[] {
  if (Array.isArray(block)) return block;
  const b = rec(block);
  if (!b) return [];
  if (Array.isArray(b.form)) return b.form;
  if (Array.isArray(b.matches)) return b.matches;
  return [];
}

function opponentFromFormRow(o: Record<string, unknown>): string {
  const tip = rec(o.tooltipText);
  const home = rec(o.home) ?? {};
  const away = rec(o.away) ?? {};
  if (home.isOurTeam === true) return str(away.name ?? tip?.awayTeam, '—');
  if (away.isOurTeam === true) return str(home.name ?? tip?.homeTeam, '—');
  return str(o.opponentName ?? rec(o.opponent)?.name ?? tip?.homeTeam ?? tip?.awayTeam, '—');
}

function reasonFromUnavailable(o: Record<string, unknown>): string {
  const u = rec(o.unavailability) ?? {};
  const typeRaw = str(u.type ?? o.reason ?? o.injury ?? o.type).toLowerCase();
  let kind = 'Indisponible';
  if (typeRaw.includes('injur') || typeRaw.includes('bless')) kind = 'Blessure';
  else if (typeRaw.includes('suspen') || typeRaw.includes('cart')) kind = 'Suspension';
  else if (typeRaw) kind = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1);
  const ret = str(u.expectedReturn ?? o.expectedReturn ?? o.returnDate);
  return ret ? `${kind} · Retour : ${ret}` : kind;
}

export type MatchPrepUnavailable = Injury & {
  id?: number | null;
  photo?: string;
  isHome: boolean;
};

export type MatchPrepFormRow = FormMatchDetail & {
  resultCode: 'W' | 'D' | 'L' | 'U';
  opponent: string;
  score: string;
};

export type MatchPrepBundle = {
  matchId: string;
  leagueName: string;
  stadium: string | null;
  home: { id: number; name: string; logo?: string };
  away: { id: number; name: string; logo?: string };
  homeForm: MatchPrepFormRow[];
  awayForm: MatchPrepFormRow[];
  h2h: H2HDetail;
  unavailable: MatchPrepUnavailable[];
  insights: string[];
};

function mapFormBlock(block: unknown): MatchPrepFormRow[] {
  const rows = formRowsFromBlock(block).map((f) => {
    const o = rec(f) ?? {};
    const tip = rec(o.tooltipText) ?? {};
    const result = mapResult(o.resultString ?? o.result ?? o.outcome);
    const opponent = opponentFromFormRow(o);
    const score = str(o.score ?? tip.score, '');
    const when = str(rec(o.date)?.utcTime ?? tip.utcTime);
    const subtitle = when
      ? new Date(when).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      : str(o.tournamentName ?? o.competitionName, 'Match');
    return {
      result,
      resultCode: (result === 'G' ? 'W' : result === 'N' ? 'D' : result === 'P' ? 'L' : 'U') as
        | 'W'
        | 'D'
        | 'L'
        | 'U',
      opponent,
      score,
      label: score ? `${opponent} · ${score}` : opponent,
      subtitle,
      _ts: when ? new Date(when).getTime() : 0,
    };
  });
  // plus récent en premier (FotMob envoie souvent du plus ancien)
  rows.sort((a, b) => b._ts - a._ts);
  return rows.map(({ _ts: _drop, ...rest }) => rest);
}

export function parseFotmobMatchPrep(payload: unknown, matchIdFallback = ''): MatchPrepBundle | null {
  const root = rec(payload);
  if (!root) return null;
  const general = rec(root.general) ?? {};
  const header = rec(root.header) ?? {};
  const content = rec(root.content) ?? {};
  const facts = rec(content.matchFacts) ?? {};
  const infoBox = rec(facts.infoBox) ?? {};

  const homeG = rec(general.homeTeam) ?? {};
  const awayG = rec(general.awayTeam) ?? {};
  const teams = Array.isArray(header.teams) ? header.teams : [];
  const homeH = rec(teams[0]) ?? {};
  const awayH = rec(teams[1]) ?? {};

  const homeId = num(homeG.id ?? homeH.id) ?? 0;
  const awayId = num(awayG.id ?? awayH.id) ?? 0;
  const homeName = str(homeG.name ?? homeH.name, 'Home');
  const awayName = str(awayG.name ?? awayH.name, 'Away');

  const lineupRoot = rec(content.lineup) ?? rec(content.lineupPreview) ?? {};
  const homeTeamLu = rec(lineupRoot.homeTeam);
  const awayTeamLu = rec(lineupRoot.awayTeam);
  const unavailRoot = rec(lineupRoot.unavailable) ?? {};
  const unavailable: MatchPrepUnavailable[] = [];

  const pushUnavail = (list: unknown, isHome: boolean) => {
    if (!Array.isArray(list)) return;
    for (const row of list) {
      const o = rec(row) ?? rec(rec(row)?.player);
      if (!o) continue;
      const name = str(o.name);
      if (!name) continue;
      const id = num(o.id ?? o.playerId);
      if (unavailable.some((u) => u.id != null && u.id === id && u.isHome === isHome)) continue;
      unavailable.push({
        id,
        name,
        reason: reasonFromUnavailable(o),
        photo: id != null ? fotmobPlayerImageUrl(id) : undefined,
        isHome,
      });
    }
  };

  for (const [key, isHome] of [
    ['home', true],
    ['away', false],
  ] as const) {
    const block = rec(unavailRoot[key]);
    pushUnavail(block?.nonAvailablePlayers ?? block?.players ?? [], isHome);
  }
  pushUnavail(homeTeamLu?.unavailable, true);
  pushUnavail(awayTeamLu?.unavailable, false);

  /** FotMob actuel : `teamForm` = [ [matchs home…], [matchs away…] ]. */
  const formBlocks = facts.teamForm;
  let homeForm: MatchPrepFormRow[] = [];
  let awayForm: MatchPrepFormRow[] = [];
  if (Array.isArray(formBlocks)) {
    for (const block of formBlocks) {
      const tid = num(rec(block)?.teamId);
      if (tid === homeId) homeForm = mapFormBlock(block);
      else if (tid === awayId) awayForm = mapFormBlock(block);
    }
    if (!homeForm.length && formBlocks.length >= 1) {
      homeForm = mapFormBlock(formBlocks[0]);
      awayForm = formBlocks.length >= 2 ? mapFormBlock(formBlocks[1]) : [];
    }
  }

  const h2hRoot = rec(content.h2h) ?? rec(facts.h2h) ?? {};
  const summaryArr = Array.isArray(h2hRoot.summary) ? h2hRoot.summary : null;
  const summaryObj = rec(h2hRoot.summary) ?? {};
  const homeWins = summaryArr
    ? num(summaryArr[0], 0) ?? 0
    : num(summaryObj.homeTeamWins ?? summaryObj.winsHome, 0) ?? 0;
  const draws = summaryArr ? num(summaryArr[1], 0) ?? 0 : num(summaryObj.draws, 0) ?? 0;
  const awayWins = summaryArr
    ? num(summaryArr[2], 0) ?? 0
    : num(summaryObj.awayTeamWins ?? summaryObj.winsAway, 0) ?? 0;

  const matches: H2HMatchDetail[] = [];
  let goalsTeam1 = 0;
  let goalsTeam2 = 0;
  const h2hMatches = Array.isArray(h2hRoot.matches) ? h2hRoot.matches : [];
  for (const row of h2hMatches) {
    const o = rec(row);
    if (!o) continue;
    const st = rec(o.status) ?? {};
    if (!st.finished) continue;
    const home = rec(o.home) ?? {};
    const away = rec(o.away) ?? {};
    const scoreStr = str(st.scoreStr);
    const m = scoreStr.match(/(\d+)\s*[-–]\s*(\d+)/);
    const gh = m ? Number(m[1]) : num(home.score) ?? 0;
    const ga = m ? Number(m[2]) : num(away.score) ?? 0;
    const hId = String(home.id ?? '');
    const aId = String(away.id ?? '');
    // goals relative to fixture home/away of THIS upcoming match
    if (hId === String(homeId)) {
      goalsTeam1 += gh;
      goalsTeam2 += ga;
    } else if (aId === String(homeId)) {
      goalsTeam1 += ga;
      goalsTeam2 += gh;
    } else {
      goalsTeam1 += gh;
      goalsTeam2 += ga;
    }
    const idFromUrl = str(o.matchUrl).match(/#(\d+)/)?.[1] ?? `${hId}-${aId}-${str(st.utcTime)}`;
    matches.push({
      id: idFromUrl,
      dateMs: new Date(str(st.utcTime ?? rec(o.time)?.utcTime) || Date.now()).getTime(),
      phase: str(rec(o.league)?.name, 'Match'),
      home: {
        id: hId,
        name: str(home.name, 'Home'),
        logo: fotmobTeamLogoUrl(home.id),
      },
      away: {
        id: aId,
        name: str(away.name, 'Away'),
        logo: fotmobTeamLogoUrl(away.id),
      },
      goalsHome: gh,
      goalsAway: ga,
    });
    if (matches.length >= 15) break;
  }

  const insights: string[] = [];
  if (Array.isArray(facts.insights)) {
    for (const row of facts.insights.slice(0, 8)) {
      const text = str(rec(row)?.text ?? rec(row)?.defaultText);
      if (text) insights.push(text);
    }
  }

  const stadiumObj = rec(infoBox.Stadium) ?? rec(infoBox.stadium);

  return {
    matchId: str(general.matchId, matchIdFallback),
    leagueName: str(general.leagueName, 'Premier League'),
    stadium: str(stadiumObj?.name ?? infoBox.Stadium, '') || null,
    home: { id: homeId, name: homeName, logo: fotmobTeamLogoUrl(homeId) },
    away: { id: awayId, name: awayName, logo: fotmobTeamLogoUrl(awayId) },
    homeForm,
    awayForm,
    h2h: {
      winsTeam1: homeWins,
      draws,
      winsTeam2: awayWins,
      goalsTeam1,
      goalsTeam2,
      matches,
    },
    unavailable,
    insights,
  };
}

const prepCache = new Map<string, { at: number; data: MatchPrepBundle }>();
const PREP_TTL = 1000 * 60 * 8;

export async function fetchFotmobMatchPrep(matchId: string): Promise<MatchPrepBundle | null> {
  if (!matchId) return null;
  const hit = prepCache.get(matchId);
  if (hit && Date.now() - hit.at < PREP_TTL) return hit.data;

  const json = await fotmobGet(`/matchDetails?matchId=${encodeURIComponent(matchId)}`, {
    ttlMs: PREP_TTL,
  });
  const parsed = parseFotmobMatchPrep(json, matchId);
  if (parsed) {
    prepCache.set(matchId, { at: Date.now(), data: parsed });
    return parsed;
  }
  return null;
}
