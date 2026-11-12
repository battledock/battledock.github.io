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
/* ce qu'apporte chaque catégorie : des adversaires plus rapides, et de nouvelles tenues aux vestiaires */
const DEBLOQUE=['','le maillot Massilia et les chaussures Corail','le maillot Calanques et les chaussures Glacier','le maillot Provence et les chaussures Néon rose','le maillot Garrigue et les chaussures Noir mat','le maillot Soleil','la tenue Or olympique (maillot et chaussures)'];
const NOMS=['Kévin Ruffo','Yanis Belkacem','Théo Marchetti','Ibrahim Diallo','Lucas Moreau','Enzo Castelli','Mehdi Saïdi','Hugo Lambert','Sami Ferhat','Nathan Rossi','Malik Traoré','Louis Garnier'];
const STYLES={lievre:{n:'part fort',plan:f=>f<.55?1.02:.93},finisseur:{n:'finisseur',plan:f=>f<.72?.87:1.06},metronome:{n:'métronome',plan:f=>.93},regulier:{n:'régulier',plan:f=>f<.8?.91:1.02}};
const MAILLOTS=[['#e84a3a','#ffffff'],['#1f5fa8','#ffffff'],['#f5c430','#1a1a22'],['#2e8a4a','#f2ead6'],['#7a2ab0','#1a1a22'],['#ffffff','#e84a3a'],['#1a1a22','#f5c430']];
const SOUL=['#c8ff3a','#ff6a4a','#5ae0ff','#ff4ab8','#f6f6f6','#ffb030'];
let RAC=null,CV=null,G=null,RAF=0,DPR=1,C=null,ARGS=null,FOULE=null,FOULE2=null,BG=null,PISTE=null,BACH=null;
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

/* --- LES POSES : un athlète de profil, dessiné membre par membre, dans les couleurs de sa tenue.
   personne() sait marcher et courir ; pour s'accroupir dans les blocs, franchir une haie,
   plonger sur la ligne ou lever les bras, on le dessine ici avec les mêmes couleurs. --- */
const POSES={
 marques:{hip:[-2,-14],k1:[6,-9],f1:[2,0],k2:[-7,-1],f2:[-15,0],sh:[8,-22],e1:[10,-11],h1:[11,0],e2:[9,-11],h2:[10,0],hd:[13,-27]},
 prets:{hip:[-1,-23],k1:[6,-13],f1:[2,0],k2:[-7,-12],f2:[-15,0],sh:[9,-25],e1:[10,-13],h1:[11,0],e2:[9,-13],h2:[10,0],hd:[14,-29]},
 haie:{hip:[0,-27],k1:[10,-28],f1:[20,-27],k2:[-6,-24],f2:[-2,-20],sh:[6,-43],e1:[13,-41],h1:[19,-37],e2:[-1,-36],h2:[-5,-31],hd:[9,-49]},
 dip:{hip:[0,-25],k1:[8,-15],f1:[8,0],k2:[-5,-14],f2:[-13,-7],sh:[11,-38],e1:[3,-33],h1:[-5,-32],e2:[4,-32],h2:[-4,-29],hd:[15,-43]},
 fete:{hip:[0,-26],k1:[2,-13],f1:[3,0],k2:[-2,-13],f2:[-3,0],sh:[0,-42],e1:[5,-50],h1:[7,-58],e2:[-5,-50],h2:[-7,-58],hd:[1,-48]},
 debout:{hip:[0,-26],k1:[1,-13],f1:[2,0],k2:[-1,-13],f2:[-2,0],sh:[0,-42],e1:[2,-34],h1:[3,-27],e2:[-1,-34],h2:[-1,-27],hd:[0,-48]},
 starter:{hip:[0,-26],k1:[1,-13],f1:[2,0],k2:[-1,-13],f2:[-2,0],sh:[0,-42],e1:[3,-51],h1:[4,-60],e2:[2,-34],h2:[4,-27],hd:[0,-48]}};
