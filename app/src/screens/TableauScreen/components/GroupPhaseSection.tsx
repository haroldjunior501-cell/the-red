import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GROUP_BORDER_COLORS, TABLEAU } from '../../../constants/tableauTheme';
import type { Country } from '../../../constants/countries';

type GroupRow = { letter: string; name: string; countries: Country[] };

type Props = { groups: GroupRow[] };

export const GroupPhaseSection = memo(function GroupPhaseSection({ groups }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>PHASE DE GROUPES</Text>
      <View style={styles.grid}>
        {groups.map((g) => {
          const border = GROUP_BORDER_COLORS[g.letter] ?? TABLEAU.link;
          return (
            <View key={g.letter} style={[styles.card, { borderColor: border }]}>
              <Text style={[styles.groupTitle, { color: border }]}>{g.name.toUpperCase()}</Text>
              {g.countries.map((c) => (
                <View key={c.code} style={styles.row}>
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {c.name}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingTop: 0, marginBottom: 12 },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: TABLEAU.textSoft,
    letterSpacing: 1,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    backgroundColor: TABLEAU.bgCard,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
  },
  groupTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  flag: { fontSize: 18 },
  name: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: TABLEAU.text },
});
