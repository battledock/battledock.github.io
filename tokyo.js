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
          [[(v.km||0).toFixed(1)+' km','parcourus'],[v.zeroCent?v.zeroCent.toFixed(2)+' s':'—','meilleur 0 – 100'],[v.sorties||0,'sorties']].map(([a,b])=>'<div style="background:#f4f4f7;border-radius:14px;padding:12px 4px;text-align:center;font-size:11px;color:#6a6a76"><b style="display:block;color:#14141a;font-size:17px">'+a+'</b>'+b+'</div>').join('')+
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
/* ================= LA ROUTE, DE PROFIL =================
   L'essai se joue sur l'autoroute de Tokyo, vue de côté, comme dans les jeux de
   drag : la voiture de profil (avec son tuning), le décor qui défile en
   parallaxe, et en bas un tableau de bord net (compte-tours, compteur, rapport,
   boîte manuelle ou auto, frein et gaz).
   LE DÉCOR DÉFILE LENTEMENT : le ciel ne bouge pas, le Fuji et les montagnes
   presque pas, la ville au loin à peine, les façades doucement ; seules la
   glissière et la route suivent la vitesse. L'œil se pose, rien ne file. */
const ROUTE={el:null,cv:null,g:null,raf:0,tp:0,v:0,rap:1,rpm:900,auto:true,km:0,auto100:null,chrono:0,meilleur:null,
  img:null,couches:null,off:[0,0,0,0,0],W:0,H:0,dpr:1};
