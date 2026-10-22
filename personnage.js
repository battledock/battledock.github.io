/* =====================================================================
   LE PERSONNAGE — LE DESSIN, ET RIEN QUE LE DESSIN
   =====================================================================
   IL EXISTAIT EN DEUX EXEMPLAIRES, ET ILS AVAIENT DIVERGÉ. Le jeu dessine
   ses joueurs au pixel fin depuis la refonte ; le hall du complexe, lui,
   portait une copie reprise de casino.html, restée au dessin d'avant. Même
   sauvegarde, autre crayon : on entrait dans le complexe et ce n'était plus
   notre bonhomme.

   Ce fichier est donc le dessin, seul, sorti de jeu.html tel quel. Une
   page le charge et appelle Perso.sprite(g,x,y,ap,dir,pas,bouge) — la même
   signature qu'avant, le même rendu que dans le jeu.

   IL NE SAIT RIEN DU JEU : ni carte, ni joueur local, ni serveur. Les
   quelques drapeaux que le dessin consulte (le geste en cours, la
   trottinette) sont posés ici à leur valeur neutre, et le jeu les écrase
   avec les siens quand c'est lui qui s'en sert.
   ===================================================================== */
(function(){
'use strict';
/* ---------- ce que le dessin consulte, à sa valeur neutre ---------- */
let GESTE={t:0};
let VELO=false, CARTE='', e={ap:null};
const CUEILLI=new Map();
function ombreAuSol(){}
function appliquerDeguisement(ap){return ap;}
const SALON_PAR_ID={};
/* ===================================================================
   LES PIECES DU COMPLEXE FESTIF
   Elles ne se trouvent qu'a la boutique du hall, a gauche du casino, et
   nulle part ailleurs : c'est ce qui en fait des exclusivites.
   ELLES SE PORTENT PAR-DESSUS LES HABITS. Aucune ne touche au corps,
   donc aucune ne depend de la tenue qu'on a dessous — c'est la seule
   facon d'en dessiner huit sans en recouvrir une seule de travers.
   LE REPERE : (x,y) sont les pieds. Le crane est a -46, le menton a
   -34, les epaules a -31, les hanches a -18, et le corps ne fait
   jamais plus de sept points de demi-largeur. TOUT CE QUI DEBORDE SE
   DESSINE AU-DELA DE CE SEPT : les plumes partent sur les cotes et
   jamais devant le visage, sinon la piece mange la tete du joueur.
   =================================================================== */
function cosRepere(dir){
const D=String(dir||'bas');
return {dos:D.indexOf('haut')===0, cote:(D==='gauche'||D==='droite'),
        s:D.indexOf('gauche')>=0?-1:1};
}
/* LE DESSIN PAR RANGEES. Les quatre grosses pieces sont de vraies
   silhouettes : un caractere par point, une entree de palette par
   caractere. Dessinees a coups de rectangles, elles n'etaient que des
   blocs — une tete de mascotte doit s'arrondir en haut et se refermer
   en bas, sinon c'est une boite posee sur les epaules. */
function cosArt(g,x,y,rows,pal,mir){
for(let j=0;j<rows.length;j++){const r=rows[j];
for(let i=0;i<r.length;i++){const c=pal[r.charAt(i)];if(!c)continue;
g.fillStyle=c;g.fillRect(x+(mir?r.length-1-i:i),y+j,1,1);}}
}
/* ---------- PERROQUET ---------- */
const P_PER={'v':'#1f8f3e','c':'#44cf6a','o':'#0f5a24','n':'#0a3a16',
 'j':'#f2c230','J':'#fff0a0','b':'#f0a830','B':'#ffd070','d':'#c47a10',
 'w':'#f6f3ec','k':'#16161c','r':'#e03a28','R':'#ff6a52','z':'#2a6ad8','Z':'#5a9aff'};
const P_PER_DOS=Object.assign({},P_PER,{w:'#1f8f3e',k:'#1f8f3e',
 b:'#1f8f3e',B:'#44cf6a',d:'#0f5a24'});
const PER_TETE=[
'.......J.......',
'....J..J..J....',
'....j.jJj.j....',
'...jj.jjj.jj...',
'...jjjjjjjjj...',
'...jJjjjjjJj...',
'.....ccccc.....',
'...cccvvvccc...',
'..cvvvvvvvvvc..',
'.cvvvvvvvvvvvc.',
'cvvwwvvvvvwwvvc',
'cvvwkvvvvvwkvvc',
'cvvwwvvvvvwwvvc',
'ovvvvBBBBBvvvvo',
'.ovvvbbbbbvvvo.',
'..oovbbbbbvoo..',
'...nnddbbbdn...',
'.....ddbdd.....',
'......ddd......'];
const PER_AILE=[
'cvvvvv',
'vvvvvv',
'vvvvvo',
'rrrrr.',
'rRrrrr',
'rrrrro',
'jjjjj.',
'jJjjjj',
'jjjjjo',
'zzzz..',
'zZzzz.',
'zzzzo.',
'.zzo..',
'..o...'];
const PER_QUEUE_C=[
'rrrrrrrrrr.',
'rRrrrrrrrro',
'rrrrrrrro..',
'zzzzzzzzzz.',
'zZzzzzzzzzo',
'zzzzzzzzo..',
'jjjjjjjjjj.',
'jJjjjjjjjjo',
'jjjjjjjjo..'];
const PER_QUEUE=[
'.rr..zz..jj.',
'rRrr.zZz.jJj',
'rrrr.zzz.jjj',
'rrrr.zzz.jjj',
'rrrr.zzz.jjj',
'rrrr.zzz.jjj',
'.rrr.zzz.jj.',
'.rrr.zzz.jj.',
'.rr..zzz..jj',
'.rr..zz...jj',
'..o...n...d.'];

/* ---------- OURS ---------- */
const P_OUR={'m':'#9a6a3a','c':'#bb8a56','o':'#5b3f21','u':'#e2c79a','U':'#f4e2c0',
 'n':'#2a1f16','p':'#d8928a','w':'#f6f3ec'};
const OUR_TETE=[
'.mm......mm.',
'mccm....mccm',
'mcpm....mcpm',
'.mmmmmmmmmm.',
'mccccccccccm',
'mcmmmmmmmmcm',
'mcmnwmmwnmcm',
'mmmmmmmmmmmm',
'mmmmuUUummmm',
'mmmuuuuuuommm'.slice(0,12),
'ommunnuuuomo'.slice(0,12),
'.oommuuuoom.',
'..ooommmoo..',
'...oooooo...'];
const OUR_PATTE=['mccm','mmmm','mumm','.oo.'];

/* ---------- POULPE ---------- */
const P_POU={'p':'#8a4ad8','c':'#b57af0','o':'#5a2aa0','w':'#f6f3ec','k':'#16161c',
 'y':'#ffe08a','n':'#3a1a70'};
const POU_TETE=[
'.....ccccc.....',
'...cccpppccc...',
'..cppppppppppc.'.slice(0,15),
'.cppppppppppppc',
'cpppppppppppppo',
'cppwwwppwwwpppo',
'cppwkwppwkwpppo',
'cppwwwppwwwpppo',
'opppppppppppppo',
'.opppppppppppo.',
'..onppppppno..'.slice(0,15),
'...onnnnnno....'.slice(0,15)];
const POU_BRAS=['p','c','p','o'];

/* ---------- CHAPEAU A FRUITS ---------- */
const P_FRU={'t':'#e8402a','T':'#ff7a5a','o':'#a8220f','g':'#f0a830','G':'#ffd070',
 'y':'#f2c230','Y':'#fff0a0','k':'#6b4a28',
 'a':'#e8a830','A':'#ffcf70','v':'#2e8f3e','V':'#5ad86a',
 'r':'#d8302a','R':'#ff6a52','d':'#8a1810','b':'#8a4ad8','B':'#c08af0'};
const FRU=[
'..........V....',
'.......v.vVv...',
'......vVvAAv...',
'...k...vAAAv...',
'..Yy....AAAA...',
'..yyy..AAAAA...',
'..Yyy..aAAAa...',
'..yyy..aaAaa...',
'..yyy.rRr.aa...',
'..Vyy.rrd.a....',
'.bBb.vrrd......',
'.bbb..dd.......',
'...ggggggggg...',
'..GGGGGGGGGGG..',
'.ggggggggggggg.',
'.tttttttttttt..',
'tTTTTTTTTTTTTTt',
'ttttttttttttttt',
'.ooooooooooooo.'];

const COS_COMPLEXE=[
/* LE COSTUME DE PERROQUET — une tete de mascotte, deux ailes le long
   des bras, et une queue qu'on ne voit que de dos ou de profil : de
   face elle serait devant les jambes, donc devant le joueur. */
{id:'perroquet_costume', nom:'Le costume de perroquet',
mot:'vert, rouge et jaune — on te voit depuis le quai d\u2019en face',
prix:2000000, rar:'legendaire', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
let Q=cosRepere(dir), bat=Math.round(Math.sin(t*5)*1.2);
 if(Q.dos){let bal=Math.sin(t*2.1)*1.4;
   cosArt(g,x-6+bal,y-20,PER_QUEUE,P_PER,false);}
 else if(Q.cote){let ba2=Math.round(Math.sin(t*2.1)*1.2);
   cosArt(g,Q.s>0?x-13:x+2,y-22+ba2,PER_QUEUE_C,P_PER,Q.s>0);}
 [-1,1].forEach(function(sd){
   if(Q.cote&&sd!==Q.s)return;
   cosArt(g,sd>0?x+5:x-11,y-31+bat,PER_AILE,P_PER,sd<0);});
 /* DE DOS, ON NE VOIT NI LES YEUX NI LE BEC. On reprend le meme dessin
    avec une palette ou l'oeil et le bec sont verts, et on coupe les
    trois dernieres rangees — celles qui ne sont QUE du bec. Un bec
    repeint en vert faisait un menton pointu. */
 if(Q.dos)cosArt(g,x-7,y-52,PER_TETE.slice(0,16),P_PER_DOS,false);
 else cosArt(g,x-7,y-52,PER_TETE,P_PER,Q.cote&&Q.s<0);
}},
/* LA PELUCHE GEANTE — un ours qu'on porte sur le dos et dont la tete
   depasse par-dessus l'epaule. Elle est posee a cote de la sienne, pas
   devant : une peluche qui cache le visage n'est plus un cosmetique. */
{id:'peluche_ours', nom:'La peluche géante',
mot:'un ours plus gros que toi, et il ne te lâche plus',
prix:600000, rar:'epique', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
let Q=cosRepere(dir), b=Math.round(Math.sin(t*1.9)*1);
 /* ELLE RESTE DU MEME COTE DE L'ECRAN, QUEL QUE SOIT LE SENS. Elle
    changeait d'epaule selon la direction — a droite de face, a gauche
    de dos et de profil droit — et l'ours sautait d'un cote a l'autre a
    chaque quart de tour. Savoir sur quelle epaule elle est posee
    n'interesse personne ; la voir sauter se remarque tout de suite. */
 let ox=x+7;
 cosArt(g,ox,y-48+b,OUR_TETE,P_OUR,false);
 /* les deux pattes, qui lui font le tour du buste */
 if(!Q.dos){cosArt(g,x-9,y-27,OUR_PATTE,P_OUR,false);cosArt(g,x+5,y-27,OUR_PATTE,P_OUR,true);}
}},
/* LE POULPE GEANT — il se porte sur le crane, et ses huit bras pendent
   de chaque cote du visage sans jamais passer devant. */
{id:'peluche_poulpe', nom:'Le poulpe géant',
mot:'il tient tout seul sur ta tête, et ses bras suivent le rythme',
prix:900000, rar:'epique', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
let Q=cosRepere(dir);
 /* LES BRAS PENDENT. Ils ne s'ecartent pas en descendant : un bras qui
    s'ecarte fait une aile, et le poulpe avait l'air de s'envoler. */
 for(let k=0;k<6;k++){
   let sd=(k%2)?1:-1, c=Math.floor(k/2), dx=sd*(8+c*3), n=10-c*2;
   for(let i=0;i<n;i++){
     let on=Math.sin(t*2.3+k*1.2+i*0.38)*1.5*(i/n);
     g.fillStyle=(i%3===0)?P_POU.c:((i%3===1)?P_POU.p:P_POU.o);
     g.fillRect(x+dx+on,y-47+i*2,(i<n-2)?2:1,2);}
   let fy=y-47+(n-1)*2, fo=Math.sin(t*2.3+k*1.2+(n-1)*0.38)*1.5;
   g.fillStyle=P_POU.y;g.fillRect(x+dx+fo,fy,1,2);}
 cosArt(g,x-7,y-58,POU_TETE,P_POU,false);
}},
/* LE BOA A PLUMES */
{id:'boa_plumes', nom:'Le boa à plumes',
mot:'rose, duveteux, et il perd des plumes partout',
prix:150000, rar:'commune', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
const R=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h);};
const Q=cosRepere(dir), dos=Q.dos;
const F='#f28ab8', FC='#ffc8e0', FO='#c85a90';
if(!dos){[[-8],[6]].forEach(([dx])=>{
for(let i=0;i<7;i++){const on=Math.sin(t*2.6+i*0.6+dx)*1.3*(i/7);
R(dx+on,-30+i*2,3,2,(i%2)?F:FO);}});}
R(-9,-34,18,4,F);R(-9,-34,18,1,FC);R(-9,-31,18,1,FO);
for(let k=0;k<11;k++){const a=Math.sin(t*2+k*1.4)*0.9;
R(-10+k*2,-36+((k%3)?0:1)+a,2,2,(k%2)?FC:F);}
}},
/* LA VESTE A PAILLETTES — chaque paillette s'allume a son tour. */
{id:'veste_paillettes', nom:'La veste à paillettes',
mot:'elle renvoie toutes les lumières de la piste',
prix:420000, rar:'rare', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
const R=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h);};
const C=['#ffe08a','#f28ab8','#7ad8ff','#c8a0ff'];
R(-7,-31,14,1,'#2a2030');R(-7,-19,14,1,'#2a2030');
R(-7,-31,1,12,'#3a2f44');R(6,-31,1,12,'#1d1726');
for(let k=0;k<26;k++){
const px=-6+((k*5)%13), py=-30+((k*7)%12);
const br=(Math.sin(t*6+k*1.7)+1)/2;
if(br<0.42)continue;
R(px,py,1,1,br>0.84?'#ffffff':C[k%4]);}
}},
/* LE TUTU NEON */
{id:'tutu_neon', nom:'Le tutu néon',
mot:'il brille tout seul, même quand les lyres s\u2019éteignent',
prix:220000, rar:'rare', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
const R=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h);};
const A='#ff3ca0', B='#3ce0ff';
const dg=g.createRadialGradient(x,y-16,1,x,y-16,19);
dg.addColorStop(0,'rgba(255,70,170,.30)');dg.addColorStop(1,'rgba(255,70,170,0)');
g.fillStyle=dg;g.fillRect(x-19,y-35,38,38);
const on=Math.sin(t*3)*0.9;
for(let i=0;i<5;i++){
const w=11+i*2.4+on*(i/5);
R(-w/2,-21+i*1.7,w,2,(i%2)?A:B);}
R(-7,-22,14,2,'#2a2030');R(-7,-22,14,1,'#4a3a58');
}},
/* LES LUNETTES A ETOILES — de dos, on n'en voit rien, et c'est juste. */
{id:'lunettes_etoiles', nom:'Les lunettes à étoiles',
mot:'deux étoiles roses, et le monde avec',
prix:110000, rar:'commune', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
const R=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h);};
const Q=cosRepere(dir), dos=Q.dos, cote=Q.cote, s=Q.s;
if(dos)return;
const M='#f2c230', V='#ff3ca0', VC='#ffb0d8';
const etoile=(dx,dy)=>{
R(dx,dy,5,5,V);R(dx+1,dy-1,3,1,V);R(dx+1,dy+5,3,1,V);
R(dx-1,dy+1,1,3,V);R(dx+5,dy+1,1,3,V);
R(dx+1,dy+1,3,2,VC);};
if(cote){etoile(s>0?1:-6,-42);R(s>0?6:-8,-41,3,1,M);return;}
R(-8,-41,16,1,M);
etoile(-7,-42);etoile(2,-42);
}},
/* LE CHAPEAU A FRUITS */
{id:'chapeau_fruits', nom:'Le chapeau à fruits',
mot:'une banane, un ananas, trois cerises — et ça tient',
prix:300000, rar:'rare', hors:true, lieu:'loge', etiq:'COMPLEXE',
gagne:'la boutique du Complexe Festif',
dessin:(g,x,y,t,dir)=>{
let b=Math.round(Math.sin(t*2.3)*0.8);
 cosArt(g,x-7,y-65+b,FRU,P_FRU,false);
}},
/* =====================================================================
   LA MOUETTE DOREE
   Elle ne se vend nulle part. On l'obtient en reunissant les CENT
   cartes de la premiere edition du Pokedock, et c'est la seule piece du
   port qu'aucune somme d'argent ne peut acheter.

   C'EST UN COSTUME INTEGRAL, pas un accessoire. Il se dessine donc
   PAR-DESSUS tout le personnage — habits, cheveux, chapeau — et il n'en
   reste visible que le visage, dans l'ouverture de la capuche. C'est ce
   trou qui fait la difference entre un deguisement et un animal : sans
   lui, on ne se reconnait plus dedans.

   TOUT EST EN MASSES ARRONDIES : une peluche n'a pas d'angle. Et le
   costume suit la largeur du personnage en un peu plus gras — a vingt-
   deux points de large pour un bonhomme qui en fait dix-huit, ce
   n'etait plus un deguisement, c'etait une boule.
   ===================================================================== */
{id:'mouette_doree', nom:'La Mouette Dor\u00e9e',
mot:'cent cartes sur cent \u2014 la peluche que personne ne peut acheter',
prix:0, rar:'legendaire', hors:true, integral:true, lieu:'pokedock', etiq:'POK\u00c9DOCK',
gagne:'les cent cartes de la 1re \u00e9dition',
dessin:(g,x,y,t,dir,ap)=>{
const P=(a,b2,w,h,c)=>{g.fillStyle=c;
  g.fillRect(Math.round(x+a),Math.round(y+b2),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
/* une masse ronde : c'est elle qui fait la peluche */
const O=(cx,cy,rx,ry,c)=>{for(let i=-rx;i<=rx;i++)for(let j=-ry;j<=ry;j++)
  if(i*i/(rx*rx)+j*j/(ry*ry)<=1)P(cx+i,cy+j,1,1,c);};
const Q=cosRepere(dir), dos=Q.dos, cote=Q.cote, s=Q.s;
const J='#e8c24a', JC='#fff0b0', JO='#9a7a1e', V='#fffbe8';
const B='#f0761a', BO='#b84a06', N='#1a1812';
/* LA PEAU EST CELLE DU JOUEUR, lue dans son apparence. */
const peau=(PALETTES.peau[(ap&&ap.peau)||2])||PALETTES.peau[2];
const peauO=teint(peau,-34);
/* LE COSTUME DOIT RECOUVRIR TOUT LE BONHOMME, bords compris. Trop
   juste, on voyait depasser ses bras et le col de sa veste entre la
   capuche et le ventre — et un costume qui laisse voir les habits
   dessous n'est plus un costume. */
const LB=cote?5:7, LT=cote?7:8;
/* LA CAPUCHE DOIT MONTER PLUS HAUT QUE LES CHEVEUX. A trente-deux
   points, la tignasse du joueur depassait par-dessus et le costume
   avait l'air pose sur une perruque. Le crane du personnage s'arrete a
   quarante-sept : la capuche monte donc a quarante-huit, et son bas
   recouvre le haut du corps pour qu'il n'y ait pas de cou. */
const SOL=0, TY=SOL-34;
/* LA QUEUE EN EVENTAIL passe derriere le corps */
if(dos||cote){
  const dx=cote?(s>0?-9:9):0;
  [[-3,J],[0,JO],[3,J]].forEach(([k,c])=>{
    P(dx+(cote?0:k)-1,SOL-16+(cote?Math.abs(k):0),3,7,c);
  });
}
/* LES CHAUSSONS */
if(cote){O(s*2,SOL-2,4,2,B);P(s*2-4,SOL-3,8,1,BO);}
else{[-4,3].forEach(dx=>{O(dx,SOL-2,3,2,B);P(dx-3,SOL-3,6,1,BO);});}
/* LES JAMBES, courtes et grasses */
if(cote)O(0,SOL-6,4,5,J);
else{O(-4,SOL-6,3,5,J);O(3,SOL-6,3,5,J);}
/* LE CORPS : une poire, large en bas */
O(0,SOL-13,LB,8,J);
O(0,SOL-20,LB,9,J);
P(-LB+2,SOL-28,LB*2-4,2,JC);
O(0,SOL-10,LB,5,JO);
if(!dos&&!cote)O(0,SOL-12,LB-3,5,V);
if(cote)O(-s*3,SOL-13,LB-3,7,JO);
if(!cote)for(let k=0;k<9;k++)P(-1,SOL-25+k*2,2,1,JO);
/* PAS DE BRAS : CHEZ ELLE, L'AILE EST LE BRAS. En gardant les deux, le
   boudin du bras et la bande de l'aile se collaient en une seule dalle
   et l'oiseau faisait deux fois sa largeur. */
/* LA CAPUCHE */
O(0,TY,LT,10,J);
P(-LT+2,TY-10,LT*2-4,2,JC);
O(0,TY+5,LT,5,JO);
if(cote)O(-s*4,TY,LT-4,8,JO);
/* LA HUPPE : trois petites plumes au sommet, la seule chose qui
   depasse de la rondeur de la capuche. */
[[-3,2],[0,3],[3,2]].forEach(([k,r])=>{
  const dx=cote?(k*0.6+s):k;
  O(dx,TY-10-r,r,r,J);O(dx,TY-11-r,r-1,1,JC);
});
if(dos){
  /* DE DOS, UNE COUTURE ET UN COL : sans eux, le dos n'etait qu'une
     tache jaune et l'on ne savait plus ou l'on regardait. */
  P(-1,TY-9,2,18,JO);
  P(-LT+1,TY+9,LT*2-2,2,JO);
  P(-LT+1,TY+10,LT*2-2,1,JC);
}else{
  /* L'OUVERTURE, petite : large, elle ne montrait plus un visage dans
     une capuche mais une tete nue posee sur un costume. C'est le BORD,
     tout pres des sourcils, qui fait le deguisement. */
  const fx=cote?s*2:0;
  O(fx,TY-2,cote?3:4,4,peau);
  P(fx-(cote?3:4),TY-5,cote?6:8,1,JO);
  P(fx-(cote?3:4),TY-4,cote?6:8,1,'rgba(0,0,0,.18)');
  if(cote){P(fx+s,TY-3,2,2,N);P(fx+s,TY,2,1,peauO);}
  else{P(fx-3,TY-3,2,2,N);P(fx+2,TY-3,2,2,N);
       P(fx-3,TY-3,1,1,'#ffffff');P(fx+2,TY-3,1,1,'#ffffff');
       P(fx-1,TY,3,1,peauO);}
  /* LE BEC, pose SOUS le visage : il ne couvre jamais les yeux. */
  if(cote){P(fx+s*3,TY+1,s>0?8:-8,3,B);P(fx+s*7,TY+2,s>0?4:-4,2,BO);
           P(fx+s*3,TY+1,s>0?8:-8,1,'#ffb060');}
  else{P(fx-2,TY+1,4,4,B);P(fx-1,TY+4,2,2,BO);P(fx-2,TY+1,4,1,'#ffb060');}
}
/* LES AILES, PAR-DESSUS : elles pendent le long du corps, DEHORS.
   Posees en travers du buste, elles faisaient des bandages ; et les
   remiges sombres ne sont qu'au BOUT, parce que c'est la pointe d'une
   aile qui est noire, pas l'epaule. */
[-1,1].forEach(sd=>{
  if(cote&&sd!==s)return;
  const x0=sd*(cote?5:7)-(sd>0?0:3);
  O(x0+1,SOL-23,2,4,J);
  for(let k=0;k<4;k++)P(x0,SOL-22+k*4,3,4,J);
  P(x0,SOL-22,3,1,JC);
  P(x0,SOL-9,3,4,JO);
  P(x0,SOL-5,3,4,'#5e4a14');
  P(x0,SOL-6,3,1,'#8a6e1a');
  P(x0+(sd>0?-1:3),SOL-23,1,22,'rgba(0,0,0,.16)');
});
}}
];
const COSMETIQUES=COS_COMPLEXE;

/* ---------- le hasard lissé ---------- */
const alea=(n)=>{const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v);};
/* ---------- les courbes d'amorti ---------- */
const doux    =t=>t*t*(3-2*t);                 /* départ et arrivée adoucis */
const sortRap =t=>1-Math.pow(1-t,3);           /* part vite, finit lentement */
const entreRap=t=>t*t*t;                       /* part lentement, finit vite */
/* ================= LES PALETTES, LES LISTES, LE DESSIN D'AVANT =================*/
const PALETTES={
peau:['#f6ddc0','#f0d0ae','#e8c49a','#d8a878','#c08a58','#a2683c','#7d4e2a','#5a3720'],
cheveux:['#1c140d','#2b1d12','#4a3220','#6b4726','#8a5f30','#b58a4a','#d9c48a','#f2e6c8',
'#8a8f96','#c9c9c9','#a8402c','#c2604a','#6b3f8f','#2f6b8f','#3f7d4a','#b53f6b'],
yeux:['#26241f','#3f5f6b','#4a6b3f','#6b4a3f','#5a4a6b','#7d6a3f','#2f6b8f','#8f4a3f'],
veste:['#4f7d5c','#5a6b8f','#8a5a4a','#6b5f8f','#7d6a3f','#3f5f6b','#8f6a3f','#54606b',
'#a8524a','#3f7d4a','#c2a04a','#2f3a4a','#7a4f6b','#4a7d7d','#9c5f2f','#5f5f5f',
/* La Marinière : les teintes de la boutique */
'#17365a','#1d4a72','#b4302c','#f2ece0','#1d2630','#2f6a5a','#8a2a3a','#c9a24a',
'#e8dcc0','#3a2a4a','#6a7a3a','#2a6a9a'],
pantalon:['#3a4358','#4a4038','#2f3a2f','#5a4a3a','#3a3a44','#6b5f4a','#2b3340','#7d6a4a',
'#17365a','#1d2630','#e8dcc0','#5a3a2a','#2f4a3a','#6a5a7a'],
chaussures:['#4a3524','#2f2a24','#5a4a3a','#6b4a28','#3f4a53','#7d5934',
'#f2ece0','#17365a','#8a2a3a','#c9a24a'],
sac:['aucun','#7d5934','#4a5c6b','#6b4a4a','#4f6b4a','#8a6a44','#54606b']
};
const COIFFES=['courts','très courts','dégradé','bol','carré','mi-longs','longs','très longs',
'queue','couettes','chignon','chignon haut','tresse','tresses','ondulés','bouclés',
'afro','dreads','banane','crête','crâne','hirsute'];
const BARBES=['aucune','naissante','fine','courte','pleine','longue','bouc','moustache',
'collier','favoris','impériale','fourchue'];
const CHAPEAUX=['aucun','casquette','bandana','bonnet','capuche','chapeau','beret','cagoule'];
const YEUX_F=['normaux','plisses','ronds','fatigues','doux','severes'];
const SILHOUETTES=['fine','svelte','moyenne','athlétique','forte'];
const HAUTS=['veste','t-shirt','chemise','pull','débardeur','manteau','gilet','tunique'];
const BAS=['pantalon','short','jupe','treillis','longue jupe','bermuda'];
const SOULIERS=['bottes','baskets','sandales','bottillons'];
const SOURCILS=['fins','epais','arques','fronces'];
const NEZ=['petit','droit','large','retrousse'];
const BOUCHES=['neutre','sourire','severe','entrouverte','lèvres','pincée'];
const MARQUES=['aucune','taches','cicatrice','grain','fard','peinture'];
const BOUCLES=['aucune','anneau','perle','plume'];
const DEF_AP={peau:2,cheveux:2,coiffe:0,barbe:0,yeux:0,formeYeux:0,veste:0,pantalon:0,
chaussures:0,chapeau:0,sac:1,
sourcils:0,nez:1,bouche:0,marque:0,boucle:0,
corps:0,haut:0,bas:0,souliers:0,motif:0,raye:19};
const teint=(c,k)=>{
const n=parseInt(c.slice(1),16);
const f=v=>Math.max(0,Math.min(255,v+k));
return '#'+((1<<24)+(f((n>>16)&255)<<16)+(f((n>>8)&255)<<8)+f(n&255)).toString(16).slice(1);
};
/* ================= LA FINESSE DE GRAVURE =================
   Les sprites — personnage, façades, décor — sont gravés sur une toile
   deux fois plus fine que leur taille de jeu, puis étirés par la caméra.
   Au palier « nette », sur un écran à trois points par pixel, l'échelle
   est de six : une gravure en double est donc encore agrandie trois fois.
   On la fait en triple quand l'écran le mérite ; la toile grandit de
   125 %, mais le dessin cesse d'être une image agrandie. */
function finesseGravure(){
  /* ESSAYÉ ET REFUSÉ : graver en triple au palier « nette ». Le dessin du
     personnage est écrit pour une grille en double — ses coordonnées vont
     au demi-point, et la passe de contour relit la toile pixel par pixel
     en supposant ce pas. En triple, le demi-point tombe à un pixel et
     demi : l'arrondi raye le visage et le buste de bandes horizontales,
     et le contour se pose de travers. Ce n'est donc pas un réglage, c'est
     un redessin — le jour où on le fera, cette fonction est l'endroit.
     Mesuré : 60 images par seconde dans les deux cas, le coût n'était pas
     le problème. */
  return 2;
}
let TRANS_FIN=null;
/* ================= LA MICRO-PAUSE =================
   Quand ce drapeau porte un type et une phase, le personnage à l'arrêt
   joue une pause au lieu de respirer en boucle : `appui` reporte son
   poids sur une jambe, `souffle` prend une grande inspiration. Posé par
   poseDe pour les poses 600 à 631, remis à null juste après. */
let REPOS_FIN=null;
/* ================= L'ÉTAT DU VISAGE =================
   Le visage était figé : deux yeux qui regardent droit devant, et un
   clignement d'une seule image toutes les trois secondes et demie. Un
   masque, pas un visage.

   Ce drapeau porte deux choses. `regard` décale l'iris d'un pixel —
   c'est la saccade, le mouvement que font les yeux en permanence et
   qu'on ne remarque que s'il manque. `mi` ferme la paupière à
   mi-course : un clignement passe par là en descendant ET en remontant,
   ce qui sépare un clignement d'un clignotement de néon.

   Posé par poseDe pour les poses 700 à 727, remis à null juste après. */
let FACE_FIN=null;
/* ================= LA TÊTE QUI TOURNE =================
   La tête était verrouillée sur l'octant du corps : il ne pouvait pas
   regarder ailleurs qu'où il allait. Or c'est la première chose qu'un
   corps fait — la tête mène le virage, et elle continue de fixer une
   chose pendant que le corps passe devant.

   Les poses étant gravées en entier, une tête à un angle différent du
   corps est forcément une famille de poses de plus. On ne peut donc pas
   la faire tourner en continu : on lui donne trois crans, -1, 0 et +1,
   et on s'en sert là où ça compte — à l'arrêt, quand il regarde autour
   de lui, et pendant le pivot, où la tête part avant les épaules.

   Dans le pivot elle ne coûte RIEN : les cinq images existent déjà, et
   en double puisqu'il y a un sens par famille. */
let TETE_FIN=0;
/* ================= LE PÉDALAGE =================
   Quand ce drapeau porte une phase, le personnage n'est plus en marche :
   il est assis, penché, les mains au guidon, et ses pieds tournent sur le
   pédalier au lieu de faire des ciseaux. Posé par poseDe pour les poses
   400 à 415, remis à null juste après. */
let VELO_FIN=null;
/* ================= DEBOUT, MAINS AU GUIDON =================
   Le pendant de VELO_FIN pour la trottinette. Le moteur savait deja
   tendre les bras vers un guidon — c'est ce que fait le pedalage — mais
   ce savoir etait SOUDE a la position assise : meme drapeau pour les
   bras tendus, les hanches sur la selle et les jambes qui tournent. On
   ne pouvait pas prendre l'un sans les autres.
   TROT_FIN separe les trois : les bras partent vers le guidon, le buste
   reste droit, les jambes restent plantees sur le plateau. */
let TROT_FIN=false;
/* OU EST LA POIGNEE, exactement. Le guidon de la trottinette est trace a
   AV-s*2, soit TREIZE pixels devant l'axe du corps, et a y-27 quand le
   conducteur a les pieds a y-4 : donc CINQ unites SOUS l'epaule.
   Premier essai a 7 devant et 16 dessous : le bras bougeait a peine et la
   main tombait a hauteur de hanche — on ne voyait pas la difference avec
   le repos. Le bras fait 14 unites en tout (7 de haut, 7 d'avant-bras) ;
   viser 13 devant et 5 dessous l'oblige a se tendre presque droit, ce qui
   est precisement la pose qu'on veut. */
/* ATTENTION : CES DEUX-LA SONT EN DEMI-PIXELS. Tout l'interieur du
   sprite est trace a deux unites de dessin pour un pixel de jeu — c'est
   la regle de la maison, et elle m'a coute deux essais. Mesure faite en
   balayant les valeurs dans un navigateur : la main se pose a
   TROT_AVANT/2 + 1,5 pixels devant l'axe du corps. Pour la mettre a neuf
   pixels, il en faut donc quinze, pas dix.
   Le bras entier fait une douzaine de pixels de portee : neuf devant et
   sept dessous en demandent 11,4, ce qui passe tout juste. Plus loin, il
   se tend au-dela de sa longueur et l'epaule se decroche. */
const TROT_MAIN=14;       /* sous l'epaule, en demi-pixels : sept pixels */
const TROT_AVANT=15;      /* devant le corps, en demi-pixels : neuf pixels */
/* LA GÉOMÉTRIE DU PÉDALIER, dans le repère du dessin fin (deux unités par
   pixel, origine aux pieds, y négatif vers le haut). Elle est calée sur le
   vélo dessiné par dessinerUnVelo : axe du pédalier deux unités en arrière
   et quatre sous la ligne des pieds, manivelle de cinq unités. */
const VELO_BB={x:8, y:4, r:5};
/* LES DEUX DESCENTES ONT ÉTÉ REMONTÉES DE CINQ en même temps que la
   hanche : la selle, elle, n'a pas bougé. Sans ça le cycliste flottait
   deux pixels et demi au-dessus de son vélo. Vérifié : hanche assise
   à -15, épaule à -42, nuque à -45, tête à -66 — exactement comme avant. */
const VELO_ASSIS=21;      /* de combien les hanches descendent sur la selle */
const VELO_BUSTE=22;      /* de combien le haut du corps suit — un peu plus que les hanches : il se tasse sur le guidon */
const VELO_PENCHE=4;      /* l'inclinaison du buste vers l'avant */
const VELO_TETE=3;        /* la tête rentre encore un peu dans les épaules */
/* LE PILOTAGE PAR LA POSE : vrai par défaut. Le mettre à faux depuis la
   console (POSE_PILOTE=false) fait retomber le dessin sur les variables
   d'origine, ce qui permet de comparer les deux rendus. */
let POSE_PILOTE=true;
try{window.POSE_PILOTE=POSE_PILOTE;}catch(x){}
/* LA COMPARAISON : grave la même pose dans les deux modes et compte les
   pixels qui diffèrent. Zéro signifie que le pont est fidèle.
   Usage depuis la console : comparerPose(e.ap,'bas',6). */
function comparerPose(ap,dir,i){
const lire=(mode)=>{POSE_PILOTE=mode;try{window.POSE_PILOTE=mode;}catch(x){}
const cl=i>=300, j=cl?i-300:i, repos=j>=100;
const c=graverFin(ap,dir||'bas',repos?0:(j?(j-1)/2:0),!repos&&j>0,repos?j-100:0,cl);
return c.getContext('2d',{willReadFrequently:true})
.getImageData(0,0,c.width,c.height).data;};
const a=lire(false), b=lire(true);
POSE_PILOTE=true;try{window.POSE_PILOTE=true;}catch(x){}
let n=0;for(let k=0;k<a.length;k+=4){
if(a[k]!==b[k]||a[k+1]!==b[k+1]||a[k+2]!==b[k+2]||a[k+3]!==b[k+3])n++;}
return {differents:n, total:a.length/4,
verdict:n===0?'identiques':(n<12?'quasi identiques':'ÉCART')};}
try{window.comparerPose=comparerPose;}catch(x){}
const CACHE_FIN=new Map();
function sprite(g,x,y,ap0,dir,pas,bouge){
/* =====================================================================
   UN COSTUME INTEGRAL REMPLACE LE DESSIN, IL NE SE POSE PAS DESSUS.
   Premiere tentative : peindre la peluche PAR-DESSUS le personnage,
   comme les huit pieces de la Loge. Il a fallu l'elargir, puis
   l'elargir encore — et il restait toujours un coin de cheveux au
   sommet de la capuche, deux pixels de col bleu a l'epaule, le bord
   d'un bras de profil. Un costume qui laisse voir les habits dessous
   n'est pas un costume, et le grossir jusqu'a tout recouvrir en fait
   une boule.
   On ne dessine donc PLUS le personnage du tout : la piece prend toute
   la place, et elle n'a plus besoin d'etre enorme pour cacher quoi que
   ce soit. Seule la carnation vient encore de lui, par l'ouverture de
   la capuche.
   ===================================================================== */
const CI=cosmetiqueDe(ap0);
if(CI&&CI.integral){cosDessus(g,x,y,ap0,dir);return;}
let fin=false;try{fin=STYLE_FIN();}catch(x){fin=false;}          /* (au tout début du chargement, on reste classique) */
if(fin){
const ges=(typeof GESTE!=='undefined'&&GESTE&&GESTE.t>0)?(GESTE.type||'pioche')+':'+Math.round((1-GESTE.t)*11):'';
const cle=clePose(ap0||{})+'|'+dir+'|'+(bouge?Math.floor((pas||0)*2)%16:'r')+'|'+ges;
let c=CACHE_FIN.get(cle);
if(!c){if(CACHE_FIN.size>220)CACHE_FIN.clear();
const sauve=GESTE;if(ges)GESTE={t:1-Math.round((1-sauve.t)*11)/11,type:sauve.type||'pioche'};
c=graverFin(Object.assign({},DEF_AP,ap0||{}),dir||'bas',pas||0,!!bouge);GESTE=sauve;CACHE_FIN.set(cle,c);}
g.drawImage(c,Math.round(x-CASE_L/2),Math.round(y-CASE_H+10),CASE_L,CASE_H);
cosDessus(g,x,y,ap0,dir);
return;
}
spriteClassique(g,x,y,ap0,dir,pas,bouge);
cosDessus(g,x,y,ap0,dir);
}
/* LA PIECE PORTEE SE DESSINE APRES LE CORPS, ET HORS DU CACHE : elle
   bouge a chaque image alors que la pose, elle, est gravee une fois. */
function cosDessus(g,x,y,ap,dir){
const C=cosmetiqueDe(ap);if(!C)return;
/* L'APPARENCE VOYAGE AVEC LA PIECE. Un costume integral doit connaitre
   la carnation du joueur : c'est le seul morceau de lui qui depasse de
   la capuche, et une peau peinte au hasard ne serait plus la sienne. */
try{C.dessin(g,x,y,Date.now()/1000,dir||'bas',ap);}catch(e){}
}
function spriteClassique(g,x,y,ap0,dir,pas,bouge){
const p=Object.assign({},DEF_AP,ap0||{});
appliquerDeguisement(p);                 /* les tenues valent aussi pour le dessin classique */
const P=PALETTES;
/* LES TENUES DONNENT DES COULEURS EN HEXADÉCIMAL, pas des index de palette :
   sans ça, la veste du garde forestier retombait sur le rouge par défaut. */
const couleurOu=(v,liste)=>typeof v==='string'&&v[0]==='#'?v:(liste[v]||liste[0]);
const peau=P.peau[p.peau]||P.peau[2], peauO=teint(peau,-24), peauC=teint(peau,14), peauT=teint(peau,-52);
const chev=P.cheveux[p.cheveux]||P.cheveux[2], chevC=teint(chev,22), chevO=teint(chev,-22);
const veste=couleurOu(p.veste,P.veste), vesteC=teint(veste,20), vesteO=teint(veste,-26), vesteT=teint(veste,-48);
const pant=couleurOu(p.pantalon,P.pantalon), pantO=teint(pant,-18), pantC=teint(pant,12);
const chau=couleurOu(p.chaussures,P.chaussures), chauC=teint(chau,20);
const oeil=P.yeux[p.yeux]||P.yeux[0];
const coiffe=COIFFES[p.coiffe]||'courts', barbe=BARBES[p.barbe]||'aucune';
const chapeau=CHAPEAUX[p.chapeau]||'aucun', sacC=P.sac[p.sac]||'aucun';
const fy=YEUX_F[p.formeYeux]||'normaux';
const sourcil=SOURCILS[p.sourcils]||'fins';
const nez=NEZ[p.nez]||'droit';
const bouche=BOUCHES[p.bouche]||'neutre';
const marque=MARQUES[p.marque]||'aucune';
const boucle=BOUCLES[p.boucle]||'aucune';
const silhouette=SILHOUETTES[p.corps]||'masculine';
const hautT=HAUTS[p.haut]||'veste';
const RAYE=(p.motif===1), MARIN=(p.motif===2);   /* rayures fines ou larges */
const basT=BAS[p.bas]||'pantalon';
const soulier=SOULIERS[p.souliers]||'bottes';
const SIL={'fine'      :{ep:6,ta:5,ha:6,tete:5,menton:1},
'svelte'    :{ep:7,ta:5,ha:7,tete:5,menton:1},
'moyenne'   :{ep:8,ta:7,ha:7,tete:6,menton:2},
'athlétique':{ep:9,ta:7,ha:7,tete:6,menton:2},
'forte'     :{ep:9,ta:9,ha:9,tete:6,menton:3}}[silhouette]||{ep:8,ta:7,ha:7,tete:6,menton:2};
const EP=SIL.ep, TA=SIL.ta, HA=SIL.ha;   /* demi-largeurs */
const N='#1b1712';
const R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(x+a,y+b,w,h);};
const F=bouge?(Math.floor(pas*2)%16):-1;
const AN={
jg:[-4,-3,-1,1,2,3,3,3,3,3,2,1,0,-2,-3,-3],
jd:[4,3,3,2,0,-1,-2,-3,-3,-2,0,2,3,4,4,4],
pg:[0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,0],
pd:[0,0,0,0,0,0,0,0,0,0,1,2,2,2,1,0],
bg:[2,2,2,1,1,0,-1,-1,-1,-1,0,1,1,2,2,2],
bd:[-1,-1,0,1,1,2,2,2,2,2,2,1,1,0,-1,-1],
corps:[0,0,-1,-1,-1,-1,-1,0,0,0,-1,-1,-1,-1,-1,0],
reb:[0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0]};
const souffle=bouge?0:((Date.now()/1400|0)%3===0?1:0);
let Y=bouge?AN.corps[F]:souffle;
const jgP=bouge?AN.jg[F]:0, jdP=bouge?AN.jd[F]:0;
const jgL=bouge?AN.pg[F]:0, jdL=bouge?AN.pd[F]:0;
const bgP=bouge?AN.bg[F]:0, bdP=bouge?AN.bd[F]:0;
const reb=bouge?AN.reb[F]:0;
const prof=dir==='haut', cote=dir==='gauche'||dir==='droite';
const MANCHE_AR={'veste':11,'chemise':11,'pull':11,'manteau':11,'tunique':9,
'gilet':0,'t-shirt':4,'débardeur':0}[HAUTS[p.haut]||'veste'];
const s=dir==='droite'?1:-1;
const JH=13, TH=15, HT=11;
const yT=-JH-TH;                 /* haut du torse  = -28 */
const yTete=yT-HT-2;             /* la tête est décollée du torse : le cou apparaît */
const fr=(typeof GESTE!=='undefined'&&GESTE.t>0)?GESTE.t:0;
const typeGeste=(typeof GESTE!=='undefined'&&GESTE.type)||'pioche';
let phase=0, arc=0, penche=0, tasse=0;
const em=null;                       /* les émotes sont retirées */
const eq=em?(1-fr):0;
let emBrasA=null, emBrasB=null, emSaut=0, emTourne=0, emJambes=null;
if(fr>0&&typeGeste==='cueille'){
if(fr>0.55){const t=(1-fr)/0.45;penche=doux(t)*2.6;tasse=doux(t)*1.6;arc=1.1*doux(t);phase=1;}
else if(fr>0.3){const t=(0.55-fr)/0.25;penche=2.6;tasse=1.6;arc=1.1+t*0.5;phase=2;}
else{const t=1-fr/0.3;penche=2.6*(1-sortRap(t));tasse=1.6*(1-sortRap(t));arc=1.6*(1-sortRap(t));phase=3;}
}else if(fr>0&&typeGeste==='hache'){
if(fr>0.62){const t=(1-fr)/0.38;arc=-1.9*doux(t);penche=-doux(t)*2;tasse=doux(t)*1.4;phase=1;}
else if(fr>0.42){const t=(0.62-fr)/0.2;arc=-1.9+entreRap(t)*3.3;penche=-2+t*5.2;tasse=1.4-t*2.8;phase=2;}
else{const t=1-fr/0.42;arc=1.4*(1-sortRap(t));penche=3.2*(1-sortRap(t));tasse=-1.4*(1-sortRap(t));phase=3;}
}else if(fr>0&&typeGeste==='gouge'){
if(fr>0.62){const t=(1-fr)/0.38;arc=-0.5*doux(t);penche=doux(t)*1.2;tasse=doux(t)*0.6;phase=1;}
else if(fr>0.42){const t=(0.62-fr)/0.2;arc=-0.5+entreRap(t)*1.1;penche=1.2+t*0.8;tasse=0.6;phase=2;}
else{const t=1-fr/0.42;arc=0.6*(1-sortRap(t));penche=2*(1-sortRap(t));tasse=0.6*(1-sortRap(t));phase=3;}
}else if(fr>0&&typeGeste==='petanque'){
/* LA PÉTANQUE (emote du niveau 13) : on se baisse, le bras part en arrière, puis la boule s'envole par en dessous */
if(fr>0.55){const t=(1-fr)/0.45;tasse=doux(t)*2.8;penche=doux(t)*1.8;arc=doux(t)*1.9;phase=1;}
else if(fr>0.3){const t=(0.55-fr)/0.25;tasse=2.8-t*1.2;penche=1.8+t*0.8;arc=1.9-entreRap(t)*3.7;phase=2;}
else{const t=1-fr/0.3;tasse=1.6*(1-sortRap(t));penche=2.6*(1-sortRap(t));arc=-1.8*(1-sortRap(t));phase=3;}
}else if(fr>0&&typeGeste==='tamis'){
const sec=Math.sin((1-fr)*Math.PI*6);
penche=3.2;tasse=2.6;arc=sec*0.3;phase=2;
}else if(em){
const vie=Math.min(1,Math.min(eq,1-eq)*7);
const bat=(GESTE.tt||0);           /* le temps écoulé, en secondes */
if(em==='coucou'){
const lev=Math.min(1,eq*4)*vie;
arc=-2.0*lev;
emBrasA={haut:lev, remue:Math.sin(bat*11)*0.5*lev};
penche=-0.5*lev;phase=2;
}else if(em==='danse'){
const b2=bat*6.6;
emSaut=Math.abs(Math.sin(b2))*4*vie;
emTourne=Math.sin(b2)*0.16*vie;
arc=-1.6+Math.sin(b2)*0.6;
emBrasA={haut:vie, remue:Math.sin(b2)*0.7};
emBrasB={haut:vie, remue:Math.sin(b2+3.14)*0.7};
emJambes={ecart:Math.sin(b2)*2.4*vie};
phase=2;
}else if(em==='rire'){
const sec=Math.sin(bat*11);
penche=(2.2+Math.abs(sec)*1.1)*vie;
tasse=(1.2+Math.abs(sec)*0.8)*vie;
arc=0.9;
emBrasA={ventre:true, secousse:sec*vie};
emSaut=sec*1.2*vie;
phase=2;
}else if(em==='saluer'){
const p2=eq<0.45?(eq/0.45):(eq<0.7?1:1-(eq-0.7)/0.3);
penche=4.2*p2*vie;tasse=1.4*p2*vie;
arc=0.7-p2*0.5;
emBrasA={coeur:true, montee:p2};
phase=2;
}else if(em==='applaudir'){
const b2=(bat*5)%1;
arc=-0.4;
emBrasA={mains:Math.abs(Math.cos(b2*3.14159))*vie};
penche=0.6*vie;
phase=2;
}else if(em==='assis'){
const d2=Math.min(1,eq*5)*(1-Math.max(0,(eq-0.9)/0.1));
tasse=4.4*d2;penche=0.8*d2;
arc=0.8;
emBrasA={appui:d2};
emJambes={assis:d2};
phase=2;
}else if(em==='coeur'){
const r3=Math.sin(bat*2.4)*0.5+0.5;
arc=-0.9;
emBrasA={corbeille:vie, hauteur:r3};
emBrasB={corbeille:vie, hauteur:r3};
penche=(-0.4-r3*0.5)*vie;
tasse=r3*0.6*vie;
phase=2;
}else if(em==='montrer'){
const t2=Math.min(1,eq*4)*vie;
arc=-1.5708*t2;                   /* le bras à l'horizontale */
emBrasA={tendu:t2};
phase=2;
}else{
const b3=Math.sin(bat*9)*vie;
emTourne=(em==='non')?b3*0.13:0;
emSaut=(em==='oui')?b3*1.4:0;
arc=0.4;
emBrasA={repos:true, remueBas:b3};
penche=(em==='oui')?b3*0.6:0;
tasse=(em==='oui')?Math.abs(b3)*0.5:0;
phase=0;
}
}else if(fr>0){
if(fr>0.58){const t=(1-fr)/0.42;arc=-1.45*doux(t);penche=-doux(t)*1.6;tasse=doux(t)*1.2;phase=1;}
else if(fr>0.42){const t=(0.58-fr)/0.16;arc=-1.45+entreRap(t)*2.75;penche=-1.6+t*4.4;tasse=1.2-t*2.4;phase=2;}
else{const t=1-fr/0.42;arc=1.3*(1-sortRap(t));penche=2.8*(1-sortRap(t));tasse=-1.2*(1-sortRap(t));phase=3;}
}
R(-6,1,12,2,'rgba(40,60,28,.42)');
let emRepere=false;
if(em&&(emSaut||emTourne)){
g.save();emRepere=true;
g.translate(x,y);
if(emTourne)g.rotate(emTourne);
g.translate(-x,-y-emSaut);
}
if(sacC!=='aucun'&&prof){                     /* de dos : le sac, bien posé entre les épaules */
const w2=Math.min(10,EP*2-4);
R(-(w2>>1),yT+2-reb,w2,13,teint(sacC,-8));
R(-(w2>>1),yT+2-reb,w2,2,teint(sacC,16));
R(-(w2>>1),yT+12-reb,w2,2,teint(sacC,-26));
R(-2,yT+6-reb,4,4,teint(sacC,10));          /* la poche */
R(-2,yT+6-reb,4,1,teint(sacC,-30));
}else if(sacC!=='aucun'&&cote){               /* de profil : il dépasse dans le dos */
const sx=s>0?-(EP+1):EP-2;
R(sx,yT+2-reb,4,12,teint(sacC,-16));
R(sx,yT+2-reb,4,2,teint(sacC,10));
R(sx,yT+12-reb,4,1,teint(sacC,-30));
}
const pied=(px2,py,col)=>{
if(soulier==='bottes'){
R(px2,py-2,5,2,teint(col,-16));              /* la tige monte sur la cheville */
R(px2,py,5,3,col);
R(px2,py,5,1,teint(col,20));
R(px2,py+2,5,1,teint(col,-26));             /* la semelle */
}else if(soulier==='bottillons'){
R(px2,py-1,5,1,teint(col,-16));
R(px2,py,5,3,col);
R(px2,py,5,1,teint(col,18));
R(px2,py+2,5,1,teint(col,-30));
}else if(soulier==='baskets'){
R(px2,py,5,2,col);
R(px2,py,5,1,teint(col,22));
R(px2+1,py,2,1,'#f2efe4');                   /* le lacet */
R(px2,py+2,5,1,'#e8e4d8');                   /* la semelle claire */
}else{                                          /* sandales : le pied reste visible */
R(px2+1,py,3,2,peauO);
R(px2,py+1,5,1,col);
R(px2+1,py,3,1,col);
R(px2,py+2,5,1,teint(col,-22));
}
};
const TISSU={'pantalon':JH,'short':6,'jupe':5,'treillis':JH,'longue jupe':10,'bermuda':8}[basT];
const jambeProfil=(dec,plie,col,botte)=>{
const h=JH-plie;
R(-2+dec,-JH,4,h,peau);                    /* la jambe nue */
if(TISSU>0)R(-2+dec,-JH,4,Math.min(h,TISSU),col);
if(TISSU>=h)R(-2+dec,-4,4,4,teint(col,-12));
if(basT==='treillis'){R(-2+dec,-JH+5,4,1,teint(col,-22));R(-1+dec,-JH+6,2,2,teint(col,14));}
pied(-3+dec,-JH+h,botte);
};
const jambeFace=(cx,phase,col,botte)=>{
const avance=phase>0;
const h=avance?JH:JH-2;
const ec=Math.abs(phase)>1?(avance?-1:1):0;
R(cx+ec,-JH,4,h,avance?teint(peau,4):teint(peau,-14));   /* la jambe */
if(TISSU>0){
R(cx+ec,-JH,4,Math.min(h,TISSU),avance?teint(col,8):teint(col,-10));
R(cx+ec,-JH,4,1,pantC);
}
if(basT==='treillis'){R(cx+ec,-JH+5,4,1,teint(col,-22));R(cx+1+ec,-JH+6,2,2,teint(col,14));}
pied(cx-1+ec,-JH+h,avance?botte:teint(botte,-14));
};
let ecJ=0, plieJ=0, assisJ=0;
if(em&&emJambes){
if(emJambes.ecart!==undefined)ecJ=emJambes.ecart;
if(emJambes.assis!==undefined){assisJ=emJambes.assis;plieJ=Math.round(assisJ*5);}
}
if(cote){
if(assisJ>0){
const av=Math.round(assisJ*7)*(dir==='gauche'?-1:1);
jambeProfil(av-1,Math.round(assisJ*6),pantO,teint(chau,-14));
jambeProfil(av+1,Math.round(assisJ*5),pant,chau);
}else{
jambeProfil(jdP*0.9-1+Math.round(ecJ),jdL,pantO,teint(chau,-14));
jambeProfil(jgP*0.9-1-Math.round(ecJ),jgL,pant,chau);
}
}else{
if(assisJ>0){
jambeFace(1,Math.round(assisJ*3),pantO,teint(chau,-14));
jambeFace(-5,Math.round(assisJ*3),pant,chau);
}else{
const e2=Math.round(ecJ);
if(jgP>=jdP){jambeFace(1+e2,jdP,pantO,teint(chau,-14));jambeFace(-5-e2,jgP,pant,chau);}
else{jambeFace(-5-e2,jgP,pant,chau);jambeFace(1+e2,jdP,pantO,teint(chau,-14));}
}
}
if(basT==='jupe'||basT==='longue jupe'){
const hj=basT==='jupe'?6:9;
for(let i=0;i<hj;i++){
const w2=HA-1+Math.round(i*(basT==='jupe'?0.7:0.55));
R(-w2,-JH+i,w2*2,1,i<2?pantC:pant);
}
R(-(HA+3),-JH+hj-1,(HA+3)*2,1,pantO);
}
R(-(HA+1),-JH-2,(HA+1)*2,3,N);
R(-HA,-JH-1,HA*2,2,pantO);
R(-HA,-JH-1,HA*2,1,pant);
if(cote){
const ar=bgP;
const bx=(s>0?-6:3)-ar*s;
R(bx,yT+2,3,11,peauT);
if(MANCHE_AR>0)R(bx,yT+2,3,MANCHE_AR,vesteT);
R(bx,yT+13,3,3,peauT);
}
const colH=veste, colHC=vesteC, colHO=vesteO, colHT=vesteT;
const RAY=(p.raye!=null?(PALETTES.veste[p.raye]||'#f2ece0'):'#f2ece0');
const pen=fr>0?Math.round(penche*(dir==='gauche'?-1:1)):0;   /* il se penche dans l'effort */
const tas=fr>0?Math.max(0,Math.round(tasse)):0;              /* et se tasse */
R(-EP+pen,yT-1+tas,EP*2,TH+1-tas,N);           /* contour aux épaules */
R(-EP+1,yT,EP*2-2,3,colH);                     /* les épaules */
R(-EP+1,yT,EP*2-2,2,colHC);
for(let i=3;i<TH-1;i++){                       /* le buste, resserré à la taille */
const w2=Math.round(EP-1-(EP-TA)*Math.min(1,(i-2)/(TH-5)));
/* LES RAYURES DE LA MARINIÈRE : une ligne sur deux, ou sur trois */
const raye = RAYE ? (i%2===0) : (MARIN ? (i%4<2) : false);
R(-w2,yT+i,w2*2,1,raye?RAY:colH);
R(-w2,yT+i,2,1,raye?teint(RAY,-30):colHT);
R(w2-2,yT+i,2,1,raye?teint(RAY,-18):colHO);
}
R(-TA,yT+TH-4,TA*2,2,colHO);                   /* ceinture */
R(-1,yT+TH-4,2,2,'#c9a24a');
if(hautT==='veste'&&!prof){R(-1,yT,2,TH-5,colHO);R(-4,yT,3,2,colHC);R(1,yT,3,2,colHC);}
if(hautT==='chemise'&&!prof){
R(-1,yT,2,TH-5,colHT);
R(-4,yT,4,3,colHC);R(0,yT,4,3,colHC);        /* col ouvert */
for(let i=0;i<3;i++)R(0,yT+4+i*3,1,1,'#f2efe4');
}
if(hautT==='pull'&&!prof){
R(-3,yT-2,6,3,colHC);R(-3,yT-2,6,1,colH);    /* col montant */
for(let i=4;i<TH-4;i+=3)R(-EP+2,yT+i,EP*2-4,1,teint(colH,-12));
}
if(hautT==='t-shirt'&&!prof){R(-3,yT,6,2,peau);R(-3,yT,6,1,peauC);}
if(hautT==='débardeur'){
R(-4,yT,8,3,peau);R(-4,yT,8,1,peauC);        /* décolleté */
R(-EP+1,yT,2,4,colH);R(EP-3,yT,2,4,colHO);   /* bretelles */
}
if(hautT==='gilet'&&!prof){
R(-2,yT,4,TH-5,peau);R(-2,yT,4,1,peauC);
R(-2,yT+TH-6,4,2,colHO);
}
if(hautT==='manteau'){
R(-TA,yT+TH-2,TA*2,6,colH);                  /* les pans descendent */
R(-TA,yT+TH-2,TA*2,1,colHC);
R(-TA,yT+TH+3,TA*2,1,colHT);
if(!prof)R(-1,yT+TH-2,2,6,colHT);
}
if(hautT==='tunique'){
R(-TA,yT+TH-2,TA*2,4,colH);
R(-TA,yT+TH-2,TA*2,1,colHC);
R(-TA,yT+TH+1,TA*2,1,colHT);
if(!prof){R(-4,yT,8,2,colHC);R(-1,yT,2,4,colHO);}
}
R(-EP+1,yT+TH-2,EP*2-2,1,colHT);
if(sacC!=='aucun'&&dir==='bas'){
R(-EP+2,yT+2,2,8,teint(sacC,-6));
R(EP-4,yT+2,2,8,teint(sacC,-18));
R(-EP+2,yT+6,EP*2-6,1,teint(sacC,-24));
}
const MANCHE={'veste':11,'chemise':11,'pull':11,'manteau':11,'tunique':9,
'gilet':0,'t-shirt':4,'débardeur':0}[hautT];
const brasCol=(dev)=>dev?veste:vesteT;
const brasRaye=(dev,i)=>{const r=RAYE?(i%2===0):(MARIN?(i%4<2):false);
  return r?(dev?RAY:teint(RAY,-30)):brasCol(dev);};
const bras=(bx,by,dev)=>{
/* ================= LE BRAS =================
   C'était une colonne de 3 px presque unie. On lui donne une épaule
   arrondie, un pli au coude et un avant-bras qui s'affine. */
const pk=dev?teint(peau,2):peauO, pkC=dev?peauC:peau, pkO=dev?peauO:peauT;
R(bx,by,3,11,pk);                            /* le bras nu */
R(bx,by,1,11,pkC);R(bx+2,by,1,11,pkO);       /* le modelé : lumière à gauche */
R(bx,by+5,3,1,pkO);                          /* le pli du coude */
if(MANCHE>0){
R(bx,by,3,MANCHE,brasCol(dev));
/* L'ÉPAULE déborde d'un pixel vers l'extérieur : le bras s'emmanche au
   lieu d'être collé au torse. */
R(bx+(bx<0?-1:0),by,4,2,dev?vesteC:vesteO);
R(bx,by,3,2,dev?vesteC:vesteO);
R(bx,by,1,MANCHE,dev?vesteC:veste);          /* le côté éclairé de la manche */
R(bx+2,by,1,MANCHE,dev?vesteO:vesteT);       /* le côté dans l'ombre */
if(MANCHE>6)R(bx,by+5,3,1,dev?vesteO:vesteT);/* le pli du coude, sous la manche */
if(MANCHE<11)R(bx,by+MANCHE-1,3,1,teint(brasCol(dev),-20));
}
/* ================= LA MAIN =================
   C'était un carré de 3×3 d'une seule teinte. Une main, même à cette
   taille, se lit à trois choses : un poignet plus étroit que la paume,
   un pouce du côté du corps, et le dos de la main éclairé tandis que les
   doigts repliés restent dans l'ombre. */
{const pm=dev?peau:peauO, pmC=dev?peauC:peau, pmO=dev?peauO:peauT;
const versCorps=(bx<0)?1:-1;                 /* de quel côté se trouve le pouce */
R(bx,by+10,3,1,dev?T(peau,-14):peauT);       /* le poignet, dans l'ombre de la manche */
R(bx,by+11,3,3,pm);                          /* la paume */
R(bx,by+11,3,1,pmC);                         /* le dessus, éclairé */
R(bx+(versCorps>0?0:2),by+12,1,2,pmO);       /* le pouce, replié vers le corps */
R(bx,by+13,3,1,pmO);                         /* les doigts, dans l'ombre */
if(dev)R(bx+1,by+11,1,1,T(peau,12));}        /* le dos de la main attrape la lumière */
};
if(fr<=0){
if(cote){
bras((s>0?1:-4)+bdP*s,yT+1,true);
}else{
bras(-(EP+2),yT+1,bgP>0);
bras(EP-1,yT+1,bdP>0);
}
}
if(fr>0){
const OS_B=6, OS_A=6;
const coude=(ep,ma,dehors)=>{
const dx=ma[0]-ep[0], dy=ma[1]-ep[1];
let d2=Math.max(0.01,Math.min(Math.hypot(dx,dy),OS_B+OS_A-0.01));
const a2=(d2*d2+OS_B*OS_B-OS_A*OS_A)/(2*d2);
const h2=Math.sqrt(Math.max(0,OS_B*OS_B-a2*a2));
const ux=dx/d2, uy=dy/d2, sgn=dehors?1:-1;
return [ep[0]+ux*a2-uy*h2*sgn, ep[1]+uy*a2+ux*h2*sgn];
};
const segment=(a2,b2,e2,col,lum)=>{
const dx=b2[0]-a2[0], dy=b2[1]-a2[1];
const n2=Math.max(2,Math.round(Math.hypot(dx,dy)*1.6));
for(let i=0;i<=n2;i++){
const px=a2[0]+dx*i/n2, py=a2[1]+dy*i/n2;
R(Math.round(px-e2/2),Math.round(py-e2/2),e2,e2,col);
if(lum)R(Math.round(px-e2/2),Math.round(py-e2/2),1,e2,lum);
}
};
const laMain=(p2,dev,ferme,tient)=>{
R(Math.round(p2[0]-2),Math.round(p2[1]-2),5,5,dev?peauO:peauT);
R(Math.round(p2[0]-1.5),Math.round(p2[1]-1.5),4,4,dev?peau:peauO);
R(Math.round(p2[0]-1.5),Math.round(p2[1]-1.5),4,1,dev?peauC:peau);
if(ferme)R(Math.round(p2[0]+1),Math.round(p2[1]-1),2,3,dev?peauO:peauT);
if(tient)R(Math.round(p2[0]),Math.round(p2[1]-1),2,2,tient);
};
const yEp=yT+2-Math.round(tasse*2);
const epD=[EP-1,yEp], epG=[-(EP+2),yEp];
let mA, mB, angO;
if(cote){
const sens=dir==='gauche'?-1:1;
const r2=typeGeste==='cueille'?9:11;
mA=[Math.sin(arc)*r2*sens+sens*2, yEp+Math.cos(arc)*r2*0.85+3];
mB=[mA[0]-Math.sin(arc)*5*sens, mA[1]-Math.cos(arc)*5*0.85];
angO=arc*sens;
}else{
const av=(arc+1.9)/3.6;                    /* 0 levé, 1 abattu */
const h3=(1-av)*12;
mA=[2, yEp+3+av*8-h3];
mB=[-3, yEp+4+av*7-h3];
angO=0;
}
if(em){
const sens=cote?(dir==='gauche'?-1:1):1;
const yE=yEp;
if(emBrasA&&emBrasA.haut!==undefined){
const h3=emBrasA.haut;
mA=[sens*(4+h3*5)+(emBrasA.remue||0)*sens*3,
yE+3-h3*16+(emBrasA.remue||0)*2];
mB=emBrasB&&emBrasB.haut!==undefined
?[-sens*(4+emBrasB.haut*5)+(emBrasB.remue||0)*sens*3,
yE+3-emBrasB.haut*16+(emBrasB.remue||0)*2]
:[-sens*4, yE+9];
}else if(emBrasA&&emBrasA.ventre){
const sc=(emBrasA.secousse||0)*2.2;
mA=[sens*3+sc, yE+9+Math.abs(sc)*0.6];
mB=[-sens*3+sc*0.6, yE+8-Math.abs(sc)*0.5];
}else if(emBrasA&&emBrasA.coeur){
const m2=emBrasA.montee||0;
mA=[sens*(3-m2*2.4), yE+8-m2*5];
mB=[-sens*(4-m2), yE+9+m2*1.4];
}else if(emBrasA&&emBrasA.mains!==undefined){
const ec=1+emBrasA.mains*4;
mA=[sens*ec, yE+5];mB=[-sens*ec, yE+5];
}else if(emBrasA&&emBrasA.appui!==undefined){
mA=[sens*5, yE+11];mB=[-sens*6, yE+10];
}else if(emBrasA&&emBrasA.corbeille!==undefined){
const h4=(emBrasA.hauteur||0)*2.4;
mA=[sens*2.5, yE+2-h4];mB=[-sens*2.5, yE+2-h4];
}else if(emBrasA&&emBrasA.tendu!==undefined){
const t2=emBrasA.tendu;
mA=[sens*(3+t2*10), yE+4];mB=[-sens*3, yE+9];
}else{
const r4=(emBrasA&&emBrasA.remueBas)||0;
mA=[sens*3+r4*1.4, yE+9+r4*0.8];
mB=[-sens*3+r4*1.4, yE+9-r4*0.8];
}
}
const cD=coude(epD,mA,true), cG=coude(epG,mB,false);
const brasC=MANCHE>6?veste:peau, brasT=MANCHE>6?vesteT:peauO;
const poserOutil=()=>{
if(em)return;                       /* une émote ne tient rien */
if(typeGeste==='cueille')return;
if(typeGeste==='petanque'){if(fr<=0.36)return;   /* la boule dans la main, jusqu'au lâcher */
g.fillStyle='#5a6068';g.beginPath();g.arc(x+mA[0],y+mA[1]+1,2.6,0,7);g.fill();g.fillStyle='#c8ccd2';g.beginPath();g.arc(x+mA[0]-0.5,y+mA[1]+0.5,2,0,7);g.fill();g.fillStyle='#fff';g.fillRect(x+mA[0]-1.2,y+mA[1]-0.4,1,1);return;}
g.save();
g.translate(x+mA[0],y+mA[1]);
g.rotate(angO+(prof?Math.PI:0));
if(!cote)g.scale(1,prof?0.6:0.55);
if(typeGeste==='hache')dessinerHache(g,0,0,1);
else if(typeGeste==='gouge')dessinerGouge(g,0,0,1);
else if(typeGeste==='tamis')dessinerTamis(g,0,0,1);
else dessinerPioche(g,0,0,1);
if(phase===2&&cote){g.globalAlpha=.3;g.fillStyle='#f2f5f8';
g.fillRect(-1,-15,2,13);g.globalAlpha=1;}
g.restore();
};
const brasArriere=()=>{segment(epG,cG,4,brasT,null);segment(cG,mB,3,peauO,null);
laMain(mB,false,true);};
const brasDevant=()=>{segment(epD,cD,4,brasC,vesteC);segment(cD,mA,3,peau,peauC);
laMain(mA,true,typeGeste!=='cueille'||fr<0.45,
(typeGeste==='cueille'&&fr<0.45)?'#b93327':null);};
if(prof){
if(typeGeste!=='cueille'&&typeGeste!=='petanque'&&arc<-0.2){
g.save();
g.translate(x,y+yT-14-Math.round((1+arc)*6));
g.scale(1.05,0.55);
if(typeGeste==='hache')dessinerHache(g,0,0,1);
else dessinerPioche(g,0,0,1);
g.restore();
}
segment(epG,[epG[0]-1,epG[1]+9],4,brasT,null);
segment(epD,[epD[0]+1,epD[1]+9],4,brasC,null);
}else if(cote){
brasArriere();
poserOutil();
brasDevant();
}else{
brasArriere();
poserOutil();
brasDevant();
}
}
const YT=yTete+(fr>0?Math.round(tasse*1.2):0);  /* la tête plonge avec le buste */
R(-3,yT-3+Y,6,4-Y,N);                        /* le cou s'étire quand le corps descend */
R(-2,yT-2+Y,4,3-Y,peau);
R(-2,yT-2+Y,4,1,peauT);                      /* ombre du menton */
R(-2,yT-2+Y,2,3-Y,peauO);
const LT=SIL.tete;                            /* demi-largeur de la tête */
for(let i=0;i<HT;i++){
let w2=LT;
if(i>=HT-SIL.menton)w2=LT-1;                /* le menton se resserre */
if(i===0)w2=LT-1;                           /* le sommet du crâne s'arrondit */
R(-w2-1,YT+i,(w2+1)*2,1,N);
R(-w2,YT+i,w2*2,1,peau);
R(-w2,YT+i,Math.min(3,w2),1,peauO);
}
R(-LT,YT,LT*2,1,peauC);                       /* front éclairé */
if(!prof){R(-LT-2,YT+5,2,3,peauO);R(LT,YT+5,2,3,peau);}   /* oreilles */
if(prof){R(-LT,YT+1,LT*2,HT-1,teint(peau,-12));           /* nuque */
R(-LT,YT+HT-3,LT*2,2,teint(peau,-30));}
if(barbe!=='aucune'&&!prof){
const LB=SIL.tete;                          /* demi-largeur du visage */
const bas=YT+HT-1;                          /* le bas du menton */
const B=chev, BC=chevC, BO=chevO, BT=teint(chev,-40);
const joue=(y0,h2,ep)=>{                    /* les côtés, le long de la mâchoire */
for(let i=0;i<h2;i++){
const w2=LB-(i>=h2-2?1:0);
R(-w2,y0+i,ep,1,B);
R(w2-ep,y0+i,ep,1,BO);
}
};
const menton=(y0,h2,larg)=>{                /* la masse sous la bouche */
for(let i=0;i<h2;i++){
const w2=Math.max(1,larg-(i>=h2-2?1:0)-(i>=h2-1?1:0));
R(-w2,y0+i,w2*2,1,i<1?BC:(i>h2-2?BT:B));
}
};
if(cote){
const av=s>0?1:-4;
if(barbe==='naissante'){g.globalAlpha=.5;R(av-1,YT+7,5,4,BO);g.globalAlpha=1;}
else if(barbe==='fine'){R(av-1,YT+7,5,3,BO);R(av,YT+10,3,1,BT);}
else if(barbe==='courte'){R(av-2,YT+6,6,5,B);R(av-1,YT+10,4,1,BO);}
else if(barbe==='pleine'){R(av-3,YT+5,7,7,B);R(av-3,YT+5,2,7,BO);R(av-2,YT+11,5,2,BT);}
else if(barbe==='longue'){R(av-3,YT+5,7,7,B);R(av-2,YT+11,5,6,B);R(av-2,YT+15,5,2,BT);}
else if(barbe==='bouc'){R(av-1,YT+8,4,5,B);R(av-1,YT+11,4,2,BO);}
else if(barbe==='moustache'){R(av-1,YT+7,4,1,B);R(av+2,YT+7,1,1,BO);}
else if(barbe==='collier'){R(av-4,YT+4,2,8,B);R(av-3,YT+10,6,2,B);}
else if(barbe==='favoris'){R(av-4,YT+3,2,6,B);}
else if(barbe==='impériale'){R(av-1,YT+7,4,1,B);R(av,YT+9,3,3,B);}
else if(barbe==='fourchue'){R(av-3,YT+5,7,7,B);R(av-2,YT+11,2,5,B);R(av+1,YT+11,2,4,BO);}
}else{
if(barbe==='naissante'){                  /* juste une ombre sur la mâchoire */
g.globalAlpha=.42;
joue(YT+6,5,2);menton(YT+9,3,3);
g.globalAlpha=1;
}
else if(barbe==='fine'){
joue(YT+7,4,1);
R(-3,YT+10,6,1,BO);R(-2,YT+11,4,1,BT);
}
else if(barbe==='courte'){
joue(YT+6,5,2);
menton(YT+9,3,4);
R(-3,YT+8,6,1,BC);                      /* le sillon sous la lèvre */
}
else if(barbe==='pleine'){
joue(YT+4,7,2);
menton(YT+8,5,LB-1);
R(-LB+1,YT+4,LB*2-2,1,BC);              /* le haut des joues, éclairé */
R(-2,YT+8,4,1,teint(peau,-30));         /* la bouche reste lisible */
}
else if(barbe==='longue'){
joue(YT+4,7,2);
menton(YT+8,5,LB-1);
for(let i=0;i<6;i++){                   /* elle descend sur la poitrine */
const w2=Math.max(1,4-Math.floor(i/2));
R(-w2,YT+HT+i-1,w2*2,1,i<4?B:BT);
}
R(-LB+1,YT+4,LB*2-2,1,BC);
R(-2,YT+8,4,1,teint(peau,-30));
}
else if(barbe==='bouc'){
R(-2,YT+10,4,3,B);R(-2,YT+10,2,3,BC);R(-1,YT+12,2,1,BT);
R(-3,YT+7,6,1,B);                       /* avec sa moustache */
}
else if(barbe==='moustache'){
R(-3,YT+7,6,1,B);R(-4,YT+7,1,1,BO);R(3,YT+7,1,1,BO);
R(-3,YT+8,2,1,BO);R(1,YT+8,2,1,BO);
}
else if(barbe==='collier'){               /* le tour du visage, joues rasées */
R(-LB,YT+4,1,7,B);R(LB-1,YT+4,1,7,BO);
menton(YT+10,2,4);
R(-3,YT+7,6,1,B);
}
else if(barbe==='favoris'){               /* seulement devant les oreilles */
R(-LB,YT+3,2,5,B);R(LB-2,YT+3,2,5,BO);
R(-LB,YT+7,2,1,BT);R(LB-2,YT+7,2,1,BT);
}
else if(barbe==='impériale'){             /* moustache et touffe sous la lèvre */
R(-4,YT+7,8,1,B);R(-5,YT+6,1,1,BO);R(4,YT+6,1,1,BO);
R(-1,YT+10,3,3,B);R(-1,YT+10,1,3,BC);
}
else if(barbe==='fourchue'){
joue(YT+4,7,2);
menton(YT+8,4,LB-1);
R(-4,YT+HT-1,3,5,B);R(1,YT+HT-1,3,4,BO);   /* les deux pointes */
R(-4,YT+HT+3,3,1,BT);R(1,YT+HT+2,3,1,BT);
R(-LB+1,YT+4,LB*2-2,1,BC);
}
}
}
const C=chev, CC=chevC, CO=chevO, CT=teint(chev,-42);
const tr=bouge?(cote?-s:0):0;
const D={
'courts'      :{vol:2,fr:'courte',pan:3, dos:12},
'très courts' :{vol:1,fr:'rase',  pan:2, dos:12},
'dégradé'     :{vol:3,fr:'cote',  pan:1, dos:12,ras:1},
'bol'         :{vol:2,fr:'droite',pan:5, dos:14},
'carré'       :{vol:2,fr:'droite',pan:9, dos:17},
'mi-longs'    :{vol:2,fr:'cote',  pan:8, dos:18},
'longs'       :{vol:2,fr:'cote',  pan:14,dos:24,large:14},
'très longs'  :{vol:2,fr:'cote',  pan:20,dos:30,large:14},
'queue'       :{vol:2,fr:'courte',pan:2, dos:12,queue:14},
'couettes'    :{vol:2,fr:'droite',pan:2, dos:12,couettes:9},
'chignon'     :{vol:2,fr:'courte',pan:2, dos:12,chignon:1},
'chignon haut':{vol:1,fr:'courte',pan:1, dos:12,chignon:2},
'tresse'      :{vol:2,fr:'cote',  pan:3, dos:12,tresse:1},
'tresses'     :{vol:2,fr:'droite',pan:2, dos:12,tresses:1},
'ondulés'     :{vol:2,fr:'cote',  pan:12,dos:21,onde:1,large:14},
'bouclés'     :{vol:4,fr:'boucle',pan:5, dos:16,boucle:1,large:16},
'afro'        :{vol:6,fr:'rase',  pan:5, dos:16,afro:1,large:18},
'dreads'      :{vol:2,fr:'rase',  pan:9, dos:20,dreads:1,large:14},
'banane'      :{vol:5,fr:'arriere',pan:2,dos:12},
'crête'       :{vol:0,fr:'rase',  pan:0, dos:0, crete:1},
'crâne'       :{vol:0,fr:'rase',  pan:0, dos:0, rase:1},
'hirsute'     :{vol:3,fr:'meche', pan:4, dos:14,hirsute:1}
}[coiffe]||{vol:2,fr:'courte',pan:3,dos:3};
if(D.rase){
R(-6,YT-1,12,2,CO);
if(prof)R(-6,YT-1,12,6,CO);
}else{
if(!D.crete){
R(-6,YT-1-D.vol,12,2+D.vol,C);
R(-6,YT-D.vol,4,1,CC);                    /* la lumière tombe à gauche */
R(4,YT-1-D.vol,2,2+D.vol,CO);
}
if(prof){
const y0=YT-1-D.vol;                      /* le sommet du crâne */
const hd=Math.max(HT+2+D.vol,D.dos);      /* jamais moins que le crâne entier */
const lg=D.large||12;                     /* largeur de la masse */
const g0=-(lg>>1);
R(g0+1,y0,lg-2,hd,C);                     /* corps */
R(g0,y0+1,lg,hd-2,C);                     /* flancs, un pixel plus bas */
R(g0+1,y0+1,4,3,CC);                      /* la lumière en haut à gauche */
R(g0+lg-4,y0+1,3,hd-2,CO);                /* le côté à l'ombre */
R(g0+2,y0+hd-2,lg-4,2,CT);                /* les pointes */
if(D.queue){R(-3,YT+2,6,3,C);                 /* l'attache */
R(-2,YT+4,4,D.queue,C);R(-2,YT+4,2,D.queue,CC);R(-2,YT+D.queue+1,4,3,CT);}
if(D.couettes){R(-9,YT+1,3,D.couettes,C);R(6,YT+1,3,D.couettes,CO);
R(-9,YT+D.couettes-1,3,2,CT);R(6,YT+D.couettes-1,3,2,CT);}
if(D.tresse)for(let i=0;i<6;i++)R(-2,YT+2+i*3,4,3,i%2?CO:C);
if(D.tresses)for(let i=0;i<5;i++){R(-8,YT+1+i*3,3,3,i%2?CO:C);R(5,YT+1+i*3,3,3,i%2?C:CO);}
if(D.chignon===1)R(-3,YT-5-D.vol-reb,6,5,C);
if(D.chignon===2){R(-2,YT-8-reb,5,6,C);R(-2,YT-8-reb,2,2,CC);}
if(D.crete){R(-6,YT-1,12,5,CO);R(-2,YT-9-reb,4,9,C);R(-2,YT-9-reb,2,9,CC);}
}else if(cote){
const der=s>0?-8:6;                        /* le côté opposé au regard */
if(D.pan>1){
R(der+tr,YT+1,3,D.pan,C);
if(D.pan>6)R(der+tr,YT+D.pan-2,3,3,CT);
}
if(D.fr==='droite')R(s>0?-6:0,YT+1,6,2,CO);
if(D.fr==='cote')R(s>0?-2:-4,YT+1,6,2,CO);
if(D.fr==='courte')R(s>0?-1:-5,YT+1,6,1,CO);
if(D.fr==='arriere')R(s>0?-5:0,YT-2-D.vol,6,2,CC);
if(!D.ras&&D.pan>=2)R(s>0?-6:2,YT+1,4,3,C);   /* la tempe visible */
if(D.queue){R(der+tr,YT+1,3,D.queue,C);R(der+tr,YT+D.queue-2,3,3,CT);}
if(D.couettes)R(der+tr,YT+2,3,D.couettes,C);
if(D.tresse)for(let i=0;i<5;i++)R(der+tr,YT+2+i*3,3,3,i%2?CO:C);
if(D.tresses)for(let i=0;i<4;i++)R(der+tr,YT+2+i*3,3,3,i%2?CO:C);
if(D.chignon===1)R(der+2,YT-4-reb,5,5,C);
if(D.chignon===2)R(-1,YT-8-reb,5,6,C);
if(D.crete){R(-6,YT-1,12,4,CO);R(-2,YT-9-reb,4,9,C);}
if(D.afro){R(der-1,YT-6,5,10,C);R(-6,YT-7,12,7,C);R(-6,YT-6,4,3,CC);}
if(D.dreads)for(let i=0;i<4;i++)R(der+tr,YT+1+i*3,3,7,i%2?CO:C);
if(D.boucle){R(der,YT-4,4,7,C);R(-6,YT-5,12,5,C);R(-6,YT-4,4,2,CC);}
}else{
if(D.fr==='droite')R(-6,YT+1,12,2,CO);     /* frange qui barre le front */
if(D.fr==='cote'){R(-6,YT+1,7,2,CO);R(1,YT+1,5,1,CO);}
if(D.fr==='courte')R(-6,YT+1,12,1,CO);
if(D.fr==='meche'){R(-6,YT+1,5,2,CO);R(2,YT+1,4,1,CO);}
if(D.fr==='boucle'){R(-6,YT+1,4,2,C);R(-1,YT+1,3,2,CO);R(3,YT+1,3,2,C);}
if(!D.ras&&D.pan>=2){                       /* les tempes, seulement si la coupe les a */
const ht=Math.max(3,Math.min(5,D.pan));
R(-6,YT+1,2,ht,C);
R(4,YT+1,2,ht,CO);
}
if(D.pan>4){                                /* les pans qui pendent */
R(-7+tr,YT+1,2,D.pan,C);
R(5+tr,YT+1,2,D.pan,CO);
R(-7+tr,YT+D.pan-2,2,3,CT);
R(5+tr,YT+D.pan-2,2,3,CT);
}
if(D.onde){R(-8+tr,YT+4,2,5,C);R(6+tr,YT+4,2,5,CO);}
if(D.queue){R(5+tr,YT+1,2,3,C);R(6+tr,YT+2,1,3,CO);}  /* elle dépasse à peine */
if(D.couettes){
R(-8+tr,YT,3,D.couettes,C);      R(5+tr,YT,3,D.couettes,CO);
R(-8+tr,YT,3,1,CC);
R(-8+tr,YT+D.couettes,2,2,CT);   R(6+tr,YT+D.couettes,2,2,CT);}
if(D.tresse){R(5+tr,YT+1,3,4,CO);}
if(D.tresses)for(let i=0;i<4;i++){R(-8+tr,YT+1+i*3,3,3,i%2?CO:C);R(5+tr,YT+1+i*3,3,3,i%2?C:CO);}
if(D.chignon===1){R(-3,YT-3-D.vol-reb,5,3,C);R(-3,YT-3-D.vol-reb,2,1,CC);R(1,YT-3-D.vol-reb,1,3,CO);}
if(D.chignon===2){R(-2,YT-8-reb,5,6,C);R(-2,YT-8-reb,2,2,CC);R(-3,YT-3,7,2,C);}
if(D.afro){R(-9,YT-6,18,8,C);R(-9,YT-5,6,3,CC);R(5,YT-6,4,8,CO);
R(-9,YT+1,3,5,C);R(6,YT+1,3,5,CO);}
if(D.boucle){R(-7,YT-4,14,5,C);R(-7,YT-3,4,2,CC);R(4,YT-4,3,5,CO);
R(-8,YT+1,3,4,C);R(5,YT+1,3,4,CO);R(-5,YT-6,4,2,CC);R(1,YT-6,4,2,C);}
if(D.dreads){                              /* elles encadrent le visage, sans le couvrir */
for(let i=0;i<3;i++){
R(-8+tr,YT+1+i*4,3,5,i%2?CO:C);
R(5+tr,YT+1+i*4,3,5,i%2?C:CO);
}
R(-6,YT+1,12,2,CO);                       /* la racine sur le front */
R(-8+tr,YT+11,3,2,CT);R(5+tr,YT+11,3,2,CT);
}
if(D.crete){R(-6,YT-1,12,2,CO);R(-2,YT-9-reb,4,9,C);R(-2,YT-9-reb,2,9,CC);}
if(D.hirsute){R(-8,YT-3,3,3,C);R(5,YT-4,3,3,CO);R(-3,YT-4-reb,3,3,C);R(2,YT-5-reb,2,3,CC);}
if(D.fr==='arriere'){
R(-5,YT-2-D.vol,10,2,C);
R(-4,YT-4-D.vol,8,2,C);
R(-2,YT-5-D.vol,6,1,CC);
R(3,YT-4-D.vol,2,4,CO);}
}
}
const LTc=SIL.tete;                              /* demi-largeur de la tête */
if(chapeau==='casquette'){
R(-LTc-1,YT-4,(LTc+1)*2,4,'#3f5f6b');          /* la calotte épouse le crâne */
R(-LTc-1,YT-4,(LTc+1)*2,1,'#547a88');
R(-LTc,YT-1,LTc*2,1,'#33505a');
const vx=cote?(s>0?1:-LTc*2-1):-LTc-1;         /* la visière part vers l'avant */
R(vx,YT,LTc*2+1,2,'#33505a');
R(vx,YT,LTc*2+1,1,'#456a76');
}
else if(chapeau==='bandana'){
R(-LTc-1,YT-2,(LTc+1)*2,3,'#a8524a');
R(-LTc-1,YT-2,(LTc+1)*2,1,'#c46a5e');
R(-LTc+1,YT-1,3,1,'#8f4038');                  /* le nœud */
R(LTc-1+tr,YT,3,5,'#8f4038');                  /* les pans qui pendent */
R(LTc-1+tr,YT+4,3,1,'#71322c');
}
else if(chapeau==='bonnet'){
R(-LTc-1,YT-6,(LTc+1)*2,6,'#8a4a3a');
R(-LTc-1,YT-6,(LTc+1)*2,1,'#a85c48');
R(-LTc-1,YT-1,(LTc+1)*2,2,'#a85c48');          /* le revers */
R(-LTc-1,YT+1,(LTc+1)*2,1,'#71392c');
R(-2,YT-9-reb,4,3,'#c07260');                  /* le pompon */
R(-2,YT-9-reb,2,1,'#d9897a');
}
else if(chapeau==='capuche'){
R(-LTc-2,YT-5,(LTc+2)*2,HT+3,'#54606b');       /* le tissu enveloppe la tête */
R(-LTc-2,YT-5,(LTc+2)*2,2,'#68757f');
R(-LTc-2,YT+3,2,HT-5,'#465059');
R(LTc,YT+3,2,HT-5,'#465059');
R(-LTc,YT+1,LTc*2,HT-2,peau);                  /* le visage reste dégagé */
R(-LTc,YT+1,3,HT-2,peauO);
R(-LTc,YT+1,LTc*2,1,teint(peau,-30));          /* l'ombre de la capuche */
}
else if(chapeau==='chapeau'){
R(-LTc-4,YT-1,(LTc+4)*2,2,'#5a4a2c');          /* le bord large */
R(-LTc-4,YT-1,(LTc+4)*2,1,'#7a663c');
R(-LTc,YT-6,LTc*2,5,'#8f7a49');                /* la calotte */
R(-LTc,YT-6,LTc*2,1,'#a08a56');
R(-LTc,YT-3,LTc*2,2,'#5a4a2c');                /* le ruban */
}
else if(chapeau==='beret'){
R(-LTc-1,YT-4,(LTc+1)*2-1,4,'#2f4a5c');
R(-LTc-1,YT-4,LTc,2,'#3f6076');
R(LTc-2,YT-6-reb,2,2,'#2f4a5c');               /* la queue sur le dessus */
}
else if(chapeau==='cagoule'){
R(-LTc-1,YT-2,(LTc+1)*2,HT+2,'#3a3a44');
R(-LTc-1,YT-2,(LTc+1)*2,2,'#4a4a56');
if(!prof){R(-4,YT+4,3,3,peau);R(1,YT+4,3,3,peau);}   /* les deux fentes */
R(-LTc-1,YT+HT-2,(LTc+1)*2,1,'#2b2b33');
}
const blanc='#f6f3ec', ombreOeil=teint(peau,-38);
if(dir==='bas'&&chapeau==='cagoule'){
R(-4,YT+5,3,2,oeil);R(2,YT+5,3,2,oeil);      /* on ne voit que les yeux */
}else if(dir==='bas'){
const clin=(Date.now()+x*53)%4600<130;
if(sourcil==='fins'){R(-4,YT+3,3,1,chevO);R(2,YT+3,3,1,chevO);}
if(sourcil==='epais'){R(-4,YT+2,3,2,chevO);R(2,YT+2,3,2,chevO);}
if(sourcil==='arques'){R(-4,YT+3,2,1,chevO);R(-2,YT+2,1,1,chevO);
R(3,YT+3,2,1,chevO);R(2,YT+2,1,1,chevO);}
if(sourcil==='fronces'){R(-4,YT+3,3,1,chevO);R(2,YT+3,3,1,chevO);
R(-1,YT+3,2,1,chevO);}
R(-4,YT+4,3,1,ombreOeil);R(2,YT+4,3,1,ombreOeil);
if(clin){R(-4,YT+6,3,1,chevO);R(2,YT+6,3,1,chevO);}
else{
const dessine=(gx,h,ty)=>{
R(gx,YT+ty,3,h,blanc);
R(gx+1,YT+ty,1,h,oeil);                 /* iris */
R(gx+1,YT+ty,1,1,teint(oeil,40));       /* reflet */
};
if(fy==='ronds'){dessine(-4,3,4);dessine(2,3,4);}
else if(fy==='plisses'){R(-4,YT+5,3,1,oeil);R(2,YT+5,3,1,oeil);}
else if(fy==='fatigues'){dessine(-4,2,5);dessine(2,2,5);
R(-4,YT+7,3,1,peauT);R(2,YT+7,3,1,peauT);}
else if(fy==='doux'){dessine(-4,2,5);dessine(2,2,5);
R(-4,YT+4,3,1,peau);R(2,YT+4,3,1,peau);}
else if(fy==='severes'){dessine(-4,2,5);dessine(2,2,5);
R(-4,YT+4,3,1,chevO);R(2,YT+4,3,1,chevO);}
else{dessine(-4,2,5);dessine(2,2,5);}
}
if(nez==='petit'){R(0,YT+7,1,1,peauT);}
if(nez==='droit'){R(0,YT+6,1,2,ombreOeil);R(0,YT+8,1,1,peauT);}
if(nez==='large'){R(-1,YT+7,3,1,ombreOeil);R(-1,YT+8,3,1,peauT);}
if(nez==='retrousse'){R(0,YT+6,1,2,ombreOeil);R(-1,YT+8,2,1,peauT);}
if((fy==='doux'||fy==='ronds')&&!clin){R(-5,YT+4,1,1,chevO);R(4,YT+4,1,1,chevO);}
const lev=(bouche==='lèvres');
if(bouche==='neutre')R(-2,YT+9,4,1,teint(peau,-64));
if(lev){R(-2,YT+9,4,1,'#b06a68');R(-2,YT+10,4,1,teint(peau,-24));R(-1,YT+8,2,1,'#c47f7c');}
if(bouche==='sourire'){R(-2,YT+9,4,1,SIL.levres?'#b06a68':teint(peau,-64));
R(-3,YT+8,1,1,peauO);R(2,YT+8,1,1,peauO);R(-1,YT+10,2,1,teint(peau,-30));}
if(bouche==='severe'){R(-3,YT+9,6,1,teint(peau,-70));}
if(bouche==='entrouverte'){R(-2,YT+9,4,1,teint(peau,-70));R(-1,YT+10,2,1,'#8a4a4a');}
if(bouche==='pincée'){R(-1,YT+9,3,1,teint(peau,-70));R(-2,YT+9,1,1,peauT);R(2,YT+9,1,1,peauT);}
if(marque==='taches'){R(-4,YT+7,1,1,peauT);R(-2,YT+8,1,1,peauT);R(3,YT+7,1,1,peauT);R(2,YT+6,1,1,peauT);}
if(marque==='cicatrice'){R(3,YT+2,1,5,teint(peau,-46));R(2,YT+3,1,1,teint(peau,-46));}
if(marque==='grain'){R(-3,YT+8,1,1,teint(peau,-70));}
if(marque==='fard'){R(-4,YT+8,3,1,'#c9707a');R(2,YT+8,3,1,'#c9707a');}
if(marque==='peinture'){R(-4,YT+4,3,3,'#a8524a');R(2,YT+4,3,3,'#a8524a');
R(-4,YT+4,3,1,'#c46a5e');R(2,YT+4,3,1,'#c46a5e');}
const oy=YT+7, ox=SIL.tete+1;
if(boucle==='anneau'){R(-ox,oy,1,2,'#c9a24a');R(ox-1,oy,1,2,'#c9a24a');}
if(boucle==='perle'){R(-ox,oy,1,1,'#f2efe4');R(ox-1,oy,1,1,'#f2efe4');}
if(boucle==='plume'){R(ox-1,oy,1,4,'#4a7d7d');R(ox-1,oy+3,1,1,'#7fbdbd');}
}else if(cote){
const dx=s>0?2:-4;
if(sourcil==='epais')R(dx,YT+2,2,2,chevO);else R(dx,YT+3,2,1,chevO);
R(dx,YT+4,2,1,ombreOeil);
R(dx,YT+5,2,2,blanc);
R(dx+(s>0?1:0),YT+5,1,2,oeil);
R(s>0?5:-6,YT+6,1,2,peauT);                 /* le nez dépasse du profil */
R(s>0?4:-5,YT+9,2,1,teint(peau,-64));       /* bouche */
if(boucle!=='aucune')R(s>0?-4:3,YT+7,1,2,boucle==='perle'?'#f2efe4':'#c9a24a');
if(marque==='fard')R(dx-1,YT+8,3,1,'#c9707a');
}
if(emRepere)g.restore();
}
/* ================= LES MESURES DU CORPS =================*/
const PASM=24;
/* ================= LES PROPORTIONS =================
   Mesuré sur la pose à l'arrêt : 44,5 px de haut, hanche à 11,5 px du
   sol, épaules à 25,5. Les jambes faisaient donc 26 % de sa taille et le
   torse 31 % — le torse plus long que les jambes, c'est la définition du
   trapu. Un humain : jambes 48 %, torse 30 %.

   On remonte la hanche de cinq unités et on remonte le haut du corps
   d'autant : les jambes gagnent 22 %, le torse et la tête gardent
   exactement leur longueur, et le personnage grandit de 2,5 px. Le choix
   inverse — remonter la hanche seule — aurait raccourci le torse de 14 %
   et tout le vêtement est calé dessus.

   L'autre gain est mécanique : le pas de 11 px valait 0,96 longueur de
   jambe, au-delà du confortable humain (0,8), et l'IK du genou étirait
   déjà la jambe de 10 % en bout de foulée. Il vaut maintenant 0,79, et
   l'étirement tombe à 4 % une fois l'amorti du talon compté.

   TOUT CE QUI EST CALÉ SUR LA HANCHE lit ces deux constantes : le dessin
   de profil, celui de face, celui de trois quarts et le modèle de pose.
   Les vêtements, eux, sont calés sur yHan et yEp, donc ils suivent. */
const Y_HANCHE=-36, Y_PIED=-3;
/* LE GENOU DE FACE était à -14 pour une hanche à -26 et une cheville à
   -5 : douze unités de cuisse pour neuf de mollet. On garde ce rapport
   sur la jambe allongée, sinon le mollet devient plus long que la cuisse. */
const Y_GENOU_F=-17;
/* ================= LA LONGUEUR DU PAS =================
   Le pied va de -PAS_U à +PAS_U autour de la hanche : le pas vaut donc
   PAS_U unités, soit PAS_U/2 pixels. Le confortable humain est 0,8 fois
   la longueur de jambe — pour une jambe de 33 unités, treize.

   Il valait onze pour une jambe de vingt-trois (0,96 : trop long, la
   jambe s'étirait). Il vaudrait 0,67 sur la jambe allongée si on n'y
   touchait pas, et le personnage marcherait à petits pas avec de
   grandes jambes.

   PAS_34 est le même pas vu de trois quarts. Une diagonale est à
   quarante-cinq degrés, donc la foulée se raccourcit de cos 45°, soit
   0,71 : neuf unités pour treize. L'ancien rapport valait 0,54 — les
   jambes ne se séparaient presque pas et la marche de trois quarts ne
   montrait pas de foulée du tout.

   QUI LIT CES DEUX CONSTANTES doit les lire ensemble : le pédalage
   convertit une position sur la manivelle en avance de pied, donc il
   divise par PAS_U ce que le dessin multiplie. Les désaccorder ferait
   pédaler le personnage à côté de ses pédales. */
const PAS_U=13, PAS_34=9;
/* ================= LA CADENCE, DÉRIVÉE =================
   Elle était écrite en dur. Le jour où le cycle est passé de seize images
   à vingt-quatre, le même coefficient a donné une foulée une fois et
   demie plus lente — la marche avait l'air de patiner sur place, et rien
   dans le code ne disait pourquoi. Elle se calcule donc, maintenant.

   Le seul chiffre choisi est GLISSE : la part de la distance que les
   pieds posent vraiment sous un corps qui va plus vite qu'eux. Quarante-
   cinq pour cent de glissement, c'est le compromis assumé de la
   quasi-totalité des jeux en deux dimensions (voir LA CADENCE DE LA
   FOULÉE, plus bas). Tout le reste en découle :

     un pas               = PAS_U pixels (deux unités de dessin par pixel)
     un cycle             = deux pas, donc 2·PAS_U pixels
     cycles par seconde   = GLISSE · v / (2·PAS_U)
     et `pas` avance d'un demi par image de cycle,
     donc                   pas/s = cycles/s · PASM/2

   Changer PASM, PAS_U ou GLISSE recale maintenant les trois autres tout
   seul. C'est le seul moyen de ne pas refaire la même erreur. */
const GLISSE=0.55;
const CADENCE_PAS=GLISSE*PASM/(4*PAS_U);
const CASE_L=64, CASE_H=80;           /* la boîte d'une pose */
const POSES=new Map();                /* une planche par apparence rencontrée */
const clePose=(ap)=>{
let c=STYLE_FIN()?'fin|':'';for(const k in ap){const v=ap[k];c+=(v&&typeof v==='object'?JSON.stringify(v):v)+',';}
return c;
};
/* LE PIXEL FIN POUR TOUT LE MONDE. Le classique n'est plus proposé : un
   seul dessin à soigner, et tous les joueurs voient la même chose. Le code
   de spriteClassique reste en place comme filet de sécurité, mais rien ne
   l'appelle plus. */
const STYLE_FIN=()=>true;
const PLAFOND_PLANCHES=24;
/* L'APERÇU D'UNE BOUTIQUE : on retire le déguisement, sinon l'épouvantail
   s'affiche à la place des vêtements qu'on essaie. */
function sansDeguisement(ap){
  const a=Object.assign({},ap||{});
  delete a.deguisement;delete a.maillot;
  return a;
}
function planche(ap){
const cle=clePose(ap);
let P=POSES.get(cle);
if(P){if(POSES.size>1){POSES.delete(cle);POSES.set(cle,P);}return P;}
if(POSES.size>=PLAFOND_PLANCHES)POSES.delete(POSES.keys().next().value);
P={cle,dirs:{}};POSES.set(cle,P);
return P;
}
function poseDe(ap,dir,i){
const P=planche(ap);
let L=P.dirs[dir];
if(!L){L=P.dirs[dir]=[];}
if(L[i])return L[i];
const c=document.createElement('canvas');
const D=STYLE_FIN()?finesseGravure():Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
c.width=CASE_L*D;c.height=CASE_H*D;
const g=c.getContext('2d');
g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const sauve=GESTE;GESTE={t:0};
if(STYLE_FIN()){g.setTransform(1,0,0,1,0,0);
/* LE CLIGNEMENT AJOUTE 300 À UNE POSE : il va donc jusqu'à 407 (repos
   100..107 + 300). Le pédalage commence à 500 pour ne pas tomber dedans —
   c'est ce qui l'avait rendu muet au premier essai, 404 étant lu comme
   « pose 104 qui cligne ». */
const cl=i>=300&&i<500, j=cl?i-300:i;
if(j>=500&&j<516){
/* LE PÉDALAGE : seize images pour un tour de manivelle. Elles se gravent
   et se gardent comme les autres poses — on ne recalcule rien par image. */
VELO_FIN={k:(j-500)/16};
g.drawImage(graverFin(ap,dir,0,true,0,false),0,0,c.width,c.height);
VELO_FIN=null;
}
else if(j>=800&&j<830){
/* LA TÊTE TOURNÉE à l'arrêt : 800 vers la gauche, 820 vers la droite.
   Huit images chacune, celles de la respiration. */
TETE_FIN=j<820?-1:1;
g.drawImage(graverFin(ap,dir,0,false,j-(j<820?800:820),false),0,0,c.width,c.height);
TETE_FIN=0;
}
else if(j>=700&&j<730){
/* LE VISAGE : 700 regard à gauche, 710 à droite, 720 demi-clignement.
   Huit images chacune — celles de la respiration, qui continue. */
const base=j<710?700:(j<720?710:720);
FACE_FIN={regard:base===700?-1:(base===710?1:0), mi:base===720};
g.drawImage(graverFin(ap,dir,0,false,j-base,false),0,0,c.width,c.height);
FACE_FIN=null;
}
else if(j>=900&&j<908){
/* DEBOUT SUR LA TROTTINETTE : huit images, celles de la respiration. On
   ne pose pas cette famille a 600 ni a 700 — elles sont prises par les
   micro-pauses et le visage — ni a 800, prise par la tete tournee. 900
   est libre, et reste sous la barre du clignement, qui ajoute 300. */
TROT_FIN=true;
g.drawImage(graverFin(ap,dir,0,false,j-900,false),0,0,c.width,c.height);
TROT_FIN=false;
}
else if(j>=600&&j<640){
/* UNE MICRO-PAUSE : douze images, gravées et gardées comme les autres.
   600 pour le report de poids, 620 pour la grande inspiration. */
const type=j<620?'appui':'souffle';
const et=(j-(j<620?600:620))/11;
REPOS_FIN={type:type,k:Math.max(0,Math.min(1,et))};
g.drawImage(graverFin(ap,dir,0,false,0,false),0,0,c.width,c.height);
REPOS_FIN=null;
}
else if(j>=200&&j<260){
/* UNE TRANSITION : élan, freinage ou pivot, sur cinq étapes. Le pivot en
   occupe deux familles, 240 à droite et 245 à gauche. */
const type=j<220?'elan':(j<240?'frein':(j<250?'pivot':'lance'));
const base=type==='elan'?200:(type==='frein'?220:(type==='lance'?250:(j<245?240:245)));
const et=(j-base)/4;
TRANS_FIN={type:type,k:Math.max(0,Math.min(1,et)),sens:(type==='pivot'&&j>=245)?-1:1};
const enMarche=(type!=='frein');
g.drawImage(graverFin(ap,dir,et*1.4,enMarche,0,false),0,0,c.width,c.height);
TRANS_FIN=null;
}else{
const repos=j>=100;
g.drawImage(graverFin(ap,dir,repos?0:(j?(j-1)/2:0),!repos&&j>0,repos?j-100:0,cl),0,0,c.width,c.height);}
CLIGNE_FIN=false;}
else spriteClassique(g,CASE_L/2,CASE_H-10,ap,dir,i?(i-1)/2:0,i>0);
GESTE=sauve;
L[i]=c;
return c;
}
const ETAPES_GESTE=8, ETAPES_EMOTE=12;
const PLAFOND_GESTES=120;
const GESTES_GRAVES=[];
function poseDuGeste(ap,dir,pas,marche,type,part){
const P=planche(ap);
if(!P.gestes)P.gestes={};
const emote=String(type||'').slice(0,3)==='em:';
const n=emote?ETAPES_EMOTE:ETAPES_GESTE;
const etape=Math.max(0,Math.min(n-1,Math.round(part*(n-1))));
const pied=marche?(1+(Math.floor(pas*2)%PASM)):0;
const cle=dir+'|'+type+'|'+etape+'|'+pied;
if(P.gestes[cle])return P.gestes[cle];
const c=document.createElement('canvas');
const D=Math.max(1,Math.min(2,Math.floor(window.devicePixelRatio||1)));
c.width=CASE_L*D;c.height=CASE_H*D;
const g=c.getContext('2d');
g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;
const sauve=GESTE;
const duree=emote?((EMOTE_DE(type.slice(3))||{duree:2}).duree):1;
GESTE={t:1-etape/(n-1), type:type,
tt:(etape/(n-1))*duree, duree:duree, impact:false, cible:null};
try{sprite(g,CASE_L/2,CASE_H-10,ap,dir,pied?(pied-1)/2:0,!!pied);}catch(x){}
GESTE=sauve;
P.gestes[cle]=c;
GESTES_GRAVES.push({P,cle});
while(GESTES_GRAVES.length>PLAFOND_GESTES){
const v=GESTES_GRAVES.shift();
if(v.P.gestes)delete v.P.gestes[v.cle];
}
return c;
}
function cosmetiqueDe(ap){
if(!ap||!ap.cos)return null;
return COSMETIQUES.find(c=>c.id===ap.cos)||null;
}
/* ================= LE DESSIN FIN =================*/
function spriteFin(g,x,y,ap0,dir,pas,bouge){
const p=Object.assign({},DEF_AP,ap0||{}), P=PALETTES;
appliquerDeguisement(p);
const diag=String(dir).indexOf('-')>0, tourne=diag?(String(dir).endsWith('droite')?1:-1):0;
if(diag)dir=String(dir).startsWith('bas')?'bas':'haut';
const u=0.5, cote=dir==='gauche'||dir==='droite', dos=dir==='haut', s=dir==='gauche'?-1:1;
const vis=dos?-tourne:tourne;                  /* le visage glisse vers le côté où l'on regarde */
const R=(a,b,w,h,c)=>{if(w<=0||h<=0)return;g.fillStyle=c;
const ax=cote&&s<0?-(a+w):a;g.fillRect(x+ax*u,y+b*u,w*u,h*u);};
const seg=(x1,y1,x2,y2,ep,c)=>{const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)));
for(let i=0;i<=n;i++){const t=i/n;R(Math.round(x1+(x2-x1)*t-ep/2),Math.round(y1+(y2-y1)*t-ep/2),ep,ep,c);}};
const T=teint;
const peau=P.peau[p.peau]||P.peau[2], peauO=T(peau,-26), peauC=T(peau,16), peauT=T(peau,-58);
const COUPE=SALON_PAR_ID[p.coupe], TEINTE=SALON_PAR_ID[p.teinte];
const cometeC=COUPE&&COUPE.collector;
const chev=(cometeC&&COUPE.col)||(TEINTE&&TEINTE.col)||(COUPE&&COUPE.col)||P.cheveux[p.cheveux]||P.cheveux[2], chevC=T(chev,26), chevO=T(chev,-26);
const POINTES=(cometeC&&COUPE.pointes)||(TEINTE&&TEINTE.pointes)||(COUPE&&COUPE.pointes)||null;
const hexOu=(v,liste)=>typeof v==='string'&&v[0]==='#'?v:(liste[v]||liste[0]);
const vest=hexOu(p.veste,P.veste), vestC=T(vest,22), vestO=T(vest,-28), vestT=T(vest,-56);
const pant=hexOu(p.pantalon,P.pantalon), pantO=T(pant,-20), pantC=T(pant,14);
const chau=hexOu(p.chaussures,P.chaussures), chauC=T(chau,24), chauO=T(chau,-24);
const oeil=P.yeux[p.yeux]||P.yeux[0];
const sacC=P.sac[p.sac]||'aucun';
const coiffe=(SALON_PAR_ID[p.coupe]&&SALON_PAR_ID[p.coupe].forme)||COIFFES[p.coiffe]||'courts', barbe=BARBES[p.barbe]||'aucune', chapeau=CHAPEAUX[p.chapeau]||'aucun';
const fy=YEUX_F[p.formeYeux]||'normaux', sourcil=SOURCILS[p.sourcils]||'fins', nez=NEZ[p.nez]||'droit';
const bouche=BOUCHES[p.bouche]||'neutre', marque=MARQUES[p.marque]||'aucune', boucle=BOUCLES[p.boucle]||'aucune';
const hautT=HAUTS[p.haut]||'veste', basT=BAS[p.bas]||'pantalon', soulier=SOULIERS[p.souliers]||'bottes';
/* UNE SEULE SILHOUETTE EN PIXEL FIN. Les coupes de cheveux, les tenues et
   les gestes sont calés sur un crâne unique : plus de dessin qui va sur une
   morphologie et déborde sur une autre. Le classique garde les cinq. */
const SILN='fine';
const SIL=[11,9,11];

const Y_EPAULE=-64, Y_COU=-68, Y_TETE=-91;       /* l'ancien -54 / -58 / -81, remonté de 10 */
const SX={bras:[4,3],jambe:7,cou:6,ventre:0,pec:0};
const EP=SIL[0], TA=SIL[1], HA=SIL[2], N='#1b1712';
const F=bouge?(Math.floor(pas*2)%PASM):-1, ph=bouge?F/PASM*Math.PI*2:0;
const COURSE=!!p.court&&bouge, tC=bouge?F/PASM:0;
/* ================= LES MICRO-PAUSES =================
   À l'arrêt, le personnage respirait et c'était tout : la même boucle de
   huit temps, à l'infini. Une micro-pause casse cette boucle — un report
   de poids franc, ou une grande inspiration — et c'est elle qui donne
   l'impression qu'il attend plutôt qu'il ne tourne en rond.

   Elle ne dessine RIEN de neuf. Elle pousse les leviers qui existaient
   déjà : le souffle, la hauteur du bassin, l'avance des pieds, le
   glissement du buste. Aucun second dessin à maintenir.

   LES COURBES SONT DES TABLES, pas des formules — comme BOB_M pour la
   marche. Essayé d'abord avec une enveloppe continue : tout passe par des
   arrondis à l'unité, donc les douze images se réduisaient à trois états
   et la tenue restait figée sur six images identiques. En table, on place
   les paliers à la main et le geste garde un escalier : il s'installe en
   trois temps, s'affaisse encore un peu au milieu, et revient en trois. */
const RP=(typeof REPOS_FIN==='object'&&REPOS_FIN&&!bouge)?REPOS_FIN:null;
const rpF=RP?Math.max(0,Math.min(11,Math.round((RP.k||0)*11))):0;
/* le report de poids : le buste glisse au-dessus d'une jambe (sway), le
   bassin se tasse (bob), la jambe libre glisse et sa pointe se relève */
const RP_APPUI={
sway  :[0, 1, 1, 2, 2, 2, 2, 3, 3, 2, 1, 0],
bob   :[0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0],
pied  :[0,.06,.14,.19,.20,.21,.21,.24,.24,.17,.08, 0],
pointe:[0,.10,.30,.42,.44,.44,.44,.48,.48,.32,.14, 0]};
/* la grande inspiration : le bassin monte, les épaules montent d'une unité
   de plus, la poitrine s'ouvre — puis tout retombe d'un cran : le soupir */
const RP_SOUFFLE={
ep  :[0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
bob :[0,-1,-1,-2,-2,-2,-2,-1, 0, 1, 1, 0],
poit:[0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]};
const rpA=(RP&&RP.type==='appui')?RP_APPUI:null;
const rpS=(RP&&RP.type==='souffle')?RP_SOUFFLE:null;
/* ================= LA FOULÉE EN KEYFRAMES =================
   La foulée n'est plus une formule mais une table de poses clés, lues et
   interpolées. L'intérêt : une formule est forcément régulière, alors qu'une
   table peut porter des accents — un temps d'arrêt au contact, un passage
   plus vif que son voisin. C'est ce qui sépare une marche vivante d'un
   balancier.

   Les petits mouvements restent procéduraux : la brise dans les cheveux, la
   respiration, l'amorti du talon, le balancement du buste. Seule la
   trajectoire des pieds passe en table.

   t : la phase, de 0 à 1.  x : l'avance, de +1 (devant) à −1 (derrière).
   lift : la levée.  pointe / talon : le déroulé du pied. */
const FOULEE={
marche:[
{t:0.00, x: 1.00, lift:0.00, pointe:0, talon:1.0},   /* le talon touche */
{t:0.04, x: 0.92, lift:0.00, pointe:0, talon:0.8},   /* le double appui : les deux
                                                        pieds portent ensemble */
{t:0.08, x: 0.78, lift:0.00, pointe:0, talon:0.4},   /* le pied se déroule */
{t:0.16, x: 0.55, lift:0.00, pointe:0, talon:0},     /* le poids passe dessus */
{t:0.30, x: 0.12, lift:0.00, pointe:0, talon:0},     /* la jambe porte, sous le corps */
{t:0.42, x:-0.42, lift:0.00, pointe:0.5, talon:0},   /* le talon décolle */
{t:0.50, x:-1.00, lift:0.00, pointe:1.0, talon:0},   /* la pointe pousse */
{t:0.58, x:-0.82, lift:0.55, pointe:0.3, talon:0},   /* le pied quitte le sol */
{t:0.70, x:-0.20, lift:1.00, pointe:0, talon:0},     /* le passage, au plus haut */
{t:0.84, x: 0.55, lift:0.72, pointe:0, talon:0},     /* la jambe se tend */
{t:0.94, x: 0.96, lift:0.08, pointe:0, talon:0.6},   /* elle se prépare au contact */
{t:0.97, x: 0.99, lift:0.00, pointe:0, talon:0.9},   /* elle touche avant la fin du
                                                        cycle : le second appui */
{t:1.00, x: 1.00, lift:0.00, pointe:0, talon:1.0}],
course:[
{t:0.00, x: 0.86, lift:0.00, pointe:0.3, talon:0.5},
{t:0.08, x: 0.45, lift:0.00, pointe:0,   talon:0},   /* l'appui est bref */
{t:0.20, x:-0.10, lift:0.00, pointe:0.2, talon:0},
{t:0.34, x:-0.80, lift:0.10, pointe:1.0, talon:0},   /* la poussée */
{t:0.44, x:-1.00, lift:0.90, pointe:0.6, talon:0},   /* les deux pieds en l'air */
{t:0.58, x:-0.30, lift:1.70, pointe:0,   talon:0},   /* le talon vient aux fesses */
{t:0.72, x: 0.45, lift:1.45, pointe:0,   talon:0},
{t:0.86, x: 0.95, lift:0.75, pointe:0,   talon:0.3},
{t:0.96, x: 0.98, lift:0.42, pointe:0,   talon:0.6},   /* LA SUSPENSION : le pied
                                                        arrière était déjà presque
                                                        posé (0,25) quand l'autre
                                                        était au plus haut. Les deux
                                                        pieds quittent le sol en même
                                                        temps — c'est ce qui sépare
                                                        une course d'une marche vive. */
{t:1.00, x: 0.86, lift:0.00, pointe:0.3, talon:0.5}]};
/* LA LECTURE : on cherche les deux poses clés qui encadrent la phase et on
   interpole entre elles. La courbe « douce » évite les ruptures. */
const lireFoulee=(piste,t)=>{
let a=piste[0], b=piste[piste.length-1];
for(let i=0;i<piste.length-1;i++){
if(t>=piste[i].t&&t<=piste[i+1].t){a=piste[i];b=piste[i+1];break;}}
const span=b.t-a.t;
const k=span<=0?0:(t-a.t)/span;
const e=k*k*(3-2*k);
const m=(c1,c2)=>c1+(c2-c1)*e;
return {x:m(a.x,b.x), lift:m(a.lift,b.lift),
pointe:m(a.pointe,b.pointe), talon:m(a.talon,b.talon)};};
const pied=(phi)=>{phi=((phi%1)+1)%1;
return lireFoulee(COURSE?FOULEE.course:FOULEE.marche,phi);};
let pG=bouge?pied(tC):{x:0,lift:0,pointe:0,talon:0}, pD=bouge?pied(tC+0.5):{x:0,lift:0,pointe:0,talon:0};
/* LE REPORT DE POIDS passe par les pieds : la jambe libre glisse de deux
   unités et sa pointe se relève, la jambe porteuse reste plantée. Un
   dixième d'avance suffit — au-delà il fait un pas, et ce n'est plus une
   pause mais un déplacement. */
if(rpA){
pD={x:rpA.pied[rpF], lift:0, pointe:rpA.pointe[rpF], talon:0};
pG={x:-rpA.pied[rpF]*0.35, lift:0, pointe:0, talon:0};
}
/* ================= LE PÉDALAGE : LES PIEDS SUR LE CERCLE =================
   Le dessin de la jambe pose le pied en fx = cx + avance*11 et
   fy = -3 - leve*6, puis remonte le genou par cinématique inverse. On n'a
   donc rien à réécrire : il suffit de donner au pied, au lieu d'un va-et-
   vient, un point du cercle de la manivelle — et le genou se plie tout
   seul, comme il faut.
   Le pied tourne vers l'arrière quand on regarde la gauche : le sens est
   porté par le signe de la vue, sinon on pédalerait à l'envers. */
/* (on ne l'appelle pas VELO : ce nom est deja pris par le drapeau du jeu) */
const PEDALE=(typeof VELO_FIN==='object'&&VELO_FIN)?VELO_FIN:null;
/* DEBOUT SUR LA TROTTINETTE : les bras vont au guidon comme a velo, mais
   rien d'autre ne suit — ni les hanches, ni les jambes. */
const TROT=(typeof TROT_FIN!=='undefined')&&TROT_FIN===true;
if(PEDALE){
  const sv=(dir==='gauche')?-1:1;
  const demiH=SIL[2]/2;
  const surCercle=(ph2,cx0)=>{
    const a=ph2*Math.PI*2*sv;
    const fx=VELO_BB.x+Math.cos(a)*VELO_BB.r, fy=VELO_BB.y+Math.sin(a)*VELO_BB.r;
    return {x:(fx-cx0)/PAS_U, lift:(-3-fy)/6,
            /* la cheville suit le plateau : pointe en bas de course,
               talon qui remonte au passage haut */
            pointe:Math.max(0,Math.sin(a))*0.7, talon:Math.max(0,-Math.sin(a))*0.4};
  };
  if(cote){
    pG=surCercle(PEDALE.k,      -demiH);
    pD=surCercle(PEDALE.k+0.5,   demiH);
  }else if(diag){
    /* DE TROIS QUARTS, le cercle se voit encore, mais écrasé : c'est une
       ellipse. Le pied avance et recule d'un peu plus du tiers de ce qu'il
       fait de profil, et monte de toute sa hauteur. Sans cela on avait le
       va-et-vient de face sur un corps tourné — ce qui ne ressemblait à
       rien. */
    const sv=(tourne<0)?-1:1;
    const ell=(ph2)=>{
      const a=ph2*Math.PI*2*sv;
      return {x:Math.cos(a)*0.38, lift:Math.sin(a)*1.25,
              pointe:Math.max(0,Math.sin(a))*0.5, talon:Math.max(0,-Math.sin(a))*0.3};
    };
    pG=ell(PEDALE.k);
    pD=ell(PEDALE.k+0.5);
  }else{
    /* DE FACE ET DE DOS, le cercle ne se voit pas : il ne reste de lui que
       le haut et le bas. Les pieds montent et descendent en opposition, et
       c'est tout — un va-et-vient horizontal, ici, ferait des ciseaux. */
    const h=(ph2)=>Math.sin(ph2*Math.PI*2)*1.15;
    pG={x:0, lift:h(PEDALE.k),     pointe:0, talon:0};
    pD={x:0, lift:h(PEDALE.k+0.5), pointe:0, talon:0};
  }
}

const hanche=pG.x;                                              /* (gardé pour les anciens calculs) */
const leveG=pG.lift, leveD=pD.lift;
const AMPL=COURSE?1.35:1;
const balance=bouge&&!COURSE?Math.round(Math.sin(2*Math.PI*tC)*1):0;
/* ================= LA VRILLE DU BUSTE =================
   Les épaules restaient parfaitement carrées et horizontales d'un bout à
   l'autre du cycle : le buste était un bloc posé sur des jambes qui
   marchent. Dans une vraie foulée il vrille — les épaules partent à
   l'opposé des hanches, et c'est ce contre-mouvement qui fait qu'un
   corps marche au lieu d'être transporté.

   Elle ne se voit que de face, de dos et de trois quarts : de profil la
   rotation pointe vers la caméra. Une unité en marche, deux en course —
   un demi-pixel et un pixel. C'est peu, et c'est tout ce qu'il faut : au
   delà, les épaules se décrochent du cou. */
const vrilleAmp=bouge&&!cote?Math.sin(2*Math.PI*tC)*(COURSE?2:1.2):0;
const vrille=Math.round(vrilleAmp);
const frG=(typeof GESTE!=='undefined'&&GESTE&&GESTE.t>0)?GESTE.t:0, typeG=(typeof GESTE!=='undefined'&&GESTE&&GESTE.type)||'pioche';
let arcG=0, pencheG=0, tasseG=0, phaseG=0;
if(frG>0){const fr=frG;
if(typeG==='cueille'){if(fr>0.55){const t=(1-fr)/0.45;pencheG=doux(t)*2.6;tasseG=doux(t)*1.6;arcG=1.1*doux(t);}
else if(fr>0.3){const t=(0.55-fr)/0.25;pencheG=2.6;tasseG=1.6;arcG=1.1+t*0.5;}
else{const t=1-fr/0.3;pencheG=2.6*(1-sortRap(t));tasseG=1.6*(1-sortRap(t));arcG=1.6*(1-sortRap(t));}}
else if(typeG==='hache'){if(fr>0.62){const t=(1-fr)/0.38;arcG=-1.9*doux(t);pencheG=-doux(t)*2;tasseG=doux(t)*1.4;phaseG=1;}
else if(fr>0.42){const t=(0.62-fr)/0.2;arcG=-1.9+entreRap(t)*3.3;pencheG=-2+t*5.2;tasseG=1.4-t*2.8;phaseG=2;}
else{const t=1-fr/0.42;arcG=1.4*(1-sortRap(t));pencheG=3.2*(1-sortRap(t));tasseG=-1.4*(1-sortRap(t));phaseG=3;}}
else if(typeG==='gouge'){if(fr>0.62){const t=(1-fr)/0.38;arcG=-0.5*doux(t);pencheG=doux(t)*1.2;tasseG=doux(t)*0.6;}
else if(fr>0.42){const t=(0.62-fr)/0.2;arcG=-0.5+entreRap(t)*1.1;pencheG=1.2+t*0.8;tasseG=0.6;}
else{const t=1-fr/0.42;arcG=0.6*(1-sortRap(t));pencheG=2*(1-sortRap(t));tasseG=0.6*(1-sortRap(t));}}
else if(typeG==='tamis'){arcG=Math.sin((1-fr)*Math.PI*6)*0.3;pencheG=3.2;tasseG=2.6;}
/* ================= QUATRE GESTES DE PLUS =================
   Semer, arroser, ramasser et lancer passaient tous par l'animation de
   pioche. Chacun a maintenant sa courbe : la pioche frappe, semer balaie,
   arroser se penche et tient, ramasser plonge et se relève, lancer part
   en arrière avant de fouetter vers l'avant.

   fr va de 1 (début du geste) à 0 (fin). */
else if(typeG==='petanque'){
/* LA PÉTANQUE : on se baisse, le bras part en arrière, puis il remonte devant, paume ouverte */
if(fr>0.55){const t=(1-fr)/0.45;pencheG=doux(t)*2.2;tasseG=doux(t)*3;phaseG=1;}
else if(fr>0.3){const t=(0.55-fr)/0.25;pencheG=2.2+t*0.6;tasseG=3-t*1.4;phaseG=2;}
else{const t=1-fr/0.3;pencheG=2.8*(1-sortRap(t));tasseG=1.6*(1-sortRap(t));phaseG=3;}}
else if(typeG==='houe'){
/* LA HOUE : on lève haut, on abat court, on racle vers soi. Plus ample
   que la pioche et plus basse. */
if(fr>0.6){const t=(1-fr)/0.4;arcG=-1.7*doux(t);pencheG=-doux(t)*1.4;tasseG=doux(t)*1.2;phaseG=1;}
else if(fr>0.4){const t=(0.6-fr)/0.2;arcG=-1.7+entreRap(t)*3.1;pencheG=-1.4+t*4.4;tasseG=1.2-t*2;phaseG=2;}
else{const t=1-fr/0.4;arcG=1.4*(1-sortRap(t))-0.5*doux(t);pencheG=3*(1-sortRap(t));tasseG=-0.8*(1-sortRap(t));phaseG=3;}}
else if(typeG==='semer'){
/* LE SEMIS : le bras balaie de l'intérieur vers l'extérieur, le buste
   accompagne à peine. Un geste large et sans effort. */
if(fr>0.6){const t=(1-fr)/0.4;arcG=-0.8*doux(t);pencheG=doux(t)*0.8;}
else if(fr>0.25){const t=(0.6-fr)/0.35;arcG=-0.8+entreRap(t)*2.2;pencheG=0.8+t*0.4;tasseG=t*0.4;}
else{const t=1-fr/0.25;arcG=1.4*(1-sortRap(t));pencheG=1.2*(1-sortRap(t));tasseG=0.4*(1-sortRap(t));}}
else if(typeG==='arrose'){
/* L'ARROSAGE : on se penche, on tient la pose, on se redresse. Le bras
   descend et reste bas — c'est l'immobilité qui fait lire l'arrosoir. */
if(fr>0.75){const t=(1-fr)/0.25;pencheG=doux(t)*2.2;arcG=0.9*doux(t);tasseG=doux(t)*0.8;}
else if(fr>0.25){pencheG=2.2;arcG=0.9+Math.sin((0.75-fr)*Math.PI*4)*0.12;tasseG=0.8;}
else{const t=1-fr/0.25;pencheG=2.2*(1-sortRap(t));arcG=0.9*(1-sortRap(t));tasseG=0.8*(1-sortRap(t));}}
else if(typeG==='ramasse'){
/* RAMASSER : on plonge vite, on saisit, on se relève lentement en
   serrant le bras contre soi. */
if(fr>0.55){const t=(1-fr)/0.45;pencheG=entreRap(t)*4;tasseG=entreRap(t)*3;arcG=1.5*entreRap(t);}
else if(fr>0.38){pencheG=4;tasseG=3;arcG=1.5;}
else{const t=1-fr/0.38;pencheG=4*(1-doux(t));tasseG=3*(1-doux(t));arcG=1.5*(1-doux(t))-0.3*doux(t);}}
else if(typeG==='lance'){
/* LE LANCER : l'anticipation part en arrière, puis le bras fouette vers
   l'avant et le buste suit. C'est le geste de la canne à pêche. */
if(fr>0.6){const t=(1-fr)/0.4;arcG=-2.2*doux(t);pencheG=-doux(t)*2.4;tasseG=doux(t)*0.6;phaseG=1;}
else if(fr>0.42){const t=(0.6-fr)/0.18;arcG=-2.2+entreRap(t)*4;pencheG=-2.4+t*5;tasseG=0.6-t*1.2;phaseG=2;}
else{const t=1-fr/0.42;arcG=1.8*(1-sortRap(t));pencheG=2.6*(1-sortRap(t));tasseG=-0.6*(1-sortRap(t));phaseG=3;}}
else{if(fr>0.58){const t=(1-fr)/0.42;arcG=-1.45*doux(t);pencheG=-doux(t)*1.6;tasseG=doux(t)*1.2;phaseG=1;}
else if(fr>0.42){const t=(0.58-fr)/0.16;arcG=-1.45+entreRap(t)*2.75;pencheG=-1.6+t*4.4;tasseG=1.2-t*2.4;phaseG=2;}
else{const t=1-fr/0.42;arcG=1.3*(1-sortRap(t));pencheG=2.8*(1-sortRap(t));tasseG=-1.2*(1-sortRap(t));phaseG=3;}}
}
/* ================= L'ARRÊT =================
   Huit temps au lieu de quatre. Le buste se soulève et retombe plus
   lentement qu'il ne monte — comme une respiration — et le poids bascule
   d'une jambe sur l'autre une fois par cycle. */
const iBrise=Math.round((typeof BRISE_PH==='number'?BRISE_PH:0)/(Math.PI/2))%8;
const SOUFFLE=[0,0,1,1,1,1,0,0];          /* l'inspiration est plus brève que l'expiration */
const APPUI  =[0,0,0,1,1,1,1,0];          /* le report de poids, décalé d'un temps */
/* UNE MICRO-PAUSE PREND LA MAIN sur la boucle de respiration : sinon les
   deux se superposent et le geste se brouille. */
const souffle=bouge?0:(rpS?rpS.poit[rpF]:(rpA?0:SOUFFLE[((iBrise%8)+8)%8]));
const appui=bouge?0:(rpA?(rpA.sway[rpF]?1:0):(rpS?0:APPUI[((iBrise%8)+8)%8]));
/* ================= LA MARCHE ET LA COURSE =================
   Le bassin monte au passage et retombe à l'appui. En course, les deux
   pieds quittent le sol au sommet de la courbe : c'est ce qui sépare une
   course d'une marche rapide. */
/* LA HAUTEUR DU BASSIN, en table plutôt qu'en formule.
   L'ancienne version n'avait que deux niveaux en course et son sommet
   durait cinq images : pas de pointe, donc pas de propulsion. Celle-ci a
   trois niveaux et un sommet net d'une seule image par foulée. */
/* RÉÉCHANTILLONNÉES POUR VINGT-QUATRE. Chaque table vaut une foulée,
   répétée deux fois par cycle. Le sommet de la course tient toujours sur
   UNE seule image — c'est lui qui donne la propulsion, l'étaler le tue. */
const BOB_M=[ 0, 1, 1, 1, 0, 0,-1,-1,-1,-1, 0, 0,
              0, 1, 1, 1, 0, 0,-1,-1,-1,-1, 0, 0];
const BOB_C=[ 1, 0, 0,-1,-1,-1, 0, 1, 1, 2, 1, 1,
              1, 0, 0,-1,-1,-1, 0, 1, 1, 2, 1, 1];
const bobPas=(COURSE?BOB_C:BOB_M)[((F%PASM)+PASM)%PASM];
/* L'AMORTI DU TALON : au moment où le pied se pose, le corps s'enfonce
   d'un pixel de plus. Une seule image sur seize, mais c'est elle qui donne
   le poids. */
const frappe=(!COURSE&&bouge&&(F===0||F===PASM/2))?1:0;
/* LA TRANSITION, lue par le dessin : elle penche le buste, tasse le corps
   et ouvre la foulée. Les trois moments ont une signature opposée :
   l'élan pousse en avant, le freinage retient en arrière, le pivot tasse. */
const TR=(typeof TRANS_FIN==='object'&&TRANS_FIN)?TRANS_FIN:null;
/* LA ROTATION DE TÊTE PROPRE À CET APPEL. Le pivot la calcule plus bas,
   et elle doit rester LOCALE : au premier essai elle était posée dans le
   drapeau global sans jamais être remise à zéro, et la pose suivante
   héritait d'une tête tournée qui n'avait rien demandé. */
let yawLocal=0;
const trK=TR?TR.k:0;
const trPenche=!TR?0:(TR.type==='elan'?Math.round((1-trK)*3+1)
:(TR.type==='frein'?-Math.round((1-trK)*3+1)
:(TR.type==='lance'?Math.round(trK*4):0)));
/* L'ÉLAN N'AVAIT AUCUN EFFET DE FACE. Il ne jouait que sur trPenche, qui
   penche le buste vers l'avant — invisible quand l'avant pointe vers la
   caméra. On lui donne ce qui se voit de face : le corps s'accroupit d'un
   coup puis se détend, c'est la poussée du départ. */
/* LE CORPS VIRE : il penche vers l'intérieur du virage, comme un coureur
   en courbe. Le tassement seul disait « il se passe quelque chose » sans
   dire de quel côté — le même dessin servait pour les deux sens. */
const trVire=(TR&&TR.type==='pivot')?Math.round(Math.sin(trK*Math.PI)*2)*(TR.sens||1):0;
/* LA TÊTE MÈNE LE VIRAGE. Elle part dès la première image et revient à
   l'axe à la dernière, pendant que les épaules, elles, suivent la
   courbe du tassement. C'est l'ordre qu'un corps respecte toujours :
   les yeux, puis la tête, puis le buste, puis les pieds. */
if(TR&&TR.type==='pivot')yawLocal=(trK<0.75?(TR.sens||1):0);
/* LE CRAN DE ROTATION DE LA TÊTE, au niveau du sprite et pas dans la
   fonction qui dessine le crâne : l'œil doit le lire aussi, pour que le
   regard parte du même côté. Déclaré à l'intérieur de `tete()` au
   premier essai, il était invisible depuis `oeilDe` et le personnage
   tournait la tête en gardant les yeux droit devant. */
const yawT=(!cote&&!diag)?((typeof TETE_FIN==='number'&&TETE_FIN)||yawLocal):0;
/* LE DÉCALAGE DU CRÂNE ET CELUI DU VISAGE, au niveau du sprite : la
   chevelure doit lire les deux, et elle se dessine ailleurs. */
const dT=diag?vis:yawT;
const f3=diag?vis*3:yawT*2;
const trTasse=!TR?0:(TR.type==='pivot'?Math.round(Math.sin(trK*Math.PI)*2)
:(TR.type==='elan'?Math.round(Math.sin(trK*Math.PI)*2)
:(TR.type==='lance'?-Math.round(Math.sin(trK*Math.PI))
:(TR.type==='frein'?Math.round((1-trK)*2):0))));
/* LE BASSIN PENDANT UNE PAUSE : il se tasse d'une unité sur le report de
   poids (le corps s'assoit sur une hanche), et il monte de deux sur la
   grande inspiration, avec une unité de retombée à la fin — le soupir. */
const rpBob=rpA?rpA.bob[rpF]:(rpS?rpS.bob[rpF]:0);
const bob=(bouge?bobPas+frappe:-souffle)+rpBob+trTasse+Math.round(tasseG*1.5)+(frG>0&&!(dir==='gauche'||dir==='droite')?Math.round(Math.max(0,pencheG)*0.5):0);
/* LE REPORT DE POIDS : à l'arrêt, les épaules et la tête glissent d'un
   pixel au-dessus de la jambe porteuse. C'est ce qui empêche la pose
   d'être une statue. */
const dxAppui=bouge?0:(appui?1:0);
/* EN SELLE, tout le corps descend : les hanches de onze unités, le haut
   de neuf seulement — le buste se tasse de deux, comme quelqu'un qui se
   penche sur son guidon. Le buste part aussi vers l'avant. */
const vAssis=PEDALE?VELO_ASSIS:0, vBuste=PEDALE?VELO_BUSTE:0;
/* LA CAGE S'OUVRE : sur l'inspiration les épaules montent d'une unité de
   plus que le bassin. C'est cette unité d'écart qui fait une poitrine qui
   se remplit, et non un corps qui saute. */
const rpEp=rpS?-rpS.ep[rpF]:0;
/* ================= LA TÊTE SE STABILISE =================
   Elle suivait le bassin au pixel près : quand le corps encaissait le
   talon, la tête plongeait avec lui. Un corps ne fait pas ça — la nuque
   amortit, parce que l'œil a besoin d'un horizon stable.

   On ne retire qu'une unité, et seulement aux deux moments où le bassin
   bouge vraiment de deux : l'instant du contact en marche, et le sommet
   de la foulée en course. Partout ailleurs l'amplitude est d'une unité,
   qu'on ne peut pas couper en deux sur une grille de pixels. */
const bGait=bouge?(bobPas+frappe):0;
const amortiTete=Math.abs(bGait)>=2?(bGait>0?1:-1):0;
const yHan=Y_HANCHE+bob+vAssis, yEp=Y_EPAULE+bob+rpEp+vBuste-Math.round(trPenche*0.2),
yCou=Y_COU+bob-amortiTete+rpEp+vBuste+(PEDALE?1:0)-Math.round(trPenche*0.3), yTete=Y_TETE+bob-amortiTete+rpEp+vBuste+(PEDALE?VELO_TETE:0)-Math.round(trPenche*0.4);
const dxPenche=trPenche+(PEDALE?VELO_PENCHE:0);
/* ================= LE MODÈLE DE POSE =================
   Seize points nommés, calculés à partir des mêmes formules que le dessin.
   Ce modèle ne dessine RIEN et ne change RIEN à l'image : il met des noms
   sur des positions qui existaient déjà, éparpillées dans le code.

   Il sert de socle : une animation, un accessoire ou un outil peuvent s'y
   accrocher sans toucher au dessin. Tant qu'aucun code ne le lit, le
   personnage est au pixel près identique à avant.

   Repère : x=0 au milieu du corps, y négatif vers le haut, origine aux pieds.
   Lecture depuis l'extérieur : window.POSE_FIN après un appel à spriteFin. */
const POSE=(()=>{
const AM=(typeof AMPL==='number')?AMPL:1;
const demiEp=EP/2, demiHan=HA/2;
/* les pieds, là où le dessin les pose */
const piedG={x:-demiHan+pG.x*PAS_U*AM, y:-3-pG.lift*6, pointe:pG.pointe, talon:pG.talon};
const piedD={x: demiHan+pD.x*PAS_U*AM, y:-3-pD.lift*6, pointe:pD.pointe, talon:pD.talon};
/* les genoux : au milieu de la cuisse et du tibia, légèrement en avant */
const genou=(h,p)=>({x:(h.x+p.x)/2+(p.y>-8?0.6:0), y:(h.y+p.y)/2});
const hancheG={x:-demiHan, y:yHan}, hancheD={x:demiHan, y:yHan};
/* les bras : le balancement du dessin, converti en position */
const balG=bouge?Math.sin(2*Math.PI*tC)*(COURSE?1.5:1):0;
const balD=-balG;
const epauleG={x:-demiEp, y:yEp}, epauleD={x:demiEp, y:yEp};
const coude=(e,b)=>({x:e.x+b*3*AM, y:e.y+9});
const main=(e,b)=>({x:e.x+b*6*AM, y:e.y+19});
return {
root:{x:0,y:0},
pelvis:{x:0,y:yHan},
torso:{x:dxAppui+dxPenche,y:yEp},
neck:{x:dxAppui+dxPenche,y:yCou},
head:{x:dxAppui+dxPenche,y:yTete},
crane:{x:0,y:yTete},                 /* sommet du crâne */
menton:{x:0,y:yTete+23},
armL:epauleG, forearmL:coude(epauleG,balG), handL:main(epauleG,balG),
armR:epauleD, forearmR:coude(epauleD,balD), handR:main(epauleD,balD),
thighL:hancheG, shinL:genou(hancheG,piedG), footL:piedG,
thighR:hancheD, shinR:genou(hancheD,piedD), footR:piedD,
/* ================= LA COMMANDE DES MEMBRES =================
   Les points ci-dessus disent OÙ se trouve chaque articulation. Le bloc
   `drive` dit, dans le langage que comprennent déjà les fonctions de dessin,
   COMBIEN chaque membre avance, se lève ou se balance.

   C'est le pont : le dessin ne lit plus les variables éparpillées (pG, leveG,
   hanche…) mais ce bloc. Une animation qui veut modifier une jambe n'a donc
   qu'un seul endroit à toucher, et le dessin n'a pas été réécrit. */
drive:{
jambeG:{av:pG.x, lev:pG.lift, pointe:pG.pointe, talon:pG.talon},
jambeD:{av:pD.x, lev:pD.lift, pointe:pD.pointe, talon:pD.talon},
brasG:{bal:balG}, brasD:{bal:balD},
torse:{dx:dxAppui, dy:0}},
/* les mesures, pour qui veut s'y caler */
mesures:{EP:EP,TA:TA,HA:HA,bras:SX.bras,jambe:SX.jambe,cou:SX.cou,
image:F,images:PASM,course:COURSE,vue:(cote?'profil':(dos?'dos':(diag?'troisQuarts':'face'))),
sens:(cote?(dir==='gauche'?-1:1):(diag?vis:0))}};
})();
try{window.POSE_FIN=POSE;}catch(x){}
/* ================= LA COUCHE D'ADAPTATION =================
   Ces alias sont ce que lisent désormais les appels de dessin des membres.
   Quand le pilotage est actif (le cas par défaut), ils viennent de la pose ;
   sinon ils retombent sur les variables d'origine. Les deux chemins donnent
   aujourd'hui le MÊME résultat au pixel près : c'est la preuve que le pont
   est correct avant qu'une animation ne s'en serve. */
const PILOTE=(typeof POSE_PILOTE==='undefined')?true:!!POSE_PILOTE;
const D_=POSE.drive;
const avG=PILOTE?D_.jambeG.av:pG.x, avD=PILOTE?D_.jambeD.av:pD.x;
const lvG=PILOTE?D_.jambeG.lev:pG.lift, lvD=PILOTE?D_.jambeD.lev:pD.lift;
const swG=PILOTE?D_.brasG.bal:0, swD=PILOTE?D_.brasD.bal:0;
void swG;void swD;
const court=basT==='short'||basT==='bermuda', jupe=basT==='jupe'||basT==='longue jupe';
const manches={'veste':1,'chemise':1,'pull':1,'manteau':1,'tunique':0.7,'t-shirt':0.3,'gilet':0,'débardeur':0}[hautT];
const long=hautT==='manteau'?10:(hautT==='tunique'?6:0);
ombreAuSol(g,x,y+0.5,cote?6.5:6,1.8,'rgba(20,28,16,.28)');   /* au pixel plein, comme celle des bêtes */
const jambe=(cx,avance,leve,fonce)=>{
const c=fonce?pantO:pant, cc=fonce?pant:pantC, cO=fonce?T(pant,-34):pantO;
const sk=fonce?peauO:peau, skO=fonce?peauT:peauO, skC=fonce?peau:peauC;
if(cote){
const fx=cx+avance*PAS_U*AMPL, fyy=-3-leve*6+(typeof toeOff==='number'?0:0);
const jambeL=Y_PIED-Y_HANCHE, cuisse=jambeL/2, tibia=jambeL/2, hx0=cx, hy0=yHan, dxk=fx-hx0, dyk=fyy-hy0, dd=Math.min(cuisse+tibia,Math.hypot(dxk,dyk));
const mxk=hx0+dxk/2, myk=hy0+dyk/2, hk=Math.sqrt(Math.max(0,cuisse*cuisse-(dd/2)*(dd/2)));
const nx=-dyk/Math.hypot(dxk,dyk)||0, ny=dxk/Math.hypot(dxk,dyk)||0;
const kx=mxk+nx*hk*(nx>0?1:-1)*(1)+ (nx>0?0:0), ky=myk+ny*hk*(nx>0?1:-1);
const bas=court?sk:c, basO=court?skO:cO;
seg(cx,yHan,kx,ky,SX.jambe,c);seg(cx+1,yHan+1,kx+1,ky,1,cc);                    /* la cuisse, éclairée devant */
seg(kx,ky,fx,fyy,SX.jambe-2,bas);
const mx=kx+(fx-kx)*0.35-2, my=ky+(fyy-ky)*0.35;
R(Math.round(mx)-1,Math.round(my)-2,2,5,bas);R(Math.round(mx)-2,Math.round(my)-1,1,3,basO);
R(Math.round(kx)+2,Math.round(ky)-1,1,2,court?skC:cc);                            /* le genou */
if(court)R(Math.round(cx+(kx-cx)*0.6)-3,Math.round(yHan+(ky-yHan)*0.6),7,1,cO);  /* le bas du short */
soulierDe(fx,fyy+3,fonce,cote?(fonce?pD:pG):null);
return;
}
/* ================= LA FOULÉE DE FACE ET DE DOS =================
   Jusqu'ici cette branche ignorait `avance` — et les deux appels lui
   passaient 0 de toute façon. Résultat : vus de face, les deux pieds
   restaient côte à côte du début à la fin du cycle. Les jambes ne se
   croisaient jamais, le personnage glissait sur un chariot.

   De profil l'avance du pied se voit telle quelle, parce qu'elle est
   perpendiculaire à la caméra. De face elle pointe VERS la caméra : elle
   disparaît. Il faut donc la traduire en deux signes que l'œil lit :

     — LE CROISEMENT. Au passage (avance ≈ 0, la jambe est en l'air et
       frôle l'autre) elle se rapproche de l'axe du corps ; aux extrêmes
       elle revient à son écart. Le ciseau avant-arrière devient un
       ciseau gauche-droite.
     — LA PERSPECTIVE. La jambe qui vient vers nous se dessine plus bas et
       plus courte ; celle qui s'éloigne, plus haut et plus longue. */
const av=avance||0;
const passage=1-Math.min(1,Math.abs(av));
/* VERS NOUS : PLUS BAS. Le billboard ne peut pas avancer un pied en
   profondeur, alors on le descend — c'est le seul signe dont dispose une
   vue de face. Une unité et demie ne se voyait pas : de face et de dos,
   la marche était deux colonnes parallèles et le personnage glissait.
   Trois unités, soit un pixel et demi sur une jambe de seize. */
const prof=Math.round(av*3);
/* ET LE CROISEMENT, doublé pour la même raison : au passage, la jambe
   en l'air venait d'un seul pixel vers l'axe du corps. Deux maintenant —
   assez pour qu'on voie les jambes se croiser, pas assez pour qu'elles
   se traversent. */
cx+=Math.round(passage*(leve>0.2?4:2))*((cx<0)?1:-1);
const lev=Math.round(leve*4*(COURSE?1.3:1)), y0=Y_HANCHE+bob, yGen=Y_GENOU_F-Math.round(lev*0.6)+prof, yChev=-5-lev+prof;
const col=(r)=>r<yGen?c:(court?sk:c), colO=(r)=>r<yGen?cO:(court?skO:cO), colC=(r)=>r<yGen?cc:(court?skC:cc);
const J=SX.jambe;
for(let r=y0;r<yChev;r++){
let w=r<y0+6?J+(SX.ventre?1:0):J;                                               /* le haut de la cuisse */
if(r>yGen+1)w=r<yGen+6?J:J-1;                                                   /* le mollet, puis la cheville */
if(r>yChev-3)w=J-2;
/* LE MOLLET BOMBÉ VERS L'EXTÉRIEUR. La jambe avait déjà ses largeurs,
   mais toujours centrées : un mollet pousse du côté opposé à l'autre
   jambe, c'est ce qui donne la forme de la jambe vue de face. */
const dehors=(cx<0)?-1:1;
const bombe=(r>yGen+1&&r<yGen+5)?1:0;
const x0=cx-Math.floor(J/2)+Math.floor((J-w)/2)+(bombe&&dehors<0?-1:0);
const ww=w+bombe;
R(x0,r,ww,1,court&&r>=yGen-2?sk:col(r));
R(x0,r,1,1,court&&r>=yGen-2?skO:colO(r));
R(x0+ww-1,r,1,1,court&&r>=yGen-2?skC:colC(r));
/* LA CHEVILLE, resserrée, prend l'ombre du bas de jambe */
if(r===yChev-1)R(x0,r,ww,1,court?skO:cO);
}
if(!dos){R(cx-1,yGen,2,1,court?skC:cc);R(cx-2,yGen+1,1,1,court?skO:cO);}           /* le genou */
else R(cx-2,yGen,4,1,court?skO:cO);                                               /* le creux derrière le genou */
if(court)R(cx-4,yGen-3,8,1,cO);                                                   /* le bas du short */
if(!court&&basT==='treillis'){R(cx-3,-18,3,4,cO);R(cx-3,-18,3,1,cc);}             /* la poche du treillis */
if(!court&&!jupe)R(cx+(cx<0?2:-3),yChev-2,2,1,cO);                                /* le pli du bas de pantalon */
soulierDe(cx,-lev+prof,fonce);
};
function soulierDe(cx,by,fonce,pp){
if(p.patin){const b='#f4f1ea', bO='#c8c2b4', lame='#c4ccd2';                /* LE PATIN : bottine blanche lacée, lame d'acier */
if(cote){R(cx-3,by-9,7,7,b);R(cx+3,by-5,3,3,b);R(cx-3,by-9,7,1,'#ffffff');R(cx-3,by-3,9,1,bO);for(let k=0;k<3;k++)R(cx,by-8+k*2,2,1,'#8a7a64');
R(cx-4,by-1,12,1,lame);R(cx-4,by-2,1,1,lame);R(cx+7,by-2,1,1,lame);R(cx+8,by-1,1,1,'#8a9196');return;}
R(cx-3,by-9,6,8,b);R(cx-3,by-9,6,1,'#ffffff');R(cx+2,by-8,1,7,bO);for(let k=0;k<3;k++)R(cx-1,by-8+k*2,2,1,'#8a7a64');
R(cx-1,by-1,2,2,lame);R(cx-1,by+1,2,1,'#8a9196');return;}
const PI2=p._pieds;
if(PI2&&PI2.st==='moon'){const c=fonce?chauO:chau, cC=T(chau,26), cO=T(chau,-34);      /* LA MOON BOOT : un gros chausson matelassé */
R(cx-5,by-8,11,8,c);R(cx-5,by-8,11,1,cC);R(cx-5,by-8,1,8,cO);R(cx+5,by-7,1,7,cO);
for(let k=0;k<3;k++)R(cx-4,by-6+k*2,9,1,cO);R(cx-3,by-7,3,1,'#ffffff');R(cx-5,by,11,1,T(chau,-60));return;}
soulierBase(cx,by,fonce,pp);
if(PI2&&PI2.st==='apres'){R(cx-4,by-9,9,2,'#efe6d6');for(let k=0;k<4;k++)R(cx-4+k*2,by-9+(k%2),1,1,'#c8bca8');}   /* le revers fourré */
if(PI2&&PI2.st==='ski'){R(cx-4,by-7,8,1,'#c8ccd2');R(cx-4,by-4,8,1,'#c8ccd2');R(cx+3,by-7,1,1,'#ffffff');R(cx+3,by-4,1,1,'#ffffff');}   /* les boucles */
}
function soulierBase(cx,by,fonce,pp){
const c=fonce?chauO:chau, cC=fonce?chau:chauC, cO=fonce?T(chau,-40):chauO;
/* LE DÉROULÉ DU PIED N'EXISTAIT QUE DE PROFIL. De face, de dos et sur
   les quatre diagonales, le soulier était un bloc posé bien à plat du
   premier au dernier temps du cycle — le personnage glissait sur deux
   patins. Or le déroulé est ce qui fait qu'un pied MARCHE : le talon qui
   touche, le pied qui se pose, la pointe qui pousse. */
const deroule=pp?(pp.pointe>0.3?1:(pp.talon>0.5?-1:0)):0;   /* 1 : talon levé ; -1 : pointe levée */
const semelle=soulier==='baskets'?'#f2efe4':T(chau,-50);
if(cote){
if(soulier==='sandales'){
R(cx-3,by-2,9,2,peau);R(cx+4,by-2,2,1,peauC);                                  /* le pied nu */
R(cx-2,by-3,2,2,c);R(cx+2,by-2,2,1,c);R(cx-3,by,10,1,cO);return;}             /* les lanières, la semelle */
const h=soulier==='bottes'?8:(soulier==='bottillons'?5:3);
if(deroule===1){R(cx-3,by-h-1,7,h,c);R(cx-2,by-4,9,3,c);R(cx+5,by-2,3,2,c);R(cx-2,by-1,10,1,semelle);R(cx-2,by-h-1,2,h-3,cC);return;}   /* sur la pointe */
if(deroule===-1){R(cx-3,by-h,7,h,c);R(cx-3,by-3,9,3,c);R(cx+4,by-4,4,2,c);R(cx-3,by,9,1,semelle);R(cx+6,by-4,2,1,cC);R(cx-2,by-h,2,h-3,cC);return;}   /* sur le talon */
R(cx-3,by-h,7,h,c);R(cx-3,by-3,10,3,c);                                          /* la tige, le pied */
R(cx+4,by-3,3,2,cC);R(cx+5,by-3,2,1,soulier==='baskets'?'#f2efe4':cC);           /* le bout, éclairé */
R(cx-3,by-3,1,3,cO);R(cx-3,by,11,1,semelle);R(cx-3,by,3,1,cO);                   /* le talon, la semelle */
if(soulier==='baskets'){R(cx,by-3,1,1,'#f2efe4');R(cx+2,by-3,1,1,'#f2efe4');R(cx-2,by-2,5,1,T(c,-20));}
if(soulier==='bottes'){R(cx-3,by-h,7,1,cC);R(cx-3,by-h+2,7,1,cO);}
R(cx-2,by-h,2,h-3,cC);
return;
}
if(soulier==='sandales'){
R(cx-3,by-3,7,3,peau);for(let k=0;k<4;k++)R(cx-3+k*2,by-1,1,1,peauO);            /* les orteils */
R(cx-3,by-3,7,1,c);R(cx-1,by-2,3,1,c);R(cx-3,by,7,1,cO);return;}
const h=soulier==='bottes'?8:(soulier==='bottillons'?5:3);
/* DE FACE on ne voit presque rien du déroulé — c'est normal, il pointe
   vers la caméra. DE TROIS QUARTS on en voit la moitié : la tige monte
   quand le talon se lève, le bout monte quand la pointe se lève, et le
   bout part dans le sens de la marche au lieu de rester centré. */
const dyT=deroule===1?-1:0, dyB=deroule===-1?-1:0, avB=diag?tourne:0;
R(cx-4,by-h+dyT,8,h,c);R(cx-4+avB,by-2+dyB,9,2,c);                                  /* la tige, le bout qui dépasse */
/* LE CREUX ENTRE LES DEUX SOULIERS : sans lui, de face, les deux pieds se
   touchent et forment une seule masse. */
R(cx+4,by-h,1,h+2,cO);
/* L'OMBRE DE CONTACT : une ligne sombre sous la semelle. Le pied se pose
   sur le sol au lieu d'y flotter. */
R(cx-4,by,9,1,T(chau,-62));
R(cx-3,by-h,2,h-2,cC);R(cx-2,by-2,4,1,cC);                                          /* les reflets */
R(cx-4,by,9,1,semelle);R(cx+3,by-h,1,h,cO);
if(soulier==='baskets'){R(cx-2,by-3,1,1,'#f2efe4');R(cx,by-3,1,1,'#f2efe4');R(cx-1,by-2,1,1,'#f2efe4');}
if(soulier==='bottes'){R(cx-4,by-h,8,1,cC);R(cx-4,by-h+2,8,1,cO);}
if(soulier==='bottillons'){R(cx-3,by-h+1,1,1,'#c9a24a');R(cx+1,by-h+1,1,1,'#c9a24a');}
}
const torse=()=>{
const bas=yHan+2+long, peauH=hautT==='débardeur';
for(let r=yEp;r<bas;r++){
const k=(r-yEp)/(yHan-yEp);
let demi=Math.round(r<yHan?EP+(TA-EP)*Math.min(1,k*1.4):HA+(r>yHan?1:0));
if(!cote&&r<yEp+4)demi=Math.round(5+(EP-5)*(r-yEp+1)/4);            /* les trapèzes, en pente depuis le cou */
if(souffle&&r>=yEp+4&&r<yEp+11)demi+=1;                              /* la poitrine, au souffle */
/* DE TROIS QUARTS, le corps est plus étroit : on en voit la tranche.
   0,86 laissait des épaules presque aussi larges que de face. */
const dd=diag?Math.round(demi*0.78):demi;
let w=cote?Math.round(demi*1.5):dd*2, xx=cote?-Math.round(w/2):-dd+(diag?vis:0);
/* LA VRILLE, ligne par ligne : tout le décalage aux épaules, rien au
   milieu, l'opposé aux hanches. C'est un dégradé, pas deux blocs — en
   deux blocs le buste se casse en marche d'escalier. */
if(vrille)xx+=Math.round(vrilleAmp*(1-2*Math.min(1,Math.max(0,k))));
const yV0=yEp+12, bV=SX.ventre&&r>yV0&&r<yHan+1?Math.round(SX.ventre*Math.sin(Math.PI*(r-yV0)/(yHan+1-yV0))):0;
if(bV){if(cote)w+=bV;else{w+=bV*2;xx-=bV;}}
/* LE PAN DU MANTEAU : il traîne derrière le corps et dépasse en bout de
   course, au lieu de suivre une sinusoïde collée au pas. */
if(long&&r>yHan&&bouge){const k2=(r-yHan)/long;
const tr=balVet((r-yHan)*1.4);
if(cote){w+=Math.round(k2*2);xx-=Math.round(k2*2)+tr;}
else{xx+=Math.round(tr*0.8*k2);w+=Math.round(Math.abs(tr)*k2*0.9);}}
if(cote){if(r>yEp+3&&r<yEp+12){w+=1;}if(r>=yHan-3){w+=1;xx-=1;}}
/* ================= LE MODELÉ DU TORSE =================
   C'était trois tons : un bord clair, un bord sombre, le reste uni. Le
   torse étant la plus grande surface du personnage, c'est là que l'aplat
   se voyait le plus. Cinq tons maintenant, et des accents aux endroits où
   le tissu se casse vraiment. La lumière vient du haut-gauche. */
R(xx,r,w,1,vest);
R(xx,r,1,1,vestT);                                   /* le bord gauche */
R(xx+1,r,2,1,cote?vest:vestC);                       /* le quart éclairé */
R(xx+w-3,r,2,1,vestO);                               /* le quart dans l'ombre */
R(xx+w-1,r,1,1,vestT);                               /* le bord droit */
/* LE HAUT DES ÉPAULES attrape la lumière du ciel */
if(r<yEp+2)R(xx+1,r,w-2,1,T(vest,32));
else if(r<yEp+4)R(xx+1,r,w-2,1,vestC);
if(!cote&&!dos){
/* L'OMBRE SOUS LES BRAS : elle détache le bras du torse. */
if(r>yEp+3&&r<yEp+12){R(xx+1,r,2,1,vestT);R(xx+w-3,r,2,1,vestT);}
/* LE CREUX DE LA TAILLE : le tissu rentre, donc il s'assombrit. */
if(r>yEp+16&&r<yEp+24&&((r-yEp)%3)===0)R(xx+2,r,w-4,1,vestO);}
/* LE PLI DU PIVOT : de trois quarts, un côté du torse rentre. */
if(diag&&!cote&&r>yEp+5&&r<yEp+24)R(vis>0?xx+w-5:xx+3,r,1,1,vestO);
if(cote){
if(r>yEp+6&&r<yEp+14)R(xx,r,2,1,vestT);              /* le creux sous l'omoplate */
if(r>yEp+16&&r<yEp+24)R(xx+1,r,2,1,vestO);           /* les reins */
if(r>yEp+8&&r<yEp+18)R(xx+w-2,r,1,1,T(vest,32));}   /* la poitrine, bombée */
if(dos){
if(r>yEp+3&&r<yEp+13){R(xx+3,r,3,1,vestC);R(xx+w-6,r,3,1,vestO);}   /* les omoplates */
R(0,r,1,1,r<yEp+6?vestO:vestT);}                     /* la colonne */
}
if(!cote){
const cx0=diag?vis:0;
if(!dos){
/* LES PLIS : trois accents, là où le tissu se casse. */
R(cx0-EP+3,yEp+10,EP-4,1,vestT);R(cx0+2,yEp+10,EP-4,1,vestT);   /* sous la poitrine */
R(cx0-TA+1,yHan-5,TA*2-2,1,vestO);                               /* au-dessus de la ceinture */
R(cx0-TA+3,yHan-4,TA*2-6,1,vestC);                               /* le bourrelet du tissu */
R(cx0-2,yEp+6,1,8,vestO);                                        /* l'ouverture, au milieu */
if(SX.pec){R(cx0,yEp+4,1,6,vestO);R(cx0-EP+4,yEp+9,EP-5,1,vestT);R(cx0+2,yEp+9,EP-5,1,vestT);R(cx0-5,yEp+14,1,5,vestO);R(cx0+4,yEp+14,1,5,vestO);}
if(SX.ventre){R(cx0-TA,yHan-3,TA*2,1,vestO);R(cx0-TA+2,yHan-4,TA*2-4,1,vestC);}
R(cx0-TA+2,yHan-5,3,1,vestO);R(cx0+TA-5,yHan-5,3,1,vestO);
}else{
R(-EP+3,yEp+5,4,1,vestC);R(EP-7,yEp+5,4,1,vestC);R(-EP+3,yEp+9,4,1,vestO);R(EP-7,yEp+9,4,1,vestO);
R(0,yEp+4,1,yHan-yEp-6,vestO);
R(-3,yHan-4,6,1,vestO);R(-4,yHan-5,8,1,vestT);                   /* le pli du bas du dos */
}
}else{
R(3,yEp+10,2,1,vestO);R(-Math.round(demiDos())-1,yHan-2,2,2,T(pant,-10));      /* sous la poitrine ; le haut des fesses */
}
const bouton=(x,y)=>{R(x,y,2,2,'#c9a24a');R(x,y,1,1,'#f0cf7d');};
const xc=diag?vis:0;                                                       /* le milieu du torse, de trois-quarts */
if(!cote&&!dos){
if(hautT==='veste'){
R(xc-5,yEp,4,6,vestC);R(xc-2,yEp+5,1,2,vestC);R(xc+2,yEp,4,6,vestO);R(xc+2,yEp+5,1,2,vestO);
R(xc-2,yEp,4,3,T(vest,-40));                                          /* le col, dans l'ombre */
R(xc,yEp+3,1,bas-yEp-3,vestT);for(let r=yEp+4;r<bas;r+=3)R(xc-1,r,1,1,'#b9c1c7');   /* la fermeture */
R(xc-TA+2,yHan-8,5,1,vestT);R(xc-TA+2,yHan-7,5,3,vestO);R(xc+TA-7,yHan-8,5,1,vestT);R(xc+TA-7,yHan-7,5,3,vestO);
R(xc-HA,yHan-2,HA*2,1,vestT);
}else if(hautT==='manteau'){
R(xc-7,yEp,5,9,vestC);R(xc+3,yEp,5,9,vestO);R(xc-2,yEp,5,3,T(vest,-40));
R(xc-1,yEp+8,1,bas-yEp-8,vestT);
for(let k=0;k<3;k++){bouton(xc-5,yEp+10+k*6);bouton(xc+3,yEp+10+k*6);}
R(xc-TA,yHan-3,TA*2,2,vestO);R(xc-TA,yHan-3,TA*2,1,vestC);R(xc+3,yHan-3,3,4,vestT);   /* la ceinture et son nœud */
}else if(hautT==='gilet'){
for(let r=yEp;r<yEp+14;r++){const o=Math.max(0,7-Math.round((r-yEp)*0.5));R(xc-o,r,o*2,1,'#ece6d6');}
R(xc-1,yEp,2,2,'#d8d0bc');
for(let k=0;k<4;k++)bouton(xc-1,yEp+14+k*4);
R(xc,yEp+13,1,bas-yEp-13,vestT);R(xc-TA+2,yHan-6,4,1,vestT);R(xc+TA-6,yHan-6,4,1,vestT);   /* les passepoils */
}else if(hautT==='chemise'){
R(xc-5,yEp,4,3,vestC);R(xc+1,yEp,4,3,vestC);R(xc-4,yEp+3,2,1,vestC);R(xc+2,yEp+3,2,1,vestC);
R(xc-1,yEp,2,3,peauO);R(xc-1,yEp+3,2,bas-yEp-3,vestC);
for(let k=0;k<4;k++)R(xc,yEp+6+k*5,1,1,'#f2efe4');
R(xc-EP+4,yEp+6,5,4,vestO);R(xc-EP+4,yEp+6,5,1,vestT);                  /* la poche */
}else if(hautT==='pull'){
R(xc-5,yEp-1,10,3,vestO);for(let x=xc-5;x<xc+5;x+=2)R(x,yEp-1,1,3,vestT);
for(let r=yEp+4;r<bas-3;r+=4){R(xc-2,r,1,2,vestC);R(xc-1,r+1,1,2,vestC);R(xc+1,r,1,2,vestC);R(xc+2,r+1,1,2,vestC);}   /* la torsade */
for(let r=yEp+5;r<bas-3;r+=2){R(xc-EP+3,r,1,1,vestO);R(xc+EP-4,r,1,1,vestO);}
R(xc-HA,bas-3,HA*2,3,vestO);for(let x=xc-HA;x<xc+HA;x+=2)R(x,bas-3,1,3,vestT);
}else if(hautT==='t-shirt'){
R(xc-4,yEp,8,3,peau);R(xc-4,yEp+2,8,1,peauO);R(xc-5,yEp,1,3,vestC);R(xc+4,yEp,1,3,vestC);R(xc-4,yEp+3,8,1,vestC);
R(xc-6,yEp+14,4,1,vestO);R(xc+3,yEp+17,3,1,vestO);R(xc-TA,yHan-2,TA*2,1,vestO);
}else if(peauH){
R(xc-EP+1,yEp,EP-4,5,peau);R(xc+4,yEp,EP-5,5,peau);R(xc-4,yEp,8,4,peau);R(xc-4,yEp+3,8,1,peauO);
R(xc-6,yEp,2,5,vestC);R(xc+4,yEp,2,5,vestC);R(xc-4,yEp+4,8,1,vestC);
}else if(hautT==='tunique'){
for(let r=yEp;r<yEp+8;r++){const o=Math.max(0,3-Math.round((r-yEp)*0.4));R(xc-o,r,o*2,1,peauO);}
for(let k=0;k<3;k++){R(xc-2,yEp+2+k*2,1,1,'#e8e0c8');R(xc+1,yEp+3+k*2,1,1,'#e8e0c8');}
R(xc-TA,yHan-3,TA*2,3,vestT);R(xc-TA,yHan-3,TA*2,1,vestO);R(xc+TA-4,yHan-1,3,6,vestT);
}
}
if(p._doudoune||p._motif){const xc2=cote?0:(diag?vis:0), L2=cote?Math.round(TA*0.75):TA;
if(p._motif==='forestier'){                     /* LE MANTEAU DU GARDE FORESTIER */
  R(xc2-L2,yEp+2,L2*2,3,'#5a4428');             /* le col de cuir */
  R(xc2-L2,yEp+2,L2*2,1,'#7a6038');
  R(xc2-1,yEp+5,2,bas-yEp-6,'#243a28');         /* la couture du milieu */
  for(let k=0;k<4;k++){                          /* le double boutonnage */
    R(xc2-3,yEp+7+k*4,1.6,1.6,'#c9a24a');R(xc2-3,yEp+7+k*4,1,1,'#e8cf8a');
    R(xc2+1.4,yEp+7+k*4,1.6,1.6,'#c9a24a');R(xc2+1.4,yEp+7+k*4,1,1,'#e8cf8a');}
  R(xc2-L2,bas-4,L2*2,2,'#243a28');             /* le bas du manteau */
}
if(p._motif==='carreaux'){                      /* LA CHEMISE À CARREAUX, RAPIÉCÉE */
  for(let r=yEp+3;r<bas-1;r+=4)for(let x=-L2;x<L2;x+=4){
    if(((r/4|0)+(x/4|0))%2===0)R(xc2+x,r,4,4,'#7a2a1e');     /* le carreau sombre */
    R(xc2+x,r,L2*2,0.8,'rgba(230,120,100,.22)');             /* le fil clair */
  }
  for(let x=-L2;x<L2;x+=4)R(xc2+x,yEp+3,0.8,bas-yEp-4,'rgba(230,120,100,.18)');
  if(p._rapiece){                               /* les pièces cousues */
    R(xc2-3,yEp+9,5,5,'#6a5a3a');R(xc2-3,yEp+9,5,1,'#8a7a5a');
    R(xc2+3,bas-7,4,4,'#4a7a3a');R(xc2+3,bas-7,4,1,'#6a9a52');
  }
}
if(p._fourrure){const FO=p._fourrure;                                  /* LA FOURRURE : des touffes irrégulières */
for(let r=yEp+3;r<bas-1;r+=3)for(let x=-L2+((r/3)%2?2:0);x<L2-1;x+=4){R(xc2+x,r,2,2,FO.o);R(xc2+x+2,r+1,1,1,FO.b);}
if(!dos&&!cote){R(xc2-6,yEp+4,12,Math.max(4,(bas-yEp)*0.5),FO.museau);}                 /* le ventre plus clair */
if(FO.echarpe&&!cote){R(xc2-Math.round(TA*0.9),yEp-1,Math.round(TA*1.8),3,FO.echarpe);
if(!dos)R(xc2+Math.round(TA*0.4),yEp+2,3,7,FO.echarpe);}}
else if(p._poulet){for(let r=yEp+4;r<bas-1;r+=3)for(let x=-L2+((r/3)%2?2:0);x<L2-1;x+=4){R(xc2+x,r,1,1,'#d8d2c4');R(xc2+x+1,r+1,1,1,'#d8d2c4');R(xc2+x+2,r,1,1,'#d8d2c4');}
if(!dos&&!cote){R(xc2-5,yEp+1,10,4,'#ffffff');}}
else if(p._doudoune){for(let r=yEp+5;r<bas-1;r+=4){R(xc2-L2,r,L2*2,1,vestO);R(xc2-L2,r+1,L2*2,1,vestC);}
if(!dos&&!cote){R(xc2-4,yEp-2,8,3,vestO);R(xc2-4,yEp-2,8,1,vestC);}}                         /* le col montant */
if(p._motif==='retro'){for(let x=-L2;x<L2;x+=2){const zy=yEp+9+((x/2)%2?2:0);R(xc2+x,zy,2,2,'#f0e040');R(xc2+x,zy+4,2,1,'#3ad0c0');}
R(xc2-L2,yHan-5,L2*2,2,'#3ad0c0');}
if(p._motif==='gilet'){R(xc2-L2,yEp+9,L2*2,2,'#d8dde2');R(xc2-L2,yEp+9,L2*2,0.5,'#ffffff');R(xc2-L2,yHan-7,L2*2,2,'#d8dde2');R(xc2-L2,yHan-7,L2*2,0.5,'#ffffff');}
if(p._motif==='course'){R(xc2-L2,yEp+7,L2*2,3,'#f4efe0');R(xc2-L2,yEp+8,L2*2,1,'#b8392c');
if(!dos){R(xc2+3,yEp+12,5,3,'#f4efe0');R(xc2+4,yEp+13,3,1,'#1d3f6a');}                        /* le dossard */
R(xc2-L2,yEp,2,bas-yEp,'#b8392c');R(xc2+L2-2,yEp,2,bas-yEp,'#b8392c');}
if(p._motif==='etoile'){R(xc2-L2,yEp+1,L2*2,1,'#d8b040');R(xc2-L2,yHan-4,L2*2,2,'#d8b040');R(xc2-L2,yHan-4,L2*2,1,'#f8e080');
for(let k=0;k<7;k++){const sx=xc2-L2+2+((k*7)%(L2*2-3)), sy=yEp+4+((k*5)%(bas-yEp-6));R(sx,sy,1,1,'#fff8d0');}
if(!dos){R(xc2-2,yEp+8,4,1,'#d8b040');R(xc2-1,yEp+7,2,3,'#d8b040');}}}                         /* l'étoile brodée */
if(dos){
if(hautT==='veste'||hautT==='manteau'){R(-5,yEp-1,10,3,vestO);R(-5,yEp-1,10,1,vestC);}
if(hautT==='chemise'){R(-5,yEp-1,10,2,vestC);R(-EP+3,yEp+6,EP*2-6,1,vestO);}                 /* le col, l'empiècement */
if(hautT==='pull'){R(-HA,bas-3,HA*2,3,vestO);for(let x=-HA;x<HA;x+=2)R(x,bas-3,1,3,vestT);}
if(hautT==='manteau'){R(-1,yHan-6,2,long+8,vestO);R(-TA,yHan-3,TA*2,2,vestO);R(-4,yHan-3,8,1,vestC);}
if(hautT==='t-shirt'||peauH){R(-4,yEp,8,2,peau);R(-4,yEp+2,8,1,vestC);}
if(peauH){R(-EP+1,yEp,EP-4,4,peau);R(4,yEp,EP-5,4,peau);R(-3,yEp,6,9,peau);R(-3,yEp+9,6,1,vestC);}
}
if(cote){
if(hautT==='veste'||hautT==='manteau'){R(-4,yEp-2,4,4,vestO);R(1,yHan-7,5,3,vestO);R(1,yHan-8,5,1,vestT);}
if(hautT==='chemise')R(-3,yEp-1,5,2,vestC);
if(hautT==='pull')R(-Math.round(HA*0.75),bas-3,Math.round(HA*1.5),3,vestO);
if(hautT==='manteau'){const hw2=Math.round(HA*0.75);R(-hw2,yHan-3,hw2*2,2,vestO);R(hw2-3,yHan-3,2,4,vestT);for(let k=0;k<3;k++)bouton(hw2-4,yEp+10+k*6);}
}
if(!long){
const hw=cote?Math.round(HA*1.5/2):HA;
R(-hw,yHan-1,hw*2,2,'#6b4a2c');R(-hw,yHan-1,hw*2,1,'#8a6238');
if(!cote&&!dos){R(-2,yHan-1,4,2,'#c9a24a');R(-1,yHan-1,2,1,'#f0cf7d');}
if(!jupe&&!court){
if(!cote){R(-HA,yHan+1,HA*2,3,pant);R(-1,yHan+1,1,4,pantO);                     /* la fourche */
if(dos){R(-HA+2,yHan+2,HA-3,1,pantO);R(2,yHan+2,HA-3,1,pantO);R(-HA+2,yHan+4,HA-2,1,T(pant,-10));R(1,yHan+4,HA-3,1,T(pant,-10));}}
}
if(court&&!cote)R(-HA,yHan+1,HA*2,3,pant);
}
if(jupe){const L=basT==='jupe'?12:22, w=cote?Math.round(HA*1.2):HA*2+2;
/* LA JUPE : le tissu traîne et dépasse, d'autant plus qu'on descend
   vers l'ourlet. */
const ondJ=(r)=>Math.round(balJupe(r*1.6)*(r/L));
for(let r=0;r<L;r++){const ww=w+Math.round(r*0.4)*2+(bouge?Math.round(Math.abs(Math.sin(ph))*(r/L)*2):0);
R(-Math.round(ww/2)+ondJ(r),yHan+1+r,ww,1,r%4===0?pantO:(r===L-1?T(pant,-18):pant));}
for(let x2=-Math.round(w/2)+2;x2<Math.round(w/2);x2+=3)for(let r=2;r<L-1;r++)R(x2+ondJ(r),yHan+1+r,1,1,T(pant,-12));}    /* les plis */
};
function demiDos(){return HA*0.75;}
const main=(mx,my,cote2,profil,fonce,deDos)=>{
let p0=fonce?peauO:peau, p1=fonce?peauT:peauO, pc=fonce?peau:peauC;
if(p._gants){const gc=p._gants.g;p0=fonce?T(gc,-24):gc;p1=T(gc,-44);pc=T(gc,20);
if(p._gants.g2){R(mx-2,my-1,5,2,p._gants.g2);}}                                   /* le poignet, d'une autre couleur */
if(profil){R(mx-2,my,4,4,p0);R(mx-2,my+3,4,1,p1);R(mx+1,my+1,1,2,p1);R(mx-2,my,1,1,pc);R(mx+2,my+1,1,2,p0);return;}
R(mx-2,my,5,4,p0);
R(mx-2,my+4,1,1,p0);R(mx,my+4,1,1,p0);R(mx+2,my+4,1,1,p0);           /* le bout des doigts */
R(mx-1,my+3,1,2,p1);R(mx+1,my+3,1,2,p1);                                /* les séparations */
const pouce=cote2<0?mx+2:mx-2;                                          /* le pouce, vers le corps */
if(!deDos){R(pouce+(cote2<0?1:-1),my+1,1,2,p0);R(pouce,my+1,1,1,p1);}
R(mx-2,my,5,1,pc);R(cote2<0?mx-2:mx+2,my,1,4,p1);                      /* le dos éclairé, le bord dans l'ombre */
};
const bras=(cote2,balance,fonce)=>{
const c=fonce?vestO:vest, cC=fonce?vest:vestC, cT=vestT;
const sk=fonce?peauO:peau, skO=fonce?peauT:peauO;
/* LES MAINS SONT AU GUIDON. Le bras ne balance plus avec la jambe
   d'en face : il part de l'épaule, s'ouvre au coude et plonge sur la
   poignée. Les deux bras font le même geste, à une unité près — celui du
   fond est un peu plus court, il est plus loin. */
if(cote&&(PEDALE||TROT))balance=0;
if(cote){
/* LE BRAS DE COURSE, DE PROFIL. Il partait tendu droit devant : la main
   allait à six pixels et demi en avant du corps, à hauteur de poitrine,
   et n'y bougeait plus que de deux unités en hauteur. Un bras tendu,
   pas une course.

   Un coureur garde le coude fermé près du buste et fait monter la main
   de la hanche à l'épaule. On échange donc l'avancée contre de la
   hauteur : quatre pixels et demi devant au lieu de six et demi, et dix
   unités de battement vertical au lieu de deux. */
/* EN TROTTINETTE, LE BRAS EST PLUS TENDU QU'A VELO et moins plongeant :
   le guidon est plus haut et plus pres qu'un cintre, et l'on est debout
   derriere lui, pas couche dessus. Le coude s'ouvre donc presque
   entierement — il reste a mi-chemin de la main — et la main tombe a
   seize unites sous l'epaule au lieu de vingt-deux. */
/* LE COUDE EST A MI-CHEMIN, un rien plus haut que la ligne epaule-main :
   c'est ce qui donne le bras TENDU plutot que le bras raide. */
const ex=TROT?(fonce?8:9):(PEDALE?(fonce?3:4):(COURSE?1+balance*2*AMPL:2+balance*5*AMPL)),
      ey=TROT?yEp+6:yEp+11-(COURSE?1:0);
const hx=TROT?(fonce?TROT_AVANT-2:TROT_AVANT):(PEDALE?(fonce?5:6):(COURSE?ex+3+Math.max(0,balance)*3:2+balance*8*AMPL+(balance>0?1:0))),
      hy=TROT?yEp+TROT_MAIN+(fonce?1:0):(PEDALE?yEp+22:(COURSE?ey-2-balance*5:yEp+20));
const hautC=manches>0?c:sk, basC=manches>=1?c:sk;
R(-3,yEp,7,4,manches>0?cC:sk);R(-3,yEp+3,7,1,manches>0?c:skO);          /* l'épaule, arrondie */
seg(1,yEp+3,ex,ey,SX.bras[0]+1,hautC);seg(1,yEp+3,ex,ey,2,manches>0?cC:peauC);
seg(ex,ey,hx,hy,SX.bras[1]+1,basC);
if(manches>0&&manches<1){seg(ex,ey,hx,hy,4,sk);R(Math.round(ex)-2,Math.round(ey)-1,5,1,cT);}
if(manches>=1)R(Math.round(hx)-2,Math.round(hy)-1,5,1,cT);             /* le poignet de la manche */
R(Math.round(ex)+2,Math.round(ey),1,1,manches>=1?cT:skO);               /* le pli du coude */
main(Math.round(hx),Math.round(hy),cote2,true,fonce,false);
return;
}
/* LES BRAS DE LA COURSE. De face, la course ne se distinguait de la
   marche que par l'amplitude des jambes — les bras, eux, pendaient
   pareil. Or c'est le premier signe qu'on lit : en courant, le coude se
   plie et la main monte à hauteur de taille, et le balancement double. */
/* DE FACE ET DE DOS, en selle : les bras s'écartent un peu et les mains
   descendent au guidon, qui est plus bas et plus large que la taille. */
/* DE FACE, LE BALANCEMENT NE SE VOYAIT PAS : trois unités de battement
   en marche, soit un pixel et demi sur un buste de douze. Les mains
   restaient collées à la taille d'un bout à l'autre du cycle. Cinq en
   marche, sept en course. */
/* DE FACE ET DE DOS, EN TROTTINETTE : les bras s'ecartent franchement —
   le guidon fait vingt-trois pixels de large, bien plus que les epaules —
   et les mains s'arretent haut, a la hauteur des poignees. Sans ce cas,
   ils pendaient le long du corps et le guidon leur passait devant : le
   conducteur avait l'air de descendre un escalier derriere sa machine.
   Les chiffres sont en demi-pixels, comme tout l'interieur du sprite. */
const bx=cote2*(EP+Math.ceil(SX.bras[0]/2)+1+(PEDALE?2:0)+(TROT?5:0))+vrille,
      dy=(PEDALE||TROT)?0:Math.round(balance*(COURSE?7:5)),
      hCoude=TROT?8:(PEDALE?10:(COURSE?9:11)),
      hPoignet=TROT?TROT_MAIN:(PEDALE?21:(COURSE?14:19)),
      yC=yEp+hCoude+Math.round(dy/2), yM=yEp+hPoignet+dy;
const out=cote2<0?bx-2:bx+2, inn=cote2<0?bx+2:bx-2;
const lb=SX.bras[0]+1;R(bx-Math.floor(lb/2),yEp,lb,3,manches>0?c:sk);R(bx-2,yEp-1,4,1,manches>0?cC:sk);R(bx-2,yEp,3,1,manches>0?cC:peauC);

/* DE FACE, la main ne bougeait que verticalement (±3 px) : les bras
   restaient collés au corps et le balancement ne se lisait pas. Elle
   glisse maintenant aussi vers l'axe du corps quand le bras part en
   avant, et vers l'extérieur quand il part en arrière. */
const dxS=TROT?cote2*4:(PEDALE?cote2*3:(diag?Math.round(balance*4*tourne*(dos?-1:1)):Math.round(balance*3*-cote2)));
/* ================= LE PONT DE L'ÉPAULE =================
   Il restait un coin de fond entre le bras et le buste. Le trapèze
   descend en pente vers le cou sur les quatre premières lignes — de onze
   unités de demi-largeur à sept — mais le bras, lui, garde sa place du
   haut jusqu'en bas. D'où deux pixels de vide sous l'épaule, puis un
   filet d'un demi-pixel le long du biceps. Mesuré sur cinq lignes, et
   vieux comme le dessin : les deux versions d'avant donnaient le même
   trou au pixel près.

   On comble du bord du buste au bord interne du bras, ligne par ligne,
   et seulement jusqu'au coude : le haut du bras touche les côtes,
   l'avant-bras reste libre — c'est ce que fait un corps.

   Le décalage de la vrille et celui du balancement s'appliquent aux deux
   bords, sinon le pont se décroche dès que le corps tourne. Au-delà de
   huit unités on ne comble plus : le bras est parti pour de bon, et le
   vide est alors le bon dessin. */
if(!PEDALE&&!TROT){
const pont=manches>0?c:sk;
for(let r=yEp;r<yEp+hCoude;r++){
const dm=r<yEp+4?Math.round(5+(EP-5)*(r-yEp+1)/4):EP;
const dec=Math.round(dxS*Math.max(0,r-yEp-2)/Math.max(1,yM-yEp-2));
const bordCorps=cote2>0?(dm+vrille):(-dm+vrille);
const bordBras=bx+dec-cote2*2;
const lw=Math.abs(bordBras-bordCorps);
if(lw>0&&lw<8)R(Math.min(bordCorps,bordBras),r,lw,1,pont);
}}
const bande=(y0,y1,w,col,colO,colC)=>{for(let r=y0;r<y1;r++){const x0=bx+Math.round(dxS*Math.max(0,r-yEp-2)/Math.max(1,yM-yEp-2))-Math.floor(w/2);R(x0,r,w,1,col);R(cote2<0?x0:x0+w-1,r,1,1,colO);R(cote2<0?x0+w-1:x0,r,1,1,colC);}};
const mancheBas=manches>=1?yM:(manches>0?Math.round(yEp+2+(yM-yEp)*manches):yEp+2);
bande(yEp+2,Math.min(yC,mancheBas),SX.bras[0],manches>0?c:sk,manches>0?cT:skO,manches>0?cC:peauC);   /* le bras */
if(mancheBas<yC)bande(mancheBas,yC,SX.bras[0],sk,skO,peauC);
bande(yC,yM,SX.bras[1],mancheBas>yC?c:sk,mancheBas>yC?cT:skO,mancheBas>yC?cC:peauC);                         /* l'avant-bras */
if(mancheBas>yC&&mancheBas<yM)bande(mancheBas,yM,SX.bras[1],sk,skO,peauC);
if(manches>0&&manches<1)R(bx-2,mancheBas-1,5,1,cT);                    /* l'ourlet de la manche courte */
if(manches>=1){R(bx-2,yM-1,5,1,cT);R(bx-2,yM-2,5,1,c);}                 /* le poignet de la manche */
R(out,yC,1,1,manches>=1?cT:skO);                                         /* le coude */
R(bx-1,yM,3,1,skO);                                                      /* le poignet */
main(bx+dxS,yM+1,cote2,false,fonce,dos||Math.abs(balance)>0.7);                 /* au bout du balancement, on voit le dos de la main */
void inn;
};
const sac=(devant)=>{
if(sacC==='aucun')return;
const sb=bouge?Math.round(Math.max(0,Math.sin(ph*2-0.8))*1.4):0;
const s0=sacC, sC=T(sacC,22), sO=T(sacC,-28), sOO=T(sacC,-52), boucle2='#c9a24a';
if(dos&&!devant){
const y4=yEp+3+sb, xs=diag?-tourne*2:0;
for(let r=0;r<19;r++){const w=r<2?12:(r>16?14:16);const x0=xs-Math.round(w/2);
R(x0,y4+r,w,1,s0);R(x0,y4+r,1,1,sOO);R(x0+w-1,y4+r,1,1,sOO);R(x0+w-3,y4+r,2,1,sC);}
R(xs-3,y4-2,6,1,sO);R(xs-3,y4-1,1,1,sO);R(xs+2,y4-1,1,1,sO);                 /* la poignée */
for(let r=0;r<8;r++){const w=16-(r>5?2:0);R(xs-Math.round(w/2),y4+r,w,1,r<1?sC:s0);}   /* le rabat */
R(xs-8,y4+8,16,1,sOO);R(xs-8,y4+7,16,1,sO);
[[-5],[3]].forEach(([dx2])=>{R(xs+dx2,y4+2,2,9,sO);R(xs+dx2,y4+9,2,2,boucle2);R(xs+dx2,y4+9,1,1,'#f0cf7d');});   /* les sangles, les boucles */
R(xs-6,y4+12,12,5,sO);R(xs-6,y4+12,12,1,sC);R(xs-1,y4+13,2,1,boucle2);          /* la poche avant */
for(let r=y4+2;r<y4+18;r+=2){R(xs-8+1,r,1,1,sOO);}                             /* les coutures */
}
else if(!dos&&devant&&!cote){
const xs=diag?vis:0;
[[-EP+3],[EP-5]].forEach(([bx2])=>{R(xs+bx2,yEp-1,3,20,sO);R(xs+bx2,yEp-1,1,20,sOO);R(xs+bx2+2,yEp,1,18,s0);
R(xs+bx2,yEp+14,3,2,boucle2);});
R(xs-EP+5,yEp+9,EP*2-8,1,sO);R(xs-1,yEp+8,3,3,boucle2);R(xs,yEp+9,1,1,'#f0cf7d');
}
else if(cote&&!devant){
const y4=yEp+3+sb;
for(let r=0;r<18;r++){const w=r<2?5:7;R(-10-sb-w+6,y4+r,w,1,s0);R(-10-sb-w+6,y4+r,1,1,sOO);}
R(-11-sb,y4+10,4,6,sO);R(-11-sb,y4+10,4,1,sC);R(-7-sb,y4,1,8,sOO);R(-10-sb,y4-1,5,1,sC);
R(-3,yEp-1,4,2,sO);R(-2,yEp+1,2,8,sO);R(-2,yEp+6,2,2,boucle2);                   /* la bretelle */
}
};
const melangeF=(a,b,k)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);
const c=(sh)=>Math.round(((A>>sh)&255)*(1-k)+((B>>sh)&255)*k);return '#'+((1<<24)+(c(16)<<16)+(c(8)<<8)+c(0)).toString(16).slice(1);};
const levre=melangeF(peau,'#a8404c',0.38), levreC=melangeF(peau,'#d07884',0.30), fente=T(peau,-78), creux=T(peau,-16);
const oreille=(cx,hy,cote2,dosV)=>{
const x=cote2<0?cx-3:cx;
R(x,hy+9,3,7,peau);R(cote2<0?x:x+2,hy+9,1,7,peauO);                       /* l'ourlet et son ombre */
if(!dosV){R(cote2<0?x+1:x+1,hy+10,1,4,peauO);R(cote2<0?x+1:x+1,hy+11,1,2,peauT);}   /* le creux */
else R(cote2<0?x+1:x+1,hy+10,1,4,T(peau,-12));
R(cote2<0?x+2:x,hy+9,1,1,peauC);                                             /* le haut éclairé */
R(x+(cote2<0?1:0),hy+16,2,1,peauO);                                           /* le lobe */
};
const tete=()=>{
const hy=yTete;
const cx1=-Math.floor(SX.cou/2);
/* ================= LE COU =================
   C'était un rectangle de peau avec une bande claire. Un cou se lit à
   l'ombre que le menton y porte, au creux entre les clavicules et aux
   trapèzes qui montent vers les épaules. */
R(cx1,yCou-1,SX.cou,6,peau);
R(cx1,yCou-1,SX.cou,1,peauT);                                   /* l'ombre portée du menton */
R(cx1,yCou,SX.cou,1,peauO);
R(cx1,yCou-1,1,6,peauO);
R(cx1+SX.cou-1,yCou+1,1,4,peauC);                               /* le côté éclairé */
if(!cote&&!dos){
R(-1,yCou+2,1,2,peauO);R(1,yCou+2,1,2,peauO);                   /* les tendons */
R(-1,yCou+3,2,1,peauO);R(0,yCou+4,1,1,peauT);                   /* le creux des clavicules */
R(cx1,yCou+4,2,1,peau);R(cx1+SX.cou-2,yCou+4,2,1,peauO);}       /* les trapèzes */
else if(dos){R(cx1+1,yCou+1,SX.cou-2,1,peauO);}                 /* la nuque, de dos */
if(cote){
/* LE CRÂNE DE PROFIL. Il mesurait 21 px de long pour 24 de large de face :
   plus court que large, donc aplati dès que le personnage tourne. Un crâne
   humain est l'inverse. On l'allonge de 4 px VERS L'ARRIÈRE, là où aucun
   trait n'est posé — le nez, l'œil et la mâchoire ne bougent pas d'un pixel. */
for(let r=0;r<24;r++){
const w=r<2?19:(r>20?18:25), xx=-14+(r>20?2:0);
R(xx,hy+r,w,1,peau);}
R(-14,hy+3,2,17,peauO);                                                         /* la nuque */
R(-14,hy+2,3,1,T(peau,-14));                                                    /* l'occiput, dans l'ombre */
R(3,hy+13,4,1,peauC);R(4,hy+12,2,1,T(peau,22));R(3,hy+15,3,3,T(peau,-12));
for(let x=-2;x<9;x++)R(x,hy+21+(x<2?0:(x<6?1:0)),1,1,T(peau,-18));             /* la ligne de la mâchoire */
R(7,hy+22,3,1,peauC);R(6,hy+9,4,1,T(peau,-7));R(-6,hy+5,3,6,T(peau,-8));        /* le menton, l'orbite, la tempe */
/* L'ARRIÈRE DU CRÂNE, maintenant plus long : un dégradé le fait tourner
   au lieu de rester un aplat. */
R(-13,hy+3,3,15,T(peau,-13));R(-14,hy+5,2,11,T(peau,-20));
const NZ={petit:[[10,11,1],[10,12,2],[10,13,2]],droit:[[10,10,1],[10,11,2],[10,12,2],[10,13,3],[10,14,2]],
large:[[10,10,2],[10,11,3],[10,12,3],[10,13,4],[10,14,3]],retrousse:[[10,11,1],[10,12,2],[10,13,3],[11,12,2]]}[nez]||[];
NZ.forEach(([a,b,l])=>R(a,hy+b,l,1,peau));
const bout=NZ.reduce((m,[a,b,l])=>Math.max(m,a+l),10);
R(bout-1,hy+(nez==='retrousse'?12:13),1,1,peauC);                               /* la pointe éclairée */
R(10,hy+14,2,1,peauO);R(11,hy+14,1,1,peauT);                                   /* l'aile, la narine */
R(-3,hy+9,5,7,peau);R(-3,hy+9,1,7,peauO);R(-2,hy+9,3,1,peauC);
R(-1,hy+10,2,4,peauO);R(0,hy+11,1,2,peauT);R(1,hy+11,1,3,peau);R(-2,hy+15,3,1,peauO);
if(boucle!=='aucune')R(-2,hy+16,2,2,boucle==='perle'?'#f2efe4':(boucle==='plume'?'#c0392b':'#e8c06a'));
oeilDe(4,hy+10,true);sourcilDe(3,hy+7,true);
R(10,hy+17,1,3,peau);R(9,hy+17,1,1,levre);R(9,hy+19,1,1,levreC);
if(bouche==='entrouverte'){R(7,hy+18,3,1,T(peau,-90));R(9,hy+18,1,1,'#f2efe4');}
else R(6,hy+18,4,1,fente);
if(bouche==='sourire'){R(6,hy+17,1,1,fente);R(5,hy+16,1,1,creux);}
if(bouche==='severe')R(6,hy+19,1,1,fente);
if(bouche==='lèvres'){R(9,hy+17,2,1,levre);R(9,hy+19,2,1,levreC);}
R(8,hy+21,2,1,creux);
if(marque==='fard')R(4,hy+13,3,2,T(peau,-12));if(marque==='taches')[[5,13],[7,14],[3,14]].forEach(([a,b])=>R(a,hy+b,1,1,peauT));
if(marque==='cicatrice')R(2,hy+6,1,7,T(peau,-40));if(marque==='grain')R(7,hy+15,1,1,peauT);
if(marque==='peinture')R(2,hy+11,8,2,'#c0392b');
}else if(dos){
for(let r=0;r<24;r++){const w=r<2?18:(r>21?16:24);R(-Math.round(w/2),hy+r,w,1,peau);}
oreille(-12,hy,-1,true);oreille(12,hy,1,true);
}else{
/* LE CRÂNE DE TROIS QUARTS : il rétrécit de 7 %, comme un volume qu'on
   voit en biais, et il tourne d'un pixel de plus que les épaules. */
/* LE CRÂNE, LE VISAGE ET LA JOUE suivent tous le même cran de rotation :
   de trois quarts c'est `vis` qui commande, de face et de dos c'est la
   tête tournée. Un seul nombre, trois décalages proportionnels — sinon
   le visage glisse sans que le crâne suive, et la tête se dévisse. */
for(let r=0;r<24;r++){let w=r<2?18:(r>19?22-(r-20)*2:24);
if(diag)w=Math.round(w*0.93);
R(-Math.round(w/2)+dT,hy+r,w,1,r>19?peauO:peau);}
R(-12+dT,hy+2,1,18,peauO);R(11+dT,hy+2,1,18,peauC);
/* LA JOUE DU FOND : trois pixels d'ombre au lieu de deux — c'est la
   surface qui s'éloigne du regard. */
if(diag){R((vis>0?-11:8)+dT,hy+2,3,17,T(peau,-13));
R((vis>0?-12:10)+dT,hy+2,1,18,T(peau,-24));}
/* DE FACE, tête tournée : la joue qu'on quitte prend un peu d'ombre.
   Deux fois moins marquée que de trois quarts — la rotation n'est que
   d'un cran, pas d'un octant. */
else if(yawT)R((yawT>0?-11:9)+dT,hy+3,2,15,T(peau,-8));
{const m=diag?vis*2:yawT, ombre=T(peau,-11), creux2=T(peau,-17);
R(-11+m,hy+4,2,14,ombre);                                                     /* le côté dans l'ombre */
R(-11+m,hy+6,1,5,creux2);R(10+m,hy+6,1,4,T(peau,-6));                          /* les tempes */
R(-8+m,hy+9,5,1,T(peau,-7));R(3+m,hy+9,5,1,T(peau,-5));                       /* le creux des orbites */
R(-9+m,hy+14,3,1,peauC);R(6+m,hy+14,4,1,peauC);R(7+m,hy+13,2,1,T(peau,24));    /* les pommettes */
R(-10+m,hy+16,2,3,creux2);R(8+m,hy+16,2,3,ombre);                             /* les joues, dessous */
for(let r=18;r<23;r++){const hw=r>19?11-(r-20):12;R(-hw+m,hy+r,2,1,creux2);R(hw-2+m,hy+r,1,1,ombre);}   /* la mâchoire */
R(-2+m,hy+22,4,1,peauC);R(-1+m,hy+23,2,1,T(peau,-6));                         /* le menton éclairé */
R(-3+m,hy+2,7,2,T(peau,8));}                                                   /* le front, éclairé */
if(!diag||vis<0)oreille(12,hy,1,false);if(!diag||vis>0)oreille(-12,hy,-1,false);   /* les oreilles */
if(boucle!=='aucune'){const bc=boucle==='perle'?'#f2efe4':(boucle==='plume'?'#c0392b':'#e8c06a');
if(!diag||vis>0)R(-14,hy+16,2,2,bc);if(!diag||vis<0)R(12,hy+16,2,2,bc);}
oeilDe(-7+f3+(diag&&vis>0?1:0),hy+11,false,diag&&vis>0);
oeilDe(3+f3-(diag&&vis<0?1:0),hy+11,false,diag&&vis<0);
sourcilDe(-7+f3,hy+8,false);sourcilDe(3+f3,hy+8,false);
g.save();g.translate(f3*u*(1),0);
if(nez==='petit'){R(0,hy+14,1,1,peauC);R(-1,hy+15,3,1,peauO);R(-1,hy+15,1,1,peauT);R(1,hy+15,1,1,peauT);}
else if(nez==='large'){R(-1,hy+12,1,2,peauO);R(-3,hy+14,6,2,peauO);R(-1,hy+14,2,1,peauC);R(-3,hy+15,1,1,peauT);R(2,hy+15,1,1,peauT);R(-2,hy+16,4,1,T(peau,-12));}
else if(nez==='retrousse'){R(-1,hy+12,1,2,peauO);R(0,hy+13,1,1,peauC);R(-2,hy+14,4,1,peauO);R(-1,hy+14,1,1,peauT);R(1,hy+14,1,1,peauT);}
else{
/* LE NEZ DROIT était une seule colonne d'ombre entre deux grands aplats
   de peau : à la taille du jeu, il disparaissait. Un nez ne se lit pas à
   son ombre seule, il se lit au CONTRASTE entre son côté éclairé et son
   côté sombre. On lui donne donc les deux, plus son ombre portée. */
R(-1,hy+11,1,4,peauO);                 /* l'arête, côté ombre */
R(0,hy+11,1,3,T(peau,12));             /* l'arête, côté lumière */
R(0,hy+14,1,1,peauC);
R(-2,hy+15,4,1,peauO);R(-2,hy+15,1,1,peauT);R(1,hy+15,1,1,peauT);
R(-1,hy+16,3,1,T(peau,-10));           /* l'ombre portée sous le nez */
}
const bc=T(peau,-62);
void bc;
if(bouche==='sourire'){
R(-3,hy+18,6,1,fente);R(-4,hy+17,1,1,fente);R(3,hy+17,1,1,fente);          /* la fente qui remonte */
R(-2,hy+19,4,1,levreC);R(-5,hy+16,1,1,creux);R(4,hy+16,1,1,creux);        /* la lèvre, les fossettes */
}else if(bouche==='severe'){
R(-3,hy+18,6,1,fente);R(-4,hy+19,1,1,fente);R(3,hy+19,1,1,fente);          /* les coins qui tombent */
R(-2,hy+19,4,1,creux);
}else if(bouche==='entrouverte'){
R(-2,hy+17,4,1,levre);R(-2,hy+18,4,2,T(peau,-90));R(-1,hy+18,2,1,'#f2efe4');  /* les dents du haut */
R(-3,hy+18,1,1,fente);R(2,hy+18,1,1,fente);R(-2,hy+20,4,1,levreC);
}else if(bouche==='lèvres'){
R(-3,hy+17,6,1,levre);R(-1,hy+17,1,1,T(levre,-18));                         /* l'arc de la lèvre du haut */
R(-3,hy+18,6,1,T(levre,-40));R(-2,hy+19,4,2,levreC);R(-1,hy+19,1,1,T(levreC,28));
}else if(bouche==='pincée'){
R(-2,hy+18,4,1,fente);R(-3,hy+18,1,1,creux);R(2,hy+18,1,1,creux);R(-1,hy+19,2,1,creux);
}else{
R(-3,hy+18,6,1,fente);R(-4,hy+18,1,1,T(peau,-40));R(3,hy+18,1,1,T(peau,-40));
R(-2,hy+19,4,1,levreC);
}
R(-1,hy+21,2,1,creux);                                                           /* le creux sous la lèvre */
if(marque==='taches')[[-6,14],[-4,15],[4,14],[6,15],[-5,16],[5,16]].forEach(([a,b])=>R(a,hy+b,1,1,peauT));
else if(marque==='cicatrice'){R(4,hy+7,1,8,T(peau,-40));R(3,hy+9,3,1,T(peau,-40));}
else if(marque==='grain')R(4,hy+16,1,1,peauT);
else if(marque==='fard'){R(-8,hy+14,3,2,'#e0907a');R(5,hy+14,3,2,'#e0907a');}
else if(marque==='peinture'){R(-8,hy+12,4,1,'#c0392b');R(4,hy+12,4,1,'#2d6fb0');}
g.restore();
if(diag)R(vis>0?9+1:-11,hy+12,2,3,peau);                                  /* le nez qui dépasse le profil */
}
};
function oeilDe(ex,ey,profil,loin){
/* ================= L'ŒIL =================
   Un œil plat se reconnaît à trois choses : un blanc uniforme, un iris
   d'une seule teinte, un seul reflet. On corrige les trois.
   La lumière vient du haut-gauche, comme pour tout le personnage. */
/* DE TROIS QUARTS, l'œil du fond est rogné par l'arête du nez : il perd
   un pixel du côté intérieur. C'est ce détail qui vend la rotation. */
const F=(typeof FACE_FIN==='object'&&FACE_FIN)?FACE_FIN:null;
const mi=!!(F&&F.mi)&&!CLIGNE_FIN;
if(mi)ey=ey+1;                      /* la paupière descend d'un pixel */
const gauche=!profil&&ex<0, w=profil?3:(loin?4:5);
const x0=(gauche?ex-1:ex)+(loin&&!gauche?1:0);
const blanc='#f6f2e8', lid=T(peau,-60);
const coinExt=gauche?x0-1:x0+w, coinInt=gauche?x0+w:x0-1;
if(CLIGNE_FIN){R(x0,ey+1,w,1,lid);R(x0,ey,w,1,T(peau,-22));
R(profil?x0+w-1:coinExt,ey+1,1,1,N);return;}
const h=(fy==='ronds'?4:3)-(mi?1:0);
/* LE REGARD : la direction donne le cap, la saccade ajoute le pixel qui
   bouge. L'iris est ensuite borné au blanc de l'œil, donc il ne peut pas
   en sortir même si les deux s'additionnent. */
const regard=(diag?vis:(profil?1:yawT))+(F?(F.regard||0):0);
if(fy==='plisses'){
/* LES YEUX PLISSÉS : on voit encore l'iris, coincé entre deux paupières,
   au lieu d'un simple trait noir. */
R(x0,ey+1,w,1,T(oeil,-30));
R(Math.max(x0,Math.min(x0+w-2,x0+1+regard)),ey+1,2,1,oeil);
R(Math.max(x0,Math.min(x0+w-2,x0+1+regard)),ey+1,1,1,N);
R(x0,ey,w,1,lid);R(coinExt,ey,1,1,N);
R(x0,ey+2,w,1,T(peau,-20));
return;}
/* LE BLANC, jamais uniforme : ombre de la paupière en haut, ombre du nez
   au coin intérieur. */
R(x0,ey,w,h,blanc);
R(x0,ey,w,1,T(blanc,-14));
R(coinInt+(gauche?-1:1),ey,1,h,T(blanc,-10));
/* L'IRIS : anneau sombre en haut, éclairci en bas — la lumière traverse
   l'œil et rebondit au fond. */
const iw=profil?2:3, ix=Math.max(x0,Math.min(x0+w-iw,x0+1+regard));
/* LA COULEUR DES YEUX NE SE VOYAIT PAS. La teinte par défaut est très
   sombre (#26241f) et l'iris n'était éclairci que de seize points en
   bas : à l'écran, l'œil lisait comme un trou noir, et personne ne
   pouvait dire si son personnage avait les yeux bruns ou bleus. On
   ouvre l'écart — le bas de l'iris monte à quarante, et le bord
   extérieur reçoit son propre reflet. La pupille, elle, reste noire :
   c'est elle qui doit rester le point le plus sombre du visage. */
R(ix,ey,iw,h,oeil);
R(ix,ey,iw,1,T(oeil,-38));
R(ix,ey+h-1,iw,1,T(oeil,40));
R(ix+iw-1,ey+1,1,1,T(oeil,26));
R(ix,ey,1,h,T(oeil,-16));
R(ix+(iw>2?1:0),ey+1,1,Math.min(2,h-1),N);                 /* la pupille */
/* LES DEUX REFLETS : un franc en haut-gauche, un discret en bas-droite. */
R(ix,ey,1,1,'#ffffff');
R(ix+iw-1,ey+h-1,1,1,T(oeil,46));
/* LA PAUPIÈRE a une épaisseur, et ses cils tombent au coin extérieur. */
R(x0,ey-1,w,1,lid);
R(x0,ey-2,w,1,T(peau,-26));
if(!profil)R(coinExt,ey-1,1,2,N);else R(x0+w,ey-1,1,2,N);
R(coinInt,ey+h-2,1,1,T(peau,-30));                          /* le coin intérieur, rosé */
if(fy==='fatigues'){R(x0,ey+h,w,1,T(peau,-24));R(x0+1,ey+h+1,w-2,1,T(peau,-14));
R(x0,ey-1,w,1,T(peau,-38));}
else if(fy==='doux'){R(x0,ey+h,w,1,T(peau,-12));
R(gauche?x0:x0+w-1,ey+h-1,1,1,T(peau,-6));R(x0+1,ey-2,w-2,1,T(peau,-16));}
else if(fy==='severes'){R(gauche?x0+w-2:x0,ey-1,2,2,lid);R(x0,ey,w,1,T(oeil,-40));}
else if(fy==='ronds'){R(x0,ey+h,w,1,T(peau,-12));R(coinExt,ey,1,1,T(peau,-20));}
/* LA PAUPIÈRE DU BAS. Les formes « fatigués », « doux » et « ronds » en
   avaient une, la forme par défaut non : l'œil flottait sur la joue au
   lieu d'être posé dans son orbite. Une ligne, à peine plus sombre que
   la peau — assez pour fermer la forme, pas assez pour faire un cerne. */
else R(x0+1,ey+h,w-2,1,T(peau,-11));
}
function sourcilDe(ex,ey,profil){
/* LE SOURCIL SUIT L'ŒIL. Quand le regard part de côté, le sourcil du
   même côté se soulève d'un pixel — c'est involontaire chez un humain,
   et son absence est exactement ce qui fait les yeux de poupée. */
const FS=(typeof FACE_FIN==='object'&&FACE_FIN)?FACE_FIN:null;
if(FS&&FS.regard){const cote=ex<0?-1:1;if(cote===FS.regard)ey=ey-1;}
const gauche=!profil&&ex<0, w=profil?4:6, x0=gauche?ex-1:ex, c=chevO, c2=chev;
const px=(k,yy,cc)=>R(x0+k,yy,1,1,cc||c);
if(sourcil==='epais'){R(x0,ey-1,w,2,c);R(x0+1,ey-2,w-2,1,c2);}
else if(sourcil==='arques'){px(0,ey);px(1,ey-1);R(x0+2,ey-2,w-4,1,c);px(w-2,ey-1);px(w-1,ey);}
else if(sourcil==='fronces'){
for(let k=0;k<w;k++){const versInt=gauche?k/(w-1):1-k/(w-1);px(k,ey-1+Math.round(versInt*2),k%2?c:c);}
R(gauche?x0+w-1:x0,ey+1,1,1,c);}
else{R(x0+1,ey-1,w-2,1,c);px(0,ey);px(w-1,ey);}
}
const H5={b:chev, c:T(chev,24), cc:T(chev,46), o:POINTES||T(chev,-24), oo:POINTES?T(POINTES,-30):T(chev,-48)};          /* des pointes d'une autre couleur : le « dip-dye » */
const CF={
'courts':      {vol:2,fr:'meche',lg:0},  'très courts':{vol:0,fr:'rase',lg:0},   'dégradé':{vol:1,fr:'degrade',lg:0},
'bol':         {vol:2,fr:'frange',lg:0},  'carré':      {vol:2,fr:'raie',lg:9},   'mi-longs':{vol:2,fr:'raie',lg:14},
'longs':       {vol:2,fr:'raie',lg:24},   'très longs': {vol:2,fr:'raie',lg:34},  'queue':{vol:1,fr:'tire',lg:0,sp:'queue'},
'couettes':    {vol:1,fr:'raie',lg:0,sp:'couettes'}, 'chignon':{vol:1,fr:'tire',lg:0,sp:'chignon'},
'chignon haut':{vol:1,fr:'tire',lg:0,sp:'chignonHaut'}, 'tresse':{vol:1,fr:'tire',lg:0,sp:'tresse'},
'tresses':     {vol:1,fr:'raie',lg:0,sp:'tresses'}, 'ondulés':{vol:3,fr:'raie',lg:16,ond:1},
'bouclés':     {vol:4,fr:'boucle',lg:8,ond:2}, 'afro':{vol:9,fr:'afro',lg:0},
'dreads':      {vol:2,fr:'dreads',lg:22},  'banane':{vol:2,fr:'banane',lg:0}, 'crête':{vol:0,fr:'crete',lg:0},
'crâne':       {vol:0,fr:'crane',lg:0},    'hirsute':{vol:4,fr:'hirsute',lg:4},
'mulet':{vol:2,fr:'degrade',lg:18}, 'afroGeante':{vol:14,fr:'afro',lg:0}, 'samourai':{vol:1,fr:'rase',lg:0,sp:'chignonHaut',x:'samourai'},
'pics':{vol:5,fr:'hirsute',lg:0,x:'pics'}, 'creteGeante':{vol:0,fr:'crete',lg:0,x:'crete'}, 'bananeGeante':{vol:3,fr:'banane',lg:0,x:'banane'},
'dreadsOr':{vol:2,fr:'dreads',lg:30,x:'perles'}, 'comete':{vol:3,fr:'raie',lg:26,ond:1,x:'comete'}};
const cf=CF[coiffe]||CF['courts'];
/* ================= LES MÈCHES =================
   Une coupe n'est plus une demi-ellipse mais une dizaine de mèches, chacune
   avec son départ sur le crâne, sa largeur, sa longueur et sa pente. C'est
   leur réunion qui fait la silhouette, et les creux entre elles qui donnent
   l'épaisseur. La raie décentre l'ensemble : rien n'est symétrique. */
/* ================= LE CARACTÈRE D'UNE COUPE =================
   Jusqu'ici toutes les coupes étaient dessinées avec les mêmes neuf mèches
   régulières : seules leur longueur et leur volume changeaient. Résultat,
   elles se ressemblaient. Chacune reçoit maintenant sa densité, son
   désordre, l'épaisseur de ses mèches et sa brillance.

   dens    : combien de mèches (plus = plus fourni, mèches plus fines)
   desordre: de combien chaque mèche s'écarte de sa place théorique
   ep      : l'épaisseur de base d'une mèche
   lustre  : l'intensité du reflet (une chevelure saine brille, pas une rase)
   pointe  : combien la mèche s'affine vers son extrémité */
const CARACTERE={
rase    :{dens:0.6,desordre:0,   ep:2,lustre:0.2,pointe:0.3},
degrade :{dens:0.8,desordre:0.3, ep:2,lustre:0.3,pointe:0.4},
meche   :{dens:1.0,desordre:0.5, ep:3,lustre:0.9,pointe:0.55},
frange  :{dens:1.3,desordre:0.25,ep:3,lustre:1.0,pointe:0.45},
raie    :{dens:1.1,desordre:0.4, ep:3,lustre:1.1,pointe:0.6},
tire    :{dens:1.2,desordre:0.15,ep:2,lustre:1.3,pointe:0.5},
boucle  :{dens:1.5,desordre:1.1, ep:3,lustre:0.7,pointe:0.35},
afro    :{dens:1.8,desordre:1.4, ep:3,lustre:0.4,pointe:0.2},
dreads  :{dens:0.7,desordre:0.6, ep:4,lustre:0.3,pointe:0.15},
banane  :{dens:1.2,desordre:0.2, ep:3,lustre:1.4,pointe:0.5},
crete   :{dens:0.9,desordre:0.8, ep:3,lustre:0.8,pointe:0.7},
hirsute :{dens:1.3,desordre:1.6, ep:2,lustre:0.5,pointe:0.7},
crane   :{dens:0,  desordre:0,   ep:1,lustre:0,  pointe:0}};
const CAR=CARACTERE[cf.fr]||CARACTERE.meche;
const RAIE=(coiffe==='carré'||coiffe==='mi-longs'||coiffe==='longs'
||coiffe==='très longs'||coiffe==='ondulés')?-3:(cf.fr==='raie'?-2:-4);
/* LE BORD DE LA CHEVELURE.
   La masse de cheveux ne doit jamais dépasser le crâne de plus d'un pixel
   sur les côtés, et au-dessus elle doit S'ARRONDIR : sans ça on obtient un
   champignon de face et un bloc carré de dos. */
const bordCheveux=(rr,hy,demi,vol)=>{
const k=hy-rr;                                   /* combien de rangs au-dessus */
if(k<=0)return demi+1;                           /* sur le crâne : un pixel de plus */
if(k>vol)return 0;                               /* au-delà du volume : plus rien */
/* une courbe un peu bombée plutôt qu'un cercle : le haut du crâne reste
   large sur un rang ou deux, puis se referme vite. */
const t=k/(vol+0.6);
return Math.max(0,Math.round((demi+1)*Math.pow(Math.max(0,1-t*t),0.62)));};
const mechesDe=()=>{
const L=[], lg=cf.lg, vol=cf.vol;
/* la longueur sur les côtés : une coupe courte s'arrête à l'oreille,
   une longue descend sous la mâchoire */
const base=lg?Math.min(lg+6,26):(cf.fr==='rase'||cf.fr==='degrade'?4:8);
/* neuf mèches réparties sur la largeur du crâne, décalées par la raie */
const NM=Math.max(5,Math.round(9*CAR.dens));
for(let i=0;i<NM;i++){
const x=-11+i*(22/(NM-1));
const vers=(x-RAIE)/12;                       /* l'écart à la raie, en -1..1 */
/* LE DÉPART DE LA MÈCHE : au centre elle part du sommet, sur les côtés
   elle part plus bas — sinon la chevelure se hérisse en pointes. */
const dep=Math.round(-vol*(1-Math.abs(vers)*0.55));
/* les mèches du côté le plus fourni sont plus longues */
const plus=vers<0?1.18:0.9;
/* le désordre : chaque mèche s'écarte un peu de sa place, toujours de la
   même façon — c'est ce qui donne du naturel sans faire du bruit. */
const ecart=Math.round((alea(i*9.1)-0.5)*2*CAR.desordre);
L.push({x:Math.round(x)+ecart,y:dep+Math.round((alea(i*4.3)-0.5)*CAR.desordre),
lo:Math.max(3,Math.round(base*plus*(0.82+alea(i*3.7)*0.3))),
la:Math.max(1,CAR.ep-(i%3===1?0:1)+(CAR.dens>1.4?1:0)),
p:vers*0.16+(alea(i*6.7)-0.5)*0.1*CAR.desordre,
ond:cf.ond||0});}
return L;};

const mat=(r,r0,r1)=>{const k=(r-r0)/Math.max(1,r1-r0);return k<0.12?H5.c:(k>0.86?H5.o:H5.b);};
/* LE PROFIL DU CRÂNE, de face : c'est exactement celui que dessine tete(),
   24 de large, resserré à 18 sur les deux premiers rangs. Les cheveux s'y
   calent au lieu d'être une calotte uniforme qui déborde. */
/* DE DOS : 24 de large, 18 sur les deux premiers rangs, 16 tout en bas. */
const craneD=(r,hy)=>{const k=r-hy;
if(k<0)return 12;
if(k<2)return 9;
if(k>21)return 8;
return 12;};
/* DE PROFIL : le crâne va de -10 à 11, resserré à 16 de large sur les deux
   premiers rangs, et il avance de 2 px au niveau de la mâchoire. */
const craneC=(r,hy)=>{const k=r-hy;
if(k<0)return {g:-12,d:6};                /* au-dessus : le volume */
if(k<2)return {g:-14,d:5};
if(k>20)return {g:-12,d:7};
return {g:-14,d:11};};
const craneF=(r,hy)=>{const k=r-hy;
if(k<0)return 12;                       /* au-dessus du crâne : le volume */
if(k<2)return 9;
if(k>19)return Math.max(7,11-(k-20));
return 12;};
const calotte=(cx,yTop,yBas,hw,ry,epouse,hy)=>{
for(let r=yTop;r<yBas;r++){const dy=Math.max(0,(yTop+ry)-r);
let w=Math.round(hw*Math.sqrt(Math.max(0,1-(dy/ry)*(dy/ry))));
/* LE MODE « ROND » FERME AUSSI LE BAS. Les autres modes épousent le crâne,
   qui s'occupe lui-même de rentrer vers la nuque ; une masse plus large que
   le crâne n'épouse rien, et ses derniers rangs restaient à pleine largeur
   — l'afro de dos se lisait comme une boîte posée sur les épaules. */
if(epouse==='rond'){const rb=ry*0.72, db=Math.max(0,r-(yBas-1-rb));
const w2=Math.round(hw*Math.sqrt(Math.max(0,1-(db/rb)*(db/rb))));
if(w2<w)w=w2;}
if(w<=0)continue;
let g0=cx-w, g1=cx+w;
if(epouse==='face'){const c=craneF(r,hy)+1;
if(w>c){g0=cx-c;g1=cx+c;}}
else if(epouse==='profil'){const c=craneC(r,hy);
if(g0<c.g-1)g0=c.g-1;if(g1>c.d+2)g1=c.d+2;}
else if(epouse==='dos'){const c=craneD(r,hy)+1;if(w>c){g0=cx-c;g1=cx+c;}}
else if(epouse===true){const c=craneF(r,hy)+1;if(w>c){g0=cx-c;g1=cx+c;}}
if(g1<=g0)continue;
R(g0,r,g1-g0,1,mat(r,yTop,yBas));
R(g0,r,1,1,H5.o);R(g1-1,r,1,1,H5.o);}
};
const meches=(x0,x1,y0,y1,pas2,c)=>{for(let x2=x0+1;x2<x1-1;x2+=pas2)for(let r=y0+1;r<y1;r++){if((r+x2)%5===0)continue;
const xx=x2+Math.round(Math.sin((r-y0)*0.25)*0.6);R(xx,r,1,1,c||((r+x2)%7===0?H5.oo:H5.o));if((r+x2)%6===0)R(xx+1,r,1,1,H5.c);}};
const phH=bouge?ph:(typeof BRISE_PH==='number'?BRISE_PH:0), ampH=bouge?1:0.55;
/* ================= L'INERTIE =================
   Jusqu'ici tout ce qui pendait suivait le corps instantanément : une seule
   sinusoïde pour les cheveux, les pans de veste et le sac. Or une masse
   accélère en retard, dépasse la position d'équilibre, puis revient.

   Comme les poses sont gravées puis mises en cache, l'inertie ne peut pas
   être un ressort qui se souvient : elle doit se calculer à partir de la
   seule phase. On la modélise donc par deux termes :

     le retard   — on lit la phase du corps telle qu'elle était un peu avant
     le dépassement — une seconde onde, deux fois plus rapide et déphasée,
                    qui fait le sursaut de la masse en bout de course

   Chaque matière a ses réglages : une chevelure longue traîne davantage
   qu'une mèche courte, un pan de manteau davantage qu'un ourlet de chemise. */
const INERTIE={
courts:  {ret:0.06, amp:0.13, sur:0.18, max:3},
longs:   {ret:0.16, amp:0.20, sur:0.34, max:5},
queue:   {ret:0.22, amp:0.26, sur:0.42, max:6},
veste:   {ret:0.10, amp:0.10, sur:0.22, max:3},
manteau: {ret:0.18, amp:0.16, sur:0.30, max:5},
jupe:    {ret:0.14, amp:0.15, sur:0.26, max:4},
echarpe: {ret:0.24, amp:0.28, sur:0.46, max:6},
sac:     {ret:0.12, amp:0.09, sur:0.20, max:3}};
/* la masse de la coupe décide de son inertie */
const INER_CH=(cf.lg>=22||cf.sp==='queue'||cf.sp==='tresse')?INERTIE.queue
:((cf.lg>=9||cf.fr==='afro')?INERTIE.longs:INERTIE.courts);
/* r : la distance à la racine. Plus on est loin, plus on traîne et plus on
   dépasse — une pointe de cheveu bouge bien plus que sa racine. */
const balDe=(r,I)=>{
const d=Math.max(0,r);
const phase=phH-I.ret*(bouge?1:0.5)*(1+d*0.05);     /* le retard croît avec la distance */
const porte=Math.min(I.max,d*I.amp)*ampH;
const base=Math.sin(phase+d*0.16)*porte;
const sursaut=Math.sin(phase*2+d*0.22)*porte*I.sur; /* le dépassement en bout de course */
return Math.round(base+sursaut);};
const bal=(r)=>balDe(r,INER_CH);
const balVet=(r)=>balDe(r,hautT==='manteau'?INERTIE.manteau:INERTIE.veste);
const balJupe=(r)=>balDe(r,INERTIE.jupe);
const balSac=(r)=>balDe(r,INERTIE.sac);
const balEch=(r)=>balDe(r,INERTIE.echarpe);
const sautH=bouge?Math.round(Math.max(0,Math.sin(ph*2))*1):0;           /* le dessus rebondit à chaque pas */
const reflet=(cx,y0,w)=>{for(let x2=-Math.round(w/2);x2<Math.round(w/2);x2++){if((x2+20)%5===4)continue;
const yy=y0+Math.round(Math.pow(x2/(w/2),2)*2);R(cx+x2,yy,1,1,Math.abs(x2)<w/4?H5.cc:H5.c);}
R(cx-Math.round(w/4),y0+1,Math.round(w/3),1,H5.c);};
const pointes=(x0,w,y2,n)=>{for(let k=0;k<n;k++){const xx=x0+Math.round(k*w/n);R(xx,y2,Math.max(1,Math.round(w/n)-1),2+(k%2),H5.o);}};
const cheveuxDerriere=()=>{
if(coiffe==='crâne')return;
const hy=yTete;
if(cote){
if(cf.lg){const L=cf.lg;
for(let r=0;r<L+12;r++){const w=Math.max(3,8-Math.round(r/(L+12)*4)), ond=(cf.ond?Math.round(Math.sin(r*0.5)*cf.ond):0)+bal(r)-(bouge?Math.round(r*0.06):0);
R(-13+ond-(r>L?1:0),hy+8+r,w,1,r>L+8?H5.o:(r<3?H5.c:H5.b));R(-13+ond,hy+8+r,1,1,H5.oo);}
meches(-13,-6,hy+8,hy+8+L+10,2);}
if(coiffe==='dreads')for(let k=0;k<4;k++)for(let r=0;r<24;r++)R(-14+k*2,hy+8+r,2,1,(r+k)%4===0?H5.oo:(k%2?H5.o:H5.b));
return;
}
if(dos)return;
if(cf.lg){const L=cf.lg;
for(let r=0;r<L+6;r++){const ond=(cf.ond?Math.round(Math.sin(r*0.55)*cf.ond):0)+bal(r), hw=14+Math.min(3,Math.round(r*0.12));
R(-hw-ond,hy+8+r,5,1,r>L+2?H5.o:H5.b);R(hw-5+ond,hy+8+r,5,1,r>L+2?H5.o:H5.b);
R(-hw-ond,hy+8+r,1,1,H5.oo);R(hw-1+ond,hy+8+r,1,1,H5.oo);}
pointes(-17,5,hy+8+L+5,2);pointes(12,5,hy+8+L+5,2);}
if(coiffe==='dreads')for(let k=0;k<3;k++)for(let r=0;r<22;r++){R(-16+k*2,hy+8+r,2,1,(r+k)%4===0?H5.oo:H5.b);R(11+k*2,hy+8+r,2,1,(r+k)%4===0?H5.oo:H5.b);}
};
const finitionsSalon=()=>{const X=cf.x;if(!X)return;const hy=yTete, dx=(!cote&&diag)?vis*2:0;
if(X==='pics'){for(let k=-3;k<=3;k++){const x=(cote?k*3:k*4)+dx, h=5+(k%2?2:4);for(let r=0;r<h;r++)R(x-Math.round((h-r)/3),hy-4-r,Math.max(1,3-Math.floor(r/2)),1,r>h-2?H5.cc:(r>h/2?H5.c:H5.b));}}
if(X==='crete'){for(let r=0;r<16;r++){const w=Math.max(2,6-Math.floor(r/4));R(dx-w/2+(cote?1:0),hy-2-r,w,1,r>12?H5.o:(r>8?H5.b:H5.c));}R(dx-1,hy-18,2,2,H5.o);}
if(X==='banane'){for(let r=0;r<8;r++){const w=16-r;R((cote?4:0)+dx-w/2+r*0.6,hy-4-r,w,1,r>5?H5.c:H5.b);}R((cote?4:0)+dx-3,hy-11,6,1,H5.cc);}
if(X==='samourai'){R(dx-2,hy-16,4,6,H5.b);R(dx-3,hy-10,6,2,'#c8281e');}                                 /* le chignon noué d'un ruban rouge */
if(X==='perles'&&!dos){for(let k=0;k<4;k++){R(-16+k*2,hy+18+k*3,2,2,'#e8c060');R(11+k*2,hy+20+k*3,2,2,'#e8c060');}}
if(X==='comete'){for(let k=0;k<9;k++){const x=((k*7)%24)-12+dx, y=hy-2+((k*5)%14);R(x,y,1,1,'#ffffff');}R(dx-9,hy-1,3,1,'#ffffff');}   /* la comète : des paillettes d'argent */
};
const cheveuxDessus=()=>{
const hy=yTete;
if(coiffe==='crâne'){calotteCrane();return;}
if(cote){
const vol=cf.vol, top=hy-vol;
const basNuque=cf.fr==='rase'||cf.fr==='degrade'?hy+17:hy+20;
if(cf.fr==='crane'||cf.fr==='crete'||cf.fr==='rase'||cf.fr==='degrade'){
calotte(-1,top,hy+8,13+(cf.fr==='afro'?5:0),6+vol,cf.fr==='afro'?false:'profil',hy);
for(let r=hy+8;r<basNuque;r++){
const bord=craneC(r,hy).g-1;
const w=r<basNuque-4?(10-Math.max(0,r-(hy+15))):Math.max(3,10-(r-(basNuque-4))*2);
R(bord,r,w,1,r>basNuque-3?H5.o:H5.b);R(bord,r,1,1,H5.oo);}
}else{
/* ===== DE PROFIL, MÈCHE PAR MÈCHE =====
   Elles partent du sommet et filent vers l'arrière : c'est ce qui donne la
   coiffure couchée par le mouvement, au lieu d'un casque posé. */
for(let rr=top;rr<hy+7;rr++){
const c=craneC(rr<hy?hy:rr,hy);
const k=hy-rr;
let g0=c.g-1, g1=c.d+1;
if(k>0){                                     /* au-dessus : la calotte s'arrondit */
if(k>vol)continue;
const t2=k/(vol+0.6), r2=Math.sqrt(Math.max(0,1-t2*t2));
const cx2=(c.g+c.d)/2;
g0=Math.round(cx2+(g0-cx2)*r2);g1=Math.round(cx2+(g1-cx2)*r2);}
if(g1<=g0)continue;R(g0,rr,g1-g0,1,H5.oo);}
const longC=cf.lg?Math.min(cf.lg+10,34):12;
for(let i=0;i<8;i++){
const x0=-10+i*2.6, dep=top+Math.round(Math.abs((x0+2)/9)*vol*0.8);
/* les mèches de l'avant s'arrêtent au front ; seules celles de l'arrière
   descendent sur la nuque */
const lo=Math.max(3,Math.round(longC*(x0<0?1:(x0<4?0.4:0.22))*(0.82+alea(i*5.3)*0.3)));
const la=2+(i%3===1?1:0);
const pente=-0.26+i*0.03;                 /* toutes couchées vers l'arrière */
for(let t=0;t<lo;t++){
const w=Math.max(1,Math.round(la*(1-t/lo*0.5)));
const xx=Math.round(x0+pente*t+(cf.ond?Math.sin(t*0.8+i)*cf.ond:0))+(t>3?bal(t):0);
const yy=dep+t;
/* la mèche reste dans la silhouette tant qu'on est au niveau du crâne */
/* UNE MÈCHE DE DEVANT S'ARRÊTE AU FRONT. Seules celles qui partent de
   l'arrière du crâne descendent sur la nuque : sans cette règle, une masse
   de cheveux pend devant le menton et la poitrine. */
if(x0>-2&&yy>hy+7)continue;
if(yy<hy+7){const cc=craneC(yy<hy?hy:yy,hy), kk=hy-yy;
let b0=cc.g-1, b1=cc.d+1;
if(kk>0){if(kk>vol)continue;
const t3=kk/(vol+0.6), r3=Math.sqrt(Math.max(0,1-t3*t3)), cx3=(cc.g+cc.d)/2;
b0=Math.round(cx3+(b0-cx3)*r3);b1=Math.round(cx3+(b1-cx3)*r3);}
if(xx<b0||xx+w>b1)continue;}
/* JAMAIS SUR LE VISAGE : sous le front, tout ce qui dépasse vers l'avant
   est coupé. L'ancienne condition laissait passer les mèches qui piquaient
   par-dessus le nez. */
if(yy>hy+5&&yy<hy+23&&xx+w>craneC(yy,hy).d-4)continue;
/* de profil, la lumière vient de l'avant-haut : l'occiput est le plus sombre */
const k=t/lo;
const lat=(-xx+4)/16;
let lum=(1-k)*0.72+(0.55-lat)*0.6;
if(((xx+yy)&1)===0)lum+=0.06;
let col=lum>1.0?H5.cc:(lum>0.78?H5.c:(lum>0.48?H5.b:(lum>0.26?H5.o:H5.oo)));
R(xx,yy,w,1,col);
if(t>1&&t<lo-1)R(xx+w,yy,1,1,H5.oo);
if(t===lo-1&&CAR.pointe>0.4)R(xx,yy,Math.max(1,w-1),1,H5.c);}}
/* le lustre, de profil : au-dessus de l'oreille, là où le crâne tourne */
if(CAR.lustre>0.35)for(let x5=-6;x5<5;x5++){
if(((x5+40)%3)===0)continue;
const yy5=top+1+Math.round(Math.pow(Math.abs(x5+1)/7,2)*2);
R(x5,yy5,1,1,CAR.lustre>0.95?H5.cc:H5.c);}
/* la racine sur le front, et la patte devant l'oreille */
for(let r=hy+4;r<hy+7;r++)R(craneC(r,hy).d-3,r,3,1,T(peau,-13));}
if(cf.fr==='degrade')R(-12,hy+15,6,5,T(peau,-12));
meches(-12,10,top,hy+8,3);
reflet(-1,top+1,10);
if(cf.fr==='frange'||cf.fr==='boucle')R(5,hy+4,6,4,H5.b);
else if(cf.fr==='meche'){R(6,hy+3,5,3,H5.b);R(9,hy+5,2,2,H5.o);}
else if(cf.fr==='banane'){for(let r=0;r<7;r++)R(2+Math.round(r*0.4),hy-6+r,9,1,r<2?H5.c:H5.b);R(10,hy-3,2,3,H5.o);}
else if(cf.fr==='crete'){R(-12,hy,15,8,T(peau,-10));for(let k=0;k<6;k++){R(-9+k*3,top-5+(k%2),2,6,k%2?H5.b:H5.c);}}
else if(cf.fr==='rase'||cf.fr==='degrade'){for(let r=top;r<hy+8;r++)for(let x2=-12;x2<9;x2+=2)if((r+x2)%3===0)R(x2,r,1,1,H5.o);if(cf.fr==='degrade')R(-12,hy+9,5,5,T(peau,-14));}
else if(cf.fr==='hirsute'){for(let k=0;k<7;k++)R(-12+k*3,top-2-(k%3),2,3,H5.b);}
R(2,hy+8,2,5,H5.b);R(2,hy+8,1,5,H5.o);                                        /* la patte, devant l'oreille */
if(cf.sp==='queue'){R(-16,hy+6,4,3,'#c0392b');for(let r=0;r<16;r++)R(-17-Math.round(r*0.25)+bal(r*1.5)-(bouge?Math.round(r*0.12):0),hy+9+r,4,1,r>12?H5.o:(r<2?H5.c:H5.b));}
if(cf.sp==='chignon'||cf.sp==='chignonHaut'){const cy=cf.sp==='chignon'?hy+7:hy-2;calotte(-15,cy-4,cy+4,4,4);R(-16,cy-2,2,1,H5.cc);}
if(cf.sp==='tresse')for(let r=0;r<22;r+=3){R(-15,hy+10+r,4,2,H5.b);R(-14,hy+12+r,3,1,H5.o);}
if(cf.sp==='couettes'){for(let r=0;r<12;r++)R(-15,hy+8+r,4,1,H5.b);R(-15,hy+8,4,1,'#c0392b');}
if(cf.sp==='tresses')for(let r=0;r<16;r+=2)R(-14+(r%4?1:0),hy+10+r,3,2,r%4?H5.o:H5.b);
if(cf.fr==='afro')for(let k=0;k<30;k++){const a=k*0.9, rr=12+(k%3), ax=-1+Math.round(Math.cos(a)*rr), ay=hy+2+Math.round(Math.sin(a)*rr*0.8);if(ax>0&&ay>hy+3)continue;R(ax,ay,1,1,k%2?H5.c:H5.o);}
return;
}
if(dos){
const vol=cf.vol, top=hy-vol-sautH, L=cf.lg;
const W=cf.fr==='afro'?19:14;
if(cf.fr==='crane'||cf.fr==='crete'||cf.fr==='rase'||cf.fr==='degrade'||cf.fr==='afro'){
calotte(0,top,hy+21+Math.min(L,6),W,7+vol,cf.fr==='afro'?'rond':'dos',hy);
}else{
/* ===== DE DOS, MÈCHE PAR MÈCHE ===== */
/* LE BORD DE DOS : il suit le crâne, puis se resserre vers la nuque.
   Sans ce resserrement, la chevelure descend droite et le dos ressemble à
   une boîte posée sur les épaules. */
const bordDos=(rr)=>{
const k=hy-rr;
/* La chevelure ne dépasse pas le crâne : au-delà, elle devient plus large
   que les épaules (22 px) et le personnage porte un couvercle. */
let c=craneD(rr<hy?hy:rr,hy);
/* LE SOMMET : il se referme sur trois rangs, franchement. */
if(k>0){if(k>vol+1)return 0;
c=Math.round(c*Math.sqrt(Math.max(0,1-Math.pow(k/(vol+1.4),1.7))));}
/* ================= LE RÉTRÉCISSEMENT, ET SON EXCÈS =================
   La masse se rétrécissait de huit dixièmes d'unité PAR RANG sous le
   haut des oreilles, sans plancher utile : à seize unités sous le sommet
   elle ne faisait plus que quatre de demi-largeur, et trois en dessous —
   alors que le crâne, lui, en fait douze jusqu'à la nuque.

   Le résultat était un coin de cuir chevelu nu de chaque côté, qui
   s'élargissait vers le bas. C'EST LUI qu'on lisait comme une calvitie
   vue de dos, bien plus que l'endroit où la masse s'arrêtait.

   Le rétrécissement existe pour une bonne raison — les cheveux passent
   DERRIÈRE les oreilles, ils ne les recouvrent pas. Mais il suffit de
   deux unités pour ça, pas de neuf. */
const bas=rr-(hy+5);
if(bas>0)c=Math.max(6,c-Math.min(2,Math.round(bas*0.35)));
return c;};
/* ================= LA NUQUE =================
   La masse s'arrêtait à seize unités sous le sommet du crâne, qui en
   fait vingt-trois. Sept unités de peau nue en bas de l'occiput — trois
   pixels et demi sur une tête de vingt-deux, soit un sixième de la
   tête — et ça sur les vingt-deux coiffes. C'est ça qu'on lisait comme
   une calvitie vue de dos.

   Une coupe courte couvre l'arrière du crâne jusqu'à la nuque et
   s'arrête là ; ce qui est nu en dessous, c'est le cou, et c'est normal.
   Le dégradé et la coupe rasée, eux, montent vraiment plus haut — c'est
   leur définition. */
const basDos=hy+(L>6?20+Math.min(L,6):((cf.fr==='rase'||cf.fr==='degrade')?17:21));
for(let rr=top;rr<basDos;rr++){
const c=bordDos(rr);
if(c<=0)continue;
R(-c,rr,c*2,1,H5.oo);
R(-c,rr,1,1,H5.o);R(c-1,rr,1,1,H5.o);}   /* les bords, plus sombres : du relief */
/* LA LONGUEUR DE DOS : elle doit partir de la coupe, pas d'un socle de
   22 px. Avant, « courts » et « bol » recevaient la même masse qu'une
   chevelure longue : de dos, toutes les coupes se ressemblaient. */
/* ET LES MÈCHES suivent la masse : à treize unités elles s'arrêtaient
   bien au-dessus d'elle, et la masse sombre restait nue sur ses quatre
   dernières lignes — une plaque plate au bas du crâne. */
const longD=(L>6?20+L:(cf.fr==='rase'||cf.fr==='degrade'?10:18));
for(let i=0;i<11;i++){
const x0=-12+i*2.4, vers=(x0-RAIE)/12;
const dep=top+Math.round(Math.abs(vers)*vol*0.7);
const lo=Math.max(6,Math.round(longD*(vers<0?1.1:0.92)*(0.84+alea(i*7.1)*0.28)));
const la=2+(i%3===1?1:0);
for(let t=0;t<lo;t++){
const w=Math.max(1,Math.round(la*(1-t/lo*0.45)));
const xx=Math.round(x0+vers*0.2*t+(cf.ond?Math.sin(t*0.6+i)*cf.ond:0))+(t>4?bal(t):0);
const yy=dep+t;
/* le haut du crâne borne la mèche ; sous la nuque, elle est libre */
if(yy<hy+22){const bd=bordDos(yy);
if(bd<=0||xx<-bd||xx+w>bd)continue;}
/* la même règle de couleur que de face : deux axes, plus le tramage */
const k=t/lo;
const lat=xx/13;
let lum=(1-k)*0.74+(0.5-lat)*0.5;
if(((xx+yy)&1)===0)lum+=0.06;
let col=lum>1.0?H5.cc:(lum>0.78?H5.c:(lum>0.48?H5.b:(lum>0.26?H5.o:H5.oo)));
R(xx,yy,w,1,col);
if(t>1&&t<lo-1)R(xx+w,yy,1,1,H5.oo);
if(t===lo-1&&CAR.pointe>0.4)R(xx,yy,Math.max(1,w-1),1,H5.c);}}
/* le lustre, de dos : il court sur le haut du crâne */
if(CAR.lustre>0.35)for(let x4=-7;x4<8;x4++){
if(((x4+40)%3)===0)continue;
const yy4=top+1+Math.round(Math.pow(Math.abs(x4)/8,2)*2);
R(x4,yy4,1,1,CAR.lustre>0.95?H5.cc:H5.c);}}
/* LA LIGNE DE NUQUE : une ombre là où les cheveux s'arrêtent sur le cou.
   Sans elle, la chevelure et la peau se touchent sans transition. */
if(cf.fr!=='rase'&&cf.fr!=='crane'&&L<7)
for(let x2=-7;x2<7;x2++)R(x2,hy+21+Math.min(L,6),1,1,T(peau,-16));
if(L>6){for(let r=hy+24;r<hy+18+L;r++){const k=(r-hy-24)/Math.max(1,L-6),
w=Math.round(Math.min(W,craneD(r,hy)+2)-k*3),   /* la masse part de la largeur du crâne */
ond=(cf.ond?Math.round(Math.sin(r*0.5)*cf.ond):0)+bal(r-hy-18);
R(-w+ond,r,w*2,1,k>0.85?H5.o:H5.b);R(-w+ond,r,1,1,H5.oo);R(w-1+ond,r,1,1,H5.oo);}
pointes(-W+1,W*2-2,hy+17+L,6);}
meches(-W+1,W-1,top+2,hy+18+Math.max(0,L-2),3);
reflet(0,top+1,12);
if(cf.fr==='raie')R(0,top,1,7,H5.oo);
if(cf.fr==='rase'||cf.fr==='degrade'){for(let r=top;r<hy+18;r++)for(let x2=-13;x2<13;x2+=2)if((r+x2)%3===0)R(x2,r,1,1,H5.o);if(cf.fr==='degrade')R(-12,hy+13,24,5,T(peau,-12));}
if(cf.fr==='crete'){R(-13,top+2,26,16,peauO);R(-13,top+2,26,16,T(peau,-10));for(let r=top-6;r<hy+18;r++)R(-2,r,4,1,r%3?H5.b:H5.c);}
if(cf.sp==='queue'){R(-3,hy+10,6,3,'#c0392b');for(let r=0;r<18;r++){const w=4-Math.round(r/9);R(-w+bal(r*1.4),hy+13+r,w*2,1,r>14?H5.o:(r%4===0?H5.c:H5.b));}}
if(cf.sp==='chignon')calotte(0,hy+4,hy+13,6,5);
if(cf.sp==='chignonHaut')calotte(0,top-7,top+2,6,5);
if(cf.sp==='tresse'){R(-2,hy+17,4,2,'#c0392b');for(let r=0;r<24;r+=4){const b2=bal(r*1.2);R(-3+b2,hy+19+r,4,2,H5.b);R(-1+b2,hy+21+r,4,2,H5.o);R(-2+b2,hy+19+r,1,1,H5.c);}}
if(cf.sp==='couettes'){for(let k of [-1,1]){R(k*12-2,hy+8,4,2,'#c0392b');for(let r=0;r<14;r++)R(k*12-2+(k*Math.round(r*0.2))+bal(r*1.3)*k,hy+10+r,4,1,r>11?H5.o:H5.b);}}
if(cf.sp==='tresses')for(let k of [-1,1])for(let r=0;r<18;r+=3){R(k*8-2,hy+16+r,4,2,H5.b);R(k*8-1,hy+18+r,3,1,H5.o);}
if(coiffe==='dreads')for(let k=0;k<7;k++)for(let r=0;r<L;r++)R(-13+k*4+bal(r+k),hy+16+r,3,1,(r+k)%4===0?H5.oo:(k%2?H5.o:H5.b));
if(cf.fr==='afro')for(let k=0;k<40;k++){const a=k*0.7, rr=16+(k%3);R(Math.round(Math.cos(a)*rr),hy+6+Math.round(Math.sin(a)*rr*0.75),1,1,k%2?H5.c:H5.o);}
if(cf.fr==='hirsute')for(let k=0;k<8;k++)R(-13+k*4,top-2-(k%3),2,3,H5.b);
return;
}
/* ================= LES CHEVEUX SUIVENT LE CRÂNE =================
   DEUX DÉFAUTS, et c'est eux qui donnaient l'impression d'une calvitie.

   DE TROIS QUARTS, la chevelure glissait de DEUX unités quand le crâne,
   lui, n'en glissait qu'UNE — et elle gardait sa largeur de face alors
   que le crâne se rétrécit de sept pour cent. Résultat : une bande de
   cuir chevelu nu le long de la tempe, du côté que la chevelure venait
   de quitter. Elle épouse maintenant exactement le crâne : même
   décalage, même rétrécissement.

   DE DOS, la règle « jamais sur le visage » coupait toute mèche qui
   descendait sous le front. Vue de derrière il n'y a pas de visage : la
   règle rasait donc tout le bas de l'occiput, et la nuque restait nue
   sur un bon tiers de la tête. On ne coupe plus que si l'on voit
   vraiment la face. */
/* ET LA RACINE SUIT LE VISAGE, PAS LE CRÂNE. De trois quarts le visage
   glisse de trois unités quand le crâne n'en glisse qu'une : une
   chevelure calée sur le seul crâne recule donc de deux par rapport aux
   yeux, et c'est exactement la silhouette d'un front qui se dégarnit.

   Le décalage varie donc avec la hauteur — celui du crâne au sommet,
   celui du visage à la ligne des sourcils. C'est ce que fait une
   chevelure : elle enveloppe le volume en haut et épouse la face en
   bas. */
const vol=cf.vol, top=hy-vol-sautH;
const dxH=(yy)=>dT+Math.round((f3-dT)*Math.max(0,Math.min(1,(yy-(hy-4))/12)));
const dx=dT;
const RETR=diag?0.93:1;                        /* le crâne rétréci de trois quarts */
const cF=(yy)=>Math.round(craneF(yy<hy?hy:yy,hy)*RETR);
const basMasse=hy+5;                           /* sous le front, c'est le visage */
const HW=cf.fr==='afro'?19:13;
/* LA MASSE DE FOND : seulement ce qui couvre le crâne, dans le ton le plus
   sombre. Les mèches claires se posent dessus et débordent. */
if(cf.fr!=='crane')for(let rr=top;rr<basMasse;rr++){
const c=bordCheveux(rr,hy,cF(rr),vol);
if(c<=0)continue;
R(-c+dxH(rr),rr,c*2,1,H5.oo);}
/* LES MÈCHES */
if(cf.fr!=='crane'&&cf.fr!=='crete'&&cf.fr!=='rase'){
for(const M of mechesDe()){
const y0=top+M.y;
for(let t=0;t<M.lo;t++){
const w=Math.max(1,Math.round(M.la*(1-t/M.lo*0.55)));
const yy=y0+t;
const dxM=dxH(yy);
const xx=Math.round(M.x+M.p*t+(M.ond?Math.sin(t*0.9+M.x)*M.ond:0))+dxM
+(t>3?bal(t):0);                               /* la brise prend les pointes */
/* LE BORD : une mèche ne sort jamais de la silhouette, ni sur les côtés
   ni par le haut. */
if(yy<top)continue;
const bord=bordCheveux(yy,hy,cF(yy),vol);
if(bord<=0)continue;
if(xx-dxM<-bord||xx-dxM+w>bord)continue;
/* JAMAIS SUR LE VISAGE. Cette branche ne sert qu'aux vues de face et de
   trois quarts : celle de dos a la sienne, plus haut, et sort avant. */
if(yy>hy+5&&Math.abs(xx-dxM)<cF(yy)-1)continue;
/* LA COULEUR : la hauteur dans la mèche ET l'écart au centre du crâne.
   La lumière vient du haut-gauche, donc le côté droit s'assombrit. */
const k=t/M.lo;
const lat=(xx-dxM)/13;
let lum=(1-k)*0.78+(0.5-lat)*0.55;
/* le tramage sur la frontière entre deux tons : un damier d'un pixel,
   qui supprime la marche d'escalier sans ajouter de couleur */
if(((xx+yy)&1)===0)lum+=0.06;
let col=lum>1.02?H5.cc:(lum>0.80?H5.c:(lum>0.50?H5.b:(lum>0.28?H5.o:H5.oo)));
R(xx,yy,w,1,col);
if(t>1&&t<M.lo-1)R(xx+w,yy,1,1,H5.oo);                /* le creux entre deux mèches */
/* LA POINTE : le dernier pixel s'éclaircit, comme un cheveu qui attrape
   la lumière au bout. */
if(t===M.lo-1&&CAR.pointe>0.4)R(xx,yy,Math.max(1,w-1),1,H5.c);}}
/* LE LUSTRE : un bandeau de lumière qui épouse la rondeur du crâne et
   s'interrompt entre les mèches. C'est lui qui fait la différence entre
   des cheveux et une perruque de feutre. */
if(CAR.lustre>0.35){
const yL=top+1+Math.round(vol*0.2);
for(let x3=-9;x3<6;x3++){
if(((x3+40)%3)===0)continue;                   /* il n'est jamais continu */
const courbe=Math.round(Math.pow(Math.abs(x3+2)/8,2)*2.2);
const yy3=yL+courbe;
if(Math.abs(x3)>cF(yy3))continue;
R(x3+dx,yy3,1,1,CAR.lustre>0.95?H5.cc:H5.c);
if(CAR.lustre>1.1&&((x3+40)%5)===0)R(x3+dx,yy3+1,1,1,H5.c);}}
/* LA LIGNE DE RACINE : les golfes aux tempes, jamais droite */
const GOLFE=[0,0,1,2,2,1,0,0,0,1,2,2,1,0];
for(let x2=0;x2<14;x2++){
const gx=-11+x2+(x2>6?8:0);
if(Math.abs(gx)>11)continue;
R(gx+dx,hy+4+GOLFE[x2],1,1,T(peau,-16));}
}else if(cf.fr!=='crane'){
calotte(dx,top,hy+6,HW,6+vol,'face',hy);}
if(diag&&coiffe!=='crâne'){
const court2=cf.fr==='rase'||cf.fr==='degrade', bas2=court2?hy+15:hy+19;
for(let r=hy+3;r<bas2;r++){const w=r<hy+9?7:(r<bas2-3?4:3);
const x0=vis>0?-14:14-w;R(x0,r,w,1,r>bas2-3?H5.o:H5.b);R(vis>0?x0:x0+w-1,r,1,1,H5.oo);}
meches(vis>0?-14:7,vis>0?-7:14,hy+3,bas2-1,2);
if(court2)for(let r=hy+10;r<bas2;r++)R(vis>0?-14:11,r,3,1,T(peau,-12));
oreille(vis>0?-12:12,hy,vis>0?-1:1,false);                     /* l'oreille, par-dessus les cheveux */
if(boucle!=='aucune')R(vis>0?-14:12,hy+16,2,2,boucle==='perle'?'#f2efe4':(boucle==='plume'?'#c0392b':'#e8c06a'));
}
meches(-HW+dx,HW+dx,top+1,hy+5,3);
reflet(dx-3,top+1,9);
const patte=cf.lg?Math.min(cf.lg+2,18):7;
if(cf.fr!=='rase'&&cf.fr!=='crete'&&cf.fr!=='crane'){
/* LES PATTES suivent le bord du crâne rang par rang : elles ne flottent
   plus dans le vide quand la mâchoire se resserre. */
if(!diag||vis<0){for(let r=0;r<patte;r++){const c=craneF(hy+5+r,hy);
R(-c-1+(r>patte-3?1:0),hy+5+r,3,1,r>patte-3?H5.o:H5.b);
R(-c-1,hy+5+r,1,1,H5.oo);}}
if(!diag||vis>0){for(let r=0;r<patte;r++){const c=craneF(hy+5+r,hy);
R(c-2-(r>patte-3?1:0),hy+5+r,3,1,r>patte-3?H5.o:H5.b);
R(c,hy+5+r,1,1,H5.oo);}}
}
const f=cf.fr;
if(f==='frange'||f==='boucle'){for(let x2=-11;x2<11;x2++){const h=4+((x2+13)%3===0?1:0);R(x2+dx,hy+4,1,h,x2%3?H5.b:H5.o);}R(-11+dx,hy+4,22,1,H5.c);}
else if(f==='meche'){for(let r=0;r<5;r++)R(-10+r+dx,hy+4+r,9-r,1,H5.b);R(3+dx,hy+4,7,2,H5.b);R(-10+dx,hy+4,5,1,H5.c);}
else if(f==='raie'){R(-1+dx,top,2,7,H5.oo);for(let r=0;r<4;r++){R(-11+dx,hy+4+r,9-r*2,1,H5.b);R(2+r*2+dx,hy+4+r,9-r*2,1,H5.b);}}
else if(f==='tire'){R(-11+dx,hy+4,22,1,H5.o);for(let x2=-9;x2<10;x2+=3)R(x2+dx,top+2,1,5,H5.c);}
else if(f==='banane'){for(let r=0;r<8;r++){const w=18-Math.abs(r-3)*2;R(-Math.round(w/2)+2+dx,hy-8+r,w,1,r<2?H5.cc:(r<4?H5.c:H5.b));}R(-4+dx,hy+2,12,2,H5.o);}
else if(f==='crete'){R(-12,top+2,24,6,T(peau,-10));for(let r=top-7;r<hy+5;r++){const w=r<top-3?2:4;R(-Math.round(w/2)+dx,r,w,1,r%3?H5.b:H5.c);}}
else if(f==='rase'||f==='degrade'){for(let r=top;r<hy+6;r++)for(let x2=-12;x2<12;x2+=2)if((r+x2)%3===0)R(x2+dx,r,1,1,H5.o);
if(f==='degrade'){R(-13,hy+3,3,5,T(peau,-12));R(10,hy+3,3,5,T(peau,-12));}R(-11+dx,hy+5,22,1,H5.o);}
else if(f==='afro'){for(let k=0;k<44;k++){const a=k*0.62, rr=17+(k%3), ax=Math.round(Math.cos(a)*rr)+dx, ay=hy+3+Math.round(Math.sin(a)*rr*0.7);
if(Math.abs(ax-dx)<12&&ay>hy+3)continue;                                    /* jamais sur le visage */
R(ax,ay,1,1,k%2?H5.c:H5.o);}
R(-19,hy+4,6,12,H5.b);R(13,hy+4,6,12,H5.b);R(-11+dx,hy+4,22,2,H5.b);}
else if(f==='dreads'){for(let k=0;k<6;k++)for(let r=0;r<6;r++)R(-11+k*4+dx,hy+3+r,3,1,(r+k)%3===0?H5.oo:H5.b);}
else if(f==='hirsute'){for(let k=0;k<9;k++){R(-13+k*3+dx,top-2-(k%3),2,4,H5.b);R(-13+k*3+dx,hy+4,2,3+(k%2),H5.o);}}
if(cf.sp==='couettes'){for(const k of [-1,1]){R(k*15-2,hy+7,4,2,'#c0392b');for(let r=0;r<14;r++)R(k*15-2+k*Math.round(r*0.2)+bal(r*1.3)*k,hy+9+r,4,1,r>11?H5.o:(r<2?H5.c:H5.b));}}
if(cf.sp==='tresses'){for(const k of [-1,1])for(let r=0;r<16;r+=3){R(k*13-2,hy+12+r,4,2,H5.b);R(k*13-1,hy+14+r,3,1,H5.o);}}
if(cf.sp==='chignonHaut')calotte(dx,top-7,top+2,6,5);
if(cf.sp==='chignon'){R(-14,hy+8,3,4,H5.b);R(11,hy+8,3,4,H5.b);}
};
function calotteCrane(){
const hy=yTete;
if(cote){R(-8,hy,12,1,peauC);R(-6,hy+1,6,1,T(peau,30));return;}
R(-6+(diag?vis*2:0),hy+1,10,1,T(peau,30));R(-4+(diag?vis*2:0),hy+2,5,1,peauC);
}
const barbeDe=()=>{
if(barbe==='aucune'||dos)return;
const hy=yTete, bB=chev, bO=T(chev,-26), bOO=T(chev,-46), bC=T(chev,24);
const piquant=melangeF(peau,chev,0.42);
const poil=(x,r,prob)=>{const k=((x*7+r*13)%11+11)%11;return k<prob;};
if(cote){
const joue=(r0,r1,x0,x1)=>{for(let r=r0;r<r1;r++)for(let x=x0;x<x1;x++){
if(x>=6&&r>=hy+17&&r<=hy+19&&barbe!=='naissante')continue;                     /* on laisse la bouche */
R(x,r,1,1,poil(x,r,3)?bO:(poil(x,r,5)?bC:bB));}};
if(barbe==='naissante'){for(let r=hy+14;r<hy+23;r++)for(let x=1;x<10;x++)if((x+r)%2===0)R(x,r,1,1,piquant);return;}
if(barbe==='moustache'||barbe==='impériale'||barbe==='bouc'){R(6,hy+16,5,1,bB);R(9,hy+17,2,1,bO);R(7,hy+16,2,1,bC);}
if(barbe==='bouc'){for(let r=hy+19;r<hy+25;r++)R(7,r,4-(r>hy+23?1:0),1,r%2?bB:bO);}
if(barbe==='impériale'){R(8,hy+20,2,4,bB);R(8,hy+23,1,1,bO);}
if(barbe==='favoris'){for(let r=hy+8;r<hy+18;r++)R(2,r,3,1,r%3?bB:bO);}
if(barbe==='collier'){for(let r=hy+12;r<hy+24;r++){const x=2+Math.round((r-hy-12)*0.6);R(x,r,2,1,r%2?bB:bO);}R(6,hy+23,5,1,bB);}
if(barbe==='fine'){for(let r=hy+14;r<hy+23;r++)R(2+Math.round((r-hy-14)*0.7),r,1,1,bO);R(7,hy+22,4,1,bO);}
if(barbe==='courte'||barbe==='pleine'||barbe==='longue'||barbe==='fourchue'){
joue(hy+(barbe==='courte'?15:13),hy+(barbe==='courte'?22:24),2,11);R(6,hy+16,5,1,bB);R(7,hy+16,2,1,bC);
R(6,hy+18,4,1,fente);R(9,hy+19,1,1,levreC);
/* LA BARBE LONGUE, DE PROFIL. Elle partait droit vers le bas depuis le
   menton et finissait détachée, en masse flottante devant la poitrine.
   Elle suit maintenant la ligne du menton vers le cou : elle rentre en
   s'affinant au lieu de pendre dans le vide. */
if(barbe==='longue'||barbe==='fourchue'){
for(let r=hy+25;r<hy+33;r++){
const k=(r-hy-25)/8;
const w=Math.max(1,Math.round(7-k*5));          /* elle s'affine vite */
const x0=3+Math.round(k*2.2);                   /* et rentre vers le cou */
R(x0,r,w,1,poil(x0,r,4)?bO:bB);
R(x0,r,1,1,bOO);}                               /* le bord, dans l'ombre */
if(barbe==='fourchue')R(5,hy+30,1,2,peau);}
}
return;
}
const dx=diag?vis*2:0;
const largeur=(r)=>{const k=r-hy;return k<20?12:(k===20?11:(k===21?10:(k===22?9:8)));};   /* la mâchoire */
const bouche0=(x,r)=>Math.abs(x-dx)<=3&&r>=hy+17&&r<=hy+19;
const zone=(r0,r1,bords)=>{for(let r=r0;r<r1;r++){const hw=largeur(r);
for(let x=-hw;x<hw;x++){if(bouche0(x,r))continue;if(bords&&r<hy+16&&Math.abs(x)<hw-bords)continue;
R(x+dx,r,1,1,poil(x,r,3)?bO:(poil(x,r,5)?bC:bB));}
R(-hw+dx,r,1,1,bOO);R(hw-1+dx,r,1,1,bOO);}};
const moustache=(tombe)=>{R(-4+dx,hy+16,8,1,bB);R(-5+dx,hy+17,2,1,bB);R(3+dx,hy+17,2,1,bB);
R(-2+dx,hy+16,2,1,bC);R(-4+dx,hy+17,8,1,bOO);
if(tombe){R(-5+dx,hy+18,1,2,bO);R(4+dx,hy+18,1,2,bO);}};
if(barbe==='naissante'){for(let r=hy+14;r<hy+24;r++){const hw=largeur(r);for(let x=-hw+1;x<hw-1;x++){if(bouche0(x,r))continue;
if(r<hy+16&&Math.abs(x)<hw-3)continue;if((x+r)%2===0)R(x+dx,r,1,1,piquant);}}
R(-3+dx,hy+16,6,1,piquant);return;}
if(barbe==='moustache'){moustache(true);return;}
if(barbe==='bouc'){moustache(false);for(let r=hy+19;r<hy+25;r++){const w=r>hy+23?2:4;R(-Math.round(w/2)+dx,r,w,1,poil(0,r,4)?bO:bB);}return;}
if(barbe==='impériale'){R(-4+dx,hy+16,8,1,bO);R(-1+dx,hy+20,2,4,bB);R(dx,hy+23,1,2,bO);return;}
if(barbe==='favoris'){for(let r=hy+8;r<hy+18;r++){const w=r<hy+15?3:2;R(-12+dx,r,w,1,r%3?bB:bO);R(12-w+dx,r,w,1,r%3?bB:bO);}return;}
if(barbe==='collier'){for(let r=hy+13;r<hy+24;r++){const hw=largeur(r);R(-hw+dx,r,2,1,r%2?bB:bO);R(hw-2+dx,r,2,1,r%2?bB:bO);}
R(-7+dx,hy+23,14,1,bB);R(-5+dx,hy+22,10,1,bO);return;}
if(barbe==='fine'){for(let r=hy+15;r<hy+24;r++){const hw=largeur(r);R(-hw+dx,r,1,1,bO);R(hw-1+dx,r,1,1,bO);}R(-6+dx,hy+23,12,1,bO);R(-1+dx,hy+20,2,2,bO);return;}
const haut=barbe==='courte'?hy+15:hy+13;
zone(haut,hy+24,barbe==='courte'?4:3);
moustache(barbe!=='courte');
R(-3+dx,hy+18,6,1,fente);R(-2+dx,hy+19,4,1,levreC);                               /* la bouche reste visible */
if(barbe==='pleine'||barbe==='longue'||barbe==='fourchue'){for(let r=hy+24;r<hy+26;r++){const hw=8-(r-hy-24)*2;R(-hw+dx,r,hw*2,1,poil(r,r,4)?bO:bB);}}
if(barbe==='longue'||barbe==='fourchue'){
for(let r=hy+26;r<hy+36;r++){const k=(r-hy-26)/10, hw=Math.max(2,Math.round(7-k*5));
R(-hw+dx,r,hw*2,1,k>0.8?bO:(poil(r,r*3,4)?bO:bB));R(-hw+dx,r,1,1,bOO);R(hw-1+dx,r,1,1,bOO);
for(let x=-hw+2;x<hw-1;x+=3)R(x+dx,r,1,1,bO);}
if(barbe==='fourchue'){R(-1+dx,hy+31,2,5,vest);R(-1+dx,hy+30,2,1,bOO);}
}
};
const chapeauDe=()=>{
if(chapeau==='aucun')return;
const hy=yTete, dx=(!cote&&diag)?vis*2:0;
const dome=(cx,y0,y1,hw,ry,base,clair,fonce,contour)=>{
for(let r=y0;r<y1;r++){const d=Math.max(0,(y0+ry)-r), w=Math.round(hw*Math.sqrt(Math.max(0,1-(d/ry)*(d/ry))));if(w<=0)continue;
R(cx-w,r,w*2,1,base);R(cx-w,r,Math.max(1,Math.round(w*0.35)),1,fonce);R(cx+w-Math.max(1,Math.round(w*0.3)),r,Math.max(1,Math.round(w*0.3)),1,clair);
R(cx-w,r,1,1,contour);R(cx+w-1,r,1,1,contour);}};
const ombreFront=(x0,w,y)=>R(x0,y,w,1,T(peau,-26));
if(chapeau==='casquette'){
const c='#c0392b', cC='#e05a4a', cO='#8a2420', cOO='#5a1812', vis2='#7a1e18';
if(cote){
dome(-1,hy-3,hy+5,13,7,c,cC,cO,cOO);
R(-1,hy-3,1,8,cO);R(5,hy-2,1,7,cO);                                        /* les coutures des pans */
R(8,hy+3,9,2,vis2);R(8,hy+3,9,1,T(vis2,20));R(8,hy+5,8,1,cOO);             /* la visière qui avance */
R(-1,hy-4,2,1,cC);ombreFront(3,8,hy+5);
}else if(dos){
dome(0,hy-3,hy+6,13,7,c,cC,cO,cOO);R(0,hy-3,1,9,cO);R(-6,hy-2,1,8,cO);R(5,hy-2,1,8,cO);
R(-4,hy+3,8,3,H5.b);R(-3,hy+4,6,1,H5.o);R(-5,hy+2,10,1,cOO);R(-1,hy+3,2,1,'#c9c9c4');   /* l'ouverture, la boucle */
R(-1,hy-4,2,1,cC);
}else{
dome(dx,hy-3,hy+5,13,7,c,cC,cO,cOO);
R(dx,hy-3,1,8,cO);R(dx-6,hy-1,1,6,cO);R(dx+6,hy-1,1,6,cO);R(dx-1,hy-4,2,1,cC);   /* coutures, bouton */
R(dx-6+(diag?vis*2:0),hy+1,12,3,'#f2efe4');R(dx-5+(diag?vis*2:0),hy+2,10,1,cO);   /* l'écusson */
for(let x=-10;x<10;x++){const y=hy+5+(Math.abs(x)>7?0:1);R(x+dx+(diag?vis*3:0),y,1,2,vis2);}   /* la visière, courbée */
R(-9+dx+(diag?vis*3:0),hy+5,18,1,T(vis2,24));ombreFront(-9+dx,18,hy+7);
}
}
else if(chapeau==='bandana'){
const c='#2d6fb0', cC='#4a8ad0', cO='#1f4f80', motif='#f2efe4';
const band=(x0,w,y0,h)=>{R(x0,y0,w,h,c);R(x0,y0,w,1,cC);R(x0,y0+h-1,w,1,cO);
for(let x=x0+1;x<x0+w-1;x+=3)for(let y=y0+1;y<y0+h-1;y+=2)if((x+y)%2===0)R(x,y,1,1,motif);};
if(cote){band(-12,22,hy-1,6);
const b1=bouge?Math.round(Math.sin(ph)*1.5):0;                          /* le nœud et ses pans, qui flottent */
R(-14,hy+1,3,3,cO);for(let r=0;r<8;r++){R(-15-Math.round(r*0.3)+b1,hy+3+r,2,1,r>5?cO:c);R(-13-Math.round(r*0.2)-b1,hy+3+r,2,1,cO);}
}else if(dos){band(-12,24,hy-1,7);
const b1=bouge?Math.round(Math.sin(ph)*1.5):0;
R(-2,hy+2,4,3,cO);for(let r=0;r<9;r++){R(-3-Math.round(r*0.3)+b1,hy+5+r,2,1,r>6?cO:c);R(1+Math.round(r*0.3)-b1,hy+5+r,2,1,r>6?cO:c);}
}else{band(-12+dx,24,hy-1,6);R(-12+dx,hy+4,24,1,T(peau,-24));}
}
else if(chapeau==='bonnet'){
if(p._bandeau){const cx0=cote?-1:dx;                                 /* LE BANDEAU ET LE TRICORNE DU PIRATE */
R(cx0-9,hy-11,18,4,'#1b1b22');R(cx0-11,hy-8,22,2.5,'#1b1b22');R(cx0-9,hy-11,18,1,'#33333d');
R(cx0-3,hy-14,6,3,'#1b1b22');R(cx0-1.5,hy-13.5,3,2,'#e8e0d0');
if(!dos){R(cx0-5,hy-2,4,3,'#1b1b22');R(cx0-5,hy-3,4,1,'#33333d');   /* le cache-œil */
R(cx0-9,hy-2.5,4,1,'#1b1b22');R(cx0+2,hy-2,2,2,'#1a1a1e');
R(cx0-3,hy+3,6,1,'#9a5a4a');}
return;}
if(p._chapeauVert){const cx0=cote?-1:dx;                             /* LE CHAPEAU DU GARDE FORESTIER */
for(let x=cx0-12;x<cx0+12;x+=1)R(x,hy-7+Math.abs(x-cx0)*0.1,1,2.4,alea(x)<0.5?'#3a5a3a':'#2e4a30');
for(let x=cx0-6;x<cx0+6;x+=1)R(x,hy-13,1,6,alea(x*3)<0.5?'#44663e':'#35563a');
R(cx0-6,hy-9,12,1.6,'#5a4428');                        /* le ruban de cuir */
R(cx0+4,hy-17,1.4,5,'#3a6ab4');R(cx0+4.6,hy-18,1.4,2.4,'#6a9ae4');   /* la plume de geai */
if(!dos){R(cx0-4,hy-2,2,2,'#1a1a1e');R(cx0+2,hy-2,2,2,'#1a1a1e');
R(cx0-3,hy+3,6,1,'#5a3a24');}
return;}   /* comme les autres chapeaux de la chaîne : on s'arrête ici */
if(p._paille){const cx0=cote?-1:dx;                                  /* LE CHAPEAU DE PAILLE DE L'ÉPOUVANTAIL */
/* LA PAILLE QUI DÉPASSE DU COL : trois brins sous le bord du chapeau */
for(let k=0;k<3;k++){const a=2.1+k*0.5;
  for(let t=0;t<4;t++)R(cx0-5+Math.cos(a)*t,hy+5+Math.sin(a)*t,1.4,1.4,k%2?'#d4b05a':'#e8c87a');}
for(let k=0;k<3;k++){const a=1.0-k*0.5;
  for(let t=0;t<4;t++)R(cx0+5+Math.cos(a)*t,hy+5+Math.sin(a)*t,1.4,1.4,k%2?'#d4b05a':'#e8c87a');}
for(let x=cx0-13;x<cx0+13;x+=1)R(x,hy-7+Math.abs(x-cx0)*0.12,1,2.5,alea(x)<0.5?'#e0c060':'#c9a24a');
for(let x=cx0-7;x<cx0+7;x+=1)R(x,hy-13,1,6,alea(x*3)<0.5?'#d8b850':'#c09a3a');
R(cx0-7,hy-9,14,1.5,'#8a6238');
for(let k=0;k<6;k++){const a=-1.2+k*0.5;R(cx0+Math.cos(a)*9,hy-4+Math.abs(Math.sin(a))*3,2,1,'#e0c060');}
if(!dos){R(cx0-4,hy-2,2,2,'#1a1a1e');R(cx0+2,hy-2,2,2,'#1a1a1e');
R(cx0-4,hy+3,8,1,'#5a3a24');R(cx0-3,hy+4,1,1,'#5a3a24');R(cx0+2,hy+4,1,1,'#5a3a24');}
return;}
if(p._noeudOr&&!dos){const cx0=cote?-1:dx;                           /* LE NŒUD PAPILLON DORÉ */
R(cx0-4,hy-2,2,2,'#1a1a1e');R(cx0+2,hy-2,2,2,'#1a1a1e');
R(cx0-3,hy+3,6,1,'#9a5a4a');
R(cx0-2,hy+7,4,2.5,'#c9a24a');R(cx0-4.5,hy+7,2.5,2.5,'#e0bc5a');R(cx0+2,hy+7,2.5,2.5,'#e0bc5a');
R(cx0-1,hy+7.5,2,1,'#f6dd8c');}
if(p._fete){const F2=p._fete, cx0=cote?-1:dx, tt=Date.now()/240;     /* LE GÂTEAU SUR LA TÊTE */
R(cx0-9,hy-9,18,5,'#c98f5a');R(cx0-9,hy-9,18,1,'#e0aa74');
R(cx0-9,hy-9,18,2,'#f6e6d8');for(let k=-8;k<9;k+=3)R(cx0+k,hy-8,2,2+((k+9)%4),'#f6e6d8');
R(cx0-7,hy-14,14,5,'#e8c2d8');R(cx0-7,hy-14,14,1,'#f6dcea');
R(cx0-5,hy-18,10,4,'#c98f5a');R(cx0-5,hy-18,10,1,'#e0aa74');
R(cx0-1.5,hy-20.5,3,2.5,'#c8281e');R(cx0-1,hy-20,1,1,'#f06a5a');
[-5,0,5].forEach((dx2,i)=>{R(cx0+dx2-0.5,hy-24,1.5,4,i%2?'#ffffff':'#f2c230');
const f=1.5+Math.abs(Math.sin(tt*2+i))*1.5;
R(cx0+dx2-0.5,hy-24-f,1.5,f,F2.bougies[i%3]);R(cx0+dx2-0.5,hy-24-f,1.5,1,'#fff6d0');});
if(!dos){R(cx0-4,hy-2,2,2,'#1a1a1e');R(cx0+2,hy-2,2,2,'#1a1a1e');
R(cx0-3.5,hy+3,7,1.5,'#9a5a4a');R(cx0-2.5,hy+3,5,1,'#f4dcd0');
R(cx0-6,hy+1,2,1.5,'#e88a8a');R(cx0+4,hy+1,2,1.5,'#e88a8a');
R(cx0-2,hy+6,4,2,F2.noeud);R(cx0-4,hy+6,2,2,F2.noeud);R(cx0+2,hy+6,2,2,F2.noeud);}
for(let k=0;k<10;k++){const a=(tt/1.1+k*0.9)%6.283;
R(cx0+Math.cos(a)*(13+k%3*3),hy-16+Math.sin(a*1.3)*10,1.5,1.5,['#f2c230','#e8402a','#3fa3c8','#4f8a42','#e8a0c0','#7a3fd8'][k%6]);}
return;}
if(p._fourrure){const FO=p._fourrure, cx0=cote?-1:dx;                  /* LA CAPUCHE DE FOURRURE */
dome(cx0,hy-9,hy+8,15,11,FO.b,'#ffffff',FO.o,'#9a948a');
R(cx0-15,hy+6,30,3,FO.o);
if(dos){R(cx0-14,hy+6,28,14,FO.b);for(let k=-12;k<12;k+=4)R(cx0+k,hy+10+(k%8?0:2),2,1,FO.o);}
else{R(cx0-13,hy+8,2,12,FO.b);R(cx0+11,hy+8,2,12,FO.b);}
if(FO.oreilles){R(cx0-14,hy-12,7,7,FO.b);R(cx0+7,hy-12,7,7,FO.b);R(cx0-12,hy-10,3,3,FO.museau);R(cx0+9,hy-10,3,3,FO.museau);}
if(!dos){if(cote){R(9,hy+1,7,5,FO.museau);R(13,hy+3,3,2,'#3a2a20');R(4,hy-2,2,2,'#1a1a1e');}
else{R(cx0-5,hy-3,2,2,'#1a1a1e');R(cx0+3,hy-3,2,2,'#1a1a1e');R(cx0-4.5,hy-3,1,1,'#ffffff');R(cx0+3.5,hy-3,1,1,'#ffffff');
R(cx0-4,hy+1,8,5,FO.museau);R(cx0-1.5,hy+2,3,2,'#3a2a20');R(cx0-3,hy+5,6,1,'#9a948a');}}
return;}
if(p._poulet){const cx0=cote?-1:dx, bl='#f6f3ec', blO='#d8d2c4', rouge='#d8302a', rougeC='#f05a4a', bec='#f0a830';
dome(cx0,hy-9,hy+8,15,11,bl,'#ffffff',blO,'#9a948a');
R(cx0-15,hy+6,30,3,blO);if(!dos){R(cx0-13,hy+8,2,12,bl);R(cx0+11,hy+8,2,12,bl);}
else{R(cx0-14,hy+6,28,14,bl);for(let k=-12;k<12;k+=4)R(cx0+k,hy+10+(k%8?0:2),2,1,blO);}                 /* de dos, la capuche descend sur la nuque */
for(let k=-2;k<=2;k++){const h=k===0?7:(Math.abs(k)===1?5:3);R(cx0+k*3-1.5+(cote?2:0),hy-9-h,3,h+1,rouge);R(cx0+k*3-1.5+(cote?2:0),hy-9-h,1,h,rougeC);}
if(!dos){if(cote){R(10,hy+1,6,3,bec);R(13,hy+2,4,2,'#d8901e');R(4,hy-2,2,2,'#1a1a1e');R(9,hy+4,3,4,rouge);}
else{R(cx0-5,hy-3,2,2,'#1a1a1e');R(cx0+3,hy-3,2,2,'#1a1a1e');R(cx0-4.5,hy-3,1,1,'#ffffff');R(cx0+3.5,hy-3,1,1,'#ffffff');
R(cx0-3,hy+1,6,3,bec);R(cx0-2,hy+4,4,2,'#d8901e');R(cx0-1,hy+6,2,1,'#d8901e');R(cx0-3,hy+1,6,1,'#ffd070');
R(cx0-2,hy+7,4,3,rouge);R(cx0-1,hy+10,2,1,rouge);}}
return;}
if(p._casque){const Q=p._casque, c=Q.c, cC=T(c,30), cO=T(c,-40), cx0=cote?-1:dx;          /* LE CASQUE : une coque brillante, des aérations, la jugulaire */
dome(cx0,hy-8,hy+6,14,10,c,cC,cO,T(c,-60));
R(cx0-5,hy-6,4,1,'#ffffff');R(cx0-6,hy-5,2,2,'rgba(255,255,255,.7)');                  /* le reflet */
for(let k=-6;k<7;k+=4)R(cx0+k,hy-7,2,1,cO);                                              /* les aérations */
R(cx0-14,hy+4,28,2,cO);                                                                   /* le bord */
if(!dos){R(cx0-12,hy+6,1,10,'#2a2a30');R(cx0+11,hy+6,1,10,'#2a2a30');}                   /* la jugulaire */
if(Q.chat){[[-11],[6]].forEach(([k])=>{R(cx0+k,hy-10,5,3,c);R(cx0+k+1,hy-12,3,2,c);R(cx0+k+2,hy-13,1,1,c);R(cx0+k+1,hy-10,3,2,'#e86a8a');});}
if(Q.visiere&&!dos){if(cote){R(4,hy+4,9,6,Q.visiere);R(5,hy+4,6,1,'#fff0a0');}
else{R(cx0-12,hy+5,24,6,Q.visiere);R(cx0-12,hy+5,24,1,'#fff0a0');R(cx0-9,hy+6,4,1,'#fff0a0');}}
return;}
const B=p._bonnet, c=B?B.b[0]:'#8a3a22', cC=T(c,24), cO=T(c,-34), rev=B?T(c,-12):'#a8482e', pompon=B?B.b[1]:'#f2ead8';
const pb=bouge?-Math.round(Math.max(0,Math.sin(ph*2))*1.5):-souffle;       /* le pompon rebondit */
const cx0=cote?-1:dx;
dome(cx0,hy-7,hy+3,13,9,c,cC,cO,T(c,-50));
for(let x=cx0-11;x<cx0+12;x+=3)for(let y=hy-5;y<hy+2;y++)R(x,y,1,1,cO);   /* les côtes du tricot */
R(cx0-13,hy+2,26,4,rev);R(cx0-13,hy+2,26,1,cC);R(cx0-13,hy+5,26,1,cO);     /* le revers */
for(let x=cx0-12;x<cx0+13;x+=2)R(x,hy+3,1,2,cO);
if(B&&B.m==='jacquard'){for(let k=-9;k<10;k+=6){R(cx0+k,hy-3,1,3,pompon);R(cx0+k-1,hy-2,3,1,pompon);}}   /* les flocons tricotés */
if(B&&B.m==='fourrure'){R(cx0-5,hy-14+pb,10,7,pompon);R(cx0-4,hy-15+pb,8,1,pompon);for(let k=0;k<6;k++)R(cx0-5+k*2,hy-14+pb+(k%2),1,2,T(pompon,-30));R(cx0+2,hy-13+pb,2,2,'#ffffff');}
else{R(cx0-3,hy-11+pb,6,4,pompon);R(cx0-2,hy-12+pb,4,1,pompon);R(cx0+1,hy-11+pb,2,2,T(pompon,30));R(cx0-3,hy-8+pb,6,1,T(pompon,-40));}
if(!cote&&!dos)ombreFront(-11+dx,22,hy+6);
}
else if(chapeau==='capuche'){
const c=vest, cC=vestC, cO=vestO, cT=vestT;
const ample=(r)=>{const k=r-(hy-4);                     /* demi-largeur de la capuche, rangée par rangée */
if(k<0)return 0;if(k<5)return [7,10,12,13,14][k];if(r<hy+18)return 15;if(r<hy+24)return 15-Math.round((r-hy-18)*0.6);return 12;};
if(cote){
for(let r=hy-4;r<hy+26;r++){const hw=ample(r);if(!hw)continue;
const avant=r<hy+2?9:(r<hy+20?5:7), arr=-hw-2+(r>hy+14?Math.round((r-hy-14)*0.4):0);
R(arr,r,avant-arr,1,r<hy?cC:c);R(arr,r,1,1,cT);R(avant-2,r,2,1,cO);
if(r>hy+2&&r<hy+20)R(arr+3,r,1,1,cO);}                                   /* le pli qui suit le crâne */
R(-18,hy+3,3,5,cO);R(-17,hy+2,2,1,c);                                       /* la pointe douce, derrière */
R(6,hy+2,5,6,T(peau,-6));R(6,hy+2,5,1,T(peau,-30));                        /* le front, les cheveux rentrés */
R(5,hy+2,2,17,cT);R(4,hy+3,1,15,T(peau,-24));                               /* l'ombre du rebord sur la joue */
}else{
const d0=dos?0:dx;
for(let r=hy-4;r<hy+27;r++){const hw=ample(r);if(!hw)continue;
const ov=!dos&&r>hy+1&&r<hy+23?Math.round(11.5*Math.sin(Math.PI*(0.08+(r-hy-2)/21*0.86))):0;
if(!ov){R(-hw+d0,r,hw*2,1,r<hy-1?cC:(r>hy+23?cO:c));R(-hw+d0,r,1,1,cT);R(hw-1+d0,r,1,1,cT);R(hw-3+d0,r,2,1,cC);}
else{R(-hw+d0,r,hw-ov,1,c);R(ov+d0,r,hw-ov,1,c);
R(-ov-1+d0,r,1,1,cT);R(ov+d0,r,1,1,cT);                                 /* le rebord, dans l'ombre */
R(-hw+d0,r,1,1,cT);R(hw-1+d0,r,1,1,cT);R(hw-3+d0,r,1,1,cC);R(-hw+2+d0,r,1,1,cO);}}
if(!dos){
R(-9+d0,hy+4,18,4,T(peau,-6));                                           /* le front, sous la capuche (les cheveux sont rentrés) */
R(-11+d0,hy+5,3,10,T(peau,-14));R(8+d0,hy+5,3,10,T(peau,-14));             /* les tempes, dans l'ombre du rebord */
R(-9+d0,hy+2,18,2,cT);R(-8+d0,hy+4,16,1,T(peau,-30));                      /* l'ombre sur le front */
R(-4+d0,hy+23,1,6,'#e8e0c8');R(3+d0,hy+23,1,6,'#e8e0c8');                  /* les cordons */
R(-4+d0,hy+29,1,1,'#b9b0a0');R(3+d0,hy+29,1,1,'#b9b0a0');
}else{R(d0,hy-3,1,26,cO);R(-6+d0,hy+2,1,18,cO);R(5+d0,hy+2,1,18,cC);}          /* la couture, les plis */
}
}
else if(chapeau==='chapeau'){
const c='#6b4a2c', cC='#8a6238', cO='#4a3018', cOO='#2a1a0e', ruban='#2a1a10';
if(cote){
R(-14,hy+2,30,3,c);R(-14,hy+2,30,1,cC);R(-14,hy+4,30,1,cOO);R(13,hy+1,3,1,cC);   /* le bord, relevé devant */
dome(-1,hy-8,hy+3,11,6,c,cC,cO,cOO);R(-12,hy,22,2,ruban);R(-1,hy-8,1,3,cO);
}else{
const bx=dos?0:dx;
for(let x=-17;x<17;x++){const y=hy+2+(Math.abs(x)>13?1:0);R(x+bx,y,1,3,c);}    /* le bord, qui retombe aux côtés */
R(-17+bx,hy+2,34,1,cC);R(-16+bx,hy+4,32,1,cOO);
dome(bx,hy-8,hy+3,11,6,c,cC,cO,cOO);R(-11+bx,hy,22,2,ruban);R(-11+bx,hy,22,1,T(ruban,20));
if(!dos){R(-2+bx,hy-8,1,4,cO);R(1+bx,hy-8,1,4,cO);R(5+bx,hy,2,2,'#c9a24a');ombreFront(-11+bx,22,hy+5);}  /* le pinçon, la boucle */
}
}
else if(chapeau==='beret'){
const c='#2a2a3a', cC='#46465a', cO='#16161e';
const cx0=cote?-2:dx+2;
for(let r=0;r<6;r++){const w=[18,24,26,26,24,20][r];R(cx0-Math.round(w/2)+(r<2?1:0),hy-4+r,w,1,r===0?cC:(r>4?cO:c));}
R(cx0+Math.round(26/2)-3,hy-3,3,4,cC);R(cx0-13,hy+1,26,1,cO);                    /* la lumière à droite, le bord */
R(cx0,hy-6,2,2,c);R(cx0+1,hy-7,1,1,cC);                                          /* la queue */
if(!cote&&!dos)ombreFront(-11+dx,22,hy+2);
}
else if(chapeau==='cagoule'){
const c='#2e3134', cC='#4a4f54', cO='#1c1e20', cB='#3c4044';
const colle=(r)=>{const k=r-(hy-1);if(k<0)return 0;if(k<3)return [9,11,12][k];if(r>=hy+8&&r<hy+18)return diag?16:15;if(r<hy+20)return 13;if(r<hy+24)return 13-(r-hy-19);return 7;};   /* elle couvre les oreilles */
if(cote){
for(let r=hy-1;r<hy+30;r++){const hw=colle(r);if(!hw)continue;
const avant=r>hy+20?(r>hy+23?3:8):(r>=hy+11&&r<=hy+16?13:11), arr=-hw+(r>hy+23?2:0);   /* le nez se devine sous le tricot */
R(arr,r,avant-arr,1,c);R(arr,r,1,1,cO);R(avant-1,r,1,1,cC);
for(let x=arr+2;x<avant-1;x+=2)R(x,r,1,1,cB);}                          /* les côtes du tricot */
R(3,hy+9,8,5,peau);R(3,hy+8,8,1,cC);R(3,hy+14,8,1,cC);R(3,hy+9,1,5,cO);       /* la fente, bordée */
oeilDe(4,hy+10,true);
R(-9,hy+1,7,1,cC);                                                          /* le reflet sur le crâne */
}else{
const d0=dos?0:dx;
for(let r=hy-1;r<hy+30;r++){const hw=colle(r);if(!hw)continue;
R(-hw+d0,r,hw*2,1,c);R(-hw+d0,r,1,1,cO);R(hw-1+d0,r,1,1,cO);
for(let x=-hw+2;x<hw-1;x+=2)R(x+d0,r,1,1,cB);                             /* les côtes du tricot */
R(hw-3+d0,r,1,1,cC);}
R(-5+d0,hy,9,1,cC);R(-3+d0,hy+1,5,1,cC);                                      /* le reflet sur le crâne */
if(!dos){
R(-10+d0,hy+9,20,6,peau);R(-10+d0,hy+8,20,1,cC);R(-10+d0,hy+15,20,1,cC);    /* la fente des yeux, bordée */
R(-10+d0,hy+9,20,1,T(peau,-26));
oeilDe(-7+d0+(diag&&vis>0?1:0),hy+11,false);oeilDe(3+d0-(diag&&vis<0?1:0),hy+11,false);
R(-1+d0,hy+16,2,3,cO);                                                     /* le nez, sous le tricot */
R(-3+d0,hy+19,6,1,cO);                                                     /* la bouche devinée */
}
}
}
};
const masqueDe=()=>{
if(p._lunettes&&!dos){const Lu=p._lunettes, hy=yTete, dx=(!cote&&diag)?vis*2:0;          /* LES LUNETTES DE GLACIER : verres ronds, œillères de cuir */
if(cote){R(3,hy+9,6,5,Lu.f);R(4,hy+10,4,3,Lu.v);R(4,hy+10,1,1,'#ffffff');R(-8,hy+10,11,1,Lu.f);return;}
[[-9],[2]].forEach(([k])=>{R(k+dx,hy+9,7,5,Lu.f);R(k+1+dx,hy+10,5,3,Lu.v);R(k+1+dx,hy+10,1,1,'#ffffff');});
R(-2+dx,hy+10,4,1,Lu.f);R(-12+dx,hy+9,3,5,T(Lu.f,-20));R(9+dx,hy+9,3,5,T(Lu.f,-20));}
const M=p._masque;if(!M)return;const hy=yTete, dx=(!cote&&diag)?vis*2:0, y0=hy+3;
if(dos){R(-11,y0+1,22,2,M[0]);return;}
if(cote){R(-10,y0+1,20,2,M[0]);R(4,y0-1,8,5,M[0]);R(5,y0,6,3,M[1]);R(6,y0,2,1,M[2]);return;}
R(-12+dx,y0+1,24,2,M[0]);                                                                  /* la sangle */
R(-9+dx,y0-1,18,6,M[0]);R(-8+dx,y0,16,4,M[1]);R(-8+dx,y0,16,1,M[2]);R(-6+dx,y0+1,3,1,M[2]);   /* le cadre, le verre, ses reflets */
R(-1+dx,y0+3,2,2,M[0]);};                                                                  /* le pont du nez */
const echarpeDe=()=>{const E=p._echarpe;if(!E)return;const c=E.e[0], c2=E.e[1], c3=E.e[2]||c2, cO=T(c,-30);
const volE=(r)=>balEch(r*1.8);   /* le pan flotte loin derrière le pas */
const w=SX.cou+6, x0=-Math.floor(w/2)+(cote?0:(diag?vis:0));
R(x0,yCou+1,w,5,c);R(x0,yCou+1,w,1,T(c,20));R(x0,yCou+5,w,1,cO);
if(E.m==='rayee')for(let x=x0+1;x<x0+w;x+=4)R(x,yCou+1,2,5,c2);
if(E.m==='nordique'){R(x0,yCou+3,w,1,c2);for(let x=x0+1;x<x0+w;x+=3)R(x,yCou+2,1,1,c3);}
const pan=(px,dirX)=>{for(let r=0;r<13;r++){
const xx=px+Math.round(r*0.15*dirX)+volE(r);     /* le pan traîne et dépasse */
R(xx,yCou+5+r,4,1,(E.m==='rayee'&&Math.floor(r/3)%2)?c2:c);R(xx+3,yCou+5+r,1,1,cO);}
const fx=px+Math.round(13*0.15*dirX)+volE(13);
for(let k=0;k<4;k++)R(fx+k,yCou+18,1,2,c2);};                  /* les franges */
if(dos)pan(-2,0);else if(cote)pan(-6,-1);else pan(x0+w-6,1);};
const angleBras=()=>{
let a, L=15;
const REPOS=1.25;                                       /* le bras qui pend, un peu en avant */
if(typeG==='cueille')a=REPOS-arcG*0.45;
else if(typeG==='petanque'){const f2=frG;
 if(f2>0.55)a=REPOS+(2.35-REPOS)*doux((1-f2)/0.45);
 else if(f2>0.3)a=2.35+(-0.35-2.35)*sortRap((0.55-f2)/0.25);
 else a=-0.35+(REPOS+0.35)*doux(1-f2/0.3);}
else if(typeG==='gouge'){a=0.55+arcG*0.8;L=13;}
else if(typeG==='tamis'){a=0.95+arcG*0.4;L=13;}
else{
const HAUT=-1.95, IMPACT=0.7, bas2=typeG==='hache'?-1.9:-1.45, fin2=typeG==='hache'?1.4:1.3;
if(phaseG===1)a=REPOS+(arcG/bas2)*(HAUT-REPOS);
else if(phaseG===2)a=HAUT+((arcG-bas2)/(fin2-bas2))*(IMPACT-HAUT);
else a=IMPACT+(1-arcG/fin2)*(REPOS-IMPACT);
}
return {a,L};
};
const momentDos=(a)=>a>1.0?'pend':(a>0.2?'frappe':'leve');
const brasGeste=(fonce,derriere)=>{
const c=fonce?vestO:vest, sk=fonce?peauO:peau;
const epX=cote?1:(derriere?-EP+2:EP-2), epY=yEp+3;
const {a,L}=angleBras();
if(!cote){
const hx=Math.round((derriere?-2:2)+(typeG==='tamis'?(derriere?-5:5):0));
const hy=Math.round(dos&&momentDos(a)==='frappe'?epY-3:epY+Math.sin(a)*L*0.9);
const ex=Math.round((epX+hx)/2+(derriere?-2:2)), ey=Math.round((epY+hy)/2);
seg(epX,epY,ex,ey,SX.bras[0],manches>0?c:sk);seg(ex,ey,hx,hy,SX.bras[1],manches>=1?c:sk);
R(hx-2,hy-1,4,4,sk);R(hx-2,hy-1,4,1,fonce?peau:peauC);
return {x:hx,y:hy,a};
}
const cA=Math.cos(a), sA=Math.sin(a);
const ex=epX+Math.cos(a-0.35)*L*0.5, ey=epY+Math.sin(a-0.35)*L*0.5;
const hx=epX+cA*L+(derriere?-1:0), hy=epY+sA*L;
seg(epX,epY,ex,ey,SX.bras[0]+1,manches>0?c:sk);seg(ex,ey,hx,hy,SX.bras[1]+1,manches>=1?c:sk);
R(Math.round(hx)-2,Math.round(hy)-2,4,4,sk);R(Math.round(hx)-2,Math.round(hy)-2,4,1,fonce?peau:peauC);
return {x:hx,y:hy,a};
};
const outil=(h)=>{
const bois='#8a6238', boisC='#b08858', acier='#9aa2a8', acierC='#e6ecf0', acierO='#5a6268';
if(typeG==='cueille')return;
if(typeG==='petanque'){if(frG<=0.36)return;const bx=Math.round(h.x), by=Math.round(h.y)+1;   /* la boule dans la main, jusqu'au lâcher */
 R(bx-3,by-2,6,6,'#5a6068');R(bx-3,by-3,6,1,'#5a6068');R(bx-2,by-3,4,6,'#9aa2aa');R(bx-2,by-2,3,3,'#d8dde2');R(bx-1,by-2,1,1,'#ffffff');R(bx-3,by+1,6,1,'#3a4048');return;}
/* LE LANCER NE MET RIEN DANS LA MAIN. La canne est deja dessinee, et bien
   mieux : dessinerLaPeche la trace depuis la main jusqu'au scion, avec sa
   finition, ses motifs et son pliage. Sans ce retour, le geste tombait
   dans le cas general ci-dessous — celui du fer de pioche — et l'on
   pechait une pioche a la main, canne comprise.
   (Le meme cas general attrape encore 'semer', 'arrose' et 'ramasse' :
   ces trois-la ont recu leur courbe de corps mais pas leur objet, et
   sement donc avec une pioche.) */
if(typeG==='lance')return;
/* ================= TROIS OBJETS QUI MANQUAIENT =================
   'semer', 'arrose' et 'ramasse' avaient recu leur courbe de corps mais
   jamais leur objet : ils tombaient dans le cas general d'en bas, qui est
   le fer de pioche. On semait et on arrosait la pioche a la main.
   CES TROIS-LA PENDENT AU BOUT DU BRAS, ils ne le prolongent pas : on les
   dessine d'aplomb, avant meme de savoir si l'on est de face ou de
   profil. Un arrosoir ne s'incline pas parce qu'on se tourne — les
   outils a manche, eux, suivent l'axe du bras, d'ou leur cas plus bas. */
if(typeG==='ramasse')return;                       /* la main est pleine de ce qu'on ramasse */
if(typeG==='semer'){
const toile='#cbb78c', toileC='#e4d6b4', toileO='#9a8660';
R(h.x-4,h.y+1,8,8,toile);R(h.x-4,h.y+1,8,1,toileC);R(h.x+3,h.y+2,1,7,toileO);
R(h.x-3,h.y-1,6,2,toileO);R(h.x-3,h.y-1,6,1,'#6b5330');      /* le col, serre a la cordelette */
R(h.x-2,h.y+4,2,1,'#b9a37a');R(h.x+1,h.y+6,1,1,'#b9a37a');   /* deux grains sous la toile */
return;}
if(typeG==='arrose'){
const zinc='#9aa6ae', zincC='#d8e2e8', zincO='#5e6a72';
const s2=dos?-1:1;                                           /* le bec part devant soi */
R(h.x-5,h.y,10,8,zinc);R(h.x-5,h.y,10,1,zincC);R(h.x+4,h.y+1,1,7,zincO);   /* le corps */
R(h.x-3,h.y-2,6,2,zinc);R(h.x-3,h.y-2,6,1,zincC);                          /* le goulot */
R(s2>0?h.x+5:h.x-10,h.y+2,5,2,zinc);                                       /* le bec */
R(s2>0?h.x+9:h.x-11,h.y+3,2,4,zinc);
R(s2>0?h.x+9:h.x-12,h.y+6,3,2,zincO);                                      /* la pomme */
R(s2>0?h.x-7:h.x+5,h.y+1,2,6,zincO);                                       /* l'anse */
return;}
if(!cote){
const haut=h.a<0, L2=Math.round(6+Math.abs(Math.sin(h.a))*16);
const dy2=dos?(momentDos(h.a)==='frappe'?-1:1):(haut?-1:1);
const L3=dos&&momentDos(h.a)==='frappe'?30:L2;                 /* de dos, la frappe part loin devant : l'outil dépasse au-dessus de la tête */
if(typeG==='tamis'){R(h.x-12,h.y+1,24,4,bois);R(h.x-11,h.y+2,22,2,'#c7b88a');for(let x=-10;x<11;x+=3)R(h.x+x,h.y+2,1,2,T('#c7b88a',-30));return;}
if(typeG==='gouge'){R(h.x-1,h.y-5,2,5,acier);R(h.x-1,h.y-5,1,5,acierC);return;}
for(let k=0;k<L3;k++)R(h.x-1,h.y+dy2*k,2,1,k%3?bois:boisC);
const ty=h.y+dy2*L3;
if(typeG==='houe'){R(h.x-7,ty-1,14,3,acier);R(h.x-7,ty-1,14,1,acierC);R(h.x-1,ty-2,3,4,acierO);return;}
if(typeG==='hache'){R(h.x-9,ty-3,9,8,acier);R(h.x-9,ty-3,1,8,acierC);R(h.x-8,ty-3,7,1,acierC);R(h.x-1,ty-2,3,5,acierO);}
else{R(h.x-12,ty-1,24,3,acier);R(h.x-12,ty-1,24,1,acierC);R(h.x-13,ty,1,2,acierC);R(h.x+12,ty,1,2,acierC);R(h.x-1,ty-2,3,5,acierO);}
return;
}
const dx2=Math.cos(h.a), dy3=Math.sin(h.a), px=-dy3, py=dx2;                   /* le long du manche, et en travers */
if(typeG==='tamis'){
for(let k=-7;k<8;k++){R(Math.round(h.x+2+k),Math.round(h.y+1),1,3,Math.abs(k)>5?bois:'#c7b88a');}
R(Math.round(h.x-5),Math.round(h.y+1),15,1,bois);return;}
if(typeG==='gouge'){
for(let k=0;k<5;k++)R(Math.round(h.x+dx2*k)-1,Math.round(h.y+dy3*k)-1,2,2,bois);
for(let k=5;k<9;k++)R(Math.round(h.x+dx2*k)-1,Math.round(h.y+dy3*k)-1,2,2,k===8?acierC:acier);
return;}
const Lm=24;                                             /* un vrai manche : presque la longueur du bras */
for(let k=-3;k<Lm;k++){const x=h.x+dx2*k, y=h.y+dy3*k;R(Math.round(x)-1,Math.round(y)-1,2,2,bois);if(k%3===0)R(Math.round(x),Math.round(y)-1,1,1,boisC);}
const tx=h.x+dx2*Lm, ty=h.y+dy3*Lm;
if(typeG==='houe'){
for(let k=0;k<7;k++)for(let j=0;j<9;j++){const x=tx+px*(j-1)+dx2*k*0.35-px*0, y=ty+py*(j-1)+dy3*k*0.35;
R(Math.round(x),Math.round(y),1,1,j>=8?acierC:(k===0?acierO:acier));}
R(Math.round(tx)-1,Math.round(ty)-1,3,3,acierO);                               /* la douille */
return;}
if(typeG==='hache'){
for(let k=0;k<9;k++)for(let j=-3;j<4+Math.round(k*0.5);j++){const x=tx+px*k*(-1)+dx2*j*0.6, y=ty+py*k*(-1)+dy3*j*0.6;
R(Math.round(x),Math.round(y),1,1,k>=8?acierC:(j<-2?acierO:(k<2?acierO:acier)));}
R(Math.round(tx)-1,Math.round(ty)-1,3,3,acierO);                               /* la douille, où passe le manche */
}else{
for(let k=-12;k<13;k++){const x=tx+px*k, y=ty+py*k+Math.abs(k)*0.28*dy3;R(Math.round(x)-1,Math.round(y)-1,3,2,Math.abs(k)>10?acierC:(Math.abs(k)<3?acierO:acier));}
R(Math.round(tx)-1,Math.round(ty)-1,3,3,acierO);
}
};
const queueDe=()=>{
if(p._fete){const tt=Date.now()/500, fl=Math.sin(tt)*2;      /* LE BALLON, ACCROCHÉ DANS LE DOS */
const bx2=(cote?-10:(dos?0:12)), by2=yEp-34+fl;
g.strokeStyle='#e8e4d8';g.lineWidth=0.8;g.beginPath();g.moveTo(bx2*0.4,yEp-2);
g.quadraticCurveTo(bx2*0.8,by2+12,bx2,by2+7);g.stroke();
g.fillStyle='#e8402a';g.beginPath();g.ellipse(bx2,by2,5.5,6.5,0,0,7);g.fill();
g.fillStyle='#f4705a';g.beginPath();g.ellipse(bx2-1.6,by2-2,1.8,2.4,0,0,7);g.fill();
g.fillStyle='#b82a1e';g.fillRect(bx2-1,by2+6,2,2);}
if(p._cape){const C=p._cape, t2=Date.now()/500, v=Math.sin(t2)*2;      /* LA CAPE : elle dépasse largement et ondule */
if(cote){R(-4,yEp-2,7,Math.round((yHan-yEp)*1.5)+10,C.c);R(-4,yEp-2,7,2,C.clair);R(-5,yHan+6,8,4,C.c2);}
else if(dos){R(-Math.round(TA*1.5),yEp-2,Math.round(TA*3),Math.round((yHan-yEp)*1.7)+12,C.c);
R(-Math.round(TA*1.5),yEp-2,Math.round(TA*3),2,C.clair);
for(let k=-2;k<=2;k++)R(k*5,yEp+2,1,Math.round((yHan-yEp)*1.5),C.c2);}
else{const L3=Math.round(TA*1.15);
R(-L3-4+v,yEp,6,Math.round((yHan-yEp)*1.6)+8,C.c);R(L3-2-v,yEp,6,Math.round((yHan-yEp)*1.6)+8,C.c);
R(-L3-4+v,yEp,6,2,C.clair);R(L3-2-v,yEp,6,2,C.clair);
R(-L3-5+v,yEp+Math.round((yHan-yEp)*1.6)+6,7,4,C.c2);R(L3-3-v,yEp+Math.round((yHan-yEp)*1.6)+6,7,4,C.c2);
R(-TA,yEp-2,TA*2,2,C.clair);}}
if(p._fourrure&&p._fourrure.queue){const FO=p._fourrure;
if(cote)R(-13,yHan-8,5,5,FO.o);else if(dos)R(-3,yHan-6,6,6,FO.o);else{R(-11,yHan-6,4,4,FO.o);R(7,yHan-6,4,4,FO.o);}}
if(!p._poulet)return;const b='#ffffff', o='#d8d2c4';
if(cote){[[-14,-6],[-16,-2],[-14,2]].forEach(([dx,dy],k)=>{R(dx-4,yHan-10+dy,8,3,k===1?b:o);R(dx-6,yHan-10+dy+1,3,1,o);});return;}
if(dos){[[-7,0],[0,-3],[7,0]].forEach(([dx,dy])=>{R(dx-2,yHan-18+dy,5,12,b);R(dx-2,yHan-18+dy,1,12,o);R(dx-1,yHan-20+dy,3,2,b);});return;}
[[-9],[9]].forEach(([dx])=>{R(dx-2,yHan-14,4,6,o);});};
const skisDe=()=>{if(!p._skis)return queueDe();const K=p._skis;const c=K.sk[0], c2=K.sk[1], cO=T(c,-40), snow=K.t==='snow';
if(cote){const y0=yEp+1;                                                     /* posés sur l'épaule, sous le menton */
if(snow){R(-26,y0-1,50,5,c);R(-26,y0-1,50,1,T(c,26));R(-26,y0+3,50,1,cO);R(-6,y0,10,3,c2);R(22,y0-2,3,5,c);}
else{[0,3].forEach(o=>{R(-24,y0+o,46,2,c);R(-24,y0+o,46,1,T(c,26));R(22,y0+o-2,2,2,c);R(-6,y0+o,6,2,c2);});}   /* les deux skis, spatules devant */
return;}
if(dos){for(let k=0;k<(snow?1:2);k++){const o=k*3;seg(-12+o,yHan+2,12+o,yTete-12,snow?5:2,c);seg(-12+o,yHan+2,12+o,yTete-12,1,T(c,24));}
seg(-3,yEp+8,3,yEp-2,snow?5:2,c2);return;}
const xs=EP-1+(diag?vis:0);
if(snow){R(xs,yTete-12,6,62,c);R(xs,yTete-12,1,62,T(c,26));R(xs+5,yTete-12,1,62,cO);R(xs+1,yEp+6,4,6,c2);R(xs+1,yTete-13,4,1,c);}
else{[0,3].forEach(o=>{R(xs+o,yTete-14,2,64,c);R(xs+o,yTete-14,1,64,T(c,26));R(xs+o-1,yTete-16,2,2,c);R(xs+o,yEp+6,2,5,c2);});}
};
const lean=frG>0?Math.round(pencheG*1.3):(PEDALE&&cote?9:(COURSE&&cote?2:0));   /* le buste se penche vers ce qu'on frappe, en avant quand on court, et sur le guidon à vélo */
const penche=(f)=>{if(!lean)return f();g.save();g.translate(s*lean*u,0);f();g.restore();};
if(!dos&&!cote)skisDe();                                                        /* de face, les skis passent derrière le corps */
if(cote){
/* ================= LES DEUX BRAS =================
   De profil, le bras du fond recevait l'avance de SA PROPRE jambe. Or un
   bras s'oppose toujours à la jambe de son côté — c'est ce qui équilibre
   la marche, et c'est la première chose qu'on remarque quand ça manque.

   Pire : la jambe du fond et celle de devant étant en opposition de
   phase, les deux bras recevaient alors presque la même valeur. Ils se
   superposaient donc exactement, et le personnage marchait avec UN seul
   bras visible — l'autre caché derrière, au même endroit.

   Vérifié en débardeur, où les deux bras se voient : avant, un bras ;
   après, deux bras qui se croisent. */
if(frG>0)penche(()=>brasGeste(true,true));else penche(()=>bras(0,-avD,true));     /* à l'opposé de SA jambe, voir LES DEUX BRAS */
penche(()=>sac(false));
jambe(0,avD,lvD,true);
penche(()=>torse());
jambe(0,avG,lvG,false);
penche(()=>{cheveuxDerriere();tete();echarpeDe();barbeDe();cheveuxDessus();if(chapeau==='aucun')finitionsSalon();chapeauDe();masqueDe();});
if(frG>0)penche(()=>{const h=brasGeste(false,false);outil(h);
/* ================= LA MAIN QUI TIENT =================
   C'était un carré de quatre sur quatre en peau nue : ni pouce, ni
   doigts, ni ombre — alors que la main qui pend au bout du bras, elle,
   est dessinée depuis toujours. On lui donne la même, en poing fermé :
   c'est la forme d'une main qui tient quelque chose, et c'est justement
   celle que `main` dessine en profil. */
main(Math.round(h.x),Math.round(h.y)-2,s>0?1:-1,true,false,false);});
else penche(()=>bras(0,-avG,false));                       /* le bras de devant, à l'opposé de la jambe de devant */
}else if(frG>0){
if(!dos)cheveuxDerriere();
jambe(-Math.round(HA/2)-1,0,0,false);jambe(Math.round(HA/2)+1,0,0,false);
if(!dos)sac(false);
torse();
const outilEtBras=()=>{const h1=brasGeste(false,true), h2=brasGeste(false,false);
outil({x:Math.round((h1.x+h2.x)/2),y:Math.round((h1.y+h2.y)/2),a:h2.a});
/* DE FACE ET DE DOS, il n'y avait AUCUNE main : l'outil flottait au bout
   de deux avant-bras qui s'arrêtaient dans le vide. */
main(Math.round(h1.x),Math.round(h1.y)-2,-1,true,true,false);
main(Math.round(h2.x),Math.round(h2.y)-2,1,true,false,false);};
if(dos){
const leve=momentDos(angleBras().a)==='leve';
if(!leve){outilEtBras();torse();sac(false);tete();echarpeDe();cheveuxDessus();if(chapeau==='aucun')finitionsSalon();chapeauDe();masqueDe();}
else{sac(false);tete();echarpeDe();cheveuxDessus();if(chapeau==='aucun')finitionsSalon();chapeauDe();masqueDe();outilEtBras();}
}else{outilEtBras();sac(true);tete();echarpeDe();barbeDe();cheveuxDessus();if(chapeau==='aucun')finitionsSalon();chapeauDe();masqueDe();}
}else{
if(!dos)cheveuxDerriere();
if(diag){
/* ================= LA JAMBE DE TROIS QUARTS =================
   Elle avait sa propre cinématique, inventée à part : un pied raccourci
   d'un côté, un genou résolu de l'autre, un écart de hanches à plat, et
   une profondeur de un virgule six collée au jugé. Quatre règles qui ne
   savaient rien les unes des autres — d'où les jambes qui se croisaient,
   enfermaient un trou, et ne ressemblaient à rien de logique.

   Il n'y a plus qu'UNE règle : on résout la jambe dans LE PLAN DE
   MARCHE, à pleine échelle, exactement comme de profil — même table de
   foulée, même longueur de jambe, même genou. Puis on projette le
   résultat. Hanche, genou, pied subissent la même projection, donc ils
   ne peuvent plus se contredire.

   LA PROJECTION. Le sol est vu de biais : un pas en profondeur descend à
   l'écran de PROF_Z fois sa longueur. Pour une diagonale à quarante-cinq
   degrés, l'axe de marche et l'axe des hanches se projettent ainsi :

     marche  (u) -> ( u·0,707·sx ,  u·0,707·PROF_Z·sy )
     hanches (v) -> ( v·0,707·sy , -v·0,707·PROF_Z·sx )
     hauteur (h) -> (          0 ,                  h )

   où sx est le sens horizontal de la marche et sy son sens vertical.
   C'est ce deuxième terme qui manquait : l'axe des hanches a une
   composante VERTICALE. Une hanche est donc plus haute que l'autre, et
   la jambe du fond part de plus haut — c'est ce qui fait qu'on lit un
   corps tourné et non deux jambes côte à côte.

   PROF_Z vaut 0,23 : la même compression que la vue de face, où un pas
   entier de treize unités descend de trois. Les deux vues racontent donc
   la même perspective. */
const CX=0.7071, PROF_Z=0.23;
const sx=tourne, sy=dos?-1:1;
/* un point du plan de marche (u = avance, h = hauteur) vers l'écran,
   pour une jambe décalée de v sur l'axe des hanches */
const pjX=(v,u)=>v*CX*sy+u*CX*sx+vis;
const pjY=(v,u,h)=>h-v*CX*PROF_Z*sx+u*CX*PROF_Z*sy;
/* ================= LA VOIE EST PLUS ÉTROITE QUE LE BASSIN =================
   On marche sur une ligne, pas sur deux rails. Chez un humain l'écart
   des hanches fait une trentaine de centimètres, celui des deux appuis
   huit à dix : les cuisses rentrent en biais vers l'intérieur et les
   pieds se posent presque sous l'axe du corps.

   Le modèle posait le pied À LA VERTICALE DE SA HANCHE. En diagonale,
   cet écart de hanche se projette dans la même direction que la foulée :
   il s'ajoutait d'un côté et se retranchait de l'autre, si bien qu'un
   des deux doubles appuis se refermait complètement. Mesuré : les
   jambes restaient collées douze images sur vingt-quatre, alors qu'une
   vraie marche ne les superpose que deux fois par cycle, au passage.

   La hanche garde donc sa largeur, le pied se resserre, et le genou se
   place entre les deux — plus près du pied, comme une vraie cuisse. */
const ECART_PIED=2.5;
const jd=(cote,pp,fonce)=>{
const vH=cote*HA/2, vP=cote*ECART_PIED, vK=cote*(HA/2*0.35+ECART_PIED*0.65);
const fu=pp.x*PAS_U*AMPL, fh=-3-pp.lift*6;
/* LE GENOU, résolu dans le plan de marche : deux os égaux, pliés vers
   l'avant. C'est le même calcul que de profil, au signe près. */
const L2=(Y_PIED-Y_HANCHE)/2;
const du=fu, dh=fh-yHan, d=Math.min(L2*2,Math.hypot(du,dh));
const hk=Math.sqrt(Math.max(0,L2*L2-(d/2)*(d/2))), nl=Math.hypot(du,dh)||1;
let nu=-dh/nl, nh=du/nl; if(nu<0){nu=-nu;nh=-nh;}
const ku=du/2+nu*hk, kh=yHan+dh/2+nh*hk;
const hX=pjX(vH,0),  hY=pjY(vH,0,yHan);
const kX=pjX(vK,ku), kY=pjY(vK,ku,kh);
const fX=pjX(vP,fu), fY=pjY(vP,fu,fh);
const c=fonce?pantO:pant, bas2=court?(fonce?peauO:peau):c;
seg(hX,hY,kX,kY,SX.jambe,c);
seg(hX+1,hY+1,kX+1,kY,1,fonce?pant:pantC);                               /* la cuisse, éclairée devant */
seg(kX,kY,fX,fY,SX.jambe-1,bas2);
R(Math.round(kX)-1,Math.round(kY),2,1,fonce?pant:pantC);                 /* le genou */
soulierDe(Math.round(fX),Math.round(fY)+3,fonce,pp);};
/* QUELLE JAMBE EST AU FOND : celle dont l'écart de hanche la fait monter
   à l'écran. Le signe sort de la projection elle-même, on ne le devine
   plus. */
const loinEstD=sx>0;
if(loinEstD){jd(1,pD,true);jd(-1,pG,false);}
else{jd(-1,pG,true);jd(1,pD,false);}
}else{
/* DE TROIS QUARTS, l'écart entre les jambes se réduit et l'ensemble
   glisse dans le sens du pivot. */
const ej=diag?0:1, dj=diag?Math.round(vis*1.5):0;
/* L'AVANCE DU PIED, enfin transmise. Elle valait 0 en dur : la table de
   poses était calculée puis jetée pour ces deux vues. De dos, les deux
   jambes sont inversées — c'est l'autre qui vient vers nous. */
const avJG=diag?0:(dos?-avD:avG), avJD=diag?0:(dos?-avG:avD);
jambe(-Math.round(HA/2)-ej+dj,avJG,dos?lvD:lvG,false);
jambe(Math.round(HA/2)+ej+dj,avJD,dos?lvG:lvD,false);
}
if(!dos)sac(false);
const avanceD=diag&&bouge?tourne*(COURSE?2:1):0;              /* de trois-quarts, le buste se porte vers l'avant */
/* LE BUSTE GLISSE AU-DESSUS DE LA JAMBE PORTEUSE. C'est le signe qui fait
   lire le report de poids de face : sans lui, seuls les pieds bougent et
   on croit à un piétinement.

   LE SIGNE EST NÉGATIF, et c'est tout le geste : le buste passe au-dessus
   de la jambe QUI PORTE, pas au-dessus de celle qui se repose. Dans le
   premier essai il partait du même côté que le pied qui glisse — le corps
   se penchait du côté où il n'y avait plus personne. */
const swayX=balance+avanceD-(rpA?rpA.sway[rpF]:0)+trVire, swayY=diag&&COURSE?1:0;
if(swayX||swayY){g.save();g.translate(swayX*u,swayY*u);}           /* le poids passe d'un pied sur l'autre */
if(diag){const loin=vis;bras(loin,loin>0?(dos?hanche:-hanche):(dos?-hanche:hanche),true);}
torse();
if(diag){const loin=vis, pres=-vis;
bras(pres,loin>0?(dos?-hanche:hanche):(dos?hanche:-hanche),false);}
else{bras(-1,dos?-hanche:hanche,false);bras(1,dos?hanche:-hanche,false);}
if(dos)sac(false);else sac(true);
tete();echarpeDe();
if(!dos)barbeDe();
cheveuxDessus();if(chapeau==='aucun')finitionsSalon();
if(diag&&dos){const cx2=tourne>0?9:-12;R(cx2,yTete+9,3,9,peau);R(cx2+(tourne>0?1:0),yTete+11,2,4,peauO);R(tourne>0?11:-13,yTete+14,2,3,peau);}
chapeauDe();masqueDe();
if(swayX||swayY)g.restore();
}
if(dos||cote)skisDe();                                                       /* de profil et de dos, ils passent devant */
}
let BRISE_PH=0, CLIGNE_FIN=false;
function graverFin(ap,dir,pas,bouge,brise,cligne){
BRISE_PH=(brise||0)*Math.PI/2;CLIGNE_FIN=!!cligne;
const FG=finesseGravure();
const L=CASE_L*FG, H=CASE_H*FG;
const c=document.createElement('canvas');c.width=L;c.height=H;
const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.setTransform(FG,0,0,FG,0,0);
spriteFin(g,CASE_L/2,CASE_H-10,ap,dir,pas,bouge);
g.setTransform(1,0,0,1,0,0);
const im=g.getImageData(0,0,L,H), d=im.data, plein=new Uint8Array(L*H);
for(let i=0;i<L*H;i++)plein[i]=d[i*4+3]>200?1:0;
const sortie=g.createImageData(L,H), o=sortie.data;
/* ================= LE CONTOUR SÉLECTIF =================
   Un cerne posé tout autour transforme le personnage en autocollant : il
   l'aplatit et il écrase les nuances qu'on a mis tant de soin à dériver.

   La règle, celle qu'emploient les pixel artists : le contour n'existe que
   là où la lumière ne tombe pas. La lumière vient du haut-gauche, donc

     — en bas et à droite : contour franc, c'est l'ombre propre du corps
     — en haut et à gauche : rien, la lumière mange le bord
     — sauf si le bord est lui-même sombre : alors un contour discret
       suffit à le décoller d'un fond sombre, sans l'encrer

   Et surtout, le contour n'est pas une encre fixe : c'est la couleur du
   pixel voisin, très assombrie. Un bord de peau a un cerne brun, un bord de
   veste rouge un cerne bordeaux. Le personnage reste coloré jusqu'au bord. */
const lum=(i)=>(d[i*4]*0.3+d[i*4+1]*0.59+d[i*4+2]*0.11);
for(let yy=0;yy<H;yy++)for(let xx=0;xx<L;xx++){
const i=yy*L+xx;
if(plein[i])continue;
const g1=(xx>0&&plein[i-1]), d1=(xx<L-1&&plein[i+1]);
const h1=(yy>0&&plein[i-L]), b1=(yy<H-1&&plein[i+L]);
if(!g1&&!d1&&!h1&&!b1)continue;
/* le voisin plein dont on reprend la teinte */
const v=b1?(i+L):(d1?(i+1):(g1?(i-1):(i-L)));
/* bas et droite : le côté à l'ombre. haut et gauche : la lumière. */
const ombre=b1||g1;                 /* (le voisin plein est en bas ou à gauche
                                       veut dire qu'on borde son flanc droit) */
const sombre=lum(v)<86;             /* un bord déjà sombre a besoin d'aide */
let a;
if(ombre)a=228;                     /* le contour franc */
else if(sombre)a=150;               /* le contour discret, pour décoller du fond */
else continue;                      /* la lumière mange le bord : rien du tout */
/* le coin inférieur droit, là où deux ombres se rejoignent : un peu plus dense */
if(b1&&g1)a=Math.min(242,a+14);
o[i*4]=Math.round(d[v*4]*0.30);
o[i*4+1]=Math.round(d[v*4+1]*0.30);
o[i*4+2]=Math.round(d[v*4+2]*0.32);
o[i*4+3]=a;}
const tmp=document.createElement('canvas');tmp.width=L;tmp.height=H;tmp.getContext('2d',{willReadFrequently:true}).putImageData(sortie,0,0);
g.drawImage(tmp,0,0);
return c;
}

/* ---------- ce qu'on expose ---------- */
try{window.Perso={sprite:sprite,poseDe:poseDe,graverFin:graverFin,
  DEF_AP:DEF_AP,PALETTES:PALETTES,CASE_L:CASE_L,CASE_H:CASE_H,
  COIFFES:COIFFES,BARBES:BARBES,CHAPEAUX:CHAPEAUX,
  COS_COMPLEXE:COS_COMPLEXE,
  geste:(v)=>{GESTE=v||{t:0};}};}catch(x){}
})();
