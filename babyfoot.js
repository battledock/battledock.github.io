/* =====================================================================
   LE BABY-FOOT DU COMPLEXE — Les Citrouilles contre Les Squelettes

   Quatre barres de chaque côté, comme sur une vraie table : gardien,
   défense (2), demis (5), attaque (3). On glisse le doigt de gauche à
   droite : TOUTES tes barres suivent, chacune avance le joueur le plus
   proche sous ton doigt. On touche, ou on balaie vers le haut, pour
   frapper : plus le geste est vif, plus la frappe est sèche.

   Ce qui fait le plaisir : la balle file vite et rebondit franchement,
   le pied part vraiment en avant, un but ralentit le temps une demi-
   seconde, secoue la table et fait hurler la salle.
   Rien ne se gagne ici en euros : c'est pour le jeu.
   ===================================================================== */
(function(){
'use strict';
const TW=100, TH=170, GW=36, FR=3.8, BR=2.8, VMAX=360, GAGNE=5;
const NIV={facile:{v:70,err:8,react:.26,frappe:.55,nom:'Facile'},moyen:{v:110,err:4.5,react:.16,frappe:.8,nom:'Moyen'},
           fort:{v:160,err:2,react:.09,frappe:1,nom:'Fort'}};
/* les barres, du but adverse (en haut) jusqu'au tien (en bas) */
const BARRES=[
 {y:10, c:'O',n:1,sp:0, lim:12},
 {y:31, c:'O',n:2,sp:38},
 {y:53, c:'P',n:3,sp:30},
 {y:75, c:'O',n:5,sp:17},
 {y:95, c:'P',n:5,sp:17},
 {y:117,c:'O',n:3,sp:30},
 {y:139,c:'P',n:2,sp:38},
 {y:160,c:'P',n:1,sp:0, lim:12}];
BARRES.forEach(b=>{b.base=[];for(let k=0;k<b.n;k++)b.base.push(TW/2+b.sp*(k-(b.n-1)/2));
  const mn=Math.min(...b.base), mx=Math.max(...b.base);
  b.omin=b.lim?-b.lim:FR+2-mn; b.omax=b.lim?b.lim:TW-FR-2-mx; b.off=0; b.v=0; b.k=-1; b.pow=0; b.dir=b.c==='P'?-1:1;
  b.nom=['gardien','défense','attaque','demis','demis','attaque','défense','gardien'][BARRES.indexOf(b)];});

let el,cv,g,OPT,actif=false,raf=0,S=null,ECH=1,OX=0,OY=0;
let doigt=null, geste=null;
/* ---------------- le son ---------------- */
let AC=null;
const A=()=>{try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}catch(x){return null;}};
function bip(f,d,v,t){const a=A();if(!a)return;try{const o=a.createOscillator(),gn=a.createGain();o.type=t||'square';o.frequency.value=f;
  gn.gain.value=v||.05;gn.gain.exponentialRampToValueAtTime(.0001,a.currentTime+(d||.08));o.connect(gn);gn.connect(a.destination);o.start();o.stop(a.currentTime+(d||.08));}catch(x){}}
function bruit(d,f,v,q){const a=A();if(!a)return;try{const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);
  for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.5);const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q||1;
  const gn=a.createGain();gn.gain.value=v;s.connect(fl);fl.connect(gn);gn.connect(a.destination);s.start();}catch(x){}}
const sonFrappe=(p)=>{bruit(.06,1800,.25+p*.3,2);bip(110,.07,.08,'sine');};
const sonBande=()=>bruit(.03,3000,.12,3);
const sonBut=(moi)=>{bruit(1.6,700,.5,.6);bip(moi?523:196,.25,.07,'sawtooth');setTimeout(()=>bip(moi?784:147,.35,.07,'sawtooth'),180);};
const vib=(n)=>{try{navigator.vibrate&&navigator.vibrate(n);}catch(x){}};