const T2=(hex,d)=>{const v=parseInt(String(hex).slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function couleurs(ap){let P={};try{P=PALETTES;}catch(x){}const pk=(v,l,d)=>typeof v==='string'&&v[0]==='#'?v:((l&&l[v])||d);
 return {peau:pk(ap.peau,P.peau,'#e8c49a'),chev:pk(ap.cheveux,P.cheveux,'#2b1d12'),haut:pk(ap.veste,P.veste,'#7ac8f0'),bas:pk(ap.pantalon,P.pantalon,'#ffffff'),chau:pk(ap.chaussures,P.chaussures,'#c8ff3a')};}
function membre(g,a,b,w,c){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
/* LES POSES SONT FAITES AVEC LE VRAI SPRITE : on dessine l'athlète une fois (personne(), en 2×)
   dans une petite toile, puis on le découpe à la ceinture et on fait pivoter le buste et les
   jambes. Mêmes pixels, même tête, même tenue que pendant la course — rien n'est redessiné. */
const SPR=new Map();
function sprite(ap,dir,pas,court){const k=JSON.stringify(ap)+'|'+dir+'|'+pas+'|'+court;let c=SPR.get(k);if(c)return c;
 c=document.createElement('canvas');c.width=112;c.height=150;const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.setTransform(2,0,0,2,0,0);
 try{const sv=GESTE;GESTE={t:0};personne(q,28,68,ap,dir,pas,court,court);GESTE=sv;}catch(x){}
 if(SPR.size>80)SPR.clear();SPR.set(k,c);return c;}
const HANCHE=-19;                     /* la ceinture, en points du jeu au-dessus des pieds */
/* un morceau du sprite (lignes y0..y1, en points au-dessus des pieds), pivoté autour de la hanche */
function morceau(g,c,y0,y1,ang,hx,hy,sy){const Y0=(68+y0)*2,Y1=(68+y1)*2;g.save();g.translate(hx,hy);g.rotate(ang);g.scale(.5,.5*(sy||1));
 g.drawImage(c,0,Y0,112,Y1-Y0,-56,(y0-HANCHE)*2,112,Y1-Y0);g.restore();}
/* un bras ajouté, dans le style du sprite : deux points de large, liseré sombre */
function bras(g,ap,pts){const cc=couleurs(ap||{});g.lineCap='square';g.lineJoin='miter';
 for(const [w,c] of [[3.2,'#2a1a10'],[2,cc.peau]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))g.lineTo(p[0],p[1]);g.stroke();}
 const h=pts[pts.length-1];g.fillStyle='#2a1a10';g.fillRect(h[0]-1.6,h[1]-1.6,3.2,3.2);g.fillStyle=cc.peau;g.fillRect(h[0]-1,h[1]-1,2,2);}
function poser(g,ap,nom,x,y,sc,flip){ap=ap||{};g.save();g.translate(x,y);g.scale(sc*(flip?-1:1),sc);g.imageSmoothingEnabled=false;
 const foulee=sprite(ap,'droite',0,true),debout=sprite(ap,'droite',0,false);
 if(nom==='marques'){/* genou au sol, buste presque à l'horizontale, mains sur la ligne */
  morceau(g,foulee,HANCHE,4,0,0,-11,.58);morceau(g,foulee,-70,HANCHE,1.22,0,-11);}
 else if(nom==='prets'){/* les hanches montent au-dessus des épaules */
  morceau(g,foulee,HANCHE,4,-.12,0,HANCHE+.5);morceau(g,foulee,-70,HANCHE,1.0,0,HANCHE);}
 else if(nom==='haie'){/* jambe d'attaque lancée devant, buste penché sur la haie */
  morceau(g,foulee,HANCHE,4,-.62,0,HANCHE);morceau(g,foulee,-70,HANCHE,.42,0,HANCHE);}
 else if(nom==='dip'){/* le plongeon du buste sur la ligne */
  morceau(g,foulee,HANCHE,4,0,0,HANCHE);morceau(g,foulee,-70,HANCHE,.55,0,HANCHE);}
 else if(nom==='fete'){/* un petit bond, le poing levé */
  morceau(g,debout,-70,4,0,0,HANCHE);bras(g,ap,[[-2,-35],[-5,-44],[-4,-52]]);}
 else if(nom==='starter'){/* le bras tendu vers le ciel, le pistolet au bout */
  morceau(g,debout,-70,4,0,0,HANCHE);bras(g,ap,[[-2,-35],[-1,-45],[0,-55]]);g.fillStyle='#2a2e36';g.fillRect(-1,-60,5,3);g.fillRect(-1,-58,2,3);}
 else morceau(g,debout,-70,4,0,0,HANCHE);
 g.restore();}

/* --- la foule de la tribune, dessinée une fois, qui défile en fond --- */
function graverFoule(h,leve){const k0=Math.max(1,DPR*.8),L=Math.round(900*k0),c=document.createElement('canvas');c.width=L;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const cols=['#e84a3a','#f5c430','#ffffff','#3ac0e8','#7ee08a','#1a1a22','#ff8ab8','#7ac8f0','#2a6fba','#f28a2a'];
 const rangs=Math.max(2,Math.round(h/(34*k0))),hr=h/rangs;
 for(let r=0;r<rangs;r++){const yb=(r+1)*hr,prof=r/(rangs-1||1),sc=(.55+.17*prof)*k0,sombre=Math.round((1-prof)*-34);
  /* la marche du gradin */
  g.fillStyle=T2('#2f72c0',sombre);g.fillRect(0,yb-hr,L,hr);g.fillStyle=T2('#2f72c0',sombre-24);g.fillRect(0,yb-3*k0,L,3*k0);
  const pas=17*sc/.6;
  for(let x=6*k0+(r%2)*pas/2;x<L-6*k0;x+=pas){const k=hA(Math.round(x),r,5);
   if(k<.8){const ap={peau:((k*60)|0)%8,cheveux:((k*97)|0)%8,coiffe:((k*31)|0)%8,haut:[0,1,3,4][((k*13)|0)%4],veste:cols[((k*71)|0)%cols.length],pantalon:'#2a3a5a',bas:0,souliers:1,chaussures:'#f2f2f2',sac:0,chapeau:k<.06?1:0,raye:0,motif:0,_civil:true};
    const bras=leve&&hA(Math.round(x),r,8)<.55;
    g.save();g.translate(Math.round(x),Math.round(yb-2*k0));g.scale(sc,sc);try{personne(g,0,0,ap,'bas',0,false);}catch(z){}
    if(bras){const cc=couleurs(ap);g.fillStyle=cc.haut;g.fillRect(-11,-46,4,10);g.fillRect(7,-46,4,10);g.fillStyle=cc.peau;g.fillRect(-11,-52,4,6);g.fillRect(7,-52,4,6);}
    g.restore();
    /* une écharpe ou un drapeau, de temps en temps */
    if(k<.05){const fc=['#ffffff','#7ac8f0','#f5c430'][(k*100|0)%3];g.fillStyle='#d8dce2';g.fillRect(Math.round(x+6*k0),Math.round(yb-38*sc-12*k0),k0,22*k0);g.fillStyle=fc;g.fillRect(Math.round(x+7*k0),Math.round(yb-38*sc-12*k0+(leve?-3*k0:0)),14*k0,9*k0);}}
   else{g.fillStyle=T2('#3a86d8',sombre);g.fillRect(Math.round(x-6*k0),Math.round(yb-14*k0),12*k0,10*k0);g.fillStyle=T2('#5aa0e8',sombre);g.fillRect(Math.round(x-6*k0),Math.round(yb-14*k0),12*k0,2*k0);}}
  /* le dossier du rang : il cache les jambes */
  g.fillStyle=T2('#2766b0',sombre);g.fillRect(0,yb-9*k0,L,9*k0);g.fillStyle='rgba(255,255,255,.16)';g.fillRect(0,yb-9*k0,L,2*k0);}
 const om=g.createLinearGradient(0,0,0,h*.35);om.addColorStop(0,'rgba(8,12,24,.55)');om.addColorStop(1,'rgba(8,12,24,0)');g.fillStyle=om;g.fillRect(0,0,L,h*.35);
 return c;}

/* --- la course --- */
function bestNiv(){let m=0;try{for(const k in (e.athNiv||{}))m=Math.max(m,e.athNiv[k]|0);}catch(x){}return m;}
let AVANT=0;function meilleur(n){return n>AVANT;}
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
 C.dernier=cote;try{RAC.querySelector('.g').classList.toggle('next',cote==='d');RAC.querySelector('.d').classList.toggle('next',cote==='g');}catch(x){}C.taps.push(now);if(C.taps.length>24)C.taps.shift();if(hasard()<.5)SON.pas();}
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
  C.excite=Math.min(1,M.d/C.E.d*1.2+(C.photo?.4:0));
  if(M.fini!==null&&!C.fini){C.place=1+C.A.filter(b=>b!==M&&b.fini!==null&&b.fini<M.fini).length;C.excite=1;C.phase='course';C.fini=true;SON.fin();vib([30,40,30,40,60]);setTimeout(()=>{if(C)resultats(false);},1900);}
  SON.foule(.025+.06*Math.min(1,M.d/C.E.d)+(C.photo?.05:0));}
 /* la caméra : le joueur au tiers de l'écran */
 const cible=C.moi.d-3.4;C.camX+=(cible-C.camX)*Math.min(1,dt*6);
 for(const p of C.pops)p.t+=dt;C.pops=C.pops.filter(p=>p.t<1.1);
 if(C.bandeau){C.bandeau.t-=dt;if(C.bandeau.t<=0)C.bandeau=null;}
 C.flash=Math.max(0,(C.flash||0)-dt*2);
 dessiner();if((C._h=(C._h||0)+dt)>.1){C._h=0;majHud();}}

