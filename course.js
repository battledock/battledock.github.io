/* =====================================================================
   LA COURSE (course.js) — l'épreuve d'athlétisme, dans son propre écran.
   On la lance depuis une ligne de départ de la piste. Vue de profil :
   six couloirs, cinq adversaires avec leur style, la foule derrière.
   Départ : « À vos marques… Prêts… PAN ! » (gare au faux départ).
   On court en tapant G / D en rythme ; le souffle se vide si l'on force ;
   derrière un adversaire on fatigue moins (aspiration) ; FINISH lâche tout
   dans la dernière ligne droite ; SAUT franchit les haies.
   100 m, 100 m haies, 400 m, 400 m haies, 800 m.
   Indépendant : n'écrit que dans #crs. Chargé par piste.js (eval direct).
   ===================================================================== */
(()=>{
const EP={
 '100':{nom:'100 m',d:100,ts:1,K:.004,haies:null,fin:45,asp:false},
 '100h':{nom:'100 m haies',d:100,ts:1,K:.005,haies:{h0:13,dh:8.5,n:10},fin:30,asp:false},
 '400':{nom:'400 m',d:400,ts:2.2,K:.031,haies:null,fin:110,asp:false},
 '400h':{nom:'400 m haies',d:400,ts:2.2,K:.033,haies:{h0:45,dh:35,n:10},fin:90,asp:false},
 '800':{nom:'800 m',d:800,ts:3.2,K:.0195,haies:null,fin:150,asp:true}};
const NIVEAUX=['Débutant','Club','Régional','Interrégional','National','Élite','Olympique'];
const NOMS=['Kévin Ruffo','Yanis Belkacem','Théo Marchetti','Ibrahim Diallo','Lucas Moreau','Enzo Castelli','Mehdi Saïdi','Hugo Lambert','Sami Ferhat','Nathan Rossi','Malik Traoré','Louis Garnier'];
const STYLES={lievre:{n:'part fort',plan:f=>f<.55?1.02:.93},finisseur:{n:'finisseur',plan:f=>f<.72?.87:1.06},metronome:{n:'métronome',plan:f=>.93},regulier:{n:'régulier',plan:f=>f<.8?.91:1.02}};
const MAILLOTS=[['#e84a3a','#ffffff'],['#1f5fa8','#ffffff'],['#f5c430','#1a1a22'],['#2e8a4a','#f2ead6'],['#7a2ab0','#1a1a22'],['#ffffff','#e84a3a'],['#1a1a22','#f5c430']];
const SOUL=['#c8ff3a','#ff6a4a','#5ae0ff','#ff4ab8','#f6f6f6','#ffb030'];
let RAC=null,CV=null,G=null,RAF=0,DPR=1,C=null,ARGS=null,FOULE=null;
const hasard=Math.random,CAD=(()=>{try{return CADENCE_PAS;}catch(x){return .09;}})();
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
function vib(m){try{navigator.vibrate&&navigator.vibrate(m);}catch(x){}}
function fmt(t){if(t>=60){const m=Math.floor(t/60),r=t-m*60;return m+':'+(r<10?'0':'')+r.toFixed(2);}return t.toFixed(2);}

/* --- les sons : pistolet, foule, pas --- */
const SON=(()=>{let ac=null,foule=null;const ctx=()=>{try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(x){return null;}return ac;};
 const bruit=(d,vol,fc,type)=>{const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),s=b.getChannelData(0);for(let i=0;i<n;i++)s[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=b;f.type=type||'bandpass';f.frequency.value=fc||1500;g.gain.value=vol||.2;src.connect(f);f.connect(g);g.connect(a.destination);src.start();};
 const note=(f,d,type,vol)=>{const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(vol||.1,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d);};
 return {ctx,
  pan(){bruit(.35,.9,900,'lowpass');bruit(.12,.6,3000);},
  faux(){note(880,.25,'square',.08);setTimeout(()=>note(880,.25,'square',.08),300);},
  pas(){bruit(.03,.05,700,'lowpass');},
  haie(){bruit(.18,.3,400,'lowpass');note(140,.2,'square',.05);},
  saut(){bruit(.05,.06,2200);},
  foule(v){const a=ctx();if(!a)return;if(!foule){const n=a.sampleRate*2,b=a.createBuffer(1,n,a.sampleRate),s=b.getChannelData(0);for(let i=0;i<n;i++)s[i]=Math.random()*2-1;
    const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=b;src.loop=true;f.type='bandpass';f.frequency.value=900;f.Q.value=.5;g.gain.value=0;src.connect(f);f.connect(g);g.connect(a.destination);src.start();foule={g,src};}
   foule.g.gain.value=v;},
  stop(){if(foule){try{foule.src.stop();}catch(x){}foule=null;}},
  fin(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>note(f,.2,'triangle',.1),i*90));}};})();

