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
const DEBLOQUE=['bagages fragiles','bagages cadenassés','bagages plombés','bagages VIP et les colis express','2 crochets au départ','jusqu’à 4 crochets','3 crochets au départ','paie ×4,2','paie ×5'];
function niveauJ(){try{if(typeof NIV!=='undefined'&&NIV&&NIV.niveau&&NIV.niveau.niveau)return NIV.niveau.niveau|0;}catch(x){}
 try{const v=parseInt((document.getElementById('hNiv')||{}).textContent);if(v>0)return v;}catch(x){}
 try{return Math.max(clsNiv(+e.score||0).n,clsNiv(+e.recolte||0).n);}catch(x){return 1;}}
/* LA COLLECTION : des bagages rares tombent parfois ; on les gagne en les fusionnant */
const SERIES=[{nom:'Corsaires',bonus:'1 crochet de plus au départ'},{nom:'Diplomatie',bonus:'jusqu’à 1 crochet de plus en réserve'},{nom:'Artistes',bonus:'bagages rares 2× plus fréquents'},{nom:'Marseille',bonus:'+10 % de points sur chaque fusion'}];
const RARES=[{id:'bourse',s:0,k:0,nom:'Bourse de doublons'},{id:'perroquet',s:0,k:2,nom:'Perroquet en cage'},{id:'tresor',s:0,k:4,nom:'Coffre au trésor'},
 {id:'courrier',s:1,k:1,nom:'Sac postal'},{id:'mallette',s:1,k:2,nom:'Mallette à code'},{id:'diplo',s:1,k:3,nom:'Valise diplomatique'},
 {id:'chapeau',s:2,k:1,nom:'Boîte à chapeau'},{id:'tournee',s:2,k:3,nom:'Valise de tournée'},{id:'guitare',s:2,k:4,nom:'Étui de guitare'},
 {id:'boules',s:3,k:0,nom:'Sacoche de boules'},{id:'savons',s:3,k:1,nom:'Caisse de savons'},{id:'oursins',s:3,k:2,nom:'Panier d’oursins'}];
