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
  for(const b of BATIS_TK)if(x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1)return true;   /* les immeubles et la tribune du circuit */
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
  const P=PISTE_TK, ep=CIRCUIT.ep, PT=P.pts;
  const chemin=(gg)=>{gg.beginPath();gg.moveTo(PT[0].x,PT[0].y);for(let i=1;i<PT.length;i++)gg.lineTo(PT[i].x,PT[i].y);gg.closePath();};
  /* le dehors : un pavé tout autour */
  g.fillStyle='#9894a8';g.fillRect(0,TK.route[1],W,H-TK.route[1]);
  for(let yy=TK.route[1];yy<H;yy+=12)for(let xx=((yy/12)%2?0:10);xx<W;xx+=20){g.fillStyle=A(xx*0.37+yy*1.3)>.5?'#a29eb2':'#938fa4';g.fillRect(xx,yy,19,11);}
  /* le paddock, au milieu du serpentin : herbe, asphalte clair et places */
  dessinerZoneSol(g,A);
  /* LA PISTE, en simple : la toile fine (construireHD) la redessine juste après, en beau, et la recopie ici */
  g.lineJoin='round';g.strokeStyle='#55a050';g.lineWidth=ep+60;chemin(g);g.stroke();
  g.strokeStyle='#3d3c46';g.lineWidth=ep;chemin(g);g.stroke();
  g.fillStyle='#3d3c46';g.fillRect(0,TK.route[0],CIRCUIT.depart+380,TK.route[1]-TK.route[0]);
  const [l0,l1]=TK.route, LX=CIRCUIT.ligne;
  try{decorerCircuit(g,A);}catch(x){console.warn(x);}
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
  /* LE CIRCUIT EN FIN : construit juste après, puis recopié réduit dans ce sol (la promenade en profite aussi) */
  /* la recopie réduite, par bandes (une par tâche) : pas de gros bloc qui fige le téléphone */
  setTimeout(()=>construireHD(hd=>{g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    const n=12, h=Math.ceil((H-HD_Y0)/n);let k=0;
    const bande=()=>{try{const y=HD_Y0+k*h, hh=Math.min(h,H-y);if(hh>0)g.drawImage(hd,0,(y-HD_Y0)*HD_K,hd.width,hh*HD_K,0,y,W,hh);}catch(x){}
      if(++k<n)setTimeout(bande,16);else{try{videCache();}catch(x){}}};
    setTimeout(bande,16);}),400);
  return c;
}

/* LES LAMPADAIRES : ceux du port (même mât, même vacillement), allumés au
   crépuscule par le cycle du jeu. Le long du trottoir des façades, autour du
   circuit, au paddock et au métro. Ils ne bloquent rien. */
const LAMPES_TK=[[198,232],[390,232],[545,232],[700,232],[855,232],
  [330,380],[670,380],[330,1120],[670,1120],
  [20,480],[136,356]];
/* et le long de la piste, des deux côtés, toutes les 260 unités : jamais sur une autre portion de piste */
function lampesDuCircuit(){
  const L=[], P=PISTE_TK, ep=CIRCUIT.ep;
  for(let s=130;s<P.L;s+=260){const p=pointPiste(s,PISTE_TK);
    for(const sd of [-1,1]){const o=ep/2+20, x=p.x-Math.sin(p.ang)*o*sd, y=p.y+Math.cos(p.ang)*o*sd;
      if(x<14||x>MONDE_L-14||y<TK.route[1]+20||y>MONDE_H-14)continue;
      if(projeter(x,y,null,PISTE_TK).d<ep/2+14)continue;
      if(x>320&&x<680&&y>370&&y<1130)continue;
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
const VITESSE_K=1.5;
/* CHAQUE VOITURE A SON CARACTÈRE. masse : lourde = plus lente à lancer et à faire tourner ;
   turbo : 0 = atmosphérique (la poussée monte avec les tours), sinon la taille du turbo —
   gros turbo = temps de réponse, puis coup de pied quand la pression arrive. */
const FICHE_BASE={vmax:186,acc:152,frein:330,grip:8.8,dir:3.0,stab:1,glisse:2.5,maitrise:1,tenue:1,trans:'P',wf:0.5,masse:1,turbo:0};
const FICHES={
  Toyota:     {vmax:195,acc:162,grip:8.4, dir:3.0, stab:1.0, glisse:2.3,maitrise:1.15,trans:'P',wf:0.53,masse:1.05,turbo:1.0},  /* Supra : 6 cylindres turbo, propulsion, joueuse */
  BMW:        {vmax:180,acc:140,grip:9.4, dir:3.35,stab:1.05,glisse:2.4,maitrise:1.15,trans:'P',wf:0.51,masse:0.9, turbo:0},    /* M3 : légère, vive, équilibrée — l'école */
  Lamborghini:{vmax:218,acc:200,grip:10.8,dir:2.95,stab:1.15,glisse:3.0,maitrise:0.9, trans:'4',wf:0.43,masse:1.1, turbo:0},    /* Huracán : V10 qui monte haut, quatre roues motrices, rassurante */
  Porsche:    {vmax:208,acc:178,grip:11.8,dir:3.4, stab:1.2, glisse:2.9,maitrise:0.95,trans:'P',wf:0.39,masse:0.95,turbo:0,frein:390},  /* 911 GT3 RS : précise, freins énormes, l'arrière lourd */
  Nissan:     {vmax:210,acc:215,grip:11.4,dir:2.75,stab:1.25,glisse:3.2,maitrise:0.85,trans:'4',wf:0.55,masse:1.25,turbo:0.8},  /* GT-R : fusée au départ, lourde, sous-vireuse */
  Ferrari:    {vmax:222,acc:190,grip:8.2, dir:3.0, stab:0.95,glisse:2.1,maitrise:1.1, trans:'P',wf:0.44,masse:0.85,turbo:1.6}}; /* F40 : légère, gros turbos tardifs, sauvage */
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
  /* L'ÉCHELLE DE VITESSE : la carte est en pixels, et 250 km/h doivent se SENTIR — cinq longueurs de voiture par seconde, pas trois */
  S.vmax*=VITESSE_K;S.acc*=VITESSE_K;S.frein*=VITESSE_K;
  return S;
}
/* les notes du showroom et de l'atelier, sur 10, lues dans la même fiche */
function notesDe(marque,t){
  const S=statsVoiture(marque,t), r=x=>Math.max(1,Math.min(10,Math.round(x*10)/10));
  return {vit:r(S.vmax/VITESSE_K/27.6),acc:r(S.acc/VITESSE_K/22.8),tenue:r(S.grip/1.5),drift:r(4.6+(S.maitrise-1)*9+(3.2-S.glisse)*1.6+(S.tenue-1)*2)};
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
    re:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/></svg>',
    ca:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M14 10h4M14 14h4M6 16c1-2 5-2 6 0"/></svg>'};
  /* LE TUNING EST RETIRÉ DU CONCESSIONNAIRE : trois onglets. Les numéros restent ceux d'avant (0, 1, 3). */
  const NAV=[['Showroom',IC.sh,0],['Garage',IC.ga,1],['Carrière',IC.ca,4],['Records',IC.re,3]];
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
    if($('ccCourse'))$('ccCourse').onclick=()=>{const mien=garageDuJoueur().find(x=>x.modele===v.id);choisirCourse(v,mien);};
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
  /* ---------- LA CARRIÈRE : les licences, leurs épreuves, les médailles ---------- */
  const carriereOnglet=()=>{
    $('ccSur').textContent='東京 · CARRIÈRE';$('ccTitre').textContent='Carrière';
    const c=carriere();
    let h='<p style="margin-top:10px;color:rgba(255,255,255,.62);font-size:13px;line-height:1.5">Quatre licences, trois épreuves chacune, une voiture prêtée. Toutes en bronze au moins : la licence est à toi, avec sa prime, et ouvre de nouveaux circuits pour tes courses.</p>';
    for(const L of LICENCES){const ouverte=licenceOuverte(L.id), eue=!!c.lic[L.id];
      h+='<div style="margin-top:14px;border-radius:20px;padding:14px;background:'+(ouverte?'rgba(255,255,255,.05)':'rgba(255,255,255,.02)')+';box-shadow:inset 0 0 0 2px '+(eue?L.coul:'rgba(255,255,255,.08)')+';opacity:'+(ouverte?1:0.55)+'">'+
        '<div style="display:flex;align-items:center;gap:12px"><div style="width:46px;height:46px;border-radius:12px;background:'+L.coul+';color:#14121c;display:grid;place-items:center;font:900 24px sans-serif">'+L.id+'</div>'+
        '<div style="flex:1"><b style="font:800 17px sans-serif">'+L.nom+' · '+L.titre+'</b><small style="display:block;color:rgba(255,255,255,.55);font-size:12px">'+(eue?'✓ Obtenue':ouverte?'Prime : '+enEuros(L.prime):'🔒 Obtiens d’abord la licence précédente')+
        (L.id!=='S'?' · ouvre '+Object.values(CIRCUITS).filter(C=>C.licence===L.id).map(C=>C.court).join(', '):'')+'</small></div></div>';
      for(const ep of L.ep){const m=c.med[ep.id]||0, b=c.best[ep.id];
        h+='<div style="display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;border-radius:14px;background:rgba(0,0,0,.22)">'+
          '<div style="width:34px;text-align:center;font-size:22px">'+(m?MED_E[m]:'·')+'</div>'+
          '<div style="flex:1;min-width:0"><b style="font:700 14px sans-serif">'+ep.nom+'</b><small style="display:block;color:rgba(255,255,255,.55);font-size:11.5px;line-height:1.35">'+ep.desc+' '+VOIT_PRET[ep.voiture].marque+' prêtée.'+(b!=null?' Meilleur : '+fmtSeuil(ep,b)+'.':'')+'</small></div>'+
          '<button data-ep="'+ep.id+'" '+(ouverte?'':'disabled')+' style="min-height:42px;padding:0 14px;border-radius:12px;border:0;background:'+(ouverte?'#ff4fb0':'rgba(255,255,255,.1)')+';color:#fff;font:800 13px sans-serif">'+(m?'Refaire':'Passer')+'</button></div>';}
      h+='</div>';}
    $('ccCorps').innerHTML=h;
    $('ccCorps').querySelectorAll('button[data-ep]').forEach(bt=>bt.onclick=()=>{const ep=LICENCES.flatMap(l=>l.ep).find(x=>x.id===bt.dataset.ep);fermerConcessionTokyo();lancerEpreuve(ep);});
    /* les licences déjà validées sur le serveur (si la partie a été jouée ailleurs) */
    rpcTK('tokyo_mes_licences',{}).then(r=>{if(!Array.isArray(r))return;const c2=carriere();let chg=false;for(const id of r)if(!c2.lic[id]){c2.lic[id]=true;chg=true;}if(chg){sauverCarriere(c2);if(onglet===4)rendre();}});
  };
  const records=()=>{
    $('ccSur').textContent='東京 · CIRCUIT';$('ccTitre').textContent='Records';
    const R=chronoRecords();
    const L=vehicules.map(v=>({v,t:R[nom(v)]})).sort((a,b)=>(a.t==null)-(b.t==null)||(a.t||0)-(b.t||0));
    $('ccCorps').innerHTML='<p style="margin-top:12px;color:rgba(255,255,255,.6);font-size:13px;line-height:1.5">Ton meilleur tour du circuit de Tokyo, voiture par voiture. Le chrono part sur la ligne d’arrivée.</p>'+
      L.map(({v,t},k)=>'<div class="ccLigneRec"><img src="'+sprite(v)+'" alt=""><div><b>'+esc(nom(v))+'</b><small>'+(t!=null?(k===0?'🏆 TA PLUS RAPIDE':'MEILLEUR TOUR'):'PAS ENCORE DE TOUR')+'</small></div>'+
        (t!=null?'<i>'+fmtTour(t)+'</i>':'<button data-essai="'+esc(v.id)+'">Essayer</button>')+'</div>').join('');
    $('ccCorps').querySelectorAll('button[data-essai]').forEach(b=>{b.onclick=()=>{fermerConcessionTokyo();debutEssai(modele(b.dataset.essai));};});
    /* LE CLASSEMENT DES COURSES : les dix meilleurs temps de tous les joueurs (3 tours) */
    const bloc=document.createElement('div');bloc.innerHTML=Object.values(CIRCUITS).map(C=>'<h3 style="margin:20px 0 8px;font:800 15px sans-serif;color:#fff">🏁 '+C.nom+' · '+C.tours+' tours</h3><div id="ccClass_'+C.id+'" style="color:rgba(255,255,255,.55);font-size:13px">Chargement…</div>').join('');
    $('ccCorps').appendChild(bloc);
    const bloc2=document.createElement('div');bloc2.innerHTML='<h3 style="margin:20px 0 8px;font:800 15px sans-serif;color:#fff">🌀 Zone de drift · meilleures notes</h3><div id="ccClassZ" style="color:rgba(255,255,255,.55);font-size:13px">Chargement…</div>';
    $('ccCorps').appendChild(bloc2);
    rpcTK('tokyo_classement_drift',{}).then(r=>{const z=$('ccClassZ');if(!z)return;
      const L2=Array.isArray(r)?r:null;
      if(!L2){z.textContent=(r&&r.erreur)||'Classement indisponible.';return;}
      if(!L2.length){z.textContent='Personne n’a encore de note. Lance « Zone de drift » depuis ton garage.';return;}
      z.innerHTML=L2.map((x,i)=>{const m=modele(x.voiture), n=noteZone(x.score||0);return '<div class="ccLigneRec"><b style="width:26px;color:#7fe8ff">'+(i+1)+'</b><div><b>'+esc(x.pseudo||'?')+'</b><small>'+esc(m?nom(m):(x.voiture||''))+'</small></div><i style="color:'+n[2]+'">'+n[1]+' · '+(x.score||0).toLocaleString('fr-FR')+'</i></div>';}).join('');});
    for(const C of Object.values(CIRCUITS))rpcTK('tokyo_classement_course',{p_circuit:C.cle}).then(r=>{const z=$('ccClass_'+C.id);if(!z)return;
      const L2=Array.isArray(r)?r:null;
      if(!L2){z.textContent=(r&&r.erreur)||'Classement indisponible.';return;}
      if(!L2.length){z.textContent='Personne n’a encore fini de course ici.';return;}
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
          '<button id="ccCourse" style="flex:1.4;min-height:50px;border-radius:14px;border:0;background:rgba(255,79,176,.18);box-shadow:inset 0 0 0 2px #ff4fb0;font:800 14px sans-serif;color:#fff">🏁 Course</button></div>'+
        '<button id="ccZone" style="display:block;width:100%;margin-top:8px;min-height:50px;border-radius:14px;border:0;background:rgba(127,232,255,.14);box-shadow:inset 0 0 0 2px #7fe8ff;font:800 14px sans-serif;color:#fff">🌀 Zone de drift · 60 s notées</button>'+
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
      $('ccCourse').onclick=()=>choisirCourse(modele(v.modele)||{marque:'Toyota',modele:''},v);
      $('ccZone').onclick=()=>{fermerConcessionTokyo();debutEssai(modele(v.modele)||{marque:'Toyota',modele:''},v,null,'drift');};
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
  const rendre=()=>{nav();$('ccDefile').classList.remove('atelier');$('ccDefile').classList.toggle('fixe',onglet===0);(onglet===4?carriereOnglet:onglet===3?records:onglet===2?tuning:onglet===1?garage:showroom)();$('ccDefile').scrollTop=0;};
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
const PISTE_TK=(function(){
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
  return {L,N,pts,seg,ligneS:CIRCUIT.ligne-CIRCUIT.depart,ferme:Math.hypot(x-CIRCUIT.depart,y-CIRCUIT.y),bornes:[0,200,MONDE_L,MONDE_H]};
})();
let PISTE=PISTE_TK;
/* LA TORTUE : un tracé fait de droites et d'arcs, échantillonné tous les 5 points */
function echantillonner(seg,extra){
  let L=0;for(const s of seg){s.s0=L;L+=s.L;}
  const N=Math.round(L/5), pts=[];let j=0;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<N;i++){
    const s=i/N*L;while(j<seg.length-1&&s>=seg[j+1].s0)j++;
    const g=seg[j], u=s-g.s0;let px,py,ang,k;
    if(g.t==='d'){px=g.x0+Math.cos(g.h)*u;py=g.y0+Math.sin(g.h)*u;ang=g.h;k=0;}
    else{const f=g.f0+g.s*u/g.r;px=g.cx+Math.cos(f)*g.r;py=g.cy+Math.sin(f)*g.r;ang=g.h0+g.s*u/g.r;k=1/g.r;}
    pts.push({s,x:px,y:py,ang,k,sg:g.t==='a'?g.s:0});
    x0=Math.min(x0,px);y0=Math.min(y0,py);x1=Math.max(x1,px);y1=Math.max(y1,py);
  }
  return Object.assign({L,N,pts,seg,bornes:[x0,y0,x1,y1]},extra||{});
}
function tortue(x,y,h){
  const seg=[], T={x,y,h};
  T.D=L=>{if(L<=0.01)return;seg.push({t:'d',x0:T.x,y0:T.y,h:T.h,L});T.x+=Math.cos(T.h)*L;T.y+=Math.sin(T.h)*L;};
  T.A=(r,deg)=>{const th=deg*Math.PI/180, s=Math.sign(th), cx=T.x-s*Math.sin(T.h)*r, cy=T.y+s*Math.cos(T.h)*r;
    seg.push({t:'a',cx,cy,r,s,f0:Math.atan2(T.y-cy,T.x-cx),h0:T.h,L:r*Math.abs(th)});
    const f=Math.atan2(T.y-cy,T.x-cx)+th;T.x=cx+Math.cos(f)*r;T.y=cy+Math.sin(f)*r;T.h+=th;};
  T.seg=seg;return T;
}
/* un tracé fermé à partir d'un polygone : chaque sommet est arrondi par un arc de son rayon,
   les droites se calculent toutes seules — la boucle se referme forcément */
function tracerPolygone(V,extra){
  const n=V.length, ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
  const tour=[];for(let i=0;i<n;i++){const a=V[(i-1+n)%n],b=V[i],c=V[(i+1)%n];let th=ang(b,c)-ang(a,b);while(th>Math.PI)th-=2*Math.PI;while(th<-Math.PI)th+=2*Math.PI;
    tour.push({th,t:b[2]*Math.tan(Math.abs(th)/2)});}
  const m=[(V[0][0]+V[1][0])/2,(V[0][1]+V[1][1])/2];
  const T=tortue(m[0],m[1],ang(V[0],V[1]));
  for(let k=1;k<=n;k++){const i=k%n, prev=(k-1)%n, a=V[prev], b=V[i];
    const e=Math.hypot(b[0]-a[0],b[1]-a[1]);
    T.D((k===1?e/2:e-tour[prev].t)-tour[i].t);
    T.A(b[2],tour[i].th*180/Math.PI);
    if(k===n){/* retour au milieu du premier côté */const e0=Math.hypot(V[1][0]-V[0][0],V[1][1]-V[0][1]);T.D(e0/2-tour[0].t);}}
  return echantillonner(T.seg,Object.assign({ferme:Math.hypot(T.x-m[0],T.y-m[1])},extra));
}

function pointPiste(s,P0){const P=P0||PISTE;s=((s%P.L)+P.L)%P.L;const f=s/P.L*P.N, i=Math.floor(f)%P.N, j=(i+1)%P.N, u=f-Math.floor(f);
  const a=P.pts[i], b=P.pts[j];let da=b.ang-a.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,ang:a.ang+da*u,k:Math.max(a.k,b.k)};}
/* où en est-on sur la piste : le point le plus proche, cherché autour du précédent */
function projeter(x,y,indice,P0){
  const P=P0||PISTE;let best=indice==null?0:indice, bd=1e9;
  const tous=indice==null, de=tous?0:indice-40, a=tous?P.N:indice+40;
  for(let q=de;q<a;q++){const i=((q%P.N)+P.N)%P.N, p=P.pts[i], d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);if(d<bd){bd=d;best=i;}}
  if(!tous&&bd>140*140)return projeter(x,y,null,P0);   /* trop loin du dernier point : on cherche partout */
  const p=P.pts[best];const lat=-(x-p.x)*Math.sin(p.ang)+(y-p.y)*Math.cos(p.ang);
  return {i:best,s:p.s,lat,d:Math.sqrt(bd)};
}
/* la distance au bord de la piste (0 sur la piste) ; la route du haut est la voie des stands */
function horsPiste(x,y){
  if(!enVille()){const p=projeter(x,y,horsPiste.i);horsPiste.i=p.i;return Math.max(0,p.d-CIR.ep/2);}
  if(x>ZD.x0&&x<ZD.x1&&y>ZD.y0&&y<ZD.y1)return 0;
  if(y>TK.route[0]-4&&y<TK.route[1]+4&&x<CIRCUIT.depart+380)return 0;
  const p=projeter(x,y,horsPiste.i);horsPiste.i=p.i;
  return Math.max(0,p.d-CIRCUIT.ep/2);
}
/* ================= LES CIRCUITS =================
   Tokyo Circuit est peint dans la carte de la ville. Les trois autres sont des
   mondes à part, dessinés à la volée autour de la voiture (aucune grande image
   à charger) :
   — LES DOCKS : un circuit de rue nocturne entre les conteneurs du port,
     virages à angle droit, murs tout près — technique et nerveux ;
   — MONT HARUNA : une route de montagne étroite, épingles en lacets entre les
     glissières et les pins, puis de longues courbes rapides — le touge ;
   — WANGAN : l'autoroute de nuit, trois voies, d'immenses courbes à fond,
     du trafic, les lampadaires orange qui défilent — la vitesse pure.
   Chaque tracé est un polygone aux coins arrondis (tracerPolygone) : la boucle
   se referme d'elle-même. ep : largeur de piste ; marge : l'espace avant le mur. */
const echelle=(V,k)=>V.map(([x,y,r])=>[x*k,y*k,r*k]);
const CIRCUITS={
  tokyo:{id:'tokyo',cle:'xl',nom:'Tokyo Circuit',court:'Tokyo',desc:'Le serpentin du quartier : chicane, trois épingles, un S.',style:'tokyo',piste:PISTE_TK,ep:100,trafic:4,tours:3,licence:null},
  docks:{id:'docks',cle:'docks',nom:'Les Docks',court:'Docks',desc:'Circuit de rue entre les conteneurs. Angles droits, murs tout près.',style:'docks',ep:80,marge:16,trafic:0,tours:3,licence:'C',
    V:[[200,200,40],[1200,200,40],[1200,520,35],[900,520,35],[900,720,35],[1250,720,60],[1250,1050,40],[650,1050,35],[650,840,35],[420,840,35],[420,1050,40],[150,1050,40],[150,640,35],[350,640,35],[350,430,35],[150,430,35]]},
  haruna:{id:'haruna',cle:'haruna',nom:'Mont Haruna',court:'Haruna',desc:'Route de montagne : lacets serrés entre les glissières, puis courbes rapides.',style:'touge',ep:72,marge:9,trafic:0,tours:2,licence:'B',
    V:[[300,200,140],[1500,200,220],[1750,520,160],[1450,760,45],[420,760,45],[420,920,45],[1450,920,45],[1450,1080,45],[420,1080,45],[420,1240,45],[1500,1240,160],[1850,1500,220],[1750,1900,260],[1100,2000,300],[500,1850,200],[180,1350,160],[150,600,200]]},
  wangan:{id:'wangan',cle:'wangan',nom:'Wangan',court:'Wangan',desc:'L’autoroute de nuit : trois voies, courbes immenses, trafic.',style:'wangan',ep:150,marge:12,trafic:9,tours:2,licence:'A',
    V:echelle([[300,300,500],[2600,300,650],[2800,1400,550],[2100,1850,800],[900,1750,650],[250,1250,450]],1.4)}};
for(const C of Object.values(CIRCUITS)){if(!C.piste){C.piste=tracerPolygone(C.V,{ligneS:100});}
  C.ligneS=C.piste.ligneS;}
let CIR=CIRCUITS.tokyo;
function choisirCircuit(id){CIR=CIRCUITS[id]||CIRCUITS.tokyo;PISTE=CIR.piste;horsPiste.i=null;try{dessinerCarte.fond=null;}catch(x){}CIR_RENDU.pret=null;}
const enVille=()=>CIR.id==='tokyo';
/* ---------- le décor des circuits à part : calculé une fois par circuit, dessiné à la volée ---------- */
const CIR_RENDU={pret:null,motifs:{},morceaux:null,deco:null};
function preparerRenduCircuit(ctx){
  const C=CIR, P=C.piste.pts, N=P.length, A=i=>alea(i*1.37+0.5);
  /* des paquets de 24 points avec leur boîte : on ne dessine que ceux qui sont à l'écran */
  const morceaux=[];for(let i=0;i<N;i+=24){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const idx=[];
    for(let k=i;k<=Math.min(N,i+24);k++){const p=P[k%N];idx.push(k%N);x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y);}
    morceaux.push({idx,x0,y0,x1,y1});}
  const mk=(T,f)=>{const c=document.createElement('canvas');c.width=c.height=T;f(c.getContext('2d'),T);return ctx.createPattern(c,'repeat');};
  const M={};
  if(C.style==='docks'){
    M.sol=mk(128,(q,T)=>{q.fillStyle='#4b4a53';q.fillRect(0,0,T,T);for(let y=0;y<T;y+=32)for(let x=0;x<T;x+=32){q.fillStyle=A(x+y*3)<0.5?'#504f58':'#46454e';q.fillRect(x+1,y+1,30,30);}
      for(let i=0;i<40;i++){q.fillStyle='rgba(0,0,0,.12)';q.beginPath();q.arc(A(i*3.1)*T,A(i*5.7)*T,1+A(i)*4,0,7);q.fill();}});
  }else if(C.style==='touge'){
    M.sol=mk(96,(q,T)=>{q.fillStyle='#1d3a24';q.fillRect(0,0,T,T);for(let i=0;i<46;i++){const x=A(i*3.3)*T,y=A(i*7.7)*T,r=5+A(i)*7;
      q.fillStyle='rgba(0,0,0,.35)';q.beginPath();q.arc(x+3,y+3,r,0,7);q.fill();q.fillStyle=A(i*2.1)<0.5?'#24502f':'#2c5d36';q.beginPath();q.arc(x,y,r,0,7);q.fill();
      q.fillStyle='#3d7a45';q.beginPath();q.arc(x-r*0.3,y-r*0.3,r*0.45,0,7);q.fill();}});
    M.roche=mk(48,(q,T)=>{q.fillStyle='#6d6a64';q.fillRect(0,0,T,T);for(let i=0;i<30;i++){q.fillStyle=A(i)<0.5?'#7d7a73':'#5a5751';q.fillRect(A(i*2.3)*T,A(i*4.1)*T,3+A(i*5)*8,2+A(i*7)*4);}});
  }else{
    M.sol=mk(160,(q,T)=>{q.fillStyle='#161923';q.fillRect(0,0,T,T);for(let i=0;i<10;i++){const x=Math.floor(A(i*3.3)*T),y=Math.floor(A(i*7.7)*T),w=24+A(i)*40,h=20+A(i*2)*40;
      q.fillStyle='#22263a';q.fillRect(x,y,w,h);q.fillStyle='#2b3048';q.fillRect(x,y,w,2);
      for(let k=0;k<12;k++)if(A(i*13+k)<0.5){q.fillStyle=['#ffd98a','#7fe8ff','#ff8ac8'][k%3];q.fillRect(x+3+A(k+i)*(w-6),y+4+A(k*2+i)*(h-8),1.5,1.5);}}});
  }
  /* le décor posé le long de la piste : conteneurs, pins, lampadaires */
  const deco=[];
  const surPiste=(x,y,m)=>{for(let i=0;i<N;i+=3){const p=P[i];if((p.x-x)**2+(p.y-y)**2<m*m)return true;}return false;};
  if(C.style==='docks'){const cols=['#9a3b2e','#2e5b9a','#2f7a4a','#c7731f','#6b6f7a','#8a2f6b'];
    for(let i=0;i<N;i+=6){const p=P[i];for(const sd of [-1,1]){const o=C.ep/2+C.marge+7, x=p.x-Math.sin(p.ang)*o*sd, y=p.y+Math.cos(p.ang)*o*sd;
      if(surPiste(x,y,C.ep/2+C.marge+2))continue;deco.push({t:'cont',x,y,a:p.ang,c:cols[Math.floor(A(i*sd+3)*cols.length)]});}}
    for(let k=0;k<7;k++){const p=P[Math.floor(A(k*9.1)*N)], sd=A(k)<0.5?-1:1, o=C.ep/2+90, x=p.x-Math.sin(p.ang)*o*sd, y=p.y+Math.cos(p.ang)*o*sd;if(!surPiste(x,y,C.ep/2+60))deco.push({t:'grue',x,y,a:p.ang});}
    for(let i=0;i<N;i+=40){const p=P[i], sd=(i/40)%2?1:-1, o=C.ep/2+C.marge+2;deco.push({t:'lampe',x:p.x-Math.sin(p.ang)*o*sd,y:p.y+Math.cos(p.ang)*o*sd,c:'rgba(255,240,200,§)'});}
  }else if(C.style==='touge'){
    for(let i=0;i<N;i+=5){const p=P[i];for(const sd of [-1,1]){const o=C.ep/2+14+A(i*sd)*16, x=p.x-Math.sin(p.ang)*o*sd, y=p.y+Math.cos(p.ang)*o*sd;
      if(surPiste(x,y,C.ep/2+10))continue;deco.push({t:'pin',x,y,r:6+A(i+sd)*5,v:A(i*3+sd)});}}
    for(let i=0;i<N;i+=90){const p=P[i], sd=(i/90)%2?1:-1, o=C.ep/2+C.marge+3;deco.push({t:'lampe',x:p.x-Math.sin(p.ang)*o*sd,y:p.y+Math.cos(p.ang)*o*sd,c:'rgba(255,214,150,§)'});}
  }else{
    for(let i=0;i<N;i+=24){const p=P[i];for(const sd of [-1,1]){const o=C.ep/2+C.marge+4;deco.push({t:'lampe',x:p.x-Math.sin(p.ang)*o*sd,y:p.y+Math.cos(p.ang)*o*sd,c:'rgba(255,170,70,§)',bras:sd,a:p.ang});}}
  }
  CIR_RENDU.morceaux=morceaux;CIR_RENDU.motifs=M;CIR_RENDU.deco=deco;CIR_RENDU.pret=C.id;
}
function dessinerCircuitVect(ctx,x0,y0,x1,y1,nuit){
  const C=CIR;if(CIR_RENDU.pret!==C.id)preparerRenduCircuit(ctx);
  const P=C.piste.pts, M=CIR_RENDU.motifs, ep=C.ep, m=ep+C.marge*2+60;
  ctx.fillStyle=M.sol;ctx.fillRect(x0,y0,x1-x0,y1-y0);
  const vis=CIR_RENDU.morceaux.filter(b=>b.x1>x0-m&&b.x0<x1+m&&b.y1>y0-m&&b.y0<y1+m);
  const trace=(o,w,st,dash)=>{ctx.strokeStyle=st;ctx.lineWidth=w;ctx.setLineDash(dash||[]);
    for(const b of vis){ctx.beginPath();b.idx.forEach((i,k)=>{const p=P[i];const x=p.x-Math.sin(p.ang)*o, y=p.y+Math.cos(p.ang)*o;k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}ctx.setLineDash([]);};
  ctx.lineJoin='round';ctx.lineCap='round';
  if(C.style==='docks'){
    trace(0,ep+C.marge*2,'#5a5962');trace(0,ep,'#34333c');
    trace(ep/2-4,1.5,'rgba(240,240,248,.85)');trace(-ep/2+4,1.5,'rgba(240,240,248,.85)');
    /* vibreurs aux virages */
    for(const b of vis)for(const i of b.idx){const p=P[i];if(!p.k)continue;const rouge=Math.floor(p.s/8)%2;ctx.fillStyle=rouge?'#d8213a':'#f2f0f6';
      for(const sd of [-1,1]){const o=sd*(ep/2-3);ctx.fillRect(p.x-Math.sin(p.ang)*o-2.5,p.y+Math.cos(p.ang)*o-2.5,5,5);}}
    trace(0,1.2,'rgba(255,210,60,.5)',[10,14]);
  }else if(C.style==='touge'){
    trace(0,ep+C.marge*2+16,M.roche);trace(0,ep+C.marge*2,'#4a4a4f');trace(0,ep,'#38383e');
    trace(ep/2-3,1.4,'rgba(240,240,248,.8)');trace(-ep/2+3,1.4,'rgba(240,240,248,.8)');
    trace(0,1.6,'rgba(255,200,40,.85)',[12,10]);
    /* les glissières */
    for(const sd of [-1,1]){trace(sd*(ep/2+C.marge),2.2,'#c9ccd6');trace(sd*(ep/2+C.marge)+1.2*sd,1,'rgba(0,0,0,.35)');}
  }else{
    trace(0,ep+C.marge*2+10,'#8b8e98');trace(0,ep+C.marge*2,'#41434d');trace(0,ep,'#2e2f37');
    trace(ep/2-5,1.6,'rgba(240,240,248,.85)');trace(-ep/2+5,1.6,'rgba(240,240,248,.85)');
    trace(ep/6,1.3,'rgba(240,240,248,.65)',[14,16]);trace(-ep/6,1.3,'rgba(240,240,248,.65)',[14,16]);
  }
  /* la ligne d'arrivée, en damier */
  {const p=pointPiste(C.ligneS);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.ang);for(let y=-ep/2;y<ep/2;y+=4)for(let k=0;k<3;k++){ctx.fillStyle=(Math.floor((y+ep/2)/4)+k)%2?'#14121c':'#f4f2f6';ctx.fillRect(k*4-6,y,4,4);}ctx.restore();}
  /* le décor visible */
  for(const o of CIR_RENDU.deco){if(o.x<x0-60||o.x>x1+60||o.y<y0-60||o.y>y1+60)continue;
    if(o.t==='cont'){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.a);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-11,-4,24,12);ctx.fillStyle=o.c;ctx.fillRect(-12,-6,24,12);
      ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-12,-6,24,1.5);ctx.fillStyle='rgba(0,0,0,.25)';for(let k=-10;k<12;k+=3)ctx.fillRect(k,-6,0.8,12);ctx.restore();}
    else if(o.t==='grue'){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.a);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-30,-50,64,104);ctx.fillStyle='#e0b020';ctx.fillRect(-34,-54,8,108);ctx.fillRect(26,-54,8,108);ctx.fillRect(-34,-54,68,8);ctx.fillRect(-34,46,68,8);
      ctx.strokeStyle='#a07a10';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-26,-46);ctx.lineTo(26,46);ctx.moveTo(26,-46);ctx.lineTo(-26,46);ctx.stroke();ctx.restore();}
    else if(o.t==='pin'){const r=o.r;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(o.x+3,o.y+3,r,0,7);ctx.fill();
      ctx.fillStyle=o.v<0.5?'#1f4a2a':'#265a32';ctx.beginPath();ctx.arc(o.x,o.y,r,0,7);ctx.fill();ctx.fillStyle='#347a42';ctx.beginPath();ctx.arc(o.x-r*0.25,o.y-r*0.25,r*0.55,0,7);ctx.fill();
      ctx.fillStyle='#4f9a55';ctx.fillRect(o.x-r*0.35,o.y-r*0.35,1.5,1.5);}
    else if(o.t==='lampe'){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(o.x+2,o.y+2,3.5,0,7);ctx.fill();ctx.fillStyle='#3a3c48';ctx.beginPath();ctx.arc(o.x,o.y,3,0,7);ctx.fill();
      ctx.fillStyle=nuit>0.3?'#fff2c8':'#c9ccd8';ctx.beginPath();ctx.arc(o.x,o.y,1.8,0,7);ctx.fill();
      if(nuit>0.05)try{lueurNuit(ctx,o.x,o.y,C.style==='wangan'?70:55,o.c);}catch(x){}}}
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
/* ================= LE SON DES VOITURES =================
   Toujours synthétisé (aucun fichier à charger), mais construit comme un vrai
   moteur : on fabrique UN CYCLE MOTEUR (deux tours de vilebrequin) où chaque
   cylindre envoie son coup d'échappement — six coups pour un 6 cylindres en
   ligne, dix pour le V10 — avec de petites irrégularités, sur six cycles qui
   bouclent. Ce cycle est rejoué à la vitesse du régime : le grondement suit
   les tours/minute avec ses vraies harmoniques. Puis :
   — l'ÉCHAPPEMENT : deux résonances fixes propres à chaque voiture (le grave
     du pot, le rauque ou le hurlement), une saturation qui monte sous les gaz,
     un filtre qui s'ouvre avec la charge ;
   — l'ADMISSION et la mécanique : le même cycle une octave plus haut, dans
     l'aigu, qui ressort à haut régime ;
   — le TURBO : sifflement qui monte avec la pression, souffle, et la soupape
     de décharge (« pschhh ») quand on lâche les gaz ;
   — les PNEUS : crissement (bruit filtré, légèrement modulé) selon la glisse,
     patinage au démarrage ;
   — le VENT et la ROUTE avec la vitesse, le grondement des VIBREURS ;
   — les PÉTARADES au lever de pied (plus fortes avec l'échappement du tuning),
     le claquement au passage des rapports, le rupteur en haut du compte-tours,
     le souffle de la NITRO, le choc des collisions, les bips du départ.
   Un compresseur en sortie évite la saturation. Respecte le réglage « Les sons ». */
