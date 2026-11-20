/* =====================================================================
   LE QUAI DES CONTENEURS (containers.js) — Tape sur les conteneurs
   pour les décharger et gagner de l'argent. Plus tu tapes vite, plus
   le combo monte et plus tu gagnes. Fond portuaire peint au pixel.
   Indépendant : n'écrit que dans #ctn.
   ===================================================================== */
(()=>{
const COULEURS=['#c0392b','#2a5a9a','#3a8a4a','#f0a030','#7a3ad0','#1a6a6a','#c86a2a','#8a2a5a'];
const MARQUES=['MSC','CMA','MAERSK','COSCO','HAPAG','ZIM','ONE','OOCL'];
let RAC=null,CV=null,G=null,RAF=0,DPR=1,J=null;

/* ===== LE JEU ===== */
function nouveau(){
  J={score:0,combo:1,maxCombo:1,tCombo:0,taps:0,rate:0,chrono:60,fini:false,flash:0,
     conteneurs:[],spawn:0,spawnRate:1.2,niveau:1,
     grueX:200,grueDir:1,grueCable:0,grueCont:null};
  spawner();spawner();spawner();}

function spawner(){if(!J||J.fini)return;
  const col=COULEURS[(Math.random()*COULEURS.length)|0];
  const marque=MARQUES[(Math.random()*MARQUES.length)|0];
  const pile=J.conteneurs.filter(c=>!c.mort).length;
  /* position : grille 4 colonnes × max 4 lignes */
  const cols=4, cw=52, ch=28, marge=8;
  const totalW=cols*(cw+marge)-marge;
  const ox=(CW-totalW)/2;
  /* trouver une place libre */
  let px,py,found=false;
  for(let gy=3;gy>=0&&!found;gy--){for(let gx=0;gx<cols&&!found;gx++){
    px=ox+gx*(cw+marge);py=SOL_Y-ch-4-gy*(ch+6);
    if(!J.conteneurs.some(c=>!c.mort&&Math.abs(c.x-px)<cw&&Math.abs(c.y-py)<ch)){found=true;}}}
  if(!found)return;
  J.conteneurs.push({x:px,y:py,w:cw,h:ch,col,marque,mort:false,anim:0,tapAnim:0,shake:0});}

function taper(tx,ty){if(!J||J.fini)return;
  const V=vue();
  /* coordonnées monde */
  const mx=(tx*DPR-V.ox)/V.s, my=(ty*DPR-V.oy)/V.s;
  let touche=false;
  for(const c of J.conteneurs){if(c.mort)continue;
    if(mx>=c.x&&mx<=c.x+c.w&&my>=c.y&&my<=c.y+c.h){
      /* touché ! */
      c.mort=true;c.tapAnim=1;
      J.taps++;
      const pts=Math.round(10*J.combo*(1+J.niveau*.1));
      J.score+=pts;
      J.tCombo=2;
      J.combo=Math.min(8,J.combo+1);
      if(J.combo>J.maxCombo)J.maxCombo=J.combo;
      J.flash=.3;
      try{vibrer(10);}catch(x){}
      touche=true;break;}}
  if(!touche){J.combo=1;J.tCombo=0;J.rate++;}}

/* ===== DIMENSIONS ===== */
const CW=240, CH=360, SOL_Y=280;

function vue(){
  const marge=8*DPR;
  const s=Math.min((CV.width-marge*2)/CW,(CV.height-marge*2)/CH);
  return {s,ox:(CV.width-CW*s)/2,oy:(CV.height-CH*s)/2};}

/* ===== FOND : ciel, mer, montagnes, grues, quai ===== */
let FOND=null;
function fond(){
  const c=document.createElement('canvas');c.width=CV.width;c.height=CV.height;
  const g=c.getContext('2d');const V=vue();
  g.setTransform(V.s,0,0,V.s,V.ox,V.oy);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
  /* ciel dégradé */
  for(let y=0;y<120;y++){const k=y/120;R(0,y,CW,1,'rgb('+(79+k*50|0)+','+(150+k*32|0)+','+(210+k*26|0)+')');}
  /* nuages */
  for(let i=0;i<6;i++){const cx=hA(i,7,1)*CW,cy=15+hA(i,7,2)*50;
    for(let j=0;j<8;j++){g.fillStyle='rgba(255,255,255,'+(.15+hA(i,j,4)*.2)+')';
      g.beginPath();g.ellipse(cx+(j-4)*12,cy+hA(i,j,5)*5,14,4+hA(i,j,6)*3,0,0,7);g.fill();}}
  /* soleil */
  g.fillStyle='rgba(255,236,170,.3)';g.beginPath();g.arc(190,40,20,0,7);g.fill();
  g.fillStyle='rgba(255,246,208,.8)';g.beginPath();g.arc(190,40,8,0,7);g.fill();
  /* montagnes au loin */
  g.fillStyle='#8aa8b8';g.beginPath();g.moveTo(0,120);
  for(let x=0;x<=CW;x+=3)g.lineTo(x,120-10-Math.sin(x/30)*6-hA(x,3,21)*3);
  g.lineTo(CW,120);g.closePath();g.fill();
  /* mer */
  for(let y=120;y<SOL_Y-60;y++){const k=(y-120)/(SOL_Y-180);R(0,y,CW,1,'rgb('+(26+k*10|0)+','+(74+k*20|0)+','+(116+k*10|0)+')');}
  for(let i=0;i<100;i++){const x=hA(i,1,24)*CW,y=120+hA(i,2,24)*(SOL_Y-180);
    R(x,y,3+hA(i,3,24)*5,1,'rgba(180,215,235,'+(.15+hA(i,4,24)*.25)+')');}
  /* LE CARGO au loin */
  R(30,152,100,22,'#2a4468');R(30,148,80,6,'#f4f4f6');R(30,142,40,8,'#f4f4f6');
  R(42,134,4,10,'#c0392b');R(50,134,4,10,'#c0392b');
  R(30,170,100,4,'#06162a');
  R(60,152,60,2,'#c82010');
  /* mouettes */
  for(const [mx,my] of [[40,30],[90,20],[170,45],[210,25]]){
    R(mx,my,1,1,'#fff');R(mx-2,my+1,2,1,'#fff');R(mx+1,my+1,2,1,'#fff');}
  /* LE QUAI */
  /* bande jaune danger */
  for(let x=0;x<CW;x+=16)R(x,SOL_Y-62,10,3,'#f2c418');
  /* mur de quai béton */
  for(let y=SOL_Y-60;y<SOL_Y;y+=8)for(let x=0;x<CW;x+=20){
    const d=hA(x,y,51)*6-3;R(x,y,20,8,'rgb('+(160+d|0)+','+(154+d|0)+','+(140+d|0)+')');
    R(x,y,20,.5,'rgba(255,250,235,.12)');R(x,y,.5,8,'rgba(60,50,40,.08)');}
  /* le sol du quai : béton industriel */
  for(let y=SOL_Y;y<CH;y+=10)for(let x=0;x<CW;x+=28){
    const d=hA(x,y,52)*8-4;R(x,y,28,10,'rgb('+(150+d|0)+','+(146+d|0)+','+(132+d|0)+')');
    R(x,y,28,.5,'rgba(255,250,235,.1)');R(x,y,.5,10,'rgba(60,50,40,.06)');}
  /* grain */
  for(let i=0;i<400;i++){const x=hA(i,1,41)*CW,y=SOL_Y+hA(i,2,41)*(CH-SOL_Y);
    R(x,y,1,1,hA(i,3,41)<.4?'rgba(40,30,20,.2)':'rgba(255,245,220,.08)');}
  /* rails de grue encastrés */
  for(const ry of [SOL_Y+6,SOL_Y+CH-SOL_Y-10]){
    R(0,ry,CW,3,'#4a4a52');R(0,ry,CW,.5,'#7a7a82');R(0,ry+3,CW,.5,'#1a1a1a');}
  /* LES GRUES (2, à gauche et à droite, en arrière-plan) */
  for(const [gx,gDir] of [[10,1],[CW-20,-1]]){
    /* mât vertical */
    R(gx+8,80,4,SOL_Y-80,'#4a5060');R(gx+8,80,1,SOL_Y-80,'#6a6e78');
    /* flèche horizontale */
    R(gx,86,gDir>0?80:0,3,'#4a5060');R(gx+(gDir>0?0:-80),86,80,3,'#4a5060');
    R(gx+(gDir>0?0:-80),86,80,.5,'#6a6e78');
    /* contre-poids */
    R(gx+(gDir>0?-16:80),82,16,8,'#c82010');
    /* haubans */
    g.strokeStyle='#3a3e46';g.lineWidth=.5;
    g.beginPath();g.moveTo(gx+10,80);g.lineTo(gx+(gDir>0?70:-60),88);g.stroke();
    g.beginPath();g.moveTo(gx+10,80);g.lineTo(gx+(gDir>0?-10:30),88);g.stroke();
    /* feu rouge au sommet */
    R(gx+9,78,2,2,'#ff3a3a');}
  /* marquage au sol zone de déchargement */
  R(20,SOL_Y+2,CW-40,2,'#f2c418');R(20,CH-12,CW-40,2,'#f2c418');
  R(20,SOL_Y+2,2,CH-SOL_Y-14,'#f2c418');R(CW-22,SOL_Y+2,2,CH-SOL_Y-14,'#f2c418');
  FOND=c;}

/* ===== DESSIN ===== */
function dessiner(){if(!RAC||!J)return;
  const V=vue();if(!FOND||FOND.width!==CV.width)fond();
  G.setTransform(1,0,0,1,0,0);
  G.drawImage(FOND,0,0);
  G.setTransform(V.s,0,0,V.s,V.ox,V.oy);G.imageSmoothingEnabled=false;
  const R=(x,y,w,h,c)=>{G.fillStyle=c;G.fillRect(x,y,w,h);};
  /* dessiner les conteneurs */
  for(const c of J.conteneurs){
    if(c.mort){
      /* animation de disparition : le conteneur éclate vers le haut */
      c.tapAnim-=.04;if(c.tapAnim<=0)continue;
      G.globalAlpha=c.tapAnim;
      const dy=-20*(1-c.tapAnim);
      /* éclats */
      for(let i=0;i<6;i++){const a=i/6*6.28,r=18*(1-c.tapAnim);
        R(c.x+c.w/2+Math.cos(a)*r-2,c.y+c.h/2+Math.sin(a)*r+dy-2,4,4,c.col);}
      /* le texte "+pts" qui monte */
      G.fillStyle='#f2d070';G.font='900 10px system-ui';G.textAlign='center';G.textBaseline='middle';
      G.fillText('+'+Math.round(10*J.combo),c.x+c.w/2,c.y+dy-4);
      G.globalAlpha=1;continue;}
    /* ombre portée */
    G.fillStyle='rgba(0,0,0,.2)';G.beginPath();G.ellipse(c.x+c.w/2,c.y+c.h+2,c.w/2,3,0,0,7);G.fill();
    /* le conteneur lui-même : corps + nervures + marque */
    /* face principale */
    R(c.x,c.y,c.w,c.h,c.col);
    /* face du haut (3D isométrique) */
    const topH=4;
    G.fillStyle=brighter(c.col,30);R(c.x,c.y-topH,c.w,topH,brighter(c.col,30));
    R(c.x,c.y-topH,c.w,1,brighter(c.col,50));
    /* face droite (3D) */
    R(c.x+c.w,c.y-topH,4,c.h+topH,brighter(c.col,-30));
    R(c.x+c.w,c.y-topH,1,c.h+topH,brighter(c.col,-15));
    /* nervures verticales (rainures du conteneur) */
    for(let nx=c.x+4;nx<c.x+c.w;nx+=5){R(nx,c.y,1,c.h,brighter(c.col,-15));R(nx+1,c.y,1,c.h,brighter(c.col,10));}
    /* portes (lignes verticales) à droite du conteneur */
    R(c.x+c.w-10,c.y+2,1,c.h-4,brighter(c.col,-20));
    /* serrure */
    R(c.x+c.w-8,c.y+c.h/2-1,2,2,brighter(c.col,-40));
    /* reflet en haut */
    R(c.x+2,c.y+1,c.w-6,1,'rgba(255,255,255,.25)');
    /* ombre en bas */
    R(c.x,c.y+c.h-1,c.w,1,brighter(c.col,-35));
    /* MARQUE en blanc */
    G.fillStyle='rgba(255,255,255,.85)';G.font='900 7px system-ui';G.textAlign='left';G.textBaseline='middle';
    G.fillText(c.marque,c.x+4,c.y+c.h/2);
    /* numéro de série */
    G.fillStyle='rgba(255,255,255,.5)';G.font='700 4px ui-monospace';
    G.fillText('MSKU'+(c.x*7+c.y*13&0xffffff).toString(10).slice(0,7),c.x+4,c.y+c.h-4);
    /* animation d'apparition */
    if(c.anim<1){c.anim=Math.min(1,c.anim+.06);}
    /* shake quand raté */
    if(c.shake>0){c.shake-=.05;}}
  /* HUD : score, combo, chrono */
  G.setTransform(1,0,0,1,0,0);
  const u=CV.width/100;
  /* barre du haut */
  G.fillStyle='rgba(10,20,30,.75)';roundRect(G,2*u,2*u,96*u,8*u,2*u);G.fill();
  /* score */
  G.fillStyle='#f2d070';G.font='900 '+(3.5*u)+'px system-ui';G.textAlign='left';G.textBaseline='middle';
  G.fillText(J.score.toLocaleString('fr-FR')+' €',4*u,6*u);
  /* combo */
  if(J.combo>1){G.fillStyle='#ff6a3a';G.textAlign='center';G.fillText('🔥 ×'+J.combo,50*u,6*u);}
  /* chrono */
  G.fillStyle=J.chrono<10?'#ff4040':'#ffffff';G.textAlign='right';
  G.fillText(Math.ceil(J.chrono)+'s',96*u,6*u);
  /* flash */
  if(J.flash>0){G.fillStyle='rgba(255,246,210,'+(J.flash)+')';G.fillRect(0,0,CV.width,CV.height);J.flash=Math.max(0,J.flash-.02);}
}

function brighter(hex,d){const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+c(16)+','+c(8)+','+c(0)+')';}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.arc(x+w-r,y+r,r,-Math.PI/2,0);g.lineTo(x+w,y+h-r);g.arc(x+w-r,y+h-r,r,0,Math.PI/2);g.lineTo(x+r,y+h);g.arc(x+r,y+h-r,r,Math.PI/2,Math.PI);g.lineTo(x,y+r);g.arc(x+r,y+r,r,Math.PI,Math.PI*1.5);g.closePath();}

/* ===== BOUCLE ===== */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);
  const dt=Math.min(1/20,(t-(boucle.t||t))/1000);boucle.t=t;if(!J||J.fini)return;
  /* chrono */
  J.chrono-=dt;if(J.chrono<=0){J.chrono=0;J.fini=true;finDePartie();return;}
  /* combo decay */
  if(J.tCombo>0){J.tCombo-=dt;if(J.tCombo<=0)J.combo=1;}
  /* spawn de nouveaux conteneurs */
  J.spawn-=dt;
  if(J.spawn<=0){spawner();J.spawn=Math.max(.4,J.spawnRate-J.taps*.01);}
  /* nettoyer les morts */
  J.conteneurs=J.conteneurs.filter(c=>!c.mort||c.tapAnim>0);
  /* niveau */
  J.niveau=1+Math.floor(J.taps/15);
  dessiner();}

