import React, { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { PremiumMatchEventType } from '../../../../types/liveMatchEvent';

type IconProps = { size?: number; glow?: string };

export const FootballBallIcon = memo(function FootballBallIcon({ size = 28, glow = '#2979FF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id="ballGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#f8fafc" />
          <Stop offset="100%" stopColor="#cbd5e1" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="14" fill="url(#ballGrad)" stroke={glow} strokeWidth={1.5} opacity={0.95} />
      <Path
        d="M16 6 L20 12 L16 14 L12 12 Z M16 26 L12 20 L16 18 L20 20 Z M6 16 L12 12 L14 16 L12 20 Z M26 16 L20 20 L18 16 L20 12 Z"
        fill="rgba(15,23,42,0.35)"
      />
      <Circle cx="16" cy="16" r="14" fill="none" stroke={glow} strokeWidth={0.8} opacity={0.4} />
    </Svg>
  );
});

export const YellowCardIcon = memo(function YellowCardIcon({ size = 28 }: IconProps) {
  const w = size * 0.55;
  const h = size * 0.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 28 36">
      <Defs>
        <LinearGradient id="ycGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFE566" />
          <Stop offset="100%" stopColor="#F0B429" />
        </LinearGradient>
      </Defs>
      <Rect x="6" y="4" width={w} height={h} rx="3" fill="url(#ycGrad)" />
      <Rect x="7" y="5" width={w * 0.35} height={h * 0.5} rx="1" fill="rgba(255,255,255,0.25)" />
      <Rect x="6" y="4" width={w} height={h} rx="3" fill="none" stroke="rgba(240,180,41,0.5)" strokeWidth={1} />
    </Svg>
  );
});

export const RedCardIcon = memo(function RedCardIcon({ size = 28 }: IconProps) {
  const w = size * 0.55;
  const h = size * 0.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 28 36">
      <Defs>
        <LinearGradient id="rcGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FF6B5B" />
          <Stop offset="100%" stopColor="#E5382B" />
        </LinearGradient>
      </Defs>
      <Rect x="6" y="4" width={w} height={h} rx="3" fill="url(#rcGrad)" />
      <Rect x="6" y="4" width={w} height={h} rx="3" fill="none" stroke="rgba(229,56,43,0.8)" strokeWidth={1.2} />
    </Svg>
  );
});

export const SubstitutionIcon = memo(function SubstitutionIcon({ size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <G>
        <Path d="M8 20 L14 14 L14 18 L22 18 L22 22 L14 22 L14 26 Z" fill="#43D17A" opacity={0.95} />
        <Path d="M24 12 L18 18 L18 14 L10 14 L10 10 L18 10 L18 6 Z" fill="rgba(255,255,255,0.35)" />
      </G>
      <Circle cx="16" cy="16" r="14" fill="none" stroke="rgba(67,209,122,0.35)" strokeWidth={1} />
    </Svg>
  );
});

export function EventTypePremiumIcon({
  type,
  glow,
  size = 28,
}: {
  type: PremiumMatchEventType;
  glow: string;
  size?: number;
}) {
  switch (type) {
    case 'goal':
      return <FootballBallIcon size={size} glow={glow} />;
    case 'yellow_card':
      return <YellowCardIcon size={size} />;
    case 'red_card':
      return <RedCardIcon size={size} />;
    case 'substitution':
      return <SubstitutionIcon size={size} />;
    default:
      return <FootballBallIcon size={size} glow={glow} />;
  }
}
