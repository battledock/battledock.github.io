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
 '400':{nom:'400 m',d:400,ts:1,K:.031,haies:null,fin:110,asp:false},
 '400h':{nom:'400 m haies',d:400,ts:1,K:.033,haies:{h0:45,dh:35,n:10},fin:90,asp:false},
 '800':{nom:'800 m',d:800,ts:1.3,K:.0195,haies:null,fin:150,asp:true},
 '4x100':{nom:'4 × 100 m',d:400,ts:1,K:.0075,haies:null,fin:45,asp:false,relais:true},
 'long':{nom:'Saut en longueur',d:40,ts:1,K:.003,haies:null,fin:0,asp:false,long:true}};
const VENT={'100':1,'100h':1,'long':1};                 /* les épreuves où le vent compte (au-delà de +2,0 m/s : pas de record) */
const ZONES=[100,200,300];                              /* le 4 × 100 : les zones de transmission (± 10 m) */
const CLUBS=['AC Endoume','Phocée Athlé','SCO Sainte-Marguerite','Calanques Sprint','Provence AC','Massilia Running'];
const PLANCHE=40;                                        /* la longueur : la planche d'appel, au bout de 40 m d'élan */
const fm=(ep,v)=>EP[ep]&&EP[ep].long?(v==null||v<0?'X':v.toFixed(2)+' m'):fmt(v);
const mieuxQue=(ep,a,b)=>b==null?true:EP[ep]&&EP[ep].long?a>b:a<b;
const NIVEAUX=['Débutant','Club','Régional','Interrégional','National','Élite','Olympique','Légende'];
/* la vitesse de pointe des adversaires selon la catégorie (le joueur plafonne vers 10,1 m/s, 10,5 au finish) */
const VMAX_IA=[8.55,8.85,9.15,9.45,9.75,10.0,10.2,10.4];
/* ce qu'apporte chaque catégorie : des adversaires plus rapides, et de nouvelles tenues aux vestiaires */
const DEBLOQUE=['','le maillot Massilia et les chaussures Corail','le maillot Calanques et les chaussures Glacier','le maillot Provence et les chaussures Néon rose','le maillot Garrigue et les chaussures Noir mat','le maillot Soleil','la tenue Or olympique (maillot et chaussures)','le rang de Légende du stade'];
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
function niveau(ep){try{return Math.max(0,Math.min(7,(e.athNiv&&e.athNiv[ep])|0));}catch(x){return 0;}}
function record(ep){try{return e.chronos&&e.chronos['ath_'+ep]&&e.chronos['ath_'+ep].t||null;}catch(x){return null;}}
function nouvelle(ep){const E=EP[ep],nv=niveau(ep);const noms=NOMS.slice().sort(()=>hasard()-.5);const styles=Object.keys(STYLES);
 const A=[];const couloirMoi=E.long?3:Math.floor(hasard()*6);
 const vent=VENT[ep]?Math.round((hasard()*5-2)*10)/10:null,kv=1+(vent||0)*.012;
 const kit=(ARGS&&ARGS.ap?Object.assign({},ARGS.ap,ARGS.kit||{}):{});
 for(let i=0;i<6;i++){const mk=MAILLOTS[(i*3+nv)%MAILLOTS.length];
  const equipe=E.relais?[0,1,2,3].map(j=>i===couloirMoi?(j===3?kit:Object.assign({},kit,{peau:1+(j*3+2)%6,cheveux:(j*4+1)%11,coiffe:(j*2+3)%8,barbe:j===1?2:0,_acc:undefined})):
    {peau:1+(i*5+j*2+nv)%6,cheveux:(i*3+j*5+2)%11,coiffe:(i*5+j)%8,barbe:(i+j)%4===1?2:0,haut:4,veste:mk[0],pantalon:mk[1],bas:1,souliers:1,chaussures:SOUL[(i+j+nv)%SOUL.length],sac:0,chapeau:0,raye:0,motif:0,_civil:true}):null;
  if(i===couloirMoi){A.push({moi:true,nom:E.relais?'Ton équipe':'Toi',c:i,vmax:9.55*kv,d:0,v:0,S:1,pas:0,fini:null,saut:-1,sautL:3.4,choc:0,reac:null,leg:0,equipe,ap:equipe?equipe[0]:null});continue;}
  const a={moi:false,nom:E.relais?CLUBS[(i+nv)%CLUBS.length]:noms[i],c:i,style:E.d>=400&&!E.relais?styles[(i+nv)%styles.length]:'metronome',vmax:(VMAX_IA[nv]+(hasard()-.5)*(nv>=5?.25:.35))*kv,d:0,v:0,S:1,pas:0,fini:null,saut:-1,sautL:3.3,choc:0,reac:Math.max(.1,.12+hasard()*.1-nv*.006),leg:0,equipe,
   ap:equipe?equipe[0]:{peau:1+(i*5+nv)%6,cheveux:(i*3+2)%11,coiffe:(i*5)%8,barbe:i%4===1?2:0,haut:4,veste:mk[0],pantalon:mk[1],bas:1,souliers:1,chaussures:SOUL[(i+nv)%SOUL.length],sac:0,chapeau:0,raye:0,motif:0,_civil:true}};
  /* à la longueur, les adversaires sautent hors champ : trois essais, leur meilleure marque */
  if(E.long){a.horsChamp=true;const base=5.45+nv*.38+(hasard()-.5)*.5;a.marks=[0,1,2].map(()=>hasard()<.2?-1:Math.round((base*(.93+hasard()*.07)+(vent||0)*.05)*100)/100);}
  A.push(a);}
 const H=[];if(E.haies)for(let k=0;k<E.haies.n;k++)H.push(E.haies.h0+k*E.haies.dh);
 C={ep,E,nv,A,moi:A.find(a=>a.moi),H,tombees:{},phase:'presentation',tp:0,t:0,tPan:0,faux:0,taps:[],dernier:null,finish:false,fini:false,ralenti:0,photo:false,
  pops:[],camX:-3,att:0,res:null,bandeau:null,vent,essai:0,marques:[],ola:-1,sortants:[]};
 C.prets=1+hasard()*1.2;
 const vt=vent===null?'':' · vent '+(vent>0?'+':'')+vent.toFixed(1)+' m/s';
 C.bandeau={txt:E.long?'Essai 1 / 3'+vt:'Couloir '+(couloirMoi+1)+vt,c:'#ffd860',t:2.4};}
function tap(cote){if(!C)return;SON.ctx();
 if(C.phase==='podium'){finPodium();return;}
 if(C.phase==='elan'){C.phase='course';C.t=0;C.tPan=0;C.moi.reac=0;}
 if(C.phase==='marques'||C.phase==='prets'){fauxDepart();return;}
 if(C.phase!=='course')return;const M=C.moi;if(M.fini!==null)return;
 const now=performance.now();if(M.vol||M.pose)return;if(M.reac===null){M.reac=C.t-C.tPan;C.pops.push({txt:'Réaction '+M.reac.toFixed(3)+' s',c:M.reac<.16?'#7ee08a':'#fff',t:0});}
 if(C.dernier===cote){M.v*=.97;vib(25);}else vib(6);
 C.dernier=cote;try{RAC.querySelector('.g').classList.toggle('next',cote==='d');RAC.querySelector('.d').classList.toggle('next',cote==='g');}catch(x){}C.taps.push(now);if(C.taps.length>24)C.taps.shift();if(hasard()<.5)SON.pas();}
function cadence(){const now=performance.now(),T=C.taps.filter(t=>now-t<650);if(T.length<2)return T.length?.3:0;
 const r=(T.length-1)/((T[T.length-1]-T[0])/1000);const recent=(now-T[T.length-1])<260?1:Math.max(0,1-(now-T[T.length-1]-260)/400);return Math.min(1.04,r/7.2)*recent;}
function fauxDepart(){C.faux++;SON.faux();vib([60,40,60]);
 if(C.faux>=2){C.phase='dq';C.bandeau={txt:'DISQUALIFIÉ · deuxième faux départ',c:'#ff6a4a',t:2.4};setTimeout(()=>{if(C&&C.phase==='dq')resultats(true);},1600);return;}
 C.phase='faux';C.tp=0;C.bandeau={txt:'FAUX DÉPART ! Le prochain, c’est la porte.',c:'#ff9a4a',t:2};}
