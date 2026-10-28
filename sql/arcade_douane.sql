/* =====================================================================
   LA DOUANE — borne d'arcade                         2026-10-29-0030
   =====================================================================
   LE GESTE. Deux boutons. LAISSE PASSER, ou OUVRE-LE. Tout le jeu est
   dans ce qu'on regarde avant d'appuyer : le scan a gauche, le manifeste
   a droite. Quand les deux disent la meme chose, on laisse filer ; des
   qu'ils se contredisent, on ouvre.

   LES QUATRE REGLES N'ARRIVENT PAS ENSEMBLE. Une borne qui demande de
   verifier quatre choses des la premiere caisse ne s'apprend pas, elle
   se subit. Elles tombent une par une, par NOTE DE SERVICE, et la note
   fige la file : une regle qui arrive pendant que le chrono tourne se
   lit en diagonale ou pas du tout, et on la decouvre en se prenant la
   faute qu'elle annonçait.

     R1 (des le debut)       la masse dense non declaree
     R2 (au 4e conteneur)    le nombre de colis
     R3 (au 9e)              la nature de la marchandise
     R4 (au 15e)             le numero de plomb

   UN SEUL DEFAUT A LA FOIS, et c'est une decision de conception : avec
   deux defauts, un joueur qui en repere un n'a aucune raison de chercher
   l'autre, et la borne devient PLUS FACILE a mesure qu'elle met plus de
   fautes. Avec un seul, il faut verifier tout ce qu'on sait avant de
   laisser passer.

   OUVRIR UN CONTENEUR EN REGLE EST UNE FAUTE au meme titre que laisser
   filer un conteneur sale. Sans ca, la strategie gagnante serait d'ouvrir
   tout le monde et il n'y aurait plus rien a lire.

   LE CHRONO EST LA FILE. On ne gagne pas en etant rapide, on perd en
   etant lent : la nuance laisse le droit de REGARDER quand il y a un
   doute, et c'est ce droit-la qui fait qu'on lit. La prime de vitesse est
   volontairement faible (vingt-cinq points au maximum) ; une prime forte
   pousserait a trancher sans lire, c'est-a-dire a jouer exactement ce
   que la borne ne doit pas recompenser.

   LES MESURES
     expert (verifie toutes les regles connues) : 58 controles, 0 faute,
       27 saisies, 165 points par seconde ;
     moyen (ne verifie que R1 et R2)             : 15 controles, 3 fautes ;
     qui laisse tout passer                      : 16 controles, 3 fautes.

   LE DEFAUT DE BANC D'ESSAI QUI AVAIT FAUSSE LA PREMIERE SERIE. Chaque
   robot gardait « l'ancien pas() » en faisant M.pas.bind(M) — mais a ce
   moment-la, M.pas etait DEJA le robot precedent. Le troisieme niveau
   enveloppait le deuxieme qui enveloppait le premier, et les trois
   jouaient ensemble a chaque image : le robot qui laissait TOUT passer
   rendait zero faute sur vingt-deux controles, parce que l'expert
   tranchait avant lui. On memorise desormais le vrai pas() une fois pour
   toutes. Les trois autres bornes du port avaient le meme defaut et ont
   ete remesurees.

   LE PLAFOND est pose a 300 points par seconde dans arcade_plafond().
   ===================================================================== */
