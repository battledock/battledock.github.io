/* =====================================================================
   LES JEUX DU GRAND CASINO — chargés par casino.js (eval direct).
   Machines à sous, roulette, vingt-et-un de Fonfon, le Treuil, le Mur à
   clous, les tickets à gratter, la cagnotte. Chaque coup est tiré par le
   serveur (casino_coup, casino_21_donner, casino_21_coup) : l'écran ne
   fait que montrer, joliment, ce qui est déjà joué.
   ===================================================================== */
(()=>{
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const vib=x=>{try{vibrer(x);}catch(_){}};
const SERIF='"Playfair Display",Georgia,serif',SANS="'Baloo 2',system-ui,sans-serif";
const CSS=`#cas{position:fixed;inset:0;z-index:2147482300;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 0%,#5a0c1c 0%,#2a0610 55%,#120306 100%);color:#fff2d0;font-family:${SANS};opacity:0;transition:opacity .2s;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#cas.on{opacity:1}#cas *{box-sizing:border-box}
#cas .ch{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 14px 10px;background:linear-gradient(#1a0408,rgba(26,4,8,0));}
#cas .ch b{font:900 20px ${SERIF};letter-spacing:.02em;background:linear-gradient(#fff6c8,#f0c860 55%,#b8801c);-webkit-background-clip:text;background-clip:text;color:transparent;flex:1;line-height:1.1}
#cas .ch b small{display:block;font:600 11px ${SANS};letter-spacing:.14em;color:#d8b878;-webkit-text-fill-color:#d8b878;opacity:.8}
#cas .so{background:rgba(0,0,0,.35);border:1px solid rgba(240,200,96,.45);border-radius:20px;padding:5px 11px;font-weight:800;font-size:14px;color:#ffe8a0;white-space:nowrap;transition:transform .2s}
#cas .so.pl{animation:casPl .6s}@keyframes casPl{30%{transform:scale(1.18);color:#7aff8a}}
#cas .cx{width:38px;height:38px;border-radius:50%;border:1px solid rgba(240,200,96,.4);background:rgba(0,0,0,.3);color:#ffe8a0;font-size:17px}
#cas .cc{flex:1;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;align-items:center;gap:12px;padding:6px 14px calc(18px + env(safe-area-inset-bottom))}
#cas .cc>*{width:100%;max-width:440px}
#cas .msg{min-height:22px;text-align:center;font-weight:800;font-size:15px;color:#ffe8a0}
#cas .msg.g{color:#7aff8a;text-shadow:0 0 12px rgba(122,255,138,.5)}#cas .msg.p{color:#ff8a8a}
#cas .gros{border:0;border-radius:16px;padding:14px;font:900 18px ${SANS};color:#3a1606;background:linear-gradient(#fff2b8,#f0c860 45%,#c8922a);box-shadow:0 4px 0 #6a4210,0 8px 20px rgba(0,0,0,.4);width:100%}
#cas .gros:active{transform:translateY(3px);box-shadow:0 1px 0 #6a4210}#cas .gros[disabled]{filter:grayscale(.6) brightness(.7)}
#cas .gros small{display:block;font:700 11px ${SANS};opacity:.75}
#cas .lig{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
#cas .jt{width:48px;height:48px;border-radius:50%;border:3px dashed rgba(255,255,255,.75);font:900 12.5px ${SANS};color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.45),inset 0 0 0 4px rgba(0,0,0,.18);transition:transform .12s}
#cas .jt.on{transform:translateY(-5px) scale(1.08);box-shadow:0 0 0 3px #ffe8a0,0 6px 14px rgba(0,0,0,.5)}
#cas .bt{border:1px solid rgba(240,200,96,.5);background:rgba(0,0,0,.28);color:#ffe8a0;border-radius:12px;padding:9px 10px;font:800 13.5px ${SANS};flex:1;min-width:0}
#cas .bt.on{background:linear-gradient(#f0c860,#c8922a);color:#3a1606;border-color:#fff2b8}
#cas .bt small{display:block;font-size:10.5px;opacity:.7;font-weight:700}
#cas .info{font-size:12.5px;color:#d8b878;text-align:center;line-height:1.35}
#cas .mi{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:800;color:#ffe8a0}
#cas .mi .v{font:900 22px ${SERIF};color:#fff2b8}
#cas canvas.sc{width:100%;display:block;border-radius:18px}
#cas .cartes{display:flex;justify-content:center;min-height:96px;padding:4px 0}
#cas .ct{width:62px;height:88px;border-radius:8px;margin:0 -12px;background:#fffdf6;color:#1a1614;box-shadow:0 3px 8px rgba(0,0,0,.45);position:relative;animation:casDe .35s cubic-bezier(.3,1.4,.5,1) backwards;font-family:${SERIF}}
#cas .ct.r{color:#c81c24}#cas .ct i{position:absolute;left:5px;top:3px;font:900 17px/1 ${SERIF};font-style:normal;text-align:center}#cas .ct i small{display:block;font-size:14px}
#cas .ct em{position:absolute;inset:0;display:grid;place-items:center;font-size:34px;font-style:normal}
#cas .ct.dos{background:repeating-linear-gradient(45deg,#7a0c18 0 5px,#a81c2a 5px 10px);border:3px solid #fffdf6}
@keyframes casDe{from{transform:translate(120px,-140px) rotate(25deg);opacity:0}}
#cas .tot{text-align:center;font-weight:800;color:#d8b878;font-size:13px}#cas .tot b{color:#fff2b8;font-size:17px}
#cas .feutre{background:radial-gradient(ellipse at 50% 30%,#1c8a4c,#0c4a28);border:3px solid #c8922a;border-radius:22px;padding:10px 6px;box-shadow:inset 0 0 30px rgba(0,0,0,.4)}
#cas .grille{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
#cas .grille button{border:0;border-radius:7px;padding:7px 0;font:900 13px ${SANS};color:#fff}
#cas .grille button.on{outline:3px solid #ffe8a0;transform:scale(1.08)}
#cas .hist{display:flex;gap:4px;justify-content:center;min-height:24px}#cas .hist span{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:800 10.5px ${SANS};color:#fff}
#casP{position:fixed;left:0;top:0;pointer-events:none;z-index:2147482500}
#casJ{position:fixed;inset:0;z-index:2147482600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle,#7a4a0c,#1a0804 70%);color:#fff2b8;font-family:${SERIF};text-align:center;animation:casIn .4s}
#casJ b{font:900 34px ${SERIF};background:linear-gradient(#fff6c8,#f0c860 55%,#b8801c);-webkit-background-clip:text;background-clip:text;color:transparent}#casJ big{font:900 44px ${SERIF};color:#fff}
@keyframes casIn{from{opacity:0;transform:scale(1.3)}}`;

/* ---------- les petits riens partagés ---------- */
let RAC=null,FERME=null;
const solde=()=>{try{return e.euros||0;}catch(x){return 0;}};
function fmt(c){c=Math.round(c||0);const s=Math.floor(Math.abs(c)/100).toLocaleString('fr-FR').replace(/ | /g,' '),k=Math.abs(c)%100;return (c<0?'−':'')+s+(k?','+String(k).padStart(2,'0'):'')+' €';}
function majSolde(c,gain){if(typeof c==='number'){try{e.euros=c;sauver();majHaut();}catch(x){}}const s=RAC&&RAC.querySelector('.so');if(s){s.textContent=fmt(solde());if(gain>0){s.classList.remove('pl');void s.offsetWidth;s.classList.add('pl');}}}
function cagnotte(r){try{if(r&&typeof r.cagnotte==='number'&&window.CASINO_CAGNOTTE)CASINO_CAGNOTTE(r.cagnotte);}catch(x){}
  if(r&&r.cagnotte_gain>0){son('jackpot');vib([60,60,60,60,200,80,400]);const j=document.createElement('div');j.id='casJ';j.innerHTML='<div style="font-size:13px;letter-spacing:.4em">INCROYABLE</div><b>LA CAGNOTTE DU PORT</b><big>+ '+fmt(r.cagnotte_gain)+'</big><div style="font-style:italic;opacity:.8">un coup sur trois mille… et c’était le tien !</div>';
    document.body.appendChild(j);pluie(innerWidth/2,innerHeight/2,90);setTimeout(()=>{j.style.transition='opacity .6s';j.style.opacity='0';setTimeout(()=>j.remove(),700);},4200);}}
function erreur(r){const m=r&&r.erreur;if(!m)return 'Petit souci de réseau, réessaie.';if(m==='reseau')return 'Petit souci de réseau, réessaie.';if(/connect|JWT|auth/i.test(m))return 'Connecte-toi pour jouer.';return m;}
/* LE SON : de petites notes de synthèse, sans fichier */
let AC=null;function ctx(){try{if(typeof A==='function')return A();}catch(x){}try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}catch(x){return null;}}
function note(f,d,typ,v,t0){const a=ctx();if(!a)return;try{const t=a.currentTime+(t0||0),o=a.createOscillator(),g=a.createGain();o.type=typ||'triangle';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.12,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);let out=a.destination;try{if(typeof SEC!=='undefined'&&SEC&&a===ac)out=SEC;}catch(x){}g.connect(out);o.start(t);o.stop(t+d+.02);}catch(x){}}
function son(k){if(k==='tic')note(1800,.03,'square',.03);else if(k==='clac')note(900,.05,'triangle',.08);else if(k==='stop')note(320,.09,'square',.06);
  else if(k==='gain'){[523,659,784,1046].forEach((f,i)=>note(f,.22,'triangle',.12,i*.07));}else if(k==='gros'){[523,659,784,1046,1318,1568].forEach((f,i)=>{note(f,.3,'triangle',.13,i*.06);note(f*1.5,.2,'sine',.05,i*.06+.03);});}
  else if(k==='perdu'){note(220,.25,'sawtooth',.05);note(165,.35,'sawtooth',.05,.12);}else if(k==='piece')note(2400,.06,'square',.04);else if(k==='casse'){note(140,.4,'sawtooth',.1);note(90,.5,'square',.06,.05);}
  else if(k==='jackpot'){for(let i=0;i<16;i++)note([523,659,784,1046][i%4]*(1+Math.floor(i/4)*.5),.25,'triangle',.1,i*.08);}else if(k==='carte')note(600+Math.random()*200,.05,'sine',.06);}
