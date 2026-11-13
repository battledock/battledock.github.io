/* =====================================================================
   LES BOUTIQUES DE LA GALERIE BLEUE — bijouterie, opticien, sneakers,
   et le café. Un écran à part, chargé à la demande quand on pousse une
   porte (terrasses.js l'évalue sur place : il voit e, appelRPC, enEuros,
   personne, DEF_AP, sauver, vibrer, monterEnLigne…).

   Les pièces sont des cosmétiques du serveur (acheter_cosmetique) : on
   les achète une fois, on les porte ou on les range quand on veut.
   Au café, on consomme (cafe_commander) : la tasse reste en main un moment.
   ===================================================================== */
(()=>{
const BOUTIQUES={
  bijou:{nom:'L’Heure Bleue',sous:'BIJOUTERIE · HORLOGERIE · DEPUIS 1962',cle:'_bij',c1:'#1e1e2a',c2:'#0e0e16',or:'#e0b860',clair:'#2a2a3a',fond:'bijou',
    vendeur:{peau:1,cheveux:6,coiffe:10,barbe:0,haut:2,veste:20,bas:0,pantalon:9,souliers:0,chaussures:1,sac:0,chapeau:0,raye:0,motif:0,_pnj:true,_bij:'bij_chaine_or'},
    paroles:['« Une montre, ça se transmet. »','« L’or ne ment jamais, mon petit. »','« Regarde comme ça brille sous les spots. »','« Ici, on vend du temps. Le plus beau. »'],
    articles:[['bij_montre_acier','Montre acier','Bracelet maille, cadran bleu nuit.',80],['bij_chaine_argent','Chaîne argent','Maille fine, discrète.',150],['bij_montre_plongee','Montre de plongée','Étanche à 300 m, lunette tournante.',400],
      ['bij_chaine_or','Chaîne or','Dix-huit carats, maille forçat.',600],['bij_montre_or','Montre or','Le cadran qui fait tourner les têtes.',1200],['bij_grosse_chaine','La grosse chaîne','Avec le médaillon. Pour les patrons du port.',3500]]},
  lunettes:{nom:'Optique du Vieux-Port',sous:'OPTICIEN · LUNETTES DE SOLEIL',cle:'_lun',c1:'#1f6a6a',c2:'#124a4a',or:'#e8dcb0',clair:'#2a8a8a',fond:'lunettes',
    vendeur:{peau:3,cheveux:2,coiffe:4,barbe:0,haut:2,veste:19,bas:0,pantalon:8,souliers:0,chaussures:1,sac:0,chapeau:0,raye:0,motif:0,_pnj:true,_lun:'lun_rondes'},
    paroles:['« Le soleil de Marseille, ça ne pardonne pas. »','« Essaie, le miroir est là pour ça. »','« Celles-là, c’est le style du Vieux-Port. »','« Avec ça, tu vois la mer en plus bleu. »'],
    articles:[['lun_noires','Noires','Le classique, verres fumés.',30],['lun_rouges','Rouges','Monture rouge, pour se faire remarquer.',50],['lun_rondes','Rondes','Monture dorée, verres ronds.',70],
      ['lun_aviateur','Aviateur','Comme les pilotes de Marignane.',120],['lun_miroir','Miroir','Verres miroir bleu ciel.',200],['lun_or','Or','Monture en or. Rien que ça.',600]]},
  sneakers:{nom:'Sneakers 13',sous:'BASKETS · ÉDITIONS LIMITÉES',cle:'_snk',c1:'#e8602a',c2:'#b8401a',or:'#fff0d0',clair:'#f08a4a',fond:'sneakers',
    vendeur:{peau:5,cheveux:0,coiffe:1,barbe:1,haut:1,veste:21,bas:1,pantalon:9,souliers:1,chaussures:6,sac:0,chapeau:1,raye:0,motif:0,_pnj:true,_snk:'snk_fluo'},
    paroles:['« Wesh, celles-là elles sont propres ! »','« Édition limitée, y en aura pas pour tout le monde. »','« Avec ça, tu glisses sur le quai. »','« Le blanc, c’est intemporel. »'],
    articles:[['snk_blanches','Blanches','Toutes blanches, à garder propres.',60],['snk_noires','Noires','Discrètes, passe-partout.',60],['snk_rouges','Rouges','Le rouge du drapeau de la ville.',90],
      ['snk_bleues','Bleues','Bleu ciel et blanc. Allez l’OM.',90],['snk_fluo','Fluo','On te voit de l’autre bout du port.',150],['snk_or','Or','La paire en or. Une légende.',900]]}};
const CAFE=[['expresso','Expresso','Serré, à la marseillaise.',2,'☕'],['croissant','Croissant','Pur beurre, encore tiède.',2.5,'🥐'],['chocolat','Chocolat chaud','Avec de la chantilly.',3.5,'🍫'],
  ['jus','Jus d’orange','Pressé devant toi.',4,'🍊'],['glace','Glace','Deux boules, framboise et vanille.',4.5,'🍨'],['crepe','Crêpe','Au sucre, ou au chocolat.',5.5,'🥞']];
let RACINE=null,B=null,SEL=null,DIR=0,ACHAT=false;const DIRS=['bas','droite','haut','gauche'];
const vib=x=>{try{vibrer&&vibrer(x);}catch(_){}};
const aMoi=id=>{try{return !!(e.cos&&e.cos[id]);}catch(x){return false;}};
const porte=()=>{try{return (e.ap&&e.ap[B.cle])||null;}catch(x){return null;}};
function dessinePerso(cv,ap,taille,dir){const NW=40,NH=66,DPR=Math.max(1,window.devicePixelRatio||1);const s=Math.max(1,Math.round(taille*DPR));
  if(cv.width!==NW*s){cv.width=NW*s;cv.height=NH*s;cv.style.width=(NW*s/DPR)+'px';cv.style.height=(NH*s/DPR)+'px';}
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(s,0,0,s,0,0);personne(g,NW/2,NH-4,ap,dir||'bas',0,false);g.setTransform(1,0,0,1,0,0);}
/* la vignette : on cadre la zone de l'objet */
const ZONE={_bij:[6,22,28,22],_lun:[9,14,22,14],_snk:[9,56,22,8]};
function vignette(cv,ap){const DPR=Math.max(1,window.devicePixelRatio||1),[sx,sy,w,h]=ZONE[B.cle],s=Math.max(1,Math.round(2.4*DPR*(B.cle==='_snk'?1.3:B.cle==='_lun'?1.4:1)));
  cv.width=w*s;cv.height=h*s;cv.style.width=(w*s/DPR)+'px';cv.style.height=(h*s/DPR)+'px';
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,-sx*s,-sy*s);personne(g,20,62,ap,'bas',0,false);g.setTransform(1,0,0,1,0,0);}
const base=()=>{const ap=Object.assign({},DEF_AP,e.ap||{});delete ap.deguisement;return ap;};
function apEssai(){const ap=base();if(SEL)ap[B.cle]=SEL;else delete ap[B.cle];ap._pnj=true;return ap;}

const CSS=`#gal{position:fixed;inset:0;z-index:5;display:flex;flex-direction:column;background:#f4efe4;color:#1b2a44;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#gal *{box-sizing:border-box}
#gal .hd{flex:none;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px;background:linear-gradient(var(--c1),var(--c2));border-bottom:3px solid var(--or)}
#gal .l1{display:flex;align-items:center;gap:8px}#gal .ens{flex:1;min-width:0}
#gal .ens b{display:block;font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:24px;color:#fff6e0;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.25)}
#gal .ens small{display:block;font-size:10px;font-weight:800;letter-spacing:2px;color:var(--or);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gal .bo{flex:none;border:1.5px solid var(--or);color:#fff2c8;border-radius:14px;padding:2px 10px;font-weight:800;font-size:13px;background:rgba(0,0,0,.2);white-space:nowrap}
#gal .x{flex:none;width:38px;height:38px;border-radius:12px;border:1.5px solid var(--or);background:rgba(0,0,0,.2);color:#fff2c8;font:800 17px 'Baloo 2',sans-serif}
#gal .pat{display:flex;gap:10px;align-items:flex-end;margin-top:8px}#gal .pat canvas{flex:none;image-rendering:pixelated}
#gal .bul{flex:1;min-width:0;position:relative;background:#fffaf0;color:#1b2a44;border-radius:14px;padding:5px 10px;font-weight:700;font-size:13px;line-height:1.3;transition:opacity .2s}
#gal .bul:before{content:'';position:absolute;left:-8px;bottom:10px;border:8px solid transparent;border-right-color:#fffaf0;border-left:0}
#gal .store{flex:none;height:12px;background:repeating-linear-gradient(90deg,var(--c1) 0 14px,#f2e8d2 14px 28px);box-shadow:0 3px 4px rgba(0,0,0,.12)}
#gal .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px calc(16px + env(safe-area-inset-bottom,0px))}
#gal .sc{position:relative;height:232px;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 2px #e2d6be}
#gal .sc canvas.fond{position:absolute;inset:0;width:100%;height:100%}
#gal .sc canvas.perso{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);image-rendering:pixelated}
#gal .sc .px{position:absolute;right:12px;top:10px;background:var(--c1);color:#fff2c8;border-radius:12px;padding:2px 10px;font-weight:800;font-size:15px;box-shadow:0 2px 0 rgba(0,0,0,.3)}
#gal .sc .px.ok{background:#2f8a4a;color:#fff;box-shadow:0 2px 0 #1e5e30}
#gal .sc .tr{position:absolute;bottom:14px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#1b2a44;font:800 18px 'Baloo 2',sans-serif;box-shadow:0 2px 0 rgba(0,0,0,.15)}
#gal .sc .tr.g{left:12px}#gal .sc .tr.d{right:12px}
#gal .lb{font-size:11px;font-weight:800;letter-spacing:2px;color:#8a7a5a;margin:12px 2px 6px;display:flex;justify-content:space-between}
#gal .pf{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#gal .pf button{position:relative;border:2px solid #e2d6be;background:#fff;border-radius:14px;padding:6px 4px 7px;font:800 12.5px 'Baloo 2',sans-serif;color:#1b2a44;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.15}
#gal .pf button .vi{width:100%;height:58px;border-radius:10px;background:#f6f1e6;display:grid;place-items:center;font-size:30px}
#gal .pf button canvas{image-rendering:pixelated}
#gal .pf button.on{border-color:var(--c1);background:#fbf7ee;box-shadow:0 0 0 2px var(--or)}
#gal .pf small{font-size:11.5px;font-weight:800;color:#a07a30}#gal .pf small.a{color:#2f8a4a}
#gal .pf .pt{position:absolute;top:4px;left:4px;font-size:9.5px;font-weight:800;background:var(--c1);color:#fff;border-radius:7px;padding:0 5px}
#gal .de{margin:10px 2px 0;font-weight:700;font-size:13px;color:#5a4a3a;min-height:18px}
#gal .go{display:block;width:100%;margin-top:12px;border:0;border-radius:16px;padding:11px;font:800 17px 'Baloo 2',sans-serif;color:#fff;background:linear-gradient(var(--clair),var(--c1));box-shadow:0 4px 0 var(--c2);line-height:1.1}
#gal .go small{display:block;font-size:12px;opacity:.85;font-weight:700}#gal .go:active{transform:translateY(3px);box-shadow:0 1px 0 var(--c2)}
#gal .go.vert{background:linear-gradient(#4cc070,#2f8a4a);box-shadow:0 4px 0 #1e5e30}#gal .go[disabled]{opacity:.55}
#gal .doc{display:block;width:100%;margin-top:8px;border:2px solid #d8c8a4;background:#fff;border-radius:14px;padding:7px;font:800 13px 'Baloo 2',sans-serif;color:#1b2a44}
@media(min-width:720px){#gal .corps{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-content:start;padding:14px 24px}#gal .sc{height:auto;min-height:340px;grid-row:1/span 8}}`;
function css(){if(!document.getElementById('galCss')){const s=document.createElement('style');s.id='galCss';s.textContent=CSS;document.head.appendChild(s);}}
function bulle(t){const b=RACINE&&RACINE.querySelector('.bul');if(!b)return;b.style.opacity='0';setTimeout(()=>{b.textContent=t;b.style.opacity='1';},180);}

/* LE FOND DE LA SCÈNE, selon la boutique */
function dessineFond(cv,k){const W=cv.clientWidth||380,H=cv.clientHeight||232,D=Math.min(2,window.devicePixelRatio||1);cv.width=W*D;cv.height=H*D;const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);
  const sol=H-58,R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};let gr;
  if(k==='bijou'){gr=g.createLinearGradient(0,0,0,sol);gr.addColorStop(0,'#2a2a38');gr.addColorStop(1,'#1a1a24');g.fillStyle=gr;g.fillRect(0,0,W,sol);
    for(let x=0;x<W;x+=40)R(x,0,1,sol,'rgba(255,220,150,.06)');
    /* les vitrines de velours, les bijoux qui brillent */
    for(const [x0,x1] of [[12,W*.5-60],[W*.5+60,W-12]]){R(x0,sol-70,x1-x0,62,'#c8a050');R(x0+3,sol-67,x1-x0-6,56,'#5a1a2a');
      for(let i=0;i<8;i++){const x=x0+12+i*((x1-x0-24)/7),y=sol-50+(i%2)*16;g.strokeStyle=i%3?'#f2c84a':'#dfe3ea';g.lineWidth=1.6;g.beginPath();g.arc(x,y,5,0,7);g.stroke();g.fillStyle='#fff';g.fillRect(x-1,y-6,2,2);}
      g.fillStyle='rgba(200,230,255,.18)';g.fillRect(x0+3,sol-67,x1-x0-6,20);}
    for(let i=0;i<5;i++){const x=W*(.15+i*.18);R(x-1,0,2,10,'#8a8e94');g.fillStyle='rgba(255,236,190,.22)';g.beginPath();g.moveTo(x-3,10);g.lineTo(x+3,10);g.lineTo(x+26,sol);g.lineTo(x-26,sol);g.fill();}
    R(0,sol-4,W,6,'#c8a050');gr=g.createLinearGradient(0,sol,0,H);gr.addColorStop(0,'#3a2a2a');gr.addColorStop(1,'#241818');g.fillStyle=gr;g.fillRect(0,sol+2,W,H-sol);
    g.fillStyle='#7a1a2a';g.beginPath();g.ellipse(W/2,H-32,68,14,0,0,7);g.fill();g.strokeStyle='#e0b860';g.lineWidth=2;g.beginPath();g.ellipse(W/2,H-32,58,10,0,0,7);g.stroke();}
  else if(k==='lunettes'){gr=g.createLinearGradient(0,0,0,sol);gr.addColorStop(0,'#eef6f4');gr.addColorStop(1,'#d6e8e4');g.fillStyle=gr;g.fillRect(0,0,W,sol);
    /* les présentoirs muraux, couverts de montures */
    for(const [x0,x1] of [[14,W*.5-62],[W*.5+62,W-14]]){R(x0,18,x1-x0,sol-40,'#ffffff');R(x0,18,x1-x0,2,'#1f6a6a');
      for(let r=0;r<5;r++)for(let i=0;i<4;i++){const x=x0+12+i*((x1-x0-24)/3),y=34+r*22,c=['#141418','#d8302a','#b8862a','#2a6ad8','#c8ccd6'][(r+i)%5];g.strokeStyle=c;g.lineWidth=1.8;g.strokeRect(x-9,y-3,7,5);g.strokeRect(x+2,y-3,7,5);g.beginPath();g.moveTo(x-2,y-1);g.lineTo(x+2,y-1);g.stroke();}}
    /* le grand miroir rond */
    g.fillStyle='#1f6a6a';g.beginPath();g.arc(W/2,70,40,0,7);g.fill();gr=g.createLinearGradient(W/2-36,34,W/2+36,106);gr.addColorStop(0,'#f4fbff');gr.addColorStop(1,'#a8c8d8');g.fillStyle=gr;g.beginPath();g.arc(W/2,70,36,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(W/2-20,44);g.lineTo(W/2-8,44);g.lineTo(W/2-28,92);g.lineTo(W/2-36,82);g.fill();
    R(0,sol-4,W,6,'#1f6a6a');gr=g.createLinearGradient(0,sol,0,H);gr.addColorStop(0,'#e8e0d0');gr.addColorStop(1,'#d0c4ae');g.fillStyle=gr;g.fillRect(0,sol+2,W,H-sol);
    for(let x=0;x<W;x+=24)R(x,sol+2,1,H-sol,'rgba(0,0,0,.06)');
    g.fillStyle='#2a8a8a';g.beginPath();g.ellipse(W/2,H-32,68,14,0,0,7);g.fill();g.strokeStyle='#e8dcb0';g.lineWidth=2;g.beginPath();g.ellipse(W/2,H-32,58,10,0,0,7);g.stroke();}
  else if(k==='sneakers'){gr=g.createLinearGradient(0,0,0,sol);gr.addColorStop(0,'#3a3a44');gr.addColorStop(1,'#2a2a32');g.fillStyle=gr;g.fillRect(0,0,W,sol);
    for(let y=0;y<sol;y+=16)for(let x=(y/16%2)*16;x<W;x+=32)R(x,y,15,15,'rgba(255,255,255,.03)');
    /* le mur de baskets, posées sur des tablettes lumineuses */
    const C=['#f4f2ec','#1c1c22','#d8302a','#2a6ad8','#b8f03a','#e8b830','#f07aa0','#7a3ab8'];
    for(const [x0,x1] of [[12,W*.5-56],[W*.5+56,W-12]])for(let r=0;r<5;r++){const y=26+r*24;R(x0,y+8,x1-x0,2,'#f6f2e8');g.fillStyle='rgba(255,240,200,.25)';g.fillRect(x0,y+10,x1-x0,6);
      for(let i=0;i<3;i++){const x=x0+8+i*((x1-x0-16)/2.6),c=C[(r*3+i)%C.length];g.fillStyle=c;g.beginPath();g.moveTo(x,y+8);g.lineTo(x,y+2);g.quadraticCurveTo(x+4,y-1,x+8,y+2);g.lineTo(x+16,y+4);g.quadraticCurveTo(x+19,y+6,x+18,y+8);g.fill();R(x,y+6,18,2,'#ffffff');}}
    g.save();g.shadowColor='#ff8a3a';g.shadowBlur=12;g.fillStyle='#ffb070';g.font='900 22px "Arial Black",Arial,sans-serif';g.textAlign='center';g.fillText('13',W/2,58);g.restore();
    R(0,sol-4,W,6,'#e8602a');gr=g.createLinearGradient(0,sol,0,H);gr.addColorStop(0,'#5a5a64');gr.addColorStop(1,'#3a3a44');g.fillStyle=gr;g.fillRect(0,sol+2,W,H-sol);
    g.fillStyle='#e8602a';g.beginPath();g.ellipse(W/2,H-32,68,14,0,0,7);g.fill();g.strokeStyle='#fff0d0';g.lineWidth=2;g.beginPath();g.ellipse(W/2,H-32,58,10,0,0,7);g.stroke();}
  gr=g.createRadialGradient(W/2,40,0,W/2,sol-40,150);gr.addColorStop(0,'rgba(255,236,190,.35)');gr.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);}

