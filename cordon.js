/* =====================================================================
   LE CORDON — LA RUE, EN ISOMÉTRIQUE

   POURQUOI UN FICHIER A PART. Le Cordon vivait dans arcade.html, au
   milieu du Hangar et de la salle. Une correction de rue cassait une
   vitrine ailleurs. Ici il est seul : arcade.html ne lui demande qu'une
   chose, MOTEUR.cordon, et ne sait rien du reste.

   LA PROJECTION. Une tuile fait 32 points de large et 16 de haut —
   le rapport 2:1 classique, qui donne des diagonales propres en pixel
   art (un point a droite, un demi-point en bas) au lieu du crenelage
   qu'on recolte avec un angle quelconque.

       ecran.x = (gx - gy) * 16 + OX
       ecran.y = (gx + gy) * 8

   gx file vers la droite-bas, gy vers la gauche-bas. Le coin du monde
   le plus proche de l'oeil est donc (GW,GH), et un objet est devant un
   autre quand gx+gy est plus grand : c'est toute la regle de tri.
   ===================================================================== */
(function(){
'use strict';

var TW=32, TH=16;            /* la tuile, en points */
var GW=48, GH=48;            /* la carte, en tuiles */
var OX=GH*TW/2;              /* decalage pour que tout soit positif */
var MW=(GW+GH)*TW/2;         /* largeur du monde projete */
var MH=(GW+GH)*TH/2;         /* hauteur du sol projete */
var CIEL=190;                /* ce que les toits montent au-dessus du sol */

function m2e(gx,gy){return {x:(gx-gy)*(TW/2)+OX, y:(gx+gy)*(TH/2)};}
/* LES MEMES, SANS ALLOUER. m2e rend un objet ; appele pour trois cents
   corps et quatre-vingt-dix objets a chaque image, cela fait vingt-trois
   mille objets par seconde a ramasser. Dans les boucles de rendu on
   utilise donc ces deux-la, qui ne rendent qu'un nombre. */
function mx(gx,gy){return (gx-gy)*(TW/2)+OX;}
function my(gx,gy){return (gx+gy)*(TH/2);}
function e2mx(ex,ey){var a=(ex-OX)/(TW/2), b=ey/(TH/2);return (a+b)/2;}
function e2my(ex,ey){var a=(ex-OX)/(TW/2), b=ey/(TH/2);return (b-a)/2;}

/* un tirage reproductible : la meme rue a chaque partie tant qu'on ne
   change pas la graine, donc un bogue se rejoue */
function Dé(g){this.g=g||1;}
Dé.prototype.f=function(){this.g=(this.g*16807)%2147483647;return (this.g-1)/2147483646;};
Dé.prototype.e=function(a,b){return a+Math.floor(this.f()*(b-a+1));};
Dé.prototype.pick=function(t){return t[Math.floor(this.f()*t.length)|0];};

/* =====================================================================
   1. LE PLAN DE LA RUE
   Une avenue est-ouest, une rue nord-sud, une intersection au milieu,
   quatre ilots batis. Les bandes sont nommees une fois ici et plus
   jamais recalculees ailleurs : une rue qui se deplace se deplace dans
   une seule constante.
   ===================================================================== */
/* =====================================================================
   UNE PLACE, PAS UNE RUE.

   Premiere version : une avenue de six tuiles entre deux rangees
   d'immeubles de cent points de haut. En isometrique, tout ce qui est
   au sud et a l'est est DEVANT : les facades du premier plan mangeaient
   la moitie de l'ecran et on ne voyait pas ce qu'on commandait.

   L'esplanade fait maintenant vingt-quatre tuiles de large. Le bati est
   repousse sur les bords, et surtout sa hauteur depend de sa place dans
   la profondeur : BAS AU SUD, ou il est devant et masquerait, HAUT AU
   NORD, ou il est derriere et fait le fond. C'est la seule regle a
   retenir pour poser un decor en isometrique.
   ===================================================================== */
var AV={y0:12,y1:35};        /* l'esplanade, du nord au sud */
var RU={x0:21,x1:25};        /* la percee nord-sud qui la traverse */
var TROT=2;                  /* le pourtour dalle */

var SOL={CHAUS:0, TROT:1, CLOU:2, CANIV:3, ILOT:4, HERBE:5, DALLE:6, PAVE:7, EAU:8};

/* =====================================================================
   LES TERRAINS

   AV et RU etaient des constantes : une seule place, pour toujours. Ce
   sont maintenant des objets que l'on REECRIT au demarrage, sans jamais
   les remplacer — tout le code du fichier en garde la reference, et il
   n'y a pas une ligne a changer ailleurs.

   Un terrain, c'est sa geometrie, ou se tiennent les barrieres, ou est
   le batiment a defendre, et quelles zones on se dispute. Le reste du
   jeu — les ordres, la jauge, les camps, l'IA — ne sait pas sur quelle
   carte il tourne, et c'est ce qui permet d'en ajouter une sans rien
   casser.
   ===================================================================== */
var TERRAINS={
  place:{
    nom:'LA PLACE', sous:'Esplanade et percée',
    av:{y0:12,y1:35}, ru:{x0:21,x1:25},
    bx:GW-14, demi:6, pref:{x0:GW-6,y0:12,y1:35,haut:150},
    ligne:GW-11, eau:false, zoom:1.35,
    tolere:56, objectif:52
  },
  pont:{
    /* LE PONT. Neuf tuiles de tablier entre deux parapets, de l'eau des
       deux cotes : aucun contournement. Le cortege force ou ne passe
       pas, et la police tient a peu de frais — mais il n'y a PAS
       D'ECHAPPATOIRE, et une panique sur un pont ne va nulle part. La
       tension y est l'arme et le danger des deux camps. */
    nom:'LE PONT', sous:'Onze tuiles, pas d’échappatoire',
    av:{y0:19,y1:29}, ru:null,
    /* demi couvre tout le tablier : pas une seule barriere sur un pont,
       les parapets font deja le travail et on ne barre pas un pont avec
       du mobilier. */
    bx:GW-16, demi:7, pref:{x0:GW-11,y0:15,y1:33,haut:168},
    ligne:GW-13, eau:true, rive:11,
    /* ON DEMARRE PLUS LARGE SUR LE PONT. A 1,35 on ne voit que le
       tablier et la carte ressemble a une rue : il faut voir le fleuve
       des la premiere image pour comprendre qu'il n'y a nulle part ou
       aller. */
    zoom:1.00,
    /* LE PONT N'A PAS LES MEMES CHIFFRES. Onze tuiles pour un cordon
       qui en couvre huit, et aucun contournement : il y passe cinq fois
       moins de monde que sur la place. Mesure a l'appui, les seuils
       suivent le terrain — sinon la mission est injouable d'un cote ou
       gagnee d'avance de l'autre. */
    tolere:16, objectif:13
  }
};
var TER=TERRAINS.place;
/* ON REECRIT AV ET RU, on ne les remplace pas : les references que tout
   le fichier garde doivent continuer de pointer sur le bon objet. */
function poserTerrain(cle){
  TER=TERRAINS[cle]||TERRAINS.place;
  AV.y0=TER.av.y0; AV.y1=TER.av.y1;
  if(TER.ru){RU.x0=TER.ru.x0; RU.x1=TER.ru.x1;}
  else{RU.x0=-99; RU.x1=-99;}   /* pas de percee : hors carte */
  return TER;
}

function faireCarte(d){
  var C={sol:[], bloc:[], haut:[]}, x, y;
  /* LE PONT : tout est EAU sauf les deux rives et le tablier. L'eau
     bloque comme un mur, mais elle se dessine autrement — c'est la
     seule difference, et c'est ce qui permet d'ajouter un fleuve sans
     toucher a la navigation. */
  if(TER.eau){
    var r=TER.rive, est=TER.pref.x0-1;
    for(y=0;y<GH;y++){
      C.sol[y]=[]; C.bloc[y]=[]; C.haut[y]=[];
      for(x=0;x<GW;x++){
        var surRive=(x<r||x>est);
        var surTab=(y>=AV.y0&&y<=AV.y1);
        var parap=(y===AV.y0-1||y===AV.y1+1);
        var t2;
        if(surRive)t2=SOL.ILOT;
        else if(surTab){
          var bordT=(y<=AV.y0+0||y>=AV.y1-0);
          t2=bordT?SOL.TROT:SOL.CHAUS;
        }
        else if(parap)t2=SOL.PAVE;      /* le parapet */
        else t2=SOL.EAU;
        C.sol[y][x]=t2;
        C.bloc[y][x]=(t2===SOL.ILOT||t2===SOL.EAU||t2===SOL.PAVE)?1:0;
        C.haut[y][x]=0;
      }
    }
    return C;
  }
  for(y=0;y<GH;y++){
    C.sol[y]=[]; C.bloc[y]=[]; C.haut[y]=[];
    for(x=0;x<GW;x++){
      var av=(y>=AV.y0&&y<=AV.y1), ru=(x>=RU.x0&&x<=RU.x1);
      var tav=(y>=AV.y0-TROT&&y<AV.y0)||(y>AV.y1&&y<=AV.y1+TROT);
      var tru=(x>=RU.x0-TROT&&x<RU.x0)||(x>RU.x1&&x<=RU.x1+TROT);
      var t;
      if(av||ru)t=SOL.CHAUS;
      else if(tav||tru)t=SOL.TROT;
      else t=SOL.ILOT;
      C.sol[y][x]=t;
      C.bloc[y][x]=(t===SOL.ILOT)?1:0;
      C.haut[y][x]=0;
    }
  }
  /* LE DALLAGE. Une place n'est pas une chaussee : le centre est dalle,
     la percee reste goudronnee, et un anneau de pave marque le pourtour.
     Trois matieres, c'est ce qu'il faut pour qu'on lise une place plutot
     qu'un parking. */
  for(y=AV.y0;y<=AV.y1;y++)for(x=0;x<GW;x++){
    if(C.sol[y][x]!==SOL.CHAUS)continue;
    var ru2=(x>=RU.x0&&x<=RU.x1);
    if(ru2)continue;                        /* la percee garde l'asphalte */
    var bord=(y<=AV.y0+1||y>=AV.y1-1||x<=2||x>=GW-3);
    C.sol[y][x]=bord?SOL.PAVE:SOL.DALLE;
  }
  /* les passages clous, la ou la percee coupe le pourtour */
  for(x=RU.x0;x<=RU.x1;x++){
    if(AV.y0-1>=0)C.sol[AV.y0-1][x]=SOL.CLOU;
    if(AV.y1+1<GH)C.sol[AV.y1+1][x]=SOL.CLOU;
  }
  /* le caniveau borde la percee, pas la place */
  for(y=0;y<GH;y++){
    if(C.sol[y][RU.x0]===SOL.CHAUS)C.sol[y][RU.x0]=SOL.CANIV;
    if(C.sol[y][RU.x1]===SOL.CHAUS)C.sol[y][RU.x1]=SOL.CANIV;
  }
  return C;
}

/* LES PARCELLES. Un ilot n'est pas un bloc : c'est une rangee
   d'immeubles mitoyens de largeurs inegales, et une cour derriere. On
   decoupe donc la bande qui longe chaque trottoir. */
function decouper(d,x0,x1,y0,y1,sens){
  var L=[], p=(sens==='h')?x0:y0, fin=(sens==='h')?x1:y1;
  while(p<=fin){
    var w=d.e(3,5); if(p+w>fin)w=fin-p+1;
    if(w<3){ if(L.length)L[L.length-1][1]+=w; break; }
    L.push([p,p+w-1]); p+=w;
  }
  return L;
}

function faireBatiments(C,d){
  var B=[], prof;
  /* LA HAUTEUR DEPEND DE LA PROFONDEUR, et c'est toute la regle d'un
     decor isometrique : un batiment au sud est DEVANT la scene, il la
     masque, donc il reste bas ; un batiment au nord est derriere, il
     peut monter — c'est lui qui ferme l'horizon. Avant, tout montait a
     cent points et le premier plan cachait la rue. */
  function hauteurSelon(y0){
    var t=y0/GH;                       /* 0 au nord, 1 au sud */
    if(t>0.62)return d.e(20,40);       /* devant : des echoppes */
    if(t>0.45)return d.e(34,62);
    return d.e(62,132);                /* derriere : le fond de la place */
  }
  function pose(x0,y0,x1,y1){
    if(x0<0||y0<0||x1>=GW||y1>=GH)return;
    var h=hauteurSelon(y0);
    var st=d.pick(['pierre','brique','crepi','moderne','vieux','ocre','ardoise','pastel']);
    var b={x0:x0,y0:y0,x1:x1,y1:y1,h:h,style:st,
           /* la devanture regarde la rue la plus proche */
           face:null, g:d.e(1,2000000)};
    B.push(b);
    for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++){C.bloc[y][x]=1;C.haut[y][x]=h;}
  }
  /* les quatre ilots, chacun borde sur ses deux cotes de rue */
  var hautY1=AV.y0-TROT-1, basY0=AV.y1+TROT+1;
  var gauX1=RU.x0-TROT-1, droX0=RU.x1+TROT+1;

  /* rangees le long de l'avenue (nord et sud), coupees par la rue */
  [[0,gauX1],[droX0,GW-1]].forEach(function(bande){
    prof=d.e(3,4);
    decouper(d,bande[0],bande[1],0,0,'h').forEach(function(p){
      pose(p[0],hautY1-prof+1,p[1],hautY1);
    });
    prof=d.e(3,4);
    decouper(d,bande[0],bande[1],0,0,'h').forEach(function(p){
      pose(p[0],basY0,p[1],basY0+prof-1);
    });
  });
  /* rangees le long de la rue transversale (ouest et est) */
  [[0,hautY1-5],[basY0+5,GH-1]].forEach(function(bande){
    if(bande[1]-bande[0]<3)return;
    prof=d.e(3,4);
    decouper(d,0,0,bande[0],bande[1],'v').forEach(function(p){
      pose(gauX1-prof+1,p[0],gauX1,p[1]);
      pose(droX0,p[0],droX0+prof-1,p[1]);
    });
  });
  /* LE SECOND RANG. Les rangees sur rue laissaient au coeur des ilots
     de grandes nappes vides, et une nappe vide d'un quart d'ecran se lit
     comme un trou dans la carte, pas comme une cour. On y pose donc le
     tissu d'arriere-cour : ateliers, hangars, batiments bas. */
  var y,x,i,j,ok;
  for(y=0;y<GH-2;y++)for(x=0;x<GW-2;x++){
    var w=d.e(3,5), p2=d.e(3,5);
    if(x+w>GW||y+p2>GH)continue;
    ok=true;
    for(j=y;j<y+p2&&ok;j++)for(i=x;i<x+w;i++)
      if(C.sol[j][i]!==SOL.ILOT||C.haut[j][i]){ok=false;break;}
    if(!ok||d.f()<0.30)continue;
    var hh=Math.min(hauteurSelon(y), d.e(22,58));
    var st2=d.pick(['vieux','brique','crepi','ocre','ardoise']);
    var b2={x0:x,y0:y,x1:x+w-1,y1:y+p2-1,h:hh,style:st2,g:d.e(1,2000000)};
    B.push(b2);
    for(j=y;j<y+p2;j++)for(i=x;i<x+w;i++){C.bloc[j][i]=1;C.haut[j][i]=hh;}
  }
  /* LA PREFECTURE, au nord et derriere : c'est ce que le cortege veut
     atteindre, et il faut la voir depuis la place sans qu'elle cache
     quoi que ce soit. Posee au fond, elle peut etre haute. */
  /* OU EST LE BATIMENT A DEFENDRE. Sur la place il est au nord et en
     retrait ; sur le pont il est sur la rive, en face, et il barre le
     fond — c'est tout ce que le cortege voit au bout du tablier. */
  var px0,px1,py0,py1;
  if(TER.eau){
    px0=TER.pref.x0; px1=Math.min(GW-1,px0+8);
    py0=TER.pref.y0; py1=TER.pref.y1;
  }else{
    px0=RU.x1+4; px1=Math.min(GW-2,px0+11); py1=AV.y0-3; py0=Math.max(1,py1-6);
  }
  var libre2=true;
  for(j=py0;j<=py1&&libre2;j++)for(i=px0;i<=px1;i++)if(C.haut[j]&&C.haut[j][i]>60){libre2=false;break;}
  var PR={x0:px0,y0:py0,x1:px1,y1:py1,h:TER.pref.haut||150,
          style:'pierre',g:7777,prefecture:true};
  B.push(PR);
  for(j=py0;j<=py1;j++)for(i=px0;i<=px1;i++){
    if(!C.bloc[j])continue;
    C.bloc[j][i]=1;C.haut[j][i]=(TER.pref.haut||150);
  }
  /* ce qui reste vraiment : des cours pavees, bloquees */
  for(y=0;y<GH;y++)for(x=0;x<GW;x++)
    if(C.sol[y][x]===SOL.ILOT&&!C.haut[y][x])C.sol[y][x]=SOL.HERBE;
  return B;
}

/* =====================================================================
   2. LES OUTILS DE DESSIN ISO
   Un losange de sol, un mur entre deux points, une boite posee sur la
   grille. Tout le decor sort de ces trois gestes.
   ===================================================================== */
function los(g,x,y,c){           /* le losange d'une tuile, coin haut en x,y */
  g.fillStyle=c;g.beginPath();
  g.moveTo(x,y);g.lineTo(x+TW/2,y+TH/2);g.lineTo(x,y+TH);g.lineTo(x-TW/2,y+TH/2);
  g.closePath();g.fill();
}
function quad(g,p,c){
  g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);
  for(var i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);
  g.closePath();g.fill();
}
/* UN MUR entre deux points du sol, monte de h. Rendu en parallelogramme :
   c'est la seule primitive dont un immeuble a besoin, les fenetres
   comprises — elles sont des murs minuscules poses sur le meme plan. */
function mur(g,ax,ay,bx,by,h0,h1,c){
  quad(g,[ax,ay-h0, bx,by-h0, bx,by-h1, ax,ay-h1],c);
}
function teinte(c,f){
  var n=parseInt(c.slice(1),16), r=(n>>16)&255, v=(n>>8)&255, b=n&255;
  r=Math.max(0,Math.min(255,Math.round(r*f)));
  v=Math.max(0,Math.min(255,Math.round(v*f)));
  b=Math.max(0,Math.min(255,Math.round(b*f)));
  return '#'+((1<<24)+(r<<16)+(v<<8)+b).toString(16).slice(1);
}

/* =====================================================================
   3. LE SOL, PEINT UNE FOIS POUR TOUTES
   Mille cinq cents losanges a soixante images par seconde, c'est le
   budget entier d'un telephone pour un decor qui ne bouge pas. On le
   peint donc dans un calque, et chaque image n'en recopie que le
   morceau visible.
   ===================================================================== */
var PAL={
  chaus:['#3b3e46','#363942','#40434b'],
  caniv:'#2e313a',
  trot: ['#8c8a84','#86847e','#92908a'],
  trotB:'#6e6c67',
  clou: '#d8d6cc',
  herbe:['#4e5048','#484a44','#54564e'],
  /* LE FLEUVE. Trois bleus sombres et proches : de l'eau vue de haut un
     soir d'hiver, pas une piscine. Assez sombre pour que les corps du
     tablier s'en detachent, et c'est tout ce qu'on lui demande. */
  eau:['#1f3c56','#24445f','#1b3650'],
  bandes:'#c8c4a8',
  /* LA PLACE : une pierre claire et chaude, assez pale pour que les
     corps s'y detachent — c'est le fond sur lequel on lira la foule. */
  dalle:['#9a9388','#948d82','#a09990'],
  pave: ['#827b72','#7c766d','#898279'],
  joint:'#6e6860'
};

function peindreSol(C,d){
  var cv=document.createElement('canvas');
  cv.width=MW; cv.height=MH+TH;
  var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
  var x,y,p,t;
  for(y=0;y<GH;y++)for(x=0;x<GW;x++){
    p=m2e(x,y); t=C.sol[y][x];
    var v=((x*7+y*13)%3);
    if(t===SOL.DALLE)los(g,p.x,p.y,PAL.dalle[v]);
    else if(t===SOL.PAVE)los(g,p.x,p.y,PAL.pave[v]);
    else if(t===SOL.CHAUS)los(g,p.x,p.y,PAL.chaus[v]);
    else if(t===SOL.CANIV)los(g,p.x,p.y,PAL.caniv);
    else if(t===SOL.CLOU)los(g,p.x,p.y,PAL.chaus[v]);
    else if(t===SOL.TROT)los(g,p.x,p.y,PAL.trot[v]);
    else if(t===SOL.HERBE)los(g,p.x,p.y,PAL.herbe[v]);
    else if(t===SOL.EAU)los(g,p.x,p.y,PAL.eau[(x*5+y*11)%3]);
    else los(g,p.x,p.y,'#2a2c32');
  }
  /* LE BORD DU TROTTOIR. Sans lui la chaussee et le trottoir sont deux
     aplats cote a cote et la rue est plate : c'est ce petit decrochement
     de trois points qui fait qu'on voit une bordure. */
  for(y=0;y<GH;y++)for(x=0;x<GW;x++){
    if(C.sol[y][x]!==SOL.TROT)continue;
    var basX=(x+1<GW)&&C.sol[y][x+1]!==SOL.TROT&&C.sol[y][x+1]!==SOL.ILOT&&C.sol[y][x+1]!==SOL.HERBE;
    var basY=(y+1<GH)&&C.sol[y+1][x]!==SOL.TROT&&C.sol[y+1][x]!==SOL.ILOT&&C.sol[y+1][x]!==SOL.HERBE;
    p=m2e(x,y);
    if(basX)mur(g,p.x+TW/2,p.y+TH/2,p.x,p.y+TH,0,3,PAL.trotB);
    if(basY)mur(g,p.x,p.y+TH,p.x-TW/2,p.y+TH/2,0,3,PAL.trotB);
    if(basX||basY){
      g.fillStyle='#a8a69e';
      if(basX)quad(g,[p.x+TW/2,p.y+TH/2-3, p.x,p.y+TH-3, p.x,p.y+TH-4, p.x+TW/2,p.y+TH/2-4]);
      if(basY)quad(g,[p.x,p.y+TH-3, p.x-TW/2,p.y+TH/2-3, p.x-TW/2,p.y+TH/2-4, p.x,p.y+TH-4]);
    }
  }
  /* LE DALLAGE DE LA PLACE. Un aplat de vingt-quatre tuiles sur trente
     est une nappe : il faut un motif pour que l'oeil accroche et mesure
     les distances. Un damier large de quatre tuiles, et un joint clair
     sur chaque dalle. */
  g.globalAlpha=0.16;
  for(y=0;y<GH;y++)for(x=0;x<GW;x++){
    var tt2=C.sol[y][x];
    if(tt2!==SOL.TROT&&tt2!==SOL.DALLE&&tt2!==SOL.PAVE)continue;
    p=m2e(x,y); g.strokeStyle='#ffffff'; g.lineWidth=1;
    g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+TW/2,p.y+TH/2);
    g.moveTo(p.x,p.y);g.lineTo(p.x-TW/2,p.y+TH/2);g.stroke();
  }
  g.globalAlpha=1;
  /* le damier, une dalle sur deux par carres de quatre */
  g.globalAlpha=0.055;
  for(y=AV.y0;y<=AV.y1;y++)for(x=0;x<GW;x++){
    if(C.sol[y][x]!==SOL.DALLE)continue;
    if(((x>>2)+(y>>2))%2)continue;
    p=m2e(x,y); los(g,p.x,p.y,'#ffffff');
  }
  g.globalAlpha=1;
  /* LA ROSE CENTRALE : un disque de pierre plus claire au milieu de la
     place, avec deux anneaux. Elle donne un centre, et un repere pour
     dire « ramene-les au milieu ». */
  var cxp=(RU.x0+RU.x1)/2+0.5, cyp=(AV.y0+AV.y1)/2+0.5;
  for(y=AV.y0;y<=AV.y1;y++)for(x=0;x<GW;x++){
    if(C.sol[y][x]!==SOL.DALLE)continue;
    var dxp=(x+0.5-cxp), dyp=(y+0.5-cyp), rr=Math.sqrt(dxp*dxp+dyp*dyp*2.0);
    if(rr>7.2)continue;
    p=m2e(x,y);
    los(g,p.x,p.y,(rr<2.2)?'#b4ac9e':((rr>5.4&&rr<6.4)?'#8a8278':'#a49c90'));
  }
  /* LA BANDE BLANCHE de l'axe, en pointilles, et les passages clous */
  var mid=Math.floor((AV.y0+AV.y1)/2);
  for(x=0;x<GW;x++){
    if(C.sol[mid][x]!==SOL.CHAUS)continue;
    if((x%3)===2)continue;
    p=m2e(x,mid);
    quad(g,[p.x-7,p.y+TH/2-3, p.x+7,p.y+TH/2+3, p.x+7,p.y+TH/2+5, p.x-7,p.y+TH/2-1],PAL.bandes);
  }
  var midx=Math.floor((RU.x0+RU.x1)/2);
  for(y=0;y<GH;y++){
    if(C.sol[y][midx]!==SOL.CHAUS)continue;
    if((y%3)===2)continue;
    p=m2e(midx,y);
    quad(g,[p.x+7,p.y+TH/2-3, p.x-7,p.y+TH/2+3, p.x-7,p.y+TH/2+5, p.x+7,p.y+TH/2-1],PAL.bandes);
  }
  for(y=0;y<GH;y++)for(x=0;x<GW;x++){
    if(C.sol[y][x]!==SOL.CLOU)continue;
    p=m2e(x,y);
    for(var k=-1;k<=1;k++){
      quad(g,[p.x-10+k*10,p.y+TH/2+k*5-2, p.x-4+k*10,p.y+TH/2+k*5+1,
              p.x+6+k*10,p.y+TH/2+k*5-4, p.x,p.y+TH/2+k*5-7],PAL.clou);
    }
  }
  /* la crasse : des flaques et des trainees, pour qu'aucun aplat ne
     reste parfaitement uniforme */
  g.globalAlpha=0.10;
  for(var i=0;i<420;i++){
    var gx=d.f()*GW, gy=d.f()*GH, tt=C.sol[Math.floor(gy)][Math.floor(gx)];
    if(tt===SOL.ILOT)continue;
    p=m2e(gx,gy); g.fillStyle=d.f()<0.5?'#000000':'#c8c0a8';
    g.beginPath();g.ellipse(p.x,p.y+TH/2,2+d.f()*9,1+d.f()*4,0,0,7);g.fill();
  }
  g.globalAlpha=1;
  /* les bouches d'egout */
  for(i=0;i<18;i++){
    var ex=d.e(1,GW-2), ey=d.f()<0.5?AV.y0:AV.y1;
    if(d.f()<0.4){ex=d.f()<0.5?RU.x0:RU.x1; ey=d.e(1,GH-2);}
    if(C.sol[ey][ex]!==SOL.CANIV)continue;
    p=m2e(ex,ey);
    los(g,p.x,p.y+1,'#22242a');
    g.strokeStyle='#44474f';g.lineWidth=1;
    for(var j=-2;j<=2;j++){g.beginPath();
      g.moveTo(p.x-7+j*3,p.y+TH/2+j*1.5);g.lineTo(p.x+5+j*3,p.y+TH/2+j*1.5-6);g.stroke();}
  }
  return cv;
}

/* =====================================================================
   4. LES IMMEUBLES
   Chacun est peint une fois dans son propre calque, puis recopie. Un
   immeuble n'est pas un pave colore : c'est deux murs et un toit, et
   sur les murs des travees de fenetres, une corniche, un soubassement,
   et au rez-de-chaussee une devanture avec son store.

   LE REPERE DES FACADES. Une face est donnee par ses deux pieds au sol.
   Tout ce qui se pose dessus — une fenetre, une enseigne, un balcon —
   est repere par u (de 0 a 1 le long de la face) et par sa hauteur. On
   n'ecrit donc jamais deux fois la trigonometrie de la projection.
   ===================================================================== */
/* HUIT STYLES AU LIEU DE CINQ. Une rue entiere batie sur cinq teintes
   se lit comme un motif repete des qu'on dezoome ; trois de plus, et
   deux immeubles voisins ne sont presque jamais jumeaux. */
var STYLES={
  pierre: {mur:'#a8a094', toit:'#6a6258', cadre:'#c8c0b0', soc:'#7e766c'},
  brique: {mur:'#8a5244', toit:'#5a4038', cadre:'#c0a894', soc:'#6a3e34'},
  crepi:  {mur:'#c2b49a', toit:'#7a6e5e', cadre:'#e0d6c0', soc:'#8e8470'},
  moderne:{mur:'#7e8894', toit:'#4e565e', cadre:'#aab4c0', soc:'#5e666e'},
  vieux:  {mur:'#9a8e7e', toit:'#60584c', cadre:'#b8ac98', soc:'#70685c'},
  ocre:   {mur:'#b89060', toit:'#6e5636', cadre:'#d8b888', soc:'#8a6a44'},
  ardoise:{mur:'#6e7682', toit:'#3e444c', cadre:'#96a0ac', soc:'#525a64'},
  pastel: {mur:'#a8b0a0', toit:'#5e6658', cadre:'#cdd4c4', soc:'#7c8474'}
};
var VITRE=['#2a3642','#32404e','#243040','#3a4a5a'];
var ALLUM=['#ffd98a','#ffe8b4','#e8c070','#fff0c8'];

function pointFace(ax,ay,bx,by,u){return [ax+(bx-ax)*u, ay+(by-ay)*u];}

function fenetre(g,ax,ay,bx,by,u0,u1,h0,h1,S,d,nuit){
  var a=pointFace(ax,ay,bx,by,u0), b=pointFace(ax,ay,bx,by,u1);
  mur(g,a[0],a[1],b[0],b[1],h0-1,h1+1,S.cadre);            /* l'encadrement */
  var on=nuit&&d.f()<0.42;
  mur(g,a[0],a[1],b[0],b[1],h0,h1,on?ALLUM[d.e(0,3)]:VITRE[d.e(0,3)]);
  /* le reflet : une diagonale claire en haut de la vitre, c'est elle qui
     fait qu'on lit du verre et pas un trou */
  var m=pointFace(a[0],a[1],b[0],b[1],0.45);
  if(!on)mur(g,a[0],a[1],m[0],m[1],h1-(h1-h0)*0.42,h1,'rgba(200,220,240,.13)');
  /* l'appui */
  mur(g,a[0],a[1],b[0],b[1],h0-2,h0-1,teinte(S.cadre,0.78));
}