/* ---------------- l'habillage ---------------- */
const CSS=`#bf{position:fixed;inset:0;z-index:20;background:radial-gradient(90% 70% at 50% 40%,#1e1030,#07040c);display:flex;flex-direction:column;
 font-family:'Baloo 2','Trebuchet MS',system-ui,sans-serif;color:#f4ecd8;touch-action:none;-webkit-user-select:none;user-select:none}
#bf[hidden]{display:none}
#bf .hd{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 4px}
#bf .sc{flex:1;display:flex;align-items:center;justify-content:center;gap:14px}
#bf .eq{display:flex;flex-direction:column;align-items:center;min-width:0}#bf .eq small{font:800 10px 'Baloo 2',sans-serif;letter-spacing:1.5px;opacity:.8;white-space:nowrap}
#bf .eq b{font:800 34px 'Baloo 2',sans-serif;line-height:1}#bf .eq.p b{color:#ff9a2a;text-shadow:0 0 14px rgba(255,140,30,.7)}#bf .eq.o b{color:#e8ecff;text-shadow:0 0 14px rgba(200,210,255,.6)}
#bf .sc i{font-style:normal;font:800 18px 'Baloo 2';opacity:.5}
#bf .x{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,154,42,.5);background:rgba(30,16,40,.85);color:#ff9a2a;font:800 17px 'Baloo 2'}
#bf canvas{flex:1;min-height:0;width:100%;display:block}
#bf .ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,3,12,.74);backdrop-filter:blur(3px)}
#bf .ov[hidden]{display:none}#bf .bx{width:100%;max-width:370px;text-align:center}
#bf .bx h2{margin:0;font:800 32px 'Baloo 2';letter-spacing:1px;color:#fff;text-shadow:0 0 14px #ff8a1a,0 0 30px #8a3ac8}
#bf .bx p{margin:4px 0 12px;font:700 14px 'Baloo 2';color:#c8b8d8;line-height:1.35}
#bf .vs{display:flex;justify-content:center;align-items:center;gap:12px;margin:8px 0 6px;font:800 14px 'Baloo 2'}#bf .vs span{padding:4px 10px;border-radius:10px}
#bf .lb{font:800 11px 'Baloo 2';letter-spacing:2px;color:#9a88b0;margin:12px 0 6px;text-align:left}
#bf .niv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#bf button.b{-webkit-appearance:none;appearance:none;border:1px solid rgba(255,154,42,.35);border-radius:14px;background:rgba(40,20,50,.9);color:#f4ecd8;padding:11px 4px;font:800 15px 'Baloo 2'}
#bf button.b.on{border-color:#ff9a2a;box-shadow:0 0 14px rgba(255,154,42,.45)}
#bf button.go{display:block;width:100%;margin-top:12px;border:0;border-radius:16px;padding:13px;font:800 18px 'Baloo 2';color:#2a1004;background:linear-gradient(#ffb04a,#e8761e);box-shadow:0 4px 0 #8a3a0a}
#bf button.go.gris{background:rgba(40,20,50,.9);color:#f4ecd8;box-shadow:none;border:1px solid rgba(255,154,42,.35)}
#bf button.go:active{transform:translateY(3px);box-shadow:0 1px 0 #8a3a0a}
#bf .aide{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}#bf .aide div{border-radius:12px;background:rgba(255,255,255,.06);padding:8px;font:700 12px 'Baloo 2';color:#d8c8e8;line-height:1.25}
#bf .aide b{display:block;font-size:20px}`;

