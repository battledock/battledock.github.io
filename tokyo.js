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
      if(a){ev.stopPropagation();bulle(a.dataset.a==='essai'?"L'essai n'est pas encore ouvert.":"Le prix de ce véhicule n'est pas encore fixé.");return;}
      const i=+c.dataset.i;ouverte=ouverte===i?-1:i;bulle('');dessiner();
    };});
  };
  dessiner();
}

;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo})
