/* =====================================================================
   LA CRIEE — borne d'arcade du Battledock
   =====================================================================
   LE GESTE. Les caisses descendent le tapis. On tape a GAUCHE ou a
   DROITE pour envoyer celle de tete dans le bac correspondant — ou on
   balaie, c'est pareil. Un pouce, deux directions, rien d'autre.

   POURQUOI LE TAP ET PAS LE BALAYAGE SEUL. Un balayage demande de poser,
   tirer, lever : trois temps. A deux caisses par seconde, les trois temps
   ne rentrent plus. Le tap sur un cote part au contact. Les deux entrees
   sont branchees parce qu'elles ne se genent pas : le shell n'appelle
   tape() que si le doigt n'a pas bouge.

   CE QUI EMPECHE QUE CE SOIT UN JEU DE REFLEXE PUR. Trois choses, et
   elles vont toutes dans le meme sens — il faut REGARDER la caisse :

     1. LES BACS CHANGENT. Toutes les quinze caisses, la criee appelle un
        nouveau lot et les deux especes demandees changent. Une memoire
        musculaire acquise au debut devient fausse au milieu.
     2. LE LOT MELANGE. Une caisse sur six contient deux especes : elle ne
        va dans aucun bac, il faut la LAISSER PASSER jusqu'au rebut. Ne
        rien faire devient un coup a jouer, et c'est le plus dur a tenir
        quand la cadence monte.
     3. LA FRAICHEUR. Une caisse triee en haut du tapis vaut le double
        d'une caisse triee au dernier moment. Attendre est sur, mais
        attendre ne paie pas.

   TROIS ERREURS ET C'EST FINI. Une caisse dans le mauvais bac, un lot
   melange qu'on a trie, une caisse qui part au rebut alors qu'elle etait
   bonne : c'est la meme faute, et elle coute la serie.
   ===================================================================== */

var CR_TAPX=28, CR_TAPW=74;      /* le tapis : ou il commence, sa largeur */
var CR_HAUT=24;                  /* le haut du tapis */
var CR_MARGE=35;                 /* ce qu'on garde sous le tapis pour le rebut */
/* LA HAUTEUR DU TAPIS SE CALCULE, ELLE NE SE DECRETE PAS. Le shell cache
   son chrome pendant la partie : la scene passe de 223 a 281 pixels de
   haut selon la phase et selon le telephone. La premiere version posait
   le bas du tapis a 246 en dur — sur l'ecran d'accueil, il tombait
   trente pixels SOUS le cadre, et les bacs etaient ecrases. */
function CR_BAS(s){ return s.H-CR_MARGE; }
var CR_CW=54, CR_CH=20;          /* la caisse */
var CR_BACW=26;                  /* la largeur d'un bac */
var CR_ERRS=3;                   /* les erreurs tolerees */
var CR_VENTE=15;                 /* les caisses entre deux changements de lot */

/* LES SIX ESPECES. Pas une de plus : a seize pixels de large, deux
   poissons de la meme couleur sont le meme poisson, et le joueur accuse
   le jeu au lieu de s'accuser lui-meme. Chaque espece a SA couleur et SA
   silhouette — on doit pouvoir la nommer d'un coup d'oeil, de loin. */
/* SIX TEINTES QUI NE SE RESSEMBLENT PAS DEUX A DEUX. Le premier tirage
   donnait une sardine gris-bleu pale, une dorade kaki pale et une seiche
   creme : trois pales. A la capture, les caisses de rebut contenaient des
   poissons qu'on prenait pour ceux du bac — la faute paraissait injuste
   alors qu'elle venait du nuancier. Bleu, orange, or, violet, blanc,
   vert sombre : six familles, aucune hesitation possible de loin. */
