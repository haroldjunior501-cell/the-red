import { useCallback, useEffect, useState } from 'react';
import { groupIdFromLetter, groupLetterFromName } from '../constants/liveGroups';
import { getLiveStandings, isFootballDataConfigured } from '../services/livescoreApi';
import { parseStandings } from '../services/liveMatchParsers';
import type { Standing } from '../types/live.types';

const POLL_MS = 120_000;

export function useLiveStandings(groupName: string) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const letter = groupLetterFromName(groupName);
  const groupId = groupIdFromLetter(letter) ?? '4286';

  const fetchOnce = useCallback(async () => {
    if (!isFootballDataConfigured()) {
      setStandings([]);
      setLoading(false);
      return;
    }
    try {
      const payload = await getLiveStandings(groupId);
      setStandings(parseStandings(payload));
      setError(null);
    } catch {
      setError('Classement indisponible');
      setStandings([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void fetchOnce();
    const id = setInterval(() => void fetchOnce(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchOnce]);

  return { standings, loading, error, groupLetter: letter };
}
