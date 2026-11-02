import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ANDROID_CHANNEL = 'goalya-hub';
const FANTASY_CHANNEL = 'goalya-fantasy';

async function ensureFantasyChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(FANTASY_CHANNEL, {
    name: 'GOALYA Fantasy',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 100, 60, 100],
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: 'GOALYA Hub',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 120, 80, 120],
  });
}

function getGoalNotifContent(
  playerName: string,
  homeTeam: string,
  homeScore: number,
  awayTeam: string,
  awayScore: number,
  minute: string
): Notifications.NotificationContentInput {
  return {
    title: `⚽ ${playerName.toUpperCase()} SHAKES THE WORLD`,
    body: `${homeTeam} ${homeScore}–${awayScore} ${awayTeam} · ${minute}'`,
    sound: true,
  };
}

function getRedCardNotifContent(team: string, playerName: string, minute: string): Notifications.NotificationContentInput {
  return {
    title: `🟥 CHAOS — ${team.toUpperCase()}`,
    body: `${playerName} expulsé à la ${minute}'`,
    sound: true,
  };
}

function getPenaltyNotifContent(team: string): Notifications.NotificationContentInput {
  return {
    title: `⚠️ PENALTY POUR ${team.toUpperCase()}`,
    body: 'Le monde retient son souffle…',
    sound: true,
  };
}

function getChaosNotifContent(
  homeTeam: string,
  homeScore: number,
  awayTeam: string,
  awayScore: number
): Notifications.NotificationContentInput {
  return {
    title: `🔥 CHAOS — ${homeTeam} ${homeScore}–${awayScore} ${awayTeam}`,
    body: '90e minute — tout peut arriver',
    sound: true,
  };
}

function getMatchStartNotifContent(homeTeam: string, awayTeam: string): Notifications.NotificationContentInput {
  return {
    title: `🌍 C'EST PARTI — ${homeTeam} vs ${awayTeam}`,
    body: 'Le monde se connecte. Rejoins la planète.',
    sound: true,
  };
}

async function schedule(
  content: Notifications.NotificationContentInput,
  channel: 'hub' | 'fantasy' = 'hub'
): Promise<void> {
  try {
    if (channel === 'fantasy') await ensureFantasyChannel();
    else await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        sound: 'default',
        ...(Platform.OS === 'android'
          ? { channelId: channel === 'fantasy' ? FANTASY_CHANNEL : ANDROID_CHANNEL }
          : {}),
        data: content.data,
      },
      trigger: null,
    });
  } catch (e) {
    console.warn('Notification schedule error:', e);
  }
}

let permissionsRequested = false;

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    if (permissionsRequested) {
      const existing = await Notifications.getPermissionsAsync();
      return existing.status === 'granted';
    }
    permissionsRequested = true;
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  },

  sendGoalNotif: (
    playerName: string,
    homeTeam: string,
    homeScore: number,
    awayTeam: string,
    awayScore: number,
    minute: string
  ) => schedule(getGoalNotifContent(playerName, homeTeam, homeScore, awayTeam, awayScore, minute)),

  sendRedCardNotif: (team: string, playerName: string, minute: string) =>
    schedule(getRedCardNotifContent(team, playerName, minute)),

  sendPenaltyNotif: (team: string) => schedule(getPenaltyNotifContent(team)),

  sendChaosNotif: (homeTeam: string, homeScore: number, awayTeam: string, awayScore: number) =>
    schedule(getChaosNotifContent(homeTeam, homeScore, awayTeam, awayScore)),

  sendMatchStartNotif: (homeTeam: string, awayTeam: string) =>
    schedule(getMatchStartNotifContent(homeTeam, awayTeam)),

  sendMissionCompletedNotif: (missionLabel: string, reward: number) =>
    schedule(
      {
        title: '✅ Mission accomplie !',
        body: `${missionLabel} · +${reward} FP crédités`,
        data: {
          screen: 'Fantasy',
          action: 'mission_completed',
          reward,
        },
      },
      'fantasy'
    ),

  sendBudgetIncreasedNotif: (gainM: number) =>
    schedule(
      {
        title: '💎 Budget augmenté !',
        body: `+${gainM}M€ ajoutés à ton budget Fantasy`,
        data: { screen: 'Fantasy', action: 'budget_increased' },
      },
      'fantasy'
    ),

  sendConversionSuccessNotif: (budgetGainM: number, totalBudgetM: number) =>
    schedule(
      {
        title: '💎 Conversion réussie !',
        body: `+${budgetGainM}M€ ajoutés · Budget : ${totalBudgetM}M€`,
        data: { screen: 'Fantasy', action: 'fp_converted' },
      },
      'fantasy'
    ),

  sendQuickBoostNotif: (gainM: number) =>
    schedule(
      {
        title: '⚡ Boost activé !',
        body: `+${gainM}M€ instantanément · Achète ta star maintenant !`,
        data: { screen: 'Fantasy', action: 'quick_boost' },
      },
      'fantasy'
    ),

  sendFpPackPurchasedNotif: (totalFp: number, packName: string) =>
    schedule(
      {
        title: `💎 ${totalFp.toLocaleString('fr-FR')} FP crédités !`,
        body: `Pack ${packName} activé · Bonne chance manager !`,
        data: { screen: 'Fantasy', action: 'fp_purchased' },
      },
      'fantasy'
    ),
};
