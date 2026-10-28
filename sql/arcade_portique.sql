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

/* =====================================================================
   LE PORTIQUE v2 — LES CAMIONS                        2026-10-28-2010
   =====================================================================
   CE QUI A CHANGE. La borne ne fait plus empiler une tour sans fin : on
   CHARGE DES CAMIONS. Un tracteur arrive sur la voie, se gare sous le
   portique a une abscisse tiree au sort, et attend. Sa remorque porte un
   ou deux emplacements vides ; il faut y poser le conteneur.

   POURQUOI. Empiler pour empiler etait abstrait. Un chauffeur qui
   patiente avec un trou a remplir donne au meme geste un enjeu lisible en
   une seconde — et c'est le vrai metier des dockers de Marseille.

   LA CAMERA NE BOUGE PLUS. La tour qui montait obligeait a suivre ; la
   machine entiere tient maintenant dans l'ecran, poutre comprise. Le
   milieu vide a ete comble par un porte-conteneurs de fond, qui explique
   aussi d'ou vient la charge.

   LES TROIS FAÇONS DE PERDRE
     - six conteneurs dans la cour (chaque rate, et chaque trou qu'un
       camion emporte vide) ;
     - le tas de la cour qui penche jusqu'a l'aplomb et s'ecroule ;
     - rien d'autre : la montre du chauffeur ne tue pas, elle coute.

   LA BOUCLE DE REPARATION, ET LA MESURE QUI L'A DEPLACEE. On avait
   d'abord fait du CARREAU le geste qui degage la cour. On a releve la
   duree pendant laquelle le repere d'arrivee reste a moins d'un carreau
   de l'axe :

       conteneurs charges :    0      5     10     20     35
       fenetre moyenne (ms) : 160    107     82     60     60
       plus longue (ms)     : 160    208    544    496    496
       pose reussie (%)     :  53     51     39     38     38

   Soixante millisecondes, c'est sous le temps de reaction humain : le
   carreau devient un coup de chance a partir du vingtieme conteneur. Lui
   faire porter la seule planche de salut, c'etait la retirer au moment ou
   on en a besoin. Le carreau garde donc la prime d'adresse (points,
   serie, redressement du tas) et c'est le CAMION PLEIN qui degage la cour
   — un conteneur, deux si le chargement etait sans faute. La pose reussie
   reste a 38 % au plus dur : la reparation est toujours atteignable.

   LE PLAFOND DE VRAISEMBLANCE. Un robot qui vise au pixel marque environ
   107 points par seconde. Le plafond de arcade_score pour le portique est
   a 260 : il reste de la marge, on n'y touche pas.

   AU PASSAGE : UN BOGUE DE LA SALLE. salleMaj() etait appelee par un
   setTimeout(0) place au milieu de arcade.html, alors que circuit.js,
   pole.js et portique.js sont charges en bas de page. La minuterie
   partait avant eux : MOTEUR[cle].banniere n'existait pas encore et LES
   TROIS CARTES tombaient sur le dessin de secours — le rectangle violet
   et orange. Aucune erreur, aucune trace, trois vignettes fausses depuis
   le premier jour. On attend desormais DOMContentLoaded.
   ===================================================================== */