function saut(){if(!C)return;if(C.phase==='podium'){finPodium();return;}if(C.phase!=='course')return;const M=C.moi;
 if(C.E.long){if(M.vol){if(!M.recep){const pr=(C.t-M.vol.t0)/M.vol.T;M.recep=1;M.vol.bonus=pr<.68?-.12:pr<.84?.12:.26;C.pops.push({txt:pr<.68?'trop tôt':pr<.84?'bonne réception':'JAMBES DEVANT !',c:pr<.68?'#ffb07a':pr<.84?'#c8ff9a':'#7ee08a',t:0,gros:pr>=.84});vib(10);}return;}
  if(M.pose||M.reac===null)return;appel();return;}
 if(C.E.relais){passer(M);return;}
 if(M.saut>=0||M.fini!==null||M.reac===null)return;M.saut=M.d;SON.saut();vib(8);}
/* LA LONGUEUR : l'appel. Plus on prend son appel près de la planche, moins on perd ; au-delà, c'est mordu.
   La distance vient de la vitesse d'élan ; la réception (un second appui en fin de vol) ajoute quelques centimètres. */
function appel(){const M=C.moi,v=M.v,faute=M.d>PLANCHE;
 const dist=v*v/9.81*.78;M.vol={x0:M.d,dist,t0:C.t,T:.62+dist*.045,bonus:0,faute};M.recep=0;SON.saut();vib(12);
 const perte=PLANCHE-M.d;C.pops.push(faute?{txt:'MORDU !',c:'#ff6a4a',t:0,gros:true}:perte<.12?{txt:'Appel parfait',c:'#7ee08a',t:0}:{txt:'−'+Math.round(perte*100)+' cm à la planche',c:perte<.4?'#c8ff9a':'#ffd860',t:0});}
function atterrir(){const M=C.moi,V=M.vol,m=V.faute?-1:Math.max(0,Math.round((V.x0+V.dist+V.bonus-PLANCHE)*100)/100);M.d=V.x0+V.dist+V.bonus;M.v=0;M.vol=null;M.pose='assis';
 C.marques.push(m);SON.haie();vib([20,30,20]);
 const best=Math.max(...C.marques),rec=record('long');
 C.bandeau={txt:m<0?'Essai '+C.marques.length+' : mordu':'Essai '+C.marques.length+' : '+m.toFixed(2)+' m',c:m<0?'#ff9a4a':m>=best&&(!rec||m>rec)?'#7ee08a':'#fff',t:2.2};
 if(m>0&&m>=best){if(!rec||m>rec)C.ola=0;}
 setTimeout(()=>{if(!C||C.ep!=='long')return;if(C.marques.length>=3){resultats(false);return;}
  C.essai++;Object.assign(M,{d:0,v:0,S:1,pas:0,reac:null,pose:null,recep:0});C.taps=[];C.dernier=null;C.phase='elan';C.ola=-1;C.camX=-3;
  C.bandeau={txt:'Essai '+(C.essai+1)+' / 3',c:'#ffd860',t:1.8};},2300);}
/* LE 4 × 100 : passer le témoin dans la zone. Au cœur de la zone, c'est parfait ; trop tôt ou trop tard on freine. */
function passer(a){if(a.leg>=3||a.fini!==null||a.reac===null)return;const Z=ZONES[a.leg],ec=a.d-Z;
 if(ec<-10){if(a.moi)C.pops.push({txt:'trop tôt : attends la zone',c:'#ffb07a',t:0});return;}
 const q=Math.abs(ec);C.sortants.push({c:a.c,d:a.d,v:a.v,ap:a.ap,t:0});
 a.leg++;a.ap=a.equipe[a.leg];a.S=1;a.v*=q<2?1:q<5?.94:.86;
 if(a.moi){SON.saut();vib(q<2?[10,20,10]:20);C.pops.push(q<2?{txt:'TRANSMISSION PARFAITE',c:'#7ee08a',t:0,gros:true}:{txt:q<5?'bonne transmission':'transmission ratée',c:q<5?'#c8ff9a':'#ffb07a',t:0});}}
/* la photo : un cadrage large sur ton couloir, au moment où tu passes la ligne (ou où tu touches le sable) */
function photo(){try{const Q=geo(),W2=CV.width,H2=CV.height,ch=Math.min(H2,Math.round(W2*.62)),yl=Q.Y[C.moi.c+1];const y0=Math.max(0,Math.min(H2-ch,Math.round(yl-ch*.62)));
 const c=document.createElement('canvas'),w=400,h=Math.round(ch/W2*400);c.width=w;c.height=h;const q=c.getContext('2d');q.drawImage(CV,0,y0,W2,ch,0,0,w,h);
 q.fillStyle='rgba(16,24,34,.8)';q.fillRect(0,h-18,w,18);q.fillStyle='#ffd860';q.font='900 11px ui-monospace,monospace';q.textBaseline='middle';q.fillText((C.E.long?'LE SAUT · ':'PHOTO-FINISH · ')+C.E.nom.toUpperCase(),8,h-9);q.textAlign='right';q.fillText(new Date().toLocaleDateString('fr-FR'),w-8,h-9);
 return c.toDataURL('image/jpeg',.75);}catch(x){return null;}}
function finishBtn(){if(!C||C.phase!=='course'||C.finish)return;const M=C.moi;if(C.E.d-M.d>C.E.fin)return;C.finish=true;vib([20,20,40]);C.pops.push({txt:'FINISH !',c:'#ffd860',t:0,gros:true});}

/* la physique d'un coureur : effort voulu → vitesse, souffle, haies */
function courir(a,dts){const E=C.E;if(a.horsChamp)return;
 if(a.moi&&E.long){if(a.vol)return;if(a.pose){a.v*=Math.pow(.2,dts);return;}if(a.d>PLANCHE+.5){appel();return;}}
 if(E.relais&&a.leg<3&&a.fini===null){if(!a.moi){if(a.d>=ZONES[a.leg]+(hA(a.c,a.leg,11)-.5)*8*Math.max(.3,1-C.nv*.12))passer(a);}
  else if(a.d>ZONES[a.leg]+10&&C.phase==='course'){C.phase='dq';C.bandeau={txt:'DISQUALIFIÉ · témoin hors zone',c:'#ff6a4a',t:2.4};setTimeout(()=>{if(C&&C.phase==='dq')resultats(true);},1600);return;}}
 if(a.fini!==null){a.v*=Math.pow(.6,dts);a.d+=a.v*dts;return;}
 let effort;
 if(a.moi){if(a.reac===null){effort=0;}else effort=cadence()*(C.finish?1.06:1);}
 else{if(C.t-C.tPan<a.reac)effort=0;else{effort=STYLES[a.style].plan(a.d/E.d);if(E.d-a.d<E.fin*.6&&E.d>=400)effort=Math.max(effort,1.04);if(E.d<400&&E.d-a.d<22&&C.nv>=3)effort=Math.max(effort,1+.008*C.nv);}}
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
 if(!E.long&&a.d>=E.d&&a.fini===null){const t=C.t-C.tPan-(a.d-E.d)/Math.max(.1,a.v);a.fini=t;}}
