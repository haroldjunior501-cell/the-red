import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  DEFAULT_FANTASY_BUDGET_M,
  DEFAULT_FANTASY_POINTS,
  FP_REWARDS,
} from '../constants/fantasyEconomy';
import type { FpRewardKey } from '../types/fantasyEconomy.types';
import { getPrestige, todayDateKey } from '../utils/fantasyEconomyMath';
import { notificationService } from './notificationService';
import type {
  FantasyEconomyState,
  FantasyTransaction,
  FantasyTransactionType,
} from '../types/fantasyEconomy.types';
import { getFirestoreDb } from './firebase';
import { sanitizeForFirestore } from './fantasyService';

const ECONOMY_LOCAL_PREFIX = '@goalya/fantasy_economy_v2:';
/** Incrémenter pour réinitialiser les FP « offerts » (ex. ancien défaut 1250). */
export const FANTASY_ECONOMY_SCHEMA_VERSION = 2;
const TX_LOCAL_PREFIX = '@goalya/fantasy_tx_v1:';
const PROCESSED_REF_PREFIX = '@goalya/fantasy_ref_v1:';

const economyWriteTail = new Map<string, Promise<void>>();
const economyChangeListeners = new Set<() => void>();

/** Évite qu’un enregistrement streak écrase un crédit FP en parallèle (mission connexion). */
function runEconomyWrite<T>(userId: string, task: () => Promise<T>): Promise<T> {
  const prev = economyWriteTail.get(userId) ?? Promise.resolve();
  const run = prev.catch(() => undefined).then(task);
  economyWriteTail.set(
    userId,
    run.then(
      () => undefined,
      () => undefined
    )
  );
  return run;
}

export function subscribeFantasyEconomyChanges(listener: () => void): () => void {
  economyChangeListeners.add(listener);
  return () => economyChangeListeners.delete(listener);
}

function emitFantasyEconomyChanged(): void {
  economyChangeListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* ignore */
    }
  });
}

type UserEconomyDoc = {
  fantasyPoints?: number;
  fantasyBudget?: number;
  prestige?: string;
  loginStreak?: number;
  lastLoginDate?: string | null;
  lastFreeUpgrade?: string | null;
  economyVersion?: number;
};

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

function economyLocalKey(userId: string) {
  return `${ECONOMY_LOCAL_PREFIX}${userId}`;
}

function txLocalKey(userId: string) {
  return `${TX_LOCAL_PREFIX}${userId}`;
}

function refKey(userId: string) {
  return `${PROCESSED_REF_PREFIX}${userId}`;
}

function defaultState(): FantasyEconomyState {
  const budget = DEFAULT_FANTASY_BUDGET_M;
  return {
    fantasyPoints: DEFAULT_FANTASY_POINTS,
    fantasyBudgetM: budget,
    prestigeName: getPrestige(budget).name,
    loginStreak: 0,
    lastLoginDate: null,
    lastFreeUpgradeDate: null,
  };
}

const LEGACY_STARTER_FP = 1250;

function resolveFantasyPoints(raw: UserEconomyDoc): number {
  const stored =
    typeof raw.fantasyPoints === 'number' ? Math.max(0, raw.fantasyPoints) : DEFAULT_FANTASY_POINTS;

  if (raw.economyVersion === FANTASY_ECONOMY_SCHEMA_VERSION) {
    return stored;
  }

  // Migration : retirer uniquement le pack gratuit de départ (1250), conserver le reste.
  if (stored === LEGACY_STARTER_FP) return DEFAULT_FANTASY_POINTS;
  return stored;
}

function normalizeState(raw: UserEconomyDoc | null): FantasyEconomyState {
  if (!raw) return defaultState();
  const budget = raw.fantasyBudget ?? DEFAULT_FANTASY_BUDGET_M;
  const fantasyPoints = resolveFantasyPoints(raw);
  return {
    fantasyPoints,
    fantasyBudgetM: budget,
    prestigeName: raw.prestige ?? getPrestige(budget).name,
    loginStreak: raw.loginStreak ?? 0,
    lastLoginDate: raw.lastLoginDate ?? null,
    lastFreeUpgradeDate: raw.lastFreeUpgrade ?? null,
  };
}

