/* =====================================================================
   LE DOUGLAS (douglas.js) — poste du chauffeur. Au volant d'un tracteur
   portuaire Douglas : un ordre arrive (« GEODIS → cale, voie 2 »).
   Recule pile sous le pivot de la bonne remorque (CLAC), branche les
   flexibles, remonte les béquilles, fais demi-tour, puis RECULE la
   remorque dans la voie du ferry, dételle et repars. Le ferry se remplit,
   appareille, un autre arrive. Indépendant : n'écrit que dans #dou.
   ===================================================================== */
(()=>{
const WW=100,WH=272;                 /* le monde : 100 de large, il défile en hauteur */
const SOC=[['GEFCO','#2a6a9a'],['STEF','#2e7d4f'],['MAERSK','#3a8ad0'],['DHL','#e8b830'],['CORSICA','#c0392b'],['GEODIS','#5a2ab0'],['NORBERT','#e8e4d8'],['ROSSI','#8a5a32'],['SNCM','#16a085'],['KUEHNE','#2a3a6a']];
const FERRIES=['PASCAL PAOLI','PIANA','DANIELLE CASANOVA','MÉGA EXPRESS','JEAN NICOLI','PAGLIA ORBA'];
const VOIES=[{x:22},{x:50},{x:78}],VY0=8,VY1=74,VW2=9;   /* voies de la cale : centre x, de y0 à y1, demi-largeur */
const PARCX=[14,32,50,68,86],PARCY=184;                  /* le parc : pivots des remorques */
const LT=28,HB=4.6,LW=8.4;          /* remorque : pivot→essieu ; Douglas : centre→sellette ; empattement */
let RAC=null,CV=null,G=null,RAF=0,DPR=1,VUE=null,J=null;
const hasard=Math.random;
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
const ang=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};
function vib(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(x){}}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

/* --- les sons : moteur, bip de recul, CLAC, air comprimé, corne --- */
const SON=(()=>{let ac=null,on=true,mot=null;try{on=localStorage.getItem('dou_son')!=='0';}catch(x){}
 const ctx=()=>{if(!on)return null;try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(x){return null;}return ac;};
 const note=(f,d,type,vol,glis)=>{const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(glis)o.frequency.exponentialRampToValueAtTime(glis,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.15,t+.005);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);};
 const bruit=(d,vol,fc,type)=>{const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),s=b.getChannelData(0);for(let i=0;i<n;i++)s[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.6);
  const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=b;f.type=type||'bandpass';f.frequency.value=fc||1500;g.gain.value=vol||.2;src.connect(f);f.connect(g);g.connect(a.destination);src.start();};
 return {get on(){return on;},basculer(){on=!on;try{localStorage.setItem('dou_son',on?'1':'0');}catch(x){}if(!on)this.moteur(0);else ctx();return on;},
  moteur(v){const a=ctx();if(!a){if(mot){try{mot.g.gain.value=0;}catch(x){}}return;}if(!mot){const o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=320;g.gain.value=0;o.connect(f);o2.connect(f);f.connect(g);g.connect(a.destination);o.start();o2.start();mot={o,o2,g};}
   const k=Math.min(1,Math.abs(v)/26);mot.o.frequency.value=42+k*55;mot.o2.frequency.value=21+k*28;mot.g.gain.value=on?.028+k*.04:0;},
  bip(){note(1650,.12,'square',.04);},
  clac(){bruit(.06,.4,1200);note(160,.12,'square',.06,90);setTimeout(()=>bruit(.04,.25,2400),70);},
  air(){bruit(.35,.12,3600,'highpass');},
  choc(){bruit(.25,.35,500,'lowpass');note(110,.2,'sawtooth',.07,60);},
  manivelle(){bruit(.03,.08,2800);},
  ok(){[659,880,1175].forEach((f,i)=>setTimeout(()=>note(f,.14,'sine',.12),i*70));},
  corne(){note(147,1.3,'sawtooth',.09,145);note(110,1.3,'sine',.16,108);},
  faux(){note(200,.14,'sawtooth',.06,150);},
  fin(){note(392,.18,'triangle',.12);setTimeout(()=>note(523,.18,'triangle',.12),160);setTimeout(()=>note(659,.4,'triangle',.12),320);}};})();

/* --- la partie --- */
function nouvelle(){J={t:120,score:0,livres:0,chocs:0,parfaits:0,combo:0,sansChoc:true,fini:false,tuto:false,
  D:{x:50,y:140,a:-Math.PI/2,v:0,d:0},rem:null,parc:[],cale:[],ferry:FERRIES[(hasard()*FERRIES.length)|0],
  ordre:null,cam:60,volant:0,pedale:0,pops:[],parts:[],secousse:0,panneau:null,dernierChoc:0,bipT:0,fumees:[],depart:0,flash:0};
 for(let i=0;i<PARCX.length;i++)J.parc.push(Object.assign(remorqueParc(i),{arrive:0}));
 nouvelOrdre();}
function remorqueParc(i){const s=SOC[(hasard()*SOC.length)|0];return {i,nom:s[0],c:s[1],kx:PARCX[i],ky:PARCY,a:-Math.PI/2,arrive:1};}
function nouvelOrdre(){const libres=VOIES.map((v,i)=>i).filter(i=>!J.cale[i]);if(!libres.length)return;
 const dispo=J.parc.filter(p=>p&&p.arrive<=0);if(!dispo.length){setTimeout(()=>{if(J&&!J.fini&&!J.ordre)nouvelOrdre();},800);return;}const r=dispo[(hasard()*dispo.length)|0];
 J.ordre={rem:r,voie:libres[(hasard()*libres.length)|0],etape:'atteler'};}
/* les points de la remorque : pivot K, essieu A, et les 4 coins */
function remPts(K,a,avant){const c=Math.cos(a),s=Math.sin(a);const A={x:K.x-c*LT,y:K.y-s*LT};
 const av=avant===undefined?3:avant,ar=LT+5,l=5.2;const P=(f,lat)=>({x:K.x+c*f-s*lat,y:K.y+s*f+c*lat});return {A,coins:[P(av,-l),P(av,l),P(-ar,l),P(-ar,-l)]};}
function douPts(D){const c=Math.cos(D.a),s=Math.sin(D.a);const P=(f,lat)=>({x:D.x+c*f-s*lat,y:D.y+s*f+c*lat});return [P(7.4,-4.6),P(7.4,4.6),P(-6,4.6),P(-6,-4.6),P(7.4,0),P(-6,0)];}
function sellette(D){return {x:D.x-Math.cos(D.a)*HB,y:D.y-Math.sin(D.a)*HB};}
function dansPoly(p,c){let ok=false;for(let i=0,j=c.length-1;i<c.length;j=i++){const a=c[i],b=c[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)ok=!ok;}return ok;}

