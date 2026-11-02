export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  phase: string;
  kickoff: Date;
  scoreHome?: number;
  scoreAway?: number;
  status: MatchStatus;
}