function boucle(ts){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(ts-(boucle.t||ts))/1000);boucle.t=ts;if(!C)return;
 const P=C.phase;C.tp+=dt;
 if(P==='presentation'&&C.tp>2.6&&C.E.long){C.phase='elan';C.tp=0;C.bandeau={txt:'Tape G / D pour t’élancer',t:1.8};}
 else if(P==='presentation'&&C.tp>2.6){C.phase='marques';C.tp=0;C.bandeau={txt:'À vos marques…',t:1.6};}
 else if(P==='marques'&&C.tp>1.5){C.phase='prets';C.tp=0;C.bandeau={txt:'Prêts…',t:9};}
 else if(P==='prets'&&C.tp>C.prets){C.phase='course';C.tp=0;C.t=0;C.tPan=0;SON.pan();vib(40);C.bandeau={txt:'PAN !',c:'#ffd860',t:.7};C.flash=.5;}
 else if(P==='faux'&&C.tp>2.2){const f=C.faux,ep=C.ep;nouvelle(ep);C.faux=f;C.phase='marques';C.bandeau={txt:'À vos marques…',t:1.6};}
 if(C.phase==='course'){let k=C.E.ts;if(C.ralenti>0){C.ralenti-=dt;k*=.28;}const dts=dt*k;C.t+=dts;
  for(const a of C.A)courir(a,dts);
  const M=C.moi;
  if(M.vol){const pr=(C.t-M.vol.t0)/M.vol.T;M.d=M.vol.x0+M.vol.dist*Math.min(1,pr);if(pr>=1)atterrir();}
  /* le photo-finish : un ralenti si ça se joue à rien */
  if(!C.E.long&&!C.photo&&M.fini===null&&C.E.d-M.d<4&&C.E.d-M.d>0){for(const b of C.A)if(b!==M&&Math.abs(b.d-M.d)<1.2){C.photo=true;C.ralenti=1.6;C.bandeau={txt:'PHOTO-FINISH',c:'#ffd860',t:1.6};break;}}
  C.excite=Math.min(1,M.d/C.E.d*1.2+(C.photo?.4:0)+(M.vol?.5:0));
  if(M.fini!==null&&!C.fini){C.place=1+C.A.filter(b=>b!==M&&b.fini!==null&&b.fini<M.fini).length;C.excite=1;C.phase='course';C.fini=true;SON.fin();vib([30,40,30,40,60]);
   const rp=record(C.ep);if(C.place===1||!rp||M.fini<rp)C.ola=0;setTimeout(()=>{if(C)resultats(false);},C.ola>=0?2700:1900);}
  SON.foule(.025+.06*Math.min(1,M.d/C.E.d)+(C.photo?.05:0));}
 /* la caméra : le joueur au tiers de l'écran */
 const cible=C.moi.d-3.4;C.camX+=(cible-C.camX)*Math.min(1,dt*6);
 for(const p of C.pops)p.t+=dt;C.pops=C.pops.filter(p=>p.t<1.1);if(C.ola>=0)C.ola+=dt;for(const so of C.sortants){so.t+=dt;so.v*=Math.pow(.3,dt);so.d+=so.v*dt*C.E.ts;}C.sortants=C.sortants.filter(so=>so.t<1.6);
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
 if(C.phase==='podium'){podium(g,Q);return;}
 const cx=m=>(m-C.camX)*PPM,ex=C.excite||0,E=C.E,M=C.moi;
 g.drawImage(BG,0,0);
 /* la foule : elle se lève par vagues quand ça chauffe */
 const fr=(ex>.35&&Math.floor(C.tp*4+C.camX*.3)%2)||C.phase==='fini'?FOULE2:FOULE;tuile(g,fr,C.camX*PPM*.25,yT,W2);
 /* la ola : une vague de bras levés qui traverse la tribune */
 if(C.ola>=0){const bw=W2*.2,c0=-bw+((C.ola*W2*.75)%(W2+2*bw));g.save();g.beginPath();g.rect(c0-bw,yT,2*bw,yM-yT);g.clip();tuile(g,FOULE2,C.camX*PPM*.25,yT-6*u,W2);g.restore();}
 g.fillStyle='#26314a';g.fillRect(0,0,W2,yT);g.fillStyle='#141a28';g.fillRect(0,yT-2*u,W2,2*u);
 tuile(g,BACH,C.camX*PPM*.6,yM,W2);
 tuile(g,PISTE,C.camX*PPM,yP,W2);
 if(E.long){const lh=Y[4]-Y[3];
  /* l'aire de saut : de l'herbe de chaque côté du couloir d'élan */
  g.fillStyle='#4c9a46';g.fillRect(0,yP,W2,Y[3]-yP);g.fillRect(0,Y[4],W2,yBas-Y[4]);
  for(let k=0;k<2;k++){const ya=k?Y[4]:yP,hb=k?yBas-Y[4]:Y[3]-yP;for(let m=Math.floor(C.camX/2)*2;m<C.camX+13;m+=2){if((m/2)%2)continue;g.fillStyle='rgba(255,255,255,.05)';g.fillRect(cx(m),ya,2*PPM,hb);}}
  g.fillStyle='#fff';g.fillRect(0,Y[3]-u,W2,2*u);g.fillRect(0,Y[4]-u,W2,2*u);
  /* le bac à sable, son rebord de bois, ses plots de distance */
  const s0=cx(PLANCHE+1),s1=cx(PLANCHE+10),sy0=Y[3]-lh*.55,sy1=Y[4]+lh*.35;
  if(s1>0&&s0<W2){g.fillStyle='#8a6a40';g.fillRect(s0-3*u,sy0-3*u,s1-s0+6*u,sy1-sy0+6*u);g.fillStyle='#e8d29a';g.fillRect(s0,sy0,s1-s0,sy1-sy0);
   for(let i=0;i<260;i++){const xx=s0+hA(i,4,9)*(s1-s0),yy=sy0+hA(i,5,9)*(sy1-sy0);g.fillStyle=hA(i,6,9)<.5?'rgba(160,130,80,.35)':'rgba(255,250,220,.5)';g.fillRect(Math.round(xx),Math.round(yy),Math.ceil(u),Math.ceil(u));}
   for(const m of C.marques)if(m>0){const xm=cx(PLANCHE+m);g.fillStyle='rgba(150,115,60,.55)';g.beginPath();g.ellipse(xm,(Y[3]+Y[4])/2,7*u,3*u,0,0,7);g.fill();}
   g.font='900 '+(10*u)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';
   for(let m=3;m<=9;m++){const xm=cx(PLANCHE+m);g.fillStyle='#f6f2e6';g.fillRect(xm-9*u,sy0-15*u,18*u,11*u);g.fillStyle='#16213a';g.fillText(m+'',xm,sy0-9.5*u);g.fillStyle='#c8c2b4';g.fillRect(xm-u,sy0-4*u,2*u,4*u);}
   /* la marque à battre : le meilleur saut des adversaires */
   const ai=Math.max(...C.A.filter(a=>a.horsChamp).map(a=>Math.max(...a.marks)));if(ai>0){const xa=cx(PLANCHE+ai);g.fillStyle='#ffd860';g.fillRect(xa-u,sy0,2*u,sy1-sy0);g.fillStyle='rgba(16,24,34,.85)';g.fillRect(xa-26*u,sy1+3*u,52*u,13*u);g.fillStyle='#ffd860';g.fillText('à battre',xa,sy1+9.5*u);}}
  /* la planche d'appel blanche, et sa bande de pâte à modeler qui trahit le pied mordu */
  const xp=cx(PLANCHE);g.fillStyle='#f6f6f2';g.fillRect(xp-.2*PPM,Y[3]+u,.2*PPM,lh-2*u);g.fillStyle='#e8a040';g.fillRect(xp,Y[3]+u,.1*PPM,lh-2*u);}
 /* les marques de distance */
 g.font='900 '+(11*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='top';
 for(let m=Math.ceil(C.camX/10)*10;m<C.camX+12;m+=10){const x=cx(m);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x,yP,2*u,5*u);g.fillRect(x,yBas-5*u,2*u,5*u);if(m%50===0&&m>0&&m<C.E.d){g.fillStyle='#fff';g.fillText(m+' m',x,yBas+7*u);}}
 /* la ligne de départ, et le starter sur son estrade */
 const x0=E.long?-9999:cx(0);if(x0>-80*u&&x0<W2+40*u){g.fillStyle='#fff';for(let i=0;i<nC;i++)g.fillRect(x0-1.5*u,Y[i],3*u,Y[i+1]-Y[i]);
  const lh5=Y[6]-Y[5],scS=Math.max(1,Math.round(lh5*1.3/52*4)/4),sx=x0+46*scS,sy=H2-2*u+10*scS;
  g.fillStyle='#5a6068';g.fillRect(sx-12*scS,sy-10*scS,24*scS,10*scS);g.fillStyle='#8a929c';g.fillRect(sx-12*scS,sy-10*scS,24*scS,2*scS);
  const arme=C.phase==='prets'||(C.phase==='course'&&C.t-C.tPan<.6);
  poser(g,{peau:3,cheveux:9,veste:'#c0392b',pantalon:'#1a1a22',chaussures:'#1a1a22'},arme?'starter':'debout',sx,sy-10*scS,scS,true);
  if(!arme){/* bras baissés : on cache ceux de la pose « fête » */}
  if(arme){const hx=sx-4*scS,hy=sy-10*scS-60*scS;g.fillStyle='#2a2e36';g.fillRect(hx-5*scS,hy-2*scS,6*scS,3*scS);
   if(C.phase==='course'){const k=Math.min(1,(C.t-C.tPan)/.6);g.globalAlpha=1-k;g.fillStyle='#fff6c0';g.beginPath();g.arc(hx-7*scS,hy-6*scS-k*14*u,(4+k*10)*u,0,7);g.fill();g.fillStyle='#d8d8d8';g.beginPath();g.arc(hx-3*scS,hy-10*scS-k*20*u,(3+k*8)*u,0,7);g.fill();g.globalAlpha=1;}}}
 /* l'arrivée : le damier, le portique et son chrono */
 const xf=E.long?-9999:cx(C.E.d);if(xf>-60*u&&xf<W2+60*u){for(let yy=yP;yy<yBas;yy+=5*u)for(let k=0;k<2;k++){g.fillStyle=((yy-yP)/(5*u)+k)%2<1?'#fff':'#1a1a1e';g.fillRect(xf+k*5*u,yy,5*u,5*u);}
  g.fillStyle='#2a2e36';g.fillRect(xf+12*u,yM-50*u,8*u,yP-yM+50*u);g.fillRect(xf-30*u,yM-70*u,70*u,24*u);g.fillStyle='#ff6a4a';g.font='900 '+(13*u)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';
  g.fillText(fmt(Math.max(0,C.fini&&C.moi.fini!==null?C.moi.fini:C.t-C.tPan)),xf+5*u,yM-58*u);}
 /* couloir par couloir, du fond vers l'avant : les blocs, les haies, l'athlète */
 for(let i=0;i<nC;i++){const a=C.A.find(b=>b.c===i),lh=Y[i+1]-Y[i],sc=Math.max(1,Math.round(lh*1.3/52*4)/4),yl=Y[i+1]-lh*.2;
  /* les blocs de départ, derrière la ligne */
  if(x0>-40*u&&x0<W2+40*u&&!E.long){for(const [bx,bh] of [[2,5],[-15,7]]){const X=x0+(bx-1)*sc;g.fillStyle='#3a3e46';g.fillRect(X-1*sc,yl-1*sc,9*sc,2*sc);g.fillStyle='#c8ccd2';g.beginPath();g.moveTo(X,yl-1*sc);g.lineTo(X+5*sc,yl-bh*sc);g.lineTo(X+6.5*sc,yl-bh*sc);g.lineTo(X+3*sc,yl-1*sc);g.fill();}}
  for(const h of C.H){const x=cx(h);if(x<-40*u||x>W2+40*u)continue;haie(g,Math.round(x),Math.round(yl),sc,lh,C.tombees[i+':'+h]);
   if(a&&a.moi&&a.d<h&&h-a.d<6){const ok=Math.abs(h-1.75-a.d)<.45;g.fillStyle=ok?'rgba(126,224,138,.9)':'rgba(255,216,96,.55)';g.beginPath();g.ellipse(cx(h-1.75),yl+2*u,(ok?9:6)*u,2.4*u,0,0,7);g.fill();}}
  if(E.relais){for(const Z of ZONES){for(const [m,c] of [[Z-10,'#f5c430'],[Z+10,'#f5c430']]){const xz=cx(m);if(xz<-10*u||xz>W2+10*u)continue;g.fillStyle=c;g.fillRect(xz-u,Y[i]+u,2*u,lh-2*u);g.beginPath();g.moveTo(xz,Y[i]+lh*.5);g.lineTo(xz+(m<Z?5:-5)*u,Y[i]+lh*.3);g.lineTo(xz+(m<Z?5:-5)*u,Y[i]+lh*.7);g.fill();}}
   if(a&&a.leg<3&&a.d<ZONES[a.leg]-8){const xw=cx(ZONES[a.leg]-8);if(xw>-40*u&&xw<W2+40*u){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(xw,yl+u,8*sc,2.4*sc,0,0,7);g.fill();g.save();g.translate(Math.round(xw),Math.round(yl));g.scale(sc,sc);try{personne(g,0,0,a.equipe[a.leg+1],a.d>ZONES[a.leg]-30?'droite':'gauche',0,false);}catch(z){}g.restore();}}
   if(a&&a.moi&&a.leg<3&&ZONES[a.leg]-a.d<14&&a.fini===null){const Z=ZONES[a.leg],ok=Math.abs(a.d-Z)<2;g.fillStyle=ok?'rgba(126,224,138,.9)':'rgba(255,216,96,.55)';g.beginPath();g.ellipse(cx(Z),yl+2*u,(ok?11:8)*u,2.6*u,0,0,7);g.fill();}
   for(const so of C.sortants)if(so.c===i){const xs=cx(so.d);g.save();g.globalAlpha=Math.max(0,1-so.t/1.6);g.translate(Math.round(xs),Math.round(yl));g.scale(sc,sc);try{personne(g,0,0,so.ap,'droite',so.d*CAD*26,so.v>.6,so.v>.6);}catch(z){}g.restore();}}
  if(E.long&&a&&a.moi&&!a.vol&&!a.pose&&PLANCHE-a.d<6&&a.reac!==null){const ok=PLANCHE-a.d<.5&&a.d<=PLANCHE;g.fillStyle=ok?'rgba(126,224,138,.9)':'rgba(255,216,96,.55)';g.beginPath();g.ellipse(cx(PLANCHE-.15),yl+2*u,(ok?10:7)*u,2.6*u,0,0,7);g.fill();}
  if(!a||a.horsChamp)continue;const x=cx(a.d);if(x<-60*u||x>W2+60*u)continue;
  let lift=0,pz=null;
  if(C.phase==='presentation'||C.phase==='attente'||C.phase==='faux'||C.phase==='dq')pz=null;
  else if(C.phase==='marques')pz='marques';
  else if(C.phase==='prets')pz='prets';
  else if(C.phase==='course'&&a.d<.05&&(a.moi?a.reac===null:C.t-C.tPan<a.reac))pz='prets';
  if(a.saut>=0){const pr=Math.max(0,Math.min(1,(a.d-a.saut)/a.sautL));lift=Math.sin(Math.PI*pr)*20*sc;if(pr>.12&&pr<.88)pz='haie';}
  if(a.vol){const pr=Math.min(1,(C.t-a.vol.t0)/a.vol.T);lift=Math.sin(Math.PI*pr)*34*sc;pz=pr<.18?'prets':pr<.7?'haie':'dip';}
  if(a.pose==='assis')pz='marques';
  if(a.fini===null&&C.E.d-a.d<1.1&&C.E.d-a.d>0&&C.phase==='course')pz='dip';
  if(a.fini!==null&&a.moi&&!C.res&&C.place===1&&C.t-C.tPan-a.fini>.9)pz='fete';
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x,yl+1*u,9*sc*(1-lift/(60*sc)),2.6*sc,0,0,7);g.fill();
  const ap=a.moi?(ARGS&&ARGS.ap?Object.assign({},ARGS.ap,ARGS.kit||{}):{}):a.ap;
  const yy=Math.round(yl-lift+(a.choc>0?Math.sin(C.t*40)*1.5*u:0));
  if(pz)poser(g,ap,pz,Math.round(x),yy,sc,false);
  else{const court=a.v>.6;g.save();g.translate(Math.round(x),yy);g.scale(sc,sc);try{personne(g,0,0,ap,court||C.phase==='course'||a.fini!==null?'droite':'droite',a.pas,court,court);}catch(z){}g.restore();}
  if(E.relais&&a.fini===null&&!pz){g.fillStyle='#1a1a22';g.fillRect(Math.round(x+2*sc),Math.round(yy-27*sc),Math.round(5*sc),Math.round(2.4*sc));g.fillStyle='#ffb030';g.fillRect(Math.round(x+2.5*sc),Math.round(yy-26.6*sc),Math.round(4*sc),Math.round(1.6*sc));}
  if(a.moi){g.fillStyle='#ffd860';g.beginPath();g.moveTo(x-5*u,yl-62*sc-lift);g.lineTo(x+5*u,yl-62*sc-lift);g.lineTo(x,yl-55*sc-lift);g.fill();}
  else if(C.phase==='presentation'){g.fillStyle='rgba(16,24,34,.8)';g.font='800 '+(9*u)+'px ui-monospace,monospace';const n=a.nom.split(' ')[1]||a.nom;const tw=g.measureText(n).width;g.fillRect(x-tw/2-4*u,yl-70*sc,tw+8*u,13*u);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(n,x,yl-70*sc+6.5*u);}
  if(a.asp&&a.moi){g.fillStyle='#9fe8ff';g.font='900 '+(10*u)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('≋ aspiration',x,yl-72*sc-lift);}}
 for(const p of C.pops){const k=p.t/1.1;g.globalAlpha=1-k*k;g.fillStyle=p.c;g.font='900 '+((p.gros?26:17)*u)+'px "Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(0,0,0,.45)';g.fillText(p.txt,W2*.5+2*u,H2*.44-k*30*u+2*u);g.fillStyle=p.c;g.fillText(p.txt,W2*.5,H2*.44-k*30*u);}g.globalAlpha=1;
 if(C.bandeau){const b=C.bandeau;g.fillStyle='rgba(16,24,34,.88)';g.fillRect(0,H2*.17,W2,46*u);g.fillStyle=b.c||'#fff';g.font='900 '+(24*u)+'px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b.txt,W2/2,H2*.17+23*u);}
 if(C.flash>0){g.fillStyle='rgba(255,255,255,'+C.flash+')';g.fillRect(0,0,W2,H2);}}
