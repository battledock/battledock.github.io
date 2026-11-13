/* =====================================================================
   LES JEUX DE LA FÊTE FORAINE (forain.js), ouverts depuis foire.js.
   Chamboule-tout, tir aux canards, pêche aux canards, auto-tamponneuses,
   et le guichet où l'on échange ses tickets contre des lots.
   Chargé par eval dans la portée du moteur : e, sauver, personne, vibrer.
   ===================================================================== */
(()=>{
let RAC=null,CV=null,G=null,JEU=null,RAF=0;
const vib=x=>{try{vibrer(x);}catch(z){try{navigator.vibrate&&navigator.vibrate(x);}catch(_){}}};
const hasard=Math.random,ALEA=L=>L[(hasard()*L.length)|0];
const tickets=()=>{try{return Math.max(0,e.tickets|0);}catch(x){return 0;}};
function gagner(n){try{e.tickets=tickets()+n;sauver();}catch(x){}majTk();}
function majTk(){const b=RAC&&RAC.querySelector('.ftk b');if(b)b.textContent=tickets();}

/* ---------- LE SON ---------- */
let AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(x){}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function note(f,t0,d,type,vol,glis){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,a.currentTime+t0);
  if(glis)o.frequency.exponentialRampToValueAtTime(glis,a.currentTime+t0+d);g.gain.setValueAtTime(0,a.currentTime+t0);g.gain.linearRampToValueAtTime(vol||.07,a.currentTime+t0+.01);
  g.gain.exponentialRampToValueAtTime(.0005,a.currentTime+t0+d);o.connect(g).connect(a.destination);o.start(a.currentTime+t0);o.stop(a.currentTime+t0+d+.02);}
function bruit(d,f,vol){const a=ac();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(hasard()*2-1)*Math.pow(1-i/n,3);
  const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=b;fl.type='bandpass';fl.frequency.value=f||1200;g.gain.value=vol||.3;s.connect(fl).connect(g).connect(a.destination);s.start();}
const SON={
  lancer(){note(300,0,.18,'triangle',.06,700);},
  boite(){bruit(.18,2400,.35);note(900,0,.05,'square',.04);},
  pan(){bruit(.12,900,.5);note(160,0,.08,'square',.06,80);},
  ding(){note(1320,0,.1,'square',.05);note(1760,.08,.25,'square',.05);},
  rate(){note(260,0,.2,'triangle',.05,180);},
  gain(){[[523,0],[659,.1],[784,.2],[1047,.32]].forEach(([f,t])=>note(f,t,.18,'square',.05));},
  plouf(){bruit(.25,600,.25);note(500,0,.15,'sine',.05,200);},
  orgue(){[[392,0],[523,.25],[659,.5],[523,.75],[587,1],[784,1.25]].forEach(([f,t])=>{note(f,t,.24,'triangle',.05);note(f/2,t,.24,'square',.025);});}
};

/* ---------- L'ÉCRAN COMMUN ---------- */
const CSS=`#frn{position:fixed;inset:0;z-index:2147482000;display:flex;flex-direction:column;background:radial-gradient(90% 45% at 50% 18%,rgba(255,255,255,.9),transparent 70%),repeating-linear-gradient(45deg,rgba(246,198,208,.35) 0 14px,rgba(191,232,214,.35) 14px 28px,rgba(248,231,164,.35) 28px 42px,rgba(207,216,246,.35) 42px 56px),#fbf3e4;color:#3a1a0a;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
#frn *{box-sizing:border-box}
#frn .fh{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 8px}
#frn .fe{flex:1;min-width:0;position:relative;padding:5px 12px;border-radius:8px;background:linear-gradient(#2a4a9a,#1a2a6a);color:#ffe9a8;box-shadow:inset 0 0 0 2px #fff0b0,inset 0 0 0 4px #c8902a,0 0 0 2px #8a5a18,0 4px 0 #8a5a18,0 8px 16px rgba(80,40,10,.25);text-align:center}
#frn .fe b{display:block;font:900 17px/1.1 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#frn .fe small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;color:#fff0b0}
#frn .fe:before,#frn .fe:after{content:'';position:absolute;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#fff6c0;box-shadow:0 0 8px #ffd24a;animation:frnB 1s steps(2) infinite}#frn .fe:before{left:5px}#frn .fe:after{right:5px;animation-delay:.5s}@keyframes frnB{50%{opacity:.25}}
#frn .ftk{flex:none;display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:8px;background:#fff6dc;color:#8a1a2a;font:900 15px 'Baloo 2',system-ui,sans-serif;box-shadow:0 3px 0 #b89a6a;transform:rotate(-3deg)}
#frn .ftk i{font-style:normal;font-size:16px}
#frn .fx{flex:none;width:38px;height:38px;border-radius:50%;border:2px solid #ffd24a;background:linear-gradient(#2a4a9a,#1a2a6a);color:#ffe9a8;box-shadow:0 3px 0 #8a5a18;font:900 17px 'Baloo 2',system-ui,sans-serif}
#frn .fsc{flex:1;min-height:0;position:relative;margin:0 10px;border-radius:14px;overflow:hidden;box-shadow:0 0 0 3px #fff0b0,0 0 0 6px #d8a030,0 0 0 8px #8a5a18,0 10px 26px rgba(80,40,10,.35)}
#frn .fsc canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#frn .fbas{flex:none;display:flex;flex-direction:column;gap:8px;padding:12px 12px calc(14px + env(safe-area-inset-bottom))}
#frn .fmsg{min-height:22px;text-align:center;font:800 15px/1.25 'Baloo 2',system-ui,sans-serif;color:#5a2a10}
#frn .fmsg small{display:block;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#8a6a4a}
#frn .fbt{border:0;border-radius:14px;padding:14px;font:900 18px 'Baloo 2',system-ui,sans-serif;color:#2a1600;background:linear-gradient(#fff2a8,#ffc93a 60%,#f0a020);box-shadow:0 5px 0 #a86a10}
#frn .fbt:active{transform:translateY(3px);box-shadow:0 2px 0 #a86a10}#frn .fbt.fb2{background:#fffaf0;color:#5a2a10;box-shadow:inset 0 0 0 2px #d8a030,0 4px 0 #b89a6a}#frn .fbt:disabled{opacity:.5}
#frn .frg{display:flex;gap:8px}#frn .frg .fbt{flex:1}
#frn .fpop{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.3);font:900 40px/1 'Baloo 2',system-ui,sans-serif;color:#ffd24a;text-shadow:0 3px 0 #8a3a00,0 0 3px #6a1a00,0 0 26px rgba(255,200,60,.7);opacity:0;pointer-events:none;white-space:nowrap;animation:frnP 1.4s forwards;z-index:5}
@keyframes frnP{15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%) scale(1)}}
#frn .flots{flex:1;min-height:0;overflow-y:auto;margin:0 10px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;align-content:start;padding:4px 2px 10px}
#frn .flot{position:relative;border:0;border-radius:14px;padding:10px 8px 10px;text-align:center;color:#2a1600;background:linear-gradient(#fffdf6,#f6ead2);box-shadow:inset 0 0 0 2px #e8c060,0 4px 0 #b89a6a;font-family:inherit}
#frn .flot canvas{width:84px;height:96px;image-rendering:pixelated;display:block;margin:0 auto}
#frn .flot b{display:block;font:900 14px/1.1 'Baloo 2',system-ui,sans-serif;margin-top:2px}#frn .flot em{display:inline-block;margin-top:5px;font:900 13px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#8a1a2a;background:#fff;border:2px dashed #e8302a;border-radius:6px;padding:0 8px}
#frn .flot.a em{color:#1e7a3e;border-color:#1e7a3e}#frn .flot.p{box-shadow:0 0 0 3px #ffd24a,0 4px 0 #b89a6a}#frn .flot.non{opacity:.55}`;
function ouvrir(titre,sous){if(RAC)fermer();if(!document.getElementById('frnCss')){const s=document.createElement('style');s.id='frnCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='frn';RAC=d;
  d.innerHTML='<div class="fh"><div class="fe"><b>'+titre+'</b><small>'+sous+'</small></div><div class="ftk"><i>🎟️</i><b>'+tickets()+'</b></div><button class="fx">✕</button></div><div class="fsc"><canvas></canvas></div><div class="fbas"><div class="fmsg"></div><div class="fact"></div></div>';
  document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');d.querySelector('.fx').onclick=fermer;
  try{window.JEU_OUVERT=true;}catch(x){}
  return d;}
function fermer(){cancelAnimationFrame(RAF);RAF=0;JEU=null;if(RAC){RAC.remove();RAC=null;}try{window.JEU_OUVERT=false;}catch(x){}}
function msg(h){if(RAC)RAC.querySelector('.fmsg').innerHTML=h||'';}
function actions(h){if(!RAC)return null;const a=RAC.querySelector('.fact');a.innerHTML=h||'';return a;}
function pop(t,c){if(!RAC)return;const d=document.createElement('div');d.className='fpop';d.textContent=t;if(c)d.style.color=c;RAC.querySelector('.fsc').appendChild(d);setTimeout(()=>d.remove(),1500);}
function taille(){const dpr=Math.min(3,window.devicePixelRatio||1),w=CV.clientWidth,h=CV.clientHeight;if(CV.width!==Math.round(w*dpr)||CV.height!==Math.round(h*dpr)){CV.width=Math.round(w*dpr);CV.height=Math.round(h*dpr);}return {W:CV.width,H:CV.height,dpr};}
function boucle(f){let t0=performance.now();const go=t=>{if(!RAC)return;const dt=Math.min(.05,(t-t0)/1000);t0=t;f(dt,t/1000);RAF=requestAnimationFrame(go);};RAF=requestAnimationFrame(go);}
const pt=ev=>{const r=CV.getBoundingClientRect(),q=ev.touches?ev.touches[0]||ev.changedTouches[0]:ev;return [(q.clientX-r.left)/r.width,(q.clientY-r.top)/r.height];};
function finPartie(titre,n,rejouer){gagner(n);SON.gain();if(n>0)pop('+'+n+' 🎟️');
  msg('<b>'+titre+'</b><small>'+(n>0?'Tu gagnes '+n+' ticket'+(n>1?'s':'')+'. Échange-les au guichet des lots.':'Pas de ticket cette fois. Retente ta chance !')+'</small>');
  const a=actions('<div class="frg"><button class="fbt fb2" data-q>Quitter</button><button class="fbt" data-r>Rejouer</button></div>');a.querySelector('[data-q]').onclick=fermer;a.querySelector('[data-r]').onclick=()=>{vib(8);rejouer();};}

/* les petits dessins partagés : une ampoule, des rayures de baraque */
function ampoule(g,x,y,r,on,c){if(on){g.fillStyle='rgba(255,230,150,.35)';g.beginPath();g.arc(x,y,r*2.6,0,7);g.fill();}g.fillStyle=on?(c||'#fff6c0'):'#b8904a';g.beginPath();g.arc(x,y,r,0,7);g.fill();if(on){g.fillStyle='#fff';g.beginPath();g.arc(x-r*.3,y-r*.3,r*.35,0,7);g.fill();}}
const orH=(g,x0,x1)=>{const q=g.createLinearGradient(x0,0,x1,0);q.addColorStop(0,'#9a6a1e');q.addColorStop(.35,'#ffe9a0');q.addColorStop(.55,'#f2c650');q.addColorStop(1,'#8a5a18');return q;};
const orV=(g,y0,y1)=>{const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,'#fff0b0');q.addColorStop(.5,'#e8b838');q.addColorStop(1,'#9a6a1e');return q;};
function arr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function colonne(g,x,y0,y1,w,c){g.fillStyle=orH(g,x,x+w);g.fillRect(x,y0,w,y1-y0);g.save();g.beginPath();g.rect(x,y0,w,y1-y0);g.clip();g.strokeStyle=c;g.globalAlpha=.85;g.lineWidth=w*.28;for(let y=y0-w*2;y<y1+w*2;y+=w*.95){g.beginPath();g.moveTo(x-2,y+w*.75);g.lineTo(x+w+2,y);g.stroke();}g.restore();g.globalAlpha=1;g.fillStyle='rgba(255,255,255,.45)';g.fillRect(x+w*.14,y0,w*.13,y1-y0);}
function bois(g,x,y,w,h,c1,c2){const q=g.createLinearGradient(0,y,0,y+h);q.addColorStop(0,c1||'#c88a48');q.addColorStop(1,c2||'#7a4a22');g.fillStyle=q;g.fillRect(x,y,w,h);g.fillStyle='rgba(255,220,170,.55)';g.fillRect(x,y,w,Math.max(1,h*.1));for(let i=0;i<Math.ceil(w/40);i++){g.fillStyle='rgba(80,40,10,.12)';g.fillRect(x+((i*53)%97)/97*w,y+h*.3,w*.12,Math.max(1,h*.06));}}
/* le dedans d'une baraque : papier peint, lumière chaude, colonnes torsadées, lambrequin à franges */
function cadreBaraque(g,W,H,t,c1,c2){
  const f=g.createLinearGradient(0,0,0,H);f.addColorStop(0,'#fff4da');f.addColorStop(.6,'#f2d6a6');f.addColorStop(1,'#d8ac78');g.fillStyle=f;g.fillRect(0,0,W,H);
  const n=12,bw=W/n;for(let i=0;i<n;i+=2){g.fillStyle=c1;g.globalAlpha=.13;g.fillRect(i*bw,0,bw,H);}g.globalAlpha=1;
  const dm=W/9;for(let y=dm*.6,j=0;y<H;y+=dm*.75,j++)for(let x=(j%2)*dm/2;x<W+dm;x+=dm){g.fillStyle='rgba(190,120,50,.16)';g.beginPath();g.moveTo(x,y-dm*.16);g.quadraticCurveTo(x+dm*.06,y-dm*.04,x+dm*.14,y);g.quadraticCurveTo(x+dm*.06,y+dm*.04,x,y+dm*.16);g.quadraticCurveTo(x-dm*.06,y+dm*.04,x-dm*.14,y);g.quadraticCurveTo(x-dm*.06,y-dm*.04,x,y-dm*.16);g.fill();}
  const l=g.createRadialGradient(W/2,H*.05,W*.05,W/2,H*.3,W*.95);l.addColorStop(0,'rgba(255,252,230,.75)');l.addColorStop(.5,'rgba(255,240,200,.1)');l.addColorStop(1,'rgba(90,40,10,.35)');g.fillStyle=l;g.fillRect(0,0,W,H);
  /* les colonnes dorées */
  const cw=W*.045;colonne(g,0,0,H,cw,c1==='#ffffff'||c1==='#fff6e6'?'#e8302a':c1);colonne(g,W-cw,0,H,cw,c1==='#ffffff'||c1==='#fff6e6'?'#e8302a':c1);
  /* le lambrequin */
  const ah=H*.06,m=10,mw=W/m;g.fillStyle=orV(g,0,ah*.4);g.fillRect(0,0,W,ah*.36);
  for(let i=0;i<m;i++){const x=i*mw;g.fillStyle=i%2?c2:c1;g.beginPath();g.moveTo(x,ah*.34);g.lineTo(x+mw,ah*.34);g.lineTo(x+mw,ah);g.quadraticCurveTo(x+mw/2,ah+mw*.55,x,ah);g.closePath();g.fill();
    g.strokeStyle='#e8b838';g.lineWidth=Math.max(1.5,W*.005);g.beginPath();g.moveTo(x+mw,ah);g.quadraticCurveTo(x+mw/2,ah+mw*.55,x,ah);g.stroke();
    g.strokeStyle='#e8b838';g.lineWidth=Math.max(1,W*.003);g.beginPath();g.moveTo(x,ah);g.lineTo(x,ah+mw*.32);g.stroke();g.fillStyle=orH(g,x-mw*.07,x+mw*.07);g.beginPath();g.ellipse(x,ah+mw*.38,mw*.07,mw*.1,0,0,7);g.fill();}
  const sh=g.createLinearGradient(0,ah*.34,0,ah+mw*.5);sh.addColorStop(0,'rgba(255,255,255,.3)');sh.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=sh;g.fillRect(0,ah*.34,W,ah*.66);
  for(let i=0;i<=n*2;i++)ampoule(g,i*W/(n*2),ah*.18,W*.009,((i+Math.floor(t*5))%3)!==0);}
/* un comptoir de baraque : plateau de bois, panneaux peints cerclés d'or */
function comptoir(g,W,H,y,c){bois(g,0,y,W,H*.025);g.fillStyle=c;g.fillRect(0,y+H*.025,W,H-y);const q=g.createLinearGradient(0,y,0,H);q.addColorStop(0,'rgba(255,255,255,.12)');q.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=q;g.fillRect(0,y+H*.025,W,H-y);
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y+H*.025,W,H*.008);const pw=W/3;for(let i=0;i<3;i++){g.strokeStyle='#e8b838';g.lineWidth=Math.max(1.5,W*.005);arr(g,i*pw+W*.03,y+H*.045,pw-W*.06,H-y-H*.06,W*.02);g.stroke();}}
/* =====================================================================
   1. LE CHAMBOULE-TOUT : trois manches, deux balles par manche.
      On tire la balle vers le haut : la direction vise, la longueur du
      geste donne la hauteur. Un pointillé montre où elle arrivera.
      Les boîtes sont de vraies petites pièces : elles volent, se cognent,
      rebondissent sur l'étagère, et celles du dessus perdent leur appui.
   ===================================================================== */
