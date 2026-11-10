/* =====================================================================
   POSTE N°2 — LE PORTIQUE (port qui travaille). Un écran à part (#ptq).

   On est grutier. Vu de côté : le navire à gauche, le quai à droite.
   - Glisser le doigt dans la scène : le chariot roule sur la flèche.
   - La glissière à droite : on descend / on remonte le spreader.
   - Le bouton VERROUS : verrouiller le conteneur quand le spreader est
     bien posé dessus, le déverrouiller une fois posé sur le camion.

   Le conteneur pend au câble et se balance (plus le câble est long,
   plus c'est lent et ample). Le mistral souffle par rafales. On cogne
   si on descend trop vite ou de travers, ou si on frotte une pile.

   L'escale : chaque camion attend un conteneur précis (son numéro est
   écrit sur le conteneur). S'il est sous un autre, il faut d'abord
   déplacer celui du dessus sur une autre pile. Chaque pose est notée :
   précision, douceur, temps. Gratuit pour l'instant.
   ===================================================================== */
(()=>{
const vib=x=>{try{navigator.vibrate&&navigator.vibrate(x);}catch(_){}};
/* ---------- LE SON ---------- */
let AC=null,MOT=null;
const ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(x){}}if(AC&&AC.state==='suspended')AC.resume();return AC;};
function note(f,t0,d,type,vol,f2){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,a.currentTime+t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+t0+d);
  g.gain.setValueAtTime(vol||.05,a.currentTime+t0);g.gain.exponentialRampToValueAtTime(.0005,a.currentTime+t0+d);o.connect(g).connect(a.destination);o.start(a.currentTime+t0);o.stop(a.currentTime+t0+d+.02);}
function bruit(d,f,vol){const a=ac();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=f;g.gain.value=vol;s.connect(fl).connect(g).connect(a.destination);s.start();}
const SON={
  verrou(){note(900,0,.04,'square',.05);note(420,.04,.08,'square',.06);bruit(.08,3000,.15);},
  pose(v){bruit(.25,400+v*80,.35);note(70,0,.25,'triangle',.12);},
  cogne(){bruit(.4,900,.6);note(60,0,.35,'sawtooth',.1,40);note(1800,0,.06,'square',.03);},
  klaxon(){note(370,0,.2,'square',.05);note(370,.28,.35,'square',.05);},
  bien(){note(660,0,.09,'square',.04);note(880,.08,.09,'square',.04);note(1320,.16,.18,'square',.04);},
  moteur(v){const a=ac();if(!a||!isFinite(v))return;if(!MOT){const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type='sawtooth';f.type='lowpass';f.frequency.value=300;g.gain.value=0;o.connect(f).connect(g).connect(a.destination);o.start();MOT={o,g};}
    MOT.o.frequency.setTargetAtTime(48+v*70,a.currentTime,.08);MOT.g.gain.setTargetAtTime(Math.min(.05,v*.06),a.currentTime,.1);},
  stop(){if(MOT){try{MOT.g.gain.value=0;MOT.o.stop();}catch(x){}MOT=null;}}};

/* ---------- LE MONDE (unités : 100 de large) ---------- */
const RAIL=12,SOL=88,PONT=80,CW=10.4,CH=4.6,QX=60;
const BAIES=[9,20.5,32,43.5];         /* les piles du navire */
const QUAI_PLACES=[67,80];             /* deux voies de camion */
const COUL=['#c8402a','#2a6ab8','#3a8a5a','#e8a020','#7a3a6a','#2a8a9a','#d86a2a','#5a5a6a'];
const NOMS=['MRSU','CMAU','MEDU','TGHU','OOLU','ZIMU'];
let RAC=null,CV=null,G=null,J=null,RAF=0,DPR=1;

function nouvelleEscale(n){
  /* les piles du navire : 3 à 4 de haut ; quelques conteneurs portent un numéro de camion */
  const piles=BAIES.map(()=>[]);let id=0;
  for(let b=0;b<4;b++){const h=3+(Math.random()<.5?1:0);for(let k=0;k<h;k++)piles[b].push({id:id++,c:COUL[(Math.random()*COUL.length)|0],nom:NOMS[(Math.random()*NOMS.length)|0]+' '+(100+((Math.random()*899)|0))});}
  const tous=piles.flat();const cibles=[];
  for(let i=0;i<n;i++){let p;do{p=tous[(Math.random()*tous.length)|0];}while(cibles.includes(p));cibles.push(p);}
  return {piles,cibles};}
function demarrer(){const E=nouvelleEscale(7);
  J={tx:24,tv:0,cible:24,L:14,Lc:14,ang:0,av:0,porte:null,verrou:false,piles:E.piles,file:E.cibles.slice(),camions:[],t0:performance.now(),fini:false,
     notes:[],cognes:0,vent:0,rafale:0,prochaineRafale:performance.now()+6000,shake:0,parts:[],msg:'',msgT:0,radio:[],seat:null,contact:null,dernierY:0,vy:0};
  ajouterCamion(0);setTimeout(()=>{if(J&&!J.fini)ajouterCamion(1);},2500);
  radio('Chef : Bienvenue en cabine ! Le premier camion arrive.');}
