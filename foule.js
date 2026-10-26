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
   LA NAVIGATION — UN CHAMP DE FUITE

   Un chemin par individu, c'est trois cents A* a entretenir, et le
   premier qui se fait bousculer sort de son chemin et n'y revient
   jamais. On calcule a la place UN champ par destination : une vague
   partie de l'arrivee qui remplit la carte case par case, en comptant
   les pas. Chaque corps, ou qu'il soit et quoi qu'il lui arrive, n'a
   plus qu'a regarder ses huit voisines et descendre vers la plus
   petite. Il ne peut pas perdre son chemin puisqu'il n'en a pas.

   Le champ ne se recalcule que si l'arrivee change de case. Deux mille
   trois cents cases, c'est une poignee de microsecondes.
   --------------------------------------------------------------------- */
var DX8=[1,-1,0,0,1,1,-1,-1], DY8=[0,0,1,-1,1,-1,1,-1];

function Champ(S){
  this.d=new Int32Array(S.GW*S.GH);
  this.cx=-999; this.cy=-999; this.pret=false;
}
Champ.prototype.calculer=function(S,sources){
  var W=S.GW, H=S.GH, d=this.d, i;
  for(i=0;i<d.length;i++)d[i]=2147483647;
  var file=new Int32Array(W*H), tete=0, queue=0;
  for(i=0;i<sources.length;i++){
    var sx=sources[i][0]|0, sy=sources[i][1]|0;
    if(sx<0||sy<0||sx>=W||sy>=H)continue;
    var id=sy*W+sx;
    if(S.bloc[sy][sx]){
      /* une arrivee posee dans un mur n'ouvre aucun champ : on part des
         cases libres qui la touchent */
      for(var k=0;k<8;k++){
        var ax=sx+DX8[k], ay=sy+DY8[k];
        if(ax<0||ay<0||ax>=W||ay>=H||S.bloc[ay][ax])continue;
        var ai=ay*W+ax; if(d[ai]===0)continue;
        d[ai]=0; file[queue++]=ai;
      }
      continue;
    }
    if(d[id]===0)continue;
    d[id]=0; file[queue++]=id;
  }
  while(tete<queue){
    var c=file[tete++], cx=c%W, cy=(c/W)|0, nd=d[c]+1;
    for(var j=0;j<8;j++){
      var nx=cx+DX8[j], ny=cy+DY8[j];
      if(nx<0||ny<0||nx>=W||ny>=H)continue;
      if(S.bloc[ny][nx])continue;
      /* pas de passage en diagonale entre deux coins bloques */
      if(j>3&&(S.bloc[cy][nx]||S.bloc[ny][cx]))continue;
      var ni=ny*W+nx;
      if(d[ni]>nd){d[ni]=nd;file[queue++]=ni;}
    }
  }
  this.pret=true;
};
/* la pente du champ sous un corps, normalisee */
Champ.prototype.pente=function(S,x,y,out){
  var W=S.GW, H=S.GH, cx=x|0, cy=y|0;
  out[0]=0; out[1]=0;
  if(cx<0||cy<0||cx>=W||cy>=H)return false;
  var mieux=this.d[cy*W+cx], bx=0, by=0, trouve=false;
  for(var k=0;k<8;k++){
    var nx=cx+DX8[k], ny=cy+DY8[k];
    if(nx<0||ny<0||nx>=W||ny>=H||S.bloc[ny][nx])continue;
    if(k>3&&(S.bloc[cy][nx]||S.bloc[ny][cx]))continue;
    var v=this.d[ny*W+nx];
    if(v<mieux){mieux=v;bx=DX8[k];by=DY8[k];trouve=true;}
  }
  if(!trouve)return false;
  var l=Math.sqrt(bx*bx+by*by);
  out[0]=bx/l; out[1]=by/l;
  return true;
};
FOULE.Champ=Champ;

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
    return {u:(col-dec)*0.70, v:-rang*0.82};
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

/* =====================================================================
   LES ETATS

   Chaque corps est dans UN etat nomme, et il en change parce qu'une
   REGLE s'est verifiee — jamais parce qu'un tirage l'a decide. On peut
   donc toujours repondre a « pourquoi celui-la recule ? » par une
   phrase : parce que son stress a passe 0,55 alors qu'il hesitait.

   Un etat dit deux choses, et rien d'autre :
     ou  : le point que le corps cherche a rejoindre
     allure : a quelle fraction de sa vitesse il y va
   Les transitions sont ailleurs, dans une seule fonction par camp, pour
   qu'on puisse les lire a la suite comme un reglement.
   ===================================================================== */
