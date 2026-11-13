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
    articles:[['bij_bracelet_cuir','Bracelet cuir','Cuir tressé, clou doré. Le premier bijou.',6000,0],['bij_perles','Collier de perles','Perles de couleur, esprit plage.',9000,0],['bij_montre_sport','Montre sport','Bracelet rouge, cadran blanc.',12000,0],['bij_montre_acier','Montre acier','Bracelet maille, cadran bleu nuit.',25000,0],['bij_chaine_argent','Chaîne argent','Maille fine, discrète, qui accroche la lumière.',40000,0],
      ['bij_montre_plongee','Montre de plongée','Étanche à 300 m, lunette tournante.',70000,1],['bij_chaine_or','Chaîne or','Dix-huit carats, maille forçat. Elle scintille.',150000,2],
      ['bij_montre_or','Montre or','Le cadran qui fait tourner les têtes.',220000,2],['bij_grillz','Grillz or','Un sourire en or massif.',300000,2],
      ['bij_medaillon','Le médaillon','Grosse maille et médaillon d’or. Pour les patrons du port.',600000,3],['bij_montre_glace','Montre glacée','Sertie de diamants. Elle étincelle sans arrêt.',1200000,3],
      ['bij_chaine_glace','La rivière de diamants','Pavée de diamants. Dix exemplaires, pas un de plus.',2500000,4]]},
  lunettes:{nom:'Optique du Vieux-Port',sous:'OPTICIEN · LUNETTES DE SOLEIL',cle:'_lun',c1:'#1f6a6a',c2:'#124a4a',or:'#e8dcb0',clair:'#2a8a8a',fond:'lunettes',
    vendeur:{peau:3,cheveux:2,coiffe:4,barbe:0,haut:2,veste:19,bas:0,pantalon:8,souliers:0,chaussures:1,sac:0,chapeau:0,raye:0,motif:0,_pnj:true,_lun:'lun_rondes'},
    paroles:['« Le soleil de Marseille, ça ne pardonne pas. »','« Essaie, le miroir est là pour ça. »','« Celles-là, c’est le style du Vieux-Port. »','« Avec ça, tu vois la mer en plus bleu. »'],
    articles:[['lun_rouges','Rouges','Monture rouge vif.',5000,0],['lun_bleues','Bleues','Rectangulaires, bleu roi.',6000,0],['lun_noires','Noires','Le classique, verres fumés.',8000,0],['lun_ecaille','Écaille','Monture écaille, l’allure du Panier.',12000,0],['lun_rondes','Rondes dorées','Monture fine, verres ronds.',18000,0],
      ['lun_aviateur','Aviateur','Comme les pilotes de Marignane.',35000,1],['lun_coeur','Cœur','Pour voir la vie en rose.',45000,1],
      ['lun_miroir','Miroir','Verres miroir bleu ciel, qui brillent au soleil.',70000,2],['lun_masque','Masque sport','Écran panoramique orange.',120000,2],
      ['lun_or','Or massif','Monture en or. Elles étincellent.',400000,3],['lun_cyber','Visière LED','Une bande lumineuse qui change de couleur. Dix exemplaires.',900000,4]]},
  sneakers:{nom:'Sneakers 13',sous:'BASKETS · ÉDITIONS LIMITÉES',cle:'_snk',c1:'#e8602a',c2:'#b8401a',or:'#fff0d0',clair:'#f08a4a',fond:'sneakers',
    vendeur:{peau:5,cheveux:0,coiffe:1,barbe:1,haut:1,veste:21,bas:1,pantalon:9,souliers:1,chaussures:6,sac:0,chapeau:1,raye:0,motif:0,_pnj:true,_snk:'snk_fluo'},
    paroles:['« Wesh, celles-là elles sont propres ! »','« Édition limitée, y en aura pas pour tout le monde. »','« Avec ça, tu glisses sur le quai. »','« Le blanc, c’est intemporel. »'],
    articles:[['snk_rouges','Rouges','Rouges, semelle blanche.',9000,0],['snk_roses','Roses','Rose poudré et blanc.',12000,0],['snk_violettes','Violettes','Violet, liseré doré.',14000,0],['snk_blanches','Blanches','Toutes blanches, semelle immaculée.',15000,0],['snk_camo','Camo','Kaki, semelle gomme.',18000,0],['snk_noires','Noires & rouges','Noires, liseré rouge.',25000,0],
      ['snk_om','Ciel & blanc','Bleu ciel et blanc. Allez l’OM.',45000,1],['snk_desert','Désert','Daim sable, semelle crème.',45000,1],
      ['snk_fluo','Fluo','On te voit de l’autre bout du port.',70000,2],['snk_led','Lumineuses','Semelle LED qui change de couleur, même la nuit.',350000,3],
      ['snk_or','Or','La paire en or. Elle scintille à chaque pas.',900000,3],['snk_ailees','Les Ailées','Des ailes d’or aux chevilles. Dix paires au monde.',3000000,4]]}};
const CAFE=[['expresso','Expresso','Coup de fouet : tu marches plus vite.',2,'☕',{vit:1.15,d:45,mot:'⚡ +15 % de vitesse'}],['croissant','Croissant','Tu reprends ton souffle deux fois plus vite.',2.5,'🥐',{recup:2,d:45,mot:'🥐 souffle ×2'}],
  ['chocolat','Chocolat chaud','Ton souffle tient plus longtemps.',3.5,'🍫',{souffle:1.6,d:45,mot:'🍫 souffle +60 %'}],['jus','Jus d’orange','Vitamines : un peu de tout.',4,'🍊',{vit:1.08,recup:1.5,souffle:1.25,d:45,mot:'🍊 en forme'}],
  ['glace','Glace','Fraîcheur : tu ne t’essouffles presque plus.',4.5,'🍨',{souffle:3,d:25,mot:'🍨 souffle ×3'}],['crepe','Crêpe','Le grand plein : plus vite et plus longtemps.',5.5,'🥞',{vit:1.12,souffle:1.5,recup:1.5,d:60,mot:'🥞 grand plein'}]];
