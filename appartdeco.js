/* =====================================================================
   DÉCORER L'APPART — le plan de la pièce, vu d'en haut ; on y glisse ses
   meubles du doigt, on les retourne, on les range. En bas, la boutique :
   meubles par pièce, murs, sols. Le serveur encaisse les achats
   (appart_acheter) et garde la déco (appart_sauver) ; il vérifie qu'on ne
   pose que ce qu'on possède.
   Chargé par appart.js (eval direct) : voit sb, e, vibrer, majHaut, sauver.
   ===================================================================== */
(()=>{
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const vib=x=>{try{vibrer(x);}catch(_){}};
const fmt=c=>Math.floor((c||0)/100).toLocaleString('fr-FR').replace(/ | /g,' ')+' €';
const solde=()=>{try{return e.euros||0;}catch(x){return 0;}};
const CSS=`#dec{position:fixed;inset:0;z-index:2147482300;display:flex;flex-direction:column;background:linear-gradient(#f6ead6,#ead8b8);color:#3a2410;font-family:'Baloo 2',system-ui,sans-serif;opacity:0;transition:opacity .2s;user-select:none;-webkit-user-select:none}
#dec.on{opacity:1}#dec *{box-sizing:border-box}
#dec .dh{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 14px 8px}
#dec .dh b{flex:1;font:900 21px 'Baloo 2',system-ui,sans-serif}#dec .dh b small{display:block;font-size:11px;letter-spacing:.12em;opacity:.6;font-weight:800}
#dec .so{background:#fff;border-radius:16px;padding:4px 11px;font-weight:900;font-size:14px;box-shadow:0 2px 0 rgba(90,60,30,.25)}
#dec .dx{width:38px;height:38px;border-radius:50%;border:0;background:rgba(58,36,16,.1);font-size:17px;color:#3a2410}
#dec .plan{position:relative;margin:0 12px;border-radius:16px;overflow:hidden;box-shadow:0 8px 20px rgba(60,30,0,.25),0 0 0 3px #fff;touch-action:none;flex-shrink:0}
#dec .plan canvas{display:block;width:100%}
#dec .act{display:flex;gap:6px;padding:8px 12px 4px;flex-shrink:0}
#dec .ab{flex:1;border:0;border-radius:12px;padding:9px 4px;font:800 13.5px 'Baloo 2',system-ui,sans-serif;background:#fff;color:#3a2410;box-shadow:0 3px 0 rgba(90,60,30,.25)}
#dec .ab[disabled]{opacity:.35}#dec .ab.ok{background:linear-gradient(#5ad87a,#2a9a4a);color:#fff;box-shadow:0 3px 0 #1a6a2a}
#dec .tabs{display:flex;gap:6px;padding:6px 12px 0;overflow-x:auto;flex-shrink:0;scrollbar-width:none}#dec .tabs::-webkit-scrollbar{display:none}
#dec .tb{flex:0 0 auto;border:0;border-radius:14px;padding:6px 12px;font:800 13.5px 'Baloo 2',system-ui,sans-serif;background:rgba(58,36,16,.08);color:#5a3a1a}
#dec .tb.on{background:#3a2410;color:#fff}
#dec .cat{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 12px calc(14px + env(safe-area-inset-bottom));align-content:start}
#dec .it{position:relative;border:0;border-radius:14px;padding:6px 4px 7px;background:#fff;color:#3a2410;box-shadow:0 3px 0 rgba(90,60,30,.2);display:flex;flex-direction:column;align-items:center;gap:2px;font:700 11.5px/1.15 'Baloo 2',system-ui,sans-serif;text-align:center;min-height:118px}
#dec .it canvas{width:72px;height:60px}
#dec .it em{font-style:normal;font-weight:900;font-size:12.5px;color:#a85a14}#dec .it em.st{color:#2a8a4a}
#dec .it.conf{box-shadow:0 0 0 3px #f0a020,0 3px 0 rgba(90,60,30,.2)}#dec .it.on{box-shadow:0 0 0 3px #2a9a4a,0 3px 0 rgba(90,60,30,.2)}
#dec .msg{text-align:center;font-weight:800;font-size:13px;min-height:18px;padding:0 12px;color:#8a5a2a}#dec .msg.p{color:#c83a2a}#dec .msg.g{color:#2a8a4a}`;
let RAC=null;
function fermer(){if(!RAC)return;const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),220);}
window.ouvrirDecoAppart=function(){if(!document.getElementById('decCss')){const s=document.createElement('style');s.id='decCss';s.textContent=CSS;document.head.appendChild(s);}
  if(RAC)fermer();const A=window.APPART;if(!A||!window.MEUBLES)return;const {W,H,MUR}=window.APPART_DIM;
  const D=JSON.parse(JSON.stringify(A.deco));D.items=D.items||[];
  const d=document.createElement('div');d.id='dec';d.innerHTML='<div class="dh"><b>Mon appart<small>GLISSE TES MEUBLES DU DOIGT</small></b><span class="so">'+fmt(solde())+'</span><button class="dx" aria-label="Fermer">✕</button></div>'+
   '<div class="plan"><canvas></canvas></div><div class="act"><button class="ab re" disabled>↔ Retourner</button><button class="ab ra" disabled>⤓ Ranger</button><button class="ab ok en">✓ Enregistrer</button></div><div class="msg"></div>'+
   '<div class="tabs">'+window.MEUBLE_CATS.map(([k,n],i)=>'<button class="tb'+(i?'':' on')+'" data-k="'+k+'">'+n+'</button>').join('')+'<button class="tb" data-k="murs">Murs</button><button class="tb" data-k="sols">Sols</button></div><div class="cat"></div>';
  document.body.appendChild(d);RAC=d;window.ECRAN_COUVRANT=true;requestAnimationFrame(()=>d.classList.add('on'));
  const msg=d.querySelector('.msg'),cat=d.querySelector('.cat'),cv=d.querySelector('.plan canvas'),bre=d.querySelector('.re'),bra=d.querySelector('.ra');
  const dire=(t,c)=>{msg.className='msg'+(c?' '+c:'');msg.textContent=t||'';};
  if(!A.serveur)dire('La boutique ouvre très bientôt : tu peux déjà placer tes meubles offerts.');
  /* ---------- le plan ---------- */
  const PW=Math.min(innerWidth-24,440),S=PW/W,PH=H*S,DPR=Math.min(3,devicePixelRatio||1);cv.width=Math.round(PW*DPR);cv.height=Math.round(PH*DPR);cv.style.height=PH+'px';const g=cv.getContext('2d');
  let FOND=null,FOND_K='',SEL=-1;
  const cleFond=()=>JSON.stringify([D.mur,D.sol,D.items.filter(i=>MEUBLES[i.m]&&(MEUBLES[i.m].mur||MEUBLES[i.m].tapis))]);
  function dessiner(){const k=cleFond();if(k!==FOND_K){FOND=window.APPART_SALLE_IMG(Object.assign({},D,{items:D.items.filter((it,i)=>i!==SEL||true)}),Math.min(2,DPR*S*2));FOND_K=k;}
    g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,PW,PH);g.drawImage(FOND,0,0,PW,PH);g.save();g.scale(S,S);
    const L=D.items.map((it,i)=>[it,i]).filter(([it])=>MEUBLES[it.m]&&!MEUBLES[it.m].mur&&!MEUBLES[it.m].tapis).sort((a,b)=>a[0].y-b[0].y);
    for(const [it] of L){const s=spriteMeuble(it.m,it.f);if(s)g.drawImage(s.c,it.x-s.ox,it.y-s.oy,s.w,s.h);}
    if(SEL>=0&&D.items[SEL]){const it=D.items[SEL],m=MEUBLES[it.m];g.strokeStyle='#2a9a4a';g.lineWidth=3/S;g.setLineDash([8/S,5/S]);g.strokeRect(it.x-m.w/2-4,it.y-m.h-4,m.w+8,m.h+8);g.setLineDash([]);
      g.fillStyle='#2a9a4a';for(const [x,y] of [[it.x-m.w/2-4,it.y-m.h-4],[it.x+m.w/2+4,it.y-m.h-4],[it.x-m.w/2-4,it.y+4],[it.x+m.w/2+4,it.y+4]]){g.beginPath();g.arc(x,y,5/S,0,7);g.fill();}}
    g.restore();}
  const borner=it=>{const m=MEUBLES[it.m];if(m.mur){it.x=Math.max(m.w/2+4,Math.min(W-m.w/2-4,it.x));it.y=Math.max(m.h+18,Math.min(MUR-14,it.y));}
    else if(m.tapis){it.x=Math.max(m.w/2+8,Math.min(W-m.w/2-8,it.x));it.y=Math.max(MUR+m.h+4,Math.min(H-10,it.y));}
    else{it.x=Math.max(m.w/2+8,Math.min(W-m.w/2-8,it.x));it.y=Math.max(MUR+(m.d||10)+8,Math.min(H-14,it.y));}it.x=Math.round(it.x/4)*4;it.y=Math.round(it.y/4)*4;};
  const pick=(x,y)=>{/* d'abord les meubles debout, du plus proche au plus lointain, puis les cadres et les tapis */
    const ord=D.items.map((it,i)=>[it,i]).sort((a,b)=>{const ka=MEUBLES[a[0].m].tapis?0:1,kb=MEUBLES[b[0].m].tapis?0:1;return kb-ka||b[0].y-a[0].y;});
    for(const [it,i] of ord){const m=MEUBLES[it.m];if(x>it.x-m.w/2-6&&x<it.x+m.w/2+6&&y>it.y-m.h-6&&y<it.y+6)return i;}return -1;};
  const majBtn=()=>{bre.disabled=bra.disabled=SEL<0;};
  let drag=null;
  cv.addEventListener('pointerdown',ev=>{const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/S,y=(ev.clientY-r.top)/S;const i=pick(x,y);SEL=i;majBtn();
    if(i>=0){drag={dx:x-D.items[i].x,dy:y-D.items[i].y};try{cv.setPointerCapture(ev.pointerId);}catch(_){}vib(6);}dessiner();});
  cv.addEventListener('pointermove',ev=>{if(!drag||SEL<0)return;const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/S,y=(ev.clientY-r.top)/S;const it=D.items[SEL];it.x=x-drag.dx;it.y=y-drag.dy;borner(it);dessiner();});
  const lacher=()=>{drag=null;};cv.addEventListener('pointerup',lacher);cv.addEventListener('pointercancel',lacher);
  bre.onclick=()=>{if(SEL<0)return;D.items[SEL].f=D.items[SEL].f?0:1;vib(6);FOND_K='';dessiner();};
  bra.onclick=()=>{if(SEL<0)return;D.items.splice(SEL,1);SEL=-1;majBtn();vib(8);FOND_K='';dessiner();liste();};
  /* ---------- la boutique ---------- */
  const poss=id=>(A.meubles[id]||0)+((window.APPART_OFFERTS||{})[id]||0);
  const poses=id=>D.items.filter(i=>i.m===id).length;
  let TAB=window.MEUBLE_CATS[0][0],CONF=null;
  function vignette(id){const c=document.createElement('canvas');c.width=144;c.height=120;const q=c.getContext('2d');const s=spriteMeuble(id,0);const k=Math.min(130/s.w,108/s.h,2.4);q.drawImage(s.c,72-s.w*k/2,114-s.h*k,s.w*k,s.h*k);return c;}
  function vignetteFond(k,mur){const c=document.createElement('canvas');c.width=144;c.height=120;const q=c.getContext('2d');q.scale(2,2);(mur?window.peindreMurAppart:window.peindreSolAppart)(q,k,0,0,72,60);return c;}
  function liste(){cat.innerHTML='';d.querySelectorAll('.tb').forEach(b=>b.classList.toggle('on',b.dataset.k===TAB));
    if(TAB==='murs'||TAB==='sols'){const T=TAB==='murs'?window.APPART_MURS:window.APPART_SOLS,own=TAB==='murs'?A.murs:A.sols,cur=TAB==='murs'?D.mur:D.sol;
      for(const k in T){const [n,p]=T[k],a=!p||own[k];const b=document.createElement('button');b.className='it'+(k===cur?' on':'')+(CONF===TAB+':'+k?' conf':'');b.appendChild(vignetteFond(k,TAB==='murs'));
        b.insertAdjacentHTML('beforeend','<span>'+n+'</span>'+(k===cur?'<em class="st">✓ posé</em>':a?'<em class="st">à toi</em>':'<em>'+(CONF===TAB+':'+k?'Acheter ?':fmt(p*100))+'</em>'));
        b.onclick=()=>choisirFond(k,a,p);cat.appendChild(b);}return;}
    for(const id in MEUBLES){const m=MEUBLES[id];if(m.cat!==TAB)continue;const st=poss(id)-poses(id);const b=document.createElement('button');b.className='it'+(CONF===id?' conf':'');b.appendChild(vignette(id));
      b.insertAdjacentHTML('beforeend','<span>'+m.nom+'</span>'+(st>0?'<em class="st">'+st+' en réserve</em>':'<em>'+(CONF===id?'Acheter ?':fmt(m.prix*100))+'</em>'));b.onclick=()=>prendre(id);cat.appendChild(b);}}
  d.querySelectorAll('.tb').forEach(b=>b.onclick=()=>{TAB=b.dataset.k;CONF=null;vib(5);liste();});
  function poser(id){const m=MEUBLES[id];const it={m:id,x:W/2,y:m.mur?MUR-30:(m.tapis?MUR+150:MUR+120),f:0};borner(it);D.items.push(it);SEL=D.items.length-1;majBtn();FOND_K='';dessiner();liste();vib([8,20,8]);dire(m.nom+' posé : fais-le glisser où tu veux.','g');}
  async function acheter(cle){if(!A.serveur){dire('La boutique ouvre très bientôt.','p');return null;}
    const r=await rpcS('appart_acheter',{p_id:cle});if(!RAC)return null;
    if(!r||r.erreur){dire(r&&r.erreur==='pas_assez'?'Il te manque de quoi l’acheter.':r&&/function|schema|PGRST/i.test(r.erreur)?'La boutique ouvre très bientôt.':'Petit souci, réessaie.','p');return null;}
    try{e.euros=r.euros;majHaut();}catch(x){}d.querySelector('.so').textContent=fmt(r.euros);if(r.meubles)A.meubles=r.meubles;if(r.murs)A.murs=r.murs;if(r.sols)A.sols=r.sols;vib([10,30,10]);return r;}
  async function prendre(id){const m=MEUBLES[id];if(poss(id)-poses(id)>0){CONF=null;poser(id);return;}
    if(CONF!==id){CONF=id;liste();dire('Touche encore pour acheter : '+m.nom+' pour '+fmt(m.prix*100)+'.');return;}
    CONF=null;if(solde()<m.prix*100){dire('Il te manque de quoi l’acheter.','p');liste();return;}
    const r=await acheter(id);if(r){poser(id);dire(m.nom+' acheté et posé !','g');}else liste();}
  async function choisirFond(k,a,p){const mur=TAB==='murs';if(!a){const c=TAB+':'+k;if(CONF!==c){CONF=c;liste();dire('Touche encore pour acheter pour '+fmt(p*100)+'.');return;}
      CONF=null;if(solde()<p*100){dire('Il te manque de quoi l’acheter.','p');liste();return;}if(!(await acheter((mur?'mur:':'sol:')+k))){liste();return;}}
    if(mur)D.mur=k;else D.sol=k;FOND_K='';dessiner();liste();vib(8);dire('');}
  /* ---------- enregistrer ---------- */
  d.querySelector('.en').onclick=async()=>{const b=d.querySelector('.en');b.disabled=true;vib(10);
    let ok=false;if(A.serveur){const r=await rpcS('appart_sauver',{p_deco:D});ok=r&&r.ok;if(!ok){b.disabled=false;dire(r&&r.erreur?'Impossible d’enregistrer : '+r.erreur:'Petit souci, réessaie.','p');return;}}
    else{try{localStorage.setItem('bd_appart',JSON.stringify(D));ok=true;}catch(x){}}
    window.APPART_APPLIQUER(D);fermer();try{texteVolant(joueur.x,joueur.y-56,'Ton appart est prêt !','#fff');}catch(x){}};
  d.querySelector('.dx').onclick=()=>{vib(8);fermer();};
  dessiner();liste();};
})();
