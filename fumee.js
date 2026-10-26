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
/* LES FLAMMES, peintes une fois elles aussi. Trois langues de feu de
   formes differentes : une flamme qui serait toujours le meme dessin se
   lit comme un logo, pas comme du feu. */
var FLAM=null;
function flammes(){
  if(FLAM)return FLAM;
  FLAM=[];
  for(var k=0;k<3;k++){
    var W=20, H=30, cv=document.createElement('canvas');
    cv.width=W; cv.height=H;
    var g=cv.getContext('2d');
    /* trois couches : le coeur blanc, l'orange, le rouge sombre */
    var C=[['rgba(255,86,24,0.0)','rgba(255,120,40,0.85)',1.0],
           ['rgba(255,160,40,0.0)','rgba(255,196,80,0.92)',0.68],
           ['rgba(255,250,210,0.0)','rgba(255,248,214,0.95)',0.36]];
    for(var c=0;c<3;c++){
      var w=W*C[c][2], h=H*C[c][2];
      var gr=g.createLinearGradient(0,H,0,H-h);
      gr.addColorStop(0,C[c][1]); gr.addColorStop(1,C[c][0]);
      g.fillStyle=gr;
      g.beginPath();
      g.moveTo(W/2,H-h);
      g.quadraticCurveTo(W/2+w*0.5+(k-1)*2,H-h*0.45, W/2+w*0.30,H);
      g.lineTo(W/2-w*0.30,H);
      g.quadraticCurveTo(W/2-w*0.5+(k-1)*2,H-h*0.45, W/2,H-h);
      g.closePath(); g.fill();
    }
    FLAM.push(cv);
  }
  return FLAM;
}

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
  return {nuages:[], part:[], jets:[], feux:[], vols:[], flash:[], nes:0, gr:4242, libres:[]};
};

/* ---------------------------------------------------------------------
   LE FEU
   Une zone qui brule, qui tient longtemps, qu'on ne traverse pas et qui
   eclaire. Ce n'est pas un decor : elle repousse les corps, elle les
   marque, et elle bloque un passage aussi surement qu'une barricade.
   --------------------------------------------------------------------- */
FUM.feu=function(F,x,y,force,vie){
  /* deux foyers voisins n'en font qu'un, plus gros : sinon on empile
     dix feux sur la meme case et l'ecran devient une torche */
  for(var i=0;i<F.feux.length;i++){
    var f=F.feux[i];
    var dx=f.x-x, dy=f.y-y;
    if(dx*dx+dy*dy<2.2){
      f.r=Math.min(3.4,f.r+0.5);
      f.vie=Math.max(f.vie,f.t+(vie||34000));
      return f;
    }
  }
  /* HUIT FOYERS AU PLUS. Au-dela on ne voit plus la place, et le
     dessin s'effondre : le plus vieux cede sa place. */
  if(F.feux.length>=8)F.feux.shift();
  var N={x:x, y:y, r:1.25, t:0, vie:(vie||34000), f:(force||1)};
  F.feux.push(N); F.nes++;   /* compteur cumulatif : la mission le lit */
  return N;
};
/* UN PROJECTILE : il part, il vole en arc, il tombe. Le feu ne nait
   qu'a l'impact — on voit donc la bouteille partir et on sait d'ou. */
FUM.projectile=function(F,x,y,cx,cy,quoi,retard){
  F.vols.push({x:x,y:y,x0:x,y0:y,cx:cx,cy:cy,t:-(retard||0),z:0,
               vie:420+Math.hypot(cx-x,cy-y)*95, quoi:quoi||'molotov',
               /* LA BOUTEILLE TOURNE. Un objet lance sur quinze metres
                  qui garde la meme orientation ne vole pas, il glisse. */
               rot:al(F)*6.283, vrot:0.006+al(F)*0.004, tr:0});
};
/* LA BOUTEILLE, PEINTE EN HUIT ANGLES. Trois rectangles empiles ne
   ressemblaient a rien : on voyait un point orange traverser la place.
   Ici c'est un vrai objet — verre vert, essence ambree au fond, goulot,
   chiffon blanc et sa flamme — tourne une fois pour toutes dans les
   huit directions qu'il prend en vol. Huit vignettes de 16x16 peintes
   au premier lancer, et plus rien a calculer ensuite. */
