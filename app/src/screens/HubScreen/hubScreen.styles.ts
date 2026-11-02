import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const hubScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  globeZone: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
});
