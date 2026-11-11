/* =====================================================================
   LES TWISTS (twists.js) — poste du docker. Sous le portique, les
   conteneurs descendent l'un après l'autre devant toi, suspendus au
   spreader. DÉCHARGEMENT : pousse le levier du twist pour le déverrouiller,
   arrache-le vers le bas et lance-le dans la boîte. CHARGEMENT : prends un
   twist dans la boîte, enfonce-le dans le coin et pousse le levier pour
   verrouiller. Le grutier n'attend pas : 3 casques, pas un de plus.
   Indépendant : n'écrit que dans #twi.
   ===================================================================== */
(()=>{
const LW=100;
const ARMATEURS=[['CMA CGM','#2a4a8a'],['MSC','#e8e4d8'],['MAERSK','#3a8ad0'],['COSCO','#e8e4d8'],['HAPAG-LLOYD','#e86a20'],['EVERGREEN','#2e7d4f'],['ONE','#d8487a'],['CMA CGM','#c0392b'],['TRITON','#8a5a32']];
let RAC=null,CV=null,G=null,RAF=0,DPR=1,VUE=null,J=null;
const hasard=Math.random;
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function vib(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(x){}}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

/* --- les sons : métal, levier, boîte, grue --- */
const SON=(()=>{let ac=null,on=true;try{on=localStorage.getItem('twi_son')!=='0';}catch(x){}
 const ctx=()=>{if(!on)return null;try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(x){return null;}return ac;};
 const note=(f,d,type,vol,glis)=>{const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(glis)o.frequency.exponentialRampToValueAtTime(glis,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.15,t+.005);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);};
 const bruit=(d,vol,fc,type,q)=>{const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),s=b.getChannelData(0);for(let i=0;i<n;i++)s[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);
  const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=b;f.type=type||'bandpass';f.frequency.value=fc||2000;if(q)f.Q.value=q;g.gain.value=vol||.2;src.connect(f);f.connect(g);g.connect(a.destination);src.start();};
 const metal=(f,v)=>{note(f,.35,'triangle',v*.5);note(f*2.76,.25,'sine',v*.25);note(f*5.4,.15,'sine',v*.12);bruit(.05,v,4000);};
 return {get on(){return on;},basculer(){on=!on;try{localStorage.setItem('twi_son',on?'1':'0');}catch(x){}if(on)ctx();return on;},
  levier(){bruit(.04,.25,2200,'bandpass',3);note(520,.06,'square',.05,380);},
  verrou(){metal(640,.18);},
  arrache(){bruit(.07,.2,1500);note(300,.08,'triangle',.06,180);},
  vol(){bruit(.18,.05,900,'bandpass',.7);},
  boite(){metal(420+Math.random()*120,.16);setTimeout(()=>metal(560,.08),60);},
  sol(){metal(220,.22);setTimeout(()=>metal(260,.12),110);},
  pose(){bruit(.06,.2,1200);note(440,.05,'triangle',.06);},
  faux(){note(180,.14,'sawtooth',.06,140);},
  grue(){bruit(.9,.08,180,'lowpass');note(110,.9,'sawtooth',.025,90);},
  ok(){[784,988,1318].forEach((f,i)=>setTimeout(()=>note(f,.13,'sine',.11),i*60));},
  rate(){bruit(.4,.3,500,'lowpass');note(150,.4,'sawtooth',.08,70);},
  tic(){note(1400,.03,'square',.03);},
  fin(){note(392,.18,'triangle',.12);setTimeout(()=>note(330,.18,'triangle',.12),160);setTimeout(()=>note(262,.4,'triangle',.12),320);}};})();

/* --- la partie --- */
function nouvelle(){J={score:0,combo:0,boites:0,twists:0,ratés:0,vies:3,fini:false,niveau:0,tuto:false,
  cont:null,vols:[],pops:[],parts:[],secousse:0,main:null,geste:null,flash:0,flashC:'#fff',boiteN:10,dernier:null};nouveauConteneur();}
function HW(){return VUE?VUE.H:170;}
function geo(){const H=HW();const sol=Math.round(H*.6),ch=Math.min(48,H*.25),cy=sol-20-ch;return {cx:8,cw:84,cy,ch,bx:24,bw:44,by:sol+10,bh:19,sol};}
function nouveauConteneur(){const n=J.niveau,a=ARMATEURS[(hasard()*ARMATEURS.length)|0];
 /* chargement ou déchargement ; au début on alterne pour apprendre */
 const mode=n<2?(n===0?'dech':'charg'):(hasard()<.55?'dech':'charg');
 const sens=()=>hasard()<.5?-1:1;
 const coins=[0,1].map(i=>({i,etat:mode==='dech'?'verrou':'vide',sens:sens(),grippe:n>=4&&hasard()<.18,coups:0,lev:0}));
 const temps=Math.max(3.6,8-n*.32);
 J.cont={nom:a[0],c:a[1],mode,coins,t:temps,tmax:temps,phase:'descend',k:0,num:'TGHU '+(100000+((hasard()*899999)|0))+' '+((hasard()*9)|0)};
 SON.grue();}