const PROFILS_SON={
  Toyota:     {cyl:6, ralenti:850,rouge:7000,f1:140,g1:9, f2:650, g2:5,q2:2,lp:1500,turbo:1,  jit:0.02,rauque:0.25},
  BMW:        {cyl:6, ralenti:900,rouge:8000,f1:180,g1:8, f2:1100,g2:6,q2:3,lp:2200,turbo:0,  jit:0.03,rauque:0.45},
  Lamborghini:{cyl:10,ralenti:950,rouge:8500,f1:220,g1:6, f2:1600,g2:8,q2:3,lp:3000,turbo:0,  jit:0.04,rauque:0.55},
  Porsche:    {cyl:6, ralenti:950,rouge:9000,f1:200,g1:7, f2:2000,g2:9,q2:4,lp:3200,turbo:0,  jit:0.015,rauque:0.7},
  Nissan:     {cyl:6, ralenti:800,rouge:7100,f1:120,g1:8, f2:500, g2:4,q2:2,lp:1200,turbo:1.3,jit:0.02,rauque:0.15},
  Ferrari:    {cyl:8, ralenti:900,rouge:7800,f1:160,g1:10,f2:900, g2:7,q2:2,lp:1900,turbo:0.9,jit:0.05,rauque:0.5}};
const SON_TK={ctx:null,rpm:900};
const R0_SON=3000;
function cycleMoteur(C,P){
  const sr=C.sampleRate, cyc=Math.round(sr*120/R0_SON), nC=6, b=C.createBuffer(1,cyc*nC,sr), d=b.getChannelData(0);
  let graine=P.cyl*7.3+P.f1;const rnd=()=>{graine=(graine*9301+49297)%233280;return graine/233280;};
  for(let c=0;c<nC;c++)for(let k=0;k<P.cyl;k++){
    const t0=Math.round(c*cyc+(k/P.cyl+(rnd()-0.5)*P.jit)*cyc), a=0.8+0.4*rnd();
    const tau=sr*0.0032, fp=95+rnd()*20;
    for(let i=0;i<cyc*0.6;i++){const j=(t0+i)%d.length, t=i/sr;
      d[j]+=a*(Math.exp(-i/tau)*Math.sin(2*Math.PI*fp*t)+P.rauque*Math.exp(-i/(sr*0.0005))*(rnd()*2-1));}}
  let m=0;for(let i=0;i<d.length;i++)m=Math.max(m,Math.abs(d[i]));for(let i=0;i<d.length;i++)d[i]/=m||1;
  return b;
}
function bruitBlanc(C,sec){const b=C.createBuffer(1,Math.round(C.sampleRate*sec),C.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
/* le graphe sonore d'une voiture, dans n'importe quel contexte audio (aussi hors ligne, pour les essais) */
function construireSon(C,marque,tuning){
  const P=Object.assign({},PROFILS_SON[marque]||PROFILS_SON.Toyota);
  tuning=tuning||{};if(tuning.turbo)P.turbo=Math.max(P.turbo,0.7+0.3*tuning.turbo);if(tuning.flammes)P.petarade=1;
  const sortie=C.createDynamicsCompressor();sortie.threshold.value=-14;sortie.ratio.value=4;
  const maitre=C.createGain();maitre.gain.value=0.75;sortie.connect(maitre);maitre.connect(C.destination);
  const cyc=cycleMoteur(C,P);
  /* échappement */
  const ech=C.createBufferSource();ech.buffer=cyc;ech.loop=true;
  const sat=C.createWaveShaper();{const cu=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/1023.5-1;cu[i]=Math.tanh(x*2.2);}sat.curve=cu;}
  const pre=C.createGain();pre.gain.value=0.8;
  const r1=C.createBiquadFilter();r1.type='peaking';r1.frequency.value=P.f1;r1.gain.value=P.g1;r1.Q.value=1.2;
  const r2=C.createBiquadFilter();r2.type='peaking';r2.frequency.value=P.f2;r2.gain.value=P.g2;r2.Q.value=P.q2;
  const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=P.lp;lp.Q.value=0.8;
  const vEch=C.createGain();vEch.gain.value=0;
  ech.connect(pre);pre.connect(sat);sat.connect(r1);r1.connect(r2);r2.connect(lp);lp.connect(vEch);vEch.connect(sortie);
  /* admission et mécanique : le cycle une octave plus haut, dans l'aigu */
  const adm=C.createBufferSource();adm.buffer=cyc;adm.loop=true;
  const hp=C.createBiquadFilter();hp.type='bandpass';hp.frequency.value=2600;hp.Q.value=1.4;
  const vAdm=C.createGain();vAdm.gain.value=0;adm.connect(hp);hp.connect(vAdm);vAdm.connect(sortie);
  /* bruits : turbo, pneus, vent, nitro */
  const nb=bruitBlanc(C,2);
  const src=()=>{const s=C.createBufferSource();s.buffer=nb;s.loop=true;s.loopStart=Math.random();return s;};
  const tSif=C.createOscillator();tSif.type='sine';tSif.frequency.value=2500;const vSif=C.createGain();vSif.gain.value=0;tSif.connect(vSif);vSif.connect(sortie);
  const tSou=src(), tSouF=C.createBiquadFilter();tSouF.type='bandpass';tSouF.frequency.value=3500;tSouF.Q.value=0.8;const vSou=C.createGain();vSou.gain.value=0;tSou.connect(tSouF);tSouF.connect(vSou);vSou.connect(sortie);
  const pn=src(), pnF=C.createBiquadFilter();pnF.type='bandpass';pnF.frequency.value=2100;pnF.Q.value=7;const vPn=C.createGain();vPn.gain.value=0;pn.connect(pnF);pnF.connect(vPn);vPn.connect(sortie);
  const pnT=C.createOscillator();pnT.type='triangle';pnT.frequency.value=1150;const vPnT=C.createGain();vPnT.gain.value=0;pnT.connect(vPnT);vPnT.connect(sortie);
  const vt=src(), vtF=C.createBiquadFilter();vtF.type='lowpass';vtF.frequency.value=500;const vVt=C.createGain();vVt.gain.value=0;vt.connect(vtF);vtF.connect(vVt);vVt.connect(sortie);
  const vib=C.createOscillator();vib.type='square';vib.frequency.value=32;const vVib=C.createGain();vVib.gain.value=0;const vibF=C.createBiquadFilter();vibF.type='lowpass';vibF.frequency.value=180;vib.connect(vibF);vibF.connect(vVib);vVib.connect(sortie);
  const ni=src(), niF=C.createBiquadFilter();niF.type='highpass';niF.frequency.value=4000;const vNi=C.createGain();vNi.gain.value=0;ni.connect(niF);niF.connect(vNi);vNi.connect(sortie);
  for(const n of [ech,adm,tSif,tSou,pn,pnT,vt,vib,ni])n.start();
  return {C,P,sortie,maitre,ech,adm,pre,lp,vEch,vAdm,tSif,vSif,vSou,pnF,vPn,pnT,vPnT,vVt,vVib,vNi,nb,rpm:P.ralenti,boost:0,gazAvant:false,rapAvant:0,coupT:0};
}
/* une mise à jour : l'état du moteur → les paramètres audio, à l'instant t (secondes du contexte) */
function regleSon(S,t,dt,e){
  const P=S.P;
  /* le régime : chaque rapport l'emmène du bas au rupteur ; patinage = régime qui s'envole */
  const fr=Math.max(0,e.vit)/340, rap=Math.max(0,Math.min(5,e.rapport||0));
  const lo=RAPPORTS[rap]||0, hi=RAPPORTS[rap+1]||1.05, p=Math.max(0,Math.min(1,(fr-lo)/(hi-lo)));
  let cible=e.vit<4?(e.gaz?P.ralenti+(P.rouge*0.72-P.ralenti)*Math.min(1,(S.revT=(S.revT||0)+dt)*1.5):(S.revT=0,P.ralenti))
    :(rap===0?P.ralenti+(P.rouge-P.ralenti)*p:P.rouge*(0.55+0.45*p));
  if(e.patine)cible=Math.min(P.rouge,cible*1.25);
  if(!e.gaz&&e.vit>=4)cible=Math.max(P.ralenti*1.2,cible*0.92);
  if(rap!==S.rapAvant){if(rap>S.rapAvant&&e.gaz){S.coupT=0.09;passage(S,t);}S.rapAvant=rap;}
  S.rpm+=(cible-S.rpm)*Math.min(1,(e.gaz?10:6)*dt);
  /* le rupteur : en haut, le régime rebondit */
  let rpm=S.rpm;if(e.gaz&&rpm>P.rouge*0.985)rpm=P.rouge*(0.965+0.035*Math.abs(Math.sin(t*38)));
  const charge=e.gaz?(S.coupT>0?0.25:1):0.18;if(S.coupT>0)S.coupT-=dt;
  const rate=rpm/R0_SON;
  S.ech.playbackRate.setTargetAtTime(rate,t,0.02);S.adm.playbackRate.setTargetAtTime(rate*2,t,0.02);
  S.pre.gain.setTargetAtTime(0.5+charge*1.1,t,0.04);
  S.lp.frequency.setTargetAtTime(P.lp*(0.45+0.55*charge)+rpm*0.25,t,0.05);
  const nr=rpm/P.rouge;
  S.vEch.gain.setTargetAtTime((0.22+0.33*charge)*(0.55+0.45*nr),t,0.05);
  S.vAdm.gain.setTargetAtTime(0.05*charge*nr*nr,t,0.05);
  /* le turbo : la pression monte sous les gaz à régime moyen, retombe sinon ; décharge au lever de pied */
  if(P.turbo){
    const vise=e.gaz?Math.min(1,Math.max(0,(nr-0.35)/0.45)):0;
    S.boost+=(vise-S.boost)*Math.min(1,(e.gaz?1.6:5)*dt);
    S.tSif.frequency.setTargetAtTime(1800+S.boost*5200,t,0.05);
    S.vSif.gain.setTargetAtTime(0.022*P.turbo*S.boost,t,0.05);
    S.vSou.gain.setTargetAtTime(0.05*P.turbo*S.boost*S.boost,t,0.05);
    if(S.gazAvant&&!e.gaz&&S.boost>0.45)souffle(S,t,0.08*P.turbo*S.boost,0.45,'highpass',1800);
  }
  /* les pétarades au lever de pied à haut régime */
  if(S.gazAvant&&!e.gaz&&nr>0.6&&e.vit>40){const n=P.petarade?6:2;for(let k=0;k<n;k++)if(Math.random()<0.8)souffle(S,t+0.05+Math.random()*0.45,(P.petarade?0.35:0.18)*(0.6+Math.random()*0.4),0.05+Math.random()*0.04,'lowpass',700+Math.random()*500);}
  S.gazAvant=e.gaz;
  /* les pneus : crissement selon la glisse, un peu de ton modulé */
  const g=Math.max(0,Math.min(1,(e.glisse-35)/160))*(e.vit>20?1:0);
  S.pnF.frequency.setTargetAtTime(1900+Math.sin(t*9)*250+g*300,t,0.03);
  S.vPn.gain.setTargetAtTime(0.22*g,t,0.04);
  S.pnT.frequency.setTargetAtTime(1050+Math.sin(t*13)*60+g*120,t,0.03);S.vPnT.gain.setTargetAtTime(0.012*g,t,0.05);
  /* vent, route, vibreurs, nitro */
  const vv=Math.min(1,e.vit/340);
  S.vVt.gain.setTargetAtTime(0.10*vv*vv,t,0.1);
  S.vVib.gain.setTargetAtTime(e.vibreur?0.12:0,t,0.02);
  S.vNi.gain.setTargetAtTime(e.nitro?0.06:0,t,0.08);
}
/* un souffle bref : décharge du turbo, pétarade, choc */
function souffle(S,t,vol,dur,type,f){try{const C=S.C, s=C.createBufferSource();s.buffer=S.nb;const fl=C.createBiquadFilter();fl.type=type;fl.frequency.value=f;
  const gg=C.createGain();gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(vol,t+0.005);gg.gain.exponentialRampToValueAtTime(0.0008,t+dur);
  s.connect(fl);fl.connect(gg);gg.connect(S.sortie);s.start(t,Math.random()*1.5,dur+0.05);}catch(x){}}
function passage(S,t){try{const C=S.C,o=C.createOscillator();o.type='sine';o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(45,t+0.08);
  const gg=C.createGain();gg.gain.setValueAtTime(0.18,t);gg.gain.exponentialRampToValueAtTime(0.001,t+0.1);o.connect(gg);gg.connect(S.sortie);o.start(t);o.stop(t+0.12);}catch(x){}}
/* ---- l'interface du jeu ---- */
function demarrerMoteur(){
  try{
    if(typeof REG!=='undefined'&&REG.sons===false)return;
    const C=new (window.AudioContext||window.webkitAudioContext)();
    const E=ESSAI, S=construireSon(C,(E.modele||{}).marque,E.tuning);
    Object.assign(SON_TK,S,{ctx:C});
    S.maitre.gain.setValueAtTime(0,C.currentTime);S.maitre.gain.linearRampToValueAtTime(0.75,C.currentTime+0.4);
    /* le démarreur : un petit « vrrr » avant le ralenti */
    souffle(SON_TK,C.currentTime,0.15,0.35,'bandpass',300);
  }catch(x){SON_TK.ctx=null;}
}
function majMoteur(dt,vit,gaz,glisse,rapport){
  const S=SON_TK;if(!S.ctx)return;
  const E=ESSAI;
  S.acc=(S.acc||0)+dt;if(S.acc<1/60&&dt<0.02)return;   /* une mise à jour par image suffit */
  const d=S.acc;S.acc=0;
  regleSon(S,S.ctx.currentTime,d,{vit,gaz,glisse,rapport,patine:E.patine,vibreur:E.vibreur,nitro:E.nitroT>0});
}
function pop(){const S=SON_TK;if(!S.ctx)return;souffle(S,S.ctx.currentTime,0.3,0.07,'lowpass',900);}
function sonChoc(force){const S=SON_TK;if(!S.ctx)return;const t=S.ctx.currentTime, v=Math.min(0.6,force/500);
  souffle(S,t,v,0.18,'lowpass',400);try{const C=S.C,o=C.createOscillator();o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(30,t+0.15);const gg=C.createGain();gg.gain.setValueAtTime(v,t);gg.gain.exponentialRampToValueAtTime(0.001,t+0.2);o.connect(gg);gg.connect(S.sortie);o.start(t);o.stop(t+0.22);}catch(x){}}
function sonBip(go){const S=SON_TK;if(!S.ctx)return;try{const C=S.C,t=C.currentTime,o=C.createOscillator();o.type='square';o.frequency.value=go?1320:660;
  const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=2500;const gg=C.createGain();gg.gain.setValueAtTime(0.09,t);gg.gain.setValueAtTime(0.09,t+(go?0.45:0.18));gg.gain.exponentialRampToValueAtTime(0.001,t+(go?0.6:0.25));
  o.connect(f);f.connect(gg);gg.connect(S.sortie);o.start(t);o.stop(t+0.65);}catch(x){}}
function sonTurboDrift(){const S=SON_TK;if(!S.ctx)return;souffle(S,S.ctx.currentTime,0.12,0.5,'bandpass',1400);}
function couperMoteur(){const S=SON_TK;if(!S.ctx)return;try{const C=S.ctx;S.maitre.gain.setTargetAtTime(0,C.currentTime,0.06);setTimeout(()=>{try{C.close();}catch(x){}},400);}catch(x){}S.ctx=null;}

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
const KMH=0.9;                                   /* px/s → km/h affichés */
const CMDS={g:false,d:false,gaz:false,frein:false,drift:false,nitro:false};
/* AU VOLANT, ON CONDUIT AUX BOUTONS, et seulement aux boutons : le joystick du jeu est coupé tant qu'on conduit */
const MODE_CMD='boutons';
try{localStorage.removeItem('bdl.tk.cmd');}catch(x){}

/* ================= LA CARRIÈRE : LES LICENCES C, B, A, S =================
   Chaque licence = trois épreuves, chacune avec une voiture prêtée et trois
   médailles (bronze, argent, or). Toutes les épreuves en bronze au moins : la
   licence est obtenue, le serveur verse sa prime une seule fois (dans l'ordre :
   C, puis B, puis A, puis S). Les licences ouvrent les circuits pour les
   courses avec sa propre voiture : Docks (C), Haruna (B), Wangan (A).
   Types : chrono (un tour, seul en piste), course (contre cinq pilotes),
   drift (une manche de 60 s dans la zone). */
const VOIT_PRET={BMW:{marque:'BMW',modele:'M3 E46',id:'bmw-m3-e46'},Toyota:{marque:'Toyota',modele:'Supra MK4',id:'toyota-supra-mk4'},
  Nissan:{marque:'Nissan',modele:'GT-R R35',id:'nissan-gtr-r35'},Porsche:{marque:'Porsche',modele:'911 GT3 RS',id:'porsche-911-gt3-rs'},
  Lamborghini:{marque:'Lamborghini',modele:'Huracán',id:'lamborghini-huracan'},Ferrari:{marque:'Ferrari',modele:'F40',id:'ferrari-f40'}};
const LICENCES=[
  {id:'C',nom:'Licence C',titre:'Débutant',prime:300000,coul:'#7fe8ff',ep:[
    {id:'C1',nom:'Premier tour',desc:'Un tour du Tokyo Circuit, seul en piste.',type:'chrono',circuit:'tokyo',voiture:'BMW',tours:1,seuils:[48,43,39.5]},
    {id:'C2',nom:'Premiers drifts',desc:'Une manche de 60 s dans la zone de drift.',type:'drift',voiture:'Toyota',seuils:[5000,15000,35000]},
    {id:'C3',nom:'Course aux Docks',desc:'Deux tours contre cinq pilotes, entre les conteneurs.',type:'course',circuit:'docks',voiture:'BMW',tours:2,niv:0.9,seuils:[3,2,1]}]},
  {id:'B',nom:'Licence B',titre:'Pilote',prime:800000,coul:'#5cff8a',ep:[
    {id:'B1',nom:'Les lacets d’Haruna',desc:'Un tour du Mont Haruna, seul.',type:'chrono',circuit:'haruna',voiture:'Toyota',tours:1,seuils:[62.5,56,51.5]},
    {id:'B2',nom:'Précision aux Docks',desc:'Un tour des Docks en 911, seul.',type:'chrono',circuit:'docks',voiture:'Porsche',tours:1,seuils:[39,35,32.5]},
    {id:'B3',nom:'Le grand prix de Tokyo',desc:'Trois tours contre cinq pilotes.',type:'course',circuit:'tokyo',voiture:'Toyota',tours:3,niv:0.9,seuils:[3,2,1]}]},
  {id:'A',nom:'Licence A',titre:'Expert',prime:1500000,coul:'#ffd21f',ep:[
    {id:'A1',nom:'Wangan à fond',desc:'Un tour de l’autoroute en Huracán, seul.',type:'chrono',circuit:'wangan',voiture:'Lamborghini',tours:1,seuils:[38,33,30]},
    {id:'A2',nom:'Duel sur la montagne',desc:'Deux tours d’Haruna contre cinq pilotes.',type:'course',circuit:'haruna',voiture:'Porsche',tours:2,seuils:[3,2,1]},
    {id:'A3',nom:'Maître du drift',desc:'Une manche de drift en 911.',type:'drift',voiture:'Porsche',seuils:[15000,35000,60000]}]},
  {id:'S',nom:'Licence S',titre:'Légende',prime:4000000,coul:'#ff4fb0',ep:[
    {id:'S1',nom:'La nuit du Wangan',desc:'Deux tours d’autoroute en F40, dans le trafic.',type:'course',circuit:'wangan',voiture:'Ferrari',tours:2,seuils:[3,2,1]},
    {id:'S2',nom:'Haruna en F40',desc:'Un tour de montagne, gros turbos, seul.',type:'chrono',circuit:'haruna',voiture:'Ferrari',tours:1,seuils:[60,54,50]},
    {id:'S3',nom:'La bête des Docks',desc:'Trois tours des Docks en GT-R contre cinq pilotes.',type:'course',circuit:'docks',voiture:'Nissan',tours:3,niv:1.04,seuils:[3,2,1]}]}];
const MED=['—','BRONZE','ARGENT','OR'], MED_C=['#8a8794','#d08a4a','#d8dbe6','#ffd21f'], MED_E=['','🥉','🥈','🥇'];
function carriere(){try{const c=JSON.parse(localStorage.getItem('bdl.tk.carriere')||'{}');c.med=c.med||{};c.best=c.best||{};c.lic=c.lic||{};return c;}catch(x){return {med:{},best:{},lic:{}};}}
function sauverCarriere(c){try{localStorage.setItem('bdl.tk.carriere',JSON.stringify(c));}catch(x){}}
function licenceOuverte(id){const c=carriere(), i=LICENCES.findIndex(l=>l.id===id);return i<=0||!!c.lic[LICENCES[i-1].id];}
function circuitOuvert(cid){const C=CIRCUITS[cid];return !C.licence||!!carriere().lic[C.licence];}
function medailleDe(ep,v){const s=ep.seuils;
  if(ep.type==='chrono')return v<=s[2]?3:v<=s[1]?2:v<=s[0]?1:0;
  if(ep.type==='course')return v<=s[2]?3:v<=s[1]?2:v<=s[0]?1:0;
  return v>=s[2]?3:v>=s[1]?2:v>=s[0]?1:0;}
const fmtSeuil=(ep,v)=>ep.type==='chrono'?fmtTour(v):ep.type==='course'?(v===1?'1er':v+'e'):v.toLocaleString('fr-FR')+' pts';
function lancerEpreuve(ep){
  const v=VOIT_PRET[ep.voiture];
  debutEssai(v,null,{},ep.type==='drift'?'drift':'course',{circuit:ep.circuit||'tokyo',tours:ep.tours,adv:ep.type==='course',niv:ep.niv,epreuve:ep});
}
/* le résultat d'une épreuve : médaille, record, licence peut-être obtenue */
async function resultatEpreuve(v){
  const E=ESSAI, ep=E.epreuve;if(!ep)return;
  const m=medailleDe(ep,v), c=carriere(), avant=c.med[ep.id]||0;
  const mieux=ep.type==='drift'?(c.best[ep.id]==null||v>c.best[ep.id]):(c.best[ep.id]==null||v<c.best[ep.id]);
  if(mieux)c.best[ep.id]=v;if(m>avant)c.med[ep.id]=m;sauverCarriere(c);
  const lic=LICENCES.find(l=>l.ep.some(x=>x.id===ep.id));
  const complete=lic.ep.every(x=>(c.med[x.id]||0)>=1), nouvelle=complete&&!c.lic[lic.id];
  let el=document.getElementById('tkFin');if(el)el.remove();
  el=document.createElement('div');el.id='tkFin';
  const s=ep.seuils;
  el.innerHTML='<div class="c"><small>'+lic.nom.toUpperCase()+' · '+ep.nom.toUpperCase()+'</small>'+
    '<div class="r" style="color:'+MED_C[m]+';font-size:54px">'+(m?MED_E[m]+' '+MED[m]:'RATÉ')+'</div>'+
    '<div class="t">'+fmtSeuil(ep,v)+(mieux&&avant?' · nouveau record':'')+'</div>'+
    '<div class="cl" style="text-align:center;font:600 12px -apple-system,sans-serif;color:rgba(255,255,255,.65);line-height:1.7">🥉 '+fmtSeuil(ep,s[0])+' · 🥈 '+fmtSeuil(ep,s[1])+' · 🥇 '+fmtSeuil(ep,s[2])+'</div>'+
    '<div class="g" id="tkGain">'+(nouvelle?'Licence en cours de validation…':(complete?lic.nom+' déjà obtenue.':'Encore '+lic.ep.filter(x=>!(c.med[x.id]>=1)).length+' épreuve(s) pour la '+lic.nom+'.'))+'</div>'+
    '<div class="b"><button id="tkRejouer">Réessayer</button><button id="tkQuitter2">Carrière</button></div></div>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
  if(m)try{navigator.vibrate&&navigator.vibrate([30,40,30,40,80]);}catch(x){}
  document.getElementById('tkRejouer').onclick=()=>{el.remove();E.actifAvant=true;lancerEpreuve(ep);E.actifAvant=false;};
  document.getElementById('tkQuitter2').onclick=()=>{el.remove();finEssai();setTimeout(()=>{try{ouvrirConcessionTokyo(4);}catch(x){}},60);};
  if(nouvelle){
    const r=await rpcTK('tokyo_licence',{p_licence:lic.id});const gz=document.getElementById('tkGain');
    if(r&&r.ok){const c2=carriere();c2.lic[lic.id]=true;sauverCarriere(c2);
      if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();sauver();}catch(x){}}
      if(gz)gz.innerHTML='🎉 <b>'+lic.nom+' obtenue !</b>'+(r.gain>0?' +'+enEuros(r.gain):'');}
    else if(gz){/* sans connexion, la licence est gardée sur ce téléphone ; la prime attendra */
      const c2=carriere();c2.lic[lic.id]=true;sauverCarriere(c2);gz.innerHTML='🎉 <b>'+lic.nom+' obtenue !</b> '+((r&&r.erreur)?'('+r.erreur+')':'');}
  }
}
/* le choix du circuit pour une course avec sa voiture */
function choisirCourse(v,aMoi){
  let el=document.getElementById('tkChoix');if(el)el.remove();
  cssVolant();el=document.createElement('div');el.id='tkChoix';
  el.innerHTML='<div class="c"><small>COURSE · CHOISIS TON CIRCUIT</small>'+Object.values(CIRCUITS).map(C=>{const ok=circuitOuvert(C.id);
    return '<button data-c="'+C.id+'" '+(ok?'':'disabled')+'><b>'+C.nom+'</b><span>'+(ok?C.desc+' · '+C.tours+' tours':'🔒 Il faut la licence '+C.licence+' (Carrière)')+'</span></button>';}).join('')+
    '<button class="x">Annuler</button></div>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
  el.querySelector('.x').onclick=()=>el.remove();
  el.querySelectorAll('button[data-c]').forEach(b=>b.onclick=()=>{el.remove();try{fermerConcessionTokyo();}catch(x){}debutEssai(v,aMoi,null,'course',{circuit:b.dataset.c});});
}