function majHud(){const M=C.moi,E=C.E;
 RAC.querySelector('.ep').textContent=E.nom.toUpperCase()+(C.vent!==null?' · VENT '+(C.vent>0?'+':'')+C.vent.toFixed(1):'');
 if(E.long){const b=C.marques.length?Math.max(...C.marques):null;RAC.querySelector('.chr').textContent=b>0?b.toFixed(2)+' m':'—';RAC.querySelector('.pl').textContent=Math.min(3,C.essai+1)+'/3';}
 else{RAC.querySelector('.chr').textContent=M.fini!==null?fmt(M.fini):C.phase==='course'||C.phase==='dq'?fmt(Math.max(0,C.t-C.tPan)):'0.00';
 const ord=C.A.slice().sort((a,b)=>(a.fini!==null&&b.fini!==null)?a.fini-b.fini:b.d-a.d);const pl=ord.indexOf(M)+1;RAC.querySelector('.pl').textContent=pl+(pl===1?'er':'e');}
 const s=RAC.querySelector('.souf i');s.style.width=Math.round(M.S*100)+'%';s.style.background=M.S>.5?'#7ee08a':M.S>.25?'#f5c430':'#ff5a4a';
 const bar=RAC.querySelector('.mini');if(bar.childNodes.length!==C.A.length+1){let h='<b></b>';for(const a of C.A)h+='<i class="'+(a.moi?'m':'')+'"'+(a.horsChamp?' style="display:none"':'')+'></i>';bar.innerHTML=h;}
 C.A.forEach((a,k)=>{bar.childNodes[k+1].style.left=Math.min(100,a.d/(E.long?PLANCHE+9:E.d)*100)+'%';});
 const nx=C.phase==='course'&&M.fini===null?(C.dernier==='g'?'d':'g'):'';RAC.querySelector('.g').classList.toggle('next',nx==='g');RAC.querySelector('.d').classList.toggle('next',nx==='d');
 let go=false;for(const h of C.H)if(M.d<h&&Math.abs(h-1.75-M.d)<.6)go=true;
 if(E.long){if(M.vol){const pr=(C.t-M.vol.t0)/M.vol.T;go=!M.recep&&pr>.8;}else go=!M.pose&&PLANCHE-M.d<.5&&M.d<=PLANCHE;}
 if(E.relais&&M.leg<3)go=Math.abs(M.d-ZONES[M.leg])<2;
 const sB=RAC.querySelector('.sau');sB.classList.toggle('go',go);const lbB=sB.querySelector('b');if(lbB)lbB.textContent=E.relais?'TÉMOIN':E.long&&M.vol?'RÉCEPTION':'SAUT';
 const fb=RAC.querySelector('.fin2');fb.style.visibility=E.long?'hidden':'';fb.classList.toggle('on',!E.long&&C.phase==='course'&&!C.finish&&E.d-M.d<=E.fin&&M.fini===null&&(!E.relais||M.leg===3));fb.classList.toggle('pris',C.finish);
 const aide=RAC.querySelector('.aide');aide.textContent=E.long?(C.phase==='elan'?'Tape G / D pour prendre ton élan':M.vol?(M.recep?'':'Réception : appuie juste avant le sable'):!M.pose&&M.reac!==null?'SAUT pile sur la planche blanche':''):
  C.phase==='presentation'||C.phase==='marques'||C.phase==='prets'?'Ne touche rien avant le coup de pistolet…':C.phase==='course'&&M.reac===null?'GO ! Tape G / D en rythme':E.relais&&M.leg<3&&ZONES[M.leg]-M.d<14&&M.fini===null?'TÉMOIN dans la zone jaune':'';}

