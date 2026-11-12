/* =====================================================================
   LE GRAND MISTRAL — le jeu télé de Mistral TV, sur sa propre page
   (jeutv.html). Une émission par jour. Trois niveaux. Trois candidats :
   toi, Gégé (le râleur) et Momo (le confiant).
   Manche 1 : le buzzer. Manche 2 : le juste prix du port.
   Finale : la roue du Mistral.

   LE SERVEUR DÉCIDE DE TOUT (tv_debut, tv_repondre, tv_prix, tv_roue) :
   les questions, les bonnes réponses, ce que font Gégé et Momo, la roue,
   les gains en euros et les lots exclusifs. La page ne fait que montrer.
   ===================================================================== */
(()=>{
const URL_SB='https://zpfkekiavlfphialvphi.supabase.co',CLE_SB='sb_publishable__dfR2lEOwKjhhtavvJEvGw_KVACZnHP';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const ALEA=L=>L[(Math.random()*L.length)|0];
const vib=x=>{try{navigator.vibrate&&navigator.vibrate(x);}catch(_){}};
const lireSave=()=>{try{return JSON.parse(localStorage.getItem('bdl.pix.v2')||'{}')||{};}catch(x){return {};}};
const SAVE=lireSave();
const ap=o=>Object.assign({peau:1,cheveux:1,coiffe:1,barbe:0,haut:2,veste:0,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true},o);
const AP_NADIA=ap({peau:1,cheveux:3,coiffe:5,haut:5,veste:23});
const moiAp=()=>SAVE.ap||ap({});
const moiNom=()=>String(SAVE.pseudo||SAVE.nom||'Toi').slice(0,10);
const euros=c=>((c||0)/100).toLocaleString('fr-FR',{maximumFractionDigits:0})+' €';
const NIV=[null,
  {nom:'Ouvrier',k:'FACILE',coul:'#5ad07a',gains:[10000,4000,1500],lot:null,dit:'Des questions pour s’échauffer.'},
  {nom:'Chef d’équipe',k:'MOYEN',coul:'#f2b030',gains:[25000,10000,4000],lot:'tv_blazer',dit:'Culture du port et de Marseille.'},
  {nom:'Capitaine',k:'EXPERT',coul:'#e8402a',gains:[60000,20000,8000],lot:'tv_veste_or',dit:'Pour les vrais. Gégé et Momo sont plus rapides.'}];
const LOTS={tv_pull_bise:{nom:'Pull « Bise de Nadia »',cond:'Ta 1re victoire',ap:{haut:3,veste:28}},
  tv_blazer:{nom:'Blazer Mistral TV',cond:'Gagner en Chef d’équipe',ap:{haut:0,veste:29}},
  tv_veste_or:{nom:'Veste à paillettes',cond:'Gagner en Capitaine',ap:{haut:0,veste:30}},
  tv_pantalon_or:{nom:'Pantalon doré',cond:'5 victoires',ap:{bas:0,pantalon:14}}};

/* ---------- LE SERVEUR ---------- */
let SB=null,SESSION=null,SB_CHARGE=null;
function supa(){if(SB_CHARGE)return SB_CHARGE;SB_CHARGE=(async()=>{for(const u of ['https://esm.sh/@supabase/supabase-js@2','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm']){
  try{const m=await import(u);SB=m.createClient(URL_SB,CLE_SB);try{SESSION=await window.BD_SESSION.reveiller(SB);}catch(x){}if(!SESSION)try{window.BD_SESSION.prevenir('Le Grand Mistral');}catch(x){}return SB;}catch(x){}}return null;})();return SB_CHARGE;}
async function rpc(nom,args){
  if(window.TVJ_FAUX)return window.TVJ_FAUX(nom,args||{});
  await supa();if(!SB)return {erreur:'Le studio ne répond pas. Vérifie ta connexion.'};
  if(!SESSION){try{SESSION=await window.BD_SESSION.reveiller(SB);}catch(x){}}
  if(!SESSION){try{window.BD_SESSION.prevenir('Le Grand Mistral');}catch(x){}return {erreur:'Connecte-toi pour jouer.'};}
  for(let essai=0;essai<3;essai++){try{const r=await SB.rpc(nom,args||{});if(r.error)return {erreur:r.error.message||'Le studio n’a pas répondu.'};return r.data||{erreur:'Le studio n’a pas répondu.'};}catch(x){await pause(600);}}
  return {erreur:'Le studio n’a pas répondu.'};}

/* ---------- LE SON ---------- */
let AC=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(x){}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function note(f,t0,d,type,vol,glis){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,a.currentTime+t0);
  if(glis)o.frequency.exponentialRampToValueAtTime(glis,a.currentTime+t0+d);g.gain.setValueAtTime(0,a.currentTime+t0);g.gain.linearRampToValueAtTime(vol||.08,a.currentTime+t0+.01);
  g.gain.exponentialRampToValueAtTime(.0005,a.currentTime+t0+d);o.connect(g).connect(a.destination);o.start(a.currentTime+t0);o.stop(a.currentTime+t0+d+.02);}
const SON={
  jingle(){[[523,0],[659,.12],[784,.24],[1047,.36],[784,.52],[1047,.64]].forEach(([f,t])=>note(f,t,.22,'square',.06));note(262,0,.8,'triangle',.08);note(392,.36,.6,'triangle',.07);},
  buzz(){note(140,0,.32,'sawtooth',.09);note(147,0,.32,'square',.05);},
  bon(){note(880,0,.12,'square',.06);note(1319,.1,.3,'square',.06);},
  faux(){[[392,0],[370,.32],[349,.64],[330,.96]].forEach(([f,t],i)=>note(f,t,i<3?.3:.8,'sawtooth',.06,i===3?300:0));},
  tic(){note(1600,0,.03,'square',.04);},
  plus(){note(660,0,.09,'square',.05);note(880,.08,.12,'square',.05);},
  moins(){note(660,0,.09,'square',.05);note(494,.08,.12,'square',.05);},
  roulement(d){for(let t=0;t<d;t+=.045)note(90+Math.random()*30,t,.05,'triangle',.05);},
  applaudir(d){const a=ac();if(!a)return;d=d||2;const n=a.sampleRate*.06,buf=a.createBuffer(1,n,a.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,6);
    for(let k=0;k<d*55;k++){const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=buf;f.type='bandpass';f.frequency.value=900+Math.random()*1800;f.Q.value=.8;
      const t=a.currentTime+Math.random()*d,fin=1-Math.max(0,(t-a.currentTime)-(d-.6))/.6;g.gain.value=.25*Math.max(.05,fin)*(.5+Math.random()*.5);s.connect(f).connect(g).connect(a.destination);s.start(t);}},
  fanfare(){[[523,0],[523,.14],[523,.28],[659,.42],[784,.7],[659,.9],[784,1.04],[1047,1.2]].forEach(([f,t],i)=>note(f,t,i===7?.8:.16,'square',.06));note(262,.42,1.6,'triangle',.08);}
};

/* ---------- L'ÉCRAN ---------- */
const CSS=`html,body{margin:0;height:100%;background:#040820;overscroll-behavior:none}
#tvj{position:fixed;inset:0;display:flex;flex-direction:column;background:radial-gradient(80% 45% at 50% 30%,rgba(60,110,255,.45),transparent 70%),radial-gradient(130% 70% at 50% 115%,#1a2a9a 0%,#0a1450 42%,#050a2a 80%);color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
#tvj *{box-sizing:border-box}
#tvj:before{content:'';position:absolute;left:50%;top:32%;width:1600px;height:1600px;margin:-800px;background:repeating-conic-gradient(from 0deg,rgba(120,170,255,.14) 0 5deg,transparent 5deg 14deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 60%);mask:radial-gradient(circle,#000 0,transparent 60%);animation:tvjR 90s linear infinite;pointer-events:none}@keyframes tvjR{to{transform:rotate(360deg)}}
#tvj:after{content:'';position:absolute;left:-30%;right:-30%;bottom:0;height:42%;background:linear-gradient(transparent,rgba(40,80,230,.32)),repeating-linear-gradient(90deg,rgba(140,180,255,.13) 0 1px,transparent 1px 44px),repeating-linear-gradient(rgba(140,180,255,.10) 0 1px,transparent 1px 44px);transform:perspective(320px) rotateX(58deg);transform-origin:bottom;pointer-events:none}
#tvj>*{position:relative;z-index:1}
#tvj .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 6px}
#tvj .logo{font:900 19px/1 'Baloo 2',system-ui,sans-serif;letter-spacing:.5px;background:linear-gradient(#fff,#ffe08a 45%,#e0a020 70%,#a86a10);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 #3a2000)}
#tvj .logo small{display:block;font:800 9px 'Baloo 2',system-ui,sans-serif;letter-spacing:3px;color:#9ab8ff;-webkit-text-fill-color:#9ab8ff;margin-top:2px}
#tvj .dir{display:flex;align-items:center;gap:5px;background:linear-gradient(#ff4a4a,#c01020);border-radius:4px;padding:3px 8px;font:900 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;visibility:hidden;box-shadow:0 0 14px rgba(255,60,40,.6)}
#tvj .dir:before{content:'';width:7px;height:7px;border-radius:50%;background:#fff;animation:tvjB 1s steps(2) infinite}@keyframes tvjB{50%{opacity:.2}}
#tvj.direct .dir{visibility:visible}
#tvj .sp{flex:1}#tvj .x{height:34px;padding:0 14px;border-radius:17px;border:1px solid rgba(201,162,74,.6);background:rgba(8,16,60,.6);color:#ffe08a;font:800 13px 'Baloo 2',system-ui,sans-serif}
#tvj .scene{flex:none;position:relative;height:clamp(180px,34dvh,320px);margin:0 10px;border-radius:14px;overflow:hidden;border:2px solid #c9a24a;box-shadow:0 0 0 4px #081450,0 0 0 5px rgba(201,162,74,.35),0 0 34px rgba(80,140,255,.55)}
#tvj.acc .scene{height:clamp(150px,26dvh,240px)}
#tvj .scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#tvj .man{position:absolute;left:50%;top:7px;transform:translateX(-50%);white-space:nowrap;padding:3px 14px;border-radius:3px;background:linear-gradient(#ffe08a,#d9a020);color:#2a1600;font:900 10.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.5)}
#tvj .man:empty{display:none}
#tvj .pan{position:absolute;left:50%;top:34px;transform:translateX(-50%) scale(.7);padding:4px 14px;border-radius:6px;background:#3a0a0a;color:#ffd0c0;font:900 13px 'Baloo 2',system-ui,sans-serif;letter-spacing:3px;border:2px solid #ffb0a0;transition:all .15s;opacity:0;pointer-events:none;z-index:3}
#tvj .pan.on{opacity:1;transform:translateX(-50%) scale(1);background:#e8302a;color:#fff;box-shadow:0 0 26px #ff4030}
/* LES LOSANGES DORÉS : un liseré or (le fond), un cœur bleu nuit (::before), le contenu par-dessus */
#tvj .bul,#tvj .rep,#tvj .gros,#tvj .niv{--lz:18px;clip-path:polygon(var(--lz) 0,calc(100% - var(--lz)) 0,100% 50%,calc(100% - var(--lz)) 100%,var(--lz) 100%,0 50%);background:linear-gradient(#a87a20,#fff2b0 48%,#c9a24a 52%,#8a5a10);position:relative;isolation:isolate}
#tvj .bul:before,#tvj .rep:before,#tvj .gros:before,#tvj .niv:before{content:'';position:absolute;inset:2.5px;clip-path:polygon(calc(var(--lz) - 1px) 0,calc(100% - var(--lz) + 1px) 0,100% 50%,calc(100% - var(--lz) + 1px) 100%,calc(var(--lz) - 1px) 100%,0 50%);background:linear-gradient(#16309a,#0a1660 55%,#0c1c78);z-index:-1;transition:background .2s}
#tvj .bul{flex:none;display:flex;gap:10px;align-items:center;margin:16px 10px 0;padding:12px 26px 12px 22px;min-height:78px;color:#fff;--lz:22px}
#tvj .bul canvas{flex:none;width:44px;height:44px;border-radius:50%;background:radial-gradient(#3a5ad8,#14287a);image-rendering:pixelated;box-shadow:0 0 0 2px #c9a24a}
#tvj .bul .qui{display:inline-block;font:900 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;color:#2a1600;background:linear-gradient(#ffe08a,#d9a020);padding:0 7px;border-radius:2px;margin-bottom:2px}
#tvj .bul p{margin:0;font:800 clamp(14px,4.1vw,16.5px)/1.22 'Baloo 2',system-ui,sans-serif}#tvj .bul p b{color:#ffcf4a}#tvj .bul p i{font-style:normal;color:#9ab8ff;font-size:.88em}
#tvj .zone{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:clamp(7px,1.3dvh,11px);padding:10px 10px calc(12px + env(safe-area-inset-bottom));min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
#tvj .zone.haut{justify-content:flex-start}
#tvj .rep{flex:none;border:0;padding:clamp(11px,1.8dvh,15px) 30px;text-align:left;font:800 clamp(15px,4.3vw,17.5px)/1.15 'Baloo 2',system-ui,sans-serif;color:#fff;display:flex;align-items:center;gap:10px;transition:transform .1s,opacity .2s}
#tvj .rep i{flex:none;font:900 17px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#ffcf4a}#tvj .rep i:before{content:'◆ ';font-size:13px}
#tvj .rep:active{transform:scale(.98)}
#tvj .rep.att:before{background:linear-gradient(#ffc030,#e08a00 60%,#c87000)}#tvj .rep.att{animation:tvjA .4s steps(2) infinite}#tvj .rep.att i{color:#fff}@keyframes tvjA{50%{filter:brightness(1.25)}}
#tvj .rep.bon:before{background:linear-gradient(#3ad070,#108a3a 60%,#0a6a2a)}#tvj .rep.bon i{color:#fff}
#tvj .rep.faux:before{background:linear-gradient(#e8443a,#a81a14)}#tvj .rep.faux i{color:#fff}
#tvj .rep.off{opacity:.38}
#tvj .chrono{flex:none;display:flex;justify-content:center;--k:1}#tvj .chrono .br{display:none}
#tvj .chrono b{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;font:900 26px 'Baloo 2',system-ui,sans-serif;color:#ffcf4a;background:radial-gradient(#081450 58%,transparent 60%),conic-gradient(#ffcf4a calc(var(--k)*360deg),rgba(255,255,255,.12) 0);box-shadow:0 0 22px rgba(255,200,60,.35)}
#tvj .gros{flex:none;border:0;padding:clamp(13px,2dvh,17px) 30px;font:900 19px 'Baloo 2',system-ui,sans-serif;color:#2a1600;--lz:20px}
#tvj .gros:before{background:linear-gradient(#ffe890,#f0b020 55%,#d08a00)}
#tvj .gros:active{transform:scale(.98)}#tvj .gros.b2{color:#fff}#tvj .gros.b2:before{background:linear-gradient(#16309a,#0a1660)}#tvj .gros:disabled{opacity:.6}
#tvj .prix{flex:none;background:linear-gradient(#12288a,#081450);border-radius:12px;padding:10px 12px;text-align:center;box-shadow:inset 0 0 0 2px #c9a24a,0 0 20px rgba(60,110,255,.35)}
#tvj .prix .obj{font:800 13.5px/1.2 'Baloo 2',system-ui,sans-serif;color:#cfe0ff}
#tvj .prix .val{font:900 clamp(32px,10vw,44px)/1.05 'Baloo 2',system-ui,sans-serif;color:#ffcf4a;letter-spacing:1px;text-shadow:0 0 18px rgba(255,200,60,.5)}
#tvj .prix .ess{font:800 12px 'Baloo 2',system-ui,sans-serif;color:#9ab8ff}
#tvj .four{position:relative;height:20px;margin:6px 4px 2px;border-radius:10px;background:#050a2a;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(201,162,74,.5)}
#tvj .four .ok{position:absolute;top:0;bottom:0;background:linear-gradient(90deg,rgba(255,207,74,.25),rgba(255,207,74,.5));border-left:2px solid #ffcf4a;border-right:2px solid #ffcf4a;transition:left .4s,right .4s}
#tvj .four span{position:absolute;top:0;bottom:0;display:flex;align-items:center;font:900 11px 'Baloo 2',system-ui,sans-serif;color:#fff;padding:0 6px}
#tvj .pav{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
#tvj .pav button{border:0;border-radius:10px;height:clamp(40px,6.3dvh,54px);font:900 22px 'Baloo 2',system-ui,sans-serif;color:#fff;background:linear-gradient(#1a38b0,#0a1660);box-shadow:inset 0 0 0 1.5px #c9a24a,inset 0 2px 0 rgba(255,255,255,.18)}
#tvj .pav button:active{transform:scale(.96)}#tvj .pav .ok{background:linear-gradient(#ffe890,#f0b020 55%,#d08a00);color:#2a1600}
#tvj .rw{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative}
#tvj canvas.roue{display:block;touch-action:none;filter:drop-shadow(0 0 18px rgba(255,200,60,.35))}
#tvj .rw .gl{flex:none;height:16px;text-align:center;font:800 12px 'Baloo 2',system-ui,sans-serif;color:#9ab8ff;pointer-events:none}
#tvj .pop{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%) scale(.3);font:900 46px/1 'Baloo 2',system-ui,sans-serif;color:#ffcf4a;text-shadow:0 4px 0 #6a3a00,0 0 30px rgba(255,200,60,.6);opacity:0;pointer-events:none;white-space:nowrap;animation:tvjPop 1.3s forwards;z-index:9}
@keyframes tvjPop{15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}
#tvj .conf{position:absolute;top:-12px;width:8px;height:12px;pointer-events:none;animation:tvjC linear forwards;z-index:10;border-radius:2px}@keyframes tvjC{to{transform:translateY(110vh) rotate(720deg)}}
#tvj .niv{flex:none;display:flex;align-items:center;gap:10px;border:0;padding:10px 26px;text-align:left;color:#fff;font-family:inherit;--lz:16px}
#tvj .niv:active{transform:scale(.98)}
#tvj .niv .pt{flex:none;width:8px;height:36px;border-radius:4px;box-shadow:0 0 10px currentColor}
#tvj .niv .tx{flex:1;min-width:0}#tvj .niv b{display:block;font:900 17px/1.05 'Baloo 2',system-ui,sans-serif}#tvj .niv small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#9ab8ff}
#tvj .niv span{display:block;font:700 11.5px/1.2 'Baloo 2',system-ui,sans-serif;color:#cfe0ff}
#tvj .niv .gn{flex:none;text-align:right;font:900 19px/1 'Baloo 2',system-ui,sans-serif;color:#ffcf4a}#tvj .niv .gn em{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#9ab8ff;margin-top:3px}
#tvj .tit{flex:none;text-align:center;font:900 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:3px;color:#ffcf4a;margin:4px 2px 0;display:flex;align-items:center;gap:8px}#tvj .tit:before,#tvj .tit:after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,#c9a24a,transparent)}
#tvj .lots{flex:none;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
#tvj .lot{background:linear-gradient(#12288a,#081450);border-radius:10px;padding:6px 4px 7px;text-align:center;position:relative;box-shadow:inset 0 0 0 1px rgba(201,162,74,.45)}
#tvj .lot canvas{width:58%;height:auto;image-rendering:pixelated;display:block;margin:0 auto}
#tvj .lot b{display:block;font:800 10px/1.1 'Baloo 2',system-ui,sans-serif;color:#fff;margin-top:2px}#tvj .lot span{display:block;font:700 9px/1.1 'Baloo 2',system-ui,sans-serif;color:#9ab8ff;margin-top:2px}
#tvj .lot.non canvas{filter:brightness(0) opacity(.45)}#tvj .lot.oui{box-shadow:inset 0 0 0 2px #ffcf4a,0 0 14px rgba(255,200,60,.35)}#tvj .lot.oui span{color:#ffcf4a}
#tvj .info{flex:none;background:linear-gradient(#12288a,#081450);border-radius:12px;padding:12px;text-align:center;font:800 15px/1.3 'Baloo 2',system-ui,sans-serif;color:#cfe0ff;box-shadow:inset 0 0 0 2px #c9a24a,0 0 22px rgba(60,110,255,.35)}
#tvj .info big{display:block;font:900 34px/1.1 'Baloo 2',system-ui,sans-serif;color:#ffcf4a;text-shadow:0 0 18px rgba(255,200,60,.5)}
#tvj .nouv{position:absolute;inset:0;z-index:12;background:rgba(4,8,30,.85);display:grid;place-items:center;padding:24px;animation:tvjF .3s}@keyframes tvjF{from{opacity:0}}
#tvj .nouv .c{width:min(320px,86vw);background:linear-gradient(#12288a,#081450);color:#fff;border-radius:16px;padding:18px;text-align:center;box-shadow:inset 0 0 0 2px #c9a24a,0 0 40px rgba(255,200,60,.3)}
#tvj .nouv .c small{font:900 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;color:#ffcf4a}#tvj .nouv .c h3{margin:2px 0 6px;font:900 24px/1.1 'Baloo 2',system-ui,sans-serif}
#tvj .nouv canvas{width:120px;height:auto;image-rendering:pixelated;animation:tvjT 2s ease-in-out infinite}@keyframes tvjT{50%{transform:translateY(-6px)}}
#tvj .nouv p{margin:4px 0 12px;font:700 14px/1.25 'Baloo 2',system-ui,sans-serif;color:#cfe0ff}
#tvj .nouv button{width:100%;border:0;border-radius:12px;padding:12px;background:linear-gradient(#ffe890,#f0b020 55%,#d08a00);color:#2a1600;font:900 16px 'Baloo 2',system-ui,sans-serif}`;

let RAC=null,SC=null,ETAT={C:null,cam:{x:0,z:1},focus:-1,focusJ:0,ecran:'',couronne:-1,confs:[]};
const persos=()=>[{nom:moiNom(),ap:moiAp(),coul:'#f2b030',pts:0,moi:true},{nom:'Gégé',ap:ap({peau:3,cheveux:0,coiffe:2,barbe:1,haut:4,veste:11}),coul:'#e8402a',pts:0},{nom:'Momo',ap:ap({peau:5,cheveux:0,coiffe:3,haut:1}),coul:'#2ab0a0',pts:0}];
const SPR={};
function dessinePerso(g,x,y,a){try{if(window.Perso&&Perso.sprite)Perso.sprite(g,x,y,a,'bas',0,false);}catch(x){}}
function sprite(k,a){if(SPR[k])return SPR[k];const c=document.createElement('canvas');c.width=40;c.height=66;const g=c.getContext('2d');g.imageSmoothingEnabled=false;dessinePerso(g,20,62,a);return SPR[k]=c;}
/* LE PLATEAU : dessiné à la résolution de l'écran (net), seuls les personnages restent en pixel art,
   agrandis d'un nombre entier de fois. Mur LED, projecteurs, pupitres, public au premier plan.
   La caméra s'approche du candidat qui buzze. */
const T=()=>performance.now()/1000;
function eclair(c,k){const n=parseInt(c.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return 'rgb('+f(r)+','+f(g)+','+f(b)+')';}
function arrondi(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function peindre(){if(!RAC||!SC)return;requestAnimationFrame(peindre);
 const dpr=Math.min(3,window.devicePixelRatio||1),bw=SC.clientWidth,bh=SC.clientHeight;if(!bw||!bh)return;
 if(SC.width!==Math.round(bw*dpr)||SC.height!==Math.round(bh*dpr)){SC.width=Math.round(bw*dpr);SC.height=Math.round(bh*dpr);}
 const g=SC.getContext('2d'),W=SC.width,H=SC.height,t=T(),s=W/400,Hv=H/s,yF=Hv-34;
 const C=ETAT.C||persos();
 /* la caméra */
 const PX=[148,238,328],fc=ETAT.focus>=0&&ETAT.focusJ>t?ETAT.focus:-1,cz=fc>=0?1.1:1,cx=fc>=0?Math.max(200/cz,Math.min(400-200/cz,PX[fc])):200;
 ETAT.cam.x+=(cx-ETAT.cam.x||0)*.08;ETAT.cam.z+=(cz-ETAT.cam.z)*.08;if(!ETAT.cam.x)ETAT.cam.x=200;
 g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=true;
 /* le fond du studio */
 const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1a3aa8');gr.addColorStop(.55,'#0c1c6a');gr.addColorStop(1,'#050a2a');g.fillStyle=gr;g.fillRect(0,0,W,H);
 const z=ETAT.cam.z;g.setTransform(s*z,0,0,s*z,W/2-ETAT.cam.x*s*z,H*(1-z)*.55);
 /* panneaux du décor, au fond */
 for(let i=0;i<9;i++){const x=-20+i*55;g.fillStyle=i%2?'rgba(120,170,255,.08)':'rgba(255,210,120,.04)';g.fillRect(x,0,40,yF-30);g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x+18,0,4,yF-30);}
 /* le mur LED */
 const lw=210,lh=Math.max(46,Math.min(92,yF-120)),lx=200-lw/2,ly=Math.max(26,(yF-120-lh)*.5+20);
 g.fillStyle='#05030f';arrondi(g,lx-6,ly-6,lw+12,lh+12,8);g.fill();
 for(let yy=0;yy<lh;yy+=4)for(let xx=0;xx<lw;xx+=4){const v=Math.sin(xx*.06+t*2.2)+Math.cos(yy*.09-t*1.6)+Math.sin((xx+yy)*.03+t);g.fillStyle=v>1.3?'rgba(255,200,60,.55)':v>.5?'rgba(80,140,255,.38)':'rgba(30,60,160,.25)';g.fillRect(lx+xx+.6,ly+yy+.6,2.6,2.6);}
 const ecr=ETAT.ecran||'LE GRAND MISTRAL';g.textAlign='center';g.textBaseline='middle';const fs=ecr.length>16?20:24;g.font='900 '+fs+'px "Baloo 2",system-ui,sans-serif';
 const tg=g.createLinearGradient(0,ly+lh/2-14,0,ly+lh/2+14);tg.addColorStop(0,'#fff6c0');tg.addColorStop(.6,'#ffc93a');tg.addColorStop(1,'#e88a10');
 g.lineWidth=5;g.strokeStyle='#3a1a00';g.strokeText(ecr,200,ly+lh/2-4);g.fillStyle=tg;g.fillText(ecr,200,ly+lh/2-4);
 g.font='800 8px "Baloo 2",system-ui,sans-serif';g.fillStyle='#c8b8ff';g.fillText('MISTRAL TV · EN PUBLIC À MARSEILLE',200,ly+lh-9);
 /* les ampoules qui courent autour du mur */
 const per=2*(lw+lh)+48,nb=Math.floor(per/9);for(let i=0;i<nb;i++){let d=i/nb*per,x,y;const w2=lw+12,h2=lh+12;
  if(d<w2){x=lx-6+d;y=ly-10;}else if((d-=w2)<h2){x=lx+lw+10;y=ly-6+d;}else if((d-=h2)<w2){x=lx+lw+6-d;y=ly+lh+10;}else{d-=w2;x=lx-10;y=ly+lh+6-d;}
  const on=((i+Math.floor(t*8))%4)===0;g.fillStyle=on?'#fff6c8':'#7a5a20';g.beginPath();g.arc(x,y,on?2.1:1.6,0,7);g.fill();if(on){g.fillStyle='rgba(255,230,140,.25)';g.beginPath();g.arc(x,y,5,0,7);g.fill();}}
 /* les projecteurs qui balaient */
 g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<4;i++){const ox=i<2?-10+i*30:410-(i-2)*30,a=Math.sin(t*.7+i*1.7)*.5,ex=200+Math.sin(a+i)*160,col=['120,170,255','255,220,140','150,200,255','255,230,170'][i];
  const lg=g.createLinearGradient(ox,0,ex,yF);lg.addColorStop(0,'rgba('+col+',.30)');lg.addColorStop(1,'rgba('+col+',0)');g.fillStyle=lg;g.beginPath();g.moveTo(ox-3,-4);g.lineTo(ox+3,-4);g.lineTo(ex+34,yF+10);g.lineTo(ex-34,yF+10);g.fill();}
 if(ETAT.appl>t){g.fillStyle='rgba(255,240,200,'+(.05+.04*Math.sin(t*20))+')';g.fillRect(-100,-100,600,yF+100);}
 g.restore();
 /* le plancher brillant */
 const pg=g.createLinearGradient(0,yF-26,0,Hv);pg.addColorStop(0,'#14288a');pg.addColorStop(1,'#060c34');g.fillStyle=pg;g.fillRect(-200,yF-26,800,Hv);
 g.strokeStyle='rgba(150,190,255,.14)';g.lineWidth=1;for(let i=-8;i<=8;i++){g.beginPath();g.moveTo(200+i*30,yF-26);g.lineTo(200+i*80,Hv);g.stroke();}
 g.fillStyle='rgba(255,210,74,.5)';g.fillRect(-200,yF-27,800,1.2);
 /* l'animatrice Nadia, sous son projecteur */
 const k=Math.max(1,Math.round(s*z*Math.min(1.55,Math.max(1.1,(Hv-60)/110))))/(s*z);   /* agrandissement entier en pixels d'écran */
 g.fillStyle='rgba(255,240,200,.10)';g.beginPath();g.ellipse(56,yF-6,30,8,0,0,7);g.fill();
 const sn=sprite('nadia',AP_NADIA);g.imageSmoothingEnabled=false;const sh=66*k,sw=40*k,bob=Math.sin(t*2)*.6;
 g.drawImage(sn,56-sw/2,yF-sh+4*k-6+bob,sw,sh);
 g.fillStyle='#c8c8d0';g.fillRect(64,yF-sh*.62,1.4,10);g.fillStyle='#2a2a30';g.beginPath();g.arc(64.7,yF-sh*.62-1,2,0,7);g.fill();
 /* les trois pupitres, avec les candidats derrière */
 C.forEach((p,i)=>{const x=PX[i],saut=p.saut&&p.saut>t?Math.abs(Math.sin((p.saut-t)*14))*4:0,trem=p.trem&&p.trem>t?Math.sin(t*60)*1.2:0,lit=p.buzz&&p.buzz>t;
  const sp=sprite('c'+i+(p.moi?'m':''),p.ap),pw=70,ph=50,py=yF-ph;
  /* le halo quand il buzze */
  if(lit){g.save();g.globalCompositeOperation='lighter';const hg=g.createRadialGradient(x,py-20,4,x,py-20,60);hg.addColorStop(0,'rgba(255,240,150,.55)');hg.addColorStop(1,'rgba(255,240,150,0)');g.fillStyle=hg;g.fillRect(x-70,py-90,140,130);g.restore();}
  g.imageSmoothingEnabled=false;g.drawImage(sp,x-sw/2+trem,py-sh+24*k-saut,sw,sh);g.imageSmoothingEnabled=true;
  /* la couronne du vainqueur */
  if(ETAT.couronne===i){const cy=py-sh+24*k-saut+8*k-10,cw=16;g.fillStyle='#ffd24a';g.beginPath();g.moveTo(x-cw/2,cy);g.lineTo(x-cw/2,cy-8);g.lineTo(x-cw/4,cy-4);g.lineTo(x,cy-11);g.lineTo(x+cw/4,cy-4);g.lineTo(x+cw/2,cy-8);g.lineTo(x+cw/2,cy);g.closePath();g.fill();g.strokeStyle='#8a5a00';g.lineWidth=1;g.stroke();}
  /* le pupitre : un trapèze laqué à la couleur du candidat */
  const pc=p.coul;const lg=g.createLinearGradient(0,py,0,yF);lg.addColorStop(0,eclair(pc,.25));lg.addColorStop(1,eclair(pc,-.35));
  g.fillStyle=lg;g.beginPath();g.moveTo(x-pw/2,py+6);g.lineTo(x+pw/2,py+6);g.lineTo(x+pw/2-5,yF);g.lineTo(x-pw/2+5,yF);g.closePath();g.fill();
  g.fillStyle=eclair(pc,.55);arrondi(g,x-pw/2-3,py,pw+6,8,3);g.fill();g.fillStyle=lit?'#fff6b0':'rgba(255,255,255,.35)';g.fillRect(x-pw/2,py+1,pw,1.5);
  /* l'afficheur du score */
  g.fillStyle='#07040f';arrondi(g,x-23,py+12,46,20,4);g.fill();g.fillStyle=lit?'#ffffff':'#ffd24a';g.font='900 15px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.shadowColor='rgba(255,200,60,.8)';g.shadowBlur=6;g.fillText(String(p.pts),x,py+23);g.shadowBlur=0;
  g.fillStyle='#fff';g.font='800 8.5px "Baloo 2",system-ui,sans-serif';g.fillText(p.nom.toUpperCase(),x,py+41);
  /* la lampe du buzzer */
  g.fillStyle=lit?'#ff5a3a':'#5a1a14';g.beginPath();g.arc(x+pw/2-7,py+4,3,0,7);g.fill();});
 /* le public, au premier plan */
 const ex=ETAT.appl>t;g.fillStyle='rgba(6,4,16,.9)';g.fillRect(-200,Hv-14,800,20);
 for(let i=0;i<26;i++){const x=-4+i*16.4+(i%2?4:0),h=ex?Math.abs(Math.sin(t*11+i*1.7))*3:Math.abs(Math.sin(t*1.4+i))*.6,y=Hv-12-h;
  g.fillStyle='#0a0618';g.beginPath();g.ellipse(x,y+10,8,8,0,Math.PI,0);g.fill();g.beginPath();g.arc(x,y,5.2,0,7);g.fill();
  if(ex&&i%3===0){const up=Math.sin(t*13+i)>0;g.fillStyle='#0a0618';g.fillRect(x-8,y-(up?10:6),2.4,9);g.fillRect(x+6,y-(up?6:10),2.4,9);}
  if((i*7+Math.floor(t*1.3))%23===0){g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x+4,y-6,1.6,0,7);g.fill();}}
 /* les confettis du plateau */
 if(ETAT.confs.length){for(const c of ETAT.confs){c.y+=c.vy;c.x+=Math.sin(t*3+c.r)*.4;c.r+=.1;g.fillStyle=c.c;g.save();g.translate(c.x,c.y);g.rotate(c.r);g.fillRect(-1.5,-2.5,3,5);g.restore();}ETAT.confs=ETAT.confs.filter(c=>c.y<Hv+6);}}