function monter(){
  if(el)return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  el=document.createElement('div');el.id='bf';el.hidden=true;
  el.innerHTML='<div class="hd"><div class="sc"><div class="eq o"><small>SQUELETTES</small><b id="bfS2">0</b></div><i>–</i><div class="eq p"><small>CITROUILLES</small><b id="bfS1">0</b></div></div>'+
    '<button class="x" id="bfX" aria-label="Quitter">✕</button></div><canvas id="bfCv"></canvas><div class="ov" id="bfOv"></div>';
  document.body.appendChild(el);
  cv=el.querySelector('#bfCv');g=cv.getContext('2d');
  el.querySelector('#bfX').onclick=()=>{if(S&&S.phase==='jeu'&&!confirmer())return;fermer();};
  const pos=(ev)=>{const r=cv.getBoundingClientRect(),d=cv.width/r.width;return {x:((ev.clientX-r.left)*d-OX)/ECH,y:((ev.clientY-r.top)*d-OY)/ECH,px:ev.clientX,py:ev.clientY,t:performance.now()};};
  cv.addEventListener('pointerdown',ev=>{ev.preventDefault();try{cv.setPointerCapture(ev.pointerId);}catch(x){}
    const p=pos(ev);doigt=p;geste={t0:p.t,x0:p.px,y0:p.py,hist:[p]};A();});
  cv.addEventListener('pointermove',ev=>{if(!geste)return;const p=pos(ev);doigt=p;geste.hist.push(p);if(geste.hist.length>8)geste.hist.shift();
    /* un balayage vers le haut en cours de geste frappe tout de suite */
    const h=geste.hist,a=h[0],b=h[h.length-1],dt=Math.max(1,b.t-a.t),vy=(a.py-b.py)/dt;
    if(vy>0.9&&!geste.frappe){geste.frappe=true;frapper(Math.min(1,0.55+vy*0.25),(b.px-a.px)/dt);}});
  cv.addEventListener('pointerup',ev=>{if(!geste)return;const p=pos(ev);const dt=p.t-geste.t0,dd=Math.hypot(p.px-geste.x0,p.py-geste.y0);
    if(!geste.frappe&&dt<230&&dd<14)frapper(0.75);
    else if(!geste.frappe){const h=geste.hist,a=h[0],dtt=Math.max(1,p.t-a.t),vy=(a.py-p.py)/dtt;if(vy>0.5)frapper(Math.min(1,0.5+vy*0.3),(p.px-a.px)/dtt);}
    geste=null;});
  cv.addEventListener('pointercancel',()=>{geste=null;});
  addEventListener('resize',()=>{if(actif)cadrer();});
}
let arme=0;function confirmer(){const t=Date.now();if(t-arme<2500)return true;arme=t;pop('Touche ✕ encore pour quitter',1.6,'#fff');return false;}
function cadrer(){const r=cv.getBoundingClientRect(),d=Math.min(2.5,devicePixelRatio||1);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);
  const m=16*d;ECH=Math.min((cv.width-2*m)/(TW+14),(cv.height-2*m)/(TH+16));OX=(cv.width-TW*ECH)/2;OY=(cv.height-TH*ECH)/2;}

/* ---------------- la partie ---------------- */
function nouvelle(niv){
  S={niv:niv,s1:0,s2:0,phase:'pret',b:{x:TW/2,y:TH/2,vx:0,vy:0,z:0},tr:[],parts:[],pops:[],ralenti:0,secousse:0,flash:0,
     cd:0,lent:0,dernier:null,ai:{t:0},stats:{tirs:0}};
  BARRES.forEach(b=>{b.off=0;b.v=0;b.k=-1;});maj();
}
function maj(){el.querySelector('#bfS1').textContent=S.s1;el.querySelector('#bfS2').textContent=S.s2;}
/* L'ENGAGEMENT : la balle tombe au milieu, comme jetée par la trappe */
function engager(){const b=S.b;b.x=TW/2+(Math.random()-.5)*20;b.y=TH/2;b.vx=(Math.random()<.5?-1:1)*(30+Math.random()*30);b.vy=(Math.random()-.5)*30;b.z=14;
  S.tr=[];S.phase='cd';S.cd=1.3;S.lent=0;S.dernier=null;}
function frapper(p,vise){if(!S||S.phase!=='jeu')return;let touche=false;vise=Math.max(-1.5,Math.min(1.5,vise||0));
  if(geste&&performance.now()-geste.t0>500)p=Math.min(1.4,p+0.45);   /* le doigt posé longtemps : frappe chargée */
  BARRES.forEach(b=>{if(b.c!=='P')return;if(b.k<0||b.k>0.7){b.k=0;b.pow=p;b.vise=vise;}
    if(Math.abs(b.y-S.b.y)<14)touche=true;});
  if(touche)vib(10);}
const fx=(b,k)=>b.base[k]+b.off;
/* une barre suit une cible : elle avance le joueur le plus proche dessous */
function suivre(b,tx,v,dt){let best=0,bd=1e9;for(let k=0;k<b.n;k++){const d=Math.abs(b.base[k]+b.off-tx);if(d<bd){bd=d;best=k;}}
  let cible=Math.max(b.omin,Math.min(b.omax,tx-b.base[best]));const o=b.off,d=cible-o,pas=v*dt;
  b.off=Math.abs(d)<=pas?cible:o+Math.sign(d)*pas;b.v=(b.off-o)/Math.max(dt,1e-3);}
