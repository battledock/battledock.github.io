/**
 * actors.js — Moteur d'acteurs Battle Dock v2
 * =============================================
 * Personnages, PNJ, objets interactifs
 * Pathfinding A*, comportements, interactions, dialogues
 * S'intègre avec Render (entités) et Anim (tweens, particules)
 *
 * API principale :
 *   Actors.maj(dt)                          — mise à jour globale
 *   Actors.creer(id, cfg)                   — créer un acteur
 *   Actors.retirer(id)                      — supprimer un acteur
 *   Actors.acteur(id)                       — récupérer un acteur
 *   Actors.interagir(idA, idB)              — interaction entre deux acteurs
 *   Actors.setGrille(w, h, obstacles)       — grille de pathfinding
 */
window.Actors=(function(){
'use strict';

/* ============================================================
   ÉTAT INTERNE
   ============================================================ */
const acteurs=new Map();
let grilleW=0,grilleH=0,grilleCel=16;
let obstacles=null; /* Uint8Array : 0=libre, 1=bloqué */
let _idAuto=0;


/* ============================================================
   GRILLE DE PATHFINDING
   ============================================================ */

/**
 * Configurer la grille de navigation
 * @param {number} w — largeur en cellules
 * @param {number} h — hauteur en cellules
 * @param {number} cel — taille d'une cellule en px (défaut 16)
 * @param {Uint8Array|null} obs — obstacles (1=bloqué)
 */
function setGrille(w,h,cel,obs){
  grilleW=w;grilleH=h;
  grilleCel=cel||16;
  obstacles=obs||new Uint8Array(w*h);
}

/** Marquer une cellule comme obstacle */
function setObstacle(cx,cy,v){
  if(cx>=0&&cx<grilleW&&cy>=0&&cy<grilleH)
    obstacles[cy*grilleW+cx]=v?1:0;
}

/** Tester si une cellule est libre */
function estLibre(cx,cy){
  if(cx<0||cx>=grilleW||cy<0||cy>=grilleH) return false;
  return obstacles[cy*grilleW+cx]===0;
}

/** Convertir position monde → cellule grille */
function mondeVersGrille(x,y){
  return{cx:Math.floor(x/grilleCel),cy:Math.floor(y/grilleCel)};
}

/** Convertir cellule grille → centre monde */
function grilleVersMonde(cx,cy){
  return{x:(cx+0.5)*grilleCel,y:(cy+0.5)*grilleCel};
}


/* ============================================================
   PATHFINDING A*
   ============================================================ */

/**
 * Trouver un chemin de (ax,ay) à (bx,by) en coordonnées monde
 * @returns {Array<{x,y}>|null} — chemin en coords monde, ou null
 */
function trouverChemin(ax,ay,bx,by,maxIter){
  if(!obstacles) return null;
  maxIter=maxIter||500;

  const debut=mondeVersGrille(ax,ay);
  const fin=mondeVersGrille(bx,by);

  if(!estLibre(fin.cx,fin.cy)) return null;

  /* Nœuds */
  const cle=(cx,cy)=>cy*grilleW+cx;
  const ouvert=[]; /* tas min simplifié (array trié, suffisant pour <500 nœuds) */
  const ferme=new Set();
  const gScore=new Map();
  const parent=new Map();

  const debutK=cle(debut.cx,debut.cy);
  gScore.set(debutK,0);

  function heuristique(cx,cy){
    return(Math.abs(cx-fin.cx)+Math.abs(cy-fin.cy))*10;
  }

  ouvert.push({cx:debut.cx,cy:debut.cy,f:heuristique(debut.cx,debut.cy)});

  /* Voisins (4 directions + 4 diagonales) */
  const DIRS=[
    {dx:0,dy:-1,c:10},{dx:1,dy:0,c:10},{dx:0,dy:1,c:10},{dx:-1,dy:0,c:10},
    {dx:1,dy:-1,c:14},{dx:1,dy:1,c:14},{dx:-1,dy:1,c:14},{dx:-1,dy:-1,c:14},
  ];

  let iter=0;
  while(ouvert.length>0&&iter<maxIter){
    iter++;

    /* Extraire le nœud avec le plus petit f */
    let meilleurIdx=0;
    for(let i=1;i<ouvert.length;i++){
      if(ouvert[i].f<ouvert[meilleurIdx].f) meilleurIdx=i;
    }
    const cur=ouvert.splice(meilleurIdx,1)[0];
    const curK=cle(cur.cx,cur.cy);

    /* Trouvé ? */
    if(cur.cx===fin.cx&&cur.cy===fin.cy){
      /* Reconstituer le chemin */
      const chemin=[];
      let k=curK;
      while(k!=null){
        const cy2=Math.floor(k/grilleW),cx2=k%grilleW;
        const pt=grilleVersMonde(cx2,cy2);
        chemin.unshift(pt);
        k=parent.get(k);
      }
      return chemin;
    }

    ferme.add(curK);
    const curG=gScore.get(curK);

    for(let d=0;d<DIRS.length;d++){
      const nx=cur.cx+DIRS[d].dx, ny=cur.cy+DIRS[d].dy;
      if(!estLibre(nx,ny)) continue;

      /* Diagonale : vérifier que les côtés adjacents sont libres */
      if(d>=4){
        if(!estLibre(cur.cx+DIRS[d].dx,cur.cy)||!estLibre(cur.cx,cur.cy+DIRS[d].dy)) continue;
      }

      const nk=cle(nx,ny);
      if(ferme.has(nk)) continue;

      const ng=curG+DIRS[d].c;
      const prev=gScore.get(nk);

      if(prev==null||ng<prev){
        gScore.set(nk,ng);
        parent.set(nk,curK);
        const nf=ng+heuristique(nx,ny);

        /* Ajouter ou mettre à jour dans la liste ouverte */
        let found=false;
        for(let i=0;i<ouvert.length;i++){
          if(ouvert[i].cx===nx&&ouvert[i].cy===ny){
            ouvert[i].f=nf;found=true;break;
          }
        }
        if(!found) ouvert.push({cx:nx,cy:ny,f:nf});
      }
    }
  }

  return null; /* pas de chemin */
}


/* ============================================================
   ACTEUR — entité vivante avec état, comportement, dessin
   ============================================================ */

/**
 * Créer un acteur
 * @param {string} id — identifiant unique
 * @param {Object} cfg
 *   x, y              — position initiale (monde)
 *   vitesse            — px/s (défaut 60)
 *   draw(ctx,cx,cy,act) — fonction de dessin
 *   rayon              — rayon de collision (défaut 8)
 *   type               — 'pnj'|'objet'|'joueur' (défaut 'pnj')
 *   comportement       — function(act, dt) appelée chaque frame
 *   interactif         — bool, peut être ciblé par interagir()
 *   rayonInteraction   — distance max pour interagir (défaut 40)
 *   onInteraction      — function(act, autre) callback
 *   dialogue           — [{texte, duree?}] file de répliques
 *   data               — objet libre pour état custom
 */
function creer(id,cfg){
  cfg=cfg||{};
  const act={
    id:id||('_auto_'+(++_idAuto)),
    x:cfg.x||0,
    y:cfg.y||0,
    vitesse:cfg.vitesse||60,
    _draw:cfg.draw||null,
    rayon:cfg.rayon||8,
    type:cfg.type||'pnj',
    comportement:cfg.comportement||null,
    interactif:cfg.interactif!==false,
    rayonInteraction:cfg.rayonInteraction||40,
    onInteraction:cfg.onInteraction||null,
    data:cfg.data||{},

    /* État mouvement */
    dir:'bas',
    dir8:'bas',
    marche:false,
    pas:0,
    vx:0,vy:0,

    /* Pathfinding */
    _chemin:null,
    _cheminIdx:0,
    _destX:null,
    _destY:null,

    /* Dialogue */
    _dialogue:cfg.dialogue?cfg.dialogue.slice():null,
    _dialogueIdx:-1,
    _dialogueT:0,
    parle:false,
    texte:'',

    /* État */
    actif:true,
    visible:true,
    _enregistre:false,

    /* ---- Méthodes ---- */

    /** Aller vers une position (pathfinding) */
    allerVers(tx,ty){
      const chemin=trouverChemin(act.x,act.y,tx,ty);
      if(chemin&&chemin.length>1){
        act._chemin=chemin;
        act._cheminIdx=1; /* sauter le point de départ */
        act._destX=tx;act._destY=ty;
      }
      return !!chemin;
    },

    /** Aller en ligne droite (sans pathfinding) */
    allerDroit(tx,ty){
      act._chemin=[{x:act.x,y:act.y},{x:tx,y:ty}];
      act._cheminIdx=1;
      act._destX=tx;act._destY=ty;
    },

    /** Arrêter le mouvement */
    stop(){
      act._chemin=null;act._cheminIdx=0;
      act.vx=act.vy=0;act.marche=false;
    },

    /** Lancer un dialogue */
    parler(repliques){
      act._dialogue=repliques||act._dialogue;
      act._dialogueIdx=0;
      act._dialogueT=0;
      act.parle=true;
      act.texte=act._dialogue[0].texte;
    },

    /** Passer à la réplique suivante */
    repliqueSuivante(){
      if(!act._dialogue) return false;
      act._dialogueIdx++;
      if(act._dialogueIdx>=act._dialogue.length){
        act.parle=false;act.texte='';act._dialogueIdx=-1;
        return false;
      }
      act._dialogueT=0;
      act.texte=act._dialogue[act._dialogueIdx].texte;
      return true;
    },

    /** Distance vers un point */
    distanceVers(x,y){return Math.hypot(x-act.x,y-act.y);},

    /** Distance vers un autre acteur */
    distanceActeur(autre){return Math.hypot(autre.x-act.x,autre.y-act.y);},

    /** Regarder vers un point */
    regarderVers(x,y){
      const dx=x-act.x, dy=y-act.y;
      if(Math.abs(dx)<1&&Math.abs(dy)<1) return;
      const a=Math.atan2(dy,dx);
      const DIRS8=['droite','bas-droite','bas','bas-gauche','gauche','haut-gauche','haut','haut-droite'];
      const idx=Math.round((a/(Math.PI/4))+8)%8;
      act.dir8=DIRS8[idx];
      /* Direction 4 */
      if(Math.abs(dx)>Math.abs(dy)*1.2) act.dir=dx>0?'droite':'gauche';
      else if(Math.abs(dy)>Math.abs(dx)*1.2) act.dir=dy>0?'bas':'haut';
    },
  };

  acteurs.set(act.id,act);

  /* Enregistrer comme entité Render */
  if(window.Render){
    Render.ajouterEntite('_act_'+act.id,{
      get x(){return act.x;},
      get y(){return act.y;},
      w:cfg.w||64,h:cfg.h||80,
      get ySort(){return act.y;},
      draw(ctx,cx,cy){
        if(!act.visible) return;
        if(act._draw) act._draw(ctx,cx,cy,act);
      }
    });
    act._enregistre=true;
  }

  return act;
}

/** Retirer un acteur */
function retirer(id){
  const act=acteurs.get(id);
  if(!act) return;
  if(act._enregistre&&window.Render) Render.retirerEntite('_act_'+id);
  acteurs.delete(id);
}

/** Récupérer un acteur */
function acteur(id){return acteurs.get(id);}


/* ============================================================
   MISE À JOUR MOUVEMENT — suivi de chemin
   ============================================================ */
function _majMouvement(act,dt){
  if(!act._chemin||act._cheminIdx>=act._chemin.length){
    if(act.marche){act.marche=false;act.vx=act.vy=0;}
    return;
  }

  const cible=act._chemin[act._cheminIdx];
  const dx=cible.x-act.x, dy=cible.y-act.y;
  const dist=Math.hypot(dx,dy);

  if(dist<2){
    /* Point atteint, passer au suivant */
    act._cheminIdx++;
    if(act._cheminIdx>=act._chemin.length){
      act._chemin=null;
      act.marche=false;act.vx=act.vy=0;
      return;
    }
    return;
  }

  /* Se déplacer vers le point */
  const nx=dx/dist, ny=dy/dist;
  const pas=Math.min(dist,act.vitesse*dt);
  act.x+=nx*pas;
  act.y+=ny*pas;
  act.vx=nx*act.vitesse;
  act.vy=ny*act.vitesse;
  act.marche=true;
  act.pas+=act.vitesse*dt*0.02;

  /* Direction */
  act.regarderVers(cible.x,cible.y);
}


/* ============================================================
   MISE À JOUR DIALOGUE
   ============================================================ */
function _majDialogue(act,dt){
  if(!act.parle||act._dialogueIdx<0) return;
  const rep=act._dialogue[act._dialogueIdx];
  const duree=rep.duree||3;
  act._dialogueT+=dt;
  if(act._dialogueT>=duree) act.repliqueSuivante();
}


/* ============================================================
   INTERACTION
   ============================================================ */

/**
 * Déclencher une interaction entre deux acteurs
 * @param {string} idA — acteur qui initie
 * @param {string} idB — acteur ciblé
 * @returns {boolean} — interaction déclenchée ?
 */
function interagir(idA,idB){
  const a=acteurs.get(idA), b=acteurs.get(idB);
  if(!a||!b||!b.interactif) return false;
  if(a.distanceActeur(b)>b.rayonInteraction) return false;

  a.regarderVers(b.x,b.y);
  b.regarderVers(a.x,a.y);

  if(b.onInteraction) b.onInteraction(b,a);
  if(b._dialogue&&b._dialogue.length) b.parler();

  return true;
}

/**
 * Trouver le PNJ interactif le plus proche d'un point
 * @param {number} x,y — position monde
 * @param {number} rayon — rayon de recherche
 * @returns {Object|null} — acteur le plus proche, ou null
 */
function plusProche(x,y,rayon){
  rayon=rayon||60;
  let meilleur=null, meilleurD=rayon;
  for(const [,act] of acteurs){
    if(!act.actif||!act.interactif) continue;
    const d=Math.hypot(act.x-x,act.y-y);
    if(d<meilleurD){meilleurD=d;meilleur=act;}
  }
  return meilleur;
}


/* ============================================================
   BULLE DE DIALOGUE — dessin automatique au-dessus de l'acteur
   ============================================================ */
function _dessinerBulles(ctx,cx,cy){
  for(const [,act] of acteurs){
    if(!act.parle||!act.texte||!act.visible) continue;
    if(window.Render&&!Render.visible(act.x-50,act.y-80,100,40)) continue;

    const px=act.x-cx, py=act.y-cy-50;
    const texte=act.texte;

    ctx.font='7px sans-serif';
    const mesure=ctx.measureText(texte);
    const tw=Math.min(mesure.width+8,120);
    const th=12;

    /* Fond bulle */
    const bx=px-tw/2, by=py-th;
    ctx.fillStyle='rgba(255,255,255,.92)';
    ctx.beginPath();
    _roundRect(ctx,bx,by,tw,th,3);
    ctx.fill();

    /* Queue */
    ctx.beginPath();
    ctx.moveTo(px-3,py);ctx.lineTo(px,py+4);ctx.lineTo(px+3,py);
    ctx.closePath();ctx.fill();

    /* Bordure */
    ctx.strokeStyle='rgba(80,70,50,.3)';ctx.lineWidth=0.5;
    ctx.beginPath();_roundRect(ctx,bx,by,tw,th,3);ctx.stroke();

    /* Texte */
    ctx.fillStyle='#2a2520';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(texte,px,by+th/2,tw-6);
    ctx.textAlign='start';ctx.textBaseline='alphabetic';
  }
}

function _roundRect(ctx,x,y,w,h,r){
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
}


/* ============================================================
   MISE À JOUR GLOBALE
   ============================================================ */
function maj(dt){
  for(const [,act] of acteurs){
    if(!act.actif) continue;

    /* Comportement custom */
    if(act.comportement) act.comportement(act,dt);

    /* Mouvement (pathfinding) */
    _majMouvement(act,dt);

    /* Dialogue auto */
    _majDialogue(act,dt);
  }

  /* Bulles de dialogue sur la couche 'effets' */
  if(window.Render){
    Render.dessinerSur('effets',(ctx,cx,cy)=>_dessinerBulles(ctx,cx,cy));
  }
}


/* ============================================================
   UTILITAIRES
   ============================================================ */

/** Tous les acteurs */
function tous(){return[...acteurs.values()];}

/** Compter les acteurs actifs */
function compter(){return acteurs.size;}

/** Itérer sur tous les acteurs */
function pourChaque(fn){acteurs.forEach(fn);}

/** Obtenir les acteurs dans un rayon */
function dansRayon(x,y,r){
  const res=[];
  for(const [,act] of acteurs){
    if(act.actif&&Math.hypot(act.x-x,act.y-y)<=r) res.push(act);
  }
  return res;
}


/* ============================================================
   COMPORTEMENTS PRÉ-FAITS
   ============================================================ */

/**
 * Rôdeur : marche aléatoirement dans un rayon
 * @param {number} cx,cy — centre de la zone
 * @param {number} rayon — rayon de ronde
 * @param {number} pause — temps d'arrêt entre les déplacements (s)
 */
function comportementRodeur(cx,cy,rayon,pause){
  pause=pause||3;
  return function(act,dt){
    if(!act.data._rodeur) act.data._rodeur={t:0,attend:Math.random()*pause};

    const r=act.data._rodeur;
    if(act.marche) return; /* en mouvement, rien à faire */

    r.t+=dt;
    if(r.t<r.attend) return;

    /* Choisir un nouveau point */
    const ang=Math.random()*Math.PI*2;
    const dist=Math.random()*rayon;
    const tx=cx+Math.cos(ang)*dist;
    const ty=cy+Math.sin(ang)*dist;

    if(act.allerVers(tx,ty)){
      r.t=0;
      r.attend=pause*0.5+Math.random()*pause;
    } else {
      r.t=r.attend*0.8; /* réessayer vite */
    }
  };
}

/**
 * Sentinelle : fait des allers-retours entre deux points
 * @param {number} ax,ay — point A
 * @param {number} bx,by — point B
 * @param {number} pause — temps d'arrêt à chaque bout (s)
 */
function comportementSentinelle(ax,ay,bx,by,pause){
  pause=pause||2;
  return function(act,dt){
    if(!act.data._sent) act.data._sent={cible:'b',t:0};
    const s=act.data._sent;

    if(act.marche) return;

    s.t+=dt;
    if(s.t<pause) return;

    const tx=s.cible==='b'?bx:ax;
    const ty=s.cible==='b'?by:ay;

    if(act.allerVers(tx,ty)){
      s.cible=s.cible==='b'?'a':'b';
      s.t=0;
    }
  };
}

/**
 * Idle : reste sur place, change de direction aléatoirement
 * @param {number} intervalle — secondes entre changements
 */
function comportementIdle(intervalle){
  intervalle=intervalle||4;
  const DIRS=['bas','haut','gauche','droite'];
  return function(act,dt){
    if(!act.data._idle) act.data._idle={t:0};
    act.data._idle.t+=dt;
    if(act.data._idle.t>=intervalle){
      act.data._idle.t=0;
      act.dir=DIRS[Math.floor(Math.random()*4)];
    }
  };
}


/* ============================================================
   API PUBLIQUE
   ============================================================ */
return{
  /* Gestion */
  creer,
  retirer,
  acteur,
  tous,
  compter,
  pourChaque,
  dansRayon,
  plusProche,

  /* Interaction */
  interagir,

  /* Pathfinding */
  setGrille,
  setObstacle,
  estLibre,
  trouverChemin,
  mondeVersGrille,
  grilleVersMonde,

  /* Comportements pré-faits */
  comportementRodeur,
  comportementSentinelle,
  comportementIdle,

  /* Global */
  maj,
};
})();