/* --- le dessin ---
   Tout ce qui ne bouge pas est peint une fois (BG) ; la foule, la piste et les bâches
   sont des bandes pré-dessinées qu'on fait glisser. Par image : quelques drawImage,
   les haies visibles, six athlètes. */
function geo(){const W2=CV.width,H2=CV.height,u=DPR,yT=H2*.03,yM=H2*.235,yP=H2*.3,nC=6,yBas=H2*.95;
 const hs=[];let tot=0;for(let i=0;i<nC;i++){hs.push(1+.1*i);tot+=hs[i];}const hU=(yBas-yP)/tot;const Y=[];let y=yP;for(let i=0;i<nC;i++){Y.push(y);y+=hs[i]*hU;}Y.push(y);
 return {W2,H2,u,yT,yM,yP,nC,yBas,Y,PPM:W2/11.5};}
function preparer(){const Q=geo(),{W2,H2,u,yT,yM,yP,yBas,Y}=Q;
 BG=document.createElement('canvas');BG.width=W2;BG.height=H2;const g=BG.getContext('2d');
 const sk=g.createLinearGradient(0,0,0,yM);sk.addColorStop(0,'#4a7cc8');sk.addColorStop(1,'#bfe0f6');g.fillStyle=sk;g.fillRect(0,0,W2,yM);
 g.fillStyle='#ece8de';g.fillRect(0,yM,W2,yP-yM);g.fillStyle='#fff';g.fillRect(0,yM,W2,2*u);g.fillStyle='#c8c2b4';g.fillRect(0,yP-4*u,W2,4*u);
 g.fillStyle='#c65a3c';g.fillRect(0,yP,W2,yBas-yP);
 g.fillStyle='#4c9a46';g.fillRect(0,yBas,W2,H2-yBas);g.fillStyle='#e6e2d8';g.fillRect(0,yBas,W2,4*u);
 /* le tartan : une bande texturée qu'on fait défiler */
 PISTE=document.createElement('canvas');PISTE.width=Math.round(240*u);PISTE.height=Math.round(yBas-yP);const q=PISTE.getContext('2d');q.fillStyle='#c65a3c';q.fillRect(0,0,PISTE.width,PISTE.height);
 for(let i=0;i<PISTE.width*PISTE.height/(70*u*u);i++){q.fillStyle=hA(i,1,3)<.5?'rgba(255,210,180,.12)':'rgba(90,20,10,.12)';q.fillRect(Math.floor(hA(i,2,3)*PISTE.width),Math.floor(hA(i,3,3)*PISTE.height),Math.ceil(u),Math.ceil(u));}
 q.fillStyle='rgba(255,255,255,.92)';for(let i=0;i<=6;i++)q.fillRect(0,Y[i]-yP-u,PISTE.width,1.6*u);
 /* les bâches, une bande qui se répète */
 const BA=[['ALLEZ !','#c0392b'],['MARSEILLE','#1f5fa8'],['ATHLÉ 13','#2e8a4a'],['SAVON DE M.','#2a8ab0'],['RECORDS','#5a2ab0']],bw=Math.round(180*u);
 BACH=document.createElement('canvas');BACH.width=bw*BA.length;BACH.height=Math.round(yP-yM);const b=BACH.getContext('2d');
 BA.forEach((t,k)=>{const x=k*bw;b.fillStyle=t[1];b.fillRect(x+6*u,6*u,bw-12*u,BACH.height-16*u);b.fillStyle='rgba(255,255,255,.25)';b.fillRect(x+6*u,6*u,bw-12*u,3*u);b.fillStyle='#fff';b.font='900 '+(15*u)+'px "Helvetica Neue",Arial,sans-serif';b.textAlign='center';b.textBaseline='middle';b.fillText(t[0],x+bw/2,(BACH.height-10*u)/2+6*u);});
 FOULE=graverFoule(Math.round(yM-yT),false);FOULE2=graverFoule(Math.round(yM-yT),true);}
