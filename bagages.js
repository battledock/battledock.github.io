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
const TAI=[
 {n:'Pochette',   r:4.73, c:'#e86aa0', pts:1},
 {n:'Banane',     r:6.16, c:'#f0a030', pts:3},
 {n:'Sac',        r:7.92, c:'#c8503a', pts:6},
 {n:'Cabine',     r:9.9, c:'#3a8ae8', pts:10},
 {n:'Valise',     r:12.32,c:'#3a9a5a', pts:15},
 {n:'Grande valise',r:14.96,c:'#7a4ad0',pts:21},
 {n:'Malle',      r:18.04,c:'#8a5a32', pts:28},
 {n:'Caisse',     r:21.56,c:'#c8a060', pts:36},
 {n:'Conteneur',  r:25.74,c:'#c0392b', pts:45}];
const PEND=14;
/* les trois navires : chaque cale change d'ambiance */
const THEMES=[
 {k:'ferry',nom:'FERRY',ciel:['#5fb6ec','#a8dcf8','#e8f6ff'],cale:'#9fd0cc',tole:['#8cc2be','#b8e2de','#7ab0ac','#86bcb8','#bfe6e2'],lum:'rgba(255,246,200,.45)',ombre:'rgba(20,60,70,.28)',coque:'#f4f4f6',coque2:'#e2e4ea',hublot:'#3a6a90',bande:'#c8323a',bande2:'#1f3566',sol:['#b0804a','#c08e56'],mont:['#e8b830','#ffd860','#b88a18'],soleil:'rgba(255,236,160,'},
 {k:'croisiere',nom:'CROISIÈRE',ciel:['#3a3f86','#d9707a','#f9c98e'],cale:'#e9dcc2',tole:['#d8c8a8','#f6ecd6','#c4b290','#cfbe9c','#f8f0de'],lum:'rgba(255,200,140,.42)',ombre:'rgba(80,40,30,.3)',coque:'#1f2a4a',coque2:'#2a3658',hublot:'#f5d27a',bande:'#d8b040',bande2:'#0f1830',sol:['#8a5a32','#9a6a3e'],mont:['#d8b040','#f5d880','#9a7a20'],soleil:'rgba(255,190,120,'},
 {k:'cargo',nom:'PORTE-CONTENEURS',ciel:['#14223e','#3d5d8e','#9cbcd8'],cale:'#b8603a',tole:['#a4542e','#cc7448','#8a4424','#9a4c2a','#d4845a'],lum:'rgba(255,220,170,.3)',ombre:'rgba(30,10,10,.38)',coque:'#2a4a6a',coque2:'#24405e',hublot:'#ffe08a',bande:'#c0392b',bande2:'#14223e',sol:['#5a5e66','#6a6e76'],mont:['#e8b830','#ffd860','#b88a18'],soleil:'rgba(255,230,180,'}];
let THEME=THEMES[0];
/* le grade du joueur : il débloque des bagages et des événements, et multiplie la paie (côté serveur) */
const GRADES=[{nom:'Docker occasionnel',min:1,x:1},{nom:'Nouveau docker',min:5,x:1.3},{nom:'Docker',min:10,x:1.6},{nom:'Chauffeur',min:20,x:2},{nom:'Pointeur',min:35,x:2.5},{nom:'Docker mensuel',min:55,x:3},{nom:'Contremaître',min:80,x:3.6},{nom:'Chef de service',min:100,x:4.2},{nom:'Directeur du port',min:150,x:5}];
const DEBLOQUE=['bagages fragiles','bagages cadenassés','bagages plombés et la houle','bagages VIP et les colis express','2 crochets au départ','jusqu’à 4 crochets','3 crochets au départ','paie ×4,2','paie ×5'];
function niveauJ(){try{if(typeof NIV!=='undefined'&&NIV&&NIV.niveau&&NIV.niveau.niveau)return NIV.niveau.niveau|0;}catch(x){}
 try{const v=parseInt((document.getElementById('hNiv')||{}).textContent);if(v>0)return v;}catch(x){}
 try{return Math.max(clsNiv(+e.score||0).n,clsNiv(+e.recolte||0).n);}catch(x){return 1;}}
let RG=0;function rangJ(){const n=niveauJ();let r=0;GRADES.forEach((g,i)=>{if(n>=g.min)r=i;});return r;}
/* les bagages spéciaux */
const SPECIAUX={fragile:'Fragile : ne le fais pas écraser, fusionne-le pour ×2',cadenas:'Cadenassé : une fusion juste à côté le libère',plomb:'Plombé : très lourd, il tasse la pile',vip:'VIP : fusionne avec n’importe quel bagage',express:'Express : fusionne-le avant la fin du chrono'};
const CW=100, CH=126, LIGNE=24, YLACHE=12;        /* la cale : largeur, hauteur, ligne de charge, hauteur de lâcher */
const GRAV=260, SUB=8, REST=.08, FROT=.32;

let RAC=null,CV=null,G=null,RAF=0,DPR=1,J=null,VUE=null;
const hasard=Math.random;
/* LES SONS : synthétisés, discrets ; coupables avec le bouton du haut */
const SON=(()=>{let ac=null,on=true;try{on=localStorage.getItem('bag_son')!=='0';}catch(x){}
 const ctx=()=>{if(!on)return null;try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(x){return null;}return ac;};
 const note=(f,d,type,vol,glis)=>{const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(glis)o.frequency.exponentialRampToValueAtTime(glis,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.15,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);};
 const bruit=(d,vol,fc)=>{const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),q=b.getChannelData(0);for(let i=0;i<n;i++)q[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=fc||900;g.gain.value=vol||.2;s.connect(f);f.connect(g);g.connect(a.destination);s.start();};
 const GAMME=[523,587,659,784,880,1047,1175];
 return {get on(){return on;},basculer(){on=!on;try{localStorage.setItem('bag_son',on?'1':'0');}catch(x){}if(on)ctx();return on;},
  lache(){note(220,.08,'triangle',.06,160);},
  pose(v){bruit(.09,Math.min(.22,.05+v/900),500);},
  pop(k,combo){const f=GAMME[Math.min(GAMME.length-1,combo-1)]*(k>5?.5:1);note(f,.16,'sine',.16,f*1.5);note(f*1.5,.12,'triangle',.05);bruit(.05,.06,2500);},
  boum(){note(70,.7,'sine',.35,38);bruit(.5,.3,300);note(140,.4,'square',.04,70);},
  tic(){note(1320,.05,'square',.05);},
  verre(){bruit(.25,.25,6000);[2400,3100,3700].forEach((f,i)=>setTimeout(()=>note(f,.12,'sine',.05),i*35));},
  libere(){note(880,.08,'square',.04);setTimeout(()=>note(1320,.12,'triangle',.06),60);},
  express(){[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>note(f,.12,'triangle',.1),i*60));},
  crochet(){note(300,.25,'sawtooth',.05,900);},
  houle(){note(90,1.2,'sine',.12,70);bruit(1,.08,400);},
  fin(){note(392,.18,'triangle',.12);setTimeout(()=>note(330,.18,'triangle',.12),160);setTimeout(()=>note(262,.4,'triangle',.12),320);}};})();
function tirer(){const r=hasard();return r<.32?0:r<.6?1:r<.82?2:r<.95?3:4;}
function tirerSp(){if(!J||J.lache<5)return null;const r=hasard();const sp=r<.06?'fragile':r<.105?'cadenas':r<.14?'plomb':r<.165?'vip':null;const min={fragile:0,cadenas:1,plomb:2,vip:3};return sp&&RG>=min[sp]?sp:null;}
function nouvelle(){let n=0;try{n=+(localStorage.getItem('bag_cale')||0);localStorage.setItem('bag_cale',n+1);}catch(x){}THEME=THEMES[n%THEMES.length];FOND=null;
 RG=rangJ();J={tSp:null,sSp:null,crochet:RG>=6?3:RG>=4?2:1,cmax:RG>=5?4:3,mode:null,echange:true,tJeu:0,gx:0,houle:null,prochHoule:38,prochExpress:22,bandeau:null,leves:[],paires:[],mouettes:[0,1,2].map(i=>({x:hasard()*140-20,y:-26+i*5+hasard()*3,v:(6+hasard()*5)*(i%2?-1:1),ph:hasard()*7})),vit:0,om:0,sons:[],ondes:[],ralenti:0,flash:0,dernierTic:0,corps:[],x:CW/2,cible:CW/2,bal:0,tient:tirer(),suivant:tirer(),pause:0,score:0,combo:0,tCombo:0,danger:0,fini:false,parts:[],pops:[],secousse:0,
  max:0,fusions:0,t0:performance.now(),lache:0,id:1};}

