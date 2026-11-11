/* =====================================================================
   LA SOUTE (bagages.js) — poste Bagages. On lâche des bagages dans la
   cale ; deux pareils se touchent et fusionnent en plus gros, de la
   pochette jusqu'au conteneur. Si la pile reste au-dessus de la ligne
   de charge, l'escale est finie.
   Physique maison : cercles, sous-pas, impulsions avec frottement et
   roulement. Indépendant : n'écrit que dans #bag.
   ===================================================================== */
(()=>{
/* --- les bagages, du plus petit au plus gros (rayons en unités de cale) --- */
const NIV=[
 {n:'Pochette',   r:4.73, c:'#e86aa0', pts:1},
 {n:'Banane',     r:6.16, c:'#f0a030', pts:3},
 {n:'Sac',        r:7.92, c:'#c8503a', pts:6},
 {n:'Cabine',     r:9.9, c:'#3a8ae8', pts:10},
 {n:'Valise',     r:12.32,c:'#3a9a5a', pts:15},
 {n:'Grande valise',r:14.96,c:'#7a4ad0',pts:21},
 {n:'Malle',      r:18.04,c:'#8a5a32', pts:28},
 {n:'Caisse',     r:21.56,c:'#c8a060', pts:36},
 {n:'Conteneur',  r:25.74,c:'#c0392b', pts:45}];
const CW=100, CH=126, LIGNE=24, YLACHE=12;        /* la cale : largeur, hauteur, ligne de charge, hauteur de lâcher */
const GRAV=260, SUB=8, REST=.08, FROT=.32;

let RAC=null,CV=null,G=null,RAF=0,DPR=1,J=null,VUE=null;
const hasard=Math.random;
function tirer(){const r=hasard();return r<.32?0:r<.6?1:r<.82?2:r<.95?3:4;}
function nouvelle(){J={corps:[],x:CW/2,tient:tirer(),suivant:tirer(),pause:0,score:0,combo:0,tCombo:0,danger:0,fini:false,parts:[],pops:[],secousse:0,
  max:0,fusions:0,t0:performance.now(),lache:0,id:1};}

/* --- la physique --- */
function corps(k,x,y,vx,vy){const r=NIV[k].r;return {id:J.id++,k,x,y,vx:vx||0,vy:vy||0,a:(hasard()-.5)*.4,w:0,r,rv:r,m:r*r,age:0,fus:false};}
function pas(dt){const h=dt/SUB,B=J.corps;for(const b of B){b.px=b.x;b.py=b.y;}
 for(let s=0;s<SUB;s++){
  for(const b of B){b.vy+=GRAV*h;b.x+=b.vx*h;b.y+=b.vy*h;b.a+=b.w*h;if(b.rv<b.r)b.rv=Math.min(b.r,b.rv+b.r*h*7);}
  /* les parois et le fond */
  for(const b of B){const r=b.rv;
   if(b.x<r){b.x=r;if(b.vx<0)b.vx=-b.vx*REST;b.vy*=1-FROT*.05;}
   if(b.x>CW-r){b.x=CW-r;if(b.vx>0)b.vx=-b.vx*REST;b.vy*=1-FROT*.05;}
   if(b.y>CH-r){b.y=CH-r;if(b.vy>0){b.vy=-b.vy*REST;}b.vx*=1-FROT*.06;}}
  /* les contacts entre bagages */
  for(let i=0;i<B.length;i++){const a=B[i];for(let j=i+1;j<B.length;j++){const b=B[j];
   const dx=b.x-a.x,dy=b.y-a.y,rr=a.rv+b.rv;if(dx*dx+dy*dy>=rr*rr)continue;
   const d=Math.sqrt(dx*dx+dy*dy)||.001,nx=dx/d,ny=dy/d,pen=rr-d;
   if(a.k===b.k&&!a.fus&&!b.fus&&a.k<NIV.length&&a.age>.05&&b.age>.05){a.fus=b.fus=true;continue;}
   const ia=1/a.m,ib=1/b.m,sm=ia+ib;
   a.x-=nx*pen*ia/sm;a.y-=ny*pen*ia/sm;b.x+=nx*pen*ib/sm;b.y+=ny*pen*ib/sm;
   const rvx=b.vx-a.vx,rvy=b.vy-a.vy,vn=rvx*nx+rvy*ny;
   if(vn<0){const jn=-(1+REST)*vn/sm;a.vx-=jn*nx*ia;a.vy-=jn*ny*ia;b.vx+=jn*nx*ib;b.vy+=jn*ny*ib;
    /* frottement tangentiel, qui fait rouler */
    const tx=-ny,ty=nx;const vt=rvx*tx+rvy*ty;let jt=-vt/(sm*1.6);const lim=jn*FROT;jt=Math.max(-lim,Math.min(lim,jt));
    a.vx-=jt*tx*ia;a.vy-=jt*ty*ia;b.vx+=jt*tx*ib;b.vy+=jt*ty*ib;}}}
 }
 for(const b of B){b.vx*=.998;b.vy*=.998;const rx=(b.x-b.px)/dt,ry=(b.y-b.py)/dt;b.w+=(rx/b.r-b.w)*.2;if(rx*rx+ry*ry<4)b.w*=.6;if(b.vx*b.vx+b.vy*b.vy<16){b.vx*=.85;b.vy*=.92;b.w*=.7;}b.age+=dt;if(Math.abs(b.w)>14)b.w=Math.sign(b.w)*14;}
 /* les fusions */
 const F=B.filter(b=>b.fus);if(F.length){const vus=new Set();
  for(const a of F){if(vus.has(a.id))continue;let best=null,bd=1e9;for(const b of F){if(b===a||vus.has(b.id)||b.k!==a.k)continue;const d=(b.x-a.x)**2+(b.y-a.y)**2;if(d<bd){bd=d;best=b;}}
   if(!best){a.fus=false;continue;}vus.add(a.id);vus.add(best.id);fusion(a,best);}
  J.corps=J.corps.filter(b=>!vus.has(b.id));for(const b of J.corps)b.fus=false;}
}
function fusion(a,b){const k=a.k,x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 J.combo=J.tCombo>0?J.combo+1:1;J.tCombo=1.1;J.fusions++;
 const gain=NIV[Math.min(k+1,NIV.length-1)].pts*10*Math.min(5,J.combo);J.score+=gain;
 J.pops.push({x,y,t:0,txt:'+'+gain+(J.combo>1?'  ×'+Math.min(5,J.combo):''),c:J.combo>1?'#f5c430':'#fff'});
 for(let i=0;i<10+k*3;i++){const an=hasard()*7,v=30+hasard()*60+k*6;J.parts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v-30,t:0,c:i%3?NIV[k].c:'#f5d27a',s:.8+hasard()*1.4});}
 if(k+1>=NIV.length){J.score+=2000;J.pops.push({x,y:y-10,t:0,txt:'CONTENEURS ! +2000',c:'#7ee08a'});J.secousse=.5;vib(60);return;}
 const n=corps(k+1,x,y,(a.vx+b.vx)/2,(a.vy+b.vy)/2-20);n.rv=n.r*.55;n.age=0;n.w=(a.w+b.w)/2;J.corps.push(n);
 if(k+1>J.max)J.max=k+1;
 if(k>=4){J.secousse=.12+k*.03;vib(15+k*5);}else vib(8);}
