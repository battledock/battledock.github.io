/* =====================================================================
   LA DISCO PARTY — le club des tenues folles et des danses.
   Ouvert depuis l'affiche de la place (affiches.js l'évalue sur place :
   il voit e, appelRPC, enEuros, personne, danseur, DANSES, DISCO_T,
   jouerDanse, musiqueDisco, DEF_AP, sauver, vibrer, monterEnLigne…).
   Un écran à lui, indépendant des boutiques de la galerie.
   Les tenues se portent (_disco), les danses se jouent depuis Mes émotes.
   ===================================================================== */
(()=>{
const TENUES=[
 ['disco_neon','Néon Roller','Rayures fluo qui clignotent, bandeau et patins à roulettes lumineux.',25000,0],
 ['disco_leopard','Funky Léopard','Combi léopard, afro XXL et lunettes rondes orange.',40000,0],
 ['disco_arc','Fièvre Arc-en-ciel','Haut arc-en-ciel, pattes d’eph blanches, afro coucher de soleil et lunettes étoiles.',60000,1],
 ['disco_paillettes','Paillettes Violettes','Combi pailletée qui scintille, boa de plumes blanches.',90000,1],
 ['disco_travolta','Saturday Night','Le costume blanc trois pièces, chemise rouge au col pelle à tarte, banane gominée.',150000,2],
 ['disco_lame','Lamé Or','Combi en lamé or qui ondule sous les spots, boa rose fuchsia, afro platine.',400000,2],
 ['disco_boule','La Boule à Facettes','Combi miroir à facettes qui renvoie la lumière, afro argent, lunettes étoiles.',1200000,3],
 ['disco_roi','Le Roi du Disco','Combi blanche cloutée d’or, col doré et grande cape étoilée.',3000000,3]];
const DZ=[
 ['dz_travolta','Le doigt vers le ciel, puis vers le sol. Le classique absolu.',8000,0],
 ['dz_poulet','Les ailes qui battent, les genoux pliés… cot cot codêêt !',12000,0],
 ['dz_twist','On descend, on remonte, on se tortille.',15000,0],
 ['dz_robot','Saccadé, bip boup. Tu es une machine.',25000,1],
 ['dz_kangourou','De grands bonds d’un côté à l’autre.',40000,1],
 ['dz_toupie','Tu tournes de plus en plus vite… jusqu’au tournis.',60000,2],
 ['dz_moonwalk','Tu marches en avant, tu glisses en arrière. Hee-hee !',120000,2],
 ['dz_fievre','La chorégraphie complète : spot, toupie, moonwalk, bonds et confettis.',500000,3]];
const TIERS=[['CLASSIQUE','#9aa0ac','#2a2440'],['RARE','#4ad8ff','#123a4e'],['PRESTIGE','#ff6ad8','#4a1440'],['LÉGENDE','#ffd24a','#4a3208']];
const DJ={peau:4,cheveux:1,coiffe:1,barbe:3,_pnj:true,_civil:true,_disco:'disco_boule'};
const PAROLES=['« Bienvenue au club ! Ici, on brille. »','« Essaie, la piste est à toi. »','« Ce soir, on danse jusqu’au bout de la nuit ! »','« Le Roi du Disco ? Une légende… »','« Avec ça, tout le port va te regarder. »'];
let RAC=null,ONG='t',SEL=null,ACHAT=false,BOUCLE=0,T0=0,DIR=0;
const vib=x=>{try{vibrer(x);}catch(_){}};
const aMoi=id=>{try{return !!(e.cos&&e.cos[id]);}catch(x){return false;}};
const porte=()=>{try{return (e.ap&&e.ap._disco)||null;}catch(x){return null;}};
const eu=v=>Number(v).toLocaleString('fr-FR')+' €';
const LISTE=()=>ONG==='t'?TENUES:DZ;
const art=id=>TENUES.find(a=>a[0]===id)||DZ.find(a=>a[0]===id);
const nomDe=a=>a[0].slice(0,3)==='dz_'?DANSES[a[0]].nom:a[1];
const base=()=>{const ap=Object.assign({},DEF_AP,e.ap||{});delete ap.deguisement;ap._pnj=true;return ap;};
function apEssai(){const ap=base();if(SEL&&SEL.slice(0,6)==='disco_')ap._disco=SEL;return ap;}
const CSS=`#dsc{position:fixed;inset:0;z-index:2147482300;display:flex;flex-direction:column;background:radial-gradient(120% 70% at 50% 0%,#3a1060,#12061e 70%);color:#f6efff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .2s}
#dsc.on{opacity:1}#dsc *{box-sizing:border-box}
#dsc .hd{flex:none;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 8px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,106,216,.35)}
#dsc .ti{flex:1;min-width:0}#dsc .ti b{display:block;font:900 30px/1 'Baloo 2',sans-serif;letter-spacing:1px;color:#fff;text-shadow:0 0 6px #ff3ac8,0 0 16px #ff3ac8,0 0 2px #fff;animation:dscN 2.6s infinite}
@keyframes dscN{0%,100%{text-shadow:0 0 6px #ff3ac8,0 0 16px #ff3ac8}50%{text-shadow:0 0 6px #3af0ff,0 0 18px #3af0ff}}
#dsc .ti small{display:block;font-size:9.5px;font-weight:800;letter-spacing:3px;color:#ffb8ec;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dsc .bo{flex:none;border:1px solid #ff6ad8;border-radius:999px;padding:3px 11px;font-weight:800;font-size:13px;background:rgba(0,0,0,.4);white-space:nowrap}
#dsc .x{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid #ff6ad8;background:rgba(0,0,0,.4);color:#fff;font:800 16px 'Baloo 2',sans-serif}
#dsc .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px calc(16px + env(safe-area-inset-bottom,0px))}
#dsc .sc{position:relative;height:300px;border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,106,216,.5),0 0 30px rgba(255,58,200,.25)}
#dsc .sc canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
#dsc .sc .bul{position:absolute;left:12px;right:12px;top:10px;background:rgba(255,250,255,.95);color:#2a0a30;border-radius:14px;padding:5px 10px;font-weight:700;font-size:13px;line-height:1.3;transition:opacity .2s}
#dsc .sc .px{position:absolute;right:12px;bottom:12px;border-radius:999px;padding:3px 12px;font-weight:800;font-size:15px;color:#2a0a30;background:linear-gradient(#fff2b8,#e8b838)}
#dsc .sc .px.ok{background:linear-gradient(#7ae09a,#2f8a4a);color:#fff}
#dsc .sc .rg{position:absolute;left:12px;bottom:12px;border-radius:999px;padding:2px 10px;font-weight:800;font-size:10.5px;letter-spacing:2px;border:1px solid currentColor;background:rgba(0,0,0,.5)}
#dsc .dtab{display:flex;gap:8px;margin-top:12px}#dsc .dtab button{flex:1;border:1px solid rgba(255,106,216,.5);background:rgba(0,0,0,.3);color:#ffd8f4;border-radius:14px;padding:8px;font:800 15px 'Baloo 2',sans-serif}
#dsc .dtab button.on{background:linear-gradient(#ff6ad8,#b81a98);color:#fff;border-color:#ffb8ec;box-shadow:0 0 14px rgba(255,58,200,.5)}
#dsc .nom{margin:12px 2px 0;font:900 22px/1.1 'Baloo 2',sans-serif;color:#fff}
#dsc .de{margin:2px 2px 0;font-weight:600;font-size:13px;color:rgba(255,230,250,.78);min-height:18px}
#dsc .pf{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
#dsc .pf button{position:relative;border:1px solid rgba(255,255,255,.14);background:linear-gradient(var(--tb),rgba(0,0,0,.4));border-radius:14px;padding:14px 2px 6px;font:800 11px/1.1 'Baloo 2',sans-serif;color:#f6efff;display:flex;flex-direction:column;align-items:center;gap:1px;overflow:hidden;min-height:112px}
#dsc .pf button .rb{position:absolute;top:0;left:0;right:0;height:12px;font-size:7.5px;letter-spacing:1.2px;font-weight:900;line-height:12px;color:#1a0a1a;background:var(--tc)}
#dsc .pf button canvas{image-rendering:pixelated;margin:2px 0}#dsc .pf button .ic{font-size:30px;line-height:58px;height:58px}
#dsc .pf button.on{border-color:#ff6ad8;box-shadow:0 0 0 2px #ff6ad8,0 0 16px rgba(255,58,200,.45)}
#dsc .pf button.leg{animation:dscL 2.4s ease-in-out infinite}@keyframes dscL{50%{box-shadow:0 0 16px rgba(255,210,80,.6)}}
#dsc .pf small{font-size:10.5px;font-weight:800;color:#ffd24a}#dsc .pf small.a{color:#7ae09a}
#dsc .pf .pt{position:absolute;bottom:3px;right:3px;font-size:8px;font-weight:900;background:#7ae09a;color:#0e2a14;border-radius:7px;padding:0 4px}
#dsc .go{display:block;width:100%;margin-top:14px;border:0;border-radius:18px;padding:12px;font:800 17px/1.1 'Baloo 2',sans-serif;color:#2a0a30;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 4px 0 #7a5214,0 10px 22px rgba(0,0,0,.35)}
#dsc .go small{display:block;font-size:12px;opacity:.8;font-weight:700}#dsc .go:active{transform:translateY(3px);box-shadow:0 1px 0 #7a5214}
#dsc .go.vert{background:linear-gradient(#8ae8a8,#2f8a4a);color:#fff;box-shadow:0 4px 0 #1e5e30}#dsc .go.rose{background:linear-gradient(#ff9ae4,#d8209a);color:#fff;box-shadow:0 4px 0 #7a0a5a}#dsc .go[disabled]{opacity:.5}
#dsc .doc{display:block;width:100%;margin-top:8px;border:1px solid rgba(255,106,216,.45);background:rgba(0,0,0,.3);border-radius:14px;padding:8px;font:800 13px 'Baloo 2',sans-serif;color:#f6efff}
@media(min-width:720px){#dsc .corps{max-width:680px;margin:0 auto;width:100%}}`;
function bulle(t){const b=RAC&&RAC.querySelector('.bul');if(!b)return;b.style.opacity='0';setTimeout(()=>{b.textContent=t;b.style.opacity='1';},180);}
/* LA PISTE : dalles qui s'allument au rythme, boule à facettes, faisceaux, et toi au milieu */
function scene(){if(!RAC)return;const cv=RAC.querySelector('.sc canvas');const W=cv.clientWidth||360,H=cv.clientHeight||300,D=Math.min(2,window.devicePixelRatio||1);
 if(cv.width!==Math.round(W*D)){cv.width=Math.round(W*D);cv.height=Math.round(H*D);}const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
 const t=(performance.now()-T0)/1000,beat=Math.floor(t/BEAT),sol=H-96;
 g.fillStyle='#14061e';g.fillRect(0,0,W,H);
 for(let k=0;k<5;k++){const a=Math.sin(t*.7+k*1.3)*.5,h=(k*70+t*40)%360;g.fillStyle='hsla('+h+',100%,65%,.13)';g.beginPath();g.moveTo(W*(.1+k*.2),0);g.lineTo(W*(.1+k*.2)+Math.sin(a)*W*.9-24,sol+40);g.lineTo(W*(.1+k*.2)+Math.sin(a)*W*.9+24,sol+40);g.fill();}
 const bx=W/2,by=40;g.strokeStyle='#8a8aa0';g.lineWidth=1;g.beginPath();g.moveTo(bx,0);g.lineTo(bx,by-18);g.stroke();
 for(let y=-18;y<18;y+=4)for(let x=-18;x<18;x+=4){if(x*x+y*y>18*18)continue;const v=DH(Math.floor(x+t*8)&63,y,beat%4);g.fillStyle=v<.15?'#ffffff':v<.5?'#c8ccdc':'#7a7e94';g.fillRect(bx+x,by+y,3.4,3.4);}
 for(let k=0;k<26;k++){const a=k*2.4+t*.6,r=60+DH(k,1,1)*W*.6;const x=bx+Math.cos(a)*r,y=by+40+Math.abs(Math.sin(a*1.7))*(sol-20);g.fillStyle='rgba(255,255,255,'+(.25+.5*DH(k,beat,2))+')';g.fillRect(x,y,2,2);}
 const C=['#ff3ac8','#3af0ff','#ffd23a','#7aff6a','#b86aff'];for(let r=0;r<4;r++){const y0=sol+r*24,y1=y0+24,w0=W*(.7+r*.1),w1=W*(.8+r*.1);for(let c=0;c<7;c++){const on=DH(c,r,beat)<.45;
   const xa=W/2-w0/2+c*w0/7,xb=W/2-w0/2+(c+1)*w0/7,xc=W/2-w1/2+(c+1)*w1/7,xd=W/2-w1/2+c*w1/7;g.fillStyle=on?C[(c+r+beat)%5]:'#22102e';g.globalAlpha=on?.85:1;g.beginPath();g.moveTo(xa,y0+1);g.lineTo(xb-1,y0+1);g.lineTo(xc-1,y1);g.lineTo(xd,y1);g.fill();g.globalAlpha=1;}}
 /* le DJ, derrière ses platines */
 const S=2.2;g.save();g.translate(W-58,sol+2);g.scale(S,S);try{danseur(g,0,0,DJ,'dz_travolta',t%8);}catch(x){}g.restore();g.fillStyle='#2a2238';g.fillRect(W-92,sol-6,68,30);g.fillStyle='#ff3ac8';g.fillRect(W-92,sol-6,68,3);
 for(const px of [W-80,W-48]){g.fillStyle='#111';g.beginPath();g.arc(px,sol+6,9,0,7);g.fill();g.save();g.translate(px,sol+6);g.rotate(t*6);g.fillStyle='#ffd23a';g.fillRect(-1,-8,2,4);g.restore();}
 /* toi, au milieu de la piste */
 const sc=3.2,ap=apEssai(),k=(SEL&&SEL.slice(0,3)==='dz_')?SEL:'dz_travolta',Dz=DANSES[k];g.save();g.translate(W/2,sol+44);g.scale(sc,sc);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,1,9,2.4,0,0,7);g.fill();
 try{if(SEL&&SEL.slice(0,6)==='disco_'&&Math.floor(t/5)%2)personne(g,0,0,ap,['bas','droite','haut','gauche'][Math.floor(t/1.2)%4],0,false);else danseur(g,0,0,ap,k,t%(Dz.D+.6));}catch(x){}g.restore();}
function vignetteTenue(cv,id){const DPR=Math.max(1,window.devicePixelRatio||1),s=Math.max(1,Math.round(1.25*DPR));cv.width=30*s;cv.height=58*s;cv.style.width=(30*s/DPR)+'px';cv.style.height=(58*s/DPR)+'px';
 const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,0,0);try{personne(g,15,54,Object.assign(base(),{_disco:id}),'bas',0,false);}catch(x){}}
