import { onChildAdded, ref, type Unsubscribe } from 'firebase/database';
import { getFirebaseRtdb } from './firebase';

export type AgentActionType =
  | 'GOAL_CHAPTER'
  | 'EMOTION_UPDATE'
  | 'TACTICAL_ALERT'
  | 'MATCH_START'
  | 'MATCH_SUMMARY';

export type AgentAction = {
  id: string;
  type: AgentActionType;
  title: string;
  message: string;
  narrative?: string;
  action?: string;
  requiresApproval: boolean;
  timestamp: number;
};

type LiveEventPayload = {
  type?: string;
  team?: string;
  player?: string;
  minute?: string;
};

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function openAiKey(): string {
  return (process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '').trim();
}

async function narrateWithGpt(system: string, user: string, fallback: string): Promise<string> {
  const key = openAiKey();
  if (!key) return fallback;
  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 180,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : fallback;
  } catch {
    return fallback;
  }
}

function buildActionFromEvent(eventId: string, payload: LiveEventPayload): Promise<AgentAction> {
  const type = payload.type ?? 'info';
  const minute = payload.minute ?? '';
  const player = payload.player ?? 'un joueur';
  const team = payload.team ?? 'la nation';
  const ts = Date.now();

  if (type === 'goal') {
    const fallback = `But pour ${team} (${minute}). La tension monte sur le globe — publier le chapitre live ?`;
    return narrateWithGpt(
      'Tu es l’agent narratif GOALYA pour supporters. Réponds en français, 2 phrases max, ton énergique.',
      `But : ${player}, ${team}, ${minute}.`,
      fallback
    ).then((narrative) => ({
      id: eventId,
      type: 'GOAL_CHAPTER',
      title: `BUT · ${team}`,
      message: narrative,
      narrative,
      action: 'Publier le chapitre',
      requiresApproval: true,
      timestamp: ts,
    }));
  }
  if (type === 'miss') {
    return Promise.resolve({
      id: eventId,
      type: 'EMOTION_UPDATE',
      title: 'Occasion manquée',
      message: `${team} rate une occasion (${minute}). Réagis avec ta nation.`,
      requiresApproval: false,
      timestamp: ts,
    });
  }
  if (type === 'card') {
    return Promise.resolve({
      id: eventId,
      type: 'TACTICAL_ALERT',
      title: 'Alerte tactique',
      message: `Carton pour ${player} (${team}) — ${minute}.`,
      requiresApproval: false,
      timestamp: ts,
    });
  }
  if (type === 'matchStart') {
    return Promise.resolve({
      id: eventId,
      type: 'MATCH_START',
      title: 'Coup d’envoi',
      message: 'Le match est lancé. Ton cockpit est actif — envoie une réaction sur le globe.',
      requiresApproval: false,
      timestamp: ts,
    });
  }
  if (type === 'matchEnd') {
    const fallback = `Fin de match. Résume l’émotion collective et propose un chapitre de clôture.`;
    return narrateWithGpt(
      'Tu es l’agent narratif GOALYA. Résume en 3 phrases pour supporters.',
      `Match terminé. Dernière minute ${minute}.`,
      fallback
    ).then((narrative) => ({
      id: eventId,
      type: 'MATCH_SUMMARY',
      title: 'Résumé du match',
      message: narrative,
      narrative,
      action: 'Publier le résumé',
      requiresApproval: true,
      timestamp: ts,
    }));
  }
  return Promise.resolve({
    id: eventId,
    type: 'EMOTION_UPDATE',
    title: 'Mise à jour',
    message: `Événement live (${type}).`,
    requiresApproval: false,
    timestamp: ts,
  });
}

const mockTimers = new Map<string, ReturnType<typeof setInterval>>();

function startMockAgent(matchId: string, cb: (action: AgentAction) => void): () => void {
  if (mockTimers.has(matchId)) return () => undefined;
  const samples: LiveEventPayload[] = [
    { type: 'matchStart', minute: "0'" },
    { type: 'goal', team: 'France', player: 'Mbappé', minute: "23'" },
    { type: 'miss', team: 'Brésil', minute: "41'" },
    { type: 'card', team: 'Brésil', player: 'Casemiro', minute: "55'" },
  ];
  let i = 0;
  const id = setInterval(() => {
    const payload = samples[i % samples.length];
    const eventId = `mock_${matchId}_${Date.now()}`;
    void buildActionFromEvent(eventId, payload).then(cb);
    i += 1;
  }, 22_000);
  mockTimers.set(matchId, id);
  return () => {
    clearInterval(id);
    mockTimers.delete(matchId);
  };
}

export function subscribeToAgentEvents(matchId: string, callback: (action: AgentAction) => void): () => void {
  if (!matchId) return () => undefined;
  let rtdb: ReturnType<typeof getFirebaseRtdb> | null = null;
  try {
    rtdb = getFirebaseRtdb();
  } catch {
    rtdb = null;
  }
  if (!rtdb) {
    return startMockAgent(matchId, callback);
  }
  const path = ref(rtdb, `live/${matchId}/events`);
  const unsub: Unsubscribe = onChildAdded(path, (snap) => {
    const val = snap.val() as LiveEventPayload | null;
    if (!val) return;
    void buildActionFromEvent(snap.key ?? `evt_${Date.now()}`, val).then(callback);
  });
  return () => unsub();
}

export async function approveAgentAction(action: AgentAction): Promise<void> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[aiAgent] approved', action.type, action.id);
  }
}

export async function rejectAgentAction(action: AgentAction): Promise<void> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[aiAgent] rejected', action.type, action.id);
  }
}
