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
  sortie:{x:60,y0:296,y1:420},    /* la sortie, à l'ouest : vers le port */
  arrivee:[84,360]
};

function bloqueTokyo(x,y){
  if(x<6||x>MONDE_L-6)return true;
  if(y<TK.bati+6||y>MONDE_H-6)return true;
  return false;
}

/* le sol nu : un quadrillage très discret, pour voir la taille de la carte */
function construireSolTokyo(){
  const W=MONDE_L,H=MONDE_H;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  g.fillStyle='#2a2936';g.fillRect(0,0,W,H);
  /* LE TROTTOIR, pavé comme celui du port : dalles irrégulières, joints, grain et usure */
  const A=(i)=>alea(i*1.37+0.5);
  const pave=['#5d5a70','#55526a','#625e78','#534f66','#5a5672'];
  const [t0,t1]=TK.trottoir;
  g.fillStyle='#4a4660';g.fillRect(0,t0,W,t1-t0);
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
  /* LA ROUTE : asphalte, deux voies, ligne pointillée au milieu, reflets néon */
  const [r0,r1]=TK.route;
  g.fillStyle='#24232e';g.fillRect(0,r0,W,r1-r0);
  for(let i=0;i<700;i++){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(Math.floor(A(i+50)*W),r0+Math.floor(A(i+90)*(r1-r0)),2,1);}
  const refl=['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'];
  g.globalAlpha=.12;for(let i=0;i<24;i++){g.fillStyle=refl[i%4];g.fillRect(Math.floor(A(i*1.9)*W),r0+6+Math.floor(A(i*3.3)*(r1-r0-12)),30+Math.floor(A(i*5.1)*80),1);}g.globalAlpha=1;
  const ym=(r0+r1)/2|0;
  g.fillStyle='rgba(235,230,200,.75)';for(let x=10;x<W;x+=40)g.fillRect(x,ym-1,22,3);
  g.fillStyle='rgba(235,235,245,.35)';g.fillRect(0,r0+4,W,1);g.fillRect(0,r1-5,W,1);
  /* le trottoir du bas, étroit, puis le parking */
  g.fillStyle='#8a86a0';g.fillRect(0,r1,W,2);
  g.fillStyle='#4a4660';g.fillRect(0,r1+2,W,TK.parking.y0-r1-2);
  for(let x=0;x<W;x+=28){g.fillStyle='rgba(20,16,32,.35)';g.fillRect(x,r1+2,1,TK.parking.y0-r1-2);}
  const Y0=TK.parking.y0;
  g.fillStyle='#2c2b38';g.fillRect(0,Y0,W,H-Y0);
  for(let i=0;i<900;i++){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(Math.floor(A(i+300)*W),Y0+Math.floor(A(i+700)*(H-Y0)),2,1);}
  /* les places : des rangées face à face, séparées par une allée */
  g.fillStyle='rgba(235,235,245,.55)';
  for(let y=Y0+30;y+110<H;y+=160){
    for(let x=40;x<=W-40;x+=40)g.fillRect(x,y,2,50);      /* rangée du haut */
    g.fillRect(40,y+50,W-78,2);
    for(let x=40;x<=W-40;x+=40)g.fillRect(x,y+52,2,50);   /* rangée du bas, dos à dos */
  }
  /* les lampadaires du parking */
  for(const x of [150,450,750])for(const y of [Y0+12,H-24]){
    const l=g.createRadialGradient(x,y,2,x,y,60);l.addColorStop(0,'rgba(255,220,150,.22)');l.addColorStop(1,'rgba(255,220,150,0)');
    g.fillStyle=l;g.fillRect(x-60,y-60,120,120);
    g.fillStyle='#3a3848';g.fillRect(x-3,y-3,6,6);g.fillStyle='#ffe6b0';g.fillRect(x-1,y-1,3,3);
  }
  /* la rangée du haut : ciel de nuit, façades japonaises collées et cerisiers */
  const haut=new Image();
  haut.onload=()=>{g.drawImage(haut,0,0);};
  haut.src='assets/tokyo/rue_haut.png';
  return c;
}

function semerDecorTokyo(){}

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

