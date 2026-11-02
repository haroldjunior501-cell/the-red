import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Bienvenue dans GOALYA',
    body:
      'GOALYA te place au cœur de la Coupe du Monde 2026 : tu représentes ton pays, tu vis les matchs en direct et tu avances dans une aventure persistante. Ce n’est pas un simple score — c’est ton journal de supporter.',
  },
  {
    title: 'Ta photo de profil',
    body:
      'Choisis une photo qui te représente : elle s’affiche sur ton profil, dans le classement et partout où tu interagis. Tu peux la modifier à tout moment depuis Mon profil.',
  },
  {
    title: 'Missions & progression',
    body:
      'La barre de progression reflète ton parcours dans la compétition : matchs joués, défis relevés, moments forts. Elle part à 0% au début et grandit avec tes actions. Les missions te guident étape par étape pour ne rien manquer.',
  },
  {
    title: 'Matchs & émotions',
    body:
      'Suis les rencontres, réagis en temps réel et enchaîne les objectifs liés à la compétition. Ton pays, ton drapeau et ta photo rendent chaque moment identifiable.',
  },
  {
    title: 'Guerre Map & communauté',
    body:
      'Sur la carte mondiale, ta photo rejoint les autres supporters du même pays : tu n’es pas un point anonyme, tu es visible dans l’armée de ton équipe.',
  },
  {
    title: 'Cadeaux live',
    body:
      'Pendant les matchs, envoie des cadeaux (Lion, Coupe, etc.) : ton profil apparaît à côté pour que tout le monde voie que c’est toi.',
  },
  {
    title: 'Chat & armée',
    body:
      'Dans le chat de l’armée, ta photo sert d’identité visuelle dans les messages : même logique que sur le terrain — tu es reconnaissable partout.',
  },
  {
    title: 'Partage & réseaux',
    body:
      'Les cartes et visuels partageables (Instagram, etc.) mettent en avant ton profil et ton parcours pour raconter ton histoire hors de l’app.',
  },
  {
    title: 'Connexion & sauvegarde',
    body:
      'Connecte-toi avec Google, Apple ou e-mail pour sauvegarder ta progression, ton pays et ton profil sur tous tes appareils. Une fois connecté, l’aventure continue sur l’accueil GOALYA.',
  },
];

export default function AppGuideScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.back, pressed && styles.pressed]} accessibilityRole="button">
          <Text style={styles.backText}>‹ Retour</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Comment ça marche</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Tout ce qu’il faut savoir pour vivre l’expérience GOALYA de bout en bout — de ton premier pas à ta place sur la scène mondiale.
        </Text>
        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.block}>
            <Text style={styles.blockTitle}>{s.title}</Text>
            <Text style={styles.blockBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  back: { paddingVertical: 8, paddingHorizontal: 4 },
  backText: { color: Colors.green, fontWeight: '800', fontSize: 16 },
  headerTitle: { flex: 1, textAlign: 'center', color: Colors.text, fontWeight: '900', fontSize: 16 },
  headerSpacer: { width: 72 },
  pressed: { opacity: 0.85 },
  scroll: { padding: 16, paddingBottom: 40 },
  lead: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '600',
  },
  block: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  blockTitle: { color: Colors.green, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  blockBody: { marginTop: 8, color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 19 },
});