function coinXY(i){const G2=geo();const c=J.cont;const off=c?contOffset():0;return {x:i===0?G2.cx+4.5:G2.cx+G2.cw-4.5,y:G2.cy+G2.ch-2.2+off};}
function contOffset(){const c=J.cont;if(!c)return 0;if(c.phase==='descend')return -(1-ease(c.k))*(geo().cy+geo().ch+20);if(c.phase==='monte')return -ease(c.k)*(geo().cy+geo().ch+30);return Math.sin(performance.now()/700)*.5;}
const ease=k=>1-Math.pow(1-Math.min(1,k),3);

/* --- les actions --- */
function pop(x,y,txt,c,gros){J.pops.push({x,y,t:0,txt,c:c||'#fff',gros});}
function gagner(pts,x,y,txt){const m=1+Math.min(2,J.combo*.25);const v=Math.round(pts*m);J.score+=v;pop(x,y,(txt?txt+' ':'')+'+'+v,'#fff');}
function levier(co,dir){const c=J.cont,p=coinXY(co.i);
 if(dir!==co.sens){co.lev=dir*.4;SON.faux();vib(25);pop(p.x,p.y-8,'Dans l’autre sens !','#ff9a8a');c.t=Math.max(.3,c.t-.4);return;}
 if(co.grippe&&co.coups===0){co.coups=1;co.lev=dir*.5;SON.levier();vib(12);pop(p.x,p.y-8,'Grippé : encore !','#f5d27a');J.secousse=.08;return;}
 co.lev=dir;SON.levier();vib(10);
 if(co.etat==='verrou'){co.etat='libre';co.sens=-co.sens;gagner(30,p.x,p.y-8);}
 else if(co.etat==='pose'){co.etat='verrou';co.sens=-co.sens;SON.verrou();gagner(40,p.x,p.y-8,'Verrouillé');J.twists++;verifier();}}
function verifier(){const c=J.cont;if(!c||c.phase!=='travail')return;
 const fini=c.mode==='dech'?c.coins.every(co=>co.etat==='vide'):c.coins.every(co=>co.etat==='verrou');
 if(fini&&!J.vols.some(v=>v.vole))termine();}
function termine(){const c=J.cont;c.phase='monte';c.k=0;J.boites++;J.combo++;J.niveau++;
 const bonus=Math.round(80+c.t/c.tmax*160);gagner(bonus,50,geo().cy+geo().ch/2,'CONTENEUR');SON.ok();vib(15);
 for(let i=0;i<24;i++){const an=hasard()*7,v=20+hasard()*40;J.parts.push({x:50,y:geo().cy+geo().ch/2,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t:0,c:i%2?'#f5d27a':'#fff',s:.8+hasard()});}
 J.flash=.25;J.flashC='rgba(126,224,138,.25)';setTimeout(()=>SON.grue(),80);}
function rate(raison){const c=J.cont;J.vies--;J.combo=0;J.ratés++;SON.rate();vib([60,40,80]);J.secousse=.5;J.flash=.4;J.flashC='rgba(232,74,58,.35)';
 pop(50,geo().cy+geo().ch+10,raison,'#ff6a5a',true);c.phase='monte';c.k=0;J.niveau=Math.max(0,J.niveau-1);
 if(J.vies<=0)setTimeout(()=>{if(J&&!J.fini)finir();},900);}

/* --- le dessin --- */
let FOND=null;
function fond(){const c=document.createElement('canvas');c.width=CV.width;c.height=CV.height;const g=c.getContext('2d');const V=VUE,H=V.H,G2=geo();
 g.setTransform(V.s,0,0,V.s,V.ox,0);const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 /* le ciel de fin d'après-midi */
 const sk=g.createLinearGradient(0,0,0,G2.sol);sk.addColorStop(0,'#4a9ad8');sk.addColorStop(.6,'#9ad0f0');sk.addColorStop(1,'#f0dcb8');g.fillStyle=sk;g.fillRect(-10,0,LW+20,G2.sol);
 for(const [x,y,s] of [[12,10,1],[70,18,.7],[40,6,.5]]){g.fillStyle='rgba(255,255,255,.8)';for(const [dx,dy,r] of [[0,0,4],[5,-2,5],[10,0,4]]){g.beginPath();g.arc(x+dx*s,y+dy*s,r*s,0,7);g.fill();}}
 /* les autres portiques au loin, la ville */
 g.fillStyle='rgba(90,110,140,.35)';for(let x=-10;x<LW+10;x+=7)g.fillRect(x,G2.sol-8-hA(x|0,1,2)*10,6,20);
 for(const x of [8,58]){g.fillStyle='rgba(200,160,60,.45)';g.fillRect(x,G2.sol-46,2,46);g.fillRect(x+18,G2.sol-46,2,46);g.fillRect(x-6,G2.sol-48,34,2.4);g.fillRect(x+20,G2.sol-48,14,1.4);}
 /* les jambes du portique, au premier plan */
 for(const x of [-6,LW+1]){R(x,0,5,G2.sol+2,'#e8b830');R(x,0,1.2,G2.sol+2,'#ffd860');R(x+4,0,1,G2.sol+2,'#b8901a');for(let y=6;y<G2.sol;y+=14){g.strokeStyle='#c8981e';g.lineWidth=.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y+10);g.stroke();}}
 R(-10,0,LW+20,3.4,'#e8b830');R(-10,3,LW+20,.8,'#b8901a');
 /* le quai : béton, bande jaune, rails */
 R(-10,G2.sol,LW+20,H-G2.sol,'#c8bca2');for(let y=G2.sol;y<H;y+=7)for(let x=-10+((y/7|0)%2)*6;x<LW+10;x+=12)R(x,y,11.4,6.4,hA(x|0,y|0,4)<.5?'#cdc1a8':'#c2b69c');
 R(-10,G2.sol,LW+20,1.4,'#e8c040');for(let x=-10;x<LW+10;x+=4)R(x,G2.sol,2,1.4,'#1a1a1e');
 for(const y of [G2.sol+6,G2.sol+11]){R(-10,y,LW+20,1,'#8a9098');R(-10,y,LW+20,.3,'#c8ccd2');}
 g.fillStyle='rgba(40,30,20,.08)';for(let i=0;i<20;i++){g.beginPath();g.ellipse(hA(i,5,5)*LW,G2.sol+8+hA(i,6,5)*(H-G2.sol-10),3+hA(i,7,5)*4,1+hA(i,8,5),0,0,7);g.fill();}
 FOND=c;}
