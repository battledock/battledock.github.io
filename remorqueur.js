/* =====================================================================
   LE REMORQUEUR — borne d'arcade du Battledock
   =====================================================================
   LE GESTE. Le pouce se pose sur l'eau : le remorqueur y va. C'est tout.
   Le porte-conteneurs, lui, suit au bout de l'aussiere — et c'est la que
   le jeu commence, parce qu'il ne va PAS ou va le remorqueur.

   POURQUOI LE NAVIRE AVANCE TOUT SEUL. On a d'abord voulu que le
   remorqueur le tracte vraiment : le joueur passait son temps a relancer
   un navire arrete et ne regardait jamais la passe. Dans un vrai port,
   le gros batiment est en machine, « en avant tres lente », et les
   remorqueurs ne font que l'ORIENTER. C'est le bon partage : la vitesse
   est donnee, la direction est a toi.

   L'INERTIE EST LE SUJET. Trois cents metres de navire ne tournent pas
   parce qu'on tire dessus — ils COMMENCENT a tourner, et ils continuent
   longtemps apres qu'on a arrete de tirer. Il faut donc donner l'angle
   bien avant le virage, et contre-tirer bien avant d'etre revenu dans
   l'axe. Un joueur qui corrige quand il voit l'erreur est deja trop
   tard : c'est exactement ce qu'on vient chercher.

   LA PASSE SE RESSERRE ET SERPENTE de plus en plus loin on va. Rien
   d'autre ne monte : ni la vitesse du pouce, ni le nombre de choses a
   surveiller. On mesure une seule chose, l'anticipation.

   LA COQUE ENCAISSE. Un ragage contre la digue coute, il ne tue pas :
   un jeu d'inertie ou la premiere erreur termine la partie n'apprend
   rien, parce qu'on n'a jamais le temps de voir le rattrapage.
   ===================================================================== */

var RM_LONG=36;                  /* la demi-longueur du navire */
var RM_LARG=11;                  /* la demi-largeur */
var RM_AUSS=30;                  /* l'aussiere au repos */
var RM_RAYON=38;                 /* jusqu'ou le remorqueur peut s'ecarter */
var RM_VTUG=0.090;               /* la vitesse propre du remorqueur */
/* LE COUPLE, ET LA MESURE QUI A FAIT TOUT REPRENDRE. Le premier reglage
   ecrivait « force x bras / moment d'inertie » avec des nombres choisis a
   vue : la variation de vitesse angulaire valait sept millimes de radian
   par milliseconde au carre, soit cent mille fois trop. Le navire claquait
   en une image a sa bute de soixante-douze degres et partait en travers
   dans la digue. Les trois pilotes — le bon, le moyen et celui qui ne
   regardait pas — rendaient EXACTEMENT le meme resultat : six ragages,
   deux cent soixante-dix metres. Trois robots qui jouent pareil ne
   mesurent pas trois niveaux, ils mesurent une commande qui ne commande
   rien.

   On repart des durees qu'on veut sentir : quatre secondes pour que la
   giration s'etablisse, environ trois pour tourner de quarante-cinq
   degres. L'amortissement donne la constante de temps, le couple donne
   la giration d'equilibre, et les deux chiffres ci-dessous en decoulent
   au lieu d'etre devines. */
var RM_COUPLE=8.5e-9;            /* la giration gagnee par unite de tension */
var RM_AMORTI=0.99975;           /* par milliseconde : environ quatre secondes */
var RM_BUTE=0.90;                /* le cap maximal, en radians */
var RM_COQUE=100;                /* la coque, en points */