/* --- la physique --- */
function corps(k,x,y,vx,vy,sp){const r=TAI[k].r;return {id:J.id++,k,sp:sp||null,exp:sp==='express'?20:0,x,y,vx:vx||0,vy:vy||0,a:(hasard()-.5)*.4,w:0,r,rv:r,m:r*r*(sp==='plomb'?4:1),age:0,fus:false,pose:false,pop:0};}
function peutFus(a,b){if(a.sp==='cadenas'||b.sp==='cadenas')return false;if(a.sp==='vip'||b.sp==='vip')return a.sp!==b.sp||a.k===b.k;return a.k===b.k;}
function pas(dt){const h=dt/SUB,B=J.corps;for(const b of B){b.px=b.x;b.py=b.y;}
 for(let s=0;s<SUB;s++){
  for(const b of B){b.vy+=GRAV*h;b.vx+=J.gx*h;b.x+=b.vx*h;b.y+=b.vy*h;b.a+=b.w*h;if(b.rv<b.r)b.rv=Math.min(b.r,b.rv+b.r*h*7);}
  /* les parois et le fond */
  for(const b of B){const r=b.rv;
   if(b.x<r){b.x=r;if(b.vx<0)b.vx=-b.vx*REST;b.vy*=1-FROT*.05;}
   if(b.x>CW-r){b.x=CW-r;if(b.vx>0)b.vx=-b.vx*REST;b.vy*=1-FROT*.05;}
   if(b.y>CH-r){b.y=CH-r;if(!b.pose&&b.vy>40){b.pose=true;J.sons.push(b.vy);}if(b.vy>0){b.vy=-b.vy*REST;}b.vx*=1-FROT*.06;}}
  /* les contacts entre bagages */
  for(let i=0;i<B.length;i++){const a=B[i];for(let j=i+1;j<B.length;j++){const b=B[j];
   const dx=b.x-a.x,dy=b.y-a.y,rr=a.rv+b.rv;if(dx*dx+dy*dy>=rr*rr)continue;
   const d=Math.sqrt(dx*dx+dy*dy)||.001,nx=dx/d,ny=dy/d,pen=rr-d;
   if(!a.fus&&!b.fus&&a.age>.05&&b.age>.05&&peutFus(a,b)){a.fus=b.fus=true;J.paires.push([a,b]);continue;}
   const ia=1/a.m,ib=1/b.m,sm=ia+ib;
   a.x-=nx*pen*ia/sm;a.y-=ny*pen*ia/sm;b.x+=nx*pen*ib/sm;b.y+=ny*pen*ib/sm;
   const rvx=b.vx-a.vx,rvy=b.vy-a.vy,vn=rvx*nx+rvy*ny;
   if(vn<0){if(vn<-40&&(!a.pose||!b.pose)){a.pose=b.pose=true;J.sons.push(-vn);}
    if(vn<-70){if(a.sp==='fragile'&&!a.casse&&b.y<a.y&&(b.m>a.m*1.4||b.sp==='plomb'))a.casse=true;if(b.sp==='fragile'&&!b.casse&&a.y<b.y&&(a.m>b.m*1.4||a.sp==='plomb'))b.casse=true;}const jn=-(1+REST)*vn/sm;a.vx-=jn*nx*ia;a.vy-=jn*ny*ia;b.vx+=jn*nx*ib;b.vy+=jn*ny*ib;
    /* frottement tangentiel, qui fait rouler */
    const tx=-ny,ty=nx;const vt=rvx*tx+rvy*ty;let jt=-vt/(sm*1.6);const lim=jn*FROT;jt=Math.max(-lim,Math.min(lim,jt));
    a.vx-=jt*tx*ia;a.vy-=jt*ty*ia;b.vx+=jt*tx*ib;b.vy+=jt*ty*ib;}}}
 }
 for(const b of B){b.vx*=.998;b.vy*=.998;const rx=(b.x-b.px)/dt,ry=(b.y-b.py)/dt;b.w+=(rx/b.r-b.w)*.2;if(rx*rx+ry*ry<4)b.w*=.6;if(b.vx*b.vx+b.vy*b.vy<16){b.vx*=.85;b.vy*=.92;b.w*=.7;}b.age+=dt;if(Math.abs(b.w)>14)b.w=Math.sign(b.w)*14;}
 /* les fusions */
 if(J.paires.length){const vus=new Set();for(const [a,b] of J.paires){if(vus.has(a.id)||vus.has(b.id))continue;vus.add(a.id);vus.add(b.id);fusion(a,b);}
  J.paires=[];J.corps=J.corps.filter(b=>!vus.has(b.id));for(const b of J.corps)b.fus=false;}
 const C=J.corps.filter(b=>b.casse);if(C.length){for(const b of C)casser(b);J.corps=J.corps.filter(b=>!b.casse);}
}
function fusion(a,b){const vip=a.sp==='vip'?a:b.sp==='vip'?b:null,k=vip?(vip===a?b.k:a.k):a.k,x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 J.combo=J.tCombo>0?J.combo+1:1;J.tCombo=1.25;J.fusions++;
 const frag=a.sp==='fragile'||b.sp==='fragile',expr=a.sp==='express'||b.sp==='express';
 let gain=TAI[Math.min(k+1,TAI.length-1)].pts*10*Math.min(5,J.combo)*(frag?2:1);J.score+=gain;
 J.pops.push({x,y,t:0,txt:'+'+gain+(J.combo>1?'  ×'+Math.min(5,J.combo):''),c:J.combo>1?'#f5c430':'#fff'});
 if(frag)J.pops.push({x,y:y-7,t:0,txt:'INTACT ×2',c:'#9fe8ff'});
 if(vip)J.pops.push({x,y:y-7,t:0,txt:'★ VIP',c:'#f5d27a'});
 if(expr){J.score+=1500;J.pops.push({x,y:y-9,t:0,txt:'EXPRESS LIVRÉ +1500',c:'#ffb050',gros:true});SON.express();vib([20,30,20]);}
 if(J.combo===3||J.combo===5){J.pops.push({x:CW/2,y:LIGNE+22,t:0,txt:J.combo===5?'CHAÎNE FOLLE ×5 !':'CHAÎNE ×3 !',c:'#f5c430',gros:true});}
 if(J.combo===4&&J.crochet<J.cmax){J.crochet++;J.pops.push({x,y:y-12,t:0,txt:'+1 🪝 crochet',c:'#9fe8ff'});majPouvoirs();}
 for(let i=0;i<10+k*3;i++){const an=hasard()*7,v=30+hasard()*60+k*6;J.parts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v-30,t:0,c:i%3?TAI[k].c:'#f5d27a',s:.8+hasard()*1.4});}
 J.ondes.push({x,y,t:0,R:TAI[k].r*2.6});for(const o of J.corps){const dx=o.x-x,dy=o.y-y,d=Math.hypot(dx,dy)||1,R=TAI[k].r*2.6;if(d<R&&o!==a&&o!==b){const f=(1-d/R)*(18+k*3);o.vx+=dx/d*f;o.vy+=dy/d*f-4;}
  if(o.sp==='cadenas'&&d<R+o.r){o.sp=null;J.score+=100;J.pops.push({x:o.x,y:o.y-4,t:0,txt:'LIBÉRÉ +100',c:'#7ee08a'});SON.libere();for(let i=0;i<10;i++){const an=hasard()*7;J.parts.push({x:o.x,y:o.y,vx:Math.cos(an)*50,vy:Math.sin(an)*50-30,t:0,c:'#d8b040',s:1.2});}}}
 if(k+1>=TAI.length){J.score+=2000;J.pops.push({x,y:y-10,t:0,txt:'CONTENEURS ! +2000',c:'#7ee08a'});J.secousse=.6;J.ralenti=1.4;J.flash=.5;SON.boum();vib([60,40,90]);return;}
 SON.pop(k+1,Math.min(7,J.combo));
 const n=corps(k+1,x,y,(a.vx+b.vx)/2,(a.vy+b.vy)/2-20,(a.sp==='plomb'&&b.sp==='plomb')?'plomb':null);n.rv=n.r*.55;n.age=0;n.w=(a.w+b.w)/2;n.pop=.32;J.corps.push(n);if(k+1===TAI.length-1){J.ralenti=1.1;J.flash=.35;SON.boum();}
 if(k+1>J.max)J.max=k+1;
 if(k>=4){J.secousse=.12+k*.03;vib(15+k*5);}else vib(8);}
