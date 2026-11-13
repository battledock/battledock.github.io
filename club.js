/* =====================================================================
   LE DISCO CLUB — la salle de danse de la Disco Party (club.html).
   Une grande piste lumineuse qui s'allume au rythme, la boule à facettes
   et ses éclats qui glissent partout, le DJ sur son estrade, le bar néon,
   le vestiaire disco (les tenues et les danses), les banquettes de velours,
   et des danseurs déchaînés. On danse depuis la piste (Mes émotes).
   Chargé par moteur.js (eval direct) : il voit personne, danseur, DANSES,
   DISCO_T, musiqueDisco, ouvrirEmotes, joueur, e, sauver, vibrer…
   ===================================================================== */
(()=>{
const W=800,H=800,MUR=212;
const PISTE={x0:200,x1:600,y0:300,y1:560,nx:10,ny:6};
const DEPART=[400,742];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
const NEON=['#ff3ac8','#3af0ff','#ffd23a','#7aff6a','#b86aff','#ff7a3a'];
const now=()=>performance.now()/1000;
const BT=.5;   /* un temps : 120 battements par minute, comme la musique */

/* ---------- LE SOL ET LES MURS ---------- */
function neonTexte(g,s,x,y,px,c){g.save();g.font='900 '+px+'px "Baloo 2","Arial Black",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor=c;g.shadowBlur=14;g.fillStyle=c;g.fillText(s,x,y);g.shadowBlur=4;g.fillStyle='#fff';g.fillText(s,x,y);g.restore();}
function peindreSol(g){
  /* le mur du fond : velours violet, panneaux capitonnés */
  g.fillStyle=lin(g,0,0,0,MUR,[[0,'#12061e'],[.6,'#22093a'],[1,'#2e0e4a']]);g.fillRect(0,0,W,MUR);
  for(let x=0;x<W;x+=40)for(let y=40;y<MUR-20;y+=34){g.fillStyle='rgba(255,255,255,.035)';g.beginPath();g.ellipse(x+20,y+17,16,13,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+19,y+16,2,2);}
  R(g,0,24,W,3,'#3af0ff');R(g,0,MUR-8,W,3,'#ff3ac8');
  /* l'enseigne au néon */
  neonTexte(g,'DISCO  PARTY',400,13,15,'#ff3ac8');
  /* le mur derrière le bar : les étagères de bouteilles, un miroir */
  R(g,30,60,200,120,'#0c0614');g.fillStyle=lin(g,30,60,230,180,[[0,'rgba(180,200,255,.12)'],[.5,'rgba(255,255,255,.04)'],[1,'rgba(180,200,255,.12)']]);g.fillRect(30,60,200,120);
  for(const y of [92,128,164]){R(g,30,y,200,3,'#c89a4a');for(let k=0;k<17;k++){const bx=38+k*11.3,h=12+hA(k,y,1)*10,c=['#3aa05a','#c8a040','#d8302a','#e8ecf4','#7a3ab8','#3a8ae0','#f2c84a'][(k+y)%7];
    g.fillStyle=c;g.globalAlpha=.85;g.fillRect(bx,y-h,5,h);g.fillRect(bx+1.5,y-h-4,2,4);g.globalAlpha=1;R(g,bx+1,y-h+2,1,h-4,'rgba(255,255,255,.35)');}}
  neonTexte(g,'BAR',130,46,12,'#3af0ff');
  /* le mur du vestiaire : portant de tenues pailletées */
  R(g,570,60,200,120,'#0c0614');R(g,580,78,180,2,'#c8ccd6');
  for(let k=0;k<13;k++){const x=590+k*13.5,c=['#ff3ac8','#ffd23a','#c8ccd6','#9a4ad8','#3af0ff','#e8ecf4','#d8302a'][k%7];R(g,x+3,80,1,4,'#c8ccd6');g.fillStyle=c;g.beginPath();g.moveTo(x,84);g.lineTo(x+8,84);g.lineTo(x+10,124);g.lineTo(x-2,124);g.fill();
    for(let j=0;j<6;j++)R(g,x+hA(k,j,2)*8,86+hA(k,j,3)*36,1,1,'rgba(255,255,255,.8)');}
  for(let k=0;k<6;k++){const x=596+k*28;R(g,x,140,18,26,['#f6f4ee','#e0b040','#ff3ac8','#3af0ff','#c8ccd6','#9a4ad8'][k]);R(g,x,136,18,4,'#2a2238');}
  neonTexte(g,'VESTIAIRE',670,46,11,'#ffd23a');
  /* le cadre de l'écran géant, derrière le DJ */
  R(g,286,44,228,148,'#0a0610');R(g,286,44,228,3,'#5a5a6a');R(g,286,189,228,3,'#5a5a6a');
  /* LE SOL : un parquet noir verni, avec ses reflets */
  g.fillStyle=lin(g,0,MUR,0,H,[[0,'#1c0c28'],[1,'#0e0616']]);g.fillRect(0,MUR,W,H-MUR);
  for(let y=MUR;y<H;y+=10){R(g,0,y,W,1,'rgba(0,0,0,.35)');for(let x=(y/10%2)*36;x<W;x+=72)R(g,x,y,1,10,'rgba(0,0,0,.3)');}
  for(let k=0;k<7;k++){g.fillStyle='rgba(255,140,230,.035)';g.beginPath();g.ellipse(80+k*110,MUR+60+(k%3)*170,60,14,0,0,7);g.fill();}
  /* l'estrade du DJ */
  g.fillStyle='#0a0610';g.fillRect(292,MUR,216,52);R(g,292,MUR+52,216,10,'#1a1024');for(let k=0;k<27;k++)R(g,296+k*8,MUR+55,4,3,NEON[k%6]);
  /* LA PISTE : son cadre chromé, les dalles éteintes (elles s'allument au-dessus) */
  const P=PISTE;R(g,P.x0-8,P.y0-8,P.x1-P.x0+16,P.y1-P.y0+16,'#c8ccd6');R(g,P.x0-6,P.y0-6,P.x1-P.x0+12,P.y1-P.y0+12,'#3a3a4a');
  const tw=(P.x1-P.x0)/P.nx,th=(P.y1-P.y0)/P.ny;for(let i=0;i<P.nx;i++)for(let j=0;j<P.ny;j++){R(g,P.x0+i*tw+1,P.y0+j*th+1,tw-2,th-2,'#1e1430');R(g,P.x0+i*tw+1,P.y0+j*th+1,tw-2,2,'rgba(255,255,255,.06)');}
  /* les tapis du salon, de velours */
  for(const x of [120,680]){g.fillStyle='#3a0a3a';g.beginPath();g.ellipse(x,672,96,46,0,0,7);g.fill();g.strokeStyle='#e0b040';g.lineWidth=2;g.beginPath();g.ellipse(x,672,90,42,0,0,7);g.stroke();}
  /* le tapis rouge de l'entrée */
  R(g,366,590,68,H-590,'#a8101e');R(g,366,590,3,H-590,'#e0b040');R(g,431,590,3,H-590,'#e0b040');
  /* les portes du fond, en bas */
  R(g,330,H-14,140,14,'#2a1a10');R(g,330,H-14,140,2,'#e0b040');}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LE MOBILIER (gravé une fois) ---------- */
const CACHE={};
function graverBar(){if(CACHE.bar)return CACHE.bar;const Wd=196,Hd=48,s=44;const {c,g}=toile(Wd,Hd);
  g.fillStyle='rgba(0,0,0,.4)';g.fillRect(4,s-4,Wd-8,6);g.fillStyle=lin(g,0,12,0,s,[[0,'#2a1036'],[1,'#14061e']]);g.fillRect(4,12,Wd-8,s-12);
  for(let k=0;k<9;k++){g.fillStyle='rgba(255,255,255,.05)';g.fillRect(10+k*21,18,16,s-24);}
  R(g,4,s-6,Wd-8,2,'#3af0ff');R(g,0,6,Wd,8,'#d8dce6');R(g,0,6,Wd,2,'#ffffff');R(g,0,13,Wd,1,'#8a8ea0');
  for(const [x,cc] of [[30,'#ff3ac8'],[70,'#ffd23a'],[120,'#3af0ff'],[160,'#7aff6a']]){g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(x-4,0);g.lineTo(x+4,0);g.lineTo(x+1,5);g.lineTo(x-1,5);g.fill();R(g,x-.5,5,1,2,'#fff');g.fillStyle=cc;g.beginPath();g.moveTo(x-3,1);g.lineTo(x+3,1);g.lineTo(x,4);g.fill();}
  return CACHE.bar={toile:c,W:Wd,H:Hd,sol:s};}
function graverTabouret(){if(CACHE.tab)return CACHE.tab;const {c,g}=toile(20,30);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(10,27,7,2,0,0,7);g.fill();R(g,9,10,2,16,'#c8ccd6');R(g,5,24,10,2,'#c8ccd6');
  g.fillStyle='#c8102e';g.beginPath();g.ellipse(10,9,8,3.4,0,0,7);g.fill();g.fillStyle='#ff4a6a';g.beginPath();g.ellipse(10,8,7,2.4,0,0,7);g.fill();return CACHE.tab={toile:c,W:20,H:30,sol:27};}
function graverEnceinte(){if(CACHE.enc)return CACHE.enc;const Wd=40,Hd=94,s=90;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(2,s-3,Wd-4,6);
  R(g,3,4,Wd-6,s-4,'#141018');R(g,3,4,Wd-6,2,'#3a3448');for(const [y,r] of [[24,12],[58,14],[80,6]]){g.fillStyle='#08060c';g.beginPath();g.arc(Wd/2,y,r,0,7);g.fill();g.strokeStyle='#4a4458';g.lineWidth=1.4;g.stroke();g.fillStyle='#2a2434';g.beginPath();g.arc(Wd/2,y,r*.4,0,7);g.fill();}
  return CACHE.enc={toile:c,W:Wd,H:Hd,sol:s};}
function graverPlatines(){if(CACHE.pla)return CACHE.pla;const Wd=120,Hd=40,s=36;const {c,g}=toile(Wd,Hd);g.fillStyle=lin(g,0,10,0,s,[[0,'#2a2238'],[1,'#120c1a']]);g.fillRect(4,10,Wd-8,s-10);
  R(g,0,6,Wd,6,'#3a3448');R(g,0,6,Wd,1.4,'#6a6478');neonTexte(g,'DJ',Wd/2,24,11,'#3af0ff');R(g,4,s-3,Wd-8,2,'#ff3ac8');
  for(const x of [26,94]){g.fillStyle='#0a080e';g.beginPath();g.ellipse(x,6,16,4,0,0,7);g.fill();}return CACHE.pla={toile:c,W:Wd,H:Hd,sol:s};}
function graverBanquette(v){const k='bq'+v;if(CACHE[k])return CACHE[k];const Wd=150,Hd=60,s=54;const {c,g}=toile(Wd,Hd);const sx=v?-1:1;
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(Wd/2,s-2,70,8,0,0,7);g.fill();
  g.fillStyle='#5a0a4a';g.beginPath();g.ellipse(Wd/2,s-14,70,20,0,Math.PI,0);g.lineTo(Wd/2+70,s-8);g.ellipse(Wd/2,s-8,70,10,0,0,Math.PI);g.fill();
  g.fillStyle='#8a1a72';g.beginPath();g.ellipse(Wd/2,s-14,70,20,0,Math.PI,0);g.ellipse(Wd/2,s-14,56,12,0,0,Math.PI,true);g.fill();
  for(let k=0;k<9;k++){const a=Math.PI+k/8*Math.PI;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(Wd/2+Math.cos(a)*63,s-14+Math.sin(a)*16,1.6,1.6);}
  g.fillStyle='#b8288e';g.beginPath();g.ellipse(Wd/2,s-12,60,9,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(Wd/2,s-14,56,5,0,0,7);g.fill();
  /* la petite table ronde devant, avec deux verres */
  g.fillStyle='#e0b040';g.fillRect(Wd/2-1,s-24,2,12);g.fillStyle='#14061e';g.beginPath();g.ellipse(Wd/2,s-25,12,4,0,0,7);g.fill();g.strokeStyle='#e0b040';g.lineWidth=1;g.stroke();
  R(g,Wd/2-6,s-31,3,5,'rgba(255,90,200,.8)');R(g,Wd/2+3,s-30,3,4,'rgba(80,240,255,.8)');
  return CACHE[k]={toile:c,W:Wd,H:Hd,sol:s};}
function graverColonne(){if(CACHE.col)return CACHE.col;const Wd=26,Hd=150,s=146;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(Wd/2,s,12,3.4,0,0,7);g.fill();
  g.fillStyle=lin(g,2,0,Wd-2,0,[[0,'#1a1024'],[.5,'#3a2a4a'],[1,'#120a1a']]);g.fillRect(3,0,Wd-6,s);R(g,1,s-8,Wd-2,8,'#2a2238');for(let k=0;k<5;k++)R(g,3,20+k*24,Wd-6,2.4,NEON[k%6]);return CACHE.col={toile:c,W:Wd,H:Hd,sol:s};}
function graverPoteau(){if(CACHE.pot)return CACHE.pot;const {c,g}=toile(12,34);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(6,31,5,1.6,0,0,7);g.fill();R(g,5,6,2,24,'#e0b040');R(g,2,28,8,3,'#e0b040');g.fillStyle='#f6d878';g.beginPath();g.arc(6,5,3,0,7);g.fill();return CACHE.pot={toile:c,W:12,H:34,sol:31};}
function graverComptoirV(){if(CACHE.cv)return CACHE.cv;const Wd=150,Hd=44,s=40;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(4,s-3,Wd-8,5);g.fillStyle=lin(g,0,10,0,s,[[0,'#3a0a3a'],[1,'#1a0420']]);g.fillRect(4,10,Wd-8,s-10);
  R(g,0,6,Wd,6,'#e0b040');R(g,0,6,Wd,1.6,'#fff2b8');neonTexte(g,'ESSAYAGES',Wd/2,25,9,'#ff3ac8');R(g,4,s-3,Wd-8,2,'#ffd23a');return CACHE.cv={toile:c,W:Wd,H:Hd,sol:s};}
function graverTableHaute(){if(CACHE.th)return CACHE.th;const {c,g}=toile(30,44);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(15,41,9,2.4,0,0,7);g.fill();R(g,14,12,2,28,'#c8ccd6');R(g,9,38,12,2,'#c8ccd6');
  g.fillStyle='#14061e';g.beginPath();g.ellipse(15,11,13,4.4,0,0,7);g.fill();g.strokeStyle='#3af0ff';g.lineWidth=1.2;g.stroke();R(g,10,4,3,6,'rgba(255,210,58,.85)');R(g,17,5,3,5,'rgba(255,58,200,.85)');return CACHE.th={toile:c,W:30,H:44,sol:41};}
const VIDE=()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0});
const GRAVEURS={x_jol_club_bar_sol:graverBar,x_jol_club_tab_sol:graverTabouret,x_jol_club_enc_sol:graverEnceinte,x_jol_club_pla_sol:graverPlatines,x_jol_club_bq_sol:v=>graverBanquette(v),x_jol_club_col_sol:graverColonne,x_jol_club_pot_sol:graverPoteau,x_jol_club_cv_sol:graverComptoirV,x_jol_club_th_sol:graverTableHaute,x_jol_club_vide:VIDE};
function graver(t,v){const r=(GRAVEURS[t]||VIDE)(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* ---------- LES GENS ---------- */
const AP=(o)=>Object.assign({},DEF_AP,{bas:0,souliers:1,chaussures:'#1a1a22',sac:0,chapeau:0,raye:0,motif:0,barbe:0,_civil:true,_pnj:true},o);
const DANSEURS=[
  [260,350,{peau:2,cheveux:3,coiffe:6,_disco:'disco_paillettes'},'dz_twist',0],
  [340,330,{peau:5,cheveux:0,coiffe:1,barbe:1,_disco:'disco_travolta'},'dz_travolta',1.3],
  [470,340,{peau:1,cheveux:7,coiffe:12,_disco:'disco_lame'},'dz_kangourou',2.1],
  [550,400,{peau:4,cheveux:1,coiffe:0,barbe:3,_disco:'disco_leopard'},'dz_robot',.6],
  [250,460,{peau:3,cheveux:5,coiffe:7,_disco:'disco_arc'},'dz_poulet',3.2],
  [420,470,{peau:6,cheveux:4,coiffe:2,_disco:'disco_neon'},'dz_toupie',1.8],
  [540,520,{peau:2,cheveux:2,coiffe:14,_disco:'disco_boule'},'dz_travolta',4.1],
  [320,530,{peau:5,cheveux:3,coiffe:9,veste:'#e8302a',pantalon:'#1a1a22'},'dz_twist',2.6],
  [470,410,{peau:1,cheveux:6,coiffe:10,veste:'#2a6ad8',pantalon:'#f6f4ee',_lun:'lun_coeur'},'dz_moonwalk',.2]].map(([x,y,ap,k,o])=>({x,y,ap:AP(ap),k,o}));
const DJ={x:400,y:250,ap:AP({peau:4,cheveux:1,coiffe:1,barbe:3,_disco:'disco_boule'})};
const BARMAN={x:130,y:282,ap:AP({peau:2,cheveux:1,coiffe:9,haut:2,veste:'#16161c',pantalon:'#16161c',_bij:'bij_chaine_or'})};
const VENDEUSE={x:670,y:282,ap:AP({peau:3,cheveux:7,coiffe:6,_disco:'disco_roi'})};
const VIDEUR={x:458,y:700,ap:AP({peau:5,cheveux:0,coiffe:1,barbe:1,veste:'#0c0c10',pantalon:'#0c0c10',_lun:'lun_noires'})};
const MANNEQUINS=[[610,214,'disco_lame'],[730,214,'disco_roi']];
/* les places assises : tabourets du bar, banquettes du salon */
const SIEGES=[];for(const x of [64,104,156,196])SIEGES.push({x,h:340-14,ys:342,px:x,py:352,nom:'TABOURET'});
for(const bx of [120,680])for(const d of [-1,1])SIEGES.push({x:bx+d*44,h:676-12,ys:678,px:bx+d*44,py:690,nom:'BANQUETTE'});
const ASSIS_PNJ=[[0,AP({peau:6,cheveux:4,coiffe:4,_disco:'disco_neon'})],[5,AP({peau:1,cheveux:2,coiffe:5,veste:'#ff3ac8',pantalon:'#2a2a34'})],[7,AP({peau:3,cheveux:3,coiffe:3,barbe:2,_disco:'disco_travolta'})]];
function asseoir(S){try{joueur.x=S.px;joueur.y=S.py;joueur.marche=false;window.MOI_ASSIS={x:S.x,h:S.h,ys:S.ys,px:S.px,py:S.py};vibrer(8);texteVolant(S.x,S.h-40,'bouge pour te lever','#ffd8f4');}catch(x){}}
setInterval(()=>{try{const A=window.MOI_ASSIS;if(!A||typeof joueur==='undefined')return;if(Math.abs(joueur.x-A.px)>3||Math.abs(joueur.y-A.py)>3)window.MOI_ASSIS=null;}catch(x){}},120);

/* ce qui ne bouge pas est peint une fois (sprite), ce qui est hors champ n'est pas peint */
const SPR=new Map();
function poser(g,k,x,y,w,h,ox,oy,fn){const E=Math.max(1,Math.min(4,Math.round(g.getTransform?g.getTransform().a:2)||2)),key=k+'@'+E;let c=SPR.get(key);
  if(!c){c=document.createElement('canvas');c.width=Math.ceil(w*E);c.height=Math.ceil(h*E);const q=c.getContext('2d');q.setTransform(E,0,0,E,ox*E,oy*E);const sG=GESTE;try{GESTE={t:0};fn(q);}catch(z){}finally{GESTE=sG;}SPR.set(key,c);}
  g.drawImage(c,Math.round(x)-ox,Math.round(y)-oy,w,h);}
const vu=(x,y,cx,cy,m,up)=>{const X=x-cx,Y=y-cy;return X>-m&&X<VW+m&&Y>-60&&Y<VH+(up||90);};

/* ---------- LA LUMIÈRE QUI BOUGE ---------- */
/* LA PISTE, DOUCEMENT : des couleurs qui glissent lentement d'une dalle à l'autre, sans clignoter */
function dessinerPiste(g,cx,cy){const t=now(),P=PISTE,tw=(P.x1-P.x0)/P.nx,th=(P.y1-P.y0)/P.ny;
  for(let i=0;i<P.nx;i++)for(let j=0;j<P.ny;j++){const x=P.x0+i*tw+1-cx,y=P.y0+j*th+1-cy;if(x>VW||y>VH||x<-tw||y<-th)continue;
    const v=.5+.5*Math.sin(t*.9-i*.45-j*.6),h=(i*14+j*22+t*12)%360;
    g.fillStyle='hsla('+h+',70%,55%,'+(.12+v*.26)+')';g.fillRect(x,y,tw-2,th-2);g.fillStyle='rgba(255,255,255,'+(.04+v*.08)+')';g.fillRect(x+3,y+3,tw-8,2);}
  /* les éclats de la boule à facettes, qui glissent sur la piste, les murs, partout */
  for(let k=0;k<22;k++){const a=k*2.399+t*.12,r=40+hA(k,1,7)*420,x=400+Math.cos(a)*r-cx,y=430+Math.sin(a)*r*.7-cy;if(x<-4||y<-4||x>VW+4||y>VH+4)continue;
    const al=.18+.14*Math.sin(t*.8+k);g.fillStyle='rgba(255,255,255,'+al+')';g.fillRect(x,y,2.4,1.6);}
  /* l'écran géant derrière le DJ : un égaliseur */
  if(cy<200){const x0=290-cx,y0=48-cy;g.fillStyle='#120820';g.fillRect(x0,y0,220,140);
    for(let k=0;k<22;k++){const h=20+Math.abs(Math.sin(t*1.6+k*.5)*Math.cos(t*.9+k*.3))*90;for(let s=0;s<h;s+=6){g.fillStyle=NEON[Math.floor((s/120)*6)%6];g.fillRect(x0+4+k*10,y0+136-s-5,8,5);}}
    g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x0,y0,220,40);}
  /* les néons des murs, qui respirent */
  if(cy<30){const al=.5+.5*Math.sin(t*2);g.fillStyle='rgba(58,240,255,'+(.25*al)+')';g.fillRect(-cx,20-cy,W,10);}}
function dessinerPlafond(g,cx,cy){const t=now();
  /* les faisceaux qui balaient la salle */
  for(let k=0;k<6;k++){const sx=k<3?40:760,sy=-10,a=Math.sin(t*.25+k*1.1)*.45+(k<3?.9:2.25),L=900,h=(k*60+t*15)%360;const ex=sx+Math.cos(a)*L,ey=sy+Math.sin(a)*L;
    g.fillStyle='hsla('+h+',90%,65%,.05)';g.beginPath();g.moveTo(sx-cx,sy-cy);g.lineTo(ex-cx-30,ey-cy);g.lineTo(ex-cx+30,ey-cy);g.fill();}
  /* la boule à facettes, au-dessus du centre de la piste */
  const bx=400-cx,by=318-cy,r=16;if(by>-40&&by<VH+40&&bx>-40&&bx<VW+40){g.strokeStyle='#8a8aa0';g.lineWidth=.8;g.beginPath();g.moveTo(bx,by-r-260);g.lineTo(bx,by-r);g.stroke();
    g.save();g.beginPath();g.arc(bx,by,r,0,7);g.clip();for(let y=-r;y<r;y+=3.4)for(let x=-r;x<r;x+=3.4){const v=hA(Math.floor((x+r+t*4)/3.4)&31,Math.floor((y+r)/3.4),Math.floor(t*1.5)%8);g.fillStyle=v<.12?'#ffffff':v<.45?'#c8ccdc':v<.8?'#8a8ea4':'#5a5e74';g.fillRect(bx+x,by+y,3,3);}g.restore();
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(bx,by,r+6,0,7);g.fill();}}
function dessinerDanseur(g,cx,cy,D){const t=now()+D.o*1.7,Dz=DANSES[D.k],tt=t%(Dz.D+1.2);if(!vu(D.x,D.y,cx,cy,70,120))return;
  try{if(tt>Dz.D)personne(g,D.x-cx,D.y-cy,D.ap,'bas',0,false);else danseur(g,D.x-cx,D.y-cy,D.ap,D.k,tt);}catch(z){}}
function acteurs(){const L=[];
  L.push({y:-1e5,f:(g,cx,cy)=>dessinerPiste(g,cx,cy)});
  for(const D of DANSEURS)L.push({get y(){return D.y;},f:(g,cx,cy)=>dessinerDanseur(g,cx,cy,D)});
  L.push({y:DJ.y,f:(g,cx,cy)=>{if(vu(DJ.x,DJ.y,cx,cy,60))try{danseur(g,DJ.x-cx,DJ.y-cy,DJ.ap,'dz_travolta',now()%8);}catch(z){}}});
  for(const P of [BARMAN,VENDEUSE,VIDEUR])L.push({y:P.y,f:(g,cx,cy)=>{if(vu(P.x,P.y,cx,cy,40))poser(g,'p'+P.x,P.x-cx,P.y-cy,60,80,30,64,q=>personne(q,0,0,P.ap,'bas',0,false));}});
  for(const [x,y,k] of MANNEQUINS)L.push({y,f:(g,cx,cy)=>{if(!vu(x,y,cx,cy,40))return;const T=now();g.fillStyle='#2a2238';g.fillRect(x-cx-8,y-cy-2,16,4);
    poser(g,'m'+k,x-cx,y-cy,60,80,30,64,q=>personne(q,0,0,AP({peau:0,cheveux:0,coiffe:1,_disco:k}),'bas',0,false));g.fillStyle='rgba(255,255,255,'+(.4+.4*Math.sin(T*3+x))+')';g.fillRect(x-cx-1,y-cy-30,2,2);}});
  for(const [i,ap] of ASSIS_PNJ){const S=SIEGES[i];L.push({y:S.ys,f:(g,cx,cy)=>{if(vu(S.x,S.ys,cx,cy,40))poser(g,'a'+i,S.x-cx,S.h-cy,60,90,30,62,q=>assis(q,0,0,ap));}});}
  L.push({y:1e5,f:(g,cx,cy)=>dessinerPlafond(g,cx,cy)});
  return L;}
function figurants(){return [];}

/* ---------- CE QU'ON PEUT FAIRE ---------- */
async function ouvrirVestiaire(){try{if(!window.ouvrirDisco)eval(await chargerMorceau('disco.js'));window.ouvrirDisco();}catch(x){try{console.warn('DISCO',x);}catch(_){}}}
function danser(){try{ouvrirEmotes();}catch(x){}}
function cocktail(){try{e.ap=Object.assign({},e.ap||{},{_tasse:{k:'jus',f:Date.now()+30000}});vibrer([8,30,8]);texteVolant(joueur.x,joueur.y-58,['Un cocktail sans alcool, offert !','À la santé des danseurs !','Avec une paille fluo !'][Math.floor(Math.random()*3)],'#3af0ff');}catch(x){}}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_club_bar_sol',130,300,{col:[196,26]});P('x_jol_club_vide',130,322,{agir:cocktail,libelle:'Un cocktail',nom:'LE BAR',demi:70});
  for(const x of [64,104,156,196])P('x_jol_club_tab_sol',x,344,{});
  P('x_jol_club_cv_sol',670,300,{col:[150,24]});P('x_jol_club_vide',670,322,{agir:ouvrirVestiaire,libelle:'Essayer',nom:'LE VESTIAIRE DISCO',demi:70});
  P('x_jol_club_pla_sol',400,268,{col:[120,20]});P('x_jol_club_vide',400,240,{col:[216,60]});
  P('x_jol_club_enc_sol',262,270,{col:[40,16]});P('x_jol_club_enc_sol',538,270,{col:[40,16]});
  P('x_jol_club_bq_sol',120,680,{col:[140,24],v:0});P('x_jol_club_bq_sol',680,680,{col:[140,24],v:1});
  for(const x of [36,764])P('x_jol_club_col_sol',x,560,{col:[24,10]});
  for(const [x,y] of [[160,420],[640,420],[160,520],[640,520]])P('x_jol_club_th_sol',x,y,{col:[22,8]});
  for(let y=620;y<=760;y+=46){P('x_jol_club_pot_sol',352,y,{col:[10,6]});P('x_jol_club_pot_sol',448,y,{col:[10,6]});}
  P('x_jol_club_vide',400,430,{agir:danser,libelle:'Danser',nom:'LA PISTE',demi:150});
  SIEGES.forEach((S,i)=>{if(ASSIS_PNJ.some(a=>a[0]===i))return;P('x_jol_club_vide',S.px,S.py,{agir:()=>asseoir(S),libelle:'S’asseoir',nom:S.nom,demi:16});});
  DECOR=D;return D;}
let DECOR=[];
function bloque(x,y){if(x<14||x>W-14||y<MUR+16||y>H-6)return true;
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  for(const D of DANSEURS)if(Math.abs(x-D.x)<7&&Math.abs(y-D.y)<5)return true;
  return false;}

/* ---------- L'AMBIANCE ---------- */
setInterval(()=>{try{if(typeof SON_PRET!=='undefined'&&SON_PRET&&!document.hidden)musiqueDisco(true);}catch(x){}},800);
/* LA SORTIE : par les portes du bas, on retrouve la place */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-24){PARTI=true;try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#12061e;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=club'+v+'&t='+Date.now();},480);}}catch(x){}},150);
setTimeout(()=>{const v=document.getElementById('voileDC');if(v){v.style.opacity='0';setTimeout(()=>v.remove(),800);}},700);

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,acteurs};
})()
