/* =====================================================================
   LE PORTIQUE — borne d'arcade du Battledock
   =====================================================================
   LE GESTE. Un doigt, n'importe ou sur l'ecran. Le chariot va et vient
   sous la poutre, le conteneur pend au bout du cable et se balance : on
   tape, il part. Tout le jeu est dans le choix de l'instant.

   LA CIBLE EST LA REMORQUE, ET C'EST TOUT LE CHANGEMENT. La premiere
   version faisait empiler une tour qui montait sans fin : le geste etait
   bon mais l'objectif etait abstrait — on empilait pour empiler. Un
   camion qui se gare sous le portique et qui attend donne au meme geste
   un enjeu lisible en une seconde : il y a un trou a remplir, il y a un
   chauffeur qui patiente, et il y a un quai qui se salit quand on rate.

   POURQUOI LE CAMION S'ARRETE AU LIEU DE ROULER. Une remorque qui defile
   aurait ajoute un deuxieme mouvement a anticiper, par-dessus le chariot
   et le pendule : trois horloges, c'est une devinette. Le camion se gare
   donc — mais JAMAIS AU MEME ENDROIT, et il ne patiente pas longtemps.
   La difficulte est dans la precision et dans la montre, pas dans le
   nombre de choses qui bougent.

   LE TAS DU FOND. Chaque conteneur rate est ramasse et pose au fond du
   quai, dans la cour. Le tas monte, il PENCHE, et il derive tout seul.
   Six ratages et le quai est plein ; un tas qui depasse l'aplomb et tout
   s'ecroule. Un CARREAU — un conteneur pose pile dans l'axe d'un trou —
   redresse le tas : le beau coup repare la betise, c'est ce qui fait
   qu'on vise au lieu de taper.

   LA CAMERA NE BOUGE PLUS. La version qui empilait devait suivre la tour
   et les jambes du portique sortaient du cadre. Maintenant la machine
   entiere tient dans l'ecran : la poutre en haut, les jambes, le quai, la
   voie du camion, la cour au fond. On voit toute la scene d'un coup, et
   c'est ce qui permet de lire la remorque.
   ===================================================================== */

var PQ_CW=38, PQ_CH=13;        /* le conteneur : large et plat, comme un vrai */
var PQ_CABLE=46;               /* la longueur du cable, en pixels de scene */
var PQ_PLEIN=6;                /* les ratages avant que le quai soit plein */
var PQ_CARREAU=3.4;            /* en deca, c'est un carreau */
var PQ_G=0.00050;              /* la gravite : une chute d'une seconde environ */

/* LA GEOMETRIE DU QUAI, en coordonnees monde (y vers le bas, 0 = le sol
   de la voie). Trois plans en profondeur, et c'est ce qui donne le port :
   la cour au fond, la voie du camion devant, l'eau tout en bas. */
var PQ_SOL=0;                  /* le sol de la voie : les roues y touchent */
var PQ_COUR=-19;               /* la cour, au fond : un plan plus haut a l'ecran */
var PQ_PLAT=-10;               /* le plateau de la remorque */
var PQ_CHAY=-152;              /* le chariot : fixe, la machine tient en entier */
var PQ_TASX=39;                /* l'aplomb du tas, dans la cour, a gauche */

/* LE CAMION. Une cabine, puis un ou deux emplacements de quarante pixels.
   Les bornes de garage sont calculees pour que CHAQUE emplacement reste
   dans la course du chariot : un trou qu'on ne peut pas survoler n'est
   pas un defi, c'est un bogue. */
var PQ_CAB=20;                 /* la longueur de la cabine */
var PQ_PAS=40;                 /* le pas d'un emplacement */
var PQ_VCAM=0.130;             /* la vitesse du camion sur la voie */
var PQ_POSE=0.60;              /* il faut etre a 60% de la largeur du trou */

/* HUIT COULEURS DE CONTENEUR, ET PAS UNE DE PLUS. Un tirage dans une
   palette large donne un tas bariole ou l'oeil ne distingue plus les
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

/* LES COULEURS DE CABINE. ELLES NE SONT PAS CELLES DES CONTENEURS, et
   c'est volontaire : une cabine violette tiree de la palette des boites
   se lisait comme un conteneur pose de travers. Le tracteur doit etre
   d'une autre famille de couleurs que sa charge, sinon on ne voit plus
   ou commence la remorque. */
var PQ_CABC=[
  {c:'#c2392c', h:'#e8604e', b:'#7c2018'},   /* le rouge de routier */
  {c:'#1f5e96', h:'#3f8ec8', b:'#143d62'},   /* le bleu */
  {c:'#d8d2c4', h:'#f4f0e6', b:'#8e8a7e'},   /* la creme */
  {c:'#2a6b4a', h:'#46996e', b:'#1a4630'},   /* le vert */
  {c:'#d8a62a', h:'#f4d070', b:'#8e6c16'},   /* le jaune */
  {c:'#3a3f4c', h:'#5e6676', b:'#23262f'}    /* le gris */
];

/* LES NOMS SUR LES PORTES. Un camion anonyme est un rectangle ; un
   camion qui porte un nom est quelqu'un qui attend. */
var PQ_NOMS=['J4','MOLE C','ARENC','SAUMATY','LA JOLIETTE','MOUREPIANE',
             'LE CAP','ESTAQUE','GRAVEUSE','PINEDE','LAZARET','DOCK 7'];

/* LES QUATRE COUPS DU PORT. Chacun porte un mot : sans le mot, le joueur
   voit le jeu devenir bizarre et croit a un bogue. */
var PQ_EVS=[
  {cle:'mistral', mot:'LE MISTRAL SE LEVE', duree:6200},
  {cle:'mouette', mot:'UNE MOUETTE S’EST POSEE', duree:4600},
  {cle:'siffle',  mot:'LE CONTREMAITRE SIFFLE', duree:6000},
  {cle:'corne',   mot:'CORNE DE BRUME', duree:1500}
];

