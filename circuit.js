/* =======================================================================
   LE CIRCUIT  —  vue de dessus, et on tourne
   =======================================================================

   CE QU'ON VIENT CHERCHER ICI : rouler. Pas un chrono deguise, pas une
   gestion de course — tenir une monoplace sur un trace et tourner. Tout
   le reste est au service de ca.

   LE VOLANT TIENT DANS DEUX POUCES. La moitie gauche de l'ecran braque a
   gauche, la moitie droite braque a droite, les deux ensemble freinent,
   et rien du tout veut dire plein gaz. Aucun glissement a doser, aucun
   bouton a viser : on peut jouer a une main en tenant une barre de metro,
   et a deux mains quand on veut etre precis. C'est le schema des jeux de
   course vus de dessus depuis toujours, et il n'a pas ete ameliore.

   POURQUOI UN MODELE A DEUX VECTEURS. Faire avancer la voiture dans la
   direction ou elle pointe donne un jouet sur rail : on tourne au
   millimetre, rien ne derape, et il n'y a plus rien a piloter. On garde
   donc SEPAREMENT l'orientation de la voiture et son vecteur vitesse, et
   l'adherence ne fait que rapprocher le second de la premiere. Trop de
   vitesse dans un virage, et l'ecart ne se resorbe plus assez vite : la
   voiture glisse, le nez pointe a l'interieur pendant qu'elle part a
   l'exterieur. C'est ce qui s'appelle piloter.

   LE CIRCUIT EST PEINT UNE FOIS POUR TOUTES dans une image hors ecran,
   puis on en decoupe ce qu'on voit. Repeindre quatre mille points de
   trace a chaque image coute cher pour un decor qui ne bouge pas, et
   surtout ca interdit les details — les vibreurs, les bandes d'herbe, les
   tribunes — qui font qu'on reconnait un endroit du circuit.

   LE FANTOME EST LA RECOMPENSE. Une voiture translucide rejoue le
   meilleur tour, et on la double ou on la perd de vue. C'est plus parlant
   qu'un delta chiffre : on voit son propre retard sous la forme d'une
   voiture qui s'eloigne.

   SUR LES LIVREES : elles sont inventees, et les noms aussi. Reproduire
   les couleurs d'une ecurie reelle, c'est reproduire sa marque. Le style
   est le meme ; les voitures sont a nous.
   ===================================================================== */

var CI_L=18, CI_H=31;        /* la monoplace, en pixels */
var CI_LARGE=23;             /* la demi-largeur de la piste */
/* TROIS TOURS, PAS CINQ. Mesure faite : un tour demande vingt-huit
   secondes a un pilote-robot prudent, une vingtaine a quelqu'un qui sait
   ou freiner. Cinq tours faisaient donc une partie de deux minutes et
   demie — c'est une course, pas une borne d'arcade, et l'interet retombe
   bien avant la fin. Trois tours laissent le temps de trouver le rythme
   et de placer un chrono, sans que la partie s'etire. */
var CI_TOURS=3;
var CI_CLE='bdl.circuit.v1';

/* =====================================================================
   LA MONOPLACE, VUE DE DESSUS
   ---------------------------------------------------------------------
   Construite bande par bande et centree par le code : ecrite a la main,
   une ligne sur trois finit decalee d'un pixel et la voiture penche.
   Les lettres sont une palette, pas des couleurs : c'est ce qui permet
   de repeindre la meme carrosserie en huit livrees sans redessiner.
     K contour   c teinte principale   d seconde teinte
     e accent    n gomme               W casque       . rien
   ===================================================================== */