function balle(g,x,y,r){const q=g.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);q.addColorStop(0,'#ffffff');q.addColorStop(.7,'#ece6dc');q.addColorStop(1,'#a89a88');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.strokeStyle='#d8322a';g.lineWidth=Math.max(1,r*.12);g.beginPath();g.arc(x-r*1.1,y,r*.85,-.7,.7);g.stroke();g.beginPath();g.arc(x+r*1.1,y,r*.85,Math.PI-.7,Math.PI+.7);g.stroke();}
function boite(g,b){const w=b.w,h=b.h;g.save();g.translate(b.x,b.y);g.rotate(b.a);
  const mq=g.createLinearGradient(-w/2,0,w/2,0);mq.addColorStop(0,'#3a1a10');mq.addColorStop(.18,b.c);mq.addColorStop(.36,'#ffffff');mq.addColorStop(.52,b.c);mq.addColorStop(.85,b.c);mq.addColorStop(1,'#2a1208');g.fillStyle=mq;g.fillRect(-w/2,-h/2,w,h);
  const ch=g.createLinearGradient(-w/2,0,w/2,0);ch.addColorStop(0,'#6a6e78');ch.addColorStop(.35,'#ffffff');ch.addColorStop(.6,'#c8ccd6');ch.addColorStop(1,'#4a4e58');g.fillStyle=ch;g.fillRect(-w/2,-h/2,w,h*.1);g.fillRect(-w/2,h/2-h*.1,w,h*.1);
  g.fillStyle='#fbf4e6';g.fillRect(-w*.36,-h*.2,w*.72,h*.4);g.fillStyle=b.c;g.fillRect(-w*.36,-h*.2,w*.72,h*.06);g.fillRect(-w*.36,h*.14,w*.72,h*.06);
  g.font='900 '+Math.round(h*.26)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b.lourde?'⚓':'★',0,h*.01);
  if(b.lourde){g.fillStyle='rgba(40,40,50,.35)';g.fillRect(-w/2,-h/2,w,h);}
  g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-w*.2,-h/2,w*.06,h);g.restore();}