/* --- la foule de la tribune, dessinée une fois, qui défile en fond --- */
function graverFoule(h){const k0=Math.max(1,DPR*.75),L=Math.round(1200*k0),c=document.createElement('canvas');c.width=L;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const cols=['#e84a3a','#f5c430','#ffffff','#3ac0e8','#7ee08a','#1a1a22','#ff8ab8','#7ac8f0','#2a6fba','#f28a2a'];
 const rangs=Math.max(2,Math.floor(h/(26*k0))),hr=h/rangs;
 for(let r=0;r<rangs;r++){const yb=(r+1)*hr,cc=r%2?'#2766b0':'#2f72c0';g.fillStyle=cc;g.fillRect(0,yb-hr,L,hr);
  for(let x=8*k0;x<L-6*k0;x+=15*k0){const k=hA(Math.round(x),r,5);if(k<.86){const ap={peau:1+((k*60)|0)%6,cheveux:((k*97)|0)%11,coiffe:((k*31)|0)%8,haut:[0,1,3,4][((k*13)|0)%4],veste:cols[((k*71)|0)%cols.length],pantalon:'#2a3a5a',bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:0,raye:0,motif:0,_civil:true};
    g.save();g.translate(Math.round(x),Math.round(yb-3*k0));g.scale(.5*k0,.5*k0);try{personne(g,0,0,ap,'bas',0,false);}catch(z){}g.restore();}}
  g.fillStyle=cc;g.fillRect(0,yb-8*k0,L,8*k0);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,yb-8*k0,L,2*k0);}
 return c;}

/* --- la course --- */
function niveau(ep){try{return Math.max(0,Math.min(6,(e.athNiv&&e.athNiv[ep])|0));}catch(x){return 0;}}
function record(ep){try{return e.chronos&&e.chronos['ath_'+ep]&&e.chronos['ath_'+ep].t||null;}catch(x){return null;}}
function nouvelle(ep){const E=EP[ep],nv=niveau(ep);const noms=NOMS.slice().sort(()=>hasard()-.5);const styles=Object.keys(STYLES);
 const A=[];const couloirMoi=3;
 for(let i=0;i<6;i++){if(i===couloirMoi){A.push({moi:true,nom:'Toi',c:i,vmax:9.55,d:0,v:0,S:1,pas:0,fini:null,saut:-1,sautL:3.4,choc:0,reac:null});continue;}
  const mk=MAILLOTS[(i*3+nv)%MAILLOTS.length];
  A.push({moi:false,nom:noms[i],c:i,style:E.d>=400?styles[(i+nv)%styles.length]:'metronome',vmax:8.55+nv*.2+(hasard()-.5)*.35,d:0,v:0,S:1,pas:0,fini:null,saut:-1,sautL:3.3,choc:0,reac:.12+hasard()*.1,
   ap:{peau:1+(i*5+nv)%6,cheveux:(i*3+2)%11,coiffe:(i*5)%8,barbe:i%4===1?2:0,haut:4,veste:mk[0],pantalon:mk[1],bas:1,souliers:1,chaussures:SOUL[(i+nv)%SOUL.length],sac:0,chapeau:0,raye:0,motif:0,_civil:true}});}
 const H=[];if(E.haies)for(let k=0;k<E.haies.n;k++)H.push(E.haies.h0+k*E.haies.dh);
 C={ep,E,nv,A,moi:A[couloirMoi],H,tombees:{},phase:'presentation',tp:0,t:0,tPan:0,faux:0,taps:[],dernier:null,finish:false,fini:false,ralenti:0,photo:false,
  pops:[],camX:-3,att:0,res:null,bandeau:null};
 C.prets=1+hasard()*1.2;}
function tap(cote){if(!C)return;SON.ctx();
 if(C.phase==='marques'||C.phase==='prets'){fauxDepart();return;}
 if(C.phase!=='course')return;const M=C.moi;if(M.fini!==null)return;
 const now=performance.now();if(M.reac===null){M.reac=C.t-C.tPan;C.pops.push({txt:'Réaction '+M.reac.toFixed(3)+' s',c:M.reac<.16?'#7ee08a':'#fff',t:0});}
 if(C.dernier===cote){M.v*=.97;vib(25);}else vib(6);
 C.dernier=cote;C.taps.push(now);if(C.taps.length>24)C.taps.shift();if(hasard()<.5)SON.pas();}
function cadence(){const now=performance.now(),T=C.taps.filter(t=>now-t<650);if(T.length<2)return T.length?.3:0;
 const r=(T.length-1)/((T[T.length-1]-T[0])/1000);const recent=(now-T[T.length-1])<260?1:Math.max(0,1-(now-T[T.length-1]-260)/400);return Math.min(1.04,r/7.2)*recent;}