var ETATS={
  /* ---- le cortege ---- */
  MARCHE:  {cat:'manif', allure:1.00, dit:'marche'},
  ATTEND:  {cat:'manif', allure:0.22, dit:'attend'},
  HESITE:  {cat:'manif', allure:0.42, dit:'hésite'},
  POUSSE:  {cat:'manif', allure:0.70, dit:'pousse'},
  RECULE:  {cat:'manif', allure:0.85, dit:'recule'},
  PANIQUE: {cat:'manif', allure:1.65, dit:'PANIQUE'},
  FUIT:    {cat:'manif', allure:1.40, dit:'fuit'},
  CALME:   {cat:'manif', allure:0.30, dit:'se calme'},
  /* ---- le cordon ---- */
  TIENT:   {cat:'crs', allure:0.55, dit:'tient'},
  VERS:    {cat:'crs', allure:1.00, dit:'se déplace'},
  FORME:   {cat:'crs', allure:0.80, dit:'se forme'},
  AVANCE:  {cat:'crs', allure:0.75, dit:'avance'},
  RECUL:   {cat:'crs', allure:0.85, dit:'recule'},
  CEDE:    {cat:'crs', allure:0.60, dit:'cède'}
};
FOULE.ETATS=ETATS;

function etat(S,a,e){
  if(a.etat===e)return;
  a.etatAv=a.etat; a.etat=e; a.etatT=0;
  a.cause=a.causeN||''; a.causeN='';
}
function pourquoi(a,c){a.causeN=c;}

/* LE STRESS — ce qui le fait monter est toujours visible a l'ecran.
   Quatre causes, pas une de plus : on est serre, on est au contact,
   un voisin panique, un evenement vient de se produire pres de soi. Il
   redescend tout seul des que ces causes cessent. Une jauge qui monte
   sans cause observable est un generateur de nombres, pas un jeu. */
function majStress(S,a,voisins,dt){
  var A=S.agents, mont=0, i, b;
  var serres=0, contact=0, contagion=0;
  for(i=0;i<voisins.length;i++){
    b=A[voisins[i]]; if(b===a)continue;
    var dx=b.x-a.x, dy=b.y-a.y, d2=dx*dx+dy*dy;
    if(d2>2.25)continue;
    if(b.camp!==a.camp){ if(d2<1.9)contact++; }
    else{
      serres++;
      if(b.etat==='PANIQUE'&&d2<1.3)contagion+=0.9;
      else if(b.stress>a.stress&&d2<1.1)contagion+=(b.stress-a.stress)*0.18;
    }
  }
  a.serres=serres; a.contact=contact;
  /* LE CALIBRAGE, et pourquoi il a fallu le refaire.
     Premiere version : la densite comptait a partir de quatre voisins,
     a 0,055 par voisin et par seconde. Un cortege serre en a douze —
     c'est ce qu'est un cortege — donc tout le monde passait 0,8 en
     quinze secondes et la rue entiere fuyait avant d'avoir vu un
     policier. Etre serre entre les siens n'est pas un danger ; ce qui
     fait peur, c'est le face-a-face, le voisin qui craque, et ce qui
     explose a cote. La densite ne compte donc qu'au-dela de huit, et
     pour trois fois rien. (Valeurs par seconde, divisees par mille.) */
  /* DEUX PLAFONDS, et c'est la regle de conception de tout le modele :
     SANS EVENEMENT, PERSONNE NE PANIQUE. Etre serre tend jusqu'a 0,45 ;
     le face-a-face avec le cordon tend jusqu'a 0,62 — de quoi pousser,
     hesiter, reculer, et rien de plus. Au-dela, il faut qu'il se soit
     passe quelque chose : une grenade, une charge, ou assez de voisins
     deja paniqués. Une foule qui craque toute seule parce qu'elle
     attend est un bogue, pas une simulation. */
  if(a.stress<0.45)mont+=Math.max(0,serres-8)*0.000020;
  if(a.stress<0.62)mont+=Math.min(3,contact)*0.000030;
  /* LA CONTAGION DOIT POUVOIR S'ETEINDRE. Reglee a 0,30 par seconde,
     un seul voisin paniqué suffisait a faire craquer le suivant : la
     panique partait d'un corps et prenait la rue entiere en vingt
     secondes, pour ne plus jamais retomber. A 0,12, il faut TROIS
     paniqués au contact pour depasser la detente. La panique se propage
     donc dans le coeur dense de la masse et s'arrete au bord — ce qu'on
     voulait voir — au lieu de tout emporter. */
  mont+=Math.min(1.2,contagion)*0.00012;     /* le voisin qui craque */
  /* UN EVENEMENT DOIT FAIRE CRAQUER. Regle a 0,0009, une grenade au
     milieu de la foule ajoutait trois dixiemes de stress : personne ne
     passait le seuil et le bouton ne faisait rien de visible. A 0,0032
     sur une seconde et demie, ceux qui sont dedans paniquent — et eux
     seuls : c'est la contagion, ensuite, qui decide jusqu'ou ca va. */
  mont+=a.choc*0.0032;
  a.choc=Math.max(0,a.choc-dt*0.00075);
  /* la detente : franche quand rien ne pousse, lente sinon */
  var detente=(mont<=0.000010)?0.00014:0.000026;
  if(a.etat==='CALME')detente*=3.2;          /* on souffle */
  a.stress=cl(a.stress+(mont-detente)*dt*a.nerf, 0, 1);
}