function ajouterCamion(v){if(!J.file.length)return;if(J.camions.some(c=>c.voie===v))return;const cont=J.file.shift();
  J.camions.push({voie:v,x:120,xc:QUAI_PLACES[v],etat:'arrive',cont,charge:null,patience:1,t:performance.now()});}
function radio(t){J.radio.unshift({t,at:performance.now()});J.radio=J.radio.slice(0,2);}

/* ---------- LES SURFACES : où peut se poser le bas de la charge ---------- */
function hautPile(b){return PONT-J.piles[b].length*CH;}
function surfaces(){const S=[];
  BAIES.forEach((x,b)=>S.push({x0:x-CW/2,x1:x+CW/2,y:hautPile(b),type:'pile',b}));
  for(const c of J.camions)if(c.etat==='attend'||c.etat==='arrive'||c.etat==='part'){const y=c.charge?SOL-3.2-CH:SOL-3.2;S.push({x0:c.x-CW/2,x1:c.x+CW/2,y,type:c.charge?'plein':'camion',c});}
  S.push({x0:QX,x1:100,y:SOL,type:'sol'});S.push({x0:0,x1:QX-4,y:PONT+2,type:'eau'});
  return S;}

/* ---------- UN PAS DE SIMULATION ---------- */
function pas(dt){const now=performance.now();
  /* le chariot : il suit le doigt, accélération limitée */
  const ax=Math.max(-40,Math.min(40,(J.cible-J.tx)*10-J.tv*6));J.tv=Math.max(-18,Math.min(18,J.tv+ax*dt));J.tx=Math.max(4,Math.min(96,J.tx+J.tv*dt));
  /* le treuil : le câble suit la glissière, vitesse limitée */
  const dL=Math.max(-9*dt,Math.min(9*dt,J.Lc-J.L));let L=J.L+dL;
  /* le mistral, par rafales */
  if(now>J.prochaineRafale){J.rafale=(Math.random()<.5?-1:1)*(1.2+Math.random()*1.8);J.prochaineRafale=now+7000+Math.random()*7000;radio(J.rafale>0?'Chef : Attention, rafale de mistral !':'Chef : Ça souffle, tiens bien ta charge !');}
  J.vent+=(J.rafale-J.vent)*dt*.8;J.rafale*=Math.pow(.6,dt);
  /* le pendule */
  const m=J.porte?1.6:1,Lp=Math.max(3,L);
  J.av+=(-(9.8/Lp)*Math.sin(J.ang)-(ax/Lp)*Math.cos(J.ang)+J.vent*.06/m-J.av*(J.porte?.25:.45))*dt;J.ang+=J.av*dt;J.ang=Math.max(-.9,Math.min(.9,J.ang));
  /* la charge : spreader (+ conteneur), son bas, et le contact */
  const bx=J.tx+Math.sin(J.ang)*L,haut=RAIL+Math.cos(J.ang)*L,bas=haut+1.2+(J.porte?CH:0);
  J.vy=(bas-J.dernierY)/Math.max(dt,.001);J.dernierY=bas;
  J.seat=null;let bloque=false;
  for(const s of surfaces()){const ov=Math.min(bx+CW/2,s.x1)-Math.max(bx-CW/2,s.x0);if(ov<=.4)continue;
    if(bas>s.y){/* on touche : on remonte la charge jusqu'à la surface */
      const enfonce=bas-s.y;L-=enfonce/Math.max(.3,Math.cos(J.ang));bloque=true;
      const centre=Math.abs(bx-(s.x0+s.x1)/2),plat=Math.abs(J.ang)<.08;
      if(J.vy>7||(!plat&&J.vy>2.5)||(ov<CW*.6&&J.vy>2)){choc(bx,s.y,Math.min(1,J.vy/12));}
      if(s.type!=='eau'&&s.type!=='sol')J.seat={s,centre,plat,vy:J.vy};
      J.av*=.5;}
    else if(s.type==='pile'&&bas>s.y-1.2&&Math.abs(J.tv)>2&&ov<CW*.5&&bas>s.y-.2){choc(bx,s.y,.5);J.av-=Math.sign(J.tv)*.6;}}
  J.L=Math.max(2,L);if(!bloque&&J.Lc<J.L-.3)J.Lc=Math.max(J.Lc,2);
  if(J.L<2.1)J.L=2.1;
  /* les camions */
  for(const c of J.camions){if(c.etat==='arrive'){c.x+=(c.xc-c.x)*Math.min(1,dt*1.8);if(Math.abs(c.x-c.xc)<.2){c.x=c.xc;c.etat='attend';c.t=now;SON.klaxon();radio('Chauffeur : Je viens chercher le '+c.cont.nom+' !');}}
    else if(c.etat==='attend'&&!c.charge){c.patience=Math.max(0,1-(now-c.t)/70000);if(c.patience<=0&&!c.klax){c.klax=1;SON.klaxon();radio('Chauffeur : Oh, ça vient ? J’ai pas que ça à faire !');}}
    else if(c.etat==='part'){c.x+=dt*(14+(c.x-c.xc)*1.5);}}
  for(let i=J.camions.length-1;i>=0;i--)if(J.camions[i].x>130){const v=J.camions[i].voie;J.camions.splice(i,1);setTimeout(()=>{if(J&&!J.fini)ajouterCamion(v);},1200);}
  /* les étincelles */
  for(const p of J.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;p.v-=dt;}J.parts=J.parts.filter(p=>p.v>0);
  J.shake*=Math.pow(.02,dt);
  if(dt>0)SON.moteur(Math.min(1,Math.abs(J.tv)/14+Math.abs(dL/dt)/12));
  if(!J.file.length&&!J.camions.length&&!J.porte&&!J.fini)finir();}
