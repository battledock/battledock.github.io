/* =====================================================================
   LA PISTE — le stade d'athlétisme (piste.html), un lieu à part entière.
   La tribune monte à la verticale au fond ; tout le reste est posé au sol :
   l'anneau de 400 m en tartan rouge, six couloirs, la pelouse et ses
   aires de sauts, la grille du bas par où l'on rentre à la Joliette.
   On y court en tenue d'athlète (choisie aux vestiaires) : 100 m, 400 m,
   800 m, contre son propre fantôme. Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=1600, H=800, Y0=300;
const CX=800, CY=548, DEMI=380, LW=11, NC=6, RI=128;   /* l'anneau : centre, demi-ligne droite, couloirs, rayon intérieur */
const RO=RI+LW*NC;
const X0=CX-DEMI, X1=CX+DEMI;
const DEPART=[800,752];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'900')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

/* ---------- LA GÉOMÉTRIE DE L'ANNEAU ----------
   Un couloir de rayon r : on part de la ligne d'arrivée (en haut, à gauche),
   on court vers la gauche, on descend le virage, on file en bas vers la
   droite, on remonte le second virage et on revient : la pelouse est
   toujours à gauche du coureur, comme sur une vraie piste. */
const rC=c=>RI+LW*(c-.5);
function longueur(r){return 2*Math.PI*r+4*DEMI;}
function pos(s,r){const A=Math.PI*r,L=longueur(r);s=((s%L)+L)%L;
  if(s<A){const t=-Math.PI/2-s/r;return [X0+Math.cos(t)*r,CY+Math.sin(t)*r];}s-=A;
  if(s<2*DEMI)return [X0+s,CY+r];s-=2*DEMI;
  if(s<A){const t=Math.PI/2-s/r;return [X1+Math.cos(t)*r,CY+Math.sin(t)*r];}s-=A;
  return [X1-s,CY-r];}
/* LES ÉPREUVES : une épreuve = un départ, une distance, des bornes tous les 70 px.
   L'échelle : un tour du couloir 1 fait 400 m ; le temps du jeu ×3 donne un temps d'athlète. */
const L1=longueur(rC(1)),M=L1/400;
function epreuve(k,nom,s0,metres,med){const r=rC(1),d=metres*M,pts=[];for(let s=70;s<d;s+=70)pts.push(pos(s0+s,r));pts.push(pos(s0+d,r));
  return {k,nom,start:pos(s0,r),pts,med,fac:3,metres};}
const COURSES=[
  epreuve('piste100','100 m',L1-100*M,100,[10.8,12.2,13.8]),
  epreuve('piste400','400 m',Math.PI*rC(1)+2*DEMI*.25,400,[52,60,70]),
  epreuve('piste800','800 m',Math.PI*rC(1)+2*DEMI*.8,800,[115,130,150])];

/* ---------- LE SOL ---------- */
function tribune(g){
  /* le ciel du soir derrière le toit */
  const sk=g.createLinearGradient(0,0,0,70);sk.addColorStop(0,'#5a8ad0');sk.addColorStop(1,'#a8d0f0');g.fillStyle=sk;g.fillRect(0,0,W,70);
  /* le toit, en porte-à-faux */
  R(g,0,40,W,26,'#2a3550');R(g,0,40,W,3,'#4a5a7a');for(let x=0;x<W;x+=60)R(g,x,43,3,23,'#1e273c');
  /* les gradins : des rangées de sièges, des spectateurs çà et là */
  for(let y=66,i=0;y<236;y+=10,i++){R(g,0,y,W,10,i%2?'#1f5fa8':'#2a6fba');R(g,0,y+8,W,2,'#174a86');
    for(let x=2;x<W;x+=8){const h=hA(x,y,3);if(h<.32){const c=['#f2d0a8','#c8946a','#8a5a3a','#e8b890'][(h*40|0)%4],t=['#e84a3a','#f5c430','#ffffff','#3ac0e8','#7ee08a','#1a1a1e'][(h*97|0)%6];
      R(g,x+1,y+2,5,6,t);R(g,x+2,y-1,3,3,c);}else R(g,x+1,y+3,5,4,'rgba(255,255,255,.12)');}}
  /* le grand tableau d'affichage */
  R(g,CX-170,74,340,120,'#14161c');R(g,CX-166,78,332,112,'#0a0b0e');R(g,CX-170,74,340,4,'#3a3e48');
  txt(g,'PISTE MUNICIPALE',CX,104,22,'#ffb030');txt(g,'MARSEILLE · ATHLÉTISME',CX,132,14,'#ffd880','700');
  for(let i=0;i<3;i++)txt(g,['100 M','400 M','800 M'][i],CX-110+i*110,166,16,'#7ee08a');
  R(g,CX-100,194,8,40,'#2a2e36');R(g,CX+92,194,8,40,'#2a2e36');
  /* le mur du bas des tribunes, avec ses bâches */
  R(g,0,236,W,64,'#e8e4da');R(g,0,236,W,4,'#ffffff');R(g,0,292,W,8,'#b8b2a4');
  const BACHES=[['ALLEZ !','#c0392b'],['MARSEILLE','#1f5fa8'],['ATHLÉ','#2e7d4f'],['400 M','#e8702a'],['RECORDS','#5a2ab0']];
  for(let i=0,x=330;x<W-80;x+=200,i++){if(Math.abs(x+80-CX)<120)continue;const [t,c]=BACHES[i%BACHES.length];R(g,x,252,160,28,c);R(g,x,252,160,3,'rgba(255,255,255,.3)');txt(g,t,x+80,267,15,'#fff');}
  /* les vestiaires, à gauche */
  R(g,40,150,200,150,'#d8cfbe');R(g,40,150,200,8,'#b8ae9a');R(g,36,142,208,12,'#8a3a2a');
  R(g,110,214,60,86,'#5a3a24');R(g,114,218,52,82,'#7a4e30');R(g,138,250,4,10,'#e8c050');
  R(g,60,180,36,24,'#a8d0f0');R(g,184,180,36,24,'#a8d0f0');R(g,60,191,36,2,'#d8cfbe');R(g,184,191,36,2,'#d8cfbe');
  R(g,82,160,116,18,'#16213a');txt(g,'VESTIAIRES',140,169,11,'#ffd860');
  /* deux mâts de projecteurs */
  for(const x of [300,1300]){R(g,x-3,0,6,240,'#8a929c');R(g,x-22,6,44,26,'#3a3e48');for(let i=0;i<4;i++)for(let j=0;j<2;j++)R(g,x-19+i*10,9+j*12,8,9,'#fff6d0');}}
