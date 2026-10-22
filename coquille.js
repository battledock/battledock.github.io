/* LA COQUILLE DU JEU — le balisage commun à toutes ses pages, et les
   scènes du chargement. Le balisage est posé ici, en un seul endroit,
   pour que jeu.html et ferme.html ne le recopient pas chacun de son
   côté : deux copies finissent toujours par diverger.

   Il s'insère AVANT ce script, donc avant le voile et la porte qui,
   eux, restent en clair dans la page pour s'afficher sans attendre.
   L'ordre du document est exactement celui d'avant. */
document.body.insertAdjacentHTML('afterbegin',`
<canvas id="cv"></canvas>
<div id="voileBords"></div>
<canvas id="joy" width="132" height="132"></canvas>
<div id="voyage">
  <canvas id="voyCv"></canvas>
  <div id="voyHaut"><u>EN ROUTE POUR</u><b id="voyDest">Marseille</b></div>
  <div id="voyBas"><div id="voyBarre"><i id="voyJauge"></i></div>
    <div id="voyMot">—</div></div>
</div>

<div id="annonce"><div class="carteA" id="annCarte">
  <div class="annCadre"><canvas id="annDessin"></canvas></div>
  <div class="surA" id="annSur"></div><h2 id="annTitre"></h2><p class="sousA" id="annTxt"></p>
  <div id="annPoints"></div><button id="annBtn">Continuer</button></div></div>
<div id="petanque"><div class="pqCarte">
  <button id="pqFermer" aria-label="Fermer">✕</button>
  <div class="pqTitre">LE BOULODROME · UNE MÈNE CONTRE MARIUS</div>
  <div id="pqSom"><div id="pqHaut"></div><div id="pqCri"></div></div>
  <canvas id="pqToile" width="240" height="300"></canvas>
  <div id="pqPied"><div id="pqBas"></div><div id="pqTexte"></div>
  <button id="pqBouton">Viser</button></div>
</div></div>
<div id="panorama"><div class="pqCarte">
  <button id="panoFermer" aria-label="Fermer">✕</button>
  <div class="pqTitre">LA LONGUE-VUE · MARSEILLE À TES PIEDS</div>
  <canvas id="panoToile" width="192" height="220"></canvas>
  <div id="panoTexte">Le Vieux-Port, les îles du Frioul, le château d’If.</div>
</div></div>
<div id="carnetP"><div class="feuilleC" id="feuilleC"></div></div>
<div id="catalogue" class="pcm"><div class="pcmA" lang="fr">
  <div class="pcmTete"><div class="pcmL1"><div class="pcmEns"><b>PÊCHEUR HEUREUX</b><small>CANNES · MOULINETS · APPÂTS · DEPUIS 1952</small></div><div class="pcmBourse">🪙 <span id="catArgent">—</span></div><button id="catFermer" class="pcmX" aria-label="Fermer">✕</button></div>
  <div class="pcmPat"><canvas id="pcmPatron" width="46" height="52"></canvas><div class="pcmBulle" id="pcmBulle">—</div></div></div>
  <div class="pcmFilet"></div>
  <div id="catPages"></div>
</div></div>
<div id="enLigne"><div class="carte" id="carteL"></div></div>
<div id="haut">
  <span class="plaq" id="hPlaque" role="button" aria-label="Mon niveau">
    <span class="por"><img id="hTete" alt=""><span class="niv" id="hNiv">1</span></span>
    <span class="idt"><b id="hNom">—</b><small id="hTitre">MARIN</small><span class="xp" id="hXp"></span></span>
  </span>
  <span class="sep"></span>
  <span class="colD">
  <span class="pil" id="pilJetons">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges"><circle cx="10" cy="9" r="7" fill="#b4302c"/><circle cx="10" cy="9" r="4" fill="#f4e4b8"/><rect x="2" y="8" width="3" height="2" fill="#f4e4b8"/><rect x="15" y="8" width="3" height="2" fill="#f4e4b8"/></svg>
    <b id="hJetons">0</b>
  </span>
  <span class="pil">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges"><circle cx="10" cy="9" r="7" fill="#e8c06a"/><circle cx="10" cy="9" r="5" fill="#f4d98a"/><rect x="9" y="5" width="2" height="8" fill="#8a6a2a"/></svg>
    <b id="hArgent">0,00 €</b>
  </span>
  <span class="pil pSac">
    <span class="enc" id="hEnc"><i></i><i></i><i></i><i></i><i></i></span>
    <b id="hSac">0<em>/60</em></b>
  </span>
  </span>
</div>


<div id="hGlace" hidden></div>
<div id="nivPop"></div>
<div id="nivGagne"></div>
<div id="fil"></div>
<div id="repond"></div>
<div class="onde" id="onde"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
<div id="bandeau">
  <div class="suggest" id="suggest"></div>
  <div class="ligne">
    <button id="micro" aria-label="Dicter"><svg viewBox="0 0 20 20" width="20">
      <rect x="7" y="2" width="6" height="10" rx="3" fill="currentColor"/>
      <path d="M4.5 9.5 a5.5 5.5 0 0 0 11 0" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <rect x="9" y="15" width="2" height="3" fill="currentColor"/>
      <rect x="6.5" y="17.4" width="7" height="1.8" rx=".9" fill="currentColor"/></svg></button>
    
    <span class="champ">
      <input id="saisie" maxlength="48" placeholder="Appuie pour écrire…" autocomplete="off">
      <i class="compteB" id="resteC">48</i>
    </span>
    <button id="envoyer">Dire</button>
  </div>
</div>
<div id="barre">
  <div id="tiroir">
<button class="latte" id="b-courrier"><em class="pastille" id="co-nb">0</em><svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="2" y="3" width="16" height="12" fill="#efe6cc"/><rect x="2" y="3" width="16" height="12" fill="none" stroke="#8a6a3a" stroke-width="1"/><rect x="2" y="3" width="16" height="2" fill="#d8cba8"/><rect x="3" y="4" width="7" height="5" fill="#b9a57c"/><rect x="10" y="4" width="7" height="5" fill="#b9a57c"/><rect x="13" y="10" width="4" height="4" fill="#b4302c"/></svg><span class="b">Courrier</span><em class="pastille" id="po-nb">0</em></button>
<button class="latte" id="b-carnet">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="3" y="2" width="14" height="14" fill="#6b4a2c"/><rect x="5" y="3" width="11" height="12" fill="#efe6cc"/><rect x="3" y="2" width="2" height="14" fill="#4f3520"/><rect x="7" y="6" width="7" height="1" fill="#b9a57c"/><rect x="7" y="9" width="5" height="1" fill="#b9a57c"/><rect x="7" y="12" width="6" height="1" fill="#b9a57c"/><rect x="13" y="2" width="2" height="6" fill="#b4302c"/></svg>
    <span class="b">Carnet</span><i class="clou g"></i><i class="clou d"></i></button>
<button class="latte" id="b-encours">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="5" y="2" width="10" height="2" fill="#c9a24a"/><rect x="5" y="14" width="10" height="2" fill="#c9a24a"/><rect x="7" y="4" width="6" height="4" fill="#efe6cc"/><rect x="9" y="8" width="2" height="2" fill="#efe6cc"/><rect x="7" y="10" width="6" height="4" fill="#efe6cc"/><rect x="8" y="5" width="4" height="3" fill="#e8c06a"/><rect x="8" y="12" width="4" height="2" fill="#e8c06a"/><rect x="9" y="9" width="2" height="1" fill="#e8c06a"/></svg><span class="b">En cours</span>
    <i class="clou g"></i><i class="clou d"></i></button>




<button class="latte" id="b-vestiaire">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="9" y="1" width="2" height="3" fill="#c9c2ae"/><rect x="4" y="5" width="12" height="2" fill="#c9c2ae"/><rect x="3" y="7" width="3" height="4" fill="#8f2a20"/><rect x="14" y="7" width="3" height="4" fill="#8f2a20"/><rect x="5" y="7" width="10" height="9" fill="#b93327"/><rect x="5" y="7" width="10" height="2" fill="#d8483a"/><rect x="8" y="7" width="4" height="2" fill="#efe6cc"/></svg><span class="b">Vestiaire</span>
    <i class="clou g"></i><i class="clou d"></i></button>
<button class="latte" id="b-emotes">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="4" y="2" width="12" height="14" fill="#e8c06a"/><rect x="3" y="4" width="14" height="10" fill="#e8c06a"/><rect x="6" y="6" width="2" height="2" fill="#3a2408"/><rect x="12" y="6" width="2" height="2" fill="#3a2408"/><rect x="6" y="10" width="8" height="2" fill="#3a2408"/><rect x="7" y="12" width="6" height="1" fill="#c8503a"/><rect x="5" y="3" width="4" height="2" fill="#fff4c0"/></svg><span class="b">Émotes</span>
    <i class="clou g"></i><i class="clou d"></i></button>
<button class="latte" id="b-aide">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="9" y="10" width="2" height="7" fill="#6b4a2c"/><rect x="3" y="1" width="14" height="10" fill="#efe6cc"/><rect x="3" y="1" width="14" height="1" fill="#fbf5e4"/><rect x="3" y="10" width="14" height="1" fill="#b9a57c"/><rect x="8" y="3" width="4" height="1" fill="#b4302c"/><rect x="11" y="4" width="1" height="2" fill="#b4302c"/><rect x="9" y="6" width="2" height="1" fill="#b4302c"/><rect x="9" y="7" width="1" height="1" fill="#b4302c"/><rect x="9" y="9" width="1" height="1" fill="#b4302c"/></svg><span class="b">Aide</span>
    <i class="clou g"></i><i class="clou d"></i></button>
<div class="tbas"><button class="latte" id="b-reglages">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="2" y="4" width="16" height="2" fill="#c9a24a"/><rect x="2" y="12" width="16" height="2" fill="#c9a24a"/><rect x="12" y="2" width="3" height="6" fill="#e8c06a"/><rect x="12" y="2" width="3" height="1" fill="#f4d98a"/><rect x="5" y="10" width="3" height="6" fill="#e8c06a"/><rect x="5" y="10" width="3" height="1" fill="#f4d98a"/></svg><span class="b">Réglages</span></button></div>
  <button class="latte" id="b-sac">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="7" y="1" width="6" height="3" fill="#8a6a3a"/><rect x="8" y="2" width="4" height="2" fill="#15212e"/><rect x="3" y="4" width="14" height="12" fill="#8a5a2e"/><rect x="3" y="4" width="14" height="2" fill="#a8743e"/><rect x="3" y="9" width="14" height="2" fill="#6b4525"/><rect x="8" y="11" width="4" height="4" fill="#c9a24a"/><rect x="9" y="12" width="2" height="2" fill="#6b4525"/></svg><span class="b">Sac</span>
    <i class="clou g"></i><i class="clou d"></i></button>
  <button class="latte parch" id="b-class">
    <svg viewBox="0 0 20 18" shape-rendering="crispEdges" width="30"><rect x="2" y="15" width="16" height="2" fill="#6b4a2c"/><rect x="8" y="4" width="5" height="11" fill="#e8c06a"/><rect x="8" y="4" width="5" height="2" fill="#f4d98a"/><rect x="3" y="8" width="5" height="7" fill="#c4ced6"/><rect x="3" y="8" width="5" height="2" fill="#dde4ea"/><rect x="13" y="10" width="5" height="5" fill="#d2a271"/><rect x="13" y="10" width="5" height="2" fill="#e3bb90"/></svg><span class="b">Classement</span>
    <i class="clou g"></i><i class="clou d"></i></button>
  </div>
  <div id="rencontre">
    <span class="quiR" id="quiR">—</span>
    <button id="r-ecrire"><svg viewBox="0 0 20 20" width="16">
      <path d="M3 4 h14 v9 h-8 l-4 3 v-3 h-2z" fill="none" stroke="currentColor"
        stroke-width="1.6" stroke-linejoin="round"/></svg>Écrire
      <em class="pastille" id="rencontre-nb">0</em></button>
    
  </div>
  <button id="action"></button>
  <button id="b-plus" aria-label="Le menu"><span class="pts"><i></i><i></i><i></i></span><span class="mot">Menu</span>
    <em class="pastille" id="plus-nb">0</em></button>
</div>

<!-- le vieux bouton d'apparence a été retiré : il était masqué et plus
     branché à rien depuis la refonte du menu -->

<div id="pan"><div class="feuille" id="feuille"></div></div>
<div id="page2"><div class="sacFond" id="page2Fond"></div></div>
`);


