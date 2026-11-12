/* =====================================================================
   L'ATHLÉ SHOP (athleshop.js) — la boutique du stade d'athlétisme.
   Maillots, chaussures, accessoires, pièces de prestige. Ce qu'on achète
   va aux vestiaires de la piste. Purement esthétique : rien n'accélère.
   Certains articles demandent une catégorie (on les gagne en course).
   Indépendant : n'écrit que dans #ash. Chargé par piste.js (eval direct).
   ===================================================================== */
(()=>{
const CATS=['Débutant','Club','Régional','Interrégional','National','Élite','Olympique'];
const ART=[
 {id:'m_retro',t:'maillot',n:'Rétro 84',p:6000,nv:0,haut:'#f2ede2',bas:'#1f5fa8',d:'Le maillot des années 80, col blanc, short bleu roi.'},
 {id:'m_endoume',t:'maillot',n:'Club d’Endoume',p:9000,nv:0,haut:'#2e8a4a',bas:'#ffffff',d:'Vert et blanc, comme le petit club du bord de mer.'},
 {id:'m_turquoise',t:'maillot',n:'Turquoise',p:14000,nv:1,haut:'#2ac0c8',bas:'#16213a',d:'La couleur de l’eau aux Calanques, un matin d’été.'},
 {id:'m_nuit',t:'maillot',n:'Nuit étoilée',p:25000,nv:2,haut:'#16213a',bas:'#16213a',d:'Bleu nuit des pieds à la tête, liseré or.'},
 {id:'m_corail',t:'maillot',n:'Corail',p:32000,nv:3,haut:'#ff7a5a',bas:'#ffffff',d:'Pour être vu de loin, même dans le virage.'},
 {id:'c_pointes',t:'chaussures',n:'Pointes de sprint',p:8000,nv:0,c:'#e84a3a',d:'Légères, rouges, faites pour le 100 m.'},
 {id:'c_carbone',t:'chaussures',n:'Carbone',p:22000,nv:1,c:'#2a2a30',d:'Semelle carbone, accents orange.'},
 {id:'c_glacier',t:'chaussures',n:'Glacier Pro',p:30000,nv:2,c:'#a8e8ff',d:'Blanc glacier, reflets bleutés.'},
 {id:'c_menthe',t:'chaussures',n:'Menthe',p:18000,nv:1,c:'#7ee0b0',d:'Vert menthe, semelle blanche.'},
 {id:'a_bandeau',t:'accessoire',n:'Bandeau',p:3000,nv:0,c:'#ffffff',ic:'bandeau',d:'Éponge blanche sur le front.'},
 {id:'a_manchettes',t:'accessoire',n:'Manchettes',p:5000,nv:1,c:'#1a1a22',ic:'manchettes',d:'Aux avant-bras, noires.'},
 {id:'a_lunettes',t:'accessoire',n:'Lunettes miroir',p:12000,nv:2,c:'#5ad0ff',ic:'lunettes',d:'Verres miroir bleus, pour le soleil du soir.'},
 {id:'a_montre',t:'accessoire',n:'Montre GPS',p:16000,nv:2,c:'#ff8a3a',ic:'montre',d:'Elle compte tes tours. En principe.'},
 {id:'p_legende',t:'prestige',n:'Tenue Légende',p:150000,nv:4,haut:'#ffffff',bas:'#e8c040',c:'#e8c040',d:'Blanc et or. On la reconnaît du haut de la tribune.'},
 {id:'p_pointes_or',t:'prestige',n:'Pointes d’or',p:220000,nv:5,c:'#ffd040',d:'Plaquées or. Elles ne vont pas plus vite : elles brillent.'}];
const ONG=[['maillot','Maillots'],['chaussures','Chaussures'],['accessoire','Accessoires'],['prestige','Prestige']];
let RAC=null,ONGLET='maillot',ARGS=null,SEL=null;
const eur=n=>(+n).toLocaleString('fr-FR')+' €';
function cat(){let m=0;try{for(const k in (e.athNiv||{}))m=Math.max(m,e.athNiv[k]|0);}catch(x){}return m;}
function possede(id){try{return !!(e.athShop&&e.athShop[id]);}catch(x){return false;}}
/* l'aperçu : ton perso, en tenue d'athlète, avec l'article essayé */
function apercu(a){let ap={};try{ap=Object.assign({},(ARGS&&ARGS.ap&&ARGS.ap())||{},(ARGS&&ARGS.kit&&ARGS.kit())||{});}catch(x){}
 if(a.haut)ap.veste=a.haut;if(a.bas)ap.pantalon=a.bas;if(a.t==='chaussures'||(a.t==='prestige'&&a.c&&!a.haut))ap.chaussures=a.c;if(a.id==='p_legende')ap.chaussures='#ffffff';if(a.t==='accessoire')ap._acc=a.id;return Object.assign(ap,{_civil:true});}
function icone(q,a,s){/* les accessoires : une petite icône en pixels, à côté du perso */
 const R=(x,y,w,h,c)=>{q.fillStyle=c;q.fillRect(x*s,y*s,w*s,h*s);};
 if(a.ic==='bandeau'){R(2,4,12,4,'#1a1a22');R(3,5,10,2,a.c);}
 else if(a.ic==='manchettes'){R(3,2,4,11,'#0a0a10');R(4,3,2,9,a.c);R(9,2,4,11,'#0a0a10');R(10,3,2,9,a.c);}
 else if(a.ic==='lunettes'){R(1,5,6,4,'#1a1a22');R(9,5,6,4,'#1a1a22');R(2,6,4,2,a.c);R(10,6,4,2,a.c);R(7,6,2,1,'#1a1a22');R(2,6,1,1,'#ffffff');R(10,6,1,1,'#ffffff');}
 else if(a.ic==='montre'){R(5,1,6,14,'#1a1a22');R(4,4,8,8,'#2a2e36');R(5,5,6,6,a.c);R(6,6,2,1,'#fff');R(7,7,1,2,'#fff');}}
function rendre(){if(!RAC)return;const nv=cat();const L=ART.filter(a=>a.t===ONGLET);if(!SEL||SEL.t!==ONGLET)SEL=L[0];
 RAC.querySelector('.cnt').innerHTML=
  '<div class="hero"><canvas class="hc" width="200" height="260"></canvas><div class="hi"><small>'+ONG.find(o=>o[0]===SEL.t)[1].toUpperCase()+'</small><h3>'+SEL.n+'</h3><p>'+SEL.d+'</p>'+
   (possede(SEL.id)?'<button class="buy ok" disabled>✓ Dans ton vestiaire</button>':SEL.nv>nv?'<button class="buy lock" disabled>🔒 Catégorie '+CATS[SEL.nv]+'</button>':'<button class="buy">Acheter · '+eur(SEL.p)+'</button>')+'</div></div>'+
  '<div class="grid">'+L.map(a=>{const lk=a.nv>nv,own=possede(a.id);return '<button class="it'+(a===SEL?' on':'')+(lk?' lk':'')+'" data-id="'+a.id+'"><canvas width="96" height="120"></canvas><b>'+a.n+'</b><span>'+(own?'✓ à toi':lk?'🔒 '+CATS[a.nv]:eur(a.p))+'</span></button>';}).join('')+'</div>';
 const dessine=(cv,a,big)=>{const q=cv.getContext('2d');q.imageSmoothingEnabled=false;q.clearRect(0,0,cv.width,cv.height);const k=big?3.6:1.7;
  q.save();q.setTransform(k,0,0,k,cv.width/2,cv.height-10*k/1.7);try{personne(q,0,0,apercu(a),'bas',0,false);}catch(x){}q.restore();
  if(a.ic){q.save();q.translate(big?cv.width-56:cv.width-30,big?14:6);icone(q,a,big?3:1.6);q.restore();}};
 dessine(RAC.querySelector('.hc'),SEL,true);
 RAC.querySelectorAll('.it').forEach(b=>{const a=ART.find(x=>x.id===b.dataset.id);dessine(b.querySelector('canvas'),a,false);b.onclick=()=>{SEL=a;rendre();};});
 const by=RAC.querySelector('.buy:not([disabled])');if(by)by.onclick=()=>acheter(SEL,by);
 RAC.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.o===ONGLET));
 try{RAC.querySelector('.argent').textContent=eur(Math.floor((e.euros||0)/100));}catch(x){}}