function rendreScene(){if(!RACINE)return;dessinePerso(RACINE.querySelector('canvas.perso'),apEssai(),2.6,DIRS[DIR]);
  const px=RACINE.querySelector('.sc .px'),A=B.articles.find(a=>a[0]===SEL);
  if(!A){px.style.display='none';}else{px.style.display='block';if(aMoi(SEL)){px.className='px ok';px.textContent=porte()===SEL?'Porté ✓':'À toi ✓';}else{px.className='px';px.textContent=A[3]+' €';}}}
function rendreRayon(){const G=RACINE.querySelector('.pf');G.innerHTML='';const ap0=base();
  B.articles.forEach(a=>{const b=document.createElement('button');if(a[0]===SEL)b.className='on';
    const vi=document.createElement('div');vi.className='vi';const cv=document.createElement('canvas');vi.appendChild(cv);b.appendChild(vi);
    vignette(cv,Object.assign({},ap0,{[B.cle]:a[0],_pnj:true}));
    b.insertAdjacentHTML('beforeend',a[1]+(aMoi(a[0])?'<small class="a">À toi ✓</small>':'<small>'+a[3]+' €</small>')+(porte()===a[0]?'<span class="pt">PORTÉ</span>':''));
    b.onclick=()=>{SEL=a[0];vib(8);if(Math.random()<.35)bulle(B.paroles[Math.floor(Math.random()*B.paroles.length)]);rendreTout();};G.appendChild(b);});}