function vib(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(x){}}

/* --- lâcher le bagage tenu --- */
function lacher(){if(!J||J.fini||J.pause>0)return;const r=NIV[J.tient].r,x=Math.max(r,Math.min(CW-r,J.x));
 J.corps.push(corps(J.tient,x,YLACHE,0,40));J.tient=J.suivant;J.suivant=tirer();J.pause=.45;J.lache++;vib(5);}

/* --- la fin : la pile reste au-dessus de la ligne --- */
function surveiller(dt){let haut=false;for(const b of J.corps)if(b.age>1.2&&b.y-b.r<LIGNE&&Math.abs(b.vy)<40){haut=true;break;}
 J.danger=haut?J.danger+dt:Math.max(0,J.danger-dt*2);if(J.danger>2.2)finir();}

/* --- le dessin --- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function bagage(g,k,x,y,a,rv){const b=NIV[k],r=(rv||b.r),c=b.c;g.save();g.translate(x,y);g.rotate(a||0);
 if(k===0){ /* la pochette : un petit sac rond zippé */
  g.fillStyle=tn(c,-40);g.beginPath();g.ellipse(0,0,r*1.04,r*.96,0,0,7);g.fill();g.fillStyle=c;g.beginPath();g.ellipse(0,-.2,r*.96,r*.88,0,0,7);g.fill();
  g.fillStyle=tn(c,36);g.beginPath();g.ellipse(-r*.25,-r*.35,r*.45,r*.18,-.3,0,7);g.fill();
  g.strokeStyle='#d8b040';g.lineWidth=r*.12;g.beginPath();g.moveTo(-r*.7,-r*.05);g.quadraticCurveTo(0,-r*.25,r*.7,-r*.05);g.stroke();g.fillStyle='#e8c050';g.fillRect(r*.55,-r*.2,r*.22,r*.35);}
 else if(k===1){ /* la banane */
  g.fillStyle=tn(c,-40);rr(g,-r*1.04,-r*.86,r*2.08,r*1.72,r*.8);g.fill();g.fillStyle=c;rr(g,-r*.96,-r*.8,r*1.92,r*1.58,r*.74);g.fill();
  g.fillStyle=tn(c,30);rr(g,-r*.7,-r*.5,r*1.2,r*.3,r*.15);g.fill();g.fillStyle='#2a2a2e';g.fillRect(-r*1.05,-r*.12,r*2.1,r*.24);g.fillStyle='#c8a040';g.fillRect(-r*.18,-r*.2,r*.36,r*.4);
  g.strokeStyle=tn(c,-25);g.lineWidth=r*.07;g.beginPath();g.moveTo(-r*.6,r*.2);g.quadraticCurveTo(0,r*.38,r*.6,r*.2);g.stroke();}
 else if(k===2){ /* le sac de voyage, anses en cuir */
  g.strokeStyle='#5a3a1e';g.lineWidth=r*.14;g.beginPath();g.arc(-r*.25,-r*.62,r*.3,Math.PI*1.05,Math.PI*1.95);g.stroke();g.beginPath();g.arc(r*.25,-r*.62,r*.3,Math.PI*1.05,Math.PI*1.95);g.stroke();
  g.fillStyle=tn(c,-40);rr(g,-r*1.04,-r*.8,r*2.08,r*1.7,r*.62);g.fill();g.fillStyle=c;rr(g,-r*.97,-r*.74,r*1.94,r*1.57,r*.56);g.fill();
  g.fillStyle=tn(c,30);rr(g,-r*.75,-r*.52,r*1.3,r*.28,r*.14);g.fill();g.fillStyle='#e8dcc0';g.fillRect(-r*.95,-r*.05,r*1.9,r*.16);
  g.fillStyle='#5a3a1e';g.fillRect(-r*.6,-r*.76,r*.14,r*1.56);g.fillRect(r*.46,-r*.76,r*.14,r*1.56);}
 else if(k<=5){ /* les valises rigides : coque nervurée, poignée, roulettes, étiquette */
  const w=r*1.86,h=r*1.8,rad=r*.4;
  g.fillStyle='#1a1a1e';g.fillRect(-w*.38,h*.44,r*.22,r*.12);g.fillRect(w*.38-r*.22,h*.44,r*.22,r*.12);
  g.fillStyle='#2a2a2e';rr(g,-r*.3,-h/2-r*.18,r*.6,r*.26,r*.1);g.fill();g.fillStyle=c;rr(g,-r*.18,-h/2-r*.1,r*.36,r*.12,r*.05);g.fill();
  g.fillStyle=tn(c,-42);rr(g,-w/2,-h/2,w,h,rad);g.fill();g.fillStyle=c;rr(g,-w/2+r*.06,-h/2+r*.06,w-r*.12,h-r*.12,rad*.9);g.fill();
  g.fillStyle=tn(c,30);rr(g,-w/2+r*.14,-h/2+r*.12,w-r*.28,r*.16,r*.08);g.fill();
  g.fillStyle=tn(c,-22);const nb=k===3?4:k===4?5:6;for(let i=1;i<nb;i++)g.fillRect(-w/2+i*w/nb-r*.03,-h/2+r*.3,r*.06,h-r*.55);
  g.fillStyle=tn(c,-30);g.fillRect(-w/2+r*.06,-r*.03,w-r*.12,r*.06);
  g.fillStyle='#f2efe4';rr(g,w*.18,-r*.05,r*.42,r*.52,r*.06);g.fill();g.fillStyle=tn(c,-10);g.fillRect(w*.18+r*.05,r*.02,r*.32,r*.14);g.fillStyle='#9a9a9a';g.fillRect(w*.18+r*.06,r*.26,r*.26,r*.05);
  if(k===5){g.fillStyle='#d8b040';g.fillRect(-w/2+r*.06,-h*.18,w-r*.12,r*.08);g.fillRect(-w/2+r*.06,h*.12,w-r*.12,r*.08);}}
 else if(k===6){ /* la malle : bois, cerclage de laiton, serrure */
  const w=r*1.88,h=r*1.7;g.fillStyle='#3a2414';rr(g,-w/2,-h/2,w,h,r*.18);g.fill();g.fillStyle=c;rr(g,-w/2+r*.07,-h/2+r*.07,w-r*.14,h-r*.14,r*.14);g.fill();
  g.fillStyle=tn(c,18);rr(g,-w/2+r*.07,-h/2+r*.07,w-r*.14,h*.36,r*.12);g.fill();g.fillStyle=tn(c,-30);g.fillRect(-w/2+r*.07,-h/2+h*.4,w-r*.14,r*.06);
  for(const sx of [-w*.3,w*.3-r*.16]){g.fillStyle='#c8a040';g.fillRect(sx,-h/2,r*.16,h);g.fillStyle='#e8c860';g.fillRect(sx,-h/2,r*.05,h);}
  g.fillStyle='#c8a040';for(const [cx,cy] of [[-w/2,-h/2],[w/2,-h/2],[-w/2,h/2],[w/2,h/2]]){g.beginPath();g.arc(cx*.9,cy*.88,r*.13,0,7);g.fill();}
  g.fillStyle='#e8c860';rr(g,-r*.18,-h/2+h*.33,r*.36,r*.36,r*.06);g.fill();g.fillStyle='#3a2414';g.fillRect(-r*.04,-h/2+h*.36,r*.08,r*.16);}
 else if(k===7){ /* la caisse de bois, croisillon, « FRAGILE » */
  const w=r*1.76,h=r*1.76;g.fillStyle='#7a5a2a';g.fillRect(-w/2,-h/2,w,h);g.fillStyle=c;g.fillRect(-w/2+r*.08,-h/2+r*.08,w-r*.16,h-r*.16);
  g.fillStyle=tn(c,-26);for(let q=-h/2+h/5;q<h/2;q+=h/5)g.fillRect(-w/2+r*.08,q,w-r*.16,r*.04);
  g.strokeStyle=tn(c,-50);g.lineWidth=r*.16;g.beginPath();g.moveTo(-w/2+r*.15,-h/2+r*.15);g.lineTo(w/2-r*.15,h/2-r*.15);g.moveTo(w/2-r*.15,-h/2+r*.15);g.lineTo(-w/2+r*.15,h/2-r*.15);g.stroke();
  g.strokeStyle=tn(c,-50);g.lineWidth=r*.16;g.strokeRect(-w/2+r*.08,-h/2+r*.08,w-r*.16,h-r*.16);
  g.fillStyle='rgba(192,57,43,.9)';g.font='900 '+(r*.32)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FRAGILE',0,0);}
 else { /* le conteneur */
  const w=r*1.92,h=r*1.6;g.fillStyle='#6a1a12';g.fillRect(-w/2,-h/2,w,h);g.fillStyle=c;g.fillRect(-w/2+r*.07,-h/2+r*.07,w-r*.14,h-r*.14);
  g.fillStyle=tn(c,-26);for(let q=-w/2+r*.2;q<w/2-r*.1;q+=r*.16)g.fillRect(q,-h/2+r*.1,r*.06,h-r*.2);g.fillStyle=tn(c,26);g.fillRect(-w/2+r*.07,-h/2+r*.07,w-r*.14,r*.06);
  g.fillStyle='#2a2a2e';for(const [cx,cy] of [[-w/2,-h/2],[w/2-r*.18,-h/2],[-w/2,h/2-r*.16],[w/2-r*.18,h/2-r*.16]])g.fillRect(cx,cy,r*.18,r*.16);
  g.fillStyle='rgba(255,255,255,.9)';g.font='900 '+(r*.36)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('CMA CGM',0,r*.02);}
 g.restore();}

