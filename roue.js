/* =====================================================================
   LA ROUE DISCO — la roue de la fortune du Disco Club. Un tour gratuit
   par jour. Elle tourne, ralentit et s'arrête pile sur le secteur que le
   serveur a tiré (tourner_roue_du_jour). Les gains tombent en jetons.
   Chargé par club.js (eval direct) : voit e, appelRPC/sb, vibrer,
   texteVolant, joueur, sauver, majHaut.
   ===================================================================== */
(()=>{
const rpcS=async(n,a)=>{try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data!=null?q.data:(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}};
const vib=x=>{try{vibrer(x);}catch(_){}};
/* les 12 secteurs : doivent coller à roue_secteurs() côté serveur (i → gain) */
const SECT=[10,5,25,5,50,10,5,100,15,5,250,1000];
const N=SECT.length;
const COUL=['#ff3ac8','#3af0ff','#ffd23a','#7aff6a','#b86aff','#ff7a3a','#ff3ac8','#3af0ff','#ffd23a','#7aff6a','#b86aff','#ffe24a'];
let RAC=null,CV=null,G=null,BOUCLE=0;
let ANG=0,VIT=0,CIBLE=null,ETAT='pret',GAIN=0,PROCHAIN=0,MSG='';
const TAU=Math.PI*2;

const CSS=`#rdc{position:fixed;inset:0;z-index:2147482400;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 38%,#3a0a5a 0%,#1a0630 55%,#0a0414 100%);font-family:'Baloo 2',system-ui,sans-serif;color:#f6efff;opacity:0;transition:opacity .25s;user-select:none;-webkit-user-select:none;overflow:hidden}
#rdc.on{opacity:1}#rdc *{box-sizing:border-box}
#rdc .x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:16px;width:40px;height:40px;border-radius:50%;border:1px solid #ff6ad8;background:rgba(0,0,0,.4);color:#fff;font:800 17px 'Baloo 2',sans-serif;z-index:5}
#rdc .tt{position:absolute;top:calc(22px + env(safe-area-inset-top,0px));left:0;right:0;text-align:center;pointer-events:none}
#rdc .tt b{display:block;font:900 28px/1 'Baloo 2',sans-serif;color:#fff;text-shadow:0 0 12px #ff3ac8,0 0 26px #ff3ac8}
#rdc .tt small{display:block;font-size:12px;letter-spacing:3px;color:#ffb8ec;font-weight:800;margin-top:6px}
#rdc canvas{width:min(86vw,420px);height:min(86vw,420px);touch-action:none}
#rdc .msg{min-height:26px;margin-top:14px;font-weight:800;font-size:16px;color:#ffd8f4;text-align:center;padding:0 24px;text-shadow:0 1px 4px #000}
#rdc .go{margin-top:10px;border:0;border-radius:18px;padding:15px 40px;font:900 19px 'Baloo 2',sans-serif;color:#2a0a30;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 5px 0 #7a5214,0 8px 22px rgba(255,200,60,.4);transition:transform .1s}
#rdc .go:active{transform:translateY(3px);box-shadow:0 2px 0 #7a5214}
#rdc .go[disabled]{opacity:.5;box-shadow:0 5px 0 #4a3210}
#rdc .gain{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:0}
#rdc .gain.on{opacity:1;transition:opacity .4s}
#rdc .gain .j{font:900 64px 'Baloo 2',sans-serif;color:#ffe24a;text-shadow:0 0 18px #ffb000,0 0 40px #ff8000}
#rdc .gain .l{font:800 18px 'Baloo 2',sans-serif;color:#fff;margin-top:4px;letter-spacing:2px}`;

function dessiner(){const D=Math.min(2,window.devicePixelRatio||1),css=CV.clientWidth;if(CV.width!==Math.round(css*D)){CV.width=CV.height=Math.round(css*D);}
 G.setTransform(D,0,0,D,0,0);const W=css,cx=W/2,cy=W/2,r=W/2-10;
 G.clearRect(0,0,W,W);
 /* le disque */
 G.save();G.translate(cx,cy);G.rotate(ANG);
 for(let i=0;i<N;i++){const a0=i/N*TAU,a1=(i+1)/N*TAU;G.beginPath();G.moveTo(0,0);G.arc(0,0,r,a0,a1);G.closePath();
  G.fillStyle=COUL[i%COUL.length];G.globalAlpha=SECT[i]>=250?1:.88;G.fill();G.globalAlpha=1;
  G.strokeStyle='rgba(0,0,0,.35)';G.lineWidth=2;G.stroke();
  /* le montant, écrit vers l'extérieur */
  G.save();G.rotate((a0+a1)/2);G.textAlign='right';G.textBaseline='middle';
  G.fillStyle=SECT[i]>=100?'#1a0620':'#2a0a30';G.font='900 '+(SECT[i]>=250?r*.11:r*.095)+'px "Baloo 2",sans-serif';
  G.fillText(SECT[i],r-10,0);G.font='700 '+(r*.05)+'px "Baloo 2",sans-serif';G.fillText('jetons',r-10,r*.11);G.restore();}
 /* moyeu */
 G.beginPath();G.arc(0,0,r*.14,0,TAU);G.fillStyle='#1a0630';G.fill();G.strokeStyle='#e0b040';G.lineWidth=3;G.stroke();
 G.fillStyle='#ffe24a';G.font='900 '+(r*.1)+'px "Baloo 2",sans-serif';G.textAlign='center';G.textBaseline='middle';G.fillText('🪩',0,1);
 G.restore();
 /* le liseré doré + petits spots */
 G.beginPath();G.arc(cx,cy,r,0,TAU);G.strokeStyle='#e0b040';G.lineWidth=5;G.stroke();
 for(let i=0;i<24;i++){const a=i/24*TAU+ANG*.3,lx=cx+Math.cos(a)*(r-2),ly=cy+Math.sin(a)*(r-2);const on=(Math.floor(performance.now()/120)+i)%3===0;G.beginPath();G.arc(lx,ly,3,0,TAU);G.fillStyle=on?'#fff6c8':'#7a5a14';G.fill();}
 /* le repère en haut (le curseur qui pointe le secteur gagnant) */
 G.beginPath();G.moveTo(cx-14,cy-r-6);G.lineTo(cx+14,cy-r-6);G.lineTo(cx,cy-r+16);G.closePath();G.fillStyle='#fff';G.fill();G.strokeStyle='#ff3ac8';G.lineWidth=2;G.stroke();}

function boucle(){if(!RAC)return;
 if(ETAT==='tourne'){ANG+=VIT;VIT*=.991;if(VIT<.004){VIT*=.97;}
  if(CIBLE!==null){
   /* angle voulu : le secteur gagnant sous le repère du haut (-PI/2) */
   const centre=(CIBLE+.5)/N*TAU;const vise=(-Math.PI/2-centre);
   const diff=((vise-ANG)%TAU+TAU)%TAU;
   if(VIT<.05){ANG+=diff*.12;if(Math.abs(diff)<.01&&VIT<.01){ANG=vise;ETAT='fini';arrive();}}
  }else if(VIT<.004){ETAT='pret';}}
 try{dessiner();}catch(x){}BOUCLE=requestAnimationFrame(boucle);}

function arrive(){vib([20,40,20,40,80]);GAIN=SECT[CIBLE]||0;
 try{e.jetons=(e.jetons||0);majHaut&&majHaut();}catch(x){}
 const gd=RAC.querySelector('.gain');gd.querySelector('.j').textContent='+'+GAIN;gd.classList.add('on');
 RAC.querySelector('.msg').textContent='Reviens demain pour un nouveau tour !';
 setTimeout(()=>{if(RAC)gd.classList.remove('on');},2600);
 majBouton();}

function majBouton(){const b=RAC.querySelector('.go'),m=RAC.querySelector('.msg');
 if(ETAT==='fini'||PROCHAIN>0){b.disabled=true;b.textContent=attente();}
 else{b.disabled=false;b.textContent='TOURNER';}}
function attente(){const s=Math.max(0,Math.floor(PROCHAIN));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h>0?('Revient dans '+h+'h'+(m<10?'0':'')+m):('Revient dans '+m+' min');}

async function tourner(){if(ETAT!=='pret')return;ETAT='tourne';VIT=.42+Math.random()*.08;CIBLE=null;
 RAC.querySelector('.go').disabled=true;RAC.querySelector('.msg').textContent='La roue tourne…';vib(12);
 let r=null;try{r=await rpcS('tourner_roue_du_jour',{});}catch(x){}
 if(!r||r.erreur){
  if(r&&r.erreur==='deja'){PROCHAIN=+r.prochain||0;ETAT='pret';VIT=0;RAC.querySelector('.msg').textContent='Tu as déjà tourné aujourd’hui.';majBouton();return;}
  ETAT='pret';VIT=0;RAC.querySelector('.msg').textContent='La roue est grippée, réessaie vite.';majBouton();return;}
 CIBLE=((r.secteur%N)+N)%N;PROCHAIN=+r.prochain||0;
 if(typeof r.jetons==='number'){e.jetons=r.jetons;try{sauver();}catch(x){}}
 /* on laisse la roue finir de tourner jusqu'à la cible dans la boucle */ }

async function etat(){let r=null;try{r=await rpcS('roue_du_jour_etat',{});}catch(x){}
 if(r&&!r.erreur){if(r.joue){PROCHAIN=+r.prochain||0;ETAT='fini';if(r.secteur!=null){CIBLE=((r.secteur%N)+N)%N;ANG=(-Math.PI/2-(CIBLE+.5)/N*TAU);}}
  else{PROCHAIN=0;ETAT='pret';}}
 majBouton();if(ETAT==='fini')RAC.querySelector('.msg').textContent='Déjà joué. '+attente();}

window.ouvrirRoueDisco=function(){if(RAC)return;
 if(!document.getElementById('rdcCss')){const s=document.createElement('style');s.id='rdcCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='rdc';RAC=d;
 d.innerHTML='<div class="tt"><b>La Roue Disco</b><small>UN TOUR GRATUIT PAR JOUR</small></div>'+
  '<button class="x" aria-label="Fermer">✕</button><canvas></canvas>'+
  '<div class="msg">Tente ta chance !</div><button class="go">TOURNER</button>'+
  '<div class="gain"><div class="j">+0</div><div class="l">JETONS</div></div>';
 document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');
 requestAnimationFrame(()=>d.classList.add('on'));window.ECRAN_COUVRANT=true;
 ANG=Math.random()*TAU;VIT=0;ETAT='pret';CIBLE=null;PROCHAIN=0;
 d.querySelector('.x').onclick=()=>{vib(8);fermer();};
 d.querySelector('.go').onclick=()=>tourner();
 BOUCLE=requestAnimationFrame(boucle);etat();
 /* le compte à rebours qui descend tout seul */
 d.rafra=setInterval(()=>{if(PROCHAIN>0){PROCHAIN-=1;if(ETAT!=='tourne')majBouton();}},1000);};

function fermer(){if(!RAC)return;const R0=RAC;RAC=null;window.ECRAN_COUVRANT=false;cancelAnimationFrame(BOUCLE);try{clearInterval(R0.rafra);}catch(x){}R0.classList.remove('on');setTimeout(()=>R0.remove(),250);}
})();
