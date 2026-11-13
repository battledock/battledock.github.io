/* =====================================================================
   LES JEUX DE LA FÊTE FORAINE (forain.js), ouverts depuis foire.js.
   Chamboule-tout, tir aux canards, pêche aux canards, le tour de grande
   roue, et le guichet où l'on échange ses tickets contre des lots.
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
   1. LE CHAMBOULE-TOUT : dix boîtes en pyramide, trois balles.
      On lance d'un geste vers le haut : la direction vise, la vitesse
      du geste donne la hauteur. Les boîtes touchées s'envolent ; celles
      du dessus, privées d'appui, dégringolent.
   ===================================================================== */
function balle(g,x,y,r){const q=g.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);q.addColorStop(0,'#ffffff');q.addColorStop(.7,'#ece6dc');q.addColorStop(1,'#a89a88');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.strokeStyle='#d8322a';g.lineWidth=Math.max(1,r*.12);g.beginPath();g.arc(x-r*1.1,y,r*.85,-.7,.7);g.stroke();g.beginPath();g.arc(x+r*1.1,y,r*.85,Math.PI-.7,Math.PI+.7);g.stroke();}
function chamboule(){ouvrir('CHAMBOULE-TOUT','3 BALLES · FAIS TOUT TOMBER');
  const B=[];/* la pyramide 4-3-2-1 : rangée, position */
  for(let r=0;r<4;r++)for(let k=0;k<4-r;k++)B.push({r,k,x:(k-(3-r)/2),y:r,vx:0,vy:0,rot:0,vr:0,tombe:false,parti:false,c:['#e8302a','#3a8ad8','#ffd24a','#7ee08a'][(r+k)%4]});
  const S={balles:3,vol:null,traine:null,fin:false,t:0,tombees:0};JEU=S;
  msg('Glisse le doigt <b>vers le haut</b> pour lancer.<small>La direction vise, la vitesse donne la hauteur.</small>');actions('');
  let dep=null;
  CV.onpointerdown=ev=>{if(S.vol||S.fin||S.balles<=0)return;const p=pt(ev);if(p[1]<.55)return;dep={p,t:performance.now()};S.traine=[p,p];ac();};
  CV.onpointermove=ev=>{if(!dep)return;S.traine=[dep.p,pt(ev)];};
  CV.onpointerup=ev=>{if(!dep)return;const p=pt(ev),dt=Math.max(60,performance.now()-dep.t)/1000,dx=p[0]-dep.p[0],dy=p[1]-dep.p[1];const d0=dep;dep=null;S.traine=null;
    if(dy>-.06){msg('Lance <b>vers le haut</b> d’un geste franc !');return;}
    const v=Math.min(2.4,-dy/dt);  /* vitesse verticale du geste, en écrans par seconde */
    S.balles--;SON.lancer();vib(8);
    /* la cible sur le plan des boîtes : en x selon la direction, en hauteur selon la vitesse */
    S.vol={t:0,T:.55,x0:.5,tx:.5+dx*1.25,ty:Math.max(.05,.95-v*.38),h:.28+v*.06};};
  const geo=(W,H)=>{const u=Math.min(W,H*.9)/10,sx=W/2,sy=H*.56;return {u,sx,sy,bw:u*1.1,bh:u*1.25};};
  function impact(W,H){const V=S.vol,{u,sx,sy,bw,bh}=geo(W,H),px=V.tx*W,py=V.ty*H;let touche=0;
    for(const b of B){if(b.tombe)continue;const bx=sx+b.x*bw,by=sy-b.y*bh;if(Math.abs(px-bx)<bw*.62&&Math.abs(py-(by-bh/2))<bh*.65){b.tombe=true;b.vx=(px<bx?1:-1)*(1+hasard())*u*.08+(V.tx-.5)*u*.4;b.vy=-u*(.25+hasard()*.2);b.vr=(hasard()-.5)*.5;touche++;}}
    if(touche){SON.boite();vib([12,20,12]);}else SON.rate();
    /* celles qui n'ont plus d'appui tombent à leur tour */
    let bouge=true;while(bouge){bouge=false;for(const b of B){if(b.tombe||b.r===0)continue;const s1=B.find(o=>o.r===b.r-1&&o.k===b.k),s2=B.find(o=>o.r===b.r-1&&o.k===b.k+1);if((s1&&s1.tombe)||(s2&&s2.tombe)){b.tombe=true;b.vx=(hasard()-.5)*u*.1;b.vy=0;b.vr=(hasard()-.5)*.3;bouge=true;}}}
    return touche;}
  function bilan(){const n=B.filter(b=>b.tombe).length;S.fin=true;const tout=n===B.length;
    setTimeout(()=>{if(!RAC||JEU!==S)return;finPartie(tout?'CHAMBOULE-TOUT ! Tout est par terre !':n+' boîte'+(n>1?'s':'')+' sur 10',tout?15:Math.floor(n/2),chamboule);},900);}
  boucle((dt,t)=>{const {W,H}=taille(),g=G,{u,sx,sy,bw,bh}=geo(W,H);S.t+=dt;
    cadreBaraque(g,W,H,t,'#e8302a','#fff6e6');
    /* l'étagère */
    for(const x of [W*.17,W*.83]){bois(g,x-u*.14,sy,u*.28,H*.3,'#8a5a2a','#4a2410');}
    g.fillStyle='rgba(60,30,10,.25)';g.beginPath();g.ellipse(W/2,sy+u*.5,W*.4,u*.25,0,0,7);g.fill();bois(g,W*.1,sy,W*.8,u*.36);g.fillStyle=orV(g,sy+u*.32,sy+u*.42);g.fillRect(W*.1,sy+u*.3,W*.8,u*.08);
    /* les boîtes */
    for(const b of B){if(b.parti)continue;let bx=sx+b.x*bw,by=sy-b.y*bh;
      if(b.tombe){b.vy+=u*2.4*dt;b.ox=(b.ox||0)+b.vx*dt*8;b.oy=(b.oy||0)+b.vy*dt*8;b.rot+=b.vr;bx+=b.ox;by+=b.oy;if(by>H+bh*2)b.parti=true;}
      g.save();g.translate(bx,by-bh/2);g.rotate(b.rot);const w=bw*.86,h=bh*.94;
      const mq=g.createLinearGradient(-w/2,0,w/2,0);mq.addColorStop(0,'#3a1a10');mq.addColorStop(.18,b.c);mq.addColorStop(.36,'#ffffff');mq.addColorStop(.52,b.c);mq.addColorStop(.85,b.c);mq.addColorStop(1,'#2a1208');g.fillStyle=mq;g.fillRect(-w/2,-h/2,w,h);
      const ch=g.createLinearGradient(-w/2,0,w/2,0);ch.addColorStop(0,'#6a6e78');ch.addColorStop(.35,'#ffffff');ch.addColorStop(.6,'#c8ccd6');ch.addColorStop(1,'#4a4e58');g.fillStyle=ch;g.fillRect(-w/2,-h/2,w,h*.1);g.fillRect(-w/2,h/2-h*.1,w,h*.1);
      g.fillStyle='rgba(0,0,0,.25)';for(let k=1;k<4;k++){g.fillRect(-w/2,-h/2+h*.1+k*h*.02,w,1);}
      g.fillStyle='#fbf4e6';g.fillRect(-w*.36,-h*.2,w*.72,h*.4);g.fillStyle=b.c;g.fillRect(-w*.36,-h*.2,w*.72,h*.06);g.fillRect(-w*.36,h*.14,w*.72,h*.06);
      g.fillStyle=b.c;g.font='900 '+Math.round(h*.26)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('★',0,h*.01);
      g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-w*.2,-h/2,w*.06,h);g.restore();}
    /* le comptoir, et les balles qui restent */
    const cy=H*.84;comptoir(g,W,H,cy,'#b8262c');
    for(let i=0;i<S.balles-(S.vol?0:1);i++)balle(g,W*.12+i*u*.9,cy+u*.5,u*.32);
    /* la balle prête à partir, sous le doigt */
    if(!S.vol&&!S.fin&&S.balles>0){const bx=W*.5,by=H*.92;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(bx,by+u*.4,u*.5,u*.15,0,0,7);g.fill();balle(g,bx,by,u*.42);
      if(!S.traine){const a=.4+.4*Math.sin(t*5);g.strokeStyle='rgba(255,233,168,'+a+')';g.lineWidth=u*.08;g.beginPath();g.moveTo(bx,by-u*.8);g.lineTo(bx,by-u*1.6);g.moveTo(bx-u*.25,by-u*1.35);g.lineTo(bx,by-u*1.6);g.lineTo(bx+u*.25,by-u*1.35);g.stroke();}}
    if(S.traine){const [a,b]=S.traine;g.strokeStyle='rgba(255,233,168,.6)';g.lineWidth=u*.1;g.setLineDash([u*.2,u*.2]);g.beginPath();g.moveTo(a[0]*W,a[1]*H);g.lineTo(b[0]*W,b[1]*H);g.stroke();g.setLineDash([]);}
    /* la balle en vol : elle rapetisse en s'éloignant, sur une belle courbe */
    if(S.vol){const V=S.vol;V.t+=dt;const k=Math.min(1,V.t/V.T),x=(V.x0+(V.tx-V.x0)*k)*W,y=(.92+(V.ty-.92)*k)*H-Math.sin(k*Math.PI)*V.h*H,r=u*(.42-.24*k);
      g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,(.92+(V.ty-.92)*k)*H+u*.3,r,r*.3,0,0,7);g.fill();
      balle(g,x,y,r);
      if(k>=1){const n=impact(W,H);S.vol=null;S.tombees=B.filter(b=>b.tombe).length;
        if(n>0)pop(n>=4?'BOUM !':'Touché !');
        msg(S.balles>0?S.tombees+' boîte'+(S.tombees>1?'s':'')+' par terre. <b>Encore '+S.balles+' balle'+(S.balles>1?'s':'')+'</b>.':'');
        if(S.tombees===B.length||S.balles<=0)bilan();}}});}