let RACINE=null,B=null,SEL=null,DIR=0,ACHAT=false;const DIRS=['bas','droite','haut','gauche'];
const vib=x=>{try{vibrer&&vibrer(x);}catch(_){}};
const aMoi=id=>{try{return !!(e.cos&&e.cos[id]);}catch(x){return false;}};
const porte=()=>{try{return (e.ap&&e.ap[B.cle])||null;}catch(x){return null;}};
function dessinePerso(cv,ap,taille,dir){const NW=40,NH=66,DPR=Math.max(1,window.devicePixelRatio||1);const s=Math.max(1,Math.round(taille*DPR));
  if(cv.width!==NW*s){cv.width=NW*s;cv.height=NH*s;cv.style.width=(NW*s/DPR)+'px';cv.style.height=(NH*s/DPR)+'px';}
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(s,0,0,s,0,0);personne(g,NW/2,NH-4,ap,dir||'bas',0,false);g.setTransform(1,0,0,1,0,0);}
/* la vignette : on cadre la zone de l'objet */
const ZONE={_bij:[8,24,24,18],_lun:[9,14,22,14],_snk:[9,56,22,8]};
function vignette(cv,ap){const DPR=Math.max(1,window.devicePixelRatio||1),[sx,sy,w,h]=ZONE[B.cle],s=Math.max(1,Math.round(2.4*DPR*(B.cle==='_snk'?1.3:B.cle==='_lun'?1.4:1.25)));
  cv.width=w*s;cv.height=h*s;cv.style.width=(w*s/DPR)+'px';cv.style.height=(h*s/DPR)+'px';
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,-sx*s,-sy*s);personne(g,20,62,ap,'bas',0,false);g.setTransform(1,0,0,1,0,0);}
const base=()=>{const ap=Object.assign({},DEF_AP,e.ap||{});delete ap.deguisement;return ap;};
function apEssai(){const ap=base();if(SEL)ap[B.cle]=SEL;else delete ap[B.cle];ap._pnj=true;return ap;}

