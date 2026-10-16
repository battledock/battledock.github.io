/* ================= TOKYO, CARTE (900 x 900) =================
   Une carte blanche : un sol nu, les bords qui retiennent le joueur, la sortie
   vers le port à l'ouest. Rien d'autre : les immeubles, la rangée des boutiques
   et le concessionnaire sont dans l'historique (34e0ea0), à reposer ici.
   L'ancienne carte est gardée dans l'historique git. */

const TK={
  bati:206,                       /* le pied des façades du haut : au-dessus, rien ne marche */
  trottoir:[206,236],             /* le trottoir, au pied des façades : on y marche */
  rangee:0, bas:900,              /* pas de rangée de boutiques */
  blocs:[],                       /* rien ne barre le passage */
  porte:null,                     /* pas d'armurerie */
  concessionPorte:{x:86,y0:206,y1:250,l:76},    /* devant la vitrine du concessionnaire, sur le trottoir : nulle part ailleurs */
  route:[238,338],                /* la route, sous le trottoir */
  parking:{y0:350},               /* le parking, sous la route */
  sortie:{x:60,y0:296,y1:420},    /* (ancienne sortie ouest, retirée) */
  metro:{x:70,y0:352,y1:452,l:62}, /* la bouche de métro, ligne 2 : retour au port */
  arrivee:[70,364]
};

function bloqueTokyo(x,y){
  if(x<6||x>MONDE_L-6)return true;
  if(y<TK.bati+6||y>MONDE_H-6)return true;
  /* LE MÉTRO EN DUR : l'escalier et ses rambardes, et le poteau de la ligne */
  if(x>26&&x<114&&y>372&&y<446)return true;
  if(Math.abs(x-122)<5&&y>436&&y<450)return true;
  return false;
}

/* le sol nu : un quadrillage très discret, pour voir la taille de la carte */
function construireSolTokyo(){
  const W=MONDE_L,H=MONDE_H;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  g.fillStyle='#8c889c';g.fillRect(0,0,W,H);
  /* LE TROTTOIR, pavé comme celui du port : dalles irrégulières, joints, grain et usure */
  const A=(i)=>alea(i*1.37+0.5);
  const pave=['#b6b2c2','#aeaabc','#bcb8c8','#a9a5b8','#b2aec0'];
  const [t0,t1]=TK.trottoir;
  g.fillStyle='#a5a1b4';g.fillRect(0,t0,W,t1-t0);
  let y=t0;
  while(y<t1){
    const h=6+Math.floor(A(y*1.91)*4);
    let x=-Math.floor(A(y*0.77)*40);
    while(x<W){
      const w=26+Math.floor(A(x*0.31+y)*20);
      const hh=Math.min(h,t1-y);
      g.fillStyle=pave[Math.floor(A(x+y*3.1)*pave.length)];g.fillRect(x,y,w,hh);
      g.fillStyle='rgba(20,16,32,.35)';g.fillRect(x,y,w,1);g.fillRect(x,y,1,hh);
      g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+3+Math.floor(A(x*1.9+y)*(w-7)),y+2,2,1);
      if(A(x*1.7+y)<.12){g.fillStyle='rgba(20,16,32,.3)';g.fillRect(x+3,y+2,3,1);}
      x+=w;
    }
    y+=h;
  }
  /* la bordure du trottoir */
  g.fillStyle='#8a86a0';g.fillRect(0,t1,W,2);
  /* ================= LE CIRCUIT =================
     La route du haut devient la ligne droite d'un circuit fermé : un grand
     rectangle aux virages arrondis, cent points de large, qu'on boucle en
     voiture. À gauche, la route continue jusqu'au concessionnaire : c'est
     la voie des stands. Dans l'anneau, le paddock et ses places. */
  const C=CIRCUIT, ep=C.ep;
  const voie=(gg,dec,lw,col,dash)=>{gg.save();gg.strokeStyle=col;gg.lineWidth=lw;gg.lineJoin='round';gg.setLineDash(dash||[]);
    gg.beginPath();rondRect(gg,C.x0-dec,C.y0-dec,C.x1+dec,C.y1+dec,Math.max(1,C.r+dec));gg.stroke();gg.restore();};
  /* le dehors : un trottoir pavé tout autour de l'anneau */
  g.fillStyle='#9894a8';g.fillRect(0,TK.route[1],W,H-TK.route[1]);
  for(let yy=TK.route[1];yy<H;yy+=12)for(let xx=((yy/12)%2?0:10);xx<W;xx+=20){g.fillStyle=A(xx*0.37+yy*1.3)>.5?'#a29eb2':'#938fa4';g.fillRect(xx,yy,19,11);}
  /* le paddock, dans l'anneau : asphalte clair et places */
  g.save();g.beginPath();rondRect(g,C.x0+ep/2,C.y0+ep/2,C.x1-ep/2,C.y1-ep/2,C.r-ep/2);g.clip();
  g.fillStyle='#4f8a4a';g.fillRect(0,0,W,H);
  for(let i=0;i<2500;i++){g.fillStyle=A(i*2.3)>.5?'rgba(120,200,110,.10)':'rgba(0,0,0,.12)';g.fillRect(Math.floor(A(i+11)*W),Math.floor(A(i+29)*H),1,2);}
  g.beginPath();rondRect(g,C.x0+ep/2+18,C.y0+ep/2+18,C.x1-ep/2-18,C.y1-ep/2-18,C.r-ep/2-18);g.clip();
  g.fillStyle='#62616c';g.fillRect(0,0,W,H);
  for(let i=0;i<700;i++){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(Math.floor(A(i+300)*W),Math.floor(A(i+700)*H),2,1);}
  g.fillStyle='rgba(235,235,245,.5)';
  for(const y0 of [420,600]){for(let x=330;x<=730;x+=36){g.fillRect(x,y0,2,46);g.fillRect(x,y0+48,2,46);}g.fillRect(330,y0+46,402,2);}
  /* le logo peint au sol */
  g.globalAlpha=.16;g.fillStyle='#ff4fb0';g.font='bold 40px sans-serif';g.textAlign='center';g.fillText('東京',530,585);
  g.font='bold 14px sans-serif';g.fillText('TOKYO CIRCUIT',530,560);g.textAlign='start';g.globalAlpha=1;
  g.restore();
  /* LA PISTE : un calque à part, pour que le grain et les reflets restent dessus */
  const pc=document.createElement('canvas');pc.width=W;pc.height=H;const pg=pc.getContext('2d');
  voie(pg,0,ep,'#46454f');
  pg.fillStyle='#46454f';pg.fillRect(0,TK.route[0],C.x1-C.r,TK.route[1]-TK.route[0]);   /* la voie des stands, à gauche */
  pg.globalCompositeOperation='source-atop';
  for(let i=0;i<2600;i++){pg.fillStyle='rgba(255,255,255,.045)';pg.fillRect(Math.floor(A(i+50)*W),Math.floor(A(i+90)*H),2,1);}
  const refl=['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'];
  pg.globalAlpha=.1;for(let i=0;i<60;i++){pg.fillStyle=refl[i%4];pg.fillRect(Math.floor(A(i*1.9)*W),Math.floor(A(i*3.3)*H),20+Math.floor(A(i*5.1)*60),1);}pg.globalAlpha=1;
  /* la trajectoire : une bande plus sombre où les pneus passent */
  pg.globalAlpha=.35;voie(pg,0,26,'#33323b');pg.globalAlpha=1;
  pg.globalCompositeOperation='source-over';
  /* les lignes blanches de bord, et la ligne pointillée de la voie des stands */
  voie(pg,ep/2-5,2,'rgba(235,235,245,.7)');voie(pg,-ep/2+5,2,'rgba(235,235,245,.7)');
  pg.fillStyle='rgba(235,230,200,.6)';for(let x=10;x<C.x0;x+=40)pg.fillRect(x,(TK.route[0]+TK.route[1])/2-1,22,3);
  /* LES VIBREURS rouges et blancs, dans les quatre virages */
  for(const [cx,cy,a0,k0] of [[C.x0+C.r,C.y0+C.r,Math.PI,1],[C.x1-C.r,C.y0+C.r,-Math.PI/2,0],[C.x1-C.r,C.y1-C.r,0,0],[C.x0+C.r,C.y1-C.r,Math.PI/2,0]]){
    /* le premier virage n'a pas de vibreur extérieur : la voie des stands s'y raccorde */
    for(const rr of [C.r+ep/2-3,C.r-ep/2+3].slice(k0)){
      pg.lineWidth=6;pg.strokeStyle='#f4f2f6';pg.beginPath();pg.arc(cx,cy,rr,a0,a0+Math.PI/2);pg.stroke();
      pg.strokeStyle='#e0263a';pg.setLineDash([9,9]);pg.beginPath();pg.arc(cx,cy,rr,a0,a0+Math.PI/2);pg.stroke();pg.setLineDash([]);
    }
  }
  /* LA LIGNE D'ARRIVÉE, en damier, et la grille de départ */
  const [l0,l1]=TK.route, LX=C.ligne;
  for(let yy=l0+4;yy<l1-4;yy+=6)for(let k=0;k<2;k++){pg.fillStyle=((yy-l0)/6+k)%2<1?'#f4f2f6':'#14121c';pg.fillRect(LX+k*6,yy,6,6);}
  pg.fillStyle='rgba(235,235,245,.6)';
  for(let k=1;k<=3;k++){const gx=LX-k*80;pg.fillRect(gx,l0+16,2,24);pg.fillRect(gx-20,l0+16,22,2);pg.fillRect(gx+40,l1-40,2,24);pg.fillRect(gx+20,l1-40,22,2);}
  /* LES MURS DE PNEUS dans les dégagements extérieurs des virages */
  for(const [cx,cy,a0] of [[C.x1-C.r,C.y0+C.r,-Math.PI/2],[C.x1-C.r,C.y1-C.r,0],[C.x0+C.r,C.y1-C.r,Math.PI/2]])
    for(let k=0;k<=12;k++){const a=a0+k/12*Math.PI/2, rr=C.r+ep/2+9;const tx=cx+Math.cos(a)*rr, ty=cy+Math.sin(a)*rr;
      if(tx<4||ty<4||tx>W-4||ty>H-4)continue;
      pg.fillStyle='#16141c';pg.beginPath();pg.arc(tx,ty,5,0,7);pg.fill();pg.fillStyle=k%2?'#e0263a':'#f4f2f6';pg.beginPath();pg.arc(tx,ty,2.5,0,7);pg.fill();}
  g.drawImage(pc,0,0);
  /* la bordure du trottoir, sous la route des stands */
  g.fillStyle='#8a86a0';g.fillRect(0,TK.route[1],C.x0-ep/2,2);
  /* le portique de départ, au-dessus de la ligne */
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(LX-2,l0-4,10,l1-l0+8);
  g.fillStyle='#d8d8e2';g.fillRect(LX+1,l0-6,4,4);g.fillRect(LX+1,l1+2,4,4);
  /* la rangée du haut : ciel de nuit, façades japonaises collées et cerisiers */
  /* LA BOUCHE DE MÉTRO : un parvis, l'escalier qui descend, les rambardes, le poteau de la ligne 2 */
  (function(){
    const x0=8,y0=352,w=132,h=136;
    g.fillStyle='#a8a4b8';g.fillRect(x0,y0,w,h);
    for(let yy=y0;yy<y0+h;yy+=10)for(let xx=x0+((yy/10)%2?0:8);xx<x0+w;xx+=16){g.fillStyle=A(xx*0.7+yy)>.5?'#b2aec2':'#a09cb0';g.fillRect(xx,yy,15,9);}
    g.fillStyle='#8a86a0';g.fillRect(x0,y0+h,w,2);g.fillRect(x0+w,y0,2,h+2);
    const sx=34,sy=380,sw=72,sh=58;
    g.fillStyle='#14121c';g.fillRect(sx-2,sy-2,sw+4,sh+4);
    for(let i=0;i<9;i++){const yy=sy+i*6.4;g.fillStyle='rgb('+(118-i*11)+','+(114-i*11)+','+(132-i*12)+')';g.fillRect(sx,yy|0,sw,5);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(sx,yy|0,sw,1);g.fillStyle='#e8c94a';g.fillRect(sx,(yy|0)+1,sw,1);}
    const fond=g.createLinearGradient(0,sy,0,sy+sh);fond.addColorStop(0,'rgba(0,0,0,0)');fond.addColorStop(1,'rgba(8,6,14,.75)');g.fillStyle=fond;g.fillRect(sx,sy,sw,sh);
    const lum=g.createRadialGradient(sx+sw/2,sy+sh,4,sx+sw/2,sy+sh,40);lum.addColorStop(0,'rgba(255,230,170,.35)');lum.addColorStop(1,'rgba(255,230,170,0)');g.fillStyle=lum;g.fillRect(sx,sy,sw,sh);
    /* les rambardes : à gauche, à droite et au fond — on entre par le haut */
    const rb=(x,y,ww,hh)=>{g.fillStyle='#2a2838';g.fillRect(x+1,y+2,ww,hh);g.fillStyle='#c9cdd9';g.fillRect(x,y,ww,hh);g.fillStyle='#f4f6fb';g.fillRect(x,y,ww,1);};
    rb(sx-5,sy-8,3,sh+12);rb(sx+sw+2,sy-8,3,sh+12);rb(sx-5,sy+sh+2,sw+10,3);
    for(let yy=sy-8;yy<sy+sh;yy+=12){rb(sx-6,yy,5,2);rb(sx+sw+1,yy,5,2);}
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(sx-4,sy+sh+6,sw+10,4);
    /* le poteau et son panneau */
    const px=122,pb=446;
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(px+2,pb+1,9,3,0,0,7);g.fill();
    g.fillStyle='#6a6e7c';g.fillRect(px-2,y0+12,4,pb-y0-12);g.fillStyle='#a8adbb';g.fillRect(px-2,y0+12,1,pb-y0-12);
    const halo=g.createRadialGradient(px,y0+16,2,px,y0+16,34);halo.addColorStop(0,'rgba(255,90,170,.45)');halo.addColorStop(1,'rgba(255,90,170,0)');g.fillStyle=halo;g.fillRect(px-34,y0-18,68,68);
    g.fillStyle='#e4007f';g.beginPath();g.arc(px,y0+14,13,0,7);g.fill();
    g.fillStyle='#ffffff';g.beginPath();g.arc(px,y0+14,9,0,7);g.fill();
    g.fillStyle='#e4007f';g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('2',px,y0+15);
    g.fillStyle='#1c2a5a';g.fillRect(px-22,y0+30,44,15);g.fillStyle='#ffffff';g.fillRect(px-22,y0+30,44,1);
    g.font='bold 7px sans-serif';g.fillText('港 LE PORT',px,y0+38);
    g.textAlign='start';g.textBaseline='alphabetic';
    /* au sol, devant l'escalier */
    g.fillStyle='rgba(228,0,127,.85)';g.font='bold 8px sans-serif';g.textAlign='center';g.fillText('地下鉄 · MÉTRO',sx+sw/2,sy-12);g.textAlign='start';
  })();
  const haut=new Image();
  haut.onload=()=>{g.drawImage(haut,0,0);};
  let nuit=false;try{const C0=cielDuMoment();nuit=!!(C0&&C0.lampes>0.5);}catch(x){}
  haut.src=nuit?'assets/tokyo/rue_haut.png':'assets/tokyo/rue_haut_jour.png';
  return c;
}