function choc(x,y,f){if(performance.now()-(J.dernierChoc||0)<350)return;J.dernierChoc=performance.now();J.cognes++;J.shake=Math.max(J.shake,1.2+f*2.5);SON.cogne();vib([30,20,50]);
  for(let i=0;i<14;i++)J.parts.push({x,y,vx:(Math.random()-.5)*30,vy:-Math.random()*20,v:.4+Math.random()*.4});
  radio(ALEA(['Chef : Doucement avec la tôle !','Chef : Oh ! On n’est pas aux autos-tamponneuses !','Chef : Ça cogne, ça ! Doucement !']));}
const ALEA=L=>L[(Math.random()*L.length)|0];

/* ---------- LES VERROUS ---------- */
function verrous(){if(!J||J.fini)return;ac();
  if(!J.porte){const s=J.seat;
    if(!s||s.s.type!=='pile'){aide('Pose le spreader bien à plat sur un conteneur');vib(20);return;}
    const P=J.piles[s.s.b];if(!P.length)return;if(s.centre>1.6||!s.plat){aide('Pas centré : recentre-toi sur le conteneur');vib(20);return;}
    J.porte=P.pop();SON.verrou();vib(12);aide('Verrouillé ! Remonte doucement');J.Lc=Math.max(3,J.L-3);
    const att=J.camions.find(c=>c.etat==='attend'&&!c.charge&&c.cont===J.porte);
    if(!att&&J.camions.some(c=>c.cont===J.porte)===false&&!J.file.includes(J.porte))radio('Chef : Celui-là, pose-le sur une autre pile pour dégager.');
    return;}
  /* déverrouiller : sur un camion ou sur une pile */
  const s=J.seat;if(!s){aide('Pose d’abord le conteneur');vib(20);return;}
  if(s.s.type==='camion'){const c=s.s.c;
    if(c.cont!==J.porte){aide('Mauvais conteneur ! Ce camion attend le '+c.cont.nom);SON.klaxon();vib([30,30,30]);radio('Chauffeur : C’est pas le mien, ça !');return;}
    if(s.centre>2.4){aide('Pas aligné sur le châssis');vib(20);return;}
    const prec=Math.max(0,1-s.centre/2.4),dou=Math.max(0,1-Math.max(0,J.douceur||s.vy)/7),tps=Math.max(0,1-(performance.now()-c.t)/60000);
    const note_=Math.round(prec*40+dou*35+tps*25);J.notes.push(note_);c.charge=J.porte;J.porte=null;c.etat='part';c.xc=c.x;SON.verrou();setTimeout(()=>SON.bien(),120);vib(16);
    const g=note_>=85?'PARFAIT':note_>=70?'TRÈS BIEN':note_>=50?'BIEN':'OK';J.pop={t:g,n:note_,at:performance.now(),x:c.x};
    radio(note_>=85?'Chef : Ça c’est du travail de pro !':note_>=60?'Chauffeur : Merci chef, bonne journée !':'Chef : Posé… on va dire.');J.Lc=Math.max(3,J.L-4);return;}
  if(s.s.type==='pile'){if(s.centre>2||!s.plat){aide('Mal posé : recentre sur la pile');vib(20);return;}if(J.piles[s.s.b].length>=6){aide('Pile trop haute');return;}
    J.piles[s.s.b].push(J.porte);J.porte=null;SON.verrou();vib(12);aide('Déplacé. Va chercher le bon conteneur');J.Lc=Math.max(3,J.L-3);return;}
  aide('Pose-le sur un camion ou sur une pile');}
function aide(t){J.msg=t;J.msgT=performance.now();}