const TIERS=[['CLASSIQUE','#9aa0ac','#3a3e48'],['RARE','#4aa8ff','#16304e'],['PRESTIGE','#c88aff','#341a52'],['LÉGENDE','#ffd24a','#4a3208'],['ÉDITION LIMITÉE','#ff6a5a','#4a1410']];
const eu=v=>Number(v).toLocaleString('fr-FR')+' €';
const CSS=`#gal{position:fixed;inset:0;z-index:5;display:flex;flex-direction:column;background:radial-gradient(120% 60% at 50% 0%,var(--c1),var(--c2) 70%);color:#f6efe0;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#gal *{box-sizing:border-box}
#gal .hd{flex:none;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px;border-bottom:1px solid rgba(255,220,150,.25);background:linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,0))}
#gal .l1{display:flex;align-items:center;gap:8px}#gal .ens{flex:1;min-width:0}
#gal .ens b{display:block;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:700;font-size:26px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(#fff6d8,var(--or) 55%,#a8782a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 rgba(0,0,0,.4))}
#gal .ens small{display:block;margin-top:3px;font-size:9.5px;font-weight:800;letter-spacing:3px;color:var(--or);opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gal .bo{flex:none;border:1px solid var(--or);color:#fff2c8;border-radius:999px;padding:3px 11px;font-weight:800;font-size:13px;background:rgba(0,0,0,.35);white-space:nowrap}
#gal .x{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--or);background:rgba(0,0,0,.35);color:#fff2c8;font:800 16px 'Baloo 2',sans-serif}
#gal .pat{display:flex;gap:10px;align-items:flex-end;margin-top:8px}#gal .pat canvas{flex:none;image-rendering:pixelated}
#gal .bul{flex:1;min-width:0;position:relative;background:rgba(255,250,240,.95);color:#2a1a10;border-radius:14px;padding:5px 10px;font-weight:700;font-size:13px;line-height:1.3;transition:opacity .2s}
#gal .bul:before{content:'';position:absolute;left:-8px;bottom:10px;border:8px solid transparent;border-right-color:rgba(255,250,240,.95);border-left:0}
#gal .store{flex:none;height:3px;background:linear-gradient(90deg,transparent,var(--or),transparent)}
#gal .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px calc(16px + env(safe-area-inset-bottom,0px))}
#gal .sc{position:relative;height:300px;border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,220,150,.35),0 12px 30px rgba(0,0,0,.45)}
#gal .sc canvas.fond{position:absolute;inset:0;width:100%;height:100%}
#gal .sc canvas.perso{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);image-rendering:pixelated}
#gal .sc .px{position:absolute;right:12px;top:12px;border-radius:999px;padding:3px 12px;font-weight:800;font-size:15px;color:#2a1a08;background:linear-gradient(#fff2b8,#e8b838);box-shadow:0 2px 0 #8a5a18}
#gal .sc .px.ok{background:linear-gradient(#7ae09a,#2f8a4a);color:#fff;box-shadow:0 2px 0 #1e5e30}
#gal .sc .ti{position:absolute;left:12px;top:12px;border-radius:999px;padding:2px 10px;font-weight:800;font-size:10.5px;letter-spacing:2px;border:1px solid currentColor;background:rgba(0,0,0,.45)}
#gal .sc .tr{position:absolute;bottom:16px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,220,150,.6);background:rgba(0,0,0,.45);color:#fff2c8;font:800 18px 'Baloo 2',sans-serif}
#gal .sc .tr.g{left:12px}#gal .sc .tr.d{right:12px}
#gal .nom{margin:12px 2px 0;font-family:Georgia,serif;font-style:italic;font-size:22px;font-weight:700;color:#fff6e0;line-height:1.1}
#gal .de{margin:2px 2px 0;font-weight:600;font-size:13px;color:rgba(255,240,210,.75);min-height:18px}
#gal .lb{font-size:10.5px;font-weight:800;letter-spacing:3px;color:var(--or);margin:16px 2px 8px;display:flex;justify-content:space-between;opacity:.9}
#gal .pf{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#gal .pf button{position:relative;border:1px solid rgba(255,255,255,.12);background:linear-gradient(var(--tb,#2a2a34),rgba(0,0,0,.35));border-radius:16px;padding:16px 4px 8px;font:800 12px 'Baloo 2',sans-serif;color:#f6efe0;display:flex;flex-direction:column;align-items:center;gap:1px;line-height:1.15;overflow:hidden}
#gal .pf button .vi{width:100%;height:62px;border-radius:12px;background:radial-gradient(closest-side,rgba(255,255,255,.18),rgba(255,255,255,0));display:grid;place-items:center;font-size:30px}
#gal .pf button canvas{image-rendering:pixelated}
#gal .pf button .rb{position:absolute;top:0;left:0;right:0;height:13px;font-size:8px;letter-spacing:1.5px;font-weight:900;line-height:13px;color:#1a1208;background:var(--tc,#9aa0ac)}
#gal .pf button.on{border-color:var(--or);box-shadow:0 0 0 2px var(--or),0 0 18px rgba(255,210,120,.35)}
#gal .pf button.leg{animation:galLeg 2.4s ease-in-out infinite}@keyframes galLeg{50%{box-shadow:0 0 16px rgba(255,210,80,.55)}}
#gal .pf .ef{font-style:normal;font-size:10px;font-weight:700;color:rgba(255,240,210,.75);line-height:1.1;margin-top:2px}
#gal .pf small{font-size:11.5px;font-weight:800;color:var(--or)}#gal .pf small.a{color:#7ae09a}
#gal .pf .pt{position:absolute;bottom:4px;right:4px;font-size:8.5px;font-weight:900;background:#7ae09a;color:#0e2a14;border-radius:7px;padding:0 5px}
#gal .go{display:block;width:100%;margin-top:14px;border:0;border-radius:18px;padding:12px;font:800 17px 'Baloo 2',sans-serif;color:#2a1a08;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 4px 0 #7a5214,0 10px 22px rgba(0,0,0,.35);line-height:1.1}
#gal .go small{display:block;font-size:12px;opacity:.8;font-weight:700}#gal .go:active{transform:translateY(3px);box-shadow:0 1px 0 #7a5214}
#gal .go.vert{background:linear-gradient(#8ae8a8,#2f8a4a);color:#fff;box-shadow:0 4px 0 #1e5e30}#gal .go[disabled]{opacity:.5}
#gal .doc{display:block;width:100%;margin-top:8px;border:1px solid rgba(255,220,150,.4);background:rgba(0,0,0,.25);border-radius:14px;padding:8px;font:800 13px 'Baloo 2',sans-serif;color:#f6efe0}
@media(min-width:720px){#gal .corps{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-content:start;padding:14px 24px}#gal .sc{height:auto;min-height:380px;grid-row:1/span 8}}`;
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

let BOUCLE=0,TOUCHE=0;
function rendreScene(){if(!RACINE)return;
  const px=RACINE.querySelector('.sc .px'),ti=RACINE.querySelector('.sc .ti'),A=B.articles.find(a=>a[0]===SEL);
  if(!A){px.style.display='none';ti.style.display='none';}else{px.style.display='block';ti.style.display='block';const T=TIERS[A[4]||0];ti.textContent=T[0];ti.style.color=T[1];
    if(aMoi(SEL)){px.className='px ok';px.textContent=porte()===SEL?'Porté ✓':'À toi ✓';}else{px.className='px';px.textContent=eu(A[3]);}}
  RACINE.querySelector('.nom').textContent=A?A[1]:B.nom;RACINE.querySelector('.de').textContent=A?A[2]:'Touche une pièce : tu l’essaies tout de suite.';}
/* la vitrine tourne doucement sur son socle, et les reflets bougent */
function animer(){cancelAnimationFrame(BOUCLE);let k=0,t0=performance.now();const go=t=>{if(!RACINE||!B)return;if(t-t0>66){t0=t;if(Date.now()-TOUCHE>4000&&Math.floor(t/1400)!==k){k=Math.floor(t/1400);DIR=(DIR+1)%4;}
    const cv=RACINE.querySelector('canvas.perso');if(cv)dessinePerso(cv,apEssai(),3.2,DIRS[DIR]);}BOUCLE=requestAnimationFrame(go);};BOUCLE=requestAnimationFrame(go);}
