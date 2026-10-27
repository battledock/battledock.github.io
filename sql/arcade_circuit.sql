/* =====================================================================
   LA BORNE « LE CIRCUIT »  —  2026-10-28
   =====================================================================

   Deux retouches, les memes que pour toute borne nouvelle.

   1. LA LISTE BLANCHE d'arcade_jeton accueille 'circuit'.

   2. LE PLAFOND DE VRAISEMBLANCE : 130 POINTS PAR SECONDE.
      Le score vaut (40 000 - meilleur tour en millisecondes) / 4. Le
      trace fait 3 360 pixels pour une vitesse de pointe de 0,235 pixel
      par milliseconde : un tour theorique a fond partout prendrait
      quatorze secondes, ce qui n'arrive pas puisqu'il faut ralentir pour
      tourner. Un pilote-robot prudent met vingt-huit secondes, et un
      tour vraiment excellent devrait tomber vers seize, soit 6 000
      points. Trois tours ne peuvent pas durer moins d'une cinquantaine
      de secondes : 6 000 / 50 = 120, on prend 130 pour la marge. Le
      plancher de 500 evite de punir une partie interrompue.

   POURQUOI LE SCORE VIENT DU MEILLEUR TOUR ET NON DU TOTAL. Le total
   punit une sortie de piste deux fois : une fois dans le tour ou elle a
   lieu, une fois dans le classement. Le meilleur tour laisse une
   mauvaise manche sans consequence, et c'est ce qui fait qu'on relance
   apres une erreur au lieu d'abandonner la partie en cours.
   ===================================================================== */
