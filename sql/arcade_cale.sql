/* =====================================================================
   LA CALE — borne d'arcade                           2026-10-28-2300
   =====================================================================
   LE GESTE. Le pouce se pose sur une colonne, la levee s'y aligne ; il
   glisse, elle suit ; il se leve, elle tombe. Un seul geste pour choisir
   ET pour lacher — des fleches et un bouton auraient mange le tiers de
   l'ecran pour faire exactement ca.

   CE N'EST PAS UN TETRIS. Les pieces ne tournent pas : un conteneur ne se
   met pas debout. La difficulte n'est pas dans leur forme, elle est dans
   leur POIDS — douze, vingt-quatre ou trente tonnes par boite, et le
   navire penche du cote ou la masse s'accumule. Remplir proprement une
   colonne du bord, c'est gagner des rangees et perdre le navire.

   TROIS MESURES ONT CHANGE LA BORNE, DANS CET ORDRE

   1. LA GITE ETAIT UNE DIVISION FAUSSE. Le premier calcul divisait le
      moment par une stabilite qui grandissait avec la charge, mais le
      facteur de depart etait si petit qu'UN SEUL conteneur de vingt-quatre
      tonnes pose contre le bord donnait une gite de 2,5 : le robot
      « moyen » coulait a sa PREMIERE pose. On mesure desormais l'ecart du
      centre de gravite au milieu de la cale, rapporte a la demi-largeur,
      avec deux cents tonnes de lest au denominateur. Un navire vide
      pardonne tout, un navire plein ne pardonne plus rien — la courbe de
      difficulte sort de la physique au lieu d'etre ecrite a la main.

   2. SIX COLONNES SE REMPLISSAIENT TOUTES SEULES. Un robot qui posait AU
      HASARD faisait trente-deux rangees en trente secondes sans jamais
      perdre. Le jeu n'avait pas de difficulte, il avait une cadence. Huit
      colonnes, et le hasard laisse des trous.

   3. TOUTES LES PIECES ETAIENT PLATES. Un sol plat accepte n'importe
      quoi : aucun trou n'est jamais impossible a boucher. On a ajoute le
      TANDEM-LIFT — deux conteneurs pris ensemble par le spreader, ce qui
      existe pour de vrai — et l'irregularite est revenue. La levee se
      defait en conteneurs independants une fois posee, ce qui est la
      verite du metier et permet a une rangee de partir sans couper une
      piece en deux.

   ET UNE MESURE QUI N'ACCUSAIT QUE LE ROBOT. Avant de corriger quoi que
   ce soit, l'expert mourait en trente poses sans faire une rangee, en
   empilant une tour au milieu. Son heuristique n'avait que la SOMME des
   hauteurs — qui augmente de la meme quantite ou qu'on pose, et ne
   distingue donc pas une pose au sol d'une pose en haut d'une tour. Le
   jeu n'y etait pour rien. Un robot qui ne sait pas jouer ne mesure rien.

   LE TEMPS DE REPRISE DU SPREADER (trois dixiemes de seconde) plafonne la
   cadence a trois poses par seconde : sans lui, le conteneur suivant
   apparaissait a l'image ou le precedent se posait et le jeu tournait a
   la vitesse du pouce, pas a celle qu'on avait reglee.

   LES MESURES FINALES
     expert (hauteur, trous, bosses, rangees, gite) : 88 poses,
       18 rangees, 4 144 pts en 45 s, soit 92 points par seconde ;
     moyen (pose le plus bas possible)              : 68 poses, 16 rangees ;
     au hasard                                      : 59 poses, 8 rangees.

   LE PLAFOND est pose a 300 points par seconde dans arcade_plafond().
   ===================================================================== */
