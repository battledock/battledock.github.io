/* =====================================================================
   LA CALE — borne d'arcade du Battledock
   =====================================================================
   LE GESTE. Le conteneur descend dans la cale. On pose le pouce sur une
   colonne, il s'y place ; on leve, il tombe. Un seul doigt, et le meme
   geste sert a choisir et a lacher.

   CE N'EST PAS UN TETRIS. Les pieces ne tournent pas — un conteneur ne se
   met pas debout. Ce sont des rectangles d'un ou deux emplacements, et
   la difficulte n'est pas dans leur forme : elle est dans leur POIDS.

   LA GITE, C'EST TOUT LE JEU. Chaque conteneur pese douze, vingt-quatre
   ou trente tonnes, et le navire penche du cote ou la masse s'accumule.
   Remplir proprement une colonne du bord, c'est se condamner : on gagne
   des rangees et on perd le navire. Il faut donc arrimer EN MIROIR —
   lourd a babord, lourd a tribord — ce qui contredit en permanence
   l'envie de boucher le trou le plus commode.

   LA HOULE. Toutes les vingt-cinq secondes environ, le navire prend la
   houle : pendant quatre secondes, la gite compte un tiers de plus. Une
   cargaison qu'on tolerait au calme devient une faute. C'est ce qui
   empeche de jouer en permanence a la limite — et ca previent, parce
   qu'un jeu qui punit sans prevenir se joue une fois.

   UNE RANGEE PLEINE EST ARRIMEE : elle disparait, le reste descend, et
   la masse qui partait avec elle soulage la gite. C'est la recompense,
   et elle est double.

   DEUX FACONS DE PERDRE : la cale qui deborde par le haut, la cargaison
   qui ripe quand la gite passe l'aplomb.
   ===================================================================== */

/* HUIT COLONNES, ET PAS SIX. LA MESURE QUI A TRANCHE : avec six
   colonnes, un robot qui posait AU HASARD faisait trente-deux rangees en
   trente secondes et ne perdait jamais. Une cale etroite se remplit toute
   seule — le jeu n'avait pas de difficulte, il avait une cadence. A huit,
   le hasard laisse des trous et la cale deborde. */
var CA_COL=8;                    /* les colonnes de la cale */
var CA_CW=13, CA_CH=13;          /* un emplacement */
var CA_X=13;                     /* le bord interieur de la coque, a babord */
/* LE TEMPS DE REPRISE DU SPREADER. Sans lui, le conteneur suivant
   apparait a l'image ou le precedent se pose : le jeu tourne a la vitesse
   du pouce et plus a celle qu'on a reglee. Trois dixiemes de seconde,
   c'est le temps qu'il faut au portique pour aller chercher la boite
   suivante — et ca plafonne la cadence a trois poses par seconde. */
var CA_REPRISE=300;
var CA_HAUT=52;                  /* le pont : au-dessus, c'est la chute */
var CA_POIDS=[12,24,30];         /* les trois poids, en tonnes */

/* HUIT COULEURS, ET LE POIDS NE SE DEVINE PAS A LA COULEUR. Si le lourd
   etait toujours rouge, on trierait a la teinte sans jamais lire : la
   contrainte disparaitrait. Le poids se lit aux PASTILLES, la couleur ne
   sert qu'a distinguer les caisses les unes des autres. */
var CA_COUL=[
  {c:'#2a6a9a', h:'#4a9aca', b:'#1b4668'},
  {c:'#b8302e', h:'#d8584e', b:'#7c1f1e'},
  {c:'#1f7a68', h:'#3aa892', b:'#145045'},
  {c:'#c8a22a', h:'#f0d78a', b:'#876c18'},
  {c:'#6a3a8a', h:'#9a68b8', b:'#47265c'},
  {c:'#c86a28', h:'#e8984e', b:'#87461a'},
  {c:'#4a5a6a', h:'#72869a', b:'#313c47'},
  {c:'#8a8a2a', h:'#b4b44e', b:'#5d5d1c'}
];

