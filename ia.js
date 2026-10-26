/* =====================================================================
   LE CORDON — L'IA DU CAMP QU'ON NE JOUE PAS

   DES REGLES, PAS DES SCRIPTS. Chaque decision sort d'une condition
   qu'on peut lire a voix haute : « s'il y a plus de vingt corps au
   contact depuis plus de trois secondes, et que le gaz est recharge,
   gazer ». Pas de minuterie qui declenche une action parce que c'est
   l'heure — sinon on joue contre un metronome et on le sent.

   DEUX CERVEAUX, un par camp, qui ne tournent jamais ensemble : celui
   du camp joue est au repos, c'est le joueur qui commande.

   LE PALIER DE DECISION. L'IA ne decide pas soixante fois par seconde :
   elle regarde la rue quatre fois par seconde et ne change d'avis que
   si la situation a change. Une IA qui reevalue a chaque image donne
   des ordres contradictoires et ses unites tremblent sur place.
   ===================================================================== */
(function(){
'use strict';
var IA={};

function cl(v,a,b){return v<a?a:(v>b?b:v);}

IA.creer=function(camp){
  return {
    camp:camp,            /* le camp que l'IA tient */
    t:0, dernier:0,
    gazRech:0, eauRech:0, chargeRech:0,
    etat:'tient', etatT:0, journal:[]
  };
};

function dire(A,txt){
  A.journal.push(txt);
  if(A.journal.length>12)A.journal.shift();
}

/* =====================================================================
   L'IA DU CORDON — elle tourne quand le joueur est manifestant
   ===================================================================== */
IA.pasCRS=function(A,s,dt,api){
  A.t+=dt; A.etatT+=dt;
  A.gazRech=Math.max(0,A.gazRech-dt);
  A.eauRech=Math.max(0,A.eauRech-dt);
  A.chargeRech=Math.max(0,A.chargeRech-dt);
  if(A.t-A.dernier<250)return;
  A.dernier=A.t;

  var sim=s.sim, lignes=[], reserve=null, camions=null;
  for(var i=0;i<s.tous.length;i++){
    var U=s.tous[i];
    if(U.camp!=='crs')continue;
    if(U.camions)camions=U;
    else if(U.reserve)reserve=U;
    else lignes.push(U);
  }
  if(!lignes.length)return;

  /* ---- CE QU'ELLE VOIT ---- */
  var presse=0, tension=sim.tension, paniques=sim.paniques;
  for(i=0;i<lignes.length;i++)presse=Math.max(presse,lignes[i].presse);
  var devant=api.corpsDevant(6);        /* combien de corps a six tuiles */
  var casse=api.casseEnCours();         /* une vitrine en train de tomber */
  var barr=api.barricadeEnCours();      /* une barricade en construction */
  var perces=api.perces();              /* combien ont franchi la ligne */

  /* ---- LES REGLES, dans l'ordre de priorite ---- */

  /* 1. UNE BARRICADE QUI SE MONTE EST LE PIRE DES DANGERS : une fois
        debout, on ne la reprend plus. On charge dessus. */
  if(barr&&A.chargeRech<=0){
    var u1=api.plusProche(lignes,barr.x,barr.y);
    if(u1){
      api.aller(u1,barr.x,barr.y);
      api.formation(u1,'coin');
      A.chargeRech=11000;
      dire(A,'charge sur la barricade');
      return;
    }
  }
  /* 1 bis. UNE FEINTE. Elle se jette en avant de facon ostensible, et
        l'IA fait ce que ferait un commandant : elle envoie la reserve
        au bruit. C'est exactement ce que le joueur cherche — et c'est
        pour ca que la feinte ne vaut que si on en profite ailleurs. */
  var fei=api.feinte&&api.feinte();
  if(fei&&reserve&&!reserve.occupee){
    api.aller(reserve,fei.x,fei.y);
    reserve.occupee=true;
    dire(A,'réserve au plus bruyant');
    return;
  }
  /* 2. UNE VITRINE QUI TOMBE : la reserve y va. Elle ne tient aucun
        front, c'est a ca qu'elle sert. */
  if(casse&&reserve&&!reserve.occupee){
    api.aller(reserve,casse.x,casse.y);
    reserve.occupee=true;
    dire(A,'réserve sur la devanture');
    return;
  }
  if(reserve&&reserve.occupee&&!casse){
    api.tenir(reserve); reserve.occupee=false;
    dire(A,'réserve rappelée');
  }
  /* 3. DES CORPS ONT FRANCHI : on recule d'un rang pour refermer plutot
        que de rester devant un trou. */
  if(perces>=4&&A.etat!=='replie'){
    lignes.forEach(function(U){api.reculer(U);});
    A.etat='replie'; A.etatT=0;
    dire(A,'repli d’un pas');
    return;
  }
  if(A.etat==='replie'&&A.etatT>4500&&perces<2){
    lignes.forEach(function(U){api.tenir(U);});
    A.etat='tient'; A.etatT=0;
    dire(A,'reprise de position');
  }
  /* 4. L'EAU AVANT LE GAZ : elle disperse sans enflammer. On n'arrose
        que s'il y a vraiment du monde devant, sinon on arrose le vide. */
  if(camions&&A.eauRech<=0&&devant>=26&&presse>1.6){
    api.eau(camions);
    A.eauRech=9000;
    dire(A,'lance à eau');
    return;
  }
  /* 5. LE GAZ, en dernier : il coute cher et il fait monter la tension.
        Seulement si la pression tient depuis un moment ET que la tension
        n'est pas deja au plafond — gazer une rue au bord de l'emeute,
        c'est l'emeute. */
  if(A.gazRech<=0&&presse>2.6&&devant>=34&&tension<0.72){
    var u2=api.plusPresse(lignes);
    if(u2){
      api.gaz(u2);
      A.gazRech=14000;
      dire(A,'grenade');
      return;
    }
  }
  /* 6. RIEN D'URGENT : on avance d'un pas si la place s'est degagee, on
        tient sinon. Une ligne qui ne reprend jamais le terrain perdu
        recule jusqu'au mur. */
  if(A.etat==='tient'&&presse<0.7&&devant<14&&A.etatT>6000){
    lignes.forEach(function(U){api.avancer(U);});
    A.etatT=0;
    dire(A,'on reprend du terrain');
  }
};

/* =====================================================================
   L'IA DU CORTEGE — elle tourne quand le joueur est policier
   ===================================================================== */
IA.pasManif=function(A,s,dt,api){
  A.t+=dt; A.etatT+=dt;
  if(A.t-A.dernier<400)return;
  A.dernier=A.t;
  var sim=s.sim;
  var blocs=[];
  for(var i=0;i<s.tous.length;i++)if(s.tous[i].camp==='manif')blocs.push(s.tous[i]);
  if(!blocs.length)return;
  /* le cortege pousse, et ceux de derriere suivent. C'est deja ce que
     fait majCortege ; l'IA ne s'en mele que pour les decisions. */
  var tension=sim.tension;
  /* quand ca chauffe trop, la queue decroche d'elle-meme */
  if(tension>0.78&&A.etat!=='decroche'){
    api.reculer(blocs[blocs.length-1]);
    A.etat='decroche'; A.etatT=0;
    dire(A,'la queue décroche');
  }
  if(A.etat==='decroche'&&tension<0.5&&A.etatT>6000){
    api.pousser(blocs[blocs.length-1]);
    A.etat='pousse'; A.etatT=0;
    dire(A,'elle revient');
  }
};

window.CORDON_IA=IA;
})();