/* ================= LE DÉBUT ET LA FIN D'UNE SORTIE ================= */
function debutEssai(v,aMoi,reglages,mode,opts){
  const E=ESSAI;E.opts=opts||{};E.epreuve=E.opts.epreuve||null;
  E.actif=true;E.garage=aMoi||null;E.modele=v||{};E.mode=mode==='course'||mode==='drift'?mode:'libre';
  E.tuning=(aMoi&&aMoi.tuning)||reglages||{};
  E.stats=statsVoiture(v&&v.marque,E.tuning);
  E.halo=null;E.dist=0;E.drifts=0;E.nom=[v.marque,v.modele].filter(Boolean).join(' ');
  E.toile=peindreVoitureDessus(v.marque,E.tuning);
  E.retour=E.retour&&E.actifAvant?E.retour:{x:joueur.x,y:joueur.y};
  choisirCircuit(E.mode==='drift'?'tokyo':(E.opts.circuit||'tokyo'));CAM_V.lx=null;
  if(enVille()){E.x=CIRCUIT.ligne-150;E.y=(TK.route[0]+TK.route[1])/2+18;E.ang=0;}
  else{const p=pointPiste(CIR.ligneS-120);E.x=p.x;E.y=p.y;E.ang=p.ang;}
  E.vx=0;E.vy=0;
  E.limite=(aMoi||E.mode!=='libre')?null:180;
  E.tour=null;E.tours=0;E.cp=0;E.dernier=null;E.trainee=[];E.flamme=0;E.gazAvant=0;
  E.traces=[];E.fumee=[];E.etinc=[];E.recul=false;E.reste=0;E.idx=null;
  E.lacet=0;E.vol=0;E.delta=0;E.hbT=0;E.hAvant=false;E.idx=null;E.rapport=0;E.coupure=0;E.glisse=false;E.glisseT=0;E.charge=0;E.points=0;E.combo=1;E.finCombo=0;E.score=0;E.propre=true;
  E.boostT=0;E.boostK=1;E.nitroT=0;E.nitroCharge=1;E.choc=0;E.drA=0;E.drTh=0;E.drArme=0;E.frT=0;E.hClav=false;
  COURSE.actif=false;
  if(E.mode==='course')preparerCourse();
  ZONE.phase='';if(E.mode==='drift')preparerZone();
  if(enVille()){joueur.x=E.x;joueur.y=E.y;}
  couperMoteur();demarrerMoteur();
  if(E.mode!=='libre')sonBip(false);                  /* le « 3 » du départ */
  document.body.classList.add('tk-volant');
  try{window.TK_SANS_JOY=true;}catch(x){}
  try{lacher();}catch(x){}                        /* un joystick resté sous le doigt se lâche */
  hudMontrer(true);
  try{taille();videCache();}catch(x){}
}
function finEssai(){
  const E=ESSAI;
  E.actif=false;
  if(E.garage){const v=E.garage;v.km=(v.km||0)+E.dist*0.00017;v.drifts=(v.drifts||0)+E.drifts;v.sorties=(v.sorties||0)+1;try{sauver();}catch(x){}}
  E.garage=null;E.epreuve=null;COURSE.actif=false;COURSE.voitures=[];choisirCircuit('tokyo');
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
    /* LES COMMANDES SE DOSENT : le volant glisse de -1 à 1, l'accélérateur et le frein de 0,35 à 1 */
    s=Math.max(-1,Math.min(1,(+CMDS.volant||0)+(CMDS.d?1:0)-(CMDS.g?1:0)));
    g=typeof CMDS.gaz==='number'?CMDS.gaz:(CMDS.gaz?1:0);b=typeof CMDS.frein==='number'?CMDS.frein:(CMDS.frein?1:0);
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

/* ================= LE LABO DE CONDUITE : des curseurs pour régler la voiture en roulant =================
   Ouvert avec ?labo=1 dans l'adresse (une fois suffit, ?labo=0 le retire). Les valeurs sont gardées
   sur le téléphone ; « Copier » les met dans le presse-papier pour les envoyer et les rendre définitives. */
const RG_DEF=[
  ['Drift',[
    ['dAngle','Angle de base',0.42,0.15,0.75,0.01,'rad'],
    ['dAngleMax','Angle en plus (volant dedans)',0.33,0,0.6,0.01,'rad'],
    ['dRot','Rotation (courbe plus ou moins serrée)',1,0.4,1.8,0.05,'×'],
    ['dReponse','Vitesse de mise en travers',4,1.5,9,0.1,''],
    ['dFrottement','Perte de vitesse en drift',1,0.2,2.5,0.05,'×'],
    ['dSortie','Vitesse de redressement',5.5,2,12,0.1,''],
    ['dDeclenche','Durée max du tap frein (s)',0.3,0.12,0.5,0.01,'s'],
    ['dAFond','Drift en braquant à fond (0 = non)',1,0,1,1,'']]],
  ['Virage',[
    ['vBraquage','Braquage max',1,0.5,1.7,0.05,'×'],
    ['vVolant','Vitesse du volant',1,0.4,2.5,0.05,'×'],
    ['vAdherence','Adhérence',1,0.6,1.7,0.05,'×'],
    ['vStabilite','Inertie (rotation lente/rapide)',1,0.4,2.2,0.05,'×'],
    ['vVitesse','Braquage qui baisse avec la vitesse',300,120,900,10,'']]],
  ['Accélération et freinage',[
    ['aPuissance','Puissance',1,0.5,2,0.05,'×'],
    ['aVmax','Vitesse max',1,0.7,1.4,0.05,'×'],
    ['aFrein','Freins',1,0.4,2,0.05,'×'],
    ['aMoteur','Frein moteur (pied levé)',1,0,2.5,0.05,'×'],
    ['aTransfert','Transfert de poids',1,0,2.5,0.05,'×']]]];
const RG={};for(const [,L] of RG_DEF)for(const [k,,v] of L)RG[k]=v;
try{const o=JSON.parse(localStorage.getItem('bdl.tk.regl')||'{}');for(const k in o)if(k in RG&&typeof o[k]==='number')RG[k]=o[k];}catch(x){}
try{const q=new URLSearchParams(location.search).get('labo');if(q==='1')localStorage.setItem('bdl.tk.labo','1');if(q==='0')localStorage.removeItem('bdl.tk.labo');}catch(x){}
const laboActif=()=>{try{return localStorage.getItem('bdl.tk.labo')==='1';}catch(x){return false;}};
function ouvrirLabo(){
  const E=ESSAI;let el=document.getElementById('tkLaboP');if(el){el.remove();E.pauseLabo=false;return;}
  E.pauseLabo=true;{const ai=document.getElementById('tkAide');if(ai)ai.remove();}el=document.createElement('div');el.id='tkLaboP';
  const fmt=(v,st)=>st>=1?String(Math.round(v)):v.toFixed(st<0.1?2:1);
  let h='<div class="t"><b>LABO DE CONDUITE</b><span>'+esc0(E.nom||'')+' · jeu en pause</span></div><div class="z">';
  for(const [g,L] of RG_DEF){h+='<h4>'+g+'</h4>';
    for(const [k,lab,def,mi,ma,st] of L)h+='<label><span>'+lab+'<i id="rgv_'+k+'">'+fmt(RG[k],st)+(RG[k]!==def?' <s>('+fmt(def,st)+')</s>':'')+'</i></span><input type="range" data-k="'+k+'" min="'+mi+'" max="'+ma+'" step="'+st+'" value="'+RG[k]+'"></label>';}
  h+='</div><div class="b"><button data-a="defaut">Défaut</button><button data-a="copier">Copier</button><button data-a="ok">Rouler ▶</button></div>';
  el.innerHTML=h;document.body.appendChild(el);
  const sauverRG=()=>{try{localStorage.setItem('bdl.tk.regl',JSON.stringify(RG));}catch(x){}};
  el.querySelectorAll('input[type=range]').forEach(r=>{r.addEventListener('input',()=>{const k=r.dataset.k;RG[k]=+r.value;
    const d=RG_DEF.flatMap(x=>x[1]).find(x=>x[0]===k);document.getElementById('rgv_'+k).innerHTML=fmt(RG[k],d[5])+(RG[k]!==d[2]?' <s>('+fmt(d[2],d[5])+')</s>':'');sauverRG();});});
  el.querySelector('[data-a=ok]').onclick=()=>{el.remove();E.pauseLabo=false;};
  el.querySelector('[data-a=defaut]').onclick=()=>{for(const [,L] of RG_DEF)for(const [k,,v] of L)RG[k]=v;sauverRG();el.remove();E.pauseLabo=false;ouvrirLabo();};
  el.querySelector('[data-a=copier]').onclick=async ev=>{const diff={};for(const [,L] of RG_DEF)for(const [k,,v] of L)if(RG[k]!==v)diff[k]=RG[k];
    const txt='Réglages Tokyo ('+(E.nom||'')+') : '+JSON.stringify(diff);
    try{await navigator.clipboard.writeText(txt);ev.target.textContent='Copié ✓';}catch(x){prompt('Copie ce texte :',txt);}
    setTimeout(()=>{ev.target.textContent='Copier';},1500);};
}
const esc0=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* LE DRIFT PILOTÉ — on le lance, puis on le CONDUIT.
   LANCER : en tournant, un petit coup de FREIN (ou Espace au clavier). On peut
   aussi taper le frein d'abord et tourner juste après.
   CONDUIRE : le volant vers l'intérieur = plus d'angle et une courbe plus
   serrée ; vers l'extérieur = moins d'angle, la courbe s'ouvre. Les gaz
   tiennent la vitesse (sans gaz, on ralentit). Pas besoin de garder un bouton.
   SORTIR : volant au centre, ou freiner franchement : la voiture se redresse
   en douceur. Contre-braquer fort avec les gaz = changement de côté (le S). */
function driftAuto(c,dt){
  const E=ESSAI, S=E.stats||{vmax:200}, v=E.vitesse||0, st=c.s||0;
  if(c.b>0)E.frT=(E.frT||0)+dt;
  else{if(E.frT>0&&E.frT<RG.dDeclenche)E.drArme=0.4;E.frT=0;}
  if(c.h&&!E.hClav)E.drArme=0.4;E.hClav=!!c.h;
  /* braquer À FOND à bonne vitesse, gaz ouverts : l'arrière décroche tout seul */
  E.aFond=(Math.abs(st)>0.88&&(c.g||0)>0.3&&v>S.vmax*0.45&&E.drA!==1)?(E.aFond||0)+dt:0;
  if(E.aFond>0.3&&RG.dAFond>0.5){E.aFond=0;E.drArme=0.05;}
  if(E.drArme>0){E.drArme-=dt;
    if(Math.abs(st)>0.3&&v>S.vmax*0.22){
      const sens=Math.sign(st);E.drArme=0;
      if(E.drA!==1){const phi=Math.atan2(E.vy,E.vx);let th=E.ang-phi;th=Math.atan2(Math.sin(th),Math.cos(th));E.drTh=v>10?th:0;
        try{navigator.vibrate&&navigator.vibrate(12);}catch(x){}}
      E.drA=1;E.drSens=sens;E.drCentre=0;E.drContre=0;return;}}
  if(E.drA!==1)return;
  const dedans=st*E.drSens;
  E.drCentre=Math.abs(st)<0.15?(E.drCentre||0)+dt:0;
  E.drContre=dedans<-0.55?(E.drContre||0)+dt:0;
  if(E.drCentre>0.3||(c.b>0&&E.frT>0.35))E.drA=2;
  else if(E.drContre>0.2){if((c.g||0)>0.4){E.drSens=-E.drSens;E.drContre=0;}else E.drA=2;}
}

/* ================= UN PAS DE PHYSIQUE ================= */
/* ================= LA PHYSIQUE : UN VRAI MODÈLE « BICYCLETTE » =================
   La voiture a deux essieux (empattement PH.L) et un centre de gravité entre
   les deux (répartition des masses selon le modèle : moteur avant, central,
   arrière). Chaque pas :
   — LE VOLANT braque les roues AVANT d'un angle δ, à vitesse de volant réelle
     (on ne passe pas de butée à butée d'un coup), et l'angle maximal diminue
     avec la vitesse comme sur une vraie direction.
   — LES PNEUS : chaque essieu a un angle de dérive (l'écart entre où il pointe
     et où il va). La force latérale suit une courbe de pneu (forme « Pacejka ») :
     elle grandit, plafonne vers 13°, puis retombe un peu — c'est ce qui fait
     décrocher et glisser.
   — LE POIDS : la charge de chaque essieu dépend de la répartition et du
     transfert de masse (freiner charge l'avant, accélérer charge l'arrière).
     Un pneu plus chargé accroche plus.
   — LE CERCLE D'ADHÉRENCE : un pneu ne peut pas tout donner à la fois.
     L'arrière d'une propulsion qui patine sous les gaz perd de son grip
     latéral : la voiture survire. Le frein à main bloque l'arrière.
   — À BASSE VITESSE, la voiture suit la géométrie pure (modèle cinématique) :
     elle tourne autour de son essieu arrière, et ne pivote jamais à l'arrêt.
   Aides (comme sur les vraies voitures et dans les jeux de course) :
   antipatinage hors DRIFT, et un léger contre-braquage automatique qui
   dépend de la maîtrise (kit drift, pneus).
   DRIFT tenu : un coup de frein à main à l'appui, puis l'antipatinage se
   coupe et l'arrière décroche sous les gaz ; on tient l'angle au volant et
   à l'accélérateur. On relâche : l'arrière raccroche. */
const PH={L:40,g:340,h:11,sous:3};
function pneu(alpha,cap,B){return -cap*Math.sin(1.4*Math.atan(B*alpha));}
function pasPhysique(dt,c){
  const E=ESSAI, S=E.stats||statsVoiture('Toyota',{});
  const hp=horsPiste(E.x,E.y)>4;
  /* nitro et turbo de drift */
  if(E.nitroT>0)E.nitroT-=dt;else if(S.nitro&&E.nitroCharge<1)E.nitroCharge=Math.min(1,E.nitroCharge+dt/(S.nitro>1?5:8));
  if(E.boostT>0)E.boostT-=dt;
  const NB=E.nitroT>0?(S.nitro>1?1.5:1.35):1, BB=E.boostT>0?E.boostK:1, K=Math.max(NB,BB);
  const VMAX=S.vmax*RG.aVmax*(hp?0.5:1)*K, ACC=S.acc*RG.aPuissance*0.8*(hp?0.65:1)*(K>1?1.8:1);
  const L=PH.L, wf=S.wf||0.5, b=L*wf, a=L-b;          /* a : centre de gravité → essieu avant ; b : → essieu arrière */
  const mu=(S.grip/9.5)*RG.vAdherence*(hp?0.62:1);
  let u=E.vx*Math.cos(E.ang)+E.vy*Math.sin(E.ang), v=-E.vx*Math.sin(E.ang)+E.vy*Math.cos(E.ang), r=E.lacet||0;
  /* 1. LA BOÎTE */
  const fr=Math.max(0,u)/S.vmax;let rap=0;for(let i=0;i<RAPPORTS.length;i++)if(fr>=RAPPORTS[i])rap=i;
  if(rap!==E.rapport){if(rap>E.rapport&&c.g>0){E.coupure=0.1;if((E.tuning||{}).flammes)pop();}E.rapport=rap;}
  if(E.coupure>0)E.coupure-=dt;
  const couple=[1.3,1.12,1,0.92,0.85,0.8][rap]*(E.coupure>0?0.35:1);
  /* LE MOTEUR : un atmosphérique pousse plus fort en haut des tours ; un turbo attend sa pression, puis donne tout */
  const lo=RAPPORTS[rap]||0, hi=RAPPORTS[rap+1]||1.05, pRap=Math.max(0,Math.min(1,(fr-lo)/(hi-lo)));
  let mot=1;
  if(S.turbo>0){const vise=(c.g||0)*Math.max(0,Math.min(1,(pRap-0.2)/0.45+(rap>=2?0.35:0)));
    E.pression=(E.pression||0)+(vise-(E.pression||0))*Math.min(1,(vise>(E.pression||0)?1.5/S.turbo:0.9)*dt);
    mot=1-0.3*S.turbo+0.55*S.turbo*E.pression;}
  else mot=0.86+0.28*pRap;
  /* 2. LE DRIFT : le coup de frein à main à l'appui, puis l'arrière libéré */
  if(c.h&&!E.hAvant)E.hbT=0.22;
  E.hAvant=c.h;
  if(E.hbT>0)E.hbT-=dt;
  const frMain=E.hbT>0, driftTenu=c.h&&!frMain;
  /* 3. LE VOLANT : la cible, l'aide au contre-braquage, la vitesse de rotation du volant */
  const dmax=0.72*(S.dir/3)*RG.vBraquage/(1+Math.max(0,u)/RG.vVitesse);
  const beta=Math.atan2(v,Math.max(10,Math.abs(u)));
  E.dBeta=E.betaAvant==null?0:Math.max(-6,Math.min(6,(beta-E.betaAvant)/dt));E.betaAvant=beta;
  let dCible=(c.s||0)*dmax, gazDrift=1;
  E.driftAide=false;E.driftErr=0;
  /* en drift demandé, l'aide s'enclenche dès qu'on tourne : la voiture se met en travers même si elle accroche (4 roues motrices) */
  if(driftTenu&&u>40&&(Math.abs(beta)>0.12||(Math.abs(c.s||0)>0.3&&u>S.vmax*0.25))){
    /* L'AIDE AU DRIFT (comme un pilote qui contre-braque) : la touche de direction règle
       l'ANGLE voulu — vers l'intérieur pour plus d'angle, vers l'extérieur pour moins —
       et les roues avant contre-braquent pour le tenir. La maîtrise rend l'aide plus fine. */
    const sens=Math.abs(beta)>0.05?Math.sign(beta):-Math.sign(c.s||0), s2=-(c.s||0)*sens;   /* l'intérieur du virage est du côté opposé à la dérive */
    const bt=sens*(0.38+0.14*s2);
    const kp=1.1+0.4*(S.maitrise-1);
    dCible=Math.max(-0.7,Math.min(0.7,kp*(beta-bt)-0.08*r));
    /* trop d'angle : on lève un peu le pied pour ne pas partir en toupie */
    gazDrift=Math.max(0.2,1-Math.max(0,Math.abs(beta)-Math.abs(bt)-0.06)*4);
    E.driftAide=true;E.driftErr=beta-bt;
  }else if(u>40&&Math.abs(beta)>0.12){
    /* hors drift : un léger contre-braquage automatique rattrape l'arrière */
    dCible+=Math.max(-0.3,Math.min(0.3,(beta-Math.sign(beta)*0.12)*(0.35+0.2*(S.maitrise-1))));
  }
  dCible=Math.max(-0.75,Math.min(0.75,dCible));
  const vol=E.delta||0, retour=Math.abs(dCible)<Math.abs(vol)||dCible*vol<0;
  const vitVol=((E.driftAide||driftTenu||frMain)?3.5:(retour?5:2.2))*RG.vVolant*dt;
  E.delta=vol+Math.max(-vitVol,Math.min(vitVol,dCible-vol));
  E.vol=E.delta/Math.max(0.05,dmax);                       /* pour l'affichage et le reste du jeu */
  const d=E.delta;
  /* 4. LES FORCES LONGITUDINALES (par unité de masse) */
  let Fd=0, Fb=0;
  if(c.g>0){if(u<-5)Fb=S.frein;else Fd=ACC*couple*mot/(S.masse||1)*c.g*gazDrift*Math.max(0.04,1-Math.pow(Math.max(0,u)/VMAX,2));}
  if(c.b>0){if(u>8)Fb=Math.max(Fb,S.frein*RG.aFrein*c.b);else Fd=-ACC*0.55*c.b*(u>-90?1:0);}
  if(!(c.g>0)&&!(c.b>0))Fb=Math.abs(u)>2?(0.55*Math.abs(u)+12)*RG.aMoteur*(hp?2.5:1):0;   /* frein moteur et roulement */
  const ax=E.axL||0;
  let Nf=PH.g*b/L-PH.h*RG.aTransfert/L*ax, Nr=PH.g*a/L+PH.h*RG.aTransfert/L*ax;
  Nf=Math.max(PH.g*0.15,Nf);Nr=Math.max(PH.g*0.15,Nr);
  const sgn=u>=0?1:-1;
  const awd=S.trans==='4';
  let Fxf=(awd?(driftTenu?0.25:0.38)*Fd:0)-0.65*Fb*sgn, Fxr=(awd?(driftTenu?0.75:0.62)*Fd:Fd)-0.35*Fb*sgn;
  /* le frein à main bloque l'arrière */
  if(frMain&&Math.abs(u)>20)Fxr=-sgn*mu*Nr*0.55;
  /* l'antipatinage : sans DRIFT, la roue motrice ne dépasse pas ce que le pneu peut donner en virage */
  E.patine=false;
  /* en drift, l'arrière est libéré : la roue patine, mais garde de quoi tenir l'angle */
  const kR=driftTenu?(0.58+0.05*(S.glisse-2.5))/Math.sqrt(S.tenue):(frMain?0.3:1);
  const capXr=mu*Nr*(driftTenu?kR*0.55:1);
  if(Math.abs(Fxr)>capXr*0.98){E.patine=Fd>0;Fxr=Math.sign(Fxr)*capXr*0.98;}
  if(!driftTenu&&Fd>0){const lim=capXr*(0.9-0.3*Math.min(1,Math.abs(d)/0.35));if(Fxr>lim)Fxr=Math.max(0,lim);}
  /* L'ABS : au freinage, les roues avant ne bloquent jamais ; elles gardent de quoi tourner (sinon la voiture file tout droit, ou pire) */
  if(Math.abs(Fxf)>mu*Nf*0.75)Fxf=Math.sign(Fxf)*mu*Nf*0.75;
  if(Fb>0&&!frMain&&Math.abs(Fxr)>mu*Nr*kR*0.75)Fxr=Math.sign(Fxr)*mu*Nr*kR*0.75;
  /* 5. LA DYNAMIQUE, en sous-pas */
  const Iz=a*b*1.15*S.stab*(S.masse||1)*RG.vStabilite;
  const h2=dt/PH.sous;
  let aYf=0,aYr=0;
  if(E.drA){
    /* LE DRIFT PILOTÉ : la trajectoire décrit un arc, la caisse garde un angle stable par rapport à elle.
       L'angle et le rayon viennent du volant ; chaque voiture a son caractère (glisse, direction, maîtrise). */
    const V0=Math.hypot(E.vx,E.vy);let phi=Math.atan2(E.vy,E.vx);
    const sens=E.drSens||1, sv=c.s||0, dedans=sv*sens, gz=c.g||0;
    const kA=Math.max(0.8,Math.min(1.25,1+0.14*(S.glisse-2.5)));
    let thT, om;
    if(E.drA===1){
      thT=sens*kA*(dedans>=0?RG.dAngle+RG.dAngleMax*dedans+0.08*gz:RG.dAngle*(1+0.75*dedans));
      om=sens*(0.5+0.85*Math.max(0,dedans)+0.25*gz)*(S.dir/3)*RG.dRot*Math.min(1,V0/(S.vmax*0.3));
      if(dedans<0)om*=Math.max(0.15,1+0.7*dedans);
      om=Math.sign(om)*Math.min(Math.abs(om),V0/65*RG.dRot);
    }else{thT=0;om=(E.lacet||0)*Math.exp(-4*dt);}
    let th=E.drTh||0;
    th+=(thT-th)*Math.min(1,(E.drA===1?RG.dReponse:RG.dSortie)*(0.85+0.15*S.maitrise)*dt);
    E.drTh=th;phi+=om*dt;
    let V=V0+gz*ACC*0.42*couple*mot/(S.masse||1)*Math.max(0,1-V0/(VMAX*0.9))*dt;
    V-=((16+0.14*V0*Math.abs(Math.sin(th)))*RG.dFrottement+(gz>0?0:50)+(c.b>0?S.frein*0.55*c.b:0))*dt;
    V=Math.max(0,V);
    E.ang=phi+th;u=V*Math.cos(th);v=-V*Math.sin(th);r=om;
    aYf=V*om*0.5;aYr=V*om*0.5;Fxf=0;Fxr=0;
    E.delta=Math.max(-0.6,Math.min(0.6,-th*0.6+sv*0.12));E.vol=E.delta/Math.max(0.05,dmax);
    if(E.drA===2&&Math.abs(th)<0.06)E.drA=0;
    if(V<S.vmax*0.12)E.drA=0;
  }else for(let k=0;k<PH.sous;k++){
    const capF=Math.sqrt(Math.max(0,(mu*Nf)**2-Fxf*Fxf)), capR=Math.sqrt(Math.max(0,(mu*Nr*kR)**2-Fxr*Fxr));
    let du,dv,dr;
    const ue=Math.max(Math.abs(u),12);
    const af=Math.atan2(v+a*r,ue)-d*sgn, ar=Math.atan2(v-b*r,ue);
    const Fyf=-capF*Math.tanh(7*af), Fyr=pneu(ar,capR,9.5);   /* l'avant plafonne sans retomber (sous-virage franc) ; l'arrière décroche */
    aYf=Fyf;aYr=Fyr;
    const cd=Math.cos(d), sd=Math.sin(d);
    du=Fxr+Fxf*cd-Fyf*sd+v*r;
    dv=Fyr+Fyf*cd+Fxf*sd-u*r;
    dr=(a*(Fyf*cd+Fxf*sd)-b*Fyr)/Iz;
    /* le coup de frein à main en braquant lance l'arrière ; l'aide au drift ramène l'angle vers la consigne */
    if(frMain&&u>40)dr+=(c.s||0)*4;
    if(E.driftAide)dr+=(E.driftErr||0)*(5+2*(S.maitrise-1))+(E.dBeta||0)*1.4;
    /* en drift, la caisse ne tourne pas plus vite qu'une vraie voiture en glisse (≈ 75°/s) */
    if((driftTenu||frMain)&&Math.abs(r)>1.35)dr-=(Math.abs(r)-1.35)*Math.sign(r)*8;
    /* à basse vitesse ou en marche arrière : la géométrie pure, la voiture tourne autour de l'essieu arrière */
    const w=u<0?1:Math.max(0,Math.min(1,(45-u)/30));
    if(w>0){const rk=u*Math.tan(d)/L;
      dr=dr*(1-w)+((rk-r)*14)*w;
      dv=dv*(1-w)+((rk*b-v)*14-u*r*0)*w;
      du=du*(1-w)+(Fxr+Fxf)*w;}
    u+=du*h2;v+=dv*h2;r+=dr*h2;
    if(!(c.g>0)&&Math.abs(u)<3&&!(c.b>0))u=0;
    if(u>VMAX*1.03)u+=(VMAX-u)*Math.min(1,3*h2);
    E.ang+=r*h2;
  }
  {const axN=(Fxr+Fxf)-0;E.axL=(E.axL||0)+(axN-(E.axL||0))*Math.min(1,8*dt);}
  E.lacet=r;
  const ca=Math.cos(E.ang), sa=Math.sin(E.ang);
  E.vx=u*ca-v*sa;E.vy=u*sa+v*ca;
  /* la glisse se lit à l'essieu ARRIÈRE : en virage lent, la voiture pivote sans glisser */
  const vr=v-b*r, nx=ca, ny=sa, av=u, tr=vr;
  /* 6. LA GLISSE (pour les points) : l'angle entre la carrosserie et la trajectoire */
  const vit=Math.hypot(u,v), angG2=Math.atan2(Math.abs(vr),Math.max(1,Math.abs(u)));
  if(!E.glisse&&vit>S.vmax*0.25&&angG2>0.26){
    E.glisse=true;E.glisseT=0;E.propre=true;E.combo=(E.finCombo>0)?(E.dernierNiv>0?Math.min(5,(E.combo||1)+1):(E.combo||1)):1;E.drifts++;
  }else if(E.glisse&&(angG2<0.1/S.tenue||vit<S.vmax*0.15))finDeGlisse();
  if(E.glisse){
    E.glisseT+=dt;
    const deg=angG2*57.3, haut=45+12*(S.maitrise-1), maitrise=deg<12?0.6:deg<=haut?1.5:deg<=haut+20?1:0.5;  /* le bon angle rapporte plus que la toupie */
    E.charge=Math.min(3,E.charge+dt*(maitrise>=1?1:0.4)*S.tenue);
    E.points+=deg*(vit/60)*dt*maitrise*E.combo*(E.mode==='drift'&&ZONE.clip>0?ZONE.clip:1);E.finCombo=1.6;E.maitriseVue=maitrise;
  }else if(E.finCombo>0){E.finCombo-=dt;if(E.finCombo<=0)encaisserCombo();}
  E.vitesse=vit;E.vmaxVue=S.vmax;E.angGlisse=angG2;E.horsPiste=hp;E.latG=aYf+aYr;
  /* le son suit le régime ; les pneus crissent quand ils travaillent au-delà du pic */
  majMoteur(dt,Math.abs(u)*340/S.vmax*(E.patine?1.25:1),c.g>0&&!(E.coupure>0),Math.abs(v)*2+(E.patine?60:0),rap);
  const T0=E.tuning||{};
  if(T0.flammes){if(E.gazAvant>0&&!(c.g>0)&&u>VMAX*0.45){E.flamme=0.35;pop();}E.gazAvant=c.g;}
  if(E.flamme>0)E.flamme-=dt;
  if((E.nitroT>0||E.boostT>0)&&Math.random()<0.5)E.flamme=Math.max(E.flamme,0.06);
  /* 7. LE DÉPLACEMENT ET LES MURS */
  const libre=enVille()?((X,Y)=>!(bloqueTokyo(X,Y)||X<20||X>MONDE_L-20||Y<TK.bati+18||Y>MONDE_H-18
    ||(E.mode==='drift'&&!dansZone(X,Y,16))||ZD.poteaux.some(([px,py])=>Math.hypot(X-px,Y-py)<30)))
    :((X,Y)=>projeter(X,Y,E.idx).d<CIR.ep/2+CIR.marge);   /* hors de la ville : le mur suit la piste */
  let X=E.x+E.vx*dt, Y=E.y+E.vy*dt;
  if(!libre(X,Y)){
    const choc=Math.hypot(E.vx,E.vy);
    if(libre(X,E.y)){Y=E.y;E.vy*=-0.25;E.vx*=0.82;}
    else if(libre(E.x,Y)){X=E.x;E.vx*=-0.25;E.vy*=0.82;}
    else{X=E.x;Y=E.y;E.vx*=-0.3;E.vy*=-0.3;}
    E.lacet*=0.5;
    if(choc>75)heurter(choc,E.x+nx*28,E.y+ny*28);
  }
  E.dist+=Math.hypot(X-E.x,Y-E.y);
  const sAv=E.sPiste;{const pr=projeter(X,Y,E.idx);E.idx=pr.i;E.sPiste=pr.s;E.lat=pr.lat;}
  chronoPas(sAv,E.sPiste,dt);
  E.x=X;E.y=Y;
  return {av,tr,nx,ny,hp,vit,VMAX};
}
/* un choc : étincelles, secousse légère, le drift en cours est perdu */
function heurter(force,x,y){
  const E=ESSAI;
  for(let i=0;i<Math.min(14,4+force/25);i++)E.etinc.push({x,y,vx:(Math.random()-0.5)*170,vy:(Math.random()-0.5)*170,vie:0.35,c:'#ffd27a'});
  try{secouer(Math.min(0.5,force/600));}catch(x){}
  try{sonChoc(force);}catch(x){}
  if(force>75)E.drA=0;
  if(E.glisse||E.points>0){E.propre=false;E.points=0;E.combo=1;E.finCombo=0;E.charge=0;if(E.glisse){E.glisse=false;}popDrift('DRIFT PERDU','#ff6a5a');}
  try{navigator.vibrate&&navigator.vibrate(Math.min(60,10+force/8));}catch(x){}
}
function niveauCharge(){const c=ESSAI.charge||0;return c>=DRIFT_NIV[3]?3:c>=DRIFT_NIV[2]?2:c>=DRIFT_NIV[1]?1:0;}
/* la glisse finit proprement : turbo selon la charge, et un bonus de maîtrise */
function finDeGlisse(){
  const E=ESSAI, niv=niveauCharge();
  E.glisse=false;E.dernierNiv=E.propre?niv:0;
  if(E.propre&&niv>0){E.boostT=BOOST_T[niv];E.boostK=BOOST_K[niv];E.points+=[0,80,200,420][niv]*E.combo;
    popDrift(['','TURBO','SUPER TURBO','ULTRA TURBO'][niv],COUL_NIV[niv]);sonTurboDrift();
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
  if(E.pauseLabo)return;
  dt=Math.min(dt||0,0.1);
  if(E.limite!=null){E.limite-=dt;if(E.limite<=0){E.limite=null;const nm=E.nom;finEssai();
    try{texteVolant(joueur.x,joueur.y-44,'Fin de l’essai — '+nm+' t’attend au showroom','#ffd98a');}catch(x){}return;}}
  const gele=(COURSE.actif&&COURSE.phase==='decompte')||(E.mode==='drift'&&(ZONE.phase==='decompte'||ZONE.phase==='fini'));
  E.reste+=dt;let n=0, info=null;
  while(E.reste>=PAS&&n<14){
    E.reste-=PAS;n++;
    const c=gele?{s:0,g:CMDS.gaz?1:0,b:1,h:false}:lireCommandes(jx,jy);
    if(gele){majMoteur(PAS,0,c.g>0,0,0);continue;}
    if(CMDS.nitro&&E.nitroCharge>=1&&E.stats&&E.stats.nitro){E.nitroT=E.stats.nitro>1?2.6:2;E.nitroCharge=0;CMDS.nitro=false;try{navigator.vibrate&&navigator.vibrate([20,30,60]);}catch(x){}}
    driftAuto(c,PAS);c.h=false;
    info=pasPhysique(PAS,c);
    if(COURSE.actif)pasCourse(PAS);
    if(E.mode==='drift')pasZone(PAS);
  }
  if(COURSE.actif)majCourseHorsPas(dt);
  if(E.mode==='drift')majZoneHorsPas(dt);
  /* LES EFFETS, une fois par image */
  {const fb=majEssai.fb&&majEssai.fb.isConnected?majEssai.fb:(majEssai.fb=document.querySelector('#tkPad .frein'));if(fb)fb.classList.toggle('drifte',E.drA===1);}
  if(info){const {tr,nx,ny,hp,vit}=info;
    if(Math.abs(tr)>30||(E.patine&&vit>8)){
      for(const s of [-10,10]){const px=E.x-nx*18-ny*s, py=E.y-ny*18+nx*s;
        try{const gs=SOL.getContext('2d');gs.fillStyle='rgba(12,10,16,.42)';gs.fillRect(Math.round(px)-1,Math.round(py)-1,2,2);if(TK_HD&&py>HD_Y0){const hg=TK_HD.getContext('2d');hg.fillStyle='rgba(12,10,16,.35)';hg.fillRect(px-0.9,py-0.9,1.8,1.8);}}catch(x){E.traces.push([px,py]);}}
      if(E.fumee.length<44&&Math.random()<0.6)E.fumee.push({x:E.x-nx*24+(Math.random()-0.5)*8,y:E.y-ny*24+(Math.random()-0.5)*8,r:4,vie:0.85,c:(E.tuning||{}).fumee||null});
      if(E.traces.length>900)E.traces.splice(0,E.traces.length-900);}
    const niv=niveauCharge();
    if(E.glisse&&niv>0)for(const s of [-10,10])E.etinc.push({x:E.x-nx*20-ny*s,y:E.y-ny*20+nx*s,vx:-nx*40+(Math.random()-0.5)*90,vy:-ny*40+(Math.random()-0.5)*90,vie:0.25,c:COUL_NIV[niv]});
    if(hp&&vit>60&&Math.random()<0.45)E.fumee.push({x:E.x-nx*20,y:E.y-ny*20,r:3,vie:0.5,c:'#8a7a5a'});
    if(E.nitroT>0&&Math.random()<0.7)E.fumee.push({x:E.x-nx*32,y:E.y-ny*32,r:3,vie:0.5,c:'#7fe8ff'});
    if((E.tuning||{}).trainee){E.trainee.push([E.x-nx*26,E.y-ny*26]);if(E.trainee.length>26)E.trainee.shift();}
  }
  /* LA CAISSE VIT : roulis vers l'extérieur du virage, plongée au freinage, cabrage à
     l'accélération — un ressort amorti, en pixels. Les vibreurs secouent la voiture. */
  {const av2=E.vx*Math.cos(E.ang)+E.vy*Math.sin(E.ang), lat=av2*(E.lacet||0);
    const rT=-Math.max(-1,Math.min(1,lat/900))*2.2, pT=-Math.max(-1,Math.min(1,(E.axL||0)/450))*1.8;
    const kd=Math.min(dt,0.05);
    E.rollV=(E.rollV||0)+(70*(rT-(E.roll||0))-10*(E.rollV||0))*kd;E.roll=(E.roll||0)+E.rollV*kd;
    E.pitchV=(E.pitchV||0)+(70*(pT-(E.pitch||0))-10*(E.pitchV||0))*kd;E.pitch=(E.pitch||0)+E.pitchV*kd;
    const pp=E.sPiste!=null?pointPiste(E.sPiste):null, bord=Math.abs(E.lat||0);
    E.vibreur=!!(E.mode!=='drift'&&(CIR.style==='tokyo'||CIR.style==='docks')&&pp&&pp.k>0&&bord>CIR.ep/2-12&&bord<CIR.ep/2+6&&(E.vitesse||0)>60);
    if(E.vibreur&&(E.vibreT=(E.vibreT||0)-dt)<=0){E.vibreT=0.11;try{navigator.vibrate&&navigator.vibrate(7);}catch(x){}}}
  for(const f of E.fumee){f.vie-=dt;f.r+=14*dt;}
  E.fumee=E.fumee.filter(f=>f.vie>0);
  for(const p of E.etinc){p.vie-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
  E.etinc=E.etinc.filter(p=>p.vie>0);if(E.etinc.length>140)E.etinc.splice(0,E.etinc.length-140);
  if(enVille()){joueur.x=E.x;joueur.y=E.y;}
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
  const O=E.opts||{}, lw=Math.round(CIR.ep*0.28), adv=O.adv!==false;
  COURSE.actif=true;COURSE.phase='decompte';COURSE.t=3;COURSE.voitures=[];COURSE.fin=null;COURSE.temps=0;COURSE.resultat=null;
  COURSE.tours=O.tours||CIR.tours;COURSE.seul=!adv;
  const marques=['Toyota','BMW','Lamborghini','Porsche','Nissan','Ferrari'].filter(m=>m!==(E.modele||{}).marque);
  /* la grille : le joueur en dernière ligne, à gauche */
  const grille=[[-45,-lw],[-45,lw],[-110,-lw],[-110,lw],[-175,-lw],[-175,lw]];
  if(!adv){grille[5]=[-60,0];}
  for(let i=0;i<(adv?5:0);i++){
    const m=marques[i%marques.length], S=statsVoiture(m,{}), coul=COUL_ADV[(i*3+Math.floor(Math.random()*7))%COUL_ADV.length];
    const s=P.ligneS+grille[i][0], lane=grille[i][1];
    COURSE.voitures.push({type:'adv',nom:['Kenji','Aya','Ryo','Mika','Takumi'][i]+' · '+m,marque:m,toile:peindreVoitureDessus(m,{couleur:coul}),
      s,lane,laneCible:lane,v:0,vmax:Math.min(S.vmax,(E.stats||S).vmax)*(0.84+i*0.03)*(O.niv||1),acc:Math.min(S.acc,(E.stats||S).acc)*0.9,   /* au niveau de TA voiture : c'est le tuning qui fait la différence */
      tours:0,tour0:false,fini:null,x:0,y:0,ang:0,r:13});
  }
  const nt=adv?CIR.trafic:0;
  for(let i=0;i<nt;i++){
    const s=P.ligneS+P.L*((i+1)/(nt+1)), lane=CIR.style==='wangan'?[-1,0,1][i%3]*CIR.ep/3:(i%2?lw:-lw);
    COURSE.voitures.push({type:'trafic',nom:'Trafic',marque:'Toyota',toile:petiteVoiture(['#f4f4f6','#ffd21f','#2a2c33','#1a5fd0','#c0392b','#7f8c8d'][i%6]),
      s,lane,laneCible:lane,v:105+i*12,vmax:105+i*12,acc:90,tours:0,x:0,y:0,ang:0,r:11});
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
      for(let a=0;a<=360;a+=20){const k=pointPiste(c.s+a).k;if(k>0){const vv=Math.sqrt(240*(1/k));cible=Math.min(cible,Math.sqrt(vv*vv+2*345*a));}}
      /* l'élastique : léger, et seulement s'il est loin */
      const ecart=(progression(c)-progressionJoueur());
      if(ecart>500)cible*=0.96;else if(ecart<-400)cible*=1.04;
      if(c.fini!=null)cible=Math.min(cible,c.vmax*0.7);   /* arrivé : il finit son tour en fantôme */
    }
    if(c.type==='trafic'){const k=pointPiste(c.s+40).k;if(k>1e-4)cible=Math.min(cible,Math.max(80,Math.sqrt(160/k)));}   /* le trafic ralentit dans les virages serrés, pas dans les grandes courbes */
    c.v+=Math.max(-345*dt,Math.min(c.acc*dt,cible-c.v));
    /* LES COULOIRS : trois files (gauche, milieu, droite). Un adversaire regarde
       la place libre devant lui dans chaque file et prend la plus dégagée pour
       doubler ; il ne change que si le gain est net (pas de zigzag). Derrière
       quelqu'un de plus lent dans sa file, il cale sa vitesse sur lui. */
    const autres=COURSE.voitures.filter(o=>o.fini==null).concat([{s:E.sPiste||0,lane:proj.lat,v:E.vitesse||0,joueur:true}]);
    const libre=(lane)=>{let m=420;for(const o of autres){if(o===c)continue;const ds=((o.s-c.s)%P.L+P.L)%P.L;
      if(ds>0&&ds<420&&Math.abs(o.lane-lane)<24&&(o.v||0)<c.v+8)m=Math.min(m,ds);}return m;};
    if(c.type==='adv'&&(c.choix=(c.choix||0)-dt)<=0){c.choix=0.25;
      const ici=libre(c.laneCible);
      if(ici<220){let best=c.laneCible,bm=ici;for(const l of [-Math.round(CIR.ep*0.28),0,Math.round(CIR.ep*0.28)]){const m=libre(l);if(m>bm+60){bm=m;best=l;}}c.laneCible=best;}}
    if(c.fini==null)for(const o of autres){if(o===c)continue;const ds=((o.s-c.s)%P.L+P.L)%P.L;
      if(ds>0&&ds<80&&Math.abs(o.lane-c.lane)<22)c.v=Math.min(c.v,Math.max(0,(o.v||0)-5));}
    c.lane+=Math.max(-60*dt,Math.min(60*dt,c.laneCible-c.lane));
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
      E.x+=ux*pen*0.6;E.y+=uy*pen*0.6;c.lane=Math.max(-CIR.ep*0.4,Math.min(CIR.ep*0.4,c.lane-(ux*-Math.sin(c.ang)+uy*Math.cos(c.ang))*pen*0.4));c.laneCible=c.lane;
      const rel=(E.vx-c.vx)*ux+(E.vy-c.vy)*uy;
      if(rel<0){E.vx-=rel*ux*1.3;E.vy-=rel*uy*1.3;E.vx*=0.9;E.vy*=0.9;if(-rel>18)c.v*=0.92;
        if(-rel>38)heurter(-rel,E.x-ux*12,E.y-uy*12);}
    }
  }
  for(let i=0;i<toutes.length;i++)for(let j=i+1;j<toutes.length;j++){
    const a=toutes[i],b=toutes[j];if(a.fini!=null||b.fini!=null)continue;let ds=((b.s-a.s)%P.L+P.L)%P.L;if(ds>P.L/2)ds-=P.L;
    const dl=a.lane-b.lane;
    if(Math.abs(ds)<72&&Math.abs(dl)<28){const k=(28-Math.abs(dl))*0.06, sg=dl>=0?1:-1;a.lane=Math.max(-CIR.ep*0.4,Math.min(CIR.ep*0.4,a.lane+sg*k));b.lane=Math.max(-CIR.ep*0.4,Math.min(CIR.ep*0.4,b.lane-sg*k));
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
    if(apres!==avant&&apres>0){decompteMontrer(apres);sonBip(false);}
    if(COURSE.t<=0){COURSE.phase='course';COURSE.temps=0;decompteMontrer('GO');sonBip(true);try{navigator.vibrate&&navigator.vibrate(60);}catch(x){}}
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
  if(E.epreuve){resultatEpreuve(E.epreuve.type==='chrono'?Math.round(temps*100)/100:rang);return;}
  let el=document.getElementById('tkFin');if(el)el.remove();
  el=document.createElement('div');el.id='tkFin';
  const ligne=(x,i)=>'<div class="l'+(x.joueur?' moi':'')+'"><b>'+(i+1)+'</b><span>'+(x.joueur?'Toi · '+E.nom:x.nom)+'</span></div>';
  el.innerHTML='<div class="c"><small>'+CIR.nom.toUpperCase()+' · '+COURSE.tours+' TOURS</small><div class="r">'+rang+'<sup>'+(rang===1?'er':'e')+'</sup></div>'+
    '<div class="t">'+fmtTour(temps)+' · drift '+(E.score||0).toLocaleString('fr-FR')+' pts</div>'+
    '<div class="cl">'+L.map(ligne).join('')+'</div><div class="g" id="tkGain">Le comptoir calcule ta prime…</div>'+
    '<div class="b"><button id="tkRejouer">Rejouer</button><button id="tkQuitter2">Quitter</button></div></div>';
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));
  document.getElementById('tkRejouer').onclick=()=>{el.remove();const g=E.garage, m=E.modele, o=E.opts;E.actifAvant=true;debutEssai(m,g,null,'course',o);E.actifAvant=false;};
  document.getElementById('tkQuitter2').onclick=()=>{el.remove();finEssai();};
  if(!E.garage){document.getElementById('tkGain').textContent='Course d’essai : pas de prime.';return;}
  const r=await rpcTK('tokyo_course_fin',{p_voiture:E.garage.modele,p_rang:rang,p_temps_ms:Math.round(temps*1000),p_circuit:CIR.cle});
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
#tkLaboP{position:fixed;left:0;right:0;bottom:0;z-index:40;max-height:78%;display:flex;flex-direction:column;background:rgba(14,9,24,.96);border-top:1px solid rgba(255,79,176,.5);border-radius:22px 22px 0 0;color:#fff;font-family:-apple-system,sans-serif;padding-bottom:env(safe-area-inset-bottom,0px)}
#tkLaboP .t{padding:14px 18px 6px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}#tkLaboP .t b{font:800 12px ui-monospace,monospace;letter-spacing:2px;color:#ff8ac8}#tkLaboP .t span{font-size:11px;color:rgba(255,255,255,.5)}
#tkLaboP .z{overflow-y:auto;padding:0 18px 8px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#tkLaboP h4{margin:14px 0 4px;font:800 13px -apple-system,sans-serif;color:#7fe8ff}
#tkLaboP label{display:block;margin:8px 0}#tkLaboP label span{display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.85)}
#tkLaboP label i{font:700 12px ui-monospace,monospace;font-style:normal;color:#ffd98a}#tkLaboP label s{color:rgba(255,255,255,.4);text-decoration:none;font-weight:400}
#tkLaboP input[type=range]{width:100%;height:30px;accent-color:#ff4fb0;margin:2px 0 0}
#tkLaboP .b{display:flex;gap:8px;padding:10px 18px 14px;border-top:1px solid rgba(255,255,255,.08)}
#tkLaboP .b button{flex:1;min-height:46px;border:0;border-radius:14px;background:rgba(255,255,255,.1);color:#fff;font:800 14px -apple-system,sans-serif}
#tkLaboP .b button[data-a=ok]{background:#ff4fb0}
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
#tkPad .frein{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:clamp(62px,17vw,74px);height:clamp(104px,30vw,124px);font-size:12px;line-height:1.1;text-align:center}
#tkPad .frein small{display:block;margin-top:5px;font:700 9px -apple-system,sans-serif;letter-spacing:0;opacity:.75;text-transform:uppercase;white-space:nowrap}
#tkPad .frein.drifte{box-shadow:inset 0 0 0 2px #ff8ac8;background:rgba(255,79,176,.3)}
#tkPad .drift{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(58px,16vw,70px) + 10px);width:clamp(58px,16vw,70px);height:clamp(58px,16vw,70px);border-radius:50%;font-size:11px;box-shadow:inset 0 0 0 3px var(--c,rgba(255,255,255,.2))}
#tkPad .nitro{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(104px,30vw,124px) + 10px);width:clamp(58px,16vw,70px);height:clamp(50px,14vw,58px);border-radius:16px;font-size:11px;
 background:conic-gradient(rgba(63,224,255,.55) var(--p,100%),rgba(14,10,24,.62) 0);box-shadow:inset 0 0 0 2px rgba(127,232,255,.5)}
/* Même en mode joystick, conserver les commandes de secours visibles : sur mobile, le HUD plein écran masque parfois le joystick global. */
#tkPad .vol{position:absolute;pointer-events:auto;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:calc(2 * clamp(62px,18vw,80px) + 26px);height:clamp(62px,18vw,80px);
 border-radius:22px;background:rgba(14,10,24,.62);box-shadow:inset 0 0 0 2px rgba(255,255,255,.16);touch-action:none;user-select:none;-webkit-user-select:none;display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:#fff;font-size:22px;--v:0}
#tkPad .vol i{font-style:normal;opacity:.75;pointer-events:none}
#tkPad .vol .curseur{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4);pointer-events:none;
 transform:translateX(calc(var(--v) * (clamp(62px,18vw,80px) - 6px)));transition:transform .04s}