function rendre(){if(!RAC)return;RAC.querySelector('.bo').textContent=enEuros(e.euros||0);
 RAC.querySelectorAll('.dtab button').forEach(b=>b.classList.toggle('on',b.dataset.o===ONG));
 const A=SEL&&art(SEL);RAC.querySelector('.nom').textContent=A?nomDe(A):(ONG==='t'?'Les tenues':'Les danses');
 RAC.querySelector('.de').textContent=A?A[ONG==='t'?2:1]:(ONG==='t'?'Touche une tenue : tu l’essaies sur la piste.':'Touche une danse : tu la vois tout de suite.');
 const px=RAC.querySelector('.px'),rg=RAC.querySelector('.rg');if(!A){px.style.display=rg.style.display='none';}else{px.style.display=rg.style.display='block';const T=TIERS[A[A.length-1]];rg.textContent=T[0];rg.style.color=T[1];
  if(aMoi(SEL)){px.className='px ok';px.textContent=porte()===SEL?'Portée ✓':'À toi ✓';}else{px.className='px';px.textContent=eu(A[A.length-2]);}}
 const G=RAC.querySelector('.pf');G.innerHTML='';LISTE().forEach(a=>{const T=TIERS[a[a.length-1]],b=document.createElement('button'),id=a[0];b.className=(id===SEL?'on ':'')+(a[a.length-1]>=3?'leg':'');b.style.setProperty('--tb',T[2]);b.style.setProperty('--tc',T[1]);
  b.insertAdjacentHTML('beforeend','<span class="rb">'+T[0]+'</span>');
  if(ONG==='t'){const cv=document.createElement('canvas');b.appendChild(cv);vignetteTenue(cv,id);}else b.insertAdjacentHTML('beforeend','<span class="ic">'+DANSES[id].ic+'</span>');
  b.insertAdjacentHTML('beforeend',nomDe(a).replace(/^(Le |La |L’)/,'')+(aMoi(id)?'<small class="a">À toi ✓</small>':'<small>'+eu(a[a.length-2])+'</small>')+(porte()===id?'<span class="pt">PORTÉE</span>':''));
  b.onclick=()=>{SEL=id;T0=performance.now();vib(8);if(Math.random()<.3)bulle(PAROLES[Math.floor(Math.random()*PAROLES.length)]);rendre();};G.appendChild(b);});
 const go=RAC.querySelector('.go'),doc=RAC.querySelector('.doc');go.disabled=false;go.className='go';doc.style.display=(ONG==='t'&&porte())?'block':'none';
 if(!A){go.innerHTML=ONG==='t'?'Choisis une tenue<small>tu l’essaies sur la piste</small>':'Choisis une danse<small>tu la vois tout de suite</small>';go.disabled=true;return;}
 const prix=A[A.length-2]*100;
 if(!aMoi(SEL)){go.innerHTML='Acheter · '+eu(A[A.length-2])+'<small>il te restera '+enEuros(Math.max(0,(e.euros||0)-prix))+'</small>';if((e.euros||0)<prix){go.innerHTML='Il te manque '+eu(Math.ceil((prix-(e.euros||0))/100))+'<small>'+eu(A[A.length-2])+' pour celle-ci</small>';go.disabled=true;}}
 else if(ONG==='d'){go.className='go rose';go.innerHTML='Danser maintenant 🪩<small>elle est aussi dans Mes émotes</small>';}
 else if(porte()===SEL){go.innerHTML='Tu la portes<small>choisis-en une autre pour changer</small>';go.disabled=true;}
 else{go.className='go vert';go.innerHTML='La porter<small>elle est déjà à toi</small>';}}