function fauxDepart(){C.faux++;SON.faux();vib([60,40,60]);
 if(C.faux>=2){C.phase='dq';C.bandeau={txt:'DISQUALIFIÉ · deuxième faux départ',c:'#ff6a4a',t:2.4};setTimeout(()=>{if(C&&C.phase==='dq')resultats(true);},1600);return;}
 C.phase='faux';C.tp=0;C.bandeau={txt:'FAUX DÉPART ! Le prochain, c’est la porte.',c:'#ff9a4a',t:2};}
function saut(){if(!C||C.phase!=='course')return;const M=C.moi;if(M.saut>=0||M.fini!==null||M.reac===null)return;M.saut=M.d;SON.saut();vib(8);}
function finishBtn(){if(!C||C.phase!=='course'||C.finish)return;const M=C.moi;if(C.E.d-M.d>C.E.fin)return;C.finish=true;vib([20,20,40]);C.pops.push({txt:'FINISH !',c:'#ffd860',t:0,gros:true});}

/* la physique d'un coureur : effort voulu → vitesse, souffle, haies */
function courir(a,dts){const E=C.E;if(a.fini!==null){a.v*=Math.pow(.6,dts);a.d+=a.v*dts;return;}
 let effort;
 if(a.moi){if(a.reac===null){effort=0;}else effort=cadence()*(C.finish?1.06:1);}
 else{if(C.t-C.tPan<a.reac)effort=0;else{effort=STYLES[a.style].plan(a.d/E.d);if(E.d-a.d<E.fin*.6&&E.d>=400)effort=Math.max(effort,1.04);}}
 const fat=a.S<=0?.78:a.S<.25?.88+.48*a.S:1;
 let cible=a.vmax*effort*fat;if(a.choc>0){a.choc-=dts;cible*=.55;}
 a.v+=(cible-a.v)*Math.min(1,dts*(cible>a.v?(a.d<30?1.25:1.6):2.4));if(a.v<0)a.v=0;
 /* le souffle : on paie l'effort à la puissance 4 ; l'aspiration soulage ; l'endurance du joueur aussi */
 const r=a.v/a.vmax;let K=E.K*(a.moi?1/(1+((+e.endu||0)/150)):1)*(a.moi&&C.finish?2.6:1);
 let asp=false;if(E.asp){for(const b of C.A)if(b!==a&&b.d-a.d>.5&&b.d-a.d<3){asp=true;break;}}if(asp)K*=.72;a.asp=asp;
 a.S=Math.max(0,Math.min(1,a.S-dts*K*Math.pow(r,4)*1.0+(r<.62?dts*.02:0)));
 const d0=a.d;a.d+=a.v*dts;a.pas+=a.v*dts*CAD*26;
 /* les haies */
 if(C.H.length){if(!a.moi&&a.saut<0){for(const h of C.H){const q=h-1.75*(1+(hA(a.c,h|0,7)-.5)*(.5-C.nv*.06));if(d0<q&&a.d>=q){a.saut=a.d;break;}}}
  for(const h of C.H){if(d0<h&&a.d>=h){const pr=a.saut>=0?(h-a.saut)/a.sautL:-1;
   if(pr<0||pr>1){a.choc=.55;a.v*=.6;C.tombees[a.c+':'+h]=1;if(a.moi){SON.haie();vib([50,30,50]);C.pops.push({txt:'HAIE !',c:'#ff6a4a',t:0,gros:true});}}
   else if(pr<.3||pr>.72){a.v*=.88;C.tombees[a.c+':'+h]=.5;if(a.moi){SON.haie();vib(30);C.pops.push({txt:'touchée',c:'#ffb07a',t:0});}}
   else if(a.moi){const parf=Math.abs(pr-.5)<.09;if(parf){a.v=Math.min(a.vmax*1.02,a.v*1.03);C.pops.push({txt:'PARFAIT',c:'#7ee08a',t:0});}else C.pops.push({txt:'bien',c:'#c8ff9a',t:0});}}}
  if(a.saut>=0&&a.d-a.saut>a.sautL)a.saut=-1;}
 if(a.d>=E.d&&a.fini===null){const t=C.t-C.tPan-(a.d-E.d)/Math.max(.1,a.v);a.fini=t;}}
