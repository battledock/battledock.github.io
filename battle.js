/* =====================================================================
   LA BATTLE DE DANSE — le jeu de rythme du Disco Club.
   Des flèches tombent en rythme avec la musique ; on tape la bonne
   colonne au bon moment. Chaque flèche réussie, ton perso fait le pas.
   En face, un danseur du club fait pareil. Le meilleur score gagne.
   Chargé par club.js (eval direct) : voit peindreDanse, DISCO_SON,
   musiqueDisco, A, BEAT, e, appelRPC, vibrer, DEF_AP…
   ===================================================================== */
(()=>{
const RIVAUX=[
 {nom:'Disco Dédé',titre:'Le régulier du jeudi',niv:.6,ap:{peau:5,cheveux:0,coiffe:1,barbe:1,_disco:'disco_travolta'}},
 {nom:'Paillette Paulette',titre:'Reine des paillettes',niv:.74,ap:{peau:2,cheveux:3,coiffe:6,_disco:'disco_paillettes'}},
 {nom:'Le Roi Momo',titre:'Invaincu depuis 1977',niv:.88,ap:{peau:4,cheveux:1,coiffe:1,barbe:3,_disco:'disco_roi'}}];
const COUL=['#ff3ac8','#3af0ff','#ffd23a','#7aff6a'],FL=['←','↓','↑','→'];
const TRAJET=1.45,FEN=.17,PARF=.065,BIEN=.12,NB=64;
let RAC=null,CV=null,G=null,BOUCLE=0,ST=null;
const vib=x=>{try{vibrer(x);}catch(_){}};
const clk=()=>{try{if(DISCO_SON&&A())return A().currentTime;}catch(x){}return performance.now()/1000;};
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function partition(seed,niv){const R=rng(seed),L=[];let last=-1;const add=(b,l)=>{if(l===undefined){l=Math.floor(R()*4);if(l===last&&R()<.65)l=(l+1+Math.floor(R()*3))%4;}last=l;L.push({b,l,fait:0});};
 for(let b=0;b<NB;b++){const sec=Math.floor(b/16);
  if(sec===0){if(b%2===0||R()<.25)add(b);}
  else if(sec===1)add(b);
  else if(sec===2){add(b);if(R()<.3+niv*.15)add(b+.5);}
  else{add(b);if(R()<.45+niv*.2)add(b+.5);if(b%8===7)add(b,(last+2)%4);}}
 return L.sort((a,c)=>a.b-c.b);}
const B=window.DZ_B||{};
const POSES=[
 {aG:B.pointe,aD:B.hanche,jG:[-.3,.4],dx:-2,rot:.05},{aG:B.twist1,aD:B.twist1,jG:[-.4,0],jD:[.4,0],sy:.86},
 {aG:B.v,aD:B.v,jG:[-.3,.8],jD:[.3,.8],dy:-7},{aG:B.hanche,aD:B.pointe,jD:[.3,.4],dx:2,rot:-.05}];
const groove=(t)=>{const b=t/BEAT,s=Math.sin(b*Math.PI);return {aG:B.bal1,aD:B.bal2&&(Math.floor(b)%2)?B.bal2:B.bal1,jG:Math.floor(b)%2?[-.2,.3]:[0,0],jD:Math.floor(b)%2?[0,0]:[.2,.3],dy:-Math.abs(s)*1.2,rot:s*.02};};
function poseJ(J,t){if(J.rate&&t-J.rate<.45){const k=Math.max(0,1-(t-J.rate)/.45);return {aG:B.horiz,aD:B.bas,rot:Math.sin((t-J.rate)*30)*.18*k,dx:Math.sin((t-J.rate)*30)*2*k};}
 if(J.coup&&t-J.coup.t<.32)return Object.assign({},POSES[J.coup.l]);return groove(t);}
/* ---------- LE DESSIN ---------- */
function dessiner(){const W=CV.clientWidth,H=CV.clientHeight,D=Math.min(2,window.devicePixelRatio||1);if(CV.width!==Math.round(W*D)){CV.width=Math.round(W*D);CV.height=Math.round(H*D);}
 const g=G;g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;const t=clk(),S=ST,tb=(t-S.t0)/BEAT,Hs=Math.round(H*.44);
 g.fillStyle='#12061e';g.fillRect(0,0,W,H);
 /* la scène */
 g.fillStyle='#1c0a2c';g.fillRect(0,0,W,Hs);const fy=Hs*.55;
 for(let i=0;i<8;i++)for(let j=0;j<3;j++){const v=.5+.5*Math.sin(t*1.2-i*.5-j*.7),h=(i*20+j*30+t*14)%360;g.fillStyle='hsla('+h+',70%,55%,'+(.12+v*.22)+')';const x0=i*W/8,y0=fy+j*(Hs-fy)/3;g.fillRect(x0+1,y0+1,W/8-2,(Hs-fy)/3-2);}
 const lead=S.moi.score>=S.lui.score?0:1;g.fillStyle='rgba(255,240,200,.10)';const lx=lead?W*.72:W*.28;g.beginPath();g.moveTo(lx-10,0);g.lineTo(lx+10,0);g.lineTo(lx+W*.16,Hs);g.lineTo(lx-W*.16,Hs);g.fill();
 const sc=Math.max(2,Math.min(5,(Hs*.62)/50));
 [[S.moi,W*.28,S.apMoi],[S.lui,W*.72,S.apLui]].forEach(([J,x,ap])=>{g.save();g.translate(Math.round(x),Math.round(Hs-10));g.scale(sc,sc);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,1,10,2.6,0,0,7);g.fill();
  try{peindreDanse(g,0,0,ap,poseJ(J,t),t);}catch(z){}g.restore();});
 /* les noms et la jauge */
 g.font='800 13px "Baloo 2",Arial';g.textAlign='left';g.fillStyle='#fff';g.fillText(S.pseudo,12,22);g.textAlign='right';g.fillText(S.R.nom,W-12,22);
 const tot=Math.max(1,S.moi.score+S.lui.score),pm=S.moi.score/tot;g.fillStyle='#3a1a4a';g.fillRect(12,30,W-24,10);g.fillStyle='#ff3ac8';g.fillRect(12,30,(W-24)*pm,10);g.fillStyle='#3af0ff';g.fillRect(12+(W-24)*pm,30,(W-24)*(1-pm),10);g.fillStyle='#fff';g.fillRect(12+(W-24)*pm-1,27,2,16);
 g.font='800 12px "Baloo 2",Arial';g.textAlign='left';g.fillStyle='#ffb8ec';g.fillText(S.moi.score.toLocaleString('fr-FR'),12,56);g.textAlign='right';g.fillStyle='#a8f6ff';g.fillText(S.lui.score.toLocaleString('fr-FR'),W-12,56);
 if(S.combo>=4){g.textAlign='center';g.font='900 '+(16+Math.min(10,S.combo/4))+'px "Baloo 2",Arial';g.fillStyle='#ffd23a';g.fillText(S.combo+' COMBO'+(mult()>1?'  ×'+mult():''),W/2,56);}
 /* les couloirs */
 const lw=W/4,yH=H-118,y0=Hs+6;g.fillStyle='#0c0414';g.fillRect(0,Hs,W,H-Hs);
 for(let l=0;l<4;l++){const x=l*lw;g.fillStyle=(t-S.appui[l]<.12)?'rgba(255,255,255,.08)':'rgba(255,255,255,.025)';g.fillRect(x+3,Hs+2,lw-6,H-Hs-4);}
 for(let l=0;l<4;l++){const cx=l*lw+lw/2,p=(t-S.appui[l]<.12);g.strokeStyle=COUL[l];g.lineWidth=p?4:2.5;g.globalAlpha=p?1:.55;g.beginPath();g.arc(cx,yH,Math.min(30,lw*.34),0,7);g.stroke();g.globalAlpha=1;
  g.font='900 '+Math.round(Math.min(30,lw*.34))+'px Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle=p?COUL[l]:'rgba(255,255,255,.35)';g.fillText(FL[l],cx,yH+1);}
 for(const N of S.notes){if(N.fait)continue;const tn=S.t1+N.b*BEAT,dt=tn-t;if(dt>TRAJET||dt<-.25)continue;const y=yH-(dt/TRAJET)*(yH-y0),cx=N.l*lw+lw/2,r=Math.min(26,lw*.3);
  g.fillStyle=COUL[N.l];g.shadowColor=COUL[N.l];g.shadowBlur=12;g.beginPath();g.arc(cx,y,r,0,7);g.fill();g.shadowBlur=0;g.fillStyle='#1a0628';g.font='900 '+Math.round(r*1.1)+'px Arial';g.fillText(FL[N.l],cx,y+1);}
 g.textBaseline='alphabetic';
 /* les pads, en bas */
 for(let l=0;l<4;l++){const x=l*lw,p=(t-S.appui[l]<.12);g.fillStyle=p?COUL[l]:'rgba(255,255,255,.07)';g.globalAlpha=p?.55:1;g.fillRect(x+5,H-72,lw-10,64);g.globalAlpha=1;g.strokeStyle=COUL[l];g.lineWidth=2;g.strokeRect(x+5.5,H-71.5,lw-11,63);
  g.font='900 28px Arial';g.textAlign='center';g.fillStyle='#fff';g.fillText(FL[l],x+lw/2,H-30);}
 /* le verdict qui saute */
 if(S.mot&&t-S.mot.t<.6){const k=(t-S.mot.t)/.6;g.globalAlpha=1-k;g.font='900 '+Math.round(30+8*(1-k))+'px "Baloo 2",Arial';g.textAlign='center';g.fillStyle=S.mot.c;g.strokeStyle='rgba(20,0,30,.9)';g.lineWidth=5;g.strokeText(S.mot.s,W/2,Hs+60-k*16);g.fillText(S.mot.s,W/2,Hs+60-k*16);g.globalAlpha=1;}
 /* le décompte */
 if(tb<4){const n=Math.floor(tb);if(n>=0){const s=['3','2','1','DANSE !'][n],k=tb-n;g.globalAlpha=1-k*.7;g.font='900 '+(n<3?64:42)+'px "Baloo 2",Arial';g.textAlign='center';g.fillStyle='#fff';g.shadowColor='#ff3ac8';g.shadowBlur=20;g.fillText(s,W/2,Hs+(H-Hs)*.42);g.shadowBlur=0;g.globalAlpha=1;}
  else{g.font='800 18px "Baloo 2",Arial';g.textAlign='center';g.fillStyle='rgba(255,255,255,.8)';g.fillText('Prépare-toi…',W/2,Hs+(H-Hs)*.42);}}
 const fin=S.t1+(NB+1)*BEAT;if(t>fin&&!S.fini)terminer();
 /* la progression */
 const pr=Math.max(0,Math.min(1,(t-S.t1)/(NB*BEAT)));g.fillStyle='rgba(255,255,255,.15)';g.fillRect(0,Hs,W,3);g.fillStyle='#ffd23a';g.fillRect(0,Hs,W*pr,3);}
/* ---------- LE JEU ---------- */
const mult=()=>ST?Math.min(3,1+Math.floor(ST.combo/8)*.5):1;
function verdict(s,c){ST.mot={s,c,t:clk()};}
function taper(l){if(!ST||ST.fini)return;const t=clk();ST.appui[l]=t;let best=null,bd=9;
 for(const N of ST.notes){if(N.fait||N.l!==l)continue;const d=Math.abs(ST.t1+N.b*BEAT-t);if(d<bd){bd=d;best=N;}}
 if(!best||bd>FEN)return;best.fait=1;const base=bd<PARF?100:bd<BIEN?60:30;ST.combo++;ST.cmax=Math.max(ST.cmax,ST.combo);ST.moi.score+=Math.round(base*mult());ST.moi.coup={l,t};
 if(base===100){ST.parf++;verdict('PARFAIT !','#ffd23a');vib(6);}else if(base===60){ST.bien++;verdict('BIEN','#7aff6a');}else{ST.ok++;verdict('OK','#a8f6ff');}}
function tic(){if(!ST||ST.fini)return;const t=clk();
 for(const N of ST.notes){if(N.fait)continue;const tn=ST.t1+N.b*BEAT;if(t-tn>FEN){N.fait=2;ST.rate++;ST.combo=0;ST.moi.rate=t;verdict('RATÉ','#ff6a6a');}}
 /* le rival : il réussit selon son niveau, un peu mieux quand il est en retard */
 for(const N of ST.lui.notes){if(N.fait)continue;const tn=ST.t1+N.b*BEAT;if(t>=tn){N.fait=1;const ret=ST.lui.score<ST.moi.score*.9?.06:0;if(ST.rnd()<ST.R.niv+ret){ST.lui.combo++;const base=ST.rnd()<ST.R.niv?100:60;ST.lui.score+=Math.round(base*Math.min(3,1+Math.floor(ST.lui.combo/8)*.5));ST.lui.coup={l:N.l,t};}else{ST.lui.combo=0;ST.lui.rate=t;}}}}
async function terminer(){const S=ST;S.fini=true;const gagne=S.moi.score>S.lui.score,tot=S.notes.length,prec=Math.round((S.parf+S.bien*.7+S.ok*.4)/Math.max(1,tot)*100);
 const P=RAC.querySelector('.fin');P.style.display='flex';P.querySelector('.res').innerHTML=(gagne?'<b class="w">TU AS GAGNÉ !</b>':'<b class="l">'+S.R.nom+' gagne…</b>')+
  '<div class="li"><span>Ton score</span><i>'+S.moi.score.toLocaleString('fr-FR')+'</i></div><div class="li"><span>'+S.R.nom+'</span><i>'+S.lui.score.toLocaleString('fr-FR')+'</i></div>'+
  '<div class="li"><span>Meilleur combo</span><i>'+S.cmax+'</i></div><div class="li"><span>Précision</span><i>'+prec+' %</i></div><div class="li"><span>Parfaits</span><i>'+S.parf+' / '+tot+'</i></div><div class="gain">…</div>';
 vib(gagne?[20,40,20,40,60]:[40]);
 const gn=P.querySelector('.gain');let r=null;try{r=await appelRPC('club_battle',{p_score:S.moi.score,p_gagne:gagne});}catch(x){}
 if(r&&r.ok){if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}gn.innerHTML=r.gain>0?('+ '+(r.gain/100).toLocaleString('fr-FR')+' € <small>'+(r.restant>0?'encore '+r.restant+' battle'+(r.restant>1?'s':'')+' récompensée'+(r.restant>1?'s':'')+' aujourd’hui':'c’était la dernière récompense du jour')+'</small>'):'<small>Plus de récompense aujourd’hui — mais la gloire, elle, est intacte.</small>';}
 else if(r&&r.erreur==='trop_vite')gn.innerHTML='<small>Doucement ! Attends quelques secondes entre deux battles.</small>';
 else gn.innerHTML='<small>Les récompenses de la battle arrivent très bientôt.</small>';}
function lancer(i){const R=RIVAUX[i];try{musiqueDisco(true);}catch(x){}
 const now0=clk();let t0;try{if(DISCO_SON&&DISCO_SON.t0!=null){const bar=BEAT*4;t0=DISCO_SON.t0+Math.ceil((now0+1.2-DISCO_SON.t0)/bar)*bar;}}catch(x){}if(!t0)t0=now0+1.6;
 const seed=(Date.now()&0xffff)+i*7919;const ap=Object.assign({},DEF_AP,e.ap||{});delete ap.deguisement;
 ST={R,t0,t1:t0+4*BEAT,notes:partition(seed,R.niv),moi:{score:0},lui:{score:0,combo:0,notes:partition(seed+1,R.niv)},appui:[-9,-9,-9,-9],combo:0,cmax:0,parf:0,bien:0,ok:0,rate:0,fini:false,mot:null,rnd:rng(seed+99),
  apMoi:Object.assign(ap,{_pnj:true}),apLui:Object.assign({},DEF_AP,{bas:0,sac:0,chapeau:0,_civil:true,_pnj:true},R.ap),pseudo:(e.pseudo||'Toi').slice(0,16)};
 RAC.querySelector('.intro').style.display='none';RAC.querySelector('.fin').style.display='none';}
function fermer(){if(!RAC)return;const R0=RAC;RAC=null;ST=null;cancelAnimationFrame(BOUCLE);clearInterval(fermer.tic);window.ECRAN_COUVRANT=false;removeEventListener('keydown',clavier);R0.classList.remove('on');setTimeout(()=>R0.remove(),220);}
function clavier(ev){const k={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3}[ev.key];if(k!==undefined){ev.preventDefault();taper(k);}if(ev.key==='Escape')fermer();}
const CSS=`#btl{position:fixed;inset:0;z-index:2147482300;background:#12061e;color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;touch-action:none;opacity:0;transition:opacity .2s}
#btl.on{opacity:1}#btl canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
#btl .x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 64px);right:10px;width:38px;height:38px;border-radius:50%;border:1px solid #ff6ad8;background:rgba(0,0,0,.5);color:#fff;font:800 16px 'Baloo 2',sans-serif;z-index:3}
#btl .intro,#btl .fin{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;background:rgba(18,6,30,.88)}
#btl h2{margin:0;font:900 34px/1 'Baloo 2',sans-serif;text-shadow:0 0 8px #ff3ac8,0 0 20px #ff3ac8;letter-spacing:1px}
#btl .sous{font-size:14px;font-weight:600;color:#ffd8f4;text-align:center;max-width:320px;line-height:1.35}
#btl .riv{width:100%;max-width:340px;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,106,216,.5);background:linear-gradient(#3a0a4a,#1a0628);border-radius:16px;padding:10px 14px;color:#fff;text-align:left;font-family:inherit}
#btl .riv b{display:block;font-size:17px}#btl .riv small{display:block;font-size:12px;color:#ffb8ec;font-weight:700}#btl .riv i{margin-left:auto;font-style:normal;color:#ffd23a;font-size:15px;letter-spacing:2px}
#btl .res{width:100%;max-width:340px;background:linear-gradient(#2a0a3a,#1a0628);border:1px solid rgba(255,106,216,.5);border-radius:20px;padding:16px}
#btl .res b{display:block;text-align:center;font-size:28px;margin-bottom:8px}#btl .res b.w{color:#ffd23a;text-shadow:0 0 12px rgba(255,210,58,.6)}#btl .res b.l{color:#ffb8ec}
#btl .li{display:flex;justify-content:space-between;font-weight:700;font-size:15px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.08)}#btl .li i{font-style:normal;color:#fff2b8}
#btl .gain{margin-top:10px;text-align:center;font-size:24px;font-weight:900;color:#7aff6a}#btl .gain small{display:block;font-size:12.5px;color:#ffd8f4;font-weight:700}
#btl .bt{width:100%;max-width:340px;border:0;border-radius:16px;padding:12px;font:800 17px 'Baloo 2',sans-serif;color:#2a0a30;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 4px 0 #7a5214}
#btl .bt.b2{background:rgba(255,255,255,.1);color:#fff;box-shadow:none;border:1px solid rgba(255,255,255,.25)}`;
window.ouvrirBattle=function(){if(RAC)return;if(!document.getElementById('btlCss')){const s=document.createElement('style');s.id='btlCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='btl';RAC=d;
 d.innerHTML='<canvas></canvas><button class="x" aria-label="Quitter">✕</button><div class="intro"><h2>BATTLE DE DANSE</h2><div class="sous">Les flèches tombent en rythme : tape la bonne colonne quand elle touche le cercle. Enchaîne les combos, fais mieux que ton adversaire !</div>'+
  RIVAUX.map((R,i)=>'<button class="riv" data-i="'+i+'"><span><b>'+R.nom+'</b><small>'+R.titre+'</small></span><i>'+'★'.repeat(i+1)+'☆'.repeat(2-i)+'</i></button>').join('')+'</div>'+
  '<div class="fin" style="display:none"><div class="res"></div><button class="bt" data-a="re">Revanche !</button><button class="bt b2" data-a="q">Retour sur la piste</button></div>';
 document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;
 d.querySelector('.x').onclick=()=>{vib(8);fermer();};d.querySelectorAll('.riv').forEach(b=>b.onclick=()=>{vib(10);lancer(+b.dataset.i);});
 d.querySelector('[data-a=re]').onclick=()=>{vib(10);lancer(RIVAUX.indexOf(ST.R));};d.querySelector('[data-a=q]').onclick=()=>{vib(8);fermer();};
 CV.addEventListener('pointerdown',ev=>{if(!ST||ST.fini)return;const r=CV.getBoundingClientRect();if(ev.clientY-r.top<r.height*.44)return;ev.preventDefault();taper(Math.max(0,Math.min(3,Math.floor((ev.clientX-r.left)/(r.width/4)))));});
 addEventListener('keydown',clavier);fermer.tic=setInterval(tic,16);
 const boucle=()=>{if(!RAC)return;try{if(ST)dessiner();else{const W=CV.clientWidth,H=CV.clientHeight,D=Math.min(2,window.devicePixelRatio||1);if(CV.width!==Math.round(W*D)){CV.width=Math.round(W*D);CV.height=Math.round(H*D);}G.setTransform(D,0,0,D,0,0);G.fillStyle='#12061e';G.fillRect(0,0,W,H);}}catch(x){}BOUCLE=requestAnimationFrame(boucle);};BOUCLE=requestAnimationFrame(boucle);};
})();
