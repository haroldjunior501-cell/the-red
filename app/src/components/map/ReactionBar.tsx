import React, { memo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

const L = {
  fire: require('../../../assets/animations/fire.json'),
  celebration: require('../../../assets/animations/celebration.json'),
  goal: require('../../../assets/animations/goal.json'),
  lion: require('../../../assets/animations/lion.json'),
  trophy: require('../../../assets/animations/trophy.json'),
} as const;

const BTNS: { id: string; label: string; cost: number; color: string; lottie?: keyof typeof L }[] = [
  { id: 'fire', label: 'Feu', cost: 0, color: '#2979ff', lottie: 'fire' },
  { id: 'heart', label: 'Cœur', cost: 0, color: '#FF6584', lottie: 'celebration' },
  { id: 'lion', label: 'Lion', cost: 50, color: '#bfa968', lottie: 'lion' },
  { id: 'bomb', label: 'Bombe', cost: 300, color: '#FF3B30' },
  { id: 'star', label: 'Étoile', cost: 1000, color: '#FFD700', lottie: 'goal' },
  { id: 'cup', label: 'Coupe', cost: 500, color: '#2979ff', lottie: 'trophy' },
];

export type ReactionBarProps = {
  userKdo: number;
  onReact: (id: string, cost: number) => void;
};

const Btn = memo(function Btn({
  b,
  userKdo,
  onReact,
}: {
  b: (typeof BTNS)[number];
  userKdo: number;
  onReact: (id: string, cost: number) => void;
}) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const press = useCallback(() => {
    if (b.cost > 0 && userKdo < b.cost) return;
    s.value = withSequence(withTiming(0.85, { duration: 80 }), withTiming(1.12, { duration: 120 }), withTiming(1, { duration: 100 }));
    onReact(b.id, b.cost);
  }, [b.cost, b.id, onReact, s, userKdo]);

  return (
    <TouchableOpacity onPress={press} activeOpacity={0.9}>
      <Animated.View style={[styles.btn, { borderColor: b.color, backgroundColor: `${b.color}18` }, style]}>
        {b.lottie ? (
          <LottieView source={L[b.lottie] as never} autoPlay loop style={{ width: 32, height: 32 }} />
        ) : (
          <Text style={{ fontSize: 22 }}>💣</Text>
        )}
        <Text style={styles.price}>{b.cost === 0 ? 'Gratuit' : `${b.cost} KDO`}</Text>
        <Text style={styles.lbl}>{b.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

export const ReactionBar = memo(function ReactionBar({ userKdo, onReact }: ReactionBarProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>ENVOYER UNE RÉACTION · VISIBLE SUR LA MAP</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
        {BTNS.map((b) => (
          <Btn key={b.id} b={b} userKdo={userKdo} onReact={onReact} />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingVertical: 4 },
  title: { fontSize: 9, color: '#888', letterSpacing: 1.5, textAlign: 'center', marginBottom: 10, fontWeight: '700' },
  btn: {
    width: 72,
    minHeight: 88,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  price: { marginTop: 4, fontSize: 9, color: '#8896ab', fontWeight: '600' },
  lbl: { marginTop: 2, fontSize: 8, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
});