function boucle(ts){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(ts-(boucle.t||ts))/1000);boucle.t=ts;if(!C)return;
 const P=C.phase;C.tp+=dt;
 if(P==='presentation'&&C.tp>2.6){C.phase='marques';C.tp=0;C.bandeau={txt:'À vos marques…',t:1.6};}
 else if(P==='marques'&&C.tp>1.5){C.phase='prets';C.tp=0;C.bandeau={txt:'Prêts…',t:9};}
 else if(P==='prets'&&C.tp>C.prets){C.phase='course';C.tp=0;C.t=0;C.tPan=0;SON.pan();vib(40);C.bandeau={txt:'PAN !',c:'#ffd860',t:.7};C.flash=.5;}
 else if(P==='faux'&&C.tp>2.2){const f=C.faux,ep=C.ep;nouvelle(ep);C.faux=f;C.phase='marques';C.bandeau={txt:'À vos marques…',t:1.6};}
 if(C.phase==='course'){let k=C.E.ts;if(C.ralenti>0){C.ralenti-=dt;k*=.28;}const dts=dt*k;C.t+=dts;
  for(const a of C.A)courir(a,dts);
  const M=C.moi;
  /* le photo-finish : un ralenti si ça se joue à rien */
  if(!C.photo&&M.fini===null&&C.E.d-M.d<4&&C.E.d-M.d>0){for(const b of C.A)if(b!==M&&Math.abs(b.d-M.d)<1.2){C.photo=true;C.ralenti=1.6;C.bandeau={txt:'PHOTO-FINISH',c:'#ffd860',t:1.6};break;}}
  if(M.fini!==null&&!C.fini){C.fini=true;SON.fin();vib([30,40,30,40,60]);setTimeout(()=>{if(C)resultats(false);},1900);}
  SON.foule(.025+.06*Math.min(1,M.d/C.E.d)+(C.photo?.05:0));}
 /* la caméra : le joueur au tiers de l'écran */
 const cible=C.moi.d-3.4;C.camX+=(cible-C.camX)*Math.min(1,dt*6);
 for(const p of C.pops)p.t+=dt;C.pops=C.pops.filter(p=>p.t<1.1);
 if(C.bandeau){C.bandeau.t-=dt;if(C.bandeau.t<=0)C.bandeau=null;}
 C.flash=Math.max(0,(C.flash||0)-dt*2);
 dessiner();majHud();}

