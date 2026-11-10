/* =====================================================================
   LE PLATEAU DE MISTRAL TV — Le Grand Débat, en direct (plateau.html).
   On y vient après l'appel de la rédaction (le téléphone du menu).
   Un mur d'écrans, la rampe de projecteurs, le public sur les gradins,
   les caméras ; Nadia présente. On s'assoit dans le fauteuil de
   l'invité, et chaque réponse fait monter (ou plonger) l'audimat.
   Tout est local. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=800, H=800, Y0=380;
const DEPART=[400,700];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

function mot(t){let m=document.getElementById('blcMot');if(!m){m=document.createElement('div');m.id='blcMot';m.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147482400;background:rgba(20,22,26,.9);color:#fff;padding:9px 16px;border-radius:14px;font:800 15px "Baloo 2",sans-serif;pointer-events:none;transition:opacity .2s;opacity:0;text-align:center';document.body.appendChild(m);}
  m.textContent=t;m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1800);}
/* LA BOÎTE DE DIALOGUE : le portrait, la réplique, les choix */
function portrait(cv,ap){const s=3,NW=40,NH=40;cv.width=NW*s;cv.height=NH*s;cv.style.width=NW*1.6+'px';cv.style.height=NH*1.6+'px';const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,0,-12*s);personne(g,20,62,ap,'bas',0,false);g.setTransform(1,0,0,1,0,0);}
function dialogue({nom,ap,texte,choix}){return new Promise(ok=>{const old=document.getElementById('blcDia');if(old)old.remove();
  const d=document.createElement('div');d.id='blcDia';d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147482600;background:#1b1d22;color:#fff;border-radius:22px 22px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.45);font-family:"Baloo 2",system-ui,sans-serif;transform:translateY(100%);transition:transform .2s';
  d.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><canvas style="flex:none;border-radius:14px;background:#2a2e36;image-rendering:pixelated"></canvas><div style="flex:1;min-width:0"><b style="display:block;color:#ffd98a;font-size:14px;letter-spacing:.06em">'+nom.toUpperCase()+'</b><div style="font-weight:700;font-size:16px;line-height:1.3">'+texte+'</div></div></div><div class="ch" style="display:flex;flex-direction:column;gap:7px;margin-top:12px"></div>';
  if(ap)portrait(d.querySelector('canvas'),ap);else d.querySelector('canvas').style.display='none';
  const C=d.querySelector('.ch');choix.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.style.cssText='border:0;border-radius:14px;padding:11px 12px;text-align:left;background:#2e323b;color:#fff;font:800 15px "Baloo 2",sans-serif;box-shadow:0 3px 0 #15171b';
    b.onclick=()=>{try{vibrer&&vibrer(8);}catch(x){}d.style.transform='translateY(100%)';setTimeout(()=>d.remove(),200);ok(i);};C.appendChild(b);});
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.transform='none');});}

/* ---------- LE DÉCOR PEINT ----------
   La caméra du jeu est serrée (≈180 de large) : tout le plateau tient
   entre x 240 et 560, le mur d'écrans juste derrière les fauteuils. */
const SX0=236, SX1=564;
function mur(g){
  g.fillStyle='#05060a';g.fillRect(0,0,W,H);
  g.fillStyle=lin(g,0,200,0,Y0,[[0,'#07080e'],[1,'#161a2a']]);g.fillRect(SX0,200,SX1-SX0,Y0-200);
  /* la rampe de projecteurs */
  R(g,SX0,236,SX1-SX0,5,'#2a2e36');for(let x=SX0+14;x<SX1;x+=34){R(g,x,241,3,6,'#3a3e46');R(g,x-5,247,13,10,'#1a1c22');g.fillStyle='rgba(255,240,200,.95)';g.beginPath();g.arc(x+1.5,256,3,0,7);g.fill();}
  /* le cadre du grand écran (son image est animée par-dessus) */
  R(g,296,272,208,98,'#1a1c24');R(g,300,276,200,90,'#05060a');
  R(g,0+SX0,Y0-5,SX1-SX0,5,'#0a0b10');}
