/* =====================================================================
   POSTE N°2 — LE PORTIQUE (port qui travaille). Un écran à part (#ptq).
   Vu de côté : le navire à gauche, le quai à droite, le chariot du
   portique roule sur la flèche. On fait glisser le doigt pour le
   déplacer ; le conteneur pendu au câble se balance. On touche le gros
   bouton pour prendre un conteneur sur le navire, puis pour le poser
   sur le camion. Trop de balancement : ça cogne. 75 secondes.
   Gratuit pour l'instant.
   ===================================================================== */
(()=>{
const DUREE=75;
const vib=x=>{try{navigator.vibrate&&navigator.vibrate(x);}catch(_){}};
let AC=null;const ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(x){}}if(AC&&AC.state==='suspended')AC.resume();return AC;};
function note(f,t0,d,type,vol){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(vol||.05,a.currentTime+t0);g.gain.exponentialRampToValueAtTime(.0005,a.currentTime+t0+d);o.connect(g).connect(a.destination);o.start(a.currentTime+t0);o.stop(a.currentTime+t0+d+.02);}
const SON={clac(){note(140,0,.12,'square',.08);note(90,.05,.2,'triangle',.08);},cogne(){note(70,0,.3,'sawtooth',.09);note(55,.1,.3,'square',.06);},bip(){note(1200,0,.05,'square',.03);},bon(){note(660,0,.08);note(990,.07,.15);}};
const COUL=['#c8402a','#2a6ab8','#3a8a5a','#e8a020','#7a3a6a','#2a8a9a','#d86a2a'];
const CSS=`#ptq{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#9fd0ee;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;touch-action:none}
#ptq.on{opacity:1}#ptq *{box-sizing:border-box}#ptq *::after{content:none!important;display:none!important}
#ptq .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 6px;color:#1a2a3a}
#ptq .bar b{font:900 17px/1 'Baloo 2',system-ui,sans-serif}#ptq .bar small{display:block;font:800 9px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#3a5a7a}
#ptq .sp{flex:1}#ptq .x{height:38px;padding:0 14px;border-radius:19px;border:0;background:rgba(0,0,0,.14);color:#1a2a3a;font:800 13px 'Baloo 2',system-ui,sans-serif}
#ptq canvas{flex:1;min-height:0;width:100%;display:block;touch-action:none}
#ptq .bas{flex:none;display:flex;gap:10px;align-items:center;padding:10px 14px calc(14px + env(safe-area-inset-bottom));background:#2a3038}
#ptq .aide{flex:1;color:#d8e0e8;font:700 13px/1.2 'Baloo 2',system-ui,sans-serif}
#ptq .go{flex:none;width:96px;height:72px;border:0;border-radius:20px;font:900 17px/1 'Baloo 2',system-ui,sans-serif;color:#2a2016;background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 5px 0 #a86a10}
#ptq .go:active{transform:translateY(3px);box-shadow:0 2px 0 #a86a10}
#ptq .fin{position:absolute;inset:0;background:rgba(10,16,24,.82);display:grid;place-items:center;padding:24px;z-index:3}
#ptq .fin .c{width:min(330px,88vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:18px;text-align:center;box-shadow:0 6px 0 #b8a890}
#ptq .fin h2{margin:4px 0 10px;font:900 24px/1.1 'Baloo 2',system-ui,sans-serif}#ptq .fin p{margin:0 0 6px;font:700 15px 'Baloo 2',system-ui,sans-serif}
#ptq .fin button{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#ptq .fin .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#ptq .fin .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}`;
let RAC=null,CV=null,G=null,J=null,RAF=0;
/* le monde du jeu, en unités : 0..100 de large ; le quai commence à 58 */
const QX=58,CW=11;
function nouvellePile(){const P=[];for(let c=0;c<4;c++){const h=2+((Math.random()*3)|0);P.push([...Array(h)].map(()=>COUL[(Math.random()*COUL.length)|0]));}return P;}
function demarrer(){J={x:30,vx:0,cible:30,ang:0,av:0,corde:.35,etat:'libre',porte:null,pile:nouvellePile(),camion:{x:120,etat:'arrive',charge:null},t0:performance.now(),poses:0,parfaits:0,cognes:0,anim:0,fini:false,msg:'',msgT:0};}
function aide(t){J.msg=t;J.msgT=performance.now();const a=RAC&&RAC.querySelector('.aide');if(a)a.textContent=t;}
function action(){if(!J||J.fini)return;ac();if(J.anim)return;
  const sw=Math.abs(J.ang);
  if(J.etat==='libre'){/* prendre sur le navire : au-dessus d'une baie */
    const c=Math.round((J.x-8)/11);if(J.x>QX-4||c<0||c>3||!J.pile[c].length){aide('Place le chariot au-dessus d’une pile du navire');vib(20);return;}
    if(Math.abs(J.x-(8+c*11))>3.2){aide('Centre-toi bien sur la pile');vib(20);return;}
    if(sw>.2){SON.cogne();vib([40,30,40]);J.cognes++;aide('Ça balance trop ! Attends que ça se calme');J.av+=.2;return;}
    J.anim={t0:performance.now(),dir:'prendre',c};SON.bip();}
  else{/* poser sur le camion */
    const C=J.camion;if(C.etat!=='attend'){aide('Attends que le camion soit en place');return;}
    const dx=Math.abs(J.x-C.x);if(J.x<QX){aide('Amène le conteneur au-dessus du camion, sur le quai');return;}
    if(dx>4||sw>.16){SON.cogne();vib([40,30,40]);J.cognes++;aide(sw>.16?'Ça balance trop ! Stabilise d’abord':'Pas en face du camion !');J.av+=.25*(Math.random()<.5?1:-1);return;}
    J.anim={t0:performance.now(),dir:'poser',parfait:dx<1.5&&sw<.06};SON.bip();}}