const RID={};RARES.forEach(x=>RID[x.id]=x);
function album(){let a=null;try{if(typeof e!=='undefined'&&e&&e.album&&typeof e.album==='object')a=e.album;}catch(x){}if(!a){try{a=JSON.parse(localStorage.getItem('bag_album')||'{}');}catch(x){a={};}}return a||{};}
function serieFinie(i){const a=album();return RARES.filter(x=>x.s===i).every(x=>a[x.id]);}
function collecter(id){const a=Object.assign({},album());const neuf=!a[id];a[id]=(a[id]||0)+1;try{localStorage.setItem('bag_album',JSON.stringify(a));}catch(x){}try{if(typeof e!=='undefined'&&e){e.album=a;sauver();}}catch(x){}return neuf;}
/* le dessin des rares : chacun le sien, avec un liseré doré qui scintille */
function rareArt(g,id,r){const t=performance.now()/1000;const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x*r,y*r,w*r,h*r);};const C=(x,y,rad,c)=>{g.fillStyle=c;g.beginPath();g.arc(x*r,y*r,rad*r,0,7);g.fill();};
 const RR=(x,y,w,h,ra,c)=>{g.fillStyle=c;rr(g,x*r,y*r,w*r,h*r,ra*r);g.fill();};
 g.save();
 if(id==='bourse'){C(0,.12,.92,'#6a3e1a');C(0,.1,.84,'#8a5a2a');g.fillStyle='#6a3e1a';g.beginPath();g.moveTo(-.45*r,-.55*r);g.lineTo(.45*r,-.55*r);g.lineTo(.3*r,-.95*r);g.lineTo(-.3*r,-.95*r);g.fill();R(-.5,-.62,1,.14,'#d8b040');for(const [x,y] of [[-.35,-.05],[.25,.15],[-.05,.45]]){C(x,y,.24,'#a8780a');C(x,y,.19,'#f5c430');}}
 else if(id==='perroquet'){RR(-.75,-.7,1.5,1.5,.12,'rgba(255,255,255,.12)');g.strokeStyle='#c89818';g.lineWidth=r*.07;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*.22*r,-.7*r);g.lineTo(i*.22*r,.8*r);g.stroke();}
  g.beginPath();g.arc(0,-.7*r,.75*r,Math.PI,0);g.stroke();R(-.8,.75,1.6,.18,'#a8780a');C(0,-1.08,.1,'#a8780a');
  C(0,.15,.36,'#2eaa4a');C(.05,-.25,.26,'#e84a3a');C(.12,-.3,.06,'#fff');C(.13,-.3,.03,'#000');g.fillStyle='#f5c430';g.beginPath();g.moveTo(.3*r,-.25*r);g.lineTo(.45*r,-.15*r);g.lineTo(.28*r,-.1*r);g.fill();R(-.12,.45,.08,.3,'#3a8ae8');R(.02,.45,.08,.3,'#f5c430');}
 else if(id==='tresor'){RR(-1,-.35,2,1.15,.12,'#5a3214');RR(-.94,-.3,1.88,1.05,.1,'#8a5a2a');g.fillStyle='#6a3e1a';g.beginPath();g.ellipse(0,-.35*r,r,.55*r,0,Math.PI,0);g.fill();g.fillStyle='#9a6a3a';g.beginPath();g.ellipse(0,-.38*r,.92*r,.48*r,0,Math.PI,0);g.fill();
  for(const x of [-.6,.6]){R(x-.08,-.85,.16,1.65,'#d8b040');}R(-1,-.4,2,.12,'#d8b040');RR(-.18,-.3,.36,.4,.05,'#f5c430');C(0,-.12,.07,'#3a2a10');
  for(let i=0;i<5;i++){C(-.5+i*.25,-.42-.05*Math.sin(i),.1,'#ffd860');}}
 else if(id==='courrier'){g.fillStyle='#b89a6a';g.beginPath();g.ellipse(0,.1*r,.9*r,.85*r,0,0,7);g.fill();g.fillStyle='#a88a5a';for(let i=0;i<6;i++)R(-.8+i*.3,-.6,.05,1.4,'rgba(90,60,30,.25)');
  R(-.35,-.95,.7,.3,'#8a6a3a');R(-.5,-.7,1,.12,'#5a4020');RR(-.6,-.1,1.2,.5,.06,'#f6f0e0');g.fillStyle='#1f3566';g.font='900 '+(.32*r)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('POSTE',0,.16*r);}
 else if(id==='mallette'){RR(-1,-.55,2,1.25,.14,'#7a828c');RR(-.94,-.5,1.88,1.15,.12,'#c8d0da');R(-.94,-.5,1.88,.16,'#e8eef4');R(-.94,.05,1.88,.06,'#8a929c');g.strokeStyle='#5a626c';g.lineWidth=r*.12;g.beginPath();g.moveTo(-.3*r,-.55*r);g.lineTo(-.3*r,-.85*r);g.lineTo(.3*r,-.85*r);g.lineTo(.3*r,-.55*r);g.stroke();
  for(const x of [-.55,.35]){RR(x,-.18,.22,.3,.04,'#3a4048');for(let k=0;k<2;k++)R(x+.03+k*.09,-.13,.07,.2,'#e8c050');}}
 else if(id==='diplo'){RR(-1,-.62,2,1.38,.12,'#1a1a1e');RR(-.94,-.56,1.88,1.26,.1,'#2a2a30');R(-.94,-.56,1.88,.12,'#3a3a42');g.strokeStyle='#d8b040';g.lineWidth=r*.05;g.strokeRect(-.84*r,-.44*r,1.68*r,1.04*r);
  C(.0,.1,.3,'#a01818');C(0,.1,.24,'#c0392b');g.fillStyle='#f5d27a';g.font='900 '+(.28*r)+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('✦',0,.12*r);R(-.25,-.85,.5,.25,'#1a1a1e');}
 else if(id==='chapeau'){g.fillStyle='#c0396a';g.beginPath();g.ellipse(0,.1*r,.95*r,.85*r,0,0,7);g.fill();g.fillStyle='#e05a8a';g.beginPath();g.ellipse(0,-.05*r,.88*r,.7*r,0,0,7);g.fill();
  for(let i=0;i<8;i++){const an=i*.785;C(Math.cos(an)*.55,-.05+Math.sin(an)*.42,.07,'#fff0f6');}R(-.95,.05,1.9,.1,'#f5d27a');C(0,-.05,.2,'#f5d27a');}
 else if(id==='tournee'){RR(-1,-.62,2,1.38,.14,'#3a3a4a');RR(-.94,-.56,1.88,1.26,.1,'#5a5a6e');const st=[['#e84a3a',-.55,-.3,.3],['#f5c430',.3,-.25,.26],['#3ac0e8',-.1,.25,.28],['#7ee08a',.55,.3,.22],['#b880f0',-.6,.35,.2]];
  for(const [c,x,y,rad] of st){C(x,y,rad,c);}g.fillStyle='#fff';g.font='900 '+(.2*r)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('TOUR',-.55*r,-.3*r);g.fillText('★',.3*r,-.24*r);g.fillText('♪',-.1*r,.26*r);R(-.25,-.85,.5,.25,'#2a2a3a');}
 else if(id==='guitare'){g.fillStyle='#1a1a1e';g.beginPath();g.ellipse(0,.35*r,.75*r,.6*r,0,0,7);g.fill();g.beginPath();g.ellipse(0,-.2*r,.55*r,.45*r,0,0,7);g.fill();R(-.17,-1,.34,.7,'#1a1a1e');
  g.fillStyle='#3a3a42';g.beginPath();g.ellipse(0,.35*r,.66*r,.51*r,0,0,7);g.fill();g.beginPath();g.ellipse(0,-.2*r,.47*r,.37*r,0,0,7);g.fill();R(-.1,-.95,.2,.65,'#3a3a42');
  g.strokeStyle='#d8b040';g.lineWidth=r*.05;g.beginPath();g.ellipse(0,.35*r,.66*r,.51*r,0,0,7);g.stroke();R(-.4,.1,.1,.4,'#c0c8d4');R(.3,.1,.1,.4,'#c0c8d4');}
 else if(id==='boules'){g.fillStyle='#5a3214';g.beginPath();g.ellipse(0,.15*r,.95*r,.78*r,0,0,7);g.fill();g.fillStyle='#8a5a2a';g.beginPath();g.ellipse(0,.12*r,.88*r,.7*r,0,0,7);g.fill();
  for(const x of [-.42,.42,0]){const y=x?-.25:-.45;C(x,y,.3,'#8a929c');C(x-.08,y-.08,.1,'#e8eef4');g.strokeStyle='#5a626c';g.lineWidth=r*.04;g.beginPath();g.arc(x*r,y*r,.3*r,-.6,.6);g.stroke();}R(-.95,.05,1.9,.1,'#d8b040');}
 else if(id==='savons'){RR(-1,-.7,2,1.45,.06,'#a8783a');RR(-.94,-.64,1.88,1.33,.05,'#c8945a');for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=-.8+i*.55,y=-.5+j*.6;RR(x,y,.48,.5,.05,j?'#e8d8a0':'#8aa860');g.fillStyle='rgba(0,0,0,.25)';g.font='900 '+(.12*r)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('72%',(x+.24)*r,(y+.25)*r);}}
 else if(id==='oursins'){g.fillStyle='#a8783a';g.beginPath();g.ellipse(0,.2*r,.95*r,.7*r,0,0,Math.PI);g.fill();R(-.95,.1,1.9,.15,'#c8945a');g.strokeStyle='#8a5a2a';g.lineWidth=r*.06;for(let i=0;i<5;i++){g.beginPath();g.moveTo((-.8+i*.4)*r,.2*r);g.lineTo((-.7+i*.35)*r,.85*r);g.stroke();}
  for(const [x,y] of [[-.45,-.1],[.4,-.12],[0,-.35]]){g.strokeStyle='#3a1a3a';g.lineWidth=r*.05;for(let i=0;i<14;i++){const an=i*.45;g.beginPath();g.moveTo(x*r,y*r);g.lineTo((x+Math.cos(an)*.4)*r,(y+Math.sin(an)*.4)*r);g.stroke();}C(x,y,.24,'#5a2a5a');C(x-.06,y-.06,.08,'#8a5a8a');}}
 g.restore();
 /* le liseré doré */
 const k=.5+.5*Math.sin(t*4);g.strokeStyle='rgba(255,214,90,'+(.45+k*.5)+')';g.lineWidth=Math.max(.6,r*.08);g.beginPath();g.arc(0,0,r*1.08,0,7);g.stroke();
 const an=t*2.2;g.fillStyle='#fff';g.globalAlpha=.6+.4*k;g.beginPath();const sx=Math.cos(an)*r*1.08,sy=Math.sin(an)*r*1.08,q=r*.18;g.moveTo(sx,sy-q);g.lineTo(sx+q*.3,sy);g.lineTo(sx,sy+q);g.lineTo(sx-q*.3,sy);g.fill();g.globalAlpha=1;}
