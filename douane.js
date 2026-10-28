/* =====================================================================
   LA DOUANE — borne d'arcade du Battledock
   =====================================================================
   LE GESTE. Deux boutons. LAISSE PASSER, ou OUVRE-LE. Rien d'autre, et
   c'est voulu : tout le jeu est dans ce qu'on regarde avant d'appuyer.

   LE SCAN A GAUCHE, LES PAPIERS A DROITE. Le conteneur passe aux rayons
   et le manifeste dit ce qu'il devrait contenir. Quand les deux disent la
   meme chose, on laisse filer. Des qu'ils se contredisent, on ouvre.

   LES QUATRE REGLES N'ARRIVENT PAS ENSEMBLE. Une borne qui demande de
   verifier quatre choses des la premiere caisse ne s'apprend pas, elle se
   subit : on regarde partout, on ne voit rien, on perd. Elles tombent
   donc une par une, par note de service, et chacune a le temps de devenir
   un reflexe avant que la suivante arrive.

     1. LA CACHETTE  — une masse dense que le manifeste ne declare pas.
     2. LE COMPTE    — le nombre de colis ne correspond pas.
     3. LA NATURE    — ce qu'on voit n'est pas ce qui est declare.
     4. LE PLOMB     — le numero du scelle ne correspond pas.

   LE CHRONO N'EST PAS UN COMPTE A REBOURS DE PLUS. C'est la file : il y a
   des camions derriere, et chacun qui attend trop coute. On ne gagne pas
   en etant rapide, on perd en etant lent — la nuance change tout, parce
   qu'elle laisse le droit de REGARDER quand il y a un doute.

   UN CONTENEUR PROPRE QU'ON OUVRE EST UNE FAUTE AU MEME TITRE qu'un
   conteneur sale qu'on laisse filer. Sans ca, la strategie gagnante
   serait d'ouvrir tout le monde, et il n'y aurait plus rien a lire.
   ===================================================================== */

var DO_FAUTES=3;                 /* les fautes tolerees */
var DO_SX=6,  DO_SW=58;          /* le scan : abscisse, largeur */
var DO_PX=68, DO_PW=56;          /* les papiers */
/* LES PANNEAUX VONT CHERCHER LES BOUTONS. A cent quatre pixels de haut,
   ils laissaient quatre-vingts pixels de bureau vide entre le bas du
   manifeste et le haut des boutons : l'ecran avait un trou en son milieu,
   et c'est precisement la que l'oeil se pose. */
var DO_HY=34, DO_HH=152;

/* LES NATURES DE MARCHANDISE. Quatre silhouettes qui ne se confondent
   pas : un carre, un cylindre debout, un anneau, une bosse. A quinze
   pixels de cote, c'est la FORME qui se lit, pas le detail. */
var DO_NAT=[
  {n:'CAISSES',  f:'caisse'},
  {n:'FÛTS',     f:'fut'},
  {n:'BOBINES',  f:'bobine'},
  {n:'SACS',     f:'sac'}
];
var DO_PORTS=['ALGER','TUNIS','BEYROUTH','ALEXANDRIE','GÊNES','VALENCE',
              'TANGER','ISTANBUL','PIRÉE','BARCELONE','ODESSA','HAÏFA'];
var DO_CABS=['#c2392c','#1f5e96','#d8d2c4','#2a6b4a','#d8a62a','#3a3f4c'];

/* LES QUATRE NOTES DE SERVICE, dans l'ordre ou elles tombent. */
var DO_REGLES=[
  {a:0,  t:'RÈGLE 1', m:'UNE MASSE DENSE NON DÉCLARÉE : OUVRE'},
  {a:4,  t:'RÈGLE 2', m:'LE NOMBRE DE COLIS DOIT CORRESPONDRE'},
  {a:9,  t:'RÈGLE 3', m:'LA NATURE DOIT CORRESPONDRE'},
  {a:15, t:'RÈGLE 4', m:'LE N° DE PLOMB DOIT CORRESPONDRE'}
];