function rendreRayon(){const G=RACINE.querySelector('.pf');G.innerHTML='';const ap0=base();
  B.articles.forEach(a=>{const T=TIERS[a[4]||0],b=document.createElement('button');b.className=(a[0]===SEL?'on ':'')+((a[4]||0)>=3?'leg':'');b.style.setProperty('--tb',T[2]);b.style.setProperty('--tc',T[1]);
    b.insertAdjacentHTML('beforeend','<span class="rb">'+T[0]+'</span>');
    const vi=document.createElement('div');vi.className='vi';const cv=document.createElement('canvas');vi.appendChild(cv);b.appendChild(vi);
    vignette(cv,Object.assign({},ap0,{[B.cle]:a[0],_pnj:true}));
    b.insertAdjacentHTML('beforeend',a[1]+(aMoi(a[0])?'<small class="a">À toi ✓</small>':'<small>'+eu(a[3])+'</small>')+(porte()===a[0]?'<span class="pt">PORTÉ</span>':''));
    b.onclick=()=>{SEL=a[0];TOUCHE=Date.now();DIR=0;vib(8);if(Math.random()<.35)bulle(B.paroles[Math.floor(Math.random()*B.paroles.length)]);rendreTout();};G.appendChild(b);});}
function rendreCaisse(){const b=RACINE.querySelector('.go'),A=B.articles.find(a=>a[0]===SEL);RACINE.querySelector('.bo').textContent=enEuros(e.euros||0);b.disabled=false;b.className='go';
  if(!A){b.innerHTML='Choisis une pièce<small>tu l’essaies sur toi</small>';b.disabled=true;}
  else if(!aMoi(SEL)){const c=A[3]*100;b.innerHTML='Acheter · '+eu(A[3])+'<small>il te restera '+enEuros(Math.max(0,(e.euros||0)-c))+'</small>';if((e.euros||0)<c){b.innerHTML='Il te manque '+enEuros(c-(e.euros||0))+'<small>'+eu(A[3])+' pour celle-ci</small>';b.disabled=true;}}
  else if(porte()===SEL){b.innerHTML='Tu la portes<small>choisis-en une autre pour changer</small>';b.disabled=true;}
  else{b.className='go vert';b.innerHTML='La porter<small>elle est déjà à toi</small>';}
  RACINE.querySelector('.doc').style.display=porte()?'block':'none';}
function rendreTout(){if(!RACINE)return;rendreScene();rendreRayon();rendreCaisse();}
function porter(id){e.ap=Object.assign({},e.ap||{});if(id)e.ap[B.cle]=id;else delete e.ap[B.cle];try{sauver();}catch(x){}try{monterEnLigne(true);}catch(x){}}
async function caisse(){if(ACHAT||!SEL)return;const A=B.articles.find(a=>a[0]===SEL),b=RACINE.querySelector('.go');
  if(aMoi(SEL)){porter(SEL);vib([10,30,10]);bulle('« Ça te va très bien. »');rendreTout();return;}
  if((e.euros||0)<A[3]*100){bulle('« Reviens quand t’auras fait quelques shifts. »');vib(30);return;}
  ACHAT=true;b.disabled=true;b.innerHTML='…';
  const r=await appelRPC('acheter_cosmetique',{p_joueur:e.id,p_piece:SEL});ACHAT=false;
  if(!r||r.erreur){bulle(r&&r.erreur==='epuisee'?'« Les dix exemplaires sont partis. Trop tard ! »':r&&r.erreur==='pas_assez'?'« Il te manque de quoi payer. »':r&&r.erreur==='piece inconnue'?'« Celui-là arrive bientôt en rayon. »':'« La caisse fait des siennes, réessaie. »');rendreTout();return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}e.cos=Object.assign({},e.cos||{},{[SEL]:true});
  e.ap=Object.assign({},e.ap||{},{_sac:{k:B.fond,f:Date.now()+5*60*1000}});
  porter(SEL);vib([14,30,14]);bulle('« Bon choix ! Tu le portes déjà. »');rendreTout();}
function fermer(){if(!RACINE)return;RACINE=null;cancelAnimationFrame(BOUCLE);try{fermeA=Date.now();}catch(x){}try{$('page2').classList.remove('on');}catch(x){}}
function cadre(T,corps){css();$('page2Fond').className='';$('page2').classList.add('on');
  $('page2Fond').innerHTML='<div id="gal" lang="fr" style="--c1:'+T.c1+';--c2:'+T.c2+';--or:'+T.or+';--clair:'+T.clair+'"><div class="hd"><div class="l1"><div class="ens"><b>'+T.nom+'</b><small>'+T.sous+'</small></div><div class="bo">'+enEuros(e.euros||0)+'</div><button class="x" aria-label="Fermer">✕</button></div>'+
    '<div class="pat"><canvas class="vd"></canvas><div class="bul">'+T.paroles[0]+'</div></div></div><div class="store"></div><div class="corps">'+corps+'</div></div>';
  RACINE=$('page2Fond').querySelector('#gal');dessinePerso(RACINE.querySelector('canvas.vd'),T.vendeur,1.1,'bas');RACINE.querySelector('.x').onclick=fermer;}
