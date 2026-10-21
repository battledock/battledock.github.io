# Système de niveaux — en réserve (21/10/2026)

Rien n'est en ligne. À reprendre quand Eliasse le demande.

- HUD retenu : **D · Plaque du capitaine** (lvD.png, lv2.css + lv2_t.js).
- Écran « Mon niveau » au style Chez Madeleine, fond bleu mer (n1–n3.png, niv.css + nv_t.js).
- Onglets : Niveaux · Coffres · Passe · Titres ; chemin à jetons ; paliers 5/10 avec coffre ; bouton RÉCLAMER.
- Niveaux 1–10 : 1 titre Mousse + caisse · 2 500 € + graines · 3 sac +2 · 4 caisse + kart Bleu nuit ·
  5 Malle du marin + titre Matelot · 6 pêche +3 % · 7 1 000 € + 2 glaces · 8 ruche · 9 caisse + cadre Cordage ·
  10 Coffre de la Bonne Mère + titre Second + cabanon.
- Courbe XP : 100,180,260,350,450,560,680,810,950 (4 340 au niv. 10).
- Idées : XP serveur avec plafonds, coffres (bois / malle / Bonne Mère) avec fragments et pitié, passe de saison payé en euros du jeu, bonus permanents faibles (5–10 %).

## Ajouts du 21/10/2026 (toujours en réserve)

### Niveaux de départ (classement juste, 1 point = 1 XP)
RobDock 21 · Dopio 15 · MISTOOFLY 15 · Eliasse 14 · Nico 13 · Certifierbio 6 · Aa 5 · Zigouigoui 5 · alscrn7 2 · autres 1.
Courbe : +150, +160, +170… après le niveau 10 (niv. 15 = 11 540 XP, niv. 20 = 23 740, niv. 25 = 42 190).
Rattrapage conseillé : un coffre par tranche de 5 niveaux déjà passés, une seule fois.

### 30 niveaux
1 Mousse + caisse · 2 500 € + graines · 3 sac +2 · 4 caisse + kart Bleu nuit · 5 Malle + Matelot + vitrines Pokédock ·
6 pêche +3 % · 7 1 000 € + 2 glaces · 8 ruche · 9 caisse + cadre Cordage · 10 Bonne Mère + Second + cabanon ·
11 hache affûtée · 12 recette bouillabaisse · 13 caisse + emote pétanque · 14 +4 parcelles · 15 Malle + Bosco + circuit Le Panier ·
16 turbo de départ +0,2 s (courses libres) · 17 verger +1 fruit · 18 pêche de nuit · 19 caisse + bateau au ponton · 20 Bonne Mère + Patron de pêche + pêche au large ·
21 ventes +3 % · 22 recette pastis · 23 caisse + tenue Capitaine · 24 +1 place enclos · 25 Malle + Capitaine + kayak Frioul ·
26 sac +4 · 27 table VIP casino · 28 aquarium au cabanon · 29 caisse + étoile dorée · 30 coffre légendaire + Roi du Vieux-Port + statue sur le quai.
Après 30 : prestige (étoiles).

### Le système de coffres (à créer avec les niveaux)
- Caisse en bois : 3 objets. Malle du marin : 4 objets, 1 rare garanti. Coffre de la Bonne Mère : 5 objets, 1 légendaire garanti.
- Raretés par objet : commun 70 % · rare 25 % · épique 4,5 % · légendaire 0,5 %.
- Commun : 200–800 €, graines, appâts, bois. Rare : glace, paquet Pokédock, graines rares, engrais. Épique : pièce de tenue, couleur de kart, 3 fragments. Légendaire : objet rare au choix, 10 fragments.
- Fragments : doubles recyclés ; 10 fragments = un légendaire au choix (boutique). Garantie : un légendaire au plus tard tous les 30 coffres.
- Tirage côté serveur uniquement ; ouverture animée comme les paquets Pokédock.

### Coffres : choix validé (21/10/2026)
- Écran « Mes coffres » (c1.png) + ouverture plein écran (c2.png), style Chez Madeleine en bleu mer.
- Révélation : **un par un (B, c4.png) pour la Malle du marin et le Coffre de la Bonne Mère** ; **tout d'un coup (A, c3.png) pour la Caisse en bois**.
- Coffres en pixel art : coffres.js ; styles : cof.css ; capture : cf_t.js.

### Catalogue des récompenses (k1.png, k2.png) — géré par le serveur
Types : euros · ressources (graines, appâts, bois, jetons, engrais) · consommables à effet (glace, arrosage du champ, grand sac 24 h, café forêt ×2, appât doré) · Pokédock · cosmétiques (tenue, couleur de kart, cadre, emote) · bonus permanents (légendaires seulement) · fragments.
- Commun 70 % : euros 200–800 × facteur de niveau, graines 5–15, appâts 10–30, bois 20–60, jetons 5–20, engrais.
- Rare 25 % : glace (10 min), paquet Pokédock, graines rares, arrosage complet, grand sac +10 (24 h), café (forêt ×2, 15 min).
- Épique 4,5 % : tenue, couleur de kart, cadre, emote, appât doré (30 min), 3 fragments.
- Légendaire 0,5 % : canne dorée (mord +10 %), hache d'or, tenue unique, pointu au ponton, sac +5, 10 fragments.
Règles :
- Quantités × facteur de niveau : 1 + niveau/10 (niv. 1 = ×1,1 ; niv. 20 = ×3).
- Bonus de rareté avec le niveau : +0,1 point de légendaire et +0,5 d'épique tous les 10 niveaux (pris sur le commun).
- Seulement ce qui sert : rien de verrouillé (graines non débloquées, objets d'une activité jamais pratiquée → remplacés par l'équivalent utile).
- Doublon cosmétique ou légendaire déjà possédé → fragments (épique 3, légendaire 10).
- Garanties : un épique au plus tard tous les 10 objets, un légendaire tous les 30 coffres.
- Tirage uniquement côté serveur, journalisé (table des ouvertures) ; consommables à durée gérés par le serveur.
