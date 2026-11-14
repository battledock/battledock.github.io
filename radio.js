/* =====================================================================
   LA RADIO DU PORT — quatre stations, jouées en direct (rien à télécharger :
   tout est synthétisé, note par note). Elle remplace la musique du jeu,
   partout, et se tait d'elle-même au Disco Club ou quand on danse.
   Chargé par moteur.js (eval direct) : voit A, SEC, SON_PRET, V, DISCO_SON,
   vibrer, texteVolant, joueur, ambiancer…
   Le choix est gardé (localStorage bd_radio, bd_radio_vol).
   ===================================================================== */
(()=>{
const STATIONS=[
 {id:'calanques',nom:'Radio Calanques',freq:'88.2',genre:'lo-fi · chill',ic:'🌊',c:'#3ac8b8',bpm:78},
 {id:'massilia',nom:'Massilia Funk',freq:'94.6',genre:'funk · groove',ic:'🎸',c:'#ff8a3a',bpm:104},
 {id:'guinguette',nom:'Bal du Vieux-Port',freq:'99.1',genre:'musette · valse',ic:'🪗',c:'#ffd23a',bpm:132},
 {id:'nuit',nom:'Nuit Bleue',freq:'103.7',genre:'ambiance · vagues',ic:'🌙',c:'#8a7aff',bpm:60}];
const R={on:null,vol:.6,bus:null,tic:null,next:0,pas:0,bruit:null,mute:false};
try{R.vol=Math.max(0,Math.min(1,parseFloat(localStorage.getItem('bd_radio_vol'))||.6));}catch(x){}
const hz=m=>440*Math.pow(2,(m-69)/12);
let BRUIT=null;function bruitBuf(c){if(BRUIT)return BRUIT;const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;BRUIT=b;return b;}
/* ---------- les instruments ---------- */
function env(c,g,t0,a,v,d){g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(v,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+d);}
function osc(c,ty,f,t0,dur,v,out,filt){const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=f;let n=o;if(filt){const F=c.createBiquadFilter();F.type=filt[0];F.frequency.value=filt[1];if(filt[2])F.Q.value=filt[2];o.connect(F);n=F;}n.connect(g);g.connect(out);env(c,g,t0,Math.min(.02,dur/4),v,dur);o.start(t0);o.stop(t0+dur+.05);return o;}
function kick(c,t0,v,out){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(120,t0);o.frequency.exponentialRampToValueAtTime(40,t0+.13);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.001,t0+.25);o.connect(g).connect(out);o.start(t0);o.stop(t0+.3);}
function bruit(c,t0,dur,v,ty,f,out,q){const s=c.createBufferSource(),F=c.createBiquadFilter(),g=c.createGain();s.buffer=bruitBuf(c);F.type=ty;F.frequency.value=f;if(q)F.Q.value=q;g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dur);s.connect(F).connect(g).connect(out);s.start(t0,Math.random()*1.5);s.stop(t0+dur+.02);}
function rhodes(c,m,t0,dur,v,out){const f=hz(m);osc(c,'sine',f,t0,dur,v,out);osc(c,'triangle',f*2.001,t0,dur*.6,v*.25,out);}
/* ---------- les morceaux (une mesure à la fois) ---------- */
const MORCEAUX={
 calanques:(c,t,out,n)=>{const b=60/78,sw=b*.18,P=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]],ch=P[n%4];
  for(let k=0;k<4;k++){const t0=t+k*b;if(k===0||k===2||(k===3&&n%2))kick(c,t0+(k===3?b/2:0),.32,out);if(k%2)bruit(c,t0,.16,.12,'bandpass',1800,out,.8);
   bruit(c,t0+b/2+sw,.05,.035,'highpass',7000,out);bruit(c,t0,.05,.03,'highpass',7000,out);}
  ch.forEach((m,i)=>rhodes(c,m,t+i*.012,b*3.6,.045,out));rhodes(c,ch[3]+12,t+b*2.5,b*1.2,.03,out);
  osc(c,'sine',hz(ch[0]-24),t,b*1.8,.16,out);osc(c,'sine',hz(ch[0]-24+7),t+b*2.5,b*1.2,.12,out);
  for(let k=0;k<6;k++)bruit(c,t+Math.random()*b*4,.012,.04,'highpass',3000,out);},
 massilia:(c,t,out,n)=>{const b=60/104,s=b/4,P=[40,40,43,45],r=P[n%4];
  for(let k=0;k<16;k++){const t0=t+k*s;if(k===0||k===7||k===10)kick(c,t0,.42,out);if(k===4||k===12)bruit(c,t0,.14,.2,'bandpass',2000,out,1);bruit(c,t0,.03,k%2?.03:.05,'highpass',8000,out);}
  [[0,0],[3,12],[6,10],[7,12],[10,7],[11,0],[14,12]].forEach(([k,d])=>osc(c,'sawtooth',hz(r+d),t+k*s,s*1.6,.11,out,['lowpass',700,4]));
  [2,6,9,13].forEach(k=>[r+24+4,r+24+7,r+24+10].forEach(m=>osc(c,'square',hz(m),t+k*s,s*.6,.018,out,['bandpass',1600,2])));},
 guinguette:(c,t,out,n)=>{const b=60/132,P=[[48,52,55],[43,47,50],[43,47,50],[48,52,55],[41,45,48],[48,52,55],[43,47,50],[48,52,55]],ch=P[n%8],
  M=[[67,64,60],[65,62,59],[67,65,62],[64,67,72],[69,65,72],[67,64,60],[65,62,59],[60,64,60]][n%8];
  osc(c,'triangle',hz(ch[0]-12),t,b*.8,.14,out);ch.forEach(m=>{osc(c,'square',hz(m),t+b,b*.4,.02,out,['lowpass',1400]);osc(c,'square',hz(m),t+b*2,b*.4,.02,out,['lowpass',1400]);});
  M.forEach((m,i)=>{const t0=t+i*b;[0,.004].forEach((d,j)=>{const o=osc(c,'sawtooth',hz(m)*(1+d),t0,b*.95,.045,out,['lowpass',2400]);try{const l=c.createOscillator(),lg=c.createGain();l.frequency.value=6;lg.gain.value=4;l.connect(lg).connect(o.frequency);l.start(t0);l.stop(t0+b);}catch(x){}});});},
 nuit:(c,t,out,n)=>{const b=1,P=[[45,52,57,60,64],[41,48,53,57,60],[43,50,55,59,62],[40,47,52,55,59]],ch=P[n%4];
  ch.forEach((m,i)=>{const o=c.createOscillator(),F=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=hz(m)*(1+(i%2?.003:-.003));F.type='lowpass';F.frequency.value=700;o.connect(F).connect(g).connect(out);
   g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(.022,t+1.4);g.gain.linearRampToValueAtTime(.0001,t+4.2);o.start(t);o.stop(t+4.3);});
  [0,1,2,3].forEach(k=>{if(Math.random()<.7){const m=ch[1+Math.floor(Math.random()*4)]+12;const o=osc(c,'sine',hz(m),t+k*b+Math.random()*.2,2.4,.04,out);}});
  bruit(c,t,4,.06,'lowpass',500,out);bruit(c,t+1.8,2.2,.04,'lowpass',900,out);}};
