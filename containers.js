/* =====================================================================
   LE CONTENEUR (containers.js) — Un gros conteneur 3D au centre sur un
   quai vivant : mer animée, nuages qui défilent, mouettes qui volent,
   soleil qui pulse, cargo qui tangue, grue avec câble qui oscille.
   Tape sur le conteneur = +1 €. Fond entièrement animé à chaque frame.
   ===================================================================== */
(()=>{
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const hx=s=>{const v=parseInt(s.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const c=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return'rgb('+c(16)+','+c(8)+','+c(0)+')';};

let RAC=null,CV=null,G=null,RAF=0;
let euros=0,tapAnim=0,flash=0,shake=0,particles=[];

/* ===== MOUETTES ANIMÉES ===== */
const MOUETTES=[];for(let i=0;i<6;i++)MOUETTES.push({x:Math.random()*360,y:20+Math.random()*80,vx:.3+Math.random()*.4,phase:Math.random()*6.28});

/* ===== NUAGES ANIMÉS ===== */
const NUAGES=[];for(let i=0;i<12;i++)NUAGES.push({x:Math.random()*500-70,y:10+Math.random()*90,w:40+Math.random()*80,h:8+Math.random()*12,a:.06+Math.random()*.1,v:.08+Math.random()*.12});

/* ===== DESSIN COMPLET ANIMÉ ===== */
function dessiner(g,W,H,t){
  g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const ell=(cx,cy,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();};
  const VG=(x,y,w,h,c1,c2)=>{for(let k=0;k<h;k++)R(x,y+k,w,1,mix(c1,c2,k/Math.max(1,h-1)));};
  const HZ=H*.28, MER=H*.47, QUAI=H*.49;

  /* ============ CIEL dégradé ============ */
  VG(0,0,W,HZ,'#4a9edc','#c8e4f0');

  /* ============ NUAGES qui défilent ============ */
  for(const n of NUAGES){
    n.x+=n.v;if(n.x>W+100)n.x=-n.w*2;
    for(let j=0;j<8;j++){
      const a=n.a+Math.sin(t*.3+j)*.02;
      g.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';
      g.beginPath();g.ellipse(n.x+(j-4)*n.w/8,n.y+Math.sin(j*1.3)*n.h*.3,n.w/6,n.h/2+Math.sin(t*.5+j)*1,0,0,7);g.fill();}}

  /* ============ SOLEIL qui pulse doucement ============ */
  const sp=1+Math.sin(t*.8)*.08;
  for(const[r,a]of[[40*sp,.04],[28*sp,.1],[18*sp,.18],[10*sp,.4],[5*sp,.75],[2.5*sp,1]]){
    g.fillStyle='rgba(255,238,175,'+a+')';g.beginPath();g.arc(W*.78,H*.07,r,0,7);g.fill();}

  /* ============ MONTAGNES ============ */
  g.fillStyle='#8aa8b8';g.beginPath();g.moveTo(0,HZ);
  for(let x=0;x<=W;x+=2)g.lineTo(x,HZ-H*.025-Math.sin(x/70)*H*.012-hA(x,3,21)*H*.005);
  g.lineTo(W,HZ);g.closePath();g.fill();
  g.fillStyle='#6a8898';g.beginPath();g.moveTo(0,HZ);
  for(let x=0;x<=W;x+=2)g.lineTo(x,HZ-H*.014-Math.sin(x/45)*H*.009-hA(x,2,22)*H*.004);
  g.lineTo(W,HZ);g.closePath();g.fill();

  /* ============ MER ANIMÉE ============ */
  for(let y=HZ;y<QUAI;y++){const k=(y-HZ)/(QUAI-HZ);
    R(0,y,W,1,'rgb('+(20+k*10|0)+','+(55+k*35|0)+','+(95+k*25|0)+')');}
  /* reflet soleil qui ondule */
  for(let y=HZ;y<QUAI;y++){const k=(y-HZ)/(QUAI-HZ);const w=12+k*50;
    for(let i=0;i<3;i++){const dx=Math.sin(t*1.2+y*.04+i*2)*w*.5+hA(y,i,31)*w;
      R(W*.78+dx-w,y,2+Math.sin(t+y*.1+i)*.8,1,'rgba(255,220,150,'+(.14*(1-k)).toFixed(2)+')');}}
  /* vagues animées (crêtes qui bougent) */
  for(let i=0;i<180;i++){const bx=hA(i,1,24)*W,by=HZ+8+hA(i,2,24)*(QUAI-HZ-14);
    const dx=Math.sin(t*1.5+i*.7)*3;
    R(bx+dx,by,3+hA(i,3,24)*6,1,'rgba(180,215,235,'+(.08+hA(i,4,24)*.14)+')');}
  /* écume au pied du quai (ondule) */
  for(let i=0;i<60;i++){const bx=hA(i,1,25)*W+Math.sin(t*2+i)*2;
    R(bx,QUAI-2+Math.sin(t*1.8+i*.5)*.5,2+hA(i,3,25)*3,1,'rgba(255,255,255,'+(.2+hA(i,4,25)*.3)+')');}

  /* ============ CARGO QUI TANGUE ============ */
  const cargoY=QUAI-H*.06, tangue=Math.sin(t*.7)*1.5;
  g.save();g.translate(W*.39,cargoY);g.rotate(Math.sin(t*.5)*.008);g.translate(-W*.39,-cargoY);
  ell(W*.39,cargoY+3,W*.18,H*.005,'rgba(0,0,0,.1)');
  g.fillStyle='#2a4468';g.beginPath();
  g.moveTo(W*.14,cargoY+tangue);g.lineTo(W*.14,cargoY-H*.025+tangue);g.quadraticCurveTo(W*.17,cargoY-H*.03+tangue,W*.22,cargoY-H*.032+tangue);
  g.lineTo(W*.56,cargoY-H*.032+tangue);g.quadraticCurveTo(W*.6,cargoY-H*.03+tangue,W*.62,cargoY-H*.02+tangue);
  g.quadraticCurveTo(W*.63,cargoY-H*.012+tangue,W*.62,cargoY+tangue);g.closePath();g.fill();
  R(W*.15,cargoY-H*.02+tangue,W*.46,H*.003,'#c82010');
  /* pont */
  R(W*.19,cargoY-H*.05+tangue,W*.3,H*.018,'#f0ece4');
  for(let x=W*.2;x<W*.48;x+=W*.016)R(x,cargoY-H*.046+tangue,1,H*.012,'rgba(20,30,40,.3)');
  /* cheminées */
  for(const cx of[W*.29,W*.32]){R(cx,cargoY-H*.075+tangue,W*.022,H*.028,'#c82010');R(cx+W*.005,cargoY-H*.06+tangue,W*.012,H*.008,'#fff');}
  /* conteneurs colorés sur le pont */
  for(const[bx,bc]of[[W*.18,'#c0392b'],[W*.21,'#2a5a9a'],[W*.24,'#3a8a4a'],[W*.27,'#f0a030'],[W*.47,'#7a3ad0'],[W*.5,'#1a6a6a']]){
    R(bx,cargoY-H*.035+tangue,W*.016,H*.006,bc);R(bx,cargoY-H*.04+tangue,W*.016,H*.005,tn(bc,18));}
  /* hublots */
  for(let x=W*.16;x<W*.6;x+=W*.016)ell(x,cargoY-H*.01+tangue,W*.004,W*.004,'#17262c');
  R(W*.14,cargoY-H*.002+tangue,W*.48,H*.004,'#06162a');
  g.restore();

  /* ============ MOUETTES ANIMÉES ============ */
  for(const m of MOUETTES){
    m.x+=m.vx;if(m.x>W+20)m.x=-20;
    const wy=m.y+Math.sin(t*2+m.phase)*4;
    const wing=Math.sin(t*6+m.phase)*3;
    g.fillStyle='#ffffff';
    R(m.x,wy,2,1,'#fff');R(m.x-4,wy+1-wing,4,1,'#fff');R(m.x+2,wy+1+wing,4,1,'#fff');
    R(m.x-6,wy+2-wing*1.3,2,1,'rgba(255,255,255,.5)');}

  /* ============ QUAI ============ */
  R(0,QUAI-H*.004,W,H*.005,'#ece4d2');R(0,QUAI-H*.004,W,1,'#fbf6ea');
  for(let y=QUAI;y<QUAI+H*.015;y+=H*.006)for(let x=0;x<W;x+=W*.014)
    R(x,y,W*.014,H*.006,['#8a847a','#827c72','#928c82'][(hA(x|0,y|0,8)*3)|0]);
  R(0,QUAI+H*.015,W,H*.005,'#9aa0a6');
  for(let x=0;x<W;x+=W*.04){R(x,QUAI+H*.02,W*.028,H*.005,'#f2c418');}
  /* dalles */
  const DY=QUAI+H*.03;
  for(let y=DY;y<H;y+=H*.03)for(let x=0;x<W;x+=W*.05){
    const d=hA(x|0,y|0,51)*8-4;const col=tn(['#c0bbab','#b8b2a2','#c4bead'][(hA(x|0,y|0,9)*3)|0],d|0);
    R(x,y,W*.05,H*.03,col);R(x,y,W*.05,1,tn(col,12));R(x,y,1,H*.03,tn(col,8));R(x+W*.05-1,y,1,H*.03,tn(col,-10));R(x,y+H*.03-1,W*.05,1,tn(col,-10));}
  for(let i=0;i<400;i++){const x=hA(i,1,41)*W,y=DY+hA(i,2,41)*(H-DY);R(x,y,1,1,hA(i,3,41)<.4?'rgba(50,40,30,.14)':'rgba(255,245,225,.05)');}
  /* rails */
  R(0,DY,W,H*.005,'#4a4a52');R(0,DY,W,1,'#7a7a82');
  R(0,H-H*.03,W,H*.005,'#4a4a52');R(0,H-H*.03,W,1,'#7a7a82');
  /* grues portiques animées (câble qui oscille) */
  for(const[gx,gDir]of[[W*.01,1],[W*.93,-1]]){
    const gh=H*.02;
    for(const px of[gx,gx+W*.05])R(px,QUAI-H*.01,W*.007,H-QUAI+H*.01,'#4a5060');
    R(gx-W*.01,QUAI-H*.03,W*.07,H*.006,'#4a5060');
    R(gx+(gDir>0?W*.06:-W*.24),QUAI-H*.045,W*.24,H*.004,'#4a5060');
    R(gx+(gDir>0?-W*.04:W*.06),QUAI-H*.055,W*.04,H*.012,'#c0392b');
    R(gx+W*.005,QUAI-H*.06,W*.04,H*.02,'#f0c040');R(gx+W*.01,QUAI-H*.05,W*.03,H*.01,'#2a4868');
    /* câble qui oscille */
    const cableX=gx+(gDir>0?W*.18:gx-W*.12)+Math.sin(t*1.5+gx)*W*.02;
    g.strokeStyle='#2a2a30';g.lineWidth=1;g.beginPath();g.moveTo(cableX,QUAI-H*.043);g.lineTo(cableX+Math.sin(t*2)*3,QUAI+H*.05);g.stroke();
    /* crochet */
    R(cableX-W*.008,QUAI+H*.045,W*.016,H*.008,'#f0c040');
    R(gx+W*.02,QUAI-H*.065,W*.006,H*.005,'#ff3a3a');
    g.fillStyle='rgba(255,60,60,.1)';g.beginPath();g.arc(gx+W*.023,QUAI-H*.063,W*.015,0,7);g.fill();
  }

  /* ============ LE GROS CONTENEUR 3D ============ */
  {const CX=W/2,CY=H*.56;
  const CW=W*.58,CH=CW*.42,TOP=CH*.16,SIDE=CH*.12;
  const col='#c0392b';
  const sx=shake>0?Math.sin(t*80)*shake*4:0,sy=shake>0?Math.cos(t*60)*shake*2:0;
  const sc=1+tapAnim*.05;
  g.save();g.translate(CX+sx,CY+sy);g.scale(sc,sc);g.translate(-CX,-CY);
  const x0=CX-CW/2,y0=CY-CH/2;
  /* ombre */
  ell(CX+3,y0+CH+SIDE*.3,CW*.52,CH*.1,'rgba(0,0,0,.2)');
  /* face principale */
  R(x0,y0,CW,CH,col);
  for(let nx=x0+5;nx<x0+CW;nx+=5){R(nx,y0,1.5,CH,tn(col,-10));R(nx+1.5,y0,.5,CH,tn(col,8));}
  {const gr=g.createLinearGradient(0,y0,0,y0+CH*.3);gr.addColorStop(0,'rgba(255,255,255,.16)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x0,y0,CW,CH*.3);}
  R(x0,y0+CH-2,CW,2,tn(col,-28));
  R(x0,y0,CW,1.5,tn(col,22));R(x0,y0+CH-1.5,CW,1.5,tn(col,-32));R(x0,y0,1.5,CH,tn(col,14));R(x0+CW-1.5,y0,1.5,CH,tn(col,-18));
  /* portes */
  const dw=CW*.2;
  R(x0+CW-dw-3,y0+3,.5,CH-6,tn(col,-16));R(x0+CW-dw/2-1.5,y0+3,.5,CH-6,tn(col,-16));
  for(const dy of[-CH*.14,CH*.14]){R(x0+CW-dw+3,CY+dy-2,1.5,5,tn(col,-32));R(x0+CW-dw/2+3,CY+dy-2,1.5,5,tn(col,-32));}
  R(x0+CW-dw-1.5,CY-1.5,2.5,3,tn(col,-42));
  /* coins ISO */
  for(const[cx,cy]of[[x0+1.5,y0+1.5],[x0+CW-8,y0+1.5],[x0+1.5,y0+CH-8],[x0+CW-8,y0+CH-8]]){R(cx,cy,6.5,6.5,'#2a2a30');R(cx+1,cy+1,4.5,4.5,'#4a4a52');R(cx+2,cy+2,2.5,2.5,'#2a2a30');}
  /* dessus 3D */
  R(x0,y0-TOP,CW,TOP,tn(col,22));R(x0,y0-TOP,CW,1,tn(col,36));
  for(let nx=x0+5;nx<x0+CW;nx+=5)R(nx,y0-TOP,.5,TOP,tn(col,10));
  /* côté droit 3D */
  R(x0+CW,y0-TOP,SIDE,CH+TOP,tn(col,-22));R(x0+CW,y0-TOP,1,CH+TOP,tn(col,-8));R(x0+CW+SIDE-1,y0-TOP,1,CH+TOP,tn(col,-36));
  R(x0+CW,y0-TOP,SIDE,TOP,tn(col,5));
  /* marque */
  g.fillStyle='rgba(255,255,255,.88)';g.font='900 '+Math.round(CW*.11)+'px system-ui';g.textAlign='left';g.textBaseline='middle';
  g.fillText('MSC',x0+CW*.06,CY-CH*.1);
  g.fillStyle='rgba(255,255,255,.45)';g.font='600 '+Math.round(CW*.045)+'px ui-monospace,monospace';
  g.fillText('MSCU 741 592-6',x0+CW*.06,CY+CH*.14);
  g.fillStyle='rgba(255,255,255,.55)';g.font='700 '+Math.round(CW*.035)+'px ui-monospace';
  g.fillText('22G1',x0+CW*.06,y0+CH*.11);
  /* pastille danger */
  R(x0+CW*.06,y0+CH-CW*.08,CW*.05,CW*.05,'#f0c040');
  g.fillStyle='#1a1a1a';g.font='900 '+Math.round(CW*.04)+'px system-ui';g.textAlign='center';
  g.fillText('!',x0+CW*.085,y0+CH-CW*.055);
  /* texte TAP animé sous le conteneur */
  const tapA=.4+Math.sin(t*3)*.15;
  g.globalAlpha=tapA;g.fillStyle='#f2d070';g.font='800 '+Math.round(W*.04)+'px system-ui';g.textAlign='center';
  g.fillText('TAPE ICI',CX,y0+CH+SIDE+W*.06);g.globalAlpha=1;
  g.restore();}
}

/* ===== BOUCLE ===== */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);
  const dt=Math.min(.05,(t-(boucle.t||t))/1000);boucle.t=t;
  if(tapAnim>0)tapAnim=Math.max(0,tapAnim-.06);
  if(shake>0)shake=Math.max(0,shake-.04);
  if(flash>0)flash=Math.max(0,flash-.025);
  const r=CV.getBoundingClientRect();const DPR=Math.min(2,devicePixelRatio||1);
  const cw=Math.round(r.width*DPR),ch=Math.round(r.height*DPR);
  if(CV.width!==cw||CV.height!==ch){CV.width=cw;CV.height=ch;}
  G.setTransform(1,0,0,1,0,0);
  dessiner(G,CV.width,CV.height,t/1000);
  /* particules */
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.3;p.life-=dt;
    if(p.life<=0){particles.splice(i,1);continue;}
    G.globalAlpha=Math.min(1,p.life*2);
    if(p.text){G.fillStyle=p.col;G.font='900 '+Math.round(CV.width*.06)+'px system-ui';G.textAlign='center';G.textBaseline='middle';G.fillText(p.text,p.x,p.y);}
    else{G.fillStyle=p.col;const sz=p.sz*CV.width/360;G.fillRect(p.x-sz/2,p.y-sz/2,sz,sz);}
    G.globalAlpha=1;}
  /* HUD */
  const u=CV.width/100;
  G.fillStyle='rgba(10,20,30,.6)';G.beginPath();
  const bx=3*u,by=3*u,bw=94*u,bh=10*u,br=2.5*u;
  G.moveTo(bx+br,by);G.lineTo(bx+bw-br,by);G.arcTo(bx+bw,by,bx+bw,by+br,br);G.lineTo(bx+bw,by+bh-br);G.arcTo(bx+bw,by+bh,bx+bw-br,by+bh,br);G.lineTo(bx+br,by+bh);G.arcTo(bx,by+bh,bx,by+bh-br,br);G.lineTo(bx,by+br);G.arcTo(bx,by,bx+br,by,br);G.closePath();G.fill();
  G.fillStyle='#f2d070';G.font='900 '+Math.round(4.5*u)+'px system-ui';G.textAlign='center';G.textBaseline='middle';
  G.fillText(euros.toLocaleString('fr-FR')+' €',CV.width/2,by+bh/2);
  /* flash */
  if(flash>0){G.fillStyle='rgba(255,246,210,'+flash+')';G.fillRect(0,0,CV.width,CV.height);}}

function taper(ex,ey){
  /* convertir coords écran → coords canvas */
  const rect=CV.getBoundingClientRect();
  const mx=(ex-rect.left)/rect.width*CV.width;
  const my=(ey-rect.top)/rect.height*CV.height;
  /* vérifier qu'on tape sur le conteneur (zone large pour le tactile) */
  const W=CV.width,H=CV.height;
  const CX=W/2,CY=H*.56,CW=W*.58,CH=CW*.42,TOP=CH*.16,SIDE=CH*.12;
  const x0=CX-CW/2,y0=CY-CH/2;
  const marge=W*.04;
  if(mx<x0-marge||mx>x0+CW+SIDE+marge||my<y0-TOP-marge||my>y0+CH+marge)return;
  euros++;tapAnim=1;shake=1;flash=.2;
  try{vibrer(12);}catch(x){}
  for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,v=2+Math.random()*5;
    particles.push({x:mx,y:my,vx:Math.cos(a)*v*W/360,vy:Math.sin(a)*v*W/360-3,life:.8,col:Math.random()<.5?'#f2d070':'#ff6a3a',sz:3+Math.random()*4});}
  particles.push({x:mx,y:my-W*.08,vx:0,vy:-2,life:1.2,text:'+1 €',col:'#f2d070',sz:0});
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
  particles=[];euros=0;tapAnim=0;flash=0;shake=0;
  requestAnimationFrame(()=>{d.classList.add('on');window.ECRAN_COUVRANT=true;});
  RAF=requestAnimationFrame(boucle);
  CV.addEventListener('pointerdown',ev=>{ev.preventDefault();taper(ev.clientX,ev.clientY);},{passive:false});
  d.querySelector('.x').onclick=fermer;};
})();