/* --- les résultats --- */
/* le classement : chaque athlète, sa marque (temps, ou meilleur saut à la longueur) */
function classer(dq){const E=C.E,M=C.moi;
 if(E.long){for(const a of C.A)a.best=a.moi?(C.marques.length?Math.max(...C.marques):-1):Math.max(...a.marks);
  const ord=C.A.slice().sort((a,b)=>b.best-a.best);return {ord,pl:ord.indexOf(M)+1,perf:M.best};}
 const parti=C.t-C.tPan>.5;for(const a of C.A)if(a.fini===null)a.fini=parti?(C.t-C.tPan)+(E.d-a.d)/Math.max(4,a.v||7):null;
 const ord=C.A.slice().sort((a,b)=>(a.fini===null?1e9:a.fini)-(b.fini===null?1e9:b.fini));return {ord,pl:dq?7:ord.indexOf(M)+1,perf:M.fini};}
function resultats(dq){if(!C||C.res)return;const E=C.E,M=C.moi;SON.foule(0);
 const {ord,pl,perf}=classer(dq);const ok=!dq&&(!E.long||perf>0);
 const venteux=C.vent!==null&&C.vent>2;
 const rec=record(C.ep),neuf=ok&&!venteux&&mieuxQue(C.ep,perf,rec);
 if(neuf){try{if(!e.chronos||typeof e.chronos!=='object')e.chronos={};e.chronos['ath_'+C.ep]={t:Math.round(perf*100)/100};}catch(x){}}
 AVANT=bestNiv();let monte=false;if(ok&&pl===1&&C.nv<7){try{if(!e.athNiv||typeof e.athNiv!=='object')e.athNiv={};e.athNiv[C.ep]=C.nv+1;monte=true;}catch(x){}}
 /* les médailles, et la photo rangée dans la vitrine */
 const med=ok&&pl<=3?['or','argent','bronze'][pl-1]:null;
 if(med){try{if(!e.athMed||typeof e.athMed!=='object')e.athMed={};e.athMed[med]=(e.athMed[med]|0)+1;}catch(x){}
  try{localStorage.removeItem('bd_athAlbum');}catch(x){}
  if(false){try{const L=JSON.parse(localStorage.getItem('bd_athAlbum')||'[]');L.unshift({ep:C.ep,v:Math.round(perf*100)/100,pl,d:Date.now(),img:C.photoImg});while(L.length>12)L.pop();localStorage.setItem('bd_athAlbum',JSON.stringify(L));}catch(x){}}}
 try{sauver();}catch(x){}
 /* le record du stade : le meilleur de tous les joueurs */
 const ST=window.ATH_STADE,stade=ST&&ST[C.ep],stadeBat=ok&&!venteux&&ST&&(!stade||mieuxQue(C.ep,E.long?perf*100:Math.round(perf*100),stade.v));
 C.res={pl,ord,perf,dq,neuf,monte,med,rec,venteux,stadeBat};
 if(med){C.phase='podium';C.tp=0;C.ola=0;C.conf=[];C.remis=0;RAC.classList.add('cere');return;}
 carte();}