let FOND=null;
function fond(){/* la cale, gravée une fois à la bonne résolution */
 const c=document.createElement('canvas');c.width=CV.width;c.height=CV.height;const g=c.getContext('2d');const V=VUE;
 g.fillStyle='#262b33';g.fillRect(0,0,c.width,c.height);
 g.save();g.translate(V.ox,V.oy);g.scale(V.s,V.s);
 /* tôle rivetée derrière */
 for(let x=-40;x<CW+40;x+=12.5){g.fillStyle='#30363f';g.fillRect(x,-60,12,CH+80);g.fillStyle='#3a414b';g.fillRect(x,-60,.6,CH+80);for(let y=-56;y<CH+20;y+=9){g.fillStyle='#4a525c';g.beginPath();g.arc(x+2,y,.5,0,7);g.fill();}}
 /* la cuve */
 g.fillStyle='rgba(12,16,22,.55)';g.fillRect(0,0,CW,CH);
 const gr=g.createLinearGradient(0,0,0,CH);gr.addColorStop(0,'rgba(255,220,150,.07)');gr.addColorStop(1,'rgba(0,0,0,.2)');g.fillStyle=gr;g.fillRect(0,0,CW,CH);
 for(const [x,w] of [[-3.5,3.5],[CW,3.5]]){g.fillStyle='#8a9098';g.fillRect(x,-6,w,CH+9.5);g.fillStyle='#b0b6bc';g.fillRect(x,-6,.6,CH+9.5);for(let y=0;y<CH;y+=10){g.fillStyle='#5a6068';g.beginPath();g.arc(x+w/2,y,.45,0,7);g.fill();}}
 g.fillStyle='#8a9098';g.fillRect(-3.5,CH,CW+7,3.5);g.fillStyle='#5a6068';g.fillRect(-3.5,CH+3,CW+7,.5);
 /* les bandes jaunes et noires en haut des parois */
 for(const x of [-3.5,CW])for(let y=-6;y<6;y+=2){g.fillStyle=(y/2)%2?'#1a1a1e':'#e8c040';g.fillRect(x,y,3.5,2);}
 g.restore();FOND=c;}