/* le twist : cône du haut, embase, cône du bas, levier (angle lev : -1 gauche, +1 droite) */
function twist(g,x,y,s,a,lev,or){g.save();g.translate(x,y);g.scale(s,s);g.rotate(a||0);
 g.fillStyle='rgba(0,0,0,.28)';g.fillRect(-2.6,-3.2,5.8,7.4);
 const metal=or?['#c8a040','#f0d070','#a07818']:['#7a8088','#b0b6bc','#5a6068'];
 g.fillStyle=metal[0];g.beginPath();g.moveTo(-2,-.7);g.lineTo(2,-.7);g.lineTo(1,-3.6);g.lineTo(-1,-3.6);g.fill();g.fillStyle=metal[1];g.fillRect(-1,-3.6,.7,2.9);
 g.fillStyle=metal[2];rr(g,-3,-.8,6,1.8,.4);g.fill();g.fillStyle=metal[1];g.fillRect(-3,-.8,6,.4);
 g.fillStyle=metal[0];g.beginPath();g.moveTo(-2,1);g.lineTo(2,1);g.lineTo(1,3.9);g.lineTo(-1,3.9);g.fill();g.fillStyle=metal[1];g.fillRect(-1,1,.7,2.9);
 g.save();g.translate(0,.1);g.rotate((lev||0)*.55);g.fillStyle='#d8a020';g.fillRect(.4,-.45,4.6,.9);g.fillStyle='#ffd040';g.fillRect(.4,-.45,4.6,.3);g.fillStyle='#c0392b';rr(g,4.4,-.8,1.8,1.6,.5);g.fill();g.restore();
 g.restore();}