/* LES REGLES DU CORTEGE, dans l'ordre ou on les lit. La premiere qui
   se verifie gagne : une panique l'emporte sur une hesitation, et un
   recul sur une poussee. */
function reglesManif(S,a,G,dt){
  var E=a.etat;
  if(E==='PANIQUE'){
    if(a.etatT>1250){
      /* LA DECHARGE. On panique, on court, et courir evacue. Sans cette
         baisse, un corps sortait de sa panique au meme stress qu'il y
         etait entre, repassait le seuil a l'image suivante et y
         retournait : deux cent cinquante paniqués perpetuels. */
      a.stress*=0.52;
      pourquoi(a,'la panique retombe');etat(S,a,'FUIT');
    }
    return;
  }
  if(a.stress>0.82&&E!=='FUIT'){pourquoi(a,'stress > 0,82');etat(S,a,'PANIQUE');return;}
  if(E==='FUIT'){
    /* ON SORT D'UNE FUITE EN ARRIVANT QUELQUE PART. Premiere version :
       il fallait que le stress retombe sous 0,34. Les fuyards se
       massaient a la bouche de rue, la densite les maintenait tendus, et
       trois cents corps restaient en fuite pour toujours. Atteindre la
       sortie est l'evenement qui termine la fuite. */
    if(a.distSortie<3){pourquoi(a,'sorti de la rue');etat(S,a,'CALME');return;}
    if(a.stress<0.30&&a.distMenace>6){pourquoi(a,'hors d’atteinte');etat(S,a,'CALME');}
    return;
  }
  if(E==='CALME'){
    if(a.stress<0.20){pourquoi(a,'calme revenu');etat(S,a,'MARCHE');}
    else if(a.stress>0.70){pourquoi(a,'ça remonte');etat(S,a,'RECULE');}
    return;
  }
  if(G.ordre==='disperse'){pourquoi(a,'ordre de dispersion');etat(S,a,'FUIT');return;}
  if(E==='RECULE'){
    if(a.stress<0.30&&a.distMenace>3.2){pourquoi(a,'la pression est retombée');etat(S,a,'MARCHE');}
    return;
  }
  if(a.stress>0.56){pourquoi(a,'stress > 0,56');etat(S,a,'RECULE');return;}
  if(E==='POUSSE'){
    if(a.distMenace>2.6){pourquoi(a,'la ligne s’est éloignée');etat(S,a,'MARCHE');}
    return;
  }
  if(a.distMenace<1.7&&a.stress>0.26){pourquoi(a,'au contact');etat(S,a,'POUSSE');return;}
  if(E==='HESITE'){
    if(a.distMenace>3.4){pourquoi(a,'le passage s’ouvre');etat(S,a,'MARCHE');}
    else if(a.serres>7&&a.distMenace<2.4){pourquoi(a,'poussé par-derrière');etat(S,a,'POUSSE');}
    return;
  }
  if(a.distMenace<2.9){pourquoi(a,'la ligne est devant');etat(S,a,'HESITE');return;}
  if(E==='ATTEND'){
    if(a.distCible>1.5){pourquoi(a,'le cortège repart');etat(S,a,'MARCHE');}
    return;
  }
  if(a.distCible<0.62&&a.v<a.vmax*0.16){pourquoi(a,'arrivé sur sa place');etat(S,a,'ATTEND');return;}
  /* ON N'INSISTE PAS INDEFINIMENT. Un corps dont la place est deja
     occupee restait en MARCHE sans avancer d'un pouce : vu de l'exterieur
     il piétinait, et le deblocage lateral se declenchait toutes les
     secondes et demie pour rien. Au bout d'une seconde et demie sans
     progres, il renonce et attend — ce que fait quelqu'un dans une
     foule quand il ne peut plus avancer. */
  if(E==='MARCHE'&&a.bloque>1400){pourquoi(a,'n’avance plus');etat(S,a,'ATTEND');return;}
}

