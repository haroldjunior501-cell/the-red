import type { LiveFilterKey, LiveMatch } from '../types/live.types';
import type { MatchEngagement } from '../types/live.types';

export function filterMatchByPhase(match: LiveMatch, filter: LiveFilterKey): boolean {
  const round = match.round.toLowerCase();
  switch (filter) {
    case 'groupes':
      return round.includes('group') || match.group.toLowerCase().includes('groupe');
    case '1/8':
      return round.includes('round of 16') || round.includes('1/8') || round.includes('huitième');
    case '1/4':
      return round.includes('quarter') || round.includes('1/4') || round.includes('quart');
    case 'demi':
      return round.includes('semi') || round.includes('demi');
    case 'finale':
      return round.includes('final');
    default:
      return true;
  }
}

export function isHotMatch(match: LiveMatch, engagement?: MatchEngagement): boolean {
  const diff = Math.abs(match.home_score - match.away_score);
  const minute = parseInt(match.minute, 10) || 0;
  if (engagement && engagement.viewerCount > 1_000_000) return true;
  if (diff < 2 && minute > 70 && match.status === 'live') return true;
  if (match.events.length > 3) return true;
  return false;
}

export function formatViewers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function scorersLabel(match: LiveMatch): string {
  const goals = match.events.filter((e) => e.type === 'goal');
  if (!goals.length) return '';
  return goals
    .slice(-3)
    .map((g) => `${g.player_name.split(' ').pop() ?? g.player_name} ${g.minute}'`)
    .join(' · ');
}

export function pickFeaturedMatch(
  matches: LiveMatch[],
  engagementById: Record<string, MatchEngagement>
): LiveMatch | null {
  if (!matches.length) return null;
  let best = matches[0];
  let bestScore = engagementById[best.id]?.viewerCount ?? 0;
  for (const m of matches.slice(1)) {
    const v = engagementById[m.id]?.viewerCount ?? 0;
    if (v > bestScore) {
      best = m;
      bestScore = v;
    }
  }
  return best;
}

export function formatKickoffLabel(kickoffMs: number): string {
  const d = new Date(kickoffMs);
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.toLocaleString('fr-FR', { month: 'short' }).replace('.', '');
  const time = d.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  return `${day} ${monthCap} · ${time}`;
}

export function kickoffMsFromRow(row: Record<string, unknown>): number {
  const date = typeof row.date === 'string' ? row.date : typeof row.match_date === 'string' ? row.match_date : typeof row.fixture_date === 'string' ? row.fixture_date : '';
  const time =
    typeof row.time === 'string'
      ? row.time
      : typeof row.start_time === 'string'
        ? row.start_time
        : typeof row.kickoff_time === 'string'
          ? row.kickoff_time
          : typeof row.kickoff === 'string'
            ? row.kickoff
            : '12:00:00';
  if (!date) return 0;
  const iso = time.includes('T') ? time : `${date}T${time}`;
  // LiveScore API et FotMob renvoient des heures UTC sans indicateur de timezone.
  // Sans le Z, JavaScript parse comme heure locale → décalage = fuseau horaire local.
  const isoUTC = /Z|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const ms = new Date(isoUTC).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function worldCupDayLabel(): string {
  const start = new Date('2026-06-11T00:00:00Z').getTime();
  const now = Date.now();
  const day = Math.max(1, Math.floor((now - start) / 86_400_000) + 1);
  return `Day ${day}`;
}
