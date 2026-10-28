/* =======================================================================
   LE CIRCUIT  —  cinq traces, douze monoplaces, vue de dessus
   =======================================================================

   CE QU'ON VIENT CHERCHER ICI : rouler. Tenir une monoplace sur un trace
   et tourner. Tout le reste est au service de ca.

   LE VOLANT EST ANALOGIQUE. Chaque doigt vaut sa distance au milieu de
   l'ecran : pres du centre, une touche de volant ; contre le bord,
   braquage complet. On fait la SOMME des doigts, donc deux pouces
   symetriques s'annulent — frein tout droit — tandis qu'un pouce au bord
   gauche et un autre juste a droite du centre freinent EN TOURNANT.

   DEUX VECTEURS, PAS UN. L'orientation du chassis et le vecteur vitesse
   sont gardes separement, et l'adherence ne fait que rapprocher le
   second de la premiere. Trop de vitesse en virage et l'ecart ne se
   resorbe plus : le nez pointe a l'interieur pendant que la voiture part
   a l'exterieur. Le contre-braquage rend de la prise, donc une glisse se
   rattrape — sans quoi la seule strategie serait de ne jamais attaquer.

   ---------------------------------------------------------------------
   POURQUOI DOUZE LIVREES ET NON DOUZE COULEURS
   ---------------------------------------------------------------------
   Repeindre la meme carrosserie en douze teintes ne donne pas douze
   voitures : a trente pixels de haut et vue de dessus, l'oeil ne retient
   qu'une tache coloree, et deux ecuries de bleu voisin sont la meme
   voiture. Chaque livree porte donc un MOTIF — une bande centrale, des
   chevrons sur le nez, un damier sur les pontons, une fleche, une
   diagonale — applique au sprite pixel par pixel. C'est la forme qui
   distingue, la couleur ne fait que confirmer.

   LES LIVREES SONT INVENTEES, et les noms aussi. Reproduire les couleurs
   d'une ecurie reelle, c'est reproduire sa marque.

   ---------------------------------------------------------------------
   POURQUOI CINQ TRACES ET CINQ DECORS
   ---------------------------------------------------------------------
   Cinq boucles sur le meme fond vert sont cinq fois le meme circuit :
   on ne reconnait pas ou on est, donc on n'apprend rien, donc on ne
   progresse pas. Chaque trace a son terrain — le sable du port, la mer
   de la Corniche, la roche des Calanques, le beton de la Friche, les
   pins de la Pinede — et ses obstacles propres. Reconnaitre un endroit
   est la condition pour y freiner au bon moment.

   LES TRACES ONT ETE VERIFIES AVANT D'ETRE DESSINES. Deux portions de
   piste superposees rendraient la detection de sortie incoherente sans
   jamais lever d'erreur : les cinq ont ete passes au calcul, le plus
   serre laisse 149 pixels entre deux portions eloignees le long du
   trace, pour une piste large de 46.
   ===================================================================== */

/* =====================================================================
   LE FACTEUR D'ECHELLE, ET POURQUOI IL EXISTE
   ---------------------------------------------------------------------
   Le shell choisit la taille du pixel en divisant la largeur de l'ecran
   par « vise », puis en arrondissant : il n'y a donc que deux reglages
   possibles sur un telephone de 390 points — des pixels de deux points
   (195 de scene) ou d'un point (390). On etait au premier. Tout le
   travail de texture, d'ombre et de detail bute sur ce plafond : a 195
   pixels de large, une monoplace en fait 18, et il n'y a pas la place
   d'y mettre autre chose qu'une silhouette.

   On passe donc a 390, soit QUATRE FOIS PLUS DE PIXELS a l'ecran. Pour
   garder exactement le meme cadrage — la meme portion de piste visible,
   la meme sensation de vitesse — tout le monde est double : la longueur
   des traces, la largeur de piste, la taille de la voiture et les
   vitesses. Rien ne change pour le joueur sinon la finesse.
   ===================================================================== */
var CI_K=2;
var CI_L=36, CI_H=62;
var CI_TOURS=3;
var CI_CLE='bdl.circuit.v2';

/* =====================================================================
   LA MONOPLACE, VUE DE DESSUS
   Construite bande par bande et centree par le code : ecrite a la main,
   une ligne sur trois finit decalee d'un pixel et la voiture penche.
   Les lettres sont une palette, pas des couleurs — c'est ce qui permet
   de repeindre la meme carrosserie sans la redessiner.
     K contour  c carrosserie  d motif  e accent  n gomme  W casque
   ===================================================================== */
/* =====================================================================
   LA MONOPLACE, VUE DE DESSUS, EN 36 x 62
   ---------------------------------------------------------------------
   ON NE DESSINE PLUS LIGNE PAR LIGNE A LA MAIN. A dix-huit pixels de
   large, trente lignes d'ASCII suffisaient ; a trente-six sur soixante-
   deux, il en faudrait soixante-deux de trente-six caracteres, et la
   moindre retouche de profil obligerait a tout recompter. On decrit donc
   la LARGEUR de la carrosserie a chaque hauteur, et le reste se deduit :
   le contour, le degrade lateral, les creux.

   LE VOLUME VIENT DU DEGRADE LATERAL. Une carrosserie d'une seule teinte
   est une decoupe de papier ; trois tons — clair au sommet de la courbe,
   normal, sombre pres des aretes — et la meme forme devient un objet
   bombe. C'est la seule chose qui separe un sprite plat d'un sprite qui
   a l'air pose sous une lumiere.
     K contour   c normal   C eclaire   D ombre   d motif
     n gomme     o rainure  N flanc     W casque  B visiere
     G aileron   g reflet   S echappement
   ===================================================================== */
function CI_SPRITE(){
  var A=[], j, i, LARG=CI_L, HAUT=CI_H, cx=LARG>>1;
  /* =====================================================================
     LE PROFIL. UNE MONOPLACE N'EST PAS UNE GOUTTE : c'est un nez tres
     fin et tres long, puis une rupture nette au niveau du cockpit, puis
     des pontons larges et presque paralleles. Un profil qui s'elargit
     regulierement du nez a l'arriere donne une forme de poire — c'etait
     le defaut de la premiere version. Les RUPTURES font la silhouette.
     ===================================================================== */
  function demi(j){
    if(j<7)  return 17;                        /* aileron avant, tres large */
    if(j<11) return 2;                         /* le pylone, presque rien */
    if(j<22) return 2.5 + (j-11)*0.13;         /* le nez, fin et long */
    if(j<27) return 4 + (j-22)*1.30;           /* la rupture : il s'ouvre */
    if(j<37) return 10.5 + (j-27)*0.26;        /* le cockpit */
    if(j<51) return 13.2;                      /* les pontons, paralleles */
    if(j<56) return 13.2 - (j-51)*1.80;        /* le retrecissement */
    if(j<58) return 4.2;                       /* le capot moteur */
    return 16;                                 /* aileron arriere */
  }
  for(j=0;j<HAUT;j++){
    var t=new Array(LARG); for(i=0;i<LARG;i++)t[i]='.';
    var w=Math.max(2,Math.round(demi(j)));
    var g0=cx-w, d0=cx+w-1;
    for(i=g0;i<=d0;i++){
      if(i<0||i>=LARG)continue;
      var u=Math.abs(i-(cx-0.5))/w;            /* 0 au milieu, 1 au bord */
      t[i]= (i===g0||i===d0) ? 'K' : (u>0.78?'D':(u<0.34?'C':'c'));
    }
    A.push(t);
  }
  function pose(j,i,ch){ if(j>=0&&j<HAUT&&i>=0&&i<LARG)A[j][i]=ch; }
  function bande(j,i0,i1,ch){ for(var k=i0;k<=i1;k++)pose(j,k,ch); }
  /* ---- LES AILERONS : deux plans, des derives, une lame d'accent ---- */
  for(j=0;j<7;j++) for(i=cx-17;i<=cx+16;i++){
    if(i<0||i>=LARG)continue;
    pose(j,i, (j===0||j===6)?'K':(j===1?'G':(j<=4?'e':'G')));
  }
  for(j=58;j<HAUT;j++) for(i=cx-16;i<=cx+15;i++){
    if(i<0||i>=LARG)continue;
    pose(j,i, (j===58||j===HAUT-1)?'K':(j===59?'G':(j===60?'e':'G')));
  }
  /* les derives verticales des ailerons */
  for(j=0;j<9;j++){ pose(j,cx-17,'K'); pose(j,cx+16,'K'); pose(j,cx-16,'G'); pose(j,cx+15,'G'); }
  for(j=56;j<HAUT;j++){ pose(j,cx-16,'K'); pose(j,cx+15,'K'); pose(j,cx-15,'G'); pose(j,cx+14,'G'); }
  /* ---- LE COCKPIT, LE HALO, LE CASQUE ---- */
  for(j=28;j<=38;j++) bande(j,cx-5,cx+4,'K');
  for(j=29;j<=37;j++) bande(j,cx-4,cx+3,'W');
  for(j=30;j<=34;j++) bande(j,cx-3,cx+2,'B');
  pose(29,cx-4,'w'); pose(29,cx+3,'w'); pose(30,cx-4,'w');
  /* le halo : un arceau qui ceinture le cockpit */
  bande(27,cx-6,cx+5,'G'); pose(28,cx-6,'G'); pose(28,cx+5,'G');
  pose(38,cx-6,'G'); pose(38,cx+5,'G'); bande(39,cx-6,cx+5,'G');
  pose(26,cx-1,'G'); pose(26,cx,'G');
  /* ---- LES ENTREES D'AIR DES PONTONS ---- */
  for(j=38;j<=44;j++){ bande(j,cx-13,cx-11,'K'); bande(j,cx+10,cx+12,'K'); }
  for(j=39;j<=43;j++){ bande(j,cx-12,cx-12,'D'); bande(j,cx+11,cx+11,'D'); }
  /* ---- LE CAPOT MOTEUR, SA PRISE D'AIR ET L'ECHAPPEMENT ---- */
  for(j=24;j<=27;j++) bande(j,cx-2,cx+1,'D');
  for(j=56;j<=57;j++) bande(j,cx-1,cx,'S');
  /* ---- LES ROUES. Flanc sombre, bande de roulement grise, rainures ---- */
  function roue(j0,j1,ec,larg){
    for(var jj=j0;jj<=j1;jj++){
      for(var k=0;k<larg;k++){
        var ch=(k===0||k===larg-1)?'N':((jj-j0)%4===1?'o':'n');
        if(jj===j0||jj===j1)ch='N';
        pose(jj,cx-ec-larg+k,ch);
        pose(jj,cx+ec+k,ch);
      }
    }
  }
  roue(13,26,10,8);     /* avant */
  roue(40,55,9,9);      /* arriere */
  /* =====================================================================
     LES BRAS DE SUSPENSION. Sans eux, les roues flottent a cote de la
     voiture comme quatre rectangles poses la : ce sont deux pixels par
     bras, et c'est ce qui transforme quatre blocs gris en un train
     roulant. On en met deux par roue, en V, comme sur une vraie.
     ===================================================================== */
  function bras(jr,jc,ec){
    var dj=(jc>jr)?-1:1, n=Math.abs(jc-jr);
    for(var k=0;k<=n;k++){
      var jj=jr+(jc>jr?k:-k);
      var f=k/Math.max(1,n);
      var ii=Math.round(ec - f*(ec-Math.round(demi(jj))+1));
      pose(jj, cx-ii, 'G'); pose(jj, cx+ii-1, 'G');
    }
  }
  bras(16,21,11); bras(24,21,11);      /* triangle avant */
  bras(43,47,10); bras(53,48,10);      /* triangle arriere */
  /* LE NEZ RESTE AUX COULEURS DE L'ECURIE. Le pylone gris qui tenait
     l'aileron courait sur toute la pointe : sur un nez de quatre pixels
     de large, deux pixels gris, c'etait la moitie de la livree perdue a
     l'endroit qu'on regarde le plus. Il ne reste que les deux montants
     lateraux, qui existent sur une vraie et ne mordent sur rien. */
  for(j=5;j<=9;j++){ pose(j,cx-11,'G'); pose(j,cx+10,'G'); }
  /* un liseré clair sur le haut de chaque roue : elles cessent d'etre
     des rectangles noirs */
  for(i=0;i<8;i++){ pose(13,cx-18+i,'n'); pose(13,cx+10+i,'n'); }
  for(i=0;i<9;i++){ pose(40,cx-18+i,'n'); pose(40,cx+9+i,'n'); }
  var out=[]; for(j=0;j<HAUT;j++)out.push(A[j].join(''));
  return out;
}
var CI_ART=null;

/* =====================================================================
   LES MOTIFS. Chaque fonction repond : ce pixel de carrosserie
   est-il du motif ? C'est la FORME qui distingue deux ecuries, pas la
   teinte — a trente pixels de haut, deux bleus voisins sont la meme
   voiture.
   ===================================================================== */
/* LES MOTIFS SONT ECRITS EN FRACTIONS DU SPRITE, pas en pixels. Ils
   etaient calibres pour une monoplace de dix-huit de large : sur
   trente-six, une « bande centrale » de trois pixels devenait un fil, et
   un damier de deux sur deux un bruit. En travaillant sur l'ecart au
   centre rapporte a la demi-largeur, le meme motif tient a n'importe
   quelle taille. */