window.ouvrirBoutiqueGalerie=function(k){B=BOUTIQUES[k];if(!B)return;DIR=0;SEL=porte()||null;
  cadre(B,'<div class="sc"><canvas class="fond"></canvas><canvas class="perso"></canvas><div class="ti"></div><div class="px"></div><button class="tr g" aria-label="Tourner">‹</button><button class="tr d" aria-label="Tourner">›</button></div>'+
    '<div class="nom"></div><div class="de"></div><div class="lb"><span>LA COLLECTION</span><span>'+B.articles.length+' pièces</span></div><div class="pf"></div><button class="go"></button><button class="doc">Ranger · ne plus rien porter</button>');
  const d=RACINE;requestAnimationFrame(()=>dessineFond(d.querySelector('canvas.fond'),B.fond));
  d.querySelector('.tr.g').onclick=()=>{DIR=(DIR+1)%4;TOUCHE=Date.now();};d.querySelector('.tr.d').onclick=()=>{DIR=(DIR+3)%4;TOUCHE=Date.now();};
  d.querySelector('.go').onclick=caisse;d.querySelector('.doc').onclick=()=>{porter(null);SEL=null;vib(8);bulle('« Rangé. Il t’attend. »');rendreTout();};
  rendreTout();animer();try{if(typeof lireMesCosmetiques==='function')lireMesCosmetiques().then(()=>{if(RACINE)rendreTout();}).catch(()=>{});}catch(x){}};

/* LE CAFÉ DE LA GALERIE */
const T_CAFE={nom:'Café de la Galerie',sous:'EXPRESSO · VIENNOISERIES · GLACES',c1:'#6a3a1e',c2:'#4a2410',or:'#e8c890',clair:'#8a5230',
  vendeur:{peau:2,cheveux:1,coiffe:9,barbe:0,haut:2,veste:19,bas:0,pantalon:9,souliers:0,chaussures:1,sac:0,chapeau:0,raye:0,motif:0,_pnj:true},
  paroles:['« Bonjour ! Qu’est-ce que je te sers ? »','« Le croissant sort du four. »','« Assieds-toi, je te l’apporte. »','« Un petit noir, comme d’habitude ? »']};
window.ouvrirCafeGalerie=function(){B=null;
  cadre(T_CAFE,'<div class="lb"><span>LA CARTE</span><span>sur place</span></div><div class="pf">'+CAFE.map(a=>'<button data-k="'+a[0]+'"><div class="vi">'+a[4]+'</div>'+a[1]+'<small>'+String(a[3]).replace('.',',')+' €</small><i class="ef">'+a[5].mot+' · '+a[5].d+' s</i></button>').join('')+'</div><div class="de">Chaque commande donne un petit effet qui ne dure pas. Tu la gardes en main 30 secondes.</div>');
  RACINE.querySelectorAll('.pf button').forEach(b=>b.onclick=async()=>{if(ACHAT)return;const a=CAFE.find(x=>x[0]===b.dataset.k);
    if((e.euros||0)<a[3]*100){bulle('« Il te manque un peu de monnaie. »');vib(30);return;}
    ACHAT=true;b.disabled=true;let r=null;try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc('cafe_commander',{p_article:a[0]});r=q.data||(q.error?{erreur:q.error.message}:null);}else r=await appelRPC('cafe_commander',{p_article:a[0]});}catch(x){r={erreur:'reseau'};}
    ACHAT=false;b.disabled=false;
    if(!r||r.erreur){bulle(r&&/payer/.test(String(r.erreur))?'« Il te manque un peu de monnaie. »':'« La machine fait des siennes, réessaie dans un instant. »');return;}
    if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}RACINE.querySelector('.bo').textContent=enEuros(e.euros||0);
    e.ap=Object.assign({},e.ap||{},{_tasse:{k:a[0],f:Date.now()+30*1000}});window.BOOST_CAFE=Object.assign({},a[5],{fin:Date.now()+a[5].d*1000});try{texteVolant(joueur.x,joueur.y-70,a[5].mot,'#ffe9a8');}catch(x){}try{sauver();}catch(x){}try{monterEnLigne(true);}catch(x){}
    vib([10,30,10]);bulle('« Et voilà ! '+a[1]+'. '+a[2]+' »');});};
})();
/* =====================================================================
   LE PÈRE NOËL DE LA GALERIE : un cadeau par jour, tiré dans sa hotte
   (noel_cadeau, côté serveur). Et « ta hotte » : les pièces de Noël
   qu'on a reçues, à porter ou à ranger.
   ===================================================================== */