var BOUT=null;
function bouteilles(){
  if(BOUT)return BOUT;
  BOUT=[];
  for(var a=0;a<8;a++){
    var c=document.createElement('canvas'); c.width=c.height=16;
    var g=c.getContext('2d');
    g.translate(8,8); g.rotate(a*Math.PI/4);
    /* LE LISERE SOMBRE d'abord : au-dessus d'une foule de deux cents
       personnes, un objet de six pixels sans contour disparait. */
    g.fillStyle='#10210f'; g.fillRect(-2,-4,4,9);
    /* le corps : verre vert, un reflet clair sur le flanc gauche */
    g.fillStyle='#2f6b3a'; g.fillRect(-1,-3,2,7);
    g.fillStyle='#5ab067'; g.fillRect(-1,-3,1,7);
    /* l'essence, au fond, plus sombre que le verre pour qu'on la voie */
    g.fillStyle='#a8701a'; g.fillRect(-1,1,2,3);
    g.fillStyle='#d99c35'; g.fillRect(-1,1,1,3);
    /* le goulot */
    g.fillStyle='#10210f'; g.fillRect(-1,-5,2,2);
    g.fillStyle='#3d7d45'; g.fillRect(-1,-5,1,2);
    /* le chiffon, et sa flamme */
    g.fillStyle='#e8e0cc'; g.fillRect(-1,-7,2,2);
    g.fillStyle='#ff8a1e'; g.fillRect(-1,-9,2,2);
    g.fillStyle='#ffe06a'; g.fillRect(-1,-10,1,2);
    BOUT.push(c);
  }
  return BOUT;
}
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
  /* ---- LES FOYERS ---- */
  for(i=F.feux.length-1;i>=0;i--){
    var fe=F.feux[i]; fe.t+=dt;
    var vieu=fe.t/fe.vie;
    /* les langues de feu, et la fumee noire qui monte avec */
    /* LE BUDGET DU FEU. Quatre foyers a trente-cinq particules chacun
       doublaient le temps de dessin : ce sont des blits etires avec
       transparence, les plus chers de la scene. Moins nombreux et plus
       gros, le brasier est aussi beau et deux fois moins lourd. */
    if((fe.t%95)<dt){
      var nf=(vieu<0.75)?2:1;
      for(var q2=0;q2<nf;q2++){
        var pf=naitre(F,fe.x+(al(F)-0.5)*fe.r*1.5,fe.y+(al(F)-0.5)*fe.r*0.9,
                      0.0004,330+al(F)*260,3);
        pf.vz=0.026+al(F)*0.022; pf.r=0.45+al(F)*0.5;
      }
    }
    if((fe.t%300)<dt){
      var pn=naitre(F,fe.x+(al(F)-0.5)*fe.r,fe.y+(al(F)-0.5)*fe.r*0.6,
                    0.0008,2600+al(F)*1400,4);
      pn.vz=0.012+al(F)*0.010; pn.r=1.05+al(F)*0.9;
    }
    if(fe.t>fe.vie)F.feux.splice(i,1);
  }
  /* ---- LES PROJECTILES ---- */
  for(i=F.vols.length-1;i>=0;i--){
    var V=F.vols[i]; V.t+=dt;
    /* LE RETARD. Trois bouteilles parties a la milliseconde pres font
       une figure geometrique ; a cent millisecondes d'ecart, elles font
       une salve. */
    if(V.t<0)continue;
    var u=Math.min(1,V.t/V.vie);
    V.x=V.x0+(V.cx-V.x0)*u;
    V.y=V.y0+(V.cy-V.y0)*u;
    V.z=Math.sin(u*Math.PI)*22;      /* l'arc */
    V.rot+=V.vrot*dt;
    /* LA TRAINEE. Le chiffon brule pendant tout le vol : il seme des
       braises derriere lui. C'est ce qui fait qu'on SUIT la bouteille
       des yeux au lieu de la retrouver a l'arrivee. */
    V.tr+=dt;
    if(V.tr>55){
      V.tr=0;
      var pt=naitre(F,V.x,V.y,0.0003,240+al(F)*180,3);
      pt.z=V.z; pt.vz=-0.004; pt.r=0.20+al(F)*0.14;
      if(al(F)<0.45){
        var ps=naitre(F,V.x,V.y,0.0002,900+al(F)*500,4);
        ps.z=V.z; ps.vz=0.004; ps.r=0.26+al(F)*0.18;
      }
    }
    if(u>=1){
      if(V.quoi==='molotov'){
        FUM.feu(F,V.x,V.y,1,34000);
        /* L'IMPACT, EN TROIS COUCHES.
           La gerbe : des langues de feu projetees vers le haut et sur
           les cotes, c'est le souffle.
           Les eclats : du verre qui gicle a plat, vite et loin, qui
           retombe en une demi-seconde.
           La nappe : l'essence qui s'etale au sol autour du point de
           chute, basse et large, et qui s'eteint la premiere.
           Et le flash, une lumiere d'un dixieme de seconde : sans lui
           l'impact commence mollement. */
        for(var q3=0;q3<14;q3++){
          var pe=naitre(F,V.x,V.y,0.0026,260+al(F)*260,3);
          pe.vz=0.020+al(F)*0.034; pe.r=0.42+al(F)*0.55;
        }
        for(var q4=0;q4<12;q4++){
          var pv=naitre(F,V.x,V.y,0.0075,280+al(F)*220,5);
          pv.vz=0.012+al(F)*0.022; pv.r=0.5+al(F)*0.5;
        }
        for(var q5=0;q5<8;q5++){
          var pn=naitre(F,V.x,V.y,0.0040,420+al(F)*300,6);
          pn.z=0; pn.vz=0; pn.r=0.6+al(F)*0.7;
        }
        F.flash.push({x:V.x,y:V.y,t:0,vie:170});
      }
      F.vols.splice(i,1);
    }
  }
  for(i=F.flash.length-1;i>=0;i--){
    F.flash[i].t+=dt; if(F.flash[i].t>F.flash[i].vie)F.flash.splice(i,1);
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
    /* ON NE TRAVERSE PAS UN FEU. Il repousse fort et de pres, et il
       marque ceux qui s'en approchent : c'est ce qui en fait un
       obstacle et pas un decor. */
    for(i=0;i<F.feux.length;i++){
      var fe2=F.feux[i];
      var fx2=ag.x-fe2.x, fy2=ag.y-fe2.y, f2=fx2*fx2+fy2*fy2;
      var port=fe2.r+1.3;
      if(f2<port*port&&f2>1e-6){
        var fl=Math.sqrt(f2);
        var rep=(1-fl/port)*0.00052;
        ag.vx+=fx2/fl*rep*dt; ag.vy+=fy2/fl*rep*dt;
        ag.choc=Math.min(1.5, ag.choc + dt*0.00085*(1-fl/port));
        /* ON NE TIENT PAS UNE LIGNE DANS LES FLAMMES. Le corps est
           marque pour une seconde ; c'est la simulation qui decide
           quoi en faire, pas le dessin. */
        ag.brule=900;
        /* LE COEUR NE SE TRAVERSE PAS. Une poussee, meme forte, se
           laisse vaincre par deux cents corps qui avancent ; un mur,
           non. Sous le rayon du foyer on est repose sur le bord et la
           vitesse qui rentrait est annulee. C'est ce qui fait d'un feu
           un obstacle plutot qu'un decor. */
        if(fl<fe2.r){
          var ux=fx2/fl, uy=fy2/fl;
          ag.x=fe2.x+ux*fe2.r; ag.y=fe2.y+uy*fe2.r;
          var dot=ag.vx*ux+ag.vy*uy;
          if(dot<0){ag.vx-=ux*dot; ag.vy-=uy*dot;}
        }
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
      /* LA BANDEROLE SERT DE BOUCLIER. Un tissu tendu sur deux hampes,
         c'est ce que la tete d'un cortege oppose a un canon a eau — et
         ca marche : celui qui la tient encaisse le tiers, et il protege
         ceux qui sont derriere lui. Rien a activer, il suffit de mettre
         les porteurs devant. */
      if(ag.type==='banderole'){f*=0.34; }
      else if(ag.abrite>0){f*=0.55;}
      ag.vx+=J.dx*f*dt; ag.vy+=J.dy*f*dt;
      ag.choc=Math.min(0.9, ag.choc + dt*0.00022*(ag.type==='banderole'?0.4:1));
    }
  }
};