/* LES LAMPADAIRES : ceux du port (même mât, même vacillement), allumés au
   crépuscule par le cycle du jeu. Le long du trottoir des façades, autour du
   circuit, au paddock et au métro. Ils ne bloquent rien. */
const LAMPES_TK=[[240,232],[390,232],[545,232],[700,232],[855,232],
  [165,470],[165,640],[165,800],
  [340,400],[720,400],[340,750],[720,750],[530,400],[530,750],[315,575],[745,575],
  [20,480],[136,356]];
function semerDecorTokyo(){
  LAMPES_TK.forEach(([x,y],k)=>DECOR.push({t:'lanterneP',x,y,gr:k}));
  DECOR.sort((a,b)=>a.y-b.y);try{invaliderGrille();}catch(x){}
}
/* LA VILLE S'ALLUME LA NUIT : les enseignes et les fenêtres des façades,
   les néons du showroom, l'escalier du métro. Posé à chaque image dans la
   carte des lumières du jeu ; rien ne s'allume de jour. */
const FEUX_TK=[[85,185,'rgba(120,220,255,§)',60],[240,185,'rgba(255,200,120,§)',56],[385,185,'rgba(255,110,190,§)',56],
  [540,185,'rgba(120,220,255,§)',56],[690,185,'rgba(255,200,120,§)',56],[825,185,'rgba(255,110,190,§)',60],
  [85,110,'rgba(255,214,150,§)',44],[240,110,'rgba(255,214,150,§)',44],[385,110,'rgba(255,214,150,§)',44],
  [540,110,'rgba(255,214,150,§)',44],[690,110,'rgba(255,214,150,§)',44],[825,110,'rgba(255,214,150,§)',44],
  [70,420,'rgba(255,230,170,§)',40],[122,366,'rgba(255,90,170,§)',34],[543,288,'rgba(255,255,255,§)',40]];
function lumieresTokyo(g,camX,camY){
  for(const [x,y,c,r] of FEUX_TK)try{lueurNuit(g,x-camX,y-camY,r,c);}catch(x){}
}

/* arrivée : à l'entrée ouest, près du panneau du port. */
function poserTokyo(){
  const [dx,dy]=degager(TK.arrivee[0],TK.arrivee[1]);
  joueur.x=dx;joueur.y=dy;e.ext={x:dx,y:dy};e.extc='tokyo';e.carte='tokyo';
  try{sauver();}catch(x){}
}

/* ---------- LE CONCESSIONNAIRE : le menu du showroom, en entrant ----------
   Le catalogue vient de assets/voitures/catalogue.json. Pas encore de prix ni
   d'essai : les boutons le disent, rien n'est vendu tant que le prix n'est pas fixé. */

function fermerConcessionTokyo(){
  ouvrirConcessionTokyo.ouvert=false;
  fermeA=Date.now();
  $('page2').classList.remove('on');
}

/* LE GARAGE DU JOUEUR : rangé dans sa sauvegarde (e.garage), comme le reste de ce
   qu'il possède. Une entrée par voiture : {id, modele, place, nom, km, drifts, sorties}.
   Quatre places au parking de Tokyo. La vente n'est pas ouverte : le garage se
   remplira quand elle le sera. */
const PLACES_GARAGE=4;
function garageDuJoueur(){if(!Array.isArray(e.garage))e.garage=[];return e.garage;}

/* ================= LE TUNING : REPEINDRE LE PROFIL =================
   Les sprites de profil sont des images : on repère la caisse par sa couleur
   (la teinte dominante, ou le gris / blanc pour la 911 et la GT-R) et on la
   repeint en gardant l'ombrage, pixel par pixel. Les vitres sombres du haut
   se teintent à part. */
const IMGS_TK={};
const chargerImgTK=src=>IMGS_TK[src]||(IMGS_TK[src]=new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;}));
function hslTK(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;
  if(mx===mn)return [0,0,l];const d=mx-mn,s=l>0.5?d/(2-mx-mn):d/(mx+mn);
  let h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;return [h*60,s,l];}
function repeindreProfil(img,t){
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
  const g=c.getContext('2d');g.drawImage(img,0,0);
  t=t||{};if(!t.couleur&&!t.vitres)return c;
  const W=c.width,H=c.height,d=g.getImageData(0,0,W,H),D=d.data;
  const hist=new Array(36).fill(0);let opaques=0,satures=0;
  for(let i=0;i<D.length;i+=4){if(D[i+3]<128)continue;opaques++;const [h,sa,l]=hslTK(D[i],D[i+1],D[i+2]);if(sa>0.35&&l>0.12&&l<0.85){satures++;hist[Math.floor(h/10)%36]++;}}
  const chroma=satures>opaques*0.22, hm=hist.indexOf(Math.max(...hist))*10+5;
  const lums=[];
  const caisse=(i,y,h,sa,l)=>{
    if(chroma){let dh=Math.abs(h-hm);dh=Math.min(dh,360-dh);return sa>0.28&&dh<26&&l>0.1;}
    if(y>H*0.93)return false;
    /* les roues gardent leur gris : deux disques autour des jantes, en bas */
    const x=(i/4)%W, r=H*0.3;
    for(const cx of [W*0.235,W*0.795])if((x-cx)*(x-cx)+(y-(H-r))*(y-(H-r))<r*r*1.1)return false;
    return lums.claire?(sa<0.16&&l>0.45):(sa<0.3&&((l>0.2&&l<0.7)||(y>H*0.5&&l>0.09)));};
  /* blanc ou gris : on regarde la clarté moyenne du gros de la caisse */
  if(!chroma){let n=0,m=0;for(let i=0;i<D.length;i+=4){if(D[i+3]<128)continue;const [h,sa,l]=hslTK(D[i],D[i+1],D[i+2]);if(sa<0.14&&l>0.24){n++;m+=l;}}lums.claire=n&&m/n>0.62;}
  const sel=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(D[i+3]<128)continue;
    const [h,sa,l]=hslTK(D[i],D[i+1],D[i+2]);
    if(caisse(i,y,h,sa,l)){sel.push([i,l]);lums.push(l);}
    else if(t.vitres&&y<H*0.55&&l<0.32&&D[i+2]>=D[i]-12){const k=[1,0.78,0.55,0.32][t.vitres];D[i]*=k;D[i+1]*=k;D[i+2]*=k;}}
  if(t.couleur&&sel.length){
    lums.sort((a,b)=>a-b);const base=lums[Math.floor(lums.length*0.6)]||0.5;
    const T=[1,3,5].map(k=>parseInt(t.couleur.substr(k,2),16));
    const tl=hslTK(...T)[2]||0.5;
    for(const [i,l] of sel){let k=(l/base);
      for(let q=0;q<3;q++){let v=k<=1?T[q]*k:T[q]+(255-T[q])*Math.min(1,(k-1)*(tl<0.25?0.9:1.4));D[i+q]=Math.max(0,Math.min(255,v));}}
  }
  g.putImageData(d,0,0);return c;
}
const TEINTES_TK=['#d01426','#ff4fb0','#ff7a1a','#ffd21f','#5cc83a','#1fd6c3','#1a5fd0','#7a3cff','#f4f4f6','#8e939c','#2a2c33','#0b0b0f'];
const NEONS_TK=['#ff4fb0','#7fe8ff','#b08cff','#5cff8a','#ffd98a','#ff3b3b'];