function anneau(g){
  /* l'esplanade de béton, puis la pelouse au cœur de l'anneau */
  R(g,0,Y0,W,H-Y0,'#c9c2b4');for(let i=0;i<900;i++){g.fillStyle='rgba(90,80,60,'+(.04+hA(i,1,1)*.05)+')';g.fillRect(hA(i,2,1)*W,Y0+hA(i,3,1)*(H-Y0),1+hA(i,4,1)*2,1);}
  const forme=(r)=>{g.beginPath();g.moveTo(X0,CY-r);g.lineTo(X1,CY-r);g.arc(X1,CY,r,-Math.PI/2,Math.PI/2);g.lineTo(X0,CY+r);g.arc(X0,CY,r,Math.PI/2,Math.PI*1.5);g.closePath();};
  /* le tartan rouge */
  forme(RO+4);g.fillStyle='#e8e4da';g.fill();
  forme(RO);g.fillStyle='#c4553a';g.fill();
  g.save();forme(RO);g.clip();for(let i=0;i<5000;i++){g.fillStyle=hA(i,7,2)<.5?'rgba(255,200,170,.08)':'rgba(90,20,10,.08)';g.fillRect(X0-RO+hA(i,8,2)*(2*DEMI+2*RO),CY-RO+hA(i,9,2)*2*RO,1,1);}g.restore();
  /* la pelouse rayée, et ses lignes */
  forme(RI);g.fillStyle='#4f9a48';g.fill();g.save();forme(RI);g.clip();for(let x=X0-RI;x<X1+RI;x+=40)R(g,x,CY-RI,20,2*RI,'rgba(255,255,255,.05)');
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.4;g.strokeRect(X0+10,CY-90,2*DEMI-20,180);g.beginPath();g.moveTo(CX,CY-90);g.lineTo(CX,CY+90);g.stroke();g.beginPath();g.arc(CX,CY,30,0,7);g.stroke();
  g.restore();
  /* les couloirs : des lignes blanches, les numéros sur la ligne d'arrivée */
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;for(let c=0;c<=NC;c++){forme(RI+c*LW);g.stroke();}
  for(let c=1;c<=NC;c++){txt(g,String(c),X0+14,CY-rC(c)+.5,8,'#ffffff');}
  /* la ligne d'arrivée, en damier sur les six couloirs */
  for(let y=CY-RO;y<CY-RI;y+=3)for(let k=0;k<2;k++)R(g,X0-3+k*3,y,3,3,((y-CY+RO)/3+k)%2<1?'#ffffff':'#1a1a1e');
  /* le sautoir en longueur (sable) et le tapis de hauteur, sur la pelouse */
  R(g,CX-260,CY-30,90,24,'#e8d29a');R(g,CX-260,CY-30,90,2,'#c8b07a');R(g,CX-170,CY-20,120,4,'#d87a5a');
  R(g,CX+170,CY-24,64,40,'#2a6fba');R(g,CX+170,CY-24,64,4,'#4a8ad0');R(g,CX+162,CY-34,2,58,'#e8e4da');R(g,CX+240,CY-34,2,58,'#e8e4da');R(g,CX+162,CY-34,80,2,'#f5c430');
  /* le cercle du poids */
  g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.arc(CX+60,CY+50,10,0,7);g.stroke();
  /* la grille du bas, et son portail ouvert vers la Joliette */
  for(let x=0;x<W;x+=8){if(Math.abs(x-CX)<34)continue;R(g,x,H-26,2,22,'#3a5a3a');}R(g,0,H-26,CX-34,2,'#3a5a3a');R(g,CX+34,H-26,W-CX-34,2,'#3a5a3a');
  R(g,CX-38,H-34,6,30,'#2a3a2a');R(g,CX+32,H-34,6,30,'#2a3a2a');txt(g,'SORTIE · JOLIETTE',CX,H-42,9,'#2a3a2a','800');}