function conteneur(g){const c=J.cont,G2=geo(),off=contOffset(),x=G2.cx,y=G2.cy+off,w=G2.cw,h=G2.ch;
 /* les câbles et le spreader */
 g.fillStyle='#2a2e34';g.fillRect(x+w/2-6,-2,.6,y-4);g.fillRect(x+w/2+5.4,-2,.6,y-4);g.fillRect(x+w*.2,-2,.5,y-4+2);g.fillRect(x+w*.8,-2,.5,y-4+2);
 g.fillStyle='#e8b830';g.fillRect(x-1.5,y-4.4,w+3,4.4);g.fillStyle='#ffd860';g.fillRect(x-1.5,y-4.4,w+3,.8);g.fillStyle='#b8901a';for(let k=x;k<x+w;k+=6)g.fillRect(k,y-4.4,.5,4.4);
 g.fillStyle='#3a3e44';g.fillRect(x+w/2-7,y-7,14,3);g.fillStyle='#e84a3a';g.fillRect(x+w/2-1,y-6.4,2,1.4);
 /* l'ombre portée au sol */
 g.fillStyle='rgba(30,20,10,'+(.12+Math.max(0,.18-(-off)/200))+')';g.beginPath();g.ellipse(50,G2.sol+4,w*.5,3,0,0,7);g.fill();
 /* la caisse : ondulée, poteaux d'angle, portes à droite */
 const col=c.c;g.fillStyle=tn(col,-45);g.fillRect(x,y,w,h);g.fillStyle=col;g.fillRect(x+1,y+1,w-2,h-2);
 for(let k=x+2.4;k<x+w-2;k+=2.2){g.fillStyle=tn(col,-20);g.fillRect(k,y+1.6,.8,h-3.2);g.fillStyle=tn(col,16);g.fillRect(k+.8,y+1.6,.4,h-3.2);}
 g.fillStyle=tn(col,30);g.fillRect(x+1,y+1,w-2,.8);g.fillStyle=tn(col,-35);g.fillRect(x+1,y+h-2,w-2,1);
 g.fillStyle=tn(col,-30);g.fillRect(x+1,y+1,3,h-2);g.fillRect(x+w-4,y+1,3,h-2);
 /* le nom de l'armateur et le numéro */
 const clair=col==='#e8e4d8';g.fillStyle=clair?'rgba(40,40,60,.85)':'rgba(255,255,255,.9)';g.font='900 '+(c.nom.length>8?7:9)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(c.nom,x+w/2,y+h*.45);
 g.font='800 2.6px ui-monospace,monospace';g.fillStyle=clair?'rgba(40,40,60,.7)':'rgba(255,255,255,.75)';g.textAlign='left';g.fillText(c.num,x+6,y+5);g.fillText('MAX GROSS 30 480 KG',x+6,y+h-5);g.textBaseline='alphabetic';
 /* les pièces de coin */
 for(const [cx,cy] of [[x+.4,y+.4],[x+w-7.4,y+.4],[x+.4,y+h-5.4],[x+w-7.4,y+h-5.4]]){g.fillStyle='#3a3e44';g.fillRect(cx,cy,7,5);g.fillStyle='#5a6068';g.fillRect(cx,cy,7,1);g.fillStyle='#1a1a1e';g.beginPath();g.ellipse(cx+3.5,cy+2.8,1.9,1,0,0,7);g.fill();}
 /* le bandeau du mode */
 const dech=c.mode==='dech';g.fillStyle=dech?'rgba(200,50,40,.92)':'rgba(40,140,70,.92)';rr(g,x+w/2-17,y+h+3,34,6,3);g.fill();g.fillStyle='#fff';g.font='900 3.6px system-ui,sans-serif';g.textAlign='center';g.fillText(dech?'⬇ DÉCHARGEMENT':'⬆ CHARGEMENT',x+w/2,y+h+7.2);
 /* les twists dans les coins du bas */
 for(const co of c.coins){const p=coinXY(co.i);co.lev+=((co.etat==='verrou'?0:0)-co.lev)*.0;
  if(co.etat==='vide'){if(c.mode==='charg'&&c.phase==='travail'){const k=.5+.5*Math.sin(performance.now()/170);g.strokeStyle='rgba(126,224,138,'+(.4+k*.5)+')';g.lineWidth=.8;g.setLineDash([1.4,1]);g.beginPath();g.arc(p.x,p.y+5,6+k,0,7);g.stroke();g.setLineDash([]);}continue;}
  if(J.main&&J.main.co===co)continue;
  const verr=co.etat==='verrou';twist(g,p.x,p.y+5,2.1,0,verr?co.sens*-1:co.sens*-1);
  /* l'indice du sens : une flèche qui pulse */
  if(c.phase==='travail'&&(co.etat==='verrou'&&c.mode==='dech'||co.etat==='pose')){const k=(performance.now()/500)%1;g.globalAlpha=1-k;g.fillStyle='#fff';const ax=p.x+co.sens*(7+k*5),ay=p.y+4.4;g.beginPath();g.moveTo(ax+co.sens*2.4,ay);g.lineTo(ax,ay-2);g.lineTo(ax,ay+2);g.fill();g.globalAlpha=1;}
  if(co.etat==='libre'&&c.phase==='travail'){const k=(performance.now()/450)%1;g.globalAlpha=1-k;g.fillStyle='#ffd860';g.beginPath();g.moveTo(p.x,p.y+13+k*5);g.lineTo(p.x-2,p.y+10+k*5);g.lineTo(p.x+2,p.y+10+k*5);g.fill();g.globalAlpha=1;}}}
function laBoite(g){const G2=geo(),x=G2.bx,y=G2.by,w=G2.bw,h=G2.bh;
 g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+1.2,y+1.8,w,h);
 g.fillStyle='#6a4426';g.fillRect(x,y,w,h);g.fillStyle='#4a2e18';g.fillRect(x+1.4,y+1.4,w-2.8,h-3);
 /* les twists entassés dedans */
 g.save();g.beginPath();g.rect(x+1.4,y+1.4,w-2.8,h-3);g.clip();const n=Math.min(26,J.boiteN);for(let i=0;i<n;i++){const tx=x+4+hA(i,1,9)*(w-8),ty=y+3+hA(i,2,9)*(h-7)*.6+((i/n)*(h-7)*.4);twist(g,tx,ty,.8,(hA(i,3,9)-.5)*2.4,(hA(i,4,9)-.5)*2);}g.restore();
 g.fillStyle='#8a5a32';g.fillRect(x,y,w,1.4);g.fillStyle='#a87040';g.fillRect(x,y,w,.5);for(const k of [x+w*.33,x+w*.66])g.fillRect(k,y,.5,h);
 g.fillStyle='#8a5a32';g.fillRect(x,y+h-2,w,2);g.fillStyle='#1a1a1e';g.fillRect(x+2,y+h,3,1.4);g.fillRect(x+w-5,y+h,3,1.4);
 g.fillStyle='#f5d27a';g.font='900 3.2px ui-monospace,monospace';g.textAlign='center';g.fillText('TWISTS · '+J.boiteN,x+w/2,y+h+5);
 if(J.cont&&J.cont.mode==='charg'&&J.cont.phase==='travail'&&!J.main&&J.cont.coins.some(co=>co.etat==='vide')){const k=.5+.5*Math.sin(performance.now()/200);g.strokeStyle='rgba(126,224,138,'+(.3+k*.6)+')';g.lineWidth=.8;g.strokeRect(x-1,y-1,w+2,h+2);}}
