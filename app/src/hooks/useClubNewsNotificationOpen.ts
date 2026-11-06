import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStack';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

/** Ouvre l’article quand l’utilisateur tape une notif d’actu United. */
export function useClubNewsNotificationOpen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const openFromData = (data: Record<string, unknown> | undefined) => {
      if (!data || data.action !== 'club_news') return;
      const articleId = data.articleId != null ? String(data.articleId) : '';
      if (!articleId) {
        navigation.navigate('ClubNews');
        return;
      }
      navigation.navigate('ClubNewsArticle', { articleId });
    };

    void Notifications.getLastNotificationResponseAsync().then((resp) => {
      openFromData(resp?.notification.request.content.data as Record<string, unknown> | undefined);
    });

    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      openFromData(resp.notification.request.content.data as Record<string, unknown> | undefined);
    });
    return () => sub.remove();
  }, [navigation]);
}