function facade(g,ax,ay,bx,by,H,nt,S,d,nuit,devanture){
  var clair=(by>ay);                 /* la face qui descend vers la droite prend la lumiere */
  var base=teinte(S.mur,clair?1.0:0.74);
  mur(g,ax,ay,bx,by,0,H,base);
  /* les bandeaux d'etage : une ligne d'ombre tous les 22 points */
  var etg=22, rdc=30, nEt=Math.max(1,Math.floor((H-rdc)/etg));
  var i,j;
  for(i=0;i<=nEt;i++){
    var hh=rdc+i*etg;
    if(hh>H-6)break;
    mur(g,ax,ay,bx,by,hh-1,hh,teinte(base,0.86));
  }
  /* les travees de fenetres */
  var trav=Math.max(1,Math.round(nt*1.4));
  for(i=0;i<nEt;i++){
    var h0=rdc+i*etg+5, h1=h0+13;
    if(h1>H-9)break;
    for(j=0;j<trav;j++){
      var c=(j+0.5)/trav, w=0.30/trav;
      fenetre(g,ax,ay,bx,by,c-w,c+w,h0,h1,S,d,nuit);
      /* un balcon de temps en temps */
      if(d.f()<0.17){
        var a2=pointFace(ax,ay,bx,by,c-w*1.5), b2=pointFace(ax,ay,bx,by,c+w*1.5);
        mur(g,a2[0],a2[1],b2[0],b2[1],h0-4,h0-3,teinte(S.cadre,0.6));
        for(var k=0;k<=6;k++){
          var pk=pointFace(a2[0],a2[1],b2[0],b2[1],k/6);
          mur(g,pk[0],pk[1],pk[0]+0.9,pk[1],h0-4,h0+3,teinte(S.cadre,0.52));
        }
        mur(g,a2[0],a2[1],b2[0],b2[1],h0+3,h0+4,teinte(S.cadre,0.66));
      }
    }
  }
  /* le soubassement */
  mur(g,ax,ay,bx,by,0,9,teinte(S.soc,clair?1:0.78));
  mur(g,ax,ay,bx,by,9,10,teinte(S.soc,clair?1.18:0.9));
  /* LE REZ-DE-CHAUSSEE. Une rue sans devantures est un decor de maquette :
     c'est a hauteur d'oeil que la rue existe. */
  if(devanture){
    var nb=Math.max(1,Math.round(nt/2));
    for(i=0;i<nb;i++){
      var u0=i/nb+0.03, u1=(i+1)/nb-0.03;
      var a3=pointFace(ax,ay,bx,by,u0), b3=pointFace(ax,ay,bx,by,u1);
      var porte=d.f()<0.34;
      if(porte){
        var pc=(u0+u1)/2, pw=Math.min(0.09,(u1-u0)*0.3);
        mur(g,a3[0],a3[1],b3[0],b3[1],10,rdc-4,teinte(S.mur,clair?0.9:0.68));
        var pa=pointFace(ax,ay,bx,by,pc-pw), pb=pointFace(ax,ay,bx,by,pc+pw);
        mur(g,pa[0],pa[1],pb[0],pb[1],9,rdc-9,'#4a3a2c');
        mur(g,pa[0],pa[1],pb[0],pb[1],rdc-9,rdc-7,teinte(S.cadre,0.7));
        var po=pointFace(pa[0],pa[1],pb[0],pb[1],0.78);
        mur(g,po[0],po[1],po[0]+1.4,po[1]+0.7,16,17.4,'#d8c070');
      }else{
        /* la vitrine, son store et son enseigne */
        mur(g,a3[0],a3[1],b3[0],b3[1],10,rdc-8,'#1e2630');
        mur(g,a3[0],a3[1],b3[0],b3[1],12,rdc-11,d.f()<0.5?'#3a4e5e':'#2e3c4a');
        var r1=pointFace(a3[0],a3[1],b3[0],b3[1],0.1), r2=pointFace(a3[0],a3[1],b3[0],b3[1],0.5);
        mur(g,r1[0],r1[1],r2[0],r2[1],14,rdc-13,'rgba(210,230,250,.12)');
        if(nuit)mur(g,a3[0],a3[1],b3[0],b3[1],12,rdc-11,'rgba(255,214,130,.20)');
        var ens=['#c84a3a','#2e7a8a','#c89a2a','#4a7a4a','#8a4a8a'][d.e(0,4)];
        mur(g,a3[0],a3[1],b3[0],b3[1],rdc-7,rdc-1,ens);
        mur(g,a3[0],a3[1],b3[0],b3[1],rdc-7,rdc-6.2,teinte(ens,1.35));
        /* le store, raye, en avancee d'un point */
        if(d.f()<0.5){
          var dec=clair?1.6:-1.6;
          for(var q=0;q<8;q++){
            var sa=pointFace(a3[0],a3[1],b3[0],b3[1],q/8), sb=pointFace(a3[0],a3[1],b3[0],b3[1],(q+1)/8);
            mur(g,sa[0],sa[1]+dec*0.5,sb[0],sb[1]+dec*0.5,rdc-11,rdc-8,q%2?'#d8d2c4':'#b03a30');
          }
        }
      }
    }
  }
  /* la corniche */
  mur(g,ax,ay,bx,by,H-5,H-3,teinte(S.cadre,clair?0.92:0.72));
  mur(g,ax,ay,bx,by,H-3,H,teinte(S.cadre,clair?1.05:0.82));
}

function peindreBat(b,d,nuit){
  var A=m2e(b.x0,b.y0), B=m2e(b.x1+1,b.y0), C=m2e(b.x1+1,b.y1+1), D=m2e(b.x0,b.y1+1);
  var H=b.h, marge=(b.h<60?16:34);
  var xmin=D.x-6, xmax=B.x+6, ymin=A.y-H-marge, ymax=C.y+8;
  var cv=document.createElement('canvas');
  cv.width=Math.ceil(xmax-xmin); cv.height=Math.ceil(ymax-ymin);
  var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
  g.translate(-xmin,-ymin);
  var S=STYLES[b.style];
  /* L'OMBRE PORTEE SUIT LA HAUTEUR. Longue de huit points quelle que
     soit la taille du batiment, elle donnait la meme assise a un hangar
     de vingt points et a un immeuble de cent vingt. Elle s'allonge
     maintenant avec lui. */
  var oL=6+H*0.09;
  g.globalAlpha=0.30; g.fillStyle='#000';
  g.beginPath();
  g.moveTo(D.x+4,D.y+2);g.lineTo(C.x+4,C.y+2);g.lineTo(B.x+4,B.y+2);
  g.lineTo(B.x+4+oL,B.y+2+oL*0.5);g.lineTo(C.x+4+oL,C.y+2+oL*0.5);
  g.lineTo(D.x+4+oL,D.y+2+oL*0.5);
  g.closePath();g.fill(); g.globalAlpha=1;
  var nx=b.x1-b.x0+1, ny=b.y1-b.y0+1;
  /* la face de droite, puis celle de gauche : la seconde recouvre
     l'arete commune, ce qui donne le coin net */
  facade(g,B.x,B.y,C.x,C.y,H,ny,S,d,nuit,b.devD);
  facade(g,D.x,D.y,C.x,C.y,H,nx,S,d,nuit,b.devG);
  /* l'arete du coin, un point plus clair : sans elle les deux murs se
     fondent et le volume disparait */
  mur(g,C.x,C.y,C.x+0.9,C.y,0,H,teinte(S.mur,1.12));
  /* le toit */
  quad(g,[A.x,A.y-H, B.x,B.y-H, C.x,C.y-H, D.x,D.y-H],S.toit);
  quad(g,[A.x,A.y-H, B.x,B.y-H, C.x,C.y-H, D.x,D.y-H],'rgba(255,255,255,.05)');
  /* le gravier du toit, une edicule, des cheminees, une antenne */
  g.globalAlpha=0.2;
  for(var i=0;i<nx*ny*2;i++){
    var rx=b.x0+d.f()*nx, ry=b.y0+d.f()*ny, p=m2e(rx,ry);
    g.fillStyle=d.f()<0.5?'#000':'#fff';
    g.fillRect(p.x|0,(p.y-H)|0,1,1);
  }
  g.globalAlpha=1;
  var nche=(H<60?d.e(0,1):d.e(1,3));
  for(i=0;i<nche;i++){
    var cx=b.x0+0.6+d.f()*(nx-1.2), cy=b.y0+0.6+d.f()*(ny-1.2);
    var pc=m2e(cx,cy), ch=(H<60?d.e(4,8):d.e(7,16)), cw=5;
    mur(g,pc.x,pc.y-H,pc.x+cw,pc.y-H+cw/2,0,ch,teinte(S.soc,0.8));
    mur(g,pc.x+cw,pc.y-H+cw/2,pc.x,pc.y-H+cw,0,ch,teinte(S.soc,0.62));
    quad(g,[pc.x,pc.y-H-ch, pc.x+cw,pc.y-H+cw/2-ch, pc.x,pc.y-H+cw-ch, pc.x-cw,pc.y-H+cw/2-ch],teinte(S.soc,1.1));
  }
  if(H>=60&&d.f()<0.5){
    var pa=m2e(b.x0+nx*0.3,b.y0+ny*0.3);
    g.strokeStyle='#30343c';g.lineWidth=1;
    g.beginPath();g.moveTo(pa.x,pa.y-H);g.lineTo(pa.x,pa.y-H-d.e(10,22));g.stroke();
    g.beginPath();g.moveTo(pa.x-4,pa.y-H-14);g.lineTo(pa.x+4,pa.y-H-14);g.stroke();
  }
  /* la bordure du toit */
  g.strokeStyle=teinte(S.cadre,0.8);g.lineWidth=1;
  g.beginPath();g.moveTo(A.x,A.y-H);g.lineTo(B.x,B.y-H);g.lineTo(C.x,C.y-H);g.lineTo(D.x,D.y-H);
  g.closePath();g.stroke();
  b.cv=cv; b.ox=xmin; b.oy=ymin; b.prof=(b.x1+1)+(b.y1+1);
}

/* =====================================================================
   5. LE MOBILIER, LES VEHICULES
   Chaque type est peint une seule fois dans un petit calque, puis
   recopie autant de fois qu'il apparait. Un lampadaire pose quarante
   fois ne coute donc qu'un seul dessin.
   ===================================================================== */
function loc(gx,gy){return [(gx-gy)*(TW/2), (gx+gy)*(TH/2)];}
/* un pave aligne sur la grille, vu de trois-quarts */
function pave(g,ox,oy,a,b,h,cT,cG,cD){
  var A=loc(0,0),B=loc(a,0),C=loc(a,b),D=loc(0,b);
  var P=function(p){return [p[0]+ox,p[1]+oy];};
  A=P(A);B=P(B);C=P(C);D=P(D);
  mur(g,B[0],B[1],C[0],C[1],0,h,cD);
  mur(g,D[0],D[1],C[0],C[1],0,h,cG);
  quad(g,[A[0],A[1]-h, B[0],B[1]-h, C[0],C[1]-h, D[0],D[1]-h],cT);
}
function ombreSol(g,ox,oy,rx,ry){
  g.globalAlpha=0.28;g.fillStyle='#000';
  g.beginPath();g.ellipse(ox,oy,rx,ry,0,0,7);g.fill();g.globalAlpha=1;
}
/* fabrique un calque et renvoie {cv,ox,oy} : ox,oy disent ou se trouve
   le point d'ancrage au sol dans le calque */
function calque(w,h,ax,ay,fn){
  var cv=document.createElement('canvas');cv.width=w;cv.height=h;
  var g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  fn(g,ax,ay);
  return {cv:cv,ox:ax,oy:ay};
}

var OBJ={};
function faireObjets(nuit){
  OBJ.lampadaire=calque(34,80,10,74,function(g,x,y){
    ombreSol(g,x+5,y+1,9,4);
    pave(g,x-2,y-1,0.14,0.14,4,'#3a3e46','#2e323a','#262a30');
    mur(g,x,y-4,x+0.9,y-4,0,54,'#3a3e46');
    mur(g,x+0.9,y-4,x+1.8,y-4,0,54,'#2a2e36');
    /* le bras et la lanterne */
    g.strokeStyle='#3a3e46';g.lineWidth=2;
    g.beginPath();g.moveTo(x+1,y-58);g.quadraticCurveTo(x+7,y-64,x+14,y-62);g.stroke();
    pave(g,x+11,y-62,0.3,0.3,4,'#4a4e56','#3a3e46','#32363e');
    g.fillStyle=nuit?'#ffe8a8':'#c8ccd4';
    g.beginPath();g.ellipse(x+15,y-58,5,2.4,0,0,7);g.fill();
    if(nuit){var q=g.createRadialGradient(x+15,y-56,0,x+15,y-56,22);
      q.addColorStop(0,'rgba(255,226,160,.5)');q.addColorStop(1,'rgba(255,226,160,0)');
      g.fillStyle=q;g.beginPath();g.arc(x+15,y-56,22,0,7);g.fill();}
  });
  OBJ.poubelle=calque(26,34,13,30,function(g,x,y){
    ombreSol(g,x,y,8,4);
    pave(g,x-5,y-6,0.32,0.32,15,'#3e4a52','#2e3840','#263038');
    pave(g,x-6,y-7,0.37,0.37,2,'#58646e','#48545e','#3e4a52');
    mur(g,x-2,y-4,x+3,y-1.5,8,13,'#2a3238');
  });
  OBJ.banc=calque(44,30,8,26,function(g,x,y){
    ombreSol(g,x+11,y,14,5);
    pave(g,x,y-8,0.12,0.12,7,'#3a3e46','#2e323a','#262a30');
    pave(g,x+17,y+1,0.12,0.12,7,'#3a3e46','#2e323a','#262a30');
    for(var i=0;i<3;i++)
      mur(g,x,y-8+i*0,x+20,y+2,7+i*0.1,8+i*0.1,i%2?'#7a5a38':'#8a6a44');
    pave(g,x,y-8,1.3,0.16,8,'#8a6a44','#7a5a38','#6a4e30');
    pave(g,x,y-8,1.3,0.05,15,'#7a5a38','#6a4e30','#5e4428');
  });
  /* LE PARAPET DU PONT. Un muret de pierre plein, avec sa main
     courante : c'est lui qui fait qu'on lit un pont et pas une rue
     bordee de vide. Il occupe une tuile entiere en longueur, et on en
     pose un par case du bord. */
  OBJ.parapet=calque(40,30,4,24,function(g,x,y){
    var A=[x,y-2], B2=[x+32,y+14];
    mur(g,A[0],A[1],B2[0],B2[1],0,13,'#6e6a62');
    mur(g,A[0],A[1],B2[0],B2[1],9,13,'#7e7a72');
    mur(g,A[0],A[1],B2[0],B2[1],13,15.5,'#8e8a80');
    /* les refends, tous les tiers : une pierre sans joint n'est pas de
       la pierre */
    for(var i=1;i<3;i++){var t=i/3,px=A[0]+(B2[0]-A[0])*t,py=A[1]+(B2[1]-A[1])*t;
      mur(g,px,py,px+0.8,py,0,12,'#5e5a54');}
  });
  OBJ.barriere=calque(40,32,4,28,function(g,x,y){
    ombreSol(g,x+14,y,15,4);
    /* la barriere Vauban : deux pieds, une lisse haute, six barreaux */
    pave(g,x,y-2,0.1,0.1,2,'#6a6e76','#5a5e66','#4e525a');
    pave(g,x+26,y+11,0.1,0.1,2,'#6a6e76','#5a5e66','#4e525a');
    var A=[x,y-2],B2=[x+28,y+12];
    mur(g,A[0],A[1],B2[0],B2[1],2,22,'rgba(0,0,0,0)');
    for(var i=0;i<=6;i++){var t=i/6,px=A[0]+(B2[0]-A[0])*t,py=A[1]+(B2[1]-A[1])*t;
      mur(g,px,py,px+1.1,py,2,21,'#9aa0a8');}
    mur(g,A[0],A[1],B2[0],B2[1],20,22,'#aab0b8');
    mur(g,A[0],A[1],B2[0],B2[1],11,12.6,'#9aa0a8');
    mur(g,A[0],A[1],B2[0],B2[1],2,3.4,'#7a8088');
  });
  /* LA BARRICADE MONTEE : ce qui traine sur une place, empile en
     travers — barrieres renversees, un banc, une poubelle, des
     planches. Elle doit se lire comme un tas, pas comme un mur. */
  OBJ.barricade=calque(58,52,22,44,function(g,x,y){
    ombreSol(g,x+8,y+2,22,9);
    /* le socle : des barrieres couchees */
    pave(g,x-6,y-8,1.05,0.5,5,'#7a8088','#6a7078','#5c6268');
    pave(g,x-2,y-4,0.9,0.45,9,'#8a9098','#78808a','#68707a');
    /* un banc renverse, en biais */
    mur(g,x-4,y-2,x+16,y+8,5,13,'#8a6a44');
    mur(g,x-4,y-2,x+16,y+8,13,14.4,'#a0805a');
    /* une poubelle couchee */
    pave(g,x+10,y+2,0.4,0.34,8,'#3e4a52','#2e3840','#263038');
    /* des planches en travers, le desordre */
    mur(g,x-8,y+2,x+10,y+11,10,12,'#6a5a3e');
    mur(g,x-5,y-6,x+13,y+3,16,18,'#7a6a4a');
    mur(g,x-1,y-9,x+15,y-1,21,22.6,'#5e5038');
    /* un drapeau plante dessus */
    g.fillStyle='#2e2a24';g.fillRect((x+2)|0,(y-36)|0,1,16);
    g.fillStyle='#c03a30';g.fillRect((x+3)|0,(y-36)|0,9,6);
    g.fillStyle='#e05a46';g.fillRect((x+3)|0,(y-36)|0,9,1);
  });
  OBJ.plot=calque(20,26,10,22,function(g,x,y){
    ombreSol(g,x,y,6,3);
    pave(g,x-3,y-4,0.2,0.2,12,'#8a8e96','#7a7e86','#6e727a');
    pave(g,x-3,y-4,0.2,0.2,13.4,'#c8ccd4','#b0b4bc','#a0a4ac');
  });
  OBJ.arbre=calque(54,86,27,80,function(g,x,y){
    ombreSol(g,x,y,14,6);
    pave(g,x-4,y-4,0.26,0.26,3,'#4a4038','#3a3028','#322820');
    mur(g,x-1,y-2,x+1.4,y-2,2,30,'#5a4632');
    mur(g,x+1.4,y-2,x+3.8,y-2,2,30,'#46362a');
    var fe=['#3e6a38','#4a7a40','#355e30','#56884a'];
    for(var i=0;i<22;i++){
      var a=(i/22)*6.283, r=9+((i*37)%11);
      g.fillStyle=fe[i%4];
      g.beginPath();g.ellipse(x+Math.cos(a)*r*0.9, y-40-Math.sin(a)*r*0.5-(i%3)*4, 7+(i%3)*2, 5+(i%2)*2,0,0,7);g.fill();
    }
  });
  OBJ.feu=calque(26,78,8,72,function(g,x,y){
    ombreSol(g,x,y,6,3);
    pave(g,x-2,y-2,0.14,0.14,3,'#2e323a','#262a30','#20242a');
    mur(g,x,y-2,x+1.2,y-2,0,48,'#3a3e46');
    pave(g,x-2,y-44,0.2,0.2,16,'#2a2e36','#22262c','#1c2026');
    var c=['#c83a30','#d8a830','#3aa84a'];
    for(var i=0;i<3;i++){g.fillStyle=c[i];
      g.beginPath();g.ellipse(x+3,y-56+i*5,2.2,1.6,0,0,7);g.fill();}
  });
  OBJ.abri=calque(90,70,10,62,function(g,x,y){
    ombreSol(g,x+30,y,32,9);
    pave(g,x,y-2,0.08,0.08,30,'#6a7078','#5a606a','#4e545c');
    pave(g,x+36,y+16,0.08,0.08,30,'#6a7078','#5a606a','#4e545c');
    mur(g,x+1,y-1,x+37,y+17,4,28,'rgba(150,200,230,.22)');
    mur(g,x+1,y-1,x+37,y+17,26,28,'#8a9098');
    pave(g,x-2,y-4,1.35,0.2,34,'#9aa0a8','#8a9098','#7a8088');
    mur(g,x+6,y+2,x+30,y+14,4,14,'#3a4a58');
    mur(g,x+6,y+2,x+30,y+14,14,22,'#d8d2c4');
  });
  OBJ.borne=calque(16,24,8,20,function(g,x,y){
    ombreSol(g,x,y,4,2);
    pave(g,x-2,y-3,0.14,0.14,10,'#c04a30','#a83a24','#8e301c');
    g.fillStyle='#d8d2c4';g.fillRect(x-1,y-12,3,1);
  });
  /* LA FONTAINE, au centre de la place : un bassin octogonal, une vasque
     et un jet. C'est le repere dont une place a besoin — sans lui, vingt
     tuiles de dallage ne sont qu'une nappe. */
  OBJ.fontaine=calque(96,74,48,64,function(g,x,y){
    ombreSol(g,x+3,y+2,34,16);
    /* le bassin : deux anneaux de pierre et l'eau au fond */
    var A=['#8e867a','#9a9286','#7e766a'];
    for(var i=0;i<3;i++){
      g.fillStyle=A[i];g.beginPath();
      g.ellipse(x,y-i*2,32-i*2,15.5-i,0,0,7);g.fill();
    }
    g.fillStyle='#3e6a7e';g.beginPath();g.ellipse(x,y-5,26,12.5,0,0,7);g.fill();
    g.fillStyle='#4e8298';g.beginPath();g.ellipse(x,y-5.6,24,11.4,0,0,7);g.fill();
    /* les reflets, deux arcs clairs */
    g.strokeStyle='rgba(200,235,250,.5)';g.lineWidth=1;
    g.beginPath();g.ellipse(x-5,y-7,13,5.5,0.3,3.6,5.6);g.stroke();
    g.beginPath();g.ellipse(x+7,y-4,9,4,-0.2,3.3,5.0);g.stroke();
    /* le pied et la vasque */
    pave(g,x-3,y-14,0.2,0.2,13,'#a09888','#8e867a','#7e766a');
    g.fillStyle='#9a9286';g.beginPath();g.ellipse(x,y-19,10,4.6,0,0,7);g.fill();
    g.fillStyle='#4e8298';g.beginPath();g.ellipse(x,y-20,8,3.6,0,0,7);g.fill();
    pave(g,x-2,y-24,0.14,0.14,9,'#a09888','#8e867a','#7e766a');
    /* le jet et sa retombee */
    g.fillStyle='rgba(205,240,255,.75)';g.fillRect(x-1,y-40,2,14);
    g.fillStyle='rgba(205,240,255,.45)';
    for(var j=0;j<14;j++){
      var a2=(j/14)*6.283, r2=4+(j%4)*2.4;
      g.fillRect((x+Math.cos(a2)*r2*1.7)|0,(y-30+Math.sin(a2)*r2*0.7)|0,1,2);
    }
  });
  /* LE KIOSQUE : un pavillon de place, bas, pour casser le vide */
  OBJ.kiosque=calque(84,80,42,70,function(g,x,y){
    ombreSol(g,x+4,y+2,26,12);
    pave(g,x-16,y-10,1.0,1.0,4,'#8e867a','#7e766a','#6e665a');
    for(var i=0;i<4;i++){
      var dx2=[-14,14,0,0][i], dy2=[0,0,-7,7][i];
      pave(g,x+dx2,y-10+dy2,0.1,0.1,24,'#3e4a52','#36424a','#2e3a42');
    }
    pave(g,x-18,y-13,1.14,1.14,30,'#2e5a6a','#26505e','#1e4452');
    quad(g,[x,y-56, x+20,y-46, x,y-36, x-20,y-46],'#2a6a7e');
    quad(g,[x,y-58, x+20,y-48, x,y-38, x-20,y-48],'#3a7e92');
    g.fillStyle='#d8c060';g.fillRect(x-1,y-64,2,7);
  });
  OBJ.panneau=calque(24,60,12,54,function(g,x,y){
    ombreSol(g,x,y,5,3);
    mur(g,x,y-2,x+1.1,y-2,0,36,'#6a7078');
    pave(g,x-5,y-38,0.3,0.06,14,'#d8d8d0','#2a4a8a','#24407a');
    mur(g,x-5,y-38,x+5,y-33,4,10,'#ffffff');
  });
}

var VEH={};
function faireVehicules(nuit){
  function voiture(sens,c1,c2,lg){
    var a=sens==='x'?lg:0.72, b=sens==='x'?0.72:lg;
    var w=Math.ceil((a+b)*TW/2)+18, h=Math.ceil((a+b)*TH/2)+40;
    var ax=Math.ceil(b*TW/2)+9, ay=h-Math.ceil((a+b)*TH/2)-6;
    return calque(w,h,ax,ay,function(g,x,y){
      g.globalAlpha=0.3;g.fillStyle='#000';
      g.beginPath();g.ellipse(x+(a-b)*8,y+(a+b)*4,(a+b)*9,(a+b)*4.2,0,0,7);g.fill();
      g.globalAlpha=1;
      /* les roues, puis la caisse, puis l'habitacle en retrait */
      pave(g,x+2,y+1,a-0.12,b-0.12,5,'#14161a','#101216','#0c0e12');
      pave(g,x,y,a,b,13,c1,teinte(c1,0.8),teinte(c1,0.64));
      pave(g,x,y,a,b,14.4,teinte(c1,1.16),teinte(c1,0.9),teinte(c1,0.74));
      var ia=a*0.56, ib=b*0.56, dx=(a-ia)*TW/4, dy=(a-ia)*TH/4+(b-ib)*TH/4;
      pave(g,x+((a-ia)-(b-ib))*8,y+((a-ia)+(b-ib))*4,ia,ib,10,teinte(c2,1.1),c2,teinte(c2,0.8));
      /* le pare-brise */
      var A=loc(0,0);
      mur(g,x+((a-ia)-(b-ib))*8,y+((a-ia)+(b-ib))*4,
            x+((a-ia)-(b-ib))*8+ia*16, y+((a-ia)+(b-ib))*4+ia*8, 14,22,'#1e2a36');
      /* les phares */
      g.fillStyle=nuit?'#fff2c0':'#e8e4d8';
      var pp=loc(a,b*0.2);
      g.fillRect(x+pp[0]-3,y+pp[1]-10,3,2);
      g.fillStyle='#c84a3a';
      var pr=loc(0,b*0.8); g.fillRect(x+pr[0],y+pr[1]-10,3,2);
    });
  }
  VEH.vx1=voiture('x','#9a3a30','#2a3038',1.6);
  VEH.vx2=voiture('x','#2a5a8a','#2a3038',1.6);
  VEH.vx3=voiture('x','#d8d2c4','#2a3038',1.6);
  VEH.vy1=voiture('y','#3a6a4a','#2a3038',1.6);
  VEH.vy2=voiture('y','#8a8e96','#2a3038',1.6);
  VEH.cam=voiture('x','#2e3a4a','#20262e',2.4);
  /* LE CAMION A EAU. Plus haut qu'une camionnette, avec une cuve, un
     gyrophare et un canon oriente vers l'avant : il faut le reconnaitre
     de loin, c'est la piece qu'on vient chercher des yeux quand la
     pression monte. */
  /* LE CAMION A EAU. Premiere version : un pave de deux tons sombres,
     qui se lisait comme une tache noire de trois tuiles. Il faut le
     reconnaitre de loin, c'est la piece qu'on cherche des yeux quand la
     pression monte — donc une caisse claire, une cuve bombee qui
     depasse, un canon qui pointe, et une bande reflechissante. */
  VEH.eau=(function(){
    var a=2.6, b=1.05;
    var w=Math.ceil((a+b)*TW/2)+30, h=Math.ceil((a+b)*TH/2)+70;
    var ax=Math.ceil(b*TW/2)+15, ay=h-Math.ceil((a+b)*TH/2)-10;
    return calque(w,h,ax,ay,function(g,x,y){
      g.globalAlpha=0.32;g.fillStyle='#000';
      g.beginPath();g.ellipse(x+(a-b)*8+3,y+(a+b)*4+2,(a+b)*10,(a+b)*4.4,0,0,7);g.fill();
      g.globalAlpha=1;
      /* les roues */
      pave(g,x+2,y+1,a-0.16,b-0.16,6,'#15171b','#111317','#0d0f13');
      /* le chassis, bleu nuit clair pour se detacher du bitume */
      pave(g,x,y,a,b,16,'#4a5e72','#3e5062','#344454');
      pave(g,x,y,a,b,17.6,'#5e7488','#4a5e72','#3e5062');
      /* la bande reflechissante, a hauteur d'oeil */
      mur(g,x,y,x+a*16,y+a*8,9,12.5,'#e0e6ec');
      mur(g,x,y,x+a*16,y+a*8,12.5,13.6,'#c03a30');
      /* la cuve, bombee et plus claire */
      pave(g,x+7,y+3.6,a*0.58,b*0.74,32,'#8e9aa6','#78848e','#66727c');
      pave(g,x+7,y+3.6,a*0.58,b*0.74,33.8,'#a6b2be','#8e9aa6','#78848e');
      mur(g,x+7,y+3.6,x+7+a*0.58*16,y+3.6+a*0.58*8,20,30,'rgba(255,255,255,.14)');
      /* la cabine vitree */
      pave(g,x-1,y-0.6,a*0.24,b*0.84,27,'#5a6e82','#4a5e70','#3e5060');
      mur(g,x+1,y+0.6,x+1+a*0.24*16,y+0.6+a*0.24*8,18,26,'#1e2e3e');
      mur(g,x+1,y+0.6,x+1+a*0.24*16,y+0.6+a*0.24*8,24,26,'rgba(190,220,245,.35)');
      /* LE CANON, sur la cuve et pointe vers l'avant */
      pave(g,x+5,y+3,0.34,0.34,12,'#39434d','#2f3942','#262e36');
      mur(g,x+1,y+7,x-13,y+0,44,47.5,'#98a2aa');
      mur(g,x+1,y+7,x-13,y+0,47.5,48.6,'#c4ccd4');
      quad(g,[x-13,y-47,x-18,y-49.5,x-18,y-45.5,x-13,y-43],'#d8dee4');
      /* le gyrophare */
      g.fillStyle='#2a3038';g.fillRect((x+9)|0,(y-28)|0,6,2);
      g.fillStyle='#4ab0f0';g.fillRect((x+10)|0,(y-30)|0,4,2);
      g.fillStyle='rgba(74,176,240,.35)';g.fillRect((x+7)|0,(y-31)|0,10,4);
    });
  })();
  VEH.four=voiture('y','#c8c4b8','#20262e',2.1);
}

/* =====================================================================
   6. LE PERSONNAGE
   Quatre directions, quatre poses de marche. En isometrique les quatre
   directions se reduisent a deux dessins — de face et de dos — qu'on
   retourne : le reste est du temps perdu a cette etape.
   ===================================================================== */
var PERSO={};
function pix(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h);}
function peindrePerso(g,x,y,dos,f,P){
  /* f : 0 et 2 pieds joints, 1 et 3 pas ecarte */
  var ec=(f===1?-1:f===3?1:0);
  ombreSol(g,x,y,7,3);
  /* jambes */
  pix(g,x-3+ec,y-9,3,9,P.pan); pix(g,x+1-ec,y-9,3,9,P.pan);
  pix(g,x-3+ec,y-2,3,2,'#17181c'); pix(g,x+1-ec,y-2,3,2,'#17181c');
  /* torse et gilet */
  pix(g,x-4,y-21,9,12,P.ten);
  pix(g,x-4,y-19,9,7,P.gil);
  pix(g,x-4,y-19,9,1,teinte(P.gil,1.3));
  /* bras */
  pix(g,x-6,y-20,2,9,P.ten); pix(g,x+5,y-20,2,9,P.ten);
  pix(g,x-6,y-12,2,2,P.pea); pix(g,x+5,y-12,2,2,P.pea);
  /* tete, casque, visiere */
  pix(g,x-3,y-27,7,6,P.pea);
  pix(g,x-4,y-29,9,5,P.cas);
  pix(g,x-4,y-29,9,1,teinte(P.cas,1.35));
  pix(g,x-5,y-25,11,2,teinte(P.cas,0.8));
  if(!dos){
    pix(g,x-3,y-24,7,3,'rgba(150,200,230,.5)');
    pix(g,x-3,y-24,7,1,'rgba(220,240,255,.7)');
    pix(g,x-2,y-21,5,1,teinte(P.pea,0.7));
  }else{
    pix(g,x-3,y-24,7,3,teinte(P.cas,0.74));
  }
  /* le bouclier, du cote qui regarde la rue */
  if(P.bou){
    var bx=dos?x+4:x-9;
    pix(g,bx,y-24,6,16,P.bou);
    pix(g,bx,y-24,6,2,teinte(P.bou,1.3));
    pix(g,bx+1,y-22,4,10,'rgba(170,210,240,.3)');
    pix(g,bx,y-9,6,1,teinte(P.bou,0.7));
  }
}
function fairePerso(){
  var P={pea:'#c08a68',ten:'#23262e',gil:'#2e333d',pan:'#1b1e25',cas:'#2a2f38',bou:'#4a5a6a'};
  PERSO.img=[];
  for(var d2=0;d2<2;d2++){
    PERSO.img[d2]=[];
    for(var f=0;f<4;f++){
      PERSO.img[d2][f]=calque(30,40,15,36,function(g,x,y){peindrePerso(g,x,y,d2===1,f,P);});
    }
  }
}

/* =====================================================================
   7. OU L'ON POSE LES CHOSES
   Le mobilier longe les trottoirs, les vehicules stationnent le long du
   caniveau. Chaque objet declare la tuile qu'il bloque : la carte de
   passage est faite en meme temps que le decor, jamais apres.
   ===================================================================== */
