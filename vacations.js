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
const GRADES=[{k:'occ',nom:'Docker occasionnel',min:1},{k:'nd',nom:'Nouveau docker',min:5},{k:'dock',nom:'Docker',min:10},{k:'chauf',nom:'Chauffeur',min:20},{k:'point',nom:'Pointeur',min:35},{k:'mens',nom:'Docker mensuel',min:55},{k:'contre',nom:'Contremaître',min:80},{k:'chef',nom:'Chef de service',min:100},{k:'dir',nom:'Directeur du port',min:150}];
function grade(){const n=niveau();let g=GRADES[0];for(const x of GRADES)if(n>=x.min)g=x;return g;}
const MULT=[1,1.3,1.6,2,2.5,3,3.6,4.2,5];
const RANG={occ:0,nd:1,dock:2,chauf:3,point:4,mens:5,contre:6,chef:7,dir:8};

/* les navires qui font escale à Marseille */
const NAVIRES={
 croisiere:[['MSC World Europa','quai 4'],['Costa Smeralda','quai 3'],['MSC Fantasia','quai 4'],['Norwegian Epic','quai 2'],['AIDAnova','quai 3']],
 conteneurs:[['CMA CGM Jacques Saadé','Mourepiane'],['CMA CGM Roosevelt','Mourepiane'],['MSC Gülsün','Fos'],['CMA CGM Marco Polo','Mourepiane']],
 ferry:[['Pascal Paoli','gare maritime'],['Piana','gare maritime'],['Danielle Casanova','gare maritime'],['Méga Express','gare maritime']]};
const COUL={croisiere:'#2a6a9a',conteneurs:'#c0392b',ferry:'#2e7d4f'};
const LIB={croisiere:'Croisière',conteneurs:'Conteneurs',ferry:'Corse · ferry'};
/* les postes et leur paie de base (en euros) */
const POSTES=[
 {k:'bagages',type:'croisiere',nom:'Bagages',ic:'🧳',fond:'#e3eefb',paie:1800,grade:'occ',duree:'la soute',pret:true,fn:['bagages.js','ouvrirBagages']}];
const PLEIN=4;              /* vacations à plein tarif par jour, ensuite la paie baisse */

/* le jour du port : les escales changent chaque jour, les mêmes pour tout le monde */
function jour(){const d=new Date();return d.getFullYear()*1000+Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);}
function hasard(s){let n=s|0;return()=>{n=(n*1103515245+12345)&0x7fffffff;return n/0x7fffffff;};}
function escales(){const r=hasard(jour()*7919);return ['croisiere','conteneurs','ferry'].map(t=>{const L=NAVIRES[t];return {type:t,nom:L[(r()*L.length)|0][0],quai:L[(r()*L.length)|0][1]};});}
function vacations(){const E=escales(),r=hasard(jour()*31);const H={bagages:7,embarq:13,twists:9,portique:20,douglas:16};
 return POSTES.map(p=>{const es=E.find(x=>x.type===p.type);return Object.assign({},p,{navire:es.nom,quai:es.quai,heure:H[p.k]+((r()*2)|0)});}).sort((a,b)=>(RANG[a.grade]-RANG[b.grade])||(a.heure-b.heure));}
function faites(){try{const o=JSON.parse(localStorage.getItem('vac_jour')||'{}');return o.j===jour()?o.n|0:0;}catch(x){return 0;}}
function compter(){try{localStorage.setItem('vac_jour',JSON.stringify({j:jour(),n:faites()+1}));}catch(x){}}
const eur=v=>Math.round(v).toLocaleString('fr-FR')+' €';

