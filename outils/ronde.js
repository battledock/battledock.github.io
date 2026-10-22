/* =====================================================================
   LA RONDE DES ÉCRANS — le filet à régressions.
   À lancer AVANT CHAQUE DÉPLOIEMENT, sur les trois cartes :

     python3 -m http.server 8897 &
     node outils/ronde.js extramar
     node outils/ronde.js village
     node outils/ronde.js foret

   Elle charge le jeu dans un téléphone simulé (390x844, tactile), ouvre
   une à une TOUTES les boutiques et tous les écrans, et vérifie pour
   chacun : aucune erreur JavaScript, l'écran s'ouvre vraiment, et il a
   des boutons vivants. Elle finit par un contrôle rapproché de La Marée
   — les prises du large doivent s'y afficher et s'y vendre.

   Sortie : une ligne par écran, « KO » devant ceux qui ne répondent pas,
   et une capture d'écran de chaque défaut dans _ronde/.
   Code de retour 1 s'il y a le moindre défaut.
   ===================================================================== */
/* LA RONDE DES ÉCRANS : on ouvre chaque boutique, on compte les erreurs,
   on vérifie qu'elle a bien des boutons vivants, et on referme. */
const { chromium } = require('/opt/npm-tools/node_modules/playwright-core');
const fs=require('fs');const D='/tmp/claude-0/-home-claude/7e1e28be-3e26-5156-8e62-df052db9c11e/scratchpad/c4/_ronde';
const CARTE=process.argv[2]||'extramar';
const ECRANS={
 extramar:[['La Marée','ouvrirLaMaree()'],['Boutique de pêche','ouvrirLaBoutiqueDePeche()'],
  ['Glacier','ouvrirLeGlacier()'],['Bar','ouvrirLeBar()'],['Salon','ouvrirLaMariniere()'],
  ['Capitainerie','afficheCapitainerie()'],['Cabanon','ouvrirLeCabanon()'],['Rade','ouvrirLaRade()'],
  ['Sac','ouvrirLeSac()'],['Carnet','ouvrirLeCarnet()'],['Classement','ouvrirLeClassement()'],
  ['Vestiaire','ouvrirLeVestiaire()'],['Courrier','ouvrirLaPoste()'],['Émotes','ouvrirEmotes(true)'],
  ['Mon niveau','ouvrirMonNiveau()'],['Réglages','ouvrirReglages()'],['Gazette','ouvrirLaGazette()'],
  ['Comptoir','ouvrirLeComptoir()'],['Cuisine de Fonfon','ouvrirLaCuisineDeFonfon()'],['Pétanque','ouvrirLaPetanque()']],
 village:[['Chez Madeleine','ouvrirLaBoutiqueFerme()'],['Grainetier','ouvrirLeGrainetier()'],
  ['Marché aux bêtes',"$('page2').classList.add('on');ouvrirLeMarcheAuxBetes()"],['Étable','ouvrirLEtable()'],['Fromagerie','ouvrirLaFromagerie()'],
  ['Four','ouvrirFour()'],['Établi','ouvrirEtabli()'],['Atelier','ouvrirLAtelier()'],['Sac','ouvrirLeSac()'],
  ['Carnet','ouvrirLeCarnet()'],['Classement','ouvrirLeClassement()'],['Vestiaire','ouvrirLeVestiaire()']],
 foret:[['Cabane','ouvrirLaCabane()'],['Étal du bois','ouvrirLEtalDuBois()'],['Grand chêne','ouvrirLeGrandChene()'],
  ['Sac','ouvrirLeSac()'],['Carnet','ouvrirLeCarnet()']]};
const SAC={sardine:6,rouget:3,dorade:2,thon:1,castagnole:4,mendole:5,palamide:2,baleinebleue:1,
 oursin:3,meduse:2,homard:1,corb:2,lac_gardon:4,gardon:3,bois:20,pierre:12,ble:30,tomates:10,
 laine:4,lait:3,oeufs:6,truffe:2,miel:3,botte:1,chaussette:2,canne_bambou:1,pioche:1,hache:1};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
await ctx.addInitScript((sac)=>{try{localStorage.setItem('bdl.annonce.pokedock','1');localStorage.setItem('bdl.annonce.perso','1');
 localStorage.setItem('bdl.pix.v2',JSON.stringify({id:'jtest123',pseudo:'Eliasse',carte:'extramar',cle:'k1',euros:900000,sac,quand:Date.now()}));}catch(e){}},SAC);