function casser(b){J.score=Math.max(0,J.score-250);J.combo=0;J.tCombo=0;J.casses=(J.casses||0)+1;SON.verre();vib([30,20,30]);J.secousse=Math.max(J.secousse,.15);
 J.pops.push({x:b.x,y:b.y,t:0,txt:'CASSÉ ! −250',c:'#ff6a5a',gros:true});
 for(let i=0;i<26;i++){const an=hasard()*7,v=30+hasard()*80;J.parts.push({x:b.x+(hasard()-.5)*b.r,y:b.y+(hasard()-.5)*b.r,vx:Math.cos(an)*v,vy:Math.sin(an)*v-40,t:0,c:i%3?'#d8f4ff':TAI[b.k].c,s:.6+hasard()*1.2});}}
function vib(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(x){}}

/* --- lâcher le bagage tenu --- */
function lacher(){if(!J||J.fini||J.tuto||J.pause>0||J.mode)return;const r=TAI[J.tient].r,x=Math.max(r,Math.min(CW-r,J.x));
 const L=PEND,th=J.bal,bx=Math.max(r,Math.min(CW-r,x+L*Math.sin(th))),by=YLACHE-L+L*Math.cos(th);
 const vx=Math.max(-60,Math.min(60,(J.vit+L*J.om*Math.cos(th))*.55)),vy=Math.max(0,40-L*J.om*Math.sin(th)*.5);
 const c=corps(J.tient,bx,by,vx,vy,J.tSp);c.a=th;J.corps.push(c);J.om=0;J.bal=0;J.tient=J.suivant;J.tSp=J.sSp;J.suivant=tirer();J.sSp=tirerSp();J.echange=true;majPouvoirs();J.pause=.45;J.lache++;vib(5);SON.lache();}

/* --- la fin : la pile reste au-dessus de la ligne --- */
function surveiller(dt){let haut=false;for(const b of J.corps)if(b.age>1.2&&b.y-b.r<LIGNE&&Math.abs(b.vy)<40){haut=true;break;}
 J.danger=haut?J.danger+dt:Math.max(0,J.danger-dt*2);if(haut){const n=Math.ceil(3-J.danger);if(n!==J.dernierTic){J.dernierTic=n;SON.tic();vib(20);}}else J.dernierTic=0;if(J.danger>3)finir();}

/* --- le dessin --- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function bagage(g,k,x,y,a,rv,sp){const b=TAI[k],r=(rv||b.r),c=b.c;g.save();g.translate(x,y);g.rotate(a||0);
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
 if(sp)special(g,sp,r);
 g.restore();}
/* les marques des bagages spéciaux, posées par-dessus */
function etiquette(g,x,y,w,h,fond,bord){g.fillStyle='rgba(0,0,0,.35)';rr(g,x-w/2+.25,y-h/2+.35,w,h,h*.25);g.fill();g.fillStyle=bord;rr(g,x-w/2,y-h/2,w,h,h*.25);g.fill();g.fillStyle=fond;rr(g,x-w/2+h*.1,y-h/2+h*.1,w-h*.2,h*.8,h*.2);g.fill();}
function special(g,sp,r){const t=performance.now()/1000,u=Math.max(3.2,r*.5);
 if(sp==='plomb'){g.fillStyle='rgba(46,52,60,.55)';g.beginPath();g.arc(0,0,r*.98,0,7);g.fill();
  g.fillStyle='#3a4048';g.beginPath();g.moveTo(-u*.75,u*.55);g.lineTo(u*.75,u*.55);g.lineTo(u*.5,-u*.35);g.lineTo(-u*.5,-u*.35);g.closePath();g.fill();g.fillStyle='#8a929c';g.beginPath();g.moveTo(-u*.62,u*.45);g.lineTo(u*.62,u*.45);g.lineTo(u*.42,-u*.25);g.lineTo(-u*.42,-u*.25);g.closePath();g.fill();
  g.strokeStyle='#3a4048';g.lineWidth=u*.12;g.beginPath();g.arc(0,-u*.42,u*.2,0,7);g.stroke();g.fillStyle='#fff';g.font='900 '+(u*.42)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('kg',0,u*.15);}
 else if(sp==='cadenas'){g.strokeStyle='#5a5e66';g.lineWidth=Math.max(.9,r*.14);g.setLineDash([r*.18,r*.1]);g.beginPath();g.moveTo(-r*.95,-r*.5);g.lineTo(r*.95,r*.5);g.moveTo(r*.95,-r*.5);g.lineTo(-r*.95,r*.5);g.stroke();g.setLineDash([]);
  g.strokeStyle='#9a7a20';g.lineWidth=u*.16;g.beginPath();g.arc(0,-u*.12,u*.3,Math.PI,0);g.stroke();g.fillStyle='#9a7a20';rr(g,-u*.48,-u*.12,u*.96,u*.72,u*.12);g.fill();g.fillStyle='#e8c050';rr(g,-u*.4,-u*.06,u*.8,u*.6,u*.1);g.fill();g.fillStyle='#3a2a10';g.beginPath();g.arc(0,u*.16,u*.1,0,7);g.fill();g.fillRect(-u*.04,u*.16,u*.08,u*.2);}
 else if(sp==='fragile'){etiquette(g,0,0,u*1.5,u*1.05,'#fff','#c0392b');g.strokeStyle='#c0392b';g.lineWidth=u*.09;g.beginPath();g.moveTo(-u*.22,-u*.32);g.quadraticCurveTo(-u*.22,u*.05,0,u*.08);g.quadraticCurveTo(u*.22,u*.05,u*.22,-u*.32);g.closePath();g.stroke();g.beginPath();g.moveTo(0,u*.08);g.lineTo(0,u*.3);g.moveTo(-u*.16,u*.32);g.lineTo(u*.16,u*.32);g.stroke();
  const k=(t*1.3)%1;g.globalAlpha=Math.max(0,1-k*2);g.fillStyle='#fff';g.fillRect(r*.4-k*r*.2,-r*.6,r*.12,r*.12);g.globalAlpha=1;}
 else if(sp==='vip'){const k=.5+.5*Math.sin(t*5);g.strokeStyle='rgba(255,214,90,'+(.55+k*.45)+')';g.lineWidth=Math.max(.8,r*.12);g.beginPath();g.arc(0,0,r*1.02,0,7);g.stroke();
  g.fillStyle='#f5c430';g.beginPath();for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,R=i%2?u*.26:u*.6;g.lineTo(Math.cos(an)*R,Math.sin(an)*R);}g.closePath();g.fill();g.strokeStyle='#9a6a10';g.lineWidth=u*.07;g.stroke();
  g.fillStyle='rgba(255,255,255,'+(.3+k*.5)+')';g.beginPath();g.arc(-u*.12,-u*.18,u*.1,0,7);g.fill();}
 else if(sp==='express'){etiquette(g,0,0,u*1.9,u*.9,'#ffb050','#a84a10');g.fillStyle='#3a1a00';g.font='900 '+(u*.42)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('EXP',0,u*.04);}}

