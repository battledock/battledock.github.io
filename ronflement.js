/* =====================================================================
   LE CONCOURS DE RONFLEMENT — le grand n'importe quoi de la place.
   Tu dors sur un banc. Tiens appuyé pour inspirer (la poitrine se gonfle),
   relâche au sommet pour lâcher un ronflement puissant. Trois concurrents
   PNJ ronflent en face. Le jury note le volume ET la régularité. Podium.
   Pas d'argent en jeu : juste la gloire et un trophée.
   Chargé par joliette.js (eval direct) : voit vibrer, e, sauver.
   ===================================================================== */
(()=>{
const vib=x=>{try{vibrer(x);}catch(_){}};
let RAC=null,CV=null,G=null,BOUCLE=0,ETAT='pret',T0=0,APPUI=null;
/* le souffle : inspiration (appui) puis expiration (relâché) */
let souffle=0,sens=0,ronfles=[],scoreMoi=0,manche=0;
const DUREE=18;/* 18 secondes de concours */
let fin=0;
/* les concurrents : nom, puissance, régularité */
const RIVAUX=[
 {nom:'Papi Roudoudou',emoji:'👴',force:.72,reg:.9,c:'#c89a5e',ronfles:[],score:0,ph:Math.random()*6},
 {nom:'Gros Tonton',emoji:'🧔',force:.88,reg:.6,c:'#a8524a',ronfles:[],score:0,ph:Math.random()*6},
 {nom:'La Mémé Sieste',emoji:'👵',force:.6,reg:.95,c:'#7d6a3f',ronfles:[],score:0,ph:Math.random()*6}];

const CSS=`#rfl{position:fixed;inset:0;z-index:2147482400;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 30%,#2a3a5a 0%,#141e30 55%,#0a0e18 100%);font-family:'Baloo 2',system-ui,sans-serif;color:#eaf0ff;opacity:0;transition:opacity .25s;user-select:none;-webkit-user-select:none;overflow:hidden;touch-action:none}
#rfl.on{opacity:1}#rfl *{box-sizing:border-box}
#rfl .x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:16px;width:40px;height:40px;border-radius:50%;border:1px solid #6a8ad8;background:rgba(0,0,0,.4);color:#fff;font:800 17px 'Baloo 2',sans-serif;z-index:5}
#rfl .tt{text-align:center;padding:calc(20px + env(safe-area-inset-top,0px)) 16px 4px;pointer-events:none}
#rfl .tt b{display:block;font:900 26px/1 'Baloo 2',sans-serif;color:#fff;text-shadow:0 0 12px #6ab8ff}
#rfl .tt small{display:block;font-size:12px;letter-spacing:3px;color:#9ec8ff;font-weight:800;margin-top:5px}
#rfl canvas{flex:1;width:100%;touch-action:none}
#rfl .cons{text-align:center;font-weight:800;font-size:15px;color:#cfe0ff;padding:4px 20px;min-height:22px;text-shadow:0 1px 4px #000}
#rfl .zone{padding:0 16px calc(22px + env(safe-area-inset-bottom,0px))}
#rfl .big{display:block;width:100%;border:0;border-radius:22px;padding:22px;font:900 22px 'Baloo 2',sans-serif;color:#0a1428;background:linear-gradient(#bfe0ff,#6ab0f0 60%,#3a7ac8);box-shadow:0 6px 0 #1a4a7a,0 10px 24px rgba(60,140,240,.4);touch-action:none}
#rfl .big:active{transform:translateY(3px)}
#rfl .go{display:block;width:100%;border:0;border-radius:18px;padding:15px;font:900 18px 'Baloo 2',sans-serif;color:#2a1a0a;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 5px 0 #7a5214}
#rfl .podium{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(8,12,24,.88);opacity:0;pointer-events:none;padding:24px}
#rfl .podium.on{opacity:1;pointer-events:auto;transition:opacity .4s}
#rfl .podium h2{font:900 30px 'Baloo 2',sans-serif;color:#ffe24a;text-shadow:0 0 16px #ffb000;margin:0 0 18px}
#rfl .podium .r{display:flex;align-items:center;gap:12px;width:min(340px,90%);background:rgba(255,255,255,.07);border-radius:14px;padding:11px 14px;margin-bottom:8px;font-weight:800;font-size:16px}
#rfl .podium .r.moi{background:rgba(106,184,255,.2);border:1px solid #6ab8ff}
#rfl .podium .r .m{font-size:24px;width:34px;text-align:center}#rfl .podium .r .n{flex:1}#rfl .podium .r .s{color:#ffd23a}
#rfl .podium .go{width:min(340px,90%);margin-top:14px}`;

function dessiner(){const D=Math.min(2,window.devicePixelRatio||1),W=CV.clientWidth,H=CV.clientHeight;
 if(CV.width!==Math.round(W*D)){CV.width=Math.round(W*D);CV.height=Math.round(H*D);}G.setTransform(D,0,0,D,0,0);
 G.clearRect(0,0,W,H);
 const t=(performance.now()-T0)/1000;
 /* les 4 dormeurs : toi au centre-bas en gros, les 3 rivaux en haut */
 const places=[[W*.5,H*.72,1.3,true],[W*.22,H*.32,.8,false],[W*.5,H*.3,.8,false],[W*.78,H*.32,.8,false]];
 /* toi */
 dormeur(G,W*.5,H*.68,1.4,'#6ab8ff','TOI',souffle,ETAT==='jeu');
 /* rivaux */
 for(let i=0;i<RIVAUX.length;i++){const R=RIVAUX[i],px=[W*.22,W*.5,W*.78][i],gon=ETAT==='jeu'?(.5+.5*Math.sin(t*(1.1+R.force)+R.ph)):0;
  dormeurRival(G,px,H*.26,.72,R,gon);}
 /* les Z qui montent quand on ronfle */
 dessinerZ(G,W,H,t);
 /* la jauge de souffle (au centre bas) */
 if(ETAT==='jeu'){const bx=W*.5-70,by=H*.9,bw=140,bh=14;
  G.fillStyle='rgba(255,255,255,.12)';G.fillRect(bx,by,bw,bh);
  G.fillStyle=souffle>.85?'#ff5a6a':souffle>.5?'#ffd23a':'#6affa0';G.fillRect(bx,by,bw*souffle,bh);
  G.strokeStyle='rgba(255,255,255,.4)';G.lineWidth=1;G.strokeRect(bx,by,bw,bh);
  /* la zone "parfaite" (relâcher ici) */
  G.fillStyle='rgba(255,255,255,.5)';G.fillRect(bx+bw*.8,by-3,2,bh+6);G.fillRect(bx+bw*.96,by-3,2,bh+6);}}

function dormeur(g,x,y,s,c,nom,gon,actif){
 /* banc */
 g.fillStyle='#4a3420';g.fillRect(x-42*s,y+18*s,84*s,10*s);g.fillStyle='#5a4028';g.fillRect(x-42*s,y+16*s,84*s,3*s);
 /* corps allongé, la poitrine se gonfle */
 const w=(34+gon*10)*s,h=(20+gon*4)*s;
 g.fillStyle=c;g.beginPath();g.ellipse(x,y+6*s,w,h,0,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(x-w*.3,y+2*s,w*.4,h*.4,0,0,7);g.fill();
 /* tête */
 g.fillStyle='#e8b98a';g.beginPath();g.arc(x-w*.8,y-2*s,10*s,0,7);g.fill();
 /* bonnet de nuit */
 g.fillStyle='#d8304a';g.beginPath();g.moveTo(x-w*.8-11*s,y-6*s);g.lineTo(x-w*.8+9*s,y-10*s);g.lineTo(x-w*.8-13*s,y-18*s);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x-w*.8-13*s,y-18*s,3*s,0,7);g.fill();
 /* bouche ouverte qui ronfle */
 g.fillStyle='#4a1020';g.beginPath();g.ellipse(x-w*.95,y+2*s,(2+gon*2)*s,(2+gon*2.4)*s,0,0,7);g.fill();
 /* nom */
 g.fillStyle='#fff';g.font='900 '+(13*s)+'px "Baloo 2",sans-serif';g.textAlign='center';g.fillText(nom,x,y+40*s);}

function dormeurRival(g,x,y,s,R,gon){
 g.fillStyle='#3a2a1a';g.fillRect(x-30*s,y+14*s,60*s,7*s);
 const w=(24+gon*7)*s,h=(14+gon*3)*s;
 g.fillStyle=R.c;g.beginPath();g.ellipse(x,y+4*s,w,h,0,0,7);g.fill();
 g.fillStyle='#e8b98a';g.beginPath();g.arc(x-w*.8,y-2*s,7*s,0,7);g.fill();
 g.font=(16*s)+'px sans-serif';g.textAlign='center';g.fillText(R.emoji,x-w*.8,y+1*s);
 g.fillStyle='#cfe0ff';g.font='800 '+(10*s)+'px "Baloo 2",sans-serif';g.fillText(R.nom,x,y+30*s);
 /* score en direct */
 g.fillStyle='#ffd23a';g.font='900 '+(11*s)+'px "Baloo 2",sans-serif';g.fillText(Math.round(R.score),x,y+42*s);}

const ZZZ=[];
function dessinerZ(g,W,H,t){for(let i=ZZZ.length-1;i>=0;i--){const z=ZZZ[i],a=(performance.now()-z.t)/1000;if(a>2){ZZZ.splice(i,1);continue;}
  g.globalAlpha=Math.max(0,1-a/2);g.fillStyle=z.c;g.font='900 '+(z.s*(1+a*.4))+'px "Baloo 2",sans-serif';g.textAlign='center';g.fillText('Z',z.x+Math.sin(a*4)*8,z.y-a*50);g.globalAlpha=1;}}
function pousserZ(x,y,c,s){ZZZ.push({x,y,c,s:s||22,t:performance.now()});}

/* la boucle : le souffle monte quand on appuie, redescend sinon ; les rivaux ronflent tout seuls */
function boucle(){if(!RAC)return;const now=performance.now(),dt=1/60;
 if(ETAT==='jeu'){
  if(APPUI!==null){souffle=Math.min(1.1,souffle+dt*.6);}else{if(souffle>0)souffle=Math.max(0,souffle-dt*1.2);}
  /* les rivaux marquent régulièrement */
  for(const R of RIVAUX){R.ph+=dt;if(Math.sin((now/1000)*(1.1+R.force)+R.ph)>.985){R.score+=R.force*(6+Math.random()*4)*R.reg;try{if(CV){const W=CV.clientWidth;}}catch(x){}pousserZ([CV.clientWidth*.22,CV.clientWidth*.5,CV.clientWidth*.78][RIVAUX.indexOf(R)],CV.clientHeight*.22,R.c,16);}}
  if(now>=fin){finir();}
 }
 try{dessiner();}catch(x){}BOUCLE=requestAnimationFrame(boucle);}

/* relâcher : on marque selon où on relâche (idéal : jauge haute mais pas explosée) */
function relacher(){if(ETAT!=='jeu'||APPUI===null)return;
 const s=souffle;APPUI=null;
 let pts;if(s>1.05){pts=2;flash('💨 Trop fort, tu t’étouffes !');vib(40);}
 else if(s>=.8&&s<=.96){pts=22;flash('🏆 RONFLEMENT PARFAIT !');vib([10,30,10,30,60]);}
 else if(s>=.5){pts=10+ (s-.5)*20;flash('😴 Bon ronflement');vib([10,30]);}
 else{pts=3;flash('😐 Petit souffle…');vib(12);}
 scoreMoi+=pts;pousserZ(CV.clientWidth*.5,CV.clientHeight*.5,'#6ab8ff',30);
 souffle=0;}
function flash(txt){const c=RAC&&RAC.querySelector('.cons');if(c)c.textContent=txt;}

function demarrer(){ETAT='jeu';scoreMoi=0;souffle=0;for(const R of RIVAUX){R.score=0;R.ph=Math.random()*6;}T0=performance.now();fin=performance.now()+DUREE*1000;
 RAC.querySelector('.zone').innerHTML='<button class="big" id="souffler">INSPIRE… puis RELÂCHE 😴</button>';
 const b=RAC.querySelector('#souffler');
 const down=ev=>{ev.preventDefault();if(APPUI===null){APPUI=performance.now();vib(6);flash('Inspire…');}};
 const up=ev=>{ev.preventDefault();relacher();};
 b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);
 flash('Tiens appuyé pour gonfler, relâche dans la zone claire !');
 /* compte à rebours visible */
 clearInterval(RAC.rab);RAC.rab=setInterval(()=>{const r=Math.max(0,Math.ceil((fin-performance.now())/1000));const tt=RAC&&RAC.querySelector('.tt small');if(tt)tt.textContent=ETAT==='jeu'?(r+' SECONDES'):'';},250);}

function finir(){ETAT='fini';clearInterval(RAC.rab);
 const tous=[{nom:'Toi',s:scoreMoi,moi:true}].concat(RIVAUX.map(R=>({nom:R.nom,s:Math.round(R.score),moi:false}))).sort((a,b)=>b.s-a.s);
 const rang=tous.findIndex(x=>x.moi)+1;const M=['🥇','🥈','🥉','4️⃣'];
 /* record perso */
 if(!e.ronfle)e.ronfle={record:0};if(scoreMoi>e.ronfle.record){e.ronfle.record=Math.round(scoreMoi);try{sauver();}catch(x){}}
 const p=RAC.querySelector('.podium');
 p.innerHTML='<h2>'+(rang===1?'CHAMPION ! 🏆':'Podium')+'</h2>'+
  tous.map((x,i)=>'<div class="r'+(x.moi?' moi':'')+'"><span class="m">'+(M[i]||(i+1))+'</span><span class="n">'+x.nom+'</span><span class="s">'+x.s+' pts</span></div>').join('')+
  '<div style="margin-top:10px;font-weight:700;color:#9ec8ff;font-size:13px">Ton record : '+e.ronfle.record+' pts</div>'+
  '<button class="go" id="rejouer">Refaire un somme</button>';
 p.classList.add('on');
 p.querySelector('#rejouer').onclick=()=>{vib(8);p.classList.remove('on');demarrer();};
 vib(rang===1?[10,40,10,40,10,40,100]:[10,30,10]);}

window.ouvrirConcoursRonflement=function(){if(RAC)return;
 if(!document.getElementById('rflCss')){const s=document.createElement('style');s.id='rflCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='rfl';RAC=d;
 d.innerHTML='<div class="tt"><b>Concours de Ronflement</b><small>LE GRAND SOMME DE LA JOLIETTE</small></div>'+
  '<button class="x" aria-label="Fermer">✕</button><canvas></canvas>'+
  '<div class="cons">Le jury t’écoute. Prêt à dormir ?</div>'+
  '<div class="zone"><button class="go" id="lancer">Commencer le concours 😴</button></div>'+
  '<div class="podium"></div>';
 document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');
 requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;ETAT='pret';
 d.querySelector('.x').onclick=()=>{vib(8);fermer();};
 d.querySelector('#lancer').onclick=()=>{vib(10);demarrer();};
 BOUCLE=requestAnimationFrame(boucle);};

function fermer(){if(!RAC)return;const R0=RAC;RAC=null;window.ECRAN_COUVRANT=false;cancelAnimationFrame(BOUCLE);try{clearInterval(R0.rab);}catch(x){}R0.classList.remove('on');setTimeout(()=>R0.remove(),250);}
})();