/* ---------- LE DESSIN ---------- */
let Zg=y=>y;
const VUE=62;let CAM=0;
function dessiner(){const Z=y=>y*(CV.width/VUE);const W=CV.width,H=CV.height,g=G,u=W/VUE,v=u,t=performance.now()/1000,OY=Math.min(H*.92-SOL*v,H*.04-(RAIL-14)*v+Math.max(0,H*.88-(SOL-RAIL+14)*v)*.5);
  CAM+=(Math.max(0,Math.min(100-VUE,J.tx-VUE/2))-CAM)*.12;
  const sx=(J.shake?(Math.random()-.5)*J.shake*u*.6:0),sy=(J.shake?(Math.random()-.5)*J.shake*v*.6:0);
  g.save();g.clearRect(0,0,W,H);{const gr=g.createLinearGradient(0,0,0,OY+PONT*v);gr.addColorStop(0,'#5a9ad0');gr.addColorStop(.7,'#f2c8a0');gr.addColorStop(1,'#f6dcc0');g.fillStyle=gr;g.fillRect(0,0,W,H);}g.translate(sx-CAM*u,sy);
  const X=x=>x*u,Y=y=>OY+y*v;Zg=y=>y*v;
  /* le ciel de fin d'après-midi, le soleil, la ville au loin */
  g.fillStyle='rgba(255,236,190,.9)';g.beginPath();g.arc(X(72),Y(30),5*v,0,7);g.fill();
  g.fillStyle='#b8a0a8';for(let i=0;i<14;i++){const hx=X(52+i*4),hh=Z(4+((i*37)%7));g.fillRect(hx,Y(PONT)-hh-Z(6),X(3.6),hh);}
  g.fillStyle='#a88e98';g.fillRect(X(84),Y(PONT)-Z(30),X(3.4),Z(24));
  /* la mer */
  const gm=g.createLinearGradient(0,Y(PONT-6),0,H);gm.addColorStop(0,'#3a7aa0');gm.addColorStop(1,'#1a4a6a');g.fillStyle=gm;g.fillRect(-20,Y(PONT-6),X(QX)+20,H);
  for(let i=0;i<22;i++){const x=((i*13.7+t*(2+i%3))%(QX+10))-5,y=PONT-4+((i*7)%14);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(X(x),Y(y),X(2.4),1.5);}
  /* le navire */
  g.fillStyle='#1f2a3a';g.beginPath();g.moveTo(X(1),Y(PONT));g.lineTo(X(QX-3),Y(PONT));g.lineTo(X(QX-7),Y(PONT+9));g.lineTo(X(4),Y(PONT+9));g.closePath();g.fill();
  g.fillStyle='#8a2a2a';g.fillRect(X(4),Y(PONT+6),X(QX-11),Z(3));g.fillStyle='#f6f1e6';g.font='bold '+Math.round(Z(2.2))+'px "Helvetica Neue",Arial';g.textAlign='left';g.fillText('MEDITERRANÉE EXPRESS',X(6),Y(PONT+4.3));
  g.fillStyle='#2a3440';g.fillRect(X(2),Y(PONT),X(QX-5),Z(1));
  /* le château */
  g.fillStyle='#f2f2ee';g.fillRect(X(51),Y(PONT-30),X(7),Z(30));for(let k=0;k<6;k++){g.fillStyle='#2a3a4a';g.fillRect(X(52),Y(PONT-28+k*4.4),X(5),Z(1.8));}
  g.fillStyle='#c8402a';g.fillRect(X(52.5),Y(PONT-35),X(3.6),Z(5));
  /* les conteneurs du navire */
  J.piles.forEach((P,b)=>P.forEach((c,k)=>cont(g,X(BAIES[b]-CW/2),Y(PONT-(k+1)*CH),X(CW),Z(CH),c,J.camions.some(cc=>cc.cont===c&&cc.etat!=='part')||J.file.includes(c))));
  /* le quai */
  g.fillStyle='#bdb6a6';g.fillRect(X(QX-4),Y(SOL),W,H);g.fillStyle='#e4ddce';g.fillRect(X(QX-4),Y(SOL),W,Z(.8));for(let x=QX-4;x<104;x+=2.4){g.fillStyle=((x*10|0)%48)<24?'#f2c230':'#2a2a2a';g.fillRect(X(x),Y(SOL+1.4),X(1.2),Z(.8));}
  g.fillStyle='#bdb6a6';g.fillRect(X(QX-4),Y(PONT-2),X(4),Y(SOL-PONT+2));
  /* les camions */
  for(const c of J.camions)camion(g,X,Y,c);
  /* le portique : les jambes, la poutre, la cabine */
  g.fillStyle='#d84a2a';const jg=QX-2,jd=91;for(const jx of [jg,jd]){g.fillRect(X(jx),Y(RAIL-2),X(1.6),Y(SOL-RAIL+2));for(let y=RAIL+6;y<SOL;y+=8){g.fillStyle='#b83a1a';g.fillRect(X(jx),Y(y),X(1.6),Z(.6));g.fillStyle='#d84a2a';}}
  g.fillStyle='#d84a2a';g.fillRect(-10,Y(RAIL-3),W+20,Z(2.4));g.fillStyle='#b83a1a';for(let x=0;x<104;x+=3)g.fillRect(X(x),Y(RAIL-2.6),X(1.4),Z(.5));
  g.fillStyle='#d84a2a';g.fillRect(X(jg-1),Y(RAIL-10),X(3),Z(8));g.strokeStyle='#d84a2a';g.lineWidth=Math.max(1,u*.3);g.beginPath();g.moveTo(X(jg),Y(RAIL-10));g.lineTo(X(4),Y(RAIL-2.5));g.moveTo(X(jg+1),Y(RAIL-10));g.lineTo(X(98),Y(RAIL-2.5));g.stroke();
  /* le chariot et la cabine du grutier (toi) */
  const tx=J.tx;g.fillStyle='#f2f2ee';g.fillRect(X(tx-3.6),Y(RAIL-1.2),X(7.2),Z(2.2));g.fillStyle='#2a3a4a';g.fillRect(X(tx-2.6),Y(RAIL+1),X(5.2),Z(3));g.fillStyle='#9ac8e8';g.fillRect(X(tx-2.2),Y(RAIL+1.4),X(4.4),Z(1.8));
  /* les câbles, le spreader, la charge */
  const L=J.L,bx=tx+Math.sin(J.ang)*L,by=RAIL+Math.cos(J.ang)*L;
  g.strokeStyle='#2a2a2a';g.lineWidth=Math.max(1,u*.18);g.beginPath();g.moveTo(X(tx-1.6),Y(RAIL+3));g.lineTo(X(bx-CW*.3),Y(by));g.moveTo(X(tx+1.6),Y(RAIL+3));g.lineTo(X(bx+CW*.3),Y(by));g.stroke();
  g.save();g.translate(X(bx),Y(by));g.rotate(J.ang*.9);
  g.fillStyle='#f2c230';g.fillRect(-X(CW/2),0,X(CW),Z(1.2));g.fillStyle='#2a2a2a';g.fillRect(-X(CW/2),Z(.9),X(CW),Z(.3));
  const ok=J.porte||(J.seat&&J.seat.s.type==='pile'&&J.seat.centre<1.6&&J.seat.plat);g.fillStyle=J.porte?'#4ae070':ok?'#f2c230':'#e8402a';for(const dx of [-CW/2+.6,CW/2-1.6])g.fillRect(X(dx),Z(-.6),X(1),Z(.6));
  if(J.porte)cont(g,-X(CW/2),Z(1.2),X(CW),Z(CH),J.porte,true);
  g.restore();
  /* le guide vertical */
  g.strokeStyle='rgba(255,255,255,.35)';g.setLineDash([4,6]);g.beginPath();g.moveTo(X(bx),Y(by+1.4+(J.porte?CH:0)));g.lineTo(X(bx),Y(SOL));g.stroke();g.setLineDash([]);
  /* les étincelles */
  for(const p of J.parts){g.fillStyle='rgba(255,'+(180+Math.random()*60|0)+',80,'+Math.min(1,p.v*2)+')';g.fillRect(X(p.x),Y(p.y),3,3);}
  g.restore();
  /* le tableau de bord (hors secousse) */
  hud(g,W,H,u,v);
  /* les flèches vers les camions hors champ */
  for(const c of J.camions){if(c.etat!=='attend'||c.charge)continue;const sx2=(c.x-CAM)*u;if(sx2>W-20){g.fillStyle='#f2c230';g.beginPath();g.moveTo(W-8,H*.86);g.lineTo(W-26,H*.86-12);g.lineTo(W-26,H*.86+12);g.fill();g.fillStyle='#fff';g.font='800 '+Math.round(W/32)+'px "Baloo 2",system-ui';g.textAlign='right';g.fillText('camion',W-30,H*.86);}}}