/* ================= CHAQUE VOITURE A SON CARACTÈRE =================
   Multiplicateurs appliqués aux performances de base (et au tuning) : la
   Supra et la F40 glissent, la GT-R et la 911 collent à la route, la
   Huracán pousse fort. Les barres du showroom se lisent dans ces chiffres :
   ce qu'on voit au plateau, c'est ce qu'on sent sur le circuit. */
const CARACTERE={Toyota:{v:1,a:1,g:0.95,d:1.15},BMW:{v:0.95,a:0.95,g:1,d:1.1},Lamborghini:{v:1.12,a:1.18,g:1.15,d:0.8},
  Porsche:{v:1.08,a:1.1,g:1.25,d:0.85},Nissan:{v:1.1,a:1.2,g:1.2,d:0.8},Ferrari:{v:1.12,a:1.05,g:0.95,d:1.1}};
function perfDuModele(marque,t){
  const p=perfDuTuning(t), k=CARACTERE[marque]||{v:1,a:1,g:1,d:1};
  return Object.assign({},p,{vmax:p.vmax*k.v,acc:p.acc*k.a,grip:p.grip*k.g,drift:p.drift/k.d});
}
function notesDe(marque,t){
  const p=perfDuModele(marque,t), r=x=>Math.max(1,Math.min(10,Math.round(x*10)/10));
  return {vit:r(p.vmax/50),acc:r(p.acc*6.6),tenue:r(p.grip/1.5),drift:r(7.6/p.drift*0.9)};
}
let caler2=null;
async function ouvrirConcessionTokyo(ongletDepart){
  if(ouvrirConcessionTokyo.ouvert)return;
  ouvrirConcessionTokyo.ouvert=true;
  /* LE PLATEAU NÉON : plein écran, fond de nuit violet. La racine défile ; la
     barre d'onglets reste collée en bas, au-dessus de la zone du geste iOS. */
  if(!document.getElementById('cssCc')){const st=document.createElement('style');st.id='cssCc';st.textContent=
`#ccRacine{position:absolute;inset:0;display:flex;flex-direction:column;color:#fff;overflow:hidden;
 background:radial-gradient(120% 60% at 50% 34%,#3a1550 0%,#160b26 55%,#0a0612 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
#ccRacine button{-webkit-appearance:none;appearance:none;font-family:inherit;cursor:pointer}
#ccDefile{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px 12px;position:relative}
/* LE SHOWROOM NE DÉFILE PAS : tout tient dans l'écran, quelle que soit sa hauteur.
   Le plateau prend la place qui reste, la voiture se règle sur lui. */
#ccDefile.fixe{overflow:hidden;display:flex;flex-direction:column}
#ccDefile.fixe #ccCorps{flex:1;min-height:0;display:flex;flex-direction:column}
#ccDefile.fixe #ccBulle{min-height:0!important;margin-top:4px!important}
#ccDefile.fixe .ccBtns{margin-top:auto;padding-top:clamp(10px,2vh,18px)}
#ccHaut{display:flex;align-items:center;justify-content:space-between;gap:12px}
#ccSur{display:block;font:700 10px ui-monospace,monospace;letter-spacing:3px;color:#ff6fb5}
#ccTitre{display:block;font:800 26px/1.1 -apple-system,sans-serif;margin-top:5px}
#ccX{flex:none;width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:18px}
#ccNav{flex:none;display:flex;justify-content:space-around;background:rgba(10,6,18,.92);border-top:1px solid rgba(255,255,255,.08);
 padding:8px 4px calc(env(safe-area-inset-bottom,0px) + 8px)}
#ccNav button{flex:1;min-height:52px;border:0;background:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
 font:700 10px -apple-system,sans-serif;letter-spacing:.4px;color:rgba(255,255,255,.45)}
#ccNav button.on{color:#ff6fb5}
#ccNav svg{width:22px;height:22px}
.ccScene{position:relative;flex:1 1 auto;min-height:110px;max-height:360px;margin-top:6px;touch-action:none}
.ccNeon{position:absolute;left:0;right:0;top:6px;height:2px;background:linear-gradient(90deg,transparent,#ff4fb0,#7fe8ff,transparent);opacity:.55}
.ccDisque{position:absolute;left:50%;bottom:12%;width:min(330px,86%);height:22%;max-height:62px;transform:translateX(-50%);border-radius:50%;
 background:radial-gradient(closest-side,rgba(255,79,176,.55),rgba(127,232,255,.18) 60%,transparent);box-shadow:0 0 60px rgba(255,79,176,.35)}
.ccDisque:after{content:'';position:absolute;inset:8px 18px;border-radius:50%;border:2px solid rgba(255,255,255,.35)}
.ccVoit{position:absolute;left:50%;bottom:19%;transform:translateX(-50%);image-rendering:pixelated;image-rendering:crisp-edges;transition:opacity .2s}
.ccReflet{position:absolute;left:50%;bottom:-8%;transform:translateX(-50%) scaleY(-1);opacity:.15;image-rendering:pixelated;
 -webkit-mask:linear-gradient(0deg,#000,transparent 60%);mask:linear-gradient(0deg,#000,transparent 60%)}
.ccFl{position:absolute;top:42%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font:400 26px/1 sans-serif}
.ccFl.g{left:0}.ccFl.d{right:0}
.ccNom{text-align:center}
.ccNom small{font:700 10px ui-monospace,monospace;letter-spacing:3px;color:#7fe8ff}
.ccNom b{display:block;font:800 clamp(22px,3.6vh,30px)/1.05 -apple-system,sans-serif;margin-top:4px}
.ccNom em{display:block;font-style:normal;color:rgba(255,255,255,.55);font-size:13px;margin-top:4px}
.ccPts{display:flex;justify-content:center;gap:6px;margin-top:clamp(6px,1.2vh,12px)}
.ccPts i{width:6px;height:6px;border-radius:3px;background:rgba(255,255,255,.25);transition:width .2s}
.ccPts i.on{width:20px;background:#ff4fb0}
.ccStats{margin:clamp(8px,2vh,18px) 2px 0;display:grid;gap:clamp(5px,1.1vh,10px)}
.ccSt{display:grid;grid-template-columns:104px minmax(0,1fr) 38px;gap:0 8px;align-items:center;font-size:13px;color:rgba(255,255,255,.72)}
.ccSt u{height:6px;border-radius:3px;background:rgba(255,255,255,.1);position:relative;overflow:hidden;text-decoration:none}
.ccSt u:after{content:'';position:absolute;inset:0;width:var(--v);background:linear-gradient(90deg,#ff4fb0,#7fe8ff);border-radius:3px}
.ccSt b{text-align:right;color:#fff}
.ccRec{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:clamp(8px,1.6vh,16px) 2px 0;padding:clamp(7px,1.2vh,10px) 14px;border-radius:14px;background:rgba(255,255,255,.06);
 font:700 12px ui-monospace,monospace;color:rgba(255,255,255,.6)}
.ccRec b{color:#ffd98a;font-size:15px}
.ccBtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:clamp(10px,2vh,18px)}
.ccBtns button{min-width:0;height:clamp(46px,6.5vh,56px);border-radius:16px;border:0;font:800 16px -apple-system,sans-serif;color:#fff}
.ccGo{background:linear-gradient(180deg,#ff3fa4,#d4006f);box-shadow:0 4px 0 #8a0048,0 0 24px rgba(255,63,164,.4)}
.ccGo:active{transform:translateY(2px);box-shadow:0 2px 0 #8a0048}
.ccLock{background:rgba(255,255,255,.08)!important;color:rgba(255,255,255,.55)!important;border:1px solid rgba(255,255,255,.14)!important}
.ccLigneRec{display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;background:rgba(255,255,255,.06);margin-top:10px}
.ccLigneRec img{width:96px;image-rendering:pixelated;flex:none}
.ccLigneRec div{flex:1;min-width:0}
.ccLigneRec b{display:block;font-size:15px}
.ccLigneRec small{display:block;font:700 11px ui-monospace,monospace;color:rgba(255,255,255,.5);margin-top:3px}
.ccLigneRec i{font-style:normal;font:700 16px ui-monospace,monospace;color:#ffd98a}
.ccLigneRec button{flex:none;height:40px;padding:0 14px;border-radius:12px;border:0;background:#ff4fb0;color:#fff;font:700 13px sans-serif}`;
  document.head.appendChild(st);}
  $('page2Fond').className='';
  $('page2Fond').innerHTML=
    '<div id="ccRacine"><div id="ccDefile">'+
      '<div id="ccHaut"><div><small id="ccSur"></small><b id="ccTitre"></b></div><button id="ccX" aria-label="Sortir">✕</button></div>'+
      '<div id="ccCorps"></div>'+
      '<div id="ccBulle" style="min-height:20px;margin-top:12px;font:600 14px sans-serif;color:#ff8ac8;text-align:center"></div>'+
    '</div><nav id="ccNav"></nav></div>';
  $('page2').classList.add('on');
  $('ccX').onclick=fermerConcessionTokyo;
  const bulle=t=>{$('ccBulle').textContent=t||'';};
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let vehicules=[];
  try{const r=await fetch('assets/voitures/catalogue.json');vehicules=((await r.json()).vehicules)||[];}catch(x){}
  const ORIGINE={Toyota:'Japonaise',Nissan:'Japonaise',BMW:'Allemande',Porsche:'Allemande',Lamborghini:'Italienne',Ferrari:'Italienne'};
  const sprite=v=>{const p=(v&&v.photos||[]).find(q=>q.role==='sprite_pixel');return p?p.fichier:'';};
  const nom=v=>v?[v.marque,v.modele].filter(Boolean).join(' '):'Voiture';
  const modele=id=>vehicules.find(v=>v.id===id);
  let onglet=ongletDepart||0, idx=ouvrirConcessionTokyo.idx||0, choisie=0;
  const IC={sh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l2-5h14l2 5v5H3z"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/></svg>',
    ga:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-6 9 6v10H3z"/><path d="M7 20v-6h10v6"/></svg>',
    tu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 7l3-3 3 3-3 3M4 20l9-9M11 4a4 4 0 0 0 5 5"/></svg>',
    re:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/></svg>'};
  const NAV=[['Showroom',IC.sh],['Garage',IC.ga],['Tuning',IC.tu],['Records',IC.re]];
  const nav=()=>{
    $('ccNav').innerHTML=NAV.map(([t,i],k)=>'<button data-nav="'+k+'" class="'+(k===onglet?'on':'')+'">'+i+t+'</button>').join('');
    $('ccNav').querySelectorAll('button').forEach(b=>{b.onclick=()=>{onglet=+b.dataset.nav;bulle('');rendre();};});
  };
  /* ---------- LE SHOWROOM : une voiture à la fois, sur le plateau ---------- */
  const showroom=()=>{
    $('ccSur').textContent='東京 · SHOWROOM';$('ccTitre').textContent='Concession';
    if(!vehicules.length){$('ccCorps').innerHTML='<p style="color:#ff8ac8;margin-top:20px">Le catalogue ne répond pas.</p>';return;}
    idx=(idx+vehicules.length)%vehicules.length;ouvrirConcessionTokyo.idx=idx;
    const v=vehicules[idx], t=tuningDe(v,null), N=notesDe(v.marque,t), rec=chronoRecords()[nom(v)];
    const st=(l,x)=>'<div class="ccSt">'+l+'<u style="--v:'+(x*10)+'%"></u><b>'+x.toFixed(1).replace('.',',')+'</b></div>';
    $('ccCorps').innerHTML=
      '<div class="ccScene" id="ccScene"><div class="ccNeon"></div><div class="ccDisque"></div>'+
        '<canvas class="ccReflet" id="ccRefl"></canvas><canvas class="ccVoit" id="ccVoit"></canvas>'+
        '<button class="ccFl g" id="ccPrec" aria-label="Précédente">‹</button><button class="ccFl d" id="ccSuiv" aria-label="Suivante">›</button></div>'+
      '<div class="ccNom"><small>'+esc(v.marque.toUpperCase())+' · '+(idx+1)+' / '+vehicules.length+'</small><b>'+esc(v.modele)+'</b>'+
        '<em>'+esc([v.carrosserie,ORIGINE[v.marque],v.tuning?'personnalisable':''].filter(Boolean).join(' · '))+'</em></div>'+
      '<div class="ccPts">'+vehicules.map((_,i)=>'<i class="'+(i===idx?'on':'')+'"></i>').join('')+'</div>'+
      '<div class="ccStats">'+st('Vitesse',N.vit)+st('Accélération',N.acc)+st('Tenue de route',N.tenue)+st('Drift',N.drift)+'</div>'+
      '<div class="ccRec"><span>★ TON RECORD AU CIRCUIT</span><b>'+fmtTour(rec)+'</b></div>'+
      '<div class="ccBtns"><button class="ccGo" id="ccEssai">Essayer</button><button class="ccLock" id="ccAchat">🔒 Bientôt</button></div>';
    /* LA VOITURE À L'ÉCHELLE ENTIÈRE : chaque pixel du dessin devient un carré
       d'un nombre ENTIER de pixels de l'écran, et la largeur suit la hauteur.
       Étirée à une échelle quelconque (et un peu plus en haut qu'en large quand
       la largeur butait), la voiture avait des pixels inégaux et une caisse
       écrasée : elle était laide. */
    const caler=()=>{const sc=$('ccScene'), c=$('ccVoit');if(!sc||!c||!c.width)return;
      const dpr=window.devicePixelRatio||1, aw=sc.clientWidth*0.86, ah=Math.min(sc.clientHeight*0.62,170);
      const k=Math.max(1,Math.floor(Math.min(aw*dpr/c.width,ah*dpr/c.height)));
      for(const id of ['ccVoit','ccRefl']){const q=$(id);q.style.width=(c.width*k/dpr)+'px';q.style.height=(c.height*k/dpr)+'px';}};
    chargerImgTK(sprite(v)).then(img=>{if(!img||!$('ccVoit'))return;const r=repeindreProfil(img,t);
      for(const id of ['ccVoit','ccRefl']){const c=$(id);c.width=r.width;c.height=r.height;c.getContext('2d').drawImage(r,0,0);}caler();});
    if(!ouvrirConcessionTokyo.calage){ouvrirConcessionTokyo.calage=true;addEventListener('resize',()=>{try{caler2&&caler2();}catch(x){}});}
    caler2=caler;
    const aller=d=>{idx+=d;bulle('');rendre();};
    $('ccPrec').onclick=()=>aller(-1);$('ccSuiv').onclick=()=>aller(1);
    /* glisser le doigt sur le plateau fait tourner la vitrine */
    let x0=null;const sc=$('ccScene');
    sc.addEventListener('touchstart',ev=>{x0=ev.touches[0].clientX;},{passive:true});
    sc.addEventListener('touchend',ev=>{if(x0==null)return;const dx=ev.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)aller(dx<0?1:-1);},{passive:true});
    $('ccEssai').onclick=()=>{fermerConcessionTokyo();debutEssai(v);};
    $('ccAchat').onclick=()=>bulle("La vente n'est pas encore ouverte : tu peux seulement l'essayer.");
  };
  /* ---------- LES RECORDS : le meilleur tour de chaque voiture ---------- */
  const records=()=>{
    $('ccSur').textContent='東京 · CIRCUIT';$('ccTitre').textContent='Records';
    const R=chronoRecords();
    const L=vehicules.map(v=>({v,t:R[nom(v)]})).sort((a,b)=>(a.t==null)-(b.t==null)||(a.t||0)-(b.t||0));
    $('ccCorps').innerHTML='<p style="margin-top:12px;color:rgba(255,255,255,.6);font-size:13px;line-height:1.5">Ton meilleur tour du circuit de Tokyo, voiture par voiture. Le chrono part sur la ligne d’arrivée.</p>'+
      L.map(({v,t},k)=>'<div class="ccLigneRec"><img src="'+sprite(v)+'" alt=""><div><b>'+esc(nom(v))+'</b><small>'+(t!=null?(k===0?'🏆 TA PLUS RAPIDE':'MEILLEUR TOUR'):'PAS ENCORE DE TOUR')+'</small></div>'+
        (t!=null?'<i>'+fmtTour(t)+'</i>':'<button data-essai="'+esc(v.id)+'">Essayer</button>')+'</div>').join('');
    $('ccCorps').querySelectorAll('button[data-essai]').forEach(b=>{b.onclick=()=>{fermerConcessionTokyo();debutEssai(modele(b.dataset.essai));};});
  };
  /* ---------- MON GARAGE : le plan des places, la voiture choisie en grand, ses compteurs ---------- */
  const garage=()=>{
    $('ccSur').textContent='東京 · MON GARAGE';$('ccTitre').textContent='Mon garage';
    const G=garageDuJoueur();
    if(choisie>=G.length)choisie=0;
    const parPlace=[];for(const v of G)parPlace[v.place]=v;
    let h='<div style="border-radius:22px;background:#2c2b38;padding:14px 10px 10px;display:grid;grid-template-columns:1fr 1fr;gap:10px 0">';
    for(let p=0;p<PLACES_GARAGE;p++){
      const v=parPlace[p], sel=v&&G.indexOf(v)===choisie;
      h+='<button data-place="'+p+'" style="height:112px;margin:0 4px;border:0;border-left:2px solid #ffffff70;border-right:2px solid #ffffff70;border-bottom:2px solid #ffffff70;background:'+(sel?'#ff4fb022':'transparent')+';box-shadow:'+(sel?'inset 0 0 0 2px #ff4fb0':'none')+';position:relative;display:grid;place-items:center;color:#ffffff80;font:600 12px sans-serif">'+
        '<span style="position:absolute;top:4px;left:6px;font:700 10px sans-serif">'+(p+1)+'</span>'+
        (v?'<canvas data-dessus="'+esc(v.modele)+'" width="32" height="68" style="width:40px;height:85px;image-rendering:pixelated"></canvas>':'libre')+'</button>';
    }
    h+='</div>';
    if(!G.length){
      h+='<div style="margin-top:14px;border:2px dashed rgba(255,255,255,.2);border-radius:22px;padding:20px;text-align:center;color:rgba(255,255,255,.6);font-size:14px;line-height:1.5">'+
        '<b style="display:block;color:#fff;font-size:17px;margin-bottom:4px">Ton garage est vide</b>'+
        'La vente n’est pas encore ouverte. En attendant, tu peux essayer toutes les voitures au showroom.'+
        '<button id="ccVersShowroom" style="display:block;width:100%;margin-top:14px;min-height:50px;border-radius:14px;border:0;background:#ff4fb0;color:#fff;font:700 15px sans-serif">Voir le showroom</button></div>';
    }else{
      const v=G[choisie], m=modele(v.modele);
      h+='<div style="margin-top:14px;border-radius:24px;background:linear-gradient(#2a1840,#120a20);padding:18px 10px 10px;position:relative">'+
        '<span style="position:absolute;top:12px;left:14px;font:800 12px sans-serif;color:rgba(255,255,255,.5)">'+(choisie+1)+' / '+G.length+' · PLACE '+(v.place+1)+'</span>'+
        '<img src="'+sprite(m)+'" alt="'+esc(nom(m))+'" style="display:block;width:100%;height:auto;margin-top:16px;image-rendering:pixelated"></div>'+
        '<b style="display:block;font:800 22px sans-serif;margin-top:12px">'+esc(nom(m))+'</b>'+
        '<small style="color:rgba(255,255,255,.6);font-size:13px">'+(v.nom?'« '+esc(v.nom)+' »':'Sans nom de garage')+'</small>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">'+
          [[(v.km||0).toFixed(1)+' km','parcourus'],[v.drifts||0,'drifts'],[v.sorties||0,'sorties']].map(([a,b])=>'<div style="background:rgba(255,255,255,.06);border-radius:14px;padding:12px 4px;text-align:center;font-size:11px;color:rgba(255,255,255,.6)"><b style="display:block;color:#fff;font-size:17px">'+a+'</b>'+b+'</div>').join('')+
        '</div>'+
        '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button id="ccRenommer" style="flex:1;min-height:50px;border-radius:14px;border:0;background:rgba(255,255,255,.08);font:700 14px sans-serif;color:#fff">Renommer</button>'+
          '<button id="ccTuning" style="flex:1;min-height:50px;border-radius:14px;border:0;background:rgba(255,255,255,.08);font:700 14px sans-serif;color:#fff">Tuning</button></div>'+
        '<button id="ccVolant" style="display:block;width:100%;margin-top:8px;min-height:56px;border-radius:16px;border:0;background:#ff4fb0;color:#fff;font:800 16px sans-serif">Prendre le volant</button>';
    }
    $('ccCorps').innerHTML=h;
    $('ccCorps').querySelectorAll('canvas[data-dessus]').forEach(c=>{
      const m=modele(c.dataset.dessus), t=peindreVoitureDessus(m?m.marque:'Toyota'), g=c.getContext('2d');
      g.imageSmoothingEnabled=false;g.translate(16,34);g.rotate(-Math.PI/2);g.drawImage(t,-34,-16);});
    $('ccCorps').querySelectorAll('button[data-place]').forEach(b=>{b.onclick=()=>{
      const v=parPlace[+b.dataset.place];
      if(!v){bulle('Place libre : la vente ouvrira bientôt.');return;}
      choisie=G.indexOf(v);bulle('');rendre();};});
    if($('ccVersShowroom'))$('ccVersShowroom').onclick=()=>{onglet=0;rendre();};
    if(G.length){
      const v=G[choisie];
      $('ccVolant').onclick=()=>{fermerConcessionTokyo();debutEssai(modele(v.modele)||{marque:'Toyota',modele:''},v);};
      $('ccTuning').onclick=()=>{selT={garage:v};onglet=2;rendre();};
      $('ccRenommer').onclick=()=>{
        const n=prompt('Le nom de ta voiture',v.nom||'');
        if(n===null)return;
        v.nom=n.trim().slice(0,24);try{sauver();}catch(x){}rendre();};
    }
  };
  /* ---------- LE TUNING ---------- */
  let selT=null, sect=0;
  const tuning=()=>{
    $('ccSur').textContent='東京 · ATELIER';$('ccTitre').textContent='Tuning';
    const G=garageDuJoueur();
    if(!selT)selT=G.length?{garage:G[0]}:(vehicules[0]?{modele:vehicules[0].id}:null);
    if(!selT){$('ccCorps').innerHTML='<p style="color:#ff8ac8">Le catalogue ne répond pas.</p>';return;}
    const m=selT.garage?modele(selT.garage.modele):modele(selT.modele);
    const t=selT.garage?tuningDe(m||{},selT.garage):tuningDe(m,null);
    const pf=perfDuModele(m&&m.marque,t), base=perfDuTuning({});
    const puce=(on,txt,data)=>'<button '+data+' style="flex:none;min-height:40px;padding:0 14px;border-radius:20px;border:0;font:600 13px sans-serif;background:'+(on?'#ff4fb0':'rgba(255,255,255,.08)')+';color:#fff'+'">'+txt+'</button>';
    const pastille=(on,col,data,txt)=>'<button '+data+' aria-label="'+(txt||col)+'" style="flex:none;width:40px;height:40px;border-radius:50%;border:'+(on?'3px solid #ff4fb0':'2px solid rgba(255,255,255,.2)')+';background:'+(col||'#fff')+';font:700 10px sans-serif;color:rgba(255,255,255,.6);box-shadow:'+(on?'0 0 0 2px #fff inset':'none')+'">'+(col?'':(txt||'∅'))+'</button>';
    const ligne=(titre,contenu)=>'<div style="margin-top:14px"><small style="display:block;font:700 11px sans-serif;letter-spacing:2px;color:rgba(255,255,255,.5);margin-bottom:8px">'+titre+'</small><div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">'+contenu+'</div></div>';
    const barre=(titre,v,max)=>'<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font:600 12px sans-serif"><span>'+titre+'</span><span style="color:rgba(255,255,255,.5)">'+Math.round(v)+' / '+max+'</span></div><div style="height:8px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:4px;overflow:hidden"><div style="height:100%;width:'+Math.min(100,v/max*100)+'%;background:linear-gradient(90deg,#ff4fb0,#7fe8ff);border-radius:4px"></div></div></div>';
    /* le choix de la voiture : les miennes d'abord, puis celles du showroom (à l'essai) */
    let h='<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none">'+
      G.map((v,i)=>puce(selT.garage===v,esc((v.nom||nom(modele(v.modele))).slice(0,18)),'data-selg="'+i+'"')).join('')+
      vehicules.map(v=>puce(!selT.garage&&selT.modele===v.id,esc(nom(v))+(G.length?' · essai':''),'data-selm="'+esc(v.id)+'"')).join('')+'</div>';
    /* l'aperçu : profil repeint, vue de dessus, néon */
    h+='<div style="border-radius:24px;background:linear-gradient(#2a1840,#120a20);padding:14px 10px 12px;position:relative;overflow:hidden">'+
      (t.neon?'<div style="position:absolute;left:8%;right:8%;bottom:26px;height:26px;border-radius:50%;background:'+t.neon+';filter:blur(12px);opacity:.8"></div>':'')+
      '<canvas id="ccProfil" style="display:block;width:100%;height:auto;image-rendering:pixelated;position:relative"></canvas>'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;position:relative"><small style="font:700 11px sans-serif;color:rgba(255,255,255,.5)">'+esc(nom(m))+(selT.garage?' · MA VOITURE':' · À L’ESSAI')+'</small><canvas id="ccDessus" width="68" height="32" style="width:102px;height:48px;image-rendering:pixelated"></canvas></div></div>';
    /* les trois ateliers */
    h+='<div style="display:flex;gap:6px;margin-top:14px;background:rgba(255,255,255,.08);border-radius:14px;padding:4px">'+
      ['Carrosserie','Néons & vitres','Moteur'].map((x,i)=>'<button data-sect="'+i+'" style="flex:1;min-height:40px;border-radius:10px;border:0;font:700 13px sans-serif;background:'+(i===sect?'#ff4fb0':'transparent')+';color:#fff;box-shadow:none">'+x+'</button>').join('')+'</div>';
    if(sect===0){
      h+=ligne('PEINTURE',pastille(!t.couleur,'','data-k="couleur" data-v=""','Orig.')+TEINTES_TK.map(c=>pastille(t.couleur===c,c,'data-k="couleur" data-v="'+c+'"')).join(''));
      h+=ligne('AILERON',[['origine','D’origine'],['aucun','Aucun'],['levre','Lèvre'],['haut','Haut'],['grand','GT géant']].map(([k,x])=>puce((t.aileron||'origine')===k,x,'data-k="aileron" data-v="'+k+'"')).join(''));
      h+=ligne('TOIT',[['origine','Caisse'],['noir','Noir'],['carbone','Carbone']].map(([k,x])=>puce((t.toit||'origine')===k,x,'data-k="toit" data-v="'+k+'"')).join(''));
      h+=ligne('BANDES DE COURSE',pastille(!t.bandes,'','data-k="bandes" data-v=""','Non')+['#f4f4f6','#0b0b0f','#ffd21f','#ff4fb0','#1a5fd0','#d01426'].map(c=>pastille(t.bandes===c,c,'data-k="bandes" data-v="'+c+'"')).join(''));
    }else if(sect===1){
      h+=ligne('NÉON SOUS CAISSE',pastille(!t.neon,'','data-k="neon" data-v=""','Non')+NEONS_TK.map(c=>pastille(t.neon===c,c,'data-k="neon" data-v="'+c+'"')).join(''));
      h+=ligne('VITRES TEINTÉES',[['0','Claires'],['1','Légères'],['2','Foncées'],['3','Limo']].map(([k,x])=>puce(String(t.vitres||0)===k,x,'data-k="vitres" data-v="'+k+'" data-n="1"')).join(''));
    }else{
      h+=ligne('MOTEUR',[['0','Origine'],['1','Stage 1'],['2','Stage 2'],['3','Stage 3']].map(([k,x])=>puce(String(t.moteur||0)===k,x,'data-k="moteur" data-v="'+k+'" data-n="1"')).join(''));
      h+=ligne('TURBO',[['0','Aucun'],['1','Simple'],['2','Gros turbo']].map(([k,x])=>puce(String(t.turbo||0)===k,x,'data-k="turbo" data-v="'+k+'" data-n="1"')).join(''));
      h+=ligne('PNEUS',[['route','Route'],['sport','Sport'],['drift','Drift']].map(([k,x])=>puce((t.pneus||'route')===k,x,'data-k="pneus" data-v="'+k+'"')).join(''));
      h+='<div style="margin-top:12px;background:rgba(255,255,255,.05);border-radius:16px;padding:4px 12px 12px">'+
        barre('Accélération',pf.acc*60,120)+barre('Vitesse max',pf.vmax/3.4,150)+barre('Adhérence',pf.grip*8,100)+barre('Glisse en drift',(1.5-pf.drift)*80,100)+'</div>';
    }
    h+='<div style="display:flex;gap:8px;margin-top:16px"><button id="ccRaz" style="flex:1;min-height:52px;border-radius:14px;border:0;background:rgba(255,255,255,.08);font:700 14px sans-serif;color:#fff">Tout d’origine</button>'+
      '<button id="ccEssaiT" style="flex:1.6;min-height:52px;border-radius:14px;border:0;background:#ff4fb0;color:#fff;font:800 15px sans-serif">'+(selT.garage?'Prendre le volant':'Essayer ce tuning')+'</button></div>'+
      '<p style="margin-top:10px;font-size:12px;color:rgba(255,255,255,.5);text-align:center">Gratuit pour l’instant · chaque réglage est enregistré tout de suite.</p>';
    $('ccCorps').innerHTML=h;
    /* les aperçus */
    const pd=$('ccDessus').getContext('2d');pd.imageSmoothingEnabled=false;pd.drawImage(peindreVoitureDessus(m?m.marque:'Toyota',t),0,0);
    chargerImgTK(sprite(m)).then(img=>{const cv=$('ccProfil');if(!img||!cv)return;const r=repeindreProfil(img,t);cv.width=r.width;cv.height=r.height;cv.getContext('2d').drawImage(r,0,0);});
    /* les gestes */
    $('ccCorps').querySelectorAll('button[data-selg]').forEach(b=>{b.onclick=()=>{selT={garage:G[+b.dataset.selg]};rendre();};});
    $('ccCorps').querySelectorAll('button[data-selm]').forEach(b=>{b.onclick=()=>{selT={modele:b.dataset.selm};rendre();};});
    $('ccCorps').querySelectorAll('button[data-sect]').forEach(b=>{b.onclick=()=>{sect=+b.dataset.sect;rendre();};});
    $('ccCorps').querySelectorAll('button[data-k]').forEach(b=>{b.onclick=()=>{
      const k=b.dataset.k, v=b.dataset.v;
      if(v===''||v==='origine')delete t[k];else t[k]=b.dataset.n?+v:v;
      if(t[k]===0)delete t[k];
      try{sauver();}catch(x){}
      const y=$('ccDefile').scrollTop;rendre();$('ccDefile').scrollTop=y;};});
    $('ccRaz').onclick=()=>{for(const k of Object.keys(t))delete t[k];try{sauver();}catch(x){}rendre();};
    $('ccEssaiT').onclick=()=>{fermerConcessionTokyo();debutEssai(m||{marque:'Toyota'},selT.garage||null);};
  };
  const rendre=()=>{nav();$('ccDefile').classList.toggle('fixe',onglet===0);(onglet===3?records:onglet===2?tuning:onglet===1?garage:showroom)();$('ccDefile').scrollTop=0;};
  rendre();
}