function chamboule(){ouvrir('CHAMBOULE-TOUT','3 MANCHES · 2 BALLES PAR MANCHE');
  const MANCHES=[{rangs:[3,2,1],ech:1,y:.58},{rangs:[4,3,2,1],ech:.92,y:.56},{rangs:[4,3,2,1],ech:.8,y:.52,lourde:true}];
  const S={m:0,balles:2,B:[],vol:null,bal:null,vise:null,fin:false,total:0,nets:0,attente:0,secousse:0};JEU=S;
  const geo=(W,H)=>{const M=MANCHES[S.m],u=Math.min(W,H*.9)/10*M.ech;return {u,sx:W/2,sy:H*M.y,bw:u*1.02,bh:u*1.22,x0:W*.1,x1:W*.9};};
  function monter(){const {W,H}=taille(),{u,sx,sy,bw,bh}=geo(W,H),M=MANCHES[S.m];S.B=[];
    M.rangs.forEach((n,r)=>{for(let k=0;k<n;k++){const lourde=M.lourde&&r===0&&k===1;S.B.push({r,x:sx+(k-(n-1)/2)*bw,y:sy-r*bh-bh/2,w:bw*.9,h:bh*.98,a:0,vx:0,vy:0,va:0,st:'up',lourde,c:lourde?'#5a5e6a':['#e8302a','#3a8ad8','#e8b02a','#3aa05a'][(r+k)%4]});}});
    S.balles=2;S.vol=null;S.bal=null;msg('<b>Manche '+(S.m+1)+'/3</b> · Tire la balle <b>vers le haut</b>.<small>Plus le geste est long, plus la balle monte. '+(M.lourde?'Attention : la boîte grise est lestée !':'Vise le bas de la pyramide.')+'</small>');actions('');}
  monter();
  let dep=null;
  CV.onpointerdown=ev=>{if(S.vol||S.bal||S.fin||S.balles<=0||S.attente)return;const p=pt(ev);if(p[1]<.6)return;dep=p;S.vise=null;ac();};
  CV.onpointermove=ev=>{if(!dep)return;const p=pt(ev),dx=p[0]-dep[0],dy=dep[1]-p[1];if(dy<.02){S.vise=null;return;}const f=Math.min(1,dy/.42);S.vise={tx:Math.max(.08,Math.min(.92,.5+dx*1.5)),ty:.9-f*.62,f};};
  CV.onpointerup=ev=>{if(!dep)return;dep=null;const V=S.vise;S.vise=null;if(!V||V.f<.12){msg('Tire <b>vers le haut</b>, d’un geste plus long.');return;}
    S.balles--;SON.lancer();vib(8);S.vol={t:0,T:.5,tx:V.tx,ty:V.ty,f:V.f};};
  const appui=(b)=>{if(b.r===0)return true;for(const o of S.B)if(o.st==='up'&&o.r===b.r-1&&Math.abs(o.x-b.x)<b.w*.95)return true;return false;};
  function physique(dt,W,H){const {u,sy,x0,x1}=geo(W,H),G=u*34;let bruitDone=false;
    for(const b of S.B){if(b.st!=='vol')continue;
      b.vy+=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.a+=b.va*dt;
      if(b.dos){b.s=Math.max(.45,(b.s||1)-dt*1.2);if(b.y>H+u*3)b.st='parti';continue;}
      /* l'étagère : on rebondit dessus si on est au-dessus */
      const bas=b.y+Math.max(b.w,b.h)*.42;if(b.x>x0&&b.x<x1&&bas>sy&&bas-b.vy*dt<=sy+2&&b.vy>0){b.y=sy-Math.max(b.w,b.h)*.42;b.vy*=-.32;b.vx*=.72;b.va*=.6;if(Math.abs(b.vy)<u*2.2){b.st='couche';let q=Math.round(b.a/(Math.PI/2));if(q%2===0)q+=(b.vx>=0?1:-1);b.a=q*Math.PI/2;b.y=sy-b.w/2;}}
      /* elle cogne les boîtes encore debout */
      for(const o of S.B){if(o===b||o.st!=='up')continue;if(Math.abs(o.x-b.x)<(o.w+b.w)*.48&&Math.abs(o.y-b.y)<(o.h+b.h)*.48){const sp=Math.hypot(b.vx,b.vy);if(sp<u*5||b.vy<-u*2)continue;const k=o.lourde?.15:.45;
        o.st='vol';o.vx=b.vx*k+(o.x-b.x)*3;o.vy=Math.min(b.vy*k,-u*3*k);o.va=(hasard()-.5)*12*k;b.vx*=.55;b.vy*=.55;if(!bruitDone){SON.boite();bruitDone=true;}}}
      if(b.y>H+u*3)b.st='parti';}
    /* celles du dessus qui n'ont plus d'appui */
    for(const b of S.B)if(b.st==='up'&&!appui(b)){b.st='vol';b.vx=(hasard()-.5)*u*3;b.vy=-u*.5;b.va=(hasard()-.5)*5;}}
  function impact(W,H){const V=S.vol,{u}=geo(W,H),bx=V.tx*W,by=V.ty*H,r=u*.38;
    /* la balle continue un instant dans la pyramide, avec sa force */
    S.bal={x:bx,y:by,vx:(V.tx-.5)*u*6,vy:-u*1.2,z:0,f:V.f,r,t:0};}
  function balleDans(dt,W,H){const B2=S.bal,{u}=geo(W,H);B2.t+=dt;B2.x+=B2.vx*dt;B2.y+=B2.vy*dt;B2.vy+=u*12*dt;
    let t2=0;for(const o of S.B){if(o.st!=='up')continue;if(Math.abs(o.x-B2.x)<o.w/2+B2.r&&Math.abs(o.y-B2.y)<o.h/2+B2.r){if(o.lourde&&B2.f<.75){B2.vx*=.3;B2.vy=-u*2;continue;}o.st='vol';o.dos=true;o.vx=((o.x-B2.x)/(o.w)*u*4+B2.vx*.6);o.vy=-u*(4+B2.f*5+hasard()*2);o.va=(hasard()-.5)*10;t2++;B2.vx*=.8;}}
    if(t2){SON.boite();vib([12,20,12]);S.secousse=.25;if(t2>=3)pop('BOUM !');}
    if(B2.t>.18){S.bal=null;setTimeout(()=>{if(JEU!==S)return;bilan();},1100);}}
  function bilan(){if(S.attente)return;const n=S.B.filter(b=>b.st!=='up').length,tout=n===S.B.length;
    if(!tout&&S.balles>0){msg('<b>'+n+'/'+S.B.length+'</b> par terre. Encore <b>'+S.balles+' balle</b> !');return;}
    S.total+=n;if(tout){S.nets++;pop('NETTOYÉ !');SON.gain();}else SON.rate();
    S.attente=1;msg((tout?'<b>Tout est par terre !</b>':'<b>'+n+'/'+S.B.length+'</b> boîtes')+' <small>'+(S.m<2?'Manche suivante…':'')+'</small>');
    setTimeout(()=>{if(JEU!==S)return;S.attente=0;if(S.m<2){S.m++;monter();}else{S.fin=true;const tk=Math.floor(S.total/2)+S.nets*3;finPartie(S.total+' boîtes'+(S.nets===3?' · Chamboule parfait !':''),tk,chamboule);}},1500);}
  boucle((dt,t)=>{const {W,H}=taille(),g=G,{u,sx,sy,x0,x1}=geo(W,H);
    if(S.vol&&S.vol.t>=S.vol.T){impact(W,H);S.vol=null;}
    if(S.bal)balleDans(dt,W,H);physique(dt,W,H);
    g.save();if(S.secousse>0){S.secousse-=dt;g.translate((hasard()-.5)*u*.15,(hasard()-.5)*u*.15);}
    cadreBaraque(g,W,H,t,'#e8302a','#fff6e6');
    for(const b of S.B)if(b.dos&&b.st!=='parti'){const s2=b.s||1;boite(g,Object.assign({},b,{w:b.w*s2,h:b.h*s2,y:sy-(sy-b.y)*s2}));}
    for(const x of [x0+u*.4,x1-u*.4])bois(g,x-u*.14,sy,u*.28,H*.3,'#8a5a2a','#4a2410');
    g.fillStyle='rgba(60,30,10,.25)';g.beginPath();g.ellipse(W/2,sy+u*.5,(x1-x0)/2,u*.25,0,0,7);g.fill();bois(g,x0,sy,x1-x0,u*.36);g.fillStyle=orV(g,sy+u*.32,sy+u*.42);g.fillRect(x0,sy+u*.3,x1-x0,u*.08);
    for(const b of S.B)if(b.st!=='parti'&&!b.dos)boite(g,b);
    if(S.bal)balle(g,S.bal.x,S.bal.y,S.bal.r*.8);
    /* le compteur de la manche */
    const nd=S.B.filter(b=>b.st!=='up').length;g.fillStyle='rgba(90,40,10,.75)';arr(g,W*.06,H*.1,W*.36,H*.05,H*.02);g.fill();g.fillStyle='#ffe9a8';g.font='900 '+Math.round(H*.026)+'px "Baloo 2",sans-serif';g.textAlign='left';g.textBaseline='middle';g.fillText('MANCHE '+(S.m+1)+'/3',W*.09,H*.125);
    g.textAlign='right';g.fillStyle='rgba(90,40,10,.75)';arr(g,W*.58,H*.1,W*.36,H*.05,H*.02);g.fill();g.fillStyle='#ffe9a8';g.fillText(nd+'/'+S.B.length+' ⬇',W*.91,H*.125);
    const cy=H*.84;comptoir(g,W,H,cy,'#b8262c');
    for(let i=0;i<S.balles-((S.vol||S.bal)?0:1);i++)balle(g,W*.12+i*u*.9,cy+u*.5,u*.32);
    /* la visée : un arc en pointillé et une cible */
    if(S.vise){const V=S.vise,bx=W*.5,by=H*.92,tx=V.tx*W,ty=V.ty*H,hh=(.12+V.f*.12)*H;g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=u*.08;g.setLineDash([u*.18,u*.18]);g.beginPath();
      for(let k=0;k<=20;k++){const s2=k/20,x=bx+(tx-bx)*s2,y=by+(ty-by)*s2-Math.sin(s2*Math.PI)*hh;if(k)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();g.setLineDash([]);
      g.strokeStyle='rgba(232,48,42,.95)';g.lineWidth=u*.08;g.beginPath();g.arc(tx,ty,u*.32,0,7);g.moveTo(tx-u*.5,ty);g.lineTo(tx+u*.5,ty);g.moveTo(tx,ty-u*.5);g.lineTo(tx,ty+u*.5);g.stroke();}
    if(!S.vol&&!S.bal&&!S.fin&&S.balles>0&&!S.attente){const bx=W*.5,by=H*.92;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(bx,by+u*.4,u*.5,u*.15,0,0,7);g.fill();balle(g,bx,by,u*.42);
      if(!S.vise){const a=.4+.4*Math.sin(t*5);g.strokeStyle='rgba(120,40,10,'+a+')';g.lineWidth=u*.08;g.beginPath();g.moveTo(bx,by-u*.8);g.lineTo(bx,by-u*1.6);g.moveTo(bx-u*.25,by-u*1.35);g.lineTo(bx,by-u*1.6);g.lineTo(bx+u*.25,by-u*1.35);g.stroke();}}
    if(S.vol){const V=S.vol;V.t+=dt;const k=Math.min(1,V.t/V.T),x=(.5+(V.tx-.5)*k)*W,y=(.92+(V.ty-.92)*k)*H-Math.sin(k*Math.PI)*(.12+V.f*.12)*H,r=u*(.42-.12*k);
      g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(x,(.92+(V.ty-.92)*k)*H+u*.3,r,r*.3,0,0,7);g.fill();balle(g,x,y,r);}
    g.restore();});}

/* =====================================================================
   2. LE TIR AUX CANARDS : 30 secondes, 15 plombs.
      Garde le doigt posé pour viser (la mire est au-dessus du doigt, et
      elle tremble moins si on prend le temps) ; on tire en levant le doigt.
      Blanc 1, jaune 2, doré 5, les plaques étoilées qui surgissent 3.
      Les touches d'affilée font monter le multiplicateur jusqu'à ×3.
   ===================================================================== */
function tir(){ouvrir('TIR AUX CANARDS','15 PLOMBS · 30 SECONDES');
  const S={plombs:15,temps:30,pts:0,C:[],P:[],eclairs:[],trous:[],fin:false,recul:0,vise:null,tv:0,t:0,serie:0,prochaine:3};JEU=S;
  for(let r=0;r<3;r++)for(let i=0;i<7;i++)S.C.push({r,u:i/7,coul:r===1?'jaune':'blanc',abat:0,dore:false});
  const choisirDore=()=>{for(const c of S.C)c.dore=false;const L=S.C.filter(c=>!c.abat);if(L.length)ALEA(L).dore=true;};choisirDore();
  msg('Garde le doigt posé pour <b>viser</b>, lève-le pour <b>tirer</b>.<small>Prends ton temps : la mire tremble moins. Doré = 5, étoile = 3.</small>');actions('');
  const vit=()=>1+Math.min(.8,S.t/30*.8);
  const pos=(c,W,H)=>{const v=[.07,-.1,.13][c.r]*vit(),x=((c.u+S.t*v)%1+1)%1;return [x*W*1.2-W*.1,H*(.3+c.r*.18)];};
  const mire=(W,H)=>{if(!S.vise)return null;const tr=Math.max(.15,1-S.tv/.7),a=H*.016*tr;return [S.vise[0]*W+Math.sin(S.t*5.3)*a+Math.sin(S.t*8.1)*a*.5,S.vise[1]*H-H*.09+Math.cos(S.t*4.7)*a];};
  CV.onpointerdown=ev=>{if(S.fin||S.plombs<=0)return;ac();S.vise=pt(ev);S.tv=0;};
  CV.onpointermove=ev=>{if(!S.vise)return;const p=pt(ev);if(Math.hypot(p[0]-S.vise[0],p[1]-S.vise[1])>.03)S.tv=Math.max(0,S.tv-.15);S.vise=p;};
  CV.onpointerup=ev=>{if(!S.vise||S.fin)return;const {W,H}=taille(),m=mire(W,H);S.vise=null;S.plombs--;S.recul=1;SON.pan();vib(14);
    let mieux=null,val=0;
    for(const P of S.P){if(P.abat)continue;const s=H*.05;if(Math.hypot(m[0]-P.x*W,m[1]-P.y*H)<s){mieux=P;val=3;break;}}
    if(!mieux)for(const c of S.C){if(c.abat)continue;const [x,y]=pos(c,W,H);const s=H*.06;if(Math.abs(m[0]-x)<s*.95&&Math.abs(m[1]-(y-s*.55))<s*.75){mieux=c;val=c.dore?5:c.coul==='jaune'?2:1;break;}}
    if(mieux){S.serie++;const mult=S.serie>=6?3:S.serie>=3?2:1;mieux.abat=.01;S.pts+=val*mult;SON.ding();pop('+'+(val*mult)+(mult>1?' ×'+mult:''),val>=5?'#ffd24a':'#fff');if(mieux.dore)choisirDore();
      if(mieux.u!==undefined)setTimeout(()=>{mieux.abat=0;},2400);}
    else{S.serie=0;S.trous.push({x:m[0]/W,y:m[1]/H});}
    S.eclairs.push({x:m[0]/W,y:m[1]/H,t:S.t});
    if(S.plombs<=0)setTimeout(fin,600);};
  function fin(){if(S.fin)return;S.fin=true;const n=Math.min(14,Math.floor(S.pts/3));finPartie(S.pts+' points'+(S.pts>=40?' · Tireur d’élite !':''),n,tir);}
  boucle((dt,t)=>{const {W,H}=taille(),g=G;if(!S.fin){S.t+=dt;S.temps=Math.max(0,30-S.t);if(S.temps<=0)fin();if(S.vise)S.tv+=dt;
      S.prochaine-=dt;if(S.prochaine<=0){S.prochaine=2.5+hasard()*2.5;S.P.push({x:.15+hasard()*.7,y:.3+((hasard()*3)|0)*.18-.07,t:0,abat:0});}}
    cadreBaraque(g,W,H,t,'#1f5fa8','#ffd24a');
    {const x0=W*.06,y0=H*.13,w=W*.88,h=H*.66;g.fillStyle=orH(g,x0-6,x0+w+6);arr(g,x0-6,y0-6,w+12,h+12,10);g.fill();const q=g.createLinearGradient(0,y0,0,y0+h);q.addColorStop(0,'#14204a');q.addColorStop(1,'#2a3a7a');g.fillStyle=q;g.fillRect(x0,y0,w,h);}
    for(let i=0;i<40;i++){g.fillStyle='rgba(255,240,180,'+(.3+.5*Math.abs(Math.sin(t*1.5+i)))+')';g.fillRect((i*97%100)/100*W*.86+W*.07,(i*53%100)/100*H*.6+H*.15,2,2);}
    g.save();g.beginPath();g.rect(W*.06,H*.13,W*.88,H*.66);g.clip();
    /* les plaques étoilées qui surgissent */
    for(const P of S.P){P.t+=dt;const life=1.6,k=P.abat?Math.max(0,1-P.abat):Math.min(1,P.t/.15,(life-P.t)/.15);if(P.abat)P.abat+=dt*4;const x=P.x*W,y=P.y*H,s=H*.045*Math.max(0,k);if(s>0){g.fillStyle='#8a8e9a';g.fillRect(x-2,y,4,H*.05);g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,s,0,7);g.fill();g.fillStyle='#e8302a';g.beginPath();g.arc(x,y,s*.82,0,7);g.fill();g.fillStyle='#ffd24a';g.font='900 '+Math.round(s*1.2)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('★',x,y+s*.05);}}
    S.P=S.P.filter(P=>P.t<1.6&&(!P.abat||P.abat<1));
    for(let r=0;r<3;r++){const y=H*(.3+r*.18);const q=g.createLinearGradient(0,y,0,y+H*.02);q.addColorStop(0,'#e8ecf2');q.addColorStop(.4,'#9aa0ac');q.addColorStop(1,'#3a3e48');g.fillStyle=q;g.fillRect(W*.06,y+H*.004,W*.88,H*.018);}
    for(const c of S.C){const [x,y]=pos(c,W,H),s=H*.06,dir=[1,-1,1][c.r];if(c.abat)c.abat=Math.min(1,c.abat+dt*6);const k=c.abat||0;
      g.save();g.translate(x,y);g.scale(dir,1-k*.85);const col=c.dore?'#f5c430':c.coul==='jaune'?'#ffd24a':'#f4f4f4',ombre=c.dore?'#b8860b':c.coul==='jaune'?'#d8a020':'#c8c8d0';
      const mq=g.createLinearGradient(0,-s*1.3,0,0);mq.addColorStop(0,'#ffffff');mq.addColorStop(.35,col);mq.addColorStop(1,ombre);g.fillStyle=mq;g.beginPath();g.ellipse(0,-s*.35,s*.75,s*.42,0,0,7);g.fill();g.beginPath();g.arc(s*.5,-s*.95,s*.32,0,7);g.fill();
      g.beginPath();g.moveTo(-s*.7,-s*.45);g.lineTo(-s*1.0,-s*.75);g.lineTo(-s*.55,-s*.6);g.fill();g.fillStyle=ombre;g.beginPath();g.ellipse(-s*.1,-s*.28,s*.42,s*.18,-.15,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-s*.15,-s*.6,s*.38,s*.07,0,0,7);g.fill();
      g.fillStyle='#ff8a2a';g.beginPath();g.moveTo(s*.78,-s*1.0);g.lineTo(s*1.08,-s*.92);g.lineTo(s*.78,-s*.84);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(s*.58,-s*1.02,s*.06,0,7);g.fill();g.fillStyle='#5a4a3a';g.fillRect(-s*.08,-s*.02,s*.16,s*.1);
      if(c.dore){g.fillStyle='rgba(255,240,150,'+(.5+.5*Math.sin(t*8))+')';g.fillRect(-s*.9,-s*1.4,s*.12,s*.12);g.fillRect(s*.9,-s*.3,s*.12,s*.12);}g.restore();}
    for(const o of S.trous){g.fillStyle='#0a0a12';g.beginPath();g.arc(o.x*W,o.y*H,H*.005,0,7);g.fill();}
    g.restore();
    for(const o of S.eclairs){const a=1-(S.t-o.t)/.18;if(a<=0)continue;g.fillStyle='rgba(255,240,160,'+a+')';g.beginPath();g.arc(o.x*W,o.y*H,H*.03*(1.4-a),0,7);g.fill();}S.eclairs=S.eclairs.filter(o=>S.t-o.t<.2);
    const cy=H*.82;comptoir(g,W,H,cy,'#1f4a98');
    const m=mire(W,H),ax=m?m[0]:W*.5,ay=m?m[1]:H*.45,gx=W*.5+(ax/W-.5)*W*.25,gy=H*1.02+S.recul*H*.02,a=Math.atan2(ay-gy,ax-gx);S.recul=Math.max(0,S.recul-dt*8);
    g.save();g.translate(gx,gy);g.rotate(a);{const q=g.createLinearGradient(0,-H*.03,0,H*.045);q.addColorStop(0,'#c88a48');q.addColorStop(.5,'#8a5228');q.addColorStop(1,'#4a2410');g.fillStyle=q;}g.beginPath();g.moveTo(-H*.06,-H*.03);g.lineTo(H*.12,-H*.022);g.lineTo(H*.12,H*.022);g.lineTo(-H*.06,H*.045);g.closePath();g.fill();
    {const q=g.createLinearGradient(0,-H*.013,0,H*.013);q.addColorStop(0,'#9aa0ac');q.addColorStop(.35,'#f4f6fa');q.addColorStop(1,'#2a2e38');g.fillStyle=q;}g.fillRect(H*.11,-H*.013,H*.24,H*.026);g.fillStyle=orH(g,H*.1,H*.13);g.fillRect(H*.1,-H*.016,H*.025,H*.032);g.restore();
    if(m){const r=H*.035,st=Math.max(.15,1-S.tv/.7);g.strokeStyle=st<.3?'rgba(60,220,90,.95)':'rgba(255,80,60,.95)';g.lineWidth=2.5;g.beginPath();g.arc(m[0],m[1],r,0,7);g.moveTo(m[0]-r*1.5,m[1]);g.lineTo(m[0]-r*.5,m[1]);g.moveTo(m[0]+r*.5,m[1]);g.lineTo(m[0]+r*1.5,m[1]);g.moveTo(m[0],m[1]-r*1.5);g.lineTo(m[0],m[1]-r*.5);g.moveTo(m[0],m[1]+r*.5);g.lineTo(m[0],m[1]+r*1.5);g.stroke();}
    g.fillStyle=orH(g,W*.04,W*.96);arr(g,W*.035,H*.878,W*.93,H*.094,H*.016);g.fill();g.fillStyle='#1a2a5c';arr(g,W*.045,H*.885,W*.91,H*.08,H*.012);g.fill();g.textBaseline='middle';g.font='900 '+Math.round(H*.032)+'px "Baloo 2",sans-serif';
    g.textAlign='left';g.fillStyle='#ffd24a';g.fillText(S.pts+' pts'+(S.serie>=3?' ×'+(S.serie>=6?3:2):''),W*.07,H*.925);
    g.textAlign='center';g.fillStyle=S.temps<6?'#ff6a5a':'#fff';g.fillText(Math.ceil(S.temps)+' s',W*.53,H*.925);
    for(let i=0;i<15;i++){g.fillStyle=i<S.plombs?'#c8ccd8':'rgba(255,255,255,.15)';g.fillRect(W*.93-i*W*.018,H*.91,W*.01,H*.03);}});}