function confettisPlateau(n){for(let i=0;i<(n||80);i++)ETAT.confs.push({x:Math.random()*400,y:-Math.random()*80,vy:.8+Math.random()*1.2,r:Math.random()*6,c:ALEA(['#ffd24a','#e8302a','#3a9ad8','#5ad07a','#e86aa0','#fff'])});}
function camera(i,ms){ETAT.focus=i;ETAT.focusJ=T()+(ms||1600)/1000;}

function dire(t,qui){const b=RAC.querySelector('.bul');b.querySelector('.qui').textContent=(qui||'NADIA').toUpperCase();b.querySelector('p').innerHTML=t;
  const cv=b.querySelector('canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);
  const C=ETAT.C||persos();const a=qui==='Gégé'?C[1].ap:qui==='Momo'?C[2].ap:AP_NADIA;g.drawImage(sprite('p'+(qui||'n'),a),9,9,22,22,1,1,88,88);}
function zone(h,haut){const z=RAC.querySelector('.zone');z.innerHTML=h||'';z.classList.toggle('haut',!!haut);z.scrollTop=0;return z;}
function panneau(t,ms){ETAT.appl=T()+(ms||1800)/1000;const p=RAC.querySelector('.pan');p.textContent=t;p.classList.add('on');clearTimeout(panneau.t);panneau.t=setTimeout(()=>p.classList.remove('on'),ms||1800);}
function pop(t,c){const d=document.createElement('div');d.className='pop';d.textContent=t;if(c)d.style.color=c;RAC.querySelector('.scene').appendChild(d);setTimeout(()=>d.remove(),1400);}
function confettis(n){confettisPlateau(n);for(let i=0;i<(n||60)*.6;i++){const d=document.createElement('i');d.className='conf';d.style.left=Math.random()*100+'%';d.style.background=ALEA(['#ffd24a','#e8302a','#3a9ad8','#5ad07a','#e86aa0','#fff']);
  d.style.animationDuration=(1.6+Math.random()*1.8)+'s';d.style.animationDelay=Math.random()*.6+'s';RAC.appendChild(d);setTimeout(()=>d.remove(),4200);}}
function scores(pts){if(!pts)return;const C=ETAT.C;pts.forEach((v,i)=>{const d=v-C[i].pts;if(d>0){C[i].saut=T()+.7;C[i].buzz=T()+1;}else if(d<0){C[i].trem=T()+.6;}C[i].pts=v;});}
function joie(d){SON.bon();setTimeout(()=>SON.applaudir(1.6),150);panneau('APPLAUDISSEZ');if(d)pop('+'+d);}
function oh(d){SON.faux();panneau('OHHH…',1400);if(d)pop('−'+d,'#ff7a6a');}
const attendreClic=(sel)=>new Promise(ok=>{RAC.querySelectorAll(sel).forEach((b,i)=>b.onclick=()=>{vib(8);ac();ok(i);});});
async function erreur(t){dire('« Coupez ! Petit souci technique : '+t+' »');zone('<button class="gros">Retour au studio</button>');await attendreClic('.gros');accueil();}

/* ---------- MANCHE 1 : LE BUZZER ---------- */
async function mancheBuzzer(D){RAC.querySelector('.man').textContent='MANCHE 1 · LE BUZZER';ETAT.ecran='LE BUZZER';
  if(!D.questions.some(q=>q.fait)){dire('« Manche 1 : <b>le buzzer</b> ! Le premier qui répond juste prend <b>10 points</b>. Une erreur, et c’est moins 5 ! »');
    zone('<button class="gros">Je suis prêt !</button>');await attendreClic('.gros');}
  const DUREE=[0,9000,8000,7000][D.niveau];
  for(let n=0;n<5;n++){const Q=D.questions[n];if(Q.fait)continue;if(!RAC)return false;
    dire('<span style="opacity:.6">Question '+(n+1)+'/5</span><br>'+Q.q);SON.tic();ETAT.ecran='QUESTION '+(n+1)+' / 5';
    const z=zone('<div class="chrono"><div class="br"><i></i></div><b></b></div>'+Q.r.map((r,i)=>'<button class="rep"><i>'+'ABC'[i]+'</i>'+r+'</button>').join(''));
    const barre=z.querySelector('.chrono i'),bt=[...z.querySelectorAll('.rep')];
    const chrono=(ms,fin)=>{const t0=performance.now();let ds=-1;const it=setInterval(()=>{const r=Math.max(0,ms-(performance.now()-t0)),k=r/ms;const b=z.querySelector('.chrono'),n=z.querySelector('.chrono b');if(b)b.style.setProperty('--k',k);
      const sec=Math.ceil(r/1000);if(n&&sec!==ds){ds=sec;n.textContent=sec;if(sec<=3&&sec>0)SON.tic();}if(k<=0){clearInterval(it);fin();}},50);return it;};
    /* qui buzze en premier : toi, le candidat prévu par le serveur, ou personne */
    const ev=await new Promise(fin=>{let fait=false;const f=v=>{if(fait)return;fait=true;clearInterval(it);clearTimeout(npc);fin(v);};
      const it=chrono(DUREE,()=>f({qui:-1}));
      const npc=(Q.npc.qui>0&&!Q.npcfait)?setTimeout(()=>f({qui:Q.npc.qui}),Math.min(Q.npc.apres,DUREE-300)):0;
      bt.forEach((b,i)=>b.onclick=()=>{vib(10);ac();f({qui:0,i});});});
    let exclu=-1;
    if(ev.qui>0){const p=ETAT.C[ev.qui];SON.buzz();p.buzz=T()+1.2;camera(ev.qui,3200);
      const r=await rpc('tv_repondre',{p_partie:D.partie,p_n:n,p_choix:-1,p_qui:ev.qui});if(r.erreur&&!r.deja)return erreur(r.erreur),false;
      const L='ABC'[r.choix!=null?r.choix:0];
      dire(ev.qui===1?'« '+ALEA(['C’est la '+L+', évidemment !','La '+L+' ! Et je conteste d’avance.',L+' ! Mon cousin me l’a dit.'])+' »':'« '+ALEA(['La '+L+', frérot, trop facile !',L+' ! J’suis chaud ce soir !','Euh… la '+L+' ? Oui, la '+L+' !'])+' »',p.nom);
      await pause(1200);
      if(r.juste){bt[r.ok].classList.add('bon');bt.forEach((b,i)=>{if(i!==r.ok)b.classList.add('off');});scores(r.pts);SON.bon();SON.applaudir(1.2);panneau('APPLAUDISSEZ');pop('+10');
        dire(ev.qui===1?'« Bonne réponse pour Gégé… »<br><i>Gégé : « Évidemment. »</i>':'« Bonne réponse pour Momo ! »<br><i>Momo : « Je suis un génie, wesh. »</i>');await pause(2400);continue;}
      exclu=r.choix;bt[exclu].classList.add('faux');scores(r.pts);oh(0);
      dire(ev.qui===1?'« Faux, Gégé ! »<br><i>Gégé : « C’est truqué ! J’exige un recomptage ! »</i>':'« Faux, Momo ! »<br><i>Momo : « Ah non ? J’étais sûr à 200 %… »</i>');
      await pause(1600);dire('« Il reste une chance ! <b>À toi !</b> »');
      const i2=await new Promise(fin=>{let fait=false;const f=v=>{if(fait)return;fait=true;clearInterval(it);fin(v);};const it=chrono(5000,()=>f(-1));
        bt.forEach((b,i)=>b.onclick=()=>{if(i===exclu)return;vib(10);f(i);});});
      if(i2>=0){SON.buzz();bt[i2].classList.add('att');}
      const r2=await rpc('tv_repondre',{p_partie:D.partie,p_n:n,p_choix:i2,p_qui:0});if(r2.erreur)return erreur(r2.erreur),false;
      bt[i2>=0?i2:0].classList.remove('att');bt[r2.ok].classList.add('bon');
      if(i2<0){dire('« Trop tard ! C’était <b>'+Q.r[r2.ok]+'</b>. »');SON.faux();}
      else if(r2.juste){scores(r2.pts);joie(10);dire('« QUEL RATTRAPAGE ! Dix points ! »');}
      else{bt[i2].classList.add('faux');scores(r2.pts);oh(5);dire('« Oh non… c’était <b>'+Q.r[r2.ok]+'</b> ! »');}
      await pause(2400);continue;}
    if(ev.qui===0){SON.buzz();ETAT.C[0].buzz=T()+1.2;camera(0,2200);bt[ev.i].classList.add('att');}
    const r=await rpc('tv_repondre',{p_partie:D.partie,p_n:n,p_choix:ev.qui===0?ev.i:-1,p_qui:0});if(r.erreur)return erreur(r.erreur),false;
    if(ev.qui===0)bt[ev.i].classList.remove('att');
    bt[r.ok].classList.add('bon');
    if(ev.qui<0){dire('« Temps écoulé ! La réponse était <b>'+Q.r[r.ok]+'</b>. »');SON.faux();}
    else if(r.juste){bt.forEach((b,i)=>{if(i!==r.ok)b.classList.add('off');});scores(r.pts);joie(10);dire('« '+ALEA(['BRAVO ! Dix points !','Mais quel talent !','Exactement ! Le public est en feu !'])+' »');}
    else{bt[ev.i].classList.add('faux');scores(r.pts);oh(5);dire('« '+ALEA(['Aïe… c’était <b>'+Q.r[r.ok]+'</b>.','Non ! Mais quelle confiance, j’adore.','Raté ! Le public est mort de rire.'])+' »');}
    await pause(2400);}
  return true;}

/* ---------- MANCHE 2 : LE JUSTE PRIX DU PORT ---------- */
async function mancheJustePrix(D){zone('');RAC.querySelector('.man').textContent='MANCHE 2 · LE JUSTE PRIX';ETAT.ecran='LE JUSTE PRIX';const P=D.prix;let lo=1,hi=P.max;
  if(!P.essais){dire('« Manche 2 : <b>le juste prix du port</b> ! '+P.essais_max+' essais. Plus tu trouves vite, plus tu gagnes ! »');await pause(2200);SON.roulement(1.2);await pause(1200);SON.fanfare();}
  dire('« Combien coûte… <b>'+P.obj+'</b> ? Entre 1 et '+P.max+' euros ! »');
  let val='',ess=P.essais||0,occupe=false;
  const z=zone('<div class="prix"><div class="obj">'+P.obj+'</div><div class="val">—</div><div class="four"><div class="ok"></div><span class="a" style="left:0">1 €</span><span class="b" style="right:0">'+P.max+' €</span></div><div class="ess">Essai '+(ess+1)+' sur '+P.essais_max+'</div></div><div class="pav">'+
    [1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>'<button'+(k==='OK'?' class="ok"':'')+'>'+k+'</button>').join('')+'</div>');
  const V=z.querySelector('.val'),E=z.querySelector('.ess');
  /* la fourchette : chaque « plus » ou « moins » resserre la zone possible */
  const four=()=>{const F=z.querySelector('.four .ok');F.style.left=((lo-1)/P.max*100)+'%';F.style.right=((P.max-hi)/P.max*100)+'%';z.querySelector('.four .a').textContent=lo+' €';z.querySelector('.four .b').textContent=hi+' €';};four();
  const fin=await new Promise(done=>{z.querySelectorAll('.pav button').forEach(bt=>bt.onclick=async()=>{if(occupe)return;const k=bt.textContent;vib(6);SON.tic();ac();
    if(k==='⌫'){val=val.slice(0,-1);}else if(k==='OK'){if(!val)return;const v=+val;occupe=true;
      const r=await rpc('tv_prix',{p_partie:D.partie,p_valeur:v});occupe=false;if(r.erreur){done({erreur:r.erreur});return;}ess=r.essais;
      if(r.res==='ok'){done(r);return;}
      if(r.res==='plus'){lo=Math.max(lo,v+1);four();SON.plus();dire('« '+ALEA(['C’est PLUS !','Plus ! Plus !','C’est plus, voyons !'])+' »');pop('PLUS ↑','#5ad07a');}
      else{hi=Math.min(hi,v-1);four();SON.moins();dire('« '+ALEA(['C’est MOINS !','Moins ! On n’est pas à Monaco !','Moins, moins !'])+' »');pop('MOINS ↓','#ff7a6a');}
      if(r.fini){done(r);return;}E.textContent='Essai '+(ess+1)+' sur '+P.essais_max+(ess===P.essais_max-1?' · dernier essai !':'');val='';}
    else if(val.length<3){val=(val+k).replace(/^0+/,'');}
    V.textContent=val||'—';});});
  if(fin.erreur)return erreur(fin.erreur),false;
  V.textContent=fin.prix+' €';const avant=ETAT.C.map(c=>c.pts);scores(fin.pts);
  if(fin.res==='ok'){camera(0,2600);joie(fin.gain);confettis(40);dire('« LE JUSTE PRIX ! '+fin.prix+' euros ! En '+fin.essais+' essai'+(fin.essais>1?'s':'')+' : <b>+'+fin.gain+' points</b> ! »');}
  else{oh(0);dire('« Perdu ! C’était <b>'+fin.prix+' euros</b>. »<br><i>Gégé : « Moi j’aurais dit trois euros. Et encore, c’est cher. »</i>');}
  await pause(2600);const g=fin.pts[1]-avant[1],m=fin.pts[2]-avant[2];
  dire('« Pendant ce temps, en coulisses : Gégé '+(g?'prend <b>+'+g+'</b>':'ne prend <b>rien</b>, il conteste encore')+', Momo '+(m?'prend <b>+'+m+'</b>':'ne prend <b>rien</b>')+'. »');
  zone('<button class="gros">Place à la finale !</button>');await attendreClic('.gros');return true;}

/* ---------- FINALE : LA ROUE DU MISTRAL ---------- */
const ROUE=[['+50','#f2b030',s=>s+50,'Cinquante points !'],['PIGEON','#8a94a8',s=>s-10,'Un pigeon ! Moins dix…'],['×2','#e8302a',s=>s*2,'DOUBLE ! Le public est debout !'],['+20','#3a9ad8',s=>s+20,'Vingt points !'],
  ['MISTRAL','#2a3a5a',s=>Math.round(s/2),'Le mistral emporte la moitié des points !'],['+30','#4ab070',s=>s+30,'Trente points !'],['BISE','#e86aa0',s=>s+15,'Une bise de Nadia : plus quinze !'],['+100','#f6e27a',s=>s+100,'CENT POINTS ! LE JACKPOT !']];
function roueDessin(cv,ang){const g=cv.getContext('2d'),S0=cv.width,n=ROUE.length;g.setTransform(S0/500,0,0,S0/500,0,0);const S=500,c=S/2,r=c-14;g.clearRect(0,0,S,S);
  g.fillStyle='#ffd24a';g.beginPath();g.arc(c,c,r+8,0,7);g.fill();
  const t=performance.now()/180;for(let i=0;i<24;i++){const a=i/24*6.283;g.fillStyle=(i+(t|0))%2?'#fff6c8':'#a86a10';g.beginPath();g.arc(c+Math.cos(a)*(r+4),c+Math.sin(a)*(r+4),3.2,0,7);g.fill();}
  ROUE.forEach(([l,col],i)=>{const a0=ang+i/n*6.283-1.5708-3.1416/n,a1=a0+6.283/n;g.fillStyle=col;g.beginPath();g.moveTo(c,c);g.arc(c,c,r,a0,a1);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.stroke();g.save();g.translate(c,c);g.rotate((a0+a1)/2);g.fillStyle=(col==='#f6e27a'||col==='#f2b030')?'#3a2000':'#fff';
    g.font='900 '+(l.length>4?24:32)+'px "Baloo 2",system-ui,sans-serif';g.textAlign='right';g.textBaseline='middle';g.fillText(l,r-10,1);g.restore();});
  g.fillStyle='#1a1048';g.beginPath();g.arc(c,c,22,0,7);g.fill();g.fillStyle='#ffd24a';g.font='900 18px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.fillText('★',c,c+1);
  g.fillStyle='#fff';g.strokeStyle='#1a1048';g.lineWidth=3;g.beginPath();g.moveTo(c-13,4);g.lineTo(c+13,4);g.lineTo(c,28);g.closePath();g.stroke();g.fill();}
function tourner(cv,cible){return new Promise(ok=>{const n=ROUE.length,depart=cv._a||0,fin=Math.ceil(depart/6.283+3)*6.283+5*6.283-cible/n*6.283;const D=4200,t0=performance.now();let dernier=-1;
  (function f(){const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,4),a=depart+(fin-depart)*e;cv._a=a;roueDessin(cv,a);
    const s=Math.floor((a/6.283*n)+.5);if(s!==dernier){dernier=s;SON.tic();}if(k<1)requestAnimationFrame(f);else ok();})();});}