function dessiner(){const g=G,V=VUE;if(!FOND||FOND.width!==CV.width||FOND.height!==CV.height)fond();const G2=geo();
 g.setTransform(1,0,0,1,0,0);let sx=0,sy=0;if(J.secousse>0){sx=(hasard()-.5)*J.secousse*12*DPR;sy=(hasard()-.5)*J.secousse*12*DPR;}
 g.drawImage(FOND,sx,sy);g.setTransform(V.s,0,0,V.s,V.ox+sx,sy);
 if(J.cont)conteneur(g);
 laBoite(g);
 /* le docker, à côté de la boîte */
 try{g.save();g.translate(G2.bx+G2.bw+16,G2.by+G2.bh+4);g.scale(.62,.62);personne(g,0,0,Object.assign({},e.ap||{},{_civil:true}),'gauche',0,false);g.restore();g.setTransform(V.s,0,0,V.s,V.ox+sx,sy);}catch(x){}
 /* les twists en vol */
 for(const v of J.vols)twist(g,v.x,v.y,1.6,v.a,v.lev);
 /* le twist tenu au doigt */
 if(J.main){const m=J.main;twist(g,m.x,m.y,1.9,m.a||0,m.lev||0);g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(m.x,m.y,6,0,7);g.fill();
  if(m.cible){g.strokeStyle='rgba(126,224,138,.95)';g.lineWidth=.9;g.beginPath();g.arc(m.cible.x,m.cible.y+5,5.5,0,7);g.stroke();}}
 /* la barre du grutier */
 const c=J.cont;if(c&&c.phase==='travail'){const k=Math.max(0,c.t/c.tmax),bx=20,by=G2.cy-14+contOffset()*0,bw=60;
  g.fillStyle='rgba(16,24,34,.88)';rr(g,bx-2,by-5.4,bw+4,10,2.4);g.fill();g.fillStyle='#8ab0d8';g.font='800 2.8px system-ui,sans-serif';g.textAlign='center';g.fillText(k<.3?'LE GRUTIER S’IMPATIENTE !':'LE GRUTIER LÈVE DANS…',50,by-1.4);
  g.fillStyle='#2e3a4e';g.fillRect(bx,by+.6,bw,2.6);g.fillStyle=k<.3?'#e84a3a':k<.6?'#f5c430':'#4ac860';g.fillRect(bx,by+.6,bw*k,2.6);}
 /* éclats, scores */
 for(const p of J.parts){g.globalAlpha=Math.max(0,1-p.t/.7);g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}g.globalAlpha=1;
 for(const p of J.pops){const k=p.t/1.2;g.globalAlpha=Math.max(0,1-k*k);g.font='900 '+(p.gros?6:4.4)+'px system-ui,sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.55)';g.fillText(p.txt,p.x+.4,p.y-k*9+.4);g.fillStyle=p.c;g.fillText(p.txt,p.x,p.y-k*9);}g.globalAlpha=1;
 if(J.flash>0){g.setTransform(1,0,0,1,0,0);g.fillStyle=J.flashC;g.globalAlpha=Math.min(1,J.flash*3);g.fillRect(0,0,CV.width,CV.height);g.globalAlpha=1;}
 /* la barre du haut */
 RAC.querySelector('.sc').textContent=J.score.toLocaleString('fr-FR');RAC.querySelector('.bx').textContent='📦 '+J.boites;
 RAC.querySelector('.vi').textContent='⛑'.repeat(Math.max(0,J.vies))+'·'.repeat(Math.max(0,3-J.vies));
 RAC.querySelector('.cb').textContent='🔥 ×'+(1+Math.min(2,J.combo*.25)).toFixed(2).replace(/\.?0+$/,'');}

/* --- la boucle --- */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(t-(boucle.t||t))/1000);boucle.t=t;if(!J)return;
 const c=J.cont;
 if(c&&!J.fini&&!J.tuto){
  if(c.phase==='descend'){c.k+=dt*1.9;if(c.k>=1){c.k=0;c.phase='travail';}}
  else if(c.phase==='travail'){const av=c.t;c.t-=dt;if(c.t<c.tmax*.3&&Math.floor(av*4)!==Math.floor(c.t*4))SON.tic();
   if(c.t<=0){c.t=0;J.main=null;rate(c.mode==='dech'?(c.coins.some(co=>co.etat==='verrou')?'TWIST VERROUILLÉ : ARRACHÉ !':'TWIST OUBLIÉ !'):'MAL VERROUILLÉ !');}}
  else if(c.phase==='monte'){c.k+=dt*1.7;if(c.k>=1&&!J.fini&&J.vies>0)nouveauConteneur();}}
 for(const co of (c?c.coins:[]))co.lev*=Math.pow(.02,dt);
 /* les twists lancés : gravité, rebonds, la boîte */
 const G2=geo();
 for(const v of J.vols){v.vy+=180*dt;v.x+=v.vx*dt;v.y+=v.vy*dt;v.a+=v.w*dt;
  if(!v.fini&&v.vy>0&&v.y>G2.by&&v.y<G2.by+G2.bh&&v.x>G2.bx+1&&v.x<G2.bx+G2.bw-1){v.fini=true;v.dedans=true;J.boiteN++;J.twists++;SON.boite();vib(8);
   const net=Math.abs(v.x-(G2.bx+G2.bw/2))<G2.bw*.22;gagner(net?70:50,v.x,G2.by-2,net?'Panier !':'');v.mort=true;verifier();}
  if(!v.fini&&v.y>G2.sol+6){v.fini=true;v.vy*=-.35;v.vx*=.5;v.w*=.5;SON.sol();vib(30);J.combo=0;pop(v.x,G2.sol,'Par terre !','#ff9a8a');J.score=Math.max(0,J.score-30);v.reste=.8;J.twists++;J.boiteN++;verifier();}
  if(v.fini&&!v.dedans&&v.y>G2.sol+6){v.y=G2.sol+6;v.vy*=-.3;}
  if(v.reste!==undefined){v.reste-=dt;if(v.reste<=0)v.mort=true;}}
 J.vols=J.vols.filter(v=>!v.mort&&v.y<HW()+20);
 J.secousse=Math.max(0,J.secousse-dt);J.flash=Math.max(0,J.flash-dt);
 for(const p of J.parts){p.t+=dt;p.vy+=50*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}J.parts=J.parts.filter(p=>p.t<.7);
 for(const p of J.pops)p.t+=dt;J.pops=J.pops.filter(p=>p.t<1.2);
 dessiner();}
