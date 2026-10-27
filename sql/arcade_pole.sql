/* =====================================================================
   LA BORNE « LA POLE »  —  2026-10-28
   =====================================================================

   Migration appliquee : arcade_borne_pole. Elle touche les deux memes
   fonctions que toute borne nouvelle, et rien d'autre.

   ---------------------------------------------------------------------
   1. LA LISTE BLANCHE.  arcade_jeton accueille 'pole'. Sans cette ligne
      le jeu s'ouvre, le bouton COMMENCER repond, et rien ne demarre :
      la fonction renvoie « Cette borne n'est pas branchee ».

   ---------------------------------------------------------------------
   2. LE PLAFOND DE VRAISEMBLANCE : 55 POINTS PAR SECONDE.

      LE CHIFFRE VIENT DU CHRONO, PAS D'UNE INTUITION. Le score vaut
      (40 000 - meilleur tour en millisecondes) / 5. Le circuit du port
      fait quatorze secondes a fond partout — c'est-a-dire jamais, aucune
      voiture ne tient les virages a cette vitesse. Un pilote-robot
      honnete en met vingt-deux, un bon joueur devrait descendre vers
      dix-neuf. Le plafond theorique du score est donc d'environ 5 200
      points, et une partie complete — un tour de lancement plus trois
      tours chronometres — ne peut pas durer moins de cent-trente
      secondes. 5 200 / 130, cela fait quarante : on prend 55 pour
      laisser respirer un tour exceptionnel sans ouvrir la porte a un
      score fabrique. Le plancher de 500 evite de punir une session
      interrompue.

      POURQUOI LA REFERENCE EST PASSEE DE 100 000 A 40 000. Le score
      etait d'abord taille pour un tour de quarante-cinq secondes. Le
      trace mesure a l'usage en fait vingt-deux : sur une reference de
      cent secondes, un tour excellent et un tour mediocre se tenaient
      dans un mouchoir et le tableau du port ne distinguait plus rien.
      Avec quarante secondes et une division par cinq, vingt secondes
      valent quatre mille points, trente en valent deux mille, et
      au-dela de quarante il n'y a plus rien a gagner.

   ---------------------------------------------------------------------
   CE QUI N'A PAS BOUGE. arcade_classement ne filtre sur aucune liste.
   arcade_demarrer verifie l'arme puis delegue a arcade_jeton. Les gains
   et les points du jour suivent la regle commune a toutes les bornes.
   ===================================================================== */
