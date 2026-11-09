/* =====================================================================
   LE REGISTRE DU PORT — le classement, au style des boutiques du jeu.
   Un écran à part (il ne touche à rien d'autre) : l'enseigne de la
   capitainerie, le capitaine qui te dit où tu en es, le podium peint
   sur le quai au coucher du soleil, ta place, puis tout le registre.
   Seul le classement des niveaux reste (les cartes Pokédock en sont
   sorties). Chargé à la demande par moteur.js (eval direct) : il voit
   e, appelRPC, clsNiv, clsTete, clsEnLigne, CLS_GRADES, personne,
   DEF_AP, echapperT, sauver, envoyerSauvegarde, vibrer.
   ===================================================================== */
(()=>{
const CSS=`#rgp{position:fixed;inset:0;z-index:2147481500;display:flex;flex-direction:column;background:#f4efe4;color:#1b2a44;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transform:translateY(100%);transition:transform .25s cubic-bezier(.2,.8,.3,1)}
#rgp.on{transform:none}
#rgp *{box-sizing:border-box}
#rgp .hd{flex:none;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px;background:linear-gradient(#1d4a8a,#14325e);border-bottom:3px solid #c8a050}
#rgp .l1{display:flex;align-items:center;gap:8px}#rgp .ens{flex:1;min-width:0}
#rgp .ens b{display:block;font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:25px;color:#f6e6c0;line-height:1;text-shadow:0 2px 0 rgba(0,0,0,.25)}
#rgp .ens small{display:block;font-size:10px;font-weight:800;letter-spacing:2px;color:#9fc0ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rgp .x{flex:none;width:38px;height:38px;border-radius:12px;border:1.5px solid #e0b860;background:rgba(0,0,0,.2);color:#ffd98a;font:800 17px 'Baloo 2',sans-serif}
#rgp .pat{display:flex;gap:10px;align-items:flex-end;margin-top:8px}#rgp .pat canvas{flex:none;image-rendering:pixelated}
#rgp .bul{flex:1;min-width:0;position:relative;background:#fffaf0;color:#1b2a44;border-radius:14px;padding:6px 10px;font-weight:700;font-size:13px;line-height:1.3}
#rgp .bul b{color:#1d4a8a}
#rgp .bul:before{content:'';position:absolute;left:-8px;bottom:10px;border:8px solid transparent;border-right-color:#fffaf0;border-left:0}
#rgp .store{flex:none;height:12px;background:repeating-linear-gradient(90deg,#1d4a8a 0 14px,#f2e8d2 14px 28px);box-shadow:0 3px 4px rgba(0,0,0,.12)}
#rgp .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px calc(20px + env(safe-area-inset-bottom,0px))}
#rgp .sc{position:relative;height:250px;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 2px #e2d6be,0 4px 0 #e2d6be;background:#2a3a5a}
#rgp .sc canvas{position:absolute;inset:0;width:100%;height:100%}
#rgp .sc .ti{position:absolute;left:0;right:0;top:9px;text-align:center;font:900 11px 'Baloo 2',sans-serif;letter-spacing:3px;color:#ffe2a8;text-shadow:0 1px 0 rgba(0,0,0,.4)}
#rgp .lb{font-size:11px;font-weight:800;letter-spacing:2px;color:#8a7a5a;margin:14px 2px 7px;display:flex;justify-content:space-between;align-items:center}
#rgp .seg{display:flex;gap:4px;background:#e8dfcc;border-radius:12px;padding:3px}
#rgp .seg button{border:0;border-radius:9px;padding:3px 10px;background:none;font:800 12px 'Baloo 2',sans-serif;color:#8a7a5a;letter-spacing:0}
#rgp .seg button.on{background:#fff;color:#1d4a8a;box-shadow:0 1px 0 #d8c8a4}
#rgp .moi{display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;background:#fff;border:2px solid #1d4a8a;box-shadow:0 4px 0 #0e2a52;margin-top:12px}
#rgp .moi .rk{flex:none;width:52px;height:52px;border-radius:16px;background:linear-gradient(#2f62b0,#1d4a8a);color:#ffd98a;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
#rgp .moi .rk b{font:900 22px Georgia,serif;font-style:italic}#rgp .moi .rk small{font:800 9px 'Baloo 2',sans-serif;letter-spacing:1px;color:#9fc0ec;margin-top:2px}
#rgp .moi .tx{flex:1;min-width:0}#rgp .moi .tx b{display:block;font-size:16px;font-weight:800;line-height:1.1}
#rgp .moi .tx small{display:block;font-size:12px;font-weight:700;color:#5a6a84;line-height:1.3}
#rgp .jg{height:9px;margin-top:5px;border-radius:5px;background:#ebe3d2;overflow:hidden;box-shadow:inset 0 1px 0 rgba(0,0,0,.08)}#rgp .jg i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#e0a628,#f2c43a)}
#rgp .li{display:flex;flex-direction:column;gap:7px}
#rgp .l{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:16px;background:#fff;border:2px solid #e8dfcc;box-shadow:0 2px 0 #e2d6be}
#rgp .l.toi{border-color:#e0b860;background:#fffaf0}
#rgp .l .n{flex:none;width:28px;height:28px;border-radius:50%;background:#f2ecdf;color:#8a7a5a;display:grid;place-items:center;font:900 14px Georgia,serif;font-style:italic}
#rgp .l .n.o{background:linear-gradient(#f6d46a,#d8a028);color:#5a3a08}#rgp .l .n.a{background:linear-gradient(#e8ecf2,#aab4c2);color:#3a4454}#rgp .l .n.b{background:linear-gradient(#e8b088,#b06a3a);color:#4a2410}
#rgp .l .po{flex:none;width:42px;height:42px;border-radius:12px;background:#eaf1fb;display:grid;place-items:center;overflow:hidden;position:relative}
#rgp .l .po img{width:36px;height:36px;image-rendering:pixelated}
#rgp .l .po i{position:absolute;right:2px;bottom:2px;width:9px;height:9px;border-radius:50%;background:#3ac85a;box-shadow:0 0 0 2px #fff}
#rgp .l .tx{flex:1;min-width:0}#rgp .l .tx b{display:block;font-size:15px;font-weight:800;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rgp .l .tx small{display:block;font-size:11px;font-weight:800;letter-spacing:.5px;color:#a07a30;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rgp .l .tx .jg{height:6px;margin-top:3px}
#rgp .l .nv{flex:none;text-align:right;line-height:1}#rgp .l .nv b{display:block;font:900 19px Georgia,serif;font-style:italic;color:#1d4a8a}#rgp .l .nv small{display:block;font-size:10px;font-weight:800;color:#8a7a5a;margin-top:2px}
#rgp .vide{padding:30px 10px;text-align:center;color:#8a7a5a;font-weight:700}
#rgp .pied{margin:16px 4px 0;text-align:center;font-size:11.5px;font-weight:700;color:#8a7a5a;line-height:1.45}
#rgp .pied b{color:#1d4a8a}`;
const f=n=>(+n||0).toLocaleString('fr-FR');
const esc=s=>{try{return echapperT(String(s||''));}catch(x){return String(s||'').replace(/[<>&"]/g,'');}};
let RAC=null,L=[],FILTRE='tous',ANIM=0;
const AP_CAPITAINE=Object.assign({},typeof DEF_AP!=='undefined'?DEF_AP:{},{peau:2,cheveux:6,coiffe:4,barbe:3,haut:5,veste:16,bas:0,pantalon:9,chapeau:1,sac:0,_pnj:true});
const apDe=j=>Object.assign({},typeof DEF_AP!=='undefined'?DEF_AP:{},j.apparence||{},{_pnj:true,sac:0});
const grade=j=>j.titre||(CLS_GRADES.find(t=>j.N.n>=t[0])||[0,'Mousse'])[1];
/* un personnage en pied, net : dessiné à l'échelle 1 puis agrandi d'un nombre entier de fois */
function enPied(ap,dir){const t=document.createElement('canvas');t.width=48;t.height=70;const q=t.getContext('2d');q.imageSmoothingEnabled=false;try{personne(q,24,66,ap,dir||'bas',0,false);}catch(x){}return t;}
/* le capitaine, en buste, dans l'enseigne */
function buste(cv){const s=Math.max(2,Math.round(window.devicePixelRatio||2)),W=40,H=40;cv.width=W*s;cv.height=H*s;cv.style.width=W*1.4+'px';cv.style.height=H*1.4+'px';
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(enPied(AP_CAPITAINE),4,14,W,H,0,0,W*s,H*s);}
/* LA PHRASE DU CAPITAINE : où tu en es, et ce qu'il te manque */
function phrase(){const m=L.findIndex(j=>j.id===e.id);
  if(!L.length)return 'Le registre est vide. Va bosser, et ton nom y sera le premier.';
  if(m===0)return 'Premier du port, <b>'+esc(L[0].pseudo)+'</b>. Le quai entier parle de toi. Tiens la barre !';
  if(m>0){const a=L[m-1],x=a.score-L[m].score+1;return 'Tu es <b>'+(m+1)+'<sup>e</sup></b>. Encore <b>'+f(x)+' XP</b> et tu passes devant <b>'+esc(a.pseudo)+'</b>'+(m===1?' — la tête du port est à toi.':'.');}
  return 'Je ne trouve pas ton nom dans le registre. Récolte, pêche, coupe du bois : chaque geste compte.';}
/* ---------- LE PODIUM PEINT : le quai au coucher du soleil, trois caisses ---------- */
function peindrePodium(cv){const box=cv.parentNode,D=Math.max(1,Math.round(window.devicePixelRatio||2)),W=box.clientWidth,H=box.clientHeight;cv.width=W*D;cv.height=H*D;
  const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;const t=performance.now()/1000;
  /* le ciel */
  let gr=g.createLinearGradient(0,0,0,H*.62);gr.addColorStop(0,'#2a3a6a');gr.addColorStop(.55,'#c8607a');gr.addColorStop(1,'#f6b25a');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,230,170,.9)';g.beginPath();g.arc(W*.78,H*.5,22,0,7);g.fill();g.fillStyle='rgba(255,210,140,.25)';g.beginPath();g.arc(W*.78,H*.5,38,0,7);g.fill();
  /* Notre-Dame et les collines, en silhouette */
  g.fillStyle='#5a3a5a';g.beginPath();g.moveTo(0,H*.55);for(let x=0;x<=W;x+=8)g.lineTo(x,H*.5-Math.sin(x*.02)*8-Math.sin(x*.05)*4);g.lineTo(W,H*.62);g.lineTo(0,H*.62);g.fill();
  const nx=W*.2;g.fillStyle='#4a2a4a';g.fillRect(nx-14,H*.36,28,H*.16);g.fillRect(nx-4,H*.24,8,H*.13);g.beginPath();g.moveTo(nx-4,H*.24);g.lineTo(nx,H*.19);g.lineTo(nx+4,H*.24);g.fill();g.fillStyle='#f2c43a';g.fillRect(nx-1.5,H*.17,3,4);
  /* les grues du port */
  g.fillStyle='#3a2a44';for(const x of [W*.55,W*.93]){g.fillRect(x,H*.28,4,H*.3);g.fillRect(x-30,H*.28,56,4);g.fillRect(x+20,H*.3,2,14);}
  /* la mer, ses reflets */
  gr=g.createLinearGradient(0,H*.6,0,H*.78);gr.addColorStop(0,'#c86a6a');gr.addColorStop(1,'#3a3a6a');g.fillStyle=gr;g.fillRect(0,H*.6,W,H*.2);
  for(let k=0;k<26;k++){const y=H*.62+((k*7)%26)*.55,x=(k*53+t*12)%(W+40)-20;g.fillStyle='rgba(255,220,160,'+(.18+.18*Math.sin(t*2+k))+')';g.fillRect(x,y,14+(k%3)*6,1.4);}
  /* le quai : pavés et bordure */
  g.fillStyle='#8a7a6a';g.fillRect(0,H*.78,W,H*.22);g.fillStyle='#a8987e';g.fillRect(0,H*.78,W,4);
  for(let y=H*.78+6;y<H;y+=10)for(let x=((y|0)%20?0:12);x<W;x+=24){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x,y,1,9);g.fillRect(x,y+9,24,1);}
  /* les guirlandes de lampions */
  g.strokeStyle='rgba(30,20,30,.6)';g.lineWidth=1;g.beginPath();g.moveTo(0,22);g.quadraticCurveTo(W/2,62,W,22);g.stroke();
  for(let k=1;k<12;k++){const x=W*k/12,y=22+40*(1-Math.pow((x-W/2)/(W/2),2))*.75;g.fillStyle=['#f2c43a','#e8402a','#3a8ad0','#3ac860'][k%4];g.beginPath();g.arc(x,y+3,3,0,7);g.fill();g.fillStyle='rgba(255,230,160,'+(.25+.2*Math.sin(t*3+k))+')';g.beginPath();g.arc(x,y+3,7,0,7);g.fill();}
  /* les trois caisses et leurs champions */
  const PL=[[0,.5,74,'#f2c43a','#b8862a'],[1,.2,52,'#d8dde6','#8a96a8'],[2,.8,38,'#e0a070','#a0603a']];
  const base=H-14,cw=Math.min(96,W*.28);
  for(const [r,cx,h,c1,c2] of PL){const x=W*cx,j=L[r];
    /* la caisse en bois */
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-cw/2+4,base-2,cw,6);
    g.fillStyle='#8a5a32';g.fillRect(x-cw/2,base-h,cw,h);g.fillStyle='#a8703e';g.fillRect(x-cw/2,base-h,cw,5);
    for(let yy=base-h+10;yy<base;yy+=10){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-cw/2,yy,cw,1.2);}
    g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-cw/2+3,base-h+3,2,h-3);g.fillRect(x+cw/2-5,base-h+3,2,h-3);
    /* le médaillon du rang, peint sur la caisse */
    g.fillStyle=c2;g.beginPath();g.arc(x,base-h/2+3,13,0,7);g.fill();g.fillStyle=c1;g.beginPath();g.arc(x,base-h/2+2,12,0,7);g.fill();
    g.fillStyle='#3a2408';g.font='italic 900 15px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(r+1),x,base-h/2+3);
    if(!j)continue;
    /* le champion, en pied */
    const s=2,P=enPied(apDe(j),'bas'),bob=r===0?Math.round(Math.sin(t*3)*1):0;
    g.drawImage(P,0,0,48,70,Math.round(x-24*s),Math.round(base-h-66*s+bob),48*s,70*s);
    const tete=base-h-46*s+bob;if(r===0){g.font='20px sans-serif';g.fillText('👑',x,tete-8);}
    /* son nom sur une plaque */
    const nm=(j.pseudo||'').slice(0,12)+' · '+j.N.n;g.font='800 11px "Baloo 2",sans-serif';const tw=g.measureText(nm).width+14;
    g.fillStyle='rgba(20,30,50,.85)';const py=tete-(r===0?36:14);g.beginPath();g.roundRect(x-tw/2,py-8,tw,16,8);g.fill();g.fillStyle=j.id===e.id?'#ffd98a':'#fff';g.fillText(nm,x,py);
  }
  /* le scintillement des étoiles */
  for(let k=0;k<14;k++){const a=.3+.5*Math.abs(Math.sin(t*1.6+k*1.3));g.fillStyle='rgba(255,255,255,'+a+')';g.fillRect((k*97)%W,(k*37)%(H*.25)+6,1.6,1.6);}}
/* ---------- LE CORPS DE L'ÉCRAN ---------- */
function ligne(j,i){const r=i+1,cl=r===1?' o':r===2?' a':r===3?' b':'',p=Math.round(j.N.dans/Math.max(1,j.N.pour)*100);let en=false;try{en=clsEnLigne(j);}catch(x){}
  let tete='';try{tete=clsTete(j);}catch(x){}
  return '<div class="l'+(j.id===e.id?' toi':'')+'"><span class="n'+cl+'">'+r+'</span><span class="po"><img src="'+tete+'" alt="">'+(en?'<i></i>':'')+'</span>'+
    '<span class="tx"><b>'+esc(j.pseudo)+(j.id===e.id?' · toi':'')+'</b><small>'+esc(grade(j)).toUpperCase()+' · '+f(j.score)+' XP</small><div class="jg"><i style="width:'+p+'%"></i></div></span>'+
    '<span class="nv"><b>'+j.N.n+'</b><small>NIVEAU</small></span></div>';}
function remplir(){if(!RAC)return;RAC.querySelector('.bul').innerHTML=phrase();
  const C=RAC.querySelector('.corps');if(!L.length){C.innerHTML='<div class="vide">Le registre est encore vide.</div>';return;}
  const m=L.findIndex(j=>j.id===e.id);
  let moi='';if(m>=0){const j=L[m],p=Math.round(j.N.dans/Math.max(1,j.N.pour)*100);
    moi='<div class="moi"><span class="rk"><b>'+(m+1)+'<sup style="font-size:11px">'+(m?'e':'er')+'</sup></b><small>SUR '+L.length+'</small></span><span class="tx"><b>'+esc(grade(j))+' · niveau '+j.N.n+'</b><small>'+f(j.N.dans)+' / '+f(j.N.pour)+' XP avant le niveau '+(j.N.n+1)+'</small><div class="jg"><i style="width:'+p+'%"></i></div></span></div>';}
  const vis=L.map((j,i)=>[j,i]).filter(([j])=>{if(FILTRE!=='ligne')return true;try{return clsEnLigne(j);}catch(x){return false;}});
  C.innerHTML='<div class="sc"><canvas></canvas><div class="ti">✦ LES ROIS DU QUAI ✦</div></div>'+moi+
    '<div class="lb"><span>LE REGISTRE</span><span class="seg"><button data-f="tous"'+(FILTRE==='tous'?' class="on"':'')+'>Tous</button><button data-f="ligne"'+(FILTRE==='ligne'?' class="on"':'')+'>En ligne</button></span></div>'+
    '<div class="li">'+(vis.length?vis.map(([j,i])=>ligne(j,i)).join(''):'<div class="vide">Personne d’autre n’est en ligne.</div>')+'</div>'+
    '<div class="pied">L’XP vient de la <b>forêt</b>, des <b>légumes</b>, des <b>fruits</b>, des <b>bêtes</b> et de la <b>pêche</b>.<br>Chaque niveau donne un grade, de Mousse à Roi du Vieux-Port.</div>';
  C.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{if(FILTRE===b.dataset.f)return;FILTRE=b.dataset.f;try{vibrer(6);}catch(x){}const y=C.scrollTop;remplir();C.scrollTop=y;});
  const cv=C.querySelector('.sc canvas');cancelAnimationFrame(ANIM);const boucle=()=>{if(!RAC||!cv.isConnected)return;peindrePodium(cv);ANIM=requestAnimationFrame(boucle);};boucle();}
