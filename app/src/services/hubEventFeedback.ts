import type { ParsedLiveScore } from './livescoreApi';
import { hapticService } from './hapticService';
import { notificationService } from './notificationService';
import { soundService } from './soundService';
import type { PlanetEvent } from '../types/planetEvents';

let penaltyHapticLoop: ReturnType<typeof setInterval> | null = null;
let penaltyStopTimer: ReturnType<typeof setTimeout> | null = null;

export function resolvePenaltyFeedback(): void {
  soundService.stopPenaltyHeartbeat();
  if (penaltyHapticLoop) {
    clearInterval(penaltyHapticLoop);
    penaltyHapticLoop = null;
  }
  if (penaltyStopTimer) {
    clearTimeout(penaltyStopTimer);
    penaltyStopTimer = null;
  }
}

export function teamNameForCode(live: ParsedLiveScore, code: string): string {
  const c = code.toUpperCase();
  if (live.home.code.toUpperCase() === c) return live.home.name;
  if (live.away.code.toUpperCase() === c) return live.away.name;
  return code;
}

export async function onMatchStart(live: ParsedLiveScore): Promise<void> {
  await Promise.all([
    soundService.play('match_start', 0.8),
    hapticService.matchStart(),
  ]);
  await soundService.startAmbient();
  void notificationService.sendMatchStartNotif(live.home.name, live.away.name);
}

export async function onMatchEnd(): Promise<void> {
  resolvePenaltyFeedback();
  await soundService.stopChaos();
  await Promise.all([soundService.play('end_match', 0.8), hapticService.endMatch()]);
}

export async function onGoal(event: PlanetEvent, live: ParsedLiveScore): Promise<void> {
  resolvePenaltyFeedback();
  const minute = String(event.minute ?? live.minute);
  const player = event.playerName ?? 'BUTEUR';

  void notificationService.sendGoalNotif(
    player,
    live.home.name,
    live.home.score,
    live.away.name,
    live.away.score,
    minute
  );

  await Promise.all([soundService.play('goal', 1.0), hapticService.goal()]);
}

export async function onNearMiss(): Promise<void> {
  resolvePenaltyFeedback();
  await Promise.all([soundService.play('near_miss', 0.75), hapticService.nearMiss()]);
}

export async function onRedCard(event: PlanetEvent, live: ParsedLiveScore): Promise<void> {
  const team = event.country ? teamNameForCode(live, event.country) : live.away.name;
  const player = event.playerName ?? 'Joueur';
  const minute = String(event.minute ?? live.minute);

  void notificationService.sendRedCardNotif(team, player, minute);
  await Promise.all([soundService.play('red_card', 1.0), hapticService.redCard()]);
}

export async function onPenalty(event: PlanetEvent, live: ParsedLiveScore): Promise<void> {
  const team = event.country ? teamNameForCode(live, event.country) : live.away.name;
  void notificationService.sendPenaltyNotif(team);

  soundService.startPenaltyHeartbeat();
  if (penaltyHapticLoop) clearInterval(penaltyHapticLoop);
  penaltyHapticLoop = setInterval(() => {
    void hapticService.penaltyBeat();
  }, 900);

  if (penaltyStopTimer) clearTimeout(penaltyStopTimer);
  penaltyStopTimer = setTimeout(() => resolvePenaltyFeedback(), 10_000);
}

export async function onChaosStart(): Promise<void> {
  await soundService.startChaos();
}

export async function onChaosEnd(): Promise<void> {
  await soundService.stopChaos();
}

export async function onChatExplosion(): Promise<void> {
  await Promise.all([soundService.play('chat_boom', 0.45), hapticService.chatBoom()]);
}

export async function onNationDominance(): Promise<void> {
  await Promise.all([soundService.play('match_start', 0.5), hapticService.nationDominance()]);
}

export async function onHistoric(): Promise<void> {
  await Promise.all([soundService.play('goal', 0.85), hapticService.goal()]);
}

export async function onViralPing(): Promise<void> {
  await Promise.all([soundService.play('match_start', 0.35), hapticService.viralPing()]);
}