MOTEUR.remorqueur={
  nom:'Le Remorqueur', sous:'LE POUCE SUR L’EAU · 300 M SUIVENT DERRIÈRE',
  vise:150, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:130, H:281,
            nav:{x:65, y:0, a:0, w:0}, v:0.028,
            tug:{x:65, y:-RM_AUSS}, cible:null,
            cam:0, dist:0, coque:RM_COQUE, touches:0, cogne:0,
            courant:0, prochain:9000,
            mot:'', motT:0, motGros:false, propre:0, prime:0,
            part:[], sillage:[], fini:0, enPause:false, recH:0,
            flash:0, flashC:'#ffe24a', secousse:0, graine:1};
  },

  cadre:function(s,L,H){ s.L=L;s.H=H; },

  demarrer:function(s){
    s.phase='jeu';s.t=0;s.score=0;s.dist=0;s.coque=RM_COQUE;s.touches=0;
    s.graine=1+Math.floor(Math.random()*900);
    s.nav={x:this.axe(s,0), y:0, a:0, w:0};
    s.v=0.028;
    s.tug={x:s.nav.x, y:-RM_AUSS};s.cible=null;
    s.cam=0;s.courant=0;s.prochain=9000;s.cogne=0;s.propre=0;s.prime=0;
    s.part=[];s.sillage=[];s.fini=0;s.enPause=false;s.flash=0;s.secousse=0;
    this.dire(s,'EN AVANT TRÈS LENTE',false);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1600:1100;s.motGros=!!gros;},

  /* =====================================================================
     LA PASSE
     =====================================================================
     Elle est ENTIEREMENT CALCULEE, jamais tiree au sort au fil de l'eau :
     il faut pouvoir demander ou sera le chenal cent metres plus loin pour
     dessiner l'ecran, et surtout pour que le joueur puisse le voir venir.
     Un virage qu'on decouvre en y entrant ne se negocie pas.

     Trois sinusoides de periodes incommensurables : on ne retrouve jamais
     deux fois le meme enchainement, et pourtant tout est reproductible a
     partir de la graine. */
  axe:function(s,y){
    var d=-y;                                   /* la distance parcourue */
    /* L'AMPLITUDE EST BORNEE PAR CE QUE LE NAVIRE SAIT FAIRE. La pente
       maximale du chenal vaut a peu pres l'amplitude multipliee par deux
       centiemes ; au-dela de quatorze, il faudrait tenir un cap de plus
       d'un tiers de radian en permanence, c'est-a-dire etre a la bute
       tout le temps. Une passe qu'on ne peut pas suivre meme en jouant
       parfaitement n'est pas difficile, elle est fausse. */
    var amp=Math.min(14,5+d*0.0038);
    var g=s.graine*0.013;
    return s.L/2
      + Math.sin(y*0.0132+g)*amp
      + Math.sin(y*0.0061+g*2.1)*amp*0.72
      + Math.sin(y*0.0210+g*3.7)*amp*0.12;
  },
  /* LA DEMI-LARGEUR DU CHENAL. Elle doit laisser passer le navire EN
     TRAVERS : dans un virage, soixante-douze metres de coque balaient
     bien plus large que sa propre largeur. */
  bord:function(s,y){
    /* LA PENTE DE LA DIFFICULTE, REGLEE SUR MESURE. Les trois pilotes —
       celui qui regarde loin, celui qui regarde court, celui qui ne
       corrige pas la giration — rendaient 1 657, 1 561 et 1 377 metres :
       vingt pour cent d'ecart entre le meilleur et le pire, c'est-a-dire
       presque rien. La passe se resserrait et le navire accelerait si
       vite que tout le monde butait sur le meme mur au bout de quarante
       secondes, et le pilotage ne servait plus a rien. On a divise par
       deux la vitesse a laquelle la passe se referme et par deux celle
       du navire : la difficulte met deux fois plus longtemps a arriver,
       et c'est dans ce temps-la que la difference de pilotage se voit. */
    var d=-y;
    var w=Math.max(30,46-d*0.0036);
    return w+Math.sin(y*0.0081+s.graine*0.07)*4;
  },

  /* l'etrave et l'arriere, en coordonnees monde */
  etrave:function(s){
    var n=s.nav;
    return {x:n.x+Math.sin(n.a)*RM_LONG, y:n.y-Math.cos(n.a)*RM_LONG};
  },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.cogne>0)s.cogne-=dt;
    if(s.secousse>0)s.secousse=Math.max(0,s.secousse-dt*0.004);
    var i;
    for(i=s.part.length-1;i>=0;i--){
      var p=s.part[i];p.vie-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.vie<=0)s.part.splice(i,1);
    }
    for(i=s.sillage.length-1;i>=0;i--){
      s.sillage[i].vie-=dt;if(s.sillage[i].vie<=0)s.sillage.splice(i,1);
    }
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }

    var n=s.nav;

    /* ---- LE COURANT ----
       Il change toutes les dix secondes environ et il S'ANNONCE : une
       derive qu'on ne voit pas venir passe pour un bogue de pilotage. */
    s.prochain-=dt;
    if(s.prochain<=0){
      s.prochain=8000+Math.random()*7000;
      var nc=(Math.random()-0.5)*0.030*Math.min(1,0.4+s.dist*0.0007);
      s.courant=nc;
      if(Math.abs(nc)>0.008)
        this.dire(s,nc>0?'COURANT PORTANT À TRIBORD':'COURANT PORTANT À BÂBORD',true);
    }

    /* ---- LE REMORQUEUR ----
       Il nage vers le pouce a sa vitesse propre, et il ne peut pas
       s'eloigner de l'etrave au-dela de la longueur de l'aussiere : une
       remorque elastique a l'infini enleverait tout le poids du navire. */
    var et=this.etrave(s), T=s.tug;
    var cx=s.cible?s.cible.x:et.x, cy=s.cible?s.cible.y:et.y-RM_AUSS;
    var ddx=cx-T.x, ddy=cy-T.y, dd=Math.sqrt(ddx*ddx+ddy*ddy);
    if(dd>0.4){
      var pas=Math.min(dd,RM_VTUG*dt);
      T.x+=ddx/dd*pas;T.y+=ddy/dd*pas;
    }
    var rx=T.x-et.x, ry=T.y-et.y, rl=Math.sqrt(rx*rx+ry*ry)||1;
    if(rl>RM_RAYON){ T.x=et.x+rx/rl*RM_RAYON; T.y=et.y+ry/rl*RM_RAYON;
                     rx=T.x-et.x;ry=T.y-et.y;rl=RM_RAYON; }

    /* ---- L'AUSSIERE ----
       Elle ne POUSSE jamais : un cordage mou ne transmet rien. En deca de
       sa longueur au repos, il ne se passe rien, et le navire continue
       sur son erre — c'est la que le joueur apprend l'inertie. */
    var tension=Math.max(0,rl-RM_AUSS);
    s.tension=tension;
    if(tension>0.02){
      var ux=rx/rl, uy=ry/rl;
      /* la composante transversale, dans le repere du navire */
      var px=Math.cos(n.a), py=Math.sin(n.a);     /* tribord */
      var lat=ux*px+uy*py;
      /* le couple : la force transversale multipliee par le bras de
         levier de l'etrave. Divise par le moment d'inertie — c'est lui
         qui fait les trois cents metres. */
      n.w+=lat*tension*RM_COUPLE*dt;
    }
    /* l'amortissement angulaire : l'eau freine la giration, mais tard */
    n.w*=Math.pow(RM_AMORTI,dt);
    n.a+=n.w*dt;
    if(n.a>RM_BUTE)n.a=RM_BUTE;if(n.a<-RM_BUTE)n.a=-RM_BUTE;

    /* ---- LA MARCHE ----
       Le navire est en machine : il avance sur son cap, toujours. Sa
       vitesse monte avec la distance, c'est le seul chiffre qui monte
       avec la vitesse. */
    s.v=Math.min(0.048,0.028+s.dist*0.0000105);
    var av=s.v*(s.cogne>0?0.55:1);
    n.x+=Math.sin(n.a)*av*dt + s.courant*dt;
    n.y-=Math.cos(n.a)*av*dt;
    s.dist=Math.max(s.dist,-n.y);

    /* le sillage, derriere l'arriere */
    if(s.t%90<dt){
      s.sillage.push({x:n.x-Math.sin(n.a)*RM_LONG, y:n.y+Math.cos(n.a)*RM_LONG,
                      a:n.a, vie:1600});
    }

    /* ---- LA CAMERA ----
       Elle suit le NAVIRE, pas le remorqueur : c'est le navire qu'on
       pilote reellement, et une camera accrochee au petit bateau donnait
       l'impression que le gros derivait tout seul. */
    var cible=n.y-s.H*0.56;
    s.cam+=(cible-s.cam)*Math.min(1,dt*0.010);

    /* ---- LE RAGAGE ----
       On teste la coque en sept points : l'etrave seule laissait le
       navire traverser une digue en travers sans que rien ne se passe. */
    var pire=0, cote=0;
    for(i=-3;i<=3;i++){
      var f=i/3;
      var hx=n.x+Math.sin(n.a)*RM_LONG*f, hy=n.y-Math.cos(n.a)*RM_LONG*f;
      /* la largeur compte : c'est le flanc qui touche, pas l'axe */
      for(var k=-1;k<=1;k+=2){
        var ox=hx+Math.cos(n.a)*RM_LARG*k, oy=hy+Math.sin(n.a)*RM_LARG*k;
        var ax=this.axe(s,oy), bo=this.bord(s,oy);
        var dep=Math.abs(ox-ax)-bo;
        if(dep>pire){pire=dep;cote=(ox>ax?1:-1);}
      }
    }
    if(pire>0){
      /* on repousse le navire : sans ca il entre dans la digue et le
         dessin devient incomprehensible */
      n.x-=cote*Math.min(pire,0.9);
      n.w-=cote*0.0000016*dt;
      if(s.cogne<=0){
        s.touches++;s.coque-=16+Math.min(10,s.dist*0.0016);
        s.cogne=900;s.secousse=1;s.propre=0;
        s.flash=280;s.flashC='#ff4a4a';
        this.dire(s,'ÇA RAGUE · COQUE '+Math.max(0,Math.round(s.coque))+'%',true);
        for(var e=0;e<16;e++)
          s.part.push({x:n.x+cote*RM_LARG,y:n.y+(Math.random()-0.5)*RM_LONG,
                       vx:cote*0.04*Math.random(),vy:(Math.random()-0.5)*0.04,
                       vie:420,c:'#ffd27a'});
      }
      if(s.coque<=0){ this.perdre(s); return; }
    }else{
      /* ---- LA PRIME D'AXE ----
         Rester dans l'axe ne doit pas seulement eviter de perdre : sans
         prime, le joueur longe un bord tout le temps et ne pilote plus. */
      var ec=Math.abs(n.x-this.axe(s,n.y))/this.bord(s,n.y);
      if(ec<0.34){
        s.propre+=dt;
        if(s.propre>4000){s.propre=0;s.prime++;s.score+=150;
          this.dire(s,'DANS L’AXE · +150',false);
          s.flash=150;s.flashC='#7fe0bc';}
      }else s.propre=Math.max(0,s.propre-dt*0.5);
    }
    s.score=Math.max(s.score,Math.floor(s.dist*1.6)+s.prime*150);
  },

  perdre:function(s){
    s.coque=0;
    this.dire(s,'LE NAVIRE EST AVARIÉ',true);
    s.secousse=1;s.flash=400;s.flashC='#ff4a4a';
    s.phase='rate';s.fini=1600;
  },

  fin:function(s){
    s.phase='fini';
    if(s.score>s.recH)s.recH=s.score;
    if(typeof monterActions==='function')monterActions();
    if(typeof finirPartie==='function')finirPartie(s.score);
  },

  /* ================= LE DOIGT =================
     LE POUCE EST LE REMORQUEUR. Pas de manche, pas de boutons : on
     montre un endroit de l'eau et le petit bateau y va. C'est la seule
     commande qui laisse LIRE la passe pendant qu'on pilote — une manche
     en bas d'ecran aurait cache le virage suivant.

     ELLE S'APPELLE viser() ET PAS vise(). La borne porte deja un champ
     « vise » — le nombre de pixels de scene que le shell vise pour
     calculer l'echelle. Une methode du meme nom dans le meme objet
     litteral ECRASE le nombre, puisque la derniere definition gagne :
     ECH valait dl/fonction, c'est-a-dire NaN, et la borne s'ouvrait sur
     un ecran de taille NaN sans la moindre erreur dans la console. */
  viser:function(s,x,y){ s.cible={x:x, y:y+s.cam}; },
  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='jeu')return;
    this.viser(s,x,y);
  },
  presse:function(s,x,y){ if(s.phase==='jeu')this.viser(s,x,y); },
  glisse:function(s,x,y,dx,dy){ if(s.phase==='jeu')this.viser(s,x,y); },
  relache:function(s,x,y){ if(s.phase==='jeu')this.viser(s,x,y); },

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
  dessine:function(s,L,H){
    var i,j,n=s.nav,cam=s.cam;
    var sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.4:0;

    /* ---- L'EAU ---- */
    var gr=G.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,'#0c1526');gr.addColorStop(1,'#13283e');
    G.fillStyle=gr;G.fillRect(0,0,L,H);
    /* le clapot : il defile avec la camera, sinon l'eau est un aplat et
       rien ne dit qu'on avance */
    for(i=0;i<L;i+=6)
      for(j=0;j<H;j+=9){
        var wy=((j-cam*0.9)%(H+18)+H+18)%(H+18);
        if(al(i*0.31+Math.floor((j+cam*0.9)/9)*0.77)>0.74)
          R(i,wy-9,3,1,'rgba(90,150,200,.11)');
      }

    G.save();G.translate(sec,sec*0.5);

    /* ---- LES DIGUES ----
       On les dessine en bandes horizontales d'un pixel : une seule forme
       suivie par un chemin aurait fallu recalculer l'axe deux fois, et
       surtout n'aurait pas permis d'eclairer le bord interieur ligne par
       ligne — or c'est ce liseré clair qui fait LIRE le virage. */
    for(j=-2;j<H+2;j++){
      var wy2=j+cam, ax=this.axe(s,wy2), bo=this.bord(s,wy2);
      var g0=Math.round(ax-bo), d0=Math.round(ax+bo);
      R(-8,j,g0+8,1,'#2f3642');
      R(d0,j,L-d0+8,1,'#2f3642');
      R(g0-2,j,2,1,'#5a6475');            /* l'enrochement eclaire */
      R(d0,j,2,1,'#5a6475');
      if((j+Math.floor(cam))%7===0){
        R(g0-9,j,6,1,'#232a34');R(d0+3,j,6,1,'#232a34');
      }
    }
    /* les bouees du chenal, tous les soixante metres */
    var y0=Math.floor((cam-40)/60)*60;
    for(var b=0;b<8;b++){
      var by=y0+b*60, bx=this.axe(s,by), bw=this.bord(s,by);
      var sy=by-cam;
      if(sy<-6||sy>H+6)continue;
      /* verte a babord, rouge a tribord — la regle du port */
      disque(bx-bw+4,sy,2,'#2fa868');R(bx-bw+3,sy-5,2,4,'#2fa868');
      disque(bx+bw-4,sy,2,'#c23a2c');R(bx+bw+1,sy-5,2,4,'#c23a2c');
      if(Math.floor(s.t/600)%2===0){
        R(bx-bw+3,sy-7,2,2,'#7fe0bc');R(bx+bw+1,sy-7,2,2,'#f09a8a');
      }
    }

    /* ---- LE SILLAGE ---- */
    for(i=0;i<s.sillage.length;i++){
      var w=s.sillage[i], a=w.vie/1600;
      var wy3=w.y-cam;
      if(wy3<-10||wy3>H+10)continue;
      R(w.x-6,wy3,12,1,'rgba(200,228,250,'+(a*0.18).toFixed(2)+')');
      R(w.x-10,wy3+2,20,1,'rgba(200,228,250,'+(a*0.10).toFixed(2)+')');
    }

    /* ---- LE PORTE-CONTENEURS ----
       Trois cents metres vus de dessus : la coque, l'etrave en pointe,
       les rangs de conteneurs, le chateau a l'arriere. C'est le plus gros
       objet de l'ecran et c'est voulu — c'est lui qu'on pilote. */
    var ny=n.y-cam;
    G.save();G.translate(n.x,ny);G.rotate(n.a);
    /* l'ombre portee sur l'eau */
    R(-RM_LARG-1,-RM_LONG+3,RM_LARG*2+2,RM_LONG*2-3,'rgba(0,0,0,.28)');
    R(-RM_LARG,-RM_LONG+6,RM_LARG*2,RM_LONG*2-6,'#1e2a3a');
    R(-RM_LARG,-RM_LONG+6,RM_LARG*2,2,'#35475e');
    /* l'etrave */
    G.beginPath();G.moveTo(-RM_LARG,-RM_LONG+7);G.lineTo(0,-RM_LONG-2);
    G.lineTo(RM_LARG,-RM_LONG+7);G.closePath();
    G.fillStyle='#1e2a3a';G.fill();
    R(-2,-RM_LONG-2,4,3,'#c23a2c');            /* le bulbe peint en rouge */
    /* les rangs de conteneurs */
    var PC=[['#2a6a9a','#4a9aca'],['#b8302e','#d8584e'],['#1f7a68','#3aa892'],
            ['#c8a22a','#f0d78a'],['#6a3a8a','#9a68b8'],['#c86a28','#e8984e']];
    for(i=0;i<9;i++)for(j=0;j<3;j++){
      var C=PC[(i*2+j+s.graine)%6];
      R(-11+j*8,-RM_LONG+12+i*8,7,7,C[0]);
      R(-11+j*8,-RM_LONG+12+i*8,7,1,C[1]);
    }
    /* le chateau et la cheminee */
    R(-9,RM_LONG-20,18,13,'#141c29');R(-9,RM_LONG-20,18,1,'#2a3c54');
    R(-6,RM_LONG-17,12,4,'#20334a');
    R(-2,RM_LONG-26,4,6,'#141c29');R(-2,RM_LONG-27,4,1,'#ff6a5a');
    /* le liseré du bordage : il dit de quel cote on penche */
    R(-RM_LARG,-RM_LONG+6,1,RM_LONG*2-6,'#2d4360');
    R(RM_LARG-1,-RM_LONG+6,1,RM_LONG*2-6,'#0e1521');
    G.restore();

    /* ---- L'AUSSIERE ----
       Tendue, elle est claire et droite ; molle, elle pend en arc et
       PALIT. C'est le seul endroit ou le joueur voit s'il commande
       quelque chose ou s'il tire dans le vide. */
    var et=this.etrave(s), T=s.tug;
    var ten=s.tension||0;
    var mou=Math.max(0,RM_AUSS-Math.sqrt((T.x-et.x)*(T.x-et.x)+(T.y-et.y)*(T.y-et.y)));
    for(i=0;i<=14;i++){
      var f=i/14, bx2=et.x+(T.x-et.x)*f, by2=et.y+(T.y-et.y)*f;
      /* la chainette : on ecarte le milieu du segment quand c'est mou */
      var arc=Math.sin(f*3.1416)*mou*0.55;
      R(bx2+arc*0.6, by2-cam+arc*0.4, 1,1,
        ten>0.5?'rgba(240,244,250,.90)':'rgba(170,184,200,.45)');
    }

    /* ---- LE REMORQUEUR ----
       Il regarde la ou il va : son cap se deduit de son deplacement, pas
       d'une variable de plus. */
    var ta=Math.atan2(T.x-et.x,-(T.y-et.y));
    G.save();G.translate(T.x,T.y-cam);G.rotate(ta);
    R(-5,-8,10,16,'#c2392c');R(-5,-8,10,2,'#e8604e');
    G.beginPath();G.moveTo(-5,-8);G.lineTo(0,-13);G.lineTo(5,-8);G.closePath();
    G.fillStyle='#c2392c';G.fill();
    R(-4,-3,8,7,'#e8e2d4');R(-3,-2,6,3,'#7fc8e8');
    R(-1,-9,2,4,'#3a3f4c');
    R(-5,4,10,3,'#2a2f3a');                     /* le pneu de defense */
    /* l'eau brassee par l'helice */
    for(i=0;i<4;i++)R(-3+i*2,9+((s.t/90+i)%3),1,2,'rgba(200,228,250,.35)');
    G.restore();

    /* ---- LES PARTICULES ---- */
    for(i=0;i<s.part.length;i++)R(s.part[i].x,s.part[i].y-cam,1,1,s.part[i].c);
    G.restore();

    /* =================== LE CHROME =================== */
    R(0,0,L,15,'rgba(6,9,14,.70)');
    G.font='bold 9px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#ffe24a';G.fillText(s.score.toLocaleString('fr-FR'),L-5,11);
    G.font='7px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#9fb4c8';G.fillText(Math.round(s.dist*2)+' M',5,11);

    /* ---- LA COQUE ---- */
    var cw=Math.round(L*0.40), cx0=Math.round((L-cw)/2);
    R(cx0,4,cw,7,'rgba(0,0,0,.55)');
    var cf=Math.max(0,s.coque/RM_COQUE);
    R(cx0+1,5,Math.max(1,(cw-2)*cf),5,cf<0.3?'#ff4a4a':cf<0.6?'#ff9a3a':'#5ad8ff');
    G.font='5px ui-monospace,monospace';G.textAlign='center';
    G.fillStyle='#cfe4f2';G.fillText('COQUE',L/2,10);

    /* ---- LE CAP ET LA GIRATION ----
       La fleche dit dans quel sens le navire TOURNE DEJA, et c'est
       l'information qui manque a l'oeil : on voit sa position, on ne voit
       pas sa vitesse de giration — or c'est elle qu'il faut annuler. */
    var gy=H-22, gw=Math.round(L*0.42), gx=Math.round((L-gw)/2);
    R(gx,gy,gw,7,'rgba(0,0,0,.55)');
    R(gx+gw/2,gy,1,7,'rgba(255,255,255,.35)');
    var gf=Math.max(-1,Math.min(1,n.w*3400));
    var gbw=Math.max(2,Math.abs(gf)*gw/2);
    R(gf>=0?gx+gw/2:gx+gw/2-gbw,gy+1,gbw,5,
      Math.abs(gf)>0.7?'#ff9a3a':'#5ad8ff');
    G.font='5px ui-monospace,monospace';G.fillStyle='#5a6b80';
    G.textAlign='left';G.fillText('BÂBORD',4,gy+6);
    G.textAlign='right';G.fillText('TRIBORD',L-4,gy+6);
    G.textAlign='center';G.fillStyle='#5a6b80';
    G.fillText('GIRATION',L/2,gy-3);

    /* ---- LE COURANT ---- */
    if(Math.abs(s.courant)>0.004){
      var cs=s.courant>0?1:-1;
      G.fillStyle='rgba(122,206,240,.8)';G.font='bold 7px ui-monospace,monospace';
      G.textAlign='center';
      /* LE MOT DU COURANT MONTE AU-DESSUS DE LA JAUGE DE GIRATION : pose
         a la meme hauteur, il s'ecrivait par-dessus et on lisait les deux
         mots melanges. */
      G.fillText(cs>0?'COURANT →':'← COURANT',L/2,H-46);
      for(i=0;i<7;i++){
        var fx=((s.t*0.05*cs+i*22)%(L+30)+L+30)%(L+30)-15;
        R(fx,H-58+((i*7)%6),7,1,'rgba(122,206,240,.22)');
      }
    }

    /* ---- LE MOT ---- */
    if(s.motT>0&&s.mot){
      var a=Math.min(1,s.motT/400);
      var tp=s.motGros?11:9;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>5&&G.measureText(s.mot).width>L-14){
        tp--;G.font='bold '+tp+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=22;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.62*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp,tw+10,tp+6);
      G.fillStyle=(s.motGros?'rgba(255,226,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }

    if(s.flash>0){
      var fc=s.flashC;
      G.fillStyle=(fc==='#ff4a4a'?'rgba(255,74,74,':fc==='#7fe0bc'?'rgba(127,224,188,':
                   'rgba(255,226,74,')+(s.flash/400*0.18).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT LA PARTIE ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.78)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText('LE REMORQUEUR',L/2,H*0.26);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('POSE LE POUCE SUR L’EAU :',L/2,H*0.26+18);
      G.fillText('LE REMORQUEUR Y VA',L/2,H*0.26+30);
      G.fillStyle='#9fb4c8';
      G.fillText('LE NAVIRE EST EN MACHINE.',L/2,H*0.26+48);
      G.fillText('TOI, TU L’ORIENTES.',L/2,H*0.26+60);
      G.fillStyle='#7fe0bc';
      G.fillText('300 M NE TOURNENT PAS VITE —',L/2,H*0.26+78);
      G.fillText('ET NE S’ARRÊTENT PAS DE TOURNER.',L/2,H*0.26+90);
      G.fillText('DONNE L’ANGLE AVANT LE VIRAGE.',L/2,H*0.26+102);
      G.fillStyle='#ff9a5a';
      G.fillText('LA PASSE SE RESSERRE',L/2,H*0.26+120);
    }

    /* ---- APRES ---- */
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.78)';G.fillRect(0,H*0.26,L,76);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(Math.round(s.dist*2)+' MÈTRES REMONTÉS',L/2,H*0.26+40);
      G.fillStyle='#9fb4c8';
      G.fillText(s.touches+' RAGAGE'+(s.touches>1?'S':''),L/2,H*0.26+56);
      G.fillText(s.prime+' FOIS DANS L’AXE',L/2,H*0.26+70);
    }

    if(s.enPause){
      G.fillStyle='rgba(6,9,14,.66)';G.fillRect(0,0,L,H);
      G.textAlign='center';G.font='bold 11px ui-monospace,monospace';
      G.fillStyle='#ffe24a';G.fillText('EN PAUSE',L/2,H/2-6);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('TAPE POUR REPRENDRE',L/2,H/2+8);
    }
  },

  /* ================= LA BANNIERE DE LA SALLE ================= */
  banniere:function(g,w,h,grand){
    g.imageSmoothingEnabled=false;
    var gr=g.createLinearGradient(0,0,0,h);
    gr.addColorStop(0,'#0c1526');gr.addColorStop(1,'#13283e');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
      Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));}
    /* les deux digues, vues de dessus */
    for(var j=0;j<h;j++){
      var ax=w*0.50+Math.sin(j*0.07)*w*0.05, bo=w*0.30;
      r(0,j,ax-bo,1,'#2f3642');r(ax+bo,j,w,1,'#2f3642');
      r(ax-bo-2,j,2,1,'#5a6475');r(ax+bo,j,2,1,'#5a6475');
    }
    /* le navire, en travers : c'est le sujet */
    g.save();g.translate(w*0.56,h*0.56);g.rotate(0.42);
    r(-9,-26,18,52,'#1e2a3a');r(-9,-26,18,2,'#35475e');
    var PC=[['#2a6a9a','#4a9aca'],['#b8302e','#d8584e'],['#1f7a68','#3aa892'],
            ['#c8a22a','#f0d78a']];
    for(var i=0;i<6;i++)for(var k=0;k<2;k++){
      var C=PC[(i+k)%4];
      r(-7+k*7,-22+i*8,6,6,C[0]);r(-7+k*7,-22+i*8,6,1,C[1]);
    }
    r(-6,18,12,7,'#141c29');
    g.restore();
    /* le remorqueur et l'aussiere */
    for(var q=0;q<10;q++)r(w*0.42-q*1.4,h*0.30+q*1.1,1,1,'#e8eef6');
    g.save();g.translate(w*0.40,h*0.26);g.rotate(-0.5);
    r(-4,-6,8,12,'#c2392c');r(-4,-6,8,2,'#e8604e');
    r(-3,-2,6,5,'#e8e2d4');
    g.restore();
    if(grand){
      g.fillStyle='#ffe24a';g.font='bold 9px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LE REMORQUEUR',w-6,14);
    }
  }
};