let RG=0;function rangJ(){const n=niveauJ();let r=0;GRADES.forEach((g,i)=>{if(n>=g.min)r=i;});return r;}
/* les bagages spéciaux */
const SPECIAUX={fragile:'Fragile : ne le fais pas écraser, fusionne-le pour ×2',cadenas:'Cadenassé : une fusion juste à côté le libère',plomb:'Plombé : très lourd, il tasse la pile',vip:'VIP : fusionne avec n’importe quel bagage',express:'Express : fusionne-le avant la fin du chrono'};
const CW=100, CH=126, LIGNE=24, YLACHE=12;        /* la cale : largeur, hauteur, ligne de charge, hauteur de lâcher */
const GRAV=270, SUB=8, REST=.08, FROT=.26;
const rebond=v=>v>150?.42:v>70?.3:v>35?.14:0;   /* un choc franc rebondit, un contact doux se pose */

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
  tampon(){bruit(.09,.6,600,'lowpass');note(80,.18,'square',.1,45);},
  impr(){bruit(.025,.06,3200);},
  caisse(){[1046,1318,1568,2093].forEach((f,i)=>setTimeout(()=>note(f,.18,'triangle',.08),i*55));bruit(.2,.08,5000);},
  boum(){note(70,.7,'sine',.35,38);bruit(.5,.3,300);note(140,.4,'square',.04,70);},
  tic(){note(1320,.05,'square',.05);},
  verre(){bruit(.25,.25,6000);[2400,3100,3700].forEach((f,i)=>setTimeout(()=>note(f,.12,'sine',.05),i*35));},
  libere(){note(880,.08,'square',.04);setTimeout(()=>note(1320,.12,'triangle',.06),60);},
  express(){[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>note(f,.12,'triangle',.1),i*60));},
  crochet(){note(300,.25,'sawtooth',.05,900);},
  houle(){note(90,1.2,'sine',.12,70);bruit(1,.08,400);},
  fin(){note(392,.18,'triangle',.12);setTimeout(()=>note(330,.18,'triangle',.12),160);setTimeout(()=>note(262,.4,'triangle',.12),320);}};})();
function tirer(){const r=hasard();return r<.32?0:r<.6?1:r<.82?2:r<.95?3:4;}
/* les appels au serveur partent avec la session du joueur (sinon le serveur ne sait pas qui paie) */
async function rpc(n,a){try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const {data,error}=await sb.rpc(n,a||{});if(error)return {erreur:'serveur '+(error.code||'')+' · '+String(error.message||'').slice(0,80)};return data;}}catch(x){}
 try{return await appelRPC(n,a);}catch(x){return null;}}
function tirerRare(){if(!J||J.lache<3)return null;const ch=serieFinie(2)?.04:.02;if(hasard()>=ch)return null;const a=album(),man=RARES.filter(x=>!a[x.id]);const L=man.length&&hasard()<.65?man:RARES;return L[(hasard()*L.length)|0];}
function tirerSp(){if(!J||J.lache<5)return null;const r=hasard();const sp=r<.06?'fragile':r<.105?'cadenas':r<.14?'plomb':r<.165?'vip':null;const min={fragile:0,cadenas:1,plomb:2,vip:3};return sp&&RG>=min[sp]?sp:null;}
function nouvelle(){let n=0;try{n=+(localStorage.getItem('bag_cale')||0);localStorage.setItem('bag_cale',n+1);}catch(x){}THEME=THEMES[n%THEMES.length];FOND=null;
 RG=rangJ();J={tSp:null,sSp:null,rares:[],crochet:(RG>=6?3:RG>=4?2:1)+(serieFinie(0)?1:0),cmax:(RG>=5?4:3)+(serieFinie(1)?1:0),mode:null,echange:true,tJeu:0,gx:0,houle:null,prochHoule:38,prochExpress:22,bandeau:null,leves:[],paires:[],mouettes:[0,1,2].map(i=>({x:hasard()*140-20,y:-26+i*5+hasard()*3,v:(6+hasard()*5)*(i%2?-1:1),ph:hasard()*7})),vit:0,om:0,sons:[],ondes:[],ralenti:0,flash:0,dernierTic:0,corps:[],x:CW/2,cible:CW/2,bal:0,tient:tirer(),suivant:tirer(),pause:0,score:0,combo:0,tCombo:0,danger:0,fini:false,parts:[],pops:[],secousse:0,
  max:0,fusions:0,t0:performance.now(),lache:0,id:1};}