/* LA PLUIE DE PIÈCES : une toile par-dessus tout, quelques secondes */
let PL=null;function pluie(x,y,n){if(!PL){PL={c:document.createElement('canvas'),P:[]};PL.c.id='casP';document.body.appendChild(PL.c);}
  const c=PL.c,d=Math.min(2,devicePixelRatio||1);c.width=innerWidth*d;c.height=innerHeight*d;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';
  for(let i=0;i<n;i++)PL.P.push({x,y,vx:(Math.random()-.5)*9,vy:-4-Math.random()*9,r:5+Math.random()*5,a:Math.random()*6,va:(Math.random()-.5)*.4,v:1});
  if(PL.on)return;PL.on=true;const g=c.getContext('2d');const pas=()=>{g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,innerWidth,innerHeight);
    for(const p of PL.P){p.vy+=.32;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;if(p.y>innerHeight+20)p.v=0;const w=Math.abs(Math.cos(p.a))*p.r;
      g.fillStyle='#c8922a';g.beginPath();g.ellipse(p.x,p.y+1,w+.5,p.r,0,0,7);g.fill();g.fillStyle='#f6d050';g.beginPath();g.ellipse(p.x,p.y,w,p.r,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(p.x-w*.4,p.y-p.r*.5,Math.max(.5,w*.3),p.r*.4);}
    PL.P=PL.P.filter(p=>p.v);if(PL.P.length)requestAnimationFrame(pas);else{PL.on=false;g.clearRect(0,0,innerWidth,innerHeight);}};requestAnimationFrame(pas);}
