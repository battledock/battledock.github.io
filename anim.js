/**
 * anim.js — Moteur d'animation Battle Dock v2
 * =============================================
 * Tweens, particules, sprite sheets, transitions écran
 * S'intègre automatiquement avec Render (auto-draw sur les couches)
 *
 * API principale :
 *   Anim.maj(dt)                           — mise à jour globale (appeler chaque frame)
 *   Anim.tween(obj, {x:100}, {duree:0.5})  — animer des propriétés
 *   Anim.emetteur({x,y,debit,...})          — créer un émetteur de particules
 *   Anim.feuille(img, largF, hautF)         — découper une sprite sheet
 *   Anim.animateur(feuille)                 — lecteur de séquences
 *   Anim.transition('fondu', 0.5, cbMilieu) — transition d'écran
 */
window.Anim=(function(){
'use strict';

/* ============================================================
   COURBES D'INTERPOLATION
   ============================================================ */
const COURBES={
  linear:t=>t,
  easeIn:t=>t*t,
  easeOut:t=>t*(2-t),
  easeInOut:t=>t<.5?2*t*t:-1+(4-2*t)*t,
  easeInCubic:t=>t*t*t,
  easeOutCubic:t=>(--t)*t*t+1,
  easeInOutCubic:t=>t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1,
  bounce:t=>{
    const n=7.5625,d=2.75;
    if(t<1/d)return n*t*t;
    if(t<2/d)return n*(t-=1.5/d)*t+.75;
    if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;
    return n*(t-=2.625/d)*t+.984375;
  },
  elastic:t=>t===0||t===1?t
    :-Math.pow(2,10*(t-1))*Math.sin((t-1.1)*5*Math.PI),
  back:t=>{const s=1.70158;return t*t*((s+1)*t-s);},
  backOut:t=>{const s=1.70158;return(t-=1)*t*((s+1)*t+s)+1;},
};

function courbe(nom){return COURBES[nom]||COURBES.linear;}


/* ============================================================
   TWEENS — animation de propriétés numériques
   ============================================================ */
const tweens=[];

/**
 * Animer les propriétés d'un objet
 * @param {Object} obj — cible
 * @param {Object} props — {propriété: valeurFinale, ...}
 * @param {Object} opts — {duree, courbe, delai, fin, maj, boucle, yoyo}
 * @returns {{stop, pause, resume}}
 */
function tween(obj,props,opts){
  opts=opts||{};
  const tw={
    obj,
    props:{},
    duree:opts.duree||0.3,
    _courbe:opts.courbe||'easeOut',
    delai:opts.delai||0,
    t:0,
    actif:true,
    _pause:false,
    fin:opts.fin||null,
    maj:opts.maj||null,
    boucle:!!opts.boucle,
    yoyo:!!opts.yoyo,
    _sens:1,
  };
  for(const k in props) tw.props[k]={de:obj[k],vers:props[k]};
  tweens.push(tw);
  return{
    stop(){tw.actif=false;},
    pause(){tw._pause=true;},
    resume(){tw._pause=false;},
  };
}

/** Arrêter tous les tweens sur un objet */
function stopTweens(obj){
  for(let i=tweens.length-1;i>=0;i--)
    if(tweens[i].obj===obj) tweens[i].actif=false;
}

function _majTweens(dt){
  for(let i=tweens.length-1;i>=0;i--){
    const tw=tweens[i];
    if(!tw.actif){tweens.splice(i,1);continue;}
    if(tw._pause) continue;
    if(tw.delai>0){tw.delai-=dt;continue;}

    tw.t+=dt*tw._sens;
    let prog=Math.max(0,Math.min(1,tw.t/tw.duree));
    const ease=courbe(tw._courbe)(prog);

    /* Appliquer les valeurs interpolées */
    for(const k in tw.props){
      const p=tw.props[k];
      tw.obj[k]=p.de+(p.vers-p.de)*ease;
    }
    if(tw.maj) tw.maj(prog);

    /* Gestion fin / boucle / yoyo */
    if(prog>=1){
      if(tw.yoyo){
        tw._sens=-1;tw.t=tw.duree;
        /* yoyo sans boucle : termine après l'aller-retour */
      } else if(tw.boucle){
        tw.t=0;
        for(const k in tw.props) tw.obj[k]=tw.props[k].de;
      } else {
        tw.actif=false;if(tw.fin)tw.fin();
      }
    } else if(tw.yoyo&&prog<=0&&tw._sens<0){
      if(tw.boucle){tw._sens=1;tw.t=0;}
      else{tw.actif=false;if(tw.fin)tw.fin();}
    }
  }
}

/**
 * Chaîner plusieurs tweens (séquence)
 * @param {Array} etapes — [{obj, props, opts}, ...]
 * @returns {{stop}}
 */
function sequence(etapes){
  let idx=0;
  const handle={actif:true,stop(){handle.actif=false;}};
  function suivant(){
    if(!handle.actif||idx>=etapes.length) return;
    const e=etapes[idx++];
    const opts=Object.assign({},e.opts||{});
    const finOrig=opts.fin;
    opts.fin=()=>{if(finOrig)finOrig();suivant();};
    tween(e.obj,e.props,opts);
  }
  suivant();
  return handle;
}


/* ============================================================
   PARTICULES — émetteurs configurables avec auto-draw
   ============================================================ */
const emetteurs=[];

function _rand(v){
  if(Array.isArray(v)) return v[0]+(v[1]-v[0])*Math.random();
  return v;
}
function _pick(v){
  if(Array.isArray(v)) return v[Math.floor(Math.random()*v.length)];
  return v;
}

/**
 * Créer un émetteur de particules
 * @param {Object} cfg
 *   x,y            — position (nombre ou getter ()=>nombre)
 *   debit           — particules/seconde
 *   dureeVie        — [min,max] secondes
 *   vitesse         — [min,max] px/s
 *   angle           — [min,max] radians (0=droite, PI/2=bas)
 *   graviteX/Y      — accélération px/s²
 *   tailleDebut/Fin — taille en px (interpolation sur la vie)
 *   couleurs        — ['rgba(...)'] couleurs possibles
 *   alphaDebut/Fin  — opacité (interpolation sur la vie)
 *   forme           — 'carre'|'cercle'
 *   couche          — nom de couche Render pour auto-draw ('effets')
 *   max             — max particules simultanées
 */
function emetteur(cfg){
  const em={
    x:cfg.x||0,
    y:cfg.y||0,
    debit:cfg.debit||10,
    dureeVie:cfg.dureeVie||[0.5,1.5],
    vitesse:cfg.vitesse||[20,60],
    angle:cfg.angle||[0,Math.PI*2],
    graviteX:cfg.graviteX||0,
    graviteY:cfg.graviteY||0,
    tailleDebut:cfg.tailleDebut!=null?cfg.tailleDebut:3,
    tailleFin:cfg.tailleFin!=null?cfg.tailleFin:0,
    couleurs:cfg.couleurs||['rgba(200,200,200,.6)'],
    alphaDebut:cfg.alphaDebut!=null?cfg.alphaDebut:1,
    alphaFin:cfg.alphaFin!=null?cfg.alphaFin:0,
    forme:cfg.forme||'carre',
    couche:cfg.couche||'effets',
    max:cfg.max||100,
    actif:true,
    _acc:0,
    _p:[],
  };

  /** Émettre des particules selon le débit */
  em._emettre=function(dt){
    if(!em.actif) return;
    em._acc+=dt*em.debit;
    while(em._acc>=1&&em._p.length<em.max){
      em._acc--;
      const a=_rand(em.angle);
      const v=_rand(em.vitesse);
      const ex=typeof em.x==='function'?em.x():em.x;
      const ey=typeof em.y==='function'?em.y():em.y;
      em._p.push({
        x:ex,y:ey,
        vx:Math.cos(a)*v,vy:Math.sin(a)*v,
        vie:0,maxVie:_rand(em.dureeVie),
        col:_pick(em.couleurs),
      });
    }
    if(em._acc>1) em._acc=0;
  };

  /** Mettre à jour les particules vivantes */
  em._maj=function(dt){
    for(let i=em._p.length-1;i>=0;i--){
      const p=em._p[i];
      p.vie+=dt;
      if(p.vie>=p.maxVie){em._p.splice(i,1);continue;}
      p.vx+=em.graviteX*dt;
      p.vy+=em.graviteY*dt;
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
    }
  };

  /** Dessiner les particules */
  em._dessiner=function(ctx,cx,cy){
    for(let i=0;i<em._p.length;i++){
      const p=em._p[i];
      const t=p.vie/p.maxVie;
      const sz=em.tailleDebut+(em.tailleFin-em.tailleDebut)*t;
      const al=em.alphaDebut+(em.alphaFin-em.alphaDebut)*t;
      if(al<=0||sz<=0) continue;
      const px=p.x-cx,py=p.y-cy;
      ctx.globalAlpha=al;
      ctx.fillStyle=p.col;
      if(em.forme==='cercle'){
        ctx.beginPath();ctx.arc(px,py,sz/2,0,6.3);ctx.fill();
      } else {
        ctx.fillRect(px-sz/2|0,py-sz/2|0,Math.ceil(sz),Math.ceil(sz));
      }
    }
    ctx.globalAlpha=1;
  };

  /** Émission instantanée de n particules */
  em.burst=function(n){
    const sav=em.debit;em.debit=1;
    em._acc+=n;em._emettre(0);em.debit=sav;
  };

  em.stop=function(){em.actif=false;};
  em.reprendre=function(){em.actif=true;};
  em.vider=function(){em._p.length=0;};

  /** Détruire l'émetteur (retirer de la liste globale) */
  em.detruire=function(){
    em.actif=false;em._p.length=0;
    const idx=emetteurs.indexOf(em);
    if(idx>=0) emetteurs.splice(idx,1);
  };

  Object.defineProperty(em,'count',{get(){return em._p.length;}});

  emetteurs.push(em);
  return em;
}


/* ============================================================
   SPRITE SHEETS — découpe + séquences d'animation
   ============================================================ */

/**
 * Créer une feuille de sprites
 * @param {Image|Canvas} source — image source
 * @param {number} lf — largeur d'une frame
 * @param {number} hf — hauteur d'une frame
 */
function feuille(source,lf,hf){
  const cols=Math.floor(source.width/lf);
  const seqs={};

  return{
    source,lf,hf,cols,

    /** Définir une séquence nommée */
    sequence(nom,frames,opts){
      opts=opts||{};
      seqs[nom]={frames,fps:opts.fps||8,boucle:opts.boucle!==false};
      return this;
    },

    /** Accéder à une séquence */
    seq(nom){return seqs[nom];},

    /** Dessiner une frame par son index global */
    dessinerFrame(ctx,idx,x,y,flipX){
      const col=idx%cols,row=Math.floor(idx/cols);
      if(flipX){
        ctx.save();ctx.scale(-1,1);
        ctx.drawImage(source,col*lf,row*hf,lf,hf,-x-lf,y,lf,hf);
        ctx.restore();
      } else {
        ctx.drawImage(source,col*lf,row*hf,lf,hf,x,y,lf,hf);
      }
    },
  };
}

/**
 * Créer un animateur (lecteur de séquences)
 * @param {Object} f — feuille de sprites
 */
function animateur(f){
  let seqNom=null,seq=null,temps=0,idx=0,fini=false;

  return{
    /** Jouer une séquence (ne redémarre pas si déjà en cours) */
    jouer(nom,forcer){
      if(seqNom===nom&&!forcer) return;
      seq=f.seq(nom);seqNom=nom;temps=0;idx=0;fini=false;
    },

    /** Mettre à jour (avancer les frames) */
    maj(dt){
      if(!seq||fini) return;
      temps+=dt;
      const duree=1/seq.fps;
      while(temps>=duree){
        temps-=duree;
        idx++;
        if(idx>=seq.frames.length){
          if(seq.boucle){idx=0;}
          else{idx=seq.frames.length-1;fini=true;}
        }
      }
    },

    /** Dessiner la frame courante */
    dessiner(ctx,x,y,flipX){
      if(!seq) return;
      f.dessinerFrame(ctx,seq.frames[idx],x,y,flipX);
    },

    get frame(){return seq?seq.frames[idx]:0;},
    get termine(){return fini;},
    get nom(){return seqNom;},
    get frameIdx(){return idx;},
  };
}


/* ============================================================
   TRANSITIONS ÉCRAN — fondu, flash
   ============================================================ */
let _trans=null;

/**
 * Lancer une transition d'écran
 * @param {'fondu'|'flash'} type
 * @param {number} duree — durée totale (s)
 * @param {Function} milieu — callback quand l'écran est couvert
 * @param {Function} fin — callback quand la transition est terminée
 * @param {string} couleur — couleur (#000, rgba(...), etc.)
 */
function transition(type,duree,milieu,fin,couleur){
  _trans={
    type:type||'fondu',
    duree:duree||0.6,
    t:0,
    milieu:milieu||null,
    fin:fin||null,
    couleur:couleur||'#000',
    phase:0,
  };
}

function _majTransition(dt){
  if(!_trans) return;
  _trans.t+=dt;
  const prog=Math.min(1,_trans.t/_trans.duree);

  /* Appeler le callback milieu une seule fois */
  if(_trans.phase===0&&prog>=0.5){
    _trans.phase=1;
    if(_trans.milieu)_trans.milieu();
  }

  /* Fin */
  if(prog>=1){
    const fn=_trans.fin;
    _trans=null;
    if(fn)fn();
    return;
  }

  /* Dessiner l'overlay de transition */
  if(window.Render){
    let alpha;
    if(_trans.type==='flash'){
      /* Flash : pic d'opacité rapide puis fondu */
      alpha=prog<0.2?prog*5:Math.max(0,(1-prog)/0.8);
    } else {
      /* Fondu : montée puis descente symétrique */
      alpha=prog<0.5?prog*2:(1-prog)*2;
    }
    const col=_trans.couleur;
    Render.dessinerSur('hud',(ctx,vw,vh)=>{
      ctx.globalAlpha=alpha;
      ctx.fillStyle=col;
      ctx.fillRect(0,0,vw+2,vh+2);
      ctx.globalAlpha=1;
    });
  }
}


/* ============================================================
   CACHE IMAGES
   ============================================================ */
const _cache={};

/** Charger une image avec cache (retourne une Promise) */
function chargerImage(nom,src){
  return new Promise(res=>{
    if(_cache[nom]){res(_cache[nom]);return;}
    const img=new Image();
    img.onload=()=>{_cache[nom]=img;res(img);};
    img.onerror=()=>res(null);
    img.src=src;
  });
}

/** Enregistrer un canvas/image dans le cache */
function enregistrerImage(nom,source){_cache[nom]=source;}

/** Récupérer une image du cache */
function image(nom){return _cache[nom]||null;}


/* ============================================================
   MISE À JOUR GLOBALE — appeler chaque frame avec dt
   ============================================================ */
function maj(dt){
  /* Tweens */
  _majTweens(dt);

  /* Émetteurs de particules + auto-draw sur Render */
  for(let i=emetteurs.length-1;i>=0;i--){
    const em=emetteurs[i];
    em._emettre(dt);
    em._maj(dt);
    if(window.Render&&em.couche&&em._p.length){
      const ref=em;
      Render.dessinerSur(em.couche,(ctx,cx,cy)=>ref._dessiner(ctx,cx,cy));
    }
  }

  /* Transition écran */
  _majTransition(dt);
}


/* ============================================================
   API PUBLIQUE
   ============================================================ */
return{
  /* Courbes */
  courbe,
  COURBES,

  /* Tweens */
  tween,
  stopTweens,
  sequence,

  /* Particules */
  emetteur,

  /* Sprites */
  feuille,
  animateur,

  /* Transitions */
  transition,

  /* Images */
  chargerImage,
  enregistrerImage,
  image,

  /* Global */
  maj,

  /* État (lecture seule) */
  get tweensActifs(){return tweens.length;},
  get emetteurs(){return emetteurs;},
  get transEnCours(){return!!_trans;},
};
})();