function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);
 const s=CV.width/LW;VUE={s,ox:0,H:CV.height/s};FOND=null;}

/* --- les gestes : pousser le levier, arracher, lancer, enfoncer --- */
function monde(ev){const t=ev.touches?(ev.touches[0]||ev.changedTouches[0]):ev;const r=CV.getBoundingClientRect();return {x:((t.clientX-r.left)*DPR-VUE.ox)/VUE.s,y:((t.clientY-r.top)*DPR)/VUE.s,t:performance.now()};}
function debut(ev){ev.preventDefault();if(!J||J.fini||J.tuto||!VUE)return;const m=monde(ev),c=J.cont,G2=geo();if(!c||c.phase!=='travail')return;
 /* un coin proche ? */
 for(const co of c.coins){const p=coinXY(co.i);if(Math.hypot(m.x-p.x,m.y-(p.y+4))<11&&co.etat!=='vide'){J.geste={co,x0:m.x,y0:m.y,hist:[m]};return;}}
 /* la boîte, en chargement */
 if(c.mode==='charg'&&m.x>G2.bx-3&&m.x<G2.bx+G2.bw+3&&m.y>G2.by-4&&m.y<G2.by+G2.bh+3&&J.boiteN>0&&c.coins.some(co=>co.etat==='vide')){J.boiteN--;J.main={x:m.x,y:m.y,src:'boite',lev:0,hist:[m]};SON.arrache();vib(6);}}
function bouge(ev){ev.preventDefault();if(!J||!VUE)return;const m=monde(ev);
 if(J.main){const M=J.main;M.x=m.x;M.y=m.y;M.hist.push(m);if(M.hist.length>6)M.hist.shift();M.a=Math.max(-.6,Math.min(.6,(M.hist[M.hist.length-1].x-M.hist[0].x)*.04));
  if(M.src==='boite'){let best=null;for(const co of J.cont.coins){if(co.etat!=='vide')continue;const p=coinXY(co.i);if(Math.hypot(m.x-p.x,m.y-(p.y+5))<9)best={co,x:p.x,y:p.y};}M.cible=best;}return;}
 const Gs=J.geste;if(!Gs)return;Gs.hist.push(m);const dx=m.x-Gs.x0,dy=m.y-Gs.y0,co=Gs.co;
 /* un glissé franc à gauche ou à droite : le levier */
 if(!Gs.fait&&Math.abs(dx)>4.5&&Math.abs(dx)>Math.abs(dy)*1.2&&(co.etat==='verrou'&&J.cont.mode==='dech'||co.etat==='pose')){Gs.fait=true;levier(co,Math.sign(dx));return;}
 /* tirer vers le bas un twist déverrouillé : on l'arrache */
 if(co.etat==='libre'&&dy>4){co.etat='vide';const p=coinXY(co.i);J.main={x:m.x,y:m.y,src:'coin',co,lev:co.sens*-1,hist:[m]};J.geste=null;SON.arrache();vib(10);gagner(15,p.x,p.y+10);}
 else if(co.etat==='verrou'&&dy>5&&!Gs.dit){Gs.dit=true;pop(coinXY(co.i).x,coinXY(co.i).y+12,'Déverrouille d’abord !','#ff9a8a');SON.faux();vib(20);}}
function fin(ev){ev.preventDefault();if(!J)return;J.geste=null;const M=J.main;if(!M)return;J.main=null;
 if(M.src==='boite'){if(M.cible){M.cible.co.etat='pose';M.cible.co.lev=0;SON.pose();vib(10);gagner(20,M.cible.x,M.cible.y+12,'Posé');}else{J.boiteN++;}return;}
 /* lancer : la vitesse des derniers mouvements */
 const h=M.hist,a=h[0],b=h[h.length-1],dt=Math.max(.016,(b.t-a.t)/1000);let vx=(b.x-a.x)/dt,vy=(b.y-a.y)/dt;
 const sp=Math.hypot(vx,vy);if(sp>160){vx*=160/sp;vy*=160/sp;}
 J.vols.push({x:M.x,y:M.y,vx,vy,a:M.a||0,w:(vx)*.05,lev:M.lev});SON.vol();}