/* --- les obstacles : coque du ferry, remorques garées --- */
function murs(){return [[-4,0,7.2,92],[96.8,0,8,92],[-4,84,32,8],[72,84,32,8],[-4,0,108,4],[-4,WH-2,108,6],[-6,0,6,WH],[WW,0,6,WH]];}
function obstacles(){const O=[];for(const m of murs())O.push([{x:m[0],y:m[1]},{x:m[0]+m[2],y:m[1]},{x:m[0]+m[2],y:m[1]+m[3]},{x:m[0],y:m[1]+m[3]}]);
 for(const p of J.parc)if(p&&(!J.rem||J.rem.src!==p))O.push(remPts({x:p.kx,y:p.ky},p.a,J.ordre&&J.ordre.rem===p&&!J.rem?-3:3).coins);
 for(const c of J.cale)if(c)O.push(remPts({x:c.kx,y:c.ky},c.a,-3).coins);return O;}
function heurte(pts,O){for(const p of pts)for(const o of O)if(dansPoly(p,o))return true;return false;}

/* --- la conduite --- */
function piloter(dt){const D=J.D;if(J.panneau||J.fini||J.tuto||J.depart>0){D.v*=.85;SON.moteur(D.v);return;}
 const vmax=J.pedale>0?24:13;const cible=J.pedale*vmax;D.v+=(cible-D.v)*Math.min(1,dt*(J.pedale?2.2:4));if(Math.abs(D.v)<.05&&!J.pedale)D.v=0;
 D.d+=(J.volant*.6-D.d)*Math.min(1,dt*8);
 const av={x:D.x,y:D.y,a:D.a},ar=J.rem?{K:J.rem.K,a:J.rem.a}:null;
 /* le tracteur : un vélo, empattement LW */
 D.x+=Math.cos(D.a)*D.v*dt;D.y+=Math.sin(D.a)*D.v*dt;D.a=ang(D.a+D.v/LW*Math.tan(D.d)*dt);
 /* la remorque suit : son essieu reste sur la trace (tractrice), dans les deux sens */
 if(J.rem){const K=sellette(D),R0=remPts(J.rem.K,J.rem.a);const na=Math.atan2(K.y-R0.A.y,K.x-R0.A.x);J.rem.K=K;J.rem.a=na;
  const pli=ang(D.a-na);if(Math.abs(pli)>1.25){D.x=av.x;D.y=av.y;D.a=av.a;J.rem.K=ar.K;J.rem.a=ar.a;D.v=0;choc('PORTEFEUILLE !');return;}}
 /* les chocs */
 const O=obstacles();let pts=douPts(D);if(J.rem)pts=pts.concat(remPts(J.rem.K,J.rem.a).coins);
 if(heurte(pts,O)){D.x=av.x;D.y=av.y;D.a=av.a;if(ar){J.rem.K=ar.K;J.rem.a=ar.a;}const vv=D.v;D.v=-D.v*.25;if(Math.abs(vv)>4)choc('CHOC !');}
 /* bip de recul, fumée */
 if(D.v<-1){J.bipT-=dt;if(J.bipT<=0){J.bipT=.5;SON.bip();}}
 if(Math.abs(D.v)>2&&hasard()<dt*8){const c=Math.cos(D.a),s=Math.sin(D.a);J.fumees.push({x:D.x+c*1-s*3.6,y:D.y+s*1+c*3.6,t:0,r:.8});}
 SON.moteur(D.v);}
function choc(txt){const now=performance.now();if(now-J.dernierChoc<700)return;J.dernierChoc=now;J.chocs++;J.sansChoc=false;J.combo=0;J.score=Math.max(0,J.score-40);
 SON.choc();vib([40,30,40]);J.secousse=.3;pop(J.D.x,J.D.y-8,txt+' −40','#ff6a5a',true);}
function pop(x,y,txt,c,gros){J.pops.push({x,y,t:0,txt,c:c||'#fff',gros});}
function gagner(v,x,y,txt){const m=1+Math.min(1,J.combo*.25);const n=Math.round(v*m);J.score+=n;pop(x,y,(txt?txt+' ':'')+'+'+n,'#fff');}

/* --- l'attelage : sellette sous le pivot, bien aligné, à l'arrêt --- */
function alignement(){const o=J.ordre;if(!o||J.rem||o.etape!=='atteler')return null;const r=o.rem;const S=sellette(J.D);
 const dx=r.kx-S.x,dy=r.ky-S.y,dist=Math.hypot(dx,dy);const c=Math.cos(r.a),s=Math.sin(r.a);const lat=-dx*s+dy*c;const da=ang(J.D.a-r.a);
 return {dist,lat,da};}
function essaiAtteler(){const al=alignement();if(!al)return;
 if(al.dist<2.6&&Math.abs(al.da)<.3&&Math.abs(J.D.v)<4){const r=J.ordre.rem;J.rem={src:r,nom:r.nom,c:r.c,K:sellette(J.D),a:r.a,branche:false};
  const prec=Math.max(0,1-al.dist/2.6)*.6+Math.max(0,1-Math.abs(al.da)/.3)*.4;J.D.v=0;SON.clac();vib(25);J.secousse=.12;gagner(100+Math.round(prec*100),J.D.x,J.D.y-10,prec>.75?'CLAC PARFAIT':'CLAC');if(prec>.75)J.parfaits++;
  ouvrirPanneau();}}
/* le panneau des flexibles et des béquilles */
function ouvrirPanneau(){const ordre=[0,1,2].sort(()=>hasard()-.5);J.panneau={prises:ordre,tuyaux:[0,1,2].map(i=>({i,ok:false,x:0,y:0})),tient:null,manivelle:0,etape:'flex',anim:0,t0:performance.now(),vP:null};}
function fermerPanneau(){const P=J.panneau;const sec=(performance.now()-P.t0)/1000;J.panneau=null;J.rem.branche=true;J.ordre.etape='livrer';
 /* la remorque quitte le parc ; un camion en ramènera une autre */
 const i=J.parc.indexOf(J.rem.src);if(i>=0){J.parc[i]=null;setTimeout(()=>{if(J&&!J.parc[i])J.parc[i]=remorqueParc(i);},4000);}
 gagner(sec<4?80:sec<7?50:20,J.D.x,J.D.y-12,sec<4?'Branché vite':'Branché');J.bandeau={txt:'Demi-tour, puis RECULE dans la voie '+(J.ordre.voie+1)+' du ferry',t:3};}