/* --- le dessin --- */
function dessiner(){const g=G,W2=CV.width,H2=CV.height,u=DPR;g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
 const PPM=W2/11.5,cx=m=>(m-C.camX)*PPM;
 /* le ciel, la tribune (parallaxe), le mur et ses bâches */
 const yT=H2*.03,yM=H2*.22,yP=H2*.29,nC=6;
 const sk=g.createLinearGradient(0,0,0,yT+40*u);sk.addColorStop(0,'#4a7cc8');sk.addColorStop(1,'#bfe0f6');g.fillStyle=sk;g.fillRect(0,0,W2,yM);
 g.fillStyle='#26314a';g.fillRect(0,0,W2,yT);
 if(!FOULE||FOULE.height!==Math.round(yM-yT))FOULE=graverFoule(Math.round(yM-yT));
 const fx=-((C.camX*PPM*.25)%FOULE.width);for(let x=fx;x<W2;x+=FOULE.width)g.drawImage(FOULE,Math.round(x),Math.round(yT));
 g.fillStyle='rgba(10,16,30,.35)';g.fillRect(0,yT,W2,14*u);
 g.fillStyle='#ece8de';g.fillRect(0,yM,W2,yP-yM);g.fillStyle='#fff';g.fillRect(0,yM,W2,2*u);
 const BA=[['ALLEZ !','#c0392b'],['MARSEILLE','#1f5fa8'],['ATHLÉ 13','#2e8a4a'],['SAVON DE M.','#2a8ab0'],['RECORDS','#5a2ab0']];const bw=180*u,off=(C.camX*PPM*.6)%(bw*BA.length);
 for(let i=-1;i<W2/bw+2;i++){const x=i*bw-off%bw,k=((Math.floor((off)/bw)+i)%BA.length+BA.length)%BA.length;g.fillStyle=BA[k][1];g.fillRect(x+6*u,yM+6*u,bw-12*u,yP-yM-14*u);g.fillStyle='#fff';g.font='900 '+(15*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(BA[k][0],x+bw/2,yM+(yP-yM)/2-1*u);}
 /* la piste : six couloirs en légère perspective */
 const hs=[];let tot=0;for(let i=0;i<nC;i++){hs.push(1+.1*i);tot+=hs[i];}const yBas=H2*.95,hU=(yBas-yP)/tot;const Y=[];let y=yP;for(let i=0;i<nC;i++){Y.push(y);y+=hs[i]*hU;}Y.push(y);
 g.fillStyle='#c65a3c';g.fillRect(0,yP,W2,yBas-yP);
 for(let i=0;i<500;i++){g.fillStyle=hA(i,1,3)<.5?'rgba(255,210,180,.1)':'rgba(90,20,10,.1)';const xx=((hA(i,2,3)*W2*3-C.camX*PPM)%(W2)+W2)%W2;g.fillRect(xx,yP+hA(i,3,3)*(yBas-yP),u,u);}
 g.fillStyle='rgba(255,255,255,.92)';for(let i=0;i<=nC;i++)g.fillRect(0,Y[i]-u,W2,1.6*u);
 g.fillStyle='#4c9a46';g.fillRect(0,yBas,W2,H2-yBas);g.fillStyle='#e6e2d8';g.fillRect(0,yBas,W2,4*u);
 /* les marques de distance, la ligne de départ, l'arrivée */
 for(let m=Math.ceil(C.camX/10)*10;m<C.camX+12;m+=10){const x=cx(m);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x,yP,2*u,5*u);g.fillRect(x,yBas-5*u,2*u,5*u);
  if(m%50===0&&m>0&&m<C.E.d){g.fillStyle='#fff';g.font='900 '+(11*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='top';g.fillText(m+' m',x,yBas+7*u);}}
 if(cx(0)>-20*u&&cx(0)<W2)for(let i=0;i<nC;i++){g.fillStyle='#fff';g.fillRect(cx(0)-1.5*u,Y[i],3*u,Y[i+1]-Y[i]);}
 const xf=cx(C.E.d);if(xf>-30*u&&xf<W2+30*u){for(let yy=yP;yy<yBas;yy+=5*u)for(let k=0;k<2;k++){g.fillStyle=((yy-yP)/(5*u)+k)%2<1?'#fff':'#1a1a1e';g.fillRect(xf+k*5*u,yy,5*u,5*u);}
  g.fillStyle='#2a2e36';g.fillRect(xf+12*u,yM-50*u,8*u,yP-yM+50*u);g.fillRect(xf-30*u,yM-70*u,70*u,24*u);g.fillStyle='#ff6a4a';g.font='900 '+(13*u)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';
  g.fillText(fmt(Math.max(0,C.t-C.tPan)),xf+5*u,yM-58*u);}
 /* les athlètes et leurs haies, couloir par couloir, du fond vers l'avant */
 for(let i=0;i<nC;i++){const a=C.A.find(b=>b.c===i),lh=Y[i+1]-Y[i],sc=Math.max(1,Math.round(lh*1.3/52*4)/4),yl=Y[i+1]-lh*.2;
  for(const h of C.H){const x=cx(h);if(x<-40*u||x>W2+40*u)continue;const tb=C.tombees[i+':'+h];
   /* une haie, vue de trois quarts : deux montants, deux pieds, la latte rayée qui traverse le couloir */
   const hh=22*sc,dp=lh*.55,dx=dp*.35;const ang=tb===1?1.25:tb===.5?.3:0;
   g.save();g.translate(x,yl);
   const post=(px,py)=>{g.fillStyle='rgba(0,0,0,.22)';g.fillRect(px-1*sc,py,9*sc,1.5*sc);g.fillStyle='#3a3e46';g.fillRect(px-1*sc,py-1.5*sc,8*sc,1.5*sc);
     g.save();g.translate(px,py);g.rotate(-ang);g.fillStyle='#d8dce2';g.fillRect(-.9*sc,-hh,1.8*sc,hh);g.fillStyle='#8a929c';g.fillRect(.3*sc,-hh,.6*sc,hh);g.restore();};
   post(dx,-dp);
   /* la latte */
   const t1x=dx+Math.sin(ang)*hh,t1y=-dp-Math.cos(ang)*hh,t2x=Math.sin(ang)*hh,t2y=-Math.cos(ang)*hh,n=6;
   for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n;g.fillStyle=k%2?'#1a1a1e':'#ffffff';g.beginPath();g.moveTo(t1x+(t2x-t1x)*a0,t1y+(t2y-t1y)*a0-2.2*sc);g.lineTo(t1x+(t2x-t1x)*a1,t1y+(t2y-t1y)*a1-2.2*sc);g.lineTo(t1x+(t2x-t1x)*a1,t1y+(t2y-t1y)*a1+1.6*sc);g.lineTo(t1x+(t2x-t1x)*a0,t1y+(t2y-t1y)*a0+1.6*sc);g.fill();}
   post(0,0);
   g.restore();
   /* le repère d'appel du joueur : vert quand c'est le moment de sauter */
   if(a&&a.moi&&a.d<h&&h-a.d<6){const dd=h-1.75-a.d,ok=Math.abs(dd)<.45;g.fillStyle=ok?'rgba(126,224,138,.9)':'rgba(255,216,96,.55)';g.beginPath();g.ellipse(cx(h-1.75),yl+2*u,(ok?9:6)*u,2.4*u,0,0,7);g.fill();}}
  if(!a)continue;const x=cx(a.d);if(x<-60*u||x>W2+60*u)continue;
  let lift=0;if(a.saut>=0){const p=(a.d-a.saut)/a.sautL;lift=Math.sin(Math.PI*Math.max(0,Math.min(1,p)))*20*sc;}
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x,yl+1*u,9*sc,2.6*sc,0,0,7);g.fill();
  const court=a.v>.6;const ap=a.moi?(ARGS&&ARGS.ap?ARGS.ap:{}):a.ap;
  g.save();g.translate(Math.round(x),Math.round(yl-lift+(a.choc>0?Math.sin(C.t*40)*1.5*u:0)));g.scale(sc,sc);
  try{personne(g,0,0,ap,'droite',a.pas,court,court);}catch(z){}g.restore();
  if(a.moi){g.fillStyle='#ffd860';g.beginPath();g.moveTo(x-5*u,yl-62*sc-lift);g.lineTo(x+5*u,yl-62*sc-lift);g.lineTo(x,yl-55*sc-lift);g.fill();}
  else if(C.phase==='presentation'||C.phase==='marques'){g.fillStyle='rgba(16,24,34,.75)';g.font='800 '+(9*u)+'px ui-monospace,monospace';const n=a.nom.split(' ')[1]||a.nom;const tw=g.measureText(n).width;g.fillRect(x-tw/2-4*u,yl-70*sc,tw+8*u,13*u);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(n,x,yl-70*sc+6.5*u);}
  if(a.asp&&a.moi){g.fillStyle='#9fe8ff';g.font='900 '+(10*u)+'px ui-monospace,monospace';g.textAlign='center';g.fillText('≋ aspiration',x,yl-72*sc-lift);}}
 /* les mots qui sautent, le bandeau, l'éclair du pistolet */
 for(const p of C.pops){const k=p.t/1.1;g.globalAlpha=1-k*k;g.fillStyle=p.c;g.font='900 '+((p.gros?26:17)*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p.txt,W2*.5,H2*.3-k*30*u);}g.globalAlpha=1;
 if(C.bandeau){const b=C.bandeau;g.fillStyle='rgba(16,24,34,.88)';g.fillRect(0,H2*.17,W2,46*u);g.fillStyle=b.c||'#fff';g.font='900 '+(24*u)+'px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b.txt,W2/2,H2*.17+23*u);}
 if(C.flash>0){g.fillStyle='rgba(255,255,255,'+C.flash+')';g.fillRect(0,0,W2,H2);}}