function finPodium(){if(!C||C.phase!=='podium'||C.tp<CERE.fin)return;C.phase='fini';RAC.classList.remove('cere');carte();}
function carte(){const E=C.E,M=C.moi,{pl,ord,perf,dq,neuf,monte,med,rec,venteux,stadeBat}=C.res;
 const MED={or:'#f5c430',argent:'#d8dce2',bronze:'#d0884a'};
 const medaille=med?'<svg viewBox="0 0 14 18" width="56" shape-rendering="crispEdges"><path d="M3 0h3v6H3zM8 0h3v6H8z" fill="#1f5fa8"/><path d="M5 0h1v6H5zM8 0h1v6H8z" fill="#e84a3a"/><rect x="3" y="6" width="8" height="1" fill="#2a2016"/><rect x="2" y="7" width="10" height="10" fill="#2a2016"/><rect x="3" y="8" width="8" height="8" fill="'+MED[med]+'"/><rect x="4" y="9" width="3" height="2" fill="#fff" opacity=".6"/><rect x="6" y="11" width="2" height="3" fill="#2a2016" opacity=".35"/></svg>':'';
 const titre=dq?'Disqualifié':pl===1?'Victoire !':pl<=3?'Sur le podium !':pl+'e place';
 const d=document.createElement('div');d.className='res';
 d.innerHTML='<div class="c"><small>'+E.nom.toUpperCase()+' · '+NIVEAUX[C.nv].toUpperCase()+(C.vent!==null?' · VENT '+(C.vent>0?'+':'')+C.vent.toFixed(1):'')+'</small><div class="med">'+(dq?'🚫':medaille||'🏃')+'</div>'+
  '<h2>'+titre+'</h2>'+
  (dq?'<p class="t">'+(E.relais&&C.faux<2?'Le témoin est passé hors de la zone.':'Deux faux départs : le juge ne pardonne pas.')+'</p>':
   '<p class="t">'+fm(C.ep,perf)+(neuf?' <b>· record perso !</b>':rec?' · record '+fm(C.ep,rec):'')+'</p>')+
  (venteux&&!dq?'<p class="vt">Vent +'+C.vent.toFixed(1)+' m/s : au-delà de +2,0, la perf n’est pas homologuée (ni record, ni classement).</p>':'')+
  (stadeBat?'<div class="std">★ RECORD DU STADE ★<span>Ton nom s’affiche sur le grand écran.</span></div>':'')+
  (C.photoImg&&med?'<div class="ph"><img src="'+C.photoImg+'"><span>📸 Photo rangée dans ta vitrine, aux vestiaires</span></div>':'')+
  '<div class="cl">'+ord.map((a,i)=>'<div class="'+(a.moi?'moi':'')+'"><span>'+(i+1)+'</span><b>'+(a.moi?(E.relais?'Ton équipe':'Toi'):a.nom)+'</b><em>'+(a.moi&&dq?'DQ':!E.long&&a.fini===null?'—':fm(C.ep,E.long?a.best:a.fini))+'</em></div>').join('')+'</div>'+
  '<div class="gen">Classement général : <b>…</b></div>'+
  '<div class="paie"><span>PRIME DE COURSE</span><b>…</b></div>'+
  (monte?'<div class="up"><b>⬆ Catégorie '+NIVEAUX[C.nv+1]+'</b><span>Adversaires plus forts au '+E.nom+'.'+(meilleur(C.nv+1)&&DEBLOQUE[C.nv+1]?' Débloqué aux vestiaires : '+DEBLOQUE[C.nv+1]+' !':'')+'</span></div>':
   (!dq&&pl>1&&C.nv<7?'<p class="up2">Gagne pour passer en catégorie <b>'+NIVEAUX[C.nv+1]+'</b>'+(DEBLOQUE[C.nv+1]?' et débloquer '+DEBLOQUE[C.nv+1]:'')+'.</p>':''))+
  '<button class="b1">'+(E.long?'Nouveau concours':'Recourir')+'</button><button class="b2">Retour au stade</button></div>';
 RAC.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle(C.ep);};d.querySelector('.b2').onclick=fermer;
 /* on envoie la perf au classement général (si elle est homologuée), puis on affiche le rang */
 const gen=d.querySelector('.gen b');const ep=C.ep,nvC=C.nv;
 (async()=>{let r=null;try{const v=E.long?Math.round(perf*100):Math.round(perf*100);
   if(!dq&&!venteux&&(!E.long||perf>0)&&typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc('athle_record',{p_epreuve:ep,p_perf:v});r=q.data;}
   if(!r||!r.rang){if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc('athle_classement',{p_epreuve:ep});if(q.data&&q.data.moi)r={rang:q.data.moi.rang,total:q.data.total};}}
   if(stadeBat&&window.ATH_STADE){window.ATH_STADE[ep]={p:'Toi',v};}}catch(x){}
  gen.textContent=r&&r.rang?r.rang+(r.rang===1?'er':'e')+' sur '+r.total:venteux?'perf non homologuée':'pas encore classé';
  /* la prime : versée par le serveur selon la place et la catégorie (dégressive après 12 courses dans la journée) */
  const pb=d.querySelector('.paie b');let q=null;
  try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const z=await sb.rpc('athle_prime',{p_epreuve:ep,p_place:dq?7:pl,p_nv:nvC,p_record:!!neuf,p_stade:!!stadeBat});q=z.data;}}catch(x){}
  if(q&&q.ok){const eu=Math.floor(q.gain/100);pb.innerHTML='+'+eu.toLocaleString('fr-FR')+' € · +'+q.xp+' XP'+(q.facteur<1?'<small> (fatigue du jour ×'+String(Math.round(q.facteur*100)/100).replace('.',',')+')</small>':'');
   if(typeof q.euros==='number'){try{e.euros=q.euros;sauver();}catch(x){}try{majHaut();}catch(x){}}try{lireNiveau(false);}catch(x){}}
  else if(q&&q.erreur==='trop rapide')pb.textContent='—';else pb.parentNode.remove();})();}
/* LA CÉRÉMONIE : le podium au milieu du stade, les trois premiers médaillés, les flashs de la tribune */
/* LES VRAIS BRAS LEVÉS : on dessine le sprite de face à part, on découpe ses deux bras (les pixels
   hors du torse, de l'épaule à la main), puis on les recolle retournés autour de l'épaule : ce sont
   exactement les bras du personnage, main en haut. */
const BRAS={};function brasLeves(ap){const k=JSON.stringify(ap);if(BRAS[k])return BRAS[k];
 const c=document.createElement('canvas');c.width=48;c.height=84;const q=c.getContext('2d');q.imageSmoothingEnabled=false;try{personne(q,24,76,ap,'bas',0,false);}catch(z){}
 const D=q.getImageData(0,0,48,84),W=48,src=new Uint8ClampedArray(D.data),ys=76-34;
 for(let y=76-35;y<76-16;y++)for(let x=0;x<48;x++){const dx=x-24;if(dx<-5||dx>4){const i=(y*W+x)*4;D.data[i+3]=0;}}
 for(let y=ys+1;y<76-16;y++)for(let x=0;x<48;x++){const dx=x-24;if(!(dx<-5||dx>4))continue;const i=(y*W+x)*4;if(src[i+3]<20)continue;
  const y2=2*ys-y,x2=x+(dx<0?-1:1);if(y2<0)continue;const j=(y2*W+x2)*4;D.data[j]=src[i];D.data[j+1]=src[i+1];D.data[j+2]=src[i+2];D.data[j+3]=src[i+3];}
 q.putImageData(D,0,0);BRAS[k]=c;return c;}
/* LA CÉRÉMONIE DES MÉDAILLES, en quatre temps :
   1. la nuit tombe, les trois médaillés entrent en marchant et montent sur leur marche ;
   2. bronze, argent, puis or : chaque médaille descend sur la poitrine, sous un projecteur ;
   3. le vainqueur lève les bras, la foule se lève, confettis et flashs ;
   4. le bouton CONTINUER s'allume. */
