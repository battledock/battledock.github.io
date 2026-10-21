const { chromium } = require('/opt/npm-tools/node_modules/playwright-core');
const fs=require('fs');const D=process.argv[2];
const tuiles={};const CALLS=[];const BST={moutons:6,cochons:5,poids:450,poids_max:600,poids_bete:90,truffe_prete:true,truffe_dans:0,prix_cochon:52429,foin:0};const PSTATE={now:new Date().toISOString(),places:8,p:{niveau:2,poules:8,oeufs:29,grenier:1,nourri_jusqua:new Date(Date.now()-3600e3).toISOString(),oeufs_depuis:new Date().toISOString()}};const now=()=>new Date().toISOString();const MIN={radis:5,salade:15,carottes:30,tomates:60};
const MVV=process.argv[5]||'';(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
await ctx.addInitScript((mv)=>{window.__MV=mv;},MVV);await ctx.addInitScript(()=>{try{localStorage.setItem('bdl.annonce.pokedock','1');localStorage.setItem('bdl.annonce.perso','1');}catch(e){}});await ctx.addInitScript(()=>{try{localStorage.setItem('bdl.pix.v2',JSON.stringify({id:'jtest123',pseudo:'Test',carte:'extramar',cle:'k1',euros:500000,sac:{tomates:24,carottes:18,radis:9,ble:12},quand:Date.now()}));}catch(e){}});
await ctx.addInitScript(()=>{const off=new Date('2026-10-21T15:30:00').getTime()-Date.now();const D0=Date;const N=D0.now.bind(D0);class D extends D0{constructor(...a){if(a.length)super(...a);else super(N()+off);}static now(){return N()+off;}}window.Date=D;});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.text().startsWith('hwx'))errs.push(m.text());});
const pose=(c,r,cult,age,eau)=>{const m=(MIN[cult]||30)*60000;tuiles[c+','+r]=cult?{c,r,cult,t0:new Date(Date.now()-age*m).toISOString(),mur_a:new Date(Date.now()-age*m+m).toISOString(),eau}:{c,r,cult:null,eau:false};};
const parc=(i,j,cult,age,eau)=>{for(const[c,r] of [[2*i,2*j],[2*i+1,2*j],[2*i,2*j+1],[2*i+1,2*j+1]])pose(c,r,cult,age,eau);};
parc(0,0,'tomates',1.2,true);parc(1,0,'carottes',0.5,false);parc(2,0,null);parc(3,0,'radis',0.4,true);parc(4,0,'salade',0.8,false);parc(5,0,'tomates',1.1,true);
parc(0,1,'carottes',0.2,true);
await p.route('**/*',async r=>{const u=r.request().url();
if(u.includes('/jeu.html')){let s=fs.readFileSync('/home/claude/battledock.github.io/jeu.html','utf8');
    s=s.replace('</script>\n</body>','window.__tete=()=>{try{return teteDe({ap:e.ap,pseudo:e.pseudo}).toDataURL();}catch(x){return null;}};window.__EV=(q)=>eval(q);window.__setMin=(m)=>{MINUTE=m;MINUTE_QUAND=Date.now();if(window.__Q)try{QUALITE=window.__Q;}catch(x){}};window.__dbg=()=>({c:cielDuMoment(),reg:typeof REG!=="undefined"?REG.ciel:null,q:typeof QUALITE!=="undefined"?QUALITE:null});window.__J={get j(){return joueur},get CH(){return CH},fpEcran,fpX,fpY};</script>\n</body>');
    return r.fulfill({body:s,contentType:'text/html'});}
  if(u.includes('/rest/v1/rpc/')){const nom=u.split('/rpc/')[1];const body=JSON.parse(r.request().postData()||'{}');
    const meteo={saison:'automne',pluie:false};
    if(nom==='glacier_etat')return r.fulfill({contentType:'application/json',body:JSON.stringify({glace:null,halloween:true,now:new Date().toISOString()})});
    if(nom==='glacier_acheter')return r.fulfill({contentType:'application/json',body:JSON.stringify({euros:499500,prix:500,glace:{parfums:body.p_parfums,pot:body.p_pot,jusqua:new Date(Date.now()+600e3).toISOString()},now:new Date().toISOString()})});
    CALLS.push(nom);if(nom==='betes_etat')return r.fulfill({contentType:'application/json',body:JSON.stringify(BST)});if(nom==='betes_truffe'){BST.truffe_prete=false;BST.truffe_dans=8*3600;return r.fulfill({contentType:'application/json',body:JSON.stringify({trouve:true,etat:BST})});}if(nom==='etable_nourrir'){BST.foin=3*3600;return r.fulfill({contentType:'application/json',body:JSON.stringify({ok:1})});}if(nom==='poul_etat')return r.fulfill({contentType:'application/json',body:JSON.stringify(PSTATE)});
    if(nom==='poul_ramasser'){PSTATE.p.oeufs=0;return r.fulfill({contentType:'application/json',body:JSON.stringify({oeufs:29,or:0,sac:{oeufs:29},etat:PSTATE})});}
    if(nom==='poul_nourrir'){PSTATE.p.nourri_jusqua=new Date(Date.now()+4*3600e3).toISOString();return r.fulfill({contentType:'application/json',body:JSON.stringify(PSTATE)});}
    if(nom==='champ_etat')return r.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,max:40,now:now(),meteo,tuiles:Object.values(tuiles),debloque:[]})});
    if(nom==='champ_geste'){const k=body.p_c+','+body.p_r;let T=tuiles[k];const o=body.p_outil;
      if(o==='houe'&&!T)tuiles[k]=T={c:body.p_c,r:body.p_r,cult:null,eau:false};
      else if(o==='graine'&&T&&!T.cult){const m=(MIN[body.p_cult]||30)*60000*2;Object.assign(T,{cult:body.p_cult,t0:now(),mur_a:new Date(Date.now()+m).toISOString()});}
      else if(o==='eau'&&T)T.eau=true;
      else if(o==='faux'&&T&&T.cult)Object.assign(T,{cult:null,t0:null,mur_a:null,eau:false});
      return r.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,tuile:tuiles[k]||null,nb:o==='faux'?2:0,sac:o==='faux'?{tomates:2}:null,euros:490000})});}
    return r.fulfill({contentType:'application/json',body:'null'});}
  if(u.startsWith('http://127.0.0.1'))return r.continue();return r.abort();});