/* --- la physique --- */
function corps(k,x,y,vx,vy,sp){const r=TAI[k].r;return {id:J.id++,k,sp:sp||null,exp:sp==='express'?20:0,x,y,vx:vx||0,vy:vy||0,a:(hasard()-.5)*.4,w:0,r,rv:r,m:r*r*(sp==='plomb'?4:1),age:0,fus:false,pose:false,pop:0};}
function peutFus(a,b){if(a.sp==='cadenas'||b.sp==='cadenas')return false;if(a.sp==='vip'||b.sp==='vip')return a.sp!==b.sp||a.k===b.k;return a.k===b.k;}
function pas(dt){const h=dt/SUB,B=J.corps;for(const b of B){b.px=b.x;b.py=b.y;}
 for(let s=0;s<SUB;s++){
  for(const b of B){b.vy+=GRAV*h;b.vx+=J.gx*h;b.x+=b.vx*h;b.y+=b.vy*h;b.a+=b.w*h;if(b.rv<b.r)b.rv=Math.min(b.r,b.rv+b.r*h*7);}
  /* les parois et le fond */
  for(const b of B){const r=b.rv;
   if(b.x<r){b.x=r;if(b.vx<0){gelee(b,-b.vx*.5);b.vx=-b.vx*rebond(-b.vx);}b.vy*=1-FROT*.05;}
   if(b.x>CW-r){b.x=CW-r;if(b.vx>0){gelee(b,b.vx*.5);b.vx=-b.vx*rebond(b.vx);}b.vy*=1-FROT*.05;}
   if(b.y>CH-r){b.y=CH-r;if(!b.pose&&b.vy>40){b.pose=true;J.sons.push(b.vy);}if(b.vy>0){gelee(b,b.vy);if(b.vy>140&&J.parts)for(let i=0;i<6;i++)J.parts.push({x:b.x+(i-2.5)*b.r*.3,y:CH-1,vx:(i-2.5)*14,vy:-10-hasard()*14,t:0,c:'rgba(220,210,190,.8)',s:1+hasard()*1.4});b.vy=-b.vy*rebond(b.vy);}b.vx*=1-FROT*.06;}}
  /* les contacts entre bagages */
  for(let i=0;i<B.length;i++){const a=B[i];for(let j=i+1;j<B.length;j++){const b=B[j];
   const dx=b.x-a.x,dy=b.y-a.y,rr=a.rv+b.rv;if(dx*dx+dy*dy>=rr*rr)continue;
   const d=Math.sqrt(dx*dx+dy*dy)||.001,nx=dx/d,ny=dy/d,pen=rr-d;
   if(!a.fus&&!b.fus&&a.age>.05&&b.age>.05&&peutFus(a,b)){a.fus=b.fus=true;J.paires.push([a,b]);continue;}
   const ia=1/a.m,ib=1/b.m,sm=ia+ib;
   a.x-=nx*pen*ia/sm;a.y-=ny*pen*ia/sm;b.x+=nx*pen*ib/sm;b.y+=ny*pen*ib/sm;
   const rvx=b.vx-a.vx,rvy=b.vy-a.vy,vn=rvx*nx+rvy*ny;
   if(vn<0){if(vn<-40&&(!a.pose||!b.pose)){a.pose=b.pose=true;J.sons.push(-vn);}
    if(vn<-70){if(a.sp==='fragile'&&!a.casse&&b.y<a.y&&(b.m>a.m*1.4||b.sp==='plomb'))a.casse=true;if(b.sp==='fragile'&&!b.casse&&a.y<b.y&&(a.m>b.m*1.4||a.sp==='plomb'))b.casse=true;}if(vn<-30){gelee(a,-vn*.7);gelee(b,-vn*.7);}const jn=-(1+rebond(-vn))*vn/sm;a.vx-=jn*nx*ia;a.vy-=jn*ny*ia;b.vx+=jn*nx*ib;b.vy+=jn*ny*ib;
    /* frottement tangentiel, qui fait rouler */
    const tx=-ny,ty=nx;const vt=rvx*tx+rvy*ty;let jt=-vt/(sm*1.6);const lim=jn*FROT;jt=Math.max(-lim,Math.min(lim,jt));
    a.vx-=jt*tx*ia;a.vy-=jt*ty*ia;b.vx+=jt*tx*ib;b.vy+=jt*ty*ib;}}}
 }
 for(const b of B){b.sq=b.sq||0;b.sqv=b.sqv||0;b.sqv+=(-b.sq*420-b.sqv*13)*dt;b.sq+=b.sqv*dt;if(Math.abs(b.sq)>.35)b.sq=Math.sign(b.sq)*.35;b.vx*=.998;b.vy*=.998;const rx=(b.x-b.px)/dt,ry=(b.y-b.py)/dt;b.w+=(rx/b.r-b.w)*.2;if(rx*rx+ry*ry<4)b.w*=.6;if(b.vx*b.vx+b.vy*b.vy<16){b.vx*=.85;b.vy*=.92;b.w*=.7;}b.age+=dt;if(Math.abs(b.w)>14)b.w=Math.sign(b.w)*14;}
 /* les fusions */
 if(J.paires.length){const vus=new Set();for(const [a,b] of J.paires){if(vus.has(a.id)||vus.has(b.id))continue;vus.add(a.id);vus.add(b.id);fusion(a,b);}
  J.paires=[];J.corps=J.corps.filter(b=>!vus.has(b.id));for(const b of J.corps)b.fus=false;}
 const C=J.corps.filter(b=>b.casse);if(C.length){for(const b of C)casser(b);J.corps=J.corps.filter(b=>!b.casse);}
}
function gelee(b,v){if(v<30)return;b.sqv=(b.sqv||0)+Math.min(9,v/22);}
function fusion(a,b){const vip=a.sp==='vip'?a:b.sp==='vip'?b:null,k=vip?(vip===a?b.k:a.k):a.k,x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 J.combo=J.tCombo>0?J.combo+1:1;J.tCombo=1.25;J.fusions++;
 const frag=a.sp==='fragile'||b.sp==='fragile',expr=a.sp==='express'||b.sp==='express';
 for(const o of [a,b])if(o.sp&&o.sp.indexOf('r:')===0){const ra=RID[o.sp.slice(2)];const neuf=collecter(ra.id);J.rares=(J.rares||[]).concat(ra.id);J.score+=neuf?1000:400;
  const nS=RARES.filter(z=>z.s===ra.s&&album()[z.id]).length;const px=Math.max(26,Math.min(CW-26,x));J.pops.push({x:px,y:y-14,t:0,txt:(neuf?'✨ NOUVEAU ! +1000':'✨ +400'),c:'#ffd860',gros:true});J.pops.push({x:px,y:y-6,t:0,txt:ra.nom,c:'#fff'});
  J.bandeau={txt:'📕 '+SERIES[ra.s].nom+' '+nS+'/3'+(neuf&&nS===3?' · SÉRIE COMPLÈTE : '+SERIES[ra.s].bonus:''),t:3.4,c:'#ffd860'};SON.express();vib([20,40,20]);
  for(let i=0;i<24;i++){const an=hasard()*7,v=40+hasard()*70;J.parts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v-40,t:0,c:i%2?'#ffd860':'#fff',s:1+hasard()*1.2});}}
 let gain=Math.round(TAI[Math.min(k+1,TAI.length-1)].pts*10*Math.min(5,J.combo)*(frag?2:1)*(serieFinie(3)?1.1:1));J.score+=gain;
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
 const n=corps(k+1,x,y,(a.vx+b.vx)/2,(a.vy+b.vy)/2-20,(a.sp==='plomb'&&b.sp==='plomb')?'plomb':null);n.rv=n.r*.55;n.age=0;n.w=(a.w+b.w)/2;n.pop=.32;n.sqv=-7;J.corps.push(n);if(k+1===TAI.length-1){J.ralenti=1.1;J.flash=.35;SON.boum();}
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
 const c=corps(J.tient,bx,by,vx,vy,J.tSp);c.a=th;J.corps.push(c);J.om=0;J.bal=0;J.tient=J.suivant;J.tSp=J.sSp;{const ra=tirerRare();if(ra){J.suivant=ra.k;J.sSp='r:'+ra.id;}else{J.suivant=tirer();J.sSp=tirerSp();}}J.echange=true;majPouvoirs();J.pause=.45;J.lache++;vib(5);SON.lache();}