async function finale(D){zone('');RAC.querySelector('.man').textContent='FINALE · LA ROUE DU MISTRAL';ETAT.ecran='LA ROUE';const C=ETAT.C;
  dire('« LA FINALE ! Chacun fait tourner <b>la roue du Mistral</b>. Jackpot, double… ou le mistral qui emporte tout ! »');
  const z=zone('<div class="rw"><canvas class="roue"></canvas><div class="gl">Lance-la d’un grand geste, ou avec le bouton</div></div><button class="gros">Lancer la roue !</button>');
  const cv=z.querySelector('.roue'),rw=z.querySelector('.rw');
  /* la roue prend toute la place disponible, sans jamais déborder */
  const taille=()=>{const d=Math.max(150,Math.min(rw.clientWidth-8,rw.clientHeight-26,420));const dpr=Math.min(3,window.devicePixelRatio||1);cv.style.width=d+'px';cv.style.height=d+'px';cv.width=cv.height=Math.round(d*dpr);};taille();
  cv._a=0;let vit=true;(function anim(){if(!vit||!RAC)return;cv._a+=.004;roueDessin(cv,cv._a);requestAnimationFrame(anim);})();
  const lance=await new Promise(ok=>{let y0=null,t0=0;const b=z.querySelector('.gros');b.onclick=()=>{vib(8);ac();ok(1);};
    cv.addEventListener('pointerdown',e=>{y0=[e.clientX,e.clientY];t0=performance.now();});
    cv.addEventListener('pointerup',e=>{if(!y0)return;const d=Math.hypot(e.clientX-y0[0],e.clientY-y0[1]),dt=performance.now()-t0;y0=null;if(d>40&&dt<600){vib(12);ac();ok(1);}});});
  const btn=z.querySelector('.gros');btn.disabled=true;btn.textContent='La roue tourne…';vit=false;z.querySelector('.gl').textContent='';
  const r=await rpc('tv_roue',{p_partie:D.partie});if(r.erreur)return erreur(r.erreur),false;
  for(const k of [0,1,2]){const p=C[k];camera(k,5600);if(k>0){dire('« À '+p.nom+' de tourner ! »');btn.textContent=p.nom+' lance la roue…';await pause(1100);}else btn.textContent='Ta roue tourne…';
    const s=r.segs[k];await tourner(cv,s);const [l,,f,txt]=ROUE[s];const av=p.pts;const nv=Math.max(0,f(av));const d=nv-av;p.pts=nv;
    if(d>0){p.saut=T()+.7;p.buzz=T()+1;pop(l==='×2'?'×2 !':'+'+d);SON.bon();SON.applaudir(1.5);panneau('APPLAUDISSEZ');}
    else if(d<0){p.trem=T()+.7;SON.faux();panneau('OHHH…',1400);pop((l==='MISTRAL'?'🌬️ ':'')+'−'+(-d),'#ff7a6a');}
    dire('« '+txt+' »'+(k===1&&d<0?'<br><i>Gégé : « C’est la roue qui est truquée ! »</i>':k===2&&d>0?'<br><i>Momo : « J’vous l’avais dit, j’suis béni ! »</i>':''));
    await pause(2500);}
  scores(r.pts);return r;}