let RAC=null,SEL=null;
function css(){if(document.getElementById('vacCss'))return;const s=document.createElement('style');s.id='vacCss';s.textContent=`
#vac{position:fixed;inset:0;z-index:2147482500;font-family:'Baloo 2',system-ui,sans-serif;color:#16213a;overflow:hidden;opacity:0;transition:opacity .25s;
 background:#e6dac2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='32'%3E%3Crect width='64' height='32' fill='%23e3d6bc'/%3E%3Crect x='1' y='1' width='30' height='14' fill='%23ebe0c9'/%3E%3Crect x='33' y='17' width='30' height='14' fill='%23ebe0c9'/%3E%3Crect x='33' y='1' width='30' height='14' fill='%23e8dcc4'/%3E%3Crect x='1' y='17' width='30' height='14' fill='%23e8dcc4'/%3E%3C/svg%3E");background-size:64px 32px}
#vac.on{opacity:1}#vac *{box-sizing:border-box}
#vac .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 10px) 18px calc(16px + env(safe-area-inset-bottom));overflow-y:auto}
#vac .x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);right:12px;z-index:3;width:42px;height:42px;border:3px solid #16213a;border-radius:4px;background:#f6efdc;color:#16213a;font:900 18px ui-monospace,monospace;box-shadow:0 4px 0 #16213a}
#vac .scene{flex:none;position:relative;width:100%;max-width:380px;height:min(46vh,330px);display:flex;align-items:flex-end;justify-content:center}
#vac .scene canvas{image-rendering:pixelated;height:100%;width:auto;transform:translateY(20px);opacity:0;transition:all .45s cubic-bezier(.2,.9,.3,1)}
#vac.on .scene canvas{transform:none;opacity:1}
#vac .bulle{flex:none;position:relative;width:100%;max-width:400px;margin-top:6px;background:#16213a;border:4px solid #e8c050;box-shadow:0 0 0 4px #16213a,0 9px 0 rgba(0,0,0,.22);border-radius:4px;padding:12px 14px;color:#f2ead6;font:600 15px/1.38 Georgia,'Times New Roman',serif;min-height:92px}
#vac .bulle:before{content:'';position:absolute;left:46%;top:-24px;border:10px solid transparent;border-bottom-color:#e8c050}
#vac .bulle .n{display:block;font:900 11px ui-monospace,monospace;letter-spacing:2px;color:#e8c050;margin-bottom:3px}
#vac .bulle em{font-style:normal;color:#ffd860;font-weight:900}
#vac .bulle .cur{display:inline-block;width:8px;height:14px;background:#e8c050;margin-left:3px;vertical-align:-2px;animation:vacC .7s steps(2) infinite}@keyframes vacC{50%{opacity:0}}
#vac .ch{flex:none;width:100%;max-width:400px;margin-top:20px}
#vac .c{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;background:#f6efdc;border:4px solid #16213a;border-radius:4px;box-shadow:0 6px 0 #16213a;padding:10px 12px;margin-bottom:16px;cursor:pointer;opacity:0;transform:translateX(-14px);transition:all .3s}
#vac .c.vu{opacity:1;transform:none}
#vac .c:active{transform:translateY(4px);box-shadow:0 2px 0 #16213a}
#vac .c .fl{font:900 15px ui-monospace,monospace;color:#c0392b}
#vac .c b{display:block;font:900 17px/1.15 Georgia,serif;color:#16213a}#vac .c small{display:block;font:700 11.5px ui-monospace,monospace;color:#6a5a40;margin-top:2px}
#vac .c .px{margin-left:auto;background:#2f5d4a;color:#fff;font:900 15px ui-monospace,monospace;padding:6px 8px;border-radius:3px;white-space:nowrap}
#vac .c.p{background:#fff6d8}
#vac .sp{flex:1;min-height:10px}
#vac .id{flex:none;width:100%;max-width:400px;display:flex;gap:12px;align-items:center;background:#16213a;border:4px solid #e8c050;border-radius:4px;padding:8px 12px;color:#f2ead6;box-shadow:0 0 0 4px #16213a}
#vac .id canvas{width:34px;height:54px;image-rendering:pixelated;flex:none}
#vac .id b{display:block;font:900 14px ui-monospace,monospace;color:#ffd860;letter-spacing:.5px}#vac .id span{display:block;font:700 11.5px ui-monospace,monospace}
#vac .id .bar{height:9px;background:#2e3a4e;margin-top:5px;border:2px solid #0a1020}#vac .id .bar i{display:block;height:100%;background:#e8c050}
#vac .id small{display:block;font:700 10.5px ui-monospace,monospace;color:#8ab0d8;margin-top:3px}
`;document.head.appendChild(s);}
let OPT={};
/* ce que dit le kiosquier, selon la journée */
function replique(v,n,G){const nom=String((typeof e!=='undefined'&&e.pseudo)||'collègue').replace(/[<>&]/g,'');const r=hasard(jour()*13+n)();
 if(n>=PLEIN)return 'Encore toi, '+nom+' ? T’as déjà fait tes '+PLEIN+' vacations. Tu peux y retourner, mais <em>la paie baisse</em> : le port aime les dockers reposés.';
 const L=['Salut '+nom+' ! Y’a du boulot : l’<em>'+v.navire+'</em> attend ses bagages, '+v.quai+'. Ça paie bien aujourd’hui.',
  'Ah, '+nom+' ! Le chef de quai cherche du monde pour la soute de l’<em>'+v.navire+'</em>. Embauche à '+String(v.heure).padStart(2,'0')+'h.',
  'Bien le bonjour, '+nom+'. L’<em>'+v.navire+'</em> vient d’accoster, '+v.quai+'. Ils ont besoin de bras pour les bagages.'];
 return L[(r*L.length)|0];}
