/* =====================================================================
   L'EMPREINTE DE CHAQUE FICHIER — à lancer AVANT CHAQUE DÉPLOIEMENT :

     node outils/empreintes.js

   POURQUOI. Toutes les adresses portaient le même numéro de version.
   Corriger une ligne de courses.js le changeait partout, et le
   téléphone retéléchargeait les 1,2 Mo compressés du jeu entier.

   CE QUE ÇA FAIT. Chaque .js et .css reçoit une empreinte de huit
   caractères, calculée sur son contenu. Le script la pose dans toutes
   les pages (?v=…) et dépose la table dans tete.js pour que
   chargerMorceau s'en serve aussi. Un fichier qui n'a pas bougé garde
   son empreinte : le navigateur le ressort de son cache. On ne
   retélécharge QUE ce qui a changé.

   MA_VERSION ne bouge pas de son rôle : elle reste le numéro de la
   livraison, celui qu'affichent les réglages et qui dit au jeu qu'une
   nouvelle version existe.
   ===================================================================== */
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const RACINE=path.resolve(__dirname,'..');
const empreinte=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0,8);

const fichiers=fs.readdirSync(RACINE)
  .filter(f=>/\.(js|css)$/.test(f))
  .filter(f=>fs.statSync(path.join(RACINE,f)).isFile());

/* 1. on grave la table dans tete.js (sans tete.js lui-même : son
      empreinte change à chaque fois, la page la porte pour lui) */
const table={};
for(const f of fichiers) if(f!=='tete.js') table[f]=empreinte(path.join(RACINE,f));

const TETE=path.join(RACINE,'tete.js');
let tete=fs.readFileSync(TETE,'utf8');
const bloc='/* ===== EMPREINTES (posées par outils/empreintes.js) ===== */\n'+
  'window.EMPREINTES='+JSON.stringify(table)+';\n'+
  '/* ===== fin des empreintes ===== */';
const marque=/\/\* ===== EMPREINTES[\s\S]*?\/\* ===== fin des empreintes ===== \*\//;
tete = marque.test(tete) ? tete.replace(marque,bloc) : (bloc+'\n'+tete);
fs.writeFileSync(TETE,tete);
table['tete.js']=empreinte(TETE);

/* 2. on pose l'empreinte dans les adresses des pages */
let touchees=0, poses=0;
for(const page of fs.readdirSync(RACINE).filter(f=>f.endsWith('.html'))){
  const P=path.join(RACINE,page);
  let h=fs.readFileSync(P,'utf8'), avant=h;
  h=h.replace(/(src|href)="([A-Za-z0-9_.-]+\.(?:js|css))\?v=[^"]*"/g,(m,a,f)=>
    table[f] ? (a+'="'+f+'?v='+table[f]+'"') : m);
  h=h.replace(/(src|href)="([A-Za-z0-9_.-]+\.(?:js|css))"/g,(m,a,f)=>
    table[f] ? (a+'="'+f+'?v='+table[f]+'"') : m);
  if(h!==avant){fs.writeFileSync(P,h);touchees++;}
  poses+=(h.match(/\?v=[0-9a-f]{8}"/g)||[]).length;
}

fs.writeFileSync(path.join(RACINE,'empreintes.json'),JSON.stringify(table,null,1));
console.log('empreintes : '+Object.keys(table).length+' fichiers · '+poses+' adresses dans '+touchees+' page(s)');
for(const f of Object.keys(table).sort()) console.log('  '+table[f]+'  '+f);
