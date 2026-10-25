/* =====================================================================
   LE CORDON — LA FOULE

   DEUX MOITIES QUI NE SE PARLENT PAS.

   FOULE   : la simulation. Des nombres, rien d'autre. Elle ignore
             qu'il existe des images, des couleurs et un ecran. On peut
             la faire tourner mille pas en une boucle pour l'equilibrer,
             sans jamais ouvrir un canvas.
   ACTEURS : les images. Un atlas de sprites et une fonction qui pose
             le bon dessin a la bonne place. Elle ignore qu'il existe
             des forces, des groupes et des ordres.

   Le seul pont entre les deux est l'agent : il porte x, y, dir et anim.
   Remplacer les sprites temporaires par des vrais ne touchera donc pas
   une ligne de simulation, et changer la simulation ne touchera pas un
   pixel.
   ===================================================================== */
(function(){
'use strict';

/* =====================================================================
   PREMIERE MOITIE — LA SIMULATION
   ===================================================================== */
var FOULE={};

/* les reglages, groupes en un seul endroit : c'est la qu'on equilibre */
var R={
  r:        0.30,    /* rayon d'un corps, en tuiles */
  vMarche:  0.0021,  /* tuiles par milliseconde */
  vPresse:  0.0032,
  vCharge:  0.0042,
  acc:      0.000020,
  frein:    0.000030,
  sepF:     0.000085, /* la poussee entre deux corps au contact */
  murF:     0.000160,
  cohF:     0.0000090,
  bruitF:   0.0000026
};
FOULE.R=R;

function cl(v,a,b){return v<a?a:(v>b?b:v);}

/* ---------------------------------------------------------------------
   LA GRILLE DE VOISINAGE
   Chercher les voisins de trois cents corps en comparant chacun a tous
   les autres, c'est quatre-vingt-dix mille distances par image. On range
   donc les corps dans des cases d'une tuile : un corps ne regarde que
   les neuf cases autour de lui, soit une dizaine de voisins.
   --------------------------------------------------------------------- */
function Grille(w,h){
  this.w=w;this.h=h;this.bac=new Array(w*h);
  for(var i=0;i<w*h;i++)this.bac[i]=[];
}
Grille.prototype.vider=function(){
  for(var i=0;i<this.bac.length;i++)if(this.bac[i].length)this.bac[i].length=0;
};
Grille.prototype.poser=function(a,i){
  var x=a.x|0, y=a.y|0;
  if(x<0||y<0||x>=this.w||y>=this.h)return;
  this.bac[y*this.w+x].push(i);
};
Grille.prototype.autour=function(a,out){
  out.length=0;
  var x=a.x|0, y=a.y|0, i, j, b, k;
  for(j=y-1;j<=y+1;j++){
    if(j<0||j>=this.h)continue;
    for(i=x-1;i<=x+1;i++){
      if(i<0||i>=this.w)continue;
      b=this.bac[j*this.w+i];
      for(k=0;k<b.length;k++)out.push(b[k]);
    }
  }
  return out;
};

/* ---------------------------------------------------------------------
   LES FORMATIONS
   Une unite organisee ne va pas « vers un point » : chacun de ses
   hommes va vers SA place dans la figure. C'est la seule difference
   entre une escouade et un attroupement, et elle tient en trois lignes.
   --------------------------------------------------------------------- */
var FORM={
  /* une ligne en travers de la rue, deux rangs si l'unite est fournie */
  /* UNE LIGNE DOIT BARRER LA RUE. Premiere version : neuf hommes par
     rang a 0,78 d'ecart, soit trois tuiles — l'avenue en fait six, on
     passait a cote. Douze par rang a 0,66 : dix hommes tiennent six
     tuiles, et la ligne barre vraiment. */
  ligne:function(n,i,ax,ay){
    var parRang=Math.ceil(n/Math.ceil(n/12)), rang=(i/parRang)|0, col=i%parRang;
    var dec=(parRang-1)/2;
    return {u:(col-dec)*0.66, v:-rang*0.78};
  },
  /* un coin, pour fendre */
  coin:function(n,i,ax,ay){
    var rang=Math.floor((Math.sqrt(8*i+1)-1)/2), deb=rang*(rang+1)/2;
    var col=i-deb;
    return {u:(col-rang/2)*0.80, v:-rang*0.70};
  },
  /* une colonne, pour se deplacer */
  colonne:function(n,i){
    return {u:((i%2)-0.5)*0.80, v:-((i/2)|0)*0.82};
  },
  /* une nasse : deux ailes qui enveloppent */
  nasse:function(n,i){
    var moitie=Math.ceil(n/2), cote=i<moitie?-1:1, k=i<moitie?i:i-moitie;
    var m=Math.max(1,moitie-1);
    return {u:cote*(1.2+k*0.30), v:-(k/m)*3.4};
  }
};
FOULE.FORM=FORM;

/* ---------------------------------------------------------------------
   LA CONSTRUCTION
   --------------------------------------------------------------------- */
FOULE.creer=function(o){
  var S={
    GW:o.GW, GH:o.GH, bloc:o.bloc, AV:o.AV, RU:o.RU,
    agents:[], groupes:[], t:0,
    grille:new Grille(o.GW,o.GH),
    tmp:[], gr:(o.graine||12345),
    front:o.front||0, pression:0, tension:0
  };
  S.al=function(){S.gr=(S.gr*16807)%2147483647;return (S.gr-1)/2147483646;};
  return S;
};

/* un groupe : des agents, une destination, une figure, une allure */
FOULE.groupe=function(S,o){
  var G={
    id:S.groupes.length, type:o.type, form:o.form||null,
    ax:o.ax, ay:o.ay,          /* la destination du groupe */
    cap:o.cap||0,              /* le cap de la figure, en radians ecran */
    allure:o.allure||'marche',
    membres:[], cohesion:(o.cohesion===undefined?1:o.cohesion),
    etat:'tient', meneur:-1
  };
  S.groupes.push(G);
  return G;
};

FOULE.poser=function(S,G,x,y,o){
  o=o||{};
  var a={
    i:S.agents.length, g:G.id, type:G.type,
    x:x, y:y, vx:0, vy:0,
    r:o.r||R.r, masse:o.masse||1,
    vmax:o.vmax||R.vMarche,
    /* ce que le rendu lira, et rien de plus */
    dir:0, anim:0, pas:0,
    /* ce qui fait que deux corps ne sont pas le meme */
    varia:o.varia|0, accessoire:o.accessoire||null,
    slot:G.membres.length,
    /* l'ecart propre : la place d'un corps DANS son groupe quand le
       groupe n'a pas de figure. Fixe une fois pour toutes, c'est lui
       qui fait qu'un cortege garde sa forme en avancant au lieu de se
       melanger a chaque pas. */
    ex:(o.ex||0), ey:(o.ey||0),
    cx:x, cy:y, fx:0, fy:0, v:0
  };
  G.membres.push(a.i);
  S.agents.push(a);
  return a;
};

/* ---------------------------------------------------------------------
   OU CHACUN DOIT ALLER
   La cible d'un agent organise sort de la figure de son groupe ; celle
   d'un agent de foule sort de la position du groupe, avec son ecart
   propre. Dans les deux cas elle est CALCULEE, jamais tiree au sort :
   une foule qui erre au hasard se voit tout de suite.
   --------------------------------------------------------------------- */
function majCibles(S){
  for(var k=0;k<S.groupes.length;k++){
    var G=S.groupes[k], n=G.membres.length;
    var c=Math.cos(G.cap), si=Math.sin(G.cap);
    for(var m=0;m<n;m++){
      var a=S.agents[G.membres[m]];
      if(G.form){
        var p=FORM[G.form](n,a.slot,G.ax,G.ay);
        /* u le long de la figure, v vers l'arriere : on tourne les deux
           selon le cap, et la place se pose dans le monde */
        a.cx=G.ax + p.u*c - p.v*si;
        a.cy=G.ay + p.u*si + p.v*c;
      }else{
        a.cx=G.ax + a.ex;
        a.cy=G.ay + a.ey;
      }
    }
  }
}

/* ---------------------------------------------------------------------
   UN PAS DE SIMULATION
   Trois forces et une integration. L'ordre compte : on calcule tout a
   partir des positions du debut du pas, puis on bouge tout le monde.
   Deplacer au fur et a mesure donne un avantage aux premiers de la
   liste, et la foule derive vers un coin sans qu'on comprenne pourquoi.
   --------------------------------------------------------------------- */
FOULE.pas=function(S,dt){
  dt=Math.min(40,dt);
  S.t+=dt;
  majCibles(S);
  var A=S.agents, n=A.length, i, j, a, b;
  /* 1. le voisinage */
  S.grille.vider();
  for(i=0;i<n;i++)S.grille.poser(A[i],i);
  /* 2. les forces */
  var vois=S.tmp;
  for(i=0;i<n;i++){
    a=A[i];
    var fx=0, fy=0;
    /* --- arriver sur sa place : on freine en approchant, sinon on
           oscille autour du point comme un ressort --- */
    var dx=a.cx-a.x, dy=a.cy-a.y, d=Math.sqrt(dx*dx+dy*dy);
    if(d>0.0001){
      var vise=a.vmax;
      if(d<1.1)vise=a.vmax*(d/1.1);
      var sx=dx/d*vise, sy=dy/d*vise;
      fx+=(sx-a.vx)*R.acc/R.vMarche;
      fy+=(sy-a.vy)*R.acc/R.vMarche;
    }else{
      fx-=a.vx*R.frein/R.vMarche; fy-=a.vy*R.frein/R.vMarche;
    }
    /* --- la separation : un corps pousse ses voisins --- */
    S.grille.autour(a,vois);
    var coh=0, cx2=0, cy2=0;
    for(j=0;j<vois.length;j++){
      if(vois[j]===i)continue;
      b=A[vois[j]];
      var ex=a.x-b.x, ey=a.y-b.y, e2=ex*ex+ey*ey;
      var min=a.r+b.r;
      if(e2<min*min&&e2>1e-8){
        var e=Math.sqrt(e2), pen=(min-e)/min;
        fx+=ex/e*pen*R.sepF; fy+=ey/e*pen*R.sepF;
      }
      if(b.g===a.g&&e2<4){coh++;cx2+=b.x;cy2+=b.y;}
    }
    /* --- la cohesion : rester avec les siens --- */
    var G=S.groupes[a.g];
    if(coh>0&&G.cohesion>0){
      cx2/=coh; cy2/=coh;
      fx+=(cx2-a.x)*R.cohF*G.cohesion;
      fy+=(cy2-a.y)*R.cohF*G.cohesion;
    }
    /* --- les murs : une tuile bloquee repousse ce qui l'approche --- */
    var tx=a.x|0, ty=a.y|0, ox, oy;
    for(oy=-1;oy<=1;oy++)for(ox=-1;ox<=1;ox++){
      var qx=tx+ox, qy=ty+oy;
      if(qx<0||qy<0||qx>=S.GW||qy>=S.GH){ /* le bord de carte repousse aussi */
        fx-=ox*R.murF*0.5; fy-=oy*R.murF*0.5; continue;
      }
      if(!S.bloc[qy][qx])continue;
      /* le point de la tuile le plus proche du corps */
      var px=cl(a.x,qx,qx+1), py=cl(a.y,qy,qy+1);
      var gx=a.x-px, gy=a.y-py, g2=gx*gx+gy*gy;
      if(g2<a.r*a.r*2.6){
        var gl=Math.sqrt(g2)||0.0001;
        var f=(1-gl/(a.r*1.62))*R.murF;
        if(f>0){fx+=gx/gl*f; fy+=gy/gl*f;}
      }
    }
    /* --- un grain de bruit : sans lui deux corps parfaitement alignes
           restent bloques l'un contre l'autre indefiniment --- */
    fx+=(S.al()-0.5)*R.bruitF; fy+=(S.al()-0.5)*R.bruitF;
    a.fx=fx; a.fy=fy;
  }
  /* 3. l'integration, pour tout le monde en meme temps */
  for(i=0;i<n;i++){
    a=A[i];
    a.vx+=a.fx*dt; a.vy+=a.fy*dt;
    var v=Math.sqrt(a.vx*a.vx+a.vy*a.vy), vm=a.vmax*1.35;
    if(v>vm){a.vx=a.vx/v*vm; a.vy=a.vy/v*vm; v=vm;}
    a.x+=a.vx*dt; a.y+=a.vy*dt;
    /* le mur reste un mur : la force amortit, le clamp tranche */
    glisser(S,a);
    a.x=cl(a.x,0.2,S.GW-0.2); a.y=cl(a.y,0.2,S.GH-0.2);
    /* ce que le rendu lira */
    if(v>a.vmax*0.12){
      var ex2=(a.vx-a.vy), ey2=(a.vx+a.vy);  /* la vitesse vue a l'ecran */
      a.dir=(ey2>0)?((ex2>0)?0:1):((ex2>0)?3:2);
      a.pas+=v*dt*2.0;
      a.anim=((a.pas|0)%4);
    }else{a.anim=0;}
    a.v=v;
  }
};

/* UN CORPS NE TRAVERSE PAS UN MUR. La force de repulsion suffit presque
   toujours ; presque, c'est ce qui fait qu'on voit un manifestant dans
   une vitrine une fois toutes les deux minutes. On repousse donc hors
   de la tuile, du cote le moins profond : le corps glisse le long du
   mur au lieu de s'y coller. */
function glisser(S,a){
  var tx=a.x|0, ty=a.y|0;
  if(tx<0||ty<0||tx>=S.GW||ty>=S.GH)return;
  if(!S.bloc[ty][tx])return;
  var g=S.bloc, droite=tx+1-a.x, gauche=a.x-tx, bas=ty+1-a.y, haut=a.y-ty;
  var cand=[], e=0.012+a.r;
  if(!g[ty][tx+1]&&tx+1<S.GW)cand.push([droite, tx+1+e-a.x, 0]);
  if(tx-1>=0&&!g[ty][tx-1])cand.push([gauche, tx-e-a.x, 0]);
  if(ty+1<S.GH&&!g[ty+1][tx])cand.push([bas, 0, ty+1+e-a.y]);
  if(ty-1>=0&&!g[ty-1][tx])cand.push([haut, 0, ty-e-a.y]);
  if(!cand.length){
    /* LES QUATRE VOISINES SONT PRISES : le corps est au coeur d'un
       pate de maisons, pousse la par une bousculade. On le renvoie
       vers la case libre la plus proche. Sans cette sortie de secours
       il y restait pour toute la partie, visible sur un toit. */
    for(var r2=2;r2<=6;r2++){
      for(var oy=-r2;oy<=r2;oy++)for(var ox=-r2;ox<=r2;ox++){
        if(Math.max(Math.abs(ox),Math.abs(oy))!==r2)continue;
        var nx=tx+ox, ny=ty+oy;
        if(nx<0||ny<0||nx>=S.GW||ny>=S.GH||g[ny][nx])continue;
        a.x=nx+0.5; a.y=ny+0.5; a.vx=0; a.vy=0; return;
      }
    }
    a.vx=0;a.vy=0;return;
  }
  cand.sort(function(p,q){return p[0]-q[0];});
  a.x+=cand[0][1]; a.y+=cand[0][2];
  if(cand[0][1])a.vx*=-0.15;
  if(cand[0][2])a.vy*=-0.15;
}

window.CORDON_FOULE=FOULE;
})();