/* ================= LES SCÈNES DU CHARGEMENT =================
   Un script ordinaire, pas un module : il doit tourner tout de suite,
   avant que le jeu commence à se lire. Tout est peint à la main dans une
   toile de 130 pixels de large, puis étirée par le navigateur — aucune
   image n'est téléchargée, l'écran est complet dès la première ligne. */
(function(){
var cv=document.getElementById('vPre');if(!cv)return;
var g=cv.getContext('2d');if(!g)return;
var W=130,H=116;
g.imageSmoothingEnabled=false;
function al(n){var v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);}
function R(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),
  Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function bande(y0,y1,T){for(var y=y0;y<y1;y++){var k=(y-y0)/(y1-y0);
  var t=k*(T.length-1),i=Math.min(T.length-2,Math.floor(t)),f=t-i,m=[];
  for(var j=0;j<3;j++)m.push(Math.round(T[i][j]+(T[i+1][j]-T[i][j])*f));
  R(0,y,W,1,'rgb('+m[0]+','+m[1]+','+m[2]+')');}}
function houppier(x,y,l,h,col,gr){for(var i=0;i<16;i++){
  var a=al(gr+i*1.7)*6.2832,r=al(gr+i*2.9);
  R(x+Math.cos(a)*l*0.5*r-l*0.22,y+Math.sin(a)*h*0.5*r-h*0.16,l*0.44,h*0.32,col);}}

var LIEUX={
/* ---------- LA FORÊT · LA CANOPÉE ----------
   On regarde en l'air. Le ciel est clair, les feuilles presque noires :
   c'est ce contraste-là qui fait lire le contre-jour, pas la forme des
   feuilles. Les branches partent des bords et se ramifient toutes seules. */
foret:{nom:'La forêt',dit:'Le soleil passe entre les feuilles',
 f:'#0c1310',o:'#d8c06a',t:'#f2ecd8',d:'#8a9a6a',
 p:function(){
  bande(0,H,[[188,208,206],[214,228,218],[236,242,224],[216,226,206],[180,198,184]]);
  for(var r=64;r>14;r-=4){g.fillStyle='rgba(255,252,220,'+(0.014+(64-r)*0.0012)+')';
   g.beginPath();g.arc(W*0.44,H*0.38,r,0,7);g.fill();}
  function feuille(x,y,s,col){for(var i=0;i<9;i++){
   var a=al(x*3.1+y*1.7+i)*6.2832,rr=al(x+y+i*2.3)*s;
   R(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.8,1+al(i)*2,1+al(i*3)*2,col);}}
  function branche(x0,y0,a0,lg,ep,col,gr){
   var x=x0,y=y0,a=a0;
   for(var t=0;t<lg;t++){
    a+=(al(gr+t*0.9)-0.5)*0.14;x+=Math.cos(a);y+=Math.sin(a);
    var e=Math.max(1,ep*(1-t/lg));
    R(x-e/2,y-e/2,e,e,col);
    if(t%5===2)feuille(x,y,3+(1-t/lg)*7,col);
    if(t%17===9&&t<lg-14)branche(x,y,a+(al(gr+t)<0.5?0.8:-0.8),
      Math.round((lg-t)*0.5),e*0.7,col,gr+t*3);}}
  var S=[[0,0,0.80],[W,0,2.35],[0,H,-0.80],[W,H,3.94],
         [W*0.26,0,1.25],[W*0.74,0,1.90],[0,H*0.44,0.12],[W,H*0.62,3.02]];
  for(var i=0;i<S.length;i++){
   branche(S[i][0],S[i][1],S[i][2],42+al(i)*22,4,'#16200f',i*23);
   branche(S[i][0],S[i][1],S[i][2]+(i%2?0.45:-0.45),28+al(i*3)*16,3,'#223018',i*41);}
  for(var k=0;k<5;k++){g.save();g.translate(W*0.44,H*0.38);g.rotate(0.55+k*0.3);
   g.fillStyle='rgba(255,252,214,'+(k%2?0.05:0.085)+')';
   g.beginPath();g.moveTo(-3,0);g.lineTo(3,0);g.lineTo(14,H);g.lineTo(-14,H);
   g.closePath();g.fill();g.restore();}
  var FE=['#3f6b2c','#5e8a34','#c2a84a'];
  for(var j=0;j<14;j++)R(al(j*4.3)*W,al(j*6.1)*H,2,1,FE[j%3]);
 }},
/* ---------- LA FERME ---------- */
ferme:{nom:'La ferme',dit:'Le blé n’attend pas',
 f:'#1a1c10',o:'#e8c06a',t:'#f6ecd4',d:'#9a9a72',
 p:function(){
  bande(0,H*0.46,[[58,52,74],[128,86,84],[206,132,88],[238,180,110]]);
  for(var i=0;i<30;i++)R(al(i*1.7)*W,al(i*2.9)*H*0.2,1,1,'rgba(255,240,200,.5)');
  g.fillStyle='#ffe0a0';g.beginPath();g.arc(W*0.72,H*0.44,10,0,7);g.fill();
  for(var r=18;r>10;r--){g.fillStyle='rgba(255,210,130,'+(0.03*(19-r))+')';
   g.beginPath();g.arc(W*0.72,H*0.44,r,0,7);g.fill();}
  for(var x=0;x<W;x++){var y=H*0.44+Math.sin(x/19)*3+Math.sin(x/7)*1.5;
   R(x,y,1,H*0.47-y,'#5c5a36');}
  R(10,H*0.33,30,16,'#7d3a2a');R(8,H*0.30,34,4,'#5e2a1e');
  R(20,H*0.40,8,9,'#3a2418');R(10,H*0.33,30,1,'#a8513a');
  var TON=[['#6e6326','#8a7c30'],['#7d7029','#9c8c36'],
           ['#8a7c30','#ab9a3e'],['#9c8c36','#bdab48']];
  for(var k=0;k<11;k++){
   var yy=H*0.47+k*k*0.75+k*2.2;if(yy>H*0.92)break;
   var ht=3+k*1.1,pas=2.2+k*0.42,T=TON[Math.min(3,k>>1)];
   for(var xx=-4;xx<W+4;xx+=pas){
    var jj=al(xx*1.7+k*9),px=xx+jj*1.4;
    R(px,yy-ht,1,ht,jj<0.5?T[0]:'#5e5520');
    R(px-0.5,yy-ht-2,2,2.5,jj<0.6?T[1]:T[0]);
    if(jj>0.86)R(px-1,yy-ht-3,3,1,'#cfbd54');}
   R(0,yy,W,1,'rgba(38,32,12,.20)');}
  for(var xf=4;xf<W;xf+=16)R(xf,H*0.80,3,14,'#4a3218');
  R(0,H*0.83,W,2,'#5e4426');R(0,H*0.88,W,2,'#5e4426');
  var OI=[[W*0.3,H*0.14],[W*0.38,H*0.10]];
  for(var o=0;o<2;o++){R(OI[o][0],OI[o][1],2,1,'#2a2418');
   R(OI[o][0]+2,OI[o][1]-1,2,1,'#2a2418');R(OI[o][0]+4,OI[o][1],2,1,'#2a2418');}
 }},
/* ---------- LE PORT ---------- */
port:{nom:'Le port',dit:'Le ferry siffle au loin',
 f:'#0d1420',o:'#e8c06a',t:'#f0e6cf',d:'#7d93ac',
 p:function(){
  bande(0,H*0.52,[[26,40,66],[46,66,96],[92,96,116],[168,118,100],[228,162,112]]);
  for(var i=0;i<34;i++)R(al(i*1.7)*W,al(i*2.9)*H*0.22,1,1,'rgba(226,236,255,.45)');
  for(var x=0;x<W;){var w=9+Math.floor(al(x*0.7)*14),h=16+Math.floor(al(x*1.3)*22);
   R(x,H*0.52-h,w,h,'#1a2334');
   for(var fy=H*0.52-h+3;fy<H*0.52-3;fy+=5)
    for(var fx=x+2;fx<x+w-2;fx+=4)
     if(al(fx*3.1+fy)<0.34)R(fx,fy,2,2,'rgba(246,216,140,.6)');
   x+=w;}
  for(var m=0;m<7;m++){var mx=12+m*W/7+al(m)*8,mh=18+al(m*3)*22;
   R(mx,H*0.52-mh,1,mh,'#3a4a5e');R(mx-3,H*0.52-mh,7,1,'#3a4a5e');}
  R(0,H*0.52,W,5,'#b8a888');R(0,H*0.52,W,1,'#d8cbaa');
  bande(H*0.57,H,[[24,62,86],[30,74,98],[22,56,78],[16,42,60]]);
  for(var v=0;v<260;v++){var vx=al(v*1.9)*W,vy=H*0.57+al(v*3.7)*H*0.43;
   R(vx,vy,3+al(v)*7,1,al(v*5)<0.5?'rgba(255,255,255,.12)':'rgba(0,0,0,.10)');}
  for(var q=0;q<40;q++)R(al(q*2.3)*W,H*0.58+al(q*4.1)*H*0.2,2,1,'rgba(246,216,140,.22)');
  R(W*0.6,H*0.76,22,3,'#5b3f21');R(W*0.6+2,H*0.73,18,3,'#7d5934');
  R(W*0.6+10,H*0.66,1,7,'#3a2a18');
  var MO=[[W*0.22,H*0.16],[W*0.3,H*0.12]];
  for(var b=0;b<2;b++){R(MO[b][0],MO[b][1],3,1,'#f2efe4');
   R(MO[b][0]+3,MO[b][1]-1,2,1,'#f2efe4');R(MO[b][0]+5,MO[b][1],3,1,'#f2efe4');}
 }},
/* ---------- NOTRE-DAME DE LA GARDE ---------- */
garde:{nom:'La Garde',dit:'La Bonne Mère veille',
 f:'#101420',o:'#e8c06a',t:'#f0e6cf',d:'#8a93a8',
 p:function(){
  bande(0,H*0.62,[[22,32,58],[40,56,84],[86,92,108],[170,124,102],[232,170,116]]);
  for(var i=0;i<40;i++)R(al(i*1.7)*W,al(i*2.9)*H*0.26,1,1,'rgba(226,236,255,.5)');
  for(var x=0;x<W;x++){var y=H*0.62-Math.pow(Math.max(0,1-Math.abs(x-W*0.5)/(W*0.5)),1.7)*H*0.3;
   R(x,y,1,H-y,'#1d2433');}
  R(W*0.46,H*0.24,9,H*0.14,'#2e3648');R(W*0.46,H*0.24,9,1,'#4a5468');
  R(W*0.47,H*0.16,7,H*0.08,'#333c50');
  R(W*0.485,H*0.11,2,H*0.05,'#8a6a28');
  g.fillStyle='#f0cf7d';g.beginPath();g.arc(W*0.495,H*0.10,2.4,0,7);g.fill();
  for(var r=16;r>4;r-=2){g.fillStyle='rgba(255,220,140,'+(0.02+(16-r)*0.006)+')';
   g.beginPath();g.arc(W*0.495,H*0.10,r,0,7);g.fill();}
  for(var k=0;k<40;k++){var lx=al(k*3.7)*W,ly=H*0.66+al(k*5.1)*H*0.3;
   R(lx,ly,1,1,'rgba(246,216,140,.6)');}
  bande(H*0.84,H,[[18,38,54],[24,50,70],[16,34,48]]);
 }},
/* ---------- LE REPLI, quand on ne sait pas où l'on va ---------- */
/* ---------- TOKYO · DRIFT CITY ----------
   Plein écran, en hauteur : la piste de nuit qui tourne, ses vibreurs, la
   ligne d'arrivée, une voiture rose en travers dans sa fumée, ses phares. */
tokyo:{nom:'Tokyo',dit:'La ville du fun',
 f:'#0d0e12',o:'#ff4fb0',t:'#ffffff',d:'#ffcc33',
 p:function(){
  R(0,0,W,H,'#16171c');for(var i=0;i<500;i++)R(al(i*1.3)*W,al(i*2.7)*H,1,1,'rgba(255,255,255,.04)');
  g.strokeStyle='#26272e';g.lineWidth=46;g.beginPath();g.moveTo(-10,250);g.quadraticCurveTo(120,250,110,120);g.quadraticCurveTo(100,40,140,20);g.stroke();
  g.lineWidth=4;g.setLineDash([5,5]);g.strokeStyle='#e0263a';g.beginPath();g.moveTo(-10,228);g.quadraticCurveTo(98,228,88,120);g.quadraticCurveTo(80,50,120,8);g.stroke();
  g.strokeStyle='#f4f2f6';g.lineDashOffset=5;g.stroke();g.setLineDash([]);
  for(var yy=0;yy<3;yy++)for(var xx=0;xx<10;xx++)R(90+xx*4.4,150+yy*3,4.4,3,(xx+yy)%2?'#f4f2f6':'#101014');
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;[-4,4].forEach(function(o){g.beginPath();g.moveTo(20,256+o);g.quadraticCurveTo(80,250+o,96,200+o*0.4);g.stroke();});
  for(var k=0;k<26;k++){var t=k/26;g.fillStyle='rgba(220,220,230,'+(0.25*(1-t))+')';g.beginPath();g.arc(70+t*30+al(k)*6,246-t*40+al(k*2)*6,4+t*8,0,7);g.fill();}
  g.fillStyle='rgba(255,246,192,.12)';g.beginPath();g.moveTo(104,184);g.lineTo(96,120);g.lineTo(130,140);g.fill();
  g.save();g.translate(100,196);g.rotate(-1.2);
  [[-9,-7],[5,-7],[-9,5.6],[5,5.6]].forEach(function(r){R(r[0],r[1],4.5,1.6,'#0b0b10');});    /* les pneus */
  g.fillStyle='#ff4fb0';g.beginPath();g.moveTo(-12,-5.4);g.lineTo(9,-5.8);g.quadraticCurveTo(13,-5,13,0);g.quadraticCurveTo(13,5,9,5.8);g.lineTo(-12,5.4);g.closePath();g.fill();
  g.fillStyle='#ff8ac8';g.fillRect(-11,-5.4,19,1.2);g.fillStyle='#c0257a';g.fillRect(-11,4.3,19,1.1);   /* lumière et ombre de la caisse */
  g.fillStyle='#1c1e26';g.beginPath();g.moveTo(-5,-4.2);g.lineTo(3,-4.4);g.lineTo(5.5,-3.4);g.lineTo(5.5,3.4);g.lineTo(3,4.4);g.lineTo(-5,4.2);g.closePath();g.fill();
  g.fillStyle='#4a6a8a';g.fillRect(3.4,-3.2,1.6,6.4);g.fillStyle='#ff4fb0';g.fillRect(-3,-3.4,5,6.8);       /* pare-brise et toit */
  R(-14,-6,2,12,'#2a2c33');R(-14,-6,2,1,'#ff8ac8');                                                   /* l'aileron */
  R(11.5,-4.6,1.4,2.4,'#fff6c0');R(11.5,2.2,1.4,2.4,'#fff6c0');R(-12.4,-4.6,1,2.2,'#ff3030');R(-12.4,2.4,1,2.2,'#ff3030');
  g.restore();
 }},
rien:{nom:'Battle Dock',dit:'On ouvre la porte',
 f:'#0d1410',o:'#c9a24a',t:'#f0e6cf',d:'#8a9a7a',
 p:function(){
  bande(0,H,[[18,26,22],[26,36,28],[20,28,22],[13,18,15]]);
  for(var i=0;i<60;i++)R(al(i*1.7)*W,al(i*2.9)*H,1,1,'rgba(200,220,190,.10)');
 }}};

/* OÙ VA-T-ON ? L'adresse d'abord, la sauvegarde ensuite. */
var c='';
try{c=window.CARTE_PAGE||new URLSearchParams(location.search).get('carte')||'';}catch(e){}
if(!c){try{c=(JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}').carte)||'';}catch(e){}}
var cle = c==='foret' ? 'foret'
        : (c==='ferme'||c==='village') ? 'ferme'
        : c==='garde' ? 'garde'
        : c==='tokyo' ? 'tokyo'
        : c==='extramar' ? 'port'
        : 'rien';
var L=LIEUX[cle]||LIEUX.rien;
/* TOKYO PREND TOUT L'ÉCRAN : une toile en hauteur au lieu de la bande du milieu */
/* ET NETTE : la scène est dessinée à la résolution de l'écran (pixels réels du
   téléphone), pas dans une petite toile étirée — l'étirement rendait la piste,
   la fumée et la voiture floues. Les coordonnées restent celles de 130 × 281. */
if(cle==='tokyo'){var dpr=Math.min(3,window.devicePixelRatio||1),VW=innerWidth,VH=innerHeight;
 cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);H=281;
 var sc=Math.max(cv.width/130,cv.height/281);
 g.setTransform(sc,0,0,sc,(cv.width-130*sc)/2,(cv.height-281*sc)/2);g.imageSmoothingEnabled=true;
 R=function(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,Math.max(1/sc,w),Math.max(1/sc,h));};}
try{L.p();}catch(e){}
var v=document.getElementById('voile');
if(v){v.style.setProperty('--vf',L.f);v.style.setProperty('--vo',L.o);
 v.style.setProperty('--vt',L.t);v.style.setProperty('--vd',L.d);}
var n=document.getElementById('vLieu');if(n)n.textContent=L.nom;
var d=document.getElementById('vDit');if(d)d.textContent=L.dit;
if(cle==='tokyo'&&v){
 v.classList.add('tk');
 var hh=v.querySelector('.vHaut');if(hh)hh.innerHTML='<div class="tkT">TOKYO<br><span>DRIFT</span> CITY</div><div class="tkD">東京 · LA VILLE DU FUN</div>';
 var bb=v.querySelector('.vBas');
 if(bb){var ta=document.createElement('div');ta.className='tkTach';
  var h2='';for(var q=0;q<12;q++)h2+='<i data-q="'+q+'" style="height:'+(10+q*2.6)+'px"></i>';
  ta.innerHTML='<div class="tkCt">'+h2+'</div><span class="tkRap" id="tkRap">N</span>';bb.insertBefore(ta,bb.firstChild);}
 for(var pe=0;pe<14;pe++){var p2=document.createElement('i');p2.className='tkPet';p2.style.left=(al(pe*3.1)*100)+'%';
  p2.style.animationDuration=(7+al(pe*5)*7).toFixed(1)+'s';p2.style.animationDelay='-'+(al(pe*9)*10).toFixed(1)+'s';v.appendChild(p2);}
 /* LE COMPTE-TOURS SUIT LA JAUGE du chargement : douze barres, puis le rapport */
 (function suivre(){var j=document.getElementById('vJauge');if(!j||!document.getElementById('tkRap'))return;
  var pc=parseFloat(j.style.width)||4, n=Math.round(pc/100*12);
  var bs=v.querySelectorAll('.tkCt i');for(var q2=0;q2<bs.length;q2++){var on=q2<n;bs[q2].className=on?(q2>=10?'on r':q2>=7?'on j':'on'):'';}
  document.getElementById('tkRap').textContent=pc>=99?'6':(pc<8?'N':String(Math.min(5,1+Math.floor(pc/20))));
  if(!v.classList.contains('parti'))setTimeout(suivre,120);})();
}

/* LA FERME PREND TOUT L'ÉCRAN : le lever du jour, dessiné en pixels à la taille de l'écran.
   Tout est posé sur une grille — un « pixel » vaut U points, et U grandit avec l'écran,
   si bien que le dessin reste franc du téléphone à la tablette, debout comme couché. */
if(cle==='ferme'&&v){
 (function(){
function Pix(g,U){return function(x,y,w,h,c){if(w<=0||h<=0)return;g.fillStyle=c;
  g.fillRect(Math.round(x)*U,Math.round(y)*U,Math.max(1,Math.round(w))*U,Math.max(1,Math.round(h))*U);};}
function ciel(P,Wu,hz){
  var B=['#3f4f8e','#5b63a0','#8d6fa4','#c0749a','#e08a76','#f0a868','#ffc484','#ffdca8'];
  for(var i=0;i<B.length;i++){var y0=Math.round(hz*i/B.length),y1=Math.round(hz*(i+1)/B.length);
    P(0,y0,Wu,y1-y0,B[i]);
    if(i){for(var x=0;x<Wu;x++)if(al(x*3.1+i*7)<0.42)P(x,y0,1,1,B[i-1]);}   /* le bord des bandes se mélange */
  }}
function soleil(P,cx,cy,r){
  for(var k=3;k>=1;k--){var rr=r+k*Math.max(1,Math.round(r*0.5)),a=[0.10,0.18,0.30][k-1];
    disque(P,cx,cy,rr,'rgba(255,214,140,'+a+')');}
  disque(P,cx,cy,r,'#ffe49a');disque(P,cx,cy,r-Math.max(1,Math.round(r*0.3)),'#fff6d8');}
function disque(P,cx,cy,r,c){for(var y=-r;y<=r;y++){var w=Math.round(Math.sqrt(Math.max(0,r*r-y*y)));
  if(w>0)P(cx-w,cy+y,w*2,1,c);}}
function nuage(P,x,y,s,c){var f=[[0,1,4,1],[1,0,3,1],[-1,2,7,1],[0,3,5,1]];
  for(var i=0;i<f.length;i++)P(x+f[i][0]*s,y+f[i][1]*s,f[i][2]*s,f[i][3]*s,c);}
function collines(P,Wu,hz){
  var pas=Math.max(2,Math.round(Wu/22));
  for(var c=0;c<2;c++){var col=c?'#5f8440':'#8a9a6a',amp=c?2:3,base=hz+(c?1:-1);
    for(var x=0;x<Wu;x+=pas){var h=Math.round(Math.sin((x/Wu)*(c?7:5)+c*2)*amp);
      P(x,base-h,pas,hz+6-(base-h),col);
      if(!c)P(x,base-h,pas,1,'#9aaa7a');}}}
function longere(P,x,sol,s){
  /* la maison de la ferme : murs chaulés, toit de tuiles, volets bleus */
  P(x-5*s,sol-4*s,10*s,4*s,'#f2ebdb');P(x-5*s,sol-4*s,10*s,s,'#fbf6ea');
  P(x-5*s,sol-s,10*s,s,'#d8ccb2');
  for(var r=0;r<3;r++){var w=10*s+ (2-r)*s;P(x-w/2,sol-(5+r)*s,w,s,r%2?'#b85e3a':'#c86e46');}
  P(x-6*s,sol-5*s,12*s,s,'#7e3e24');
  P(x-s,sol-3*s,2*s,3*s,'#6a4222');P(x-s,sol-3*s,2*s,s,'#8a5a30');
  P(x-4*s,sol-3*s,2*s,2*s,'#3a7ab4');P(x+2*s,sol-3*s,2*s,2*s,'#3a7ab4');
  P(x-4*s,sol-3*s,2*s,s*0.5,'#5a9ad4');P(x+2*s,sol-3*s,2*s,s*0.5,'#5a9ad4');
  P(x+3*s,sol-8*s,2*s,3*s,'#e2d7bf');P(x+3*s,sol-8*s,2*s,s,'#b85e3a');}
function moulin(P,x,sol,s,t){
  P(x-2*s,sol-9*s,4*s,9*s,'#efe6d2');P(x-2*s,sol-9*s,s,9*s,'#fbf6ea');
  P(x-3*s,sol-10*s,6*s,s,'#8a5a30');
  for(var k=0;k<4;k++){var a=t+k*Math.PI/2,L=6*s;
    for(var q=1;q<=L;q++){var px=x+Math.cos(a)*q,py=sol-9*s+Math.sin(a)*q;P(px,py,s,s,q>L*0.35?'#efe6d2':'#8a5a30');}}
  P(x-s,sol-10*s,2*s,s,'#6a4222');}
function cloture(P,Wu,y,s){
  for(var x=0;x<Wu;x+=3*s){P(x,y-3*s,s,3*s,'#8a5a30');P(x,y-3*s,s*0.4,3*s,'#a5764a');}
  P(0,y-2.6*s,Wu,s*0.6,'#7a5232');P(0,y-1.4*s,Wu,s*0.6,'#7a5232');}
function epi(P,x,y,h,gros,clair){
  P(x,y-h,gros,h,clair?'#9aa84a':'#86973e');
  for(var k=0;k<4;k++){P(x-gros,y-h-(k+1)*gros,gros*3,gros,clair?'#f0d070':'#d4ab48');}
  P(x,y-h-5*gros,gros,gros,clair?'#fff0a8':'#e8c860');}
function champ(P,Wu,Hu,hz,serre){
  var n=serre?9:13;
  P(0,hz-1,Wu,Hu-hz+2,'#b08a52');   /* la terre sous les rangs, sinon le fond reste nu */
  for(var k=0;k<n;k++){var t=k/(n-1),y=hz+Math.round(Math.pow(t,serre?1.3:1.8)*(Hu-hz)),
      g2=Math.max(1,Math.round(1+t*(serre?5:3))),pas=Math.max(2,Math.round(3+t*(serre?16:11)));
    P(0,y,Wu,Math.max(1,Math.round(g2*0.7)),k%2?'#9a7442':'#a8824e');
    for(var x=-pas;x<Wu+pas;x+=pas){var j=al(x*1.7+k*9);
      epi(P,x+Math.round(j*g2),y,Math.round(g2*1.8),g2,j<0.5);}}}
function poule(P,x,sol,s,rousse){
  var c=rousse?'#c8763a':'#fbf6ec',o=rousse?'#a85a28':'#e2d6c2';
  P(x-3*s,sol-s,2*s,s,'#e8a030');P(x+s,sol-s,2*s,s,'#e8a030');
  P(x-3*s,sol-4*s,7*s,3*s,c);P(x-3*s,sol-2*s,7*s,s,o);
  P(x+3*s,sol-6*s,3*s,3*s,c);P(x+4*s,sol-7*s,s,s,'#d8382a');
  P(x+6*s,sol-5*s,2*s,s,'#f0a020');P(x+4*s,sol-6*s,s,s,'#1a1208');
  P(x-5*s,sol-5*s,2*s,2*s,c);}
function epouvantail(P,x,sol,s){
  P(x-s/2,sol-10*s,s,10*s,'#8a6238');P(x-4*s,sol-8*s,8*s,s,'#8a6238');
  P(x-3*s,sol-8*s,6*s,4*s,'#c8503a');P(x-3*s,sol-8*s,6*s,s,'#e8705a');
  for(var k=0;k<4;k++){P(x-4*s-k*s,sol-7*s+k*s,2*s,s,'#e8c860');P(x+3*s+k*s,sol-7*s+k*s,2*s,s,'#e8c860');}
  P(x-2*s,sol-13*s,4*s,3*s,'#e8dcc0');P(x-s,sol-12*s,s,s,'#2a1a10');P(x+s,sol-12*s,s,s,'#2a1a10');
  P(x-4*s,sol-14*s,8*s,s,'#8a5a30');P(x-3*s,sol-16*s,6*s,2*s,'#8a5a30');}
function oiseaux(P,Wu,Hu,s){
  for(var b=0;b<4;b++){var x=Math.round(Wu*(0.28+b*0.09)),y=Math.round(Hu*(0.14+al(b)*0.08));
    P(x-2*s,y,s,s,'#3a2a2a');P(x-s,y-s,s,s,'#3a2a2a');P(x,y,s,s,'#3a2a2a');P(x+s,y-s,s,s,'#3a2a2a');P(x+2*s,y,s,s,'#3a2a2a');}}
function sceneFerme(g,W,H){
  var U=Math.max(2,Math.round(Math.min(W,H)/170)),Wu=Math.ceil(W/U),Hu=Math.ceil(H/U),P=Pix(g,U);
  var pay=W>H*1.3, hz=Math.round(Hu*(pay?0.44:0.50)), s=Math.max(1,Math.round(Hu/52));
  ciel(P,Wu,hz);
  soleil(P,Math.round(Wu*0.74),hz-Math.round(Hu*0.05),Math.max(3,Math.round(Math.min(Wu,Hu)*0.055)));
  nuage(P,Math.round(Wu*0.10),Math.round(Hu*0.11),Math.max(1,Math.round(s*0.8)),'rgba(255,238,220,.70)');
  nuage(P,Math.round(Wu*0.62),Math.round(Hu*0.07),Math.max(1,Math.round(s*0.6)),'rgba(255,238,220,.55)');
  oiseaux(P,Wu,Hu,Math.max(1,Math.round(s*0.35)));
  collines(P,Wu,hz);
  longere(P,Math.round(Wu*0.26),hz+1,s);
  moulin(P,Math.round(Wu*0.62),hz+1,Math.max(1,Math.round(s*0.8)),0.6);
  cloture(P,Wu,hz+Math.round(s*1.6),Math.max(1,Math.round(s*0.6)));
  champ(P,Wu,Hu,hz+Math.round(s*2),false);
  epouvantail(P,Math.round(Wu*0.18),Math.round(hz+(Hu-hz)*0.42),Math.max(1,Math.round(s*0.55)));
  poule(P,Math.round(Wu*0.74),Math.round(hz+(Hu-hz)*0.52),Math.max(1,Math.round(s*0.35)),true);
  poule(P,Math.round(Wu*0.86),Math.round(hz+(Hu-hz)*0.60),Math.max(1,Math.round(s*0.38)),false);
  var lg=g.createLinearGradient(0,hz*U,0,H);lg.addColorStop(0,'rgba(255,200,120,.20)');lg.addColorStop(1,'rgba(70,46,10,.26)');
  g.fillStyle=lg;g.fillRect(0,hz*U,W,H-hz*U);}

 function peindre(){try{
   var dprF=Math.min(2,window.devicePixelRatio||1),FW=innerWidth,FH=innerHeight;
   cv.width=Math.round(FW*dprF);cv.height=Math.round(FH*dprF);
   g.setTransform(dprF,0,0,dprF,0,0);g.imageSmoothingEnabled=false;
   sceneFerme(g,FW,FH);}catch(e){}}
 peindre();
 var tR=0;addEventListener('resize',function(){if(v.classList.contains('parti'))return;
   clearTimeout(tR);tR=setTimeout(peindre,120);});
 })();
 v.classList.add('fm');
 var hhF=v.querySelector('.vHaut');if(hhF)hhF.innerHTML='<div class="fmT"><small>BATTLE DOCK</small><b>La ferme</b><i>Le blé n’attend pas</i></div>';
 var AST=['<b>Astuce :</b> arrose tes parcelles avant l’orage, la pluie fera le reste après.','<b>Astuce :</b> les légumes du jour se vendent mieux à l’étal de Madeleine.','<b>Astuce :</b> nourris tes poules, elles pondent pendant ton absence.','<b>Astuce :</b> les cochons trouvent des truffes quand on les laisse faire.'];
 try{var hwN=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'}));if((hwN.getMonth()===9&&hwN.getDate()>=20)||(hwN.getMonth()===10&&hwN.getDate()<=2))AST.push('<b>Halloween :</b> donne tes citrouilles à Madeleine pour débloquer les tenues collector.','<b>Halloween :</b> la nuit, un petit fantôme rôde au cimetière des légumes.');}catch(e){}
 var bbF=v.querySelector('.vBas');if(bbF)bbF.innerHTML='<div class="fmC"><div class="fmP"><span>🌰</span><span>🌱</span><span>🌿</span><span>🌾</span><span>🧺</span></div><div class="fmR"><i id="vJauge"></i></div><div class="fmM"><span id="vMot">On sème les graines…</span><span id="fmPc">4 %</span></div><div class="fmA">'+AST[Math.floor(Math.random()*AST.length)]+'</div></div>';
 (function suivreF(){var j=document.getElementById('vJauge');if(!j)return;var pc=parseFloat(j.style.width)||4;
  var sp=v.querySelectorAll('.fmP span');for(var q=0;q<sp.length;q++)sp[q].className=pc>=q*24?'ok':'';
  var p2=document.getElementById('fmPc');if(p2)p2.textContent=Math.round(pc)+' %';
  if(!v.classList.contains('parti'))setTimeout(suivreF,120);})();
}

/* LE VIEUX-PORT, PLEIN ÉCRAN : le quai au matin, dessiné à la taille réelle de l'écran */
if(cle==='port'&&v){
 function grad(g,y0,y1,st){var l=g.createLinearGradient(0,y0,0,y1);for(var q=0;q<st.length;q++)l.addColorStop(st[q][0],st[q][1]);return l;}
function pointu(g,x,y,s,c,c2,flip){g.save();g.translate(x,y);g.scale(flip?-s:s,s);
 g.fillStyle='rgba(0,20,40,.25)';g.beginPath();g.ellipse(0,9,34,4,0,0,7);g.fill();
 g.fillStyle=c;g.beginPath();g.moveTo(-34,-2);g.quadraticCurveTo(-30,8,-20,9);g.lineTo(22,9);g.quadraticCurveTo(32,8,36,-4);g.lineTo(-34,-2);g.fill();
 g.fillStyle=c2;g.fillRect(-32,-2,66,3);g.fillStyle='#f4ecd8';g.fillRect(-30,1,62,1.5);
 g.fillStyle='#8a5a30';g.fillRect(-12,-8,16,6);g.fillStyle='#6a4a2a';g.fillRect(-12,-8,16,1.5);
 g.fillStyle='#5a3a20';g.fillRect(-28,-16,1.6,15);g.fillRect(30,-14,1.4,12);g.restore();}
function facades(g,W,y,h,nuit){for(var x=0,k=0;x<W;k++){var w=W*0.07+al(k)*W*0.05,hh=h*(0.6+al(k*3)*0.4);var C=['#e8b880','#e0a080','#e8d8b0','#d08860','#c87050','#d8c090'][k%6];
 g.fillStyle=nuit?shade(C,0.45):C;g.fillRect(x,y-hh,w,hh);g.fillStyle=nuit?'#4a2a20':'#b8603a';g.fillRect(x-1,y-hh-h*0.06,w+2,h*0.07);
 for(var yy=y-hh+h*0.1;yy<y-h*0.18;yy+=h*0.16)for(var xx=x+w*0.15;xx<x+w-w*0.18;xx+=w*0.28){g.fillStyle=nuit?(al(xx*3+yy)<0.55?'#ffd27a':'#2a3048'):(al(xx+yy)<0.3?'#2a3a4a':'#5a7a8a');g.fillRect(xx,yy,w*0.12,h*0.08);if(!nuit){g.fillStyle='#6a8a6a';g.fillRect(xx-w*0.03,yy,w*0.03,h*0.08);g.fillRect(xx+w*0.12,yy,w*0.03,h*0.08);}}
 x+=w;}}
function shade(c,k){var r=parseInt(c.slice(1,3),16),gg=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);return 'rgb('+Math.round(r*k)+','+Math.round(gg*k+8)+','+Math.round(b*k+30)+')';}
function eau(g,W,y0,H,c1,c2,c3,reflets){g.fillStyle=grad(g,y0,H,[[0,c1],[.5,c2],[1,c3]]);g.fillRect(0,y0,W,H-y0);
 for(var r=0;r<180;r++){var rx=al(r*1.9)*W,ry=y0+Math.pow(al(r*3.7),1.3)*(H-y0);g.fillStyle=al(r*5)<0.5?reflets:'rgba(255,255,255,.10)';g.fillRect(rx,ry,4+al(r)*W*0.03,1.5);}}
/* 1 · LE QUAI AU MATIN : vu du quai, granit clair, bittes, pointus colorés, façades et ciel bleu */
function fond1(g,W,H){g.fillStyle=grad(g,0,H*0.42,[[0,'#6ab0e8'],[1,'#cfe8f4']]);g.fillRect(0,0,W,H*0.42);
 for(var i=0;i<4;i++){var cx=al(i*3)*W,cy=H*0.06+al(i*7)*H*0.12,s=W*0.08;g.fillStyle='rgba(255,255,255,.85)';for(var k=0;k<4;k++){g.beginPath();g.ellipse(cx+k*s*0.45,cy+Math.sin(k)*s*0.08,s*0.45,s*0.18,0,0,7);g.fill();}}
 g.fillStyle='rgba(120,140,170,.55)';g.beginPath();g.moveTo(W*0.45,H*0.3);g.quadraticCurveTo(W*0.7,H*0.18,W,H*0.27);g.lineTo(W,H*0.36);g.lineTo(W*0.45,H*0.36);g.fill();
 facades(g,W,H*0.4,H*0.13,false);
 g.fillStyle='#d8d4cc';g.fillRect(0,H*0.4,W,H*0.08);for(var x=0;x<W;x+=W*0.11){g.fillStyle='rgba(110,105,100,.35)';g.fillRect(x,H*0.4,1,H*0.08);}g.fillStyle='#ece8e0';g.fillRect(0,H*0.4,W,2);
 g.fillStyle='#b8b0a0';g.fillRect(0,H*0.475,W,H*0.008);
 eau(g,W,H*0.483,H,'#3a9ac8','#2a7aa8','#185a80','rgba(255,255,255,.35)');
 for(var b=0;b<5;b++){var bx=W*(0.1+b*0.2)+al(b)*20;g.fillStyle='#2a2a2a';g.fillRect(bx,H*0.462,W*0.012,H*0.016);g.fillStyle='#4a4a4a';g.fillRect(bx-1,H*0.46,W*0.012+2,H*0.004);}
 var sc=Math.min(W*0.0036,H*0.0026);var P=[['#e8b030','#1f4f8a'],['#1f6a9a','#e8e0c8'],['#c83a2a','#f4ecd8'],['#3a8a5a','#e8b030'],['#f4ecd8','#2a7ac8']];
 for(var p=0;p<7;p++){var t=p/6,yy=H*0.53+t*H*0.2,xx=W*(0.18+al(p*2)*0.64),s=sc*(0.7+t*0.9);pointu(g,xx,yy,s,P[p%5][0],P[p%5][1],p%2);}
 g.strokeStyle='rgba(60,60,60,.7)';g.lineWidth=Math.max(1,W/300);for(var m=0;m<3;m++){var mx=W*(0.25+m*0.12),my=H*(0.1+m*0.05);g.beginPath();g.moveTo(mx-8,my);g.quadraticCurveTo(mx-4,my-5,mx,my);g.quadraticCurveTo(mx+4,my-5,mx+8,my);g.stroke();}}

 try{var dprP=Math.min(2,window.devicePixelRatio||1),PW=innerWidth,PH=innerHeight;cv.width=Math.round(PW*dprP);cv.height=Math.round(PH*dprP);
  g.setTransform(dprP,0,0,dprP,0,0);g.imageSmoothingEnabled=true;fond1(g,PW,PH);}catch(e){}
 v.classList.add('pt');
 var hhP=v.querySelector('.vHaut');if(hhP)hhP.innerHTML='<div class="fmT"><small>BATTLE DOCK</small><b>Le Vieux-Port</b><i>Le ferry siffle au loin</i></div>';
 var ASP=['<b>Astuce :</b> le soir, les loups et les congres mordent au bout des pontons.','<b>Astuce :</b> ta pêche se vend à La Marée, au prix du jour — regarde les flèches.','<b>Astuce :</b> le métro t’emmène à la ferme, à la forêt et à Tokyo.','<b>Astuce :</b> une glacière fait payer ta pêche 12 % plus cher.'];
 try{var hwP=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'}));if((hwP.getMonth()===9&&hwP.getDate()>=20)||(hwP.getMonth()===10&&hwP.getDate()<=2))ASP.push('<b>Halloween :</b> 50 espèces maudites mordent jusqu’au 2 novembre — vends-les à La Marée.','<b>Halloween :</b> la nuit, le Capitaine Fantôme rôde au bout des pontons.');}catch(e){}
 var bbP=v.querySelector('.vBas');if(bbP)bbP.innerHTML='<div class="fmC"><div class="fmP"><span>⚓</span><span>🪢</span><span>⛵</span><span>🐟</span><span>🌅</span></div><div class="fmR"><i id="vJauge"></i></div><div class="fmM"><span id="vMot">On hisse les voiles…</span><span id="fmPc">4 %</span></div><div class="fmA">'+ASP[Math.floor(Math.random()*ASP.length)]+'</div></div>';
 (function suivreP(){var j=document.getElementById('vJauge');if(!j)return;var pc=parseFloat(j.style.width)||4;
  var sp=v.querySelectorAll('.fmP span');for(var q=0;q<sp.length;q++)sp[q].className=pc>=q*24?'ok':'';
  var p2=document.getElementById('fmPc');if(p2)p2.textContent=Math.round(pc)+' %';
  if(!v.classList.contains('parti'))setTimeout(suivreP,120);})();
}
/* LE FONDU DU BAS SE POSE SOUS LA SCÈNE : sa hauteur dépend de celle de
   la toile, qu'on ne connaît qu'une fois la page mesurée. */
function poserFondu(){
 var t=document.getElementById('vPre'), b=document.getElementById('vFonduB');
 if(!t||!b)return;
 b.style.top=Math.round(t.offsetTop+t.offsetHeight-124)+'px';
}
poserFondu();addEventListener('resize',poserFondu);
addEventListener('load',poserFondu);
setTimeout(poserFondu,60);setTimeout(poserFondu,400);
})();

window.addEventListener('error',ev=>{
if(document.getElementById('pepin'))return;
const d=document.createElement('div');d.id='pepin';
d.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:99;padding:12px 14px;'+
'border-radius:12px;background:#2b1618;border:1px solid #7d3a3a;color:#f2d9d9;'+
'font:600 12px/1.5 system-ui;box-shadow:0 6px 20px rgba(0,0,0,.5)';
d.textContent='Le jeu n’a pas pu démarrer : '+(ev.message||'erreur inconnue');
document.body.appendChild(d);
});
