export type ParsedApiMatchEvent = {
  id: string;
  type: string;
  teamCode: string;
  playerId?: string;
  playerName?: string;
  minute?: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function extractEventList(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data);
  if (Array.isArray(data?.event)) return data.event as unknown[];
  if (Array.isArray(data?.events)) return data.events as unknown[];
  if (Array.isArray(root.event)) return root.event as unknown[];
  if (Array.isArray(root.events)) return root.events as unknown[];
  return [];
}

export function parseMatchEvents(payload: unknown): ParsedApiMatchEvent[] {
  const rows: ParsedApiMatchEvent[] = [];
  for (const raw of extractEventList(payload)) {
    const row = asRecord(raw);
    if (!row) continue;
    const id =
      asString(row.id) ||
      asString(row.event_id) ||
      `${asString(row.type)}-${asString(row.minute)}-${asString(row.player)}`;
    const type = asString(row.type).toLowerCase();
    const teamCode =
      asString(row.team_code) ||
      asString(row.team) ||
      asString(asRecord(row.team)?.code) ||
      asString(row.team_id) ||
      'UNK';
    const minuteRaw = asNumber(row.minute, asNumber(row.time, 0));
    rows.push({
      id,
      type,
      teamCode: teamCode.toUpperCase(),
      playerId: asString(row.player_id) || asString(row.playerId) || undefined,
      playerName:
        asString(row.player) ||
        asString(row.player_name) ||
        asString(row.scorer) ||
        asString(asRecord(row.player)?.name) ||
        undefined,
      minute: minuteRaw > 0 ? minuteRaw : undefined,
    });
  }
  return rows;
}

export function extractMatchRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = root.data;
  if (Array.isArray(data)) {
    return data.map((x) => asRecord(x)).filter((x): x is Record<string, unknown> => x != null);
  }
  const dataObj = asRecord(data);
  if (dataObj) {
    for (const key of ['match', 'matches', 'fixture', 'fixtures'] as const) {
      const arr = dataObj[key];
      if (Array.isArray(arr)) {
        return arr.map((x) => asRecord(x)).filter((x): x is Record<string, unknown> => x != null);
      }
    }
  }
  for (const key of ['match', 'matches'] as const) {
    const arr = root[key];
    if (Array.isArray(arr)) {
      return arr.map((x) => asRecord(x)).filter((x): x is Record<string, unknown> => x != null);
    }
  }
  return [];
}