function ia(dt,cote){cote=cote||'O';const N=NIV[cote==='O'?S.niv:(window.__BF_AUTO||'moyen')],B=S.b;S.ai.t-=dt/(cote==='O'?1:1e9);
  if(S.ai.t<=0){S.ai.t=N.react;S.ai.err=(Math.random()-.5)*2*N.err;S.ai.bx=B.x;S.ai.by=B.y;S.ai.vx=B.vx;S.ai.vy=B.vy;}
  const V={x:S.ai.bx??B.x,y:S.ai.by??B.y,vx:S.ai.vx??B.vx,vy:S.ai.vy??B.vy};
  BARRES.forEach(b=>{if(b.c!==cote)return;
    /* où sera la balle quand elle arrivera sur cette barre */
    let tx=V.x;if(Math.abs(V.vy)>20){const t=(b.y-V.y)/V.vy;if(t>0&&t<0.6){tx=V.x+V.vx*t;for(let i=0;i<3;i++){if(tx<BR)tx=2*BR-tx;if(tx>TW-BR)tx=2*(TW-BR)-tx;}}}
    if(b.n===1)tx=TW/2+(tx-TW/2)*0.9;
    suivre(b,tx+S.ai.err,N.v,dt);
    /* frapper quand la balle est juste devant un pied */
    if(b.k<0&&Math.abs(B.y-b.y)<12){for(let k=0;k<b.n;k++)if(Math.abs(fx(b,k)-B.x)<6){if(Math.random()<N.frappe*dt*14){b.k=0;b.pow=0.6+Math.random()*0.4*N.frappe;b.vise=(Math.random()-.5)*2*N.frappe;}break;}}});
}
/* LE PIED : il part en avant en 0,07 s, revient en 0,12 s */
/* LE PIED BALAIE : il part de derrière la barre et file vers l'avant, comme
   quand on fait tourner la poignée. Une balle derrière le joueur est donc
   frappée aussi — elle passe sous la barre. Puis le pied revient. */
function piedAvance(b){if(b.k<0)return 0;if(b.k<0.45)return -10+20*(b.k/0.45);return 10*(1-(b.k-0.45)/0.55);}
function chocs(){const B=S.b;
  for(const b of BARRES){const av=piedAvance(b),frappe=b.k>=0&&b.k<0.45;
    for(let k=0;k<b.n;k++){const x=fx(b,k);
      /* le corps */
      for(const [cy,r,pied] of [[b.y,FR,false],[b.y+b.dir*av,FR*1.05,true]]){
        if(pied&&b.k<0)continue;
        if(!pied&&frappe)continue;   /* le joueur tourne : la balle passe sous la barre */
        const dx=B.x-x,dy=B.y-cy,d=Math.hypot(dx,dy),R=r+BR;if(d>=R||d===0)continue;
        const nx=dx/d,ny=dy/d;B.x=x+nx*R;B.y=cy+ny*R;
        const vn=B.vx*nx+B.vy*ny;if(vn<0){B.vx-=1.55*vn*nx;B.vy-=1.55*vn*ny;}
        B.vx+=b.v*0.55;
        if(pied&&frappe){const P=b.pow;B.vy=b.dir*(210+P*160);if(P>1.05){B.feu=1.6;pop('TIR DE LA MORT !',1,'#7aff7a',true);bruit(.4,400,.4,.8);}B.vx+=dx*14*(0.6+P*0.4)+b.v*0.3+(b.vise||0)*110;b.vise=0;S.dernier=b;S.stats.tirs++;
          sonFrappe(P);if(b.c==='P')vib(14);
          for(let i=0;i<6;i++)S.parts.push({x:B.x,y:B.y,vx:(Math.random()-.5)*60,vy:b.dir*Math.random()*60,v:.4,c:b.c==='P'?'#ffb04a':'#e8ecff'});}
        else if(Math.abs(vn)>60){sonBande();}
        if(b.nom==='gardien'&&Math.abs(vn)>200&&S.phase==='jeu')pop('ARRÊT !',1,b.c==='P'?'#ffb04a':'#e8ecff');
      }}}
  const vm=B.feu>0?VMAX*1.3:VMAX,v=Math.hypot(B.vx,B.vy);if(v>vm){B.vx*=vm/v;B.vy*=vm/v;}
}
function rouler(dt){const B=S.b,n=Math.max(1,Math.ceil(Math.hypot(B.vx,B.vy)*dt/1.5)),h=dt/n;
  for(let i=0;i<n;i++){B.x+=B.vx*h;B.y+=B.vy*h;
    if(B.x<BR){B.x=BR;B.vx=Math.abs(B.vx)*.85;if(Math.abs(B.vx)>40)sonBande();}
    if(B.x>TW-BR){B.x=TW-BR;B.vx=-Math.abs(B.vx)*.85;if(Math.abs(B.vx)>40)sonBande();}
    const bouche=Math.abs(B.x-TW/2)<GW/2-BR*0.4;
    if(B.y<BR){if(bouche){if(B.y<-BR*2)return 'P';}else{B.y=BR;B.vy=Math.abs(B.vy)*.85;if(Math.abs(B.vy)>40)sonBande();}}
    if(B.y>TH-BR){if(bouche){if(B.y>TH+BR*2)return 'O';}else{B.y=TH-BR;B.vy=-Math.abs(B.vy)*.85;if(Math.abs(B.vy)>40)sonBande();}}
    chocs();}
  const f=Math.exp(-0.45*dt);B.vx*=f;B.vy*=f;if(B.feu>0)B.feu-=dt;
  /* une balle morte hors de portée : la table la relance doucement */
  if(Math.hypot(B.vx,B.vy)<12){S.lent+=dt;if(S.lent>1.3){S.lent=0;B.vx=(B.x<TW/2?1:-1)*60;B.vy=(Math.random()-.5)*40;pop('Remise en jeu',.8,'#c8b8d8');}}else S.lent=0;
  return null;}