/* --- la fin : la pile reste au-dessus de la ligne --- */
function surveiller(dt){let haut=false;for(const b of J.corps)if(b.age>1.2&&b.y-b.r<LIGNE&&Math.abs(b.vy)<40){haut=true;break;}
 J.danger=haut?J.danger+dt:Math.max(0,J.danger-dt*2);if(haut){const n=Math.ceil(3-J.danger);if(n!==J.dernierTic){J.dernierTic=n;SON.tic();vib(20);}}else J.dernierTic=0;if(J.danger>3)finir();}

/* --- le dessin --- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function bagage(g,k,x,y,a,rv,sp){const b=TAI[k],r=(rv||b.r),c=b.c;g.save();g.translate(x,y);g.rotate(a||0);
 if(sp&&sp.indexOf('r:')===0){rareArt(g,sp.slice(2),r);g.restore();return;}
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
 for(const b of J.corps){const sc=b.pop>0?1+Math.sin((1-b.pop/.32)*Math.PI)*.16:1;{const q=b.sq||0;if(Math.abs(q)>.004){g.save();g.translate(b.x,b.y+b.rv*q*.5);g.scale(1+q*.55,1-q*.55);bagage(g,b.k,0,0,b.a,b.rv*sc,b.sp);g.restore();}else bagage(g,b.k,b.x,b.y,b.a,b.rv*sc,b.sp);}
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
 if(J.tSp&&!(J.vus||(J.vus={}))[J.tSp]){J.vus[J.tSp]=1;if(J.tSp.indexOf('r:')===0){const ra=RID[J.tSp.slice(2)];J.bandeau={txt:'✨ Bagage rare : '+ra.nom+' · fusionne-le pour le collectionner',t:3.4,c:'#ffd860'};SON.express();}else J.bandeau={txt:SPECIAUX[J.tSp],t:3.2};}
 if(false&&!J.houle&&J.tJeu>=J.prochHoule){J.houle={t:0,d:9,s:hasard()<.5?1:-1};J.prochHoule=J.tJeu+48+hasard()*20;J.bandeau={txt:'🌊 HOULE ! Le navire roule, vise bien',t:2.6,c:'#9fe8ff'};SON.houle();vib([30,60,30]);}
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
 const PAL=[30000,75000,150000],et=PAL.filter(p=>sc>=p).length,f=n=>(+n).toLocaleString('fr-FR');
 const P=payer(sc),nom=String((typeof e!=='undefined'&&e.pseudo)||'Docker').replace(/[<>&]/g,'').toUpperCase(),dt=new Date(),h2=n=>String(n).padStart(2,'0');
 const d=document.createElement('div');d.className='fin';
 d.innerHTML='<div class="mach"><span class="led"></span><span class="fente"></span></div><div class="tk"><div class="tkin">'+
  '<div class="emb"><svg width="36" height="36" viewBox="0 0 38 38"><circle cx="19" cy="19" r="17.5" fill="none" stroke="#2a2219" stroke-width="2.4"/><path d="M19 9v19M13 14h12M10 22c1 5 5 7 9 7s8-2 9-7M10 22l-2 2M28 22l2 2" stroke="#2a2219" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="19" cy="9" r="2.4" fill="none" stroke="#2a2219" stroke-width="2"/></svg><div><b>PORT DE MARSEILLE</b><i>Feuille de vacation · soute</i></div></div>'+
  '<div class="qui"><span>'+nom+' · '+GRADES[RG].nom.toUpperCase()+'</span><span>'+h2(dt.getDate())+'/'+h2(dt.getMonth()+1)+' · '+h2(dt.getHours())+'h'+h2(dt.getMinutes())+'</span></div>'+
  '<div class="lns"><div class="l"><span>Cale '+THEME.nom.toLowerCase()+'</span><em></em><span>'+f(sc)+' pts</span></div>'+
  '<div class="l gr'+(sc>rec?' neuf':'')+'"><span>'+(sc>rec?'Nouveau record !':'Record perso')+'</span><em></em><span>'+f(Math.max(sc,rec))+'</span></div>'+
  (J.rares||[]).map(id=>'<div class="l rare"><span>✨ '+RID[id].nom+'</span><em></em><span>'+SERIES[RID[id].s].nom+'</span></div>').join('')+'</div>'+
  '<div class="ets">'+[0,1,2].map(i=>'<i class="'+(i<et?'':'v')+'">★</i>').join('')+'<div class="tamp"><b>PAYÉ</b><small>CAISSE DU PORT</small></div></div>'+
  '<div class="tot"><span>NET À PAYER</span><b>…</b></div><div class="motif"></div>'+
  '<div class="code"></div><div class="num">'+h2(dt.getDate())+h2(dt.getMonth()+1)+' '+String(J.lache*7919%10000).padStart(4,'0')+' '+String(sc).padStart(6,'0')+'</div></div></div>'+
  '<div class="sp"></div><p class="ast">'+(et>=3?'Les 3 étoiles. Respect.':'Encore <b>'+f(PAL[et]-sc)+'</b> pts pour '+(et===0?'la 1ʳᵉ':'la '+(et+1)+'ᵉ')+' étoile')+'</p><button class="b1 cache">Encaisser</button>';
 RAC.appendChild(d);
 const tk=d.querySelector('.tk'),tot=d.querySelector('.tot b'),tamp=d.querySelector('.tamp'),bt=d.querySelector('.b1'),lns=d.querySelector('.lns');
 /* le ticket s'imprime */
 let ti=0;const imp=setInterval(()=>{SON.impr();if(++ti>14)clearInterval(imp);},70);
 requestAnimationFrame(()=>d.classList.add('imp'));
 let R=null;
 Promise.all([P,new Promise(ok=>setTimeout(ok,1500))]).then(([r])=>{if(!RAC||!d.isConnected)return;R=r;
  const ligne=(a,b,c)=>{lns.insertAdjacentHTML('beforeend','<div class="l nv'+(c?' '+c:'')+'"><span>'+a+'</span><em></em><span>'+b+'</span></div>');};
  if(r&&!r.erreur){ligne('Expérience','+'+(r.xp||0)+' XP');if(r.prime)ligne('Prime conteneur',eur(r.prime),'gr');if(r.grade>1)ligne('Prime de grade','×'+String(r.grade).replace('.',','),'gr');if(r.facteur<1)ligne('Tarif réduit ('+(r.faites-1)+' vac.)',Math.round(r.facteur*100)+' %','gr');
   const cible=Math.round((r.verse||0)/100),t0=performance.now();const cpt=()=>{const k=Math.min(1,(performance.now()-t0)/800);tot.textContent=f(Math.round(cible*(1-Math.pow(1-k,3))))+' €';if(k<1)requestAnimationFrame(cpt);else{tamp.classList.add('on');SON.tampon();vib(35);setTimeout(()=>{bt.classList.remove('cache');},450);}};cpt();}
  else{const er=r&&r.erreur,msg=er==='connexion'?'Connecte-toi pour être payé.':er==='plafond'?'Plafond du jour atteint.':er==='trop court'?'Vacation trop courte.':'Paie indisponible pour l’instant.';
   if(r&&r.xp>0)ligne('Expérience','+'+r.xp+' XP');tot.textContent='0 €';d.querySelector('.motif').textContent=msg;tamp.querySelector('b').textContent='EN ATTENTE';tamp.classList.add('gris','on');SON.tampon();setTimeout(()=>{bt.textContent='Continuer';bt.classList.remove('cache');},450);}});
 /* encaisser : la somme en grand, puis le choix */
 bt.onclick=()=>{if(bt.classList.contains('cache'))return;const ok=R&&!R.erreur;if(ok){SON.caisse();vib([15,40,15]);}
  let n=0;try{n=+(localStorage.getItem('bag_cale')||0);}catch(x){}const prochain=THEMES[n%THEMES.length].nom.toLowerCase();
  d.classList.add('choix');d.insertAdjacentHTML('beforeend','<div class="gain">'+(ok?'<b>+ '+eur(R.verse)+'</b><span>versés sur ton compte'+(R.xp?' · +'+R.xp+' XP':'')+'</span>':'<b class="z">Cale terminée</b><span>'+f(sc)+' points</span>')+'</div>'+
   '<div class="feuille"><div class="poig"></div><h4>Et maintenant ?</h4><p class="port"></p>'+
   '<div class="opt p o1"><span class="ic">🧳</span><div><b>Nouvelle cale</b><small>Prochain navire : '+prochain+'</small></div></div>'+
   '<div class="opt o2"><span class="ic">⚓</span><div><b>Rentrer</b><small>Débaucher pour aujourd’hui</small></div></div></div>');affPort();
  requestAnimationFrame(()=>d.classList.add('choix2'));
  d.querySelector('.o1').onclick=()=>{d.remove();nouvelle();majRec();affPort();ouvrirVac();majPouvoirs();majNavire();};d.querySelector('.o2').onclick=fermer;};}