let FOND=null;
function fond(){/* la cale à ciel ouvert, au pied du navire du jour */
 const T=THEME,c=document.createElement('canvas');c.width=CV.width;c.height=CV.height;const g=c.getContext('2d');const V=VUE;
 const sk=g.createLinearGradient(0,0,0,c.height);sk.addColorStop(0,T.ciel[0]);sk.addColorStop(.42,T.ciel[1]);sk.addColorStop(1,T.ciel[2]);g.fillStyle=sk;g.fillRect(0,0,c.width,c.height);
 g.save();g.translate(V.ox,V.oy);g.scale(V.s,V.s);
 const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const haut=-(V.oy/V.s)-2;
 /* le soleil (ou la lune du soir) */
 const sx=T.k==='cargo'?32:84,sy=T.k==='croisiere'?-6:T.k==='cargo'?haut+9:-24;if(T.k!=='cargo'){const so=g.createRadialGradient(sx,sy,1,sx,sy,T.k==='croisiere'?40:26);so.addColorStop(0,T.soleil+'1)');so.addColorStop(.25,T.soleil+'.85)');so.addColorStop(1,T.soleil+'0)');g.fillStyle=so;g.fillRect(sx-45,sy-45,90,90);}
 if(T.k==='cargo'){for(let i=0;i<40;i++){g.fillStyle='rgba(255,255,255,'+(.3+hA(i,1)*.6)+')';g.fillRect(-10+hA(i,2)*120,haut+hA(i,3)*14,.45,.45);}const lg=g.createRadialGradient(sx,sy,2,sx,sy,9);lg.addColorStop(0,'rgba(246,240,216,.35)');lg.addColorStop(1,'rgba(246,240,216,0)');g.fillStyle=lg;g.fillRect(sx-9,sy-9,18,18);g.fillStyle='#f6f0d8';g.beginPath();g.arc(sx,sy,2.6,0,7);g.fill();g.fillStyle=T.ciel[0];g.beginPath();g.arc(sx+1.1,sy-.6,2.3,0,7);g.fill();}
 else{const nuage=(x,y,k,a)=>{g.fillStyle='rgba(255,255,255,'+a+')';for(const [dx,dy,r] of [[0,0,5],[6,-2.5,6.5],[13,0,5],[6,2,5]]){g.beginPath();g.arc(x+dx*k,y+dy*k,r*k,0,7);g.fill();}};
  const a=T.k==='croisiere'?.35:.95;nuage(2,haut+6,.8,a);nuage(56,haut+2,.6,a);}
 /* la superstructure du navire, au-dessus de la cale */
 const bas=-7.5;
 if(T.k==='ferry'){
  R(-6,bas-18,112,18,'#f4f4f6');R(-6,bas-18,112,.8,'#ffffff');R(4,bas-27,72,9,'#f4f4f6');R(16,bas-33,40,6,'#eef0f4');
  for(let x=-4;x<106;x+=4.4){R(x,bas-14,3,2.4,'#2a4a70');R(x+.3,bas-13.8,1,.8,'rgba(255,255,255,.5)');R(x,bas-8,3,2.4,'#2a4a70');}
  for(let x=6;x<76;x+=3.6)R(x,bas-24,2.6,2.2,'#2a4a70');R(18,bas-31,36,2.4,'#1a2a40');for(let x=19;x<54;x+=3)R(x,bas-30.6,2.2,1.6,'#4a7aa8');
  R(-6,bas-3,112,3,T.bande);R(-6,bas-4.2,112,1.2,T.bande2);
  R(78,bas-40,12,22,'#f4f4f6');R(78,bas-40,12,4,'#c8323a');R(78,bas-36,12,1.4,'#1f3566');R(80,bas-42,8,2.2,'#2a2a2e');R(78,bas-40,1.2,22,'#d8dce4');
  for(const x of [-2,20,42]){R(x,bas-21,12,3,'#f08a24');R(x,bas-21,12,.8,'#ffb050');R(x+1,bas-18,.6,1,'#aaa');R(x+10,bas-18,.6,1,'#aaa');}
  R(60,bas-46,.6,16,'#5a6068');R(57,bas-44,6,.5,'#5a6068');}
 else if(T.k==='croisiere'){
  for(let d=0;d<4;d++){const y=bas-7-d*7,x0=-6+d*6,x1=106-d*10;R(x0,y,x1-x0,7,d%2?'#f6f2ea':'#ffffff');R(x0,y,x1-x0,.6,'#ffffff');
   for(let x=x0+2;x<x1-3;x+=3.4){R(x,y+1.6,2.6,3.2,'#2a3a6a');R(x+.2,y+1.8,.9,1.4,'rgba(160,200,255,.45)');}R(x0,y+5.4,x1-x0,.6,'#c8b890');}
  R(-6,bas-3,112,3,T.coque);R(-6,bas-3.6,112,.8,T.bande);
  R(58,bas-42,11,14,T.coque);R(58,bas-42,11,3,T.bande);R(57,bas-43,13,1.4,'#0f1830');
  g.strokeStyle='rgba(60,50,40,.5)';g.lineWidth=.25;g.beginPath();g.moveTo(-6,bas-36);g.quadraticCurveTo(30,bas-28,66,bas-38);g.stroke();
  for(let i=0;i<=24;i++){const t=i/24,x=-6+72*t,y=(1-t)*(1-t)*(bas-36)+2*(1-t)*t*(bas-28)+t*t*(bas-38);g.fillStyle=['#ffe08a','#ff9a8a','#9fe8ff','#b8f0a0'][i%4];g.beginPath();g.arc(x,y+.6,.55,0,7);g.fill();}}
 else{
  const cols=['#c0392b','#2a6a9a','#e8b830','#2e7d4f','#8a5a32','#16a085','#d86a20','#5a2ab0','#e8e4d8'];
  for(let rang=0;rang<3;rang++)for(let x=-6;x<106;x+=13){const h=hA(x|0,rang,9),col=cols[(h*cols.length)|0],y=bas-6.2-rang*6.2;if(rang===2&&h<.35)continue;
   R(x,y,12.6,6,tn(col,-34));R(x+.4,y+.4,11.8,5.2,col);for(let q=x+1.2;q<x+12;q+=1.4)R(q,y+.6,.35,4.8,tn(col,-18));R(x+.4,y+.4,11.8,.5,tn(col,24));}
  R(-6,bas-1.2,112,1.2,'#14223e');
  for(const lx of [6,94]){R(lx-1.4,haut,2.8,bas-haut-18,'#2a6a9a');R(lx-1.4,haut,.6,bas-haut-18,'#4a8aba');}R(-6,haut+3,112,3,'#2a6a9a');R(-6,haut+3,112,.6,'#4a8aba');
  for(let x=-4;x<106;x+=6){g.strokeStyle='#1f5580';g.lineWidth=.4;g.beginPath();g.moveTo(x,haut+3);g.lineTo(x+3,haut+6);g.lineTo(x+6,haut+3);g.stroke();}
  for(const lx of [8,50,92]){g.fillStyle='rgba(255,230,160,.9)';g.beginPath();g.arc(lx,haut+7,.9,0,7);g.fill();const lb=g.createRadialGradient(lx,haut+7,0,lx,haut+7,14);lb.addColorStop(0,'rgba(255,230,160,.25)');lb.addColorStop(1,'rgba(255,230,160,0)');g.fillStyle=lb;g.fillRect(lx-14,haut+7-14,28,28);}}
 /* la coque, de part et d'autre de la cale */
 for(const [x,w] of [[-60,56.5],[CW+3.5,56.5]]){R(x,-8,w,CH+40,T.coque);for(let y=-4;y<CH+30;y+=10)R(x,y,w,.5,T.coque2);
  for(let y=8;y<CH;y+=16)for(let k=x+6;k<x+w-4;k+=10){g.fillStyle=T.hublot;g.beginPath();g.arc(k,y,1.6,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(k-1,y-1,.8,.8);}
  R(x,CH-6,w,6,T.bande2);R(x,CH,w,4,T.bande);}
 R(-60,-8,56.5,4,'#d8b07a');R(CW+3.5,-8,56.5,4,'#d8b07a');
 /* l'intérieur de la cale */
 const Q=T.tole;R(0,0,CW,CH,T.cale);
 if(T.k==='cargo'){for(let x=0;x<CW;x+=2.5){R(x,0,1.25,CH,Q[0]);R(x+1.25,0,.4,CH,Q[1]);}for(let y=0;y<CH;y+=42)R(0,y,CW,1.6,Q[2]);
  for(let i=0;i<14;i++){g.fillStyle='rgba(90,40,20,.25)';g.beginPath();g.ellipse(hA(i,5)*CW,hA(i,6)*CH,1+hA(i,7)*3,3+hA(i,8)*6,0,0,7);g.fill();}}
 else if(T.k==='croisiere'){for(let y=0;y<CH;y+=6.3){R(0,y,CW,.4,Q[0]);}for(let x=0;x<CW;x+=20){R(x,0,.6,CH,Q[2]);R(x+.6,0,.3,CH,Q[1]);}
  for(let x=10;x<CW;x+=20)for(let y=14;y<CH-10;y+=40){g.fillStyle='#d8b040';g.beginPath();g.arc(x,y,1.1,0,7);g.fill();g.fillStyle='rgba(255,220,140,.25)';g.beginPath();g.arc(x,y,5,0,7);g.fill();}}
 else{for(let x=0;x<CW;x+=12.5){R(x,0,.8,CH,Q[0]);R(x+.8,0,.5,CH,Q[1]);for(let y=4;y<CH;y+=9){g.fillStyle=Q[2];g.beginPath();g.arc(x+2.4,y,.45,0,7);g.fill();}}
  for(let y=30;y<CH;y+=30){R(0,y,CW,.8,Q[3]);R(0,y+.8,CW,.4,Q[4]);}}
 const lu=g.createLinearGradient(0,0,0,CH);lu.addColorStop(0,T.lum);lu.addColorStop(.5,'rgba(255,246,200,.06)');lu.addColorStop(1,T.ombre);g.fillStyle=lu;g.fillRect(0,0,CW,CH);
 g.fillStyle='rgba(255,250,220,.13)';g.beginPath();g.moveTo(52,0);g.lineTo(82,0);g.lineTo(48,CH);g.lineTo(18,CH);g.fill();
 for(let y=CH-4;y<CH;y+=2)R(0,y,CW,2,((y|0)%4)?T.sol[0]:T.sol[1]);
 const M=T.mont;for(const [x,w] of [[-3.5,3.5],[CW,3.5]]){R(x,-6,w,CH+9.5,M[0]);R(x,-6,.7,CH+9.5,M[1]);R(x+w-.6,-6,.6,CH+9.5,M[2]);for(let y=0;y<CH;y+=10){g.fillStyle=M[2];g.beginPath();g.arc(x+w/2,y,.45,0,7);g.fill();}}
 R(-3.5,CH,CW+7,3.5,M[0]);R(-3.5,CH+3,CW+7,.5,M[2]);
 for(const x of [-3.5,CW])for(let y=-6;y<6;y+=2)R(x,y,3.5,2,(y/2)%2?'#1a1a1e':'#e8c040');
 g.restore();FOND=c;}
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^((k||1)*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
function dessiner(){const g=G,V=VUE;if(!FOND||FOND.width!==CV.width||FOND.height!==CV.height)fond();
 g.setTransform(1,0,0,1,0,0);let sx=0,sy=0;if(J.secousse>0){sx=(hasard()-.5)*J.secousse*14*DPR;sy=(hasard()-.5)*J.secousse*14*DPR;}
 const til=J.gx*.0007,cx=V.ox+CW/2*V.s,cy=V.oy+CH/2*V.s;
 if(til){g.fillStyle=THEME.ciel[1];g.fillRect(0,0,CV.width,CV.height);g.translate(cx,cy);g.rotate(til);g.translate(-cx,-cy);}
 g.drawImage(FOND,sx,sy);
 const M0=g.getTransform();g.setTransform(M0.a*V.s,M0.b*V.s,M0.c*V.s,M0.d*V.s,M0.e+(V.ox+sx)*M0.a+(V.oy+sy)*M0.c,M0.f+(V.ox+sx)*M0.b+(V.oy+sy)*M0.d);
 /* les mouettes */
 for(const m of J.mouettes){const bat=Math.sin(performance.now()/140+m.ph)*1.2;g.strokeStyle=THEME.k==='cargo'?'rgba(230,236,245,.85)':'rgba(40,50,60,.8)';g.lineWidth=.45;g.beginPath();g.moveTo(m.x-2.2,m.y-bat);g.quadraticCurveTo(m.x-1,m.y-1.2,m.x,m.y);g.quadraticCurveTo(m.x+1,m.y-1.2,m.x+2.2,m.y-bat);g.stroke();}
 /* la ligne de charge, qui clignote quand ça déborde */
 const dg=J.danger>0,al=dg?(.5+.5*Math.sin(performance.now()/90)):.55;
 g.fillStyle='rgba(232,74,58,'+al+')';for(let x=0;x<CW;x+=4)g.fillRect(x,LIGNE-.4,2.4,.8);
 g.fillStyle='rgba(232,74,58,'+(dg?.95:.7)+')';g.font='800 3px system-ui,sans-serif';g.textAlign='center';g.fillText(dg?'ÇA DÉBORDE !':'LIGNE DE CHARGE',CW/2,LIGNE-1.6);
 if(dg){g.fillStyle='rgba(232,74,58,'+(J.danger/3*.28)+')';g.fillRect(0,0,CW,LIGNE);const n=Math.max(1,Math.ceil(3-J.danger)),ph=(3-J.danger)%1;g.save();g.translate(CW/2,LIGNE+16);g.scale(1+ph*.4,1+ph*.4);g.globalAlpha=.4+ph*.6;g.font='900 16px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(0,0,0,.45)';g.fillText(n,.6,.6);g.fillStyle='#ff6a5a';g.fillText(n,0,0);g.restore();g.globalAlpha=1;}
 /* le guide de chute et le crochet de la grue */
 const r=TAI[J.tient].r,x=Math.max(r,Math.min(CW-r,J.x));
 const L=PEND,th=J.bal,ty=YLACHE-L,bx=x+L*Math.sin(th),by=ty+L*Math.cos(th);
 if(J.pause<=0){g.fillStyle='rgba(30,60,70,.22)';const gx=Math.max(r,Math.min(CW-r,bx));for(let y=by+r;y<CH;y+=4)g.fillRect(gx-.25,y,.5,2);}
 /* le chariot de la grue sur son rail, le câble, le crochet */
 g.fillStyle='#5a6068';g.fillRect(-6,ty-4.4,CW+12,1.6);g.fillStyle='#e8c040';rr(g,x-5,ty-5.4,10,4.2,1);g.fill();g.fillStyle='#1a1a1e';g.fillRect(x-3.6,ty-1.4,1.6,1.4);g.fillRect(x+2,ty-1.4,1.6,1.4);
 const hx=bx-Math.sin(th)*(r+1.4),hy=by-Math.cos(th)*(r+1.4);g.strokeStyle='#5a6068';g.lineWidth=.7;g.beginPath();g.moveTo(x,ty);g.lineTo(hx,hy);g.stroke();
 g.save();g.translate(bx,by);g.rotate(th);g.fillStyle='#e8c040';rr(g,-3.2,-r-1.6,6.4,1.8,.6);g.fill();
 if(J.pause<=0)bagage(g,J.tient,0,0,0,0,J.tSp);else{g.globalAlpha=1-J.pause/.45;bagage(g,J.tient,0,0,0,r*(1-J.pause/.45*.5),J.tSp);g.globalAlpha=1;}g.restore();
 /* les bagages */
 for(const o of J.ondes){const k=o.t/.45;g.strokeStyle='rgba(255,236,170,'+(1-k)*.7+')';g.lineWidth=1.2*(1-k)+.2;g.beginPath();g.arc(o.x,o.y,o.R*(.35+k*.75),0,7);g.stroke();}
 for(const b of J.corps){const sc=b.pop>0?1+Math.sin((1-b.pop/.32)*Math.PI)*.16:1;bagage(g,b.k,b.x,b.y,b.a,b.rv*sc,b.sp);
  if(b.sp==='express'){const f=b.exp/20;g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.beginPath();g.arc(b.x,b.y,b.r+1.6,0,7);g.stroke();g.strokeStyle=f<.3&&(performance.now()/120|0)%2?'#ff4a3a':'#ffb050';g.beginPath();g.arc(b.x,b.y,b.r+1.6,-Math.PI/2,-Math.PI/2+f*Math.PI*2);g.stroke();}
  if(J.mode==='crochet'){g.strokeStyle='rgba(159,232,255,'+(.5+.5*Math.sin(performance.now()/150))+')';g.lineWidth=.6;g.beginPath();g.arc(b.x,b.y,b.r+.8,0,7);g.stroke();}}
 /* les bagages hissés par le crochet */
 for(const l of J.leves){const k=l.t/.8;g.strokeStyle='#5a6068';g.lineWidth=.6;g.beginPath();g.moveTo(l.x,-10);g.lineTo(l.x,l.y-k*k*120-l.r);g.stroke();g.globalAlpha=Math.max(0,1-k*.6);bagage(g,l.k,l.x,l.y-k*k*120,l.a,l.r,l.sp);g.globalAlpha=1;}
 /* les éclats */
 for(const p of J.parts){g.globalAlpha=Math.max(0,1-p.t/.6);g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}g.globalAlpha=1;
 for(const p of J.pops){const k=p.t/1.1;g.globalAlpha=Math.max(0,1-k*k);g.font='900 '+((p.gros?7:5)+(1-k)*1.5)+'px system-ui,sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.5)';g.fillText(p.txt,p.x+.4,p.y-k*12+.4);g.fillStyle=p.c;g.fillText(p.txt,p.x,p.y-k*12);}g.globalAlpha=1;
 /* l'échelle des bagages, sous la cale */
 const ey=CH+9;for(let i=0;i<TAI.length;i++){const ex=CW*(i+.5)/TAI.length,s=Math.min(1,4.4/TAI[i].r);g.save();g.translate(ex,ey);g.scale(s,s);g.globalAlpha=i<=J.max?1:.28;bagage(g,i,0,0,0);g.restore();}g.globalAlpha=1;
 g.setTransform(1,0,0,1,0,0);
 if(J.mode==='crochet'){g.fillStyle='rgba(10,30,50,.22)';g.fillRect(0,0,CV.width,CV.height);}
 const bd=J.mode==='crochet'?{txt:'🪝 Touche le bagage à retirer',t:2,c:'#9fe8ff'}:J.bandeau;
 if(bd){const u=CV.width/100,kk=Math.min(1,bd.t*3);g.globalAlpha=Math.max(0,kk);g.fillStyle='rgba(16,24,34,.9)';rr(g,5*u,2*u,90*u,9*u,4.5*u);g.fill();let fz=3.6*u;g.font='800 '+fz+'px system-ui,sans-serif';const tw=g.measureText(bd.txt).width;if(tw>84*u){fz*=84*u/tw;g.font='800 '+fz+'px system-ui,sans-serif';}g.fillStyle=bd.c||'#f5d27a';g.textAlign='center';g.textBaseline='middle';g.fillText(bd.txt,50*u,6.5*u);g.textBaseline='alphabetic';g.globalAlpha=1;}
 if(J.flash>0){g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(255,246,210,'+(J.flash*1.2)+')';g.fillRect(0,0,CV.width,CV.height);}
 /* la barre du haut */
 const hud=RAC.querySelector('.sc');hud.textContent=J.score.toLocaleString('fr-FR');
 RAC.querySelector('.cb').textContent=J.combo>1&&J.tCombo>0?'🔥 ×'+Math.min(5,J.combo):'🔥 ×1';
 const sv=RAC.querySelector('.sv canvas');if(sv&&sv._k!==J.suivant+'/'+J.sSp){sv._k=J.suivant+'/'+J.sSp;const q=sv.getContext('2d'),d=sv.width;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,d,d);const s=d/(TAI[J.suivant].r*2.6);q.setTransform(s,0,0,s,d/2,d/2);bagage(q,J.suivant,0,0,0,0,J.sSp);}}
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(t-(boucle.t||t))/1000);boucle.t=t;if(!J)return;
 const ts=J.ralenti>0?.3:1;J.ralenti=Math.max(0,J.ralenti-dt);J.flash=Math.max(0,J.flash-dt);
 if(!J.fini&&!J.tuto){pas(dt*ts);surveiller(dt*ts);evenements(dt*ts);}
 for(const m of J.mouettes){m.x+=m.v*dt;m.y+=Math.sin(performance.now()/900+m.ph)*.02;if(m.x>130)m.x=-30;if(m.x<-30)m.x=130;}
 for(const l of J.leves)l.t+=dt;J.leves=J.leves.filter(l=>l.t<.8);
 if(J.bandeau){J.bandeau.t-=dt;if(J.bandeau.t<=0)J.bandeau=null;}
 if(J.sons.length){SON.pose(Math.max(...J.sons));J.sons.length=0;}
 for(const o of J.ondes)o.t+=dt;J.ondes=J.ondes.filter(o=>o.t<.45);for(const b of J.corps)if(b.pop>0)b.pop=Math.max(0,b.pop-dt);
 {const lim=TAI[J.tient].r;J.cible=Math.max(lim,Math.min(CW-lim,J.cible));const ox=J.x;J.x+=(J.cible-J.x)*Math.min(1,dt*16);const v=(J.x-ox)/Math.max(dt,1e-3),ax=(v-J.vit)/Math.max(dt,1e-3);J.vit=v;
  /* le bagage pend au câble : un vrai pendule, secoué par l'accélération du chariot */
  const L=PEND;J.om+=(-(GRAV/L)*Math.sin(J.bal)-(Math.max(-500,Math.min(500,ax))*.4/L)*Math.cos(J.bal)-3.2*J.om)*dt;J.bal+=J.om*dt;if(Math.abs(J.bal)>.55){J.bal=Math.sign(J.bal)*.55;J.om*=-.2;}}
 J.pause=Math.max(0,J.pause-dt);J.tCombo=Math.max(0,J.tCombo-dt);if(J.tCombo<=0)J.combo=0;J.secousse=Math.max(0,J.secousse-dt);
 for(const p of J.parts){p.t+=dt;p.vy+=160*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}J.parts=J.parts.filter(p=>p.t<.6);
 for(const p of J.pops)p.t+=dt;J.pops=J.pops.filter(p=>p.t<1.1);
 dessiner();}

