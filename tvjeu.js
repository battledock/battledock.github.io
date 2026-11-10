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
const CSS=`html,body{margin:0;height:100%;background:#120d2a;overscroll-behavior:none}
#tvj{position:fixed;inset:0;display:flex;flex-direction:column;background:#120d2a;color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
#tvj *{box-sizing:border-box}
#tvj .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 6px}
#tvj .logo{font:900 17px/1 'Baloo 2',system-ui,sans-serif;letter-spacing:.5px;color:#ffd24a;text-shadow:0 2px 0 #6a3a00}
#tvj .logo small{display:block;font:800 9px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#b8a8ff;text-shadow:none}
#tvj .dir{background:#e8302a;border-radius:6px;padding:2px 7px;font:900 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;animation:tvjB 1s steps(2) infinite;visibility:hidden}@keyframes tvjB{50%{opacity:.35}}
#tvj.direct .dir{visibility:visible}
#tvj .sp{flex:1}#tvj .x{height:38px;padding:0 14px;border-radius:19px;border:0;background:rgba(255,255,255,.12);color:#fff;font:800 13px 'Baloo 2',system-ui,sans-serif}
#tvj .man{flex:none;text-align:center;font:900 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;color:#ffd24a;height:16px}
#tvj canvas.sc{flex:none;width:100%;height:auto;display:block;image-rendering:pixelated}
#tvj .pan{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%) scale(.6);padding:3px 12px;border-radius:8px;background:#3a0a0a;color:#5a1a1a;font:900 13px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;border:2px solid #5a1a1a;transition:all .15s;opacity:0;pointer-events:none}
#tvj .pan.on{opacity:1;transform:translateX(-50%) scale(1);background:#e8302a;color:#fff;border-color:#ffb0a0;box-shadow:0 0 24px #ff4030}
#tvj .bul{flex:none;display:flex;gap:10px;align-items:flex-start;margin:4px 12px 0;padding:10px 12px;background:#f6f1e6;color:#2a2016;border-radius:18px;box-shadow:0 4px 0 #b8a890;min-height:62px}
#tvj .bul canvas{flex:none;width:44px;height:44px;border-radius:12px;background:#e8d8f8;image-rendering:pixelated}
#tvj .bul .qui{display:block;font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.5px;color:#8a5ad8}
#tvj .bul p{margin:0;font:800 16px/1.2 'Baloo 2',system-ui,sans-serif}#tvj .bul p b{color:#6a3ad8}#tvj .bul p i{font-style:normal;color:#8a7a5a;font-size:14px}
#tvj .zone{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:9px;padding:10px 14px calc(14px + env(safe-area-inset-bottom));min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
#tvj .zone.haut{justify-content:flex-start}
#tvj .rep{border:0;border-radius:16px;padding:13px 14px;text-align:left;font:800 16px/1.15 'Baloo 2',system-ui,sans-serif;color:#1a1440;background:#fff;box-shadow:0 4px 0 #8a7ad8;display:flex;align-items:center;gap:10px;transition:transform .1s,background .2s}
#tvj .rep i{flex:none;width:28px;height:28px;border-radius:9px;background:#6a4ad8;color:#fff;font:900 15px/28px 'Baloo 2',system-ui,sans-serif;text-align:center;font-style:normal}
#tvj .rep:active{transform:translateY(3px);box-shadow:0 1px 0 #8a7ad8}
#tvj .rep.bon{background:#5ad07a;box-shadow:0 4px 0 #2a8a4a}#tvj .rep.faux{background:#ff7a6a;box-shadow:0 4px 0 #b83a2a}#tvj .rep.off{opacity:.45}#tvj .rep.att{background:#ffe68a}
#tvj .chrono{flex:none;height:8px;border-radius:4px;background:rgba(255,255,255,.15);overflow:hidden}#tvj .chrono i{display:block;height:100%;background:linear-gradient(90deg,#ffd24a,#ff6a3a);transform-origin:left}
#tvj .gros{flex:none;border:0;border-radius:20px;padding:15px;font:900 19px 'Baloo 2',system-ui,sans-serif;color:#1a1440;background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 5px 0 #a86a10}
#tvj .gros:active{transform:translateY(3px);box-shadow:0 2px 0 #a86a10}#tvj .gros.b2{background:#fff;box-shadow:0 5px 0 #8a7ad8}#tvj .gros:disabled{opacity:.5}
#tvj .prix{flex:none;background:#1e1648;border-radius:18px;padding:10px;text-align:center}
#tvj .prix .obj{font:800 15px/1.2 'Baloo 2',system-ui,sans-serif;color:#d8ccff}
#tvj .prix .val{font:900 44px/1.05 'Baloo 2',system-ui,sans-serif;color:#ffd24a;letter-spacing:1px}
#tvj .prix .ess{font:800 12px 'Baloo 2',system-ui,sans-serif;color:#9a8ad8}
#tvj .pav{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
#tvj .pav button{border:0;border-radius:14px;padding:10px 0;font:900 21px 'Baloo 2',system-ui,sans-serif;color:#1a1440;background:#fff;box-shadow:0 3px 0 #8a7ad8}
#tvj .pav button:active{transform:translateY(2px);box-shadow:0 1px 0 #8a7ad8}#tvj .pav .ok{background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 3px 0 #a86a10}
#tvj canvas.roue{flex:none;align-self:center;width:min(250px,62vw);height:auto;touch-action:none}
#tvj .pop{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) scale(.3);font:900 40px/1 'Baloo 2',system-ui,sans-serif;color:#ffd24a;text-shadow:0 4px 0 #6a3a00,0 0 30px rgba(255,200,60,.6);opacity:0;pointer-events:none;white-space:nowrap;animation:tvjPop 1.3s forwards;z-index:5}
@keyframes tvjPop{15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}
#tvj .conf{position:absolute;top:-12px;width:8px;height:12px;pointer-events:none;animation:tvjC linear forwards;z-index:6}@keyframes tvjC{to{transform:translateY(110vh) rotate(720deg)}}
#tvj .niv{flex:none;display:flex;align-items:center;gap:12px;border:0;border-radius:18px;padding:12px 14px;text-align:left;color:#1a1440;background:#fff;box-shadow:0 4px 0 #8a7ad8;font-family:inherit}
#tvj .niv:active{transform:translateY(3px);box-shadow:0 1px 0 #8a7ad8}
#tvj .niv .pt{flex:none;width:12px;height:44px;border-radius:6px}
#tvj .niv .tx{flex:1;min-width:0}#tvj .niv b{display:block;font:900 18px/1.05 'Baloo 2',system-ui,sans-serif}#tvj .niv small{display:block;font:800 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.5px;color:#8a7ad8}
#tvj .niv span{display:block;font:700 12.5px/1.2 'Baloo 2',system-ui,sans-serif;color:#5a4a7a}
#tvj .niv .gn{flex:none;text-align:right;font:900 20px/1 'Baloo 2',system-ui,sans-serif;color:#1a1440}#tvj .niv .gn em{display:block;font:800 10px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#8a7ad8;margin-top:3px}
#tvj .tit{flex:none;font:900 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#b8a8ff;margin:6px 2px 0}
#tvj .lots{flex:none;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
#tvj .lot{background:#1e1648;border-radius:14px;padding:6px 4px 7px;text-align:center;position:relative}
#tvj .lot canvas{width:100%;height:auto;image-rendering:pixelated;display:block}
#tvj .lot b{display:block;font:800 10.5px/1.1 'Baloo 2',system-ui,sans-serif;color:#fff;margin-top:2px}#tvj .lot span{display:block;font:700 9.5px/1.1 'Baloo 2',system-ui,sans-serif;color:#9a8ad8;margin-top:2px}
#tvj .lot.non canvas{filter:brightness(0) opacity(.45)}#tvj .lot.oui{box-shadow:inset 0 0 0 2px #ffd24a}#tvj .lot.oui span{color:#ffd24a}
#tvj .info{flex:none;background:#1e1648;border-radius:18px;padding:14px;text-align:center;font:800 15px/1.3 'Baloo 2',system-ui,sans-serif;color:#d8ccff}
#tvj .info big{display:block;font:900 30px/1.1 'Baloo 2',system-ui,sans-serif;color:#ffd24a}
#tvj .nouv{position:absolute;inset:0;z-index:8;background:rgba(10,6,30,.75);display:grid;place-items:center;padding:24px;animation:tvjF .3s}@keyframes tvjF{from{opacity:0}}
#tvj .nouv .c{width:min(320px,86vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:18px;text-align:center;box-shadow:0 6px 0 #b8a890}
#tvj .nouv .c small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a5ad8}#tvj .nouv .c h3{margin:2px 0 6px;font:900 24px/1.1 'Baloo 2',system-ui,sans-serif}
#tvj .nouv canvas{width:120px;height:auto;image-rendering:pixelated;animation:tvjT 2s ease-in-out infinite}@keyframes tvjT{50%{transform:translateY(-6px)}}
#tvj .nouv p{margin:4px 0 12px;font:700 14px/1.25 'Baloo 2',system-ui,sans-serif;color:#5a4a32}
#tvj .nouv button{width:100%;border:0;border-radius:16px;padding:12px;background:#2a2016;color:#fff;font:800 16px 'Baloo 2',system-ui,sans-serif;box-shadow:0 4px 0 #000}`;