/* dételer : la remorque bien dans sa voie, à l'arrêt */
function peutDeteler(){if(!J.rem||!J.ordre||J.ordre.etape!=='livrer'||Math.abs(J.D.v)>2)return null;const v=VOIES[J.ordre.voie],R=remPts(J.rem.K,J.rem.a);
 const dans=R.coins.every(p=>p.x>v.x-VW2&&p.x<v.x+VW2&&p.y>VY0-1&&p.y<VY1+2);if(!dans)return null;
 const off=Math.abs((R.A.x+J.rem.K.x)/2-v.x),da=Math.abs(ang(J.rem.a-Math.PI/2));return {off,da};}
function deteler(){const q=peutDeteler();if(!q)return;const r=J.rem,vi=J.ordre.voie;J.cale[vi]={nom:r.nom,c:r.c,kx:r.K.x,ky:r.K.y,a:r.a};J.rem=null;J.livres++;
 const prec=Math.max(0,1-q.off/4)*.6+Math.max(0,1-q.da/.25)*.4;let pts=300+Math.round(prec*200);if(J.sansChoc){pts+=150;}
 SON.air();setTimeout(()=>SON.ok(),150);vib(20);gagner(pts,VOIES[vi].x,40,J.sansChoc?'LIVRÉ SANS CHOC':'LIVRÉ');if(J.sansChoc)J.combo++;J.sansChoc=true;
 J.t=Math.min(180,J.t+28);pop(VOIES[vi].x,52,'⏱ +28 s','#7ee08a');
 for(let i=0;i<22;i++){const an=hasard()*7,v=15+hasard()*30;J.parts.push({x:VOIES[vi].x,y:44,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t:0,c:i%2?'#f5d27a':'#fff',s:.8+hasard()});}
 J.ordre=null;
 if(J.cale.filter(Boolean).length>=VOIES.length){J.depart=4;SON.corne();J.bandeau={txt:'Le '+J.ferry+' est plein · il appareille ! +400',t:3};J.score+=400;}
 else setTimeout(()=>{if(J&&!J.fini)nouvelOrdre();},700);}

/* --- le dessin --- */
let FOND=null;
function fond(){const s=VUE.s;const c=document.createElement('canvas');c.width=Math.round(WW*s);c.height=Math.round(WH*s);const g=c.getContext('2d');g.setTransform(s,0,0,s,0,0);
 const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 /* le quai : béton, joints, taches */
 R(0,0,WW,WH,'#9a9488');for(let y=92;y<WH;y+=10)for(let x=((y/10|0)%2)*8;x<WW;x+=16)R(x,y,15.4,9.4,hA(x,y,6)<.5?'#a29c90':'#948e82');
 for(let i=0;i<60;i++){g.fillStyle='rgba(40,30,20,.08)';g.beginPath();g.ellipse(hA(i,1,7)*WW,92+hA(i,2,7)*(WH-92),2+hA(i,3,7)*6,1+hA(i,4,7)*2,0,0,7);g.fill();}
 /* la route du quai, ses marquages */
 for(let y=100;y<168;y+=10)R(49.5,y,1,5,'rgba(255,255,255,.55)');R(0,168,WW,1,'#e8c040');
 /* le parc à remorques : emplacements numérotés */
 for(let i=0;i<PARCX.length;i++){const x=PARCX[i];R(x-8.5,PARCY-4,.6,40,'rgba(255,255,255,.6)');R(x+8,PARCY-4,.6,40,'rgba(255,255,255,.6)');g.fillStyle='rgba(255,255,255,.55)';g.font='900 4px ui-monospace,monospace';g.textAlign='center';g.fillText('P'+(i+1),x,PARCY+42);}
 g.fillStyle='rgba(255,236,170,.4)';g.font='900 5px ui-monospace,monospace';g.textAlign='center';g.fillText('PARC DES REMORQUES',50,WH-8);
 /* le ferry : la coque, le pont garage, la porte arrière */
 R(0,0,WW,92,'#d8dce2');R(3,4,94,82,'#4f7a5f');for(let y=4;y<86;y+=3.4)for(let x=3+((y/3.4|0)%2)*2;x<97;x+=4)R(x,y,1.6,.5,'rgba(0,0,0,.07)');
 const lu=g.createRadialGradient(50,40,5,50,40,60);lu.addColorStop(0,'rgba(255,240,200,.12)');lu.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=lu;g.fillRect(3,4,94,82);
 for(const v of VOIES){g.strokeStyle='rgba(232,192,64,.9)';g.lineWidth=.7;g.setLineDash([2.4,1.6]);g.strokeRect(v.x-VW2,VY0,VW2*2,VY1-VY0);g.setLineDash([]);}
 R(0,0,3.2,92,'#e8e8ec');R(96.8,0,3.2,92,'#e8e8ec');R(0,84,28,8,'#e8e8ec');R(72,84,28,8,'#e8e8ec');R(0,90,28,2,'#1f3566');R(72,90,28,2,'#1f3566');
 for(let y=10;y<84;y+=12){R(.6,y,2,5,'#2a5a80');R(97.4,y,2,5,'#2a5a80');}
 /* la rampe */
 R(28,84,44,12,'#7a8088');for(let y=85;y<96;y+=2)R(29,y,42,.6,'#5a6068');R(28,84,1.4,12,'#e8b830');R(70.6,84,1.4,12,'#e8b830');
 FOND=c;}
function remorque(g,K,a,c,nom,pivotVisible){const R0=remPts(K,a);g.save();g.translate(K.x,K.y);g.rotate(a);
 const L=LT+8;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-LT-5+1.4,-5.2+2,L,10.4);
 g.fillStyle=tn(c,-38);g.fillRect(-LT-5,-5.2,L,10.4);g.fillStyle=c;g.fillRect(-LT-4.4,-4.6,L-1.2,9.2);g.fillStyle=tn(c,26);g.fillRect(-LT-4.4,-4.6,L-1.2,.8);
 g.fillStyle=tn(c,-12);for(let k=-LT-1;k<2;k+=4)g.fillRect(k,-4.4,.45,8.8);
 g.save();g.rotate(0);g.fillStyle=(c==='#e8e4d8'||c==='#e8b830')?'rgba(40,40,40,.75)':'rgba(255,255,255,.88)';g.font='900 5.4px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(nom,-LT/2,0);g.restore();
 g.fillStyle='#1a1a1e';for(const k of [-LT-1,-LT+4])for(const sy of [-6,4.6])g.fillRect(k,sy,3.6,1.4);
 g.fillStyle='#2a2e34';g.fillRect(-LT-5,-4,1.4,8);g.fillStyle='#c8323a';g.fillRect(-LT-5,-4,1,1.6);g.fillRect(-LT-5,2.4,1,1.6);
 g.fillStyle='#5a6068';g.fillRect(-12,-5.8,2,1.2);g.fillRect(-12,4.6,2,1.2);
 if(pivotVisible){g.fillStyle='#e8b830';g.beginPath();g.arc(0,0,1.4,0,7);g.fill();}
 g.restore();}