function peindreSol(g){tribune(g);anneau(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}

/* ---------- LES TENUES D'ATHLÈTE ----------
   Pas de sac sur la piste : débardeur, short, chaussures de course. On les
   choisit aux vestiaires ; le moteur les porte à la place des habits de ville
   tant qu'on est ici (window.AP_FORCE). */
const KITS=[{n:'Phocéen',haut:'#7ac8f0',bas:'#ffffff'},{n:'Massilia',haut:'#ffffff',bas:'#1f5fa8'},{n:'Calanques',haut:'#1a1a22',bas:'#1a1a22',f:'#f5c430'},{n:'Provence',haut:'#e84a3a',bas:'#ffffff'},{n:'Garrigue',haut:'#2e8a4a',bas:'#f2ead6'},{n:'Soleil',haut:'#f5c430',bas:'#1a1a22'}];
const SOULIERS=[{n:'Fluo',c:'#c8ff3a'},{n:'Corail',c:'#ff6a4a'},{n:'Glacier',c:'#5ae0ff'},{n:'Néon rose',c:'#ff4ab8'},{n:'Blanc pur',c:'#f6f6f6'},{n:'Noir mat',c:'#26262c'}];
function kit(){let k={k:0,s:0};try{if(e.kitAthle&&typeof e.kitAthle==='object')k=e.kitAthle;}catch(x){}const K=KITS[k.k%KITS.length],S=SOULIERS[k.s%SOULIERS.length];
  return {haut:4,veste:K.haut,_motif:0,motif:0,raye:0,bas:1,pantalon:K.bas,souliers:1,chaussures:S.c,sac:0,chapeau:0,cos:0,deguisement:0,maillot:0,gilet:0,patin:0,_civil:true};}
function porter(){try{window.AP_FORCE=kit();}catch(x){}}
porter();
function vestiaires(){if(document.getElementById('pstV'))return;let sel={k:0,s:0};try{if(e.kitAthle)sel=Object.assign({},e.kitAthle);}catch(x){}
  const d=document.createElement('div');d.id='pstV';
  d.style.cssText='position:fixed;inset:0;z-index:2147482500;background:rgba(10,16,24,.55);display:flex;align-items:flex-end;justify-content:center;font-family:"Baloo 2",system-ui,sans-serif';
  const carte=(i,a,on)=>'<button data-'+a+'="'+i+'" style="all:unset;box-sizing:border-box;cursor:pointer;text-align:center;background:'+(on?'#fff6d8':'#fff')+';border:3px solid '+(on?'#16213a':'#e2d8c6')+';border-radius:6px;padding:4px 2px 6px;box-shadow:0 3px 0 '+(on?'#16213a':'#e2d8c6')+'"><canvas width="96" height="128" style="width:48px;height:64px;image-rendering:pixelated;display:block;margin:0 auto"></canvas><span style="font:800 11px ui-monospace,monospace;color:#16213a">'+(a==='k'?KITS[i].n:SOULIERS[i].n)+'</span></button>';
  const rendre=()=>{d.innerHTML='<div style="width:min(460px,100%);max-height:88vh;overflow-y:auto;background:#f6efdc;border-radius:22px 22px 0 0;border-top:4px solid #16213a;padding:12px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.35)">'+
    '<div style="width:44px;height:5px;border-radius:3px;background:#d8ccb4;margin:0 auto 8px"></div><div style="text-align:center;font:900 22px Georgia,serif;color:#16213a">Les vestiaires</div>'+
    '<div style="text-align:center;font:700 12px ui-monospace,monospace;color:#6a5a40;margin-bottom:10px">Sur la piste, on court léger : pas de sac.</div>'+
    '<div style="font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b;margin:4px 0 6px">LE MAILLOT ET LE SHORT</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+KITS.map((_,i)=>carte(i,'k',i===sel.k)).join('')+'</div>'+
    '<div style="font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#c0392b;margin:12px 0 6px">LES CHAUSSURES DE COURSE</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+SOULIERS.map((_,i)=>carte(i,'s',i===sel.s)).join('')+'</div>'+
    '<button data-ok="1" style="all:unset;box-sizing:border-box;display:block;width:100%;margin-top:14px;text-align:center;background:#16213a;color:#ffd860;border:4px solid #e8c050;box-shadow:0 0 0 3px #16213a;border-radius:4px;padding:12px;font:900 15px ui-monospace,monospace;letter-spacing:2px;cursor:pointer">ENFILER LA TENUE</button></div>';
    d.querySelectorAll('canvas').forEach(cv=>{const b=cv.parentNode,isK=b.dataset.k!==undefined,i=+(isK?b.dataset.k:b.dataset.s);const q=cv.getContext('2d');q.imageSmoothingEnabled=false;
      const keep=window.AP_FORCE;const save=e.kitAthle;e.kitAthle=isK?{k:i,s:sel.s}:{k:sel.k,s:i};const ap=Object.assign({},e.ap||{},kit());e.kitAthle=save;window.AP_FORCE=keep;
      q.setTransform(2,0,0,2,0,0);try{personne(q,24,60,ap,'bas',0,false);}catch(x){}});};
  rendre();document.body.appendChild(d);
  d.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b){if(ev.target===d)d.remove();return;}
    if(b.dataset.k!==undefined){sel.k=+b.dataset.k;rendre();}else if(b.dataset.s!==undefined){sel.s=+b.dataset.s;rendre();}
    else if(b.dataset.ok){e.kitAthle=sel;porter();try{sauver();}catch(x){}d.remove();try{texteVolant(joueur.x,joueur.y-70,'Tenue enfilée !','#ffd860');}catch(x){}try{vibrer(12);}catch(x){}}});}

