/* =====================================================================
   POSTE N°1 — L'EMBARQUEMENT (gare maritime). Un écran à part (#emb).
   On voit la cale du ferry d'en haut : 4 files. Les véhicules arrivent
   un par un ; on touche la file où les envoyer. Chaque file se remplit
   depuis l'avant. Une moto prend 1 place, une voiture 2, un camping-car
   3, un camion 4. Si ça ne rentre pas, ça klaxonne. Cale pleine : le
   ferry part, un autre arrive. 75 secondes. Gratuit pour l'instant.
   ===================================================================== */
(()=>{
const FILES=4,PLACES=12,DUREE=75;
const TYPES=[{k:'moto',n:1,p:.14},{k:'voiture',n:2,p:.46},{k:'camping',n:3,p:.22},{k:'camion',n:4,p:.18}];
const COULS=['#c8402a','#3a6ab8','#e8e8e8','#2a2a2a','#e8a020','#3a8a5a','#e86aa0','#6a4ad8'];
const vib=x=>{try{navigator.vibrate&&navigator.vibrate(x);}catch(_){}};
let AC=null;const ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(x){}}if(AC&&AC.state==='suspended')AC.resume();return AC;};
function note(f,t0,d,type,vol){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(vol||.05,a.currentTime+t0);g.gain.exponentialRampToValueAtTime(.0005,a.currentTime+t0+d);o.connect(g).connect(a.destination);o.start(a.currentTime+t0);o.stop(a.currentTime+t0+d+.02);}
const SON={klaxon(){note(392,0,.18,'square',.06);note(392,.24,.3,'square',.06);},ok(){note(660,0,.08);note(990,.07,.12);},corne(){note(98,0,1.2,'sawtooth',.07);note(147,0,1.2,'sawtooth',.04);}};
function svgVehicule(t,col){const L=t.n*30-6;
  if(t.k==='moto')return '<svg viewBox="0 0 24 16" preserveAspectRatio="none" style="width:100%;height:100%"><rect x="2" y="6" width="20" height="4" rx="2" fill="#2a2a2a"/><rect x="8" y="3" width="8" height="10" rx="3" fill="'+col+'"/><circle cx="12" cy="8" r="2.5" fill="#f2c230"/></svg>';
  if(t.k==='voiture')return '<svg viewBox="0 0 54 26" preserveAspectRatio="none" style="width:100%;height:100%"><rect x="1" y="2" width="52" height="22" rx="7" fill="'+col+'"/><rect x="14" y="5" width="26" height="16" rx="4" fill="#2a3a4a"/><rect x="18" y="7" width="18" height="12" rx="2" fill="'+col+'"/><rect x="47" y="5" width="4" height="4" fill="#fff6c8"/><rect x="47" y="17" width="4" height="4" fill="#fff6c8"/></svg>';
  if(t.k==='camping')return '<svg viewBox="0 0 84 28" preserveAspectRatio="none" style="width:100%;height:100%"><rect x="1" y="2" width="82" height="24" rx="5" fill="#f6f6f2"/><rect x="1" y="16" width="82" height="3" fill="#3a8ac4"/><rect x="66" y="5" width="14" height="18" rx="3" fill="#2a3a4a"/><rect x="10" y="6" width="20" height="8" rx="2" fill="#9ac8e8"/><rect x="40" y="6" width="12" height="8" rx="2" fill="#9ac8e8"/></svg>';
  return '<svg viewBox="0 0 114 28" preserveAspectRatio="none" style="width:100%;height:100%"><rect x="1" y="2" width="86" height="24" rx="2" fill="'+col+'"/>'+[...Array(14)].map((_,i)=>'<rect x="'+(4+i*6)+'" y="4" width="1.5" height="20" fill="rgba(0,0,0,.18)"/>').join('')+'<rect x="89" y="3" width="24" height="22" rx="4" fill="#e8e8e8"/><rect x="104" y="6" width="7" height="16" rx="2" fill="#2a3a4a"/></svg>';}