function douglas(g,D){g.save();g.translate(D.x,D.y);g.rotate(D.a);
 g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-5.4,-4,14,10);
 /* roues : les avant braquent */
 g.fillStyle='#1a1a1e';for(const sx of [-4.6]){g.fillRect(sx,-5.6,3.4,1.6);g.fillRect(sx,4,3.4,1.6);}
 for(const sy of [-5.6,4]){g.save();g.translate(5.4,sy+.8);g.rotate(D.d);g.fillRect(-1.7,-.8,3.4,1.6);g.restore();}
 /* châssis jaune, cabine décalée à gauche, capot moteur */
 g.fillStyle='#b8901a';g.fillRect(-6,-4.6,13.4,9.2);g.fillStyle='#e8b830';g.fillRect(-5.6,-4.2,12.6,8.4);g.fillStyle='#ffd860';g.fillRect(-5.6,-4.2,12.6,.7);
 g.fillStyle='#2a3a4a';g.fillRect(1,-4.2,5.6,4.2);g.fillStyle='#6a90b0';g.fillRect(5.4,-3.8,1,3.4);g.fillStyle='#d8a820';g.fillRect(1,-4.2,5.6,.6);
 g.fillStyle='#c89818';for(let k=-3;k<4;k+=1.4)g.fillRect(k,.6,.6,3.2);
 /* la sellette hydraulique à l'arrière */
 g.fillStyle='#3a3e44';g.beginPath();g.arc(-HB,0,2.8,0,7);g.fill();g.fillStyle='#5a6068';g.beginPath();g.arc(-HB,0,2,0,7);g.fill();g.fillStyle='#1a1a1e';g.fillRect(-HB-3,-.5,3,1);
 /* le gyrophare */
 const on=Math.abs(D.v)>.5&&(performance.now()/180|0)%2;g.fillStyle=on?'#ffb030':'#a86a10';g.beginPath();g.arc(3.4,-2,1,0,7);g.fill();
 if(on){g.fillStyle='rgba(255,176,48,.25)';g.beginPath();g.arc(3.4,-2,4,0,7);g.fill();}
 g.restore();}
function dessiner(){const g=G,V=VUE,s=V.s,H=V.H;if(!FOND||FOND.width!==Math.round(WW*s))fond();
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#2a6a8a';g.fillRect(0,0,CV.width,CV.height);
 let sx=0,sy=0;if(J.secousse>0){sx=(hasard()-.5)*J.secousse*12*DPR;sy=(hasard()-.5)*J.secousse*12*DPR;}
 const cy=J.cam;g.drawImage(FOND,sx,-cy*s+sy);g.setTransform(s,0,0,s,sx,-cy*s+sy);
 /* la voie de destination et la remorque à prendre */
 const o=J.ordre,k=.5+.5*Math.sin(performance.now()/200);
 if(o&&o.etape==='livrer'){const v=VOIES[o.voie];g.fillStyle='rgba(126,224,138,'+(.08+k*.12)+')';g.fillRect(v.x-VW2,VY0,VW2*2,VY1-VY0);g.strokeStyle='rgba(126,224,138,'+(.5+k*.5)+')';g.lineWidth=.9;g.strokeRect(v.x-VW2,VY0,VW2*2,VY1-VY0);
  g.fillStyle='#7ee08a';g.font='900 5px system-ui,sans-serif';g.textAlign='center';g.fillText('VOIE '+(o.voie+1),v.x,VY1-3);}
 /* les remorques garées dans la cale, celles du parc */
 for(const c of J.cale)if(c)remorque(g,{x:c.kx,y:c.ky},c.a,c.c,c.nom,false);
 for(const p of J.parc){if(!p||(J.rem&&J.rem.src===p))continue;const sl=p.arrive>0?p.arrive*60:0;remorque(g,{x:p.kx,y:p.ky+sl},p.a,p.c,p.nom,true);
  if(o&&o.etape==='atteler'&&o.rem===p){g.strokeStyle='rgba(126,224,138,'+(.5+k*.5)+')';g.lineWidth=.9;g.beginPath();g.arc(p.kx,p.ky,3+k*1.5,0,7);g.stroke();g.fillStyle='#7ee08a';g.font='900 4px system-ui,sans-serif';g.textAlign='center';g.fillText('À PRENDRE',p.kx,p.ky-6);}}
 /* le guide de recul : la trace prévue de la remorque */
 if(J.rem&&J.D.v<-.5){let D2={x:J.D.x,y:J.D.y,a:J.D.a},K=J.rem.K,a=J.rem.a;g.fillStyle='rgba(126,224,138,.55)';
  for(let i=0;i<26;i++){const dt=.06,v=-10;D2={x:D2.x+Math.cos(D2.a)*v*dt,y:D2.y+Math.sin(D2.a)*v*dt,a:D2.a+v/LW*Math.tan(J.D.d)*dt};const K2=sellette(D2),A=remPts(K,a).A;a=Math.atan2(K2.y-A.y,K2.x-A.x);K=K2;const A2=remPts(K,a).A;if(i%2)g.fillRect(A2.x-.5,A2.y-.5,1,1);}}
 /* l'attelé */
 if(J.rem)remorque(g,J.rem.K,J.rem.a,J.rem.c,J.rem.nom,false);
 for(const f of J.fumees){g.fillStyle='rgba(90,90,90,'+(.3*(1-f.t))+')';g.beginPath();g.arc(f.x,f.y,f.r+f.t*3,0,7);g.fill();}
 douglas(g,J.D);
 /* la jauge d'alignement quand on approche du pivot */
 const al=alignement();if(al&&al.dist<20){const bx=J.D.x,by=J.D.y-14;g.fillStyle='rgba(16,24,34,.85)';rr(g,bx-15,by-6,30,9,2.4);g.fill();
  g.fillStyle='#2e3a4e';g.fillRect(bx-12,by-1.2,24,2.4);g.fillStyle='#4ac860';g.fillRect(bx-2.6,by-1.2,5.2,2.4);const lx=Math.max(-12,Math.min(12,al.lat*2.2));g.fillStyle='#fff';g.fillRect(bx+lx-.4,by-2.2,.8,4.4);
  g.fillStyle=Math.abs(al.da)<.3?'#7ee08a':'#ff9a8a';g.font='800 2.6px system-ui,sans-serif';g.textAlign='center';g.fillText(al.dist<2.6?(Math.abs(al.da)<.3?'freine : CLAC !':'redresse !'):'recule : '+al.dist.toFixed(0)+' m',bx,by-2.8);}
 /* le bouton dételer, sur la remorque */
 const pd=peutDeteler();RAC.querySelector('.det').classList.toggle('on',!!pd);
 /* éclats, scores */
 for(const p of J.parts){g.globalAlpha=Math.max(0,1-p.t/.7);g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}g.globalAlpha=1;
 for(const p of J.pops){const kk=p.t/1.3;g.globalAlpha=Math.max(0,1-kk*kk);g.font='900 '+(p.gros?6:4.6)+'px system-ui,sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.55)';g.fillText(p.txt,p.x+.4,p.y-kk*9+.4);g.fillStyle=p.c;g.fillText(p.txt,p.x,p.y-kk*9);}g.globalAlpha=1;
 /* le ferry qui appareille : la cale se vide, un nouveau arrive */
 g.setTransform(1,0,0,1,0,0);
 if(J.panneau)panneau(g);
 if(J.bandeau){const b=J.bandeau,u=CV.width/100,kk=Math.min(1,b.t*2,(3-b.t)*4+.2);g.globalAlpha=Math.max(0,kk);g.fillStyle='rgba(16,24,34,.92)';rr(g,4*u,3*u,92*u,9*u,4*u);g.fill();let fz=3.4*u;g.font='800 '+fz+'px system-ui,sans-serif';const tw=g.measureText(b.txt).width;if(tw>86*u){fz*=86*u/tw;g.font='800 '+fz+'px system-ui,sans-serif';}g.fillStyle='#f5d27a';g.textAlign='center';g.textBaseline='middle';g.fillText(b.txt,50*u,7.5*u);g.textBaseline='alphabetic';g.globalAlpha=1;}
 if(J.flash>0){g.fillStyle='rgba(255,255,255,'+J.flash+')';g.fillRect(0,0,CV.width,CV.height);}
 /* l'ordre de mission, en haut */
 const ord=RAC.querySelector('.ord');ord.innerHTML=o?(o.etape==='atteler'?'📋 Prends <b class="tg" style="background:'+o.rem.c+(o.rem.c==='#e8e4d8'||o.rem.c==='#e8b830'?';color:#2a2016':'')+'">'+o.rem.nom+'</b> (P'+(J.parc.indexOf(o.rem)+1)+') → voie '+(o.voie+1):'📋 <b>'+(J.rem?J.rem.nom:'')+'</b> → '+J.ferry+', voie '+(o.voie+1)):'⚓ '+J.ferry+(J.depart>0?' appareille…':'');
 RAC.querySelector('.sc').textContent=J.score.toLocaleString('fr-FR');const tt=RAC.querySelector('.tm');tt.textContent='⏱ '+Math.max(0,Math.ceil(J.t))+' s';tt.classList.toggle('urg',J.t<15);
 RAC.querySelector('.lv').textContent='🚛 '+J.livres;}

