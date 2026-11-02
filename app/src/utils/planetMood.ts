import type { WeatherMood } from '../types/planetEvents';
import type { ParsedLiveScore } from '../services/livescoreApi';

export function computeWeatherMood(live: ParsedLiveScore | null, recentGoals: number): WeatherMood {
  if (!live) return 'normal';
  const diff = Math.abs(live.home.score - live.away.score);
  if (live.minute >= 85) return 'dramatic';
  if (recentGoals >= 2) return 'electric';
  if (diff <= 1 && live.minute >= 70) return 'tense';
  return 'normal';
}