const CSS=`#emb{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#1a2430;color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s}
#emb.on{opacity:1}#emb *{box-sizing:border-box}#emb *::after{content:none!important;display:none!important}
#emb .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 8px}
#emb .bar b{font:900 17px/1 'Baloo 2',system-ui,sans-serif}#emb .bar small{display:block;font:800 9px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8ab4d8}
#emb .sp{flex:1}#emb .x{height:38px;padding:0 14px;border-radius:19px;border:0;background:rgba(255,255,255,.14);color:#fff;font:800 13px 'Baloo 2',system-ui,sans-serif}
#emb .hud{flex:none;display:flex;gap:6px;justify-content:center;padding:0 12px 8px}
#emb .hud span{background:#2a3a4a;border-radius:12px;padding:4px 10px;font:900 15px 'Baloo 2',system-ui,sans-serif}#emb .hud .urg{background:#d8402a}
#emb .cale{flex:1;min-height:0;margin:0 10px;border-radius:18px;background:#4a525c;border:4px solid #2a3038;position:relative;display:flex;flex-direction:column;justify-content:space-evenly;padding:10px 8px 10px 38px;overflow:hidden}
#emb .cale::before{content:'';position:absolute;left:0;top:0;bottom:0;width:30px;background:repeating-linear-gradient(0deg,#f2c230 0 10px,#2a2a2a 10px 20px)}
#emb .rampe{position:absolute;left:4px;top:50%;transform:translateY(-50%) rotate(-90deg);font:900 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:3px;color:#2a2016;white-space:nowrap;background:#f2c230;padding:0 4px}
#emb .file{position:relative;height:40px;border-radius:8px;background:#5a6470;border:2px dashed #7a8490;display:flex;justify-content:flex-end;align-items:center;padding:0 3px;gap:3px;transition:background .15s}
#emb .file:active{background:#6a7480}#emb .file.non{animation:embN .35s}@keyframes embN{30%,70%{transform:translateX(-6px)}50%{transform:translateX(6px)}}
#emb .file .reste{position:absolute;left:8px;top:50%;transform:translateY(-50%);font:800 11px 'Baloo 2',system-ui,sans-serif;color:#b8c0c8}
#emb .veh{flex:none;display:flex;align-items:center;justify-content:center;animation:embIn .45s cubic-bezier(.2,1,.3,1)}@keyframes embIn{from{transform:translateX(-260px);opacity:.3}}
#emb .att{flex:none;margin:10px 10px 0;background:#2a3a4a;border-radius:16px;padding:8px 12px;display:flex;align-items:center;gap:10px}
#emb .att .q{display:flex;gap:8px;align-items:center;flex:1;overflow:hidden}#emb .att .q div{opacity:.5;transform:scale(.8)}#emb .att .q div:first-child{opacity:1;transform:none}
#emb .att small{font:800 11px 'Baloo 2',system-ui,sans-serif;color:#8ab4d8;letter-spacing:1.5px}
#emb .aide{flex:none;text-align:center;font:700 13px 'Baloo 2',system-ui,sans-serif;color:#b8c8d8;padding:8px 14px calc(12px + env(safe-area-inset-bottom))}
#emb .fin{position:absolute;inset:0;background:rgba(10,16,24,.82);display:grid;place-items:center;padding:24px;z-index:3}
#emb .fin .c{width:min(330px,88vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:18px;text-align:center;box-shadow:0 6px 0 #b8a890}
#emb .fin h2{margin:4px 0 10px;font:900 24px/1.1 'Baloo 2',system-ui,sans-serif}#emb .fin p{margin:0 0 6px;font:700 15px 'Baloo 2',system-ui,sans-serif}
#emb .fin button{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#emb .fin .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#emb .fin .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}`;
let RAC=null,J=null,TIC=null;
function tirer(){let r=Math.random(),a=0;for(const t of TYPES){a+=t.p;if(r<a)return {t,col:COULS[(Math.random()*COULS.length)|0]};}return {t:TYPES[1],col:COULS[0]};}
function rendre(){if(!RAC)return;const z=RAC.querySelector('.cale');const f0=z.querySelector('.file');if(f0&&f0.clientWidth)z.style.setProperty('--p',((f0.clientWidth-10)/PLACES)+'px');
  z.querySelectorAll('.file').forEach((f,i)=>{const L=J.files[i],libre=PLACES-L.reduce((s,v)=>s+v.t.n,0);
    if(f.childElementCount-1!==L.length){f.innerHTML='<span class="reste"></span>'+L.slice().reverse().map((v,k)=>'<div class="veh" style="width:calc(var(--p) * '+v.t.n+' - 3px);height:'+(v.t.k==='moto'?16:26)+'px'+(k===0&&J.dernier===i?'':';animation:none')+'">'+svgVehicule(v.t,v.col)+'</div>').join('');}
    f.querySelector('.reste').textContent=libre?libre+' place'+(libre>1?'s':''):'PLEINE';});
  RAC.querySelector('.q').innerHTML=J.queue.slice(0,3).map(v=>'<div style="width:'+(v.t.n*24)+'px;height:'+(v.t.k==='moto'?14:22)+'px;flex:none">'+svgVehicule(v.t,v.col)+'</div>').join('');
  const r=Math.max(0,DUREE-(performance.now()-J.t0)/1000);
  RAC.querySelector('.hud').innerHTML='<span class="'+(r<10?'urg':'')+'">⏱ '+Math.ceil(r)+' s</span><span>🚗 '+J.charges+'</span><span>⛴ '+J.ferries+'</span>'+(J.serie>2?'<span style="background:#f2a020">×'+J.serie+'</span>':'');}