/* ---------------------------------------------------------------------
   LE DESSIN
   --------------------------------------------------------------------- */
/* LE HALO D'UN FOYER, pose AVANT les corps : une flamme eclaire ce qui
   l'entoure, elle ne se colle pas devant. */
/* LE HALO ET LA TRACE, PEINTS UNE FOIS. Un degrade radial construit a
   chaque image coutait plus cher que tout le reste du feu reuni : ici
   on peint deux vignettes au premier allumage et on ne fait plus que
   les etirer. */
var HALO=null, TRACE=null;
function halos(){
  if(HALO)return;
  var c=document.createElement('canvas'); c.width=c.height=128;
  var g=c.getContext('2d');
  var gr=g.createRadialGradient(64,64,0,64,64,64);
  /* CHAUD, PAS BLANC. Quatre foyers voisins empilent quatre halos :
     a 0,36 au centre la place virait au jaune laiteux et on ne voyait
     plus le pavé. */
  gr.addColorStop(0,'rgba(255,152,48,0.30)');
  gr.addColorStop(0.42,'rgba(238,98,22,0.13)');
  gr.addColorStop(1,'rgba(200,70,12,0)');
  g.fillStyle=gr; g.fillRect(0,0,128,128);
  HALO=c;
  var t=document.createElement('canvas'); t.width=t.height=64;
  var h=t.getContext('2d');
  var tr=h.createRadialGradient(32,32,0,32,32,32);
  tr.addColorStop(0,'rgba(18,14,12,1)');
  tr.addColorStop(0.72,'rgba(18,14,12,0.9)');
  tr.addColorStop(1,'rgba(18,14,12,0)');
  h.fillStyle=tr; h.fillRect(0,0,64,64);
  TRACE=t;
}
FUM.dessineSol=function(F,g,mx,my,x0,x1,y0,y1,nuit){
  if(!F.feux.length)return;
  halos();
  var a0=g.globalAlpha;
  for(var i=0;i<F.feux.length;i++){
    var f=F.feux[i];
    var px=mx(f.x,f.y), py=my(f.x,f.y);
    if(px<x0-80||px>x1+80||py<y0-80||py>y1+80)continue;
    var vie=f.t/f.vie, v=(vie>0.8)?(1-(vie-0.8)/0.2):1;
    /* SERRE AUTOUR DU FOYER. A f.r*26 la lueur couvrait un tiers de
       l'ecran et effacait le pave ; un feu eclaire ses deux metres,
       pas la place entiere. */
    var R=f.r*15*(0.9+0.1*Math.sin(f.t*0.009));
    /* la trace noire au sol, qui reste */
    g.globalAlpha=a0*0.34*Math.min(1,f.t/5000);
    var tw=f.r*22, th=f.r*11;
    g.drawImage(TRACE,(px-tw/2)|0,(py+2-th/2)|0,tw|0,th|0);
    g.globalAlpha=a0*v;
    g.drawImage(HALO,(px-R)|0,(py-R*0.55)|0,(R*2)|0,(R*1.1)|0);
  }
  g.globalAlpha=a0;
};

