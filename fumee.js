/* =====================================================================
   LE CORDON — LA FUMEE ET L'EAU

   DEUX NUAGES ET UN JET, et ils ne sont pas decoratifs : la fumee est
   une ZONE qui tient huit secondes et qui prend tous ceux qui entrent
   dedans, pas un eclair au moment du tir. Le jet d'eau POUSSE les corps
   tant qu'il arrose. Si on efface le dessin, les deux continuent d'agir.

   LE DESSIN : des bouffees pre-peintes une fois, recopiees avec une
   echelle et une opacite. Un degrade radial calcule par bouffee et par
   image, a quarante bouffees par nuage, coute plus cher que toute la
   foule reunie.
   ===================================================================== */
(function(){
'use strict';
var FUM={};

/* ---------------------------------------------------------------------
   LES BOUFFEES, peintes une fois
   --------------------------------------------------------------------- */
var PUFF=null;
function puffs(){
  if(PUFF)return PUFF;
  PUFF=[];
  for(var k=0;k<4;k++){
    var R=34, cv=document.createElement('canvas');
    cv.width=R*2; cv.height=R*2;
    var g=cv.getContext('2d');
    /* un coeur dense, un bord dechire : trois disques decales valent
       mieux qu'un cercle parfait, qui se lit toujours comme un cercle */
    for(var i=0;i<3;i++){
      var a=(k*1.7+i*2.1), dx=Math.cos(a)*R*0.17, dy=Math.sin(a)*R*0.13;
      var gr=g.createRadialGradient(R+dx,R+dy,0,R+dx,R+dy,R*(0.72+i*0.09));
      /* LA COULEUR D'UN LACRYMOGENE : un blanc qui tire sur le
         jaune-vert, jamais un blanc pur. En blanc pur le nuage se
         lisait comme un flash d'appareil photo. */
      gr.addColorStop(0,'rgba(244,246,218,0.30)');
      gr.addColorStop(0.42,'rgba(232,238,206,0.17)');
      gr.addColorStop(1,'rgba(222,230,198,0)');
      g.fillStyle=gr; g.fillRect(0,0,R*2,R*2);
    }
    PUFF.push(cv);
  }
  return PUFF;
}

/* ---------------------------------------------------------------------
   LE MODELE
   --------------------------------------------------------------------- */
FUM.creer=function(){
  return {nuages:[], part:[], jets:[], gr:4242, libres:[]};
};
function al(F){F.gr=(F.gr*16807)%2147483647;return (F.gr-1)/2147483646;}

/* UNE GRENADE. Elle pose un nuage qui grossit, derive et se dissipe,
   et qui marque qui est dedans tant qu'il tient. */
FUM.grenade=function(F,x,y,force){
  var N={x:x, y:y, r:1.2, rMax:4.6, t:0, vie:9000, f:(force||1), vx:0, vy:0};
  F.nuages.push(N);
  /* les bouffees : on les reutilise au lieu d'en creer a chaque fois */
  for(var i=0;i<22;i++)naitre(F,x,y,0.0024,1500+al(F)*1100,1);
  return N;
};
function naitre(F,x,y,v,vie,type){
  var p=F.libres.length?F.libres.pop():{};
  var a=al(F)*6.283, s=v*(0.35+al(F));
  p.x=x; p.y=y;
  p.vx=Math.cos(a)*s; p.vy=Math.sin(a)*s*0.6;
  p.z=al(F)*5; p.vz=0.004+al(F)*0.010;
  p.t=0; p.vie=vie; p.r=0.5+al(F)*0.8;
  p.rot=al(F)*6.283; p.img=(al(F)*4)|0; p.type=type||1;
  F.part.push(p);
  return p;
}
FUM.jet=function(F,x,y,dx,dy,duree){
  F.jets.push({x:x,y:y,dx:dx,dy:dy,t:0,vie:duree||2600});
};

/* UN PAS. Le nuage grossit puis s'eteint ; les particules montent et
   ralentissent ; le jet arrose. */
FUM.pas=function(F,dt,sim,R){
  var i,n;
  for(i=F.nuages.length-1;i>=0;i--){
    n=F.nuages[i]; n.t+=dt;
    n.r=Math.min(n.rMax, 1.2+n.t*0.0016);
    /* un vent tres lent, pour que le nuage ne reste pas une boule */
    n.x+=0.00012*dt; n.y-=0.00004*dt;
    /* LE NUAGE RESPIRE TANT QU'IL TIENT. Premiere version : les
       bouffees ne naissaient que pendant la premiere seconde et demie.
       A trois secondes il n'y avait plus rien a l'ecran, alors que la
       zone continuait de prendre tous ceux qui entraient dedans :
       l'effet agissait sans se voir, ce qui est le pire des deux. */
    if(n.t<n.vie*0.78&&(n.t%110)<dt){
      var nb=(n.t<900)?2:1;
      for(var q=0;q<nb;q++)
        naitre(F,n.x+(al(F)-0.5)*n.r*1.4,n.y+(al(F)-0.5)*n.r*0.9,0.0014,1900+al(F)*900,1);
    }
    if(n.t>n.vie)F.nuages.splice(i,1);
  }
  for(i=F.part.length-1;i>=0;i--){
    var p=F.part[i]; p.t+=dt;
    if(p.t>p.vie){F.part.splice(i,1);if(F.libres.length<400)F.libres.push(p);continue;}
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt;
    p.vx*=0.985; p.vy*=0.985; p.vz*=0.992;
    p.r+=dt*0.0009;
  }
  for(i=F.jets.length-1;i>=0;i--){
    var j=F.jets[i]; j.t+=dt;
    if((j.t%90)<dt)for(var k=0;k<3;k++){
      var q=naitre(F,j.x+j.dx*(0.6+al(F)*2.2),j.y+j.dy*(0.6+al(F)*2.2),0.0012,420,2);
      q.vx+=j.dx*0.0045; q.vy+=j.dy*0.0045; q.vz=0.002;
    }
    if(j.t>j.vie)F.jets.splice(i,1);
  }
  /* ---- CE QUE CA FAIT AUX CORPS ---- */
  if(!sim)return;
  var A=sim.agents;
  for(var a2=0;a2<A.length;a2++){
    var ag=A[a2];
    if(ag.camp!=='manif')continue;
    for(i=0;i<F.nuages.length;i++){
      n=F.nuages[i];
      var ex=ag.x-n.x, ey=ag.y-n.y, e2=ex*ex+ey*ey;
      if(e2<n.r*n.r){
        /* DANS LE NUAGE : le choc monte tant qu'on y reste. C'est la
           difference entre une grenade et un eclair : elle tient le
           terrain, et c'est pour ca que la dégager coute quelque chose. */
        ag.choc=Math.min(1.5, ag.choc + dt*0.0013*n.f);
      }
    }
    for(i=0;i<F.jets.length;i++){
      var J=F.jets[i];
      var jx=ag.x-J.x, jy=ag.y-J.y;
      var le=jx*J.dx+jy*J.dy;                 /* le long du jet */
      if(le<0||le>8.5)continue;
      var tr=Math.abs(jx*(-J.dy)+jy*J.dx);    /* l'ecart lateral */
      var larg=1.0+le*0.30;
      if(tr>larg)continue;
      /* LE JET POUSSE, vraiment : une force le long de son axe, plus
         forte de pres. L'eau disperse sans enflammer — elle tend moins
         qu'une grenade, et c'est tout son interet. */
      var f=(1-le/8.5)*0.000105;
      ag.vx+=J.dx*f*dt; ag.vy+=J.dy*f*dt;
      ag.choc=Math.min(0.9, ag.choc + dt*0.00022);
    }
  }
};

/* ---------------------------------------------------------------------
   LE DESSIN
   --------------------------------------------------------------------- */
FUM.dessine=function(F,g,mx,my,x0,x1,y0,y1){
  var P=puffs(), i;
  for(i=0;i<F.part.length;i++){
    var p=F.part[i];
    var px=mx(p.x,p.y), py=my(p.x,p.y)-p.z;
    if(px<x0-60||px>x1+60||py<y0-80||py>y1+60)continue;
    var vie=p.t/p.vie;
    var al2=(p.type===2)?(0.5*(1-vie)):(vie<0.12?(vie/0.12):(1-(vie-0.12)/0.88));
    if(al2<=0.02)continue;
    var ech=p.r*(p.type===2?7:13)*(0.5+vie*0.9);
    g.globalAlpha=al2*(p.type===2?0.5:0.85);
    g.drawImage(P[p.img],(px-ech)|0,(py-ech*0.62)|0,(ech*2)|0,(ech*1.24)|0);
  }
  g.globalAlpha=1;
};

window.CORDON_FUMEE=FUM;
})();