const DUREE={calanques:4*60/78,massilia:4*60/104,guinguette:3*60/132,nuit:4};
/* ---------- le poste ---------- */
function couper(){if(R.tic){clearInterval(R.tic);R.tic=null;}if(R.bus){const b=R.bus;try{b.gain.setTargetAtTime(0.0001,A().currentTime,.2);}catch(x){}setTimeout(()=>{try{b.disconnect();}catch(x){}},900);R.bus=null;}window.RADIO_ON=null;try{ambiancer();}catch(x){}}
function gainVoulu(){if(typeof window!=='undefined'&&(window.LIEU_PAGE==='club'||(typeof DISCO_SON!=='undefined'&&DISCO_SON)||document.hidden))return 0.0001;return Math.max(.0001,R.vol*.9*Math.max(.4,(V&&V.mus?V.mus/.34:1)));}
function allumer(id){const S=STATIONS.find(s=>s.id===id);if(!S){couper();R.on=null;try{localStorage.setItem('bd_radio','');}catch(x){}return;}
 couper();R.on=id;window.RADIO_ON=id;try{localStorage.setItem('bd_radio',id);}catch(x){}
 try{if(!SON_PRET)return;const c=A();if(!c)return;if(c.state==='suspended')c.resume();const bus=c.createGain();bus.gain.value=.0001;bus.connect(SEC);R.bus=bus;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.connect(bus);R.out=comp;
  R.next=c.currentTime+.15;R.pas=0;bus.gain.setTargetAtTime(gainVoulu(),c.currentTime,.4);
  try{ambiancer();}catch(x){}
  R.tic=setInterval(()=>{try{const c2=A();if(!R.bus)return;R.bus.gain.setTargetAtTime(gainVoulu(),c2.currentTime,.25);
    while(R.next<c2.currentTime+1.2){if(gainVoulu()>.001)MORCEAUX[R.on](c2,R.next,R.out,R.pas);R.next+=DUREE[R.on];R.pas++;}}catch(x){}},250);}catch(x){}}