/* ---------- LE RÉSULTAT ---------- */
function lotCanvas(id,w){const L=LOTS[id];const c=document.createElement('canvas');c.width=40;c.height=50;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  dessinePerso(g,20,48,Object.assign({},moiAp(),L.ap,{_pnj:true}));if(w)c.style.width=w;return c;}
async function montrerLot(id){return new Promise(ok=>{const L=LOTS[id];const d=document.createElement('div');d.className='nouv';
  d.innerHTML='<div class="c"><small>LOT EXCLUSIF DÉBLOQUÉ</small><h3>'+L.nom+'</h3><div class="pc"></div><p>Il t’attend dans ton <b>vestiaire</b>. Personne ne peut l’acheter : il se gagne ici.</p><button>Trop classe !</button></div>';
  d.querySelector('.pc').appendChild(lotCanvas(id));RAC.appendChild(d);SON.fanfare();confettis(50);d.querySelector('button').onclick=()=>{vib(8);d.remove();ok();};});}
async function resultat(r){const C=ETAT.C,moi=C[0];
  RAC.querySelector('.man').textContent='RÉSULTATS';ETAT.ecran='ET LE GAGNANT EST…';zone('');SON.roulement(1.4);dire('« Et le grand gagnant du <b>Grand Mistral</b> est… »');await pause(1600);
  {const gi=r.rang===1?0:C.indexOf(C.slice(1).sort((a,b)=>b.pts-a.pts)[0]);ETAT.couronne=gi;camera(gi,4200);ETAT.ecran=C[gi].nom.toUpperCase()+' GAGNE !';}
  if(r.rang===1){SON.fanfare();setTimeout(()=>SON.applaudir(3),300);confettis(90);moi.saut=T()+2.5;panneau('APPLAUDISSEZ',3000);
    dire('« <b>'+moi.nom.toUpperCase()+'</b> !!! Avec '+moi.pts+' points ! Le public est debout, Gégé conteste déjà ! »');}
  else{const g=C.slice(1).sort((a,b)=>b.pts-a.pts)[0];g.saut=T()+2;SON.applaudir(2);
    dire('« <b>'+g.nom.toUpperCase()+'</b> l’emporte ! '+(g.nom==='Gégé'?'Il ne conteste plus, bizarrement.':'Momo danse sur son pupitre.')+' Tu finis '+(r.rang===2?'deuxième':'troisième')+' avec '+moi.pts+' points. »');}
  try{if(typeof r.solde==='number'){const s=lireSave();s.euros=r.solde;localStorage.setItem('bdl.pix.v2',JSON.stringify(s));}}catch(x){}
  try{if(r.rang===1)localStorage.setItem('quai_une',JSON.stringify({titre:'« Un docker remporte Le Grand Mistral avec '+moi.pts+' points ! »',quand:Date.now()}));}catch(x){}
  await pause(2200);
  zone('<div class="info">Tu repars avec<big>+'+euros(r.gain)+'</big>'+(r.rang===1?'Victoire n°'+r.victoires+' au Grand Mistral':'Il y a toujours demain !')+'</div><button class="gros">Super !</button>');
  await attendreClic('.gros');
  for(const id of (r.objets||[]))if(LOTS[id])await montrerLot(id);
  RAC.classList.remove('direct');ETAT.couronne=-1;accueil();}