/* --- la fin, la paie --- */
let VAC=null,VAC_MSG='Connecte-toi pour être payé.';
async function ouvrirVac(){VAC=null;try{const r=await appelRPC('twists_debut',{});if(r&&r.vacation)VAC=r.vacation;else if(!r||r.erreur!=='connexion')VAC_MSG='La paie des twists arrive très bientôt.';}catch(x){VAC_MSG='La paie des twists arrive très bientôt.';}}
const eur=c=>(Math.round(c/100)).toLocaleString('fr-FR')+' €';
async function payer(d,sc){const el=d.querySelector('.paie');if(!VAC){el.innerHTML=VAC_MSG;return;}
 const v=VAC;VAC=null;let r=null;try{r=await appelRPC('twists_fin',{p_vac:v,p_score:sc|0,p_boites:J.boites,p_twists:J.twists});}catch(x){}
 if(!r){el.innerHTML='Paie indisponible pour l’instant.';return;}
 if(r.xp>0){try{e.recolte=(e.recolte||0)+r.xp;if((e.score||0)<e.recolte)e.score=e.recolte;sauver();majHaut();}catch(x){}}
 const xpT=r.xp>0?'<i class="xp">+ '+r.xp+' XP</i>':'';
 if(r.erreur){el.innerHTML=xpT+(r.erreur==='plafond'?'Plafond du jour atteint : pas de paie.':r.erreur==='trop court'?'Vacation trop courte : pas de paie.':r.erreur==='grade'?'Ce poste demande le grade de docker (niveau 10).':String(r.erreur).indexOf('serveur')===0?'La paie des twists arrive très bientôt.':'Pas de paie ('+r.erreur+').');return;}
 el.innerHTML='<span>PAIE DE LA VACATION</span><b>+ '+eur(r.verse)+'</b>'+xpT+(r.facteur<1?'<small>tarif réduit ('+Math.round(r.facteur*100)+' %) : déjà '+(r.faites-1)+' vacations aujourd’hui</small>':'');el.classList.add('ok');
 if(typeof r.euros==='number'){try{e.euros=r.euros;sauver();majHaut();}catch(x){}}}
function finir(){if(J.fini)return;J.fini=true;J.main=null;J.geste=null;SON.fin();vib(80);const sc=J.score;let rec=0;try{rec=+(localStorage.getItem('twi_record')||0);if(sc>rec)localStorage.setItem('twi_record',sc);}catch(x){}
 const et=sc>=9000?3:sc>=5000?2:sc>=2000?1:0;const d=document.createElement('div');d.className='fin';
 d.innerHTML='<div class="c"><small>FIN DE LA BORDÉE</small><div class="et">'+[0,1,2].map(i=>'<span class="'+(i<et?'on':'')+'">★</span>').join('')+'</div><h2>'+(et===3?'Roi du twist !':et===2?'Belle bordée, collègue !':et===1?'Ça tourne':'Le grutier t’attend…')+'</h2>'+
  '<div class="g"><div><b>'+J.boites+'</b>conteneurs</div><div><b>'+J.twists+'</b>twists</div><div><b>'+J.ratés+'</b>ratés</div></div>'+
  '<p class="scf">Score <b>'+sc.toLocaleString('fr-FR')+'</b>'+(sc>rec?' · nouveau record !':rec?' · record '+rec.toLocaleString('fr-FR'):'')+'</p><div class="paie">Calcul de la paie…</div><button class="b1">Nouvelle bordée</button><button class="b2">Retour au quai</button></div>';
 RAC.querySelector('.scene').appendChild(d);payer(d,sc);
 setTimeout(()=>d.querySelectorAll('.et span.on').forEach((s,i)=>setTimeout(()=>{s.classList.add('pop');vib(10);},i*300)),400);
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle();majRec();ouvrirVac();};d.querySelector('.b2').onclick=fermer;}
function majRec(){let rec=0;try{rec=+(localStorage.getItem('twi_record')||0);}catch(x){}RAC.querySelector('.rc').textContent='🏆 '+rec.toLocaleString('fr-FR');}
function tuto(){let vu=false;try{vu=localStorage.getItem('twi_tuto')==='1';}catch(x){}if(vu)return;J.tuto=true;
 const d=document.createElement('div');d.className='tuto';
 d.innerHTML='<div class="c"><small>PREMIÈRE BORDÉE</small><h2>Les twists</h2>'+
  '<div class="et2"><span>⬇</span><p><b>Déchargement</b> : glisse sur le twist <b>dans le sens de la flèche</b> pour pousser le levier…</p></div>'+
  '<div class="et2"><span>🫳</span><p>… puis <b>tire-le vers le bas</b> et <b>lance-le dans la boîte</b>. Au centre : panier !</p></div>'+
  '<div class="et2"><span>⬆</span><p><b>Chargement</b> : prends un twist dans la boîte, enfonce-le dans le coin, puis pousse le levier.</p></div>'+
  '<div class="et2"><span>⛑</span><p>Le grutier n’attend pas : <b>3 casques</b>. Un twist oublié, et c’en est un de moins.</p></div><button class="b1">C’est parti</button></div>';
 RAC.querySelector('.scene').appendChild(d);d.querySelector('.b1').onclick=()=>{try{localStorage.setItem('twi_tuto','1');}catch(x){}d.remove();if(J)J.tuto=false;SON.grue();};}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;J=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);removeEventListener('resize',cadrer);}

