/* =====================================================================
   LE CORDON — LA MISSION

   TROISIEME MOITIE, et elle ne parle ni a la premiere ni a la seconde.
   foule.js simule des corps, acteurs.js les dessine ; ici on ne fait que
   LIRE la simulation pour dire ou en est la mission. Aucun objectif
   n'est « declare » atteint par l'interface : chacun porte une fonction
   qui regarde l'etat des corps et renvoie un chiffre. Si on supprimait
   tout l'affichage, les objectifs se calculeraient pareil, et la partie
   se gagnerait ou se perdrait pareil.

   LA REJOUABILITE vient d'une graine, pas d'un tirage a chaque image :
   l'ordre des evenements, leurs minutes, la vitrine visee et le sens du
   contournement sont tires une fois au debut. Deux parties avec la meme
   graine se deroulent a l'identique — c'est ce qui permet de rejouer un
   bogue — et deux graines differentes donnent deux missions.
   ===================================================================== */
(function(){
'use strict';
var MIS={};

/* ---------------------------------------------------------------------
   LES EVENEMENTS
   Chacun est une consigne pour le jeu, pas un message a l'ecran : il
   change ce que font des groupes. Le texte n'est que sa trace.
   --------------------------------------------------------------------- */
var CATALOGUE=[
  {k:'poussee',  t:'LE CORTÈGE POUSSE', d:'La tête force sur la première ligne.', dur:16000},
  {k:'casseurs', t:'UN GROUPE SE DÉTACHE', d:'Ils partent sur une devanture.', dur:0},
  /* IL Y AVAIT ICI UN CONTOURNEMENT PAR LA TRANSVERSALE. Il a ete
     retire : sur cette carte, la transversale croise l'avenue A L'OUEST
     du cordon, donc le bloc qui contournait n'avait aucun debouche et
     tournait en rond. Un evenement qui ne peut pas aboutir est une
     fausse menace. A la place, du monde arrive — et ca, ca se voit. */
  {k:'renfortCortege', t:'LE CORTÈGE GROSSIT', d:'Du monde arrive par l’ouest.', dur:0},
  {k:'presse',   t:'LES CAMÉRAS SONT SUR VOUS', d:'Tout ce que vous ferez sera filmé.', dur:22000},
  {k:'renfort',  t:'RENFORT DISPONIBLE', d:'La réserve peut être engagée.', dur:0},
  /* L'INCENDIE DE LA PLACE. Une benne part au milieu de l'esplanade :
     tout le monde la voit, personne ne peut passer dessus, et la rue
     se tend toute seule tant qu'elle brûle. */
  {k:'incendie', t:'ÇA BRÛLE AU MILIEU', d:'Une benne a pris feu sur l’esplanade.', dur:0}
];

function De(g){this.g=g||1;}
De.prototype.f=function(){this.g=(this.g*16807)%2147483647;return (this.g-1)/2147483646;};
De.prototype.e=function(a,b){return a+Math.floor(this.f()*(b-a+1));};

/* ---------------------------------------------------------------------
   LES OBJECTIFS
   test(M,s) renvoie {v:valeur, c:cible, fait:bool, rate:bool}. Rien
   d'autre ne decide de leur etat.
   --------------------------------------------------------------------- */
/* LES OBJECTIFS DU CORTEGE. Ce ne sont pas ceux de la police inverses :
   un cortege ne « tient » rien, il veut PASSER, et ce qu'il laisse
   derriere lui compte. */
function objectifsManif(){
  return [
  { id:'passer', type:'principal',
    t:'FRANCHIR LA LIGNE', court:'PASSÉS',
    dit:function(o){return o.v+' passés sur '+o.c+' à faire passer';},
    test:function(M,s){
      var n=0, A=s.sim.agents;
      for(var i=0;i<A.length;i++){
        var a=A[i];
        if(a.camp!=='manif')continue;
        if(a.etat==='PANIQUE'||a.etat==='FUIT')continue;
        /* UN ENCERCLE NE COMPTE PAS. Il est physiquement derriere la
           ligne peut-etre, mais il n'est pas passe : il est tenu. */
        if(a.nasse>0)continue;
        if(a.x>M.ligne)n++;
      }
      M.passes=Math.max(M.passes,n);
      return {v:M.passes, c:M.objectif, fait:(M.passes>=M.objectif), rate:false};
    }},
  { id:'tenirCortege', type:'secondaire',
    t:'GARDER LE CORTÈGE', court:'CORTÈGE',
    dit:function(o){return o.v+' en fuite · max '+o.c;},
    test:function(M,s){
      var n=0, A=s.sim.agents;
      for(var i=0;i<A.length;i++){
        var a=A[i];
        if(a.camp!=='manif')continue;
        if(a.etat==='FUIT'||a.etat==='CALME')n++;
      }
      M.enFuite=Math.max(M.enFuite||0,n);
      return {v:M.enFuite, c:110, fait:(M.enFuite<=110), rate:(M.enFuite>110)};
    }},
  { id:'marquer', type:'secondaire',
    t:'MARQUER LE COUP', court:'MARQUÉ',
    dit:function(o){return (M_barr(o)||0)+' barricade(s) · '+o.v+' vitrine(s)';},
    test:function(M,s){
      return {v:M.brisees, c:1, barr:(M.barricades||0),
              fait:((M.barricades||0)+M.brisees>=2), rate:false};
    }}
  ];
}
function M_barr(o){return o.barr;}

function objectifs(){
  return [
  { id:'tenir', type:'principal',
    t:'TENIR L’AVENUE', court:'TENIR',
    dit:function(o){return o.v+' passés sur '+o.c+' tolérés';},
    test:function(M,s){
      /* UN PANIQUE QUI COURT N'EST PAS UN CORTEGE QUI PASSE. On ne
         compte que ceux qui franchissent debout, en manifestant : sans
         cette distinction, gazer sa propre rue faisait perdre la
         mission qu'on essayait de tenir. */
      var n=0, A=s.sim.agents;
      for(var i=0;i<A.length;i++){
        var a=A[i];
        if(a.camp!=='manif')continue;
        if(a.etat==='PANIQUE'||a.etat==='FUIT')continue;
        /* UN ENCERCLE NE COMPTE PAS. Il est physiquement derriere la
           ligne peut-etre, mais il n'est pas passe : il est tenu. */
        if(a.nasse>0)continue;
        if(a.x>M.ligne)n++;
      }
      M.passes=Math.max(M.passes,n);
      return {v:M.passes, c:M.tolere, fait:(M.t>=M.duree&&M.passes<=M.tolere), rate:(M.passes>M.tolere)};
    }},
  { id:'vitrines', type:'secondaire',
    t:'PROTÉGER LES DEVANTURES', court:'DEVANTURES',
    dit:function(o){return o.v?(o.v+' brisée'+(o.v>1?'s':'')):'intactes';},
    test:function(M,s){
      return {v:M.brisees, c:M.toleBris, fait:(M.t>=M.duree&&M.brisees<=M.toleBris),
              rate:(M.brisees>M.toleBris)};
    }},
  { id:'calme', type:'secondaire',
    t:'NE PAS EMBRASER LA RUE', court:'TENSION',
    dit:function(o){return Math.round(o.v*100)+' % · max toléré '+Math.round(o.c*100)+' %';},
    test:function(M,s){
      var T=s.sim.tension;
      M.tensionMax=Math.max(M.tensionMax,T);
      return {v:T, c:0.80, fait:(M.t>=M.duree&&M.tensionMax<=0.80), rate:(M.tensionMax>0.80)};
    }}
  ];
}

/* ---------------------------------------------------------------------
   LA CREATION
   --------------------------------------------------------------------- */
MIS.creer=function(o){
  var d=new De(o.graine||1234);
  var M={
    graine:o.graine, t:0, duree:150000,
    ligne:o.ligne,            /* la limite derriere laquelle on a perdu */
    /* DOUZE PASSAGES TOLERES. A six, une poussee reussie suffisait a
       tout perdre d'un coup, sans qu'on ait eu le temps de reagir : une
       mission se perd sur une suite de fautes, pas sur une seconde. */
    /* VINGT-SIX ET QUARANTE-DEUX, RECALIBRES SUR UNE MESURE.
       Le passage des barrieres fait maintenant treize tuiles pour un
       cordon qui en couvre huit, et les quatre blocs du cortege
       attaquent quatre bandes differentes : il filtre du monde en
       permanence au lieu de ne rien laisser passer pendant deux
       minutes. Mesure sur trois graines, personne aux commandes :
       entre 35 et 57 passages. La police en tolere 56 — moins que le
       flux passif, donc ne rien faire est perdant. Le cortege doit en
       faire passer 52 — plus que ce que l'IA policiere laisse filtrer, donc le laisser
       couler tout seul ne suffit pas non plus.
       DEUX SEUILS, PAS UN : le meme chiffre des deux cotes rendait un
       des camps ingagnable, puisqu'il devait faire mieux que ce que
       l'autre avait le droit de laisser. */
    tolere:56, objectif:52, toleBris:0,
    passes:0, brisees:0, tensionMax:0,
    gaz:0, charges:0, fauteCam:0,
    camp:(o.camp||'crs'),
    fin:null, score:0, journal:[], enFuite:0, barricades:0,
    obj:(o.camp==='manif')?objectifsManif():objectifs(), etats:{},
    file:[], courant:null, alerte:null, alerteT:0,
    vitrines:o.vitrines||[], ciblee:null, casseurs:null, contourSens:0,
    presseJusqu:0, briefT:7200
  };
  /* LA FILE D'EVENEMENTS, tiree une fois. Les minutes varient de huit
     secondes et l'ordre des quatre du milieu est melange : deux parties
     ne se ressemblent pas, et la meme graine se rejoue a l'identique. */
  var milieu=['casseurs','renfortCortege','presse','incendie'];
  for(var i=milieu.length-1;i>0;i--){var j=d.e(0,i);var t=milieu[i];milieu[i]=milieu[j];milieu[j]=t;}
  var plan=['poussee'].concat(milieu).concat(['poussee','renfort']);
  /* LES MINUTES N'ONT PAS BOUGE. Ajouter l'incendie en redistribuant
     tout le calendrier avancait le renfort du cortege de quatre
     secondes — assez pour que la police ne tienne plus une seule
     partie. Le quatrieme creneau s'INSERE entre les anciens. */
  var base=[16000,40000,56000,72000,92000,116000,134000];
  for(var k=0;k<plan.length;k++){
    M.file.push({k:plan[k], t:base[k]+d.e(-8000,8000)});
  }
  M.file.sort(function(a,b){return a.t-b.t;});
  M.ciblee=M.vitrines.length?M.vitrines[d.e(0,M.vitrines.length-1)]:null;
  M.contourSens=d.f()<0.5?-1:1;
  M.de=d;
  return M;
};

/* ---------------------------------------------------------------------
   UN PAS DE MISSION
   --------------------------------------------------------------------- */
MIS.pas=function(M,s,dt,api){
  if(M.fin)return;
  M.t+=dt;
  if(M.briefT>0)M.briefT-=dt;
  if(M.alerteT>0)M.alerteT-=dt;
  /* les evenements dus */
  while(M.file.length&&M.file[0].t<=M.t){
    var e=M.file.shift();
    var C=null;
    for(var i=0;i<CATALOGUE.length;i++)if(CATALOGUE[i].k===e.k)C=CATALOGUE[i];
    M.alerte=C; M.alerteT=4200;
    M.journal.push({t:M.t, k:e.k, t2:C.t});
    api.evenement(e.k, M);
    if(e.k==='presse')M.presseJusqu=M.t+C.dur;
  }
  /* LA DEVANTURE VISEE casse si les casseurs restent dessus. C'est le
     seul moyen de la perdre, et le seul moyen de la sauver est de les
     deloger : rien n'est decide par un chronometre. */
  if(M.ciblee&&M.casseurs&&!M.ciblee.brisee){
    var n=0, A=s.sim.agents, G=M.casseurs;
    for(var m=0;m<G.membres.length;m++){
      var a=A[G.membres[m]];
      var dx=a.x-M.ciblee.x, dy=a.y-M.ciblee.y;
      if(dx*dx+dy*dy<6.0&&a.etat!=='PANIQUE'&&a.etat!=='FUIT')n++;
    }
    M.ciblee.pres=n;
    if(n>=4){
      M.ciblee.travail=(M.ciblee.travail||0)+dt*(n/6);
      if(M.ciblee.travail>5200){
        M.ciblee.brisee=true; M.brisees++;
        if(window.CORDON_SON)window.CORDON_SON.effet('verre');
        M.alerte={t:'DEVANTURE BRISÉE',d:'Elle comptera dans le rapport.'};M.alerteT=3600;
      }
    }else M.ciblee.travail=Math.max(0,(M.ciblee.travail||0)-dt*0.8);
  }
  /* les objectifs, recalcules a partir de la simulation */
  var fini=false, rate=false;
  for(var o=0;o<M.obj.length;o++){
    var O=M.obj[o], r=O.test(M,s);
    M.etats[O.id]=r;
    if(r.rate&&O.type==='principal')rate=true;
  }
  /* LA TENSION A FOND EST UNE DEFAITE : la rue a basculé. */
  if(s.sim.tension>=0.97)rate=true;
  if(M.camp==='manif'){
    /* LE CORTEGE GAGNE DES QU'IL EST PASSE : il n'a pas a attendre la
       fin du chrono pour que ce soit acquis. */
    if(M.passes>=M.objectif){MIS.terminer(M,s,true);return;}
    if(M.t>=M.duree){MIS.terminer(M,s,false);return;}
    return;
  }
  if(rate){MIS.terminer(M,s,false);return;}
  if(M.t>=M.duree){MIS.terminer(M,s,true);return;}
};

/* UNE CHARGE DEVANT LES CAMERAS SE PAIE. C'est la conséquence : pas un
   message, une ligne de moins au rapport et des points en moins. */
/* LES SECONDES DE ZONE TENUE. La rue les compte, la mission les
   additionne : elle ne sait pas ou sont les zones, et c'est tres bien. */
function zoneSec(M){
  if(!M.zones)return 0;
  return (M.zones.passage||0)+(M.zones.percee||0)+(M.zones.fontaine||0);
}
/* DEUX POINTS LA SECONDE DE TERRAIN TENU. Sur deux minutes trente, une
   zone gardee du debut a la fin vaut 300 points : assez pour qu'on la
   defende, pas assez pour gagner en l'ignorant le reste. */
function zonePoints(M){return zoneSec(M)*2;}
MIS.noterZone=function(M,k,mien){
  if(!M.zones)M.zones={passage:0,percee:0,fontaine:0};
  if(mien)M.zones[k]=(M.zones[k]||0)+1;
};
MIS.noter=function(M,k){
  if(k==='gaz')M.gaz++;
  /* SOMME : ca compte quand meme comme un gaz, mais ce n'est plus une
     faute devant les cameras. La sommation n'efface pas le geste, elle
     le rend legitime. */
  if(k==='gazSomme'){M.gaz++;M.sommes=(M.sommes||0)+1;}
  if(k==='eauSomme'){M.eau=(M.eau||0)+1;M.sommes=(M.sommes||0)+1;}
  if(k==='charge')M.charges++;
  if(k==='eau')M.eau=(M.eau||0)+1;
  if(k==='molotov')M.molotovs=(M.molotovs||0)+1;
  if(k==='feu')M.feux=(M.feux||0)+1;
  if((k==='gaz'||k==='charge'||k==='eau')&&M.t<M.presseJusqu)M.fauteCam++;
};

MIS.terminer=function(M,s,gagne){
  if(M.fin)return;
  M.fin=gagne?'gagne':'perdu';
  /* LE SCORE : ce qu'on a tenu, moins ce qu'on a coûté. */
  var sc=0;
  if(M.camp==='manif'){
    /* COTE CORTEGE : ce qu'on a fait passer, ce qu'on a marque, et le
       temps qu'on a mis — vite vaut mieux que tard. */
    /* HUIT POINTS PAR PASSAGE cote cortege aussi : l'objectif est passe
       de douze a quarante-deux, et trente-quatre points l'un donnait
       quatorze cents points pour une partie quelconque. */
    sc+=M.passes*8;
    sc+=zonePoints(M);
    sc+=(M.barricades||0)*150;
    sc+=M.brisees*90;
    if(gagne)sc+=400+Math.max(0,Math.round((M.duree-M.t)/1000))*4;
    sc+=(M.molotovs||0)*60;
    sc-=Math.round((M.enFuite||0)*2.2);
    M.score=Math.max(0,sc);
    M.detail=[
      ['Passés ('+M.passes+')', '+'+M.passes*34],
      ['Barricades ('+(M.barricades||0)+')', '+'+(M.barricades||0)*150],
      ['Devantures ('+M.brisees+')', '+'+M.brisees*90],
      ['Ligne franchie', gagne?('+'+(400+Math.max(0,Math.round((M.duree-M.t)/1000))*4)):'0'],
      ['Cocktails ('+(M.molotovs||0)+')', '+'+(M.molotovs||0)*60],
      ['Cortège dispersé ('+(M.enFuite||0)+')', '-'+Math.round((M.enFuite||0)*2.2)]
    ];
    return;
  }
  sc+=zonePoints(M);
  sc+=Math.round(Math.min(M.t,M.duree)/1000)*6;          /* le temps tenu */
  if(gagne)sc+=400;
  /* HUIT POINTS PAR PASSAGE, pas douze. Le seuil tolere est passe de
     dix-huit a vingt-six : a douze points, une partie gagnee de justesse
     finissait sous zero. */
  sc-=M.passes*8;
  sc-=M.brisees*180;
  sc-=M.gaz*35;
  sc-=M.charges*20;
  sc-=(M.eau||0)*12;        /* l'eau disperse sans enflammer : elle coute moins */
  sc-=M.fauteCam*120;
  sc-=(M.feux||0)*90;
  sc-=Math.round(M.tensionMax*320);
  M.score=Math.max(0,sc);
  M.detail=[
    ['Terrain tenu ('+zoneSec(M)+' s)', '+'+zonePoints(M)],
    ['Temps tenu', '+'+Math.round(Math.min(M.t,M.duree)/1000)*6],
    ['Mission tenue', gagne?'+400':'0'],
    ['Manifestants passés ('+M.passes+')', '-'+M.passes*8],
    ['Devantures brisées ('+M.brisees+')', '-'+M.brisees*180],
    ['Grenades ('+M.gaz+')', '-'+M.gaz*35],
    ['Charges ('+M.charges+')', '-'+M.charges*20],
    ['Lance à eau ('+(M.eau||0)+')', '-'+(M.eau||0)*12],
    ['Devant les caméras ('+M.fauteCam+')', '-'+M.fauteCam*120],
    ['Incendies ('+(M.feux||0)+')', '-'+(M.feux||0)*90],
    ['Tension maximale ('+Math.round(M.tensionMax*100)+' %)', '-'+Math.round(M.tensionMax*320)]
  ];
};

MIS.CATALOGUE=CATALOGUE;
window.CORDON_MISSION=MIS;
})();