/* ===== FIN DE PARTIE ===== */
async function finDePartie(){
  dessiner();
  try{vibrer([20,60,20]);}catch(x){}
  /* sauvegarder le record */
  let rec=0;try{rec=+(localStorage.getItem('ctn_record')||0);}catch(x){}
  const nouveau=J.score>rec;
  if(nouveau)try{localStorage.setItem('ctn_record',''+J.score);}catch(x){}
  /* verser l'argent côté serveur */
  let verse=0;
  try{const r=await rpc('conteneur_fin',{score:J.score,taps:J.taps,combo:J.maxCombo});
    if(r&&typeof r.verse==='number')verse=r.verse;}catch(x){verse=Math.round(J.score*.8);}
  if(!verse)verse=Math.round(J.score*.8);
  /* écran de fin */
  const d=document.createElement('div');d.className='ctnFin';
  d.innerHTML='<div class="t">'
    +'<div class="k">DÉCHARGEMENT TERMINÉ</div>'
    +'<div class="sc">'+J.score.toLocaleString('fr-FR')+' points</div>'
    +'<div class="dt">'+J.taps+' conteneurs · combo max ×'+J.maxCombo+'</div>'
    +(nouveau?'<div class="nr">🏆 Nouveau record !</div>':'')
    +'<div class="eu">'+verse.toLocaleString('fr-FR')+' € versés</div>'
    +'<div class="bts"><button class="o1">Rejouer</button><button class="o2">Quitter</button></div>'
    +'</div>';
  RAC.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
  d.querySelector('.o1').onclick=()=>{d.remove();nouveau();};
  d.querySelector('.o2').onclick=()=>{d.remove();fermer();};}

