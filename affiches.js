/* =====================================================================
   À L'AFFICHE — le panneau de la place de la Joliette, vu de près.
   Du liège, des punaises, des affiches de travers. On touche une
   affiche pour la lire ; on l'arrache (ou on prend une languette) et
   c'est un rendez-vous : le plateau de Mistral TV, le Labo…
   Un écran à part. Chargé à la demande par joliette.js (eval direct).
   ===================================================================== */
(()=>{
const CSS=`#aff{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;
  background:#c89a5e;background-image:radial-gradient(rgba(110,70,30,.35) 1px,transparent 1.4px),radial-gradient(rgba(255,230,180,.35) 1px,transparent 1.4px);background-size:7px 7px,11px 11px;background-position:0 0,3px 5px;
  box-shadow:inset 0 0 0 10px #7a4e2c,inset 0 0 0 13px #5a3418,inset 0 0 40px rgba(60,30,10,.45);opacity:0;transform:scale(.96);transition:opacity .2s,transform .25s cubic-bezier(.2,.8,.2,1)}
#aff.on{opacity:1;transform:none}#aff *{box-sizing:border-box}
#aff .hd{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 22px) 22px 6px}
#aff .hd .tt{flex:1;transform:rotate(-1.5deg);background:#1f1a14;color:#f2c94c;border-radius:6px;padding:4px 12px 3px;font:800 20px 'Baloo 2',system-ui,sans-serif;box-shadow:0 3px 0 rgba(0,0,0,.3);align-self:flex-start;flex:none}
#aff .hd .tt small{display:block;font:800 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#d8c8a8;margin-top:-3px}
#aff .hd .sp{flex:1}
#aff .x{width:40px;height:40px;border-radius:50%;border:0;background:#fffaf0;box-shadow:0 3px 0 rgba(0,0,0,.25);font:800 16px 'Baloo 2',system-ui,sans-serif;color:#1f1a14}
#aff .mur{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:12px 22px calc(28px + env(safe-area-inset-bottom));display:grid;grid-template-columns:1fr 1fr;gap:18px 14px;align-content:start}
#aff .a{position:relative;border:0;padding:0;text-align:left;font-family:inherit;color:inherit;background:none;transform:rotate(var(--r));transition:transform .15s}
#aff .a:active{transform:rotate(var(--r)) scale(.97)}
#aff .a .p{position:relative;border-radius:3px;padding:12px 11px 11px;min-height:150px;box-shadow:0 6px 10px rgba(50,25,5,.35),0 1px 0 rgba(0,0,0,.1);overflow:hidden}
#aff .a .p:after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.18),transparent 40%,rgba(0,0,0,.06));pointer-events:none}
#aff .pin{position:absolute;top:-6px;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff8a7a,#c8201a 60%);box-shadow:0 2px 2px rgba(0,0,0,.4);z-index:2}
#aff .a .p h3{margin:0;font:900 19px/1 'Baloo 2',system-ui,sans-serif;letter-spacing:-.2px}
#aff .a .p .k{font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;opacity:.75}
#aff .a .p p{margin:6px 0 0;font:700 12px/1.25 'Baloo 2',system-ui,sans-serif}
#aff .a .p .big{font-size:34px;line-height:1;margin:6px 0 2px}
#aff .lang{display:flex;gap:0;margin:8px -11px -11px;border-top:1.5px dashed rgba(0,0,0,.35)}
#aff .lang span{flex:1;height:30px;border-right:1.5px dashed rgba(0,0,0,.35);font:800 7.5px 'Baloo 2',system-ui,sans-serif;writing-mode:vertical-rl;text-align:center;padding:2px 0;overflow:hidden}
#aff .lang span.pris{visibility:hidden}
#aff .neuf{position:absolute;right:-4px;top:12px;background:#e8302a;color:#fff;font:900 10px 'Baloo 2',system-ui,sans-serif;padding:1px 8px;transform:rotate(12deg);border-radius:3px;z-index:3;box-shadow:0 2px 0 rgba(0,0,0,.25)}
/* l'affiche ouverte */
#aff .zoom{position:fixed;inset:0;z-index:5;background:rgba(30,18,8,.55);display:grid;place-items:center;padding:24px;opacity:0;transition:opacity .2s}
#aff .zoom.on{opacity:1}
#aff .zoom .a{width:min(330px,86vw);transform:rotate(0) scale(.9);transition:transform .25s cubic-bezier(.2,.8,.2,1)}#aff .zoom.on .a{transform:none}
#aff .zoom .a .p{min-height:300px;padding:20px 18px 18px}#aff .zoom .a .p h3{font-size:30px}#aff .zoom .a .p p{font-size:15px}#aff .zoom .a .p .big{font-size:60px}
#aff .zoom .act{display:flex;gap:10px;margin-top:16px;width:min(330px,86vw)}
#aff .zoom .act button{flex:1;border:0;border-radius:16px;padding:12px;font:800 16px 'Baloo 2',system-ui,sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.25)}
#aff .zoom .go{background:#f2c94c;color:#1f1a14}#aff .zoom .no{background:#fffaf0;color:#1f1a14;flex:0 0 auto!important;padding:12px 18px!important}
#aff .rien{grid-column:1/3;justify-self:center;margin-top:40px;position:relative;width:min(260px,80%);background:#fffaf0;transform:rotate(-2deg);padding:20px 16px 16px;border-radius:3px;box-shadow:0 6px 10px rgba(50,25,5,.35);font:800 18px/1.2 'Chalkboard SE','Comic Sans MS','Baloo 2',system-ui,sans-serif;color:#3a3a3a;text-align:center}
#aff .rien small{display:block;margin-top:6px;font-size:13px;font-weight:700;color:#7a7a7a}
#aff .dechire{animation:affD .5s forwards}@keyframes affD{40%{transform:rotate(-6deg) translateY(-10px)}100%{transform:rotate(14deg) translate(40px,120%);opacity:0}}`;
/* LES AFFICHES : leur look, leur texte, ce qu'il se passe quand on les prend */
/* LES AFFICHES : aucune pour l'instant (on les choisira plus tard). Modèle d'une affiche :
 {id,r:-2,fond,coul,k:'SURTITRE',h:'Titre',big:'📺',p:'Texte',neuf:true,lang:'LANGUETTE',main:false,go:'Arracher et y aller',fait:()=>aller('page.html','…')} */
const AFF=[];
let RAC=null;
function mot(t){try{if(typeof texteVolant==='function'&&typeof joueur!=='undefined')texteVolant(joueur.x,joueur.y-40,t,'#f0cf7d');}catch(x){}}
function aller(url,t){fermer();const v=document.createElement('div');v.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#1f1a14;color:#f2c94c;display:grid;place-items:center;font:800 20px "Baloo 2",system-ui,sans-serif;opacity:0;transition:opacity .35s';v.textContent=t;document.body.appendChild(v);requestAnimationFrame(()=>v.style.opacity='1');
  setTimeout(()=>{try{sauver();}catch(x){}location.href=url+'?t='+Date.now();},900);}
const PRIS=()=>{try{return JSON.parse(localStorage.getItem('aff_pris')||'{}');}catch(x){return {};}};
function carte(a,grand){const pris=PRIS()[a.id]||0;return '<button class="a" data-id="'+a.id+'" style="--r:'+(grand?0:a.r)+'deg"><span class="pin"></span>'+(a.neuf?'<span class="neuf">NOUVEAU</span>':'')+
  '<div class="p" style="background:'+a.fond+';color:'+a.coul+(a.main?';font-family:\'Chalkboard SE\',\'Comic Sans MS\',system-ui,sans-serif':'')+'"><div class="k">'+a.k+'</div><div class="big">'+a.big+'</div><h3>'+a.h+'</h3><p>'+a.p+'</p>'+
  (a.lang?'<div class="lang">'+[0,1,2,3,4,5].map(k=>'<span'+(k<pris?' class="pris"':'')+'>'+a.lang+'</span>').join('')+'</div>':'')+'</div></button>';}
function ouvrirAffiche(a){const z=document.createElement('div');z.className='zoom';z.innerHTML=carte(a,true)+'<div class="act"><button class="no">Laisser</button><button class="go">'+a.go+'</button></div>';
  RAC.appendChild(z);requestAnimationFrame(()=>z.classList.add('on'));try{vibrer(8);}catch(x){}
  const ferme=()=>{z.classList.remove('on');setTimeout(()=>z.remove(),200);};
  z.onclick=ev=>{if(ev.target===z)ferme();};z.querySelector('.no').onclick=ferme;
  z.querySelector('.go').onclick=()=>{try{vibrer([10,30,10]);}catch(x){}
    if(a.lang){const P=PRIS();P[a.id]=Math.min(6,(P[a.id]||0)+1);localStorage.setItem('aff_pris',JSON.stringify(P));const s=z.querySelectorAll('.lang span')[P[a.id]-1];if(s)s.classList.add('dechire');}
    else z.querySelector('.a').classList.add('dechire');
    setTimeout(()=>{ferme();a.fait();if(RAC)remplir();},550);};}
function remplir(){RAC.querySelector('.mur').innerHTML=AFF.length?AFF.map(a=>carte(a)).join(''):'<div class="rien"><span class="pin"></span>Rien d’affiché pour l’instant.<small>Repasse bientôt : les affiches arrivent.</small></div>';
  RAC.querySelectorAll('.mur .a').forEach(b=>b.onclick=()=>ouvrirAffiche(AFF.find(a=>a.id===b.dataset.id)));}
function fermer(){if(!RAC)return;window.ECRAN_COUVRANT=false;const R0=RAC;RAC=null;R0.classList.remove('on');setTimeout(()=>R0.remove(),250);}
window.ouvrirLesAffiches=function(){if(RAC)return;
  if(!document.getElementById('affCss')){const s=document.createElement('style');s.id='affCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='aff';RAC=d;
  d.innerHTML='<div class="hd"><div class="tt">À l’affiche<small>PLACE DE LA JOLIETTE</small></div><span class="sp"></span><button class="x" aria-label="Fermer">✕</button></div><div class="mur"></div>';
  document.body.appendChild(d);remplir();requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},260);
  d.querySelector('.x').onclick=()=>{try{vibrer(8);}catch(x){}fermer();};};
})();