/* la houle, les colis express, les bagages spéciaux annoncés */
function evenements(dt){J.tJeu+=dt;
 if(J.tSp&&!(J.vus||(J.vus={}))[J.tSp]){J.vus[J.tSp]=1;J.bandeau={txt:SPECIAUX[J.tSp],t:3.2};}
 if(RG>=2&&!J.houle&&J.tJeu>=J.prochHoule){J.houle={t:0,d:9,s:hasard()<.5?1:-1};J.prochHoule=J.tJeu+48+hasard()*20;J.bandeau={txt:'🌊 HOULE ! Le navire roule, vise bien',t:2.6,c:'#9fe8ff'};SON.houle();vib([30,60,30]);}
 if(J.houle){const H=J.houle;H.t+=dt;const env=Math.min(1,H.t/1.2,(H.d-H.t)/1.2);J.gx=H.s*62*Math.sin(H.t*Math.PI*2/3.4)*Math.max(0,env);if(H.t>=H.d){J.houle=null;J.gx=0;J.score+=150;J.pops.push({x:CW/2,y:LIGNE+20,t:0,txt:'HOULE TENUE +150',c:'#9fe8ff',gros:true});}}
 if(RG>=3&&J.tJeu>=J.prochExpress&&J.sSp!=='express'&&J.tSp!=='express'){J.sSp='express';J.prochExpress=J.tJeu+40+hasard()*15;}
 for(const b of J.corps)if(b.sp==='express'){b.exp-=dt;if(b.exp<=0){b.sp=null;J.pops.push({x:b.x,y:b.y-4,t:0,txt:'express raté',c:'#ff9a8a'});SON.faux&&SON.faux();}}}