function garnir(C,d,nuit){
  var O=[], x, y;
  function poser(t,gx,gy,bloque){
    O.push({t:t,gx:gx,gy:gy,prof:gx+gy});
    if(bloque){var ix=Math.floor(gx),iy=Math.floor(gy);
      if(C.bloc[iy]&&C.bloc[iy][ix]!==undefined)C.bloc[iy][ix]=1;}
  }
  /* le long des deux trottoirs de l'avenue */
  var ligneN=AV.y0-1, ligneS=AV.y1+1;
  for(x=1;x<GW-1;x++){
    if(C.sol[ligneN][x]!==SOL.TROT&&C.sol[ligneS][x]!==SOL.TROT)continue;
    [ligneN,ligneS].forEach(function(gy){
      if(C.sol[gy][x]!==SOL.TROT)return;
      var r=d.f();
      if((x%7)===3)poser('lampadaire',x+0.5,gy+0.5,true);
      else if((x%11)===5)poser('arbre',x+0.5,gy+0.5,true);
      else if(r<0.07)poser('poubelle',x+0.5,gy+0.5,true);
      else if(r<0.13)poser('banc',x+0.2,gy+0.3,true);
      else if(r<0.17)poser('panneau',x+0.5,gy+0.6,true);
      else if(r<0.20)poser('borne',x+0.5,gy+0.4,false);
    });
  }
  /* et le long de la rue transversale */
  var ligneO=RU.x0-1, ligneE=RU.x1+1;
  for(y=1;y<GH-1;y++){
    [ligneO,ligneE].forEach(function(gx){
      if(C.sol[y][gx]!==SOL.TROT)return;
      var r=d.f();
      if((y%6)===2)poser('lampadaire',gx+0.5,y+0.5,true);
      else if((y%13)===7)poser('arbre',gx+0.5,y+0.5,true);
      else if(r<0.08)poser('poubelle',gx+0.5,y+0.5,true);
      else if(r<0.12)poser('plot',gx+0.5,y+0.5,true);
    });
  }
  /* LE MOBILIER DE LA PLACE. Le pourtour avait ses lampadaires ; c'est
     le centre qui manquait. Une fontaine au milieu, deux alignements
     d'arbres qui cadrent la perspective, des bancs tournes vers l'eau,
     un kiosque dans un angle. Rien de decoratif : chaque piece bloque
     une case et modifie le chemin de la foule. */
  var cxp=Math.round((RU.x0+RU.x1)/2), cyp=Math.round((AV.y0+AV.y1)/2);
  poser('fontaine',cxp+0.5,cyp+0.5,true);
  for(var oy2=-1;oy2<=1;oy2++)for(var ox2=-2;ox2<=2;ox2++){
    var fx2=cxp+ox2, fy2=cyp+oy2;
    if(C.bloc[fy2]&&C.bloc[fy2][fx2]!==undefined)C.bloc[fy2][fx2]=1;
  }
  /* deux alignements d'arbres, nord et sud de la fontaine */
  [cyp-7,cyp+7].forEach(function(ly){
    for(var ax2=cxp-12;ax2<=cxp+12;ax2+=4){
      if(ax2<2||ax2>GW-3)continue;
      if(C.sol[ly]&&C.sol[ly][ax2]===SOL.DALLE)poser('arbre',ax2+0.5,ly+0.5,true);
    }
  });
  /* des bancs tournes vers l'eau */
  [[cxp-5,cyp-3],[cxp+4,cyp-3],[cxp-5,cyp+3],[cxp+4,cyp+3]].forEach(function(b2){
    if(C.sol[b2[1]]&&C.sol[b2[1]][b2[0]]===SOL.DALLE)poser('banc',b2[0]+0.2,b2[1]+0.3,true);
  });
  /* le kiosque, a l'ecart */
  var kx=cxp-13, ky=cyp+6;
  if(C.sol[ky]&&C.sol[ky][kx]===SOL.DALLE){
    poser('kiosque',kx+0.5,ky+0.5,true);
    for(var qy=ky-1;qy<=ky+1;qy++)for(var qx=kx-1;qx<=kx+1;qx++)
      if(C.bloc[qy]&&C.bloc[qy][qx]!==undefined)C.bloc[qy][qx]=1;
  }
  /* les feux aux quatre coins de l'intersection */
  [[RU.x0-1,AV.y0-1],[RU.x1+1,AV.y0-1],[RU.x0-1,AV.y1+1],[RU.x1+1,AV.y1+1]].forEach(function(c){
    poser('feu',c[0]+0.5,c[1]+0.5,true);
  });
  /* un abribus sur chaque trottoir long */
  poser('abri',8.2,ligneS+0.2,true);
  for(x=8;x<=11;x++)if(C.bloc[ligneS])C.bloc[ligneS][x]=1;
  poser('abri',GW-13.8,ligneN+0.2,true);
  for(x=GW-14;x<=GW-11;x++)if(C.bloc[ligneN])C.bloc[ligneN][x]=1;
  /* LE BARRAGE. Deux rangees de barrieres en travers de l'avenue, a
     l'est : c'est la raison d'etre de la rue, autant qu'elle soit la
     des la premiere image. */
  /* LE BARRAGE NE FERME PAS LA RUE. Premiere version : des barrieres
     sur les six tuiles de chaussee, toutes bloquantes. Le cortege butait
     dessus et ne pouvait physiquement PAS atteindre la limite de la
     mission : la defaite etait injouable, on gagnait meme en retirant
     tous les policiers. Les barrieres tiennent les deux bords ; le
     milieu reste ouvert, et c'est le cordon — pas le decor — qui le
     ferme. */
  /* LES BARRIERES FERMENT LES TROTTOIRS, le cordon ferme la chaussee.
     Premiere version : elles barraient la chaussee et laissaient les
     trottoirs ouverts — exactement l'inverse. Le cortege contournait le
     cordon par les cotes, sept hommes passaient en vingt secondes et la
     mission etait imperdable d'un cote, ingagnable de l'autre. */
  /* LES BARRIERES FERMENT LA PLACE, SAUF UN PASSAGE.
     Sur une avenue de six tuiles, le cordon fermait la rue a lui seul.
     Sur une place de vingt-quatre, trente-quatre hommes n'en couvrent
     plus qu'un tiers : la foule passait par les cotes et la mission
     etait perdue quoi qu'on fasse.
     Premiere tentative : un entonnoir dont les ailes avancaient en
     diagonale. Mauvaise idee — une diagonale de barrieres est un
     ESCALIER, et on passe entre deux marches. La ligne est maintenant
     DROITE, sur deux rangs, et ne laisse qu'un passage de neuf tuiles
     que le cordon tient vraiment. */
  /* LE PASSAGE FAIT TREIZE TUILES, ET C'EST VOULU.
     Il en faisait sept, exactement la largeur du cordon : tout passait
     par la, le cordon couvrait tout, et plus rien ne pouvait se
     produire. On a mesure cent quarante secondes sans qu'un seul
     manifestant franchisse la ligne, puis la moitie du cortege d'un
     coup quand un evenement de fin de partie forcait le verrou. Un
     bras de fer frontal ou aucun des deux camps n'a de decision a
     prendre.
     Treize tuiles pour une ligne qui en couvre huit : la police doit
     choisir OU tenir et le cortege OU pousser. Les deux camps ont
     quelque chose a decider a chaque instant, et c'est tout ce qu'on
     demande a une place. */
  /* LES PARAPETS, UNE FOIS POUR TOUTES. Sur le pont, chaque case du
     bord en recoit un : c'est la seule chose qui distingue un tablier
     d'une rue, et elle doit etre la des la premiere image. */
  if(TER.eau){
    for(x=TER.rive;x<TER.pref.x0;x++){
      poser('parapet',x+0.5,AV.y0-0.4,true);
      poser('parapet',x+0.5,AV.y1+1.4,true);
    }
  }
  var bx=TER.bx, midB=Math.round((AV.y0+AV.y1)/2), demi=TER.demi;
  for(y=AV.y0;y<=AV.y1;y++){
    if(y>=midB-demi&&y<=midB+demi)continue;      /* le passage reste ouvert */
    poser('barriere',bx+0.1,y+0.05,true);
    if(C.bloc[y]){C.bloc[y][bx]=1;C.bloc[y][bx+1]=1;}
  }
  /* les deux bornes qui marquent le passage, pour qu'on le voie */
  poser('plot',bx+0.5,midB-demi-0.5,true);
  poser('plot',bx+0.5,midB+demi+1.5,true);
  /* les voitures en stationnement, le long du caniveau */
  var pris={};
  for(x=2;x<GW-3;x++){
    [AV.y0,AV.y1].forEach(function(gy){
      if(C.sol[gy][x]!==SOL.CANIV)return;
      if(pris[gy+'_'+(x-1)]||pris[gy+'_'+(x-2)])return;
      if(x>=RU.x0-TROT-2&&x<=RU.x1+TROT+2)return;
      if(d.f()>0.22)return;
      var t=d.f()<0.17?'cam':['vx1','vx2','vx3'][d.e(0,2)];
      O.push({t:t,gx:x,gy:gy+0.12,prof:x+gy+1.6,veh:true});
      pris[gy+'_'+x]=1;
      var lg=(t==='cam')?3:2;
      for(var k=0;k<lg;k++)if(C.bloc[gy]&&C.bloc[gy][x+k]!==undefined)C.bloc[gy][x+k]=1;
    });
  }
  for(y=2;y<GH-3;y++){
    [RU.x0,RU.x1].forEach(function(gx){
      if(C.sol[y][gx]!==SOL.CANIV)return;
      if(y>=AV.y0-TROT-2&&y<=AV.y1+TROT+2)return;
      if(d.f()>0.16)return;
      var t=d.f()<0.2?'four':['vy1','vy2'][d.e(0,1)];
      O.push({t:t,gx:gx+0.12,gy:y,prof:gx+y+1.6,veh:true});
      for(var k=0;k<2;k++)if(C.bloc[y+k]&&C.bloc[y+k][gx]!==undefined)C.bloc[y+k][gx]=1;
    });
  }
  return O;
}

/* =====================================================================
   8. LE CHEMIN
   A* sur la grille, huit directions, avec interdiction de couper un
   coin entre deux cases bloquees : sans ca le personnage traverse
   l'angle d'un immeuble en diagonale et le decor perd toute solidite.
   ===================================================================== */
function libre(C,x,y){
  return x>=0&&y>=0&&x<GW&&y<GH&&!C.bloc[y][x];
}
function chemin(C,x0,y0,x1,y1){
  if(!libre(C,x1,y1)){
    /* la case visee est prise : on vise la plus proche qui ne l'est pas */
    var best=null,bd=1e9;
    for(var r=1;r<=9&&!best;r++)
      for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
        var nx=x1+dx, ny=y1+dy; if(!libre(C,nx,ny))continue;
        var dd=dx*dx+dy*dy; if(dd<bd){bd=dd;best=[nx,ny];}
      }
    if(!best)return null;
    x1=best[0];y1=best[1];
  }
  if(x0===x1&&y0===y1)return [];
  var N=GW*GH, dep=y0*GW+x0, arr=y1*GW+x1;
  var vu=new Int32Array(N).fill(-1), g=new Float32Array(N).fill(1e9);
  var ouv=[dep]; g[dep]=0; vu[dep]=dep;
  var DX=[1,-1,0,0,1,1,-1,-1], DY=[0,0,1,-1,1,-1,1,-1];
  var it=0;
  while(ouv.length&&it++<20000){
    /* file de priorite naive : la carte fait 1500 cases, un tas serait
       du code en plus pour un gain qu'on ne mesurerait pas */
    var bi=0, bf=1e9;
    for(var i=0;i<ouv.length;i++){
      var n=ouv[i], nx2=n%GW, ny2=(n/GW)|0;
      var f=g[n]+Math.abs(nx2-x1)+Math.abs(ny2-y1);
      if(f<bf){bf=f;bi=i;}
    }
    var cur=ouv.splice(bi,1)[0];
    if(cur===arr)break;
    var cx=cur%GW, cy=(cur/GW)|0;
    for(var k=0;k<8;k++){
      var ax=cx+DX[k], ay=cy+DY[k];
      if(!libre(C,ax,ay))continue;
      if(k>3&&(!libre(C,cx+DX[k],cy)||!libre(C,cx,cy+DY[k])))continue;
      var id=ay*GW+ax, co=g[cur]+(k>3?1.414:1);
      if(co<g[id]){g[id]=co;vu[id]=cur;if(ouv.indexOf(id)<0)ouv.push(id);}
    }
  }
  if(vu[arr]<0)return null;
  var P=[], c2=arr;
  while(c2!==dep){P.unshift([c2%GW+0.5,((c2/GW)|0)+0.5]);c2=vu[c2];if(P.length>900)break;}
  return P;
}

/* =====================================================================
   9. LA CAMERA
   Elle vise un point du monde projete, avec un facteur d'agrandissement
   propre. Le facteur se cale sur l'agrandissement entier de la borne
   (ECH) : z tel que ECH*z soit entier, c'est la seule facon qu'un pixel
   du decor tombe sur un nombre entier de points d'ecran. On zoome donc
   de facon continue sous le doigt, et on s'aimante au relachement.
   ===================================================================== */
/* LA CAMERA REVIENT SUR L'ACTION.
   Elle etait posee une fois au depart, entre la tete du cortege et le
   cordon, et n'en bougeait plus. Le cortege avance de dix tuiles en une
   minute : au bout de trente secondes, le contact — et les nuages de
   gaz qu'on y lance — etaient hors de l'ecran, et on commandait a
   l'aveugle. Elle recentre maintenant d'elle-meme, mais seulement apres
   cinq secondes sans que le doigt l'ait touchee : une camera qui reprend
   la main pendant qu'on regarde ailleurs est pire que pas de suivi. */
function camSuivi(s,dt){
  if(!s.sim||!s.unites)return;
  /* UN CADRAGE DEMANDE : on y glisse, on ne s'y teleporte pas. Un saut
     de camera fait perdre le fil ; un glissement de trois dixiemes de
     seconde se suit des yeux. */
  if(s.camVise){
    var kv=Math.min(1,dt*0.010);
    s.cam.x+=(s.camVise[0]-s.cam.x)*kv;
    s.cam.y+=(s.camVise[1]-s.cam.y)*kv;
    camBornes(s);
    if(Math.abs(s.camVise[0]-s.cam.x)<1.5&&Math.abs(s.camVise[1]-s.cam.y)<1.5)
      s.camVise=null;
    return;
  }
  if(s.camLibre){
    s.camLibreT=(s.camLibreT||0)-dt;
    if(s.camLibreT>0)return;
    s.camLibre=false;
  }
  /* le point a regarder : entre la tete du cortege et la premiere ligne */
  var mur=1e9, A=s.sim.agents;
  for(var u=0;u<s.unites.length;u++){
    var U=s.unites[u]; if(U.camions)continue;
    for(var m=0;m<U.membres.length;m++){var a=A[U.membres[m]];if(a.x<mur)mur=a.x;}
  }
  if(mur>1e8)return;
  var cx=(s.front+mur)/2, cy=(AV.y0+AV.y1)/2+0.5;
  var bx=mx(cx,cy), by=my(cx,cy);
  var k=Math.min(1,dt*0.0013);
  s.cam.x+=(bx-s.cam.x)*k; s.cam.y+=(by-s.cam.y)*k;
  camBornes(s);
}

function camBornes(s){
  var vl=s.L/s.cam.z, vh=s.H/s.cam.z;
  /* la demi-vue, exprimee dans les deux axes du losange */
  var a=vh/TH, b=vl/TW;                 /* demi-amplitudes de u et de v */
  var u=2*s.cam.y/TH, v=2*(s.cam.x-OX)/TW;   /* u = gx+gy, v = gx-gy */
  var lo, hi;
  lo=0+(a+b); hi=2*GW-(a+b);
  var su=u+v; su=(lo>hi)?GW:Math.max(lo,Math.min(hi,su));
  lo=0+(a+b); hi=2*GH-(a+b);
  var du=u-v; du=(lo>hi)?GH:Math.max(lo,Math.min(hi,du));
  u=(su+du)/2; v=(su-du)/2;
  s.cam.y=u*TH/2; s.cam.x=v*TW/2+OX;
}
function camAimante(s){
  /* LE PAS D'AIMANTATION est un demi-pixel d'ecran, pas un pixel entier.
     Avec un pixel entier le plancher de zoom (0,75) n'etait sur aucun
     cran : le doigt descendait jusqu'en bas et l'aimant le renvoyait a 1,
     si bien qu'on ne pouvait jamais rester au plus large. Un demi-pas
     reste net des que l'ecran a deux points par pixel, ce qu'ont tous
     les telephones depuis longtemps. */
  var E=(typeof ECH==='number'&&ECH>0)?ECH:2, P=E*2;
  var z=Math.round(s.cam.z*P)/P;
  s.cam.z=Math.max(s.cam.zmin,Math.min(s.cam.zmax,z));
}

/* =====================================================================
   10. LE MOTEUR
   ===================================================================== */
var PRET=false;
function preparer(s){
  var d=new Dé(s.graine||20261026);
  s.C=faireCarte(d);
  s.bats=faireBatiments(s.C,d);
  s.nuit=s.heure==='nuit';
  s.sol=peindreSol(s.C,d);
  s.bats.forEach(function(b){
    /* la devanture regarde la rue : c'est la face tournee vers une
       chaussee qui recoit les vitrines, pas les deux au hasard */
    var g2=Math.floor((b.x0+b.x1)/2), g3=b.y1+2;
    b.devG=(g3<GH&&s.C.sol[Math.min(GH-1,b.y1+2)]&&s.C.sol[Math.min(GH-1,b.y1+2)][g2]!==SOL.ILOT);
    var h2=Math.floor((b.y0+b.y1)/2);
    b.devD=(b.x1+2<GW&&s.C.sol[h2]&&s.C.sol[h2][Math.min(GW-1,b.x1+2)]!==SOL.ILOT);
    peindreBat(b,new Dé(b.g),s.nuit);
  });
  if(!PRET){faireObjets(s.nuit);faireVehicules(s.nuit);fairePerso();
    /* le camion a eau est un acteur : il se trie avec les corps.
       (window.CORDON_ACTEURS et pas ACTEURS : la variable n'est reliee
       qu'au moment de peupler, qui vient apres.) */
    if(window.CORDON_ACTEURS)window.CORDON_ACTEURS.poserFixe('camion',VEH.eau);
    PRET=true;}
  s.objs=garnir(s.C,d,s.nuit);
  /* LA LISTE DE RENDU, triee une fois. Le decor ne bouge pas : le trier
     a chaque image serait trois cents comparaisons pour rien. Les
     acteurs, eux, sont insérés a leur place a chaque image. */
  /* UN BATIMENT D'ARRIERE-COUR ENTIEREMENT MASQUE par la rangee sur rue
     n'a pas a etre peint : il ne sert qu'a bloquer le passage. La camera
     ne tourne pas, donc ce qui est cache l'est pour toute la partie. */
  s.bats.forEach(function(b){
    if(b.h>=60){b.vu=true;return;}
    var cache=true;
    for(var y=b.y0;y<=b.y1&&cache;y++){
      var k=false;
      for(var i=1;i<=4;i++){var x=b.x1+i;
        if(x>=GW){k=true;break;}
        if(s.C.haut[y][x]>=b.h+18){k=true;break;}}
      if(!k)cache=false;
    }
    for(var x2=b.x0;x2<=b.x1&&cache;x2++){
      var k2=false;
      for(var j=1;j<=4;j++){var y2=b.y1+j;
        if(y2>=GH){k2=true;break;}
        if(s.C.haut[y2][x2]>=b.h+18){k2=true;break;}}
      if(!k2)cache=false;
    }
    b.vu=!cache;
    if(cache&&b.cv){b.cv=null;}
  });
  /* LA BOITE DE CHAQUE ELEMENT, calculee une fois. Un lampadaire ne
     bouge pas : recalculer sa position et sa taille a l'ecran soixante
     fois par seconde est du travail pur perdu. */
  s.statiques=[];
  s.bats.forEach(function(b){if(b.vu)s.statiques.push({k:'bat',b:b,prof:b.prof,
    x:b.ox, y:b.oy, w:b.cv.width, h:b.cv.height, cv:b.cv});});
  s.objs.forEach(function(o){
    var S2=OBJ[o.t]||VEH[o.t]; if(!S2)return;
    s.statiques.push({k:'obj',o:o,prof:o.prof,
      x:mx(o.gx,o.gy)-S2.ox, y:my(o.gx,o.gy)-S2.oy,
      w:S2.cv.width, h:S2.cv.height, cv:S2.cv});
  });
  s.statiques.sort(function(a,b){return a.prof-b.prof;});
  peupler(s);
  var p=m2e((s.front+TER.bx-2)/2, (AV.y0+AV.y1)/2+0.5);
  s.cam.x=p.x; s.cam.y=p.y;
  /* ON COMMENCE PRES DE L'ACTION, pas au plus large. Au zoom minimum on
     voyait la place entiere : des arbres, des trottoirs, et la foule en
     petit tas au milieu. Le premier regard doit tomber sur le contact
     entre le cortege et le cordon, c'est la que le jeu se joue. Le
     joueur peut toujours s'ecarter d'un pincement. */
  s.cam.z=Math.min(s.cam.zmax, Math.max(s.cam.zmin, TER.zoom||1.35));
  s.pret=true;
}

/* =====================================================================
   LA RUE SE PEUPLE
   Un cortege qui remonte l'avenue, un cordon qui la barre. Les deux
   sont des GROUPES : on ne place pas trois cents individus, on place
   quatre blocs et une ligne, et chacun y prend sa place.
   ===================================================================== */
var FOULE=null, ACTEURS=null;
function peupler(s){
  FOULE=window.CORDON_FOULE; ACTEURS=window.CORDON_ACTEURS;
  if(!FOULE||!ACTEURS){s.sim=null;return;}
  ACTEURS.preparer();
  var d=new Dé((s.graine||7)+99);
  /* LES SORTIES. Une foule qui fuit va quelque part : les trois
     bouches de rue, a l'ouest et aux deux bras de la transversale.
     C'est d'elles que part le champ de fuite. */
  var sorties=[];
  for(var sy=AV.y0;sy<=AV.y1;sy++)sorties.push([1,sy]);
  for(var sx=RU.x0;sx<=RU.x1;sx++){sorties.push([sx,1]);sorties.push([sx,GH-2]);}
  var sim=FOULE.creer({GW:GW,GH:GH,bloc:s.C.bloc,AV:AV,RU:RU,
                       graine:s.graine||7, sorties:sorties});
  var midY=(AV.y0+AV.y1)/2+0.5;
  var R=FOULE.R;

  /* ---- LE CORTEGE : quatre blocs en file, du plus serre au plus lache */
  s.corteges=[];
  /* LA TETE DU CORTEGE part a onze tuiles du barrage : plus loin, le
     cortege et le cordon ne tiennent pas ensemble dans l'ecran, et on
     ouvre la partie sur un carrefour vide. */
  var tete=TER.bx-13;
  /* LES TROIS STYLES, en chiffres. Rien d'autre ne change. */
  var STYLES={
    pacifique:{k:'pacifique', vit:0.95, masse:0.92, nerf:0.66, panc:0.19, tens:0.74},
    determine:{k:'determine', vit:1.00, masse:1.00, nerf:1.00, panc:0.09, tens:1.00},
    radical:  {k:'radical',   vit:1.08, masse:1.12, nerf:1.26, panc:0.06, tens:1.34}
  };
  var ST=STYLES[window.CO_STYLE]||STYLES.determine;
  s.style=ST.k;
  sim.styleTens=ST.tens;
  var blocs=[
    {n:s.densite?Math.round(34*s.densite):34, lx:3.4, ly:2.1, coh:1.4, dec:0},
    {n:s.densite?Math.round(46*s.densite):46, lx:4.2, ly:2.3, coh:1.0, dec:5.4},
    {n:s.densite?Math.round(40*s.densite):40, lx:4.0, ly:2.2, coh:0.9, dec:10.6},
    {n:s.densite?Math.round(30*s.densite):30, lx:4.6, ly:2.3, coh:0.6, dec:16.0}
  ];
  blocs.forEach(function(B,bi){
    var G=FOULE.groupe(sim,{type:'manif',ax:tete-B.dec,ay:midY,
                            allure:'marche',cohesion:B.coh});
    G.base=B.dec; G.lx=B.lx; G.ly=B.ly;
    for(var i=0;i<B.n;i++){
      /* l'ecart propre : reparti dans un rectangle, pas tire a chaque
         pas — c'est ce qui donne un cortege et non un essaim */
      var ex=(d.f()-0.5)*2*B.lx, ey=(d.f()-0.5)*2*B.ly;
      var t='manif', va=d.e(0,11);
      /* LE STYLE DU CORTEGE, choisi au menu. Il ne change pas les
         regles : il change QUI compose la foule, et le reste suit.
         Un cortege pacifique a plus de banderoles — donc il encaisse
         l'eau — et des medics ; un cortege radical a des casseurs, qui
         poussent plus fort et paniquent plus vite. */
      var nBand=(ST.k==='pacifique')?7:((ST.k==='radical')?2:3);
      if(bi===0&&i<nBand){t='banderole';va=d.e(0,2);
        ex=-0.9+(i%4)*0.75; ey=((i/4)|0)*1.0+(i%4-1.5)*0.8;}
      else if(ST.k==='pacifique'&&d.f()<0.05){t='medic';va=d.e(0,1);}
      else if(ST.k==='radical'&&d.f()<0.14){t='casseur';va=d.e(0,3);}
      else if(d.f()<ST.panc){t='pancarte';va=d.e(0,4);}
      else if(d.f()<0.03){t='presse';va=d.e(0,1);}
      var dur=(t==='casseur');
      FOULE.poser(sim,G,tete-B.dec+ex,midY+ey,{
        ex:ex, ey:ey, varia:va,
        vmax:R.vMarche*(0.86+d.f()*0.3)*ST.vit*(dur?1.12:1),
        masse:(t==='banderole'?1.25:1)*ST.masse*(dur?1.2:1),
        /* LE TEMPERAMENT, tire une fois. Les plus nerveux sont devant :
           c'est de la tete du cortege que part la panique, comme dans
           la rue. */
        nerf:(0.55+d.f()*1.1)*(bi===0?1.25:1)*ST.nerf*(dur?1.3:1),
        stress:d.f()*0.10
      });
      sim.agents[sim.agents.length-1].type=t;
    }
    G.camp='manif';
    G.nom=['LA TÊTE','LE CORPS','LA QUEUE','L’ARRIÈRE'][bi]||('BLOC '+(bi+1));
    G.court=['TÊTE','CORPS','QUEUE','ARR.'][bi]||('B'+(bi+1));
    G.route=null; G.ri=0; G.but=null; G.nRoute=0;
    G.champ=new FOULE.Champ(sim);
    s.corteges.push(G);
  });
  /* la presse, en marge, qui longe le trottoir */
  var GP=FOULE.groupe(sim,{type:'presse',ax:tete+2,ay:AV.y0-0.4,cohesion:0.4});
  for(var k=0;k<4;k++){
    var ex2=(d.f()-0.5)*5, ey2=(d.f()-0.5)*0.8;
    FOULE.poser(sim,GP,tete+2+ex2,AV.y0-0.4+ey2,{ex:ex2,ey:ey2,varia:d.e(0,1),
      vmax:R.vMarche*1.1});
  }
  s.presse=GP;
  /* LE GROUPE MOBILE. Une foule dont tout le monde a atteint sa place
     est une photographie. Celui-ci fait la navette entre la queue et la
     tete du cortege : c'est un trajet, pas une errance — on peut dire a
     tout moment ou il va et pourquoi. */
  var GM=FOULE.groupe(sim,{type:'manif',ax:tete-8,ay:midY,cohesion:1.6});
  GM.navette=-1; GM.base=8;
  for(var q=0;q<14;q++){
    var qx=(d.f()-0.5)*2.4, qy=(d.f()-0.5)*1.6;
    FOULE.poser(sim,GM,tete-8+qx,midY+qy,{ex:qx,ey:qy,varia:d.e(0,11),
      vmax:R.vMarche*(1.1+d.f()*0.25)});
    var ag2=sim.agents[sim.agents.length-1];
    if(d.f()<0.22)ag2.type='pancarte',ag2.varia=d.e(0,4);
  }
  GM.camp='manif'; GM.nom='LES MOBILES'; GM.court='MOB';
  GM.route=null; GM.ri=0; GM.but=null; GM.nRoute=0;
  GM.champ=new FOULE.Champ(sim);
  s.mobile=GM;
  /* LE GROUPE QUI SE DETACHERA. Il existe des le depart, melé au
     cortege : un groupe qui apparait d'un coup au milieu de la rue se
     voit, et on ne peut pas le surveiller avant qu'il parte. */
  var GC=FOULE.groupe(sim,{type:'manif',ax:tete-5,ay:midY+1.2,cohesion:2.0});
  GC.casseurs=true; GC.parti=false; GC.base=5;
  for(var cq=0;cq<16;cq++){
    var kx=(d.f()-0.5)*2.0, ky=(d.f()-0.5)*1.4;
    FOULE.poser(sim,GC,tete-5+kx,midY+1.2+ky,{ex:kx,ey:ky,varia:d.e(0,11),
      vmax:R.vMarche*(1.15+d.f()*0.2), nerf:1.4, stress:0.12});
    var ac=sim.agents[sim.agents.length-1];
    if(d.f()<0.3)ac.type='pancarte',ac.varia=d.e(0,4);
  }
  GC.camp='manif'; GC.nom='LES CASSEURS'; GC.court='CASS';
  GC.route=null; GC.ri=0; GC.but=null; GC.nRoute=0;
  GC.champ=new FOULE.Champ(sim);
  s.casseurs=GC;
  /* LES DEVANTURES SURVEILLEES : trois vitrines sur l'avenue, a l'ouest
     du barrage. Ce sont des points de la carte, pas des decors : une
     d'elles sera visee, et elle peut reellement etre brisee. */
  s.vitrines=[];
  [[RU.x0-7,AV.y0-1],[RU.x0-3,AV.y1+1],[RU.x1+3,AV.y0-1]].forEach(function(v){
    if(v[0]>0&&v[0]<GW)s.vitrines.push({x:v[0]+0.5,y:v[1]+0.5,brisee:false,travail:0,pres:0});
  });

  /* ---- LE CORDON : trois unites en ligne, une en reserve */
  s.unites=[];
  var bar=TER.bx;     /* au niveau de l'entonnoir, pas derriere lui */
  /* LES TROIS LIGNES TIENNENT LE GOULOT, l'une derriere l'autre.
     Elles etaient cote a cote et posees DERRIERE les barrieres : elles
     couvraient vingt tuiles de front en epaisseur de un, alors que
     l'entonnoir n'en laisse que huit. Empilees dans le passage, chacune
     le barre sur toute sa largeur et il y a trois rangs a franchir. */
  [[bar,midY,12],[bar+1.3,midY,12],[bar+2.6,midY,10]].forEach(function(u,ui){
    /* cap +π/2 : le « devant » de la figure, (−sin, +cos), pointe vers
       −x, c'est-a-dire vers le cortege qui remonte l'avenue */
    var G=FOULE.groupe(sim,{type:'crs',form:'ligne',ax:u[0],ay:u[1],
                            cap:Math.PI/2,cohesion:0,seuil:2.6});
    G.camp='crs';
    G.nom='LIGNE '+(ui+1); G.court='L'+(ui+1); G.route=null; G.ri=0; G.but=null; G.nRoute=0;
    G.champ=new FOULE.Champ(sim);
    for(var i=0;i<u[2];i++)
      FOULE.poser(sim,G,u[0]+1.2+(i%3)*0.5,u[1]+((i/3)|0)*0.6,
        /* UN HOMME AVEC UN BOUCLIER OCCUPE PLUS DE PLACE QU'UN CORPS NU.
         A 0,33 de rayon pour 0,70 d'ecart entre deux places, la ligne
         avait des trous larges comme un homme : trois cent cinquante
         manifestants s'y infiltraient et traversaient le cordon en
         vingt secondes. A 0,45 ils se touchent, et la ligne est un mur. */
      {varia:i%3, vmax:R.vMarche*1.0, r:0.45, masse:1.8, nerf:0.4});
    sim.agents[G.membres[0]].type='officier';
    sim.agents[G.membres[0]].varia=0;
    s.unites.push(G);
  });
  var GR=FOULE.groupe(sim,{type:'crs',form:'colonne',ax:bar+5,ay:midY+0.5,
                           cap:Math.PI/2,cohesion:0});
  GR.camp='crs'; GR.reserve=true;
  GR.nom='RÉSERVE'; GR.court='RÉS'; GR.route=null; GR.ri=0; GR.but=null; GR.nRoute=0;
  GR.champ=new FOULE.Champ(sim);
  for(var i2=0;i2<10;i2++)
    FOULE.poser(sim,GR,bar+5+(i2%2)*0.6,midY+0.5+((i2/2)|0)*0.7,
      {varia:i2%3, vmax:R.vMarche*1.05, r:0.45, masse:1.8, nerf:0.4});
  sim.agents[GR.membres[0]].type='officier';
  s.unites.push(GR);
  /* LES DEUX CAMIONS A EAU, derriere les lignes. Ce sont des UNITES :
     on les selectionne, on les deplace, et leur ordre EAU arrose
     vraiment — le jet pousse les corps qu'il touche. */
  /* LES CAMIONS SE POSENT SUR LES AILES DU CORDON, pas derriere lui :
     derriere, on ne les voyait pas et leur jet passait par-dessus la
     tete des lignes sans atteindre personne. */
  var GE=FOULE.groupe(sim,{type:'crs',form:'ligne',ax:bar+1,ay:midY,
                           cap:Math.PI/2,cohesion:0,seuil:9});
  GE.camp='crs';
  GE.nom='CAMIONS'; GE.court='EAU'; GE.typeActeur='camion'; GE.ecart=13; GE.route=null; GE.ri=0; GE.but=null;
  GE.nRoute=0; GE.camions=true; GE.champ=new FOULE.Champ(sim);
  for(var ce=0;ce<2;ce++)
    FOULE.poser(sim,GE,bar+1,midY+(ce?6.5:-6.5),
      {varia:0, vmax:R.vMarche*0.8, r:0.85, masse:9, nerf:0.2, vehicule:true});
  GE.membres.forEach(function(i){sim.agents[i].type='camion';});
  s.unites.push(GE);
  s.camions=GE;
  /* TOUTES LES UNITES D'UN COTE ET DE L'AUTRE. s.tous sert a l'IA, qui
     tient le camp que le joueur ne joue pas ; s.unites ne contient que
     ce que le doigt peut commander. */
  s.tous=s.unites.slice();
  s.corteges.forEach(function(G){s.tous.push(G);});
  s.tous.push(s.mobile); s.tous.push(s.casseurs);
  if(s.camp==='manif'){
    s.unites=s.corteges.slice();
    s.unites.push(s.casseurs);
    s.unites.push(s.mobile);
  }
  s.sel=0;
  s.selN={0:true};          /* la selection : un ensemble, pas un index */
  s.unites.forEach(function(U){U.tenu={x:U.ax,y:U.ay};});
  s.sim=sim;
  s.front=tete;
}

