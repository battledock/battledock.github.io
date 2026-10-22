/* =====================================================================
   LA FERME — tout ce qui ne vit qu'ici : le champ libre et sa barre
   d'outils, les parcelles au doigt, la maison, les chemins, la clôture,
   l'étal, les lampadaires, les chênes, la station de métro, le
   poulailler, la porcherie, le pré à moutons, le boulodrome et sa
   partie de pétanque, le rucher et le cabanon.

   CE FICHIER N'EST PAS UN MODULE À PART : jeu.html va chercher son texte
   et l'évalue dans sa propre portée, à l'endroit exact où ce code se
   trouvait — comme il le fait déjà pour port.js. La ferme voit donc tout
   le jeu (joueur, sac, appelRPC, dessin…) sans rien importer, et le jeu
   ne connaît d'elle que les 35 noms rendus tout en bas.

   Il n'est chargé que sur la carte de la ferme.
   ===================================================================== */

/* =====================================================================
   LE CHAMP LIBRE : on bêche où on veut, case par case, sans menu.
   Une barre d'outils (houe, graines, arrosoir, faucille) et un gros
   bouton qu'on garde appuyé en marchant le long d'un rang. La météo est
   la même pour tous (pluie = tout est arrosé), la saison suit le
   calendrier et accélère les cultures de saison. Il remplace le carré
   de vingt-quatre planches, au même endroit : chaque ancienne planche
   est devenue trois cases plantées de la même chose.
   ===================================================================== */
const CH_T=20, CH_X0=FERME_VIERGE?590:138, CH_Y0=FERME_VIERGE?440:511, CH_C=FERME_VIERGE?12:45, CH_R=FERME_VIERGE?16:9;   /* la nouvelle ferme : un carré de 30 x 20 cases, à gauche du chemin */
let CH={t:{},max:40,meteo:null,decal:0,charge:false,sale:true,sol:null}, CH_OUTIL='houe', CH_GRAINE='radis', CH_ENVOL=false, CH_DERN=null, CH_TENIR=null;
const chCle=(c,r)=>c+','+r;
const chNow=()=>Date.now()+CH.decal;
const chDans=(x,y)=>x>=CH_X0&&x<CH_X0+CH_C*CH_T&&y>=CH_Y0&&y<CH_Y0+CH_R*CH_T;
const chPres=()=>CHAMP_LIBRE&&joueur.x>CH_X0-30&&joueur.x<CH_X0+CH_C*CH_T+30&&joueur.y>CH_Y0-34&&joueur.y<CH_Y0+CH_R*CH_T+34;
function chStade(T){if(!T||!T.cult)return -1;const t0=new Date(T.t0).getTime(), m=new Date(T.mur_a).getTime(), k=(chNow()-t0)/Math.max(1,m-t0);return k>=1?3:(k>0.6?2:(k>0.2?1:0));}
/* LA CASE VISEE : un pas devant les pieds, dans le sens où l'on regarde */
function chCible(){const d=joueur.dir||'bas', dx=d==='gauche'?-14:(d==='droite'?14:0), dy=d==='haut'?-16:(d==='bas'?12:0);
const x=joueur.x+dx, y=joueur.y+dy-4;if(!chDans(x,y))return null;
return {c:Math.floor((x-CH_X0)/CH_T),r:Math.floor((y-CH_Y0)/CH_T)};}
function chAdopter(d){if(!d||d.erreur)return false;CH.t={};(d.tuiles||[]).forEach(T=>CH.t[chCle(T.c,T.r)]=T);CH.max=d.max||40;CH.off=d.offertes||{};CH.meteo=d.meteo||null;CH.arr={};(d.arroseurs||[]).forEach(a=>CH.arr[a[0]+','+a[1]]=1);CH.stockArr=d.stock_arroseurs||0;
if(d.now)CH.decal=new Date(d.now).getTime()-Date.now();if(d.debloque)POT.debloque=d.debloque;CH.charge=true;CH.sale=true;chMajBarre();return true;}
async function chCharger(){if(!CHAMP_LIBRE||!e.id||CH_ENVOL)return;CH_ENVOL=true;try{chAdopter(await appelRPC('champ_etat',{p_joueur:e.id}));}catch(x){}finally{CH_ENVOL=false;}}
const chNb=()=>Object.keys(CH.t).length;
const chPrix=(k)=>Math.ceil(POT_CULT[k][1]/3);
/* les graines offertes (niveaux, coffres) passent avant l'argent : le serveur fait pareil */
const chOff=(k)=>(CH.off&&CH.off[k])||0, chPrixEff=(k)=>chOff(k)>0?0:chPrix(k);
const chSaisons={printemps:['radis','salade','carottes','fraises','pommes_terre','oignons'],ete:['tomates','courgettes','melon','pasteque','poivrons','aubergines','mais','tournesol','lavande'],
automne:['citrouille','pommes_terre','oignons','ble','safran','carottes'],hiver:['radis','salade','carottes','oignons','ble']};
const chDeSaison=(k)=>!!(CH.meteo&&(chSaisons[CH.meteo.saison]||[]).includes(k));
const CH_SAISON_NOM={printemps:'🌸 Printemps',ete:'☀️ Été',automne:'🍂 Automne',hiver:'❄️ Hiver'};
/* LE GESTE, sur une case. Optimiste : la case change tout de suite, le serveur confirme. */
let CH_ICI=null, CH_MUET=false, CH_CUMUL=0, CH_PTS=0;
const chPoints=(k)=>Math.max(1,Math.round(Math.sqrt(POT_CULT[k][2])*1.5));   /* radis 3 · carottes 8 · tomates 12 · 9 h → 35, par case */const chTx=()=>CH_ICI?CH_ICI.x:joueur.x, chTy=()=>CH_ICI?CH_ICI.y:joueur.y;
async function chGeste(c,r){
const k=chCle(c,r), T=CH.t[k], s=chStade(T);let outil=CH_OUTIL;
if(T&&T.cult&&s===3)outil='faux';                       /* ce qui est mûr se récolte, quel que soit l'outil */
if(outil==='graine'&&!T){await chEnvoyer(c,r,'houe');if(!CH.t[k])return;}
const T2=CH.t[k];
if(outil==='houe'&&T2)return;
if(outil==='graine'&&(!T2||T2.cult))return;
if(outil==='eau'&&(!T2||T2.eau))return;
if(outil==='faux'&&(!T2||(T2.cult&&chStade(T2)<3))){if(T2&&T2.cult)texteVolant(chTx(),chTy()-56,'Pas encore mûr','#fff3d0');return;}
if(outil==='graine'){if(!potLibre(CH_GRAINE)){texteVolant(chTx(),chTy()-56,'Graine à débloquer chez Madeleine','#ffe8a0');return;}
if((e.euros||0)<chPrixEff(CH_GRAINE)){texteVolant(chTx(),chTy()-56,'Pas assez d’argent','#ffe8a0');return;}}
await chEnvoyer(c,r,outil==='faux'&&T2&&!T2.cult?'arracher':outil);}
async function chEnvoyer(c,r,outil){
const k=chCle(c,r), avant=CH.t[k]?Object.assign({},CH.t[k]):null, now=new Date(chNow()).toISOString();
/* l'effet tout de suite */
if(outil==='houe'){if(chNb()>=CH.max){texteVolant(chTx(),chTy()-56,'Champ plein ('+CH.max+' cases) · agrandis-le','#ffe8a0');chOuvrirGraines();return;}
CH.t[k]={c,r,cult:null,eau:!!(CH.meteo&&CH.meteo.pluie)};potGeste('houe');vibrer(10);chPoussiere(c,r,'#8e7550');}
else if(outil==='graine'){const m=POT_CULT[CH_GRAINE][2]*60000*(chDeSaison(CH_GRAINE)?0.75:1)*(CH.t[k].eau?1:2);
CH.t[k]=Object.assign({},CH.t[k],{cult:CH_GRAINE,t0:now,mur_a:new Date(chNow()+m).toISOString()});if(chOff(CH_GRAINE)>0){CH.off[CH_GRAINE]--;CH.offPris=CH_GRAINE;}else{CH.offPris=null;e.euros=(e.euros||0)-chPrix(CH_GRAINE);}try{majHaut();}catch(x){}vibrer(8);chPoussiere(c,r,'#6a9a3a');}
else if(outil==='eau'){const T=CH.t[k];let mu=T.mur_a;if(T.cult&&new Date(mu).getTime()>chNow())mu=new Date(chNow()+(new Date(mu).getTime()-chNow())/2).toISOString();
CH.t[k]=Object.assign({},T,{eau:true,mur_a:mu});POT_ARROSE=Date.now();potGeste('arrose');vibrer(10);chGouttes(c,r);}
else if(outil==='faux'){potGeste('cueille');vibrer([14,30,14]);chEtoiles(c,r);const cu=CH.t[k].cult;CH.t[k]=Object.assign({},CH.t[k],{cult:cu==='lavande'?'lavande':null,t0:now,mur_a:now,eau:false});}
else if(outil==='arracher'){delete CH.t[k];vibrer(8);chPoussiere(c,r,'#7d9450');}
CH.sale=true;chMajBarre();
const d=await appelRPC('champ_geste',{p_joueur:e.id,p_c:c,p_r:r,p_outil:outil,p_cult:outil==='graine'?CH_GRAINE:null});
if(!d||d.erreur){if(avant)CH.t[k]=avant;else delete CH.t[k];if(outil==='graine'&&CH.offPris){CH.off[CH.offPris]=(CH.off[CH.offPris]||0)+1;CH.offPris=null;}CH.sale=true;chMajBarre();
const er=d&&d.erreur;texteVolant(chTx(),chTy()-58,er==='pas_assez'?'Pas assez d’argent':er==='sac_plein'?'Inventaire plein : va vendre à la boutique':er==='max'?'Champ plein · agrandis-le':er==='verrou'?'Graine à débloquer':er==='pas_mur'?'Pas encore mûr':'Réessaie dans un instant','#ffd0a0');
if(er==='pas_assez'||er==='graine'||er==='verrou')try{lireSacServeur();}catch(x){}return;}
if(d.tuile)CH.t[k]=d.tuile;else delete CH.t[k];
if(typeof d.euros==='number'){e.euros=d.euros;try{majHaut();}catch(x){}}
if(outil==='faux'){if(d.nb)CH_CUMUL+=d.nb;const nom=avant&&POT_CULT[avant.cult]?POT_CULT[avant.cult][0]:'';
/* LES POINTS DU CLASSEMENT : plus la culture a mis longtemps à pousser, plus elle rapporte (racine du temps, pour rester juste) */
let pts=0;try{pts=+d.pts||0;if(pts){marquer('champ',pts);CH_PTS+=pts;}}catch(x){}   /* compté par le serveur (progres), le classement suit tout seul */
if(d.sac){e.sac=d.sac;try{sauver();majHaut();}catch(x){}}
if(!CH_MUET)texteVolant(chTx(),chTy()-58,d.nb?('+'+d.nb+' '+nom+(pts?' · +'+pts+' pts':'')):(d.gerbe?'+1 gerbe pour tes poules':'Blé fauché'),'#ffe070');try{jouer('vente','moment');}catch(x){}}
CH.sale=true;chMajBarre();}
/* ================= LE DESSIN ================= */
function chGraverSol(){const W=CH_C*CH_T, H=CH_R*CH_T, D=2, c=document.createElement('canvas');c.width=W*D;c.height=H*D;const g=c.getContext('2d');
g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
for(const k in CH.t){const T=CH.t[k], x=T.c*CH_T, y=T.r*CH_T, w=T.eau;
/* la motte : un carré de terre aux bords arrondis, des sillons, un peu de relief */
const vois=(dc,dr)=>!!CH.t[chCle(T.c+dc,T.r+dr)];
g.fillStyle=w?'#5a432c':'#86684a';g.fillRect(x+(vois(-1,0)?0:1),y+(vois(0,-1)?0:1),CH_T-(vois(-1,0)?0:1)-(vois(1,0)?0:1),CH_T-(vois(0,-1)?0:1)-(vois(0,1)?0:1));
for(let s=0;s<4;s++){g.fillStyle=w?'#4a3624':'#6f5538';g.fillRect(x+(vois(-1,0)?0:2),y+4+s*5,CH_T-(vois(-1,0)?0:2)-(vois(1,0)?0:2),1.5);g.fillStyle=w?'#6a5038':'#9a7c58';g.fillRect(x+(vois(-1,0)?0:2),y+3+s*5,CH_T-(vois(-1,0)?0:2)-(vois(1,0)?0:2),1);}
for(let q=0;q<5;q++){const a=PR_h(T.c,T.r*7+q,71), b=PR_h(T.r,T.c*5+q,73);g.fillStyle=w?'#3f2e1f':'#a88866';g.fillRect(x+2+a*(CH_T-5),y+2+b*(CH_T-5),1.5,1);}
if(!vois(0,1)){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x+1,y+CH_T-1,CH_T-2,1);}
if(w){g.fillStyle='rgba(150,200,235,.35)';for(let q=0;q<3;q++)g.fillRect(x+3+PR_h(T.c,q,75)*(CH_T-6),y+3+PR_h(T.r,q,77)*(CH_T-6),1,1);}}
return c;}
function chPiquets(g,camX,camY){/* quatre piquets et un ruban : le terrain qu'on peut bêcher */
const x0=CH_X0-2, y0=CH_Y0-2, x1=CH_X0+CH_C*CH_T+2, y1=CH_Y0+CH_R*CH_T+2;
[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].forEach(([x,y])=>{PX(g,x-camX-0.5,y-camY-7,1.5,8,'#7a5a34');PX(g,x-camX-1,y-camY-8,2.5,1.5,'#d8b060');});
g.save();g.globalAlpha=0.22;g.strokeStyle='#f0e0b0';g.setLineDash([2,3]);g.lineWidth=0.5;g.strokeRect(x0-camX,y0-camY,x1-x0,y1-y0);g.restore();}
const CH_PART=[], CH_VIE=[];
function chPoussiere(c,r,col){const x=CH_X0+c*CH_T+CH_T/2, y=CH_Y0+r*CH_T+CH_T/2;for(let i=0;i<10;i++)CH_PART.push({x:x+(Math.random()-0.5)*12,y:y,vx:(Math.random()-0.5)*0.03,vy:-0.02-Math.random()*0.03,g:0.00012,v:500,c:col,t:0});}
function chGouttes(c,r){const x=CH_X0+c*CH_T+CH_T/2, y=CH_Y0+r*CH_T+2;for(let i=0;i<12;i++)CH_PART.push({x:x+(Math.random()-0.5)*12,y:y-6,vx:(Math.random()-0.5)*0.02,vy:0.02+Math.random()*0.03,g:0.0001,v:420,c:'#9fd4f0',t:0});}
function chEtoiles(c,r){const x=CH_X0+c*CH_T+CH_T/2, y=CH_Y0+r*CH_T+CH_T/2-6;for(let i=0;i<14;i++){const a=i/14*6.283;CH_PART.push({x,y,vx:Math.cos(a)*0.04,vy:Math.sin(a)*0.04-0.02,g:0.00005,v:520,c:i%2?'#fff3a0':'#ffd040',t:0});}}
/* LA VIE AUTOUR : papillons le jour, lucioles la nuit, oiseaux qui picorent, pluie et saison */
let CH_AMB_T=0;
function chAmbiance(dt){
const ciel=(()=>{try{return cielDuMoment();}catch(x){return null;}})(), nuit=!!(ciel&&ciel.lampes>0.5), pluie=!!(CH.meteo&&CH.meteo.pluie), sa=CH.meteo?CH.meteo.saison:'automne';
const papillons=CH_VIE.filter(v=>v.t==='pap').length, lucioles=CH_VIE.filter(v=>v.t==='luc').length, oiseaux=CH_VIE.filter(v=>v.t==='ois').length;
if(!nuit&&!pluie&&sa!=='hiver'&&papillons<5)CH_VIE.push({t:'pap',x:CH_X0+Math.random()*CH_C*CH_T,y:CH_Y0-30+Math.random()*(CH_R*CH_T+60),a:Math.random()*6,c:['#fff6c0','#ffb0d0','#a8d8ff','#ffd060'][Math.floor(Math.random()*4)],ph:Math.random()*6});
if(nuit&&!pluie&&lucioles<12)CH_VIE.push({t:'luc',x:CH_X0+Math.random()*CH_C*CH_T,y:CH_Y0-20+Math.random()*(CH_R*CH_T+40),a:Math.random()*6,ph:Math.random()*6});
const tuiles=Object.values(CH.t);
if(!nuit&&!pluie&&oiseaux<3&&tuiles.length&&Math.random()<dt/4000){const T=tuiles[Math.floor(Math.random()*tuiles.length)];CH_VIE.push({t:'ois',x:CH_X0+T.c*CH_T+CH_T/2,y:CH_Y0+T.r*CH_T+CH_T/2,e:'arrive',k:0,dx:Math.random()<0.5?-1:1,h:30});}
for(let i=CH_VIE.length-1;i>=0;i--){const v=CH_VIE[i];
if(v.t==='pap'){v.a+=(Math.random()-0.5)*0.004*dt;v.x+=Math.cos(v.a)*0.012*dt;v.y+=Math.sin(v.a)*0.008*dt;v.ph+=dt*0.02;if(nuit||pluie||v.x<CH_X0-80||v.x>CH_X0+CH_C*CH_T+80||v.y<CH_Y0-90||v.y>CH_Y0+CH_R*CH_T+90)CH_VIE.splice(i,1);}
else if(v.t==='luc'){v.a+=(Math.random()-0.5)*0.003*dt;v.x+=Math.cos(v.a)*0.006*dt;v.y+=Math.sin(v.a)*0.005*dt;v.ph+=dt*0.004;if(!nuit||pluie)CH_VIE.splice(i,1);}
else if(v.t==='ois'){const d=Math.hypot(joueur.x-v.x,joueur.y-v.y);
if(v.e==='arrive'){v.h=Math.max(0,v.h-dt*0.05);if(v.h<=0)v.e='picore';}
else if(v.e==='picore'){v.k+=dt;if(Math.random()<dt/900){v.x+=v.dx*3;if(Math.random()<0.3)v.dx=-v.dx;}if(d<46||v.k>14000||pluie)v.e='part';}
else{v.h+=dt*0.08;v.x+=v.dx*dt*0.06;if(v.h>80)CH_VIE.splice(i,1);}}}
for(let i=CH_PART.length-1;i>=0;i--){const p=CH_PART[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;if(p.t>p.v)CH_PART.splice(i,1);}}
function chDessinAmbiance(g,camX,camY,VW2,VH2){
const t=Date.now(), pluie=!!(CH.meteo&&CH.meteo.pluie), sa=CH.meteo?CH.meteo.saison:'automne';
for(const v of CH_VIE){const x=v.x-camX, y=v.y-camY;if(x<-10||y<-10||x>VW2+10||y>VH2+10)continue;
if(v.t==='pap'){const o=Math.sin(v.ph)>0;PX(g,x-(o?1.5:0.5),y,o?1.5:0.5,1,v.c);PX(g,x+0.5,y,o?1.5:0.5,1,v.c);PX(g,x,y,0.5,1.2,'#3a2a1a');}
else if(v.t==='luc'){const a=0.4+0.6*Math.max(0,Math.sin(v.ph*3));g.fillStyle='rgba(220,255,140,'+(a*0.25)+')';g.beginPath();g.arc(x,y,2.5,0,7);g.fill();PX(g,x-0.25,y-0.25,0.75,0.75,'rgba(240,255,170,'+a+')');}
else if(v.t==='ois'){const yy=y-v.h, vol=v.e!=='picore', ai=vol&&Math.floor(t/80)%2;
if(!vol){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-1.5,y+0.5,3,0.75);}
PX(g,x-1.5,yy-2,3,2,'#6a4a32');PX(g,x+(v.dx>0?1:-2),yy-3,1.5,1.5,'#6a4a32');PX(g,x+(v.dx>0?2.5:-2.5),yy-2.5,0.75,0.5,'#e8a030');
if(vol)PX(g,x-2,yy-(ai?4:1.5),4,0.75,'#4a3222');else if(Math.floor(t/300+v.x)%3===0)PX(g,x+(v.dx>0?2:-2.5),yy-1,0.75,0.75,'#6a4a32');}}
for(const p of CH_PART)PX(g,p.x-camX,p.y-camY,1,1,p.c);
/* la pluie, ou la neige en hiver, et les feuilles qui tombent en automne */
if(pluie){g.fillStyle=sa==='hiver'?'rgba(220,230,245,.10)':'rgba(50,62,84,.16)';g.fillRect(0,0,VW2,VH2);g.strokeStyle=sa==='hiver'?'rgba(255,255,255,.75)':'rgba(190,215,240,.45)';g.lineWidth=0.5;g.beginPath();
for(let i=0;i<70;i++){const sx=(PR_h(i,1,81)*VW2*1.3+t*(sa==='hiver'?0.01:0.05))%(VW2+20)-10, sy=(PR_h(i,2,83)*VH2+t*(sa==='hiver'?0.03:0.22)*(0.8+PR_h(i,3,85)*0.4))%(VH2+10)-5;
if(sa==='hiver'){g.moveTo(sx,sy);g.lineTo(sx+0.6,sy+0.6);}else{g.moveTo(sx,sy);g.lineTo(sx-1.2,sy+5);}}g.stroke();}
else if(sa==='automne'){for(let i=0;i<9;i++){const sx=(PR_h(i,5,87)*VW2+t*0.012+Math.sin(t/900+i)*8)%(VW2+20)-10, sy=(PR_h(i,6,89)*VH2+t*0.018)%(VH2+10)-5;
PX(g,sx,sy,1.5,1,['#d8782a','#e8a83a','#b8502a'][i%3]);}}
else if(sa==='printemps'){for(let i=0;i<7;i++){const sx=(PR_h(i,7,91)*VW2+t*0.01+Math.sin(t/700+i)*6)%(VW2+20)-10, sy=(PR_h(i,8,93)*VH2+t*0.014)%(VH2+10)-5;PX(g,sx,sy,1,1,'#ffd0e0');}}}
let CH_PREC=0;
function chDessinFerme(g,camX,camY,VW2,VH2,acteurs){
if(FERME_VIERGE){if(CHAMP_LIBRE&&CH.charge){const now=Date.now(), dt=Math.min(60,now-(CH_PREC||now));CH_PREC=now;chAmbiance(dt);fmDessinerParcelles(g,camX,camY,VW2,VH2,acteurs);acteurs.push({y:1e9,f:()=>chDessinAmbiance(g,camX,camY,VW2,VH2)});}return;}
if(CHAMP_LIBRE&&CH.charge){const now=Date.now(), dt=Math.min(60,now-(CH_PREC||now));CH_PREC=now;chAmbiance(dt);
const W=CH_C*CH_T, H=CH_R*CH_T;
if(CH_X0+W-camX>-10&&CH_X0-camX<VW2+10&&CH_Y0+H-camY>-30&&CH_Y0-camY<VH2+30){
if(CH.sale||!CH.sol){CH.sol=chGraverSol();CH.sale=false;}
g.drawImage(CH.sol,Math.round(CH_X0-camX),Math.round(CH_Y0-camY),W,H);if(!FERME_VIERGE)chPiquets(g,camX,camY);
const ci=chPres()?chCible():null;
if(ci){const x=CH_X0+ci.c*CH_T-camX, y=CH_Y0+ci.r*CH_T-camY, T=CH.t[chCle(ci.c,ci.r)], ok=!(CH_OUTIL==='houe'&&T)||(T&&chStade(T)===3);
const co=ok?'rgba(255,246,190,.95)':'rgba(255,255,255,.4)', L=4;
[[0,0,1,1],[CH_T,0,-1,1],[0,CH_T,1,-1],[CH_T,CH_T,-1,-1]].forEach(([a,b,sx,sy])=>{PX(g,x+a-(sx<0?1:0),y+b-(sy<0?1:0),sx*L>0?L:1,1,co);PX(g,x+a-(sx<0?1:0),y+b-(sy<0?1:0)-(sy<0?L-1:0),1,L,co);});}
for(const k in CH.t){const T=CH.t[k];if(!T.cult||!PLANTES[T.cult])continue;const x=CH_X0+T.c*CH_T+CH_T/2, y=CH_Y0+T.r*CH_T+CH_T-5, s=chStade(T);
if(x-camX<-20||x-camX>VW2+20||y-camY<-30||y-camY>VH2+30)continue;
const bal=s>=2?Math.round(Math.sin(now/700+T.c*0.7+T.r)*0.6*2)/2:0;
acteurs.push({y:y,f:()=>{poserPlant(g,T.cult,s,x-camX+bal,y-camY,2);
if(s===3){const tw=Math.sin(now/260+T.c);if(tw>0.3){PX(g,x-camX+5,y-camY-14,1,1,'#fff6c0');PX(g,x-camX+4.5,y-camY-13.75,2,0.5,'#fff6c0');}}
else if(!T.eau&&Math.floor(now/600+T.c)%2===0)PX(g,x-camX+6,y-camY-12,1,1.5,'rgba(150,205,240,.9)');}});}}
acteurs.push({y:1e9,f:()=>chDessinAmbiance(g,camX,camY,VW2,VH2)});}}
/* ================= LA BARRE D'OUTILS ================= */
const CH_OUTILS=[['houe','⛏️','BÊCHER'],['graine','🌱','SEMER'],['eau','💧','ARROSER'],['faux','🧺','RÉCOLTER']];
function chIconeGraine(k){return ICONES[k]?'<svg viewBox="0 0 16 16" width="26" height="26" shape-rendering="crispEdges">'+ICONES[k]+'</svg>':'🌱';}
function chMonterBarre(){if($('chBarre'))return;
const st=document.createElement('style');st.textContent=`
#chBarre{position:fixed;left:10px;right:10px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:6;display:none;align-items:flex-end;gap:7px;pointer-events:none}
#chBarre.on{display:flex}
#chBarre .outils{display:flex;gap:6px;pointer-events:auto;background:rgba(36,26,14,.55);padding:6px;border-radius:18px;backdrop-filter:blur(3px)}
#chBarre .outils button{width:52px;height:56px;border:0;border-radius:13px;background:linear-gradient(#fff7e4,#e8d6b0);box-shadow:0 3px 0 #9a7a4a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0;
font:800 8.5px 'Baloo 2','Trebuchet MS',sans-serif;color:#4a3420;letter-spacing:.3px;-webkit-tap-highlight-color:transparent}
#chBarre .outils button span{font-size:21px;line-height:1;display:flex;align-items:center;justify-content:center;height:26px}
#chBarre .outils button.on{background:linear-gradient(#ffe88a,#f0b838);box-shadow:0 3px 0 #a87010,0 0 0 2.5px #fff;transform:translateY(-3px)}
#chBarre .go{margin-left:auto;width:78px;height:78px;border-radius:50%;border:0;pointer-events:auto;background:radial-gradient(circle at 40% 35%,#ffe88a,#f0b030);box-shadow:0 5px 0 #a87010,0 8px 18px rgba(0,0,0,.35);
display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 10px 'Baloo 2',sans-serif;color:#4a2a08;-webkit-tap-highlight-color:transparent;touch-action:none}
#chBarre .go span{font-size:28px;line-height:1}
#chBarre .go.tient{transform:translateY(3px);box-shadow:0 2px 0 #a87010}
#chBarre .info{position:absolute;left:0;bottom:76px;pointer-events:none;font:800 11px 'Baloo 2',sans-serif;color:#fff;background:rgba(36,26,14,.6);border-radius:10px;padding:3px 9px;white-space:nowrap}
#chGr{position:fixed;inset:auto 0 0 0;z-index:40;max-height:72vh;display:none;flex-direction:column;background:#f7ecd2;border-radius:22px 22px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.35);font-family:'Baloo 2','Trebuchet MS',sans-serif;color:#3a2a18}
#chGr.on{display:flex}
#chGr .tt{display:flex;align-items:center;gap:8px;padding:14px 16px 6px}
#chGr .tt b{flex:1;font:800 19px 'Baloo 2'}#chGr .tt small{display:block;font:700 11px 'Baloo 2';color:#8a6a48}
#chGr .x{border:0;background:#e8d6b0;border-radius:12px;width:38px;height:38px;font:800 16px 'Baloo 2';color:#5a3a20}
#chGr .ag{margin:0 14px 8px;border:0;border-radius:14px;padding:10px;background:linear-gradient(#ffe88a,#f0b838);box-shadow:0 3px 0 #a87010;font:800 13px 'Baloo 2';color:#4a2a08}
#chGr .ls{overflow-y:auto;padding:4px 12px calc(16px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#chGr .g{border:0;border-radius:14px;background:#fffaf0;box-shadow:0 3px 0 #d8c49a;padding:8px 4px 7px;display:flex;flex-direction:column;align-items:center;gap:1px;font:800 11.5px 'Baloo 2';color:#3a2a18;position:relative}
#chGr .g small{font:700 10px 'Baloo 2';color:#8a6a48}
#chGr .g.on{background:#fff2b8;box-shadow:0 3px 0 #c8a040,0 0 0 2.5px #f0b838}
#chGr .g.lock{opacity:.5}
#chGr .g.off{background:#f0ffe8;box-shadow:0 3px 0 #8ac87a,0 0 0 2px #5ac86a}#chGr .g.off small{color:#2a8a3a}
#chGr .g i.of{background:#e8a020;font-size:10px}
#chGr .g i{position:absolute;top:-6px;right:-3px;font-style:normal;font:800 9px 'Baloo 2';background:#5ac86a;color:#fff;border-radius:8px;padding:1px 5px}`;
document.head.appendChild(st);
const b=document.createElement('div');b.id='chBarre';
b.innerHTML='<div class="info" id="chInfo"></div><div class="outils">'+CH_OUTILS.map(o=>'<button data-o="'+o[0]+'"><span>'+o[1]+'</span>'+o[2]+'</button>').join('')+'</div><button class="go" id="chGo"><span>⛏️</span>UTILISER</button>';
document.body.appendChild(b);
const gr=document.createElement('div');gr.id='chGr';document.body.appendChild(gr);
b.querySelectorAll('.outils button').forEach(bt=>bt.addEventListener('click',ev=>{ev.stopPropagation();const o=bt.dataset.o;
if(o==='graine'&&CH_OUTIL==='graine'){chOuvrirGraines();return;}CH_OUTIL=o;vibrer(6);chMajBarre();if(o==='graine'&&!chGrainesVues){chGrainesVues=true;chOuvrirGraines();}}));
const go=$('chGo');
const agir=()=>{const ci=chCible();if(!ci)return;const k=chCle(ci.c,ci.r);if(CH_DERN===k&&Date.now()-CH_DERN_T<650)return;CH_DERN=k;CH_DERN_T=Date.now();chGeste(ci.c,ci.r);};
const tenir=(ev)=>{ev.preventDefault();ev.stopPropagation();go.classList.add('tient');CH_DERN=null;agir();clearInterval(CH_TENIR);CH_TENIR=setInterval(agir,120);};
const lacher=(ev)=>{go.classList.remove('tient');clearInterval(CH_TENIR);CH_TENIR=null;};
go.addEventListener('touchstart',tenir,{passive:false});go.addEventListener('mousedown',tenir);
['touchend','touchcancel','mouseup','mouseleave'].forEach(k=>go.addEventListener(k,lacher));}
let chGrainesVues=false, CH_DERN_T=0;
function chOuvrirGraines(){chMonterBarre();const gr=$('chGr'), sa=CH.meteo?CH.meteo.saison:null;
const L=Object.keys(POT_CULT).sort((a,b)=>POT_CULT[a][2]-POT_CULT[b][2]);
const i=Math.max(1,Math.floor((CH.max-40)/20)+1), PX2=[150000,400000,900000,1800000,3000000,5000000][i-1];
gr.innerHTML='<div class="tt"><span style="flex:1"><b>Les graines</b><small>'+chNb()+'/'+CH.max+' cases bêchées'+(sa?' · '+CH_SAISON_NOM[sa]+' : les cultures de saison poussent 25 % plus vite':'')+'</small></span><button class="x">✕</button></div>'+
(PX2?'<button class="ag">Agrandir le champ · +20 cases · '+enEuros(PX2).replace(',00','')+'</button>':'')+
'<div class="ls">'+L.map(k=>{const P=POT_CULT[k], libre=potLibre(k);
const of=chOff(k);
return '<button class="g'+(k===CH_GRAINE?' on':'')+(libre?'':' lock')+(of&&libre?' off':'')+'" data-k="'+k+'">'+(of&&libre?'<i class="of">🎁 ×'+of+'</i>':chDeSaison(k)?'<i>SAISON</i>':'')+chIconeGraine(k)+P[0].replace(/\s*\(.*\)/,'')+
'<small>'+(libre?(of?'offertes':enEuros(chPrix(k)).replace(',00',''))+' · '+potDuree(P[2]):'🔒 chez Madeleine')+'</small></button>';}).join('')+'</div>';
gr.classList.add('on');
gr.querySelector('.x').onclick=()=>gr.classList.remove('on');
const ag=gr.querySelector('.ag');if(ag)ag.onclick=async()=>{const d=await appelRPC('champ_agrandir',{p_joueur:e.id});
if(d&&!d.erreur){CH.max=d.max;if(typeof d.euros==='number'){e.euros=d.euros;try{majHaut();}catch(x){}}texteVolant(joueur.x,joueur.y-58,'+20 cases à bêcher','#ffe070');chOuvrirGraines();}
else texteVolant(joueur.x,joueur.y-58,d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Réessaie dans un instant','#ffd0a0');};
gr.querySelectorAll('.g').forEach(bt=>bt.onclick=()=>{const k=bt.dataset.k;if(!potLibre(k)){texteVolant(joueur.x,joueur.y-56,'À débloquer chez Madeleine (boutique de la ferme)','#ffe8a0');return;}
CH_GRAINE=k;CH_OUTIL='graine';gr.classList.remove('on');vibrer(8);chMajBarre();});}
function chMajBarre(){const b=$('chBarre');if(!b)return;
b.querySelectorAll('.outils button').forEach(bt=>{bt.classList.toggle('on',bt.dataset.o===CH_OUTIL);
if(bt.dataset.o==='graine'){bt.querySelector('span').innerHTML=chIconeGraine(CH_GRAINE);bt.lastChild.textContent=chOff(CH_GRAINE)>0?'🎁 ×'+chOff(CH_GRAINE):enEuros(chPrix(CH_GRAINE)).replace(',00','');}});
const o=CH_OUTILS.find(x=>x[0]===CH_OUTIL);$('chGo').querySelector('span').innerHTML=CH_OUTIL==='graine'?chIconeGraine(CH_GRAINE):o[1];
const M=CH.meteo, inf=$('chInfo');inf.textContent=(M?CH_SAISON_NOM[M.saison]+(M.pluie?' · 🌧️ Il pleut : tout est arrosé':' · ☀️ Beau temps'):'')+' · '+chNb()+'/'+CH.max+' cases';}
/* la barre n'apparaît qu'au bord du champ, et la plaque d'action s'efface */
setInterval(()=>{if(!CHAMP_LIBRE||FERME_VIERGE)return;chMonterBarre();const on=chPres()&&CH.charge&&!document.querySelector('#pan.on,#page2.on');$('chBarre').classList.toggle('on',on);
if(on){try{plaqueVrai=$('action');plaqueFeinte.classList.remove('on');}catch(x){}}},200);
const chMajVrai=majAction;
majAction=function(){if(CHAMP_LIBRE&&chPres()){try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir')){const demi=b2.demi||40;
const ec=Math.max(0,Math.abs(b2.x-joueur.x)-demi), dd=Math.hypot(ec,(joueur.y-b2.y)*0.8);if(dd<26)return chMajVrai();}}catch(x){}
try{plaqueVrai=$('action');plaqueFeinte.classList.remove('on');}catch(x){}return;}
return chMajVrai();};
if(typeof CHAMPS_SEULS!=='undefined'&&CHAMPS_SEULS&&CARTE==='village'){CHAMP_LIBRE=true;
const go=()=>{if(e.id)chCharger();else setTimeout(go,1500);};go();
setInterval(()=>{if(document.visibilityState==='visible')chCharger();},90000);}
/* =====================================================================
   LA FERME : LA CLÔTURE DE BOIS ET LA LONGÈRE
   La clôture fait le tour de la carte à BORD_V du bord, avec une rangée
   d'arbres derrière : tout est peint dans le sol. La longère se pose en
   haut au centre ; elle se trie avec le joueur et l'arrête.
   ===================================================================== */
const BORD_V=58;
const FM_LIB=(()=>{
function H(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function mix(a,b,t){const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function sh(c,f){const A=hex(c);return '#'+A.map(v=>Math.max(0,Math.min(255,Math.round(f>0?v+(255-v)*f:v*(1+f)))).toString(16).padStart(2,'0')).join('');}
function Pi(g){return {
 r:(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
 tex:(x,y,w,h,c,v,k)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const n=H(x+i,y+j,k||1);g.fillStyle=n<.33?sh(c,-v):(n<.66?c:sh(c,v*0.7));g.fillRect(x+i,y+j,1,1);}},
 grad:(x,y,w,h,c1,c2)=>{for(let j=0;j<h;j++){g.fillStyle=mix(c1,c2,j/Math.max(1,h-1));g.fillRect(x,y+j,w,1);}},
 a:(x,y,w,h,col,al)=>{g.globalAlpha=al;g.fillStyle=col;g.fillRect(x,y,w,h);g.globalAlpha=1;}};}
/* fumée de cheminée */
function fumee(g,x,y,t){for(let k=0;k<6;k++){const f=((t/1400)+k/6)%1;g.globalAlpha=0.32*(1-f);g.fillStyle='#e8e8ec';g.beginPath();g.arc(x+Math.sin(f*5+k)*4+f*10,y-f*44,3+f*7,0,7);g.fill();}g.globalAlpha=1;}

let FM_CHEM=null;
function longere(t){const W=330,Hh=300,c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d'),P=Pi(g);
const sol=270, fx=26, fw=240, fh=100;
g.fillStyle='rgba(20,40,10,.28)';g.beginPath();g.ellipse(160,sol+6,160,16,0,0,7);g.fill();
/* moellons */ P.r(fx,sol-fh,fw,fh,'#9a9282');
for(let y=sol-fh;y<sol;y+=8){let x=fx-((y/8|0)%2)*7;while(x<fx+fw){const w=10+H(x,y,3)*9;const n=H(x,y,4);P.r(Math.max(fx,x)+1,y+1,Math.min(w,fx+fw-x)-2,6,n<.33?'#b8b0a0':(n<.66?'#a8a090':'#c4bcac'));P.r(Math.max(fx,x)+1,y+1,Math.min(w,fx+fw-x)-2,1,'#d8d0c0');x+=w;}}
/* toit d'ardoise, croupe */ const top=sol-fh-70;g.fillStyle='#3e4652';g.beginPath();g.moveTo(fx-14,sol-fh+6);g.lineTo(fx+30,top);g.lineTo(fx+fw-30,top);g.lineTo(fx+fw+14,sol-fh+6);g.closePath();g.fill();
g.save();g.clip();for(let y=top;y<sol-fh+8;y+=5)for(let x=fx-20+((y/5|0)%2)*6;x<fx+fw+20;x+=12){const n=H(x,y,9);P.r(x,y,11,5,n<.33?'#4a5260':(n<.66?'#3e4652':'#56606e'));P.r(x,y+4,11,1,'#2a3038');}g.restore();
P.r(fx+30,top-2,fw-60,4,'#2a3038');P.r(fx-16,sol-fh+4,fw+32,4,'#2a3038');P.a(fx,sol-fh+8,fw,6,'#000',0.2);
/* LA CHEMINÉE : une seule, en pierre de taille, posée sur le versant à droite */
{const cx=fx+fw-78, cw=26, cb=top+20, ct=top-38;
g.globalAlpha=0.28;g.fillStyle='#1a1e24';g.beginPath();g.moveTo(cx+cw,cb);g.lineTo(cx+cw+14,cb+18);g.lineTo(cx+cw+14,cb+40);g.lineTo(cx+cw,cb+26);g.fill();g.globalAlpha=1;
P.r(cx-3,cb-2,cw+6,6,'#6a7078');P.r(cx-3,cb-2,cw+6,1,'#8a9098');
for(let y=ct;y<cb;y+=7){const dec=((y-ct)/7|0)%2?6:0;for(let x=cx-dec;x<cx+cw;x+=12){const x0=Math.max(cx,x),w=Math.min(x+12,cx+cw)-x0;if(w<=0)continue;const n=H(x,y,21);
P.r(x0,y,w,7,n<.33?'#c4bcac':(n<.66?'#b4ac9c':'#cfc7b7'));P.r(x0,y,w,1,'#e2dacb');P.r(x0+w-1,y,1,7,'#8e877a');}}
P.a(cx+cw-7,ct,7,cb-ct,'#2a2620',0.22);
P.r(cx-4,ct-6,cw+8,6,'#d6cebe');P.r(cx-4,ct-6,cw+8,1,'#efe8da');P.r(cx-4,ct-1,cw+8,1,'#9a9284');
P.r(cx-6,ct-12,cw+12,6,'#4a5260');P.r(cx-6,ct-12,cw+12,1,'#6a7280');P.r(cx-6,ct-7,cw+12,1,'#2a3038');
for(const mx of [cx+3,cx+cw-11]){P.r(mx,ct-24,8,12,'#b8643a');P.r(mx,ct-24,8,2,'#d88a5a');P.r(mx+6,ct-24,2,12,'#8a3e1e');P.r(mx-1,ct-26,10,3,'#c8744a');P.r(mx+1,ct-26,6,1,'#3a1a0a');}
P.a(cx+4,ct-12,4,2,'#2a2a2a',0.5);FM_CHEM={x:cx+7,y:ct-30};}
/* fenêtres à meneaux, volets verts */
function fen(x,y){P.r(x-4,y-5,36,46,'#d8d0c0');P.grad(x,y,28,36,'#a8d0e8','#4f7a96');P.r(x+13,y,2,36,'#f4f4f0');P.r(x,y+11,28,2,'#f4f4f0');P.r(x,y+23,28,2,'#f4f4f0');P.a(x+2,y+2,4,14,'#fff',0.5);
 for(const vx of [x-20,x+30]){P.r(vx,y-3,18,42,'#4f7a52');for(let k=0;k<42;k+=6)P.r(vx+1,y-3+k,16,1,'#3e6242');P.r(vx,y-3,1,42,'#6a9a6a');}}
fen(fx+30,sol-fh+22);fen(fx+fw-58,sol-fh+22);
/* porte cintrée */ const dx=fx+fw/2-20;P.r(dx-6,sol-74,52,74,'#d8d0c0');g.fillStyle='#7a3e22';g.beginPath();g.moveTo(dx,sol);g.lineTo(dx,sol-56);g.quadraticCurveTo(dx+20,sol-76,dx+40,sol-56);g.lineTo(dx+40,sol);g.fill();
for(let k=0;k<40;k+=7)P.r(dx+k,sol-66,1,66,'#5a2a14');P.r(dx+32,sol-34,3,3,'#e8c060');P.r(dx-10,sol-5,60,5,'#b8b0a0');
/* lierre et rosier */ for(let k=0;k<70;k++){g.fillStyle=['#3f7a32','#4f8a3a','#2f5a26'][k%3];g.fillRect(fx+fw-12+H(k,1,2)*14,sol-fh+H(k,2,3)*fh,3,3);}
for(let k=0;k<20;k++){g.fillStyle=k%3?'#3f7a32':'#e84a6a';g.beginPath();g.arc(fx+8+H(k,3,4)*16,sol-40+H(k,4,5)*36,2.5,0,7);g.fill();}
/* banc de pierre */ P.r(dx+56,sol-14,34,5,'#b8b0a0');P.r(dx+58,sol-9,4,9,'#9a9282');P.r(dx+84,sol-9,4,9,'#9a9282');
/* boîte aux lettres */ P.r(W-22,sol-46,4,44,'#4a4a4a');P.r(W-30,sol-56,20,13,'#2e3440');P.r(W-30,sol-56,20,3,'#4e5460');P.r(W-12,sol-62,2,10,'#e8c040');
return c;}

return {longere};})();
let FM_MAISON=null, FM_MAISON_CHEM=null;
const FM_K=0.61, FM_CHX=195, FM_CHY=36, FM_FENETRES=[[56,192],[208,192]];                                  /* un point fin vaut 0,61 pixel monde */
const FM_MX=()=>Math.round(MONDE_L/2-330*FM_K/2), FM_MY=()=>150;
const FM_BASE=()=>FM_MY()+Math.round(270*FM_K);    /* le pied de la façade */
function fmMaison(){if(!FM_MAISON){try{FM_MAISON=FM_LIB.longere(0);}catch(x){FM_MAISON=null;}}return FM_MAISON;}
/* l'emprise de la maison, en pixels monde : on n'y entre pas */
function fmDansMaison(x,y){const X=FM_MX(), B=FM_BASE();
if(x>X+26*FM_K-6&&x<X+266*FM_K+6&&y>B-60&&y<B+4)return true;
/* l'étal de Madeleine, plus bas à l'ouest */
if(fmDansEtal(x,y))return true;
/* le pied des lampadaires */
if(fmDansLampe(x,y))return true;
/* les chênes et les bancs */
if(fmDansDeco(x,y))return true;
/* les lanternes tempête autour du champ */
/* le poulailler et son parcours */
if(pgDansPoulailler(x,y))return true;
/* la porcherie et sa cour */
if(pcDansPorcherie(x,y))return true;
/* le pré à moutons et sa bergerie */
if(moDansPre(x,y))return true;
/* les platanes, le banc et l'ardoise du boulodrome */
if(ptDansBoulodrome(x,y))return true;
/* le rucher et ses trois ruches */
if(ruDansRucher(x,y))return true;
if(cbfDans(x,y))return true;
/* l'épouvantail d'Halloween */
if(hwDansDecor(x,y))return true;
/* la bouche de métro et son totem */
if((x>1585-30&&x<1585+30&&y>950-32&&y<950+3)||(Math.abs(x-1545)<4&&y>947&&y<953))return true;
/* la boîte aux lettres, sur son poteau : on la contourne */
return x>X+300*FM_K-5&&x<X+320*FM_K+5&&y>B-8&&y<B+5;}
function peindreClotureFerme(g,W,Hm){
const M=58, hh=(x,y,k)=>{let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
const PAL=['#2f5a26','#3a6a2e','#4f8a3a','#6aa84a','#8ac460'];
const arbre=(x,y,s)=>{g.fillStyle='rgba(20,40,10,.22)';g.beginPath();g.ellipse(x,y,s*0.9,s*0.25,0,0,7);g.fill();
R(x-2,y-s*0.9,5,s*0.9,'#6a4a2a');R(x-1,y-s*0.9,1,s*0.9,'#8a6238');
for(let k=0;k<30;k++){const a=hh(x,k,3)*6.28,r=hh(k,y,4)*s*0.85,cx=x+Math.cos(a)*r,cy=y-s*1.25+Math.sin(a)*r*0.8,rr=s*0.33+hh(x+k,y,5)*s*0.25;
g.fillStyle=PAL[k<7?0:k<14?1:k<21?2:k<27?3:4];g.beginPath();g.arc(cx,cy-(k>=21?2:0),rr,0,7);g.fill();}};
/* LES ARBRES : en haut d'abord (derrière), puis les côtés, puis le bas */
for(let x=-10;x<W+20;x+=30)arbre(x+hh(x,1,1)*10,M-14+hh(x,2,1)*6,15+hh(x,3,1)*5);
for(let y=M+20;y<Hm-20;y+=30){arbre(10+hh(1,y,2)*12,y,14+hh(2,y,2)*5);arbre(W-10-hh(3,y,2)*12,y,14+hh(4,y,2)*5);}
for(let x=-10;x<W+20;x+=30)arbre(x+hh(x,5,1)*10,Hm-6+hh(x,6,1)*4,15+hh(x,7,1)*5);
/* LA CLÔTURE : poteaux tous les 18, deux lisses */
const poteau=(x,y)=>{R(x,y,4,14,'#7a5232');R(x,y,4,2,'#a8784a');R(x+1,y+14,3,1,'rgba(0,0,0,.2)');R(x+3,y+2,1,12,'#5e3e24');};
const lisseH=(x0,x1,y)=>{R(x0,y,x1-x0,2,'#9a6a3e');R(x0,y,x1-x0,1,'#c89a62');R(x0,y+2,x1-x0,1,'rgba(0,0,0,.18)');};
const lisseV=(x,y0,y1)=>{R(x,y0,2,y1-y0,'#9a6a3e');R(x+2,y0,1,y1-y0,'#c89a62');};
const X0=M, X1=W-M, Y0=M, Y1=Hm-M;
lisseH(X0,X1,Y0+3);lisseH(X0,X1,Y0+9);for(let x=X0;x<=X1;x+=18)poteau(x-2,Y0);
lisseV(X0,Y0,Y1+10);lisseV(X0+5,Y0,Y1+10);for(let y=Y0;y<=Y1;y+=18)poteau(X0-1,y);
lisseV(X1-4,Y0,Y1+10);lisseV(X1+1,Y0,Y1+10);for(let y=Y0;y<=Y1;y+=18)poteau(X1-3,y);
lisseH(X0,X1,Y1+3);lisseH(X0,X1,Y1+9);for(let x=X0;x<=X1;x+=18)poteau(x-2,Y1);}
function fmDessinerMaison(ctx,camX,camY,pile){
const m=fmMaison();if(!m)return;const X=FM_MX(), Y=FM_MY(), w=330*FM_K, h=300*FM_K;
if(X+w-camX<-20||X-camX>VW+20||Y+h-camY<-20||Y-camY>VH+80)return;
pile.push({y:FM_BASE(),f:()=>{ctx.drawImage(m,Math.round(X-camX),Math.round(Y-camY),w,h);
/* la fumée, vivante */ try{const C=FM_LIB.chem||null;}catch(x){}
const t=Date.now(), cx=X+FM_CHX*FM_K, cy=Y+FM_CHY*FM_K;
for(let k=0;k<6;k++){const f=((t/1600)+k/6)%1;ctx.globalAlpha=0.3*(1-f);ctx.fillStyle='#e8e8ec';ctx.beginPath();ctx.arc(cx-camX+Math.sin(f*5+k)*2.5+f*6,cy-camY-f*26,1.8+f*4.5,0,7);ctx.fill();}
ctx.globalAlpha=1;
/* la nuit, les fenêtres s'allument */
try{const ci=cielDuMoment();if(ci&&ci.lampes>0.4){ctx.save();ctx.globalAlpha=Math.min(1,ci.lampes)*0.85;ctx.globalCompositeOperation='lighter';
for(const [fx,fy] of FM_FENETRES){ctx.fillStyle='rgba(255,190,90,.75)';ctx.fillRect(X+fx*FM_K-camX,Y+fy*FM_K-camY,28*FM_K,36*FM_K);}ctx.restore();}}catch(x){}}});}

/* =====================================================================
   LES CHEMINS DE TERRE ET LA BORDURE DU CHAMP (peints dans le sol)
   Un chemin part de la porte de la longère et descend tout droit ; un
   second le croise plus bas. Le champ (30 x 20 cases) est à gauche du
   chemin, juste sous la maison, entouré de planches basses.
   ===================================================================== */
function peindreCheminsFerme(g,W,Hm){
const h=(x,y,k)=>{let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const terre=(x0,y0,x1,y1)=>{for(let y=y0-3;y<y1+3;y++)for(let x=x0-3;x<x1+3;x++){
const bord=Math.min(x-x0,x1-1-x,y-y0,y1-1-y);if(bord<0&&h(x,y,61)<0.55)continue;if(bord<2&&h(x,y,62)<0.25)continue;
const n=h(x,y,63);g.fillStyle=n<.3?'#b89868':(n<.75?'#c4a474':(n<.93?'#d0b282':'#a88858'));g.fillRect(x,y,1,1);}
for(let i=0;i<(x1-x0)*(y1-y0)/90;i++){const x=x0+h(i,1,64)*(x1-x0),y=y0+h(i,2,65)*(y1-y0);g.fillStyle=h(i,3,66)<.5?'#8a7a68':'#e0d0b0';g.fillRect(x|0,y|0,h(i,4,67)<.3?2:1,1);}
/* des touffes d'herbe qui débordent sur les bords */
for(let i=0;i<(x1-x0+y1-y0)/3;i++){const t=h(i,5,68);let x,y;if(t<.5){x=x0+h(i,6,69)*(x1-x0);y=h(i,7,70)<.5?y0+1:y1-2;}else{y=y0+h(i,6,71)*(y1-y0);x=h(i,7,72)<.5?x0+1:x1-2;}
g.fillStyle='#5f8a3c';g.fillRect(x|0,(y|0)-2,1,3);g.fillStyle='#7aa84e';g.fillRect((x|0)+1,(y|0)-1,1,2);}};
const cx=Math.round(W/2);
terre(cx-22,312,cx+22,1700);                 /* de la porte vers le bas */
terre(150,960,W-150,1000);                   /* le chemin qui croise */
terre(cx-34,300,cx+34,330);                  /* le seuil devant la porte */
/* la bordure du champ : planches basses, piquets aux angles */
const X0=590-5,Y0=440-5,X1=590+240+5,Y1=440+320+5;
const planche=(x,y,w,hh)=>{g.fillStyle='#7a5232';g.fillRect(x,y,w,hh);g.fillStyle='#a8784a';if(w>hh)g.fillRect(x,y,w,1);else g.fillRect(x,y,1,hh);g.fillStyle='rgba(0,0,0,.18)';if(w>hh)g.fillRect(x,y+hh,w,1);else g.fillRect(x+w,y,1,hh);};
planche(X0,Y0,X1-X0,4);planche(X0,Y1-4,X1-X0,4);planche(X0,Y0,4,Y1-Y0);planche(X1-4,Y0,4,Y1-Y0);
for(const[x,y] of [[X0,Y0],[X1-4,Y0],[X0,Y1-4],[X1-4,Y1-4]]){g.fillStyle='#5a3a22';g.fillRect(x-1,y-4,6,8);g.fillStyle='#c89a62';g.fillRect(x-1,y-4,6,1);}
/* le passage entre le chemin et le champ */
terre(X1-2,620,cx-22,660);
}

/* =====================================================================
   LES PARCELLES, AU DOIGT
   Une parcelle = un carré de 2 x 2 cases du champ (le serveur ne change
   pas : chaque geste part case par case). Plus de barre d'outils :
   - on touche une parcelle vide : les graines s'ouvrent au-dessus, on
     en touche une (ou on la fait glisser sur plusieurs parcelles) ;
   - ce qui est mûr : on touche et on glisse, ça récolte ;
   - ce qui a soif : on touche et on glisse, ça arrose ;
   - la parcelle en pointillés « + » : une nouvelle parcelle.
   ===================================================================== */
const FP_L=40, FP_COLS=6, FP_ROWS=8;   /* 48 parcelles : l'enclos a juste la taille de ce qu'on peut planter */
const fpOrdre=(k)=>({i:k%6, j:Math.floor(k/6)});   /* on remplit par blocs de 6 de large */
const fpX=(i)=>590+i*FP_L, fpY=(j)=>440+j*FP_L;
const fpSpots=(i,j)=>[[2*i,2*j],[2*i+1,2*j],[2*i,2*j+1],[2*i+1,2*j+1]];
const fpTuiles=(i,j)=>fpSpots(i,j).map(([c,r])=>CH.t[c+','+r]||null);
const fpExiste=(i,j)=>fpTuiles(i,j).some(Boolean);
function fpEtat(i,j){const T=fpTuiles(i,j);let mur=0,soif=0,vide=0,pousse=0,fin=0;
T.forEach(t=>{if(!t||!t.cult){vide++;return;}const st=chStade(t);if(st===3)mur++;else{pousse++;if(!t.eau)soif++;fin=Math.max(fin,new Date(t.mur_a).getTime());}});
return {mur,soif,vide,pousse,fin};}
function fpProchaine(){for(let k=0;k<FP_COLS*FP_ROWS;k++){const o=fpOrdre(k);if(!fpExiste(o.i,o.j))return o;}return null;}
function fpSous(wx,wy){const i=Math.floor((wx-590)/FP_L), j=Math.floor((wy-440)/FP_L);if(i<0||j<0||i>=FP_COLS||j>=FP_ROWS)return null;
const lx=wx-fpX(i), ly=wy-fpY(j);if(lx<1||ly<1||lx>FP_L-1||ly>FP_L-1)return null;return {i,j};}
function fpMonde(cx,cy){const V=window.FM_VUE, cv=$('cv');if(!V||!cv)return null;const r=cv.getBoundingClientRect(), k=cv.width/r.width;
return {x:((cx-r.left)*k-V.e)/V.a+V.camX, y:((cy-r.top)*k-V.f)/V.d+V.camY};}
function fpEcran(wx,wy){const V=window.FM_VUE, cv=$('cv');if(!V||!cv)return null;const r=cv.getBoundingClientRect(), k=cv.width/r.width;
return {x:((wx-V.camX)*V.a+V.e)/k+r.left, y:((wy-V.camY)*V.d+V.f)/k+r.top};}
/* ---------- le dessin ---------- */
function fpCadre(g,x,y,w,h){PX(g,x-0.5,y+h,w+1,2,'rgba(0,0,0,.2)');PX(g,x,y,w,h,'#7a5232');PX(g,x,y,w,1,'#b8885a');PX(g,x,y+h-1.5,w,1.5,'#583820');PX(g,x,y,1,h,'#9a6a3e');PX(g,x+w-1,y,1,h,'#5e3c20');}
function fpTerre(g,x,y,w,h,t){const eau=t&&t.eau, la=!t;
const base=la?'#7f9a50':(eau?'#4e3622':'#76563a'), sil=la?'#6f8a44':(eau?'#3e2a1a':'#5e4430'), hi=la?'#90aa60':(eau?'#664a32':'#93714e');
PX(g,x,y,w,h,base);if(!la)for(let k=0;k<3;k++){PX(g,x,y+2+k*5,w,1.5,sil);PX(g,x,y+1.5+k*5,w,0.5,hi);}
if(eau){g.fillStyle='rgba(160,210,240,.35)';g.fillRect(x+2,y+3,1,0.5);g.fillRect(x+w-4,y+9,1,0.5);}}
function fmDessinerParcelles(g,camX,camY,VW2,VH2,acteurs){
const now=Date.now();
for(let j=0;j<FP_ROWS;j++)for(let i=0;i<FP_COLS;i++){if(!fpExiste(i,j))continue;
const x0=fpX(i), y0=fpY(j), x=x0-camX, y=y0-camY;if(x<-50||y<-60||x>VW2+10||y>VH2+10)continue;
fpCadre(g,x+3,y+3,34,33);
fpSpots(i,j).forEach(([c,r],q)=>{const t=CH.t[c+','+r]||null;fpTerre(g,x+5+(q%2)*15,y+5+(q>>1)*14.5,15,14.5,t);});
PX(g,x+19.75,y+5,0.5,29,'rgba(0,0,0,.18)');PX(g,x+5,y+19.25,30,0.5,'rgba(0,0,0,.18)');
if(CH.arr&&CH.arr[i+','+j])fpDessinerArroseur(g,x,y,now,i,j);
const E=fpEtat(i,j);
/* les plantes, triées avec le joueur */
fpSpots(i,j).forEach(([c,r],q)=>{const t=CH.t[c+','+r];if(!t||!t.cult||!PLANTES[t.cult])return;const st=chStade(t);
const px=x0+12.5+(q%2)*15, py=y0+5+(q>>1)*14.5+12;const bal=st>=2?Math.round(Math.sin(now/700+c*0.7+r)*0.6*2)/2:0;
acteurs.push({y:py,f:()=>{poserPlant(g,t.cult,st,px-camX+bal,py-camY,2);
if(st===3&&Math.sin(now/260+c+r)>0.3){PX(g,px-camX+5,py-camY-14,1,1,'#fff6c0');PX(g,px-camX+4.5,py-camY-13.75,2,0.5,'#fff6c0');}}});});
/* ce qui reste à faire, en un coup d'œil */
acteurs.push({y:y0+38,f:()=>{const xx=x0-camX, yy=y0-camY;
if(E.mur){const b=Math.sin(now/300+i+j)*0.8, cx=xx+20, cy=yy-1+b;g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.arc(cx,cy,4.5,0,7);g.fill();g.fillStyle='#f0b020';g.beginPath();for(let k=0;k<8;k++){const r=k%2?1.1:3.2, an=k*Math.PI/4-Math.PI/2;g.lineTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r);}g.closePath();g.fill();}
else if(E.soif){const b=Math.sin(now/400+i)*0.8;g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(xx+20,yy-1+b,4,0,7);g.fill();g.fillStyle='#4a9ae0';g.beginPath();g.moveTo(xx+20,yy-4+b);g.lineTo(xx+22,yy+b);g.arc(xx+20,yy+b,2,0,Math.PI);g.closePath();g.fill();}
if(E.pousse&&!E.mur){const T=fpTuiles(i,j).filter(t=>t&&t.cult);let k=0;T.forEach(t=>{const a=new Date(t.t0).getTime(), m=new Date(t.mur_a).getTime();k+=Math.min(1,Math.max(0,(chNow()-a)/Math.max(1,m-a)));});k/=Math.max(1,T.length);
PX(g,xx+8,yy+37.5,24,2,'rgba(0,0,0,.4)');PX(g,xx+8,yy+37.5,24*k,2,'#9be05a');}}});}
if(window.FP_VISE){const x=fpX(window.FP_VISE.i)-camX, y=fpY(window.FP_VISE.j)-camY, L=6, c='rgba(255,236,140,.95)';
[[2,2,1,1],[38,2,-1,1],[2,37,1,-1],[38,37,-1,-1]].forEach(([a,b,sx,sy])=>{PX(g,x+a-(sx<0?1:0),y+b-(sy<0?1:0),sx>0?L:1,1,c);if(sx<0)PX(g,x+a-L,y+b-(sy<0?1:0),L,1,c);PX(g,x+a-(sx<0?1:0),y+b-(sy<0?L:0),1,L,c);});}
/* la prochaine parcelle, en pointillés */
const n=fpProchaine();if(n){const x=fpX(n.i)-camX, y=fpY(n.j)-camY;if(x>-50&&y>-50&&x<VW2+10&&y<VH2+10){
const plein=chNb()+4>CH.max, a=0.55+0.25*Math.sin(now/500);g.save();g.globalAlpha=a;g.strokeStyle='#fff6d8';g.lineWidth=1;g.setLineDash([2.5,2]);g.strokeRect(x+3.5,y+3.5,33,32);g.setLineDash([]);
g.fillStyle='rgba(255,246,216,.18)';g.fillRect(x+4,y+4,32,31);PX(g,x+18.5,y+13,3,14,'#fff6d8');PX(g,x+13,y+18.5,14,3,'#fff6d8');
if(plein){PX(g,x+25,y+7,7,6,'#f0c040');}g.restore();}}}
/* ---------- les gestes ---------- */
const FP_DOIGT=false;
const FP={id:null,mode:null,graine:null,vus:{},origine:null,bouge:false};
function fpOutilVoir(ic,x,y){let o=$('fpOutil');if(!o){o=document.createElement('div');o.id='fpOutil';document.body.appendChild(o);}
if(ic==null){o.classList.remove('on');return;}if(o.dataset.ic!==ic){o.innerHTML=ic;o.dataset.ic=ic;}o.classList.add('on');o.style.transform='translate('+(x-34)+'px,'+(y-96)+'px)';}
function fpIcone(k,s){return ICONES[k]?'<svg viewBox="0 0 16 16" width="'+s+'" height="'+s+'" shape-rendering="crispEdges">'+ICONES[k]+'</svg>':'🌱';}
const FP_PIX={k:'#2e1a0a',b:'#8a5a30',g:'#9aa4ae',G:'#dfe6ec',w:'#5aa8e8',W:'#bfe6ff'};
const FP_IC={faux:["................","....kkkkkk......","..kkGGGGGGkk....",".kGGgggggGGGk...","kGgk.....kkGk...","kk.........kGk..","...........kbk..","..........kbk...",".........kbk....","........kbk.....",".......kbk......","......kbk.......",".....kbk........","....kkk.........","................","................"],
eau:["................","................","......kkkk......",".....k....k.....","...kkkkkkkkk....","..kwwWwwwwwwk.kk","..kwWWwwwwwwkkWk","..kwwwwwwwwwkWk.","..kwwwwwwwwwWk..","..kwwwwwwwwwk...","..kwwwwwwwwwk...","..kkwwwwwwwkk...","...kkkkkkkkk....","................","................","................"]};
function fpSvg(n,s){let r='';FP_IC[n].forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.')r+='<rect x="'+x+'" y="'+y+'" width="1.02" height="1.02" fill="'+FP_PIX[c]+'"/>';}));return '<svg viewBox="0 0 16 16" width="'+s+'" height="'+s+'" shape-rendering="crispEdges">'+r+'</svg>';}
async function fpAgir(P,mode){const k=P.i+','+P.j;if(FP.vus[k])return;FP.vus[k]=1;
CH_ICI={x:fpX(P.i)+20,y:fpY(P.j)+30};const ici=CH_ICI;const sp=fpSpots(P.i,P.j);
if(mode==='faux'){CH_MUET=true;CH_CUMUL=0;CH_PTS=0;const nom={};
await Promise.all(sp.map(async([c,r])=>{const t=CH.t[c+','+r];if(t&&t.cult&&chStade(t)===3){nom[t.cult]=1;await chEnvoyer(c,r,'faux');}}));
CH_MUET=false;const ks=Object.keys(nom);if(CH_CUMUL&&ks.length){texteVolant(ici.x,ici.y-34,'+'+CH_CUMUL+' '+(ks.length===1&&POT_CULT[ks[0]]?POT_CULT[ks[0]][0]:''),'#ffe070');if(CH_PTS)setTimeout(()=>texteVolant(ici.x,ici.y-46,'+'+CH_PTS+' pts au classement','#bfe8ff'),350);}}
else if(mode==='eau'){await Promise.all(sp.map(async([c,r])=>{const t=CH.t[c+','+r];if(t&&t.cult&&!t.eau&&chStade(t)<3)await chEnvoyer(c,r,'eau');}));}
else if(mode==='graine'){CH_GRAINE=FP.graine;
if(!potLibre(CH_GRAINE)){texteVolant(ici.x,ici.y-34,'Graine à débloquer','#ffe8a0');return;}
await Promise.all(sp.map(async([c,r])=>{let t=CH.t[c+','+r];
if(!t){if(chNb()>=CH.max)return;await chEnvoyer(c,r,'houe');t=CH.t[c+','+r];if(!t)return;}
if(!t.cult){if((e.euros||0)<chPrixEff(CH_GRAINE)){texteVolant(ici.x,ici.y-34,'Pas assez d’argent','#ffe8a0');return;}await chEnvoyer(c,r,'graine');}}));}
CH_ICI=null;}
function fpInfo(P){const E=fpEtat(P.i,P.j), T=fpTuiles(P.i,P.j).filter(t=>t&&t.cult), x=fpX(P.i)+20, y=fpY(P.j)-4;if(!T.length)return;
const reste=Math.max(1,Math.ceil((E.fin-chNow())/60000)), nom=POT_CULT[T[0].cult]?POT_CULT[T[0].cult][0]:'';
texteVolant(x,y,nom+' · encore '+potDuree(reste),'#fff3d0');}
/* ---------- la fenêtre des graines, au-dessus de la parcelle ---------- */
function fpStyle(){if($('fpSt'))return;const st=document.createElement('style');st.id='fpSt';st.textContent=`
#fpOutil{position:fixed;left:0;top:0;z-index:30;width:68px;height:68px;border-radius:50%;background:#fff8e4;box-shadow:0 0 0 3px #3a2408,0 5px 0 3px #3a2408,0 10px 18px rgba(0,0,0,.35);display:none;align-items:center;justify-content:center;pointer-events:none}
#fpOutil.on{display:flex}
#fpPop{position:fixed;z-index:31;left:10px;right:10px;display:none;background:#fff8e4;border-radius:20px;box-shadow:0 0 0 3px #3a2408,0 6px 0 3px #3a2408,0 14px 28px rgba(0,0,0,.35);padding:9px 8px 8px;font-family:'Baloo 2','Trebuchet MS',sans-serif;color:#3a2408}
#fpPop.on{display:block;animation:fpIn .16s ease-out}
@keyframes fpIn{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
#fpPop:after{content:'';position:absolute;left:var(--q,50%);bottom:-12px;margin-left:-11px;border:11px solid transparent;border-top-color:#3a2408;border-bottom:0}
#fpPop.bas:after{bottom:auto;top:-12px;border:11px solid transparent;border-bottom-color:#3a2408;border-top:0}
#fpPop .tt{display:flex;align-items:center;gap:6px;padding:0 4px 6px;font:800 13px 'Baloo 2','Trebuchet MS',sans-serif;color:#8a6a48}
#fpPop .tt b{flex:1;font:800 16px 'Baloo 2','Trebuchet MS',sans-serif;color:#3a2408}
#fpPop .ls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:2px 2px 2px;max-height:46vh;overflow-y:auto}
#fpPop .ls::-webkit-scrollbar{display:none}
#fpPop .g{border:0;font-family:inherit;color:#3a2408;display:flex;flex-direction:column;align-items:center;border-radius:14px;background:#f3e2b8;padding:6px 0 4px;position:relative;touch-action:none}
#fpPop .g b{font:800 12.5px/1.1 'Baloo 2','Trebuchet MS',sans-serif;text-align:center;min-height:2.2em;display:flex;align-items:center}#fpPop .g small{font:800 10px/1.15 'Baloo 2','Trebuchet MS',sans-serif;color:#8a6a48;white-space:nowrap}
#fpPop .g.lock{opacity:.45}
#fpPop .g i{position:absolute;top:-5px;right:-3px;font:800 8.5px 'Baloo 2','Trebuchet MS',sans-serif;font-style:normal;background:#5ac86a;color:#fff;border-radius:7px;padding:0 4px}
#fpPop .ag{display:block;width:100%;border:0;border-radius:14px;padding:11px;background:linear-gradient(#ffe88a,#f0b838);box-shadow:0 3px 0 #a87010;font:800 15px 'Baloo 2','Trebuchet MS',sans-serif;color:#4a2a08}
#fpPop .ag small{display:block;font:700 11px 'Baloo 2','Trebuchet MS',sans-serif;opacity:.8}`;document.head.appendChild(st);}
function fpPopFermer(){const p=$('fpPop');if(p)p.classList.remove('on');const l=$('fpListe');if(l)l.classList.remove('on');FP.pop=null;}
function fpPopPlacer(p,P){return;const a=fpEcran(fpX(P.i)+20,fpY(P.j)+3), b=fpEcran(fpX(P.i)+20,fpY(P.j)+38);if(!a)return;
const h=p.offsetHeight||140, haut=a.y-h-16>60;p.classList.toggle('bas',!haut);p.style.top=(haut?a.y-h-16:b.y+16)+'px';
const r=p.getBoundingClientRect();p.style.setProperty('--q',Math.max(24,Math.min(r.width-24,a.x-r.left))+'px');}
function fpGraines(P){fpStyle();fpStyle2();let p=$('fpPop');if(!p){p=document.createElement('div');p.id='fpPop';document.body.appendChild(p);}
const libres=Object.keys(POT_CULT).filter(potLibre);
const fav=fpFavoris(libres).sort((a,b)=>(chOff(b)>0)-(chOff(a)>0)).slice(0,4);   /* les graines offertes d'abord */
p.className='rub';
p.innerHTML='<div class="tt"><b>Semer ici</b><span>touche une graine</span></div><div class="rr">'+fav.map(k=>
'<button class="rd" data-k="'+k+'"><span class="o">'+(chOff(k)>0?'<i style="background:#e8a020">🎁'+chOff(k)+'</i>':chDeSaison(k)?'<i>S</i>':'')+fpIc(k,38)+'</span><b>'+fpNom(k)+'</b><small>'+fpPrixTxt(k)+'</small></button>').join('')+
'<button class="rd" data-plus="1"><span class="o plus">+</span><b>Toutes</b><small>&nbsp;</small></button></div>';
FP.pop=P;p.classList.add('on');
p.querySelectorAll('[data-k]').forEach(bt=>bt.onclick=(ev)=>{ev.stopPropagation();fpSemer(P,bt.dataset.k);});
p.querySelector('[data-plus]').onclick=(ev)=>{ev.stopPropagation();fpListe(P);};}
function fpPrixTxt(k){const of=Math.min(4,chOff(k));return of>=4?'offert':(of>0?enEuros(chPrix(k)*(4-of)).replace(',00','')+' 🎁':enEuros(chPrix(k)*4).replace(',00',''));}
function fpNom(k){return POT_CULT[k][0].replace(/\s*\(.*\)/,'').replace('Citrouille géante','Citrouille').replace('Melon de Cavaillon','Melon').replace('Pommes de terre','Patates');}
function fpFavoris(libres){let u={};try{u=JSON.parse(localStorage.getItem('bdl.semis')||'{}')||{};}catch(x){}
return libres.slice().sort((a,b)=>((u[b]||0)-(u[a]||0))||(chDeSaison(b)-chDeSaison(a))||(POT_CULT[a][2]-POT_CULT[b][2]));}
function fpSemer(P,k){FP.vus={};FP.graine=k;fpPopFermer();vibrer(8);
if(CH.arr&&CH.arr[P.i+','+P.j])setTimeout(()=>{window.FP_ARR_ANIM=window.FP_ARR_ANIM||{};window.FP_ARR_ANIM[P.i+','+P.j]=Date.now();},350);
try{const u=JSON.parse(localStorage.getItem('bdl.semis')||'{}')||{};u[k]=(u[k]||0)+1;localStorage.setItem('bdl.semis',JSON.stringify(u));}catch(x){}
try{potGeste('houe');}catch(x){}fpAgir(P,'graine').then(()=>{try{majAction();}catch(x){}});}
function fpListe(P){fpStyle2();let L=$('fpListe');if(!L){L=document.createElement('div');L.id='fpListe';document.body.appendChild(L);}
const tous=Object.keys(POT_CULT), libres=fpFavoris(tous.filter(potLibre)).sort((a,b)=>((chOff(b)>0)-(chOff(a)>0))||(POT_CULT[a][2]-POT_CULT[b][2])), nb=tous.length-libres.length;
L.innerHTML='<div class="voile"></div><div class="sh"><div class="pg"></div><div class="hd"><b>Que planter ?</b><button class="x">✕</button></div><div class="ls">'+libres.map(k=>{const m=Math.round(POT_CULT[k][2]*(chDeSaison(k)?0.75:1));
return '<button class="li" data-k="'+k+'">'+fpIc(k,42)+'<span class="n"><b>'+POT_CULT[k][0].replace(/\s*\(.*\)/,'')+(chDeSaison(k)?'<em>SAISON</em>':'')+'</b><small>⏱ '+potDuree(m)+'</small></span><span class="r"><b>'+fpPrixTxt(k)+'</b><small>'+(chOff(k)>0?'🎁 '+chOff(k)+' offertes':'+'+(chPoints(k)*4)+' pts')+'</small></span></button>';}).join('')+'</div>'+
(nb?'<div class="pl">🔒 '+nb+' autres graines à débloquer chez Madeleine</div>':'')+'</div>';
fpPopFermer();L.classList.add('on');FP.pop=P;
const fermer=()=>{L.classList.remove('on');FP.pop=null;};
L.querySelector('.voile').onclick=fermer;L.querySelector('.x').onclick=fermer;
L.querySelectorAll('[data-k]').forEach(bt=>bt.onclick=(ev)=>{ev.stopPropagation();L.classList.remove('on');fpSemer(P,bt.dataset.k);});}
/* LES ICÔNES DES CULTURES, dessinées une fois */
const FP_ICS={};
function fpIc(k,s){if(!FP_ICS[k]){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};const C=(x,y,r,col)=>{g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
const fe=(x,y)=>{for(const d of [-4,0,4]){R(x+d-1,y-8,2,8,'#3f8a2e');R(x+d-2,y-10,4,3,'#6ab84a');}};
if(k==='radis'){fe(16,12);C(16,19,7,'#d83a5a');C(14,17,3,'#f07a9a');R(15,25,2,4,'#f0e0e0');}
else if(k==='carottes'){fe(16,10);g.fillStyle='#f08a2a';g.beginPath();g.moveTo(10,11);g.lineTo(22,11);g.lineTo(16,30);g.fill();R(12,15,4,1,'#c86a1a');R(15,20,4,1,'#c86a1a');R(13,13,2,6,'#ffb070');}
else if(k==='tomates'){C(16,18,10,'#e03a2a');C(12,15,3.5,'#ff8a7a');g.fillStyle='#3f8a2e';g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?2:6;g.lineTo(16+Math.cos(a)*r,9+Math.sin(a)*r*0.6);}g.fill();}
else if(k==='ble'){for(const d of [-5,0,5]){R(16+d,10,1.4,20,'#c8a840');for(let j=0;j<5;j++){C(16+d-1.5,4+j*3,1.8,'#ecc860');C(16+d+2,5+j*3,1.8,'#d8b040');}}}
else if(k==='salade'){for(let i=0;i<9;i++){const a=i*0.7;C(16+Math.cos(a)*7,18+Math.sin(a)*5,6,i%2?'#4f9a3a':'#6ab84a');}C(16,17,5,'#a8e070');}
else if(k==='pommes_terre'){for(const [x,y] of [[11,20],[20,17],[17,24]]){g.fillStyle='#b8884a';g.beginPath();g.ellipse(x,y,7,5,0.3,0,7);g.fill();R(x-2,y-2,1.5,1.5,'#7a5a30');R(x+2,y,1.5,1.5,'#7a5a30');}}
else if(k==='citrouille'){for(const [d,w] of [[-6,6],[0,7],[6,6]]){g.fillStyle='#e0781a';g.beginPath();g.ellipse(16+d,19,w,9,0,0,7);g.fill();}g.fillStyle='#f8a050';g.beginPath();g.ellipse(14,17,3,6,0,0,7);g.fill();R(15,6,3,6,'#4a6a2a');}
else if(k==='courgettes'){g.save();g.translate(16,17);g.rotate(-0.6);g.fillStyle='#2f7a2e';g.beginPath();g.ellipse(0,0,13,4.5,0,0,7);g.fill();R(-11,-1,20,1,'#6ab84a');R(11,-2,4,3,'#c8a840');g.restore();}
else if(k==='fraises'){g.fillStyle='#e02a3a';g.beginPath();g.moveTo(7,12);g.quadraticCurveTo(16,6,25,12);g.quadraticCurveTo(24,24,16,29);g.quadraticCurveTo(8,24,7,12);g.fill();for(let i=0;i<8;i++)R(10+(i%4)*4,14+(i>>2)*6,1.5,1.5,'#ffe070');for(const d of [-5,-1.5,2,5])R(15+d,7,3,5,'#3f8a2e');}
else if(k==='melon'){C(16,18,11,'#c8d890');g.strokeStyle='#8aa060';g.lineWidth=1;for(let i=-2;i<=2;i++){g.beginPath();g.ellipse(16+i*4,18,2,11,0,0,7);g.stroke();}C(13,14,3,'#e8f0c0');}
else if(k==='lavande'){for(let i=0;i<5;i++){const x=8+i*4;R(x,14,1,16,'#4f6a3a');for(let j=0;j<6;j++)R(x-1,3+j*2+(i%2),3,2,j%2?'#8a6ac0':'#a888d8');}}
else if(k==='oignons'){g.fillStyle='#e0b878';g.beginPath();g.moveTo(16,8);g.quadraticCurveTo(27,18,22,26);g.lineTo(10,26);g.quadraticCurveTo(5,18,16,8);g.fill();R(15,4,2,6,'#6ab84a');R(12,14,1,10,'#c09858');R(19,14,1,10,'#c09858');}
else if(k==='poivrons'){C(12,19,7,'#d83020');C(20,19,7,'#e84030');C(16,22,7,'#c82818');R(15,8,3,6,'#3f8a2e');C(12,16,2.5,'#ff8a70');}
else if(k==='mais'){g.fillStyle='#6ab84a';g.beginPath();g.ellipse(11,18,4,12,-0.3,0,7);g.fill();g.fillStyle='#ecc840';g.beginPath();g.ellipse(17,16,5,12,0.1,0,7);g.fill();for(let j=0;j<8;j++)R(14,7+j*2.6,6,1,'#c8a020');}
else if(k==='aubergines'){g.fillStyle='#5a2a7a';g.beginPath();g.ellipse(17,19,7,11,0.4,0,7);g.fill();C(14,15,2.5,'#9a6ab8');R(11,5,6,4,'#3f8a2e');}
else if(k==='tournesol'){for(let i=0;i<12;i++){const a=i*Math.PI/6;C(16+Math.cos(a)*8,14+Math.sin(a)*8,3.4,'#f0c020');}C(16,14,5,'#6a4220');R(15,22,2,9,'#3f8a2e');}
else if(k==='pasteque'){C(16,18,11,'#2f7a2e');for(let i=-2;i<=2;i++){g.strokeStyle='#8ad86a';g.lineWidth=1.4;g.beginPath();g.ellipse(16+i*4,18,1.5,10,0,0,7);g.stroke();}}
else if(k==='safran'){for(let i=0;i<6;i++){const a=i*Math.PI/3;g.fillStyle='#9a6ad8';g.beginPath();g.ellipse(16+Math.cos(a)*5,14+Math.sin(a)*5,4,2.4,a,0,7);g.fill();}R(15,12,2,4,'#e83a1a');R(15,18,2,12,'#3f8a2e');}
else{C(16,16,9,'#6ab84a');}
FP_ICS[k]=c.toDataURL();}
return '<img src="'+FP_ICS[k]+'" width="'+s+'" height="'+s+'" style="image-rendering:pixelated;display:block" alt="">';}
function fpStyle2(){if($('fpSt2'))return;const st=document.createElement('style');st.id='fpSt2';st.textContent=`
#fpPop{position:fixed!important;left:10px!important;right:10px!important;top:auto!important;bottom:calc(84px + env(safe-area-inset-bottom))!important;max-width:520px;margin:0 auto}
#fpPop:after,#fpPop.bas:after{display:none}
#fpPop.rub{padding:9px 8px 8px;border-radius:22px;background:rgba(255,248,228,.98)}
#fpPop.rub .tt{display:flex;justify-content:space-between;align-items:baseline;padding:0 6px 6px}
#fpPop.rub .tt b{font:400 16px 'Lilita One','Baloo 2',sans-serif;color:#3a2408}
#fpPop.rub .tt span{font:800 11.5px 'Baloo 2',sans-serif;color:#7a5a38}
#fpPop.rub .rr{display:flex;gap:4px}
#fpPop.rub .rd{flex:1;min-width:0;border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:1px;-webkit-tap-highlight-color:transparent}
#fpPop.rub .rd .o{position:relative;width:52px;height:52px;border-radius:50%;background:#f3e2b8;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 #dcc694}
#fpPop.rub .rd:active .o{transform:translateY(2px);box-shadow:0 1px 0 #dcc694}
#fpPop.rub .rd .o i{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#4e9a3a;color:#fff;font:800 9px/16px 'Baloo 2',sans-serif;font-style:normal;text-align:center}
#fpPop.rub .rd .o.plus{background:#3a2408;color:#fff;font:400 24px 'Lilita One',sans-serif;box-shadow:0 3px 0 #1a1004}
#fpPop.rub .rd b{font:400 12.5px 'Lilita One','Baloo 2',sans-serif;color:#3a2408;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#fpPop.rub .rd small{font:800 10.5px 'Baloo 2',sans-serif;color:#2e7a2a}
#fpListe{position:fixed;inset:0;z-index:40;display:none}
#fpListe.on{display:block}
#fpListe .voile{position:absolute;inset:0;background:rgba(0,0,0,.35)}
#fpListe .sh{position:absolute;left:0;right:0;bottom:0;max-height:62vh;display:flex;flex-direction:column;background:#fff8e4;border-radius:24px 24px 0 0;box-shadow:0 -6px 24px rgba(0,0,0,.35);padding:10px 14px calc(14px + env(safe-area-inset-bottom));animation:fpMonte .18s ease-out;max-width:560px;margin:0 auto}
@keyframes fpMonte{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
#fpListe .pg{flex:none;width:44px;height:5px;border-radius:3px;background:#e0cfa8;margin:0 auto 8px}
#fpListe .hd{flex:none;display:flex;align-items:center;margin-bottom:8px}
#fpListe .hd b{flex:1;font:400 21px 'Lilita One','Baloo 2',sans-serif;color:#3a2408}
#fpListe .hd .x{width:34px;height:34px;border:0;border-radius:50%;background:#efe0bc;font:400 15px 'Lilita One',sans-serif;color:#7a5a38}
#fpListe .ls{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:7px;padding:2px 1px 4px}
#fpListe .li{display:flex;align-items:center;gap:10px;border:0;width:100%;text-align:left;background:#f3e2b8;border-radius:16px;padding:7px 12px 7px 8px;box-shadow:0 2px 0 #dcc694;-webkit-tap-highlight-color:transparent}
#fpListe .li:active{transform:translateY(2px);box-shadow:none}
#fpListe .li .n{flex:1;min-width:0}
#fpListe .li b{display:block;font:400 17px/1.15 'Lilita One','Baloo 2',sans-serif;color:#3a2408}
#fpListe .li small{font:800 11.5px 'Baloo 2',sans-serif;color:#7a5a38}
#fpListe .li em{font:800 9px 'Baloo 2',sans-serif;font-style:normal;background:#4e9a3a;color:#fff;border-radius:7px;padding:0 5px;margin-left:5px;vertical-align:2px}
#fpListe .li .r{text-align:right;flex:none}
#fpListe .li .r b{font-size:16px;color:#2e7a2a}
#fpListe .li .r small{color:#2a6ab0}
#fpListe .pl{flex:none;text-align:center;font:800 12px 'Baloo 2',sans-serif;color:#7a5a38;padding-top:8px}`;document.head.appendChild(st);}
const FP_AGR=[150000,400000,900000,1800000,3000000,5000000];
function fpAgrandir(P){fpStyle();fpStyle2();let p=$('fpPop');if(!p){p=document.createElement('div');p.id='fpPop';document.body.appendChild(p);}p.className='';
const i=Math.max(1,Math.floor((CH.max-40)/20)+1), prix=FP_AGR[i-1];
p.innerHTML='<div class="tt"><b>Plus de place</b>'+Math.floor(CH.max/4)+' parcelles</div>'+(prix?'<button class="ag" id="fpAg">Agrandir le champ · +5 parcelles<small>'+enEuros(prix).replace(',00','')+'</small></button>':'<div class="tt">Ton champ est au maximum.</div>');
FP.pop=P;p.classList.add('on');fpPopPlacer(p,P);
const b=$('fpAg');if(b)b.onclick=async(ev)=>{ev.stopPropagation();const d=await appelRPC('champ_agrandir',{p_joueur:e.id});
if(d&&!d.erreur){CH.max=d.max;if(typeof d.euros==='number'){e.euros=d.euros;try{majHaut();}catch(x){}}fpPopFermer();texteVolant(fpX(P.i)+20,fpY(P.j)-4,'+5 parcelles','#ffe070');try{jouer('vente','moment');}catch(x){}}
else texteVolant(fpX(P.i)+20,fpY(P.j)-4,d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Réessaie dans un instant','#ffd0a0');};}
/* ---------- le doigt ---------- */
function fpBloque(){try{return pageOuverte();}catch(x){return false;}}
function fpDebut(t,ev){if(!FP_DOIGT)return false;const tg=ev.target;
const g=tg&&tg.closest&&tg.closest('#fpPop .g');
if(g){if(g.classList.contains('lock')){texteVolant(fpX(FP.pop.i)+20,fpY(FP.pop.j)-4,'À débloquer chez Madeleine','#ffe8a0');return true;}
FP.id=t.identifier;FP.mode='graine';FP.graine=g.dataset.k;FP.vus={};FP.origine=FP.pop;FP.bouge=false;FP.x0=t.clientX;FP.y0=t.clientY;
fpOutilVoir(fpIcone(FP.graine,40),t.clientX,t.clientY);vibrer(8);return true;}
if(tg&&tg.closest&&tg.closest('#fpPop'))return false;           /* le reste de la fenêtre : laisser faire (défilement, bouton) */
if(!FERME_VIERGE||!CHAMP_LIBRE||!CH.charge||fpBloque())return false;
if(tg&&tg.closest&&tg.closest('button,#barre,#haut,#pan,#page2,#porte,#bandeau,#repond,#hublot,#action'))return false;
const w=fpMonde(t.clientX,t.clientY);if(!w)return false;const P=fpSous(w.x,w.y);
if(!P){if($('fpPop')&&$('fpPop').classList.contains('on')){fpPopFermer();return true;}return false;}
fpPopFermer();
if(!fpExiste(P.i,P.j)){const n=fpProchaine();if(!n||n.i!==P.i||n.j!==P.j)return false;
if(chNb()+4>CH.max){fpAgrandir(P);return true;}
FP.vus={};CH_ICI={x:fpX(P.i)+20,y:fpY(P.j)+30};Promise.all(fpSpots(P.i,P.j).map(([c,r])=>chEnvoyer(c,r,'houe'))).then(()=>{CH_ICI=null;if(fpExiste(P.i,P.j))fpGraines(P);});vibrer([10,30,10]);return true;}
const E=fpEtat(P.i,P.j);
const mode=E.mur?'faux':(E.vide?null:(E.soif?'eau':null));
if(!mode){if(E.vide){fpGraines(P);vibrer(6);}else fpInfo(P);return true;}
FP.id=t.identifier;FP.mode=mode;FP.vus={};FP.bouge=true;fpOutilVoir(fpSvg(mode,42),t.clientX,t.clientY);fpAgir(P,mode);return true;}
function fpBouge(t){if(FP.id===null||t.identifier!==FP.id)return false;
fpOutilVoir(FP.mode==='graine'?fpIcone(FP.graine,40):fpSvg(FP.mode,42),t.clientX,t.clientY);
if(FP.mode==='graine'&&!FP.bouge&&Math.hypot(t.clientX-FP.x0,t.clientY-FP.y0)>14){FP.bouge=true;fpPopFermer();}
if(FP.bouge){const w=fpMonde(t.clientX,t.clientY);if(w){const P=fpSous(w.x,w.y);
if(P&&fpExiste(P.i,P.j)&&!FP.vus[P.i+','+P.j]){const E=fpEtat(P.i,P.j);
if((FP.mode==='faux'&&E.mur)||(FP.mode==='eau'&&E.soif)||(FP.mode==='graine'&&E.vide)){fpAgir(P,FP.mode);vibrer(8);}}}}
return true;}
function fpFin(t){if(FP.id===null||t.identifier!==FP.id)return false;
if(FP.mode==='graine'&&!FP.bouge&&FP.origine){fpPopFermer();fpAgir(FP.origine,'graine');}
FP.id=null;FP.mode=null;fpOutilVoir(null);return true;}
addEventListener('touchstart',ev=>{if(FP.id!==null)return;for(const t of ev.changedTouches){if(fpDebut(t,ev)){ev.preventDefault();ev.stopPropagation();return;}}},{capture:true,passive:false});
addEventListener('touchmove',ev=>{for(const t of ev.changedTouches)if(fpBouge(t)){ev.preventDefault();ev.stopPropagation();}},{capture:true,passive:false});
['touchend','touchcancel'].forEach(k=>addEventListener(k,ev=>{for(const t of ev.changedTouches)if(fpFin(t)){ev.preventDefault();ev.stopPropagation();}},{capture:true,passive:false}));
setInterval(()=>{if(FP.pop&&$('fpPop')&&$('fpPop').classList.contains('on'))fpPopPlacer($('fpPop'),FP.pop);},120);

/* =====================================================================
   LA PLAQUE JAUNE, COMME AVANT
   On marche jusqu'à une parcelle : la plaque d'action en bas de l'écran
   dit quoi faire (Semer, Récolter, Arroser, ou le temps qu'il reste), on
   la touche. Semer ouvre la liste des graines juste au-dessus.
   ===================================================================== */
function fpVise(){if(!FERME_VIERGE||!CHAMP_LIBRE||!CH.charge)return null;
const d=joueur.dir||'bas', dx=d==='gauche'?-16:(d==='droite'?16:0), dy=d==='haut'?-18:(d==='bas'?10:0);
const P=fpSous(joueur.x+dx,joueur.y+dy-4)||fpSous(joueur.x,joueur.y-4);if(!P)return null;
if(fpExiste(P.i,P.j))return P;const n=fpProchaine();return n&&n.i===P.i&&n.j===P.j?Object.assign({neuve:true},P):null;}
function fpTexte(P){if(P.neuve)return chNb()+4>CH.max?['Agrandir le champ','PLUS DE PLACE POUR UNE PARCELLE']:['Nouvelle parcelle','GRATUIT · ON BÊCHE ICI'];
const E=fpEtat(P.i,P.j), T=fpTuiles(P.i,P.j).filter(t=>t&&t.cult), nom=T.length&&POT_CULT[T[0].cult]?POT_CULT[T[0].cult][0]:'';
if(E.mur){const nm=fpTuiles(P.i,P.j).filter(t=>t&&t.cult&&chStade(t)===3)[0];return ['Récolter',(nm&&POT_CULT[nm.cult]?POT_CULT[nm.cult][0].toUpperCase():'')+' DANS TON SAC'];}
if((CH.stockArr||0)>0&&!(CH.arr&&CH.arr[P.i+','+P.j]))return ['Poser l’arroseur','ARROSÉE POUR TOUJOURS · IL T’EN RESTE '+CH.stockArr];
if(E.vide)return ['Semer','CHOISIR UNE GRAINE'];
if(E.soif)return ['Arroser','ÇA POUSSERA DEUX FOIS PLUS VITE'];
const m=Math.max(1,Math.ceil((E.fin-chNow())/60000));return [nom+' · ça pousse','PRÊT DANS '+(m>=60?Math.floor(m/60)+' H '+String(m%60).padStart(2,'0'):m+' MIN')];}
const fpMajVrai=majAction;
majAction=function(){if(pgPres()){try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir'||b2.t==='metro'))return fpMajVrai();}catch(x){}plaqueVrai=$('action');const t=pgTexte();plaqueFeinte.classList.remove('inerte');plaqueFeinte.innerHTML=t[0]+'<small>'+t[1]+'</small>';plaqueFeinte.classList.add('on');return;}
if(window.FP_GEL&&Date.now()<window.FP_GEL){try{plaqueVrai=$('action');plaqueFeinte.classList.remove('on');}catch(x){}return;}const P=fpVise();window.FP_VISE=P;
if(!P){if(FP.pop&&$('fpPop')&&$('fpPop').classList.contains('on'))fpPopFermer();return fpMajVrai();}
try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir')){const demi=b2.demi||40;const ec=Math.max(0,Math.abs(b2.x-joueur.x)-demi), dd=Math.hypot(ec,(joueur.y-b2.y)*0.8);if(dd<26)return fpMajVrai();}}catch(x){}
if(FP.pop&&(FP.pop.i!==P.i||FP.pop.j!==P.j))fpPopFermer();
plaqueVrai=$('action');const t=fpTexte(P);plaqueFeinte.classList.remove('inerte');plaqueFeinte.innerHTML=t[0]+'<small>'+t[1]+'</small>';plaqueFeinte.classList.add('on');};
let FP_OCC=false;
async function fpAction(P){if(FP_OCC||(window.FP_GEL&&Date.now()<window.FP_GEL))return;FP_OCC=true;try{
if(P.neuve){if(chNb()+4>CH.max){fpAgrandir(P);return;}
try{potGeste('houe');}catch(x){}vibrer([10,30,10]);CH_ICI={x:fpX(P.i)+20,y:fpY(P.j)+30};
await Promise.all(fpSpots(P.i,P.j).map(([c,r])=>chEnvoyer(c,r,'houe')));CH_ICI=null;if(fpExiste(P.i,P.j))setTimeout(()=>fpGraines(P),200);return;}
const E=fpEtat(P.i,P.j);
if(E.mur){try{potGeste('cueille');}catch(x){}await fpAgir(P,'faux');FP.vus={};return;}
if((CH.stockArr||0)>0&&!(CH.arr&&CH.arr[P.i+','+P.j])){try{potGeste('semer');}catch(x){}vibrer([12,30,12]);const d=await appelRPC('champ_arroseur_poser',{p_joueur:e.id,p_i:P.i,p_j:P.j});
if(d&&!d.erreur){CH.arr=CH.arr||{};CH.arr[P.i+','+P.j]=1;window.FP_ARR_ANIM=window.FP_ARR_ANIM||{};window.FP_ARR_ANIM[P.i+','+P.j]=Date.now();CH.stockArr=d.stock||0;(d.tuiles||[]).forEach(T=>CH.t[chCle(T.c,T.r)]=T);CH.sale=true;texteVolant(fpX(P.i)+20,fpY(P.j)-4,'Arroseur posé : arrosée pour toujours','#bfe8ff');try{jouer('vente','moment');}catch(x){}}
else texteVolant(joueur.x,joueur.y-56,'Réessaie dans un instant','#ffd0a0');return;}
if(E.vide){if(FP.pop&&$('fpPop').classList.contains('on'))fpPopFermer();else fpGraines(P);return;}
if(E.soif){fpArroserAnime(P);return;}
texteVolant(joueur.x,joueur.y-56,'Ça pousse… patience','#fff3d0');
}finally{FP.vus={};FP_OCC=false;try{majAction();}catch(x){}}}
$('action').addEventListener('click',(ev)=>{if(pgPres()){ev.stopImmediatePropagation();ev.preventDefault();pgAction();return;}const P=fpVise();if(!P)return;ev.stopImmediatePropagation();ev.preventDefault();fpAction(P);},true);

/* =====================================================================
   L'ÉTAL DE MADELEINE : une halle ouverte, toit de tuiles, auvent rayé,
   étals remplis, ardoise des prix. À l'ouest, juste au-dessus du chemin
   qui croise ; on y vend la récolte (plaque « Entrer chez Madeleine »).
   Dessiné en points fins (330 x 300), posé à 0,61.
   ===================================================================== */
let FM_ETAL=null;
const fmEtalX=()=>330-Math.round(330*0.61/2), fmEtalBase=()=>948, fmEtalY=()=>948-Math.round(270*0.61);
function fmDansEtal(x,y){const X=330-Math.round(330*0.61/2), B=948;return x>X+30*0.61-4&&x<X+316*0.61+4&&y>B-30&&y<B+3;}
function fmEtalDessin(){const W=330,Hh=300,c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');
const H=(x,y,k)=>{let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const a=(x,y,w,h,col,al)=>{g.globalAlpha=al;g.fillStyle=col;g.fillRect(x,y,w,h);g.globalAlpha=1;};
const FR={tom:['#e03a2a','#c82a1a'],car:['#f08a2a','#e07a1a'],sal:['#6ab84a','#8ad86a'],pom:['#d83a3a','#f0d040'],ble:['#e8c860','#d8b040']};
const cageot=(x,y,fr)=>{r(x,y,22,12,'#b8884a');r(x,y,22,2,'#d8a86a');r(x,y+5,22,1,'#8a5a30');r(x,y+11,22,1,'#6a4220');
for(let k=0;k<6;k++){g.fillStyle=fr[k%fr.length];g.beginPath();g.arc(x+3+k*3.3,y-1+H(k,x,3)*2,2.6,0,7);g.fill();}};
const sol=270,fx=40,fw=250;
g.fillStyle='rgba(20,40,10,.26)';g.beginPath();g.ellipse(165,sol+6,150,14,0,0,7);g.fill();
r(fx+10,sol-110,fw-20,92,'#9a9282');for(let y=sol-110;y<sol-18;y+=8)for(let x=fx+10-((y/8|0)%2)*7;x<fx+fw-10;x+=14){r(Math.max(fx+10,x)+1,y+1,12,6,['#b8b0a0','#a8a090','#c4bcac'][Math.abs(x+y)%3]);}
a(fx+10,sol-110,fw-20,92,'#000',0.25);
const ty=sol-150;g.fillStyle='#b4542e';g.beginPath();g.moveTo(fx-12,sol-104);g.lineTo(fx+30,ty);g.lineTo(fx+fw-30,ty);g.lineTo(fx+fw+12,sol-104);g.fill();
g.save();g.clip();for(let y=ty;y<sol-102;y+=6)for(let x=fx-14;x<fx+fw+14;x+=6){r(x,y,5,6,(x/6|0)%2?'#c8643a':'#a8542e');r(x,y+5,5,1,'#7a2e14');}g.restore();r(fx-14,sol-106,fw+28,4,'#7a2e14');r(fx+30,ty-3,fw-60,4,'#8a3e1e');
for(const px of [fx,fx+fw/2-3,fx+fw-6]){r(px,sol-104,7,104,'#8a5a30');r(px,sol-104,2,104,'#b8804a');}
for(let x=fx-6;x<fx+fw+6;x+=12){const blanc=((x-fx+6)/12|0)%2;r(x,sol-102,12,18,blanc?'#f4ecdc':'#3a8a5a');g.fillStyle=blanc?'#f4ecdc':'#3a8a5a';g.beginPath();g.arc(x+6,sol-84,6,0,Math.PI);g.fill();}
for(const [ex,list] of [[fx+12,[FR.tom,FR.car,FR.sal]],[fx+fw/2+8,[FR.pom,FR.ble,FR.tom]]]){r(ex,sol-36,104,6,'#a8743e');r(ex,sol-36,104,1,'#d8a46a');r(ex+4,sol-30,4,30,'#8a5a30');r(ex+96,sol-30,4,30,'#8a5a30');
list.forEach((fr,k)=>cageot(ex+4+k*34,sol-50,fr));}
r(fx+fw/2-16,sol-70,32,26,'#2e3428');r(fx+fw/2-16,sol-70,32,2,'#8a5a30');for(let k=0;k<4;k++)r(fx+fw/2-11,sol-64+k*5,16+H(k,1,2)*6,1,'#e8e8e0');
{const x=fx+fw/2-50,y=ty-22,w=100;r(x,y,w,16,'#5a3418');r(x+2,y+2,w-4,12,'#a8542e');g.fillStyle='#fff8e4';g.font='bold 9px sans-serif';g.textAlign='center';g.fillText('CHEZ MADELEINE',x+w/2,y+11.5);}
r(fx+fw+6,sol-26,18,26,'#8a5a30');r(fx+fw+6,sol-22,18,2,'#4a4a4a');r(fx+fw+6,sol-8,18,2,'#4a4a4a');r(fx+fw+6,sol-26,18,2,'#a8743e');
return c;}
function fmDessinerEtal(ctx,camX,camY,pile){if(!FM_ETAL){try{FM_ETAL=fmEtalDessin();}catch(x){return;}}
const X=fmEtalX(), Y=fmEtalY(), w=330*0.61, h=300*0.61;if(X+w-camX<-20||X-camX>VW+20||Y+h-camY<-20||Y-camY>VH+80)return;
pile.push({y:fmEtalBase(),f:()=>{ctx.drawImage(FM_ETAL,Math.round(X-camX),Math.round(Y-camY),w,h);
try{const ci=cielDuMoment();if(ci&&ci.lampes>0.4){ctx.save();ctx.globalAlpha=Math.min(1,ci.lampes)*0.5;ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(X+165*0.61-camX,Y+230*0.61-camY,4,X+165*0.61-camX,Y+230*0.61-camY,70);gr.addColorStop(0,'rgba(255,190,90,.6)');gr.addColorStop(1,'rgba(255,190,90,0)');ctx.fillStyle=gr;ctx.fillRect(X-camX,Y-camY,w,h);ctx.restore();}}catch(x){}}});}

/* =====================================================================
   CHEZ MADELEINE, STYLE « JEU MOBILE » (comme le menu du Hangar)
   Rayures vertes, gros onglets à icônes, Madeleine qui parle dans une
   bulle, les produits en cartes, le gros bouton jaune.
   ===================================================================== */
const MAD_SVG=(()=>{const M=["....kkkkkk....","...kGGGGGGk...","..kGGGGGGGGk..","..kGSSSSSSGk..","..kSSkSSkSSk..","..kSSSSSSSSk..","..kSSSrrSSSk..","...kSSSSSSk...","..kkwwwwwwkk..",".kwwwwrwwwwwk.",".kwwwrrrwwwwk.",".kwwwwrwwwwwk.","..kwwwwwwwwk..","..kkkkkkkkkk.."];
const P={k:'#2e1a0a',G:'#b8b0a8',S:'#f0c8a0',r:'#d84a5a',w:'#4a7aa8'};let r='';M.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.')r+='<rect x="'+x+'" y="'+y+'" width="1.02" height="1.02" fill="'+P[c]+'"/>';}));
return 'url("data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" shape-rendering="crispEdges">'+r+'</svg>')+'")';})();


/* LE CHAMP SE CHARGE EN ENTRANT, avec les chantiers et les commandes. Si
   malgré tout il manque, on le demande une fois et on redessine — sans
   repasser par l'ouverture, qui redemanderait tout le reste. */
function bqAtelierChamp(){if(!CH||!CH.charge){try{if(Date.now()-(window.BQ_CH_LU||0)>20000){window.BQ_CH_LU=Date.now();chCharger().then(()=>{if($('page2').classList.contains('on')&&$('page2Fond').classList.contains('bq'))peindreMadeleine();});}}catch(x){}return '<div class="mot">« Un instant, je regarde ton champ… »</div>';}
const max=CH.max||40, nbP=Math.floor(max/4), pris=Math.ceil(chNb()/4);
/* L'ÉCHELLE S'ARRÊTAIT À SIX PALIERS, soit quarante parcelles. Les
   récompenses de niveau poussent le champ plus loin : passé là, la
   boutique affichait « Au max » devant un champ qui n'était pas plein.
   Douze paliers, et le vrai maximum est au bout. */
const i=Math.max(1,Math.floor((max-40)/20)+1),
      PX=[150000,400000,900000,1800000,3000000,5000000,
          8000000,12000000,18000000,26000000,36000000,50000000],
      prix=PX[i-1];
return '<div class="mot">« Ton champ est trop petit ? Je t’arrange ça, contre un petit quelque chose. »</div>'+
'<div class="aLi"><span class="ic">🌱</span><span class="tx"><b>Ton champ · '+pris+' / '+nbP+' parcelles</b><span class="jauge"><i style="width:'+Math.min(100,Math.round(pris/Math.max(1,nbP)*100))+'%"></i></span></span>'+
(prix?'<button data-agch="1">+5<small>'+enEuros(prix).replace(',00','')+'</small></button>':'<em>Au max</em>')+'</div>'+
'<div class="aLi"><canvas id="bqArr" width="80" height="80"></canvas><span class="tx"><b>Arroseurs · '+Object.keys(CH.arr||{}).length+' / '+nbP+'</b><small>arrose une parcelle pour toujours'+((CH.stockArr||0)?' · <u>'+CH.stockArr+' à poser</u>':'')+'</small></span>'+((Object.keys(CH.arr||{}).length+(CH.stockArr||0))<nbP?'<button data-arr="1">Acheter<small>250 €</small></button>':'<em>Complet</em>')+'</div>';}

/* =====================================================================
   LES LAMPADAIRES : peu, aux endroits clés (la porte, l'entrée du champ,
   le croisement, l'étal). Fonte noire, lanterne à quatre vitres. La nuit,
   ils s'allument et éclairent large ; ailleurs, c'est le clair de lune.
   ===================================================================== */
const FM_LAMPES=[[866,612],[936,952],[866,1012],[452,952],[576,428],[844,428],[576,774],[844,774]];
function fmDansLampe(x,y){for(const [lx,ly] of FM_LAMPES)if(Math.abs(x-lx)<4&&y>ly-3&&y<ly+3)return true;return false;}
function fmDessinerLampes(ctx,camX,camY,pile){
for(const [lx,ly] of FM_LAMPES){const x=lx-camX, y=ly-camY;if(x<-120||y<-120||x>VW+120||y>VH+160)continue;
pile.push({y:ly,f:()=>{const P=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round((x+a)*2)/2,Math.round((y+b)*2)/2,w,h);};
P(-3.5,-1,7,2,'rgba(0,0,0,.25)');P(-2.5,-3,5,3,'#1e1e22');P(-1,-44,2.5,41,'#24242a');P(-0.5,-44,1,41,'#4a4a52');P(-2,-22,4.5,1.5,'#24242a');
P(-3,-46,6.5,2,'#24242a');P(-3,-54,6.5,8,'#24242a');P(-2,-53,4.5,6,'#ffe090');P(-0.5,-53,1,6,'#24242a');P(-4,-56,8.5,2,'#24242a');P(-1,-58,2.5,2,'#24242a');
try{const ci=cielDuMoment();if(ci&&ci.lampes>0.05){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,ci.lampes);const g=ctx.createRadialGradient(x,y-50,0,x,y-50,9);g.addColorStop(0,'rgba(255,230,150,.9)');g.addColorStop(1,'rgba(255,170,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-50,9,0,7);ctx.fill();ctx.restore();
lueurNuit(ctx,x,y-6,64,'rgba(255,190,105,1)');}}catch(x){}}});}}

/* =====================================================================
   LES CHÊNES ET LES BANCS DE PARC, en points fins comme la longère
   (dessinés une fois, posés à 0,61). Au croisement, devant la maison,
   près de l'étal et le long des chemins.
   ===================================================================== */
const FM_CHENES=[[806,948],[690,330],[1120,320],[540,905],[990,1310],[1290,935],[812,1520]];
const FM_BANCS=[[848,952],[958,372],[505,952],[956,1318],[1248,952]];
function fmDansDeco(x,y){for(const [cx,cy] of [[806,948],[690,330],[1120,320],[540,905],[990,1310],[1290,935],[812,1520]])if(Math.abs(x-cx)<7&&y>cy-4&&y<cy+3)return true;
for(const [bx,by] of [[848,952],[958,372],[505,952],[956,1318],[1248,952]])if(Math.abs(x-bx)<21&&y>by-7&&y<by+3)return true;return false;}
let FM_CHENE_IMG=null, FM_BANC_IMG=null;
function fmDecoLib(){const H=(x,y,k)=>{let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
function feuillage(g,cx,cy,rx,ry,pal,seed,n){const [d0,d1,m0,m1,l0,l1]=pal;
for(let k=0;k<n;k++){const a=H(seed,k,1)*6.283,r=Math.sqrt(H(k,seed,2)),x=cx+Math.cos(a)*r*rx,y=cy+Math.sin(a)*r*ry,s=rx*0.22+H(seed+k,k,3)*rx*0.16;g.fillStyle=k%2?d0:d1;g.beginPath();g.arc(x,y+s*0.25,s,0,7);g.fill();}
for(let k=0;k<n;k++){const a=H(seed,k,4)*6.283,r=Math.sqrt(H(k,seed,5))*0.85,x=cx+Math.cos(a)*r*rx-rx*0.06,y=cy+Math.sin(a)*r*ry-ry*0.1,s=rx*0.18+H(seed+k,k,6)*rx*0.12;g.fillStyle=k%2?m0:m1;g.beginPath();g.arc(x,y,s,0,7);g.fill();}
for(let k=0;k<n*0.8;k++){const a=H(seed,k,7)*6.283,r=Math.sqrt(H(k,seed,8))*0.7,x=cx+Math.cos(a)*r*rx-rx*0.14,y=cy+Math.sin(a)*r*ry-ry*0.22,s=rx*0.1+H(seed+k,k,9)*rx*0.08;if(y>cy+ry*0.2)continue;g.fillStyle=k%2?l0:l1;g.beginPath();g.arc(x,y,s,0,7);g.fill();}
for(let k=0;k<n*3;k++){const a=H(seed,k,10)*6.283,x=cx+Math.cos(a)*rx*(0.9+H(k,1,11)*0.2),y=cy+Math.sin(a)*ry*(0.9+H(k,2,12)*0.2);g.fillStyle=y<cy?m1:d0;g.fillRect(Math.round(x),Math.round(y),2,2);}}
function chene(){const c=document.createElement('canvas');c.width=170;c.height=200;const g=c.getContext('2d');const x=85,y=192;
g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x+9,y,62,16,0,0,7);g.fill();
const w=16,h=70;g.fillStyle='#5e4128';g.beginPath();g.moveTo(x-w*0.8,y);g.quadraticCurveTo(x-w*0.45,y-h*0.3,x-w*0.4,y-h);g.lineTo(x+w*0.4,y-h);g.quadraticCurveTo(x+w*0.45,y-h*0.3,x+w*0.8,y);g.fill();
for(let k=0;k<h;k+=3){g.fillStyle=k%6?'#6f4f33':'#4a3220';g.fillRect(Math.round(x-w*0.3+H(k,x,1)*w*0.5),Math.round(y-k),2,2);}
g.fillStyle='rgba(255,255,255,.12)';g.fillRect(Math.round(x-w*0.35),y-h,2,h-2);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(Math.round(x+w*0.15),y-h,4,h);
g.strokeStyle='#5e4128';g.lineWidth=5;g.beginPath();g.moveTo(x,y-60);g.lineTo(x-26,y-90);g.moveTo(x+2,y-58);g.lineTo(x+28,y-92);g.stroke();
feuillage(g,x,y-118,66,52,['#24461c','#2c5222','#3a6a2c','#467a34','#62983e','#7aac4c'],11,60);return c;}
function banc(){const c=document.createElement('canvas');c.width=80;c.height=52;const g=c.getContext('2d');const x=40,y=48;
g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x,y+1,36,4,0,0,7);g.fill();
for(const px of [x-26,x+22]){g.fillStyle='#1c1c20';g.fillRect(px,y-22,4,22);g.fillRect(px-2,y-1,8,2);g.fillRect(px,y-40,4,18);g.fillStyle='#3a3a42';g.fillRect(px,y-40,1,40);
g.strokeStyle='#1c1c20';g.lineWidth=2;g.beginPath();g.arc(px+2,y-24,5,Math.PI,Math.PI*1.5);g.stroke();}
for(let k=0;k<3;k++){const yy=y-24+k*3;g.fillStyle=['#a8743e','#9a6a38','#b07c46'][k];g.fillRect(x-32,yy,64,3);g.fillStyle='#d8a46a';g.fillRect(x-32,yy,64,1);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-32,yy+2.5,64,0.5);}
for(let k=0;k<4;k++){const yy=y-42+k*4;g.fillStyle=['#a8743e','#9a6a38','#b07c46','#a06c3a'][k];g.fillRect(x-32,yy,64,3);g.fillStyle='#d8a46a';g.fillRect(x-32,yy,64,1);}
for(let k=0;k<12;k++){g.fillStyle='rgba(60,30,10,.35)';g.fillRect(Math.round(x-30+H(k,1,3)*60),Math.round(y-42+H(k,2,4)*20),3,0.8);}return c;}
return {chene,banc};}
function fmDessinerDeco(ctx,camX,camY,pile){
if(!FM_CHENE_IMG){try{const L=fmDecoLib();FM_CHENE_IMG=L.chene();FM_BANC_IMG=L.banc();}catch(x){return;}}
const K=0.61;
for(const [x0,y0] of FM_CHENES){const w=170*K,h=200*K, X=x0-85*K, Y=y0-192*K;if(X+w-camX<-10||X-camX>VW+10||Y+h-camY<-10||Y-camY>VH+10)continue;
pile.push({y:y0,f:()=>ctx.drawImage(FM_CHENE_IMG,Math.round(X-camX),Math.round(Y-camY),w,h)});}
for(const [x0,y0] of FM_BANCS){const w=80*K,h=52*K, X=x0-40*K, Y=y0-48*K;if(X+w-camX<-10||X-camX>VW+10||Y+h-camY<-10||Y-camY>VH+10)continue;
pile.push({y:y0,f:()=>ctx.drawImage(FM_BANC_IMG,Math.round(X-camX),Math.round(Y-camY),w,h)});}}

/* =====================================================================
   LA STATION DE MÉTRO « FERME » : bouche moderne (muret de pierre claire,
   rampe inox, escalier, totem M bleu), au-dessus du chemin qui croise,
   côté est — posée comme l'étal de Madeleine. La plaque jaune « Prendre
   le métro » vient de l'objet metro posé dans DECOR.
   ===================================================================== */
function fmDessinerMetro(ctx,camX,camY,pile){const cx=1585, sol=950, x0=cx-camX, y0=sol-camY;if(x0<-80||x0>VW+80||y0<-110||y0>VH+20)return;
/* LE NOUVEAU DESSIN, LE MÊME QU'AU VIEUX-PORT : auvent de verre, inox, totem bleu au M rouge */
pile.push({y:sol,f:()=>{try{dessinerX(ctx,{t:'x_metroM',v:0,x:cx,y:sol},x0,y0);}catch(x){}}});return;
pile.push({y:sol,f:()=>{const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round((x0+x)*2)/2,Math.round((y0+y)*2)/2,w,h);};
R(-30,-1,62,3,'rgba(0,0,0,.22)');
R(-28,-30,56,30,'#c9c3b4');R(-24,-28,48,28,'#3a3832');
for(let k=0;k<7;k++){const yy=-28+k*4;R(-24,yy,48,4,k%2?'#4a4844':'#5a5852');R(-24,yy,48,1,'#7a7872');}
try{const gr=ctx.createLinearGradient(0,y0-28,0,y0);gr.addColorStop(0,'rgba(10,12,20,0)');gr.addColorStop(1,'rgba(10,12,20,.7)');ctx.fillStyle=gr;ctx.fillRect(x0-24,y0-28,48,28);}catch(x){}
R(-28,-30,56,3,'#e2dccd');R(-28,-30,3,30,'#e2dccd');R(25,-30,3,30,'#b0aa9c');
R(-28,-38,56,1.2,'#f4f6f8');R(-28,-36.8,56,0.8,'#9aa3aa');for(let k=0;k<=56;k+=7)R(-28+k,-38,1,8,'#b9c1c7');R(-29,-38,1,38,'#b9c1c7');R(28,-38,1,38,'#b9c1c7');
const t=-40;R(t-1.5,-74,3,74,'#5d6770');R(t-1,-74,1,74,'#8a949c');R(t-9,-92,18,18,'#1d4f9a');R(t-9,-92,18,1,'#4d7fc8');R(t-9,-75,18,1,'#12356a');
R(t-6,-88,2,11,'#fff');R(t+4,-88,2,11,'#fff');R(t-4,-87,2,2,'#fff');R(t-3,-85,2,2,'#fff');R(t+1,-85,2,2,'#fff');R(t+2,-87,2,2,'#fff');
R(t-13,-71,26,8,'#12356a');ctx.fillStyle='#fff';ctx.font='bold 5px sans-serif';ctx.textAlign='center';ctx.fillText('FERME',x0+t,y0-65.5);
R(t-4,-61,9,4,'#1d4f9a');R(t-3,-60,3,2,'#fff');R(t+1,-60,3,2,'#e8c06a');
try{const ci=cielDuMoment();if(ci&&ci.lampes>0.05){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,ci.lampes)*0.6;ctx.fillStyle='rgba(120,170,255,.8)';ctx.fillRect(x0+t-9,y0-92,18,18);ctx.restore();lueurNuit(ctx,x0+t,y0-40,52,'rgba(170,200,255,1)');}}catch(x){}}});}

/* =====================================================================
   L'ARROSOIR, DANS LE BON SENS. Il est dans la main du côté où l'on
   regarde, le bec tourné vers la parcelle visée ; il se penche, l'eau
   coule en arc jusqu'à la terre et éclabousse, puis il se redresse.
   ===================================================================== */
function fpArroserAnime(P){if(window.FP_GEL&&Date.now()<window.FP_GEL)return;
const tx=fpX(P.i)+20, ty=fpY(P.j)+20, dx=tx-joueur.x, dy=ty-(joueur.y-10);
const dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');
joueur.dir=dir;joueur.dir8=dir;window.FP_GEL=Date.now()+1450;window.FP_ANIM={t0:Date.now(),x:tx,y:ty,dir};
try{potGeste('arrose');}catch(x){}vibrer(10);try{plaqueFeinte.classList.remove('on');}catch(x){}
setTimeout(()=>{POT_ARROSE=0;FP.vus={};fpAgir(P,'eau').then(()=>{FP.vus={};});},560);
setTimeout(()=>{try{majAction();}catch(x){}},1480);}
/* L'ARROSOIR EN ZINC : dans la main, du côté où l'on regarde ; il se lève,
   se penche, la pomme laisse tomber une pluie fine sur la parcelle (les
   gouttes partent de la pomme et retombent dans la terre, avec de petits
   ronds), puis il se redresse. Le joueur est figé pendant ce temps. */
function fpDessinerArrosoir(g,camX,camY,f,A){
const dir=A.dir, x=joueur.x-camX, y=joueur.y-camY;
const M={droite:[6,-17,1,0.7],gauche:[-6,-17,-1,0.7],haut:[5,-24,1,0.62],bas:[5,-11,1,0.66]}[dir];
const hx=x+M[0], hy=y+M[1], s=M[2], sc=M[3];
const lev=f<0.16?f/0.16:(f>0.84?Math.max(0,(1-f)/0.16):1);
const ease=lev*lev*(3-2*lev);
const base=dir==='haut'?-1.25:(dir==='bas'?0.95:0), tilt=dir==='haut'?-0.25:(dir==='bas'?0.3:0.62);
const ang=base+ease*tilt, lift=-ease*2;
g.save();g.translate(hx,hy+lift);g.scale(s*sc,sc);g.rotate(ang);
const c=['#a8b4bc','#d4dde2','#7a8890','#5a666e'];
g.fillStyle=c[0];g.beginPath();g.moveTo(-6,-5);g.lineTo(5,-5);g.quadraticCurveTo(7,0,5,5);g.lineTo(-6,5);g.quadraticCurveTo(-8,0,-6,-5);g.fill();
g.fillStyle=c[1];g.fillRect(-5,-4,2,8);g.fillStyle=c[2];g.fillRect(-6,3.6,11,1.4);g.fillRect(-6,-1,11,0.8);
g.strokeStyle=c[2];g.lineWidth=1.3;g.beginPath();g.arc(-0.5,-5,4.2,Math.PI*1.05,Math.PI*1.95);g.stroke();
g.strokeStyle=c[0];g.lineWidth=1.8;g.beginPath();g.moveTo(4,2);g.lineTo(14,-5);g.stroke();g.strokeStyle=c[1];g.lineWidth=0.5;g.beginPath();g.moveTo(4,1.4);g.lineTo(14,-5.6);g.stroke();
g.fillStyle=c[2];g.beginPath();g.ellipse(15,-6,2,3,-0.6,0,7);g.fill();g.fillStyle=c[3];for(let k=0;k<5;k++)g.fillRect(15.4+(k%2)*0.6,-8+k,0.5,0.5);
g.restore();
/* la pomme, dans l'écran */
const ca=Math.cos(ang), sa=Math.sin(ang), px=15*sc, py=-6*sc;const rx=hx+s*(px*ca-py*sa), ry=hy+lift+(px*sa+py*ca);
if(f<0.2||f>0.86)return;
const flux=Math.min(1,(f-0.2)/0.08)*Math.min(1,(0.86-f)/0.06);
const tx=A.x-camX, ty=A.y-camY, now=Date.now();
const H=(n)=>{n=(n*374761393)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
g.save();
for(let i=0;i<34;i++){const ph=((now/620)+i/34)%1;if(ph*1>flux+0.05&&f>0.8)continue;
const ex=tx+(H(i*7+1)-0.5)*26, ey=ty+(H(i*13+5)-0.5)*20;
const mx=(rx+ex)/2+(ex-rx)*0.1, my=Math.min(ry,ey)-4;
const u=ph, xx=(1-u)*(1-u)*rx+2*(1-u)*u*mx+u*u*ex, yy=(1-u)*(1-u)*ry+2*(1-u)*u*my+u*u*ey;
g.globalAlpha=flux*(0.55+0.45*(1-u));g.fillStyle='#bfe4ff';g.fillRect(xx-0.35,yy-0.6,0.7,1.2);
if(u>0.92){g.globalAlpha=flux*0.6;g.strokeStyle='rgba(220,240,255,.9)';g.lineWidth=0.35;g.beginPath();g.ellipse(ex,ey,1+((u-0.92)*30),0.5+((u-0.92)*12),0,0,7);g.stroke();}}
g.globalAlpha=flux*0.18;g.fillStyle='#d8f0ff';g.beginPath();g.ellipse(tx,ty,14,10,0,0,7);g.fill();
g.restore();}

/* L'ARROSEUR AUTOMATIQUE, comme celui de l'ancien potager : un tuyau gris
   fait le tour du cadre, quatre buses en laiton aux coins arrosent vers le
   milieu, en battant doucement. */
function fpDessinerArroseur(g,X,Y,now,i,j){const t=now/1000, P=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(a,b,w,h);};
/* un tuyau fin posé sur le cadre de bois, une petite buse en laiton à chaque coin */
P(X+4.5,Y+4.5,31,0.9,'#8e979e');P(X+4.5,Y+34.6,31,0.9,'#8e979e');P(X+4.5,Y+4.5,0.9,31,'#8e979e');P(X+34.6,Y+4.5,0.9,31,'#8e979e');
P(X+4.5,Y+4.5,31,0.4,'#c8d0d6');P(X+4.5,Y+4.5,0.4,31,'#c8d0d6');
[[X+5,Y+5,1,1],[X+35,Y+5,-1,1],[X+5,Y+35,1,-1],[X+35,Y+35,-1,-1]].forEach(([bx,by,sx,sy],k)=>{
P(bx-1,by-1,2,2,'#a8862e');P(bx-1,by-1,2,0.6,'#e8c868');
/* les gouttes : seulement juste après un semis (ou la pose), puis il se tait */
const t0=(window.FP_ARR_ANIM||{})[i+','+j]||0, age=now-t0;if(age>2600)return;const fond=age<200?age/200:(age>2000?(2600-age)/600:1);
const ph=(t*1.8+k*0.25)%1;for(let q=0;q<4;q++){const u=(ph+q/4)%1, d=1.5+u*8;g.fillStyle='rgba(200,232,255,'+((0.95-u*0.7)*fond).toFixed(2)+')';g.fillRect(bx+sx*d-0.5,by+sy*d*0.85-Math.sin(u*Math.PI)*2-0.5,1.1,1.1);}});}

/* =====================================================================
   LES LANTERNES TEMPÊTE DU CHAMP : une de chaque côté de l'enclos, sur
   une potence de bois, le bras tourné vers le champ. Solides au pied.
   ===================================================================== */
const FM_LANTERNES=[];   /* remplacées par des lampadaires aux coins du champ */   /* aux quatre coins de l'enclos */
function fmDessinerLanternes(ctx,camX,camY,pile){
for(const [lx,ly,d] of FM_LANTERNES){const x=lx-camX, y=ly-camY;if(x<-120||y<-120||x>VW+120||y>VH+160)continue;
pile.push({y:ly,f:()=>{const P=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round((x+a)*2)/2,Math.round((y+b)*2)/2,w,h);};
P(-3.5,-1,7,2,'rgba(0,0,0,.25)');P(-1.2,-32,2.4,32,'#6a4a2a');P(-0.4,-32,0.8,32,'#8a6238');P(-2,-2,4,2,'#5a3a20');
P(d>0?-1:-10.5,-32,11.5,2,'#6a4a2a');P(d>0?-1:-10.5,-32,11.5,0.6,'#8a6238');
ctx.strokeStyle='#6a4a2a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-23);ctx.lineTo(x+d*7,y-31);ctx.stroke();
const lx2=d*9;P(lx2-0.3,-30,0.6,3,'#2a2a2a');P(lx2-2.5,-27,5,1.2,'#8a2a1a');P(lx2-2,-26,4,5,'#ffdc8c');P(lx2-0.4,-26,0.8,5,'rgba(120,60,20,.5)');P(lx2-2.5,-21,5,1.2,'#8a2a1a');P(lx2-1.5,-28.5,3,1.5,'#8a2a1a');
try{const ci=cielDuMoment();if(ci&&ci.lampes>0.05){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,ci.lampes);const g2=ctx.createRadialGradient(x+lx2,y-23.5,0,x+lx2,y-23.5,9);g2.addColorStop(0,'rgba(255,215,140,.9)');g2.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(x+lx2,y-23.5,9,0,7);ctx.fill();ctx.restore();
lueurNuit(ctx,x+d*36,y+(ly<600?34:-40),100,'rgba(255,195,110,1)');}}catch(x){}}});}}

/* =====================================================================
   LE POULAILLER (modèle G) : cabane rouge sur pieds, rampe, nichoir,
   parcours grillagé. Au sud-est, au bord du chemin. Les poules s'y
   promènent ; la plaque jaune, devant, nourrit et ramasse (serveur :
   poul_etat / poul_nourrir / poul_ramasser / poul_acheter).
   Dessiné dans un repère « fin » (1 unité = 0,5 px monde).
   ===================================================================== */
const PG_OX=1000, PG_OY=1400, PG_K=0.75;
const pgW=(u)=>PG_OX+u*PG_K, pgH=(v)=>PG_OY+v*PG_K;
let PG={etat:null,charge:false,poules:[],img:null,quand:0};
function pgDansPoulailler(x,y){if(!FERME_VIERGE)return false;
if(x>pgW(44)&&x<pgW(172)&&y>pgH(226)&&y<pgH(252))return true;          /* la cabane et le nichoir */
return x>pgW(168)&&x<pgW(402)&&y>pgH(196)&&y<pgH(352);}               /* le parcours grillagé */
const pgPres=()=>FERME_VIERGE&&CARTE==='village'&&joueur.x>pgW(30)&&joueur.x<pgW(410)&&joueur.y>pgH(250)&&joueur.y<pgH(440);
const PG_LIB=(()=>{
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
function H(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function mix(a,b,t){const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function sh(c,f){const A=hex(c);return '#'+A.map(v=>Math.max(0,Math.min(255,Math.round(f>0?v+(255-v)*f:v*(1+f)))).toString(16).padStart(2,'0')).join('');}
function Pi(g){return {
 r:(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
 tex:(x,y,w,h,c,v,k)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const n=H(x+i,y+j,k||1);g.fillStyle=n<.33?sh(c,-v):(n<.66?c:sh(c,v*0.7));g.fillRect(x+i,y+j,1,1);}},
 grad:(x,y,w,h,c1,c2)=>{for(let j=0;j<h;j++){g.fillStyle=mix(c1,c2,j/Math.max(1,h-1));g.fillRect(x,y+j,w,1);}},
 a:(x,y,w,h,col,al)=>{g.globalAlpha=al;g.fillStyle=col;g.fillRect(x,y,w,h);g.globalAlpha=1;}};}

function pouleF(g,x,y,d,col,pique){const P=Pi(g);const c=col||{c:'#fbf6ec',o:'#e2d6c2',s:'#c8b8a0'};
g.fillStyle='rgba(20,40,10,.25)';g.beginPath();g.ellipse(x,y+1,8,2.2,0,0,7);g.fill();
R(g,x-2,y-2,1,4,'#e8a030');R(g,x+2,y-2,1,4,'#e8a030');R(g,x-3,y+1,3,1,'#e8a030');R(g,x+1,y+1,3,1,'#e8a030');
g.fillStyle=c.s;g.beginPath();g.ellipse(x,y-6,8,6,0,0,7);g.fill();g.fillStyle=c.c;g.beginPath();g.ellipse(x+d*0.5,y-7,7.4,5.4,0,0,7);g.fill();
g.fillStyle=c.o;g.beginPath();g.ellipse(x-d*2,y-6,4,3,-d*0.3,0,7);g.fill();for(let k=0;k<3;k++)R(g,x-d*(2+k*1.4),y-6+k*0.6,1,2,c.s);
/* queue */ g.fillStyle=c.c;g.beginPath();g.moveTo(x-d*6,y-9);g.lineTo(x-d*10,y-15);g.lineTo(x-d*9,y-8);g.fill();g.fillStyle=c.s;g.beginPath();g.moveTo(x-d*7,y-8);g.lineTo(x-d*11,y-13);g.lineTo(x-d*9,y-7);g.fill();
const hx=x+d*6, hy=y-(pique?7:13);g.fillStyle=c.c;g.beginPath();g.arc(hx,hy,3.6,0,7);g.fill();if(!pique){g.fillStyle=c.c;g.fillRect(hx-2,hy,4,6);}
g.fillStyle='#d8382a';g.beginPath();g.arc(hx-d*0.5,hy-3.6,1.4,0,7);g.arc(hx+d*1,hy-3.8,1.3,0,7);g.arc(hx+d*2.2,hy-3,1.1,0,7);g.fill();R(g,hx+d*1.5,hy+1.5,1.6,2.4,'#d8382a');
g.fillStyle='#f0a020';g.beginPath();g.moveTo(hx+d*3,hy-0.8);g.lineTo(hx+d*5.6,hy+0.2);g.lineTo(hx+d*3,hy+1.2);g.fill();R(g,hx+d*1.2-0.6,hy-1.2,1.3,1.3,'#1a1208');}
const ROUSSE={c:'#c8763a',o:'#a85a28',s:'#8a4a20'}, NOIRE={c:'#3a3a40',o:'#2a2a30',s:'#1e1e24'};


function oeufF(g,x,y){g.fillStyle='#f8efe0';g.beginPath();g.ellipse(x,y,2.4,3,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(x-1.2,y-2,1,1.2);}
function enclos(g,P,x0,y0,x1,y1,h,poteau,nosol){/* sol */ if(!nosol)for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x+=2)if(H(x,y,31)<.22)P.r(x,y,2,1,H(x,y,32)<.5?'#c8a860':'#a88858');
const post=(x,y)=>{P.r(x-2,y-h,4,h+2,poteau);P.r(x-2,y-h,1,h,'rgba(255,255,255,.25)');P.r(x-3,y-h-2,6,2,poteau);};
const mesh=(ax,ay,bx,by)=>{g.save();g.strokeStyle='rgba(215,222,228,.55)';g.lineWidth=0.6;const L=Math.hypot(bx-ax,by-ay),n=Math.ceil(L/6);
for(let k=-h/6;k<n+h/6;k++){g.beginPath();g.moveTo(ax+(bx-ax)*k/n,ay+(by-ay)*k/n);g.lineTo(ax+(bx-ax)*(k+h/6)/n,ay+(by-ay)*(k+h/6)/n-h);g.stroke();g.beginPath();g.moveTo(ax+(bx-ax)*(k+h/6)/n,ay+(by-ay)*(k+h/6)/n);g.lineTo(ax+(bx-ax)*k/n,ay+(by-ay)*k/n-h);g.stroke();}
g.restore();g.save();g.strokeStyle=poteau;g.lineWidth=2;g.beginPath();g.moveTo(ax,ay-h);g.lineTo(bx,by-h);g.stroke();g.restore();};
return {fond:()=>{mesh(x0,y0,x1,y0);for(let x=x0;x<=x1;x+=40)post(x,y0);},cotes:()=>{for(let y=y0;y<=y1;y+=30){post(x0,y);post(x1,y);}g.save();g.strokeStyle=poteau;g.lineWidth=2;g.beginPath();g.moveTo(x0,y0-h);g.lineTo(x0,y1-h);g.moveTo(x1,y0-h);g.lineTo(x1,y1-h);g.stroke();g.restore();},devant:()=>{mesh(x0,y1,x1,y1);for(let x=x0;x<=x1;x+=40)post(x,y1);post(x0,y0+(y1-y0)/2);post(x1,y0+(y1-y0)/2);}};}
function cabane(g,P,x,sol,c){/* c={mur,murS,toit,toitS,porte,deco} */ const w=96,h=66,pied=22;
g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x+w/2,sol+3,w*0.62,9,0,0,7);g.fill();
for(const px of [x+6,x+w-10])P.r(px,sol-pied,5,pied,'#5a3a20');
const y=sol-pied;for(let k=0;k<w;k+=8){P.r(x+k,y-h,8,h,H(k,x,3)<.5?c.mur:c.murS);P.r(x+k,y-h,1,h,'rgba(0,0,0,.18)');}P.r(x,y-2,w,3,'rgba(0,0,0,.25)');
P.r(x-2,y-h,4,h,c.trim);P.r(x+w-2,y-h,4,h,c.trim);P.r(x,y-h,w,3,c.trim);
g.fillStyle=c.toit;g.beginPath();g.moveTo(x-12,y-h+4);g.lineTo(x+w/2,y-h-40);g.lineTo(x+w+12,y-h+4);g.fill();g.save();g.clip();for(let yy=y-h-40;yy<y-h+6;yy+=5)P.r(x-14,yy,w+28,1.2,c.toitS);g.restore();P.r(x-13,y-h+2,w+26,3,c.toitS);
/* porte poules */ const dx=x+w/2-11;P.r(dx-2,y-30,26,30,c.trim);P.r(dx,y-28,22,28,'#2a1a10');g.fillStyle='#2a1a10';g.beginPath();g.arc(dx+11,y-28,11,Math.PI,0);g.fill();
if(c.coeur){g.fillStyle=c.coeur;g.beginPath();g.arc(x+w/2-3,y-h+16,3,0,7);g.arc(x+w/2+3,y-h+16,3,0,7);g.moveTo(x+w/2-6,y-h+17);g.lineTo(x+w/2,y-h+24);g.lineTo(x+w/2+6,y-h+17);g.fill();}
/* rampe */ g.fillStyle='#9a6a3e';g.beginPath();g.moveTo(dx+2,y);g.lineTo(dx+20,y);g.lineTo(dx+26,sol+16);g.lineTo(dx-4,sol+16);g.fill();for(let k=0;k<6;k++)P.r(dx-2+k*0.3,y+3+k*6,24,1.6,'#5a3a20');
/* nichoir à couvercle */ const nx=x+w;P.r(nx,y-40,26,30,c.mur);P.r(nx,y-40,26,1,'rgba(255,255,255,.3)');g.fillStyle=c.toit;g.beginPath();g.moveTo(nx-2,y-38);g.lineTo(nx+30,y-46);g.lineTo(nx+30,y-40);g.lineTo(nx-2,y-34);g.fill();P.r(nx+10,y-34,6,2,'#3a3a3a');
return {porte:[dx+11,sol+16]};}
function eau(g,P,x,y){P.r(x-8,y-12,16,12,'#c8ccd2');P.r(x-8,y-12,16,2,'#e8ecf0');P.r(x-10,y-2,20,4,'#9aa2aa');P.r(x-9,y-1,18,2,'#4a90c8');}
function mangeoire(g,P,x,y){P.r(x-14,y-6,28,6,'#8a5a30');P.r(x-14,y-6,28,1.5,'#b8804a');for(let k=0;k<12;k++)P.r(x-12+k*2,y-7,1.4,1.2,'#e8c860');}

function cabane(g,P,x,sol,c,oeufs){const w=96,h=66,pied=22;
g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x+w/2,sol+3,w*0.62,9,0,0,7);g.fill();
for(const px of [x+6,x+w-10])P.r(px,sol-pied,5,pied,'#5a3a20');
const y=sol-pied;for(let k=0;k<w;k+=8){P.r(x+k,y-h,8,h,H(k,x,3)<.5?c.mur:c.murS);P.r(x+k,y-h,1,h,'rgba(0,0,0,.18)');}P.r(x,y-2,w,3,'rgba(0,0,0,.25)');
P.r(x-2,y-h,4,h,c.trim);P.r(x+w-2,y-h,4,h,c.trim);P.r(x,y-h,w,3,c.trim);
g.fillStyle=c.toit;g.beginPath();g.moveTo(x-12,y-h+4);g.lineTo(x+w/2,y-h-40);g.lineTo(x+w+12,y-h+4);g.fill();g.save();g.clip();for(let yy=y-h-40;yy<y-h+6;yy+=5)P.r(x-14,yy,w+28,1.2,c.toitS);g.restore();P.r(x-13,y-h+2,w+26,3,c.toitS);
const dx=x+w/2-11;P.r(dx-2,y-30,26,30,c.trim);P.r(dx,y-28,22,28,'#2a1a10');g.fillStyle='#2a1a10';g.beginPath();g.arc(dx+11,y-28,11,Math.PI,0);g.fill();
g.fillStyle='#9a6a3e';g.beginPath();g.moveTo(dx+2,y);g.lineTo(dx+20,y);g.lineTo(dx+26,sol+16);g.lineTo(dx-4,sol+16);g.fill();for(let k=0;k<6;k++)P.r(dx-2+k*0.3,y+3+k*6,24,1.6,'#5a3a20');
const nx=x+w;P.r(nx,y-40,26,30,c.mur);P.r(nx,y-40,26,1,'rgba(255,255,255,.3)');
if(oeufs){P.r(nx+3,y-24,20,10,'#e8c860');for(let k=0;k<Math.min(4,oeufs);k++)oeufF(g,nx+6+k*4.5,y-21);}
g.fillStyle=c.toit;g.beginPath();g.moveTo(nx-2,y-38);g.lineTo(nx+30,y-46);g.lineTo(nx+30,y-40);g.lineTo(nx-2,y-34);g.fill();P.r(nx+10,y-34,6,2,'#3a3a3a');}
function eau(g,P,x,y){P.r(x-8,y-12,16,12,'#c8ccd2');P.r(x-8,y-12,16,2,'#e8ecf0');P.r(x-10,y-2,20,4,'#9aa2aa');P.r(x-9,y-1,18,2,'#4a90c8');}
function mangeoire(g,P,x,y,plein){P.r(x-14,y-6,28,6,'#8a5a30');P.r(x-14,y-6,28,1.5,'#b8804a');if(plein)for(let k=0;k<12;k++)P.r(x-12+k*2,y-7,1.4,1.2,'#e8c860');}
function calques(oeufs,plein){const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const W=420,HH=380, fond=mk(W,HH), cab=mk(W,HH), dev=mk(W,HH);
{const g=fond.getContext('2d'),P=Pi(g),E=enclos(g,P,170,200,400,350,34,'#7a5232');E.fond();E.cotes();eau(g,P,230,250);mangeoire(g,P,330,280,plein);}
{const g=cab.getContext('2d'),P=Pi(g);cabane(g,P,48,250,{mur:'#a8322a',murS:'#b83a30',trim:'#f0ece0',toit:'#4a3e3a',toitS:'#2e2624'},oeufs);}
{const g=dev.getContext('2d'),P=Pi(g),E=enclos(g,P,170,200,400,350,34,'#7a5232',1);g.save();g.globalCompositeOperation='source-over';E.devant();g.restore();
/* enclos() repeint le sol : on ne garde que la face avant */ g.globalCompositeOperation='destination-in';g.fillStyle='#000';g.fillRect(150,300,270,80);}
return {fond,cab,dev};}
return {calques,pouleF,ROUSSE,NOIRE};})();
async function pgCharger(){if(!e.id)return;try{const d=await appelRPC('poul_etat',{p_joueur:e.id});if(d&&d.p){PG.etat=d;PG.charge=true;PG.img=null;pgPeupler();}}catch(x){}}
function pgPeupler(){const n=PG.etat&&PG.etat.p&&PG.etat.p.niveau>0?Math.min(12,PG.etat.p.poules||0):0;
while(PG.poules.length<n){const k=PG.poules.length;PG.poules.push({x:190+((k*53)%190),y:220+((k*37)%110),tx:0,ty:0,d:k%2?1:-1,pause:Math.random()*2000,pique:0,c:k%5===1?'r':(k%7===3?'n':'b')});}
PG.poules.length=n;}
function pgPlein(){const p=PG.etat&&PG.etat.p;if(!p||!p.nourri_jusqua)return false;return new Date(p.nourri_jusqua).getTime()>Date.now();}
function pgTexte(){if(!PG.charge)return ['Le poulailler','UN INSTANT…'];const p=PG.etat.p, places=PG.etat.places||0;
if(!p.niveau)return ['Construire le poulailler','300 € · AVEC LES MATÉRIAUX'];
if((p.oeufs||0)>0)return ['Ramasser '+p.oeufs+' œuf'+(p.oeufs>1?'s':''),'DANS TON SAC'];
if(!p.poules)return ['Acheter une poule','60 € · '+places+' PLACES'];
if(!pgPlein())return ['Nourrir les poules',(p.grenier>0?'1 GERBE DU GRENIER (IL EN RESTE '+p.grenier+')':'DU GRAIN · '+enEuros(100*p.poules).replace(',00',''))];
if(p.poules<places)return ['Acheter une poule','60 € · '+p.poules+' / '+places+' POULES'];
const m=Math.max(1,Math.ceil((new Date(p.oeufs_depuis).getTime()+1800000-Date.now())/60000));return ['Les poules picorent','PROCHAINS ŒUFS DANS '+m+' MIN'];}
let PG_OCC=false;
async function pgAction(){if(PG_OCC||!PG.charge)return;PG_OCC=true;try{const p=PG.etat.p, places=PG.etat.places||0;let d;
const msg=(t,c)=>texteVolant(joueur.x,joueur.y-56,t,c||'#fff3d0');
if(!p.niveau){d=await appelRPC('poul_acheter',{p_joueur:e.id,p_article:'poulailler'});if(d&&d.erreur)msg(d.erreur==='pas_assez'?'Pas assez d’argent':d.erreur==='materiaux'?'Il faut d’abord les matériaux (chez Madeleine)':'Pas possible pour l’instant','#ffd0a0');}
else if((p.oeufs||0)>0){try{potGeste('ramasse');}catch(x){}d=await appelRPC('poul_ramasser',{p_joueur:e.id});
if(d&&!d.erreur){if(d.sac){e.sac=d.sac;try{sauver();majHaut();}catch(x){}}msg('+'+d.oeufs+' œufs'+(d.or?' · +'+d.or+' œuf d’or !':''),'#ffe070');try{jouer('vente','moment');}catch(x){}vibrer([14,30,14]);if(d.etat)d=d.etat;}
else msg(d&&d.erreur==='sac_plein'?'Ton sac est plein':'Rien à ramasser','#ffd0a0');}
else if(!p.poules||(pgPlein()&&p.poules<places)){d=await appelRPC('poul_acheter',{p_joueur:e.id,p_article:'poule'});if(d&&!d.erreur){msg('Une poule de plus !','#ffe070');vibrer([10,30,10]);}else msg(d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Le poulailler est plein','#ffd0a0');}
else if(!pgPlein()){d=await appelRPC('poul_nourrir',{p_joueur:e.id,p_mode:p.grenier>0?'gerbe':'grain'});if(d&&!d.erreur){msg('Les poules mangent : œufs toutes les 30 min','#ffe070');vibrer(10);PG.mange=Date.now();}else msg(d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Elles n’ont pas faim','#ffd0a0');}
if(d&&d.p){PG.etat=d;PG.img=null;pgPeupler();}else await pgCharger();
}finally{PG_OCC=false;try{majAction();}catch(x){}}}
function pgBouger(dt){for(const q of PG.poules){if(q.pause>0){q.pause-=dt;if(q.pique>0)q.pique-=dt;continue;}
if(!q.tx||Math.hypot(q.tx-q.x,q.ty-q.y)<2){if(q.tx){q.pause=600+Math.random()*2400;q.pique=Math.random()<0.6?q.pause:0;q.tx=0;continue;}
const mange=PG.mange&&Date.now()-PG.mange<6000;q.tx=mange?318+Math.random()*28:186+Math.random()*204;q.ty=mange?262+Math.random()*24:216+Math.random()*124;}
const a=Math.atan2(q.ty-q.y,q.tx-q.x), v=0.03*dt;q.x+=Math.cos(a)*v;q.y+=Math.sin(a)*v;if(Math.abs(Math.cos(a))>0.2)q.d=Math.cos(a)>0?1:-1;}}
let PG_PREC=0;
function pgDessiner(ctx,camX,camY,pile){if(!FERME_VIERGE||CARTE!=='village')return;
const X=pgW(0)-camX, Y=pgH(0)-camY;if(X>VW+40||X+210<-40||Y>VH+40||Y+190<-60)return;
if(!PG.charge&&Date.now()-PG.quand>8000){PG.quand=Date.now();pgCharger();}
const p=PG.etat&&PG.etat.p;if(!PG.img)PG.img=PG_LIB.calques(p&&p.niveau?(p.oeufs||0):0,pgPlein());
const now=Date.now(), dt=Math.min(60,now-(PG_PREC||now));PG_PREC=now;pgBouger(dt);
const W2=420*PG_K, H2=380*PG_K;
ctx.drawImage(PG.img.fond,Math.round(X),Math.round(Y),W2,H2);
pile.push({y:pgH(250),f:()=>ctx.drawImage(PG.img.cab,Math.round(X),Math.round(Y),W2,H2)});
for(const q of PG.poules){const qx=q.x, qy=q.y;pile.push({y:pgH(qy),f:()=>{ctx.save();ctx.translate(X,Y);ctx.scale(PG_K,PG_K);
const c=q.c==='r'?PG_LIB.ROUSSE:(q.c==='n'?PG_LIB.NOIRE:null);PG_LIB.pouleF(ctx,qx,qy,q.d,c,q.pique>0&&Math.floor(now/180)%2===0);ctx.restore();}});}
pile.push({y:pgH(352),f:()=>ctx.drawImage(PG.img.dev,Math.round(X),Math.round(Y),W2,H2)});}
setInterval(()=>{if(FERME_VIERGE&&CARTE==='village'&&e.id&&document.visibilityState==='visible')pgCharger();},90000);

/* =====================================================================
   LA PORCHERIE — étable à cochons en bois, cour en terre battue paillée,
   une vraie souille, une auge. Mêmes données que l'étable du serveur
   (betes_etat / etable_nourrir / betes_truffe / betes_vendre_cochon /
   betes_acheter). Repère « fin » comme le poulailler.
   ===================================================================== */
const PC_OX=540, PC_OY=1040, PC_K=0.75;
const pcW=(u)=>PC_OX+u*PC_K, pcH=(v)=>PC_OY+v*PC_K;
let PC={etat:null,charge:false,cochons:[],img:null,quand:0,mange:0};
function pcDansPorcherie(x,y){if(!FERME_VIERGE)return false;
return x>pcW(14)&&x<pcW(406)&&y>pcH(128)&&y<pcH(352);}
const pcPres=()=>FERME_VIERGE&&CARTE==='village'&&joueur.x>pcW(0)&&joueur.x<pcW(420)&&joueur.y>pcH(352)&&joueur.y<pcH(440);
const PC_LIB=(()=>{
function H(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
function vn(x,y,s,k){const X=Math.floor(x/s),Y=Math.floor(y/s),fx=x/s-X,fy=y/s-Y,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=H(X,Y,k),b=H(X+1,Y,k),c=H(X,Y+1,k),e2=H(X+1,Y+1,k);return a+(b-a)*u+(c-a)*v+(a-b-c+e2)*u*v;}
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function mix(a,b,t){const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function Pi(g){return {r:(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
 grad:(x,y,w,h,c1,c2)=>{for(let j=0;j<h;j++){g.fillStyle=mix(c1,c2,j/Math.max(1,h-1));g.fillRect(x,y+j,w,1);}}};}
const X0=20,Y0=150,X1=400,Y1=350, SX=322,SY=240,SRX=56,SRY=24;
/* LA COUR : terre battue piétinée, paille éparse (plus épaisse devant l'étable), herbe rase qui mord les bords */
function terre(g){const W=420,HH=400,im=g.createImageData(W,HH),d=im.data;
const TB=[[132,100,64],[146,112,72],[120,90,56],[156,124,82]];
for(let y=Y0-14;y<Y1+12;y++)for(let x=X0-12;x<X1+12;x++){
 const bord=Math.min(x-X0,X1-x,y-Y0,Y1-y), n=vn(x,y,7,41);if(bord+n*12-6<0)continue;
 const c=TB[(H(x,y,42)*4)|0], big=(vn(x,y,40,43)-.5)*26, m=Math.hypot((x-SX)/(SRX+26),(y-SY)/(SRY+18))<1?-14:0, a=Math.hypot((x-118)/40,(y-318)/16)<1?-10:0;
 const i=(y*W+x)*4;d[i]=Math.max(0,c[0]+big+m+a);d[i+1]=Math.max(0,c[1]+big+m+a);d[i+2]=Math.max(0,c[2]+big*0.7+m+a);d[i+3]=255;}
g.putImageData(im,0,0);
/* herbe rase qui reste par plaques sur les bords */
for(let k=0;k<420;k++){const t=H(k,1,44);let x,y;if(t<.5){x=X0+H(k,2,45)*(X1-X0);y=H(k,3,46)<.5?Y0+H(k,4,47)*10:Y1-H(k,4,47)*10;}else{y=Y0+H(k,2,48)*(Y1-Y0);x=H(k,3,49)<.5?X0+H(k,4,50)*10:X1-H(k,4,50)*10;}
 R(g,x,y-2,1,3,'#5f8a3c');R(g,x+1,y-1,1,2,'#7aa84e');}
/* paille : brins clairs, plus denses vers l'étable et en litière près des boxes */
for(let k=0;k<1500;k++){const x=X0+6+H(k,5,51)*(X1-X0-12), y=Y0+4+Math.pow(H(k,6,52),1.7)*(Y1-Y0-8);if(Math.hypot((x-SX)/SRX,(y-SY)/SRY)<1.15)continue;
 g.fillStyle=['#e8c868','#d8b050','#f0d88a','#c49a48'][(H(k,7,53)*4)|0];g.save();g.translate(x,y);g.rotate((H(k,8,54)-.5)*2.6);g.fillRect(-2,0,4+H(k,9,55)*3,1);g.restore();}
/* empreintes de sabots (paires de petits creux) */
for(let k=0;k<70;k++){const x=X0+16+H(k,10,56)*(X1-X0-32), y=Y0+20+H(k,11,57)*(Y1-Y0-30);if(Math.hypot((x-SX)/SRX,(y-SY)/SRY)<1.3)continue;R(g,x,y,1.4,1,'rgba(70,46,24,.55)');R(g,x+1.8,y,1.4,1,'rgba(70,46,24,.55)');}
/* petits cailloux */
for(let k=0;k<40;k++){const x=X0+10+H(k,12,58)*(X1-X0-20), y=Y0+10+H(k,13,59)*(Y1-Y0-20);R(g,x,y,2,1,'#b8aa94');R(g,x,y+1,2,1,'#7a6a58');}}
/* LA SOUILLE : boue épaisse, bords mouillés, reflets, éclaboussures */
function souille(g,x,y,rx,ry){g.fillStyle='rgba(90,64,34,.55)';g.beginPath();g.ellipse(x,y+1,rx+6,ry+4,0,0,7);g.fill();
const gr=g.createRadialGradient(x-rx*0.2,y-ry*0.2,2,x,y,rx);gr.addColorStop(0,'#7a5430');gr.addColorStop(.7,'#5e3e20');gr.addColorStop(1,'#4a2e16');g.fillStyle=gr;g.beginPath();
for(let a=0;a<6.3;a+=0.3){const r=1+Math.sin(a*3+1)*0.06+Math.sin(a*5)*0.04;g.lineTo(x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r);}g.closePath();g.fill();
g.fillStyle='rgba(40,24,10,.35)';for(let k=0;k<14;k++){g.beginPath();g.ellipse(x+(H(k,1,4)-0.5)*rx*1.5,y+(H(k,2,4)-0.5)*ry*1.4,3+H(k,3,4)*4,1.2,0,0,7);g.fill();}
g.fillStyle='rgba(200,225,240,.55)';for(const [a,b,w] of [[-0.4,-0.3,14],[0.1,0.1,9],[0.35,-0.15,6]]){g.beginPath();g.ellipse(x+a*rx,y+b*ry,w,1.4,0,0,7);g.fill();}
for(let k=0;k<12;k++){const a=H(k,7,2)*6.28;g.fillStyle='#6a4a28';g.beginPath();g.arc(x+Math.cos(a)*(rx+6+H(k,8,1)*8),y+Math.sin(a)*(ry+4+H(k,9,1)*5),1+H(k,1,9)*1.4,0,7);g.fill();}}
function auge(g,P,x,y,plein){g.fillStyle='rgba(30,20,10,.3)';g.beginPath();g.ellipse(x,y+1,22,3,0,0,7);g.fill();
P.r(x-20,y-10,40,10,'#7a5232');P.r(x-20,y-10,40,2,'#a8784a');P.r(x-17,y-8,34,4,plein?'#d8b860':'#3e2a18');
if(plein)for(let k=0;k<16;k++)P.r(x-16+k*2,y-9-(k%3?0:1),2,1,['#f0d070','#c8a040','#e8c860'][k%3]);P.r(x-22,y-4,4,4,'#5a3a20');P.r(x+18,y-4,4,4,'#5a3a20');}
function abreuvoir(g,P,x,y){P.r(x-12,y-9,24,9,'#9aa2aa');P.r(x-12,y-9,24,2,'#d8dce0');P.r(x-10,y-7,20,3,'#4a90c8');P.r(x-8,y-7,6,1,'#9ad0f0');}
/* clôture de planches : poteaux + deux lisses */
function cloture(g,P,devant){const C='#8a5a30',L='#b8885a',T='#5e3c22';
const lisse=(ax,ay,bx,by)=>{for(const o of [-20,-10]){g.strokeStyle=C;g.lineWidth=3.4;g.beginPath();g.moveTo(ax,ay+o);g.lineTo(bx,by+o);g.stroke();g.strokeStyle=L;g.lineWidth=1;g.beginPath();g.moveTo(ax,ay+o-1.2);g.lineTo(bx,by+o-1.2);g.stroke();}};
const post=(x,y)=>{g.fillStyle='rgba(30,20,10,.25)';g.fillRect(x-3,y,7,2);P.r(x-2.5,y-26,5,27,T);P.r(x-2.5,y-26,1.2,26,'rgba(255,255,255,.18)');P.r(x-3,y-27,6,2,'#7a5232');};
if(!devant){lisse(268,Y0,X1,Y0);for(let x=268;x<=X1;x+=44)post(x,Y0);lisse(X0,Y0,X0,Y1);lisse(X1,Y0,X1,Y1);for(let y=Y0;y<Y1;y+=50){post(X0,y);post(X1,y);}return;}
/* devant : un portillon au milieu */
lisse(X0,Y1,186,Y1);lisse(234,Y1,X1,Y1);for(const x of [X0,64,108,152,186,234,268,312,356,X1])post(x,Y1);
g.strokeStyle='#9a6a3e';g.lineWidth=2.6;for(const o of [-20,-10]){g.beginPath();g.moveTo(188,Y1+o);g.lineTo(232,Y1+o);g.stroke();}
g.beginPath();g.moveTo(190,Y1-20);g.lineTo(230,Y1-10);g.stroke();for(const x of [196,210,224])R(g,x,Y1-22,2,14,'#7a5232');R(g,227,Y1-17,3,3,'#3a3a3a');}
/* L'ÉTABLE : planches claires, toit de tuiles, boxes paillés ouverts sur la cour */
function etable(g,P,x,sol,w){const h=58;g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x+w/2,sol+3,w*0.54,8,0,0,7);g.fill();
for(let k=0;k<w;k+=8){P.r(x+k,sol-h,8,h,H(k,5,3)<.5?'#c8a070':'#b89060');P.r(x+k,sol-h,1,h,'rgba(0,0,0,.15)');}
g.fillStyle='#b4542e';g.beginPath();g.moveTo(x-12,sol-h+6);g.lineTo(x+20,sol-h-28);g.lineTo(x+w-20,sol-h-28);g.lineTo(x+w+12,sol-h+6);g.fill();g.save();g.clip();
for(let yy=sol-h-28;yy<sol-h+8;yy+=5)for(let xx=x-14;xx<x+w+14;xx+=6){P.r(xx+((yy/5|0)%2)*3,yy,5,5,H(xx,yy,9)<.5?'#c8643a':'#a8542e');P.r(xx+((yy/5|0)%2)*3,yy+4,5,1,'#7a2e14');}g.restore();P.r(x-13,sol-h+4,w+26,3,'#7a2e14');
/* lucarne à foin */ P.r(x+w/2-10,sol-h-20,20,14,'#5a3a20');P.r(x+w/2-8,sol-h-18,16,12,'#2a1a10');for(let k=0;k<8;k++)P.r(x+w/2-8+k*2,sol-h-9+(k%2),3,3,'#e8c860');
const nb=2, bw=(w-24-12)/2;for(let b=0;b<nb;b++){const bx=x+12+b*(bw+12);P.r(bx,sol-44,bw,44,'#3a2414');P.grad(bx,sol-44,bw,12,'#1e1208','#3a2414');
for(let k=0;k<60;k++)P.r(bx+2+H(k,b,1)*(bw-6),sol-14+H(b,k,2)*13,4,1,['#e8c860','#d8b040','#f0d878'][k%3]);
P.r(bx-3,sol-46,4,46,'#7a5232');P.r(bx+bw,sol-46,4,46,'#7a5232');P.r(bx-3,sol-47,bw+7,3,'#6a4428');}
}
/* LE BEAU COCHON */
function beau(g,x,y,d,c,o){o=o||{};c=c||{p:'#f6b8b2',l:'#ffd4cc',s:'#d88a86',k:'#9a5450',t:null};const s=o.s||1;g.save();g.translate(x,y);g.scale(d*s,s);
g.fillStyle='rgba(30,20,10,.28)';g.beginPath();g.ellipse(0,1,19,4,0,0,7);g.fill();
const corps=(f)=>{g.beginPath();g.moveTo(-17,-10);g.bezierCurveTo(-18,-22,10,-24,14,-15);g.bezierCurveTo(16,-10,16,-4,11,-3);g.lineTo(-14,-3);g.bezierCurveTo(-18,-4,-19,-7,-17,-10);g.closePath();f();};
if(!o.dort){const ph=o.pas||0;for(const [lx,b,q] of [[-12,0,0],[-6,1,1],[5,0,1],[10,1,0]]){const up=(q?ph:-ph)>0?1:0;g.fillStyle=b?c.s:c.p;g.fillRect(lx-1.6,-5-up,3.4,6);g.fillStyle=c.k;g.fillRect(lx-1.6,0-up,3.4,1.6);}}
g.save();if(o.dort)g.translate(0,4);
corps(()=>{g.fillStyle=c.k;g.save();g.scale(1.06,1.08);g.fill();g.restore();});
corps(()=>{const gr=g.createLinearGradient(0,-24,0,-3);gr.addColorStop(0,c.l);gr.addColorStop(.45,c.p);gr.addColorStop(1,c.s);g.fillStyle=gr;g.fill();});
if(c.t){g.fillStyle=c.t;for(const [a,b,r] of [[-8,-15,4],[2,-18,3],[6,-10,3.4],[-12,-8,2.4]]){g.beginPath();g.ellipse(a,b,r,r*0.75,0,0,7);g.fill();}}
if(o.boue){g.fillStyle='rgba(98,66,36,.9)';for(const [a,b,r] of [[-10,-6,4],[-3,-5,3],[4,-6,3.5],[-14,-9,2.4],[8,-12,2.4]]){g.beginPath();g.ellipse(a,b,r,r*0.6,0,0,7);g.fill();}g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-9,-7,2,0.8);}
g.strokeStyle=c.s;g.lineWidth=1.4;g.beginPath();g.moveTo(-17,-12);g.bezierCurveTo(-22,-14,-22,-8,-19,-9);g.bezierCurveTo(-17,-10,-20,-13,-21,-11);g.stroke();
const fo=o.fouille?2.5:0;g.save();g.translate(0,fo);
g.fillStyle=c.k;g.beginPath();g.ellipse(14,-13,8.4,7.6,0,0,7);g.fill();g.fillStyle=c.p;g.beginPath();g.ellipse(14,-13,7.6,6.8,0,0,7);g.fill();g.fillStyle=c.l;g.beginPath();g.ellipse(13,-16,4,2.4,0,0,7);g.fill();
g.fillStyle=c.s;g.beginPath();g.moveTo(10,-19);g.quadraticCurveTo(16,-26,19,-19);g.quadraticCurveTo(16,-15,12,-15);g.fill();g.fillStyle=c.k;g.beginPath();g.moveTo(12,-18);g.quadraticCurveTo(16,-22,17,-19);g.lineTo(14,-17);g.fill();
g.fillStyle=c.k;g.beginPath();g.ellipse(21,-11,4,3.6,0,0,7);g.fill();g.fillStyle='#ffc4bc';g.beginPath();g.ellipse(21,-11,3.3,2.9,0,0,7);g.fill();g.fillStyle='#a85a58';g.fillRect(19.6,-11.6,1.1,1.6);g.fillRect(21.8,-11.6,1.1,1.6);g.fillStyle='#fff';g.fillRect(20,-13.4,1.4,0.8);
if(o.dort){g.fillStyle='#5a3030';g.fillRect(14.4,-15,3,0.9);}else{g.fillStyle='#1a1208';g.fillRect(15,-16,2,2);g.fillStyle='#fff';g.fillRect(15.4,-15.8,0.7,0.7);}
g.fillStyle='rgba(255,120,120,.35)';g.beginPath();g.ellipse(16,-10.5,2.2,1.3,0,0,7);g.fill();
if(o.fouille&&o.t%2){g.fillStyle='#6a4a28';g.fillRect(24,-6,1.4,1.4);g.fillRect(26,-8,1,1);}
g.restore();g.restore();g.restore();
if(o.dort){const z=o.t%3;g.fillStyle='rgba(255,255,255,.9)';g.font='bold 7px sans-serif';g.fillText('z',x+d*18*s,y-22*s-z);g.font='bold 5px sans-serif';g.fillText('z',x+d*23*s,y-29*s-z);}}
const PAL=[null,{p:'#f8d4cc',l:'#fff0ea',s:'#d8a8a0',k:'#9a6a64',t:'#4a3434'},{p:'#b8805c',l:'#d8a07a',s:'#8a5a3c',k:'#5a3a24'},null,{p:'#4a4448',l:'#6a6268',s:'#2e2a2e',k:'#1a1618'},{p:'#f8d4cc',l:'#fff0ea',s:'#d8a8a0',k:'#9a6a64',t:'#4a3434'}];
function calques(plein){const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const W=420,HH=400, fond=mk(W,HH), etab=mk(W,HH), dev=mk(W,HH);
{const g=fond.getContext('2d'),P=Pi(g);terre(g);souille(g,SX,SY,SRX,SRY);cloture(g,P,0);auge(g,P,118,318,plein);abreuvoir(g,P,64,322);}
{const g=etab.getContext('2d'),P=Pi(g);etable(g,P,24,152,244);}
{const g=dev.getContext('2d'),P=Pi(g);cloture(g,P,1);}
return {fond,etab,dev};}
return {calques,beau,PAL,SX,SY,SRX,SRY};})();
async function pcCharger(){if(!e.id)return;try{const d=await appelRPC('betes_etat',{p_joueur:e.id});if(d&&d.cochons!=null){const pl=PC.etat&&PC.etat.foin>0;PC.etat=d;PC.charge=true;PC.recu=Date.now();if(pl!==(d.foin>0))PC.img=null;pcPeupler();}}catch(x){}}
function pcFoin(){const E=PC.etat;return !!E&&E.foin-(Date.now()-(PC.recu||0))/1000>0;}
function pcPeupler(){const n=PC.etat?Math.min(6,PC.etat.cochons||0):0;
while(PC.cochons.length<n){const k=PC.cochons.length;PC.cochons.push({k,x:60+((k*67)%300),y:200+((k*41)%120),tx:0,ty:0,d:k%2?1:-1,pause:Math.random()*3000,etat:'',boue:0,t:0});}
PC.cochons.length=n;}
function pcTaille(){const pb=PC.etat?PC.etat.poids_bete||0:0;return 0.82+0.4*Math.min(1,pb/120);}
function pcTexte(){if(!PC.charge)return ['La porcherie','UN INSTANT…'];const E=PC.etat;
if(!E.cochons)return ['Acheter un cochon',enEuros(E.prix_cochon).replace(',00','')+' · IL TROUVE DES TRUFFES'];
if(E.truffe_prete)return ['Chercher la truffe','LES COCHONS FOUILLENT LA TERRE'];
if(!pcFoin())return ['Donner le foin','2 BLÉ DU SAC, SINON 3 € · 3 H'];
if((E.poids_bete||0)>=120)return ['Vendre un cochon gras',enEuros((E.poids_bete||0)*42).replace(',00','')+' · '+E.poids_bete+' KG'];
const h=Math.ceil((E.truffe_dans||0)/3600);return ['Les cochons engraissent',E.poids_bete+' KG CHACUN · TRUFFE DANS '+(h>1?h+' H':'1 H')];}
let PC_OCC=false;
async function pcAction(){if(PC_OCC||!PC.charge)return;PC_OCC=true;try{const E=PC.etat;let d,et=null;
const msg=(t,c)=>texteVolant(joueur.x,joueur.y-56,t,c||'#fff3d0');
if(!E.cochons){d=await appelRPC('betes_acheter',{p_joueur:e.id,p_espece:'cochon'});if(d&&!d.erreur){et=d;try{e.euros=(e.euros||0)-E.prix_cochon;sauver();majHaut();}catch(x){}msg('Un cochon de plus !','#ffe070');vibrer([10,30,10]);try{jouer('achat');}catch(x){}}else msg(d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Pas possible pour l’instant','#ffd0a0');}
else if(E.truffe_prete){PC.fouille=Date.now();d=await appelRPC('betes_truffe',{p_joueur:e.id});
if(d&&!d.erreur){et=d.etat;if(d.trouve){msg('Une truffe ! (dans ton sac)','#f0cf7d');try{jouer('vente','moment');}catch(x){}vibrer([14,30,14]);try{await recalerLeSac(true);majHaut();}catch(x){}}else msg('Pas de truffe cette fois…','#fff3d0');}else msg('Pas encore','#ffd0a0');}
else if(!pcFoin()){d=await appelRPC('etable_nourrir',{p_joueur:e.id});if(d&&!d.erreur){PC.mange=Date.now();msg('Les cochons mangent : ils engraissent','#ffe070');vibrer(10);}else msg(d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Ils n’ont pas faim','#ffd0a0');}
else if((E.poids_bete||0)>=120){d=await appelRPC('betes_vendre_cochon',{p_joueur:e.id});if(d&&!d.erreur){et=d.etat;msg('+'+enEuros(d.gain),'#ffe070');try{jouer('vente','moment');}catch(x){}vibrer([14,30,14]);try{e.euros=(e.euros||0)+d.gain;sauver();majHaut();}catch(x){}}else msg('Pas possible pour l’instant','#ffd0a0');}
else msg('Ils se roulent dans la boue…','#fff3d0');
if(et&&et.cochons!=null){PC.etat=et;PC.recu=Date.now();PC.img=null;pcPeupler();}else await pcCharger();PC.img=null;
}finally{PC_OCC=false;try{majAction();}catch(x){}}}
function pcBouger(dt){const L=PC_LIB, now=Date.now(), mange=PC.mange&&now-PC.mange<9000, fouille=PC.fouille&&now-PC.fouille<5000;
const nuit=typeof MINUTE==='number'&&(MINUTE<6*60||MINUTE>21*60+30);
for(const q of PC.cochons){q.t+=dt;if(q.boue>0)q.boue-=dt;
if(q.pause>0){q.pause-=dt;if(q.etat==='souille')q.boue=60000;if((mange||fouille)&&q.etat!=='fouille'&&q.etat!=='mange'){q.pause=0;q.etat='';}else continue;}
if(!q.tx||Math.hypot(q.tx-q.x,q.ty-q.y)<2){if(q.tx){q.tx=0;q.pause=q.etat==='souille'?8000+Math.random()*10000:q.etat==='dodo'?12000+Math.random()*16000:q.etat==='mange'?5000:1500+Math.random()*3500;if(q.etat==='marche')q.etat=Math.random()<0.5?'fouille':'';continue;}
 const r=Math.random();
 if(mange){q.etat='mange';q.tx=84+q.k*13+Math.random()*4;q.ty=326+(q.k%2)*8;}
 else if(fouille){q.etat='fouille';q.tx=40+Math.random()*340;q.ty=200+Math.random()*130;}
 else if(r<(nuit?0.7:0.16)){q.etat='dodo';const b=q.k%2;q.tx=60+b*124+Math.random()*60;q.ty=156+Math.random()*6;}
 else if(r<(nuit?0.8:0.36)){q.etat='souille';const a=Math.random()*6.28;q.tx=L.SX+Math.cos(a)*L.SRX*0.5;q.ty=L.SY+Math.sin(a)*L.SRY*0.5;}
 else{q.etat='marche';q.tx=40+Math.random()*340;q.ty=176+Math.random()*156;}}
const a=Math.atan2(q.ty-q.y,q.tx-q.x), v=0.022*dt;q.x+=Math.cos(a)*v;q.y+=Math.sin(a)*v;if(Math.abs(Math.cos(a))>0.25)q.d=Math.cos(a)>0?1:-1;}}
let PC_PREC=0;
function pcDessiner(ctx,camX,camY,pile){if(!FERME_VIERGE||CARTE!=='village')return;
const X=pcW(0)-camX, Y=pcH(0)-camY;if(X>VW+40||X+320<-40||Y>VH+40||Y+300<-60)return;
if(!PC.charge&&Date.now()-PC.quand>8000){PC.quand=Date.now();pcCharger();}
if(!PC.img)PC.img=PC_LIB.calques(pcFoin());
const now=Date.now(), dt=Math.min(60,now-(PC_PREC||now));PC_PREC=now;pcBouger(dt);
const W2=420*PC_K, H2=400*PC_K, s=pcTaille();
ctx.drawImage(PC.img.fond,Math.round(X),Math.round(Y),W2,H2);
pile.push({y:pcH(152),f:()=>ctx.drawImage(PC.img.etab,Math.round(X),Math.round(Y),W2,H2)});
for(const q of PC.cochons){const qx=q.x,qy=q.y,arret=!q.tx||q.pause>0;
 const o={s,t:Math.floor(now/260),boue:q.boue>0,dort:arret&&(q.etat==='dodo'||q.etat==='souille'),fouille:arret&&(q.etat==='fouille'||q.etat==='mange'),pas:arret?0:(Math.floor(q.t/140)%2?1:-1)};
 pile.push({y:pcH(qy),f:()=>{ctx.save();ctx.translate(X,Y);ctx.scale(PC_K,PC_K);PC_LIB.beau(ctx,qx,qy,q.d,PC_LIB.PAL[q.k%6],o);ctx.restore();}});}
pile.push({y:pcH(350),f:()=>ctx.drawImage(PC.img.dev,Math.round(X),Math.round(Y),W2,H2)});}
setInterval(()=>{if(FERME_VIERGE&&CARTE==='village'&&e.id&&document.visibilityState==='visible')pcCharger();},90000);
{const pcMajPrec=majAction;
majAction=function(){if(pcPres()){try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir'||b2.t==='metro'))return pcMajPrec();}catch(x){}plaqueVrai=$('action');const t=pcTexte();plaqueFeinte.classList.remove('inerte');plaqueFeinte.innerHTML=t[0]+'<small>'+t[1]+'</small>';plaqueFeinte.classList.add('on');return;}return pcMajPrec();};
$('action').addEventListener('click',(ev)=>{if(pcPres()){ev.stopImmediatePropagation();ev.preventDefault();pcAction();}},true);}
/* =====================================================================
   LE PRÉ À MOUTONS — bergerie en pierre, toit de tuiles, clôture en
   rondins, abreuvoir en pierre, herbe haute. Données : betes_etat (partagé
   avec la porcherie, PC.etat) / betes_tondre / betes_acheter('mouton').
   ===================================================================== */
const MO_OX=196, MO_OY=512, MO_K=0.75;
const moW=(u)=>MO_OX+u*MO_K, moH=(v)=>MO_OY+v*MO_K;
let MO={moutons:[],img:null};
function moDansPre(x,y){if(!FERME_VIERGE)return false;return x>moW(20)&&x<moW(410)&&y>moH(128)&&y<moH(362);}
const moPres=()=>FERME_VIERGE&&CARTE==='village'&&joueur.x>moW(10)&&joueur.x<moW(420)&&joueur.y>moH(362)&&joueur.y<moH(432);
const MO_LIB=(()=>{
function H(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
const P={};let G=null;P.r=(x,y,w,h,c)=>{G.fillStyle=c;G.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const X0=26,Y0=150,X1=404,Y1=360;
function herbeHaute(g){for(let i=0;i<(X1-X0)*(Y1-Y0)/12;i++){const x=X0+2+H(i,1,1)*(X1-X0-4),y=Y0+6+H(i,1,2)*(Y1-Y0-6),h=3+H(i,1,3)*4;g.fillStyle=['#4f7f34','#5f9240','#6fa64a','#86b85a'][(H(i,1,4)*4)|0];g.fillRect(x|0,(y-h)|0,1,h|0);if(H(i,1,5)<.3)g.fillRect((x+1)|0,(y-h+1)|0,1,(h-1)|0);}
for(let i=0;i<(X1-X0)*(Y1-Y0)/500;i++){const x=X0+4+H(i,2,6)*(X1-X0-8),y=Y0+10+H(i,2,7)*(Y1-Y0-12);g.fillStyle=H(i,2,8)<.6?'#f4f0e0':'#f0d860';g.fillRect(x|0,(y-5)|0,2,2);g.fillStyle='#4f7f34';g.fillRect(x|0,(y-3)|0,1,3);}}
function rondins(g){const post=(x,y)=>{g.fillStyle='rgba(20,30,10,.25)';g.fillRect(x-3,y,7,2);P.r(x-2.5,y-24,5,25,'#6a4a2a');P.r(x-2.5,y-24,1.2,24,'rgba(255,255,255,.18)');g.fillStyle='#c8a070';g.beginPath();g.ellipse(x,y-24,2.5,1,0,0,7);g.fill();};
const rail=(ax,ay,bx,by)=>{for(const o of [-20,-13,-6]){g.strokeStyle='#8a6038';g.lineWidth=2.6;g.beginPath();g.moveTo(ax,ay+o);g.lineTo(bx,by+o);g.stroke();g.strokeStyle='#b88a5a';g.lineWidth=0.8;g.beginPath();g.moveTo(ax,ay+o-1);g.lineTo(bx,by+o-1);g.stroke();}};
return {fond:()=>{rail(186,Y0,X1,Y0);for(let x=186;x<=X1;x+=40)post(x,Y0);rail(X0,Y0,X0,Y1);rail(X1,Y0,X1,Y1);for(let y=Y0;y<Y1;y+=42){post(X0,y);post(X1,y);}},
devant:()=>{rail(X0,Y1,X1,Y1);for(let x=X0;x<=X1;x+=42)post(x,Y1);post(X1,Y1);}};}
function bergerie(g,x,sol){const w=150,h=50;g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x+w/2,sol+3,w*0.56,8,0,0,7);g.fill();
for(let r=0;r<h/6;r++)for(let k=0;k<w;k+=10){const xx=x+k+(r%2)*5,yy=sol-6-r*6;if(xx>x+w-6)continue;P.r(xx,yy,Math.min(9,x+w-xx),5,['#c8bca4','#b8ac94','#d4c8b0','#a89c84'][(H(k,r,4)*4)|0]);P.r(xx,yy+5,Math.min(10,x+w-xx),1,'#7a6e5c');}
P.r(x,sol-h,w,2,'#9a8e78');
g.fillStyle='#b4542e';g.beginPath();g.moveTo(x-10,sol-h+4);g.lineTo(x+w/2,sol-h-34);g.lineTo(x+w+10,sol-h+4);g.fill();g.save();g.clip();for(let yy=sol-h-34;yy<sol-h+6;yy+=5)for(let xx=x-12;xx<x+w+12;xx+=6){P.r(xx+((yy/5|0)%2)*3,yy,5,5,H(xx,yy,9)<.5?'#c8643a':'#a8542e');P.r(xx+((yy/5|0)%2)*3,yy+4,5,1,'#7a2e14');}g.restore();P.r(x-11,sol-h+2,w+22,3,'#7a2e14');
const dx=x+w/2-16;P.r(dx-3,sol-38,38,38,'#e0d4bc');P.r(dx,sol-34,32,34,'#2a1a10');g.fillStyle='#2a1a10';g.beginPath();g.arc(dx+16,sol-34,16,Math.PI,0);g.fill();for(let k=0;k<30;k++)P.r(dx+2+H(k,1,1)*26,sol-9+H(k,2,1)*8,4,1,['#e8c860','#d8b040'][k%2]);
for(const fx of [x+16,x+w-32]){P.r(fx,sol-32,16,13,'#e0d4bc');P.r(fx+2,sol-30,12,9,'#3a2a1a');P.r(fx+7,sol-30,1.5,9,'#e0d4bc');}}
function abreuvoir(g,x,y){g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(x,y+1,20,3,0,0,7);g.fill();P.r(x-18,y-11,36,11,'#a89c86');P.r(x-18,y-11,36,2,'#c8bca6');P.r(x-15,y-9,30,3,'#4a90c8');P.r(x-11,y-9,8,1,'#9ad0f0');}
function mouton(g,x,y,d,c,o){o=o||{};c=c||{p:'#f2ede2',l:'#ffffff',s:'#d6cdbb',k:'#a0957f',h:'#2a2420',j:'#2a2420'};const s=o.s||1,f=o.laine||1;g.save();g.translate(x,y);g.scale(d*s,s);
g.fillStyle='rgba(30,40,10,.28)';g.beginPath();g.ellipse(0,1,16,3.6,0,0,7);g.fill();
if(!o.couche){const ph=o.pas||0;for(const [lx,b] of [[-9,0],[-5,1],[5,1],[9,0]]){const up=(b?ph:-ph)>0?1:0;g.fillStyle=c.j;g.fillRect(lx-1.1,-7-up,2.3,8);if(b){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(lx-1.1,-7-up,2.3,8);}}}
g.save();if(o.couche)g.translate(0,5);
const pts=[[-13,-11,6],[-8,-15,6.4],[-1,-16.5,6.6],[6,-15.5,6.2],[11,-12,5.4],[-12,-7,5.2],[-5,-8,6],[3,-8,6],[10,-8,5]].map(([a,b,r])=>[a*(0.85+0.15*f),-9+(b+9)*f,r*f]);
g.fillStyle=c.k;for(const [a,b,r] of pts){g.beginPath();g.arc(a,b,r+0.9,0,7);g.fill();}
g.fillStyle=c.s;for(const [a,b,r] of pts){g.beginPath();g.arc(a,b,r,0,7);g.fill();}
g.fillStyle=c.p;for(const [a,b,r] of pts){g.beginPath();g.arc(a-0.4,b-1.2*f,r*0.82,0,7);g.fill();}
g.fillStyle=c.l;for(const [a,b,r] of pts.slice(0,5)){g.beginPath();g.arc(a-1,b-2.4*f,r*0.45,0,7);g.fill();}
if(f>0.85){g.strokeStyle=c.s;g.lineWidth=0.7;for(let k=0;k<12;k++){g.beginPath();g.arc(-11+H(k,1,3)*22,-14+H(k,2,3)*9,1.3,0,4.5);g.stroke();}}
const br=o.broute, hx=15*(0.9+0.1*f), hy=br?-4:-9-6*f;
g.save();g.translate(hx,hy);g.rotate(br?0.5:0);
g.fillStyle=c.h;g.beginPath();g.ellipse(2,0,4.4,3.4,0.25,0,7);g.fill();g.beginPath();g.ellipse(5,1.4,3,2.4,0.3,0,7);g.fill();
g.beginPath();g.ellipse(-1.5,-2.2,3.6,1.3,-0.35,0,7);g.fill();
g.fillStyle=c.p;g.beginPath();g.arc(0,-3,2.6*f,0,7);g.arc(2.4,-3.4,2*f,0,7);g.fill();
if(o.dort){g.fillStyle=c.e?'#5a4a3a':'#8a8278';g.fillRect(2,-0.8,2.2,0.7);}else{g.fillStyle=c.e?'#1a1208':'#f0e8d8';g.fillRect(2.4,-1.2,1.3,1.3);g.fillStyle='#1a1208';g.fillRect(2.8,-1,0.8,0.8);}
g.fillStyle='rgba(0,0,0,.35)';g.fillRect(7,1.6,0.9,0.8);
g.restore();g.restore();g.restore();
if(br&&o.t%2){g.fillStyle='#5a9a3a';g.fillRect(x+d*(20*s),y-2,1,3);}
if(o.dort){const z=o.t%3;g.fillStyle='rgba(255,255,255,.9)';g.font='bold 6px sans-serif';g.fillText('z',x+d*16*s,y-18*s-z);}}
const PAL=[null,{p:'#ece2c8',l:'#faf4e2',s:'#cdbf9c',k:'#958564',h:'#f0e6d0',j:'#d8ccb4',e:1},null,{p:'#4a4440',l:'#6c645e',s:'#302c2a',k:'#1a1614',h:'#1e1a18',j:'#1e1a18'},null,{p:'#d8c8a8',l:'#efe4cc',s:'#b8a682',k:'#7a6a4e',h:'#6a4a32',j:'#5a3e2a'},null,{p:'#ece2c8',l:'#faf4e2',s:'#cdbf9c',k:'#958564',h:'#f0e6d0',j:'#d8ccb4',e:1}];
function calques(){const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const W=420,HH=400,fond=mk(W,HH),berg=mk(W,HH),dev=mk(W,HH);
{const g=fond.getContext('2d');G=g;herbeHaute(g);rondins(g).fond();abreuvoir(g,346,206);}
{const g=berg.getContext('2d');G=g;bergerie(g,32,150);}
{const g=dev.getContext('2d');G=g;rondins(g).devant();}
return {fond,berg,dev};}
return {calques,mouton,PAL};})();
function moPeupler(){const n=PC.etat?Math.min(8,PC.etat.moutons||0):0;
while(MO.moutons.length<n){const k=MO.moutons.length;MO.moutons.push({k,x:60+((k*83)%320),y:190+((k*47)%150),tx:0,ty:0,d:k%2?1:-1,pause:Math.random()*4000,etat:'',t:0,agneau:k===4});}
MO.moutons.length=n;}
function moLaine(){const E=PC.etat;if(!E||E.laine_dans==null)return 1;if(E.laine_prete)return 1;const p=1-Math.max(0,E.laine_dans-(Date.now()-(PC.recu||0))/1000)/172800;return 0.62+0.38*Math.max(0,Math.min(1,p));}
function moTexte(){if(!PC.charge)return ['Le pré à moutons','UN INSTANT…'];const E=PC.etat;
if(!E.moutons)return ['Acheter un mouton',(E.prix_mouton?enEuros(E.prix_mouton).replace(',00',''):'—')+' · IL DONNE DE LA LAINE'];
if(E.laine_prete)return ['Tondre les moutons',E.moutons+' LAINE'+(E.moutons>1?'S':'')+' DANS TON SAC'];
const h=Math.max(1,Math.ceil((E.laine_dans||0)/3600));return ['Les moutons broutent','LAINE PRÊTE DANS '+(h>=24?Math.floor(h/24)+' J '+(h%24)+' H':h+' H')];}
let MO_OCC=false;
async function moAction(){if(MO_OCC||!PC.charge)return;MO_OCC=true;try{const E=PC.etat;let d,et=null;
const msg=(t,c)=>texteVolant(joueur.x,joueur.y-56,t,c||'#fff3d0');
if(!E.moutons){d=await appelRPC('betes_acheter',{p_joueur:e.id,p_espece:'mouton'});if(d&&!d.erreur){et=d;try{e.euros=(e.euros||0)-E.prix_mouton;sauver();majHaut();}catch(x){}msg('Un mouton de plus !','#ffe070');vibrer([10,30,10]);try{jouer('achat');}catch(x){}}else msg(d&&d.erreur==='pas_assez'?'Pas assez d’argent':'Pas possible pour l’instant','#ffd0a0');}
else if(E.laine_prete){try{potGeste('cueille');}catch(x){}d=await appelRPC('betes_tondre',{p_joueur:e.id});
if(d&&!d.erreur){et=d.etat;msg('+'+d.laine+' laine'+(d.laine>1?'s':''),'#ffe070');try{jouer('vente','moment');}catch(x){}vibrer([14,30,14]);MO.tonte=Date.now();try{await recalerLeSac(true);majHaut();}catch(x){}}else msg('Pas encore','#ffd0a0');}
else msg('Ils broutent tranquillement…','#fff3d0');
if(et&&et.cochons!=null){PC.etat=et;PC.recu=Date.now();PC.img=null;pcPeupler();moPeupler();}else{await pcCharger();moPeupler();}
}finally{MO_OCC=false;try{majAction();}catch(x){}}}
function moBouger(dt){const nuit=typeof MINUTE==='number'&&(MINUTE<6*60||MINUTE>21*60+30);
for(const q of MO.moutons){q.t+=dt;if(q.pause>0){q.pause-=dt;continue;}
if(!q.tx||Math.hypot(q.tx-q.x,q.ty-q.y)<2){if(q.tx){q.tx=0;q.pause=q.etat==='dodo'?(nuit?60000:14000+Math.random()*14000):q.etat==='broute'?3000+Math.random()*6000:q.etat==='boit'?4000:1200+Math.random()*2500;continue;}
 const r=Math.random();
 if(r<(nuit?0.85:0.1)){q.etat='dodo';q.tx=50+((q.k*37)%140)+Math.random()*10;q.ty=166+((q.k*13)%22);}
 else if(r<(nuit?0.9:0.18)){q.etat='boit';q.tx=346+(Math.random()-.5)*24;q.ty=214;}
 else if(r<0.62){q.etat='broute';const a=Math.random()*6.28;q.tx=Math.max(48,Math.min(386,q.x+Math.cos(a)*30));q.ty=Math.max(176,Math.min(346,q.y+Math.sin(a)*20));}
 else{q.etat='marche';q.tx=48+Math.random()*338;q.ty=176+Math.random()*170;}}
const a=Math.atan2(q.ty-q.y,q.tx-q.x), v=(q.etat==='broute'?0.008:0.018)*dt;q.x+=Math.cos(a)*v;q.y+=Math.sin(a)*v;if(Math.abs(Math.cos(a))>0.25)q.d=Math.cos(a)>0?1:-1;}}
let MO_PREC=0;
function moDessiner(ctx,camX,camY,pile){if(!FERME_VIERGE||CARTE!=='village')return;
const X=moW(0)-camX, Y=moH(0)-camY;if(X>VW+40||X+320<-40||Y>VH+40||Y+300<-60)return;
if(!PC.charge&&Date.now()-PC.quand>8000){PC.quand=Date.now();pcCharger();}
if(MO.moutons.length!==Math.min(8,PC.etat?PC.etat.moutons||0:0))moPeupler();
if(!MO.img)MO.img=MO_LIB.calques();
const now=Date.now(), dt=Math.min(60,now-(MO_PREC||now));MO_PREC=now;moBouger(dt);
const W2=420*MO_K, H2=400*MO_K, f=moLaine();
ctx.drawImage(MO.img.fond,Math.round(X),Math.round(Y),W2,H2);
pile.push({y:moH(150),f:()=>ctx.drawImage(MO.img.berg,Math.round(X),Math.round(Y),W2,H2)});
for(const q of MO.moutons){const qx=q.x,qy=q.y,arret=!q.tx||q.pause>0;
 const o={s:q.agneau?0.7:1.12,laine:f,t:Math.floor(now/400),couche:arret&&q.etat==='dodo',dort:arret&&q.etat==='dodo',broute:(q.etat==='broute'||q.etat==='boit')&&(arret||Math.floor(q.t/900)%2===0),pas:arret?0:(Math.floor(q.t/160)%2?1:-1)};
 pile.push({y:moH(qy),f:()=>{ctx.save();ctx.translate(X,Y);ctx.scale(MO_K,MO_K);MO_LIB.mouton(ctx,qx,qy,q.d,MO_LIB.PAL[q.k%8],o);ctx.restore();}});}
pile.push({y:moH(360),f:()=>ctx.drawImage(MO.img.dev,Math.round(X),Math.round(Y),W2,H2)});}
{const moMajPrec=majAction;
majAction=function(){if(moPres()){try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir'||b2.t==='metro'))return moMajPrec();}catch(x){}plaqueVrai=$('action');const t=moTexte();plaqueFeinte.classList.remove('inerte');plaqueFeinte.innerHTML=t[0]+'<small>'+t[1]+'</small>';plaqueFeinte.classList.add('on');return;}return moMajPrec();};
$('action').addEventListener('click',(ev)=>{if(moPres()){ev.stopImmediatePropagation();ev.preventDefault();moAction();}},true);}

/* =====================================================================
   LE BOULODROME — terrain en gravier clair bordé de bastaings, sous deux
   platanes, banc et ardoise. Plaque jaune : « Jouer à la pétanque » ouvre
   le mini-jeu contre Madeleine (partie en 13 points, 3 boules chacun).
   ===================================================================== */
const PT_OX=930, PT_OY=982, PT_K=0.75;
const ptW=(u)=>PT_OX+u*PT_K, ptH=(v)=>PT_OY+v*PT_K;
let PT={img:null};
function ptDansBoulodrome(x,y){if(!FERME_VIERGE)return false;
const u=(x-PT_OX)/PT_K, v=(y-PT_OY)/PT_K;
if(v>168&&v<182&&(Math.abs(u-110)<7||Math.abs(u-330)<7))return true;   /* les troncs */
if(v>168&&v<183&&u>194&&u<240)return true;                              /* le banc */
return v>170&&v<184&&u>258&&u<286;}                                      /* l'ardoise */
const ptPres=()=>FERME_VIERGE&&CARTE==='village'&&!BQ2.ouvert&&joueur.x>ptW(60)&&joueur.x<ptW(380)&&joueur.y>ptH(184)&&joueur.y<ptH(336);
const BQ_NAT_C={fr:{t:'v',c:['#1f3a93','#f4f4f4','#c8102e']},be:{t:'v',c:['#1a1a1a','#f4d02c','#c8102e']},it:{t:'v',c:['#248b48','#f4f4f4','#c8102e']},sn:{t:'v',c:['#248b48','#f4d02c','#c8102e']},
es:{t:'h',c:['#c8102e','#f4d02c','#f4d02c','#c8102e']},th:{t:'h',c:['#c8102e','#f4f4f4','#1f3a93','#1f3a93','#f4f4f4','#c8102e']},tn:{t:'tn'},mg:{t:'mg'}};
function bqMiniDrap(g,x,y,w,h,d){const F=BQ_NAT_C[d]||BQ_NAT_C.fr;
if(F.t==='tn'){g.fillStyle='#c8102e';g.fillRect(x,y,w,h);g.fillStyle='#fff';g.beginPath();g.arc(x+w/2,y+h/2,h*0.32,0,7);g.fill();g.fillStyle='#c8102e';g.beginPath();g.arc(x+w/2+h*0.06,y+h/2,h*0.17,0,7);g.fill();return;}
if(F.t==='mg'){g.fillStyle='#c8102e';g.fillRect(x,y,w,h/2);g.fillStyle='#248b48';g.fillRect(x,y+h/2,w,h/2);g.fillStyle='#f4f4f4';g.fillRect(x,y,w/3,h);return;}
const n=F.c.length;for(let i=0;i<n;i++){g.fillStyle=F.c[i];if(F.t==='v')g.fillRect(x+w*i/n,y,w/n+0.5,h);else g.fillRect(x,y+h*i/n,w,h/n+0.5);}}
const PT_LIB=(()=>{
function H(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
function vn(x,y,s,k){const X=Math.floor(x/s),Y=Math.floor(y/s),fx=x/s-X,fy=y/s-Y,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=H(X,Y,k),b=H(X+1,Y,k),c=H(X,Y+1,k),e2=H(X+1,Y+1,k);return a+(b-a)*u+(c-a)*v+(a-b-c+e2)*u*v;}
let G=null;const R=(x,y,w,h,c)=>{G.fillStyle=c;G.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const GRAV=['#d8ccb0','#e4d8bc','#c8bca0','#efe6d0'];
function gravier(g,x0,y0,x1,y1,k,traces){const w=x1-x0,h=y1-y0,im=g.createImageData(w,h),d=im.data;const P=GRAV.map(c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=H(x+x0,y+y0,k),c=P[n<.3?0:n<.7?1:n<.93?2:3],o=(vn(x,y,30,k+1)<.35&&H(x,y,k+2)<.25)?-14:0,i=(y*w+x)*4;d[i]=c[0]+o;d[i+1]=c[1]+o;d[i+2]=c[2]+o;d[i+3]=255;}
g.putImageData(im,x0,y0);
for(let i=0;i<w*h/40;i++){const x=x0+H(i,k,3)*w,y=y0+H(i,k,4)*h;g.fillStyle=H(i,k,5)<.5?'#fff8e8':'#8a7e6a';g.fillRect(x|0,y|0,H(i,k,6)<.3?2:1,1);}
if(traces)for(let i=0;i<9;i++){const x=x0+20+H(i,k,7)*(w-40),y=y0+10+H(i,k,8)*(h-20);g.fillStyle='rgba(80,60,30,.18)';g.beginPath();g.ellipse(x,y,5,2.4,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x-4,y-2,4,1);}}
function bastaings(g,x0,y0,x1,y1){const c=['#9a6a3e','#c8925a','#6a4428'];
R(x0-4,y0-4,x1-x0+8,3,c[1]);R(x0-4,y0-1,x1-x0+8,1,c[2]);
R(x0-4,y0-4,4,y1-y0+6,c[0]);R(x0-4,y0-4,1.5,y1-y0+6,c[1]);R(x1,y0-4,4,y1-y0+6,c[0]);R(x1+2.5,y0-4,1.5,y1-y0+6,c[1]);
R(x0-4,y1,x1-x0+8,3,c[1]);R(x0-4,y1+3,x1-x0+8,4,c[0]);R(x0-4,y1+7,x1-x0+8,1,c[2]);for(let x=x0;x<x1;x+=38)R(x,y1+3,1,4,c[2]);}
function ombre(g,x,y,s){g.fillStyle='rgba(20,40,10,.22)';g.beginPath();g.ellipse(x+6,y+2,46*s,14*s,0,0,7);g.fill();
for(let k=0;k<26;k++){g.fillStyle='rgba(20,40,10,.14)';g.beginPath();g.ellipse(x-40*s+H(k,x,1)*86*s,y-8*s+H(k,x,2)*20*s,4+H(k,1,x)*6,2,0,0,7);g.fill();}}
function platane(g,x,y,s){const tw=Math.round(9*s);for(let j=0;j<62*s;j++)for(let i=0;i<tw;i++){const n=vn(x+i,y-j,4,77);g.fillStyle=n<.35?'#8a8a6a':n<.6?'#b8b498':n<.8?'#d8d4c0':'#6a6e54';g.fillRect(x-tw/2+i,y-j,1,1);}
g.lineCap='round';for(const [a,b] of [[-1,-48],[1,-52]]){g.strokeStyle='#9a9a80';g.lineWidth=4*s;g.beginPath();g.moveTo(x,y+b*s+8);g.lineTo(x+a*20*s,y+(b-22)*s);g.stroke();}g.lineCap='butt';
const pal=['#3e6a2a','#4f8236','#64983f','#7fb050','#9cc664'];
for(let k=0;k<70;k++){const a=H(k,x,3)*6.28,r=Math.sqrt(H(k,x,4))*44*s,cx=x+Math.cos(a)*r*1.2,cy=y-78*s+Math.sin(a)*r*0.62,rr=(7+H(k,x,5)*7)*s;g.fillStyle=pal[Math.min(4,(k/16)|0)];g.beginPath();g.arc(cx,cy-(k>40?3:0),rr,0,7);g.fill();}
for(let k=0;k<26;k++){g.fillStyle='rgba(255,255,220,.25)';g.beginPath();g.arc(x-20*s+H(k,2,x)*40*s,y-104*s+H(k,3,x)*20*s,3*s,0,7);g.fill();}}
function boule(g,x,y,r,t,sansOmbre){if(!sansOmbre){g.fillStyle='rgba(20,15,5,.35)';g.beginPath();g.ellipse(x+r*0.25,y+r*0.85,r*1.05,r*0.38,0,0,7);g.fill();}
const c=t===1?['#fff4dc','#c89a5a','#5a3818']:['#ffffff','#9aa2ac','#2e3238'];const gr=g.createRadialGradient(x-r*0.4,y-r*0.45,r*0.08,x,y,r);gr.addColorStop(0,c[0]);gr.addColorStop(.45,c[1]);gr.addColorStop(1,c[2]);g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
g.strokeStyle='rgba(30,30,30,.45)';g.lineWidth=Math.max(0.5,r*0.09);for(const o of [-0.35,0.35]){g.beginPath();g.ellipse(x,y+o*r,r*0.93*Math.sqrt(1-o*o),r*0.18,0,0,Math.PI);g.stroke();}
g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(x-r*0.38,y-r*0.42,r*0.22,r*0.14,-0.6,0,7);g.fill();}
function cochonnet(g,x,y,r){g.fillStyle='rgba(20,15,5,.3)';g.beginPath();g.ellipse(x+r*0.2,y+r*0.8,r,r*0.4,0,0,7);g.fill();const gr=g.createRadialGradient(x-r*0.4,y-r*0.4,0.2,x,y,r);gr.addColorStop(0,'#ffe4a0');gr.addColorStop(.5,'#f0a030');gr.addColorStop(1,'#a85a10');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.fillRect(x-r*0.5,y-r*0.55,Math.max(1,r*0.35),Math.max(1,r*0.25));}
function banc(g,x,y){g.fillStyle='rgba(20,40,10,.25)';g.fillRect(x-2,y,40,3);R(x,y-12,2,12,'#2a2a2a');R(x+34,y-12,2,12,'#2a2a2a');R(x-2,y-13,40,3,'#9a6a3e');R(x-2,y-13,40,1,'#c8925a');R(x-2,y-9,40,2,'#8a5a30');R(x,y-22,2,10,'#2a2a2a');R(x+34,y-22,2,10,'#2a2a2a');R(x-2,y-22,40,3,'#9a6a3e');R(x-2,y-18,40,3,'#9a6a3e');R(x-2,y-22,40,1,'#c8925a');}
function ardoise(g,x,y,txt){R(x-1,y-30,2,30,'#6a4428');R(x+19,y-30,2,30,'#6a4428');R(x-2,y-30,24,18,'#7a5232');R(x,y-28,20,14,'#2e3430');g.fillStyle='#f0f0e8';g.font='bold 7px sans-serif';g.textAlign='center';g.fillText(txt||'13',x+10,y-18);g.textAlign='left';}
function fanions(g){const pts=[];for(let k=0;k<=24;k++){const t=k/24;pts.push([118+(322-118)*t,104+Math.sin(Math.PI*t)*16]);}
g.strokeStyle='#3a3a3a';g.lineWidth=0.7;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
const N=['fr','it','es','be','sn','th','tn','mg'];for(let k=1;k<24;k+=2){const [x,y]=pts[k];g.save();g.beginPath();g.moveTo(x-4,y);g.lineTo(x+4,y);g.lineTo(x,y+9);g.closePath();g.clip();bqMiniDrap(g,x-4,y,8,9,N[(k>>1)%8]);g.restore();}
const bx=176,by=128,bw=88,bh=17;g.strokeStyle='#3a3a3a';g.lineWidth=0.6;g.beginPath();g.moveTo(bx+4,by);g.lineTo(pts[10][0],pts[10][1]);g.moveTo(bx+bw-4,by);g.lineTo(pts[14][0],pts[14][1]);g.stroke();
g.fillStyle='#12285a';g.fillRect(bx,by,bw,bh);g.fillStyle='#f2c14e';g.fillRect(bx,by,bw,1.5);g.fillRect(bx,by+bh-1.5,bw,1.5);g.font='bold 7.5px sans-serif';g.textAlign='center';g.fillStyle='#ffffff';g.fillText('MONDIAL DE PÉTANQUE',bx+bw/2,by+11.5);g.textAlign='left';}
function calques(txt){const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const W=420,HH=340,fond=mk(W,HH),a1=mk(W,HH),a2=mk(W,HH),mob=mk(W,HH);
{const g=fond.getContext('2d');G=g;ombre(g,110,178,1);ombre(g,330,178,1.05);gravier(g,70,190,370,300,11,1);bastaings(g,70,190,370,300);
cochonnet(g,300,236,1.8);boule(g,288,240,4,0);boule(g,306,230,4,0);boule(g,279,250,4,1);boule(g,312,244,4,1);}
{const g=a1.getContext('2d');G=g;platane(g,110,178,1);}
{const g=a2.getContext('2d');G=g;platane(g,330,178,1.05);}
{const g=mob.getContext('2d');G=g;banc(g,200,180);ardoise(g,262,182,txt);}
const fan=mk(W,HH);{const g=fan.getContext('2d');G=g;fanions(g);}
return {fond,a1,a2,mob,fan};}
function texture(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');gravier(g,0,0,w,h,51,0);
for(let i=0;i<14;i++){const x=6+H(i,5,8)*(w-12),y=6+H(i,6,8)*(h-12);g.fillStyle='rgba(80,60,30,.16)';g.beginPath();g.ellipse(x,y,3,1.4,0,0,7);g.fill();}return c;}
return {calques,boule,cochonnet,texture};})();
function ptDessiner(ctx,camX,camY,pile){if(!FERME_VIERGE||CARTE!=='village')return;
const X=ptW(0)-camX, Y=ptH(0)-camY;if(X>VW+40||X+320<-40||Y>VH+40||Y+260<-60)return;
if(!PT.img)PT.img=PT_LIB.calques(BQ2.score?BQ2.score[0]+'-'+BQ2.score[1]:'13');
const W2=420*PT_K, H2=340*PT_K, d=(c)=>()=>ctx.drawImage(c,Math.round(X),Math.round(Y),W2,H2);
ctx.drawImage(PT.img.fond,Math.round(X),Math.round(Y),W2,H2);
pile.push({y:ptH(178),f:d(PT.img.a1)});pile.push({y:ptH(178),f:d(PT.img.a2)});pile.push({y:ptH(181),f:d(PT.img.mob)});pile.push({y:ptH(179),f:d(PT.img.fan)});}

/* ---------------- LE BOULODROME : le menu, le Mondial, la partie ----------------
   On garde tout ce que l'ancienne pétanque avait construit (le Mondial à
   huit, les boulistes et leurs traits, le palmarès au serveur, le chèque
   du titre, les boules et les terrains qui se débloquent) et on le joue
   avec la nouvelle partie : cochonnet lancé, quatre gestes, vraies
   règles. Chaque terrain roule autrement. La difficulté monte avec le
   tour (quarts, demies, finale) et avec chaque titre déjà gagné. */
let BQ2={ouvert:false};
try{SONS.clac={f:(t)=>{const v=V.gestes;note(t,2600,0.07,0.1*v,'triangle',1900,0.3);note(t+0.002,3900,0.05,0.05*v,'sine',3200,0.3);}};
SONS.pose={f:(t)=>{const v=V.gestes;souffle(t,0.09,520,220,1,0.13*v,'lowpass',0.5);}};}catch(x){}
const PB_GESTES={roulette:{f:0.3,h:0.05,s:0.2,nom:'Roulette'},demi:{f:0.62,h:0.2,s:0.34,nom:'Demi-portée'},plombee:{f:0.9,h:0.42,s:0.55,nom:'Plombée'},tir:{f:1,h:0.09,s:0.34,nom:'Tirer'}};
/* CE QUE CHAQUE TERRAIN FAIT À LA BOULE */
const PB_SOLS={port:{fric:1,dev:1,dit:'Gravier : le terrain de tous les jours'},place:{fric:0.85,dev:0.6,dit:'Terre battue : ça roule un peu plus'},platanes:{fric:1.25,dev:1.3,dit:'Sable : ça freine'},champ:{fric:0.8,dev:0,dit:'Gravier fin et plat : ça file droit'},nuit:{fric:1,dev:1.1,dit:'Gravier, sous les guirlandes'}};
const BQ_PAL={port:['#b4ae9f','#cbc4b4','#a39b8b','#d9d3c4','#958d7e'],place:['#c4825a','#d0926a','#b2724c','#daa076','#a46440'],platanes:['#d6b880','#e2c690','#c6a670','#ead09e','#b49460'],champ:['#e6dabc','#eadfc4','#e0d4b6','#ede4cc'],nuit:['#b4ae9f','#cbc4b4','#a39b8b','#d9d3c4','#958d7e']};
const MADELEINE={nom:'Madeleine',d:'fr',point:.56,tir:.35,sang:.6,mot:'On joue pour le plaisir, hein ? Enfin… surtout pour gagner.'};
const bqCpt=(k)=>{try{return +(localStorage.getItem(k)||0);}catch(x){return 0;}};
const bqInc=(k)=>{try{localStorage.setItem(k,bqCpt(k)+1);}catch(x){}};
const bqDrap=(d,gr)=>'<span class="dr '+d+(gr?' gr':'')+'"></span>';
function bqCss(){if($('cssPq'))return;const s=document.createElement('style');s.id='cssPq';s.textContent=`
@font-face{font-family:'Lilita One';src:url(assets/fonts/lilita-one-latin-400-normal.woff2) format('woff2');font-display:swap}
#boulo{position:fixed;inset:0;z-index:9000;background:#d8ccb0;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;font-family:'Baloo 2',sans-serif}
#boulo canvas.jeu{position:absolute;inset:0;width:100%;height:100%}
#boulo .sc{position:absolute;top:calc(12px + env(safe-area-inset-top));left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:6px;padding:7px 12px;border-radius:18px;background:linear-gradient(#fff6dc,#f3e2b4);border:3px solid #7a5232;box-shadow:0 4px 0 #5a3a20;font:400 17px 'Lilita One',sans-serif;color:#4a2e18}
#boulo .sc>div{display:flex;align-items:center;gap:6px;min-width:0}#boulo .sc .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px}
#boulo .sc b{font:400 28px 'Lilita One',sans-serif;color:#c8541e}#boulo .sc i{font-style:normal;font:800 10.5px 'Baloo 2',sans-serif;color:#8a6a48;display:block;text-align:center;letter-spacing:1px;line-height:1.2}
#boulo .x{position:absolute;top:calc(74px + env(safe-area-inset-top));right:12px;width:40px;height:40px;border:0;border-radius:12px;background:#e8503a;box-shadow:0 0 0 3px #fff,0 4px 0 3px #8a2a1a;color:#fff;font:400 20px 'Lilita One',sans-serif;z-index:3}
#boulo .pill{position:absolute;top:calc(80px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(30,20,10,.7);color:#fff;font:800 13px 'Baloo 2',sans-serif;padding:6px 14px;border-radius:20px;white-space:nowrap;max-width:calc(100% - 130px);overflow:hidden;text-overflow:ellipsis}
#boulo .mes{position:absolute;top:calc(114px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);font:800 12px 'Baloo 2',sans-serif;color:#5a3a20;white-space:nowrap;background:rgba(255,248,230,.78);padding:2px 10px;border-radius:12px}
#boulo .mes:empty{display:none}
#boulo .pill:empty{display:none}
#boulo .bt{position:absolute;bottom:calc(16px + env(safe-area-inset-bottom));left:16px;right:16px;height:60px;border:0;border-radius:18px;background:linear-gradient(#ffd75a,#f0b428);box-shadow:0 5px 0 #b07a10;font:400 25px 'Lilita One',sans-serif;color:#5a3608;display:none}
#boulo .bt.on{display:block}
#boulo .gs{position:absolute;bottom:calc(16px + env(safe-area-inset-bottom));left:10px;right:10px;display:flex;gap:6px}
#boulo .gs.off{display:none}
#boulo .gs button{flex:1;min-width:0;height:56px;border:0;border-radius:14px;background:#fff3d6;box-shadow:0 4px 0 #b89a6a;color:#5a3a20;font:400 15px/1 'Lilita One',sans-serif;padding:0 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
#boulo .gs button svg{width:30px;height:16px}
#boulo .gs button.on{background:linear-gradient(#ffd75a,#f0b428);box-shadow:0 4px 0 #b07a10;color:#4a2a04}
#boulo .gs button.tir.on{background:linear-gradient(#ff8a6a,#e8503a);box-shadow:0 4px 0 #8a2a1a;color:#fff}
#boulo .gs.grise button{opacity:.45}
#boulo .gs button small{font:800 9.5px 'Baloo 2',sans-serif;opacity:.75;white-space:nowrap}
#boulo .gs button{height:62px;gap:2px}
#boulo .go{position:absolute;bottom:calc(88px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(320px,calc(100% - 40px));height:48px;border:0;border-radius:16px;background:linear-gradient(#8ee07a,#4fb83e);box-shadow:0 5px 0 #2f7a22;font:400 23px 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:4px #2f6a1e;paint-order:stroke;display:none}
#boulo .go.on{display:block}
#boulo .aide{position:absolute;bottom:calc(144px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);max-width:calc(100% - 24px);text-align:center;font:800 12.5px 'Baloo 2',sans-serif;color:#fff;background:rgba(30,20,10,.62);padding:4px 12px;border-radius:12px;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#boulo .aide:empty{display:none}
#boulo .sol{position:absolute;bottom:calc(80px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);white-space:nowrap;font:800 11px 'Baloo 2',sans-serif;color:#fff;background:rgba(30,20,10,.55);padding:3px 9px;border-radius:10px;pointer-events:none;display:none}
/* LES MENUS */
#boulo .menu{position:absolute;inset:0;overflow-y:auto;touch-action:pan-y;background:linear-gradient(#8fc6e8 0,#cfe6d0 180px,#e9dcbc 181px,#e2d2ae 100%);padding:calc(12px + env(safe-area-inset-top)) 14px calc(24px + env(safe-area-inset-bottom));z-index:2}
#boulo .menu:empty{display:none}
#boulo .tete{display:flex;align-items:center;gap:10px;margin-bottom:14px}
#boulo .tete h2{flex:1;font:400 30px/1 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:6px #5a3a20;paint-order:stroke;letter-spacing:.5px}
#boulo .tete h2 small{display:block;font:400 13px 'Lilita One',sans-serif;color:#ffe066;-webkit-text-stroke:3px #5a3a20;letter-spacing:1px;margin-bottom:3px}
#boulo .tete .x,#boulo .tete .rt{position:static;flex:none}
#boulo .rt{width:40px;height:40px;border:0;border-radius:12px;background:#fff3d6;box-shadow:0 0 0 3px #7a5232,0 4px 0 3px #5a3a20;color:#5a3a20;font:400 22px 'Lilita One',sans-serif}
#boulo .carte{position:relative;background:linear-gradient(#fff8e6,#f5e6c2);border:3px solid #7a5232;border-radius:20px;box-shadow:0 5px 0 #5a3a20;padding:14px;margin-bottom:14px;color:#4a2e18}
#boulo .carte.or{background:linear-gradient(160deg,#fff4c8,#f6d77a 70%,#eec25a);}
#boulo .carte h3{font:400 24px/1.05 'Lilita One',sans-serif;color:#4a2e18;margin-bottom:4px}
#boulo .carte .rib{display:inline-block;font:400 12px 'Lilita One',sans-serif;letter-spacing:1px;color:#fff;background:#c8541e;border-radius:8px;padding:3px 9px;margin-bottom:8px}
#boulo .carte p{font:700 14px/1.35 'Baloo 2',sans-serif;color:#6a4a2c}
#boulo .gros{display:block;width:100%;height:58px;margin-top:12px;border:0;border-radius:16px;background:linear-gradient(#ffd75a,#f0b428);box-shadow:0 5px 0 #b07a10;font:400 24px 'Lilita One',sans-serif;color:#5a3608}
#boulo .gros.vert{background:linear-gradient(#8ee07a,#4fb83e);box-shadow:0 5px 0 #2f7a22;color:#fff;-webkit-text-stroke:4px #2f6a1e;paint-order:stroke}
#boulo .gros:disabled{opacity:.5}
#boulo .tuiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
#boulo .lic{background:linear-gradient(160deg,#fffaf0,#f4e6c4);border:3px solid #7a5232;border-radius:18px;box-shadow:0 5px 0 #5a3a20;margin-bottom:14px;overflow:hidden;color:#4a2e18}
#boulo .lic .lh{background:linear-gradient(90deg,#12285a,#1d3d7a);color:#fff;font:400 15px 'Lilita One',sans-serif;padding:8px 12px;letter-spacing:.5px;border-bottom:3px solid #f2c14e}
#boulo .lic .lh small{display:block;font:800 10px 'Baloo 2',sans-serif;color:#f2c14e;letter-spacing:1px}
#boulo .lic .lb{display:flex;gap:12px;padding:12px;align-items:center}
#boulo .lic canvas{width:96px;height:120px;flex:none;background:radial-gradient(circle at 50% 40%,#fff,#e8dcc0);border-radius:12px;border:2px solid #c8a878;image-rendering:pixelated}
#boulo .lic .li{min-width:0}#boulo .lic .li b{display:block;font:400 24px 'Lilita One',sans-serif;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#boulo .lic .cat{display:inline-block;color:#fff;font:400 12px 'Lilita One',sans-serif;letter-spacing:1px;padding:2px 10px;border-radius:8px;margin-bottom:6px}
#boulo .lic .lm{font:800 12px/1.5 'Baloo 2',sans-serif;color:#6a4a2c;display:flex;align-items:center;gap:5px}
#boulo .lic .lm .dr{width:18px;height:12px;border-width:1px}
#boulo .gros4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;font:800 10.5px 'Baloo 2',sans-serif;color:#8a6a48}
#boulo .gros4 b{display:block;font:400 22px 'Lilita One',sans-serif;color:#c8541e}
#boulo .fl{display:flex;align-items:center;gap:8px;font:400 15px 'Lilita One',sans-serif;margin-top:8px}
#boulo .fl span{width:56px}#boulo .fl i{flex:1;height:12px;background:#e8d8b4;border-radius:6px;overflow:hidden}#boulo .fl i u{display:block;height:100%;background:linear-gradient(90deg,#8ee07a,#4fb83e)}#boulo .fl b{width:44px;text-align:right;color:#c8541e}
#boulo .tuile{border:3px solid #7a5232;border-radius:16px;background:#fff8e6;box-shadow:0 4px 0 #5a3a20;padding:10px 4px 8px;text-align:center;font:400 15px/1.1 'Lilita One',sans-serif;color:#4a2e18}
#boulo .tuile canvas{display:block;margin:0 auto 6px;width:44px;height:44px}
#boulo .tuile small{display:block;font:800 10.5px 'Baloo 2',sans-serif;color:#8a6a48;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#boulo .stats{display:flex;justify-content:space-around;font:400 15px 'Lilita One',sans-serif;color:#5a3a20;background:rgba(255,248,230,.7);border-radius:14px;padding:8px}
#boulo .stats b{display:block;font:400 24px 'Lilita One',sans-serif;color:#c8541e;text-align:center}
#boulo .dr{display:inline-block;width:26px;height:17px;border-radius:3px;flex:none;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);vertical-align:middle}
#boulo .dr.gr{width:46px;height:31px}
#boulo .dr.fr{background:linear-gradient(90deg,#1f3a93 0 33.3%,#f4f4f4 33.3% 66.6%,#c8102e 66.6%)}
#boulo .dr.be{background:linear-gradient(90deg,#1a1a1a 0 33.3%,#f4d02c 33.3% 66.6%,#c8102e 66.6%)}
#boulo .dr.it{background:linear-gradient(90deg,#248b48 0 33.3%,#f4f4f4 33.3% 66.6%,#c8102e 66.6%)}
#boulo .dr.sn{background:linear-gradient(90deg,#248b48 0 33.3%,#f4d02c 33.3% 66.6%,#c8102e 66.6%)}
#boulo .dr.mg{background:linear-gradient(90deg,#f4f4f4 0 33.3%,transparent 33.3%),linear-gradient(180deg,#c8102e 0 50%,#248b48 50%)}
#boulo .dr.th{background:linear-gradient(180deg,#c8102e 0 16.6%,#f4f4f4 16.6% 33.3%,#1f3a93 33.3% 66.6%,#f4f4f4 66.6% 83.3%,#c8102e 83.3%)}
#boulo .dr.tn{background:radial-gradient(circle at 56% 50%,#c8102e 0 24%,transparent 24%),radial-gradient(circle at 50% 50%,#f4f4f4 0 33%,#c8102e 33%)}
#boulo .dr.es{background:linear-gradient(180deg,#c8102e 0 25%,#f4d02c 25% 75%,#c8102e 75%)}
#boulo .adv{display:flex;align-items:center;gap:10px;margin:6px 0 2px;font:400 19px 'Lilita One',sans-serif}
#boulo .tab{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;align-items:center}
#boulo .tab .col{display:flex;flex-direction:column;justify-content:space-around;gap:6px;height:100%}
#boulo .tab .col h4{font:400 12px 'Lilita One',sans-serif;color:#8a6a48;text-align:center;letter-spacing:1px}
#boulo .tab .j{display:flex;align-items:center;gap:5px;background:#fff8e6;border:2px solid #c8a878;border-radius:9px;padding:4px 5px;font:400 13px 'Lilita One',sans-serif;color:#4a2e18;white-space:nowrap;overflow:hidden}
#boulo .tab .j .dr{width:18px;height:12px;border-width:1px}
#boulo .tab .j.moi{background:#ffe27a;border-color:#c8541e}#boulo .tab .j.out{opacity:.4;text-decoration:line-through}#boulo .tab .j.vide{opacity:.35;justify-content:center}
#boulo .vs{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;text-align:center}
#boulo .vs .c{background:#fff8e6;border:3px solid #7a5232;border-radius:16px;padding:10px 6px;box-shadow:0 4px 0 #5a3a20}
#boulo .vs .c b{display:block;font:400 20px 'Lilita One',sans-serif;margin-top:6px}
#boulo .vs .v{font:400 34px 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:6px #c8541e;paint-order:stroke}
#boulo .barre{display:flex;align-items:center;gap:6px;font:800 11px 'Baloo 2',sans-serif;color:#8a6a48;margin-top:5px;text-align:left}
#boulo .barre span{flex:none;width:58px}#boulo .barre i{flex:1;height:8px;border-radius:5px;background:#e8d8b4;overflow:hidden}#boulo .barre i u{display:block;height:100%;background:linear-gradient(90deg,#f0b428,#e8503a)}
#boulo .mot{font:italic 700 14px 'Baloo 2',sans-serif;color:#6a4a2c;text-align:center;margin:12px 6px 0}
#boulo .grille{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#boulo .item{border:3px solid #c8a878;border-radius:16px;background:#fff8e6;padding:10px;text-align:center;color:#4a2e18}
#boulo .item.sel{border-color:#c8541e;background:#fff0c0;box-shadow:0 0 0 3px #ffd75a}
#boulo .item.lock{opacity:.6}
#boulo .item canvas{display:block;margin:0 auto 6px;border-radius:10px}
#boulo .item b{display:block;font:400 16px/1.1 'Lilita One',sans-serif}#boulo .item small{display:block;font:800 11px/1.3 'Baloo 2',sans-serif;color:#8a6a48;margin-top:3px}
#boulo .item em{display:block;font-style:normal;font:400 13px 'Lilita One',sans-serif;color:#c8541e;margin-top:4px}
#boulo .lig{display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:2px dashed #e0cca4;font:400 16px 'Lilita One',sans-serif}
#boulo .lig i{font-style:normal;width:30px;flex:none;text-align:center;color:#8a6a48;font-size:18px}#boulo .lig .dr{flex:none;width:30px;height:20px;border-radius:4px}#boulo .lig .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#boulo .lig u{flex:none;text-decoration:none;color:#c8541e;background:rgba(242,193,78,.18);border-radius:10px;padding:2px 9px;font-size:15px}#boulo .menu.mo .lig u{color:#ffd75a}
#boulo .lig em{display:block;font-style:normal;font:800 10.5px 'Baloo 2',sans-serif;color:#9ab0e0;letter-spacing:.5px}
#boulo .lig.moi{background:#fff0c0;border-radius:10px}
#boulo .res{text-align:center;padding-top:30px}
#boulo .res h2{font:400 44px/1 'Lilita One',sans-serif;color:#fff;-webkit-text-stroke:8px #5a3a20;paint-order:stroke;margin:10px 0}
#boulo .res .sco{font:400 30px 'Lilita One',sans-serif;color:#5a3a20}
#boulo .sc .dr{width:22px;height:15px}
#boulo .sc.tv{background:linear-gradient(#1d3d7a,#0e2350);border:3px solid #f2c14e;box-shadow:0 4px 0 #8a6a1a,0 8px 20px rgba(0,0,0,.4);color:#fff}
#boulo .sc.tv b{color:#ffd75a}#boulo .sc.tv i{color:#bcd0ff}
#boulo.stade .pill{background:linear-gradient(90deg,#f2c14e 0 6px,rgba(14,35,80,.92) 6px);border-radius:8px;padding-left:16px}
#boulo .menu.mo{background:radial-gradient(ellipse 60% 40% at 15% -5%,rgba(255,236,170,.45),transparent 70%),radial-gradient(ellipse 60% 40% at 85% -5%,rgba(255,236,170,.45),transparent 70%),linear-gradient(#0a1838,#13306a 55%,#0d2048)}
#boulo .menu.mo::after{content:'';position:fixed;left:0;right:0;bottom:0;height:90px;pointer-events:none;z-index:-1;
background:radial-gradient(circle at 9px 14px,#08122c 6px,transparent 7px) 0 18px/18px 30px repeat-x,radial-gradient(circle at 18px 14px,#0a1636 6px,transparent 7px) 0 44px/18px 30px repeat-x,linear-gradient(transparent 26px,#08122c 26px)}
#boulo .menu.mo .tete h2{-webkit-text-stroke-color:#0a1838}
#boulo .menu.mo .tete h2 small{color:#f2c14e;-webkit-text-stroke-color:#0a1838}
#boulo .menu.mo .rt{background:#1d3d7a;color:#fff;box-shadow:0 0 0 3px #f2c14e,0 4px 0 3px #8a6a1a}
#boulo .carte.mo,#boulo .menu.mo .carte,#boulo .menu.mo .vs .c{background:linear-gradient(#1d3d7a,#122a5c);border-color:#f2c14e;box-shadow:0 5px 0 #8a6a1a,0 10px 24px rgba(0,0,0,.35);color:#fff}
#boulo .carte.mo h3,#boulo .menu.mo .carte h3{color:#fff}#boulo .carte.mo p,#boulo .menu.mo .carte p{color:#cfe0ff}
#boulo .carte.mo .rib,#boulo .menu.mo .rib{background:#f2c14e;color:#12285a}
#boulo .carte.mo .adv small{color:#bcd0ff!important}
#boulo .carte.mo .coupe{position:absolute;right:10px;top:8px;font-size:46px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))}
#boulo .menu.mo .tab .col h4{color:#f2c14e}
#boulo .menu.mo .tab .j{background:#0e2350;border-color:#3a5a9a;color:#fff}
#boulo .menu.mo .tab .j.moi{background:#f2c14e;border-color:#fff;color:#12285a}
#boulo .menu.mo .vs .c b{color:#fff}#boulo .menu.mo .vs .c small{color:#bcd0ff!important}
#boulo .menu.mo .vs .v{-webkit-text-stroke-color:#d8402a}
#boulo .menu.mo .barre{color:#bcd0ff}#boulo .menu.mo .barre i{background:#0a1838}
#boulo .menu.mo .mot{color:#e8eeff}
#boulo .menu.mo .res .sco{color:#ffd75a}
#boulo .menu.mo .res h2{-webkit-text-stroke-color:#0a1838}
#boulo .menu.mo .lig{border-bottom-color:#2a4a8a;color:#fff}#boulo .menu.mo .lig i{color:#bcd0ff}#boulo .menu.mo .lig.moi{background:linear-gradient(90deg,rgba(242,193,78,.45),rgba(242,193,78,.15));box-shadow:inset 0 0 0 2px #f2c14e;border-radius:12px}
#boulo .menu.mo p[style]{color:#e8eeff!important}`;document.head.appendChild(s);}
const PB_ICO={roulette:'<svg viewBox="0 0 30 16"><path d="M2 12 Q15 9 28 12" stroke="currentColor" stroke-width="2.4" fill="none" stroke-dasharray="2 3"/><circle cx="25" cy="10" r="3.4" fill="currentColor"/></svg>',
demi:'<svg viewBox="0 0 30 16"><path d="M2 13 Q10 1 19 13 L28 13" stroke="currentColor" stroke-width="2.4" fill="none" stroke-dasharray="2 3"/><circle cx="26" cy="11" r="3.4" fill="currentColor"/></svg>',
plombee:'<svg viewBox="0 0 30 16"><path d="M2 14 Q14 -8 24 13" stroke="currentColor" stroke-width="2.4" fill="none" stroke-dasharray="2 3"/><circle cx="24" cy="11" r="3.4" fill="currentColor"/></svg>',
tir:'<svg viewBox="0 0 30 16"><circle cx="20" cy="8" r="6" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M20 0v5M20 11v5M12 8h5M23 8h5" stroke="currentColor" stroke-width="2.2"/><path d="M2 8h8" stroke="currentColor" stroke-width="2.4" stroke-dasharray="2 2"/></svg>'};
/* ---- dessin : boule aux couleurs de la vitrine, et sable de chaque terrain ---- */
const BQ_ADV={a:'#a8743c',b:'#f4dcb0',o:'#5a3818',stries:1};
function bqBoule(g,x,y,r,c,sansOmbre){c=c||{a:'#8f989f',b:'#ffffff',o:'#2e3238',stries:1};
if(!sansOmbre){g.fillStyle='rgba(20,15,5,.35)';g.beginPath();g.ellipse(x+r*0.25,y+r*0.85,r*1.05,r*0.38,0,0,7);g.fill();}
const gr=g.createRadialGradient(x-r*0.4,y-r*0.45,r*0.08,x,y,r);gr.addColorStop(0,c.b);gr.addColorStop(.48,c.a);gr.addColorStop(1,c.o);g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
const n=c.stries||0;if(n){g.strokeStyle='rgba(20,20,20,.42)';g.lineWidth=Math.max(0.5,r*0.08);const L=n===1?[-0.35,0.35]:n===2?[-0.5,0,0.5]:[-0.55,-0.2,0.2,0.55];for(const o of L){g.beginPath();g.ellipse(x,y+o*r,r*0.95*Math.sqrt(1-o*o),r*0.17,0,0,Math.PI);g.stroke();}}
if(c.laiton){g.strokeStyle='rgba(230,190,90,.9)';g.lineWidth=Math.max(1,r*0.12);g.beginPath();g.ellipse(x,y,r*0.95,r*0.2,0,0,Math.PI);g.stroke();}
g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(x-r*0.38,y-r*0.42,r*0.22,r*0.14,-0.6,0,7);g.fill();}
function bqHh(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
function bqTexture(w,h,T){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data;
const P=(BQ_PAL[T.c]||T.grain).map(c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=bqHh(x,y,51),c2=P[Math.min(P.length-1,(n*P.length)|0)],i=(y*w+x)*4,o=(bqHh(x>>3,y>>3,52)-.5)*16;d[i]=c2[0]+o;d[i+1]=c2[1]+o;d[i+2]=c2[2]+o;d[i+3]=255;}
g.putImageData(im,0,0);
for(let i=0;i<w*h/38;i++){const x=bqHh(i,3,53)*w,y=bqHh(i,4,53)*h;g.fillStyle=bqHh(i,5,53)<.5?'rgba(255,250,235,.7)':'rgba(70,55,35,.45)';g.fillRect(x|0,y|0,bqHh(i,6,53)<.3?2:1,1);}
for(let i=0;i<16;i++){const x=6+bqHh(i,5,8)*(w-12),y=6+bqHh(i,6,8)*(h-12);g.fillStyle='rgba(80,60,30,.16)';g.beginPath();g.ellipse(x,y,3,1.4,0,0,7);g.fill();}
if(T.c==='platanes')for(let i=0;i<46;i++){g.fillStyle='rgba(30,50,20,.16)';g.beginPath();g.ellipse(bqHh(i,7,9)*w,bqHh(i,8,9)*h,6+bqHh(i,9,9)*14,3+bqHh(i,1,9)*7,0,0,7);g.fill();}
if(T.c==='place')for(let i=0;i<w*h/220;i++){g.fillStyle='rgba(150,80,40,.10)';g.fillRect(bqHh(i,2,7)*w|0,bqHh(i,3,7)*h|0,3,1);}
return c;}
/* ---- ouvrir, fermer ---- */
function bqOuvrir(){bqCss();const d=document.createElement('div');d.id='boulo';
d.innerHTML='<canvas class="jeu"></canvas><div class="sc" id="bqSc"><div><span id="bqDA"></span><span class="nm">TOI</span> <b id="bqA">0</b></div><div><i id="bqM">MÈNE 1<br>EN 13</i></div><div><b id="bqB">0</b> <span class="nm" id="bqN">MADELEINE</span><span id="bqDB"></span></div></div><button class="x" id="boX">✕</button><div class="pill" id="bqP"></div><div class="mes" id="bqMes"></div><div class="aide" id="bqAide"></div><div class="sol" id="bqSol"></div>'
+'<div class="gs" id="bqGs">'+['roulette','demi','plombee','tir'].map(k=>'<button data-g="'+k+'" class="'+k+'">'+PB_ICO[k]+PB_GESTES[k].nom+'<small></small></button>').join('')+'</div><button class="go" id="bqGo">Lancer ▶</button><button class="bt" id="bqBt"></button><div class="menu" id="bqMenu"></div>';
document.body.appendChild(d);BQ2={ouvert:true,el:d,cv:d.querySelector('canvas.jeu'),score:[0,0],mene:0,prem:0,anim:0,geste:'demi',ann:null,phase:'menu',confettis:[]};
const stop=ev=>{ev.stopPropagation();};['touchstart','touchmove','touchend','pointerdown','pointermove','pointerup','mousedown','click'].forEach(k=>d.addEventListener(k,stop));
$('boX').addEventListener('click',bqQuitterPartie);$('bqGo').addEventListener('click',bqGo);$('bqBt').addEventListener('click',()=>{vibrer(10);if(BQ2.fin)bqPartie(false);else bqMene();});
d.querySelectorAll('#bqGs button').forEach(b=>b.addEventListener('click',()=>{if(BQ2.phase!=='vise')return;BQ2.geste=b.dataset.g;vibrer(6);bqGestes();}));
d.addEventListener('touchstart',ev=>{if(ev.target.closest('button,.menu'))return;ev.preventDefault();const t=ev.changedTouches[0];bqDoigt('d',t.clientX,t.clientY,t.identifier);},{passive:false});
d.addEventListener('touchmove',ev=>{if(ev.target.closest('.menu'))return;ev.preventDefault();for(const t of ev.changedTouches)bqDoigt('m',t.clientX,t.clientY,t.identifier);},{passive:false});
d.addEventListener('touchend',ev=>{for(const t of ev.changedTouches)bqDoigt('f',t.clientX,t.clientY,t.identifier);});
d.addEventListener('touchcancel',()=>{BQ2.drag=null;});
d.addEventListener('mousedown',ev=>{if(ev.target.closest('button,.menu'))return;bqDoigt('d',ev.clientX,ev.clientY,'m');const mv=e2=>bqDoigt('m',e2.clientX,e2.clientY,'m'),up=e2=>{bqDoigt('f',e2.clientX,e2.clientY,'m');removeEventListener('mousemove',mv);removeEventListener('mouseup',up);};addEventListener('mousemove',mv);addEventListener('mouseup',up);});
bqTaille();addEventListener('resize',bqTaille);try{plaqueFeinte.classList.remove('on');}catch(x){}bqAccueil();BQ2.anim=requestAnimationFrame(bqBoucle);}
function bqFermer(){if(!BQ2.ouvert)return;cancelAnimationFrame(BQ2.anim);removeEventListener('resize',bqTaille);BQ2.el.remove();const s=BQ2.score;BQ2={ouvert:false,score:s};PT.img=null;try{majAction();}catch(x){}}
/* PARTIR EN PLEIN MONDIAL, C'EST ABANDONNER : on le dit, on demande de confirmer */
function bqQuitterPartie(){vibrer(8);if(BQ2.phase==='menu')return bqFermer();
if(BQ2.mondial&&!BQ2.fin){if(!BQ2.abandon||Date.now()-BQ2.abandon>2500){BQ2.abandon=Date.now();bqPill('Touche encore ✕ : tu abandonnes le match');return;}
 const tr=MOND.tour;try{BQ2.mondial=false;MOND.scores.push({tour:tr,gagnant:BQ2.adv.nom,perdant:'Toi',pts:'abandon'});mondAvancer(false);}catch(x){}bqResultat(false,true,tr);return;}
bqAccueil();}
function bqTaille(){const r=BQ2.el.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);BQ2.W=r.width;BQ2.H=r.height;BQ2.cv.width=Math.round(r.width*dpr);BQ2.cv.height=Math.round(r.height*dpr);BQ2.dpr=dpr;bqGeo();}
function bqHaut(){BQ2.haut=BQ2.stade?Math.max(176,BQ2.H*0.21):Math.max(134,BQ2.H*0.16);}
function bqGeo(){bqHaut();const H=BQ2.H,W=BQ2.W;BQ2.cy=H-Math.max(186,H*0.22);BQ2.cx=W/2;BQ2.sx=Math.min(W*0.64,W-120)/4;BQ2.pub=null;BQ2.fx=[];BQ2.vent=(Math.random()<.5?-1:1)*(6+Math.random()*10);BQ2.sz=(BQ2.cy-BQ2.haut-4)/BQ_ZMAX;BQ2.s=BQ2.sx;BQ2.jy=H-140;BQ2.tex=null;BQ2.fond=null;}
/* ---- les écrans ---- */
function bqMenu(h,mo){const m=$('bqMenu');m.classList.toggle('mo',!!mo);m.innerHTML=h;m.scrollTop=0;BQ2.phase='menu';['bqGs','bqBt'].forEach(i=>$(i).classList.remove('on'));$('bqGs').classList.add('off');$('boX').style.display='none';
m.querySelectorAll('canvas[data-b]').forEach(c=>{const B=PQ_BOULES.find(x=>x.c===c.dataset.b)||PQ_BOULES[0],s=+c.dataset.s||44,dp=2;c.width=s*dp;c.height=s*dp;c.style.width=c.style.height=s+'px';const g=c.getContext('2d');g.scale(dp,dp);bqBoule(g,s/2,s/2-2,s*0.36,B);});
m.querySelectorAll('canvas[data-t]').forEach(c=>{const T=PQ_TERRAINS.find(x=>x.c===c.dataset.t)||PQ_TERRAINS[0],w=+c.dataset.w||44,h=+c.dataset.h||44;c.width=w;c.height=h;c.style.width=w+'px';c.style.height=h+'px';const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(bqTexture(Math.ceil(w/2),Math.ceil(h/2),T),0,0,w,h);g.fillStyle=T.bord;g.fillRect(0,0,4,h);g.fillRect(w-4,0,4,h);if(T.c==='nuit'){g.fillStyle='rgba(10,14,40,.45)';g.fillRect(0,0,w,h);const gl=g.createRadialGradient(w*0.3,h*0.2,2,w*0.3,h*0.2,w*0.8);gl.addColorStop(0,'rgba(255,200,110,.5)');gl.addColorStop(1,'rgba(255,200,110,0)');g.fillStyle=gl;g.fillRect(0,0,w,h);}if(T.lignes){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(6,0,1.5,h);g.fillRect(w-7.5,0,1.5,h);}});
m.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{vibrer(8);const k=b.dataset.go;
 if(k==='fermer')bqFermer();else if(k==='accueil')bqAccueil();else if(k==='tableau')bqTableau();else if(k==='terrains')bqVitrine('t');else if(k==='boules')bqVitrine('b');else if(k==='palmares')bqPalmares();else if(k==='fiche')bqFiche();
 else if(k==='nouveau'){mondNouveau();MOND.depart=MOND.camps.slice();MOND.edition=mondTitres()+1;mondRanger();bqTableau();}
 else if(k==='versus')bqVersus();else if(k==='jouer')bqPartie(true);else if(k==='amical')bqPartie(false);}));
m.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>bqItem(b.dataset.item,b.dataset.fam)));}
function bqTourNom(t){return ['Quarts de finale','Demi-finale','La finale'][Math.min(2,t|0)];}
function bqDifficulte(){/* le niveau du Mondial monte avec tes titres */return Math.max(0.55,Math.pow(0.9,mondTitres()));}
function bqAccueil(){mondCharger();const M=MOND, enCours=M&&!M.fini, adv=enCours?mondAdversaire():null, C=pqCompteurs();
const T=pqMonTerrain(), B=pqMaBoule(), ed=(M&&M.edition)||mondTitres()+1;
let h='<div class="tete"><h2><small>LA FERME</small>Le boulodrome</h2><button class="x" data-go="fermer">✕</button></div>';
h+='<div class="carte mo"><div class="coupe">🏆</div><span class="rib">LE MONDIAL · ÉDITION '+ed+'</span>';
if(enCours&&adv)h+='<h3>'+bqTourNom(M.tour)+'</h3><div class="adv">'+bqDrap(adv.d,1)+'<span>contre '+echapperT(adv.nom)+'<br><small style="font:800 12px Baloo 2;color:#8a6a48">'+(PQ_NATIONS[adv.d]||'')+'</small></span></div><button class="gros" data-go="versus">Jouer le match</button><button class="gros" style="background:#fff3d6;box-shadow:0 5px 0 #b89a6a;height:46px;font-size:18px" data-go="tableau">Voir le tableau</button>';
else h+='<h3>Huit boulistes, un seul titre</h3><p>Quarts, demies, finale. Chaque tour est plus dur, et chaque titre rend le suivant plus relevé.'+(M&&M.fini?'<br><b>Dernier champion :</b> '+echapperT((M.champion&&M.champion.nom)||'—'):'')+'</p><button class="gros" data-go="nouveau">Lancer un Mondial</button>';
h+='</div><div class="carte"><span class="rib" style="background:#4f8a3a">PARTIE AMICALE</span><h3>Contre Madeleine</h3><p>Sans enjeu, pour s’entraîner : chaque mène gagnée compte quand même pour débloquer boules et terrains.</p><button class="gros vert" data-go="amical">Jouer</button></div>';
h+='<div class="tuiles"><div class="tuile" data-go="terrains"><canvas data-t="'+T.c+'"></canvas>Terrains<small>'+echapperT(T.nom)+'</small></div><div class="tuile" data-go="boules"><canvas data-b="'+B.c+'"></canvas>Boules<small>'+echapperT(B.nom)+'</small></div><div class="tuile" data-go="fiche"><div style="font-size:30px;line-height:44px;height:50px">🪪</div>Ma fiche<small>'+bqCategorie(bqStats())[0]+'</small></div><div class="tuile" data-go="palmares"><div style="font-size:30px;line-height:44px;height:50px">🏆</div>Palmarès<small>'+mondTitres()+' titre'+(mondTitres()>1?'s':'')+'</small></div></div>';
h+='<div class="stats"><div><b>'+C.titres+'</b>titres</div><div><b>'+C.titres13+'</b>parties</div><div><b>'+C.menes+'</b>mènes</div><div><b>'+C.carreaux+'</b>carreaux</div></div>';
bqMenu(h);}
/* LE TABLEAU : on le reconstruit depuis le départ et les résultats */
function bqTours(){const M=MOND;if(!M)return [];const dep=M.depart;if(!dep)return [M.camps];const tours=[dep];
for(let t=0;t<3;t++){const prev=tours[t],nv=[];let ok=true;for(let i=0;i<prev.length;i+=2){const a=prev[i],b=prev[i+1];if(!a||!b){nv.push(null);continue;}
 const s=(M.scores||[]).find(x=>x.tour===t&&((x.gagnant===a.nom&&x.perdant===b.nom)||(x.gagnant===b.nom&&x.perdant===a.nom)));
 if(s)nv.push(s.gagnant===a.nom?a:b);else{nv.push(null);ok=false;}}
 tours.push(nv);if(!ok&&nv.every(x=>!x))break;}return tours;}
function bqTableau(){mondCharger();const M=MOND;const T=bqTours();const j=(c,out)=>!c?'<div class="j vide">?</div>':'<div class="j'+(c.moi?' moi':'')+(out?' out':'')+'">'+bqDrap(c.d)+echapperT(c.nom)+'</div>';
let h='<div class="tete"><button class="rt" data-go="accueil">‹</button><h2><small>LE MONDIAL · ÉDITION '+((M&&M.edition)||mondTitres()+1)+'</small>Le tableau</h2></div><div class="carte"><div class="tab">';
const noms=['QUARTS','DEMIES','🏆 FINALE'];
for(let t=0;t<3;t++){const L=T[t]||new Array(8>>t).fill(null),N=T[t+1];h+='<div class="col"><h4>'+noms[t]+'</h4>';L.forEach((c,i)=>{const w=N&&N[i>>1];h+=j(c,c&&w&&w.nom!==c.nom);});h+='</div>';}
h+='</div>';const ch=M&&M.champion;if(M&&M.fini)h+='<p style="text-align:center;margin-top:12px;font:400 18px Lilita One">🏆 Champion : '+(ch?bqDrap(ch.d)+' '+echapperT(ch.nom):'—')+'</p>';
h+='</div>';
if(M&&!M.fini)h+='<button class="gros" data-go="versus">Jouer '+bqTourNom(M.tour).toLowerCase()+'</button>';else h+='<button class="gros" data-go="nouveau">Nouveau Mondial</button>';
bqMenu(h,1);}
function bqBarres(o){const b=(n,v)=>'<div class="barre"><span>'+n+'</span><i><u style="width:'+Math.round(v*100)+'%"></u></i></div>';return b('Pointe',o.point)+b('Tir',o.tir)+b('Sang-froid',o.sang);}
function bqVersus(){mondCharger();const adv=mondAdversaire();if(!adv)return bqAccueil();const T=MOND.tour>=2?PQ_TERRAINS.find(x=>x.c==='champ'):pqMonTerrain();
const moi={point:.7,tir:.6,sang:.7};let h='<div class="tete"><button class="rt" data-go="tableau">‹</button><h2><small>LE MONDIAL</small>'+bqTourNom(MOND.tour)+'</h2></div>';
h+='<div class="vs"><div class="c">'+bqDrap('fr',1)+'<b>'+echapperT((e&&e.pseudo)||'Toi')+'</b><canvas data-b="'+pqMaBoule().c+'" data-s="54"></canvas></div><div class="v">VS</div><div class="c">'+bqDrap(adv.d,1)+'<b>'+echapperT(adv.nom)+'</b><small style="font:800 11px Baloo 2;color:#8a6a48">'+(PQ_NATIONS[adv.d]||'')+'</small>'+bqBarres(adv)+'</div></div>';
h+='<div class="mot">« '+echapperT(adv.mot||'')+' »</div>';
h+='<div class="carte" style="margin-top:14px;display:flex;gap:12px;align-items:center"><canvas data-t="'+T.c+'" data-w="70" data-h="56"></canvas><div><h3 style="font-size:19px">'+echapperT(T.nom)+'</h3><p>'+(PB_SOLS[T.c]||PB_SOLS.port).dit+(MOND.tour>=2?' · la finale se joue ici':'')+'</p></div></div>';
h+='<button class="gros vert" data-go="jouer">Entrer sur le terrain</button>';bqMenu(h,1);}
function bqVitrine(fam){const L=fam==='b'?PQ_BOULES:PQ_TERRAINS, cur=fam==='b'?pqMaBoule().c:pqMonTerrain().c;
let h='<div class="tete"><button class="rt" data-go="accueil">‹</button><h2><small>LE BOULODROME</small>'+(fam==='b'?'Les boules':'Les terrains')+'</h2></div><div class="grille">';
for(const o of L){const ok=pqDebloque(o), cnt=pqCompteurs();let etat='';
 if(o.c===cur)etat='<em>✔ CHOISI</em>';else if(ok)etat='<em>CHOISIR</em>';else if(o.prix)etat='<em>'+(BQ2.achat===o.c?'TOUCHE POUR PAYER ':'')+enEuros(o.prix).replace(',00','')+'</em>';else etat='<em>🔒 '+Math.min(cnt[o.quoi]||0,o.seuil)+' / '+o.seuil+'</em>';
 h+='<div class="item'+(o.c===cur?' sel':'')+(ok?'':' lock')+'" data-item="'+o.c+'" data-fam="'+fam+'">'+(fam==='b'?'<canvas data-b="'+o.c+'" data-s="60"></canvas>':'<canvas data-t="'+o.c+'" data-w="120" data-h="64"></canvas>')+'<b>'+echapperT(o.nom)+'</b><small>'+(ok||o.prix?echapperT(o.dit):echapperT(o.cond))+(fam==='t'?'<br>'+(PB_SOLS[o.c]||PB_SOLS.port).dit:'')+'</small>'+etat+'</div>';}
h+='</div>';bqMenu(h);}
function bqItem(c,fam){const L=fam==='b'?PQ_BOULES:PQ_TERRAINS, o=L.find(z=>z.c===c);if(!o)return;
if(pqDebloque(o)){BQ2.achat=null;if(fam==='b')e.pqBoule=o.c;else{e.pqTerrain=o.c;try{SABLE_PQ=null;DECOR_PQ=null;}catch(x){}}try{sauver();}catch(x){}vibrer(10);return bqVitrine(fam);}
if(!o.prix){vibrer(20);return;}
if(((e&&e.euros)||0)<o.prix){texteVolantMenu('Pas assez d’argent');return;}
if(BQ2.achat!==c){BQ2.achat=c;vibrer(8);return bqVitrine(fam);}
e.euros=Math.max(0,Math.round((e.euros||0)-o.prix));e.pqAchats=((e.pqAchats)||[]).concat([c]);BQ2.achat=null;try{jouer('achat');}catch(x){}vibrer([12,30,12]);try{majHaut();}catch(x){}bqItem(c,fam);}
function texteVolantMenu(t){vibrer(20);const m=$('bqMenu');const d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;top:40%;transform:translateX(-50%);background:rgba(30,20,10,.85);color:#fff;font:800 15px Baloo 2;padding:10px 16px;border-radius:14px;z-index:5';m.appendChild(d);setTimeout(()=>d.remove(),1400);}
let BQ_PALM=null;
function bqPalmares(){const dessiner=()=>{let h='<div class="tete"><button class="rt" data-go="accueil">‹</button><h2><small>LE MONDIAL</small>Le palmarès</h2></div><div class="carte">';
 if(BQ_PALM==='coupe')h+='<p>Le registre ne répond pas. Réessaie dans un moment.</p>';else if(!BQ_PALM)h+='<p>On compte les titres…</p>';else if(!BQ_PALM.length)h+='<p>Personne n’a encore de titre.</p>';
 else BQ_PALM.forEach((p,i)=>{h+='<div class="lig'+(p.moi?' moi':'')+'"><i>'+(['🥇','🥈','🥉'][i]||(i+1))+'</i>'+bqDrap(p.drapeau||'fr')+'<span class="n">'+echapperT(p.nom||'sans nom')+'<em>'+(p.moi?'TOI':p.bot?'BOULISTE DU MONDIAL':'JOUEUR')+'</em></span><u>'+(+p.titres||0)+' 🏆</u></div>';});
 const mien=Array.isArray(BQ_PALM)&&BQ_PALM.find(p=>p.moi), nt=Math.max(mondTitres(),mien?(+mien.titres||0):0);h+='</div><p style="text-align:center;font:800 12px Baloo 2;color:#8a6a48">Un chèque de titre par jour · '+nt+' titre'+(nt>1?'s':'')+' pour toi</p>';if(BQ2.phase==='menu'&&BQ2.ecran==='palm')bqMenu(h,1);};
BQ2.ecran='palm';BQ2.phase='menu';dessiner();
let rendu=false;const fini=v=>{if(rendu)return;rendu=true;BQ_PALM=v;if(BQ2.ouvert&&BQ2.ecran==='palm')dessiner();};setTimeout(()=>fini(BQ_PALM||'coupe'),8000);
try{if(typeof sb!=='undefined'&&sb)sb.rpc('mondial_classement').then(({data,error})=>fini(!error&&Array.isArray(data)?data:'coupe'),()=>fini('coupe'));else appelRPC('mondial_classement',{}).then(d=>fini(Array.isArray(d)?d:'coupe'),()=>fini('coupe'));}catch(x){fini('coupe');}}
/* ---- la partie ---- */
function bqPartie(mondial){mondCharger();BQ2.ecran='';BQ2.mondial=!!(mondial&&MOND&&!MOND.fini);
const adv=BQ2.mondial?mondAdversaire():MADELEINE;BQ2.adv=adv||MADELEINE;
const T=BQ2.mondial&&MOND.tour>=2?PQ_TERRAINS.find(x=>x.c==='champ'):pqMonTerrain();BQ2.T=T;BQ2.sol=PB_SOLS[T.c]||PB_SOLS.port;BQ2.tex=null;BQ2.maB=pqMaBoule();
BQ2.k=BQ2.mondial?[1.12,1.0,0.88][Math.min(2,MOND.tour)]*bqDifficulte():1.15;
if(BQ2.mondial){MOND.encours=1;mondRanger();}
$('bqMenu').innerHTML='';$('bqMenu').classList.remove('mo');$('boX').style.display='';$('bqN').textContent=BQ2.adv.nom.toUpperCase();$('bqDA').innerHTML=bqDrap('fr');$('bqDB').innerHTML=bqDrap(BQ2.adv.d||'fr');
BQ2.stade=BQ2.mondial;$('bqSc').classList.toggle('tv',BQ2.stade);BQ2.el.classList.toggle('stade',BQ2.stade);BQ2.foule=null;BQ2.rel=bqRelief(T.c);BQ2.geste='demi';BQ2.donnee=null;bqGeo();$('bqSol').textContent=T.nom;$('bqSol').style.display='block';
BQ2.score=[0,0];BQ2.mene=0;BQ2.prem=0;BQ2.fin=false;BQ2.confettis=[];BQ2.abandon=0;
BQ2.boules=[];BQ2.coch=null;BQ2.points=null;BQ2.vol=null;BQ2.drag=null;BQ2.tally=null;BQ2.pos=null;BQ2.apAdv=null;BQ2.mesCle=null;BQ2.mes=null;BQ2.lanceur=null;BQ2.hush=false;
if(BQ2.stade){BQ2.phase='intro';BQ2.introT=performance.now();bqGestes();$('bqP').textContent='';$('bqMes').textContent='';bqMaj();bqCheer(2600);bqCheer(2600,1);setTimeout(()=>{bqFumi(0,2);bqFumi(1,2);bqFeu(3,0);},400);}else bqMene();}
function bqApresPartie(){if(BQ2.mondial){BQ2.mondial=false;return bqTableau();}bqAccueil();}
function bqPill(t){BQ2.pillEtat=t;$('bqP').textContent=t;}
const BQ_COMM={carreau_moi:['Carreau ! Le public est debout !','Quel tir ! Carreau parfait !','Car-reau ! On n’a pas vu ça depuis longtemps !'],carreau_adv:['Carreau de {N} ! Coup dur…','{N} répond par un carreau, quelle classe !'],
chasse_moi:['Tir réussi, sa boule s’envole !','Tu chasses la boule de {N} !'],chasse_adv:['{N} a tiré juste, ta boule est partie…','Pas de pitié : {N} te chasse.'],manque:['Le tir passe à côté…','Raté ! Le public grogne.'],
biberon:['Biberon ! Elle embrasse le cochonnet !','Collée au cochonnet ! Magnifique !'],point_moi:['Tu reprends le point, ça se tend !','Belle boule, tu passes devant !'],point_adv:['{N} reprend le point.','{N} pointe au millimètre.'],
morte:['Dans les planches… boule morte.','Trop forte, elle finit hors jeu.'],mene_moi:['La mène est pour toi !','Ça marque ! Le public t’encourage.'],mene_adv:['{N} empoche la mène.','Mène pour {N}, il faut réagir.']};
function bqComm(cle){if(!BQ2.stade||!BQ_COMM[cle])return;const L=BQ_COMM[cle],t='🎙️ '+L[Math.floor(Math.random()*L.length)].replace('{N}',BQ2.adv.nom);$('bqP').textContent=t;clearTimeout(BQ2.commT);BQ2.commT=setTimeout(()=>{if(BQ2.ouvert&&$('bqP').textContent===t)$('bqP').textContent=BQ2.pillEtat||'';},2800);}
try{SONS.foule={f:(t)=>{const v=V.gestes;souffle(t,1.6,900,520,0.6,0.07*v,'bandpass',0.5);for(let i=0;i<34;i++)souffle(t+Math.random()*1.4,0.025,2600+Math.random()*2200,1400,1.4,0.03*v,'bandpass',0.5);}};}catch(x){}
function bqCheer_v1(ms){if(!BQ2.stade)return;BQ2.cheer=performance.now()+(ms||1500);try{jouer('foule');}catch(x){}}
function bqAnn(txt,col,fort){BQ2.ann={txt,col:col||'#fff',t0:performance.now(),dur:fort?1700:1200,fort:!!fort};}
/* ---- LA PARTIE, VUE TACTIQUE ----
   Tout est en mètres : x de -2 à 2 (largeur du terrain), z depuis le cercle.
   On pose sa DONNÉE (là où la boule touche le sol), on choisit sa portée (qui
   décide combien elle roulera ensuite), puis une jauge de timing décide de la
   précision. Le terrain a ses bosses, ses creux, sa pente et ses cailloux :
   on voit où la boule tombe, il faut LIRE le terrain pour savoir où elle s'arrête. */
const BQ_RB=0.1, BQ_RC=0.042, BQ_ZMAX=10.4;
const PB_ROLL={roulette:2.6,demi:1.0,plombee:0.3};
const PB_JAUGE={roulette:{per:1500,gw:.24,err:.8},demi:{per:1300,gw:.18,err:1},plombee:{per:1100,gw:.13,err:1.25},tir:{per:1000,gw:.12,err:1},coch:{per:1500,gw:.3,err:.8}};
function bqMaj(){$('bqA').textContent=BQ2.score[0];$('bqB').textContent=BQ2.score[1];$('bqM').innerHTML=(BQ2.mondial?bqTourNom(MOND.tour).toUpperCase().replace('DE FINALE','')+'<br>':'')+'MÈNE '+BQ2.mene;}
const bqCm=d=>Math.max(1,Math.round(Math.max(0,d)*100))+' cm';
/* LE TERRAIN PREND TOUT L'ÉCRAN, sans caméra qui bouge : vue de trois-quarts, la largeur remplit l'écran, la longueur est tassée */
const bqCam=()=>({k:1});function bqCamPas(){}
const bqS=(x,z)=>[BQ2.cx+x*BQ2.sx, BQ2.cy-z*BQ2.sz];
const bqM=(X,Y)=>[(X-BQ2.cx)/BQ2.sx,(BQ2.cy-Y)/BQ2.sz];
function bqA(){return 1.2*BQ2.sol.fric;}
/* ---- le relief du terrain, tiré pour chaque partie ---- */
function bqRelief_v1(c){const R=Math.random, B=[], P=[], Z=[], Rc=[], F=[];const bump=(n,h)=>{for(let i=0;i<n;i++)B.push({x:(R()-.5)*2.8,z:3+R()*7,r:0.4+R()*0.45,h:(R()<.5?1:-1)*h*(0.7+R()*0.6)});};
const pierres=n=>{for(let i=0;i<n;i++)P.push({x:(R()-.5)*3.6,z:1.5+R()*9.5});};let pente=[0,0];
if(c==='place'){bump(1,0.02);pierres(2);pente=[(R()<.5?1:-1)*(0.26+R()*0.1),0];
 for(let i=0;i<2;i++){const x0=(R()<.5?-1.9:0.4+R()*0.3), z0=3+i*3.6+R()*1.2;Z.push({t:'paves',x0,z0,x1:x0+1.2+R()*0.3,z1:z0+1.1+R()*0.6,f:0.45});}}
else if(c==='platanes'){bump(2,0.03);pierres(6);
 for(let i=0;i<3;i++){const z=3.2+i*2.6+R()*1.2,x=(R()-.5)*2.4,a=(R()-.5)*1.2,l=0.8+R()*0.9;const pts=[];for(let k=0;k<=8;k++){const t=k/8-0.5;pts.push([x+Math.cos(a)*l*t+(R()-.5)*0.06,z+Math.sin(a)*l*t+(R()-.5)*0.06]);}Rc.push(pts);}
 for(let i=0;i<70;i++)F.push({x:(R()-.5)*3.9,z:R()*11,a:R()*6.28,c:['#c8782a','#a85a20','#d8a040','#8a6a2a'][i%4]});}
else if(c==='champ'){}
else if(c==='nuit'){bump(2,0.026);pierres(10);Z.push({t:'flaque',x:(R()-.5)*2,z:5+R()*3,rx:0.35+R()*0.2,rz:0.25+R()*0.15,f:4});}
else{bump(2,0.022);pierres(6);for(let i=0;i<3;i++)Z.push({t:'flaque',x:(R()-.5)*2.6,z:3+i*2.4+R()*1.6,rx:0.3+R()*0.25,rz:0.22+R()*0.16,f:4});}
return {B,P,pente,Z,Rc,F};}
/* le sol sous la boule : une flaque colle, des pavés glissent */
function bqFricAt_v1(x,z){let f=1;for(const q of BQ2.rel.Z||[]){if(q.t==='flaque'){const dx=(x-q.x)/q.rx,dz=(z-q.z)/q.rz;if(dx*dx+dz*dz<1)f*=q.f;}else if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1)f*=q.f;}return f;}
/* les racines : une boule lente rebondit, une rapide passe en sautant */
function bqRacines_v1(b){const now=performance.now();(BQ2.rel.Rc||[]).forEach((pts,i)=>{if(b.rh&&b.rh[i]&&now-b.rh[i]<350)return;for(let k=0;k<pts.length-1;k++){const [ax,az]=pts[k],[bx,bz]=pts[k+1],dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((b.x-ax)*dx+(b.z-az)*dz)/L2)),px=ax+dx*t,pz=az+dz*t,d=Math.hypot(b.x-px,b.z-pz);
 if(d<b.r*0.6+0.03){const L=Math.sqrt(L2);let nx=-dz/L,nz=dx/L;if((b.x-px)*nx+(b.z-pz)*nz<0){nx=-nx;nz=-nz;}const vn=b.vx*nx+b.vz*nz;if(vn>=0)continue;
  if(-vn<1.1){b.vx-=1.45*vn*nx;b.vz-=1.45*vn*nz;}else{b.vx-=0.55*vn*nx;b.vz-=0.55*vn*nz;const an=(Math.random()-.5)*0.6,c=Math.cos(an),sn=Math.sin(an),vx=b.vx;b.vx=vx*c-b.vz*sn;b.vz=vx*sn+b.vz*c;}
  (b.rh||(b.rh={}))[i]=now;try{jouer('clac');}catch(x){}vibrer(8);return;}}});}
function bqGrad(x,z){let gx=0,gz=0;for(const b of BQ2.rel.B){const dx=x-b.x,dz=z-b.z,e=b.h*Math.exp(-(dx*dx+dz*dz)/(b.r*b.r)),k=-2/(b.r*b.r);gx+=e*k*dx;gz+=e*k*dz;}return [gx,gz];}
function bqHauteur(x,z){let h=0;for(const b of BQ2.rel.B){const dx=x-b.x,dz=z-b.z;h+=b.h*Math.exp(-(dx*dx+dz*dz)/(b.r*b.r));}return h;}
function bqAccPente(x,z){const [gx,gz]=bqGrad(x,z);return [-9*gx+BQ2.rel.pente[0],-9*gz+BQ2.rel.pente[1]];}
function bqGestes(){const on=BQ2.phase==='vise', jeu=['vise','jauge','ia','vol','roule','attente'].indexOf(BQ2.phase)>=0;$('bqGs').classList.toggle('off',!jeu);$('bqGs').classList.toggle('grise',!on);
BQ2.el.querySelectorAll('#bqGs button').forEach(b=>{b.classList.toggle('on',b.dataset.g===BQ2.geste);const h=b.querySelector('small');if(h)h.textContent=b.dataset.g==='tir'?'au fer':'roule ≈ '+(PB_ROLL[b.dataset.g]/BQ2.sol.fric).toFixed(1).replace('.',',')+' m';});
const pose=(on||BQ2.phase==='coch')&&BQ2.donnee;$('bqGo').classList.toggle('on',!!pose);
$('bqAide').textContent=BQ2.phase==='coch'?(BQ2.donnee?'Ajuste, puis lance le cochonnet':'Pose le cochonnet dans la bande (6 à 10 m)'):BQ2.phase==='jauge'?'Tape quand le curseur est dans le vert':on?(BQ2.donnee?'Ajuste ta donnée, puis lance':(BQ2.geste==='tir'?'Pose ta donnée sur sa boule':'Pose ta donnée : là où ta boule touchera le sol')):'';
$('bqSol').style.display=BQ2.phase==='coch'&&!BQ2.donnee?'block':'none';}
function bqMene(){BQ2.mene++;BQ2.boules=[];BQ2.reste=[3,3];BQ2.points=null;BQ2.drag=null;BQ2.vol=null;BQ2.coch=null;BQ2.ann=null;BQ2.tally=null;BQ2.donnee=null;
$('bqBt').classList.remove('on');$('bqMes').textContent='';bqMaj();
if(BQ2.prem===0){BQ2.phase='coch';bqPill('À toi de lancer le cochonnet');bqGestes();}else bqMene2IA();}
function bqMene2IA(){BQ2.phase='ia';bqGestes();bqPill(BQ2.adv.nom+' lance le cochonnet…');const z=6.3+Math.random()*3.3, x=(Math.random()-.5)*2;setTimeout(()=>{if(BQ2.ouvert&&BQ2.phase==='ia')bqLancer(1,x,z-0.35,'coch',0);},900);}
function bqVivantes(t){return BQ2.boules.filter(b=>!b.morte&&(t==null||b.t===t));}
function bqDist(b){return Math.hypot(b.x-BQ2.coch.x,b.z-BQ2.coch.z);}
function bqMeilleur(t){let m=Infinity;for(const b of bqVivantes(t))m=Math.min(m,bqDist(b));return m;}
function bqTient(){const a=bqMeilleur(0),b=bqMeilleur(1);if(a===Infinity&&b===Infinity)return -1;return a<b?0:1;}
function bqMesure(){const a=bqMeilleur(0),b=bqMeilleur(1),e=BQ_RB+BQ_RC;const p=[];if(a<Infinity)p.push('Toi '+bqCm(a-e));if(b<Infinity)p.push(BQ2.adv.nom+' '+bqCm(b-e));$('bqMes').textContent=p.length?'📏 '+p.join(' · '):'';}
function bqTour(){const [a,b]=BQ2.reste;if(!a&&!b)return bqFinMene();
const tient=bqTient();
if(tient>=0)BQ2.tour=BQ2.reste[1-tient]>0?1-tient:tient;else BQ2.tour=BQ2.reste[BQ2.prem]>0?BQ2.prem:1-BQ2.prem;
const ronds=n=>'●'.repeat(n)+'○'.repeat(3-n);bqMesure();BQ2.donnee=null;
if(BQ2.tour===0){BQ2.phase='vise';if(BQ2.geste==='tir'&&!bqVivantes(1).length)BQ2.geste='demi';
bqPill((tient<0?'À toi de pointer':tient===0?'Tu tiens le point':BQ2.adv.nom+' tient le point')+' · '+ronds(BQ2.reste[0]));}
else{BQ2.phase='ia';bqPill(BQ2.adv.nom+' lit le terrain… · '+ronds(BQ2.reste[1]));setTimeout(bqIA,1100);}
bqGestes();}
function bqG(){return (Math.random()+Math.random()+Math.random()+Math.random()-2)*1.22;}
/* simulation sans hasard (ni cailloux ni autres boules) : sert à l'adversaire pour lire le terrain */
function bqSimule(lx,lz,geste){const L=Math.hypot(lx,lz)||1;let x=lx,z=lz,v=Math.sqrt(2*1.2*PB_ROLL[geste]),vx=lx/L*v,vz=lz/L*v;const a=bqA(),dt=1/60;
for(let i=0;i<900;i++){const [ax,az]=bqAccPente(x,z),af=a*bqFricAt(x,z);vx+=ax*dt;vz+=az*dt;const s=Math.hypot(vx,vz);if(s<0.03&&Math.hypot(ax,az)<af*0.9)break;const s2=Math.max(0,s-af*dt);vx*=s2/(s||1);vz*=s2/(s||1);x+=vx*dt;z+=vz*dt;}return [x,z];}
/* L'ADVERSAIRE : il lit le terrain (plus il pointe bien, mieux il compense bosses et pentes), choisit sa portée, et tire quand tu es trop bien placé */
function bqIA(){if(!BQ2.ouvert||BQ2.phase!=='ia')return;const c=BQ2.coch,A=BQ2.adv;
let k=BQ2.k;const ecart=BQ2.score[0]-BQ2.score[1];if(ecart>=3)k*=1+(1-A.sang)*0.9;if(BQ2.score[0]>=10)k*=1+(1-A.sang)*0.5;
const mien=bqVivantes(0).sort((p,q)=>bqDist(p)-bqDist(q))[0], elle=bqMeilleur(1);
if(mien&&bqMeilleur(0)<elle&&bqDist(mien)<0.3&&(BQ2.reste[1]>1||bqDist(mien)<0.18)&&Math.random()<0.25+A.tir*0.7){const s=(0.035+(1-A.tir)*0.16)*k;bqLancer(1,mien.x+bqG()*s,mien.z+bqG()*s,'tir',0);return;}
const L=Math.hypot(c.x,c.z);
const bouche=BQ2.boules.some(b=>{if(b.morte)return false;const t=(b.x*c.x+b.z*c.z)/(L*L);if(t<0.25||t>0.98)return false;return Math.hypot(b.x-c.x*t,b.z-c.z*t)<BQ_RB*2.4;});
const g=bouche?'plombee':(BQ2.sol.fric<0.9?(Math.random()<0.55?'roulette':'demi'):BQ2.sol.fric>1.2?(Math.random()<0.6?'plombee':'demi'):(Math.random()<0.25?'roulette':'demi'));
const roll=PB_ROLL[g]/BQ2.sol.fric;let dx=c.x-c.x/L*roll, dz=c.z-c.z/L*roll;
const lect=Math.round(1+A.point*5);for(let i=0;i<lect;i++){const [fx,fz]=bqSimule(dx,dz,g);dx+=(c.x-fx)*0.85;dz+=(c.z-fz)*0.85;}
const s=(0.05+(1-A.point)*0.38)*k*(1+0.03*L);bqLancer(1,dx+bqG()*s*0.6,dz+bqG()*s,g,0);}
/* ---- le doigt : on pose la donnée ---- */
function bqDoigt(k,x,y,id){if(!BQ2.ouvert)return;
if(BQ2.phase==='intro'){if(k==='d')BQ2.introT=Math.min(BQ2.introT,performance.now()-2400);return;}
if(BQ2.phase==='jauge'){if(k==='d')bqStopJauge();return;}
if(BQ2.phase!=='vise'&&BQ2.phase!=='coch')return;
if(k==='d'){if(BQ2.drag)return;BQ2.drag={id};}
if(!BQ2.drag||BQ2.drag.id!==id)return;
if(k==='d'||k==='m'){let [mx,mz]=bqM(x,y-46);mx=Math.max(-1.9,Math.min(1.9,mx));mz=Math.max(0.8,Math.min(BQ_ZMAX-0.2,mz));if(BQ2.phase==='coch')mz=Math.max(6,Math.min(10,mz));
 const avant=BQ2.donnee;BQ2.donnee={x:mx,z:mz};BQ2.loupe=true;if(!avant||Math.hypot(avant.x-mx,avant.z-mz)>0.25)vibrer(3);if(!avant)bqGestes();return;}
BQ2.drag=null;BQ2.loupe=false;bqGestes();}
function bqGo(){if(!BQ2.donnee||(BQ2.phase!=='vise'&&BQ2.phase!=='coch'))return;vibrer(8);BQ2.jfor=BQ2.phase==='coch'?'coch':BQ2.geste;BQ2.jPhaseAvant=BQ2.phase;BQ2.phase='jauge';BQ2.jT0=performance.now();BQ2.jRes=null;bqGestes();}
function bqJaugeVal(now){const J=PB_JAUGE[BQ2.jfor];return Math.sin((now-BQ2.jT0)/(J.per*(BQ2.T&&BQ2.T.c==='champ'?0.78:1))*Math.PI*2);}
function bqStopJauge(){const J=PB_JAUGE[BQ2.jfor], e=bqJaugeVal(performance.now()), D=BQ2.donnee, L=Math.hypot(D.x,D.z);
const ok=Math.abs(e)<J.gw, bien=Math.abs(e)<J.gw*2.2, eff=(ok?e*0.12:e)*J.err;
const dL=eff*(0.1+0.06*L)*1.5, dX=bqG()*Math.abs(eff)*(0.05+0.03*L)+bqG()*0.012;
const ux=D.x/L,uz=D.z/L, lx=D.x+ux*dL+uz*dX, lz=D.z+uz*dL-ux*dX;
BQ2.jRes={e,txt:ok?'PARFAIT !':bien?(e>0?'UN PEU LONG':'UN PEU COURT'):(e>0?'TROP LONG':'TROP COURT'),col:ok?'#9fe8b8':bien?'#ffe066':'#ffb0a0',t:performance.now()};vibrer(ok?[10,20,10]:12);
const coch=BQ2.jfor==='coch';BQ2.donnee=null;bqLancer(0,lx,lz,coch?'coch':BQ2.geste,1);}
/* ---- le lancer : vol jusqu'au point de chute, puis la boule roule selon sa portée ---- */
function bqLancer(t,lx,lz,geste,moi){const coch=geste==='coch', L=Math.hypot(lx,lz)||1, ux=lx/L, uz=lz/L;
const v=geste==='tir'?4.8:coch?Math.sqrt(2*1.2*0.35):Math.sqrt(2*1.2*PB_ROLL[geste]);
if(!coch)BQ2.reste[t]--;
let cible=null;if(geste==='tir'){let dm=Infinity;for(const b of bqVivantes(1-t)){const d=Math.hypot(b.x-lx,b.z-lz);if(d<dm){dm=d;cible=b;}}if(cible&&dm<0.4)cible={b:cible,x:cible.x,z:cible.z};else cible=null;}
BQ2.coup={t,geste,coch,cible,avant:coch?-1:bqTient()};BQ2.lanceur=t;BQ2.anim0=performance.now();BQ2.animG=geste;
BQ2.phase='vol';bqGestes();if(t===0)bqPill(coch?'Le cochonnet…':'Ta boule…');
const hf={roulette:0.08,demi:0.3,plombee:0.75,tir:0.16,coch:0.3}[geste];
BQ2.vol={t,coch,lx,lz,vx:ux*v,vz:uz*v,T:(geste==='tir'?0.42:0.55)+L*0.045+hf*0.35,t0:performance.now()+260,h:0.25+L*hf*0.35};try{jouer('pas');}catch(x){}}
function bqPhys(dt){const a=bqA(), all=[BQ2.coch,...BQ2.boules].filter(b=>b&&!b.morte);let bouge=false;
for(const b of all){let s=Math.hypot(b.vx,b.vz);const [ax,az]=bqAccPente(b.x,b.z),af=a*bqFricAt(b.x,b.z);
 if(s<0.03&&Math.hypot(ax,az)<af*0.9){b.vx=b.vz=0;continue;}
 b.vx+=ax*dt;b.vz+=az*dt;s=Math.hypot(b.vx,b.vz);const s2=Math.max(0,s-af*dt*(b.m<1?1.3:1));if(s>0){b.vx*=s2/s;b.vz*=s2/s;}
 b.x+=b.vx*dt;b.z+=b.vz*dt;if(s2>0.02)bouge=true;if(s2>0.05)bqRacines(b);
 /* les cailloux font dévier */ if(s2>0.12)BQ2.rel.P.forEach((p,i)=>{if((b.hit||(b.hit={}))[i])return;if(Math.hypot(b.x-p.x,b.z-p.z)<b.r*0.7+0.02){b.hit[i]=1;const an=(Math.random()<.5?-1:1)*(0.3+Math.random()*0.5),c=Math.cos(an),sn=Math.sin(an);const vx=b.vx;b.vx=(vx*c-b.vz*sn)*0.8;b.vz=(vx*sn+b.vz*c)*0.8;bqSonCaillou();}});
 if(Math.abs(b.x)+b.r>2||b.z>15||b.z<-1.5){b.morte=true;b.vx=b.vz=0;b.mt=performance.now();b.x=Math.max(-2+b.r*0.5,Math.min(2-b.r*0.5,b.x));bqSonPlanche();}}
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const p=all[i],q=all[j];if(p.morte||q.morte)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz),m=p.r+q.r;if(d>0&&d<m){const nx=dx/d,nz=dz/d,o=(m-d);
const im=1/p.m+1/q.m;p.x-=nx*o*(1/p.m)/im;p.z-=nz*o*(1/p.m)/im;q.x+=nx*o*(1/q.m)/im;q.z+=nz*o*(1/q.m)/im;
const rv=(q.vx-p.vx)*nx+(q.vz-p.vz)*nz;if(rv<0){const jj=-(1+0.86)*rv/im;p.vx-=jj*nx/p.m;p.vz-=jj*nz/p.m;q.vx+=jj*nx/q.m;q.vz+=jj*nz/q.m;if(-rv>0.4){vibrer(Math.min(30,-rv*8));bqSonChoc(-rv/2.5);BQ2.choc={x:(p.x+q.x)/2,z:(p.z+q.z)/2,t:performance.now()};}}}}
return bouge;}
function bqJuger0(){const C=BQ2.coup;if(!C)return;BQ2.coup=null;const N=BQ2.adv.nom;
if(C.coch){const c=BQ2.coch;const ok=!c.morte&&c.z>=5.8&&c.z<=10.4;
 if(!ok){bqAnn(c.morte?'COCHONNET SORTI':(c.z>10.4?'TROP LOIN':'TROP COURT'),'#ffd0a0');BQ2.coch=null;setTimeout(()=>{if(!BQ2.ouvert)return;if(C.t===0){BQ2.phase='coch';BQ2.donnee=null;bqPill('Relance le cochonnet');bqGestes();}else bqMene2IA();},900);return false;}
 return true;}
const ma=BQ2.boules[BQ2.boules.length-1], moi=C.t===0, apres=bqTient();
if(ma&&ma.morte){bqAnn('BOULE MORTE','#ffd0a0');bqComm('morte');return true;}
if(C.geste==='tir'&&C.cible){const K=C.cible, bouge=Math.hypot(K.b.x-K.x,K.b.z-K.z), sortie=K.b.morte||bouge>BQ_RB*2.2;
 if(sortie&&ma&&!ma.morte&&Math.hypot(ma.x-K.x,ma.z-K.z)<BQ_RB*1.5){bqAnn(moi?'CARREAU !':'CARREAU DE '+N.toUpperCase(),'#ffe066',true);vibrer(moi?[16,40,16,40,30]:[10,30,10]);try{jouer(moi?'achat':'clac');}catch(x){}
  bqComm(moi?'carreau_moi':'carreau_adv');if(moi){bqFeu(4,0);bqFumi(0,3);}else{bqCheer(1600,1);bqFumi(1,3);}if(moi){bqInc('bdl.petanque.carreaux');const [X,Y]=bqS(ma.x,ma.z);bqConfettis(X,Y,26);bqCheer(2400);}return true;}
 if(sortie){bqAnn(moi?'TU L’AS CHASSÉE !':N.toUpperCase()+' T’A CHASSÉ','#ffffff',moi);bqComm(moi?'chasse_moi':'chasse_adv');bqCheer(1500,moi?0:1);return true;}
 bqAnn(bouge>0.03?'TOUCHÉE…':'MANQUÉE','#ffd0a0');bqComm('manque');return true;}
if(ma&&bqDist(ma)<ma.r+BQ_RC+0.012){bqAnn('BIBERON !','#9fe8b8',true);bqComm('biberon');bqCheer(2000,moi?0:1);bqFumi(moi?0:1,2);if(moi){const [X,Y]=bqS(ma.x,ma.z);bqConfettis(X,Y,14);}return true;}
if(apres!==C.avant&&apres===C.t){bqAnn(moi?'TU TIENS LE POINT !':N.toUpperCase()+' PREND LE POINT',moi?'#9fe8b8':'#ffb0a0',moi);bqComm(moi?'point_moi':'point_adv');bqCheer(1100,moi?0:1);return true;}
if(moi&&ma&&apres!==0)bqAnn('PAS ASSEZ PRÈS','#fff3d0');
return true;}
function bqFinMene(){const a=bqMeilleur(0),b=bqMeilleur(1);
if(a===Infinity&&b===Infinity){bqAnn('MÈNE NULLE','#fff');bqPill('Aucune boule en jeu');BQ2.phase='fin';$('bqBt').textContent='Mène suivante';$('bqBt').classList.add('on');bqGestes();return;}
const g=a<b?0:1,seuil=g===0?b:a;const pts=bqVivantes(g).filter(q=>bqDist(q)<seuil).sort((p,q)=>bqDist(p)-bqDist(q));
BQ2.points={g,b:pts};BQ2.prem=g;bqStat(s=>{s.menes++;if(g===0)s.menesG++;});BQ2.phase='compte';BQ2.tally={n:0,t0:performance.now(),base:BQ2.score[g]};bqGestes();bqPill(g===0?'Tu as le point…':BQ2.adv.nom+' a le point…');if(g===0)bqInc('bdl.petanque.gagnees');}
function bqCompte(now){const T=BQ2.tally,P=BQ2.points;const n=Math.min(P.b.length,Math.floor((now-T.t0)/550));
if(n>T.n){T.n=n;BQ2.score[P.g]=Math.min(13,T.base+n);bqMaj();vibrer(P.g===0?14:6);try{jouer(P.g===0?'vente':'clac');}catch(x){}}
if(now-T.t0>P.b.length*550+500){BQ2.phase='fin';PT.img=null;const g=P.g,pts=P.b.length;
 if(BQ2.score[g]>=13){BQ2.fin=true;bqFinPartie(g===0);return;}
 bqPill((g===0?'Tu marques ':BQ2.adv.nom+' marque ')+pts+' point'+(pts>1?'s':''));bqReac(g,'joie');bqReac(1-g,'decu',0.7);bqComm(g===0?'mene_moi':'mene_adv');bqCheer(1800,g);bqFumi(g,g===0?4:3);if(g===0)bqFeu(3,0);$('bqBt').textContent='Mène suivante';$('bqBt').classList.add('on');bqGestes();}}
function bqFinPartie(gagne){const fanny=BQ2.score[gagne?1:0]===0;bqReac(gagne?0:1,'gagne');bqReac(gagne?1:0,'perd');
bqStat(s=>{s.parties++;if(gagne){s.victoires++;s.serie++;s.serieMax=Math.max(s.serieMax,s.serie);}else s.serie=0;if(fanny){if(gagne)s.fannyD++;else s.fannyR++;}const k=(BQ2.T&&BQ2.T.c)||'port';s.terr[k]=s.terr[k]||{p:0,v:0};s.terr[k].p++;if(gagne)s.terr[k].v++;if(BQ2.mondial&&MOND){s.mondialMax=Math.max(s.mondialMax,gagne?MOND.tour+2:MOND.tour+1);}});
if(!gagne){bqFeu(5,1);bqFumi(1,6);bqCheer(3500,1);}
if(gagne){bqInc('bdl.petanque.parties');bqConfettis(BQ2.W/2,BQ2.H*0.4,90);bqCheer(3500);bqFeu(14,0);bqFumi(0,8);vibrer([20,40,20,40,60]);try{jouer('vente','moment');}catch(x){}}
bqAnn(gagne?(fanny?BQ2.adv.nom.toUpperCase()+' EST FANNY !':'VICTOIRE !'):(fanny?'FANNY !':BQ2.adv.nom.toUpperCase()+' GAGNE'),gagne?'#ffe066':'#ffb0a0',true);
if(BQ2.mondial){const tour=MOND.tour;MOND.scores.push({tour,gagnant:gagne?'Toi':BQ2.adv.nom,perdant:gagne?BQ2.adv.nom:'Toi',pts:'13 – '+Math.min(BQ2.score[0],BQ2.score[1])});mondAvancer(gagne);BQ2.mondial=true;
 setTimeout(()=>{if(BQ2.ouvert)bqResultat(gagne,false,tour);},1900);return;}
bqPill(gagne?'Gagné '+BQ2.score[0]+' à '+BQ2.score[1]:(fanny?'13 à 0 : tu dois embrasser Fanny':'Perdu '+BQ2.score[0]+' à '+BQ2.score[1]));$('bqBt').textContent='Rejouer';$('bqBt').classList.add('on');bqGestes();}
function bqResultat(gagne,abandon,tour){BQ2.mondial=false;mondCharger();const M=MOND, champ=M&&M.fini==='gagne';
let h='<div class="res">';
if(champ){h+='<div style="font-size:80px">🏆</div><h2>CHAMPION DU MONDE !</h2><p class="sco">'+BQ2.score[0]+' – '+BQ2.score[1]+'</p><p class="mot">Ton nom monte au palmarès. Le chèque arrive…</p>';}
else if(gagne){h+='<div style="font-size:64px">🎉</div><h2>QUALIFIÉ !</h2><p class="sco">'+BQ2.score[0]+' – '+BQ2.score[1]+'</p><p class="mot">Prochain tour : '+bqTourNom(M.tour)+'</p>';}
else{h+='<div style="font-size:64px">'+(abandon?'🏳️':'😤')+'</div><h2>'+(abandon?'ABANDON':'ÉLIMINÉ')+'</h2>'+(abandon?'':'<p class="sco">'+BQ2.score[0]+' – '+BQ2.score[1]+'</p>')+'<p class="mot">Éliminé '+['en quarts de finale','en demi-finale','en finale'][Math.min(2,tour==null?M.tour:tour)]+'. Champion : '+echapperT((M.champion&&M.champion.nom)||'—')+'</p>';}
h+='<button class="gros" data-go="tableau">Voir le tableau</button><button class="gros vert" data-go="accueil">Retour au boulodrome</button></div>';
BQ2.score=[0,0];bqMenu(h,1);}
function bqConfettis(x,y,n){const C=['#ffd75a','#e8503a','#4fb83e','#3a9ad8','#ffffff','#e84a8a'];for(let i=0;i<n;i++){const a=Math.random()*6.28,v=120+Math.random()*320;BQ2.confettis.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-220,c:C[i%6],r:Math.random()*6.28,t:0});}}
/* LE STADE : tribunes pleines, drapeaux des deux pays, panneaux qui défilent */
function bqFoule(W,rows){const L=[],sk=['#f0c8a0','#d8a878','#a8784a','#7a5232','#f4d2b0','#5a3a24'],nat=['fr',BQ2.adv.d||'fr'];
for(let r=0;r<rows;r++)for(let x=6+(r%2)*5;x<W;x+=10+Math.random()*2){const n=nat[Math.random()<0.5?0:1],C=(BQ_NAT_C[n].c)||['#c8102e','#f4f4f4'];
 const c=Math.random()<0.62?C[Math.floor(Math.random()*C.length)]:['#e8e8e8','#3a5a9a','#d84a3a','#f2c14e','#4a8a4a','#2a2a2a'][Math.floor(Math.random()*6)];
 L.push({r,x:x+Math.random()*2,c,k:sk[Math.floor(Math.random()*sk.length)],p:Math.random()*6.28,e:0.3+Math.random()*0.7,f:Math.random()<0.16?n:null});}
return {W,rows,L};}
function bqStade(g,W,now){const top=BQ2.haut-30;
const gr=g.createLinearGradient(0,0,0,top);gr.addColorStop(0,'#0a1838');gr.addColorStop(1,'#1d3d7a');g.fillStyle=gr;g.fillRect(0,0,W,top);
const rowH=12, rows=Math.max(1,Math.floor((top-24)/rowH));
if(!BQ2.foule||BQ2.foule.W!==W||BQ2.foule.rows!==rows)BQ2.foule=bqFoule(W,rows);
for(let r=0;r<rows;r++){const y=2+r*rowH;g.fillStyle=r%2?'#4a5a78':'#56688a';g.fillRect(0,y+rowH-2,W,2);}
const cheer=now<(BQ2.cheer||0);
for(const s of BQ2.foule.L){const y=2+s.r*rowH+rowH-2, j=cheer?Math.abs(Math.sin(now/110+s.p))*4*s.e:Math.sin(now/700+s.p)*0.5, x=s.x;
 g.fillStyle=s.c;g.fillRect(x-3.5,y-7-j,7,7);g.fillStyle=s.k;g.beginPath();g.arc(x,y-9.6-j,2.9,0,7);g.fill();
 if(cheer&&s.e>0.55){g.strokeStyle=s.k;g.lineWidth=1.4;g.beginPath();g.moveTo(x-3,y-6-j);g.lineTo(x-5,y-12-j);g.moveTo(x+3,y-6-j);g.lineTo(x+5,y-12-j);g.stroke();}
 if(s.f){const fy=y-19-j+(cheer?Math.sin(now/90+s.p)*2:0);g.fillStyle='#ddd';g.fillRect(x+3,fy,1,11);bqMiniDrap(g,x+4,fy,9,6,s.f);}}
/* les projecteurs */ g.save();g.globalCompositeOperation='lighter';for(const px of [W*0.12,W*0.88]){const l=g.createRadialGradient(px,0,2,px,0,top*1.3);l.addColorStop(0,'rgba(255,240,200,.35)');l.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=l;g.fillRect(0,0,W,top+40);}g.restore();
/* les panneaux qui défilent */ const ay=top-20, ads=['MONDIAL DE PÉTANQUE','★ ÉDITION '+((MOND&&MOND.edition)||1)+' ★',bqTourNom(MOND?MOND.tour:0).toUpperCase(),'BATTLE DOCK','LA FERME · MARSEILLE'];
g.font='400 11px "Lilita One",sans-serif';g.textBaseline='middle';const ws=ads.map(t=>g.measureText(t).width+26), cyc=ws.reduce((a,b)=>a+b,0);
let x=-((now/28)%cyc),i=0;while(x<W){const k=i%ads.length,w=ws[k],alt=k%2;g.fillStyle=alt?'#f2c14e':'#12285a';g.fillRect(x,ay,w,20);g.fillStyle=alt?'#12285a':'#ffffff';g.fillText(ads[k],x+13,ay+10.5);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+w-1,ay,1,20);x+=w;i++;}
g.textBaseline='alphabetic';g.fillStyle='#f2c14e';g.fillRect(0,ay-2,W,2);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,ay+20,W,5);}
function bqIntro(g,W,H,now){const k=(now-BQ2.introT)/2900, A=BQ2.adv, e2=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3), al=k>0.86?(1-k)/0.14:1;
g.save();g.globalAlpha=Math.max(0,al);g.fillStyle='rgba(8,18,44,.72)';g.fillRect(0,0,W,H);
const y=H*0.34, h=H*0.2, s1=e2(k/0.22), s2=e2((k-0.08)/0.22);
g.fillStyle='#1d3d7a';g.fillRect(-W*(1-s1),y,W*0.5,h);g.fillStyle='#d8402a';g.fillRect(W-W*0.5*s2,y,W*0.5,h);
g.fillStyle='#f2c14e';g.fillRect(-W*(1-s1),y,W*0.5,4);g.fillRect(W-W*0.5*s2,y+h-4,W*0.5,4);
const fw=Math.min(84,W*0.2),fh=fw*0.66;bqMiniDrap(g,W*0.25-fw/2-W*(1-s1),y+h*0.16,fw,fh,'fr');bqMiniDrap(g,W*0.75-fw/2+W*0.5*(1-s2),y+h*0.16,fw,fh,A.d||'fr');
g.textAlign='center';g.font='400 22px "Lilita One",sans-serif';g.fillStyle='#fff';g.fillText(((e&&e.pseudo)||'Toi').slice(0,12).toUpperCase(),W*0.25-W*(1-s1),y+h*0.86);g.fillText(A.nom.toUpperCase(),W*0.75+W*0.5*(1-s2),y+h*0.86);
const v=e2((k-0.25)/0.15);if(v>0){g.save();g.translate(W/2,y+h/2);g.scale(0.5+v*0.5,0.5+v*0.5);g.font='400 46px "Lilita One",sans-serif';g.lineWidth=8;g.strokeStyle='#0a1838';g.strokeText('VS',0,16);g.fillStyle='#ffd75a';g.fillText('VS',0,16);g.restore();}
const t1=e2((k-0.1)/0.2);g.globalAlpha=Math.max(0,al)*t1;g.font='400 15px "Lilita One",sans-serif';g.fillStyle='#f2c14e';g.fillText('MONDIAL DE PÉTANQUE · ÉDITION '+((MOND&&MOND.edition)||1),W/2,y-46);
g.font='400 34px "Lilita One",sans-serif';g.lineWidth=7;g.strokeStyle='#0a1838';const tn=bqTourNom(MOND?MOND.tour:0).toUpperCase();g.strokeText(tn,W/2,y-14);g.fillStyle='#fff';g.fillText(tn,W/2,y-14);
const t2=e2((k-0.4)/0.2);g.globalAlpha=Math.max(0,al)*t2;g.font='italic 700 14px "Baloo 2",sans-serif';g.fillStyle='#e8eeff';const mot='« '+(A.mot||'')+' »';
const mots=mot.split(' ');let ligne='',yy=y+h+34;for(const m of mots){if(g.measureText(ligne+m).width>W-60){g.fillText(ligne,W/2,yy);ligne='';yy+=19;}ligne+=m+' ';}g.fillText(ligne,W/2,yy);
g.font='800 12px "Baloo 2",sans-serif';g.fillStyle='rgba(255,255,255,.6)';g.fillText('touche pour commencer',W/2,H-40);g.restore();g.textAlign='left';}
/* =====================================================================
   DES TERRAINS RÉALISTES, DES AMBIANCES DIFFÉRENTES
   Le sable reste un vrai sable de pétanque (petites irrégularités, quelques
   graviers). Ce qui change d'un terrain à l'autre, c'est tout le reste : le
   décor autour, le public, la lumière. À gauche tes supporters, à droite
   ceux de l'adversaire ; ils réagissent, allument des fumigènes, et le ciel
   s'illumine de feux d'artifice quand la partie tourne pour toi.
   ===================================================================== */
function bqRelief(c){const R=Math.random,B=[],P=[];const bump=(n,h)=>{for(let i=0;i<n;i++)B.push({x:(R()-.5)*2.6,z:3+R()*7,r:0.5+R()*0.5,h:(R()<.5?1:-1)*h*(0.6+R()*0.6)});};
const pierres=n=>{for(let i=0;i<n;i++)P.push({x:(R()-.5)*3.6,z:1.5+R()*9.5});};
if(c==='champ'){bump(1,0.004);pierres(1);}else if(c==='platanes'){bump(2,0.012);pierres(3);}else if(c==='place'){bump(2,0.01);pierres(2);}else{bump(2,0.012);pierres(4);}
return {B,P,pente:[0,0],Z:[],Rc:[],F:[]};}
function bqFricAt(){return 1;}
function bqRacines(){}
function bqDecorSol(g,s,sz){const T=BQ2.T||{};if(T.c!=='champ')return;g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.6;const [xa,ya]=bqS(-1.88,BQ_ZMAX),[xb,yb]=bqS(1.88,-0.6);g.strokeRect(xa,ya,xb-xa,yb-ya);
g.setLineDash([6,6]);for(const z of [6,10]){const [p,q]=bqS(-1.88,z),[r]=bqS(1.88,z);g.beginPath();g.moveTo(p,q);g.lineTo(r,q);g.stroke();}g.setLineDash([]);}
/* ---- les couleurs des camps ---- */
function bqCouleurs(camp){const d=camp===0?'fr':((BQ2.adv&&BQ2.adv.d)||'fr');const F=BQ_NAT_C[d];if(F&&F.c)return F.c.filter((c,i,a)=>a.indexOf(c)===i);if(d==='tn')return ['#c8102e','#ffffff'];if(d==='mg')return ['#c8102e','#248b48','#ffffff'];return ['#1f3a93','#ffffff','#c8102e'];}
/* ---- le décor fixe : bas-côtés, fond, barrières ---- */
function bqTexFond(){const W=BQ2.W,H=BQ2.H,c=document.createElement('canvas'),dp=BQ2.dpr;c.width=Math.round(W*dp);c.height=Math.round(H*dp);const g=c.getContext('2d');g.scale(dp,dp);
const T=(BQ2.T&&BQ2.T.c)||'port', x0=BQ2.cx-2*BQ2.sx, x1=BQ2.cx+2*BQ2.sx, yt=BQ2.cy-BQ_ZMAX*BQ2.sz-6, H2=bqHh, bw=Math.max(6,BQ2.sx*0.16);
const tex=(x,y,w,h,pal,k,grain)=>{for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2){g.fillStyle=pal[(H2(i+x|0,j+y|0,k)*pal.length)|0];g.fillRect(x+i,y+j,2,2);}};
const evite=[];BQ2.pubEvite=evite;
if(T==='port'){/* le quai : dalles de béton, ligne jaune, caisses de poisson et filets */
 tex(0,0,W,H,['#a4a29a','#aeaca4','#9a988f','#b6b4ac'],3);for(let y=0;y<H;y+=40){g.fillStyle='rgba(0,0,0,.1)';g.fillRect(0,y,W,1);}for(let x=0;x<W;x+=52){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(x,0,1,H);}
 for(const side of [-1,1]){const bxx=side<0?x0-bw-6:x1+bw+6;g.fillStyle='#e8c040';g.fillRect(bxx-1,0,2,H);}
 const caisse=(cx,cy)=>{evite.push([cx-10,cy-8,20,16]);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(cx-9,cy-5,20,14);g.fillStyle='#b8864e';g.fillRect(cx-10,cy-7,20,13);g.fillStyle='#8a5a30';for(let k=0;k<4;k++)g.fillRect(cx-10,cy-7+k*4,20,1);g.fillStyle='#c8d0d8';for(let k=0;k<5;k++){g.beginPath();g.ellipse(cx-6+k*3,cy-3+(k%2),2,1,0.4,0,7);g.fill();}};
 const filet=(cx,cy)=>{evite.push([cx-11,cy-8,22,16]);g.strokeStyle='#4a7a5a';g.lineWidth=0.7;for(let k=-8;k<=8;k+=2.5){g.beginPath();g.moveTo(cx+k,cy-6);g.lineTo(cx+k*0.6,cy+6);g.stroke();g.beginPath();g.moveTo(cx-10,cy+k*0.6);g.lineTo(cx+10,cy+k*0.6);g.stroke();}g.fillStyle='#e85a2a';g.beginPath();g.arc(cx+7,cy-5,2.2,0,7);g.fill();};
 caisse(Math.max(14,(x0-bw)/2),yt+140);filet(Math.min(W-14,x1+bw+(W-x1-bw)/2),yt+300);caisse(Math.min(W-14,x1+bw+(W-x1-bw)/2),yt+70);
 if(!BQ2.stade){const ciel=g.createLinearGradient(0,0,0,yt);ciel.addColorStop(0,'#9ccbe8');ciel.addColorStop(1,'#cfe6f2');g.fillStyle=ciel;g.fillRect(0,0,W,yt);const mer=g.createLinearGradient(0,yt*0.55,0,yt);mer.addColorStop(0,'#3a7aa8');mer.addColorStop(1,'#2a5a80');g.fillStyle=mer;g.fillRect(0,yt*0.55,W,yt*0.45);
  for(let i=0;i<30;i++){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(H2(i,1,2)*W,yt*0.58+H2(i,2,2)*yt*0.38,5,1);}
  for(const [bx,c] of [[W*0.15,'#f2efe8'],[W*0.5,'#d84a3a'],[W*0.85,'#3a6aa8']]){const by=yt*0.8;g.fillStyle=c;g.beginPath();g.moveTo(bx-14,by);g.lineTo(bx+14,by);g.lineTo(bx+10,by+6);g.lineTo(bx-10,by+6);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(bx,by-16);g.lineTo(bx,by);g.lineTo(bx+10,by);g.fill();g.fillStyle='#5a4a3a';g.fillRect(bx-0.5,by-18,1.4,18);}
  g.fillStyle='#8a8a84';g.fillRect(0,yt-6,W,6);}}
else if(T==='place'){/* pavés, façades, café avec ses parasols */
 for(let y=0;y<H;y+=7)for(let x=-(y/7%2)*4;x<W;x+=8){g.fillStyle=['#a8a094','#b4ac9e','#9c9488','#bcb4a6'][(H2(x|0,y,7)*4)|0];g.beginPath();g.roundRect(x+0.5,y+0.5,7,6,2);g.fill();}
 if(!BQ2.stade){const col=['#e8c890','#e0b480','#f0d8a8','#d8a878'];for(let x=0,i=0;x<W;x+=W/4,i++){g.fillStyle=col[i%4];g.fillRect(x,0,W/4+1,yt);for(let fx=x+10;fx<x+W/4-12;fx+=24)for(let fy=10;fy<yt-24;fy+=34){g.fillStyle='#3a5a8a';g.fillRect(fx,fy,6,14);g.fillRect(fx+10,fy,6,14);g.fillStyle='#2a2a2a';g.fillRect(fx+6,fy,4,14);}}
  g.fillStyle='#8a2a1a';g.fillRect(W*0.08,yt-22,W*0.3,10);g.fillStyle='#fff';g.font='800 8px sans-serif';g.fillText('CAFÉ DE LA PLACE',W*0.09,yt-14);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,yt-4,W,4);}
 for(const [px,py] of [[x1+bw+30,yt+60],[x1+bw+30,yt+150]]){if(px>W-10)continue;evite.push([px-24,py-24,48,48]);g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(px+3,py+4,22,0,7);g.fill();for(let k=0;k<8;k++){g.fillStyle=k%2?'#ffffff':'#c8302a';g.beginPath();g.moveTo(px,py);g.arc(px,py,22,k*Math.PI/4,(k+1)*Math.PI/4);g.fill();}g.fillStyle='#5a3a20';g.beginPath();g.arc(px,py,2,0,7);g.fill();}}
else if(T==='platanes'){/* herbe, ombre, bancs */
 tex(0,0,W,H,['#6a9a44','#78a64e','#5e8c3c','#86b25a'],5);
 if(!BQ2.stade){g.fillStyle='#4a7a32';g.fillRect(0,0,W,yt);for(let k=0;k<26;k++){g.fillStyle=['#3e6a2a','#4f8236','#64983f','#2e5a22'][k%4];g.beginPath();g.arc(H2(k,1,3)*W,H2(k,2,3)*yt,20+H2(k,3,3)*22,0,7);g.fill();}}
 for(const [bx,by] of [[3,yt+120],[W-41,yt+260]]){if(by>H-150)continue;evite.push([bx-2,by-14,42,22]);g.fillStyle='#2a2a2a';g.fillRect(bx+2,by-2,2,6);g.fillRect(bx+32,by-2,2,6);g.fillStyle='#9a6a3e';g.fillRect(bx,by-6,38,4);g.fillRect(bx,by-12,38,3);}}
else if(T==='champ'){/* tribunes en gradins */
 for(let y=0;y<H;y+=13){g.fillStyle=(y/13)%2?'#8a8e98':'#9aa0aa';g.fillRect(0,y,W,13);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,y+11,W,2);}
 if(!BQ2.stade){g.fillStyle='#12285a';g.fillRect(0,yt-22,W,20);g.fillStyle='#f2c14e';g.font='400 12px "Lilita One",sans-serif';g.textAlign='center';g.fillText('BOULODROME DU CHAMPIONNAT',W/2,yt-8);g.textAlign='left';}}
else{/* la nuit : herbe sombre, ciel étoilé */
 tex(0,0,W,H,['#2a4a2a','#30522e','#264426','#365a32'],9);
 if(!BQ2.stade){const sk=g.createLinearGradient(0,0,0,yt);sk.addColorStop(0,'#060a1e');sk.addColorStop(1,'#1a2a50');g.fillStyle=sk;g.fillRect(0,0,W,yt);for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,'+(0.3+H2(i,1,4)*0.7)+')';g.fillRect(H2(i,2,4)*W,H2(i,3,4)*yt*0.8,1,1);}g.fillStyle='#f4f0d8';g.beginPath();g.arc(W*0.82,yt*0.3,9,0,7);g.fill();}}
/* les barrières entre le public et le terrain */
for(const side of [-1,1]){const bx=side<0?x0-bw-3:x1+bw+3;
 if(T==='port'){for(let y=yt;y<H;y+=30){g.fillStyle='#5a4a3a';g.fillRect(bx-1.5,y,3,10);}g.strokeStyle='#c8a870';g.lineWidth=1.6;g.beginPath();g.moveTo(bx,yt);g.lineTo(bx,H);g.stroke();}
 else if(T==='place'){g.fillStyle='#b8bcc4';g.fillRect(bx-1,yt,2,H);for(let y=yt;y<H;y+=6)g.fillRect(bx-3,y,6,1);}
 else if(T==='platanes'){g.fillStyle='#8a5a30';g.fillRect(bx-1.5,yt,3,H);for(let y=yt;y<H;y+=22){g.fillStyle='#6a4428';g.fillRect(bx-2.5,y,5,4);}}
 else if(T==='champ'){const ads=['MONDIAL','PÉTANQUE','BATTLE DOCK','LA FERME'];for(let y=yt,i=0;y<H;y+=58,i++){g.fillStyle=i%2?'#f2c14e':'#12285a';g.fillRect(bx-4,y,8,56);g.save();g.translate(bx+2.5,y+28);g.rotate(-Math.PI/2);g.fillStyle=i%2?'#12285a':'#fff';g.font='800 6.5px sans-serif';g.textAlign='center';g.fillText(ads[i%4],0,0);g.restore();}}
 else{g.strokeStyle='#d8c890';g.lineWidth=1.2;g.beginPath();g.moveTo(bx,yt);g.lineTo(bx,H);g.stroke();}}
return c;}
/* ---- le public ---- */
function bqPublic(){const W=BQ2.W,H=BQ2.H,T=(BQ2.T&&BQ2.T.c)||'port',x0=BQ2.cx-2*BQ2.sx,x1=BQ2.cx+2*BQ2.sx,bw=Math.max(6,BQ2.sx*0.16),yt=BQ2.cy-BQ_ZMAX*BQ2.sz,R=Math.random,L=[];
const PEAU=['#f2cfa8','#e0b088','#c88e64','#a06a44','#7a4e30','#f6dcc0'],CHEV=['#2a1a10','#5a3a20','#c8a060','#1a1a1a','#8a4a20','#d8d0c0'],BAS=['#2e3f5e','#3a3a3a','#5a4a3a','#4a5a7a','#e8e0d0'];
const ev=BQ2.pubEvite||[];const libre=(x,y)=>!ev.some(([a,b,w,h])=>x>a-4&&x<a+w+4&&y>b-6&&y<b+h+14);
const assis=T==='champ';const dy=assis?13:12;
for(const side of [-1,1]){const camp=side<0?0:1,C=bqCouleurs(camp),bord=side<0?x0-bw-8:x1+bw+8,lim=side<0?0:W;
 for(let col=0;col<6;col++){const x=bord+side*(5+col*11);if(side<0?x<8:x>W-8)continue;
  for(let y=yt+16+(col%2)*6;y<H+8;y+=dy+R()*3){const xx=x+(R()-.5)*3;if(!libre(xx,y))continue;if(!assis&&R()<0.12)continue;
   L.push({x:xx,y,camp,peau:PEAU[(R()*PEAU.length)|0],chev:CHEV[(R()*CHEV.length)|0],haut:R()<0.55?C[(R()*C.length)|0]:['#e8e8e8','#3a5a9a','#d84a3a','#f2c14e','#4a8a4a','#2a2a2a','#8a5a9a'][(R()*7)|0],bas:BAS[(R()*BAS.length)|0],
    ech:R()<0.25?C[(R()*C.length)|0]:null,chap:R()<0.2?['#c8302a','#1a1a1a','#f2f2f2','#2a4a8a'][(R()*4)|0]:null,drap:R()<0.18,ph:R()*6.28,e:0.4+R()*0.6,assis});}}}
if(!BQ2.stade){const C0=bqCouleurs(0),C1=bqCouleurs(1);for(let x=x0+6;x<x1-4;x+=10){const camp=x<BQ2.cx?0:1,C=camp?C1:C0;L.push({x:x+(R()-.5)*3,y:yt-6,camp,peau:PEAU[(R()*6)|0],chev:CHEV[(R()*6)|0],haut:R()<.5?C[(R()*C.length)|0]:'#e8e8e8',bas:BAS[(R()*5)|0],ph:R()*6.28,e:0.4+R()*0.6,drap:R()<.15,fond:1});}}
L.sort((a,b)=>a.y-b.y);return L;}
function bqGens(g,p,now){const joie=now<(BQ2.joie?BQ2.joie[p.camp]:0), decu=!joie&&now<(BQ2.joie?BQ2.joie[1-p.camp]:0)&&p.e>0.7;
const j=joie?Math.abs(Math.sin(now/115+p.ph))*3.2*p.e:0, x=p.x+(joie?0:Math.sin(now/900+p.ph)*0.35), y=p.y-j;
g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(p.x,p.y+0.5,4,1.4,0,0,7);g.fill();
if(!p.assis){g.fillStyle=p.bas;g.fillRect(x-2.6,y-4,2.2,4);g.fillRect(x+0.4,y-4,2.2,4);}
const b=p.assis?3:0;g.fillStyle=p.haut;g.fillRect(x-3.5,y-10+b,7,6.5);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-3.5,y-4.5+b,7,1);if(p.ech){g.fillStyle=p.ech;g.fillRect(x-3.5,y-10+b,7,1.6);}
g.fillStyle=p.haut;if(joie){g.fillRect(x-5.2,y-16+b,1.7,6.5);g.fillRect(x+3.5,y-16+b,1.7,6.5);g.fillStyle=p.peau;g.fillRect(x-5.2,y-17+b,1.7,1.7);g.fillRect(x+3.5,y-17+b,1.7,1.7);}
else if(decu){g.fillRect(x-5,y-13+b,1.6,4);g.fillRect(x+3.4,y-13+b,1.6,4);}
else{g.fillRect(x-5,y-9.5+b,1.6,5);g.fillRect(x+3.4,y-9.5+b,1.6,5);g.fillStyle=p.peau;g.fillRect(x-5,y-4.8+b,1.6,1.4);g.fillRect(x+3.4,y-4.8+b,1.6,1.4);}
g.fillStyle=p.peau;g.beginPath();g.arc(x,y-12.8+b,2.8,0,7);g.fill();g.fillStyle=p.chev;g.beginPath();g.arc(x,y-13.6+b,2.8,Math.PI,0);g.fill();
if(p.chap){g.fillStyle=p.chap;g.fillRect(x-3,y-16.4+b,6,2);g.fillRect(x-1,y-15+b,4.5,1);}
if(p.drap&&(joie||Math.sin(now/1700+p.ph)>0.6)){const fx=x+4.3,fy=y-24+b+(joie?Math.sin(now/90+p.ph)*1.5:0);g.fillStyle='#d8d8d8';g.fillRect(fx,fy,0.9,11);const w=Math.sin(now/120+p.ph)*1.2;g.save();g.translate(fx+1,fy);g.transform(1,w*0.08,0,1,0,0);bqMiniDrap(g,0,0,9,6,p.camp===0?'fr':((BQ2.adv&&BQ2.adv.d)||'fr'));g.restore();}}
function bqFoulePub(g,now){if(!BQ2.pub)BQ2.pub=bqPublic();for(const p of BQ2.pub)bqGens(g,p,now);}
/* ---- la fête : fumigènes et feux d'artifice ---- */
function bqCheer(ms,camp){camp=camp||0;const t=performance.now()+(ms||1500);BQ2.joie=BQ2.joie||[0,0];BQ2.joie[camp]=Math.max(BQ2.joie[camp],t);BQ2.cheer=Math.max(BQ2.cheer||0,t);try{jouer('foule');}catch(x){}bqSonApplaudir((ms||1500)/1000,Math.round((ms||1500)/40));}
function bqFumi(camp,n){if(!BQ2.pub)return;const L=BQ2.pub.filter(p=>p.camp===camp&&!p.fond),C=bqCouleurs(camp).concat(camp===0?['#c8102e']:[]),now=performance.now();BQ2.fx=BQ2.fx||[];
for(let i=0;i<n&&L.length;i++){const p=L[(Math.random()*L.length)|0];BQ2.fx.push({k:'emet',x:p.x+3,y:p.y-16,c:C[(Math.random()*C.length)|0],t0:now+i*220,dur:3200+Math.random()*1500,p});}}
function bqFeu(n,camp){const W=BQ2.W,now=performance.now(),C=bqCouleurs(camp||0).concat(['#ffd75a','#ffffff']);BQ2.fx=BQ2.fx||[];const yt=BQ2.cy-BQ_ZMAX*BQ2.sz;
for(let i=0;i<n;i++){const x=W*(0.12+Math.random()*0.76);BQ2.fx.push({k:'fusee',x,y:BQ2.H*0.62,tx:x+(Math.random()-.5)*60,ty:20+Math.random()*Math.max(60,yt*0.9+60),t0:now+i*(300+Math.random()*250),c:C[(Math.random()*C.length)|0],c2:C[(Math.random()*C.length)|0]});}}
try{SONS.boum={f:(t)=>{const v=V.gestes;souffle(t,0.35,180,60,0.8,0.16*v,'lowpass',0.5);souffle(t+0.05,0.5,3200,1500,1,0.04*v,'bandpass',0.5);}};}catch(x){}
function bqFxPas(dt,now){const F=BQ2.fx||[];const nv=[];
for(const f of F){if(now<f.t0){nv.push(f);continue;}
 if(f.k==='emet'){const age=now-f.t0;if(age<f.dur){const fin=age>f.dur-700?(f.dur-age)/700:1;f.acc=(f.acc||0)+dt*42*fin;while(f.acc>=1){f.acc--;const a=-Math.PI/2+(Math.random()-.5)*0.35,v=55+Math.random()*35;nv.push({k:'fumee',x:f.x+(Math.random()-.5)*2,y:f.y-2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r0:2.5+Math.random()*2,rot:Math.random()*6.28,vr:(Math.random()-.5)*1.2,v:(Math.random()*4)|0,c:f.c,t:0,life:3.2+Math.random()*1.8});}
  if(Math.random()<dt*18)nv.push({k:'etinf',x:f.x,y:f.y,vx:(Math.random()-.5)*40,vy:-30-Math.random()*45,t:0,life:0.35+Math.random()*0.35});nv.push(f);}continue;}
 if(f.k==='fumee'){f.t+=dt;const dmp=Math.exp(-dt*1.1);f.vx=f.vx*dmp+(BQ2.vent||8)*dt*(0.6+f.t*0.9);f.vy=f.vy*dmp-16*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;if(f.t<f.life)nv.push(f);continue;}
 if(f.k==='etinf'){f.t+=dt;f.vy+=120*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.t<f.life)nv.push(f);continue;}
 if(f.k==='fusee'){const k=(now-f.t0)/900;if(k<1){f.cx=f.x+(f.tx-f.x)*k;f.cy=f.y+(f.ty-f.y)*(1-Math.pow(1-k,2));nv.push(f);}
  else{const n=46;for(let i=0;i<n;i++){const a=i/n*6.28+Math.random()*0.1,v=55+Math.random()*75;nv.push({k:'etin',x:f.tx,y:f.ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:i%3?f.c:f.c2,t:0,life:1.2+Math.random()*0.6});}nv.push({k:'flash',x:f.tx,y:f.ty,t:0,c:f.c});try{jouer('boum');}catch(x){}vibrer(6);}continue;}
 if(f.k==='etin'){f.t+=dt;f.vx*=0.985;f.vy=f.vy*0.985+38*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.t<f.life)nv.push(f);continue;}
 if(f.k==='flash'){f.t+=dt;if(f.t<0.25)nv.push(f);continue;}}
BQ2.fx=nv;
/* l'ambiance suit le score : celui qui mène fait chanter ses supporters */
const ec=(BQ2.score?BQ2.score[0]-BQ2.score[1]:0);if(['vise','ia','attente','roule','vol'].indexOf(BQ2.phase)>=0&&Math.abs(ec)>=3&&now>(BQ2.ambT||0)){BQ2.ambT=now+6500+Math.random()*3000;bqFumi(ec>0?0:1,1);if(Math.abs(ec)>=6)bqCheer(1200,ec>0?0:1);}}
/* LES VOLUTES : chaque bouffée est un petit nuage épais, ombré dessous, éclairé dessus, aux bords effilochés */
function bqTeinte(c,f){const n=parseInt(c.slice(1),16),r=n>>16,g2=(n>>8)&255,b=n&255,m=v=>Math.round(v+(255-v)*f).toString(16).padStart(2,'0');return '#'+m(r)+m(g2)+m(b);}
function bqVolute(c,v){BQ2.volutes=BQ2.volutes||{};const cle=c+v;if(BQ2.volutes[cle])return BQ2.volutes[cle];const S=96,k=document.createElement('canvas');k.width=k.height=S;const q=k.getContext('2d');
const gris=(c2,f)=>{const n=parseInt(c2.slice(1),16),m=(v,w)=>Math.round(v+(w-v)*f).toString(16).padStart(2,'0');return '#'+m(n>>16,150)+m((n>>8)&255,146)+m(n&255,150);};const base=c.toLowerCase()==='#ffffff'?'#dcdad6':gris(c,0.28), clair=bqTeinte(base,0.5);let sd=v*977+13;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
for(let i=0;i<22;i++){const a=R()*6.28,d=R()*26,x=S/2+Math.cos(a)*d,y=S/2+Math.sin(a)*d*0.85,r=8+R()*15,gr=q.createRadialGradient(x-r*0.25,y-r*0.3,r*0.1,x,y,r);gr.addColorStop(0,clair);gr.addColorStop(0.55,base);gr.addColorStop(1,base+'00');q.globalAlpha=0.55;q.fillStyle=gr;q.beginPath();q.arc(x,y,r,0,7);q.fill();}
q.globalAlpha=1;q.globalCompositeOperation='source-atop';const sh=q.createLinearGradient(0,S*0.2,0,S);sh.addColorStop(0,'rgba(255,255,255,.18)');sh.addColorStop(0.5,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');q.fillStyle=sh;q.fillRect(0,0,S,S);
q.globalCompositeOperation='destination-out';for(let i=0;i<220;i++){const a=R()*6.28,d=24+R()*24;q.globalAlpha=0.35;q.beginPath();q.arc(S/2+Math.cos(a)*d,S/2+Math.sin(a)*d,1+R()*3,0,7);q.fill();}
return BQ2.volutes[cle]=k;}
function bqFx(g,now){const F=BQ2.fx;if(!F||!F.length)return;
for(const f of F)if(f.k==='fumee'){const k=f.t/f.life, r=f.r0+Math.sqrt(f.t)*15+f.t*9;g.globalAlpha=Math.min(1,f.t*5)*(k<0.3?0.62:0.62*(1-(k-0.3)/0.7));g.save();g.translate(f.x,f.y);g.rotate(f.rot);g.drawImage(bqVolute(f.c,f.v),-r,-r,2*r,2*r);g.restore();}g.globalAlpha=1;
g.save();g.globalCompositeOperation='lighter';
for(const f of F){if(f.k==='emet'&&now>=f.t0&&now-f.t0<f.dur){const fl=0.75+Math.random()*0.25, fc=bqTeinte(f.c,0.35);
  let gl=g.createRadialGradient(f.x,f.y,0,f.x,f.y,58);gl.addColorStop(0,fc+'66');gl.addColorStop(1,fc+'00');g.globalAlpha=fl*0.8;g.fillStyle=gl;g.fillRect(f.x-58,f.y-58,116,116);
  gl=g.createRadialGradient(f.x,f.y,0,f.x,f.y,14);gl.addColorStop(0,'#ffffff');gl.addColorStop(0.25,fc);gl.addColorStop(1,fc+'00');g.globalAlpha=fl;g.fillStyle=gl;g.fillRect(f.x-14,f.y-14,28,28);g.globalAlpha=1;
  g.fillStyle='#fff';g.beginPath();g.arc(f.x,f.y,1.6,0,7);g.fill();g.fillStyle='#3a3a3a';g.fillRect(f.x-0.6,f.y,1.3,5);}
 else if(f.k==='etinf'){g.globalAlpha=1-f.t/f.life;g.fillStyle='#ffe0a0';g.fillRect(f.x,f.y,1.3,1.3);g.globalAlpha=1;}
 else if(f.k==='fusee'&&f.cx!=null){g.fillStyle='#fff3c0';g.fillRect(f.cx-1,f.cy-1,2,3);g.fillStyle='rgba(255,200,120,.5)';g.fillRect(f.cx-0.5,f.cy+2,1,8);}
 else if(f.k==='etin'){const a=1-f.t/f.life;g.globalAlpha=a;g.fillStyle=f.c;g.fillRect(f.x-1,f.y-1,2.2,2.2);g.globalAlpha=a*0.4;g.fillRect(f.x-f.vx*0.04,f.y-f.vy*0.04,1.5,1.5);}
 else if(f.k==='flash'){const gl=g.createRadialGradient(f.x,f.y,0,f.x,f.y,50);gl.addColorStop(0,'rgba(255,240,200,'+(0.5*(1-f.t/0.25))+')');gl.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gl;g.fillRect(f.x-50,f.y-50,100,100);}}
g.globalAlpha=1;g.restore();}
/* LA NUIT : plus sombre, mais on voit le terrain — des guirlandes d'ampoules au-dessus */
function bqNuit(g,W,H,now){g.fillStyle='rgba(8,12,34,.5)';g.fillRect(0,0,W,H);const yt=BQ2.cy-BQ_ZMAX*BQ2.sz;
g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(BQ2.cx,BQ2.cy-BQ_ZMAX*BQ2.sz*0.5,20,BQ2.cx,BQ2.cy-BQ_ZMAX*BQ2.sz*0.5,H*0.55);gl.addColorStop(0,'rgba(255,200,120,.22)');gl.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
for(let r=0;r<4;r++){const y0=yt+30+r*(H-yt-200)/3;g.strokeStyle='rgba(40,40,40,.6)';g.lineWidth=0.8;g.beginPath();for(let k=0;k<=20;k++){const t=k/20,x=t*W,y=y0+Math.sin(Math.PI*t)*14;k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
 for(let k=1;k<20;k++){const t=k/20,x=t*W,y=y0+Math.sin(Math.PI*t)*14+3,c=['#ffe8a0','#ff9a7a','#9ad0ff','#b8ff9a'][(k+r)%4],a=0.75+Math.sin(now/300+k*1.3+r)*0.25;const gg=g.createRadialGradient(x,y,0,x,y,12);gg.addColorStop(0,c);gg.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a*0.5;g.fillStyle=gg;g.fillRect(x-12,y-12,24,24);g.globalAlpha=1;g.fillStyle=c;g.beginPath();g.arc(x,y,1.6,0,7);g.fill();}}
g.restore();}

/* =====================================================================
   LE SON DE LA PÉTANQUE : le clac de l'acier, le gravier qui crisse, la
   boule qui roule, le public qui murmure, se tait pendant le lancer,
   applaudit. Tout est synthétisé, rien à télécharger.
   ===================================================================== */
function bqSon(fn){if(!SON_PRET)return;if(typeof REG!=='undefined'&&REG.sons===false)return;try{fn(A().currentTime+0.01);}catch(x){}}
function bqTinte(t,f,dur,vol){const c=A(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+0.002);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);vers(g,0.35);o.start(t);o.stop(t+dur+0.05);}
function bqSonChoc(f){f=Math.max(0.15,Math.min(1,f));bqSon(t=>{const v=V.gestes*f;const d=0.92+Math.random()*0.16;
 [[2380,0.24,0.13],[3460,0.17,0.09],[4280,0.11,0.06],[1740,0.32,0.05],[2960,0.14,0.05]].forEach(([fr,du,vo])=>bqTinte(t,fr*d,du*(0.6+f*0.6),vo*v));
 souffle(t,0.018,3800,3000,1.2,0.12*v,'bandpass',0.2);});}
function bqSonChute(h){const f=Math.min(1,0.35+h*0.5);bqSon(t=>{const v=V.gestes*f;souffle(t,0.09,260,110,0.8,0.22*v,'lowpass',0.25);for(let i=0;i<7;i++)souffle(t+i*0.011+Math.random()*0.006,0.03,1700+Math.random()*1700,900,1.3,0.06*v*(1-i/9),'bandpass',0.15);});}
function bqSonRoule(sp){const f=Math.min(1,sp/2);bqSon(t=>{const v=V.gestes*f;for(let i=0;i<3;i++)souffle(t+i*0.022,0.03,1300+Math.random()*1400,900,1.1,0.03*v,'bandpass',0.05);});}
function bqSonPlanche(){bqSon(t=>{const v=V.gestes;souffle(t,0.12,520,260,1.4,0.2*v,'bandpass',0.3);bqTinte(t,310,0.12,0.06*v);});}
function bqSonCaillou(){bqSon(t=>{const v=V.gestes;souffle(t,0.02,3200,2600,1.5,0.06*v,'bandpass',0.1);bqTinte(t,3100,0.05,0.025*v);});}
function bqSonApplaudir(dur,n){bqSon(t=>{const v=V.gestes;for(let i=0;i<n;i++){const tt=t+Math.random()*dur;souffle(tt,0.016,2400+Math.random()*1600,1800,1.8,0.045*v*(0.5+Math.random()*0.5),'bandpass',0.3);}});}
function bqSonOoh(){bqSon(t=>{const v=V.gestes;for(const [f0,f1] of [[560,420],[720,540],[480,360]])souffle(t+Math.random()*0.1,1.3,f0,f1,4,0.05*v,'bandpass',0.6);});}
function bqSonMetre(){bqSon(t=>{const v=V.gestes;souffle(t,0.35,4200,2400,2,0.05*v,'bandpass',0.1);bqTinte(t+0.36,2200,0.06,0.04*v);});}
function bqFouleAmb(now){if(BQ2.phase==='menu'||now<(BQ2.ambSon||0))return;BQ2.ambSon=now+1300;const calme=BQ2.hush||['jauge','vol','mesure'].indexOf(BQ2.phase)>=0;
bqSon(t=>{const v=V.gestes*(calme?0.25:1);souffle(t,1.9,560+Math.random()*80,500,0.6,0.045*v,'bandpass',0.6);if(!calme&&Math.random()<0.6)souffle(t+Math.random(),0.35,900+Math.random()*500,700,3,0.03*v,'bandpass',0.5);});}
/* =====================================================================
   LES JOUEURS : ton personnage, avec ta tenue, dans le cercle ; l'adversaire
   attend sur le côté, puis prend sa place. Ils s'accroupissent pour pointer,
   prennent leur élan pour tirer. L'arbitre vient mesurer quand c'est serré.
   ===================================================================== */
function bqApAdv(nom){let h=0;for(const ch of String(nom||''))h=(h*31+ch.charCodeAt(0))>>>0;const r=k=>{h=(h*1103515245+12345)>>>0;return h%k;};
if(nom==='Madeleine')return Object.assign({},DEF_AP,{peau:1,cheveux:9,coiffe:9,barbe:0,chapeau:0,veste:9,pantalon:2,corps:1,yeux:1});
return Object.assign({},DEF_AP,{peau:r(8),cheveux:r(10),coiffe:r(15),barbe:r(8),chapeau:r(7),veste:r(13),pantalon:r(8),corps:r(5),yeux:r(7)});}
const BQ_ARBITRE=Object.assign({},DEF_AP,{peau:1,cheveux:7,coiffe:20,barbe:7,chapeau:6,veste:7,pantalon:1,sac:0,corps:4,yeux:5});
function bqPersoCv(ap,dir,pas,bouge){BQ2.persos=BQ2.persos||new Map();const cle=JSON.stringify(ap)+dir+(bouge?Math.floor(pas*2)%8:'r');let c=BQ2.persos.get(cle);
if(!c){if(BQ2.persos.size>80)BQ2.persos.clear();c=document.createElement('canvas');c.width=64;c.height=80;try{sprite(c.getContext('2d'),32,70,ap,dir,pas,bouge);}catch(x){}BQ2.persos.set(cle,c);}return c;}
function bqActif(){const ph=BQ2.phase;if(ph==='coch'||ph==='vise'||ph==='jauge')return 0;if(ph==='ia')return 1;return BQ2.lanceur==null?0:BQ2.lanceur;}
function bqJoueursPas(dt){if(!BQ2.pos)BQ2.pos=[{x:0,z:-0.12},{x:1.5,z:-0.4}];const a=bqActif();
for(let i=0;i<2;i++){const P=BQ2.pos[i],cx=i===a?0:(i===0?-1.5:1.5),cz=i===a?-0.12:-0.4,dx=cx-P.x,dz=cz-P.z,d=Math.hypot(dx,dz),v=2.4*dt;
 if(d>0.01){const k=Math.min(1,v/d);P.x+=dx*k;P.z+=dz*k;P.bouge=true;P.pas=(P.pas||0)+dt*6;P.dir=Math.abs(dx)>Math.abs(dz)?(dx>0?'droite':'gauche'):'haut';}
 else{P.bouge=false;const n=performance.now();if(i===a)P.dir='haut';else{if(!P.lk||n>P.lk){P.lk=n+1800+Math.random()*3500;P.dir=Math.random()<0.55?'haut':(Math.random()<0.5?'gauche':'droite');}}}}}
function bqDessinPerso(g,ap,x,z,o){const [X,Y]=bqS(x,z),k=Math.max(0.9,Math.min(1.25,BQ2.sx/50)),sy=o.sy||1;const c=bqPersoCv(ap,o.dir||'haut',o.pas||0,!!o.bouge);
g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(X,Y+1,11*k,4*k,0,0,7);g.fill();g.save();g.translate(X+(o.dx||0),Y+(o.dy||0));g.scale(k,k*sy);g.drawImage(c,-32,-70);g.restore();
return [X,Y,k];}
function bqJoueurs(g,now){if(!BQ2.pos)return;const a=bqActif(),aps=[e&&e.ap?e.ap:DEF_AP,BQ2.apAdv||(BQ2.apAdv=bqApAdv(BQ2.adv&&BQ2.adv.nom))],L=[];
for(let i=0;i<2;i++)L.push(i);L.sort((p,q)=>BQ2.pos[q].z-BQ2.pos[p].z);
for(const i of L){const P=BQ2.pos[i];let sy=1,dy=0;
 if(i===a&&BQ2.anim0){const t=(now-BQ2.anim0)/1000;if(t<0.75){const ph=Math.sin(Math.min(1,t/0.75)*Math.PI);if(BQ2.animG==='tir'){dy=-7*ph;sy=1-0.05*ph;}else{sy=1-0.2*ph;dy=2*ph;}}}
 if(i===a&&BQ2.phase==='jauge')sy=0.94+Math.sin(now/180)*0.02;
 const Rc=BQ2.reac&&BQ2.reac[i],rt=Rc?(now-Rc.t0)/1000:99,dur=Rc&&(Rc.type==='gagne'||Rc.type==='perd')?3.6:1.6;let ox=0;
 if(Rc&&rt<dur){if(Rc.type==='decu'||Rc.type==='perd'){ox=Math.sin(rt*24)*1.3*(1-rt/dur);sy*=0.95;dy+=1.5;}else dy-=Math.abs(Math.sin(rt*7.5))*7*(Rc.type==='gagne'?1:(1-rt/dur));}
 const [X,Y,k]=bqDessinPerso(g,aps[i],P.x,P.z,{dir:P.dir,pas:P.pas,bouge:P.bouge,sy,dy,dx:ox});
 if(Rc&&rt<dur+0.6)bqBulle(g,X,Y-60*k+Math.min(0,dy),Rc.txt,Rc.type==='carreau'||Rc.type==='gagne'?'#ffe066':'#fff');
 const tient=i===a&&!P.bouge&&(BQ2.phase==='vise'||BQ2.phase==='jauge'||BQ2.phase==='coch'||(BQ2.phase==='ia'&&!BQ2.vol));
 if(tient){const hx=X+9*k,hy=Y-24*k*sy;if(BQ2.phase==='coch'||(BQ2.phase==='jauge'&&BQ2.jfor==='coch')||(BQ2.phase==='ia'&&!BQ2.coch))PT_LIB.cochonnet(g,hx,hy,Math.max(2.4,BQ_RC*BQ2.sx*1.2));else bqBoule(g,hx,hy,BQ_RB*BQ2.sx*0.95,i===0?BQ2.maB:BQ_ADV);}}}
/* ---- LA MESURE ---- */
function bqBesoinMesure(fin){const a=bqMeilleur(0),b=bqMeilleur(1);if(a===Infinity||b===Infinity)return false;return Math.abs(a-b)<(fin?0.03:0.02);}
function bqApres(){const fin=!BQ2.reste[0]&&!BQ2.reste[1], cle=bqMeilleur(0).toFixed(4)+'|'+bqMeilleur(1).toFixed(4);
if(bqBesoinMesure(fin)&&BQ2.mesCle!==cle){BQ2.mesCle=cle;return bqMesurer();}bqTour();}
function bqMesurer(){const tri=t=>bqVivantes(t).sort((p,q)=>bqDist(p)-bqDist(q))[0];const A0=tri(0),B0=tri(1),c=BQ2.coch;
BQ2.mes={t0:performance.now(),A:A0,B:B0,g:bqDist(A0)<bqDist(B0)?0:1,da:bqDist(A0)-BQ_RB-BQ_RC,db:bqDist(B0)-BQ_RB-BQ_RC,dep:{x:2.15,z:c.z-1.3},arr:{x:Math.max(-1.7,Math.min(1.7,c.x+0.24)),z:c.z-0.3}};
BQ2.phase='mesure';BQ2.hush=true;bqGestes();bqPill('C’est serré… l’arbitre sort le mètre');bqSonOoh();}
function bqMesurePas(now){const M=BQ2.mes;if(!M)return;const t=now-M.t0;
if(t>1250&&!M.s1){M.s1=1;bqSonMetre();}if(t>2250&&!M.s2){M.s2=1;bqSonMetre();}
if(t>3700&&!M.verdict){M.verdict=1;const moi=M.g===0,N=BQ2.adv.nom;BQ2.hush=false;bqAnn(moi?'POINT POUR TOI !':'POINT POUR '+N.toUpperCase(),moi?'#9fe8b8':'#ffb0a0',true);
 const fmt=d=>(Math.max(0,d)*100).toFixed(1).replace('.',',')+' cm';bqPill('Mesuré : toi '+fmt(M.da)+' · '+N+' '+fmt(M.db));bqCheer(2200,M.g);bqSonApplaudir(1.8,moi?70:40);vibrer(moi?[14,30,14]:10);if(moi){bqFumi(0,2);}}
if(t>5300){BQ2.mes=null;BQ2.phase='attente';bqTour();}}
function bqMesureDessin(g,now){const M=BQ2.mes;if(!M)return;const t=now-M.t0,c=BQ2.coch;
/* l'arbitre arrive, s'agenouille, repart */
let p,bouge=false,sy=1,dir='haut';if(t<1150){const k=t/1150;p={x:M.dep.x+(M.arr.x-M.dep.x)*k,z:M.dep.z+(M.arr.z-M.dep.z)*k};bouge=true;dir='gauche';}
else if(t<4600){p=M.arr;sy=0.8;}else{const k=Math.min(1,(t-4600)/700);p={x:M.arr.x+(M.dep.x-M.arr.x)*k,z:M.arr.z+(M.dep.z-M.arr.z)*k};bouge=true;dir='droite';}
/* le ruban, du cochonnet à chaque boule */
const ruban=(B,t0,t1)=>{if(t<t0)return;const k=Math.min(1,(t-t0)/(t1-t0)),[cX,cY]=bqS(c.x,c.z),[bX,bY]=bqS(B.x,B.z),ex=cX+(bX-cX)*k,ey=cY+(bY-cY)*k;
 g.strokeStyle='#3a2a10';g.lineWidth=3.6;g.beginPath();g.moveTo(cX,cY);g.lineTo(ex,ey);g.stroke();g.strokeStyle='#ffd23a';g.lineWidth=2.2;g.beginPath();g.moveTo(cX,cY);g.lineTo(ex,ey);g.stroke();
 const L=Math.hypot(ex-cX,ey-cY);g.fillStyle='#3a2a10';for(let d=3;d<L;d+=3){const q=d/L;g.fillRect(cX+(ex-cX)*q-0.4,cY+(ey-cY)*q-0.4,0.8,0.8);}
};
ruban(M.A,1150,2150);ruban(M.B,2200,3200);
bqDessinPerso(g,BQ_ARBITRE,p.x,p.z,{dir,bouge,pas:t/160,sy,dy:sy<1?3:0});}
function bqMesureLoupe(g,now){const M=BQ2.mes;if(!M)return;const t=now-M.t0;if(t<1100||t>5000)return;const [X,Y]=bqS(BQ2.coch.x,BQ2.coch.z),lr=Math.min(92,BQ2.W*0.24),z=3,lx=BQ2.W/2,ly=Y<BQ2.H*0.45?Math.min(BQ2.H*0.6,Y+lr+70):Math.max(BQ2.haut+lr+10,Y-lr-70),dp=BQ2.dpr,al=Math.min(1,(t-1100)/250,(5000-t)/250);
g.save();g.globalAlpha=al;g.beginPath();g.arc(lx,ly,lr,0,7);g.clip();g.imageSmoothingEnabled=false;g.drawImage(BQ2.cv,(X-lr/z)*dp,(Y-lr/z)*dp,2*lr/z*dp,2*lr/z*dp,lx-lr,ly-lr,2*lr,2*lr);g.restore();
g.save();g.globalAlpha=al;const mp=(x,z)=>{const [a,b]=bqS(x,z);return [lx+(a-X)*z0,ly+(b-Y)*z0];},z0=z;
for(const B of [M.A,M.B]){const fin=B===M.A?1150+1000:2200+1000;if(t<fin)continue;const d=B===M.A?M.da:M.db,txt=(Math.max(0,d)*100).toFixed(1).replace('.',',')+' cm',[bx,by]=mp(B.x,B.z),gagne=t>3700&&((B===M.A)===(M.g===0));
 if(gagne){g.strokeStyle=M.g===0?'#ffd75a':'#ff9a7a';g.lineWidth=3;g.beginPath();g.arc(bx,by,BQ_RB*BQ2.sx*z0+5+Math.sin(now/120)*1.5,0,7);g.stroke();}
 g.font='800 12px "Baloo 2",sans-serif';const w=g.measureText(txt).width+12;g.fillStyle=gagne?'#4fb83e':'rgba(20,14,8,.85)';g.beginPath();g.roundRect(bx-w/2,by+BQ_RB*BQ2.sx*z0+4,w,18,9);g.fill();g.fillStyle='#fff';g.textAlign='center';g.fillText(txt,bx,by+BQ_RB*BQ2.sx*z0+17);g.textAlign='left';}
g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.arc(lx,ly,lr,0,7);g.stroke();g.fillStyle='rgba(20,14,8,.85)';g.beginPath();g.roundRect(lx-44,ly+lr-8,88,20,10);g.fill();g.fillStyle='#ffd23a';g.font='800 11px "Baloo 2",sans-serif';g.textAlign='center';g.fillText('📏 LA MESURE',lx,ly+lr+6);g.textAlign='left';g.restore();}

/* =====================================================================
   DES PERSONNAGES VIVANTS : chacun réagit à ce qui se passe, en bulle,
   avec l'accent. Celui qui attend regarde autour de lui.
   ===================================================================== */
const BQ_REPL={joie:['Ouiii !','Et voilà !','Qué boule !','Té, vé !','Allez !','Dedans !'],carreau:['CARREAU !','Boum !','Dans le mille !'],decu:['Peuchère…','Mais non…','Oh fan…','Pas possible…','Aïe aïe aïe…'],
chapeau:['Boudu…','Pas mal, petit…','Hmm…','Joli…','Chapeau.'],moque:['Hé hé !','Tant pis pour toi.','Dommage !'],gagne:['On a gagné !','Champion !','Merci le public !'],perd:['Je reviendrai…','Bien joué, va.','La prochaine fois…']};
const BQ_MAD={joie:['Hé hé !','Pas mal pour une mamie, hein ?','Alors, petit ?'],moque:['Il faut manger de la soupe !','Hé hé, raté !'],gagne:['Ça, c’est Madeleine !'],perd:['Tu as de la chance…']};
function bqReac(i,type,proba){if(proba!=null&&Math.random()>proba)return;const adv=i===1&&BQ2.adv&&BQ2.adv.nom==='Madeleine';const L=(adv&&BQ_MAD[type])||BQ_REPL[type]||BQ_REPL.joie;
BQ2.reac=BQ2.reac||[null,null];BQ2.reac[i]={type,t0:performance.now(),txt:L[(Math.random()*L.length)|0]};}
function bqBulle(g,X,Y,txt,c){g.font='800 11px "Baloo 2",sans-serif';const w=g.measureText(txt).width+14,h=20,x=Math.max(4,Math.min(BQ2.W-w-4,X-w/2)),y=Y-h;
g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.roundRect(x+1,y+2,w,h,10);g.fill();g.fillStyle=c||'#fff';g.strokeStyle='#3a2410';g.lineWidth=1.5;g.beginPath();g.roundRect(x,y,w,h,10);g.fill();g.stroke();
g.beginPath();g.moveTo(X-4,y+h-0.5);g.lineTo(X,y+h+6);g.lineTo(X+4,y+h-0.5);g.fill();g.beginPath();g.moveTo(X-4,y+h);g.lineTo(X,y+h+6);g.lineTo(X+4,y+h);g.stroke();
g.fillStyle='#3a2410';g.textAlign='center';g.fillText(txt,x+w/2,y+14);g.textAlign='left';}
/* ---- LA FICHE DU JOUEUR : tout se compte ici ---- */
function bqStats(){try{return Object.assign({parties:0,victoires:0,menes:0,menesG:0,points:0,pointsR:0,sumD:0,nD:0,tirs:0,tirsR:0,biberons:0,fannyD:0,fannyR:0,serie:0,serieMax:0,mondialMax:0,terr:{}},JSON.parse(localStorage.getItem('bdl.pq.fiche')||'{}'));}catch(x){return {parties:0,victoires:0,menes:0,menesG:0,points:0,pointsR:0,sumD:0,nD:0,tirs:0,tirsR:0,biberons:0,fannyD:0,fannyR:0,serie:0,serieMax:0,mondialMax:0,terr:{}};}}
function bqStat(f){const s=bqStats();try{f(s);localStorage.setItem('bdl.pq.fiche',JSON.stringify(s));}catch(x){}}
/* après chaque boule : on juge, on compte, on fait réagir */
function bqJuger(){const C=BQ2.coup, ma=BQ2.boules[BQ2.boules.length-1], t0=performance.now();const r=bqJuger0();if(!C||C.coch)return r;
const A=BQ2.ann&&BQ2.ann.t0>=t0-5?BQ2.ann.txt:'', i=C.t, o=1-i;
const carreau=A.indexOf('CARREAU')===0, chasse=A.indexOf('CHASS')>=0, rate=A==='MANQUÉE'||A==='TOUCHÉE…', morte=A==='BOULE MORTE', bib=A==='BIBERON !', point=A.indexOf('POINT')>=0&&A.indexOf('POINT POUR')<0, court=A==='PAS ASSEZ PRÈS';
if(carreau){bqReac(i,'carreau');bqReac(o,'chapeau',0.8);}else if(bib){bqReac(i,'joie');bqReac(o,'chapeau',0.6);}else if(chasse||point){bqReac(i,'joie',0.85);bqReac(o,'decu',0.35);}
else if(rate||morte){bqReac(i,'decu',0.85);bqReac(o,'moque',0.3);}else if(court){bqReac(i,'decu',0.5);}
if(i===0)bqStat(s=>{if(C.geste==='tir'){s.tirs++;if(carreau||chasse)s.tirsR++;}else{s.points++;if(ma&&!ma.morte&&BQ2.coch){const d=Math.max(0,bqDist(ma)-BQ_RB-BQ_RC);s.sumD+=d;s.nD++;if(d<0.15)s.pointsR++;}}if(bib)s.biberons++;});
return r;}
function bqCategorie(s){const t=mondTitres();if(t>=3||s.victoires>=60)return ['ÉLITE','#c8541e'];if(t>=1||s.victoires>=25)return ['HONNEUR','#7a4ab8'];if(s.victoires>=8)return ['PROMOTION','#2f7ab8'];return ['DÉBUTANT','#4f8a3a'];}
function bqFiche(){const s=bqStats(),C=pqCompteurs(),[cat,cc]=bqCategorie(s),pct=(a,b)=>b?Math.round(100*a/b):0,num=String(((e&&e.id)||'0').split('').reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%1000000).padStart(6,'0');
const MM=['—','Quarts de finale','Demi-finale','Finale','Champion 🏆'][Math.min(4,s.mondialMax|0)];
let fav='—',fv=-1;for(const [k,v] of Object.entries(s.terr||{}))if(v.v>fv){fv=v.v;const T=PQ_TERRAINS.find(x=>x.c===k);fav=T?T.nom:k;}
const barre=(n,v,txt)=>'<div class="fl"><span>'+n+'</span><i><u style="width:'+v+'%"></u></i><b>'+txt+'</b></div>';
let h='<div class="tete"><button class="rt" data-go="accueil">‹</button><h2><small>LE BOULODROME</small>Ma fiche</h2></div>';
h+='<div class="lic"><div class="lh">FÉDÉRATION DES BOULISTES DU PORT<small>LICENCE N° '+num+' · SAISON 2026</small></div><div class="lb"><canvas id="ficheAv" width="120" height="150"></canvas><div class="li"><b>'+echapperT((e&&e.pseudo)||'Toi')+'</b><span class="cat" style="background:'+cc+'">'+cat+'</span>'
+'<div class="lm">'+bqDrap('fr')+' Marseille</div><div class="lm">🏆 '+C.titres+' titre'+(C.titres>1?'s':'')+' · meilleur Mondial : '+MM+'</div><div class="lm">Boule : '+echapperT(pqMaBoule().nom)+'</div></div></div></div>';
h+='<div class="carte"><span class="rib">MES PARTIES</span><div class="gros4"><div><b>'+s.parties+'</b>parties</div><div><b>'+s.victoires+'</b>victoires</div><div><b>'+pct(s.victoires,s.parties)+'%</b>réussite</div><div><b>'+s.serieMax+'</b>meilleure série</div></div>'
+'<p style="margin-top:8px">Série en cours : <b>'+s.serie+'</b> · Mènes gagnées : <b>'+s.menesG+'</b> / '+s.menes+' · Terrain fétiche : <b>'+echapperT(fav)+'</b></p></div>';
h+='<div class="carte"><span class="rib">MON JEU</span>'+barre('Pointe',pct(s.pointsR,s.points),pct(s.pointsR,s.points)+'%')+barre('Tir',pct(s.tirsR,s.tirs),pct(s.tirsR,s.tirs)+'%')
+'<p style="margin-top:8px">Au point, en moyenne à <b>'+(s.nD?Math.round(100*s.sumD/s.nD):'—')+' cm</b> du cochonnet ('+s.points+' boules pointées, '+s.tirs+' tirées)</p>'
+'<div class="gros4" style="margin-top:10px"><div><b>'+C.carreaux+'</b>carreaux</div><div><b>'+s.biberons+'</b>biberons</div><div><b>'+s.fannyD+'</b>fanny données</div><div><b>'+s.fannyR+'</b>fanny reçues</div></div></div>';
bqMenu(h);
const cv=$('ficheAv');if(cv){const g=cv.getContext('2d');g.imageSmoothingEnabled=false;const sp=bqPersoCv(e&&e.ap?e.ap:DEF_AP,'bas',0,false);g.fillStyle='rgba(0,0,0,.15)';g.beginPath();g.ellipse(60,138,30,7,0,0,7);g.fill();g.drawImage(sp,-36,-74,192,240);}}

let PQ_T=0;
function bqBoucle(now){if(!BQ2.ouvert)return;BQ2.anim=requestAnimationFrame(bqBoucle);const dt=Math.min(0.05,(now-(PQ_T||now))/1000);PQ_T=now;
if(BQ2.phase==='menu')return;
if(BQ2.phase==='intro'&&now-BQ2.introT>2900)bqMene();
if(BQ2.phase==='vol'){const V=BQ2.vol,k=(now-V.t0)/1000/V.T;if(k>=1){let vx=V.vx,vz=V.vz;
 /* tombée sur un caillou : rebond imprévu */ if(BQ2.rel.P.some(p=>Math.hypot(p.x-V.lx,p.z-V.lz)<0.1)){const an=(Math.random()-.5)*1.6,c=Math.cos(an),s=Math.sin(an);const x=vx;vx=x*c-vz*s;vz=x*s+vz*c;}
 const o={t:V.t,x:V.lx,z:V.lz,vx,vz,r:V.coch?BQ_RC:BQ_RB,m:V.coch?0.25:1};if(V.coch)BQ2.coch=o;else BQ2.boules.push(o);
 BQ2.vol=null;BQ2.phase='roule';const [X,Y]=bqS(V.lx,V.lz);BQ2.poussiere={x:X,y:Y,t:now,f:Math.min(1.5,V.h)};vibrer(10);bqSonChute(V.h);}}
if(BQ2.phase==='roule'){if(now>(BQ2.rouleT||0)){BQ2.rouleT=now+85;let m=0;for(const q of [BQ2.coch,...BQ2.boules])if(q&&!q.morte)m=Math.max(m,Math.hypot(q.vx,q.vz));if(m>0.15)bqSonRoule(m);}let b=false;for(let i=0;i<6;i++)b=bqPhys(dt/6)||b;if(!b){BQ2.phase='attente';setTimeout(()=>{if(!BQ2.ouvert||BQ2.phase!=='attente')return;
 if(BQ2.coch&&BQ2.coch.morte&&BQ2.boules.length){bqAnn('COCHONNET MORT','#ffd0a0',true);BQ2.reste=[0,0];BQ2.boules.forEach(q=>q.morte=true);setTimeout(()=>{if(BQ2.ouvert)bqFinMene();},900);return;}
 const ok=bqJuger();if(ok===false)return;setTimeout(()=>{if(BQ2.ouvert&&BQ2.phase==='attente')bqApres();},BQ2.ann?650:250);},300);}}
if(BQ2.phase==='compte')bqCompte(now);
if(BQ2.phase==='mesure')bqMesurePas(now);bqJoueursPas(dt);bqFouleAmb(now);
bqCamPas(dt);bqFxPas(dt,now);
for(const c of BQ2.confettis){c.t+=dt;c.vy+=600*dt;c.vx*=0.99;c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=dt*8;}BQ2.confettis=BQ2.confettis.filter(c=>c.t<3&&c.y<BQ2.H+20);
bqDessin(now);}
/* le sable du terrain, avec son relief éclairé */
function bqTexTerrain(){const sx=BQ2.sx,sz=BQ2.sz,T=BQ2.T, zb=(BQ2.H-BQ2.cy)/sz+0.2, zt=BQ2.cy/sz, tw=Math.ceil(4*sx/2), th=Math.ceil((zb+zt)*sz/2);
const c=document.createElement('canvas');c.width=tw;c.height=th;const g=c.getContext('2d'),im=g.createImageData(tw,th),d=im.data;
const P=(BQ_PAL[T.c]||T.grain).map(c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]);
for(let j=0;j<th;j++){const z=zt-(j*2)/sz;for(let i=0;i<tw;i++){const x=-2+(i*2)/sx, n=bqHh(i,j,51), C=P[Math.min(P.length-1,(n*P.length)|0)];
 const [gx,gz]=bqGrad(x,z), sh=(0.7*gx-0.7*gz)*700+bqHauteur(x,z)*500+(bqHh(i>>2,j>>2,52)-.5)*14;const k=(j*tw+i)*4;d[k]=C[0]+sh;d[k+1]=C[1]+sh;d[k+2]=C[2]+sh*0.85;d[k+3]=255;}}
g.putImageData(im,0,0);for(let i=0;i<tw*th/30;i++){g.fillStyle=bqHh(i,3,53)<.5?'rgba(255,250,235,.7)':'rgba(70,55,35,.45)';g.fillRect(bqHh(i,4,53)*tw|0,bqHh(i,5,53)*th|0,1,1);}
if(T.c==='platanes')for(let i=0;i<34;i++){g.fillStyle='rgba(30,50,20,.16)';g.beginPath();g.ellipse(bqHh(i,7,9)*tw,bqHh(i,8,9)*th,5+bqHh(i,9,9)*12,3+bqHh(i,1,9)*6,0,0,7);g.fill();}
if(T.c==='place'){g.strokeStyle='rgba(120,60,30,.18)';g.lineWidth=1;for(let i=0;i<46;i++){const cx=bqHh(i,2,4)*tw,cy=bqHh(i,3,4)*th,r=10+bqHh(i,4,4)*26;g.beginPath();g.arc(cx,cy,r,-0.6,0.6);g.stroke();}}
if(T.c==='port'||T.c==='nuit')for(let i=0;i<tw*th/90;i++){g.fillStyle=bqHh(i,6,3)<.5?'#6e685e':'#e8e2d4';g.fillRect(bqHh(i,7,3)*tw|0,bqHh(i,8,3)*th|0,2,1);}
BQ2.texZt=zt;return c;}
function bqTexFond_v1(){const W=BQ2.W,H=BQ2.H,c=document.createElement('canvas');c.width=Math.ceil(W/3);c.height=Math.ceil(H/3);const g=c.getContext('2d'),im=g.createImageData(c.width,c.height),d=im.data;
const V=BQ2.stade?[[22,40,84],[26,46,94],[18,34,74]]:[[104,150,66],[116,162,74],[96,140,60]];
for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const n=bqHh(x,y,10),C=V[n<.4?0:n<.78?1:2],o=(bqHh(x>>3,y>>3,5)-.5)*14,k=(y*c.width+x)*4;d[k]=C[0]+o;d[k+1]=C[1]+o;d[k+2]=C[2]+o*.6;d[k+3]=255;}
g.putImageData(im,0,0);if(!BQ2.stade)for(let i=0;i<c.width*c.height/60;i++){g.fillStyle=['#f0ecdc','#ecd65a','#dc7882','#aaa0dc'][i%4];g.fillRect(bqHh(i,1,22)*c.width|0,bqHh(i,2,22)*c.height|0,1,1);}return c;}
function bqDecorSol_v1(g,s,sz,now){const T=BQ2.T||{},rel=BQ2.rel;
for(const q of rel.Z||[]){if(q.t==='flaque'){const [X,Y]=bqS(q.x,q.z),rx=q.rx*s,ry=q.rz*sz;g.fillStyle='rgba(70,60,45,.35)';g.beginPath();g.ellipse(X,Y+1,rx*1.08,ry*1.12,0,0,7);g.fill();
  const gr=g.createLinearGradient(X,Y-ry,X,Y+ry);gr.addColorStop(0,'#8aa4b8');gr.addColorStop(1,'#56707e');g.fillStyle=gr;g.beginPath();for(let a=0;a<6.3;a+=0.35){const k=1+Math.sin(a*3+q.x*7)*0.08;g.lineTo(X+Math.cos(a)*rx*k,Y+Math.sin(a)*ry*k);}g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(X-rx*0.5,Y-ry*0.4,rx*0.5,1.5);g.fillRect(X+rx*0.1,Y-ry*0.1,rx*0.3,1.2);
  const k=((now/1600)+q.z)%1;g.strokeStyle='rgba(255,255,255,'+(0.45*(1-k))+')';g.lineWidth=1;g.beginPath();g.ellipse(X+rx*0.2,Y,rx*0.6*k,ry*0.6*k,0,0,7);g.stroke();}
 else{const [X0,Y1]=bqS(q.x0,q.z1),[X1,Y0]=bqS(q.x1,q.z0);g.fillStyle='rgba(60,50,40,.3)';g.fillRect(X0-1,Y1-1,X1-X0+2,Y0-Y1+3);const pw=s*0.2,ph=sz*0.2;
  for(let y=Y1,r=0;y<Y0;y+=ph,r++)for(let x=X0-(r%2)*pw/2;x<X1;x+=pw){const xa=Math.max(X0,x),xb=Math.min(X1,x+pw-1);if(xb<=xa)continue;g.fillStyle=['#9a958c','#aaa59a','#8c877e','#b4afa4'][(bqHh(x|0,y|0,4)*4)|0];g.fillRect(xa,y,xb-xa,Math.min(ph-1,Y0-y));g.fillStyle='rgba(255,255,255,.18)';g.fillRect(xa,y,xb-xa,1);}}}
for(const pts of rel.Rc||[]){const S=pts.map(([x,z])=>bqS(x,z));g.lineCap='round';g.lineJoin='round';for(const [w,c] of [[s*0.075+3,'rgba(40,25,10,.35)'],[s*0.075,'#6a4426'],[s*0.03,'#9a6a40']]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();S.forEach(([X,Y],i)=>i?g.lineTo(X,Y+(w>s*0.075?2:0)):g.moveTo(X,Y+(w>s*0.075?2:0)));g.stroke();}g.lineCap='butt';}
for(const f of rel.F||[]){const [X,Y]=bqS(f.x,f.z);g.save();g.translate(X,Y);g.rotate(f.a);g.fillStyle=f.c;g.beginPath();g.ellipse(0,0,4,2,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-4,0,8,0.8);g.restore();}
if(T.c==='champ'){g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;const [xa,ya]=bqS(-1.85,BQ_ZMAX),[xb,yb]=bqS(1.85,-0.6);g.strokeRect(xa,ya,xb-xa,yb-ya);
 g.setLineDash([8,6]);for(const z of [6,10]){const [p,q]=bqS(-1.85,z),[r]=bqS(1.85,z);g.beginPath();g.moveTo(p,q);g.lineTo(r,q);g.stroke();}g.setLineDash([]);
 g.fillStyle='rgba(255,255,255,.8)';g.font='400 22px "Lilita One",sans-serif';g.textAlign='center';const [mx,my]=bqS(0,3.5);g.fillText('CHAMPIONNAT',mx,my);g.textAlign='left';}
const pe=rel.pente;if(Math.abs(pe[0])>0.2){const t=pe[0]>0?'LA PLACE PENCHE  →':'←  LA PLACE PENCHE';g.font='800 12px "Baloo 2",sans-serif';const w=g.measureText(t).width+20,[mx,my]=bqS(0,1.5);g.fillStyle='rgba(60,25,10,.6)';g.beginPath();g.roundRect(mx-w/2,my-14,w,22,11);g.fill();g.fillStyle='#fff';g.textAlign='center';g.fillText(t,mx,my+1);g.textAlign='left';}}
/* LA NUIT : le noir, sauf sous le lampadaire et autour du cercle ; quelques lucioles */
function bqNuit_v1(g,W,H,now){if(!BQ2.nuitC||BQ2.nuitC.width!==W)BQ2.nuitC=document.createElement('canvas');const c=BQ2.nuitC;c.width=W;c.height=H;const n=c.getContext('2d');
n.fillStyle='rgba(6,10,28,.9)';n.fillRect(0,0,W,H);n.globalCompositeOperation='destination-out';
const trou=(x,z,r,a)=>{const [X,Y]=bqS(x,z),R=r*BQ2.sx;const gr=n.createRadialGradient(X,Y,R*0.15,X,Y,R);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(1,'rgba(0,0,0,0)');n.fillStyle=gr;n.save();n.translate(X,Y);n.scale(1,BQ2.sz/BQ2.sx);n.translate(-X,-Y);n.beginPath();n.arc(X,Y,R,0,7);n.fill();n.restore();};
const flick=0.95+Math.sin(now/90)*0.03+Math.sin(now/37)*0.02;trou(1.3,7.6,2.1*flick,1);trou(0,0,1.3,0.9);if(BQ2.coch&&!BQ2.coch.morte)trou(BQ2.coch.x,BQ2.coch.z,0.55,0.6);for(const q of BQ2.boules||[])if(!q.morte)trou(q.x,q.z,0.3,0.45);if(BQ2.donnee)trou(BQ2.donnee.x,BQ2.donnee.z,0.3,0.5);if(BQ2.vol){const V=BQ2.vol,k=Math.min(1,(now-V.t0)/1000/V.T);trou(V.lx*k,V.lz*k,0.5,0.6);}
n.globalCompositeOperation='source-over';g.drawImage(c,0,0,W,H);
const [lx,ly]=bqS(2.05,7.6);g.fillStyle='#2a2a30';g.fillRect(lx-2,ly-70,4,72);g.fillRect(lx-10,ly-72,12,4);g.fillStyle='#fff3c0';g.beginPath();g.arc(lx-10,ly-66,4,0,7);g.fill();
g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(lx-10,ly-66,2,lx-10,ly-66,60);gl.addColorStop(0,'rgba(255,220,140,.5)');gl.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=gl;g.fillRect(lx-80,ly-140,140,140);
for(let i=0;i<7;i++){const t=now/1000+i*1.7,X=W*(0.15+0.7*((Math.sin(t*0.37+i)+1)/2)),Y=BQ2.haut+40+(H-BQ2.haut-220)*((Math.cos(t*0.29+i*2)+1)/2),a=(Math.sin(t*3+i)+1)/2;g.fillStyle='rgba(200,255,120,'+(0.5*a)+')';g.beginPath();g.arc(X,Y,2+a*2,0,7);g.fill();}
g.globalCompositeOperation='source-over';}
function bqDessin(now){const g=BQ2.cv.getContext('2d'),W=BQ2.W,H=BQ2.H,s=BQ2.sx,sz=BQ2.sz,T=BQ2.T||PQ_TERRAINS[0];g.setTransform(BQ2.dpr,0,0,BQ2.dpr,0,0);g.imageSmoothingEnabled=false;
if(!BQ2.rel)BQ2.rel={B:[],P:[],pente:[0,0]};
if(!BQ2.fond){BQ2.fond=bqTexFond();BQ2.pub=null;}g.drawImage(BQ2.fond,0,0,W,H);
if(!BQ2.tex)BQ2.tex=bqTexTerrain();const CK=bqCam().k, x0=BQ2.cx-2*s, ytop=bqS(0,BQ2.texZt)[1];g.drawImage(BQ2.tex,x0,ytop,BQ2.tex.width*2,BQ2.tex.height*2);
/* les bastaings */ const x1=BQ2.cx+2*s, bw=Math.max(6,s*0.16);g.fillStyle=BQ2.stade?'#12285a':T.bord;g.fillRect(x0-bw,0,bw,H);g.fillRect(x1,0,bw,H);g.fillStyle=BQ2.stade?'#f2c14e':T.haut;g.fillRect(x0-3,0,3,H);g.fillRect(x1,0,3,H);
g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x0,0,2,H);g.fillRect(x1-2,0,2,H);
bqFoulePub(g,now);
/* le relief : courbes de niveau, pente, cailloux */
g.setLineDash([4,5]);g.lineWidth=1.4;for(const b of BQ2.rel.B){if(Math.abs(b.h)<0.012)continue;const [X,Y]=bqS(b.x,b.z);for(const f of [0.45,0.85]){g.strokeStyle=b.h>0?'rgba(110,70,30,.45)':'rgba(40,80,150,.4)';g.beginPath();g.ellipse(X,Y,b.r*s*f*1.1,b.r*sz*f*1.1,0,0,7);g.stroke();}
 g.fillStyle=b.h>0?'rgba(110,70,30,.55)':'rgba(40,80,150,.5)';g.font='800 10px "Baloo 2",sans-serif';g.textAlign='center';g.fillText(b.h>0?'▲':'▼',X,Y+4);g.textAlign='left';}g.setLineDash([]);
const pe=BQ2.rel.pente;if(Math.abs(pe[0])>0.01){g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2.5;for(let z=1.5;z<BQ_ZMAX;z+=2.2)for(const xx of [-1.2,0.6]){const [X,Y]=bqS(xx+(z%4>2?0.5:0),z),d=Math.sign(pe[0])*9;g.beginPath();g.moveTo(X-d,Y-5);g.lineTo(X,Y);g.lineTo(X-d,Y+5);g.stroke();}}
bqDecorSol(g,s,sz,now);
for(const p of BQ2.rel.P){const [X,Y]=bqS(p.x,p.z),r=Math.max(1.6,s*0.035);g.fillStyle='#6e6a64';g.beginPath();g.ellipse(X,Y,r*1.2,r*0.75,0,0,7);g.fill();g.fillStyle='#b8b4ac';g.fillRect(X-r*0.6,Y-r*0.6,r*0.7,r*0.5);}
/* le cercle */ g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2.5;{const [ccx,ccy]=bqS(0,0);g.beginPath();g.ellipse(ccx,ccy,0.25*s,0.25*sz,0,0,7);g.stroke();}
/* la bande du cochonnet */ if(BQ2.phase==='coch'||(BQ2.phase==='jauge'&&BQ2.jfor==='coch')){const [,y1]=bqS(0,10),[,y2]=bqS(0,6);g.fillStyle='rgba(255,255,255,.13)';g.fillRect(x0,y1,4*s,y2-y1);g.setLineDash([6,6]);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.beginPath();g.moveTo(x0,y1);g.lineTo(x0+4*s,y1);g.moveTo(x0,y2);g.lineTo(x0+4*s,y2);g.stroke();g.setLineDash([]);
 g.fillStyle='rgba(255,255,255,.8)';g.font='800 11px "Baloo 2",sans-serif';g.fillText('10 m',x0+4,y1-4);g.fillText('6 m',x0+4,y2+12);}
/* la donnée */ const D=BQ2.donnee, jau=BQ2.phase==='jauge';if(D&&(BQ2.phase==='vise'||BQ2.phase==='coch'||jau)){const [X,Y]=bqS(D.x,D.z), coch=BQ2.phase==='coch'||(jau&&BQ2.jfor==='coch'), tir=!coch&&BQ2.geste==='tir';
 g.save();g.setLineDash([2,8]);g.lineCap='round';g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=3.5;g.beginPath();g.moveTo(BQ2.cx,BQ2.cy);g.quadraticCurveTo((BQ2.cx+X)/2-(X-BQ2.cx)*0.25,(BQ2.cy+Y)/2,X,Y);g.stroke();
 if(!tir&&T.c!=='nuit'){const rl=(coch?0.35:PB_ROLL[BQ2.geste]/BQ2.sol.fric), L=Math.hypot(D.x,D.z), [X2,Y2]=bqS(D.x+D.x/L*rl,D.z+D.z/L*rl);g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=2;g.setLineDash([3,4]);g.beginPath();g.moveTo(X,Y);g.lineTo(X2,Y2);g.stroke();
  g.setLineDash([]);g.fillStyle='rgba(255,255,255,.75)';g.font='400 13px "Lilita One",sans-serif';g.textAlign='center';g.fillText('?',X2,Y2-4);g.textAlign='left';}
 g.restore();const c=tir?'#ff6a4a':coch?'#ffb050':'#ffe066';g.strokeStyle='rgba(30,20,10,.5)';g.lineWidth=5;g.beginPath();g.arc(X,Y,8,0,7);g.stroke();g.strokeStyle=c;g.lineWidth=2.5;g.beginPath();g.arc(X,Y,8,0,7);g.moveTo(X-14,Y);g.lineTo(X-4,Y);g.moveTo(X+4,Y);g.lineTo(X+14,Y);g.moveTo(X,Y-14);g.lineTo(X,Y-4);g.moveTo(X,Y+4);g.lineTo(X,Y+14);g.stroke();}
if(BQ2.poussiere){const P=BQ2.poussiere,k=(now-P.t)/550;if(k<1){g.fillStyle='rgba(240,230,210,'+(0.65*(1-k))+')';const n=6+Math.round(P.f*4),R=BQ_RB*s;for(let i=0;i<n;i++){const a=i/n*6.28,sp=R*(1+k*(1.4+P.f));g.beginPath();g.arc(P.x+Math.cos(a)*sp,P.y+Math.sin(a)*sp*0.6,R*0.35*(1-k*0.5),0,7);g.fill();}}}
if(BQ2.choc){const k=(now-BQ2.choc.t)/250;if(k<1){const [X,Y]=bqS(BQ2.choc.x,BQ2.choc.z),R=BQ_RB*s;g.strokeStyle='rgba(255,255,255,'+(1-k)+')';g.lineWidth=2;for(let i=0;i<6;i++){const a=i/6*6.28;g.beginPath();g.moveTo(X+Math.cos(a)*R*0.4,Y+Math.sin(a)*R*0.4);g.lineTo(X+Math.cos(a)*R*(0.9+k*1.5),Y+Math.sin(a)*R*(0.9+k*1.5));g.stroke();}}}
const coul=t=>t===0?BQ2.maB:BQ_ADV;const L=[];
if(BQ2.coch)L.push({y:bqS(0,BQ2.coch.z)[1],f:()=>{const [X,Y]=bqS(BQ2.coch.x,BQ2.coch.z);if(BQ2.coch.morte)g.globalAlpha=.35;PT_LIB.cochonnet(g,X,Y,Math.max(2.8,BQ_RC*s*1.25));g.globalAlpha=1;}});
for(const q of BQ2.boules)L.push({y:bqS(0,q.z)[1],f:()=>{const [X,Y]=bqS(q.x,q.z),r=BQ_RB*s;if(q.morte)g.globalAlpha=Math.max(0.25,1-(now-(q.mt||0))/600);bqBoule(g,X,Y,r,coul(q.t));g.globalAlpha=1;
 if(q.morte&&now-(q.mt||0)<1500){g.strokeStyle='#e8503a';g.lineWidth=2.5;g.beginPath();g.moveTo(X-r,Y-r);g.lineTo(X+r,Y+r);g.moveTo(X+r,Y-r);g.lineTo(X-r,Y+r);g.stroke();}}});
L.sort((p,q)=>p.y-q.y);for(const o of L)o.f();
if(BQ2.points&&BQ2.tally){BQ2.points.b.slice(0,BQ2.tally.n).forEach((q,i)=>{const [X,Y]=bqS(q.x,q.z),r=BQ_RB*s,c=BQ2.points.g===0?'#ffd75a':'#ff9a7a';g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(X,Y,r+5,0,7);g.stroke();g.fillStyle=c;g.beginPath();g.arc(X+r+7,Y-r-7,9,0,7);g.fill();g.fillStyle='#5a3608';g.font='400 13px "Lilita One",sans-serif';g.textAlign='center';g.fillText(i+1,X+r+7,Y-r-2.5);g.textAlign='left';
 if(BQ2.coch){const [cX,cY]=bqS(BQ2.coch.x,BQ2.coch.z);g.setLineDash([3,3]);g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.3;g.beginPath();g.moveTo(cX,cY);g.lineTo(X,Y);g.stroke();g.setLineDash([]);}});}
bqJoueurs(g,now);bqMesureDessin(g,now);
if(BQ2.vol&&now>=BQ2.vol.t0){const V=BQ2.vol,k=Math.max(0,Math.min(1,(now-V.t0)/1000/V.T)),x=V.lx*k,z=V.lz*k,h=Math.sin(Math.PI*k)*V.h,[X,Y]=bqS(x,z),r=V.coch?Math.max(2.8,BQ_RC*s*1.25):BQ_RB*s;
 g.fillStyle='rgba(20,15,5,.3)';g.beginPath();g.ellipse(X,Y+r*0.6,r*(1-Math.min(.5,h/4)),r*0.4,0,0,7);g.fill();const yy=Y-h*s*0.9, rr=r*(1+h*0.45);if(V.coch)PT_LIB.cochonnet(g,X,yy,rr);else bqBoule(g,X,yy,rr,coul(V.t),true);}
if(BQ2.stade)bqStade(g,W,now);
if(T.c==='nuit')bqNuit(g,W,H,now);
bqFx(g,now);
/* la jauge de timing */ if(jau){const J=PB_JAUGE[BQ2.jfor], bx=26, bwid=W-52, by=BQ2.jy, hw=bwid/2, mid=bx+hw, e=bqJaugeVal(now);
 g.fillStyle='rgba(20,14,8,.78)';g.beginPath();g.roundRect(bx-6,by-6,bwid+12,46,23);g.fill();
 g.fillStyle='#e8503a';g.fillRect(bx,by,bwid,34);g.fillStyle='#f0c030';g.fillRect(mid-hw*J.gw*2.2,by,hw*J.gw*4.4,34);g.fillStyle='#4fb83e';g.fillRect(mid-hw*J.gw,by,hw*J.gw*2,34);
 g.fillStyle='rgba(255,255,255,.25)';g.fillRect(bx,by,bwid,8);g.fillStyle='#fff';g.font='800 10px "Baloo 2",sans-serif';g.fillText('COURT',bx+6,by+24);g.textAlign='right';g.fillText('LONG',bx+bwid-6,by+24);g.textAlign='left';
 const cx=mid+e*hw;g.fillStyle='#fff';g.fillRect(cx-3,by-8,6,50);g.strokeStyle='#3a2410';g.lineWidth=1.5;g.strokeRect(cx-3,by-8,6,50);}
if(BQ2.jRes&&now-BQ2.jRes.t<1300){const R=BQ2.jRes;g.save();g.globalAlpha=Math.min(1,(1300-(now-R.t))/300);g.textAlign='center';g.font='400 24px "Lilita One",sans-serif';g.lineWidth=6;g.strokeStyle='#3a2410';g.strokeText(R.txt,W/2,BQ2.jy+20);g.fillStyle=R.col;g.fillText(R.txt,W/2,BQ2.jy+20);g.restore();}
/* la loupe : on voit sa donnée de près, avec la distance au cochonnet */
if(BQ2.loupe&&D){const [X,Y]=bqS(D.x,D.z), lr=62, z=3, lx=X<W/2?W-lr-16:lr+16, ly=BQ2.haut+lr+8, dp=BQ2.dpr;
 g.save();g.beginPath();g.arc(lx,ly,lr,0,7);g.clip();g.imageSmoothingEnabled=false;g.drawImage(BQ2.cv,(X-lr/z)*dp,(Y-lr/z)*dp,2*lr/z*dp,2*lr/z*dp,lx-lr,ly-lr,2*lr,2*lr);g.restore();
 g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.arc(lx,ly,lr,0,7);g.stroke();g.strokeStyle='#3a2410';g.lineWidth=1.5;g.beginPath();g.arc(lx,ly,lr+2,0,7);g.stroke();
 if(BQ2.coch&&BQ2.phase!=='coch'){const d=Math.max(0,Math.hypot(D.x-BQ2.coch.x,D.z-BQ2.coch.z));g.fillStyle='rgba(20,14,8,.78)';g.beginPath();g.roundRect(lx-56,ly+lr+6,112,24,12);g.fill();g.fillStyle='#fff';g.font='800 12px "Baloo 2",sans-serif';g.textAlign='center';g.fillText((d<1?Math.round(d*100)+' cm':d.toFixed(1).replace('.',',')+' m')+' du cochonnet',lx,ly+lr+22);g.textAlign='left';}
 else if(BQ2.phase==='coch'){g.fillStyle='rgba(20,14,8,.78)';g.beginPath();g.roundRect(lx-40,ly+lr+6,80,24,12);g.fill();g.fillStyle='#fff';g.font='800 12px "Baloo 2",sans-serif';g.textAlign='center';g.fillText(D.z.toFixed(1).replace('.',',')+' m',lx,ly+lr+22);g.textAlign='left';}}
bqMesureLoupe(g,now);
for(const c of BQ2.confettis){g.save();g.translate(c.x,c.y);g.rotate(c.r);g.fillStyle=c.c;g.fillRect(-4,-2,8,4);g.restore();}
if(BQ2.ann){const A=BQ2.ann,k=(now-A.t0)/A.dur;if(k<1){const sc=k<0.15?0.6+k/0.15*0.5:(k<0.25?1.1-(k-0.15)*1:1), al=k>0.75?(1-k)/0.25:1;g.save();g.globalAlpha=al;g.translate(W/2,H*0.42);g.scale(sc,sc);g.textAlign='center';let fs=A.fort?38:28;g.font='400 '+fs+'px "Lilita One",sans-serif';while(g.measureText(A.txt).width>W-40&&fs>16){fs-=2;g.font='400 '+fs+'px "Lilita One",sans-serif';}g.lineJoin='round';g.strokeStyle='#3a2410';g.lineWidth=8;g.strokeText(A.txt,0,0);g.fillStyle=A.col;g.fillText(A.txt,0,0);g.restore();}else BQ2.ann=null;}
if(BQ2.phase==='intro')bqIntro(g,W,H,now);}

{const ptMajPrec=majAction;
majAction=function(){if(BQ2.ouvert){try{plaqueFeinte.classList.remove('on');}catch(x){}return;}
if(ptPres()){try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir'||b2.t==='metro'))return ptMajPrec();}catch(x){}plaqueVrai=$('action');plaqueFeinte.classList.remove('inerte');plaqueFeinte.innerHTML='Le boulodrome<small>LE MONDIAL · PARTIE AMICALE</small>';plaqueFeinte.classList.add('on');return;}return ptMajPrec();};
$('action').addEventListener('click',(ev)=>{if(ptPres()){ev.stopImmediatePropagation();ev.preventDefault();vibrer(10);bqOuvrir();}},true);}


/* LE CABANON (récompense du niveau 10) : la petite maison de pêcheur des
   Marseillais, murs chaulés, tuiles rondes, volets bleus. Chacun y a SA
   remise : on y range ce qu'on veut garder hors du sac (cabanon_etat). */
function graverMonCabanon(){const W=124,H=104,sol=H-8;
const mk=()=>{const c=document.createElement('canvas');c.width=W*2;c.height=H*2;return c;};
const go=(cv,nuit)=>{const g=cv.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,Math.max(0.5,w),Math.max(0.5,h));};
const h=(x,y,k)=>{let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const cx=W/2-6, L=40, MUR=34;
/* l'ombre */
g.fillStyle='rgba(30,22,12,.30)';g.beginPath();g.ellipse(cx+6,sol+1,L+14,7,0,0,7);g.fill();
/* le muret de la terrasse, à droite */
for(let x=cx+L-2;x<cx+L+22;x++)for(let y=sol-9;y<sol;y++)R(x,y,1,1,h(x,y,7)<.5?'#e2d6bc':'#d4c6a8');
R(cx+L-2,sol-10,24,2,'#c8b48c');
/* le mur chaulé, la lumière vient d'en haut à gauche */
for(let y=0;y<MUR;y++)for(let x=cx-L;x<cx+L;x++){const n=h(x,y,3);const b=y<4?'#f6efe0':(x<cx-L+3?'#fbf6ea':'#efe6d2');R(x,sol-MUR+y,1,1,n<.12?'#e2d7bf':(n>.95?'#fffaf0':b));}
/* les pierres qui percent l'enduit */
[[cx-34,sol-12],[cx-20,sol-28],[cx+22,sol-8],[cx+30,sol-24]].forEach(([x,y])=>{R(x,y,6,3,'#d8c8a8');R(x,y,6,1,'#e8dcc4');});
/* le soubassement ocre */
for(let x=cx-L;x<cx+L;x++)for(let y=0;y<5;y++)R(x,sol-5+y,1,1,h(x,y,4)<.5?'#c89a5a':'#b8884a');
/* la porte bleue, avec son imposte */
const px=cx-6;R(px-1,sol-27,16,27,'#c8b48c');R(px,sol-26,14,26,'#2f6fa8');
for(let k=0;k<4;k++)R(px+1+k*3.4,sol-25,0.8,24,'#245a8a');R(px,sol-26,14,1.2,'#5a96c8');R(px+11,sol-13,1.6,1.6,'#e8c86a');
/* la fenêtre et ses volets */
const fx=cx-30;R(fx,sol-25,14,12,'#c8b48c');R(fx+1,sol-24,12,10,nuit?'#ffd98a':'#2a3a44');
if(!nuit){R(fx+1,sol-24,12,3,'#7aa8c0');R(fx+1,sol-24,5,1,'#c8e0ea');}else{g.fillStyle='rgba(255,200,110,.35)';g.fillRect(fx-4,sol-28,22,18);}
R(fx+6.5,sol-24,0.8,10,'#c8b48c');R(fx+1,sol-19.5,12,0.8,'#c8b48c');
R(fx-6,sol-25,6,12,'#3a7ab4');R(fx+14,sol-25,6,12,'#3a7ab4');for(let k=0;k<4;k++){R(fx-6,sol-24+k*3,6,0.7,'#2a5a8a');R(fx+14,sol-24+k*3,6,0.7,'#2a5a8a');}
R(fx-1,sol-12,16,2,'#d8c8a8');                                      /* l'appui */
R(fx+1,sol-15,3,3,'#c8503a');R(fx+5,sol-16,3,4,'#d8603a');R(fx+9,sol-15,3,3,'#c8503a');R(fx,sol-13,13,1.4,'#8a5a30');   /* les géraniums */
R(fx+1,sol-17,2,2,'#4a8a3a');R(fx+6,sol-18,2,2,'#5a9a4a');R(fx+10,sol-17,2,2,'#4a8a3a');
/* la treille au-dessus de la porte */
R(px-8,sol-33,30,1.4,'#7a5232');for(let k=0;k<8;k++){const x=px-7+k*4;R(x,sol-36+h(k,1,9)*2,3,3,h(k,2,9)<.5?'#5a9a3a':'#4a8a32');}
/* le toit de tuiles rondes */
const T0=sol-MUR;for(let r=0;r<10;r++){const w=L+5-r*0.6;for(let x=cx-w;x<cx+w;x+=4){const n=h(Math.round(x),r,11);const base=n<.3?'#c86e46':(n<.65?'#b8643e':'#a85836');
R(x,T0-r,2.6,1,base);R(x+2.6,T0-r,1.4,1,'#7e3e24');}}
R(cx-L-6,T0,(L+6)*2,2,'#7e3e24');R(cx-L-6,T0+2,(L+6)*2,1,'rgba(40,20,10,.35)');
for(let k=0;k<6;k++){g.fillStyle='rgba(30,20,10,'+(0.26-k*0.04).toFixed(2)+')';g.fillRect(cx-L,T0+3+k,L*2,1);}
/* la cheminée */
R(cx+20,T0-16,8,9,'#e8dcc4');R(cx+19,T0-17,10,2,'#b8643e');
/* l'enseigne en bois */
R(cx-22,T0+5,44,9,'#3a2616');R(cx-21,T0+6,42,7,'#5a3a22');g.fillStyle='#f6e8c0';g.font='700 6px Georgia';g.textAlign='center';g.fillText('LE CABANON',cx,T0+11.6);g.textAlign='left';
/* la terrasse : une chaise, une table, une nasse */
const tx=cx+L+6;R(tx,sol-14,10,1.5,'#a8743e');R(tx+1,sol-13,1,9,'#7a5232');R(tx+8,sol-13,1,9,'#7a5232');
R(tx+2,sol-18,4,4,'#e8e0d0');R(tx+3,sol-21,2,3,'#3a7ab4');                                       /* le pastis et sa carafe */
R(tx+13,sol-12,6,1.2,'#3a7ab4');R(tx+13,sol-12,1,8,'#2a5a8a');R(tx+18,sol-12,1,8,'#2a5a8a');R(tx+18,sol-20,1,8,'#2a5a8a');R(tx+18,sol-20,1.6,1,'#2a5a8a');
g.strokeStyle='#8a6a40';g.lineWidth=0.7;for(let k=0;k<4;k++){g.beginPath();g.ellipse(cx-L-6,sol-5,5-k*0.6,4,0,0,7);g.stroke();}   /* la nasse contre le mur */
R(cx-L-11,sol-1,10,1.2,'rgba(30,20,10,.3)');
/* la lanterne */
R(px+18,sol-27,1,3,'#2a2a2a');R(px+16.5,sol-24,4,5,nuit?'#ffe6a0':'#e8d8a8');R(px+16,sol-25,5,1.2,'#2a2a2a');R(px+16,sol-19,5,1,'#2a2a2a');
if(nuit){const gl=g.createRadialGradient(px+18.5,sol-21,0,px+18.5,sol-21,16);gl.addColorStop(0,'rgba(255,214,140,.55)');gl.addColorStop(1,'rgba(255,170,70,0)');g.fillStyle=gl;g.fillRect(px+2,sol-37,34,32);}
};
const toile=mk(), nuit=mk();go(toile,false);go(nuit,true);return {toile,W,H,sol,nuit};}

/* LE CABANON EST À LA FERME : à l'est, à côté du rucher. Dessiné dans la
   pile comme les autres bâtiments de la ferme ; sa porte est un DECOR
   (ouvre:'cabanon') pour la plaque et le toucher. */
const CBF_X=1430, CBF_Y=640;
let CBF_IMG=null;
function cbfDans(x,y){if(!FERME_VIERGE)return false;return Math.abs(x-CBF_X)<46&&y>CBF_Y-16&&y<CBF_Y+3;}
function cbfDessiner(ctx,camX,camY,pile){if(!FERME_VIERGE||CARTE!=='village')return;
 const X=CBF_X-camX, Y=CBF_Y-camY;if(X>VW+90||X<-90||Y>VH+40||Y<-120)return;
 if(!CBF_IMG)CBF_IMG=graverMonCabanon();
 let nuit=false;try{const ci=cielDuMoment();nuit=!!(ci&&ci.lampes>0.5);}catch(x){}
 pile.push({y:CBF_Y,f:()=>ctx.drawImage(nuit?CBF_IMG.nuit:CBF_IMG.toile,Math.round(X-CBF_IMG.W/2),Math.round(Y-CBF_IMG.sol),CBF_IMG.W,CBF_IMG.H)});}

/* =====================================================================
   LE RUCHER (récompense du niveau 8) : trois ruches Dadant sur leur banc,
   un carré de lavande, et les abeilles qui vont et viennent. Un pot de
   miel par ruche toutes les 4 h, deux d'avance au plus (ruche_etat /
   ruche_recolter, sur le serveur). Avant le niveau 8 les ruches sont là,
   vides et silencieuses : on voit ce qui attend.
   ===================================================================== */
const RU_OX=992, RU_OY=520, RU_K=0.75;
const ruW=(u)=>RU_OX+u*RU_K, ruH=(v)=>RU_OY+v*RU_K;
let RU={etat:null,charge:false,img:null,quand:0,cle:''};
function ruDansRucher(x,y){if(!FERME_VIERGE)return false;
return x>ruW(26)&&x<ruW(232)&&y>ruH(96)&&y<ruH(122);}               /* le banc et ses ruches */
const ruPres=()=>FERME_VIERGE&&CARTE==='village'&&joueur.x>ruW(10)&&joueur.x<ruW(250)&&joueur.y>ruH(118)&&joueur.y<ruH(196);
const RU_LIB=(()=>{
function H(x,y,k){let n=(x*374761393+y*668265263+k*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;}
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function ruche(g,r,x,sol,c){/* c={corps,ombre,toit} */
 r(x-15,sol-2,30,3,'rgba(30,20,10,.28)');
 r(x-12,sol-8,3,8,'#5a3a20');r(x+9,sol-8,3,8,'#5a3a20');                      /* le pied */
 r(x-16,sol-10,32,3,'#8a5a30');r(x-16,sol-10,32,1,'#b8804a');                   /* le plateau */
 r(x-6,sol-12,12,2,'#7a5232');                                                   /* la planche d'envol */
 for(let k=0;k<3;k++){const y=sol-12-(k+1)*13;r(x-14,y,28,13,c.corps);r(x-14,y,28,1.5,'rgba(255,255,255,.35)');r(x+10,y,4,13,c.ombre);r(x-14,y+12,28,1,'rgba(0,0,0,.22)');
  r(x-5,y+5,10,2,'rgba(0,0,0,.18)');}                                           /* trois hausses, et leurs poignées */
 r(x-5,sol-15,10,2,'#1a1208');                                                   /* le trou de vol */
 const ty=sol-12-39;r(x-17,ty-5,34,6,c.toit);r(x-17,ty-5,34,1.5,'#e8ecf0');r(x-17,ty,34,1.5,'rgba(0,0,0,.3)');r(x-15,ty-7,30,2,'#9aa2aa');}
function lavande(g,r,x0,y0,w,h){for(let y=y0;y<y0+h;y+=12)for(let x=x0+(y/12%2?7:0);x<x0+w-8;x+=14){
 g.fillStyle='rgba(30,40,10,.28)';g.beginPath();g.ellipse(x+6,y+6,8,2.6,0,0,7);g.fill();
 g.fillStyle='#4a6e3a';g.beginPath();g.ellipse(x+6,y+3,7,4,0,0,7);g.fill();g.fillStyle='#6a8e52';g.beginPath();g.ellipse(x+4.5,y+1.8,4,2.2,0,0,7);g.fill();
 for(let k=0;k<7;k++){const sx=x+1+k*1.7, hh=4+H(x+k,y,6)*3;r(sx,y-hh+1,0.8,hh,'#5a7a44');r(sx-0.4,y-hh-1,1.7,3.2,H(x+k,y,7)<.5?'#8a68d0':'#a07ce8');r(sx-0.2,y-hh-1,0.8,1,'#c8b0f8');}}}
function calques(ouvert,pots){const W=260,HH=210;const fond=mk(W,HH), ban=mk(W,HH);
 {const g=fond.getContext('2d'),r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  for(let y=86;y<200;y++)for(let x=14;x<246;x+=2){const d=Math.hypot((x-130)/118,(y-140)/58);if(d<1&&H(x,y,2)<0.55-d*0.35)r(x,y,2,1,H(x,y,3)<.5?'#b89a62':'#a88a58');}   /* la terre battue devant les ruches */
  lavande(g,r,22,156,90,34);lavande(g,r,150,156,90,34);
  /* le panneau du rucher */
  r(118,170,3,24,'#6a4a2a');r(96,160,48,13,'#3a2616');r(97,161,46,11,'#5a3a22');
  g.fillStyle='#f6e8c0';g.font='700 7px Georgia';g.textAlign='center';g.fillText(ouvert?'LE RUCHER':'NIVEAU 8',120,169.5);g.textAlign='left';}
 {const g=ban.getContext('2d'),r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const C=ouvert?[{corps:'#f4f0e4',ombre:'#d8d0bc',toit:'#b8c0c8'},{corps:'#8ab8d8',ombre:'#6a98b8',toit:'#b8c0c8'},{corps:'#f0d070',ombre:'#d0b050',toit:'#b8c0c8'}]
   :[{corps:'#c8c4b8',ombre:'#aaa69a',toit:'#9aa0a6'},{corps:'#b4bcc2',ombre:'#969ea4',toit:'#9aa0a6'},{corps:'#c8c0a0',ombre:'#aaa282',toit:'#9aa0a6'}];
  [70,130,190].forEach((x,i)=>ruche(g,r,x,118,C[i]));
  /* les pots prêts, sur la petite table à droite */
  r(220,104,26,3,'#8a5a30');r(222,107,2,12,'#5a3a20');r(242,107,2,12,'#5a3a20');
  for(let k=0;k<Math.min(6,pots||0);k++){const x=222+(k%3)*8, y=96-Math.floor(k/3)*9;r(x,y,6,8,'#e8a020');r(x,y+4,6,4,'#c87810');r(x+1,y+1,1.5,4,'#ffd870');r(x-0.5,y-2,7,2.4,'#c8503a');}}
 return {fond,ban};}
return {calques};})();
async function ruCharger(){if(!e.id)return;try{const d=await rpcNiv('ruche_etat',{});if(d&&!d.erreur){RU.etat=d;RU.charge=true;RU.recu=Date.now();}}catch(x){}}
function ruDans(){const E=RU.etat;if(!E||!E.ouvert)return 0;return Math.max(0,(E.dans||0)-(Date.now()-(RU.recu||Date.now()))/1000);}
function ruTexte(){if(!RU.charge)return ['Le rucher','UN INSTANT…'];const E=RU.etat;
 if(!E.ouvert)return (E.niveau||1)>=8?['Le rucher','RÉCLAME TON NIVEAU 8 DANS LE CARNET']:['Le rucher','S’OUVRE AU NIVEAU 8 · TU ES NIVEAU '+(E.niveau||1)];
 if((E.pots||0)>0)return ['Récolter '+E.pots+' pot'+(E.pots>1?'s':'')+' de miel','DANS TON SAC · 15 € LE POT CHEZ MADELEINE'];
 const s=Math.ceil(ruDans()), h=Math.floor(s/3600), m=Math.max(1,Math.ceil((s%3600)/60));
 return ['Les abeilles butinent','3 POTS DANS '+(h?h+' H ':'')+m+' MIN'];}
let RU_OCC=false;
async function ruAction(){if(RU_OCC)return;if(!RU.charge){ruCharger();return;}RU_OCC=true;try{const E=RU.etat;
 const msg=(t,c)=>texteVolant(joueur.x,joueur.y-56,t,c||'#fff3d0');
 if(!E.ouvert){if((E.niveau||1)>=8){vibrer(10);ouvrirMonNiveau('niveaux');}else msg('Le rucher s’ouvre au niveau 8','#ffe8a0');return;}
 if((E.pots||0)<=0){msg('Les abeilles travaillent… repasse plus tard');return;}
 try{potGeste('ramasse');}catch(x){}
 const d=await rpcNiv('ruche_recolter',{});
 if(d&&d.ok){if(d.sac){e.sac=d.sac;try{sauver();majHaut();}catch(x){}}msg('+'+d.pots+' pots de miel · +'+d.pts+' pts','#ffe070');try{marquer('fruits',d.pts);}catch(x){}try{jouer('vente','moment');}catch(x){}vibrer([14,30,14]);
  if(d.etat){RU.etat=d.etat;RU.recu=Date.now();}RU.img=null;}
 else msg(d&&d.erreur==='sac_plein'?'Ton sac est plein':'Réessaie dans un instant','#ffd0a0');
}finally{RU_OCC=false;try{majAction();}catch(x){}}}
const RU_ABEILLES=Array.from({length:14},(_,k)=>({h:k%3,a:k*1.7,r:10+(k*7)%22,v:0.9+(k%5)*0.25,f:k%4===0}));
function ruDessiner(ctx,camX,camY,pile){if(!FERME_VIERGE||CARTE!=='village')return;
 const X=ruW(0)-camX, Y=ruH(0)-camY;if(X>VW+40||X+200<-40||Y>VH+40||Y+160<-60)return;
 if(!RU.charge&&Date.now()-RU.quand>8000){RU.quand=Date.now();ruCharger();}
 const E=RU.etat, ouvert=!!(E&&E.ouvert), pots=ouvert?(E.pots||0):0, cle=ouvert+':'+pots;
 if(!RU.img||RU.cle!==cle){RU.img=RU_LIB.calques(ouvert,pots);RU.cle=cle;}
 const W2=260*RU_K, H2=210*RU_K;
 ctx.drawImage(RU.img.fond,Math.round(X),Math.round(Y),W2,H2);
 pile.push({y:ruH(118),f:()=>{ctx.drawImage(RU.img.ban,Math.round(X),Math.round(Y),W2,H2);
  if(!ouvert)return;const t=performance.now()/1000;
  for(const b of RU_ABEILLES){const hx=[70,130,190][b.h], hy=104;let bx,by;
   if(b.f){const u=(Math.sin(t*0.35*b.v+b.a)+1)/2;bx=hx+((b.h<1?60:b.h>1?200:130)-hx)*u+Math.sin(t*3+b.a)*6;by=hy+(170-hy)*u+Math.cos(t*2.6+b.a)*5;}
   else{bx=hx+Math.cos(t*b.v*2+b.a)*b.r;by=hy-6+Math.sin(t*b.v*2.6+b.a)*b.r*0.45;}
   const sx=X+bx*RU_K, sy=Y+by*RU_K;ctx.fillStyle='#2a1a08';ctx.fillRect(Math.round(sx),Math.round(sy),2.2,1.6);ctx.fillStyle='#f0c020';ctx.fillRect(Math.round(sx)+0.6,Math.round(sy),0.9,1.6);
   if(Math.floor(t*14+b.a*3)%2){ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(Math.round(sx),Math.round(sy)-1,1.4,0.8);}}}});}
setInterval(()=>{if(FERME_VIERGE&&CARTE==='village'&&e.id&&document.visibilityState==='visible')ruCharger();},90000);
{const ruMajPrec=majAction;
majAction=function(){if(ruPres()){try{const b2=cible();if(b2&&(b2.ouvre||b2.t==='comptoir'||b2.t==='metro'))return ruMajPrec();}catch(x){}plaqueVrai=$('action');const t=ruTexte();plaqueFeinte.classList.remove('inerte');plaqueFeinte.innerHTML=t[0]+'<small>'+t[1]+'</small>';plaqueFeinte.classList.add('on');return;}return ruMajPrec();};
$('action').addEventListener('click',(ev)=>{if(ruPres()){ev.stopImmediatePropagation();ev.preventDefault();ruAction();}},true);}

/* =====================================================================
   LE CABANON (récompense du niveau 10) : 60 places à l'abri, sur le quai.
   On y pose ce qu'on veut garder hors du sac et on le reprend quand on
   veut (cabanon_etat / cabanon_ranger). Écran au style du carnet.
   ===================================================================== */
let CBN=null, CBN_OCC=false;
const cbNom=(k)=>(typeof POT_CULT!=='undefined'&&POT_CULT[k])?POT_CULT[k][0]:((OBJETS[k]&&OBJETS[k].nom)||k);
const CSS_CAB=`.cbVide{padding:22px 10px;text-align:center;font:700 13px/1.4 'Baloo 2',sans-serif;color:#8a6a48}
.cbJg{margin:4px 0 10px;border-radius:16px;background:#f3e2b8;box-shadow:0 3px 0 #dcc694;padding:10px 12px;font:800 12px 'Baloo 2',sans-serif;color:#5a3a18}
.cbJg u{display:block;height:12px;margin-top:6px;border-radius:7px;background:#fff8e4;box-shadow:inset 0 0 0 2px #e6cf90;overflow:hidden}.cbJg u i{display:block;height:100%;background:linear-gradient(#7ac0f0,#3a8ad0)}
.cbL{display:flex;align-items:center;gap:9px;padding:7px 9px;margin-bottom:7px;border-radius:14px;background:#fffaf0;box-shadow:0 3px 0 #dcc694}
.cbL .ic{flex:none;width:34px;height:34px;border-radius:10px;background:#f3e2b8;display:flex;align-items:center;justify-content:center}
.cbL .tx{flex:1;min-width:0;font:800 13px/1.15 'Baloo 2',sans-serif;color:#3a2408}.cbL .tx small{display:block;font:700 10.5px 'Baloo 2',sans-serif;color:#8a6a48}
.cbL button{flex:none;border:0;border-radius:11px;padding:7px 9px;font:400 12px 'Lilita One',sans-serif;color:#fff;background:#3a8ad0;box-shadow:0 3px 0 #1f5a90}
.cbL button.un{background:#f4c23a;color:#3a2408;box-shadow:0 3px 0 #b88a10}
.cbL button:disabled{opacity:.45}`;
async function ouvrirMonCabanon(){
 if(!document.getElementById('cssBq')){const st=document.createElement('style');st.id='cssBq';st.textContent=CARNET('bq')+CSS_BQ+CSS_BQ_A;document.head.appendChild(st);}
 if(!document.getElementById('cssCab')){const st=document.createElement('style');st.id='cssCab';st.textContent=CSS_CAB;document.head.appendChild(st);}
 $('page2Fond').className='bq mA niv cab';$('page2').classList.add('on');if(!CBN)CBN={ong:'sac'};CBN.etat=CBN.etat||null;peindreMonCabanon();
 const d=await rpcNiv('cabanon_quai_etat',{});if(d&&!d.erreur){CBN.etat=d;if(d.sac&&d.sac.contenu){e.sac=d.sac.contenu;}}else CBN.err=(d&&d.erreur)||'Le serveur n’a pas répondu.';
 if($('page2').classList.contains('on')&&$('page2Fond').classList.contains('cab'))peindreMonCabanon();}
function peindreMonCabanon(){const F=$('page2Fond');if(!F)return;const E=CBN&&CBN.etat;
 const lig=(k,n,sens)=>'<div class="cbL"><span class="ic"><svg viewBox="0 0 16 16" width="26">'+(ICONES[k]||'')+'</svg></span><span class="tx">'+echapperT(cbNom(k))+'<small>×'+n+(sens==='poser'?' dans ton sac':' au cabanon')+'</small></span>'+
  '<button class="un" data-cb="'+k+'" data-n="1" data-s="'+sens+'">'+(sens==='poser'?'RANGER 1':'PRENDRE 1')+'</button><button data-cb="'+k+'" data-n="'+n+'" data-s="'+sens+'">TOUT</button></div>';
 let corps='';
 if(!E)corps='<div class="cbVide">'+(CBN&&CBN.err?echapperT(CBN.err):'On ouvre le cabanon…')+'</div>';
 else if(!E.ouvert)corps='<div class="cbVide">🔒 Ton cabanon t’attend au <b>niveau 10</b>.<br>'+((E.niveau||1)>=10?'Tu y es : réclame-le dans ton carnet !':'Tu es niveau '+(E.niveau||1)+'.')+'<br><br>60 places à l’abri, pour garder ce que tu veux hors du sac.</div>'+((E.niveau||1)>=10?'<button class="go" id="cbCarnet" style="display:block;margin:0 auto">OUVRIR MON CARNET</button>':'');
 else{const pris=E.pris||0,pl=E.places||60;
  corps='<div class="cbJg">Le cabanon · '+pris+' / '+pl+' places<u><i style="width:'+Math.round(pris/pl*100)+'%"></i></u></div>';
  const src=CBN.ong==='sac'?(e.sac||{}):(E.contenu||{});const ks=Object.keys(src).filter(k=>(src[k]|0)>0).sort((a,b)=>cbNom(a).localeCompare(cbNom(b)));
  corps+=ks.length?ks.map(k=>lig(k,src[k]|0,CBN.ong==='sac'?'poser':'prendre')).join(''):'<div class="cbVide">'+(CBN.ong==='sac'?'Ton sac est vide.':'Rien de rangé pour l’instant.<br>Pose ici ce que tu veux garder.')+'</div>';}
 F.innerHTML='<div class="aTop"><div class="aTtl"><small>À LA FERME</small>Ton cabanon</div><button class="aX" id="cbX">✕</button></div>'+
  (E&&E.ouvert?'<div class="bqOng">'+[['sac','🎒','Mon sac'],['cab','🏠','Le cabanon']].map(([k,i,t])=>'<button data-cbo="'+k+'" class="'+(CBN.ong===k?'on':'')+'"><i>'+i+'</i>'+t+'</button>').join('')+'</div>':'')+
  '<div class="aCarte"><div class="corps">'+corps+'</div></div>';
 $('cbX').onclick=()=>{fermeA=Date.now();$('page2').classList.remove('on');};
 const cc=$('cbCarnet');if(cc)cc.onclick=()=>ouvrirMonNiveau('niveaux');
 F.querySelectorAll('[data-cbo]').forEach(b=>b.onclick=()=>{CBN.ong=b.dataset.cbo;vibrer(8);peindreMonCabanon();});
 F.querySelectorAll('[data-cb]').forEach(b=>b.onclick=async()=>{if(CBN_OCC)return;CBN_OCC=true;F.querySelectorAll('[data-cb]').forEach(x=>x.disabled=true);
  const d=await rpcNiv('cabanon_quai_ranger',{p_type:b.dataset.cb,p_nb:+b.dataset.n,p_sens:b.dataset.s});CBN_OCC=false;
  if(d&&d.ok&&d.etat){CBN.etat=d.etat;if(d.etat.sac&&d.etat.sac.contenu){e.sac=d.etat.sac.contenu;try{sauver();majHaut();recalerLeSac(true);}catch(x){}}vibrer(10);}
  else motOuverture(d&&d.erreur==='cabanon_plein'?'Le cabanon est plein (60 places).':d&&d.erreur==='sac_plein'?'Ton sac est plein.':'Le serveur n’a pas répondu.');
  peindreMonCabanon();});}

/* ================= CE QUE LE JEU DEMANDE À LA FERME =================
   Les 35 seuls noms que jeu.html connaît d'ici. Tout le reste
   est à nous. Ajouter un nom ici, c'est agrandir la porte : on ne le
   fait qu'en sachant pourquoi. */
;({CH_X0,CH_Y0,CH,chStade,chAdopter,chCharger,chDeSaison,chPoints,chDessinFerme,fmDansMaison,peindreClotureFerme,fmDessinerMaison,peindreCheminsFerme,fpCadre,fpTerre,fmDessinerEtal,MAD_SVG,bqAtelierChamp,fmDessinerLampes,fmDessinerDeco,fmDessinerMetro,fpDessinerArrosoir,fpDessinerArroseur,fmDessinerLanternes,PG,pgCharger,pgDessiner,PC,pcCharger,pcDessiner,moDessiner,ptDessiner,cbfDessiner,ruDessiner,ouvrirMonCabanon})
