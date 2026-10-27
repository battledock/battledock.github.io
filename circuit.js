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
  theme:'port', pts:[
   [500,130],[700,150],[840,260],[870,420],[800,530],[660,570],
   [690,700],[810,780],[860,920],[800,1070],[650,1150],[470,1160],
   [330,1090],[300,950],[380,850],[470,790],[420,680],[270,650],
   [190,520],[180,360],[260,220],[380,150]]},
 {cle:'corniche', nom:'LA CORNICHE', sous:'RAPIDE, FACE À LA MER', ref:19916, large:26, mw:1250, mh:980,
  theme:'mer', pts:[
   [240,180],[560,140],[900,170],[1080,300],[1090,520],[960,620],
   [700,600],[500,660],[430,790],[260,820],[150,700],[130,420]]},
 {cle:'calanques', nom:'LES CALANQUES', sous:'ÉTROIT ET CASSANT', ref:22684, large:19, mw:980, mh:1180,
  theme:'roche', pts:[
   [420,120],[620,160],[700,300],[620,400],[700,520],[840,560],
   [860,720],[740,800],[760,950],[600,1040],[420,1020],[360,880],
   [460,790],[420,660],[260,640],[200,500],[280,380],[230,250],[300,150]]},
 {cle:'friche', nom:'LA FRICHE', sous:'MURS DE BÉTON', ref:21900, large:21, mw:1120, mh:1060,
  theme:'beton', pts:[
   [300,140],[760,130],[960,260],[980,460],[840,560],[880,720],
   [760,880],[520,920],[400,820],[460,660],[340,600],[180,640],
   [120,440],[160,260]]},
 {cle:'pinede', nom:'LA PINÈDE', sous:'SOUS LES PINS, LE SOIR', ref:24716, large:24, mw:1180, mh:1240,
  theme:'pins', pts:[
   [380,150],[720,180],[900,320],[880,520],[720,600],[760,760],
   [900,880],[840,1060],[620,1120],[400,1060],[320,900],[440,800],
   [380,660],[200,620],[140,420],[200,250]]}
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
            iCir:0, iEcu:0, vign:null,
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

  /* les rectangles de l'ecran de choix, calcules au meme endroit pour le
     dessin et pour le doigt : deux calculs separes finissent toujours
     par diverger d'un pixel, et le bouton ne repond plus la ou il est */
  zones:function(s){
    var L=s.L, H=s.H;
    var z={cir:[], ecu:[], go:null};
    /* LE NOM SE POSE SOUS LA VIGNETTE, pas dessus. Ecrit par-dessus le
       trace, il devenait illisible sur la roche claire comme sur l'herbe
       sombre, et c'est pourtant le seul endroit ou l'on apprend comment
       s'appelle le circuit qu'on regarde. La case reserve donc onze
       pixels sous l'image rien que pour lui. */
    /* LA MISE EN PAGE SE CALCULE DEPUIS LE BAS, et c'est ce qui manquait.
       Les positions etaient des fractions de la hauteur supposee de
       l'ecran — 422 pixels. La scene en fait 335 sur un telephone
       ordinaire : le resume et le bouton remontaient dans la derniere
       rangee de voitures, et trois lignes de texte se retrouvaient
       ecrites par-dessus des monoplaces. Le bouton, le resume et les
       grilles s'empilent donc a partir du bas, ou tout doit tenir, et
       seules les vignettes de trace gardent une position haute fixe. */
    /* LES REPERES DU HAUT SONT EN DUR, pas en fractions de hauteur. Un
       titre pose a 5,5 % de l'ecran tombe sur le sous-titre quand la
       scene fait trois cent dix-huit pixels et non quatre cent vingt. */
    z.yTitre=15; z.ySousTitre=27;
    var VH=30, NH=11, ch=VH+NH, y0=32;
    var cw=Math.floor((L-14)/3);
    for(var i=0;i<CI_CIRCUITS.length;i++){
      var c=i%3, r=(i/3)|0;
      z.cir.push({x:5+c*(cw+2), y:y0+r*(ch+4), w:cw, h:ch, i:i, vh:VH});
    }
    var basCir=y0+2*(ch+4);
    z.go={x:Math.round(L*0.16), y:H-52, w:Math.round(L*0.68), h:24};
    var ew=Math.floor((L-14)/4), eh=24, nr=Math.ceil(CI_ECURIES.length/4);
    var hauteurEcu=nr*(eh+3)-3;
    /* les voitures se posent au-dessus du resume ; si l'ecran est trop
       court pour tout, elles restent collees sous les traces plutot que
       de passer dessus */
    z.yResume=z.go.y-26;
    var y1=Math.max(basCir+13, z.yResume-10-hauteurEcu);
    for(var j=0;j<CI_ECURIES.length;j++){
      var c2=j%4, r2=(j/4)|0;
      z.ecu.push({x:5+c2*(ew+2), y:y1+r2*(eh+3), w:ew, h:eh, i:j});
    }
    return z;
  },

  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='prep')return;
    var z=this.zones(s), i, r;
    for(i=0;i<z.cir.length;i++){ r=z.cir[i];
      if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h){ s.iCir=r.i; return; } }
    for(i=0;i<z.ecu.length;i++){ r=z.ecu[i];
      if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h){ s.iEcu=r.i; return; } }
    r=z.go;
    if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h) this.enPiste(s);
  },

  enPiste:function(s){
    var C=CI_CIRCUITS[s.iCir];
    s.C=C;
    s.ligne=this.tracer(C.pts,4);
    s.longueur=s.ligne.length*4;
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
      var acc=ACC*(1-v/VMAX)*(surHerbe?0.62:1);
      s.vx+=dirx*acc*dt; s.vy+=diry*acc*dt;
    }
    var perp=-s.vx*diry+s.vy*dirx;
    var grip=(surHerbe?0.0042:(s.frein?0.0134:0.0118));
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
    if(s.phase==='prep'||!s.img){ this.ecranChoix(s,L,H); return; }
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
  ecranChoix:function(s,L,H){
    if(!CI_ART)CI_ART=CI_SPRITE();
    var V=this.vignettes(s), z=this.zones(s), i, r;
    var C=CI_CIRCUITS[s.iCir], E=CI_ECURIES[s.iEcu];
    var T=CI_THEMES[C.theme];
    G.fillStyle='#0b0e14';G.fillRect(0,0,L,H);
    /* un fond qui prend la couleur du terrain choisi : l'ecran de choix
       annonce deja l'ambiance de la course */
    G.fillStyle=T.h2;G.globalAlpha=0.30;G.fillRect(0,0,L,H);G.globalAlpha=1;

    G.textAlign='center';
    G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText('LE CIRCUIT',L/2,z.yTitre);
    G.font='7px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText('LE TRACÉ',L/2,z.ySousTitre);

    for(i=0;i<z.cir.length;i++){
      r=z.cir[i];
      var sel=(i===s.iCir);
      R(r.x,r.y,r.w,r.h,sel?'rgba(255,210,74,.14)':'rgba(255,255,255,.05)');
      R(r.x,r.y,r.w,1,sel?'#ffd24a':'rgba(255,255,255,.14)');
      R(r.x,r.y+r.h-1,r.w,1,sel?'#ffd24a':'rgba(255,255,255,.08)');
      R(r.x,r.y,1,r.h,sel?'#ffd24a':'rgba(255,255,255,.08)');
      R(r.x+r.w-1,r.y,1,r.h,sel?'#ffd24a':'rgba(255,255,255,.08)');
      G.drawImage(V[i],Math.round(r.x+(r.w-50)/2),r.y+1);
      /* LE NOM EST MESURE AVANT D'ETRE ECRIT : « LES CALANQUES » deborde
         d'une case de soixante pixels en six points, et un nom tronque ne
         vaut pas mieux qu'un nom absent. */
      var nm=CI_CIRCUITS[i].nom, tp=7;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>4&&G.measureText(nm).width>r.w-4){
        tp--; G.font='bold '+tp+'px ui-monospace,monospace';
      }
      R(r.x+1,r.y+r.vh+1,r.w-2,r.h-r.vh-2,sel?'rgba(255,210,74,.16)':'rgba(0,0,0,.28)');
      G.fillStyle=sel?'#ffd24a':'#9fb4c8';
      G.fillText(nm,r.x+r.w/2,r.y+r.h-4);
    }

    G.font='7px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText('LA MONOPLACE',L/2,z.ecu[0].y-5);
    for(i=0;i<z.ecu.length;i++){
      r=z.ecu[i];
      var se=(i===s.iEcu);
      R(r.x,r.y,r.w,r.h,se?'rgba(120,224,255,.14)':'rgba(255,255,255,.04)');
      if(se){ R(r.x,r.y,r.w,1,'#78e0ff'); R(r.x,r.y+r.h-1,r.w,1,'#78e0ff');
              R(r.x,r.y,1,r.h,'#78e0ff'); R(r.x+r.w-1,r.y,1,r.h,'#78e0ff'); }
      G.save();
      G.translate(r.x+r.w/2, r.y+r.h/2);
      G.scale(0.84,0.84);
      this.dessinerSprite(G,this.pal(i),0,0,-Math.PI/2,null,false);
      G.restore();
    }

    /* le nom de ce qu'on a choisi, en toutes lettres */
    var yb=z.yResume;
    G.font='bold 9px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText(C.nom+'  ·  '+E.n,L/2,yb);
    G.font='7px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText(C.sous,L/2,yb+10);
    var rc=s.recs[C.cle];
    G.fillStyle=rc?'#7dff9a':'#5d6e80';
    G.fillText(rc?('TON RECORD ICI · '+this.mmss(rc.t)):'JAMAIS COURU ICI',L/2,yb+20);

    r=z.go;
    R(r.x,r.y,r.w,r.h,'rgba(255,210,74,.18)');
    R(r.x,r.y,r.w,1,'#ffd24a');R(r.x,r.y+r.h-1,r.w,1,'#ffd24a');
    R(r.x,r.y,1,r.h,'#ffd24a');R(r.x+r.w-1,r.y,1,r.h,'#ffd24a');
    G.font='bold 11px ui-monospace,monospace';G.fillStyle='#ffd24a';
    G.fillText('EN PISTE',L/2,r.y+r.h/2+4);
    G.font='6px ui-monospace,monospace';G.fillStyle='#7f93a8';
    G.fillText('GAUCHE / DROITE POUR BRAQUER · LES DEUX : FREIN',L/2,H-17);
    G.fillText('PLUS LOIN DU CENTRE, PLUS TU BRAQUES',L/2,H-8);
  },

  chrome:function(s,L,H){
    var i;
    R(0,0,L,17,'rgba(6,9,14,.84)');
    G.font='bold 11px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#ffffff';G.fillText(this.mmss(s.tms),4,12);
    G.font='7px ui-monospace,monospace';G.textAlign='center';
    G.fillStyle='#9fb4c8';
    G.fillText('TOUR '+Math.min(s.tour,CI_TOURS)+'/'+CI_TOURS,L/2,8);
    G.fillStyle=s.meilleur?'#ffd24a':'#5d6e80';
    G.fillText(s.meilleur?('MEILLEUR '+this.mmss(s.meilleur)):s.C.nom,L/2,15);

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