function majHud(){const M=C.moi,E=C.E;
 RAC.querySelector('.chr').textContent=C.phase==='course'?fmt(Math.max(0,M.fini!==null?M.fini:C.t-C.tPan)):'0.00';
 const ord=C.A.slice().sort((a,b)=>(a.fini!==null&&b.fini!==null)?a.fini-b.fini:b.d-a.d);const pl=ord.indexOf(M)+1;RAC.querySelector('.pl').textContent=pl+(pl===1?'er':'e');
 const s=RAC.querySelector('.souf i');s.style.width=Math.round(M.S*100)+'%';s.style.background=M.S>.5?'#7ee08a':M.S>.25?'#f5c430':'#ff5a4a';
 const bar=RAC.querySelector('.mini');let h='';for(const a of C.A){h+='<i style="left:'+Math.min(100,a.d/E.d*100)+'%;background:'+(a.moi?'#ffd860':'#c8d4e4')+';'+(a.moi?'z-index:2;width:12px;height:12px;margin:-6px 0 0 -6px':'')+'"></i>';}bar.innerHTML='<b></b>'+h;
 const fb=RAC.querySelector('.fin2');fb.classList.toggle('on',C.phase==='course'&&!C.finish&&E.d-M.d<=E.fin&&M.fini===null);fb.classList.toggle('pris',C.finish);
 const aide=RAC.querySelector('.aide');aide.textContent=C.phase==='presentation'||C.phase==='marques'||C.phase==='prets'?'Ne touche rien avant le coup de pistolet…':C.phase==='course'&&M.reac===null?'GO ! Tape G / D en rythme':'';}