let PORT=null;
function affPort(){if(!RAC)return;const t=PORT&&PORT.score?'🏆 Record du port aujourd’hui : <b>'+String(PORT.pseudo).replace(/[<>&]/g,'')+'</b> · '+(+PORT.score).toLocaleString('fr-FR'):'🏆 Personne n’a encore rempli de cale aujourd’hui. À toi !';
 RAC.querySelectorAll('.port').forEach(e=>e.innerHTML=t);}
async function chargerPort(){try{PORT=await rpc('soute_record',{});}catch(x){}affPort();}
async function envoyerScore(sc){try{const r=await rpc('soute_score',{p_score:sc|0});if(r!==undefined)PORT=r;}catch(x){}affPort();}
/* LA PAIE : une vacation ouverte côté serveur à chaque cale, payée à la fin selon le score */
let VAC=null;
async function ouvrirVac(){VAC=null;try{const r=await rpc('soute_debut',{});if(r&&r.vacation)VAC=r.vacation;}catch(x){}}
const eur=c=>(Math.round(c/100)).toLocaleString('fr-FR')+' €';
async function payer(sc){if(!VAC)return {erreur:'connexion'};
 const v=VAC;VAC=null;let r=null;try{r=await rpc('soute_fin',{p_vac:v,p_score:sc|0,p_fusions:J?J.fusions:0,p_lache:J?J.lache:0,p_max:J?J.max:0});}catch(x){}
 if(!r)return {erreur:'indispo'};
 if(r.xp>0){try{e.recolte=(e.recolte||0)+r.xp;if((e.score||0)<e.recolte)e.score=e.recolte;sauver();majHaut();}catch(x){}}
 if(!r.erreur&&typeof r.euros==='number'){try{e.euros=r.euros;sauver();majHaut();}catch(x){}}
 if(r.pochette&&window.montrerPochette)montrerPochette(r.pochette,'TROUVÉE DANS LA SOUTE ⚓',1800);
 return r;}
/* l'album de la collection */
function ouvrirAlbum(){if(!RAC||RAC.querySelector('.albv'))return;const pause=J&&!J.fini&&!J.tuto;if(pause)J.tuto=true;const a=album();
 const nb=RARES.filter(x=>a[x.id]).length;const d=document.createElement('div');d.className='albv';
 d.innerHTML='<div class="ac"><div class="ah"><div><small>COLLECTION</small><b>Bagages rares</b></div><span>'+nb+' / '+RARES.length+'</span><button class="af">✕</button></div>'+
  '<p class="ai">Ils tombent parfois dans la cale, avec un liseré doré. <b>Fusionne-les</b> pour les ranger ici.</p>'+
  SERIES.map((S,i)=>{const fin=serieFinie(i);return '<div class="as'+(fin?' comp':'')+'"><div class="at"><b>'+S.nom+'</b><small>'+(fin?'✓ ':'🔒 ')+S.bonus+'</small></div><div class="ag">'+
   RARES.filter(x=>x.s===i).map(x=>'<div class="ak'+(a[x.id]?' ok':'')+'"><canvas data-id="'+x.id+'" width="120" height="120"></canvas><span>'+(a[x.id]?x.nom:'???')+'</span>'+(a[x.id]>1?'<i>×'+a[x.id]+'</i>':'')+'</div>').join('')+'</div></div>';}).join('')+'</div>';
 RAC.appendChild(d);
 d.querySelectorAll('canvas').forEach(c=>{const x=RID[c.dataset.id],q=c.getContext('2d');const sc=120/(TAI[x.k].r*2.7);q.setTransform(sc,0,0,sc,60,60);
  if(a[x.id])rareArt(q,x.id,TAI[x.k].r);else{q.fillStyle='rgba(255,255,255,.12)';q.beginPath();q.arc(0,0,TAI[x.k].r,0,7);q.fill();q.setTransform(1,0,0,1,0,0);q.fillStyle='rgba(255,255,255,.35)';q.font='900 44px system-ui';q.textAlign='center';q.textBaseline='middle';q.fillText('?',60,62);}});
 const fe=()=>{d.remove();if(pause&&J)J.tuto=false;};d.querySelector('.af').onclick=fe;}