window.RADIO={allumer,couper,STATIONS,etat:()=>({on:R.on,vol:R.vol}),volume:v=>{R.vol=Math.max(0,Math.min(1,v));try{localStorage.setItem('bd_radio_vol',String(R.vol));}catch(x){}try{if(R.bus)R.bus.gain.setTargetAtTime(gainVoulu(),A().currentTime,.1);}catch(x){}}};
/* ---------- le transistor (l'écran) ---------- */
const CSS=`#rdo{position:fixed;inset:0;z-index:2147482300;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,10,18,.5);font-family:'Baloo 2',system-ui,sans-serif;opacity:0;transition:opacity .2s;user-select:none;-webkit-user-select:none}
#rdo.on{opacity:1}#rdo *{box-sizing:border-box}
#rdo .rdtr{width:100%;max-width:520px;margin:0 10px calc(14px + env(safe-area-inset-bottom,0px));border-radius:28px;padding:16px;background:linear-gradient(#c84a2a,#9a2a1a);box-shadow:0 6px 0 #5a1408,0 20px 50px rgba(0,0,0,.5);transform:translateY(30px);transition:transform .25s;position:relative}
#rdo.on .tr{transform:none}
#rdo .rdanse{position:absolute;left:30%;right:30%;top:-16px;height:22px;border:6px solid #3a2a20;border-bottom:0;border-radius:16px 16px 0 0}
#rdo .rdhd{display:flex;align-items:center;gap:8px;color:#fff2e0}#rdo .rdhd b{flex:1;font:900 22px 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;text-shadow:0 2px 0 rgba(0,0,0,.25)}
#rdo .rdx{width:36px;height:36px;border-radius:50%;border:0;background:rgba(0,0,0,.25);color:#fff;font:800 15px 'Baloo 2',system-ui,sans-serif}
#rdo .rdcad{margin-top:10px;border-radius:16px;background:#f6e8c8;padding:12px 14px 10px;box-shadow:inset 0 3px 8px rgba(0,0,0,.25);position:relative;overflow:hidden}
#rdo .rdgr{display:flex;justify-content:space-between;font:800 11px 'Baloo 2',system-ui,sans-serif;color:#7a5a3a}#rdo .rdgr span{width:1px;height:10px;background:#7a5a3a;display:inline-block}
#rdo .rdaig{position:absolute;top:6px;height:42px;width:3px;border-radius:2px;background:#d8261a;box-shadow:0 0 6px rgba(216,38,26,.6);transition:left .45s cubic-bezier(.3,1.4,.5,1)}
#rdo .rdnp{margin-top:8px;text-align:center;font:900 18px 'Baloo 2',system-ui,sans-serif;color:#3a2010;min-height:26px}#rdo .rdnp small{display:block;font-size:12px;color:#8a6a4a;font-weight:700;letter-spacing:2px}
#rdo .rdeq{display:flex;gap:3px;justify-content:center;height:16px;align-items:flex-end;margin-top:4px}#rdo .rdeq i{width:4px;background:#d8261a;border-radius:1px;animation:rdoEq .8s ease-in-out infinite}
@keyframes rdoEq{0%,100%{height:3px}50%{height:15px}}#rdo .rdeq.eteint i{animation:none;height:2px;opacity:.4}
#rdo .rdst{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}
#rdo .rdst button{border:0;border-radius:16px;padding:10px 8px;background:#2a1a14;color:#fff2e0;font:800 14px 'Baloo 2',system-ui,sans-serif;text-align:left;display:flex;gap:8px;align-items:center;box-shadow:0 3px 0 #120a06}
#rdo .rdst button i{font-style:normal;font-size:22px}#rdo .rdst button small{display:block;font-size:10.5px;color:#c8a888;font-weight:700}
#rdo .rdst button.on{background:#fff2e0;color:#2a1a14;box-shadow:0 3px 0 #b89a78}#rdo .rdst button.on small{color:#8a6a4a}
#rdo .rdbas{display:flex;align-items:center;gap:10px;margin-top:12px;color:#fff2e0;font-weight:800;font-size:13px}
#rdo input[type=range]{flex:1;accent-color:#f6e8c8}
#rdo .rdoff{border:0;border-radius:14px;padding:8px 14px;background:rgba(0,0,0,.3);color:#fff2e0;font:800 13px 'Baloo 2',system-ui,sans-serif}`;
let RAC=null;
function rendre(){if(!RAC)return;const on=R.on,S=STATIONS.find(s=>s.id===on);const i=S?STATIONS.indexOf(S):-1;
 RAC.querySelector('.rdaig').style.left=(i<0?4:12+i*(76/(STATIONS.length-1)))+'%';
 RAC.querySelector('.rdnp').innerHTML=S?(S.ic+' '+S.nom+'<small>'+S.freq+' FM · '+S.genre.toUpperCase()+'</small>'):'Radio éteinte<small>CHOISIS UNE STATION</small>';
 RAC.querySelector('.rdeq').classList.toggle('eteint',!S);RAC.querySelectorAll('.rdst button').forEach(b=>b.classList.toggle('on',b.dataset.s===on));}