function porter(id){e.ap=Object.assign({},e.ap||{});if(id)e.ap._disco=id;else delete e.ap._disco;try{sauver();}catch(x){}try{monterEnLigne(true);}catch(x){}}
async function caisse(){if(ACHAT||!SEL)return;const A=art(SEL),go=RAC.querySelector('.go'),dz=SEL.slice(0,3)==='dz_';
 if(aMoi(SEL)){if(dz){const k=SEL;fermer();setTimeout(()=>{try{jouerDanse(k);}catch(x){}},250);return;}porter(SEL);vib([10,30,10]);bulle('« Waouh. La piste est à toi. »');rendre();return;}
 if((e.euros||0)<A[A.length-2]*100){bulle('« Reviens avec un peu plus de monnaie ! »');vib(30);return;}
 ACHAT=true;go.disabled=true;go.innerHTML='…';
 const r=await appelRPC('acheter_cosmetique',{p_joueur:e.id,p_piece:SEL});ACHAT=false;
 if(!r||r.erreur){bulle(r&&r.erreur==='pas_assez'?'« Il te manque de quoi payer. »':r&&r.erreur==='piece inconnue'?'« Celle-là arrive très bientôt ! »':'« La caisse fait des siennes, réessaie. »');rendre();return;}
 if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}e.cos=Object.assign({},e.cos||{},{[SEL]:true});
 if(!dz){porter(SEL);bulle('« Elle te va trop bien. Tu la portes déjà ! »');}else bulle('« Apprise ! Elle est dans Mes émotes. »');vib([14,30,14]);rendre();}