function rapportsMax(pf){const k=pf.vmax/340;return [0,62,104,146,190,234,280].map(v=>v*k);}
/* les couches lointaines, peintes une fois, raccordables bout à bout */
function peindreCouchesRoute(W,H,dpr){
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);return [c,g];};
  const A=i=>alea(i*1.37+0.77);
  /* 0. le ciel : dégradé de nuit, étoiles, lune et son halo, brume rose à l'horizon */
  const [ciel,gc]=mk(W,H);
  const k=gc.createLinearGradient(0,0,0,H);k.addColorStop(0,'#070616');k.addColorStop(0.45,'#1a1036');k.addColorStop(0.75,'#3d1f55');k.addColorStop(1,'#6a2a5e');
  gc.fillStyle=k;gc.fillRect(0,0,W,H);
  for(let i=0;i<120;i++){gc.fillStyle='rgba(235,235,255,'+(0.25+A(i)*0.6)+')';const r=A(i+300)<0.1?1.4:0.8;gc.fillRect(A(i+100)*W,A(i+200)*H*0.55,r,r);}
  const lx=W*0.78, ly=H*0.17, lr=Math.max(14,H*0.05);
  const hl=gc.createRadialGradient(lx,ly,lr*0.6,lx,ly,lr*4);hl.addColorStop(0,'rgba(255,240,210,.35)');hl.addColorStop(1,'rgba(255,240,210,0)');gc.fillStyle=hl;gc.fillRect(0,0,W,H*0.6);
  gc.fillStyle='#fff4dc';gc.beginPath();gc.arc(lx,ly,lr,0,7);gc.fill();
  gc.fillStyle='rgba(220,205,170,.35)';gc.beginPath();gc.arc(lx-lr*0.3,ly-lr*0.2,lr*0.25,0,7);gc.arc(lx+lr*0.35,ly+lr*0.3,lr*0.18,0,7);gc.fill();
  /* 1. le Fuji et les montagnes, bleutés, très loin (large : 2 écrans) */
  const LW=W*2;
  const [mont,gm]=mk(LW,H);
  const base=H*0.62;
  gm.fillStyle='#2a2150';gm.beginPath();gm.moveTo(0,base);
  for(let x=0;x<=LW;x+=8){gm.lineTo(x,base-H*0.08-Math.sin(x/LW*Math.PI*6)*H*0.035-Math.sin(x/LW*Math.PI*14)*H*0.015);}
  gm.lineTo(LW,H);gm.lineTo(0,H);gm.fill();
  const fuji=(cx)=>{const fw=H*0.95,fh=H*0.36;
    const fg=gm.createLinearGradient(0,base-fh,0,base);fg.addColorStop(0,'#4a3f78');fg.addColorStop(1,'#2e2556');
    gm.fillStyle=fg;gm.beginPath();gm.moveTo(cx-fw/2,base);gm.quadraticCurveTo(cx-fw*0.18,base-fh*0.7,cx-fw*0.08,base-fh);gm.lineTo(cx+fw*0.08,base-fh);gm.quadraticCurveTo(cx+fw*0.18,base-fh*0.7,cx+fw/2,base);gm.fill();
    gm.fillStyle='#e8e4f4';gm.beginPath();gm.moveTo(cx-fw*0.08,base-fh);gm.lineTo(cx+fw*0.08,base-fh);
    gm.lineTo(cx+fw*0.12,base-fh*0.84);gm.lineTo(cx+fw*0.07,base-fh*0.88);gm.lineTo(cx+fw*0.03,base-fh*0.82);gm.lineTo(cx-fw*0.02,base-fh*0.89);gm.lineTo(cx-fw*0.07,base-fh*0.83);gm.lineTo(cx-fw*0.12,base-fh*0.86);gm.fill();
    /* l'ombre du versant ouest, pour le relief */
    gm.fillStyle='rgba(10,6,30,.28)';gm.beginPath();gm.moveTo(cx-fw/2,base);gm.quadraticCurveTo(cx-fw*0.18,base-fh*0.7,cx-fw*0.08,base-fh);gm.lineTo(cx-fw*0.02,base-fh);gm.lineTo(cx-fw*0.12,base);gm.fill();};
  fuji(LW*0.3);
  const brume=gm.createLinearGradient(0,base-H*0.12,0,base+H*0.05);brume.addColorStop(0,'rgba(106,42,94,0)');brume.addColorStop(1,'rgba(106,42,94,.55)');gm.fillStyle=brume;gm.fillRect(0,base-H*0.12,LW,H*0.2);
  /* 2. la ville au loin : tours sombres, fenêtres éclairées, feux rouges au sommet */
  const [ville,gv]=mk(LW,H);
  let x=0,i=0;
  while(x<LW){const w=18+A(i)*34,h=H*(0.1+A(i+50)*0.22);const y=base+H*0.06-h;
    gv.fillStyle=i%3?'#1b1430':'#22193c';gv.fillRect(x,y,w,h+H);
    for(let yy=y+4;yy<base+H*0.05;yy+=6)for(let xx=x+3;xx<x+w-3;xx+=5)if(A(xx*0.7+yy*1.3)<0.32){gv.fillStyle=['rgba(255,217,138,.75)','rgba(127,232,255,.6)','rgba(255,79,176,.55)'][Math.floor(A(xx+yy)*3)];gv.fillRect(xx,yy,2,2);}
    if(A(i+90)<0.4){gv.fillStyle='#ff3b3b';gv.fillRect(x+w/2-1,y-2,2,2);}
    x+=w+1+A(i+70)*8;i++;}
  return {ciel,mont,ville,LW};
}
function montrerRoute(){
  const z=document.createElement('div');z.id='tkRoute';
  z.style.cssText='position:fixed;inset:0;z-index:30;background:#070616;display:flex;flex-direction:column;-webkit-user-select:none;user-select:none;touch-action:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
  const cadran=(id,max,pas,unit,rouge)=>{
    let t='';for(let i=0;i<=max;i+=pas){const a=(-225+i/max*270)*Math.PI/180;const r1=46,r2=i%(pas*2)===0?39:42;
      const red=rouge&&i>=rouge;t+='<line x1="'+(60+Math.cos(a)*r1).toFixed(1)+'" y1="'+(60+Math.sin(a)*r1).toFixed(1)+'" x2="'+(60+Math.cos(a)*r2).toFixed(1)+'" y2="'+(60+Math.sin(a)*r2).toFixed(1)+'" stroke="'+(red?'#ff3b5c':'#d8d6e6')+'" stroke-width="'+(i%(pas*2)===0?2:1)+'"/>';
      if(i%(pas*2)===0)t+='<text x="'+(60+Math.cos(a)*31).toFixed(1)+'" y="'+(60+Math.sin(a)*31+3).toFixed(1)+'" fill="'+(red?'#ff6b84':'#9a98b0')+'" font-size="8" font-weight="700" text-anchor="middle">'+(unit==='RPM'?i/1000:i)+'</text>';}
    if(rouge){const a0=(-225+rouge/max*270)*Math.PI/180,a1=45*Math.PI/180;t+='<path d="M'+(60+Math.cos(a0)*49)+' '+(60+Math.sin(a0)*49)+' A49 49 0 0 1 '+(60+Math.cos(a1)*49)+' '+(60+Math.sin(a1)*49)+'" stroke="#ff3b5c" stroke-width="3" fill="none"/>';}
    return '<svg viewBox="0 0 120 120" style="width:100%;height:100%"><defs><radialGradient id="f'+id+'"><stop offset="0" stop-color="#22202f"/><stop offset="1" stop-color="#0d0c14"/></radialGradient></defs>'+
      '<circle cx="60" cy="60" r="56" fill="url(#f'+id+')" stroke="#3a3850" stroke-width="2"/>'+t+
      '<text x="60" y="88" fill="#7fe8ff" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="1">'+unit+'</text>'+
      '<g id="'+id+'" style="transform-origin:60px 60px;transform:rotate(-225deg)"><line x1="60" y1="60" x2="104" y2="60" stroke="#ff4fb0" stroke-width="3" stroke-linecap="round"/></g>'+
      '<circle cx="60" cy="60" r="6" fill="#e8e8f0"/></svg>';};
  const pedale=(k,txt,w,h,col)=>'<button data-c="'+k+'" style="width:'+w+'px;height:'+h+'px;border-radius:12px;border:0;padding:0;touch-action:none;background:linear-gradient(160deg,#9a9aa8,#4a4a56 55%,#2a2a32);box-shadow:0 6px 0 #111,inset 0 1px 0 #ffffff55;position:relative;transition:transform .05s,box-shadow .05s;-webkit-tap-highlight-color:transparent">'+
    '<span style="position:absolute;inset:8px 8px 22px;border-radius:6px;background:repeating-linear-gradient(0deg,#2a2a32 0 4px,#6a6a78 4px 7px)"></span>'+
    '<span style="position:absolute;left:0;right:0;bottom:5px;text-align:center;font:800 11px sans-serif;letter-spacing:1px;color:'+col+'">'+txt+'</span></button>';
  const rond=(k,txt)=>'<button data-c="'+k+'" style="width:56px;height:56px;border-radius:16px;border:1px solid #3a3850;background:linear-gradient(#2a2838,#17161f);color:#fff;font:800 24px sans-serif;box-shadow:0 4px 0 #000;touch-action:none;-webkit-tap-highlight-color:transparent">'+txt+'</button>';
  z.innerHTML=
    '<div style="position:relative;flex:1;min-height:0"><canvas id="rtCiel" style="position:absolute;inset:0;width:100%;height:100%"></canvas>'+
      '<div style="position:absolute;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 0;display:flex;align-items:center;gap:10px">'+
        '<button id="rtQuitter" style="width:42px;height:42px;border-radius:50%;border:0;background:#ffffff1f;color:#fff;font:700 18px sans-serif">✕</button>'+
        '<div style="flex:1;min-width:0"><small style="display:block;font:700 10px sans-serif;letter-spacing:3px;color:#ff4fb0">TOKYO · AUTOROUTE</small>'+
        '<b id="rtNom" style="display:block;font:800 16px sans-serif;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></b></div>'+
        '<div style="text-align:right;color:#fff"><small style="display:block;font:700 9px sans-serif;letter-spacing:2px;color:#9a98b0">0 – 100</small><b id="rt100" style="font:800 15px ui-monospace,monospace">—</b></div></div></div>'+
    '<div style="flex:none;background:linear-gradient(#14131c,#08080c);border-top:1px solid #2a2838;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 14px)">'+
      '<div style="display:flex;align-items:center;justify-content:center;gap:6px">'+
        '<div style="width:min(38vw,160px);aspect-ratio:1">'+cadran('rtAigRpm',8000,500,'RPM',7000)+'</div>'+
        '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:64px">'+
          '<div style="width:58px;height:58px;border-radius:14px;background:#05050a;border:1px solid #2a2838;display:grid;place-items:center;font:800 34px ui-monospace,monospace;color:#ffd98a" id="rtRap">1</div>'+
          '<div style="font:800 20px ui-monospace,monospace;color:#7fe8ff" id="rtVit">0</div><small style="font:700 9px sans-serif;color:#9a98b0;letter-spacing:2px">KM/H</small></div>'+
        '<div style="width:min(38vw,160px);aspect-ratio:1">'+cadran('rtAigVit',280,20,'KM/H',0)+'</div></div>'+
      '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:10px">'+
        '<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start"><div style="display:flex;gap:8px">'+rond('bas','−')+rond('haut','+')+'</div>'+
          '<button id="rtAuto" style="height:32px;padding:0 12px;border-radius:10px;border:1px solid #3a3850;background:#17161f;color:#7fe8ff;font:800 11px sans-serif;letter-spacing:1px">BOÎTE AUTO</button></div>'+
        '<div style="display:flex;gap:12px;align-items:flex-end">'+pedale('frein','FREIN',66,96,'#ff8a9a')+pedale('gaz','GAZ',82,124,'#7fe8ff')+'</div></div></div>';
  document.body.appendChild(z);
  ROUTE.el=z;ROUTE.cv=z.querySelector('#rtCiel');ROUTE.g=ROUTE.cv.getContext('2d');
  $('rtNom').textContent=ESSAI.nom;
  $('rtQuitter').onclick=()=>finEssai();
  const majAuto=()=>{$('rtAuto').textContent=ROUTE.auto?'BOÎTE AUTO':'BOÎTE MANUELLE';$('rtAuto').style.color=ROUTE.auto?'#7fe8ff':'#ffd98a';};
  $('rtAuto').onclick=()=>{ROUTE.auto=!ROUTE.auto;majAuto();};majAuto();
  z.querySelectorAll('button[data-c]').forEach(b=>{
    const k=b.dataset.c;
    const on=ev=>{ev.preventDefault();ev.stopPropagation();try{b.setPointerCapture(ev.pointerId);}catch(x){}
      if(k==='haut'||k==='bas'){changerRapport(k==='haut'?1:-1);}else CMD[k]=true;
      b.style.transform='translateY(4px)';b.style.boxShadow=b.style.boxShadow.replace(/0 (6|4)px 0/,'0 1px 0');};
    const off=ev=>{if(ev){ev.preventDefault();ev.stopPropagation();}if(k!=='haut'&&k!=='bas')CMD[k]=false;b.style.transform='';b.style.boxShadow=b.style.boxShadow.replace(/0 1px 0/,k==='haut'||k==='bas'?'0 4px 0':'0 6px 0');};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',()=>off());
    b.addEventListener('contextmenu',ev=>ev.preventDefault());});
  const T={ArrowUp:'gaz',z:'gaz',w:'gaz',ArrowDown:'frein',s:'frein'};
  ROUTE.clavier=[ev=>{const k=T[ev.key];if(k){CMD[k]=true;ev.preventDefault();}else if(ev.key==='ArrowRight'||ev.key==='e')changerRapport(1);else if(ev.key==='ArrowLeft'||ev.key==='a')changerRapport(-1);},
    ev=>{const k=T[ev.key];if(k)CMD[k]=false;}];
  addEventListener('keydown',ROUTE.clavier[0]);addEventListener('keyup',ROUTE.clavier[1]);
  ROUTE.taille=()=>{const r=ROUTE.cv.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1);
    ROUTE.W=r.width;ROUTE.H=r.height;ROUTE.dpr=dpr;ROUTE.cv.width=Math.round(r.width*dpr);ROUTE.cv.height=Math.round(r.height*dpr);
    ROUTE.couches=peindreCouchesRoute(r.width,r.height,dpr);};
  addEventListener('resize',ROUTE.taille);ROUTE.taille();
}
function cacherRoute(){
  if(ROUTE.raf)cancelAnimationFrame(ROUTE.raf);ROUTE.raf=0;
  if(ROUTE.clavier){removeEventListener('keydown',ROUTE.clavier[0]);removeEventListener('keyup',ROUTE.clavier[1]);ROUTE.clavier=null;}
  if(ROUTE.taille)removeEventListener('resize',ROUTE.taille);
  if(ROUTE.el){ROUTE.el.remove();ROUTE.el=null;}
  for(const k in CMD)CMD[k]=false;
}
function changerRapport(d){ROUTE.rap=Math.max(1,Math.min(6,ROUTE.rap+d));try{if(navigator.vibrate)navigator.vibrate(12);}catch(x){}}
const CMD={gaz:false,frein:false};
/* LE MOTEUR : le régime suit la vitesse dans le rapport engagé ; le couple est
   meilleur au milieu du compte-tours ; au rupteur, il coupe. */
