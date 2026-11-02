export type Country = {
  code: string;
  name: string;
  flag: string;
  group: string;
};

// Note: groups are based on the 2026 final draw (12 groups of 4).
export const COUNTRIES: Country[] = [
  // Group A
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', group: 'A' },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿', group: 'A' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', group: 'A' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', group: 'A' },

  // Group B
  { code: 'CA', name: 'Canada', flag: '🇨🇦', group: 'B' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', group: 'B' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', group: 'B' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', group: 'B' },

  // Group C
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', group: 'C' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', group: 'C' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', group: 'C' },
  { code: 'GB-SCT', name: 'Scotland', flag: '🏴', group: 'C' },

  // Group D
  { code: 'US', name: 'United States', flag: '🇺🇸', group: 'D' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', group: 'D' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', group: 'D' },
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', group: 'D' },

  // Group E
  { code: 'CW', name: 'Curaçao', flag: '🇨🇼', group: 'E' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', group: 'E' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', group: 'E' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', group: 'E' },

  // Group F
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', group: 'F' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', group: 'F' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', group: 'F' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', group: 'F' },

  // Group G
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', group: 'G' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', group: 'G' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', group: 'G' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', group: 'G' },

  // Group H
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻', group: 'H' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', group: 'H' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', group: 'H' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', group: 'H' },

  // Group I
  { code: 'FR', name: 'France', flag: '🇫🇷', group: 'I' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', group: 'I' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', group: 'I' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', group: 'I' },

  // Group J
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', group: 'J' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', group: 'J' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', group: 'J' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', group: 'J' },

  // Group K
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', group: 'K' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', group: 'K' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', group: 'K' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩', group: 'K' },

  // Group L
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', group: 'L' },
  { code: 'GB-ENG', name: 'England', flag: '🏴', group: 'L' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', group: 'L' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', group: 'L' },
];

