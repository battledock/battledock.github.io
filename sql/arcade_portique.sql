/* =====================================================================
   LA BORNE « LE PORTIQUE »  —  2026-10-28
   =====================================================================

   DEUX FONCTIONS TOUCHEES, ET RIEN D'AUTRE. Les migrations appliquees :
     · arcade_borne_portique       — la liste blanche des bornes
     · arcade_score_cap_portique   — le plafond de vraisemblance

   ---------------------------------------------------------------------
   1. LA LISTE BLANCHE.  arcade_jeton portait en dur
        BORNES text[] := array['hangar','ferme','cordon'];
      Une borne absente de ce tableau renvoie « Cette borne n'est pas
      branchee » et le jeton n'est jamais pris : le jeu s'ouvre, le bouton
      COMMENCER repond, et rien ne demarre. On y ajoute 'portique'. On en
      retire 'cordon' au passage : ses sept fichiers ont ete supprimes du
      depot, laisser son nom dans la liste n'ouvrait qu'une porte sur une
      piece vide.

   ---------------------------------------------------------------------
   2. LE PLAFOND DE VRAISEMBLANCE.  arcade_score plafonnait le hangar a
      400 points par seconde et la ferme a 80, mais toute autre borne
      tombait dans un « else cap := 100000 » sans rapport avec la duree :
      un score pose a la seconde passait, et le tableau du port se
      remplissait de parties impossibles.

      LE CHIFFRE VIENT DU JEU, PAS D'UNE INTUITION. Une pose demande au
      mieux une seconde et demie — le temps de la chute, puis celui que
      met le chariot a revenir au-dessus de la pile. Le meilleur coup
      imaginable, un carreau en serie de cinq sur une pile de cent, vaut
      50x5 + 100x0,6, soit environ trois cent dix points. Trois cent dix
      sur une seconde et demie font deux cent sept : on arrondit a 260
      pour laisser de la marge a une serie exceptionnelle sans ouvrir la
      porte a un score fabrique. Le plancher de 500 evite de punir une
      partie courte mais honnete.

   ---------------------------------------------------------------------
   CE QU'IL N'A PAS FALLU TOUCHER. arcade_classement ne filtre sur aucune
   liste : il prend la borne qu'on lui donne. arcade_demarrer non plus —
   il verifie l'arme puis delegue a arcade_jeton. Une borne nouvelle ne
   demande donc que ces deux retouches.
   ===================================================================== */
