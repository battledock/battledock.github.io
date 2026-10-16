/* ================= TOKYO, LA VILLE DE TOUS LES POSSIBLES =================
   Carte de jeu.html (CARTE==='tokyo'), sur le modèle du port : un sol peint,
   une bloque() qui retient le joueur, et les interactions dans majAction().
   Pas de DECOR : tout le décor est peint dans le sol, les obstacles sont
   listés dans TK.blocs. Le joystick est celui de tout le jeu.

   Le monde : une rue de neuf cents pixels de large en bas, des façades
   néon en haut (on ne marche pas dedans), une autoroute en bas (réservée
   aux véhicules, pas encore faits dans cette carte). */

const TK={
  bati:206,                       /* le pied des façades du nord : au-dessus, rien ne marche */
  trotN:[206,236], avenue:[236,400], trotS:[400,452],
  rangee:452, bas:492,            /* la rangée des boutiques ; au-delà, la glissière et l'autoroute */
  /* tout ce qui barre le passage : [x0, y0, x1, y1] */
  blocs:[
    [40,452,210,500],[250,452,420,500],[470,452,590,500],
    [620,452,770,500],[810,452,980,500],[1020,452,1190,500],[1220,452,1340,500],
    [146,228,154,238],[446,228,454,238],[746,228,754,238],[1046,228,1054,238],[1296,228,1304,238],
    [556,300,572,316],[1096,300,1112,316]
  ],
  /* la porte de l'armurerie, dans la façade ; on se place devant pour entrer */
  porte:{x:695,y0:418,y1:462,l:52},
  /* la sortie, à l'ouest : le panneau vers le port */
  sortie:{x:60,y0:296,y1:420},
  arrivee:[84,360]
};

function bloqueTokyo(x,y){
  if(x<6||x>MONDE_L-6)return true;
  if(y<TK.bati+6)return true;
  if(y>TK.bas-8)return true;
  for(const [x0,y0,x1,y1] of TK.blocs){
    if(x>x0-6&&x<x1+6&&y>y0-6&&y<y1+6)return true;
  }
  return false;
}