var CI_MOTIFS={
  uni:     function(i,j){ return false; },
  bande:   function(i,j){ return Math.abs(i-CI_L/2+0.5)<CI_L*0.095; },
  deux:    function(i,j){ var a=Math.abs(i-CI_L/2+0.5)/(CI_L/2);
                          return a>0.26&&a<0.46; },
  fleche:  function(i,j){ var f=j/CI_H;
                          return f<0.55&&Math.abs(i-CI_L/2+0.5)<=Math.max(0,(j-6)*0.30); },
  chevron: function(i,j){ return j<CI_H*0.52&&
                          ((Math.abs(i-CI_L/2+0.5)*1.25+j)%13)<4.4; },
  damier:  function(i,j){ return j>=CI_H*0.42&&j<=CI_H*0.80&&
                          (((i/3)|0)+((j/3)|0))%2===0; },
  diag:    function(i,j){ return ((i*1.6+j)%17)<6.2; },
  pois:    function(i,j){ var a=(i%9)-4, b=(j%9)-4; return a*a+b*b<3.2; },
  avant:   function(i,j){ return j<CI_H*0.52; },
  arriere: function(i,j){ return j>=CI_H*0.52; },
  moitie:  function(i,j){ return i<CI_L/2; },
  cercles: function(i,j){ var a=i-CI_L/2+0.5, b=(j%18)-9; return a*a+b*b<22; }
};

/* DOUZE ECURIES, inventees, aux noms du port et du large. */
var CI_NOMS_MOTIF={uni:'UNI',bande:'BANDE CENTRALE',deux:'DOUBLE BANDE',
  fleche:'FL\u00c8CHE',chevron:'CHEVRONS',damier:'DAMIER',diag:'DIAGONALES',
  pois:'POIS',avant:'NEZ PEINT',arriere:'ARRI\u00c8RE PEINT',moitie:'DEUX MOITI\u00c9S',
  cercles:'CERCLES'};
var CI_ECURIES=[
  {n:'MISTRAL',   c:'#ff7a1e', d:'#17202c', e:'#ffd24a', m:'bande'},
  {n:'CALANQUE',  c:'#0f8f86', d:'#eef4f5', e:'#ff4a6a', m:'deux'},
  {n:'LE J4',     c:'#1b3fa8', d:'#eef4f5', e:'#ffd24a', m:'fleche'},
  {n:'PHOCÉEN',   c:'#c81e28', d:'#eef4f5', e:'#17202c', m:'chevron'},
  {n:'BORA',      c:'#eef4f5', d:'#1b3fa8', e:'#2fd4ff', m:'damier'},
  {n:'LE MÔLE',   c:'#17202c', d:'#2fd4ff', e:'#eef4f5', m:'diag'},
  {n:'SAINT-JEAN',c:'#6a2fb8', d:'#ffd24a', e:'#eef4f5', m:'bande'},
  {n:'LA CRIÉE',  c:'#2fa84a', d:'#17202c', e:'#ffd24a', m:'avant'},
  {n:'ENDOUME',   c:'#f2c23a', d:'#17202c', e:'#c81e28', m:'pois'},
  {n:'LE FRIOUL', c:'#2a7fc4', d:'#f28b2a', e:'#eef4f5', m:'moitie'},
  {n:'PANIER',    c:'#e0553c', d:'#f6e2c0', e:'#2a4a6a', m:'cercles'},
  {n:'SORMIOU',   c:'#7a8c3a', d:'#1c2a16', e:'#e8d48a', m:'arriere'}
];

/* =====================================================================
   LES CINQ TRACES. Chacun son terrain, sa largeur et son caractere.
   large : la demi-largeur de piste. Etroite, le trace devient technique ;
   large, il pardonne et on y va plus fort.
   ===================================================================== */
var CI_CIRCUITS=[
 {cle:'port', nom:'LE PORT', sous:'LARGE ET ROULANT', ref:26000, large:23, mw:1040, mh:1300,
  theme:'port',
  /* le quai pave a l'entree du port, et la terre du terre-plein */
  surf:[{d:0.14,f:0.22,t:'pave'},{d:0.52,f:0.60,t:'terre'}],
  pts:[
   [500,130],[700,150],[840,260],[870,420],[800,530],[660,570],
   [690,700],[810,780],[860,920],[800,1070],[650,1150],[470,1160],
   [330,1090],[300,950],[380,850],[470,790],[420,680],[270,650],
   [190,520],[180,360],[260,220],[380,150]]},
 {cle:'corniche', nom:'LA CORNICHE', sous:'RAPIDE, FACE À LA MER', ref:19916, large:26, mw:1250, mh:980,
  theme:'mer',
  /* les embruns mouillent le bitume le long de la mer */
  surf:[{d:0.30,f:0.44,t:'mouille'},{d:0.76,f:0.82,t:'gravier'}],
  pts:[
   [240,180],[560,140],[900,170],[1080,300],[1090,520],[960,620],
   [700,600],[500,660],[430,790],[260,820],[150,700],[130,420]]},
 {cle:'calanques', nom:'LES CALANQUES', sous:'ÉTROIT ET CASSANT', ref:22684, large:19, mw:980, mh:1180,
  theme:'roche',
  /* une piste de terre entre deux calanques, et du gravier au bout */
  surf:[{d:0.18,f:0.30,t:'terre'},{d:0.58,f:0.64,t:'gravier'},{d:0.84,f:0.92,t:'terre'}],
  pts:[
   [420,120],[620,160],[700,300],[620,400],[700,520],[840,560],
   [860,720],[740,800],[760,950],[600,1040],[420,1020],[360,880],
   [460,790],[420,660],[260,640],[200,500],[280,380],[230,250],[300,150]]},
 {cle:'friche', nom:'LA FRICHE', sous:'MURS DE BÉTON', ref:21900, large:21, mw:1120, mh:1060,
  theme:'beton',
  /* la friche a garde ses paves et ses tas de gravier */
  surf:[{d:0.10,f:0.18,t:'pave'},{d:0.44,f:0.52,t:'gravier'},{d:0.70,f:0.78,t:'pave'}],
  pts:[
   [300,140],[760,130],[960,260],[980,460],[840,560],[880,720],
   [760,880],[520,920],[400,820],[460,660],[340,600],[180,640],
   [120,440],[160,260]]},
 {cle:'pinede', nom:'LA PINÈDE', sous:'SOUS LES PINS, LE SOIR', ref:24716, large:24, mw:1180, mh:1240,
  theme:'pins',
  /* sous les pins le bitume ne seche jamais, et un chemin de terre coupe */
  surf:[{d:0.22,f:0.34,t:'mouille'},{d:0.62,f:0.74,t:'terre'}],
  pts:[
   [380,150],[720,180],[900,320],[880,520],[720,600],[760,760],
   [900,880],[840,1060],[620,1120],[400,1060],[320,900],[440,800],
   [380,660],[200,620],[140,420],[200,250]]}
];

/* =====================================================================
   LES SURFACES. Une piste d'une seule matiere se conduit partout pareil,
   et un trace n'a alors de caractere que sa forme. Un passage en terre,
   un bac de gravier, un pont mouille : l'adherence change, ca se voit, et
   un virage connu redevient un probleme. C'est ce que fait Rush Rally,
   et c'est ce qui donne plus de caractere a un circuit qu'une couleur de
   fond.
     adh : ce qu'il reste d'adherence. tremble : la secousse au passage.
   ===================================================================== */
var CI_SURF={
  asphalte:{adh:1.00, tremble:0,    nom:'ASPHALTE'},
  pave:    {adh:0.90, tremble:0.22, nom:'PAV\u00c9S',  c:'#4d4a52', c2:'#5a5660'},
  terre:   {adh:0.74, tremble:0.14, nom:'TERRE',    c:'#6b4f33', c2:'#7d5e3e'},
  gravier: {adh:0.60, tremble:0.26, nom:'GRAVIER',  c:'#7b7466', c2:'#8d8574'},
  mouille: {adh:0.68, tremble:0,    nom:'MOUILL\u00c9', c:'#2b3340', c2:'#36404f'}
};

/* LE VOCABULAIRE DU CO-PILOTE. Un chiffre seul ne dit rien a qui n'a
   jamais fait de rallye ; un mot seul ne se lit pas a deux cents a
   l'heure. On donne les deux, et la COURBURE DE LA FLECHE par-dessus —
   c'est elle qu'on lit vraiment, du coin de l'oeil. */
/* LES SEUILS SORTENT DE LA MESURE, pas de l'idee qu'on se fait d'un
   virage. Premiere version calibree a vue : les Calanques rendaient neuf
   virages sur neuf notes « epingle », c'est-a-dire aucune information.
   On a releve la courbure maximale des quarante-et-un virages des cinq
   traces, puis coupe en six parts de taille voisine — chaque note
   designe ainsi une portion reelle du terrain. Les rayons qui en
   decoulent sont parlants pour une piste large de 38 a 52 pixels :
     1  rayon < 39 px   plus serre que la piste n'est large
     2  rayon < 46 px
     3  rayon < 60 px
     4  rayon < 86 px
     5  rayon < 218 px
     6  au-dela : une inflexion, pas un virage
   Et le profil obtenu colle a ce que chaque trace annonce : la Corniche
   n'a qu'un serre pour cinq longs, les Calanques six virages de note 1
   ou 2 sur neuf. */
var CI_NOTES=[
  {max:9.00, n:1, m:'\u00c9PINGLE',    c:'#ff4a3c'},
  {max:0.62, n:2, m:'TR\u00c8S SERR\u00c9', c:'#ff7a3c'},
  {max:0.52, n:3, m:'SERR\u00c9',      c:'#ffb04a'},
  {max:0.40, n:4, m:'MOYEN',      c:'#ffd24a'},
  {max:0.28, n:5, m:'LONG',       c:'#9fe86a'},
  {max:0.11, n:6, m:'L\u00c9GER',      c:'#7dff9a'}
];

/* LES CINQ TERRAINS. Les teintes seules font le climat : on reconnait
   un circuit avant d'avoir lu son nom. */
/* =====================================================================
   LES CINQ TERRAINS, EN CINQ TONS CHACUN
   ---------------------------------------------------------------------
   DEUX TONS NE FONT PAS UN SOL. L'ancienne version alternait deux verts
   par bandes horizontales : de pres on voyait les bandes, de loin un
   aplat, et dans les deux cas rien qui ressemble a du terrain. Cinq tons
   poses par un bruit doux et TRAMES entre eux — la matrice de Bayer,
   celle qu'on utilise depuis toujours en pixel art — donnent une surface
   qui vit sans jamais se repeter visiblement.
     sols   : du plus sombre au plus clair, pour le tramage
     touffe : la ponctuation du sol (herbe haute, cailloux, aiguilles)
   ===================================================================== */
var CI_THEMES={
  port:  {sols:['#1c4121','#224a28','#285430','#2f6038','#376c41'], touffe:'#4a8a52',
          bord:'#d8dde4',piste:'#3d4049',hors:'#8f7a4a',
          ciel:'#27512e',vib1:'#d23a2e',vib2:'#eceef2',ligne:'rgba(236,238,242,.22)'},
  mer:   {sols:['#6d7b3e','#788747','#839350','#8e9f5a','#99ab64'], touffe:'#b4c47a',
          bord:'#e6e9ee',piste:'#44474f',hors:'#cbb882',
          ciel:'#7f8f4a',vib1:'#d23a2e',vib2:'#eceef2',ligne:'rgba(240,242,246,.22)'},
  roche: {sols:['#8f8065','#9c8c70','#a9987b','#b6a487','#c3b094'], touffe:'#6f7a46',
          bord:'#eceef2',piste:'#4a4d55',hors:'#cfc0a0',
          ciel:'#aa9a7a',vib1:'#c83a2e',vib2:'#f2f4f8',ligne:'rgba(240,242,246,.24)'},
  beton: {sols:['#43474e','#4b4f56','#53585f','#5b6068','#636971'], touffe:'#7b8289',
          bord:'#d2d7de',piste:'#36393f',hors:'#6e737b',
          ciel:'#53585f',vib1:'#d8d23a',vib2:'#2a2d33',ligne:'rgba(230,232,238,.20)'},
  pins:  {sols:['#122518','#172d1d','#1c3522','#213d28','#27462e'], touffe:'#3a6b42',
          bord:'#c8cfd6',piste:'#33363d',hors:'#6b5a3a',
          ciel:'#1a3321',vib1:'#c83a2e',vib2:'#dde2e8',ligne:'rgba(220,226,234,.20)'}
};
/* la matrice de Bayer : l'ordre dans lequel on tranche entre deux tons */
var CI_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function CI_HEX(h){var n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}