function pas(dt){const now=performance.now();
  /* le chariot suit le doigt, avec une vitesse limitée */
  const ax=Math.max(-90,Math.min(90,(J.cible-J.x)*14-J.vx*7));J.vx+=ax*dt;J.vx=Math.max(-26,Math.min(26,J.vx));J.x=Math.max(4,Math.min(96,J.x+J.vx*dt));
  /* le pendule : l'accélération du chariot lance le balancement */
  const L=J.porte?1:.7;J.av+=(-9.8*Math.sin(J.ang)/(L*6)-ax*.012-J.av*.7)*dt;J.ang+=J.av*dt;
  if(J.anim){const k=(now-J.anim.t0)/700;if(k>=1){const A=J.anim;J.anim=0;
      if(A.dir==='prendre'){J.porte=J.pile[A.c].pop();J.etat='porte';SON.clac();vib(12);aide('Conteneur accroché ! Amène-le au camion');}
      else{J.camion.charge=J.porte;J.porte=null;J.etat='libre';J.poses++;if(A.parfait)J.parfaits++;J.camion.etat='part';SON.clac();setTimeout(()=>SON.bon(),120);vib(16);aide(A.parfait?'PARFAIT ! Pile au centre':'Posé ! Le camion s’en va');
        if(J.pile.every(p=>!p.length)){J.pile=nouvellePile();aide('Navire vidé ! Un autre arrive');}}}}
  const C=J.camion;if(C.etat==='arrive'){C.x-=dt*30;if(C.x<=C.place){C.x=C.place;C.etat='attend';}}
  else if(C.etat==='part'){C.x+=dt*40;if(C.x>130){C.etat='arrive';C.charge=null;C.place=66+Math.random()*24;}}
  if(C.place===undefined)C.place=78;
  if((now-J.t0)/1000>=DUREE&&!J.fini)finir();}