/* =====================================================================
   3. LA PÊCHE AUX CANARDS : 6 lancers pour 3 prises.
      Promène la canne au-dessus du bassin, lâche : l'hameçon descend.
      Il faut tomber pile dans l'anneau sur la tête du canard.
      Après chaque prise, le manège tourne plus vite.
   ===================================================================== */
function peche(){ouvrir('PÊCHE AUX CANARDS','3 PRISES · 6 LANCERS');
  const S={prises:3,lancers:6,D:[],gain:0,crochet:null,chute:null,peche:null,fin:false,t:0,ang:0,vit:.04};JEU=S;
  const VAL=[1,1,1,2,2,2,3,3,5];for(let i=0;i<12;i++)S.D.push({u:i/12,v:i===5?10:ALEA(VAL),c:ALEA(['#ffd24a','#ffd24a','#ff9ab8','#7ad0ff','#7ee08a']),parti:false});
  msg('Place l’hameçon au-dessus d’un canard, <b>lâche</b> au bon moment.<small>Il faut tomber dans l’anneau sur sa tête. Le chiffre dessous = tes tickets.</small>');actions('');
  const geo=(W,H)=>({cx:W/2,cy:H*.5,rx:W*.38,ry:H*.25});
  const pos=(d,W,H)=>{const {cx,cy,rx,ry}=geo(W,H),a=(d.u)*Math.PI*2+S.ang;return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,Math.sin(a),a];};
  const anneau=(d,W,H)=>{const [x,y,z,a]=pos(d,W,H),s=H*.045*(1+z*.15);const dir=Math.cos(a+Math.PI/2)>0?1:-1;return [x,y-s*1.08,s];};
  CV.onpointerdown=ev=>{if(S.fin||S.peche||S.chute)return;ac();S.crochet=pt(ev);};
  CV.onpointermove=ev=>{if(S.crochet)S.crochet=pt(ev);};
  CV.onpointerup=ev=>{if(!S.crochet||S.peche||S.chute)return;S.chute={x:S.crochet[0],y:S.crochet[1],t:0};S.crochet=null;S.lancers--;};
  function resoudre(W,H){const C=S.chute;S.chute=null;let m=null,dm=1e9;
    for(const d of S.D){if(d.parti)continue;const [x,y,s]=anneau(d,W,H),dd=Math.hypot(C.x*W-x,C.y*H-y);if(dd<dm){dm=dd;m=d;}}
    const tol=H*.03;
    if(!m||dm>tol){SON.plouf();msg((dm<tol*2.2?'<b>Presque !</b> L’hameçon a glissé sur l’anneau.':'Plouf ! Raté.')+'<small>Encore '+S.lancers+' lancer'+(S.lancers>1?'s':'')+', '+S.prises+' prise'+(S.prises>1?'s':'')+' à faire.</small>');if(S.lancers<=0)finir();return;}
    m.parti=true;S.prises--;SON.ding();vib(12);const [x,y]=pos(m,W,H);S.peche={d:m,x:x/W,y:y/H,t:0};S.vit+=.02;}
  function finir(){if(S.fin)return;S.fin=true;setTimeout(()=>{if(JEU!==S)return;finPartie('Belle pêche : '+S.gain+' ticket'+(S.gain>1?'s':''),S.gain,peche);},700);}
  boucle((dt,t)=>{const {W,H}=taille(),g=G,{cx,cy,rx,ry}=geo(W,H);S.t+=dt;S.ang+=dt*S.vit*Math.PI*2;
    cadreBaraque(g,W,H,t,'#2ab0a0','#ffffff');
    g.fillStyle='rgba(60,30,10,.25)';g.beginPath();g.ellipse(cx,cy+H*.05,rx+W*.11,ry+H*.08,0,0,7);g.fill();
    {const q=g.createLinearGradient(0,cy-ry,0,cy+ry+H*.1);q.addColorStop(0,'#e8443c');q.addColorStop(1,'#8a1a1a');g.fillStyle=q;}g.beginPath();g.ellipse(cx,cy+H*.025,rx+W*.1,ry+H*.08,0,0,7);g.fill();
    for(let i=0;i<16;i++){const a=i/16*6.28,x=cx+Math.cos(a)*(rx+W*.095),y=cy+H*.03+Math.sin(a)*(ry+H*.075);if(Math.sin(a)>0)ampoule(g,x,y,W*.008,((i+Math.floor(t*4))%2)===0);}
    g.fillStyle=orV(g,cy-ry-H*.07,cy+ry+H*.07);g.beginPath();g.ellipse(cx,cy,rx+W*.09,ry+H*.07,0,0,7);g.fill();
    const eau=g.createLinearGradient(0,cy-ry,0,cy+ry);eau.addColorStop(0,'#3ac0f0');eau.addColorStop(1,'#1a6aa8');g.fillStyle=eau;g.beginPath();g.ellipse(cx,cy,rx+W*.06,ry+H*.05,0,0,7);g.fill();
    g.fillStyle='#2a8ac0';g.beginPath();g.ellipse(cx,cy,rx-W*.08,ry-H*.07,0,0,7);g.fill();g.fillStyle='#ffd24a';g.beginPath();g.ellipse(cx,cy,rx-W*.1,ry-H*.085,0,0,7);g.fill();g.fillStyle='#e8302a';g.beginPath();g.ellipse(cx,cy,rx-W*.12,ry-H*.1,0,0,7);g.fill();
    {const rr=Math.min(rx-W*.14,(ry-H*.11)*1.6),tb=cy+H*.03;for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#2ab0a0';g.beginPath();g.moveTo(cx,cy-rr*.9);g.lineTo(cx-rr+i*rr/4,tb);g.lineTo(cx-rr+(i+1)*rr/4,tb);g.closePath();g.fill();}
     g.fillStyle='#ffd24a';g.fillRect(cx-rr,tb-2,rr*2,6);for(let i=0;i<9;i++)ampoule(g,cx-rr+i*rr/4,tb+1,W*.007,((i+Math.floor(t*5))%3)===0);
     g.fillStyle='#fff';g.font='900 '+Math.round(H*.024)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';}
    g.fillStyle='rgba(90,40,10,.75)';arr(g,W*.2,H*.9,W*.6,H*.05,H*.02);g.fill();g.fillStyle='#ffe9a8';g.font='900 '+Math.round(H*.024)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('PRISES '+(3-S.prises)+'/3 · LANCERS '+S.lancers,W/2,H*.925);
    for(let i=0;i<30;i++){const a=i/30*6.28+t*.3,x=cx+Math.cos(a)*(rx-W*.01),y=cy+Math.sin(a)*(ry-H*.01);g.strokeStyle='rgba(255,255,255,'+(.25+.35*Math.sin(t*3+i))+')';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y,W*.02,H*.004,0,0,Math.PI);g.stroke();}
    const L=S.D.filter(d=>!d.parti).map(d=>[d,...pos(d,W,H)]).sort((a,b)=>a[3]-b[3]);
    for(const [d,x,y,z,a] of L){const s=H*.045*(1+z*.15);canard(g,x,y+Math.sin(t*3+d.u*9)*H*.004,s,d.c,Math.cos(a+Math.PI/2)>0?1:-1);}
    /* la canne : le fil, l'hameçon */
    const hk=S.chute?[S.chute.x,S.chute.y]:S.crochet;
    if(hk){let x=hk[0]*W,y=hk[1]*H;const off=S.chute?Math.min(1,S.chute.t/.25):0;const yy=y-H*.06*(1-off);
      g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,yy-H*.012);g.stroke();
      g.strokeStyle='#c8ccd8';g.lineWidth=3;g.beginPath();g.arc(x+H*.008,yy,H*.012,Math.PI,Math.PI*2.6);g.stroke();g.fillStyle='#e8302a';g.fillRect(x-H*.006,yy-H*.05,H*.012,H*.02);
      if(!S.chute){g.strokeStyle='rgba(255,255,255,.55)';g.setLineDash([4,4]);g.beginPath();g.moveTo(x,yy+H*.01);g.lineTo(x,y);g.stroke();g.setLineDash([]);g.strokeStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(x,y,H*.03,0,7);g.stroke();}
      if(S.chute){S.chute.t+=dt;if(S.chute.t>=.25)resoudre(W,H);}}
    if(S.peche){const P=S.peche;P.t+=dt;const k=Math.min(1,P.t/.7),x=(P.x+(.5-P.x)*k)*W,y=(P.y+(.38-P.y)*k)*H-Math.sin(k*Math.PI)*H*.08,s=H*.05*(1+k*1.4);
      g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,y-s*1.2);g.stroke();
      if(P.t<1)canard(g,x,y,s,P.d.c,1);
      else{const r=s*1.3;g.fillStyle='#fff';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle=P.d.v>=5?'#f5c430':'#e8302a';g.beginPath();g.arc(x,y,r*.86,0,7);g.fill();
        g.fillStyle='#fff';g.font='900 '+Math.round(r*1.1)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(P.d.v,x,y+r*.05);
        if(!P.vu){P.vu=1;S.gain+=P.d.v;SON.ding();pop('+'+P.d.v+' 🎟️',P.d.v>=5?'#ffd24a':'#fff');vib(P.d.v>=5?[20,30,40]:15);}
        if(P.t>2.1){S.peche=null;if(S.prises<=0||S.lancers<=0)finir();else msg('Le bassin tourne plus vite ! <b>'+S.prises+' prise'+(S.prises>1?'s':'')+'</b> à faire, '+S.lancers+' lancer'+(S.lancers>1?'s':'')+'.');}}}});}