MOTEUR.circuit={
  nom:'Le Circuit', sous:'VUE DE DESSUS · CHOISIS TON TRACÉ',
  /* LE PIXEL FIN. Le reste de la salle garde le gros pixel ; cette borne
     demande le point a point, parce que tout son interet est dans le
     detail du sol, des ombres et de la carrosserie. */
  vise:390, echMin:1, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:195, H:422,
            C:null, ligne:null, longueur:0, img:null, mini:null,
            iCir:0, iEcu:0, vign:null, bascule:0, glDx:0,
            x:0, y:0, a:0, vx:0, vy:0, idx:0,
            cible:0, volant:0, touche:false, gauche:false, droite:false,
            frein:false, glisse:0, gommes:[],
            tour:0, tms:0, total:0, meilleur:0, tours:[], mi:false,
            hors:0, secousse:0, fini:0, compte:0,
            trace:[], fant:null, fantI:0, fantNeuf:[], fantT:0,
            mot:'', motT:0, motGros:false, recs:{}, recNeuf:false,
            enPause:false, flash:0, pouss:[], camX:null, camY:null};
  },

  /* ---- la courbe qui passe par tous les points ---- */
  tracer:function(pts,PAS){
    /* LES POINTS DE CONTROLE SONT MIS A L'ECHELLE ICI, une fois pour
       toutes : les reecrire dans les cinq tableaux serait quatre-vingt-
       dix occasions de se tromper, et impossible a revenir en arriere. */
    var ech=(PAS===10)?1:CI_K;     /* les vignettes gardent leur taille */
    var n=pts.length, brut=[], i, k;
    for(i=0;i<n;i++){
      var p0=pts[(i-1+n)%n], p1=pts[i], p2=pts[(i+1)%n], p3=pts[(i+2)%n];
      p0=[p0[0]*ech,p0[1]*ech]; p1=[p1[0]*ech,p1[1]*ech];
      p2=[p2[0]*ech,p2[1]*ech]; p3=[p3[0]*ech,p3[1]*ech];
      for(k=0;k<24;k++){
        var u=k/24, u2=u*u, u3=u2*u;
        brut.push([
          0.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
          0.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)
        ]);
      }
    }
    /* RECHANTILLONNAGE A PAS CONSTANT. Sans lui, les lignes droites ont
       moins de points que les virages, et la detection de sortie serait
       plus lache la ou on va le plus vite. */
    var L=[], reste=0; PAS=PAS||4;
    L.push(brut[0]);
    for(i=0;i<brut.length;i++){
      var a=brut[i], b=brut[(i+1)%brut.length];
      var dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy), pos=reste;
      while(pos<d){ L.push([a[0]+dx*pos/d, a[1]+dy*pos/d]); pos+=PAS; }
      reste=pos-d;
    }
    for(i=0;i<L.length;i++){
      var av=L[(i+1)%L.length], ar=L[(i-1+L.length)%L.length];
      L[i][2]=Math.atan2(av[1]-ar[1], av[0]-ar[0]);
    }
    return L;
  },

  /* =====================================================================
     LE CARNET DU CO-PILOTE, ecrit une fois au chargement du trace.
     ---------------------------------------------------------------------
     On mesure, pour chaque point, de combien le cap tourne sur les six
     points suivants. Les plages ou ca depasse un seuil sont des virages ;
     le maximum atteint dans la plage donne la severite. Rien de plus — et
     c'est suffisant, parce qu'un co-pilote ne dit pas autre chose : de
     quel cote, a quel point, et dans combien.

     POURQUOI MESURER PLUTOT QU'ECRIRE A LA MAIN. Cinq traces font une
     soixantaine de virages ; les annoter a la main, c'est soixante
     occasions de se tromper, et tout est a refaire des qu'un point de
     controle bouge d'un pixel. Mesure, le carnet suit le trace.
     ===================================================================== */
  carnet:function(s){
    var L=s.ligne, n=L.length, i, c=[], V=[];
    for(i=0;i<n;i++){
      var a0=L[i][2], a1=L[(i+6)%n][2];
      c.push(Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0)));
    }
    var SEUIL=0.055, i0=-1, mx=0, sg=0;
    for(i=0;i<n;i++){
      var v=c[i], a=Math.abs(v);
      if(a>SEUIL){
        if(i0<0){i0=i;mx=0;sg=v>0?1:-1;}
        if(a>mx){mx=a;sg=v>0?1:-1;}
      }else if(i0>=0){
        /* un virage de moins de cinq points est un defaut de trace, pas
           un virage : l'annoncer ferait bavarder le co-pilote pour rien */
        if(i-i0>=5)V.push({i:i0, fin:i, mx:mx, sens:sg});
        i0=-1;
      }
    }
    if(i0>=0&&n-i0>=5)V.push({i:i0, fin:n-1, mx:mx, sens:sg});
    /* ON FUSIONNE CE QUI S'ENCHAINE. Deux courbes separees par trois
       points sont un seul virage pour celui qui conduit. */
    for(i=V.length-1;i>0;i--){
      if(V[i].i-V[i-1].fin<7&&V[i].sens===V[i-1].sens){
        V[i-1].fin=V[i].fin; V[i-1].mx=Math.max(V[i-1].mx,V[i].mx);
        V.splice(i,1);
      }
    }
    for(i=0;i<V.length;i++){
      var N=CI_NOTES[CI_NOTES.length-1];
      for(var k=0;k<CI_NOTES.length;k++)
        if(V[i].mx<CI_NOTES[k].max){ N=CI_NOTES[k]; }
      V[i].note=N;
    }
    s.virages=V;
    /* ---- la surface de chaque point ---- */
    s.surf=new Array(n);
    for(i=0;i<n;i++)s.surf[i]='asphalte';
    var P=s.C.surf||[];
    for(i=0;i<P.length;i++){
      var d=Math.floor(P[i].d*n), f=Math.floor(P[i].f*n);
      for(var j=d;j<f;j++)s.surf[((j%n)+n)%n]=P[i].t;
    }
  },

  /* le virage qui vient, et celui d'apres */
  devant:function(s){
    if(!s.virages||!s.virages.length)return null;
    var n=s.ligne.length, i, best=null, bd=1e9, suiv=null;
    for(i=0;i<s.virages.length;i++){
      var d=((s.virages[i].i-s.idx)%n+n)%n;
      if(d<bd){bd=d;best=i;}
    }
    if(best==null)return null;
    var V=s.virages[best];
    var dsuiv=s.virages[(best+1)%s.virages.length];
    var ecart=((dsuiv.i-V.fin)%n+n)%n;
    return {v:V, d:bd, suiv:(ecart<30?dsuiv:null)};
  },

  /* =====================================================================
     LE CIRCUIT PEINT UNE FOIS. Repeindre huit cents points de trace a
     chaque image coute cher pour un decor immobile, et surtout cela
     interdit les details — vibreurs, bacs, murs, arbres — qui font qu'on
     reconnait un endroit du circuit.
     ===================================================================== */
  peindre:function(s){
    var C=s.C, T=CI_THEMES[C.theme], L=s.ligne, i, p;
    var MW=C.mw*CI_K, MH=C.mh*CI_K, LG=C.large*CI_K;
    var cv=document.createElement('canvas'); cv.width=MW; cv.height=MH;
    var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
    function rond(x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
    function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}

    /* =====================================================================
       LE SOL, TRAME
       ---------------------------------------------------------------------
       ON ECRIT LES PIXELS DIRECTEMENT. Cinq millions de fillRect prendraient
       plusieurs secondes ; un seul ImageData rempli en boucle prend le
       dixieme. C'est ce qui rend le tramage abordable du tout.

       LE BRUIT EST DETERMINISTE, pas aleatoire : trois sinus de periodes
       differentes. Un bruit tire au hasard donne de la neige — chaque pixel
       independant de son voisin — alors qu'un terrain a des plages, des
       creux et des bosses. Et le TRAMAGE DE BAYER tranche entre deux tons
       voisins selon la position : c'est ce qui remplace un degrade par des
       pixels francs sans jamais faire de bandes.
       ===================================================================== */
    var TON=T.sols.map(CI_HEX), NT=TON.length;
    var dat=g.createImageData(MW,MH), px=dat.data, o=0;
    for(var y=0;y<MH;y++){
      for(var x=0;x<MW;x++){
        var b1=Math.sin(x*0.0155)*Math.cos(y*0.0135)
              +Math.sin((x+y)*0.0085)*0.6
              +Math.sin(x*0.045+y*0.035)*0.32;
        var v=(b1+1.95)/3.9*(NT-1);
        var k=Math.floor(v + (CI_BAYER[(y&3)*4+(x&3)]/16-0.5));
        k=k<0?0:(k>NT-1?NT-1:k);
        var c0=TON[k];
        px[o++]=c0[0]; px[o++]=c0[1]; px[o++]=c0[2]; px[o++]=255;
      }
    }
    g.putImageData(dat,0,0);
    /* LA PONCTUATION DU SOL : des touffes claires, posees par le meme
       bruit pour qu'elles se groupent au lieu de se disperser. */
    /* LES TOUFFES NE SE POSENT PAS SUR UNE GRILLE. Parcourir le sol de
       trois en trois les alignait en quadrillage : de loin on ne voyait
       plus l'herbe, on voyait le pas de la boucle. Chaque touffe est donc
       decalee de sa propre fraction, tiree du meme bruit que le reste —
       ce qui les groupe en plaques au lieu de les disperser. */
    var tf=CI_HEX(T.touffe);
    g.fillStyle='rgba('+tf[0]+','+tf[1]+','+tf[2]+',.55)';
    for(var ty=0;ty<MH;ty+=4){
      for(var tx=0;tx<MW;tx+=4){
        var bt=Math.sin(tx*0.021)*Math.cos(ty*0.019)+Math.sin((tx-ty)*0.013)*0.8;
        if(bt<1.04)continue;
        var ox2=al(tx*0.37+ty*1.7)*4, oy2=al(tx*1.9+ty*0.53)*4;
        g.fillRect(tx+ox2,ty+oy2,1,1);
        if(bt>1.5)g.fillRect(tx+ox2+1,ty+oy2+1,1,1);
      }
    }

    /* ---- CE QUE CHAQUE TERRAIN A EN PROPRE ---- */
    if(C.theme==='mer'){
      /* LA MER remplit le bord droit et le bas : c'est elle qui dit ou
         l'on est, et elle est la seule chose qu'on regarde en ligne
         droite. */
      var ml=MW-180;
      for(var y2=0;y2<MH;y2++){
        var ond=Math.sin(y2*0.07)*10;
        rect(ml+ond,y2,MW,1,((y2/9)|0)%2?'#1d5f86':'#1a5578');
      }
      for(i=0;i<260;i++){
        var wx=ml+40+al(i*3.3)*150, wy=al(i*7.1)*MH;
        rect(wx+Math.sin(wy*0.07)*10,wy,3+al(i*2.2)*5,1,'rgba(190,225,240,.5)');
      }
      for(i=0;i<40;i++){ var sx=ml-14+al(i*5.7)*18, sy=al(i*2.9)*MH;
        rect(sx+Math.sin(sy*0.07)*10,sy,10,2,'#e8dcb8'); }
    }
    if(C.theme==='roche'){
      /* DES FALAISES : des masses claires cernees d'ombre, posees loin
         de la piste. Elles donnent l'echelle et bouchent l'horizon. */
      for(i=0;i<46;i++){
        var rx=al(i*3.7)*MW, ry=al(i*8.3)*MH, rr=14+al(i*1.9)*26;
        var loin=true;
        for(var q=0;q<L.length;q+=6)
          if(Math.abs(L[q][0]-rx)<rr+LG+26&&Math.abs(L[q][1]-ry)<rr+LG+26){loin=false;break;}
        if(!loin)continue;
        rond(rx+3,ry+4,rr,'rgba(70,60,44,.5)');
        rond(rx,ry,rr,'#d6c9a8'); rond(rx-rr*0.25,ry-rr*0.25,rr*0.6,'#ece0c2');
      }
    }
    if(C.theme==='beton'){
      /* LA FRICHE : des dalles, des flaques et des traces de pneus — le
         sol raconte qu'on roule la ou d'autres ont roule avant. */
      for(i=0;i<MW;i+=46) rect(i,0,1,MH,'rgba(0,0,0,.16)');
      for(i=0;i<MH;i+=46) rect(0,i,MW,1,'rgba(0,0,0,.16)');
      for(i=0;i<30;i++){
        var fx=al(i*4.1)*MW, fy=al(i*6.7)*MH;
        rond(fx,fy,8+al(i*2.1)*14,'rgba(40,52,60,.35)');
      }
    }

    /* =====================================================================
       LA PISTE SE PEINT AU TRAIT, PAS AU POINTILLE
       ---------------------------------------------------------------------
       Elle etait faite de disques poses tous les huit pixels : des
       disques de dix de diametre espaces de huit ne se recouvrent qu'a
       peine, et la bordure ressemblait a un collier de perles. Un seul
       chemin ferme, parcouru une fois et trace avec une epaisseur et des
       bouts ronds, donne une bande continue — et coute moins cher que
       huit cents disques.

       LE BITUME EST FAIT DE SIX TRAITS CONCENTRIQUES, du plus large et
       sombre au plus etroit et clair : c'est un degrade lateral obtenu
       sans lire un seul pixel, et c'est lui qui creuse la piste.
       ===================================================================== */
    function chemin(dx,dy){
      g.beginPath();
      g.moveTo(L[0][0]+(dx||0), L[0][1]+(dy||0));
      for(var q=1;q<L.length;q++) g.lineTo(L[q][0]+(dx||0), L[q][1]+(dy||0));
      g.closePath();
    }
    function trait(w,c,dx,dy){
      g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.lineJoin='round';
      chemin(dx,dy); g.stroke();
    }
    var PI=CI_HEX(T.piste), BO=CI_HEX(T.bord), HR=CI_HEX(T.hors);
    function ton(C0,d){ return 'rgb('+Math.max(0,Math.min(255,C0[0]+d))+','+
      Math.max(0,Math.min(255,C0[1]+d))+','+Math.max(0,Math.min(255,C0[2]+d))+')'; }

    /* l'ombre portee de la piste, dans le meme sens que toutes les autres */
    trait((LG+10)*2,'rgba(8,14,10,.30)',4,5);
    /* les bacs : seulement par endroits, donc par segments */
    g.lineCap='round';
    for(i=0;i<L.length;i+=4){
      if(((i>>6)%7)!==0&&((i>>6)%7)!==3)continue;
      g.strokeStyle=T.hors; g.lineWidth=(LG+26)*2;
      g.beginPath(); g.moveTo(L[i][0],L[i][1]);
      g.lineTo(L[(i+4)%L.length][0],L[(i+4)%L.length][1]); g.stroke();
    }
    /* leur grain */
    for(i=0;i<L.length;i+=2){
      if(((i>>6)%7)!==0&&((i>>6)%7)!==3)continue;
      p=L[i];
      for(var gq=0;gq<4;gq++){
        var ga=al(i*2.7+gq*5.1)*6.283, gr=LG+6+al(i*1.3+gq*3.9)*20;
        rect(p[0]+Math.cos(ga)*gr,p[1]+Math.sin(ga)*gr,2,2,
             ton(HR,al(i*4.4+gq)>0.5?20:-18));
      }
    }
    /* la bordure, puis son liseré eclaire du cote de la lumiere */
    trait((LG+5)*2, T.bord);
    trait((LG+5)*2, 'rgba(255,255,255,.16)', -1,-1);
    trait((LG+5)*2, 'rgba(0,0,0,.14)', 1.5,1.5);
    /* LE BITUME EN SIX COUCHES : sombre et large dessous, clair et
       etroit dessus. La piste parait alors legerement bombee, et ses
       bords uses. */
    for(var cb=0;cb<6;cb++){
      var f=cb/5;
      trait(LG*2*(1-f*0.80), ton(PI, -16+Math.round(f*26)));
    }
    /* LA CORDE USEE : les trajectoires ont noirci l'interieur des
       virages. Ca se voit, et ca se suit. */
    g.lineCap='round';
    for(i=0;i<L.length;i+=2){
      var a0=L[i][2], a1=L[(i+10)%L.length][2];
      var dd=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0));
      if(Math.abs(dd)<0.04)continue;
      var sgc=dd>0?1:-1, nxc=Math.cos(a0+1.5708)*sgc, nyc=Math.sin(a0+1.5708)*sgc;
      g.strokeStyle='rgba(14,16,22,.13)'; g.lineWidth=LG*0.85;
      g.beginPath();
      g.moveTo(L[i][0]+nxc*LG*0.42, L[i][1]+nyc*LG*0.42);
      var p2=L[(i+2)%L.length], n2=p2[2];
      g.lineTo(p2[0]+Math.cos(n2+1.5708)*sgc*LG*0.42, p2[1]+Math.sin(n2+1.5708)*sgc*LG*0.42);
      g.stroke();
    }
    /* LES FISSURES : des traits qui suivent la piste, pas des points */
    g.lineWidth=1; g.strokeStyle='rgba(14,16,22,.5)';
    for(var fz=0;fz<Math.round(L.length/22);fz++){
      var i0f=Math.floor(al(fz*7.3)*L.length), w0f=(al(fz*3.1)*2-1)*(LG-6);
      var lonf=4+Math.floor(al(fz*5.7)*12);
      g.beginPath();
      for(var kf=0;kf<lonf;kf++){
        var pf=L[(i0f+kf)%L.length];
        var nxf=Math.cos(pf[2]+1.5708), nyf=Math.sin(pf[2]+1.5708);
        var wf=w0f+Math.sin(kf*0.6+fz)*4;
        if(kf===0)g.moveTo(pf[0]+nxf*wf,pf[1]+nyf*wf);
        else g.lineTo(pf[0]+nxf*wf,pf[1]+nyf*wf);
      }
      g.stroke();
    }
    /* =====================================================================
       LES VIBREURS, EN SEGMENTS JOINTIFS ET EN VOLUME
       ---------------------------------------------------------------------
       Des carres poses un par un laissaient des trous entre eux. On trace
       des bouts de bande le long du bord, en alternant rouge et blanc, et
       chaque dent recoit trois tons : une ombre dessous, un corps, un
       liseré eclaire dessus. A plat, ils avaient l'air de papier colle.
       ===================================================================== */
    g.lineCap='butt';
    for(i=0;i<L.length;i+=2){
      var b0=L[i][2], b1=L[(i+12)%L.length][2];
      var de=Math.atan2(Math.sin(b1-b0),Math.cos(b1-b0));
      if(Math.abs(de)<0.045)continue;
      var cc=(((i/10)|0)%2)?T.vib1:T.vib2, CB=CI_HEX(cc);
      var sn=de>0?-1:1;
      var p1v=L[i], p2v=L[(i+2)%L.length];
      var n1=Math.cos(p1v[2]+1.5708)*sn, m1=Math.sin(p1v[2]+1.5708)*sn;
      var n2=Math.cos(p2v[2]+1.5708)*sn, m2=Math.sin(p2v[2]+1.5708)*sn;
      /* LA BOUCLE NE S'APPELLE PLUS cv. Elle le faisait, et « cv » est
         deja le canvas du circuit, declare en haut de la fonction : var
         etant porte par toute la fonction, la troisieme dent de vibreur
         remplacait l'image par le nombre 3. La peinture se terminait sans
         erreur, et c'est drawImage qui se plaignait, trois cents lignes
         plus loin, de recevoir un nombre. Un nom reutilise dans une
         fonction longue ne previent jamais. */
      for(var kv=0;kv<3;kv++){
        var dec=[1.5,0,-1.6][kv], lw=[9,7,2.6][kv];
        g.strokeStyle=[ton(CB,-56),cc,ton(CB,46)][kv];
        g.lineWidth=lw;
        g.beginPath();
        g.moveTo(p1v[0]+n1*(LG+dec), p1v[1]+m1*(LG+dec));
        g.lineTo(p2v[0]+n2*(LG+dec), p2v[1]+m2*(LG+dec));
        g.stroke();
      }
    }
    /* LA LIGNE CENTRALE, en pointille use */
    g.lineCap='round'; g.strokeStyle=T.ligne; g.lineWidth=2.5;
    for(i=0;i<L.length;i+=10){
      if(((i/10)|0)%2)continue;
      g.beginPath();
      g.moveTo(L[i][0],L[i][1]);
      g.lineTo(L[(i+5)%L.length][0],L[(i+5)%L.length][1]);
      g.stroke();
    }
    /* ---- LA LIGNE DE DEPART, en damier ---- */
    var p0=L[0], aa=p0[2], nx2=Math.cos(aa+1.5708), ny2=Math.sin(aa+1.5708);
    for(var k2=-LG;k2<LG;k2+=4) for(var j2=0;j2<2;j2++)
      rect(p0[0]+nx2*k2-Math.cos(aa)*(j2*4-4), p0[1]+ny2*k2-Math.sin(aa)*(j2*4-4),4,4,
           (((k2/4)|0)+j2)%2?'#eceef2':'#1b1e26');
    /* le portique au-dessus de la ligne */
    rect(p0[0]+nx2*(LG+5)-2,p0[1]+ny2*(LG+5)-2,5,5,'#b8302e');
    rect(p0[0]-nx2*(LG+5)-2,p0[1]-ny2*(LG+5)-2,5,5,'#b8302e');

    /* ---- LES PANNEAUX DE DISTANCE avant chaque virage serre ---- */
    for(i=0;i<L.length;i+=4){
      var c0=L[i][2], c1=L[(i+14)%L.length][2];
      var dv=Math.abs(Math.atan2(Math.sin(c1-c0),Math.cos(c1-c0)));
      if(dv<0.30)continue;
      for(var m2=0;m2<3;m2++){
        var jj=(i-26-m2*13+L.length*2)%L.length, q0=L[jj];
        var px2=Math.cos(q0[2]+1.5708)*(LG+11), py2=Math.sin(q0[2]+1.5708)*(LG+11);
        rect(q0[0]+px2-3,q0[1]+py2-4,7,8,'#e8e8ec');
        rect(q0[0]+px2-2,q0[1]+py2-3,5,6,'#1b1e26');
        for(var b2=0;b2<=m2;b2++)rect(q0[0]+px2-1,q0[1]+py2-2+b2*2,3,1,'#e8e8ec');
      }
      i+=40;
    }

    /* ---- LE DECOR, par terrain ---- */
    function loinDeLaPiste(x,y,r){
      for(var q=0;q<L.length;q+=5)
        if(Math.abs(L[q][0]-x)<r+LG+22*CI_K&&Math.abs(L[q][1]-y)<r+LG+22*CI_K)return false;
      return true;
    }
    /* QUATRE TONS ET UNE OMBRE QUI VA DANS LE MEME SENS QUE TOUTES LES
       AUTRES. C'est l'unite de direction des ombres qui fait croire a
       une lumiere ; trois arbres eclaires chacun de son cote donnent un
       decor en papier decoupe. */
    function arbre(x,y,r,c1,c2,c3,c4){
      rond(x+r*0.42,y+r*0.50,r*1.02,'rgba(6,14,9,.40)');
      rond(x,y,r,c1);
      rond(x-r*0.16,y-r*0.16,r*0.80,c2);
      rond(x-r*0.32,y-r*0.32,r*0.52,c3);
      if(c4)rond(x-r*0.45,y-r*0.45,r*0.24,c4);
    }
    /* UNE PILE DE PNEUS : trois anneaux et un point. Minuscule, et c'est
       pourtant ce qui dit « circuit » plus surement qu'une barriere. */
    function pile(x,y){
      rond(x+3,y+4,7,'rgba(6,14,9,.38)');
      rond(x,y,7,'#191c23'); rond(x,y,5,'#23262f'); rond(x,y,3,'#2d313b');
      rond(x,y,1.6,'#c8382c');
    }
    /* UNE BARRIERE : des panneaux rouges et blancs, avec leur ombre */
    function barriere(x,y,an,n){
      for(var kb=0;kb<n;kb++){
        var bx=x+Math.cos(an)*kb*11, by=y+Math.sin(an)*kb*11;
        rect(bx+3,by+4,9,5,'rgba(6,14,9,.34)');
        var cb=(kb%2===0)?'#e8e8ec':'#c83a2e';
        rect(bx,by,9,5,cb);
        rect(bx,by,9,2,(kb%2===0)?'#ffffff':'#e2584a');
      }
    }
    function tribune(x,y,w,h){
      rect(x,y,w,h,'#4a4f5c'); rect(x,y,w,2,'#5f6676');
      for(var q=0;q<w-3;q+=4)
        rect(x+2+q,y+3,3,2,['#d8dde4','#c8a22a','#b8302e','#2a6a9a'][(q/4)%4]);
    }
    /* LES TRIBUNES SE POSENT AU BORD DE LA PISTE, jamais au milieu d'un
       champ : une masse grise a cent pixels du bitume ressemble a un
       rectangle oublie la. On les accroche donc a des points du trace. */
    for(var t2=0;t2<4;t2++){
      var ii=Math.floor(L.length*(0.04+t2*0.24)), q1=L[ii];
      var ux=Math.cos(q1[2]+1.5708), uy=Math.sin(q1[2]+1.5708);
      var sgn=(t2%2)?1:-1, dx2=ux*(LG+16)*sgn, dy2=uy*(LG+16)*sgn;
      if(Math.abs(ux)>Math.abs(uy)) tribune(q1[0]+dx2-(sgn>0?0:22),q1[1]+dy2-28,22,56);
      else tribune(q1[0]+dx2-28,q1[1]+dy2-(sgn>0?0:16),56,16);
    }
    var NB=(C.theme==='beton'?34:76)*2;
    for(i=0;i<NB;i++){
      var ax=al(i*3.1)*MW, ay=al(i*7.7)*MH, ar=(5+al(i*2.3)*7)*CI_K;
      if(C.theme==='mer'&&ax>MW-200)continue;
      if(!loinDeLaPiste(ax,ay,ar))continue;
      if(C.theme==='pins'){
        arbre(ax,ay,ar*1.15,'#0f2714','#17381d','#215029','#2e6c38');
        rect(ax-1,ay-1,3,3,'#3a2a18');
      } else if(C.theme==='roche'){
        arbre(ax,ay,ar*0.85,'#3c4c26','#4c6032','#5f7641','#748c52');
      } else if(C.theme==='mer'){
        /* un palmier : une tache claire et quatre palmes */
        rond(ax+2,ay+3,ar*0.8,'rgba(40,40,20,.4)');
        rect(ax-1,ay-1,2,3,'#6a5a30');
        for(var pa=0;pa<5;pa++){
          var an=pa/5*6.283;
          rect(ax+Math.cos(an)*ar*0.7-1,ay+Math.sin(an)*ar*0.7-1,3,3,'#3f7a3a');
        }
        rond(ax,ay,2,'#58a050');
      } else if(C.theme==='beton'){
        /* des conteneurs et des palettes : la friche a servi */
        var cw2=10+((i*7)%14), ch2=7+((i*5)%9);
        rect(ax+2,ay+2,cw2,ch2,'rgba(0,0,0,.35)');
        rect(ax,ay,cw2,ch2,['#2a6a9a','#b8302e','#1f7a68','#c8a22a','#6a3a8a'][i%5]);
        rect(ax,ay,cw2,1,'rgba(255,255,255,.22)');
        for(var v2=2;v2<cw2-1;v2+=3)rect(ax+v2,ay+1,1,ch2-2,'rgba(0,0,0,.18)');
      } else {
        arbre(ax,ay,ar,'#143a1b','#1d5226','#2a7033','#3e9148');
      }
    }
    /* =====================================================================
       CE QUI BORDE LA PISTE. Les piles de pneus et les barrieres se
       posent AU BORD, accrochees a des points du trace : un element de
       circuit pose au hasard dans un champ ne dit rien, le meme element
       colle au bitume dit qu'on est sur un circuit.
       ===================================================================== */
    for(var kp=0;kp<26;kp++){
      var ip=Math.floor(L.length*(kp/26)+al(kp*3.7)*20)%L.length;
      var pp=L[ip], np=al(kp*5.3);
      var ux2=Math.cos(pp[2]+1.5708), uy2=Math.sin(pp[2]+1.5708);
      var sg2=(kp%2)?1:-1, dd3=LG+10+al(kp*2.1)*6;
      if(np<0.42){
        pile(pp[0]+ux2*dd3*sg2, pp[1]+uy2*dd3*sg2);
        if(np<0.2)pile(pp[0]+ux2*(dd3+8)*sg2+4, pp[1]+uy2*(dd3+8)*sg2+4);
      }else if(np<0.72){
        barriere(pp[0]+ux2*(dd3+4)*sg2, pp[1]+uy2*(dd3+4)*sg2, pp[2], 3+((kp*3)%3));
      }
    }
    s.img=cv;

    /* ---- LE MINI-PLAN ---- */
    var mw=54, mh=Math.max(20,Math.round(54*MH/MW));
    var m=document.createElement('canvas'); m.width=mw; m.height=mh;
    var gm=m.getContext('2d'); gm.imageSmoothingEnabled=false;
    gm.fillStyle='rgba(8,11,17,.74)';gm.fillRect(0,0,mw,mh);
    for(i=0;i<L.length;i+=2){
      gm.fillStyle='#8fa6bc';
      gm.fillRect(Math.round(L[i][0]*mw/MW),Math.round(L[i][1]*mh/MH),2,2);
    }
    gm.fillStyle='#ffd24a';
    gm.fillRect(Math.round(L[0][0]*mw/MW)-1,Math.round(L[0][1]*mh/MH)-1,3,3);
    s.mini=m; s.miniW=mw; s.miniH=mh;
  },

  cadre:function(s,L,H){ s.L=L; s.H=H; s.vign=null; },

  /* =====================================================================
     L'ECRAN DE CHOIX. Il vient APRES le jeton, et c'est voulu : dans une
     salle d'arcade on met la piece, puis on choisit sa machine — c'est le
     moment ou l'on prend le temps de regarder, parce qu'on a deja paye.
     Le mettre avant obligerait a decider a vide, sans savoir si on va
     jouer.
     ===================================================================== */
  demarrer:function(s){
    if(!CI_ART)CI_ART=CI_SPRITE();
    s.phase='prep'; s.t=0; s.score=0; s.compte=0;
    s.recs={};
    try{ var o=JSON.parse(localStorage.getItem(CI_CLE)||'null'); if(o)s.recs=o; }catch(e){}
    s.iCir=0; s.iEcu=Math.floor(Math.random()*CI_ECURIES.length);
    try{ var d=localStorage.getItem(CI_CLE+'.choix');
         if(d){d=JSON.parse(d); if(d.c>=0&&d.c<CI_CIRCUITS.length)s.iCir=d.c;
               if(d.e>=0&&d.e<CI_ECURIES.length)s.iEcu=d.e;} }catch(e){}
    s.vign=null;
  },

  /* les vignettes des cinq traces, dessinees une fois */
  vignettes:function(s){
    if(s.vign)return s.vign;
    s.vign=CI_CIRCUITS.map(function(C,k){
      var L=MOTEUR.circuit.tracer(C.pts,10);
      var w=50, h=30, cv=document.createElement('canvas');
      cv.width=w;cv.height=h;
      var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
      var T=CI_THEMES[C.theme];
      g.fillStyle=T.sols[2];g.fillRect(0,0,w,h);
      var mx=1e9,my=1e9,Mx=-1e9,My=-1e9,i;
      for(i=0;i<L.length;i++){mx=Math.min(mx,L[i][0]);Mx=Math.max(Mx,L[i][0]);
                              my=Math.min(my,L[i][1]);My=Math.max(My,L[i][1]);}
      var ech=Math.min((w-8)/(Mx-mx),(h-8)/(My-my));
      for(i=0;i<L.length;i++){
        var px=Math.round(4+(L[i][0]-mx)*ech), py=Math.round(4+(L[i][1]-my)*ech);
        g.fillStyle=T.bord; g.fillRect(px-1,py-1,4,4);
      }
      for(i=0;i<L.length;i++){
        var qx=Math.round(4+(L[i][0]-mx)*ech), qy=Math.round(4+(L[i][1]-my)*ech);
        g.fillStyle=T.piste; g.fillRect(qx,qy,2,2);
      }
      g.fillStyle='#ffd24a';
      g.fillRect(Math.round(4+(L[0][0]-mx)*ech)-1,Math.round(4+(L[0][1]-my)*ech)-1,3,3);
      return cv;
    });
    return s.vign;
  },

  /* =====================================================================
     AVANT LE JETON. Un ecran a part, qui ne depend d'aucun circuit
     charge : la version precedente passait par chrome(), lequel lit le
     nom du trace choisi — qui n'existe pas encore a ce moment-la.
     ===================================================================== */
  ecranPret:function(s,L0,H0){
    if(!CI_ART)CI_ART=CI_SPRITE();
    G.save(); G.scale(CI_K,CI_K);
    var L=L0/CI_K, H=H0/CI_K;
    G.fillStyle='#0c0f16';G.fillRect(0,0,L,H);
    for(var y=0;y<H;y+=6) R(0,y,L,3,'#11151e');
    var cy=Math.round(H*0.50);
    for(var k=26;k>0;k--){
      var rr=k*3.4+6;
      G.fillStyle='rgba(255,240,200,0.022)';
      G.beginPath();G.ellipse(L/2,cy,rr,rr*0.62,0,0,7);G.fill();
    }
    /* une monoplace qui change toute seule : l'ecran d'attente montre
       ce qu'il y a dedans au lieu de le raconter */
    var ec=Math.floor(s.t/1400)%CI_ECURIES.length;
    var e=Math.max(2,Math.min(4,Math.floor(Math.min(H*0.34/(CI_H+10), L*0.62/CI_L))));
    G.save();G.translate(L/2+e,cy+e);G.scale(e,e);
    G.fillStyle='rgba(6,8,12,.45)';
    for(var j=0;j<CI_ART.length;j++){ var rw=CI_ART[j];
      for(var i=0;i<rw.length;i++) if(rw[i]!=='.')G.fillRect(i-CI_L/2,j-CI_H/2,1,1); }
    G.restore();
    G.save();G.translate(L/2,cy);G.scale(e,e);
    this.dessinerSprite(G,this.pal(ec),0,0,-Math.PI/2,null,false);
    G.restore();
    G.textAlign='center';
    G.font='bold 16px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText('LE CIRCUIT',L/2,Math.round(H*0.17));
    G.font='9px ui-monospace,monospace';G.fillStyle='#cfe4f2';
    G.fillText('CINQ TRAC\u00c9S, DOUZE MONOPLACES',L/2,Math.round(H*0.17)+20);
    G.font='8px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText('TU CHOISIS APR\u00c8S LE JETON',L/2,Math.round(H*0.82));
    G.fillText('TROIS TOURS \u00b7 ON GARDE LE MEILLEUR',L/2,Math.round(H*0.82)+12);
    G.restore();
  },

  /* =====================================================================
     LE PADDOCK. Les rectangles sont calcules au meme endroit pour le
     dessin et pour le doigt : deux calculs separes finissent toujours
     par diverger d'un pixel, et le bouton ne repond plus la ou il est.
     Tout s'empile depuis le bas, ou la place manque — une mise en page
     posee en fractions d'une hauteur supposee se replie mal des que
     l'ecran n'a pas la taille prevue.
     ===================================================================== */
  zones:function(s){
    /* le meme repere que le chrome : c'est la seule facon que le doigt
       tombe exactement la ou le bouton est dessine */
    var L=s.L/CI_K, H=s.H/CI_K, z={};
    z.yTitre=12;
    z.band={x:5, y:22, w:L-10, h:38};
    z.bandG={x:5, y:22, w:26, h:38};
    z.bandD={x:L-31, y:22, w:26, h:38};
    z.pastC=[]; var pw=9, tot=CI_CIRCUITS.length*pw, x0=Math.round((L-tot)/2);
    for(var i=0;i<CI_CIRCUITS.length;i++)
      z.pastC.push({x:x0+i*pw, y:64, w:pw-2, h:8, i:i});
    z.go={x:Math.round(L*0.16), y:H-46, w:Math.round(L*0.68), h:24};
    z.pastE=[]; var ew=8, tE=CI_ECURIES.length*ew, xE=Math.round((L-tE)/2);
    var yPast=z.go.y-12;
    for(var j=0;j<CI_ECURIES.length;j++)
      z.pastE.push({x:xE+j*ew, y:yPast-3, w:ew-2, h:9, i:j});
    z.plaque={x:24, y:yPast-38, w:L-48, h:32};
    /* la scene de la voiture occupe tout ce qui reste entre les pastilles
       de trace et la plaque : c'est elle qui respire quand l'ecran est
       grand, et elle seule qui se tasse quand il est petit */
    z.scene={x:0, y:78, w:L, h:z.plaque.y-84};
    z.cy=Math.round(z.scene.y+z.scene.h/2);
    z.ecuG={x:0, y:z.scene.y, w:Math.round(L*0.26), h:z.scene.h};
    z.ecuD={x:L-Math.round(L*0.26), y:z.scene.y, w:Math.round(L*0.26), h:z.scene.h};
    /* l'echelle de la monoplace se deduit de la place disponible : a
       quatre fois sa taille elle debordait sur les petits ecrans */
    z.ech=Math.max(2,Math.min(4,Math.floor(Math.min(z.scene.h/(CI_H+10), L*0.62/CI_L))));
    return z;
  },

  tourne:function(s,quoi,sens){
    if(quoi==='c'){ s.iCir=(s.iCir+sens+CI_CIRCUITS.length)%CI_CIRCUITS.length; }
    else { s.iEcu=(s.iEcu+sens+CI_ECURIES.length)%CI_ECURIES.length; }
    s.bascule=12;
  },

  ecranChoix:function(s,L0,H0){
    if(!CI_ART)CI_ART=CI_SPRITE();
    G.save(); G.scale(CI_K,CI_K);
    var L=L0/CI_K, H=H0/CI_K;
    var V=this.vignettes(s), z=this.zones(s), i, r;
    var C=CI_CIRCUITS[s.iCir], E=CI_ECURIES[s.iEcu], T=CI_THEMES[C.theme];

    /* ---- LE SOL DU GARAGE ---- */
    G.fillStyle='#0c0f16';G.fillRect(0,0,L,H);
    for(var y=0;y<H;y+=6) R(0,y,L,3,'#11151e');
    /* LE PROJECTEUR. Une dizaine d'ellipses de plus en plus petites et
       a peine opaques : c'est ce qui fait qu'on regarde la voiture et
       non le menu autour. */
    var cy=z.cy;
    for(var k=26;k>0;k--){
      var rr=k*3.4+6;
      G.fillStyle='rgba(255,240,200,0.022)';
      G.beginPath();G.ellipse(L/2,cy,rr,rr*0.62,0,0,7);G.fill();
    }

    G.textAlign='center';
    G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText('LE CIRCUIT',L/2,z.yTitre);

    /* ---- LE BANDEAU DU TRACE ---- */
    r=z.band;
    R(r.x,r.y,r.w,r.h,'rgba(255,255,255,.06)');
    R(r.x,r.y,r.w,1,'rgba(255,255,255,.22)');R(r.x,r.y+r.h-1,r.w,1,'rgba(255,255,255,.12)');
    R(r.x,r.y,1,r.h,'rgba(255,255,255,.12)');R(r.x+r.w-1,r.y,1,r.h,'rgba(255,255,255,.12)');
    G.drawImage(V[s.iCir],r.x+4,r.y+4);
    G.textAlign='left';
    G.font='bold 8px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText(C.nom,r.x+60,r.y+13);
    G.font='7px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText(C.sous,r.x+60,r.y+23);
    var rc=s.recs[C.cle];
    G.fillStyle=rc?'#7dff9a':'#5d6e80';
    G.fillText(rc?('RECORD '+this.mmss(rc.t)):'JAMAIS COURU',r.x+60,r.y+33);
    G.textAlign='center';
    G.font='bold 10px ui-monospace,monospace';G.fillStyle='rgba(255,210,74,.75)';
    G.fillText('‹',z.bandG.x+9,r.y+24);
    G.fillText('›',z.bandD.x+17,r.y+24);
    for(i=0;i<z.pastC.length;i++){ r=z.pastC[i];
      R(r.x,r.y+2,r.w,3,i===s.iCir?'#ffd24a':'rgba(255,255,255,.26)'); }

    /* ---- LA MONOPLACE, EN GRAND ---- */
    var e=z.ech;
    /* les deux voisines, en retrait et sombres : on voit qu'il y en a
       d'autres sans qu'elles volent l'attention */
    var gv=(s.iEcu-1+CI_ECURIES.length)%CI_ECURIES.length;
    var dv=(s.iEcu+1)%CI_ECURIES.length;
    G.globalAlpha=0.16;
    this.dessinerSprite(G,this.pal(gv),10,cy,-Math.PI/2,null,false);
    this.dessinerSprite(G,this.pal(dv),L-10,cy,-Math.PI/2,null,false);
    G.globalAlpha=1;
    /* l'ombre portee, puis la voiture */
    G.save();G.translate(L/2+e,cy+e);G.scale(e,e);
    G.fillStyle='rgba(6,8,12,.45)';
    for(var j2=0;j2<CI_ART.length;j2++){ var rw=CI_ART[j2];
      for(var i2=0;i2<rw.length;i2++) if(rw[i2]!=='.')
        G.fillRect(i2-CI_L/2,j2-CI_H/2,1,1); }
    G.restore();
    G.save();G.translate(L/2,cy);G.scale(e,e);
    this.dessinerSprite(G,this.pal(s.iEcu),0,0,-Math.PI/2,null,false);
    G.restore();
    /* LE REFLET QUI BALAYE. Une bande claire qui descend lentement sur
       la carrosserie : trois lignes de code, et la voiture cesse d'etre
       une image collee pour devenir un objet pose sous une lampe. */
    var hs=CI_H*e, ys=cy-hs/2;
    var br=((s.t*0.045)%(hs+40))-20;
    G.save();
    G.beginPath();G.rect(L/2-CI_L*e/2,ys,CI_L*e,hs);G.clip();
    G.fillStyle='rgba(255,255,255,.10)';
    G.fillRect(L/2-CI_L*e/2,ys+br,CI_L*e,Math.max(2,e));
    G.fillStyle='rgba(255,255,255,.05)';
    G.fillRect(L/2-CI_L*e/2,ys+br+e,CI_L*e,Math.max(2,e*2));
    G.restore();
    /* les fleches, sur les cotes */
    G.textAlign='center';
    G.font='bold 15px ui-monospace,monospace';G.fillStyle='rgba(255,255,255,.62)';
    G.fillText('‹',10,cy+5);
    G.fillText('›',L-10,cy+5);

    /* ---- LA PLAQUE DE L'ECURIE ---- */
    r=z.plaque;
    R(r.x,r.y,r.w,r.h,'rgba(255,255,255,.07)');
    R(r.x,r.y,r.w,1,'#78e0ff');R(r.x,r.y+r.h-1,r.w,1,'#78e0ff');
    R(r.x,r.y,1,r.h,'#78e0ff');R(r.x+r.w-1,r.y,1,r.h,'#78e0ff');
    R(r.x+4,r.y+4,6,r.h-8,E.c);
    R(r.x+4,r.y+4,6,7,E.e);
    R(r.x+4,r.y+r.h-11,6,7,E.d);
    G.textAlign='left';
    G.font='bold 11px ui-monospace,monospace';G.fillStyle='#ffffff';
    G.fillText(E.n,r.x+16,r.y+14);
    G.font='7px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText('N° '+(s.iEcu+1)+'  ·  '+CI_NOMS_MOTIF[E.m],r.x+16,r.y+25);
    for(i=0;i<z.pastE.length;i++){ r=z.pastE[i];
      R(r.x,r.y+3,r.w,3,i===s.iEcu?'#78e0ff':'rgba(255,255,255,.24)'); }

    /* ---- EN PISTE ---- */
    r=z.go;
    R(r.x,r.y,r.w,r.h,'rgba(255,210,74,.18)');
    R(r.x,r.y,r.w,1,'#ffd24a');R(r.x,r.y+r.h-1,r.w,1,'#ffd24a');
    R(r.x,r.y,1,r.h,'#ffd24a');R(r.x+r.w-1,r.y,1,r.h,'#ffd24a');
    G.textAlign='center';
    G.font='bold 11px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText('EN PISTE',L/2,r.y+r.h/2+4);
    G.font='6px ui-monospace,monospace';G.fillStyle='#7f93a8';
    G.fillText('TOUCHE ‹ OU › POUR CHANGER',L/2,H-14);
    G.fillText('GAUCHE / DROITE POUR BRAQUER · LES DEUX : FREIN',L/2,H-5);
    G.restore();
  },

  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='prep')return;
    /* le doigt arrive dans le repere de la scene ; les zones sont dans
       celui du chrome, deux fois plus petit */
    x/=CI_K; y/=CI_K;
    var z=this.zones(s), i, r;
    function dans(q){ return x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h; }
    if(dans(z.go)){ this.enPiste(s); return; }
    /* LES PASTILLES D'ABORD : elles sont posees sur les bandes de
       defilement, et c'est l'acces direct qui doit gagner. */
    for(i=0;i<z.pastC.length;i++) if(dans(z.pastC[i])){ s.iCir=i; s.bascule=12; return; }
    for(i=0;i<z.pastE.length;i++) if(dans(z.pastE[i])){ s.iEcu=i; s.bascule=12; return; }
    if(dans(z.bandG)){ this.tourne(s,'c',-1); return; }
    if(dans(z.bandD)){ this.tourne(s,'c', 1); return; }
    /* LE BANDEAU ENTIER CHANGE DE TRACE : viser une fleche de huit
       pixels au pouce est une epreuve, et rien d'autre ne se trouve la. */
    if(dans(z.band)){ this.tourne(s,'c', x<z.band.x+z.band.w/2?-1:1); return; }
    if(dans(z.ecuG)){ this.tourne(s,'e',-1); return; }
    if(dans(z.ecuD)){ this.tourne(s,'e', 1); return; }
    if(dans(z.scene)){ this.tourne(s,'e', x<s.L/CI_K/2?-1:1); return; }
  },
  /* LE GLISSEMENT MARCHE AUSSI : c'est le geste qu'on essaie d'abord
     devant une rangee d'objets, et il ne coute que quelques lignes. */
  glisse:function(s,x,y,dx,dy){
    if(s.phase!=='prep')return;
    y/=CI_K;
    s.glDx=(s.glDx||0)+dx/CI_K;
    if(Math.abs(s.glDx)<26)return;
    var z=this.zones(s), sens=s.glDx>0?-1:1;
    s.glDx=0;
    if(y>=z.band.y&&y<=z.band.y+z.band.h)this.tourne(s,'c',sens);
    else if(y>=z.scene.y&&y<=z.scene.y+z.scene.h)this.tourne(s,'e',sens);
  },
  relache:function(s,x,y){ s.glDx=0; },

  enPiste:function(s){
    var C=CI_CIRCUITS[s.iCir];
    s.C=C;
    s.ligne=this.tracer(C.pts,4*CI_K);
    s.longueur=s.ligne.length*4*CI_K;
    this.carnet(s);
    this.peindre(s);
    try{localStorage.setItem(CI_CLE+'.choix',JSON.stringify({c:s.iCir,e:s.iEcu}));}catch(e){}
    var p=s.ligne[0];
    s.phase='jeu'; s.t=0;
    s.x=p[0]; s.y=p[1]; s.a=p[2]; s.vx=0; s.vy=0; s.idx=0;
    s.cible=0;s.volant=0;s.touche=false;s.gauche=s.droite=s.frein=false;
    s.tour=1;s.tms=0;s.total=0;s.meilleur=0;s.tours=[];s.mi=false;
    s.hors=0;s.secousse=0;s.fini=0;s.flash=0;s.pouss=[];s.gommes=[];
    s.glisse=0;s.camX=null;s.camY=null;s.recNeuf=false;
    s.fantNeuf=[];s.fantT=0;s.fantI=0;
    s.fant=(s.recs[C.cle]&&s.recs[C.cle].f)?s.recs[C.cle].f:null;
    s.rec=(s.recs[C.cle]&&s.recs[C.cle].t)?s.recs[C.cle].t:0;
    this.dire(s,C.nom,true);
    if(typeof monterActions==='function')monterActions();
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1600:1000;s.motGros=!!gros;},

  /* ================= LE VOLANT ================= */
  doigts:function(s,PTS){
    var somme=0, g=false, d=false, n=0;
    for(var k in PTS){
      if(!PTS.hasOwnProperty(k))continue;
      var f=(PTS[k].x-s.L/2)/(s.L/2);
      f=Math.max(-1,Math.min(1,f));
      var MORT=0.13;
      if(Math.abs(f)<MORT)f=0; else f=(f-(f>0?MORT:-MORT))/(1-MORT);
      somme+=f; n++;
      if(PTS[k].x<s.L/2)g=true; else d=true;
    }
    s.cible=Math.max(-1,Math.min(1,somme));
    s.gauche=g; s.droite=d; s.frein=(g&&d); s.touche=(n>0);
    if(s.enPause&&n)s.enPause=false;
  },
  presse:function(s,x,y){ if(s.enPause)s.enPause=false; },
  leve:function(s){},

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.secousse>0)s.secousse=Math.max(0,s.secousse-dt*0.004);
    var i;
    for(i=s.pouss.length-1;i>=0;i--){
      var q=s.pouss[i]; q.vie-=dt; q.x+=q.vx*dt; q.y+=q.vy*dt;
      if(q.vie<=0)s.pouss.splice(i,1);
    }
    for(i=s.gommes.length-1;i>=0;i--){
      s.gommes[i].vie-=dt; if(s.gommes[i].vie<=0)s.gommes.splice(i,1);
    }
    if(s.phase==='prep')return;
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }
    dt=Math.min(34,dt);
    /* LES VITESSES SUIVENT L'ECHELLE : le monde a double, donc parcourir
       la meme fraction de circuit dans le meme temps demande d'aller deux
       fois plus vite en pixels par milliseconde. */
    var ACC=0.00042*CI_K, FREIN=0.00075*CI_K, VMAX=0.235*CI_K, LG=s.C.large*CI_K;
    var dirx=Math.cos(s.a), diry=Math.sin(s.a);
    var v=Math.hypot(s.vx,s.vy);

    /* LE VOLANT TOURNE, IL NE SAUTE PAS. Il rejoint sa consigne en un
       dixieme de seconde, et se REDRESSE plus vite qu'il ne braque —
       comme un vrai volant qu'on lache, et parce que c'est ce qui sauve
       d'un tete-a-queue quand on panique et qu'on retire les pouces. */
    var vitV=(Math.abs(s.cible)>Math.abs(s.volant)?0.0115:0.0190);
    s.volant+=(s.cible-s.volant)*Math.min(1,vitV*dt);
    if(Math.abs(s.volant)<0.004)s.volant=0;

    var surHerbe=(s.hors>0);
    var SU0=CI_SURF[(s.surf&&s.surf[s.idx])||'asphalte']||CI_SURF.asphalte;
    /* LE FREIN CHARGE L'AVANT : on tourne plus court au frein. C'est ce
       qu'un pilote fait et qu'un jeu oublie presque toujours de rendre. */
    if(s.volant){
      var eff=Math.min(1,v/0.05)*(1-Math.min(0.46,v/VMAX*0.46));
      if(s.frein)eff*=1.38;
      s.a+=s.volant*0.0052*eff*dt;
    }
    if(s.frein){
      s.vx-=s.vx*FREIN/Math.max(0.02,v)*dt*0.9;
      s.vy-=s.vy*FREIN/Math.max(0.02,v)*dt*0.9;
    }else{
      var acc=ACC*(1-v/VMAX)*(surHerbe?0.62:(0.72+0.28*SU0.adh));
      s.vx+=dirx*acc*dt; s.vy+=diry*acc*dt;
    }
    var perp=-s.vx*diry+s.vy*dirx;
    /* LA SURFACE SOUS LES ROUES. Le gravier ne rend que soixante pour
       cent de l'adherence, la terre soixante-quatorze, le mouille
       soixante-huit : un virage pris au meme rythme qu'au tour d'avant ne
       passe plus, et c'est tout l'interet. */
    var SU=CI_SURF[(s.surf&&s.surf[s.idx])||'asphalte']||CI_SURF.asphalte;
    s.surfCo=SU;
    var grip=(surHerbe?0.0042:(s.frein?0.0134:0.0118))*SU.adh;
    if(SU.tremble&&v>0.06&&s.secousse<SU.tremble)s.secousse=SU.tremble;
    /* LE CONTRE-BRAQUAGE RATTRAPE : sans lui, une glisse est une
       condamnation et la seule strategie est de ne jamais attaquer. */
    if(s.volant*perp<-0.0035)grip*=1.42;
    var corr=Math.min(1,grip*dt);
    s.vx+=diry*perp*corr; s.vy-=dirx*perp*corr;
    s.glisse+=(Math.abs(perp)-s.glisse)*Math.min(1,0.006*dt);
    if(Math.abs(perp)>0.050&&Math.random()<0.55)
      s.pouss.push({x:s.x-dirx*8*CI_K,y:s.y-diry*8*CI_K,vx:(Math.random()-0.5)*0.01*CI_K,
                    vy:(Math.random()-0.5)*0.01*CI_K,vie:420,
                    c:surHerbe?'#6f8a4e':'#b9bec8'});
    if(!surHerbe&&Math.abs(perp)>0.042){
      var gx=-diry*7*CI_K, gy=dirx*7*CI_K, bx=s.x-dirx*9*CI_K, by=s.y-diry*9*CI_K;
      s.gommes.push({x:bx+gx,y:by+gy,vie:3000});
      s.gommes.push({x:bx-gx,y:by-gy,vie:3000});
      if(s.gommes.length>520)s.gommes.splice(0,80);
    }
    var frot=Math.pow(surHerbe?0.9975:0.99935,dt);
    s.vx*=frot; s.vy*=frot;
    s.x+=s.vx*dt; s.y+=s.vy*dt;

    /* OU EST-ON. On balaye une fenetre autour du dernier index connu :
       huit cents comparaisons pour un deplacement de trois pixels
       seraient du gaspillage. */
    var L=s.ligne, n=L.length, best=s.idx, bd=1e9;
    for(var k=-26;k<=26;k++){
      var j=((s.idx+k)%n+n)%n;
      var dx=L[j][0]-s.x, dy=L[j][1]-s.y, d2=dx*dx+dy*dy;
      if(d2<bd){bd=d2;best=j;}
    }
    if((((best-s.idx)%n+n)%n)<n/2)s.idx=best;
    var ecart=Math.sqrt(bd);
    s.hors=(ecart>LG)?1:0;
    if(ecart>LG&&s.secousse<0.3)s.secousse=0.3;
    /* LA LIMITE DU MONDE ne tue que ce qui POUSSE VERS LE DEHORS : la
       composante le long du bord est conservee, donc la voiture glisse
       contre la limite au lieu de s'y coller. */
    if(ecart>LG+42){
      var px=L[s.idx][0], py=L[s.idx][1];
      var ux=(s.x-px)/ecart, uy=(s.y-py)/ecart;
      s.x=px+ux*(LG+42); s.y=py+uy*(LG+42);
      var sortant=s.vx*ux+s.vy*uy;
      if(sortant>0){ s.vx-=ux*sortant*1.25; s.vy-=uy*sortant*1.25; }
      s.vx*=0.92; s.vy*=0.92;
      if(s.secousse<0.6)s.secousse=0.6;
    }

    s.tms+=dt; s.total+=dt;
    if(s.idx>n*0.45&&s.idx<n*0.62)s.mi=true;
    if(s.mi&&s.idx<n*0.06&&s.tms>4000)this.boucler(s);

    if(!s.fantT||s.t-s.fantT>40){
      s.fantT=s.t;
      s.fantNeuf.push([Math.round(s.x),Math.round(s.y),Math.round(s.a*100)/100]);
    }
    if(s.fant)s.fantI=Math.min(s.fant.length-1,Math.floor(s.tms/40));
  },

  boucler:function(s){
    var t=s.tms, cle=s.C.cle;
    s.tours.push(t);
    if(!s.meilleur||t<s.meilleur){
      s.meilleur=t;
      if(!s.rec||t<s.rec){
        s.rec=t; s.recNeuf=true;
        s.fant=s.fantNeuf.slice();
        s.recs[cle]={t:s.rec,f:s.fant};
        try{localStorage.setItem(CI_CLE,JSON.stringify(s.recs));}catch(e){}
      }
      this.dire(s,'MEILLEUR TOUR · '+this.mmss(t),true);
      s.flash=400;
    }else{
      this.dire(s,'TOUR '+s.tour+' · '+this.mmss(t),true);
    }
    s.tour++; s.tms=0; s.mi=false; s.fantNeuf=[]; s.fantI=0;
    if(s.tour>CI_TOURS){
      s.phase='arrive'; s.fini=1900;
      this.dire(s,'ARRIVÉE · '+this.mmss(s.total),true);
    }
  },

  mmss:function(ms){
    var m=Math.floor(ms/60000), r=(ms-m*60000)/1000;
    return (m>0?(m+':'+(r<10?'0':'')):'')+r.toFixed(2);
  },

  fin:function(s){
    s.phase='fini';
    /* =====================================================================
       LE SCORE EST NORMALISE PAR TRACE, et c'est indispensable des qu'il
       y en a plus d'un. Mesure faite, le meme pilote boucle la Corniche
       en 19,9 secondes et le Port en 26 : sans correction, le tableau du
       port recompenserait le circuit le plus court au lieu du meilleur
       pilotage, tout le monde courrait la Corniche, et les quatre autres
       traces ne serviraient plus a rien.

       Chaque trace porte donc son temps de reference — celui qu'y met un
       pilote-robot honnete — et le chrono est ramene a l'echelle du Port
       avant d'etre compte. Un tour egal a la reference vaut 3 500 points
       partout ; une seconde gagnee en vaut autant sur les Calanques que
       sur la Corniche. On choisit alors son circuit pour celui qu'on
       aime, pas pour celui qui paie.

       LE SCORE VIENT DU MEILLEUR TOUR, pas du total : le total punirait
       une sortie deux fois, dans le tour et dans le classement. */
    var eq=s.meilleur*26000/(s.C.ref||26000);
    s.score=s.meilleur?Math.max(0,Math.round((40000-eq)/4)):0;
    if(typeof monterActions==='function')monterActions();
    if(typeof finirPartie==='function')finirPartie(s.score);
  },

  actions:function(s){
    if(!s||s.phase==='pret')
      return '<button class="pr" data-a="commencer">COMMENCER</button>';
    if(s.phase==='fini')
      return '<button data-a="menu">LE MENU</button>'+
             '<button class="pr" data-a="rejouer">ENCORE · 1 €</button>';
    return '';
  },
  action:function(s,a){ if(a==='menu'&&typeof mnuOuvrir==='function')mnuOuvrir(); },

  /* =====================================================================
     LE DESSIN
     ===================================================================== */
  /* LA LIVREE S'APPLIQUE AU PIXEL. Le motif decide, pour chaque point de
     carrosserie, s'il prend la teinte principale ou celle du motif —
     c'est ce qui fait douze voitures au lieu de douze nuances. */
  /* eclaircir et assombrir une teinte, pour le volume */
  ton:function(h,f){
    var n=parseInt(h.slice(1),16), r=(n>>16)&255, v=(n>>8)&255, b=n&255;
    function m(x){ return Math.max(0,Math.min(255,Math.round(f>0?x+(255-x)*f:x*(1+f)))); }
    return 'rgb('+m(r)+','+m(v)+','+m(b)+')';
  },
  pal:function(ec){
    var E=CI_ECURIES[ec%CI_ECURIES.length], M=this;
    var memo={};
    return {E:E, mot:CI_MOTIFS[E.m]||CI_MOTIFS.uni,
      clair:function(h){ return memo['c'+h]||(memo['c'+h]=M.ton(h, 0.22)); },
      sombre:function(h){ return memo['s'+h]||(memo['s'+h]=M.ton(h,-0.32)); },
      fixe:{'K':'#101219','n':'#4a4e5b','o':'#2e323c','N':'#1b1e26',
            'W':'#f2f1ea','w':'#ffffff','B':'#6ab4e8','G':'#5a5f6e',
            'g':'#8a90a0','S':'#9aa0ae','e':E.e}};
  },
  dessinerSprite:function(g,P,ex,ey,ang,alp,ombre){
    g.save();
    g.translate(Math.round(ex),Math.round(ey));
    /* LE SPRITE POINTE VERS LE HAUT et l'angle zero vers la droite :
       d'ou le quart de tour. Sans lui, la voiture roule en crabe. */
    g.rotate(ang+Math.PI/2);
    if(alp!=null)g.globalAlpha=alp;
    var j,i,row,ch;
    if(ombre){
      g.fillStyle='rgba(8,10,14,.38)';
      for(j=0;j<CI_ART.length;j++){ row=CI_ART[j];
        for(i=0;i<row.length;i++) if(row[i]!=='.')
          g.fillRect(i-CI_L/2+2,j-CI_H/2+2,1,1); }
    }
    for(j=0;j<CI_ART.length;j++){
      row=CI_ART[j];
      for(i=0;i<row.length;i++){
        ch=row[i]; if(ch==='.')continue;
        var c=P.fixe[ch];
        if(c===undefined){
          /* LE MOTIF DECIDE DE LA TEINTE, LE PROFIL DECIDE DU TON. Un
             pixel de carrosserie connait donc deux choses : s'il
             appartient au motif, et ou il se trouve sur la courbe. */
          var base=P.mot(i,j)?P.E.d:P.E.c;
          c = (ch==='C')?P.clair(base) : (ch==='D')?P.sombre(base) : base;
        }
        if(c){g.fillStyle=c;g.fillRect(i-CI_L/2,j-CI_H/2,1,1);}
      }
    }
    g.restore();
  },
  voiture:function(s,ex,ey,ang,ec,alp){
    if(!CI_ART)CI_ART=CI_SPRITE();
    this.dessinerSprite(G,this.pal(ec),ex,ey,ang,alp,alp==null);
  },

  dessine:function(s,L,H){
    /* LE PADDOCK N'APPARTIENT QU'A LA PHASE DE PREPARATION. La condition
       disait « ou bien il n'y a pas encore d'image » — ce qui est vrai
       AVANT le jeton : on voyait donc le paddock et son bouton EN PISTE
       pendant que le shell affichait COMMENCER en dessous. Deux boutons,
       dont un seul marche. */
    if(s.phase==='prep'){ this.ecranChoix(s,L,H); return; }
    if(!s.img){ this.ecranPret(s,L,H); return; }
    var sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.6:0;
    /* LA CAMERA REGARDE D'AUTANT PLUS LOIN QU'ON VA VITE. A distance
       fixe, on arrivait sur les virages rapides sans les avoir vus. */
    var vv=Math.hypot(s.vx,s.vy), dev=(28+vv*210/CI_K)*CI_K;
    var ax=s.x+Math.cos(s.a)*dev, ay=s.y+Math.sin(s.a)*dev;
    s.camX=(s.camX==null)?ax:s.camX+(ax-s.camX)*0.14;
    s.camY=(s.camY==null)?ay:s.camY+(ay-s.camY)*0.14;
    var MW=s.C.mw*CI_K, MH=s.C.mh*CI_K;
    var cx=Math.round(Math.max(0,Math.min(MW-L,s.camX-L/2))+sec);
    var cy=Math.round(Math.max(0,Math.min(MH-H,s.camY-H/2))+sec*0.6);

    G.fillStyle=CI_THEMES[s.C.theme].sols[2];G.fillRect(0,0,L,H);
    G.imageSmoothingEnabled=false;
    G.drawImage(s.img,cx,cy,L,H,0,0,L,H);

    var i;
    for(i=0;i<s.gommes.length;i++){
      var gm=s.gommes[i];
      G.globalAlpha=Math.min(0.5,gm.vie/3000*0.5);
      R(gm.x-cx-1,gm.y-cy-1,2,2,'#15171d');
    }
    G.globalAlpha=1;
    for(i=0;i<s.pouss.length;i++){
      var q=s.pouss[i];
      G.globalAlpha=Math.max(0,q.vie/420)*0.5;
      R(q.x-cx,q.y-cy,2,2,q.c);
    }
    G.globalAlpha=1;
    /* LE FANTOME, translucide : il ne doit jamais etre pris pour un
       adversaire qu'on peut toucher. */
    if(s.fant&&s.fant.length&&s.tour<=CI_TOURS){
      var f=s.fant[Math.min(s.fantI,s.fant.length-1)];
      if(f)this.voiture(s,f[0]-cx,f[1]-cy,f[2],(s.iEcu+6),0.40);
    }
    this.voiture(s,s.x-cx,s.y-cy,s.a,s.iEcu,null);
    /* =====================================================================
       LE CHROME SE DESSINE DANS SON PROPRE REPERE
       ---------------------------------------------------------------------
       Tous ses textes et ses blocs sont dimensionnes en pixels : en
       passant au pixel fin, ils ont ete divises par deux a l'ecran et sont
       devenus illisibles. Plutot que de multiplier une centaine de
       tailles une a une — et d'en oublier —, on met le repere a l'echelle
       avant de l'appeler. Le chrome continue de croire qu'il travaille sur
       un ecran de 195 par 422, et il a raison : c'est sa vraie unite. */
    G.save(); G.scale(CI_K,CI_K);
    this.chrome(s,L/CI_K,H/CI_K);
    G.restore();
  },

  /* =====================================================================
     L'ECRAN DE CHOIX
     ===================================================================== */
  chrome:function(s,L,H){
    var i;
    R(0,0,L,17,'rgba(6,9,14,.84)');
    G.font='bold 11px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#ffffff';G.fillText(this.mmss(s.tms),4,12);
    G.font='7px ui-monospace,monospace';G.textAlign='center';
    G.fillStyle='#9fb4c8';
    G.fillText('TOUR '+Math.min(s.tour,CI_TOURS)+'/'+CI_TOURS,L/2,8);
    G.fillStyle=s.meilleur?'#ffd24a':'#5d6e80';
    G.fillText(s.meilleur?('MEILLEUR '+this.mmss(s.meilleur)):(s.C?s.C.nom:''),L/2,15);

    if(s.mini){
      var mx=L-s.miniW-3, my=20;
      G.drawImage(s.mini,mx,my);
      R(mx,my,s.miniW,1,'rgba(255,255,255,.18)');
      R(mx+Math.round(s.x*s.miniW/(s.C.mw*CI_K))-1,my+Math.round(s.y*s.miniH/(s.C.mh*CI_K))-1,3,3,'#ff5a4a');
      if(s.fant&&s.fant.length){
        var f=s.fant[Math.min(s.fantI,s.fant.length-1)];
        if(f)R(mx+Math.round(f[0]*s.miniW/(s.C.mw*CI_K)),my+Math.round(f[1]*s.miniH/(s.C.mh*CI_K)),2,2,'#8fa6bc');
      }
    }
    var E=CI_ECURIES[s.iEcu];
    R(3,20,3,9,E.c); R(3,20,3,3,E.e);
    G.font='7px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#9fb4c8';G.fillText(E.n,9,27);

    /* =====================================================================
       LE CO-PILOTE
       ---------------------------------------------------------------------
       LA FLECHE EST L'INFORMATION, le reste est du confort. Son rayon
       dit la severite : plus le virage est serre, plus elle est
       repliee — et c'est cela qu'on lit du coin de l'oeil a pleine
       vitesse, pas un chiffre ni un mot. Le chiffre et le mot sont la
       pour apprendre le vocabulaire, et la couleur pour trancher entre
       « leve le pied » et « passe ».

       IL PARLE DEUX SECONDES AVANT, comme un vrai : plus tot, on oublie ;
       plus tard, c'est deja fait. Deux secondes a la vitesse du moment,
       donc la fenetre se deplace quand on va plus vite. */
    var dv=this.devant(s);
    if(dv&&!s.hors){
      var vit=Math.max(0.06,Math.hypot(s.vx,s.vy));
      var sec2=(dv.d*4*CI_K)/(vit*1000);
      if(sec2<2.6){
        var N=dv.v.note, sens=dv.v.sens>0?1:-1;
        var proche=Math.max(0,Math.min(1,(2.6-sec2)/2.0));
        G.globalAlpha=0.42+proche*0.58;
        /* L'ARC PART DU BAS ET TOURNE DU COTE DU VIRAGE, et son RAYON
           dit la severite : plus c'est serre, plus il est replie. La
           premiere version calculait le centre de l'arc d'un cote et la
           pointe de l'autre : les deux morceaux ne se rejoignaient pas,
           et la fleche ressemblait a deux signes poses cote a cote. On
           part donc du meme centre pour tout. */
        var rad=6+(N.n-1)*2.6;
        var ox=Math.round(L/2-15+sens*rad), oy=52;
        for(var t3=0;t3<=24;t3++){
          var ph=(t3/24)*(Math.PI/2);
          R(ox-sens*Math.cos(ph)*rad-1, oy-Math.sin(ph)*rad-1, 3, 3, N.c);
        }
        /* la pointe, au bout de l'arc et dans son prolongement */
        for(var q3=0;q3<6;q3++){
          var hh3=11-q3*1.7;
          R(ox+sens*(q3*1.7)-1, oy-rad-hh3/2, 2, hh3, N.c);
        }
        /* le chiffre, a cote de la fleche et en gros : c'est lui qu'on
           finit par lire quand on connait le trace */
        G.textAlign='left';
        G.font='bold 17px ui-monospace,monospace';G.fillStyle=N.c;
        G.fillText(String(N.n),L/2+8,oy+4);
        G.textAlign='center';
        /* LE MOT SEUL : la fleche dit deja le cote, et « TRES SERRE A
           DROITE » passait sous le mini-plan. Un libelle qu'on ne peut
           pas lire en entier ne vaut pas mieux qu'une moitie de libelle. */
        G.font='bold 8px ui-monospace,monospace';G.fillStyle=N.c;
        G.fillText(N.m,L/2,oy+18);
        /* L'ENCHAINEMENT : c'est lui qui permet de preparer la sortie du
           premier virage en fonction du second. */
        if(dv.suiv){
          G.font='7px ui-monospace,monospace';G.fillStyle='rgba(207,228,242,.70)';
          G.fillText('PUIS '+dv.suiv.note.n+(dv.suiv.sens>0?' À DROITE':' À GAUCHE'),
                     L/2,oy+28);
        }
        G.globalAlpha=1;
      }
    }
    /* ---- LA SURFACE SOUS LES ROUES ----
       A gauche, sous le nom de l'ecurie : le milieu de l'ecran appartient
       au co-pilote, et deux textes superposes ne se lisent ni l'un ni
       l'autre. */
    if(s.surfCo&&s.surfCo.adh<1){
      G.textAlign='left';
      G.font='bold 8px ui-monospace,monospace';G.fillStyle='#ffb04a';
      G.fillText(s.surfCo.nom,4,38);
      G.font='7px ui-monospace,monospace';G.fillStyle='rgba(255,176,74,.68)';
      G.fillText('ADHÉRENCE '+Math.round(s.surfCo.adh*100)+'%',4,47);
    }

    if(s.hors&&Math.floor(s.t/150)%2===0){
      G.font='bold 9px ui-monospace,monospace';G.textAlign='center';
      G.fillStyle='#ffb04a';G.fillText('HORS PISTE',L/2,H*0.30);
    }

    /* LE VOLANT GRADUE. Des moities qui s'allument en bloc feraient
       croire a un braquage tout ou rien — et un joueur qui croit ca pose
       son pouce n'importe ou, donc toujours au maximum. Les graduations
       grandissent vers le bord : la forme seule annonce la gradation. */
    var hb=Math.round(H*0.15), cy2=H-hb/2;
    R(0,H-hb,L,hb,'rgba(6,9,14,.42)');
    R(0,H-hb,L,1,'rgba(255,255,255,.14)');
    var NG=9, bw=Math.max(3,Math.round(L*0.034));
    for(i=0;i<NG;i++){
      var fr=(i+1)/NG;
      var lx=Math.round(L/2-(L/2-bw-1)*fr), rx=Math.round(L/2+(L/2-bw-1)*fr);
      var seuil=fr-0.8/NG, hh=Math.round(9+fr*9);
      R(lx,cy2-hh/2,bw,hh,(s.cible<0&&-s.cible>=seuil)?'#78e0ff':'rgba(255,255,255,.17)');
      R(rx-bw,cy2-hh/2,bw,hh,(s.cible>0&&s.cible>=seuil)?'#78e0ff':'rgba(255,255,255,.17)');
    }
    var bl=Math.round(L*0.42);
    R(L/2-bl,H-hb-7,bl*2,5,'rgba(6,9,14,.72)');
    var vw=Math.round(Math.abs(s.volant)*bl);
    if(vw>0)R(s.volant>=0?L/2:L/2-vw,H-hb-6,vw,3,s.frein?'#ff8a5a':'#78e0ff');
    R(L/2,H-hb-9,1,9,'rgba(255,255,255,.65)');
    G.font='bold 8px ui-monospace,monospace';G.textAlign='center';
    if(s.frein){ G.fillStyle='#ff6a5a';G.fillText('FREIN',L/2,cy2+3); }
    else if(!s.touche){
      G.fillStyle='rgba(255,255,255,.52)';G.font='7px ui-monospace,monospace';
      G.fillText('PLUS LOIN DU CENTRE = PLUS FORT',L/2,H-hb-13);
    }

    var v=Math.hypot(s.vx,s.vy);
    G.textAlign='right';G.font='bold 13px ui-monospace,monospace';
    G.fillStyle=s.hors?'#ffb04a':'#ffffff';
    G.fillText(String(Math.round(v*1180/CI_K)),L-4,H-hb-22);
    G.font='6px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText('KM/H',L-4,H-hb-14);

    G.textAlign='left';G.font='6px ui-monospace,monospace';
    for(i=0;i<s.tours.length&&i<CI_TOURS;i++){
      G.fillStyle=(s.tours[i]===s.meilleur)?'#ffd24a':'#7f93a8';
      G.fillText('T'+(i+1)+'  '+this.mmss(s.tours[i]),4,H-hb-22-(s.tours.length-1-i)*8);
    }

    if(s.motT>0&&s.mot){
      var a=Math.min(1,s.motT/450), tp=s.motGros?13:10;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>6&&G.measureText(s.mot).width>L-20){
        tp--;G.font='bold '+tp+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=H*0.22;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.62*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-6,ty-tp,tw+12,tp+7);
      G.fillStyle=(s.motGros?'rgba(255,210,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }
    if(s.flash>0){
      G.fillStyle='rgba(255,210,74,'+(s.flash/400*0.11).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.80)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 15px ui-monospace,monospace';G.fillStyle='#ffd24a';
      G.fillText('LE CIRCUIT',L/2,H*0.36);
      G.font='9px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('CINQ TRACÉS, DOUZE MONOPLACES',L/2,H*0.36+22);
      G.fillStyle='#9fb4c8';
      G.fillText('TU CHOISIS APRÈS LE JETON',L/2,H*0.36+40);
    }
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.84)';G.fillRect(0,H*0.26,L,100);
      G.textAlign='center';
      G.font='bold 15px ui-monospace,monospace';G.fillStyle='#ffd24a';
      G.fillText(s.meilleur?this.mmss(s.meilleur):'—',L/2,H*0.26+24);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.C.nom+' · TOTAL '+this.mmss(s.total),L/2,H*0.26+40);
      G.fillStyle=s.recNeuf?'#7dff9a':'#9fb4c8';
      G.fillText(s.recNeuf?'NOUVEAU RECORD SUR CE TRACÉ':'RECORD '+this.mmss(s.rec),
                 L/2,H*0.26+58);
      G.fillStyle='#ffffff';G.font='bold 11px ui-monospace,monospace';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+80);
    }
    if(s.enPause){
      G.fillStyle='rgba(6,9,14,.66)';G.fillRect(0,0,L,H);
      G.textAlign='center';G.font='bold 12px ui-monospace,monospace';
      G.fillStyle='#ffd24a';G.fillText('EN PAUSE',L/2,H/2-6);
      G.font='9px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('TOUCHE POUR REPRENDRE',L/2,H/2+9);
    }
  },

  /* ================= LA BANNIERE ================= */
  banniere:function(g,w,h,grand){
    g.imageSmoothingEnabled=false;
    for(var y=0;y<h;y+=7){g.fillStyle=((y/7)|0)%2?'#2d5a33':'#27512e';g.fillRect(0,y,w,7);}
    g.save();g.translate(w/2,h/2);g.rotate(-0.22);
    g.fillStyle='#d8dde4';g.fillRect(-w,-21,2*w,42);
    g.fillStyle='#3d4049';g.fillRect(-w,-17,2*w,34);
    for(var x=-w;x<w;x+=12){g.fillStyle='rgba(236,238,242,.25)';g.fillRect(x,-1,6,2);}
    for(var x2=-w;x2<w;x2+=10){
      g.fillStyle=((x2/10)|0)%2?'#d23a2e':'#eceef2';
      g.fillRect(x2,-21,10,4); g.fillRect(x2,17,10,4);
    }
    g.restore();
    if(!CI_ART)CI_ART=CI_SPRITE();
    var M=MOTEUR.circuit;
    /* UNE SEULE ROTATION. dessinerSprite tourne deja le sprite lui-meme :
       une rotation posee en plus sur le contexte les additionnait, et les
       monoplaces de la vignette roulaient de travers. On lui donne donc
       directement le cap voulu. */
    [[w*0.26,h*0.60,0],[w*0.50,h*0.42,3],[w*0.74,h*0.62,4]].forEach(function(p,k){
      g.save();g.translate(p[0],p[1]);g.scale(0.92,0.92);
      M.dessinerSprite(g,M.pal(p[2]),0,0,-Math.PI/2-0.22,null,true);
      g.restore();
    });
    if(grand){
      g.fillStyle='#ffd24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LE CIRCUIT',w-6,14);
    }
  }
};
