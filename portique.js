/* =======================================================================
   LE PORTIQUE  —  une borne de l'arcade du port
   =======================================================================

   UN SEUL GESTE. On tape, le conteneur tombe. Tout le jeu tient dans le
   moment du lacher : le chariot va et vient, le conteneur se balance au
   bout du cable, et la vitesse qu'il a quand on le lache est celle qu'il
   emporte dans sa chute. Un jeu a un bouton n'a pas besoin de plus — ce
   qui doit grandir, c'est ce qu'on risque, pas le nombre de touches.

   POURQUOI LE PENCHANT ET PAS LA DECOUPE. Les jeux d'empilage coupent ce
   qui depasse : le bloc rapetisse, et au bout de vingt coups on joue sur
   un timbre-poste. La partie se termine parce que la cible a disparu, pas
   parce qu'on a mal joue. Ici le conteneur garde sa taille et chaque
   decalage ajoute du COUPLE : la pile penche. On voit le danger monter,
   et surtout on peut le RATTRAPER — un conteneur pose pile dans l'axe
   redresse l'ensemble. Il y a donc une facon de se sortir d'une mauvaise
   serie, et c'est ce qui fait qu'on relance.

   LE CARREAU. Poser a moins de deux pixels et demi de l'axe vaut le mot
   et le bonus : c'est le geste que le joueur vient chercher. La pile se
   redresse de moitie, le combo monte, l'ecran le dit. Trois carreaux de
   suite valent plus que trente poses molles.

   CE QUI SE MET EN TRAVERS. Un jeu a un bouton devient plat si la seule
   chose qui change est la vitesse. Toutes les quatre a six poses, le port
   s'en mele : le mistral pousse la chute de cote, une mouette se pose sur
   le conteneur et double le balancement, le contremaitre siffle et le
   chariot s'affole, une corne de brume secoue tout. Rien de tout cela ne
   demande une touche de plus : ca change ce que vaut le meme geste.

   LA GRUE SUIT LA PILE. Le portique reste en haut de l'ecran et la pile
   monte vers lui : ses jambes descendent hors champ. Un portique fixe
   aurait signifie une partie qui s'arrete quand la pile atteint la
   poutre, c'est-a-dire une partie bornee — on veut qu'elle ne s'arrete
   que sur une faute.

   ===================================================================== */

var PQ_CW=38, PQ_CH=13;        /* le conteneur : large et plat, comme un vrai */
var PQ_CABLE=46;               /* la longueur du cable, en pixels de scene */
var PQ_G=0.00050;              /* la gravite : une chute d'une seconde environ */
var PQ_RATES=3;                /* les ratages tolerés avant la fin */
var PQ_CARREAU=2.6;            /* en deca, c'est un carreau */

/* HUIT COULEURS DE CONTENEUR, ET PAS UNE DE PLUS. Un tirage dans une
   palette large donne une pile bariolee ou l'oeil ne distingue plus les
   etages ; huit teintes franches et on compte les blocs d'un coup d'oeil. */
var PQ_COUL=[
  {c:'#2a6a9a', h:'#4a9aca', b:'#1b4668'},
  {c:'#b8302e', h:'#d8584e', b:'#7c1f1e'},
  {c:'#1f7a68', h:'#3aa892', b:'#145045'},
  {c:'#c8a22a', h:'#f0d78a', b:'#876c18'},
  {c:'#6a3a8a', h:'#9a68b8', b:'#47265c'},
  {c:'#c86a28', h:'#e8984e', b:'#87461a'},
  {c:'#4a5a6a', h:'#72869a', b:'#313c47'},
  {c:'#8a8a2a', h:'#b4b44e', b:'#5d5d1c'}
];

/* LES QUATRE COUPS DU PORT. Chacun porte un mot : sans le mot, le joueur
   voit le jeu devenir bizarre et croit a un bogue. */
var PQ_EVS=[
  {cle:'mistral', mot:'LE MISTRAL SE LEVE', duree:6200},
  {cle:'mouette', mot:'UNE MOUETTE S’EST POSEE', duree:4600},
  {cle:'siffle',  mot:'LE CONTREMAITRE SIFFLE', duree:6000},
  {cle:'corne',   mot:'CORNE DE BRUME', duree:1500}
];