function fermer(){if(!RAC)return;const R0=RAC;RAC=null;cancelAnimationFrame(ANIM);R0.classList.remove('on');setTimeout(()=>R0.remove(),260);}
window.ouvrirRegistre=async function(){if(RAC)return;
  if(!document.getElementById('rgpCss')){const s=document.createElement('style');s.id='rgpCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='rgp';RAC=d;
  d.innerHTML='<div class="hd"><div class="l1"><div class="ens"><b>Le Registre du Port</b><small>CAPITAINERIE · CLASSEMENT DES DOCKERS</small></div><button class="x" aria-label="Fermer">✕</button></div>'+
    '<div class="pat"><canvas></canvas><div class="bul">Un instant, j’ouvre le registre…</div></div></div><div class="store"></div><div class="corps"><div class="vide">On feuillette le registre…</div></div>';
  document.body.appendChild(d);buste(d.querySelector('.pat canvas'));requestAnimationFrame(()=>d.classList.add('on'));
  d.querySelector('.x').onclick=()=>{try{vibrer(8);}catch(x){}fermer();};
  try{sauver();envoyerSauvegarde(true);}catch(x){}
  let R=[];try{const r=await appelRPC('classement_general',{});if(Array.isArray(r))R=r.filter(j=>j&&j.pseudo&&j.pseudo!=='sans nom');}catch(x){}
  R.sort((a,b)=>(+b.score||0)-(+a.score||0));R.forEach(j=>{j.N=clsNiv(+j.score||0);});L=R;remplir();};
})();