let RAC=null,SC=null,ETAT={C:null};
const persos=()=>[{nom:moiNom(),ap:moiAp(),coul:'#f2b030',pts:0,moi:true},{nom:'Gégé',ap:ap({peau:3,cheveux:0,coiffe:2,barbe:1,haut:4,veste:11}),coul:'#e8402a',pts:0},{nom:'Momo',ap:ap({peau:5,cheveux:0,coiffe:3,haut:1}),coul:'#2ab0a0',pts:0}];
const SPR={};
function dessinePerso(g,x,y,a){try{if(window.Perso&&Perso.sprite)Perso.sprite(g,x,y,a,'bas',0,false);}catch(x){}}
function sprite(k,a){if(SPR[k])return SPR[k];const c=document.createElement('canvas');c.width=40;c.height=66;const g=c.getContext('2d');g.imageSmoothingEnabled=false;dessinePerso(g,20,62,a);return SPR[k]=c;}

function peindre(){if(!RAC||!SC)return;const g=SC.getContext('2d'),W=180,H=134,t=performance.now()/1000;g.imageSmoothingEnabled=false;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a1a6a');gr.addColorStop(.6,'#1a1048');gr.addColorStop(1,'#0e0a26');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a=Math.sin(t*.8+i*2.1)*.35,x=30+i*60;g.fillStyle=['rgba(255,80,200,.10)','rgba(80,160,255,.10)','rgba(255,210,80,.10)'][i];g.beginPath();g.moveTo(x,0);g.lineTo(x+Math.sin(a)*90-22,H);g.lineTo(x+Math.sin(a)*90+22,H);g.closePath();g.fill();}
  g.globalCompositeOperation='source-over';
  g.fillStyle='#0a0620';g.fillRect(40,6,100,30);for(let y=0;y<15;y++)for(let x=0;x<50;x++){const v=Math.sin(x*.4+t*3)+Math.cos(y*.6-t*2);if(v>1.1){g.fillStyle=v>1.6?'#ffd24a':'#6a3ad8';g.fillRect(41+x*2,7+y*2,1,1);}}
  g.fillStyle='#ffd24a';g.font='900 11px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('LE GRAND MISTRAL',90,21);
  for(let i=0;i<30;i++){const on=((i+((t*6)|0))%3)===0;g.fillStyle=on?'#fff2b0':'#6a5a30';g.fillRect(3+i*6,1,2,2);}
  for(let i=0;i<17;i++){const on=((i+((t*6)|0))%3)===0;g.fillStyle=on?'#fff2b0':'#6a5a30';g.fillRect(1,5+i*6,2,2);g.fillRect(W-3,5+i*6,2,2);}
  g.fillStyle='#24185a';g.fillRect(0,84,W,20);for(let x=0;x<W;x+=12){g.fillStyle='#2e2070';g.fillRect(x,84,6,20);}
  const C=ETAT.C||persos();C.forEach((p,i)=>{const x=32+i*58,saut=p.saut&&p.saut>t?Math.abs(Math.sin((p.saut-t)*14))*4:0,trem=p.trem&&p.trem>t?Math.sin(t*60)*1:0;
    const s=sprite(i+(p.moi?'m':''),p.ap);g.drawImage(s,0,0,40,46,x-20+trem,30-saut,40,46);
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-19,95,40,4);
    g.fillStyle=p.coul;g.fillRect(x-18,62,36,34);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x-18,62,36,2);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-18,92,36,4);
    g.fillStyle='#0a0620';g.fillRect(x-14,66,28,13);const lit=p.buzz&&p.buzz>t;g.fillStyle=lit?'#fff':'#ffd24a';g.font='900 10px "Baloo 2",system-ui,sans-serif';g.fillText(String(p.pts),x,73);
    g.fillStyle='#fff';g.font='800 6px "Baloo 2",system-ui,sans-serif';g.fillText(p.nom.toUpperCase(),x,86);
    if(lit){g.fillStyle='rgba(255,240,150,.35)';g.beginPath();g.arc(x,46,22,0,7);g.fill();}});
  g.fillStyle='#0c0820';g.fillRect(0,102,W,H-102);
  const ex=ETAT.appl>t;for(let rg=0;rg<2;rg++)for(let i=0;i<16;i++){const x=6+i*11.3+(rg?5.6:0),y=112+rg*12,h=ex?Math.abs(Math.sin(t*12+i*1.7))*3:Math.abs(Math.sin(t*1.5+i))*.6,pe=['#e8b088','#c88a5a','#8a5a3a','#f0c8a0'][(i+rg)&3];
    g.fillStyle=rg?'#1c1440':'#2a1e5a';g.fillRect(x-4,y-h+4,8,12);g.fillStyle=pe;g.fillRect(x-2.5,y-h-2,5,5);
    g.fillStyle=['#2a1a10','#6a3a1a','#c8a040','#1a1a1a'][(i*3+rg)&3];g.fillRect(x-2.5,y-h-3,5,2);
    if(ex&&(i+rg)%2){const up=Math.sin(t*14+i)>0;g.fillStyle=pe;g.fillRect(x-5,y-h-(up?6:3),2,3);g.fillRect(x+3,y-h-(up?3:6),2,3);}}
  g.fillStyle='rgba(12,8,32,.6)';g.fillRect(0,H-6,W,6);
  requestAnimationFrame(peindre);}