/* --- le panneau des flexibles et des béquilles (gros plan) --- */
const COULF=['#e84a3a','#e8b830','#4aa8e8'],NOMF=['FREIN','SERVICE','ÉLEC.'];
function panneau(g){const P=J.panneau,W2=CV.width,H2=CV.height,k=Math.min(1,P.anim);g.fillStyle='rgba(8,14,20,'+(.6*k)+')';g.fillRect(0,0,W2,H2);
 const pw=Math.min(W2*.92,H2*.62),ph=pw,px=(W2-pw)/2,py=(H2-ph)/2+(1-k)*H2*.3,u=pw/100;P.cadre={px,py,u};
 g.save();g.translate(px,py);g.scale(u,u);
 g.fillStyle='rgba(0,0,0,.4)';rr(g,1,2,100,100,7);g.fill();g.fillStyle='#1f2a36';rr(g,0,0,100,100,7);g.fill();
 /* le nez de la remorque et la façade où se branchent les flexibles */
 const c=J.rem.c;g.fillStyle=c;rr(g,8,6,84,26,3);g.fill();g.fillStyle=tn(c,-18);for(let x=10;x<92;x+=4)g.fillRect(x,7,.6,24);g.fillStyle='rgba(255,255,255,.75)';g.font='900 7px ui-monospace,monospace';g.textAlign='center';g.fillText(J.rem.nom,50,16);
 for(let j=0;j<3;j++){const sx=26+j*24,sy=26,f=P.prises[j];g.fillStyle='#3a3e44';g.beginPath();g.arc(sx,sy,6,0,7);g.fill();g.fillStyle=COULF[f];g.beginPath();g.arc(sx,sy,4.2,0,7);g.fill();g.fillStyle='#1a1a1e';g.beginPath();g.arc(sx,sy,1.8,0,7);g.fill();
  g.fillStyle='#c8d4e4';g.font='800 2.8px system-ui,sans-serif';g.fillText(NOMF[f],sx,sy+9);}
 /* les tuyaux spiralés, depuis le Douglas en bas */
 for(const tu of P.tuyaux){const bx=26+tu.i*24,by=88;let hx,hy;if(tu.ok){const j=P.prises.indexOf(tu.i);hx=26+j*24;hy=26;}else if(P.tient===tu){hx=tu.x;hy=tu.y;}else{hx=bx;hy=70;}
  g.strokeStyle=COULF[tu.i];g.lineWidth=2.2;g.beginPath();const n=14;for(let q=0;q<=n;q++){const t=q/n,x=bx+(hx-bx)*t+Math.sin(t*Math.PI*6)*2.2*(1-t*.3),y=by+(hy-by)*t;q?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
  g.fillStyle='#8a9098';g.beginPath();g.arc(hx,hy,3.4,0,7);g.fill();g.fillStyle=COULF[tu.i];g.beginPath();g.arc(hx,hy,2.4,0,7);g.fill();
  if(!tu.ok&&!P.tient){const kk=(performance.now()/500)%1;g.globalAlpha=1-kk;g.strokeStyle='#fff';g.lineWidth=.6;g.beginPath();g.arc(hx,hy,4+kk*4,0,7);g.stroke();g.globalAlpha=1;}}
 g.fillStyle='#e8b830';g.fillRect(10,88,80,8);g.fillStyle='#ffd860';g.fillRect(10,88,80,1);g.fillStyle='#2a2e34';g.font='900 3.4px system-ui,sans-serif';g.fillText('DOUGLAS',50,94);
 /* la manivelle des béquilles */
 if(P.etape==='bequ'){g.fillStyle='rgba(0,0,0,.55)';rr(g,30,40,40,40,5);g.fill();const tours=P.manivelle/(Math.PI*2);g.strokeStyle='#2e3a4e';g.lineWidth=2.6;g.beginPath();g.arc(50,58,10,0,7);g.stroke();g.strokeStyle='#f5d27a';g.beginPath();g.arc(50,58,10,-Math.PI/2,-Math.PI/2+Math.min(1,tours/2)*Math.PI*2);g.stroke();
  g.save();g.translate(50,58);g.rotate(P.manivelle);g.fillStyle='#8a9098';g.fillRect(-1,-1,10,2);g.fillStyle='#c0392b';g.beginPath();g.arc(9,0,2,0,7);g.fill();g.restore();
  g.fillStyle='#fff';g.font='800 3.2px system-ui,sans-serif';g.fillText('TOURNE : BÉQUILLES ▲',50,76);}
 g.fillStyle='#c8d4e4';g.font='700 3.2px system-ui,sans-serif';g.fillText(P.etape==='flex'?'Glisse chaque tuyau vers la prise de sa couleur':'Fais tourner ton doigt pour remonter les béquilles',50,100.5);
 g.restore();}
function panneauDebut(m){const P=J.panneau;if(!P.cadre)return;const u=P.cadre.u,x=(m.sx-P.cadre.px)/u,y=(m.sy-P.cadre.py)/u;
 if(P.etape==='flex'){for(const tu of P.tuyaux){if(tu.ok)continue;const hx=26+tu.i*24,hy=70;if(Math.hypot(x-hx,y-hy)<9){P.tient=tu;tu.x=x;tu.y=y;vib(5);return;}}}
 else P.vP=null;}
function panneauBouge(m){const P=J.panneau;if(!P.cadre)return;const u=P.cadre.u,x=(m.sx-P.cadre.px)/u,y=(m.sy-P.cadre.py)/u;
 if(P.etape==='flex'&&P.tient){P.tient.x=x;P.tient.y=y;return;}
 if(P.etape==='bequ'){const Q=P.vP;if(!Q){P.vP={x:m.sx,y:m.sy,h:null};return;}const dx=m.sx-Q.x,dy=m.sy-Q.y;if(dx*dx+dy*dy<(6*DPR)**2)return;const h=Math.atan2(dy,dx);
  if(Q.h!==null){let d=ang(h-Q.h);P.manivelle+=Math.min(1.2,Math.abs(d));if(Math.floor(P.manivelle*2)!==P.cran){P.cran=Math.floor(P.manivelle*2);SON.manivelle();vib(3);}}P.vP={x:m.sx,y:m.sy,h};
}}
function panneauFin(){const P=J.panneau;if(!P||P.etape!=='flex'||!P.tient)return;const tu=P.tient;P.tient=null;const j=P.prises.indexOf(tu.i),sx=26+j*24,sy=26;
 if(Math.hypot(tu.x-sx,tu.y-sy)<8){tu.ok=true;SON.air();vib(10);if(P.tuyaux.every(t=>t.ok)){P.etape='bequ';}}
 else{for(let q=0;q<3;q++){if(Math.hypot(tu.x-(26+q*24),tu.y-26)<8){SON.faux();vib(25);pop(J.D.x,J.D.y-10,'Pas la bonne prise !','#ff9a8a');J.score=Math.max(0,J.score-15);}}}}

/* --- la boucle --- */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(t-(boucle.t||t))/1000);boucle.t=t;if(!J)return;
 if(!J.fini&&!J.tuto){J.t-=dt;if(J.t<=0){J.t=0;finir();}}
 piloter(dt);essaiAtteler();
 if(J.panneau){J.panneau.anim=Math.min(1,J.panneau.anim+dt*5);if(J.panneau.manivelle>=Math.PI*4)fermerPanneau();}
 for(const p of J.parc)if(p&&p.arrive>0)p.arrive=Math.max(0,p.arrive-dt*1.2);
 if(J.depart>0){J.depart-=dt;if(J.depart<=2&&J.cale.some(Boolean)&&J.depart>1.9){J.flash=.6;}if(J.depart<=2&&J.cale.some(Boolean)){J.cale=[];J.ferry=FERRIES[(hasard()*FERRIES.length)|0];}if(J.depart<=0){J.depart=0;J.bandeau={txt:'Le '+J.ferry+' accoste · au travail !',t:2.4};nouvelOrdre();}}
 J.flash=Math.max(0,J.flash-dt);
 if(J.bandeau){J.bandeau.t-=dt;if(J.bandeau.t<=0)J.bandeau=null;}
 /* la caméra suit le Douglas */
 const cib=Math.max(0,Math.min(WH-VUE.H,J.D.y-VUE.H*.55));J.cam+=(cib-J.cam)*Math.min(1,dt*3);
 J.secousse=Math.max(0,J.secousse-dt);
 for(const f of J.fumees)f.t+=dt;J.fumees=J.fumees.filter(f=>f.t<1);
 for(const p of J.parts){p.t+=dt;p.vy+=40*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}J.parts=J.parts.filter(p=>p.t<.7);
 for(const p of J.pops)p.t+=dt;J.pops=J.pops.filter(p=>p.t<1.3);
 dessiner();}