/* --- les résultats --- */
function resultats(dq){if(!C||C.res)return;const E=C.E,M=C.moi;SON.foule(0);
 for(const a of C.A)if(a.fini===null){const rest=E.d-a.d;a.fini=(C.t-C.tPan)+rest/Math.max(4,a.v||7);}
 const ord=C.A.slice().sort((a,b)=>a.fini-b.fini);const pl=dq?7:ord.indexOf(M)+1;C.res={pl};
 const rec=record(C.ep),neuf=!dq&&(!rec||M.fini<rec);
 if(neuf){try{if(!e.chronos||typeof e.chronos!=='object')e.chronos={};e.chronos['ath_'+C.ep]={t:Math.round(M.fini*100)/100};}catch(x){}}
 let monte=false;if(!dq&&pl===1&&C.nv<6){try{if(!e.athNiv||typeof e.athNiv!=='object')e.athNiv={};e.athNiv[C.ep]=C.nv+1;monte=true;}catch(x){}}
 try{sauver();}catch(x){}
 const med=dq?'':pl===1?'🥇':pl===2?'🥈':pl===3?'🥉':'';
 const d=document.createElement('div');d.className='res';
 d.innerHTML='<div class="c"><small>'+E.nom.toUpperCase()+' · '+NIVEAUX[C.nv].toUpperCase()+'</small><div class="med">'+(dq?'🚫':med||'🏃')+'</div>'+
  '<h2>'+(dq?'Disqualifié':pl===1?'Victoire !':pl<=3?'Sur le podium !':pl+'e place')+'</h2>'+
  (dq?'<p class="t">Deux faux départs : le juge ne pardonne pas.</p>':'<p class="t">'+fmt(M.fini)+(neuf?' <b>· record perso !</b>':rec?' · record '+fmt(rec):'')+'</p>')+
  '<div class="cl">'+ord.map((a,i)=>'<div class="'+(a.moi?'moi':'')+'"><span>'+(i+1)+'</span><b>'+(a.moi?'Toi':a.nom)+'</b><em>'+(a.moi&&dq?'DQ':fmt(a.fini))+'</em></div>').join('')+'</div>'+
  (monte?'<p class="up">⬆ Tu montes en catégorie : <b>'+NIVEAUX[C.nv+1]+'</b></p>':'')+
  '<button class="b1">Recourir</button><button class="b2">Retour au stade</button></div>';
 RAC.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle(C.ep);};d.querySelector('.b2').onclick=fermer;}

function choisir(eps){const d=document.createElement('div');d.className='res on';
 d.innerHTML='<div class="c"><small>LIGNE DE DÉPART</small><h2>Quelle course ?</h2>'+eps.map(k=>{const r=record(k);return '<button class="ch" data-k="'+k+'"><b>'+EP[k].nom+'</b><span>'+NIVEAUX[niveau(k)]+(r?' · record '+fmt(r):'')+'</span></button>';}).join('')+'<button class="b2">Retour</button></div>';
 RAC.appendChild(d);d.querySelectorAll('.ch').forEach(b=>b.onclick=()=>{d.remove();nouvelle(b.dataset.k);});d.querySelector('.b2').onclick=fermer;}

function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);FOULE=null;}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);SON.stop();const r=RAC;RAC=null;C=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),250);removeEventListener('resize',cadrer);}