function scene(g){
  g.fillStyle=lin(g,0,Y0,0,H,[[0,'#141724'],[1,'#0c0e16']]);g.fillRect(SX0,Y0,SX1-SX0,H-Y0);
  for(let k=0;k<5;k++){g.fillStyle='rgba(120,150,255,.05)';g.fillRect(SX0+20+k*64,Y0,22,H-Y0);}
  /* l'estrade ronde et son anneau bleu */
  g.fillStyle='#232842';g.beginPath();g.ellipse(400,452,128,46,0,0,7);g.fill();
  g.strokeStyle='rgba(58,138,255,.35)';g.lineWidth=8;g.beginPath();g.ellipse(400,452,129,47,0,0,7);g.stroke();
  g.strokeStyle='#3a8aff';g.lineWidth=2.5;g.beginPath();g.ellipse(400,452,128,46,0,0,7);g.stroke();
  txt(g,'LE GRAND DÉBAT',400,486,8,'rgba(255,255,255,.14)','center','900');
  /* les câbles des caméras */
  g.strokeStyle='#05060a';g.lineWidth=1.5;for(const x of [330,470]){g.beginPath();g.moveTo(x,H-60);g.bezierCurveTo(x+24,600,x-18,580,x,560);g.stroke();}
  /* la sortie */
  R(g,370,H-70,60,10,'#2a2e36');txt(g,'SORTIE ▼',400,H-65,6,'#8a96aa','center','900');}