await p.goto('http://127.0.0.1:8897/jeu.html?carte=extramar');await p.waitForTimeout(8000);for(let q=0;q<4;q++){await p.evaluate(()=>{for(const b of document.querySelectorAll('button')){const t=b.textContent.trim();if(/^(Fermer|Compris|Plus tard|Non merci|OK)$/.test(t)&&b.offsetParent)b.click();}});await p.waitForTimeout(500);}await p.evaluate(()=>{document.querySelectorAll('body > div').forEach(d=>{const cs=getComputedStyle(d);if((+cs.zIndex||0)>=50&&cs.position==='fixed')d.remove();});});
await p.evaluate(()=>{const s=document.getElementById('bdSess');if(s)s.remove();});
await p.evaluate(()=>{const J=window.__J.j;J.x=340;J.y=545;J.dir='haut';});await p.waitForTimeout(1500);
await p.screenshot({path:D+'/p_1.png'});
const cdp=await ctx.newCDPSession(p);
const ec=(i,j,dx=20,dy=20)=>p.evaluate(([i,j,dx,dy])=>{const W=window.__J;return W.fpEcran(W.fpX(i)+dx,W.fpY(j)+dy);},[i,j,dx,dy]);
const T=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
const tap=async(x,y)=>{await T('touchStart',x,y);await p.waitForTimeout(60);await T('touchEnd');await p.waitForTimeout(400);};
const nbCult=(c)=>p.evaluate(c=>Object.values(window.__J.CH.t).filter(t=>t.cult===c).length,c);