const CSS=`#crs{position:fixed;inset:0;z-index:2147482600;display:flex;flex-direction:column;background:#16213a;color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;touch-action:none;opacity:0;transition:opacity .25s}
#crs.on{opacity:1}#crs *{box-sizing:border-box}
#crs .hd{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 6px;background:#16213a;border-bottom:3px solid #e8c050}
#crs .hd .ep{font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#e8c050}#crs .hd .chr{font:900 26px/1 ui-monospace,monospace;color:#fff;min-width:96px}
#crs .hd .pl{font:900 20px ui-monospace,monospace;color:#ffd860;background:#0f1830;border:2px solid #e8c050;border-radius:4px;padding:0 8px}
#crs .hd .x{margin-left:auto;width:38px;height:38px;border:2px solid #e8c050;border-radius:4px;background:#0f1830;color:#ffd860;font:900 16px ui-monospace,monospace}
#crs .info{flex:none;display:flex;align-items:center;gap:10px;padding:6px 12px;background:#0f1830}
#crs .souf{flex:0 0 34%;height:12px;background:#2e3a4e;border:2px solid #0a1020;position:relative}#crs .souf i{display:block;height:100%;width:100%;background:#7ee08a;transition:width .1s}
#crs .souf:before{content:'SOUFFLE';position:absolute;left:0;top:-12px;font:800 8px ui-monospace,monospace;letter-spacing:1.5px;color:#8ab0d8}
#crs .mini{flex:1;height:4px;background:#3a4458;position:relative;border-radius:2px}#crs .mini b{position:absolute;right:-2px;top:-6px;width:3px;height:16px;background:repeating-linear-gradient(#fff 0 3px,#1a1a1e 3px 6px)}
#crs .mini i{position:absolute;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%}
#crs .scene{flex:1;min-height:0;position:relative}#crs .scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#crs .aide{position:absolute;left:0;right:0;bottom:6px;text-align:center;font:800 13px ui-monospace,monospace;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5);pointer-events:none}
#crs .cmd{flex:none;display:grid;grid-template-columns:1fr auto 1fr;gap:10px;padding:10px 12px calc(12px + env(safe-area-inset-bottom));background:#16213a;border-top:3px solid #e8c050}
#crs .cmd .t{height:min(22vh,150px);border:3px solid #e8c050;border-radius:6px;background:#26314a;color:#ffd860;font:900 34px ui-monospace,monospace;box-shadow:0 6px 0 #0a1020;touch-action:none}
#crs .cmd .t.ap{transform:translateY(5px);box-shadow:0 1px 0 #0a1020;background:#3a4a6a}
#crs .mid{display:flex;flex-direction:column;justify-content:center;gap:8px;width:96px}
#crs .sau{height:86px;border:3px solid #fff;border-radius:50%;background:#c0392b;color:#fff;font:900 15px ui-monospace,monospace;box-shadow:0 5px 0 #6a1a14;touch-action:none}
#crs .sau.ap{transform:translateY(4px);box-shadow:none}
#crs .fin2{height:46px;border:3px solid #e8c050;border-radius:6px;background:#3a4458;color:#8a96aa;font:900 13px ui-monospace,monospace;opacity:.5;touch-action:none}
#crs .fin2.on{opacity:1;background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;animation:crsP .6s ease-in-out infinite}#crs .fin2.pris{opacity:.35;animation:none}
@keyframes crsP{50%{transform:scale(1.06)}}
#crs .res{position:absolute;inset:0;z-index:5;background:rgba(8,12,20,.82);display:grid;place-items:center;padding:16px;opacity:0;transition:opacity .25s}#crs .res.on{opacity:1}
#crs .res .c{width:min(380px,94vw);background:#f6efdc;color:#16213a;border:4px solid #16213a;box-shadow:0 0 0 4px #e8c050,0 10px 0 rgba(0,0,0,.3);border-radius:4px;padding:14px 16px;text-align:center;max-height:92vh;overflow-y:auto}
#crs .res small{font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b}#crs .res .med{font-size:52px;line-height:1.1}
#crs .res h2{margin:0 0 4px;font:900 28px Georgia,serif}#crs .res .t{margin:0 0 10px;font:800 16px ui-monospace,monospace}#crs .res .t b{color:#b8540a}
#crs .res .cl div{display:flex;gap:8px;align-items:center;padding:5px 8px;border-bottom:1px dashed #c8bca8;font:700 13px ui-monospace,monospace;text-align:left}#crs .res .cl span{width:18px;font-weight:900}#crs .res .cl b{flex:1}#crs .res .cl div.moi{background:#fff3c0;font-weight:900}
#crs .res .up{margin:10px 0 0;font:700 13px ui-monospace,monospace;color:#2e7d4f}
#crs .res button{display:block;width:100%;margin-top:10px;border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:1px}
#crs .res .b1{background:#16213a;color:#ffd860;border:3px solid #e8c050}#crs .res .b2{background:#fff;color:#16213a;border:3px solid #16213a}
#crs .res .ch{background:#fff;border:3px solid #16213a;color:#16213a;text-align:left;box-shadow:0 4px 0 #16213a}#crs .res .ch b{display:block;font:900 20px Georgia,serif}#crs .res .ch span{font:700 12px ui-monospace,monospace;color:#6a5a40}`;

window.ouvrirCourse=function(eps,args){if(RAC)return;ARGS=args||{};eps=[].concat(eps);
 if(!document.getElementById('crsCss')){const s=document.createElement('style');s.id='crsCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='crs';RAC=d;const haies=eps.some(k=>EP[k].haies);
 d.innerHTML='<div class="hd"><div><div class="ep">PISTE MUNICIPALE</div><div class="chr">0.00</div></div><span class="pl">–</span><button class="x">✕</button></div>'+
  '<div class="info"><div class="souf"><i></i></div><div class="mini"></div></div>'+
  '<div class="scene"><canvas></canvas><div class="aide"></div></div>'+
  '<div class="cmd"><button class="t g">G</button><div class="mid"><button class="sau"'+(haies?'':' style="display:none"')+'>SAUT</button><button class="fin2">FINISH</button></div><button class="t d">D</button></div>';
 document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');
 const bind=(sel,f)=>{const b=d.querySelector(sel);b.addEventListener('touchstart',ev=>{ev.preventDefault();b.classList.add('ap');f();},{passive:false});
  const up=ev=>{ev.preventDefault();b.classList.remove('ap');};b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});
  b.addEventListener('mousedown',()=>{b.classList.add('ap');f();});b.addEventListener('mouseup',()=>b.classList.remove('ap'));};
 bind('.g',()=>tap('g'));bind('.d',()=>tap('d'));bind('.sau',saut);bind('.fin2',finishBtn);
 d.querySelector('.x').onclick=fermer;
 requestAnimationFrame(()=>{d.classList.add('on');cadrer();if(eps.length>1){nouvelle(eps[0]);C.phase='attente';choisir(eps);}else nouvelle(eps[0]);
  /* la sauteuse s'affiche seulement pour les haies */
  const maj=()=>{if(!RAC)return;const s=RAC.querySelector('.sau');if(C)s.style.display=C.H.length?'':'none';setTimeout(maj,400);};maj();});
 setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 window.__CRS={C:()=>C};
 RAF=requestAnimationFrame(boucle);};
})();