function canard(g,x,y,s,c,dir){g.save();g.translate(x,y);g.scale(dir,1);g.fillStyle='rgba(0,40,80,.25)';g.beginPath();g.ellipse(0,s*.32,s*.95,s*.24,0,0,7);g.fill();
  const q=g.createLinearGradient(0,-s*.5,0,s*.5);q.addColorStop(0,'rgba(255,255,255,.45)');q.addColorStop(.45,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(90,50,20,.3)');
  g.beginPath();g.moveTo(-s*.9,-s*.15);g.quadraticCurveTo(-s*1.05,-s*.55,-s*.75,-s*.35);g.quadraticCurveTo(-s*.2,-s*.4,s*.25,-s*.3);g.quadraticCurveTo(s*.85,-s*.25,s*.8,s*.1);g.quadraticCurveTo(s*.6,s*.48,0,s*.45);g.quadraticCurveTo(-s*.75,s*.42,-s*.9,-s*.15);g.fillStyle=c;g.fill();g.fillStyle=q;g.fill();
  g.fillStyle=c;g.beginPath();g.arc(s*.5,-s*.62,s*.38,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(s*.4,-s*.78,s*.14,0,7);g.fill();
  g.fillStyle='rgba(120,70,10,.25)';g.beginPath();g.ellipse(-s*.15,-s*.05,s*.42,s*.2,-.2,0,7);g.fill();
  g.fillStyle='#ff7a2a';g.beginPath();g.moveTo(s*.82,-s*.6);g.quadraticCurveTo(s*1.25,-s*.58,s*1.18,-s*.44);g.quadraticCurveTo(s*1,-s*.4,s*.82,-s*.46);g.fill();
  g.fillStyle='#1a1a1a';g.beginPath();g.arc(s*.62,-s*.7,s*.075,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s*.64,-s*.72,s*.025,0,7);g.fill();
  g.fillStyle='#c8ccd8';g.fillRect(-s*.04,-s*1.02,s*.08,s*.28);g.strokeStyle='#e8ecf2';g.lineWidth=Math.max(1.5,s*.08);g.beginPath();g.arc(0,-s*1.08,s*.12,0,7);g.stroke();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;g.beginPath();g.ellipse(0,s*.4,s*1.05,s*.16,0,.2,Math.PI-.2);g.stroke();g.restore();}

/* =====================================================================
   4. LES AUTO-TAMPONNEUSES : 40 secondes sur la piste, vue de dessus.
      Pose le doigt n'importe où et glisse : ta voiture part dans cette
      direction. Percute les autres de face : +1, +2 si c'est fort.
      Si on te rentre dedans par-derrière, tu perds ta série.
   ===================================================================== */
function tamponneuses(){ouvrir('AUTO-TAMPONNEUSES','40 SECONDES · PERCUTE LES AUTRES');
  const COUL2=['#e8302a','#2f7fd0','#f2b632','#3aa05a','#f07aa0','#8a5ad8'];
  const S={t:0,temps:40,pts:0,serie:0,V:[],stick:null,fin:false,eclats:[],cogne:0};JEU=S;
  const geo=(W,H)=>{const m=W*.05;return {x0:m,y0:H*.04,x1:W-m,y1:H*.84,r:Math.min(W,H)*.06};};
  {const {W,H}=taille(),{x0,y0,x1,y1}=geo(W,H);for(let i=0;i<6;i++)S.V.push({x:x0+(x1-x0)*(.2+.6*((i%3)/2)),y:y0+(y1-y0)*(i<3?.3:.75),vx:0,vy:0,a:i<3?Math.PI/2:-Math.PI/2,c:COUL2[i],moi:i===0,cible:null,tc:0,choc:0});}
  msg('Pose le doigt et <b>glisse</b> pour conduire.<small>Rentre dans les autres de face pour marquer.</small>');actions('');
  CV.onpointerdown=ev=>{if(S.fin)return;ac();const p=pt(ev);S.stick={o:p,p};};
  CV.onpointermove=ev=>{if(S.stick)S.stick.p=pt(ev);};
  CV.onpointerup=CV.onpointercancel=()=>{S.stick=null;};
  function fin(){if(S.fin)return;S.fin=true;S.stick=null;finPartie(S.pts+' coup'+(S.pts>1?'s':'')+' réussi'+(S.pts>1?'s':''),Math.min(15,S.pts),tamponneuses);}
  boucle((dt,t)=>{const {W,H}=taille(),g=G,{x0,y0,x1,y1,r}=geo(W,H);
    if(!S.fin){S.t+=dt;S.temps=Math.max(0,40-S.t);if(S.temps<=0)fin();}
    const VMAX=r*6.5,ACC=r*9;
    for(const v of S.V){let gaz=0,cap=v.a;
      if(v.moi){if(S.stick&&!S.fin){const dx=(S.stick.p[0]-S.stick.o[0])*W,dy=(S.stick.p[1]-S.stick.o[1])*H,l=Math.hypot(dx,dy);if(l>r*.3){cap=Math.atan2(dy,dx);gaz=Math.min(1,l/(r*2.5));}}}
      else{v.tc-=dt;if(v.tc<=0||!v.cible){v.tc=1.5+hasard()*2;v.cible=hasard()<.45?S.V[0]:ALEA(S.V.filter(o=>o!==v));}const c=v.cible;cap=Math.atan2(c.y-v.y,c.x-v.x);gaz=S.fin?0:.62;
        if(v.x<x0+r*2)cap=0;else if(v.x>x1-r*2)cap=Math.PI;if(v.y<y0+r*2)cap=Math.PI/2;else if(v.y>y1-r*2)cap=-Math.PI/2;}
      let da=((cap-v.a+Math.PI*3)%(Math.PI*2))-Math.PI;v.a+=Math.max(-1,Math.min(1,da))*dt*(v.moi?6:3.5);
      v.vx+=Math.cos(v.a)*ACC*gaz*dt;v.vy+=Math.sin(v.a)*ACC*gaz*dt;const f=Math.pow(.25,dt);v.vx*=f;v.vy*=f;const sp=Math.hypot(v.vx,v.vy);if(sp>VMAX){v.vx*=VMAX/sp;v.vy*=VMAX/sp;}
      v.x+=v.vx*dt;v.y+=v.vy*dt;v.choc=Math.max(0,v.choc-dt*3);
      if(v.x<x0+r){v.x=x0+r;v.vx=Math.abs(v.vx)*.6;}if(v.x>x1-r){v.x=x1-r;v.vx=-Math.abs(v.vx)*.6;}if(v.y<y0+r){v.y=y0+r;v.vy=Math.abs(v.vy)*.6;}if(v.y>y1-r){v.y=y1-r;v.vy=-Math.abs(v.vy)*.6;}}
    for(let i=0;i<S.V.length;i++)for(let j=i+1;j<S.V.length;j++){const A=S.V[i],B=S.V[j],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy);if(d>=2*r||d===0)continue;
      const nx=dx/d,ny=dy/d,pen=2*r-d;A.x-=nx*pen/2;A.y-=ny*pen/2;B.x+=nx*pen/2;B.y+=ny*pen/2;
      const va=A.vx*nx+A.vy*ny,vb=B.vx*nx+B.vy*ny,rel=va-vb;if(rel<=0)continue;
      const e=.95;const ja=(1+e)*rel/2;A.vx-=ja*nx;A.vy-=ja*ny;B.vx+=ja*nx;B.vy+=ja*ny;A.choc=B.choc=1;
      S.eclats.push({x:(A.x+B.x)/2,y:(A.y+B.y)/2,t:0});if(rel>r*1.5){SON.boite();}
      if((A.moi||B.moi)&&!S.fin&&rel>r*1.2){const moi=A.moi?A:B,autre=A.moi?B:A,n2=A.moi?[nx,ny]:[-nx,-ny],vm=moi.vx*n2[0]+moi.vy*n2[1],vo=-(autre.vx*n2[0]+autre.vy*n2[1]);
        if(vm>=vo){const p2=rel>r*3.5?2:1;S.serie++;S.pts+=p2;SON.ding();vib(p2>1?[20,30,20]:15);pop(p2>1?'BAM ! +2':'+1');S.cogne=.3;}
        else{S.serie=0;vib(30);pop('Aïe !','#ff8a7a');S.cogne=.3;}}}
    g.save();if(S.cogne>0){S.cogne-=dt;g.translate((hasard()-.5)*r*.15,(hasard()-.5)*r*.15);}
    /* le décor de la piste : un plancher de tôle, une bordure de caoutchouc */
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a2a5c');bg.addColorStop(1,'#0e1a40');g.fillStyle=bg;g.fillRect(0,0,W,H);
    g.fillStyle='#1e1e24';arr(g,x0-r*.5,y0-r*.5,x1-x0+r,y1-y0+r,r*.6);g.fill();
    for(let k=0;k<40;k++){const u=k/40,per=2*((x1-x0)+(y1-y0));let d=u*per,px,py;const X0=x0-r*.25,Y0=y0-r*.25,X1=x1+r*.25,Y1=y1+r*.25;if(d<X1-X0){px=X0+d;py=Y0;}else if((d-=X1-X0)<Y1-Y0){px=X1;py=Y0+d;}else if((d-=Y1-Y0)<X1-X0){px=X1-d;py=Y1;}else{d-=X1-X0;px=X0;py=Y1-d;}g.fillStyle=k%2?'#f2c232':'#1a1a1e';g.beginPath();g.arc(px,py,r*.22,0,7);g.fill();}
    const pl=g.createLinearGradient(x0,y0,x1,y1);pl.addColorStop(0,'#9aa4b6');pl.addColorStop(.5,'#c0c8d8');pl.addColorStop(1,'#8a94a6');g.fillStyle=pl;g.fillRect(x0,y0,x1-x0,y1-y0);
    g.strokeStyle='rgba(40,46,60,.25)';g.lineWidth=1;for(let x=x0;x<x1;x+=r*1.2){g.beginPath();g.moveTo(x,y0);g.lineTo(x,y1);g.stroke();}for(let y=y0;y<y1;y+=r*1.2){g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();}
    g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(x0+W*.1,y0);g.lineTo(x0+W*.3,y0);g.lineTo(x0+W*.05,y1);g.lineTo(x0-W*.15,y1);g.fill();
    /* les traces de pneus */
    for(const v of S.V){g.fillStyle='rgba(40,40,50,.06)';g.beginPath();g.arc(v.x,v.y,r*.8,0,7);g.fill();}
    /* les voitures, vues de dessus */
    for(const v of S.V){g.save();g.translate(v.x,v.y);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(r*.1,r*.18,r*1.02,r*1.0,0,0,7);g.fill();g.rotate(v.a);
      g.fillStyle='#141418';g.beginPath();g.arc(0,0,r,0,7);g.fill();g.strokeStyle='#3a3a44';g.lineWidth=r*.12;g.beginPath();g.arc(0,0,r*.9,0,7);g.stroke();
      const q=g.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r*.85);q.addColorStop(0,'#ffffff');q.addColorStop(.3,v.c);q.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=v.c;arr(g,-r*.75,-r*.68,r*1.5,r*1.36,r*.45);g.fill();g.fillStyle=q;g.globalAlpha=.55;g.fill();g.globalAlpha=1;
      g.fillStyle='rgba(0,0,0,.35)';arr(g,-r*.6,-r*.5,r*.7,r*1.0,r*.3);g.fill();
      g.fillStyle='#e8c8a0';g.beginPath();g.arc(-r*.2,0,r*.28,0,7);g.fill();g.fillStyle=v.moi?'#2a1a10':['#4a2a1a','#1a1a1a','#c8a040','#6a3a20','#2a1a10','#f0d080'][S.V.indexOf(v)];g.beginPath();g.arc(-r*.25,0,r*.26,Math.PI*.5,Math.PI*1.5);g.fill();
      g.strokeStyle='#1a1a1a';g.lineWidth=r*.08;g.beginPath();g.arc(r*.18,0,r*.16,0,7);g.stroke();
      g.fillStyle='#fff6d0';g.beginPath();g.arc(r*.72,-r*.35,r*.1,0,7);g.arc(r*.72,r*.35,r*.1,0,7);g.fill();
      g.fillStyle='#d8dce6';g.beginPath();g.arc(-r*.7,0,r*.12,0,7);g.fill();g.restore();
      if(v.choc>0||hasard()<.04){g.fillStyle='rgba(180,220,255,.8)';for(let k=0;k<4;k++)g.fillRect(v.x-Math.cos(v.a)*r*.7+(hasard()-.5)*r*.5,v.y-Math.sin(v.a)*r*.7+(hasard()-.5)*r*.5,2,2);}
      if(v.moi){g.strokeStyle='rgba(255,233,120,'+(.5+.4*Math.sin(t*6))+')';g.lineWidth=3;g.beginPath();g.arc(v.x,v.y,r*1.25,0,7);g.stroke();g.fillStyle='#ffe9a8';g.font='900 '+Math.round(r*.55)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('TOI',v.x,v.y-r*1.55);}}
    for(const E of S.eclats){E.t+=dt;const a=1-E.t/.35;if(a<=0)continue;g.fillStyle='rgba(255,240,150,'+a+')';for(let k=0;k<6;k++){const an=k/6*6.28+E.t*4;g.beginPath();g.arc(E.x+Math.cos(an)*r*(.4+E.t*2),E.y+Math.sin(an)*r*(.4+E.t*2),r*.09,0,7);g.fill();}}S.eclats=S.eclats.filter(E=>E.t<.35);
    /* le joystick sous le doigt */
    if(S.stick){const ox=S.stick.o[0]*W,oy=S.stick.o[1]*H,px=S.stick.p[0]*W,py=S.stick.p[1]*H,l=Math.hypot(px-ox,py-oy),m=Math.min(l,r*2.5),k=l?m/l:0;g.fillStyle='rgba(255,255,255,.15)';g.beginPath();g.arc(ox,oy,r*2.5,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.stroke();g.fillStyle='rgba(255,233,168,.85)';g.beginPath();g.arc(ox+(px-ox)*k,oy+(py-oy)*k,r*.8,0,7);g.fill();}
    g.restore();
    g.fillStyle=orH(g,W*.04,W*.96);arr(g,W*.035,H*.878,W*.93,H*.094,H*.016);g.fill();g.fillStyle='#1a2a5c';arr(g,W*.045,H*.885,W*.91,H*.08,H*.012);g.fill();g.textBaseline='middle';g.font='900 '+Math.round(H*.032)+'px "Baloo 2",sans-serif';
    g.textAlign='left';g.fillStyle='#ffd24a';g.fillText(S.pts+' coups',W*.07,H*.925);g.textAlign='right';g.fillStyle=S.temps<6?'#ff6a5a':'#fff';g.fillText(Math.ceil(S.temps)+' s',W*.93,H*.925);});}

/* =====================================================================
   5. LE GUICHET DES LOTS : on échange ses tickets ; un lot gagné se porte.
   ===================================================================== */
const LOTS=[
 {id:'f_ballon',n:'Ballon rouge',p:15},{id:'f_chapeau',n:'Canotier de forain',p:30},{id:'f_coeur',n:'Lunettes cœur',p:40},
 {id:'f_peluche',n:'Nounours',p:60},{id:'f_ballon_or',n:'Ballon doré',p:90},{id:'f_couronne',n:'Couronne de la foire',p:150}];
const aLot=id=>{try{return !!(e.foireLots&&e.foireLots[id]);}catch(x){return false;}};
const porte=()=>{try{return (e.ap&&e.ap._lot)||'';}catch(x){return '';}};
function lotsGuichet(){ouvrir('LOTS & TICKETS','GAGNE DES TICKETS AUX STANDS');JEU={};
  const sc=RAC.querySelector('.fsc');sc.style.display='none';const L=document.createElement('div');L.className='flots';RAC.insertBefore(L,RAC.querySelector('.fbas'));
  const rendre=()=>{const tk=tickets(),p=porte();
    L.innerHTML=LOTS.map(o=>{const a=aLot(o.id);return '<button class="flot '+(a?'a':'')+(p===o.id?' p':'')+(!a&&tk<o.p?' non':'')+'" data-id="'+o.id+'"><canvas width="42" height="48"></canvas><b>'+o.n+'</b><em>'+(a?(p===o.id?'✓ Porté':'Porter'):o.p+' 🎟️')+'</em></button>';}).join('');
    L.querySelectorAll('.flot').forEach(b=>{const o=LOTS.find(x=>x.id===b.dataset.id),q=b.querySelector('canvas').getContext('2d');q.imageSmoothingEnabled=false;
      try{personne(q,21,47,Object.assign({},e.ap||{},{_lot:o.id,_acc:undefined}),'bas',0,false);}catch(z){}
      b.onclick=()=>{vib(8);if(aLot(o.id)){try{e.ap=Object.assign({},e.ap||{});if(e.ap._lot===o.id)delete e.ap._lot;else e.ap._lot=o.id;sauver();}catch(x){}rendre();msg(porte()?'Tu portes ton lot. Tout le monde le verra !':'Lot rangé.');return;}
        if(tickets()<o.p){msg('Il te manque <b>'+(o.p-tickets())+' tickets</b>.<small>Joue aux stands pour en gagner.</small>');return;}
        try{e.tickets=tickets()-o.p;e.foireLots=Object.assign({},e.foireLots||{},{[o.id]:true});e.ap=Object.assign({},e.ap||{},{_lot:o.id});sauver();}catch(x){}
        majTk();SON.gain();msg('<b>'+o.n+'</b> est à toi ! Tu le portes déjà.');rendre();};});};
  rendre();msg('Touche un lot pour l’échanger. Un lot gagné se <b>porte</b>.');actions('<button class="fbt fb2" data-q>Fermer</button>').querySelector('[data-q]').onclick=fermer;}

window.ouvrirForain=function(k){ac();({chamboule,tir,peche,tamp:tamponneuses,lots:lotsGuichet}[k]||chamboule)();};
})();