/* UNE HAIE D'ATHLÉTISME, vue de trois quarts : deux pieds en L lestés, deux montants
   chromés, la latte blanche à bandes noires qui traverse le couloir. Renversée, elle
   bascule vers l'avant. Tout est posé sur la grille des pixels. */
function haie(g,x,y,sc,lh,tb){const P=n=>Math.round(n*sc),hh=P(23),dp=Math.round(lh*.3),dx=Math.round(dp*1.15),ang=tb===1?1.35:tb===.5?.32:0;
 const pied=(px,py,fond)=>{g.fillStyle='rgba(40,10,0,.25)';g.fillRect(px-P(9),py,P(12),P(1.5));
  g.fillStyle=fond?'#5a5f68':'#7a808a';g.fillRect(px-P(9),py-P(1.5),P(10),P(1.5));g.fillStyle=fond?'#2a2e36':'#3a3e46';g.fillRect(px-P(10),py-P(2.5),P(3),P(2.5));};
 const montant=(px,py,fond)=>{g.save();g.translate(px,py);g.rotate(ang);
  g.fillStyle=fond?'#9aa2ac':'#c8d0da';g.fillRect(-P(1.3),-hh,P(2.6),hh);g.fillStyle=fond?'#6a727c':'#8a929c';g.fillRect(P(.4),-hh,P(.6),hh);g.fillStyle='#ffffff';g.fillRect(-P(1),-hh,P(.6),hh*.7);
  g.fillStyle='#3a3e46';g.fillRect(-P(1.4),-P(9),P(2.8),P(1.6));g.restore();};
 /* l'ombre portée de la latte sur le tartan */
 if(!tb){g.fillStyle='rgba(60,15,5,.22)';g.beginPath();g.moveTo(-P(6)+x,y);g.lineTo(-P(6)+x+dx,y-dp);g.lineTo(-P(2)+x+dx,y-dp);g.lineTo(-P(2)+x,y);g.fill();}
 pied(x+dx,y-dp,true);montant(x+dx,y-dp,true);
 /* la latte : un ruban épais qui suit les deux sommets, bandes blanches et noires, tranche dessous */
 const s1=[x+dx+Math.sin(ang)*hh,y-dp-Math.cos(ang)*hh],s0=[x+Math.sin(ang)*hh,y-Math.cos(ang)*hh],ep=P(5),n=5;
 for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n,ax=s1[0]+(s0[0]-s1[0])*a0,ay=s1[1]+(s0[1]-s1[1])*a0,bx=s1[0]+(s0[0]-s1[0])*a1,by=s1[1]+(s0[1]-s1[1])*a1;
  g.fillStyle=k%2?'#1c1c22':'#f6f6f2';g.beginPath();g.moveTo(ax,ay-ep);g.lineTo(bx,by-ep);g.lineTo(bx,by);g.lineTo(ax,ay);g.fill();
  g.fillStyle=k%2?'#000000':'#c8c8c0';g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.lineTo(bx,by+P(1.2));g.lineTo(ax,ay+P(1.2));g.fill();}
 g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(s1[0],s1[1]-ep);g.lineTo(s0[0],s0[1]-ep);g.lineTo(s0[0],s0[1]-ep+P(.8));g.lineTo(s1[0],s1[1]-ep+P(.8));g.fill();
 pied(x,y,false);montant(x,y,false);}
