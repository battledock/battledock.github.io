/* ================= TOKYO, CARTE (900 x 2560) =================
   Une carte blanche : un sol nu, les bords qui retiennent le joueur, la sortie
   vers le port à l'ouest. Rien d'autre : les immeubles, la rangée des boutiques
   et le concessionnaire sont dans l'historique (34e0ea0), à reposer ici.
   L'ancienne carte est gardée dans l'historique git. */

const TK={
  bati:206,                       /* le pied des façades du haut : au-dessus, rien ne marche */
  trottoir:[206,236],             /* le trottoir, au pied des façades : on y marche */
  rangee:0, bas:2560,              /* pas de rangée de boutiques */
  blocs:[],                       /* rien ne barre le passage */
  porte:null,                     /* pas d'armurerie */
  concessionPorte:{x:86,y0:206,y1:250,l:76},
  tuningPorte:{x:241,y0:206,y1:250,l:46},       /* devant le rideau de l'atelier de tuning, la façade en tôle */    /* devant la vitrine du concessionnaire, sur le trottoir : nulle part ailleurs */
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
  /* ================= LE GRAND CIRCUIT =================
     La route du haut est la ligne droite des stands ; la piste descend tout le
     quartier (voir PISTE). Dessinée en calques : le pavé du dehors, l'herbe des
     bas-côtés, l'asphalte, la trajectoire, les lignes de bord, les vibreurs
     dans chaque virage, les murs de pneus aux épingles. */
  const P=PISTE, ep=CIRCUIT.ep, PT=P.pts;
  const chemin=(gg)=>{gg.beginPath();gg.moveTo(PT[0].x,PT[0].y);for(let i=1;i<PT.length;i++)gg.lineTo(PT[i].x,PT[i].y);gg.closePath();};
  /* le dehors : un pavé tout autour */
  g.fillStyle='#9894a8';g.fillRect(0,TK.route[1],W,H-TK.route[1]);
  for(let yy=TK.route[1];yy<H;yy+=12)for(let xx=((yy/12)%2?0:10);xx<W;xx+=20){g.fillStyle=A(xx*0.37+yy*1.3)>.5?'#a29eb2':'#938fa4';g.fillRect(xx,yy,19,11);}
  /* le paddock, au milieu du serpentin : herbe, asphalte clair et places */
  const PK={x0:360,y0:420,x1:640,y1:1080};
  g.fillStyle='#4f8a4a';g.fillRect(PK.x0-14,PK.y0-14,PK.x1-PK.x0+28,PK.y1-PK.y0+28);
  g.fillStyle='#62616c';g.fillRect(PK.x0,PK.y0,PK.x1-PK.x0,PK.y1-PK.y0);
  for(let i=0;i<900;i++){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(PK.x0+Math.floor(A(i+300)*(PK.x1-PK.x0)),PK.y0+Math.floor(A(i+700)*(PK.y1-PK.y0)),2,1);}
  g.fillStyle='rgba(235,235,245,.5)';
  for(const y0 of [460,640,820]){for(let x=380;x<=620;x+=34){g.fillRect(x,y0,2,44);g.fillRect(x,y0+46,2,44);}g.fillRect(380,y0+44,242,2);}
  g.globalAlpha=.16;g.fillStyle='#ff4fb0';g.font='bold 40px sans-serif';g.textAlign='center';g.fillText('東京',500,1030);
  g.font='bold 14px sans-serif';g.fillText('TOKYO CIRCUIT',500,1000);g.textAlign='start';g.globalAlpha=1;
  /* LA PISTE : un calque à part, pour que le grain et les reflets restent dessus */
  const pc=document.createElement('canvas');pc.width=W;pc.height=H;const pg=pc.getContext('2d');
  pg.lineJoin='round';pg.lineCap='round';
  /* les bas-côtés en herbe */
  pg.strokeStyle='#4f8a4a';pg.lineWidth=ep+30;chemin(pg);pg.stroke();
  for(let i=0;i<5000;i++){const p=PT[Math.floor(A(i*1.7)*PT.length)], o=(A(i*2.9)-0.5)*(ep+28);
    pg.fillStyle=A(i*2.3)>.5?'rgba(120,200,110,.18)':'rgba(0,0,0,.14)';pg.fillRect(Math.round(p.x-Math.sin(p.ang)*o),Math.round(p.y+Math.cos(p.ang)*o),1,2);}
  /* l'asphalte, et la voie des stands à gauche */
  const as=document.createElement('canvas');as.width=W;as.height=H;const ag=as.getContext('2d');
  ag.lineJoin='round';ag.strokeStyle='#46454f';ag.lineWidth=ep;chemin(ag);ag.stroke();
  ag.fillStyle='#46454f';ag.fillRect(0,TK.route[0],CIRCUIT.depart+380,TK.route[1]-TK.route[0]);
  ag.globalCompositeOperation='source-atop';
  for(let i=0;i<9000;i++){ag.fillStyle='rgba(255,255,255,.045)';ag.fillRect(Math.floor(A(i+50)*W),Math.floor(A(i+90)*H),2,1);}
  const refl=['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'];
  ag.globalAlpha=.1;for(let i=0;i<200;i++){ag.fillStyle=refl[i%4];ag.fillRect(Math.floor(A(i*1.9)*W),Math.floor(A(i*3.3)*H),20+Math.floor(A(i*5.1)*60),1);}ag.globalAlpha=1;
  /* la trajectoire : une bande plus sombre où les pneus passent */
  ag.globalAlpha=.35;ag.strokeStyle='#33323b';ag.lineWidth=26;chemin(ag);ag.stroke();ag.globalAlpha=1;
  ag.globalCompositeOperation='source-over';
  pg.drawImage(as,0,0);
  /* les lignes blanches de bord, et les vibreurs dans les virages (rouge et blanc, côté intérieur et extérieur) */
  for(let i=0;i<PT.length;i++){
    const p=PT[i], nx=-Math.sin(p.ang), ny=Math.cos(p.ang);
    for(const sd of [-1,1]){
      const bx=p.x+nx*sd*(ep/2-5), by=p.y+ny*sd*(ep/2-5);
      if(p.k>0){const kx=p.x+nx*sd*(ep/2-3), ky=p.y+ny*sd*(ep/2-3);
        pg.fillStyle=(Math.floor(p.s/10)%2)?'#e0263a':'#f4f2f6';pg.fillRect(Math.round(kx)-3,Math.round(ky)-3,6,6);}
      else{pg.fillStyle='rgba(235,235,245,.7)';pg.fillRect(Math.round(bx)-1,Math.round(by)-1,2,2);}
    }
  }
  pg.fillStyle='rgba(235,230,200,.6)';for(let x=10;x<CIRCUIT.depart-60;x+=40)pg.fillRect(x,(TK.route[0]+TK.route[1])/2-1,22,3);
  /* LES MURS DE PNEUS à l'extérieur des épingles et des grands virages */
  for(const sg of P.seg){if(sg.t!=='a'||sg.L<sg.r*1.4)continue;
    const n=Math.round(sg.L/16);
    for(let k=0;k<=n;k++){const f=sg.f0+sg.s*(k/n)*sg.L/sg.r, rr=sg.r+ep/2+12;const tx=sg.cx+Math.cos(f)*rr, ty=sg.cy+Math.sin(f)*rr;
      if(tx<6||ty<TK.route[1]+6||tx>W-6||ty>H-6)continue;
      pg.fillStyle='#16141c';pg.beginPath();pg.arc(tx,ty,5,0,7);pg.fill();pg.fillStyle=k%2?'#e0263a':'#f4f2f6';pg.beginPath();pg.arc(tx,ty,2.5,0,7);pg.fill();}}
  /* LA LIGNE D'ARRIVÉE, en damier, et la grille de départ */
  const [l0,l1]=TK.route, LX=CIRCUIT.ligne;
  for(let yy=l0+4;yy<l1-4;yy+=6)for(let k=0;k<2;k++){pg.fillStyle=((yy-l0)/6+k)%2<1?'#f4f2f6':'#14121c';pg.fillRect(LX+k*6,yy,6,6);}
  pg.fillStyle='rgba(235,235,245,.6)';
  for(let k=1;k<=3;k++){const gx=LX-k*65+20;pg.fillRect(gx,l0+16,2,24);pg.fillRect(gx-20,l0+16,22,2);pg.fillRect(gx,l1-40,2,24);pg.fillRect(gx-20,l1-40+22,22,2);}
  g.drawImage(pc,0,0);
  /* la bordure du trottoir, sous la voie des stands */
  g.fillStyle='#8a86a0';g.fillRect(0,TK.route[1],CIRCUIT.depart-110,2);
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
const LAMPES_TK=[[198,232],[390,232],[545,232],[700,232],[855,232],
  [360,420],[640,420],[360,1080],[640,1080],[500,750],
  [20,480],[136,356]];
/* et le long de la piste, des deux côtés, toutes les 260 unités : jamais sur une autre portion de piste */
function lampesDuCircuit(){
  const L=[], P=PISTE, ep=CIRCUIT.ep;
  for(let s=130;s<P.L;s+=260){const p=pointPiste(s);
    for(const sd of [-1,1]){const o=ep/2+20, x=p.x-Math.sin(p.ang)*o*sd, y=p.y+Math.cos(p.ang)*o*sd;
      if(x<14||x>MONDE_L-14||y<TK.route[1]+20||y>MONDE_H-14)continue;
      if(projeter(x,y,null).d<ep/2+14)continue;
      if(x>346&&x<654&&y>406&&y<1094)continue;
      L.push([Math.round(x),Math.round(y)]);}}
  return L;
}
function semerDecorTokyo(){
  LAMPES_TK.concat(lampesDuCircuit()).forEach(([x,y],k)=>DECOR.push({t:'lanterneP',x,y,gr:k}));
  DECOR.sort((a,b)=>a.y-b.y);try{invaliderGrille();}catch(x){}
}
/* LA VILLE S'ALLUME LA NUIT : les enseignes et les fenêtres des façades,
   les néons du showroom, l'escalier du métro. Posé à chaque image dans la
   carte des lumières du jeu ; rien ne s'allume de jour. */
const FEUX_TK=[[85,185,'rgba(120,220,255,§)',60],[240,185,'rgba(255,150,60,§)',60],[280,110,'rgba(255,140,50,§)',40],[385,185,'rgba(255,110,190,§)',56],
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
  t=t||{};if(!t.couleur&&!t.vitres&&!t.finition&&!t.jantes)return c;
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
  /* LES FINITIONS : elles travaillent la caisse après la peinture */
  if(t.finition&&sel.length){
    const f=t.finition;
    for(const [i] of sel){
      const x=(i/4)%W, y=Math.floor(i/4/W);let r=D[i],v=D[i+1],b=D[i+2];
      const L=(r*0.3+v*0.59+b*0.11)/255;
      if(f==='chrome'){const g2=Math.pow(L,0.7);const k=(y/H<0.45)?1.25:0.8;const c2=Math.min(255,40+215*g2*k);r=c2*0.96;v=c2*0.98;b=Math.min(255,c2*1.06);}
      else if(f==='mat'){const m=(r+v+b)/3;r=r*0.82+m*0.1;v=v*0.82+m*0.1;b=b*0.82+m*0.1;}
      else if(f==='nacre'){r=r+(255-r)*0.22;v=v+(255-v)*0.18;b=b+(255-b)*0.3;}
      else if(f==='metal'){if(((x*7+y*13)%23)===0){r=Math.min(255,r+70);v=Math.min(255,v+70);b=Math.min(255,b+70);}else if(L>0.55){r=Math.min(255,r*1.08);v=Math.min(255,v*1.08);b=Math.min(255,b*1.08);}}
      else if(f==='cameleon'){const u=x/W;const A=[150,60,255],B=[40,220,170],C2=[255,120,40];const P=u<0.5?A.map((a,q)=>a+(B[q]-a)*u*2):B.map((a,q)=>a+(C2[q]-a)*(u-0.5)*2);const k=0.35+L*1.1;r=P[0]*k;v=P[1]*k;b=P[2]*k;}
      D[i]=Math.max(0,Math.min(255,r));D[i+1]=Math.max(0,Math.min(255,v));D[i+2]=Math.max(0,Math.min(255,b));
    }
  }
  /* LES JANTES : les pixels clairs dans les deux disques des roues */
  if(t.jantes){
    const JC={noir:[28,29,34],blanc:[240,240,244],bronze:[176,121,58],chrome:[220,226,236],or:[240,192,64],neon:[63,224,255]}[t.jantes];
    /* LES ROUES, MESURÉES SUR CHAQUE DESSIN (centre x, y et rayon du pneu, en pixels
       du sprite). La jante est le disque intérieur, aux six dixièmes du pneu. */
    const RT={'180x88':[[46,62.5],[140,62.5],12],'154x51':[[34,38],[124,38],11],'156x46':[[29.5,31.5],[120.5,31.5],11],
      '173x54':[[39,39],[137.5,39],12],'153x49':[[33,35],[122,35],11],'168x51':[[32.5,36],[129,36],12]}[W+'x'+H];
    const ROUES=RT?[RT[0],RT[1]]:[[W*0.235,H*0.7],[W*0.795,H*0.7]], rj=(RT?RT[2]:H*0.25)*0.62;
    if(JC){
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(D[i+3]<128)continue;
        let dans=false;for(const [cx,cy] of ROUES)if((x-cx)*(x-cx)+(y-cy)*(y-cy)<rj*rj)dans=true;
        if(!dans)continue;const [h,sa,l]=hslTK(D[i],D[i+1],D[i+2]);
        if(l>0.06){const k=Math.min(1.25,0.3+l*1.5);for(let q=0;q<3;q++)D[i+q]=Math.max(0,Math.min(255,JC[q]*k));}}}
  }
  g.putImageData(d,0,0);return c;
}
const TEINTES_TK=['#d01426','#ff4fb0','#ff7a1a','#ffd21f','#5cc83a','#1fd6c3','#1a5fd0','#7a3cff','#f4f4f6','#8e939c','#2a2c33','#0b0b0f'];
const NEONS_TK=['#ff4fb0','#7fe8ff','#b08cff','#5cff8a','#ffd98a','#ff3b3b'];

/* ================= LES VOITURES ET LEURS PIÈCES : DES DONNÉES, PAS DU CODE =================
   Chaque modèle a sa fiche (vitesse de pointe, accélération, adhérence,
   direction, stabilité, comportement en glisse). Chaque pièce de l'atelier
   est une liste de modificateurs. Le moteur de conduite ne lit QUE le
   résultat de statsVoiture() : ajouter une voiture, c'est ajouter une ligne
   à FICHES ; ajouter une pièce, c'est ajouter une entrée à PIECES. Rien à
   réécrire dans la conduite.
   Unités : pixels de carte par seconde (1 px ≈ 25 cm), rad/s pour la direction. */
const FICHE_BASE={vmax:186,acc:152,frein:330,grip:8.8,dir:3.0,stab:1,glisse:2.5,maitrise:1,tenue:1};
const FICHES={
  Toyota:     {vmax:188,acc:150,grip:8.4, dir:3.05,stab:1.0, glisse:2.3,maitrise:1.15},
  BMW:        {vmax:180,acc:142,grip:8.9, dir:3.15,stab:1.05,glisse:2.4,maitrise:1.1},
  Lamborghini:{vmax:212,acc:195,grip:10.4,dir:2.85,stab:1.15,glisse:3.1,maitrise:0.88},
  Porsche:    {vmax:205,acc:176,grip:11.2,dir:3.25,stab:1.25,glisse:3.0,maitrise:0.92},
  Nissan:     {vmax:208,acc:197,grip:10.9,dir:2.95,stab:1.2, glisse:3.2,maitrise:0.88},
  Ferrari:    {vmax:212,acc:166,grip:8.6, dir:3.0, stab:1.0, glisse:2.2,maitrise:1.15}};