const CERE={entree:0,montee:2.3,bronze:2.9,argent:3.7,or:4.5,joie:5,fin:5.8,auto:14};
function podium(g,Q){const {W2,H2,u,yT,yM,yP,yBas}=Q;const {ord}=C.res;const T=C.tp,E=C.E;
 const fmA=a=>E.long?fm(C.ep,a.best):fm(C.ep,a.fini);
 /* le décor : le stade de nuit */
 g.drawImage(BG,0,0);tuile(g,T>CERE.joie&&Math.floor(T*3)%2?FOULE2:FOULE,0,yT,W2);g.fillStyle='#10162a';g.fillRect(0,0,W2,yT);tuile(g,BACH,0,yM,W2);tuile(g,PISTE,0,yP,W2);
 g.fillStyle='rgba(6,10,26,'+Math.min(.74,.25+T*.6)+')';g.fillRect(0,0,W2,H2);
 const sc=Math.max(1,Math.round(H2*.19/62*4)/4),bw=Math.round(Math.min(W2*.29,70*sc)),bx=Math.round(W2/2),base=Math.round(yBas-4*u);
 const B={1:[bx,58*sc],2:[bx-bw,44*sc],3:[bx+bw,34*sc]};
 const tMed={3:CERE.bronze,2:CERE.argent,1:CERE.or};
 /* le tapis rouge devant le podium */
 g.fillStyle='#7a1c22';g.fillRect(bx-bw*1.6,base,bw*3.2,yBas-base+4*u);g.fillStyle='#9a2a30';g.fillRect(bx-bw*1.6,base,bw*3.2,2*u);
 /* les projecteurs : un par marche, allumés au moment de la médaille */
 g.save();g.globalCompositeOperation='lighter';
 for(const n of [3,2,1]){const [x,h]=B[n],dt=T-tMed[n]+.35;if(dt<0)continue;const a=Math.min(1,dt*2.5)*(n===1?.5:.32);
  const gr=g.createLinearGradient(0,yM,0,base);gr.addColorStop(0,'rgba(255,240,205,0)');gr.addColorStop(1,'rgba(255,236,195,'+a+')');g.fillStyle=gr;
  g.beginPath();g.moveTo(x-6*u,yM);g.lineTo(x+6*u,yM);g.lineTo(x+bw*.58,base-h);g.lineTo(x-bw*.58,base-h);g.fill();}
 g.restore();
 /* le podium : trois marches blanches, ombrées, le chiffre et la plaque du médaillé sur la face */
 g.fillStyle='rgba(0,0,0,.4)';g.fillRect(bx-bw*1.5,base,bw*3,4*u);
 for(const n of [2,1,3]){const [x,h]=B[n],x0=Math.round(x-bw/2),y0=Math.round(base-h),lit=T>tMed[n]-.35;
  g.fillStyle=lit?'#f4f1e8':'#9a978e';g.fillRect(x0,y0,bw,Math.round(h));
  g.fillStyle=lit?'#ffffff':'#aaa79e';g.fillRect(x0,y0,bw,Math.round(2*u));
  g.fillStyle=lit?'#d8d2c2':'#7e7b74';g.fillRect(x0,y0+Math.round(2*u),bw,Math.round(2*u));g.fillRect(x0+bw-Math.round(3*u),y0,Math.round(3*u),Math.round(h));
  g.fillStyle='#1f5fa8';g.fillRect(x0,base-Math.round(5*u),bw,Math.round(5*u));
  g.fillStyle=lit?'#16213a':'#4a4a4a';g.font='900 '+Math.round(16*u)+'px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(n),x,y0+Math.round(13*u));
  const a=ord[n-1];if(a&&T>tMed[n]){const nm=a.moi?(E.relais?'Ton équipe':'Toi'):a.nom,al=Math.min(1,(T-tMed[n])*3);g.globalAlpha=al;
   g.font='800 '+Math.round(8.5*u)+'px ui-monospace,monospace';g.fillStyle=a.moi?'#b8860b':'#16213a';g.fillText(nm.length>13?nm.slice(0,12)+'.':nm,x,y0+Math.round(26*u));
   g.font='700 '+Math.round(8*u)+'px ui-monospace,monospace';g.fillStyle='#5a6478';g.fillText(fmA(a),x,y0+Math.round(36*u));g.globalAlpha=1;}}
 /* les trois médaillés : entrée en marchant depuis la gauche, montée sur la marche, de face */
 const file=[3,1,2];                       /* l'ordre de la file : le 3e ouvre la marche */
 for(const n of [2,3,1]){const a=ord[n-1];if(!a)continue;const ap=a.moi?Object.assign({},ARGS&&ARGS.ap||{},ARGS&&ARGS.kit||{}):(a.equipe?a.equipe[3]:a.ap);
  const [x,h]=B[n],rang=file.indexOf(n),dep=-30*u-rang*42*u,vit=W2*.42,tArr=(x-dep)/vit;
  let px,py,dir='bas',marche=false,pas=0;const t=T-CERE.entree;
  if(t<tArr){px=dep+vit*t;py=base;dir='droite';marche=true;pas=t*10;}
  else{const th=Math.min(1,(t-tArr)/.32);px=x;py=base-h*th-Math.sin(Math.PI*th)*9*sc;dir=th<1?'droite':'bas';}
  const joie=n===1&&T>CERE.joie,hop=joie?Math.abs(Math.sin((T-CERE.joie)*4.5))*4*sc:0;py=Math.round(py-hop);px=Math.round(px);
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(px,Math.round(dir==='bas'?base-h:base)+u,8*sc,2.2*sc,0,0,7);g.fill();
  g.save();g.translate(px,py);g.scale(sc,sc);g.imageSmoothingEnabled=false;
  if(joie)g.drawImage(brasLeves(ap),-24,-76);else{try{personne(g,0,0,ap,dir,pas,marche);}catch(z){}}
  /* la médaille descend sur la poitrine */
  if(T>tMed[n]){const k=Math.min(1,(T-tMed[n])*2.6),mc=['#f5c430','#d8dce2','#d0884a'][n-1],dy=Math.round((1-k)*-16);
   g.fillStyle='#1f5fa8';g.fillRect(-4,-36+dy,2,7);g.fillRect(2,-36+dy,2,7);g.fillStyle='#e84a3a';g.fillRect(-3,-36+dy,1,6);g.fillRect(3,-36+dy,1,6);
   g.fillStyle='#2a2016';g.fillRect(-3,-30+dy,6,6);g.fillStyle=mc;g.fillRect(-2,-29+dy,4,4);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(-2,-29+dy,2,1);
   if(T-tMed[n]<.45&&k>=1){const r=Math.round(3+(T-tMed[n])*18);g.fillStyle='rgba(255,255,225,'+(1-(T-tMed[n])/.45)+')';g.fillRect(-r,-27,2*r,1);g.fillRect(0,-27-r,1,2*r);}}
  g.restore();
  if(a.moi&&dir==='bas'){g.fillStyle='#ffd860';g.beginPath();g.moveTo(px-5*u,py-64*sc);g.lineTo(px+5*u,py-64*sc);g.lineTo(px,py-57*sc);g.fill();}}
 /* les flashs des photographes dans la tribune, de plus en plus nombreux */
 const nf=T<CERE.bronze?1:T<CERE.joie?4:11;for(let k=0;k<nf;k++){const ph=(T*1.9+hA(k,3,4))%1;if(ph<.1){const cy=Math.floor(T*1.9+hA(k,3,4));g.fillStyle='rgba(255,255,255,'+(1-ph/.1)+')';g.beginPath();g.arc(hA(k,cy,5)*W2,yT+hA(k,cy,6)*(yM-yT),(2+6*(1-ph/.1))*u,0,7);g.fill();}}
 /* les confettis avec la joie du vainqueur */
 if(T>CERE.joie&&T<CERE.joie+3.5&&C.conf.length<170)for(let k=0;k<4;k++)C.conf.push({x:Math.random()*W2,y:-8*u,vx:(Math.random()-.5)*36*u,vy:(48+Math.random()*64)*u,c:['#f5c430','#e84a3a','#ffffff','#3ac0e8','#7ee08a'][Math.floor(Math.random()*5)],r:Math.random()*6});
 for(const p of C.conf){p.x+=p.vx/60;p.y+=p.vy/60;p.r+=.1;g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),Math.round((2+Math.abs(Math.sin(p.r))*2)*u),Math.round(3*u));}C.conf=C.conf.filter(p=>p.y<H2);
 /* les sons */
 for(const n of [3,2,1])if(T>tMed[n]&&!(C.remis&(1<<n))){C.remis|=1<<n;try{SON.haie();}catch(z){}vib(15);}
 if(T>CERE.joie&&!(C.remis&1)){C.remis|=1;try{SON.fin();}catch(z){}vib([30,40,60]);}
 /* le bandeau du haut */
 const pl=C.res.pl,titre=pl===1?(E.relais?'Ton équipe championne !':'Médaille d’or !'):pl===2?'Médaille d’argent !':'Médaille de bronze !';
 const ty=Math.round(H2*.06),apT=Math.min(1,Math.max(0,(T-tMed[pl])*2));
 g.fillStyle='rgba(8,12,22,.82)';g.fillRect(0,ty,W2,Math.round(56*u));g.fillStyle='#e8c050';g.fillRect(0,ty,W2,Math.round(2*u));g.fillRect(0,ty+Math.round(54*u),W2,Math.round(2*u));
 g.textAlign='center';g.textBaseline='middle';g.fillStyle='#8ab0d8';g.font='900 '+Math.round(9.5*u)+'px ui-monospace,monospace';g.fillText('CÉRÉMONIE DES MÉDAILLES · '+E.nom.toUpperCase()+' · '+NIVEAUX[C.nv].toUpperCase(),W2/2,ty+Math.round(14*u));
 g.globalAlpha=apT;g.fillStyle='#ffd860';g.font='900 '+Math.round(21*u)+'px Georgia,serif';g.fillText(titre,W2/2,ty+Math.round(36*u));g.globalAlpha=1;
 const cb=RAC&&RAC.querySelector('.cnt button');if(cb){const pr=T>CERE.fin;if(cb.disabled===pr){cb.disabled=!pr;cb.textContent=pr?'CONTINUER':'Remise des médailles…';}}
 if(T>CERE.auto)finPodium();}