let NAVIRE='';function majNavire(){if(RAC)RAC.querySelector('.nav').textContent=GRADES[RG].nom.toUpperCase()+' · '+THEME.nom+(GRADES[RG].x>1?' · ×'+String(GRADES[RG].x).replace('.',','):'');}
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
#bag .fin{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 22px) 18px calc(18px + env(safe-area-inset-bottom));background:radial-gradient(ellipse at 50% 25%,rgba(40,52,74,.92),rgba(8,12,20,.97) 70%);overflow:hidden;opacity:0;transition:opacity .3s}
#bag .fin.imp{opacity:1}
#bag .fin .mach{flex:none;width:min(372px,96%);height:52px;border-radius:14px 14px 9px 9px;background:linear-gradient(#5a6472,#3a424e 55%,#2a3038);box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 8px 18px rgba(0,0,0,.5);position:relative;z-index:2}
#bag .fin .mach:before{content:'BUREAU D’EMBAUCHE · POINTEUSE N°7';position:absolute;top:10px;left:0;right:0;text-align:center;font:800 9px system-ui,sans-serif;letter-spacing:2.2px;color:#c8d0dc}
#bag .fin .mach .led{position:absolute;right:14px;top:11px;width:7px;height:7px;border-radius:50%;background:#7ee08a;box-shadow:0 0 8px #7ee08a}
#bag .fin .mach .fente{position:absolute;left:20px;right:20px;bottom:8px;height:6px;border-radius:3px;background:#0c0f14;box-shadow:inset 0 2px 3px #000}
#bag .fin .tk{flex:none;width:min(350px,90%);margin-top:-12px;overflow:hidden;padding-bottom:14px;position:relative;z-index:1}
#bag .fin .tkin{transform:translateY(-102%);transition:transform 1.25s cubic-bezier(.3,.1,.3,1);position:relative;padding:24px 20px 16px;color:#2a2219;font-family:ui-monospace,'Courier New',monospace;box-shadow:0 14px 22px rgba(0,0,0,.45);
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E"),linear-gradient(#efe6d2,#f9f4e8 18%)}
#bag .fin.imp .tkin{transform:none}
#bag .fin .tkin:after{content:'';position:absolute;left:0;right:0;bottom:-9px;height:10px;background:radial-gradient(circle at 7px 0,transparent 6px,#f9f4e8 6.5px) 0 0/14px 10px repeat-x}
#bag .fin .emb{display:flex;align-items:center;gap:10px;border-bottom:2px solid #2a2219;padding-bottom:9px;text-align:left}
#bag .fin .emb b{font:900 14.5px ui-monospace,monospace;letter-spacing:1px;display:block}#bag .fin .emb i{font:700 10.5px ui-monospace,monospace;font-style:normal;color:#7a6a52}
#bag .fin .qui{display:flex;justify-content:space-between;gap:6px;font:700 10px ui-monospace,monospace;color:#7a6a52;margin:7px 0 4px}
#bag .fin .l{display:flex;align-items:baseline;font:700 15.5px ui-monospace,monospace;margin:9px 0}#bag .fin .l span{white-space:nowrap}#bag .fin .l em{flex:1;border-bottom:2px dotted #b8aa90;margin:0 6px;transform:translateY(-4px)}
#bag .fin .l.gr{font-size:13px;color:#7a6a52}#bag .fin .l.neuf{color:#b8540a;font-weight:900}
#bag .fin .l.nv{animation:binL .35s ease-out both}@keyframes binL{from{opacity:0;transform:translateX(-8px)}}
#bag .fin .ets{display:flex;justify-content:flex-start;gap:8px;margin:14px 0 6px;position:relative}
#bag .fin .ets i{width:34px;height:34px;display:grid;place-items:center;font-style:normal;font-size:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b0,#f2b030 45%,#b8780a);color:#7a4a00;box-shadow:0 2px 0 #7a4a00,0 4px 8px rgba(0,0,0,.3)}
#bag .fin .ets i.v{background:#ddd2bc;color:#b8aa90;box-shadow:0 2px 0 #a89a80}
#bag .fin .tot{margin-top:9px;border-top:2px solid #2a2219;padding-top:9px;display:flex;align-items:baseline;justify-content:space-between}
#bag .fin .tot span{font:900 11.5px ui-monospace,monospace;letter-spacing:1.5px}#bag .fin .tot b{font:900 32px ui-monospace,monospace}
#bag .fin .motif{font:700 11.5px ui-monospace,monospace;color:#8a3a2a;text-align:right;min-height:2px}
#bag .fin .code{height:26px;margin-top:10px;background:repeating-linear-gradient(90deg,#2a2219 0 2px,transparent 2px 4px,#2a2219 4px 5px,transparent 5px 8px,#2a2219 8px 11px,transparent 11px 12px);opacity:.85}
#bag .fin .num{text-align:center;font:700 9px ui-monospace,monospace;letter-spacing:3px;color:#7a6a52;margin-top:3px}
#bag .fin .tamp{position:absolute;right:-10px;top:-2px;transform:rotate(-12deg) scale(2.4);opacity:0;color:#c0392b;border:3.5px double currentColor;border-radius:8px;padding:2px 10px;text-align:center;mix-blend-mode:multiply;transition:transform .16s cubic-bezier(.5,0,.8,1.4),opacity .1s;
 -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.7'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.2 1.6'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)'/%3E%3C/svg%3E")}