/* les pièces : multiplicateurs (×) ajoutés à 1 — +0.1 = +10 % */
const PIECES={
  moteur:      {1:{vmax:.08},2:{vmax:.16},3:{vmax:.25}},
  transmission:{1:{acc:.10},2:{acc:.20},3:{acc:.32}},
  turbo:       {1:{acc:.15,vmax:.05},2:{acc:.30,vmax:.10}},
  pneus:       {sport:{grip:.30,glisse:.2},drift:{grip:-.12,glisse:-.3,maitrise:.25}},
  suspension:  {1:{stab:.12,dir:.04},2:{stab:.25,dir:.08},3:{stab:.40,dir:.12}},
  freins:      {1:{frein:.55}},
  allege:      {1:{acc:.12,grip:.04,stab:.05}},
  kitdrift:    {1:{maitrise:.25,tenue:.3},2:{maitrise:.5,tenue:.6}}};
function statsVoiture(marque,t){
  t=t||{};const S=Object.assign({},FICHE_BASE,FICHES[marque]||{});
  const M={};
  for(const k of Object.keys(PIECES)){const p=PIECES[k][t[k]];if(!p)continue;for(const c of Object.keys(p))M[c]=(M[c]||0)+p[c];}
  for(const c of Object.keys(M))S[c]=S[c]*(1+M[c]);
  S.nitro=+t.nitro||0;
  return S;
}
/* les notes du showroom et de l'atelier, sur 10, lues dans la même fiche */
function notesDe(marque,t){
  const S=statsVoiture(marque,t), r=x=>Math.max(1,Math.min(10,Math.round(x*10)/10));
  return {vit:r(S.vmax/27.6),acc:r(S.acc/22.8),tenue:r(S.grip/1.5),drift:r(4.6+(S.maitrise-1)*9+(3.2-S.glisse)*1.6+(S.tenue-1)*2)};
}
let caler2=null;
/* LES PRIX DES VOITURES (centimes) : le serveur a la même table, c'est lui qui débite */
const PRIX_VOITURE={'bmw-m3-e46':3800000,'toyota-supra-mk4':4500000,'nissan-gtr-r35':8500000,'porsche-911-gt3-rs':12000000,'lamborghini-huracan':18000000,'ferrari-f40':25000000};
async function rpcTK(nom,args){try{if(typeof sb==='undefined'||!sb)return {erreur:'Le comptoir ne répond pas.'};const r=await sb.rpc(nom,args||{});if(r.error)return {erreur:r.error.message};return r.data||{erreur:'Pas de réponse.'};}catch(x){return {erreur:'Le comptoir ne répond pas.'};}}
/* LE GARAGE VIENT DU SERVEUR : ce qu'on y a acheté. La sauvegarde garde le reste
   (le nom donné, les kilomètres, les réglages), rangé sous la voiture. */
