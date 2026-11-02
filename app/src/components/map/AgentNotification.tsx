import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { AgentAction } from '../../services/aiAgentService';

export type AgentNotificationProps = {
  action: AgentAction;
  onApprove: (action: AgentAction) => void;
  onReject: (action: AgentAction) => void;
};

export const AgentNotification = memo(function AgentNotification({ action, onApprove, onReject }: AgentNotificationProps) {
  const y = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
  }, [y]);

  const time = new Date(action.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY: y }] }]}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.agent}>AGENT IA GOALYA</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.body}>{action.message}</Text>
      <View style={styles.row}>
        <Pressable style={styles.flex} onPress={() => onApprove(action)}>
          <LinearGradient colors={['#2979ff', '#3d5f82']} style={styles.approve}>
            <Text style={styles.approveText}>OUI · {action.action ?? 'Publier'}</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={[styles.flex, styles.reject]} onPress={() => onReject(action)}>
          <Text style={styles.rejectText}>Pas maintenant</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 50,
    backgroundColor: 'rgba(5,8,16,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.35)',
    borderRadius: 18,
    padding: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2979ff' },
  agent: { flex: 1, fontFamily: 'BebasNeue_400Regular', fontSize: 13, letterSpacing: 2, color: '#2979ff' },
  time: { fontSize: 10, color: '#6B7280' },
  title: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  body: { fontSize: 11, color: '#6B7280', lineHeight: 16, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  approve: { borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  approveText: { fontWeight: '800', color: '#FFFFFF' },
  reject: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rejectText: { fontWeight: '700', color: '#6B7280' },
});