#tkPad .vol.on{box-shadow:inset 0 0 0 2px #ff8ac8;background:rgba(40,14,40,.62)}
#tkPad .vol::before{content:'';position:absolute;left:50%;top:14px;bottom:14px;width:2px;margin-left:-1px;background:rgba(255,255,255,.18)}
#tkPad .gaz,#tkPad .frein{overflow:hidden}
#tkPad .gaz::before,#tkPad .frein::before{content:'';position:absolute;left:0;right:0;bottom:0;height:var(--p,0%);background:rgba(92,255,138,.35);transition:height .05s}
#tkPad .frein::before{background:rgba(255,90,90,.35)}
#tkPad .gaz span,#tkPad .frein span{position:relative}
#tkPad.joy .dir,#tkPad.joy .gaz{display:block}
#tkPad.joy .frein{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px)}
#tkPad.joy .drift{right:calc(12px + clamp(66px,19vw,82px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(58px,16vw,70px) + 10px)}
#tkPad.joy .nitro{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px + clamp(104px,30vw,124px) + 10px)}
#tkAide{position:fixed;left:16px;right:16px;top:38%;z-index:22;pointer-events:none;margin:0 auto;max-width:330px;
 padding:12px 14px;border-radius:14px;background:rgba(10,8,18,.88);border:1px solid rgba(255,79,176,.4);color:#fff;font:600 13px/1.45 -apple-system,sans-serif;transition:opacity .6s}