function remplir(){if(!RAC)return;const G=grade(),n=faites(),V=vacations(),v=V[0],mult=MULT[RANG[G.k]];
 const facteur=n<PLEIN?1:Math.max(.25,1-(n-PLEIN+1)*.25),niv=niveau(),ri=RANG[G.k],suiv=GRADES[ri+1];
 const pc=suiv?Math.max(4,Math.min(100,Math.round(100*(niv-G.min)/(suiv.min-G.min)))):100;
 let h='<button class="x" aria-label="Fermer">✕</button><div class="in"><div class="scene"><canvas class="kio"></canvas></div>'+
  '<div class="bulle"><span class="n">LE KIOSQUIER</span><span class="tx"></span><span class="cur"></span></div>'+
  '<div class="ch"><button class="c p" data-k="soute"><span class="fl">▶</span><span><b>Descendre à la soute</b><small>Bagagiste · paie au score</small></span><span class="px">~'+eur(v.paie*mult*facteur)+'</span></button>'+
  (OPT.journal?'<button class="c" data-k="journal"><span class="fl">▶</span><span><b>Acheter le journal</b><small>Le Quai, l’édition du jour</small></span></button>':'')+'</div>'+
  '<div class="sp"></div><div class="id"><canvas class="moi" width="68" height="108"></canvas><div style="flex:1;min-width:0"><b>'+G.nom.toUpperCase()+' · NIV. '+niv+'</b><span>paie ×'+String(mult).replace('.',',')+' · '+(n<PLEIN?(PLEIN-n)+' vacation'+(PLEIN-n>1?'s':'')+' à plein tarif':'paie à '+Math.round(facteur*100)+' %')+'</span>'+
  '<div class="bar"><i style="width:'+pc+'%"></i></div><small>'+(suiv?'Niv. '+suiv.min+' → '+suiv.nom+' · paie ×'+String(MULT[ri+1]).replace('.',','):'Grade maximum. Respect.')+'</small></div></div></div>';
 RAC.innerHTML=h;
 /* le kiosque, dessiné en grand avec son vrai dessin */
 const kc=RAC.querySelector('.kio');try{const T=(typeof KIOSQUE!=='undefined')?KIOSQUE.graver():null;if(T){kc.width=T.toile.width;kc.height=T.toile.height;kc.getContext('2d').drawImage(T.toile,0,0);}else kc.remove();}catch(x){kc.remove();}
 /* toi, sur ta carte de docker */
 try{const q=RAC.querySelector('.moi').getContext('2d');q.imageSmoothingEnabled=false;q.setTransform(2,0,0,2,0,0);personne(q,17,52,Object.assign({},e.ap||{}),'bas',0,false);}catch(x){}
 /* il parle, lettre après lettre */
 const tx=RAC.querySelector('.tx'),html=replique(v,n,G);let k=0;const plain=html.replace(/<[^>]+>/g,'');
 const cs=[...RAC.querySelectorAll('.c')];const montre=()=>{tx.innerHTML=html;cs.forEach((c,i)=>setTimeout(()=>c.classList.add('vu'),i*110));};
 const tic=setInterval(()=>{if(!RAC){clearInterval(tic);return;}k+=2;if(k>=plain.length){clearInterval(tic);montre();return;}tx.textContent=plain.slice(0,k);},22);
 RAC.querySelector('.bulle').onclick=()=>{clearInterval(tic);montre();};
 RAC.querySelector('.x').onclick=fermer;
 cs.forEach(c=>c.onclick=()=>{if(!c.classList.contains('vu'))return;const k2=c.dataset.k;if(k2==='journal'){fermer();setTimeout(()=>{try{OPT.journal();}catch(x){}},250);return;}prendre('bagages');});}
async function prendre(k){const v=vacations().find(p=>p.k===k);if(!v||!v.pret)return;const G=grade();if(RANG[G.k]<RANG[v.grade])return;
 compter();fermer();
 try{if(!window[v.fn[1]])eval(await chargerMorceau(v.fn[0]));window[v.fn[1]](v.navire);}catch(x){console.warn('VAC',x);}}
function fermer(){if(!RAC)return;const r=RAC;RAC=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);}
window.ouvrirVacations=function(opt){if(RAC)return;OPT=opt||{};css();SEL=null;const d=document.createElement('div');d.id='vac';RAC=d;document.body.appendChild(d);remplir();
 window.ECRAN_COUVRANT=true;requestAnimationFrame(()=>d.classList.add('on'));};
})();
