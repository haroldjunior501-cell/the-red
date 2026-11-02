/** Sources qui alimentent la puissance d'une nation (RTDB `nations/{code}/power`). */
export const NATION_POWER_SOURCES = [
  { label: 'Pronos', detail: 'Scores exacts, vainqueur, buteur…' },
  { label: 'Tableau', detail: 'Bon vainqueur à chaque tour du bracket' },
  { label: 'Hub', detail: 'Réactions & messages pendant les matchs' },
  { label: 'Fantasy & Arena', detail: 'Buts, passes, duels 1v1' },
] as const;