#tkAide b{color:#ff8ac8}
#tkChoix{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;background:rgba(6,4,12,0);transition:background .3s;padding:16px}
#tkChoix.on{background:rgba(6,4,12,.78)}
#tkChoix .c{width:100%;max-width:360px;border-radius:22px;background:#160b26;border:1px solid rgba(255,79,176,.45);color:#fff;padding:16px;display:flex;flex-direction:column;gap:8px}
#tkChoix small{font:700 10px ui-monospace,monospace;letter-spacing:3px;color:#ff8ac8;text-align:center;margin-bottom:4px}
#tkChoix button{-webkit-appearance:none;appearance:none;text-align:left;border:0;border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.07);color:#fff;font-family:-apple-system,sans-serif;cursor:pointer}
#tkChoix button b{display:block;font:800 15px -apple-system,sans-serif}
#tkChoix button span{display:block;margin-top:3px;font-size:12px;line-height:1.35;color:rgba(255,255,255,.6)}
#tkChoix button:disabled{opacity:.45}
#tkChoix button.x{text-align:center;background:none;color:rgba(255,255,255,.6);font-weight:700}
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
  ESSAI.pauseLabo=false;
  for(const i of ['tkHud','tkPad','tkPop','tkAide','tkHaut','tkCarte','tkDec','tkFin','tkLaboP']){const x=document.getElementById(i);if(x)x.remove();}
  if(!on)return;
  cssVolant();
  const E=ESSAI;
  const hud=document.createElement('div');hud.id='tkHud';
  hud.innerHTML='<div><span class="v" id="tkV">0</span><span class="u">KM/H</span></div><div class="r"><span class="gr" id="tkG">1</span><span class="t"><i id="tkT"></i></span></div>'+
    '<div class="c"><b id="tkC1"></b><b id="tkC2"></b><b id="tkC3"></b></div><span class="p" id="tkCombo"></span>';
  document.body.appendChild(hud);
  const haut=document.createElement('div');haut.id='tkHaut';
  haut.innerHTML='<button id="tkQuit">✕ Quitter</button><div id="tkInfo"></div><span>'+(laboActif()?'<button id="tkLabo">⚙ Labo</button>':'')+'</span>';
  document.body.appendChild(haut);
  document.getElementById('tkQuit').onclick=()=>finEssai();
  if(document.getElementById('tkLabo'))document.getElementById('tkLabo').onclick=()=>ouvrirLabo();
  if(E.mode!=='drift'){const carte=document.createElement('canvas');carte.id='tkCarte';carte.width=112;carte.height=280;document.body.appendChild(carte);}
  const pp=document.createElement('div');pp.id='tkPop';document.body.appendChild(pp);
  /* LE PAVÉ DE COMMANDES */
  const pad=document.createElement('div');pad.id='tkPad';if(MODE_CMD!=='boutons')pad.classList.add('joy');
  /* LE VOLANT : une bande à gauche. Le doigt s'y pose et glisse : plus il va loin du centre,
     plus on braque — on dose. Il peut passer de gauche à droite sans se lever.
     GAZ et FREIN se dosent aussi : appuyer en bas du bouton = un filet, en haut = à fond ;
     le doigt peut glisser sur le bouton pendant qu'on roule. */
  const vol=document.createElement('div');vol.className='vol';vol.innerHTML='<i>◀</i><span class="curseur"></span><i>▶</i>';
  let volId=null;
  const majVol=ev=>{const r=vol.getBoundingClientRect(), c=r.left+r.width/2;let v=(ev.clientX-c)/(r.width*0.42);
    v=Math.max(-1,Math.min(1,v));if(Math.abs(v)<0.07)v=0;CMDS.volant=v;vol.style.setProperty('--v',v.toFixed(3));vol.classList.toggle('on',v!==0);};
  vol.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();try{vol.setPointerCapture(ev.pointerId);}catch(x){}volId=ev.pointerId;majVol(ev);});
  vol.addEventListener('pointermove',ev=>{if(ev.pointerId===volId)majVol(ev);});
  const lacherVol=ev=>{if(ev.pointerId===volId){volId=null;CMDS.volant=0;vol.style.setProperty('--v','0');vol.classList.remove('on');}};
  vol.addEventListener('pointerup',lacherVol);vol.addEventListener('pointercancel',lacherVol);vol.addEventListener('lostpointercapture',lacherVol);
  vol.addEventListener('touchstart',ev=>ev.preventDefault(),{passive:false});vol.addEventListener('contextmenu',ev=>ev.preventDefault());
  pad.appendChild(vol);
  const B=[['gaz','gaz','GAZ'],['frein','frein','FREIN<small>tap : drift</small>']];
  if(E.stats&&E.stats.nitro)B.push(['nitro','nitro','N₂O']);
  const enfonces=new Map();      /* pointerId → commande */
  const dose=(b,ev)=>{const r=b.getBoundingClientRect();return Math.max(0.35,Math.min(1,0.35+0.65*(r.bottom-ev.clientY)/r.height));};
  const maj=()=>{CMDS.drift=false;let gz=0,fr=0;for(const [id,k] of enfonces){if(k.k==='drift')CMDS.drift=true;if(k.k==='gaz')gz=Math.max(gz,k.v);if(k.k==='frein')fr=Math.max(fr,k.v);}
    CMDS.gaz=gz;CMDS.frein=fr;
    pad.querySelectorAll('button').forEach(b=>{const on=[...enfonces.values()].some(k=>k.k===b.dataset.k);b.classList.toggle('on',on);
      if(b.dataset.k==='gaz')b.style.setProperty('--p',Math.round(gz*100)+'%');if(b.dataset.k==='frein')b.style.setProperty('--p',Math.round(fr*100)+'%');});};
  for(const [k,cl,txt] of B){
    const b=document.createElement('button');b.className=cl;b.dataset.k=k;b.innerHTML='<span>'+txt+'</span>';b.setAttribute('aria-label',txt);
    b.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();try{b.setPointerCapture(ev.pointerId);}catch(x){}enfonces.set(ev.pointerId,{k,v:dose(b,ev)});if(k==='nitro')CMDS.nitro=true;maj();});
    b.addEventListener('pointermove',ev=>{const o=enfonces.get(ev.pointerId);if(o&&(k==='gaz'||k==='frein')){o.v=dose(b,ev);maj();}});
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
  let vu=false;try{vu=localStorage.getItem('bdl.tk.aide6')==='1';}catch(x){}
  if(!vu){const a=document.createElement('div');a.id='tkAide';
    a.innerHTML=MODE_CMD==='boutons'?'<b>Glisse le doigt</b> sur la bande de gauche pour tourner : plus loin = plus fort.<br><b>GAZ</b> et <b>FREIN</b> se dosent : bas = doux, haut = à fond.<br><b>DRIFT</b> : en tournant, <b>un petit coup de FREIN</b> (ou braque à fond, vite). Ensuite le volant règle l’angle : vers l’intérieur = plus serré. Les gaz gardent la vitesse.<br><b>Volant au centre</b> pour sortir. Finis <b>sans toucher</b> : turbo et points !'
      :'<b>Pouce gauche</b> : la direction, la voiture accélère toute seule.<br><b>DRIFT</b> : maintiens-le en tournant.<br>Finis le drift <b>sans toucher</b> : turbo et points !';
    document.body.appendChild(a);setTimeout(()=>{a.style.opacity='0';setTimeout(()=>a.remove(),700);},6500);try{localStorage.setItem('bdl.tk.aide6','1');}catch(x){}}
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
  if(E.mode==='drift'){const t=ZONE.phase==='decompte'?ZD.duree:Math.max(0,ZONE.t);
    el.innerHTML='<b>'+Math.floor(t/60)+':'+String(Math.ceil(t%60)===60?0:Math.ceil(t%60)).padStart(2,'0')+'</b>'+(ZONE.clip>0?'CLIP ×'+ZONE.clip.toFixed(1):ZONE.use?'FAIS LE HUIT →':'ZONE DE DRIFT')+
      '<small>'+Math.round((E.score||0)+(E.points||0)).toLocaleString('fr-FR')+' PTS · RECORD '+ZONE.record.toLocaleString('fr-FR')+'</small>';return;}
  if(COURSE.actif){
    const L=classement(), rang=L.findIndex(x=>x.joueur)+1;
    const tourAff=Math.min(COURSE.tours,(E.tour==null?0:E.tours)+1);
    el.innerHTML=(COURSE.seul?'<b>CHRONO</b>':'<b>P'+rang+'</b>/'+L.length)+' · TOUR '+(COURSE.phase==='decompte'?1:tourAff)+'/'+COURSE.tours+'<small>'+fmtTour(COURSE.phase==='decompte'?0:(COURSE.fin!=null?COURSE.fin:COURSE.temps))+'</small>';
  }else{
    const rec=chronoRecords()[E.nom];
    el.innerHTML='<b>'+(E.tour!=null?'T'+(E.tours+1):'—')+'</b>'+fmtTour(E.tour)+'<small>★ '+fmtTour(rec)+(E.dernier!=null?' · DERNIER '+fmtTour(E.dernier):'')+(E.limite!=null?' · ESSAI '+Math.floor(E.limite/60)+':'+String(Math.floor(E.limite%60)).padStart(2,'0'):'')+'</small>';
  }
}
/* la mini-carte : le tracé, et un point par voiture */
function dessinerCarte(){
  const cv=document.getElementById('tkCarte');if(!cv)return;
  const now=performance.now();if(dessinerCarte.t&&now-dessinerCarte.t<90)return;dessinerCarte.t=now;
  const B=PISTE.bornes, bw=B[2]-B[0]+60, bh=B[3]-B[1]+60, g=cv.getContext('2d'), Wc=cv.width, Hc=cv.height, k=Math.min((Wc-16)/bw,(Hc-16)/bh), ox=8+(Wc-16-bw*k)/2-(B[0]-30)*k, oy=8+(Hc-16-bh*k)/2-(B[1]-30)*k;
  if(!dessinerCarte.fond){const f=document.createElement('canvas');f.width=Wc;f.height=Hc;const fg=f.getContext('2d');
    fg.strokeStyle='rgba(255,255,255,.32)';fg.lineWidth=7;fg.lineJoin='round';fg.beginPath();
    PISTE.pts.forEach((p,i)=>{const X=ox+p.x*k, Y=oy+p.y*k;i?fg.lineTo(X,Y):fg.moveTo(X,Y);});fg.closePath();fg.stroke();
    {const q=pointPiste(PISTE.ligneS);fg.fillStyle='#fff';fg.beginPath();fg.arc(ox+q.x*k,oy+q.y*k,5,0,7);fg.fill();}dessinerCarte.fond=f;}
  g.clearRect(0,0,Wc,Hc);g.drawImage(dessinerCarte.fond,0,0);
  if(COURSE.actif)for(const c of COURSE.voitures){g.fillStyle=c.type==='trafic'?'rgba(200,200,210,.6)':'#7fe8ff';g.beginPath();g.arc(ox+c.x*k,oy+c.y*k,c.type==='trafic'?4:6,0,7);g.fill();}
  const E=ESSAI;g.fillStyle='#ff4fb0';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(ox+E.x*k,oy+E.y*k,8,0,7);g.fill();g.stroke();
}

