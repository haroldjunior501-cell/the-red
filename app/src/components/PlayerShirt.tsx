import React, { Component, memo, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Rect, SvgXml, Text as SvgText } from 'react-native-svg';
import { getNationalKitStyle } from '../constants/nationalKitStyles';
import { NATION_SHIRTS, shirtCode } from '../constants/shirts';
import { getNationalKitSvg } from '../utils/getNationalKitSvg';

export type PlayerShirtProps = {
  countryCode: string;
  number: number;
  size?: number;
  isGoalkeeper?: boolean;
  isCaptain?: boolean;
  style?: StyleProp<ViewStyle>;
};

const LIGHT_PRIMARIES = new Set(['#FFFFFF', '#F1BF00', '#FDEF42', '#FCD116', '#FFDF00']);

function uniquifySvgIds(svg: string, prefix: string): string {
  return svg
    .replace(/\bid="(Svgjs[^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\("#(Svgjs[^"]+)"\)/g, `url("#${prefix}$1")`);
}

function SimplePlayerShirt({
  countryCode,
  number,
  size = 48,
  isGoalkeeper = false,
  isCaptain = false,
  style,
}: PlayerShirtProps) {
  const key = shirtCode(countryCode, isGoalkeeper);
  const colors = NATION_SHIRTS[key] ?? { primary: '#1c2a42', secondary: '#ffffff' };
  const textColor = LIGHT_PRIMARIES.has(colors.primary) ? '#000000' : '#FFFFFF';

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <ClipPath id="shirtClip">
            <Path d="M9 13 L5 19 L13 21 L13 42 L35 42 L35 21 L43 19 L39 13 L31 9 C30 16 18 16 17 9 Z" />
          </ClipPath>
        </Defs>
        <Path
          d="M9 13 L5 19 L13 21 L13 42 L35 42 L35 21 L43 19 L39 13 L31 9 C30 16 18 16 17 9 Z"
          fill={colors.primary}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={0.5}
        />
        {colors.stripe ? (
          <G clipPath="url(#shirtClip)">
            <Rect x={18} y={0} width={12} height={48} fill="#FFFFFF" opacity={0.9} />
          </G>
        ) : null}
        <Path d="M9 13 L5 19 L13 21 L13 16 Z" fill={colors.secondary} opacity={0.85} />
        <Path d="M39 13 L43 19 L35 21 L35 16 Z" fill={colors.secondary} opacity={0.85} />
        <Path d="M17 9 C18 13 30 13 31 9 C29 7 19 7 17 9 Z" fill={colors.secondary} opacity={0.9} />
        <SvgText x={24} y={30} textAnchor="middle" fontSize={11} fontWeight="800" fill={textColor}>
          {number}
        </SvgText>
      </Svg>
      {isCaptain ? (
        <View style={styles.captain}>
          <Text style={styles.captainTxt}>C</Text>
        </View>
      ) : null}
    </View>
  );
}

type KitShirtProps = PlayerShirtProps & { idPrefix: string };

const KitPlayerShirt = memo(function KitPlayerShirt({
  countryCode,
  number,
  size = 48,
  isGoalkeeper = false,
  isCaptain = false,
  style,
  idPrefix,
}: KitShirtProps) {
  const kit = getNationalKitStyle(countryCode, isGoalkeeper);
  const svg = useMemo(
    () => uniquifySvgIds(getNationalKitSvg(countryCode, isGoalkeeper), idPrefix),
    [countryCode, isGoalkeeper, idPrefix]
  );
  const numberColor = kit.textColor ?? '#FFFFFF';
  const fontSize = size < 40 ? 10 : size < 56 ? 12 : 14;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <SvgXml xml={svg} width={size} height={size} />
      <Svg
        width={size}
        height={size}
        viewBox="0 0 102 100"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <SvgText
          x={51}
          y={58}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fill={numberColor}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={0.4}
        >
          {number}
        </SvgText>
      </Svg>
      {isCaptain ? (
        <View style={styles.captain}>
          <Text style={styles.captainTxt}>C</Text>
        </View>
      ) : null}
    </View>
  );
});

class KitShirtErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export const PlayerShirt = memo(function PlayerShirt(props: PlayerShirtProps) {
  const idPrefixRef = useRef(`k${Math.random().toString(36).slice(2, 9)}`);
  const fallback = <SimplePlayerShirt {...props} />;

  return (
    <KitShirtErrorBoundary fallback={fallback}>
      <KitPlayerShirt {...props} idPrefix={idPrefixRef.current} />
    </KitShirtErrorBoundary>
  );
});

const styles = StyleSheet.create({
  captain: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0b429',
    borderWidth: 1.5,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainTxt: {
    fontSize: 9,
    fontFamily: 'Inter_900Black',
    color: '#000',
  },
});