function rendreCaisse(){const b=RACINE.querySelector('.go'),A=B.articles.find(a=>a[0]===SEL);RACINE.querySelector('.bo').textContent=enEuros(e.euros||0);b.disabled=false;b.className='go';
  RACINE.querySelector('.de').textContent=A?A[2]:'Touche un article : tu l’essaies tout de suite.';
  if(!A){b.innerHTML='Choisis un article<small>tu l’essaies sur toi</small>';b.disabled=true;}
  else if(!aMoi(SEL)){b.innerHTML='Acheter · '+A[3]+' €<small>il te restera '+enEuros(Math.max(0,(e.euros||0)-A[3]*100))+'</small>';if((e.euros||0)<A[3]*100){b.innerHTML='Il te manque '+enEuros(A[3]*100-(e.euros||0))+'<small>'+A[3]+' € pour celui-ci</small>';b.disabled=true;}}
  else if(porte()===SEL){b.innerHTML='Tu le portes<small>choisis-en un autre pour changer</small>';b.disabled=true;}
  else{b.className='go vert';b.innerHTML='Le porter<small>il est déjà à toi</small>';}
  RACINE.querySelector('.doc').style.display=porte()?'block':'none';}
function rendreTout(){if(!RACINE)return;rendreScene();rendreRayon();rendreCaisse();}
function porter(id){e.ap=Object.assign({},e.ap||{});if(id)e.ap[B.cle]=id;else delete e.ap[B.cle];try{sauver();}catch(x){}try{monterEnLigne(true);}catch(x){}}
async function caisse(){if(ACHAT||!SEL)return;const A=B.articles.find(a=>a[0]===SEL),b=RACINE.querySelector('.go');
  if(aMoi(SEL)){porter(SEL);vib([10,30,10]);bulle('« Ça te va très bien. »');rendreTout();return;}
  if((e.euros||0)<A[3]*100){bulle('« Reviens quand t’auras fait quelques shifts. »');vib(30);return;}
  ACHAT=true;b.disabled=true;b.innerHTML='…';
  const r=await appelRPC('acheter_cosmetique',{p_joueur:e.id,p_piece:SEL});ACHAT=false;
  if(!r||r.erreur){bulle(r&&r.erreur==='pas_assez'?'« Il te manque de quoi payer. »':r&&r.erreur==='piece inconnue'?'« Celui-là arrive bientôt en rayon. »':'« La caisse fait des siennes, réessaie. »');rendreTout();return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}e.cos=Object.assign({},e.cos||{},{[SEL]:true});
  porter(SEL);vib([14,30,14]);bulle('« Bon choix ! Tu le portes déjà. »');rendreTout();}
