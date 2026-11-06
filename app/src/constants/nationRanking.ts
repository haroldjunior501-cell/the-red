/** Sources qui alimentent la puissance d'une nation (RTDB `nations/{code}/power`). */
export const NATION_POWER_SOURCES = [
  { label: 'Pronos', detail: 'Scores exacts, vainqueur, buteur…' },
  { label: 'Tableau', detail: 'Bon vainqueur à chaque tour du bracket' },
  { label: 'Vidéos', detail: 'Temps forts, Inside Carrington & collections @manutd' },
  { label: 'Fantasy & Arena', detail: 'Buts, passes, duels 1v1' },
] as const;