function fermer(){if(!RAC)return;const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),220);}
window.ouvrirRadio=function(){if(RAC)return;if(!document.getElementById('rdoCss')){const s=document.createElement('style');s.id='rdoCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='rdo';RAC=d;
 d.innerHTML='<div class="rdtr"><div class="rdanse"></div><div class="rdhd"><b>📻 La radio du port</b><button class="rdx" aria-label="Fermer">✕</button></div>'+
  '<div class="rdcad"><div class="rdgr">'+'<span></span>'.repeat(21)+'</div><div class="rdgr" style="margin-top:2px"><em style="font-style:normal">88</em><em style="font-style:normal">92</em><em style="font-style:normal">96</em><em style="font-style:normal">100</em><em style="font-style:normal">104</em></div><div class="rdaig"></div>'+
  '<div class="rdnp"></div><div class="rdeq">'+'<i style="animation-delay:-.1s"></i><i style="animation-delay:-.5s"></i><i style="animation-delay:-.3s"></i><i style="animation-delay:-.7s"></i><i style="animation-delay:-.2s"></i><i style="animation-delay:-.6s"></i>'+'</div></div>'+
  '<div class="rdst">'+STATIONS.map(s=>'<button data-s="'+s.id+'"><i>'+s.ic+'</i><span>'+s.nom+'<small>'+s.freq+' · '+s.genre+'</small></span></button>').join('')+'</div>'+
  '<div class="rdbas">🔈<input type="range" min="0" max="100" value="'+Math.round(R.vol*100)+'">🔊<button class="rdoff">Éteindre</button></div>'+
  (window.LIEU_PAGE==='club'?'<div style="margin-top:8px;color:#fff2e0;font-size:12.5px;font-weight:700;text-align:center">Au Disco Club, c’est le DJ qui joue : la radio reprendra en sortant.</div>':'')+'</div>';
 document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;
 d.querySelector('.rdx').onclick=()=>{try{vibrer(8);}catch(x){}fermer();};d.addEventListener('click',ev=>{if(ev.target===d)fermer();});
 d.querySelectorAll('.rdst button').forEach(b=>b.onclick=()=>{try{vibrer([6,20,6]);}catch(x){}allumer(b.dataset.s);rendre();});
 d.querySelector('.rdoff').onclick=()=>{try{vibrer(8);}catch(x){}allumer(null);rendre();};
 d.querySelector('input').oninput=ev=>window.RADIO.volume(ev.target.value/100);
 rendre();};
/* au réveil du son, on rallume la dernière station */
try{const s=localStorage.getItem('bd_radio');if(s)allumer(s);}catch(x){}
})();