(()=>{
const PERE_PIECES=['noel_houx', 'noel_lutin', 'noel_oreilles', 'noel_raye', 'bij_guirlande', 'lun_sapin', 'lun_neige', 'snk_sucre', 'snk_lutin', 'snk_chaussons', 'main_sucre', 'main_renne', 'main_cadeau', 'main_chocolat', 'main_bonhomme', 'main_pain_epice', 'main_cloche', 'noel_chapeau_bonhomme', 'noel_gui', 'bij_flocon_diamant', 'snk_patins', 'snk_aurore', 'main_guirlande', 'dos_hotte', 'suite_bonhomme', 'suite_pingouin', 'dos_cape', 'main_lanterne', 'main_boule', 'snk_neige', 'bij_etoile', 'noel_couronne_glace', 'noel_etoile_tete', 'lun_aurore', 'main_cierge', 'dos_ailes_givre', 'suite_renne', 'dos_ailes', 'noel_aureole'];
const RARETE={noel_couronne_glace:2,noel_etoile_tete:2,lun_aurore:2,main_cierge:2,dos_ailes_givre:2,suite_renne:2,dos_ailes:2,noel_aureole:2,noel_chapeau_bonhomme:1,noel_gui:1,bij_flocon_diamant:1,snk_patins:1,snk_aurore:1,main_guirlande:1,dos_hotte:1,suite_bonhomme:1,suite_pingouin:1,dos_cape:1,main_lanterne:1,main_boule:1,snk_neige:1,bij_etoile:1,noel_houx:0,noel_lutin:0,noel_oreilles:0,noel_raye:0,bij_guirlande:0,lun_sapin:0,lun_neige:0,snk_sucre:0,snk_lutin:0,snk_chaussons:0,main_sucre:0,main_renne:0,main_cadeau:0,main_chocolat:0,main_bonhomme:0,main_pain_epice:0,main_cloche:0};
const HOTTE_AVENT=['noel_bonnet','noel_bois','noel_echarpe','bij_clochette','snk_noel','lun_flocon'];
const NOM={noel_couronne_glace:'Couronne de glace',noel_etoile_tete:'Étoile filante',lun_aurore:'Lunettes aurore boréale',main_cierge:'Cierge magique',dos_ailes_givre:'Ailes de givre',suite_renne:'Petit renne (il te suit)',noel_chapeau_bonhomme:'Chapeau de bonhomme de neige',noel_gui:'Branche de gui',bij_flocon_diamant:'Flocon de diamant',snk_patins:'Patins à glace',snk_aurore:'Sneakers aurore',main_guirlande:'Guirlande lumineuse',dos_hotte:'Hotte du Père Noël',suite_bonhomme:'Bonhomme de neige (il te suit)',suite_pingouin:'Pingouin (il te suit)',snk_chaussons:'Chaussons de Noël',main_bonhomme:'Petit bonhomme de neige',main_pain_epice:'Bonhomme pain d’épice',main_cloche:'Clochette dorée',noel_houx:'Couronne de houx',noel_lutin:'Bonnet de lutin',noel_oreilles:'Cache-oreilles',noel_aureole:'Auréole d’ange',noel_raye:'Bonnet rayé',bij_guirlande:'Collier guirlande',bij_etoile:'Pendentif étoile',lun_sapin:'Lunettes sapin',lun_neige:'Lunettes givrées',
  snk_sucre:'Sneakers sucre d’orge',snk_neige:'Sneakers neige',snk_lutin:'Sneakers de lutin',main_sucre:'Sucre d’orge',main_boule:'Boule à neige',main_renne:'Peluche renne',main_lanterne:'Lanterne de Noël',main_cadeau:'Petit cadeau',main_chocolat:'Chocolat chaud',dos_cape:'Cape de Noël',dos_ailes:'Ailes d’ange',
  noel_bonnet:'Bonnet du Père Noël',noel_bois:'Bois de renne',noel_echarpe:'Écharpe de Noël',bij_clochette:'Collier clochette',snk_noel:'Sneakers de Noël',lun_flocon:'Lunettes flocon'};
const CLE=id=>id.indexOf('noel_')===0?'_noel':id.indexOf('suite_')===0?'_suite':id.indexOf('main_')===0?'_main':id.indexOf('dos_')===0?'_dos':id.slice(0,4)==='bij_'?'_bij':id.slice(0,4)==='lun_'?'_lun':'_snk';
const PAPA={peau:2,cheveux:7,teinte:'teinte_platine',coiffe:5,barbe:5,haut:5,veste:'#c8262c',bas:0,pantalon:'#c8262c',souliers:0,chaussures:'#1a1a1a',sac:0,chapeau:0,raye:0,motif:0,_pnj:true,_civil:true,_noel:'noel_bonnet'};
const CSS=`#pnl{position:fixed;inset:0;z-index:5;display:flex;flex-direction:column;background:radial-gradient(120% 60% at 50% 0%,#a8202a,#4a0e14 75%);color:#fff6e6;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
#pnl *{box-sizing:border-box}
#pnl .hd{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px}
#pnl .hd div{flex:1;min-width:0}#pnl .hd b{display:block;font-family:Georgia,serif;font-style:italic;font-size:26px;line-height:1;color:#ffe9a8;text-shadow:0 2px 0 rgba(0,0,0,.35)}
#pnl .hd small{display:block;font-size:9.5px;font-weight:800;letter-spacing:3px;color:#f2c8a0;margin-top:3px}
#pnl .x{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid #f2d27a;background:rgba(0,0,0,.3);color:#fff2c8;font:800 16px 'Baloo 2',sans-serif}
#pnl .corps{flex:1;overflow-y:auto;padding:4px 14px calc(18px + env(safe-area-inset-bottom,0px))}
#pnl .scene{position:relative;display:flex;align-items:flex-end;gap:10px}
#pnl .scene canvas{image-rendering:pixelated;flex:none}
#pnl .bul{position:relative;flex:1;background:#fffaf0;color:#3a1408;border-radius:14px;padding:8px 12px;font-weight:700;font-size:14px;line-height:1.3;margin-bottom:30px}
#pnl .bul:before{content:'';position:absolute;left:-8px;bottom:12px;border:8px solid transparent;border-right-color:#fffaf0;border-left:0}
#pnl .boite{position:relative;margin:14px auto 0;width:150px;height:130px;cursor:pointer}
#pnl .boite .c{position:absolute;left:15px;right:15px;bottom:0;height:86px;background:linear-gradient(90deg,#1e6a3a 0 42%,#f2c84a 42% 58%,#1e6a3a 58%);border-radius:6px;box-shadow:inset 0 -10px 0 rgba(0,0,0,.2),0 10px 22px rgba(0,0,0,.4)}
#pnl .boite .k{position:absolute;left:5px;right:5px;bottom:80px;height:28px;background:linear-gradient(90deg,#2a8a4a 0 42%,#ffe08a 42% 58%,#2a8a4a 58%);border-radius:6px;transition:transform .6s cubic-bezier(.3,1.6,.5,1);box-shadow:0 4px 0 rgba(0,0,0,.25)}
#pnl .boite .k:after{content:'';position:absolute;left:50%;top:-18px;width:40px;height:22px;margin-left:-20px;border-radius:50%;border:6px solid #f2c84a;border-bottom-color:transparent}
#pnl .boite.ouvre .k{transform:translateY(-60px) rotate(-18deg)}
#pnl .boite.tremble{animation:pnlT .5s infinite}@keyframes pnlT{25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
#pnl .gain{text-align:center;margin-top:10px;min-height:64px}
#pnl .gain b{display:block;font-family:Georgia,serif;font-size:32px;color:#ffe08a;text-shadow:0 2px 0 rgba(0,0,0,.4),0 0 20px rgba(255,220,120,.6);animation:pnlG .7s}
#pnl .gain small{display:block;font-weight:700;font-size:13px;color:#f6d8c0}
@keyframes pnlG{from{transform:scale(.3);opacity:0}60%{transform:scale(1.15)}}
#pnl .go{display:block;width:100%;margin-top:12px;border:0;border-radius:18px;padding:12px;font:800 17px 'Baloo 2',sans-serif;color:#3a1408;background:linear-gradient(#fff2b8,#e8b838 60%,#c8902a);box-shadow:0 4px 0 #7a5214}
#pnl .go[disabled]{opacity:.55}#pnl .go small{display:block;font-size:12px;font-weight:700;opacity:.8}
#pnl .lb{font-size:10.5px;font-weight:800;letter-spacing:3px;color:#f2d27a;margin:20px 2px 8px;display:flex;justify-content:space-between}
#pnl .hot{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#pnl .hot button{position:relative;border:1px solid rgba(255,230,180,.3);background:linear-gradient(#5a1a20,#2a0a0e);border-radius:16px;padding:8px 4px;font:800 11.5px 'Baloo 2',sans-serif;color:#fff2e0;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.1}
#pnl .hot button canvas{image-rendering:pixelated}
#pnl .hot button.non{opacity:.45}#pnl .hot button.on{box-shadow:0 0 0 2px #f2d27a,0 0 16px rgba(255,210,120,.4)}
#pnl .hot .rr{position:absolute;top:4px;left:4px;font-style:normal;font-size:7.5px;font-weight:900;letter-spacing:1px;border-radius:6px;padding:0 4px;color:#1a0a08}#pnl .hot .r0{background:#c8ccd6}#pnl .hot .r1{background:#7ac0ff}#pnl .hot .r2{background:#ffd24a;box-shadow:0 0 8px rgba(255,210,80,.7)}
#pnl .hot small{font-size:10px;color:#f2d27a}#pnl .hot small.p{color:#8ae8a0}
#pnl .neige{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(2px 2px at 20px 30px,#fff,transparent),radial-gradient(2px 2px at 120px 80px,#fff,transparent),radial-gradient(1.5px 1.5px at 200px 160px,#fff,transparent),radial-gradient(2px 2px at 300px 40px,#fff,transparent),radial-gradient(1.5px 1.5px at 60px 200px,#fff,transparent);background-size:340px 240px;animation:pnlN 9s linear infinite;opacity:.7}
@keyframes pnlN{to{background-position:30px 240px}}`;
let RAC=null,EN=false;
const vib=x=>{try{vibrer&&vibrer(x);}catch(_){}};
const aMoi=id=>{try{return !!(e.cos&&e.cos[id]);}catch(x){return false;}};
function perso(cv,ap,taille,zone){const DPR=Math.max(1,window.devicePixelRatio||1),s=Math.max(1,Math.round(taille*DPR)),[sx,sy,w,h]=zone||[0,0,40,66];cv.width=w*s;cv.height=h*s;cv.style.width=(w*s/DPR)+'px';cv.style.height=(h*s/DPR)+'px';
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,-sx*s,-sy*s);try{personne(g,20,62,ap,'bas',0,false);}catch(x){}g.setTransform(1,0,0,1,0,0);}
const ZON={_suite:[0,30,40,36],_noel:[4,0,32,28],_bij:[8,24,24,18],_lun:[9,14,22,14],_snk:[9,56,22,8],_main:[6,30,28,22],_dos:[0,18,40,40]};
const base=()=>{const ap=Object.assign({},DEF_AP,e.ap||{});delete ap.deguisement;return ap;};
async function rpc(n,a){try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data||(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}}
function bulle(t){const b=RAC&&RAC.querySelector('.bul');if(b)b.textContent=t;}
function texteGain(r){if(!r||!r.piece)return ['🎄 Joyeux Noël !','Tu as déjà toute la hotte. Bravo !'];return ['🎁 '+(NOM[r.piece]||r.piece),(RARETE[r.piece]===2?'LÉGENDAIRE ! ':RARETE[r.piece]===1?'Rare ! ':'')+'Une pièce unique, introuvable ailleurs. Elle est dans ta hotte !'];}
function carteHotte(H,id,b0){const k=CLE(id),a=aMoi(id),on=e.ap&&e.ap[k]===id,b=document.createElement('button');b.className=(a?'':'non')+(on?' on':'');const cv=document.createElement('canvas');b.appendChild(cv);perso(cv,Object.assign({},b0,{[k]:id,_pnj:true}),k==='_snk'?3.2:k==='_dos'?1.4:2.2,ZON[k]);
  const rr=RARETE[id];if(rr!==undefined)b.insertAdjacentHTML('afterbegin','<i class="rr r'+rr+'">'+['COMMUN','RARE','LÉGENDAIRE'][rr]+'</i>');
  b.insertAdjacentHTML('beforeend',NOM[id]+(a?'<small class="p">'+(on?'Portée ✓':'Porter')+'</small>':'<small>'+(HOTTE_AVENT.includes(id)?'au calendrier':'à recevoir')+'</small>'));
  b.onclick=()=>{if(!a){bulle(HOTTE_AVENT.includes(id)?'« Celle-là, c’est le calendrier de l’Avent qui la garde. »':'« Celle-là, elle est encore dans ma hotte. Reviens me voir ! »');vib(20);return;}e.ap=Object.assign({},e.ap||{});if(on)delete e.ap[k];else e.ap[k]=id;try{sauver();monterEnLigne(true);}catch(x){}vib(8);rendreHotte();};H.appendChild(b);}
function rendreHotte(){const H=RAC.querySelector('.hot'),H2=RAC.querySelector('.hot2');H.innerHTML='';H2.innerHTML='';const b0=base();PERE_PIECES.forEach(id=>carteHotte(H,id,b0));HOTTE_AVENT.forEach(id=>carteHotte(H2,id,b0));
  RAC.querySelector('.cpt').textContent=PERE_PIECES.filter(aMoi).length+' / '+PERE_PIECES.length;}
function fermer(){if(!RAC)return;RAC=null;try{fermeA=Date.now();}catch(x){}try{$('page2').classList.remove('on');}catch(x){}}
window.ouvrirPereNoel=async function(mode){const H=mode==='hotte';
  if(!document.getElementById('pnlCss')){const s=document.createElement('style');s.id='pnlCss';s.textContent=CSS;document.head.appendChild(s);}
  $('page2Fond').className='';$('page2').classList.add('on');
  $('page2Fond').innerHTML='<div id="pnl" lang="fr"><div class="neige"></div><div class="hd"><div><b>Le Père Noël</b><small>LA GALERIE BLEUE · JUSQU’AU 1ER DÉCEMBRE</small></div><button class="x" aria-label="Fermer">✕</button></div>'+
    '<div class="corps"><div class="scene"><canvas class="pn"></canvas><div class="bul">« Ho ho ho ! Une pièce unique par jour jusqu’au 1er décembre. Ma hotte en déborde, et les légendaires sont rares… Voyons ce que j’ai pour toi ! »</div></div>'+
    '<div class="boite"><div class="c"></div><div class="k"></div></div><div class="gain"></div><button class="go">Ouvrir mon cadeau du jour<small>une pièce unique par jour</small></button>'+
    '<div class="lb"><span>LES CADEAUX DU PÈRE NOËL</span><span class="cpt"></span></div><div class="hot"></div><div class="lb"><span>DU CALENDRIER DE L’AVENT</span><span>6 pièces</span></div><div class="hot hot2"></div></div></div>';
  RAC=$('page2Fond').querySelector('#pnl');RAC.querySelector('.x').onclick=fermer;perso(RAC.querySelector('canvas.pn'),PAPA,2.2);rendreHotte();
  if(H){RAC.querySelector('.boite').style.display='none';RAC.querySelector('.gain').style.display='none';RAC.querySelector('.go').style.display='none';bulle('« Voici ta hotte de Noël. Choisis ce que tu portes ! »');RAC.querySelector('.hd b').textContent='Ta hotte de Noël';return;}
  const go=RAC.querySelector('.go'),bo=RAC.querySelector('.boite'),gn=RAC.querySelector('.gain');
  const montrer=(r,deja)=>{bo.classList.add('ouvre');const [t1,t2]=texteGain(r);gn.innerHTML='<b>'+t1+'</b><small>'+(deja?'Ton cadeau d’aujourd’hui. Reviens demain pour le suivant !':t2)+'</small>';go.disabled=true;go.innerHTML='Reviens demain<small>un nouveau cadeau t’attendra</small>';};
  const d0=await rpc('noel_mon_cadeau');if(RAC&&d0&&d0.deja){montrer({piece:d0.cadeau&&d0.cadeau!=='complet'?d0.cadeau:null},true);bulle('« Tu as déjà eu ton cadeau aujourd’hui. Patience, petit docker ! »');}
  const ouvrir=async()=>{if(EN||go.disabled)return;EN=true;bo.classList.add('tremble');vib([10,40,10,40,10]);go.disabled=true;go.textContent='…';
    const r=await rpc('noel_cadeau');await new Promise(k=>setTimeout(k,900));EN=false;if(!RAC)return;bo.classList.remove('tremble');
    if(!r||r.erreur){go.disabled=false;go.innerHTML='Ouvrir mon cadeau du jour<small>une pièce unique par jour</small>';bulle(r&&r.erreur==='hors saison'?'« Je suis reparti au pôle Nord. À l’hiver prochain ! »':r&&r.erreur==='connexion'?'« Connecte-toi, que je sache à qui donner ! »':'« Mes rennes font des leurs… Réessaie dans un instant. »');return;}
    if(r.deja){montrer({piece:r.cadeau&&r.cadeau!=='complet'?r.cadeau:null},true);return;}
    if(r.piece)e.cos=Object.assign({},e.cos||{},{[r.piece]:true});
    montrer(r,false);vib([20,40,20,40,60]);bulle(r.piece?'« Ho ho ho ! Elle est rien qu’à toi. À demain pour la suivante ! »':'« Tu as déjà toute ma hotte ! Quel docker sage ! »');rendreHotte();};
  go.onclick=ouvrir;bo.onclick=ouvrir;};
})();
