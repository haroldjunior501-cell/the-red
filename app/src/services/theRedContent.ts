export type RedMatch = {
  id: number;
  opponent: string;
  competition: string;
  kickoff_at: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  is_home: 'HOME' | 'AWAY' | 'NEUTRAL' | string;
  venue?: string;
};

export type RedNews = {
  id: number;
  title: string;
  summary: string;
  source: string;
  published_at?: string;
  url?: string;
  image_url?: string;
};

export type RedPost = {
  id: number;
  author_name?: string;
  content: string;
  reactions_count: number;
  comments_count: number;
  created_at?: string;
  match_id?: number | null;
};

const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const FALLBACK_MATCHES: RedMatch[] = [
  {
    id: 1,
    opponent: 'Chelsea',
    competition: 'Premier League',
    kickoff_at: inDays(3),
    status: 'SCHEDULED',
    home_score: null,
    away_score: null,
    is_home: 'HOME',
    venue: 'Old Trafford',
  },
  {
    id: 2,
    opponent: 'Arsenal',
    competition: 'Premier League',
    kickoff_at: inDays(10),
    status: 'SCHEDULED',
    home_score: null,
    away_score: null,
    is_home: 'AWAY',
    venue: 'Emirates Stadium',
  },
  {
    id: 3,
    opponent: 'Liverpool',
    competition: 'Premier League',
    kickoff_at: inDays(-4),
    status: 'FINISHED',
    home_score: 2,
    away_score: 1,
    is_home: 'HOME',
    venue: 'Old Trafford',
  },
  {
    id: 4,
    opponent: 'Manchester City',
    competition: 'FA Cup',
    kickoff_at: inDays(-11),
    status: 'FINISHED',
    home_score: 2,
    away_score: 1,
    is_home: 'NEUTRAL',
    venue: 'Wembley',
  },
];

export const FALLBACK_NEWS: RedNews[] = [
  {
    id: 1,
    title: 'Amorim prépare le choc du week-end à Old Trafford',
    summary:
      'Le coach des Red Devils parle de l’intensité du pressing et de l’état du groupe avant le prochain rendez-vous à domicile.',
    source: 'MUFC',
    published_at: inDays(0),
  },
  {
    id: 2,
    title: 'Mainoo de retour à l’entraînement collectif à Carrington',
    summary:
      'Le milieu international anglais a enchaîné une séance complète et reste dans le groupe pour la prochaine journée.',
    source: 'Manchester Evening News',
    published_at: inDays(0),
  },
  {
    id: 3,
    title: 'Old Trafford : les supporters valident la prochaine étape du projet',
    summary:
      'Le Theatre of Dreams reste au centre du projet, avec une priorité claire : garder l’identité du stade tout en le modernisant.',
    source: 'BBC Sport',
    published_at: inDays(-1),
  },
];

export const FALLBACK_POSTS: RedPost[] = [
  {
    id: 101,
    author_name: 'RedDevil_Paris',
    content: 'Old Trafford un samedi soir, il n’y a rien au-dessus. Qui est chaud pour Chelsea ?',
    reactions_count: 42,
    comments_count: 8,
  },
  {
    id: 102,
    author_name: 'StretfordEnd',
    content: 'Mainoo titulaire, et on parle d’autre chose. Le milieu est enfin équilibré.',
    reactions_count: 27,
    comments_count: 5,
  },
  {
    id: 103,
    author_name: 'GloryGlory',
    content: '2-1 contre Liverpool, ce genre de soirée rappelle pourquoi on supporte ce club.',
    reactions_count: 61,
    comments_count: 14,
  },
];

export function matchStatusLabel(status: string): string {
  if (status === 'FINISHED') return 'Terminé';
  if (status === 'LIVE' || status === 'IN_PLAY') return 'En direct';
  return 'À venir';
}

export function formatKickoff(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function unitedScore(match: RedMatch): string | null {
  if (match.home_score == null || match.away_score == null) return null;
  const united = match.is_home === 'AWAY' ? match.away_score : match.home_score;
  const opponent = match.is_home === 'AWAY' ? match.home_score : match.away_score;
  return `${united} - ${opponent}`;
}