function but(qui){
  const d=S.dernier,moi=qui==='P';
  if(moi)S.s1++;else S.s2++;maj();
  S.ralenti=0.55;S.secousse=0.5;S.flash=1;sonBut(moi);vib(moi?[40,40,80]:[90]);
  const nom=d&&d.c===qui?({attaque:'Pissette !',demis:'Demi !',défense:'Depuis la défense !',gardien:'Du gardien !!'})[d.nom]:'Contre son camp !';
  pop(moi?'BUUUT !':'But des Squelettes',1.4,moi?'#ffb04a':'#e8ecff',true);
  if(nom)setTimeout(()=>pop(nom,1.1,'#d8a8ff'),350);
  for(let i=0;i<60;i++)S.parts.push({x:TW/2+(Math.random()-.5)*GW,y:moi?2:TH-2,vx:(Math.random()-.5)*220,vy:(moi?1:-1)*Math.random()*200,v:.9+Math.random()*.6,
    c:moi?['#ff8a1a','#ffd04a','#8a3ac8','#ffffff'][i%4]:['#e8ecff','#8a94a6','#5ae8ff'][i%3],grand:true});
  S.phase='but';S.cd=1.6;
  if(S.s1>=GAGNE||S.s2>=GAGNE){S.cd=1.8;S.finApres=true;}
}
function pop(t,d,c,gros){if(!S)return;S.pops.push({t,d,v:d,c,gros:!!gros});}