function construireSolTokyo(){
  const W=MONDE_L,H=MONDE_H;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const A=(i)=>alea(i*1.37+0.21);
  const neon=(x,y,w,h,col)=>{g.save();g.shadowColor=col;g.shadowBlur=10;g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));g.restore();};
  const txt=(s,x,y,col,px)=>{g.save();g.font='bold '+px+'px monospace';g.textBaseline='top';
    g.shadowColor=col;g.shadowBlur=8;g.fillStyle=col;g.fillText(s,x,y);g.restore();};

  /* 1. LE CIEL DE NUIT, puis les façades, du plus loin au plus proche */
  for(let y=0;y<TK.bati;y++){const k=y/TK.bati;
    R(0,y,W,1,'rgb('+(12+k*30|0)+','+(8+k*8|0)+','+(32+k*36|0)+')');}
  for(let i=0;i<70;i++)R(A(i)*W,A(i+90)*70,1,1,'rgba(230,230,255,.6)');
  const fenetres=['#ffd98a','#7fe8ff','#ff4fb0','#b08cff','#ffffff'];
  [[2,'#221c40',150,0.45],[1,'#2a2148',176,0.6],[0,'#33264f',194,0.8]].forEach(([rg,col,base,densite],k)=>{
    let x=-((rg*37)%50), i=0;
    while(x<W){
      const w=32+Math.floor(A(i+rg*100)*60), h=38+Math.floor(A(i*2.3+rg*7)*(rg===2?80:60));
      R(x,base-h,w,h+40,col);
      R(x,base-h,w,1,'rgba(255,255,255,.10)');
      for(let wy=base-h+6;wy<base-4;wy+=7)for(let wx=x+4;wx<x+w-4;wx+=6){
        if(A(wx*3.1+wy*1.7+rg)<(rg===0?0.42:0.25))R(wx,wy,3,3,fenetres[(A(wx+wy*2)*fenetres.length)|0]);}
      x+=w+2;i++;
    }
  });
  /* les enseignes verticales, sur les façades du premier plan */
  [[60,'#ff4fb0',34],[318,'#7fe8ff',28],[600,'#ffd98a',40],[930,'#b08cff',30],[1180,'#ff4fb0',36]].forEach(([x,col,h])=>{
    neon(x,112,4,h,col);neon(x-3,112+h,10,2,col);
  });
  txt('TOKYO',560,44,'#ff4fb0',34);
  txt('LA VILLE DE TOUS LES POSSIBLES',470,88,'#7fe8ff',10);

  /* 2. LES TROTTOIRS et la rue */
  const paver=(y0,y1,c1,c2)=>{for(let y=y0;y<y1;y+=6){const d=((y/6)%2)?12:0;
    for(let x=-d;x<W;x+=24){R(x+1,y+1,22,5,A(x*0.31+y*0.7)>0.5?c1:c2);R(x,y,24,1,'rgba(0,0,0,.28)');}}};
  paver(TK.trotN[0],TK.trotN[1],'#5d5a70','#55526a');
  R(0,TK.avenue[0],W,TK.avenue[1]-TK.avenue[0],'#2a2936');
  for(let i=0;i<900;i++)R(A(i)*W,TK.avenue[0]+A(i+40)*(TK.avenue[1]-TK.avenue[0]),2,1,'rgba(255,255,255,.04)');
  /* les reflets des néons sur l'asphalte mouillé */
  const refl=['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'];
  g.globalAlpha=0.12;
  for(let i=0;i<46;i++)R(A(i*1.9)*W,240+A(i*3.3)*150,40+A(i*5.1)*120,1,refl[i%4]);
  g.globalAlpha=1;
  /* les passages piétons */
  [[300,330],[900,930]].forEach(([x0,x1])=>{for(let y=TK.avenue[0]+10;y<TK.avenue[1]-10;y+=10)R(x0,y,x1-x0,5,'rgba(230,230,240,.5)');});
  paver(TK.trotS[0],TK.trotS[1],'#4a4560','#433e56');

  /* 3. LA RANGÉE DES BOUTIQUES, vue de la rue */
  const BOUT=[
    {x0:40,x1:210,col:'#3a2030',sig:'RAMEN',neon:'#ff4fb0'},
    {x0:250,x1:420,col:'#202c3c',sig:'KARAOKE',neon:'#7fe8ff'},
    {x0:470,x1:590,col:'#2e2a40',sig:'DRINK',neon:'#ffd98a'},
    {x0:620,x1:770,col:'#1c2a30',sig:'ARMURERIE',neon:'#7ff0ff',porte:true},
    {x0:810,x1:980,col:'#33203a',sig:'BAR',neon:'#ff4fb0'},
    {x0:1020,x1:1190,col:'#202a3a',sig:'PACHINKO',neon:'#b08cff'},
    {x0:1220,x1:1340,col:'#2a2a2a',sig:'KONBINI',neon:'#ffd98a'}];
  for(const s of BOUT){
    const w=s.x1-s.x0;
    R(s.x0,TK.rangee,w,48,s.col);
    R(s.x0,TK.rangee,w,2,'rgba(255,255,255,.14)');
    neon(s.x0+8,TK.rangee+6,w-16,3,s.neon);
    txt(s.sig,s.x0+w/2-s.sig.length*3.6,TK.rangee+13,s.neon,11);
    for(let x=s.x0+10;x<s.x1-12;x+=26)R(x,TK.rangee+26,18,14,'rgba(255,220,150,.45)');
    if(s.porte){
      /* le rideau métallique de l'armurerie, bordé de cyan */
      R(682,TK.rangee+18,26,30,'#0d1116');
      R(682,TK.rangee+18,26,2,'#7ff0ff');R(682,TK.rangee+18,1,30,'#7ff0ff');R(707,TK.rangee+18,1,30,'#7ff0ff');
      for(let y=TK.rangee+22;y<TK.rangee+48;y+=4)R(684,y,22,1,'#1d2630');
      neon(676,TK.rangee+16,38,1,'#7ff0ff');
    }
  }
  /* les distributeurs et les lampadaires du trottoir */
  [[556,300],[1096,300]].forEach(([x,y])=>{R(x,y,16,16,'#2a6fb0');R(x,y,16,1,'#8fd0ff');
    for(let k=0;k<4;k++)R(x+10,y+3+k*3,3,2,['#ff4fb0','#ffd98a','#7fe8ff','#b08cff'][k]);
    neon(x+2,y+12,12,2,'#7fe8ff');});
  [146,446,746,1046,1296].forEach(x=>{
    R(x-1,TK.bati+8,2,22,'#2e2c3a');R(x-4,TK.bati+7,8,2,'#2e2c3a');
    const gr=g.createRadialGradient(x,TK.bati+10,2,x,TK.bati+10,70);
    gr.addColorStop(0,'rgba(255,220,150,.22)');gr.addColorStop(1,'rgba(255,220,150,0)');
    g.fillStyle=gr;g.fillRect(x-70,TK.bati-60,140,140);});

  /* 4. L'ARMURERIE : le nom, et l'entrée est déjà peinte dans la rangée */
  txt('ARMES',640,TK.rangee-18,'#7ff0ff',10);

  /* 5. LA SORTIE, à l'ouest : un panneau vert vers le port */
  R(10,286,50,20,'#1f6b4a');R(10,286,50,1,'#7fe0b0');R(10,305,50,1,'#0f3a28');
  g.save();g.font='bold 9px monospace';g.fillStyle='#e8fff2';g.fillText('< PORT',16,291);g.restore();
  R(34,306,2,6,'#2e2c3a');

  /* 6. L'AUTOROUTE, en bas : la glissière, la chaussée, les lignes */
  R(0,TK.bas,W,6,'#5d6878');R(0,TK.bas,W,1,'#9fb0c4');
  for(let x=0;x<W;x+=30)R(x,TK.bas+5,3,10,'#4a5566');
  R(0,TK.bas+15,W,H-TK.bas-15,'#23242e');
  for(const y of [TK.bas+38,TK.bas+70])for(let x=0;x<W;x+=60)R(x,y,34,3,'#e8dcc0');
  for(let i=0;i<70;i++)R(A(i*2)*W,TK.bas+18+A(i*3)*(H-TK.bas-30),7,2,(i%2)?'rgba(255,70,70,.7)':'rgba(255,240,200,.6)');

  /* 7. LE VERNIS DE PLUIE : une lueur légère sur tout le bas de la carte */
  g.fillStyle='rgba(20,12,40,.10)';g.fillRect(0,TK.bati,W,H-TK.bati);
  return c;
}