function dessiner(){const g=G,V=VUE;if(!FOND||FOND.width!==CV.width||FOND.height!==CV.height)fond();
 g.setTransform(1,0,0,1,0,0);let sx=0,sy=0;if(J.secousse>0){sx=(hasard()-.5)*J.secousse*14*DPR;sy=(hasard()-.5)*J.secousse*14*DPR;}
 g.drawImage(FOND,sx,sy);
 g.setTransform(V.s,0,0,V.s,V.ox+sx,V.oy+sy);
 /* la ligne de charge, qui clignote quand ça déborde */
 const dg=J.danger>0,al=dg?(.5+.5*Math.sin(performance.now()/90)):.55;
 g.fillStyle='rgba(232,74,58,'+al+')';for(let x=0;x<CW;x+=4)g.fillRect(x,LIGNE-.4,2.4,.8);
 g.fillStyle='rgba(232,74,58,'+(dg?.95:.7)+')';g.font='800 3px system-ui,sans-serif';g.textAlign='center';g.fillText(dg?'ÇA DÉBORDE !':'LIGNE DE CHARGE',CW/2,LIGNE-1.6);
 if(dg){g.fillStyle='rgba(232,74,58,'+(J.danger/2.2*.25)+')';g.fillRect(0,0,CW,LIGNE);}
 /* le guide de chute et le crochet de la grue */
 const r=NIV[J.tient].r,x=Math.max(r,Math.min(CW-r,J.x));
 if(J.pause<=0){g.fillStyle='rgba(255,255,255,.18)';for(let y=YLACHE+r;y<CH;y+=4)g.fillRect(x-.25,y,.5,2);}
 g.fillStyle='#5a6068';g.fillRect(x-.5,-30,1,YLACHE-r+28);g.fillStyle='#e8c040';rr(g,x-4,YLACHE-r-3.6,8,2.6,.8);g.fill();g.fillStyle='#5a6068';g.fillRect(x-3.6,YLACHE-r-1.2,1,2);g.fillRect(x+2.6,YLACHE-r-1.2,1,2);
 if(J.pause<=0)bagage(g,J.tient,x,YLACHE,0);else{g.globalAlpha=1-J.pause/.45;bagage(g,J.tient,x,YLACHE,0,r*(1-J.pause/.45*.5));g.globalAlpha=1;}
 /* les bagages */
 for(const b of J.corps)bagage(g,b.k,b.x,b.y,b.a,b.rv);
 /* les éclats */
 for(const p of J.parts){g.globalAlpha=Math.max(0,1-p.t/.6);g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}g.globalAlpha=1;
 for(const p of J.pops){const k=p.t/1.1;g.globalAlpha=Math.max(0,1-k*k);g.font='900 '+(5+(1-k)*1.5)+'px system-ui,sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.5)';g.fillText(p.txt,p.x+.4,p.y-k*12+.4);g.fillStyle=p.c;g.fillText(p.txt,p.x,p.y-k*12);}g.globalAlpha=1;
 /* l'échelle des bagages, sous la cale */
 const ey=CH+9;for(let i=0;i<NIV.length;i++){const ex=CW*(i+.5)/NIV.length,s=Math.min(1,4.4/NIV[i].r);g.save();g.translate(ex,ey);g.scale(s,s);g.globalAlpha=i<=J.max?1:.28;bagage(g,i,0,0,0);g.restore();}g.globalAlpha=1;
 /* la barre du haut */
 const hud=RAC.querySelector('.sc');hud.textContent=J.score.toLocaleString('fr-FR');
 RAC.querySelector('.cb').textContent=J.combo>1&&J.tCombo>0?'🔥 ×'+Math.min(5,J.combo):'🔥 ×1';
 const sv=RAC.querySelector('.sv canvas');if(sv&&sv._k!==J.suivant){sv._k=J.suivant;const q=sv.getContext('2d'),d=sv.width;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,d,d);const s=d/(NIV[J.suivant].r*2.6);q.setTransform(s,0,0,s,d/2,d/2);bagage(q,J.suivant,0,0,0);}}
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(t-(boucle.t||t))/1000);boucle.t=t;if(!J)return;
 if(!J.fini){pas(dt);surveiller(dt);}
 J.pause=Math.max(0,J.pause-dt);J.tCombo=Math.max(0,J.tCombo-dt);if(J.tCombo<=0)J.combo=0;J.secousse=Math.max(0,J.secousse-dt);
 for(const p of J.parts){p.t+=dt;p.vy+=160*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}J.parts=J.parts.filter(p=>p.t<.6);
 for(const p of J.pops)p.t+=dt;J.pops=J.pops.filter(p=>p.t<1.1);
 dessiner();}