function bravo(el,gain,mise){const big=gain>=mise*5;son(big?'gros':'gain');vib(big?[30,40,30,40,120]:[20,30,20]);const r=el?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};pluie(r.left+r.width/2,r.top+r.height/2,big?60:Math.min(30,8+Math.round(gain/Math.max(1,mise))*3));}
function toile(cv,L,HH){const d=Math.min(3,devicePixelRatio||1);cv.width=Math.round(L*d);cv.height=Math.round(HH*d);const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);return g;}
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const rad=(g,x,y,r0,r1,st)=>{const gr=g.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const OR=g=>lin(g,0,0,0,1,[[0,'#fff2b8'],[1,'#c8922a']]);void OR;
/* LES JETONS : choisir sa mise d'un doigt */
const JC={100:'#e8e8ee',200:'#4ab0ff',500:'#d82c3c',1000:'#2a6ad8',2000:'#1c8a4a',2500:'#1c8a4a',5000:'#f08a1a',10000:'#2a2a2a',20000:'#8a2ac8',50000:'#c8922a'};
function jetons(el,vals,cle,def,surChange){const k='cas_mise_'+cle;let m=+(localStorage.getItem(k)||def);if(!vals.includes(m))m=def;
  el.innerHTML='<div class="mi"><span>Ta mise</span><span class="v">'+fmt(m)+'</span></div><div class="lig" style="margin-top:6px">'+vals.map(v=>'<button class="jt'+(v===m?' on':'')+'" data-v="'+v+'" style="background:'+(JC[v]||'#888')+';color:'+(v===100?'#2a2a2a':'#fff')+'">'+(v>=100000?(v/100000)+'k':v/100)+'</button>').join('')+'</div>';
  el.querySelectorAll('.jt').forEach(b=>b.onclick=()=>{m=+b.dataset.v;try{localStorage.setItem(k,m);}catch(x){}el.querySelectorAll('.jt').forEach(x=>x.classList.toggle('on',x===b));el.querySelector('.v').textContent=fmt(m);son('piece');vib(6);surChange&&surChange(m);});
  return ()=>m;}

/* ---------- LA COQUILLE : un écran par jeu ---------- */
function ouvrir(titre,sous){if(!document.getElementById('casCss')){const s=document.createElement('style');s.id='casCss';s.textContent=CSS;document.head.appendChild(s);}
  fermer(true);const d=document.createElement('div');d.id='cas';d.innerHTML='<div class="ch"><b>'+titre+'<small>'+sous+'</small></b><span class="so">'+fmt(solde())+'</span><button class="cx" aria-label="Fermer">✕</button></div><div class="cc"></div>';
  document.body.appendChild(d);RAC=d;window.ECRAN_COUVRANT=true;requestAnimationFrame(()=>d.classList.add('on'));d.querySelector('.cx').onclick=()=>{vib(8);fermer();};return d.querySelector('.cc');}
function fermer(vite){if(!RAC)return;const R0=RAC;RAC=null;if(FERME){try{FERME();}catch(x){}FERME=null;}window.ECRAN_COUVRANT=false;if(vite){R0.remove();return;}R0.classList.remove('on');setTimeout(()=>R0.remove(),220);}
const vivant=el=>RAC&&RAC.contains(el);

/* ======================= LES SYMBOLES PEINTS ======================= */
function sym(g,k,x,y,s){g.save();g.translate(x,y);g.scale(s/40,s/40);g.lineJoin='round';g.lineCap='round';
  if(k==='sardine'){g.fillStyle=lin(g,0,-9,0,9,[[0,'#5a7a9a'],[.5,'#c8dcec'],[1,'#8aa8c0']]);g.beginPath();g.moveTo(-15,0);g.quadraticCurveTo(-4,-10,10,-3);g.lineTo(17,-9);g.lineTo(15,0);g.lineTo(17,9);g.lineTo(10,3);g.quadraticCurveTo(-4,10,-15,0);g.fill();
    g.strokeStyle='rgba(40,60,80,.5)';g.lineWidth=1;g.beginPath();g.moveTo(-6,-5);g.quadraticCurveTo(0,0,-6,5);g.stroke();g.fillStyle='#1a2a3a';g.beginPath();g.arc(-10,-1.5,1.6,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-2,-5,10,1.4);}
  else if(k==='cageot'){g.fillStyle='#c88a4a';g.fillRect(-15,-6,30,16);g.fillStyle='#8a5a2a';for(const yy of [-1,4])g.fillRect(-15,yy,30,2);g.fillRect(-15,-6,3,16);g.fillRect(12,-6,3,16);
    for(const [xx,yy,c] of [[-8,-9,'#ff8a1a'],[0,-11,'#ffa42a'],[8,-9,'#ff8a1a'],[-4,-13,'#f07a10'],[4,-14,'#ffb43a']]){g.fillStyle=c;g.beginPath();g.arc(xx,yy,5,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(xx-1.5,yy-1.5,1.4,0,7);g.fill();}g.fillStyle='#3a8a2a';g.fillRect(3,-20,3,3);}
  else if(k==='grue'){g.strokeStyle='#e8a018';g.lineWidth=3;g.beginPath();g.moveTo(-10,16);g.lineTo(-10,-14);g.lineTo(16,-14);g.stroke();g.lineWidth=1.4;for(let yy=-12;yy<14;yy+=6){g.beginPath();g.moveTo(-13,yy);g.lineTo(-7,yy+6);g.stroke();}
    g.fillStyle='#3a3a3a';g.fillRect(-17,-17,9,6);g.fillStyle='#4a4a52';g.fillRect(-14,14,8,4);g.strokeStyle='#2a2a2a';g.lineWidth=1;g.beginPath();g.moveTo(12,-14);g.lineTo(12,0);g.stroke();g.fillStyle='#d83a2a';g.fillRect(6,0,12,8);g.fillStyle='#a82a1a';g.fillRect(6,3,12,1.2);}
  else if(k==='ancre'){g.strokeStyle=lin(g,0,-16,0,16,[[0,'#8ab8e0'],[1,'#2a5a8a']]);g.lineWidth=4;g.beginPath();g.moveTo(0,-11);g.lineTo(0,14);g.moveTo(-8,-6);g.lineTo(8,-6);g.stroke();g.beginPath();g.arc(0,3,12,.25,Math.PI-.25);g.stroke();g.lineWidth=3;g.beginPath();g.arc(0,-14,3.6,0,7);g.stroke();
    g.fillStyle='#2a5a8a';for(const s2 of [-1,1]){g.beginPath();g.moveTo(s2*12,8);g.lineTo(s2*16,4);g.lineTo(s2*13,12);g.fill();}}
  else if(k==='perle'){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,14,12,3,0,0,7);g.fill();g.fillStyle=rad(g,-4,-5,1,15,[[0,'#ffffff'],[.45,'#f6eefa'],[.8,'#d8c8ec'],[1,'#a898c8']]);g.beginPath();g.arc(0,0,13,0,7);g.fill();g.fillStyle='rgba(255,180,230,.25)';g.beginPath();g.arc(4,4,7,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.ellipse(-5,-5,3.4,2.2,-.6,0,7);g.fill();}
  else if(k==='mouette'){g.strokeStyle='#f6f6f6';g.lineWidth=4;g.beginPath();g.moveTo(-16,-2);g.quadraticCurveTo(-8,-12,0,-1);g.quadraticCurveTo(8,-12,16,-2);g.stroke();g.strokeStyle='#5a6a7a';g.lineWidth=1.2;g.beginPath();g.moveTo(-16,-2);g.quadraticCurveTo(-8,-12,0,-1);g.quadraticCurveTo(8,-12,16,-2);g.stroke();g.fillStyle='#ffb41a';g.fillRect(-1,-1,2,3);}
  else if(k==='bateau'){g.fillStyle='#fff';g.beginPath();g.moveTo(1,-16);g.lineTo(1,4);g.lineTo(13,4);g.fill();g.fillStyle='#e8e0d0';g.beginPath();g.moveTo(-1,-12);g.lineTo(-1,4);g.lineTo(-11,4);g.fill();g.fillStyle='#c83a2a';g.beginPath();g.moveTo(-16,6);g.lineTo(16,6);g.lineTo(11,14);g.lineTo(-11,14);g.fill();g.fillStyle='#2a6ad8';g.fillRect(-16,15,32,3);}
  else if(k==='phare'){g.fillStyle='rgba(255,236,150,.35)';g.beginPath();g.moveTo(0,-12);g.lineTo(-20,-20);g.lineTo(-20,-6);g.fill();g.beginPath();g.moveTo(0,-12);g.lineTo(20,-20);g.lineTo(20,-6);g.fill();g.fillStyle='#f6f6f6';g.beginPath();g.moveTo(-6,16);g.lineTo(-4,-8);g.lineTo(4,-8);g.lineTo(6,16);g.fill();g.fillStyle='#d83a2a';g.fillRect(-5,-2,10,4);g.fillRect(-6,8,12,4);g.fillStyle='#ffe070';g.fillRect(-4,-14,8,6);g.fillStyle='#3a3a3a';g.fillRect(-5,-16,10,2);}
  else if(k==='couronne'){g.fillStyle=lin(g,0,-14,0,12,[[0,'#fff2b8'],[.5,'#f0c040'],[1,'#a8701c']]);g.beginPath();g.moveTo(-16,10);g.lineTo(-16,-8);g.lineTo(-8,0);g.lineTo(0,-14);g.lineTo(8,0);g.lineTo(16,-8);g.lineTo(16,10);g.closePath();g.fill();g.fillStyle='#d82c3c';g.beginPath();g.arc(0,3,3,0,7);g.fill();g.fillStyle='#2a8ad8';g.beginPath();g.arc(-9,5,2.2,0,7);g.arc(9,5,2.2,0,7);g.fill();for(const xx of [-16,0,16]){g.fillStyle='#fff6d0';g.beginPath();g.arc(xx,xx?-9:-15,2,0,7);g.fill();}}
  g.restore();}

/* ======================= LA MACHINE À SOUS ======================= */
const SYM=['sardine','cageot','grue','ancre','perle'];
const PAIE={sardine:8,cageot:14,grue:22,ancre:40,perle:120};
function jeuSous(){const C=ouvrir('Les Bandits du Port','MACHINE À SOUS · 1 € À 100 €');
  C.innerHTML='<canvas class="sc"></canvas><div class="msg">Tire le bras… ou appuie sur le bouton !</div><div class="mises"></div><button class="gros">TIRER</button><div class="lig"><button class="bt au">Auto × 10<small>dix coups d’affilée</small></button></div>'+
   '<div class="info pt"></div>';
  const pt=C.querySelector('.pt');const table=m=>{pt.innerHTML=SYM.slice().reverse().map(s=>'<span style="display:inline-flex;align-items:center;gap:2px;margin:2px 6px"><canvas data-s="'+s+'" width="44" height="44" style="width:22px;height:22px"></canvas>×3 = <b style="color:#fff2b8">'+fmt(PAIE[s]*m)+'</b></span>').join('')+'<br>deux perles = <b style="color:#fff2b8">'+fmt(2*m)+'</b>';pt.querySelectorAll('canvas[data-s]').forEach(c=>sym(c.getContext('2d'),c.dataset.s,22,22,40));};
  const mise=jetons(C.querySelector('.mises'),[100,200,500,1000,2000,5000,10000],'sous',200,table);table(mise());
  const cv=C.querySelector('canvas.sc'),Wd=320,Hd=230,g=toile(cv,Wd,Hd),msg=C.querySelector('.msg'),bt=C.querySelector('.gros'),au=C.querySelector('.au');
  const RL=[{o:0,v:0,cible:null,arret:0},{o:1.4,v:0,cible:null,arret:0},{o:3.1,v:0,cible:null,arret:0}];let BRAS=0,LUM=0,GAGNE=null,EN=false,AUTO=0;
  const H=58;  /* la hauteur d'un symbole sur le rouleau */
  function dessiner(){const t=performance.now()/1000;g.clearRect(0,0,Wd,Hd);
    /* le meuble */
    g.fillStyle=lin(g,0,0,Wd,0,[[0,'#5a0a14'],[.5,'#c81c2c'],[1,'#5a0a14']]);g.beginPath();g.roundRect?g.roundRect(4,4,Wd-40,Hd-8,24):g.rect(4,4,Wd-40,Hd-8);g.fill();
    g.strokeStyle=lin(g,0,0,0,Hd,[[0,'#fff2b8'],[.5,'#f0c860'],[1,'#8a5a14']]);g.lineWidth=4;g.stroke();
    /* les ampoules qui courent */
    for(let i=0;i<22;i++){const x=20+i*((Wd-72)/21),on=GAGNE?((i+Math.floor(t*14))%2===0):((i+Math.floor(t*5))%4<2);g.fillStyle=on?'#fff6b0':'#7a4a10';g.beginPath();g.arc(x,16,3.4,0,7);g.fill();g.beginPath();g.arc(x,Hd-16,3.4,0,7);g.fill();}
    /* la vitre et les trois rouleaux */
    const x0=22,y0=32,w=(Wd-80)/3,h=Hd-64;g.fillStyle='#1a0806';g.fillRect(x0-6,y0-6,w*3+12,h+12);
    for(let r=0;r<3;r++){const R=RL[r],X=x0+r*w;g.save();g.beginPath();g.rect(X+2,y0,w-4,h);g.clip();g.fillStyle=lin(g,0,y0,0,y0+h,[[0,'#9a948a'],[.25,'#fffdf6'],[.75,'#fffdf6'],[1,'#9a948a']]);g.fillRect(X,y0,w,h);
      const base=Math.floor(R.o);for(let k=-2;k<=2;k++){const idx=((base+k)%5+5)%5,yy=y0+h/2+(k-(R.o-base))*H;const flou=Math.min(1,R.v/18);if(flou>.3){g.globalAlpha=1-flou*.55;}sym(g,SYM[idx],X+w/2,yy,48);g.globalAlpha=1;if(flou>.3){g.fillStyle='rgba(255,253,246,'+(flou*.35)+')';g.fillRect(X,yy-H/2,w,H);}}
      g.fillStyle=lin(g,0,y0,0,y0+h,[[0,'rgba(0,0,0,.45)'],[.22,'rgba(0,0,0,0)'],[.78,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.45)']]);g.fillRect(X,y0,w,h);g.restore();
      if(r)R2(g,X-1,y0,2,h,'#3a1a0a');}
    /* la ligne gagnante */
    g.strokeStyle=GAGNE?'rgba(122,255,138,'+(.6+.4*Math.sin(t*12))+')':'rgba(230,40,50,.8)';g.lineWidth=GAGNE?3:2;g.beginPath();g.moveTo(x0-8,y0+h/2);g.lineTo(x0+w*3+8,y0+h/2);g.stroke();
    if(GAGNE){g.fillStyle='rgba(255,236,150,'+(.12+.1*Math.sin(t*10))+')';g.fillRect(x0,y0,w*3,h);}
    /* le bras */
    const bx=Wd-22,by=Hd/2,ang=-Math.PI/2+BRAS*Math.PI*.85;g.fillStyle=lin(g,bx-8,0,bx+8,0,[[0,'#8a5a14'],[.5,'#f0c860'],[1,'#8a5a14']]);g.fillRect(bx-9,by-10,14,26);
    g.strokeStyle='#d8d8e0';g.lineWidth=5;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(ang)*6,by+Math.sin(ang)*78);g.stroke();
    const kx=bx+Math.cos(ang)*6,ky=by+Math.sin(ang)*78;g.fillStyle=rad(g,kx-3,ky-3,1,11,[[0,'#ff8a8a'],[1,'#a80c18']]);g.beginPath();g.arc(kx,ky,10,0,7);g.fill();}
  const R2=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  let raf=0,last=performance.now();const boucle=()=>{if(!vivant(cv)){cancelAnimationFrame(raf);return;}const n=performance.now(),dt=Math.min(.05,(n-last)/1000);last=n;
    for(const R of RL){if(R.cible===null){R.o+=R.v*dt;if(R.v>0&&Math.floor(R.o)!==Math.floor(R.o-R.v*dt))son('tic');}
      else{const d=R.cible-R.o;if(d<=.002){R.o=R.cible;R.v=0;R.cible=null;R.fin&&R.fin();}else{R.v=Math.max(2.2,Math.min(R.v,d*7));R.o+=R.v*dt;if(R.o>R.cible+.0){R.o=R.cible;}}}}
    if(BRAS>0&&!EN)BRAS=Math.max(0,BRAS-dt*3);dessiner();raf=requestAnimationFrame(boucle);};raf=requestAnimationFrame(boucle);FERME=()=>{cancelAnimationFrame(raf);AUTO=0;};
  /* le bras se tire aussi au doigt, vers le bas */
  let y0t=null;cv.addEventListener('pointerdown',ev=>{const r=cv.getBoundingClientRect();if(ev.clientX-r.left>r.width*.8){y0t=ev.clientY;}});
  cv.addEventListener('pointermove',ev=>{if(y0t===null||EN)return;BRAS=Math.max(0,Math.min(1,(ev.clientY-y0t)/120));});
  cv.addEventListener('pointerup',()=>{if(y0t===null)return;y0t=null;if(BRAS>.5&&!EN)tirer();});
  async function tirer(){if(EN)return;const MI=mise();if(solde()<MI){msg.className='msg p';msg.textContent='Il te manque de quoi miser.';AUTO=0;return;}
    EN=true;GAGNE=null;BRAS=1;bt.disabled=true;msg.className='msg';msg.textContent='…';vib(12);son('clac');
    RL.forEach((R,i)=>{R.v=24+i*2;R.cible=null;});majSolde(solde()-MI);
    const r=await rpcS('casino_coup',{p_jeu:'sous',p_mise:MI,p_choix:{}});
    if(!vivant(cv))return;
    if(!r||!r.ok){RL.forEach(R=>{R.cible=Math.ceil(R.o)+1;R.fin=null;});EN=false;bt.disabled=false;BRAS=0;msg.className='msg p';msg.textContent=erreur(r);AUTO=0;majSolde(r&&typeof r.euros==='number'?r.euros:solde()+MI);return;}
    const L=Array.isArray(r.tirage)?r.tirage:['sardine','cageot','grue'];
    await new Promise(k=>setTimeout(k,380));
    RL.forEach((R,i)=>{const id=Math.max(0,SYM.indexOf(L[i]));setTimeout(()=>{let c=Math.ceil(R.o)+3+i*2;while(((c%5)+5)%5!==id)c++;R.cible=c;R.fin=()=>{son('stop');vib(8);if(i===2)fini();};},i*360);});
    function fini(){EN=false;bt.disabled=false;majSolde(r.euros,r.gain);cagnotte(r);
      if(r.gain>0){GAGNE=true;msg.className='msg g';msg.textContent=(r.gain>=MI*12?'JACKPOT ! ':'Gagné ! ')+'+ '+fmt(r.gain);bravo(cv,r.gain,MI);setTimeout(()=>{GAGNE=null;},1800);}
      else{msg.className='msg';msg.textContent=['Pas cette fois…','Presque !','Encore un ?','La prochaine est la bonne ?'][Math.floor(Math.random()*4)];}
      if(AUTO>0){AUTO--;au.querySelector('small').textContent=AUTO?('encore '+AUTO):'dix coups d’affilée';if(AUTO){setTimeout(()=>{if(vivant(cv)&&AUTO)tirer();},r.gain>0?1500:650);}else au.classList.remove('on');}}}
  bt.onclick=()=>tirer();
  au.onclick=()=>{if(AUTO){AUTO=0;au.classList.remove('on');au.querySelector('small').textContent='dix coups d’affilée';return;}AUTO=10;au.classList.add('on');au.querySelector('small').textContent='encore 10 · touche pour arrêter';if(!EN)tirer();};}

/* ======================= LA ROULETTE ======================= */
const ORD=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const ROUGES=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const coul=n=>n===0?'#1a8a4a':ROUGES.includes(n)?'#c81c24':'#1a1614';
let HIST=[];
function jeuRoulette(){const C=ouvrir('La Roulette','FAITES VOS JEUX');
  const PARIS=[['rouge','Rouge','×2'],['noir','Noir','×2'],['pair','Pair','×2'],['impair','Impair','×2'],['manque','1 – 18','×2'],['passe','19 – 36','×2'],['douzaine:1','1re douz.','×3'],['douzaine:2','2e douz.','×3'],['douzaine:3','3e douz.','×3']];
  C.innerHTML='<canvas class="sc"></canvas><div class="hist"></div><div class="msg">Choisis ton pari et ta mise.</div><div class="paris"></div><div class="plein"></div><div class="mises"></div><button class="gros">LANCER LA BILLE</button>';
  const cv=C.querySelector('canvas'),S=300,g=toile(cv,S,S*.62),msg=C.querySelector('.msg'),bt=C.querySelector('.gros');
  let PARI=localStorage.getItem('cas_rl_pari')||'rouge';
  const pz=C.querySelector('.paris');pz.className='lig';pz.style.display='grid';pz.style.gridTemplateColumns='repeat(3,1fr)';
  pz.innerHTML=PARIS.map(([k,n,x])=>'<button class="bt" data-k="'+k+'" '+(k==='rouge'?'style="border-color:#ff5a5a"':k==='noir'?'style="border-color:#888"':'')+'>'+n+'<small>'+x+'</small></button>').join('')+'<button class="bt" data-k="plein" style="grid-column:1/4">Un numéro plein<small>×36</small></button>';
  const pl=C.querySelector('.plein');let N=+(localStorage.getItem('cas_rl_n')||17);
  pl.innerHTML='<div class="feutre"><div class="grille"><button data-n="0" style="background:#1a8a4a;grid-column:1/7">0</button>'+Array.from({length:36},(_,i)=>i+1).map(n=>'<button data-n="'+n+'" style="background:'+coul(n)+'">'+n+'</button>').join('')+'</div></div>';
  function maj(){pz.querySelectorAll('.bt').forEach(b=>b.classList.toggle('on',b.dataset.k===PARI));pl.style.display=PARI==='plein'?'':'none';pl.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.n===N));}
  pz.querySelectorAll('.bt').forEach(b=>b.onclick=()=>{PARI=b.dataset.k;try{localStorage.setItem('cas_rl_pari',PARI);}catch(x){}vib(6);son('piece');maj();});
  pl.querySelectorAll('button').forEach(b=>b.onclick=()=>{N=+b.dataset.n;try{localStorage.setItem('cas_rl_n',N);}catch(x){}vib(6);son('piece');maj();});maj();
  const mise=jetons(C.querySelector('.mises'),[100,500,1000,2500,5000,10000,50000],'rl',1000);
  const hz=C.querySelector('.hist');const histo=()=>{hz.innerHTML=HIST.slice(-10).map(n=>'<span style="background:'+coul(n)+'">'+n+'</span>').join('');};histo();
  /* la roue */
  let ANG=0,VA=.35,BA=0,BR=1,BV=0,FIN=null,EN=false;
  function dessiner(){const cx=S/2,cy=S*.31,Rr=S*.46;g.clearRect(0,0,S,S*.62);
    g.save();g.translate(cx,cy);g.scale(1,.55);
    g.fillStyle=lin(g,0,-Rr,0,Rr,[[0,'#8a4a1a'],[1,'#3a1406']]);g.beginPath();g.arc(0,0,Rr,0,7);g.fill();g.strokeStyle='#f0c860';g.lineWidth=3;g.stroke();
    g.fillStyle='#2a1006';g.beginPath();g.arc(0,0,Rr*.86,0,7);g.fill();
    g.save();g.rotate(ANG);const r1=Rr*.8,r0=Rr*.55;
    for(let i=0;i<37;i++){const a0=i/37*Math.PI*2-Math.PI/2,a1=(i+1)/37*Math.PI*2-Math.PI/2;g.fillStyle=coul(ORD[i]);g.beginPath();g.arc(0,0,r1,a0,a1);g.arc(0,0,r0,a1,a0,true);g.closePath();g.fill();
      g.save();g.rotate((a0+a1)/2);g.fillStyle='#fff';g.font='800 9px '+SANS;g.textAlign='center';g.textBaseline='middle';g.translate(r1-9,0);g.rotate(Math.PI/2);g.fillText(String(ORD[i]),0,0);g.restore();}
    g.strokeStyle='#f0c860';g.lineWidth=1;for(let i=0;i<37;i++){const a=i/37*Math.PI*2-Math.PI/2;g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);g.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);g.stroke();}
    g.fillStyle=lin(g,0,-r0,0,r0,[[0,'#a85a24'],[1,'#4a1c08']]);g.beginPath();g.arc(0,0,r0,0,7);g.fill();
    g.strokeStyle='#f0c860';g.lineWidth=4;for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*r0*.7,Math.sin(a)*r0*.7);g.stroke();g.fillStyle='#fff2b8';g.beginPath();g.arc(Math.cos(a)*r0*.7,Math.sin(a)*r0*.7,4,0,7);g.fill();}
    g.fillStyle=rad(g,-3,-3,1,12,[[0,'#fff6c8'],[1,'#a8701c']]);g.beginPath();g.arc(0,0,11,0,7);g.fill();g.restore();
    /* la bille */
    const br=r0+(Rr*.84-r0)*BR+ (BR<.4?0:0);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(Math.cos(BA)*br+1.5,Math.sin(BA)*br+2.5,5,0,7);g.fill();
    g.fillStyle=rad(g,Math.cos(BA)*br-2,Math.sin(BA)*br-2,1,7,[[0,'#ffffff'],[1,'#c8c8d0']]);g.beginPath();g.arc(Math.cos(BA)*br,Math.sin(BA)*br,5,0,7);g.fill();
    g.restore();}
  let raf=0,last=performance.now(),T0=0,DUR=5.2,A0=0,A1=0,W0=0;
  const boucle=()=>{if(!vivant(cv)){cancelAnimationFrame(raf);return;}const n=performance.now(),dt=Math.min(.05,(n-last)/1000);last=n;
    if(FIN){const u=Math.min(1,(n-T0)/1000/DUR),ez=1-Math.pow(1-u,3);ANG=W0+VA*(n-T0)/1000*.0+ (FIN.wfin-W0)*(1-Math.pow(1-u,2.2));BA=A0+(A1-A0)*ez;
      BR=u<.62?1:u<.9?1-(u-.62)/.28*.55+Math.abs(Math.sin(u*60))*.15*(1-u):.45;if(u>.62&&u<.9&&Math.random()<.08)son('clac');
      if(u>=1){const f=FIN;FIN=null;f.ok();}}
    else{ANG+=VA*dt;BA+=VA*dt;}
    dessiner();raf=requestAnimationFrame(boucle);};raf=requestAnimationFrame(boucle);FERME=()=>cancelAnimationFrame(raf);
  bt.onclick=async()=>{if(EN)return;const m=mise();if(solde()<m){msg.className='msg p';msg.textContent='Il te manque de quoi miser.';return;}
    let ch={pari:PARI};if(PARI.startsWith('douzaine')){ch={pari:'douzaine',n:+PARI.split(':')[1]};}else if(PARI==='plein')ch={pari:'plein',n:N};
    EN=true;bt.disabled=true;msg.className='msg';msg.textContent='Rien ne va plus !';vib(10);son('clac');majSolde(solde()-m);
    const r=await rpcS('casino_coup',{p_jeu:'roulette',p_mise:m,p_choix:ch});if(!vivant(cv))return;
    if(!r||!r.ok){EN=false;bt.disabled=false;msg.className='msg p';msg.textContent=erreur(r);majSolde(r&&typeof r.euros==='number'?r.euros:solde()+m);return;}
    const num=r.tirage&&typeof r.tirage.n==='number'?r.tirage.n:0,i=ORD.indexOf(num);
    T0=performance.now();W0=ANG;const wfin=W0+Math.PI*2*1.6;A0=BA;
    /* la case i, une fois la roue arrêtée, est à l'angle wfin + (i+.5)/37·2π − π/2 */
    let cible=wfin+(i+.5)/37*Math.PI*2-Math.PI/2;while(cible>A0-Math.PI*2*3)cible-=Math.PI*2;A1=cible;
    FIN={wfin,ok:()=>{EN=false;bt.disabled=false;HIST.push(num);histo();majSolde(r.euros,r.gain);cagnotte(r);son('stop');vib(12);
      const nom=num+(num===0?'':' '+(ROUGES.includes(num)?'rouge':'noir'));
      if(r.gain>0){msg.className='msg g';msg.textContent='Le '+nom+' ! Gagné : + '+fmt(r.gain);bravo(cv,r.gain,m);}else{msg.className='msg';msg.textContent='Le '+nom+'… perdu.';son('perdu');}}};};}