function semerDecorTokyo(){
  /* rien à poser en objets : le décor est dans le sol */
  DECOR=[];
}

/* Arrivée : à l'entrée ouest, près du panneau du port. */
function poserTokyo(){
  const [dx,dy]=degager(TK.arrivee[0],TK.arrivee[1]);
  joueur.x=dx;joueur.y=dy;e.ext={x:dx,y:dy};e.extc='tokyo';e.carte='tokyo';
  try{sauver();}catch(x){}
}

/* ---------- L'ARMURERIE : la même boutique que l'arcade, les mêmes armes ---------- */

const ARMES_TK={
  fusil:  {nom:'FUSIL D’ARGENT', c:'#e8f4ff', mot:'neuf plombs en éventail'},
  minigun:{nom:'MINIGUN',        c:'#ffd98a', mot:'une rafale qui ne s’arrête jamais'},
  plasma: {nom:'PLASMA',         c:'#b08cff', mot:'rebondit deux fois sur les murs'},
  railgun:{nom:'RAILGUN',        c:'#7ff0ff', mot:'un trait qui traverse tout, à très longue portée'}
};

async function rpcTokyo(nom,args){
  if(!sb)return {erreur:'La caisse est hors ligne. Réessaie dans un instant.'};
  try{
    const s=await sb.auth.getSession();
    if(!s||!s.data||!s.data.session){try{await window.BD_SESSION.reveiller(sb);}catch(x){}}
    const {data,error}=await sb.rpc(nom,args||{});
    if(error)return {erreur:'L’armurerie n’a pas répondu.'};
    return data;
  }catch(x){return {erreur:'L’armurerie n’a pas répondu.'};}
}

function fermerArmurerieTokyo(){
  ouvrirArmurerieTokyo.ouvert=false;
  fermeA=Date.now();
  $('page2').classList.remove('on');
}

