#!/usr/bin/env node
/* ======================================================================
   LE GARDE-FOU DES ZONES DE CLIC
   ----------------------------------------------------------------------
   responsive.css pose une surface transparente a pointer-events:auto
   par-dessus chaque cible tactile trop petite, pour l'amener a 44 px.
   Sur un BOUTON, elle elargit ce qu'on touche. Sur un CONTENEUR, elle
   recouvre tout ce qu'il contient et avale chaque appui.

   C'est arrive : #bar .bt-corps, le cadre qui enveloppe le contenu du
   bar, avait ete pris pour une cible — son nom commence par .bt et sa
   hauteur calculee valait zero. Plus aucune categorie n'etait
   selectionnable dans le bar.

   Ce script relit responsive.css, retrouve chaque selecteur couvert,
   et refuse ceux qui sont poses sur autre chose qu'un <button> dans le
   markup. A lancer apres toute retouche de la feuille :
       node outils/verifier_zones.js
   ====================================================================== */
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..');

const css = fs.readFileSync(path.join(RACINE, 'responsive.css'), 'utf8');
const SOURCES = ['jeu.html', 'index.html', 'forge.html', 'complexe.html',
                 'ferme.html', 'foret.html', 'pokedock.js', 'port.js',
                 'personnage.js', 'maintenance.js', 'retour.js'];
const src = SOURCES
  .filter(f => fs.existsSync(path.join(RACINE, f)))
  .map(f => fs.readFileSync(path.join(RACINE, f), 'utf8')).join('\n');

/* les selecteurs qui recoivent une zone de clic */
const i = css.indexOf(':where(');
if (i < 0) { console.log('aucune zone de clic declaree.'); process.exit(0); }
const j = css.indexOf(') { position: relative; }', i);
const sels = css.slice(i + 7, j).split(',').map(s => s.trim()).filter(Boolean);

const fautes = [];
for (const sel of sels) {
  const dernier = sel.split(/\s+/).pop();
  if (/^button/.test(dernier)) continue;                 /* vrai bouton */
  const m = dernier.match(/^[.#]([A-Za-z0-9_-]+)/);
  if (!m) continue;
  const nom = m[1];
  const balises = new Set();
  for (const q of ['"', "'"]) {
    const re = new RegExp('<([a-z]+)[^>]*class=' + q + '[^' + q + ']*\\b'
                          + nom.replace(/[-]/g, '\\-') + '\\b', 'g');
    let r; while ((r = re.exec(src))) balises.add(r[1]);
  }
  if (!balises.size) continue;                           /* pose par le code */
  if (balises.has('button')) continue;                   /* c'est un bouton */

  /* UN <div> PEUT ETRE LA CIBLE LUI-MEME : les bulles du jeu a gratter
     portent data-z et se touchent directement, sans rien de cliquable
     dedans. Leur zone de clic est donc legitime. Ce qui ne l'est jamais,
     c'est un conteneur qui porte d'AUTRES cibles. */
  const AUTORISES = new Set(['bulle']);
  if (AUTORISES.has(nom)) continue;

  /* un conteneur souple qui porte d'autres choses : c'est le cas grave */
  const regle = new RegExp('[^{}]*\\.' + nom.replace(/[-]/g, '\\-') + '\\{([^}]*)\\}');
  const corps = (src.match(regle) || [, ''])[1];
  const souple = /display\s*:\s*(flex|grid)/.test(corps);
  fautes.push({ sel, balises: [...balises].join(','), souple });
}

if (!fautes.length) {
  console.log('zones de clic : ' + sels.length + ' selecteurs, tous sur des boutons.');
  process.exit(0);
}
console.log('ZONES DE CLIC POSEES SUR AUTRE CHOSE QU\'UN BOUTON :\n');
for (const f of fautes) {
  console.log('  ' + f.sel + '\n      pose sur <' + f.balises + '>'
    + (f.souple ? '  — CONTENEUR SOUPLE : il avale les appuis de ses enfants' : ''));
}
console.log('\nUn conteneur ne recoit jamais de zone de clic : elle recouvre');
console.log('tout ce qu\'il contient. Retire-le de responsive.css.');
process.exit(fautes.some(f => f.souple) ? 1 : 0);
