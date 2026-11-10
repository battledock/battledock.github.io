/* =====================================================================
   LE GRAND MISTRAL — le jeu télé de Mistral TV (plateau.html).
   Trois candidats : toi, Gégé (le râleur) et Momo (le confiant).
   Manche 1 : le buzzer. Manche 2 : le juste prix du port.
   Finale : la roue du Mistral. Nadia présente, le public réagit.
   Un écran à part (#tvj). Chargé à la demande (eval direct).
   ===================================================================== */
(()=>{
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const ALEA=L=>L[(Math.random()*L.length)|0];
const melange=L=>{const a=L.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const vib=x=>{try{vibrer(x);}catch(_){}};
const ap=o=>Object.assign({peau:1,cheveux:1,coiffe:1,barbe:0,haut:2,veste:0,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true},o);
const AP_NADIA={peau:1,cheveux:3,coiffe:5,barbe:0,haut:5,veste:23,bas:0,pantalon:9,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
const moiAp=()=>{try{return e.ap||joueur.ap;}catch(x){return ap({});}};
const moiNom=()=>{try{return (e.pseudo||e.nom||'Toi').slice(0,10);}catch(x){return 'Toi';}};

/* ---------- LE SON : jingles, buzzer, applaudissements, trombone triste ---------- */
let AC=null;const sonOk=()=>{try{return !(typeof REG!=='undefined'&&REG.sons===false);}catch(x){return true;}};
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(x){}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function note(f,t0,d,type,vol,glis){const a=ac();if(!a||!sonOk())return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,a.currentTime+t0);
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
  roulement(d){const a=ac();if(!a||!sonOk())return;for(let t=0;t<d;t+=.045)note(90+Math.random()*30,t,.05,'triangle',.05);},
  applaudir(d){const a=ac();if(!a||!sonOk())return;d=d||2;const n=a.sampleRate*.06,buf=a.createBuffer(1,n,a.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,6);
    for(let k=0;k<d*55;k++){const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=buf;f.type='bandpass';f.frequency.value=900+Math.random()*1800;f.Q.value=.8;
      const t=a.currentTime+Math.random()*d,fin=1-Math.max(0,(t-a.currentTime)-(d-.6))/.6;g.gain.value=.25*Math.max(.05,fin)*(.5+Math.random()*.5);s.connect(f).connect(g).connect(a.destination);s.start(t);}},
  fanfare(){[[523,0],[523,.14],[523,.28],[659,.42],[784,.7],[659,.9],[784,1.04],[1047,1.2]].forEach(([f,t],i)=>note(f,t,i===7?.8:.16,'square',.06));note(262,.42,1.6,'triangle',.08);}
};

/* ---------- LE CONTENU ---------- */
const QUESTIONS=[
  ['À Marseille, quand il fait 14 degrés, on dit…',['« Il fait frais. »','« On caille, on va mourir. »','« C’est le printemps. »'],1],
  ['Que fait une mouette quand tu sors un sandwich ?',['Elle t’applaudit','Elle te le vole','Elle paye sa part'],1],
  ['Que veut dire « fada » ?',['Fou','Fatigué','Fan de la Bonne Mère'],0],
  ['Le pastis, on le sert avec…',['Du lait','De l’eau fraîche','Du soda, comme un sauvage'],1],
  ['La « Bonne Mère », c’est…',['La mère de Gégé','La patronne du Quai','Notre-Dame de la Garde'],2],
  ['Combien de pigeons sur la place de la Joliette ?',['3','12','Un seul, mais il court vite'],1],
  ['Quand un Marseillais exagère un tout petit peu, il dit…',['Une sardine a bouché le port','Il a plu une goutte','Le mistral est poli'],0],
  ['Qui tombe le plus souvent dans le port ?',['Le capitaine','Une mouette','Momo'],2],
  ['Le mistral, c’est…',['Un vent du nord','Un fromage','Le cousin de Nadia'],0],
  ['« Ça m’espante », ça veut dire…',['Ça m’étonne','Ça me fatigue','J’ai faim'],0],
  ['Un docker en pause, il fait quoi ?',['Il travaille','Il refait le match','Il range les conteneurs par couleur'],1],
  ['La sardine qui a bouché le port s’appelait…',['La Sartine','Bernadette','Le Titanic'],0]];
const PRIX=[
  ['Un pastis en terrasse, vue sur le Vieux-Port',1,20,6],
  ['Le sandwich que la mouette t’a volé',1,20,8],
  ['Une casquette de docker « presque neuve »',1,50,17],
  ['Un poster dédicacé de Nadia',1,100,45],
  ['Un tour de grande roue avec Gégé (il parle tout le long)',1,30,12],
  ['Un kilo de sardines de chez Fanfan',1,30,14]];
const ROUE=[['+50','#f2b030',s=>s+50,'Cinquante points !'],['PIGEON','#8a94a8',s=>s-10,'Un pigeon ! Moins dix…'],['×2','#e8302a',s=>s*2,'DOUBLE ! Le public est debout !'],['+20','#3a9ad8',s=>s+20,'Vingt points !'],
  ['MISTRAL','#2a3a5a',s=>Math.round(s/2),'Le mistral emporte la moitié de tes points !'],['+30','#4ab070',s=>s+30,'Trente points !'],['BISE','#e86aa0',s=>s+15,'Une bise de Nadia : plus quinze !'],['+100','#f6e27a',s=>s+100,'CENT POINTS ! LE JACKPOT !']];

/* ---------- L'ÉCRAN ---------- */
const CSS=`#tvj{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#120d2a;color:#fff;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;overflow:hidden}
#tvj.on{opacity:1}#tvj *{box-sizing:border-box}#tvj *::after{content:none!important;display:none!important}
#tvj .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 6px}
#tvj .logo{font:900 17px/1 'Baloo 2',system-ui,sans-serif;letter-spacing:.5px;background:linear-gradient(#ffe68a,#f2a020);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 2px 0 rgba(0,0,0,.2)}
#tvj .logo small{display:block;font:800 9px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#b8a8ff;-webkit-text-fill-color:#b8a8ff}
#tvj .dir{background:#e8302a;border-radius:6px;padding:2px 7px;font:900 10px 'Baloo 2',system-ui,sans-serif;letter-spacing:1px;animation:tvjB 1s steps(2) infinite}@keyframes tvjB{50%{opacity:.35}}
#tvj .sp{flex:1}#tvj .x{width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font:800 15px 'Baloo 2',system-ui,sans-serif}
#tvj .man{flex:none;text-align:center;font:900 12px 'Baloo 2',system-ui,sans-serif;letter-spacing:2.5px;color:#ffd24a;height:16px}
#tvj canvas.sc{flex:none;width:100%;height:auto;display:block;image-rendering:pixelated}
#tvj .pan{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%) scale(.6);padding:3px 12px;border-radius:8px;background:#3a0a0a;color:#5a1a1a;font:900 13px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;border:2px solid #5a1a1a;transition:all .15s;opacity:0}
#tvj .pan.on{opacity:1;transform:translateX(-50%) scale(1);background:#e8302a;color:#fff;border-color:#ffb0a0;box-shadow:0 0 24px #ff4030}
#tvj .bul{flex:none;display:flex;gap:10px;align-items:flex-start;margin:4px 12px 0;padding:10px 12px;background:#f6f1e6;color:#2a2016;border-radius:18px;box-shadow:0 4px 0 #b8a890;min-height:62px}
#tvj .bul canvas{flex:none;width:44px;height:44px;border-radius:12px;background:#e8d8f8;image-rendering:pixelated}
#tvj .bul .qui{display:block;font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.5px;color:#8a5ad8}
#tvj .bul p{margin:0;font:800 16px/1.2 'Baloo 2',system-ui,sans-serif}#tvj .bul p b{color:#6a3ad8}#tvj .bul p i{font-style:normal;color:#8a7a5a;font-size:14px}
#tvj .zone{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:9px;padding:10px 14px calc(14px + env(safe-area-inset-bottom));min-height:0}
#tvj .rep{border:0;border-radius:16px;padding:13px 14px;text-align:left;font:800 16px/1.15 'Baloo 2',system-ui,sans-serif;color:#1a1440;background:#fff;box-shadow:0 4px 0 #8a7ad8;display:flex;align-items:center;gap:10px;transition:transform .1s,background .2s}
#tvj .rep i{flex:none;width:28px;height:28px;border-radius:9px;background:#6a4ad8;color:#fff;font:900 15px/28px 'Baloo 2',system-ui,sans-serif;text-align:center;font-style:normal}
#tvj .rep:active{transform:translateY(3px);box-shadow:0 1px 0 #8a7ad8}
#tvj .rep.bon{background:#5ad07a;box-shadow:0 4px 0 #2a8a4a}#tvj .rep.faux{background:#ff7a6a;box-shadow:0 4px 0 #b83a2a}#tvj .rep.off{opacity:.45}
#tvj .chrono{height:8px;border-radius:4px;background:rgba(255,255,255,.15);overflow:hidden}#tvj .chrono i{display:block;height:100%;background:linear-gradient(90deg,#ffd24a,#ff6a3a);transform-origin:left}
#tvj .gros{border:0;border-radius:20px;padding:15px;font:900 19px 'Baloo 2',system-ui,sans-serif;color:#1a1440;background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 5px 0 #a86a10}
#tvj .gros:active{transform:translateY(3px);box-shadow:0 2px 0 #a86a10}#tvj .gros.b2{background:#fff;box-shadow:0 5px 0 #8a7ad8}
#tvj .prix{background:#1e1648;border-radius:18px;padding:10px;text-align:center}
#tvj .prix .obj{font:800 15px/1.2 'Baloo 2',system-ui,sans-serif;color:#d8ccff}
#tvj .prix .val{font:900 44px/1.05 'Baloo 2',system-ui,sans-serif;color:#ffd24a;letter-spacing:1px}
#tvj .prix .ess{font:800 12px 'Baloo 2',system-ui,sans-serif;color:#9a8ad8}
#tvj .pav{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
#tvj .pav button{border:0;border-radius:14px;padding:10px 0;font:900 21px 'Baloo 2',system-ui,sans-serif;color:#1a1440;background:#fff;box-shadow:0 3px 0 #8a7ad8}
#tvj .pav button:active{transform:translateY(2px);box-shadow:0 1px 0 #8a7ad8}#tvj .pav .ok{background:linear-gradient(#ffe68a,#f2b030);box-shadow:0 3px 0 #a86a10}
#tvj canvas.roue{align-self:center;width:min(250px,62vw);height:auto;touch-action:none}
#tvj .pop{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) scale(.3);font:900 40px/1 'Baloo 2',system-ui,sans-serif;color:#ffd24a;text-shadow:0 4px 0 #6a3a00,0 0 30px rgba(255,200,60,.6);opacity:0;pointer-events:none;white-space:nowrap;animation:tvjPop 1.3s forwards;z-index:5}
@keyframes tvjPop{15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}
#tvj .conf{position:absolute;top:-12px;width:8px;height:12px;pointer-events:none;animation:tvjC linear forwards;z-index:6}@keyframes tvjC{to{transform:translateY(110vh) rotate(720deg)}}`;

let RAC=null,SC=null,ETAT=null,FIN=null;
const persos=()=>[{nom:moiNom(),ap:moiAp(),coul:'#f2b030',pts:0,moi:true},{nom:'Gégé',ap:ap({peau:3,cheveux:0,coiffe:2,barbe:1,haut:4,veste:11}),coul:'#e8402a',pts:0},{nom:'Momo',ap:ap({peau:5,cheveux:0,coiffe:3,haut:1}),coul:'#2ab0a0',pts:0}];
const SPR={};function sprite(k,a){if(SPR[k])return SPR[k];const c=document.createElement('canvas');c.width=40;c.height=66;const g=c.getContext('2d');g.imageSmoothingEnabled=false;try{personne(g,20,62,a,'bas',0,false);}catch(x){}return SPR[k]=c;}

/* la scène : rampe d'ampoules, mur LED, trois pupitres */
function peindre(){if(!RAC||!SC)return;const g=SC.getContext('2d'),W=180,H=134,t=performance.now()/1000;g.imageSmoothingEnabled=false;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a1a6a');gr.addColorStop(.6,'#1a1048');gr.addColorStop(1,'#0e0a26');g.fillStyle=gr;g.fillRect(0,0,W,H);
  /* les faisceaux */
  g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a=Math.sin(t*.8+i*2.1)*.35,x=30+i*60;g.fillStyle=['rgba(255,80,200,.10)','rgba(80,160,255,.10)','rgba(255,210,80,.10)'][i];g.beginPath();g.moveTo(x,0);g.lineTo(x+Math.sin(a)*90-22,H);g.lineTo(x+Math.sin(a)*90+22,H);g.closePath();g.fill();}
  g.globalCompositeOperation='source-over';
  /* le mur LED et le logo */
  g.fillStyle='#0a0620';g.fillRect(40,6,100,30);for(let y=0;y<15;y++)for(let x=0;x<50;x++){const v=Math.sin(x*.4+t*3)+Math.cos(y*.6-t*2);if(v>1.1){g.fillStyle=v>1.6?'#ffd24a':'#6a3ad8';g.fillRect(41+x*2,7+y*2,1,1);}}
  g.fillStyle='#ffd24a';g.font='900 11px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('LE GRAND MISTRAL',90,21);
  /* la rampe d'ampoules */
  for(let i=0;i<30;i++){const on=((i+((t*6)|0))%3)===0;g.fillStyle=on?'#fff2b0':'#6a5a30';g.fillRect(3+i*6,1,2,2);g.fillRect(3+i*6,H-3,2,2);}
  for(let i=0;i<16;i++){const on=((i+((t*6)|0))%3)===0;g.fillStyle=on?'#fff2b0':'#6a5a30';g.fillRect(1,5+i*6,2,2);g.fillRect(W-3,5+i*6,2,2);}
  /* le sol */
  g.fillStyle='#24185a';g.fillRect(0,84,W,20);for(let x=0;x<W;x+=12){g.fillStyle='#2e2070';g.fillRect(x,84,6,20);}
  /* les candidats et leurs pupitres */
  const C=ETAT?ETAT.C:persos();C.forEach((p,i)=>{const x=32+i*58,saut=p.saut&&p.saut>t?Math.abs(Math.sin((p.saut-t)*14))*4:0,trem=p.trem&&p.trem>t?Math.sin(t*60)*1:0;
    const s=sprite(i+(p.moi?'m':''),p.ap);g.drawImage(s,0,0,40,46,x-20+trem,30-saut,40,46);
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-19,95,40,4);
    g.fillStyle=p.coul;g.fillRect(x-18,62,36,34);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x-18,62,36,2);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-18,92,36,4);
    g.fillStyle='#0a0620';g.fillRect(x-14,66,28,13);const lit=p.buzz&&p.buzz>t;g.fillStyle=lit?'#fff':'#ffd24a';g.font='900 10px "Baloo 2",system-ui,sans-serif';g.fillText(String(p.pts),x,73);
    g.fillStyle='#fff';g.font='800 6px "Baloo 2",system-ui,sans-serif';g.fillText(p.nom.toUpperCase(),x,86);
    if(lit){g.fillStyle='rgba(255,240,150,.35)';g.beginPath();g.arc(x,46,22,0,7);g.fill();}});
  /* le public, au premier rang */
  g.fillStyle='#0c0820';g.fillRect(0,102,W,H-102);
  const ex=ETAT&&ETAT.appl>t;for(let rg=0;rg<2;rg++)for(let i=0;i<16;i++){const x=6+i*11.3+(rg?5.6:0),y=112+rg*12,s=Math.sin(i*7.3+rg*3),h=ex?Math.abs(Math.sin(t*12+i*1.7))*3:Math.abs(Math.sin(t*1.5+i))*.6;
    g.fillStyle=rg?'#1c1440':'#2a1e5a';g.fillRect(x-4,y-h+4,8,12);g.fillStyle=['#e8b088','#c88a5a','#8a5a3a','#f0c8a0'][(i+rg)&3];g.fillRect(x-2.5,y-h-2,5,5);
    g.fillStyle=['#2a1a10','#6a3a1a','#c8a040','#1a1a1a'][(i*3+rg)&3];g.fillRect(x-2.5,y-h-3,5,2);
    if(ex&&(i+rg)%2){const up=Math.sin(t*14+i)>0;g.fillStyle=['#e8b088','#c88a5a','#8a5a3a','#f0c8a0'][(i+rg)&3];g.fillRect(x-5,y-h-(up?6:3),2,3);g.fillRect(x+3,y-h-(up?3:6),2,3);}}
  g.fillStyle='rgba(12,8,32,.6)';g.fillRect(0,H-6,W,6);
  requestAnimationFrame(peindre);}

