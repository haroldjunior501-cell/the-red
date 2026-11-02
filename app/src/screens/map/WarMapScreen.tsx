import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AgentNotification } from '../../components/map/AgentNotification';
import { CockpitBar } from '../../components/map/CockpitBar';
import { GlobeView, type GlobeViewHandle } from '../../components/map/GlobeView';
import { NationBattleBar } from '../../components/map/NationBattleBar';
import { ReactionBar } from '../../components/map/ReactionBar';
import { TopSupporters } from '../../components/map/TopSupporters';
import { flagEmoji } from '../../constants/mapHub';
import { useAiAgent } from '../../hooks/useAiAgent';
import { useMapData } from '../../hooks/useMapData';
import { useMatchStore } from '../../store/useMatchStore';
import { useUserStore } from '../../store/useUserStore';
import ArmyChatScreen from './ArmyChatScreen';
import { warMapScreenStyles as s } from './warMapScreen.styles';

type MindTab = 'monde' | 'nation' | 'chat';

const REACTION_EMOJI: Record<string, string> = {
  fire: '🔥',
  heart: '❤️',
  lion: '🦁',
  bomb: '💣',
  star: '⭐',
  cup: '🏆',
};

export default function WarMapScreen() {
  const [mindTab, setMindTab] = useState<MindTab>('monde');
  const globeRef = useRef<GlobeViewHandle | null>(null);

  const cockpit = useMatchStore((st) => st.cockpit);
  const userId = useUserStore((st) => st.userId);
  const userCountry = useUserStore((st) => st.countryCode) || 'FR';
  const userKdo = useUserStore((st) => st.kdo) || 0;

  const { nationsPower, topSupporters, sendReaction, bumpNation, supportersOnline } = useMapData();
  const { agentNotification, approveAction, rejectAction } = useAiAgent(cockpit.matchId);

  const supportersK = useMemo(() => Math.max(1, Math.round(supportersOnline.length / 1000)), [supportersOnline.length]);

  const onGlobeReady = useCallback((handle: GlobeViewHandle) => {
    globeRef.current = handle;
  }, []);

  useEffect(() => {
    const liveStadiums = [
      { id: 'metlife', status: 'live', matchData: { home: cockpit.homeName, away: cockpit.awayName } },
      { id: 'sofi', status: 'upcoming' },
      { id: 'hardrock', status: 'upcoming' },
      { id: 'att', status: 'upcoming' },
      { id: 'levis', status: 'upcoming' },
      { id: 'seattle', status: 'upcoming' },
      { id: 'azteca', status: 'upcoming' },
      { id: 'bmc', status: 'upcoming' },
    ];
    globeRef.current?.injectJavaScript(
      `try{window.__goalyaUpdateStadiums&&window.__goalyaUpdateStadiums(${JSON.stringify(liveStadiums)});}catch(_){};true;`
    );
  }, [cockpit.homeName, cockpit.awayName]);

  const onReact = useCallback(
    async (type: string, cost: number) => {
      if (!userId) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await sendReaction(type, userId, userCountry, { title: type, cost });
      if (cost > 0) await bumpNation(userCountry, 3);
      const emoji = REACTION_EMOJI[type] ?? '🔥';
      globeRef.current?.injectJavaScript(
        `try{window.__goalyaSpawnReaction&&window.__goalyaSpawnReaction(${JSON.stringify({ countryCode: userCountry, emoji })});}catch(_){};true;`
      );
    },
    [sendReaction, bumpNation, userCountry, userId]
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>🌍 MIND · GLOBE</Text>
              <Text style={s.subtitle}>
                Agent IA actif · {supportersK}k connectés
              </Text>
            </View>
            <View style={s.badges}>
              {cockpit.isLive ? (
                <View style={s.liveBadge}>
                  <Text style={s.liveText}>LIVE</Text>
                </View>
              ) : null}
              <View style={s.kdoBadge}>
                <Text style={s.kdoText}>{userKdo.toLocaleString('fr-FR')} KDO</Text>
              </View>
            </View>
          </View>
          <View style={s.tabs}>
            {(['monde', 'nation', 'chat'] as const).map((tab) => (
              <Pressable key={tab} onPress={() => setMindTab(tab)} style={[s.tab, mindTab === tab && s.tabActive]}>
                <Text style={[s.tabText, mindTab === tab && s.tabTextActive]}>
                  {tab === 'monde' ? 'MONDE' : tab === 'nation' ? `${flagEmoji(userCountry)} MA NATION` : 'CHAT'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.globeHost}>
          <GlobeView
            height={480}
            mindTab={mindTab}
            userId={userId || 'anon'}
            userCountry={userCountry}
            onReady={onGlobeReady}
          />
          {agentNotification ? (
            <AgentNotification action={agentNotification} onApprove={approveAction} onReject={rejectAction} />
          ) : null}
        </View>

        {mindTab === 'chat' ? (
          <View style={s.chatHost}>
            <ArmyChatScreen />
          </View>
        ) : (
          <>
            <CockpitBar cockpit={cockpit} />
            <View style={s.section}>
              <NationBattleBar nationsPower={nationsPower} userCountry={userCountry} />
            </View>
            <View style={s.section}>
              <ReactionBar userKdo={userKdo} onReact={onReact} />
            </View>
            <View style={s.section}>
              <TopSupporters supporters={topSupporters} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