/* ---------------- le dessin ---------------- */
const T=x=>OX+x*ECH, U=y=>OY+y*ECH;
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function dessiner(tps){
  const e=ECH;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  if(S.secousse>0){const a=S.secousse*6*e/4;g.translate((Math.random()-.5)*a,(Math.random()-.5)*a);}
  /* le cadre en bois, et ses LED orange */
  const bw=7*e;rr(T(0)-bw,U(0)-bw,TW*e+bw*2,TH*e+bw*2,10*e/4);const bois=g.createLinearGradient(0,U(0),0,U(TH));bois.addColorStop(0,'#3a2216');bois.addColorStop(.5,'#5a341e');bois.addColorStop(1,'#3a2216');g.fillStyle=bois;g.fill();
  for(let i=0;i<14;i++){const on=(Math.floor(tps/180)+i)%3!==0;g.fillStyle=on?'#ff9a2a':'#5a2a10';
    g.fillRect(T(0)-bw*0.6,U(TH*i/14+5),bw*0.25,e*1.4);g.fillRect(T(TW)+bw*0.35,U(TH*i/14+5),bw*0.25,e*1.4);}
  /* le tapis vert, brumeux et violet sur les bords */
  const tp=g.createRadialGradient(T(TW/2),U(TH/2),10,T(TW/2),U(TH/2),TH*e*0.7);tp.addColorStop(0,'#2f7a3a');tp.addColorStop(1,'#163a20');
  g.fillStyle=tp;g.fillRect(T(0),U(0),TW*e,TH*e);
  for(let y=0;y<TH;y+=10){g.fillStyle=(y/10)%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.04)';g.fillRect(T(0),U(y),TW*e,10*e);}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(1,e*.6);
  g.strokeRect(T(1),U(1),(TW-2)*e,(TH-2)*e);g.beginPath();g.moveTo(T(0),U(TH/2));g.lineTo(T(TW),U(TH/2));g.stroke();
  g.beginPath();g.arc(T(TW/2),U(TH/2),13*e,0,7);g.stroke();
  g.strokeRect(T(TW/2-24),U(1),48*e,16*e);g.strokeRect(T(TW/2-24),U(TH-17),48*e,16*e);
  /* une citrouille au rond central, peinte sur le tapis */
  g.save();g.globalAlpha=.16;g.fillStyle='#ff8a1a';g.beginPath();g.ellipse(T(TW/2),U(TH/2),8*e,6.5*e,0,0,7);g.fill();g.restore();
  /* les buts */
  g.fillStyle='#050308';g.fillRect(T(TW/2-GW/2),U(-6),GW*e,6*e);g.fillRect(T(TW/2-GW/2),U(TH),GW*e,6*e);
  g.fillStyle='#e8ecff';g.fillRect(T(TW/2-GW/2),U(-1),GW*e,e);g.fillStyle='#ff9a2a';g.fillRect(T(TW/2-GW/2),U(TH),GW*e,e);
  if(S.flash>0){g.fillStyle='rgba(255,180,80,'+(S.flash*.3)+')';g.fillRect(T(0),U(0),TW*e,TH*e);}
  /* l'ombre des barres puis les barres */
  for(const b of BARRES){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(T(-7),U(b.y)+e*1.2,(TW+14)*e,e*1.6);}
  /* la balle et sa traînée (avant les joueurs : elle passe sous les barres) */
  const B=S.b;
  for(let i=0;i<S.tr.length;i++){const q=S.tr[i],a=i/S.tr.length;g.fillStyle=B.feu>0?'rgba(120,255,120,'+(a*.7)+')':'rgba(255,230,160,'+(a*.35)+')';g.beginPath();g.arc(T(q.x),U(q.y),BR*e*(.4+.6*a),0,7);g.fill();}
  const z=B.z||0;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(T(B.x)+e,U(B.y)+e*1.4,BR*e,BR*e*.8,0,0,7);g.fill();
  const bl=g.createRadialGradient(T(B.x)-BR*e*.4,U(B.y-z*.3)-BR*e*.4,0,T(B.x),U(B.y-z*.3),BR*e*(1+z/30));bl.addColorStop(0,'#ffffff');bl.addColorStop(.6,'#f0ead8');bl.addColorStop(1,'#a8a090');
  g.fillStyle=bl;g.beginPath();g.arc(T(B.x),U(B.y-z*.3),BR*e*(1+z/30),0,7);g.fill();
  if(Math.hypot(B.vx,B.vy)>220){g.save();g.shadowColor='#ffb04a';g.shadowBlur=12;g.strokeStyle='rgba(255,180,80,.8)';g.lineWidth=e*.6;g.beginPath();g.arc(T(B.x),U(B.y),BR*e*1.2,0,7);g.stroke();g.restore();}
  for(const b of BARRES)barre(b,tps);
  /* les étincelles et les confettis */
  for(const p of S.parts){g.fillStyle=p.c;g.globalAlpha=Math.max(0,Math.min(1,p.v*1.6));const s=(p.grand?1.4:.8)*e;g.fillRect(T(p.x)-s/2,U(p.y)-s/2,s,s);}g.globalAlpha=1;
  /* les annonces */
  let yy=TH*0.42;for(const p of S.pops){const a=Math.min(1,p.v/p.d*2.5),k=1+(1-p.v/p.d)*0.25;
    g.save();g.globalAlpha=a;g.translate(T(TW/2),U(yy));g.scale(k,k);g.font='800 '+(p.gros?15:9)*e+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.lineWidth=e*1.4;g.strokeStyle='rgba(20,8,30,.85)';g.strokeText(p.t,0,0);g.fillStyle=p.c;g.shadowColor=p.c;g.shadowBlur=14;g.fillText(p.t,0,0);g.restore();yy+=p.gros?22:13;}
  if(geste&&doigt&&S.phase==='jeu'){const ch=Math.min(1,(performance.now()-geste.t0-150)/350);if(ch>0){g.save();g.strokeStyle=ch>=1?'#7aff7a':'rgba(255,180,80,.8)';g.lineWidth=e*1.2;
    g.beginPath();g.arc(T(doigt.x),U(Math.min(TH-4,doigt.y)),7*e,-Math.PI/2,-Math.PI/2+ch*Math.PI*2);g.stroke();g.restore();}}
  if(S.phase==='cd'){const n=Math.ceil(S.cd/0.43);g.save();g.font='800 '+(28*e)+'px "Baloo 2",sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillStyle='#fff';g.shadowColor='#ff8a1a';g.shadowBlur=20;g.fillText(n>2?'3':n>1?'2':'1',T(TW/2),U(TH/2-24));g.restore();}
}
function barre(b,tps){const e=ECH,y=U(b.y),P=b.c==='P';
  /* la tige métallique, qui dépasse des deux bandes, et ses poignées */
  const tg=g.createLinearGradient(0,y-e*.9,0,y+e*.9);tg.addColorStop(0,'#f4f4f8');tg.addColorStop(.5,'#9aa0aa');tg.addColorStop(1,'#5a606a');
  g.fillStyle=tg;g.fillRect(T(-8),y-e*.8,(TW+16)*e,e*1.6);
  const px=(P?T(TW+7):T(-11))+b.off*e*0.4;g.fillStyle=P?'#e8761e':'#d8dce8';rr(px,y-e*1.8,4*e,e*3.6,e);g.fill();
  const av=piedAvance(b);
  for(let k=0;k<b.n;k++){const x=T(fx(b,k)),pied=y+b.dir*av*e;
    /* la jambe et le pied, quand il frappe */
    if(b.k>=0){g.fillStyle=P?'#3a2a4a':'#cfd4e0';g.fillRect(x-e*1,Math.min(y,pied),e*2,Math.abs(pied-y));
      g.fillStyle=P?'#1a1020':'#8a94a6';g.beginPath();g.ellipse(x,pied,e*2.4,e*1.6,0,0,7);g.fill();}
    /* les épaules */
    g.fillStyle=P?'#5a2a7a':'#2a2a34';rr(x-e*4.4,y-e*1.6,e*8.8,e*3.2,e*1.4);g.fill();
    /* la tête : citrouille ou crâne */
    if(P){g.fillStyle='#e8761e';g.beginPath();g.ellipse(x,y,e*3,e*2.6,0,0,7);g.fill();g.fillStyle='#c85a10';g.fillRect(x-e*.3,y-e*2.6,e*.6,e*5.2);
      g.fillStyle='#3a6a2a';g.fillRect(x-e*.5,y-e*3.4,e*1,e*1);g.fillStyle='#ffd84a';g.fillRect(x-e*1.6,y-e*.8,e*.9,e*.8);g.fillRect(x+e*.7,y-e*.8,e*.9,e*.8);g.fillRect(x-e*1.2,y+e*.8,e*2.4,e*.5);}
    else{g.fillStyle='#eceee6';g.beginPath();g.ellipse(x,y,e*2.6,e*2.6,0,0,7);g.fill();g.fillStyle='#1a1420';g.fillRect(x-e*1.5,y-e*.8,e*1,e*1);g.fillRect(x+e*.5,y-e*.8,e*1,e*1);g.fillRect(x-e*.3,y+e*.4,e*.6,e*.6);
      g.fillRect(x-e*1,y+e*1.4,e*2,e*.3);}
  }}

/* ---------------- la boucle ---------------- */
let tPrec=0;
function boucle(t){if(!actif)return;let dt=Math.min(.033,(t-tPrec)/1000||.016);tPrec=t;
  if(S){
    if(S.ralenti>0){S.ralenti-=dt;dt*=0.25;}
    if(doigt&&S.phase!=='fin')BARRES.forEach(b=>{if(b.c==='P')suivre(b,doigt.x,330,dt);});else BARRES.forEach(b=>{if(b.c==='P')b.v=0;});
    BARRES.forEach(b=>{if(b.k>=0){b.k+=dt/0.19;if(b.k>=1)b.k=-1;}});
    if(S.phase==='cd'){S.cd-=dt;const B=S.b;B.z=Math.max(0,(B.z||0)-dt*30);if(S.cd<=0){S.phase='jeu';bip(988,.1,.05);}ia(dt);}
    else if(S.phase==='jeu'){ia(dt);if(window.__BF_AUTO)ia(dt,'P');const r=rouler(dt);if(r)but(r);}
    else if(S.phase==='but'){S.cd-=dt;const B=S.b;B.x+=B.vx*dt*.3;B.y+=B.vy*dt*.3;
      if(S.cd<=0){if(S.finApres){S.phase='fin';fin();}else engager();}}
    S.secousse=Math.max(0,S.secousse-dt*1.6);S.flash=Math.max(0,S.flash-dt*1.8);
    S.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.v-=dt;});S.parts=S.parts.filter(p=>p.v>0);
    S.pops.forEach(p=>p.v-=dt);S.pops=S.pops.filter(p=>p.v>0);
    S.tr.push({x:S.b.x,y:S.b.y});if(S.tr.length>10)S.tr.shift();
    dessiner(t);}
  raf=requestAnimationFrame(boucle);}