function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);
 const s=CV.width/WW;VUE={s,H:CV.height/s};FOND=null;}

/* --- les commandes : volant à gauche, pédales à droite (multitouche) --- */
function monde(ev,t){const r=CV.getBoundingClientRect();return {sx:(t.clientX-r.left)*DPR,sy:(t.clientY-r.top)*DPR};}
function cDebut(ev){ev.preventDefault();if(!J||J.fini||J.tuto||!J.panneau)return;panneauDebut(monde(ev,ev.changedTouches?ev.changedTouches[0]:ev));}
function cBouge(ev){ev.preventDefault();if(!J||!J.panneau)return;panneauBouge(monde(ev,ev.changedTouches?ev.changedTouches[0]:ev));}
function cFin(ev){ev.preventDefault();if(!J)return;if(J.panneau)panneauFin();}
function brancherCommandes(d){const vol=d.querySelector('.vol'),rond=d.querySelector('.vol i');let id=null,x0=0;
 const vs=e2=>{for(const t of e2.changedTouches)if(id===null){id=t.identifier;x0=t.clientX;}e2.preventDefault();};
 const vm=e2=>{for(const t of e2.changedTouches)if(t.identifier===id){const k=Math.max(-1,Math.min(1,(t.clientX-x0)/60));J&&(J.volant=k);rond.style.transform='rotate('+(k*120)+'deg)';}e2.preventDefault();};
 const ve=e2=>{for(const t of e2.changedTouches)if(t.identifier===id){id=null;J&&(J.volant=0);rond.style.transform='';}e2.preventDefault();};
 vol.addEventListener('touchstart',vs,{passive:false});vol.addEventListener('touchmove',vm,{passive:false});vol.addEventListener('touchend',ve,{passive:false});vol.addEventListener('touchcancel',ve,{passive:false});
 for(const [sel,val] of [['.av',1],['.ar',-1]]){const b=d.querySelector(sel);
  b.addEventListener('touchstart',e2=>{e2.preventDefault();if(J)J.pedale=val;b.classList.add('ap');},{passive:false});
  const st=e2=>{e2.preventDefault();if(J&&J.pedale===val)J.pedale=0;b.classList.remove('ap');};b.addEventListener('touchend',st,{passive:false});b.addEventListener('touchcancel',st,{passive:false});
  b.addEventListener('mousedown',()=>{if(J)J.pedale=val;});b.addEventListener('mouseup',()=>{if(J)J.pedale=0;});}
 d.querySelector('.det').addEventListener('click',()=>{if(J)deteler();});}