/* les pouvoirs : le crochet retire un bagage, l'échange permute le suivant */
function majPouvoirs(){if(!RAC||!J)return;const c=RAC.querySelector('.cro'),e2=RAC.querySelector('.ech');if(!c)return;c.querySelector('i').textContent=J.crochet;c.classList.toggle('vide',J.crochet<=0);c.classList.toggle('act',J.mode==='crochet');e2.classList.toggle('vide',!J.echange);}
function crocher(px,py){const x=(px-VUE.ox)/VUE.s,y=(py-VUE.oy)/VUE.s;let best=null,bd=1e9;for(const b of J.corps){const d=Math.hypot(b.x-x,b.y-y);if(d<b.r+3&&d<bd){bd=d;best=b;}}
 J.mode=null;if(!best){majPouvoirs();return;}J.crochet--;J.corps=J.corps.filter(b=>b!==best);J.leves.push({x:best.x,y:best.y,k:best.k,a:best.a,r:best.r,sp:best.sp,t:0});SON.crochet();vib(15);
 for(const o of J.corps){o.vy-=8;}majPouvoirs();}
function echanger(){if(!J||J.fini||!J.echange||J.pause>0)return;[J.tient,J.suivant]=[J.suivant,J.tient];[J.tSp,J.sSp]=[J.sSp,J.tSp];J.echange=false;J.pause=.2;SON.lache();vib(6);majPouvoirs();}
function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);
 const marge=8*DPR,haut=CV.height-marge*2,s=Math.min((CV.width-marge*2)/(CW+8),haut/(CH+16+48));
 VUE={s,ox:(CV.width-CW*s)/2,oy:CV.height-marge-(CH+16)*s};FOND=null;}