async function ouvrirConcessionTokyo(){
  if(ouvrirConcessionTokyo.ouvert)return;
  ouvrirConcessionTokyo.ouvert=true;
  /* PLEIN ÉCRAN : la racine est posée en absolu sur toute la page2, et c'est elle
     qui défile ; la barre du bas reste collée, au-dessus de la zone du geste iOS */
  $('page2Fond').className='';
  $('page2Fond').innerHTML=
    '<div id="ccRacine" style="position:absolute;inset:0;display:flex;flex-direction:column;background:#ffffff;color:#14141a;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif">'+
    '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 18px) 16px 16px">'+
      '<small style="display:block;font:700 11px sans-serif;letter-spacing:3px;color:#ff4fb0">TOKYO · CONCESSION</small>'+
      '<b style="display:block;font:800 30px sans-serif;margin:2px 0 12px">Showroom</b>'+
      '<div id="ccFiltres" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:12px;scrollbar-width:none"></div>'+
      '<div id="ccListe" style="display:flex;flex-direction:column;gap:12px"><p style="color:#888">Le vendeur sort les fiches…</p></div>'+
      '<div id="ccBulle" style="min-height:20px;margin-top:12px;font:600 14px sans-serif;color:#d0306f;text-align:center"></div>'+
    '</div>'+
    '<nav style="flex:none;display:flex;border-top:1px solid #ececf0;background:#fff;padding:6px 6px calc(env(safe-area-inset-bottom,0px) + 8px)">'+
      ['Showroom','Mon garage','Tuning','Sortir'].map((t,i)=>'<button data-nav="'+i+'" style="flex:1;min-height:48px;border:0;background:none;font:'+(i===0?'700':'500')+' 12px sans-serif;color:'+(i===0?'#ff4fb0':'#8a8a96')+'">'+(i===0?'● ':'')+t+'</button>').join('')+
    '</nav></div>';
  $('page2').classList.add('on');
  const bulle=t=>{$('ccBulle').textContent=t;};
  $('ccRacine').querySelectorAll('button[data-nav]').forEach(b=>{b.onclick=()=>{
    const i=+b.dataset.nav;
    if(i===3)fermerConcessionTokyo();
    else if(i>0)bulle((i===1?'Ton garage':'Le tuning')+' arrive bientôt.');
  };});
  let vehicules=[];
  try{const r=await fetch('assets/voitures/catalogue.json');vehicules=((await r.json()).vehicules)||[];}catch(x){}
  if(!vehicules.length){$('ccListe').innerHTML='<p style="color:#d0306f">Le catalogue ne répond pas.</p>';return;}
  const ORIGINE={Toyota:'Japonaises',Nissan:'Japonaises',BMW:'Allemandes',Porsche:'Allemandes',Lamborghini:'Italiennes',Ferrari:'Italiennes'};
  const TEINTE={Toyota:'#ffe3e6',Nissan:'#e9ebf1',BMW:'#e1eaff',Porsche:'#eff1f5',Lamborghini:'#e4f6db',Ferrari:'#ffe3e6'};
  const sprite=v=>{const p=(v.photos||[]).find(q=>q.role==='sprite_pixel');return p?p.fichier:'';};
  const nom=v=>[v.marque,v.modele].filter(Boolean).join(' ');
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let filtre='Toutes', ouverte=-1;
  const filtres=['Toutes','Japonaises','Allemandes','Italiennes'];
  const dessiner=()=>{
    $('ccFiltres').innerHTML=filtres.map(f=>'<button data-f="'+f+'" style="flex:none;min-height:40px;padding:0 16px;border-radius:20px;border:0;font:600 14px sans-serif;background:'+(f===filtre?'#14141a':'#f1f1f4')+';color:'+(f===filtre?'#fff':'#14141a')+'">'+f+'</button>').join('');
    $('ccFiltres').querySelectorAll('button').forEach(b=>{b.onclick=()=>{filtre=b.dataset.f;ouverte=-1;dessiner();};});
    $('ccListe').innerHTML=vehicules.map((v,i)=>{
      if(filtre!=='Toutes'&&ORIGINE[v.marque]!==filtre)return '';
      const ouv=i===ouverte;
      return '<div data-i="'+i+'" style="border-radius:22px;padding:14px;background:linear-gradient(135deg,'+(TEINTE[v.marque]||'#f1f1f4')+',#f8f8fa 75%);position:relative;cursor:pointer">'+
        '<img src="'+sprite(v)+'" alt="'+esc(nom(v))+'" style="display:block;width:100%;height:auto;image-rendering:pixelated">'+
        '<b style="display:block;font:800 18px sans-serif;margin-top:6px">'+esc(nom(v))+'</b>'+
        '<small style="color:#6a6a76;font-size:13px">'+(ORIGINE[v.marque]||'').replace(/s$/,'')+(v.tuning?' · personnalisable':'')+(v.nom_garage?' · « '+esc(v.nom_garage)+' »':'')+'</small>'+
        '<span style="position:absolute;right:14px;top:14px;background:#ffffffcc;padding:6px 10px;border-radius:12px;font:700 13px sans-serif">¥ —</span>'+
        (ouv?'<div style="display:flex;gap:10px;margin-top:12px">'+
          '<button data-a="essai" style="flex:1;min-height:50px;border-radius:14px;border:0;background:#14141a14;font:700 15px sans-serif;color:#14141a">Essai</button>'+
          '<button data-a="achat" style="flex:1;min-height:50px;border-radius:14px;border:0;background:#ff4fb0;color:#fff;font:700 15px sans-serif">Acheter</button></div>':'')+
        '</div>';
    }).join('');
    $('ccListe').querySelectorAll('div[data-i]').forEach(c=>{c.onclick=ev=>{
      const a=ev.target.closest('button[data-a]');
      if(a){ev.stopPropagation();
        if(a.dataset.a==='essai'){fermerConcessionTokyo();debutEssai(vehicules[+c.dataset.i]);}
        else bulle("La vente n'est pas encore ouverte : tu peux seulement l'essayer.");
        return;}
      const i=+c.dataset.i;ouverte=ouverte===i?-1:i;bulle('');dessiner();
    };});
  };
  dessiner();
}