/* ---------- LE STUDIO, AVANT L'ÉMISSION ---------- */
function compte(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h+' h '+String(m).padStart(2,'0');}
async function accueil(){ETAT.C=persos();RAC.querySelector('.man').textContent='';RAC.classList.remove('direct');RAC.classList.add('acc');ETAT.ecran='';
  dire('« Bienvenue au studio ! Une émission par jour, choisis ton niveau. Plus c’est dur, plus ça rapporte ! »');
  zone('<div class="info">Ouverture du studio…</div>',true);
  const E=await rpc('tv_etat',{});
  if(E.erreur||E.connecte===false){dire('« Il faut être connecté pour monter sur le plateau ! »');zone('<div class="info">Connecte-toi dans le jeu, puis reviens au studio.</div><button class="gros b2" data-q>Retour à la place</button>');RAC.querySelector('[data-q]').onclick=quitter;return;}
  const lots='<div class="tit">LOTS EXCLUSIFS · '+(E.victoires||0)+' victoire'+((E.victoires||0)>1?'s':'')+'</div><div class="lots">'+Object.keys(LOTS).map(id=>{const a=(E.objets||[]).includes(id);
    return '<div class="lot '+(a?'oui':'non')+'" data-l="'+id+'"><b>'+LOTS[id].nom+'</b><span>'+(a?'Gagné ✓':LOTS[id].cond)+'</span></div>';}).join('')+'</div>';
  const A=E.aujourdhui;let h='';
  if(A&&A.fini){dire(A.rang===1?'« Notre champion du jour ! Reviens demain défendre ton titre. »':'« Belle émission ! Prochaine émission demain, on t’attend. »');
    h='<div class="info">Prochaine émission dans<big>'+compte(E.prochain||0)+'</big>Aujourd’hui : '+(A.rang===1?'1er':A.rang===2?'2e':'3e')+' · +'+euros(A.gain)+'</div>'+lots+'<button class="gros b2" data-q>Retour à la place</button>';}
  else if(A){h='<div class="info">Ton émission est en cours<br>('+NIV[A.niveau].nom+')</div><button class="gros" data-n="'+A.niveau+'">Reprendre l’émission</button>'+lots+'<button class="gros b2" data-q>Retour à la place</button>';}
  else{h='<div class="tit">CHOISIS TON NIVEAU</div>'+[1,2,3].map(n=>{const N=NIV[n];return '<button class="niv" data-n="'+n+'"><span class="pt" style="background:'+N.coul+'"></span><div class="tx"><small>'+N.k+'</small><b>'+N.nom+'</b><span>'+N.dit+'</span></div><div class="gn">'+euros(N.gains[0])+'<em>2e '+euros(N.gains[1])+' · 3e '+euros(N.gains[2])+'</em></div></button>';}).join('')+
    lots;}
  const z=zone(h,true);
  z.querySelectorAll('.lot').forEach(d=>d.insertBefore(lotCanvas(d.dataset.l),d.firstChild));
  z.querySelectorAll('[data-q]').forEach(b=>b.onclick=quitter);
  z.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{vib(8);ac();emission(+b.dataset.n);});}