/* ================= L'ESSAI : CONDUIRE UNE VOITURE DU SHOWROOM =================
   Vue de dessus. Le joystick donne le CAP voulu : la voiture braque vers lui
   et accélère selon la poussée ; on lâche, elle roule en roue libre et freine.
   LE DRIFT : la vitesse se décompose en avant et en travers. L'adhérence en
   travers est forte d'ordinaire ; à pleine vitesse, quand on braque fort,
   elle s'effondre et l'arrière décroche. Traces de pneus et fumée au sol. */
/* LE CIRCUIT : l'axe de la piste est un rectangle aux coins arrondis (rayon r),
   la piste fait ep de large. La ligne d'arrivée coupe la ligne droite du haut. */
const CIRCUIT={x0:230,y0:288,x1:830,y1:830,r:150,ep:100,ligne:540};
function rondRect(g,x0,y0,x1,y1,r){g.moveTo(x0+r,y0);g.arcTo(x1,y0,x1,y1,r);g.arcTo(x1,y1,x0,y1,r);g.arcTo(x0,y1,x0,y0,r);g.arcTo(x0,y0,x1,y0,r);g.closePath();}
/* la distance à l'axe : le rectangle arrondi est le rectangle intérieur gonflé de r */
function horsPiste(x,y){
  const C=CIRCUIT;
  if(y>TK.route[0]-4&&y<TK.route[1]+4&&x<C.x1-C.r)return 0;          /* la ligne droite et les stands */
  const ix=Math.max(C.x0+C.r,Math.min(C.x1-C.r,x)), iy=Math.max(C.y0+C.r,Math.min(C.y1-C.r,y));
  const d=Math.hypot(x-ix,y-iy);
  return Math.max(0,Math.abs(d-C.r)-C.ep/2);
}
const ESSAI={actif:false,x:0,y:0,ang:0,vx:0,vy:0,toile:null,traces:[],fumee:[],nom:'',retour:null};
/* VOITURES VUES DU DESSUS, pixel par pixel. L'avant vers la droite.
   Chaque colonne a sa demi-largeur (le profil de la caisse) ; l'ombrage se fait
   par bandes selon la distance à l'axe, comme une carrosserie bombée. */