/* ================= L'ESSAI : CONDUIRE UNE VOITURE DU SHOWROOM =================
   Vue de dessus. Le joystick donne le CAP voulu : la voiture braque vers lui
   et accélère selon la poussée ; on lâche, elle roule en roue libre et freine.
   LE DRIFT : la vitesse se décompose en avant et en travers. L'adhérence en
   travers est forte d'ordinaire ; à pleine vitesse, quand on braque fort,
   elle s'effondre et l'arrière décroche. Traces de pneus et fumée au sol. */
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
function peindreVoitureDessus(marque){
  const M=MODELES_DESSUS[marque]||MODELES_DESSUS.Toyota;
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
  /* l'habitacle : pare-brise en trapèze, toit, lunette, vitres latérales */
  const verre='#0d1520', verre2='#1c2a3c', ciel='#86b0d8';
  const toit=M.toit==='noir'?['#0e0e12','#1b1b22','#2c2c36']:[M.c[1],M.c[2],M.c[3]];
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
      const t=ady/hv;P(x,y,t>0.72?toit[0]:dy<0&&t>0.2?toit[2]:toit[1]);
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
  if(M.ail!=='levre'){
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
function debutEssai(v){
  ESSAI.actif=true;ESSAI.nom=[v.marque,v.modele].filter(Boolean).join(' ');
  ESSAI.toile=peindreVoitureDessus(v.marque);
  ESSAI.retour={x:joueur.x,y:joueur.y};
  ESSAI.x=200;ESSAI.y=(TK.route[0]+TK.route[1])/2+18;ESSAI.ang=0;ESSAI.vx=0;ESSAI.vy=0;ESSAI.vol=0;
  ESSAI.traces=[];ESSAI.fumee=[];
  joueur.x=ESSAI.x;joueur.y=ESSAI.y;
  montrerCommandes();
}
function finEssai(){
  ESSAI.actif=false;
  cacherCommandes();
  const r=ESSAI.retour||{x:86,y:224};
  const [dx,dy]=degager(r.x,r.y);joueur.x=dx;joueur.y=dy;
}
function majEssai(dt){
  dt=Math.min(dt,0.05);
  const vit=Math.hypot(ESSAI.vx,ESSAI.vy);
  /* 1. LE VOLANT : il revient au centre quand on lâche, sans à-coup */
  const cible=(CMD.d?1:0)-(CMD.g?1:0);
  ESSAI.vol=(ESSAI.vol||0)+(cible-(ESSAI.vol||0))*Math.min(1,9*dt);
  const av0=ESSAI.vx*Math.cos(ESSAI.ang)+ESSAI.vy*Math.sin(ESSAI.ang);
  const prise=Math.min(1,Math.abs(av0)/70);                   /* à l'arrêt, les roues ne font pas tourner */
  ESSAI.ang+=ESSAI.vol*(CMD.main?3.4:2.7)*prise*dt*(av0<-2?-1:1);
  /* 2. LA VITESSE RESTE DANS LE MONDE, relue dans l'axe de la voiture */
  const nx=Math.cos(ESSAI.ang), ny=Math.sin(ESSAI.ang);
  let av=ESSAI.vx*nx+ESSAI.vy*ny;
  let tr=-ESSAI.vx*ny+ESSAI.vy*nx;
  if(CMD.gaz)av+=(av<0?420:250)*dt;
  if(CMD.frein)av-=(av>8?430:150)*dt;                         /* freine, puis recule */
  if(!CMD.gaz&&!CMD.frein)av*=Math.exp(-1.1*dt);
  if(CMD.main)av*=Math.exp(-0.9*dt);
  av=Math.max(-95,Math.min(340,av));
  av*=Math.exp(-0.22*dt);
  /* 3. L'ADHÉRENCE : le frein à main la casse, un grand coup de volant à fond aussi */
  const grip=CMD.main?0.9:(Math.abs(ESSAI.vol)>0.85&&vit>210?2.6:9);
  tr*=Math.exp(-grip*dt);
  ESSAI.vx=av*nx-tr*ny; ESSAI.vy=av*ny+tr*nx;
  const X=ESSAI.x+ESSAI.vx*dt, Y=ESSAI.y+ESSAI.vy*dt;
  if(bloqueTokyo(X,Y)||X<20||X>MONDE_L-20||Y<TK.bati+18||Y>MONDE_H-18){
    ESSAI.vx*=-0.35;ESSAI.vy*=-0.35;      /* le choc : on rebondit, sans traverser */
  }else{ESSAI.x=X;ESSAI.y=Y;}
  /* les traces de pneus et la fumée quand ça glisse */
  if(Math.abs(tr)>45){
    for(const s of [-10,10]){
      const px=ESSAI.x-nx*18-ny*s, py=ESSAI.y-ny*18+nx*s;
      ESSAI.traces.push([px,py,0.55]);
    }
    if(Math.random()<0.6)ESSAI.fumee.push({x:ESSAI.x-nx*24,y:ESSAI.y-ny*24,r:4,vie:0.8});
    if(ESSAI.traces.length>900)ESSAI.traces.splice(0,ESSAI.traces.length-900);
  }
  for(const f of ESSAI.fumee){f.vie-=dt;f.r+=14*dt;}
  ESSAI.fumee=ESSAI.fumee.filter(f=>f.vie>0);
  joueur.x=ESSAI.x;joueur.y=ESSAI.y;
}
function dessinerEssai(ctx,camX,camY){
  ctx.save();
  ctx.fillStyle='rgba(12,10,16,.55)';
  for(const [x,y] of ESSAI.traces)ctx.fillRect(Math.round(x-camX)-1,Math.round(y-camY)-1,2,2);
  ctx.translate(Math.round(ESSAI.x-camX),Math.round(ESSAI.y-camY));
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,3,32,14,ESSAI.ang,0,7);ctx.fill();
  ctx.rotate(ESSAI.ang);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(ESSAI.toile,-34,-16);
  ctx.restore();
  ctx.save();
  for(const f of ESSAI.fumee){ctx.fillStyle='rgba(220,220,230,'+(f.vie*0.4)+')';ctx.beginPath();ctx.arc(f.x-camX,f.y-camY,f.r,0,7);ctx.fill();}
  ctx.restore();
}

;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo,ESSAI,debutEssai,finEssai,majEssai,dessinerEssai})
