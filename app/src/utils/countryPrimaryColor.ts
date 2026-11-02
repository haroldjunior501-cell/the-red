import { NATIONAL_KIT_STYLES } from '../constants/nationalKitStyles';

export function getCountryPrimaryColor(countryCode: string): string {
  const code = countryCode.toUpperCase();
  return NATIONAL_KIT_STYLES[code]?.shirtColor ?? NATIONAL_KIT_STYLES.FR?.shirtColor ?? '#2979ff';
}
