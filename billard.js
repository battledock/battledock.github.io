/* =====================================================================
   LE BILLARD DU VILLAGE — billard à 8 boules, contre Dédé (ou à deux sur le même téléphone).
   On vise en tirant en arrière depuis la boule blanche (comme un lance-pierre), on relâche pour jouer.
   Vraie petite physique : chocs entre boules, rebonds sur les bandes, six poches.
   Règles simplifiées : le premier qui empoche une boule prend sa famille (pleines 1-7 ou rayées 9-15),
   on rejoue tant qu'on empoche une des siennes, la noire (8) en dernier pour gagner ;
   la blanche dans une poche = la main passe et la blanche revient sur son point.
   ===================================================================== */
(()=>{
const CSS=`.bil{position:absolute;inset:0;display:flex;flex-direction:column;background:#1e140c;color:#f6ecd8;font-family:Georgia,serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.bil .hd{padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 6px;display:flex;align-items:center;gap:8px}
.bil .hd b{font:900 16px Georgia;letter-spacing:2px}.bil .hd .x{margin-left:auto;border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:50%;width:34px;height:34px;font:16px Georgia}
.bil .joueurs{display:flex;gap:8px;padding:0 12px 6px}
.bil .joueurs div{flex:1;border-radius:12px;padding:6px 8px;background:rgba(255,255,255,.07);font:12px Georgia;display:flex;align-items:center;gap:6px}
.bil .joueurs div.on{background:rgba(240,200,90,.22);box-shadow:inset 0 0 0 2px #f0c85a}
.bil .joueurs b{font:700 13px Georgia}.bil .joueurs i{font-style:normal;opacity:.8;margin-left:auto}
.bil canvas{flex:1;min-height:0;width:100%;display:block;touch-action:none}
.bil .msg{position:absolute;left:0;right:0;top:46%;text-align:center;font:900 26px Georgia;text-shadow:0 3px 0 rgba(0,0,0,.5);pointer-events:none;transition:opacity .3s}
.bil .aide{text-align:center;font:italic 12px Georgia;opacity:.75;padding:4px 12px calc(env(safe-area-inset-bottom,0px) + 10px)}
.bil .fin{position:absolute;inset:0;background:rgba(20,12,6,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:20px}
.bil .fin h2{margin:0;font:900 28px Georgia}.bil .fin button{border:0;border-radius:22px;padding:12px 20px;font:700 15px Georgia;background:#f0c85a;color:#2a1a0c;min-width:220px}
.bil .fin button.sec{background:transparent;border:2px solid #f6ecd8;color:#f6ecd8}`;
const COUL=['#ffffff','#f0c020','#2050c8','#d82828','#6a2a9a','#f07818','#1f8a3a','#8a1a1a','#141414','#f0c020','#2050c8','#d82828','#6a2a9a','#f07818','#1f8a3a','#8a1a1a'];
function billard(modeDeux){
  if(!document.getElementById('cssBil')){const st=document.createElement('style');st.id='cssBil';st.textContent=CSS;document.head.appendChild(st);}
  $('page2Fond').className='bil';$('page2').classList.add('on');
  const NOMS=[ (e.pseudo||'Toi'), modeDeux?'Joueur 2':'Dédé' ];
  $('page2Fond').innerHTML='<div class="hd"><b>🎱 LE BILLARD</b><button class="x" id="bilX">✕</button></div>'+
    '<div class="joueurs"><div id="bilJ0"><b>'+echapperT(NOMS[0])+'</b><i id="bilF0">—</i></div><div id="bilJ1"><b>'+echapperT(NOMS[1])+'</b><i id="bilF1">—</i></div></div>'+
    '<canvas id="bilC"></canvas><div class="msg" id="bilM"></div><div class="aide">Pose le doigt sur la table, tire en arrière pour viser et doser, relâche pour jouer.</div>';
  let raf=0;const fermer=()=>{cancelAnimationFrame(raf);fermeA=Date.now();$('page2').classList.remove('on');};$('bilX').onclick=fermer;
  const cv=$('bilC'), g=cv.getContext('2d');
  /* la table, en unités : 100 × 200, bandes comprises dans le cadre */
  const TW=100, TH=200, R=2.6, POCHE=5.2;
  const POCHES=[[0,0],[TW,0],[0,TH/2],[TW,TH/2],[0,TH],[TW,TH]];
  let B=[];
  const ranger=()=>{B=[{n:0,x:TW/2,y:TH*0.78,vx:0,vy:0,dans:false}];
    /* le triangle, pointe vers la blanche ; la noire au centre, une pleine et une rayée aux coins du fond */
    const ordre=[1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];let k=0;const sx=TW/2, sy=TH*0.27, d=R*2+0.5;
    /* un triangle jamais tout à fait parfait, comme dans la vraie vie : c'est ce qui fait éclater la casse */
    for(let r=0;r<5;r++)for(let c=0;c<=r;c++){B.push({n:ordre[k++],x:sx+(c-r/2)*d+(Math.random()-.5)*0.6,y:sy-r*d*0.87+(Math.random()-.5)*0.6,vx:0,vy:0,dans:false});}};
  ranger();
  let tour=0, familles=[null,null], empochesCeCoup=[], blancheTombee=false, bougent=false, fini=false, premierTouche=null;
  const famille=(n)=>n===0?null:(n===8?'noire':(n<8?'pleines':'rayees'));
  const nomF={pleines:'pleines (1-7)',rayees:'rayées (9-15)'};
  const msg=(t)=>{const m=$('bilM');m.textContent=t;m.style.opacity=1;clearTimeout(m._t);m._t=setTimeout(()=>m.style.opacity=0,1600);};
  const majBandeau=()=>{[0,1].forEach(i=>{$('bilJ'+i).classList.toggle('on',tour===i&&!fini);
    const reste=familles[i]?B.filter(b=>!b.dans&&famille(b.n)===familles[i]).length:null;
    $('bilF'+i).textContent=familles[i]?(nomF[familles[i]]+' · '+reste):'—';});};
  majBandeau();
  /* LA PHYSIQUE */
  const pas=(dt)=>{let mv=false;
    for(const b of B){if(b.dans)continue;b.x+=b.vx*dt;b.y+=b.vy*dt;
      const v=Math.hypot(b.vx,b.vy);if(v>0){const nv=Math.max(0,v-(22+v*0.25)*dt);b.vx*=nv/v;b.vy*=nv/v;if(nv<0.4){b.vx=0;b.vy=0;}else mv=true;}
      /* les poches */
      for(const [px,py] of POCHES){if(Math.hypot(b.x-px,b.y-py)<POCHE){b.dans=true;b.vx=b.vy=0;if(b.n===0)blancheTombee=true;else empochesCeCoup.push(b.n);vibrer(12);break;}}
      if(b.dans)continue;
      /* sortie par un coin sans toucher le fond de la poche : elle y tombe quand même */
      if(b.x<-R||b.x>TW+R||b.y<-R||b.y>TH+R){b.dans=true;b.vx=b.vy=0;if(b.n===0)blancheTombee=true;else empochesCeCoup.push(b.n);continue;}
      /* les bandes (on laisse l'entrée des poches libre) */
      const dansBouche=(x,y)=>POCHES.some(([px,py])=>Math.hypot(x-px,y-py)<POCHE+2.5);
      if(b.x<R&&!dansBouche(b.x,b.y)){b.x=R;b.vx=Math.abs(b.vx)*0.8;}if(b.x>TW-R&&!dansBouche(b.x,b.y)){b.x=TW-R;b.vx=-Math.abs(b.vx)*0.8;}
      if(b.y<R&&!dansBouche(b.x,b.y)){b.y=R;b.vy=Math.abs(b.vy)*0.8;}if(b.y>TH-R&&!dansBouche(b.x,b.y)){b.y=TH-R;b.vy=-Math.abs(b.vy)*0.8;}}
    /* les chocs entre boules : masses égales, choc presque élastique. On passe plusieurs fois : dans un
       paquet serré, l'élan doit traverser toutes les boules dans le même instant (sinon la casse ne casse rien). */
    for(let passe=0;passe<2;passe++)for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i], c=B[j];if(a.dans||c.dans)continue;
      const dx=c.x-a.x, dy=c.y-a.y, d=Math.hypot(dx,dy);if(d>=R*2||d===0)continue;
      const nx=dx/d, ny=dy/d, rec=(R*2-d)/2;a.x-=nx*rec;a.y-=ny*rec;c.x+=nx*rec;c.y+=ny*rec;
      const rel=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;if(rel<=0)continue;const imp=rel;
      a.vx-=imp*nx;a.vy-=imp*ny;c.vx+=imp*nx;c.vy+=imp*ny;
      if(premierTouche===null&&(a.n===0||c.n===0))premierTouche=a.n===0?c.n:a.n;
      if(rel>20)vibrer(4);}
    return mv;};
  /* LA FIN DU COUP : qui rejoue, qui prend quelle famille, qui gagne */
  const finDuCoup=()=>{const moi=tour, lui=1-tour;let garde=false;
    if(empochesCeCoup.includes(8)){
      const reste=familles[moi]?B.filter(b=>!b.dans&&famille(b.n)===familles[moi]).length:99;
      terminer(reste===0&&!blancheTombee?moi:lui, reste===0&&!blancheTombee?'La noire au fond !':'Noire empochée trop tôt…');return;}
    if(!familles[moi]){const f=empochesCeCoup.map(famille).find(x=>x==='pleines'||x==='rayees');
      if(f){familles[moi]=f;familles[lui]=f==='pleines'?'rayees':'pleines';msg(NOMS[moi]+' prend les '+(f==='pleines'?'pleines':'rayées'));}}
    if(familles[moi]&&empochesCeCoup.some(n=>famille(n)===familles[moi]))garde=true;
    if(blancheTombee){garde=false;const bl=B[0];bl.dans=false;bl.x=TW/2;bl.y=TH*0.78;bl.vx=bl.vy=0;
      while(B.some(b=>b!==bl&&!b.dans&&Math.hypot(b.x-bl.x,b.y-bl.y)<R*2.2))bl.y-=1;msg('Blanche dans la poche : la main passe');}
    else if(premierTouche===null){garde=false;msg('Rien touché : la main passe');}
    if(!garde){tour=lui;if(!blancheTombee&&premierTouche!==null&&!empochesCeCoup.length)msg('À '+NOMS[tour]);}
    else msg('Encore à '+NOMS[tour]+' !');
    empochesCeCoup=[];blancheTombee=false;premierTouche=null;majBandeau();
    if(!modeDeux&&tour===1&&!fini)setTimeout(joueIA,900);};
  const terminer=(gagnant,pourquoi)=>{fini=true;majBandeau();
    $('page2Fond').insertAdjacentHTML('beforeend','<div class="fin"><h2>'+(gagnant===0?'🎱 Victoire !':(modeDeux?'🎱 '+echapperT(NOMS[1])+' gagne':'Dédé gagne…'))+'</h2><div>'+pourquoi+'</div>'+
      '<button id="bilRe">Rejouer</button><button class="sec" id="bilDeux">'+(modeDeux?'Jouer contre Dédé':'Jouer à deux sur ce téléphone')+'</button><button class="sec" id="bilSort">Ranger la queue</button></div>');
    if(gagnant===0){jouer('vente','moment');vibrer([30,60,30,60,120]);}
    $('bilRe').onclick=()=>{cancelAnimationFrame(raf);billard(modeDeux);};$('bilDeux').onclick=()=>{cancelAnimationFrame(raf);billard(!modeDeux);};$('bilSort').onclick=fermer;};
  const frapper=(vx,vy)=>{const bl=B[0];bl.vx=vx;bl.vy=vy;bougent=true;empochesCeCoup=[];blancheTombee=false;premierTouche=null;vibrer(10);};
  /* DÉDÉ : il choisit une de ses boules, une poche, calcule l'angle… et tremble un peu */
  const joueIA=()=>{if(fini||bougent)return;const bl=B[0];
    const cibles=B.filter(b=>!b.dans&&b.n!==0&&(familles[1]?famille(b.n)===familles[1]:b.n!==8));
    const liste=cibles.length?cibles:B.filter(b=>!b.dans&&b.n===8);let meilleur=null;
    for(const c of liste)for(const [px,py] of POCHES){const dx=px-c.x, dy=py-c.y, d=Math.hypot(dx,dy);
      const gx=c.x-dx/d*R*2, gy=c.y-dy/d*R*2;                                  /* la boule fantôme */
      const ax=gx-bl.x, ay=gy-bl.y, da=Math.hypot(ax,ay);const cosA=(ax*dx+ay*dy)/(da*d);if(cosA<0.25)continue;
      const score=cosA*2-d/200-da/300;if(!meilleur||score>meilleur.s)meilleur={s:score,ax,ay,da,d};}
    let ax,ay,f;if(meilleur){ax=meilleur.ax;ay=meilleur.ay;f=Math.min(170,60+meilleur.da*0.55+meilleur.d*0.5);}
    else{const c=liste[0]||B[1];ax=c.x-bl.x;ay=c.y-bl.y;f=120;}
    const ang=Math.atan2(ay,ax)+(Math.random()-0.5)*0.07;                         /* la main de Dédé n'est pas parfaite */
    VISEE={ang,f,ia:true,t:performance.now()};setTimeout(()=>{VISEE=null;frapper(Math.cos(ang)*f,Math.sin(ang)*f);},700);};
  /* LA VISÉE AU DOIGT : on tire en arrière depuis n'importe où, la queue suit */
  let VISEE=null, doigt=null;
  const versTable=(ev)=>{const r=cv.getBoundingClientRect();const {ox,oy,E}=cadre();return [(ev.clientX-r.left-ox)/E,(ev.clientY-r.top-oy)/E];};
  cv.addEventListener('pointerdown',ev=>{if(bougent||fini||(!modeDeux&&tour===1))return;doigt=versTable(ev);cv.setPointerCapture(ev.pointerId);});
  cv.addEventListener('pointermove',ev=>{if(!doigt)return;const [x,y]=versTable(ev);const dx=doigt[0]-x, dy=doigt[1]-y, d=Math.hypot(dx,dy);
    VISEE=d>2?{ang:Math.atan2(dy,dx),f:Math.min(260,d*4.2)}:null;});
  cv.addEventListener('pointerup',()=>{if(doigt&&VISEE&&!VISEE.ia&&VISEE.f>8){const {ang,f}=VISEE;frapper(Math.cos(ang)*f,Math.sin(ang)*f);}doigt=null;VISEE=null;});
  /* LE DESSIN */
  let TABLE=null;
  const cadre=()=>{const W=cv.clientWidth, H=cv.clientHeight, marge=14;const E=Math.min((W-marge*2)/(TW+16),(H-marge*2)/(TH+16));
    return {W,H,E,ox:(W-TW*E)/2,oy:(H-TH*E)/2};};
  const graverTable=(D)=>{const {W,H,E,ox,oy}=cadre();const c=document.createElement('canvas');c.width=W*D;c.height=H*D;const q=c.getContext('2d');q.setTransform(D,0,0,D,0,0);
    q.fillStyle='#1e140c';q.fillRect(0,0,W,H);
    /* le cadre en bois, les diamants, le tapis vert */
    const bx=ox-8*E, by=oy-8*E, bw=(TW+16)*E, bh=(TH+16)*E;
    const bois=q.createLinearGradient(bx,0,bx+bw,0);bois.addColorStop(0,'#5a3418');bois.addColorStop(0.5,'#7a4a24');bois.addColorStop(1,'#5a3418');
    q.fillStyle=bois;q.beginPath();q.roundRect(bx,by,bw,bh,6*E);q.fill();
    q.fillStyle='rgba(255,220,160,.12)';q.fillRect(bx+2,by+2,bw-4,2);
    q.fillStyle='#2f6a3a';q.fillRect(ox-3*E,oy-3*E,(TW+6)*E,(TH+6)*E);                                  /* les bandes */
    const tapis=q.createRadialGradient(ox+TW*E/2,oy+TH*E/2,10,ox+TW*E/2,oy+TH*E/2,TH*E*0.7);tapis.addColorStop(0,'#3a8a48');tapis.addColorStop(1,'#2a6a36');
    q.fillStyle=tapis;q.fillRect(ox,oy,TW*E,TH*E);
    q.fillStyle='rgba(0,0,0,.05)';for(let k=0;k<400;k++)q.fillRect(ox+Math.random()*TW*E,oy+Math.random()*TH*E,1,1);
    q.fillStyle='#f0e0b0';for(let k=1;k<4;k++){[[ox+TW*E*k/4,by+4*E],[ox+TW*E*k/4,by+bh-4*E]].forEach(([x,y])=>{q.beginPath();q.arc(x,y,1.2*E/2+1,0,7);q.fill();});}
    for(let k=1;k<8;k++){if(k===4)continue;[[bx+4*E,oy+TH*E*k/8],[bx+bw-4*E,oy+TH*E*k/8]].forEach(([x,y])=>{q.beginPath();q.arc(x,y,1.2*E/2+1,0,7);q.fill();});}
    q.strokeStyle='rgba(255,255,255,.18)';q.lineWidth=1;q.beginPath();q.moveTo(ox,oy+TH*E*0.78);q.lineTo(ox+TW*E,oy+TH*E*0.78);q.stroke();       /* la ligne de tête */
    q.fillStyle='rgba(255,255,255,.3)';q.beginPath();q.arc(ox+TW*E/2,oy+TH*E*0.27,1.5,0,7);q.fill();
    POCHES.forEach(([px,py])=>{q.fillStyle='#0a0604';q.beginPath();q.arc(ox+px*E,oy+py*E,POCHE*E,0,7);q.fill();
      q.strokeStyle='#3a2410';q.lineWidth=2;q.stroke();});
    return c;};
  const boule=(b,E,ox,oy)=>{const x=ox+b.x*E, y=oy+b.y*E, r=R*E;
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x+r*0.25,y+r*0.35,r,r*0.8,0,0,7);g.fill();
    const raye=b.n>8;g.fillStyle=raye?'#f4f0e6':COUL[b.n];g.beginPath();g.arc(x,y,r,0,7);g.fill();
    if(raye){g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();g.fillStyle=COUL[b.n];g.fillRect(x-r,y-r*0.55,r*2,r*1.1);g.restore();}
    if(b.n>0){g.fillStyle='#fff';g.beginPath();g.arc(x,y,r*0.45,0,7);g.fill();g.fillStyle='#111';g.font='700 '+Math.max(6,r*0.65)+'px Georgia';g.textAlign='center';g.fillText(String(b.n),x,y+r*0.22);g.textAlign='left';}
    const l=g.createRadialGradient(x-r*0.4,y-r*0.45,0,x-r*0.2,y-r*0.2,r*1.2);l.addColorStop(0,'rgba(255,255,255,.75)');l.addColorStop(0.25,'rgba(255,255,255,.12)');l.addColorStop(1,'rgba(0,0,0,.25)');
    g.fillStyle=l;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
  let tPrec=performance.now();
  const boucle=(now)=>{if(!$('bilC')){cancelAnimationFrame(raf);return;}
    const D=Math.min(2,devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight;if(cv.width!==Math.round(W*D)){cv.width=Math.round(W*D);cv.height=Math.round(H*D);TABLE=null;}
    if(!TABLE)TABLE=graverTable(D);g.setTransform(1,0,0,1,0,0);g.drawImage(TABLE,0,0);g.setTransform(D,0,0,D,0,0);
    const {E,ox,oy}=cadre();
    const dt=Math.min(0.033,(now-tPrec)/1000);tPrec=now;
    if(bougent){let mv=false;for(let k=0;k<16;k++)mv=pas(dt/16)||mv;if(!mv){bougent=false;finDuCoup();}}
    B.filter(b=>!b.dans).forEach(b=>boule(b,E,ox,oy));
    /* la queue et la ligne de visée */
    if(VISEE&&!bougent){const bl=B[0], x=ox+bl.x*E, y=oy+bl.y*E, ca=Math.cos(VISEE.ang), sa=Math.sin(VISEE.ang);
      /* la trajectoire jusqu'au premier obstacle, et la boule fantôme */
      let t=0,hit=null;for(t=0;t<260;t+=0.5){const px=bl.x+ca*t, py=bl.y+sa*t;if(px<R||px>TW-R||py<R||py>TH-R)break;
        const c=B.find(b=>b!==bl&&!b.dans&&Math.hypot(b.x-px,b.y-py)<R*2);if(c){hit=c;break;}}
      g.strokeStyle='rgba(255,255,255,.55)';g.setLineDash([4,4]);g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+ca*t*E,y+sa*t*E);g.stroke();g.setLineDash([]);
      g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x+ca*t*E,y+sa*t*E,R*E,0,7);g.stroke();
      if(hit){const nx=hit.x-(bl.x+ca*t), ny=hit.y-(bl.y+sa*t), d=Math.hypot(nx,ny);g.strokeStyle='rgba(255,230,150,.6)';g.beginPath();
        g.moveTo(ox+hit.x*E,oy+hit.y*E);g.lineTo(ox+(hit.x+nx/d*25)*E,oy+(hit.y+ny/d*25)*E);g.stroke();}
      const recul=6+VISEE.f*0.12, L=70;g.lineCap='round';
      g.strokeStyle='#5a3418';g.lineWidth=R*E*0.9;g.beginPath();g.moveTo(x-ca*(R+recul)*E,y-sa*(R+recul)*E);g.lineTo(x-ca*(R+recul+L)*E,y-sa*(R+recul+L)*E);g.stroke();
      g.strokeStyle='#e8d0a0';g.lineWidth=R*E*0.55;g.beginPath();g.moveTo(x-ca*(R+recul)*E,y-sa*(R+recul)*E);g.lineTo(x-ca*(R+recul+L*0.55)*E,y-sa*(R+recul+L*0.55)*E);g.stroke();
      g.strokeStyle='#2a5fa8';g.lineWidth=R*E*0.6;g.beginPath();g.moveTo(x-ca*(R+recul)*E,y-sa*(R+recul)*E);g.lineTo(x-ca*(R+recul+1.5)*E,y-sa*(R+recul+1.5)*E);g.stroke();g.lineCap='butt';
      /* la jauge de force */
      const f=VISEE.f/260;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(8,oy,8,TH*E);g.fillStyle=f<0.5?'#6fbf5a':(f<0.8?'#e8c06a':'#d0402f');g.fillRect(8,oy+TH*E*(1-f),8,TH*E*f);}
    raf=requestAnimationFrame(boucle);};
  raf=requestAnimationFrame(boucle);
  msg(NOMS[0]+', à toi de casser !');
}
return {billard};
})()