/* LE CORTEGE AVANCE TANT QU'IL PEUT. La tete monte vers le barrage et
   s'arrete a l'endroit ou elle touche la premiere ligne : c'est ce
   contact, et pas une minuterie, qui decide ou le cortege se fige. */
function majCortege(s,dt){
  if(!s.sim)return;
  /* OU VA LE CORTEGE, ET POURQUOI CA A CHANGE.
     Premiere version : il s'arretait a une tuile et demie du policier le
     plus avance. C'etait commode et c'etait faux — le cortege ne pouvait
     PAS deborder le cordon, meme si on retirait tous les hommes de la
     rue. On gagnait la mission sans rien faire, et la defaite etait
     injouable.
     Maintenant il vise la prefecture, point fixe au bout de l'avenue, et
     son front suit sa propre tete : il pousse une tuile plus loin
     qu'elle n'est arrivee. Si le cordon tient, la tete n'avance pas,
     donc le front non plus. S'il cede, la tete avance et le front suit.
     Si on les repousse, le front recule avec eux. Ce n'est plus une
     regle qui decide ou s'arrete la foule : c'est le cordon. */
  var PREF=TER.pref.x0;
  var tete=-1e9, A0=s.sim.agents, B0=s.corteges[0];
  for(var ti=0;ti<B0.membres.length;ti++){
    var at=A0[B0.membres[ti]];
    if(at.etat==='PANIQUE'||at.etat==='FUIT')continue;
    if(at.x>tete)tete=at.x;
  }
  if(tete<-1e8)tete=s.front;
  /* LE FRONT COLLE A LA TETE, a une tuile et demie devant : il ne peut
     donc jamais partir sans elle. C'est ce qui fait qu'un cordon qui
     tient arrete VRAIMENT le cortege — sa tete n'avance pas, son front
     non plus — et qu'un cordon qui cede le laisse couler. */
  var arret=Math.min(PREF, tete+1.6);
  /* LES POUSSEES. Un cortege au contact ne reste pas immobile : il
     pousse par vagues, se relache, repousse. Toutes les huit secondes,
     la tete gagne une tuite d'un coup puis reflue — c'est ce battement
     qui fait qu'une foule arretee reste vivante. */
  s.vague=(s.vague||0)+dt;
  if(!(s.pousse>0))s.pousse=0;   /* sinon la premiere image multiplie par undefined */
  if(s.vague>7600){s.vague=0;s.pousse=1;}
  if(s.pousse>0)s.pousse=Math.max(0,s.pousse-dt*0.00042);
  /* L'ALLURE DU CORTEGE. A 1,6 tuile par seconde il traversait l'avenue
     en sept secondes et la mission se jouait avant d'avoir commence.
     Un cortege avance au pas, pas au sprint. */
  var elan=0.00055+0.0030*s.pousse+((s.poussee>0)?0.00075:0);
  /* L'AMPLITUDE DE LA VAGUE. A 1,1 tuile le front montait a 36,3 et la
     ligne a franchir est a 37 : les vagues n'aboutissaient jamais, et
     le compteur ne bougeait qu'a l'effondrement. A 2,4 chaque vague
     fait passer quelques personnes — c'est le filet regulier qui donne
     au joueur quelque chose a faire toutes les huit secondes, dans un
     camp comme dans l'autre. */
  var vise=Math.min(arret+2.4*s.pousse, s.front+elan*dt);
  s.front=vise;
  var resp=Math.sin(s.sim.t*0.00045);
  s.corteges.forEach(function(G,gi){
    if(G.libre)return;            /* celui-la obeit au joueur, pas au front */
    G.ax=s.front-G.base;
    /* la respiration laterale : le bloc roule doucement d'un bord de la
       chaussee a l'autre, comme une foule qui se tasse et se detasse */
    /* CHAQUE BLOC SA BANDE. Les quatre blocs visaient le meme axe :
       ils arrivaient en file sur le meme point, celui que le cordon
       tient le mieux, et se bousculaient entre eux. Etales sur la
       largeur du passage, ils attaquent quatre endroits a la fois — la
       police doit repartir ses lignes, le cortege voit lequel de ses
       blocs perce. */
    var bande=[-3.6,-1.2,1.2,3.6][gi%4];
    G.ay=((AV.y0+AV.y1)/2+0.5)+bande+Math.sin(s.sim.t*0.00038+gi*1.7)*0.42;
  });
  if(!s.presse.colle)s.presse.ax=Math.min(arret-1, s.front+1.5);
  else s.presse.ax=Math.min(arret-0.6, s.front+0.4);
  if(s.casseurs&&!s.casseurs.parti&&!s.casseurs.libre)s.casseurs.ax=s.front-s.casseurs.base;
  /* la navette : elle remonte a la tete, puis redescend a la queue */
  var GM=s.mobile;
  if(GM&&!GM.libre){
    var but=(GM.navette<0)?(s.front-1.6):(s.front-15);
    if(Math.abs(GM.ax-but)<0.7)GM.navette=-GM.navette;
    GM.ax+=Math.sign(but-GM.ax)*0.00085*dt;
    GM.ay=((AV.y0+AV.y1)/2+0.5)+resp*1.1;
  }
  /* LA PRESSION ET LA TENSION sont lues sur la simulation : c'est elle
     qui les produit, a partir de ce que vivent les corps. Les compter
     une seconde fois ici donnerait deux chiffres qui finiraient par ne
     plus dire la meme chose. Le recul des lignes, lui aussi, vient des
     etats : une unite dont les hommes passent en CEDE recule d'elle-meme. */
  s.pression=s.sim.pression;
  s.tension=s.sim.tension;
}

/* UN ORDRE DE DEPLACEMENT. L'unite ne telepporte pas son point de
   ralliement : il suit le chemin case par case, et la figure se traine
   derriere lui en se reorientant. */
/* =====================================================================
   UNE LIGNE QUI PLIE

   LE DEFAUT MESURE : pendant cent quarante secondes, PAS UN SEUL
   manifestant ne depassait le cordon. Les trois rangs de police
   gardaient leur abscisse a la decimale pres du debut a la fin. Pousser
   ne servait a rien, et le cortege n'avait aucun moyen d'ouvrir une
   breche : on attendait un evenement de fin de partie, et la moitie
   passait d'un coup. C'etait la vraie raison pour laquelle le jeu
   n'etait pas amusant.

   LA REGLE, maintenant : une unite qui tient sa position RECULE quand
   la pression sur elle depasse son seuil, et REVIENT quand la pression
   retombe. Elle ne peut pas reculer indefiniment — trois tuiles et
   demie, apres quoi elle est percee et c'est le jeu qui tranche.

   C'est symetrique : la police voit sa ligne plier quand elle laisse
   la foule s'accumuler, et le cortege voit la ligne ceder quand il
   pousse. Les deux camps ont enfin un retour immediat sur ce qu'ils
   font.
   ===================================================================== */
var RECUL_MAX=3.5;
function majLignes(s,dt){
  if(!s.sim)return;
  for(var i=0;i<s.tous.length;i++){
    var U=s.tous[i];
    if(U.camp!=='crs'||U.camions)continue;
    if(U.route&&U.ri<U.route.length)continue;      /* elle marche : pas ici */
    if(U.ordre==='avance'||U.ordre==='recule'||U.ordre==='vers')continue;
    if(U.ancre===undefined){U.ancre=U.ax; U.plie=0;}
    /* LE SEUIL DE FLEXION EST PLUS BAS QUE CELUI DE LA PANIQUE. Mesure :
       la pression plafonne vers 2,1 alors que le seuil de rupture vaut
       2,6 — a ce compte la ligne n'aurait jamais plie d'un pouce. Elle
       commence a reculer bien avant de rompre, ce qui est d'ailleurs ce
       que fait une vraie ligne. */
    /* LA TENSION A DOUBLE TRANCHANT. Une rue tendue, c'est une rue ou
       les lignes tiennent moins bien — des deux cotes. Monter la
       tension ouvre donc le cordon, mais elle ouvre aussi la porte aux
       bousculades que plus personne ne commande. C'est la seule
       ressource du jeu qu'on partage avec l'adversaire. */
    var tn=s.sim.tension||0;
    var mou=1-0.38*Math.max(0,Math.min(1,(tn-0.55)/0.35));
    var seuil=(U.seuil||3.0)*0.55*mou, p=U.presse||0;
    if(p>seuil){
      /* elle plie, d'autant plus vite qu'on pousse fort */
      U.plie=Math.min(RECUL_MAX, U.plie+(p-seuil)*0.00055*dt);
    }else if(p<seuil*0.6){
      /* la poussee retombe : elle reprend son terrain, lentement */
      U.plie=Math.max(0, U.plie-0.00030*dt);
    }
    U.ax=U.ancre+U.plie;
  }
}
/* =====================================================================
   LES TROIS POINTS DE LA PLACE

   Un seul compteur de passages, c'etait une seule chose a faire :
   pousser au meme endroit. Trois zones a tenir en font trois, et elles
   ne se valent pas — chacune donne un avantage different, donc en
   choisir une c'est renoncer aux autres.

     LE PASSAGE, entre les barrieres : celui qui le tient recupere son
       elan plus vite. C'est la zone qu'on se dispute vraiment.
     LA PERCEE, la rue nord-sud : elle donne des renforts reguliers.
       Loin du contact, donc il faut detacher du monde pour la prendre.
     LA FONTAINE, au centre : elle fait retomber la tension. C'est la
       zone des joueurs qui veulent calmer le jeu plutot que l'ouvrir.

   Une zone est tenue par le camp qui a le plus de corps dedans, avec
   une marge de quatre : a egalite elle reste a personne, sinon elle
   changerait de main a chaque pas de chaque passant.
   ===================================================================== */
function faireZones(s){
  var midY=(AV.y0+AV.y1)/2+0.5;
  if(TER.eau){
    /* SUR UN PONT, LES TROIS ZONES SONT SUR UNE LIGNE. Pas de percee,
       pas de fontaine : on se dispute la tete de pont, le milieu et la
       culee. Comme elles sont alignees, les tenir toutes demande de
       s'etaler sur toute la longueur — ce qu'aucun des deux camps ne
       peut se permettre en meme temps que de pousser. */
    s.zones=[
      {k:'passage', n:'LA CULÉE',      x:TER.bx,      y:midY, r:3.4, a:null, t:0,
       d:'élan plus vite'},
      {k:'percee',  n:'LA TÊTE DE PONT',x:TER.rive+3, y:midY, r:3.4, a:null, t:0,
       d:'des renforts'},
      {k:'fontaine',n:'LE MILIEU',     x:(TER.rive+TER.bx)/2, y:midY, r:3.2, a:null, t:0,
       d:'la tension retombe'}
    ];
    s.zoneT=0;
    return;
  }
  var cxp=Math.round((RU.x0+RU.x1)/2), cyp=Math.round((AV.y0+AV.y1)/2);
  s.zones=[
    {k:'passage', n:'LE PASSAGE', x:TER.bx, y:midY, r:4.6, a:null, t:0,
     d:'élan plus vite'},
    {k:'percee',  n:'LA PERCÉE',  x:cxp+0.5, y:AV.y0-2.5, r:4.0, a:null, t:0,
     d:'des renforts'},
    {k:'fontaine',n:'LA FONTAINE',x:cxp+0.5, y:cyp+0.5, r:3.8, a:null, t:0,
     d:'la tension retombe'}
  ];
  s.zoneT=0;
}
/* QUAND LA RUE ECHAPPE AUX DEUX CAMPS. Au-dela de 0,85 de tension
   pendant quatre secondes, une bousculade part toute seule a l'endroit
   le plus dense. Personne ne l'a commandee et personne ne peut
   l'empecher autrement qu'en faisant retomber la tension AVANT. C'est
   le prix d'une partie ou l'on a trop poussé — dans un camp comme dans
   l'autre. */
function majEmballe(s,dt){
  if(!s.sim)return;
  if(s.embRech>0){s.embRech-=dt;return;}
  if((s.sim.tension||0)<0.85){s.embT=0;return;}
  s.embT=(s.embT||0)+dt;
  if(s.embT<4000)return;
  s.embT=0; s.embRech=26000;
  /* l'endroit le plus dense : on prend le barycentre des manifestants
     dont le stress depasse la moyenne, c'est la que ca part */
  var A=s.sim.agents, sx=0, sy=0, n=0;
  for(var i=0;i<A.length;i++){
    var a=A[i];
    if(a.camp!=='manif'||a.stress<0.6)continue;
    sx+=a.x; sy+=a.y; n++;
  }
  if(n<8)return;
  FOULE.evenement(s.sim,sx/n,sy/n,4.2,0.75);
  s.sim.tension=Math.min(1,s.sim.tension+0.04);
  s.mot='ÇA PART TOUT SEUL';s.motT=2000;
  if(SON)SON.effet('sifflet');
}
function majZones(s,dt){
  if(!s.zones||!s.sim)return;
  var A=s.sim.agents, i, z, k;
  for(i=0;i<s.zones.length;i++){
    z=s.zones[i];
    var nm=0, nc=0, r2=z.r*z.r;
    for(k=0;k<A.length;k++){
      var a=A[k];
      var dx=a.x-z.x, dy=a.y-z.y;
      if(dx*dx+dy*dy>r2)continue;
      if(a.camp==='manif')nm++; else nc++;
    }
    var av=(nm-nc>4)?'manif':((nc-nm>4)?'crs':null);
    if(av!==z.a){
      z.a=av; z.t=0;
      if(av&&s.M&&MISSION)s.mot=z.n+' · '+(av===s.camp?'À VOUS':'PERDUE');
      if(av)s.motT=1400;
      if(av&&SON)SON.effet('sifflet');
    }else z.t+=dt;
    z.nm=nm; z.nc=nc;
  }
  /* CE QUE CHAQUE ZONE RAPPORTE, une fois par seconde. Les effets sont
     continus et modestes : une zone tenue n'est pas un bouton magique,
     c'est un avantage qui se cumule tant qu'on la garde. */
  s.zoneT+=dt;
  if(s.zoneT<1000)return;
  s.zoneT-=1000;
  for(i=0;i<s.zones.length;i++){
    z=s.zones[i];
    if(!z.a)continue;
    var mien=(z.a===s.camp);
    if(z.k==='passage'){
      /* le passage vaut presque une seconde de jauge en plus par
         seconde : il double presque la cadence, sans la tripler */
      if(mien)s.res=Math.min(RES_MAX,s.res+2.0);
    }else if(z.k==='fontaine'){
      s.sim.tension=Math.max(0,s.sim.tension-(mien?0.016:0.004));
    }else if(z.k==='percee'){
      /* des renforts reguliers, pour de vrai : deux corps par tranche
         de six secondes, du cote qui la tient */
      z.ren=(z.ren||0)+1;
      if(z.ren>=6){z.ren=0;renfortZone(s,z);}
    }
    if(s.M&&MISSION&&MISSION.noterZone)MISSION.noterZone(s.M,z.k,mien);
  }
}
function renfortZone(s,z){
  var R=FOULE.R, d=new Dé((s.graine||7)+Math.round(s.sim.t));
  if(z.a==='manif'){
    var B=s.corteges[s.corteges.length-1]; if(!B)return;
    for(var q=0;q<2;q++)
      FOULE.poser(s.sim,B,z.x+(d.f()-0.5)*2,z.y+1.5+(d.f()-0.5)*2,
        {varia:d.e(0,11), vmax:R.vMarche*(0.9+d.f()*0.3), nerf:0.8});
  }else{
    var RES=null;
    for(var i=0;i<s.tous.length;i++)
      if(s.tous[i].camp==='crs'&&!s.tous[i].camions)RES=s.tous[i];
    if(!RES)return;
    for(var w=0;w<2;w++)
      FOULE.poser(s.sim,RES,z.x+(d.f()-0.5)*2,z.y+1.5+(d.f()-0.5)*2,
        {varia:w%3, vmax:R.vMarche*1.05, r:0.45, masse:1.8, nerf:0.4});
  }
}
function majUnites(s,dt){
  if(!s.sim)return;
  /* TOUTES LES UNITES, PAS SEULEMENT CELLES DU JOUEUR. C'est ici que
     l'on avance le long d'une route ; en ne parcourant que s.unites, on
     laissait l'IA donner des ordres de deplacement qui ne deplacaient
     rien. Elle mordait a la feinte, calculait son chemin, posait son
     ordre — et sa reserve restait sur place. Exactement le meme defaut
     que celui du cortege, mais du cote de la machine, donc invisible :
     il a fallu instrumenter l'IA pour le voir. */
  s.tous.forEach(function(U){
    if(!U.route||U.ri>=U.route.length){
      if(U.ordre==='vers'){U.ordre=null;U.ordrePrio=0;}
      return;
    }
    var c=U.route[U.ri], dx=c[0]-U.ax, dy=c[1]-U.ay;
    var di=Math.sqrt(dx*dx+dy*dy);
    var pasm=0.0013*dt;
    if(di<=pasm){U.ax=c[0];U.ay=c[1];U.ri++;if(U.ri>=U.route.length)U.route=null;}
    else{U.ax+=dx/di*pasm;U.ay+=dy/di*pasm;
      /* le cap de la figure suit la marche : une ligne qui se deplace de
         profil n'est plus une ligne */
      /* le devant de la figure doit regarder la marche : (−sin,cos)=(dx,dy) */
      var but=Math.atan2(-dx,dy);
      var ec=((but-U.cap+Math.PI*3)%(Math.PI*2))-Math.PI;
      U.cap+=ec*Math.min(1,dt*0.004);}
  });
}

/* =====================================================================
   CE QUE FAIT CHAQUE EVENEMENT
   La mission dit QUAND ; c'est ici qu'on dit QUOI. Rien de decoratif :
   chaque branche deplace des groupes ou en cree.
   ===================================================================== */
var MISSION=null, SON=null, FUM=null, IA=null;

/* =====================================================================
   CE QUE L'IA PEUT FAIRE, ET CE QU'ELLE PEUT VOIR
   Elle ne touche pas aux groupes directement : elle passe par les memes
   commandes que le joueur. Si un ordre marche pour l'un, il marche pour
   l'autre — et un bogue d'ordre se voit deux fois plus vite.
   ===================================================================== */
/* OU LA FOULE EST LA PLUS DENSE, a portee d'une unite. Le barycentre
   des manifestants dans le cercle : c'est la que gaz et eau servent a
   quelque chose, et ca se recalcule en un passage. */
function iaCible(s,U,port){
  var fo=[U.ax,U.ay]; foyerUnite(s,U,fo);
  var A=s.sim.agents, sx=0, sy=0, n=0, p2=port*port;
  for(var i=0;i<A.length;i++){
    var a=A[i]; if(a.camp!=='manif')continue;
    var dx=a.x-fo[0], dy=a.y-fo[1];
    if(dx*dx+dy*dy>p2)continue;
    sx+=a.x; sy+=a.y; n++;
  }
  if(n<4)return null;
  return [sx/n, sy/n];
}
/* L'IA PAIE AUSSI. Elle a sa propre jauge, aux memes chiffres : sans
   elle, le joueur comptait ses coups pendant que la machine gazait en
   boucle, et on mesurait cent quarante-cinq manifestants en fuite a la
   vingt-cinquieme seconde. Une regle qui ne vaut que pour un camp n'est
   pas une regle, c'est un handicap. */
function iaCoute(s,k){
  var c=COUT[k]||0;
  if(!c)return true;
  if((s.resIA||0)<c)return false;
  s.resIA-=c;
  return true;
}
function iaApi(s){
  return {
    aller:function(U,gx,gy){
      var r=chemin(s.C,Math.floor(U.ax),Math.floor(U.ay),Math.floor(gx),Math.floor(gy));
      if(!r)return false;
      U.route=r;U.ri=0;U.nRoute=r.length;U.but=[Math.floor(gx),Math.floor(gy)];
      U.champ.calculer(s.sim,[[Math.floor(gx),Math.floor(gy)]]);
      FOULE.ordre(s.sim,U,'vers',0,3);
      return true;
    },
    tenir:function(U){U.route=null;U.but=null;U.tenu={x:U.ax,y:U.ay};
      U.ordre=null;U.ordrePrio=0;FOULE.ordre(s.sim,U,'tenir',2200,4);},
    avancer:function(U){if(!iaCoute(s,'avant'))return;FOULE.ordre(s.sim,U,'avance',3200,2);},
    reculer:function(U){FOULE.ordre(s.sim,U,'recule',3200,2);},
    pousser:function(U){if(!iaCoute(s,'pousser'))return;FOULE.ordre(s.sim,U,'avance',3200,2);},
    formation:function(U,f){U.form=f;},
    gaz:function(U){
      if(!iaCoute(s,'gaz'))return;
      var dv=FOULE.devant(U), gx=U.ax+dv[0]*3.8, gy=U.ay+dv[1]*3.8;
      /* L'IA VISE AUSSI. Maintenant que la cible est un parametre, il
         serait absurde que la machine lance toujours droit devant
         pendant que le joueur choisit : elle vise le point le plus
         charge de la foule qui est a sa portee. */
      var T=iaCible(s,U,PORT_GAZ);
      if(T){gx=T[0];gy=T[1];}
      FOULE.evenement(s.sim,gx,gy,3.0,0.5);
      if(FUM&&s.fum)FUM.grenade(s.fum,gx,gy,1);
      if(s.M&&MISSION)MISSION.noter(s.M,'gaz');
      if(SON)SON.effet('grenade');
    },
    eau:function(U){
      if(!iaCoute(s,'eau'))return;
      var dv=FOULE.devant(U), T2=iaCible(s,U,PORT_EAU+2);
      U.membres.forEach(function(i){
        var a=s.sim.agents[i], ux=dv[0], uy=dv[1];
        if(T2){
          var ddx=T2[0]-a.x, ddy=T2[1]-a.y, dd=Math.sqrt(ddx*ddx+ddy*ddy);
          if(dd>0.4){ux=ddx/dd; uy=ddy/dd;}
        }
        if(FUM&&s.fum)FUM.jet(s.fum,a.x+ux*0.9,a.y+uy*0.9,ux,uy,2600);
      });
      if(s.M&&MISSION)MISSION.noter(s.M,'eau');
      if(SON)SON.effet('eau');
    },
    /* ---- ce qu'elle voit, lu sur la simulation ---- */
    corpsDevant:function(d){
      var n=0, A=s.sim.agents, mur=iaMur(s);
      for(var i=0;i<A.length;i++){
        var a=A[i]; if(a.camp!=='manif')continue;
        if(a.etat==='PANIQUE'||a.etat==='FUIT')continue;
        if(a.x>mur-d&&a.x<mur+1)n++;
      }
      return n;
    },
    perces:function(){
      var n=0, A=s.sim.agents, mur=iaMur(s);
      for(var i=0;i<A.length;i++){
        var a=A[i]; if(a.camp!=='manif')continue;
        if(a.x>mur+1.2)n++;
      }
      return n;
    },
    casseEnCours:function(){
      if(!s.M||!s.M.ciblee)return null;
      var V=s.M.ciblee;
      return (!V.brisee&&V.pres>=3)?V:null;
    },
    barricadeEnCours:function(){
      for(var i=0;i<s.barricades.length;i++)
        if(!s.barricades[i].faite)return s.barricades[i];
      return null;
    },
    plusProche:function(L,gx,gy){
      var b=null, bd=1e9;
      for(var i=0;i<L.length;i++){
        var d=(L[i].ax-gx)*(L[i].ax-gx)+(L[i].ay-gy)*(L[i].ay-gy);
        if(d<bd){bd=d;b=L[i];}
      }
      return b;
    },
    /* CE QUI FAIT LE PLUS DE BRUIT. Un bloc en feinte se signale : si
       l'IA n'y voyait rien, l'action n'existerait pas. */
    feinte:function(){
      for(var i=0;i<s.tous.length;i++){
        var U=s.tous[i];
        if(U.camp!=='manif'||!(U.feinte>0))continue;
        var fo=[U.ax,U.ay]; foyerUnite(s,U,fo);
        return {x:fo[0], y:fo[1], u:U};
      }
      return null;
    },
    plusPresse:function(L){
      var b=null, bp=-1;
      for(var i=0;i<L.length;i++)if(L[i].presse>bp){bp=L[i].presse;b=L[i];}
      return b;
    }
  };
}
function iaMur(s){
  var mur=1e9, A=s.sim.agents;
  for(var i=0;i<s.tous.length;i++){
    var U=s.tous[i]; if(U.camp!=='crs'||U.camions)continue;
    for(var m=0;m<U.membres.length;m++){var a=A[U.membres[m]];if(a.x<mur)mur=a.x;}
  }
  return (mur>1e8)?TER.bx:mur;
}
function missionApi(s){
  return {evenement:function(k,M){
    if(k==='poussee'){
      /* la tete force : les blocs de devant accelerent pour 16 s */
      s.poussee=16000;
    }
    else if(k==='casseurs'){
      var G=s.casseurs, V=M.ciblee;
      if(!G||!V)return;
      G.parti=true; M.casseurs=G;
      G.ax=V.x; G.ay=V.y;
      G.membres.forEach(function(i){
        var a=s.sim.agents[i]; a.ex*=0.5; a.ey*=0.5;
      });
    }
    else if(k==='renfortCortege'){
      /* SOIXANTE MANIFESTANTS DE PLUS, pour de vrai, entrant par l'ouest
         de l'avenue et remontant vers la tete. La pression monte : si le
         joueur ne fait rien, la ligne finit par ceder. */
      var B=s.corteges[s.corteges.length-1];
      if(!B)return;
      var R2=FOULE.R, d2=new Dé((s.graine||3)+451), midY2=(AV.y0+AV.y1)/2+0.5;
      for(var q=0;q<60;q++){
        var qx=-(q%10)*0.55, qy=(d2.f()-0.5)*4.2;
        FOULE.poser(s.sim,B,Math.max(2,s.front-B.base-6+qx),midY2+qy,
          {ex:(d2.f()-0.5)*8, ey:qy, varia:d2.e(0,11),
           vmax:R2.vMarche*(0.9+d2.f()*0.3), nerf:0.6+d2.f()*1.1, stress:d2.f()*0.1});
        var ar=s.sim.agents[s.sim.agents.length-1];
        if(d2.f()<0.10)ar.type='pancarte',ar.varia=d2.e(0,4);
      }
    }
    else if(k==='presse'){
      var P=s.presse; if(!P)return;
      P.ax=Math.max(2,s.front-0.5); P.ay=(AV.y0+AV.y1)/2+0.5;
      P.colle=true;
    }
    else if(k==='incendie'){
      /* LA BENNE DU MILIEU. Un foyer large et long, a l'est de la
         fontaine mais DECALE AU NORD : pose sur l'axe du cortege il
         barrait le passage a ceux-la memes qui l'allument, et le
         cortege ne gagnait plus une seule partie. Decale, il tend la
         place, oblige a contourner, et laisse le jeu jouable. */
      if(!FUM||!s.fum)return;
      var ccx=Math.round((RU.x0+RU.x1)/2)+5.5, ccy=Math.round((AV.y0+AV.y1)/2)-5.5;
      var FE=FUM.feu(s.fum,ccx,ccy,1.35,120000);
      if(FE)FE.r=2.1;
      if(SON)SON.effet('charge');
    }
    else if(k==='renfort'){
      /* SIX HOMMES DE PLUS, pour de vrai : ils arrivent par l'est et
         rejoignent la reserve. Un evenement qui n'ajouterait qu'une
         phrase ne serait pas un evenement. */
      var RES=s.unites[3]; if(!RES)return;
      var R=FOULE.R;
      for(var i=0;i<6;i++){
        FOULE.poser(s.sim,RES,GW-4+((i%2)*0.6),(AV.y0+AV.y1)/2+0.5+((i/2)|0)*0.7,
          {varia:i%3, vmax:R.vMarche*1.05, r:0.45, masse:1.8, nerf:0.4});
      }
    }
  }};
}

/* =====================================================================
   LES BARRICADES

   Un bloc de manifestants peut en monter une la ou il se trouve. Elle
   n'apparait pas d'un coup : il faut QUATRE CORPS dessus pendant SIX
   SECONDES, et le cordon peut les deloger entre-temps. Une fois debout
   elle bloque la case — et il faudra la contourner, des deux cotes.

   Elle est faite de ce qui traine sur une place : barrieres renversees,
   bancs, poubelles. Le dessin se construit en trois etats pour qu'on
   voie le travail avancer.
   ===================================================================== */
/* ON MONTE LA BARRICADE LA OU SONT LES CORPS, pas sur le point de
   ralliement du groupe : celui-ci peut etre a dix tuiles devant, et on
   posait un chantier que personne n'atteignait jamais. */
function barricadeNouvelle(s,U){
  var sx=0, sy=0, n=0, A=s.sim.agents;
  for(var k=0;k<U.membres.length;k++){
    var a=A[U.membres[k]];
    if(a.etat==='PANIQUE'||a.etat==='FUIT')continue;
    sx+=a.x; sy+=a.y; n++;
  }
  if(!n)return null;
  var gx=Math.round(sx/n-0.5), gy=Math.round(sy/n-0.5);
  if(gx<1||gy<1||gx>=GW-1||gy>=GH-1)return null;
  if(s.C.bloc[gy][gx])return null;
  for(var i=0;i<s.barricades.length;i++){
    var b=s.barricades[i];
    if(Math.abs(b.x-gx)<2&&Math.abs(b.y-gy)<2)return null;
  }
  var B={x:gx, y:gy, t:0, faite:false, groupe:U.id, pres:0};
  s.barricades.push(B);
  return B;
}
/* =====================================================================
   LA BARRICADE ENFLAMMEE

   Une barricade bloque la case ; la police peut la contourner, et avec
   le temps la foule la deborde. Un cocktail dessus en fait autre chose :
   tant qu'elle brule, PERSONNE ne s'en approche — le foyer repousse les
   corps et son coeur ne se traverse pas.

   On ne l'allume pas avec un bouton de plus : c'est la rencontre de
   deux actions qu'on avait deja. Un molotov qui tombe a moins d'une
   tuile et demie d'une barricade y met un feu plus gros et plus long
   qu'ailleurs. C'est au joueur de voir la combinaison, pas au jeu de la
   lui annoncer.
   ===================================================================== */
