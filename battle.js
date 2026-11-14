/* =====================================================================
   LA BATTLE DE DANSE — le jeu de rythme du Disco Club.
   Des flèches tombent en rythme avec la musique ; on tape la bonne
   colonne au bon moment. Chaque flèche réussie, ton perso fait le pas.
   En face, un danseur du club fait pareil. Le meilleur score gagne.
   Chargé par club.js (eval direct) : voit peindreDanse, DISCO_SON,
   musiqueDisco, A, BEAT, e, appelRPC, vibrer, DEF_AP…
   ===================================================================== */
(()=>{
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const NOMS=[['Disco Dédé','Le régulier du jeudi',{peau:5,cheveux:0,coiffe:1,barbe:1,_disco:'disco_travolta'}],['Paillette Paulette','Reine des paillettes',{peau:2,cheveux:3,coiffe:6,_disco:'disco_paillettes'}],
 ['Kid Néon','Patins aux pieds, jamais fatigué',{peau:6,cheveux:4,coiffe:2,_disco:'disco_neon'}],['Funky Fred','Le léopard du Vieux-Port',{peau:4,cheveux:1,coiffe:0,barbe:3,_disco:'disco_leopard'}],
 ['Lady Lamé','Elle brille plus que la boule',{peau:1,cheveux:7,coiffe:12,_disco:'disco_lame'}],['Mamie Groove','Elle dansait déjà en 1975',{peau:3,cheveux:7,coiffe:3,_disco:'disco_arc'}],
 ['DJ Boule','Il descend de ses platines pour toi',{peau:4,cheveux:1,coiffe:1,barbe:3,_disco:'disco_boule'}],['Le Roi Momo','Invaincu depuis 1977',{peau:4,cheveux:1,coiffe:1,barbe:3,_disco:'disco_roi'}]];
const ROMAIN=['','',' II',' III',' IV',' V',' VI',' VII',' VIII',' IX',' X'];
function rivalDe(L){const k=(L-1)%NOMS.length,tour=Math.floor((L-1)/NOMS.length),N=NOMS[k];return {nom:N[0]+(tour?(ROMAIN[tour+1]||(' '+(tour+1))):''),titre:N[1],ap:N[2],niv:Math.min(.96,.5+L*.045),L};}
const PALIERS=[[3,'Le Twist'],[6,'Le Kangourou'],[10,'Le Moonwalk'],[15,'La Boule à Facettes'],[20,'La Fièvre du samedi soir']];
const gainMax=L=>Math.min(10000,1500+L*500);
let NIV={niveau:1,victoires:0,restant:5};
const COUL=['#ff3ac8','#3af0ff','#ffd23a','#7aff6a'],FL=['←','↓','↑','→'];
let TRAJET=1.45;const FEN=.17,PARF=.065,BIEN=.12,NB=64;
let RAC=null,CV=null,G=null,BOUCLE=0,ST=null;
const vib=x=>{try{vibrer(x);}catch(_){}};
/* L'HORLOGE : celle de ce qu'on ENTEND. L'horloge audio avance par à-coups (par paquets d'échantillons) et
   le son sort des haut-parleurs avec du retard (de 20 à 200 ms selon le téléphone, plus en Bluetooth).
   On suit donc l'horloge fluide de l'écran, recalée en douceur sur l'audio, moins la latence de sortie. */
let AO=null,LAT=0;
function recaler(){try{if(DISCO_SON&&A()){const c=A(),k=c.currentTime-performance.now()/1000;AO=(AO===null)?k:AO*.97+k*.03;LAT=(c.outputLatency||0)+(c.baseLatency||0);return;}}catch(x){}AO=null;LAT=0;}
const versJeu=perf=>AO===null?perf:perf+AO-LAT;
const clk=()=>versJeu(performance.now()/1000);
/* LE RÉGLAGE AUTOMATIQUE : chaque frappe réussie dit si l'on tape plutôt en avance ou en retard ;
   on centre la fenêtre sur la main du joueur (et on s'en souvient pour la prochaine fois) */
let CAL=0;try{CAL=Math.max(-.2,Math.min(.2,parseFloat(localStorage.getItem('bd_btl_cal'))||0));}catch(x){}
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function partition(seed,niv,L){const R=rng(seed),P=[];let last=-1;L=L||1;const add=(b,l)=>{if(l===undefined){l=Math.floor(R()*4);if(l===last&&R()<.65)l=(l+1+Math.floor(R()*3))%4;}last=l;P.push({b,l,fait:0});};
 const dm=Math.min(.45,(L-1)*.04);
 for(let b=0;b<NB;b++){const sec=Math.floor(b/16);
  if(sec===0){if(b%2===0||R()<.25+dm*1.5)add(b);}
  else if(sec===1){add(b);if(R()<dm)add(b+.5);}
  else if(sec===2){add(b);if(R()<.3+dm)add(b+.5);if(L>=4&&R()<dm*.5)add(b,(last+2)%4);}
  else{add(b);if(R()<.45+dm)add(b+.5);if(b%8===7||(L>=5&&R()<dm*.6))add(b,(last+2)%4);if(L>=8&&R()<dm*.5)add(b+.25);}}
 const L2=P; return L2.sort((a,c)=>a.b-c.b);}
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
function taper(l,ts){if(!ST||ST.fini)return;const t=(ts?versJeu(ts/1000):clk())-CAL;ST.appui[l]=clk();let best=null,bd=9,sd=0;
 for(const N of ST.notes){if(N.fait||N.l!==l)continue;const d=t-(ST.t1+N.b*BEAT);if(Math.abs(d)<bd){bd=Math.abs(d);sd=d;best=N;}}
 if(!best||bd>FEN)return;best.fait=1;CAL=Math.max(-.2,Math.min(.2,CAL+sd*.12));const base=bd<PARF?100:bd<BIEN?60:30;ST.combo++;ST.cmax=Math.max(ST.cmax,ST.combo);ST.moi.score+=Math.round(base*mult());ST.moi.coup={l,t};
 if(base===100){ST.parf++;verdict('PARFAIT !','#ffd23a');vib(6);}else if(base===60){ST.bien++;verdict('BIEN','#7aff6a');}else{ST.ok++;verdict('OK','#a8f6ff');}}
function tic(){if(!ST||ST.fini)return;const t=clk();
 for(const N of ST.notes){if(N.fait)continue;const tn=ST.t1+N.b*BEAT;if(t-CAL-tn>FEN){N.fait=2;ST.rate++;ST.combo=0;ST.moi.rate=t;verdict('RATÉ','#ff6a6a');}}
 /* le rival : il réussit selon son niveau, un peu mieux quand il est en retard */
 for(const N of ST.lui.notes){if(N.fait)continue;const tn=ST.t1+N.b*BEAT;if(t>=tn){N.fait=1;const ret=ST.lui.score<ST.moi.score*.9?.06:0;if(ST.rnd()<ST.R.niv+ret){ST.lui.combo++;const base=ST.rnd()<ST.R.niv?100:60;ST.lui.score+=Math.round(base*Math.min(3,1+Math.floor(ST.lui.combo/8)*.5));ST.lui.coup={l:N.l,t};}else{ST.lui.combo=0;ST.lui.rate=t;}}}}
async function terminer(){const S=ST;S.fini=true;try{localStorage.setItem('bd_btl_cal',CAL.toFixed(3));}catch(x){}const gagne=S.moi.score>S.lui.score,tot=S.notes.length,prec=Math.round((S.parf+S.bien*.7+S.ok*.4)/Math.max(1,tot)*100);
 const P=RAC.querySelector('.fin');P.style.display='flex';P.querySelector('.res').innerHTML=(gagne?'<b class="w">TU AS GAGNÉ !</b>':'<b class="l">'+S.R.nom+' gagne…</b>')+
  '<div class="li"><span>Ton score</span><i>'+S.moi.score.toLocaleString('fr-FR')+'</i></div><div class="li"><span>'+S.R.nom+'</span><i>'+S.lui.score.toLocaleString('fr-FR')+'</i></div>'+
  '<div class="li"><span>Meilleur combo</span><i>'+S.cmax+'</i></div><div class="li"><span>Précision</span><i>'+prec+' %</i></div><div class="li"><span>Parfaits</span><i>'+S.parf+' / '+tot+'</i></div><div class="gain">…</div>';
 vib(gagne?[20,40,20,40,60]:[40]);
 const gn=P.querySelector('.gain'),bt=P.querySelector('[data-a=re]');bt.textContent=gagne?'Niveau suivant →':'Revanche !';let r=null;try{r=await rpcS('club_battle',{p_score:S.moi.score,p_gagne:gagne});}catch(x){}
 if(r&&r.ok){if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}NIV.restant=r.restant;if(r.niveau)NIV.niveau=r.niveau;
  let h=r.gain>0?('+ '+(r.gain/100).toLocaleString('fr-FR')+' €'):'';if(gagne)h+='<em>NIVEAU '+NIV.niveau+' !</em>';
  if(r.piece){h+='<em class="pc">🎁 Tu débloques '+((PALIERS.find(p=>p[0]===NIV.niveau)||[0,r.piece])[1])+' !</em>';try{e.cos=Object.assign({},e.cos||{},{[r.piece]:true});}catch(x){}vib([20,40,20,40,80]);}
  h+='<small>'+(r.gain>0?(r.restant>0?'encore '+r.restant+' battle'+(r.restant>1?'s':'')+' récompensée'+(r.restant>1?'s':'')+' aujourd’hui':'c’était la dernière récompense du jour'):'Plus de gain en euros aujourd’hui — mais tu montes quand même de niveau.')+'</small>';gn.innerHTML=h;if(r.pochette&&window.montrerPochette)montrerPochette(r.pochette,'POCHETTE DE VICTOIRE 💃',1400);}
 else if(r&&r.erreur==='trop_vite')gn.innerHTML='<small>Doucement ! Attends quelques secondes entre deux battles.</small>';
 else{if(gagne)NIV.niveau++;gn.innerHTML='<small>La caisse du club ne répond pas, réessaie plus tard.</small>';}}
function lancer(){const R=rivalDe(NIV.niveau);TRAJET=Math.max(.85,1.5-(NIV.niveau-1)*.05);try{musiqueDisco(true);}catch(x){}AO=null;recaler();
 const now0=clk();let t0;try{if(DISCO_SON&&DISCO_SON.t0!=null){const bar=BEAT*4;t0=DISCO_SON.t0+Math.ceil((now0+1.2-DISCO_SON.t0)/bar)*bar;}}catch(x){}if(!t0)t0=now0+1.6;
 const seed=(Date.now()&0xffff)+NIV.niveau*7919;const ap=Object.assign({},DEF_AP,e.ap||{});delete ap.deguisement;
 ST={R,t0,t1:t0+4*BEAT,notes:partition(seed,R.niv,R.L),moi:{score:0},lui:{score:0,combo:0,notes:partition(seed+1,R.niv,R.L)},appui:[-9,-9,-9,-9],combo:0,cmax:0,parf:0,bien:0,ok:0,rate:0,fini:false,mot:null,rnd:rng(seed+99),
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
#btl .niv{font:900 18px 'Baloo 2',sans-serif;color:#ffd23a;letter-spacing:3px}#btl .rec{width:100%;max-width:340px;border-radius:14px;background:rgba(255,255,255,.06);padding:8px 12px}#btl .rec div{display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;padding:2px 0}#btl .rec b{color:#fff2b8}
#btl .gain em{display:block;font-style:normal;font-size:20px;color:#ffd23a}#btl .gain em.pc{color:#ff9ae4;font-size:17px}
#btl .bt.b2{background:rgba(255,255,255,.1);color:#fff;box-shadow:none;border:1px solid rgba(255,255,255,.25)}`;
function intro(){if(!RAC)return;const L=NIV.niveau,R=rivalDe(L),P=PALIERS.find(p=>p[0]>L),I=RAC.querySelector('.intro');I.style.display='flex';
 const et=Math.min(5,1+Math.floor((L-1)/3));
 I.innerHTML='<h2>BATTLE DE DANSE</h2><div class="niv">NIVEAU '+L+'</div><div class="sous">Les flèches tombent en rythme : tape la bonne colonne quand elle touche le cercle. Bats ton adversaire pour passer au niveau suivant.</div>'+
  '<div class="riv"><span><b>'+R.nom+'</b><small>'+R.titre+'</small></span><i>'+'★'.repeat(et)+'☆'.repeat(5-et)+'</i></div>'+
  '<div class="rec"><div><span>Gain jusqu’à</span><b>'+gainMax(L).toLocaleString('fr-FR')+' €</b></div>'+(P?'<div><span>Cadeau au niveau '+P[0]+'</span><b>🎁 '+P[1]+'</b></div>':'')+'<div><span>Battles récompensées aujourd’hui</span><b>'+(NIV.restant)+' / 5</b></div></div>'+
  '<button class="bt" data-a="go">C’est parti !</button>';
 I.querySelector('[data-a=go]').onclick=()=>{vib(10);lancer();};}
window.ouvrirBattle=function(){if(RAC)return;if(!document.getElementById('btlCss')){const s=document.createElement('style');s.id='btlCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='btl';RAC=d;
 d.innerHTML='<canvas></canvas><button class="x" aria-label="Quitter">✕</button><div class="intro"></div>'+
  '<div class="fin" style="display:none"><div class="res"></div><button class="bt" data-a="re">Revanche !</button><button class="bt b2" data-a="q">Retour sur la piste</button></div>';
 document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;
 d.querySelector('.x').onclick=()=>{vib(8);fermer();};intro();
 d.querySelector('[data-a=re]').onclick=()=>{vib(10);lancer();};d.querySelector('[data-a=q]').onclick=()=>{vib(8);fermer();};
 CV.addEventListener('pointerdown',ev=>{if(!ST||ST.fini)return;const r=CV.getBoundingClientRect();if(ev.clientY-r.top<r.height*.44)return;ev.preventDefault();taper(Math.max(0,Math.min(3,Math.floor((ev.clientX-r.left)/(r.width/4)))),ev.timeStamp);});
 addEventListener('keydown',clavier);fermer.tic=setInterval(tic,16);
 try{rpcS('club_mon_niveau',{}).then(r=>{if(r&&r.niveau){NIV=Object.assign(NIV,r);if(!ST)intro();}}).catch(()=>{});}catch(x){}
 const boucle=()=>{if(!RAC)return;try{recaler();if(ST)dessiner();else{const W=CV.clientWidth,H=CV.clientHeight,D=Math.min(2,window.devicePixelRatio||1);if(CV.width!==Math.round(W*D)){CV.width=Math.round(W*D);CV.height=Math.round(H*D);}G.setTransform(D,0,0,D,0,0);G.fillStyle='#12061e';G.fillRect(0,0,W,H);}}catch(x){}BOUCLE=requestAnimationFrame(boucle);};BOUCLE=requestAnimationFrame(boucle);};
})();