async function synchroniserGarage(){
  const d=await rpcTK('tokyo_mon_garage');
  if(!d||d.erreur||!Array.isArray(d.voitures))return false;
  const G=garageDuJoueur(), garde={};for(const v of G)garde[v.modele]=v;
  G.length=0;
  for(const r of d.voitures){const v=garde[r.v]||{id:r.v,modele:r.v,km:0,drifts:0,sorties:0};v.place=r.place;v.id=r.v;v.modele=r.v;G.push(v);}
  if(typeof d.euros==='number'){e.euros=d.euros;try{majHaut();}catch(x){}}
  try{sauver();}catch(x){}
  return true;
}
async function ouvrirConcessionTokyo(ongletDepart){
  if(ouvrirConcessionTokyo.ouvert)return;
  ouvrirConcessionTokyo.ouvert=true;
  synchroniserGarage().then(ok=>{if(ok&&ouvrirConcessionTokyo.ouvert&&ouvrirConcessionTokyo.redessiner)ouvrirConcessionTokyo.redessiner();});
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
.ccAch{background:linear-gradient(180deg,#5cff8a,#1fae4a);box-shadow:0 4px 0 #0a5a22;color:#04140a!important}
.ccAch:active{transform:translateY(2px);box-shadow:0 2px 0 #0a5a22}
.ccLock{background:rgba(255,255,255,.08)!important;color:rgba(255,255,255,.55)!important;border:1px solid rgba(255,255,255,.14)!important}
.ccLigneRec{display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;background:rgba(255,255,255,.06);margin-top:10px}
.ccLigneRec img{width:96px;image-rendering:pixelated;flex:none}
.ccLigneRec div{flex:1;min-width:0}
.ccLigneRec b{display:block;font-size:15px}
.ccLigneRec small{display:block;font:700 11px ui-monospace,monospace;color:rgba(255,255,255,.5);margin-top:3px}
.ccLigneRec i{font-style:normal;font:700 16px ui-monospace,monospace;color:#ffd98a}
.ccLigneRec button{flex:none;height:40px;padding:0 14px;border-radius:12px;border:0;background:#ff4fb0;color:#fff;font:700 13px sans-serif}
#ccDefile.atelier{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 14px)}
#ccRacine.atelierR{background:linear-gradient(180deg,#1b1d22 0%,#121317 60%,#0b0c0f 100%)}
#ccRacine.atelierR #ccSur{color:#ff9a3c}
.atScene{position:relative;flex:1 1 auto;min-height:120px;margin:8px -16px 0;overflow:hidden;touch-action:none}
.atMur{position:absolute;inset:0;background:repeating-linear-gradient(90deg,#24272e 0 3px,#1e2026 3px 6px)}
.atMur:after{content:'';position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 62%,rgba(255,170,90,.28),transparent 70%)}
.atNeon{position:absolute;left:16px;right:16px;top:8px;height:2px;background:#ff9a3c;box-shadow:0 0 14px #ff8a2a}
.atOutils{position:absolute;left:28px;right:28px;top:20px;display:flex;justify-content:space-between;opacity:.45}
.atOutils i{width:5px;height:24px;background:#6a707c;border-radius:2px}
.atSol{position:absolute;left:0;right:0;bottom:0;height:16%;background:linear-gradient(#2a2c32,#16171b)}
.atPont{position:absolute;left:50%;bottom:38%;transform:translateX(-50%);width:min(300px,80%);height:7px;background:#e0c020;border-radius:2px;box-shadow:0 0 0 2px #8a7410 inset}
.atPont i{position:absolute;top:7px;width:9px;height:400px;background:#c8a818}
.atPont i:first-child{left:16%}.atPont i:last-child{right:16%}
.atVoit{position:absolute;left:50%;bottom:calc(38% + 7px);transform:translateX(-50%);image-rendering:pixelated}
.atGlow{position:absolute;left:50%;bottom:calc(38% - 4px);transform:translateX(-50%);width:min(240px,62%);height:16px;border-radius:50%;filter:blur(10px);opacity:.8}
.atFl{top:40%!important}
.atNom{position:absolute;left:0;right:0;bottom:3%;text-align:center}
.atNom b{display:block;font:800 15px -apple-system,sans-serif}
.atNom small{font:700 9px ui-monospace,monospace;letter-spacing:2px;color:rgba(255,255,255,.5)}
.atPan{flex:none;margin:0 -16px;background:#16171c;border-radius:22px 22px 0 0;padding:14px 16px 0;box-shadow:0 -10px 30px rgba(0,0,0,.4)}
.atCats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.atCat{border:1px solid transparent;background:rgba(255,255,255,.05);border-radius:14px;padding:clamp(6px,1.1vh,10px) 0 clamp(5px,1vh,8px);text-align:center;font:700 11px -apple-system,sans-serif;color:rgba(255,255,255,.65)}
.atCat svg{display:block;margin:0 auto 3px;width:21px;height:21px}
.atCat.on{border-color:#ff9a3c;background:rgba(255,154,60,.12);color:#ffb070}
.atT{margin:clamp(10px,1.8vh,16px) 2px 8px;font:700 10px ui-monospace,monospace;letter-spacing:2.4px;color:rgba(255,255,255,.45)}
.atChoix{display:flex;gap:9px;overflow-x:auto;overflow-y:hidden;padding:4px 2px 6px;scrollbar-width:none;touch-action:pan-x}
.atChoix::-webkit-scrollbar{display:none}
.atRond{flex:none;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,.15);font:700 10px sans-serif;color:rgba(255,255,255,.6)}
.atRond.on{box-shadow:0 0 0 3px #16171c,0 0 0 5px #ff9a3c}
.atPil{flex:none;height:40px;padding:0 15px;border-radius:20px;border:0;background:rgba(255,255,255,.07);color:#fff;font:700 13px -apple-system,sans-serif}
.atPil.on{background:#ff9a3c;color:#1a0e04}
.atDelta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:clamp(8px,1.4vh,12px)}
.atDelta div{background:rgba(255,255,255,.04);border-radius:12px;padding:8px 10px}
.atDelta small{font:700 9px ui-monospace,monospace;letter-spacing:1.5px;color:rgba(255,255,255,.45)}
.atDelta b{display:block;font:800 17px -apple-system,sans-serif;margin-top:2px}
.atDelta em{font-style:normal;font-size:12px;margin-left:4px}.atDelta em.up{color:#5cff8a}.atDelta em.dn{color:#ff6a5a}
.atBas{display:grid;grid-template-columns:52px 1fr;gap:10px;margin-top:clamp(10px,1.8vh,16px)}
.atRaz{height:clamp(48px,6.5vh,56px);border-radius:16px;border:0;background:rgba(255,255,255,.08);color:#fff;font-size:20px}
.atGo{height:clamp(48px,6.5vh,56px);border-radius:16px;border:0;background:linear-gradient(180deg,#ffa24a,#e46a12);box-shadow:0 4px 0 #8a3a06;color:#1a0e04;font:800 16px -apple-system,sans-serif}
.atGo:active{transform:translateY(2px);box-shadow:0 2px 0 #8a3a06}
.atGo.achat{background:linear-gradient(180deg,#5cff8a,#1fae4a);box-shadow:0 4px 0 #0a5a22;color:#04140a}
.atGo.pas{background:rgba(255,255,255,.08);box-shadow:none;color:rgba(255,255,255,.55)}
.atGo:disabled{opacity:.7}
.atCats{grid-template-columns:repeat(6,1fr)!important;gap:6px!important}
.atCat{font-size:9.5px!important;padding:clamp(5px,0.9vh,8px) 0 clamp(4px,0.8vh,7px)!important;border-radius:12px!important}
.atCat svg{width:19px!important;height:19px!important;margin-bottom:2px!important}
.atRond{position:relative}
.atRond.orig{width:auto;min-width:40px;padding:0 10px;border-radius:20px;background:rgba(255,255,255,.07)!important;color:#fff;font-size:11px}
.atRond.orig.on{background:#ff9a3c!important;color:#1a0e04;box-shadow:none}
.atRond.lock:after{content:'';position:absolute;right:-3px;top:-3px;width:13px;height:13px;border-radius:50%;background:#16171c url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffb070' d='M7 10V7a5 5 0 0110 0v3h1v11H6V10zm2 0h6V7a3 3 0 00-6 0z'/%3E%3C/svg%3E") center/9px no-repeat;border:1px solid rgba(255,154,60,.6)}
.atPx{position:absolute;left:50%;bottom:-15px;transform:translateX(-50%);font:700 8.5px ui-monospace,monospace;font-style:normal;color:#ffb070;white-space:nowrap}
.atChoix{padding-bottom:16px!important;align-items:flex-start}
.atPil small{font:700 10px ui-monospace,monospace;color:#ffb070;margin-left:4px}
.atPil.on small{color:#1a0e04}
.atPil.lock.on{background:#ffd9b0}
.atSep{flex:none;align-self:center;font:700 9px ui-monospace,monospace;letter-spacing:1.6px;color:rgba(255,255,255,.4);padding:0 2px 0 6px;border-left:1px solid rgba(255,255,255,.15)}
.atSep:first-child{border-left:0;padding-left:0}
.atDessus{position:absolute;right:12px;top:40px;width:102px;height:48px;image-rendering:pixelated;background:rgba(0,0,0,.35);border:1px solid rgba(255,154,60,.35);border-radius:8px}
.atGlow.fx-pulse{animation:atPulse .9s ease-in-out infinite}
.atGlow.fx-arcenciel{animation:atArc 2.4s linear infinite}
@keyframes atPulse{50%{opacity:.25}}
@keyframes atArc{to{filter:blur(10px) hue-rotate(360deg)}}
@media (max-height:700px){.atDelta{display:none}}
#ccDefile.atelier #ccBulle{position:absolute;left:16px;right:16px;top:calc(env(safe-area-inset-top,0px) + 84px);z-index:6;min-height:0!important;margin:0!important;
 background:#16171c;border:1px solid #ff9a3c;border-radius:12px;padding:10px 12px;color:#ffd9b0!important;box-shadow:0 8px 24px rgba(0,0,0,.5)}
#ccDefile.atelier #ccBulle:empty{display:none}`;
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
  let bulleT=null;
  const bulle=t=>{$('ccBulle').textContent=t||'';clearTimeout(bulleT);if(t)bulleT=setTimeout(()=>{try{$('ccBulle').textContent='';}catch(x){}},3200);};
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
  /* LE TUNING EST RETIRÉ DU CONCESSIONNAIRE : trois onglets. Les numéros restent ceux d'avant (0, 1, 3). */
  const NAV=[['Showroom',IC.sh,0],['Garage',IC.ga,1],['Records',IC.re,3]];
  /* L'ATELIER DE TUNING a sa propre porte : on y entre droit dans l'atelier, sans les onglets du concessionnaire */
  const ATELIER=(ongletDepart===2);
  if(ATELIER){$('ccRacine').classList.add('atelierR');try{const so=document.createElement('span');so.id='atSolde';so.textContent=enEuros(e.euros||0);so.style.cssText='margin-left:auto;margin-right:8px;font:600 12px ui-monospace,monospace;background:rgba(255,154,60,.14);color:#ffb070;border:1px solid rgba(255,154,60,.35);padding:7px 10px;border-radius:10px;white-space:nowrap';$('ccHaut').insertBefore(so,$('ccX'));}catch(x){}}
  const nav=()=>{
    if(ATELIER){$('ccNav').style.display='none';return;}
    $('ccNav').innerHTML=NAV.map(([t,i,k])=>'<button data-nav="'+k+'" class="'+(k===onglet?'on':'')+'">'+i+t+'</button>').join('');
    $('ccNav').querySelectorAll('button').forEach(b=>{b.onclick=()=>{onglet=+b.dataset.nav;bulle('');rendre();};});
  };
  /* ---------- LE SHOWROOM : une voiture à la fois, sur le plateau ---------- */
  const showroom=()=>{
    $('ccSur').textContent='東京 · SHOWROOM';$('ccTitre').textContent='Concession';
    if(!vehicules.length){$('ccCorps').innerHTML='<p style="color:#ff8ac8;margin-top:20px">Le catalogue ne répond pas.</p>';return;}
    idx=(idx+vehicules.length)%vehicules.length;ouvrirConcessionTokyo.idx=idx;
    const v=vehicules[idx], t={}, N=notesDe(v.marque,t), rec=chronoRecords()[nom(v)];
    const st=(l,x)=>'<div class="ccSt">'+l+'<u style="--v:'+(x*10)+'%"></u><b>'+x.toFixed(1).replace('.',',')+'</b></div>';
    $('ccCorps').innerHTML=
      '<div class="ccScene" id="ccScene"><div class="ccNeon"></div><div class="ccDisque"></div>'+
        '<canvas class="ccReflet" id="ccRefl"></canvas><canvas class="ccVoit" id="ccVoit"></canvas>'+
        '<button class="ccFl g" id="ccPrec" aria-label="Précédente">‹</button><button class="ccFl d" id="ccSuiv" aria-label="Suivante">›</button></div>'+
      '<div class="ccNom"><small>'+esc(v.marque.toUpperCase())+' · '+(idx+1)+' / '+vehicules.length+'</small><b>'+esc(v.modele)+'</b>'+
        '<em>'+esc([v.carrosserie,ORIGINE[v.marque],v.tuning?'personnalisable':''].filter(Boolean).join(' · '))+'</em></div>'+
      '<div class="ccPts">'+vehicules.map((_,i)=>'<i class="'+(i===idx?'on':'')+'"></i>').join('')+'</div>'+
      '<div class="ccStats">'+st('Vitesse',N.vit)+st('Accélération',N.acc)+st('Tenue de route',N.tenue)+st('Drift',N.drift)+'</div>'+
      '<div class="ccRec"><span>★ RECORD · DRIFT '+((driftRecords()[nom(v)]||0).toLocaleString('fr-FR'))+'</span><b>'+fmtTour(rec)+'</b></div>'+
      (()=>{const mien=garageDuJoueur().find(x=>x.modele===v.id), prix=PRIX_VOITURE[v.id];
        if(mien)return '<div class="ccBtns"><button class="ccLock" id="ccCourse" style="color:#fff!important">🏁 Course</button><button class="ccGo" id="ccVolant2">Prendre le volant</button></div>';
        const conf=ouvrirConcessionTokyo.confirme===v.id, manque=(e.euros||0)<prix;
        return '<div class="ccBtns"><button class="ccGo" id="ccEssai">Essayer</button><button class="'+(manque?'ccLock':'ccAch')+'" id="ccAchat">'+
          (manque?'Il te manque '+enEuros(prix-(e.euros||0)):(conf?'Confirmer · '+enEuros(prix):'Acheter · '+enEuros(prix)))+'</button></div>';})();
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
    if($('ccEssai'))$('ccEssai').onclick=()=>{fermerConcessionTokyo();debutEssai(v);};
    if($('ccCourse'))$('ccCourse').onclick=()=>{const mien=garageDuJoueur().find(x=>x.modele===v.id);fermerConcessionTokyo();debutEssai(v,mien,null,'course');};
    if($('ccVolant2'))$('ccVolant2').onclick=()=>{const mien=garageDuJoueur().find(x=>x.modele===v.id);fermerConcessionTokyo();debutEssai(v,mien);};
    if($('ccAchat'))$('ccAchat').onclick=async()=>{
      const prix=PRIX_VOITURE[v.id];
      if((e.euros||0)<prix){bulle('Il te manque '+enEuros(prix-(e.euros||0))+' pour celle-ci.');return;}
      if(garageDuJoueur().length>=PLACES_GARAGE){bulle('Ton garage est plein : quatre places.');return;}
      /* deux temps : on ne dépense pas des dizaines de milliers d'euros d'un seul doigt */
      if(ouvrirConcessionTokyo.confirme!==v.id){ouvrirConcessionTokyo.confirme=v.id;rendre();setTimeout(()=>{if(ouvrirConcessionTokyo.confirme===v.id){ouvrirConcessionTokyo.confirme=null;if(ouvrirConcessionTokyo.ouvert&&onglet===0)rendre();}},4000);return;}
      ouvrirConcessionTokyo.confirme=null;
      const bt=$('ccAchat');bt.disabled=true;bt.textContent='Le vendeur prépare les papiers…';
      const r=await rpcTK('tokyo_acheter_voiture',{p_voiture:v.id});
      if(!r||r.erreur){bulle(r&&r.erreur==='pas_assez'?'Il te manque de quoi payer.':(r&&r.erreur)||'La vente n’a pas abouti.');if(r&&typeof r.euros==='number')e.euros=r.euros;rendre();return;}
      if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}
      garageDuJoueur().push({id:v.id,modele:v.id,place:r.place,km:0,drifts:0,sorties:0});try{sauver();}catch(x){}
      try{navigator.vibrate&&navigator.vibrate([20,40,20,40,80]);jouer&&jouer('achat','moment');}catch(x){}
      bulle('🔑 '+nom(v)+' est à toi ! Elle t’attend place '+(r.place+1)+' du garage.');
      rendre();};
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
    /* LE CLASSEMENT DES COURSES : les dix meilleurs temps de tous les joueurs (3 tours) */
    const bloc=document.createElement('div');bloc.innerHTML='<h3 style="margin:20px 0 8px;font:800 15px sans-serif;color:#fff">🏁 Classement des courses · 3 tours</h3><div id="ccClass" style="color:rgba(255,255,255,.55);font-size:13px">Chargement…</div>';
    $('ccCorps').appendChild(bloc);
    rpcTK('tokyo_classement_course',{}).then(r=>{const z=$('ccClass');if(!z)return;
      const L2=Array.isArray(r)?r:(r&&Array.isArray(r.liste)?r.liste:null);
      if(!L2){z.textContent=(r&&r.erreur)||'Classement indisponible.';return;}
      if(!L2.length){z.textContent='Personne n’a encore fini de course. Achète une voiture et lance « Course » depuis ton garage.';return;}
      z.innerHTML=L2.map((x,i)=>{const m=modele(x.voiture);return '<div class="ccLigneRec"><b style="width:26px;color:#ff8ac8">'+(i+1)+'</b><div><b>'+esc(x.pseudo||'?')+'</b><small>'+esc(m?nom(m):(x.voiture||''))+'</small></div><i>'+fmtTour((x.temps||0)/1000)+'</i></div>';}).join('');});
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
        'Achète ta première voiture au showroom : elle sera à toi pour de bon, sans limite de temps sur le circuit, et l’atelier pourra la préparer.'+
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
          '<button id="ccCourse" style="flex:1.4;min-height:50px;border-radius:14px;border:0;background:rgba(255,79,176,.18);box-shadow:inset 0 0 0 2px #ff4fb0;font:800 14px sans-serif;color:#fff">🏁 Course · 3 tours</button></div>'+
        '<button id="ccVolant" style="display:block;width:100%;margin-top:8px;min-height:56px;border-radius:16px;border:0;background:#ff4fb0;color:#fff;font:800 16px sans-serif">Prendre le volant</button>';
    }
    $('ccCorps').innerHTML=h;
    $('ccCorps').querySelectorAll('canvas[data-dessus]').forEach(c=>{
      const m=modele(c.dataset.dessus), t=peindreVoitureDessus(m?m.marque:'Toyota'), g=c.getContext('2d');
      g.imageSmoothingEnabled=false;g.translate(16,34);g.rotate(-Math.PI/2);g.drawImage(t,-34,-16);});
    $('ccCorps').querySelectorAll('button[data-place]').forEach(b=>{b.onclick=()=>{
      const v=parPlace[+b.dataset.place];
      if(!v){bulle('Place libre : achète une voiture au showroom.');return;}
      choisie=G.indexOf(v);bulle('');rendre();};});
    if($('ccVersShowroom'))$('ccVersShowroom').onclick=()=>{onglet=0;rendre();};
    if(G.length){
      const v=G[choisie];
      $('ccVolant').onclick=()=>{fermerConcessionTokyo();debutEssai(modele(v.modele)||{marque:'Toyota',modele:''},v);};
      $('ccCourse').onclick=()=>{fermerConcessionTokyo();debutEssai(modele(v.modele)||{marque:'Toyota',modele:''},v,null,'course');};
      $('ccRenommer').onclick=()=>{
        const n=prompt('Le nom de ta voiture',v.nom||'');
        if(n===null)return;
        v.nom=n.trim().slice(0,24);try{sauver();}catch(x){}rendre();};
    }
  };
  /* ---------- LE TUNING : LE PONT ÉLÉVATEUR ----------
     La voiture sur le pont, au fond de l'atelier en tôle ; en bas, huit tuiles
     (une par partie du réglage), leurs choix, et ce que ça change en chiffres.
     Tout tient dans l'écran : rien ne défile, sauf la rangée des choix. */
  let selT=null, cat=0, apercu=null;
  /* LES OPTIONS ET LEURS PRIX (en centimes). Le serveur a la même table et c'est
     lui qui débite : ce tableau ne sert qu'à afficher. Prix 0 : gratuit. */
  const R=(v,c,p,txt)=>({v,c,p,txt});
  const OPT={
    couleur:TEINTES_TK.map(c=>R(c,c,200000)),
    finition:[R('metal',0,500000,'Métallisé'),R('nacre',0,800000,'Nacré'),R('mat',0,600000,'Mat'),R('chrome',0,1500000,'Chrome'),R('cameleon',0,2500000,'Caméléon')],
    jantes:[R('noir','#16171b',300000),R('blanc','#f4f4f6',300000),R('chrome','#d8dde6',500000),R('bronze','#b0793a',600000),R('or','#f0c040',800000),R('neon','#3fe0ff',1000000)],
    aileron:[R('aucun',0,0,'Aucun'),R('levre',0,300000,'Lèvre'),R('haut',0,600000,'Haut'),R('grand',0,1200000,'GT géant')],
    toit:[R('noir',0,200000,'Toit noir'),R('carbone',0,800000,'Carbone')],
    bandes:['#f4f4f6','#0b0b0f','#ffd21f','#ff4fb0','#1a5fd0','#d01426'].map(c=>R(c,c,300000)),
    neon:NEONS_TK.map(c=>R(c,c,500000)),
    neonfx:[R('pulse',0,1200000,'Pulsation'),R('arcenciel',0,2000000,'Arc-en-ciel')],
    vitres:[R(1,0,150000,'Légères'),R(2,0,300000,'Foncées'),R(3,0,500000,'Limo')],
    fumee:['#ff4fb0','#3fe0ff','#b08cff','#ffd21f','#5cff8a'].map(c=>R(c,c,600000)),
    flammes:[R(1,0,1500000,'Flammes d’échappement')],
    trainee:[R(1,0,1800000,'Traînée de feux')],
    moteur:[R(1,0,1000000,'Stage 1'),R(2,0,2500000,'Stage 2'),R(3,0,5000000,'Stage 3')],
    transmission:[R(1,0,800000,'Courte'),R(2,0,1800000,'Sport'),R(3,0,3200000,'Séquentielle')],
    turbo:[R(1,0,2000000,'Simple'),R(2,0,4500000,'Gros turbo')],
    nitro:[R(1,0,4000000,'Nitro'),R(2,0,7000000,'Double nitro')],
    pneus:[R('sport',0,800000,'Sport'),R('drift',0,800000,'Drift')],
    freins:[R(1,0,900000,'Freins carbone')],
    allege:[R(1,0,3000000,'Allègement')],
    suspension:[R(1,0,600000,'Sport'),R(2,0,1400000,'Combinés filetés'),R(3,0,2600000,'Course')],
    kitdrift:[R(1,0,1200000,'Kit angle'),R(2,0,2500000,'Kit pro')]};
  const ORIG={couleur:'Origine',finition:'Brillant',jantes:'Origine',aileron:'D’origine',toit:'Caisse',bandes:'Sans',neon:'Sans',neonfx:'Fixe',vitres:'Claires',fumee:'Blanche',flammes:'Sans',trainee:'Sans',moteur:'Origine',turbo:'Aucun',nitro:'Sans',pneus:'Route',freins:'Origine',allege:'Origine',transmission:'Origine',suspension:'Origine',kitdrift:'Sans'};
  const CATS=[
    {n:'Peinture',k:['couleur'],ic:'<path d="M4 20l6-6M14 4l6 6-8 8-6-6z"/>'},
    {n:'Finition',k:['finition'],ic:'<path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/>'},
    {n:'Jantes',k:['jantes'],ic:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11"/>'},
    {n:'Aileron',k:['aileron'],ic:'<path d="M3 8h18M6 8v8M18 8v8M4 16h16"/>'},
    {n:'Déco',k:['toit','bandes','vitres'],ic:'<path d="M9 4v16M15 4v16"/>'},
    {n:'Néons',k:['neon','neonfx'],ic:'<path d="M3 18h18"/><path d="M6 14c3 2 9 2 12 0"/><path d="M8 10h8"/>'},
    {n:'Effets',k:['fumee','flammes','trainee'],ic:'<path d="M12 21c4 0 6-3 6-6 0-4-4-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-3 5-3 8 0 3 2 6 6 6z"/>'},
    {n:'Moteur',k:['moteur','transmission'],ic:'<rect x="4" y="8" width="13" height="10" rx="1"/><path d="M17 11h3v4h-3M8 8V5h5v3"/>'},
    {n:'Turbo',k:['turbo'],ic:'<circle cx="12" cy="12" r="7"/><path d="M12 5v4M12 15v4M5 12h4M15 12h4"/>'},
    {n:'Nitro',k:['nitro'],ic:'<rect x="8" y="3" width="8" height="18" rx="3"/><path d="M8 9h8"/>'},
    {n:'Châssis',k:['pneus','suspension','freins','allege'],ic:'<circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="3"/><path d="M4 11h16l-2-4H6z"/>'},
    {n:'Drift',k:['kitdrift'],ic:'<path d="M4 18c4 0 5-4 8-4s4 4 8 4"/><path d="M7 10c2-3 8-3 10 0"/>'}];
  const LIB={couleur:'PEINTURE',finition:'FINITION',jantes:'JANTES',aileron:'AILERON',toit:'TOIT',bandes:'BANDES',neon:'NÉON',neonfx:'EFFET',vitres:'VITRES',fumee:'FUMÉE DE DRIFT',flammes:'ÉCHAPPEMENT',trainee:'FEUX',moteur:'MOTEUR',turbo:'TURBO',nitro:'NITRO',pneus:'PNEUS',freins:'FREINS',allege:'POIDS',transmission:'TRANSMISSION',suspension:'SUSPENSIONS',kitdrift:'KIT DRIFT'};
  /* CE QUE LE JOUEUR POSSÈDE, lu au serveur à l'ouverture de l'atelier */
  let POSS=null, POSS_ERR=null;
  const cleP=(vid,k,v)=>vid+'|'+k+'|'+v;
  const possede=(vid,k,o)=>!o.p||(POSS&&POSS.has(cleP(vid,k,String(o.v))));
  const prixTxt=c=>{const n=Math.round(c/100);return n>=1000?(n/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})+' k€':n+' €';};
  const rpcAuth=async(nom,args)=>{try{if(typeof sb==='undefined'||!sb)return {erreur:'Le comptoir ne répond pas.'};const r=await sb.rpc(nom,args||{});if(r.error)return {erreur:r.error.message};return r.data||{erreur:'Pas de réponse.'};}catch(x){return {erreur:'Le comptoir ne répond pas.'};}};
  const chargerPoss=async()=>{
    const d=await rpcAuth('tokyo_mon_tuning');
    if(!d||d.erreur){POSS=new Set();POSS_ERR=d&&d.erreur==='session'?'Connecte-toi pour acheter des pièces.':'L’atelier ne répond pas.';}
    else{POSS=new Set((d.pieces||[]).map(p=>cleP(p.v,p.k,p.x)));POSS_ERR=null;if(typeof d.euros==='number'){e.euros=d.euros;try{majHaut();}catch(x){}}
      /* ON NE GARDE MONTÉ QUE CE QU'ON A PAYÉ */
      try{for(const gv of garageDuJoueur()){const t=gv.tuning||{};for(const k of Object.keys(t)){const o=(OPT[k]||[]).find(o=>String(o.v)===String(t[k]));if(!o||!possede(gv.modele,k,o))delete t[k];}}
        const C=e.configs||{};for(const vid of Object.keys(C)){const t=C[vid];for(const k of Object.keys(t)){const o=(OPT[k]||[]).find(o=>String(o.v)===String(t[k]));if(!o||!possede(vid,k,o))delete t[k];}}sauver();}catch(x){}}
    if(onglet===2&&ouvrirConcessionTokyo.ouvert)rendre();
  };
  const tuning=()=>{
    $('ccSur').textContent='チューン · ATELIER';$('ccTitre').textContent='Tuning';
    $('ccDefile').classList.add('fixe','atelier');
    if(POSS===null){POSS=new Set();POSS.vide=true;chargerPoss();}
    const G=garageDuJoueur();
    const liste=G.slice().sort((a,b)=>a.place-b.place).map(v=>({garage:v}));
    if(!liste.length){
      $('ccCorps').innerHTML='<div style="margin:auto 0;text-align:center;padding:24px 8px">'+
        '<div style="font-size:54px">🔧</div><b style="display:block;font-size:20px;margin-top:8px">Pas de voiture sur le pont</b>'+
        '<p style="color:rgba(255,255,255,.6);font-size:14px;line-height:1.5;margin-top:8px">L’atelier prépare les voitures de ton garage. Achète-en une au concessionnaire, juste à côté, et reviens la transformer.</p>'+
        '<button id="atVersConc" style="margin-top:18px;width:100%;height:54px;border:0;border-radius:16px;background:linear-gradient(180deg,#ffa24a,#e46a12);color:#1a0e04;font:800 16px sans-serif">Aller au concessionnaire</button></div>';
      $('atVersConc').onclick=()=>{fermerConcessionTokyo();setTimeout(()=>ouvrirConcessionTokyo(0),80);};
      return;}
    if(!liste.length){$('ccCorps').innerHTML='<p style="color:#ff8ac8;margin-top:20px">Le catalogue ne répond pas.</p>';return;}
    if(selT==null||selT>=liste.length)selT=0;
    const L=liste[selT];
    const m=L.garage?modele(L.garage.modele):modele(L.modele);
    const vid=m?m.id:'';
    const t=L.garage?tuningDe(m||{},L.garage):tuningDe(m,null);
    /* l'aperçu d'une pièce pas encore achetée : montée pour voir, pas enregistrée */
    const tv=Object.assign({},t);
    if(apercu){if(apercu.v===null)delete tv[apercu.k];else tv[apercu.k]=apercu.v;}
    const marque=m?m.marque:'Toyota';
    const N=notesDe(marque,tv), N0=notesDe(marque,{});
    const C=CATS[cat];
    let choix='';
    for(const k of C.k){
      if(C.k.length>1)choix+='<span class="atSep">'+LIB[k]+'</span>';
      const cur=tv[k];
      const rondOuPil=(o,on)=>{const pos=possede(vid,k,o);
        const prix=pos?'':'<i class="atPx">'+prixTxt(o.p)+'</i>';
        if(o.c)return '<button class="atRond'+(on?' on':'')+(pos?'':' lock')+'" data-k="'+k+'" data-v="'+o.v+'" style="background:'+o.c+'">'+prix+'</button>';
        return '<button class="atPil'+(on?' on':'')+(pos?'':' lock')+'" data-k="'+k+'" data-v="'+o.v+'">'+o.txt+(pos?'':' <small>'+prixTxt(o.p)+'</small>')+'</button>';};
      choix+=((OPT[k][0]&&OPT[k][0].c)?'<button class="atRond orig'+(cur==null?' on':'')+'" data-k="'+k+'" data-v="">'+ORIG[k]+'</button>':'<button class="atPil'+(cur==null?' on':'')+'" data-k="'+k+'" data-v="">'+ORIG[k]+'</button>');
      choix+=OPT[k].map(o=>rondOuPil(o,String(cur)===String(o.v))).join('');
    }
    const titre=C.k.map(k=>LIB[k]).join(' · ');
    const d=(a,b)=>{const x=Math.round((a-b)*10)/10;return x?'<em class="'+(x>0?'up':'dn')+'">'+(x>0?'+':'')+x.toFixed(1).replace('.',',')+'</em>':'';};
    const f=x=>x.toFixed(1).replace('.',',');
    /* le bouton du bas : acheter l'aperçu, ou partir sur le circuit */
    let bas;
    if(apercu&&apercu.o&&!possede(vid,apercu.k,apercu.o)){
      const manque=(e.euros||0)<apercu.o.p;
      bas='<button class="atRaz" id="atAnnule" aria-label="Annuler">✕</button><button class="atGo achat'+(manque?' pas':'')+'" id="atAchat">'+(manque?'Il te manque '+enEuros(apercu.o.p-(e.euros||0)):'Acheter · '+enEuros(apercu.o.p))+'</button>';
    }else bas='<button class="atRaz" id="ccRaz" aria-label="Tout d’origine">↺</button><button class="atGo" id="ccEssaiT">Essayer sur le circuit</button>';
    const solde=$('atSolde');if(solde)solde.textContent=enEuros(e.euros||0);
    $('ccCorps').innerHTML=
      '<div class="atScene" id="atScene"><div class="atMur"></div><div class="atNeon"></div><div class="atOutils">'+'<i></i>'.repeat(9)+'</div>'+
        (tv.neon?'<div class="atGlow'+(tv.neonfx?' fx-'+tv.neonfx:'')+'" style="background:'+tv.neon+'"></div>':'')+
        '<canvas class="atVoit" id="atVoit"></canvas><div class="atPont"><i></i><i></i></div><div class="atSol"></div>'+
        '<canvas class="atDessus" id="atDessus" width="68" height="32"></canvas>'+
        '<button class="ccFl g atFl" id="atPrec" aria-label="Voiture précédente">‹</button><button class="ccFl d atFl" id="atSuiv" aria-label="Voiture suivante">›</button>'+
        '<div class="atNom"><b>'+esc(L.garage&&L.garage.nom?L.garage.nom:nom(m))+'</b><small>'+(apercu&&apercu.o&&!possede(vid,apercu.k,apercu.o)?'APERÇU · PAS ENCORE À TOI':(L.garage?'MA VOITURE':'TA CONFIG'))+' · '+(selT+1)+' / '+liste.length+'</small></div></div>'+
      '<div class="atPan"><div class="atCats">'+CATS.map((c,i)=>'<button class="atCat'+(i===cat?' on':'')+'" data-cat="'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+c.ic+'</svg>'+c.n+'</button>').join('')+'</div>'+
        '<h4 class="atT">'+titre+(POSS_ERR?' · <span style="color:#ff8a7a">'+POSS_ERR+'</span>':'')+'</h4><div class="atChoix">'+choix+'</div>'+
        '<div class="atDelta"><div><small>VITESSE</small><b>'+f(N.vit)+d(N.vit,N0.vit)+'</b></div><div><small>ACCÉL.</small><b>'+f(N.acc)+d(N.acc,N0.acc)+'</b></div><div><small>DRIFT</small><b>'+f(N.drift)+d(N.drift,N0.drift)+'</b></div></div>'+
        '<div class="atBas">'+bas+'</div></div>';
    const caler=()=>{const sc=$('atScene'), c=$('atVoit');if(!sc||!c||!c.width)return;
      const dpr=window.devicePixelRatio||1, aw=sc.clientWidth*0.78, ah=Math.min(sc.clientHeight*0.42,150);
      const k=Math.max(1,Math.floor(Math.min(aw*dpr/c.width,ah*dpr/c.height)));
      c.style.width=(c.width*k/dpr)+'px';c.style.height=(c.height*k/dpr)+'px';
      c.style.bottom='calc(38% + 7px - '+((c.dataset.vide|0)*k/dpr)+'px)';};
    chargerImgTK(sprite(m)).then(img=>{const cv=$('atVoit');if(!img||!cv)return;const r=repeindreProfil(img,tv);cv.width=r.width;cv.height=r.height;const g2=cv.getContext('2d');g2.drawImage(r,0,0);
      try{const D=g2.getImageData(0,0,cv.width,cv.height).data;let v=0;for(let y=cv.height-1;y>=0;y--){let plein=false;for(let x=0;x<cv.width;x++)if(D[(y*cv.width+x)*4+3]>40){plein=true;break;}if(plein)break;v++;}cv.dataset.vide=v;}catch(x){}
      caler();});
    try{const pd=$('atDessus').getContext('2d');pd.imageSmoothingEnabled=false;pd.drawImage(peindreVoitureDessus(marque,tv),0,0);}catch(x){}
    caler2=caler;
    const aller=dd=>{selT=(selT+dd+liste.length)%liste.length;apercu=null;rendre();};
    $('atPrec').onclick=()=>aller(-1);$('atSuiv').onclick=()=>aller(1);
    let x0=null;const sc=$('atScene');
    sc.addEventListener('touchstart',ev=>{x0=ev.touches[0].clientX;},{passive:true});
    sc.addEventListener('touchend',ev=>{if(x0==null)return;const dx=ev.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)aller(dx<0?1:-1);},{passive:true});
    $('ccCorps').querySelectorAll('button[data-cat]').forEach(b=>{b.onclick=()=>{cat=+b.dataset.cat;apercu=null;rendre();};});
    const garderDefil=fn=>{const ch=document.querySelector('.atChoix'), sx=ch?ch.scrollLeft:0;fn();const ch2=document.querySelector('.atChoix');if(ch2)ch2.scrollLeft=sx;};
    $('ccCorps').querySelectorAll('button[data-k]').forEach(b=>{b.onclick=()=>{
      const k=b.dataset.k, raw=b.dataset.v;
      try{navigator.vibrate&&navigator.vibrate(8);}catch(x){}
      if(raw===''){delete t[k];apercu=null;try{sauver();}catch(x){}garderDefil(rendre);return;}
      const o=OPT[k].find(o=>String(o.v)===raw);if(!o)return;
      if(possede(vid,k,o)){t[k]=o.v;apercu=null;try{sauver();}catch(x){}}
      else apercu={k,v:o.v,o};
      garderDefil(rendre);};});
    if($('ccRaz'))$('ccRaz').onclick=()=>{for(const k of Object.keys(t))delete t[k];apercu=null;try{sauver();}catch(x){}rendre();};
    if($('ccEssaiT'))$('ccEssaiT').onclick=()=>{fermerConcessionTokyo();debutEssai(m||{marque:'Toyota'},L.garage||null,t);};
    if($('atAnnule'))$('atAnnule').onclick=()=>{apercu=null;garderDefil(rendre);};
    if($('atAchat'))$('atAchat').onclick=async()=>{
      const A=apercu;if(!A)return;
      if((e.euros||0)<A.o.p){bulle('Il te manque de quoi payer.');return;}
      const bt=$('atAchat');bt.disabled=true;bt.textContent='Le mécano monte la pièce…';
      const r=await rpcAuth('tokyo_acheter_tuning',{p_voiture:vid,p_cle:A.k,p_valeur:String(A.v)});
      if(!r||r.erreur){bt.disabled=false;
        bulle(r&&r.erreur==='pas_assez'?'Il te manque de quoi payer.':(r&&r.erreur)||'L’achat n’a pas abouti.');
        if(r&&typeof r.euros==='number')e.euros=r.euros;garderDefil(rendre);return;}
      if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();sauver();}catch(x){}}
      POSS.add(cleP(vid,A.k,String(A.v)));t[A.k]=A.v;apercu=null;try{sauver();}catch(x){}
      try{navigator.vibrate&&navigator.vibrate([15,40,30]);jouer&&jouer('achat','moment');}catch(x){}
      bulle('Pièce montée ! '+(LIB[A.k]||'')+' · '+(A.o.txt||'')+' — à toi pour de bon.');
      garderDefil(rendre);};
  };
  ouvrirConcessionTokyo.redessiner=()=>rendre();
  const rendre=()=>{nav();$('ccDefile').classList.remove('atelier');$('ccDefile').classList.toggle('fixe',onglet===0);(onglet===3?records:onglet===2?tuning:onglet===1?garage:showroom)();$('ccDefile').scrollTop=0;};
  rendre();
}

/* ================= L'ESSAI : CONDUIRE UNE VOITURE DU SHOWROOM =================
   Vue de dessus. Le joystick donne le CAP voulu : la voiture braque vers lui
   et accélère selon la poussée ; on lâche, elle roule en roue libre et freine.
   LE DRIFT : la vitesse se décompose en avant et en travers. L'adhérence en
   travers est forte d'ordinaire ; à pleine vitesse, quand on braque fort,
   elle s'effondre et l'arrière décroche. Traces de pneus et fumée au sol. */
/* LE GRAND CIRCUIT DE TOKYO : la route du haut est la ligne droite des stands,
   puis la piste descend tout le quartier en serpentin — une chicane rapide à
   droite, trois épingles, un « S » en remontant à gauche — et revient sur la
   ligne. Elle est tracée « à la tortue » : des lignes droites et des arcs de
   rayon connu, ce qui donne des virages francs et des vibreurs exacts.
   ep : la largeur de piste. ligne : l'abscisse de la ligne d'arrivée. */
const CIRCUIT={ep:100,ligne:540,y:288,depart:300};
const PISTE=(function(){
  const seg=[];let x=CIRCUIT.depart,y=CIRCUIT.y,h=0;
  const D=L=>{seg.push({t:'d',x0:x,y0:y,h,L});x+=Math.cos(h)*L;y+=Math.sin(h)*L;};
  const A=(r,deg)=>{const th=deg*Math.PI/180, s=Math.sign(th), cx=x-s*Math.sin(h)*r, cy=y+s*Math.cos(h)*r;
    seg.push({t:'a',cx,cy,r,s,f0:Math.atan2(y-cy,x-cx),h0:h,L:r*Math.abs(th)});
    const f=Math.atan2(y-cy,x-cx)+th;x=cx+Math.cos(f)*r;y=cy+Math.sin(f)*r;h+=th;};
  D(380);A(110,90);                    /* la ligne droite, le virage n°1 à droite */
  D(302);A(160,40);A(160,-40);D(120);A(160,-40);A(160,40);   /* la chicane rapide */
  D(2330-1231.4);A(100,180);            /* la descente, l'épingle du bas */
  D(1030);A(100,-180);                  /* la remontée, l'épingle du haut */
  D(1030);A(100,180);                   /* la redescente, l'épingle du bas à gauche */
  D(1330);A(160,40);A(160,-40);D(100);A(160,-40);A(160,40);  /* la longue remontée et son « S » */
  D(Math.max(0,y-398));A(110,90);       /* le dernier virage, vers la ligne */
  let L=0;for(const s of seg){s.s0=L;L+=s.L;}
  const N=Math.round(L/5), pts=[];
  let j=0;
  for(let i=0;i<N;i++){
    const s=i/N*L;while(j<seg.length-1&&s>=seg[j+1].s0)j++;
    const g=seg[j], u=s-g.s0;let px,py,ang,k;
    if(g.t==='d'){px=g.x0+Math.cos(g.h)*u;py=g.y0+Math.sin(g.h)*u;ang=g.h;k=0;}
    else{const f=g.f0+g.s*u/g.r;px=g.cx+Math.cos(f)*g.r;py=g.cy+Math.sin(f)*g.r;ang=g.h0+g.s*u/g.r;k=1/g.r;}
    pts.push({s,x:px,y:py,ang,k,sg:g.t==='a'?g.s:0});
  }
  return {L,N,pts,seg,ligneS:CIRCUIT.ligne-CIRCUIT.depart,ferme:Math.hypot(x-CIRCUIT.depart,y-CIRCUIT.y)};
})();
function pointPiste(s){const P=PISTE;s=((s%P.L)+P.L)%P.L;const f=s/P.L*P.N, i=Math.floor(f)%P.N, j=(i+1)%P.N, u=f-Math.floor(f);
  const a=P.pts[i], b=P.pts[j];let da=b.ang-a.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,ang:a.ang+da*u,k:Math.max(a.k,b.k)};}
/* où en est-on sur la piste : le point le plus proche, cherché autour du précédent */
function projeter(x,y,indice){
  const P=PISTE;let best=indice==null?0:indice, bd=1e9;
  const tous=indice==null, de=tous?0:indice-40, a=tous?P.N:indice+40;
  for(let q=de;q<a;q++){const i=((q%P.N)+P.N)%P.N, p=P.pts[i], d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);if(d<bd){bd=d;best=i;}}
  if(!tous&&bd>140*140)return projeter(x,y,null);   /* trop loin du dernier point : on cherche partout */
  const p=P.pts[best];const lat=-(x-p.x)*Math.sin(p.ang)+(y-p.y)*Math.cos(p.ang);
  return {i:best,s:p.s,lat,d:Math.sqrt(bd)};
}
/* la distance au bord de la piste (0 sur la piste) ; la route du haut est la voie des stands */
function horsPiste(x,y){
  if(y>TK.route[0]-4&&y<TK.route[1]+4&&x<CIRCUIT.depart+380)return 0;
  const p=projeter(x,y,horsPiste.i);horsPiste.i=p.i;
  return Math.max(0,p.d-CIRCUIT.ep/2);
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
  if(t.finition==='chrome')M.c=['#5a6070','#9aa2b2','#d8dde6','#eef2f8','#ffffff'];
  else if(t.finition==='cameleon')M.c=['#3a1a6a','#6a3ad0','#40d8b0','#b8ffe8','#ffffff'];
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
function majMoteur(dt,vit,gaz,glisse,rapport){
  const S=SON_TK;
  /* six rapports sur la plage de vitesse : le régime monte dans chacun, puis retombe */
  const fr=vit/340;let rap=rapport!=null?rapport:Math.min(5,Math.floor(vit/70));
  const lo=RAPPORTS[rap]||0, hi=RAPPORTS[rap+1]||1.05, p=Math.max(0,Math.min(1,(fr-lo)/(hi-lo)));
  let cible=vit<4?(gaz?2600:900):1500+p*5600;
  if(!S.ctx){S.rpm=(S.rpm||900)+(cible-(S.rpm||900))*Math.min(1,8*dt);return;}
  S.rpm+=(cible-S.rpm)*Math.min(1,(gaz?9:5)*dt);
  const f=S.rpm/30, t=S.ctx.currentTime;
  S.o1.frequency.setTargetAtTime(f,t,0.03);S.o2.frequency.setTargetAtTime(f/2,t,0.03);
  S.filtre.frequency.setTargetAtTime(gaz?500+S.rpm*0.55:300+S.rpm*0.2,t,0.05);
  S.vol.gain.setTargetAtTime(gaz?0.16:0.07,t,0.08);
  S.crisse.gain.setTargetAtTime(Math.min(0.12,Math.max(0,(glisse-45)/900)),t,0.05);
}
function pop(){const S=SON_TK;if(!S.ctx)return;try{const C=S.ctx,t0=C.currentTime;const n=C.createBufferSource(),b=C.createBuffer(1,C.sampleRate*0.12,C.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);n.buffer=b;const g=C.createGain();g.gain.value=0.5;n.connect(g);g.connect(C.destination);n.start(t0);}catch(x){}}
function couperMoteur(){const S=SON_TK;if(!S.ctx)return;try{S.vol.gain.setTargetAtTime(0,S.ctx.currentTime,0.05);const C=S.ctx;setTimeout(()=>{try{C.close();}catch(x){}},300);}catch(x){}S.ctx=null;}

/* =====================================================================
   LA CONDUITE, VERSION 3 — PHYSIQUE ARCADE, DRIFT, COURSE
   =====================================================================
   LA BOUCLE. majEssai(dt) est appelée par la boucle du jeu à chaque image.
   Elle découpe le temps en PAS FIXES de 1/120 s : la voiture se conduit
   pareil à 30, 60 ou 120 images par seconde.
   LA VOITURE. Sa vitesse est lue dans son axe : l'AVANT (poussée, frein,
   frottement) et le TRAVERS (tué par l'adhérence). Sa rotation (le lacet)
   suit la consigne du volant avec une inertie réglée par la stabilité :
   elle répond tout de suite, sans tourner sur un rail.
   LE DRIFT. Maintenir DRIFT en tournant : l'adhérence latérale s'effondre,
   l'arrière part, la carrosserie s'oriente vers la glisse ; les gaz et le
   contre-braquage la tiennent. Les points montent avec la durée, l'angle et
   la maîtrise (le bon angle rapporte plus que la toupie). Un drift fini
   SANS TOUCHER rapporte ses points et un turbo ; un choc les perd.
   LA COURSE. Trois tours contre cinq pilotes et du trafic, départ arrêté,
   compte à rebours, points de passage, classement en direct, récompense
   versée par le serveur. */
const PAS=1/120;
const DRIFT_NIV=[0,0.7,1.5,2.4];                 /* secondes de glisse propre pour chaque niveau de charge */
const BOOST_T=[0,0.6,1.0,1.5], BOOST_K=[1,1.2,1.3,1.42];
const COUL_NIV=['#ffffff','#5ad8ff','#ff9a3c','#ff4fb0'];
const RAPPORTS=[0,0.16,0.31,0.47,0.63,0.8];
const KMH=1.35;                                   /* px/s → km/h affichés */
const CMDS={g:false,d:false,gaz:false,frein:false,drift:false,nitro:false};
let MODE_CMD=(()=>{try{return localStorage.getItem('bdl.tk.cmd')||'boutons';}catch(x){return 'boutons';}})();

/* ================= LE DÉBUT ET LA FIN D'UNE SORTIE ================= */
function debutEssai(v,aMoi,reglages,mode){
  const E=ESSAI;
  E.actif=true;E.garage=aMoi||null;E.modele=v||{};E.mode=mode==='course'?'course':'libre';
  E.tuning=(aMoi&&aMoi.tuning)||reglages||{};
  E.stats=statsVoiture(v&&v.marque,E.tuning);
  E.halo=null;E.dist=0;E.drifts=0;E.nom=[v.marque,v.modele].filter(Boolean).join(' ');
  E.toile=peindreVoitureDessus(v.marque,E.tuning);
  E.retour=E.retour&&E.actifAvant?E.retour:{x:joueur.x,y:joueur.y};
  E.x=CIRCUIT.ligne-150;E.y=(TK.route[0]+TK.route[1])/2+18;E.ang=0;E.vx=0;E.vy=0;
  E.limite=(aMoi||E.mode==='course')?null:180;
  E.tour=null;E.tours=0;E.cp=0;E.dernier=null;E.trainee=[];E.flamme=0;E.gazAvant=0;
  E.traces=[];E.fumee=[];E.etinc=[];E.recul=false;E.reste=0;E.idx=null;
  E.lacet=0;E.vol=0;E.idx=null;E.rapport=0;E.coupure=0;E.glisse=false;E.glisseT=0;E.charge=0;E.points=0;E.combo=1;E.finCombo=0;E.score=0;E.propre=true;
  E.boostT=0;E.boostK=1;E.nitroT=0;E.nitroCharge=1;E.choc=0;
  COURSE.actif=false;
  if(E.mode==='course')preparerCourse();
  joueur.x=E.x;joueur.y=E.y;
  couperMoteur();demarrerMoteur();
  document.body.classList.add('tk-volant');
  try{window.TK_SANS_JOY=(MODE_CMD==='boutons');}catch(x){}
  hudMontrer(true);
  try{taille();videCache();}catch(x){}
}
function finEssai(){
  const E=ESSAI;
  E.actif=false;
  if(E.garage){const v=E.garage;v.km=(v.km||0)+E.dist*0.00025;v.drifts=(v.drifts||0)+E.drifts;v.sorties=(v.sorties||0)+1;try{sauver();}catch(x){}}
  E.garage=null;COURSE.actif=false;COURSE.voitures=[];
  hudMontrer(false);
  couperMoteur();
  document.body.classList.remove('tk-volant');
  try{window.TK_SANS_JOY=false;}catch(x){}
  for(const k in CMDS)CMDS[k]=false;
  try{taille();videCache();}catch(x){}
  const r=E.retour||{x:86,y:224};
  const [dx,dy]=degager(r.x,r.y);joueur.x=dx;joueur.y=dy;
}

/* ================= LES COMMANDES =================
   Deux façons de conduire, au choix (bouton en haut de l'écran) :
   — BOUTONS : ◀ ▶ pour tourner, GAZ, FREIN, DRIFT, NITRO. Un bouton reste
     enfoncé tant que le doigt reste posé, même s'il glisse hors du bouton
     (le doigt est « capturé ») ; il lâche au moment où le doigt se lève.
     Chaque doigt est suivi à part : on tourne, accélère et drifte en même
     temps sans que les doigts se marchent dessus.
   — JOYSTICK : le pouce gauche pointe où aller, l'accélérateur suit la
     poussée ; DRIFT et NITRO restent à droite. */
function lireCommandes(jx,jy){
  const E=ESSAI;let s=0,g=0,b=0;
  /* les boutons ◀ ▶ GAZ restent actifs dans les deux modes : s'ils sont tenus, ils priment sur le joystick */
  if(MODE_CMD==='boutons'||CMDS.g||CMDS.d||CMDS.gaz){
    s=(CMDS.d?1:0)-(CMDS.g?1:0);g=CMDS.gaz?1:0;b=CMDS.frein?1:0;
  }else{
    jx=jx||0;jy=jy||0;const n=Math.min(1,Math.hypot(jx,jy));
    const av0=E.vx*Math.cos(E.ang)+E.vy*Math.sin(E.ang);
    if(n>0.2){const a=Math.atan2(jy,jx);let d=Math.atan2(Math.sin(a-E.ang),Math.cos(a-E.ang));
      if(!E.recul&&Math.abs(d)>2.4&&av0<30&&!CMDS.drift)E.recul=true;
      if(E.recul&&Math.abs(d)<1.6)E.recul=false;
      if(E.recul){const ar=a+Math.PI;d=Math.atan2(Math.sin(ar-E.ang),Math.cos(ar-E.ang));s=-Math.max(-1,Math.min(1,d*1.8));b=n;}
      else if(Math.abs(d)>2.1&&av0>30&&!CMDS.drift)b=1;
      else{s=Math.max(-1,Math.min(1,d*1.8));g=n*(Math.abs(d)<0.7?1:Math.max(0.45,Math.cos(Math.abs(d)*0.6)));}}
    else E.recul=false;
    if(CMDS.frein){b=1;g=0;}
  }
  return {s,g,b,h:!!CMDS.drift};
}

/* ================= UN PAS DE PHYSIQUE ================= */
function pasPhysique(dt,c){
  const E=ESSAI, S=E.stats||statsVoiture('Toyota',{});
  const hp=horsPiste(E.x,E.y)>4;
  /* nitro et turbo de drift */
  if(E.nitroT>0)E.nitroT-=dt;else if(S.nitro&&E.nitroCharge<1)E.nitroCharge=Math.min(1,E.nitroCharge+dt/(S.nitro>1?5:8));
  if(E.boostT>0)E.boostT-=dt;
  const NB=E.nitroT>0?(S.nitro>1?1.5:1.35):1, BB=E.boostT>0?E.boostK:1, K=Math.max(NB,BB);
  const VMAX=S.vmax*(hp?0.5:1)*K, ACC=S.acc*0.8*(hp?0.65:1)*(K>1?1.8:1);
  const fx=Math.cos(E.ang), fy=Math.sin(E.ang);
  let av=E.vx*fx+E.vy*fy, tr=-E.vx*fy+E.vy*fx;
  const v=Math.hypot(av,tr);
  /* 1. LA BOÎTE ET LA POUSSÉE */
  const fr=Math.max(0,av)/S.vmax;let rap=0;for(let i=0;i<RAPPORTS.length;i++)if(fr>=RAPPORTS[i])rap=i;
  if(rap!==E.rapport){if(rap>E.rapport&&c.g>0){E.coupure=0.1;if((E.tuning||{}).flammes||rap>=3)pop();}E.rapport=rap;}
  if(E.coupure>0)E.coupure-=dt;
  const couple=[1.3,1.12,1,0.92,0.85,0.8][rap]*(E.coupure>0?0.35:1);
  if(c.g>0){if(av<-5)av+=S.frein*dt;else av+=ACC*couple*c.g*Math.max(0.04,1-Math.pow(Math.max(0,av)/VMAX,2))*dt;}
  if(c.b>0){if(av>8)av-=S.frein*c.b*dt;else av=Math.max(-62,av-ACC*0.55*c.b*dt);}   /* frein, puis marche arrière */
  if(c.h)av*=Math.exp(-0.5*dt);                  /* le frein à main mord un peu */
  if(!(c.g>0)&&!(c.b>0)){av*=Math.exp(-(hp?2.2:0.75)*dt);if(Math.abs(av)<3)av=0;}
  if(av>VMAX)av+=(VMAX-av)*Math.min(1,2.5*dt);
  E.vx=av*fx-tr*fy;E.vy=av*fy+tr*fx;           /* la poussée et le frein, rendus au vecteur vitesse */
  /* 2. LE VOLANT : il ne saute pas en butée. Un appui bref donne une petite
     correction, un appui tenu braque franchement (≈ 0,15 s). Il revient vite au centre. */
  const visee=c.s||0, revient=Math.abs(visee)<Math.abs(E.vol||0)||visee*(E.vol||0)<0;
  E.vol=(E.vol||0)+(visee-(E.vol||0))*Math.min(1,(revient?12:7)*dt);
  /* 3. LE LACET. En adhérence, la voiture suit un RAYON DE BRAQUAGE qui grandit avec la
     vitesse : serré à basse vitesse, large à fond (on freine avant une épingle).
     La rotation suit la consigne avec une inertie courte : elle répond tout de suite. */
  const va=Math.abs(av), sens=av<-2?-1:1;
  const angG=Math.atan2(Math.abs(tr),Math.max(1,va));
  const R=(45+0.42*va)*3/S.dir;
  let cons=E.vol*sens*Math.min(va/R,3);
  if(E.glisse){
    /* en glisse, le volant dose l'angle ; au-delà de 50°, la voiture se rattrape d'elle-même */
    cons=E.vol*S.dir*1.1*S.maitrise+Math.sign(tr||1)*(0.3*Math.min(1,angG/0.6)*(c.h?1:0.5)+Math.max(0,angG-0.85)*5/S.maitrise);
  }
  const reactif=(E.glisse?4:10)*S.stab;
  E.lacet+=(cons-E.lacet)*Math.min(1,reactif*dt);
  E.ang+=E.lacet*dt;
  /* 4. L'ADHÉRENCE LATÉRALE : forte d'ordinaire (la voiture suit son nez), effondrée au frein à main */
  let grip=S.grip*(hp?0.75:1);
  if(c.h&&v>30)grip=S.glisse*0.55/S.tenue;
  else if(E.glisse)grip=(c.g>0.3?S.glisse:S.glisse*2.2)/S.tenue+(1-Math.min(1,angG/0.9))*1.2;
  else if(c.b>0)grip=S.grip*0.85;
  const nx=Math.cos(E.ang), ny=Math.sin(E.ang);
  av=E.vx*nx+E.vy*ny;tr=-E.vx*ny+E.vy*nx;      /* relue dans l'axe neuf : c'est l'inertie latérale */
  const avantTr=tr;
  tr*=Math.exp(-grip*dt);
  if(E.glisse)av+=Math.abs(avantTr-tr)*0.22;    /* la glisse rend un peu d'élan à l'avant */
  if(!c.h&&!E.glisse)av=Math.min(av,VMAX*1.02);
  E.vx=av*nx-tr*ny;E.vy=av*ny+tr*nx;
  /* 5. LA GLISSE : DRIFT tenu en braquant, ou un vrai survirage ; on en sort sous 7° */
  const vit=Math.hypot(av,tr), angG2=Math.atan2(Math.abs(tr),Math.max(1,Math.abs(av)));
  if(!E.glisse&&vit>S.vmax*0.28&&((c.h&&Math.abs(E.vol)>0.25)||angG2>0.32)){
    E.glisse=true;E.glisseT=0;E.propre=true;E.combo=(E.finCombo>0)?Math.min(5,(E.combo||1)+1):1;E.drifts++;
    if(c.h)E.lacet+=E.vol*0.8;                      /* le coup de frein à main jette l'arrière */
  }else if(E.glisse&&((angG2<0.12&&!c.h)||vit<S.vmax*0.18))finDeGlisse();
  if(E.glisse){
    E.glisseT+=dt;
    const deg=angG2*57.3, maitrise=deg<12?0.6:deg<=45?1.5:deg<=65?1:0.5;  /* le bon angle rapporte plus que la toupie */
    E.charge=Math.min(3,E.charge+dt*(maitrise>=1?1:0.4)*S.tenue);
    E.points+=deg*(vit/40)*dt*maitrise*E.combo;E.finCombo=1.6;E.maitriseVue=maitrise;
  }else if(E.finCombo>0){E.finCombo-=dt;if(E.finCombo<=0)encaisserCombo();}
  E.vitesse=vit;E.vmaxVue=S.vmax;E.angGlisse=angG2;E.horsPiste=hp;
  /* le son suit le régime du rapport engagé */
  majMoteur(dt,Math.abs(av)*340/S.vmax,c.g>0&&!(E.coupure>0),Math.abs(tr)*2,rap);
  /* les flammes, la traînée */
  const T0=E.tuning||{};
  if(T0.flammes){if(E.gazAvant>0&&!(c.g>0)&&av>VMAX*0.45){E.flamme=0.35;pop();}E.gazAvant=c.g;}
  if(E.flamme>0)E.flamme-=dt;
  if((E.nitroT>0||E.boostT>0)&&Math.random()<0.5)E.flamme=Math.max(E.flamme,0.06);
  /* 5. LE DÉPLACEMENT ET LES MURS */
  const libre=(X,Y)=>!(bloqueTokyo(X,Y)||X<20||X>MONDE_L-20||Y<TK.bati+18||Y>MONDE_H-18);
  let X=E.x+E.vx*dt, Y=E.y+E.vy*dt;
  if(!libre(X,Y)){
    const choc=Math.hypot(E.vx,E.vy);
    if(libre(X,E.y)){Y=E.y;E.vy*=-0.25;E.vx*=0.82;}
    else if(libre(E.x,Y)){X=E.x;E.vx*=-0.25;E.vy*=0.82;}
    else{X=E.x;Y=E.y;E.vx*=-0.3;E.vy*=-0.3;}
    if(choc>50)heurter(choc,E.x+nx*28,E.y+ny*28);
  }
  E.dist+=Math.hypot(X-E.x,Y-E.y);
  {const pr=projeter(X,Y,E.idx);E.idx=pr.i;E.sPiste=pr.s;E.lat=pr.lat;}
  chronoPas(E.x,E.y,X,Y,dt);
  E.x=X;E.y=Y;
  return {av,tr,nx,ny,hp,vit,VMAX};
}
/* un choc : étincelles, secousse légère, le drift en cours est perdu */
function heurter(force,x,y){
  const E=ESSAI;
  for(let i=0;i<Math.min(14,4+force/25);i++)E.etinc.push({x,y,vx:(Math.random()-0.5)*170,vy:(Math.random()-0.5)*170,vie:0.35,c:'#ffd27a'});
  try{secouer(Math.min(0.5,force/400));}catch(x){}
  if(E.glisse||E.points>0){E.propre=false;E.points=0;E.combo=1;E.finCombo=0;E.charge=0;if(E.glisse){E.glisse=false;}popDrift('DRIFT PERDU','#ff6a5a');}
  try{navigator.vibrate&&navigator.vibrate(Math.min(60,10+force/8));}catch(x){}
}
function niveauCharge(){const c=ESSAI.charge||0;return c>=DRIFT_NIV[3]?3:c>=DRIFT_NIV[2]?2:c>=DRIFT_NIV[1]?1:0;}
/* la glisse finit proprement : turbo selon la charge, et un bonus de maîtrise */
function finDeGlisse(){
  const E=ESSAI, niv=niveauCharge();
  E.glisse=false;
  if(E.propre&&niv>0){E.boostT=BOOST_T[niv];E.boostK=BOOST_K[niv];E.points+=[0,80,200,420][niv]*E.combo;
    popDrift(['','TURBO','SUPER TURBO','ULTRA TURBO'][niv],COUL_NIV[niv]);pop();
    try{navigator.vibrate&&navigator.vibrate([10,20,10*niv*3]);}catch(x){}}
  E.charge=0;
}
/* le combo retombe : ses points rentrent au score de la sortie */
function encaisserCombo(){
  const E=ESSAI;const p=Math.round(E.points||0);
  if(p>0){E.score+=p;popDrift('+'+p.toLocaleString('fr-FR')+' pts','#ffd98a');
    const R=driftRecords();if(R[E.nom]==null||E.score>R[E.nom]){R[E.nom]=E.score;try{localStorage.setItem('bdl.tk.drift',JSON.stringify(R));}catch(x){}}}
  E.points=0;E.combo=1;
}
function driftRecords(){try{return JSON.parse(localStorage.getItem('bdl.tk.drift')||'{}')||{};}catch(x){return {};}}

/* ================= LA BOUCLE : PAS FIXES ================= */
function majEssai(dt,jx,jy){
  const E=ESSAI;
  dt=Math.min(dt||0,0.1);
  if(E.limite!=null){E.limite-=dt;if(E.limite<=0){E.limite=null;const nm=E.nom;finEssai();
    try{texteVolant(joueur.x,joueur.y-44,'Fin de l’essai — '+nm+' t’attend au showroom','#ffd98a');}catch(x){}return;}}
  const gele=COURSE.actif&&COURSE.phase==='decompte';
  E.reste+=dt;let n=0, info=null;
  while(E.reste>=PAS&&n<14){
    E.reste-=PAS;n++;
    const c=gele?{s:0,g:CMDS.gaz?1:0,b:1,h:false}:lireCommandes(jx,jy);
    if(gele){majMoteur(PAS,0,c.g>0,0,0);continue;}
    if(CMDS.nitro&&E.nitroCharge>=1&&E.stats&&E.stats.nitro){E.nitroT=E.stats.nitro>1?2.6:2;E.nitroCharge=0;CMDS.nitro=false;try{navigator.vibrate&&navigator.vibrate([20,30,60]);}catch(x){}}
    info=pasPhysique(PAS,c);
    if(COURSE.actif)pasCourse(PAS);
  }
  if(COURSE.actif)majCourseHorsPas(dt);
  /* LES EFFETS, une fois par image */
  if(info){const {tr,nx,ny,hp,vit}=info;
    if(Math.abs(tr)>22){
      for(const s of [-10,10]){const px=E.x-nx*18-ny*s, py=E.y-ny*18+nx*s;
        try{const gs=SOL.getContext('2d');gs.fillStyle='rgba(12,10,16,.42)';gs.fillRect(Math.round(px)-1,Math.round(py)-1,2,2);}catch(x){E.traces.push([px,py]);}}
      if(E.fumee.length<44&&Math.random()<0.6)E.fumee.push({x:E.x-nx*24+(Math.random()-0.5)*8,y:E.y-ny*24+(Math.random()-0.5)*8,r:4,vie:0.85,c:(E.tuning||{}).fumee||null});
      if(E.traces.length>900)E.traces.splice(0,E.traces.length-900);}
    const niv=niveauCharge();
    if(E.glisse&&niv>0)for(const s of [-10,10])E.etinc.push({x:E.x-nx*20-ny*s,y:E.y-ny*20+nx*s,vx:-nx*40+(Math.random()-0.5)*90,vy:-ny*40+(Math.random()-0.5)*90,vie:0.25,c:COUL_NIV[niv]});
    if(hp&&vit>40&&Math.random()<0.45)E.fumee.push({x:E.x-nx*20,y:E.y-ny*20,r:3,vie:0.5,c:'#8a7a5a'});
    if(E.nitroT>0&&Math.random()<0.7)E.fumee.push({x:E.x-nx*32,y:E.y-ny*32,r:3,vie:0.5,c:'#7fe8ff'});
    if((E.tuning||{}).trainee){E.trainee.push([E.x-nx*26,E.y-ny*26]);if(E.trainee.length>26)E.trainee.shift();}
  }
  for(const f of E.fumee){f.vie-=dt;f.r+=14*dt;}
  E.fumee=E.fumee.filter(f=>f.vie>0);
  for(const p of E.etinc){p.vie-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
  E.etinc=E.etinc.filter(p=>p.vie>0);if(E.etinc.length>140)E.etinc.splice(0,E.etinc.length-140);
  joueur.x=E.x;joueur.y=E.y;
}

/* ================= LA COURSE =================
   Cinq adversaires (les autres voitures du catalogue, peintes au hasard) et
   trois petites voitures de trafic qui roulent lentement dans leur couloir.
   Les adversaires suivent l'axe à leur couloir, ralentissent avant les
   virages, changent de couloir pour doubler, et se laissent doubler : leur
   vitesse reste sous celle d'une voiture bien pilotée. Un léger élastique
   les garde au contact, sans jamais tricher en ligne droite. */
const COURSE={actif:false,phase:'',t:0,tours:3,voitures:[],dep:0,fin:null};
const COUL_ADV=['#1a5fd0','#5cc83a','#ffd21f','#f4f4f6','#ff7a1a','#7a3cff','#1fd6c3'];
function preparerCourse(){
  const E=ESSAI, P=PISTE;
  COURSE.actif=true;COURSE.phase='decompte';COURSE.t=3;COURSE.voitures=[];COURSE.fin=null;COURSE.temps=0;COURSE.resultat=null;
  const marques=['Toyota','BMW','Lamborghini','Porsche','Nissan','Ferrari'].filter(m=>m!==(E.modele||{}).marque);
  /* la grille : le joueur en dernière ligne, à gauche */
  const grille=[[-45,-28],[-45,28],[-110,-28],[-110,28],[-175,-28],[-175,28]];
  for(let i=0;i<5;i++){
    const m=marques[i%marques.length], S=statsVoiture(m,{}), coul=COUL_ADV[(i*3+Math.floor(Math.random()*7))%COUL_ADV.length];
    const s=P.ligneS+grille[i][0], lane=grille[i][1];
    COURSE.voitures.push({type:'adv',nom:['Kenji','Aya','Ryo','Mika','Takumi'][i]+' · '+m,marque:m,toile:peindreVoitureDessus(m,{couleur:coul}),
      s,lane,laneCible:lane,v:0,vmax:Math.min(S.vmax,(E.stats||S).vmax)*(0.88+i*0.03),acc:Math.min(S.acc,(E.stats||S).acc)*0.9,   /* au niveau de TA voiture : c'est le tuning qui fait la différence */
      tours:0,tour0:false,fini:null,x:0,y:0,ang:0,r:13});
  }
  for(let i=0;i<4;i++){
    const s=P.ligneS+P.L*(0.2+i*0.2), lane=i%2?28:-28;
    COURSE.voitures.push({type:'trafic',nom:'Trafic',marque:'Toyota',toile:petiteVoiture(['#f4f4f6','#ffd21f','#2a2c33','#1a5fd0'][i]),
      s,lane,laneCible:lane,v:70+i*8,vmax:70+i*8,acc:60,tours:0,x:0,y:0,ang:0,r:11});
  }
  for(const c of COURSE.voitures){const p=pointPiste(c.s);c.x=p.x-Math.sin(p.ang)*c.lane;c.y=p.y+Math.cos(p.ang)*c.lane;c.ang=p.ang;}
  /* le joueur : dernière place de la grille */
  const pj=pointPiste(P.ligneS+grille[5][0]);E.x=pj.x-Math.sin(pj.ang)*grille[5][1];E.y=pj.y+Math.cos(pj.ang)*grille[5][1];E.ang=pj.ang;
  E.tour=null;E.tours=0;E.cp=0;
  const pr=projeter(E.x,E.y,null);E.idx=pr.i;E.sPiste=pr.s;
  decompteMontrer(3);
}
/* la petite voiture du trafic : une boîte, des vitres, des feux */
function petiteVoiture(coul){
  const c=document.createElement('canvas');c.width=68;c.height=32;const g=c.getContext('2d');
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(14,9,40,16);
  g.fillStyle=coul;g.fillRect(16,8,36,16);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(16,8,36,2);
  g.fillStyle='#2a3442';g.fillRect(36,10,7,12);g.fillRect(20,10,5,12);
  g.fillStyle='#fff6c0';g.fillRect(51,9,1,3);g.fillRect(51,20,1,3);g.fillStyle='#ff3030';g.fillRect(16,9,1,3);g.fillRect(16,20,1,3);
  return c;
}
function pasCourse(dt){
  const E=ESSAI, P=PISTE;
  COURSE.temps+=dt;
  const proj={s:E.sPiste||0,lat:E.lat||0};
  for(const c of COURSE.voitures){
    /* la vitesse visée : on lève le pied avant un virage */
    let cible=c.vmax;
    if(c.type==='adv'){
      /* la vitesse de passage de chaque virage devant (rayon de braquage du joueur), et la distance pour freiner */
      for(let a=0;a<=260;a+=20){const k=pointPiste(c.s+a).k;if(k>0){const vv=((1/k)*1.02-45)/0.42;cible=Math.min(cible,Math.sqrt(vv*vv+2*230*a));}}
      /* l'élastique : léger, et seulement s'il est loin */
      const ecart=(progression(c)-progressionJoueur());
      if(ecart>500)cible*=0.96;else if(ecart<-400)cible*=1.04;
      if(c.fini!=null)cible=Math.min(cible,c.vmax*0.7);   /* arrivé : il finit son tour en fantôme */
    }
    if(c.type==='trafic'){const k=pointPiste(c.s+40).k;if(k>0)cible=Math.min(cible,55);}
    c.v+=Math.max(-230*dt,Math.min(c.acc*dt,cible-c.v));
    /* LES COULOIRS : trois files (gauche, milieu, droite). Un adversaire regarde
       la place libre devant lui dans chaque file et prend la plus dégagée pour
       doubler ; il ne change que si le gain est net (pas de zigzag). Derrière
       quelqu'un de plus lent dans sa file, il cale sa vitesse sur lui. */
    const autres=COURSE.voitures.filter(o=>o.fini==null).concat([{s:E.sPiste||0,lane:proj.lat,v:E.vitesse||0,joueur:true}]);
    const libre=(lane)=>{let m=420;for(const o of autres){if(o===c)continue;const ds=((o.s-c.s)%P.L+P.L)%P.L;
      if(ds>0&&ds<420&&Math.abs(o.lane-lane)<24&&(o.v||0)<c.v+8)m=Math.min(m,ds);}return m;};
    if(c.type==='adv'&&(c.choix=(c.choix||0)-dt)<=0){c.choix=0.25;
      const ici=libre(c.laneCible);
      if(ici<220){let best=c.laneCible,bm=ici;for(const l of [-28,0,28]){const m=libre(l);if(m>bm+60){bm=m;best=l;}}c.laneCible=best;}}
    if(c.fini==null)for(const o of autres){if(o===c)continue;const ds=((o.s-c.s)%P.L+P.L)%P.L;
      if(ds>0&&ds<70&&Math.abs(o.lane-c.lane)<22)c.v=Math.min(c.v,Math.max(0,(o.v||0)-5));}
    c.lane+=Math.max(-45*dt,Math.min(45*dt,c.laneCible-c.lane));
    const s0=c.s;c.s+=c.v*dt;
    if(Math.floor((s0-P.ligneS)/P.L)<Math.floor((c.s-P.ligneS)/P.L)){
      if(c.tour0)c.tours++;else c.tour0=true;
      if(c.type==='adv'&&c.tours>=COURSE.tours&&c.fini==null)c.fini=COURSE.temps;}
    const p=pointPiste(c.s);
    const nxp=-Math.sin(p.ang), nyp=Math.cos(p.ang);
    c.x=p.x+nxp*c.lane;c.y=p.y+nyp*c.lane;
    c.ang=p.ang+(c.laneCible-c.lane)*0.004;
    c.vx=Math.cos(c.ang)*c.v;c.vy=Math.sin(c.ang)*c.v;
  }
  /* les chocs entre voitures : on se sépare, on échange un peu de vitesse, on ralentit */
  const toutes=COURSE.voitures;
  for(const c of toutes){
    if(c.fini!=null)continue;          /* les arrivés sont des fantômes : on passe au travers */
    const dx=E.x-c.x, dy=E.y-c.y, d=Math.hypot(dx,dy), min=c.r+14;
    if(d>0&&d<min){
      const ux=dx/d, uy=dy/d, pen=min-d;
      E.x+=ux*pen*0.6;E.y+=uy*pen*0.6;c.lane=Math.max(-40,Math.min(40,c.lane-(ux*-Math.sin(c.ang)+uy*Math.cos(c.ang))*pen*0.4));c.laneCible=c.lane;
      const rel=(E.vx-c.vx)*ux+(E.vy-c.vy)*uy;
      if(rel<0){E.vx-=rel*ux*1.3;E.vy-=rel*uy*1.3;E.vx*=0.9;E.vy*=0.9;if(-rel>12)c.v*=0.92;
        if(-rel>25)heurter(-rel,E.x-ux*12,E.y-uy*12);}
    }
  }
  for(let i=0;i<toutes.length;i++)for(let j=i+1;j<toutes.length;j++){
    const a=toutes[i],b=toutes[j];if(a.fini!=null||b.fini!=null)continue;let ds=((b.s-a.s)%P.L+P.L)%P.L;if(ds>P.L/2)ds-=P.L;
    const dl=a.lane-b.lane;
    if(Math.abs(ds)<72&&Math.abs(dl)<28){const k=(28-Math.abs(dl))*0.06, sg=dl>=0?1:-1;a.lane=Math.max(-40,Math.min(40,a.lane+sg*k));b.lane=Math.max(-40,Math.min(40,b.lane-sg*k));
      if(ds>0)a.v=Math.min(a.v,b.v*0.98);else b.v=Math.min(b.v,a.v*0.98);}
  }
  /* l'arrivée du joueur */
  if(COURSE.phase==='course'&&E.tours>=COURSE.tours&&COURSE.fin==null){COURSE.fin=COURSE.temps;COURSE.phase='fini';arriveeCourse();}
}
function progression(c){return (c.tour0?c.tours*PISTE.L:-PISTE.L)+((c.s-PISTE.ligneS)%PISTE.L+PISTE.L)%PISTE.L;}
function progressionJoueur(){const E=ESSAI;const s=(((E.sPiste||0)-PISTE.ligneS)%PISTE.L+PISTE.L)%PISTE.L;
  return (E.tour==null?-PISTE.L:E.tours*PISTE.L)+(E.tour==null&&s>PISTE.L/2?s-PISTE.L+PISTE.L:s);}
function classement(){
  const L=COURSE.voitures.filter(c=>c.type==='adv').map(c=>({nom:c.nom,p:c.fini!=null?1e9-c.fini:progression(c),joueur:false}));
  L.push({nom:'Toi',p:COURSE.fin!=null?1e9-COURSE.fin:progressionJoueur(),joueur:true});
  L.sort((a,b)=>b.p-a.p);return L;
}
function majCourseHorsPas(dt){
  if(COURSE.phase==='decompte'){
    const avant=Math.ceil(COURSE.t);COURSE.t-=dt;const apres=Math.ceil(COURSE.t);
    if(apres!==avant&&apres>0){decompteMontrer(apres);pop();}
    if(COURSE.t<=0){COURSE.phase='course';COURSE.temps=0;decompteMontrer('GO');try{navigator.vibrate&&navigator.vibrate(60);}catch(x){}}
  }
}
function decompteMontrer(t){
  let el=document.getElementById('tkDec');
  if(!el){el=document.createElement('div');el.id='tkDec';document.body.appendChild(el);}
  el.textContent=t;el.className='';void el.offsetWidth;el.className='va'+(t==='GO'?' go':'');
}
async function arriveeCourse(){
  const E=ESSAI, L=classement(), rang=L.findIndex(x=>x.joueur)+1, temps=COURSE.fin;
  encaisserCombo();
  let el=document.getElementById('tkFin');if(el)el.remove();
  el=document.createElement('div');el.id='tkFin';
  const ligne=(x,i)=>'<div class="l'+(x.joueur?' moi':'')+'"><b>'+(i+1)+'</b><span>'+(x.joueur?'Toi · '+E.nom:x.nom)+'</span></div>';
  el.innerHTML='<div class="c"><small>ARRIVÉE · '+COURSE.tours+' TOURS</small><div class="r">'+rang+'<sup>'+(rang===1?'er':'e')+'</sup></div>'+
    '<div class="t">'+fmtTour(temps)+' · drift '+(E.score||0).toLocaleString('fr-FR')+' pts</div>'+
    '<div class="cl">'+L.map(ligne).join('')+'</div><div class="g" id="tkGain">Le comptoir calcule ta prime…</div>'+
    '<div class="b"><button id="tkRejouer">Rejouer</button><button id="tkQuitter2">Quitter</button></div></div>';
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));
  document.getElementById('tkRejouer').onclick=()=>{el.remove();const g=E.garage, m=E.modele;E.actifAvant=true;debutEssai(m,g,null,'course');E.actifAvant=false;};
  document.getElementById('tkQuitter2').onclick=()=>{el.remove();finEssai();};
  if(!E.garage){document.getElementById('tkGain').textContent='Course d’essai : pas de prime.';return;}
  const r=await rpcTK('tokyo_course_fin',{p_voiture:E.garage.modele,p_rang:rang,p_temps_ms:Math.round(temps*1000)});
  const gz=document.getElementById('tkGain');if(!gz)return;
  if(!r||r.erreur){gz.textContent=(r&&r.erreur)||'La prime n’a pas pu être versée.';return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();sauver();}catch(x){}}
  gz.innerHTML=r.gain>0?'<b>+'+enEuros(r.gain)+'</b> de prime'+(r.plafond?' · plafond du jour atteint':''):'Plafond du jour atteint : 30 000 € de primes par jour.';
}

/* ================= LE TABLEAU DE BORD ET LES COMMANDES TACTILES ================= */
function popDrift(txt,col){
  const el=document.getElementById('tkPop');if(!el)return;
  el.textContent=txt;el.style.color=col||'#fff';el.classList.remove('va');void el.offsetWidth;el.classList.add('va');
}
function cssVolant(){
  if(document.getElementById('cssVolant'))return;
  const st=document.createElement('style');st.id='cssVolant';st.textContent=
`body.tk-volant #barre,body.tk-volant #haut{display:none!important}
body.tk-volant{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none}
#tkHud{position:fixed;left:12px;top:calc(env(safe-area-inset-top,0px) + 58px);z-index:21;pointer-events:none;padding:7px 11px 8px;border-radius:14px;
 background:rgba(10,8,18,.7);border:1px solid rgba(255,255,255,.1);font-family:-apple-system,sans-serif;color:#fff;min-width:112px}
#tkHud .v{font:900 italic 30px/1 -apple-system,sans-serif;letter-spacing:-1px}
#tkHud .u{font:700 9px ui-monospace,monospace;letter-spacing:2px;color:rgba(255,255,255,.5);margin-left:4px}
#tkHud .r{display:flex;align-items:center;gap:8px;margin-top:5px}
#tkHud .gr{width:22px;height:22px;border-radius:7px;background:#ff4fb0;display:grid;place-items:center;font:900 13px -apple-system,sans-serif}
#tkHud .t{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}
#tkHud .t i{display:block;height:100%;width:0;background:linear-gradient(90deg,#5cff8a,#ffd21f 70%,#ff3b3b)}
#tkHud .c{display:flex;gap:4px;margin-top:5px}
#tkHud .c b{flex:1;height:4px;border-radius:3px;background:rgba(255,255,255,.12)}
#tkHud .p{display:block;font:800 12px -apple-system,sans-serif;color:#ffd98a;margin-top:4px;min-height:15px}
#tkHaut{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:22;display:flex;align-items:flex-start;justify-content:space-between;padding:0 12px;pointer-events:none}
#tkHaut button{pointer-events:auto;height:36px;padding:0 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(10,8,18,.72);color:#fff;font:700 12px -apple-system,sans-serif}
#tkInfo{pointer-events:none;text-align:center;padding:6px 12px;border-radius:14px;background:rgba(10,8,18,.72);border:1px solid rgba(255,79,176,.4);color:#fff;font:700 12px ui-monospace,monospace;white-space:nowrap}
#tkInfo b{font:900 italic 20px -apple-system,sans-serif;color:#ff8ac8;margin-right:6px}
#tkInfo small{display:block;font:700 9px ui-monospace,monospace;letter-spacing:1.5px;color:rgba(255,255,255,.55);margin-top:1px}
#tkCarte{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 54px);z-index:21;width:56px;height:140px;border-radius:14px;background:rgba(10,8,18,.6);border:1px solid rgba(255,255,255,.1);pointer-events:none}
#tkPop{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 150px);z-index:21;pointer-events:none;text-align:center;
 font:900 italic 26px -apple-system,sans-serif;text-shadow:0 2px 10px rgba(0,0,0,.6);opacity:0}
#tkPop.va{animation:tkPop 1.1s ease-out}
@keyframes tkPop{0%{opacity:0;transform:scale(.6)}15%{opacity:1;transform:scale(1.15)}30%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-14px)}}
#tkDec{position:fixed;left:0;right:0;top:34%;z-index:23;text-align:center;pointer-events:none;font:900 italic 96px/1 -apple-system,sans-serif;color:#fff;text-shadow:0 6px 30px rgba(255,79,176,.6);opacity:0}
#tkDec.va{animation:tkDec .9s ease-out}#tkDec.go{color:#5cff8a;text-shadow:0 6px 30px rgba(92,255,138,.6)}
@keyframes tkDec{0%{opacity:0;transform:scale(1.8)}20%{opacity:1;transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:scale(.8)}}
#tkPad{position:fixed;left:0;right:0;bottom:0;z-index:21;pointer-events:none;height:calc(env(safe-area-inset-bottom,0px) + 190px)}
#tkPad button{position:absolute;pointer-events:auto;border:0;border-radius:20px;color:#fff;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;
 -webkit-tap-highlight-color:transparent;font:900 13px -apple-system,sans-serif;letter-spacing:1px;background:rgba(14,10,24,.62);box-shadow:inset 0 0 0 2px rgba(255,255,255,.16);
 backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:transform .06s,background .06s}
#tkPad button.on{transform:scale(.93);background:rgba(255,79,176,.42);box-shadow:inset 0 0 0 2px #ff8ac8}
#tkPad .dir{width:clamp(62px,18vw,80px);height:clamp(62px,18vw,80px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);font-size:26px}
#tkPad .dir.g{left:12px}#tkPad .dir.d{left:calc(12px + clamp(62px,18vw,80px) + 10px)}
#tkPad .gaz{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:clamp(66px,19vw,82px);height:clamp(104px,30vw,124px);background:rgba(20,60,32,.6);box-shadow:inset 0 0 0 2px rgba(92,255,138,.45)}
#tkPad .gaz.on{background:rgba(92,255,138,.42);box-shadow:inset 0 0 0 2px #5cff8a}
#tkPad .frein{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:clamp(58px,16vw,70px);height:clamp(58px,16vw,70px);font-size:11px}
#tkPad .drift{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(58px,16vw,70px) + 10px);width:clamp(58px,16vw,70px);height:clamp(58px,16vw,70px);border-radius:50%;font-size:11px;box-shadow:inset 0 0 0 3px var(--c,rgba(255,255,255,.2))}
#tkPad .nitro{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(104px,30vw,124px) + 10px);width:clamp(58px,16vw,70px);height:clamp(50px,14vw,58px);border-radius:16px;font-size:11px;
 background:conic-gradient(rgba(63,224,255,.55) var(--p,100%),rgba(14,10,24,.62) 0);box-shadow:inset 0 0 0 2px rgba(127,232,255,.5)}
/* Même en mode joystick, conserver les commandes de secours visibles : sur mobile, le HUD plein écran masque parfois le joystick global. */
#tkPad.joy .dir,#tkPad.joy .gaz{display:block}
#tkPad.joy .frein{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px)}
#tkPad.joy .drift{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(58px,16vw,70px) + 10px)}
#tkPad.joy .nitro{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(104px,30vw,124px) + 10px)}
#tkAide{position:fixed;left:16px;right:16px;top:38%;z-index:22;pointer-events:none;margin:0 auto;max-width:330px;
 padding:12px 14px;border-radius:14px;background:rgba(10,8,18,.88);border:1px solid rgba(255,79,176,.4);color:#fff;font:600 13px/1.45 -apple-system,sans-serif;transition:opacity .6s}
#tkAide b{color:#ff8ac8}
#tkFin{position:fixed;inset:0;z-index:30;display:grid;place-items:center;background:rgba(6,4,12,0);transition:background .4s;padding:20px}
#tkFin.on{background:rgba(6,4,12,.72)}
#tkFin .c{width:100%;max-width:340px;border-radius:22px;background:#160b26;border:1px solid rgba(255,79,176,.45);color:#fff;padding:18px;text-align:center;transform:translateY(20px);opacity:0;transition:all .4s}
#tkFin.on .c{transform:none;opacity:1}
#tkFin small{font:700 10px ui-monospace,monospace;letter-spacing:3px;color:#ff8ac8}
#tkFin .r{font:900 italic 64px/1 -apple-system,sans-serif;margin-top:6px}#tkFin .r sup{font-size:24px}
#tkFin .t{font:700 13px ui-monospace,monospace;color:rgba(255,255,255,.7);margin-top:4px}
#tkFin .cl{margin-top:12px;text-align:left}
#tkFin .l{display:flex;gap:10px;align-items:center;padding:6px 10px;border-radius:10px;font:600 13px -apple-system,sans-serif;color:rgba(255,255,255,.75)}
#tkFin .l b{width:20px;color:#ff8ac8}#tkFin .l.moi{background:rgba(255,79,176,.16);color:#fff}
#tkFin .g{margin-top:12px;font:600 14px -apple-system,sans-serif;color:#ffd98a}#tkFin .g b{font-size:20px;color:#5cff8a}
#tkFin .b{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
#tkFin .b button{height:50px;border-radius:14px;border:0;font:800 15px -apple-system,sans-serif;color:#fff;background:rgba(255,255,255,.1)}
#tkFin .b button:first-child{background:linear-gradient(180deg,#ff3fa4,#d4006f)}`;
  document.head.appendChild(st);
}
function hudMontrer(on){
  for(const i of ['tkHud','tkPad','tkPop','tkAide','tkHaut','tkCarte','tkDec','tkFin']){const x=document.getElementById(i);if(x)x.remove();}
  if(!on)return;
  cssVolant();
  const E=ESSAI;
  const hud=document.createElement('div');hud.id='tkHud';
  hud.innerHTML='<div><span class="v" id="tkV">0</span><span class="u">KM/H</span></div><div class="r"><span class="gr" id="tkG">1</span><span class="t"><i id="tkT"></i></span></div>'+
    '<div class="c"><b id="tkC1"></b><b id="tkC2"></b><b id="tkC3"></b></div><span class="p" id="tkCombo"></span>';
  document.body.appendChild(hud);
  const haut=document.createElement('div');haut.id='tkHaut';
  haut.innerHTML='<button id="tkQuit">✕ Quitter</button><div id="tkInfo"></div><button id="tkMode">'+(MODE_CMD==='boutons'?'🕹 Joystick':'⬅➡ Boutons')+'</button>';
  document.body.appendChild(haut);
  document.getElementById('tkQuit').onclick=()=>finEssai();
  document.getElementById('tkMode').onclick=()=>{MODE_CMD=MODE_CMD==='boutons'?'joystick':'boutons';try{localStorage.setItem('bdl.tk.cmd',MODE_CMD);}catch(x){}
    window.TK_SANS_JOY=(MODE_CMD==='boutons');for(const k in CMDS)CMDS[k]=false;hudMontrer(true);};
  const carte=document.createElement('canvas');carte.id='tkCarte';carte.width=112;carte.height=280;document.body.appendChild(carte);
  const pp=document.createElement('div');pp.id='tkPop';document.body.appendChild(pp);
  /* LE PAVÉ DE COMMANDES */
  const pad=document.createElement('div');pad.id='tkPad';if(MODE_CMD!=='boutons')pad.classList.add('joy');
  const B=[['g','dir g','◀'],['d','dir d','▶'],['gaz','gaz','GAZ'],['frein','frein','FREIN'],['drift','drift','DRIFT']];
  if(E.stats&&E.stats.nitro)B.push(['nitro','nitro','N₂O']);
  const enfonces=new Map();      /* pointerId → commande */
  const maj=()=>{for(const k of ['g','d','gaz','frein','drift'])CMDS[k]=false;for(const k of enfonces.values())if(k!=='nitro')CMDS[k]=true;
    pad.querySelectorAll('button').forEach(b=>b.classList.toggle('on',[...enfonces.values()].includes(b.dataset.k)));};
  for(const [k,cl,txt] of B){
    const b=document.createElement('button');b.className=cl;b.dataset.k=k;b.textContent=txt;b.setAttribute('aria-label',txt);
    b.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();try{b.setPointerCapture(ev.pointerId);}catch(x){}enfonces.set(ev.pointerId,k);if(k==='nitro')CMDS.nitro=true;maj();});
    const lacher=ev=>{if(enfonces.has(ev.pointerId)){enfonces.delete(ev.pointerId);maj();}};
    b.addEventListener('pointerup',lacher);b.addEventListener('pointercancel',lacher);b.addEventListener('lostpointercapture',lacher);
    b.addEventListener('contextmenu',ev=>ev.preventDefault());
    b.addEventListener('touchstart',ev=>ev.preventDefault(),{passive:false});
    pad.appendChild(b);
  }
  document.body.appendChild(pad);
  if(!hudMontrer.global){hudMontrer.global=true;
    addEventListener('blur',()=>{for(const k in CMDS)CMDS[k]=false;});
    addEventListener('keydown',ev=>{if(!ESSAI.actif)return;const m={ArrowLeft:'g',ArrowRight:'d',ArrowUp:'gaz',ArrowDown:'frein',' ':'drift',Shift:'nitro'}[ev.key];
      if(m){CMDS[m]=true;if(MODE_CMD==='boutons')ev.preventDefault();}});
    addEventListener('keyup',ev=>{const m={ArrowLeft:'g',ArrowRight:'d',ArrowUp:'gaz',ArrowDown:'frein',' ':'drift',Shift:'nitro'}[ev.key];if(m)CMDS[m]=false;});}
  /* la première fois : comment on conduit */
  let vu=false;try{vu=localStorage.getItem('bdl.tk.aide3')==='1';}catch(x){}
  if(!vu){const a=document.createElement('div');a.id='tkAide';
    a.innerHTML=MODE_CMD==='boutons'?'<b>◀ ▶</b> pour tourner, <b>GAZ</b> et <b>FREIN</b> à droite.<br><b>DRIFT</b> : maintiens-le en tournant, la voiture glisse et se charge (bleu → orange → rose).<br>Finis le drift <b>sans toucher</b> : turbo et points !'
      :'<b>Pouce gauche</b> : la direction, la voiture accélère toute seule.<br><b>DRIFT</b> : maintiens-le en tournant.<br>Finis le drift <b>sans toucher</b> : turbo et points !';
    document.body.appendChild(a);setTimeout(()=>{a.style.opacity='0';setTimeout(()=>a.remove(),700);},6500);try{localStorage.setItem('bdl.tk.aide3','1');}catch(x){}}
  (function boucle(){
    if(!document.getElementById('tkHud')||!ESSAI.actif)return;
    const E2=ESSAI, niv=niveauCharge();
    document.getElementById('tkV').textContent=Math.round((E2.vitesse||0)*KMH);
    document.getElementById('tkG').textContent=(E2.vx*Math.cos(E2.ang)+E2.vy*Math.sin(E2.ang))<-3?'R':(E2.rapport+1);
    document.getElementById('tkT').style.width=Math.min(100,((SON_TK.rpm||900)-800)/62)+'%';
    for(let i=1;i<=3;i++)document.getElementById('tkC'+i).style.background=niv>=i?COUL_NIV[i]:'rgba(255,255,255,.12)';
    document.getElementById('tkCombo').textContent=E2.points>0?((E2.combo>1?'×'+E2.combo+' · ':'')+Math.round(E2.points).toLocaleString('fr-FR')+' pts'):(E2.score?'DRIFT '+E2.score.toLocaleString('fr-FR'):'');
    const dr=pad.querySelector('.drift');if(dr)dr.style.setProperty('--c',niv>0?COUL_NIV[niv]:(E2.boostT>0?'#5cff8a':'rgba(255,255,255,.2)'));
    const ni=pad.querySelector('.nitro');if(ni)ni.style.setProperty('--p',Math.round((E2.nitroT>0?0:E2.nitroCharge||0)*100)+'%');
    infoHaut();dessinerCarte();
    requestAnimationFrame(boucle);})();
}
/* le bandeau du haut : en course, la place et le tour ; en libre, le chrono */
function infoHaut(){
  const el=document.getElementById('tkInfo');if(!el)return;const E=ESSAI;
  if(COURSE.actif){
    const L=classement(), rang=L.findIndex(x=>x.joueur)+1;
    const tourAff=Math.min(COURSE.tours,(E.tour==null?0:E.tours)+1);
    el.innerHTML='<b>P'+rang+'</b>/'+L.length+' · TOUR '+(COURSE.phase==='decompte'?1:tourAff)+'/'+COURSE.tours+'<small>'+fmtTour(COURSE.phase==='decompte'?0:(COURSE.fin!=null?COURSE.fin:COURSE.temps))+'</small>';
  }else{
    const rec=chronoRecords()[E.nom];
    el.innerHTML='<b>'+(E.tour!=null?'T'+(E.tours+1):'—')+'</b>'+fmtTour(E.tour)+'<small>★ '+fmtTour(rec)+(E.dernier!=null?' · DERNIER '+fmtTour(E.dernier):'')+(E.limite!=null?' · ESSAI '+Math.floor(E.limite/60)+':'+String(Math.floor(E.limite%60)).padStart(2,'0'):'')+'</small>';
  }
}
/* la mini-carte : le tracé, et un point par voiture */
function dessinerCarte(){
  const cv=document.getElementById('tkCarte');if(!cv)return;
  const now=performance.now();if(dessinerCarte.t&&now-dessinerCarte.t<90)return;dessinerCarte.t=now;
  const g=cv.getContext('2d'), Wc=cv.width, Hc=cv.height, k=Math.min((Wc-16)/MONDE_L,(Hc-16)/(MONDE_H-200)), ox=8, oy=8-200*k;
  if(!dessinerCarte.fond){const f=document.createElement('canvas');f.width=Wc;f.height=Hc;const fg=f.getContext('2d');
    fg.strokeStyle='rgba(255,255,255,.32)';fg.lineWidth=7;fg.lineJoin='round';fg.beginPath();
    PISTE.pts.forEach((p,i)=>{const X=ox+p.x*k, Y=oy+p.y*k;i?fg.lineTo(X,Y):fg.moveTo(X,Y);});fg.closePath();fg.stroke();
    fg.fillStyle='#fff';fg.fillRect(ox+CIRCUIT.ligne*k-2,oy+CIRCUIT.y*k-7,4,14);dessinerCarte.fond=f;}
  g.clearRect(0,0,Wc,Hc);g.drawImage(dessinerCarte.fond,0,0);
  if(COURSE.actif)for(const c of COURSE.voitures){g.fillStyle=c.type==='trafic'?'rgba(200,200,210,.6)':'#7fe8ff';g.beginPath();g.arc(ox+c.x*k,oy+c.y*k,c.type==='trafic'?4:6,0,7);g.fill();}
  const E=ESSAI;g.fillStyle='#ff4fb0';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(ox+E.x*k,oy+E.y*k,8,0,7);g.fill();g.stroke();
}

/* ================= LE CHRONO DU MODE LIBRE ================= */
function chronoRecords(){try{return JSON.parse(localStorage.getItem('bdl.tk.records2')||'{}')||{};}catch(x){return {};}}
function fmtTour(t){if(t==null)return '–:––.––';const m=Math.floor(t/60), sec=t-m*60;return m+':'+(sec<10?'0':'')+sec.toFixed(2);}
function chronoPas(x0,y0,x1,y1,dt){
  const E=ESSAI, P=PISTE;
  if(E.tour!=null)E.tour+=dt;
  /* trois points de passage, au quart, à la moitié et aux trois quarts du tour */
  const rel=(((E.sPiste||0)-P.ligneS)%P.L+P.L)%P.L;
  if(E.cp<3&&rel>(E.cp+1)*P.L/4&&rel<(E.cp+1)*P.L/4+900){E.cp++;}
  const surLigne=y1>TK.route[0]&&y1<TK.route[1]&&x0<CIRCUIT.ligne&&x1>=CIRCUIT.ligne;
  if(surLigne){
    if(E.tour!=null&&E.cp>=3){
      const t=E.tour;E.dernier=t;E.tours++;
      const R=chronoRecords();
      if(R[E.nom]==null||t<R[E.nom]){R[E.nom]=t;try{localStorage.setItem('bdl.tk.records2',JSON.stringify(R));}catch(x){}
        popDrift('RECORD · '+fmtTour(t),'#ffd98a');}
      else popDrift(fmtTour(t),'#9ae8ff');
    }
    if(E.tour==null||E.cp>=3){E.tour=0;E.cp=0;}
  }
}

/* ================= LE DESSIN ================= */
function dessinerUneVoiture(ctx,camX,camY,x,y,ang,toile){
  ctx.save();ctx.translate(Math.round(x-camX),Math.round(y-camY));
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(1,3,30,13,ang,0,7);ctx.fill();
  ctx.rotate(ang);ctx.imageSmoothingEnabled=false;ctx.drawImage(toile,-34,-16);ctx.restore();
}
function dessinerEssai(ctx,camX,camY){
  const E=ESSAI;
  if(E.trainee&&E.trainee.length>2){const c=(E.tuning&&E.tuning.neon)||'#ff4fb0';ctx.save();ctx.lineCap='round';
    for(let k=1;k<E.trainee.length;k++){const [a,b]=E.trainee[k-1],[x2,y2]=E.trainee[k];ctx.strokeStyle=c;ctx.globalAlpha=k/E.trainee.length*0.7;ctx.lineWidth=2+k/E.trainee.length*3;
      ctx.beginPath();ctx.moveTo(a-camX,b-camY);ctx.lineTo(x2-camX,y2-camY);ctx.stroke();}ctx.restore();}
  ctx.save();ctx.fillStyle='rgba(12,10,16,.55)';
  for(const [x,y] of E.traces)ctx.fillRect(Math.round(x-camX)-1,Math.round(y-camY)-1,2,2);ctx.restore();
  /* les autres voitures */
  if(COURSE.actif)for(const c of COURSE.voitures){ctx.globalAlpha=c.fini!=null?0.35:1;dessinerUneVoiture(ctx,camX,camY,c.x,c.y,c.ang,c.toile);}
  ctx.globalAlpha=1;
  /* la mienne : halo néon, flammes, nitro */
  ctx.save();
  ctx.translate(Math.round(E.x-camX),Math.round(E.y-camY));
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,3,32,14,E.ang,0,7);ctx.fill();
  ctx.rotate(E.ang);
  if(E.nitroT>0){const r=ctx.createRadialGradient(-30,0,2,-30,0,40);r.addColorStop(0,'rgba(127,232,255,.55)');r.addColorStop(1,'rgba(127,232,255,0)');ctx.fillStyle=r;ctx.fillRect(-72,-40,84,80);}
  if(E.tuning&&E.tuning.neon){
    if(!E.halo){const h=document.createElement('canvas');h.width=110;h.height=60;const hg=h.getContext('2d');
      const r=hg.createRadialGradient(55,30,4,55,30,52);r.addColorStop(0,E.tuning.neon);r.addColorStop(0.45,E.tuning.neon+'88');r.addColorStop(1,E.tuning.neon+'00');
      hg.fillStyle=r;hg.save();hg.translate(55,30);hg.scale(1,0.52);hg.translate(-55,-30);hg.beginPath();hg.arc(55,30,52,0,7);hg.fill();hg.restore();E.halo=h;}
    const fx=E.tuning.neonfx, T=performance.now()/1000;
    if(fx==='arcenciel'){ctx.save();ctx.filter='hue-rotate('+Math.round(T*120%360)+'deg)';ctx.globalAlpha=0.8;ctx.drawImage(E.halo,-55,-30);ctx.restore();}
    else{ctx.globalAlpha=fx==='pulse'?0.35+0.5*(0.5+0.5*Math.sin(T*6)):0.75;ctx.drawImage(E.halo,-55,-30);ctx.globalAlpha=1;}}
  if(E.flamme>0){const L2=8+Math.random()*(E.nitroT>0?18:10);for(const s2 of [-5,5]){ctx.fillStyle=E.nitroT>0?'rgba(127,232,255,.9)':'rgba(255,160,40,.9)';ctx.beginPath();ctx.moveTo(-34,s2-2);ctx.lineTo(-34-L2,s2);ctx.lineTo(-34,s2+2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(-36,s2-1,3,2);}}
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(E.toile,-34,-16);
  ctx.restore();
  ctx.save();
  for(const p of E.etinc){ctx.globalAlpha=Math.min(1,p.vie*4);ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x-camX)-1,Math.round(p.y-camY)-1,2,2);}
  ctx.globalAlpha=1;
  /* LES TRAÎNÉES DE VITESSE : légères à haute vitesse, franches au turbo et à la nitro */
  const vr=(E.vitesse||0)/Math.max(1,E.vmaxVue||186), fort=E.boostT>0||E.nitroT>0;
  if(fort||vr>0.78){const a=Math.atan2(E.vy,E.vx), c=Math.cos(a), s2=Math.sin(a), n=fort?10:4;
    ctx.strokeStyle=E.nitroT>0?'rgba(127,232,255,.5)':(fort?'rgba(255,255,255,.42)':'rgba(255,255,255,.18)');ctx.lineWidth=1;
    for(let i=0;i<n;i++){const o=(Math.random()-0.5)*100, b=36+Math.random()*70, L=16+Math.random()*30*(fort?1.4:1);
      const x0=E.x-camX-c*b-s2*o, y0=E.y-camY-s2*b+c*o;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0-c*L,y0-s2*L);ctx.stroke();}}
  for(const f of E.fumee){
    if(f.c){const n=[1,3,5].map(k=>parseInt(f.c.substr(k,2),16));ctx.fillStyle='rgba('+n.join(',')+','+(f.vie*0.5)+')';}
    else ctx.fillStyle='rgba(220,220,230,'+(f.vie*0.4)+')';
    ctx.beginPath();ctx.arc(f.x-camX,f.y-camY,f.r,0,7);ctx.fill();}
  ctx.restore();
}
;({TK,lumieresTokyo,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo,ESSAI,debutEssai,finEssai,majEssai,dessinerEssai,COURSE,CMDS,PISTE,pointPiste,projeter,statsVoiture})