function majBarricadesFeu(s,dt){
  if(!FUM||!s.fum||!s.barricades||!s.barricades.length)return;
  for(var i=0;i<s.barricades.length;i++){
    var B=s.barricades[i];
    if(!B.faite||B.enflammee)continue;
    for(var f=0;f<s.fum.feux.length;f++){
      var F=s.fum.feux[f];
      var dx=F.x-(B.x+0.5), dy=F.y-(B.y+0.5);
      if(dx*dx+dy*dy>2.25)continue;         /* une tuile et demie */
      B.enflammee=true;
      F.x=B.x+0.5; F.y=B.y+0.5;
      F.r=Math.max(F.r,2.0);
      F.vie=Math.max(F.vie,F.t+46000);      /* elle brule longtemps */
      s.mot='BARRICADE EN FEU';s.motT=1900;
      if(SON)SON.effet('charge');
      break;
    }
  }
}
function majBarricades(s,dt){
  if(!s.barricades)return;
  var A=s.sim.agents;
  for(var i=0;i<s.barricades.length;i++){
    var B=s.barricades[i];
    if(B.faite)continue;
    var n=0;
    for(var k=0;k<A.length;k++){
      var a=A[k];
      if(a.camp!=='manif')continue;
      if(a.etat==='PANIQUE'||a.etat==='FUIT')continue;
      var dx=a.x-(B.x+0.5), dy=a.y-(B.y+0.5);
      if(dx*dx+dy*dy<2.6)n++;
    }
    B.pres=n;
    if(n>=4){
      B.t+=dt*(n/5);
      if(B.t>6000){
        B.faite=true;
        s.C.bloc[B.y][B.x]=1;
        s.sim.champsPrets=false; s.sim.champFuitePret=false;
        /* le decor change : les champs de navigation doivent le savoir */
        s.statiques.push({k:'obj',o:{t:'barricade',gx:B.x+0.5,gy:B.y+0.5},
          prof:B.x+B.y+1, x:mx(B.x+0.5,B.y+0.5)-OBJ.barricade.ox,
          y:my(B.x+0.5,B.y+0.5)-OBJ.barricade.oy,
          w:OBJ.barricade.cv.width, h:OBJ.barricade.cv.height, cv:OBJ.barricade.cv});
        s.statiques.sort(function(p,q){return p.prof-q.prof;});
        if(SON)SON.effet('charge');
        if(s.M)s.M.barricades=(s.M.barricades||0)+1;
        s.mot='BARRICADE DEBOUT';s.motT=1700;
      }
    }else B.t=Math.max(0,B.t-dt*0.9);
  }
}

/* =====================================================================
   LE COMMANDEMENT

   UN ORDRE N'EST PAS UN TEXTE. Chacun de ceux qui suivent pose quelque
   chose que la simulation lit : un champ de navigation, un decalage de
   figure, une place tenue. Rien ici ne se contente de changer un
   libelle — si on retire l'affichage, les unites obeissent pareil.

   LES PRIORITES. TENIR (4) annule tout, car c'est le bouton de secours ;
   un deplacement (3) chasse un AVANCE (2) ; la reaction a la densite (0)
   ne s'exprime que si rien d'autre n'est en cours.
   ===================================================================== */
function selection(s){
  var L=[];
  for(var k in s.selN)if(s.selN[k]&&s.unites[k])L.push(s.unites[k]);
  if(!L.length&&s.unites&&s.unites[0]){s.selN={0:true};L.push(s.unites[0]);}
  return L;
}
function selNoms(s){
  var L=selection(s);
  if(L.length===1)return L[0].nom;
  if(L.length===s.unites.length)return 'TOUTES LES UNITÉS';
  return L.length+' UNITÉS';
}
/* ENVOYER. Plusieurs unites visant le meme point s'ecraseraient les unes
   sur les autres : on les repartit en eventail autour du point vise,
   perpendiculairement a leur marche. */
function cmdAller(s,gx,gy){
  var L=selection(s), n=L.length, ok=0;
  /* LE BLOC COMMANDE SORT DU CORTEGE. majCortege reposait la position
     de ralliement de chaque bloc a chaque image : l'ordre partait, le
     champ se calculait, et une milliseconde plus tard le bloc etait
     ramene sur l'axe de l'avenue. Rien ne bougeait, et c'etait le seul
     ordre du camp manifestant qui ne marchait pas. */
  for(var i=0;i<n;i++){
    var U=L[i], dec=(i-(n-1)/2)*2.2;
    var tx=gx, ty=Math.round(gy+dec);
    var r=chemin(s.C,Math.floor(U.ax),Math.floor(U.ay),tx,ty);
    if(!r){r=chemin(s.C,Math.floor(U.ax),Math.floor(U.ay),gx,gy);ty=gy;}
    if(!r)continue;
    U.route=r;U.ri=0;U.nRoute=r.length;
    U.champ.calculer(s.sim,[[tx,ty]]);
    U.but=[tx,ty];
    U.libre=true;
    U.ancre=undefined;        /* elle repart d'ailleurs : nouvelle ancre */
    FOULE.ordre(s.sim,U,'vers',0,3);
    ok++;
  }
  if(ok){s.mot=selNoms(s)+' · EN MARCHE';s.motT=1500;if(SON)SON.effet('ordre');}
  else{s.mot='PAS DE PASSAGE PAR LA';s.motT=1400;}
  return ok;
}
function cmdTenir(s){
  var L=selection(s);
  L.forEach(function(U){
    U.route=null;U.but=null;
    /* la place tenue devient celle d'ou l'on tient : on ne retourne pas
       a son point de depart du debut de partie */
    U.tenu={x:U.ax,y:U.ay};
    U.ordre=null;U.ordrePrio=0;
    FOULE.ordre(s.sim,U,'tenir',2200,4);
  });
  s.mot=selNoms(s)+' · TIENT LA POSITION';s.motT=1500;
}
function cmdPousser(s,sens){
  var L=selection(s), ok=0;
  if(sens>0&&s.M&&MISSION)MISSION.noter(s.M,'charge');
  if(SON)SON.effet(sens>0?'charge':'ordre');
  L.forEach(function(U){
    if(FOULE.ordre(s.sim,U,sens>0?'avance':'recule',3200,2))ok++;
  });
  s.mot=selNoms(s)+(sens>0?' · EN AVANT':' · ROMPEZ D’UN PAS');s.motT=1500;
  return ok;
}
function cmdForme(s){
  var L=selection(s).filter(function(U){return !!U.form;}), F=['ligne','coin','colonne','nasse'];
  if(!L.length){s.mot='CES GROUPES N’ONT PAS DE FORMATION';s.motT=1600;return;}
  var cur=L[0].form, suiv=F[(F.indexOf(cur)+1)%F.length];
  L.forEach(function(U){U.form=suiv;});
  s.mot=selNoms(s)+' · '+suiv.toUpperCase();s.motT=1500;
}
/* REGROUPER : les unites choisies convergent vers leur barycentre, en
   file, et s'y rangent. C'est un vrai deplacement — champs calcules,
   ordres poses — pas un rapprochement d'icones. */
/* =====================================================================
   LA FEINTE

   Le passage fait treize tuiles pour une ligne qui en couvre huit :
   geographiquement, il y a toujours un cote degarni. Encore faut-il
   que la police regarde ailleurs — sinon elle se contente de suivre le
   gros du cortege.

   Un bloc en feinte se jette en avant de facon ostensible pendant huit
   secondes, et l'IA adverse le prend pour l'attaque principale : elle
   envoie sa reserve dessus. Pendant ce temps, le vrai effort passe
   ailleurs. C'est la premiere action du jeu qui ne sert a rien toute
   seule — elle ne vaut que par ce qu'on fait pendant.
   ===================================================================== */
function cmdFeinte(s){
  var L=selection(s);
  if(!L.length){s.mot='CHOISIS UN BLOC';s.motT=1500;return 0;}
  var n=0;
  L.forEach(function(U){
    U.feinte=8000;
    FOULE.ordre(s.sim,U,'avance',8000,2);
    n++;
  });
  if(n){
    s.mot=selNoms(s)+' · FEINTE';s.motT=1800;
    if(SON)SON.effet('sifflet');
  }
  return n;
}
/* =====================================================================
   LES TROIS ORDRES DE MAINTIEN

   La police avait la force — gaz, eau, charge — et rien d'autre. Or
   tenir une place, ce n'est pas seulement frapper : c'est annoncer,
   encercler, et retirer celui qui entraine les autres. Trois ordres,
   trois couts, trois contreparties.
   ===================================================================== */

/* LES SOMMATIONS. Elles ne dispersent personne par elles-memes : elles
   font reculer ceux qui hesitaient deja, et surtout elles COUVRENT ce
   qui suit. Gazer sans avoir somme devant les cameras coute le double.
   C'est le seul ordre du jeu dont l'interet est de rendre un AUTRE
   ordre moins cher. */
function cmdSommation(s){
  s.somm=20000;
  if(SON)SON.effet('sifflet');
  var A=s.sim.agents, n=0;
  for(var i=0;i<A.length;i++){
    var a=A[i];
    if(a.camp!=='manif')continue;
    /* ceux qui tiennent mal se decrochent ; les autres durcissent */
    /* MESURE : a 0,34 de seuil et 0,16 d'ajout, cent quarante personnes
       decrochaient d'un coup et la moitie passait en panique — une
       sommation n'est pas une grenade. On ne touche que ceux qui
       hesitaient deja, et de moitie moins. */
    if(a.stress>0.48&&a.nerf>1.0){a.stress=Math.min(1,a.stress+0.09);n++;}
    else a.stress=Math.max(0,a.stress-0.06);
  }
  s.mot='SOMMATIONS · '+n+' RECULENT';s.motT=1900;
  return 1;
}

/* LA NASSE. Les unites choisies se referment en fer a cheval sur la
   foule la plus proche. Ceux qui sont dedans n'avancent plus et ne
   comptent plus — mais une nasse se paie : la tension monte d'un coup,
   et une rue tendue fait ceder TOUTES les lignes, y compris la sienne. */
function cmdNasse(s){
  var L=selection(s).filter(function(U){return !U.camions;});
  if(!L.length){s.mot='CHOISIS UNE LIGNE';s.motT=1500;return 0;}
  var c=iaCible(s,L[0],7.5);
  if(!c){s.mot='PERSONNE À ENCERCLER';s.motT=1600;return 0;}
  var n=0, A=s.sim.agents;
  L.forEach(function(U){
    U.form='nasse';
    U.route=null;U.but=null;
    U.ax=c[0]; U.ay=c[1];
    U.cap=Math.atan2(-(c[0]-U.ax||1),(c[1]-U.ay||0));
    FOULE.ordre(s.sim,U,'tenir',9000,4);
    n++;
  });
  /* ceux qui sont dedans : marques pour douze secondes */
  var pris=0;
  for(var i=0;i<A.length;i++){
    var a=A[i];
    if(a.camp!=='manif')continue;
    var dx=a.x-c[0], dy=a.y-c[1];
    /* DEUX TUILES ET DEMIE. A trois, on encerclait cent trente
       personnes d'un seul ordre : une nasse est chirurgicale, pas une
       rafle. */
    if(dx*dx+dy*dy>6.25)continue;
    a.nasse=12000; pris++;
  }
  s.sim.tension=Math.min(1,s.sim.tension+0.12);
  if(SON)SON.effet('charge');
  s.mot='NASSE · '+pris+' ENCERCLÉS';s.motT=1900;
  return n;
}

/* L'INTERPELLATION. Chaque bloc de cortege a un meneur — celui dont les
   autres suivent l'allure. Le retirer desorganise le bloc pendant vingt
   secondes : il perd sa cohesion, il s'etale, il pousse moins. C'est
   chirurgical, et c'est pour ca que ca coute cher et que ca ne marche
   qu'au contact. */
function cmdArrestation(s){
  var L=selection(s).filter(function(U){return !U.camions;});
  if(!L.length){s.mot='CHOISIS UNE UNITÉ';s.motT=1500;return 0;}
  var o=[0,0];
  if(!foyerUnite(s,L[0],o)){o[0]=L[0].ax;o[1]=L[0].ay;}
  /* LE BLOC DONT ON TIENT QUELQU'UN, pas celui dont le centre est
     proche : un bloc de soixante-dix personnes a son centre a dix
     tuiles alors que sa tete est au contact. On cherche donc le
     manifestant le plus proche et on remonte a son groupe. */
  var A=s.sim.agents, best=null, bd=16.0;
  for(var i=0;i<A.length;i++){
    var a=A[i];
    if(a.camp!=='manif')continue;
    var dx=a.x-o[0], dy=a.y-o[1], d2=dx*dx+dy*dy;
    if(d2>=bd)continue;
    var G=s.sim.groupes[a.g];
    if(!G||!G.court||G.decapite>0)continue;
    bd=d2; best=G;
  }
  if(!best){s.mot='AUCUN MENEUR À PORTÉE';s.motT=1700;return 0;}
  best.decapite=20000;
  best.cohAv=best.cohesion;
  best.cohesion=Math.max(0,best.cohesion*0.25);
  s.sim.tension=Math.min(1,s.sim.tension+0.05);
  if(SON)SON.effet('sifflet');
  s.mot='INTERPELLATION · '+best.nom+' DÉSORGANISÉ';s.motT=2000;
  return 1;
}
function cmdGrouper(s){
  var L=selection(s);
  /* UN SEUL BLOC SELECTIONNE : on le REND AU CORTEGE. Sans ca, un bloc
     envoye quelque part n'avait plus aucun moyen de revenir dans le
     rang, et le cortege se vidait partie apres partie. */
  var rendus=L.filter(function(U){return U.libre;});
  if(L.length<2){
    if(rendus.length){
      rendus.forEach(function(U){U.libre=false;U.route=null;U.but=null;
        U.ordre=null;U.ordrePrio=0;U.ordreT=0;});
      s.mot=selNoms(s)+' · REJOINT LE CORTÈGE';s.motT=1600;
      if(SON)SON.effet('ordre');
      return rendus.length;
    }
    s.mot='CHOISIS AU MOINS DEUX UNITÉS';s.motT=1600;return 0;
  }
  var cx=0, cy=0;
  L.forEach(function(U){cx+=U.ax;cy+=U.ay;});
  cx=Math.round(cx/L.length); cy=Math.round(cy/L.length);
  var ok=0;
  for(var i=0;i<L.length;i++){
    /* 2,6 tuiles entre deux unites : a 1,9 leurs figures se
       chevauchaient et un homme sur deux ne pouvait plus atteindre sa
       place — on mesurait cinq tuiles d'ecart apres le regroupement. */
    var U=L[i], ty=cy+(i-(L.length-1)/2)*2.6;
    var tx=cx, t2=Math.round(ty);
    if(!libre(s.C,tx,t2)){var c2=null;
      for(var r=1;r<=6&&!c2;r++)for(var oy=-r;oy<=r&&!c2;oy++)for(var ox=-r;ox<=r;ox++){
        if(Math.max(Math.abs(ox),Math.abs(oy))!==r)continue;
        if(libre(s.C,tx+ox,t2+oy)){c2=[tx+ox,t2+oy];break;}}
      if(c2){tx=c2[0];t2=c2[1];}
    }
    var rr=chemin(s.C,Math.floor(U.ax),Math.floor(U.ay),tx,t2);
    if(!rr)continue;
    U.route=rr;U.ri=0;U.nRoute=rr.length;
    U.champ.calculer(s.sim,[[tx,t2]]);
    U.but=[tx,t2];
    FOULE.ordre(s.sim,U,'vers',0,3);
    ok++;
  }
  s.mot=ok?('REGROUPEMENT · '+ok+' UNITÉS'):'REGROUPEMENT IMPOSSIBLE';s.motT=1600;
  return ok;
}
/* LA GRENADE POSE UN NUAGE, elle ne lance plus un eclair. Avant :
   un evenement instantane et un cercle jaune qui s'agrandissait. Le
   nuage tient neuf secondes, derive, et prend tous ceux qui entrent
   dedans tant qu'il est la — c'est ce qui fait qu'il TIENT du terrain
   et que le degager coute quelque chose. */
/* POUSSER : le bloc choisi force sur la ligne. Il avance plus vite et
   se serre : c'est l'ordre qui fait reculer un cordon, et celui qui
   fait monter la tension le plus vite. */
function cmdPousser2(s){
  var L=selection(s), n=0;
  L.forEach(function(U){
    U.pousse=6000;
    FOULE.ordre(s.sim,U,'avance',4200,2);
    n++;
  });
  if(SON)SON.effet('charge');
  s.mot=selNoms(s)+' · ON POUSSE';s.motT=1600;
  return n;
}
/* CASSER : le bloc se porte sur la devanture la plus proche. Elle tombe
   si quatre d'entre eux y restent — exactement la regle des casseurs. */
function cmdCasser(s){
  var L=selection(s);
  if(!s.vitrines.length){s.mot='RIEN À CASSER PAR ICI';s.motT=1500;return 0;}
  var n=0;
  L.forEach(function(U){
    var V=null, bd=1e9;
    for(var i=0;i<s.vitrines.length;i++){
      var w=s.vitrines[i]; if(w.brisee)continue;
      var d=(w.x-U.ax)*(w.x-U.ax)+(w.y-U.ay)*(w.y-U.ay);
      if(d<bd){bd=d;V=w;}
    }
    if(!V)return;
    if(s.M)s.M.ciblee=V;
    if(s.M)s.M.casseurs=U;
    var r=chemin(s.C,Math.floor(U.ax),Math.floor(U.ay),Math.floor(V.x),Math.floor(V.y));
    if(!r)return;
    U.route=r;U.ri=0;U.nRoute=r.length;U.but=[Math.floor(V.x),Math.floor(V.y)];
    U.champ.calculer(s.sim,[[Math.floor(V.x),Math.floor(V.y)]]);
    FOULE.ordre(s.sim,U,'vers',0,3);
    n++;
  });
  s.mot=n?(selNoms(s)+' · SUR LA DEVANTURE'):'PAS DE PASSAGE';s.motT=1600;
  return n;
}
/* BARRICADE : on monte sur place. Quatre corps, six secondes. */
function cmdBarricade(s){
  var L=selection(s), n=0;
  L.forEach(function(U){ if(barricadeNouvelle(s,U))n++; });
  s.mot=n?('ON MONTE '+(n>1?(n+' BARRICADES'):'UNE BARRICADE')):'IMPOSSIBLE ICI';
  s.motT=1700;
  return n;
}
/* DISPERSER : le bloc rompt et file vers les sorties. */
function cmdDisperser(s){
  var L=selection(s);
  L.forEach(function(U){
    U.ordre='disperse'; U.ordreT=5000; U.ordrePrio=3;
    U.route=null; U.but=null;
  });
  if(SON)SON.effet('sifflet');
  s.mot=selNoms(s)+' · ON SE DISPERSE';s.motT=1600;
}

/* LE MOLOTOV. Trois bouteilles partent du bloc choisi vers la ligne
   d'en face : on les voit voler, et le feu ne nait qu'a l'impact. Le
   foyer tient une demi-minute, repousse ce qui s'en approche et bloque
   le passage aussi surement qu'une barricade — des deux cotes.
   Ca se paie : la tension monte d'un coup, et le rapport s'en souvient. */
/* LE BARYCENTRE DES CORPS DEBOUT d'une unite : le point d'ou part ce
   qu'elle lance. U.ax est un point de ralliement, parfois a dix tuiles
   des hommes ; ce qu'on jette part des hommes. */
function foyerUnite(s,U,out){
  var sx=0, sy=0, m=0, A=s.sim.agents;
  for(var k=0;k<U.membres.length;k++){
    var a=A[U.membres[k]];
    if(a.etat==='PANIQUE'||a.etat==='FUIT')continue;
    sx+=a.x; sy+=a.y; m++;
  }
  if(!m)return false;
  out[0]=sx/m; out[1]=sy/m;
  return true;
}
/* RAMENER UNE CIBLE DANS LA PORTEE. On ne refuse pas un tir trop long :
   on le raccourcit sur la meme direction. Un refus sec au doigt est
   une commande qui ne marche pas ; un tir raccourci se voit et
   s'apprend en une fois. */
function borner(ox,oy,cx,cy,port,out){
  var dx=cx-ox, dy=cy-oy, d=Math.sqrt(dx*dx+dy*dy);
  if(d<1e-6){out[0]=ox+port*0.5;out[1]=oy;return false;}
  if(d<=port){out[0]=cx;out[1]=cy;return true;}
  out[0]=ox+dx/d*port; out[1]=oy+dy/d*port;
  return false;
}
var PORT_MOLOTOV=7.5, PORT_GAZ=6.5, PORT_EAU=5.5;
/* =====================================================================
   LA PREPARATION

   « On s'ennuie. » Le jeu commencait par un briefing qu'on lit pendant
   que la partie tourne deja : aucune decision avant le contact, et le
   premier choix arrivait quand il etait trop tard pour qu'il compte.

   Quarante secondes avant que le cortege arrive. On y fait deux choses,
   et les deux pesent sur toute la partie :
     - ON PLACE SES UNITES. Treize tuiles de passage pour trois lignes :
       c'est la, et pas ailleurs, qu'on decide ou l'on va perdre du
       terrain. Le geste est celui du jeu — on tape un jeton, on tape la
       case — sauf qu'ici l'unite s'y trouve TOUT DE SUITE.
     - ON S'EQUIPE. Un budget, quatre articles, et ce qu'on ne depense
       pas devient de l'elan au coup d'envoi. Tout acheter, c'est
       commencer a sec.
   Et PRET lance tout de suite, avec un bonus proportionnel au temps
   qu'on n'a pas pris : savoir ce qu'on veut doit payer.
   ===================================================================== */
var PREP_DUREE=40000, PREP_BUDGET=42;
var ARTICLES={
  crs:[
    {k:'barrieres', n:'BARRIÈRES', d:'passage rétréci', p:12},
    {k:'camion',    n:'CAMION',    d:'un 2ᵉ lance à eau', p:18},
    {k:'reserve',   n:'RÉSERVE',   d:'+10 hommes', p:16},
    {k:'casques',   n:'CASQUES',   d:'encaissent mieux', p:10}
  ],
  manif:[
    {k:'cocktails', n:'COCKTAILS', d:'une salve offerte', p:12},
    {k:'barricade', n:'BARRICADE', d:'déjà montée', p:16},
    {k:'sono',      n:'SONO',      d:'on panique moins', p:10},
    {k:'renfort',   n:'RENFORT',   d:'+30 des nôtres', p:18}
  ]
};
function prepArticles(s){return ARTICLES[s.camp]||ARTICLES.crs;}
function prepReste(s){
  var b=PREP_BUDGET, L=prepArticles(s);
  for(var i=0;i<L.length;i++)if(s.prep.achats[L[i].k])b-=L[i].p;
  return b;
}
/* LE COUP D'ENVOI. On applique ici tout ce qui a ete choisi, une fois,
   et la prepa disparait : le reste du jeu n'a jamais a savoir qu'elle a
   existe. */
function prepLancer(s){
  if(!s.prep)return;
  var A=s.prep.achats, R=FOULE.R;
  var reste=prepReste(s);
  /* CE QU'ON N'A PAS DEPENSE DEVIENT DE L'ELAN, et le temps qu'on n'a
     pas pris aussi : deux facons de dire qu'on savait ce qu'on voulait. */
  var bonusT=Math.round(Math.max(0,s.prep.t)/1000*0.9);
  s.res=Math.min(RES_MAX, s.res+reste*0.55+bonusT);
  if(A.casques){
    for(var i=0;i<s.sim.agents.length;i++){
      var a=s.sim.agents[i];
      if(a.camp==='crs')a.nerf*=0.62;
    }
  }
  if(A.sono){
    for(var j=0;j<s.sim.agents.length;j++){
      var b2=s.sim.agents[j];
      if(b2.camp==='manif')b2.nerf*=0.68;
    }
  }
  if(A.cocktails)s.res=Math.min(RES_MAX,s.res+34);
  if(A.reserve||A.renfort||A.camion||A.barricade||A.barrieres)prepMatos(s,A);
  s.prep=null; s.zoneT=-2200;      /* les zones se taisent deux secondes */
  s.mot='LE CORTÈGE ARRIVE';s.motT=2200;
  if(SON)SON.effet('sifflet');
}
function prepMatos(s,A){
  var R=FOULE.R, d=new Dé((s.graine||11)+91), midY=(AV.y0+AV.y1)/2+0.5;
  if(A.reserve){
    var RES=null;
    for(var i=0;i<s.tous.length;i++)
      if(s.tous[i].camp==='crs'&&s.tous[i].reserve)RES=s.tous[i];
    if(!RES)for(i=0;i<s.tous.length;i++)
      if(s.tous[i].camp==='crs'&&!s.tous[i].camions)RES=s.tous[i];
    if(RES)for(var k=0;k<10;k++)
      FOULE.poser(s.sim,RES,RES.ax+(d.f()-0.5)*2,RES.ay+(d.f()-0.5)*2.4,
        {varia:k%3, vmax:R.vMarche*1.05, r:0.45, masse:1.8, nerf:0.4});
  }
  if(A.renfort){
    var B=s.corteges[s.corteges.length-1];
    if(B)for(var q=0;q<30;q++)
      FOULE.poser(s.sim,B,B.ax-(q%8)*0.55,B.ay+(d.f()-0.5)*4,
        {varia:d.e(0,11), vmax:R.vMarche*(0.9+d.f()*0.3), nerf:0.8});
  }
  if(A.camion){
    var EA=null;
    for(i=0;i<s.tous.length;i++)if(s.tous[i].camions)EA=s.tous[i];
    if(EA)FOULE.poser(s.sim,EA,EA.ax+0.8,EA.ay+1.6,
      {varia:1, vmax:R.vMarche*0.8, r:0.9, masse:9, nerf:0.2});
  }
  if(A.barricade){
    var bx2=Math.round(TER.bx-5), by2=Math.round(midY);
    if(s.C.bloc[by2]&&!s.C.bloc[by2][bx2]){
      var BB={x:bx2,y:by2,t:9999,faite:true,groupe:-1,pres:0};
      s.barricades.push(BB);
      s.C.bloc[by2][bx2]=1;
      s.sim.champsPrets=false; s.sim.champFuitePret=false;
      s.statiques.push({k:'obj',o:{t:'barricade',gx:bx2+0.5,gy:by2+0.5},
        prof:bx2+by2+1, x:mx(bx2+0.5,by2+0.5)-OBJ.barricade.ox,
        y:my(bx2+0.5,by2+0.5)-OBJ.barricade.oy,
        w:OBJ.barricade.cv.width, h:OBJ.barricade.cv.height, cv:OBJ.barricade.cv});
      s.statiques.sort(function(p2,q2){return p2.prof-q2.prof;});
    }
  }
  if(A.barrieres){
    /* DEUX RANGS DE PLUS aux deux bouts du passage : il passe de treize
       tuiles a neuf, et c'est tout ce qu'on demande a une barriere. */
    var midB=Math.round(midY), bb=TER.bx;
    [midB-TER.demi, midB-TER.demi+1, midB+TER.demi, midB+TER.demi-1].forEach(function(y2){
      if(!s.C.bloc[y2]||s.C.bloc[y2][bb])return;
      s.C.bloc[y2][bb]=1; s.C.bloc[y2][bb+1]=1;
      s.statiques.push({k:'obj',o:{t:'barriere',gx:bb+0.1,gy:y2+0.05},
        prof:bb+y2+1, x:mx(bb+0.1,y2+0.05)-OBJ.barriere.ox,
        y:my(bb+0.1,y2+0.05)-OBJ.barriere.oy,
        w:OBJ.barriere.cv.width, h:OBJ.barriere.cv.height, cv:OBJ.barriere.cv});
    });
    s.statiques.sort(function(p2,q2){return p2.prof-q2.prof;});
    s.sim.champsPrets=false; s.sim.champFuitePret=false;
  }
}
/* PLACER UNE UNITE PENDANT LA PREPA : elle y est tout de suite, ses
   hommes avec elle. Pas de marche, pas de chemin — on dispose, on ne
   commande pas encore. */
function prepPoser(s,gx,gy){
  var L=selection(s);
  if(!L.length)return 0;
  var U=L[0];
  if(s.C.bloc[gy]&&s.C.bloc[gy][gx])
    {s.mot='PAS ICI';s.motT=1100;return 0;}
  var dx=gx+0.5-U.ax, dy=gy+0.5-U.ay;
  U.ax=gx+0.5; U.ay=gy+0.5;
  if(U.ancre!==undefined){U.ancre=U.ax;U.plie=0;}
  if(U.tenu){U.tenu.x=U.ax;U.tenu.y=U.ay;}
  var A=s.sim.agents;
  for(var i=0;i<U.membres.length;i++){
    var a=A[U.membres[i]];
    a.x+=dx; a.y+=dy; a.vx=0; a.vy=0;
  }
  s.mot=U.nom+' · EN POSITION';s.motT=1200;
  if(SON)SON.effet('clic');
  return 1;
}

/* =====================================================================
   LA JAUGE : CE QU'ON PEUT SE PERMETTRE

   Avant, chaque ordre fort avait sa propre recharge — vingt-deux
   secondes pour les cocktails, rien du tout pour le gaz — et le reste
   etait gratuit. On pouvait donc tout faire tout le temps, et il n'y
   avait rien a arbitrer : la seule question etait « quand le minuteur
   se termine-t-il ».

   Une jauge COMMUNE change la nature du jeu. Elle remonte lentement,
   chaque coup fort y puise, et depenser pour une chose, c'est ne pas
   l'avoir pour une autre. Gazer maintenant, c'est ne pas pouvoir
   arroser dans cinq secondes. C'est la premiere vraie decision du jeu.

   Elle s'appelle L'ELAN cote cortege et LES MOYENS cote police : le
   meme chiffre, deux mots qui disent ce qu'il represente.
   ===================================================================== */
var COUT={
  /* cortege */
  molotov:34, barricade:26, casser:14, pousser:10, disperser:6, groupe:0,
  /* police */
  gaz:34, eau:24, avant:18, forme:4, tenir:0, arriere:0,
  somm:8, nasse:30, arrest:22,
  feinte:16,
  /* commun */
  diag:0
};
/* MESURE : a 4,2 points la seconde et un plafond de cent, on repassait
   de quinze a plein en vingt secondes — autant dire que la jauge ne
   limitait rien. A 2,6 et un plafond de quatre-vingts, un coup fort se
   paie treize secondes, et deux coups forts d'affilee vident la
   reserve. C'est la que le choix apparait. */
var RES_MAX=80, RES_DEP=50, RES_GAIN=0.0026;
/* le temps de jeu s'ecoule a 72 % du temps reel : voir MOTEUR.pas */
var ALLURE=0.72;
function resNom(s){return (s.camp==='manif')?'ÉLAN':'MOYENS';}
function coute(s,k){
  var c=COUT[k]||0;
  if(!c)return true;
  if(s.res<c){
    s.mot=resNom(s)+' INSUFFISANT · '+Math.round(s.res)+'/'+c;s.motT=1500;
    if(SON)SON.effet('clic');
    return false;
  }
  s.res-=c;
  return true;
}
var VISE_MOT={molotov:'VISE : TAPE OU GLISSE LE DOIGT',
              gaz:'VISE : TAPE OU GLISSE LE DOIGT',
              eau:'VISE : TAPE OU GLISSE LE DOIGT'};
/* DU DOIGT A LA CASE. L'ecran, la camera, puis la grille. */
function doigtMonde(s,x,y,out){
  var z=s.cam.z;
  var ex=(x-s.L/2)/z+s.cam.x, ey=(y-s.H/2)/z+s.cam.y;
  out[0]=e2mx(ex,ey); out[1]=e2my(ex,ey);
}
/* TIRER. Le meme code que le doigt tape ou qu'il se leve apres avoir
   glisse : deux gestes, un seul chemin. */
function tirer(s,x,y){
  var q=s.vise; if(!q)return;
  /* ON PAIE AU TIR, PAS A L'ARMEMENT : viser puis changer d'avis ne
     doit rien couter. */
  if(!coute(s,q)){s.vise=null;s.viseXY=null;return;}
  var w=[0,0]; doigtMonde(s,x,y,w);
  s.vise=null; s.viseXY=null; s.motT=1700;
  if(q==='molotov')cmdMolotov(s,w[0],w[1]);
  else if(q==='gaz')cmdGaz(s,w[0],w[1]);
  else cmdEau(s,w[0],w[1]);
}
/* ARMER. On refuse AVANT d'allumer le bouton : viser pendant trois
   secondes pour s'entendre dire qu'il n'y a pas de bouteille est pire
   que de l'apprendre tout de suite. */