function dire(t,qui){const b=RAC.querySelector('.bul');b.querySelector('.qui').textContent=(qui||'NADIA').toUpperCase();b.querySelector('p').innerHTML=t;
  const cv=b.querySelector('canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);
  const a=qui==='Gégé'?ETAT.C[1].ap:qui==='Momo'?ETAT.C[2].ap:AP_NADIA;g.drawImage(sprite('p'+(qui||'n'),a),8,10,24,24,0,0,44,44);}
function zone(h){const z=RAC.querySelector('.zone');z.innerHTML=h||'';return z;}
function panneau(t,ms){if(ETAT)ETAT.appl=performance.now()/1000+(ms||1800)/1000;const p=RAC.querySelector('.pan');p.textContent=t;p.classList.add('on');clearTimeout(panneau.t);panneau.t=setTimeout(()=>p.classList.remove('on'),ms||1800);}
function pop(t,c){const d=document.createElement('div');d.className='pop';d.textContent=t;if(c)d.style.color=c;RAC.appendChild(d);setTimeout(()=>d.remove(),1400);}
function confettis(n){for(let i=0;i<(n||60);i++){const d=document.createElement('i');d.className='conf';d.style.left=Math.random()*100+'%';d.style.background=ALEA(['#ffd24a','#e8302a','#3a9ad8','#5ad07a','#e86aa0','#fff']);
  d.style.animationDuration=(1.6+Math.random()*1.8)+'s';d.style.animationDelay=Math.random()*.6+'s';RAC.appendChild(d);setTimeout(()=>d.remove(),4200);}}
function bravo(p,pts){const t=performance.now()/1000;p.pts+=pts;p.saut=t+.7;p.buzz=t+1;if(pts>0){SON.bon();setTimeout(()=>SON.applaudir(1.6),150);panneau('APPLAUDISSEZ');pop('+'+pts);}}
function rate(p,pts){const t=performance.now()/1000;p.pts=Math.max(0,p.pts-pts);p.trem=t+.6;SON.faux();panneau('OHHH…',1400);if(pts)pop('−'+pts,'#ff7a6a');}
const attendreClic=(sel)=>new Promise(ok=>{RAC.querySelectorAll(sel).forEach((b,i)=>b.onclick=()=>{vib(8);ok(i);});});

/* ---------- MANCHE 1 : LE BUZZER ---------- */
async function mancheBuzzer(){RAC.querySelector('.man').textContent='MANCHE 1 · LE BUZZER';
  dire('« Manche 1 : <b>le buzzer</b> ! Je pose la question, le premier qui répond juste prend <b>10 points</b>. Une erreur, et c’est moins 5 ! »');
  zone('<button class="gros">Je suis prêt !</button>');await attendreClic('.gros');
  const Q=melange(QUESTIONS).slice(0,5);
  for(let n=0;n<Q.length&&RAC;n++){const [q,R,ok]=Q[n];
    dire('<span style="opacity:.6">Question '+(n+1)+'/5</span><br>'+q);SON.tic();
    const z=zone('<div class="chrono"><i></i></div>'+R.map((r,i)=>'<button class="rep"><i>'+'ABC'[i]+'</i>'+r+'</button>').join(''));
    const barre=z.querySelector('.chrono i');const D=8000,t0=performance.now();
    const bt=[...z.querySelectorAll('.rep')];let fini=false,exclus=new Set();
    const res=await new Promise(fin=>{
      const tick=setInterval(()=>{const k=Math.max(0,1-(performance.now()-t0)/D);barre.style.transform='scaleX('+k+')';if(k<=0){clearInterval(tick);fin({qui:null});}},50);
      bt.forEach((b,i)=>b.onclick=()=>{if(fini||exclus.has(i))return;vib(10);SON.buzz();clearInterval(tick);fin({qui:0,i,tick});});
      /* les deux autres candidats buzzent aussi */
      [[1,2200,4800,.45],[2,2800,6200,.55]].forEach(([k,a,b,juste])=>{if(Math.random()<.35)return;setTimeout(()=>{if(fini||!RAC)return;clearInterval(tick);SON.buzz();
        const i=Math.random()<juste?ok:ALEA([0,1,2].filter(x=>x!==ok));fin({qui:k,i,tick});},a+Math.random()*(b-a));});});
    fini=true;const C=ETAT.C;
    if(res.qui===null){dire('« Temps écoulé ! La réponse était <b>'+R[ok]+'</b>. »');bt[ok].classList.add('bon');SON.faux();await pause(2200);continue;}
    const p=C[res.qui];p.buzz=performance.now()/1000+1.2;
    if(res.qui!==0){dire(res.qui===1?'« '+ALEA(['C’est la '+'ABC'[res.i]+', évidemment !','La '+'ABC'[res.i]+' ! Et je conteste d’avance.',''+'ABC'[res.i]+' ! Mon cousin me l’a dit.'])+' »':'« '+ALEA(['La '+'ABC'[res.i]+', frérot, trop facile !',''+'ABC'[res.i]+' ! J’suis chaud ce soir !','Euh… la '+'ABC'[res.i]+' ? Non, la '+'ABC'[res.i]+' !'])+' »',p.nom);await pause(1300);}
    bt[res.i].classList.add(res.i===ok?'bon':'faux');
    if(res.i===ok){bravo(p,10);
      dire(res.qui===0?'« '+ALEA(['BRAVO ! Dix points !','Mais quel talent !','Exactement ! Le public est en feu !'])+' »':
        res.qui===1?'« Bonne réponse pour Gégé… »<br><i>Gégé : « Évidemment. »</i>':'« Bonne réponse pour Momo ! »<br><i>Momo : « Je suis un génie, wesh. »</i>');
      bt.forEach((b,i)=>{if(i!==ok)b.classList.add('off');});await pause(2300);continue;}
    rate(p,5);
    dire(res.qui===0?'« '+ALEA(['Aïe… c’était <b>'+R[ok]+'</b>.','Non ! Mais quelle confiance, j’adore.','Raté ! Le public est mort de rire.'])+' »'+(res.qui===0?'':''):
      res.qui===1?'« Faux, Gégé ! »<br><i>Gégé : « C’est truqué ! J’exige un recomptage ! »</i>':'« Faux, Momo ! »<br><i>Momo : « Ah non ? J’étais sûr à 200 %… »</i>');
    if(res.qui!==0){/* à toi de rattraper */await pause(1600);exclus.add(res.i);dire('« Il reste une chance ! À toi ! »');
      const t1=performance.now();const r2=await new Promise(fin=>{const tick=setInterval(()=>{const k=Math.max(0,1-(performance.now()-t1)/5000);const bb=RAC&&RAC.querySelector('.chrono i');if(bb)bb.style.transform='scaleX('+k+')';if(k<=0){clearInterval(tick);fin(-1);}},50);
        bt.forEach((b,i)=>b.onclick=()=>{if(exclus.has(i))return;clearInterval(tick);vib(10);SON.buzz();fin(i);});});
      if(r2<0){dire('« Trop tard ! C’était <b>'+R[ok]+'</b>. »');bt[ok].classList.add('bon');}
      else if(r2===ok){bt[r2].classList.add('bon');bravo(C[0],10);dire('« QUEL RATTRAPAGE ! Dix points ! »');}
      else{bt[r2].classList.add('faux');bt[ok].classList.add('bon');rate(C[0],5);dire('« Oh non… c’était <b>'+R[ok]+'</b> ! »');}}
    else{bt[ok].classList.add('bon');}
    await pause(2400);}}

/* ---------- MANCHE 2 : LE JUSTE PRIX DU PORT ---------- */
async function mancheJustePrix(){zone('');RAC.querySelector('.man').textContent='MANCHE 2 · LE JUSTE PRIX DU PORT';
  const [obj,a,b,prix]=ALEA(PRIX);
  dire('« Manche 2 : <b>le juste prix du port</b> ! Cinq essais. Plus tu trouves vite, plus tu gagnes ! »');await pause(2200);
  SON.roulement(1.2);await pause(1200);SON.fanfare();dire('« Combien coûte… <b>'+obj+'</b> ? Entre '+a+' et '+b+' euros ! »');
  const gains=[40,30,20,15,10];let val='',ess=0;
  const z=zone('<div class="prix"><div class="obj">'+obj+'</div><div class="val">—</div><div class="ess">Essai 1 sur 5</div></div><div class="pav">'+
    [1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>'<button'+(k==='OK'?' class="ok"':'')+'>'+k+'</button>').join('')+'</div>');
  const V=z.querySelector('.val'),E=z.querySelector('.ess');
  const gagne=await new Promise(fin=>{z.querySelectorAll('.pav button').forEach(bt=>bt.onclick=()=>{const k=bt.textContent;vib(6);SON.tic();
    if(k==='⌫'){val=val.slice(0,-1);}else if(k==='OK'){if(!val)return;const v=+val;ess++;
      if(v===prix){fin(ess);return;}
      if(v<prix){SON.plus();dire('« '+ALEA(['C’est PLUS !','Plus ! Plus !','C’est plus, voyons !'])+' »');pop('PLUS ↑','#5ad07a');}
      else{SON.moins();dire('« '+ALEA(['C’est MOINS !','Moins ! On n’est pas à Monaco !','Moins, moins !'])+' »');pop('MOINS ↓','#ff7a6a');}
      if(ess>=5){fin(0);return;}E.textContent='Essai '+(ess+1)+' sur 5'+(ess===3?' · le public souffle : « '+(v<prix?'PLUS':'MOINS')+' ! »':'');val='';}
    else if(val.length<3){val=(val+k).replace(/^0+/,'');}
    V.textContent=val||'—';});});
  V.textContent=prix+' €';
  if(gagne){bravo(ETAT.C[0],gains[gagne-1]);confettis(40);dire('« LE JUSTE PRIX ! '+prix+' euros ! En '+gagne+' essai'+(gagne>1?'s':'')+' : <b>+'+gains[gagne-1]+' points</b> ! »');}
  else{rate(ETAT.C[0],0);dire('« Perdu ! C’était <b>'+prix+' euros</b>. »<br><i>Gégé : « Moi j’aurais dit trois euros. Et encore, c’est cher. »</i>');}
  /* Gégé et Momo jouent aussi, en coulisses */
  await pause(2600);const g=ALEA([0,10,20,0]),m=ALEA([10,20,30,0]);ETAT.C[1].pts+=g;ETAT.C[2].pts+=m;
  dire('« Pendant ce temps, en coulisses : Gégé '+(g?'prend <b>+'+g+'</b>':'ne prend <b>rien</b>, il conteste encore')+', Momo '+(m?'prend <b>+'+m+'</b>':'ne prend <b>rien</b>')+'. »');
  zone('<button class="gros">Place à la finale !</button>');await attendreClic('.gros');}

/* ---------- FINALE : LA ROUE DU MISTRAL ---------- */
function roueDessin(cv,ang){const g=cv.getContext('2d'),S=cv.width,c=S/2,r=c-10,n=ROUE.length;g.clearRect(0,0,S,S);
  g.fillStyle='#ffd24a';g.beginPath();g.arc(c,c,r+8,0,7);g.fill();
  const t=performance.now()/180;for(let i=0;i<24;i++){const a=i/24*6.283;g.fillStyle=(i+(t|0))%2?'#fff6c8':'#a86a10';g.beginPath();g.arc(c+Math.cos(a)*(r+4),c+Math.sin(a)*(r+4),3.2,0,7);g.fill();}
  ROUE.forEach(([l,col],i)=>{const a0=ang+i/n*6.283-1.5708-3.1416/n,a1=a0+6.283/n;g.fillStyle=col;g.beginPath();g.moveTo(c,c);g.arc(c,c,r,a0,a1);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.stroke();g.save();g.translate(c,c);g.rotate((a0+a1)/2);g.fillStyle=(col==='#f6e27a'||col==='#f2b030')?'#3a2000':'#fff';
    g.font='900 '+(l.length>4?24:32)+'px "Baloo 2",system-ui,sans-serif';g.textAlign='right';g.textBaseline='middle';g.fillText(l,r-10,1);g.restore();});
  g.fillStyle='#1a1048';g.beginPath();g.arc(c,c,22,0,7);g.fill();g.fillStyle='#ffd24a';g.font='900 13px "Baloo 2",system-ui,sans-serif';g.textAlign='center';g.fillText('★',c,c+1);
  g.fillStyle='#fff';g.strokeStyle='#1a1048';g.lineWidth=3;g.beginPath();g.moveTo(c-13,4);g.lineTo(c+13,4);g.lineTo(c,28);g.closePath();g.stroke();g.fill();}
function tourner(cv,cible){return new Promise(ok=>{const n=ROUE.length,depart=cv._a||0,fin=Math.ceil(depart/6.283+3)*6.283+5*6.283-cible/n*6.283;const D=4200,t0=performance.now();let dernier=-1;
  (function f(){const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,4),a=depart+(fin-depart)*e;cv._a=a;roueDessin(cv,a);
    const s=Math.floor((a/6.283*n)+.5);if(s!==dernier){dernier=s;SON.tic();}if(k<1)requestAnimationFrame(f);else ok();})();});}
