import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  FANTASY_MISSIONS,
  getMilestoneRewards,
  WEEKLY_MISSIONS,
  type MissionDefinition,
} from '../constants/fantasyMissions';
import { FP_REWARDS } from '../constants/fantasyEconomy';
import type { UserMissionStats } from '../types/fantasyEconomy.types';
import { todayDateKey, weekDateKey } from '../utils/fantasyEconomyMath';
import { earnFantasyPoints } from './fantasyEconomyService';
import { getFirestoreDb } from './firebase';
import { sanitizeForFirestore } from './fantasyService';
import { notificationService } from './notificationService';

const MISSION_DAY_PREFIX = '@goalya/missions_completed:';

type DailyMissionsDoc = {
  date: string;
  completed: string[];
};

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

async function loadCompletedToday(userId: string, dateKey: string): Promise<string[]> {
  const fs = firestoreSafe();
  if (fs) {
    try {
      const snap = await getDoc(doc(fs, `users/${userId}/missions/daily`));
      if (snap.exists()) {
        const data = snap.data() as DailyMissionsDoc;
        if (data.date === dateKey) return data.completed ?? [];
      }
    } catch {
      /* local */
    }
  }
  try {
    const raw = await AsyncStorage.getItem(`${MISSION_DAY_PREFIX}${userId}:${dateKey}`);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

async function saveCompletedToday(
  userId: string,
  dateKey: string,
  completed: string[]
): Promise<void> {
  const body: DailyMissionsDoc = { date: dateKey, completed };
  await AsyncStorage.setItem(
    `${MISSION_DAY_PREFIX}${userId}:${dateKey}`,
    JSON.stringify(completed)
  );
  const fs = firestoreSafe();
  if (!fs) return;
  try {
    await setDoc(doc(fs, `users/${userId}/missions/daily`), sanitizeForFirestore(body));
  } catch {
    /* local */
  }
}

async function grantReward(
  userId: string,
  amount: number,
  rewardKey: string,
  referenceId: string,
  label: string
): Promise<boolean> {
  const result = await earnFantasyPoints(userId, amount, rewardKey, referenceId, label);
  if (!result.ok) return false;
  await notificationService.sendMissionCompletedNotif(label, amount);
  return true;
}

async function completeDailyMission(
  userId: string,
  mission: MissionDefinition,
  dateKey: string,
  completed: string[]
): Promise<string[]> {
  const ref = `mission_${mission.id}_${dateKey}`;
  const ok = await grantReward(userId, mission.reward, mission.rewardKey, ref, mission.label);
  if (!ok) return completed;
  return [...completed, mission.id];
}

async function completeWeeklyMission(
  userId: string,
  mission: MissionDefinition,
  weekKey: string
): Promise<void> {
  const ref = `weekly_${mission.id}_${weekKey}`;
  await grantReward(userId, mission.reward, mission.rewardKey, ref, mission.label);
}

async function processReferralRewards(userId: string, referralIds: string[]): Promise<void> {
  for (const invitedId of referralIds) {
    const ref = `invite_friend_${invitedId}`;
    await grantReward(
      userId,
      FP_REWARDS.invite_friend,
      'invite_friend',
      ref,
      'Parrainage — nouvel ami inscrit'
    );
  }
}

export async function checkAndCompleteMissions(
  userId: string,
  stats: UserMissionStats
): Promise<void> {
  if (!userId) return;

  await notificationService.requestPermissions();

  const dateKey = todayDateKey();
  const weekKey = weekDateKey();
  let completed = await loadCompletedToday(userId, dateKey);

  for (const mission of FANTASY_MISSIONS) {
    if (completed.includes(mission.id)) continue;
    if (!mission.checkFn(stats)) continue;
    completed = await completeDailyMission(userId, mission, dateKey, completed);
  }
  await saveCompletedToday(userId, dateKey, completed);

  for (const mission of WEEKLY_MISSIONS) {
    if (!mission.checkFn(stats)) continue;
    await completeWeeklyMission(userId, mission, weekKey);
  }

  for (const milestone of getMilestoneRewards(stats)) {
    await grantReward(
      userId,
      milestone.reward,
      milestone.rewardKey,
      milestone.referenceId,
      milestone.label
    );
  }

  await processReferralRewards(userId, stats.pendingReferralIds);
}
