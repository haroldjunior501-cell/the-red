import React, { memo } from 'react';
import Svg, { G, Line } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { TABLEAU } from '../../../constants/tableauTheme';
import { bracketTreeHeight } from '../../../utils/bracketLayout';

type Variant = '8to4' | '4to2' | '2to1';

type Props = {
  variant: Variant;
  treeHeight?: number;
};

function connectorHeight(variant: Variant, treeH: number): number {
  if (variant === '8to4') return treeH;
  if (variant === '4to2') return treeH / 2;
  return treeH / 4;
}

export const BracketConnectors = memo(function BracketConnectors({ variant, treeHeight: treeH }: Props) {
  const h = connectorHeight(variant, treeH ?? bracketTreeHeight());
  const pairs = variant === '8to4' ? 4 : variant === '4to2' ? 2 : 1;
  const step = h / pairs;

  return (
    <View style={[styles.wrap, { height: h }]}>
      <Svg width={20} height={h}>
        {Array.from({ length: pairs }, (_, i) => {
          const y1 = step * i + step * 0.25;
          const y2 = step * i + step * 0.75;
          const mid = (y1 + y2) / 2;
          return (
            <G key={`connector-${variant}-${i}`}>
              <Line x1={0} y1={y1} x2={10} y2={y1} stroke={TABLEAU.connector} strokeWidth={1.5} />
              <Line x1={0} y1={y2} x2={10} y2={y2} stroke={TABLEAU.connector} strokeWidth={1.5} />
              <Line x1={10} y1={y1} x2={10} y2={y2} stroke={TABLEAU.connector} strokeWidth={1.5} />
              <Line x1={10} y1={mid} x2={20} y2={mid} stroke={TABLEAU.connector} strokeWidth={1.5} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: 20,
    marginTop: 28,
    flexGrow: 0,
  },
});