async function acheter(a,by){if(!a||!by)return;if((e.euros||0)<a.p*100){by.textContent='Pas assez d’argent';by.disabled=true;try{vibrer(40);}catch(x){}setTimeout(rendre,1400);return;}
 by.textContent='Paiement…';by.disabled=true;let r=null,err=null;
 try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc('athle_acheter',{p_article:a.id});r=q.data;err=q.error;}else if(typeof appelRPC==='function'){r=await appelRPC('athle_acheter',{p_article:a.id});}}catch(x){err=x;}
 if(r&&r.ok){if(typeof r.euros==='number')e.euros=r.euros;e.athShop=e.athShop||{};(r.articles||[a.id]).forEach(k=>e.athShop[k]=true);e.athShop[a.id]=true;
   try{sauver();}catch(x){}try{majHaut();}catch(x){}try{vibrer([10,40,20]);}catch(x){}try{ARGS&&ARGS.apres&&ARGS.apres();}catch(x){}rendre();
   const t=RAC&&RAC.querySelector('.buy');if(t){t.textContent='✓ Rangé dans ton vestiaire';}return;}
 if(r&&r.deja){e.athShop=e.athShop||{};e.athShop[a.id]=true;rendre();return;}
 by.textContent=(r&&r.erreur)?String(r.erreur):'Paiement impossible, réessaie';setTimeout(rendre,1800);}