const MODELES_DESSUS={
  Toyota:     {c:['#5a0610','#9a0c1a','#d01426','#ee4a58','#ff9aa2'],L:62,hw:13,nez:9,arr:4,cab:[22,41],ail:'haut',ph:'long',det:'bosse'},
  BMW:        {c:['#0a2550','#123f8f','#1a5fd0','#4a86ea','#a4c4ff'],L:61,hw:13,nez:3,arr:3,cab:[17,41],ail:'levre',ph:'carre',det:'nervures'},
  Lamborghini:{c:['#1d4a12','#2f7f22','#5cc83a','#8ee46a','#d4ffb8'],L:63,hw:14,nez:11,arr:3,cab:[26,43],ail:'levre',ph:'fleche',det:'lames',toit:'noir'},
  Porsche:    {c:['#6c7078','#a7abb3','#dfe2e8','#f4f5f8','#ffffff'],L:58,hw:13,nez:9,arr:7,cab:[19,39],ail:'grand',ph:'rond',det:'grille'},
  Nissan:     {c:['#24262c','#3c3f47','#61656f','#878b95','#b9bcc4'],L:63,hw:14,nez:7,arr:3,cab:[21,41],ail:'haut',ph:'long',det:'bosse'},
  Ferrari:    {c:['#5a0608','#a00c14','#d8141e','#f04a50','#ffa0a0'],L:61,hw:14,nez:8,arr:3,cab:[25,40],ail:'grand',ph:'carre',det:'lames'}
};
function teinte(h,f){const n=[1,3,5].map(i=>parseInt(h.substr(i,2),16));
  return 'rgb('+n.map(v=>Math.round(f>0?v+(255-v)*f:v*(1+f))).join(',')+')';}