/* ================= LE CHRONO DU MODE LIBRE ================= */
function chronoRecords(){try{return JSON.parse(localStorage.getItem('bdl.tk.records3')||'{}')||{};}catch(x){return {};}}
function fmtTour(t){if(t==null)return '–:––.––';const m=Math.floor(t/60), sec=t-m*60;return m+':'+(sec<10?'0':'')+sec.toFixed(2);}
function chronoPas(sAv,sAp,dt){
  const E=ESSAI, P=PISTE;
  if(E.tour!=null)E.tour+=dt;
  if(sAv==null||sAp==null)return;
  const rel=s=>(((s-P.ligneS)%P.L)+P.L)%P.L, r0=rel(sAv), r1=rel(sAp);
  /* trois points de passage, au quart, à la moitié et aux trois quarts du tour */
  if(E.cp<3&&r1>(E.cp+1)*P.L/4&&r1<(E.cp+1)*P.L/4+900)E.cp++;
  /* la ligne : on passe de la fin du tour au début, en avançant */
  if(r0>P.L-250&&r1<250){
    if(E.tour!=null&&E.cp>=3){
      const t=E.tour;E.dernier=t;E.tours++;
      const R=chronoRecords(), cle=E.nom+(enVille()?'':' @'+CIR.id);
      if(R[cle]==null||t<R[cle]){R[cle]=t;try{localStorage.setItem('bdl.tk.records3',JSON.stringify(R));}catch(x){}
        popDrift('RECORD · '+fmtTour(t),'#ffd98a');}
      else popDrift(fmtTour(t),'#9ae8ff');
    }
    if(E.tour==null||E.cp>=3){E.tour=0;E.cp=0;}
  }
}