/* ======================= LE VINGT-ET-UN DE FONFON ======================= */
const RG=['A','2','3','4','5','6','7','8','9','10','V','D','R'],CL=['♠','♥','♦','♣'];
function carte(n,dos,i){if(dos)return '<div class="ct dos" style="animation-delay:'+(i||0)*.12+'s"></div>';const r=n%13,s=Math.floor(n/13)%4;return '<div class="ct'+(s===1||s===2?' r':'')+'" style="animation-delay:'+(i||0)*.12+'s"><i>'+RG[r]+'<small>'+CL[s]+'</small></i><em>'+CL[s]+'</em></div>';}
function total(L){let t=0,a=0;for(const n of L){const r=n%13;if(r===0){a++;t+=11;}else t+=Math.min(10,r+1);}while(t>21&&a){t-=10;a--;}return t;}
const PRIMES={freres:'Trois frères ×30',pavois:'Grand pavois ×375',bordee_ligne:'Bordée en ligne ×100',passerelle:'Passerelle ×10',bordee:'Bordée ×4'};
function jeu21(){const C=ouvrir('Le Vingt-et-un','LA TABLE DE FONFON · 5 € À 200 €');
  C.innerHTML='<div class="feutre"><div class="tot">Fonfon <b class="tc">–</b></div><div class="cartes cc1"></div><div style="height:6px"></div><div class="cartes cj"></div><div class="tot">Toi <b class="tj">–</b></div></div><div class="msg">Mise, et Fonfon distribue.</div>'+
   '<div class="act lig" style="display:none"><button class="bt ti">Tirer<small>une carte</small></button><button class="bt re">Rester<small>Fonfon joue</small></button><button class="bt do">Doubler<small>une seule carte</small></button></div>'+
   '<button class="gros di">DISTRIBUER</button><div class="mises"></div><div class="lig pr"></div><div class="info">Fonfon tire jusqu’à 17. Un vingt-et-un d’entrée paie 3 pour 2.<br>La <b>prime du quai</b> se joue sur tes deux cartes et la carte visible de Fonfon : brelan, suite, couleur…</div>';
  const cc=C.querySelector('.cc1'),cj=C.querySelector('.cj'),tc=C.querySelector('.tc'),tj=C.querySelector('.tj'),msg=C.querySelector('.msg'),act=C.querySelector('.act'),di=C.querySelector('.di');
  const mise=jetons(C.querySelector('.mises'),[500,1000,2500,5000,10000,20000],'bj',1000);
  let PRIME=+(localStorage.getItem('cas_bj_pr')||0);const prz=C.querySelector('.pr');prz.innerHTML=[0,100,200,500].map(p=>'<button class="bt" data-p="'+p+'">'+(p?'Prime '+(p/100)+' €':'Sans prime')+'</button>').join('');
  const mp=()=>prz.querySelectorAll('.bt').forEach(b=>b.classList.toggle('on',+b.dataset.p===PRIME));mp();prz.querySelectorAll('.bt').forEach(b=>b.onclick=()=>{PRIME=+b.dataset.p;try{localStorage.setItem('cas_bj_pr',PRIME);}catch(x){}vib(6);mp();});
  let MAIN=null,EN=false,MISE=0,JN=0,CN=0;
  function poser(r,cache){const j=r.j||[],c=r.c||[];cj.innerHTML=j.map((n,i)=>carte(n,false,i>=JN?i-JN:-1)).join('');cc.innerHTML=c.map((n,i)=>carte(n,false,i>=CN?i-CN+.5:-1)).join('')+(cache?carte(0,true,CN?0:1):'');
    cj.querySelectorAll('.ct').forEach((el,i)=>{if(i<JN)el.style.animation='none';});cc.querySelectorAll('.ct').forEach((el,i)=>{if(i<CN)el.style.animation='none';});
    const nouv=(j.length-JN)+(c.length-CN);for(let k=0;k<nouv;k++)setTimeout(()=>son('carte'),k*120);JN=j.length;CN=c.length;
    tj.textContent=r.tj||total(j);tc.textContent=cache?total(c.slice(0,1)):(r.tc||total(c));}
  function regle(r){MAIN=null;act.style.display='none';di.style.display='';di.disabled=false;majSolde(r.euros,r.gain);cagnotte(r);
    const I={naturel:['VINGT-ET-UN ! Payé 3 pour 2','g'],gagne:['Tu bats Fonfon !','g'],croupier_brule:['Fonfon saute ! Gagné','g'],egalite:['Égalité : mise rendue',''],perdu:['Fonfon gagne…','p'],brule:['Tu sautes…','p']}[r.issue]||['',''];
    msg.className='msg '+I[1];msg.textContent=I[0]+(r.gain>0&&r.issue!=='egalite'?' + '+fmt(r.gain):'');if(I[1]==='g')bravo(cj,r.gain,r.mise||MISE);else if(I[1]==='p')son('perdu');}
  di.onclick=async()=>{if(EN)return;const m=mise();if(solde()<m+PRIME){msg.className='msg p';msg.textContent='Il te manque de quoi miser.';return;}
    EN=true;di.disabled=true;MISE=m;JN=0;CN=0;cj.innerHTML='';cc.innerHTML='';tj.textContent='–';tc.textContent='–';msg.className='msg';msg.textContent='Fonfon distribue…';vib(8);majSolde(solde()-m-PRIME);
    const r=await rpcS('casino_21_donner',{p_mise:m,p_prime:PRIME});EN=false;if(!vivant(cc))return;
    if(!r||!r.ok){di.disabled=false;msg.className='msg p';msg.textContent=erreur(r);majSolde(r&&typeof r.euros==='number'?r.euros:solde()+m+PRIME);return;}
    let pr='';if(r.prime>0){pr=r.prime_gain>0?'Prime : '+(PRIMES[r.prime_combi]||'gagnée')+' → + '+fmt(r.prime_gain)+'. ':'Prime perdue. ';}
    if(r.fini){poser(r,false);setTimeout(()=>{regle(r);if(pr)msg.textContent=pr+msg.textContent;},500);return;}
    MAIN=r.main;poser(r,true);majSolde(r.euros,r.prime_gain||0);cagnotte(r);if(r.prime_gain>0)bravo(cj,r.prime_gain,r.prime);
    msg.className='msg'+(r.prime_gain>0?' g':'');msg.textContent=pr+'À toi : tirer, rester ou doubler ?';
    di.style.display='none';act.style.display='';C.querySelector('.do').disabled=!r.peut_doubler;};
  async function agir(a){if(EN||!MAIN)return;EN=true;vib(8);const r=await rpcS('casino_21_coup',{p_main:MAIN,p_action:a});EN=false;if(!vivant(cc))return;
    if(!r||!r.ok){msg.className='msg p';msg.textContent=erreur(r);if(r&&r.perdue){MAIN=null;act.style.display='none';di.style.display='';di.disabled=false;}return;}
    C.querySelector('.do').disabled=true;if(a==='doubler')majSolde(solde()-MISE);
    if(r.fini){poser(Object.assign({},r,{c:(r.c||[]).slice(0,Math.max(1,CN))}),false);
      /* Fonfon retourne sa carte, puis tire, une à une */
      const c=r.c||[];let k=Math.max(1,CN);const suite=()=>{if(!vivant(cc))return;if(k<c.length){k++;CN=k-1;poser(Object.assign({},r,{c:c.slice(0,k),tc:total(c.slice(0,k))}),false);setTimeout(suite,520);}else setTimeout(()=>regle(r),300);};setTimeout(suite,300);}
    else{poser(r,true);msg.className='msg';msg.textContent=r.tj===21?'21 ! Reste, peut-être ?':'Encore ?';}}
  C.querySelector('.ti').onclick=()=>agir('tirer');C.querySelector('.re').onclick=()=>agir('rester');C.querySelector('.do').onclick=()=>agir('doubler');}