MOTEUR.portique={
  nom:'Le Portique', sous:'VISE LA REMORQUE · NE REMPLIS PAS LE QUAI',
  vise:150, pausable:true,
  /* PAS DE MANCHE. Le jeu se joue a un doigt n'importe ou sur l'ecran :
     une manche volerait la moitie de la surface pour ne rien commander. */

  init:function(){
    return {phase:'pret', t:0, score:0, L:150, H:300,
            cha:{x:75, dir:1, v:0.055}, ph:0, amp:0,
            chute:null, penche:0, combo:0, carreaux:0,
            tas:0, blocs:[], charges:0, camions:0, partis:0,
            cam:null, repos:900, mot:'', motT:0, motGros:false,
            ev:null, evT:0, prochain:4, vent:0, mouette:0, secousse:0,
            debris:[], part:[], etoiles:null, fini:0, enPause:false,
            recH:0, flash:0, klaxon:0};
  },

  /* ================= LE CADRE =================
     La scene change de taille quand le telephone tourne : on recentre le
     chariot et on laisse le reste se recalculer tout seul — tout est
     exprime en fractions de la largeur ou en pixels absolus depuis le sol. */
  cadre:function(s,L,H){
    s.L=L;s.H=H;
    s.cha.x=Math.max(PQ_CW/2+6,Math.min(L-PQ_CW/2-6,s.cha.x));
    if(!s.etoiles){
      s.etoiles=[];
      for(var i=0;i<70;i++)s.etoiles.push({x:al(i*3.7)*L, y:al(i*7.1)*H,
                                           g:al(i*11.3)});
    }
  },

  demarrer:function(s){
    s.phase='jeu';s.t=0;s.score=0;s.debris=[];s.part=[];
    s.penche=0;s.combo=0;s.carreaux=0;s.tas=0;s.blocs=[];
    s.charges=0;s.camions=0;s.partis=0;
    s.chute=null;s.ev=null;s.evT=0;s.prochain=4;s.vent=0;s.mouette=0;
    s.secousse=0;s.fini=0;s.ph=0;s.amp=0;s.flash=0;s.enPause=false;
    s.klaxon=0;s.cam=null;s.repos=320;
    s.cha.x=s.L/2;s.cha.dir=1;
    this.dire(s,'CHARGE LE CAMION',false);
  },

  dire:function(s,m,gros){s.mot=m;s.motT=gros?1500:1000;s.motGros=!!gros;},

  /* le chariot ne bouge plus en hauteur : toute la machine est fixe */
  chaY:function(s){return PQ_CHAY;},
  /* le dessus du tas de la cour */
  tasY:function(s){return PQ_COUR-s.tas*PQ_CH;},

  /* =====================================================================
     LE CAMION
     =====================================================================
     TROIS ETATS ET PAS UN DE PLUS : il entre, il se gare, il repart. Une
     file d'attente avec des camions qui se suivent aurait mange l'ecran
     et brouille la cible ; un camion a la fois, et on sait ou viser.

     LE GARAGE EST TIRE AU SORT dans la plage ou tous ses emplacements
     restent sous la course du chariot. C'est la que vient la variete : le
     meme geste ne marche pas deux fois de suite. */
  nouveau:function(s){
    /* deux emplacements a partir du quatrieme camion : le conteneur de
       quarante pieds arrive quand le joueur sait deja viser */
    var n=(s.camions>=2&&Math.random()<0.52)?2:1;
    var larg=PQ_CAB+n*PQ_PAS;
    /* les bornes : le premier et le dernier trou doivent tenir dans la
       course du chariot, marge d'une demi-largeur de conteneur */
    var mn=Math.max(10, PQ_CW/2+8-PQ_CAB-PQ_PAS/2);
    var mx=Math.min(s.L-larg-10, s.L-PQ_CW/2-8-PQ_CAB-(n-0.5)*PQ_PAS);
    if(mx<mn)mx=mn;
    var x0=mn+Math.random()*(mx-mn);
    /* la patience se resserre : sept secondes au debut, trois et demie
       quand on a charge une trentaine de conteneurs */
    var pat=Math.max(3600, 7000-s.charges*110);
    s.camions++;
    return {x:-larg-14, x0:x0, n:n, larg:larg, etat:'entre',
            trous:n===2?[null,null]:[null],
            pat:pat, patMax:pat, nom:PQ_NOMS[Math.floor(Math.random()*PQ_NOMS.length)],
            cc:Math.floor(Math.random()*PQ_CABC.length), secoue:0, parfait:true};
  },
  /* l'aplomb d'un emplacement */
  trouX:function(c,j){return c.x+PQ_CAB+(j+0.5)*PQ_PAS;},
  /* le trou vide le plus proche d'une abscisse, ou -1 */
  trouPres:function(c,x){
    var best=-1,bd=1e9;
    for(var j=0;j<c.n;j++){
      if(c.trous[j])continue;
      var d=Math.abs(x-this.trouX(c,j));
      if(d<bd){bd=d;best=j;}
    }
    return best;
  },
  /* la cible du repere : le trou vide le plus a portee du chariot */
  cible:function(s){
    if(!s.cam||s.cam.etat==='sort')return null;
    var j=this.trouPres(s.cam,s.cha.x);
    return j<0?null:{j:j, x:this.trouX(s.cam,j)};
  },

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
    var q=this.lacher(s);
    var sol=(s.cam&&s.cam.etat!=='sort')?PQ_PLAT:PQ_SOL;
    var h=(sol-PQ_CH)-q.y;
    if(h<=0)return q.x;
    return q.x+q.vx*Math.sqrt(2*h/PQ_G);
  },

  /* ================= LE PAS ================= */
  pas:function(s,dt){
    s.t+=dt;
    if(s.motT>0)s.motT-=dt;
    if(s.flash>0)s.flash-=dt;
    if(s.klaxon>0)s.klaxon-=dt;
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
      if(d.y>PQ_SOL+160)s.debris.splice(i,1);
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

    /* ---- LE CAMION ---- */
    if(s.cam){
      var c=s.cam;
      if(c.secoue>0)c.secoue=Math.max(0,c.secoue-dt*0.004);
      if(c.etat==='entre'){
        /* IL FREINE AU LIEU DE S'ARRETER NET. Un camion qui pile en
           pleine course se lit comme un decor qui se teleporte ; le
           ralentissement sur les vingt derniers pixels donne le poids. */
        var reste=c.x0-c.x;
        var v=PQ_VCAM*Math.max(0.22,Math.min(1,reste/26));
        c.x+=v*dt;
        if(c.x>=c.x0-0.4){c.x=c.x0;c.etat='poste';c.secoue=0.7;s.klaxon=260;}
      }else if(c.etat==='poste'){
        c.pat-=dt;
        /* LE DERNIER TIERS KLAXONNE. On doit entendre la montre tourner
           avant qu'elle sonne, sinon le depart passe pour un caprice. */
        if(c.pat<c.patMax*0.33&&s.klaxon<=0&&Math.floor(c.pat/700)!==Math.floor((c.pat+dt)/700))
          s.klaxon=180;
        if(c.pat<=0)this.partir(s,false);
      }else{
        c.x+=PQ_VCAM*1.35*dt;
        /* les conteneurs charges voyagent avec la remorque */
        if(c.x>s.L+30){s.cam=null;s.repos=360;}
      }
    }else{
      s.repos-=dt;
      if(s.repos<=0)s.cam=this.nouveau(s);
    }

    /* ---- LE CHARIOT ----
       Il va et vient entre les deux jambes. Sa vitesse monte avec le
       nombre de conteneurs charges, et le sifflet du contremaitre la
       pousse encore. */
    var vit=0.042+Math.min(0.054,s.charges*0.0038);
    if(s.ev&&s.ev.cle==='siffle')vit*=1.75;
    var marge=PQ_CW/2+8;
    s.cha.x+=s.cha.dir*vit*dt;
    if(s.cha.x>s.L-marge){s.cha.x=s.L-marge;s.cha.dir=-1;}
    if(s.cha.x<marge){s.cha.x=marge;s.cha.dir=1;}
    s.cha.v=s.cha.dir*vit;

    /* ---- LE BALANCEMENT ----
       Nul pour les trois premiers conteneurs : on apprend d'abord a lire
       le chariot. Il entre ensuite et grandit, et la mouette le double. */
    var ampCible=s.charges<3?0:Math.min(0.38,(s.charges-2)*0.030);
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
      if(q.vy>0){
        /* ON TESTE DU PLUS HAUT AU PLUS BAS. Le plateau de la remorque est
           au-dessus du sol : un conteneur qui le survole doit s'y poser
           avant d'atteindre le quai, sinon il traverse le camion. */
        var cc=s.cam;
        if(cc&&cc.etat!=='sort'&&q.y+PQ_CH>=PQ_PLAT&&
           q.x>cc.x+PQ_CAB-PQ_CW*0.70&&q.x<cc.x+cc.larg+PQ_CW*0.70){
          var j=this.trouPres(cc,q.x);
          var dx=j<0?999:(q.x-this.trouX(cc,j));
          if(j>=0&&Math.abs(dx)<PQ_CW*PQ_POSE)this.charger(s,q,j,dx);
          else this.rater(s,q,PQ_PLAT,j<0?'PLEIN':'À CÔTÉ');
          s.chute=null;
        }
        else if(q.y+PQ_CH>=PQ_SOL){
          this.rater(s,q,PQ_SOL,'SUR LE QUAI');
          s.chute=null;
        }
      }
    }

    /* ---- LE PENCHANT DU TAS ----
       Il ne revient pas tout seul a zero : ce serait pardonner sans rien
       demander. Il DERIVE au contraire vers le dehors, comme un tas qui
       travaille — et seul un carreau le redresse.

       POURQUOI UNE DERIVE EXPONENTIELLE ET NON ACCELEREE. Le premier
       reglage accumulait une vitesse de penchant : la derive etait donc
       quadratique, et un tas a 0,44 s'ecroulait en moins d'une seconde.
       Mesure faite, c'etait injouable. Une croissance proportionnelle au
       penchant lui-meme double en douze secondes depuis la moitie, et
       laisse encore deux secondes pour placer le carreau qui sauve.

       LA ZONE MORTE. Sous un huitieme, rien ne bouge. Sans elle, un tas
       presque droit finissait par tomber tout seul au bout de deux
       minutes, et le joueur ne pouvait pas comprendre pourquoi. */
    if(s.tas>1&&Math.abs(s.penche)>0.12)
      s.penche+=(s.penche>0?1:-1)*Math.abs(s.penche)*0.000058*dt;
    if(Math.abs(s.penche)>=1){ this.ecrouler(s,'TOUT PAR TERRE'); return; }
  },

  /* ================= CHARGER, RATER, PARTIR ================= */
  charger:function(s,q,j,dx){
    var c=s.cam;
    var carreau=Math.abs(dx)<PQ_CARREAU;
    /* il glisse un peu a l'atterrissage : un bloc qui se colle pile ou on
       l'a lache rend la pose trop sage pour qu'on la craigne */
    c.trous[j]={c:Math.floor(al(s.charges*5.3)*8), dx:dx*0.80};
    s.charges++;
    c.secoue=Math.min(1,0.45+Math.abs(dx)*0.02);
    s.secousse=Math.min(1,s.secousse+0.30);
    this.poussiere(s,q.x,PQ_PLAT,8);

    if(carreau){
      s.combo++;s.carreaux++;
      /* LE REDRESSEMENT : c'est la recompense qui compte, bien plus que
         les points. Un joueur en difficulte sait qu'un beau coup le sauve,
         et il vise au lieu de taper au hasard.

         ET LE TAS SE REDRESSE. Mais il ne BAISSE pas : c'est le camion
         plein qui vide la cour, pas le carreau.

         LA MESURE QUI A TRANCHE. On a releve la duree pendant laquelle le
         repere reste a moins d'un carreau de l'axe : cent vingt-huit
         millisecondes au premier conteneur, trente-quatre a partir du
         vingtieme. Un humain reagit en une centaine de millisecondes : a
         ce rythme-la le carreau devient un coup de chance. Lui faire
         porter le seul moyen de degager la cour, c'etait retirer au joueur
         sa planche de salut au moment precis ou il en a besoin. Le carreau
         reste donc la prime d'adresse — points, serie, redressement — et
         le degagement passe au camion plein, qui lui reste atteignable :
         on se pose sur le plateau une fois sur trois meme au plus dur. */
      s.penche*=0.52;
      s.score+=60*Math.min(5,s.combo);
      this.dire(s, s.combo>1?('CARREAU ×'+s.combo):'CARREAU', true);
      this.etoiles(s,q.x,PQ_PLAT,'#ffe24a',16);
      s.flash=180;
    }else{
      s.combo=0;c.parfait=false;
      s.score+=25;
      if(Math.abs(dx)<7)this.dire(s,'BIEN',false);
    }
    s.score+=15;

    /* ---- LA REMORQUE EST PLEINE ---- */
    var plein=true;
    for(var k=0;k<c.n;k++)if(!c.trous[k])plein=false;
    if(plein)this.partir(s,true);
    else this.coup(s);
  },

  /* LE COUP DU PORT. On ne le tire qu'apres une pose : un evenement qui
     tombe pendant que le conteneur est en l'air serait un coup du sort. */
  coup:function(s){
    s.prochain--;
    if(s.prochain<=0&&!s.ev){
      var e=PQ_EVS[Math.floor(Math.random()*PQ_EVS.length)];
      s.ev=e;s.evT=e.duree;s.prochain=4+Math.floor(Math.random()*3);
      this.dire(s,e.mot,true);
      if(e.cle==='mouette')s.mouette=1;
      if(e.cle==='corne'){s.secousse=1;s.penche+=(Math.random()-0.5)*0.22;}
    }
  },

  /* LE DEPART. Plein : on encaisse, et le chargement sans faute vaut le
     double. Vide ou a moitie : chaque trou laisse vide est un conteneur
     de plus dans la cour — la faute suit le camion. */
  partir:function(s,plein){
    var c=s.cam;if(!c)return;
    c.etat='sort';s.klaxon=320;s.partis++;
    if(plein){
      var bonus=110*c.n*(c.parfait?2:1);
      s.score+=bonus;
      /* LE CAMION PLEIN DEGAGE LA COUR. Un conteneur de moins dans le tas,
         deux si le chargement etait sans faute : c'est la boucle de
         reparation du jeu, et elle reste a portee de main quand le
         balancement rend le carreau hasardeux. */
      var vide=c.parfait?2:1;
      while(vide-->0&&s.tas>0){
        s.tas--;s.blocs.pop();
        this.poussiere(s,PQ_TASX,this.tasY(s)+PQ_CH,12);
      }
      this.dire(s,c.parfait?'CHARGEMENT PARFAIT · +'+bonus:'EN ROUTE · +'+bonus,true);
      this.etoiles(s,c.x+c.larg/2,PQ_PLAT-6,'#5ad8ff',20);
    }else{
      var vides=0;
      for(var k=0;k<c.n;k++)if(!c.trous[k])vides++;
      s.combo=0;
      for(var v=0;v<vides;v++)this.monter(s,(Math.random()-0.5)*PQ_CW*0.5);
      if(s.phase!=='jeu')return;
      this.dire(s,'IL PART À VIDE · '+(PQ_PLEIN-s.tas)+' PLACE'+
                  (PQ_PLEIN-s.tas>1?'S':''),true);
    }
  },

  /* LE RATAGE. Le conteneur n'est pas efface : il s'ecrase la ou il est
     tombe, les debris partent, et les dockers le reposent dans la cour.
     Voir ou il part dit pourquoi on l'a rate, et c'est comme ca qu'on
     corrige. */
  rater:function(s,q,sol,mot){
    s.combo=0;
    s.debris.push({x:q.x,y:q.y,w:PQ_CW,h:PQ_CH,c:Math.floor(al(s.t)*8),
                   vx:q.vx*0.6+(q.x>s.L/2?0.03:-0.03),vy:-q.vy*0.22,
                   rot:q.rot,rotV:(q.x>s.L/2?1:-1)*0.0024});
    s.secousse=Math.min(1,s.secousse+0.5);
    this.poussiere(s,q.x,sol,16);
    if(s.cam&&s.cam.etat==='poste'&&sol===PQ_PLAT)s.cam.secoue=1;
    this.monter(s,q.vx*18);
    if(s.phase!=='jeu')return;
    this.dire(s,mot+' · '+(PQ_PLEIN-s.tas)+' PLACE'+
                (PQ_PLEIN-s.tas>1?'S':''),true);
    this.coup(s);
  },

  /* UN CONTENEUR DE PLUS DANS LA COUR. C'est le compteur de fautes, mais
     c'est un compteur qu'on VOIT : il monte, il penche, il finit par
     tomber tout seul. */
  monter:function(s,biais){
    var dec=Math.max(-9,Math.min(9,(biais||0)+(Math.random()-0.5)*7));
    s.blocs.push({x:PQ_TASX+dec*0.7, c:Math.floor(al(s.tas*7.1+s.t*0.001)*8)});
    s.tas++;
    s.penche+=(dec/(PQ_CW*0.5))*0.26+(Math.random()-0.5)*0.06;
    s.penche=Math.max(-1.4,Math.min(1.4,s.penche));
    if(s.tas>=PQ_PLEIN){ this.ecrouler(s,'LE QUAI EST PLEIN'); return; }
  },

  /* L'ECROULEMENT. Tout le tas devient des debris qui partent du cote ou
     il penchait : c'est la seule recompense d'une partie perdue, et elle
     doit etre genereuse — c'est ce qui fait relancer. */
  ecrouler:function(s,mot){
    var sens=s.penche>=0?1:-1;
    if(Math.abs(s.penche)<0.2)sens=(Math.random()<0.5?1:-1);
    for(var i=0;i<s.blocs.length;i++){
      var b=s.blocs[i], f=i/Math.max(1,s.blocs.length);
      s.debris.push({x:b.x,y:PQ_COUR-(i+1)*PQ_CH,w:PQ_CW,h:PQ_CH,c:b.c,
                     vx:sens*(0.012+f*0.085)*(0.7+Math.random()*0.6),
                     vy:-0.015-f*0.03,
                     rot:0,rotV:sens*(0.0008+f*0.0030)});
    }
    if(s.chute)s.debris.push({x:s.chute.x,y:s.chute.y,w:PQ_CW,h:PQ_CH,
                              c:0,vx:s.chute.vx,vy:s.chute.vy,rot:0,rotV:0.002});
    s.blocs=[];s.chute=null;
    s.secousse=1;
    this.poussiere(s,PQ_TASX,PQ_COUR,40);
    this.dire(s,mot,true);
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

  /* =====================================================================
     LE CAMION, EN PIXELS
     =====================================================================
     TOUT EST DANS LA CABINE. Une remorque est un rectangle : c'est la
     cabine qui dit qu'il y a quelqu'un dedans. Pare-brise eclaire, feu
     orange sur le toit, nom sur la porte, et les roues qui tournent quand
     il roule — six details, et le rectangle devient un camion. */
  dessinerCamion:function(s,c,oy){
    var sx=Math.round(c.x), sec=c.secoue>0?(Math.random()-0.5)*c.secoue*1.6:0;
    var sol=Math.round(PQ_SOL+oy+sec), plat=Math.round(PQ_PLAT+oy+sec);
    var C=PQ_CABC[c.cc%PQ_CABC.length];
    var i,j;

    /* l'ombre portee : ce qui pose le camion sur le sol au lieu de l'y
       faire flotter */
    R(sx+1,sol-1,c.larg,2,'rgba(0,0,0,.45)');

    /* ================= LA REMORQUE =================
       Un plateau, pas une caisse. La cible doit etre un TROU : si la
       remorque est fermee, le joueur ne voit pas ou se met le conteneur. */
    var dx0=sx+PQ_CAB, dl=c.n*PQ_PAS;
    R(dx0-3,plat,dl+5,4,'#333a47');              /* le longeron */
    R(dx0-3,plat,dl+5,1,'#596375');
    R(dx0-3,plat+4,dl+5,1,'#1d212a');
    for(i=2;i<dl;i+=7)R(dx0+i,plat+5,2,2,'#262b35');   /* les traverses */
    R(dx0-6,plat+1,4,3,'#2a2f3a');                     /* la sellette */

    /* LES EMPLACEMENTS VIDES. Un cadre pointille a la taille exacte du
       conteneur, pose sur le plateau : c'est le dessin qui dit « ici ».
       Un simple liseré sur le plancher ne se voyait pas — le joueur
       cherchait sa cible au lieu de viser. */
    for(j=0;j<c.n;j++){
      if(c.trous[j])continue;
      var tx=dx0+(j+0.5)*PQ_PAS, ty=plat-PQ_CH;
      /* les quatre verrous tournants, jaunes */
      R(tx-PQ_CW/2,plat-2,4,2,'#c8a22a');R(tx+PQ_CW/2-4,plat-2,4,2,'#c8a22a');
      /* le cadre pointille */
      for(i=0;i<PQ_CW;i+=3)R(tx-PQ_CW/2+i,ty,2,1,'rgba(122,206,240,.62)');
      for(i=0;i<PQ_CH;i+=3){
        R(tx-PQ_CW/2,ty+i,1,2,'rgba(122,206,240,.52)');
        R(tx+PQ_CW/2-1,ty+i,1,2,'rgba(122,206,240,.52)');
      }
      /* les deux chevrons qui montrent l'axe */
      R(tx-1,ty+4,3,2,'rgba(122,206,240,.75)');
      R(tx-3,ty+6,7,1,'rgba(122,206,240,.45)');
    }
    /* ---- LES CONTENEURS DEJA CHARGES ---- */
    for(j=0;j<c.n;j++){
      var t=c.trous[j];
      if(!t)continue;
      this.conteneur(dx0+(j+0.5)*PQ_PAS+t.dx, plat-PQ_CH, PQ_CW, PQ_CH,
                     t.c, t.dx*0.005);
    }

    /* ================= LE TRACTEUR =================
       Vingt pixels de large, vingt-six de haut : plus haut qu'un
       conteneur, donc on le reconnait comme la tete du convoi. Il regarde
       a droite — c'est le sens de la marche. */
    var ct=sol-26;
    R(sx+1,ct+4,PQ_CAB-2,14,C.c);                /* le capot et la porte */
    R(sx+1,ct+4,PQ_CAB-2,1,C.h);
    R(sx+2,ct,PQ_CAB-6,5,C.c);                   /* la couchette */
    R(sx+2,ct,PQ_CAB-6,1,C.h);
    R(sx+1,ct+4,1,14,C.h);R(sx+PQ_CAB-2,ct+4,1,14,C.b);
    R(sx+1,ct+17,PQ_CAB-2,1,C.b);
    R(sx+2,ct+18,PQ_CAB-4,4,'#23262f');          /* le bas de caisse */
    /* le pare-brise : deux pixels de ciel dedans, et la cabine s'allume */
    R(sx+PQ_CAB-9,ct+6,7,6,'#7fc8e8');
    R(sx+PQ_CAB-9,ct+6,7,1,'#cdf0ff');
    R(sx+PQ_CAB-8,ct+9,2,2,'#3a5a70');           /* le chauffeur */
    /* la calandre, le phare, le clignotant */
    R(sx+PQ_CAB-2,ct+13,2,8,'#1d212a');
    R(sx+PQ_CAB-2,ct+14,2,3,'#ffe8a8');
    R(sx+PQ_CAB-2,ct+19,2,2,'#f09030');
    /* le pot d'echappement, derriere la cabine */
    R(sx+PQ_CAB-4,ct-4,2,8,'#5e6676');
    R(sx+PQ_CAB-4,ct-5,2,1,'#8a93a4');
    /* le gyrophare : il clignote tant que le camion attend */
    R(sx+4,ct-2,4,2,(c.etat==='poste'&&Math.floor(s.t/320)%2===0)?'#ffc24a':'#6a5424');
    /* le nom, trois lettres : au-dela, ca deborde de la porte et ca fait
       une tache. Trois lettres se lisent et suffisent a personnaliser. */
    G.fillStyle='rgba(12,14,20,.60)';
    G.font='4px ui-monospace,monospace';G.textAlign='left';
    G.fillText(c.nom.slice(0,3),sx+3,ct+15);

    /* ================= LES ROUES =================
       Elles tournent : deux rayons qui pivotent avec l'avance. Sans ca, un
       camion qui roule glisse comme un decor qu'on fait defiler. */
    var roues=[sx+4,sx+PQ_CAB-5];
    for(j=0;j<c.n;j++){roues.push(dx0+(j+1)*PQ_PAS-13);
                       roues.push(dx0+(j+1)*PQ_PAS-5);}
    var ro=(c.etat==='poste')?0:(c.x*0.14);
    for(i=0;i<roues.length;i++){
      var rx=Math.round(roues[i]);
      disque(rx,sol-4,4,'#15181f');
      disque(rx,sol-4,2,'#454c5c');
      var a=ro+i;
      R(rx+Math.cos(a)*2.4-0.5,sol-4+Math.sin(a)*2.4-0.5,1,1,'#8a93a4');
      R(rx-Math.cos(a)*2.4-0.5,sol-4-Math.sin(a)*2.4-0.5,1,1,'#8a93a4');
    }

    /* ================= LA PATIENCE =================
       Une barre courte au-dessus de la CABINE, et pas sur la longueur du
       convoi. Etalee sur tout le camion, elle faisait une poutre noire en
       travers de la scene : on la prenait pour un element du decor, et
       elle coupait le quai en deux. Au-dessus de la cabine, elle appartient
       visiblement au chauffeur qui attend.

       Elle rougit puis clignote : on voit la montre tourner, donc le
       depart n'est jamais une injustice. */
    if(c.etat==='poste'){
      var f=Math.max(0,c.pat/c.patMax), bw=PQ_CAB+8;
      R(sx-2,ct-10,bw,3,'rgba(8,11,16,.78)');
      R(sx-2,ct-10,bw,1,'rgba(255,255,255,.12)');
      var bc=f<0.22?'#ff4a4a':f<0.45?'#ff9a3a':'#5ad8ff';
      if(f<0.22&&Math.floor(s.t/140)%2===0)bc='#ffe24a';
      R(sx-1,ct-9,Math.max(1,(bw-2)*f),1,bc);
    }
  },

  /* LE CONTENEUR DU FOND. Le tas de la cour est DERRIERE le camion : s'il
     garde ses couleurs pleines, l'oeil le met au meme plan et croit que la
     pile est posee sur la remorque. On l'assombrit donc vers le bleu de
     nuit — c'est la perspective aerienne, et ca suffit a reculer le tas
     d'un plan sans rien changer a la geometrie. */
  fondu:function(h,f){
    var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
    r=Math.round(r*(1-f)+0x16*f);g=Math.round(g*(1-f)+0x23*f);b=Math.round(b*(1-f)+0x3a*f);
    return 'rgb('+r+','+g+','+b+')';
  },
  conteneurFond:function(x,y,w,h,ci){
    var C=PQ_COUL[ci%8], f=0.46;
    R(x-w/2,y,w,h,this.fondu(C.c,f));
    R(x-w/2,y,w,1,this.fondu(C.h,f));
    R(x-w/2,y+h-1,w,1,this.fondu(C.b,f));
    for(var k=1;k<w/4;k++)R(x-w/2+k*4,y+2,1,h-3,this.fondu(C.b,f));
    R(x-w/2,y+2,1,h-3,this.fondu(C.h,f));
  },

  dessine:function(s,L,H){
    var i,j;
    /* LE MONDE EST FIXE. On pose une fois l'offset qui amene le sol a
       quarante-six pixels du bas, et tout le reste se dessine en
       coordonnees monde : plus de camera, plus de recadrage, plus de mal
       de mer. */
    var oy=H-38;
    var sec=s.secousse>0?(Math.random()-0.5)*s.secousse*2.2:0;

    /* ---- LE CIEL ---- */
    var gr=G.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,'#0b1220');gr.addColorStop(0.55,'#16243a');
    gr.addColorStop(1,'#1d3350');
    G.fillStyle=gr;G.fillRect(0,0,L,H);
    /* LA LUNE, posee une fois pour toutes en haut a gauche : elle donne un
       point fixe au-dessus de la machine. */
    disque(L*0.18,H*0.11,7,'#f2eede');
    disque(L*0.18-2.5,H*0.11-2,6,'#0f1b2c');
    if(s.etoiles)for(i=0;i<s.etoiles.length;i++){
      var e=s.etoiles[i];
      if(e.y<H*0.62)R(e.x,e.y,e.g>0.82?2:1,1,e.g>0.6?'#cfe4ff':'#7f93ae');
    }
    /* =====================================================================
       LE FOND : LE NAVIRE ET LES GRUES
       =====================================================================
       LE VIDE ETAIT LE VRAI DEFAUT. Avec la camera fixe, le milieu de
       l'ecran n'est plus traverse par une pile qui monte : il reste
       soixante pixels de bleu nuit entre la poutre et le quai, et le jeu
       avait l'air inachevé. On y met ce qui doit y etre — le porte-
       conteneurs qu'on decharge. Il explique d'ou vient le conteneur,
       il remplit le cadre, et il ne coute rien : c'est un decor plat,
       sans collision, dessine une fois par image en six rectangles.

       IL EST SOMBRE EXPRES. Tout ce qui est au fond doit perdre son
       contraste, sinon l'oeil le confond avec le tas de la cour — qui,
       lui, compte. */
    var cy0=PQ_COUR+oy;
    var pont=cy0-34;                    /* le pont du navire */

    /* les grues du quai d'en face, tres loin */
    for(i=0;i<4;i++){
      var gx2=12+i*((L-24)/3), gh=30+((i*17)%14);
      R(gx2-1,pont-gh,3,gh,'#0e1826');          /* le mat */
      R(gx2-16,pont-gh,32,2,'#0e1826');         /* la fleche */
      R(gx2-12,pont-gh+2,1,5,'#0e1826');
      R(gx2+10,pont-gh+2,1,5,'#0e1826');
      R(gx2,pont-gh-5,2,5,'#0e1826');           /* le contrepoids */
      if(i%2===0)R(gx2,pont-gh-7,2,2,'#ff6a5a');/* le feu de balisage */
    }

    /* LE NAVIRE. Deux rangs de conteneurs sur le pont, puis la coque qui
       descend derriere la cour. Les rangs sont tires d'un bruit
       deterministe : le meme navire a chaque image, donc pas de
       scintillement, et un profil irregulier qui ne se lit pas comme une
       frise. */
    R(-4,pont,L+8,cy0-pont,'#121b2a');          /* la coque */
    R(-4,pont,L+8,2,'#1e2b3e');                 /* le plat-bord */
    /* LES RANGS SUR LE PONT. Des blocs larges et peu nombreux : la
       premiere version en posait un tous les treize pixels avec un liseré
       clair en haut et en bas, et la rangee se lisait comme une facade
       d'immeuble avec ses fenetres. Un conteneur de fond n'a droit qu'a
       UN liseré — celui du dessus — et a rien d'autre. */
    for(i=-2;i<L;i+=19){
      var nr=1+Math.floor(al(i*0.37)*3);        /* un a trois rangs */
      for(var rr=0;rr<nr;rr++){
        R(i+1,pont-(rr+1)*9,17,8,rr%2?'#1a2738':'#1f3047');
        R(i+1,pont-(rr+1)*9,17,1,'#273b55');
      }
    }
    /* le chateau, a tribord : c'est lui qui dit « navire » et pas « mur ».
       Pas de rangees de hublots — elles faisaient un immeuble de bureaux. */
    R(L*0.76,pont-34,18,34,'#141c29');
    R(L*0.76,pont-34,18,1,'#2a3c54');
    R(L*0.76+2,pont-30,14,8,'#20334a');         /* la passerelle, une bande */
    R(L*0.76+7,pont-41,4,7,'#141c29');          /* la cheminee */
    R(L*0.76+7,pont-42,4,1,'#ff6a5a');

    G.save();G.translate(sec,sec*0.6);

    /* ---- LA COUR, AU FOND ----
       Un plan plus haut a l'ecran, donc plus loin : c'est la que les
       dockers reposent ce qu'on a rate. Le bord eclaire dit la marche. */
    R(0,cy0,L,12,'#20242e');
    R(0,cy0,L,1,'#4a5160');
    for(i=0;i<L;i+=9)R(i,cy0+1,1,11,'#191c24');
    /* le marquage de la cour, la ou le tas se depose */
    R(PQ_TASX-PQ_CW/2-2,cy0-1,PQ_CW+4,1,'rgba(255,226,74,.30)');
    R(PQ_TASX-PQ_CW/2-2,cy0-1,1,2,'rgba(255,226,74,.30)');
    R(PQ_TASX+PQ_CW/2+1,cy0-1,1,2,'rgba(255,226,74,.30)');

    /* ---- LA VOIE DU CAMION, DEVANT ---- */
    var sy=PQ_SOL+oy;
    R(0,cy0+12,L,sy-cy0-12,'#272b35');       /* le tablier entre les deux */
    R(0,sy-4,L,4,'#343947');                 /* la bande de roulement */
    R(0,sy-5,L,1,'#5a6273');
    /* les traits de la voie, un peu uses */
    for(i=4;i<L;i+=16)if((i*7)%11<8)R(i,sy-2,8,1,'rgba(226,240,255,.22)');

    /* ---- L'EAU, TOUT EN BAS ---- */
    R(0,sy,L,H-sy,'#16293c');
    R(0,sy,L,2,'#2e3340');R(0,sy+2,L,1,'#555c6b');
    for(i=0;i<L;i+=6)R(i,sy+6+((i*7)%9),4,1,'#23415c');

    /* ---- LE PORTIQUE, EN ENTIER ----
       Les jambes descendent jusqu'au quai : la machine tient dans l'ecran
       et on comprend qu'on charge sous elle. */
    var cy=this.chaY(s)+oy;
    R(8,cy-8,7,sy-cy+8,'#8e2c24');
    R(L-15,cy-8,7,sy-cy+8,'#8e2c24');
    R(8,cy-8,7,1,'#c0463a');R(L-15,cy-8,7,1,'#c0463a');
    R(8,cy-8,1,sy-cy+8,'#c0463a');R(L-9,cy-8,1,sy-cy+8,'#6e1f19');
    /* les socles sur rail */
    R(5,sy-7,13,7,'#4a5160');R(L-18,sy-7,13,7,'#4a5160');
    R(5,sy-7,13,1,'#6e7889');R(L-18,sy-7,13,1,'#6e7889');
    /* la poutre */
    R(4,cy-16,L-8,9,'#a8352b');
    R(4,cy-16,L-8,2,'#d4564a');
    R(4,cy-8,L-8,1,'#6e1f19');
    /* le feu de balisage */
    if(Math.floor(s.t/700)%2===0)R(L/2-1,cy-19,2,3,'#ff6a5a');

    /* ---- LE TAS DE LA COUR, PENCHE ----
       On fait tourner tout le tas autour de son pied : des blocs qui
       penchent chacun de leur cote ne se liraient pas comme un ensemble
       qui va tomber. */
    if(s.tas>0){
      G.save();
      G.translate(PQ_TASX,cy0);
      G.rotate(s.penche*0.14);
      G.translate(-PQ_TASX,-cy0);
      for(i=0;i<s.blocs.length;i++){
        var b=s.blocs[i];
        this.conteneurFond(b.x,cy0-(i+1)*PQ_CH,PQ_CW,PQ_CH,b.c);
      }
      G.restore();
    }

    /* ---- LE CAMION ---- */
    if(s.cam)this.dessinerCamion(s,s.cam,oy);

    /* ---- LE CHARIOT, LE CABLE, LE CONTENEUR PENDU ---- */
    var ang=s.amp*Math.sin(s.ph);
    R(s.cha.x-10,cy-7,20,7,'#d8b43a');
    R(s.cha.x-10,cy-7,20,1,'#f4dc80');
    R(s.cha.x-8,cy,3,2,'#4a4a52');R(s.cha.x+5,cy,3,2,'#4a4a52');
    if(!s.chute&&s.phase==='jeu'){
      var bx=s.cha.x+Math.sin(ang)*PQ_CABLE, by=cy+Math.cos(ang)*PQ_CABLE;
      /* LE CABLE EN PIXELS, PAS EN TRAIT. Un stroke d'un pixel se perdait
         sur le bleu de nuit : a la capture on voyait un conteneur flotter
         sous une grue sans rien pour l'y relier. */
      for(var kc=0;kc<=18;kc++){
        var fc=kc/18;
        R(s.cha.x+(bx-s.cha.x)*fc, cy+2+(by-1-(cy+2))*fc, 1, 2, '#aab4c4');
      }
      R(bx-5,by-3,10,3,'#6a7280');R(bx-5,by-3,10,1,'#8c95a4');
      this.conteneur(bx,by,PQ_CW,PQ_CH,(s.charges+s.tas)%8,ang*0.5);
      /* LA MOUETTE POSEE DESSUS. Elle n'empeche rien, elle double le
         balancement — et on la voit, donc on comprend pourquoi ca remue. */
      if(s.mouette>0){
        var mx=bx+6, my=by-5;
        R(mx-5,my-2,10,4,'#f4f4f0');R(mx-6,my-1,3,2,'#f4f4f0');
        R(mx+4,my-5,4,4,'#f4f4f0');R(mx+7,my-4,3,1,'#f0a830');
        R(mx+6,my-4,1,1,'#14161c');
        R(mx-3,my-3,7,1,'#c8ccd4');
      }
      /* LE REPERE D'ARRIVEE. Il ne reste pas sous le conteneur : il part
         en diagonale vers l'endroit ou celui-ci va reellement se poser.
         C'est le seul moyen de voir la derive — donc de l'anticiper.

         IL NE S'EFFACE JAMAIS. Un jeu de precision a besoin de son
         repere. Sous le mistral il palit, parce qu'il devient faux. */
      var cib=this.cible(s), ax=this.arrivee(s);
      var ay=(cib?PQ_PLAT:PQ_SOL)+oy;
      var pale=(s.ev&&s.ev.cle==='mistral')?0.22:0.5;
      var y0=by+PQ_CH+2;
      for(var k=1;k<=26;k++){
        var f=k/26;
        R(bx+(ax-bx)*f, y0+(ay-y0)*f, 1, 3, 'rgba(255,226,74,'+pale.toFixed(2)+')');
      }
      /* DEUX MARQUES, PAS UNE. L'encoche jaune dit ou le conteneur va
         tomber ; le trait blanc dit ou est l'axe du trou. Avec la seule
         encoche on voyait bien un repere flotter quelque part, sans
         pouvoir juger de combien on etait a cote — or c'est exactement
         l'ecart qu'il faut annuler. */
      /* LES DEUX MARQUES SONT AU MEME ENDROIT, SUR LE PLATEAU. La
         premiere version posait la marque blanche douze pixels au-dessus
         du trou : a la capture, on voyait un petit T gris flotter en
         l'air, sans rapport visible avec le trait jaune pose plus bas. On
         ne peut pas juger un ecart entre deux reperes qui ne sont pas a la
         meme hauteur — c'est pourtant cet ecart qu'il faut annuler. */
      if(cib){
        R(cib.x,ay-11,1,9,'rgba(226,240,255,.70)');
        R(cib.x-3,ay-13,7,2,'rgba(226,240,255,.70)');
      }
      R(ax-PQ_CW/2,ay-2,PQ_CW,1,'rgba(255,226,74,'+(pale+0.3).toFixed(2)+')');
      R(ax,ay-7,1,6,'rgba(255,226,74,'+(pale+0.3).toFixed(2)+')');
      if(cib&&Math.abs(ax-cib.x)<PQ_CARREAU){
        R(ax-4,ay-9,9,3,'#ffe24a');R(ax-7,ay-2,15,1,'#ffe24a');
      }
    }

    /* ---- LE CONTENEUR EN CHUTE ---- */
    if(s.chute)this.conteneur(s.chute.x,s.chute.y,PQ_CW,PQ_CH,
                              (s.charges+s.tas)%8,s.chute.rot);

    /* ---- LES DEBRIS ---- */
    for(i=0;i<s.debris.length;i++){
      var dd=s.debris[i];
      this.conteneur(dd.x,dd.y+(dd.y<PQ_SOL?oy:oy),dd.w,dd.h,dd.c,dd.rot);
    }

    /* ---- LES PARTICULES ---- */
    for(i=0;i<s.part.length;i++){
      var pp=s.part[i];
      R(pp.x,pp.y+oy,pp.r,pp.r,pp.c);
    }

    /* ---- LE MISTRAL ----
       Des traits horizontaux qui filent : on doit VOIR le vent, sinon une
       chute qui derive passe pour un bogue. */
    if(s.ev&&s.ev.cle==='mistral'){
      var sens=s.vent>=0?1:-1;
      for(i=0;i<16;i++){
        var wy=((s.t*0.22+i*63)%(H+40))-20;
        var wx=((s.t*(0.30+ (i%3)*0.08)*sens+i*97)%(L+80))-40;
        R(wx,wy,12+((i*5)%10),1,'rgba(180,214,255,.30)');
      }
      G.fillStyle='rgba(180,214,255,.75)';
      G.font='bold 7px ui-monospace,monospace';G.textAlign='center';
      G.fillText(sens>0?'VENT →':'← VENT',L/2,H-10);
    }
    G.restore();

    /* =================== LE CHROME ===================
       Tout ce qui informe tient en haut et en bas, jamais au milieu : le
       milieu, c'est la ou on regarde tomber le conteneur. */

    /* ---- LE NIVEAU A BULLE : le penchant du tas ----
       Une jauge qui part du centre vers les deux cotes. Elle rougit avant
       la faute, donc elle previent au lieu de constater. */
    var pw=Math.round(L*0.56), px0=Math.round((L-pw)/2);
    R(px0,5,pw,7,'rgba(0,0,0,.55)');
    R(px0+pw/2,5,1,7,'rgba(255,255,255,.35)');
    var pf=Math.max(-1,Math.min(1,s.penche));
    var dang=Math.abs(pf);
    var pc=dang>0.78?'#ff4a4a':dang>0.5?'#ff9a3a':'#5ad8ff';
    var bw2=Math.max(2,Math.abs(pf)*pw/2);
    R(pf>=0?px0+pw/2:px0+pw/2-bw2,6,bw2,5,pc);
    if(dang>0.78&&Math.floor(s.t/160)%2===0){
      G.fillStyle='#ff4a4a';G.font='bold 7px ui-monospace,monospace';
      G.textAlign='center';G.fillText('LE TAS PENCHE',L/2,22);
    }

    /* ---- LES PLACES QUI RESTENT DANS LA COUR, en gouttes ---- */
    for(i=0;i<PQ_PLEIN;i++)
      R(6+i*7,6,5,5,i<PQ_PLEIN-s.tas?'#5ad8ff':'rgba(255,255,255,.18)');

    /* ---- LE SCORE ET LE COMPTE ---- */
    G.font='bold 9px ui-monospace,monospace';G.textAlign='right';
    G.fillStyle='#ffe24a';G.fillText(s.score.toLocaleString('fr-FR'),L-5,13);
    G.font='7px ui-monospace,monospace';G.fillStyle='#9fb4c8';
    G.fillText(s.charges+' CHARGÉS',L-5,22);
    G.textAlign='left';
    G.fillStyle='#9fb4c8';G.fillText('CAMION '+Math.max(1,s.camions),6,22);

    /* ---- LE COMBO ---- */
    if(s.combo>1){
      G.textAlign='center';G.font='bold 8px ui-monospace,monospace';
      G.fillStyle='#ffe24a';G.fillText('SÉRIE ×'+s.combo,L/2,34);
    }

    /* ---- LE MOT ----
       LE MOT TIENT DANS L'ECRAN, QUOI QU'IL DISE. « CORNE DE BRUME » en
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
      var tw=G.measureText(s.mot).width, ty=H*0.26;
      G.textAlign='center';
      G.fillStyle='rgba(6,9,14,'+(0.55*a).toFixed(2)+')';
      G.fillRect((L-tw)/2-5,ty-tp,tw+10,tp+6);
      G.fillStyle=(s.motGros?'rgba(255,226,74,':'rgba(207,228,242,')+a.toFixed(2)+')';
      G.fillText(s.mot,L/2,ty);
    }

    /* ---- LE KLAXON ----
       Deux arcs au-dessus de la cabine quand le camion se gare ou s'en
       va : le son qu'on ne peut pas jouer, on le dessine. */
    if(s.klaxon>0&&s.cam){
      var ka=Math.min(1,s.klaxon/160);
      var kx=Math.round(s.cam.x+6), ky=Math.round(PQ_SOL+oy-36);
      G.fillStyle='rgba(255,226,74,'+(ka*0.9).toFixed(2)+')';
      G.font='bold 8px ui-monospace,monospace';G.textAlign='left';
      G.fillText('POUET',kx+14,ky);
    }

    /* ---- L'ECLAIR DU CARREAU ---- */
    if(s.flash>0){
      G.fillStyle='rgba(255,226,74,'+(s.flash/180*0.14).toFixed(3)+')';
      G.fillRect(0,0,L,H);
    }

    /* ---- AVANT LA PARTIE ---- */
    if(s.phase==='pret'){
      G.fillStyle='rgba(6,9,14,.74)';G.fillRect(0,0,L,H);
      G.textAlign='center';
      G.font='bold 14px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText('LE PORTIQUE',L/2,H*0.32);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText('TAPE N’IMPORTE OÙ POUR LÂCHER',L/2,H*0.32+18);
      G.fillStyle='#9fb4c8';
      G.fillText('POSE-LE SUR LA REMORQUE',L/2,H*0.32+34);
      G.fillText('PILE DANS L’AXE = CARREAU',L/2,H*0.32+46);
      G.fillText('UN CAMION PLEIN DÉGAGE LA COUR',L/2,H*0.32+58);
      G.fillStyle='#ff9a5a';
      G.fillText('SIX RATÉS ET LE QUAI EST PLEIN',L/2,H*0.32+76);
    }

    /* ---- APRES ---- */
    if(s.phase==='fini'){
      G.fillStyle='rgba(6,9,14,.76)';G.fillRect(0,H*0.26,L,74);
      G.textAlign='center';
      G.font='bold 13px ui-monospace,monospace';G.fillStyle='#ffe24a';
      G.fillText(s.score.toLocaleString('fr-FR')+' PTS',L/2,H*0.26+22);
      G.font='8px ui-monospace,monospace';G.fillStyle='#cfe4f2';
      G.fillText(s.charges+' CHARGÉS · '+s.carreaux+' CARREAUX',L/2,H*0.26+40);
      G.fillStyle='#9fb4c8';
      G.fillText(s.partis+' CAMION'+(s.partis>1?'S':'')+' PARTI'+
                 (s.partis>1?'S':''),L/2,H*0.26+58);
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
    for(var i=0;i<26;i++)r(((i*37)%w),((i*23)%(h*0.45)),1,1,'#8aa0bd');
    /* le quai */
    r(0,h-9,w,9,'#272b35');r(0,h-10,w,1,'#5a6273');
    /* le portique en entier */
    r(w*0.08,h*0.14,5,h*0.76,'#8e2c24');r(w*0.86,h*0.14,5,h*0.76,'#8e2c24');
    r(w*0.04,h*0.10,w*0.88,6,'#a8352b');r(w*0.04,h*0.10,w*0.88,2,'#d4564a');
    r(w*0.44,h*0.18,14,5,'#d8b43a');
    /* le cable et le conteneur pendu */
    for(var k=0;k<=10;k++)r(w*0.48,h*0.23+k*(h*0.22)/10,1,2,'#aab4c4');
    var CP=PQ_COUL[1], cw=w*0.26, ch=Math.max(4,h*0.11);
    r(w*0.48-cw/2,h*0.45,cw,ch,CP.c);r(w*0.48-cw/2,h*0.45,cw,1,CP.h);
    for(var n=1;n<cw/5;n++)r(w*0.48-cw/2+n*5,h*0.45+1,1,ch-2,CP.b);
    /* LE CAMION : c'est lui le sujet de la borne, il doit etre dans la
       vignette de la salle — sinon on croit encore a un jeu d'empilage. */
    var tx=w*0.26, ty=h-11, tc=PQ_COUL[0];
    r(tx,ty-7,w*0.13,7,tc.c);r(tx,ty-7,w*0.13,1,tc.h);
    r(tx+w*0.11,ty-6,w*0.035,3,'#8ad4f0');
    r(tx+w*0.13,ty-4,w*0.30,3,'#3a4150');
    r(tx+w*0.13,ty-4,w*0.30,1,'#5a6475');
    var C2=PQ_COUL[3], w2=w*0.26, h2=Math.max(4,h*0.11);
    r(tx+w*0.16,ty-4-h2,w2,h2,C2.c);r(tx+w*0.16,ty-4-h2,w2,1,C2.h);
    for(var m=1;m<w2/5;m++)r(tx+w*0.16+m*5,ty-3-h2,1,h2-2,C2.b);
    for(var q=0;q<4;q++)g.fillStyle='#1a1d24',
      g.fillRect(Math.round(tx+4+q*w*0.11),Math.round(ty-2),3,3);
    if(grand){
      g.fillStyle='#ffe24a';g.font='bold 10px ui-monospace,monospace';
      g.textAlign='right';g.fillText('LE PORTIQUE',w-6,14);
    }
  }
};
