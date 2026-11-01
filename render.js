/**
 * render.js — Moteur de rendu Battle Dock v2
 * ==========================================
 * Couches : sol → ombres → entités (tri-Y) → effets → météo → lumière → hud
 * DPR pixel-perfect, caméra fluide + shake, culling, cycle jour/nuit, debug FPS
 *
 * API principale :
 *   Render.init(canvasId, mondeW, mondeH, {zoom?, camLisse?})
 *   Render.frame(dt)             — rendu d'une frame
 *   Render.camSuivre(cible, dt)  — suivi caméra (cible = {x,y})
 *   Render.camSecouer(force, dur) — tremblement caméra
 *   Render.setSol(canvas)         — sol pré-rendu
 *   Render.ajouterEntite(id, {x,y,w?,h?,ySort,draw(ctx,cx,cy)})
 *   Render.dessinerSur(couche, fn|{ySort,draw})  — dessin one-frame
 *   Render.visible(x,y,w,h)      — test de culling
 *   Render.setHeure(h)            — heure du cycle jour/nuit (0-24)
 */
window.Render=(function(){
'use strict';

/* ===== ÉTAT INTERNE ===== */
let cv,ctx;
let ECH=1,ECH_CSS=1,VW=0,VH=0;
let MONDE_W=0,MONDE_H=0;
let solCanvas=null;
let _largeurVue=0;

/* ===== CONFIG ===== */
const cfg={
  zoom:1.35,
  camLisse:0.0008,  /* exponentiel : plus petit = plus lisse */
  camSaut:0.6,      /* fraction viewport pour saut instantané */
};

/* ===== CAMÉRA ===== */
const cam={x:null,y:null,
  _sX:0,_sY:0,   /* offset secousse actuel */
  _sT:0,_sF:0,_sD:0  /* timer, force, durée secousse */
};

/* ===== COUCHES ===== */
/*  type: static  = sol pré-rendu (drawImage)
 *        queue   = file de callbacks vidée chaque frame
 *        ysort   = comme queue mais trié par ySort
 *        overlay = callback unique (météo, lumière)
 *        screen  = espace écran (HUD, pas de décalage caméra)
 */
const COUCHES_DEF=[
  {nom:'sol',     z:0,type:'static'},
  {nom:'ombres',  z:1,type:'queue'},
  {nom:'entites', z:2,type:'ysort'},
  {nom:'effets',  z:3,type:'queue'},
  {nom:'meteo',   z:4,type:'overlay'},
  {nom:'lumiere', z:5,type:'overlay'},
  {nom:'hud',     z:6,type:'screen'},
];
const couches={};

/* ===== ENTITÉS (persistantes, tri-Y automatique) ===== */
const entites=new Map();

/* ===== JOUR/NUIT ===== */
let heure=12;
let cyclePause=false;

/* ===== DEBUG ===== */
const debug={fps:false,grille:false,_frames:0,_t:0,_val:0};


/* ============================================================
   INIT
   ============================================================ */
function init(canvasId,mondeW,mondeH,opts){
  cv=document.getElementById(canvasId);
  ctx=cv.getContext('2d');
  MONDE_W=mondeW;MONDE_H=mondeH;

  if(opts){
    if(opts.zoom!=null) cfg.zoom=opts.zoom;
    if(opts.camLisse!=null) cfg.camLisse=opts.camLisse;
  }

  /* Créer les couches */
  COUCHES_DEF.forEach(d=>{
    couches[d.nom]={
      nom:d.nom, z:d.z, type:d.type,
      visible:true, items:[], drawFn:null, alpha:1
    };
  });

  _resize();

  /* Auto-resize (ignore soft-keyboard sur mobile) */
  _largeurVue=window.innerWidth;
  window.addEventListener('resize',()=>{
    if(window.innerWidth===_largeurVue)return;
    _largeurVue=window.innerWidth;_resize();
  });

  return api;
}


/* ============================================================
   RESIZE — DPR + zoom pixel-perfect
   ============================================================ */
function _resize(){
  const w=window.innerWidth, h=window.innerHeight;
  const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  const base=Math.min(w,h)/220;
  ECH=Math.max(1,Math.min(Math.round(4*dpr),Math.round(base*cfg.zoom*dpr)));
  ECH_CSS=ECH/dpr;
  VW=Math.ceil(w/ECH_CSS)+1;
  VH=Math.ceil(h/ECH_CSS)+1;
  cv.width=Math.round(VW*ECH);
  cv.height=Math.round(VH*ECH);
  cv.style.width=(VW*ECH_CSS)+'px';
  cv.style.height=(VH*ECH_CSS)+'px';
  cv.style.marginLeft=Math.round((w-VW*ECH_CSS)/2)+'px';
  cv.style.marginTop=Math.round((h-VH*ECH_CSS)/2)+'px';
  ctx.setTransform(ECH,0,0,ECH,0,0);
  ctx.imageSmoothingEnabled=false;
}


/* ============================================================
   CAMÉRA — suivi exponentiel + secousse
   ============================================================ */
function camSuivre(cible,dt){
  /* Cible centrée avec clamping (gère viewport > monde) */
  const cx=VW>=MONDE_W?(MONDE_W-VW)/2
    :Math.max(0,Math.min(MONDE_W-VW,cible.x-VW/2));
  const cy=VH>=MONDE_H?(MONDE_H-VH)/2
    :Math.max(0,Math.min(MONDE_H-VH,cible.y-VH/2));

  if(cam.x===null){cam.x=cx;cam.y=cy;return;}

  /* Saut instantané si trop loin */
  if(Math.abs(cx-cam.x)>VW*cfg.camSaut||Math.abs(cy-cam.y)>VH*cfg.camSaut){
    cam.x=cx;cam.y=cy;return;
  }

  /* Lissage exponentiel */
  const k=1-Math.pow(cfg.camLisse,dt);
  cam.x+=(cx-cam.x)*k;
  cam.y+=(cy-cam.y)*k;
}

function camSecouer(force,duree){
  cam._sF=force;cam._sD=duree||0.3;cam._sT=0;
}

function _majSecousse(dt){
  if(cam._sT>=cam._sD){cam._sX=cam._sY=0;return;}
  cam._sT+=dt;
  const att=1-cam._sT/cam._sD;
  const f=cam._sF*att;
  /* Bruit pseudo-aléatoire (pas besoin de déterminisme ici) */
  cam._sX=(Math.random()*2-1)*f;
  cam._sY=(Math.random()*2-1)*f;
}

/** Téléporter la caméra instantanément */
function camTeleporter(x,y){
  cam.x=x;cam.y=y;
}


/* ============================================================
   CULLING — test de visibilité (marge 32px anti pop-in)
   ============================================================ */
function visible(x,y,w,h){
  if(cam.x===null) return true;
  const cx=cam.x|0, cy=cam.y|0, M=32;
  return !(x+w<cx-M||x>cx+VW+M||y+h<cy-M||y>cy+VH+M);
}


/* ============================================================
   SOL — canvas pré-rendu
   ============================================================ */
function setSol(c){solCanvas=c;}


/* ============================================================
   ENTITÉS — objets persistants avec tri-Y automatique
   {x, y, w?, h?, ySort, draw(ctx, camX, camY)}
   x,y peuvent être des getters pour suivre un objet mobile
   ============================================================ */
function ajouterEntite(id,ent){entites.set(id,ent);}
function retirerEntite(id){entites.delete(id);}
function entite(id){return entites.get(id);}


/* ============================================================
   FILE DE DESSIN — callbacks one-frame par couche

   Pour couches queue/screen :
     Render.dessinerSur('effets', (ctx,camX,camY,vw,vh)=>{...})
     Render.dessinerSur('hud', (ctx,vw,vh)=>{...})

   Pour couche entités (tri-Y) :
     Render.dessinerSur('entites', {ySort:y, draw:(ctx,camX,camY)=>{...}})
   ============================================================ */
function dessinerSur(nom,item){
  const c=couches[nom];
  if(c) c.items.push(item);
}


/* ============================================================
   JOUR/NUIT — cycle 24h avec transitions
   ============================================================ */
function setHeure(h){heure=((h%24)+24)%24;}
function getHeure(){return heure;}
function avancerHeure(dt,vitesse){
  if(!cyclePause) heure=(heure+dt*(vitesse||1))%24;
}

/**
 * Calcule la couleur d'overlay selon l'heure
 * Retourne {r,g,b,a} ou null (plein jour)
 */
function _lumiere(){
  const h=heure;

  /* Plein jour 7h-18h : pas d'overlay */
  if(h>=7&&h<18) return null;

  /* Heure dorée 18h-20h : lueur chaude croissante */
  if(h>=18&&h<20){
    const t=(h-18)/2;
    return{r:255,g:180,b:80,a:t*0.12};
  }

  /* Crépuscule 20h-22h : bleu-violet */
  if(h>=20&&h<22){
    const t=(h-20)/2;
    return{r:40+60*(1-t)|0,g:50+50*(1-t)|0,b:120,a:0.12+t*0.28};
  }

  /* Nuit 22h-4h : bleu nuit profond */
  if(h>=22||h<4) return{r:20,g:25,b:60,a:0.40};

  /* Pré-aube 4h-5h30 : nuit qui se lève */
  if(h>=4&&h<5.5){
    const t=(h-4)/1.5;
    return{r:20+80*t|0,g:25+60*t|0,b:60+40*t|0,a:0.40-t*0.15};
  }

  /* Aube 5h30-7h : dernière brume */
  const t=(h-5.5)/1.5;
  return{r:100,g:85,b:100,a:0.25*(1-t)};
}


/* ============================================================
   COORDONNÉES — conversion monde ↔ écran
   ============================================================ */
function mondeVersEcran(mx,my){
  if(cam.x===null) return{x:0,y:0};
  return{x:(mx-cam.x)*ECH_CSS, y:(my-cam.y)*ECH_CSS};
}

function ecranVersMonde(sx,sy){
  if(cam.x===null) return{x:0,y:0};
  return{x:sx/ECH_CSS+cam.x, y:sy/ECH_CSS+cam.y};
}


/* ============================================================
   FRAME — rendu principal (appeler chaque frame avec dt)
   ============================================================ */
function frame(dt){
  _majSecousse(dt);

  /* FPS debug */
  if(debug.fps){
    debug._frames++;debug._t+=dt;
    if(debug._t>=0.5){
      debug._val=Math.round(debug._frames/debug._t);
      debug._frames=0;debug._t=0;
    }
  }

  ctx.setTransform(ECH,0,0,ECH,0,0);
  ctx.imageSmoothingEnabled=false;
  if(cam.x===null) return;

  /* Coordonnées caméra avec secousse + sub-pixel */
  const rawX=cam.x+cam._sX, rawY=cam.y+cam._sY;
  const camX=rawX|0, camY=rawY|0;
  const fx=Math.round((rawX-camX)*ECH)/ECH;
  const fy=Math.round((rawY-camY)*ECH)/ECH;

  /* Clear complet (sécurité bords du monde) */
  ctx.clearRect(0,0,VW+2,VH+2);

  /* ---- COUCHE : SOL ---- */
  if(couches.sol.visible&&solCanvas){
    ctx.setTransform(ECH,0,0,ECH,-fx*ECH,-fy*ECH);
    const lw=Math.min(VW+2,MONDE_W-camX);
    const lh=Math.min(VH+2,MONDE_H-camY);
    if(lw>0&&lh>0) ctx.drawImage(solCanvas,camX,camY,lw,lh,0,0,lw,lh);
  }

  /* ---- COUCHE : OMBRES ---- */
  if(couches.ombres.visible){
    const q=couches.ombres.items;
    if(q.length){
      ctx.setTransform(ECH,0,0,ECH,-fx*ECH,-fy*ECH);
      for(let i=0;i<q.length;i++) q[i](ctx,camX,camY,VW,VH);
      q.length=0;
    }
  }

  /* ---- COUCHE : ENTITÉS (tri-Y) ---- */
  if(couches.entites.visible){
    ctx.setTransform(ECH,0,0,ECH,-fx*ECH,-fy*ECH);

    /* Récupérer les items de la file (one-frame) */
    const liste=couches.entites.items;

    /* Ajouter les entités persistantes visibles */
    for(const [,ent] of entites){
      const ex=ent.x, ey=ent.y;
      const ew=ent.w||64, eh=ent.h||80;
      if(visible(ex-ew/2,ey-eh,ew,eh)){
        const ys=ent.ySort!=null?ent.ySort:ey;
        liste.push({ySort:ys,draw:ent.draw});
      }
    }

    /* Tri par Y (Timsort natif, optimal pour données quasi-triées) */
    if(liste.length>1) liste.sort((a,b)=>a.ySort-b.ySort);

    /* Dessiner */
    for(let i=0;i<liste.length;i++) liste[i].draw(ctx,camX,camY);
    liste.length=0;
  }

  /* ---- COUCHE : EFFETS ---- */
  if(couches.effets.visible){
    const q=couches.effets.items;
    if(q.length){
      ctx.setTransform(ECH,0,0,ECH,-fx*ECH,-fy*ECH);
      for(let i=0;i<q.length;i++) q[i](ctx,camX,camY,VW,VH);
      q.length=0;
    }
  }

  /* ---- COUCHE : MÉTÉO (overlay) ---- */
  if(couches.meteo.visible&&couches.meteo.drawFn){
    ctx.setTransform(ECH,0,0,ECH,0,0);
    couches.meteo.drawFn(ctx,VW,VH,dt);
  }

  /* ---- COUCHE : LUMIÈRE (jour/nuit) ---- */
  if(couches.lumiere.visible){
    const lum=_lumiere();
    if(lum){
      ctx.setTransform(ECH,0,0,ECH,0,0);
      ctx.globalAlpha=lum.a;
      ctx.fillStyle='rgb('+lum.r+','+lum.g+','+lum.b+')';
      ctx.fillRect(0,0,VW+2,VH+2);
      ctx.globalAlpha=1;
    }
  }

  /* ---- COUCHE : HUD (espace écran) ---- */
  if(couches.hud.visible){
    const q=couches.hud.items;
    if(q.length){
      ctx.setTransform(ECH,0,0,ECH,0,0);
      for(let i=0;i<q.length;i++) q[i](ctx,VW,VH);
      q.length=0;
    }
  }

  /* ---- DEBUG : FPS ---- */
  if(debug.fps&&debug._val){
    ctx.setTransform(ECH,0,0,ECH,0,0);
    ctx.fillStyle='rgba(0,0,0,.55)';
    ctx.fillRect(VW-42,2,40,13);
    ctx.fillStyle='#0f0';ctx.font='9px monospace';
    ctx.fillText(debug._val+' fps',VW-40,12);
  }

  /* ---- DEBUG : GRILLE ---- */
  if(debug.grille){
    ctx.setTransform(ECH,0,0,ECH,-fx*ECH,-fy*ECH);
    ctx.strokeStyle='rgba(255,0,0,.15)';ctx.lineWidth=0.5;
    const pas=64;
    const gx0=Math.floor(camX/pas)*pas, gy0=Math.floor(camY/pas)*pas;
    for(let x=gx0;x<camX+VW+pas;x+=pas){
      ctx.beginPath();ctx.moveTo(x-camX,0);ctx.lineTo(x-camX,VH+2);ctx.stroke();
    }
    for(let y=gy0;y<camY+VH+pas;y+=pas){
      ctx.beginPath();ctx.moveTo(0,y-camY);ctx.lineTo(VW+2,y-camY);ctx.stroke();
    }
  }
}


/* ============================================================
   API PUBLIQUE
   ============================================================ */
const api={
  init,
  resize:_resize,
  frame,

  /* Caméra */
  cam,
  camSuivre,
  camSecouer,
  camTeleporter,

  /* Sol */
  setSol,

  /* Entités */
  ajouterEntite,
  retirerEntite,
  entite,
  entites,

  /* File de dessin */
  dessinerSur,

  /* Couches */
  couche:nom=>couches[nom],
  montrerCouche:nom=>{if(couches[nom])couches[nom].visible=true;},
  cacherCouche:nom=>{if(couches[nom])couches[nom].visible=false;},
  setOverlay:(nom,fn)=>{if(couches[nom])couches[nom].drawFn=fn;},

  /* Jour/nuit */
  setHeure,
  getHeure,
  avancerHeure,
  setCyclePause:v=>{cyclePause=!!v;},

  /* Coordonnées */
  mondeVersEcran,
  ecranVersMonde,

  /* Culling */
  visible,

  /* Debug */
  debug,

  /* Getters */
  get vw(){return VW;},
  get vh(){return VH;},
  get ech(){return ECH;},
  get echCss(){return ECH_CSS;},
  get ctx(){return ctx;},
  get mondeW(){return MONDE_W;},
  get mondeH(){return MONDE_H;},
  cfg,
};

return api;
})();
