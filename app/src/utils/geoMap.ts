/** Projection equirectangulaire simple → position % sur la carte (viewBox 0–100). */
export function lngLatToMapPercent(lng: number, lat: number): { leftPct: number; topPct: number } {
  const leftPct = ((lng + 180) / 360) * 100;
  const topPct = ((90 - lat) / 180) * 100;
  return {
    leftPct: Math.max(2, Math.min(98, leftPct)),
    topPct: Math.max(4, Math.min(92, topPct)),
  };
}

export function borderColorForCountry(code: string): string {
  const c = code.toUpperCase();
  if (c === 'FR') return '#002395';
  if (c === 'BR') return '#8B5CF6';
  if (c === 'JP') return '#FF3B30';
  if (c === 'MA') return '#FFD700';
  if (c === 'DE') return '#888888';
  return 'rgba(255,255,255,0.45)';
}
