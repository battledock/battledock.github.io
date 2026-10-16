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
  concessionPorte:{x:126,y0:206,y1:240,l:16},   /* la porte du concessionnaire, en haut à gauche : on se place sur le trottoir */
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
  /* la bordure du trottoir, puis la route, sombre et sans marquage */
  g.fillStyle='#8a86a0';g.fillRect(0,t1,W,2);
  g.fillStyle='#2a2936';g.fillRect(0,t1+2,W,H-t1-2);
  g.fillStyle='rgba(255,255,255,.03)';
  for(let x=0;x<W;x+=50)g.fillRect(x,t1+2,1,H-t1-2);
  for(let yy=t1+2;yy<H;yy+=50)g.fillRect(0,yy,W,1);
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
  $('page2Fond').className='';
  $('page2Fond').innerHTML=
    '<div style="padding:calc(env(safe-area-inset-top,0px) + 18px) 16px 18px;min-height:100%;box-sizing:border-box;background:#f1e8d6;font-family:Georgia,\'Times New Roman\',serif;color:#2a2236">'+
    '<div style="display:flex;align-items:baseline;gap:12px;border-bottom:2px solid #c8413c;padding-bottom:10px">'+
    '<span style="color:#c8413c;font-size:18px">東京展示室</span>'+
    '<b style="font-weight:400;letter-spacing:3px;font-size:15px">SHOWROOM TOKYO</b></div>'+
    '<div id="ccListe" style="display:flex;gap:8px;overflow-x:auto;padding:12px 0"><p style="font-style:italic;color:#7a6e60">Le vendeur sort les fiches…</p></div>'+
    '<div id="ccFiche"></div>'+
    '<button id="ccFermer" style="display:block;width:100%;margin-top:14px;min-height:46px;border:1px solid #2a2236;background:transparent;color:#2a2236;font:700 14px Georgia,serif;letter-spacing:1px">Sortir du showroom</button>'+
    '<div id="ccBulle" style="margin-top:10px;min-height:18px;font-size:13px;color:#c8413c"></div></div>';
  $('page2').classList.add('on');
  $('ccFermer').onclick=fermerConcessionTokyo;
  let vehicules=[];
  try{const r=await fetch('assets/voitures/catalogue.json');vehicules=((await r.json()).vehicules)||[];}catch(x){}
  if(!vehicules.length){$('ccListe').innerHTML='<p style="color:#c8413c">Le catalogue ne répond pas.</p>';return;}
  const sprite=v=>{const p=(v.photos||[]).find(q=>q.role==='sprite_pixel');return p?p.fichier:'';};
  const nomComplet=v=>[v.marque,v.modele].filter(Boolean).join(' ');
  $('ccListe').innerHTML=vehicules.map((v,i)=>
    '<button data-i="'+i+'" style="flex:none;width:118px;padding:8px;border:1px solid #2a223633;background:#fff8ec;cursor:pointer;text-align:left;font:inherit;color:inherit">'+
    '<img src="'+sprite(v)+'" alt="" style="display:block;width:100%;height:auto;image-rendering:pixelated">'+
    '<b style="display:block;font-size:12px;margin-top:6px">'+nomComplet(v)+'</b></button>').join('');
  const fiche=i=>{
    const v=vehicules[i];
    $('ccFiche').innerHTML=
      '<div style="background:radial-gradient(circle,#fff8ec 40%,#e9dcc4 100%);border-radius:50%;padding:18px 0;margin-top:4px">'+
      '<img src="'+sprite(v)+'" alt="'+nomComplet(v)+'" style="display:block;width:70%;max-width:300px;height:auto;margin:0 auto;image-rendering:pixelated"></div>'+
      '<h2 style="margin:12px 0 2px;font-size:20px;font-weight:400">'+nomComplet(v)+'</h2>'+
      '<p style="margin:0;font-size:12px;color:#7a6e60">'+(v.nom_garage?'Nom garage : '+v.nom_garage:'Sans nom de garage')+'</p>'+
      '<p style="margin:8px 0;font-size:11px;letter-spacing:1px;color:#7a6e60">'+(v.tuning?'PEINTURE · ROUES · AILERONS':'BIENTÔT AU SHOWROOM')+'</p>'+
      '<p style="margin:10px 0 0;font-size:18px">¥ ——— <small style="font-size:11px;color:#7a6e60">prix non fixé</small></p>'+
      '<div style="display:flex;gap:10px;margin-top:12px">'+
      '<button id="ccEssai" style="flex:1;min-height:44px;background:none;border:1px solid #2a2236;color:#2a2236;font:700 12px Georgia,serif;letter-spacing:2px">ESSAI</button>'+
      '<button id="ccAcheter" style="flex:1;min-height:44px;background:#c8413c;border:0;color:#fff8ec;font:700 12px Georgia,serif;letter-spacing:2px">ACHETER</button></div>';
    $('ccEssai').onclick=()=>{$('ccBulle').textContent="L'essai n'est pas encore ouvert.";};
    $('ccAcheter').onclick=()=>{$('ccBulle').textContent="Le concessionnaire n'a pas encore fixé de prix pour ce véhicule.";};
  };
  $('ccListe').querySelectorAll('button[data-i]').forEach(b=>{b.onclick=()=>fiche(+b.dataset.i);});
  fiche(0);
}


;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo})
