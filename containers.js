/* =====================================================================
   LE CONTENEUR (containers.js) — Un seul gros conteneur au centre.
   Tu tapes dessus, tu gagnes 1 €. Plein écran, beau fond portuaire
   au style du spawn (D=2, demi-pixel, dégradés, grain). Le conteneur
   vibre et flashe à chaque tap.
   ===================================================================== */
(()=>{
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const hx=s=>{const v=parseInt(s.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return'rgb('+c(16)+','+c(8)+','+c(0)+')';};

let RAC=null,CV=null,G=null,RAF=0;
let euros=0, tapAnim=0, flash=0, shake=0, particles=[], FOND=null;

/* ===== FOND PRÉ-RENDU AU STYLE DU SPAWN ===== */
function fond(){
  const D=2, W=360, H=640;
  const c=document.createElement('canvas');c.width=W*D;c.height=H*D;
  const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(.5,Math.round(w*2)/2),Math.max(.5,Math.round(h*2)/2));};
  const VG=(x,y,w,h,c1,c2)=>{for(let k=0;k<h;k+=.5)R(x,y+k,w,.5,mix(c1,c2,k/Math.max(.5,h-.5)));};
  const ell=(cx,cy,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();};

  /* CIEL dégradé doux */
  VG(0,0,W,180,'#4a9edc','#c8e4f0');
  /* nuages 3 plans */
  for(let pl=0;pl<3;pl++){const ny=15+pl*35;
    for(let i=0;i<9;i++){const cx=hA(i+pl*30,7,1)*W,cy=ny+hA(i+pl*30,7,2)*22,sp=45+hA(i+pl*30,7,3)*70;
      for(let j=0;j<16;j++){g.fillStyle='rgba(255,255,255,'+(.08+hA(i,j+pl*12,4)*.12)+')';
        g.beginPath();g.ellipse(cx+(j-8)*sp/14,cy+hA(i,j,5)*6-3,sp/9+hA(i,j,8)*4,2.5+hA(i,j,6)*3,0,0,7);g.fill();}}}
  /* soleil halo */
  for(const[r,a]of[[36,.06],[24,.12],[16,.22],[9,.45],[4,.8],[2,1]]){g.fillStyle='rgba(255,238,175,'+a+')';g.beginPath();g.arc(280,45,r,0,7);g.fill();}
  /* montagnes 2 plans */
  g.fillStyle='#8aa8b8';g.beginPath();g.moveTo(0,180);for(let x=0;x<=W;x+=2)g.lineTo(x,180-14-Math.sin(x/70)*8-hA(x,3,21)*3);g.lineTo(W,180);g.closePath();g.fill();
  g.fillStyle='#6a8898';g.beginPath();g.moveTo(0,180);for(let x=0;x<=W;x+=2)g.lineTo(x,180-8-Math.sin(x/45)*6-hA(x,2,22)*2);g.lineTo(W,180);g.closePath();g.fill();
  /* MER dégradé + reflets + crêtes */
  VG(0,180,W,120,'#1a4a68','#0e2a3e');
  for(let y=180;y<300;y++){const k=(y-180)/120;const w=15+k*50;for(let i=0;i<3;i++){const dx=hA(y,i,31)*w*2-w;R(280+dx,y,1.5+hA(y,i,32)*1.5,.5,'rgba(255,220,150,'+(.16*(1-k))+')');}};
  for(let i=0;i<180;i++){const x=hA(i,1,24)*W,y=186+hA(i,2,24)*108,l=3+hA(i,3,24)*6;R(x,y,l,.5,'rgba(180,215,235,'+(.1+hA(i,4,24)*.16)+')');}
  for(let i=0;i<60;i++)R(hA(i,1,25)*W,297+hA(i,2,25)*2,2+hA(i,3,25)*3,.5,'rgba(255,255,255,'+(.25+hA(i,4,25)*.3)+')');
  /* CARGO au loin */
  ell(140,275,65,3,'rgba(0,0,0,.1)');
  g.fillStyle='#2a4468';g.beginPath();g.moveTo(50,264);g.lineTo(50,250);g.quadraticCurveTo(60,246,80,245);g.lineTo(200,245);g.quadraticCurveTo(216,247,220,254);g.quadraticCurveTo(224,260,220,264);g.closePath();g.fill();
  R(54,256,166,2,'#c82010');R(68,238,110,10,'#f0ece4');R(68,238,110,1,'#fff');
  VG(72,240,102,6,'#2a4868','#4a6888');for(let x=76;x<172;x+=6)R(x,240,.5,6,'#1a2a3a');
  R(96,230,36,10,'#f0ece4');VG(100,232,28,6,'#2a4868','#1a2a3a');
  for(const cx of[104,114]){R(cx,222,8,10,'#c82010');R(cx,222,8,1.5,'#1a1a1a');R(cx+2,226,4,3,'#fff');}
  for(const[bx,bc]of[[66,'#c0392b'],[74,'#2a5a9a'],[82,'#3a8a4a'],[90,'#f0a030'],[170,'#7a3ad0'],[178,'#1a6a6a']]){R(bx,247,6,3,bc);R(bx,244,6,3,tn(bc,18));}
  for(let x=58;x<214;x+=6){ell(x,260,1.5,1.5,'#5a5448');ell(x,260,1,1,'#17262c');}
  R(50,262,170,2.5,'#06162a');
  /* mouettes */
  for(const[mx,my,s]of[[55,32,1],[150,20,1.1],[248,48,.9],[310,30,1],[88,62,.8]]){R(mx,my,s,1,'#fff');R(mx-2*s,my+1,2*s,1,'#fff');R(mx+s,my+1,2*s,1,'#fff');}
  /* QUAI : bord + pavés + caniveau + marquage jaune */
  R(0,298,W,3,'#ece4d2');R(0,298,W,.5,'#fbf6ea');R(0,300.5,W,.5,'#bfb196');
  for(let y=301;y<308;y+=3.5)for(let x=0;x<W;x+=5)R(x,y,5,3.5,['#8a847a','#827c72','#928c82'][(hA(x,y,8)*3)|0]);
  R(0,308,W,3,'#9aa0a6');for(let x=0;x<W;x+=2.5)R(x,308.5,1.5,2,'#4a5058');
  for(let x=0;x<W;x+=14){R(x,311,10,3,'#f2c418');R(x,314,10,.5,'#c8a008');}
  /* dalles opus romain */
  const OP=[[0,0,24,16],[24,0,16,16],[40,0,24,24],[0,16,16,24],[16,16,24,8],[16,24,24,16],[40,24,24,16]];
  const dalle=(x,y,w,h,col,j)=>{R(x,y,w,h,j);R(x+.5,y+.5,w-1,h-1,col);R(x+.5,y+.5,w-1,.5,tn(col,14));R(x+.5,y+.5,.5,h-1,tn(col,8));R(x+.5,y+h-1,w-1,.5,tn(col,-12));};
  for(let by=316;by<H;by+=40)for(let bx=0;bx<W;bx+=64)for(const[dx,dy,w,h]of OP)
    dalle(bx+dx,by+dy,w,Math.min(h,H-by-dy),['#c0bbab','#b8b2a2','#c4bead','#b4ada0','#c8c2b2'][(hA(bx+dx,by+dy,9)*5)|0],'#9a9488');
  for(let i=0;i<500;i++){const x=hA(i,1,41)*W,y=316+hA(i,2,41)*(H-316);R(x,y,1,1,hA(i,3,41)<.4?'rgba(50,40,30,.16)':'rgba(255,245,225,.06)');}
  for(let i=0;i<6;i++)ell(hA(i,1,42)*W,340+hA(i,2,42)*(H-360),7+hA(i,3,42)*8,3+hA(i,4,42)*2,'rgba(30,22,16,.1)');
  /* rails */
  for(const ry of[318,H-20]){R(0,ry,W,3,'#4a4a52');R(0,ry,W,.5,'#7a7a82');R(0,ry+2.5,W,.5,'#1a1a1a');}
  /* grues portiques */
  for(const[gx,gDir]of[[4,1],[W-14,-1]]){
    for(const px of[gx+2,gx+16]){VG(px,298,2.5,H-298,'#5a5e66','#3a3e44');R(px,298,.5,H-298,'#7a7e86');}
    R(gx,290,20,3,'#4a5060');R(gx+(gDir>0?18:-80),284,88,2.5,'#4a5060');
    R(gx+(gDir>0?-14:20),280,14,7,'#c0392b');VG(gx+3,278,12,10,'#f0c040','#c89a20');VG(gx+5,282,8,5,'#2a4868','#1a2a3a');
    g.strokeStyle='#3a3e46';g.lineWidth=.5;g.beginPath();g.moveTo(gx+9,278);g.lineTo(gx+(gDir>0?96:-68),286);g.stroke();
    R(gx+8,276,2,2,'#ff3a3a');}
  FOND=c;}

/* ===== LE GROS CONTENEUR ===== */
function drawConteneur(g,VW,VH,t){
  const CX=VW/2, CY=VH*.54;
  const CW=VW*.62, CH=CW*.44, TOP=CH*.17, SIDE=CH*.13;
  const col='#c0392b';
  const sx=shake>0?Math.sin(t*80)*shake*4:0, sy=shake>0?Math.cos(t*60)*shake*2:0;
  const sc=1+tapAnim*.05;
  g.save();g.translate(CX+sx,CY+sy);g.scale(sc,sc);g.translate(-CX,-CY);
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const x0=CX-CW/2, y0=CY-CH/2;
  /* ombre */
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(CX+4,y0+CH+SIDE*.3,CW*.55,CH*.11,0,0,7);g.fill();
  /* FACE PRINCIPALE */
  R(x0,y0,CW,CH,col);
  for(let nx=x0+6;nx<x0+CW;nx+=6){R(nx,y0,2,CH,tn(col,-12));R(nx+2,y0,1,CH,tn(col,10));}
  {const gr=g.createLinearGradient(0,y0,0,y0+CH*.3);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x0,y0,CW,CH*.3);}
  R(x0,y0+CH-3,CW,3,tn(col,-30));
  R(x0,y0,CW,2,tn(col,25));R(x0,y0+CH-2,CW,2,tn(col,-35));R(x0,y0,2,CH,tn(col,15));R(x0+CW-2,y0,2,CH,tn(col,-20));
  /* portes */
  const dw=CW*.22;
  R(x0+CW-dw-4,y0+4,1,CH-8,tn(col,-18));R(x0+CW-dw/2-2,y0+4,1,CH-8,tn(col,-18));
  for(const dy of[-CH*.15,CH*.15]){R(x0+CW-dw+4,CY+dy-3,2,6,tn(col,-35));R(x0+CW-dw/2+4,CY+dy-3,2,6,tn(col,-35));}
  R(x0+CW-dw-2,CY-2,3,4,tn(col,-45));
  /* coins ISO */
  for(const[cx,cy]of[[x0+2,y0+2],[x0+CW-10,y0+2],[x0+2,y0+CH-10],[x0+CW-10,y0+CH-10]]){R(cx,cy,8,8,'#2a2a30');R(cx+1,cy+1,6,6,'#4a4a52');R(cx+2.5,cy+2.5,3,3,'#2a2a30');}
  /* DESSUS 3D */
  R(x0,y0-TOP,CW,TOP,tn(col,24));R(x0,y0-TOP,CW,1.5,tn(col,40));
  for(let nx=x0+6;nx<x0+CW;nx+=6)R(nx,y0-TOP,1,TOP,tn(col,12));
  /* CÔTÉ DROIT 3D */
  R(x0+CW,y0-TOP,SIDE,CH+TOP,tn(col,-24));R(x0+CW,y0-TOP,1.5,CH+TOP,tn(col,-10));R(x0+CW+SIDE-1.5,y0-TOP,1.5,CH+TOP,tn(col,-40));
  R(x0+CW,y0-TOP,SIDE,TOP,tn(col,6));
  /* MARQUE */
  g.fillStyle='rgba(255,255,255,.9)';g.font='900 '+Math.round(CW*.12)+'px system-ui';g.textAlign='left';g.textBaseline='middle';
  g.fillText('MSC',x0+CW*.06,CY-CH*.12);
  g.fillStyle='rgba(255,255,255,.5)';g.font='600 '+Math.round(CW*.05)+'px ui-monospace,monospace';
  g.fillText('MSCU 741 592-6',x0+CW*.06,CY+CH*.15);
  g.fillStyle='rgba(255,255,255,.6)';g.font='700 '+Math.round(CW*.04)+'px ui-monospace';
  g.fillText('22G1',x0+CW*.06,y0+CH*.12);
  /* pastille danger */
  R(x0+CW*.06,y0+CH-CW*.1,CW*.06,CW*.06,'#f0c040');
  g.fillStyle='#1a1a1a';g.font='900 '+Math.round(CW*.05)+'px system-ui';g.textAlign='center';
  g.fillText('!',x0+CW*.09,y0+CH-CW*.07);
  g.restore();}

