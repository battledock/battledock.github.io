/* =====================================================================
   LA TOUR DU PORT — 42e étage, le bureau de la directrice (tour.html).
   Une baie vitrée sur tout le port ; le grand bureau d'acajou ; la
   directrice, immense, derrière. On négocie la fin du blocus : bien
   joué, on obtient un accord ; mal joué, elle appelle la sécurité et
   c'est la garde à vue. On redescend par l'ascenseur. Local.
   ===================================================================== */
(()=>{
const W=800, H=800, Y0=360;
const DEPART=[400,730];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(x){return null;}};
function mot(t){let m=document.getElementById('blcMot');if(!m){m=document.createElement('div');m.id='blcMot';m.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147482400;background:rgba(20,22,26,.9);color:#fff;padding:9px 16px;border-radius:14px;font:800 15px "Baloo 2",sans-serif;pointer-events:none;transition:opacity .2s;opacity:0;text-align:center';document.body.appendChild(m);}
  m.textContent=t;m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1800);}
/* LA BOÎTE DE DIALOGUE : le portrait, la réplique, les choix */
function portrait(cv,ap){const s=3,NW=40,NH=40;cv.width=NW*s;cv.height=NH*s;cv.style.width=NW*1.6+'px';cv.style.height=NH*1.6+'px';const t=document.createElement('canvas');t.width=40;t.height=66;const q=t.getContext('2d');q.imageSmoothingEnabled=false;personne(q,20,62,ap,'bas',0,false);
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(t,0,12,40,40,0,0,NW*s,NH*s);}
function dialogue({nom,ap,texte,choix}){return new Promise(ok=>{const old=document.getElementById('blcDia');if(old)old.remove();
  const d=document.createElement('div');d.id='blcDia';d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147482600;background:#1b1d22;color:#fff;border-radius:22px 22px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.45);font-family:"Baloo 2",system-ui,sans-serif;transform:translateY(100%);transition:transform .2s';
  d.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><canvas style="flex:none;border-radius:14px;background:#2a2e36;image-rendering:pixelated"></canvas><div style="flex:1;min-width:0"><b style="display:block;color:#ffd98a;font-size:14px;letter-spacing:.06em">'+nom.toUpperCase()+'</b><div style="font-weight:700;font-size:16px;line-height:1.3">'+texte+'</div></div></div><div class="ch" style="display:flex;flex-direction:column;gap:7px;margin-top:12px"></div>';
  if(ap)portrait(d.querySelector('canvas'),ap);else d.querySelector('canvas').style.display='none';
  const C=d.querySelector('.ch');choix.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.style.cssText='border:0;border-radius:14px;padding:11px 12px;text-align:left;background:#2e323b;color:#fff;font:800 15px "Baloo 2",sans-serif;box-shadow:0 3px 0 #15171b';
    b.onclick=()=>{try{vibrer&&vibrer(8);}catch(x){}d.style.transform='translateY(100%)';setTimeout(()=>d.remove(),200);ok(i);};C.appendChild(b);});
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.transform='none');});}
function arreter(){try{vibrer&&vibrer([60,80,60,80,120]);}catch(x){}LS('blc_gav_fin',Date.now()+90000);
  const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#fff;font:800 24px "Baloo 2",sans-serif;opacity:0;transition:opacity .4s;animation:blcGyro .5s infinite alternate';
  f.innerHTML='<div style="font-size:13px;letter-spacing:.3em;opacity:.8">POLICE NATIONALE</div><div>Garde à vue</div>';
  if(!document.getElementById('blcGyroCss')){const st=document.createElement('style');st.id='blcGyroCss';st.textContent='@keyframes blcGyro{from{background:rgba(20,40,120,.92)}to{background:rgba(140,20,30,.92)}}';document.head.appendChild(st);}
  document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');setTimeout(()=>location.href='garde.html?t='+Date.now(),1800);}

/* ---------- LE DESSIN ---------- */
function baie(g){
  /* le plafond, la baie, le panorama du port de Marseille vu du 42e */
  g.fillStyle=lin(g,0,30,0,190,[[0,'#6aa6d8'],[1,'#d6eaf4']]);g.fillRect(0,30,W,Y0-30);
  g.fillStyle='#9ab4c8';g.beginPath();g.moveTo(0,170);for(let x=0;x<=W;x+=20)g.lineTo(x,160-Math.sin(x/90)*10-hA(x,1,1)*4);g.lineTo(W,175);g.lineTo(0,175);g.fill();
  g.fillStyle=lin(g,0,170,0,Y0,[[0,'#3a7ab0'],[1,'#5aa0c8']]);g.fillRect(0,172,W,Y0-172);
  for(let i=0;i<500;i++){const y=174+hA(i,2,1)*120,x=hA(i,3,1)*W;R(g,x,y,3+hA(i,4,1)*8,.8,'rgba(255,255,255,.25)');}
  /* les quais, les conteneurs, les grues, un cargo */
  R(g,0,250,W,Y0-250,'#8a8a84');for(let x=0,k=0;x<W;x+=26,k++){const n=1+Math.floor(hA(k,5,1)*3);for(let j=0;j<n;j++)R(g,x+2,262-j*9,22,8,['#b8402e','#2a5a8a','#3a7a4a','#c8a040','#8a8e94'][(k+j)%5]);}
  for(const x of [120,330,560]){R(g,x,150,4,110,'#c8402e');R(g,x+36,150,4,110,'#c8402e');R(g,x-20,146,90,6,'#c8402e');R(g,x+40,128,3,20,'#c8402e');}
  R(g,600,226,170,22,'#2a3a4a');R(g,600,214,90,12,'#e8e4dc');R(g,700,206,24,20,'#e8e4dc');txt(g,'MARSEILLE',650,240,6,'#e8e4dc','center','bold');
  /* les montants de la baie, le plafond, l'allège */
  R(g,0,0,W,32,'#2a2a2e');for(let x=0;x<=W;x+=100){R(g,x-4,30,8,Y0-30,'#2e3238');R(g,x-1,30,2,Y0-30,'#5a6068');}
  R(g,0,Y0-26,W,26,'#d8d4cc');R(g,0,Y0-26,W,2,'#f2eee6');
  for(let k=0;k<6;k++){g.fillStyle='rgba(255,250,230,.18)';g.beginPath();g.ellipse(80+k*130,14,30,6,0,0,7);g.fill();}}
function sols(g){
  g.fillStyle=lin(g,0,Y0,0,H,[[0,'#5a3a24'],[1,'#6a462c']]);g.fillRect(0,Y0,W,H-Y0);
  for(let y=Y0+10;y<H;y+=12){R(g,0,y,W,1,'rgba(0,0,0,.18)');for(let x=((y/12)%3)*40;x<W;x+=120)R(g,x,y-12,1,12,'rgba(0,0,0,.14)');}
  /* le grand tapis bleu marine, son liseré d'or */
  R(g,150,Y0+40,500,300,'#1d2f5a');g.strokeStyle='#c8a050';g.lineWidth=3;g.strokeRect(162,Y0+52,476,276);g.lineWidth=1;g.strokeRect(170,Y0+60,460,260);
  /* l'ascenseur, en bas */
  R(g,340,H-16,120,16,'#8a8e94');R(g,399,H-16,2,16,'#5a5e64');txt(g,'▼ ASCENSEUR',400,H-6,7,'#ffffff','center','900');}
function peindreSol(g){baie(g);sols(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}
const T={};const memo=(k,f)=>T[k]||(T[k]=f());
/* le bureau d'acajou : plateau, ordinateur, téléphone, la plaque */
function graverBureau(){return memo('bu',()=>{const Wd=300,Hd=90,sol=84;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(10,sol-3,280,7);
  g.fillStyle=lin(g,0,sol-44,0,sol,[[0,'#7a3a22'],[1,'#4a2010']]);g.fillRect(6,sol-44,288,44);R(g,0,sol-50,300,8,'#8a4a2a');R(g,0,sol-50,300,1.6,'#b8704a');
  for(let x=20;x<290;x+=40)R(g,x,sol-38,1,34,'rgba(0,0,0,.18)');
  R(g,40,sol-80,60,32,'#1a1c20');R(g,43,sol-77,54,25,'#3a6aa8');R(g,64,sol-48,12,3,'#1a1c20');
  R(g,200,sol-58,30,8,'#24262a');R(g,236,sol-60,30,10,'#f2f0e6');
  R(g,120,sol-58,60,8,'#c8a050');txt(g,'LA DIRECTRICE',150,sol-54,4.6,'#2a1a10','center','900');
  return {toile:c,W:Wd,H:Hd,sol};});}
function graverDrapeaux(){return memo('dr',()=>{const Wd=90,Hd=130,sol=124;const {c,g}=toile(Wd,Hd);
  for(const [x,cols] of [[20,['#1d3f8a','#ffffff','#d8302a']],[46,['#1d3f8a','#1d3f8a','#1d3f8a']],[72,['#1d4a8a','#ffffff','#1d4a8a']]]){R(g,x-1,sol-120,2,120,'#c8a050');
    for(let k=0;k<3;k++){g.fillStyle=cols[k];g.fillRect(x+1,sol-116+k*0,0,0);}
    for(let k=0;k<3;k++){g.fillStyle=cols[k];g.beginPath();g.moveTo(x+1+k*7,sol-116);g.lineTo(x+8+k*7,sol-116);g.lineTo(x+8+k*7,sol-86+Math.sin(k)*2);g.lineTo(x+1+k*7,sol-86);g.fill();}
    if(x===46){g.fillStyle='#f2c43a';for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.fillRect(x+11+Math.cos(a)*6,sol-101+Math.sin(a)*6,1.6,1.6);}}}
  R(g,8,sol-4,76,4,'#3a2a1a');return {toile:c,W:Wd,H:Hd,sol};});}
function graverCanape(){return memo('ca',()=>{const Wd=150,Hd=60,sol=54;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(8,sol-3,134,6);
  R(g,6,sol-40,138,22,'#3a2a22');R(g,6,sol-22,138,18,'#4a3428');R(g,0,sol-34,12,30,'#3a2a22');R(g,138,sol-34,12,30,'#3a2a22');for(const x of [50,100])R(g,x,sol-38,1,30,'rgba(0,0,0,.25)');
  return {toile:c,W:Wd,H:Hd,sol};});}
function graverPlante(){return memo('pl',()=>{const Wd=70,Hd=110,sol=104;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(16,sol-3,40,5);
  R(g,20,sol-26,30,26,'#2a2a2e');fe(g,35,sol-62,26,34,['#1e3a22','#2e5430','#4a7438','#6e9a50'],520,4,2.2);return {toile:c,W:Wd,H:Hd,sol};});}
/* LA DIRECTRICE : immense, tailleur bordeaux, lunettes, chignon */
const AP_DIR={peau:1,cheveux:4,coiffe:3,barbe:0,haut:5,veste:22,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
const DX=400,DY=468;
function acteurs(){return [{y:DY,f:(ctx,cx,cy)=>{const t=performance.now()/1000;ctx.save();ctx.translate(DX-cx,DY-cy);ctx.scale(3.3,1.9);
  personne(ctx,0,0,AP_DIR,'bas',0,false);ctx.restore();
  /* les lunettes à monture dorée, la respiration */
  const X=DX-cx,Y=DY-cy-Math.sin(t*1.6)*.6;ctx.strokeStyle='#c8a050';ctx.lineWidth=1.2;ctx.strokeRect(X-15,Y-77,12,6);ctx.strokeRect(X+3,Y-77,12,6);ctx.beginPath();ctx.moveTo(X-3,Y-75);ctx.lineTo(X+3,Y-75);ctx.stroke();}}];}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_tour_bureau_sol',400,520,{col:[292,14],agir:negocier,libelle:'Parler',nom:'LA DIRECTRICE',demi:150});
  P('x_jol_tour_drapeaux_sol',110,420,{col:[70,8]});P('x_jol_tour_canape_sol',650,600,{col:[146,10]});
  P('x_jol_tour_plante_sol',60,560,{col:[30,8]});P('x_jol_tour_plante_sol',740,430,{col:[30,8]});
  return D;}
let FINI=false;
async function negocier(){if(FINI){await dialogue({nom:'La directrice',ap:AP_DIR,texte:'« On s’est tout dit. Bonne journée. »',choix:['Au revoir']});return;}
  window.FP_GEL=Date.now()+86400000;let mal=0;
  const i1=await dialogue({nom:'La directrice',ap:AP_DIR,texte:'« Alors c’est vous, le meneur. Asseyez-vous. Votre petit blocus me coûte trois millions par jour. Qu’est-ce que vous voulez ? »',choix:['Le maintien des emplois, et une prime pour tous.','On lève le blocus si vous recevez les syndicats.','Votre bureau. Il est joli.']});
  if(i1===2)mal+=2;
  const i2=await dialogue({nom:'La directrice',ap:AP_DIR,texte:mal?'« Très drôle. Je vous préviens : un mot de travers et j’appelle la sécurité. Je peux proposer une prime de 200 € et une réunion lundi. »':'« Je peux vous proposer une prime de 200 € pour tous, et une réunion avec les syndicats lundi. »',choix:['J’accepte. On lève le blocus.','200 € ? Ce sera 500, ou rien.','Vous vous moquez de nous.']});
  if(i2===0){FINI=true;window.FP_GEL=0;LS('blc_accord',{prime:200,quand:Date.now()});await dialogue({nom:'La directrice',ap:AP_DIR,texte:'« Parfait. Signez ici. Et que je ne vous revoie pas devant ma porte. »',choix:['Signer l’accord']});accord('Accord signé · prime de 200 €');return;}
  if(i2===1&&!mal&&Math.random()<.6){FINI=true;window.FP_GEL=0;LS('blc_accord',{prime:400,quand:Date.now()});await dialogue({nom:'La directrice',ap:AP_DIR,texte:'« … Vous êtes coriace. 400, et c’est mon dernier mot. Vous levez tout ce soir. »',choix:['Marché conclu']});accord('Accord arraché · prime de 400 €');return;}
  await dialogue({nom:'La directrice',ap:AP_DIR,texte:'« Ça suffit. Sécurité ! Faites sortir monsieur. Et appelez le commissaire Rinaldi. »',choix:['Hé, lâchez-moi !']});arreter();}
function accord(t){mot('✍️ '+t);try{vibrer&&vibrer([20,40,20,40,60]);}catch(x){}}
/* l'ascenseur : on redescend au blocus */
let PARTI=false;
setInterval(()=>{try{if(!PARTI&&joueur.y>H-22){PARTI=true;window.FP_GEL=Date.now()+5000;try{sauver();}catch(x){}
  const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#1a1d24;color:#ffd98a;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 20px "Baloo 2",sans-serif';
  f.innerHTML='<div style="font-size:13px;letter-spacing:.3em;color:#8a96aa">ASCENSEUR</div><div id="trEt" style="font-size:64px;line-height:1">42</div><div style="font-size:13px;color:#8a96aa">REZ-DE-CHAUSSÉE</div>';document.body.appendChild(f);
  let n=42;const it=setInterval(()=>{n=Math.max(0,n-3);const e2=document.getElementById('trEt');if(e2)e2.textContent=n||'RDC';if(!n){clearInterval(it);setTimeout(()=>location.href='blocus.html?de=tour&t='+Date.now(),300);}},55);}}catch(x){}},150);
setTimeout(()=>mot('42e étage · Direction du Port'),800);
function bloque(x,y){if(x<10||x>W-10)return true;if(y<Y0+12)return true;if(y>H-4)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}return false;}
const GRAVEURS={x_jol_tour_bureau_sol:graverBureau,x_jol_tour_drapeaux_sol:graverDrapeaux,x_jol_tour_canape_sol:graverCanape,x_jol_tour_plante_sol:graverPlante};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:()=>[],acteurs};
})()