function fermer(){if(!RACINE)return;RACINE=null;try{fermeA=Date.now();}catch(x){}try{$('page2').classList.remove('on');}catch(x){}}
function cadre(T,corps){css();$('page2Fond').className='';$('page2').classList.add('on');
  $('page2Fond').innerHTML='<div id="gal" lang="fr" style="--c1:'+T.c1+';--c2:'+T.c2+';--or:'+T.or+';--clair:'+T.clair+'"><div class="hd"><div class="l1"><div class="ens"><b>'+T.nom+'</b><small>'+T.sous+'</small></div><div class="bo">'+enEuros(e.euros||0)+'</div><button class="x" aria-label="Fermer">✕</button></div>'+
    '<div class="pat"><canvas class="vd"></canvas><div class="bul">'+T.paroles[0]+'</div></div></div><div class="store"></div><div class="corps">'+corps+'</div></div>';
  RACINE=$('page2Fond').querySelector('#gal');dessinePerso(RACINE.querySelector('canvas.vd'),T.vendeur,1.1,'bas');RACINE.querySelector('.x').onclick=fermer;}
window.ouvrirBoutiqueGalerie=function(k){B=BOUTIQUES[k];if(!B)return;DIR=0;SEL=porte()||null;
  cadre(B,'<div class="sc"><canvas class="fond"></canvas><canvas class="perso"></canvas><div class="px"></div><button class="tr g" aria-label="Tourner">‹</button><button class="tr d" aria-label="Tourner">›</button></div>'+
    '<div class="de"></div><div class="lb"><span>EN VITRINE</span><span>'+B.articles.length+' modèles</span></div><div class="pf"></div><button class="go"></button><button class="doc">Ranger · ne plus rien porter</button>');
  const d=RACINE;requestAnimationFrame(()=>dessineFond(d.querySelector('canvas.fond'),B.fond));
  d.querySelector('.tr.g').onclick=()=>{DIR=(DIR+1)%4;rendreScene();};d.querySelector('.tr.d').onclick=()=>{DIR=(DIR+3)%4;rendreScene();};
  d.querySelector('.go').onclick=caisse;d.querySelector('.doc').onclick=()=>{porter(null);SEL=null;vib(8);bulle('« Rangé. Il t’attend. »');rendreTout();};
  rendreTout();try{if(typeof lireMesCosmetiques==='function')lireMesCosmetiques().then(()=>{if(RACINE)rendreTout();}).catch(()=>{});}catch(x){}};

