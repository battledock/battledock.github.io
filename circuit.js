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

var CI_L=18, CI_H=31;
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
function CI_SPRITE(){
  var A=[], i;
  function C(m){var d=(CI_L-m.length)>>1;return '.'.repeat(d)+m+'.'.repeat(CI_L-m.length-d);}
  function px(l,mot,ec){
    var t=l.split(''), n=mot.length, g=(CI_L>>1)-ec-n, dt=(CI_L>>1)+ec;
    for(var k=0;k<n;k++){ if(mot[k]!=='.'){ t[g+k]=mot[k]; t[dt+k]=mot[k]; } }
    return t.join('');
  }
  A.push(C('KKKKKKKKKKKKKKKK'));          /* 0  aileron avant */
  A.push(C('KeeeeeeeeeeeeeeK'));
  A.push(C('KKKKcccccccckKKK').replace('k','c'));
  A.push(C('KccK'));                       /* 3  nez */
  A.push(C('KccK'));
  A.push(C('KccK'));
  A.push(C('KccccK'));                     /* 6 */
  A.push(C('KccccK'));
  A.push(C('KccccK'));
  A.push(C('KccccccK'));                   /* 9 */
  A.push(C('KccccccK'));
  A.push(C('KccccccK'));
  A.push(C('KccccccK'));                   /* 12  cockpit */
  A.push(C('KcKWWKcK'));
  A.push(C('KcKWWKcK'));
  A.push(C('KccKKccK'));
  A.push(C('KcccccccccK'));                /* 16  pontons */
  A.push(C('KcccccccccK'));
  A.push(C('KcccccccccK'));
  A.push(C('KcccccccccK'));
  A.push(C('KcccccccccK'));                /* 20 */
  A.push(C('KcccccccccK'));
  A.push(C('KcccccccccK'));
  A.push(C('KKccccccckK').replace('k','c'));
  A.push(C('.KccccccK.'));                 /* 24  moteur */
  A.push(C('.KccccK.'));
  A.push(C('.KccccK.'));
  A.push(C('.KKccKK.'));
  A.push(C('KKKKKKKKKKKKKKKK'));           /* 28  aileron arriere */
  A.push(C('KeeeeeeeeeeeeeeK'));
  A.push(C('KKKKKKKKKKKKKKKK'));
  for(i=5;i<=10;i++) A[i]=px(A[i],'KnK',6);
  for(i=19;i<=25;i++)A[i]=px(A[i],'KnnK',5);
  return A;
}
var CI_ART=null;

/* =====================================================================
   LES MOTIFS. Chaque fonction repond : ce pixel de carrosserie
   est-il du motif ? C'est la FORME qui distingue deux ecuries, pas la
   teinte — a trente pixels de haut, deux bleus voisins sont la meme
   voiture.
   ===================================================================== */