/* =====================================================================
   2. LE TIR AUX CANARDS : trois rangées de canards en fer qui défilent.
      On touche l'écran pour tirer, là où on vise. 12 plombs, 25 secondes.
      Canard blanc 1 pt, jaune 2 pts, et le canard doré : 5 pts.
   ===================================================================== */
function tir(){ouvrir('TIR AUX CANARDS','12 PLOMBS · 25 SECONDES');
  const S={plombs:12,temps:25,pts:0,C:[],eclairs:[],trous:[],fin:false,recul:0,vise:[.5,.5],t:0};JEU=S;
  for(let r=0;r<3;r++)for(let i=0;i<7;i++)S.C.push({r,u:i/7,coul:r===1?'jaune':'blanc',abat:0,dore:false});
  const choisirDore=()=>{for(const c of S.C)c.dore=false;const L=S.C.filter(c=>!c.abat);if(L.length)ALEA(L).dore=true;};choisirDore();
  msg('Touche l’écran pour <b>tirer</b>.<small>Le canard doré vaut 5 points !</small>');actions('');
  const pos=(c,W,H)=>{const v=[.07,-.1,.13][c.r],x=((c.u+S.t*v)%1+1)%1;return [x*W*1.2-W*.1,H*(.3+c.r*.18)];};
  CV.onpointerdown=ev=>{if(S.fin||S.plombs<=0)return;ac();const p=pt(ev);S.vise=p;S.plombs--;S.recul=1;SON.pan();vib(14);
    const {W,H}=taille();let mieux=null;
    for(const c of S.C){if(c.abat)continue;const [x,y]=pos(c,W,H);const s=H*.06;if(Math.abs(p[0]*W-x)<s*1.1&&Math.abs(p[1]*H-(y-s*.4))<s){mieux=c;break;}}
    if(mieux){mieux.abat=1;const v=mieux.dore?5:mieux.coul==='jaune'?2:1;S.pts+=v;SON.ding();pop(mieux.dore?'DORÉ ! +5':'+'+v,mieux.dore?'#ffd24a':'#fff');if(mieux.dore)choisirDore();
      setTimeout(()=>{mieux.abat=0;},2600);}
    else S.trous.push({x:p[0],y:p[1],t:S.t});
    S.eclairs.push({x:p[0],y:p[1],t:S.t});
    if(S.plombs<=0)setTimeout(fin,600);};
  function fin(){if(S.fin)return;S.fin=true;const n=S.pts>=18?12:Math.floor(S.pts/2);finPartie(S.pts+' points !'+(S.pts>=18?' Tireur d’élite !':''),n,tir);}
  boucle((dt,t)=>{const {W,H}=taille(),g=G;if(!S.fin){S.t+=dt;S.temps=Math.max(0,25-S.t);if(S.temps<=0)fin();}
    cadreBaraque(g,W,H,t,'#1f5fa8','#ffd24a');
    /* le fond étoilé du stand */
    {const x0=W*.06,y0=H*.13,w=W*.88,h=H*.66;g.fillStyle=orH(g,x0-6,x0+w+6);arr(g,x0-6,y0-6,w+12,h+12,10);g.fill();const q=g.createLinearGradient(0,y0,0,y0+h);q.addColorStop(0,'#14204a');q.addColorStop(1,'#2a3a7a');g.fillStyle=q;g.fillRect(x0,y0,w,h);
     g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(x0,y0+h*.92);for(let x=0;x<=w;x+=w/12)g.lineTo(x0+x,y0+h*.86-Math.sin(x/w*9)*h*.03);g.lineTo(x0+w,y0+h);g.lineTo(x0,y0+h);g.fill();}
    for(let i=0;i<40;i++){g.fillStyle='rgba(255,240,180,'+(.3+.5*Math.abs(Math.sin(t*1.5+i)))+')';g.fillRect((i*97%100)/100*W*.9+W*.05,(i*53%100)/100*H*.6+H*.15,2,2);}
    /* les rails et les canards */
    for(let r=0;r<3;r++){const y=H*(.3+r*.18);const q=g.createLinearGradient(0,y,0,y+H*.02);q.addColorStop(0,'#e8ecf2');q.addColorStop(.4,'#9aa0ac');q.addColorStop(1,'#3a3e48');g.fillStyle=q;g.fillRect(W*.06,y+H*.004,W*.88,H*.018);for(let x=W*.08;x<W*.94;x+=W*.06){g.fillStyle='#5a5e68';g.beginPath();g.arc(x,y+H*.013,H*.003,0,7);g.fill();}}
    g.save();g.beginPath();g.rect(W*.06,H*.13,W*.88,H*.66);g.clip();
    for(const c of S.C){const [x,y]=pos(c,W,H),s=H*.06,dir=[1,-1,1][c.r];const k=c.abat?Math.min(1,c.abat):0;if(c.abat)c.abat=Math.min(1,c.abat+dt*6);
      g.save();g.translate(x,y);g.scale(dir,1-k*.85);const col=c.dore?'#f5c430':c.coul==='jaune'?'#ffd24a':'#f4f4f4',ombre=c.dore?'#b8860b':c.coul==='jaune'?'#d8a020':'#c8c8d0';
      const mq=g.createLinearGradient(0,-s*1.3,0,0);mq.addColorStop(0,'#ffffff');mq.addColorStop(.35,col);mq.addColorStop(1,ombre);g.fillStyle=mq;g.beginPath();g.ellipse(0,-s*.35,s*.75,s*.42,0,0,7);g.fill();g.beginPath();g.arc(s*.5,-s*.95,s*.32,0,7);g.fill();
      g.beginPath();g.moveTo(-s*.7,-s*.45);g.lineTo(-s*1.0,-s*.75);g.lineTo(-s*.55,-s*.6);g.fill();
      g.fillStyle=ombre;g.beginPath();g.ellipse(-s*.1,-s*.28,s*.42,s*.18,-.15,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-s*.15,-s*.6,s*.38,s*.07,0,0,7);g.fill();g.beginPath();g.arc(s*.4,-s*1.08,s*.08,0,7);g.fill();
      g.fillStyle='#ff8a2a';g.beginPath();g.moveTo(s*.78,-s*1.0);g.lineTo(s*1.08,-s*.92);g.lineTo(s*.78,-s*.84);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(s*.58,-s*1.02,s*.06,0,7);g.fill();
      g.fillStyle='#5a4a3a';g.fillRect(-s*.08,-s*.02,s*.16,s*.1);
      if(c.dore){g.fillStyle='rgba(255,240,150,'+(.5+.5*Math.sin(t*8))+')';g.fillRect(-s*.9,-s*1.4,s*.12,s*.12);g.fillRect(s*.9,-s*.3,s*.12,s*.12);}
      g.restore();}
    g.restore();
    /* les impacts dans le décor */
    for(const o of S.trous){g.fillStyle='#0a0a12';g.beginPath();g.arc(o.x*W,o.y*H,H*.006,0,7);g.fill();}
    for(const o of S.eclairs){const a=1-(S.t-o.t)/.18;if(a<=0)continue;g.fillStyle='rgba(255,240,160,'+a+')';g.beginPath();g.arc(o.x*W,o.y*H,H*.03*(1.4-a),0,7);g.fill();}
    S.eclairs=S.eclairs.filter(o=>S.t-o.t<.2);
    /* le comptoir, la carabine qui suit la visée */
    const cy=H*.82;comptoir(g,W,H,cy,'#1f4a98');
    const gx=W*.5+(S.vise[0]-.5)*W*.25,gy=H*1.02+S.recul*H*.02,a=Math.atan2(S.vise[1]*H-gy,S.vise[0]*W-gx);S.recul=Math.max(0,S.recul-dt*8);
    g.save();g.translate(gx,gy);g.rotate(a);{const q=g.createLinearGradient(0,-H*.03,0,H*.045);q.addColorStop(0,'#c88a48');q.addColorStop(.5,'#8a5228');q.addColorStop(1,'#4a2410');g.fillStyle=q;}g.beginPath();g.moveTo(-H*.06,-H*.03);g.lineTo(H*.12,-H*.022);g.lineTo(H*.12,H*.022);g.lineTo(-H*.06,H*.045);g.closePath();g.fill();g.fillStyle='rgba(255,220,170,.35)';g.fillRect(-H*.05,-H*.026,H*.16,H*.006);
      {const q=g.createLinearGradient(0,-H*.013,0,H*.013);q.addColorStop(0,'#9aa0ac');q.addColorStop(.35,'#f4f6fa');q.addColorStop(1,'#2a2e38');g.fillStyle=q;}g.fillRect(H*.11,-H*.013,H*.24,H*.026);g.fillStyle=orH(g,H*.1,H*.13);g.fillRect(H*.1,-H*.016,H*.025,H*.032);g.fillStyle='#1a1a20';g.fillRect(H*.33,-H*.02,H*.02,H*.01);g.restore();
    /* le viseur */
    const vx=S.vise[0]*W,vy=S.vise[1]*H,r=H*.035;g.strokeStyle='rgba(255,80,60,.9)';g.lineWidth=2;g.beginPath();g.arc(vx,vy,r,0,7);g.moveTo(vx-r*1.5,vy);g.lineTo(vx-r*.5,vy);g.moveTo(vx+r*.5,vy);g.lineTo(vx+r*1.5,vy);g.moveTo(vx,vy-r*1.5);g.lineTo(vx,vy-r*.5);g.moveTo(vx,vy+r*.5);g.lineTo(vx,vy+r*1.5);g.stroke();
    /* le tableau : plombs, temps, points */
    g.fillStyle=orH(g,W*.04,W*.96);arr(g,W*.035,H*.878,W*.93,H*.094,H*.016);g.fill();g.fillStyle='#1a2a5c';arr(g,W*.045,H*.885,W*.91,H*.08,H*.012);g.fill();g.textBaseline='middle';g.font='900 '+Math.round(H*.035)+'px "Baloo 2",sans-serif';
    g.textAlign='left';g.fillStyle='#ffd24a';g.fillText(S.pts+' pts',W*.07,H*.925);
    g.textAlign='center';g.fillStyle=S.temps<6?'#ff6a5a':'#fff';g.fillText(Math.ceil(S.temps)+' s',W*.5,H*.925);
    g.textAlign='right';for(let i=0;i<12;i++){g.fillStyle=i<S.plombs?'#c8ccd8':'rgba(255,255,255,.15)';g.fillRect(W*.93-i*W*.022,H*.91,W*.012,H*.03);}});}