/* ======================= LES TICKETS À GRATTER ======================= */
const GSYM=[null,'mouette','sardine','ancre','bateau','phare','couronne'],GMUL=[0,1,2,5,10,50,500];
function jeuGrattage(){const C=ouvrir('Tickets à gratter','LE TRÉSOR DU PORT · 50 € LE TICKET');
  C.innerHTML='<div class="tk" style="position:relative;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.5)"><canvas class="sc fond" style="border-radius:0"></canvas><canvas class="gr" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none"></canvas></div>'+
   '<div class="msg">Trois symboles pareils : tu gagnes !</div><div class="lig"><button class="bt tout" disabled>Tout gratter</button></div><button class="gros">ACHETER UN TICKET<small>50 €</small></button>'+
   '<div class="info">'+[6,5,4,3,2,1].map(i=>'<span style="display:inline-flex;align-items:center;gap:2px;margin:2px 6px"><canvas data-s="'+GSYM[i]+'" width="44" height="44" style="width:22px;height:22px"></canvas>×3 = <b style="color:#fff2b8">'+fmt(5000*GMUL[i])+'</b></span>').join('')+'</div>';
  C.querySelectorAll('canvas[data-s]').forEach(c=>sym(c.getContext('2d'),c.dataset.s,22,22,38));
  const fd=C.querySelector('.fond'),gr=C.querySelector('.gr'),Wd=320,Hd=220,g=toile(fd,Wd,Hd),q=toile(gr,Wd,Hd),msg=C.querySelector('.msg'),bt=C.querySelector('.gros'),tout=C.querySelector('.tout');
  let R=null,FINI=true,GRAT=0;
  function fond(grille,lot,brille){g.clearRect(0,0,Wd,Hd);g.fillStyle=lin(g,0,0,Wd,Hd,[[0,'#ffe680'],[.5,'#ffb43a'],[1,'#ff6a3a']]);g.fillRect(0,0,Wd,Hd);
    g.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<14;i++){g.beginPath();g.moveTo(Wd/2,-40);g.arc(Wd/2,-40,500,i*.45,i*.45+.2);g.fill();}
    g.fillStyle='#5a0c1c';g.font='900 18px '+SERIF;g.textAlign='center';g.fillText('LE TRÉSOR DU PORT',Wd/2,26);
    const x0=40,y0=40,cw=80,ch=56;for(let i=0;i<9;i++){const x=x0+(i%3)*cw,y=y0+Math.floor(i/3)*ch;g.fillStyle=brille&&grille&&grille[i]===lot?'rgba(122,255,138,.55)':'rgba(255,253,246,.9)';g.beginPath();g.roundRect?g.roundRect(x+4,y+4,cw-8,ch-8,10):g.rect(x+4,y+4,cw-8,ch-8);g.fill();
      if(grille)sym(g,GSYM[grille[i]]||'mouette',x+cw/2,y+ch/2,40);}
    g.fillStyle='#5a0c1c';g.font='700 10px '+SANS;g.fillText('n° '+String(Math.floor(Math.random()*900000+100000)),Wd-40,Hd-8);}
  function couche(){q.globalCompositeOperation='source-over';q.clearRect(0,0,Wd,Hd);const x0=40,y0=40;q.fillStyle=lin(q,0,y0,0,y0+168,[[0,'#d8d8e0'],[.5,'#a8a8b4'],[1,'#c8c8d0']]);
    q.beginPath();q.roundRect?q.roundRect(x0,y0,240,168,12):q.rect(x0,y0,240,168);q.fill();q.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<60;i++)q.fillRect(x0+Math.random()*240,y0+Math.random()*168,2,1);
    q.fillStyle='rgba(60,60,70,.55)';q.font='900 16px '+SANS;q.textAlign='center';q.fillText('GRATTE ICI',Wd/2,y0+96);q.beginPath();q.arc(Wd/2,y0+62,14,0,7);q.fill();q.fillStyle='rgba(255,255,255,.35)';q.beginPath();q.arc(Wd/2,y0+62,9,0,7);q.fill();GRAT=0;}
  fond(null,0,false);couche();
  let dn=false;const pt=ev=>{const r=gr.getBoundingClientRect();return [(ev.clientX-r.left)/r.width*Wd,(ev.clientY-r.top)/r.height*Hd];};
  function gratte(x,y){if(FINI)return;q.globalCompositeOperation='destination-out';q.fillStyle='#000';q.beginPath();q.arc(x,y,16,0,7);q.fill();GRAT++;if(GRAT%3===0){son('tic');vib(3);}if(GRAT%12===0)verif();}
  function verif(){try{const d=q.getImageData(40*(gr.width/Wd),40*(gr.height/Hd),240*(gr.width/Wd),168*(gr.height/Hd)).data;let n=0,v=0;for(let i=3;i<d.length;i+=64){n++;if(d[i]<40)v++;}if(v/n>.62)reveler();}catch(x){}}
  gr.addEventListener('pointerdown',ev=>{dn=true;try{gr.setPointerCapture(ev.pointerId);}catch(x){}const [x,y]=pt(ev);gratte(x,y);});
  gr.addEventListener('pointermove',ev=>{if(!dn)return;const [x,y]=pt(ev);gratte(x,y);});gr.addEventListener('pointerup',()=>{dn=false;});gr.addEventListener('pointercancel',()=>{dn=false;});
  function reveler(){if(FINI||!R)return;FINI=true;tout.disabled=true;bt.disabled=false;
    const t0=performance.now();const fade=()=>{const u=Math.min(1,(performance.now()-t0)/350);gr.style.opacity=String(1-u);if(u<1)requestAnimationFrame(fade);else{q.clearRect(0,0,Wd,Hd);gr.style.opacity='1';}};fade();
    const lot=R.tirage&&R.tirage.lot||0;fond(R.tirage&&R.tirage.grille,lot,lot>0);majSolde(R.euros,R.gain);cagnotte(R);
    if(R.gain>0){msg.className='msg g';msg.textContent=(lot>=5?'FABULEUX ! ':'Gagné ! ')+'+ '+fmt(R.gain);bravo(fd,R.gain,5000);}else{msg.className='msg';msg.textContent='Perdu… mais le prochain ?';son('perdu');}}
  tout.onclick=()=>{vib(8);reveler();};
  bt.onclick=async()=>{if(!FINI)return;if(solde()<5000){msg.className='msg p';msg.textContent='Il te manque de quoi acheter un ticket.';return;}
    bt.disabled=true;msg.className='msg';msg.textContent='La caissière détache un ticket…';vib(8);son('piece');majSolde(solde()-5000);
    const r=await rpcS('casino_coup',{p_jeu:'grattage',p_mise:5000,p_choix:{}});if(!vivant(gr))return;
    if(!r||!r.ok){bt.disabled=false;msg.className='msg p';msg.textContent=erreur(r);majSolde(r&&typeof r.euros==='number'?r.euros:solde()+5000);return;}
    R=r;fond(r.tirage&&r.tirage.grille,0,false);couche();FINI=false;tout.disabled=false;msg.textContent='Gratte avec ton doigt !';};}