MOTEUR.portique={
  nom:'Le Portique', sous:'UN TAP POUR LÂCHER · NE FAIS PAS TOUT TOMBER',
  vise:150, pausable:true,
  /* PAS DE MANCHE. Le jeu se joue a un doigt n'importe ou sur l'ecran :
     une manche volerait la moitie de la surface pour ne rien commander. */

  init:function(){
    return {phase:'pret', t:0, score:0, L:150, H:300,
            pile:[], cam:0, camX:0, cha:{x:75, dir:1, v:0.055}, ph:0, amp:0,
            chute:null, penche:0, combo:0, carreaux:0,
            rates:0, poses:0, mot:'', motT:0, motGros:false,
            ev:null, evT:0, prochain:4, vent:0, mouette:0, secousse:0,
            debris:[], part:[], etoiles:null, fini:0, enPause:false,
            recH:0, flash:0};
  },

  /* ================= LE CADRE =================
     La scene change de taille quand le telephone tourne : on garde la
     pile ou elle est et on recentre le chariot. Rien d'autre ne depend
     de la largeur, c'est le confort d'un monde qui tient en une colonne. */
  cadre:function(s,L,H){
    s.L=L;s.H=H;
    s.cha.x=Math.max(PQ_CW/2+6,Math.min(L-PQ_CW/2-6,s.cha.x));
    if(!s.etoiles){
      s.etoiles=[];
      for(var i=0;i<70;i++)s.etoiles.push({x:al(i*3.7)*L, y:al(i*7.1)*2000-1400,
                                           g:al(i*11.3)});
    }
  },

  demarrer:function(s){
    s.phase='jeu';s.t=0;s.score=0;s.pile=[];s.debris=[];s.part=[];
    s.penche=0;s.combo=0;s.carreaux=0;s.rates=0;s.poses=0;
    s.chute=null;s.ev=null;s.evT=0;s.prochain=4;s.vent=0;s.mouette=0;
    s.secousse=0;s.fini=0;s.ph=0;s.amp=0;s.flash=0;s.enPause=false;
    /* LE PREMIER BLOC EST DEJA POSE. Demander au joueur de viser le quai
       vide pour son tout premier coup, c'est le faire perdre avant
       d'avoir compris la regle. */
    s.pile.push({x:s.L/2, y:-PQ_CH, w:PQ_CW, h:PQ_CH, c:0});
    s.cam=-(s.H-46);s.camX=0;
    s.cha.x=s.L/2;s.cha.dir=1;
    this.dire(s,'EMPILE',false);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1500:1000;s.motGros=!!gros;},

  sommet:function(s){return s.pile.length?s.pile[s.pile.length-1]:{x:s.L/2,y:0,w:PQ_CW};},
  chaY:function(s){return this.sommet(s).y-86;},

  /* =====================================================================
     OU LE CONTENEUR VA TOMBER SI ON LACHE MAINTENANT
     =====================================================================
     LA MESURE QUI A TOUT CHANGE. Le repere montrait d'abord l'APLOMB du
     conteneur pendu. Un robot qui visait cet aplomb au pixel posait
     quatorze conteneurs et n'obtenait pas un seul carreau : le conteneur
     emporte la vitesse du chariot, et il derive d'une dizaine de pixels
     pendant sa chute — plus de la moitie de sa demi-largeur. Viser juste
     etait donc puni. Le repere doit montrer le POINT D'ARRIVEE.

     Ce n'est pas une aide qui simplifie : le point d'arrivee file sur le
     cote pendant que le chariot roule, et il faut toujours anticiper pour
     le poser sur l'axe. Mais au moins le joueur voit ce qu'il vise, et le
     jeu devient une question d'adresse au lieu d'une devinette.

     On ignore volontairement le vent : sous le mistral le repere doit
     mentir un peu, c'est tout l'interet du coup de vent.
     ===================================================================== */
  lacher:function(s){
    var ang=s.amp*Math.sin(s.ph);
    return {ang:ang,
            x:s.cha.x+Math.sin(ang)*PQ_CABLE,
            y:this.chaY(s)+Math.cos(ang)*PQ_CABLE,
            vx:s.amp*Math.cos(s.ph)*0.0033*PQ_CABLE+s.cha.v*0.40};
  },
  arrivee:function(s){
    var q=this.lacher(s), som=this.sommet(s);
    var h=(som.y-PQ_CH)-q.y;
    if(h<=0)return q.x;
    return q.x+q.vx*Math.sqrt(2*h/PQ_G);
  },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.secousse>0)s.secousse=Math.max(0,s.secousse-dt*0.004);

    /* les particules et les debris vivent meme apres la fin : c'est
       l'ecroulement qu'on vient regarder */
    var i;
    for(i=s.part.length-1;i>=0;i--){
      var p=s.part[i];p.vie-=dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=PQ_G*dt*0.4;
      if(p.vie<=0)s.part.splice(i,1);
    }
    for(i=s.debris.length-1;i>=0;i--){
      var d=s.debris[i];
      d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=PQ_G*dt;d.rot+=d.rotV*dt;
      if(d.y>s.cam+s.H+120)s.debris.splice(i,1);
    }

    if(s.phase!=='jeu'){
      /* apres la chute on laisse une seconde et demie de spectacle avant
         de rendre la main : couper net donne l'impression d'un plantage */
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }

    /* ---- L'EVENEMENT EN COURS ---- */
    if(s.ev){
      s.evT-=dt;
      if(s.ev.cle==='mistral')s.vent=Math.sin(s.t*0.0012)*0.00030;
      if(s.evT<=0){
        if(s.ev.cle==='mistral')s.vent=0;
        if(s.ev.cle==='mouette')s.mouette=0;
        s.ev=null;
      }
    }

    /* ---- LE CHARIOT ----
       Il va et vient entre les deux jambes. Sa vitesse monte avec la
       pile, et le sifflet du contremaitre la pousse encore. */
    var niv=s.pile.length;
    var vit=0.042+Math.min(0.062,niv*0.0030);
    if(s.ev&&s.ev.cle==='siffle')vit*=1.75;
    var marge=PQ_CW/2+8;
    s.cha.x+=s.cha.dir*vit*dt;
    if(s.cha.x>s.L-marge){s.cha.x=s.L-marge;s.cha.dir=-1;}
    if(s.cha.x<marge){s.cha.x=marge;s.cha.dir=1;}
    s.cha.v=s.cha.dir*vit;

    /* ---- LE BALANCEMENT ----
       Nul pour les trois premiers etages : on apprend d'abord a lire le
       chariot. Il entre ensuite et grandit, et la mouette le double. */
    var ampCible=niv<4?0:Math.min(0.40,(niv-3)*0.021);
    if(s.mouette>0)ampCible*=1.9;
    s.amp+=(ampCible-s.amp)*Math.min(1,dt*0.004);
    s.ph+=dt*0.0033;

    /* ---- LA CHUTE ---- */
    if(s.chute){
      var q=s.chute;
      q.vy+=PQ_G*dt;
      q.vx+=s.vent*dt;
      q.x+=q.vx*dt;q.y+=q.vy*dt;
      q.rot+=q.rotV*dt;
      var som=this.sommet(s);
      /* LE DESSUS DE LA PILE EST LA SEULE SURFACE QUI PORTE. On compare
         le bas du conteneur au haut du bloc precedent, et on ne teste
         qu'en descente : un conteneur lache vers le haut par un coup de
         vent ne doit pas se coller au plafond. */
      if(q.vy>0&&q.y+PQ_CH>=som.y){
        var dx=q.x-som.x;
        if(Math.abs(dx)>PQ_CW*0.84){ this.rate(s,q,dx); }
        else { this.poser(s,q,dx); }
        s.chute=null;
      }
      /* un conteneur qui sort par le bas est perdu aussi : ca arrive
         quand le vent le pousse au-dela du bord de la pile */
      else if(q.y>som.y+200){ this.rate(s,q,999); s.chute=null; }
    }

    /* ---- LE PENCHANT ----
       Il ne revient pas tout seul a zero : ce serait pardonner sans
       rien demander. Il DERIVE au contraire vers le dehors, comme une
       pile qui travaille — et seul un carreau le redresse.

       POURQUOI UNE DERIVE EXPONENTIELLE ET NON ACCELEREE. Le premier
       reglage accumulait une vitesse de penchant : la derive etait donc
       quadratique, et une pile a 0,44 — un seul conteneur pose de
       travers — s'ecroulait en moins d'une seconde. Mesure faite, c'etait
       injouable. Une croissance proportionnelle au penchant lui-meme
       double en douze secondes depuis la moitie, et laisse encore deux
       secondes pour placer le carreau qui sauve quand on frole le bord.
       C'est le temps de reaction qu'on veut : court, jamais nul.

       LA ZONE MORTE. Sous un huitieme, rien ne bouge. Sans elle, une pile
       presque droite finissait par tomber toute seule au bout de deux
       minutes, et le joueur ne pouvait pas comprendre pourquoi. */
    if(Math.abs(s.penche)>0.12)
      s.penche+=(s.penche>0?1:-1)*Math.abs(s.penche)*0.000058*dt;
    if(Math.abs(s.penche)>=1){ this.ecrouler(s); return; }

    /* ---- LA CAMERA ----
       Elle garde le sommet de la pile aux deux tiers de l'ecran, et ne
       descend jamais sous le quai tant qu'on ne l'a pas quitte.

       ELLE SUIT AUSSI LE COTE, et c'est ce qui manquait. Chaque conteneur
       se pose un peu decale du precedent : au bout de dix etages la pile
       serpente de trente pixels, et avec l'inclinaison par-dessus elle
       sortait franchement du cadre — on jouait a l'aveugle sur une pile
       qu'on ne voyait plus. Le glissement lateral est volontairement plus
       lent que le vertical : une camera qui recadre aussi vite qu'on pose
       donne le mal de mer. */
    var cible=Math.min(-(s.H-46), this.sommet(s).y-s.H*0.66);
    s.cam+=(cible-s.cam)*Math.min(1,dt*0.006);
    var cx=Math.max(-s.L*0.16,Math.min(s.L*0.16,this.sommet(s).x-s.L/2));
    s.camX+=(cx-s.camX)*Math.min(1,dt*0.0022);
  },

  /* ================= POSER, RATER, S'ECROULER ================= */
  poser:function(s,q,dx){
    var som=this.sommet(s);
    var carreau=Math.abs(dx)<PQ_CARREAU;
    /* il glisse un peu a l'atterrissage : un bloc qui se colle pile ou
       on l'a lache rend la pile trop sage pour qu'on la craigne */
    var px=som.x+dx*0.86;
    s.pile.push({x:px, y:som.y-PQ_CH, w:PQ_CW, h:PQ_CH,
                 c:(som.c+1+Math.floor(al(s.pile.length*5.3)*7))%8});
    s.poses++;

    if(carreau){
      s.combo++;s.carreaux++;
      /* LE REDRESSEMENT : c'est la recompense qui compte, bien plus que
         les points. Un joueur en difficulte sait qu'un beau coup le
         sauve, et il vise au lieu de taper au hasard. */
      s.penche*=0.52;
      s.score+=50*Math.min(5,s.combo);
      this.dire(s, s.combo>1?('CARREAU ×'+s.combo):'CARREAU', true);
      this.etoiles(s,px,som.y-PQ_CH,'#ffe24a',16);
      s.flash=180;
    }else{
      s.combo=0;
      /* DEUX SOURCES DE COUPLE : le decalage, et la vitesse qu'il reste
         au conteneur. Poser de travers est grave ; poser de travers ET
         en pleine course l'est deux fois. */
      s.penche+=(dx/(PQ_CW*0.5))*0.20;
      /* LA VITESSE RESIDUELLE COMPTE AUTANT QUE LE DECALAGE. Poser pile
         dans l'axe mais en pleine course n'est pas un bon coup : le
         conteneur arrive de travers et la pile le sent. Sans ce terme,
         il suffisait d'attendre le bon x sans regarder le balancement. */
      s.penche+=q.vx*2.5;
      s.penche=Math.max(-1.4,Math.min(1.4,s.penche));
      s.score+=10;
      if(Math.abs(dx)<6)this.dire(s,'BIEN',false);
    }
    s.score+=Math.floor(s.pile.length*0.6);
    s.secousse=Math.min(1,s.secousse+0.35+Math.abs(dx)*0.02);
    this.poussiere(s,px,som.y-PQ_CH+PQ_CH);

    /* ---- LE PROCHAIN COUP DU PORT ---- */
    s.prochain--;
    if(s.prochain<=0&&!s.ev){
      var e=PQ_EVS[Math.floor(Math.random()*PQ_EVS.length)];
      s.ev=e;s.evT=e.duree;s.prochain=4+Math.floor(Math.random()*3);
      this.dire(s,e.mot,true);
      if(e.cle==='mouette')s.mouette=1;
      if(e.cle==='corne'){s.secousse=1;s.penche+=(Math.random()-0.5)*0.22;}
    }
  },

  rate:function(s,q,dx){
    s.rates++;s.combo=0;
    /* LE CONTENEUR MANQUE N'EST PAS EFFACE : on le laisse tomber le long
       de la pile et s'ecraser sur le quai. Voir ou il part dit pourquoi
       on l'a rate, et c'est comme ca qu'on corrige. */
    s.debris.push({x:q.x,y:q.y,w:PQ_CW,h:PQ_CH,c:Math.floor(al(s.t)*8),
                   vx:q.vx+(dx>0?0.03:-0.03),vy:q.vy*0.5,
                   rot:q.rot,rotV:(dx>0?1:-1)*0.0024});
    s.secousse=Math.min(1,s.secousse+0.5);
    if(s.rates>=PQ_RATES){ this.ecrouler(s); return; }
    this.dire(s,'À L’EAU · '+(PQ_RATES-s.rates)+' RESTANT'+
                (PQ_RATES-s.rates>1?'S':''),true);
  },

  /* L'ECROULEMENT. Toute la pile devient des debris qui partent du cote
     ou elle penchait : c'est la seule recompense d'une partie perdue, et
     elle doit etre genereuse — c'est ce qui fait relancer. */
  ecrouler:function(s){
    var sens=s.penche>=0?1:-1;
    if(s.rates>=PQ_RATES)sens=(Math.random()<0.5?1:-1);
    for(var i=0;i<s.pile.length;i++){
      var b=s.pile[i], f=i/Math.max(1,s.pile.length);
      s.debris.push({x:b.x,y:b.y,w:b.w,h:b.h,c:b.c,
                     vx:sens*(0.012+f*0.085)*(0.7+Math.random()*0.6),
                     vy:-0.015-f*0.03,
                     rot:0,rotV:sens*(0.0008+f*0.0030)});
    }
    if(s.chute)s.debris.push({x:s.chute.x,y:s.chute.y,w:PQ_CW,h:PQ_CH,
                              c:0,vx:s.chute.vx,vy:s.chute.vy,rot:0,rotV:0.002});
    s.pile=[];s.chute=null;
    s.secousse=1;
    this.poussiere(s,s.L/2,0,40);
    this.dire(s,s.rates>=PQ_RATES?'TROIS À L’EAU':'TOUT PAR TERRE',true);
    s.phase='tombe';s.fini=1600;
  },

  fin:function(s){
    s.phase='fini';
    if(s.score>s.recH)s.recH=s.score;
    if(typeof monterActions==='function')monterActions();
    if(typeof finirPartie==='function')finirPartie(s.score);
  },

  etoiles:function(s,x,y,c,n){
    for(var e=0;e<(n||12);e++){var a=e/(n||12)*6.283;
      s.part.push({x:x,y:y,vx:Math.cos(a)*0.055,vy:Math.sin(a)*0.055-0.02,
                   vie:460,c:c,r:1});}
  },
  poussiere:function(s,x,y,n){
    for(var e=0;e<(n||10);e++)
      s.part.push({x:x+(Math.random()-0.5)*PQ_CW,y:y,
                   vx:(Math.random()-0.5)*0.05,vy:-Math.random()*0.02,
                   vie:300+Math.random()*260,c:'#8a8276',r:1});
  },

  /* ================= LE DOIGT =================
     UN SEUL GESTE, PARTOUT. Pas de bouton a viser : le pouce tombe ou il
     veut et le conteneur part. C'est la seule facon d'avoir un jeu qui se
     joue d'une main dans le bus. */
  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='jeu'||s.chute)return;
    /* LA VITESSE DU LACHER, c'est tout le jeu : l'elan du pendule plus
       celui du chariot. Un conteneur lache au bout de sa course part
       presque droit ; lache au milieu, il file. Le meme calcul sert au
       repere d'arrivee — ils ne peuvent donc pas se contredire. */
    var q=this.lacher(s);
    s.chute={x:q.x, y:q.y, vx:q.vx, vy:0, rot:q.ang*0.4, rotV:0};
    s.mouette=0;
    if(s.ev&&s.ev.cle==='mouette'){s.ev=null;s.evT=0;}
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
  conteneur:function(x,y,w,h,ci,rot){
    var C=PQ_COUL[ci%8];
    if(rot){G.save();G.translate(x,y+h/2);G.rotate(rot);G.translate(-x,-(y+h/2));}
    R(x-w/2,y,w,h,C.c);
    R(x-w/2,y,w,1,C.h);            /* le liseré du dessus */
    R(x-w/2,y+h-1,w,1,C.b);        /* l'ombre du dessous */
    /* LES NERVURES. Un rectangle plein ne se lit pas comme un conteneur ;
       les cannelures verticales suffisent, et elles disent la taille. */
    for(var k=1;k<w/4;k++)R(x-w/2+k*4,y+2,1,h-3,C.b);
    R(x-w/2,y+2,1,h-3,C.h);R(x+w/2-1,y+2,1,h-3,C.b);
    if(rot)G.restore();
  },

  dessine:function(s,L,H){
    var i, cam=s.cam;
    var sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.2:0;

    /* ---- LE CIEL ---- */
    var gr=G.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,'#0b1220');gr.addColorStop(0.55,'#16243a');
    gr.addColorStop(1,'#1d3350');
    G.fillStyle=gr;G.fillRect(0,0,L,H);
    /* LA LUNE, posee une fois pour toutes en haut a gauche : elle donne
       un point fixe quand tout le reste defile vers le bas. */
    disque(L*0.18,H*0.13,7,'#f2eede');
    disque(L*0.18-2.5,H*0.13-2,6,'#0f1b2c');
    if(s.etoiles)for(i=0;i<s.etoiles.length;i++){
      var e=s.etoiles[i], ey=((e.y-cam*0.22)%2200+2200)%2200-200;
      if(ey>-4&&ey<H)R(e.x,ey,e.g>0.82?2:1,1,e.g>0.6?'#cfe4ff':'#7f93ae');
    }
    /* LE PORT AU LOIN. Une silhouette de grues et de hangars collee en bas
       du ciel, qui glisse quatre fois moins vite que la pile : sans elle
       on monte dans un aplat bleu et rien ne dit qu'on monte. */
    var hy=(0-cam*0.26)+H*0.52;
    if(hy>-30&&hy<H+40){
      for(i=0;i<9;i++){
        var gx2=((i*37)%(L+20))-10, gh=14+((i*13)%16);
        R(gx2,hy-gh,2,gh,'#101c2c');R(gx2-5,hy-gh,12,2,'#101c2c');
        if(i%2===0)R(gx2+1,hy-gh-2,1,2,'#ff6a5a');
      }
      R(0,hy,L,10,'#0d1726');
      for(i=0;i<L;i+=5)if((i*7)%13<4)R(i,hy+2,1,1,'#ffd27a');
    }

    G.save();G.translate(sec-s.camX,sec*0.6);

    /* ---- LA MER ET LE QUAI (en coordonnees monde, y=0 au quai) ---- */
    var sy=0-cam;
    if(sy<H+40){
      R(0,sy,L,H-sy+40,'#16293c');
      for(i=0;i<L;i+=6)R(i,sy+4+((i*7)%11),4,1,'#23415c');
      R(0,sy-3,L,3,'#2e3340');          /* le bord du quai */
      R(0,sy-4,L,1,'#555c6b');
      for(i=0;i<L;i+=11)R(i,sy-3,1,3,'#23272f');
    }

    /* ---- LE PORTIQUE ----
       Les jambes descendent vers le quai et sortent du cadre : on ne voit
       que le haut de la machine, et c'est ce qui dit qu'on est monte. */
    var cy=this.chaY(s)-cam;
    R(8,cy-8,7,Math.max(0,sy-cy+8),'#8e2c24');
    R(L-15,cy-8,7,Math.max(0,sy-cy+8),'#8e2c24');
    R(8,cy-8,7,1,'#c0463a');R(L-15,cy-8,7,1,'#c0463a');
    /* PLUS DE CROISILLONS. Des traits rouges en travers de toute la
       largeur se lisaient comme des etages, et l'oeil les comptait au
       lieu de compter les conteneurs. Deux jambes et une poutre disent
       deja la machine. */
    R(4,cy-16,L-8,9,'#a8352b');
    R(4,cy-16,L-8,2,'#d4564a');
    R(4,cy-8,L-8,1,'#6e1f19');

    /* ---- LE CHARIOT ET LE CABLE ---- */
    var ang=s.amp*Math.sin(s.ph);
    R(s.cha.x-10,cy-7,20,7,'#d8b43a');
    R(s.cha.x-10,cy-7,20,1,'#f4dc80');
    R(s.cha.x-8,cy,3,2,'#4a4a52');R(s.cha.x+5,cy,3,2,'#4a4a52');
    if(!s.chute&&s.phase==='jeu'){
      var bx=s.cha.x+Math.sin(ang)*PQ_CABLE, by=cy+Math.cos(ang)*PQ_CABLE;
      /* LE CABLE EN PIXELS, PAS EN TRAIT. Un stroke d'un pixel se perdait
         sur le bleu de nuit : a la capture on voyait un conteneur flotter
         sous une grue sans rien pour l'y relier. Des carres poses le long
         du segment tiennent le style du reste et se voient. */
      for(var kc=0;kc<=18;kc++){
        var fc=kc/18;
        R(s.cha.x+(bx-s.cha.x)*fc, cy+2+(by-1-(cy+2))*fc, 1, 2, '#aab4c4');
      }
      R(bx-5,by-3,10,3,'#6a7280');R(bx-5,by-3,10,1,'#8c95a4');
      this.conteneur(bx,by,PQ_CW,PQ_CH,s.pile.length?(this.sommet(s).c+1)%8:0,ang*0.5);
      /* LA MOUETTE POSEE DESSUS. Elle n'empeche rien, elle double le
         balancement — et on la voit, donc on comprend pourquoi ca
         remue soudain. */
      if(s.mouette>0){
        var mx=bx+6, my=by-5;
        R(mx-5,my-2,10,4,'#f4f4f0');R(mx-6,my-1,3,2,'#f4f4f0');
        R(mx+4,my-5,4,4,'#f4f4f0');R(mx+7,my-4,3,1,'#f0a830');
        R(mx+6,my-4,1,1,'#14161c');
        R(mx-3,my-3,7,1,'#c8ccd4');
      }
      /* LE REPERE D'ARRIVEE. Il ne reste pas sous le conteneur : il part
         en diagonale vers l'endroit ou celui-ci va reellement se poser, et
         une encoche marque cet endroit sur le dessus de la pile. C'est le
         seul moyen de voir la derive — donc de l'anticiper.

         IL NE S'EFFACE JAMAIS. Un jeu de precision a besoin de son
         repere : ce qui doit grandir, c'est la vitesse du chariot et le
         balancement, pas l'aveuglement. Sous le mistral il palit, parce
         qu'il devient faux. */
      var som2=this.sommet(s), ax=this.arrivee(s), ay=som2.y-cam;
      var pale=(s.ev&&s.ev.cle==='mistral')?0.22:0.5;
      var y0=by+PQ_CH+2;
      for(var k=1;k<=26;k++){
        var f=k/26;
        R(bx+(ax-bx)*f, y0+(ay-y0)*f, 1, 3, 'rgba(255,226,74,'+pale.toFixed(2)+')');
      }
      /* DEUX MARQUES, PAS UNE. L'encoche jaune dit ou le conteneur va
         tomber ; le trait blanc dit ou est l'axe de la pile. Avec la seule
         encoche on voyait bien un repere flotter quelque part, sans
         pouvoir juger de combien on etait a cote — or c'est exactement
         l'ecart qu'il faut annuler. Les deux marques se superposent quand
         le coup est bon, et le jaune s'allume a ce moment-la. */
      R(som2.x-2,ay-8,5,2,'rgba(226,240,255,.55)');
      R(som2.x,ay-11,1,4,'rgba(226,240,255,.55)');
      R(ax-PQ_CW/2,ay-2,PQ_CW,1,'rgba(255,226,74,'+(pale+0.3).toFixed(2)+')');
      R(ax,ay-5,1,4,'rgba(255,226,74,'+(pale+0.3).toFixed(2)+')');
      if(Math.abs(ax-som2.x)<PQ_CARREAU){
        R(ax-4,ay-8,9,3,'#ffe24a');R(ax-7,ay-2,15,1,'#ffe24a');
      }
    }

    /* ---- LA PILE, PENCHEE ----
       On fait tourner tout le tas autour de son pied : une pile dont
       chaque bloc penche un peu de son cote ne se lirait pas comme un
       ensemble qui va tomber. */
    /* LE PIVOT N'EST PAS LE PIED REEL. Faire tourner cinquante etages
       autour du premier donne au sommet un decalage de plusieurs largeurs
       de conteneur : la pile quitte l'ecran alors qu'elle n'est inclinee
       que de cinq degres. On pivote donc autour du douzieme bloc sous le
       sommet — le bras de levier reste constant, l'inclinaison se lit, et
       la pile ne part jamais au loin. */
    var pied=s.pile.length?s.pile[Math.max(0,s.pile.length-12)]:null;
    if(pied){
      G.save();
      G.translate(pied.x,pied.y+PQ_CH-cam);
      G.rotate(s.penche*0.20);
      G.translate(-pied.x,-(pied.y+PQ_CH-cam));
      for(i=0;i<s.pile.length;i++){
        var b=s.pile[i], by2=b.y-cam;
        if(by2>H+30||by2<-30)continue;
        this.conteneur(b.x,by2,b.w,b.h,b.c,0);
      }
      G.restore();
    }

    /* ---- LE CONTENEUR EN CHUTE ---- */
    if(s.chute)this.conteneur(s.chute.x,s.chute.y-cam,PQ_CW,PQ_CH,
                              (this.sommet(s).c+1)%8,s.chute.rot);

    /* ---- LES DEBRIS ---- */
    for(i=0;i<s.debris.length;i++){
      var dd=s.debris[i];
      this.conteneur(dd.x,dd.y-cam,dd.w,dd.h,dd.c,dd.rot);
    }

    /* ---- LES PARTICULES ---- */
    for(i=0;i<s.part.length;i++){
      var pp=s.part[i];
      R(pp.x,pp.y-cam,pp.r,pp.r,pp.c);
    }

    /* ---- LE MISTRAL ----
       Des traits horizontaux qui filent : on doit VOIR le vent, sinon
       une chute qui derive passe pour un bogue. */
    if(s.ev&&s.ev.cle==='mistral'){
      var sens=s.vent>=0?1:-1;
      for(i=0;i<16;i++){
        var wy=((s.t*0.22+i*63)%(H+40))-20;
        var wx=((s.t*(0.30+ (i%3)*0.08)*sens+i*97)%(L+80))-40;
        R(wx,wy,12+((i*5)%10),1,'rgba(180,214,255,.30)');
      }
      G.fillStyle='rgba(180,214,255,.75)';
      G.font='bold 7px ui-monospace,monospace';G.textAlign='center';
      G.fillText(sens>0?'VENT →':'← VENT',L/2,H-60);
    }
    G.restore();

    /* =================== LE CHROME ===================
       Tout ce qui informe tient en haut et en bas, jamais au milieu : le
       milieu, c'est la ou on regarde tomber le conteneur. */

    /* ---- LE NIVEAU A BULLE : le penchant ----
       Une jauge qui part du centre vers les deux cotes. Elle rougit avant
       la faute, donc elle previent au lieu de constater. */
    var pw=Math.round(L*0.56), px0=Math.round((L-pw)/2);
    R(px0,5,pw,7,'rgba(0,0,0,.55)');
    R(px0+pw/2,5,1,7,'rgba(255,255,255,.35)');
    var pf=Math.max(-1,Math.min(1,s.penche));
    var dang=Math.abs(pf);
    var pc=dang>0.78?'#ff4a4a':dang>0.5?'#ff9a3a':'#5ad8ff';
    var bw=Math.max(2,Math.abs(pf)*pw/2);
    R(pf>=0?px0+pw/2:px0+pw/2-bw,6,bw,5,pc);
    if(dang>0.78&&Math.floor(s.t/160)%2===0){
      G.fillStyle='#ff4a4a';G.font='bold 7px ui-monospace,monospace';
      G.textAlign='center';G.fillText('ÇA PENCHE',L/2,22);
    }

    /* ---- LES RATAGES, en gouttes ---- */
    for(i=0;i<PQ_RATES;i++)
      R(6+i*7,6,5,5,i<PQ_RATES-s.rates?'#5ad8ff':'rgba(255,255,255,.18)');

    /* ---- LE SCORE ET LA HAUTEUR ---- */
    G.font='bold 9px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#ffe24a';G.fillText(s.score.toLocaleString('fr-FR'),L-5,13);
    G.font='7px ui-monospace,monospace';G.fillStyle='#9fb4c8';
    G.fillText(s.poses+' POSÉS',L-5,22);
    G.textAlign='left';
    G.fillStyle='#9fb4c8';G.fillText('H '+s.pile.length,6,22);

    /* ---- LE COMBO ---- */
    if(s.combo>1){
      G.textAlign='center';G.font='bold 8px ui-monospace,monospace';
      G.fillStyle='#ffe24a';G.fillText('SÉRIE ×'+s.combo,L/2,34);
    }

    /* ---- LE MOT ---- */
    /* LE MOT TIENT DANS L'ECRAN, QUOI QU'IL DISE. « CORNE DE BRUME » en
       gras de douze debordait des deux cotes sur un telephone etroit : on
       lisait « ORNE DE BRUM ». On mesure donc le texte et on descend la
       police jusqu'a ce qu'il rentre, avec une marge de huit pixels. */
    if(s.motT>0&&s.mot){
      var a=Math.min(1,s.motT/400);
      var tp=s.motGros?12:9;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>5&&G.measureText(s.mot).width>L-16){
        tp--;G.font='bold '+tp+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=H*0.30;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.55*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp,tw+10,tp+6);
      G.fillStyle=(s.motGros?'rgba(255,226,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }

    /* ---- L'ECLAIR DU CARREAU ---- */
    if(s.flash>0){
      G.fillStyle='rgba(255,226,74,'+(s.flash/180*0.14).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT LA PARTIE ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.72)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText('LE PORTIQUE',L/2,H*0.36);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('TAPE N’IMPORTE OÙ POUR LÂCHER',L/2,H*0.36+18);
      G.fillStyle='#9fb4c8';
      G.fillText('PILE DANS L’AXE = CARREAU',L/2,H*0.36+32);
      G.fillText('LE CARREAU REDRESSE LA PILE',L/2,H*0.36+44);
      G.fillStyle='#ff9a5a';
      G.fillText('TROIS À L’EAU ET C’EST FINI',L/2,H*0.36+62);
    }

    /* ---- APRES ---- */
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.76)';G.fillRect(0,H*0.26,L,74);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.poses+' CONTENEURS · '+s.carreaux+' CARREAUX',L/2,H*0.26+40);
      G.fillStyle='#9fb4c8';
      G.fillText('ENCORE UN JETON ?',L/2,H*0.26+58);
    }

    /* ---- LA PAUSE ---- */
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
    gr.addColorStop(0,'#0b1220');gr.addColorStop(1,'#1d3350');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
                                                     Math.max(1,Math.round(ww)),
                                                     Math.max(1,Math.round(hh)));}
    for(var i=0;i<26;i++)r(((i*37)%w),((i*23)%(h*0.5)),1,1,'#8aa0bd');
    r(0,h-7,w,7,'#2e3340');r(0,h-8,w,1,'#555c6b');
    /* le portique */
    r(w*0.10,h*0.16,5,h*0.72,'#8e2c24');r(w*0.84,h*0.16,5,h*0.72,'#8e2c24');
    r(w*0.06,h*0.12,w*0.84,6,'#a8352b');r(w*0.06,h*0.12,w*0.84,2,'#d4564a');
    r(w*0.46,h*0.20,14,5,'#d8b43a');
    g.strokeStyle='#9aa4b4';g.lineWidth=1;
    g.beginPath();g.moveTo(w*0.50,h*0.26);g.lineTo(w*0.58,h*0.46);g.stroke();
    /* le conteneur pendu, puis la pile */
    var CS=[1,3,0,2,5];
    for(var k=0;k<CS.length;k++){
      var C=PQ_COUL[CS[k]], bw=w*0.30, bh=Math.max(4,h*0.115);
      var bx=w*0.42-bw/2+(k%2?2.5:-2.5), by=h-8-(k+1)*bh;
      r(bx,by,bw,bh,C.c);r(bx,by,bw,1,C.h);r(bx,by+bh-1,bw,1,C.b);
      for(var n=1;n<bw/5;n++)r(bx+n*5,by+1,1,bh-2,C.b);
    }
    var C2=PQ_COUL[4], w2=w*0.30, h2=Math.max(4,h*0.115);
    r(w*0.58-w2/2,h*0.46,w2,h2,C2.c);r(w*0.58-w2/2,h*0.46,w2,1,C2.h);
    for(var m=1;m<w2/5;m++)r(w*0.58-w2/2+m*5,h*0.46+1,1,h2-2,C2.b);
    if(grand){
      g.fillStyle='#ffe24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LE PORTIQUE',w-6,14);
    }
  }
};