async function finale(){zone('');RAC.querySelector('.man').textContent='FINALE · LA ROUE DU MISTRAL';const C=ETAT.C;
  dire('« LA FINALE ! Chacun fait tourner <b>la roue du Mistral</b>. Jackpot, double… ou le mistral qui emporte tout ! »');
  const z=zone('<canvas class="roue" width="500" height="500"></canvas><button class="gros">Lancer la roue !</button>');
  const cv=z.querySelector('.roue');cv._a=0;roueDessin(cv,0);let vit=true;(function anim(){if(!vit||!RAC)return;roueDessin(cv,cv._a);requestAnimationFrame(anim);})();
  await attendreClic('.gros');z.querySelector('.gros').style.visibility='hidden';vit=false;
  for(const k of [0,1,2]){const p=C[k];if(k>0){dire('« À '+p.nom+' de tourner ! »');await pause(1200);}
    const cible=k===0&&C[0].pts<C[1].pts&&Math.random()<.4?2:(Math.random()*ROUE.length)|0;
    await tourner(cv,cible);const [l,,f,txt]=ROUE[cible];const av=p.pts;p.pts=Math.max(0,f(p.pts));const d=p.pts-av;
    if(d>0){bravo(p,0);p.pts=av+d;pop(l==='×2'?'×2 !':'+'+d);SON.bon();SON.applaudir(1.5);panneau('APPLAUDISSEZ');}
    else if(d<0){p.trem=performance.now()/1000+.7;SON.faux();panneau('OHHH…',1400);pop(l==='MISTRAL'?'🌬️ −'+(-d):'−'+(-d),'#ff7a6a');}
    p.buzz=performance.now()/1000+1;
    dire('« '+txt+' »'+(k===1&&d<0?'<br><i>Gégé : « C’est la roue qui est truquée ! »</i>':k===2&&d>0?'<br><i>Momo : « J’vous l’avais dit, j’suis béni ! »</i>':''),k===0?null:null);
    await pause(2600);}}