/* ===== CSS ===== */
const CSS=`
#ctn{position:fixed;inset:0;z-index:2147482000;background:#0a1420;display:flex;flex-direction:column;opacity:0;transition:opacity .25s;touch-action:none;user-select:none;-webkit-user-select:none}
#ctn.on{opacity:1}
#ctn .scene{flex:1;position:relative;overflow:hidden}
#ctn .scene canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
#ctn .bar{flex:none;display:flex;gap:8px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:#0e1626;justify-content:center}
#ctn .bar button{border:0;border-radius:12px;padding:10px 18px;font:800 14px system-ui;cursor:pointer;-webkit-tap-highlight-color:transparent}
#ctn .x{background:rgba(255,255,255,.12);color:#fff}
#ctn .x:active{background:rgba(255,255,255,.2)}
#ctn .nav{font:700 10px system-ui;color:#8ab0d0;letter-spacing:1px;text-align:center;padding:2px 0}
.ctnFin{position:absolute;inset:0;background:rgba(10,20,34,.8);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}
.ctnFin.on{opacity:1}
.ctnFin .t{width:min(320px,88vw);background:#f6edd6;border-radius:20px;padding:22px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.4);font-family:system-ui,sans-serif}
.ctnFin .k{font:800 11px system-ui;letter-spacing:2px;color:#8a7a5a}
.ctnFin .sc{font:900 32px system-ui;color:#2a2016;margin:6px 0}
.ctnFin .dt{font:700 13px system-ui;color:#6a5a40}
.ctnFin .nr{font:800 15px system-ui;color:#c8a040;margin:8px 0}
.ctnFin .eu{font:900 20px system-ui;color:#2a8a4a;margin:10px 0 16px}
.ctnFin .bts{display:flex;gap:10px}
.ctnFin .bts button{flex:1;border:0;border-radius:14px;padding:13px;font:800 15px system-ui;cursor:pointer}
.ctnFin .o1{background:#2a5a9a;color:#fff;box-shadow:0 4px 0 #1a3a6a}
.ctnFin .o2{background:rgba(0,0,0,.08);color:#2a2016}
.ctnFin .o1:active,.ctnFin .o2:active{transform:translateY(2px)}`;

function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);
  CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);FOND=null;}

function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;J=null;
  window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);
  removeEventListener('resize',cadrer);}

window.ouvrirConteneurs=function(){if(RAC)return;
  if(!document.getElementById('ctnCss')){const s=document.createElement('style');s.id='ctnCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='ctn';RAC=d;
  d.innerHTML='<div class="nav">DÉCHARGEMENT DE CONTENEURS</div>'
    +'<div class="scene"><canvas></canvas></div>'
    +'<div class="bar"><button class="x">✕ Quitter</button></div>';
  document.body.appendChild(d);
  CV=d.querySelector('.scene canvas');G=CV.getContext('2d');
  cadrer();addEventListener('resize',cadrer);
  nouveau();
  requestAnimationFrame(()=>{d.classList.add('on');window.ECRAN_COUVRANT=true;});
  RAF=requestAnimationFrame(boucle);
  /* tactile */
  CV.addEventListener('pointerdown',ev=>{ev.preventDefault();
    const r=CV.getBoundingClientRect();taper(ev.clientX-r.left,ev.clientY-r.top);},{passive:false});
  d.querySelector('.x').onclick=fermer;};
})();
