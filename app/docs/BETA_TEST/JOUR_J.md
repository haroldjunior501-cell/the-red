# Jour J — Timeline beta

À adapter selon ton créneau (ex. beta 14h–18h).

## Avant 14h

```
npm run beta:preflight
npm run firebase:deploy:rules   # si pas fait depuis la dernière modif rules
npm run beta:server
```

Sur ton téléphone : parcours [TESTEURS.md](./TESTEURS.md) (smoke test).

## 14h00 — Ouverture

- Envoyer [MESSAGE_TESTEURS.txt](./MESSAGE_TESTEURS.txt)
- Rappel : **installer le build GOALYA** (lien EAS / TestFlight / APK), pas Expo Go

## 14h15 – 16h00 — Phase libre

Testeurs explorent dans cet ordre suggéré :

1. Inscription / connexion  
2. Pays + Accueil  
3. Pronos  
4. Hub (message sur le match)  
5. Tableau  
6. Fantasy  

## 16h00 — Point mi-parcours (optionnel)

Questions rapides :

- Connexion OK ?
- Pronos sauvegardés ?
- Hub : message visible ?
- Bugs bloquants ?

## 17h30 — Clôture

- Rappel canal bugs  
- Remerciements  
- Annoncer correctifs + éventuelle beta 2  

## Après la session

| Tâche | Responsable |
|-------|-------------|
| Trier bugs P0 / P1 / P2 | Toi |
| Corriger crash + perte données | Dev |
| Mettre à jour MATRICE si comportement change | Doc |