function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);
 const marge=8*DPR,haut=CV.height-marge*2,s=Math.min((CV.width-marge*2)/(CW+8),haut/(CH+16+30));
 VUE={s,ox:(CV.width-CW*s)/2,oy:marge+30*s};FOND=null;}

function finir(){if(J.fini)return;J.fini=true;vib(80);const sc=J.score;let rec=0;try{rec=+(localStorage.getItem('bag_record')||0);if(sc>rec)localStorage.setItem('bag_record',sc);}catch(x){}
 const et=sc>=150000?3:sc>=75000?2:sc>=30000?1:0;
 const d=document.createElement('div');d.className='fin';
 const mx=document.createElement('canvas');mx.width=mx.height=120;const q=mx.getContext('2d');const s=120/(NIV[J.max].r*2.6);q.setTransform(s,0,0,s,60,60);bagage(q,J.max,0,0,0);
 d.innerHTML='<div class="c"><small>LA CALE EST PLEINE</small><div class="et">'+[0,1,2].map(i=>'<span class="'+(i<et?'on':'')+'">★</span>').join('')+'</div><h2>'+(et===3?'Docker de légende !':et===2?'Belle cale, collègue !':et===1?'Pas mal du tout':'Faut s’entraîner !')+'</h2>'+
  '<div class="mx"></div><div class="g"><div><b>'+J.fusions+'</b>fusions</div><div><b>'+J.lache+'</b>bagages</div><div><b>'+NIV[J.max].n+'</b>le plus gros</div></div>'+
  '<p class="scf">Score <b>'+sc.toLocaleString('fr-FR')+'</b>'+(sc>rec?' · nouveau record !':rec?' · record '+rec.toLocaleString('fr-FR'):'')+'</p><p class="gr">Période d’essai : la paie sera versée à l’ouverture officielle.</p><button class="b1">Nouvelle cale</button><button class="b2">Retour au quai</button></div>';
 d.querySelector('.mx').appendChild(mx);RAC.querySelector('.scene').appendChild(d);
 setTimeout(()=>d.querySelectorAll('.et span.on').forEach((s,i)=>setTimeout(()=>{s.classList.add('pop');vib(10);},i*300)),300);
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle();majRec();};d.querySelector('.b2').onclick=fermer;}
function majRec(){let rec=0;try{rec=+(localStorage.getItem('bag_record')||0);}catch(x){}RAC.querySelector('.rc').textContent='🏆 '+rec.toLocaleString('fr-FR');}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;J=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);removeEventListener('resize',cadrer);}