function fermer(){if(!RAC)return;const R0=RAC;RAC=null;cancelAnimationFrame(BOUCLE);try{musiqueDisco(false);}catch(x){}window.ECRAN_COUVRANT=false;R0.classList.remove('on');setTimeout(()=>R0.remove(),220);}
window.ouvrirDisco=function(){if(RAC)return;try{if(window.fermerLesAffiches)window.fermerLesAffiches();}catch(x){}
 if(!document.getElementById('dscCss')){const s=document.createElement('style');s.id='dscCss';s.textContent=CSS;document.head.appendChild(s);}
 ONG='t';SEL=porte();T0=performance.now();const d=document.createElement('div');d.id='dsc';RAC=d;
 d.innerHTML='<div class="hd"><div class="ti"><b>Disco Party</b><small>TENUES FOLLES · DANSES · TOUS LES SOIRS</small></div><div class="bo"></div><button class="x" aria-label="Fermer">✕</button></div>'+
  '<div class="corps"><div class="sc"><canvas></canvas><div class="bul">'+PAROLES[0]+'</div><div class="rg"></div><div class="px"></div></div>'+
  '<div class="dtab"><button data-o="t">👗 Tenues</button><button data-o="d">💃 Danses</button></div><div class="nom"></div><div class="de"></div><div class="pf"></div><button class="go"></button><button class="doc">Ranger · remettre mes habits</button></div>';
 document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},230);
 d.querySelector('.x').onclick=()=>{vib(8);fermer();};d.querySelector('.go').onclick=caisse;
 d.querySelector('.doc').onclick=()=>{porter(null);if(SEL&&SEL.slice(0,6)==='disco_')SEL=null;vib(8);bulle('« Rangée. Reviens briller quand tu veux. »');rendre();};
 d.querySelectorAll('.dtab button').forEach(b=>b.onclick=()=>{ONG=b.dataset.o;SEL=ONG==='t'?porte():null;T0=performance.now();vib(8);rendre();});
 rendre();try{musiqueDisco(true);}catch(x){}
 const boucle=()=>{if(!RAC)return;try{scene();}catch(x){}BOUCLE=requestAnimationFrame(boucle);};BOUCLE=requestAnimationFrame(boucle);
 try{if(typeof lireMesCosmetiques==='function')lireMesCosmetiques().then(()=>{if(RAC)rendre();}).catch(()=>{});}catch(x){}};
})();