/* LES REGLES DU CORDON. Un ordre du joueur prime sur tout ; la reaction
   a la densite ne s'exprime que si aucun ordre n'est en cours. */
function reglesCRS(S,a,G,dt){
  var E=a.etat;
  if(G.ordre==='vers'){ if(E!=='VERS'){pourquoi(a,'ordre de déplacement');etat(S,a,'VERS');} return; }
  if(G.ordre==='avance'){ if(E!=='AVANCE'){pourquoi(a,'ordre d’avancer');etat(S,a,'AVANCE');} return; }
  if(G.ordre==='recule'){ if(E!=='RECUL'){pourquoi(a,'ordre de reculer');etat(S,a,'RECUL');} return; }
  if(G.ordre==='tenir'){
    if(E!=='FORME'&&E!=='TIENT'){pourquoi(a,'ordre de tenir');etat(S,a,'FORME');}
    if(E==='FORME'&&a.distCible<0.46){pourquoi(a,'en place');etat(S,a,'TIENT');}
    return;
  }
  if(E==='VERS'||E==='AVANCE'||E==='RECUL'){pourquoi(a,'ordre terminé');etat(S,a,'FORME');return;}
  if(E==='FORME'){
    if(a.distCible<0.46){pourquoi(a,'en place');etat(S,a,'TIENT');}
    return;
  }
  if(E==='CEDE'){
    if(G.presse<G.seuil*0.72){pourquoi(a,'la poussée retombe');etat(S,a,'TIENT');}
    return;
  }
  if(G.presse>G.seuil){pourquoi(a,'débordé par la densité');etat(S,a,'CEDE');return;}
  if(a.distCible>1.25){pourquoi(a,'écarté de sa place');etat(S,a,'FORME');return;}
}

/* ---------------------------------------------------------------------
   LA CONSTRUCTION
   --------------------------------------------------------------------- */
FOULE.creer=function(o){
  var S={
    GW:o.GW, GH:o.GH, bloc:o.bloc, AV:o.AV, RU:o.RU,
    agents:[], groupes:[], t:0,
    grille:new Grille(o.GW,o.GH),
    tmp:[], gr:(o.graine||12345),
    front:o.front||0, pression:0, tension:0,
    sorties:o.sorties||[], evenements:[],
    paniques:0, bloquesVus:0, debloques:0
  };
  S.champPolice=new Champ(S);
  S.champFuite=new Champ(S);
  S.champsPrets=false; S.champFuitePret=false;
  S.al=function(){S.gr=(S.gr*16807)%2147483647;return (S.gr-1)/2147483646;};
  return S;
};