/* le sol de la zone de drift (dessiné dans le sol du jeu et dans la toile fine) */
function dessinerZoneSol(g,A){
  /* LA ZONE DE DRIFT, au milieu du serpentin : asphalte sombre, murs de pneus, deux poteaux et leurs anneaux */
  const PK={x0:ZD.x0,y0:ZD.y0,x1:ZD.x1,y1:ZD.y1};
  g.fillStyle='#4f8a4a';g.fillRect(PK.x0-14,PK.y0-14,PK.x1-PK.x0+28,PK.y1-PK.y0+28);
  g.fillStyle='#3d3c47';g.fillRect(PK.x0,PK.y0,PK.x1-PK.x0,PK.y1-PK.y0);
  for(let i=0;i<1400;i++){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(PK.x0+Math.floor(A(i+300)*(PK.x1-PK.x0)),PK.y0+Math.floor(A(i+700)*(PK.y1-PK.y0)),2,1);}
  /* des cercles de gomme des anciennes manches */
  g.strokeStyle='rgba(10,8,14,.25)';g.lineWidth=3;
  for(const [px,py] of ZD.poteaux)for(const r0 of [62,80,96]){g.beginPath();g.arc(px+(A(r0)-0.5)*10,py+(A(r0+1)-0.5)*10,r0,0,7);g.stroke();}
  /* le marquage : la zone de clip en pointillés, le huit, le départ */
  g.save();g.setLineDash([8,8]);g.strokeStyle='rgba(255,79,176,.55)';g.lineWidth=2;
  for(const [px,py] of ZD.poteaux){g.beginPath();g.arc(px,py,40,0,7);g.stroke();g.beginPath();g.arc(px,py,110,0,7);g.stroke();}
  g.restore();
  g.fillStyle='rgba(235,235,245,.65)';g.fillRect(470,1040,60,3);
  g.globalAlpha=.22;g.fillStyle='#ff4fb0';g.font='bold 34px sans-serif';g.textAlign='center';g.fillText('DRIFT',500,470);
  g.font='bold 13px sans-serif';g.fillText('東京 · ZONE',500,490);g.textAlign='start';g.globalAlpha=1;
  /* les poteaux : des piles de pneus */
  for(const [px,py] of ZD.poteaux){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(px+3,py+3,17,0,7);g.fill();
    for(const [r0,c0] of [[16,'#16141c'],[12,'#2a2833'],[8,'#16141c'],[4,'#e0263a']]){g.fillStyle=c0;g.beginPath();g.arc(px,py,r0,0,7);g.fill();}}
  /* les murs de pneus tout autour */
  const pneu=(x,y,k)=>{g.fillStyle='#16141c';g.beginPath();g.arc(x,y,5,0,7);g.fill();g.fillStyle=k%2?'#e0263a':'#f4f2f6';g.beginPath();g.arc(x,y,2.5,0,7);g.fill();};
  let kk=0;for(let x=PK.x0;x<=PK.x1;x+=11){pneu(x,PK.y0-5,kk++);pneu(x,PK.y1+5,kk++);}
  for(let y=PK.y0;y<=PK.y1;y+=11){pneu(PK.x0-5,y,kk++);pneu(PK.x1+5,y,kk++);}
}
/* ================= LE CIRCUIT EN HAUTE DÉFINITION =================
   Une seconde toile, deux fois plus fine que le sol du jeu, qui couvre tout ce
   qui est sous la ville (y ≥ HD_Y0). C'est elle que la caméra de course dessine
   par-dessus le sol ; à pied, on la recopie réduite dans le sol du jeu.
   Calques : la ville basse (dalles), les pelouses tondues en bandes, la piste
   (grain d'asphalte, gomme aux cordes, lignes continues, vibreurs en relief),
   la grille et le damier, les arbres en volume, les immeubles vus du ciel, la
   tribune, les portiques (leur ombre ici, leur poutre au-dessus des voitures). */
const HD_K=2, HD_Y0=238;
let TK_HD=null;
const PORTIQUES=[{s:null,t:'START',c:'#ff4fb0'},{s:1800,t:'東京 DRIFT CITY',c:'#7fe8ff'},{s:3700,t:'TURBO · NEON',c:'#ffd21f'},{s:6050,t:'BATTLE DOCK',c:'#ff7a1a'}];
function decalPiste(p,o){return [p.x-Math.sin(p.ang)*o,p.y+Math.cos(p.ang)*o];}
/* ================= LA DISPOSITION DU DÉCOR (calculée une fois) =================
   Pour chaque case de 24 de la carte, la distance à la piste ; puis la place des
   immeubles (loin de la piste) et des arbres (plus près). Les immeubles et la
   tribune sont en dur (BATIS_TK), leurs néons s'allument la nuit (FEUX_TK). */
const BATIS_TK=[];
let DISPO=null;
function disposerCircuit(){
  if(DISPO)return DISPO;
  const W=MONDE_L,H=MONDE_H,P=PISTE_TK.pts,ep=CIRCUIT.ep,C=24, A=i=>alea(i*1.37+0.5);
  const nx=Math.ceil(W/C), ny=Math.ceil(H/C), dist=new Float32Array(nx*ny);
  for(let j=0;j<ny;j++){const y=j*C+C/2;if(y<340){dist.fill(0,j*nx,(j+1)*nx);continue;}
    for(let i=0;i<nx;i++){const x=i*C+C/2;let m=1e9;
      for(let k=0;k<P.length;k+=3){const dx=P[k].x-x,dy=P[k].y-y,d=dx*dx+dy*dy;if(d<m)m=d;}dist[j*nx+i]=Math.sqrt(m);}}
  const libre=(i,j)=>{if(i<0||j<0||i>=nx||j>=ny)return false;const x=i*C, y=j*C;
    if(y<372)return false;if(x<150&&y<500)return false;
    if(x+C>840&&y+C>420&&y<2210)return false;
    if(x+C>ZD.x0-30&&x<ZD.x1+30&&y+C>ZD.y0-30&&y<ZD.y1+30)return false;
    return dist[j*nx+i]>ep/2+30;};
  const pris=new Uint8Array(nx*ny), batis=[], arbres=[];
  const neons=['rgba(255,79,176,§)','rgba(127,232,255,§)','rgba(255,214,120,§)','rgba(176,140,255,§)'];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    if(pris[j*nx+i]||!libre(i,j)||dist[j*nx+i]<ep/2+95)continue;
    let w=1,h=1;
    while(w<4&&libre(i+w,j)&&!pris[j*nx+i+w]&&dist[j*nx+i+w]>=ep/2+95)w++;
    let ok=true;while(h<4&&ok){for(let k=0;k<w;k++)if(!libre(i+k,j+h)||pris[(j+h)*nx+i+k]||dist[(j+h)*nx+i+k]<ep/2+95){ok=false;break;}if(ok)h++;}
    for(let b=0;b<h;b++)for(let a=0;a<w;a++)pris[(j+b)*nx+i+a]=1;
    if(w*h<2)continue;
    const b={x:i*C+3,y:j*C+3,L:w*C-6,H:h*C-6,s:A(i*7.3+j*3.1),i,j};
    b.neon=b.s<0.55?neons[Math.floor(A(b.s*99)*neons.length)]:null;
    batis.push(b);BATIS_TK.push({x0:b.x,y0:b.y,x1:b.x+b.L,y1:b.y+b.H});
    if(b.neon)FEUX_TK.push([b.x+b.L/2,b.y+b.H/2,b.neon,Math.max(b.L,b.H)*0.75]);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    if(pris[j*nx+i]||!libre(i,j))continue;
    const s=A(i*5.7+j*9.1);if(s<0.35)continue;
    arbres.push({x:i*C+C/2+(A(i+j*1.3)-0.5)*10,y:j*C+C/2+(A(j+i*1.7)-0.5)*10,r:7+A(i*j+3)*5,rose:A(i*1.1+j*7.7)<0.32,s});
  }
  BATIS_TK.push({x0:850,y0:430,x1:W,y1:2200});            /* la tribune */
  DISPO={dist,nx,ny,C,batis,arbres};return DISPO;
}
/* le sol du jeu (à pied) : seulement la disposition ; le dessin vient de la toile fine */
function decorerCircuit(g,A){disposerCircuit();}
/* des motifs qui remplacent des dizaines de milliers de petits points */
function motif(g,taille,f){const c=document.createElement('canvas');c.width=c.height=taille;const q=c.getContext('2d');f(q,taille);
  const p=g.createPattern(c,'repeat');try{p.setTransform(new DOMMatrix([1/HD_K,0,0,1/HD_K,0,0]));}catch(x){}return p;}
/* les arbres : quelques modèles peints une fois, puis posés */
function spritesArbres(){
  const L=[];const A=i=>alea(i*1.37+0.5);
  for(let v=0;v<12;v++){const rose=v<4, r=7+(v%4)*1.5, s=A(v*3.7), K=HD_K, T=Math.ceil((r*2+10)*K);
    const c=document.createElement('canvas');c.width=c.height=T;const g=c.getContext('2d');g.scale(K,K);const x=r+3,y=r+3;
    const col=rose?['#7a2f5c','#b8508a','#df7fb0','#f6b4d2','#ffe0ee']:['#173a22','#245a31','#377a41','#55a058','#8cd07a'];
    g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(x+5,y+5,r*1.05,r*0.95,0,0,7);g.fill();
    g.fillStyle=col[0];g.beginPath();g.arc(x,y,r,0,7);g.fill();
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2+s*6;g.fillStyle=col[1];g.beginPath();g.arc(x+Math.cos(a)*r*0.45-0.5,y+Math.sin(a)*r*0.45-0.5,r*0.52,0,7);g.fill();}
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2+s*3;g.fillStyle=col[2];g.beginPath();g.arc(x+Math.cos(a)*r*0.32-1.2,y+Math.sin(a)*r*0.32-1.2,r*0.38,0,7);g.fill();}
    g.fillStyle=col[3];g.beginPath();g.arc(x-r*0.3,y-r*0.3,r*0.3,0,7);g.fill();
    for(let k=0;k<6;k++){g.fillStyle=col[4];g.fillRect(x-r*0.55+A(k+v*20)*r*0.7,y-r*0.55+A(k*2+v*30)*r*0.7,0.8,0.8);}
    L.push({c,r,rose,dx:-(r+3),dy:-(r+3),T:T/K});}
  return L;
}
/* ================= LA TOILE FINE, CONSTRUITE PAR PETITS MORCEAUX =================
   Une étape par tâche (le téléphone respire entre deux) ; pendant ce temps la
   course et la promenade utilisent le sol ordinaire. */