const CSS=`#twi{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#1b2330;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;touch-action:none}
#twi.on{opacity:1}#twi *{box-sizing:border-box}
#twi .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 4px;color:#fff}
#twi .bar b{font:900 19px/1 'Baloo 2',system-ui,sans-serif}#twi .bar small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#8ab0d8;margin-bottom:2px}
#twi .sp{flex:1}#twi .x{height:38px;padding:0 15px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font:800 14px 'Baloo 2',system-ui,sans-serif}
#twi .son{width:38px;height:38px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font-size:16px;padding:0}
#twi .pl{flex:none;display:flex;justify-content:center;gap:6px;padding:4px 10px 8px;color:#fff}
#twi .pl span{background:#2e3a4e;border-radius:14px;padding:4px 10px;font:800 14px 'Baloo 2',system-ui,sans-serif;white-space:nowrap}
#twi .scene{flex:1;min-height:0;position:relative}
#twi .scene>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#twi .bas{flex:none;position:static;background:#1b2330;box-shadow:none;border:0;border-radius:0;opacity:1;padding:8px 14px calc(10px + env(safe-area-inset-bottom));color:#c8d4e4;font:700 13px/1.25 'Baloo 2',system-ui,sans-serif;text-align:center}
#twi .fin,#twi .tuto{position:absolute;inset:0;background:rgba(10,16,24,.8);display:grid;place-items:center;padding:20px;z-index:3}
#twi .fin .c,#twi .tuto .c{width:min(340px,92vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:16px;text-align:center;box-shadow:0 6px 0 #b8a890}
#twi small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#twi .fin .et{font-size:38px;line-height:1;margin:4px 0;color:#d8cfbe}#twi .fin .et span{display:inline-block;transition:transform .3s}#twi .fin .et span.pop{color:#f2b030;transform:scale(1.25)}
#twi h2{margin:2px 0 8px;font:900 23px/1.1 'Baloo 2',system-ui,sans-serif}
#twi .fin .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 8px}#twi .fin .g div{background:#fff;border-radius:14px;padding:7px 4px;box-shadow:0 3px 0 #ddd3c0;font:700 11.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#twi .fin .g b{display:block;font:900 18px/1.15 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#twi .fin .scf{margin:4px 0;font:800 16px 'Baloo 2',system-ui,sans-serif}
#twi .fin .paie{margin:6px 0 2px;background:#fff;border-radius:14px;padding:8px;box-shadow:0 3px 0 #ddd3c0;font:700 12.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#twi .fin .paie.ok{background:#e6f6e8;box-shadow:0 3px 0 #b8dcc0}#twi .fin .paie span{display:block;font:800 10.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#3a7a4a}#twi .fin .paie b{display:block;font:900 26px/1.1 'Baloo 2',system-ui,sans-serif;color:#1e6a34}
#twi .fin .paie .xp{display:inline-block;font:900 13px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#fff;background:#3a8ae8;border-radius:10px;padding:1px 9px;margin:2px 0 4px}#twi .fin .paie small{display:block;font:700 11.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:0;color:#5a7a60}
#twi button.b1,#twi button.b2{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#twi .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#twi .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}
#twi .tuto .c{text-align:left}#twi .tuto small,#twi .tuto h2{display:block;text-align:center}
#twi .tuto .et2{display:flex;gap:10px;align-items:center;background:#fff;border-radius:14px;padding:8px 10px;margin-bottom:7px;box-shadow:0 3px 0 #ddd3c0}
#twi .tuto .et2 span{font-size:22px;min-width:26px;text-align:center}#twi .tuto .et2 p{margin:0;font:600 13px/1.3 'Baloo 2',system-ui,sans-serif}`;

window.ouvrirTwists=function(navire){if(RAC)return;if(!document.getElementById('twiCss')){const s=document.createElement('style');s.id='twiCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='twi';RAC=d;
 d.innerHTML='<div class="bar"><div><small>DOCKER · '+String(navire||'PORTIQUE 4').toUpperCase()+'</small><b>Les twists</b></div><span class="sp"></span><button class="son">'+(SON.on?'🔊':'🔇')+'</button><button class="x">Quitter</button></div>'+
  '<div class="pl"><span class="vi">⛑⛑⛑</span><span>⭐ <i class="sc" style="font-style:normal">0</i></span><span class="bx">📦 0</span><span class="cb">🔥 ×1</span><span class="rc">🏆 0</span></div>'+
  '<div class="scene"><canvas></canvas></div><div class="bas">Glisse sur le twist dans le sens de la flèche, tire-le, lance-le dans la boîte.</div>';
 document.body.appendChild(d);CV=d.querySelector('.scene>canvas');G=CV.getContext('2d');
 requestAnimationFrame(()=>{d.classList.add('on');cadrer();nouvelle();majRec();ouvrirVac();tuto();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 d.querySelector('.x').onclick=fermer;d.querySelector('.son').onclick=ev=>{ev.currentTarget.textContent=SON.basculer()?'🔊':'🔇';};
 CV.addEventListener('touchstart',debut,{passive:false});CV.addEventListener('touchmove',bouge,{passive:false});CV.addEventListener('touchend',fin,{passive:false});CV.addEventListener('touchcancel',fin,{passive:false});
 CV.addEventListener('mousedown',ev=>{debut(ev);const m=x=>bouge(x),u=x=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);fin(x);};addEventListener('mousemove',m);addEventListener('mouseup',u);});
 window.__TWI={J:()=>J,V:()=>VUE,coin:coinXY,geo};
 RAF=requestAnimationFrame(boucle);};
})();