/* cinq nuances tirées d'une seule couleur : ombre, flanc, teinte, lumière, reflet */
function nuancier(h){return [teinte(h,-0.62),teinte(h,-0.3),h,teinte(h,0.3),teinte(h,0.62)];}
function peindreVoitureDessus(marque,t){
  t=t||{};
  const M=Object.assign({},MODELES_DESSUS[marque]||MODELES_DESSUS.Toyota);
  if(t.couleur)M.c=nuancier(t.couleur);
  if(t.aileron&&t.aileron!=='origine')M.ail=t.aileron;
  if(t.toit&&t.toit!=='origine')M.toit=t.toit;
  const WC=68,HC=32,cy=15.5,x0=Math.floor((WC-M.L)/2),x1=x0+M.L-1;
  const c=document.createElement('canvas');c.width=WC;c.height=HC;
  const g=c.getContext('2d');
  const P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};
  const ra=x0+Math.round(M.L*0.2), rv=x0+Math.round(M.L*0.77);
  /* la demi-largeur de chaque colonne : arrière arrondi, ailes à peine gonflées, nez pincé */
  const demi=x=>{
    let h=M.hw-0.8;
    for(const r of [ra,rv]){const d=Math.abs(x-r);if(d<9)h+=0.9*Math.cos(d/9*Math.PI/2);}
    const ar=x-x0, av=x1-x;
    if(ar<M.arr)h-=Math.pow((M.arr-ar)/M.arr,1.5)*2.4;
    if(av<M.nez)h-=Math.pow((M.nez-av)/M.nez,1.7)*M.hw*0.5;
    return h;};
  /* les pneus, une rangée sous chaque aile */
  for(const r of [ra,rv])for(let x=r-4;x<=r+4;x++)for(const s of [-1,1]){
    const y=Math.round(cy+s*(demi(r)+0.4))-(s<0?1:0);P(x,y,'#0b0b0e');}
  /* la caisse, bombée : bord sombre, flanc, dessus clair, et la lumière en haut à gauche */
  const [c0,c1]=M.cab.map(v=>x0+v);
  for(let x=x0;x<=x1;x++){
    const h=demi(x);
    for(let y=0;y<HC;y++){
      const dy=y+0.5-cy, t=Math.abs(dy)/h;
      if(t>1)continue;
      let k=t>0.9?0:t>0.74?1:2;
      if(k===2&&dy<0&&t>0.22&&t<0.52)k=3;
      if(k===2&&dy>0&&t>0.55)k=1;
      P(x,y,M.c[k]);
    }
  }
  /* une arête claire au milieu du capot */
  for(let x=c1+4;x<x1-3;x++)P(x,Math.floor(cy)-1,M.c[4]);
  /* les bandes de course, d'un bout à l'autre */
  if(t.bandes){for(let x=x0+1;x<x1;x++){const h=demi(x);if(h<4)continue;
    for(const y of [Math.round(cy)-3,Math.round(cy)-2,Math.round(cy)+1,Math.round(cy)+2])P(x,y,(x+y)%9===0?teinte(t.bandes,0.25):t.bandes);}}
  /* l'habitacle : pare-brise en trapèze, toit, lunette, vitres latérales */
  const NV=t.vitres||0;
  const verre=['#0d1520','#0a1018','#070b10','#040507'][NV], verre2=['#1c2a3c','#141e2b','#0d131b','#07090d'][NV], ciel=NV>=2?'#3e5a76':'#86b0d8';
  const toit=M.toit==='noir'?['#0e0e12','#1b1b22','#2c2c36']:M.toit==='carbone'?['#15151a','#24242b','#33333c']:[M.c[1],M.c[2],M.c[3]];
  const pb=7, lu=5;
  const demiVitre=x=>{const base=demi(x)-2.6, haut=demi(x)-4.6;
    if(x>c1-pb)return haut+(base-haut)*((x-(c1-pb))/pb);
    if(x<c0+lu)return haut+(base-haut)*((c0+lu-x)/lu)*0.7;
    return haut;};
  for(let x=c0;x<=c1;x++){
    const hv=demiVitre(x);
    for(let y=0;y<HC;y++){
      const dy=y+0.5-cy, ady=Math.abs(dy);
      if(ady>hv)continue;
      if(x>c1-pb||x<c0+lu){P(x,y,ady>hv-1?verre:verre2);continue;}
      if(ady>hv-1.1){P(x,y,verre);continue;}
      const q=ady/hv;let col=q>0.72?toit[0]:dy<0&&q>0.2?toit[2]:toit[1];
      if(M.toit==='carbone'&&q<=0.72&&(x+y)%2)col=toit[0];
      P(x,y,col);
    }
  }
  /* reflets du ciel sur le pare-brise */
  for(let i=0;i<3;i++){P(c1-1-i,Math.round(cy)-4+i,ciel);}
  P(c1-3,Math.round(cy)-5,ciel);
  P(c0+1,Math.round(cy)-3,'#4a6688');
  /* rétroviseurs */
  for(const s of [-1,1]){const y=Math.round(cy+s*(demi(c1-3)+0.2))-(s<0?1:0);P(c1-3,y,M.c[1]);P(c1-2,y,M.c[2]);}
  /* lignes de portes et de capot */
  const mid=Math.round((c0+c1)/2)+1;
  for(const s of [-1,1]){const y=Math.round(cy+s*(demi(mid)-1.2))-(s<0?1:0);P(mid,y,M.c[0]);P(mid,y+s,M.c[0]);}
  for(let x=c1+3;x<x1-4;x++){for(const s of [-1,1])P(x,Math.round(cy+s*(demi(x)-3.2))-(s<0?1:0),M.c[1]);}
  /* détails propres à chaque modèle */
  if(M.det==='bosse'){for(let x=c1+5;x<c1+10;x++){P(x,Math.round(cy)-1,M.c[4]);P(x,Math.round(cy),M.c[3]);}P(c1+10,Math.round(cy)-1,'#141418');P(c1+10,Math.round(cy),'#141418');}
  if(M.det==='nervures'){for(let x=c1+3;x<x1-3;x++){P(x,Math.round(cy)-3,M.c[3]);P(x,Math.round(cy)+2,M.c[3]);}}
  if(M.det==='lames'){for(let k=0;k<5;k++){const x=x0+4+k*2;for(let y=Math.round(cy)-4;y<Math.round(cy)+4;y++)P(x,y,'#121216');}}
  if(M.det==='grille'){for(let k=0;k<4;k++)for(let x=x0+3;x<x0+8;x++)P(x,Math.round(cy)-4+k*2,'#202026');}
  /* phares */
  const phare='#fff4c8', phare2='#ffd27a';
  for(const s of [-1,1]){const y=Math.round(cy+s*(demi(x1-2)-1.6))-(s<0?1:0);
    if(M.ph==='rond'){P(x1-3,y,phare);P(x1-2,y,phare);P(x1-3,y-s,phare2);P(x1-2,y-s,phare);}
    else if(M.ph==='fleche'){P(x1-5,y,phare2);P(x1-4,y,phare);P(x1-3,y,phare);P(x1-2,y-s,phare);}
    else if(M.ph==='carre'){P(x1-2,y,phare);P(x1-2,y-s,phare);P(x1-1,y,phare2);}
    else{P(x1-4,y,phare2);P(x1-3,y,phare);P(x1-2,y,phare);P(x1-2,y-s,phare);}}
  /* feux arrière */
  for(const s of [-1,1]){const y=Math.round(cy+s*(demi(x0+1)-1.4))-(s<0?1:0);P(x0,y,'#ff3040');P(x0,y-s,'#c01020');P(x0+1,y,'#ff6070');}
  if(marque==='Porsche'){for(let y=Math.round(cy)-3;y<Math.round(cy)+3;y++)P(x0,y,'#c01020');}
  /* l'aileron */
  if(M.ail==='aucun'){}
  else if(M.ail!=='levre'){
    const ax=x0+(M.ail==='grand'?1:2), aw=M.ail==='grand'?3:2, h=M.hw+(M.ail==='grand'?0.5:-0.5);
    for(let x=ax;x<ax+aw;x++)for(let y=Math.round(cy-h);y<Math.round(cy+h);y++)P(x,y,x===ax?M.c[3]:M.c[1]);
    for(let x=ax-1;x<ax+aw+1;x++){P(x,Math.round(cy-h)-1,M.c[0]);P(x,Math.round(cy+h),M.c[0]);}
    for(let y=Math.round(cy-h);y<Math.round(cy+h);y+=3)P(ax+aw,y,M.c[0]);
  }else{for(let y=Math.round(cy)-5;y<Math.round(cy)+5;y++)P(x0+1,y,M.c[0]);}
  /* le contour, d'un pixel sombre autour de tout ce qui est peint */
  const d=g.getImageData(0,0,WC,HC), a=(x,y)=>x>=0&&y>=0&&x<WC&&y<HC&&d.data[(y*WC+x)*4+3]>0;
  const o=g.getImageData(0,0,WC,HC);
  for(let y=0;y<HC;y++)for(let x=0;x<WC;x++){if(a(x,y))continue;
    if(a(x-1,y)||a(x+1,y)||a(x,y-1)||a(x,y+1)){const i=(y*WC+x)*4;o.data[i]=12;o.data[i+1]=10;o.data[i+2]=16;o.data[i+3]=255;}}
  g.putImageData(o,0,0);
  return c;
}