function dire(t,qui){const b=RAC.querySelector('.bul');b.querySelector('.qui').textContent=(qui||'NADIA').toUpperCase();b.querySelector('p').innerHTML=t;
  const cv=b.querySelector('canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);
  const C=ETAT.C||persos();const a=qui==='Gégé'?C[1].ap:qui==='Momo'?C[2].ap:AP_NADIA;g.drawImage(sprite('p'+(qui||'n'),a),8,10,24,24,0,0,44,44);}
function zone(h,haut){const z=RAC.querySelector('.zone');z.innerHTML=h||'';z.classList.toggle('haut',!!haut);z.scrollTop=0;return z;}
function panneau(t,ms){ETAT.appl=performance.now()/1000+(ms||1800)/1000;const p=RAC.querySelector('.pan');p.textContent=t;p.classList.add('on');clearTimeout(panneau.t);panneau.t=setTimeout(()=>p.classList.remove('on'),ms||1800);}
function pop(t,c){const d=document.createElement('div');d.className='pop';d.textContent=t;if(c)d.style.color=c;RAC.appendChild(d);setTimeout(()=>d.remove(),1400);}
function confettis(n){for(let i=0;i<(n||60);i++){const d=document.createElement('i');d.className='conf';d.style.left=Math.random()*100+'%';d.style.background=ALEA(['#ffd24a','#e8302a','#3a9ad8','#5ad07a','#e86aa0','#fff']);
  d.style.animationDuration=(1.6+Math.random()*1.8)+'s';d.style.animationDelay=Math.random()*.6+'s';RAC.appendChild(d);setTimeout(()=>d.remove(),4200);}}
const T=()=>performance.now()/1000;
function scores(pts){if(!pts)return;const C=ETAT.C;pts.forEach((v,i)=>{const d=v-C[i].pts;if(d>0){C[i].saut=T()+.7;C[i].buzz=T()+1;}else if(d<0){C[i].trem=T()+.6;}C[i].pts=v;});}
function joie(d){SON.bon();setTimeout(()=>SON.applaudir(1.6),150);panneau('APPLAUDISSEZ');if(d)pop('+'+d);}
function oh(d){SON.faux();panneau('OHHH…',1400);if(d)pop('−'+d,'#ff7a6a');}
const attendreClic=(sel)=>new Promise(ok=>{RAC.querySelectorAll(sel).forEach((b,i)=>b.onclick=()=>{vib(8);ac();ok(i);});});
async function erreur(t){dire('« Coupez ! Petit souci technique : '+t+' »');zone('<button class="gros">Retour au studio</button>');await attendreClic('.gros');accueil();}

/* ---------- MANCHE 1 : LE BUZZER ---------- */
async function mancheBuzzer(D){RAC.querySelector('.man').textContent='MANCHE 1 · LE BUZZER';
  if(!D.questions.some(q=>q.fait)){dire('« Manche 1 : <b>le buzzer</b> ! Le premier qui répond juste prend <b>10 points</b>. Une erreur, et c’est moins 5 ! »');
    zone('<button class="gros">Je suis prêt !</button>');await attendreClic('.gros');}
  const DUREE=[0,9000,8000,7000][D.niveau];
  for(let n=0;n<5;n++){const Q=D.questions[n];if(Q.fait)continue;if(!RAC)return false;
    dire('<span style="opacity:.6">Question '+(n+1)+'/5</span><br>'+Q.q);SON.tic();
    const z=zone('<div class="chrono"><i></i></div>'+Q.r.map((r,i)=>'<button class="rep"><i>'+'ABC'[i]+'</i>'+r+'</button>').join(''));
    const barre=z.querySelector('.chrono i'),bt=[...z.querySelectorAll('.rep')];
    const chrono=(ms,fin)=>{const t0=performance.now();const it=setInterval(()=>{const k=Math.max(0,1-(performance.now()-t0)/ms);const b=z.querySelector('.chrono i');if(b)b.style.transform='scaleX('+k+')';if(k<=0){clearInterval(it);fin();}},50);return it;};
    /* qui buzze en premier : toi, le candidat prévu par le serveur, ou personne */
    const ev=await new Promise(fin=>{let fait=false;const f=v=>{if(fait)return;fait=true;clearInterval(it);clearTimeout(npc);fin(v);};
      const it=chrono(DUREE,()=>f({qui:-1}));
      const npc=(Q.npc.qui>0&&!Q.npcfait)?setTimeout(()=>f({qui:Q.npc.qui}),Math.min(Q.npc.apres,DUREE-300)):0;
      bt.forEach((b,i)=>b.onclick=()=>{vib(10);ac();f({qui:0,i});});});
    let exclu=-1;
    if(ev.qui>0){const p=ETAT.C[ev.qui];SON.buzz();p.buzz=T()+1.2;
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
    if(ev.qui===0){SON.buzz();ETAT.C[0].buzz=T()+1.2;bt[ev.i].classList.add('att');}
    const r=await rpc('tv_repondre',{p_partie:D.partie,p_n:n,p_choix:ev.qui===0?ev.i:-1,p_qui:0});if(r.erreur)return erreur(r.erreur),false;
    if(ev.qui===0)bt[ev.i].classList.remove('att');
    bt[r.ok].classList.add('bon');
    if(ev.qui<0){dire('« Temps écoulé ! La réponse était <b>'+Q.r[r.ok]+'</b>. »');SON.faux();}
    else if(r.juste){bt.forEach((b,i)=>{if(i!==r.ok)b.classList.add('off');});scores(r.pts);joie(10);dire('« '+ALEA(['BRAVO ! Dix points !','Mais quel talent !','Exactement ! Le public est en feu !'])+' »');}
    else{bt[ev.i].classList.add('faux');scores(r.pts);oh(5);dire('« '+ALEA(['Aïe… c’était <b>'+Q.r[r.ok]+'</b>.','Non ! Mais quelle confiance, j’adore.','Raté ! Le public est mort de rire.'])+' »');}
    await pause(2400);}
  return true;}

/* ---------- MANCHE 2 : LE JUSTE PRIX DU PORT ---------- */
async function mancheJustePrix(D){zone('');RAC.querySelector('.man').textContent='MANCHE 2 · LE JUSTE PRIX DU PORT';const P=D.prix;
  if(!P.essais){dire('« Manche 2 : <b>le juste prix du port</b> ! '+P.essais_max+' essais. Plus tu trouves vite, plus tu gagnes ! »');await pause(2200);SON.roulement(1.2);await pause(1200);SON.fanfare();}
  dire('« Combien coûte… <b>'+P.obj+'</b> ? Entre 1 et '+P.max+' euros ! »');
  let val='',ess=P.essais||0,occupe=false;
  const z=zone('<div class="prix"><div class="obj">'+P.obj+'</div><div class="val">—</div><div class="ess">Essai '+(ess+1)+' sur '+P.essais_max+'</div></div><div class="pav">'+
    [1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>'<button'+(k==='OK'?' class="ok"':'')+'>'+k+'</button>').join('')+'</div>');
  const V=z.querySelector('.val'),E=z.querySelector('.ess');
  const fin=await new Promise(done=>{z.querySelectorAll('.pav button').forEach(bt=>bt.onclick=async()=>{if(occupe)return;const k=bt.textContent;vib(6);SON.tic();ac();
    if(k==='⌫'){val=val.slice(0,-1);}else if(k==='OK'){if(!val)return;const v=+val;occupe=true;
      const r=await rpc('tv_prix',{p_partie:D.partie,p_valeur:v});occupe=false;if(r.erreur){done({erreur:r.erreur});return;}ess=r.essais;
      if(r.res==='ok'){done(r);return;}
      if(r.res==='plus'){SON.plus();dire('« '+ALEA(['C’est PLUS !','Plus ! Plus !','C’est plus, voyons !'])+' »');pop('PLUS ↑','#5ad07a');}
      else{SON.moins();dire('« '+ALEA(['C’est MOINS !','Moins ! On n’est pas à Monaco !','Moins, moins !'])+' »');pop('MOINS ↓','#ff7a6a');}
      if(r.fini){done(r);return;}E.textContent='Essai '+(ess+1)+' sur '+P.essais_max+(ess===P.essais_max-1?' · dernier essai !':'');val='';}
    else if(val.length<3){val=(val+k).replace(/^0+/,'');}
    V.textContent=val||'—';});});
  if(fin.erreur)return erreur(fin.erreur),false;
  V.textContent=fin.prix+' €';const avant=ETAT.C.map(c=>c.pts);scores(fin.pts);
  if(fin.res==='ok'){joie(fin.gain);confettis(40);dire('« LE JUSTE PRIX ! '+fin.prix+' euros ! En '+fin.essais+' essai'+(fin.essais>1?'s':'')+' : <b>+'+fin.gain+' points</b> ! »');}
  else{oh(0);dire('« Perdu ! C’était <b>'+fin.prix+' euros</b>. »<br><i>Gégé : « Moi j’aurais dit trois euros. Et encore, c’est cher. »</i>');}
  await pause(2600);const g=fin.pts[1]-avant[1],m=fin.pts[2]-avant[2];
  dire('« Pendant ce temps, en coulisses : Gégé '+(g?'prend <b>+'+g+'</b>':'ne prend <b>rien</b>, il conteste encore')+', Momo '+(m?'prend <b>+'+m+'</b>':'ne prend <b>rien</b>')+'. »');
  zone('<button class="gros">Place à la finale !</button>');await attendreClic('.gros');return true;}

/* ---------- FINALE : LA ROUE DU MISTRAL ---------- */
const ROUE=[['+50','#f2b030',s=>s+50,'Cinquante points !'],['PIGEON','#8a94a8',s=>s-10,'Un pigeon ! Moins dix…'],['×2','#e8302a',s=>s*2,'DOUBLE ! Le public est debout !'],['+20','#3a9ad8',s=>s+20,'Vingt points !'],
  ['MISTRAL','#2a3a5a',s=>Math.round(s/2),'Le mistral emporte la moitié des points !'],['+30','#4ab070',s=>s+30,'Trente points !'],['BISE','#e86aa0',s=>s+15,'Une bise de Nadia : plus quinze !'],['+100','#f6e27a',s=>s+100,'CENT POINTS ! LE JACKPOT !']];
function roueDessin(cv,ang){const g=cv.getContext('2d'),S=cv.width,c=S/2,r=c-10,n=ROUE.length;g.clearRect(0,0,S,S);
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
async function finale(D){zone('');RAC.querySelector('.man').textContent='FINALE · LA ROUE DU MISTRAL';const C=ETAT.C;
  dire('« LA FINALE ! Chacun fait tourner <b>la roue du Mistral</b>. Jackpot, double… ou le mistral qui emporte tout ! »');
  const z=zone('<canvas class="roue" width="500" height="500"></canvas><button class="gros">Lancer la roue !</button>');
  const cv=z.querySelector('.roue');cv._a=0;let vit=true;(function anim(){if(!vit||!RAC)return;roueDessin(cv,cv._a);requestAnimationFrame(anim);})();
  await attendreClic('.gros');const btn=z.querySelector('.gros');btn.disabled=true;btn.textContent='La roue tourne…';vit=false;
  const r=await rpc('tv_roue',{p_partie:D.partie});if(r.erreur)return erreur(r.erreur),false;
  btn.style.visibility='hidden';
  for(const k of [0,1,2]){const p=C[k];if(k>0){dire('« À '+p.nom+' de tourner ! »');await pause(1100);}
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
  RAC.querySelector('.man').textContent='RÉSULTATS';zone('');SON.roulement(1.4);dire('« Et le grand gagnant du <b>Grand Mistral</b> est… »');await pause(1600);
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
  RAC.classList.remove('direct');accueil();}

/* ---------- LE STUDIO, AVANT L'ÉMISSION ---------- */
function compte(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h+' h '+String(m).padStart(2,'0');}
async function accueil(){ETAT.C=persos();RAC.querySelector('.man').textContent='';RAC.classList.remove('direct');
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
    lots+'<button class="gros b2" data-q>Retour à la place</button>';}
  const z=zone(h,true);
  z.querySelectorAll('.lot').forEach(d=>d.insertBefore(lotCanvas(d.dataset.l),d.firstChild));
  z.querySelectorAll('[data-q]').forEach(b=>b.onclick=quitter);
  z.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{vib(8);ac();emission(+b.dataset.n);});}

async function emission(n){zone('<div class="info">Antenne dans 3, 2, 1…</div>');
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
  d.innerHTML='<div class="bar"><div class="logo">LE GRAND MISTRAL<small>MISTRAL TV · STUDIO 1</small></div><span class="dir">● DIRECT</span><span class="sp"></span><button class="x">Quitter</button></div>'+
    '<div class="man"></div><canvas class="sc" width="180" height="134"></canvas><div class="pan">APPLAUDISSEZ</div><div class="bul"><canvas width="44" height="44"></canvas><div><span class="qui">NADIA</span><p></p></div></div><div class="zone"></div>';
  document.body.appendChild(d);SC=d.querySelector('canvas.sc');
  d.querySelector('.x').onclick=quitter;
  ETAT.C=persos();peindre();accueil();supa();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',demarrer);else demarrer();
})();
