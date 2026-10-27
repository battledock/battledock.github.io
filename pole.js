/* =======================================================================
   LA POLE  —  un tour de qualification, et rien d'autre
   =======================================================================

   UN SEUL GESTE : LE DOIGT SUR L'ECRAN, C'EST LE FREIN. Lever le doigt,
   c'est l'accelerateur. Pas de volant, pas de rapport a passer. Ce n'est
   pas un appauvrissement, c'est le sujet : en qualification, ce qui
   separe deux pilotes tient presque entierement dans le point de
   freinage. On enleve donc tout le reste pour ne garder que ca, et on le
   rend exigeant.

   POURQUOI PAS DE VOLANT. Une direction au pouce sur un telephone donne
   une voiture qui zigzague, et le joueur passe son temps a corriger sa
   propre imprecision au lieu de lire la piste. La trajectoire est donc
   tenue par la voiture — tant qu'elle en a les moyens. Arriver trop vite
   dans un virage ne fait pas « tourner moins bien » : la voiture ELARGIT,
   visiblement, vers l'exterieur, et c'est au joueur de lever le pied pour
   la ramener. La faute se voit, et elle se rattrape.

   LE DELTA EST LE JEU. Un chrono seul ne dit rien pendant qu'on roule :
   on ne sait qu'a la fin si le tour etait bon. Le delta compare, a chaque
   instant, le temps qu'on met a atteindre ce point avec celui qu'on
   mettait lors du meilleur tour. Vert, on gagne ; rouge, on perd. C'est
   ce chiffre qui fait relancer, parce qu'il transforme une erreur en
   information immediate — et parce qu'on sait toujours, a deux virages de
   l'arrivee, si le record va tomber.

   TROIS TOURS, ON GARDE LE MEILLEUR. Un seul tour, et une faute au
   deuxieme virage condamne a quarante secondes inutiles. Trois tours, et
   une faute coute un tiers de la partie : c'est assez pour faire mal,
   pas assez pour degouter.

   LE CIRCUIT NE CHANGE JAMAIS. Un trace tire au sort rendrait les chronos
   incomparables, donc le tableau du port absurde et le delta impossible.
   C'est le meme circuit pour tout le monde, a chaque partie : c'est la
   condition pour qu'un centieme veuille dire quelque chose.
   ===================================================================== */

var PL_SEG=200;          /* la longueur d'un segment, en unites du monde */
var PL_ROUTE=1500;       /* la demi-largeur de la piste */
var PL_CAMH=1150;        /* la hauteur de la camera au-dessus du bitume */
var PL_CAMD=0.86;        /* la profondeur de projection : le champ de vision */
var PL_VUE=150;          /* combien de segments on dessine devant soi */
var PL_VMAX=14.5;        /* la vitesse de pointe, en unites par milliseconde */
var PL_ACC=0.0052;
var PL_FREIN=0.0170;
var PL_FREIN_MOT=0.0016; /* le frein moteur, pied leve */
var PL_HORS=0.0090;      /* ce que coute l'herbe */
var PL_TOURS=3;
var PL_CLE_REF='bdl.pole.ref.v1';

/* =====================================================================
   LE CIRCUIT DU PORT. Ecrit comme une suite de morceaux ; chaque virage
   porte un nom, parce qu'un pilote ne dit pas « le troisieme virage a
   gauche », il dit « la Corniche ». Les noms servent au joueur a se
   reperer et a raconter son tour.

   c : la courbure. Negatif a gauche, positif a droite. Au-dela de 5 le
   virage devient serre et sa vitesse limite tombe sous la moitie.
   p : la pente. Elle ne change rien a la conduite, seulement au plaisir
   de voir la piste plonger et remonter — mais c'est ce qui fait qu'on
   reconnait un endroit du circuit au premier coup d'oeil.
   ===================================================================== */
var PL_PLAN=[
  {n:90,  c:0,    p:0,    nom:'LA LIGNE DU J4'},
  {n:48,  c:-3.2, p:0,    nom:'L’ESTAQUE'},
  {n:30,  c:0,    p:18},
  {n:54,  c:2.4,  p:12,   nom:'LA MONTÉE'},
  {n:70,  c:0,    p:-22},
  {n:40,  c:-6.2, p:0,    nom:'L’ÉPINGLE DU PHARE'},
  {n:26,  c:0,    p:0},
  {n:60,  c:4.4,  p:0,    nom:'LA CORNICHE'},
  {n:34,  c:1.2,  p:14},
  {n:96,  c:0,    p:0,    nom:'LA DROITE DU MOLE'},
  {n:44,  c:-4.8, p:-16,  nom:'LE PLONGEON'},
  {n:36,  c:-1.6, p:0},
  {n:52,  c:3.6,  p:0,    nom:'LA DOUANE'},
  {n:30,  c:0,    p:20},
  {n:46,  c:-2.2, p:0,    nom:'LE TUNNEL'},
  {n:62,  c:5.4,  p:-10,  nom:'LE CROCHET'},
  {n:110, c:0,    p:0,    nom:'LA LIGNE DROITE DU PORT'},
  {n:38,  c:-5.0, p:0,    nom:'LA DERNIÈRE'},
  {n:56,  c:0,    p:0}
];