/* --- la fin, la paie --- */
let VAC=null,VAC_MSG='Connecte-toi pour être payé.';
async function ouvrirVac(){VAC=null;try{const r=await appelRPC('douglas_debut',{});if(r&&r.vacation)VAC=r.vacation;else if(!r||r.erreur!=='connexion')VAC_MSG='La paie du Douglas arrive très bientôt.';}catch(x){VAC_MSG='La paie du Douglas arrive très bientôt.';}}
const eur=c=>(Math.round(c/100)).toLocaleString('fr-FR')+' €';
async function payer(d,sc){const el=d.querySelector('.paie');if(!VAC){el.innerHTML=VAC_MSG;return;}
 const v=VAC;VAC=null;let r=null;try{r=await appelRPC('douglas_fin',{p_vac:v,p_score:sc|0,p_livres:J.livres,p_chocs:J.chocs});}catch(x){}
 if(!r){el.innerHTML='Paie indisponible pour l’instant.';return;}
 if(r.xp>0){try{e.recolte=(e.recolte||0)+r.xp;if((e.score||0)<e.recolte)e.score=e.recolte;sauver();majHaut();}catch(x){}}
 const xpT=r.xp>0?'<i class="xp">+ '+r.xp+' XP</i>':'';
 if(r.erreur){el.innerHTML=xpT+(r.erreur==='plafond'?'Plafond du jour atteint : pas de paie.':r.erreur==='trop court'?'Vacation trop courte : pas de paie.':r.erreur==='grade'?'Ce poste demande le grade de chauffeur (niveau 20).':String(r.erreur).indexOf('serveur')===0?'La paie du Douglas arrive très bientôt.':'Pas de paie ('+r.erreur+').');return;}
 el.innerHTML='<span>PAIE DE LA VACATION</span><b>+ '+eur(r.verse)+'</b>'+xpT+(r.facteur<1?'<small>tarif réduit ('+Math.round(r.facteur*100)+' %) : déjà '+(r.faites-1)+' vacations aujourd’hui</small>':'');el.classList.add('ok');
 if(typeof r.euros==='number'){try{e.euros=r.euros;sauver();majHaut();}catch(x){}}}
function finir(){if(J.fini)return;J.fini=true;J.pedale=0;SON.moteur(0);SON.corne();vib(80);const sc=J.score;let rec=0;try{rec=+(localStorage.getItem('dou_record')||0);if(sc>rec)localStorage.setItem('dou_record',sc);}catch(x){}
 const et=sc>=5000?3:sc>=2800?2:sc>=1200?1:0;const d=document.createElement('div');d.className='fin';
 d.innerHTML='<div class="c"><small>FIN DU SERVICE</small><div class="et">'+[0,1,2].map(i=>'<span class="'+(i<et?'on':'')+'">★</span>').join('')+'</div><h2>'+(et===3?'Pilote de légende !':et===2?'Belle conduite, collègue !':et===1?'Ça roule':'Encore un peu de rodage…')+'</h2>'+
  '<div class="g"><div><b>'+J.livres+'</b>remorques</div><div><b>'+J.parfaits+'</b>CLAC parfaits</div><div><b>'+J.chocs+'</b>chocs</div></div>'+
  '<p class="scf">Score <b>'+sc.toLocaleString('fr-FR')+'</b>'+(sc>rec?' · nouveau record !':rec?' · record '+rec.toLocaleString('fr-FR'):'')+'</p><div class="paie">Calcul de la paie…</div><button class="b1">Nouveau service</button><button class="b2">Retour au quai</button></div>';
 RAC.querySelector('.scene').appendChild(d);payer(d,sc);
 setTimeout(()=>{d.querySelectorAll('.et span.on').forEach((s,i)=>setTimeout(()=>{s.classList.add('pop');vib(10);},i*300));SON.fin();},500);
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle();majRec();ouvrirVac();};d.querySelector('.b2').onclick=fermer;}
function majRec(){let rec=0;try{rec=+(localStorage.getItem('dou_record')||0);}catch(x){}RAC.querySelector('.rc').textContent='🏆 '+rec.toLocaleString('fr-FR');}
function tuto(){let vu=false;try{vu=localStorage.getItem('dou_tuto')==='1';}catch(x){}if(vu)return;J.tuto=true;
 const d=document.createElement('div');d.className='tuto';
 d.innerHTML='<div class="c"><small>PREMIER SERVICE</small><h2>Le Douglas</h2>'+
  '<div class="et2"><span>🕹️</span><p><b>Volant à gauche</b> (glisse), <b>pédales à droite</b> : AVANT et ARRIÈRE.</p></div>'+
  '<div class="et2"><span>🎯</span><p><b>Recule sous le pivot</b> de la remorque demandée, bien droit, et freine : <b>CLAC</b> !</p></div>'+
  '<div class="et2"><span>🔌</span><p><b>Branche les flexibles</b> (chaque couleur sur sa prise), puis <b>remonte les béquilles</b>.</p></div>'+
  '<div class="et2"><span>⛴️</span><p>Demi-tour, puis <b>recule la remorque</b> dans la voie verte du ferry, et <b>dételle</b>.</p></div><button class="b1">C’est parti</button></div>';
 RAC.querySelector('.scene').appendChild(d);d.querySelector('.b1').onclick=()=>{try{localStorage.setItem('dou_tuto','1');}catch(x){}d.remove();if(J)J.tuto=false;SON.corne();};}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);SON.moteur(0);const r=RAC;RAC=null;J=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);removeEventListener('resize',cadrer);}