function cont(g,x,y,w,h,c,marque){g.fillStyle=c.c;g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x,y,w,Math.max(1,h*.08));g.fillStyle='rgba(0,0,0,.16)';for(let k=x+w*.04;k<x+w*.97;k+=w*.045)g.fillRect(k,y+h*.1,Math.max(1,w*.012),h*.8);
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+h*.9,w,h*.1);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);
  if(marque){g.fillStyle='rgba(255,255,255,.92)';const fs=Math.min(h*.36,w/(c.nom.length*.62));g.font='bold '+fs+'px "Helvetica Neue",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(c.nom,x+w/2,y+h/2);}}
function camion(g,X,Y,c){const Z=Zg;const x=c.x;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X(x-6),Y(SOL-.4),X(15),Z(.8));
  g.fillStyle='#3a3a3a';g.fillRect(X(x-CW/2-.4),Y(SOL-3.2),X(CW+.8),Z(1));g.fillStyle='#2a2a2a';g.fillRect(X(x-CW/2),Y(SOL-2.2),X(CW),Z(.8));
  g.fillStyle=['#e8e8e8','#2a6ab8'][c.voie];g.fillRect(X(x+CW/2+.4),Y(SOL-6.4),X(4),Z(5.4));g.fillStyle='#2a3a4a';g.fillRect(X(x+CW/2+2),Y(SOL-6),X(2),Z(2));
  for(const dx of [-4,-2.2,3.2,7])g.fillStyle='#1a1a1a',g.beginPath(),g.arc(X(x+dx),Y(SOL-.9),Z(1),0,7),g.fill();
  if(c.charge)cont(g,X(x-CW/2),Y(SOL-3.2-CH),X(CW),Z(CH),c.charge,true);
  else if(c.etat==='attend'){g.strokeStyle='rgba(255,255,255,.8)';g.setLineDash([5,4]);g.strokeRect(X(x-CW/2),Y(SOL-3.2-CH),X(CW),Z(CH));g.setLineDash([]);
    /* le bon de commande au-dessus du camion */
    const lx=X(x),ly=Y(SOL-3.2-CH-4.2);g.fillStyle='#f6f1e6';g.beginPath();(g.roundRect?g.roundRect(lx-X(6),ly-Z(2),X(12),Z(3.4),6):g.rect(lx-X(6),ly-Z(2),X(12),Z(3.4)));g.fill();
    g.fillStyle=c.cont.c;g.fillRect(lx-X(5.4),ly-Z(1.4),X(1.6),Z(2.2));g.fillStyle='#2a2016';g.font='bold '+Math.round(Z(1.7))+'px "Helvetica Neue",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(c.cont.nom,lx+X(.8),ly-Z(.3));
    g.fillStyle=c.patience>.4?'#4ab070':c.patience>.15?'#e8a020':'#e8402a';g.fillRect(lx-X(6),ly+Z(1.6),X(12)*c.patience,Z(.5));}}