export async function loadFantasyEconomy(userId: string): Promise<FantasyEconomyState> {
  if (!userId) return defaultState();

  const fs = firestoreSafe();
  if (fs) {
    try {
      const snap = await getDoc(doc(fs, `users/${userId}`));
      if (snap.exists()) {
        const doc = snap.data() as UserEconomyDoc;
        const state = normalizeState(doc);
        const needsPersist =
          doc.economyVersion !== FANTASY_ECONOMY_SCHEMA_VERSION ||
          (typeof doc.fantasyPoints === 'number' && doc.fantasyPoints !== state.fantasyPoints);
        if (needsPersist) {
          await saveFantasyEconomy(userId, state);
        } else {
          await persistEconomyLocal(userId, state);
        }
        return state;
      }
    } catch {
      /* fallback local */
    }
  }

  try {
    const raw = await AsyncStorage.getItem(economyLocalKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as FantasyEconomyState & { economyVersion?: number };
      const state = normalizeState({
        fantasyPoints: parsed.fantasyPoints,
        fantasyBudget: parsed.fantasyBudgetM,
        prestige: parsed.prestigeName,
        loginStreak: parsed.loginStreak,
        lastLoginDate: parsed.lastLoginDate,
        lastFreeUpgrade: parsed.lastFreeUpgradeDate,
        economyVersion: parsed.economyVersion,
      });
      const needsPersist =
        parsed.economyVersion !== FANTASY_ECONOMY_SCHEMA_VERSION ||
        parsed.fantasyPoints !== state.fantasyPoints;
      if (needsPersist) await saveFantasyEconomy(userId, state);
      return state;
    }
  } catch {
    /* ignore */
  }

  const initial = defaultState();
  await saveFantasyEconomy(userId, initial);
  return initial;
}

async function persistEconomyLocal(userId: string, state: FantasyEconomyState) {
  await AsyncStorage.setItem(
    economyLocalKey(userId),
    JSON.stringify({ ...state, economyVersion: FANTASY_ECONOMY_SCHEMA_VERSION })
  );
}

export async function saveFantasyEconomy(
  userId: string,
  state: FantasyEconomyState
): Promise<void> {
  if (!userId) return;

  const prestige = getPrestige(state.fantasyBudgetM);
  const next = { ...state, prestigeName: prestige.name };

  await persistEconomyLocal(userId, next);

  const fs = firestoreSafe();
  if (!fs) return;

  try {
    await setDoc(
      doc(fs, `users/${userId}`),
      sanitizeForFirestore({
        fantasyPoints: next.fantasyPoints,
        fantasyBudget: next.fantasyBudgetM,
        prestige: next.prestigeName,
        loginStreak: next.loginStreak,
        lastLoginDate: next.lastLoginDate,
        lastFreeUpgrade: next.lastFreeUpgradeDate,
        economyVersion: FANTASY_ECONOMY_SCHEMA_VERSION,
      }),
      { merge: true }
    );
  } catch {
    /* local only */
  }
}

async function hasReference(userId: string, referenceId: string): Promise<boolean> {
  const fs = firestoreSafe();
  if (fs) {
    try {
      const snap = await getDoc(doc(fs, `users/${userId}/fantasy_transactions/${referenceId}`));
      if (snap.exists()) return true;
    } catch {
      /* continue */
    }
  }
  const raw = await AsyncStorage.getItem(refKey(userId));
  const set = raw ? (JSON.parse(raw) as string[]) : [];
  return set.includes(referenceId);
}

async function markReference(userId: string, referenceId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(refKey(userId));
  const set = raw ? (JSON.parse(raw) as string[]) : [];
  if (!set.includes(referenceId)) {
    set.push(referenceId);
    if (set.length > 500) set.splice(0, set.length - 500);
    await AsyncStorage.setItem(refKey(userId), JSON.stringify(set));
  }

  const fs = firestoreSafe();
  if (!fs) return;
  try {
    await setDoc(doc(fs, `users/${userId}/fantasy_transactions/${referenceId}`), {
      referenceId,
      at: Date.now(),
    });
  } catch {
    /* ignore */
  }
}

async function appendTransaction(
  userId: string,
  tx: Omit<FantasyTransaction, 'id' | 'timestamp'>
): Promise<void> {
  const full: FantasyTransaction = {
    ...tx,
    id: `${tx.referenceId}_${Date.now()}`,
    timestamp: Date.now(),
  };

  const raw = await AsyncStorage.getItem(txLocalKey(userId));
  const list = raw ? (JSON.parse(raw) as FantasyTransaction[]) : [];
  list.unshift(full);
  await AsyncStorage.setItem(txLocalKey(userId), JSON.stringify(list.slice(0, 100)));

  const fs = firestoreSafe();
  if (!fs) return;
  try {
    await setDoc(
      doc(fs, `users/${userId}/fantasy_transactions/${full.id}`),
      sanitizeForFirestore(full)
    );
  } catch {
    /* ignore */
  }
}

export async function fetchRecentTransactions(
  userId: string,
  max = 20
): Promise<FantasyTransaction[]> {
  const fs = firestoreSafe();
  if (fs) {
    try {
      const snap = await getDocs(
        query(
          collection(fs, `users/${userId}/fantasy_transactions`),
          orderBy('timestamp', 'desc'),
          limit(max)
        )
      );
      const cloud = snap.docs
        .map((d) => d.data() as FantasyTransaction)
        .filter((t) => t.amount !== undefined);
      if (cloud.length > 0) return cloud;
    } catch {
      /* local */
    }
  }
  const raw = await AsyncStorage.getItem(txLocalKey(userId));
  return raw ? (JSON.parse(raw) as FantasyTransaction[]).slice(0, max) : [];
}