function finir(){if(J.fini)return;J.fini=true;vib(80);SON.fin();envoyerScore(J.score);const sc=J.score;let rec=0;try{rec=+(localStorage.getItem('bag_record')||0);if(sc>rec)localStorage.setItem('bag_record',sc);}catch(x){}
 const et=sc>=150000?3:sc>=75000?2:sc>=30000?1:0;
 const d=document.createElement('div');d.className='fin';
 const mx=document.createElement('canvas');mx.width=mx.height=120;const q=mx.getContext('2d');const s=120/(TAI[J.max].r*2.6);q.setTransform(s,0,0,s,60,60);bagage(q,J.max,0,0,0);
 d.innerHTML='<div class="c"><small>LA CALE EST PLEINE</small><div class="et">'+[0,1,2].map(i=>'<span class="'+(i<et?'on':'')+'">★</span>').join('')+'</div><h2>'+(et===3?'Docker de légende !':et===2?'Belle cale, collègue !':et===1?'Pas mal du tout':'Faut s’entraîner !')+'</h2>'+
  '<div class="mx"></div><div class="g"><div><b>'+J.fusions+'</b>fusions</div><div><b>'+J.lache+'</b>bagages</div><div><b>'+TAI[J.max].n+'</b>le plus gros</div></div>'+
  (RG<GRADES.length-1?'<p class="gr">Prochain grade : <b>'+GRADES[RG+1].nom+'</b> (niv. '+GRADES[RG+1].min+') · paie ×'+String(GRADES[RG+1].x).replace('.',',')+' · '+DEBLOQUE[RG+1]+'</p>':'')+'<p class="scf">Score <b>'+sc.toLocaleString('fr-FR')+'</b>'+(sc>rec?' · nouveau record !':rec?' · record '+rec.toLocaleString('fr-FR'):'')+'</p><div class="paie">Calcul de la paie…</div><p class="port"></p><button class="b1">Nouvelle cale</button><button class="b2">Retour au quai</button></div>';
 d.querySelector('.mx').appendChild(mx);RAC.querySelector('.scene').appendChild(d);payer(d,sc);
 setTimeout(()=>d.querySelectorAll('.et span.on').forEach((s,i)=>setTimeout(()=>{s.classList.add('pop');vib(10);},i*300)),300);
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle();majRec();affPort();ouvrirVac();majPouvoirs();majNavire();};d.querySelector('.b2').onclick=fermer;}
let PORT=null;
function affPort(){if(!RAC)return;const t=PORT&&PORT.score?'🏆 Record du port aujourd’hui : <b>'+String(PORT.pseudo).replace(/[<>&]/g,'')+'</b> · '+(+PORT.score).toLocaleString('fr-FR'):'🏆 Personne n’a encore rempli de cale aujourd’hui. À toi !';
 RAC.querySelectorAll('.port').forEach(e=>e.innerHTML=t);}
async function chargerPort(){try{PORT=await appelRPC('soute_record',{});}catch(x){}affPort();}
async function envoyerScore(sc){try{const r=await appelRPC('soute_score',{p_score:sc|0});if(r!==undefined)PORT=r;}catch(x){}affPort();}
/* LA PAIE : une vacation ouverte côté serveur à chaque cale, payée à la fin selon le score */
let VAC=null;
async function ouvrirVac(){VAC=null;try{const r=await appelRPC('soute_debut',{});if(r&&r.vacation)VAC=r.vacation;}catch(x){}}
const eur=c=>(Math.round(c/100)).toLocaleString('fr-FR')+' €';
async function payer(d,sc){const el=d.querySelector('.paie');if(!VAC){el.innerHTML='Connecte-toi pour être payé.';return;}
 const v=VAC;VAC=null;let r=null;try{r=await appelRPC('soute_fin',{p_vac:v,p_score:sc|0,p_fusions:J?J.fusions:0,p_lache:J?J.lache:0,p_max:J?J.max:0});}catch(x){}
 if(!r){el.innerHTML='Paie indisponible pour l’instant.';return;}
 if(r.xp>0){try{e.recolte=(e.recolte||0)+r.xp;if((e.score||0)<e.recolte)e.score=e.recolte;sauver();majHaut();}catch(x){}}
 const xpT=r.xp>0?'<i class="xp">+ '+r.xp+' XP</i>':'';
 if(r.erreur){el.innerHTML=xpT+(r.erreur==='plafond'?'Plafond du jour atteint : pas de paie.':r.erreur==='trop court'?'Vacation trop courte : pas de paie.':'Pas de paie ('+r.erreur+').');return;}
 el.innerHTML='<span>PAIE DE LA VACATION</span><b>+ '+eur(r.verse)+'</b>'+xpT+(r.prime?'<small>dont prime conteneur '+eur(r.prime)+'</small>':'')+(r.grade>1?'<small>grade '+GRADES[RG].nom.toLowerCase()+' : paie ×'+String(r.grade).replace('.',',')+'</small>':'')+(r.facteur<1?'<small>tarif réduit ('+Math.round(r.facteur*100)+' %) : déjà '+(r.faites-1)+' vacations aujourd’hui</small>':'');
 el.classList.add('ok');
 if(typeof r.euros==='number'){try{e.euros=r.euros;sauver();majHaut();}catch(x){}}
 try{const o=JSON.parse(localStorage.getItem('vac_jour')||'{}');}catch(x){}}