function majRoute(dt){
  const PF=ESSAI.perf||perfDuTuning({}), RM=rapportsMax(PF);
  let v=ROUTE.v;const r=ROUTE.rap, vm=RM[r];
  let rpm=900+Math.max(0,Math.min(1.04,v/vm))*7100;
  if(v<12&&CMD.gaz)rpm=Math.max(rpm,2800+Math.random()*120);        /* l'embrayage patine au départ */
  const courbe=0.55+0.45*Math.sin(Math.max(0,Math.min(1,(rpm-1200)/6400))*Math.PI);
  if(CMD.gaz&&rpm<7950){
    const bas=v<RM[r-1]*0.55&&r>1?0.35:1;                            /* trop haut en rapport : ça ne tire pas */
    v+=23*PF.acc*(1.38-0.14*r)*courbe*bas*dt;
  }
  if(CMD.gaz&&rpm>=7950)rpm=7700+Math.random()*350;                   /* le rupteur */
  if(CMD.frein)v-=95*dt;
  if(!CMD.gaz)v-=(2.4+v*0.009)*dt;
  v=Math.max(0,Math.min(v,RM[6]*1.02));
  /* la boîte automatique passe les rapports au bon moment */
  if(ROUTE.auto){if(rpm>7300&&r<6&&CMD.gaz)ROUTE.rap++;else if(rpm<2600&&r>1)ROUTE.rap--;}
  /* le 0 – 100 */
  if(v<1)ROUTE.chrono=0;else if(ROUTE.chrono>=0){ROUTE.chrono+=dt;if(v>=100){const t=ROUTE.chrono;ROUTE.chrono=-1;if(!ROUTE.meilleur||t<ROUTE.meilleur)ROUTE.meilleur=t;$('rt100').textContent=t.toFixed(2)+' s';}}
  ROUTE.v=v;ROUTE.rpm=ROUTE.rpm+(rpm-ROUTE.rpm)*Math.min(1,14*dt);
  ROUTE.km+=v/3600*dt;
  const px=v*2.2*dt;                                                  /* 100 km/h ≈ 220 px/s pour la route */
  const vit=[0,0.025,0.07,0.2,0.65,1];
  for(let i=1;i<6;i++)ROUTE.off[i-1]=(ROUTE.off[i-1]||0)+px*vit[i];
}
function dessinerRoute(t){
  const g=ROUTE.g,W=ROUTE.W,H=ROUTE.H,d=ROUTE.dpr,C=ROUTE.couches;if(!C)return;
  g.setTransform(1,0,0,1,0,0);
  g.drawImage(C.ciel,0,0);
  const tuile=(img,off,y)=>{const w=img.width;let x=-Math.round((off*d)%w);g.drawImage(img,x,y);g.drawImage(img,x+w,y);};
  tuile(C.mont,ROUTE.off[0],0);tuile(C.ville,ROUTE.off[1],0);
  g.setTransform(d,0,0,d,0,0);g.imageSmoothingEnabled=false;
  const base=H*0.62;
  /* les façades de Tokyo, pixel art, défilent doucement */
  const rue=IMGS_TK.__rue;
  if(rue){const s=Math.max(0.6,(H*0.3)/206), w=900*s, y=base+H*0.05-206*s;
    let x=-((ROUTE.off[2])%w);g.drawImage(rue,0,0,900,206,Math.round(x),Math.round(y),Math.round(w),Math.round(206*s));g.drawImage(rue,0,0,900,206,Math.round(x+w),Math.round(y),Math.round(w),Math.round(206*s));}
  /* la glissière, ses poteaux, et les lampadaires tous les deux cents pixels */
  const yr=base+H*0.05;
  g.fillStyle='#8a8a9a';g.fillRect(0,yr,W,5);g.fillStyle='#c9c9d6';g.fillRect(0,yr,W,1);
  for(let x=-((ROUTE.off[3])%24);x<W;x+=24){g.fillStyle='#55556a';g.fillRect(Math.round(x),yr+5,3,10);}
  for(let x=-((ROUTE.off[3])%260);x<W+40;x+=260){const X=Math.round(x);g.fillStyle='#3a3848';g.fillRect(X,yr-H*0.2,3,H*0.2);g.fillRect(X,yr-H*0.2,18,3);
    const l=g.createRadialGradient(X+16,yr-H*0.2+4,1,X+16,yr-H*0.2+4,30);l.addColorStop(0,'rgba(255,225,160,.9)');l.addColorStop(1,'rgba(255,225,160,0)');g.fillStyle=l;g.fillRect(X-16,yr-H*0.2-26,64,60);}
  /* la route */
  const y0=yr+15, y1=H;
  const rg=g.createLinearGradient(0,y0,0,y1);rg.addColorStop(0,'#2a2936');rg.addColorStop(1,'#14131c');g.fillStyle=rg;g.fillRect(0,y0,W,y1-y0);
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,y0+3,W,1);
  const ym=y0+(y1-y0)*0.42;
  g.fillStyle='rgba(235,230,200,.85)';for(let x=-((ROUTE.off[4])%70);x<W;x+=70)g.fillRect(Math.round(x),Math.round(ym),36,3);
  /* reflets néon sur l'asphalte */
  g.globalAlpha=0.08;['#ff4fb0','#7fe8ff','#ffd98a'].forEach((c,i)=>{g.fillStyle=c;for(let x=-((ROUTE.off[4]*0.9+i*90)%240);x<W;x+=240)g.fillRect(Math.round(x),Math.round(y0+10+i*9),70,1);});g.globalAlpha=1;
  /* la voiture : profil repeint, néon sous caisse, une vibration qui suit le régime */
  const im=ROUTE.img;
  if(im){const cw=Math.min(W*0.66,440), ch=cw*im.height/im.width;
    const bx=Math.round(W*0.12), by=Math.round(ym+ (y1-ym)*0.55 - ch);
    const vib=ROUTE.rpm>6800?Math.round(Math.sin(t/18)*1):0;
    if(ESSAI.tuning&&ESSAI.tuning.neon){const n=g.createRadialGradient(bx+cw/2,by+ch,4,bx+cw/2,by+ch,cw*0.55);n.addColorStop(0,ESSAI.tuning.neon+'aa');n.addColorStop(1,ESSAI.tuning.neon+'00');
      g.save();g.translate(bx+cw/2,by+ch);g.scale(1,0.18);g.translate(-(bx+cw/2),-(by+ch));g.fillStyle=n;g.beginPath();g.arc(bx+cw/2,by+ch,cw*0.55,0,7);g.fill();g.restore();}
    g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(bx+cw/2,by+ch-2,cw*0.46,5,0,0,7);g.fill();
    g.drawImage(im,bx,by+vib,Math.round(cw),Math.round(ch));}
  /* les aiguilles et l'affichage, en vrai vectoriel net */
  const ar=-225+Math.min(8000,ROUTE.rpm)/8000*270, av=-225+Math.min(280,ROUTE.v)/280*270;
  const A1=$('rtAigRpm'),A2=$('rtAigVit');if(A1)A1.style.transform='rotate('+ar+'deg)';if(A2)A2.style.transform='rotate('+av+'deg)';
  if($('rtVit'))$('rtVit').textContent=Math.round(ROUTE.v);if($('rtRap'))$('rtRap').textContent=ROUTE.v<0.5&&!CMD.gaz?'N':ROUTE.rap;
}
function boucleRoute(t){
  if(!ESSAI.actif)return;
  const dt=Math.min(0.05,ROUTE.tp?(t-ROUTE.tp)/1000:0.016);ROUTE.tp=t;
  majRoute(dt);dessinerRoute(t);
  ROUTE.raf=requestAnimationFrame(boucleRoute);
}
function debutEssai(v,aMoi){
  ESSAI.actif=true;ESSAI.garage=aMoi||null;
  ESSAI.tuning=v&&v.id?tuningDe(v,aMoi):(aMoi&&aMoi.tuning)||{};
  ESSAI.perf=perfDuTuning(ESSAI.tuning);
  ESSAI.nom=(aMoi&&aMoi.nom?'« '+aMoi.nom+' » · ':'')+[v.marque,v.modele].filter(Boolean).join(' ');
  ROUTE.v=0;ROUTE.rap=1;ROUTE.rpm=900;ROUTE.km=0;ROUTE.chrono=0;ROUTE.meilleur=null;ROUTE.off=[0,0,0,0,0];ROUTE.tp=0;ROUTE.img=null;
  montrerRoute();
  const sp=(v.photos||[]).find(q=>q.role==='sprite_pixel');
  if(sp)chargerImgTK(sp.fichier).then(img=>{if(img)ROUTE.img=repeindreProfil(img,ESSAI.tuning);});
  if(!IMGS_TK.__rue)chargerImgTK('assets/tokyo/rue_haut.png').then(img=>{IMGS_TK.__rue=img;});
  ROUTE.raf=requestAnimationFrame(boucleRoute);
}
function finEssai(){
  ESSAI.actif=false;
  /* SA PROPRE VOITURE : les compteurs du garage avancent */
  if(ESSAI.garage){const v=ESSAI.garage;v.km=(v.km||0)+ROUTE.km;v.sorties=(v.sorties||0)+1;
    if(ROUTE.meilleur&&(!v.zeroCent||ROUTE.meilleur<v.zeroCent))v.zeroCent=+ROUTE.meilleur.toFixed(2);try{sauver();}catch(x){}}
  ESSAI.garage=null;
  cacherRoute();
}
/* le monde ne bouge pas pendant la route : le piéton attend devant le concessionnaire */
function majEssai(){}
function dessinerEssai(){}
;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirConcessionTokyo,fermerConcessionTokyo,ESSAI,debutEssai,finEssai,majEssai,dessinerEssai})
