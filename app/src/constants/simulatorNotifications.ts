/** Modèles push Simulator (sans emojis — icônes côté client). */
export const SIMULATOR_NOTIFICATIONS = {
  goal: (playerName: string, newScore: number) => ({
    title: `${playerName} marque pour ton équipe !`,
    body: `Ton score monte à ${newScore} pts dans le Simulator`,
    data: { screen: 'Arena' as const, tab: 'match' as const },
  }),
  assist: (playerName: string) => ({
    title: `Passe décisive de ${playerName} !`,
    body: '+6 pts pour ton équipe Fantasy',
    data: { screen: 'Arena' as const, tab: 'match' as const },
  }),
  clean_sheet: (playerName: string) => ({
    title: `Clean sheet de ${playerName} !`,
    body: '+8 pts · Ta défense est solide',
    data: { screen: 'Arena' as const, tab: 'match' as const },
  }),
  captain_goal: (playerName: string, pts: number) => ({
    title: `${playerName} (capitaine) marque !`,
    body: `+${pts} pts doublés · Continue comme ça`,
    data: { screen: 'Arena' as const, tab: 'match' as const },
  }),
  rank_up: (newRank: number, overtakenName: string) => ({
    title: `Tu es maintenant #${newRank} mondial !`,
    body: `Tu as dépassé ${overtakenName}`,
    data: { screen: 'Arena' as const, tab: 'ranking' as const },
  }),
  rank_down: (newRank: number, overtakerName: string) => ({
    title: `${overtakerName} te dépasse`,
    body: `Tu es maintenant #${newRank} mondial`,
    data: { screen: 'Arena' as const, tab: 'ranking' as const },
  }),
  day_end: (dayPts: number, rank: number) => ({
    title: 'Résumé de la journée',
    body: `Tu as gagné ${dayPts} pts · Rang actuel : #${rank}`,
    data: { screen: 'Arena' as const },
  }),
  opponent_scores: (opponentName: string, opponentPts: number, myPts: number) => ({
    title: `${opponentName} marque !`,
    body: `Score : ${myPts} — ${opponentPts} · Reste concentré`,
    data: { screen: 'Arena' as const, tab: 'match' as const },
  }),
  champion: () => ({
    title: 'TU ES CHAMPION GOALYA 2026 !',
    body: 'Tu as dominé tous les managers du monde',
    data: { screen: 'Arena' as const },
  }),
} as const;