function envoyer(i){if(!J||J.fini)return;const v=J.queue[0],L=J.files[i],libre=PLACES-L.reduce((s,x)=>s+x.t.n,0);ac();
  const f=RAC.querySelectorAll('.file')[i];
  if(v.t.n>libre){SON.klaxon();vib([30,30,30]);J.serie=0;f.classList.remove('non');void f.offsetWidth;f.classList.add('non');aide(v.t.k==='camion'?'Le camion ne rentre pas là !':'Ça rentre pas, chef !');return;}
  L.push(v);J.queue.shift();J.queue.push(tirer());J.charges++;J.serie++;J.dernier=i;vib(10);SON.ok();
  if(J.files.every(F=>PLACES-F.reduce((s,x)=>s+x.t.n,0)<1)){J.ferries++;SON.corne();vib([40,60,40]);aide('Cale pleine ! Le ferry part, au suivant !');J.files=[[],[],[],[]];J.dernier=-1;RAC.querySelectorAll('.file').forEach(x=>x.innerHTML='<span class="reste"></span>');}
  else if(!J.files.some(F=>PLACES-F.reduce((s,x)=>s+x.t.n,0)>=J.queue[0].t.n)){aide('Plus de place pour celui-là : il prendra le prochain ferry');J.queue.shift();J.queue.push(tirer());}
  rendre();}
function aide(t){const a=RAC&&RAC.querySelector('.aide');if(a){a.textContent=t;clearTimeout(aide.t);aide.t=setTimeout(()=>{if(RAC)a.textContent='Touche une file pour y envoyer le véhicule';},1800);}}
function finir(){J.fini=true;clearInterval(TIC);const d=document.createElement('div');d.className='fin';
  d.innerHTML='<div class="c"><small style="font:800 11px \'Baloo 2\',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a">FIN DE LA VACATION</small><h2>'+(J.charges>=30?'Placier de légende !':J.charges>=18?'Belle cale, collègue !':'Ça viendra !')+'</h2><p>'+J.charges+' véhicules embarqués</p><p>'+J.ferries+' ferry'+(J.ferries>1?'s':'')+' rempli'+(J.ferries>1?'s':'')+'</p><p style="color:#8a7a5a;font-size:13px">Poste gratuit pour l’instant : pas de paie.</p><button class="b1">Rejouer</button><button class="b2">Retour au quai</button></div>';
  RAC.appendChild(d);d.querySelector('.b1').onclick=()=>{d.remove();demarrer();};d.querySelector('.b2').onclick=fermer;}
function demarrer(){J={files:[[],[],[],[]],queue:[tirer(),tirer(),tirer(),tirer()],t0:performance.now(),charges:0,ferries:0,serie:0,dernier:-1,fini:false};
  RAC.querySelectorAll('.file').forEach(x=>x.innerHTML='<span class="reste"></span>');rendre();clearInterval(TIC);TIC=setInterval(()=>{rendre();if((performance.now()-J.t0)/1000>=DUREE)finir();},250);}
function fermer(){if(!RAC)return;clearInterval(TIC);const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);}
window.ouvrirEmbarquement=function(){if(RAC)return;if(!document.getElementById('embCss')){const s=document.createElement('style');s.id='embCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='emb';RAC=d;
  d.innerHTML='<div class="bar"><div><b>L’embarquement</b><small>POSTE N°1 · FERRY CORSE</small></div><span class="sp"></span><button class="x">Quitter</button></div><div class="hud"></div>'+
    '<div class="cale"><span class="rampe">RAMPE</span>'+[0,1,2,3].map(()=>'<div class="file"><span class="reste"></span></div>').join('')+'</div>'+
    '<div class="att"><small>SUIVANT</small><div class="q"></div></div><div class="aide">Touche une file pour y envoyer le véhicule</div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  d.querySelector('.x').onclick=fermer;d.querySelectorAll('.file').forEach((f,i)=>f.onclick=()=>envoyer(i));demarrer();};
})();