/* un groupe : des agents, une destination, une figure, une allure */
FOULE.groupe=function(S,o){
  var G={
    id:S.groupes.length, type:o.type, form:o.form||null,
    ax:o.ax, ay:o.ay,          /* la destination du groupe */
    ordre:null, ordreT:0, ordrePrio:0, decal:0,
    presse:0, seuil:(o.seuil||3.0), champ:null, champX:-999, champY:-999,
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
    cx:x, cy:y, fx:0, fy:0, v:0,
    /* l'etat, et de quoi expliquer chaque changement */
    camp:(G.type==='crs'?'crs':'manif'),
    etat:(G.type==='crs'?'TIENT':'MARCHE'), etatAv:'', etatT:0,
    cause:'départ', causeN:'',
    /* LE TEMPERAMENT. Deux corps dans la meme bousculade ne craquent
       pas au meme moment : chacun porte un coefficient qui multiplie
       tout ce qui lui arrive. Le groupe reste lisible — ils vont tous
       dans le meme sens — mais la panique part d'un endroit precis. */
    nerf:(o.nerf||1), stress:(o.stress||0), choc:0,
    serres:0, contact:0, distMenace:99, distCible:0,
    bloque:0, biais:((G.membres.length%2)?1:-1)
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
function majCibles(S,dt){
  for(var k=0;k<S.groupes.length;k++){
    var G=S.groupes[k], n=G.membres.length;
    var c=Math.cos(G.cap), si=Math.sin(G.cap);
    /* un ordre decale la figure entiere : avancer la pousse d'une tuile
       vers son cap, ceder la ramene d'autant */
    /* LA CONVENTION DE CAP, une fois pour toutes.
       Une place (u,v) se pose en (ax + u·cos − v·sin, ay + u·sin + v·cos).
       Donc u court LE LONG de la figure, et v vers l'ARRIERE : le vecteur
       « devant », celui qui regarde l'adversaire, vaut (−sin, +cos).
       Le decalage est SOUSTRAIT a v, donc avancer demande un decalage
       NEGATIF. C'est contre-intuitif et c'est pour ca que c'est ecrit
       ici : une premiere version avait le signe inverse, les lignes
       etaient retournees, et la grenade tombait derriere le cordon. */
    var dec=0;
    if(G.type==='crs'){
      if(G.ordre==='avance')dec=-1.9;
      else if(G.ordre==='recule')dec=1.4;
      else{
        var cede=0; for(var q=0;q<n;q++)if(S.agents[G.membres[q]].etat==='CEDE')cede++;
        if(cede>n*0.4)dec=0.9;
      }
      G.decal+=(dec-G.decal)*Math.min(1,dt*0.0035);
    }
    for(var m=0;m<n;m++){
      var a=S.agents[G.membres[m]];
      if(G.form){
        var p=FORM[G.form](n,a.slot,G.ax,G.ay);
        var v2=p.v - G.decal;
        a.cx=G.ax + p.u*c - v2*si;
        a.cy=G.ay + p.u*si + v2*c;
        /* UNE PLACE DOIT ETRE ATTEIGNABLE. Une ligne de dix hommes fait
           six tuiles et demie ; l'avenue en fait six. Sept places sur
           trente-six tombaient donc dans un trottoir ou un mur, et les
           hommes concernes poussaient contre une facade en permanence —
           on mesurait six tuiles d'ecart a la formation. On ramene la
           place sur la case libre la plus proche : la ligne se tasse au
           lieu de deborder. */
        if(muree(S,a.cx,a.cy)){
          var lp=prochaineLibre(S,a.cx,a.cy);
          if(lp){a.cx=lp[0];a.cy=lp[1];}
        }
      }else{
        a.cx=G.ax + a.ex;
        a.cy=G.ay + a.ey;
      }
    }
  }
}

/* LES CHAMPS DE SERVICE, refaits quatre fois par seconde.
   - celui de la police dit a chaque case a quelle distance se trouve le
     cordon : c'est lui qui donne distMenace, donc toutes les regles de
     contact, sans qu'aucun corps n'ait a chercher un policier.
   - celui des sorties dit par ou fuir. Il part des trois bouches de
     rue, et il est le meme pour tout le monde : une foule qui fuit va
     vers une sortie, pas chacun dans sa direction. */
function majChamps(S,dt){
  S.horloge=(S.horloge||0)+dt;
  if(S.champsPrets&&S.horloge<250)return;
  S.horloge=0; S.champsPrets=true;
  var src=[], i, A=S.agents;
  for(i=0;i<A.length;i++)if(A[i].camp==='crs')src.push([A[i].x|0,A[i].y|0]);
  if(src.length)S.champPolice.calculer(S,src);
  if(!S.champFuitePret&&S.sorties&&S.sorties.length){
    S.champFuite.calculer(S,S.sorties); S.champFuitePret=true;
  }
}

/* ---------------------------------------------------------------------
   UN PAS DE SIMULATION
   Trois forces et une integration. L'ordre compte : on calcule tout a
   partir des positions du debut du pas, puis on bouge tout le monde.
   Deplacer au fur et a mesure donne un avantage aux premiers de la
   liste, et la foule derive vers un coin sans qu'on comprenne pourquoi.
   --------------------------------------------------------------------- */
/* UN ORDRE. La priorite tranche : un ordre de deplacement chasse une
   reaction a la densite, mais pas l'inverse. Sans elle, une unite
   envoyee quelque part s'arretait a la premiere bousculade. */
FOULE.ordre=function(S,G,type,duree,prio){
  prio=prio||1;
  if(G.ordre&&G.ordrePrio>prio&&G.ordreT>0)return false;
  G.ordre=type; G.ordreT=duree||0; G.ordrePrio=prio;
  return true;
};
/* le vecteur « devant » d'une figure : (−sin, +cos) de son cap */
FOULE.devant=function(G){return [-Math.sin(G.cap), Math.cos(G.cap)];};
FOULE.evenement=function(S,x,y,rayon,force){
  S.evenements.push({x:x,y:y,r:rayon,f:force,t:0});
};

FOULE.pas=function(S,dt){
  dt=Math.min(40,dt);
  S.t+=dt;
  /* les ordres s'epuisent */
  for(var gi=0;gi<S.groupes.length;gi++){
    var Gg=S.groupes[gi];
    if(Gg.ordreT>0){Gg.ordreT-=dt;if(Gg.ordreT<=0){Gg.ordre=null;Gg.ordrePrio=0;}}
  }
  /* les evenements marquent les corps a portee, une seule fois */
  for(var ei=S.evenements.length-1;ei>=0;ei--){
    var E=S.evenements[ei];
    for(var ea=0;ea<S.agents.length;ea++){
      var av=S.agents[ea]; if(av.camp!=='manif')continue;
      var ex=av.x-E.x, ey=av.y-E.y, e2=ex*ex+ey*ey;
      if(e2<E.r*E.r)av.choc=Math.min(1.4,av.choc+E.f*(1-Math.sqrt(e2)/E.r));
    }
    S.evenements.splice(ei,1);
  }
  majChamps(S,dt);
  majCibles(S,dt);
  var A=S.agents, n=A.length, i, j, a, b;
  /* 1. le voisinage */
  S.grille.vider();
  for(i=0;i<n;i++)S.grille.poser(A[i],i);
  /* 2. les forces */
  var vois=S.tmp, pente=[0,0];
  var W=S.GW;
  S.paniques=0;
  for(i=0;i<n;i++){
    a=A[i];
    a.etatT+=dt;
    /* ce que chacun sait de sa situation, lu dans les champs */
    var ci=(a.y|0)*W+(a.x|0);
    a.distMenace=(S.champPolice.pret&&ci>=0&&ci<S.champPolice.d.length)
                 ?Math.min(99,S.champPolice.d[ci]):99;
    a.distSortie=(S.champFuitePret&&ci>=0&&ci<S.champFuite.d.length)
                 ?Math.min(999,S.champFuite.d[ci]):999;
    var ddx=a.cx-a.x, ddy=a.cy-a.y;
    a.distCible=Math.sqrt(ddx*ddx+ddy*ddy);
    var G2=S.groupes[a.g];
    S.grille.autour(a,vois);
    if(a.camp==='manif'){majStress(S,a,vois,dt);reglesManif(S,a,G2,dt);}
    else{reglesCRS(S,a,G2,dt);}
    if(a.etat==='PANIQUE')S.paniques++;
    var ET=ETATS[a.etat]||ETATS.MARCHE;
    var allure=ET.allure;
    var fx=0, fy=0;
    /* --- OU ALLER. Trois regimes : suivre un champ, s'eloigner d'une
           menace, ou rejoindre sa place. --- */
    var dx, dy, d, suit=false;
    if(a.etat==='FUIT'&&S.champFuitePret){
      if(S.champFuite.pente(S,a.x,a.y,pente)){dx=pente[0];dy=pente[1];d=1;suit=true;}
    }else if(a.etat==='VERS'&&G2.champ&&G2.champ.pret){
      if(G2.champ.pente(S,a.x,a.y,pente)){dx=pente[0];dy=pente[1];d=1;suit=true;}
    }else if(a.etat==='PANIQUE'||a.etat==='RECULE'){
      /* dos a la menace : on remonte la pente du champ de police */
      if(S.champPolice.pret&&S.champPolice.pente(S,a.x,a.y,pente)){
        dx=-pente[0];dy=-pente[1];d=1;suit=true;
        if(a.etat==='PANIQUE'){ /* un paniqué part de travers, pas droit */
          var ang=a.biais*0.5;
          var nx2=dx*Math.cos(ang)-dy*Math.sin(ang);
          var ny2=dx*Math.sin(ang)+dy*Math.cos(ang);
          dx=nx2;dy=ny2;
        }
      }
    }
    if(!suit){dx=a.cx-a.x; dy=a.cy-a.y; d=Math.sqrt(dx*dx+dy*dy);}
    if(d>0.0001){
      var vise=a.vmax*allure;
      if(!suit&&d<1.1)vise=a.vmax*allure*(d/1.1);
      var sx=dx/d*vise, sy=dy/d*vise;
      fx+=(sx-a.vx)*R.acc/R.vMarche;
      fy+=(sy-a.vy)*R.acc/R.vMarche;
    }else{
      fx-=a.vx*R.frein/R.vMarche; fy-=a.vy*R.frein/R.vMarche;
    }
    /* --- la separation : un corps pousse ses voisins --- */
    var coh=0, cx2=0, cy2=0, spx=0, spy=0;
    for(j=0;j<vois.length;j++){
      if(vois[j]===i)continue;
      b=A[vois[j]];
      var ex=a.x-b.x, ey=a.y-b.y, e2=ex*ex+ey*ey;
      var min=a.r+b.r;
      if(e2<min*min&&e2>1e-8){
        var e=Math.sqrt(e2), pen=(min-e)/min;
        /* LA MASSE COMPTE. Sans elle, un homme en tenue d'intervention
           etait repousse autant qu'il repoussait : une ligne qui avance
           gagnait quatorze centiemes de tuile en trois secondes, et
           l'ordre d'avancer ne se voyait pas. Le rapport des masses dit
           qui recule — c'est tout ce qui separe un cordon d'une file
           d'attente. */
        /* UN HOMME CAMPE RESISTE. Trente-huit hommes contre trois cent
           cinquante, c'est le rapport d'un vrai cordon ; sans ancrage
           ils etaient simplement balayes et la mission se perdait quoi
           qu'on fasse. Tenir sa place, c'est peser deux fois et demie
           son poids — et le perdre des qu'on se deplace. */
        var ma=a.masse*((a.etat==='TIENT'||a.etat==='FORME')?2.5:1);
        var mb=b.masse*((b.etat==='TIENT'||b.etat==='FORME')?2.5:1);
        var rm=(mb*2)/(ma+mb);
        spx+=ex/e*pen*R.sepF*rm; spy+=ey/e*pen*R.sepF*rm;
      }
      if(b.g===a.g&&e2<4){coh++;cx2+=b.x;cy2+=b.y;}
    }
    /* LE PLAFOND DE POUSSEE. Sans lui, trois cent cinquante corps
       alignes transmettent leur poussee sans aucune perte : la force
       recue par le premier rang est la somme de tous ceux de derriere,
       et AUCUN cordon ne peut tenir — on perdait la mission quoi qu'on
       fasse. Dans une foule reelle, une poussee se dissipe de proche en
       proche. On plafonne donc ce qu'un corps peut recevoir. */
    var sl=Math.sqrt(spx*spx+spy*spy), plaf=R.sepF*2.6;
    if(sl>plaf){spx=spx/sl*plaf; spy=spy/sl*plaf;}
    fx+=spx; fy+=spy;
    /* --- la cohesion : rester avec les siens. Elle tombe quand on
           panique : c'est justement ce qui disloque un cortege. --- */
    var G=G2;
    if(a.etat==='PANIQUE'||a.etat==='FUIT')coh=0;
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
    /* ------------------------------------------------------------------
       NE PAS RESTER BLOQUE. Un corps qui veut aller quelque part et qui
       n'avance pas est coince : entre deux voisins, dans un angle, ou
       contre une barriere. On le laisse insister une seconde et demie,
       puis on le pousse de cote — toujours du meme cote pour lui, pour
       que deux corps face a face ne se decalent pas ensemble a l'infini.
       Au bout de quatre secondes on le pose sur la case libre la plus
       proche. Aucun corps ne peut donc rester immobile indefiniment.
       ------------------------------------------------------------------ */
    /* L'INTENTION, pas la distance a un point. Premiere version : on
       comparait a la cible du groupe. Un fuyard, dont la cible est
       restee au cortege, etait compte bloque en permanence — mille deux
       cents deblocages pour rien en vingt secondes. Ce qu'il faut
       mesurer, c'est : il veut avancer, et il n'avance pas. */
    var veut=(ET.allure>0.35)&&(suit||a.distCible>0.9);
    if(veut&&v<a.vmax*0.10){
      a.bloque+=dt;
      if(a.bloque>1500){
        var bdx=a.cx-a.x, bdy=a.cy-a.y, bl=Math.sqrt(bdx*bdx+bdy*bdy)||1;
        a.vx+=(-bdy/bl)*a.biais*a.vmax*0.9;
        a.vy+=( bdx/bl)*a.biais*a.vmax*0.9;
        a.bloque=600; S.debloques++;
      }
      if(a.bloque>3900){
        var po=caseLibre(S,a.x,a.y,a.cx,a.cy);
        if(po){a.x=po[0];a.y=po[1];a.vx=0;a.vy=0;}
        a.bloque=0; S.debloques++;
      }
    }else a.bloque=Math.max(0,a.bloque-dt*0.7);
    /* ce que le rendu lira */
    if(v>a.vmax*0.12){
      var ex2=(a.vx-a.vy), ey2=(a.vx+a.vy);  /* la vitesse vue a l'ecran */
      a.dir=(ey2>0)?((ex2>0)?0:1):((ex2>0)?3:2);
      a.pas+=v*dt*2.0;
      a.anim=((a.pas|0)%4);
    }else{a.anim=0;}
    a.v=v;
  }
  /* ------------------------------------------------------------------
     LA TENSION. Ce n'est pas un compteur qui monte : c'est la moyenne
     de ce que les corps vivent, lissee. Elle ne peut donc pas bouger
     sans qu'on voie pourquoi a l'ecran.
     ------------------------------------------------------------------ */
  var som=0, nb=0, pres=0;
  for(i=0;i<n;i++){
    a=A[i]; if(a.camp!=='manif')continue;
    som+=a.stress; nb++;
    if(a.distMenace<2)pres++;
  }
  var brut=nb?(som/nb):0;
  S.tension+=(brut-S.tension)*Math.min(1,dt*0.0014);
  S.pression=pres;
  /* chaque unite lit la pression qui la concerne, pas celle de la rue */
  for(i=0;i<S.groupes.length;i++){
    var Gp=S.groupes[i]; if(Gp.type!=='crs')continue;
    var c2=0;
    for(var mi=0;mi<Gp.membres.length;mi++){
      var ag=A[Gp.membres[mi]];
      S.grille.autour(ag,S.tmp);
      for(var vi2=0;vi2<S.tmp.length;vi2++){
        var vb=A[S.tmp[vi2]];
        if(vb.camp!=='manif')continue;
        var vdx=vb.x-ag.x, vdy=vb.y-ag.y;
        if(vdx*vdx+vdy*vdy<2.0)c2++;
      }
    }
    Gp.presse=c2/Math.max(1,Gp.membres.length);
  }
};

function muree(S,x,y){
  var cx=x|0, cy=y|0;
  if(cx<0||cy<0||cx>=S.GW||cy>=S.GH)return true;
  return !!S.bloc[cy][cx];
}
function prochaineLibre(S,x,y){
  var cx=x|0, cy=y|0;
  for(var r=1;r<=3;r++){
    var best=null, bd=1e9;
    for(var oy=-r;oy<=r;oy++)for(var ox=-r;ox<=r;ox++){
      if(Math.max(Math.abs(ox),Math.abs(oy))!==r)continue;
      var nx=cx+ox, ny=cy+oy;
      if(nx<0||ny<0||nx>=S.GW||ny>=S.GH||S.bloc[ny][nx])continue;
      var dd=(nx+0.5-x)*(nx+0.5-x)+(ny+0.5-y)*(ny+0.5-y);
      if(dd<bd){bd=dd;best=[nx+0.5,ny+0.5];}
    }
    if(best)return best;
  }
  return null;
}

/* la case libre la plus proche, en allant du cote de la cible */
function caseLibre(S,x,y,cx,cy){
  var bx=x|0, by=y|0, best=null, bd=1e9;
  for(var r=1;r<=5;r++){
    for(var oy=-r;oy<=r;oy++)for(var ox=-r;ox<=r;ox++){
      if(Math.max(Math.abs(ox),Math.abs(oy))!==r)continue;
      var nx=bx+ox, ny=by+oy;
      if(nx<0||ny<0||nx>=S.GW||ny>=S.GH||S.bloc[ny][nx])continue;
      var dd=(nx+0.5-cx)*(nx+0.5-cx)+(ny+0.5-cy)*(ny+0.5-cy);
      if(dd<bd){bd=dd;best=[nx+0.5,ny+0.5];}
    }
    if(best)return best;
  }
  return null;
}

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