/* ===== BOUCLE ===== */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);
  const dt=Math.min(.05,(t-(boucle.t||t))/1000);boucle.t=t;
  if(tapAnim>0)tapAnim=Math.max(0,tapAnim-.06);
  if(shake>0)shake=Math.max(0,shake-.04);
  if(flash>0)flash=Math.max(0,flash-.03);
  const r=CV.getBoundingClientRect();const DPR=Math.min(2,devicePixelRatio||1);
  const cw=Math.round(r.width*DPR),ch=Math.round(r.height*DPR);
  if(CV.width!==cw||CV.height!==ch){CV.width=cw;CV.height=ch;}
  if(!FOND)fond();
  G.setTransform(1,0,0,1,0,0);G.fillStyle='#0a1420';G.fillRect(0,0,CV.width,CV.height);
  const sx=CV.width/720,sy=CV.height/1280,s=Math.max(sx,sy);
  const ox=(CV.width-720*s)/2,oy=(CV.height-1280*s)/2;
  G.drawImage(FOND,ox,oy,720*s,1280*s);
  drawConteneur(G,CV.width,CV.height,t/1000);
  /* particules */
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.3;p.life-=dt;
    if(p.life<=0){particles.splice(i,1);continue;}
    G.globalAlpha=Math.min(1,p.life*2);
    if(p.text){G.fillStyle=p.col;G.font='900 '+Math.round(CV.width*.06)+'px system-ui';G.textAlign='center';G.textBaseline='middle';G.fillText(p.text,p.x,p.y);}
    else{G.fillStyle=p.col;const sz=p.sz*CV.width/360;G.fillRect(p.x-sz/2,p.y-sz/2,sz,sz);}
    G.globalAlpha=1;}
  /* HUD */
  G.setTransform(1,0,0,1,0,0);const u=CV.width/100;
  G.fillStyle='rgba(10,20,30,.65)';G.beginPath();
  const bx=3*u,by=3*u,bw=94*u,bh=10*u,br=2.5*u;
  G.moveTo(bx+br,by);G.lineTo(bx+bw-br,by);G.arcTo(bx+bw,by,bx+bw,by+br,br);G.lineTo(bx+bw,by+bh-br);G.arcTo(bx+bw,by+bh,bx+bw-br,by+bh,br);G.lineTo(bx+br,by+bh);G.arcTo(bx,by+bh,bx,by+bh-br,br);G.lineTo(bx,by+br);G.arcTo(bx,by,bx+br,by,br);G.closePath();G.fill();
  G.fillStyle='#f2d070';G.font='900 '+Math.round(4.5*u)+'px system-ui';G.textAlign='center';G.textBaseline='middle';
  G.fillText(euros.toLocaleString('fr-FR')+' €',CV.width/2,by+bh/2);
  if(flash>0){G.fillStyle='rgba(255,246,210,'+flash+')';G.fillRect(0,0,CV.width,CV.height);}}

