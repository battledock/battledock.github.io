/* =====================================================================
   LA CRIEE — borne d'arcade                          2026-10-28-2140
   =====================================================================
   LE GESTE. Les caisses descendent le tapis. On tape a GAUCHE ou a
   DROITE pour envoyer celle de tete dans le bac correspondant. Le
   balayage marche aussi : le shell n'appelle tape() que si le doigt n'a
   pas bouge, donc les deux entrees ne se genent pas.

   C'est la seule borne de CADENCE de la salle : les quatre autres
   demandent de viser, celle-la demande de lire vite.

   LA REGLE TIENT EN UNE LIGNE
     chaque bac veut une espece ; si la caisse est demandee, elle y va ;
     sinon elle part au rebut, et il faut la LAISSER FILER.

   CE QUI EMPECHE QUE CE SOIT UN REFLEXE PUR
     - LES BACS CHANGENT toutes les quinze caisses : une memoire
       musculaire acquise au debut devient fausse au milieu ;
     - LA FRAICHEUR : trier en haut du tapis vaut le double ; attendre
       est sur, mais attendre ne paie pas ;
     - NE RIEN FAIRE EST UN COUP A JOUER, et c'est le plus dur a tenir
       quand la cadence monte.

   LE BOGUE QUE LE ROBOT A TROUVE. La premiere version marquait certaines
   caisses « MELANGEES » a la fabrication. Un robot qui jouait
   PARFAITEMENT perdait quand meme en quarante secondes : les bacs
   changent a chaque vente, et les caisses DEJA sur le tapis devenaient
   invendables sans qu'aucun dessin ne le dise. La faute n'etait pas celle
   du joueur. On a supprime la notion de melange : le verdict ne depend
   plus que de l'espece, et le bandeau REBUT est recalcule a chaque image
   a partir des bacs du moment. Au changement de lot, les caisses du tapis
   se marquent sous les yeux du joueur. La regle n'a plus d'exception, et
   l'affichage ne peut plus mentir.

   LA PALETTE, REFAITE APRES CAPTURE. Le premier tirage donnait une
   sardine gris-bleu pale, une dorade kaki pale et une seiche creme :
   trois pales. Sur l'image, les caisses de rebut contenaient des poissons
   qu'on prenait pour ceux du bac. Bleu, orange, or, violet, blanc, vert
   sombre : six familles, aucune hesitation de loin.

   LA GEOMETRIE SE CALCULE. Le shell cache son chrome pendant la partie :
   la scene passe de 223 a 281 pixels de haut selon la phase. Le bas du
   tapis etait pose a 246 en dur — sur l'ecran d'accueil il tombait sous
   le cadre et les bacs etaient ecrases. Tout depend desormais de s.H.

   LES MESURES
     expert (lit et trie des l'entree) : 29 caisses, 0 faute, 5 457 pts
       en 40 s, soit 136 points par seconde ;
     moyen (8 % d'erreur par caisse)   : 10 caisses, 3 fautes, 1 501 pts ;
     au hasard                          : 2 caisses, 3 fautes, 250 pts.

   LE PLAFOND est pose a 260 points par seconde — un facteur deux sur le
   robot parfait. Il vit maintenant dans public.arcade_plafond(), avec
   ceux des huit autres bornes : ils etaient ecrits en dur dans
   arcade_score(), et chaque borne ajoutee obligeait a reecrire la
   fonction entiere.
   ===================================================================== */