export type EconomyMutationResult =
  | { ok: true; state: FantasyEconomyState }
  | { ok: false; error: string };

async function mutate(
  userId: string,
  mutator: (state: FantasyEconomyState) => FantasyEconomyState | null,
  tx: Omit<FantasyTransaction, 'id' | 'timestamp'> | null,
  referenceId: string
): Promise<EconomyMutationResult> {
  return runEconomyWrite(userId, async () => {
    if (await hasReference(userId, referenceId)) {
      return { ok: false, error: 'Transaction déjà effectuée' };
    }

    const current = await loadFantasyEconomy(userId);
    const next = mutator(current);
    if (!next) return { ok: false, error: 'Opération impossible' };

    await saveFantasyEconomy(userId, next);
    await markReference(userId, referenceId);
    if (tx) await appendTransaction(userId, tx);

    emitFantasyEconomyChanged();
    return { ok: true, state: next };
  });
}

export async function earnFantasyPoints(
  userId: string,
  amount: number,
  source: FpRewardKey | string,
  referenceId: string,
  description: string
): Promise<EconomyMutationResult> {
  if (amount <= 0) return { ok: false, error: 'Montant invalide' };
  return mutate(
    userId,
    (s) => ({
      ...s,
      fantasyPoints: s.fantasyPoints + amount,
    }),
    {
      type: 'earn',
      amount,
      description,
      source,
      referenceId,
    },
    referenceId
  );
}

export async function spendFantasyPoints(
  userId: string,
  amount: number,
  source: string,
  referenceId: string,
  description: string
): Promise<EconomyMutationResult> {
  if (amount <= 0) return { ok: false, error: 'Montant invalide' };
  return mutate(
    userId,
    (s) => {
      if (s.fantasyPoints < amount) return null;
      return { ...s, fantasyPoints: s.fantasyPoints - amount };
    },
    {
      type: 'spend',
      amount: -amount,
      description,
      source,
      referenceId,
    },
    referenceId
  );
}

/** @deprecated Utiliser l’API serveur `/stripe/convert-fp-to-budget` — ne pas muter côté client. */
export async function convertFpToBudget(
  userId: string,
  fpCost: number,
  budgetGainM: number,
  referenceId: string
): Promise<EconomyMutationResult> {
  const result = await mutate(
    userId,
    (s) => {
      if (s.fantasyPoints < fpCost) return null;
      const newBudget = s.fantasyBudgetM + budgetGainM;
      return {
        ...s,
        fantasyPoints: s.fantasyPoints - fpCost,
        fantasyBudgetM: newBudget,
        prestigeName: getPrestige(newBudget).name,
      };
    },
    {
      type: 'spend',
      amount: -fpCost,
      description: `+${budgetGainM}M€ budget`,
      source: 'budget_conversion',
      referenceId,
    },
    referenceId
  );
  if (result.ok) await notificationService.sendBudgetIncreasedNotif(budgetGainM);
  return result;
}

export async function claimFreeDailyUpgrade(userId: string): Promise<EconomyMutationResult> {
  const today = todayDateKey();
  const result = await mutate(
    userId,
    (s) => {
      if (s.lastFreeUpgradeDate === today) return null;
      const newBudget = s.fantasyBudgetM + 1;
      return {
        ...s,
        fantasyBudgetM: newBudget,
        prestigeName: getPrestige(newBudget).name,
        lastFreeUpgradeDate: today,
      };
    },
    {
      type: 'earn',
      amount: 0,
      description: '+1M€ amélioration gratuite',
      source: 'free_daily_upgrade',
      referenceId: `free_upgrade_${today}`,
    },
    `free_upgrade_${today}`
  );
  if (result.ok) await notificationService.sendBudgetIncreasedNotif(1);
  return result;
}

/** Réservé au serveur Stripe — ne pas créditer les FP côté client. */
export function rewardAmountFor(key: FpRewardKey): number {
  return FP_REWARDS[key];
}

export async function recordDailyLogin(userId: string, dateKey: string): Promise<FantasyEconomyState | null> {
  return runEconomyWrite(userId, async () => {
    const state = await loadFantasyEconomy(userId);
    if (state.lastLoginDate === dateKey) return null;

    let streak = state.loginStreak;
    const yesterday = new Date(dateKey);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    if (state.lastLoginDate === yesterdayKey) streak += 1;
    else streak = 1;

    const next = {
      ...state,
      loginStreak: streak,
      lastLoginDate: dateKey,
    };
    await saveFantasyEconomy(userId, next);
    emitFantasyEconomyChanged();
    return next;
  });
}
