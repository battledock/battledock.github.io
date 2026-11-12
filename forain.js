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
const CSS=`#frn{position:fixed;inset:0;z-index:2147482000;display:flex;flex-direction:column;background:radial-gradient(90% 50% at 50% 20%,#3a2a8a,transparent 70%),linear-gradient(#1a1240,#0e0a26);color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
#frn *{box-sizing:border-box}
#frn .fh{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 8px}
#frn .fe{flex:1;min-width:0;position:relative;padding:5px 12px;border-radius:8px;background:#1f3a8a;box-shadow:inset 0 0 0 3px #ffd24a,0 0 18px rgba(255,210,74,.35);text-align:center}
#frn .fe b{display:block;font:900 17px/1.1 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#frn .fe small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;color:#ffd24a}
#frn .fe:before,#frn .fe:after{content:'';position:absolute;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#fff6c0;box-shadow:0 0 8px #ffd24a;animation:frnB 1s steps(2) infinite}#frn .fe:before{left:5px}#frn .fe:after{right:5px;animation-delay:.5s}@keyframes frnB{50%{opacity:.25}}
#frn .ftk{flex:none;display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:8px;background:#fff6dc;color:#8a1a2a;font:900 15px 'Baloo 2',system-ui,sans-serif;box-shadow:0 3px 0 #b89a6a;transform:rotate(-3deg)}
#frn .ftk i{font-style:normal;font-size:16px}
#frn .fx{flex:none;width:38px;height:38px;border-radius:50%;border:2px solid #ffd24a;background:rgba(10,8,30,.6);color:#ffd24a;font:900 17px 'Baloo 2',system-ui,sans-serif}
#frn .fsc{flex:1;min-height:0;position:relative;margin:0 10px;border-radius:14px;overflow:hidden;box-shadow:0 0 0 3px #ffd24a,0 0 0 6px #e8302a,0 8px 26px rgba(0,0,0,.5)}
#frn .fsc canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#frn .fbas{flex:none;display:flex;flex-direction:column;gap:8px;padding:12px 12px calc(14px + env(safe-area-inset-bottom))}
#frn .fmsg{min-height:22px;text-align:center;font:800 15px/1.25 'Baloo 2',system-ui,sans-serif;color:#ffe9a8}
#frn .fmsg small{display:block;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#b8a8ff}
#frn .fbt{border:0;border-radius:14px;padding:14px;font:900 18px 'Baloo 2',system-ui,sans-serif;color:#2a1600;background:linear-gradient(#fff2a8,#ffc93a 60%,#f0a020);box-shadow:0 5px 0 #a86a10}
#frn .fbt:active{transform:translateY(3px);box-shadow:0 2px 0 #a86a10}#frn .fbt.fb2{background:rgba(255,255,255,.12);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}#frn .fbt:disabled{opacity:.5}
#frn .frg{display:flex;gap:8px}#frn .frg .fbt{flex:1}
#frn .fpop{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.3);font:900 40px/1 'Baloo 2',system-ui,sans-serif;color:#ffd24a;text-shadow:0 4px 0 #6a1a00,0 0 26px rgba(255,200,60,.7);opacity:0;pointer-events:none;white-space:nowrap;animation:frnP 1.4s forwards;z-index:5}
@keyframes frnP{15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%) scale(1)}}
#frn .flots{flex:1;min-height:0;overflow-y:auto;margin:0 10px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;align-content:start;padding:4px 2px 10px}
#frn .flot{position:relative;border:0;border-radius:14px;padding:10px 8px 10px;text-align:center;color:#2a1600;background:linear-gradient(#fffaf0,#f2e6cc);box-shadow:0 4px 0 #b89a6a;font-family:inherit}
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
function ampoule(g,x,y,r,on,c){if(on){g.fillStyle='rgba(255,230,150,.3)';g.beginPath();g.arc(x,y,r*2.6,0,7);g.fill();}g.fillStyle=on?(c||'#fff6c0'):'#7a5a30';g.beginPath();g.arc(x,y,r,0,7);g.fill();}
function cadreBaraque(g,W,H,t,c1,c2){
  /* le fond de toile rayée */
  const n=12,bw=W/n;for(let i=0;i<n;i++){g.fillStyle=i%2?c1:c2;g.fillRect(i*bw,0,bw+1,H);}
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,0,W,H);
  const ombre=g.createRadialGradient(W/2,H*.45,W*.1,W/2,H*.45,W*.8);ombre.addColorStop(0,'rgba(255,220,150,.18)');ombre.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=ombre;g.fillRect(0,0,W,H);
  /* l'auvent festonné en haut */
  const ah=H*.07;for(let i=0;i<n;i++){g.fillStyle=i%2?c1:c2;g.fillRect(i*bw,0,bw+1,ah);g.beginPath();g.arc(i*bw+bw/2,ah,bw/2,0,Math.PI);g.fill();}
  for(let i=0;i<=n*2;i++)ampoule(g,i*W/(n*2),ah*.45,W*.008,((i+Math.floor(t*5))%3)===0);}

/* =====================================================================
   1. LE CHAMBOULE-TOUT : dix boîtes en pyramide, trois balles.
      On lance d'un geste vers le haut : la direction vise, la vitesse
      du geste donne la hauteur. Les boîtes touchées s'envolent ; celles
      du dessus, privées d'appui, dégringolent.
   ===================================================================== */
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
    g.fillStyle='#6a3a1a';g.fillRect(W*.12,sy,W*.76,u*.32);g.fillStyle='#8a5a2a';g.fillRect(W*.12,sy,W*.76,u*.1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(W*.12,sy+u*.32,W*.76,u*.18);
    for(const x of [W*.16,W*.84]){g.fillStyle='#5a2a10';g.fillRect(x-u*.12,sy,u*.24,H*.3);}
    /* les boîtes */
    for(const b of B){if(b.parti)continue;let bx=sx+b.x*bw,by=sy-b.y*bh;
      if(b.tombe){b.vy+=u*2.4*dt;b.ox=(b.ox||0)+b.vx*dt*8;b.oy=(b.oy||0)+b.vy*dt*8;b.rot+=b.vr;bx+=b.ox;by+=b.oy;if(by>H+bh*2)b.parti=true;}
      g.save();g.translate(bx,by-bh/2);g.rotate(b.rot);const w=bw*.86,h=bh*.94;
      g.fillStyle=b.c;g.fillRect(-w/2,-h/2,w,h);g.fillStyle='rgba(255,255,255,.85)';g.fillRect(-w/2,-h/2,w,h*.12);g.fillRect(-w/2,h/2-h*.12,w,h*.12);
      g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-w/2+w*.12,-h/2,w*.12,h);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(w/2-w*.18,-h/2,w*.18,h);
      g.fillStyle='#fff';g.font='900 '+Math.round(h*.3)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('★',0,0);g.restore();}
    /* le comptoir, et les balles qui restent */
    const cy=H*.84;g.fillStyle='#8a1a2a';g.fillRect(0,cy,W,H-cy);g.fillStyle='#ffd24a';g.fillRect(0,cy,W,u*.14);for(let x=0;x<W;x+=u*1.2){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x,cy+u*.3,u*.6,H);}
    for(let i=0;i<S.balles-(S.vol?0:1);i++){g.fillStyle='#f2f2f2';g.beginPath();g.arc(W*.12+i*u*.9,cy+u*.55,u*.32,0,7);g.fill();g.fillStyle='#e8302a';g.fillRect(W*.12+i*u*.9-u*.32,cy+u*.5,u*.64,u*.1);}
    /* la balle prête à partir, sous le doigt */
    if(!S.vol&&!S.fin&&S.balles>0){const bx=W*.5,by=H*.92;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(bx,by+u*.4,u*.5,u*.15,0,0,7);g.fill();g.fillStyle='#f6f6f6';g.beginPath();g.arc(bx,by,u*.42,0,7);g.fill();g.fillStyle='#e8302a';g.fillRect(bx-u*.42,by-u*.06,u*.84,u*.12);
      g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(bx-u*.14,by-u*.16,u*.1,0,7);g.fill();
      if(!S.traine){const a=.4+.4*Math.sin(t*5);g.strokeStyle='rgba(255,233,168,'+a+')';g.lineWidth=u*.08;g.beginPath();g.moveTo(bx,by-u*.8);g.lineTo(bx,by-u*1.6);g.moveTo(bx-u*.25,by-u*1.35);g.lineTo(bx,by-u*1.6);g.lineTo(bx+u*.25,by-u*1.35);g.stroke();}}
    if(S.traine){const [a,b]=S.traine;g.strokeStyle='rgba(255,233,168,.6)';g.lineWidth=u*.1;g.setLineDash([u*.2,u*.2]);g.beginPath();g.moveTo(a[0]*W,a[1]*H);g.lineTo(b[0]*W,b[1]*H);g.stroke();g.setLineDash([]);}
    /* la balle en vol : elle rapetisse en s'éloignant, sur une belle courbe */
    if(S.vol){const V=S.vol;V.t+=dt;const k=Math.min(1,V.t/V.T),x=(V.x0+(V.tx-V.x0)*k)*W,y=(.92+(V.ty-.92)*k)*H-Math.sin(k*Math.PI)*V.h*H,r=u*(.42-.24*k);
      g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,(.92+(V.ty-.92)*k)*H+u*.3,r,r*.3,0,0,7);g.fill();
      g.fillStyle='#f6f6f6';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#e8302a';g.fillRect(x-r,y-r*.15,r*2,r*.3);
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
    g.fillStyle='#14204a';g.fillRect(W*.04,H*.14,W*.92,H*.64);for(let i=0;i<40;i++){g.fillStyle='rgba(255,240,180,'+(.3+.5*Math.abs(Math.sin(t*1.5+i)))+')';g.fillRect((i*97%100)/100*W*.9+W*.05,(i*53%100)/100*H*.6+H*.15,2,2);}
    /* les rails et les canards */
    for(let r=0;r<3;r++){const y=H*(.3+r*.18);g.fillStyle='#6a5a4a';g.fillRect(W*.04,y+H*.005,W*.92,H*.012);g.fillStyle='#3a2a20';g.fillRect(W*.04,y+H*.017,W*.92,H*.006);}
    g.save();g.beginPath();g.rect(W*.04,H*.14,W*.92,H*.64);g.clip();
    for(const c of S.C){const [x,y]=pos(c,W,H),s=H*.06,dir=[1,-1,1][c.r];const k=c.abat?Math.min(1,c.abat):0;if(c.abat)c.abat=Math.min(1,c.abat+dt*6);
      g.save();g.translate(x,y);g.scale(dir,1-k*.85);const col=c.dore?'#f5c430':c.coul==='jaune'?'#ffd24a':'#f4f4f4',ombre=c.dore?'#b8860b':c.coul==='jaune'?'#d8a020':'#c8c8d0';
      g.fillStyle=col;g.beginPath();g.ellipse(0,-s*.35,s*.75,s*.42,0,0,7);g.fill();g.beginPath();g.arc(s*.5,-s*.95,s*.32,0,7);g.fill();
      g.fillStyle=ombre;g.beginPath();g.ellipse(-s*.1,-s*.25,s*.42,s*.2,0,0,7);g.fill();
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
    const cy=H*.82;g.fillStyle='#8a1a2a';g.fillRect(0,cy,W,H-cy);g.fillStyle='#ffd24a';g.fillRect(0,cy,W,H*.012);
    const gx=W*.5+(S.vise[0]-.5)*W*.25,gy=H*1.02+S.recul*H*.02,a=Math.atan2(S.vise[1]*H-gy,S.vise[0]*W-gx);S.recul=Math.max(0,S.recul-dt*8);
    g.save();g.translate(gx,gy);g.rotate(a);g.fillStyle='#7a4a22';g.beginPath();g.moveTo(-H*.06,-H*.03);g.lineTo(H*.12,-H*.022);g.lineTo(H*.12,H*.022);g.lineTo(-H*.06,H*.045);g.closePath();g.fill();g.fillStyle='#a86a3a';g.fillRect(-H*.05,-H*.026,H*.16,H*.01);g.fillStyle='#2a2a30';g.fillRect(H*.11,-H*.013,H*.24,H*.026);g.fillStyle='#5a5a66';g.fillRect(H*.11,-H*.013,H*.24,H*.007);g.fillStyle='#1a1a20';g.fillRect(H*.33,-H*.02,H*.02,H*.01);g.restore();
    /* le viseur */
    const vx=S.vise[0]*W,vy=S.vise[1]*H,r=H*.035;g.strokeStyle='rgba(255,80,60,.9)';g.lineWidth=2;g.beginPath();g.arc(vx,vy,r,0,7);g.moveTo(vx-r*1.5,vy);g.lineTo(vx-r*.5,vy);g.moveTo(vx+r*.5,vy);g.lineTo(vx+r*1.5,vy);g.moveTo(vx,vy-r*1.5);g.lineTo(vx,vy-r*.5);g.moveTo(vx,vy+r*.5);g.lineTo(vx,vy+r*1.5);g.stroke();
    /* le tableau : plombs, temps, points */
    g.fillStyle='rgba(10,8,30,.82)';g.fillRect(W*.04,H*.885,W*.92,H*.08);g.textBaseline='middle';g.font='900 '+Math.round(H*.035)+'px "Baloo 2",sans-serif';
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
    g.fillStyle='#e8302a';g.beginPath();g.ellipse(cx,cy+H*.02,rx+W*.1,ry+H*.08,0,0,7);g.fill();g.fillStyle='#ffd24a';g.beginPath();g.ellipse(cx,cy,rx+W*.09,ry+H*.07,0,0,7);g.fill();
    const eau=g.createLinearGradient(0,cy-ry,0,cy+ry);eau.addColorStop(0,'#3ac0f0');eau.addColorStop(1,'#1a6aa8');g.fillStyle=eau;g.beginPath();g.ellipse(cx,cy,rx+W*.06,ry+H*.05,0,0,7);g.fill();
    g.fillStyle='#2a8ac0';g.beginPath();g.ellipse(cx,cy,rx-W*.08,ry-H*.07,0,0,7);g.fill();g.fillStyle='#ffd24a';g.beginPath();g.ellipse(cx,cy,rx-W*.1,ry-H*.085,0,0,7);g.fill();g.fillStyle='#e8302a';g.beginPath();g.ellipse(cx,cy,rx-W*.12,ry-H*.1,0,0,7);g.fill();
    /* au milieu, un petit chapiteau rayé et son fanion */
    {const rr=Math.min(rx-W*.14,(ry-H*.11)*1.6),tb=cy+H*.03;for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#2ab0a0';g.beginPath();g.moveTo(cx,cy-rr*.9);g.lineTo(cx-rr+i*rr/4,tb);g.lineTo(cx-rr+(i+1)*rr/4,tb);g.closePath();g.fill();}
     g.fillStyle='#ffd24a';g.fillRect(cx-rr,tb-2,rr*2,6);for(let i=0;i<9;i++)ampoule(g,cx-rr+i*rr/4,tb+1,W*.007,((i+Math.floor(t*5))%3)===0);
     g.fillStyle='#c8ccd8';g.fillRect(cx-1,cy-rr*.9-H*.05,2,H*.05);g.fillStyle='#e8302a';g.beginPath();g.moveTo(cx+1,cy-rr*.9-H*.05);g.lineTo(cx+W*.05,cy-rr*.9-H*.04);g.lineTo(cx+1,cy-rr*.9-H*.03);g.fill();
     g.fillStyle='#fff';g.font='900 '+Math.round(H*.026)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('1 · 2 · 3 · 5 · 10',cx,tb+H*.04);}
    for(let i=0;i<30;i++){const a=i/30*6.28+t*.3,x=cx+Math.cos(a)*(rx-W*.01),y=cy+Math.sin(a)*(ry-H*.01);g.fillStyle='rgba(255,255,255,'+(.2+.3*Math.sin(t*3+i))+')';g.fillRect(x,y,W*.02,2);}
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
function canard(g,x,y,s,c,dir){g.save();g.translate(x,y);g.scale(dir,1);g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,s*.3,s*.9,s*.25,0,0,7);g.fill();
  g.fillStyle=c;g.beginPath();g.ellipse(0,0,s*.85,s*.5,0,0,7);g.fill();g.beginPath();g.arc(s*.55,-s*.55,s*.38,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-s*.2,-s*.18,s*.4,s*.14,0,0,7);g.fill();
  g.fillStyle='#ff7a2a';g.beginPath();g.ellipse(s*.98,-s*.5,s*.22,s*.1,0,0,7);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(s*.65,-s*.65,s*.07,0,7);g.fill();
  g.fillStyle='#c8ccd8';g.fillRect(-s*.05,-s*.98,s*.1,s*.25);g.beginPath();g.arc(0,-s*1.02,s*.1,0,7);g.fill();g.restore();}

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
    /* la mer et ses reflets */
    const m=g.createLinearGradient(0,hy,0,H);m.addColorStop(0,'#1a2a6a');m.addColorStop(1,'#0a1030');g.fillStyle=m;g.fillRect(0,hy,W,H-hy);
    for(let i=0;i<120;i++){g.fillStyle='rgba(255,210,140,'+(hasard()*.4)+')';g.fillRect(hasard()*W,hy+hasard()*(H-hy),2+hasard()*10,1);}
    /* la colline de Notre-Dame */
    g.fillStyle='#1a1438';g.beginPath();g.moveTo(0,hy);for(let x=0;x<=W;x+=W/60)g.lineTo(x,hy-H*.04-Math.max(0,H*.2-Math.abs(x-W*.72)*.9));g.lineTo(W,hy);g.closePath();g.fill();
    const nx=W*.72,ny=hy-H*.23,u=H*.0065;g.fillStyle='#e8d8b0';g.fillRect(nx-u*5,ny,u*10,u*6);g.fillRect(nx-u*2,ny-u*7,u*4,u*8);g.fillRect(nx-u*1.2,ny-u*11,u*2.4,u*4);
    g.fillStyle='rgba(255,220,140,.22)';g.beginPath();g.arc(nx,ny-u*2,u*9,0,7);g.fill();g.fillStyle='#ffd24a';g.fillRect(nx-u*.5,ny-u*14,u,u*3);
    /* la ville : des immeubles et des milliers de fenêtres */
    for(let i=0;i<90;i++){const x=hasard()*W,w=W*(.02+hasard()*.04),h=H*(.03+hasard()*.12);if(Math.abs(x-nx)<W*.08)continue;g.fillStyle=['#221a44','#2a2050','#1e1840'][i%3];g.fillRect(x,hy-h,w,h);
      for(let k=0;k<12;k++)if(hasard()<.45){g.fillStyle=hasard()<.8?'#ffd27a':'#9ad0ff';g.fillRect(x+hasard()*(w-3),hy-h+hasard()*(h-3),2,2);}}
    /* le Vieux-Port, ses mâts et ses lumières */
    g.fillStyle='#2a3a7a';g.fillRect(W*.22,hy,W*.26,H*.05);for(let i=0;i<26;i++){const x=W*.23+i*W*.01;g.fillStyle='#c8ccd8';g.fillRect(x,hy-H*.03,1,H*.035);g.fillStyle='#ffd27a';g.fillRect(x,hy+H*.004,2,2);}
    /* la cathédrale de la Major, le fort */
    g.fillStyle='#2e2450';const mx=W*.1;g.fillRect(mx,hy-H*.07,W*.06,H*.07);g.beginPath();g.arc(mx+W*.03,hy-H*.07,W*.02,Math.PI,0);g.fill();g.fillStyle='rgba(255,230,180,.6)';g.fillRect(mx+W*.028,hy-H*.1,2,H*.02);
    VILLE=c;}
  boucle((dt,t)=>{const {W,H}=taille(),g=G;if(!VILLE||VILLE.width!==W)ville(W,H);S.t+=dt;
    const k=Math.min(1,S.t/S.D),haut=Math.sin(k*Math.PI);  /* 0 en bas, 1 au sommet */
    /* le ciel */
    const ci=g.createLinearGradient(0,0,0,H);ci.addColorStop(0,'#0e1440');ci.addColorStop(.5,'#3a2a7a');ci.addColorStop(.8,'#c25a7a');ci.addColorStop(1,'#ff9a6a');g.fillStyle=ci;g.fillRect(0,0,W,H);
    for(let i=0;i<80;i++){g.fillStyle='rgba(255,255,255,'+(.3+.4*Math.abs(Math.sin(t+i)))+')';g.fillRect((i*73%100)/100*W,(i*37%100)/100*H*.5,2,2);}
    g.fillStyle='#fff4d8';g.beginPath();g.arc(W*.2,H*.16,H*.04,0,7);g.fill();
    /* la ville : plus on monte, plus on la voit d'en haut */
    const dy=(1-haut)*H*.42;g.drawImage(VILLE,0,dy);
    /* la foire en bas, avec ses lumières, qui s'éloigne */
    g.fillStyle='#14102a';g.fillRect(0,H*.9+dy*.4,W,H);for(let i=0;i<40;i++){g.fillStyle=['#ff5a7a','#ffd24a','#5ad0ff','#7ee08a'][i%4];g.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i));g.fillRect((i*29%100)/100*W,H*.92+dy*.4+(i%3)*4,3,3);}g.globalAlpha=1;
    /* la nacelle : ses barreaux et la barre de sécurité, devant nous */
    g.strokeStyle='#c8ccd8';g.lineWidth=W*.012;for(const x of [W*.06,W*.94]){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
    g.strokeStyle='#e8302a';g.lineWidth=W*.03;g.beginPath();g.moveTo(0,H*.86);g.lineTo(W,H*.86);g.stroke();g.fillStyle='#b8202a';g.fillRect(0,H*.88,W,H*.12);
    g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,H*.845,W,H*.008);
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
