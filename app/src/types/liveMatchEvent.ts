export type PremiumMatchEventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution';

export type PremiumMatchEvent = {
  id: string;
  minute: number;
  extraMinute?: number;
  type: PremiumMatchEventType;
  team: 'home' | 'away';
  playerName: string;
  assistName?: string;
  incomingPlayer?: string;
  outgoingPlayer?: string;
  reason?: string;
};