function armer(s,k){
  var L=selection(s);
  if(!L.length){s.mot='CHOISIS UNE UNITÉ';s.motT=1500;return false;}
  if(k==='molotov')return true;
  if(k==='gaz'){
    if(!L.filter(function(U){return !U.camions;}).length){
      s.mot='LES CAMIONS NE LANCENT PAS DE GRENADE';s.motT=1600;return false;}
    return true;
  }
  if(!L.filter(function(U){return U.camions;}).length){
    s.mot='CHOISIS LES CAMIONS';s.motT=1500;return false;}
  return true;
}
/* LA PORTEE DE CE QU'ON VISE, en tuiles, pour le cercle au sol. */
function portee(k){
  return (k==='molotov')?PORT_MOLOTOV:((k==='gaz')?PORT_GAZ:PORT_EAU);
}
function cmdMolotov(s,cx,cy){
  var L=selection(s);
  if(!FUM||!s.fum)return 0;
  /* LA RECHARGE FIXE A DISPARU : c'est la jauge qui limite, maintenant.
     Vingt-deux secondes imposees ne demandaient aucun choix ; trente-
     quatre points d'elan, si. */
  var mur=iaMur(s), n=0, loin=false, o=[0,0], c=[0,0];
  L.forEach(function(U){
    if(!foyerUnite(s,U,o))return;
    var sx=o[0], sy=o[1];
    /* OU ON VISE. Sans cible, droit devant comme avant ; avec une
       cible, exactement la — a deux reserves pres : la portee du bras,
       et la ligne de police. Un molotov qui tombe sur le cordon brule
       ceux qui l'ont lance la seconde d'apres. */
    var vx=(cx===undefined)?(sx+4.2):cx, vy=(cy===undefined)?sy:cy;
    if(!borner(sx,sy,vx,vy,PORT_MOLOTOV,c))loin=true;
    /* ON PEUT BRULER LA LIGNE, mais pas derriere. C'etait la piece
       manquante : interdit a 1,3 tuile EN DECA du cordon, le cocktail
       ne servait a rien — le cortege n'avait aucun moyen d'ouvrir une
       breche, et on mesurait zero passage pendant deux minutes vingt.
       Il porte maintenant jusqu'a une tuile AU-DELA du premier rang. */
    vx=Math.min(mur+1.0,c[0]); vy=c[1];
    /* la salve s'etale perpendiculairement au tir */
    var ax=vx-sx, ay=vy-sy, al=Math.sqrt(ax*ax+ay*ay)||1;
    var px=-ay/al, py=ax/al;
    for(var j=0;j<3;j++){
      FUM.projectile(s.fum,sx,sy,vx+px*(j-1)*1.5,vy+py*(j-1)*1.5,'molotov',j*110);
      n++;
    }
  });
  if(n){
    if(s.M&&MISSION)MISSION.noter(s.M,'molotov');
    if(SON)SON.effet('charge');
    s.mot=selNoms(s)+(loin?' · COCKTAILS (TROP LOIN, RACCOURCI)':' · COCKTAILS');
    s.motT=1700;
  }
  return n;
}

function cmdGaz(s,cx,cy){
  var L=selection(s).filter(function(U){return !U.camions;});
  if(!L.length){s.mot='LES CAMIONS NE LANCENT PAS DE GRENADE';s.motT=1600;return;}
  /* SOMMER AVANT DE GAZER. Le meme geste ne vaut pas la meme chose
     selon qu'on a prevenu ou non : c'est tout l'interet des
     sommations, et la seule faute que la presse retient. */
  if(s.M&&MISSION)MISSION.noter(s.M,(s.somm>0)?'gazSomme':'gaz');
  if(SON)SON.effet('grenade');
  var loin=false, o=[0,0], c=[0,0];
  L.forEach(function(U){
    if(!foyerUnite(s,U,o)){o[0]=U.ax;o[1]=U.ay;}
    var dv=FOULE.devant(U);
    var vx=(cx===undefined)?(o[0]+dv[0]*3.8):cx;
    var vy=(cy===undefined)?(o[1]+dv[1]*3.8):cy;
    if(!borner(o[0],o[1],vx,vy,PORT_GAZ,c))loin=true;
    FOULE.evenement(s.sim,c[0],c[1],3.0,0.5);   /* le souffle du depart */
    if(FUM&&s.fum)FUM.grenade(s.fum,c[0],c[1],1);
  });
  s.mot='GRENADE · '+selNoms(s)+(loin?' (TROP LOIN, RACCOURCIE)':'');s.motT=1500;
}

/* L'EAU. Le camion arrose devant lui : le jet pousse les corps qu'il
   touche, pendant deux secondes et demie. Il tend moins qu'une
   grenade — c'est tout son interet, et c'est pour ca qu'il compte
   moins au rapport. */
function cmdEau(s,cx,cy){
  var L=selection(s).filter(function(U){return U.camions;});
  if(!L.length){s.mot='CHOISIS LES CAMIONS';s.motT=1500;return;}
  if(!FUM||!s.fum)return;
  var n=0;
  L.forEach(function(U){
    var dv=FOULE.devant(U);
    U.membres.forEach(function(i){
      var a=s.sim.agents[i], ux=dv[0], uy=dv[1];
      /* LE CANON SUIT LA CIBLE. Sans cible il arrose devant la
         formation ; avec une cible, chaque camion oriente son jet vers
         elle depuis sa propre position. */
      if(cx!==undefined){
        var dx=cx-a.x, dy=cy-a.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d>0.4){ux=dx/d; uy=dy/d;}
      }
      FUM.jet(s.fum,a.x+ux*0.9,a.y+uy*0.9,ux,uy,2600);
      n++;
    });
  });
  if(s.M&&MISSION)MISSION.noter(s.M,(s.somm>0)?'eauSomme':'eau');
  if(SON)SON.effet('eau');
  s.mot='LANCE À EAU · '+n+' CANON'+(n>1?'S':'');s.motT=1600;
}

/* LA FIN. On ne touche pas a s.phase tout de suite : le shell remettrait
   son chrome par-dessus l'ecran de resultat. On le fait au moment ou le
   joueur appuie sur REJOUER. */
function finMission(s){
  if(s.finEnvoyee)return;
  s.finEnvoyee=true;
  if(SON){SON.effet(s.M.fin==='gagne'?'gagne':'perdu');SON.rumeur(0,0);}
  try{if(typeof finirPartie==='function')finirPartie(s.M.score,true);}catch(e){}
}

/* =====================================================================
   LA BARRE DE COMMANDEMENT

   DESSINEE DANS LA SCENE, et pas en HTML, pour une raison : elle doit
   montrer l'etat de chaque unite — son effectif, son ordre, ou il en
   est. Un bouton HTML ne sait pas faire ca sans devenir une page.

   LA TAILLE EST PHYSIQUE, PAS LOGIQUE. Une rangee fait 42 points
   d'ECRAN, divises par l'agrandissement de la borne : a x2 cela fait 21
   points de scene, a x4 cela en fait 10. La cible sous le pouce a donc
   toujours la meme taille en millimetres, que le telephone soit petit
   ou grand — c'est la meme raison qui fait que les manches du Hangar
   sont posees par-dessus le canvas et non dessinees dedans.

   DEUX RANGEES EN PORTRAIT, UNE SEULE COUCHE. Un ecran large a la place
   de tout aligner ; un ecran etroit ne l'a pas, et deux rangees valent
   mieux que douze timbres illisibles.
   ===================================================================== */
var UCOL=['#6ad8ff','#ffd24a','#7dff9a','#ff8ac8','#c8a0ff','#ff9a6a'];
/* deux tableaux constants : setLineDash en alloue un a chaque appel si
   on lui passe un litteral, soixante fois par seconde */
var DASH=[5,7], VIDE=[];
/* =====================================================================
   LES ICONES DE LA BARRE

   Sept ordres sur un telephone de 390 points, c'est vingt-sept points
   par bouton. Un mot entier n'y tient pas : POUSSER et BARRICADE se
   touchaient, et il fallait une troisieme rangee pour que ce soit
   lisible — trois rangees qui mangeaient un sixieme de l'ecran.
   Un pictogramme de seize pixels se lit du premier coup d'oeil et
   laisse la place au libelle en tout petit dessous. Peints une fois au
   premier affichage, recopies ensuite.
   ===================================================================== */
var ICO=null;
function icones(){
  if(ICO)return ICO;
  ICO={};
  var faire=function(k,f){
    var c=document.createElement('canvas'); c.width=c.height=16;
    var g=c.getContext('2d'); f(g); ICO[k]=c;
  };
  var fl=function(g,sens){            /* une fleche epaisse */
    g.fillStyle='#fff';
    var x0=sens>0?3:12;
    g.fillRect(sens>0?3:6,6,7,4);
    for(var i=0;i<5;i++)g.fillRect(x0+sens*(5+0),3+i, 1, 1);
    g.beginPath();
    g.moveTo(sens>0?10:6, 3); g.lineTo(sens>0?14:2, 8); g.lineTo(sens>0?10:6,13);
    g.closePath(); g.fill();
  };
  faire('pousser',function(g){fl(g,1);});
  faire('avant',  function(g){fl(g,1);});
  faire('arriere',function(g){fl(g,-1);});
  faire('tenir',  function(g){       /* un bouclier */
    g.fillStyle='#fff';
    g.beginPath();g.moveTo(8,2);g.lineTo(13,4);g.lineTo(13,9);
    g.lineTo(8,14);g.lineTo(3,9);g.lineTo(3,4);g.closePath();g.fill();
    g.fillStyle='#1a2430';g.fillRect(7,5,2,6);g.fillRect(5,7,6,2);
  });
  faire('forme',  function(g){       /* une ligne de six hommes */
    g.fillStyle='#fff';
    for(var i=0;i<6;i++)g.fillRect(2+i*2,6,1,5);
    g.fillRect(1,12,13,1);
  });
  faire('groupe', function(g){       /* trois points qui convergent */
    g.fillStyle='#fff';
    g.fillRect(7,7,3,3);
    g.fillRect(1,2,2,2);g.fillRect(13,2,2,2);g.fillRect(7,13,2,2);
    g.globalAlpha=0.55;
    g.fillRect(3,4,3,1);g.fillRect(11,4,3,1);g.fillRect(8,11,1,2);
    g.globalAlpha=1;
  });
  faire('disperser',function(g){     /* les memes, qui s'ecartent */
    g.fillStyle='#fff';
    g.fillRect(7,7,2,2);
    g.fillRect(0,0,3,3);g.fillRect(13,0,3,3);g.fillRect(6,13,3,3);
    g.globalAlpha=0.55;
    g.fillRect(4,4,2,1);g.fillRect(11,4,2,1);g.fillRect(8,10,1,2);
    g.globalAlpha=1;
  });
  faire('casser', function(g){       /* une vitre qui se fend */
    g.fillStyle='rgba(255,255,255,.28)';g.fillRect(2,2,12,12);
    g.fillStyle='#fff';
    g.fillRect(2,2,12,1);g.fillRect(2,13,12,1);
    g.fillRect(2,2,1,12);g.fillRect(13,2,1,12);
    g.fillRect(7,3,1,4);g.fillRect(8,7,1,2);g.fillRect(6,9,1,4);
    g.fillRect(9,6,4,1);g.fillRect(3,8,3,1);
  });
  faire('barricade',function(g){     /* trois barres empilees de travers */
    g.fillStyle='#fff';
    g.fillRect(1,10,14,3);
    g.save();g.translate(8,7);g.rotate(-0.22);g.fillRect(-7,-1,14,3);g.restore();
    g.save();g.translate(8,4);g.rotate(0.18);g.fillRect(-5,-1,11,2);g.restore();
  });
  faire('molotov',function(g){       /* la bouteille, et sa meche */
    g.fillStyle='#fff'; g.fillRect(6,5,4,9);
    g.fillStyle='rgba(255,255,255,.45)'; g.fillRect(6,9,4,5);
    g.fillStyle='#fff'; g.fillRect(7,2,2,3);
    g.fillStyle='#ffb43a'; g.fillRect(7,0,2,2);
  });
  faire('gaz',    function(g){       /* une grenade et son nuage */
    g.fillStyle='rgba(255,255,255,.42)';
    g.beginPath();g.arc(10,5,4.2,0,6.2832);g.fill();
    g.beginPath();g.arc(6,4,3,0,6.2832);g.fill();
    g.fillStyle='#fff';g.fillRect(5,9,4,6);g.fillRect(6,7,2,2);
  });
  faire('somm',   function(g){       /* un porte-voix */
    g.fillStyle='#fff';
    g.beginPath();g.moveTo(3,6);g.lineTo(9,3);g.lineTo(9,13);g.lineTo(3,10);
    g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.6)';
    g.fillRect(11,5,1,2);g.fillRect(13,4,1,3);g.fillRect(11,9,1,2);g.fillRect(13,9,1,3);
  });
  faire('nasse',  function(g){       /* un fer a cheval qui se referme */
    g.strokeStyle='#fff';g.lineWidth=2;
    g.beginPath();g.arc(8,8,5.5,-0.5,3.64);g.stroke();
    g.fillStyle='rgba(255,255,255,.55)';
    g.fillRect(7,6,3,4);
  });
  faire('arrest', function(g){       /* une main qui saisit une epaule */
    g.fillStyle='rgba(255,255,255,.4)';
    g.fillRect(6,7,4,8);g.fillRect(6,3,4,3);
    g.fillStyle='#fff';
    g.fillRect(10,6,5,2);g.fillRect(13,4,2,5);
  });
  faire('eau',    function(g){       /* un jet qui part en biais */
    g.fillStyle='#fff';g.fillRect(1,7,5,4);
    g.fillStyle='rgba(255,255,255,.75)';
    g.fillRect(6,8,3,2);g.fillRect(9,7,3,2);g.fillRect(12,5,3,2);
    g.fillStyle='rgba(255,255,255,.45)';
    g.fillRect(9,10,3,2);g.fillRect(12,11,3,2);
  });
  return ICO;
}
/* LES ANNEAUX DE SELECTION, PEINTS UNE FOIS PAR COULEUR.
   Un stroke d'ellipse sous une transformation d'echelle coute cher :
   douze hommes selectionnes, c'etait SIX MILLISECONDES par image, plus
   d'un quart du budget, pour des ronds qui ne changent jamais. Peints
   dans un calque et recopies, ils ne coutent plus rien. */
var ANN={};
function anneau(c,gros){
  var k=c+(gros?'G':'P');
  if(ANN[k])return ANN[k];
  var rx=gros?12:6, ry=gros?6.5:3.2;
  var cv=document.createElement('canvas');
  cv.width=Math.ceil(rx*2+4); cv.height=Math.ceil(ry*2+4);
  var g2=cv.getContext('2d');
  g2.strokeStyle=c; g2.lineWidth=1; g2.globalAlpha=gros?0.9:0.6;
  g2.beginPath();g2.ellipse(cv.width/2,cv.height/2,rx,ry,0,0,7);g2.stroke();
  ANN[k]={cv:cv,ox:cv.width/2,oy:cv.height/2};
  return ANN[k];
}
/* CHAQUE CAMP A SES ORDRES. Un manifestant ne lance pas de grenade et
   un policier ne monte pas de barricade : afficher un bouton qui ne
   fait rien serait exactement la fausse fonctionnalite qu'on s'interdit. */
/* NEUF ORDRES COTE POLICE, ET PAS DIX. GROUPE a saute : une ligne de
   maintien ne se regroupe pas, elle tient une figure — c'etait le seul
   bouton dont on ne se servait jamais. Neuf tiennent encore a
   quarante-trois points d'ecran ; dix tombaient a trente-neuf. */
var ORDRES_CRS=[
  {k:'tenir', t:'TENIR'},
  {k:'avant', t:'AVANT'},
  {k:'arriere', t:'ARRIÈRE'},
  {k:'forme', t:'FORME'},
  {k:'somm',  t:'SOMM.'},
  {k:'nasse', t:'NASSE'},
  {k:'arrest',t:'INTERP.'},
  {k:'gaz',   t:'GAZ'},
  {k:'eau',   t:'EAU'}
];
var ORDRES_MANIF=[
  {k:'pousser', t:'POUSSE'},
  {k:'arriere', t:'RECULE'},
  {k:'casser',  t:'CASSE'},
  {k:'barricade',t:'BARRIC.'},
  {k:'molotov', t:'MOLOT.'},
  {k:'groupe',  t:'GROUPE'},
  {k:'feinte',  t:'FEINTE'},
  {k:'disperser',t:'DISPER.'}
];
var ORDRES=ORDRES_CRS;
function barreMaj(s,L,H){
  ORDRES=(s.camp==='manif')?ORDRES_MANIF:ORDRES_CRS;
  var E=(typeof ECH==='number'&&ECH>0)?ECH:2;
  /* CINQUANTE POINTS D'ECRAN. Quarante-deux suffisaient pour un mot ;
     un pictogramme avec son libelle dessous en demande un peu plus. On
     reste gagnant : deux rangees de cinquante valent mieux que trois de
     quarante-deux, et le doigt a une cible plus grande. */
  var hr=Math.max(15,Math.round(50/E));
  if(s.M&&s.M.fin){
    /* fini : une seule chose a faire, et elle prend toute la largeur */
    s.hbar=hr+4; s.jetonHaut=undefined;
    s.barre=[{x:L*0.18,y:H-hr-2,w:L*0.64,h:hr,k:'rejouer',t:'REJOUER'}];
    return;
  }
  var B=[], i;
  /* ===================================================================
     UNE SEULE RANGEE D'ORDRES, ET DES JETONS RONDS QUI FLOTTENT

     Les unites ne sont plus une rangee de plus : ce sont des pastilles
     rondes posees PAR-DESSUS la scene, au-dessus de la barre. Elles ne
     comptent donc pas dans s.hbar, et la rue regagne toute leur
     hauteur. Les ordres, eux, prennent la largeur entiere en gros
     pictogrammes : c'est ce qu'on touche le plus souvent, autant que ce
     soit la plus grosse cible.
     =================================================================== */
  var ho=Math.max(18,Math.round(60/E));       /* la rangee d'ordres */
  s.hbar=ho;
  var y1=H-ho;
  var uo=L/ORDRES.length, x3=0;
  for(i=0;i<ORDRES.length;i++){
    B.push({x:x3,y:y1,w:uo-2,h:ho-3,k:ORDRES[i].k,t:ORDRES[i].t});
    x3+=uo;
  }
  /* LES JETONS. Leur rayon se DEDUIT de la place, jamais l'inverse :
     sur un ecran etroit ils retrecissent au lieu de se chevaucher. */
  var nU=s.unites.length, lTout=Math.round(34/E);
  var dispoL=L-10-lTout-6;
  var r=Math.min(Math.round(23/E), Math.floor((dispoL/nU-2)/2));
  r=Math.max(Math.round(14/E), r);
  var pas=r*2+2, tot=nU*pas+lTout+6;
  var x0=Math.max(5,(L-tot)/2), yy=y1-r-Math.round(12/E);
  for(i=0;i<nU;i++){
    B.push({rond:true, cx:x0+r+i*pas, cy:yy, r:r,
            x:x0+i*pas, y:yy-r, w:r*2, h:r*2, k:'u'+i});
  }
  B.push({x:x0+nU*pas+6, y:yy-r, w:lTout, h:r*2, k:'tout'});
  s.jetonHaut=yy-r-2;
  s.barre=B;
}
/* CE QU'ON PEUT FAIRE MAINTENANT, avec ce qui est selectionne. Sert a
   griser le bouton : un ordre qu'on ne peut pas donner doit se voir
   avant qu'on le touche. */
function dispo(s,k){
  if(!s.unites)return true;
  var L=selection(s);
  if(!L.length)return false;
  if((COUT[k]||0)>s.res)return false;    /* pas les moyens */
  if(k==='gaz')return L.some(function(U){return !U.camions;});
  if(k==='eau')return L.some(function(U){return !!U.camions;});
  if(k==='forme')return L.some(function(U){return !!U.form;});
  if(k==='groupe')return L.length>1||L.some(function(U){return !!U.libre;});
  if(k==='barricade')return s.camp==='manif';
  if(k==='somm')return s.somm<=0;
  if(k==='nasse'||k==='arrest')return L.some(function(U){return !U.camions;});
  return true;
}
/* =====================================================================
   L'ECRAN DE PREPARATION

   Il reutilise ce qui existe : les jetons d'unite, le liseré de jauge,
   les arrondis. Ce qui s'ajoute, c'est un bandeau de chrono en haut, le
   rayon d'equipement en bas, et le bouton PRET.
   ===================================================================== */
function prepMaj(s,L,H){
  var E=(typeof ECH==='number'&&ECH>0)?ECH:2;
  var hr=Math.max(15,Math.round(50/E));
  var hp=Math.round(96/E);           /* le rayon d'equipement */
  var hb=Math.round(26/E);           /* le bouton PRET */
  s.hbar=hp+hb;
  var py=H-s.hbar, B=[], i;
  var L2=prepArticles(s), aw=(L-10)/L2.length;
  for(i=0;i<L2.length;i++){
    B.push({x:5+i*aw+1, y:py+Math.round(16/E), w:aw-3, h:hp-Math.round(26/E),
            k:'art'+i, t:L2[i].n});
  }
  B.push({x:L*0.3, y:H-hb-2, w:L*0.4, h:hb, k:'pret', t:'PRÊT'});
  /* LES JETONS, comme en jeu : c'est avec eux qu'on choisit qui on
     place, et il n'y a aucune raison d'inventer un autre geste. */
  var nU=s.unites.length, lTout=Math.round(34/E);
  var dispoL=L-10-lTout-6;
  var r=Math.min(Math.round(23/E), Math.floor((dispoL/nU-2)/2));
  r=Math.max(Math.round(14/E), r);
  var pas=r*2+2, tot=nU*pas+lTout+6;
  var x0=Math.max(5,(L-tot)/2), yy=py-r-Math.round(12/E);
  for(i=0;i<nU;i++)
    B.push({rond:true, cx:x0+r+i*pas, cy:yy, r:r,
            x:x0+i*pas, y:yy-r, w:r*2, h:r*2, k:'u'+i});
  s.jetonHaut=yy-r-2;
  s.barre=B;
}
function prepTape(s,x,y){
  if(SON&&!SON.ok){try{SON.demarrer();}catch(e){}}
  prepMaj(s,s.L,s.H);
  var b=barreTouche(s,x,y);
  if(b){
    if(b.k==='pret'){prepLancer(s);return;}
    if(b.k.charAt(0)==='u'&&b.k!=='tout'){
      var ui=+b.k.slice(1);
      s.selN={}; s.selN[ui]=true; s.sel=ui;
      var UC=s.unites[ui], fo=[UC.ax,UC.ay];
      foyerUnite(s,UC,fo);
      s.camVise=[mx(fo[0],fo[1]), my(fo[0],fo[1])];
      s.camLibre=true; s.camLibreT=6000;
      s.mot=UC.nom+' · OÙ ?';s.motT=1400;
      return;
    }
    if(b.k.slice(0,3)==='art'){
      var A=prepArticles(s)[+b.k.slice(3)];
      if(!A)return;
      if(s.prep.achats[A.k]){
        delete s.prep.achats[A.k];
        s.mot=A.n+' · REPOSÉ';s.motT=1200;
      }else if(prepReste(s)>=A.p){
        s.prep.achats[A.k]=true;
        s.mot=A.n+' · PRIS';s.motT=1200;
        if(SON)SON.effet('clic');
      }else{
        s.mot='PAS ASSEZ DE BUDGET';s.motT=1400;
      }
      return;
    }
    return;
  }
  /* la carte : on y pose l'unite choisie */
  var z=s.cam.z;
  var ex=(x-s.L/2)/z+s.cam.x, ey=(y-s.H/2)/z+s.cam.y;
  var gx=Math.floor(e2mx(ex,ey)), gy=Math.floor(e2my(ex,ey));
  if(gx<0||gy<0||gx>=GW||gy>=GH){s.mot='HORS DE LA CARTE';s.motT=1100;return;}
  prepPoser(s,gx,gy);
}
function prepDessine(s,L,H){
  var g=G, i;
  prepMaj(s,L,H);
  /* ---- le bandeau du chrono ---- */
  var hh=Math.round(30/((typeof ECH==='number'&&ECH>0)?ECH:2));
  g.fillStyle='rgba(6,10,18,.88)';g.fillRect(0,0,L,hh);
  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#ffd24a';g.font='bold 11px ui-monospace,monospace';
  var se=Math.max(0,Math.ceil(s.prep.t/1000));
  g.fillText('PRÉPARATION · 0:'+(se<10?'0':'')+se, L/2, hh*0.40);
  g.font='bold 6px ui-monospace,monospace';g.fillStyle='#cfe4f2';
  g.fillText(s.camp==='manif'?'Placez vos blocs · le cordon vous attend'
                             :'Placez vos lignes · le cortège arrive', L/2, hh*0.78);
  g.fillStyle='rgba(255,210,74,.22)';g.fillRect(0,hh-1,L,1.5);
  g.fillStyle='#ffd24a';g.fillRect(0,hh-1,L*(s.prep.t/PREP_DUREE),1.5);
  /* ---- les jetons et le rayon ---- */
  g.fillStyle='rgba(6,10,18,.90)';g.fillRect(0,H-s.hbar,L,s.hbar);
  g.fillStyle='rgba(120,200,240,.25)';g.fillRect(0,H-s.hbar,L,1);
  if(s.jetonHaut!==undefined){
    var j0=null,j1=null,jh=0;
    for(i=0;i<s.barre.length;i++){
      var bj=s.barre[i]; if(!bj.rond)continue;
      if(j0===null||bj.x<j0)j0=bj.x;
      if(j1===null||bj.x+bj.w>j1)j1=bj.x+bj.w;
      jh=bj.r*2;
    }
    if(j0!==null){g.fillStyle='rgba(6,10,18,.62)';
      coArr(g,j0-6,s.jetonHaut-2,(j1-j0)+12,jh+8,(jh+8)/2);g.fill();}
  }
  var py=H-s.hbar, L2=prepArticles(s), reste=prepReste(s);
  g.textAlign='left';
  g.fillStyle='#ffd24a';g.font='bold 7px ui-monospace,monospace';
  g.fillText('ÉQUIPEMENT',5,py+7);
  g.textAlign='right';
  g.fillStyle=(reste>0)?'#cfe4f2':'rgba(207,228,242,.45)';
  g.fillText('BUDGET '+reste,L-5,py+7);
  g.textAlign='center';
  for(i=0;i<s.barre.length;i++){
    var b=s.barre[i];
    if(b.rond){
      var ui=+b.k.slice(1), U=s.unites[ui], on=!!s.selN[ui];
      var c=UCOL[ui%UCOL.length];
      g.beginPath();g.arc(b.cx,b.cy,b.r,0,6.2832);
      g.fillStyle=on?c:'rgba(255,255,255,.13)';g.fill();
      if(on){g.strokeStyle='#fff';g.lineWidth=1.4;g.stroke();}
      g.fillStyle=on?'#06101c':c;
      g.font='bold 7px ui-monospace,monospace';
      g.fillText(U.court.slice(0,5),b.cx,b.cy-3);
      g.font='6px ui-monospace,monospace';
      g.fillText(U.membres.length+'H',b.cx,b.cy+5);
      continue;
    }
    if(b.k==='pret'){
      g.fillStyle='#ffd24a';coArr(g,b.x,b.y,b.w,b.h,b.h/2);g.fill();
      g.fillStyle='#4a2c00';g.font='bold 10px ui-monospace,monospace';
      g.fillText(b.t,b.x+b.w/2,b.y+b.h/2);
      continue;
    }
    var A=L2[+b.k.slice(3)], pris=!!s.prep.achats[A.k];
    var cher=(!pris&&reste<A.p);
    g.fillStyle=pris?'rgba(106,216,255,.22)':'rgba(255,255,255,.07)';
    coArr(g,b.x,b.y,b.w,b.h,5);g.fill();
    g.strokeStyle=pris?'#6ad8ff':'rgba(255,255,255,.14)';g.lineWidth=1;
    coArr(g,b.x,b.y,b.w,b.h,5);g.stroke();
    g.globalAlpha=cher?0.4:1;
    g.fillStyle=pris?'#fff':'#cfe4f2';g.font='bold 6px ui-monospace,monospace';
    g.fillText(A.n,b.x+b.w/2,b.y+10);
    g.fillStyle='rgba(207,228,242,.62)';
    var td=5.5;
    g.font=td+'px ui-monospace,monospace';
    while(td>4&&g.measureText(A.d).width>b.w-3){
      td-=0.5;g.font=td+'px ui-monospace,monospace';
    }
    g.fillText(A.d,b.x+b.w/2,b.y+19);
    g.fillStyle='#6ad8ff';g.font='bold 9px ui-monospace,monospace';
    g.fillText(A.p,b.x+b.w/2,b.y+32);
    if(pris){g.fillStyle='#6ad8ff';g.font='bold 5.5px ui-monospace,monospace';
      g.fillText('PRIS',b.x+b.w/2,b.y+42);}
    g.globalAlpha=1;
  }
  /* PAS DE LIGNE DE PIED. Elle disait « ce qu'on garde devient de
     l'elan » et passait derriere les cartes : l'ecran n'a pas la place,
     et le briefing le dit deja. */
  g.textAlign='left';g.textBaseline='alphabetic';
}
function barreDessine(s,L,H){
  var g=G, i, b;
  g.fillStyle='rgba(6,10,18,.84)';g.fillRect(0,H-s.hbar,L,s.hbar);
  /* LA JAUGE EST LE LISERE DE LA BARRE. Pas un cadran de plus a
     regarder : la ligne qui separe la rue des boutons se remplit, on
     la voit sans quitter l'action des yeux. */
  g.fillStyle='rgba(120,200,240,.18)';g.fillRect(0,H-s.hbar,L,2);
  var fr=Math.max(0,Math.min(1,(s.res||0)/RES_MAX));
  g.fillStyle=(s.camp==='manif')?'#ff8a5a':'#6ad8ff';
  g.fillRect(0,H-s.hbar,L*fr,2);
  /* LE SOCLE DES JETONS : une barrette sombre arrondie, juste assez
     large pour eux. Sans elle, des ronds poses sur la foule ne se
     detachent pas. */
  if(s.jetonHaut!==undefined){
    var j0=null, j1=null;
    for(i=0;i<s.barre.length;i++){
      var bj=s.barre[i];
      if(bj.k!=='tout'&&bj.k.charAt(0)!=='u')continue;
      if(j0===null||bj.x<j0)j0=bj.x;
      if(j1===null||bj.x+bj.w>j1)j1=bj.x+bj.w;
    }
    if(j0!==null){
      var hJ=s.barre[0]?0:0;
      var bb=s.barre.find?null:null;
      var jh=0;
      for(i=0;i<s.barre.length;i++)if(s.barre[i].rond){jh=s.barre[i].r*2;break;}
      g.fillStyle='rgba(6,10,18,.62)';
      coArr(g,j0-6,s.jetonHaut-2,(j1-j0)+12,jh+8,(jh+8)/2);g.fill();
    }
  }
  g.textBaseline='middle';
  for(i=0;i<s.barre.length;i++){
    b=s.barre[i];
    var cy=b.y+b.h/2;
    if(b.k.charAt(0)==='u'&&b.k!=='tout'){
      var ui=+b.k.slice(1), U=s.unites[ui], on=!!s.selN[ui];
      var c=UCOL[ui%UCOL.length];
      var jx=b.cx, jy=b.cy, jr=b.r;
      g.beginPath();g.arc(jx,jy,jr,0,6.2832);
      g.fillStyle=on?c:'rgba(255,255,255,.13)';g.fill();
      /* L'AVANCEMENT DE L'ORDRE fait le tour du jeton : un arc se lit
         sur un rond, une barre de progression non. */
      if(U.route&&U.nRoute){
        g.beginPath();
        g.arc(jx,jy,jr-1.5,-1.5708,-1.5708+6.2832*(U.ri/U.nRoute));
        g.strokeStyle=on?'rgba(6,16,28,.65)':'rgba(255,255,255,.55)';
        g.lineWidth=2.2;g.stroke();
      }
      if(on){g.beginPath();g.arc(jx,jy,jr,0,6.2832);
             g.strokeStyle='#fff';g.lineWidth=1.4;g.stroke();}
      g.fillStyle=on?'#06101c':c;
      g.font='bold 7px ui-monospace,monospace';g.textAlign='center';
      g.fillText(U.court.slice(0,5),jx,jy-3);
      g.font='6px ui-monospace,monospace';
      g.fillText(U.membres.length+'H',jx,jy+5);
      continue;
    }
    if(b.k==='tout'){
      var all=(Object.keys(s.selN).filter(function(k){return s.selN[k];}).length===s.unites.length);
      g.fillStyle=all?'#dfe8f0':'rgba(255,255,255,.13)';
      coArr(g,b.x,b.y,b.w,b.h,b.h/2);g.fill();
      g.fillStyle=all?'#06101c':'#cfe4f2';
      g.font='bold 6px ui-monospace,monospace';g.textAlign='center';
      g.fillText('TOUTES',b.x+b.w/2,cy);
      continue;
    }
    {
      if(b.k==='rejouer'){
        g.fillStyle='#ffd24a';coArr(g,b.x,b.y,b.w,b.h,4);g.fill();
        g.fillStyle='#4a2c00';g.font='bold 10px ui-monospace,monospace';
        g.textAlign='center';g.fillText(b.t,b.x+b.w/2,b.y+b.h/2);
        continue;
      }
      var act=(b.k==='diag'&&s.diag)||(s.vise===b.k);
      /* UN ORDRE INDISPONIBLE SE VOIT. Lancer des cocktails en recharge
         ou demander de l'eau a des hommes a pied : autant le dire avant
         le doigt, pas apres. */
      var gris=!dispo(s,b.k);
      g.fillStyle=act?'#7ae8ff':(gris?'rgba(255,255,255,.04)':'rgba(255,255,255,.10)');
      coArr(g,b.x+1,b.y+1,b.w,b.h-2,3);g.fill();
      if(s.presse1===b.k){g.fillStyle='rgba(255,255,255,.3)';coArr(g,b.x+1,b.y+1,b.w,b.h-2,3);g.fill();}
      var IC=icones()[b.k], cxb=b.x+1+b.w/2;
      g.globalAlpha=gris?0.30:1;
      if(IC){
        /* le pictogramme en haut, le libelle dessous : on lit l'un de
           loin et l'autre quand on hesite */
        var ih=Math.min(22,b.h-10);
        if(act){
          /* sur fond clair, l'icone blanche disparait : on la retourne */
          g.save();g.globalCompositeOperation='difference';
          g.drawImage(IC,(cxb-ih/2)|0,(b.y+2)|0,ih|0,ih|0);g.restore();
        }else{
          g.drawImage(IC,(cxb-ih/2)|0,(b.y+2)|0,ih|0,ih|0);
        }
        g.fillStyle=act?'#06101c':'#cfe4f2';
        /* LE LIBELLE NE DEBORDE PLUS DE SON BOUTON. Neuf ordres sur un
           telephone, ce sont des boutons de vingt et un points : AVANT,
           ARRIERE et FORME se touchaient et se lisaient
           « AVANTARRIEREFORME ». On mesure, et on retrecit la police
           jusqu'a ce que ca rentre — jamais au-dela de quatre points et
           demi, en-dessous ce n'est plus du texte. */
        var dispoT=b.w-4, tp=6;
        g.font='bold 6px ui-monospace,monospace';
        while(tp>4.5&&g.measureText(b.t).width>dispoT){
          tp-=0.5; g.font='bold '+tp+'px ui-monospace,monospace';
        }
        g.textAlign='center';
        g.fillText(b.t,cxb,b.y+b.h-5);
        /* LE PRIX, en haut a droite du bouton. Sans lui on apprend le
           cout en appuyant, c'est-a-dire en le payant. */
        var pr=COUT[b.k]||0;
        if(pr){
          g.font='bold 6px ui-monospace,monospace';g.textAlign='right';
          g.fillStyle=(s.res>=pr)?'rgba(255,216,106,.9)':'rgba(255,120,90,.9)';
          g.fillText(pr,b.x+b.w-2,b.y+6);
        }
      }else{
        g.fillStyle=act?'#06101c':'#cfe4f2';
        g.font='bold 7px ui-monospace,monospace';g.textAlign='center';
        g.fillText(b.t,cxb,cy);
      }
      g.globalAlpha=1;
    }
  }
  g.textAlign='left';g.textBaseline='alphabetic';
}
function coArr(g,x,y,w,h,r){
  g.beginPath();
  g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);
  g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);
  g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();
}
function barreTouche(s,x,y){
  for(var i=0;i<s.barre.length;i++){
    var b=s.barre[i];
    if(b.rond){
      /* UN JETON SE TOUCHE EN ROND, avec trois points de marge : un
         carre autour d'un rond vole les taps de ses voisins. */
      var dx=x-b.cx, dy=y-b.cy, rr=b.r+3;
      if(dx*dx+dy*dy<=rr*rr)return b;
      continue;
    }
    if(x>=b.x&&x<=b.x+b.w+2&&y>=b.y-2&&y<=b.y+b.h+2)return b;
  }
  return null;
}