function tuile(g,img,off,y,W2){const w=img.width;let x=-(((off%w)+w)%w);for(;x<W2;x+=w)g.drawImage(img,Math.round(x),Math.round(y));}
function dessiner(){if(!BG)preparer();const g=G,Q=geo(),{W2,H2,u,yT,yM,yP,nC,yBas,Y,PPM}=Q;g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
 const cx=m=>(m-C.camX)*PPM,ex=C.excite||0;
 g.drawImage(BG,0,0);
 /* la foule : elle se lève par vagues quand ça chauffe */
 const fr=(ex>.35&&Math.floor(C.tp*4+C.camX*.3)%2)||C.phase==='fini'?FOULE2:FOULE;tuile(g,fr,C.camX*PPM*.25,yT,W2);
 g.fillStyle='#26314a';g.fillRect(0,0,W2,yT);g.fillStyle='#141a28';g.fillRect(0,yT-2*u,W2,2*u);
 tuile(g,BACH,C.camX*PPM*.6,yM,W2);
 tuile(g,PISTE,C.camX*PPM,yP,W2);
 /* les marques de distance */
 g.font='900 '+(11*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='top';
 for(let m=Math.ceil(C.camX/10)*10;m<C.camX+12;m+=10){const x=cx(m);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x,yP,2*u,5*u);g.fillRect(x,yBas-5*u,2*u,5*u);if(m%50===0&&m>0&&m<C.E.d){g.fillStyle='#fff';g.fillText(m+' m',x,yBas+7*u);}}
 /* la ligne de départ, et le starter sur son estrade */
 const x0=cx(0);if(x0>-80*u&&x0<W2+40*u){g.fillStyle='#fff';for(let i=0;i<nC;i++)g.fillRect(x0-1.5*u,Y[i],3*u,Y[i+1]-Y[i]);
  const lh5=Y[6]-Y[5],scS=Math.max(1,Math.round(lh5*1.3/52*4)/4),sx=x0+46*scS,sy=H2-2*u+10*scS;
  g.fillStyle='#5a6068';g.fillRect(sx-12*scS,sy-10*scS,24*scS,10*scS);g.fillStyle='#8a929c';g.fillRect(sx-12*scS,sy-10*scS,24*scS,2*scS);
  const arme=C.phase==='prets'||(C.phase==='course'&&C.t-C.tPan<.6);
  poser(g,{peau:3,cheveux:9,veste:'#c0392b',pantalon:'#1a1a22',chaussures:'#1a1a22'},arme?'starter':'debout',sx,sy-10*scS,scS,true);
  if(!arme){/* bras baissés : on cache ceux de la pose « fête » */}
  if(arme){const hx=sx-4*scS,hy=sy-10*scS-60*scS;g.fillStyle='#2a2e36';g.fillRect(hx-5*scS,hy-2*scS,6*scS,3*scS);
   if(C.phase==='course'){const k=Math.min(1,(C.t-C.tPan)/.6);g.globalAlpha=1-k;g.fillStyle='#fff6c0';g.beginPath();g.arc(hx-7*scS,hy-6*scS-k*14*u,(4+k*10)*u,0,7);g.fill();g.fillStyle='#d8d8d8';g.beginPath();g.arc(hx-3*scS,hy-10*scS-k*20*u,(3+k*8)*u,0,7);g.fill();g.globalAlpha=1;}}}
 /* l'arrivée : le damier, le portique et son chrono */
 const xf=cx(C.E.d);if(xf>-60*u&&xf<W2+60*u){for(let yy=yP;yy<yBas;yy+=5*u)for(let k=0;k<2;k++){g.fillStyle=((yy-yP)/(5*u)+k)%2<1?'#fff':'#1a1a1e';g.fillRect(xf+k*5*u,yy,5*u,5*u);}
  g.fillStyle='#2a2e36';g.fillRect(xf+12*u,yM-50*u,8*u,yP-yM+50*u);g.fillRect(xf-30*u,yM-70*u,70*u,24*u);g.fillStyle='#ff6a4a';g.font='900 '+(13*u)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';
  g.fillText(fmt(Math.max(0,C.fini&&C.moi.fini!==null?C.moi.fini:C.t-C.tPan)),xf+5*u,yM-58*u);}
 /* couloir par couloir, du fond vers l'avant : les blocs, les haies, l'athlète */
 for(let i=0;i<nC;i++){const a=C.A.find(b=>b.c===i),lh=Y[i+1]-Y[i],sc=Math.max(1,Math.round(lh*1.3/52*4)/4),yl=Y[i+1]-lh*.2;
  /* les blocs de départ, derrière la ligne */
  if(x0>-40*u&&x0<W2+40*u){for(const [bx,bh] of [[2,5],[-15,7]]){const X=x0+(bx-1)*sc;g.fillStyle='#3a3e46';g.fillRect(X-1*sc,yl-1*sc,9*sc,2*sc);g.fillStyle='#c8ccd2';g.beginPath();g.moveTo(X,yl-1*sc);g.lineTo(X+5*sc,yl-bh*sc);g.lineTo(X+6.5*sc,yl-bh*sc);g.lineTo(X+3*sc,yl-1*sc);g.fill();}}
  for(const h of C.H){const x=cx(h);if(x<-40*u||x>W2+40*u)continue;haie(g,Math.round(x),Math.round(yl),sc,lh,C.tombees[i+':'+h]);
   if(a&&a.moi&&a.d<h&&h-a.d<6){const ok=Math.abs(h-1.75-a.d)<.45;g.fillStyle=ok?'rgba(126,224,138,.9)':'rgba(255,216,96,.55)';g.beginPath();g.ellipse(cx(h-1.75),yl+2*u,(ok?9:6)*u,2.4*u,0,0,7);g.fill();}}
  if(!a)continue;const x=cx(a.d);if(x<-60*u||x>W2+60*u)continue;
  let lift=0,pz=null;
  if(C.phase==='presentation'||C.phase==='attente'||C.phase==='faux'||C.phase==='dq')pz=null;
  else if(C.phase==='marques')pz='marques';
  else if(C.phase==='prets')pz='prets';
  else if(C.phase==='course'&&a.d<.05&&(a.moi?a.reac===null:C.t-C.tPan<a.reac))pz='prets';
  if(a.saut>=0){const pr=Math.max(0,Math.min(1,(a.d-a.saut)/a.sautL));lift=Math.sin(Math.PI*pr)*20*sc;if(pr>.12&&pr<.88)pz='haie';}
  if(a.fini===null&&C.E.d-a.d<1.1&&C.E.d-a.d>0&&C.phase==='course')pz='dip';
  if(a.fini!==null&&a.moi&&!C.res&&C.place===1&&C.t-C.tPan-a.fini>.9)pz='fete';
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x,yl+1*u,9*sc*(1-lift/(60*sc)),2.6*sc,0,0,7);g.fill();
  const ap=a.moi?(ARGS&&ARGS.ap?Object.assign({},ARGS.ap,ARGS.kit||{}):{}):a.ap;
  const yy=Math.round(yl-lift+(a.choc>0?Math.sin(C.t*40)*1.5*u:0));
  if(pz)poser(g,ap,pz,Math.round(x),yy,sc,false);
  else{const court=a.v>.6;g.save();g.translate(Math.round(x),yy);g.scale(sc,sc);try{personne(g,0,0,ap,court||C.phase==='course'||a.fini!==null?'droite':'droite',a.pas,court,court);}catch(z){}g.restore();}
  if(a.moi){g.fillStyle='#ffd860';g.beginPath();g.moveTo(x-5*u,yl-62*sc-lift);g.lineTo(x+5*u,yl-62*sc-lift);g.lineTo(x,yl-55*sc-lift);g.fill();}
  else if(C.phase==='presentation'){g.fillStyle='rgba(16,24,34,.8)';g.font='800 '+(9*u)+'px ui-monospace,monospace';const n=a.nom.split(' ')[1]||a.nom;const tw=g.measureText(n).width;g.fillRect(x-tw/2-4*u,yl-70*sc,tw+8*u,13*u);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(n,x,yl-70*sc+6.5*u);}
  if(a.asp&&a.moi){g.fillStyle='#9fe8ff';g.font='900 '+(10*u)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('≋ aspiration',x,yl-72*sc-lift);}}
 for(const p of C.pops){const k=p.t/1.1;g.globalAlpha=1-k*k;g.fillStyle=p.c;g.font='900 '+((p.gros?26:17)*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(0,0,0,.45)';g.fillText(p.txt,W2*.5+2*u,H2*.44-k*30*u+2*u);g.fillStyle=p.c;g.fillText(p.txt,W2*.5,H2*.44-k*30*u);}g.globalAlpha=1;
 if(C.bandeau){const b=C.bandeau;g.fillStyle='rgba(16,24,34,.88)';g.fillRect(0,H2*.17,W2,46*u);g.fillStyle=b.c||'#fff';g.font='900 '+(24*u)+'px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b.txt,W2/2,H2*.17+23*u);}
 if(C.flash>0){g.fillStyle='rgba(255,255,255,'+C.flash+')';g.fillRect(0,0,W2,H2);}}
function majHud(){const M=C.moi,E=C.E;
 RAC.querySelector('.chr').textContent=C.phase==='course'?fmt(Math.max(0,M.fini!==null?M.fini:C.t-C.tPan)):'0.00';
 const ord=C.A.slice().sort((a,b)=>(a.fini!==null&&b.fini!==null)?a.fini-b.fini:b.d-a.d);const pl=ord.indexOf(M)+1;RAC.querySelector('.pl').textContent=pl+(pl===1?'er':'e');
 const s=RAC.querySelector('.souf i');s.style.width=Math.round(M.S*100)+'%';s.style.background=M.S>.5?'#7ee08a':M.S>.25?'#f5c430':'#ff5a4a';
 const bar=RAC.querySelector('.mini');if(bar.childNodes.length!==C.A.length+1){let h='<b></b>';for(const a of C.A)h+='<i class="'+(a.moi?'m':'')+'"></i>';bar.innerHTML=h;}
 C.A.forEach((a,k)=>{bar.childNodes[k+1].style.left=Math.min(100,a.d/E.d*100)+'%';});
 const nx=C.phase==='course'&&M.fini===null?(C.dernier==='g'?'d':'g'):'';RAC.querySelector('.g').classList.toggle('next',nx==='g');RAC.querySelector('.d').classList.toggle('next',nx==='d');
 let go=false;for(const h of C.H)if(M.d<h&&Math.abs(h-1.75-M.d)<.6)go=true;RAC.querySelector('.sau').classList.toggle('go',go);
 const fb=RAC.querySelector('.fin2');fb.classList.toggle('on',C.phase==='course'&&!C.finish&&E.d-M.d<=E.fin&&M.fini===null);fb.classList.toggle('pris',C.finish);
 const aide=RAC.querySelector('.aide');aide.textContent=C.phase==='presentation'||C.phase==='marques'||C.phase==='prets'?'Ne touche rien avant le coup de pistolet…':C.phase==='course'&&M.reac===null?'GO ! Tape G / D en rythme':'';}

/* --- les résultats --- */
function resultats(dq){if(!C||C.res)return;const E=C.E,M=C.moi;SON.foule(0);
 for(const a of C.A)if(a.fini===null){const rest=E.d-a.d;a.fini=(C.t-C.tPan)+rest/Math.max(4,a.v||7);}
 const ord=C.A.slice().sort((a,b)=>a.fini-b.fini);const pl=dq?7:ord.indexOf(M)+1;C.res={pl};
 const rec=record(C.ep),neuf=!dq&&(!rec||M.fini<rec);
 if(neuf){try{if(!e.chronos||typeof e.chronos!=='object')e.chronos={};e.chronos['ath_'+C.ep]={t:Math.round(M.fini*100)/100};}catch(x){}}
 AVANT=bestNiv();let monte=false;if(!dq&&pl===1&&C.nv<6){try{if(!e.athNiv||typeof e.athNiv!=='object')e.athNiv={};e.athNiv[C.ep]=C.nv+1;monte=true;}catch(x){}}
 try{sauver();}catch(x){}
 const med=dq?'':pl===1?'🥇':pl===2?'🥈':pl===3?'🥉':'';
 const d=document.createElement('div');d.className='res';
 d.innerHTML='<div class="c"><small>'+E.nom.toUpperCase()+' · '+NIVEAUX[C.nv].toUpperCase()+'</small><div class="med">'+(dq?'🚫':med||'🏃')+'</div>'+
  '<h2>'+(dq?'Disqualifié':pl===1?'Victoire !':pl<=3?'Sur le podium !':pl+'e place')+'</h2>'+
  (dq?'<p class="t">Deux faux départs : le juge ne pardonne pas.</p>':'<p class="t">'+fmt(M.fini)+(neuf?' <b>· record perso !</b>':rec?' · record '+fmt(rec):'')+'</p>')+
  '<div class="cl">'+ord.map((a,i)=>'<div class="'+(a.moi?'moi':'')+'"><span>'+(i+1)+'</span><b>'+(a.moi?'Toi':a.nom)+'</b><em>'+(a.moi&&dq?'DQ':fmt(a.fini))+'</em></div>').join('')+'</div>'+
  (monte?'<div class="up"><b>⬆ Catégorie '+NIVEAUX[C.nv+1]+'</b><span>Adversaires plus rapides sur le '+E.nom+'.'+(meilleur(C.nv+1)?' Débloqué aux vestiaires : '+DEBLOQUE[C.nv+1]+' !':'')+'</span></div>':
   (!dq&&pl>1&&C.nv<6?'<p class="up2">Gagne pour passer en catégorie <b>'+NIVEAUX[C.nv+1]+'</b>'+(DEBLOQUE[C.nv+1]?' et débloquer '+DEBLOQUE[C.nv+1]:'')+'.</p>':''))+
  '<button class="b1">Recourir</button><button class="b2">Retour au stade</button></div>';
 RAC.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle(C.ep);};d.querySelector('.b2').onclick=fermer;}

function choisir(eps){const d=document.createElement('div');d.className='res on';
 d.innerHTML='<div class="c"><small>LIGNE DE DÉPART</small><h2>Quelle course ?</h2>'+eps.map(k=>{const r=record(k);return '<button class="ch" data-k="'+k+'"><b>'+EP[k].nom+'</b><span>Catégorie '+NIVEAUX[niveau(k)]+(r?' · record '+fmt(r):'')+'</span></button>';}).join('')+'<button class="b2">Retour</button></div>';
 RAC.appendChild(d);d.querySelectorAll('.ch').forEach(b=>b.onclick=()=>{d.remove();nouvelle(b.dataset.k);});d.querySelector('.b2').onclick=fermer;}

function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);BG=null;}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);SON.stop();const r=RAC;RAC=null;C=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),250);removeEventListener('resize',cadrer);}