function CI_SPRITE(){
  var A=[], i;
  function C(m){var d=(CI_L-m.length)>>1;return '.'.repeat(d)+m+'.'.repeat(CI_L-m.length-d);}
  function px(l,mot,ec){
    var t=l.split(''), n=mot.length, g=(CI_L>>1)-ec-n, dt=(CI_L>>1)+ec;
    for(var k=0;k<n;k++){ if(mot[k]!=='.'){ t[g+k]=mot[k]; t[dt+k]=mot[k]; } }
    return t.join('');
  }
  A.push(C('KKKKKKKKKKKKKKKK'));          /* 0  l'aileron avant */
  A.push(C('KddddddddddddddK'));
  A.push(C('KKKKcccccccckKKK').replace('k','c'));
  A.push(C('KccK'));                       /* 3  le nez */
  A.push(C('KccK'));
  A.push(C('KccK'));
  A.push(C('KccccK'));                     /* 6 */
  A.push(C('KccccK'));
  A.push(C('KceecK'));
  A.push(C('KccccccK'));                   /* 9 */
  A.push(C('KccccccK'));
  A.push(C('KcddddcK'));
  A.push(C('KccddccK'));                   /* 12  le cockpit */
  A.push(C('KcKWWKcK'));
  A.push(C('KcKWWKcK'));
  A.push(C('KccKKccK'));
  A.push(C('KcccccccccK'));                /* 16  les pontons */
  A.push(C('KcceeeeeccK'));
  A.push(C('KcceeeeeccK'));
  A.push(C('KcccccccccK'));
  A.push(C('KcccccccccK'));                /* 20 */
  A.push(C('KccdddddccK'));
  A.push(C('KcccccccccK'));
  A.push(C('KKccccccckK').replace('k','c'));
  A.push(C('.KccccccK.'));                 /* 24  le moteur */
  A.push(C('.KceecK..').replace('..','.'));
  A.push(C('.KccccK.'));
  A.push(C('.KKccKK.'));
  A.push(C('KKKKKKKKKKKKKKKK'));           /* 28  l'aileron arriere */
  A.push(C('KeeeeeeeeeeeeeeK'));
  A.push(C('KKKKKKKKKKKKKKKK'));
  for(i=5;i<=10;i++) A[i]=px(A[i],'KnK',6);   /* les roues avant */
  for(i=19;i<=25;i++)A[i]=px(A[i],'KnnK',5);  /* les roues arriere */
  return A;
}
var CI_ART=null;

/* HUIT LIVREES, INVENTEES. Trois teintes chacune : la carrosserie, un
   rappel sur le nez et les ailerons, un accent sur les pontons. */
var CI_ECURIES=[
  {n:'MISTRAL',  c:'#ff7a1e', d:'#1c2330', e:'#ffd24a'},
  {n:'CALANQUE', c:'#0f8f86', d:'#f2f6f7', e:'#ff4a6a'},
  {n:'LE J4',    c:'#1b3fa8', d:'#f2f6f7', e:'#ffd24a'},
  {n:'PHOCÉEN',  c:'#c81e28', d:'#f2f6f7', e:'#1c2330'},
  {n:'BORA',     c:'#f2f6f7', d:'#1b3fa8', e:'#2fd4ff'},
  {n:'LE MOLE',  c:'#1c2330', d:'#2fd4ff', e:'#f2f6f7'},
  {n:'SAINT-JEAN',c:'#6a2fb8',d:'#ffd24a', e:'#f2f6f7'},
  {n:'CRIEE',    c:'#2fa84a', d:'#1c2330', e:'#ffd24a'}
];

/* =====================================================================
   LE TRACE. Des points de controle, puis une courbe de Catmull-Rom qui
   passe par chacun : une polyligne brute donne des angles vifs ou la
   voiture se cogne sans raison visible. On rechantillonne ensuite a pas
   constant, sans quoi les portions droites auraient moins de points que
   les virages et la detection de sortie de piste serait plus lache dans
   les lignes droites — exactement la ou on va le plus vite.
   ===================================================================== */
var CI_PTS=[
  [500,130],[700,150],[840,260],[870,420],[800,530],[660,570],
  [690,700],[810,780],[860,920],[800,1070],[650,1150],[470,1160],
  [330,1090],[300,950],[380,850],[470,790],[420,680],[270,650],
  [190,520],[180,360],[260,220],[380,150]
];
var CI_MW=1040, CI_MH=1300;