/* ---------------- les écrans ---------------- */
let NIV_SEL='moyen';
function lireRecord(){try{return JSON.parse(localStorage.getItem('bdl.bf')||'{}');}catch(x){return {};}}
function menu(){const ov=el.querySelector('#bfOv');ov.hidden=false;const R=lireRecord();
  ov.innerHTML='<div class="bx"><h2>BABY-FOOT</h2><div class="vs"><span style="background:#e8761e;color:#2a1004">🎃 Citrouilles</span>contre<span style="background:#e8ecff;color:#1a1420">💀 Squelettes</span></div>'+
   '<p>Premier à '+GAGNE+' buts. Dédé tient les Squelettes.</p>'+
   '<div class="aide"><div><b>👆↔</b>Glisse : toutes tes barres suivent ton doigt</div><div><b>👆⚡</b>Balaie vers le haut pour frapper, en biais pour viser</div><div style="grid-column:1/3"><b>💀🔥</b>Garde le doigt posé une demi-seconde, puis balaie : <b style="display:inline;font-size:12px;color:#7aff7a">tir de la mort</b></div></div>'+
   '<div class="lb">NIVEAU DE DÉDÉ</div><div class="niv">'+Object.keys(NIV).map(k=>'<button class="b'+(k===NIV_SEL?' on':'')+'" data-n="'+k+'">'+NIV[k].nom+(R[k]?'<br><small style="font-size:11px;color:#ffb04a">✓ '+R[k]+' victoire'+(R[k]>1?'s':'')+'</small>':'')+'</button>').join('')+'</div>'+
   '<button class="go" id="bfGo">Coup d’envoi</button></div>';
  ov.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{NIV_SEL=b.dataset.n;menu();});
  ov.querySelector('#bfGo').onclick=()=>{ov.hidden=true;nouvelle(NIV_SEL);engager();A();bip(660,.1,.05);};}