const p=await ctx.newPage();let errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
await p.route('**/*',async r=>{const u=r.request().url();
 if(u.includes('/moteur.js')){let t=fs.readFileSync('/home/claude/battledock.github.io/moteur.js','utf8');
  t+='\nwindow.__EV=(q)=>eval(q);';return r.fulfill({body:t,contentType:'application/javascript'});}
 if(u.includes('/rest/v1/rpc/')){const nom=u.split('/rpc/')[1].split('?')[0];let out={};
  if(nom==='prix_des_prises'){const c=JSON.parse(r.request().postData()||'{}');out={};
    (c.p_types||[]).forEach(k=>{out[k]=({castagnole:120,mendole:110,palamide:1600,baleinebleue:260000,oursin:300,meduse:1200,homard:4200,corb:900})[k]||0;});}
  else if(nom==='champ_etat')out={ok:true,max:208,now:new Date().toISOString(),meteo:{saison:'automne'},tuiles:[],debloque:[],offertes:{}};
  else if(nom==='pot_etat')out={pots:[],charge:true,nb:0,max:6,now:new Date().toISOString()};
  else if(nom==='verger_etat')out={arbres:[],now:new Date().toISOString()};
  else if(nom==='large_etat')out={bateau:true,large:true,euros:900000};
  else if(/liste|fils|classement|records|cours/.test(nom))out=[];
  return r.fulfill({contentType:'application/json',body:JSON.stringify(out)});}
 if(u.startsWith('http://127.0.0.1'))return r.continue();return r.abort();});
await p.goto('http://127.0.0.1:8897/jeu.html?carte='+CARTE);
await p.waitForTimeout(9500);
for(let q=0;q<4;q++){await p.evaluate(()=>{for(const x of document.querySelectorAll('button')){const t=(x.textContent||'').trim();
 if(/^(Fermer|Compris|Plus tard|Non merci|OK)$/.test(t)&&x.offsetParent)x.click();}});await p.waitForTimeout(300);}
await p.evaluate(()=>{const s=document.getElementById('bdSess');if(s)s.remove();});
try{fs.mkdirSync(D,{recursive:true});}catch(e){}
const cdp=await ctx.newCDPSession(p);
let ko=0;
for(const [nom,appel] of (ECRANS[CARTE]||[])){
  errs=[];
  const r=await p.evaluate(a=>{try{window.__EV(a);return 'ok';}catch(e){return 'ERR '+e.message;}},appel);
  await p.waitForTimeout(2400);
  const vu=await p.evaluate(()=>{
    const z=[...document.querySelectorAll('#page2.on, #pan.on, #carnetP.on, #catalogue.on, #crs.on, #petanque.on, #emPan.on, #enLigne.on, .ecran.on')];
    const racine=z.length?z[0]:null;
    if(!racine)return {ouvert:false};
    const bt=[...racine.querySelectorAll('button,[data-v],[data-a],[data-o],.carte')].filter(e=>e.offsetParent);
    return {ouvert:true,boutons:bt.length,texte:(racine.innerText||'').replace(/\n+/g,' · ').slice(0,90)};});
  const etat=(r!=='ok')?r:(!vu.ouvert?'PAS OUVERT':(vu.boutons<1?'AUCUN BOUTON':'ok '+vu.boutons+' boutons'));
  if(!/^ok/.test(etat)||errs.length)ko++;
  console.log((/^ok/.test(etat)&&!errs.length?'  ':'KO').padEnd(3)+nom.padEnd(20)+etat.padEnd(22)+(errs.length?'ERREURS: '+errs.slice(0,2).join(' | '):''));
  if(!/^ok/.test(etat)||errs.length){const s=await cdp.send('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(D+'/ko_'+nom.replace(/[^a-z]/gi,'')+'.png',Buffer.from(s.data,'base64'));}
  await p.evaluate(()=>{try{window.__EV("$('page2').classList.remove('on')");}catch(e){}
    for(const sel of ['#pan','#carnetP','#catalogue','#crs','#petanque'])
      {const el=document.querySelector(sel);if(el)el.classList.remove('on');}
    try{window.__EV('fermeA=0');}catch(e){}});
  await p.waitForTimeout(350);
}
/* LA MARÉE DE PRÈS : les prises du large doivent s'y vendre */
if(CARTE==='extramar'){
  await p.evaluate(()=>{try{window.__EV('ouvrirLaMaree()');}catch(e){}});
  await p.waitForTimeout(1600);
  const m=await p.evaluate(()=>{
    const c=document.getElementById('marCorps');if(!c)return {err:'pas de panneau'};
    const cartes=[...c.querySelectorAll('.carte')].map(e=>e.dataset.k);
    return {cartes,prix:window.__EV('[PRIX_POISSON.castagnole||0,PRIX_POISSON.baleinebleue||0]')};});
  console.log('');
  console.log('La Marée · cartes :',(m.cartes||[]).join(', ')||m.err);
  console.log('La Marée · prix castagnole / baleine :',(m.prix||[]).join(' / '));
  const v=await p.evaluate(()=>{const c=document.getElementById('marCorps');
    const e=c&&c.querySelector('.carte[data-k=castagnole]');if(!e)return 'pas de castagnole';
    e.click();const b=document.getElementById('marVendre');return b?b.textContent:'pas de bouton';});
  console.log('La Marée · après un doigt sur la castagnole :',v);
  if(!/\d/.test(String(v)))ko++;
}
console.log(ko?('>>> '+ko+' écran(s) en défaut'):'>>> tous les écrans répondent');
await b.close();process.exit(ko?1:0);})();
