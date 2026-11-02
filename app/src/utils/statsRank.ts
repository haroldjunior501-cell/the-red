/** Classement compétition : ex-aequo partagent le même rang, le suivant saute. */
export function assignDisplayRanks<T>(sorted: T[], valueOf: (row: T) => number): (T & { displayRank: number })[] {
  let rank = 1;
  return sorted.map((row, i) => {
    if (i > 0 && valueOf(row) < valueOf(sorted[i - 1]!)) {
      rank = i + 1;
    }
    return { ...row, displayRank: rank };
  });
}