const OYp=(H,u)=>H*.9-SOL*u+(SOL-24)*u;
function hud(g,W,H,u,v){const r=(performance.now()-J.t0)/1000,fs=Math.round(Math.min(W/26,H*.032));g.font='900 '+fs+'px "Baloo 2",system-ui,sans-serif';g.textBaseline='middle';g.textAlign='left';
  let y=fs*1.1;const pill=(t,col,x)=>{const w=g.measureText(t).width+fs;g.fillStyle=col;g.beginPath();(g.roundRect?g.roundRect(x,y-fs*.7,w,fs*1.4,fs*.7):g.rect(x,y-fs*.7,w,fs*1.4));g.fill();g.fillStyle='#fff';g.fillText(t,x+fs*.5,y);return x+w+6;};
  let x=pill('⏱ '+Math.floor(r/60)+':'+String(Math.floor(r%60)).padStart(2,'0'),'rgba(20,24,30,.75)',8);x=pill('📦 '+J.notes.length+'/7','rgba(20,24,30,.75)',x);if(J.cognes)pill('💥 '+J.cognes,'rgba(200,60,40,.85)',x);
  /* la manche à air */
  const wx=W-fs*3,wy=fs*1.1,a=Math.max(-1,Math.min(1,J.vent/2.4));g.fillStyle='#3a3a3a';g.fillRect(wx,wy-fs*.6,2,fs*2);for(let i=0;i<4;i++){g.fillStyle=i%2?'#ffffff':'#e8402a';g.fillRect(wx+(a>=0?2:-fs*.5*(i+1)*Math.abs(a))+(a>=0?fs*.5*i*Math.abs(a):0),wy-fs*.6+i*.6,Math.max(2,fs*.5*Math.abs(a)),fs*.45);}
  /* la radio */
  J.radio.forEach((m,i)=>{const age=(performance.now()-m.at)/1000;if(age>6)return;g.globalAlpha=Math.min(1,(6-age)*1.5)*(i?.6:1);g.font='700 '+Math.round(fs*.8)+'px "Baloo 2",system-ui,sans-serif';
    const w=Math.min(W-16,g.measureText(m.t).width+fs);g.fillStyle='rgba(20,24,30,.78)';g.beginPath();(g.roundRect?g.roundRect(8,y+fs*1.3+i*fs*1.5,w,fs*1.3,fs*.4):g.rect(8,y+fs*1.3+i*fs*1.5,w,fs*1.3));g.fill();g.fillStyle='#ffe68a';g.fillText(m.t,8+fs*.5,y+fs*1.95+i*fs*1.5,W-30);g.globalAlpha=1;});
  /* la note de la dernière pose */
  if(J.pop){const age=(performance.now()-J.pop.at)/1000;if(age<1.8){const s=1+Math.max(0,.3-age)*1.5;g.save();g.globalAlpha=Math.min(1,(1.8-age)*2);g.translate((J.pop.x-CAM)*u,H*.45-age*20);g.scale(s,s);g.textAlign='center';
    g.font='900 '+Math.round(fs*1.8)+'px "Baloo 2",system-ui,sans-serif';g.lineWidth=5;g.strokeStyle='#3a2000';g.strokeText(J.pop.t,0,0);g.fillStyle='#ffd24a';g.fillText(J.pop.t,0,0);g.font='800 '+fs+'px "Baloo 2",system-ui,sans-serif';g.fillStyle='#fff';g.fillText(J.pop.n+' / 100',0,fs*1.4);g.restore();}}
  const aideEl=RAC.querySelector('.aide');const msg=performance.now()-J.msgT<2600&&J.msg?J.msg:(J.porte?'Amène-le au camion qui l’attend, puis VERROUS':'Descends le spreader sur le conteneur demandé, puis VERROUS');if(aideEl.textContent!==msg)aideEl.textContent=msg;
  RAC.querySelector('.go').classList.toggle('pret',!!(J.seat&&((!J.porte&&J.seat.s.type==='pile'&&J.seat.centre<1.6&&J.seat.plat)||(J.porte&&(J.seat.s.type==='camion'||J.seat.s.type==='pile')))));}

