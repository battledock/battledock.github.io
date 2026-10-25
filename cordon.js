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
var AV={y0:21,y1:26};        /* la chaussee de l'avenue */
var RU={x0:21,x1:25};        /* la chaussee de la rue transversale */
var TROT=2;                  /* largeur des trottoirs */

var SOL={CHAUS:0, TROT:1, CLOU:2, CANIV:3, ILOT:4, HERBE:5};

function faireCarte(d){
  var C={sol:[], bloc:[], haut:[]}, x, y;
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
  /* les passages clous, aux quatre branches de l'intersection */
  for(y=AV.y0;y<=AV.y1;y++){
    C.sol[y][RU.x0-TROT-1]=SOL.CLOU; C.sol[y][RU.x1+TROT+1]=SOL.CLOU;
  }
  for(x=RU.x0;x<=RU.x1;x++){
    C.sol[AV.y0-TROT-1][x]=SOL.CLOU; C.sol[AV.y1+TROT+1][x]=SOL.CLOU;
  }
  /* le caniveau : la derniere rangee de chaussee contre le trottoir */
  for(x=0;x<GW;x++){
    if(C.sol[AV.y0][x]===SOL.CHAUS)C.sol[AV.y0][x]=SOL.CANIV;
    if(C.sol[AV.y1][x]===SOL.CHAUS)C.sol[AV.y1][x]=SOL.CANIV;
  }
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
  function pose(x0,y0,x1,y1){
    if(x0<0||y0<0||x1>=GW||y1>=GH)return;
    var h=d.e(48,116);
    var st=d.pick(['pierre','brique','crepi','moderne','vieux']);
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
    var hh=d.e(22,58), st2=d.pick(['vieux','brique','crepi']);
    var b2={x0:x,y0:y,x1:x+w-1,y1:y+p2-1,h:hh,style:st2,g:d.e(1,2000000)};
    B.push(b2);
    for(j=y;j<y+p2;j++)for(i=x;i<x+w;i++){C.bloc[j][i]=1;C.haut[j][i]=hh;}
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
  bandes:'#c8c4a8'
};

function peindreSol(C,d){
  var cv=document.createElement('canvas');
  cv.width=MW; cv.height=MH+TH;
  var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
  var x,y,p,t;
  for(y=0;y<GH;y++)for(x=0;x<GW;x++){
    p=m2e(x,y); t=C.sol[y][x];
    var v=((x*7+y*13)%3);
    if(t===SOL.CHAUS)los(g,p.x,p.y,PAL.chaus[v]);
    else if(t===SOL.CANIV)los(g,p.x,p.y,PAL.caniv);
    else if(t===SOL.CLOU)los(g,p.x,p.y,PAL.chaus[v]);
    else if(t===SOL.TROT)los(g,p.x,p.y,PAL.trot[v]);
    else if(t===SOL.HERBE)los(g,p.x,p.y,PAL.herbe[v]);
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
  /* les dalles du trottoir */
  g.globalAlpha=0.16;
  for(y=0;y<GH;y++)for(x=0;x<GW;x++){
    if(C.sol[y][x]!==SOL.TROT)continue;
    p=m2e(x,y); g.strokeStyle='#ffffff'; g.lineWidth=1;
    g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+TW/2,p.y+TH/2);
    g.moveTo(p.x,p.y);g.lineTo(p.x-TW/2,p.y+TH/2);g.stroke();
  }
  g.globalAlpha=1;
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
var STYLES={
  pierre: {mur:'#a8a094', toit:'#6a6258', cadre:'#c8c0b0', soc:'#7e766c'},
  brique: {mur:'#8a5244', toit:'#5a4038', cadre:'#c0a894', soc:'#6a3e34'},
  crepi:  {mur:'#c2b49a', toit:'#7a6e5e', cadre:'#e0d6c0', soc:'#8e8470'},
  moderne:{mur:'#7e8894', toit:'#4e565e', cadre:'#aab4c0', soc:'#5e666e'},
  vieux:  {mur:'#9a8e7e', toit:'#60584c', cadre:'#b8ac98', soc:'#70685c'}
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
  /* l'ombre portee au sol, vers la droite-bas */
  g.globalAlpha=0.3; g.fillStyle='#000';
  g.beginPath();
  g.moveTo(D.x+5,D.y+3);g.lineTo(C.x+5,C.y+3);g.lineTo(B.x+5,B.y+3);
  g.lineTo(B.x+13,B.y+7);g.lineTo(C.x+13,C.y+7);g.lineTo(D.x+13,D.y+7);
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
  var bx=GW-14;
  for(y=AV.y0;y<=AV.y1;y++){
    poser('barriere',bx+0.1,y+0.05,true);
    if(C.bloc[y])C.bloc[y][bx]=1;
  }
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
  if(!PRET){faireObjets(s.nuit);faireVehicules(s.nuit);fairePerso();PRET=true;}
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
  s.statiques=[];
  s.bats.forEach(function(b){if(b.vu)s.statiques.push({k:'bat',b:b,prof:b.prof});});
  s.objs.forEach(function(o){s.statiques.push({k:'obj',o:o,prof:o.prof});});
  s.statiques.sort(function(a,b){return a.prof-b.prof;});
  peupler(s);
  var p=m2e((s.front+GW-16)/2, (AV.y0+AV.y1)/2+0.5);
  s.cam.x=p.x; s.cam.y=p.y;
  s.cam.z=s.cam.zmin;
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
  var tete=GW-16-11;
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
      if(bi===0&&i<3){t='banderole';va=d.e(0,2);ex=-0.6+i*0.9;ey=(i-1)*1.1;}
      else if(d.f()<0.09){t='pancarte';va=d.e(0,4);}
      else if(d.f()<0.03){t='presse';va=d.e(0,1);}
      FOULE.poser(sim,G,tete-B.dec+ex,midY+ey,{
        ex:ex, ey:ey, varia:va,
        vmax:R.vMarche*(0.86+d.f()*0.3),
        /* LE TEMPERAMENT, tire une fois. Les plus nerveux sont devant :
           c'est de la tete du cortege que part la panique, comme dans
           la rue. */
        nerf:(0.55+d.f()*1.1)*(bi===0?1.25:1),
        stress:d.f()*0.10
      });
      sim.agents[sim.agents.length-1].type=t;
    }
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
  s.mobile=GM;

  /* ---- LE CORDON : trois unites en ligne, une en reserve */
  s.unites=[];
  var bar=GW-16;
  [[bar,midY-2.4,10],[bar,midY+0.4,10],[bar,midY+3.2,8]].forEach(function(u,ui){
    /* cap +π/2 : le « devant » de la figure, (−sin, +cos), pointe vers
       −x, c'est-a-dire vers le cortege qui remonte l'avenue */
    var G=FOULE.groupe(sim,{type:'crs',form:'ligne',ax:u[0],ay:u[1],
                            cap:Math.PI/2,cohesion:0,seuil:2.6});
    G.nom='LIGNE '+(ui+1); G.route=null; G.ri=0;
    G.champ=new FOULE.Champ(sim);
    for(var i=0;i<u[2];i++)
      FOULE.poser(sim,G,u[0]+1.2+(i%3)*0.5,u[1]+((i/3)|0)*0.6,
        {varia:i%3, vmax:R.vMarche*1.0, r:0.33, masse:1.8, nerf:0.4});
    sim.agents[G.membres[0]].type='officier';
    sim.agents[G.membres[0]].varia=0;
    s.unites.push(G);
  });
  var GR=FOULE.groupe(sim,{type:'crs',form:'colonne',ax:bar+5,ay:midY+0.5,
                           cap:Math.PI/2,cohesion:0});
  GR.nom='RÉSERVE'; GR.route=null; GR.ri=0;
  GR.champ=new FOULE.Champ(sim);
  for(var i2=0;i2<8;i2++)
    FOULE.poser(sim,GR,bar+5+(i2%2)*0.6,midY+0.5+((i2/2)|0)*0.7,
      {varia:i2%3, vmax:R.vMarche*1.05, r:0.33, masse:1.8, nerf:0.4});
  sim.agents[GR.membres[0]].type='officier';
  s.unites.push(GR);
  s.sel=0;
  s.sim=sim;
  s.front=tete;
}

/* LE CORTEGE AVANCE TANT QU'IL PEUT. La tete monte vers le barrage et
   s'arrete a l'endroit ou elle touche la premiere ligne : c'est ce
   contact, et pas une minuterie, qui decide ou le cortege se fige. */
function majCortege(s,dt){
  if(!s.sim)return;
  var mur=1e9;
  s.unites.forEach(function(U){
    U.membres.forEach(function(i){var a=s.sim.agents[i];if(a.x<mur)mur=a.x;});
  });
  var arret=mur-1.5;
  /* LES POUSSEES. Un cortege au contact ne reste pas immobile : il
     pousse par vagues, se relache, repousse. Toutes les huit secondes,
     la tete gagne une tuite d'un coup puis reflue — c'est ce battement
     qui fait qu'une foule arretee reste vivante. */
  s.vague=(s.vague||0)+dt;
  if(!(s.pousse>0))s.pousse=0;   /* sinon la premiere image multiplie par undefined */
  if(s.vague>7600){s.vague=0;s.pousse=1;}
  if(s.pousse>0)s.pousse=Math.max(0,s.pousse-dt*0.00042);
  var elan=0.0016+0.0042*s.pousse;
  var vise=Math.min(arret+1.1*s.pousse, s.front+elan*dt);
  s.front=vise;
  var resp=Math.sin(s.sim.t*0.00045);
  s.corteges.forEach(function(G,gi){
    G.ax=s.front-G.base;
    /* la respiration laterale : le bloc roule doucement d'un bord de la
       chaussee a l'autre, comme une foule qui se tasse et se detasse */
    G.ay=((AV.y0+AV.y1)/2+0.5)+Math.sin(s.sim.t*0.00038+gi*1.7)*0.42;
  });
  s.presse.ax=Math.min(arret-1, s.front+1.5);
  /* la navette : elle remonte a la tete, puis redescend a la queue */
  var GM=s.mobile;
  if(GM){
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
function majUnites(s,dt){
  if(!s.sim)return;
  s.unites.forEach(function(U){
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

function dessineObjet(g,o,s){
  var S=OBJ[o.t]||VEH[o.t]; if(!S)return;
  var p=m2e(o.gx,o.gy);
  g.drawImage(S.cv, Math.round(p.x-S.ox), Math.round(p.y-S.oy));
}

var CO_REC2=0;
var M={
  nom:'Le Cordon', sous:'LA RUE · GLISSE, PINCE, MARCHE',
  manches:null, vise:400,
  init:function(){
    return {phase:'pret', t:0, score:0, L:200, H:400,
            cam:{x:MW/2, y:MH/2, z:0.75, zmin:0.75, zmax:2},
            heure:'jour', graine:0, pret:false,
            C:null, bats:[], objs:[], statiques:[], sol:null, j:null,
            mot:'', motT:0, sim:null, unites:null, corteges:null,
            sel:0, front:0, pression:0, tension:0, vus:[],
            diag:false, flash:null,
            /* LA DENSITE, mesuree : 190 corps a 58 images, 354 a 56,
               504 a 55, 654 a 54. Le cout est lineaire — la grille de
               voisinage tient ses promesses — et c'est le dessin, pas
               la simulation, qui pese. Deux, c'est une avenue pleine
               sans rien sacrifier. */
            densite:2};
  },
  cadre:function(s,L,H){s.L=L;s.H=H;if(s.pret)camBornes(s);},
  demarrer:function(s){
    s.graine=(Math.random()*2000000)|0;
    s.heure=['jour','jour','soir','nuit'][(Math.random()*4)|0];
    preparer(s);
    s.mot='GLISSE POUR REGARDER · PINCE POUR ZOOMER · TAPE POUR MARCHER';
    s.motT=5200;
  },
  pas:function(s,dt){
    if(!s.pret)return;
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(!s.sim)return;
    majCortege(s,dt);
    majUnites(s,dt);
    FOULE.pas(s.sim,dt);
  },
  /* ------------------------------------------------- le rendu ------- */
  dessine:function(s,L,H){
    s.L=L;s.H=H;
    var g=G;
    if(!s.cielG||s.cielH!==H){
      s.cielG=g.createLinearGradient(0,0,0,H);
      var c=s.nuit?['#0a1020','#141c30']:(s.heure==='soir'?['#3a2838','#6a4a3a']:['#4a6e92','#8aa8c0']);
      s.cielG.addColorStop(0,c[0]);s.cielG.addColorStop(1,c[1]);s.cielH=H;
    }
    g.fillStyle=s.cielG;g.fillRect(0,0,L,H);
    fondLointain(s,L,H);
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
    /* L'UNITE CHOISIE, marquee AU SOL : sous les volumes, donc cachee
       comme elle quand un immeuble passe devant. Posees apres le decor,
       ces marques se voyaient sur les toits. */
    var U0=s.unites&&s.unites[s.sel];
    if(U0){
      var pu=m2e(U0.ax,U0.ay);
      g.strokeStyle='rgba(120,230,255,.85)';g.lineWidth=1;
      g.beginPath();g.ellipse(pu.x,pu.y+TH/2,11,5.5,0,0,7);g.stroke();
      g.strokeStyle='rgba(120,230,255,.42)';
      for(var mu=0;mu<U0.membres.length;mu++){
        var am=s.sim.agents[U0.membres[mu]], pm=m2e(am.x,am.y);
        g.beginPath();g.ellipse(pm.x,pm.y,5,2.5,0,0,7);g.stroke();
      }
    }
    if(U0&&U0.route&&U0.route.length){
      g.strokeStyle='rgba(120,230,255,.45)';g.lineWidth=1;
      g.beginPath();
      for(var q=U0.ri;q<U0.route.length;q++){
        var pq=m2e(U0.route[q][0],U0.route[q][1]);
        if(q===U0.ri)g.moveTo(pq.x,pq.y+TH/2);else g.lineTo(pq.x,pq.y+TH/2);
      }
      g.stroke();
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
      var ag=A[k], pa=m2e(ag.x,ag.y);
      if(pa.x<x0-30||pa.x>x1+30||pa.y<y0-60||pa.y>y1+30)continue;
      ag._px=pa.x; ag._py=pa.y; ag._p=ag.x+ag.y;
      vus.push(ag);
    }
    vus.sort(function(p,q){return p._p-q._p;});
    var vi=0, nv=vus.length;
    var i,e;
    for(i=0;i<s.statiques.length;i++){
      e=s.statiques[i];
      while(vi<nv&&vus[vi]._p<=e.prof){ACTEURS.dessine(g,vus[vi],vus[vi]._px,vus[vi]._py);vi++;}
      if(e.k==='bat'){
        var b=e.b;
        if(b.ox>x1||b.ox+b.cv.width<x0||b.oy>y1||b.oy+b.cv.height<y0)continue;
        g.drawImage(b.cv,Math.round(b.ox),Math.round(b.oy));
      }else{
        var o=e.o, S2=OBJ[o.t]||VEH[o.t]; if(!S2)continue;
        var p=m2e(o.gx,o.gy), ox=p.x-S2.ox, oy=p.y-S2.oy;
        if(ox>x1||ox+S2.cv.width<x0||oy>y1||oy+S2.cv.height<y0)continue;
        g.drawImage(S2.cv,Math.round(ox),Math.round(oy));
      }
    }
    while(vi<nv){ACTEURS.dessine(g,vus[vi],vus[vi]._px,vus[vi]._py);vi++;}
    if(s.diag)diagnostic(g,s,vus);
    /* le point de chute de la derniere grenade, deux secondes */
    if(s.flash){
      s.flash[2]+=16;
      if(s.flash[2]>2000)s.flash=null;
      else{
        var pf=m2e(s.flash[0],s.flash[1]), al=1-s.flash[2]/2000;
        g.strokeStyle='rgba(255,230,150,'+al.toFixed(2)+')';g.lineWidth=1;
        g.beginPath();g.ellipse(pf.x,pf.y+TH/2,8+s.flash[2]*0.03,
          (8+s.flash[2]*0.03)*0.5,0,0,7);g.stroke();
      }
    }
    g.restore();
    /* LE VOILE DE L'HEURE : pose apres la scene et avant le bandeau,
       pour que le texte reste lisible la nuit */
    if(s.nuit){g.fillStyle='rgba(12,18,34,.42)';g.fillRect(0,0,L,H);}
    else if(s.heure==='soir'){g.fillStyle='rgba(60,30,20,.16)';g.fillRect(0,0,L,H);}
    hud(s,L,H);
  },
  /* ------------------------------------------------- le doigt ------- */
  tape:function(s,x,y){
    if(!s.pret)return;
    var z=s.cam.z;
    var ex=(x-s.L/2)/z+s.cam.x, ey=(y-s.H/2)/z+s.cam.y;
    var gx=Math.floor(e2mx(ex,ey)), gy=Math.floor(e2my(ex,ey));
    if(gx<0||gy<0||gx>=GW||gy>=GH){s.mot='HORS DE LA CARTE';s.motT=1100;return;}
    var U=s.unites&&s.unites[s.sel]; if(!U)return;
    var r=chemin(s.C,Math.floor(U.ax),Math.floor(U.ay),gx,gy);
    if(!r){s.mot='PAS DE PASSAGE PAR LA';s.motT=1300;return;}
    U.route=r;U.ri=0;
    U.champ.calculer(s.sim,[[gx,gy]]);
    /* priorite 3 : un deplacement chasse une reaction a la densite */
    FOULE.ordre(s.sim,U,'vers',0,3);
    s.mot=U.nom+' · EN MARCHE';s.motT=1400;
  },
  glisse:function(s,x,y,dx,dy){
    if(!s.pret||s.pince)return;
    s.camLibre=true;
    s.cam.x-=dx/s.cam.z; s.cam.y-=dy/s.cam.z;
    camBornes(s);
  },
  /* DEUX DOIGTS. Le shell appelle ceci avec le rapport des ecartements
     et le milieu des deux doigts : on zoome AUTOUR de ce milieu, pas
     autour du centre de l'ecran, sinon la rue fuit sous les doigts. */
  pince:function(s,fac,cx,cy,fini){
    if(!s.pret)return;
    if(fini){s.pince=false;camAimante(s);camBornes(s);return;}
    s.pince=true;s.camLibre=true;
    var z0=s.cam.z;
    var z=Math.max(s.cam.zmin,Math.min(s.cam.zmax,z0*fac));
    /* le point du monde sous le milieu des doigts ne doit pas bouger */
    var mx=(cx-s.L/2), my=(cy-s.H/2);
    s.cam.x+=mx/z0-mx/z; s.cam.y+=my/z0-my/z;
    s.cam.z=z; camBornes(s);
  },
  actions:function(s){
    if(s.phase!=='jeu')return '<button data-a="commencer">DESCENDRE DANS LA RUE · 1 €</button>';
    return '<button data-a="unite">UNITÉ</button><button data-a="form">FORME</button>'+
           '<button data-a="avance">AVANCE</button><button data-a="choc">GAZ</button>'+
           '<button data-a="diag" class="'+(s.diag?'pr':'')+'">DIAG</button>';
  },
  action:function(s,a){
    if(!s.pret||!s.unites)return;
    var U=s.unites[s.sel];
    if(a==='unite'){
      s.sel=(s.sel+1)%s.unites.length;
      s.mot=s.unites[s.sel].nom+' · SÉLECTIONNÉE';s.motT=1400;
    }
    else if(a==='form'){
      var L=['ligne','coin','colonne','nasse'];
      U.form=L[(L.indexOf(U.form)+1)%L.length];
      s.mot=U.nom+' · '+U.form.toUpperCase();s.motT=1400;
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
  /* la brume qui mange le pied des silhouettes */
  if(!s.brume||s.brumeH!==H){
    s.brume=g.createLinearGradient(0,hy+60,0,hy+140);
    var c=s.nuit?'10,16,30':(s.heure==='soir'?'70,46,40':'126,152,174');
    s.brume.addColorStop(0,'rgba('+c+',0)');
    s.brume.addColorStop(0.6,'rgba('+c+',.85)');
    s.brume.addColorStop(1,'rgba('+c+',1)');
    s.brumeH=H;
  }
  g.fillStyle=s.brume;g.fillRect(0,hy+60,L,H-hy-60);
  g.restore();
}

/* =====================================================================
   LE DIAGNOSTIC
   Temporaire, et c'est voulu : il sert a repondre a « pourquoi celui-la
   fait ca ». Chaque corps porte son etat, un trait vers sa destination,
   et une couleur par groupe. Au-dessus, le stress en barre. Un bouton
   l'allume et l'eteint — il ne coute rien quand il est eteint.
   ===================================================================== */
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
function hud(s,L,H){
  var g=G;
  g.fillStyle='rgba(8,12,20,.62)';g.fillRect(0,0,L,13);
  g.fillStyle='#9ae8ff';g.font='7px ui-monospace,monospace';g.textBaseline='middle';
  g.textAlign='left';
  /* le bouton retour occupe le coin : le nom de rue commence apres */
  g.fillText(L>250?'AV. DE LA RÉPUBLIQUE':'AV. RÉPUBLIQUE',22,7);
  g.textAlign='right';
  g.fillText({jour:'10 H 20',soir:'19 H 40',nuit:'23 H 10'}[s.heure]+'  ×'+(Math.round(s.cam.z*100)/100),L-4,7);
  if(s.unites&&s.unites[s.sel]){
    var U=s.unites[s.sel];
    g.fillStyle='rgba(8,12,20,.62)';g.fillRect(0,13,L,11);
    g.fillStyle='#7ae8ff';g.textAlign='left';
    var et=s.sim?(s.sim.agents[U.membres[0]].etat):'';
    g.fillText(U.nom+' · '+U.form.toUpperCase()+' · '+(DIAG_AB[et]||et),22,19);
    g.textAlign='right';
    var T=s.sim?s.sim.tension:0;
    g.fillStyle=T>0.55?'#ff9a7a':'#9ae8ff';
    g.fillText(L>250?('TENSION '+(T*100|0)+'%  ·  AU CONTACT '+s.pression+
                      '  ·  PANIQUE '+(s.sim?s.sim.paniques:0))
                    :((T*100|0)+'% · '+s.pression+' · '+(s.sim?s.sim.paniques:0)),L-4,19);
  }
  if(s.motT>0){
    g.textAlign='center';
    var t=s.mot, w=g.measureText(t).width+10;
    /* un mot plus large que l'ecran se coupe en deux lignes : tronque,
       une consigne qui finit par « TAPE POUR » n'apprend rien */
    var l2=null;
    if(w>L-8){
      var c=t.split(' · '); var m=Math.ceil(c.length/2);
      t=c.slice(0,m).join(' · '); l2=c.slice(m).join(' · ');
      w=Math.max(g.measureText(t).width,g.measureText(l2).width)+10;
    }
    /* au-dessus des boutons flottants quand il y a la place, sous le
       bandeau sinon : jamais par-dessus l'un ou l'autre */
    var bas=(H>150), y0=bas?H-(l2?72:62):(l2?27:27);
    g.fillStyle='rgba(8,12,20,.7)';
    g.fillRect((L-w)/2,y0,w,l2?22:12);
    g.fillStyle='#ffe28a';
    g.fillText(t,L/2,y0+6);
    if(l2)g.fillText(l2,L/2,y0+16);
  }
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