function dessineObjet(g,o,s){
  var S=OBJ[o.t]||VEH[o.t]; if(!S)return;
  var p=m2e(o.gx,o.gy);
  g.drawImage(S.cv, Math.round(p.x-S.ox), Math.round(p.y-S.oy));
}

var CO_REC2=0;
var M={
  nom:'Le Cordon', sous:'LA RUE · GLISSE, PINCE, MARCHE',
  manches:null, vise:400, pausable:true,
  init:function(){
    return {phase:'pret', t:0, score:0, L:200, H:400,
            cam:{x:MW/2, y:MH/2, z:0.75, zmin:0.75, zmax:2},
            heure:'jour', graine:0, pret:false,
            C:null, bats:[], objs:[], statiques:[], sol:null, j:null,
            mot:'', motT:0, sim:null, unites:null, corteges:null,
            sel:0, selN:{0:true}, front:0, pression:0, tension:0, vus:[],
            barre:[], hbar:0,
            diag:false, flash:null, M:null, poussee:0, finEnvoyee:false, enPause:false,
            camp:'crs', tous:[], ia:null, barricades:[], res:RES_DEP,
            fondu:0,
            casseurs:null, vitrines:[],
            /* LA DENSITE, mesuree : 190 corps a 58 images, 354 a 56,
               504 a 55, 654 a 54. Le cout est lineaire — la grille de
               voisinage tient ses promesses — et c'est le dessin, pas
               la simulation, qui pese. Deux, c'est une avenue pleine
               sans rien sacrifier. */
            densite:1.6};
  },
  cadre:function(s,L,H){s.L=L;s.H=H;if(s.pret){camBornes(s);barreMaj(s,L,H);}},
  demarrer:function(s){
    /* LE CAMP VIENT DU MENU. La borne ne le choisit pas : elle le lit. */
    s.camp=(window.CO_CAMP==='manif')?'manif':'crs';
    /* LA CARTE EST TIREE A CHAQUE PARTIE. Un jeton, une carte : on ne
       choisit pas son terrain, on fait avec. C'est ce qui empeche
       d'apprendre une seule place par coeur. */
    var CL=Object.keys(TERRAINS);
    s.terrain=CL[(Math.random()*CL.length)|0];
    poserTerrain(s.terrain);
    /* LA BANDEROLE DU JOUEUR, choisie au menu. On repeint l'atlas une
       fois, avant la partie : ensuite le rendu ne sait rien du texte. */
    if(ACTEURS&&ACTEURS.ecrire){
      try{ACTEURS.ecrire(window.CO_SLOGAN||'', window.CO_TISSU||'');}catch(e){}
    }
    s.graine=(Math.random()*2000000)|0;
    s.barricades=[];
    s.ia=window.CORDON_IA?window.CORDON_IA.creer(s.camp==='manif'?'crs':'manif'):null;
    s.heure=['jour','jour','soir','nuit'][(Math.random()*4)|0];
    preparer(s);
    /* LA MISSION, calculee a part : elle ne fait que LIRE la rue. */
    MISSION=window.CORDON_MISSION;
    SON=window.CORDON_SON||null;
    IA=window.CORDON_IA||null;
    FUM=window.CORDON_FUMEE||null;
    s.fum=FUM?FUM.creer():null;
    /* LA LIMITE EST A DEUX TUILES DE LA PREFECTURE, pas a cinq du
       cordon : trop pres, quelques corps ejectes d'une bousculade
       suffisaient a faire perdre la mission en vingt secondes. */
    /* LA LIGNE A FRANCHIR EST JUSTE DERRIERE LE TROISIEME RANG, pas six
       tuiles plus loin. A GW-8 il fallait percer les trois rangs PUIS
       traverser une esplanade vide : le compteur restait a zero cent
       secondes durant, puis la moitie du cortege passait d'un coup.
       Mesure : le dernier rang tient a 36,6 ; la ligne est a 37. */
    s.M=MISSION?MISSION.creer({graine:s.graine, ligne:TER.ligne,
                               tolere:TER.tolere, objectif:TER.objectif,
                               camp:s.camp, vitrines:s.vitrines}):null;
    s.mot='';s.motT=0;s.feuxVus=0;s.vise=null;s.viseXY=null;s.camVise=null;
    s.res=RES_DEP; s.resIA=RES_DEP; s.embT=0; s.embRech=0; s.somm=0;
    s.prep={t:PREP_DUREE, achats:{}};
    faireZones(s);
    s.fondu=700;        /* la rue s'ouvre depuis le noir */
  },
  pas:function(s,dt){
    if(!s.pret)return;
    /* =================================================================
       L'ALLURE DU JEU, EN UN SEUL POINT

       « C'est trop rapide » : les parties se jouaient en quarante
       secondes et on n'avait pas le temps de lire ce qui se passait.
       On pourrait ralentir les vitesses et allonger la duree — mais
       chaque reglage ainsi touche demande de recalibrer tous les
       seuils, et on l'a deja fait trop de fois.
       Ici on ralentit le TEMPS lui-meme : la simulation, la mission,
       les recharges et le chrono recoivent le meme dt reduit. Rien ne
       change dans les rapports entre les choses, tout prend un tiers de
       temps en plus. Deux minutes trente de jeu font trois minutes
       trente a la montre, et on voit enfin les mouvements.
       ================================================================= */
    dt*=ALLURE;
    /* PENDANT LA PREPA, LA RUE VIT MAIS NE JOUE PAS. Au sixieme de
       l'allure, les corps respirent et le cortege se tasse — on voit
       que c'est vivant — mais rien n'avance : ni le front, ni la
       mission, ni le chrono. */
    if(s.prep){
      s.prep.t-=dt;
      s.t+=dt;
      if(s.motT>0)s.motT-=dt;
      if(s.sim)FOULE.pas(s.sim,dt*0.16);
      camSuivi(s,dt);
      if(s.prep.t<=0)prepLancer(s);
      return;
    }
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(!s.sim)return;
    if(s.M&&s.M.fin)return;           /* la rue se fige quand c'est fini */
    if(s.poussee>0)s.poussee-=dt;
    majCortege(s,dt);
    majEmballe(s,dt);
    majZones(s,dt);
    majLignes(s,dt);
    majUnites(s,dt);
    FOULE.pas(s.sim,dt);
    if(FUM&&s.fum)FUM.pas(s.fum,dt,s.sim);
    /* L'ELAN REMONTE, lentement et sans a-coups. Trente-quatre points
       pour un coup fort a 4,2 points la seconde : huit secondes entre
       deux. C'est le tempo du jeu. */
    s.res=Math.min(RES_MAX, s.res+RES_GAIN*dt);
    s.resIA=Math.min(RES_MAX, (s.resIA||0)+RES_GAIN*dt);
    for(var fu=0;fu<s.tous.length;fu++)
      if(s.tous[fu].feinte>0)s.tous[fu].feinte-=dt;
    if(s.somm>0)s.somm-=dt;
    /* LE BLOC DECAPITE SE REMET, tout seul, au bout de vingt secondes :
       une interpellation desorganise, elle ne supprime pas. */
    for(var dc=0;dc<s.corteges.length;dc++){
      var GD=s.corteges[dc];
      if(!(GD.decapite>0))continue;
      GD.decapite-=dt;
      if(GD.decapite<=0&&GD.cohAv!==undefined){GD.cohesion=GD.cohAv;GD.cohAv=undefined;}
    }
    majBarricades(s,dt);
    majBarricadesFeu(s,dt);
    /* UN FEU QUI BRULE TEND LA RUE, meme loin : tout le monde le voit.
       C'est la contrepartie des molotovs, et elle est automatique. */
    if(FUM&&s.fum&&s.M&&MISSION&&s.fum.nes>(s.feuxVus||0)){
      while((s.feuxVus||0)<s.fum.nes){
        s.feuxVus=(s.feuxVus||0)+1; MISSION.noter(s.M,'feu');
        if(SON)SON.effet('verre');   /* la bouteille se brise a l'impact */
      }
    }
    if(FUM&&s.fum&&s.fum.feux.length&&s.sim){
      s.sim.tension=Math.min(1,s.sim.tension+dt*0.0000085*s.fum.feux.length);
    }
    /* L'IA TIENT LE CAMP QU'ON NE JOUE PAS, et elle passe par les memes
       commandes que le doigt. */
    if(IA&&s.ia){
      if(s.camp==='manif')IA.pasCRS(s.ia,s,dt,iaApi(s));
      else IA.pasManif(s.ia,s,dt,iaApi(s));
    }
    camSuivi(s,dt);
    if(s.M&&MISSION){
      MISSION.pas(s.M,s,dt,missionApi(s));
      if(s.M.fin)finMission(s);
    }
    /* LA RUMEUR SUIT LA RUE, quatre fois par seconde et pas soixante :
       une rampe d'un quart de seconde s'entend mieux qu'un saut par
       image, et coute quinze fois moins. Son volume vient du nombre de
       corps au contact, sa couleur de la tension : c'est un indicateur
       de plus, pas une boucle qui tourne dans le vide. */
    s.tSon=(s.tSon||0)+dt;
    if(SON&&s.tSon>250){
      s.tSon=0;
      SON.rumeur(s.sim.pression*1.6+s.sim.agents.length*0.12, s.sim.tension);
      if(s.sim.paniques>0&&!s.siffle){s.siffle=1;SON.effet('sifflet');}
      if(s.sim.paniques===0)s.siffle=0;
    }
  },
  /* ------------------------------------------------- le rendu ------- */
  dessine:function(s,L,H){
    s.L=L;s.H=H;
    var g=G;
    /* UN CHRONOMETRE PAR SECTION, allume a la demande (s.prof). Deviner
       ou passe le temps d'une image coute plus cher que de le mesurer :
       j'ai optimise deux fois dans le vide avant de poser ces jalons. */
    var PR=s.prof, T0=PR?performance.now():0, TT=T0;
    function jalon(k){if(!PR)return;var n=performance.now();PR[k]=(PR[k]||0)+(n-TT);TT=n;}
    if(!s.cielG||s.cielH!==H){
      s.cielG=g.createLinearGradient(0,0,0,H);
      var c=s.nuit?['#0a1020','#141c30']:(s.heure==='soir'?['#3a2838','#6a4a3a']:['#4a6e92','#8aa8c0']);
      s.cielG.addColorStop(0,c[0]);s.cielG.addColorStop(1,c[1]);s.cielH=H;
    }
    g.fillStyle=s.cielG;g.fillRect(0,0,L,H);
    jalon('ciel');
    fondLointain(s,L,H);
    jalon('fond');
    if(!s.pret)return;
    var z=s.cam.z;
    g.save();
    g.translate(Math.round(L/2),Math.round(H/2));
    g.scale(z,z);
    g.translate(-Math.round(s.cam.x),-Math.round(s.cam.y));
    /* LE SOL : on ne recopie que le morceau visible. Recopier le calque
       entier marchait, mais a 1,2 million de points par image le
       telephone chauffait pour des pixels hors de l'ecran. */
    var vl=L/z, vh=H/z;
    var sx=Math.max(0,Math.floor(s.cam.x-vl/2-2)), sy=Math.max(0,Math.floor(s.cam.y-vh/2-2));
    var sw=Math.min(s.sol.width-sx,Math.ceil(vl+4)), sh=Math.min(s.sol.height-sy,Math.ceil(vh+4));
    if(sw>0&&sh>0)g.drawImage(s.sol,sx,sy,sw,sh,sx,sy,sw,sh);
    /* les halos de feu AVANT les corps : une flamme eclaire le sol
       autour d'elle, elle ne se pose pas devant les gens */
    if(FUM&&s.fum)FUM.dessineSol(s.fum,g,mx,my,x0,x1,y0,y1,s.nuit);
    /* LES ZONES, peintes au SOL et sous les corps : ce sont des
       marques de terrain, pas des panneaux. Un anneau pointille de la
       couleur du camp qui la tient, gris tant qu'elle n'est a
       personne, et le nom au centre. */
    if(s.zones){
      var a0z=g.globalAlpha;
      g.setLineDash(DASH); g.lineDashOffset=-(s.t*0.008)%12;
      for(var zi=0;zi<s.zones.length;zi++){
        var Z=s.zones[zi];
        var zx=mx(Z.x,Z.y), zy=my(Z.x,Z.y)+TH/2;
        if(zx<x0-140||zx>x1+140||zy<y0-120||zy>y1+120)continue;
        var zc=Z.a?((Z.a==='manif')?'#ff8a5a':'#6ad8ff'):'rgba(210,225,235,.55)';
        g.beginPath();
        g.ellipse(zx,zy,Z.r*TW/2,Z.r*TH/2,0,0,6.2832);
        g.globalAlpha=a0z*0.85; g.lineWidth=2.6;
        g.strokeStyle='rgba(4,8,14,.6)'; g.stroke();
        g.lineWidth=1.2; g.strokeStyle=zc; g.stroke();
        g.globalAlpha=a0z*(Z.a?0.16:0.08);
        g.fillStyle=zc; g.fill();
        g.globalAlpha=a0z*0.8;
        g.setLineDash(VIDE);
        g.font='bold 6px ui-monospace,monospace'; g.textAlign='center';
        g.fillStyle='rgba(4,8,14,.75)';
        g.fillText(Z.n,zx+1,zy+1);
        g.fillStyle=zc; g.fillText(Z.n,zx,zy);
        g.setLineDash(DASH);
      }
      g.setLineDash(VIDE); g.globalAlpha=a0z; g.lineWidth=1;
      g.textAlign='left';
    }
    jalon('sol');
    /* LES UNITES CHOISIES, marquees AU SOL : sous les volumes, donc
       cachees comme elles quand un immeuble passe devant. Posees apres
       le decor, ces marques se voyaient sur les toits.
       Chaque unite a SA couleur, la meme que sa pastille : c'est le seul
       moyen de savoir laquelle on vient d'envoyer quand on en commande
       trois en meme temps. */
    g.lineWidth=1;
    for(var su=0;su<s.unites.length;su++){
      if(!s.selN[su])continue;
      var U0=s.unites[su], uc=UCOL[su%UCOL.length];
      var AP=anneau(uc,false);
      for(var mu=0;mu<U0.membres.length;mu++){
        var am=s.sim.agents[U0.membres[mu]];
        g.drawImage(AP.cv,(mx(am.x,am.y)-AP.ox)|0,(my(am.x,am.y)-AP.oy)|0);
      }
      /* le chemin qui reste a parcourir. Un point sur deux suffit a le
         lire, et il est borne : trace integralement pour quatre unites,
         c'etait quatre-vingts segments par image. */
      if(U0.route&&U0.ri<U0.route.length){
        g.strokeStyle=uc;g.globalAlpha=0.5;
        g.beginPath();
        var fin=Math.min(U0.route.length,U0.ri+40);
        for(var q=U0.ri;q<fin;q+=2){
          var rq=U0.route[q];
          if(q===U0.ri)g.moveTo(mx(rq[0],rq[1]),my(rq[0],rq[1])+TH/2);
          else g.lineTo(mx(rq[0],rq[1]),my(rq[0],rq[1])+TH/2);
        }
        g.stroke();g.globalAlpha=1;
      }
      if(U0.but){
        var AB=anneau(uc,true);
        g.drawImage(AB.cv,(mx(U0.but[0]+0.5,U0.but[1]+0.5)-AB.ox)|0,
                          (my(U0.but[0]+0.5,U0.but[1]+0.5)+TH/2-AB.oy)|0);
      }
      /* l'anneau de ralliement : ou la figure se range */
      var AG=anneau(uc,true);
      g.drawImage(AG.cv,(mx(U0.ax,U0.ay)-AG.ox)|0,(my(U0.ax,U0.ay)+TH/2-AG.oy)|0);
      /* LA PORTEE, pendant la visee. Un cercle pointille au sol, en
         projection isometrique — donc une ellipse deux fois plus large
         que haute. Sans lui on vise a l'aveugle et on apprend la
         portee en ratant, ce qui n'est pas une facon d'apprendre. */
      if(s.vise){
        var fo=[U0.ax,U0.ay];
        foyerUnite(s,U0,fo);
        var pr=portee(s.vise), pcx=mx(fo[0],fo[1]), pcy=my(fo[0],fo[1])+TH/2;
        /* LE CERCLE DE PORTEE, en deux traits. Un seul trait fin se
           perdait dans la foule : on pose d'abord un liseré sombre,
           puis la couleur de l'unite par-dessus. */
        g.setLineDash(DASH); g.lineDashOffset=-(s.t*0.012)%12;
        g.beginPath();
        g.ellipse(pcx,pcy,pr*TW/2,pr*TH/2,0,0,6.2832);
        g.lineWidth=2.4;g.strokeStyle='rgba(4,8,14,.75)';g.stroke();
        g.lineWidth=1.1;g.strokeStyle=uc;g.stroke();
        g.setLineDash(VIDE);
        /* LA LIGNE DE TIR ET LE POINT D'IMPACT, tant que le doigt est
           pose. C'est ca qui fait qu'on choisit vraiment sa direction :
           on la voit avant de lacher. */
        if(s.viseXY){
          var w=[0,0]; doigtMonde(s,s.viseXY[0],s.viseXY[1],w);
          var c2=[0,0], dedans=borner(fo[0],fo[1],w[0],w[1],pr,c2);
          if(s.vise==='molotov')c2[0]=Math.min(iaMur(s)-1.3,c2[0]);
          var ix=mx(c2[0],c2[1]), iy=my(c2[0],c2[1])+TH/2;
          g.lineWidth=2.4;g.strokeStyle='rgba(4,8,14,.7)';
          g.beginPath();g.moveTo(pcx,pcy);g.lineTo(ix,iy);g.stroke();
          g.lineWidth=1.1;g.strokeStyle=dedans?uc:'#ff8a5a';
          g.beginPath();g.moveTo(pcx,pcy);g.lineTo(ix,iy);g.stroke();
          /* le reticule : deux ellipses et une croix, lisibles sur
             n'importe quel sol */
          g.beginPath();g.ellipse(ix,iy,9,4.5,0,0,6.2832);
          g.lineWidth=2.4;g.strokeStyle='rgba(4,8,14,.7)';g.stroke();
          g.lineWidth=1.2;g.strokeStyle=dedans?uc:'#ff8a5a';g.stroke();
          g.beginPath();
          g.moveTo(ix-5,iy);g.lineTo(ix+5,iy);
          g.moveTo(ix,iy-3);g.lineTo(ix,iy+3);
          g.stroke();
        }
        g.lineWidth=1; g.globalAlpha=1;
      }
    }
    /* LES VOLUMES, du fond vers l'avant. Un objet dont le calque ne
       touche pas la fenetre n'est pas dessine du tout. */
    var x0=s.cam.x-vl/2, x1=s.cam.x+vl/2, y0=s.cam.y-vh/2, y1=s.cam.y+vh/2;
    /* LES ACTEURS VISIBLES, triés par profondeur, puis FUSIONNÉS avec le
       décor déjà trié. Un tri de trois cents corps par image coûte moins
       qu'un seul immeuble recopié pour rien, mais re-trier aussi le
       décor à chaque image serait du gâchis : il ne bouge pas. */
    var vus=s.vus; vus.length=0;
    var A=s.sim?s.sim.agents:[], na=A.length, k;
    for(k=0;k<na;k++){
      var ag=A[k], pax=mx(ag.x,ag.y), pay=my(ag.x,ag.y);
      if(pax<x0-30||pax>x1+30||pay<y0-60||pay>y1+30)continue;
      ag._px=pax; ag._py=pay; ag._p=ag.x+ag.y;
      vus.push(ag);
    }
    /* LES BARRICADES EN COURS, marquees au sol : on doit voir qu'il se
       passe quelque chose la, et combien de monde il y faut encore. */
    for(var bi2=0;bi2<s.barricades.length;bi2++){
      var BB=s.barricades[bi2]; if(BB.faite)continue;
      var pbx=mx(BB.x+0.5,BB.y+0.5), pby=my(BB.x+0.5,BB.y+0.5);
      if(pbx<x0-30||pbx>x1+30||pby<y0-30||pby>y1+30)continue;
      var av=Math.min(1,BB.t/6000);
      g.strokeStyle=(BB.pres>=4)?'rgba(255,210,74,.9)':'rgba(255,210,74,.35)';
      g.lineWidth=1;
      g.beginPath();g.ellipse(pbx,pby+TH/2,12,6,0,0,7);g.stroke();
      if(av>0){
        g.strokeStyle='#ffd24a';
        g.beginPath();g.ellipse(pbx,pby+TH/2,12,6,0,-1.57,-1.57+av*6.283);g.stroke();
      }
    }
    jalon('selection');
    vus.sort(function(p,q){return p._p-q._p;});
    jalon('tri');
    var vi=0, nv=vus.length;
    var i,e;
    /* =================================================================
       LES IMMEUBLES QUI CACHENT L'ACTION DEVIENNENT TRANSPARENTS

       En isometrie, un immeuble place au sud-est de la foule est DEVANT
       elle : il se dessine par-dessus, et il peut occuper les deux tiers
       de l'ecran pendant que la partie se joue derriere. On a beau
       pouvoir deplacer la camera, il n'y a aucun angle qui sauve la vue
       quand le batiment est entre la foule et l'oeil.

       La regle : un volume qui se dessine APRES des corps et dont le
       rectangle recouvre ces corps passe a trente pour cent. On ne le
       cache pas — il faut continuer a lire la ville — on le rend
       translucide, et la foule se voit au travers.

       Le test est fait sur les corps deja dessines (donc derriere), ce
       qui suffit : un batiment qui ne recouvre personne reste opaque,
       et c'est le cas de la plupart.
       ================================================================= */
    var dejaX0=1e9, dejaX1=-1e9, dejaY0=1e9, dejaY1=-1e9, dejaN=0;
    s.voiles=0;
    /* l'interrupteur de diagnostic, lu UNE FOIS par image et pas une
       fois par volume : une lecture sur window dans une boucle qui
       tourne cinquante fois par image est une lecture de trop */
    var voilerOk=!window.__noVoile;
    var a0b=g.globalAlpha;
    for(i=0;i<s.statiques.length;i++){
      e=s.statiques[i];
      while(vi<nv&&vus[vi]._p<=e.prof){
        var vv=vus[vi];
        ACTEURS.dessine(g,vv,vv._px,vv._py);
        if(vv._px<dejaX0)dejaX0=vv._px;
        if(vv._px>dejaX1)dejaX1=vv._px;
        if(vv._py<dejaY0)dejaY0=vv._py;
        if(vv._py>dejaY1)dejaY1=vv._py;
        dejaN++;
        vi++;
      }
      if(e.x>x1||e.x+e.w<x0||e.y>y1||e.y+e.h<y0)continue;
      /* un volume assez grand pour gener, et qui mord sur la zone des
         corps deja poses : on le laisse passer la lumiere */
      var voile=(voilerOk&&dejaN>6&&e.h>46&&
                 e.x<dejaX1&&e.x+e.w>dejaX0&&
                 e.y<dejaY1&&e.y+e.h>dejaY0-40);
      if(voile){g.globalAlpha=a0b*0.30;s.voiles=(s.voiles||0)+1;}
      g.drawImage(e.cv,e.x|0,e.y|0);
      if(voile)g.globalAlpha=a0b;
    }
    while(vi<nv){ACTEURS.dessine(g,vus[vi],vus[vi]._px,vus[vi]._py);vi++;}
    jalon('scene');
    /* L'ETIQUETTE D'UNE UNITE, au-dessus de son chef : son nom et ce
       qu'elle est en train de faire. C'est le retour qui dit qu'un ordre
       a bien ete pris, avant meme qu'on voie la ligne bouger. */
    for(var eu=0;eu<s.unites.length;eu++){
      var UE=s.unites[eu];
      var ch=s.sim.agents[UE.membres[0]], pe=m2e(ch.x,ch.y);
      if(pe.x<x0-40||pe.x>x1+40||pe.y<y0-40||pe.y>y1+40)continue;
      var sel=!!s.selN[eu], ce=UCOL[eu%UCOL.length];
      var ordre=UE.ordre?({vers:'VERS',avance:'AVANT',recule:'ARRIÈRE',tenir:'TENIR'}[UE.ordre]||UE.ordre.toUpperCase()):'';
      var txt=UE.court+(ordre?(' · '+ordre):'');
      g.font='bold 6px ui-monospace,monospace';g.textAlign='center';
      /* measureText est un calcul de mise en page : quatre par image,
         soixante fois par seconde, pour une dizaine de textes possibles.
         On les mesure une fois chacun. */
      if(!LARG[txt])LARG[txt]=g.measureText(txt).width+5;
      var w2=LARG[txt];
      g.fillStyle=sel?'rgba(6,16,28,.86)':'rgba(6,16,28,.52)';
      g.fillRect(pe.x-w2/2,pe.y-38,w2,8);
      if(sel){g.fillStyle=ce;g.fillRect(pe.x-w2/2,pe.y-38,w2,1);}
      g.fillStyle=sel?ce:'rgba(200,225,240,.7)';
      g.textBaseline='middle';g.fillText(txt,pe.x,pe.y-34);
      g.textBaseline='alphabetic';g.textAlign='left';
    }
    /* LA FUMEE PAR-DESSUS LES CORPS : un nuage de gaz flotte au-dessus
       de la foule, il ne se range pas entre deux personnes. */
    if(FUM&&s.fum)FUM.dessine(s.fum,g,mx,my,x0,x1,y0,y1);
    jalon('etiquettes');
    if(s.diag)diagnostic(g,s,vus);
    g.restore();
    /* LE VOILE DE L'HEURE : pose apres la scene et avant le bandeau,
       pour que le texte reste lisible la nuit */
    jalon('flash');
    if(s.nuit){g.fillStyle='rgba(12,18,34,.42)';g.fillRect(0,0,L,H);}
    else if(s.heure==='soir'){g.fillStyle='rgba(60,30,20,.16)';g.fillRect(0,0,L,H);}
    jalon('voile');
    if(s.prep){
      /* la prepa refait sa mise en page a chaque image : elle est
         courte, et le budget change le rayon sous le doigt */
      prepMaj(s,L,H);s.barreL=L;s.barreH=H;s.barreFin=false;
    }else if(!s.barre.length||s.barreL!==L||s.barreH!==H||
             s.barreFin!==!!(s.M&&s.M.fin)||s.barrePrep){
      barreMaj(s,L,H);s.barreL=L;s.barreH=H;s.barreFin=!!(s.M&&s.M.fin);
    }
    s.barrePrep=!!s.prep;
    /* s.sansChrome : utilise par l'outil de mesure pour isoler le cout
       de la scene de celui du bandeau et de la barre. */
    /* LES TRANSITIONS. Une partie qui commence et un resultat qui
       tombe d'un coup se lisent comme un bogue d'affichage : un demi-
       quart de seconde de fondu suffit a dire que quelque chose vient de
       changer. Le fondu d'ouverture descend, celui du resultat monte. */
    if(s.fondu>0){
      s.fondu-=16;
      g.fillStyle='rgba(4,7,12,'+Math.max(0,Math.min(1,s.fondu/700)).toFixed(3)+')';
      g.fillRect(0,0,L,H);
    }
    if(!s.sansChrome){
      if(s.M&&s.M.fin)resultat(s,L,H);
      else hud(s,L,H);
      if(s.prep)prepDessine(s,L,H);
      else barreDessine(s,L,H);
      if(s.enPause)voilePause(s,L,H);
    }
    if(PR){jalon('chrome');PR.n=(PR.n||0)+1;}
    if(s.presse1T>0){s.presse1T-=16;if(s.presse1T<=0)s.presse1=null;}
  },
  /* ------------------------------------------------- le doigt ------- */
  tape:function(s,x,y){
    if(s.pret&&s.prep){prepTape(s,x,y);return;}
    if(!s.pret)return;
    /* LE PREMIER DOIGT REVEILLE LE SON : aucun navigateur mobile n'en
       laisse sortir avant un geste du joueur. */
    if(SON&&!SON.ok){try{SON.demarrer();}catch(e){}}
    if(s.enPause){s.enPause=false;if(SON)SON.pause(false);
      s.mot='ON REPREND';s.motT=1100;return;}
    /* LA BARRE PASSE AVANT LA CARTE : sans cela, un doigt pose sur
       TENIR envoyait aussi l'unite sous la barre. */
    if(s.M&&s.M.briefT>1200)s.M.briefT=900;   /* une tape referme le briefing */
    var b=barreTouche(s,x,y);
    if(b){
      s.presse1=b.k; s.presse1T=160;
      if(SON)SON.effet('clic');
      if(b.k==='tout'){
        var all=(Object.keys(s.selN).filter(function(k){return s.selN[k];}).length===s.unites.length);
        s.selN={};
        if(!all)for(var i=0;i<s.unites.length;i++)s.selN[i]=true; else s.selN[0]=true;
        s.sel=+Object.keys(s.selN)[0]||0;
        s.mot=selNoms(s)+' · SÉLECTIONNÉE'+(selection(s).length>1?'S':'');s.motT=1300;
        return;
      }
      if(b.k.charAt(0)==='u'){
        var ui=+b.k.slice(1);
        /* UNE TAPE BASCULE. C'est la seule multi-selection qui tienne au
           pouce : pas de cadre a tracer, pas de doigt a maintenir. */
        s.selN[ui]=!s.selN[ui];
        var reste=Object.keys(s.selN).filter(function(k){return s.selN[k];});
        if(!reste.length){s.selN[ui]=true;reste=[String(ui)];}
        s.sel=+reste[0];
        /* LA CAMERA VA VOIR CE QU'ON VIENT DE CHOISIR. Sur un telephone
           la rue ne tient pas dans l'ecran : selectionner un bloc qu'on
           ne voit pas, c'est commander a l'aveugle. On cadre dessus, et
           le suivi automatique reprend quatre secondes plus tard. */
        if(s.selN[ui]&&s.unites[ui]){
          var UC=s.unites[ui], fo=[UC.ax,UC.ay];
          foyerUnite(s,UC,fo);
          s.camVise=[mx(fo[0],fo[1]), my(fo[0],fo[1])];
          s.camLibre=true; s.camLibreT=4000;
        }
        s.mot=selNoms(s)+' · SÉLECTIONNÉE'+(reste.length>1?'S':'');s.motT=1300;
        return;
      }
      if(b.k==='rejouer'){
        /* on repasse par le shell : nouvelle partie, nouveau jeton,
           nouvelle graine — donc un autre ordre d'evenements */
        s.phase='fini';
        try{majPlein();monterActions();prendreJeton();}catch(e){}
        return;
      }
      if(s.M&&s.M.fin)return;       /* plus d'ordres une fois fini */
      /* LES TROIS ORDRES QU'ON LANCE NE PARTENT PLUS TOUT SEULS. Le
         bouton ARME la visee ; la case touchee ensuite est la cible.
         Avant, gaz et eau partaient droit devant la formation et les
         cocktails toujours vers l'est : on ne pouvait rien viser. */
      if(b.k==='molotov'||b.k==='gaz'||b.k==='eau'){
        if(s.vise===b.k){s.vise=null;s.viseXY=null;s.mot='VISÉE ANNULÉE';s.motT=1100;return;}
        var pret=armer(s,b.k);
        if(pret){
          s.vise=b.k;
          s.mot=VISE_MOT[b.k];s.motT=999999;  /* il reste tant qu'on n'a pas tire */
          if(SON)SON.effet('clic');
        }
        return;
      }
      /* ON PAIE AVANT D'AGIR, et seulement si l'ordre aboutit : le
         debit se fait ici, une seule fois, pour tous les ordres. */
      if(!coute(s,b.k))return;
      if(b.k==='somm')cmdSommation(s);
      else if(b.k==='nasse')cmdNasse(s);
      else if(b.k==='arrest')cmdArrestation(s);
      else if(b.k==='feinte')cmdFeinte(s);
      else if(b.k==='pousser')cmdPousser2(s);
      else if(b.k==='casser')cmdCasser(s);
      else if(b.k==='barricade')cmdBarricade(s);
      else if(b.k==='disperser')cmdDisperser(s);
      else if(b.k==='tenir')cmdTenir(s);
      else if(b.k==='avant')cmdPousser(s,1);
      else if(b.k==='arriere')cmdPousser(s,-1);
      else if(b.k==='forme')cmdForme(s);
      else if(b.k==='groupe')cmdGrouper(s);
      else if(b.k==='diag'){s.diag=!s.diag;s.mot=s.diag?'DIAGNOSTIC ALLUMÉ':'DIAGNOSTIC ÉTEINT';s.motT=1200;}
      return;
    }
    if(s.M&&s.M.fin)return;
    var z=s.cam.z;
    var ex=(x-s.L/2)/z+s.cam.x, ey=(y-s.H/2)/z+s.cam.y;
    var gx=Math.floor(e2mx(ex,ey)), gy=Math.floor(e2my(ex,ey));
    if(gx<0||gy<0||gx>=GW||gy>=GH){s.mot='HORS DE LA CARTE';s.motT=1100;return;}
    if(s.vise){tirer(s,x,y);return;}
    cmdAller(s,gx,gy);
  },
  glisse:function(s,x,y,dx,dy){
    if(!s.pret||s.pince)return;
    /* EN VISEE, LE DOIGT VISE. On voit la ligne et le point d'impact
       bouger sous le pouce, et c'est au relachement que ca part. Le
       panoramique reprend ses droits des que la visee est finie. */
    if(s.vise){s.viseXY=s.viseXY||[0,0];s.viseXY[0]=x;s.viseXY[1]=y;return;}
    /* ni sur la barre, ni sur la barrette des jetons qui flotte juste
       au-dessus : un doigt pose la commande, il ne deplace pas la rue */
    var plancher=(s.jetonHaut!==undefined)?s.jetonHaut-2:(s.H-s.hbar-2);
    if(s.hbar&&y>plancher)return;
    s.camLibre=true; s.camLibreT=5000; s.camVise=null;
    s.cam.x-=dx/s.cam.z; s.cam.y-=dy/s.cam.z;
    camBornes(s);
  },
  /* DEUX DOIGTS. Le shell appelle ceci avec le rapport des ecartements
     et le milieu des deux doigts : on zoome AUTOUR de ce milieu, pas
     autour du centre de l'ecran, sinon la rue fuit sous les doigts. */
  relache:function(s,x,y){
    if(!s.pret||!s.vise)return;
    if(s.hbar&&y>s.H-s.hbar-2){s.vise=null;s.viseXY=null;s.mot='VISÉE ANNULÉE';s.motT=1100;return;}
    tirer(s,x,y);
  },
  pince:function(s,fac,cx,cy,fini){
    if(!s.pret)return;
    if(fini){s.pince=false;camAimante(s);camBornes(s);return;}
    s.pince=true;s.camLibre=true;s.camLibreT=5000;
    var z0=s.cam.z;
    var z=Math.max(s.cam.zmin,Math.min(s.cam.zmax,z0*fac));
    /* le point du monde sous le milieu des doigts ne doit pas bouger */
    var mx=(cx-s.L/2), my=(cy-s.H/2);
    s.cam.x+=mx/z0-mx/z; s.cam.y+=my/z0-my/z;
    s.cam.z=z; camBornes(s);
  },
  /* LES ORDRES SONT DANS LA SCENE, pas ici : une barre HTML ne peut pas
     montrer l'effectif d'une unite ni l'avancement de son ordre. */
  actions:function(s){
    if(s.phase!=='jeu')return '<button data-a="commencer">DESCENDRE DANS LA RUE · 1 €</button>';
    return '';
  },
  action:function(s,a){
    if(!s.pret||!s.unites)return;
    var U=s.unites[s.sel];
    if(a==='__inutilise'){
      s.sel=(s.sel+1)%s.unites.length;
      s.mot=s.unites[s.sel].nom+' · SÉLECTIONNÉE';s.motT=1400;
    }
    else if(a==='form'){
      var L=['ligne','coin','colonne','nasse'];
      U.form=L[(L.indexOf(U.form)+1)%L.length];
      s.mot=U.nom+' · '+(U.form?U.form.toUpperCase():(U.membres.length+'H'));s.motT=1400;
    }
    else if(a==='avance'){
      /* priorite 2 : l'ordre d'avancer passe devant la reaction a la
         densite, mais un deplacement en cours le refuse */
      if(FOULE.ordre(s.sim,U,'avance',3600,2)){s.mot=U.nom+' · EN AVANT';s.motT=1500;}
      else{s.mot=U.nom+' · DÉJÀ EN MARCHE';s.motT=1300;}
    }
    else if(a==='choc'){
      /* UN EVENEMENT, pas un reglage de jauge : une grenade tombe a six
         tuiles devant la ligne, les corps a portee prennent un choc, et
         tout ce qui suit — stress, panique, propagation, fuite — sort
         des regles d'etat. Rien n'est ajoute a la tension a la main. */
      var dv=FOULE.devant(U);
      var ex=U.ax + dv[0]*3.4, ey=U.ay + dv[1]*3.4;
      FOULE.evenement(s.sim,ex,ey,4.6,1.0);
      s.flash=[ex,ey,0];
      s.mot='GRENADE · '+U.nom;s.motT=1500;
    }
    else if(a==='diag'){
      s.diag=!s.diag;
      s.mot=s.diag?'DIAGNOSTIC ALLUMÉ':'DIAGNOSTIC ÉTEINT';s.motT=1300;
      try{monterActions();}catch(e){}
    }
  },
  banniere:function(g,w,h,grand){vignette(g,w,h,grand);}
};