/* ---------- LA BOUCLE, LA FIN ---------- */
function boucle(){if(!RAC)return;const now=performance.now(),dt=Math.min(.033,(now-(boucle.t||now))/1000);boucle.t=now;try{if(!J.fini){pas(dt/2);pas(dt/2);}dessiner();}catch(x){console.warn("PTQ",x);window.__ptqErr=String(x&&x.stack||x).slice(0,300);}RAF=requestAnimationFrame(boucle);}
function finir(){J.fini=true;SON.stop();const tps=(performance.now()-J.t0)/1000,moy=J.notes.length?Math.round(J.notes.reduce((a,b)=>a+b,0)/J.notes.length):0;
  const score=Math.max(0,Math.round(moy*10-J.cognes*40-Math.max(0,tps-150)*2));const et=score>=800?3:score>=600?2:score>=350?1:0;
  let rec=0;try{rec=+(localStorage.getItem('ptq_record')||0);if(score>rec)localStorage.setItem('ptq_record',score);}catch(x){}
  const d=document.createElement('div');d.className='fin';
  d.innerHTML='<div class="c"><small>FIN DE L’ESCALE</small><div class="et">'+[0,1,2].map(i=>'<span class="'+(i<et?'on':'')+'">★</span>').join('')+'</div><h2>'+(et===3?'Grutier de légende !':et===2?'Belle escale, collègue !':et===1?'Pas mal du tout':'Faut s’entraîner !')+'</h2>'+
    '<div class="g"><div><b>'+moy+'</b>note moyenne</div><div><b>'+Math.floor(tps/60)+':'+String(Math.floor(tps%60)).padStart(2,'0')+'</b>temps</div><div><b>'+J.cognes+'</b>coups</div></div>'+
    '<p class="sc">Score <b>'+score+'</b>'+(score>rec?' · nouveau record !':rec?' · record '+rec:'')+'</p><p class="gr">Poste gratuit pour l’instant : pas de paie.</p><button class="b1">Nouvelle escale</button><button class="b2">Retour au quai</button></div>';
  RAC.appendChild(d);setTimeout(()=>d.querySelectorAll('.et span.on').forEach((s,i)=>setTimeout(()=>{s.classList.add('pop');SON.bien();vib(10);},i*300)),300);
  d.querySelector('.b1').onclick=()=>{d.remove();demarrer();};d.querySelector('.b2').onclick=fermer;}
function taille(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);SON.stop();const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);removeEventListener('resize',taille);}

