import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COUNTRIES } from '../../constants/countries';
import { globeViewForCountry, nationColor } from '../../constants/hubGlobe';
import { useGoalEffect } from '../../hooks/useGoalEffect';
import { useHubGoalRtdb } from '../../hooks/useHubGoalRtdb';
import { useHubScoreGoals } from '../../hooks/useHubScoreGoals';
import { useHubScreenCore } from '../../hooks/useHubScreenCore';
import type { HubGoalNotifData } from '../../types/hubGoal';
import { FloatingMessages } from './components/FloatingMessages';
import { GoalFlash } from './components/GoalFlash';
import { GoalNotification } from './components/GoalNotification';
import { GoalParticles } from './components/GoalParticles';
import { GoalShockwave } from './components/GoalShockwave';
import { GlobeTabs, type HubGlobeTab } from './components/GlobeTabs';
import { HubGlobeView, type HubGlobeHandle } from './components/HubGlobeView';
import { HubReactionBar } from './components/HubReactionBar';
import { NationCombatBar } from './components/NationCombatBar';
import { ScoreLiveBar } from './components/ScoreLiveBar';
import { NationArrivalToast } from './components/NationArrivalToast';
import { SimulationPanel } from './components/SimulationPanel';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { hubScreenStyles as s } from './hubScreen.styles';

export default function HubScreen() {
  const mapRef = useRef<HubGlobeHandle>(null);
  const [tab, setTab] = useState<HubGlobeTab>('monde');

  const core = useHubScreenCore(mapRef, tab);
  const { goalData, flashVisible, effectsVisible, triggerGoal } = useGoalEffect(core.postToMap);
  const handleGoal = useCallback(
    (payload: Parameters<typeof triggerGoal>[0]) => {
      triggerGoal({
        ...payload,
        homeScore: payload.homeScore || core.homeScore,
        awayScore: payload.awayScore || core.awayScore,
      });
    },
    [core.awayScore, core.homeScore, triggerGoal]
  );

  useHubScoreGoals(core.live, Boolean(core.live?.isLive), handleGoal);
  useHubGoalRtdb(!core.simulationEnabled, handleGoal);

  const [nationToastVisible, setNationToastVisible] = useState(false);

  const nationLabel = useMemo(() => {
    const view = globeViewForCountry(core.chatUser.country);
    if (view?.name) return view.name;
    return COUNTRIES.find((c) => c.code === core.chatUser.country)?.name ?? core.chatUser.country;
  }, [core.chatUser.country]);

  useEffect(() => {
    if (tab !== 'nation') {
      setNationToastVisible(false);
      return;
    }
    setNationToastVisible(true);
    const hide = setTimeout(() => setNationToastVisible(false), 3200);
    return () => clearTimeout(hide);
  }, [tab, core.chatUser.country]);

  const onNationFlyComplete = useCallback(() => {
    setNationToastVisible(true);
    setTimeout(() => setNationToastVisible(false), 3200);
  }, []);

  const goalColor = goalData?.teamColor ?? nationColor(core.homeCode);

  const triggerDemoGoal = useCallback(() => {
    const minute = String(core.live?.minute ?? 82);
    const payload: HubGoalNotifData = {
      playerName: 'MBAPPÉ',
      teamName: core.live?.home.name ?? 'France',
      teamColor: nationColor(core.homeCode),
      minute,
      country: core.homeCode,
      homeScore: (core.homeScore ?? 0) + 1,
      awayScore: core.awayScore ?? 0,
    };
    triggerGoal(payload);
  }, [core.awayScore, core.homeCode, core.homeScore, core.live?.home.name, core.live?.minute, triggerGoal]);

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <ScreenAmbience centerGlow style={styles.inner}>
        <ScoreLiveBar
          status={core.status}
          live={core.live}
          upcoming={core.upcoming}
          errorMessage={core.errorMessage}
          isSimActive={core.isSimActive}
          connectedUsers={core.connectedUsers}
        />

        <View style={s.globeZone} pointerEvents="box-none">
          <HubGlobeView
            tab={tab}
            userCountry={core.chatUser.country}
            supporters={core.supporters}
            heatFeatures={core.heatFeatures}
            mapRef={mapRef}
            onNationFlyComplete={onNationFlyComplete}
          />
          <NationArrivalToast
            visible={tab === 'nation' && nationToastVisible}
            countryCode={core.chatUser.country}
            countryName={nationLabel}
            supportersCount={core.supporters.length}
          />
          <FloatingMessages messages={core.floatingMessages} onComplete={core.removeMessage} />
          <GlobeTabs tab={tab} userCountry={core.chatUser.country} onChange={setTab} />
          <NationCombatBar
            homeCode={core.homeCode}
            awayCode={core.awayCode}
            homePct={core.strength.home}
            awayPct={core.strength.away}
          />

          <GoalFlash visible={flashVisible} />
          <GoalShockwave color={goalColor} visible={effectsVisible} />
          <GoalParticles color={goalColor} visible={effectsVisible} />
          <GoalNotification
            playerName={goalData?.playerName ?? ''}
            teamName={goalData?.teamName ?? ''}
            teamColor={goalData?.teamColor ?? '#2979ff'}
            minute={goalData?.minute ?? ''}
            homeScore={goalData?.homeScore ?? core.homeScore}
            awayScore={goalData?.awayScore ?? core.awayScore}
            visible={goalData != null}
          />

          {typeof __DEV__ !== 'undefined' && __DEV__ && core.simulationEnabled ? (
            <View style={styles.simBadge} pointerEvents="none">
              <View style={styles.simDot} />
              <Text style={styles.simText}>
                {core.isSimActive ? `${(core.connectedUsers ?? 0) / 1000}K LIVE` : '500K SIM'}
              </Text>
            </View>
          ) : null}

          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <SimulationPanel
              config={core.crowdSimulation.config}
              stats={core.crowdSimulation.stats}
              isActive={core.crowdSimulation.isActive}
              onToggle={core.crowdSimulation.setIsActive}
              onSpeedChange={(speed) => core.crowdSimulation.setConfig((current) => ({ ...current, speed }))}
              onTriggerGoal={triggerDemoGoal}
              onTriggerRedCard={() => core.crowdSimulation.triggerSimEvent('red_card')}
              onTriggerChaos={() => core.crowdSimulation.triggerSimEvent('chaos')}
              onClean={() => {
                void core.crowdSimulation.cleanSimData();
              }}
            />
          ) : null}
        </View>

        <HubReactionBar onSend={core.onSend} disabled={false} nationOnly={tab === 'nation'} />
      </ScreenAmbience>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1 },
  simBadge: {
    position: 'absolute',
    top: 54,
    right: 12,
    zIndex: 30,
    backgroundColor: 'rgba(41, 121, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.16)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  simDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5b9aff' },
  simText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#9eb8d9', letterSpacing: 0.6 },
});