MOTEUR.cale={
  nom:'La Cale', sous:'POSE LE POUCE SUR UNE COLONNE · NE FAIS PAS GÎTER',
  vise:150, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:130, H:281,
            rangs:0, lignes:0, poses:0, masse:0, moment:0,
            grille:[], NR:15,
            piece:null, suite:null, vit:0.012, descend:false, reprise:0,
            houle:0, prochaine:22000, roulis:0,
            mot:'', motT:0, motGros:false,
            part:[], fini:0, enPause:false, recH:0, flash:0, flashC:'#ffe24a',
            aplat:0, secousse:0};
  },

  /* LA CALE S'ADAPTE A LA HAUTEUR DE L'ECRAN. Le shell cache son chrome
     pendant la partie : la scene passe de 223 a 281 pixels selon la
     phase. Un nombre de rangees ecrit en dur donnait une cale qui
     depassait du cadre sur l'ecran d'accueil. */
  cadre:function(s,L,H){
    s.L=L;s.H=H;
    var nr=Math.max(8,Math.floor((H-22-CA_HAUT)/CA_CH));
    if(nr!==s.NR){
      /* on garde ce qui est deja arrime, en le posant au fond */
      var vieux=s.grille.slice();
      s.NR=nr;s.grille=[];
      for(var r=0;r<nr;r++)s.grille.push(vieux[vieux.length-nr+r]||this.rangVide());
    }
    if(!s.grille.length)for(var k=0;k<s.NR;k++)s.grille.push(this.rangVide());
  },
  rangVide:function(){var r=[];for(var i=0;i<CA_COL;i++)r.push(null);return r;},
  /* le haut de la cale a l'ecran, et le bas */
  fond:function(s){return CA_HAUT+s.NR*CA_CH;},

  demarrer:function(s){
    s.phase='jeu';s.t=0;s.score=0;s.part=[];
    s.grille=[];for(var r=0;r<s.NR;r++)s.grille.push(this.rangVide());
    s.rangs=0;s.lignes=0;s.poses=0;s.masse=0;s.moment=0;s.aplat=0;
    s.vit=0.012;s.houle=0;s.prochaine=22000;s.roulis=0;s.secousse=0;
    s.fini=0;s.enPause=false;s.flash=0;
    s.suite=this.tirer(s);s.reprise=0;s.piece=null;
    this.sortir(s);
    this.dire(s,'ARRIME',false);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1500:1000;s.motGros=!!gros;},

  /* UNE LEVEE. Un ou deux emplacements de large, UN OU DEUX ETAGES.
     POURQUOI LES DEUX ETAGES. Sans eux, toutes les pieces sont plates :
     un sol plat accepte n'importe quoi, aucun trou n'est jamais
     impossible a boucher, et un robot qui posait AU HASARD survivait
     trente secondes en faisant neuf rangees. La difficulte d'un jeu
     d'empilage vient de la forme des pieces, pas de leur largeur.

     Le tandem-lift — deux conteneurs pris ensemble par le spreader —
     existe pour de vrai sur les portiques modernes, et il introduit
     exactement l'irregularite qui manquait. Il arrive plus tard dans la
     partie : les premieres poses doivent apprendre la regle. */
  tirer:function(s){
    var l=(Math.random()<Math.min(0.46,0.22+s.poses*0.006))?2:1;
    var t=(s.poses>=8&&Math.random()<Math.min(0.40,0.14+s.poses*0.005))?2:1;
    var p=Math.floor(Math.random()*3);
    /* le lourd se rarefie au debut, et jamais sur une levee double :
       soixante tonnes au troisieme conteneur, c'est perdre avant d'avoir
       compris */
    if(s.poses<6&&p===2)p=Math.floor(Math.random()*2);
    if(t===2&&p===2&&Math.random()<0.6)p=1;
    return {l:l, t:t, p:p, c:Math.floor(Math.random()*8)};
  },
  /* le poids total d'une levee : chaque etage pese son compte */
  pesee:function(t){ return CA_POIDS[t.p]*t.t; },
  nouvelle:function(s){
    s.piece=null;s.reprise=CA_REPRISE;
  },
  sortir:function(s){
    var t=s.suite;
    s.suite=this.tirer(s);
    /* s.piece.y est toujours le haut de l'ETAGE DU BAS : c'est lui qui
       touche, et c'est donc la seule coordonnee qui ait a etre juste. */
    s.piece={l:t.l, t:t.t, p:t.p, c:t.c,
             col:Math.max(0,Math.min(CA_COL-t.l,Math.floor((CA_COL-t.l)/2))),
             y:CA_HAUT-CA_CH-2};
    s.descend=false;
    /* LA CALE DEBORDE si la levee ne rentre plus en hauteur. On le teste
       a la NAISSANCE de la piece, pas a sa pose, sinon on voit une piece
       traverser le tas avant de perdre. */
    var r=this.atterrissage(s,s.piece.col,s.piece.l);
    if(r-s.piece.t+1<0) this.perdre(s,'LA CALE EST PLEINE');
  },

  /* LA PREMIERE RANGEE LIBRE sous une piece posee sur ces colonnes.
     -1 si elle ne rentre plus. */
  atterrissage:function(s,col,l){
    var r=s.NR-1;
    for(var i=0;i<l;i++){
      var c=col+i, h=s.NR;
      for(var k=0;k<s.NR;k++)if(s.grille[k][c]){h=k;break;}
      if(h-1<r)r=h-1;
    }
    return r;
  },

  /* ================= LA GITE =================
     ELLE MESURE UN ECART RELATIF, PAS UN MOMENT BRUT. Le premier calcul
     divisait le moment par une stabilite qui grandissait avec la charge,
     mais le facteur de depart etait si petit qu'un SEUL conteneur de
     vingt-quatre tonnes pose contre le bord donnait une gite de 2,5 : le
     robot moyen coulait a sa premiere pose, avant d'avoir joue. Mesure
     faite, c'etait injouable.

     La bonne grandeur est l'ecart du centre de gravite au milieu de la
     cale, rapporte au demi-largeur — autrement dit la fraction de la
     cale dont la charge est decentree. Elle vaut 1 quand TOUTE la masse
     est contre un bord, et le facteur 2,2 fixe la tolerance : on perd
     quand le centre de gravite depasse un peu plus d'une colonne.

     LE LEST. Les deux cents tonnes ajoutees au denominateur sont le
     ballast du navire : elles rendent les premieres poses inoffensives
     et s'effacent au fur et a mesure que la cargaison pese. Un navire
     vide pardonne tout, un navire plein ne pardonne plus rien — et c'est
     exactement la courbe de difficulte qu'on veut, sans l'ecrire. */
  recalc:function(s){
    var m=0,M=0;
    for(var r=0;r<s.NR;r++)for(var c=0;c<CA_COL;c++){
      var g=s.grille[r][c];
      if(!g)continue;
      var w=CA_POIDS[g.p]/g.l;            /* un quarante pieds pese pour deux cases */
      M+=w; m+=w*(c+0.5-CA_COL/2);
    }
    s.masse=M;s.moment=m;
  },
  gite:function(s){
    var g=s.moment/((s.masse+200)*(CA_COL/2-0.5))*2.2;
    if(s.houle>0)g*=1.35;
    return Math.max(-1.6,Math.min(1.6,g));
  },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.secousse>0)s.secousse=Math.max(0,s.secousse-dt*0.004);
    var i;
    for(i=s.part.length-1;i>=0;i--){
      var p=s.part[i];p.vie-=dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=0.00035*dt;
      if(p.vie<=0)s.part.splice(i,1);
    }
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }

    /* ---- LA HOULE ----
       Elle s'annonce une seconde avant de frapper : un jeu qui punit sans
       prevenir se joue une fois. */
    s.prochaine-=dt;
    if(s.prochaine<=0&&s.houle<=0){
      s.houle=4000;s.prochaine=18000+Math.random()*12000;
      this.dire(s,'LA HOULE',true);s.secousse=1;
    }
    if(s.houle>0)s.houle-=dt;
    /* le roulis du dessin suit la gite, avec un retard : un navire qui
       se redresse instantanement n'a pas de masse */
    var gc=this.gite(s);
    s.roulis+=(gc-s.roulis)*Math.min(1,dt*0.004);
    if(Math.abs(gc)>=1){ this.perdre(s,'LA CARGAISON RIPE'); return; }

    /* ---- LA DESCENTE ----
       Elle accelere avec les poses. Le doigt reste plus rapide : la
       vitesse ne fixe pas le rythme, elle fixe le TEMPS DE REFLEXION. */
    s.vit=Math.min(0.055,0.012+s.poses*0.00055);
    if(!s.piece){
      if(s.reprise>0){s.reprise-=dt;if(s.reprise<=0)this.sortir(s);}
      return;
    }
    var P=s.piece;
    P.y+=(s.descend?0.95:s.vit)*dt;
    var r=this.atterrissage(s,P.col,P.l);
    if(r-P.t+1<0){ this.perdre(s,'LA CALE EST PLEINE'); return; }
    var yr=CA_HAUT+r*CA_CH;
    if(P.y>=yr){ P.y=yr; this.poser(s); }
  },

  /* ---- POSER ---- */
  poser:function(s){
    var P=s.piece, r=this.atterrissage(s,P.col,P.l);
    if(r-P.t+1<0){ this.perdre(s,'LA CALE EST PLEINE'); return; }
    /* LA LEVEE SE DEFAIT EN CONTENEURS INDEPENDANTS. Deux boites prises
       ensemble par le spreader redeviennent deux boites une fois
       posees — c'est la verite du metier, et c'est aussi ce qui permet a
       une rangee de partir sans couper une piece en deux. */
    for(var j=0;j<P.t;j++)
      for(var i=0;i<P.l;i++)
        s.grille[r-j][P.col+i]={c:P.c, p:P.p, l:P.l, i:i};
    s.poses++;s.score+=8;
    s.secousse=Math.min(1,s.secousse+0.30);
    this.poussiere(s,CA_X+(P.col+P.l/2)*CA_CW,CA_HAUT+r*CA_CH+CA_CH,8);
    this.recalc(s);

    /* ---- LES RANGEES PLEINES ---- */
    var faites=[];
    for(var k=0;k<s.NR;k++){
      var plein=true;
      for(var c=0;c<CA_COL;c++)if(!s.grille[k][c])plein=false;
      if(plein)faites.push(k);
    }
    if(faites.length){
      for(var f=faites.length-1;f>=0;f--){
        s.grille.splice(faites[f],1);
        s.grille.unshift(this.rangVide());
      }
      s.lignes+=faites.length;
      var pts=[0,120,320,700,1200][Math.min(4,faites.length)];
      s.score+=pts;
      this.dire(s,faites.length>1?(faites.length+' RANGÉES · +'+pts):('ARRIMÉ · +'+pts),true);
      s.flash=220;s.flashC='#5ad8ff';
      for(var e=0;e<CA_COL;e++)
        this.etincelles(s,CA_X+(e+0.5)*CA_CW,CA_HAUT+faites[0]*CA_CH,'#5ad8ff',6);
      this.recalc(s);
    }else{
      /* LA PRIME D'APLOMB. Dix poses d'affilee en gardant le navire a
         plat valent autant qu'une rangee : sans elle, equilibrer ne
         rapportait rien et ne faisait qu'eviter de perdre. */
      if(Math.abs(this.gite(s))<0.18){
        s.aplat++;
        if(s.aplat>=10){
          s.aplat=0;s.score+=200;
          this.dire(s,'À PLAT · +200',true);
          s.flash=180;s.flashC='#7fe0bc';
        }
      }else s.aplat=0;
    }
    this.nouvelle(s);
  },

  perdre:function(s,mot){
    s.piece=null;
    this.dire(s,mot,true);
    s.secousse=1;s.flash=300;s.flashC='#ff4a4a';
    /* la cargaison part du cote ou ca penchait : c'est la seule
       recompense d'une partie perdue, et elle doit se voir */
    var sens=s.moment>=0?1:-1;
    for(var r=0;r<s.NR;r++)for(var c=0;c<CA_COL;c++){
      if(!s.grille[r][c])continue;
      this.etincelles(s,CA_X+(c+0.5)*CA_CW,CA_HAUT+r*CA_CH+CA_CH/2,
                      CA_COUL[s.grille[r][c].c].h,3);
    }
    s.ripe=sens;
    s.phase='rate';s.fini=1500;
  },

  fin:function(s){
    s.phase='fini';
    if(s.score>s.recH)s.recH=s.score;
    if(typeof monterActions==='function')monterActions();
    if(typeof finirPartie==='function')finirPartie(s.score);
  },

  etincelles:function(s,x,y,c,n){
    for(var e=0;e<(n||10);e++){var a=e/(n||10)*6.283;
      s.part.push({x:x,y:y,vx:Math.cos(a)*0.05,vy:Math.sin(a)*0.05-0.02,vie:420,c:c});}
  },
  poussiere:function(s,x,y,n){
    for(var e=0;e<(n||8);e++)
      s.part.push({x:x+(Math.random()-0.5)*CA_CW,y:y,
                   vx:(Math.random()-0.5)*0.04,vy:-Math.random()*0.02,
                   vie:260+Math.random()*200,c:'#8a9aae'});
  },

  /* ================= LE DOIGT =================
     UN SEUL GESTE POUR CHOISIR ET POUR LACHER. Le pouce se pose sur une
     colonne, la piece s'y aligne ; il glisse, elle suit ; il se leve,
     elle tombe. Deux commandes separees — des fleches et un bouton —
     auraient mange le tiers de l'ecran pour faire exactement ca. */
  colonne:function(s,x){
    var c=Math.round((x-CA_X)/CA_CW-s.piece.l/2);
    return Math.max(0,Math.min(CA_COL-s.piece.l,c));
  },
  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='jeu'||!s.piece)return;
    s.piece.col=this.colonne(s,x);
    s.descend=true;
  },
  glisse:function(s,x,y,dx,dy){
    if(s.phase!=='jeu'||!s.piece)return;
    s.piece.col=this.colonne(s,x);
  },
  relache:function(s,x,y){
    if(s.phase!=='jeu'||!s.piece)return;
    s.piece.col=this.colonne(s,x);
    s.descend=true;
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
  /* UN CONTENEUR, AVEC SON POIDS EN PASTILLES. Le chiffre serait
     illisible a dix-sept pixels de large : une, deux ou trois pastilles
     se comptent d'un coup d'oeil, meme du coin de l'oeil. */
  boite:function(x,y,w,ci,pi,pale){
    var C=CA_COUL[ci%8];
    var c=pale?'rgba(255,255,255,.10)':C.c;
    R(x,y,w,CA_CH,c);
    if(pale){R(x,y,w,1,'rgba(255,255,255,.22)');return;}
    R(x,y,w,1,C.h);R(x,y+CA_CH-1,w,1,C.b);
    R(x,y,1,CA_CH,C.h);R(x+w-1,y,1,CA_CH,C.b);
    for(var k=1;k<w/4;k++)R(x+k*4,y+2,1,CA_CH-4,C.b);
    /* les pastilles du poids, en haut a gauche */
    for(var q=0;q<=pi;q++)R(x+2+q*3,y+2,2,2,'#f2f6fb');
    if(pi>=2)R(x+2,y+CA_CH-4,w-4,1,'#f2f6fb');   /* la bande du trente tonnes */
  },

  dessine:function(s,L,H){
    var i,r,c;
    var G0=this.gite(s), sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.4:0;
    /* ---- LA MER ET LA NUIT ---- */
    var gr=G.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,'#0a1018');gr.addColorStop(1,'#16202e');
    G.fillStyle=gr;G.fillRect(0,0,L,H);
    for(i=0;i<40;i++){
      var ex=(i*37)%L, ey=(i*23)%42;
      R(ex,ey+4,1,1,(i%5)?'#4a5a70':'#9fb4c8');
    }
    /* la houle, dessinee derriere : on doit la voir arriver */
    if(s.houle>0){
      var ha=Math.min(1,s.houle/700);
      for(i=0;i<5;i++){
        var wy=20+i*7+Math.sin(s.t*0.004+i)*3;
        R(0,wy,L,1,'rgba(90,216,255,'+(0.18*ha).toFixed(2)+')');
      }
      G.fillStyle='rgba(90,216,255,.8)';G.font='bold 8px ui-monospace,monospace';
      G.textAlign='center';G.fillText('LA HOULE',L/2,18);
    }

    /* =================== LE NAVIRE, QUI ROULE ===================
       Tout bascule ensemble autour du fond de la coque. C'est la seule
       facon de SENTIR la gite : une jauge seule se lit, un navire penche
       se ressent, et c'est ce qui fait corriger avant la faute. */
    G.save();
    G.translate(sec,sec*0.5);
    var cx=CA_X+CA_COL*CA_CW/2, cy=this.fond(s);
    G.translate(cx,cy);G.rotate(s.roulis*0.13);G.translate(-cx,-cy);

    /* LA COQUE DEBORDE DU CADRE A DESSEIN. Elle tourne avec la cale :
       taillee au plus juste, ses coins quittaient l'ecran en roulant et
       on voyait le ciel passer derriere le bordage. On la dessine plus
       large et plus haute que ce qu'on en voit. */
    var fx=CA_X-14, fw=CA_COL*CA_CW+28, ft=CA_HAUT-30, fb=this.fond(s)+26;
    /* la coque */
    R(fx,ft,fw,fb-ft,'#141c28');
    R(fx,ft,fw,2,'#2a3a50');
    R(fx,ft,12,fb-ft,'#1d2938');R(fx+fw-12,ft,12,fb-ft,'#0e1521');
    R(fx,fb-18,fw,18,'#1d2938');
    /* les cloisons : une par colonne */
    for(c=1;c<CA_COL;c++)R(CA_X+c*CA_CW,CA_HAUT,1,s.NR*CA_CH,'rgba(90,120,160,.16)');
    /* le plancher de cale */
    R(CA_X-1,this.fond(s),CA_COL*CA_CW+2,2,'#2a3a50');
    /* les rangees, une ligne sur trois, pour qu'on compte la hauteur */
    for(r=0;r<s.NR;r+=3)R(CA_X,CA_HAUT+r*CA_CH,CA_COL*CA_CW,1,'rgba(90,120,160,.10)');

    /* ---- CE QUI EST DEJA ARRIME ---- */
    for(r=0;r<s.NR;r++)for(c=0;c<CA_COL;c++){
      var g=s.grille[r][c];
      if(!g||g.i!==0)continue;
      this.boite(CA_X+c*CA_CW+1,CA_HAUT+r*CA_CH,g.l*CA_CW-2,g.c,g.p,false);
    }

    /* ---- LA PIECE QUI DESCEND, ET SON OMBRE AU FOND ----
       L'OMBRE N'EST PAS UN CONFORT. Sans elle, on vise une colonne a
       l'oeil pendant que le navire penche de dix degres : la colonne
       qu'on croit viser n'est pas celle ou la piece tombe. */
    var P=s.piece;
    if(P&&s.phase==='jeu'){
      var ar=this.atterrissage(s,P.col,P.l);
      if(ar>=0){
        for(var jo=0;jo<P.t;jo++)
          this.boite(CA_X+P.col*CA_CW+1,CA_HAUT+(ar-jo)*CA_CH,P.l*CA_CW-2,P.c,P.p,true);
        /* la colonne eclairee, du haut jusqu'a l'ombre */
        R(CA_X+P.col*CA_CW+1,CA_HAUT,P.l*CA_CW-2,
          Math.max(0,(ar-P.t+1)*CA_CH),'rgba(255,226,74,.045)');
      }
      for(var jt=0;jt<P.t;jt++)
        this.boite(CA_X+P.col*CA_CW+1,P.y-jt*CA_CH,P.l*CA_CW-2,P.c,P.p,false);
      /* le spreader du portique, au-dessus */
      var sy0=P.y-(P.t-1)*CA_CH;
      R(CA_X+P.col*CA_CW+3,sy0-3,P.l*CA_CW-6,2,'#6a7280');
      for(i=0;i<2;i++)R(CA_X+P.col*CA_CW+4+i*(P.l*CA_CW-10),CA_HAUT-14,1,
                        Math.max(0,sy0-CA_HAUT+11),'#aab4c4');
    }

    /* ---- LES PARTICULES ---- */
    for(i=0;i<s.part.length;i++)R(s.part[i].x,s.part[i].y,1,1,s.part[i].c);
    G.restore();

    /* =================== LE CHROME =================== */
    R(0,0,L,14,'rgba(6,9,14,.70)');
    G.font='bold 9px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#ffe24a';G.fillText(s.score.toLocaleString('fr-FR'),L-5,11);
    G.font='7px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#9fb4c8';G.fillText(s.lignes+' ARRIMÉE'+(s.lignes>1?'S':''),5,11);

    /* ---- LE NIVEAU A BULLE : LA GITE ----
       Elle rougit AVANT la faute : une jauge qui ne fait que constater ne
       sert a rien, c'est le palier orange qui fait corriger. */
    var pw=Math.round(L*0.62), px0=Math.round((L-pw)/2), py=H-19;
    R(px0,py,pw,8,'rgba(0,0,0,.6)');
    R(px0+pw/2,py,1,8,'rgba(255,255,255,.4)');
    var gf=Math.max(-1,Math.min(1,G0)), da=Math.abs(gf);
    var gc2=da>0.80?'#ff4a4a':da>0.52?'#ff9a3a':'#5ad8ff';
    var bw=Math.max(2,da*pw/2);
    R(gf>=0?px0+pw/2:px0+pw/2-bw,py+1,bw,6,gc2);
    G.font='5px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#5a6b80';G.fillText('BÂBORD',4,py+6);
    G.textAlign='right';G.fillText('TRIBORD',L-4,py+6);
    if(da>0.80&&Math.floor(s.t/160)%2===0){
      G.fillStyle='#ff4a4a';G.font='bold 7px ui-monospace,monospace';
      G.textAlign='center';G.fillText('ÇA GÎTE',L/2,py-4);
    }
    /* la prime d'aplomb, en points */
    if(s.aplat>0&&da<0.18){
      G.textAlign='center';G.font='5px ui-monospace,monospace';G.fillStyle='#7fe0bc';
      G.fillText('À PLAT '+s.aplat+'/10',L/2,py-4);
    }

    /* ---- LA PIECE SUIVANTE, EN HAUT A DROITE ---- */
    if(s.suite){
      var sx=L-6-s.suite.l*CA_CW, sy=18;
      R(sx-3,sy-3,s.suite.l*CA_CW+6,s.suite.t*CA_CH+6,'rgba(0,0,0,.45)');
      for(var js=0;js<s.suite.t;js++)
        this.boite(sx,sy+js*CA_CH,s.suite.l*CA_CW-2,s.suite.c,s.suite.p,false);
      G.fillStyle='#5a6b80';G.font='5px ui-monospace,monospace';G.textAlign='right';
      G.fillText(this.pesee(s.suite)+' T',L-6,sy+s.suite.t*CA_CH+8);
    }
    /* le poids de la piece en cours, a gauche */
    if(s.piece){
      G.fillStyle='#cfe4f2';G.font='bold 7px ui-monospace,monospace';G.textAlign='left';
      G.fillText(this.pesee(s.piece)+' T',5,24);
      G.fillStyle='#5a6b80';G.font='5px ui-monospace,monospace';
      G.fillText((s.piece.l===2?'40 PIEDS':'20 PIEDS')+
                 (s.piece.t===2?' ×2':''),5,32);
    }

    /* ---- LE MOT ---- */
    if(s.motT>0&&s.mot){
      var a=Math.min(1,s.motT/400);
      var tp=s.motGros?12:9;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>5&&G.measureText(s.mot).width>L-16){
        tp--;G.font='bold '+tp+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=H*0.30;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.62*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp,tw+10,tp+6);
      G.fillStyle=(s.motGros?'rgba(255,226,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }

    if(s.flash>0){
      var fc=s.flashC;
      G.fillStyle=(fc==='#ff4a4a'?'rgba(255,74,74,':fc==='#7fe0bc'?'rgba(127,224,188,':
                   fc==='#5ad8ff'?'rgba(90,216,255,':'rgba(255,226,74,')+
                  (s.flash/300*0.16).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT LA PARTIE ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.78)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText('LA CALE',L/2,H*0.26);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('POSE LE POUCE SUR UNE COLONNE',L/2,H*0.26+18);
      G.fillText('LÈVE-LE, LE CONTENEUR TOMBE',L/2,H*0.26+30);
      G.fillStyle='#9fb4c8';
      G.fillText('UNE RANGÉE PLEINE EST ARRIMÉE',L/2,H*0.26+48);
      G.fillText('ELLE PART, ET LA GÎTE SE SOULAGE',L/2,H*0.26+60);
      G.fillStyle='#7fe0bc';
      G.fillText('12 · 24 · 30 TONNES PAR BOÎTE :',L/2,H*0.26+78);
      G.fillText('COMPTE LES PASTILLES',L/2,H*0.26+90);
      G.fillStyle='#ff9a5a';
      G.fillText('TROP DE POIDS D’UN CÔTÉ',L/2,H*0.26+108);
      G.fillText('ET LA CARGAISON RIPE',L/2,H*0.26+120);
    }

    /* ---- APRES ---- */
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.78)';G.fillRect(0,H*0.26,L,74);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.lignes+' RANGÉE'+(s.lignes>1?'S':'')+' ARRIMÉE'+
                 (s.lignes>1?'S':''),L/2,H*0.26+40);
      G.fillStyle='#9fb4c8';
      G.fillText(s.poses+' CONTENEURS',L/2,H*0.26+58);
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
    gr.addColorStop(0,'#0a1018');gr.addColorStop(1,'#16202e');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
      Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));}
    /* la coque, penchee : c'est le sujet de la borne */
    g.save();g.translate(w/2,h);g.rotate(0.07);g.translate(-w/2,-h);
    r(w*0.10,h*0.16,w*0.80,h*0.84,'#141c28');
    r(w*0.10,h*0.16,w*0.80,2,'#2a3a50');
    var P=[1,3,0,2,5,4,6,2,0,3];
    for(var i=0;i<5;i++)for(var j=0;j<2;j++){
      var k=i*2+j;if(k>=P.length)continue;
      var C=CA_COUL[P[k]], bx=w*0.13+i*(w*0.152), by=h-6-(j+1)*(h*0.26);
      r(bx,by,w*0.138,h*0.24,C.c);r(bx,by,w*0.138,1,C.h);
      for(var q=0;q<=k%3;q++)r(bx+1+q*3,by+1,2,2,'#f2f6fb');
    }
    g.restore();
    /* le niveau a bulle, bien droit par-dessus */
    r(w*0.22,4,w*0.56,5,'rgba(0,0,0,.6)');
    r(w*0.50,4,1,5,'rgba(255,255,255,.4)');
    r(w*0.50,5,w*0.16,3,'#ff9a3a');
    if(grand){
      g.fillStyle='#ffe24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LA CALE',w-6,16);
    }
  }
};