function peindreSol(g){mur(g);scene(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}
/* ---------- LES OBJETS ---------- */
const T={};const memo=(k,f)=>T[k]||(T[k]=f());
function graverFauteuil(v){return memo('fa'+v,()=>{const Wd=40,Hd=36,sol=32;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(4,sol-2,32,4);
  const C=v?'#d8402a':'#f2ece0',S=v?'#a8301e':'#d8d0c0';R(g,5,sol-28,30,18,C);R(g,5,sol-28,30,2,'rgba(255,255,255,.35)');R(g,3,sol-18,34,10,S);R(g,0,sol-22,6,15,C);R(g,34,sol-22,6,15,C);
  R(g,6,sol-8,3,8,'#c8a050');R(g,31,sol-8,3,8,'#c8a050');return {toile:c,W:Wd,H:Hd,sol};});}
function graverTable(){return memo('tb',()=>{const Wd=40,Hd=26,sol=22;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(5,sol-1,30,3);
  R(g,3,sol-12,34,3,'#e8eef4');R(g,3,sol-12,34,1,'#ffffff');R(g,18,sol-9,4,9,'#c8a050');R(g,12,sol-1,16,2,'#c8a050');
  R(g,9,sol-18,3,6,'rgba(200,230,255,.85)');R(g,26,sol-17,5,5,'#f2f0e6');R(g,27,sol-21,3,4,'rgba(220,220,220,.45)');return {toile:c,W:Wd,H:Hd,sol};});}
function graverCamera(v){return memo('cm'+v,()=>{const Wd=40,Hd=62,sol=58;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(20,sol-1,15,3,0,0,7);g.fill();
  for(const dx of [-10,0,10])R(g,20+dx-1,sol-4,2,4,'#2a2e36');R(g,19,sol-34,2,30,'#3a3e46');R(g,13,sol-7,14,3,'#2a2e36');
  R(g,7,sol-52,26,18,'#2a2e36');R(g,7,sol-52,26,1.5,'#5a5e66');R(g,10,sol-49,20,11,'#0a1a2a');R(g,11,sol-48,18,9,'#3a6aa8');
  R(g,3,sol-45,4,3,'#1a1c22');R(g,33,sol-45,4,3,'#1a1c22');txt(g,'MTV '+(v+1),20,sol-36,3.6,'#c8ccd4','center','bold');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* ---------- L'ÉMISSION ---------- */
const AP_NADIA={peau:1,cheveux:3,coiffe:5,barbe:0,haut:5,veste:23,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
let AUD=1.2,APPL=0,RIRE=0,HUEE=0,DIRECT=false,FINI=false,DANSE=0;
/* le grand écran animé et le panneau APPLAUDISSEZ */
function ecran(g,X,Y){const t=performance.now()/1000;
  /* les colonnes de LED de part et d'autre */
  for(const x of [252,520]){R(g,X+x,Y+272,28,96,'#0c0e16');for(let y=276;y<364;y+=6)for(let k=0;k<4;k++)R(g,X+x+3+k*6.4,Y+y,4.4,4,'rgba(60,120,255,'+(.2+.4*(.5+.5*Math.sin(t*2+k+y*.08)))+')');}
  const gr=g.createLinearGradient(X+300+Math.sin(t*.4)*40,0,X+500,0);gr.addColorStop(0,'#0a2a8a');gr.addColorStop(.5,'#3a1a8a');gr.addColorStop(1,'#0a6aa8');g.fillStyle=gr;g.fillRect(X+300,Y+276,200,90);
  for(let k=0;k<8;k++){const a=t*.3+k*.5;g.strokeStyle='rgba(255,255,255,'+(.05+.04*Math.sin(t+k))+')';g.lineWidth=1.5;g.beginPath();g.arc(X+400,Y+321,14+k*9,a,a+1.2);g.stroke();}
  g.save();g.shadowColor='rgba(120,180,255,.9)';g.shadowBlur=6;txt(g,'LE GRAND DÉBAT',X+400,Y+316,15,'#ffffff','center','900');g.restore();
  txt(g,'MISTRAL TV',X+400,Y+333,5.5,'#a8c8ff','center','900');
  if(DIRECT){R(g,X+306,Y+282,34,9,'#e8302a');txt(g,'● DIRECT',X+323,Y+286.5,4.6,'#ffffff','center','900');R(g,X+436,Y+282,58,9,'rgba(0,0,0,.45)');txt(g,'AUDIMAT '+AUD.toFixed(1).replace('.',',')+' M',X+465,Y+286.5,4.6,'#ffd98a','center','900');}
  const on=Date.now()<APPL;R(g,X+352,Y+352,96,12,on?'#e8302a':'#1a1c24');txt(g,'APPLAUDISSEZ',X+400,Y+358,6,on?(Math.floor(t*4)%2?'#ffffff':'#ffd0c8'):'#4a3434','center','900');}
/* le public : têtes qui bougent, mains qui claquent, rires et huées */
function gradins(g,x,y){const t=performance.now()/1000;
  for(let k=0;k<3;k++){R(g,x-34,y-14-k*16,68,13,'#1e2230');R(g,x-34,y-14-k*16,68,1.5,'#3a3e50');}
  const clap=Date.now()<APPL,rit=Date.now()<RIRE,hue=Date.now()<HUEE;
  for(let k=0;k<3;k++)for(let j=0;j<5;j++){const px=x-26+j*13+(k%2)*3,py=y-16-k*16+(clap||rit?-Math.abs(Math.sin(t*12+j+k))*1.5:0);
    const cl=['#e0b088','#8a5a3a','#f0c8a0','#c08860'][(j+k)%4];g.fillStyle=['#e8402a','#2a6ad8','#f2c43a','#3aa860','#8a3ad8','#f2f0e6'][(j*3+k)%6];g.fillRect(px-3.5,py-3,7,6);
    g.fillStyle=['#2a1a10','#5a3a1a','#c8a050','#1a1a1a'][(j*2+k)%4];g.beginPath();g.arc(px,py-6.5,3,0,7);g.fill();g.fillStyle=cl;g.beginPath();g.arc(px,py-5.8,2.6,0,7);g.fill();
    if(clap&&Math.sin(t*20+j*2+k)>0){g.fillStyle=cl;g.fillRect(px-3,py-11,2,2);g.fillRect(px+1,py-11,2,2);}}
  if(rit||hue){g.fillStyle='rgba(255,255,255,.94)';g.beginPath();g.roundRect(x-22,y-74,44,13,6);g.fill();txt(g,hue?'BOUUUH':'HAHAHA',x,y-67.5,6.5,hue?'#c8302a':'#2a6ad8','center','900');}}
ANIM_DECOR.tv_cam=(g,o,x,y)=>{const s=graverCamera(o.v);g.drawImage(s.toile,Math.round(x-s.W/2),Math.round(y-s.sol),s.W,s.H);
  const t=performance.now()/1000,act=DIRECT&&Math.floor(t/4)%2===o.v;R(g,x+9,y-s.sol+7,3,3,act?'#ff2a2a':'#4a1a1a');};
const NADIA=[362,443];
function acteurs(){const t=performance.now()/1000;return [
  {y:Y0-1,f:(ctx,cx,cy)=>ecran(ctx,-cx,-cy)},
  {y:470,f:(ctx,cx,cy)=>gradins(ctx,262-cx,470-cy)},{y:470,f:(ctx,cx,cy)=>gradins(ctx,538-cx,470-cy)},
  {y:NADIA[1]+5,f:(ctx,cx,cy)=>{personne(ctx,NADIA[0]-cx,NADIA[1]-cy,AP_NADIA,DIRECT?'droite':'bas',0,false);
    if(DIRECT&&Math.floor(t*3)%2){ctx.fillStyle='#f2f0e6';ctx.fillRect(NADIA[0]-cx+4,NADIA[1]-cy-22,4,5);}}}];}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_tv_fauteuil_sol',NADIA[0],446,{v:0,col:[36,8]});
  P('x_jol_tv_fauteuil_sol',438,446,{v:1,col:[36,8],agir:jeuTV,libelle:'Jouer au Grand Mistral',nom:'LE PUPITRE DU CANDIDAT',demi:44});
  P('x_jol_tv_table_sol',400,452,{col:[36,6]});
  P('x_jol_tv_gr_sol',262,470,{col:[70,52]});P('x_jol_tv_gr_sol',538,470,{col:[70,52]});
  for(const [x,v] of [[330,0],[470,1]])P('x_jol_tv_vide_sol',x,566,{anim:'tv_cam',v,col:[26,6]});
  return D;}
function audimat(d,type){AUD=Math.max(.2,AUD+d);const now=Date.now();if(type==='appl')APPL=now+2600;if(type==='rire')RIRE=now+2200;if(type==='huee')HUEE=now+2000;
  try{vibrer&&vibrer(type==='huee'?40:[10,30,10]);}catch(x){}majHUD();}
function majHUD(){let b=document.getElementById('tvBan');if(!b){b=document.createElement('div');b.id='tvBan';b.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%);z-index:2147482300;border-radius:14px;padding:5px 14px;font:800 14px "Baloo 2",sans-serif;pointer-events:none;white-space:nowrap;background:rgba(10,12,20,.88);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.3)';document.body.appendChild(b);}
  b.innerHTML=DIRECT?'<span style="color:#ff5a4a">● DIRECT</span> · Audimat <b style="color:#ffd98a">'+AUD.toFixed(1).replace('.',',')+' M</b>':(FINI?'Merci d’être venu · sortie en bas':'Mistral TV · le pupitre rouge t’attend');}
setTimeout(majHUD,700);
async function danser(){const D=['bas','gauche','haut','droite'];let k=0;DANSE=Date.now()+3200;const y0=joueur.y;
  await new Promise(ok=>{const it=setInterval(()=>{k++;try{joueur.dir=D[k%4];joueur.y=y0-(k%2?2:0);}catch(x){}if(Date.now()>DANSE){clearInterval(it);try{joueur.y=y0;joueur.dir='bas';}catch(x){}ok();}},150);});}
function jeuTV(){try{sauver();}catch(x){}location.href='jeutv.html?t='+Date.now();}
async function emission(){if(DIRECT)return;if(FINI){await dialogue({nom:'Nadia',ap:AP_NADIA,texte:'« Encore merci ! Vous avez été formidable. La sortie est en bas. »',choix:['Au revoir']});return;}
  window.FP_GEL=Date.now()+86400000;try{joueur.x=438;joueur.y=448;joueur.dir='bas';}catch(x){}
  DIRECT=true;AUD=1.2;majHUD();mot('● Antenne dans 3, 2, 1…');await new Promise(r=>setTimeout(r,1400));
  const Q=async(texte,choix,effets)=>{const i=await dialogue({nom:'Nadia',ap:AP_NADIA,texte,choix});const [d,ty,rep]=effets[i];audimat(d,ty);if(rep)await dialogue({nom:'Nadia',ap:AP_NADIA,texte:rep,choix:['…']});return i;};
  await Q('« Bonsoir et bienvenue dans Le Grand Débat ! Ce soir, un docker du port de Marseille. Présentez-vous ! »',
    ['Docker, fils de docker, petit-fils de docker.','Je suis la star du port, évidemment.','… (le trac te coupe la parole)'],
    [[.8,'appl','« Trois générations sur les quais ! Le public adore. »'],[.5,'rire','« Rien que ça ! On sent la modestie. »'],[-.4,'huee','« Euh… on va dire que c’est l’émotion du direct. »']]);
  await Q('« On dit que le port est à l’arrêt. C’est la faute à qui ? »',
    ['À la direction, elle ne nous écoute pas.','Au mistral. Il souffle trop fort.','Aux mouettes. Elles sont partout.'],
    [[.7,'appl',null],[.4,'rire','« Le mistral, ce grand syndicaliste ! »'],[.5,'rire','« Les mouettes, on n’y avait pas pensé… »']]);
  const i3=await Q('« Il paraît que vous savez danser. Une petite démonstration, en direct ? »',
    ['Allez, musique !','Jamais de la vie.','Seulement si vous dansez avec moi.'],
    [[0,null,null],[-.3,'huee','« Oh, le public est déçu… »'],[.6,'rire','« Hahaha ! Une autre fois, peut-être ! »']]);
  if(i3===0){mot('🎵 Musique !');APPL=Date.now()+3600;await danser();audimat(1.4,'appl');await dialogue({nom:'Nadia',ap:AP_NADIA,texte:'« INCROYABLE ! Le standard explose, on bat le record de la chaîne ! »',choix:['Merci, merci…']});}
  await Q('« Un dernier mot pour nos téléspectateurs ? »',
    ['Le port, c’est nous !','Coucou maman, j’ai mangé !','Rendez-vous sur les quais, les amis.'],
    [[.6,'appl',null],[.5,'rire',null],[.4,'appl',null]]);
  const note=AUD>=4?'un record historique':AUD>=3?'un énorme succès':AUD>=2?'une belle soirée':'une soirée… discrète';
  await dialogue({nom:'Nadia',ap:AP_NADIA,texte:'« Et c’est terminé ! '+AUD.toFixed(1).replace('.',',')+' millions de téléspectateurs ce soir : '+note+'. Merci à notre invité ! »',choix:['Saluer le public']});
  audimat(0,'appl');DIRECT=false;FINI=true;majHUD();window.FP_GEL=0;
  try{localStorage.setItem('quai_une',JSON.stringify({titre:'« Un docker crève l’écran : '+AUD.toFixed(1).replace('.',',')+' millions devant Le Grand Débat »',quand:Date.now()}));}catch(x){}
  mot('📰 Demain, tu fais la une du Quai.');}
/* la sortie : on revient sur la place */
let PARTI=false;
setInterval(()=>{try{if(!PARTI&&!DIRECT&&joueur.y>H-66){PARTI=true;try{sauver();}catch(x){}location.href='spawn.html?t='+Date.now();}}catch(x){}},150);
setTimeout(()=>mot('Mistral TV · Studio 1'),800);
function bloque(x,y){if(x<SX0+8||x>SX1-8)return true;if(y<Y0+10)return true;if(y>H-60)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}return false;}
const GRAVEURS={x_jol_tv_fauteuil_sol:graverFauteuil,x_jol_tv_table_sol:graverTable};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:()=>[],acteurs};
})()