const CSS=`#bag{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#1b2330;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;touch-action:none}
#bag.on{opacity:1}#bag *{box-sizing:border-box}
#bag .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 4px;color:#fff}
#bag .bar b{font:900 19px/1 'Baloo 2',system-ui,sans-serif}#bag .bar small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#8ab0d8;margin-bottom:2px}
#bag .sp{flex:1}#bag .x{height:38px;padding:0 15px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font:800 14px 'Baloo 2',system-ui,sans-serif}
#bag .pl{flex:none;display:flex;justify-content:center;align-items:center;gap:6px;padding:4px 10px 6px;color:#fff}
#bag .pl span{background:#2e3a4e;border-radius:14px;padding:4px 11px;font:800 14px 'Baloo 2',system-ui,sans-serif;white-space:nowrap}
#bag .sv{display:flex;align-items:center;gap:4px;background:#2e3a4e;border-radius:14px;padding:2px 6px 2px 10px;font:800 10px 'Baloo 2',system-ui,sans-serif;color:#8ab0d8;letter-spacing:1px}
#bag .sv canvas{width:30px;height:30px}
#bag .scene{flex:1;min-height:0;position:relative}
#bag .scene>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#bag .bas{flex:none;position:static;background:#1b2330;box-shadow:none;border:0;border-radius:0;opacity:1;padding:8px 14px calc(10px + env(safe-area-inset-bottom));color:#c8d4e4;font:700 13px/1.25 'Baloo 2',system-ui,sans-serif;text-align:center}
#bag .fin{position:absolute;inset:0;background:rgba(10,16,24,.82);display:grid;place-items:center;padding:20px;z-index:3}
#bag .fin .c{width:min(340px,92vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:16px;text-align:center;box-shadow:0 6px 0 #b8a890}
#bag .fin small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#bag .fin .et{font-size:38px;line-height:1;margin:4px 0;color:#d8cfbe}#bag .fin .et span{display:inline-block;transition:transform .3s}#bag .fin .et span.pop{color:#f2b030;transform:scale(1.25)}
#bag .fin h2{margin:2px 0 4px;font:900 23px/1.1 'Baloo 2',system-ui,sans-serif}
#bag .fin .mx canvas{width:60px;height:60px}
#bag .fin .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 8px}#bag .fin .g div{background:#fff;border-radius:14px;padding:7px 4px;box-shadow:0 3px 0 #ddd3c0;font:700 11.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#bag .fin .g b{display:block;font:900 17px/1.15 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#bag .fin .scf{margin:4px 0;font:800 16px 'Baloo 2',system-ui,sans-serif}#bag .fin .gr{margin:0 0 4px;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
#bag .fin button{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#bag .fin .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#bag .fin .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}`;