const CSS=`#ptq{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#1a2028;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;touch-action:none}
#ptq.on{opacity:1}#ptq *{box-sizing:border-box}#ptq *::after{content:none!important;display:none!important}
#ptq .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 6px;color:#fff}
#ptq .bar b{font:900 17px/1 'Baloo 2',system-ui,sans-serif}#ptq .bar small{display:block;font:800 9px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#f2a080}
#ptq .sp{flex:1}#ptq .x{height:36px;padding:0 14px;border-radius:18px;border:0;background:rgba(255,255,255,.14);color:#fff;font:800 13px 'Baloo 2',system-ui,sans-serif}
#ptq .scene{flex:1;min-height:0;position:relative}
#ptq canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#ptq .treuil{position:absolute;right:6px;top:22%;bottom:16%;width:46px;border-radius:27px;background:rgba(20,24,30,.55);border:2px solid rgba(255,255,255,.25);touch-action:none}
#ptq .treuil i{position:absolute;left:3px;right:3px;height:40px;border-radius:20px;background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 3px 0 #a86a10;display:grid;place-items:center;font-style:normal;font:900 18px 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#ptq .treuil span{position:absolute;left:0;right:0;text-align:center;font:800 10px 'Baloo 2',system-ui,sans-serif;color:#d8e0e8;letter-spacing:1px}
#ptq .bas{flex:none;display:flex;gap:10px;align-items:center;padding:10px 12px calc(12px + env(safe-area-inset-bottom));background:#20262e}
#ptq .aide{flex:1;color:#d8e0e8;font:700 13px/1.2 'Baloo 2',system-ui,sans-serif;min-height:32px;display:flex;align-items:center}
#ptq .go{flex:none;width:112px;height:64px;border:0;border-radius:18px;font:900 16px/1 'Baloo 2',system-ui,sans-serif;color:#fff;background:#4a525c;box-shadow:0 5px 0 #2a3038;transition:background .15s}
#ptq .go.pret{background:linear-gradient(#7ae08a,#3aa85a);box-shadow:0 5px 0 #1a6a3a;animation:ptqP 1s ease-in-out infinite}@keyframes ptqP{50%{transform:scale(1.05)}}
#ptq .go:active{transform:translateY(3px)}
#ptq .fin{position:absolute;inset:0;background:rgba(10,16,24,.82);display:grid;place-items:center;padding:24px;z-index:3}
#ptq .fin .c{width:min(340px,90vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:18px;text-align:center;box-shadow:0 6px 0 #b8a890}
#ptq .fin small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#ptq .fin .et{font-size:40px;line-height:1;margin:6px 0;color:#d8cfbe}#ptq .fin .et span{display:inline-block;transition:transform .3s}#ptq .fin .et span.pop{color:#f2b030;transform:scale(1.25)}
#ptq .fin h2{margin:4px 0 10px;font:900 24px/1.1 'Baloo 2',system-ui,sans-serif}
#ptq .fin .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}#ptq .fin .g div{background:#fff;border-radius:14px;padding:8px;box-shadow:0 3px 0 #ddd3c0;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#ptq .fin .g b{display:block;font:900 20px/1.1 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#ptq .fin .sc{margin:4px 0;font:800 16px 'Baloo 2',system-ui,sans-serif}#ptq .fin .gr{margin:0 0 6px;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}
#ptq .fin button{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#ptq .fin .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#ptq .fin .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}`;
window.ouvrirPortique=function(){if(RAC)return;if(!document.getElementById('ptqCss')){const s=document.createElement('style');s.id='ptqCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='ptq';RAC=d;
  d.innerHTML='<div class="bar"><div><b>Le portique</b><small>POSTE N°2 · CABINE DU GRUTIER</small></div><span class="sp"></span><button class="x">Quitter</button></div>'+
    '<div class="scene"><canvas></canvas><div class="treuil"><span style="top:6px">HAUT</span><i>⇕</i><span style="bottom:6px">BAS</span></div></div><div class="bas"><div class="aide"></div><button class="go">VERROUS</button></div>';
  document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');requestAnimationFrame(()=>{d.classList.add('on');taille();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',taille);
  /* le chariot : on glisse le doigt dans la scène */
  let D0=null;const suivre=e=>{const t=e.touches?e.touches[0]:e;const r=CV.getBoundingClientRect();if(e.type==='touchstart'||e.type==='mousedown')D0={x:t.clientX,c:J.cible};if(!D0)return;J.cible=Math.max(4,Math.min(96,D0.c+(t.clientX-D0.x)/r.width*VUE*1.3));e.preventDefault();ac();};
  CV.addEventListener('touchstart',suivre,{passive:false});CV.addEventListener('touchmove',suivre,{passive:false});
  CV.addEventListener('mousedown',e=>{suivre(e);const m=ev=>suivre(ev),u=()=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);};addEventListener('mousemove',m);addEventListener('mouseup',u);});
  /* le treuil : la glissière à droite */
  const tr=d.querySelector('.treuil'),pt=tr.querySelector('i');
  const posTreuil=()=>{const r=tr.getBoundingClientRect(),k=(J.Lc-2)/(SOL-RAIL-2);pt.style.top=(8+k*(r.height-56))+'px';};
  const treuil=e=>{const t=e.touches?e.touches[0]:e;const r=tr.getBoundingClientRect();const k=Math.max(0,Math.min(1,(t.clientY-r.top-28)/(r.height-56)));J.Lc=2+k*(SOL-RAIL-2);e.preventDefault();e.stopPropagation();ac();};
  tr.addEventListener('touchstart',treuil,{passive:false});tr.addEventListener('touchmove',treuil,{passive:false});
  tr.addEventListener('mousedown',e=>{treuil(e);const m=ev=>treuil(ev),u=()=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);};addEventListener('mousemove',m);addEventListener('mouseup',u);});
  setInterval(()=>{if(RAC===d&&J)posTreuil();},50);
  d.querySelector('.go').onclick=()=>{vib(8);verrous();};d.querySelector('.x').onclick=fermer;
  demarrer();boucle.t=0;boucle();try{window.__PTQ=()=>J;}catch(x){}};
})();