MOTEUR.douane={
  nom:'La Douane', sous:'LE SCAN ET LES PAPIERS DOIVENT DIRE PAREIL',
  vise:150, pausable:true,

  init:function(){
    return {phase:'pret', t:0, score:0, L:130, H:281,
            box:null, vus:0, fautes:0, serie:0, saisies:0, laisses:0,
            regles:1, note:null, noteT:0,
            chrono:0, chronoMax:9000, file:5,
            mot:'', motT:0, motGros:false, verdict:null, verdictT:0,
            part:[], fini:0, enPause:false, recH:0, flash:0, flashC:'#ffe24a',
            scan:0};
  },

  cadre:function(s,L,H){ s.L=L;s.H=H; },

  demarrer:function(s){
    s.phase='jeu';s.t=0;s.score=0;s.vus=0;s.fautes=0;s.serie=0;
    s.saisies=0;s.laisses=0;s.regles=1;s.note=null;s.noteT=0;
    s.file=5;s.fini=0;s.enPause=false;s.flash=0;s.verdict=null;s.part=[];
    this.suivant(s);
    this.note(s,DO_REGLES[0]);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1500:1000;s.motGros=!!gros;},
  note:function(s,r){ s.note=r;s.noteT=2600; },

  /* =====================================================================
     UN CONTENEUR
     =====================================================================
     On tire d'abord ce qu'il CONTIENT, puis on ecrit le manifeste a
     partir de ca, et enfin on introduit au plus UN defaut — tire parmi
     les regles DEJA connues du joueur.

     UN SEUL DEFAUT A LA FOIS, et c'est une decision de conception : avec
     deux defauts, un joueur qui en repere un n'a aucune raison de
     chercher l'autre, et la borne devient plus facile a mesure qu'elle
     met plus de fautes. Avec un seul, il faut verifier TOUT ce qu'on
     sait avant de laisser passer.
     ===================================================================== */
  suivant:function(s){
    var nat=Math.floor(Math.random()*DO_NAT.length);
    var nb=3+Math.floor(Math.random()*7);          /* de trois a neuf colis */
    var plomb=1000+Math.floor(Math.random()*8999);
    var b={nat:nat, nb:nb, plomb:plomb, cache:false,
           dNat:nat, dNb:nb, dPlomb:plomb,
           port:DO_PORTS[Math.floor(Math.random()*DO_PORTS.length)],
           cab:Math.floor(Math.random()*DO_CABS.length),
           cx:Math.floor(Math.random()*9),
           num:String.fromCharCode(65+Math.floor(Math.random()*26))+
               String.fromCharCode(65+Math.floor(Math.random()*26))+
               'U '+(100000+Math.floor(Math.random()*899999)),
           sale:false, faute:''};

    /* LA PROPORTION DE SALES. Un tiers au debut, un sur deux ensuite :
       en dessous, on apprend que « laisse passer » est presque toujours
       juste et on arrete de lire ; au-dessus, on apprend l'inverse. */
    var tx=Math.min(0.50,0.33+s.vus*0.006);
    if(Math.random()<tx){
      var quoi=Math.floor(Math.random()*s.regles);
      b.sale=true;
      if(quoi===0){ b.cache=true; b.faute='UNE MASSE NON DÉCLARÉE'; }
      else if(quoi===1){
        /* l'ecart doit se VOIR : un colis d'ecart sur neuf ne se compte
           pas en deux secondes, deux au moins sur les gros lots */
        var d=(nb<=5?1:2)*(Math.random()<0.5?-1:1);
        b.dNb=Math.max(1,Math.min(9,nb+d));
        if(b.dNb===nb)b.dNb=nb+1;
        b.faute='LE COMPTE N’Y EST PAS';
      }
      else if(quoi===2){
        b.dNat=(nat+1+Math.floor(Math.random()*(DO_NAT.length-1)))%DO_NAT.length;
        b.faute='CE N’EST PAS CE QUI EST DÉCLARÉ';
      }
      else{
        /* un seul chiffre change, et jamais le premier : sinon on repere
           la faute a la longueur du nombre sans le lire */
        var str=(''+plomb).split('');
        var k=1+Math.floor(Math.random()*3);
        str[k]=''+((+str[k]+1+Math.floor(Math.random()*8))%10);
        b.dPlomb=+str.join('');
        if(b.dPlomb===plomb)b.dPlomb=(plomb+1)%10000;
        b.faute='LE PLOMB NE CORRESPOND PAS';
      }
    }
    s.box=b;
    s.chronoMax=Math.max(4200,9000-s.vus*180);
    s.chrono=s.chronoMax;
    s.scan=0;
  },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.noteT>0)s.noteT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.verdictT>0){s.verdictT-=dt;if(s.verdictT<=0)s.verdict=null;}
    s.scan+=dt;
    var i;
    for(i=s.part.length-1;i>=0;i--){
      var p=s.part[i];p.vie-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=0.00035*dt;
      if(p.vie<=0)s.part.splice(i,1);
    }
    if(s.phase!=='jeu'){
      if(s.fini>0){s.fini-=dt;if(s.fini<=0)this.fin(s);}
      return;
    }
    if(s.noteT>0)return;              /* la note de service fige la file */
    if(!s.box)return;
    s.chrono-=dt;
    if(s.chrono<=0) this.trancher(s,null);
  },

  /* ---- LA DECISION ----
     ouvrir : true pour OUVRE-LE, false pour LAISSE PASSER, null si le
     chrono a tranche a la place du joueur. */
  trancher:function(s,ouvrir){
    var b=s.box;
    if(!b)return;
    var juste=(ouvrir===null)?false:(ouvrir===b.sale);
    s.vus++;
    if(juste){
      s.serie++;
      /* LE TEMPS RESTANT NE PAIE QU'UN PEU. Une prime de vitesse forte
         pousserait a trancher sans lire, et c'est exactement ce que la
         borne ne doit pas recompenser. */
      var vite=Math.round(25*Math.max(0,s.chrono/s.chronoMax));
      var pts=40+vite+12*Math.min(5,s.serie);
      s.score+=pts;
      if(ouvrir){ s.saisies++;
        this.dire(s,'SAISIE · '+b.faute,true);
        s.flash=200;s.flashC='#ffe24a';
        this.etincelles(s,DO_SX+DO_SW/2,DO_HY+DO_HH/2,'#ffe24a',14);
      }else{ s.laisses++;
        this.dire(s,s.serie>2?('EN RÈGLE · SÉRIE ×'+s.serie):'EN RÈGLE',false);
        s.flash=130;s.flashC='#7fe0bc';
      }
      s.verdict={ok:true};
    }else{
      s.fautes++;s.serie=0;
      var m;
      if(ouvrir===null)m='TROP LONG · LE CAMION EST PARTI';
      else if(ouvrir)m='IL ÉTAIT EN RÈGLE';
      else m='TU AS LAISSÉ PASSER : '+b.faute;
      s.flash=280;s.flashC='#ff4a4a';
      this.dire(s,m+' · '+(DO_FAUTES-s.fautes)+' RESTANTE'+
                  (DO_FAUTES-s.fautes>1?'S':''),true);
      s.verdict={ok:false};
      this.etincelles(s,s.L/2,DO_HY+DO_HH/2,'#ff4a4a',14);
    }
    s.verdictT=600;
    if(s.fautes>=DO_FAUTES){
      this.dire(s,'TROIS FAUTES · TU RENDS LA PLAQUE',true);
      s.box=null;s.phase='rate';s.fini=1600;
      return;
    }
    /* ---- LA NOTE DE SERVICE SUIVANTE ---- */
    for(var i=s.regles;i<DO_REGLES.length;i++){
      if(s.vus>=DO_REGLES[i].a){ s.regles=i+1; this.note(s,DO_REGLES[i]); break; }
    }
    this.suivant(s);
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

  /* ================= LE DOIGT =================
     DEUX BOUTONS LARGES, EN BAS, LOIN L'UN DE L'AUTRE. C'est une borne ou
     l'erreur coute : un bouton qu'on touche de travers ne doit jamais
     pouvoir etre confondu avec l'autre. */
  zones:function(s){
    var by=s.H-58, bh=30;
    return {passer:{x:5, y:by, w:s.L/2-8, h:bh},
            ouvrir:{x:s.L/2+3, y:by, w:s.L/2-8, h:bh}};
  },
  dedans:function(z,x,y){return x>=z.x&&x<=z.x+z.w&&y>=z.y&&y<=z.y+z.h;},
  tape:function(s,x,y){
    if(s.enPause){s.enPause=false;return;}
    if(s.phase!=='jeu'||!s.box)return;
    if(s.noteT>0){s.noteT=0;return;}        /* un tap chasse la note */
    var z=this.zones(s);
    if(this.dedans(z.passer,x,y))this.trancher(s,false);
    else if(this.dedans(z.ouvrir,x,y))this.trancher(s,true);
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
  /* UN COLIS AUX RAYONS. Quatre silhouettes franches : un carre barre, un
     cylindre a deux cercles, un anneau, une bosse. Elles se distinguent a
     la FORME — aux rayons X tout est de la meme couleur. */
  colis:function(x,y,f,vif){
    var c=vif?'rgba(110,255,205,.55)':'rgba(60,220,170,.26)';
    var h=vif?'rgba(150,255,220,.85)':'rgba(90,255,200,.50)';
    if(f==='caisse'){
      R(x,y,13,11,c);R(x,y,13,1,h);R(x,y+10,13,1,h);
      R(x,y,1,11,h);R(x+12,y,1,11,h);
      R(x+1,y+5,11,1,h);
    }else if(f==='fut'){
      R(x+2,y,9,12,c);R(x+2,y,9,1,h);R(x+2,y+11,9,1,h);
      R(x+2,y+3,9,1,h);R(x+2,y+8,9,1,h);
    }else if(f==='bobine'){
      disque(x+6,y+6,6,c);disque(x+6,y+6,2,'rgba(8,20,16,.9)');
      R(x+1,y+5,11,1,h);
    }else{
      R(x+1,y+4,11,8,c);R(x+2,y+2,9,3,c);
      R(x+1,y+11,11,1,h);R(x+3,y+2,7,1,h);
    }
  },

  dessine:function(s,L,H){
    var i,b=s.box;
    /* ---- LE BUREAU, LA NUIT ---- */
    var gr=G.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,'#0e141d');gr.addColorStop(1,'#1a222e');
    G.fillStyle=gr;G.fillRect(0,0,L,H);
    /* la lampe au-dessus du plan de travail */
    R(L/2-13,16,26,4,'#2a2f3a');R(L/2-10,20,20,2,'#ffe8a8');
    G.fillStyle='rgba(255,232,168,.055)';
    G.beginPath();G.moveTo(L/2-10,22);G.lineTo(L/2+10,22);
    G.lineTo(L/2+34,DO_HY+DO_HH+8);G.lineTo(L/2-34,DO_HY+DO_HH+8);
    G.closePath();G.fill();

    /* =================== LE SCAN =================== */
    R(DO_SX,DO_HY,DO_SW,DO_HH,'#07150f');
    R(DO_SX,DO_HY,DO_SW,1,'#1f5a48');
    R(DO_SX,DO_HY,1,DO_HH,'#1f5a48');
    for(i=0;i<DO_HH;i+=3)R(DO_SX+1,DO_HY+i,DO_SW-2,1,'rgba(60,220,170,.045)');
    G.fillStyle='#2f8a70';G.font='5px ui-monospace,monospace';G.textAlign='left';
    G.fillText('SCAN',DO_SX+3,DO_HY+9);
    if(b){
      /* le numero du conteneur et le plomb REEL, sur la porte */
      G.fillStyle='#4fbf9c';G.font='4px ui-monospace,monospace';G.textAlign='right';
      G.fillText(b.num,DO_SX+DO_SW-3,DO_HY+9);
      /* LES COLIS, en grille de trois. On les place TOUJOURS dans le
         meme ordre : un rangement aleatoire obligeait a chercher avant de
         compter, et la borne mesurait alors la patience, pas l'oeil. */
      for(i=0;i<b.nb;i++){
        var cx=DO_SX+5+(i%3)*17, cy=DO_HY+16+Math.floor(i/3)*22;
        this.colis(cx,cy,DO_NAT[b.nat].f,false);
      }
      /* LA CACHETTE : une masse dense, opaque, entre les colis. Elle est
         rouge parce qu'un scanner de port colore ce qui est dense — et
         parce qu'il faut qu'elle se voie sans qu'on la cherche. */
      if(b.cache){
        var hx=DO_SX+7+(b.cx%3)*17, hy=DO_HY+18+Math.floor(b.cx/3)*22;
        hy=Math.min(hy,DO_HY+DO_HH-18);
        R(hx,hy,11,10,'rgba(200,60,50,.42)');
        R(hx+2,hy+2,7,6,'rgba(255,110,96,.75)');
        R(hx+4,hy+8,3,4,'rgba(255,110,96,.55)');
      }
      /* la ligne de balayage : elle dit que l'image est vivante */
      var sy=DO_HY+2+((s.scan*0.055)%(DO_HH-4));
      R(DO_SX+1,sy,DO_SW-2,1,'rgba(140,255,215,.45)');
      /* le plomb reel, en bas du scan */
      R(DO_SX+2,DO_HY+DO_HH-11,DO_SW-4,9,'rgba(31,90,72,.55)');
      G.fillStyle='#b8f0dc';G.font='bold 6px ui-monospace,monospace';
      G.textAlign='center';
      G.fillText('PLOMB '+b.plomb,DO_SX+DO_SW/2,DO_HY+DO_HH-4);
    }

    /* =================== LES PAPIERS =================== */
    R(DO_PX,DO_HY,DO_PW,DO_HH,'#e8e2d0');
    R(DO_PX,DO_HY,DO_PW,2,'#f6f2e6');
    R(DO_PX,DO_HY+DO_HH-1,DO_PW,1,'#a89f88');
    if(b){
      G.textAlign='left';
      G.fillStyle='#2a2f3a';G.font='bold 5px ui-monospace,monospace';
      G.fillText('MANIFESTE',DO_PX+3,DO_HY+9);
      R(DO_PX+3,DO_HY+11,DO_PW-6,1,'#8a8f9c');
      /* LES TROIS LIGNES QUI COMPTENT sont en gras et espacees ; tout le
         reste est du faux texte gris. Un manifeste entierement lisible
         ferait lire huit lignes pour en verifier trois. */
      G.fillStyle='#5a6070';G.font='4px ui-monospace,monospace';
      G.fillText('NAVIRE  MSC '+b.num.slice(0,2),DO_PX+3,DO_HY+18);
      G.fillText('PROVEN. '+b.port,DO_PX+3,DO_HY+25);
      /* LES TROIS LIGNES QUI COMPTENT SONT LOIN LES UNES DES AUTRES.
         Serrees, l'oeil les prend pour un bloc et les saute toutes les
         trois ; espacees, chacune se lit a son tour. */
      G.fillStyle='#1a1f28';G.font='bold 8px ui-monospace,monospace';
      G.fillText(DO_NAT[b.dNat].n,DO_PX+3,DO_HY+46);
      G.fillText('NB  '+b.dNb,DO_PX+3,DO_HY+70);
      G.fillStyle='#5a6070';G.font='4px ui-monospace,monospace';
      for(i=0;i<5;i++)R(DO_PX+3,DO_HY+80+i*7,24+((i*11)%22),1,'#a0a6b2');
      G.fillStyle='#1a1f28';G.font='bold 8px ui-monospace,monospace';
      G.fillText('PLOMB '+b.dPlomb,DO_PX+3,DO_HY+128);
      /* le tampon */
      R(DO_PX+DO_PW-21,DO_HY+DO_HH-14,18,11,'rgba(31,90,72,.18)');
      G.fillStyle='#1f5a48';G.font='bold 4px ui-monospace,monospace';
      G.textAlign='center';
      G.fillText('VISA',DO_PX+DO_PW-12,DO_HY+DO_HH-7);
    }

    /* =================== LES DEUX BOUTONS =================== */
    var z=this.zones(s);
    var vb=s.verdict;
    R(z.passer.x,z.passer.y,z.passer.w,z.passer.h,'#1f4a3e');
    R(z.passer.x,z.passer.y,z.passer.w,2,'#2f7a62');
    G.fillStyle='#7fe0bc';G.font='bold 7px ui-monospace,monospace';
    G.textAlign='center';
    G.fillText('LAISSE',z.passer.x+z.passer.w/2,z.passer.y+13);
    G.fillText('PASSER',z.passer.x+z.passer.w/2,z.passer.y+23);
    R(z.ouvrir.x,z.ouvrir.y,z.ouvrir.w,z.ouvrir.h,'#4a2020');
    R(z.ouvrir.x,z.ouvrir.y,z.ouvrir.w,2,'#8a3838');
    G.fillStyle='#f0a090';
    G.fillText('OUVRE',z.ouvrir.x+z.ouvrir.w/2,z.ouvrir.y+13);
    G.fillText('LE',z.ouvrir.x+z.ouvrir.w/2,z.ouvrir.y+23);

    /* =================== LA FILE ET LE CHRONO ===================
       LE CHRONO EST LA FILE. On ne gagne pas en etant rapide, on perd en
       etant lent : la nuance laisse le droit de regarder quand il y a un
       doute, et c'est ce droit-la qui fait qu'on lit. */
    var fy=H-24;
    R(0,fy,L,16,'#1b2029');R(0,fy,L,1,'#333b48');
    for(i=0;i<L;i+=14)R(i+3,fy+12,8,1,'rgba(226,240,255,.16)');
    var nf=Math.max(1,Math.min(4,Math.ceil((s.chrono/s.chronoMax)*4)));
    for(i=0;i<4;i++){
      var tx=3+i*31, cc=DO_CABS[(i+(b?b.cab:0))%DO_CABS.length];
      var vivant=i<nf;
      R(tx,fy+3,9,8,vivant?cc:'rgba(80,88,100,.35)');
      R(tx+6,fy+5,3,3,vivant?'#7fc8e8':'rgba(140,170,200,.3)');
      R(tx+9,fy+4,15,7,vivant?'#3a4150':'rgba(70,78,90,.35)');
      R(tx+9,fy+4,15,1,vivant?'#5a6475':'rgba(100,110,125,.3)');
      if(vivant)R(tx+11,fy+1,11,3,'#6a3a8a');
    }
    /* la barre du chrono, fine, sous les panneaux */
    var cwid=L-12, cf=Math.max(0,s.chrono/s.chronoMax);
    R(6,DO_HY+DO_HH+4,cwid,3,'rgba(255,255,255,.10)');
    R(6,DO_HY+DO_HH+4,Math.max(1,cwid*cf),3,
      cf<0.22?'#ff4a4a':cf<0.45?'#ff9a3a':'#5ad8ff');

    /* =================== LE CHROME =================== */
    R(0,0,L,14,'rgba(6,9,14,.72)');
    for(i=0;i<DO_FAUTES;i++)
      R(5+i*7,5,5,5,i<DO_FAUTES-s.fautes?'#5ad8ff':'rgba(255,255,255,.18)');
    G.font='bold 9px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#ffe24a';G.fillText(s.score.toLocaleString('fr-FR'),L-5,11);
    G.textAlign='center';G.font='6px ui-monospace,monospace';
    G.fillStyle=s.serie>2?'#7fe0bc':'#9fb4c8';
    G.fillText(s.serie>1?('SÉRIE ×'+s.serie):(s.vus+' CONTRÔLÉS'),L/2,10);
    /* les regles connues, en pastilles sous le chrono */
    G.textAlign='left';G.font='4px ui-monospace,monospace';
    for(i=0;i<DO_REGLES.length;i++){
      var on=i<s.regles;
      R(6+i*15,DO_HY-10,13,6,on?'rgba(90,216,255,.20)':'rgba(255,255,255,.06)');
      G.fillStyle=on?'#5ad8ff':'rgba(255,255,255,.18)';
      G.fillText('R'+(i+1),8+i*15,DO_HY-5);
    }

    /* ---- LES PARTICULES ---- */
    for(i=0;i<s.part.length;i++)R(s.part[i].x,s.part[i].y,1,1,s.part[i].c);

    /* ---- LE TAMPON DU VERDICT ---- */
    if(s.verdict){
      var a2=Math.min(1,s.verdictT/300);
      G.save();G.translate(L/2,DO_HY+DO_HH/2);G.rotate(-0.18);
      G.globalAlpha=a2;
      var col=s.verdict.ok?'#2f7a62':'#c23a2c';
      R(-30,-10,60,20,'rgba(6,9,14,.55)');
      R(-30,-10,60,2,col);R(-30,8,60,2,col);
      G.fillStyle=col;G.font='bold 12px ui-monospace,monospace';G.textAlign='center';
      G.fillText(s.verdict.ok?'JUSTE':'FAUTE',0,5);
      G.globalAlpha=1;G.restore();
    }

    /* ---- LA NOTE DE SERVICE ----
       Elle FIGE la file : une regle qui tombe pendant que le chrono tourne
       se lit en diagonale ou pas du tout, et on la decouvre en se prenant
       la faute qu'elle annonçait. */
    if(s.noteT>0&&s.note){
      var an=Math.min(1,s.noteT/500);
      G.fillStyle='rgba(6,9,14,'+(0.80*an).toFixed(2)+')';G.fillRect(0,0,L,H);
      var ny=H*0.34;
      R(10,ny-26,L-20,52,'rgba(232,226,208,'+(0.96*an).toFixed(2)+')');
      R(10,ny-26,L-20,3,'rgba(194,58,44,'+an.toFixed(2)+')');
      G.textAlign='center';
      G.fillStyle='rgba(42,47,58,'+an.toFixed(2)+')';
      G.font='bold 6px ui-monospace,monospace';
      G.fillText('NOTE DE SERVICE',L/2,ny-16);
      G.font='bold 10px ui-monospace,monospace';
      G.fillText(s.note.t,L/2,ny-2);
      G.font='bold 6px ui-monospace,monospace';
      var mm=s.note.m, tp0=6;
      G.font='bold '+tp0+'px ui-monospace,monospace';
      while(tp0>4&&G.measureText(mm).width>L-30){
        tp0-=0.5;G.font='bold '+tp0+'px ui-monospace,monospace';
      }
      G.fillText(mm,L/2,ny+12);
      G.fillStyle='rgba(90,96,112,'+an.toFixed(2)+')';
      G.font='5px ui-monospace,monospace';
      G.fillText('TAPE POUR REPRENDRE',L/2,ny+22);
    }

    /* ---- LE MOT ---- */
    if(s.motT>0&&s.mot&&s.noteT<=0){
      var a=Math.min(1,s.motT/400);
      var tp=s.motGros?9:8;
      G.font='bold '+tp+'px ui-monospace,monospace';
      while(tp>4&&G.measureText(s.mot).width>L-12){
        tp-=0.5;G.font='bold '+tp+'px ui-monospace,monospace';
      }
      var tw=G.measureText(s.mot).width, ty=H-66;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.70*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp,tw+10,tp+6);
      G.fillStyle=(s.motGros?'rgba(255,226,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }

    if(s.flash>0){
      var fc=s.flashC;
      G.fillStyle=(fc==='#ff4a4a'?'rgba(255,74,74,':fc==='#7fe0bc'?'rgba(127,224,188,':
                   'rgba(255,226,74,')+(s.flash/280*0.16).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT LA PARTIE ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.80)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText('LA DOUANE',L/2,H*0.26);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('LE SCAN À GAUCHE,',L/2,H*0.26+18);
      G.fillText('LES PAPIERS À DROITE',L/2,H*0.26+30);
      G.fillStyle='#9fb4c8';
      G.fillText('S’ILS DISENT PAREIL : LAISSE PASSER',L/2,H*0.26+48);
      G.fillText('S’ILS SE CONTREDISENT : OUVRE-LE',L/2,H*0.26+60);
      G.fillStyle='#7fe0bc';
      G.fillText('LES RÈGLES TOMBENT UNE PAR UNE,',L/2,H*0.26+78);
      G.fillText('PAR NOTE DE SERVICE',L/2,H*0.26+90);
      G.fillStyle='#ff9a5a';
      G.fillText('OUVRIR UN CONTENEUR EN RÈGLE,',L/2,H*0.26+108);
      G.fillText('C’EST UNE FAUTE AUSSI',L/2,H*0.26+120);
    }

    /* ---- APRES ---- */
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.80)';G.fillRect(0,H*0.26,L,76);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.vus+' CONTRÔLÉS',L/2,H*0.26+40);
      G.fillStyle='#9fb4c8';
      G.fillText(s.saisies+' SAISIE'+(s.saisies>1?'S':''),L/2,H*0.26+56);
      G.fillText('RÈGLE '+s.regles+' ATTEINTE',L/2,H*0.26+70);
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
    gr.addColorStop(0,'#0e141d');gr.addColorStop(1,'#1a222e');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    function r(x,y,ww,hh,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
      Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));}
    /* le scan, a gauche */
    r(4,6,w*0.42,h-12,'#07150f');r(4,6,w*0.42,1,'#1f5a48');
    for(var i=0;i<5;i++)for(var j=0;j<2;j++)
      r(9+j*(w*0.17),11+i*((h-22)/5),w*0.13,(h-26)/5,'rgba(60,220,170,.26)');
    /* la masse dense, et son cadre rouge */
    r(9+w*0.17,11+2*((h-22)/5),w*0.13,(h-26)/5,'rgba(255,110,96,.70)');
    g.strokeStyle='#ff5a5a';g.lineWidth=1;
    g.strokeRect(8+w*0.17,10+2*((h-22)/5),w*0.15,(h-22)/5);
    /* les papiers, a droite */
    r(w*0.52,6,w*0.44,h-12,'#e8e2d0');r(w*0.52,6,w*0.44,2,'#f6f2e6');
    for(i=0;i<6;i++)r(w*0.55,13+i*((h-24)/6),w*0.30+((i*7)%14),2,'#8a8f9c');
    r(w*0.55,h-16,w*0.16,5,'#1f5a48');
    if(grand){
      g.fillStyle='#ffe24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LA DOUANE',w-6,14);
    }
  }
};