window.ouvrirBagages=function(navire){if(RAC)return;if(!document.getElementById('bagCss')){const s=document.createElement('style');s.id='bagCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='bag';RAC=d;
 d.innerHTML='<div class="bar"><div><small>POSTE BAGAGES · '+String(navire||'CALE 2').toUpperCase()+'</small><b>La soute</b></div><span class="sp"></span><button class="x">Quitter</button></div>'+
  '<div class="pl"><span>⭐ <i class="sc" style="font-style:normal">0</i></span><span class="rc">🏆 0</span><span class="cb">🔥 ×1</span><span class="sv">SUIVANT<canvas width="90" height="90"></canvas></span></div>'+
  '<div class="scene"><canvas></canvas></div><div class="bas">Glisse le doigt pour viser, lâche pour envoyer. Deux bagages pareils fusionnent !</div>';
 document.body.appendChild(d);CV=d.querySelector('.scene>canvas');G=CV.getContext('2d');
 nouvelle();majRec();requestAnimationFrame(()=>{d.classList.add('on');cadrer();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 d.querySelector('.x').onclick=fermer;
 /* viser au doigt, lâcher en levant le doigt */
 const viser=e=>{if(!VUE||!J)return;const t=e.touches?e.touches[0]:e;const r=CV.getBoundingClientRect();const px=(t.clientX-r.left)*DPR;J.x=(px-VUE.ox)/VUE.s;e.preventDefault();};
 CV.addEventListener('touchstart',viser,{passive:false});CV.addEventListener('touchmove',viser,{passive:false});
 CV.addEventListener('touchend',e=>{e.preventDefault();lacher();},{passive:false});
 CV.addEventListener('mousedown',e=>{viser(e);const m=ev=>viser(ev),u=()=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);lacher();};addEventListener('mousemove',m);addEventListener('mouseup',u);});
 window.__BAG={J:()=>J,lacher,viser:x=>{if(J)J.x=x;}};
 RAF=requestAnimationFrame(boucle);};
})();