function choisir(eps){const d=document.createElement('div');d.className='res on';
 d.innerHTML='<div class="c"><small>LIGNE DE DÉPART</small><h2>Quelle course ?</h2>'+eps.map(k=>{const r=record(k);return '<button class="ch" data-k="'+k+'"><b>'+EP[k].nom+'</b><span>Catégorie '+NIVEAUX[niveau(k)]+(r?' · record '+fm(k,r):'')+'</span></button>';}).join('')+'<button class="b2">Retour</button></div>';
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
#crs .hd .ep{font:900 10px ui-monospace,monospace;letter-spacing:1.5px;color:#e8c050;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62vw}#crs .hd .chr{font:900 26px/1 ui-monospace,monospace;color:#fff;min-width:96px}
#crs .hd .pl{font:900 20px ui-monospace,monospace;color:#ffd860;background:#0f1830;border:2px solid #e8c050;border-radius:4px;padding:0 8px}
#crs .hd .x{margin-left:auto;width:38px;height:38px;border:2px solid #e8c050;border-radius:4px;background:#0f1830;color:#ffd860;font:900 16px ui-monospace,monospace}
#crs .info{flex:none;display:flex;align-items:center;gap:10px;padding:6px 12px;background:#0f1830}
#crs .souf{flex:0 0 34%;height:12px;background:#2e3a4e;border:2px solid #0a1020;position:relative}#crs .souf i{display:block;height:100%;width:100%;background:#7ee08a;transition:width .1s}
#crs .souf:before{content:'SOUFFLE';position:absolute;left:0;top:-12px;font:800 8px ui-monospace,monospace;letter-spacing:1.5px;color:#8ab0d8}
#crs .mini{flex:1;height:4px;background:#3a4458;position:relative;border-radius:2px}#crs .mini b{position:absolute;right:-2px;top:-6px;width:3px;height:16px;background:repeating-linear-gradient(#fff 0 3px,#1a1a1e 3px 6px)}
#crs .mini i{position:absolute;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#c8d4e4}#crs .mini i.m{z-index:2;width:12px;height:12px;margin:-6px 0 0 -6px;background:#ffd860;box-shadow:0 0 0 2px #0a1020}
#crs .scene{flex:1;min-height:0;position:relative}#crs .scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#crs .aide{position:absolute;left:0;right:0;bottom:6px;text-align:center;font:800 13px ui-monospace,monospace;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5);pointer-events:none}
#crs .cmd{position:relative}#crs .cnt{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:12px 18px calc(14px + env(safe-area-inset-bottom))}#crs.cere .cnt{display:flex}#crs.cere .cmd>*:not(.cnt){visibility:hidden}
#crs .cmd .cnt button{all:unset;box-sizing:border-box;width:100%;max-width:420px;text-align:center;background:#16213a;color:#ffd860;border:4px solid #e8c050;box-shadow:0 0 0 3px #16213a,0 6px 0 #0a0f1c;border-radius:6px;padding:20px;font:900 20px ui-monospace,monospace;letter-spacing:3px;cursor:pointer;visibility:visible}#crs .cmd .cnt button:disabled{color:#8ab0d8;border-color:#3a4a6a;font-size:14px;letter-spacing:1px}#crs.cere .hd .pl,#crs.cere .info{visibility:hidden}
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
#crs .res .vt{margin:0 0 8px;font:700 11.5px ui-monospace,monospace;color:#8a5a1a;background:#fff3d8;border-radius:4px;padding:6px}
#crs .res .std{margin:0 0 10px;background:#16213a;color:#ffd860;border:3px solid #e8c050;border-radius:4px;padding:8px;font:900 16px ui-monospace,monospace;letter-spacing:2px;animation:crsP .6s ease-in-out infinite}#crs .res .std span{display:block;font:700 11px ui-monospace,monospace;letter-spacing:0;color:#fff}
#crs .res .ph{margin:0 0 10px}#crs .res .ph img{width:100%;border:3px solid #16213a;border-radius:3px;display:block;image-rendering:pixelated}#crs .res .ph span{display:block;margin-top:4px;font:700 11.5px ui-monospace,monospace;color:#2e5a3a}
#crs .res .paie{margin:6px 0 0;display:flex;justify-content:space-between;align-items:center;gap:8px;background:#16213a;border-radius:4px;padding:8px 10px;font:900 10px ui-monospace,monospace;letter-spacing:1.5px;color:#8ab0d8}#crs .res .paie b{font:900 15px ui-monospace,monospace;letter-spacing:0;color:#ffd860;text-align:right}#crs .res .paie small{display:block;font:700 10px ui-monospace,monospace;color:#8ab0d8}
#crs .res .gen{margin:8px 0 0;font:700 13px ui-monospace,monospace;color:#16213a;background:#eae2cc;border-radius:4px;padding:6px}#crs .res .gen b{color:#c0392b}
#crs .res .up2{margin:10px 0 0;font:700 12px ui-monospace,monospace;color:#6a5a40}
#crs .res button{display:block;width:100%;margin-top:10px;border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:1px}
#crs .res .b1{background:#16213a;color:#ffd860;border:3px solid #e8c050}#crs .res .b2{background:#fff;color:#16213a;border:3px solid #16213a}
#crs .res .ch{background:#fff;border:3px solid #16213a;color:#16213a;text-align:left;box-shadow:0 4px 0 #16213a}#crs .res .ch b{display:block;font:900 20px Georgia,serif}#crs .res .ch span{font:700 12px ui-monospace,monospace;color:#6a5a40}`;

window.ouvrirCourse=function(eps,args){if(RAC)return;ARGS=args||{};eps=[].concat(eps);
 if(!document.getElementById('crsCss')){const s=document.createElement('style');s.id='crsCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='crs';RAC=d;const haies=eps.some(k=>EP[k].haies||EP[k].long||EP[k].relais);
 d.innerHTML='<div class="hd"><div><div class="ep">PISTE MUNICIPALE</div><div class="chr">0.00</div></div><span class="pl">–</span><button class="x">✕</button></div>'+
  '<div class="info"><div class="souf"><i></i></div><div class="mini"></div></div>'+
  '<div class="scene"><canvas></canvas><div class="aide"></div></div>'+
  '<div class="cmd"><div class="cnt"><button disabled>Remise des médailles…</button></div><button class="t g">'+ICO_G+'<span>GAUCHE</span></button><div class="mid"><button class="sau"'+(haies?'':' style="display:none"')+'>'+ICO_H+'<b>SAUT</b></button><button class="fin2">'+ICO_F+'FINISH</button></div><button class="t d">'+ICO_D+'<span>DROIT</span></button></div>';
 document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');
 const bind=(sel,f)=>{const b=d.querySelector(sel);b.addEventListener('touchstart',ev=>{ev.preventDefault();b.classList.add('ap');f();},{passive:false});
  const up=ev=>{ev.preventDefault();b.classList.remove('ap');};b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});
  b.addEventListener('mousedown',()=>{b.classList.add('ap');f();});b.addEventListener('mouseup',()=>b.classList.remove('ap'));};
 d.addEventListener('touchstart',ev=>{if(C&&C.phase==='podium'&&!ev.target.closest('.x'))finPodium();},{passive:true});d.addEventListener('mousedown',ev=>{if(C&&C.phase==='podium'&&!ev.target.closest('.x'))finPodium();});
 bind('.g',()=>tap('g'));bind('.d',()=>tap('d'));bind('.sau',saut);bind('.fin2',finishBtn);
 d.querySelector('.x').onclick=fermer;
 requestAnimationFrame(()=>{d.classList.add('on');cadrer();if(eps.length>1){nouvelle(eps[0]);C.phase='attente';choisir(eps);}else nouvelle(eps[0]);
  /* la sauteuse s'affiche seulement pour les haies */
  const maj=()=>{if(!RAC)return;const s=RAC.querySelector('.sau');if(C){s.style.display=C.H.length||C.E.long||C.E.relais?'':'none';const lb=s.querySelector('b');if(lb)lb.textContent=C.E.relais?'TÉMOIN':C.E.long&&C.moi.vol?'RÉCEPTION':'SAUT';}setTimeout(maj,300);};maj();});
 setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 window.__CRS={C:()=>C};
 RAF=requestAnimationFrame(boucle);};
})();
