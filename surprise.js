/* ================= LES SURPRISES PERSONNELLES =================
   Une annonce pour UN joueur, montrée UNE fois. Le serveur décide de tout :
   ma_surprise() ne répond qu'au joueur connecté (auth.uid), et
   ouvrir_surprise() marque la surprise comme vue et verse le cadeau en une
   seule opération — on l'appelle dès que l'annonce s'affiche, pour qu'elle
   ne revienne jamais, même si l'on ferme le jeu en plein milieu.

   La première : 10 000 € pour Certifierbio.
     1. des poules qui dansent sous une boule à facettes → « Continuer »
     2. deux dockers qui se battent sur un ring ; une dame arrive avec un
        gâteau, le gâteau explose, un chèque de 10 000 € apparaît. */

async function rpcSurprise(nom,args){
  if(typeof sb==='undefined'||!sb)return null;
  try{
    const s=await sb.auth.getSession();
    if(!s||!s.data||!s.data.session){try{await window.BD_SESSION.reveiller(sb);}catch(x){}}
    const {data,error}=await sb.rpc(nom,args||{});
    return error?null:data;
  }catch(x){return null;}
}

async function montrerLaSurprise(essai){
  const d=await rpcSurprise('ma_surprise');
  if(!d||!d.surprise)return;
  /* une autre fenêtre est ouverte (l'annonce générale…) : on attend qu'elle se ferme */
  if(typeof pageOuverte==='function'&&pageOuverte()){
    if((essai||0)<60)setTimeout(()=>montrerLaSurprise((essai||0)+1),1500);
    return;
  }
  const S={id:d.surprise,cadeau:d.cadeau||0,scene:1,t0:performance.now(),raf:0,verse:null,cheque:false};
  /* tout de suite : vue une fois, cadeau versé */
  rpcSurprise('ouvrir_surprise',{p_id:S.id}).then(r=>{
    if(r&&typeof r.euros==='number'){S.verse=r.verse;try{e.euros=r.euros;sauver();majHaut();}catch(x){}}
  });

  const z=document.createElement('div');z.id='surprise';
  z.style.cssText='position:fixed;inset:0;z-index:60;background:#0b0816;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Baloo 2",-apple-system,system-ui,sans-serif;color:#fff;-webkit-user-select:none;user-select:none';
  z.innerHTML=
    '<div style="position:relative;width:min(92vw,440px)">'+
      '<small id="spSur" style="display:block;text-align:center;font:700 11px ui-monospace,monospace;letter-spacing:3px;color:#ff4fb0">UNE ANNONCE RIEN QUE POUR TOI</small>'+
      '<b id="spTitre" style="display:block;text-align:center;font:800 28px \'Baloo 2\',sans-serif;margin:4px 0 12px;line-height:1.1"></b>'+
      '<div style="position:relative">'+
        '<canvas id="spCv" width="200" height="160" style="display:block;width:100%;height:auto;image-rendering:pixelated;border-radius:18px;box-shadow:0 0 40px #ff4fb055"></canvas>'+
        '<div id="spCheque" style="position:absolute;left:4%;right:4%;top:50%;transform:translateY(-50%) scale(.2) rotate(-8deg);opacity:0;transition:transform .7s cubic-bezier(.2,1.6,.4,1),opacity .4s;'+
          'background:linear-gradient(135deg,#fffaf0,#f2e6c8);color:#2b2418;border-radius:10px;padding:14px 16px;box-shadow:0 12px 40px #000a;border:2px solid #c9a24a;font-family:Georgia,serif">'+
          '<div style="display:flex;justify-content:space-between;font:700 10px ui-monospace,monospace;letter-spacing:2px;color:#8a6a3a"><span>BANQUE DU VIEUX-PORT</span><span>N° 000 001</span></div>'+
          '<div style="margin-top:10px;font-size:13px">Payez contre ce chèque la somme de</div>'+
          '<div style="font:italic 15px Georgia,serif;border-bottom:1px dashed #8a6a3a;padding:2px 0">dix mille euros</div>'+
          '<div style="margin-top:6px;font-size:13px">à l’ordre de <b>Certifierbio</b></div>'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px">'+
            '<span style="font:900 26px Georgia,serif;color:#1a6b3a;background:#e8f2dc;border:2px solid #1a6b3a;border-radius:6px;padding:2px 10px">10 000,00 €</span>'+
            '<span style="font:italic 18px \'Brush Script MT\',cursive;color:#2a3a8a;transform:rotate(-6deg)">Battle Dock</span></div></div>'+
      '</div>'+
      '<p id="spTxt" style="text-align:center;font:600 15px sans-serif;color:#d8d0f0;margin:14px 0 0;min-height:44px;line-height:1.4"></p>'+
      '<button id="spBtn" style="display:block;width:100%;margin-top:10px;min-height:54px;border-radius:16px;border:0;background:#ff4fb0;color:#fff;font:800 17px \'Baloo 2\',sans-serif;box-shadow:0 6px 0 #a02a6e">Continuer</button>'+
    '</div>';
  document.body.appendChild(z);
  const cv=z.querySelector('#spCv'), g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  const W=200,H=160;
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  const A=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
  const parts=[];
  const textes=()=>{
    if(S.scene===1){$('spTitre').textContent='Certifierbio, c’est la fête !';$('spTxt').textContent='Les poules du port ont répété toute la nuit. Rien que pour toi.';$('spBtn').textContent='Continuer';}
    else{$('spSur').textContent='LE GRAND COMBAT DES DOCKS';$('spTitre').textContent='Le ring du Vieux-Port';$('spTxt').textContent='Ding ding ! Deux dockers règlent leurs comptes…';$('spBtn').style.visibility='hidden';}
  };
  textes();

  /* ---------- SCÈNE 1 : LES POULES QUI DANSENT ---------- */
  const poule=(x,y,t,i)=>{
    const saut=Math.max(0,Math.sin(t*7+i*1.3))*6, pas=Math.sin(t*7+i*1.3)>0?1:-1;
    const Y=y-saut, aile=Math.sin(t*14+i)*3;
    R(x-6,y+1,12,2,'rgba(0,0,0,.35)');
    /* pattes */
    R(x-3,Y+6,1,4+(pas>0?1:0),'#f0a020');R(x+2,Y+6,1,4+(pas<0?1:0),'#f0a020');R(x-4,Y+10+(pas>0?1:0),3,1,'#f0a020');R(x+1,Y+10+(pas<0?1:0),3,1,'#f0a020');
    /* corps, queue, ailes */
    R(x-6,Y-4,12,10,'#f4f1ea');R(x-5,Y-5,10,1,'#ffffff');R(x-7,Y-2,1,6,'#d8d2c4');
    R(x-9,Y-8,3,5,'#e8e2d4');R(x-10,Y-10,2,3,'#d8d2c4');
    R(x-6,Y-1+aile*0.3,3,5,'#ddd6c6');R(x+3,Y-1-aile*0.3,3,5,'#ddd6c6');
    R(x-8,Y+aile,3,2,'#ece6d8');R(x+5,Y-aile,3,2,'#ece6d8');
    /* tête, crête, bec, œil, barbillon */
    const tx=x+3+Math.round(Math.sin(t*7+i)*1.5);
    R(tx-1,Y-11,6,7,'#f4f1ea');R(tx,Y-14,2,3,'#e0242a');R(tx+2,Y-13,2,2,'#e0242a');
    R(tx+5,Y-9,3,2,'#f0a020');R(tx+3,Y-10,1,1,'#14141a');R(tx+4,Y-7,1,2,'#e0242a');
  };
  const scene1=t=>{
    /* la salle : sol en damier, rideau, boule à facettes, faisceaux */
    const k=g.createLinearGradient(0,0,0,H);k.addColorStop(0,'#1a0f2e');k.addColorStop(1,'#2a1340');g.fillStyle=k;g.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=8)R(x,0,4,60,'#3a1530');
    for(let y=104;y<H;y+=8)for(let x=0;x<W;x+=8){const on=((x+y)/8+Math.floor(t*4))%2;R(x,y,8,8,on?['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'][((x/8)+(y/8)+Math.floor(t*2))%4]:'#241433');}
    g.save();g.globalAlpha=0.16;
    ['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'].forEach((c,i)=>{const a=t*0.9+i*1.57;g.fillStyle=c;g.beginPath();g.moveTo(100,16);g.lineTo(100+Math.cos(a)*170-14,170);g.lineTo(100+Math.cos(a)*170+14,170);g.fill();});
    g.restore();
    R(99,0,1,10,'#888');for(let i=0;i<16;i++){const a=i/16*Math.PI*2+t*2;R(100+Math.cos(a)*5-1,16+Math.sin(a)*5-1,2,2,i%3?'#d8d8e8':'#ffffff');}R(97,13,6,6,'#b8b8c8');
    for(let i=0;i<8;i++)R(A(i)*W,A(i+9)*50,1,1,(Math.sin(t*6+i)>0.6)?'#fff':'#ffffff44');
    /* cinq poules en ligne, en décalé */
    for(let i=0;i<5;i++)poule(30+i*35,112+(i%2)*6,t,i);
    /* notes de musique qui montent */
    for(let i=0;i<5;i++){const p=(t*0.5+A(i))%1, x=20+A(i*3)*160, y=95-p*70;g.globalAlpha=1-p;R(x,y,1,5,'#ffd98a');R(x-2,y+4,3,2,'#ffd98a');R(x,y,3,1,'#ffd98a');g.globalAlpha=1;}
  };

  /* ---------- SCÈNE 2 : LE RING, LA DAME, LE GÂTEAU, LE CHÈQUE ---------- */
  const docker=(x,y,t,sens,coup,casque)=>{
    const b=Math.round(Math.sin(t*10)*1);
    R(x-7,y+20,14,2,'rgba(0,0,0,.3)');
    R(x-4,y+10+b,3,10,'#2a4a8a');R(x+1,y+10-b,3,10,'#2a4a8a');R(x-5,y+19,5,2,'#3a2a1c');R(x+1,y+19,5,2,'#3a2a1c');   /* jean, chaussures */
    R(x-5,y-2,10,12,'#ff7a1a');R(x-5,y+3,10,2,'#e8f0f0');R(x-1,y-2,2,12,'#e8f0f0');                                     /* gilet orange, bandes */
    R(x-3,y-9,6,7,'#e0a878');R(x+(sens>0?1:-2),y-7,1,1,'#14141a');                                                    /* tête */
    R(x-4,y-12,8,4,casque);R(x-5,y-9,10,1,casque);                                                                      /* casque de chantier */
    const bras=coup?10:3, yb=y+1;
    R(x+(sens>0?4:-4-bras),yb,bras,2,'#e0a878');R(x+(sens>0?4+bras:-8-bras),yb-1,4,4,'#d01426');                       /* le bras qui frappe et son gant */
    R(x+(sens>0?-6:3),yb+2,3,2,'#e0a878');R(x+(sens>0?-9:5),yb+1,4,4,'#d01426');                                       /* la garde */
  };
  const dame=(x,y,t,marche)=>{
    const p=marche?Math.round(Math.sin(t*9)*1):0;
    R(x-6,y+24,12,2,'rgba(0,0,0,.3)');
    R(x-3,y+18,2,6+p,'#e0a878');R(x+1,y+18,2,6-p,'#e0a878');R(x-4,y+23+p,3,1,'#c01450');R(x+1,y+23-p,3,1,'#c01450');
    R(x-6,y+4,12,14,'#ff79c4');R(x-7,y+12,14,6,'#ff4fb0');R(x-5,y+4,10,2,'#ffd0e6');                                    /* robe à volants */
    R(x-3,y-4,6,8,'#e0b088');R(x-2,y-2,1,1,'#14141a');R(x+1,y-2,1,1,'#14141a');R(x-1,y+1,3,1,'#c04050');               /* visage, sourire */
    R(x-4,y-7,8,4,'#6a3a1c');R(x-2,y-10,4,3,'#6a3a1c');R(x-5,y-4,2,6,'#6a3a1c');                                        /* chignon */
    R(x-9,y+6,4,2,'#e0b088');R(x+5,y+6,4,2,'#e0b088');                                                                  /* bras tendus */
  };
  const gateau=(x,y,t)=>{
    R(x-9,y+6,18,2,'#d8d8e0');                                                                                           /* le plat */
    R(x-7,y,14,6,'#f4e0c0');R(x-7,y,14,1,'#ffffff');R(x-5,y-5,10,5,'#ff9ac8');R(x-5,y-5,10,1,'#ffd0e6');                 /* deux étages */
    for(let i=0;i<7;i++)R(x-7+i*2,y+1,1,2,'#ff4fb0');
    for(const cx of [-3,0,3]){R(x+cx,y-9,1,4,'#7fe8ff');R(x+cx,y-11+Math.round(Math.sin(t*20+cx)),1,2,'#ffd21f');}       /* les bougies */
  };
  const scene2=t=>{
    const k=g.createLinearGradient(0,0,0,H);k.addColorStop(0,'#0c0a1a');k.addColorStop(1,'#1a1430');g.fillStyle=k;g.fillRect(0,0,W,H);
    /* la foule, les flashs */
    for(let i=0;i<40;i++){const x=(i*13)%W, y=40+((i*7)%14)+Math.round(Math.sin(t*6+i)*1.5);R(x,y,6,8,'#241c3a');R(x+1,y-4,4,4,'#2c2246');}
    for(let i=0;i<4;i++)if(A(i+Math.floor(t*5))>0.75)R(A(i*7+Math.floor(t*5))*W,44+A(i)*10,3,3,'#fff');
    /* les projecteurs */
    g.save();g.globalAlpha=0.12;g.fillStyle='#fff6d0';g.beginPath();g.moveTo(60,0);g.lineTo(30,150);g.lineTo(100,150);g.fill();g.beginPath();g.moveTo(140,0);g.lineTo(100,150);g.lineTo(170,150);g.fill();g.restore();
    /* le ring : tapis bleu, poteaux, cordes */
    R(14,108,172,40,'#1e4aa8');R(14,108,172,2,'#3a6ad0');R(10,146,180,6,'#122a6a');
    for(const x of [14,184]){R(x-2,74,4,74,'#c8c8d0');R(x-3,72,6,4,'#d01426');}
    [[80,'#d01426'],[90,'#f4f4f6'],[100,'#1a5fd0']].forEach(([y,c])=>R(14,y,172,2,c));
    const fin=t>4.2, arrivee=Math.min(1,Math.max(0,(t-4.2)/2.2)), boum=t>7.4;
    /* les deux dockers : ils cognent, puis s'arrêtent net en voyant la dame */
    const c1=!fin&&Math.sin(t*9)>0.5, c2=!fin&&Math.sin(t*9+Math.PI)>0.5;
    docker(80+(fin?-6:Math.round(Math.sin(t*3)*3)),88,t,1,c1,'#ffd21f');
    docker(120+(fin?6:Math.round(-Math.sin(t*3)*3)),88,t,-1,c2,'#f4f4f6');
    if(!fin&&(c1||c2)){const px=c1?103:97;R(px-6,80,12,8,'#ffd21f');g.fillStyle='#d01426';g.font='bold 7px monospace';g.fillText('POW',px-6,87);}
    /* la dame entre par la droite avec le gâteau */
    if(t>4.2){const dx=Math.round(210-arrivee*110), dy=96;
      dame(dx,dy,t,arrivee<1);
      if(!boum){const tremble=t>6.8?Math.round((A(Math.floor(t*30))-0.5)*3):0;gateau(dx-1+tremble,dy+1,t);}
    }
    /* le gâteau explose : flash, crème, confettis */
    if(boum&&!S.explose){S.explose=true;
      for(let i=0;i<120;i++){const a=A(i)*Math.PI*2, v=30+A(i+50)*90;parts.push({x:99,y:96,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,c:['#ff9ac8','#f4e0c0','#ffffff','#ffd21f','#7fe8ff','#ff4fb0'][i%6],vie:1.6+A(i+9)});}
      try{navigator.vibrate&&navigator.vibrate([60,40,120]);}catch(x){}
      setTimeout(()=>{const c=$('spCheque');if(c){c.style.opacity='1';c.style.transform='translateY(-50%) scale(1) rotate(-3deg)';}
        $('spTitre').textContent='Félicitations !';
        $('spTxt').textContent=(S.verse===0)?'Ce chèque est déjà sur ton compte.':'10 000 € viennent d’arriver sur ton compte.';
        $('spBtn').textContent='Encaisser et jouer';$('spBtn').style.visibility='visible';S.cheque=true;},700);}
    if(boum){const fl=Math.max(0,1-(t-7.4)*2.5);if(fl>0){g.fillStyle='rgba(255,250,230,'+fl+')';g.fillRect(0,0,W,H);}}
    if(t>2.2&&t<4.2){$('spTxt').textContent=t<3.2?'Le casque jaune envoie un crochet…':'Le casque blanc répond !';}
    if(t>4.4&&t<7.4)$('spTxt').textContent='Mais… qui arrive là avec un gâteau ?';
  };

  const tic=now=>{
    const t=(now-S.t0)/1000, dt=1/60;
    if(S.scene===1)scene1(t);else scene2(t);
    for(const p of parts){p.vy+=140*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vie-=dt;R(p.x,p.y,2,2,p.c);}
    for(let i=parts.length-1;i>=0;i--)if(parts[i].vie<=0||parts[i].y>H+4)parts.splice(i,1);
    S.raf=requestAnimationFrame(tic);
  };
  S.raf=requestAnimationFrame(tic);
  z.querySelector('#spBtn').onclick=()=>{
    if(S.scene===1){S.scene=2;S.t0=performance.now();textes();try{navigator.vibrate&&navigator.vibrate(10);}catch(x){}return;}
    if(S.cheque){cancelAnimationFrame(S.raf);z.remove();try{majHaut();}catch(x){}}
  };
}

;({montrerLaSurprise})