/* =====================================================================
   3. LA PÊCHE AUX CANARDS : les canards tournent dans le bassin.
      Fais glisser l'hameçon au-dessus d'un canard, lâche : il est pêché,
      on le retourne… et le chiffre dessous dit combien de tickets. 3 prises.
   ===================================================================== */
function peche(){ouvrir('PÊCHE AUX CANARDS','3 PRISES · GAGNÉ À TOUS LES COUPS');
  const S={prises:3,D:[],gain:0,crochet:null,peche:null,fin:false,t:0};JEU=S;
  const VAL=[1,1,1,2,2,2,3,3,5];for(let i=0;i<12;i++)S.D.push({u:i/12,v:i===5?10:ALEA(VAL),c:ALEA(['#ffd24a','#ffd24a','#ff9ab8','#7ad0ff','#7ee08a']),parti:false});
  msg('Fais glisser l’hameçon sur un canard, puis <b>lâche</b>.<small>Le chiffre caché dessous, ce sont tes tickets.</small>');actions('');
  const geo=(W,H)=>({cx:W/2,cy:H*.5,rx:W*.38,ry:H*.25});
  const pos=(d,W,H)=>{const {cx,cy,rx,ry}=geo(W,H),a=(d.u+S.t*.045)*Math.PI*2;return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,Math.sin(a)];};
  CV.onpointerdown=ev=>{if(S.fin||S.peche)return;ac();S.crochet=pt(ev);};
  CV.onpointermove=ev=>{if(S.crochet)S.crochet=pt(ev);};
  CV.onpointerup=ev=>{if(!S.crochet||S.peche)return;const p=S.crochet;S.crochet=null;const {W,H}=taille();let m=null,dm=1e9;
    for(const d of S.D){if(d.parti)continue;const [x,y]=pos(d,W,H),dd=Math.hypot(p[0]*W-x,p[1]*H-y);if(dd<dm){dm=dd;m=d;}}
    if(!m||dm>H*.07){SON.plouf();msg('Raté, l’hameçon est tombé à l’eau ! Vise bien <b>le dessus</b> du canard.');return;}
    m.parti=true;S.prises--;SON.plouf();vib(12);const [x,y]=pos(m,W,H);S.peche={d:m,x:x/W,y:y/H,t:0};};
  boucle((dt,t)=>{const {W,H}=taille(),g=G,{cx,cy,rx,ry}=geo(W,H);S.t+=dt;
    cadreBaraque(g,W,H,t,'#2ab0a0','#ffffff');
    /* le bassin : un rebord, l'eau qui scintille */
    g.fillStyle='rgba(60,30,10,.25)';g.beginPath();g.ellipse(cx,cy+H*.05,rx+W*.11,ry+H*.08,0,0,7);g.fill();
    {const q=g.createLinearGradient(0,cy-ry,0,cy+ry+H*.1);q.addColorStop(0,'#e8443c');q.addColorStop(1,'#8a1a1a');g.fillStyle=q;}g.beginPath();g.ellipse(cx,cy+H*.025,rx+W*.1,ry+H*.08,0,0,7);g.fill();
    for(let i=0;i<16;i++){const a=i/16*6.28,x=cx+Math.cos(a)*(rx+W*.095),y=cy+H*.03+Math.sin(a)*(ry+H*.075);if(Math.sin(a)>0)ampoule(g,x,y,W*.008,((i+Math.floor(t*4))%2)===0);}
    g.fillStyle=orV(g,cy-ry-H*.07,cy+ry+H*.07);g.beginPath();g.ellipse(cx,cy,rx+W*.09,ry+H*.07,0,0,7);g.fill();
    const eau=g.createLinearGradient(0,cy-ry,0,cy+ry);eau.addColorStop(0,'#3ac0f0');eau.addColorStop(1,'#1a6aa8');g.fillStyle=eau;g.beginPath();g.ellipse(cx,cy,rx+W*.06,ry+H*.05,0,0,7);g.fill();
    g.fillStyle='#2a8ac0';g.beginPath();g.ellipse(cx,cy,rx-W*.08,ry-H*.07,0,0,7);g.fill();g.fillStyle='#ffd24a';g.beginPath();g.ellipse(cx,cy,rx-W*.1,ry-H*.085,0,0,7);g.fill();g.fillStyle='#e8302a';g.beginPath();g.ellipse(cx,cy,rx-W*.12,ry-H*.1,0,0,7);g.fill();
    /* au milieu, un petit chapiteau rayé et son fanion */
    {const rr=Math.min(rx-W*.14,(ry-H*.11)*1.6),tb=cy+H*.03;for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#2ab0a0';g.beginPath();g.moveTo(cx,cy-rr*.9);g.lineTo(cx-rr+i*rr/4,tb);g.lineTo(cx-rr+(i+1)*rr/4,tb);g.closePath();g.fill();}
     g.fillStyle='#ffd24a';g.fillRect(cx-rr,tb-2,rr*2,6);for(let i=0;i<9;i++)ampoule(g,cx-rr+i*rr/4,tb+1,W*.007,((i+Math.floor(t*5))%3)===0);
     g.fillStyle='#c8ccd8';g.fillRect(cx-1,cy-rr*.9-H*.05,2,H*.05);g.fillStyle='#e8302a';g.beginPath();g.moveTo(cx+1,cy-rr*.9-H*.05);g.lineTo(cx+W*.05,cy-rr*.9-H*.04);g.lineTo(cx+1,cy-rr*.9-H*.03);g.fill();
     g.fillStyle='#fff';g.font='900 '+Math.round(H*.026)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('1 · 2 · 3 · 5 · 10',cx,tb+H*.04);}
    for(let i=0;i<30;i++){const a=i/30*6.28+t*.3,x=cx+Math.cos(a)*(rx-W*.01),y=cy+Math.sin(a)*(ry-H*.01);g.strokeStyle='rgba(255,255,255,'+(.25+.35*Math.sin(t*3+i))+')';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y,W*.02,H*.004,0,0,Math.PI);g.stroke();}
    /* les canards, triés de l'arrière vers l'avant */
    const L=S.D.filter(d=>!d.parti).map(d=>[d,...pos(d,W,H)]).sort((a,b)=>a[3]-b[3]);
    for(const [d,x,y,z] of L){const s=H*.045*(1+z*.15);canard(g,x,y+Math.sin(t*3+d.u*9)*H*.004,s,d.c,Math.cos((d.u+S.t*.045)*Math.PI*2+Math.PI/2)>0?1:-1);}
    /* l'hameçon qui suit le doigt */
    if(S.crochet){const x=S.crochet[0]*W,y=S.crochet[1]*H;g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,y-H*.02);g.stroke();
      g.strokeStyle='#c8ccd8';g.lineWidth=3;g.beginPath();g.arc(x+H*.01,y,H*.012,Math.PI,Math.PI*2.6);g.stroke();g.fillStyle='#e8302a';g.fillRect(x-H*.006,y-H*.05,H*.012,H*.02);}
    /* le canard pêché : il monte, se retourne, montre son chiffre */
    if(S.peche){const P=S.peche;P.t+=dt;const k=Math.min(1,P.t/.7),x=(P.x+(.5-P.x)*k)*W,y=(P.y+(.38-P.y)*k)*H-Math.sin(k*Math.PI)*H*.08,s=H*.05*(1+k*1.4);
      g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,y-s*1.2);g.stroke();
      if(P.t<1)canard(g,x,y,s,P.d.c,1);
      else{const r=s*1.3;g.fillStyle='#fff';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle=P.d.v>=5?'#f5c430':'#e8302a';g.beginPath();g.arc(x,y,r*.86,0,7);g.fill();
        g.fillStyle='#fff';g.font='900 '+Math.round(r*1.1)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(P.d.v,x,y+r*.05);
        if(!P.vu){P.vu=1;S.gain+=P.d.v;SON.ding();pop('+'+P.d.v+' 🎟️',P.d.v>=5?'#ffd24a':'#fff');vib(P.d.v>=5?[20,30,40]:15);}
        if(P.t>2.1){S.peche=null;if(S.prises<=0){S.fin=true;finPartie('Belle pêche : '+S.gain+' tickets',S.gain,peche);}else msg('Encore <b>'+S.prises+' prise'+(S.prises>1?'s':'')+'</b> ! Total : '+S.gain+' tickets.');}}}});}