/* LA VILLE DU FOND, en parallaxe. Deux rangees de silhouettes et une
   brume : ce qui depasse de la carte n'est plus du vide mais un horizon,
   et la rue cesse de flotter dans le bleu. */
function fondLointain(s,L,H){
  var g=G;
  if(!s.fond){
    var d=new Dé(991), cv=document.createElement('canvas');
    cv.width=512; cv.height=120;
    var c2=cv.getContext('2d'); c2.imageSmoothingEnabled=false;
    [[0,'#2e3c50',62],[1,'#3a4a60',44]].forEach(function(r){
      var x=0;
      while(x<512){
        var w=8+((d.f()*22)|0), h=12+d.f()*r[2];
        c2.fillStyle=r[1]; c2.fillRect(x,120-h,w,h);
        c2.fillStyle=teinte(r[1],1.14); c2.fillRect(x,120-h,w,1);
        if(r[0]===1)for(var fy=120-h+4;fy<116;fy+=6)
          for(var fx=x+2;fx<x+w-2;fx+=4)
            if(d.f()<0.22){c2.fillStyle='#6a7a92';c2.fillRect(fx,fy,2,2);}
        x+=w;
      }
    });
    s.fond=cv;
  }
  /* l'horizon suit la camera de loin : un decor de fond qui ne bouge
     pas du tout se lit comme un papier peint colle a l'ecran */
  var hy=Math.round(H*0.30 - (s.cam.y-MH/2)*0.06*s.cam.z);
  var dx=Math.round(-(s.cam.x*0.05*s.cam.z))%512;
  g.save();
  g.globalAlpha=s.nuit?0.5:0.75;
  for(var i=-1;i<Math.ceil(L/512)+1;i++)
    g.drawImage(s.fond, dx+i*512, hy, 512, 120);
  g.globalAlpha=1;
  /* LA BRUME, PEINTE UNE FOIS DANS UNE BANDE.
     Premiere version : un degrade etale en fillRect sur les deux tiers
     de l'ecran, a chaque image. Sur un telephone a deux points par
     pixel, cela fait plus d'un million de points de degrade soixante
     fois par seconde — c'etait le plus gros poste du rendu, devant les
     trois cents personnages. Le degrade est maintenant peint une seule
     fois dans une bande de huit points de large qu'on etire, et le bas
     est un aplat : deux recopies au lieu d'un calcul. */
  if(!s.brumeCv||s.brumeH!==H||s.brumeHeure!==s.heure){
    var bc=document.createElement('canvas');bc.width=8;bc.height=90;
    var bg=bc.getContext('2d');
    var cc=s.nuit?'10,16,30':(s.heure==='soir'?'70,46,40':'126,152,174');
    var gr2=bg.createLinearGradient(0,0,0,90);
    gr2.addColorStop(0,'rgba('+cc+',0)');
    gr2.addColorStop(0.62,'rgba('+cc+',.86)');
    gr2.addColorStop(1,'rgba('+cc+',1)');
    bg.fillStyle=gr2;bg.fillRect(0,0,8,90);
    s.brumeCv=bc; s.brumeH=H; s.brumeHeure=s.heure;
    s.brumeBas='rgb('+cc+')';
  }
  g.drawImage(s.brumeCv,0,hy+60,L,90);
  if(hy+150<H){g.fillStyle=s.brumeBas;g.fillRect(0,hy+149,L,H-hy-149);}
  g.restore();
}

/* =====================================================================
   LE DIAGNOSTIC
   Temporaire, et c'est voulu : il sert a repondre a « pourquoi celui-la
   fait ca ». Chaque corps porte son etat, un trait vers sa destination,
   et une couleur par groupe. Au-dessus, le stress en barre. Un bouton
   l'allume et l'eteint — il ne coute rien quand il est eteint.
   ===================================================================== */
var LARG={};
var DIAG_C=['#6ad8ff','#ffd24a','#7dff9a','#ff8ac8','#c8a0ff','#ff9a6a','#9affe0','#ffffff'];
var DIAG_AB={MARCHE:'MAR',ATTEND:'ATT',HESITE:'HES',POUSSE:'POU',RECULE:'REC',
             PANIQUE:'PAN',FUIT:'FUI',CALME:'CAL',TIENT:'TIE',VERS:'VER',
             FORME:'FOR',AVANCE:'AVA',CEDE:'CED'};
function diagnostic(g,s,vus){
  var i,a;
  g.lineWidth=1;
  for(i=0;i<vus.length;i++){
    a=vus[i];
    var c=DIAG_C[a.g%DIAG_C.length];
    /* le trait vers la destination : on voit d'un coup d'oeil si un
       groupe vise encore ce qu'on croit */
    var pc=m2e(a.cx,a.cy);
    g.strokeStyle=c;g.globalAlpha=0.35;
    g.beginPath();g.moveTo(a._px,a._py);g.lineTo(pc.x,pc.y+TH/2);g.stroke();
    g.globalAlpha=1;
    /* la barre de stress, juste au-dessus de la tete */
    if(a.camp==='manif'){
      var w=10, h=2, bx=a._px-w/2, by=a._py-30;
      g.fillStyle='rgba(0,0,0,.55)';g.fillRect(bx,by,w,h);
      g.fillStyle=a.stress>0.8?'#ff4a4a':(a.stress>0.55?'#ffa83a':'#6ad8ff');
      g.fillRect(bx,by,w*a.stress,h);
    }
    /* l'etat, en trois lettres */
    g.fillStyle=(a.etat==='PANIQUE')?'#ff6a6a':c;
    g.font='5px ui-monospace,monospace';g.textAlign='center';
    g.fillText(DIAG_AB[a.etat]||a.etat,a._px,a._py-32);
  }
  /* la destination de chaque groupe, marquee au sol */
  for(i=0;i<s.sim.groupes.length;i++){
    var G=s.sim.groupes[i], pg=m2e(G.ax,G.ay);
    g.strokeStyle=DIAG_C[i%DIAG_C.length];
    g.beginPath();g.ellipse(pg.x,pg.y+TH/2,7,3.5,0,0,7);g.stroke();
    g.beginPath();g.moveTo(pg.x-9,pg.y+TH/2);g.lineTo(pg.x+9,pg.y+TH/2);g.stroke();
  }
  g.textAlign='left';
}

/* =====================================================================
   11. LE BANDEAU
   Trois lignes en haut, un mot en bas. Pas de panneau : la rue est le
   sujet, et un cartouche de cent points de haut en cache le tiers.
   ===================================================================== */
function chrono(ms){
  var t=Math.max(0,Math.ceil(ms/1000));
  return Math.floor(t/60)+':'+('0'+(t%60)).slice(-2);
}
/* =====================================================================
   L'INTERFACE

   COMPACTE, et elle ne montre que ce sur quoi on peut agir : le temps
   qui reste, l'objectif principal avec son compte, la tension, et
   l'unite qu'on tient sous le doigt. Tout le reste — l'heure, le nom de
   la rue, le nombre de corps — a ete retire : c'etait joli et ca ne
   servait a rien pendant qu'on commande.
   ===================================================================== */
function hud(s,L,H){
  /* PENDANT LA PREPA, LE BANDEAU DU CHRONO PREND LA PLACE DU HUD : deux
     bandeaux superposes en haut de l'ecran, on ne lisait ni l'un ni
     l'autre. */
  if(s.prep)return;
  var g=G, M=s.M;
  var large=(L>250);
  /* ---- le bandeau : chrono, objectif principal, tension ---- */
  g.fillStyle='rgba(6,10,18,.74)';g.fillRect(0,0,L,15);
  g.textBaseline='middle';
  if(M){
    g.font='bold 9px ui-monospace,monospace';g.textAlign='left';
    var reste=Math.max(0,M.duree-M.t);
    g.fillStyle=(reste<20000)?'#ffd24a':'#eaf6ff';
    g.fillText(chrono(reste),22,8);
    var P=M.etats.tenir||M.etats.passer;
    if(P){
      g.font='7px ui-monospace,monospace';
      /* cote cortege, atteindre le compte est une BONNE nouvelle */
      g.fillStyle=(P.v>=P.c)?((M.camp==='manif')?'#8aff9a':'#ff8a7a'):'#9ae8ff';
      g.textAlign='center';
      g.fillText((large?'PASSÉS ':'')+P.v+'/'+P.c,L*0.52,8);
    }
    /* la tension, en barre : c'est l'indicateur qu'on surveille */
    var T=s.sim?s.sim.tension:0, bw=Math.min(62,L*0.26), bx=L-bw-4;
    g.fillStyle='rgba(255,255,255,.14)';g.fillRect(bx,5,bw,6);
    g.fillStyle=T>0.80?'#ff4a4a':(T>0.6?'#ffa83a':'#6ad8ff');
    g.fillRect(bx,5,bw*Math.min(1,T),6);
    g.fillStyle='#cfe4f2';g.font='6px ui-monospace,monospace';g.textAlign='right';
    g.fillText('TENSION',bx-3,8);
  }
  /* ---- les objectifs secondaires, deux lignes de six points ---- */
  /* UN FOND SOUS LES LIGNES D'ETAT : sans lui, du texte gris de six
     points sur un ciel clair ne se lit pas. */
  var nL=1; if(M)for(var q0=0;q0<M.obj.length;q0++)if(M.obj[q0].type!=='principal')nL++;
  g.fillStyle='rgba(6,10,18,.55)';g.fillRect(0,15,large?L*0.62:L,nL*8+2);
  var y=20;
  if(M){
    for(var i=0;i<M.obj.length;i++){
      var O=M.obj[i]; if(O.type==='principal')continue;
      var E=M.etats[O.id]; if(!E)continue;
      g.font='6px ui-monospace,monospace';g.textAlign='left';
      g.fillStyle=E.rate?'#ff7a6a':'#8fb8cc';
      g.fillText((E.rate?'✕ ':'· ')+O.court+' '+O.dit(E),4,y);
      y+=8;
    }
  }
  /* ---- l'unite tenue sous le doigt ----
     SUR SA PROPRE LIGNE quand l'ecran est etroit : a cote des objectifs,
     les deux textes se chevauchaient et aucun des deux n'etait lisible. */
  if(s.unites&&s.unites[s.sel]&&!(M&&M.fin)){
    var U=s.unites[s.sel], et=s.sim?s.sim.agents[U.membres[0]].etat:'';
    g.font='bold 6px ui-monospace,monospace';
    g.fillStyle=UCOL[s.sel%UCOL.length];
    if(large){g.textAlign='right';g.fillText(selNoms(s)+' · '+(U.form?U.form.toUpperCase():(U.membres.length+'H'))+' · '+(DIAG_AB[et]||et),L-4,20);}
    else{g.textAlign='left';g.fillText(selNoms(s)+' · '+(U.form?U.form.toUpperCase():(U.membres.length+'H'))+' · '+(DIAG_AB[et]||et),4,y);}
  }
  /* ---- l'alerte d'evenement ---- */
  if(M&&M.alerteT>0&&M.alerte){
    var a=M.alerte, al=Math.min(1,M.alerteT/700);
    g.textAlign='center';
    g.font='bold 9px ui-monospace,monospace';
    var w=Math.max(g.measureText(a.t).width, a.d?g.measureText(a.d).width:0)+14;
    g.fillStyle='rgba(10,16,28,'+(0.86*al).toFixed(2)+')';
    g.fillRect((L-w)/2,H*0.26,w,a.d?26:16);
    g.fillStyle='rgba(255,210,74,'+al.toFixed(2)+')';
    g.fillRect((L-w)/2,H*0.26,w,1);
    g.fillStyle='rgba(255,226,138,'+al.toFixed(2)+')';
    g.fillText(a.t,L/2,H*0.26+9);
    if(a.d){g.font='6px ui-monospace,monospace';
      g.fillStyle='rgba(200,225,240,'+al.toFixed(2)+')';
      g.fillText(a.d,L/2,H*0.26+19);}
  }
  /* ---- le briefing : il ne bloque pas, la rue tourne derriere ---- */
  if(M&&M.briefT>0)briefing(s,L,H,M);
  /* ---- le mot du moment ---- */
  if(s.motT>0&&s.mot){
    g.textAlign='center';
    var t=s.mot, w2=g.measureText(t).width+10;
    g.font='6px ui-monospace,monospace';w2=g.measureText(t).width+10;
    var y0=H-s.hbar-12;
    g.fillStyle='rgba(8,12,20,.72)';g.fillRect((L-w2)/2,y0,w2,11);
    g.fillStyle='#ffe28a';g.fillText(t,L/2,y0+6);
  }
  g.textAlign='left';g.textBaseline='alphabetic';
}

/* LE BRIEFING tient en quatre lignes et ne bloque rien : la rue tourne
   derriere, le cortege avance, et il s'efface tout seul. Un ecran de
   preparation de trente secondes avant chaque partie, c'est trente
   secondes de moins a jouer. */
function briefing(s,L,H,M){
  var g=G, al=Math.min(1,M.briefT/900);
  var w=Math.min(L-16,238), x=(L-w)/2, y=(s.prep?H*0.17:H*0.28), h=88;
  g.fillStyle='rgba(8,14,24,'+(0.88*al).toFixed(2)+')';
  coArr(g,x,y,w,h,5);g.fill();
  g.strokeStyle='rgba(255,210,74,'+(0.7*al).toFixed(2)+')';g.lineWidth=1;
  coArr(g,x,y,w,h,5);g.stroke();
  g.textAlign='left';g.textBaseline='middle';
  g.font='bold 8px ui-monospace,monospace';
  g.fillStyle='rgba(255,226,138,'+al.toFixed(2)+')';
  g.fillText(TER.nom+' · '+(M.camp==='manif'?'LE CORTÈGE':'LE CORDON'),x+8,y+11);
  g.font='6px ui-monospace,monospace';
  g.fillStyle='rgba(205,228,242,'+al.toFixed(2)+')';
  /* LE BRIEFING LIT LA MISSION. Ecrit en dur, il annoncait encore
     « six passages toleres » apres qu'on soit passe a douze : un texte
     qui ment sur la regle est pire que pas de texte. */
  var lignes=(M.camp==='manif')?[
    'La préfecture est au fond, derrière le cordon.',
    'Faites passer '+M.objectif+' des vôtres avant '+chrono(M.duree)+'.',
    'Chaque ordre coûte de l’ÉLAN. Non dépensé = gardé.',
    'Tenez les 3 zones : élan, renforts, tension.',
    'Tape sur la carte : le bloc choisi y va.'
  ]:[
    'Le cortège traverse la place vers la préfecture.',
    'Tenez '+chrono(M.duree)+'. '+M.tolere+' passages tolérés.',
    'Chaque ordre coûte des MOYENS. Non dépensés = gardés.',
    'Tenez les 3 zones : moyens, renforts, tension.',
    'Tape sur la carte : l’unité y va.'
  ];
  for(var i=0;i<lignes.length;i++)g.fillText(lignes[i],x+8,y+24+i*11);
  g.textAlign='left';g.textBaseline='alphabetic';
}

function voilePause(s,L,H){
  var g=G;
  g.fillStyle='rgba(4,8,15,.72)';g.fillRect(0,0,L,H);
  g.textAlign='center';g.textBaseline='middle';
  g.font='bold 13px ui-monospace,monospace';g.fillStyle='#9ae8ff';
  g.fillText('EN PAUSE',L/2,H/2-8);
  g.font='7px ui-monospace,monospace';g.fillStyle='#8fb8cc';
  g.fillText('touche l’écran pour reprendre',L/2,H/2+8);
  g.textAlign='left';g.textBaseline='alphabetic';
}

/* =====================================================================
   L'ECRAN DE RESULTAT
   Ce qui s'est passe, ligne par ligne, et de quoi recommencer.
   ===================================================================== */
function resultat(s,L,H){
  var g=G, M=s.M;
  if(M.paru===undefined)M.paru=0;
  if(M.paru<1)M.paru=Math.min(1,M.paru+0.055);
  var A=M.paru;
  g.fillStyle='rgba(4,8,15,'+(0.84*A).toFixed(3)+')';g.fillRect(0,0,L,H);
  if(A<0.25)return;
  var w=Math.min(L-14,250), x=(L-w)/2;
  var nD=M.detail?M.detail.length:0;
  var h=Math.min(H-30, 60+nD*9+28);
  /* le panneau monte de huit points en apparaissant */
  var y=(H-h)/2-6+(1-A)*8;
  g.globalAlpha=A;
  g.fillStyle='rgba(10,16,28,.96)';coArr(g,x,y,w,h,6);g.fill();
  g.strokeStyle=M.fin==='gagne'?'#7dff9a':'#ff6a6a';g.lineWidth=1;
  coArr(g,x,y,w,h,6);g.stroke();
  g.textAlign='center';g.textBaseline='middle';
  g.font='bold 13px ui-monospace,monospace';
  g.fillStyle=M.fin==='gagne'?'#7dff9a':'#ff6a6a';
  g.fillText(M.camp==='manif'
    ? (M.fin==='gagne'?'LA LIGNE EST PASSÉE':'LE CORTÈGE A ÉTÉ TENU')
    : (M.fin==='gagne'?'PLACE TENUE':'PLACE PERDUE'),L/2,y+15);
  g.font='6px ui-monospace,monospace';g.fillStyle='#8fb8cc';
  var pq=(M.camp==='manif')
    ? (M.fin==='gagne'?(M.passes+' des vôtres sont passés.')
                      :('Vous n’étiez que '+M.passes+' à passer.'))
    : (M.fin==='gagne'?'Le cortège n’est pas passé.'
       :(M.passes>M.tolere?('Ils sont '+M.passes+' à être passés.')
        :'La rue a basculé.'));
  g.fillText(pq,L/2,y+27);
  /* le detail, ligne par ligne */
  g.font='6px ui-monospace,monospace';
  for(var i=0;i<nD;i++){
    var d=M.detail[i], yy=y+40+i*9;
    g.textAlign='left';g.fillStyle='#9fc0d4';g.fillText(d[0],x+10,yy);
    g.textAlign='right';
    var neutre=(d[1]==='-0'||d[1]==='0'||d[1]==='+0');
    g.fillStyle=neutre?'#6f8ea2':((d[1].charAt(0)==='-')?'#ff9a8a':'#9fe8b8');
    g.fillText(d[1],x+w-10,yy);
  }
  g.textAlign='center';
  g.font='bold 11px ui-monospace,monospace';g.fillStyle='#ffd24a';
  g.fillText(M.score+' POINTS',L/2,y+h-14);
  g.globalAlpha=1;
  g.textAlign='left';g.textBaseline='alphabetic';
}

/* =====================================================================
   12. LA VIGNETTE DU MENU
   Une tranche de la meme rue, en petit : le joueur doit reconnaitre
   dans la borne ce qu'il a vu sur l'affiche.
   ===================================================================== */
function vignette(g,w,h,grand){
  var d=new Dé(7741);
  g.fillStyle='#5a7a96';g.fillRect(0,0,w,h);
  var cg=g.createLinearGradient(0,0,0,h);
  cg.addColorStop(0,'#6e90ae');cg.addColorStop(1,'#9ab0c4');
  g.fillStyle=cg;g.fillRect(0,0,w,h);
  /* une avenue qui fuit vers la droite, deux rangees d'immeubles */
  var ech=grand?1:0.62, sol=h*0.62;
  g.save();g.translate(w*0.5,sol);g.scale(ech,ech);
  var i,p;
  /* la chaussee */
  quad(g,[-w,0, w,-h*0.55/ech, w,h/ech, -w,h/ech],'#3b3e46');
  for(i=-6;i<14;i++){
    var y2=i*14;
    quad(g,[-w*0.5+i*26,y2, -w*0.5+i*26+14,y2-7, -w*0.5+i*26+16,y2-5, -w*0.5+i*26+2,y2+2],'#c8c4a8');
  }
  g.restore();
  /* deux rangees d'immeubles, en silhouette detaillee */
  var hx=0;
  while(hx<w+20){
    var bw=10+((d.f()*16)|0), bh=h*(0.30+d.f()*0.42);
    var c=['#a8a094','#8a5244','#c2b49a','#7e8894','#9a8e7e'][(d.f()*5)|0];
    g.fillStyle=teinte(c,0.9);g.fillRect(hx,sol-bh-h*0.10,bw,bh);
    g.fillStyle=teinte(c,1.1);g.fillRect(hx,sol-bh-h*0.10,bw,2);
    for(var fy=sol-bh-h*0.10+5;fy<sol-h*0.12;fy+=7)
      for(var fx=hx+2;fx<hx+bw-3;fx+=5){
        g.fillStyle=d.f()<0.26?'#ffe2a0':'#2a3642';g.fillRect(fx,fy,3,4);
        g.fillStyle='rgba(255,255,255,.14)';g.fillRect(fx,fy,3,1);
      }
    hx+=bw;
  }
  /* la foule et le cordon, au contact */
  var TN=['#4a7ba4','#8c4a58','#4a8a64','#9a8846','#5f4a86','#8a6238'];
  var ht=Math.round(h*0.14);
  for(i=0;i<(grand?210:120);i++){
    var mx=d.f()*w*0.55, my=sol+h*0.04+d.f()*h*0.2;
    g.fillStyle='rgba(0,0,0,.28)';g.fillRect(mx-1,my,3,1);
    g.fillStyle=TN[(d.f()*TN.length)|0];g.fillRect(mx,my-ht,2,ht);
    g.fillStyle=d.f()<0.4?'#2e2622':'#c09070';g.fillRect(mx,my-ht-2,2,2);
  }
  for(i=0;i<(grand?48:30);i++){
    var rz=(i%6)/5, co=(i/6)|0;
    var cx=w*0.63+co*4+rz*5, cy=sol+h*0.05+rz*h*0.16;
    g.fillStyle='rgba(0,0,0,.28)';g.fillRect(cx-1,cy,3,1);
    g.fillStyle='#2e3f5e';g.fillRect(cx,cy-ht,2,ht);
    g.fillStyle='#1a2436';g.fillRect(cx,cy-ht-2,2,2);
    g.fillStyle='rgba(150,196,238,.55)';g.fillRect(cx-1,cy-ht+1,1,ht-2);
  }
  if(!grand){
    g.fillStyle='rgba(10,12,16,.8)';g.fillRect(0,0,w,6);
    g.fillStyle='#1a1d22';g.fillRect(2,2,w-4,2);
    g.fillStyle='#c8a03a';g.fillRect(3,2,(w-6)*0.46,2);
  }
}

window.MOTEUR=window.MOTEUR||{};
window.MOTEUR.cordon=M;
})();