var CI_MOTIFS={
  uni:     function(i,j){ return false; },
  bande:   function(i,j){ return Math.abs(i-8.5)<1.6; },
  deux:    function(i,j){ var a=Math.abs(i-8.5); return a>2.2&&a<4.0; },
  fleche:  function(i,j){ return j<17&&Math.abs(i-8.5)<=Math.max(0,(j-2)*0.42); },
  chevron: function(i,j){ return j<16&&((Math.abs(i-8.5)*1.3+j)%7)<2.2; },
  damier:  function(i,j){ return j>=15&&j<=23&&((i>>1)+(j>>1))%2===0; },
  diag:    function(i,j){ return ((i*1.6+j)%9)<3.2; },
  pois:    function(i,j){ return (i%5===2)&&(j%5===1); },
  avant:   function(i,j){ return j<16; },
  arriere: function(i,j){ return j>=16; },
  moitie:  function(i,j){ return i<9; },
  cercles: function(i,j){ var a=i-8.5,b=(j%10)-5; return a*a+b*b<5.5; }
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
var CI_THEMES={
  port:  {h1:'#2d5a33',h2:'#27512e',bord:'#d8dde4',piste:'#3d4049',hors:'#8f7a4a',
          ciel:'#27512e',vib1:'#d23a2e',vib2:'#eceef2',ligne:'rgba(236,238,242,.22)'},
  mer:   {h1:'#8a9a52',h2:'#7f8f4a',bord:'#e6e9ee',piste:'#44474f',hors:'#cbb882',
          ciel:'#7f8f4a',vib1:'#d23a2e',vib2:'#eceef2',ligne:'rgba(240,242,246,.22)'},
  roche: {h1:'#b5a483',h2:'#aa9a7a',bord:'#eceef2',piste:'#4a4d55',hors:'#cfc0a0',
          ciel:'#aa9a7a',vib1:'#c83a2e',vib2:'#f2f4f8',ligne:'rgba(240,242,246,.24)'},
  beton: {h1:'#5a5f66',h2:'#53585f',bord:'#d2d7de',piste:'#36393f',hors:'#6e737b',
          ciel:'#53585f',vib1:'#d8d23a',vib2:'#2a2d33',ligne:'rgba(230,232,238,.20)'},
  pins:  {h1:'#1f3a26',h2:'#1a3321',bord:'#c8cfd6',piste:'#33363d',hors:'#6b5a3a',
          ciel:'#1a3321',vib1:'#c83a2e',vib2:'#dde2e8',ligne:'rgba(220,226,234,.20)'}
};

MOTEUR.circuit={
  nom:'Le Circuit', sous:'VUE DE DESSUS · CHOISIS TON TRACÉ',
  vise:210, pausable:true,

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
    var n=pts.length, brut=[], i, k;
    for(i=0;i<n;i++){
      var p0=pts[(i-1+n)%n], p1=pts[i], p2=pts[(i+1)%n], p3=pts[(i+2)%n];
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
    var MW=C.mw, MH=C.mh, LG=C.large;
    var cv=document.createElement('canvas'); cv.width=MW; cv.height=MH;
    var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
    function rond(x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
    function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}

    /* ---- LE SOL, avec ses bandes : sans elles le hors-piste est un
       aplat ou rien ne dit qu'on avance ---- */
    for(var y=0;y<MH;y++) rect(0,y,MW,1, ((y/14)|0)%2?T.h1:T.h2);

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

    /* ---- LES BACS, LA BORDURE, LA PISTE ---- */
    for(i=0;i<L.length;i+=3){ p=L[i];
      var ser=(i>>4)%7;
      if(ser===0||ser===3) rond(p[0],p[1],LG+16,T.hors);
    }
    for(i=0;i<L.length;i+=2){ p=L[i]; rond(p[0],p[1],LG+4,T.bord); }
    for(i=0;i<L.length;i+=2){ p=L[i]; rond(p[0],p[1],LG,T.piste); }
    /* ---- LES SURFACES, peintes par-dessus le bitume ----
       Elles doivent se voir de LOIN : une nuance de gris ne previent
       personne, et on arrive dessus a pleine vitesse sans avoir compris
       pourquoi la voiture part. */
    for(i=0;i<L.length;i++){
      var ty=s.surf[i]; if(ty==='asphalte')continue;
      var SU=CI_SURF[ty];
      rond(L[i][0],L[i][1],LG-1,SU.c);
    }
    for(i=0;i<L.length;i+=1){
      var ty2=s.surf[i]; if(ty2==='asphalte')continue;
      var SU2=CI_SURF[ty2], an=L[i][2];
      /* chaque matiere a son grain : des cailloux pour le gravier, des
         sillons pour la terre, des joints pour les paves, des reflets
         pour le mouille */
      for(var g2=0;g2<3;g2++){
        var de=(al(i*3.1+g2*7.7)*2-1)*(LG-4);
        var gx2=L[i][0]+Math.cos(an+1.5708)*de, gy2=L[i][1]+Math.sin(an+1.5708)*de;
        if(ty2==='gravier') rect(gx2,gy2,2,2,SU2.c2);
        else if(ty2==='terre'){ if((i+g2)%3===0)rect(gx2,gy2,3,1,SU2.c2); }
        else if(ty2==='pave'){ if(i%4===0)rect(gx2,gy2,4,1,SU2.c2); }
        else if(ty2==='mouille'){ if((i+g2)%5===0)rect(gx2,gy2,5,1,'rgba(150,190,220,.26)'); }
      }
    }
    /* UNE LIGNE D'ENTREE ET DE SORTIE pour chaque portion : on voit ou
       la matiere change avant d'y etre. */
    for(i=0;i<L.length;i++){
      var p1=s.surf[i], p2=s.surf[(i+1)%L.length];
      if(p1===p2)continue;
      var ab=L[i][2], nx3=Math.cos(ab+1.5708), ny3=Math.sin(ab+1.5708);
      for(var w3=-LG;w3<LG;w3+=3)
        rect(L[i][0]+nx3*w3-1,L[i][1]+ny3*w3-1,3,3,
             ((w3/3)|0)%2?'#e8e8ec':'#30343c');
    }
    /* L'USURE DE LA CORDE : la trajectoire des autres a noirci le bitume
       a l'interieur des virages. Ca se voit, et ca se suit. */
    for(i=0;i<L.length;i++){
      var a0=L[i][2], a1=L[(i+8)%L.length][2];
      var dd=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0));
      if(Math.abs(dd)<0.05)continue;
      var sg=dd>0?1:-1, nx=Math.cos(a0+1.5708)*sg, ny=Math.sin(a0+1.5708)*sg;
      rond(L[i][0]+nx*LG*0.5, L[i][1]+ny*LG*0.5, LG*0.42,'rgba(18,20,26,.16)');
    }
    /* LES VIBREURS, seulement la ou ca tourne : en pleine ligne droite
       ils ne veulent rien dire. */
    for(i=0;i<L.length;i++){
      var b0=L[i][2], b1=L[(i+6)%L.length][2];
      var de=Math.atan2(Math.sin(b1-b0),Math.cos(b1-b0));
      if(Math.abs(de)<0.055)continue;
      var cc=((i/5)|0)%2?T.vib1:T.vib2;
      var mx=Math.cos(b0+1.5708), my=Math.sin(b0+1.5708), sn=de>0?-1:1;
      rect(L[i][0]+mx*LG*sn-2, L[i][1]+my*LG*sn-2,4,4,cc);
    }
    for(i=0;i<L.length;i+=6){
      if(((i/6)|0)%2)continue;
      p=L[i]; rect(p[0]-1,p[1]-1,2,2,T.ligne);
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
        if(Math.abs(L[q][0]-x)<r+LG+22&&Math.abs(L[q][1]-y)<r+LG+22)return false;
      return true;
    }
    function arbre(x,y,r,c1,c2,c3){
      rond(x+r*0.3,y+r*0.35,r,'rgba(8,16,10,.42)');
      rond(x,y,r,c1); rond(x-r*0.22,y-r*0.22,r*0.72,c2);
      rond(x-r*0.38,y-r*0.38,r*0.36,c3);
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
    var NB=C.theme==='beton'?34:76;
    for(i=0;i<NB;i++){
      var ax=al(i*3.1)*MW, ay=al(i*7.7)*MH, ar=5+al(i*2.3)*7;
      if(C.theme==='mer'&&ax>MW-200)continue;
      if(!loinDeLaPiste(ax,ay,ar))continue;
      if(C.theme==='pins'){
        /* DES PINS, pas des boules : un tronc et deux etages de houppier
           suffisent a dire l'arbre du Sud vu d'en haut. */
        rond(ax+3,ay+4,ar*1.1,'rgba(6,12,8,.5)');
        rond(ax,ay,ar*1.15,'#14301a'); rond(ax-ar*0.2,ay-ar*0.2,ar*0.8,'#1d4a26');
        rond(ax-ar*0.4,ay-ar*0.4,ar*0.4,'#2d6a34');
        rect(ax-1,ay-1,2,2,'#3a2a18');
      } else if(C.theme==='roche'){
        arbre(ax,ay,ar*0.8,'#4a5a30','#5e7040','#748a52');
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
        arbre(ax,ay,ar,'#17401f','#235e2c','#398a3f');
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
      g.fillStyle=T.h2;g.fillRect(0,0,w,h);
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
  ecranPret:function(s,L,H){
    if(!CI_ART)CI_ART=CI_SPRITE();
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
    var L=s.L, H=s.H, z={};
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

  ecranChoix:function(s,L,H){
    if(!CI_ART)CI_ART=CI_SPRITE();
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
  },

  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='prep')return;
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
    if(dans(z.scene)){ this.tourne(s,'e', x<s.L/2?-1:1); return; }
  },
  /* LE GLISSEMENT MARCHE AUSSI : c'est le geste qu'on essaie d'abord
     devant une rangee d'objets, et il ne coute que quelques lignes. */
  glisse:function(s,x,y,dx,dy){
    if(s.phase!=='prep')return;
    s.glDx=(s.glDx||0)+dx;
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
    s.ligne=this.tracer(C.pts,4);
    s.longueur=s.ligne.length*4;
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
    var ACC=0.00042, FREIN=0.00075, VMAX=0.235, LG=s.C.large;
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
      s.pouss.push({x:s.x-dirx*8,y:s.y-diry*8,vx:(Math.random()-0.5)*0.01,
                    vy:(Math.random()-0.5)*0.01,vie:420,
                    c:surHerbe?'#6f8a4e':'#b9bec8'});
    if(!surHerbe&&Math.abs(perp)>0.042){
      var gx=-diry*7, gy=dirx*7, bx=s.x-dirx*9, by=s.y-diry*9;
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
  pal:function(ec){
    var E=CI_ECURIES[ec%CI_ECURIES.length];
    return {E:E, mot:CI_MOTIFS[E.m]||CI_MOTIFS.uni};
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
        ch=row[i];
        var c=null;
        if(ch==='K')c='#12141b';
        else if(ch==='n')c='#3a3e4b';
        else if(ch==='W')c='#f0efe8';
        else if(ch==='e')c=P.E.e;
        else if(ch==='c')c=P.mot(i,j)?P.E.d:P.E.c;
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
    var vv=Math.hypot(s.vx,s.vy), dev=28+vv*210;
    var ax=s.x+Math.cos(s.a)*dev, ay=s.y+Math.sin(s.a)*dev;
    s.camX=(s.camX==null)?ax:s.camX+(ax-s.camX)*0.14;
    s.camY=(s.camY==null)?ay:s.camY+(ay-s.camY)*0.14;
    var MW=s.C.mw, MH=s.C.mh;
    var cx=Math.round(Math.max(0,Math.min(MW-L,s.camX-L/2))+sec);
    var cy=Math.round(Math.max(0,Math.min(MH-H,s.camY-H/2))+sec*0.6);

    G.fillStyle=CI_THEMES[s.C.theme].ciel;G.fillRect(0,0,L,H);
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
    this.chrome(s,L,H);
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
      R(mx+Math.round(s.x*s.miniW/s.C.mw)-1,my+Math.round(s.y*s.miniH/s.C.mh)-1,3,3,'#ff5a4a');
      if(s.fant&&s.fant.length){
        var f=s.fant[Math.min(s.fantI,s.fant.length-1)];
        if(f)R(mx+Math.round(f[0]*s.miniW/s.C.mw),my+Math.round(f[1]*s.miniH/s.C.mh),2,2,'#8fa6bc');
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
      var sec2=(dv.d*4)/(vit*1000);
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
    G.fillText(String(Math.round(v*1180)),L-4,H-hb-22);
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