const CSS=`#dou{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#1b2330;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;touch-action:none}
#dou.on{opacity:1}#dou *{box-sizing:border-box}
#dou .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 4px;color:#fff}
#dou .bar b{font:900 19px/1 'Baloo 2',system-ui,sans-serif}#dou .bar small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#8ab0d8;margin-bottom:2px}
#dou .sp{flex:1}#dou .x{height:38px;padding:0 15px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font:800 14px 'Baloo 2',system-ui,sans-serif}
#dou .son{width:38px;height:38px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font-size:16px;padding:0}
#dou .pl{flex:none;display:flex;justify-content:center;gap:6px;padding:4px 10px 4px;color:#fff}
#dou .pl span{background:#2e3a4e;border-radius:14px;padding:4px 10px;font:800 14px 'Baloo 2',system-ui,sans-serif;white-space:nowrap}
#dou .pl .tm.urg{background:#a82a2a}
#dou .ord{flex:none;text-align:center;color:#e8eef6;font:700 13px 'Baloo 2',system-ui,sans-serif;padding:0 10px 6px}
#dou .ord .tg{color:#fff;border-radius:7px;padding:0 6px}
#dou .scene{flex:1;min-height:0;position:relative}
#dou .scene>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#dou .cmd{flex:none;display:flex;align-items:center;gap:10px;padding:8px 12px calc(10px + env(safe-area-inset-bottom));background:#1b2330}
#dou .vol{width:112px;height:86px;border-radius:20px;background:#2e3a4e;display:grid;place-items:center;touch-action:none;position:relative}
#dou .vol i{width:66px;height:66px;border-radius:50%;border:7px solid #e8b830;position:relative;transition:transform .08s}
#dou .vol i:before{content:'';position:absolute;left:50%;top:50%;width:52px;height:6px;margin:-3px 0 0 -26px;background:#e8b830;border-radius:3px}
#dou .vol i:after{content:'';position:absolute;left:50%;top:50%;width:6px;height:26px;margin:0 0 0 -3px;background:#e8b830;border-radius:3px}
#dou .vol small{position:absolute;bottom:4px;font:800 9px 'Baloo 2',system-ui,sans-serif;color:#8ab0d8;letter-spacing:1px}
#dou .det{flex:1;height:58px;border:0;border-radius:18px;background:#2e3a4e;color:#5a6a80;font:900 15px 'Baloo 2',system-ui,sans-serif;pointer-events:none;transition:all .2s}
#dou .det.on{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10;pointer-events:auto;animation:douP .7s ease-in-out infinite}@keyframes douP{50%{transform:scale(1.04)}}
#dou .ped{display:flex;flex-direction:column;gap:8px}
#dou .ped button{width:84px;height:40px;border:0;border-radius:14px;font:900 14px 'Baloo 2',system-ui,sans-serif;touch-action:none}
#dou .av{background:#2e7d4f;color:#fff;box-shadow:0 4px 0 #1e5a36}#dou .ar{background:#a83a2a;color:#fff;box-shadow:0 4px 0 #6a2418}
#dou .ped .ap{transform:translateY(3px);box-shadow:none;filter:brightness(1.15)}
#dou .fin,#dou .tuto{position:absolute;inset:0;background:rgba(10,16,24,.8);display:grid;place-items:center;padding:20px;z-index:3}
#dou .fin .c,#dou .tuto .c{width:min(340px,92vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:16px;text-align:center;box-shadow:0 6px 0 #b8a890}
#dou small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#dou .fin .et{font-size:38px;line-height:1;margin:4px 0;color:#d8cfbe}#dou .fin .et span{display:inline-block;transition:transform .3s}#dou .fin .et span.pop{color:#f2b030;transform:scale(1.25)}
#dou h2{margin:2px 0 8px;font:900 23px/1.1 'Baloo 2',system-ui,sans-serif}
#dou .fin .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 8px}#dou .fin .g div{background:#fff;border-radius:14px;padding:7px 4px;box-shadow:0 3px 0 #ddd3c0;font:700 11.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#dou .fin .g b{display:block;font:900 18px/1.15 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#dou .fin .scf{margin:4px 0;font:800 16px 'Baloo 2',system-ui,sans-serif}
#dou .fin .paie{margin:6px 0 2px;background:#fff;border-radius:14px;padding:8px;box-shadow:0 3px 0 #ddd3c0;font:700 12.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#dou .fin .paie.ok{background:#e6f6e8;box-shadow:0 3px 0 #b8dcc0}#dou .fin .paie span{display:block;font:800 10.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#3a7a4a}#dou .fin .paie b{display:block;font:900 26px/1.1 'Baloo 2',system-ui,sans-serif;color:#1e6a34}
#dou .fin .paie .xp{display:inline-block;font:900 13px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#fff;background:#3a8ae8;border-radius:10px;padding:1px 9px;margin:2px 0 4px}#dou .fin .paie small{display:block;font:700 11.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:0;color:#5a7a60}
#dou button.b1,#dou button.b2{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#dou .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#dou .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}
#dou .tuto .c{text-align:left}#dou .tuto small,#dou .tuto h2{display:block;text-align:center}
#dou .tuto .et2{display:flex;gap:10px;align-items:center;background:#fff;border-radius:14px;padding:8px 10px;margin-bottom:7px;box-shadow:0 3px 0 #ddd3c0}
#dou .tuto .et2 span{font-size:22px}#dou .tuto .et2 p{margin:0;font:600 13px/1.3 'Baloo 2',system-ui,sans-serif}`;

window.ouvrirDouglas=function(navire){if(RAC)return;if(!document.getElementById('douCss')){const s=document.createElement('style');s.id='douCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='dou';RAC=d;
 d.innerHTML='<div class="bar"><div><small>CHAUFFEUR · GARE MARITIME</small><b>Le Douglas</b></div><span class="sp"></span><button class="son">'+(SON.on?'🔊':'🔇')+'</button><button class="x">Quitter</button></div>'+
  '<div class="pl"><span class="tm">⏱ 120 s</span><span>⭐ <i class="sc" style="font-style:normal">0</i></span><span class="lv">🚛 0</span><span class="rc">🏆 0</span></div><div class="ord"></div>'+
  '<div class="scene"><canvas></canvas></div>'+
  '<div class="cmd"><div class="vol"><i></i><small>VOLANT</small></div><button class="det">DÉTELER</button><div class="ped"><button class="av">AVANT ▲</button><button class="ar">ARRIÈRE ▼</button></div></div>';
 document.body.appendChild(d);CV=d.querySelector('.scene>canvas');G=CV.getContext('2d');
 requestAnimationFrame(()=>{d.classList.add('on');cadrer();nouvelle();majRec();ouvrirVac();tuto();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 d.querySelector('.x').onclick=fermer;d.querySelector('.son').onclick=ev=>{ev.currentTarget.textContent=SON.basculer()?'🔊':'🔇';};
 CV.addEventListener('touchstart',cDebut,{passive:false});CV.addEventListener('touchmove',cBouge,{passive:false});CV.addEventListener('touchend',cFin,{passive:false});
 CV.addEventListener('mousedown',ev=>{if(!J||!J.panneau)return;panneauDebut(monde(ev,ev));const m=x=>panneauBouge(monde(x,x)),u=()=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);panneauFin();};addEventListener('mousemove',m);addEventListener('mouseup',u);});
 brancherCommandes(d);
 window.__DOU={J:()=>J,V:()=>VUE};
 RAF=requestAnimationFrame(boucle);};
})();