const tapSel=async(sel)=>{const bb=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,on:e.className};},sel);if(!bb)return null;await tap(bb.x,bb.y);return bb;};
const aller=async(i,j)=>{await p.evaluate(([i,j])=>{const J=window.__J.j;J.x=230+i*40+20;J.y=440+j*40+52;J.dir='haut';},[i,j]);await p.waitForTimeout(500);};
const plaque=()=>p.evaluate(()=>{const a=document.getElementById('action');return a.classList.contains('on')?a.innerText.replace(/\n/g,' / '):'(éteinte)';});
const R={};const cdp2=await ctx.newCDPSession(p);const shot=async(n)=>{const r=await cdp2.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(D+'/'+n+'.png',Buffer.from(r.data,'base64'));};
R.lampes=1;await p.waitForTimeout(500);
await p.evaluate(()=>window.__EV('ouvrirLaBoutiqueFerme()'));await p.waitForTimeout(1500);await p.evaluate(()=>window.__EV('ouvrirLaBoutiqueFerme=function(){}'));
const css=fs.readFileSync(process.argv[3],'utf8');
await p.addScriptTag({content:fs.readFileSync(process.argv[4],'utf8')});
const vue=async(n,html,over)=>{await p.evaluate(([html,over,css])=>{if(!document.getElementById('cofCss')){const st=document.createElement('style');st.id='cofCss';st.textContent=css;document.head.appendChild(st);}
  document.querySelectorAll('.zouv').forEach(x=>x.remove());if(over){document.body.insertAdjacentHTML('beforeend',html);return;}
  const F=document.getElementById('page2Fond');F.className='bq mA niv';
  F.innerHTML='<div class="aTop"><div class="aTtl"><small>LE CARNET DU MARIN</small>Les récompenses</div><span class="aBourse">★ Niv. 14</span><button class="aX">✕</button></div>'+
  '<div class="bqOng">'+[['n','🏅','Niveaux'],['c','🎁','Coffres'],['p','⚓','Passe'],['t','🎖️','Titres']].map(([x,i,t])=>'<button class="'+(x==='c'?'on':'')+'"><i>'+i+'</i>'+t+'</button>').join('')+'</div>'+
  '<div class="aCarte"><div class="corps">'+html+'</div><div class="caisse"><div class="tot"><span>3 coffres à ouvrir</span><b>🎁 ×3</b></div><button class="go">TOUT OUVRIR !</button></div></div>';},[html,over,css]);await p.waitForTimeout(500);await shot(n);};
const K=await p.evaluate(()=>window.COFFRES);

const RR=(cl,col,nom,pc,items)=>'<div class="ktR"><i style="background:'+col+'">'+nom+'</i>'+pc+'<em>par objet tiré</em></div><div class="ktG">'+items.map(([ic,b,sm])=>'<div class="ktC '+cl+'"><div class="ic">'+ic+'</div><b>'+b+'</b><small>'+sm+'</small></div>').join('')+'</div>';
const cat='<div class="cfMot" style="margin-left:0">« Ce qu’il y a dans les coffres. Plus ton niveau monte, plus les quantités grossissent. »</div>'+
RR('','#9a8a6a','COMMUN','70 %',[['💶','Euros','200 à 800 € ×niv.'],['🌱','Graines','5 à 15'],['🪱','Appâts','10 à 30'],['🪵','Bois','20 à 60'],['🎰','Jetons','5 à 20'],['🧪','Engrais','1 parcelle ×2']])+
RR('kr','#2a7ad8','RARE','25 %',[['🍦','Glace','effet 10 min'],['🃏','Paquet','Pokédock'],['🌸','Graines rares','safran, lavande'],['💧','Arrosage','tout le champ'],['🎒','Grand sac','+10 places · 24 h'],['☕','Café','forêt ×2 · 15 min']])+
RR('ke','#8a3ad8','ÉPIQUE','4,5 %',[['🧢','Tenue','casquette, marinière…'],['🏎️','Kart','nouvelle couleur'],['🖼️','Cadre','de portrait'],['🕺','Emote','sur le quai'],['🪝','Appât doré','poissons rares · 30 min'],['✨','3 fragments','vers un légendaire']])+
RR('kl','#e8a020','LÉGENDAIRE','0,5 %',[['🎣','Canne dorée','mord +10 %'],['🪓','Hache d’or','1 coup de moins'],['👑','Tenue rare','unique au port'],['🛥️','Pointu','à ton ponton'],['🎒','Sac +5','pour toujours'],['💎','10 fragments','objet au choix']])+
'<div class="ktN">Le jeu ne te donne que ce qui te sert : pas de graines de safran si tu ne l’as pas débloqué. Une tenue que tu as déjà devient des fragments.</div>';
await vue('k1',cat);
await p.evaluate(()=>{document.querySelector('#page2Fond .corps').scrollTop=470;});await p.waitForTimeout(300);await shot('k2');
console.log('ok',errs.slice(0,3));await b.close();})();