async function ouvrirArmurerieTokyo(){
  if(ouvrirArmurerieTokyo.ouvert)return;
  ouvrirArmurerieTokyo.ouvert=true;
  $('page2Fond').className='';
  $('page2Fond').innerHTML=
    '<div style="padding:calc(env(safe-area-inset-top,0px) + 18px) 18px 18px;min-height:100%;box-sizing:border-box;background:#0f0c1f;font-family:\'Baloo 2\',system-ui,sans-serif;color:#f4f0ff">'+
    '<small style="display:block;font:700 9px ui-monospace,monospace;letter-spacing:3px;color:#7fe8ff">TOKYO · ARMURERIE</small>'+
    '<b style="display:block;font:700 26px \'Baloo 2\',sans-serif;margin-top:4px">Les armes de la ville</b>'+
    '<p id="tkSolde" style="font:700 13px ui-monospace,monospace;margin:10px 0 0;color:#ffd98a">…</p>'+
    '<div id="tkListe" style="margin-top:12px"><p style="font:italic 14px Georgia,serif;color:#b9b0d8">Le vendeur ouvre les tiroirs…</p></div>'+
    '<button id="tkFermer" style="display:block;width:100%;margin-top:16px;min-height:46px;border-radius:14px;border:1px solid #7fe8ff;background:transparent;color:#f4f0ff;font:700 15px \'Baloo 2\',sans-serif">Sortir de l’armurerie</button>'+
    '<div id="tkBulle" style="margin-top:10px;min-height:18px;font:700 12px ui-monospace,monospace;color:#ff8aa8"></div></div>';
  $('page2').classList.add('on');
  $('tkFermer').onclick=fermerArmurerieTokyo;
  await chargerArmurerieTokyo();
}

async function chargerArmurerieTokyo(){
  const r=await rpcTokyo('arcade_mon_arsenal');
  const liste=$('tkListe');
  if(!liste)return;
  if(!r||r.erreur){liste.innerHTML='<p style="color:#ff8aa8">'+((r&&r.erreur)||'L’armurerie ne répond pas.')+'</p>';return;}
  $('tkSolde').textContent='Ton solde · '+enEuros(e.euros||0);
  liste.innerHTML=(r.boutique||[]).map(b=>{
    const a=ARMES_TK[b.arme]||{nom:b.arme,c:'#ffffff',mot:''};
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;border:1px solid rgba(127,232,255,.25);border-radius:12px;background:rgba(255,255,255,.03)">'+
      '<span style="width:12px;height:12px;border-radius:50%;background:'+a.c+';box-shadow:0 0 10px '+a.c+';flex:0 0 auto"></span>'+
      '<span style="flex:1;min-width:0"><b style="display:block;font:700 16px \'Baloo 2\',sans-serif">'+a.nom+'</b><em style="font:italic 12px Georgia,serif;color:#b9b0d8">'+a.mot+'</em></span>'+
      (b.possede
        ?'<span style="font:700 12px ui-monospace,monospace;color:#7fe8ff">✓ À TOI</span>'
        :'<button data-arme="'+b.arme+'" style="min-height:40px;padding:0 12px;border-radius:10px;border:0;background:#7fe8ff;color:#0f0c1f;font:700 14px \'Baloo 2\',sans-serif">'+enEuros(b.prix)+'</button>')+
      '</div>';
  }).join('');
  liste.querySelectorAll('button[data-arme]').forEach(bt=>{bt.onclick=()=>acheterTokyo(bt.dataset.arme,bt);});
}

async function acheterTokyo(arme,bt){
  bt.disabled=true;
  const r=await rpcTokyo('arcade_acheter_arme',{p_arme:arme});
  if(!r||r.erreur){
    bt.disabled=false;
    $('tkBulle').textContent=(r&&r.erreur)||'L’armurerie n’a pas répondu.';
    return;
  }
  if(typeof r.euros==='number'){e.euros=r.euros;try{sauver();majHaut();}catch(x){}}
  $('tkBulle').textContent=((ARMES_TK[arme]||{nom:arme}).nom)+' est à toi.';
  await chargerArmurerieTokyo();
}

;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirArmurerieTokyo,rpcTokyo,fermerArmurerieTokyo})
