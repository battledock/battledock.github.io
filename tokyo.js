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

async function ouvrirConcessionTokyo(ongletDepart){
  if(ouvrirConcessionTokyo.ouvert)return;
  ouvrirConcessionTokyo.ouvert=true;
  /* PLEIN ÉCRAN : la racine est posée en absolu sur toute la page2, et c'est elle
     qui défile ; la barre du bas reste collée, au-dessus de la zone du geste iOS */
  $('page2Fond').className='';
  $('page2Fond').innerHTML=
    '<div id="ccRacine" style="position:absolute;inset:0;display:flex;flex-direction:column;background:#ffffff;color:#14141a;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif">'+
    '<div id="ccDefile" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 18px) 16px 16px">'+
      '<small id="ccSur" style="display:block;font:700 11px sans-serif;letter-spacing:3px;color:#ff4fb0"></small>'+
      '<b id="ccTitre" style="display:block;font:800 30px sans-serif;margin:2px 0 12px"></b>'+
      '<div id="ccCorps"></div>'+
      '<div id="ccBulle" style="min-height:20px;margin-top:12px;font:600 14px sans-serif;color:#d0306f;text-align:center"></div>'+
    '</div>'+
    '<nav id="ccNav" style="flex:none;display:flex;border-top:1px solid #ececf0;background:#fff;padding:6px 6px calc(env(safe-area-inset-bottom,0px) + 8px)"></nav></div>';
  $('page2').classList.add('on');
  const bulle=t=>{$('ccBulle').textContent=t||'';};
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let vehicules=[];
  try{const r=await fetch('assets/voitures/catalogue.json');vehicules=((await r.json()).vehicules)||[];}catch(x){}
  const ORIGINE={Toyota:'Japonaises',Nissan:'Japonaises',BMW:'Allemandes',Porsche:'Allemandes',Lamborghini:'Italiennes',Ferrari:'Italiennes'};
  const TEINTE={Toyota:'#ffe3e6',Nissan:'#e9ebf1',BMW:'#e1eaff',Porsche:'#eff1f5',Lamborghini:'#e4f6db',Ferrari:'#ffe3e6'};
  const sprite=v=>{const p=(v&&v.photos||[]).find(q=>q.role==='sprite_pixel');return p?p.fichier:'';};
  const nom=v=>v?[v.marque,v.modele].filter(Boolean).join(' '):'Voiture';
  const modele=id=>vehicules.find(v=>v.id===id);
  let onglet=ongletDepart||0, filtre='Toutes', ouverte=-1, choisie=0;
  const NAV=['Showroom','Mon garage','Tuning','Sortir'];
  const nav=()=>{
    $('ccNav').innerHTML=NAV.map((t,i)=>'<button data-nav="'+i+'" style="flex:1;min-height:48px;border:0;background:none;font:'+(i===onglet?'700':'500')+' 12px sans-serif;color:'+(i===onglet?'#ff4fb0':'#8a8a96')+'">'+(i===onglet?'● ':'')+t+'</button>').join('');
    $('ccNav').querySelectorAll('button').forEach(b=>{b.onclick=()=>{
      const i=+b.dataset.nav;
      if(i===3){fermerConcessionTokyo();return;}
      onglet=i;bulle('');rendre();};});
  };
  /* ---------- LE SHOWROOM ---------- */
  const filtres=['Toutes','Japonaises','Allemandes','Italiennes'];
  const showroom=()=>{
    $('ccSur').textContent='TOKYO · CONCESSION';$('ccTitre').textContent='Showroom';
    if(!vehicules.length){$('ccCorps').innerHTML='<p style="color:#d0306f">Le catalogue ne répond pas.</p>';return;}
    $('ccCorps').innerHTML='<div id="ccFiltres" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:12px;scrollbar-width:none">'+
      filtres.map(f=>'<button data-f="'+f+'" style="flex:none;min-height:40px;padding:0 16px;border-radius:20px;border:0;font:600 14px sans-serif;background:'+(f===filtre?'#14141a':'#f1f1f4')+';color:'+(f===filtre?'#fff':'#14141a')+'">'+f+'</button>').join('')+
      '</div><div id="ccListe" style="display:flex;flex-direction:column;gap:12px">'+
      vehicules.map((v,i)=>{
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
      }).join('')+'</div>';
    $('ccFiltres').querySelectorAll('button').forEach(b=>{b.onclick=()=>{filtre=b.dataset.f;ouverte=-1;rendre();};});
    $('ccListe').querySelectorAll('div[data-i]').forEach(c=>{c.onclick=ev=>{
      const a=ev.target.closest('button[data-a]');
      if(a){ev.stopPropagation();
        if(a.dataset.a==='essai'){fermerConcessionTokyo();debutEssai(vehicules[+c.dataset.i]);}
        else bulle("La vente n'est pas encore ouverte : tu peux seulement l'essayer.");
        return;}
      const i=+c.dataset.i;ouverte=ouverte===i?-1:i;bulle('');rendre();
    };});
  };
  /* ---------- MON GARAGE : le plan des places, la voiture choisie en grand, ses compteurs ---------- */
  const garage=()=>{
    $('ccSur').textContent='TOKYO · MON GARAGE';$('ccTitre').textContent='Mon garage';
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
      h+='<div style="margin-top:14px;border:2px dashed #d4d4dc;border-radius:22px;padding:20px;text-align:center;color:#6a6a76;font-size:14px;line-height:1.5">'+
        '<b style="display:block;color:#14141a;font-size:17px;margin-bottom:4px">Ton garage est vide</b>'+
        'La vente n’est pas encore ouverte. En attendant, tu peux essayer toutes les voitures au showroom.'+
        '<button id="ccVersShowroom" style="display:block;width:100%;margin-top:14px;min-height:50px;border-radius:14px;border:0;background:#ff4fb0;color:#fff;font:700 15px sans-serif">Voir le showroom</button></div>';
    }else{
      const v=G[choisie], m=modele(v.modele);
      h+='<div style="margin-top:14px;border-radius:24px;background:linear-gradient(#f3f3f6,#e2e3e8);padding:18px 10px 10px;position:relative">'+
        '<span style="position:absolute;top:12px;left:14px;font:800 12px sans-serif;color:#8a8a96">'+(choisie+1)+' / '+G.length+' · PLACE '+(v.place+1)+'</span>'+
        '<img src="'+sprite(m)+'" alt="'+esc(nom(m))+'" style="display:block;width:100%;height:auto;margin-top:16px;image-rendering:pixelated"></div>'+
        '<b style="display:block;font:800 22px sans-serif;margin-top:12px">'+esc(nom(m))+'</b>'+
        '<small style="color:#6a6a76;font-size:13px">'+(v.nom?'« '+esc(v.nom)+' »':'Sans nom de garage')+'</small>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">'+
          [[(v.km||0).toFixed(1)+' km','parcourus'],[v.drifts||0,'drifts'],[v.sorties||0,'sorties']].map(([a,b])=>'<div style="background:#f4f4f7;border-radius:14px;padding:12px 4px;text-align:center;font-size:11px;color:#6a6a76"><b style="display:block;color:#14141a;font-size:17px">'+a+'</b>'+b+'</div>').join('')+
        '</div>'+
        '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button id="ccRenommer" style="flex:1;min-height:50px;border-radius:14px;border:0;background:#f1f1f4;font:700 14px sans-serif;color:#14141a">Renommer</button>'+
          '<button id="ccTuning" style="flex:1;min-height:50px;border-radius:14px;border:0;background:#f1f1f4;font:700 14px sans-serif;color:#14141a">Tuning</button></div>'+
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
    $('ccSur').textContent='TOKYO · ATELIER';$('ccTitre').textContent='Tuning';
    const G=garageDuJoueur();
    if(!selT)selT=G.length?{garage:G[0]}:(vehicules[0]?{modele:vehicules[0].id}:null);
    if(!selT){$('ccCorps').innerHTML='<p style="color:#d0306f">Le catalogue ne répond pas.</p>';return;}
    const m=selT.garage?modele(selT.garage.modele):modele(selT.modele);
    const t=selT.garage?tuningDe(m||{},selT.garage):tuningDe(m,null);
    const pf=perfDuTuning(t), base=perfDuTuning({});
    const puce=(on,txt,data)=>'<button '+data+' style="flex:none;min-height:40px;padding:0 14px;border-radius:20px;border:0;font:600 13px sans-serif;background:'+(on?'#14141a':'#f1f1f4')+';color:'+(on?'#fff':'#14141a')+'">'+txt+'</button>';
    const pastille=(on,col,data,txt)=>'<button '+data+' aria-label="'+(txt||col)+'" style="flex:none;width:40px;height:40px;border-radius:50%;border:'+(on?'3px solid #ff4fb0':'2px solid #e2e2e8')+';background:'+(col||'#fff')+';font:700 10px sans-serif;color:#6a6a76;box-shadow:'+(on?'0 0 0 2px #fff inset':'none')+'">'+(col?'':(txt||'∅'))+'</button>';
    const ligne=(titre,contenu)=>'<div style="margin-top:14px"><small style="display:block;font:700 11px sans-serif;letter-spacing:2px;color:#8a8a96;margin-bottom:8px">'+titre+'</small><div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">'+contenu+'</div></div>';
    const barre=(titre,v,max)=>'<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font:600 12px sans-serif"><span>'+titre+'</span><span style="color:#8a8a96">'+Math.round(v)+' / '+max+'</span></div><div style="height:8px;border-radius:4px;background:#f1f1f4;margin-top:4px;overflow:hidden"><div style="height:100%;width:'+Math.min(100,v/max*100)+'%;background:linear-gradient(90deg,#ff4fb0,#7fe8ff);border-radius:4px"></div></div></div>';
    /* le choix de la voiture : les miennes d'abord, puis celles du showroom (à l'essai) */
    let h='<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none">'+
      G.map((v,i)=>puce(selT.garage===v,esc((v.nom||nom(modele(v.modele))).slice(0,18)),'data-selg="'+i+'"')).join('')+
      vehicules.map(v=>puce(!selT.garage&&selT.modele===v.id,esc(nom(v))+(G.length?' · essai':''),'data-selm="'+esc(v.id)+'"')).join('')+'</div>';
    /* l'aperçu : profil repeint, vue de dessus, néon */
    h+='<div style="border-radius:24px;background:linear-gradient(#f3f3f6,#e2e3e8);padding:14px 10px 12px;position:relative;overflow:hidden">'+
      (t.neon?'<div style="position:absolute;left:8%;right:8%;bottom:26px;height:26px;border-radius:50%;background:'+t.neon+';filter:blur(12px);opacity:.8"></div>':'')+
      '<canvas id="ccProfil" style="display:block;width:100%;height:auto;image-rendering:pixelated;position:relative"></canvas>'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;position:relative"><small style="font:700 11px sans-serif;color:#8a8a96">'+esc(nom(m))+(selT.garage?' · MA VOITURE':' · À L’ESSAI')+'</small><canvas id="ccDessus" width="68" height="32" style="width:102px;height:48px;image-rendering:pixelated"></canvas></div></div>';
    /* les trois ateliers */
    h+='<div style="display:flex;gap:6px;margin-top:14px;background:#f1f1f4;border-radius:14px;padding:4px">'+
      ['Carrosserie','Néons & vitres','Moteur'].map((x,i)=>'<button data-sect="'+i+'" style="flex:1;min-height:40px;border-radius:10px;border:0;font:700 13px sans-serif;background:'+(i===sect?'#fff':'transparent')+';color:#14141a;box-shadow:'+(i===sect?'0 1px 4px #0002':'none')+'">'+x+'</button>').join('')+'</div>';
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
      h+='<div style="margin-top:12px;background:#f8f8fa;border-radius:16px;padding:4px 12px 12px">'+
        barre('Accélération',pf.acc*60,120)+barre('Vitesse max',pf.vmax/3.4,150)+barre('Adhérence',pf.grip*8,100)+barre('Glisse en drift',(1.5-pf.drift)*80,100)+'</div>';
    }
    h+='<div style="display:flex;gap:8px;margin-top:16px"><button id="ccRaz" style="flex:1;min-height:52px;border-radius:14px;border:0;background:#f1f1f4;font:700 14px sans-serif;color:#14141a">Tout d’origine</button>'+
      '<button id="ccEssaiT" style="flex:1.6;min-height:52px;border-radius:14px;border:0;background:#ff4fb0;color:#fff;font:800 15px sans-serif">'+(selT.garage?'Prendre le volant':'Essayer ce tuning')+'</button></div>'+
      '<p style="margin-top:10px;font-size:12px;color:#8a8a96;text-align:center">Gratuit pour l’instant · chaque réglage est enregistré tout de suite.</p>';
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
  const rendre=()=>{nav();(onglet===2?tuning:onglet===1?garage:showroom)();$('ccDefile').scrollTop=0;};
  rendre();
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
  ESSAI.perf=perfDuTuning(ESSAI.tuning);
  ESSAI.halo=null;ESSAI.dist=0;ESSAI.drifts=0;ESSAI.enDrift=false;ESSAI.nom=[v.marque,v.modele].filter(Boolean).join(' ');
  ESSAI.toile=peindreVoitureDessus(v.marque,ESSAI.tuning);
  ESSAI.retour={x:joueur.x,y:joueur.y};
  ESSAI.x=200;ESSAI.y=(TK.route[0]+TK.route[1])/2+18;ESSAI.ang=0;ESSAI.vx=0;ESSAI.vy=0;ESSAI.vol=0;
  ESSAI.traces=[];ESSAI.fumee=[];
  joueur.x=ESSAI.x;joueur.y=ESSAI.y;
  montrerCommandes();
  demarrerMoteur();
}
function finEssai(){
  ESSAI.actif=false;
  /* SA PROPRE VOITURE : les compteurs du garage avancent (1 px de carte = 25 cm) */
  if(ESSAI.garage){const v=ESSAI.garage;v.km=(v.km||0)+ESSAI.dist*0.00025;v.drifts=(v.drifts||0)+ESSAI.drifts;v.sorties=(v.sorties||0)+1;try{sauver();}catch(x){}}
  ESSAI.garage=null;
  cacherCommandes();
  couperMoteur();
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
  const PF=ESSAI.perf||perfDuTuning({});
  if(CMD.gaz)av+=(av<0?420:250*PF.acc)*dt;
  if(CMD.frein)av-=(av>8?430:150)*dt;                         /* freine, puis recule */
  if(!CMD.gaz&&!CMD.frein)av*=Math.exp(-1.1*dt);
  if(CMD.main)av*=Math.exp(-0.9*dt);
  av=Math.max(-95,Math.min(PF.vmax,av));
  av*=Math.exp(-0.22*dt);
  /* 3. L'ADHÉRENCE : le frein à main la casse, un grand coup de volant à fond aussi */
  const grip=CMD.main?PF.drift:(Math.abs(ESSAI.vol)>0.85&&vit>PF.seuil?2.6:PF.grip);
  tr*=Math.exp(-grip*dt);
  ESSAI.vx=av*nx-tr*ny; ESSAI.vy=av*ny+tr*nx;
  majMoteur(dt,Math.abs(av),CMD.gaz,Math.abs(tr));
  const X=ESSAI.x+ESSAI.vx*dt, Y=ESSAI.y+ESSAI.vy*dt;
  if(bloqueTokyo(X,Y)||X<20||X>MONDE_L-20||Y<TK.bati+18||Y>MONDE_H-18){
    ESSAI.vx*=-0.35;ESSAI.vy*=-0.35;      /* le choc : on rebondit, sans traverser */
  }else{ESSAI.dist=(ESSAI.dist||0)+Math.hypot(X-ESSAI.x,Y-ESSAI.y);ESSAI.x=X;ESSAI.y=Y;}
  /* un drift compte une fois, quand l'arrière décroche */
  if(!ESSAI.enDrift&&Math.abs(tr)>60){ESSAI.enDrift=true;ESSAI.drifts=(ESSAI.drifts||0)+1;}
  else if(ESSAI.enDrift&&Math.abs(tr)<20)ESSAI.enDrift=false;
  /* les traces de pneus et la fumée quand ça glisse */
  if(Math.abs(tr)>45){
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

;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo,ESSAI,debutEssai,finEssai,majEssai,dessinerEssai})