/* ---------- LE RÉSULTAT ---------- */
async function resultat(){const C=ETAT.C,cl=C.slice().sort((a,b)=>b.pts-a.pts),moi=C[0],rang=cl.indexOf(moi)+1;
  RAC.querySelector('.man').textContent='RÉSULTATS';SON.roulement(1.4);dire('« Et le grand gagnant du <b>Grand Mistral</b> est… »');await pause(1600);
  if(rang===1){SON.fanfare();setTimeout(()=>SON.applaudir(3),300);confettis(90);moi.saut=performance.now()/1000+2.5;panneau('APPLAUDISSEZ',3000);
    dire('« <b>'+moi.nom.toUpperCase()+'</b> !!! Avec '+moi.pts+' points ! Le public est debout, Gégé conteste déjà ! »');
    try{const n=+(localStorage.getItem('tv_victoires')||0)+1;localStorage.setItem('tv_victoires',n);localStorage.setItem('quai_une',JSON.stringify({titre:'« Un docker remporte Le Grand Mistral avec '+moi.pts+' points ! »',quand:Date.now()}));}catch(x){}}
  else{const g=cl[0];g.saut=performance.now()/1000+2;SON.applaudir(2);
    dire('« <b>'+g.nom.toUpperCase()+'</b>, avec '+g.pts+' points ! '+(g.nom==='Gégé'?'Il ne conteste plus, bizarrement.':'Momo danse sur son pupitre.')+' Tu finis '+(rang===2?'deuxième':'troisième')+' avec '+moi.pts+' points. Merci d’avoir joué ! »');}
  zone('<button class="gros">Rejouer</button><button class="gros b2">Quitter le plateau</button>');
  const i=await attendreClic('.gros');if(i===0){lancer();}else fermer();}