function canard(g,x,y,s,c,dir){g.save();g.translate(x,y);g.scale(dir,1);g.fillStyle='rgba(0,40,80,.25)';g.beginPath();g.ellipse(0,s*.32,s*.95,s*.24,0,0,7);g.fill();
  const q=g.createLinearGradient(0,-s*.5,0,s*.5);q.addColorStop(0,'rgba(255,255,255,.45)');q.addColorStop(.45,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(90,50,20,.3)');
  g.beginPath();g.moveTo(-s*.9,-s*.15);g.quadraticCurveTo(-s*1.05,-s*.55,-s*.75,-s*.35);g.quadraticCurveTo(-s*.2,-s*.4,s*.25,-s*.3);g.quadraticCurveTo(s*.85,-s*.25,s*.8,s*.1);g.quadraticCurveTo(s*.6,s*.48,0,s*.45);g.quadraticCurveTo(-s*.75,s*.42,-s*.9,-s*.15);g.fillStyle=c;g.fill();g.fillStyle=q;g.fill();
  g.fillStyle=c;g.beginPath();g.arc(s*.5,-s*.62,s*.38,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(s*.4,-s*.78,s*.14,0,7);g.fill();
  g.fillStyle='rgba(120,70,10,.25)';g.beginPath();g.ellipse(-s*.15,-s*.05,s*.42,s*.2,-.2,0,7);g.fill();g.strokeStyle='rgba(120,70,10,.35)';g.lineWidth=Math.max(1,s*.04);g.beginPath();g.moveTo(-s*.45,-s*.02);g.quadraticCurveTo(-s*.15,s*.12,s*.2,-s*.02);g.stroke();
  g.fillStyle='#ff7a2a';g.beginPath();g.moveTo(s*.82,-s*.6);g.quadraticCurveTo(s*1.25,-s*.58,s*1.18,-s*.44);g.quadraticCurveTo(s*1,-s*.4,s*.82,-s*.46);g.fill();g.fillStyle='rgba(160,60,10,.5)';g.fillRect(s*.84,-s*.52,s*.3,s*.03);
  g.fillStyle='#1a1a1a';g.beginPath();g.arc(s*.62,-s*.7,s*.075,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s*.64,-s*.72,s*.025,0,7);g.fill();
  g.fillStyle='#c8ccd8';g.fillRect(-s*.04,-s*1.02,s*.08,s*.28);g.strokeStyle='#e8ecf2';g.lineWidth=Math.max(1,s*.06);g.beginPath();g.arc(0,-s*1.08,s*.1,0,7);g.stroke();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;g.beginPath();g.ellipse(0,s*.4,s*1.05,s*.16,0,.2,Math.PI-.2);g.stroke();g.restore();}

/* =====================================================================
   4. LE TOUR DE GRANDE ROUE : on monte dans la nacelle, la ville s'étend,
      Notre-Dame de la Garde s'illumine. En haut, on peut prendre une photo.
   ===================================================================== */
function roue(){ouvrir('GRANDE ROUE','UN TOUR AU-DESSUS DE MARSEILLE');
  const S={t:0,D:26,photo:false,flash:0};JEU=S;SON.orgue();
  msg('La nacelle monte… <small>Prends une photo quand tu es tout en haut.</small>');
  const a=actions('<button class="fbt" data-p disabled>📸 Prendre une photo</button>');a.querySelector('[data-p]').onclick=()=>{if(S.photo)return;S.photo=true;S.flash=1;vib(20);SON.ding();
    try{const c=document.createElement('canvas'),w=400,h=Math.round(CV.height/CV.width*400);c.width=w;c.height=h;c.getContext('2d').drawImage(CV,0,0,w,h);
      const L=JSON.parse(localStorage.getItem('bd_foireAlbum')||'[]');L.unshift({d:Date.now(),img:c.toDataURL('image/jpeg',.75)});while(L.length>8)L.pop();localStorage.setItem('bd_foireAlbum',JSON.stringify(L));}catch(x){}
    a.querySelector('[data-p]').textContent='📸 Photo gardée !';a.querySelector('[data-p]').disabled=true;pop('Clic !','#fff');};
  /* la ville, dessinée une fois */
  let VILLE=null;
  function ville(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const hy=H*.62;
    /* la mer, bleue, et ses reflets de soleil */
    const m=g.createLinearGradient(0,hy,0,H);m.addColorStop(0,'#5aa8d8');m.addColorStop(1,'#1a5a9a');g.fillStyle=m;g.fillRect(0,hy,W,H-hy);
    for(let i=0;i<160;i++){g.fillStyle='rgba(255,246,210,'+(hasard()*.6)+')';g.fillRect(W*.35+hasard()*W*.4,hy+hasard()*(H-hy)*.6,2+hasard()*12,1);}
    /* les îles du Frioul, au large */
    g.fillStyle='#c8b8a0';g.beginPath();g.moveTo(W*.02,hy+2);g.quadraticCurveTo(W*.1,hy-H*.03,W*.2,hy+2);g.fill();g.beginPath();g.moveTo(W*.24,hy+2);g.quadraticCurveTo(W*.3,hy-H*.018,W*.36,hy+2);g.fill();
    /* la colline calcaire et la Bonne Mère */
    const nx=W*.72;g.fillStyle='#a8b89a';g.beginPath();g.moveTo(0,hy);for(let x=0;x<=W;x+=W/60)g.lineTo(x,hy-H*.04-Math.max(0,H*.2-Math.abs(x-nx)*.9));g.lineTo(W,hy);g.closePath();g.fill();
    for(let i=0;i<160;i++){const x=hasard()*W,yy=hy-H*.04-Math.max(0,H*.2-Math.abs(x-nx)*.9);g.fillStyle=i%3?'#6a8a5a':'#e8dcc4';g.beginPath();g.arc(x,yy+hasard()*H*.08,W*.006+hasard()*W*.006,0,7);g.fill();}
    const ny=hy-H*.24,u=H*.0068;g.fillStyle='#f2e6cc';g.fillRect(nx-u*6,ny,u*12,u*7);g.fillRect(nx-u*2.2,ny-u*8,u*4.4,u*9);g.fillRect(nx-u*1.3,ny-u*12,u*2.6,u*4.5);
    for(let k=0;k<5;k++){g.fillStyle=k%2?'#c8a888':'#f2e6cc';g.fillRect(nx-u*6,ny+u*1+k*u*1.2,u*12,u*.6);}g.fillStyle='#c8a888';g.beginPath();g.arc(nx-u*4,ny,u*2,Math.PI,0);g.fill();
    g.fillStyle='#ffd24a';g.fillRect(nx-u*.5,ny-u*15.5,u,u*3.6);g.beginPath();g.arc(nx,ny-u*16,u*.7,0,7);g.fill();g.fillStyle='rgba(255,230,140,.35)';g.beginPath();g.arc(nx,ny-u*14,u*3,0,7);g.fill();
    /* la ville : façades crème, toits de tuiles, volets */
    for(let i=0;i<110;i++){const x=hasard()*W,w=W*(.025+hasard()*.04),h=H*(.025+hasard()*.09);if(Math.abs(x-nx)<W*.09)continue;g.fillStyle=['#f2e6cc','#ead4b0','#f6ecda','#e4c8a4','#efe0c4'][i%5];g.fillRect(x,hy-h,w,h);
      g.fillStyle='#c0603a';g.beginPath();g.moveTo(x-1,hy-h);g.lineTo(x+w/2,hy-h-H*.008);g.lineTo(x+w+1,hy-h);g.fill();g.fillStyle='rgba(120,80,50,.18)';g.fillRect(x+w-2,hy-h,2,h);
      for(let k=0;k<Math.floor(h/(H*.014));k++)for(let j=0;j<Math.floor(w/(W*.012));j++){g.fillStyle='#5a6a7a';g.fillRect(x+2+j*W*.012,hy-h+H*.006+k*H*.014,W*.005,H*.007);g.fillStyle=['#3a7a6a','#5a8ab0','#c87a3a'][i%3];g.fillRect(x+1+j*W*.012,hy-h+H*.006+k*H*.014,W*.0018,H*.007);}}
    /* le Vieux-Port, ses mâts blancs */
    g.fillStyle='#3a88c0';g.fillRect(W*.22,hy,W*.26,H*.05);for(let i=0;i<26;i++){const x=W*.23+i*W*.01;g.fillStyle='#ffffff';g.fillRect(x,hy-H*.03,1,H*.035);g.fillStyle='#f6f6f6';g.fillRect(x-2,hy+H*.004,5,2);}
    /* la Major, rayée */
    const mx=W*.1;for(let k=0;k<6;k++){g.fillStyle=k%2?'#7a8a6a':'#f2e6cc';g.fillRect(mx,hy-H*.07+k*H*.0117,W*.06,H*.0117);}g.fillStyle='#7a8a6a';g.beginPath();g.arc(mx+W*.03,hy-H*.07,W*.02,Math.PI,0);g.fill();
    VILLE=c;}
  boucle((dt,t)=>{const {W,H}=taille(),g=G;if(!VILLE||VILLE.width!==W)ville(W,H);S.t+=dt;
    const k=Math.min(1,S.t/S.D),haut=Math.sin(k*Math.PI);  /* 0 en bas, 1 au sommet */
    /* le ciel */
    const ci=g.createLinearGradient(0,0,0,H);ci.addColorStop(0,'#5aa8e8');ci.addColorStop(.45,'#a8d4f2');ci.addColorStop(.62,'#ffe8c0');ci.addColorStop(1,'#ffd09a');g.fillStyle=ci;g.fillRect(0,0,W,H);
    {const so=g.createRadialGradient(W*.55,H*.3,0,W*.55,H*.3,H*.25);so.addColorStop(0,'rgba(255,250,220,.95)');so.addColorStop(.15,'rgba(255,240,190,.6)');so.addColorStop(1,'rgba(255,240,190,0)');g.fillStyle=so;g.fillRect(0,0,W,H);}
    for(const [x,y,k] of [[.15,.12,1],[.7,.08,.8],[.4,.2,.7],[.88,.24,.9]]){g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<5;i++){g.beginPath();g.arc(W*x+(i-2)*W*.04*k,H*y-Math.sin(i/4*Math.PI)*H*.02*k,W*.045*k,0,7);g.fill();}}
    for(let i=0;i<3;i++){const x=(W*(.2+i*.3)+t*W*.02*(i+1))%W;g.strokeStyle='#4a4a5a';g.lineWidth=1.5;g.beginPath();g.moveTo(x-W*.015,H*(.18+i*.05));g.quadraticCurveTo(x,H*(.17+i*.05),x+W*.015,H*(.18+i*.05));g.stroke();}
    /* la ville : plus on monte, plus on la voit d'en haut */
    const dy=(1-haut)*H*.42;g.drawImage(VILLE,0,dy);
    /* la foire en bas, avec ses lumières, qui s'éloigne */
    {const fy=H*.9+dy*.4;g.fillStyle='#f3dfe6';g.fillRect(0,fy,W,H);for(let i=0;i<60;i++){g.fillStyle=['#f6c6d0','#bfe8d6','#f8e7a4','#cfd8f6'][i%4];g.fillRect((i*37%100)/100*W,fy+(i%5)*H*.012,W*.03,H*.008);}
     for(let i=0;i<9;i++){const x=(i*113%100)/100*W;for(let k=0;k<6;k++){g.fillStyle=k%2?'#fff':'#e8443c';g.beginPath();g.moveTo(x,fy-H*.02);g.lineTo(x-W*.03+k*W*.01,fy+H*.01);g.lineTo(x-W*.02+k*W*.01,fy+H*.01);g.fill();}}
     g.fillStyle='#22305e';g.fillRect(W*.46,fy,W*.08,H);for(let i=0;i<30;i++){g.fillStyle=['#ff5a7a','#ffd24a','#5ad0ff','#7ee08a'][i%4];g.globalAlpha=.5+.5*Math.abs(Math.sin(t*2+i));g.fillRect((i*29%100)/100*W,fy-H*.004,3,3);}g.globalAlpha=1;}
    /* la nacelle : ses barreaux et la barre de sécurité, devant nous */
    for(const x of [0,W-W*.05])colonne(g,x,0,H,W*.05,'#d8322a');
    {const y0=H*.84;g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,y0-H*.01,W,H*.01);g.fillStyle='#c8262c';g.fillRect(0,y0,W,H-y0);const q=g.createLinearGradient(0,y0,0,H);q.addColorStop(0,'rgba(255,255,255,.2)');q.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=q;g.fillRect(0,y0,W,H-y0);
     g.fillStyle=orV(g,y0-H*.02,y0+H*.01);arr(g,-4,y0-H*.02,W+8,H*.03,H*.012);g.fill();for(let i=0;i<16;i++)ampoule(g,W*.03+i*W*.063,y0+H*.035,W*.008,((i+Math.floor(t*4))%2)===0);
     for(let i=0;i<3;i++){g.strokeStyle='#e8b838';g.lineWidth=2;arr(g,W*.08+i*W*.29,y0+H*.06,W*.26,H*.08,8);g.stroke();}}
    /* les rayons de la roue qui passent devant */
    g.strokeStyle='rgba(220,226,240,.35)';g.lineWidth=W*.006;const ra=t*.25;for(let i=0;i<3;i++){const a=ra+i*2.1;g.beginPath();g.moveTo(W/2+Math.cos(a)*W*1.4,H*1.3+Math.sin(a)*W*1.4);g.lineTo(W/2,H*1.3);g.stroke();}
    if(S.flash>0){g.fillStyle='rgba(255,255,255,'+S.flash+')';g.fillRect(0,0,W,H);S.flash=Math.max(0,S.flash-dt*3);}
    const bp=RAC&&RAC.querySelector('[data-p]');if(bp&&!S.photo)bp.disabled=haut<.82;
    if(haut>.82&&!S.photo)msg('<b>Tout en haut !</b> Marseille est à toi.');
    if(k>=1&&!S.fini){S.fini=true;msg('Le tour est fini.'+(S.photo?'<small>Ta photo est gardée.</small>':''));const a2=actions('<div class="frg"><button class="fbt fb2" data-q>Descendre</button><button class="fbt" data-r>Un autre tour</button></div>');a2.querySelector('[data-q]').onclick=fermer;a2.querySelector('[data-r]').onclick=()=>{vib(8);roue();};}});}

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

window.ouvrirForain=function(k){ac();({chamboule,tir,peche,roue,lots:lotsGuichet}[k]||chamboule)();};
})();
