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
    s=s.replace('</script>\n</body>','window.__tete=()=>{try{return teteDe({ap:e.ap,pseudo:e.pseudo}).toDataURL();}catch(x){return null;}};window.__setMin=(m)=>{MINUTE=m;MINUTE_QUAND=Date.now();if(window.__Q)try{QUALITE=window.__Q;}catch(x){}};window.__dbg=()=>({c:cielDuMoment(),reg:typeof REG!=="undefined"?REG.ciel:null,q:typeof QUALITE!=="undefined"?QUALITE:null});window.__J={get j(){return joueur},get CH(){return CH},fpEcran,fpX,fpY};</script>\n</body>');
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
R.lampes=await p.evaluate(()=>{window.__setMin(13*60);return 1;});
await p.evaluate(()=>{const J=window.__J.j;J.x=1230;J.y=260;J.dir='bas';});await p.waitForTimeout(2500);
const CSS=fs.readFileSync(process.argv[3],'utf8');
await p.evaluate(c=>{const s=document.createElement('style');s.textContent=c;document.head.appendChild(s);window.__H0=document.getElementById('haut').innerHTML;},CSS);
const tete=await p.evaluate(()=>window.__tete());console.log('tete',!!tete);
const sac='<span class="ic sac"><svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="3" y="5" width="10" height="9" fill="#b07a40"/><rect x="3" y="5" width="10" height="2" fill="#c8904e"/><rect x="5" y="2" width="6" height="3" fill="none" stroke="#7a4a20" stroke-width="1.4"/><rect x="7" y="8" width="2" height="2" fill="#e8c06a"/></svg></span>';
const piece='<span class="ic"><svg viewBox="0 0 16 16" shape-rendering="crispEdges"><circle cx="8" cy="8" r="6.5" fill="#e8c06a"/><circle cx="8" cy="8" r="4.5" fill="#f4d98a"/><rect x="7" y="4.5" width="2" height="7" fill="#8a6a2a"/></svg></span>';
const V={
D:`<div class="hD"><div class="carte"><div class="por"><img src="${tete}"><span class="niv">12</span></div><div class="id"><b>Eliasse</b><small>PATRON DU PORT</small><div class="xp">${'<i class="on"></i>'.repeat(12)}${'<i></i>'.repeat(8)}</div></div></div>
  <div class="res"><div class="eu">${piece}<b>5 000,00 €</b></div><div class="sa">${sac}<b>63<em>/60</em></b></div></div></div>`,
E:`<div class="hE"><div class="roue"><svg viewBox="0 0 84 84"><g stroke="#c08848" stroke-width="5.5" stroke-linecap="round">${[0,1,2,3,4,5,6,7].map(k=>{const a=k*Math.PI/4,x1=42+Math.cos(a)*24,y1=42+Math.sin(a)*24,x2=42+Math.cos(a)*40,y2=42+Math.sin(a)*40;return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;}).join('')}</g>
  <g fill="#e0a860" stroke="#5a3a1a" stroke-width="1.4">${[0,1,2,3,4,5,6,7].map(k=>{const a=k*Math.PI/4;return `<circle cx="${42+Math.cos(a)*38}" cy="${42+Math.sin(a)*38}" r="4"/>`;}).join('')}</g>
  <circle cx="42" cy="42" r="27" fill="none" stroke="#3a2614" stroke-width="7"/><circle cx="42" cy="42" r="27" fill="none" stroke="#f0c860" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="${2*Math.PI*27*.62} 999" transform="rotate(-90 42 42)"/>
  <circle cx="42" cy="42" r="22" fill="#16202a" stroke="#e8c06a" stroke-width="1.5"/></svg><img src="${tete}"><span class="ban">NIV. 12</span></div>
  <div class="fan"><div class="f">${piece}<b>5 000,00 €</b></div><div class="f">${sac}<b>63<em>/60</em></b></div></div></div>`,
F:`<div class="hF"><div class="g"><div class="por"><img src="${tete}"></div><div class="gem"><svg viewBox="0 0 30 34"><path d="M15 1 29 9v16l-14 8L1 25V9z" fill="url(#gg)" stroke="#fff3c8" stroke-width="1"/><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#e8b84a"/><stop offset="1" stop-color="#9a6a1a"/></linearGradient></defs></svg><b>12</b></div>
  <div class="nm"><b>Eliasse</b><small>1 240 / 2 000 XP</small></div><span class="sp"></span><div class="r">${sac}<b>63<em>/60</em></b></div><div class="r">${piece}<b>5 000,00 €</b></div>
  <div class="xpl"><i></i></div></div></div>`};
for(const k of ['D','E','F']){await p.evaluate(([h])=>{document.querySelectorAll('.hD,.hE,.hF').forEach(x=>x.remove());document.getElementById('haut').style.display='none';document.body.insertAdjacentHTML('beforeend',h);},[V[k]]);
  await p.waitForTimeout(400);await shot('lv'+k);}
console.log('ok',errs.slice(0,3));await b.close();})();