function fermer(){if(!RAC)return;const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),250);}
const CSS=`#ash{position:fixed;inset:0;z-index:2147482500;display:flex;flex-direction:column;background:#e6dac2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='32'%3E%3Crect width='64' height='32' fill='%23e3d6bc'/%3E%3Crect x='1' y='1' width='30' height='14' fill='%23ebe0c9'/%3E%3Crect x='33' y='17' width='30' height='14' fill='%23ebe0c9'/%3E%3C/svg%3E");background-size:64px 32px;color:#16213a;font-family:'Baloo 2',system-ui,sans-serif;opacity:0;transition:opacity .25s}
#ash.on{opacity:1}#ash *{box-sizing:border-box}
#ash .hd{flex:none;position:relative;padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 0;background:#16213a;border-bottom:4px solid #e8c050}
#ash .hd .ti{display:flex;align-items:center;gap:10px;color:#ffd860}#ash .hd .ti b{font:900 22px Georgia,serif}#ash .hd .ti small{display:block;font:800 9.5px ui-monospace,monospace;letter-spacing:2px;color:#8ab0d8}
#ash .argent{margin-left:auto;font:900 14px ui-monospace,monospace;color:#fff;background:#0f1830;border:2px solid #e8c050;border-radius:4px;padding:3px 8px}
#ash .x{width:38px;height:38px;border:2px solid #e8c050;border-radius:4px;background:#0f1830;color:#ffd860;font:900 16px ui-monospace,monospace}
#ash .store{height:14px;margin:10px -14px 0;background:repeating-linear-gradient(90deg,#d8402a 0 16px,#f6f0e2 16px 32px);-webkit-mask:radial-gradient(circle at 8px 0,#000 8px,transparent 8.5px) 0 4px/16px 10px repeat-x,linear-gradient(#000,#000) 0 0/100% 6px no-repeat}
#ash .tabs{display:flex;gap:6px;padding:10px 12px 0}
#ash .tab{all:unset;flex:1;text-align:center;padding:8px 2px;border:3px solid #16213a;border-bottom:0;border-radius:4px 4px 0 0;background:#d8cdb4;font:900 11.5px ui-monospace,monospace;cursor:pointer}#ash .tab.on{background:#f6efdc;color:#c0392b}
#ash .cnt{flex:1;overflow-y:auto;margin:0 12px 12px;background:#f6efdc;border:3px solid #16213a;border-radius:0 0 4px 4px;padding:12px;padding-bottom:calc(16px + env(safe-area-inset-bottom))}
#ash .hero{display:flex;gap:12px;align-items:center;background:#fff6d8;border:3px solid #16213a;border-radius:4px;box-shadow:0 5px 0 #16213a;padding:10px;margin-bottom:16px}
#ash .hero canvas{width:100px;height:130px;image-rendering:pixelated;background:radial-gradient(circle at 50% 70%,#ffe8a8,#f6efdc 70%);border-radius:4px;flex:none}
#ash .hi small{font:900 10px ui-monospace,monospace;letter-spacing:2px;color:#c0392b}#ash .hi h3{margin:2px 0 4px;font:900 21px Georgia,serif}#ash .hi p{margin:0 0 10px;font:600 13px/1.3 Georgia,serif;color:#3a2e22}
#ash .buy{all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;padding:10px;border-radius:4px;background:#16213a;color:#ffd860;border:3px solid #e8c050;font:900 13px ui-monospace,monospace;cursor:pointer}
#ash .buy.ok{background:#e6f6e8;color:#1e6a34;border-color:#2e7d4f}#ash .buy.lock{background:#e2d8c6;color:#8a3a2a;border-color:#b8aa90}
#ash .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
#ash .it{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;background:#fff;border:3px solid #e2d8c6;border-radius:4px;box-shadow:0 3px 0 #e2d8c6;padding:4px 3px 6px}
#ash .it.on{border-color:#16213a;box-shadow:0 3px 0 #16213a;background:#fff6d8}#ash .it.lk{opacity:.55}#ash .it.lk canvas{filter:grayscale(1)}
#ash .it canvas{width:48px;height:60px;image-rendering:pixelated;display:block;margin:0 auto}
#ash .it b{display:block;font:800 11px/1.15 ui-monospace,monospace;color:#16213a;min-height:26px}#ash .it span{font:900 11px ui-monospace,monospace;color:#2e7d4f}#ash .it.lk span{color:#c0392b}`;
window.ouvrirAthleShop=function(args){if(RAC)return;ARGS=args||{};
 if(!document.getElementById('ashCss')){const s=document.createElement('style');s.id='ashCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='ash';RAC=d;
 d.innerHTML='<div class="hd"><div class="ti"><div><small>PISTE MUNICIPALE</small><b>Athlé Shop</b></div><span class="argent"></span><button class="x">✕</button></div><div class="store"></div></div>'+
  '<div class="tabs">'+ONG.map(o=>'<button class="tab" data-o="'+o[0]+'">'+o[1]+'</button>').join('')+'</div><div class="cnt"></div>';
 document.body.appendChild(d);d.querySelector('.x').onclick=fermer;d.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{ONGLET=t.dataset.o;SEL=null;rendre();});
 requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);rendre();};
})();