MOTEUR.pole={
  nom:'La Pole', sous:'UN TOUR · LE DOIGT, C’EST LE FREIN',
  vise:150, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:150, H:300,
            segs:null, long:0,
            pos:0, v:0, x:0, frein:false,
            tour:0, tms:0, meilleur:0, tours:[], fini:0,
            ref:null, refNeuf:null, delta:0, deltaV:false,
            sect:0, sects:[0,0,0], sectRef:null,
            herbe:0, sortie:0, secousse:0,
            mot:'', motT:0, motGros:false,
            virNom:'', virT:0, flash:0, enPause:false,
            nuage:null, rec:0, recNeuf:false};
  },

  /* ================= LE RUBAN =================
     On deroule le plan en segments. LA COURBURE N'EST PAS POSEE D'UN
     COUP : un virage qui commence au pixel pres se lit comme un mur, et
     la voiture part a l'exterieur sans que le joueur ait rien vu venir.
     Chaque morceau a donc une entree et une sortie progressives, sur un
     quart de sa longueur — c'est ce qui donne une corde a viser. */
  batir:function(s){
    var segs=[], i, k, y=0;
    for(k=0;k<PL_PLAN.length;k++){
      var M=PL_PLAN[k], n=M.n, ent=Math.max(4,Math.round(n*0.26));
      for(i=0;i<n;i++){
        var f=1;
        if(i<ent)f=i/ent;
        else if(i>n-ent)f=(n-i)/ent;
        f=f*f*(3-2*f);                       /* une entree douce, pas lineaire */
        var c=M.c*f, p=(M.p||0)*f;
        var y0=y; y+=p;
        segs.push({i:segs.length, c:c, y0:y0, y1:y,
                   nom:(i===Math.round(n*0.18)&&M.nom)?M.nom:null});
      }
    }
    /* LA BOUCLE DOIT SE REFERMER : on ramene l'altitude a zero sur les
       derniers segments, sinon la ligne d'arrivee est vingt metres plus
       haut que la ligne de depart et la piste fait une marche. */
    var reste=y, q=Math.min(60,segs.length);
    for(i=0;i<q;i++){
      var j=segs.length-q+i, g=reste*(1-i/q)/q*2;
      segs[j].y1=segs[j].y0-g;
      if(i+1<q)segs[j+1].y0=segs[j].y1;
    }
    for(i=0;i<segs.length;i++){
      var S0=segs[i];
      S0.vlim=PL_VMAX*(1-Math.min(0.64,Math.abs(S0.c)*0.097));
      S0.fonce=((i/3)|0)%2===0;
    }
    s.segs=segs; s.long=segs.length*PL_SEG;
  },

  seg:function(s,z){
    return s.segs[(((z/PL_SEG)|0)%s.segs.length+s.segs.length)%s.segs.length];
  },

  demarrer:function(s){
    this.batir(s);
    s.phase='jeu';s.t=0;s.score=0;s.pos=0;s.v=0;s.x=0;s.frein=false;
    s.tour=1;s.tms=0;s.meilleur=0;s.tours=[];s.fini=0;
    s.sect=0;s.sects=[0,0,0];s.herbe=0;s.sortie=0;s.secousse=0;
    s.delta=0;s.deltaV=false;s.flash=0;s.enPause=false;s.recNeuf=false;
    s.refNeuf=new Array(s.segs.length);
    /* LE TOUR DE REFERENCE, garde d'une partie a l'autre : c'est contre
       soi-meme qu'on joue d'abord. Un delta qui repart de zero a chaque
       jeton ne sert a rien. */
    s.ref=null;s.rec=0;
    try{
      var o=JSON.parse(localStorage.getItem(PL_CLE_REF)||'null');
      if(o&&o.n===s.segs.length&&o.r&&o.r.length===s.segs.length){
        s.ref=o.r; s.rec=o.t||0; s.sectRef=o.s||null;
      }
    }catch(e){}
    this.dire(s,'TOUR DE LANCEMENT',true);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1700:1100;s.motGros=!!gros;},

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.virT>0)s.virT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.secousse>0)s.secousse=Math.max(0,s.secousse-dt*0.0035);
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }
    var S0=this.seg(s,s.pos);

    /* ---- LA SORTIE DE PISTE ----
       On ne replace pas la voiture en silence : elle rentre au ralenti,
       le temps continue de courir, et le tour est perdu. C'est la seule
       faute vraiment punie — tout le reste se rattrape. */
    if(s.sortie>0){
      s.sortie-=dt;
      s.v=Math.max(0,s.v-PL_HORS*dt*0.4);
      s.x+=(0-s.x)*Math.min(1,dt*0.004);
      s.pos+=s.v*dt;
      s.tms+=dt;
      this.chrono(s,dt);
      return;
    }

    /* ---- LE PIED ---- */
    if(s.frein) s.v-=PL_FREIN*dt;
    else        s.v+=(PL_ACC*(1-s.v/PL_VMAX)*1.9)*dt-PL_FREIN_MOT*dt;
    /* l'herbe freine toute seule, et fort */
    if(Math.abs(s.x)>1) s.v-=PL_HORS*dt;
    s.v=Math.max(0,Math.min(PL_VMAX,s.v));

    /* ---- LA TENUE DE ROUTE ----
       Sous la vitesse limite du virage, la voiture revient d'elle-meme a
       la corde. Au-dessus, elle ELARGIT, et d'autant plus que l'exces est
       grand : on voit la faute arriver, on a le temps de lever le pied. */
    var vlim=S0.vlim;
    if(s.v>vlim){
      var exc=(s.v-vlim)/PL_VMAX;
      var sens=(S0.c>=0?1:-1);                /* on part a l'exterieur */
      s.x+=sens*exc*Math.abs(S0.c)*0.0062*dt;
      if(exc>0.10&&s.secousse<0.4)s.secousse=0.4;
    }else{
      s.x+=(0-s.x)*Math.min(1,dt*0.0026);
    }
    /* la courbure pousse aussi la voiture, meme dans les clous : c'est ce
       qui donne le sentiment d'etre emmene par le virage */
    s.x+=(S0.c>=0?1:-1)*Math.abs(S0.c)*(s.v/PL_VMAX)*0.00052*dt;
    s.x=Math.max(-2.2,Math.min(2.2,s.x));

    if(Math.abs(s.x)>1&&s.herbe<=0){s.herbe=260;this.dire(s,'DANS L’HERBE',false);}
    if(s.herbe>0)s.herbe-=dt;
    if(Math.abs(s.x)>1.9){
      s.sortie=1800;s.secousse=1;
      this.dire(s,'SORTIE · TOUR PERDU',true);
      s.tourPerdu=true;
    }

    /* ---- ON AVANCE ---- */
    var av=s.pos;
    s.pos+=s.v*dt;
    s.tms+=dt;
    /* le nom du virage, annonce quand on y entre */
    var S1=this.seg(s,s.pos);
    if(S1.nom&&S1!==S0){s.virNom=S1.nom;s.virT=1800;}
    this.chrono(s,dt);
    this.delta_(s);
  },

  /* ================= LE CHRONO ET LES SECTEURS ================= */
  chrono:function(s,dt){
    var i=((s.pos/PL_SEG)|0)%s.segs.length;
    var tiers=(s.segs.length/3)|0;
    var sec=Math.min(2,(i/tiers)|0);
    if(sec!==s.sect){
      s.sects[s.sect]=s.tms;
      s.sect=sec;
      if(sec>0&&s.sectRef){
        var d=(s.tms-s.sectRef[sec-1])/1000;
        this.dire(s,'S'+sec+'  '+(d>=0?'+':'')+d.toFixed(3),true);
        s.flash=d<0?300:0;
      }
    }
    /* le tour est boucle quand on repasse le segment zero */
    if(s.pos>=s.long){
      s.pos-=s.long;
      this.boucler(s);
    }
  },

  boucler:function(s){
    var t=s.tms;
    s.sects[2]=t;
    var valable=!s.tourPerdu&&s.tour>1;   /* le premier tour est lance */
    if(s.tour===1){
      this.dire(s,'C’EST PARTI',true);
    }else if(s.tourPerdu){
      this.dire(s,'TOUR ANNULÉ',true);
    }else{
      s.tours.push(t);
      if(!s.meilleur||t<s.meilleur){
        s.meilleur=t;
        /* ON GARDE LE RUBAN DU MEILLEUR TOUR, pas seulement son temps :
           c'est lui qui nourrit le delta de la tentative suivante. */
        s.ref=s.refNeuf.slice();
        s.sectRef=s.sects.slice();
        if(!s.rec||t<s.rec){s.rec=t;s.recNeuf=true;}
        try{localStorage.setItem(PL_CLE_REF,JSON.stringify(
          {n:s.segs.length,r:s.ref,t:s.rec,s:s.sectRef}));}catch(e){}
        this.dire(s,'MEILLEUR TOUR · '+this.mmss(t),true);
        s.flash=420;
      }else{
        this.dire(s,this.mmss(t),true);
      }
    }
    s.tour++;s.tms=0;s.sect=0;s.sects=[0,0,0];s.tourPerdu=false;
    s.refNeuf=new Array(s.segs.length);
    if(s.tour>PL_TOURS+1){
      s.phase='arrive';s.fini=1800;
      this.dire(s,s.meilleur?('TON TOUR · '+this.mmss(s.meilleur)):'AUCUN TOUR BOUCLÉ',true);
    }
  },

  /* LE DELTA. On note, pour chaque segment, l'instant ou on l'a atteint ;
     la difference avec le meme segment du tour de reference est le delta.
     Rien de plus — mais c'est le seul chiffre qui dit, pendant qu'on
     roule, si le tour en cours vaut mieux que le precedent. */
  delta_:function(s){
    var i=((s.pos/PL_SEG)|0)%s.segs.length;
    if(s.refNeuf&&s.refNeuf[i]===undefined)s.refNeuf[i]=s.tms;
    if(s.ref&&typeof s.ref[i]==='number'){
      var d=(s.tms-s.ref[i])/1000;
      s.delta+=(d-s.delta)*0.22;            /* lisse, sinon le chiffre tremble */
      s.deltaV=s.delta<0;
    }
  },

  mmss:function(ms){
    var m=Math.floor(ms/60000), r=(ms-m*60000)/1000;
    return (m>0?(m+':'+(r<10?'0':'')):'')+r.toFixed(3);
  },

  fin:function(s){
    s.phase='fini';
    /* LE SCORE : un chrono descend, un tableau d'arcade monte. On compte
       donc ce qu'on a gagne sur une reference — mais la reference doit
       coller au trace. Mesure faite : le circuit du port fait quatorze
       secondes a fond partout (donc jamais), un pilote-robot honnete en
       met vingt-trois, et un tour vraiment rate depasse trente-cinq. On
       part donc de quarante secondes et on compte au cinquieme de
       milliseconde : un tour de vingt secondes vaut quatre mille points,
       un tour de trente en vaut deux mille, et au-dela de quarante il
       n'y a plus rien a gagner. Une reference de cent secondes, taillee
       pour un circuit deux fois plus long, ecrasait tout l'ecart entre un
       bon tour et un mauvais. */
    s.score=s.meilleur?Math.max(0,Math.round((40000-s.meilleur)/5)):0;
    if(typeof monterActions==='function')monterActions();
    if(typeof finirPartie==='function')finirPartie(s.score);
  },

  /* ================= LE DOIGT =================
     POSE = FREIN. LEVE = ACCELERATEUR. Il n'y a rien d'autre a faire, et
     c'est pour cela qu'on peut y jouer d'une main dans le bus. */
  presse:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase==='jeu')s.frein=true;
  },
  leve:function(s){ s.frein=false; },
  tape:function(s,x,y){ if(s.enPause)s.enPause=false; },

  actions:function(s){
    if(!s||s.phase==='pret')
      return '<button class="pr" data-a="commencer">COMMENCER</button>';
    if(s.phase==='fini')
      return '<button data-a="menu">LE MENU</button>'+
             '<button class="pr" data-a="rejouer">ENCORE · 1 €</button>';
    return '';
  },
  action:function(s,a){ if(a==='menu'&&typeof mnuOuvrir==='function')mnuOuvrir(); },
  cadre:function(s,L,H){
    s.L=L;s.H=H;
    if(!s.nuage){
      s.nuage=[];
      for(var i=0;i<26;i++)s.nuage.push({x:al(i*4.1)*L,y:18+al(i*9.3)*44,
                                         w:6+al(i*2.7)*14,g:al(i*5.9)});
    }
  },

  /* =====================================================================
     LE DESSIN
     ---------------------------------------------------------------------
     LA ROUTE EST PEINTE LIGNE PAR LIGNE, pas en polygones. Un trapeze
     rempli par le navigateur arrive avec des bords lisses et des demi-
     pixels : au milieu d'un jeu dessine au pixel, ca se voit tout de
     suite. En balayant les lignes d'ecran une par une et en posant des
     rectangles entiers, chaque bande de bitume, chaque vibreur et chaque
     pointille tombe sur un pixel franc.
     ===================================================================== */
  dessine:function(s,L,H){
    var i;
    if(!s.segs){ this.batir(s); }
    var sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.4:0;
    /* L'HORIZON EST A MI-HAUTEUR, ET CE N'EST PAS UN CHOIX DE CADRAGE :
       c'est la ou la projection envoie un point infiniment loin. Le poser
       ailleurs fait flotter la piste au-dessus ou en dessous du ciel. */
    var HOR=Math.round(H*0.50);

    /* ---- LE CIEL ---- */
    var bandes=[[0.00,'#1a1e36'],[0.16,'#2a2644'],[0.32,'#483250'],
                [0.46,'#743e4e'],[0.60,'#a65248'],[0.72,'#d4703f'],
                [0.84,'#f29a4a'],[1.00,'#fac06e']];
    for(i=0;i<bandes.length-1;i++){
      var y0=Math.round(bandes[i][0]*HOR), y1=Math.round(bandes[i+1][0]*HOR);
      R(0,y0,L,y1-y0,bandes[i][1]);
    }
    /* le soleil bas, pose sur l'horizon */
    var sx=Math.round(L*0.70);
    disque(sx,HOR-7,9,'#ffeec0');
    R(sx-11,HOR-3,22,3,'#ffeec0');
    for(i=0;i<s.nuage.length;i++){
      var n=s.nuage[i], ny=n.y*HOR/70;
      if(ny<HOR-4)R(((n.x+s.t*0.004*(0.4+n.g))%(L+30))-15,ny,n.w,1,
                    n.g>0.5?'rgba(255,220,190,.35)':'rgba(255,200,170,.22)');
    }
    /* les collines, deux plans, qui glissent avec le virage */
    var S0=this.seg(s,s.pos);
    var dec=-(s.virAcc||0);
    for(var pl=0;pl<2;pl++){
      var amp=(pl?13:9), ybase=HOR-(pl?0:5), col=pl?'#2e2840':'#4b3850';
      for(var k=0;k<6;k++){
        var bx=((k*34+dec*(pl?0.5:0.25))%(L+40))-20;
        for(i=0;i<36;i++){
          var hh=(amp+(k%2)*5)*Math.sqrt(Math.max(0,Math.sin(i/36*3.14159)));
          if(hh>0.6)R(bx+i,ybase-hh,1,hh+2,col);
        }
      }
    }

    /* ---- LA PISTE ----
       On part du bas de l'ecran et on remonte : des qu'un segment passe
       au-dessus du plus haut deja peint, on s'arrete. C'est ce qui
       empeche une bosse lointaine de se dessiner par-dessus la cote
       qu'on a devant le nez. */
    R(0,HOR,L,H-HOR,'#2d4030');
    var base=((s.pos/PL_SEG)|0), off=s.pos-base*PL_SEG;
    var cx=0, dcx=-(this.seg(s,s.pos).c*(off/PL_SEG));
    var maxy=H, prev=null;
    var camY=PL_CAMH+this.seg(s,s.pos).y0;
    for(var nn=0;nn<PL_VUE;nn++){
      var SG=s.segs[(base+nn)%s.segs.length];
      var bouc=(base+nn)>=s.segs.length?s.long:0;
      var z=(base+nn)*PL_SEG-s.pos;
      var p={w:0,sx:0,sy:0};
      var dz=z+PL_SEG;
      if(dz<=1){ cx+=dcx; dcx+=SG.c; continue; }
      /* LA PROJECTION, SANS FACTEUR DE CONFORT. La premiere version
         portait des divisions par PL_ROUTE et PL_CAMH ajoutees « pour
         ajuster » : elles annulaient l'echelle et la piste ne se
         dessinait pas du tout — un aplat vert sous un ciel. La forme
         juste est celle de tous les jeux de route en fausse 3D :
             echelle = profondeur / distance
             x ecran = L/2 * (1 + echelle * ecart lateral)
             y ecran = H/2 * (1 - echelle * ecart vertical)
             demi-largeur = echelle * demi-route * L/2
         Tout y est homogene, et il n'y a rien a regler. */
      var ech=PL_CAMD/dz;
      p.sx=Math.round(L/2*(1+ech*(cx+dcx-s.x*PL_ROUTE)));
      p.sy=Math.round(H/2*(1-ech*(SG.y1-camY)));
      p.w =Math.round(ech*PL_ROUTE*L/2);
      p.f =SG.fonce; p.i=SG.i; p.z=dz;
      if(prev&&p.sy<maxy&&prev.sy>p.sy){
        this.bande(s,L,H,prev,p,sec);
        maxy=p.sy;
      }
      prev=p;
      cx+=dcx; dcx+=SG.c;
    }
    s.virAcc=(s.virAcc||0)*0.92+dcx*0.02;

    /* ---- LA VOITURE ---- */
    this.voiture(s,L,H,sec);

    /* ---- LE CHROME ---- */
    this.chrome(s,L,H);
  },

  /* une bande de piste entre deux segments projetes */
  bande:function(s,L,H,a,b,sec){
    var y, f, x, w, bo, vb, herb, rt, lg;
    var n=a.sy-b.sy; if(n<=0)return;
    for(y=a.sy-1;y>=b.sy;y--){
      f=(a.sy-y)/n;
      x=Math.round(a.sx+(b.sx-a.sx)*f)+sec;
      w=Math.max(2,Math.round(a.w+(b.w-a.w)*f));
      herb=a.f?'#30462f':'#2c4030';
      rt  =a.f?'#3b3e49':'#363942';
      R(0,y,L,1,herb);
      bo=Math.max(1,Math.round(w*0.055));
      vb=Math.max(1,Math.round(w*0.075));
      /* le bas-cote */
      R(x-w-vb*2,y,2*(w+vb*2),1,'#4a4d58');
      /* les vibreurs : rouge et blanc en alternance, un damier qui file */
      var cv=(((a.i/2)|0)%2===0)?'#c8362e':'#e6e6ea';
      R(x-w-vb,y,vb,1,cv); R(x+w,y,vb,1,cv);
      /* la piste */
      R(x-w,y,2*w,1,rt);
      R(x-w,y,bo,1,'#e4e4e8'); R(x+w-bo,y,bo,1,'#e4e4e8');
      /* la ligne du milieu, en pointille */
      if(((a.i/3)|0)%2===0){
        lg=Math.max(1,Math.round(w*0.035));
        R(x-lg,y,2*lg,1,'#e8e8ec');
      }
    }
  },

  /* LA MONOPLACE, VUE DE DERRIERE. Dessinee a la main en bandes : a cette
     taille, une forme approchee ne ressemble a rien. Les roues sont
     DETACHEES de la coque et la coque occupe les deux tiers de la largeur
     — c'est ce qui fait reconnaitre une monoplace plutot qu'une berline. */
  voiture:function(s,L,H,sec){
    var w=Math.round(L*0.58), cx=Math.round(L/2+sec-s.x*L*0.13), by=H-21;
    /* L'UNITE SE DEDUIT DE LA LARGEUR, et le compte doit tomber juste :
       neuf unites de pneu a gauche, vingt-six de coque, neuf a droite.
       Avec un diviseur trop petit, la somme depassait la largeur et la
       monoplace rentrait les epaules — elle avait l'air d'une berline. */
    var u=Math.max(1,Math.round(w/48));
    var ROU='#101117', rou2='#3a3e4b', CAR='#ca1e1a', car2='#f24436';
    var pw=u*9, ph=u*10;
    /* les pneus, poses au sol et detaches de la coque */
    R(cx-w/2,by-ph,pw,ph,ROU); R(cx+w/2-pw,by-ph,pw,ph,ROU);
    R(cx-w/2,by-ph,pw,u,rou2); R(cx+w/2-pw,by-ph,pw,u,rou2);
    for(var k=1;k<4;k++){
      R(cx-w/2,by-ph+k*u*2+u,pw,u,'#23262f');
      R(cx+w/2-pw,by-ph+k*u*2+u,pw,u,'#23262f');
    }
    /* la coque : etroite en haut, large au ras du sol */
    var cw=[u*4,u*6,u*9,u*13,u*17,u*21,u*24,u*26,u*26,u*26,u*25];
    for(var j=0;j<cw.length;j++){
      var yy=by-ph-u*2+j*u;
      R(cx-cw[j]/2,yy,cw[j],u,j<2?car2:CAR);
      R(cx-cw[j]/2,yy,u,u,'#8d1412'); R(cx+cw[j]/2-u,yy,u,u,'#8d1412');
      if(j===2)R(cx-cw[j]/2+u,yy,cw[j]-2*u,u,car2);   /* le reflet du capot */
    }
    /* LE FEU DE PLUIE. On le voit s'allumer au freinage : c'est le seul
       retour visuel sur ce que fait le pied, et il est au milieu de
       l'ecran, la ou l'oeil se trouve deja. */
    R(cx-u*3,by-u*9,u*6,u*3,s.frein?'#ff4a3c':'#5e1a16');
    if(s.frein)R(cx-u*2,by-u*8,u*4,u,'#ffb0a4');
    /* le fond plat et le diffuseur */
    R(cx-u*13,by-u*3,u*26,u*3,'#1e212a');
    for(var d2=0;d2<7;d2++)R(cx-u*11+d2*u*4,by-u*3,u,u*3,'#0e1016');
    /* l'aileron arriere */
    var aw=Math.round(w*0.90);
    R(cx-aw/2,by-ph-u*5,aw,u,'#0f1016');
    R(cx-aw/2,by-ph-u*4,aw,u,'#9aa0b0');
    R(cx-aw/2,by-ph-u*3,aw,u,'#ffce3e');
    R(cx-aw/2,by-ph-u*2,aw,u,'#0f1016');
    R(cx-aw/2,by-ph-u*5,u,u*4,'#4a4e5c'); R(cx+aw/2-u,by-ph-u*5,u,u*4,'#4a4e5c');
    R(cx-u,by-ph-u*2,u*2,u*2,'#4a4e5c');
    /* l'herbe qui vole, ou les etincelles du fond plat a pleine vitesse */
    if(Math.abs(s.x)>1)
      for(var e=0;e<8;e++)
        R(cx-w/2+Math.random()*w,by-Math.random()*u*7,u,u,'#6b7a52');
    else if(s.v>PL_VMAX*0.8&&Math.random()<0.4)
      R(cx-u*9+Math.random()*u*18,by-u,u*2,u,'#ffb44a');
  },

  chrome:function(s,L,H){
    var i;
    /* ---- LE BANDEAU DU HAUT : le chrono du tour ---- */
    R(0,0,L,16,'rgba(6,9,14,.82)');
    G.font='bold 10px ui-monospace,monospace';G.textAlign='left';
    G.fillStyle='#ffffff';
    G.fillText(this.mmss(s.tms),4,11);
    G.font='7px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#9fb4c8';
    G.fillText('TOUR '+Math.min(s.tour,PL_TOURS+1)+'/'+(PL_TOURS+1)+
               (s.tour===1?' · LANCEMENT':''),L-4,7);
    G.fillStyle=s.rec?'#9fb4c8':'#5d6e80';
    G.fillText(s.rec?('REC '+this.mmss(s.rec)):'PAS DE RÉF.',L-4,14);

    /* ---- LE DELTA, en gros, au milieu ----
       Il ne s'affiche que s'il existe une reference : un delta invente
       au premier tour mentirait, et un chiffre qui ment est pire que
       pas de chiffre. */
    if(s.ref&&s.tour>1){
      var d=s.delta, v=d<0;
      var txt=(d>=0?'+':'−')+Math.abs(d).toFixed(2);
      G.font='bold 15px ui-monospace,monospace';G.textAlign='center';
      G.fillStyle='rgba(6,9,14,.55)';
      G.fillText(txt,L/2+1,30);
      G.fillStyle=v?'#7dff9a':'#ff6a5a';
      G.fillText(txt,L/2,29);
    }

    /* ---- LE NOM DU VIRAGE ---- */
    if(s.virT>0&&s.virNom){
      var a2=Math.min(1,s.virT/500);
      G.font='bold 8px ui-monospace,monospace';G.textAlign='center';
      G.fillStyle='rgba(255,206,62,'+a2.toFixed(2)+')';
      G.fillText(s.virNom,L/2,H*0.43);
    }

    /* ---- CE QUI ARRIVE ----
       TOUT EN HAUT, SUR UNE LIGNE. Ce bloc occupait un coin du bas de
       l'ecran, c'est-a-dire exactement la place de la voiture : on
       pilotait une machine cachee derriere son propre tableau de bord.
       Le bas de l'ecran appartient a la monoplace, le haut a
       l'information.

       CE QU'IL DIT, ET CE QU'IL NE DIT PAS. Il annonce la vitesse a
       prendre et la distance — ce qu'un pilote lit sur son volant. Il
       passe a l'orange quand le point de freinage ideal arrive, au rouge
       quand on l'a depasse. Il ne freine jamais a la place du joueur, et
       le bon joueur freinera APRES l'orange : c'est la que se gagnent
       les centiemes. */
    var devant=this.prochain(s);
    if(devant){
      var m=Math.round(devant.d/PL_SEG*8);
      var etat=s.v>devant.vIci?2:(s.v>devant.vIci*0.93?1:0);
      var cc=etat===2?'#ff5a4a':etat===1?'#ffb04a':'#7fa8c4';
      G.font='7px ui-monospace,monospace';G.textAlign='center';
      G.fillStyle='rgba(6,9,14,.6)';
      var tx2=Math.round(devant.vlim*16)+' KM/H  DANS '+m+' M';
      var tw2=G.measureText(tx2).width;
      G.fillRect((L-tw2)/2-4,H*0.155-7,tw2+8,11);
      G.fillStyle=cc;G.fillText(tx2,L/2,H*0.155);
      if(etat===2&&Math.floor(s.t/140)%2===0){
        G.fillStyle='#ff5a4a';G.font='bold 8px ui-monospace,monospace';
        G.fillText('FREINE',L/2,H*0.155+11);
      }
    }

    /* ---- LE BANDEAU DU BAS : les secteurs, la vitesse, le pied ----
       Une seule bande de vingt-deux pixels pour tout, et la monoplace
       pose dessus. Trois blocs separes mangeaient le tiers bas de
       l'ecran. */
    R(0,H-22,L,22,'rgba(6,9,14,.88)');
    var lw=Math.round(L*(s.v/PL_VMAX));
    R(0,H-22,lw,2,s.frein?'#ff6a5a':'#7dff9a');
    for(i=0;i<3;i++){
      var x0=3+i*28, ww=25;
      var col=(s.sectRef&&s.sects[i]>0)?(s.sects[i]<s.sectRef[i]?'#7dff9a':'#ff6a5a'):'#4c5a6a';
      R(x0,H-17,ww,2,(s.sects[i]>0)?col:'#2a303c');
      G.font='6px ui-monospace,monospace';G.textAlign='left';
      G.fillStyle=i===s.sect?'#ffce3e':'#6d8094';
      G.fillText('S'+(i+1),x0,H-8);
      if(s.sects[i]>0){
        G.textAlign='right';G.fillStyle=col;
        G.fillText(((s.sects[i]-(i?s.sects[i-1]:0))/1000).toFixed(2),x0+ww,H-8);
      }
    }
    G.textAlign='right';
    G.font='bold 13px ui-monospace,monospace';
    G.fillStyle=s.frein?'#ff8a7a':'#ffffff';
    G.fillText(String(Math.round(s.v*16)),L-16,H-7);
    G.font='6px ui-monospace,monospace';G.fillStyle='#6d8094';
    G.fillText('KM/H',L-1,H-7);

    /* ---- LE MOT ---- */
    if(s.motT>0&&s.mot){
      var a=Math.min(1,s.motT/450), tp=s.motGros?12:9;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>5&&G.measureText(s.mot).width>L-16){
        tp--;G.font='bold '+tp+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=H*0.22;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.62*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp,tw+10,tp+6);
      G.fillStyle=(s.motGros?'rgba(255,206,62,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }
    if(s.flash>0){
      G.fillStyle='rgba(125,255,154,'+(s.flash/420*0.13).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT ET APRES ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.76)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#7dff9a';
      G.fillText('LA POLE',L/2,H*0.34);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('LE DOIGT POSÉ = LE FREIN',L/2,H*0.34+18);
      G.fillText('LE DOIGT LEVÉ = PLEIN GAZ',L/2,H*0.34+30);
      G.fillStyle='#9fb4c8';
      G.fillText('TROIS TOURS · ON GARDE LE MEILLEUR',L/2,H*0.34+48);
      G.fillText('TROP VITE DANS UN VIRAGE :',L/2,H*0.34+60);
      G.fillText('ELLE ÉLARGIT. LÈVE LE PIED.',L/2,H*0.34+70);
      G.fillStyle='#ffce3e';
      G.fillText('LE DELTA DIT TOUT.',L/2,H*0.34+88);
    }
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.80)';G.fillRect(0,H*0.24,L,86);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#ffce3e';
      G.fillText(s.meilleur?this.mmss(s.meilleur):'—',L/2,H*0.24+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.tours.length+' TOUR'+(s.tours.length>1?'S':'')+' BOUCLÉ'+
                 (s.tours.length>1?'S':''),L/2,H*0.24+38);
      G.fillStyle=s.recNeuf?'#7dff9a':'#9fb4c8';
      G.fillText(s.recNeuf?'NOUVEAU RECORD PERSONNEL':'RECORD '+this.mmss(s.rec),
                 L/2,H*0.24+54);
      G.fillStyle='#ffffff';G.font='bold 10px ui-monospace,monospace';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.24+74);
    }
    if(s.enPause){
      G.fillStyle='rgba(6,9,14,.66)';G.fillRect(0,0,L,H);
      G.textAlign='center';G.font='bold 11px ui-monospace,monospace';
      G.fillStyle='#ffce3e';G.fillText('EN PAUSE',L/2,H/2-6);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('TAPE POUR REPRENDRE',L/2,H/2+8);
    }
  },

  /* =====================================================================
     CE QUI COMMANDE, DEVANT
     ---------------------------------------------------------------------
     LA PREMIERE VERSION RENVOYAIT LE PREMIER VIRAGE VENU, et c'etait
     faux. Un virage s'ouvre progressivement : ses premiers segments ont
     une courbure faible et donc une vitesse limite elevee. En approche
     de l'epingle du Phare, le tableau de bord annoncait donc paisiblement
     220 km/h alors qu'il fallait deja etre a 90 trente metres plus loin —
     le pilote-robot sortait systematiquement a cet endroit, et un joueur
     aurait fait pareil en se croyant trahi.

     On cherche donc, sur toute la fenetre visible, le segment qui
     CONTRAINT LE PLUS MAINTENANT. Pour chacun on calcule la vitesse
     maximale qu'on peut encore avoir ici pour y arriver a sa limite :
         v_ici = racine( v_limite^2 + 2 * frein * distance )
     et on garde le plus petit. C'est la meme chose que ce que fait un
     pilote quand il regarde loin dans le virage au lieu de regarder son
     capot.
     ===================================================================== */
  prochain:function(s){
    var base=((s.pos/PL_SEG)|0), pire=null;
    for(var n=1;n<110;n++){
      var SG=s.segs[(base+n)%s.segs.length];
      if(Math.abs(SG.c)<=1.2)continue;
      var d=n*PL_SEG;
      var vIci=Math.sqrt(SG.vlim*SG.vlim+2*PL_FREIN*d);
      if(!pire||vIci<pire.vIci)pire={vlim:SG.vlim,d:d,c:SG.c,vIci:vIci};
    }
    return pire;
  },

  /* ================= LA BANNIERE DE LA SALLE ================= */
  banniere:function(g,w,h,grand){
    g.imageSmoothingEnabled=false;
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
      Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));}
    var HOR=Math.round(h*0.42);
    var bd=['#1e2238','#342b48','#6b3c4e','#b05a44','#e88a44','#f8b85e'];
    for(var i=0;i<bd.length;i++)r(0,i*HOR/bd.length,w,HOR/bd.length+1,bd[i]);
    r(w*0.72,HOR-7,14,7,'#ffeec0');
    r(0,HOR,w,h-HOR,'#2d4030');
    for(var y=HOR;y<h;y++){
      var t=(y-HOR)/(h-HOR), ww=4+t*t*w*1.25, x0=w/2-ww/2+Math.sin(t*2.2)*w*0.10;
      r(x0,y,ww,1,((y/3)|0)%2?'#3b3e49':'#363942');
      r(x0,y,Math.max(1,ww*0.05),1,'#e4e4e8');
      r(x0+ww-Math.max(1,ww*0.05),y,Math.max(1,ww*0.05),1,'#e4e4e8');
      if(((y/3)|0)%2===0)r(x0+ww/2-Math.max(1,ww*0.02),y,Math.max(1,ww*0.04),1,'#e8e8ec');
    }
    /* la monoplace, en bas */
    var cx=w/2+Math.sin(1.0)*w*0.04, u=Math.max(1,Math.round(h/26)), by=h-u*2;
    r(cx-u*11,by-u*7,u*5,u*7,'#101117'); r(cx+u*6,by-u*7,u*5,u*7,'#101117');
    var cw=[u*3,u*6,u*9,u*12,u*14,u*15];
    for(var j=0;j<cw.length;j++)r(cx-cw[j]/2,by-u*8+j*u,cw[j],u,j<2?'#f24436':'#ca1e1a');
    r(cx-u*8,by-u*11,u*16,u,'#0f1016');
    r(cx-u*8,by-u*10,u*16,u,'#ffce3e');
    if(grand){
      g.fillStyle='#7dff9a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LA POLE',w-6,14);
    }
  }
};
