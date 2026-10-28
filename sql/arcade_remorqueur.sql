/* =====================================================================
   LE REMORQUEUR — borne d'arcade                     2026-10-29-0030
   =====================================================================
   LE GESTE. Le pouce se pose sur l'eau, le remorqueur y va. C'est tout.
   Le porte-conteneurs, lui, suit au bout de l'aussiere — et il ne va PAS
   ou va le remorqueur.

   LE NAVIRE AVANCE TOUT SEUL, et c'est le bon partage. On a d'abord voulu
   que le remorqueur le tracte vraiment : le joueur passait son temps a
   relancer un navire arrete et ne regardait jamais la passe. Dans un vrai
   port, le gros batiment est en machine « en avant tres lente » et les
   remorqueurs ne font que l'ORIENTER. La vitesse est donnee, la direction
   est a toi.

   L'INERTIE EST LE SUJET. Trois cents metres ne tournent pas parce qu'on
   tire dessus : ils COMMENCENT a tourner, et ils continuent longtemps
   apres. Il faut donner l'angle avant le virage et contre-tirer avant
   d'etre revenu dans l'axe.

   TROIS MESURES, ET DEUX ERREURS DE METHODE

   1. LE COUPLE ETAIT CENT MILLE FOIS TROP FORT. Le premier reglage
      ecrivait « force x bras / moment d'inertie » avec des nombres
      choisis a vue : le navire claquait en UNE IMAGE a sa bute de
      soixante-douze degres et partait en travers dans la digue. Les trois
      pilotes rendaient exactement le meme resultat — six ragages, deux
      cent soixante-dix metres. Trois robots qui jouent pareil ne mesurent
      pas trois niveaux, ils mesurent une commande qui ne commande rien.
      On repart desormais des durees qu'on veut sentir : quatre secondes
      pour que la giration s'etablisse, trois pour tourner de
      quarante-cinq degres. Le couple et l'amortissement en decoulent.

   2. LES TROIS « NIVEAUX » N'ETAIENT QUE TROIS REGLAGES D'AUTOMATE. On
      faisait varier la distance de visee : 120, 55, 18 pixels devant
      l'etrave. Le « nul » a dix-huit pixels faisait deux cent cinquante
      metres de PLUS que le « bon » a cent vingt — logique une fois vu :
      viser loin avec soixante-douze metres de coque, c'est couper le
      virage et raguer a l'interieur. On garde donc une seule strategie,
      la bonne, et on degrade ce qui degrade vraiment un humain : LE TEMPS
      DE REACTION.

   3. LA DIFFICULTE SATURAIT EN QUARANTE SECONDES. La passe se resserrait
      et le navire accelerait si vite que tout le monde butait sur le meme
      mur ; le pilotage ne servait plus a rien passe ce point. Les deux
      pentes ont ete divisees par deux.

   LA PASSE EST ENTIEREMENT CALCULEE, jamais tiree au sort au fil de
   l'eau : il faut pouvoir demander ou sera le chenal cent metres plus
   loin, parce qu'un virage qu'on decouvre en y entrant ne se negocie pas.
   Son amplitude est bornee par ce que le navire sait faire — une passe
   qu'on ne peut pas suivre meme en jouant parfaitement n'est pas
   difficile, elle est fausse.

   LE PLAFOND est pose a 160 points par seconde dans arcade_plafond().
   ===================================================================== */