FUM.dessine=function(F,g,mx,my,x0,x1,y0,y1){
  var P=puffs(), FL=flammes(), i;
  for(i=0;i<F.part.length;i++){
    var p=F.part[i];
    var px=mx(p.x,p.y), py=my(p.x,p.y)-p.z;
    if(px<x0-60||px>x1+60||py<y0-80||py>y1+60)continue;
    var vie=p.t/p.vie;
    if(p.type===3){
      /* UNE LANGUE DE FEU : elle monte, s'etire et maigrit. Dessinee
         debout et non ecrasee comme une bouffee — une flamme couchee
         ne ressemble a rien. */
      var a3=1-vie;
      var h3=p.r*26*(0.55+vie*0.7), w3=p.r*15*(1-vie*0.45);
      g.globalAlpha=Math.min(1,a3*1.25);
      g.drawImage(FL[p.img%3],(px-w3/2)|0,(py-h3)|0,w3|0,h3|0);
      continue;
    }
    if(p.type===4){
      /* la fumee noire d'un incendie : plus sombre et plus lente */
      var a4=(vie<0.15?(vie/0.15):(1-(vie-0.15)/0.85))*0.52;
      if(a4<=0.02)continue;
      var e4=p.r*16*(0.6+vie*1.2);
      g.globalAlpha=a4;
      g.globalCompositeOperation='source-over';
      g.drawImage(P[p.img],(px-e4)|0,(py-e4*0.62)|0,(e4*2)|0,(e4*1.24)|0);
      continue;
    }
    if(p.type===5){
      /* UN ECLAT DE VERRE : un trait clair, pas une bouffee. Il file
         dans la direction de sa vitesse et retombe. */
      var a5=1-vie;
      if(a5<=0.03)continue;
      var lv=Math.sqrt(p.vx*p.vx+p.vy*p.vy)||1e-6;
      var lx=p.vx/lv*2.6, ly=p.vy/lv*1.6;
      g.globalAlpha=a5;
      g.strokeStyle=(p.img&1)?'#ffe9a8':'#bfe8d8';
      g.lineWidth=1;
      g.beginPath();g.moveTo(px-lx,py-ly);g.lineTo(px+lx,py+ly);g.stroke();
      continue;
    }
    if(p.type===6){
      /* LA NAPPE D'ESSENCE au sol : plate, large, breve. Ecrasee bien
         plus qu'une bouffee de fumee — elle colle au pave. */
      var a6=(1-vie)*0.75;
      if(a6<=0.03)continue;
      var e6=p.r*17*(0.55+vie*1.35);
      g.globalAlpha=a6;
      g.drawImage(P[p.img],(px-e6)|0,(py-e6*0.30)|0,(e6*2)|0,(e6*0.60)|0);
      continue;
    }
    var al2=(p.type===2)?(0.5*(1-vie)):(vie<0.12?(vie/0.12):(1-(vie-0.12)/0.88));
    if(al2<=0.02)continue;
    var ech=p.r*(p.type===2?7:13)*(0.5+vie*0.9);
    g.globalAlpha=al2*(p.type===2?0.5:0.85);
    g.drawImage(P[p.img],(px-ech)|0,(py-ech*0.62)|0,(ech*2)|0,(ech*1.24)|0);
  }
  g.globalAlpha=1;
  /* LE FLASH DE L'IMPACT. Un dixieme de seconde, en lumiere ajoutee :
     c'est ce qui donne le COUP. Dessine apres les particules pour
     eclairer la gerbe, et pas dessous. */
  for(i=0;i<F.flash.length;i++){
    var FS=F.flash[i], fu=FS.t/FS.vie;
    var fx3=mx(FS.x,FS.y), fy3=my(FS.x,FS.y);
    if(fx3<x0-60||fx3>x1+60)continue;
    halos();
    var fr=16+fu*46;
    g.globalCompositeOperation='lighter';
    g.globalAlpha=(1-fu)*0.75;
    g.drawImage(HALO,(fx3-fr)|0,(fy3-fr*0.6)|0,(fr*2)|0,(fr*1.2)|0);
    g.globalCompositeOperation='source-over';
  }
  g.globalAlpha=1;
  /* LES BOUTEILLES EN VOL. L'ombre d'abord, posee au sol a la verticale
     de l'objet : c'est elle, et pas la hauteur du dessin, qui dit ou la
     bouteille va tomber. Elle retrecit quand la bouteille monte. */
  var BT=bouteilles();
  for(i=0;i<F.vols.length;i++){
    var V=F.vols[i];
    if(V.t<0)continue;
    var sx3=mx(V.x,V.y), sy3=my(V.x,V.y);
    var vx=sx3, vy=sy3-(V.z||0);
    if(vx<x0-40||vx>x1+40||vy<y0-60||vy>y1+40)continue;
    var h=(V.z||0)/22;                       /* 0 au sol, 1 au sommet */
    g.globalAlpha=0.30*(1-h*0.65);
    g.fillStyle='#0a0d12';
    g.beginPath();g.ellipse(sx3,sy3+1,4.5*(1-h*0.4),2.2*(1-h*0.4),0,0,6.2832);g.fill();
    g.globalAlpha=1;
    /* ARRONDIR, PAS TRONQUER. A l'angle exact de 45 degres le quotient
       vaut 0,99999 et la troncature renvoyait la vignette du dessous :
       deux angles sur huit etaient identiques. */
    var bi=((Math.round(V.rot/0.7854)%8)+8)%8;
    g.drawImage(BT[bi],(vx-8)|0,(vy-8)|0);
  }
};

window.CORDON_FUMEE=FUM;
})();