/* ================= LES COMMANDES : VOLANT À GAUCHE, PÉDALES À DROITE =================
   Chaque bouton suit son propre doigt (pointer events, capture) : on tient
   l'accélérateur et on braque en même temps. Au clavier : flèches ou ZQSD,
   espace pour le frein à main. */
const CMD={g:false,d:false,gaz:false,frein:false,main:false};
let COMMANDES=null, CLAVIER=null;
function montrerCommandes(){
  if(COMMANDES)return;
  const z=document.createElement('div');z.id='tkConduite';
  z.style.cssText='position:fixed;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 104px);z-index:21;display:flex;justify-content:space-between;align-items:flex-end;padding:0 14px;pointer-events:none;-webkit-user-select:none;user-select:none;touch-action:none';
  const bouton=(cle,txt,taille,fond)=>'<button data-c="'+cle+'" style="pointer-events:auto;touch-action:none;width:'+taille+'px;height:'+taille+'px;border-radius:'+(taille/2)+'px;border:2px solid rgba(255,255,255,.35);background:'+fond+';color:#fff;font:800 '+(taille>70?15:13)+'px sans-serif;-webkit-tap-highlight-color:transparent">'+txt+'</button>';
  z.innerHTML='<div style="display:flex;gap:12px">'+bouton('g','◀',76,'rgba(20,18,30,.55)')+bouton('d','▶',76,'rgba(20,18,30,.55)')+'</div>'+
    '<div style="display:flex;gap:10px;align-items:flex-end">'+
      '<div style="display:flex;flex-direction:column;gap:10px;align-items:center">'+bouton('main','DRIFT',58,'rgba(255,79,176,.55)')+bouton('frein','FREIN',66,'rgba(20,18,30,.55)')+'</div>'+
      bouton('gaz','GAZ',88,'rgba(127,232,255,.45)')+'</div>';
  document.body.appendChild(z);
  z.querySelectorAll('button[data-c]').forEach(b=>{
    const k=b.dataset.c;
    const on=ev=>{ev.preventDefault();ev.stopPropagation();CMD[k]=true;b.style.filter='brightness(1.6)';try{b.setPointerCapture(ev.pointerId);}catch(x){}};
    const off=ev=>{if(ev){ev.preventDefault();ev.stopPropagation();}CMD[k]=false;b.style.filter='';};
    b.addEventListener('pointerdown',on);
    b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',()=>off());
    b.addEventListener('contextmenu',ev=>ev.preventDefault());
  });
  const T={ArrowLeft:'g',q:'g',a:'g',ArrowRight:'d',d:'d',ArrowUp:'gaz',z:'gaz',w:'gaz',ArrowDown:'frein',s:'frein',' ':'main'};
  CLAVIER=[ev=>{const k=T[ev.key];if(k){CMD[k]=true;ev.preventDefault();}},ev=>{const k=T[ev.key];if(k)CMD[k]=false;}];
  addEventListener('keydown',CLAVIER[0]);addEventListener('keyup',CLAVIER[1]);
  COMMANDES=z;
}
function cacherCommandes(){
  if(COMMANDES){COMMANDES.remove();COMMANDES=null;}
  if(CLAVIER){removeEventListener('keydown',CLAVIER[0]);removeEventListener('keyup',CLAVIER[1]);CLAVIER=null;}
  for(const k in CMD)CMD[k]=false;
}
/* LES PERFORMANCES DU TUNING : moteur (0 à 3), turbo (0 à 2), pneus (route, sport, drift) */
function perfDuTuning(t){
  t=t||{};const mo=t.moteur||0, tu=t.turbo||0, pn=t.pneus||'route';
  return {acc:1+0.13*mo+0.2*tu, vmax:340+28*mo+34*tu,
    grip:pn==='sport'?12.5:pn==='drift'?6.5:9, drift:pn==='drift'?0.55:pn==='sport'?1.4:0.9, seuil:pn==='drift'?140:pn==='sport'?240:210};
}
function tuningDe(v,aMoi){
  if(aMoi)return aMoi.tuning||(aMoi.tuning={});
  if(!e.configs||typeof e.configs!=='object')e.configs={};
  return e.configs[v.id]||(e.configs[v.id]={});
}
/* ================= LE SON DU MOTEUR =================
   Synthétisé, pas d'enregistrement : deux oscillateurs (dent de scie et carré
   à l'octave du dessous) saturés puis filtrés. Le régime suit la vitesse à
   travers une boîte à six rapports : il grimpe, retombe au passage du rapport,
   regrimpe — le « vroum » qui monte. Le filtre s'ouvre sous l'accélérateur.
   Les pneus crissent (bruit filtré) quand l'arrière glisse. Respecte le
   réglage « Les sons » du jeu. */
const SON_TK={ctx:null};
function demarrerMoteur(){
  try{
    if(typeof REG!=='undefined'&&REG.sons===false)return;
    const C=new (window.AudioContext||window.webkitAudioContext)();
    const sat=C.createWaveShaper();const cu=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cu[i]=Math.tanh(x*2.4);}sat.curve=cu;
    const o1=C.createOscillator();o1.type='sawtooth';
    const o2=C.createOscillator();o2.type='square';
    const g2=C.createGain();g2.gain.value=0.5;
    const filtre=C.createBiquadFilter();filtre.type='lowpass';filtre.frequency.value=600;filtre.Q.value=4;
    const vol=C.createGain();vol.gain.value=0;
    o1.connect(sat);o2.connect(g2);g2.connect(sat);sat.connect(filtre);filtre.connect(vol);vol.connect(C.destination);
    /* le crissement : un bruit blanc passé dans un passe-bande aigu */
    const nb=C.createBuffer(1,C.sampleRate,C.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const bruit=C.createBufferSource();bruit.buffer=nb;bruit.loop=true;
    const bande=C.createBiquadFilter();bande.type='bandpass';bande.frequency.value=2400;bande.Q.value=6;
    const crisse=C.createGain();crisse.gain.value=0;
    bruit.connect(bande);bande.connect(crisse);crisse.connect(C.destination);
    o1.start();o2.start();bruit.start();
    Object.assign(SON_TK,{ctx:C,o1,o2,filtre,vol,crisse,rpm:900});
  }catch(x){SON_TK.ctx=null;}
}
function majMoteur(dt,vit,gaz,glisse){
  const S=SON_TK;if(!S.ctx)return;
  /* six rapports sur la plage de vitesse : le régime monte dans chacun, puis retombe */
  const pas=70, rap=Math.min(5,Math.floor(vit/pas)), p=(vit-rap*pas)/pas;
  let cible=vit<4?(gaz?2600:900):1300+Math.min(1,p)*(rap===5?5200:5700);
  S.rpm+=(cible-S.rpm)*Math.min(1,(gaz?9:5)*dt);
  const f=S.rpm/30, t=S.ctx.currentTime;
  S.o1.frequency.setTargetAtTime(f,t,0.03);S.o2.frequency.setTargetAtTime(f/2,t,0.03);
  S.filtre.frequency.setTargetAtTime(gaz?500+S.rpm*0.55:300+S.rpm*0.2,t,0.05);
  S.vol.gain.setTargetAtTime(gaz?0.16:0.07,t,0.08);
  S.crisse.gain.setTargetAtTime(Math.min(0.12,Math.max(0,(glisse-45)/900)),t,0.05);
}
function couperMoteur(){const S=SON_TK;if(!S.ctx)return;try{S.vol.gain.setTargetAtTime(0,S.ctx.currentTime,0.05);const C=S.ctx;setTimeout(()=>{try{C.close();}catch(x){}},300);}catch(x){}S.ctx=null;}

function debutEssai(v,aMoi){
  ESSAI.actif=true;ESSAI.garage=aMoi||null;
  ESSAI.tuning=v&&v.id?tuningDe(v,aMoi):(aMoi&&aMoi.tuning)||{};
  ESSAI.perf=perfDuModele(v&&v.marque,ESSAI.tuning);
  ESSAI.halo=null;ESSAI.dist=0;ESSAI.drifts=0;ESSAI.enDrift=false;ESSAI.nom=[v.marque,v.modele].filter(Boolean).join(' ');
  ESSAI.toile=peindreVoitureDessus(v.marque,ESSAI.tuning);
  ESSAI.retour={x:joueur.x,y:joueur.y};
  ESSAI.x=CIRCUIT.ligne-160;ESSAI.y=(TK.route[0]+TK.route[1])/2+18;ESSAI.ang=0;
  ESSAI.tour=null;ESSAI.tours=0;ESSAI.cp=0;ESSAI.dernier=null;chronoMontrer(true);ESSAI.vx=0;ESSAI.vy=0;ESSAI.vol=0;
  ESSAI.traces=[];ESSAI.fumee=[];
  joueur.x=ESSAI.x;joueur.y=ESSAI.y;
  ESSAI.recul=false;
  demarrerMoteur();
  /* la caméra garde son échelle : à Tokyo, rien ne zoome tout seul */
  try{taille();videCache();}catch(x){}
}
function finEssai(){
  ESSAI.actif=false;
  /* SA PROPRE VOITURE : les compteurs du garage avancent (1 px de carte = 25 cm) */
  if(ESSAI.garage){const v=ESSAI.garage;v.km=(v.km||0)+ESSAI.dist*0.00025;v.drifts=(v.drifts||0)+ESSAI.drifts;v.sorties=(v.sorties||0)+1;try{sauver();}catch(x){}}
  ESSAI.garage=null;
  chronoMontrer(false);
  couperMoteur();
  try{taille();videCache();}catch(x){}
  const r=ESSAI.retour||{x:86,y:224};
  const [dx,dy]=degager(r.x,r.y);joueur.x=dx;joueur.y=dy;
}
/* ================= LA CONDUITE AU JOYSTICK =================
   Le joystick du jeu, celui de la marche : on le pousse vers où l'on veut aller.
   — La voiture braque vers ce cap, d'autant mieux qu'elle roule (à l'arrêt,
     elle ne pivote pas sur place).
   — La poussée est l'accélérateur ; si le cap est loin de l'axe, on lève un
     peu le pied le temps de tourner.
   — Pousser derrière soi en roulant vite : on FREINE. Pousser derrière soi
     presque à l'arrêt : on passe la MARCHE ARRIÈRE, l'arrière vise le pouce.
   — Lâcher : roue libre et frein moteur.
   — LE DRIFT : un virage serré (cap à plus de 40°) à bonne vitesse fait
     décrocher l'arrière ; il glisse tant qu'on tient l'angle.
   LES VITESSES SONT À L'ÉCHELLE DE L'ÉCRAN : la caméra zoome, une voiture à
   340 px/s traversait l'écran en une demi-seconde. On roule à la moitié. */
