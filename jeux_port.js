/* =====================================================================
   LES JEUX DU PORT : LE BOWLING et LA BOXE À L'ARENA (chargés à la première entrée).
   Tout est dessiné une fois (la salle, la foule, la piste) puis seulement posé : fluide.
   ===================================================================== */
(()=>{
const CSS=`.jp{position:absolute;inset:0;display:flex;flex-direction:column;font-family:Georgia,serif;color:#fff;user-select:none;-webkit-user-select:none;overflow:hidden}
.jp.bw{background:#1a1a2e}.jp.bx{background:#0e0e14}
.jp .hd{padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 6px;display:flex;justify-content:space-between;align-items:center;gap:8px}.jp .hd b{font:900 16px Georgia;letter-spacing:2px}
.jp canvas{flex:1;min-height:0;width:100%;display:block;touch-action:none}
.jp .bts{display:flex;gap:10px;padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 12px)}
.jp .bts button{flex:1;height:74px;border:0;border-radius:18px;font:900 17px Georgia;color:#fff;box-shadow:0 5px 0 rgba(0,0,0,.35);touch-action:manipulation}
.jp .bts button:active,.jp .bts button.on{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
.jp .x{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:50%;width:34px;height:34px;font:16px Georgia}
.jp .fin{position:absolute;inset:0;background:rgba(10,10,20,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;text-align:center;z-index:3}
.jp .fin h2{margin:0;font:900 28px Georgia}.jp .fin .t{font:700 30px ui-monospace,monospace;color:#ffe070}
.jp .fin .tab{width:100%;max-width:320px;background:rgba(255,255,255,.08);border-radius:12px;padding:10px;font:14px Georgia;text-align:left}
.jp .fin button{border:0;border-radius:22px;padding:12px 20px;font:700 15px Georgia;background:#ffe070;color:#1a1a2e;min-width:220px}.jp .fin button.sec{background:transparent;border:2px solid #fff;color:#fff}
.jp .scores{display:flex;gap:3px;padding:0 12px 6px}.jp .scores div{flex:1;background:#fff;color:#1a1a2e;border-radius:6px;text-align:center;font:700 11px Georgia;padding:3px 0}
.jp .scores div i{display:block;font:italic 10px Georgia;color:#8a6a1e;min-height:12px}.jp .scores div.on{box-shadow:0 0 0 2px #ff8ac8}
.jp .barres{display:flex;gap:10px;padding:0 12px 4px;align-items:center}.jp .barres .b{flex:1;height:12px;border-radius:6px;background:rgba(255,255,255,.2);overflow:hidden}
.jp .barres .b i{display:block;height:100%;transition:width .15s}.jp .barres span{font:700 11px Georgia;white-space:nowrap}`;
const css=()=>{if(!document.getElementById('cssJeuxPort')){const st=document.createElement('style');st.id='cssJeuxPort';st.textContent=CSS;document.head.appendChild(st);}};
const fermer=(raf)=>{cancelAnimationFrame(raf.id);fermeA=Date.now();$('page2').classList.remove('on');};
const fmt2=(n)=>String(n);
async function finDePartie(jeu,score,titre,detail,rejouer,raf){
  const d=await appelRPC('jeu_port_enregistrer',{p_joueur:e.id,p_jeu:jeu,p_score:score});const T=await appelRPC('jeu_port_tableau',{p_jeu:jeu})||[];
  if(d&&typeof d.euros==='number'){e.euros=d.euros;sauver();majHaut();}
  const tab=jeu==='bowling'?T.map((r,k)=>(k+1)+'. '+echapperT(r.nom)+' · '+r.s).join('<br>'):T.map((r,k)=>(k+1)+'. '+echapperT(r.nom)+' · '+r.victoires+' victoire'+(r.victoires>1?'s':'')).join('<br>');
  $('page2Fond').insertAdjacentHTML('beforeend','<div class="fin"><h2>'+titre+'</h2>'+detail+(d&&d.record?'<div style="color:#9fdfb8;font-weight:700">Nouveau record personnel !</div>':'')+
    (d&&d.gain?'<div style="color:#ffe070;font-weight:700">+'+enEuros(d.gain)+'</div>':(d&&d.payes>=10?'<div style="opacity:.8;font-size:13px">(10 parties payées aujourd’hui : les suivantes sont pour la gloire)</div>':''))+
    '<div class="tab"><b>Le tableau de la semaine</b><br>'+(tab||'Personne encore : sois le premier !')+'</div><button id="jpRe">Rejouer</button><button class="sec" id="jpSort">Ressortir sur le quai</button></div>');
  $('jpRe').onclick=()=>{cancelAnimationFrame(raf.id);rejouer();};$('jpSort').onclick=()=>fermer(raf);}

/* ============================ LE BOWLING ============================
   Cinq frames, deux boules par frame (et les bonus au dernier). On place la boule, on vise,
   on dose la force : trois touchers. La boule roule, les quilles s'entrechoquent (une vraie petite
   physique), puis on compte comme au vrai bowling : strike, spare, bonus. */
function bowling(){
  css();$('page2Fond').className='jp bw';$('page2').classList.add('on');
  $('page2Fond').innerHTML='<div class="hd"><b>🎳 BOWLING</b><span id="bwInfo" style="font:13px Georgia;opacity:.9"></span><button class="x" id="bwX">✕</button></div>'+
    '<div class="scores" id="bwS"></div><canvas id="bwC"></canvas><div class="bts"><button id="bwGo" style="background:#e86aa0">Placer la boule</button></div>';
  const raf={id:0};$('bwX').onclick=()=>fermer(raf);
  const cv=$('bwC'), g=cv.getContext('2d');
  const LW=42, LL=200, PR=1.9, BR=3.6, SPOT=[[0,160],[-3,165.2],[3,165.2],[-6,170.4],[0,170.4],[6,170.4],[-9,175.6],[-3,175.6],[3,175.6],[9,175.6]];
  let quilles, balle, etat='place', t0=performance.now(), place=0, angle=0, force=0, frames=[[]], frame=0, sim=null, msgT='', msgAt=0;
  const couleur=(e.ap&&e.ap.maillot&&e.ap.maillot.c)||['#e86aa0','#2ab0a8','#7a3ab8','#f0a830'][Math.floor(Math.random()*4)];
  const relever=()=>{quilles=SPOT.map(([x,y])=>({x,y,x0:x,y0:y,vx:0,vy:0,tombee:false,debout:true}));};relever();
  const debout=()=>quilles.filter(q=>q.debout);
  const S=()=>{/* le score, frame par frame, comme au vrai bowling (5 frames) */
    const lancers=frames.flat();let tot=0, i=0, res=[];
    for(let f=0;f<5;f++){const F=frames[f]||[];if(!F.length){res.push(null);continue;}
      if(f<4){if(F[0]===10){if(lancers[i+1]===undefined||lancers[i+2]===undefined){res.push(null);i+=1;continue;}tot+=10+lancers[i+1]+lancers[i+2];i+=1;}
        else if(F.length<2){res.push(null);i+=1;continue;}
        else if(F[0]+F[1]===10){if(lancers[i+2]===undefined){res.push(null);i+=2;continue;}tot+=10+lancers[i+2];i+=2;}
        else{tot+=F[0]+F[1];i+=2;}}
      else{const fini=(F[0]===10||F[0]+(F[1]||0)===10)?F.length===3:F.length===2;if(!fini){res.push(null);continue;}tot+=F.reduce((a,b)=>a+b,0);}
      res.push(tot);}
    return {res,tot};};
  const majScores=()=>{const {res}=S();$('bwS').innerHTML=[0,1,2,3,4].map(f=>{const F=frames[f]||[];
      const m=F.map((v,k)=>v===10&&(k===0||f===4&&(F[k-1]===10||(k===2&&F[0]+F[1]===10)))?'X':(k>0&&F[k-1]!==10&&F[k-1]+v===10&&!(f===4&&k===2&&F[0]+F[1]===10)?'/':(v===0?'–':v))).join(' ');
      return '<div class="'+(f===frame?'on':'')+'"><i>'+(m||'&nbsp;')+'</i>'+(res[f]!==null&&res[f]!==undefined?res[f]:'&nbsp;')+'</div>';}).join('');
    $('bwInfo').textContent='frame '+Math.min(5,frame+1)+' / 5';};majScores();
  const bouton=()=>{const b=$('bwGo');b.textContent=etat==='place'?'Placer la boule':etat==='vise'?'Viser':etat==='force'?'Lancer !':'…';b.style.opacity=etat==='roule'?.5:1;};
  $('bwGo').onpointerdown=(ev)=>{ev.preventDefault();const t=(performance.now()-t0)/1000;vibrer(8);
    if(etat==='place'){place=Math.sin(t*1.6)*15;etat='vise';t0=performance.now();}
    else if(etat==='vise'){angle=Math.sin(t*2.2)*0.11;etat='force';t0=performance.now();}
    else if(etat==='force'){force=(1-Math.cos(t*3))/2;lancer();}
    bouton();};
  let AVANT=10;
  const lancer=()=>{AVANT=debout().length;const v=95+force*90;balle={x:place,y:0,vx:Math.sin(angle)*v,vy:Math.cos(angle)*v,rigole:false,effet:(Math.random()-0.5)*6};etat='roule';sim=performance.now();vibrer(15);};
  const pas=(dt)=>{const B=balle;
    if(B){if(!B.rigole){B.vx+=B.effet*dt*(B.y>90?1:0);}B.x+=B.vx*dt;B.y+=B.vy*dt;if(!B.rigole&&Math.abs(B.x)>LW/2-BR*0.4){B.rigole=true;B.vx=0;B.x=Math.sign(B.x)*(LW/2+2);}
      if(B.y>LL+10)balle=null;}
    const objs=quilles.filter(q=>!q.tombee);
    if(balle&&!balle.rigole)for(const q of objs){const dx=q.x-balle.x, dy=q.y-balle.y, d=Math.hypot(dx,dy);
      if(d<PR+BR&&d>0){const nx=dx/d, ny=dy/d, rel=(balle.vx-q.vx)*nx+(balle.vy-q.vy)*ny;if(rel>0){q.vx+=nx*rel*1.7;q.vy+=ny*rel*1.7;balle.vx-=nx*rel*0.18;balle.vy-=ny*rel*0.18;}
        q.x=balle.x+nx*(PR+BR);q.y=balle.y+ny*(PR+BR);}}
    for(let i=0;i<objs.length;i++)for(let j=i+1;j<objs.length;j++){const a=objs[i],b=objs[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy);
      if(d<PR*2&&d>0){const nx=dx/d, ny=dy/d, rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny, rec=(PR*2-d)/2;a.x-=nx*rec;a.y-=ny*rec;b.x+=nx*rec;b.y+=ny*rec;
        if(rel>0){a.vx-=nx*rel*0.9;a.vy-=ny*rel*0.9;b.vx+=nx*rel*0.9;b.vy+=ny*rel*0.9;}}}
    for(const q of objs){const v=Math.hypot(q.vx,q.vy);if(v>0.5){const k=Math.max(0,v-60*dt)/v;q.vx*=k;q.vy*=k;q.x+=q.vx*dt;q.y+=q.vy*dt;}else{q.vx=q.vy=0;}
      if(Math.hypot(q.x-q.x0,q.y-q.y0)>1.2)q.debout=false;if(Math.abs(q.x)>LW/2+1||q.y>LL+6){q.tombee=true;q.debout=false;}}};
  const apresLancer=()=>{const F=frames[frame];let n=Math.max(0,AVANT-debout().length);F.push(n);        /* les quilles tombées pendant CE lancer */
    if(n===10&&AVANT===10){msgT='STRIKE !';jouer('vente','moment');vibrer([30,50,30,50,80]);}
    else if(AVANT<10&&n===AVANT){msgT='SPARE !';jouer('vente','moment');vibrer([20,40,20]);}
    else if(n===0)msgT=balle&&balle.rigole?'Rigole…':'Raté…';else msgT=n+' quille'+(n>1?'s':'');msgAt=performance.now();
    let nouvelle=false;
    if(frame<4){if(F[0]===10||F.length===2){frame++;frames[frame]=[];nouvelle=true;}}
    else{const bonus=F[0]===10||(F.length>=2&&F[0]+F[1]===10);const fini=bonus?F.length===3:F.length===2;
      if(fini){majScores();etat='fin';setTimeout(()=>{const {tot}=S();finDePartie('bowling',tot,tot>=100?'🎳 Superbe partie !':(tot>=60?'Belle partie':'Partie terminée'),'<div class="t">'+tot+' points</div>',bowling,raf);},900);return;}
      if(debout().length===0)nouvelle=true;}                                                  /* au dernier frame : quilles relevées après un strike ou un spare */
    if(nouvelle)relever();else quilles=quilles.map(q=>q.debout?Object.assign(q,{x:q.x0,y:q.y0,vx:0,vy:0}):Object.assign(q,{tombee:true}));
    majScores();etat='place';t0=performance.now();bouton();};
  /* LE DESSIN : la piste gravée une fois, les quilles et la boule posées par-dessus */
  let PISTE=null;
  const graverPiste=(W,H,D)=>{const c=document.createElement('canvas');c.width=W*D;c.height=H*D;const q=c.getContext('2d');q.setTransform(D,0,0,D,0,0);
    q.fillStyle='#1a1a2e';q.fillRect(0,0,W,H);const lx=W/2, lw=W*0.62;
    q.fillStyle='#2a2a40';q.fillRect(lx-lw/2-14,0,lw+28,H);const bois=q.createLinearGradient(lx-lw/2,0,lx+lw/2,0);bois.addColorStop(0,'#c8a068');bois.addColorStop(0.5,'#e8c890');bois.addColorStop(1,'#c8a068');
    q.fillStyle=bois;q.fillRect(lx-lw/2,0,lw,H);for(let k=0;k<20;k++){q.fillStyle='rgba(120,80,30,.12)';q.fillRect(lx-lw/2+k*lw/20,0,0.8,H);}
    q.fillStyle='#3a3a50';q.fillRect(lx-lw/2-12,0,10,H);q.fillRect(lx+lw/2+2,0,10,H);
    for(let k=-2;k<=2;k++){const ax=lx+k*lw/8, ay=H*0.62;q.fillStyle='#8a5a2a';q.beginPath();q.moveTo(ax,ay-8);q.lineTo(ax-3,ay);q.lineTo(ax+3,ay);q.fill();}
    q.fillStyle='#e8402a';q.fillRect(lx-lw/2,H-30,lw,2);q.fillStyle='rgba(255,255,255,.12)';q.fillRect(lx-lw/2,0,lw,H*0.18);
    return c;};
  const boucle=(now)=>{if(!$('bwC')){cancelAnimationFrame(raf.id);return;}
    const D=Math.min(2,devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight;if(cv.width!==Math.round(W*D)){cv.width=Math.round(W*D);cv.height=Math.round(H*D);PISTE=null;}
    if(!PISTE)PISTE=graverPiste(W,H,D);g.setTransform(1,0,0,1,0,0);g.drawImage(PISTE,0,0);g.setTransform(D,0,0,D,0,0);
    const lw=W*0.62, K=lw/LW, px=(x)=>W/2+x*K, py=(y)=>H-30-y*((H-60)/LL);
    if(etat==='roule'){let dt=Math.min(0.05,(now-sim)/1000);sim=now;for(let k=0;k<6;k++)pas(dt/6);
      const bouge=quilles.some(q=>!q.tombee&&Math.hypot(q.vx,q.vy)>0.5);if(!balle&&!bouge)apresLancer();}
    /* les quilles */
    quilles.slice().sort((a,b)=>b.y-a.y).forEach(q=>{if(q.tombee&&!(etat==='roule'))return;const x=px(q.x), y=py(q.y), r=PR*K;
      if(q.debout){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+1,y+2,r,r*0.5,0,0,7);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#e8402a';g.fillRect(x-r*0.8,y-r*0.2,r*1.6,r*0.35);}
      else{g.save();g.translate(x,y);g.rotate(Math.atan2(q.vy,q.vx)||0.8);g.fillStyle='#f0ece4';g.fillRect(-r*1.8,-r*0.7,r*3.6,r*1.4);g.fillStyle='#e8402a';g.fillRect(-r*0.3,-r*0.7,r*0.5,r*1.4);g.restore();}});
    /* la boule : en attente sur la ligne, ou qui roule */
    const t=(now-t0)/1000;let bx=null, by=null;
    if(balle){bx=px(balle.x);by=py(balle.y);}else if(etat==='place'){bx=px(Math.sin(t*1.6)*15);by=py(0);}else if(etat==='vise'||etat==='force'){bx=px(place);by=py(0);}
    if(bx!==null){const r=BR*K;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(bx+2,by+3,r,r*0.5,0,0,7);g.fill();g.fillStyle=couleur;g.beginPath();g.arc(bx,by,r,0,7);g.fill();
      g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.arc(bx-r*0.35,by-r*0.35,r*0.3,0,7);g.fill();}
    if(etat==='vise'||etat==='force'){const a=etat==='vise'?Math.sin(t*2.2)*0.11:angle;g.strokeStyle='rgba(255,255,255,.8)';g.setLineDash([4,4]);g.lineWidth=1.5;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.sin(a)*K*120,by-(H-60)/LL*120*Math.cos(a));g.stroke();g.setLineDash([]);}
    if(etat==='force'){const f=(1-Math.cos(t*3))/2;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(W-22,H*0.3,12,H*0.4);g.fillStyle=f<.5?'#6fbf5a':(f<.8?'#e8c06a':'#d0402f');g.fillRect(W-21,H*0.7-f*H*0.4,10,f*H*0.4);}
    if(msgT&&now-msgAt<1400){g.font='900 30px Georgia';g.textAlign='center';g.fillStyle='#ff8ac8';g.strokeStyle='#1a1a2e';g.lineWidth=4;g.strokeText(msgT,W/2,H*0.42);g.fillText(msgT,W/2,H*0.42);g.textAlign='left';}
    raf.id=requestAnimationFrame(boucle);};
  bouton();raf.id=requestAnimationFrame(boucle);
}

/* ============================ LA BOXE À L'ARENA ============================
   Trois rounds de 25 secondes contre « Le Marteau de l'Estaque ». DIRECT (rapide, léger),
   CROCHET (il faut armer, ça fait mal), GARDE (on la tient). Il prévient avant de frapper fort :
   son gant recule et un « ! » apparaît — garde, puis contre-attaque ! La foule hurle à chaque coup. */
function boxe(){
  css();$('page2Fond').className='jp bx';$('page2').classList.add('on');
  $('page2Fond').innerHTML='<div class="hd"><b>🥊 ARENA</b><span id="bxR" style="font:700 13px Georgia;color:#ffe070"></span><button class="x" id="bxX">✕</button></div>'+
    '<div class="barres"><span>TOI</span><div class="b"><i id="bxV1" style="width:100%;background:#2a9ad8"></i></div><div class="b"><i id="bxV2" style="width:100%;background:#e8402a"></i></div><span>LE MARTEAU</span></div>'+
    '<canvas id="bxC"></canvas><div class="bts"><button id="bxD" style="background:#2a9ad8">DIRECT</button><button id="bxG" style="background:#5a5a6a">GARDE</button><button id="bxK" style="background:#e8402a">CROCHET</button></div>';
  const raf={id:0};$('bxX').onclick=()=>fermer(raf);
  const cv=$('bxC'), g=cv.getContext('2d');
  const apMoi=Object.assign({},e.ap||DEF_AP);delete apMoi.maillot;delete apMoi.deguisement;apMoi.haut=4;apMoi.veste=PALETTES.peau[apMoi.peau]||PALETTES.peau[2];apMoi.bas=1;apMoi.pantalon='#2a9ad8';apMoi.sac=0;apMoi.chapeau=0;
  const apLui=Object.assign({},DEF_AP,{peau:5,cheveux:0,coiffe:20,barbe:4,haut:4,veste:PALETTES.peau[5],bas:1,pantalon:'#c8281e',corps:4,sac:0,chapeau:0,sourcils:3});
  const copie=(src)=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c;};
  const poses={moi:[0,1,2,3].map(i=>copie(poseDe(apMoi,'droite',i?100+i:0))),lui:[0,1,2,3].map(i=>copie(poseDe(apLui,'gauche',i?100+i:0)))};
  const B=(qui)=>({qui,pv:100,etat:'idle',t:0,coup:null,garde:false,choc:0});
  const moi=B('moi'), lui=B('lui');let round=1, tRound=25, pause=0, fin=false, cris=[], secousse=0, iaT=1.2, gardeTenue=false;
  const COUPS={direct:{arme:0.12,frappe:0.14,degat:5},crochet:{arme:0.42,frappe:0.2,degat:13}};
  const frapper=(A,type)=>{if(fin||pause>0||A.etat!=='idle'||A.pv<=0)return;A.etat='arme';A.coup=type;A.t=0;A.garde=false;};
  const bD=$('bxD'), bK=$('bxK'), bG=$('bxG');
  bD.onpointerdown=(ev)=>{ev.preventDefault();bD.classList.add('on');frapper(moi,'direct');vibrer(6);};bD.onpointerup=bD.onpointerleave=()=>bD.classList.remove('on');
  bK.onpointerdown=(ev)=>{ev.preventDefault();bK.classList.add('on');frapper(moi,'crochet');vibrer(6);};bK.onpointerup=bK.onpointerleave=()=>bK.classList.remove('on');
  bG.onpointerdown=(ev)=>{ev.preventDefault();bG.classList.add('on');gardeTenue=true;};bG.onpointerup=bG.onpointerleave=()=>{bG.classList.remove('on');gardeTenue=false;};
  const crier=(t,x)=>{cris.push({t,x:x||0.5,n:performance.now()});if(cris.length>5)cris.shift();};
  const toucher=(A,D2)=>{const C=COUPS[A.coup];let deg=C.degat*(0.85+Math.random()*0.3);
    if(D2.garde){deg*=0.2;crier('Paré !',D2.qui==='moi'?0.3:0.7);}else{D2.etat='choc';D2.t=0;D2.choc=1;secousse=A.coup==='crochet'?6:3;crier(A.coup==='crochet'?['OUAAAIS !','QUEL CROCHET !','BOUM !'][Math.floor(Math.random()*3)]:['Pan !','Joli !','Encore !'][Math.floor(Math.random()*3)],D2.qui==='moi'?0.3:0.7);
      if(D2.qui==='moi')vibrer(A.coup==='crochet'?[40,30,40]:25);else if(A.coup==='crochet')vibrer(20);}
    D2.pv=Math.max(0,D2.pv-deg);if(D2.pv<=0){D2.etat='ko';fin=true;crier('K.O. !!!',0.5);setTimeout(()=>terminer(),1600);}};
  const terminer=()=>{const gagne=lui.pv<=0?2:(moi.pv<=0?0:(moi.pv>lui.pv?1:0));
    finDePartie('boxe',gagne,gagne===2?'🥊 K.O. ! Victoire !':(gagne===1?'🏆 Victoire aux points':(moi.pv<=0?'K.O.… tu as perdu':'Défaite aux points')),
      '<div style="font:14px Georgia;opacity:.9">Toi '+Math.round(moi.pv)+' · Le Marteau '+Math.round(lui.pv)+'</div>',boxe,raf);};
  const maj=(A,D2,dt)=>{A.t+=dt;if(A.choc>0)A.choc=Math.max(0,A.choc-dt*3);
    if(A.etat==='arme'&&A.t>=COUPS[A.coup].arme){A.etat='frappe';A.t=0;toucher(A,D2);}
    else if(A.etat==='frappe'&&A.t>=COUPS[A.coup].frappe){A.etat='idle';A.t=0;A.coup=null;}
    else if(A.etat==='choc'&&A.t>=0.3){A.etat='idle';A.t=0;}};
  /* LA SALLE, gravée une fois : les projecteurs, la foule (deux images qui alternent), le ring */
  let SALLE=null;
  const graverSalle=(W,H,D,ph)=>{const c=document.createElement('canvas');c.width=W*D;c.height=H*D;const q=c.getContext('2d');q.setTransform(D,0,0,D,0,0);
    q.fillStyle='#0e0e14';q.fillRect(0,0,W,H);
    for(let k=0;k<3;k++){const x=W*(0.2+k*0.3);const l=q.createLinearGradient(x,0,W/2,H*0.6);l.addColorStop(0,'rgba(255,240,200,.18)');l.addColorStop(1,'rgba(255,240,200,0)');q.fillStyle=l;q.beginPath();q.moveTo(x-6,0);q.lineTo(x+6,0);q.lineTo(W/2+80,H*0.62);q.lineTo(W/2-80,H*0.62);q.fill();}
    /* la foule : des rangées de têtes et d'épaules, en perspective */
    for(let r=0;r<9;r++){const y=H*0.1+r*H*0.045, s=0.55+r*0.07;for(let x=-10;x<W+10;x+=10*s){const h=Math.sin(x*12.9+r*78.2)*43758.5;const u=h-Math.floor(h);
      const saut=((Math.floor(u*10)+ph)%3===0)?-2*s:0, cc=['#2a9ad8','#e8402a','#f4f4f4','#1d4f8a','#f0c040','#3a3a44'][Math.floor(u*6)];
      q.fillStyle=cc;q.fillRect(x-4*s,y+saut,8*s,7*s);q.fillStyle=['#e8c49a','#c08a58','#7d4e2a','#f0d0ae'][Math.floor(u*40)%4];q.beginPath();q.arc(x,y-3*s+saut,3*s,0,7);q.fill();
      if(u>0.9){q.fillStyle=cc;q.fillRect(x+3*s,y-9*s+saut,2*s,6*s);}}}                                              /* des bras levés */
    /* le ring : le tapis, le tablier, les poteaux et les cordes */
    const y0=H*0.5, y1=H*0.93, xg0=W*0.14, xd0=W*0.86, xg1=W*0.02, xd1=W*0.98;
    q.fillStyle='#1d4f8a';q.beginPath();q.moveTo(xg1,y1);q.lineTo(xd1,y1);q.lineTo(xd1,H);q.lineTo(xg1,H);q.fill();
    q.fillStyle='#e8e4dc';q.beginPath();q.moveTo(xg0,y0);q.lineTo(xd0,y0);q.lineTo(xd1,y1);q.lineTo(xg1,y1);q.closePath();q.fill();
    q.fillStyle='rgba(0,0,0,.06)';for(let k=0;k<8;k++){q.fillRect(W*0.2+k*W*0.08,y0,1,y1-y0);}
    q.font='900 '+Math.round(W*0.07)+'px "Trebuchet MS",sans-serif';q.textAlign='center';q.fillStyle='rgba(200,40,30,.25)';q.fillText('ARENA',W/2,(y0+y1)/2+10);q.textAlign='left';
    [[xg0,y0],[xd0,y0]].forEach(([x,y])=>{q.fillStyle='#c8ccd2';q.fillRect(x-2,y-60,4,60);});
    [['#e8402a',42],['#f4f4f4',30],['#2a9ad8',18]].forEach(([cc,hh])=>{q.strokeStyle=cc;q.lineWidth=2.5;q.beginPath();q.moveTo(xg0,y0-hh);q.lineTo(xd0,y0-hh);q.stroke();
      q.beginPath();q.moveTo(xg0,y0-hh);q.lineTo(xg1,y1-hh*1.5);q.stroke();q.beginPath();q.moveTo(xd0,y0-hh);q.lineTo(xd1,y1-hh*1.5);q.stroke();});
    return c;};
  let SALLES=[null,null], tPrec=performance.now();
  const dessinerBoxeur=(A,xc,yc,taille,sens)=>{const img=poses[A.qui][A.etat==='idle'?1+Math.floor(performance.now()/260)%3:0];
    const recul=A.etat==='choc'?-sens*8*A.choc:0, ko=A.etat==='ko';
    g.save();g.translate(xc+recul,yc);if(ko)g.rotate(-sens*1.2);g.drawImage(img,-taille*0.5,-taille*0.96,taille,taille*CASE_H/CASE_L);g.restore();
    if(ko)return;
    /* les gants : ils montent en garde, reculent pour armer, partent en frappe */
    const avant=A.etat==='frappe'?(A.coup==='crochet'?1:0.85):(A.etat==='arme'?-0.3*(A.coup==='crochet'?1.6:1):0);
    const garde=A.garde, r=taille*0.036, gy=yc-taille*(garde?0.40:0.31), gx=xc+recul+sens*taille*(0.11+avant*0.2);
    g.fillStyle=A.qui==='moi'?'#2a9ad8':'#e8402a';
    g.beginPath();g.arc(xc+recul+sens*taille*0.05,yc-taille*(garde?0.37:0.29),r*0.95,0,7);g.fill();                              /* le gant arrière */
    g.beginPath();g.arc(gx,gy+(A.coup==='crochet'&&A.etat==='frappe'?-r:0),r,0,7);g.fill();                                              /* le gant avant */
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(gx-r*0.3,gy-r*0.3,r*0.35,0,7);g.fill();
    if(A.qui==='lui'&&A.etat==='arme'&&A.coup==='crochet'){g.font='900 '+Math.round(taille*0.12)+'px Georgia';g.fillStyle='#ffe070';g.textAlign='center';g.fillText('!',xc,yc-taille*0.56);g.textAlign='left';}};
  const boucle=(now)=>{if(!$('bxC')){cancelAnimationFrame(raf.id);return;}const dt=Math.min(0.05,(now-tPrec)/1000);tPrec=now;
    const D=Math.min(2,devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight;if(cv.width!==Math.round(W*D)){cv.width=Math.round(W*D);cv.height=Math.round(H*D);SALLES=[null,null];}
    const ph=Math.floor(now/340)%2;if(!SALLES[ph])SALLES[ph]=graverSalle(W,H,D,ph);
    const sx=secousse>0?(Math.random()-0.5)*secousse:0;secousse=Math.max(0,secousse-dt*30);
    g.setTransform(1,0,0,1,0,0);g.drawImage(SALLES[ph],sx*D,0);g.setTransform(D,0,0,D,0,0);
    if(!fin){if(pause>0){pause-=dt;if(pause<=0)crier('ROUND '+round+' !',0.5);}
      else{tRound-=dt;moi.garde=gardeTenue&&moi.etat==='idle';maj(moi,lui,dt);maj(lui,moi,dt);
        /* le Marteau réfléchit : il arme un crochet (en prévenant), place un direct, ou se met en garde */
        iaT-=dt;if(lui.etat==='idle'){if(lui.garde&&iaT<0.4)lui.garde=false;
          if(iaT<=0){const r=Math.random();if(moi.etat==='arme'&&r<0.45){lui.garde=true;iaT=0.7;}else if(r<0.45){frapper(lui,'crochet');iaT=1.1+Math.random()*1.1;}else if(r<0.8){frapper(lui,'direct');iaT=0.7+Math.random()*0.8;}else{lui.garde=true;iaT=0.9;}}}
        if(tRound<=0){if(round<3){round++;tRound=25;pause=2;crier('Fin du round',0.5);}else{fin=true;setTimeout(terminer,900);}}}}
    const taille=Math.min(W*0.8,H*0.95), yc=H*0.8;
    dessinerBoxeur(lui,W*0.6,yc-8,taille*0.95,-1);dessinerBoxeur(moi,W*0.4,yc,taille,1);
    cris=cris.filter(c=>now-c.n<1200);cris.forEach((c,k)=>{const a=1-(now-c.n)/1200;g.globalAlpha=a;g.font='900 '+Math.round(W*0.07)+'px Georgia';g.textAlign='center';g.fillStyle='#ffe070';g.strokeStyle='#0e0e14';g.lineWidth=4;
      const y=H*0.3-(now-c.n)/1200*30-k*4;g.strokeText(c.t,W*c.x,y);g.fillText(c.t,W*c.x,y);g.textAlign='left';g.globalAlpha=1;});
    $('bxV1').style.width=moi.pv+'%';$('bxV2').style.width=lui.pv+'%';$('bxR').textContent='ROUND '+round+' · '+Math.max(0,Math.ceil(tRound))+' s';
    raf.id=requestAnimationFrame(boucle);};
  pause=1.2;raf.id=requestAnimationFrame(boucle);
}
return {bowling,boxe};
})()
