import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { APPLE_PAY_SVG, MASTERCARD_SVG, VISA_SVG } from '../../../constants/paymentBrandSvgs';

type BrandTileProps = {
  xml: string;
  width: number;
  height: number;
  backgroundColor: string;
  accessibilityLabel: string;
};

function BrandTile({ xml, width, height, backgroundColor, accessibilityLabel }: BrandTileProps) {
  return (
    <View
      style={[styles.tile, { width, height, backgroundColor }]}
      accessibilityLabel={accessibilityLabel}
    >
      <SvgXml xml={xml} width={width - 14} height={height - 12} />
    </View>
  );
}

/** Apple Pay · Visa · Mastercard (sans Google Pay). */
export const PaymentBrandIcons = memo(function PaymentBrandIcons() {
  return (
    <View style={styles.row}>
      <BrandTile
        xml={APPLE_PAY_SVG}
        width={58}
        height={32}
        backgroundColor="#000000"
        accessibilityLabel="Apple Pay"
      />
      <BrandTile
        xml={VISA_SVG}
        width={52}
        height={32}
        backgroundColor="#FFFFFF"
        accessibilityLabel="Visa"
      />
      <BrandTile
        xml={MASTERCARD_SVG}
        width={52}
        height={32}
        backgroundColor="#000000"
        accessibilityLabel="Mastercard"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  tile: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
});