function fin(){const ov=el.querySelector('#bfOv'),moi=S.s1>S.s2;ov.hidden=false;
  if(moi){const R=lireRecord();R[S.niv]=(R[S.niv]||0)+1;try{localStorage.setItem('bdl.bf',JSON.stringify(R));}catch(x){}}
  ov.innerHTML='<div class="bx"><h2>'+(moi?'VICTOIRE !':'LES SQUELETTES GAGNENT')+'</h2><p>'+S.s1+' – '+S.s2+' · niveau '+NIV[S.niv].nom+'<br>'+S.stats.tirs+' frappes dans la partie</p>'+
   '<button class="go" id="bfRe">Revanche</button><button class="go gris" id="bfMenu">Changer de niveau</button></div>';
  ov.querySelector('#bfRe').onclick=()=>{ov.hidden=true;nouvelle(S.niv);engager();};ov.querySelector('#bfMenu').onclick=menu;}

function ouvrir(opt){OPT=opt||{};monter();el.hidden=false;actif=true;cadrer();nouvelle(NIV_SEL);S.phase='menu';menu();doigt=null;
  tPrec=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(boucle);}
function fermer(){actif=false;cancelAnimationFrame(raf);if(el)el.hidden=true;if(OPT&&typeof OPT.fermer==='function')OPT.fermer();}
window.BabyFoot={ouvrir,fermer,_etat:()=>S,_barres:BARRES};
})();