/* LE CAFÉ DE LA GALERIE */
const T_CAFE={nom:'Café de la Galerie',sous:'EXPRESSO · VIENNOISERIES · GLACES',c1:'#6a3a1e',c2:'#4a2410',or:'#e8c890',clair:'#8a5230',
  vendeur:{peau:2,cheveux:1,coiffe:9,barbe:0,haut:2,veste:19,bas:0,pantalon:9,souliers:0,chaussures:1,sac:0,chapeau:0,raye:0,motif:0,_pnj:true},
  paroles:['« Bonjour ! Qu’est-ce que je te sers ? »','« Le croissant sort du four. »','« Assieds-toi, je te l’apporte. »','« Un petit noir, comme d’habitude ? »']};
window.ouvrirCafeGalerie=function(){B=null;
  cadre(T_CAFE,'<div class="lb"><span>LA CARTE</span><span>sur place</span></div><div class="pf">'+CAFE.map(a=>'<button data-k="'+a[0]+'"><div class="vi">'+a[4]+'</div>'+a[1]+'<small>'+String(a[3]).replace('.',',')+' €</small></button>').join('')+'</div><div class="de">Touche ce qui te fait envie. Tu le gardes en main un moment.</div>');
  RACINE.querySelectorAll('.pf button').forEach(b=>b.onclick=async()=>{if(ACHAT)return;const a=CAFE.find(x=>x[0]===b.dataset.k);
    if((e.euros||0)<a[3]*100){bulle('« Il te manque un peu de monnaie. »');vib(30);return;}
    ACHAT=true;b.disabled=true;let r=null;try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc('cafe_commander',{p_article:a[0]});r=q.data||(q.error?{erreur:q.error.message}:null);}else r=await appelRPC('cafe_commander',{p_article:a[0]});}catch(x){r={erreur:'reseau'};}
    ACHAT=false;b.disabled=false;
    if(!r||r.erreur){bulle(r&&/payer/.test(String(r.erreur))?'« Il te manque un peu de monnaie. »':'« La machine fait des siennes, réessaie dans un instant. »');return;}
    if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}RACINE.querySelector('.bo').textContent=enEuros(e.euros||0);
    e.ap=Object.assign({},e.ap||{},{_tasse:{k:a[0],f:Date.now()+6*60*1000}});try{sauver();}catch(x){}try{monterEnLigne(true);}catch(x){}
    vib([10,30,10]);bulle('« Et voilà ! '+a[1]+', bonne dégustation. »');});};
})();