MOTEUR.circuit={
  nom:'Le Circuit', sous:'VUE DE DESSUS · GAUCHE ET DROITE POUR BRAQUER',
  vise:210, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:195, H:422,
            ligne:null, longueur:0, img:null, mini:null,
            x:0, y:0, a:0, vx:0, vy:0, idx:0,
            gauche:false, droite:false, frein:false,
            tour:0, tms:0, total:0, meilleur:0, tours:[], mi:false,
            hors:0, secousse:0, fini:0, deb:0,
            ecurie:0, trace:[], fant:null, fantI:0, fantNeuf:[],
            mot:'', motT:0, motGros:false, rec:0, recNeuf:false,
            enPause:false, flash:0, pouss:[]};
  },

  /* ---- la courbe qui passe par tous les points ---- */
  tracer:function(s){
    var P=CI_PTS, n=P.length, brut=[], i, k;
    for(i=0;i<n;i++){
      var p0=P[(i-1+n)%n], p1=P[i], p2=P[(i+1)%n], p3=P[(i+2)%n];
      for(k=0;k<24;k++){
        var u=k/24, u2=u*u, u3=u2*u;
        brut.push([
          0.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
          0.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)
        ]);
      }
    }
    /* rechantillonnage a pas constant de 4 pixels */
    var L=[], reste=0, PAS=4;
    L.push(brut[0]);
    for(i=0;i<brut.length;i++){
      var a=brut[i], b=brut[(i+1)%brut.length];
      var dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy);
      var pos=reste;
      while(pos<d){
        L.push([a[0]+dx*pos/d, a[1]+dy*pos/d]);
        pos+=PAS;
      }
      reste=pos-d;
    }
    for(i=0;i<L.length;i++){
      var av=L[(i+1)%L.length], ar=L[(i-1+L.length)%L.length];
      L[i][2]=Math.atan2(av[1]-ar[1], av[0]-ar[0]);   /* le cap de la piste */
    }
    s.ligne=L; s.longueur=L.length*PAS;
  },

  /* ---- le circuit peint une fois ---- */
  peindre:function(s){
    var cv=document.createElement('canvas');
    cv.width=CI_MW; cv.height=CI_MH;
    var g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
    var L=s.ligne, i, p;
    /* l'herbe, avec des bandes de tonte : sans elles, le hors-piste est
       un aplat ou rien ne dit qu'on avance */
    for(var y=0;y<CI_MH;y+=1){
      g.fillStyle=((y/14)|0)%2?'#2d5a33':'#27512e';
      g.fillRect(0,y,CI_MW,1);
    }
    /* du sable autour de quelques virages */
    function rond(x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
    for(i=0;i<L.length;i+=3){
      p=L[i];
      var ser=(i>>4)%7;
      if(ser===0||ser===3)rond(p[0],p[1],CI_LARGE+16,'#8f7a4a');
    }
    /* la bordure, puis la piste */
    for(i=0;i<L.length;i+=2){ p=L[i]; rond(p[0],p[1],CI_LARGE+4,'#d8dde4'); }
    for(i=0;i<L.length;i+=2){ p=L[i]; rond(p[0],p[1],CI_LARGE,'#3d4049'); }
    /* LES VIBREURS : poses aux bords, en damier, et seulement la ou ca
       tourne — un vibreur en pleine ligne droite ne veut rien dire. */
    for(i=0;i<L.length;i++){
      var a0=L[i][2], a1=L[(i+6)%L.length][2];
      var dd=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0));
      if(Math.abs(dd)<0.055)continue;
      var c=((i/5)|0)%2?'#d23a2e':'#eceef2';
      var nx=Math.cos(a0+1.5708), ny=Math.sin(a0+1.5708);
      var s2=dd>0?1:-1;
      g.fillStyle=c;
      g.fillRect(Math.round(L[i][0]+nx*CI_LARGE*s2*-1-2),
                 Math.round(L[i][1]+ny*CI_LARGE*s2*-1-2),4,4);
    }
    /* la ligne centrale, en pointille */
    for(i=0;i<L.length;i+=6){
      if(((i/6)|0)%2)continue;
      p=L[i];
      g.fillStyle='rgba(236,238,242,.22)';
      g.fillRect(Math.round(p[0])-1,Math.round(p[1])-1,2,2);
    }
    /* LA LIGNE DE DEPART, en damier, perpendiculaire a la piste */
    var p0=L[0], a=p0[2], nx2=Math.cos(a+1.5708), ny2=Math.sin(a+1.5708);
    for(var k=-CI_LARGE;k<CI_LARGE;k+=4){
      for(var j=0;j<2;j++){
        g.fillStyle=(((k/4)|0)+j)%2?'#eceef2':'#1b1e26';
        g.fillRect(Math.round(p0[0]+nx2*k-Math.cos(a)*(j*4-4)),
                   Math.round(p0[1]+ny2*k-Math.sin(a)*(j*4-4)),4,4);
      }
    }
    /* quelques tribunes et des arbres, pour reconnaitre les endroits */
    function tribune(x,y,w,h){
      g.fillStyle='#4a4f5c';g.fillRect(x,y,w,h);
      g.fillStyle='#5f6676';g.fillRect(x,y,w,2);
      for(var q=0;q<w-3;q+=4){
        g.fillStyle=['#d8dde4','#c8a22a','#b8302e','#2a6a9a'][(q/4)%4];
        g.fillRect(x+2+q,y+3,3,2);
      }
    }
    tribune(540,66,180,26); tribune(900,990,96,24); tribune(120,300,26,120);
    /* LES ARBRES ONT BESOIN D'UNE OMBRE ET D'UNE LUMIERE. Peints en deux
       verts voisins de celui de l'herbe, ils donnaient des boules grises
       posees sur rien : l'oeil ne lisait ni un relief ni un volume. */
    function arbre(x,y,r){
      g.fillStyle='rgba(8,16,10,.45)';g.beginPath();g.arc(x+r*0.3,y+r*0.35,r,0,7);g.fill();
      g.fillStyle='#17401f';g.beginPath();g.arc(x,y,r,0,7);g.fill();
      g.fillStyle='#235e2c';g.beginPath();g.arc(x-r*0.22,y-r*0.22,r*0.72,0,7);g.fill();
      g.fillStyle='#398a3f';g.beginPath();g.arc(x-r*0.38,y-r*0.38,r*0.36,0,7);g.fill();
    }
    for(i=0;i<70;i++){
      var ax=al(i*3.1)*CI_MW, ay=al(i*7.7)*CI_MH;
      var proche=false;
      for(var q2=0;q2<L.length;q2+=7){
        if(Math.abs(L[q2][0]-ax)<70&&Math.abs(L[q2][1]-ay)<70){proche=true;break;}
      }
      if(!proche)arbre(ax,ay,5+al(i*2.3)*6);
    }
    s.img=cv;
    /* ---- LE MINI-PLAN ---- */
    var mw=52, mh=Math.round(52*CI_MH/CI_MW);
    var m=document.createElement('canvas'); m.width=mw; m.height=mh;
    var gm=m.getContext('2d'); gm.imageSmoothingEnabled=false;
    gm.fillStyle='rgba(8,11,17,.72)';gm.fillRect(0,0,mw,mh);
    for(i=0;i<L.length;i+=2){
      gm.fillStyle='#8fa6bc';
      gm.fillRect(Math.round(L[i][0]*mw/CI_MW),Math.round(L[i][1]*mh/CI_MH),2,2);
    }
    gm.fillStyle='#ffd24a';
    gm.fillRect(Math.round(L[0][0]*mw/CI_MW)-1,Math.round(L[0][1]*mh/CI_MH)-1,3,3);
    s.mini=m; s.miniW=mw; s.miniH=mh;
  },

  cadre:function(s,L,H){ s.L=L; s.H=H; },

  demarrer:function(s){
    if(!CI_ART)CI_ART=CI_SPRITE();
    this.tracer(s);
    this.peindre(s);
    var p=s.ligne[0];
    s.phase='jeu';s.t=0;s.score=0;
    s.x=p[0];s.y=p[1];s.a=p[2];s.vx=0;s.vy=0;s.idx=0;
    s.gauche=s.droite=s.frein=false;
    s.tour=1;s.tms=0;s.total=0;s.meilleur=0;s.tours=[];s.mi=false;
    s.hors=0;s.secousse=0;s.fini=0;s.flash=0;s.pouss=[];
    s.fantNeuf=[];s.fant=null;s.fantI=0;s.enPause=false;s.recNeuf=false;
    s.ecurie=Math.floor(Math.random()*CI_ECURIES.length);
    s.rec=0;
    try{
      var o=JSON.parse(localStorage.getItem(CI_CLE)||'null');
      if(o){ s.rec=o.t||0; if(o.f&&o.f.length)s.fant=o.f; }
    }catch(e){}
    this.dire(s,'À TOI DE JOUER',true);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1600:1000;s.motGros=!!gros;},

  /* ================= LE VOLANT =================
     Gauche, droite, ou les deux pour freiner. On relit la liste entiere
     a chaque changement plutot que de compter les appuis : un doigt qui
     glisse d'un camp a l'autre, ou que le systeme oublie de rendre,
     laisserait sinon le volant bloque. */
  doigts:function(s,PTS){
    var g=false, d=false;
    for(var k in PTS){
      if(!PTS.hasOwnProperty(k))continue;
      if(PTS[k].x < s.L/2) g=true; else d=true;
    }
    s.gauche=g; s.droite=d; s.frein=(g&&d);
    if(s.enPause&&(g||d))s.enPause=false;
  },
  presse:function(s,x,y){ if(s.enPause)s.enPause=false; },
  leve:function(s){},
  tape:function(s,x,y){ if(s.enPause)s.enPause=false; },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.secousse>0)s.secousse=Math.max(0,s.secousse-dt*0.004);
    for(var i=s.pouss.length-1;i>=0;i--){
      var q=s.pouss[i]; q.vie-=dt; q.x+=q.vx*dt; q.y+=q.vy*dt;
      if(q.vie<=0)s.pouss.splice(i,1);
    }
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }
    dt=Math.min(34,dt);
    var ACC=0.00042, FREIN=0.00075, VMAX=0.235;
    var dirx=Math.cos(s.a), diry=Math.sin(s.a);
    var v=Math.hypot(s.vx,s.vy);

    /* ---- LE BRAQUAGE ----
       Il depend de la vitesse : a l'arret on ne tourne pas, et a pleine
       vitesse on braque moins — sinon la voiture pivote sur place dans
       les lignes droites et le trace devient illisible. */
    var dir=(s.gauche?-1:0)+(s.droite?1:0);
    if(dir&&!s.frein){
      var eff=Math.min(1,v/0.06)*(1-Math.min(0.42,v/VMAX*0.42));
      s.a+=dir*0.0046*eff*dt;
    }else if(dir&&s.frein){
      s.a+=dir*0.0020*Math.min(1,v/0.06)*dt;  /* on braque encore un peu au frein */
    }

    /* ---- LE MOTEUR ---- */
    var surHerbe=(s.hors>0);
    if(s.frein){
      s.vx-=s.vx*FREIN/Math.max(0.02,v)*dt*0.9;
      s.vy-=s.vy*FREIN/Math.max(0.02,v)*dt*0.9;
    }else{
      /* L'HERBE FREINE, MAIS ELLE NE CONDAMNE PAS : a 0,42 de couple et
         un frottement de sept pour cent par image, une voiture sortie ne
         revenait plus jamais sur la piste. */
      var acc=ACC*(1-v/VMAX)*(surHerbe?0.62:1);
      s.vx+=dirx*acc*dt; s.vy+=diry*acc*dt;
    }

    /* ---- L'ADHERENCE ----
       On tue la composante de vitesse perpendiculaire a la voiture. Tout
       d'un coup, elle roule sur rails ; pas du tout, elle patine comme
       sur la glace. Le coefficient est ce qui definit la voiture — et il
       tombe de moitie sur l'herbe. */
    var perp=-s.vx*diry+s.vy*dirx;
    var grip=(surHerbe?0.0042:0.0115);
    var corr=Math.min(1,grip*dt);
    s.vx+=diry*perp*corr; s.vy-=dirx*perp*corr;
    /* la fumee quand ca glisse vraiment */
    if(Math.abs(perp)>0.055&&Math.random()<0.5)
      s.pouss.push({x:s.x-dirx*8,y:s.y-diry*8,vx:(Math.random()-0.5)*0.01,
                    vy:(Math.random()-0.5)*0.01,vie:420,
                    c:surHerbe?'#6f8a4e':'#b9bec8'});

    /* ---- LES FROTTEMENTS ---- */
    var frot=Math.pow(surHerbe?0.9975:0.99935,dt);
    s.vx*=frot; s.vy*=frot;

    s.x+=s.vx*dt; s.y+=s.vy*dt;

    /* ---- OU EST-ON SUR LA PISTE ----
       On ne cherche pas le point le plus proche sur toute la ligne a
       chaque image : quatre mille comparaisons pour un deplacement de
       trois pixels. On balaye une fenetre autour du dernier index connu,
       ce qui suffit tant qu'on ne se teleporte pas. */
    var L=s.ligne, n=L.length, best=s.idx, bd=1e9;
    for(var k=-26;k<=26;k++){
      var j=((s.idx+k)%n+n)%n;
      var dx=L[j][0]-s.x, dy=L[j][1]-s.y, d2=dx*dx+dy*dy;
      if(d2<bd){bd=d2;best=j;}
    }
    var avance=((best-s.idx)%n+n)%n;
    if(avance<n/2)s.idx=best;          /* on n'accepte pas un saut en arriere */
    var ecart=Math.sqrt(bd);
    s.hors=(ecart>CI_LARGE)?1:0;
    if(ecart>CI_LARGE&&s.secousse<0.3)s.secousse=0.3;
    /* LA LIMITE DU MONDE.
       LA PREMIERE VERSION COLLAIT LA VOITURE. Elle replacait le chassis
       sur le cercle limite et multipliait toute la vitesse par 0,35 a
       chaque image : une voiture qui poussait dedans perdait soixante-
       cinq pour cent de son elan soixante fois par seconde et tombait a
       l'arret definitif. Mesure : apres une sortie, elle restait a
       0,0014 pixel par milliseconde pendant douze secondes — plaquee,
       sans moyen de repartir, et le pilote-robot ne bouclait aucun tour
       en quatre-vingt-seize secondes.

       On ne tue plus que ce qui POUSSE VERS LE DEHORS. La composante le
       long de la limite est conservee, donc la voiture glisse contre le
       bord au lieu de s'y coller, et il suffit de braquer vers
       l'interieur pour s'en degager. C'est ce que fait un rail de
       securite ; un mur de glu n'existe nulle part. */
    if(ecart>CI_LARGE+42){
      var px=L[s.idx][0], py=L[s.idx][1];
      var ux=(s.x-px)/ecart, uy=(s.y-py)/ecart;
      s.x=px+ux*(CI_LARGE+42); s.y=py+uy*(CI_LARGE+42);
      var sortant=s.vx*ux+s.vy*uy;
      if(sortant>0){ s.vx-=ux*sortant*1.25; s.vy-=uy*sortant*1.25; }
      s.vx*=0.92; s.vy*=0.92;
      if(s.secousse<0.6)s.secousse=0.6;
    }

    /* ---- LE TOUR ---- */
    s.tms+=dt; s.total+=dt;
    if(s.idx>n*0.45&&s.idx<n*0.62)s.mi=true;
    if(s.mi&&s.idx<n*0.06&&s.tms>4000)this.boucler(s);

    /* ---- LE FANTOME ----
       Un releve toutes les quarante millisecondes : plus souvent, on
       stocke du bruit ; moins souvent, la voiture fantome saccade. */
    if(!s.fantT||s.t-s.fantT>40){
      s.fantT=s.t;
      s.fantNeuf.push([Math.round(s.x),Math.round(s.y),Math.round(s.a*100)/100]);
    }
    if(s.fant)s.fantI=Math.min(s.fant.length-1,Math.floor(s.tms/40));
  },

  boucler:function(s){
    var t=s.tms;
    s.tours.push(t);
    if(!s.meilleur||t<s.meilleur){
      s.meilleur=t;
      if(!s.rec||t<s.rec){
        s.rec=t; s.recNeuf=true;
        s.fant=s.fantNeuf.slice();
        try{localStorage.setItem(CI_CLE,JSON.stringify({t:s.rec,f:s.fant}));}catch(e){}
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
    /* LE SCORE VIENT DU MEILLEUR TOUR, pas du total : le total punit une
       sortie de piste deux fois, une fois dans le tour et une fois dans
       le classement. */
    s.score=s.meilleur?Math.max(0,Math.round((40000-s.meilleur)/4)):0;
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
  voiture:function(s,ex,ey,ang,ec,alp){
    if(!CI_ART)CI_ART=CI_SPRITE();
    var E=CI_ECURIES[ec%CI_ECURIES.length];
    var PAL={'K':'#12141b','c':E.c,'d':E.d,'e':E.e,'n':'#3a3e4b','W':'#f0efe8'};
    G.save();
    G.translate(Math.round(ex),Math.round(ey));
    /* LE SPRITE EST DESSINE LE NEZ VERS LE HAUT, et l'angle zero pointe
       vers la droite : d'ou le quart de tour. Sans lui, la voiture roule
       en crabe et on met un moment a comprendre pourquoi. */
    G.rotate(ang+Math.PI/2);
    if(alp!=null)G.globalAlpha=alp;
    /* L'OMBRE PORTEE. Sur un bitume gris fonce, une monoplace sombre se
       confond avec la piste des qu'on quitte le plein soleil des bords :
       deux pixels d'ombre decalee la decollent du sol et on la retrouve
       d'un coup d'oeil au milieu d'un virage. */
    if(alp==null){
      G.fillStyle='rgba(8,10,14,.38)';
      for(var j2=0;j2<CI_ART.length;j2++){
        var r2=CI_ART[j2];
        for(var i2=0;i2<r2.length;i2++)
          if(r2[i2]!=='.')G.fillRect(i2-CI_L/2+2,j2-CI_H/2+2,1,1);
      }
    }
    for(var j=0;j<CI_ART.length;j++){
      var row=CI_ART[j];
      for(var i=0;i<row.length;i++){
        var c=PAL[row[i]];
        if(c){G.fillStyle=c;G.fillRect(i-CI_L/2,j-CI_H/2,1,1);}
      }
    }
    G.restore();
  },

  dessine:function(s,L,H){
    if(!s.img){ if(!s.ligne)this.tracer(s); this.peindre(s); }
    var sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.6:0;
    /* LA CAMERA regarde un peu devant la voiture : centrer dessus fait
       perdre la moitie de l'ecran sur ce qu'on vient de quitter. */
    var ax=s.x+Math.cos(s.a)*34, ay=s.y+Math.sin(s.a)*34;
    s.camX=(s.camX==null)?ax:s.camX+(ax-s.camX)*0.14;
    s.camY=(s.camY==null)?ay:s.camY+(ay-s.camY)*0.14;
    var cx=Math.round(Math.max(0,Math.min(CI_MW-L,s.camX-L/2))+sec);
    var cy=Math.round(Math.max(0,Math.min(CI_MH-H,s.camY-H/2))+sec*0.6);

    G.fillStyle='#27512e';G.fillRect(0,0,L,H);
    G.imageSmoothingEnabled=false;
    G.drawImage(s.img,cx,cy,L,H,0,0,L,H);

    var i;
    for(i=0;i<s.pouss.length;i++){
      var q=s.pouss[i];
      G.globalAlpha=Math.max(0,q.vie/420)*0.5;
      R(q.x-cx,q.y-cy,2,2,q.c);
    }
    G.globalAlpha=1;

    /* LE FANTOME, derriere la vraie voiture et translucide : il ne doit
       jamais etre pris pour un adversaire qu'on peut toucher. */
    if(s.fant&&s.fant.length&&s.tour<=CI_TOURS){
      var f=s.fant[Math.min(s.fantI,s.fant.length-1)];
      if(f)this.voiture(s,f[0]-cx,f[1]-cy,f[2],(s.ecurie+4),0.42);
    }
    this.voiture(s,s.x-cx,s.y-cy,s.a,s.ecurie,null);

    this.chrome(s,L,H,cx,cy);
  },

  chrome:function(s,L,H,cx,cy){
    var i;
    /* ---- LE HAUT : le chrono, le tour ---- */
    R(0,0,L,17,'rgba(6,9,14,.84)');
    G.font='bold 11px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#ffffff';G.fillText(this.mmss(s.tms),4,12);
    G.font='7px ui-monospace,monospace';G.textAlign='center';
    G.fillStyle='#9fb4c8';
    G.fillText('TOUR '+Math.min(s.tour,CI_TOURS)+'/'+CI_TOURS,L/2,8);
    G.fillStyle=s.meilleur?'#ffd24a':'#5d6e80';
    G.fillText(s.meilleur?('MEILLEUR '+this.mmss(s.meilleur)):'PREMIER TOUR',L/2,15);

    /* ---- LE MINI-PLAN, en haut a droite ---- */
    if(s.mini){
      var mx=L-s.miniW-3, my=20;
      G.drawImage(s.mini,mx,my);
      R(mx,my,s.miniW,1,'rgba(255,255,255,.18)');
      var px=mx+Math.round(s.x*s.miniW/CI_MW), py=my+Math.round(s.y*s.miniH/CI_MH);
      R(px-1,py-1,3,3,'#ff5a4a');
      if(s.fant&&s.fant.length){
        var f=s.fant[Math.min(s.fantI,s.fant.length-1)];
        if(f)R(mx+Math.round(f[0]*s.miniW/CI_MW),my+Math.round(f[1]*s.miniH/CI_MH),2,2,'#8fa6bc');
      }
    }

    /* ---- L'ECURIE ---- */
    var E=CI_ECURIES[s.ecurie];
    R(3,20,3,9,E.c); R(3,20,3,3,E.e);
    G.font='7px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#9fb4c8';G.fillText(E.n,9,27);

    /* ---- HORS PISTE ---- */
    if(s.hors&&Math.floor(s.t/150)%2===0){
      G.font='bold 9px ui-monospace,monospace';G.textAlign='center';
      G.fillStyle='#ffb04a';G.fillText('HORS PISTE',L/2,H*0.30);
    }

    /* ---- LE VOLANT, montre a l'ecran ----
       Deux bandeaux qui s'allument sous les pouces. Sans eux, un joueur
       qui prend la borne ne devine pas que l'ecran est coupe en deux —
       et il n'y a pas de notice dans une salle d'arcade. */
    var hb=Math.round(H*0.16);
    R(0,H-hb,L/2-1,hb,s.gauche?'rgba(90,216,255,.18)':'rgba(255,255,255,.045)');
    R(L/2+1,H-hb,L/2-1,hb,s.droite?'rgba(90,216,255,.18)':'rgba(255,255,255,.045)');
    G.font='bold 8px ui-monospace,monospace';G.textAlign='center';
    G.fillStyle=s.gauche?'#9ae8ff':'rgba(255,255,255,.30)';
    G.fillText('◀',L/4,H-hb/2+3);
    G.fillStyle=s.droite?'#9ae8ff':'rgba(255,255,255,.30)';
    G.fillText('▶',L*3/4,H-hb/2+3);
    if(s.frein){
      G.fillStyle='#ff6a5a';G.font='bold 9px ui-monospace,monospace';
      G.fillText('FREIN',L/2,H-hb/2+3);
    }

    /* ---- LA VITESSE ---- */
    var v=Math.hypot(s.vx,s.vy);
    G.textAlign='right';G.font='bold 13px ui-monospace,monospace';
    G.fillStyle=s.hors?'#ffb04a':'#ffffff';
    G.fillText(String(Math.round(v*1180)),L-4,H-hb-6);
    G.font='6px ui-monospace,monospace';G.fillStyle='#8fa6bc';
    G.fillText('KM/H',L-4,H-hb+2);

    /* ---- LES TOURS DEJA FAITS ---- */
    G.textAlign='left';G.font='6px ui-monospace,monospace';
    for(i=0;i<s.tours.length&&i<5;i++){
      G.fillStyle=(s.tours[i]===s.meilleur)?'#ffd24a':'#7f93a8';
      G.fillText('T'+(i+1)+'  '+this.mmss(s.tours[i]),4,H-hb-6-(s.tours.length-1-i)*8);
    }

    /* ---- LE MOT ---- */
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
      G.fillStyle='rgba(6,9,14,.78)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 15px ui-monospace,monospace';G.fillStyle='#ffd24a';
      G.fillText('LE CIRCUIT',L/2,H*0.34);
      G.font='9px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('MOITIÉ GAUCHE : BRAQUE À GAUCHE',L/2,H*0.34+22);
      G.fillText('MOITIÉ DROITE : BRAQUE À DROITE',L/2,H*0.34+36);
      G.fillText('LES DEUX EN MÊME TEMPS : FREIN',L/2,H*0.34+50);
      G.fillStyle='#9fb4c8';
      G.fillText('LE GAZ EST AUTOMATIQUE',L/2,H*0.34+70);
      G.fillText('TROIS TOURS · ON GARDE LE MEILLEUR',L/2,H*0.34+84);
      G.fillStyle='#ffd24a';
      G.fillText('LE FANTÔME REJOUE TON RECORD',L/2,H*0.34+104);
    }
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.82)';G.fillRect(0,H*0.26,L,96);
      G.textAlign='center';
      G.font='bold 15px ui-monospace,monospace';G.fillStyle='#ffd24a';
      G.fillText(s.meilleur?this.mmss(s.meilleur):'—',L/2,H*0.26+24);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('MEILLEUR TOUR · TOTAL '+this.mmss(s.total),L/2,H*0.26+40);
      G.fillStyle=s.recNeuf?'#7dff9a':'#9fb4c8';
      G.fillText(s.recNeuf?'NOUVEAU RECORD PERSONNEL':'RECORD '+this.mmss(s.rec),
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
    g.fillStyle='#27512e';g.fillRect(0,0,w,h);
    for(var y=0;y<h;y+=7){g.fillStyle=((y/7)|0)%2?'#2d5a33':'#27512e';g.fillRect(0,y,w,7);}
    /* un bout de piste en diagonale */
    g.save();g.translate(w/2,h/2);g.rotate(-0.22);
    g.fillStyle='#d8dde4';g.fillRect(-w,-20,2*w,40);
    g.fillStyle='#3d4049';g.fillRect(-w,-16,2*w,32);
    for(var x=-w;x<w;x+=12){g.fillStyle='rgba(236,238,242,.25)';g.fillRect(x,-1,6,2);}
    for(var x2=-w;x2<w;x2+=10){
      g.fillStyle=((x2/10)|0)%2?'#d23a2e':'#eceef2';
      g.fillRect(x2,-20,10,4); g.fillRect(x2,16,10,4);
    }
    g.restore();
    /* trois monoplaces */
    if(!CI_ART)CI_ART=CI_SPRITE();
    var old=null;
    [[w*0.30,h*0.56,0],[w*0.52,h*0.40,1],[w*0.72,h*0.60,3]].forEach(function(p,k){
      var E=CI_ECURIES[[0,2,3][k]];
      var PAL={'K':'#12141b','c':E.c,'d':E.d,'e':E.e,'n':'#3a3e4b','W':'#f0efe8'};
      g.save();g.translate(p[0],p[1]);g.rotate(-0.22+Math.PI/2);g.scale(0.9,0.9);
      for(var j=0;j<CI_ART.length;j++)
        for(var i=0;i<CI_ART[j].length;i++){
          var c=PAL[CI_ART[j][i]];
          if(c){g.fillStyle=c;g.fillRect(i-CI_L/2,j-CI_H/2,1,1);}
        }
      g.restore();
    });
    if(grand){
      g.fillStyle='#ffd24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LE CIRCUIT',w-6,14);
    }
  }
};