/* les icônes des commandes, en pixels */
const PX=(rows,cols,w)=>{let r='';rows.forEach((l,y)=>{for(let x=0;x<l.length;x++){const c=cols[l[x]];if(c)r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+c+'"/>';}});return '<svg viewBox="0 0 '+rows[0].length+' '+rows.length+'" width="'+w+'" shape-rendering="crispEdges">'+r+'</svg>';};
const SEMELLE=['..aaaa..','.abbbba.','abbbbbba','abccbcba','abbbbbba','abbbbbba','.abbbbba','.abbbba.','..abba..','..abbba.','..abbba.','..abbba.','..abccba','..abbbba','...abba.','....aa..'];
const ICO_G=PX(SEMELLE.map(l=>l.split('').reverse().join('')),{a:'#0a1020',b:'#ffd860',c:'#b8901a'},38),ICO_D=PX(SEMELLE,{a:'#0a1020',b:'#ffd860',c:'#b8901a'},38);
const ICO_H=PX(['aaaaaaaaaaaa','abcbcbcbcbca','aaaaaaaaaaaa','.d........d.','.d........d.','.d........d.','.d........d.','.d........d.','dddd....dddd'],{a:'#5a1410',b:'#ffffff',c:'#1a1a1e',d:'#e8e0d0'},44);
const ICO_F=PX(['a.........','abcbcbc...','acbcbcb...','abcbcbc...','acbcbcb...','a.........','a.........','a.........','a.........'],{a:'#2a2016',b:'#2a2016',c:'#fff6d8'},26);
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
#crs .mini i{position:absolute;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#c8d4e4}#crs .mini i.m{z-index:2;width:12px;height:12px;margin:-6px 0 0 -6px;background:#ffd860;box-shadow:0 0 0 2px #0a1020}
#crs .scene{flex:1;min-height:0;position:relative}#crs .scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#crs .aide{position:absolute;left:0;right:0;bottom:6px;text-align:center;font:800 13px ui-monospace,monospace;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5);pointer-events:none}
#crs .cmd{flex:none;display:grid;grid-template-columns:1fr auto 1fr;gap:12px;padding:12px 12px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(#1b2740,#0f1830);border-top:3px solid #e8c050;box-shadow:inset 0 3px 0 #0a1020}
#crs .cmd button{all:unset;box-sizing:border-box;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
#crs .cmd .t{position:relative;height:min(23vh,158px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:4px;
 background:linear-gradient(#2c3a58,#1e2a44);box-shadow:0 0 0 3px #0a1020,0 0 0 6px #e8c050,0 0 0 9px #0a1020,0 9px 0 6px #0a1020;transition:transform .05s,box-shadow .05s,background .05s;margin:6px}
#crs .cmd .t span{font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#8ab0d8}
#crs .cmd .t svg{filter:drop-shadow(0 3px 0 rgba(0,0,0,.4));transition:transform .05s}
#crs .cmd .t.next{background:linear-gradient(#3a4c74,#24345a)}#crs .cmd .t.next:after{content:'';position:absolute;inset:6px;border:2px dashed rgba(255,216,96,.55);border-radius:2px;animation:crsN .5s steps(2) infinite}
@keyframes crsN{50%{border-color:rgba(255,216,96,.15)}}
#crs .cmd .t.ap{transform:translateY(6px);box-shadow:0 0 0 3px #0a1020,0 0 0 6px #ffd860,0 0 0 9px #0a1020,0 3px 0 6px #0a1020;background:linear-gradient(#ffe68a,#f2b030)}
#crs .cmd .t.ap span{color:#5a3a00}#crs .cmd .t.ap svg{transform:scale(.92)}
#crs .mid{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;width:100px}
#crs .cmd .sau{width:92px;height:92px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 40% 32%,#ff7a5a,#c0392b 60%,#8a1e14);box-shadow:0 0 0 3px #0a1020,0 0 0 6px #fff,0 0 0 9px #0a1020,0 8px 0 6px #0a1020}
#crs .cmd .sau b{display:block;font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#fff;margin-top:-4px}
#crs .cmd .sau.ap{transform:translateY(5px);box-shadow:0 0 0 3px #0a1020,0 0 0 6px #ffd860,0 0 0 9px #0a1020,0 3px 0 6px #0a1020}
#crs .cmd .sau.go{animation:crsS .3s steps(2) infinite}@keyframes crsS{50%{box-shadow:0 0 0 3px #0a1020,0 0 0 6px #7ee08a,0 0 0 9px #0a1020,0 8px 0 6px #0a1020}}
#crs .cmd .fin2{width:96px;height:48px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:4px;background:#2a344a;box-shadow:0 0 0 3px #0a1020,0 0 0 5px #3a4458,0 5px 0 4px #0a1020;opacity:.45;font:900 12px ui-monospace,monospace;color:#8a96aa;letter-spacing:1px}
#crs .cmd .fin2 svg{opacity:.5}
#crs .cmd .fin2.on{opacity:1;background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 0 0 3px #0a1020,0 0 0 5px #fff6d8,0 5px 0 4px #0a1020;animation:crsP .5s ease-in-out infinite}#crs .cmd .fin2.on svg{opacity:1}
#crs .cmd .fin2.pris{opacity:.3;animation:none}
@keyframes crsP{50%{transform:scale(1.06)}}
#crs .res{position:absolute;inset:0;z-index:5;background:rgba(8,12,20,.82);display:grid;place-items:center;padding:16px;opacity:0;transition:opacity .25s}#crs .res.on{opacity:1}
#crs .res .c{width:min(380px,94vw);background:#f6efdc;color:#16213a;border:4px solid #16213a;box-shadow:0 0 0 4px #e8c050,0 10px 0 rgba(0,0,0,.3);border-radius:4px;padding:14px 16px;text-align:center;max-height:92vh;overflow-y:auto}
#crs .res small{font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b}#crs .res .med{font-size:52px;line-height:1.1}
#crs .res h2{margin:0 0 4px;font:900 28px Georgia,serif}#crs .res .t{margin:0 0 10px;font:800 16px ui-monospace,monospace}#crs .res .t b{color:#b8540a}
#crs .res .cl div{display:flex;gap:8px;align-items:center;padding:5px 8px;border-bottom:1px dashed #c8bca8;font:700 13px ui-monospace,monospace;text-align:left}#crs .res .cl span{width:18px;font-weight:900}#crs .res .cl b{flex:1}#crs .res .cl div.moi{background:#fff3c0;font-weight:900}
#crs .res .up{margin:10px 0 0;background:#e6f6e8;border:2px solid #2e7d4f;border-radius:4px;padding:8px}#crs .res .up b{display:block;font:900 16px Georgia,serif;color:#1e6a34}#crs .res .up span{font:700 12px ui-monospace,monospace;color:#2e5a3a}
#crs .res .up2{margin:10px 0 0;font:700 12px ui-monospace,monospace;color:#6a5a40}
#crs .res button{display:block;width:100%;margin-top:10px;border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:1px}
#crs .res .b1{background:#16213a;color:#ffd860;border:3px solid #e8c050}#crs .res .b2{background:#fff;color:#16213a;border:3px solid #16213a}
#crs .res .ch{background:#fff;border:3px solid #16213a;color:#16213a;text-align:left;box-shadow:0 4px 0 #16213a}#crs .res .ch b{display:block;font:900 20px Georgia,serif}#crs .res .ch span{font:700 12px ui-monospace,monospace;color:#6a5a40}`;

window.ouvrirCourse=function(eps,args){if(RAC)return;ARGS=args||{};eps=[].concat(eps);
 if(!document.getElementById('crsCss')){const s=document.createElement('style');s.id='crsCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='crs';RAC=d;const haies=eps.some(k=>EP[k].haies);
 d.innerHTML='<div class="hd"><div><div class="ep">PISTE MUNICIPALE</div><div class="chr">0.00</div></div><span class="pl">–</span><button class="x">✕</button></div>'+
  '<div class="info"><div class="souf"><i></i></div><div class="mini"></div></div>'+
  '<div class="scene"><canvas></canvas><div class="aide"></div></div>'+
  '<div class="cmd"><button class="t g">'+ICO_G+'<span>GAUCHE</span></button><div class="mid"><button class="sau"'+(haies?'':' style="display:none"')+'>'+ICO_H+'<b>SAUT</b></button><button class="fin2">'+ICO_F+'FINISH</button></div><button class="t d">'+ICO_D+'<span>DROIT</span></button></div>';
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