function dessiner(){const W=CV.width,H=CV.height,g=G,u=W/100,sol=H*.8,haut=H*.16,t=performance.now()/1000;
  g.clearRect(0,0,W,H);const gr=g.createLinearGradient(0,0,0,sol);gr.addColorStop(0,'#7ab8e4');gr.addColorStop(1,'#d8ecf6');g.fillStyle=gr;g.fillRect(0,0,W,sol);
  /* la mer et le navire à gauche */
  g.fillStyle='#2a6a90';g.fillRect(0,sol-H*.02,QX*u,H-sol+H*.02);for(let i=0;i<14;i++){g.fillStyle='rgba(255,255,255,.18)';g.fillRect((i*7+t*3)%QX*u,sol+((i*13)%20)/20*(H-sol),u*3,2);}
  g.fillStyle='#1f2a3a';g.beginPath();g.moveTo(1*u,sol-H*.06);g.lineTo(QX*u-2*u,sol-H*.06);g.lineTo(QX*u-6*u,sol+H*.06);g.lineTo(3*u,sol+H*.06);g.closePath();g.fill();
  g.fillStyle='#8a2a2a';g.fillRect(3*u,sol+H*.03,QX*u-9*u,H*.03);
  const ch=H*.055;
  J.pile.forEach((p,c)=>p.forEach((col,j)=>{const x=(8+c*11)*u,y=sol-H*.06-(j+1)*ch;cont(g,x-CW*u/2+1,y,CW*u-2,ch-1,col);}));
  /* le château du navire */
  g.fillStyle='#f2f2ee';g.fillRect(49*u,sol-H*.06-H*.22,7*u,H*.22);for(let k=0;k<5;k++){g.fillStyle='#2a3a4a';g.fillRect(50*u,sol-H*.06-H*.2+k*H*.04,5*u,H*.018);}
  /* le quai */
  g.fillStyle='#bdb6a6';g.fillRect(QX*u,sol,W-QX*u,H-sol);g.fillStyle='#e4ddce';g.fillRect(QX*u,sol,W-QX*u,4);for(let x=QX*u;x<W;x+=16){g.fillStyle='#f2c230';g.fillRect(x,sol+8,8,4);g.fillStyle='#2a2a2a';g.fillRect(x+8,sol+8,8,4);}
  /* le camion */
  const C=J.camion,cx=C.x*u;g.fillStyle='#3a3a3a';g.fillRect(cx-7*u,sol-H*.025,14*u,H*.018);g.fillStyle='#e8e8e8';g.fillRect(cx+7*u,sol-H*.07,5*u,H*.06);g.fillStyle='#2a3a4a';g.fillRect(cx+9*u,sol-H*.065,2.4*u,H*.025);
  for(const dx of [-5,4,10])g.fillStyle='#1a1a1a',g.beginPath(),g.arc(cx+dx*u,sol-H*.006,H*.014,0,7),g.fill();
  if(C.charge)cont(g,cx-CW*u/2+1,sol-H*.025-ch,CW*u-2,ch-1,C.charge);
  if(C.etat==='attend'&&!C.charge){g.strokeStyle='rgba(255,255,255,.7)';g.setLineDash([6,4]);g.strokeRect(cx-CW*u/2+1,sol-H*.025-ch,CW*u-2,ch-1);g.setLineDash([]);}
  /* le portique : la poutre, les pieds sur le quai */
  g.fillStyle='#d84a2a';g.fillRect(0,haut-8,W,10);g.fillRect(QX*u+2*u,haut,2.4*u,sol-haut);g.fillRect(W-8*u,haut,2.4*u,sol-haut);g.fillStyle='#b83a1a';for(let x=0;x<W;x+=18)g.fillRect(x,haut-6,8,2);
  /* le chariot, le câble, le spreader et le conteneur qui se balance */
  const tx=J.x*u;g.fillStyle='#f2f2ee';g.fillRect(tx-4*u,haut-14,8*u,12);g.fillStyle='#2a3a4a';g.fillRect(tx-2.5*u,haut-11,2*u,6);
  let L=H*.28;if(J.anim){const k=(performance.now()-J.anim.t0)/700,dz=Math.sin(k*Math.PI);let fond=J.anim.dir==='prendre'?(sol-H*.06-J.pile[J.anim.c].length*ch)-haut:(sol-H*.025-ch)-haut;L=L+(fond-L-(J.anim.dir==='prendre'?0:0))*dz;}
  const bx=tx+Math.sin(J.ang)*L,by=haut+Math.cos(J.ang)*L;g.strokeStyle='#2a2a2a';g.lineWidth=2;g.beginPath();g.moveTo(tx-2*u,haut);g.lineTo(bx-2*u,by);g.moveTo(tx+2*u,haut);g.lineTo(bx+2*u,by);g.stroke();
  g.save();g.translate(bx,by);g.rotate(J.ang);g.fillStyle='#f2c230';g.fillRect(-CW*u/2,0,CW*u,5);if(J.porte)cont(g,-CW*u/2+1,5,CW*u-2,ch-1,J.porte);g.restore();
  /* le guide : une ligne pointillée sous le chariot */
  g.strokeStyle='rgba(255,255,255,.45)';g.setLineDash([3,5]);g.beginPath();g.moveTo(tx,by+(J.porte?ch:0)+8);g.lineTo(tx,sol);g.stroke();g.setLineDash([]);
  /* le temps et les points */
  const r=Math.max(0,DUREE-(performance.now()-J.t0)/1000);g.font='900 '+Math.round(H*.035)+'px "Baloo 2",system-ui,sans-serif';g.textAlign='left';g.textBaseline='top';
  pill(g,10,haut+12,'⏱ '+Math.ceil(r)+' s',r<10?'#d8402a':'#2a3038');pill(g,10,haut+12+H*.055,'📦 '+J.poses,'#2a3038');if(J.parfaits)pill(g,10,haut+12+H*.11,'★ '+J.parfaits,'#e8a020');}
