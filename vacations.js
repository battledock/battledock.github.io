/* =====================================================================
   LES VACATIONS (vacations.js) — l'écran du guichet de la Maison des
   dockers. Les escales du jour, les postes à prendre, la paie selon le
   grade. Chargé à la demande depuis quai.js (eval direct).
   Indépendant : n'écrit que dans #vac, ne touche à rien d'autre.
   Période d'essai : les postes se jouent, la paie n'est pas encore versée.
   ===================================================================== */
(()=>{
/* le grade de travail : l'ancienneté place les vétérans plus haut */
/* le niveau officiel, celui du serveur (le même que la plaque en haut) */
function niveau(){try{if(typeof NIV!=='undefined'&&NIV&&NIV.niveau&&NIV.niveau.niveau)return NIV.niveau.niveau|0;}catch(x){}
 try{const v=parseInt((document.getElementById('hNiv')||{}).textContent);if(v>0)return v;}catch(x){}
 try{return Math.max(clsNiv(+e.score||0).n,clsNiv(+e.recolte||0).n);}catch(x){return 1;}}
const GRADES=[{k:'occ',nom:'Docker occasionnel',min:1},{k:'nd',nom:'Nouveau docker',min:5},{k:'dock',nom:'Docker',min:10},{k:'chauf',nom:'Chauffeur',min:20},{k:'point',nom:'Pointeur',min:35},{k:'mens',nom:'Docker mensuel',min:55},{k:'contre',nom:'Contremaître',min:80},{k:'chef',nom:'Chef de service',min:100}];
function grade(){const n=niveau();let g=GRADES[0];for(const x of GRADES)if(n>=x.min)g=x;return g;}
const RANG={occ:0,nd:1,dock:2,chauf:3,point:4,mens:5,contre:6,chef:7};

/* les navires qui font escale à Marseille */
const NAVIRES={
 croisiere:[['MSC World Europa','quai 4'],['Costa Smeralda','quai 3'],['MSC Fantasia','quai 4'],['Norwegian Epic','quai 2'],['AIDAnova','quai 3']],
 conteneurs:[['CMA CGM Jacques Saadé','Mourepiane'],['CMA CGM Roosevelt','Mourepiane'],['MSC Gülsün','Fos'],['CMA CGM Marco Polo','Mourepiane']],
 ferry:[['Pascal Paoli','gare maritime'],['Piana','gare maritime'],['Danielle Casanova','gare maritime'],['Méga Express','gare maritime']]};
const COUL={croisiere:'#2a6a9a',conteneurs:'#c0392b',ferry:'#2e7d4f'};
const LIB={croisiere:'Croisière',conteneurs:'Conteneurs',ferry:'Corse · ferry'};
/* les postes et leur paie de base (en euros) */
const POSTES=[
 {k:'bagages',type:'croisiere',nom:'Bagages',ic:'🧳',fond:'#e3eefb',paie:1800,grade:'occ',duree:'la soute',pret:true,fn:['bagages.js','ouvrirBagages']},
 {k:'embarq',type:'ferry',nom:'Saisissage',ic:'⛓️',fond:'#e2f4e6',paie:2600,grade:'nd',duree:'les remorques',pret:true,fn:['saisissage.js','ouvrirSaisissage']},
 {k:'portique',type:'conteneurs',nom:'Portique',ic:'🏗️',fond:'#fdecd8',paie:3500,grade:'dock',duree:'6 boîtes',pret:true,fn:['portique.js','ouvrirPortique']},
 {k:'cavalier',type:'conteneurs',nom:'Cavalier',ic:'🚛',fond:'#e8e4f6',paie:4500,grade:'chauf',duree:'le parc',pret:false}];
const PLEIN=4;              /* vacations à plein tarif par jour, ensuite la paie baisse */

/* le jour du port : les escales changent chaque jour, les mêmes pour tout le monde */
function jour(){const d=new Date();return d.getFullYear()*1000+Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);}
function hasard(s){let n=s|0;return()=>{n=(n*1103515245+12345)&0x7fffffff;return n/0x7fffffff;};}
function escales(){const r=hasard(jour()*7919);return ['croisiere','conteneurs','ferry'].map(t=>{const L=NAVIRES[t];return {type:t,nom:L[(r()*L.length)|0][0],quai:L[(r()*L.length)|0][1]};});}
function vacations(){const E=escales(),r=hasard(jour()*31);const H={bagages:7,embarq:13,portique:9,cavalier:16};
 return POSTES.map(p=>{const es=E.find(x=>x.type===p.type);return Object.assign({},p,{navire:es.nom,heure:H[p.k]+((r()*2)|0)});}).sort((a,b)=>(RANG[a.grade]-RANG[b.grade])||(a.heure-b.heure));}
function faites(){try{const o=JSON.parse(localStorage.getItem('vac_jour')||'{}');return o.j===jour()?o.n|0:0;}catch(x){return 0;}}
function compter(){try{localStorage.setItem('vac_jour',JSON.stringify({j:jour(),n:faites()+1}));}catch(x){}}
const eur=v=>Math.round(v).toLocaleString('fr-FR')+' €';

let RAC=null,SEL=null;
function css(){if(document.getElementById('vacCss'))return;const s=document.createElement('style');s.id='vacCss';s.textContent=`
#vac{position:fixed;inset:0;z-index:2147482500;background:#f8f4ec;color:#1d1a16;font-family:'Baloo 2',system-ui,sans-serif;overflow-y:auto;-webkit-overflow-scrolling:touch;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1);padding-bottom:calc(24px + env(safe-area-inset-bottom))}
#vac.on{transform:none}
#vac .top{padding:calc(16px + env(safe-area-inset-top)) 18px 8px;display:flex;align-items:center}
#vac h1{margin:0;font-size:27px;line-height:1;font-weight:800}
#vac .x{margin-left:auto;width:40px;height:40px;border-radius:50%;background:#ece4d6;border:0;font-family:inherit;font-weight:800;font-size:17px;color:#1d1a16}
#vac .moi{margin:6px 14px 6px;background:#1b2330;color:#f2efe4;border-radius:20px;padding:12px 14px;display:flex;gap:12px;align-items:center}
#vac .moi .gr{font-size:11px;color:#f5d27a;letter-spacing:.08em;font-weight:800}
#vac .moi b{font-size:17px;display:block;line-height:1.15}
#vac .jauge{display:flex;gap:4px;margin-top:6px}#vac .jauge i{width:22px;height:7px;border-radius:4px;background:#f5d27a}#vac .jauge i.v{background:#3a4458}
#vac .moi .r{margin-left:auto;text-align:right;font-size:11px;opacity:.85}#vac .moi .r b{font-size:15px;color:#bff0c0}
#vac .essai{margin:6px 14px 0;background:#fff3d6;color:#7a5a12;border-radius:14px;padding:8px 12px;font-size:12.5px;font-weight:700;line-height:1.3}
#vac .tt{font-size:12px;font-weight:800;color:#a89a84;letter-spacing:.06em;margin:14px 18px 6px}
#vac .esc{display:flex;gap:8px;overflow-x:auto;padding:0 14px 4px;scrollbar-width:none}#vac .esc::-webkit-scrollbar{display:none}
#vac .bat{flex:none;width:132px;border-radius:16px;padding:9px 11px;color:#fff;font-size:11.5px;font-weight:700;position:relative;overflow:hidden;line-height:1.25}
#vac .bat b{display:block;font-size:13.5px;line-height:1.15;margin-bottom:2px}#vac .bat svg{position:absolute;right:-6px;bottom:-4px;opacity:.3}
#vac .c{margin:0 14px 10px;background:#fff;border-radius:20px;padding:12px 14px;display:grid;grid-template-columns:48px 1fr auto;gap:0 12px;align-items:center;box-shadow:0 2px 0 #ece4d6;cursor:pointer}
#vac .ic{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:24px}
#vac .c b{font-size:17px;display:block;line-height:1.15}#vac .c small{font-size:12px;color:#8a7c66;font-weight:600}
#vac .eur{text-align:right;font-weight:800;font-size:19px;line-height:1.05;white-space:nowrap}#vac .eur small{display:block;font-size:11px;color:#8a7c66}
#vac .tag{display:inline-block;font-size:10px;font-weight:800;padding:1px 7px;border-radius:9px;background:#efe6d6;color:#7a6a52;margin-left:4px;vertical-align:2px}
#vac .c.lock{opacity:.55}#vac .c.sel{box-shadow:0 0 0 2px #2f5d4a,0 2px 0 #ece4d6}
#vac .go{grid-column:1/-1;margin-top:10px;background:#2f5d4a;color:#fff;border:0;border-radius:14px;padding:11px;font-family:inherit;font-weight:800;font-size:15px;width:100%}
#vac .go.non{background:#d8cfbf;color:#7a6a52}
#vac .pied{margin:6px 18px 0;font-size:12px;color:#a89a84;font-weight:600;line-height:1.35}
`;document.head.appendChild(s);}
const SVG={croisiere:'<path d="M2 20h56l-8 12H10z M12 8h32v12H12z M18 2h14v6H18z" fill="#fff"/>',conteneurs:'<path d="M2 20h56l-8 12H10z M8 10h12v10H8zM22 10h12v10H22zM36 10h12v10H36zM15 2h12v8H15z" fill="#fff"/>',ferry:'<path d="M2 20h56l-8 12H10z M10 8h36v12H10z M16 2h20v6H16z" fill="#fff"/>'};
function remplir(){if(!RAC)return;const G=grade(),n=faites(),V=vacations();
 const facteur=n<PLEIN?1:Math.max(.25,1-(n-PLEIN+1)*.25);
 let h='<div class="top"><h1>Les vacations</h1><button class="x" aria-label="Fermer">✕</button></div>';
 h+='<div class="moi"><div><span class="gr">'+G.nom.toUpperCase()+' · NIV. '+niveau()+'</span><b>'+(e.pseudo||'Docker')+'</b><div class="jauge">'+Array.from({length:PLEIN},(_,i)=>'<i'+(i<n?' class="v"':'')+'></i>').join('')+'</div></div>'+
  '<div class="r">'+(n<PLEIN?'<b>'+(PLEIN-n)+' à plein tarif</b><br>aujourd’hui':'<b>Paie à '+Math.round(facteur*100)+' %</b><br>repos conseillé')+'</div></div>';
 h+='<div class="essai">Bagages et Saisissage sont payés selon ton score. Les autres postes : paie bientôt.</div>';
 h+='<div class="tt">LES ESCALES DU JOUR</div><div class="esc">'+escales().map(s=>'<div class="bat" style="background:'+COUL[s.type]+'"><b>'+s.nom+'</b>'+LIB[s.type]+' · '+s.quai+'<svg width="60" height="34">'+SVG[s.type]+'</svg></div>').join('')+'</div>';
 h+='<div class="tt">ON EMBAUCHE</div>';
 V.forEach(v=>{const ok=RANG[G.k]>=RANG[v.grade],gnom=GRADES.find(x=>x.k===v.grade).nom.toLowerCase();
  h+='<div class="c'+(ok?'':' lock')+(SEL===v.k?' sel':'')+'" data-k="'+v.k+'"><span class="ic" style="background:'+(ok?v.fond:'#efe6d6')+'">'+(ok?v.ic:'🔒')+'</span>'+
   '<span><b>'+v.nom+' <span class="tag">'+String(v.heure).padStart(2,'0')+'h</span></b><small>'+v.navire+' · '+(ok?v.duree:'il faut être '+gnom)+'</small></span>'+
   '<span class="eur">'+eur(v.paie*(ok?facteur:1))+'<small>'+gnom+'</small></span>'+
   (SEL===v.k&&ok?'<button class="go'+(v.pret?'':' non')+'">'+(v.pret?'Prendre la vacation':'Poste en préparation')+'</button>':'')+'</div>';});
 h+='<div class="pied">Chaque jour, de nouveaux navires. Après '+PLEIN+' vacations, la paie baisse : le port aime les dockers reposés.</div>';
 RAC.innerHTML=h;
 RAC.querySelector('.x').onclick=fermer;
 RAC.querySelectorAll('.c').forEach(c=>c.onclick=ev=>{const k=c.dataset.k;if(ev.target.closest('.go')){prendre(k);return;}SEL=SEL===k?null:k;remplir();});}
async function prendre(k){const v=vacations().find(p=>p.k===k);if(!v||!v.pret)return;const G=grade();if(RANG[G.k]<RANG[v.grade])return;
 compter();fermer();
 try{if(!window[v.fn[1]])eval(await chargerMorceau(v.fn[0]));window[v.fn[1]](v.navire);}catch(x){console.warn('VAC',x);}}
function fermer(){if(!RAC)return;const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);}
window.ouvrirVacations=function(){if(RAC)return;css();SEL=null;const d=document.createElement('div');d.id='vac';RAC=d;document.body.appendChild(d);remplir();
 window.ECRAN_COUVRANT=true;requestAnimationFrame(()=>d.classList.add('on'));};
})();