let NAVIRE='';function majNavire(){if(RAC)RAC.querySelector('.nav').textContent=GRADES[RG].nom.toUpperCase()+' · '+THEME.nom+' · ×'+String(GRADES[RG].x).replace('.',',');}
function majRec(){let rec=0;try{rec=+(localStorage.getItem('bag_record')||0);}catch(x){}RAC.querySelector('.rc').textContent='🏆 '+rec.toLocaleString('fr-FR');}
function tuto(){let vu=false;try{vu=localStorage.getItem('bag_tuto')==='1';}catch(x){}if(vu)return;J.tuto=true;
 const d=document.createElement('div');d.className='tuto';
 d.innerHTML='<div class="c"><small>PREMIÈRE VACATION</small><h2>La soute</h2>'+
  '<div class="et2"><span>👆</span><p><b>Fais glisser ton doigt</b> n’importe où : la grue se déplace.</p></div>'+
  '<div class="et2"><span>✋</span><p><b>Lève le doigt</b> : le bagage tombe dans la cale.</p></div>'+
  '<div class="et2"><span>✨</span><p><b>Deux bagages pareils fusionnent</b> en plus gros. Vise le conteneur !</p></div>'+
  '<div class="et2"><span>⚠️</span><p>Ne laisse pas la pile <b>au-dessus de la ligne rouge</b>.</p></div>'+
  '<div class="et2"><span>🪝</span><p><b>Crochet</b> : retire un bagage (1 de plus à chaque chaîne ×4). <b>⇄</b> : échange avec le suivant.</p></div><button class="b1">C’est parti</button></div>';
 RAC.querySelector('.scene').appendChild(d);d.querySelector('.b1').onclick=()=>{try{localStorage.setItem('bag_tuto','1');}catch(x){}d.remove();if(J)J.tuto=false;SON.lache();};}
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
#bag .son{width:38px;height:38px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font-size:16px;padding:0}
#bag .port{flex:none;text-align:center;color:#c8d4e4;font:700 12px 'Baloo 2',system-ui,sans-serif;padding:0 10px 4px}#bag .port b{color:#f5d27a}
#bag .fin .paie{margin:6px 0 2px;background:#fff;border-radius:14px;padding:8px;box-shadow:0 3px 0 #ddd3c0;font:700 12.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#bag .fin .paie.ok{background:#e6f6e8;box-shadow:0 3px 0 #b8dcc0}#bag .fin .paie span{display:block;font:800 10.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#3a7a4a}#bag .fin .paie b{display:block;font:900 26px/1.1 'Baloo 2',system-ui,sans-serif;color:#1e6a34}#bag .fin .paie .xp{display:inline-block;font:900 13px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#fff;background:#3a8ae8;border-radius:10px;padding:1px 9px;margin:2px 0 4px}
#bag .fin .paie small{display:block;font:700 11.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:0;color:#5a7a60}
#bag .fin .port{color:#5a4a3a;padding:0;margin:2px 0 4px}#bag .fin .port b{color:#a86a10}
#bag .tuto{position:absolute;inset:0;background:rgba(10,16,24,.78);display:grid;place-items:center;padding:20px;z-index:4}
#bag .tuto .c{width:min(340px,92vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:16px;box-shadow:0 6px 0 #b8a890}
#bag .tuto small{display:block;text-align:center;font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#bag .tuto h2{margin:0 0 8px;text-align:center;font:900 24px/1.1 'Baloo 2',system-ui,sans-serif}
#bag .tuto .et2{display:flex;gap:10px;align-items:center;background:#fff;border-radius:14px;padding:8px 10px;margin-bottom:7px;box-shadow:0 3px 0 #ddd3c0}
#bag .tuto .et2 span{font-size:24px}#bag .tuto .et2 p{margin:0;font:600 13.5px/1.3 'Baloo 2',system-ui,sans-serif}
#bag .tuto button{width:100%;margin-top:6px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif;background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}
#bag .scene{flex:1;min-height:0;position:relative}
#bag .scene>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#bag .bas{flex:none;position:static;display:flex;align-items:center;gap:8px;background:#1b2330;box-shadow:none;border:0;border-radius:0;opacity:1;padding:8px 12px calc(10px + env(safe-area-inset-bottom));color:#8ab0d8;font:700 11.5px/1.2 'Baloo 2',system-ui,sans-serif;text-align:center}
#bag .bas .aide{flex:1}
#bag .bas button{flex:none;height:44px;padding:0 14px;border:0;border-radius:15px;font:900 14px 'Baloo 2',system-ui,sans-serif;background:linear-gradient(#5ac8f0,#2a8ac0);color:#fff;box-shadow:0 4px 0 #1a5a80;touch-action:none}
#bag .bas button i{font-style:normal;display:inline-block;min-width:20px;margin-left:3px;background:rgba(0,0,0,.25);border-radius:9px;padding:0 5px}
#bag .bas .ech{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}
#bag .bas button.vide{filter:grayscale(1) brightness(.6)}#bag .bas button.act{transform:translateY(3px);box-shadow:none;outline:3px solid #9fe8ff}
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
 d.innerHTML='<div class="bar"><div><small class="nav">POSTE BAGAGES</small><b>La soute</b></div><span class="sp"></span><button class="son">'+(SON.on?'🔊':'🔇')+'</button><button class="x">Quitter</button></div>'+
  '<div class="pl"><span>⭐ <i class="sc" style="font-style:normal">0</i></span><span class="rc">🏆 0</span><span class="cb">🔥 ×1</span><span class="sv">SUIVANT<canvas width="90" height="90"></canvas></span></div><div class="port"></div>'+
  '<div class="scene"><canvas></canvas></div><div class="bas"><button class="cro">🪝 Crochet <i>1</i></button><span class="aide">Glisse, lève le doigt : ça tombe</span><button class="ech">⇄ Échanger</button></div>';
 document.body.appendChild(d);CV=d.querySelector('.scene>canvas');G=CV.getContext('2d');NAVIRE=String(navire||'').toUpperCase();
 nouvelle();majNavire();majRec();affPort();chargerPort();ouvrirVac();tuto();majPouvoirs();requestAnimationFrame(()=>{d.classList.add('on');cadrer();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 d.querySelector('.x').onclick=fermer;
 const cro=d.querySelector('.cro'),ech=d.querySelector('.ech');
 const tapB=(b,f)=>{b.addEventListener('touchstart',ev=>{ev.preventDefault();f();},{passive:false});b.addEventListener('click',f);};
 tapB(cro,()=>{if(!J||J.fini||J.tuto)return;if(J.mode==='crochet')J.mode=null;else if(J.crochet>0&&J.corps.length)J.mode='crochet';majPouvoirs();});tapB(ech,echanger);d.querySelector('.son').onclick=e=>{e.currentTarget.textContent=SON.basculer()?'🔊':'🔇';};
 /* viser : le doigt glisse, la grue suit en douceur (pas de saut là où on pose le doigt) ; on lâche en levant le doigt */
 let D0=null;
 const pos=e=>{const t=e.touches?(e.touches[0]||e.changedTouches[0]):e;return t.clientX;};
 const debut=e=>{if(!VUE||!J)return;if(J.mode==='crochet'){e.preventDefault();const t=e.touches?e.touches[0]:e,r=CV.getBoundingClientRect();crocher((t.clientX-r.left)*DPR,(t.clientY-r.top)*DPR);D0=null;return;}D0={x:pos(e),c:J.cible,t:performance.now(),bouge:0};e.preventDefault();};
 const glisse=e=>{if(!D0||!VUE||!J)return;const dx=(pos(e)-D0.x)*DPR/VUE.s;D0.bouge=Math.max(D0.bouge,Math.abs(dx));J.cible=D0.c+dx*1.15;e.preventDefault();};
 const fin=e=>{if(!D0)return;D0=null;e.preventDefault();lacher();};
 CV.addEventListener('touchstart',debut,{passive:false});CV.addEventListener('touchmove',glisse,{passive:false});CV.addEventListener('touchend',fin,{passive:false});CV.addEventListener('touchcancel',()=>{D0=null;});
 CV.addEventListener('mousedown',e=>{debut(e);const m=ev=>glisse(ev),u=ev=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);fin(ev);};addEventListener('mousemove',m);addEventListener('mouseup',u);});
 window.__BAG={J:()=>J,V:()=>VUE,lacher,viser:x=>{if(J)J.x=J.cible=x;}};
 RAF=requestAnimationFrame(boucle);};
})();
