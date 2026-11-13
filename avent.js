/* =====================================================================
   LE CALENDRIER DE L'AVENT DE LA GALERIE BLEUE (avent.js), ouvert depuis
   l'affiche. 24 cases, une par jour de décembre ; on peut rattraper les
   jours passés. Le serveur (avent_ouvrir) donne les euros et les pièces.
   ===================================================================== */
(()=>{
const PIECE={8:['lun_flocon','Lunettes flocon'],12:['noel_echarpe','Écharpe de Noël'],16:['bij_clochette','Collier clochette'],21:['noel_bonnet','Bonnet du Père Noël'],23:['snk_noel','Sneakers de Noël'],24:['noel_bois','Bois de renne']};
const EUROS=j=>({6:15000,13:20000,20:25000,24:50000})[j]||(2000+j*500);
const ORDRE=[13,7,21,2,18,10,24,5,15,1,20,9,4,16,11,23,8,19,3,14,22,6,17,12];
const CSS=`#avt{position:fixed;inset:0;z-index:2147482300;display:flex;flex-direction:column;background:radial-gradient(120% 70% at 50% 0%,#b8262c,#4a0c12 80%);color:#fff6e6;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .25s}
#avt.on{opacity:1}#avt *{box-sizing:border-box}
#avt .hd{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 6px}
#avt .hd div{flex:1}#avt .hd b{display:block;font-family:Georgia,serif;font-style:italic;font-size:25px;line-height:1;color:#ffe9a8;text-shadow:0 2px 0 rgba(0,0,0,.35)}
#avt .hd small{display:block;font-size:9.5px;font-weight:800;letter-spacing:3px;color:#f2c8a0;margin-top:3px}
#avt .x{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid #f2d27a;background:rgba(0,0,0,.3);color:#fff2c8;font:800 16px 'Baloo 2',sans-serif}
#avt .neige{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(2px 2px at 20px 30px,#fff,transparent),radial-gradient(2px 2px at 120px 80px,#fff,transparent),radial-gradient(1.5px 1.5px at 200px 160px,#fff,transparent),radial-gradient(2px 2px at 300px 40px,#fff,transparent),radial-gradient(1.5px 1.5px at 60px 200px,#fff,transparent);background-size:340px 240px;animation:avtN 10s linear infinite;opacity:.6}
@keyframes avtN{to{background-position:30px 240px}}
#avt .corps{flex:1;overflow-y:auto;padding:6px 12px calc(16px + env(safe-area-inset-bottom,0px));position:relative}
#avt .msg{margin:2px 2px 10px;font-weight:700;font-size:13.5px;color:#ffe9c8;text-align:center;min-height:20px}
#avt .plat{position:relative;padding:12px;border-radius:20px;background:linear-gradient(#2a6a3a,#173e22);box-shadow:0 0 0 3px #e0b860,0 0 0 6px #7a1018,0 14px 30px rgba(0,0,0,.45)}
#avt .plat:before{content:'';position:absolute;inset:6px;border-radius:14px;border:1px dashed rgba(255,230,160,.35);pointer-events:none}
#avt .gr{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;perspective:600px}
#avt .ca{position:relative;aspect-ratio:1/1.05;border:0;padding:0;background:#3a0a10;border-radius:10px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.4);font-family:inherit}
#avt .ca .fd{position:absolute;inset:0;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:radial-gradient(circle at 50% 40%,#fff2c8,#e0b860);color:#5a1408;font-weight:800;font-size:11px;line-height:1.05;text-align:center;padding:4px}
#avt .ca .fd i{font-style:normal;font-size:20px}
#avt .ca .pt{position:absolute;inset:0;border-radius:10px;transform-origin:left center;transition:transform .7s cubic-bezier(.3,1.4,.5,1);backface-visibility:hidden;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:24px;color:#ffe9a8;text-shadow:0 2px 0 rgba(0,0,0,.4);box-shadow:inset 0 0 0 2px rgba(255,230,160,.5),inset 0 -6px 0 rgba(0,0,0,.18)}
#avt .ca .pt:after{content:'';position:absolute;right:7px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:#f2d27a}
#avt .ca.ouv .pt{transform:rotateY(-105deg)}
#avt .ca.ferme .pt{filter:saturate(.5) brightness(.75)}
#avt .ca.ferme .pt span{opacity:.5}
#avt .ca.ferme .pt:before{content:'🔒';position:absolute;bottom:4px;right:6px;font-size:10px}
#avt .ca.auj .pt{box-shadow:inset 0 0 0 2px #fff2c8,0 0 0 2px #ffe08a,0 0 18px rgba(255,220,120,.8);animation:avtA 1.6s ease-in-out infinite}
@keyframes avtA{50%{box-shadow:inset 0 0 0 2px #fff2c8,0 0 0 2px #ffe08a,0 0 28px rgba(255,220,120,1)}}
#avt .ca.ret .pt:before{content:'à rattraper';position:absolute;bottom:3px;left:0;right:0;font:800 8px 'Baloo 2',sans-serif;color:#fff2c8;text-shadow:none}
#avt .pop{position:fixed;left:50%;top:44%;transform:translate(-50%,-50%) scale(.3);z-index:3;padding:16px 20px;border-radius:20px;background:#fffaf0;color:#5a1408;text-align:center;box-shadow:0 0 0 3px #e0b860,0 20px 40px rgba(0,0,0,.5);opacity:0;transition:transform .45s cubic-bezier(.3,1.6,.5,1),opacity .2s;min-width:220px}
#avt .pop.on{transform:translate(-50%,-50%) scale(1);opacity:1}
#avt .pop b{display:block;font-family:Georgia,serif;font-size:28px;color:#a8202a}#avt .pop small{display:block;font-weight:700;font-size:13px;margin-top:4px}
#avt .hotte{display:block;width:100%;margin-top:12px;border:0;border-radius:16px;padding:11px;font:800 15px 'Baloo 2',sans-serif;color:#3a1408;background:linear-gradient(#fff2b8,#e8b838);box-shadow:0 4px 0 #7a5214}
#avt .leg{margin-top:12px;font-weight:700;font-size:11.5px;color:#f2c8a0;text-align:center;line-height:1.4}`;
const COUL=['#c8262c','#2a6ad8','#2e7a3a','#a8702a','#7a3ab8','#d84a7a'];
let RAC=null,MIENS={},OCC=false;
const vib=x=>{try{vibrer&&vibrer(x);}catch(_){}};
async function rpc(n,a){try{if(typeof sb!=='undefined'&&sb&&sb.rpc){const q=await sb.rpc(n,a||{});return q.data||(q.error?{erreur:q.error.message}:null);}return await appelRPC(n,a||{});}catch(x){return {erreur:'reseau'};}}
function paris(){const d=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'}));return {m:d.getMonth()+1,j:d.getDate()};}
function gain(j){const p=PIECE[j];return {e:EUROS(j),p};}
function fd(j){const g=gain(j);return g.p?'<i>🎁</i>'+g.p[1]+'<br>+'+g.e.toLocaleString('fr-FR')+' €':'<i>'+(j===24?'⭐':'💶')+'</i>+'+g.e.toLocaleString('fr-FR')+' €';}
function msg(t){const m=RAC&&RAC.querySelector('.msg');if(m)m.innerHTML=t;}
function rendre(){const D=paris(),G=RAC.querySelector('.gr');G.innerHTML='';
  for(const j of ORDRE){const ouv=!!MIENS[j],dispo=D.m===12&&j<=D.j,auj=D.m===12&&j===D.j;const b=document.createElement('button');b.className='ca'+(ouv?' ouv':'')+(!dispo&&!ouv?' ferme':'')+(auj&&!ouv?' auj':'')+(dispo&&!ouv&&!auj?' ret':'');
    b.innerHTML='<div class="fd">'+fd(j)+'</div><div class="pt" style="background:linear-gradient(135deg,'+COUL[j%6]+','+COUL[(j+2)%6]+')"><span>'+j+'</span></div>';
    b.onclick=()=>ouvrir(j,b,dispo,ouv);G.appendChild(b);}
  if(D.m===11)msg('Le calendrier s’ouvre le <b>1<sup>er</sup> décembre</b>. Encore '+(30-D.j+1)+' jour'+((30-D.j+1)>1?'s':'')+' de patience !');
  else if(D.m===12&&D.j<=24){const r=ORDRE.filter(j=>j<=D.j&&!MIENS[j]).length;msg(r?'<b>'+r+' case'+(r>1?'s':'')+'</b> à ouvrir aujourd’hui !':'Tout est ouvert pour aujourd’hui. À demain !');}
  else if(D.m===12)msg('Joyeux Noël ! Le calendrier est fini pour cette année.');else msg('Le calendrier revient en décembre.');}
function pop(t1,t2){const p=document.createElement('div');p.className='pop';p.innerHTML='<b>'+t1+'</b><small>'+t2+'</small>';RAC.appendChild(p);requestAnimationFrame(()=>p.classList.add('on'));setTimeout(()=>{p.classList.remove('on');setTimeout(()=>p.remove(),300);},2600);}
async function ouvrir(j,b,dispo,ouv){if(OCC)return;if(ouv){const g=gain(j);pop('Case '+j,'Déjà ouverte : '+(g.p?g.p[1]+' et ':'')+g.e.toLocaleString('fr-FR')+' €');return;}
  if(!dispo){vib(30);b.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:260});msg(paris().m===12?'La case <b>'+j+'</b> s’ouvrira le '+j+' décembre.':'Patience : on ouvre à partir du 1<sup>er</sup> décembre.');return;}
  OCC=true;vib([10,30,10]);const r=await rpc('avent_ouvrir',{p_jour:j});OCC=false;if(!RAC)return;
  if(!r||r.erreur){msg(r&&r.erreur==='connexion'?'Connecte-toi pour ouvrir le calendrier.':r&&r.erreur==='pas encore'?'Cette case n’est pas encore ouvrable.':'Petit souci de réseau, réessaie.');return;}
  MIENS[j]=true;b.classList.add('ouv');b.classList.remove('auj','ret');const g=gain(j);
  if(typeof r.euros==='number'){e.euros=r.euros;try{majHaut();}catch(x){}}if(r.piece)e.cos=Object.assign({},e.cos||{},{[r.piece]:true});
  setTimeout(()=>{pop('+'+((r.valeur||g.e*100)/100).toLocaleString('fr-FR')+' €',g.p?'Et une pièce de Noël : '+g.p[1]+' ! Porte-la depuis « Ma hotte de Noël ».':'Joyeux Noël, docker !');vib([20,40,20]);rendre();},550);}
function fermer(){if(!RAC)return;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),250);}
window.ouvrirCalendrierAvent=async function(){if(RAC)return;
  if(!document.getElementById('avtCss')){const s=document.createElement('style');s.id='avtCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='avt';RAC=d;
  d.innerHTML='<div class="neige"></div><div class="hd"><div><b>Le calendrier de l’Avent</b><small>LA GALERIE BLEUE · DU 1<sup>ER</sup> AU 24 DÉCEMBRE</small></div><button class="x" aria-label="Fermer">✕</button></div>'+
    '<div class="corps"><div class="msg"></div><div class="plat"><div class="gr"></div></div><div class="leg">Une case par jour, et tu peux rattraper celles que tu as manquées.<br>Six pièces de Noël introuvables ailleurs : le 8, le 12, le 16, le 21, le 23 et le 24.</div><button class="hotte">🎁 Ma hotte de Noël · porter mes pièces</button></div>';
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));d.querySelector('.x').onclick=fermer;rendre();
  d.querySelector('.hotte').onclick=async()=>{try{if(!window.ouvrirPereNoel)eval(await chargerMorceau('galerie.js'));fermer();try{window.fermerLesAffiches&&window.fermerLesAffiches();}catch(x){}window.ouvrirPereNoel('hotte');}catch(x){try{console.warn('HOTTE',x);}catch(_){}}};
  const L=await rpc('avent_mes_cases');if(Array.isArray(L)){MIENS={};for(const c of L)MIENS[c.jour]=true;if(RAC)rendre();}};
})();