function majEssai(dt,jx,jy){
  dt=Math.min(dt,0.05);
  const PF=ESSAI.perf||perfDuTuning({});
  /* HORS PISTE : sur le paddock ou le trottoir, on roule au ralenti */
  const hp=horsPiste(ESSAI.x,ESSAI.y)>4;
  const VMAX=PF.vmax*0.55*(hp?0.5:1), ACC=175*PF.acc*(hp?0.7:1), FREIN=320, RECUL=-70;
  jx=jx||0;jy=jy||0;
  const n=Math.min(1,Math.hypot(jx,jy));
  const c0=Math.cos(ESSAI.ang), s0=Math.sin(ESSAI.ang);
  const av0=ESSAI.vx*c0+ESSAI.vy*s0;
  let d=0, gaz=0, frein=false, vise=false;
  if(n>0.2){
    const a=Math.atan2(jy,jx);
    d=Math.atan2(Math.sin(a-ESSAI.ang),Math.cos(a-ESSAI.ang));
    if(!ESSAI.recul&&Math.abs(d)>2.4&&av0<35)ESSAI.recul=true;
    if(ESSAI.recul&&Math.abs(d)<1.6)ESSAI.recul=false;
    if(ESSAI.recul){
      /* en marche arrière, c'est l'arrière qui vise le pouce */
      const ar=a+Math.PI;d=Math.atan2(Math.sin(ar-ESSAI.ang),Math.cos(ar-ESSAI.ang));gaz=-n;vise=true;
    }else if(Math.abs(d)>2.0&&av0>35){frein=true;}
    else{gaz=n*(Math.abs(d)<0.5?1:Math.max(0.45,Math.cos(Math.abs(d)*0.7)));vise=true;}
  }else ESSAI.recul=false;
  /* 1. LE VOLANT : on tourne vers le cap, plus vite en roulant */
  /* ARCADE : elle tourne même au pas (un peu), et franchement dès qu'elle roule */
  const prise=Math.max(0.3,Math.min(1,Math.abs(av0)/30));
  if(vise){const taux=2.3+1.9*prise;ESSAI.ang+=Math.max(-1,Math.min(1,d*2.6))*taux*prise*dt;}
  /* 2. LA VITESSE RESTE DANS LE MONDE, relue dans l'axe de la voiture */
  const nx=Math.cos(ESSAI.ang), ny=Math.sin(ESSAI.ang);
  let av=ESSAI.vx*nx+ESSAI.vy*ny;
  let tr=-ESSAI.vx*ny+ESSAI.vy*nx;
  if(gaz>0)av+=ACC*gaz*Math.max(0.06,1-Math.pow(Math.max(0,av)/VMAX,2))*dt;
  else if(gaz<0)av=Math.max(RECUL,av-ACC*0.7*(-gaz)*dt);
  if(frein)av-=Math.sign(av)*Math.min(Math.abs(av),FREIN*dt);
  if(!gaz&&!frein){av*=Math.exp(-1.5*dt);if(Math.abs(av)<4)av=0;}
  av=Math.max(RECUL,Math.min(VMAX,av));
  /* 3. L'ADHÉRENCE : elle lâche dans un virage serré pris vite */
  const derape=vise&&gaz>0&&Math.abs(d)>0.6&&av>VMAX*0.45;
  const grip=derape?PF.drift*1.8:(frein?PF.grip*0.7:PF.grip);
  tr*=Math.exp(-grip*dt);
  ESSAI.vx=av*nx-tr*ny; ESSAI.vy=av*ny+tr*nx;
  majMoteur(dt,Math.abs(av)*340/VMAX,gaz>0,Math.abs(tr)*2);
  /* LE MUR : on glisse le long au lieu de rebondir */
  const libre=(X,Y)=>!(bloqueTokyo(X,Y)||X<20||X>MONDE_L-20||Y<TK.bati+18||Y>MONDE_H-18);
  let X=ESSAI.x+ESSAI.vx*dt, Y=ESSAI.y+ESSAI.vy*dt;
  if(!libre(X,Y)){
    if(libre(X,ESSAI.y)){Y=ESSAI.y;ESSAI.vy*=-0.2;ESSAI.vx*=0.85;}
    else if(libre(ESSAI.x,Y)){X=ESSAI.x;ESSAI.vx*=-0.2;ESSAI.vy*=0.85;}
    else{X=ESSAI.x;Y=ESSAI.y;ESSAI.vx*=-0.25;ESSAI.vy*=-0.25;}
  }
  ESSAI.dist=(ESSAI.dist||0)+Math.hypot(X-ESSAI.x,Y-ESSAI.y);
  chronoPas(ESSAI.x,ESSAI.y,X,Y,dt);
  ESSAI.x=X;ESSAI.y=Y;
  /* un drift compte une fois, quand l'arrière décroche */
  if(!ESSAI.enDrift&&Math.abs(tr)>32){ESSAI.enDrift=true;ESSAI.drifts=(ESSAI.drifts||0)+1;}
  else if(ESSAI.enDrift&&Math.abs(tr)<10)ESSAI.enDrift=false;
  /* les traces de pneus et la fumée quand ça glisse */
  if(Math.abs(tr)>24){
    for(const s of [-10,10]){
      const px=ESSAI.x-nx*18-ny*s, py=ESSAI.y-ny*18+nx*s;
      /* LES TRACES SE PEIGNENT DANS LE SOL : rien à redessiner à chaque image */
      try{const gs=SOL.getContext('2d');gs.fillStyle='rgba(12,10,16,.45)';gs.fillRect(Math.round(px)-1,Math.round(py)-1,2,2);}catch(x){ESSAI.traces.push([px,py,0.55]);}
    }
    if(ESSAI.fumee.length<36&&Math.random()<0.5)ESSAI.fumee.push({x:ESSAI.x-nx*24,y:ESSAI.y-ny*24,r:4,vie:0.8});
    if(ESSAI.traces.length>900)ESSAI.traces.splice(0,ESSAI.traces.length-900);
  }
  for(const f of ESSAI.fumee){f.vie-=dt;f.r+=14*dt;}
  ESSAI.fumee=ESSAI.fumee.filter(f=>f.vie>0);
  joueur.x=ESSAI.x;joueur.y=ESSAI.y;
}
/* ================= LE CHRONO DU CIRCUIT =================
   Le tour part quand on franchit la ligne vers la droite. Pour qu'il compte,
   il faut être passé par les trois autres côtés, dans l'ordre : on ne gagne
   pas un record en faisant demi-tour sur la ligne droite. */
function chronoRecords(){try{return JSON.parse(localStorage.getItem('bdl.tk.records')||'{}')||{};}catch(x){return {};}}
function fmtTour(t){if(t==null)return '–:––.––';const m=Math.floor(t/60), sec=t-m*60;return m+':'+(sec<10?'0':'')+sec.toFixed(2);}
function chronoMontrer(on){
  let el=document.getElementById('tkChrono');
  if(!on){if(el)el.remove();return;}
  if(!el){el=document.createElement('div');el.id='tkChrono';
    el.style.cssText="position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 58px);transform:translateX(-50%);z-index:21;pointer-events:none;"+
      "display:flex;gap:14px;align-items:center;padding:7px 14px;border-radius:14px;background:rgba(14,10,24,.78);border:1px solid rgba(255,79,176,.45);"+
      "font:700 12px ui-monospace,monospace;color:#f4f2f6;white-space:nowrap;box-shadow:0 4px 18px rgba(0,0,0,.35)";
    document.body.appendChild(el);}
  chronoAfficher();
}
function chronoAfficher(){
  const el=document.getElementById('tkChrono');if(!el)return;
  const rec=chronoRecords()[ESSAI.nom];
  const enCours=ESSAI.tour!=null;
  el.innerHTML='<span style="color:#ff8ac8;font-size:9px;letter-spacing:2px">'+(enCours?'TOUR '+(ESSAI.tours+1):'PASSE LA LIGNE')+'</span>'+
    '<b style="font-size:16px">'+fmtTour(enCours?ESSAI.tour:null)+'</b>'+
    (ESSAI.dernier!=null?'<span style="color:#9ae8ff">'+fmtTour(ESSAI.dernier)+'</span>':'')+
    '<span style="color:#ffd98a">★ '+fmtTour(rec)+'</span>';
}
function chronoPas(x0,y0,x1,y1,dt){
  const C=CIRCUIT;
  if(ESSAI.tour!=null)ESSAI.tour+=dt;
  /* les trois points de passage : côté droit, bas, côté gauche */
  const cps=[(x,y)=>x>C.x1-60&&y>C.y0+C.r&&y<C.y1-C.r, (x,y)=>y>C.y1-60, (x,y)=>x<C.x0+60&&y>C.y0+C.r&&y<C.y1-C.r];
  if(ESSAI.cp<3&&cps[ESSAI.cp](x1,y1))ESSAI.cp++;
  const surLigne=y1>TK.route[0]&&y1<TK.route[1]&&x0<C.ligne&&x1>=C.ligne;
  if(surLigne){
    if(ESSAI.tour!=null&&ESSAI.cp>=3){
      const t=ESSAI.tour;ESSAI.dernier=t;ESSAI.tours++;
      const R=chronoRecords();
      if(R[ESSAI.nom]==null||t<R[ESSAI.nom]){R[ESSAI.nom]=t;try{localStorage.setItem('bdl.tk.records',JSON.stringify(R));}catch(x){}
        try{texteVolant(ESSAI.x,ESSAI.y-50,'RECORD · '+fmtTour(t),'#ffd98a');}catch(x){}}
      else{try{texteVolant(ESSAI.x,ESSAI.y-50,fmtTour(t),'#9ae8ff');}catch(x){}}
    }
    ESSAI.tour=0;ESSAI.cp=0;
  }
  ESSAI.chronoT=(ESSAI.chronoT||0)+dt;
  if(ESSAI.chronoT>0.05){ESSAI.chronoT=0;chronoAfficher();}
}
function dessinerEssai(ctx,camX,camY){
  ctx.save();
  ctx.fillStyle='rgba(12,10,16,.55)';
  for(const [x,y] of ESSAI.traces)ctx.fillRect(Math.round(x-camX)-1,Math.round(y-camY)-1,2,2);
  ctx.translate(Math.round(ESSAI.x-camX),Math.round(ESSAI.y-camY));
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,3,32,14,ESSAI.ang,0,7);ctx.fill();
  ctx.rotate(ESSAI.ang);
  if(ESSAI.tuning&&ESSAI.tuning.neon){
    if(!ESSAI.halo){const h=document.createElement('canvas');h.width=110;h.height=60;const hg=h.getContext('2d');
      const r=hg.createRadialGradient(55,30,4,55,30,52);r.addColorStop(0,ESSAI.tuning.neon);r.addColorStop(0.45,ESSAI.tuning.neon+'88');r.addColorStop(1,ESSAI.tuning.neon+'00');
      hg.fillStyle=r;hg.save();hg.translate(55,30);hg.scale(1,0.52);hg.translate(-55,-30);hg.beginPath();hg.arc(55,30,52,0,7);hg.fill();hg.restore();ESSAI.halo=h;}
    ctx.globalAlpha=0.75;ctx.drawImage(ESSAI.halo,-55,-30);ctx.globalAlpha=1;}
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(ESSAI.toile,-34,-16);
  ctx.restore();
  ctx.save();
  for(const f of ESSAI.fumee){ctx.fillStyle='rgba(220,220,230,'+(f.vie*0.4)+')';ctx.beginPath();ctx.arc(f.x-camX,f.y-camY,f.r,0,7);ctx.fill();}
  ctx.restore();
}

;({TK,lumieresTokyo,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo,ESSAI,debutEssai,finEssai,majEssai,dessinerEssai})
