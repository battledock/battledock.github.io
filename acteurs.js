/* =====================================================================
   LE CORDON — LES ACTEURS

   SECONDE MOITIE : rien que des images. Ce module ne sait pas ce qu'est
   une force, un groupe ni un ordre. Il recoit un agent, lit trois
   champs — type, dir, anim — et pose un dessin.

   L'ATLAS. Chaque silhouette est peinte une fois au chargement, dans
   un petit calque, pour chaque variante, chaque vue et chaque pose.
   Dessiner trois cents bonshommes a la main, soixante fois par seconde,
   coute dix fois plus cher que de recopier trois cents vignettes.

   REMPLACER CES SPRITES. Ce sont des sprites temporaires : lisibles,
   pas definitifs. Le jour ou de vraies planches arrivent, il suffit de
   remplir ACTEURS.atlas[type][varia][vue][pose] avec {cv,ox,oy} — ox,oy
   disant ou se trouvent les pieds dans l'image. Rien d'autre ne bouge.
   ===================================================================== */
(function(){
'use strict';
var ACTEURS={};

function cal(w,h,ax,ay,fn){
  var cv=document.createElement('canvas');cv.width=w;cv.height=h;
  var g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  fn(g,ax,ay);
  return {cv:cv,ox:ax,oy:ay};
}
function P(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,w,h);}
function tein(c,f){
  var n=parseInt(c.slice(1),16),r=(n>>16)&255,v=(n>>8)&255,b=n&255;
  r=Math.max(0,Math.min(255,(r*f)|0));v=Math.max(0,Math.min(255,(v*f)|0));
  b=Math.max(0,Math.min(255,(b*f)|0));
  return '#'+((1<<24)+(r<<16)+(v<<8)+b).toString(16).slice(1);
}
/* L'OMBRE EST PORTEE. Centree sous les pieds, elle faisait flotter les
   corps : rien ne disait d'ou venait la lumiere. Decalee vers la
   droite-bas comme celle des immeubles, elle les repose au sol. */
function ombre(g,x,y,rx,ry){
  g.globalAlpha=0.28;g.fillStyle='#000';
  g.beginPath();g.ellipse(x+1.5,y+0.8,rx,ry,0,0,7);g.fill();g.globalAlpha=1;
}

/* ---------------------------------------------------------------------
   LES PALETTES
   Ce qui distingue deux manifestants dans une foule, ce n'est pas le
   visage — a cette taille on n'en voit pas — c'est la couleur de la
   veste, celle du bas, et la tete : nue, bonnet, capuche, casquette.
   --------------------------------------------------------------------- */
var PEAU=['#c89a74','#a87a56','#7e5436','#e0b48e','#5e3c26'];
var HAUT=['#4a7ba4','#8c4a58','#3e7a56','#9a8846','#5f4a86','#8a6238','#a8a096',
          '#2e5a7a','#b05a40','#486a4a','#7a4a6a','#c0b8a8','#36464e','#8a3a3a'];
var BAS =['#2e3440','#3a3a46','#4a4038','#283040','#52483a','#1e2630'];
var TETE=['nue','bonnet','capuche','casquette','cheveux'];
var CHEV=['#2a2018','#4a3a26','#6a5a3e','#1a1a1a','#8a6a4a','#5a2a1a'];
var BONNET=['#c03a30','#2a5a8a','#d8a830','#3a7a4a','#8a3a7a','#e0e0d8'];

function paletteManif(i){
  var r=function(n,m){return (i*n+n*n*7)%m;};
  return {
    pea:PEAU[r(3,PEAU.length)],
    hau:HAUT[r(5,HAUT.length)],
    bas:BAS[r(7,BAS.length)],
    tet:TETE[r(11,TETE.length)],
    chv:CHEV[r(13,CHEV.length)],
    bon:BONNET[r(17,BONNET.length)],
    sac:(i%4===1), ech:(i%5===3)
  };
}

/* ---------------------------------------------------------------------
   LE CORPS
   Vingt-huit points de haut pour une tuile de seize : la proportion
   isometrique d'un homme debout sur une case de rue.
   --------------------------------------------------------------------- */
/* LA TAILLE. Premiere version : vingt-neuf points de haut. Sur une
   tuile de trente-deux de large, deux cents corps au coude a coude
   formaient une bouillie ou l'on ne distinguait plus une pancarte d'une
   tete. Vingt-deux points : on lit la foule, et chaque sprite coute un
   tiers de surface en moins. */
/* LA MARCHE EN SIX POSES. A quatre, le pas etait un va-et-vient :
   jambes jointes, ecartees, jointes, ecartees. Six donnent un cycle —
   appui, poussee, suspension, reception — et l'ecart intermediaire fait
   qu'on ne voit plus le saut entre deux images. Le buste monte d'un
   point a la suspension, les bras balancent a contretemps des jambes. */
var PAS_EC =[0,-1,-2,0, 1, 2];   /* l'ecart des jambes */
var PAS_SAU=[0,-1, 0,0,-1, 0];   /* la suspension */
var PAS_BAL=[0, 1, 2,0,-1,-2];   /* les bras, a contretemps */
function corps(g,x,y,dos,f,p,o){
  o=o||{};
  var ec=PAS_EC[f%6], bal=PAS_BAL[f%6], sau=PAS_SAU[f%6];
  ombre(g,x,y,5,2.2);
  var Y=y+sau;
  /* jambes */
  P(g,x-2+ec,Y-7,2,7,p.bas); P(g,x+1-ec,Y-7,2,7,tein(p.bas,0.86));
  P(g,x-2+ec,Y-2,2,2,'#17181c'); P(g,x+1-ec,Y-2,2,2,'#17181c');
  /* torse */
  P(g,x-3,Y-16,7,9,p.hau);
  P(g,x-3,Y-16,7,1,tein(p.hau,1.28));
  P(g,x-3,Y-10,7,1,tein(p.hau,0.78));
  if(o.gilet){P(g,x-3,Y-15,7,5,o.gilet);P(g,x-3,Y-15,7,1,tein(o.gilet,1.3));}
  /* bras */
  P(g,x-5,Y-15+bal,2,7,tein(p.hau,0.84));
  P(g,x+4,Y-15-bal,2,7,tein(p.hau,0.84));
  P(g,x-5,Y-9+bal,2,2,p.pea); P(g,x+4,Y-9-bal,2,2,p.pea);
  /* tete */
  P(g,x-2,Y-21,5,5,p.pea);
  P(g,x-2,Y-21,5,1,tein(p.pea,1.12));
  if(!dos){
    P(g,x-1,Y-19,1,1,'#17181c'); P(g,x+1,Y-19,1,1,'#17181c');
    P(g,x-1,Y-17,3,1,tein(p.pea,0.74));
  }
  /* ce qu'il a sur la tete */
  if(p.tet==='bonnet'){P(g,x-3,Y-23,7,3,p.bon);P(g,x-3,Y-23,7,1,tein(p.bon,1.3));}
  else if(p.tet==='capuche'){P(g,x-4,Y-23,9,6,tein(p.hau,0.86));
    P(g,x-2,Y-21,5,4,p.pea);P(g,x-4,Y-23,9,1,tein(p.hau,1.1));
    if(!dos){P(g,x-1,Y-19,1,1,'#17181c');P(g,x+1,Y-19,1,1,'#17181c');}}
  else if(p.tet==='casquette'){P(g,x-3,Y-23,7,2,p.bon);
    if(!dos)P(g,x-5,Y-22,6,1,tein(p.bon,0.82));else P(g,x+2,Y-22,6,1,tein(p.bon,0.82));}
  else if(p.tet==='cheveux'){P(g,x-3,Y-23,7,3,p.chv);P(g,x-3,Y-21,1,3,p.chv);P(g,x+3,Y-21,1,3,p.chv);}
  else {P(g,x-2,Y-22,5,1,p.chv);}
  if(p.ech){P(g,x-3,Y-17,7,2,tein(p.bon,0.9));}
  if(p.sac&&dos){P(g,x-2,Y-15,5,6,tein(p.bas,1.3));P(g,x-2,Y-15,5,1,tein(p.bas,1.6));}
}

/* =====================================================================
   ECRIRE SUR UNE BANDEROLE

   Un slogan sur un tissu de vingt et un pixels de large ne peut pas
   passer par fillText : a cette taille une police vectorielle rend une
   bouillie grise. On dessine donc les lettres a la main, sur trois
   pixels de haut et deux de large — c'est illisible lettre a lettre, et
   parfaitement lisible comme mot, exactement comme une vraie banderole
   vue de l'autre bout d'une place.
   ===================================================================== */
/* Chaque lettre tient sur trois pixels de large et cinq de haut. Chaque
   ligne est un masque de trois bits : 1 = gauche, 2 = milieu, 4 = droite.
   Cinq caracteres par banderole, c'est tout ce qu'un tissu de vingt et un
   pixels peut porter — et c'est deja plus que ce qu'on lit vraiment sur
   une banderole a l'autre bout d'une place. */
var MINI={
  A:[2,5,7,5,5], B:[3,5,3,5,3], C:[6,1,1,1,6], D:[3,5,5,5,3], E:[7,1,3,1,7],
  F:[7,1,3,1,1], G:[6,1,5,5,6], H:[5,5,7,5,5], I:[7,2,2,2,7], J:[4,4,4,5,2],
  K:[5,5,3,5,5], L:[1,1,1,1,7], M:[5,7,7,5,5], N:[5,7,7,7,5], O:[2,5,5,5,2],
  P:[3,5,3,1,1], Q:[2,5,5,3,6], R:[3,5,3,5,5], S:[6,1,2,4,3], T:[7,2,2,2,2],
  U:[5,5,5,5,2], V:[5,5,5,2,2], W:[5,5,7,7,5], X:[5,5,2,5,5], Y:[5,5,2,2,2],
  Z:[7,4,2,1,7], 'É':[7,1,3,1,7], 'È':[7,1,3,1,7], 'Ê':[7,1,3,1,7],
  '0':[2,5,5,5,2], '1':[2,3,2,2,7], '2':[3,4,2,1,7], '3':[3,4,2,4,3],
  '4':[5,5,7,4,4], '5':[7,1,3,4,3], '6':[6,1,3,5,2], '7':[7,4,2,2,2],
  '8':[2,5,2,5,2], '9':[2,5,6,4,3], '!':[2,2,2,0,2], '?':[3,4,2,0,2],
  '-':[0,0,7,0,0], "'":[2,2,0,0,0], '.':[0,0,0,0,2], ' ':[0,0,0,0,0]
};
function miniTexte(g,t,x,y,c,larg){
  t=(t||'').toUpperCase();
  var lp=4;                                   /* 3 de lettre, 1 d'espace */
  var n=Math.min(t.length, Math.max(1,Math.floor(larg/lp)));
  var dep=x+Math.max(0,Math.floor((larg-n*lp+1)/2));
  g.fillStyle=c;
  for(var i=0;i<n;i++){
    var m=MINI[t.charAt(i)];
    if(!m)continue;
    for(var r=0;r<5;r++){
      var v=m[r];
      if(v&1)g.fillRect(dep+i*lp,  y+r,1,1);
      if(v&2)g.fillRect(dep+i*lp+1,y+r,1,1);
      if(v&4)g.fillRect(dep+i*lp+2,y+r,1,1);
    }
  }
}
var TEXTE={pancarte:1, banderole:1};   /* ceux qui portent des lettres */
ACTEURS.slogan='';
ACTEURS.mots=[];     /* le slogan decoupe en mots de cinq lettres au plus */
ACTEURS.court='';    /* le mot le plus court : celui qui tient sur un carton */          /* ce que le joueur a ecrit, vide par defaut */

/* les accessoires : ce qui dit a quoi sert ce bonhomme dans la rue */
function pancarte(g,x,y,dos,f,p){
  var sau=PAS_SAU[f%6], Y=y+sau;
  var c=['#e8e4d8','#d8d2c0','#e0d4b8'][p.varia%3];
  P(g,x+4,Y-31,2,16,'#8a6a44');
  P(g,x-1,Y-41,12,11,c);
  P(g,x-1,Y-41,12,1,tein(c,0.8));
  if(ACTEURS.slogan){
    /* la pancarte ne porte que le premier mot : deux lignes de trois
       lettres sur onze pixels, c'est un gribouillis */
    miniTexte(g,ACTEURS.court,x-1,Y-39,'#2a3038',12);
    P(g,x+1,Y-32,8,1,ACTEURS.tissu||'#c03a30');
  }else{
    P(g,x+1,Y-38,9,2,'#2a3038'); P(g,x+1,Y-35,6,2,'#2a3038');
    P(g,x+1,Y-32,8,1,'#c03a30');
  }
}
function banderole(g,x,y,dos,f,p){
  var sau=PAS_SAU[f%6], Y=y+sau;
  P(g,x+4,Y-28,2,13,'#6a5a3e');
  var tis=ACTEURS.tissu||'#c03a30';
  P(g,x+5,Y-31,21,10,tis);
  P(g,x+5,Y-31,21,1,tein(tis,1.35));
  P(g,x+5,Y-22,21,1,tein(tis,0.7));
  /* LE SLOGAN. Sans slogan, deux bandes blanches — une banderole vierge
     se lit quand meme comme une banderole. */
  /* UN MOT PAR BANDEROLE, et la suivante porte le suivant : on lit la
     phrase en balayant le cortege, comme dans une vraie manif. Vingt et
     un pixels de tissu, c'est cinq caracteres — pas une phrase. */
  var mot=ACTEURS.mots.length?ACTEURS.mots[(p.varia||0)%ACTEURS.mots.length]:'';
  if(mot)miniTexte(g,mot,x+5,Y-29,'#f4ecd4',20);
  else{P(g,x+7,Y-28,15,2,'#f0e8d0'); P(g,x+7,Y-25,10,2,'#f0e8d0');}
}
function camera(g,x,y,dos,f,p){
  var sau=PAS_SAU[f%6], Y=y+sau;
  P(g,x+3,Y-20,6,5,'#1e2228'); P(g,x+8,Y-19,2,3,'#2e3640');
  P(g,x+9,Y-18,2,2,'#6ab0e0');
  P(g,x+3,Y-21,6,1,'#3a424c');
}
function bouclier(g,x,y,dos,f,p,c){
  var sau=PAS_SAU[f%6], Y=y+sau;
  var bx=dos?x+3:x-8;
  P(g,bx,Y-19,6,14,c);
  P(g,bx,Y-19,6,2,tein(c,1.4));
  P(g,bx+1,Y-17,4,9,'rgba(180,215,240,.34)');
  P(g,bx,Y-6,6,1,tein(c,0.62));
  P(g,bx+(dos?0:5),Y-19,1,14,tein(c,0.7));
}
function matraque(g,x,y,dos,f,p){
  var sau=PAS_SAU[f%6], Y=y+sau, bal=PAS_BAL[f%6];
  var mx=dos?x-5:x+5;
  P(g,mx,Y-11-bal,2,7,'#1e2228');
}

/* ---------------------------------------------------------------------
   L'ATLAS
   atlas[type][varia][vue 0=face 1=dos][pose 0..3]
   --------------------------------------------------------------------- */
ACTEURS.atlas={};
ACTEURS.pret=false;

function serie(type,nVar,fab){
  var T=[];
  for(var v=0;v<nVar;v++){
    var vv=[];
    for(var d=0;d<2;d++){
      var dd=[];
      for(var f=0;f<6;f++){
        (function(v,d,f){
          dd.push(cal(40,44,16,40,function(g,x,y){fab(g,x,y,d===1,f,v);}));
        })(v,d,f);
      }
      vv.push(dd);
    }
    T.push(vv);
  }
  ACTEURS.atlas[type]=T;
}

/* CHANGER LE SLOGAN REPEINT L'ATLAS. C'est quatre-vingts petites
   vignettes a refaire, soit quelques millisecondes une seule fois au
   depart de la partie — pas de quoi compliquer le rendu. */
ACTEURS.ecrire=function(txt,tissu){
  ACTEURS.slogan=(txt||'').slice(0,18);
  /* LE DECOUPAGE, fait une fois ici : le dessin ne fait plus que lire.
     Un mot trop long est coupe plutot que jete — mieux vaut CONDI que
     rien du tout sur un tissu de vingt et un pixels. */
  ACTEURS.mots=ACTEURS.slogan.toUpperCase().split(/\s+/)
    .filter(function(m){return m.length;}).map(function(m){return m.slice(0,5);});
  ACTEURS.court='';
  for(var q=0;q<ACTEURS.mots.length;q++){
    var m=ACTEURS.mots[q];
    if(m.length<=3&&(!ACTEURS.court||m.length>ACTEURS.court.length))ACTEURS.court=m;
  }
  if(!ACTEURS.court&&ACTEURS.mots.length)ACTEURS.court=ACTEURS.mots[0].slice(0,3);
  ACTEURS.tissu=tissu||'#c03a30';
  ACTEURS.pret=false;
  ACTEURS.preparer();
};
ACTEURS.preparer=function(){
  if(ACTEURS.pret)return;
  /* la foule : douze silhouettes differentes suffisent a ce qu'on ne
     voie plus de jumeaux dans un cortege de deux cents */
  serie('manif',12,function(g,x,y,dos,f,v){
    corps(g,x,y,dos,f,paletteManif(v));
  });
  serie('pancarte',5,function(g,x,y,dos,f,v){
    var p=paletteManif(v+3); p.varia=v;
    if(dos)pancarte(g,x,y,dos,f,p);
    corps(g,x,y,dos,f,p);
    if(!dos)pancarte(g,x,y,dos,f,p);
  });
  serie('banderole',3,function(g,x,y,dos,f,v){
    var p=paletteManif(v+7); p.varia=v;
    if(dos)banderole(g,x,y,dos,f,p);
    corps(g,x,y,dos,f,p);
    if(!dos)banderole(g,x,y,dos,f,p);
  });
  serie('presse',2,function(g,x,y,dos,f,v){
    var p=paletteManif(v+1); p.hau='#2a3038'; p.tet='casquette'; p.bon='#1e2228';
    corps(g,x,y,dos,f,p,{gilet:'#d8c83a'});
    camera(g,x,y,dos,f,p);
  });
  /* LE STREET MEDIC. Gilet blanc, croix rouge, casquette blanche : on
     doit le reperer dans deux cents personnes, et c'est pour ca qu'il
     est le seul en blanc. */
  serie('medic',2,function(g,x,y,dos,f,v){
    var p=paletteManif(v+5); p.hau='#e8e4da'; p.tet='casquette'; p.bon='#e8e4da';
    corps(g,x,y,dos,f,p,{gilet:'#f2efe6'});
    if(!dos)croix(g,x,y,f);
  });
  /* LE CASSEUR. Tout en sombre, capuche, visage couvert. La meme
     silhouette que les autres : c'est la tenue qui le distingue, pas
     une taille ou une posture — on n'est pas dans la caricature. */
  serie('casseur',4,function(g,x,y,dos,f,v){
    var p=paletteManif(v+2);
    p.hau=['#1e2228','#232832','#1a1d22','#262b34'][v%4];
    p.bas='#16181d'; p.tet='capuche'; p.bon=p.hau; p.chv='#15171b';
    corps(g,x,y,dos,f,p);
    if(!dos)masque(g,x,y,f);
  });
  /* le cordon : meme tenue pour tous, c'est le propre d'une unite ; la
     variation est dans la nuance du bouclier et la stature */
  serie('crs',3,function(g,x,y,dos,f,v){
    var p={pea:PEAU[v%3],hau:'#23262e',bas:'#1b1e25',tet:'casque',chv:'#1a1a1a',bon:'#2a2f38'};
    var bc=['#46566a','#4e5e72','#3e4e62'][v];
    if(dos)bouclier(g,x,y,dos,f,p,bc);
    corpsCRS(g,x,y,dos,f,p);
    matraque(g,x,y,dos,f,p);
    if(!dos)bouclier(g,x,y,dos,f,p,bc);
  });
  serie('officier',1,function(g,x,y,dos,f,v){
    var p={pea:PEAU[0],hau:'#272b34',bas:'#1b1e25',tet:'casque',chv:'#1a1a1a',bon:'#2a2f38'};
    corpsCRS(g,x,y,dos,f,p,true);
  });
  ACTEURS.pret=true;
};

/* la croix du medic, deux traits de deux pixels sur le gilet */
function croix(g,x,y,f){
  var sau=PAS_SAU[f%6], Y=y+sau;
  P(g,x-1,Y-17,4,2,'#d04a3a');
  P(g,x,Y-19,2,6,'#d04a3a');
}
/* le bas du visage couvert : une bande sombre a hauteur de bouche */
function masque(g,x,y,f){
  var sau=PAS_SAU[f%6], Y=y+sau;
  P(g,x-2,Y-24,5,2,'#101317');
}
function corpsCRS(g,x,y,dos,f,p,off){
  /* le cordon marche plus court : il avance en gardant la ligne */
  var ec=(PAS_EC[f%6]*0.7)|0, bal=(PAS_BAL[f%6]*0.6)|0, sau=PAS_SAU[f%6];
  ombre(g,x,y,5.4,2.4);
  var Y=y+sau;
  P(g,x-2+ec,Y-7,2,7,p.bas); P(g,x+1-ec,Y-7,2,7,tein(p.bas,0.86));
  P(g,x-3+ec,Y-3,3,3,'#15161a'); P(g,x+1-ec,Y-3,3,3,'#15161a');
  /* la protection : c'est elle qu'on reconnait de loin */
  P(g,x-4,Y-17,9,10,p.hau);
  P(g,x-4,Y-16,9,6,'#2e333d');
  P(g,x-4,Y-16,9,1,'#3e4654');
  P(g,x-4,Y-10,9,1,'#16181d');
  if(off){P(g,x-4,Y-14,9,2,'#c8a83a');}
  /* bras et epaulieres */
  P(g,x-6,Y-16+bal,2,8,p.hau); P(g,x+5,Y-16-bal,2,8,p.hau);
  P(g,x-6,Y-16,2,2,'#333942'); P(g,x+5,Y-16,2,2,'#333942');
  P(g,x-6,Y-9+bal,2,2,p.pea); P(g,x+5,Y-9-bal,2,2,p.pea);
  /* tete et casque a visiere */
  P(g,x-2,Y-22,5,6,p.pea);
  P(g,x-4,Y-24,9,4,'#2a2f38');
  P(g,x-4,Y-24,9,1,'#48505e');
  P(g,x-5,Y-21,11,1,'#1e222a');
  if(!dos){
    P(g,x-3,Y-20,7,3,'rgba(160,205,235,.45)');
    P(g,x-3,Y-20,7,1,'rgba(220,240,255,.62)');
  }else{
    P(g,x-3,Y-20,7,3,'#242932');
  }
}

/* ---------------------------------------------------------------------
   POSER UN ACTEUR
   dir 0..3 = vers +gx, +gy, -gx, -gy. Deux vues suffisent : on regarde
   le monde de face ou de dos, et le miroir fait les deux cotes.
   --------------------------------------------------------------------- */
/* UN ACTEUR QUI N'EST PAS UN HOMME. Un camion a eau n'a ni pose de
   marche ni vue de dos : c'est un seul dessin, mais il doit se trier
   avec les corps comme tout le reste. On l'enregistre dans le meme
   atlas, en marquant qu'il est fixe. */
ACTEURS.poserFixe=function(type,sprite){
  ACTEURS.fixes[type]=sprite;
};
ACTEURS.fixes={};

ACTEURS.dessine=function(g,a,px,py){
  var F=ACTEURS.fixes[a.type];
  if(F){g.drawImage(F.cv,(px-F.ox)|0,(py-F.oy)|0);return;}
  var T=ACTEURS.atlas[a.type]; if(!T)return;
  var V=T[a.varia%T.length];
  var dos=(a.dir===2||a.dir===3);
  /* UN PORTEUR DE TEXTE NE SE MIROITE PAS. Le miroir economise la
     moitie de l'atlas, mais il retourne aussi les lettres : on lisait
     NO sur la moitie des pancartes. Entre une silhouette de trois
     pixels tournee du mauvais cote et un slogan illisible, le choix
     est vite fait. */
  var mir=(a.dir===1||a.dir===2)&&!TEXTE[a.type];
  var S=V[dos?1:0][a.anim%6];
  if(mir){
    g.save();g.translate(px|0,py|0);g.scale(-1,1);
    g.drawImage(S.cv,-S.ox,-S.oy);g.restore();
  }else{
    g.drawImage(S.cv,(px-S.ox)|0,(py-S.oy)|0);
  }
};

window.CORDON_ACTEURS=ACTEURS;
})();