function taper(ex,ey){
  euros++;tapAnim=1;shake=1;flash=.25;
  try{vibrer(12);}catch(x){}
  const DPR=devicePixelRatio||1;
  for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,v=2+Math.random()*4;
    particles.push({x:ex*DPR,y:ey*DPR,vx:Math.cos(a)*v*CV.width/360,vy:Math.sin(a)*v*CV.width/360-3,life:.8,col:'#f2d070',sz:3+Math.random()*3});}
  particles.push({x:ex*DPR,y:ey*DPR-CV.width*.08,vx:0,vy:-2,life:1,text:'+1 €',col:'#f2d070',sz:0});
  if(euros%10===0){try{rpc('conteneur_tap',{euros:10}).catch(()=>{});}catch(x){}}}

const CSS=`
#ctn{position:fixed;inset:0;z-index:2147482000;background:#0a1420;display:flex;flex-direction:column;opacity:0;transition:opacity .25s;touch-action:none;user-select:none;-webkit-user-select:none}
#ctn.on{opacity:1}
#ctn .scene{flex:1;position:relative;overflow:hidden}
#ctn .scene canvas{position:absolute;inset:0;width:100%;height:100%}
#ctn .bar{flex:none;display:flex;gap:8px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:#0e1626;justify-content:center}
#ctn .bar button{border:0;border-radius:12px;padding:10px 18px;font:800 14px system-ui;cursor:pointer;-webkit-tap-highlight-color:transparent}
#ctn .x{background:rgba(255,255,255,.12);color:#fff}
#ctn .x:active{background:rgba(255,255,255,.2)}`;

function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;
  window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);
  if(euros>0){try{rpc('conteneur_tap',{euros}).catch(()=>{});}catch(x){}}euros=0;}

window.ouvrirConteneurs=function(){if(RAC)return;
  if(!document.getElementById('ctnCss')){const s=document.createElement('style');s.id='ctnCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='ctn';RAC=d;
  d.innerHTML='<div class="scene"><canvas></canvas></div><div class="bar"><button class="x">✕ Quitter</button></div>';
  document.body.appendChild(d);CV=d.querySelector('.scene canvas');G=CV.getContext('2d');
  FOND=null;particles=[];euros=0;tapAnim=0;flash=0;shake=0;
  requestAnimationFrame(()=>{d.classList.add('on');window.ECRAN_COUVRANT=true;});
  RAF=requestAnimationFrame(boucle);
  CV.addEventListener('pointerdown',ev=>{ev.preventDefault();taper(ev.clientX,ev.clientY);},{passive:false});
  d.querySelector('.x').onclick=fermer;};
})();