async function lancer(){ETAT={C:persos()};RAC.querySelector('.man').textContent='';
  SON.jingle();setTimeout(()=>SON.applaudir(2.2),500);panneau('APPLAUDISSEZ',2200);
  dire('« Bonsoir, bonsoir ! Bienvenue dans <b>LE GRAND MISTRAL</b>, le jeu où tout peut s’envoler ! Ce soir : '+ETAT.C[0].nom+', Gégé… et Momo ! »');
  zone('<button class="gros">C’est parti !</button>');await attendreClic('.gros');
  const dep=window.TVJ_DEPART||1;try{if(dep<=1)await mancheBuzzer();if(!RAC)return;if(dep<=2)await mancheJustePrix();if(!RAC)return;await finale();if(!RAC)return;await resultat();}catch(x){console.warn('TVJ',x);}}

function fermer(){try{const tb=document.getElementById('tvBan');if(tb)tb.style.visibility='';}catch(x){}if(!RAC)return;const R0=RAC;RAC=null;window.ECRAN_COUVRANT=false;R0.classList.remove('on');setTimeout(()=>R0.remove(),300);try{history.state&&history.state.tvj&&history.back();}catch(x){}if(FIN)FIN();}
window.ouvrirJeuTV=function(apres){if(RAC)return;FIN=apres||null;
  if(!document.getElementById('tvjCss')){const s=document.createElement('style');s.id='tvjCss';s.textContent=CSS;document.head.appendChild(s);}
  const d=document.createElement('div');d.id='tvj';RAC=d;
  d.innerHTML='<div class="bar"><div class="logo">LE GRAND MISTRAL<small>MISTRAL TV · STUDIO 1</small></div><span class="dir">● DIRECT</span><span class="sp"></span><button class="x" aria-label="Quitter">✕</button></div>'+
    '<div class="man"></div><canvas class="sc" width="180" height="134"></canvas><div class="pan">APPLAUDISSEZ</div><div class="bul"><canvas width="44" height="44"></canvas><div><span class="qui">NADIA</span><p></p></div></div><div class="zone"></div>';
  document.body.appendChild(d);SC=d.querySelector('canvas.sc');try{const tb=document.getElementById('tvBan');if(tb)tb.style.visibility='hidden';}catch(x){}requestAnimationFrame(()=>d.classList.add('on'));setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);
  d.querySelector('.x').onclick=()=>{vib(8);fermer();};
  try{history.pushState({tvj:1},'');addEventListener('popstate',function p(){removeEventListener('popstate',p);if(RAC===d){RAC=null;fermer.call(null);R0fix(d);}});}catch(x){}
  ETAT={C:persos()};peindre();lancer();};
function R0fix(d){try{const tb=document.getElementById('tvBan');if(tb)tb.style.visibility='';}catch(x){}window.ECRAN_COUVRANT=false;d.classList.remove('on');setTimeout(()=>d.remove(),300);if(FIN)FIN();}
})();