var CR_ESP=[
  {n:'SARDINE', c:'#6aa8e0', d:'#2f6294', f:'#a8d4f4', forme:'fil'},
  {n:'ROUGET',  c:'#e07a5a', d:'#a04a30', f:'#ffb098', forme:'fil'},
  {n:'DORADE',  c:'#dcb63a', d:'#8e6c16', f:'#f6e08a', forme:'rond'},
  {n:'POULPE',  c:'#a85ab0', d:'#6a3268', f:'#d094d8', forme:'poulpe'},
  {n:'SEICHE',  c:'#f0ead8', d:'#a89a80', f:'#ffffff', forme:'seiche'},
  {n:'CONGRE',  c:'#3f6a4e', d:'#1e4028', f:'#68a07c', forme:'long'}
];

MOTEUR.criee={
  nom:'La Criée', sous:'À GAUCHE OU À DROITE · LAISSE FILER LE REBUT',
  vise:150, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:130, H:281,
            caisses:[], vit:0.022, ecart:1500, depuis:0,
            bacs:[0,1], pris:[[],[]], rebut:[],
            triees:0, erreurs:0, serie:0, melSorti:0, parfaits:0,
            vente:CR_VENTE, lot:1, neon:0,
            mot:'', motT:0, motGros:false, glis:null,
            part:[], fini:0, enPause:false, recH:0, flash:0, flashC:'#ffe24a'};
  },

  cadre:function(s,L,H){ s.L=L;s.H=H; },

  demarrer:function(s){
    s.phase='jeu';s.t=0;s.score=0;s.caisses=[];s.part=[];
    s.vit=0.022;s.ecart=1500;s.depuis=900;
    s.pris=[[],[]];s.rebut=[];
    s.triees=0;s.erreurs=0;s.serie=0;s.melSorti=0;s.parfaits=0;
    s.vente=CR_VENTE;s.lot=1;s.fini=0;s.enPause=false;s.flash=0;s.glis=null;
    this.tirerBacs(s);
    this.dire(s,'LE LOT '+s.lot,false);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1500:1000;s.motGros=!!gros;},

  /* LES DEUX ESPECES DEMANDEES. On en tire deux differentes, et on evite
     de reconduire les deux memes : un « changement » qui ne change rien
     casse la confiance qu'on a dans l'annonce. */
  tirerBacs:function(s){
    var a=Math.floor(Math.random()*CR_ESP.length), b;
    do{ b=Math.floor(Math.random()*CR_ESP.length); }while(b===a);
    if(s.bacs&&((a===s.bacs[0]&&b===s.bacs[1])||(a===s.bacs[1]&&b===s.bacs[0]))){
      b=(b+1+Math.floor(Math.random()*(CR_ESP.length-2)))%CR_ESP.length;
      if(b===a)b=(b+1)%CR_ESP.length;
    }
    s.bacs=[a,b];
  },

  /* UNE CAISSE NE CONTIENT QU'UNE ESPECE, et la regle tient en une ligne :
     si elle est demandee par un bac, elle y va ; sinon elle part au
     rebut.

     POURQUOI ON A SUPPRIME LA CAISSE « MELANGEE ». La premiere version
     marquait certaines caisses d'une pastille MIX a la fabrication. Un
     robot qui jouait parfaitement perdait quand meme : les bacs changent
     a chaque vente, et les caisses DEJA sur le tapis devenaient
     invendables sans qu'aucun dessin ne le dise. Le joueur les envoyait
     dans un bac et se prenait une faute qui n'etait pas la sienne.

     En faisant dependre le verdict de la seule espece, le probleme
     disparait de lui-meme : au changement de lot, les caisses du tapis
     prennent le bandeau REBUT sous les yeux du joueur. La regle n'a pas
     d'exception, et l'affichage ne peut pas mentir.

     On force deux caisses sur trois sur les especes demandees : en
     tirant a parts egales dans les six, on passait son temps a ne rien
     faire. */
  nouvelle:function(s){
    var e;
    if(Math.random()<Math.max(0.70,0.88-s.triees*0.004)){
      e=s.bacs[Math.random()<0.5?0:1];
    }else{
      do{ e=Math.floor(Math.random()*CR_ESP.length); }
      while(e===s.bacs[0]||e===s.bacs[1]);
    }
    return {y:CR_HAUT-CR_CH, e:e, vol:null, ne:s.t, dx:0};
  },
  /* LA CAISSE EST-ELLE DEMANDEE ? -1 si elle doit filer au rebut. */
  bacDe:function(s,c){ return s.bacs[0]===c.e?0:(s.bacs[1]===c.e?1:-1); },

  /* LA CAISSE DE TETE : la plus basse qui n'est pas deja partie. C'est la
     seule qu'on commande — sans quoi un tap ambigu trierait la mauvaise. */
  tete:function(s){
    var t=null;
    for(var i=0;i<s.caisses.length;i++){
      var c=s.caisses[i];
      if(c.vol)continue;
      if(!t||c.y>t.y)t=c;
    }
    return t;
  },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    var i,c;
    for(i=s.part.length-1;i>=0;i--){
      var p=s.part[i];p.vie-=dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=0.00035*dt;
      if(p.vie<=0)s.part.splice(i,1);
    }
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      /* les caisses en vol finissent leur course meme apres la fin */
      for(i=s.caisses.length-1;i>=0;i--){
        c=s.caisses[i];
        if(!c.vol)continue;
        c.dx+=c.vol.vx*dt;c.y+=c.vol.vy*dt;c.vol.vy+=0.00040*dt;
        if(c.y>s.H+40||c.dx<-90||c.dx>90)s.caisses.splice(i,1);
      }
      return;
    }

    /* ---- LA CADENCE ----
       Elle monte sur deux leviers a la fois : le tapis va plus vite ET
       les caisses se suivent de plus pres. Un seul des deux donnait soit
       un tapis trop rapide pour etre lu, soit un embouteillage. */
    s.vit=Math.min(0.062,0.022+s.triees*0.00085);
    s.ecart=Math.max(620,1500-s.triees*26);

    s.depuis+=dt;
    if(s.depuis>=s.ecart){ s.depuis=0; s.caisses.push(this.nouvelle(s)); }

    for(i=s.caisses.length-1;i>=0;i--){
      c=s.caisses[i];
      if(c.vol){
        c.dx+=c.vol.vx*dt;c.y+=c.vol.vy*dt;c.vol.vy+=0.00040*dt;
        if(c.y>s.H+40||c.dx<-90||c.dx>90)s.caisses.splice(i,1);
        continue;
      }
      c.y+=s.vit*dt;
      /* ---- LA CAISSE QUI ARRIVE AU REBUT ---- */
      if(c.y>CR_BAS(s)){
        s.caisses.splice(i,1);
        if(this.bacDe(s,c)<0){
          /* personne n'en voulait : la laisser filer etait le bon coup */
          s.melSorti++;s.serie++;s.triees++;
          s.score+=60+25*Math.min(5,s.serie);
          this.dire(s,'AU REBUT · BIEN VU',false);
          s.flash=160;s.flashC='#5ad8ff';
          this.etincelles(s,s.L/2,CR_BAS(s),'#5ad8ff',10);
        }else{
          this.faute(s,'TU L’AS LAISSÉE FILER');
        }
        this.vendre(s);
        if(s.phase!=='jeu')return;
      }
    }
  },

  /* ---- LE TRI ----
     quoi : 0 pour le bac de gauche, 1 pour celui de droite */
  trier:function(s,quoi){
    var c=this.tete(s);
    if(!c)return;
    var bon=(s.bacs[quoi]===c.e);
    /* LA FRAICHEUR. La caisse triee en haut du tapis vaut le double de la
       meme caisse triee au dernier moment. C'est ce qui empeche le jeu de
       se gagner en attendant le bas du tapis a chaque fois. */
    var f=Math.max(0,Math.min(1,1-(c.y-CR_HAUT)/(CR_BAS(s)-CR_HAUT)));
    c.vol={vx:(quoi?1:-1)*0.075,vy:-0.020};
    if(bon){
      s.serie++;s.triees++;
      if(f>0.62)s.parfaits++;
      var pts=50+Math.round(f*50)+25*Math.min(5,s.serie);
      s.score+=pts;
      s.pris[quoi].push(c.e);
      if(s.pris[quoi].length>5)s.pris[quoi].shift();
      if(f>0.62)this.dire(s,s.serie>2?('BELLE SÉRIE ×'+s.serie):'FRAIS',false);
      else if(s.serie>2)this.dire(s,'SÉRIE ×'+s.serie,false);
      s.flash=120;s.flashC='#7fe0bc';
      this.etincelles(s,quoi?s.L-CR_BACW/2:CR_BACW/2,c.y,'#7fe0bc',8);
    }else{
      this.faute(s, this.bacDe(s,c)<0?'PERSONNE N’EN VEUT':'PAS LE BON BAC');
    }
    this.vendre(s);
  },

  faute:function(s,mot){
    s.erreurs++;s.serie=0;
    s.flash=240;s.flashC='#ff4a4a';
    this.dire(s,mot+' · '+(CR_ERRS-s.erreurs)+' RESTANTE'+
                (CR_ERRS-s.erreurs>1?'S':''),true);
    this.etincelles(s,s.L/2,CR_BAS(s)-20,'#ff4a4a',14);
    if(s.erreurs>=CR_ERRS){
      this.dire(s,'TROIS FAUTES',true);
      s.phase='rate';s.fini=1400;
    }
  },

  /* LA VENTE. Toutes les quinze caisses, la criee annonce un nouveau lot
     et les deux bacs changent d'espece. C'est le seul mecanisme qui
     empeche la borne de devenir un reflexe appris. */
  vendre:function(s){
    s.vente--;
    if(s.vente>0)return;
    s.vente=CR_VENTE;s.lot++;
    this.tirerBacs(s);
    this.dire(s,'VENDU ! LE LOT '+s.lot,true);
    s.neon=600;
    s.flash=200;s.flashC='#ffe24a';
  },

  fin:function(s){
    s.phase='fini';
    if(s.score>s.recH)s.recH=s.score;
    if(typeof monterActions==='function')monterActions();
    if(typeof finirPartie==='function')finirPartie(s.score);
  },

  etincelles:function(s,x,y,c,n){
    for(var e=0;e<(n||10);e++){var a=e/(n||10)*6.283;
      s.part.push({x:x,y:y,vx:Math.cos(a)*0.05,vy:Math.sin(a)*0.05-0.02,
                   vie:420,c:c});}
  },

  /* ================= LE DOIGT =================
     DEUX ENTREES POUR UN SEUL GESTE. tape() tranche par le cote de
     l'ecran ou le pouce est tombe ; relache() tranche par le sens du
     balayage. Le shell n'appelle tape() que si le doigt n'a pas bouge,
     donc les deux ne peuvent pas se declencher ensemble. */
  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='jeu')return;
    this.trier(s, x<s.L/2?0:1);
  },
  glisse:function(s,x,y,dx,dy){ s.glis={x:x,y:y}; },
  relache:function(s,x,y){
    if(s.phase!=='jeu'){s.glis=null;return;}
    s.glis=null;
    this.trier(s, x<s.L/2?0:1);
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
  /* UN POISSON, EN DOUZE PIXELS. La silhouette compte plus que la
     couleur : sur un ecran de telephone au soleil, deux teintes proches
     se confondent, deux formes non. */
  poisson:function(x,y,ei,g){
    var E=CR_ESP[ei];
    if(E.forme==='fil'){              /* la sardine, le rouget : un fuseau */
      R(x,y+1,11,3,E.c);R(x,y+1,11,1,E.f);R(x+1,y+4,9,1,E.d);
      R(x+11,y,2,2,E.c);R(x+11,y+3,2,2,E.c);   /* la queue fourchue */
      R(x+1,y+2,1,1,'#14161c');                /* l'oeil */
    }else if(E.forme==='rond'){       /* la dorade : haute et courte */
      R(x+1,y,8,6,E.c);R(x+1,y,8,1,E.f);R(x+1,y+5,8,1,E.d);
      R(x,y+2,1,2,E.c);
      R(x+9,y+1,3,4,E.c);R(x+11,y,2,6,E.c);
      R(x+2,y+2,1,1,'#14161c');
      R(x+2,y+1,6,1,E.f);                      /* la bande doree du front */
    }else if(E.forme==='poulpe'){     /* le poulpe : une tete et des bras */
      R(x+2,y,7,4,E.c);R(x+2,y,7,1,E.f);
      R(x+3,y+2,1,1,'#14161c');R(x+6,y+2,1,1,'#14161c');
      for(var k=0;k<4;k++)R(x+1+k*2,y+4,1,2+((k*3)%2),E.d);
      R(x+1,y+5,8,1,E.d);
    }else if(E.forme==='seiche'){     /* la seiche : un manteau en ogive */
      R(x+2,y,8,5,E.c);R(x+2,y,8,1,E.f);R(x+1,y+1,1,3,E.c);R(x+10,y+1,1,3,E.c);
      R(x+3,y+5,6,1,E.d);
      R(x+3,y+5,1,2,E.d);R(x+8,y+5,1,2,E.d);
      R(x+4,y+2,1,1,'#14161c');
    }else{                            /* le congre : long et sombre */
      R(x,y+2,13,3,E.c);R(x,y+2,13,1,E.f);R(x,y+5,12,1,E.d);
      R(x+13,y+1,1,5,E.c);
      R(x+1,y+3,1,1,'#ffe24a');
    }
  },

  /* UNE CAISSE. Le bois, la glace, et deux ou trois poissons dedans. */
  caisse:function(s,c,x,y,tete){
    var bois='#6a5a3a', clair='#9a8a5a';
    R(x,y,CR_CW,CR_CH,bois);
    R(x,y,CR_CW,1,clair);R(x,y+CR_CH-1,CR_CW,1,'#3e3422');
    R(x,y,1,CR_CH,clair);R(x+CR_CW-1,y,1,CR_CH,'#3e3422');
    for(var i=4;i<CR_CW-2;i+=5)R(x+i,y+2,1,CR_CH-4,'rgba(0,0,0,.22)');
    /* la glace pilee, au fond */
    R(x+2,y+CR_CH-5,CR_CW-4,3,'#cfe4f2');
    for(i=0;i<CR_CW-6;i+=4)R(x+3+i,y+CR_CH-6,2,1,'#f2f8ff');
    /* LE CONTENU. Un melange montre DEUX especes cote a cote : c'est le
       seul signe, et il doit se voir sans hesitation — sinon la regle du
       « laisse passer » devient une loterie. */
    this.poisson(x+4,y+5,c.e,1);
    this.poisson(x+20,y+4,c.e,1);
    this.poisson(x+36,y+6,c.e,1);
    /* LE BANDEAU « REBUT ». Il est calcule a CHAQUE IMAGE a partir des
       bacs du moment, jamais fige a la fabrication : au changement de
       lot, les caisses deja sur le tapis se marquent sous les yeux du
       joueur. C'est la seule facon que la regle n'ait pas d'exception. */
    if(this.bacDe(s,c)<0){
      R(x+1,y+1,CR_CW-2,7,'rgba(194,58,44,.86)');
      R(x+1,y+1,CR_CW-2,1,'#e8604e');
      G.fillStyle='#ffe4d8';G.font='bold 5px ui-monospace,monospace';
      G.textAlign='center';G.fillText('REBUT',x+CR_CW/2,y+7);
      for(var q=0;q<CR_CW-2;q+=6)R(x+1+q,y+CR_CH-2,3,1,'#e8604e');
    }
    /* LA CAISSE DE TETE EST CERCLEE. Sans ce cadre, un joueur qui tape
       croit trier celle qu'il regarde et en trie une autre : la faute
       parait injuste alors qu'elle est a lui. */
    if(tete){
      var a=0.55+0.35*Math.sin(s.t*0.008);
      R(x-2,y-2,CR_CW+4,1,'rgba(255,226,74,'+a.toFixed(2)+')');
      R(x-2,y+CR_CH+1,CR_CW+4,1,'rgba(255,226,74,'+a.toFixed(2)+')');
      R(x-2,y-2,1,CR_CH+4,'rgba(255,226,74,'+a.toFixed(2)+')');
      R(x+CR_CW+1,y-2,1,CR_CH+4,'rgba(255,226,74,'+a.toFixed(2)+')');
    }
  },

  dessine:function(s,L,H){
    var i,j;
    /* ---- LA HALLE ---- */
    var gr=G.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,'#141019');gr.addColorStop(1,'#241a2a');
    G.fillStyle=gr;G.fillRect(0,0,L,H);
    /* la charpente */
    for(i=0;i<5;i++){R(5+i*30,18,3,H-18,'#1d2430');R(5+i*30,18,1,H-18,'#2e3a4c');}
    R(0,16,L,4,'#2a3240');R(0,20,L,1,'#3c4758');
    /* LES NEONS. Ils blanchissent une demi-seconde quand la criee vend :
       un changement de lot qui n'eclaire rien passe inapercu, et le
       joueur trie quinze caisses avec les mauvaises especes en tete. */
    if(s.neon>0)s.neon-=16;
    var nb=s.neon>0?'#ffffff':'#f4f0d8';
    for(i=0;i<4;i++){R(12+i*32,22,22,2,nb);R(12+i*32,24,22,1,'rgba(244,240,216,.25)');}
    if(s.neon>0)G.fillStyle='rgba(255,255,255,'+(s.neon/600*0.10).toFixed(3)+')',
                G.fillRect(0,0,L,H);
    /* le sol mouille */
    var BAS=CR_BAS(s);
    R(0,BAS+6,L,H-BAS-6,'#1a222e');
    for(i=0;i<L;i+=7)R(i,BAS+9+((i*5)%5),5,1,'rgba(140,200,230,.12)');

    /* ---- LE TAPIS ----
       Les lattes defilent a la vitesse du tapis : c'est le seul endroit
       ou la cadence se VOIT avant qu'on la subisse. */
    R(CR_TAPX,CR_HAUT-4,CR_TAPW,BAS-CR_HAUT+10,'#2b323e');
    R(CR_TAPX,CR_HAUT-4,CR_TAPW,1,'#454f60');
    R(CR_TAPX,CR_HAUT-4,2,BAS-CR_HAUT+10,'#3a4253');
    R(CR_TAPX+CR_TAPW-2,CR_HAUT-4,2,BAS-CR_HAUT+10,'#1d2129');
    var dec=(s.t*s.vit)%9;
    for(i=-9;i<BAS-CR_HAUT+10;i+=9){
      var ly=CR_HAUT-4+i+dec;
      if(ly<CR_HAUT-4||ly>BAS+5)continue;
      R(CR_TAPX+2,ly,CR_TAPW-4,2,'#232935');
      R(CR_TAPX+2,ly+2,CR_TAPW-4,1,'#343c4b');
    }

    /* ---- LES DEUX BACS ----
       Ils descendent jusqu'au bas de l'ecran : un bac qui s'arrete au
       milieu laisse cent pixels de sol vide et l'ecran parait inacheve.
       Et ce qu'on y a deja jete s'y empile — le score se voit. */
    var BC=[{f:'#1f4a3e',h:'#2f7a62',t:'#7fe0bc'},{f:'#4a2a2a',h:'#8a4040',t:'#f0a090'}];
    for(j=0;j<2;j++){
      var bx=j?L-CR_BACW:0, B=BC[j], E=CR_ESP[s.bacs[j]], by=Math.round(H*0.46);
      R(bx,by,CR_BACW,H-by,B.f);
      R(bx,by,CR_BACW,2,B.h);
      R(j?bx+CR_BACW-1:bx,by,1,H-by,B.h);
      /* le nom de l'espece demandee, reduit s'il deborde */
      var tp=5;G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>3&&G.measureText(E.n).width>CR_BACW-4){tp--;G.font='bold '+tp+'px ui-monospace,monospace';}
      G.fillStyle=B.t;G.textAlign='center';G.fillText(E.n,bx+CR_BACW/2,by+12);
      /* un exemplaire dessine : le nom ne suffit pas quand ca va vite */
      this.poisson(bx+CR_BACW/2-6,by+18,s.bacs[j],0);
      G.fillStyle=B.t;G.font='bold 13px ui-monospace,monospace';
      G.fillText(j?'→':'←',bx+CR_BACW/2,by+42);
      /* ce qui est deja dedans */
      for(i=0;i<s.pris[j].length;i++){
        var py=H-14-i*13;
        if(py<by+56)break;
        R(bx+2,py,CR_BACW-4,11,'#5a4e32');
        R(bx+2,py,CR_BACW-4,1,'#8a7a4e');
        this.poisson(bx+5,py+3,s.pris[j][i],0);
      }
    }

    /* ---- LE REBUT, SOUS LE TAPIS ---- */
    R(CR_TAPX+6,BAS+6,CR_TAPW-12,10,'#1b1f28');
    R(CR_TAPX+6,BAS+6,CR_TAPW-12,1,'#333b48');
    G.fillStyle='#5a6472';G.font='5px ui-monospace,monospace';G.textAlign='center';
    G.fillText('REBUT',L/2,BAS+13);

    /* ---- LES CAISSES ---- */
    var tete=this.tete(s);
    for(i=0;i<s.caisses.length;i++){
      var c=s.caisses[i];
      var cy=c.y;
      if(cy<-CR_CH-4||cy>H+4)continue;
      this.caisse(s,c,CR_TAPX+(CR_TAPW-CR_CW)/2+c.dx,cy,c===tete&&!c.vol);
    }

    /* ---- LES PARTICULES ---- */
    for(i=0;i<s.part.length;i++)R(s.part[i].x,s.part[i].y,1,1,s.part[i].c);

    /* =================== LE CHROME =================== */
    R(0,0,L,16,'rgba(6,9,14,.70)');
    /* les fautes, en gouttes */
    for(i=0;i<CR_ERRS;i++)
      R(5+i*7,6,5,5,i<CR_ERRS-s.erreurs?'#5ad8ff':'rgba(255,255,255,.18)');
    G.font='bold 9px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#ffe24a';G.fillText(s.score.toLocaleString('fr-FR'),L-5,12);
    G.textAlign='center';G.font='7px ui-monospace,monospace';
    G.fillStyle=s.serie>2?'#7fe0bc':'#9fb4c8';
    G.fillText(s.serie>1?('SÉRIE ×'+s.serie):('LOT '+s.lot),L/2,11);
    /* LA JAUGE DE LA VENTE : combien de caisses avant que les bacs
       changent. Un changement qui tombe sans prevenir se vit comme un
       piege ; annonce, il se prepare. */
    var jw=L-12, jf=1-s.vente/CR_VENTE;
    R(6,17,jw,2,'rgba(255,255,255,.12)');
    R(6,17,Math.max(1,jw*jf),2,s.vente<=3?'#ffe24a':'rgba(255,226,74,.40)');

    /* ---- LE MOT ---- */
    if(s.motT>0&&s.mot){
      var a=Math.min(1,s.motT/400);
      var tp2=s.motGros?12:9;
      G.font='bold '+tp2+'px ui-monospace,monospace';
      while(tp2>5&&G.measureText(s.mot).width>L-16){
        tp2--;G.font='bold '+tp2+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=H*0.40;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.62*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp2,tw+10,tp2+6);
      G.fillStyle=(s.motGros?'rgba(255,226,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }

    if(s.flash>0){
      var fc=s.flashC;
      G.fillStyle=(fc==='#ff4a4a'?'rgba(255,74,74,':fc==='#7fe0bc'?'rgba(127,224,188,':
                   fc==='#5ad8ff'?'rgba(90,216,255,':'rgba(255,226,74,')+
                  (s.flash/240*0.16).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT LA PARTIE ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.76)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText('LA CRIÉE',L/2,H*0.30);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('TAPE À GAUCHE OU À DROITE',L/2,H*0.30+18);
      G.fillStyle='#9fb4c8';
      G.fillText('CHAQUE BAC VEUT UNE ESPÈCE',L/2,H*0.30+34);
      G.fillText('SI PERSONNE N’EN VEUT, ELLE EST',L/2,H*0.30+46);
      G.fillText('MARQUÉE REBUT : LAISSE-LA FILER',L/2,H*0.30+58);
      G.fillStyle='#7fe0bc';
      G.fillText('TRIER TÔT RAPPORTE LE DOUBLE',L/2,H*0.30+74);
      G.fillStyle='#ff9a5a';
      G.fillText('LES BACS CHANGENT À CHAQUE VENTE',L/2,H*0.30+90);
      G.fillStyle='#ff9a5a';
      G.fillText('TROIS FAUTES ET C’EST FINI',L/2,H*0.30+104);
    }

    /* ---- APRES ---- */
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.78)';G.fillRect(0,H*0.26,L,78);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.triees+' CAISSES · '+s.parfaits+' AU FRAIS',L/2,H*0.26+40);
      G.fillStyle='#9fb4c8';
      G.fillText(s.melSorti+' AU REBUT',L/2,H*0.26+56);
      G.fillText('LOT '+s.lot,L/2,H*0.26+70);
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
    gr.addColorStop(0,'#141019');gr.addColorStop(1,'#241a2a');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
      Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));}
    /* les neons de la halle */
    for(var i=0;i<4;i++){r(6+i*w*0.26,4,w*0.16,2,'#f4f0d8');
                         r(6+i*w*0.26,6,w*0.16,1,'rgba(244,240,216,.2)');}
    /* le tapis, en biais vers le bas */
    r(w*0.30,10,w*0.40,h-10,'#2b323e');
    r(w*0.30,10,w*0.40,1,'#454f60');
    for(i=0;i<h;i+=7)r(w*0.31,12+i,w*0.38,2,'#232935');
    /* les deux bacs */
    r(0,h*0.40,w*0.26,h*0.60,'#1f4a3e');r(0,h*0.40,w*0.26,2,'#2f7a62');
    r(w*0.74,h*0.40,w*0.26,h*0.60,'#4a2a2a');r(w*0.74,h*0.40,w*0.26,2,'#8a4040');
    /* trois caisses sur le tapis */
    var old=G;G=g;
    for(i=0;i<3;i++){
      var cx=w*0.32, cy=14+i*(h*0.30), cw=w*0.36, chh=h*0.24;
      r(cx,cy,cw,chh,'#6a5a3a');r(cx,cy,cw,1,'#9a8a5a');
      r(cx+2,cy+chh-3,cw-4,2,'#cfe4f2');
      try{MOTEUR.criee.poisson(cx+3,cy+3,i%CR_ESP.length,0);
          MOTEUR.criee.poisson(cx+cw*0.5,cy+2,i%CR_ESP.length,0);}catch(e){}
    }
    G=old;
    if(grand){
      g.fillStyle='#ffe24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LA CRIÉE',w-6,14);
    }
  }
};