async function emission(n){RAC.classList.remove('acc');zone('<div class="info">Antenne dans 3, 2, 1…</div>');
  const D=await rpc('tv_debut',{p_niveau:n});if(D.erreur)return erreur(D.erreur);
  ETAT.C=persos();scores(D.pts);RAC.classList.add('direct');
  if(!D.questions.some(q=>q.fait)){SON.jingle();setTimeout(()=>SON.applaudir(2.2),500);panneau('APPLAUDISSEZ',2200);
    dire('« Bonsoir, bonsoir ! Bienvenue dans <b>LE GRAND MISTRAL</b> ! Niveau <b>'+NIV[D.niveau].nom+'</b>. Ce soir : '+ETAT.C[0].nom+', Gégé… et Momo ! »');
    zone('<button class="gros">C’est parti !</button>');await attendreClic('.gros');}
  else dire('« Et nous revoilà ! On reprend là où on s’était arrêtés. »');
  if(!D.prix.fini&&!(await mancheBuzzer(D)))return;
  if(!D.prix.fini&&!(await mancheJustePrix(D)))return;
  const r=await finale(D);if(!r)return;await resultat(r);}

function quitter(){vib(8);document.body.style.transition='opacity .35s';document.body.style.opacity='0';setTimeout(()=>{location.href='spawn.html?t='+Date.now();},350);}
function demarrer(){const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
  const d=document.createElement('div');d.id='tvj';RAC=d;
  d.innerHTML='<div class="bar"><div class="logo">LE GRAND MISTRAL<small>MISTRAL TV · STUDIO 1</small></div><span class="dir">DIRECT</span><span class="sp"></span><button class="x">Quitter</button></div>'+
    '<div class="scene"><canvas class="sc"></canvas><div class="man"></div><div class="pan">APPLAUDISSEZ</div></div><div class="bul"><canvas width="90" height="90"></canvas><div><span class="qui">NADIA</span><p></p></div></div><div class="zone"></div>';
  document.body.appendChild(d);SC=d.querySelector('canvas.sc');
  d.querySelector('.x').onclick=quitter;
  ETAT.C=persos();peindre();accueil();supa();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',demarrer);else demarrer();
})();