#bag .fin .tamp.on{transform:rotate(-12deg) scale(1);opacity:.85}#bag .fin .tamp.gris{color:#5a6a80}
#bag .fin .tamp b{display:block;font:900 18px system-ui,sans-serif;letter-spacing:3px;line-height:1.1}#bag .fin .tamp small{display:block;font:800 8px system-ui,sans-serif;letter-spacing:1px;color:inherit}
#bag .fin .sp{flex:1}
#bag .fin .ast{margin:0 0 12px;font:700 13px 'Baloo 2',system-ui,sans-serif;color:#8ab0d8}#bag .fin .ast b{color:#fff}
#bag .fin button.b1{flex:none;width:100%;max-width:380px;height:58px;border:0;border-radius:20px;background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;font:900 19px 'Baloo 2',system-ui,sans-serif;box-shadow:0 6px 0 #a86a10,0 12px 24px rgba(242,176,48,.25);transition:opacity .3s,transform .3s}
#bag .fin button.b1.cache{opacity:0;transform:translateY(16px);pointer-events:none}
#bag .fin.choix .mach,#bag .fin.choix .tk,#bag .fin.choix .ast,#bag .fin.choix .b1{transition:opacity .35s,transform .45s;opacity:0;transform:translateY(-40px);pointer-events:none}
#bag .fin .gain{position:absolute;left:0;right:0;top:16%;text-align:center;opacity:0;transform:scale(.6);transition:all .45s cubic-bezier(.3,1.5,.5,1)}
#bag .fin.choix2 .gain{opacity:1;transform:none}
#bag .fin .gain b{display:block;font:900 52px/1.05 'Baloo 2',system-ui,sans-serif;color:#7ee08a;text-shadow:0 4px 0 rgba(0,0,0,.3)}#bag .fin .gain b.z{color:#fff;font-size:38px}#bag .fin .gain span{font:700 14px 'Baloo 2',system-ui,sans-serif;color:#bff0c0}
#bag .fin .feuille{position:absolute;left:0;right:0;bottom:0;background:#f6f1e6;border-radius:26px 26px 0 0;padding:12px 20px calc(20px + env(safe-area-inset-bottom));color:#2a2016;box-shadow:0 -10px 30px rgba(0,0,0,.4);transform:translateY(105%);transition:transform .45s cubic-bezier(.2,.9,.3,1) .15s}
#bag .fin.choix2 .feuille{transform:none}
#bag .fin .poig{width:44px;height:5px;border-radius:3px;background:#d8ccb4;margin:0 auto 12px}
#bag .fin h4{margin:0 0 2px;font:900 22px 'Baloo 2',system-ui,sans-serif;text-align:center}#bag .fin .feuille .port{margin:0 0 14px;text-align:center;font:700 12.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#bag .fin .feuille .port b{color:#a86a10}
#bag .fin .opt{display:flex;align-items:center;gap:14px;background:#fff;border-radius:20px;padding:13px 16px;margin-bottom:12px;box-shadow:0 3px 0 #e2d8c6;text-align:left}
#bag .fin .opt .ic{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font-size:25px;background:#e3eefb}
#bag .fin .opt b{display:block;font:900 17px 'Baloo 2',system-ui,sans-serif}#bag .fin .opt small{font:700 12.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a;letter-spacing:0}
#bag .fin .opt.p{background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 4px 0 #a86a10}#bag .fin .opt.p .ic{background:rgba(255,255,255,.45)}#bag .fin .opt.p small{color:#6a4a10}
#bag .bar .alb{width:38px;height:38px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font-size:17px;padding:0;margin-right:6px}
#bag .albv{position:absolute;inset:0;z-index:6;background:rgba(8,12,20,.92);overflow-y:auto;padding:calc(env(safe-area-inset-top,0px) + 14px) 14px 24px}
#bag .albv .ac{max-width:420px;margin:0 auto;color:#fff}
#bag .albv .ah{display:flex;align-items:center;gap:10px;margin-bottom:6px}#bag .albv .ah small{display:block;font:800 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#f5d27a}#bag .albv .ah b{font:900 24px/1 'Baloo 2',system-ui,sans-serif}
#bag .albv .ah span{margin-left:auto;font:900 16px 'Baloo 2',system-ui,sans-serif;background:#2e3a4e;border-radius:12px;padding:3px 10px;color:#f5d27a}
#bag .albv .af{width:38px;height:38px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font-size:16px}
#bag .albv .ai{font:600 13px/1.35 'Baloo 2',system-ui,sans-serif;color:#a8b8cc;margin:4px 0 12px}#bag .albv .ai b{color:#ffd860}
#bag .albv .as{background:#1b2330;border-radius:20px;padding:12px;margin-bottom:12px;box-shadow:0 3px 0 #0f141c}
#bag .albv .as.comp{background:linear-gradient(#3a2e10,#1b2330 70%);box-shadow:0 0 0 2px #d8b040,0 3px 0 #0f141c}
#bag .albv .at{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:8px}#bag .albv .at b{font:900 17px 'Baloo 2',system-ui,sans-serif}#bag .albv .at small{font:700 11.5px 'Baloo 2',system-ui,sans-serif;color:#8ab0d8;text-align:right}
#bag .albv .as.comp .at small{color:#ffd860}
#bag .albv .ag{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#bag .albv .ak{position:relative;background:#252f40;border-radius:14px;padding:6px 4px 8px;text-align:center}#bag .albv .ak.ok{background:radial-gradient(circle at 50% 35%,#4a3e1a,#252f40 70%)}
#bag .albv .ak canvas{width:64px;height:64px;display:block;margin:0 auto}#bag .albv .ak span{display:block;font:800 11px/1.15 'Baloo 2',system-ui,sans-serif;color:#c8d4e4;min-height:26px}#bag .albv .ak:not(.ok) span{color:#5a6a80}
#bag .albv .ak i{position:absolute;top:5px;right:7px;font:900 11px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#f5d27a}
#bag .fin .l.rare{color:#a86a10;font-size:13px}
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
`;
window.ouvrirBagages=function(navire){if(RAC)return;if(!document.getElementById('bagCss')){const s=document.createElement('style');s.id='bagCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='bag';RAC=d;
 d.innerHTML='<div class="bar"><div><small class="nav">POSTE BAGAGES</small><b>La soute</b></div><span class="sp"></span><button class="alb">📕</button><button class="son">'+(SON.on?'🔊':'🔇')+'</button><button class="x">Quitter</button></div>'+
  '<div class="pl"><span>⭐ <i class="sc" style="font-style:normal">0</i></span><span class="rc">🏆 0</span><span class="cb">🔥 ×1</span><span class="sv">SUIVANT<canvas width="90" height="90"></canvas></span></div><div class="port"></div>'+
  '<div class="scene"><canvas></canvas></div><div class="bas"><button class="cro">🪝 Crochet <i>1</i></button><span class="aide">Glisse, lève le doigt : ça tombe</span><button class="ech">⇄ Échanger</button></div>';
 document.body.appendChild(d);CV=d.querySelector('.scene>canvas');G=CV.getContext('2d');NAVIRE=String(navire||'').toUpperCase();
 nouvelle();majNavire();majRec();affPort();chargerPort();ouvrirVac();tuto();majPouvoirs();requestAnimationFrame(()=>{d.classList.add('on');cadrer();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 d.querySelector('.x').onclick=fermer;d.querySelector('.alb').onclick=ouvrirAlbum;
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
