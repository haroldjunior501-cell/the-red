# Matrice fonctionnelle — beta test

Légende : **OK** testable | **Partiel** limité | **N/A** hors scope beta

| Module | Beta | Notes |
|--------|------|-------|
| Auth email | OK | |
| Auth Google | OK | Build natif uniquement |
| Profil / pays | OK | Impact Tableau + Hub |
| Accueil prochain match | OK | Calendrier + APIs |
| Détail match / H2H | OK | FotMob + Live Score |
| Pronos 72 matchs | OK | Sauvegarde `users/.../pronos` |
| Pronos populaires | Partiel | Agrégats Firestore si rules déployées |
| Tableau groupes | OK | Statique FIFA |
| Tableau élimination | OK | Calendrier KO local + API |
| Hub score + chat | OK | Match live ou prochain ; RTDB |
| Hub globe / présence | Partiel | Riche si plusieurs users connectés |
| Live liste | OK | FotMob + Live Score |
| Live détail stats | Partiel | Stats souvent Live Score |
| Fantasy équipe | OK | Cloud si connecté |
| Fantasy FP / Stripe | OK | Serveur + build natif |
| Map Mapbox | OK | Token dans le build |
| Arena Simulator UI | OK | `EXPO_PUBLIC_LAUNCH_MODE=1` |
| Arena points live | Partiel | Matchs CdM réels + serveur |
| Duels PvP | Partiel | Firestore `duels` |
| Stories / vidéos | Partiel | Contenu admin à remplir |
| Blessés | Partiel | Souvent vide |
| Expo Go | N/A | Ne pas utiliser pour la beta |