function pill(g,x,y,t,col){const w=g.measureText(t).width+16,h=parseInt(g.font.split(' ')[1])+8;g.fillStyle=col;g.beginPath();g.roundRect?g.roundRect(x,y,w,h,h/2):g.rect(x,y,w,h);g.fill();g.fillStyle='#fff';g.fillText(t,x+8,y+4);}
function cont(g,x,y,w,h,col){g.fillStyle=col;g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x,y,w,2);g.fillStyle='rgba(0,0,0,.18)';for(let k=x+3;k<x+w-2;k+=4)g.fillRect(k,y+2,1,h-3);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y+h-2,w,2);}
function boucle(){if(!RAC)return;const now=performance.now(),dt=Math.min(.05,(now-(boucle.t||now))/1000);boucle.t=now;if(!J.fini)pas(dt);dessiner();RAF=requestAnimationFrame(boucle);}
function finir(){J.fini=true;const d=document.createElement('div');d.className='fin';
  d.innerHTML='<div class="c"><small style="font:800 11px \'Baloo 2\',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a">FIN DE LA VACATION</small><h2>'+(J.poses>=14?'Grutier de légende !':J.poses>=8?'Belle main, collègue !':'Ça viendra !')+'</h2><p>'+J.poses+' conteneurs posés</p><p>'+J.parfaits+' posés pile au centre</p><p>'+J.cognes+' coups de tôle</p><p style="color:#8a7a5a;font-size:13px">Poste gratuit pour l’instant : pas de paie.</p><button class="b1">Rejouer</button><button class="b2">Retour au quai</button></div>';
  RAC.appendChild(d);d.querySelector('.b1').onclick=()=>{d.remove();demarrer();aide('Glisse le doigt pour bouger le chariot');};d.querySelector('.b2').onclick=fermer;}
function taille(){if(!CV)return;const r=CV.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);CV.width=Math.round(r.width*dpr);CV.height=Math.round(r.height*dpr);}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);removeEventListener('resize',taille);}
window.ouvrirPortique=function(){if(RAC)return;if(!document.getElementById('ptqCss')){const s=document.createElement('style');s.id='ptqCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='ptq';RAC=d;
  d.innerHTML='<div class="bar"><div><b>Le portique</b><small>POSTE N°2 · GRUTIER</small></div><span class="sp"></span><button class="x">Quitter</button></div><canvas></canvas><div class="bas"><div class="aide">Glisse le doigt pour bouger le chariot</div><button class="go">PRENDRE<br>POSER</button></div>';
  document.body.appendChild(d);CV=d.querySelector('canvas');G=CV.getContext('2d');requestAnimationFrame(()=>{d.classList.add('on');taille();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',taille);
  const suivre=e=>{const t=e.touches?e.touches[0]:e;const r=CV.getBoundingClientRect();J.cible=Math.max(4,Math.min(96,(t.clientX-r.left)/r.width*100));e.preventDefault();};
  CV.addEventListener('touchstart',suivre,{passive:false});CV.addEventListener('touchmove',suivre,{passive:false});CV.addEventListener('mousedown',e=>{suivre(e);const m=ev=>suivre(ev),u=()=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);};addEventListener('mousemove',m);addEventListener('mouseup',u);});
  d.querySelector('.go').onclick=()=>{vib(8);action();};d.querySelector('.x').onclick=fermer;
  demarrer();boucle.t=0;boucle();};
})();
