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
const f=n=>(+n||0).toLocaleString('fr-FR');
const esc=s=>{try{return echapperT(String(s||''));}catch(x){return String(s||'').replace(/[<>&"]/g,'');}};
let RAC=null,L=[],FILTRE='tous';
const AP_CAPITAINE=Object.assign({},typeof DEF_AP!=='undefined'?DEF_AP:{},{peau:2,cheveux:6,coiffe:4,barbe:3,haut:5,veste:16,bas:0,pantalon:9,chapeau:1,sac:0,_pnj:true});
const apDe=j=>Object.assign({},typeof DEF_AP!=='undefined'?DEF_AP:{},j.apparence||{},{_pnj:true,sac:0});
const grade=j=>j.titre||(CLS_GRADES.find(t=>j.N.n>=t[0])||[0,'Mousse'])[1];
/* un personnage en pied, net : dessiné à l'échelle 1 puis agrandi d'un nombre entier de fois */
function enPied(ap,dir){const t=document.createElement('canvas');t.width=48;t.height=70;const q=t.getContext('2d');q.imageSmoothingEnabled=false;try{personne(q,24,66,ap,dir||'bas',0,false);}catch(x){}return t;}
/* le capitaine, en buste, dans l'enseigne */
function buste(cv){const s=Math.max(2,Math.round(window.devicePixelRatio||2)),W=40,H=40;cv.width=W*s;cv.height=H*s;cv.style.width=W*1.4+'px';cv.style.height=H*1.4+'px';
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,-4*s,-14*s);try{personne(g,24,66,AP_CAPITAINE,'bas',0,false);}catch(x){}g.setTransform(1,0,0,1,0,0);}
/* LA PHRASE DU CAPITAINE : où tu en es, et ce qu'il te manque */
function phrase(){const m=L.findIndex(j=>j.id===e.id);
  if(!L.length)return 'Le registre est vide. Va bosser, et ton nom y sera le premier.';
  if(m===0)return 'Premier du port, <b>'+esc(L[0].pseudo)+'</b>. Le quai entier parle de toi. Tiens la barre !';
  if(m>0){const a=L[m-1],x=a.score-L[m].score+1;return 'Tu es <b>'+(m+1)+'e</b>. Encore <b>'+f(x)+' XP</b> et tu passes devant <b>'+esc(a.pseudo)+'</b>'+(m===1?' — la tête du port est à toi.':'.');}
  return 'Je ne trouve pas ton nom dans le registre. Récolte, pêche, coupe du bois : chaque geste compte.';}
/* ===================== TROIS IDÉES À L'ESSAI (window.RGP_V = A, B ou C) =====================
   A — LE DUEL : toi face à celui qui est juste devant, l'écart à combler ; tes voisins autour.
   B — LA COURSE : une piste où chaque joueur est placé selon son XP ; on voit les écarts d'un coup d'œil.
   C — LES COURONNES : un roi par métier (forêt, potager, verger, bêtes, pêche) ; on touche pour voir le détail. */
const METIERS=[['tout','👑','Général','#e8b030',j=>+j.score||0],['foret','🌲','Forêt','#3a9a5a',j=>+j.foret||0],['legumes','🥕','Potager','#e8862a',j=>+j.legumes||0],
  ['fruits','🍒','Verger','#d8404a',j=>+j.fruits||0],['betes','🐑','Bêtes','#9a6a3a',j=>+j.betes||0],['peche','🐟','Pêche','#2a8ad0',j=>+j.peche||0]];
let MET='tout';
const metDe=k=>METIERS.find(m=>m[0]===k)||METIERS[0];
function classe(k){const M=metDe(k);return L.slice().filter(j=>M[4](j)>0||k==='tout').sort((a,b)=>M[4](b)-M[4](a));}
const CSS_BASE=`#rgp{position:fixed;inset:0;z-index:2147482100;font-family:'Baloo 2',system-ui,sans-serif;color:#1f1a14;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:#faf7f1;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
#rgp.on{transform:none}#rgp *{box-sizing:border-box}#rgp img,#rgp canvas{image-rendering:pixelated}
#rgp .hd{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 10px}
#rgp .hd b{flex:1;font:800 24px 'Baloo 2',system-ui,sans-serif;line-height:1;letter-spacing:-.3px}
#rgp .x{width:40px;height:40px;border-radius:50%;border:0;background:#efe9de;font:800 16px 'Baloo 2',system-ui,sans-serif;color:#1f1a14}
#rgp .corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;contain:content;padding:0 16px calc(24px + env(safe-area-inset-bottom));overscroll-behavior:contain}
#rgp .chips{display:flex;gap:6px;overflow-x:auto;padding:2px 16px 12px;flex:none;scrollbar-width:none}#rgp .chips::-webkit-scrollbar{display:none}
#rgp .chips button{flex:none;border:0;border-radius:20px;padding:6px 13px 5px;background:#efe9de;font:800 13.5px 'Baloo 2',system-ui,sans-serif;color:#6a5e4c;display:flex;align-items:center;gap:5px}
#rgp .chips button.on{background:#1f1a14;color:#fff}
#rgp .r{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #ece4d6}
#rgp .r .n{flex:none;width:24px;text-align:center;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#a89a84}
#rgp .r .av{flex:none;width:42px;height:42px;border-radius:50%;background:#efe9de;display:grid;place-items:center;overflow:hidden;position:relative}#rgp .r .av img{width:38px;height:38px}
#rgp .r .av u{position:absolute;right:1px;bottom:1px;width:11px;height:11px;border-radius:50%;background:#34c759;border:2px solid #faf7f1}
#rgp .r .t{flex:1;min-width:0}#rgp .r .t b{display:block;font-size:16px;font-weight:800;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#rgp .r .t small{font-size:12px;font-weight:700;color:#a89a84}
#rgp .r .v{flex:none;text-align:right;font:800 15px 'Baloo 2',system-ui,sans-serif;line-height:1.05}#rgp .r .v small{display:block;font-size:10.5px;color:#a89a84}
#rgp .r.toi{background:#fff;margin:0 -10px;padding:9px 10px;border-radius:16px;border-bottom-color:transparent;box-shadow:0 2px 10px rgba(60,40,10,.08)}
#rgp .titre{font:800 13px 'Baloo 2',system-ui,sans-serif;color:#a89a84;letter-spacing:.5px;margin:18px 0 4px}
#rgp .vide{padding:30px 10px;text-align:center;color:#a89a84;font-weight:700}`;
const CSS_V={
A:`#rgp .duel{position:relative;border-radius:26px;overflow:hidden;background:linear-gradient(160deg,#1f2a44,#2c1f3a);color:#fff;padding:16px 14px 14px;box-shadow:0 10px 24px rgba(30,20,50,.25)}
#rgp .duel .vs{display:flex;align-items:flex-end;justify-content:space-between}
#rgp .duel .cote{width:42%;text-align:center}#rgp .duel .cote canvas{display:block;margin:0 auto}
#rgp .duel .cote b{display:block;font-size:16px;font-weight:800;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#rgp .duel .cote small{font-size:11.5px;font-weight:700;color:#b8b0d0}
#rgp .duel .mid{flex:1;text-align:center;padding-bottom:30px}#rgp .duel .mid i{display:block;font:italic 900 28px Georgia,serif;color:#f2c94c;font-style:italic}
#rgp .duel .ecart{margin-top:12px;background:rgba(255,255,255,.1);border-radius:16px;padding:10px 12px}
#rgp .duel .ecart b{font-size:22px;font-weight:800;color:#f2c94c}#rgp .duel .ecart span{font-size:13px;font-weight:700;color:#d8d0e8}
#rgp .duel .bar{position:relative;height:10px;border-radius:5px;background:rgba(255,255,255,.14);margin-top:8px}#rgp .duel .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:linear-gradient(90deg,#f2c94c,#ff9a3a)}
#rgp .duel .derr{margin-top:10px;font-size:12.5px;font-weight:700;color:#b8b0d0}#rgp .duel .derr b{color:#ff8a7a}
#rgp .voir{display:block;width:100%;margin-top:12px;border:0;border-radius:16px;padding:11px;background:#efe9de;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#1f1a14}`,
B:`#rgp .piste{position:relative;border-radius:24px;background:#fff;box-shadow:0 2px 12px rgba(60,40,10,.08);padding:14px 0 10px;overflow:hidden}
#rgp .piste canvas{display:block;width:100%}
#rgp .piste .lg{display:flex;justify-content:space-between;padding:0 16px;font-size:11.5px;font-weight:800;color:#a89a84}
#rgp .info{display:flex;gap:10px;margin-top:12px}#rgp .info div{flex:1;border-radius:18px;background:#fff;box-shadow:0 2px 12px rgba(60,40,10,.08);padding:10px 12px}
#rgp .info b{display:block;font-size:22px;font-weight:800;line-height:1}#rgp .info small{font-size:11.5px;font-weight:700;color:#a89a84}`,
C:`#rgp .roi{display:flex;align-items:center;gap:14px;border-radius:26px;padding:14px;background:linear-gradient(135deg,#ffe8a0,#f2c04a);box-shadow:0 10px 24px rgba(200,140,20,.25)}
#rgp .roi canvas{flex:none}#rgp .roi small{display:block;font-size:12px;font-weight:800;color:#8a5a08;letter-spacing:.5px}#rgp .roi b{display:block;font-size:22px;font-weight:800;line-height:1.05}#rgp .roi span{font-size:13px;font-weight:700;color:#6a4a10}
#rgp .grille{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
#rgp .cou{border:0;text-align:left;border-radius:22px;padding:12px;background:#fff;box-shadow:0 2px 12px rgba(60,40,10,.08);display:flex;flex-direction:column;gap:2px;font-family:inherit;color:inherit;position:relative;overflow:hidden}
#rgp .cou .ic{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;font-size:18px;margin-bottom:4px}
#rgp .cou small{font-size:11.5px;font-weight:800;letter-spacing:.3px}#rgp .cou b{font-size:16px;font-weight:800;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#rgp .cou span{font-size:12px;font-weight:700;color:#a89a84}
#rgp .cou canvas{position:absolute;right:4px;bottom:0}
#rgp .cou .moi{position:absolute;top:10px;right:10px;font-size:10.5px;font-weight:800;background:#1f1a14;color:#fff;border-radius:8px;padding:1px 6px}`};
const V=()=>(window.RGP_V||'C');
function enLigne(j){try{return clsEnLigne(j);}catch(x){return false;}}
const TETES={};function tete(j){const k=j.id+'|'+JSON.stringify(j.apparence||{});if(TETES[k])return TETES[k];try{return TETES[k]=clsTete(j);}catch(x){return '';}}
const unite=k=>k==='tout'?'XP':'pts';
function rang(j,i,k){const M=metDe(k),val=M[4](j);return '<div class="r'+(j.id===e.id?' toi':'')+'"><span class="n">'+(i+1)+'</span><span class="av"><img src="'+tete(j)+'" alt="">'+(enLigne(j)?'<u></u>':'')+'</span>'+
  '<span class="t"><b>'+esc(j.pseudo)+(j.id===e.id?' · toi':'')+'</b><small>'+(k==='tout'?esc(grade(j))+' · niv. '+j.N.n:M[1]+' '+M[2])+'</small></span><span class="v">'+f(val)+'<small>'+unite(k)+'</small></span></div>';}
function chips(){return METIERS.map(m=>'<button data-m="'+m[0]+'"'+(MET===m[0]?' class="on"':'')+'>'+m[1]+' '+m[2]+'</button>').join('');}
function persoCanvas(j,s,dir){const c=document.createElement('canvas'),D=Math.max(1,Math.round(window.devicePixelRatio||2));c.width=40*s*D;c.height=56*s*D;c.style.width=40*s+'px';c.style.height=56*s+'px';
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;const k=s*D;g.setTransform(k,0,0,k,-4*k,-12*k);try{personne(g,24,66,apDe(j),dir||'bas',0,false);}catch(x){}g.setTransform(1,0,0,1,0,0);return c;}
/* B — la piste : chaque tête placée selon son score, sur 3 couloirs pour éviter qu'elles se chevauchent */
function peindrePiste(cv,Lk,k){const M=metDe(k),W=cv.parentNode.clientWidth,H=150,D=Math.max(1,Math.round(window.devicePixelRatio||2));cv.width=W*D;cv.height=H*D;cv.style.height=H+'px';
  const g=cv.getContext('2d');g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;const max=Math.max(1,M[4](Lk[0]||{})),x0=26,x1=W-30;
  for(let c=0;c<3;c++){const y=34+c*40;g.fillStyle=c%2?'#f6f1e8':'#f1ebdf';g.fillRect(0,y-18,W,36);}
  g.strokeStyle='#e2d8c6';g.setLineDash([4,6]);g.lineWidth=1.5;for(const q of [.25,.5,.75]){g.beginPath();g.moveTo(x0+(x1-x0)*q,10);g.lineTo(x0+(x1-x0)*q,H-14);g.stroke();}g.setLineDash([]);
  for(let y=10;y<H-14;y+=8){g.fillStyle=(y/8)%2?'#1f1a14':'#fff';g.fillRect(x1+8,y,6,8);g.fillStyle=(y/8)%2?'#fff':'#1f1a14';g.fillRect(x1+14,y,6,8);}
  const occ=[[],[],[]];Lk.slice().reverse().forEach(j=>{const x=x0+(x1-x0)*M[4](j)/max;let c=0;for(let k2=0;k2<3;k2++){if(!occ[k2].some(v=>Math.abs(v-x)<30)){c=k2;break;}c=k2;}occ[c].push(x);
    const y=34+c*40,moi=j.id===e.id;const im=new Image();im.src=tete(j);
    g.fillStyle=moi?M[3]:'#fff';g.beginPath();g.arc(x,y,16,0,7);g.fill();g.strokeStyle=moi?'#1f1a14':'#e2d8c6';g.lineWidth=moi?2.5:1.5;g.stroke();
    try{g.save();g.beginPath();g.arc(x,y,14,0,7);g.clip();if(im.complete)g.drawImage(im,x-14,y-14,28,28);else im.onload=()=>peindrePiste(cv,Lk,k);g.restore();}catch(x){}
    if(moi||Lk[0]===j){g.font='800 10px "Baloo 2",system-ui,sans-serif';g.textAlign='center';const t=moi?'toi':'1er';const tw=g.measureText(t).width+10;g.fillStyle='#1f1a14';g.beginPath();g.roundRect(x-tw/2,y-31,tw,13,6);g.fill();g.fillStyle='#fff';g.textBaseline='middle';g.fillText(t,x,y-24.5);}});}
function remplir(){if(!RAC)return;const v=V(),C=RAC.querySelector('.corps'),Ch=RAC.querySelector('.chips');if(Ch)Ch.innerHTML=chips();
  if(!L.length){C.innerHTML='<div class="vide">Le classement est encore vide.</div>';return;}
  const Lk=classe(MET),M=metDe(MET),m=Lk.findIndex(j=>j.id===e.id),u=unite(MET);
  if(v==='A'){let h='';
    if(m>=0){const moi=Lk[m],dev=m>0?Lk[m-1]:null,der=Lk[m+1];
      h+='<div class="duel"><div class="vs"><div class="cote" data-p="moi"></div><div class="mid"><i>VS</i></div><div class="cote" data-p="lui"></div></div>';
      if(dev){const ec=M[4](dev)-M[4](moi)+1,p=Math.round(M[4](moi)/Math.max(1,M[4](dev))*100);h+='<div class="ecart"><b>'+f(ec)+' '+u+'</b> <span>pour lui passer devant et devenir '+(m)+(m===1?'er':'e')+'</span><div class="bar"><i style="width:'+p+'%"></i></div></div>';}
      else h+='<div class="ecart"><b>Tu es 1er</b> <span>personne devant toi '+(MET==='tout'?'au port':'en '+M[2].toLowerCase())+'</span></div>';
      if(der)h+='<div class="derr">Derrière toi : <b>'+esc(der.pseudo)+'</b>, à '+f(M[4](moi)-M[4](der))+' '+u+'.</div>';h+='</div>';}
    h+='<div class="titre">AUTOUR DE TOI</div>';const a=Math.max(0,m-2),b=m>=0?Math.min(Lk.length,m+3):5;h+=Lk.slice(a,b).map((j,i)=>rang(j,a+i,MET)).join('');
    h+='<div class="titre">LE TOP 3</div>'+Lk.slice(0,3).map((j,i)=>rang(j,i,MET)).join('');
    C.innerHTML=h;
    if(m>=0){C.querySelector('[data-p=moi]').append(persoCanvas(Lk[m],2,'droite'));const s=document.createElement('b');s.textContent='Toi · '+(m+1)+(m?'e':'er');C.querySelector('[data-p=moi]').append(s);const sm=document.createElement('small');sm.textContent=f(M[4](Lk[m]))+' '+u;C.querySelector('[data-p=moi]').append(sm);
      const dev=m>0?Lk[m-1]:null;const L2=C.querySelector('[data-p=lui]');if(dev){L2.append(persoCanvas(dev,2,'gauche'));const s2=document.createElement('b');s2.textContent=dev.pseudo+' · '+m+(m===1?'er':'e');L2.append(s2);const sm2=document.createElement('small');sm2.textContent=f(M[4](dev))+' '+u;L2.append(sm2);}else{L2.innerHTML='<div style="font-size:54px;padding-bottom:20px">🏆</div>';}}}
  if(v==='B'){const max=M[4](Lk[0]);C.innerHTML='<div class="piste"><canvas></canvas><div class="lg"><span>0</span><span>'+f(max)+' '+u+'</span></div></div>'+
      '<div class="info"><div><b>'+(m>=0?(m+1)+(m?'e':'er'):'—')+'</b><small>ta place sur '+Lk.length+'</small></div><div><b>'+(m>0?f(M[4](Lk[m-1])-M[4](Lk[m])+1):'0')+'</b><small>'+u+' pour monter</small></div></div>'+
      '<div class="titre">'+M[1]+' '+M[2].toUpperCase()+'</div>'+Lk.map((j,i)=>rang(j,i,MET)).join('');
    peindrePiste(C.querySelector('.piste canvas'),Lk,MET);}
  if(v==='C'){const roi=classe('tout')[0];let h='<div class="roi"><span class="cv"></span><span><small>👑 ROI DU PORT</small><b>'+esc(roi.pseudo)+'</b><span>Niveau '+roi.N.n+' · '+f(roi.score)+' XP</span></span></div><div class="grille">';
    for(const Mx of METIERS.slice(1)){const Lx=classe(Mx[0]),r=Lx[0],im=Lx.findIndex(j=>j.id===e.id);
      h+='<button class="cou" data-m="'+Mx[0]+'"><span class="ic" style="background:'+Mx[3]+'22">'+Mx[1]+'</span><small style="color:'+Mx[3]+'">ROI '+({foret:'DE LA FORÊT',legumes:'DU POTAGER',fruits:'DU VERGER',betes:'DES BÊTES',peche:'DE LA PÊCHE'})[Mx[0]]+'</small><b>'+(r?esc(r.pseudo):'—')+'</b><span>'+(r?f(Mx[4](r))+' pts':'personne')+'</span>'+(im>=0?'<span class="moi">toi '+(im+1)+(im?'e':'er')+'</span>':'')+'</button>';}
    h+='</div><div class="titre">'+M[1]+' '+(MET==='tout'?'TOUT LE PORT':M[2].toUpperCase()+' · <u style="color:#1f1a14" class="ret">voir tout le port</u>')+'</div>'+Lk.map((j,i)=>rang(j,i,MET)).join('');C.innerHTML=h;
    C.querySelector('.roi .cv').replaceWith(persoCanvas(roi,1.5));
    {const r2=C.querySelector('.ret');if(r2)r2.onclick=()=>{MET='tout';remplir();};}
    C.querySelector('.roi').onclick=()=>{MET='tout';try{vibrer(6);}catch(x){}remplir();const t=C.querySelectorAll('.titre')[0];if(t)C.scrollTo({top:t.offsetTop-10,behavior:'smooth'});};
    C.querySelectorAll('.cou').forEach(b=>b.onclick=()=>{MET=b.dataset.m;try{vibrer(6);}catch(x){}remplir();const t=C.querySelectorAll('.titre')[0];if(t)C.scrollTo({top:t.offsetTop-10,behavior:'smooth'});});}
  RAC.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{if(MET===b.dataset.m)return;MET=b.dataset.m;try{vibrer(6);}catch(x){}remplir();});}
function fermer(){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),280);}
window.ouvrirRegistre=async function(){if(RAC)return;const v=V();MET='tout';
  let st=document.getElementById('rgpCss');if(!st){st=document.createElement('style');st.id='rgpCss';document.head.appendChild(st);}st.textContent=CSS_BASE+CSS_V[v];
  const d=document.createElement('div');d.id='rgp';RAC=d;
  d.innerHTML='<div class="hd"><b>'+(v==='A'?'Ta course':v==='B'?'La course du port':'Les couronnes')+'</b><button class="x" aria-label="Fermer">✕</button></div>'+(v==='C'?'':'<div class="chips"></div>')+'<div class="corps"><div class="vide">Chargement…</div></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  d.querySelector('.x').onclick=()=>{try{vibrer(8);}catch(x){}fermer();};
  try{sauver();envoyerSauvegarde(true);}catch(x){}
  let R=[];try{const r=await appelRPC('classement_general',{});if(Array.isArray(r))R=r.filter(j=>j&&j.pseudo&&j.pseudo!=='sans nom');}catch(x){}
  R.sort((a,b)=>(+b.score||0)-(+a.score||0));R.forEach(j=>{j.N=clsNiv(+j.score||0);});L=R;remplir();};
})();