let HD_EN_COURS=false;
function construireHD(fini){
  if(TK_HD||HD_EN_COURS)return;HD_EN_COURS=true;
  const W=MONDE_L,H=MONDE_H,P=PISTE_TK.pts,ep=CIRCUIT.ep,N=P.length, A=i=>alea(i*1.37+0.5);
  const c=document.createElement('canvas');c.width=W*HD_K;c.height=(H-HD_Y0)*HD_K;
  const g=c.getContext('2d');
  const D=disposerCircuit();
  const chemin=()=>{g.beginPath();P.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();};
  const prep=()=>{g.setTransform(HD_K,0,0,HD_K,0,-HD_Y0*HD_K);g.save();g.beginPath();g.rect(0,HD_Y0,W,H-HD_Y0);g.rect(150,HD_Y0,-150,500-HD_Y0);g.clip('evenodd');};
  const fin=()=>g.restore();
  const etapes=[
    /* la ville basse : dalles claires et taches, en motif */
    ()=>{g.fillStyle=motif(g,40,(q,T)=>{q.fillStyle='#8f8b9e';q.fillRect(0,0,T,T);for(let y=0;y<T;y+=20)for(let x=((y/20)%2)*10;x<T+20;x+=20){const s=A(x*0.31+y*1.7);q.fillStyle=s<0.33?'#aca8b9':s<0.66?'#a29eb0':'#b1adbe';q.fillRect(x+1,y+1,18,18);}
      for(let i=0;i<60;i++){q.fillStyle='rgba(30,26,40,.12)';q.fillRect(A(i*3.3)*T,A(i*7.1)*T,1,1);}});g.fillRect(0,HD_Y0,W,H-HD_Y0);},
    /* les pelouses tondues en bandes */
    ()=>{for(const sd of [1,-1])for(let i=0;i<N;i++){const p=P[i],q=P[(i+1)%N];
      const [ax,ay]=decalPiste(p,sd*ep/2),[bx,by]=decalPiste(q,sd*ep/2),[cx,cy]=decalPiste(q,sd*(ep/2+34)),[dx,dy]=decalPiste(p,sd*(ep/2+34));
      g.fillStyle=(Math.floor(p.s/22)%2)?'#4f9a4c':'#5aa955';g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.lineTo(cx,cy);g.lineTo(dx,dy);g.closePath();g.fill();}
      g.strokeStyle=motif(g,64,(q,T)=>{for(let i=0;i<90;i++){q.fillStyle=A(i*2.3)>.5?'rgba(150,220,120,.35)':'rgba(20,60,20,.25)';q.fillRect(A(i*1.7)*T,A(i*2.9)*T,1,2);}});
      g.lineWidth=ep+66;g.lineJoin='round';chemin();g.stroke();
      g.strokeStyle='#8d8a9c';g.lineWidth=1;for(const o of [ep/2+34,-ep/2-34]){g.beginPath();P.forEach((p,i)=>{const [x,y]=decalPiste(p,o);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.stroke();}},
    /* la piste : asphalte, grain en motif, trajectoire, gomme */
    ()=>{g.lineJoin='round';g.lineCap='round';g.strokeStyle='#3d3c46';g.lineWidth=ep;chemin();g.stroke();
      g.fillStyle='#3d3c46';g.fillRect(0,TK.route[0],CIRCUIT.depart+380,TK.route[1]-TK.route[0]);
      const grain=motif(g,96,(q,T)=>{for(let i=0;i<700;i++){q.fillStyle=A(i*5.3)<0.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.14)';q.fillRect(A(i*1.13)*T,A(i*2.71)*T,1,1);}});
      g.strokeStyle=grain;g.lineWidth=ep;chemin();g.stroke();g.fillStyle=grain;g.fillRect(0,TK.route[0],CIRCUIT.depart+380,TK.route[1]-TK.route[0]);
      g.globalAlpha=.28;g.strokeStyle='#2c2b33';g.lineWidth=30;chemin();g.stroke();g.globalAlpha=1;
      g.fillStyle='rgba(18,16,22,.18)';
      for(let i=0;i<N;i++){const p=P[i];if(!p.k)continue;const corde=p.sg>0?1:-1;
        for(let k=0;k<3;k++){const [x,y]=decalPiste(p,corde*(ep/2-14-k*5)+(A(i+k)-0.5)*3);g.fillRect(x-1,y-1,2,2);}}},
    /* lignes de bord continues, vibreurs en relief */
    ()=>{g.strokeStyle='rgba(240,240,248,.85)';g.lineWidth=1.5;
      for(const o of [ep/2-5,-ep/2+5]){g.beginPath();P.forEach((p,i)=>{const [x,y]=decalPiste(p,o);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.stroke();}
      for(let i=0;i<N;i++){const p=P[i],q=P[(i+1)%N];if(!p.k&&!q.k)continue;
        const rouge=Math.floor(p.s/9)%2;
        for(const sd of [-1,1]){const o0=sd*(ep/2-1),o1=sd*(ep/2-8);
          const [ax,ay]=decalPiste(p,o0),[bx,by]=decalPiste(q,o0),[cx,cy]=decalPiste(q,o1),[dx,dy]=decalPiste(p,o1);
          g.fillStyle=rouge?'#d8213a':'#f2f0f6';g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.lineTo(cx,cy);g.lineTo(dx,dy);g.closePath();g.fill();
          const [ex,ey]=decalPiste(p,sd*(ep/2-5)),[fx,fy]=decalPiste(q,sd*(ep/2-5));
          g.strokeStyle=rouge?'rgba(255,140,150,.5)':'rgba(255,255,255,.9)';g.lineWidth=0.6;g.beginPath();g.moveTo(ex,ey);g.lineTo(fx,fy);g.stroke();}}},
    /* stands, damier, grille, zone de drift, ombres des portiques */
    ()=>{g.fillStyle='rgba(235,230,200,.7)';for(let x=10;x<CIRCUIT.depart-60;x+=40)g.fillRect(x,(TK.route[0]+TK.route[1])/2-0.75,22,1.5);
      const [l0,l1]=TK.route, LX=CIRCUIT.ligne;
      for(let y=l0+2;y<l1-2;y+=4)for(let k=0;k<3;k++){g.fillStyle=((y-l0)/4+k)%2<1?'#f4f2f6':'#14121c';g.fillRect(LX+k*4,y,4,4);}
      g.strokeStyle='rgba(240,240,248,.75)';g.lineWidth=1.2;
      for(let k=1;k<=3;k++)for(const [yy,dx] of [[l0+22,0],[l1-22,-32]]){const gx=LX-k*65+20+dx;g.beginPath();g.moveTo(gx-22,yy-8);g.lineTo(gx,yy-8);g.lineTo(gx,yy+8);g.lineTo(gx-22,yy+8);g.stroke();
        g.fillStyle='rgba(240,240,248,.6)';g.font='bold 7px sans-serif';g.fillText(String(k*2-(dx?0:1)),gx-16,yy+3);}
      try{dessinerZoneSol(g,A);}catch(x){}
      for(const pt of PORTIQUES){const s=pt.s==null?PISTE_TK.ligneS+6:pt.s, p=pointPiste(s,PISTE_TK);
        const [ax,ay]=decalPiste(p,-ep/2-16),[bx,by]=decalPiste(p,ep/2+16);
        g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=9;g.beginPath();g.moveTo(ax+10,ay+12);g.lineTo(bx+10,by+12);g.stroke();}},
    /* la tribune */
    ()=>{const x0=848,x1=W-4,y0=430,y1=2200;
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x0-4,y0+4,x1-x0+4,y1-y0);
      g.fillStyle=motif(g,60,(q,T)=>{q.fillStyle='#2b2a33';q.fillRect(0,0,T,T);const coul=['#ff4fb0','#7fe8ff','#ffd21f','#f4f4f6','#5cff8a','#ff7a1a','#b08cff','#e0263a','#2a2c33'];
        for(let y=0;y<T;y+=10){q.fillStyle='#55545f';q.fillRect(0,y,T,7);q.fillStyle='#6a6975';q.fillRect(0,y,T,1.4);
          for(let x=0;x<T;x+=5)if(A(x*3.1+y*1.7)<0.78){q.fillStyle=coul[Math.floor(A(x+y*2.3)*coul.length)];q.fillRect(x,y+1,3.2,3.2);q.fillStyle='#e8c09a';q.fillRect(x+0.6,y+4.2,2,2);}}});
      g.fillRect(x0,y0,x1-x0-12,y1-y0);
      g.fillStyle='#d9dbe3';g.fillRect(x1-12,y0-4,12,y1-y0+8);g.fillStyle='#b5b8c4';for(let y=y0;y<y1;y+=30)g.fillRect(x1-12,y,12,2);
      for(let y=y0+60;y<y1;y+=240){g.fillStyle='#2a2833';g.fillRect(x1-10,y,8,5);g.fillStyle='#fff6d0';g.fillRect(x1-9,y+1,6,3);}
      const pubs=[['東京','#ff4fb0'],['TURBO','#7fe8ff'],['NEON','#ffd21f'],['DRIFT','#5cff8a'],['BATTLE DOCK','#ff7a1a']];
      for(let y=y0+30,k=0;y<y1-60;y+=150,k++){const [t,cc]=pubs[k%pubs.length];g.fillStyle='#14121c';g.fillRect(x0-3,y,8,70);g.fillStyle=cc;g.fillRect(x0-2,y+1,6,68);
        g.save();g.translate(x0+1,y+35);g.rotate(-Math.PI/2);g.fillStyle='#14121c';g.font='bold 5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,0,0);g.restore();}},
    /* les immeubles */
    ()=>{const toits=[['#4a4757','#5a5768','#3b3946'],['#55505f','#676171','#433f4c'],['#3f4552','#4f5664','#323844'],['#5b5148','#6d6258','#47403a']];
      const gravier=motif(g,48,(q,T)=>{for(let i=0;i<160;i++){q.fillStyle=A(i*1.9)<0.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.09)';q.fillRect(A(i*1.3)*T,A(i*2.1)*T,1,1);}});
      for(const b of D.batis){const {x,y,L,H:Hh,s,i,j}=b, T=toits[Math.floor(s*toits.length)];
        g.fillStyle='rgba(0,0,0,.38)';g.fillRect(x+5,y+6,L,Hh);
        g.fillStyle=T[0];g.fillRect(x,y,L,Hh);g.fillStyle=gravier;g.fillRect(x,y,L,Hh);
        g.fillStyle=T[1];g.fillRect(x,y,L,2);g.fillRect(x,y,2,Hh);g.fillStyle=T[2];g.fillRect(x,y+Hh-2,L,2);g.fillRect(x+L-2,y,2,Hh);
        g.fillStyle=T[1];g.fillRect(x+L-16,y+5,11,9);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+L-16,y+14,11,2);
        const nb=Math.floor(2+s*4);
        for(let k=0;k<nb;k++){const cx=x+5+A(i+k*1.9+j)*(L-22), cy=y+18+A(j+k*2.7+i)*(Hh-26), t=A(k*3.3+i*j);
          if(t<0.4){g.fillStyle='#9a9eae';g.fillRect(cx,cy,9,6);g.fillStyle='#6d7080';g.fillRect(cx+0.5,cy+0.5,8,5);g.strokeStyle='#c4c8d6';g.lineWidth=0.5;g.beginPath();g.arc(cx+4.5,cy+3,2,0,7);g.stroke();g.fillStyle='rgba(0,0,0,.3)';g.fillRect(cx+1,cy+6,9,1);}
          else if(t<0.7){g.fillStyle='#24324a';g.fillRect(cx,cy,12,7);g.strokeStyle='rgba(140,180,230,.5)';g.lineWidth=0.3;for(let u=1;u<12;u+=3){g.beginPath();g.moveTo(cx+u,cy);g.lineTo(cx+u,cy+7);g.stroke();}g.fillStyle='rgba(180,210,255,.25)';g.fillRect(cx,cy,12,1);}
          else{g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.arc(cx+6,cy+6,5,0,7);g.fill();g.fillStyle='#8b8f9c';g.beginPath();g.arc(cx+5,cy+5,5,0,7);g.fill();g.fillStyle='#a9adba';g.beginPath();g.arc(cx+4,cy+4,2.5,0,7);g.fill();}}
        if(s>0.82&&L>=40&&Hh>=40){g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(x+L/2,y+Hh/2,13,0,7);g.fill();g.strokeStyle='rgba(255,220,90,.8)';g.lineWidth=1.2;g.beginPath();g.arc(x+L/2,y+Hh/2,12,0,7);g.stroke();
          g.fillStyle='rgba(255,255,255,.85)';g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('H',x+L/2,y+Hh/2+1);g.textAlign='start';g.textBaseline='alphabetic';}
        if(b.neon){g.fillStyle=b.neon.replace('§','1');g.fillRect(x+0.5,y+0.5,L-1,0.8);g.fillRect(x+0.5,y+Hh-1.3,L-1,0.8);g.fillRect(x+0.5,y+0.5,0.8,Hh-1);g.fillRect(x+L-1.3,y+0.5,0.8,Hh-1);}}},
    /* les arbres : des modèles posés */
    ()=>{const SP=spritesArbres();
      for(const a of D.arbres){const cand=SP.filter(v=>v.rose===a.rose);const v=cand[Math.floor(a.s*97)%cand.length];
        g.drawImage(v.c,a.x+v.dx,a.y+v.dy,v.T,v.T);
        if(a.rose){g.fillStyle='rgba(255,190,220,.8)';for(let k=0;k<4;k++)g.fillRect(a.x+(A(k*7+a.s)-0.5)*a.r*3,a.y+(A(k*9+a.s)-0.5)*a.r*3,0.8,0.8);}}},
    /* la glissière */
    ()=>{const {dist,nx,ny,C}=D;
      for(const sd of [-1,1]){let prev=null;g.lineCap='round';
        for(let k=0;k<P.length;k++){const p=P[k];const [x,y]=decalPiste(p,sd*(ep/2+36));
          const ii=Math.floor(x/C), jj=Math.floor(y/C);
          const ok=p.y>345&&x>4&&x<W-4&&y<H-4&&!(x>ZD.x0-16&&x<ZD.x1+16&&y>ZD.y0-16&&y<ZD.y1+16)&&ii>=0&&jj>=0&&ii<nx&&jj<ny&&dist[jj*nx+ii]>=ep/2+20&&!(x<150&&y<500);
          if(ok&&prev){g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;g.beginPath();g.moveTo(prev[0]+1.5,prev[1]+1.5);g.lineTo(x+1.5,y+1.5);g.stroke();
            g.strokeStyle='#cfd2dc';g.lineWidth=1.2;g.beginPath();g.moveTo(prev[0],prev[1]);g.lineTo(x,y);g.stroke();}
          if(ok&&k%5===0){g.fillStyle='#5d606e';g.fillRect(x-1,y-1,2,2);}
          prev=ok?[x,y]:null;}}}
  ];
  let i=0;
  const suite=()=>{
    const t0=performance.now();
    while(i<etapes.length&&performance.now()-t0<12){prep();try{etapes[i]();}catch(x){console.warn(x);}fin();i++;}
    if(i<etapes.length){setTimeout(suite,16);return;}
    TK_HD=c;HD_EN_COURS=false;try{fini&&fini(c);}catch(x){}
  };
  setTimeout(suite,16);
}
/* les portiques au-dessus de la piste : la poutre, la banderole, les piliers (après les voitures) */
function dessinerPortiques(ctx,x0,y0,x1,y1){
  const ep=CIRCUIT.ep, T=performance.now()/1000;
  for(const pt of PORTIQUES){const s=pt.s==null?PISTE_TK.ligneS+6:pt.s, p=pointPiste(s,PISTE_TK);
    if(p.x<x0-80||p.x>x1+80||p.y<y0-80||p.y>y1+80)continue;
    const [ax,ay]=decalPiste(p,-ep/2-16),[bx,by]=decalPiste(p,ep/2+16);
    ctx.save();
    ctx.strokeStyle='#2a2833';ctx.lineWidth=9;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
    ctx.strokeStyle=pt.c;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
    /* le texte de la banderole, le long de la poutre */
    ctx.translate((ax+bx)/2,(ay+by)/2);ctx.rotate(Math.atan2(by-ay,bx-ax));
    ctx.fillStyle='#14121c';ctx.font='bold 5px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(pt.t,0,0.3);
    if(pt.s==null){for(let k=-2;k<=2;k++){const on=(Math.floor(T*2)+k)%2===0;ctx.fillStyle=on?'#ff3b3b':'#5a1a1e';ctx.beginPath();ctx.arc(k*12,-6,1.8,0,7);ctx.fill();}}
    ctx.restore();
    for(const [x,y] of [[ax,ay],[bx,by]]){ctx.fillStyle='#16141c';ctx.fillRect(x-4,y-4,8,8);ctx.fillStyle='#55535f';ctx.fillRect(x-3,y-3,6,6);ctx.fillStyle='#8a8896';ctx.fillRect(x-3,y-3,6,1.5);}
  }
}

/* ================= LA ZONE DE DRIFT =================
   Au milieu du serpentin, une aire fermée par des murs de pneus. Deux poteaux
   (des piles de pneus) à contourner en huit, entourés chacun d'un anneau de
   six cônes. Une manche dure 60 secondes :
   — les points de drift habituels (angle × vitesse × maîtrise × combo) ;
   — CLIP : glisser près d'un poteau (entre 40 et 110 unités du centre)
     multiplie les points, jusqu'à ×2 au ras des cônes ;
   — un cône renversé coûte 250 points et casse le drift en cours ;
   — toucher un mur perd le drift en cours (comme partout).
   À la fin : une note de juge (D à SS), le record, et une prime du serveur. */
const ZD={x0:350,y0:400,x1:650,y1:1100,poteaux:[[500,610],[500,890]],duree:60};
const ZONE={phase:'',t:0,cones:[],clip:0,record:0,fin:false};
const NOTES_ZD=[[90000,'SS','#ff4fb0'],[60000,'S','#ffd98a'],[35000,'A','#5cff8a'],[15000,'B','#7fe8ff'],[5000,'C','#c9ccd8'],[0,'D','#8a8794']];
function noteZone(sc){for(const n of NOTES_ZD)if(sc>=n[0])return n;return NOTES_ZD[NOTES_ZD.length-1];}
function zoneRecord(){try{return +localStorage.getItem('bdl.tk.zone')||0;}catch(x){return 0;}}
function dansZone(x,y,m){return x>ZD.x0+m&&x<ZD.x1-m&&y>ZD.y0+m&&y<ZD.y1-m;}
function preparerZone(){
  const E=ESSAI;
  ZONE.phase='decompte';ZONE.t=3;ZONE.fin=false;ZONE.clip=0;ZONE.poteau=-1;ZONE.balaye=0;ZONE.record=zoneRecord();ZONE.cones=[];
  for(const [px,py] of ZD.poteaux)for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.26;ZONE.cones.push({x:px+Math.cos(a)*34,y:py+Math.sin(a)*34,vx:0,vy:0,a:0,va:0,tombe:false});}
  E.x=500;E.y=1058;E.ang=-Math.PI/2;E.vx=0;E.vy=0;
  decompteMontrer(3);
}
/* un pas de la manche : les cônes, le clip */
function pasZone(dt){
  const E=ESSAI;
  let dmin=1e9;for(const [px,py] of ZD.poteaux)dmin=Math.min(dmin,Math.hypot(E.x-px,E.y-py));
  let ip=0,dp=1e9;ZD.poteaux.forEach(([px,py],i)=>{const d=Math.hypot(E.x-px,E.y-py);if(d<dp){dp=d;ip=i;}});
  /* l'angle balayé autour du poteau : un tour complet sur le même, et le clip s'éteint jusqu'à l'autre poteau */
  if(dp<=130){const [px,py]=ZD.poteaux[ip], a=Math.atan2(E.y-py,E.x-px);
    if(ZONE.poteau!==ip){ZONE.poteau=ip;ZONE.balaye=0;ZONE.aPrec=a;}
    else{let da=a-ZONE.aPrec;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;ZONE.balaye+=Math.abs(da);ZONE.aPrec=a;}}
  const usé=ZONE.balaye>Math.PI*2.2;
  ZONE.clip=(E.glisse&&dmin>=40&&dmin<=110&&!usé)?1+(110-dmin)/70:0;
  ZONE.use=usé&&E.glisse&&dmin<=110;
  for(const c of ZONE.cones){
    if(!c.tombe&&Math.hypot(E.x-c.x,E.y-c.y)<24){
      c.tombe=true;c.vx=E.vx*1.1+(Math.random()-0.5)*60;c.vy=E.vy*1.1+(Math.random()-0.5)*60;c.va=(Math.random()-0.5)*20;
      if(ZONE.phase==='run'){E.score=Math.max(0,(E.score||0)-250);E.points=0;E.combo=1;E.finCombo=0;E.propre=false;popDrift('CÔNE −250','#ff9a3c');
        try{navigator.vibrate&&navigator.vibrate(25);}catch(x){}}}
    if(c.tombe){c.x+=c.vx*dt;c.y+=c.vy*dt;c.a+=c.va*dt;const f=Math.exp(-2.5*dt);c.vx*=f;c.vy*=f;c.va*=f;
      c.x=Math.max(ZD.x0+6,Math.min(ZD.x1-6,c.x));c.y=Math.max(ZD.y0+6,Math.min(ZD.y1-6,c.y));}
  }
}
function majZoneHorsPas(dt){
  if(ZONE.phase==='decompte'){
    const avant=Math.ceil(ZONE.t);ZONE.t-=dt;const apres=Math.ceil(ZONE.t);
    if(apres!==avant&&apres>0){decompteMontrer(apres);sonBip(false);}
    if(ZONE.t<=0){ZONE.phase='run';ZONE.t=ZD.duree;decompteMontrer('GO');sonBip(true);try{navigator.vibrate&&navigator.vibrate(60);}catch(x){}}
  }else if(ZONE.phase==='run'){
    ZONE.t-=dt;
    if(ZONE.t<=0){ZONE.t=0;ZONE.phase='fini';finZone();}
  }
}
async function finZone(){
  const E=ESSAI;
  if(E.glisse)finDeGlisse();
  encaisserCombo();
  const sc=Math.round(E.score||0), [,lettre,coul]=noteZone(sc), rec=zoneRecord(), nouveau=sc>rec;
  if(E.epreuve){resultatEpreuve(sc);return;}
  if(nouveau)try{localStorage.setItem('bdl.tk.zone',String(sc));}catch(x){}
  let el=document.getElementById('tkFin');if(el)el.remove();
  el=document.createElement('div');el.id='tkFin';
  el.innerHTML='<div class="c"><small>ZONE DE DRIFT · 60 S</small><div class="r" style="color:'+coul+'">'+lettre+'</div>'+
    '<div class="t">'+sc.toLocaleString('fr-FR')+' pts'+(nouveau?' · NOUVEAU RECORD':' · record '+rec.toLocaleString('fr-FR'))+'</div>'+
    '<div class="cl" style="text-align:center;font:600 12px -apple-system,sans-serif;color:rgba(255,255,255,.6)">SS 90 000 · S 60 000 · A 35 000 · B 15 000 · C 5 000</div>'+
    '<div class="g" id="tkGain">Le juge envoie ta note…</div>'+
    '<div class="b"><button id="tkRejouer">Rejouer</button><button id="tkQuitter2">Quitter</button></div></div>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
  document.getElementById('tkRejouer').onclick=()=>{el.remove();const g=E.garage, m=E.modele;E.actifAvant=true;debutEssai(m,g,null,'drift');E.actifAvant=false;};
  document.getElementById('tkQuitter2').onclick=()=>{el.remove();finEssai();};
  if(!E.garage){document.getElementById('tkGain').textContent='Manche d’essai : pas de prime.';return;}
  const r=await rpcTK('tokyo_drift_fin',{p_voiture:E.garage.modele,p_score:sc});
  const gz=document.getElementById('tkGain');if(!gz)return;
  if(!r||r.erreur){gz.textContent=(r&&r.erreur)||'La prime n’a pas pu être versée.';return;}
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();sauver();}catch(x){}}
  gz.innerHTML=r.gain>0?'<b>+'+enEuros(r.gain)+'</b> de prime'+(r.plafond?' · plafond du jour atteint':''):(r.plafond?'Plafond du jour atteint : 30 000 € de primes par jour.':'Pas de prime sous 5 000 points.');
}
/* le dessin : l'anneau de clip qui s'allume, les cônes */
function dessinerZoneDrift(ctx){
  const T=performance.now()/1000;
  if(ZONE.clip>0){let b=null,bd=1e9;for(const p of ZD.poteaux){const d=Math.hypot(ESSAI.x-p[0],ESSAI.y-p[1]);if(d<bd){bd=d;b=p;}}
    ctx.save();ctx.strokeStyle='rgba(255,79,176,'+(0.35+0.25*Math.sin(T*12))+')';ctx.lineWidth=4;ctx.setLineDash([10,8]);ctx.lineDashOffset=-T*60;
    ctx.beginPath();ctx.arc(b[0],b[1],75,0,7);ctx.stroke();ctx.restore();}
  for(const c of ZONE.cones){
    ctx.save();ctx.translate(Math.round(c.x),Math.round(c.y));
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.arc(2,2,6,0,7);ctx.fill();
    if(c.tombe){ctx.rotate(c.a);ctx.fillStyle='#ff7a1a';ctx.fillRect(-7,-3,14,6);ctx.fillStyle='#fff';ctx.fillRect(-1,-3,3,6);}
    else{ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,3.5,0,7);ctx.fill();ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.arc(0,0,1.8,0,7);ctx.fill();}
    ctx.restore();}
}

/* ================= LA CAMÉRA DE COURSE =================
   Au volant, c'est tokyo.js qui dessine la scène. La carte ne tourne pas (le nord
   reste en haut : une caméra qui pivote donnait mal au cœur) ; la caméra regarde
   devant la voiture et la suit en douceur, au-dessus des boutons. Le sol vient de la toile du jeu (SOL),
   les lampadaires sont redessinés vus du dessus, la nuit les phares éclairent. */
const CAM_V={a:null,t:0,padH:0,padT:0};
/* AU VOLANT, ON VOIT PLUS LOIN : une échelle fixe, plus large qu'à pied (jamais de zoom qui bouge) */
const VUE_K=0.7;
function dessinerVolant(ctx){
  const E=ESSAI, W=ctx.canvas.width, H=ctx.canvas.height;
  const now=performance.now(), dt=Math.min(0.05,CAM_V.t?(now-CAM_V.t)/1000:0);CAM_V.t=now;
  /* le bas couvert par les boutons, mesuré de temps en temps */
  if(!CAM_V.padT||now-CAM_V.padT>500){CAM_V.padT=now;try{const pr=document.getElementById('tkPad').getBoundingClientRect(), cr=ctx.canvas.getBoundingClientRect();
    CAM_V.padH=Math.max(0,(cr.bottom-pr.top+20)*(W/cr.width));}catch(x){CAM_V.padH=0;}}
  const zone=Math.max(H*0.5,H-CAM_V.padH);
  /* LA CAMÉRA NE TOURNE PAS (le nord reste en haut : pas de mal au cœur). Elle regarde
     devant la voiture, dans le sens où elle va, et glisse vers ce point en douceur. */
  const eV=ECH*(window.__vueK||VUE_K), lxC=Math.max(-W*0.28/eV,Math.min(W*0.28/eV,E.vx*0.45)), lyC=Math.max(-zone*0.3/eV,Math.min(zone*0.3/eV,E.vy*0.45));
  if(CAM_V.lx==null){CAM_V.lx=lxC;CAM_V.ly=lyC;}
  const kc=1-Math.exp(-2.2*dt);CAM_V.lx+=(lxC-CAM_V.lx)*kc;CAM_V.ly+=(lyC-CAM_V.ly)*kc;
  const e2=ECH*(window.__vueK||VUE_K);
  let cx=W/2-CAM_V.lx*e2, cy=zone*0.5-CAM_V.ly*e2;
  /* la vue reste dans la carte : pas de bande noire sur les côtés */
  if(enVille()){const vw=W/e2;if(vw<MONDE_L){const gauche=E.x-cx/e2;if(gauche<0)cx=E.x*e2;else if(gauche+vw>MONDE_L)cx=(E.x-(MONDE_L-vw))*e2;}}
  const sx=SECOUSSE>0.01?(Math.random()-.5)*SECOUSSE*3*e2:0, sy=SECOUSSE>0.01?(Math.random()-.5)*SECOUSSE*3*e2:0;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#17151f';ctx.fillRect(0,0,W,H);
  ctx.setTransform(e2,0,0,e2,Math.round(cx+sx-E.x*e2),Math.round(cy+sy-E.y*e2));
  /* le sol : un carré autour de la voiture, assez grand pour couvrir l'écran tourné */
  const Rv=Math.ceil(Math.hypot(W,H)/e2)+4;
  const nuit=(()=>{try{const C=cielDuMoment();return C?C.lampes:0;}catch(x){return 0;}})();
  if(!enVille()){
    /* LES CIRCUITS À PART : dessinés à la volée autour de la voiture */
    const vx0=Math.floor(E.x-cx/e2-2), vy0=Math.floor(E.y-cy/e2-2), vx1=Math.ceil(E.x+(W-cx)/e2+2), vy1=Math.ceil(E.y+(H-cy)/e2+2);
    try{dessinerCircuitVect(ctx,vx0,vy0,vx1,vy1,nuit);}catch(x){console.warn(x);}
    dessinerEssai(ctx,0,0);
    if(nuit>0.05){const c=Math.cos(E.ang), s2=Math.sin(E.ang);
      try{lueurNuit(ctx,E.x+c*60,E.y+s2*60,70,'rgba(255,240,205,§)');lueurNuit(ctx,E.x+c*120,E.y+s2*120,60,'rgba(255,240,205,§)');lueurNuit(ctx,E.x-c*34,E.y-s2*34,22,'rgba(255,40,50,§)');}catch(x){}
      if(COURSE.actif)for(const o of COURSE.voitures){const c3=Math.cos(o.ang), s3=Math.sin(o.ang);try{lueurNuit(ctx,o.x+c3*55,o.y+s3*55,50,'rgba(255,240,205,§)');}catch(x){}}}
    return;
  }
  const x0=Math.max(0,Math.floor(E.x-cx/e2-2)), y0=Math.max(0,Math.floor(E.y-cy/e2-2)), x1=Math.min(MONDE_L,Math.ceil(E.x+(W-cx)/e2+2)), y1=Math.min(MONDE_H,Math.ceil(E.y+(H-cy)/e2+2));
  ctx.imageSmoothingEnabled=false;
  if(x1>x0&&y1>y0){const src=(typeof SOL_FIN!=='undefined'&&SOL_FIN)?SOL_FIN:SOL, k=src===SOL?1:2;
    ctx.drawImage(src,x0*k,y0*k,(x1-x0)*k,(y1-y0)*k,x0,y0,x1-x0,y1-y0);
    if(TK_HD){const ya=Math.max(y0,HD_Y0);if(y1>ya){ctx.imageSmoothingEnabled=true;ctx.drawImage(TK_HD,x0*HD_K,(ya-HD_Y0)*HD_K,(x1-x0)*HD_K,(y1-ya)*HD_K,x0,ya,x1-x0,y1-ya);ctx.imageSmoothingEnabled=false;}}}
  /* les lampadaires, vus du dessus */
  for(const o of DECOR){if(o.t!=='lanterneP')continue;if(Math.abs(o.x-E.x)>Rv||Math.abs(o.y-E.y)>Rv)continue;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.arc(o.x+3,o.y+3,6,0,7);ctx.fill();
    ctx.fillStyle='#3a3c48';ctx.beginPath();ctx.arc(o.x,o.y,5,0,7);ctx.fill();
    ctx.fillStyle=nuit>0.3?'#fff2c8':'#c9ccd8';ctx.beginPath();ctx.arc(o.x,o.y,3,0,7);ctx.fill();
    if(nuit>0.05)try{lueurNuit(ctx,o.x,o.y,52,'rgba(255,214,150,§)');}catch(x){}}
  try{lumieresTokyo(ctx,0,0);}catch(x){}
  dessinerEssai(ctx,0,0);
  if(typeof dessinerZoneDrift==='function'&&E.mode==='drift')dessinerZoneDrift(ctx);
  try{dessinerPortiques(ctx,x0,y0,x1,y1);}catch(x){}
  /* les phares, la nuit : deux taches devant la voiture */
  if(nuit>0.05){const c=Math.cos(E.ang), s2=Math.sin(E.ang);
    try{lueurNuit(ctx,E.x+c*60,E.y+s2*60,70,'rgba(255,240,205,§)');lueurNuit(ctx,E.x+c*120,E.y+s2*120,60,'rgba(255,240,205,§)');lueurNuit(ctx,E.x-c*34,E.y-s2*34,22,'rgba(255,40,50,§)');}catch(x){}
    if(COURSE.actif)for(const o of COURSE.voitures){const c3=Math.cos(o.ang), s3=Math.sin(o.ang);try{lueurNuit(ctx,o.x+c3*55,o.y+s3*55,50,'rgba(255,240,205,§)');}catch(x){}}}
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
  {const vb=E.vibreur?(((performance.now()/45)|0)%2?0.7:-0.7):0;
    ctx.translate(-(E.pitch||0)+vb*0.5,(E.roll||0)+vb);}
  ctx.drawImage(E.toile,-34,-16);
  /* LES ROUES AVANT BRAQUENT : on les voit tourner avec le volant */
  for(const sy of [-15,15]){ctx.save();ctx.translate(18,sy);ctx.rotate(E.delta||0);
    ctx.fillStyle='#0b0a10';ctx.fillRect(-5,-1.5,10,3);ctx.fillStyle='#4a4a56';ctx.fillRect(-4,sy<0?-1.5:0.5,8,1);ctx.restore();}
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
;({TK,lumieresTokyo,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo,ESSAI,debutEssai,finEssai,majEssai,dessinerEssai,COURSE,CMDS,PISTE,pointPiste,projeter,statsVoiture,dessinerVolant,ZONE,ZD,CIRCUITS,choisirCircuit,lancerEpreuve,LICENCES,carriere,choisirCourse,resultatEpreuve,circuitActif:()=>CIR})