/* ---------- LE DÉCOR (des points d'action, tout le reste est au sol) ---------- */
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_pst_vide_sol',140,Y0+30,{col:[1,1],demi:60,agir:vestiaires,libelle:'Se changer',nom:'VESTIAIRES'});
  P('x_jol_pst_vide_sol',CX,Y0+12,{col:[1,1],parler:['Le tableau garde tes meilleurs temps.','Les damiers sur la piste : marche dessus pour lancer une course.','100 m, 400 m, 800 m. Gère ton souffle !']});
  return D;}
const GRAVEURS={x_jol_pst_vide_sol:()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})};
function graver(t,v){const r=(GRAVEURS[t]||GRAVEURS.x_jol_pst_vide_sol)(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}

/* ---------- LES ATHLÈTES QUI S'ENTRAÎNENT ---------- */
const GENS=[];
(()=>{const peau=[1,3,5,2,6,4];for(let i=0;i<5;i++){const K=KITS[(i+2)%KITS.length];
  GENS.push({c:2+i%5,v:118+i*9,dec:i*700,ap:{peau:peau[i%6],cheveux:[1,4,6,0,10][i],coiffe:[0,6,2,0,5][i],barbe:i===1?3:0,haut:4,veste:K.haut,pantalon:K.bas,bas:1,souliers:1,chaussures:SOULIERS[(i+1)%6].c,sac:0,chapeau:0,raye:0,motif:0,_civil:true},x:0,y:0,dir:'gauche',pas:0});}})();
function figurants(){const now=Date.now()/1000;
  for(const P of GENS){const r=rC(P.c),s=now*P.v+P.dec,[x,y]=pos(s,r),[x2,y2]=pos(s+4,r);P.x=x;P.y=y;const dx=x2-x,dy=y2-y;
    P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'droite':'gauche'):(dy>0?'bas':'haut');P.pas=s/9;}
  return GENS;}

function bloque(x,y){
  if(x<12||x>W-12)return true;
  if(y<Y0+8)return true;
  if(y>H-28&&Math.abs(x-CX)>30)return true;
  if(y>H-4)return true;
  return false;}

/* LA SORTIE : par le portail du bas, on rentre sur la place de la Joliette */
let PARTI=false;
setInterval(()=>{try{if(PARTI||typeof joueur==='undefined')return;if(joueur.y>H-12)sortir();}catch(x){}},150);
function sortir(){if(PARTI)return;PARTI=true;try{window.AP_FORCE=null;}catch(x){}try{sauver();}catch(x){}
  try{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff8ea;opacity:0;transition:opacity .45s;pointer-events:none';document.body.appendChild(f);requestAnimationFrame(()=>f.style.opacity='1');}catch(x){}
  setTimeout(()=>{const v=window.MA_VERSION?('&v='+encodeURIComponent(window.MA_VERSION)):'';location.href='spawn.html?de=piste'+v;},480);}

return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants,courses:COURSES};
})()