/* ======================= LA CAGNOTTE ======================= */
function jeuCagnotte(c){const C=ouvrir('La Cagnotte du Port','À GAGNER À N’IMPORTE QUELLE TABLE');const v=(window.CASINO_CAGNOTTE&&CASINO_CAGNOTTE())||c||0;
  C.innerHTML='<div class="feutre" style="background:radial-gradient(ellipse at 50% 30%,#7a1a2a,#2a0610);text-align:center;padding:26px 10px"><div style="font:600 12px '+SANS+';letter-spacing:.3em;color:#d8b878">EN CE MOMENT</div><div class="mt" style="font:900 44px '+SERIF+';background:linear-gradient(#fff6c8,#f0c860 55%,#b8801c);-webkit-background-clip:text;background-clip:text;color:transparent">'+(v?fmt(v):'…')+'</div></div>'+
   '<div class="info" style="font-size:14px">À chaque coup joué, à n’importe quelle table, la cagnotte monte : 1 € de la maison, plus 3 % de la mise.<br><br>Et à chaque coup misé, n’importe où dans le casino, il y a <b style="color:#fff2b8">une chance sur trois mille</b> de tout rafler d’un coup.<br><br>Plus on joue, plus elle grossit…</div>';}

/* ======================= L'AIGUILLAGE ======================= */
window.casinoJouer=function(k,arg){try{({sous:jeuSous,roulette:jeuRoulette,vingtun:jeu21,grattage:jeuGrattage,cagnotte:jeuCagnotte})[k](arg);}catch(x){try{console.warn('CASINO',k,x);}catch(_){}}};
})();
