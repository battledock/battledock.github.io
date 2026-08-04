import { couleurSiegesCle } from "../data/customization.js";
import { AMELIORATIONS, niveauEquipement } from "../data/upgrades.js";
import { Etat, fmtArgent } from "../game-state.js";
import { niveauActuel } from "../progression.js";
import { acheteAmelioration, bulleSalles } from "../rooms.js";
import { echappe } from "./emblems.js";
import { icone } from "./icons.js";

/* ============================================================
   LA SALLE EN COUPE
   On n'ouvre plus une fiche : on entre dans la salle. L'écran,
   le projecteur, les fauteuils, la moquette et les enceintes
   sont les boutons. Chacun mène à son amélioration.
   ============================================================ */

const COULEURS_FAUTEUIL = {
  rouge:   {clair:"#c4404f", base:"#a82b3d", sombre:"#6e1424"},
  bordeaux:{clair:"#8c2438", base:"#6e1424", sombre:"#480d18"},
  bleu:    {clair:"#3c5090", base:"#2a3a6b", sombre:"#1a2648"},
  vert:    {clair:"#3a7a5c", base:"#2a5a42", sombre:"#1a3a2a"}
};

/* ------------------------------------------------------------
   Le dessin : tout dépend des niveaux réels de la salle
   ------------------------------------------------------------ */
function salleEnCoupe(salle){
  const nSieges = niveauEquipement(salle, "sieges");
  const nEcran  = niveauEquipement(salle, "ecran");
  const nSon    = niveauEquipement(salle, "son");
  const nDeco   = niveauEquipement(salle, "decoration");
  const nClim   = niveauEquipement(salle, "climatisation");
  const prop    = Number(salle.proprete ?? 100);
  const etat    = Number(salle.etat ?? 100);
  const cle     = (typeof couleurSiegesCle === "function") ? couleurSiegesCle() : "rouge";
  const F       = COULEURS_FAUTEUIL[cle] || COULEURS_FAUTEUIL.rouge;

  /* murs : plus la déco est haute, plus ils sont travaillés */
  const murs = [
    {fond:"#2e2028", moulure:0}, {fond:"#3a2430", moulure:1},
    {fond:"#43202e", moulure:2}, {fond:"#4a1c2c", moulure:3}
  ][nDeco];

  /* écran : taille et éclat selon le niveau */
  const ecranL = 176 + nEcran * 16;
  const ecranX = 215 - ecranL / 2;
  const ecranEclat = [0.55, 0.72, 0.86, 1][nEcran];

  /* rangées : le confort ajoute des accoudoirs et de la hauteur de dossier */
  const rangs = [
    {y:196, k:0.72, n:9,  o:.62},
    {y:222, k:0.85, n:8,  o:.78},
    {y:252, k:1.00, n:8,  o:.9},
    {y:288, k:1.18, n:7,  o:1}
  ];

  const tache = (x,y,r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*0.4}"
    fill="#2a1c10" opacity="${prop < 40 ? .3 : .16}"/>`;

  return `<svg viewBox="0 0 430 340" class="svgSalleCoupe" xmlns="http://www.w3.org/2000/svg"
    role="img" aria-label="Vue en coupe de ${echappe(salle.nom || "la salle")}">
  <defs>
    <linearGradient id="ecranG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff8e2"/><stop offset="1" stop-color="#d8c89a"/>
    </linearGradient>
    <linearGradient id="faisceauG" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ffe9b0" stop-opacity="0"/>
      <stop offset="1" stop-color="#ffe9b0" stop-opacity=".3"/>
    </linearGradient>
    <linearGradient id="murG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${murs.fond}"/><stop offset="1" stop-color="#1a1218"/>
    </linearGradient>
    <linearGradient id="solG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5c1a26"/><stop offset="1" stop-color="#3a0e18"/>
    </linearGradient>
  </defs>

  <rect width="430" height="340" fill="url(#murG)"/>

  <!-- moulures murales, elles arrivent avec la décoration -->
  ${murs.moulure >= 1 ? `<g stroke="#caa24a" stroke-width="1.4" opacity=".3" fill="none">
    <path d="M0 148 L430 148"/><path d="M0 158 L430 158"/></g>` : ""}
  ${murs.moulure >= 2 ? `<g fill="#caa24a" opacity=".22">
    ${[30,110,320,400].map(x=>`<rect x="${x}" y="164" width="10" height="60" rx="5"/>`).join("")}
  </g>` : ""}
  ${murs.moulure >= 3 ? `<g opacity=".3">
    ${[24,404].map(x=>`<path d="M${x} 160 q10 -18 20 0 l0 70 l-20 0 Z" fill="#8c2331"/>`).join("")}
  </g>` : ""}

  <!-- l'écran -->
  <g class="zoneSalle" data-cle="ecran" role="button" tabindex="0"
     aria-label="Écran — niveau ${nEcran} sur 3">
    <rect x="${ecranX - 7}" y="34" width="${ecranL + 14}" height="${88}" rx="3"
      fill="#0d0508" stroke="#caa24a" stroke-width="2.5"/>
    <rect x="${ecranX}" y="41" width="${ecranL}" height="74" rx="1"
      fill="url(#ecranG)" opacity="${ecranEclat}" class="ecranCoupe"/>
    ${nEcran >= 2 ? `<rect x="${ecranX}" y="41" width="${ecranL}" height="74"
      fill="#fff" opacity=".14" class="ecranHalo"/>` : ""}
    <!-- rideaux latéraux, ils s'ouvrent avec la déco -->
    <path d="M${ecranX - 9} 34 q-${14 + nDeco*4} 44 0 88 l-14 0 l0 -88 Z" fill="#7c1c2e"/>
    <path d="M${ecranX + ecranL + 9} 34 q${14 + nDeco*4} 44 0 88 l14 0 l0 -88 Z" fill="#7c1c2e"/>
  </g>

  <!-- le faisceau du projecteur -->
  <path d="M215 330 L${ecranX + 6} 118 L${ecranX + ecranL - 6} 118 Z"
    fill="url(#faisceauG)" class="faisceauCoupe" pointer-events="none"/>

  <!-- enceintes : leur nombre suit le niveau de son -->
  <g class="zoneSalle" data-cle="son" role="button" tabindex="0"
     aria-label="Son — niveau ${nSon} sur 3">
    ${[[16,150],[398,150]].concat(nSon >= 2 ? [[16,236],[398,236]] : [])
      .concat(nSon >= 3 ? [[16,296],[398,296]] : []).map(([x,y])=>`
      <g transform="translate(${x} ${y})">
        <rect x="-8" y="0" width="16" height="34" rx="2" fill="#1c1218" stroke="#4a3a2a" stroke-width="1.2"/>
        <circle cx="0" cy="10" r="4.6" fill="#2a2028" stroke="#5a4a38" stroke-width="1"/>
        <circle cx="0" cy="24" r="3" fill="#2a2028" stroke="#5a4a38" stroke-width="1"/>
        ${nSon >= 1 ? `<circle cx="0" cy="10" r="4.6" fill="#caa24a" opacity=".2" class="ondeSon"/>` : ""}
      </g>`).join("")}
  </g>

  <!-- climatisation, visible à partir du niveau 1 -->
  ${nClim >= 1 ? `<g class="zoneSalle" data-cle="climatisation" role="button" tabindex="0"
      aria-label="Climatisation — niveau ${nClim} sur 3" transform="translate(196 128)">
    <rect x="0" y="0" width="38" height="12" rx="2" fill="#2a2830" stroke="#4a4a52" stroke-width="1"/>
    ${[6,14,22,30].map(x=>`<line x1="${x}" y1="12" x2="${x-2}" y2="18"
      stroke="#8fb6d8" stroke-width="1.2" opacity=".5" class="souffle"/>`).join("")}
  </g>` : ""}

  <!-- la moquette -->
  <g class="zoneSalle" data-cle="decoration" role="button" tabindex="0"
     aria-label="Décoration — niveau ${nDeco} sur 3">
    <path d="M0 316 L430 316 L430 340 L0 340 Z" fill="url(#solG)"/>
    <path d="M188 196 L242 196 L268 340 L162 340 Z" fill="#8c1f2e" opacity=".7"/>
    ${nDeco >= 1 ? `<path d="M190 196 L166 340 M240 196 L264 340"
      stroke="#e8b84b" stroke-width="1.6" opacity=".55"/>` : ""}
    ${prop < 70 ? tache(96, 328, 22) + tache(336, 332, 18) : ""}
    ${prop < 40 ? tache(210, 336, 26) : ""}
  </g>

  <!-- les fauteuils : on peut toucher n'importe lequel -->
  <g class="zoneSalle groupeFauteuils" data-cle="sieges" role="button" tabindex="0"
     aria-label="Fauteuils — niveau ${nSieges} sur 3">
    ${rangs.map((r, ri) => `<g opacity="${r.o}">
      ${[...Array(r.n)].map((_,i)=>{
        const large = 396 / r.n;
        const x = 22 + i*large + large/2 + (ri%2 ? 5 : 0);
        return fauteuil(x, r.y, r.k * (0.86 + nSieges*0.05), F, nSieges, etat, (ri*7+i));
      }).join("")}
    </g>`).join("")}
  </g>

  <!-- le projecteur, en bas, face à l'écran -->
  <g class="zoneSalle" data-cle="projecteur" role="button" tabindex="0"
     aria-label="Cabine de projection" transform="translate(196 306)">
    <rect x="0" y="0" width="38" height="22" rx="3" fill="#241c22" stroke="#caa24a" stroke-width="1.6"/>
    <circle cx="19" cy="11" r="6" fill="#0d0508" stroke="#8a6c2a" stroke-width="1.4"/>
    <circle cx="19" cy="11" r="2.6" fill="#ffe9b0" class="lentille"/>
    <rect x="6" y="-7" width="9" height="8" rx="2" fill="#2e2630"/>
    <rect x="23" y="-7" width="9" height="8" rx="2" fill="#2e2630"/>
  </g>
</svg>`;
}

/* un fauteuil : dossier, assise, accoudoirs à partir du confort 1 */
function fauteuil(x, y, k, F, niveau, etat, idx){
  const casse = etat < 55 && (idx % 11 === 3);   /* un siège abîmé si la salle est fatiguée */
  const dossier = 13 + niveau * 1.6;
  return `<g transform="translate(${x.toFixed(1)} ${y}) scale(${k.toFixed(2)})"
    class="fauteuilCoupe ${casse ? 'casse' : ''}">
    ${niveau >= 1 ? `<rect x="-10.5" y="-${dossier - 3}" width="2.6" height="${dossier - 1}" rx="1.3" fill="${F.sombre}"/>
      <rect x="7.9" y="-${dossier - 3}" width="2.6" height="${dossier - 1}" rx="1.3" fill="${F.sombre}"/>` : ""}
    <path d="M-8 -${dossier} q8 -3 16 0 l0 ${dossier - 2} l-16 0 Z" fill="${casse ? "#6a5a52" : F.base}"/>
    <path d="M-8 -${dossier} q8 -3 16 0 l0 3 l-16 0 Z" fill="${F.clair}" opacity=".7"/>
    <rect x="-9" y="-3" width="18" height="5" rx="2" fill="${casse ? "#5a4a44" : F.clair}"/>
    ${niveau >= 3 ? `<rect x="-6" y="-${dossier - 4}" width="12" height="2" rx="1"
      fill="#e8b84b" opacity=".45"/>` : ""}
    ${casse ? `<path d="M-3 -${dossier - 4} l6 6 M3 -${dossier - 4} l-6 6"
      stroke="#3a2a22" stroke-width="1.2"/>` : ""}
  </g>`;
}

/* ------------------------------------------------------------
   L'interaction : chaque partie de la salle mène à son achat
   ------------------------------------------------------------ */
const NOMS_ZONES = {
  sieges:"Les fauteuils", ecran:"L'écran", son:"Le son",
  decoration:"La décoration", climatisation:"La climatisation",
  projecteur:"La cabine de projection"
};
const MOTS_ZONES = {
  sieges:"Les fauteuils d'origine ont vu passer deux générations. On peut les restaurer.",
  ecran:"L'écran, c'est ce que les gens regardent pendant deux heures. Autant qu'il soit propre.",
  son:"Le son porte l'émotion. Une enceinte de plus et la salle change d'échelle.",
  decoration:"Moquette, moulures, rideaux. Ça ne fait pas venir les gens, ça les fait revenir.",
  climatisation:"On ne remarque la clim que quand elle manque. Là, on la remarque beaucoup.",
  projecteur:"Ma cabine. N'y touche pas, elle a un caractère difficile."
};

function brancheZonesSalle(conteneur, salle){
  conteneur.querySelectorAll(".zoneSalle").forEach(z=>{
    const cle = z.dataset.cle;
    const declenche = ()=>{
      z.classList.add("touchee");
      setTimeout(()=>z.classList.remove("touchee"), 420);
      if(cle === "projecteur"){ bulleSalles(MOTS_ZONES.projecteur); return; }
      ouvrePanneauEquipement(cle, salle);
    };
    z.addEventListener("click", declenche);
    z.addEventListener("keydown", e=>{
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); declenche(); }
    });
  });
}

/* ------------------------------------------------------------
   Le panneau d'achat : avant / après, pas un pourcentage
   ------------------------------------------------------------ */
function ouvrePanneauEquipement(cle, salle){
  const conf = AMELIORATIONS[cle];
  if(!conf) return;
  const actuel = niveauEquipement(salle, cle);
  const suivant = actuel + 1;
  const palier = conf.niveaux ? conf.niveaux[suivant] : null;
  const niveauJoueur = (typeof niveauActuel === "function") ? niveauActuel() : 1;

  const o = document.createElement("div");
  o.className = "voilePanneau"; o.id = "voileEquip";
  o.innerHTML = `<div class="panneauSeance">
    <div class="pnEnteteSalle">
      <span class="pnTitre">${NOMS_ZONES[cle] || conf.nom}</span>
      <span class="pnSous">Niveau ${actuel} sur 3</span>
      <button class="pnFermer" onclick="fermeEquip()" aria-label="Fermer">✕</button>
    </div>
    <div class="pnCorps">
      <div class="motBob">${echappe(MOTS_ZONES[cle] || "")}</div>

      ${suivant > 3 ? `<div class="avantApres complet">
          <div class="aaVolet">
            <span class="aaEtiquette">Au maximum</span>
            ${apercuEquipement(cle, 3)}
          </div>
        </div>
        <div class="vide">Rien de plus à ajouter ici. C'est du beau travail.</div>`
      : `<div class="avantApres">
          <div class="aaVolet">
            <span class="aaEtiquette">Aujourd'hui</span>
            ${apercuEquipement(cle, actuel)}
            <span class="aaPalier">${echappe(palierNom(cle, actuel))}</span>
          </div>
          <div class="aaFleche">${icone("outil")}</div>
          <div class="aaVolet apres">
            <span class="aaEtiquette">Après travaux</span>
            ${apercuEquipement(cle, suivant)}
            <span class="aaPalier">${echappe(palierNom(cle, suivant))}</span>
          </div>
        </div>

        <div class="aaEffets">
          ${(palier?.effets || effetsLisibles(cle, suivant)).map(e=>
            `<div class="ligneRecit">${icone("etoile")}<span>${echappe(e)}</span></div>`).join("")}
        </div>

        ${palier && niveauJoueur < (palier.niveauJoueurRequis || 1)
          ? `<div class="ccAlerte">Disponible au niveau ${palier.niveauJoueurRequis}.</div>`
          : `<button class="btnRouge btnTravaux" onclick="lanceTravaux('${cle}', this)">
               Lancer les travaux · ${fmtArgent(palier?.cout || 0)}</button>`}
        <div class="dcCaisse">En caisse : ${fmtArgent(Etat.cinema.argent)}</div>`}
    </div>
  </div>`;
  document.body.appendChild(o);
}
function fermeEquip(){
  const o = document.getElementById("voileEquip");
  if(o){ o.classList.add("sortie"); setTimeout(()=>o.remove(), 260); }
}

async function lanceTravaux(cle, bouton){
  fermeEquip();
  if(typeof acheteAmelioration === "function") await acheteAmelioration(cle);
}

/* ------------------------------------------------------------
   Vignettes avant / après : le même objet à deux niveaux
   ------------------------------------------------------------ */
function apercuEquipement(cle, niveau){
  const cleC = (typeof couleurSiegesCle === "function") ? couleurSiegesCle() : "rouge";
  const F = COULEURS_FAUTEUIL[cleC] || COULEURS_FAUTEUIL.rouge;
  const N = Math.max(0, Math.min(3, niveau));
  let contenu = "";

  if(cle === "sieges"){
    contenu = `<rect width="120" height="90" fill="#2a1a22"/>
      ${[0,1,2].map(r=>`<g opacity="${.6 + r*.2}">
        ${[0,1,2].map(i=>fauteuil(24 + i*36, 34 + r*20, .9 + r*.16, F, N, 100, i)).join("")}
      </g>`).join("")}`;
  }
  else if(cle === "ecran"){
    const l = 62 + N*12, e = [0.4,0.6,0.8,1][N];
    contenu = `<rect width="120" height="90" fill="#1a1218"/>
      <rect x="${60 - l/2 - 4}" y="20" width="${l + 8}" height="${l*0.42 + 8}" rx="2"
        fill="#0d0508" stroke="#caa24a" stroke-width="1.6"/>
      <rect x="${60 - l/2}" y="24" width="${l}" height="${l*0.42}" fill="#fff8e2" opacity="${e}"/>
      ${N >= 2 ? `<ellipse cx="60" cy="${24 + l*0.21}" rx="${l*0.7}" ry="${l*0.4}"
        fill="#fff8e2" opacity=".12"/>` : ""}`;
  }
  else if(cle === "son"){
    contenu = `<rect width="120" height="90" fill="#1a1218"/>
      ${[[26,28],[94,28]].concat(N>=2?[[26,56],[94,56]]:[]).concat(N>=3?[[60,72]]:[])
        .map(([x,y])=>`<g transform="translate(${x} ${y})">
          <rect x="-9" y="-12" width="18" height="26" rx="2" fill="#241c22" stroke="#5a4a38" stroke-width="1.2"/>
          <circle cx="0" cy="-3" r="5" fill="#2a2028" stroke="#6a5a48" stroke-width="1"/>
          <circle cx="0" cy="8" r="3" fill="#2a2028"/>
          ${N>=1?`<circle cx="0" cy="-3" r="7" fill="none" stroke="#caa24a"
            stroke-width="1" opacity=".4"/>`:""}
        </g>`).join("")}`;
  }
  else if(cle === "decoration"){
    const murs = ["#2e2028","#3a2430","#43202e","#4a1c2c"][N];
    contenu = `<rect width="120" height="90" fill="${murs}"/>
      ${N>=1?`<g stroke="#caa24a" stroke-width="1" opacity=".4" fill="none">
        <path d="M0 26 L120 26"/><path d="M0 31 L120 31"/></g>`:""}
      ${N>=2?`<g fill="#caa24a" opacity=".25">
        <rect x="14" y="36" width="7" height="30" rx="3.5"/>
        <rect x="99" y="36" width="7" height="30" rx="3.5"/></g>`:""}
      ${N>=3?`<path d="M8 34 q8 -14 16 0 l0 34 l-16 0Z" fill="#8c2331" opacity=".55"/>
        <path d="M96 34 q8 -14 16 0 l0 34 l-16 0Z" fill="#8c2331" opacity=".55"/>`:""}
      <path d="M46 40 L74 40 L86 90 L34 90 Z" fill="#8c1f2e" opacity=".75"/>
      ${N>=1?`<path d="M48 40 L37 90 M72 40 L83 90" stroke="#e8b84b"
        stroke-width="1.2" opacity=".5"/>`:""}`;
  }
  else if(cle === "climatisation"){
    contenu = `<rect width="120" height="90" fill="#1f1a24"/>
      <rect x="38" y="22" width="44" height="14" rx="3" fill="#2a2830" stroke="#4a4a52" stroke-width="1.2"/>
      ${N >= 1 ? [...Array(N*2+1)].map((_,i)=>`<line x1="${44+i*7}" y1="36" x2="${40+i*7}" y2="${48+N*6}"
        stroke="#8fb6d8" stroke-width="1.4" opacity=".55"/>`).join("") : ""}
      <text x="60" y="80" text-anchor="middle" font-family="Courier New" font-size="9"
        fill="${N>=2?"#8fb6d8":"#5a5a62"}">${N === 0 ? "aucune" : N === 3 ? "silencieuse" : N + " / 3"}</text>`;
  }
  return `<svg viewBox="0 0 120 90" class="apercuEquip" xmlns="http://www.w3.org/2000/svg"
    role="img" aria-label="Aperçu niveau ${N}">${contenu}</svg>`;
}

function palierNom(cle, niveau){
  const P = {
    sieges:["Bois d'origine","Rembourrage neuf","Velours confortable","Fauteuils premium"],
    ecran:["Écran fatigué","Toile restaurée","Haute luminosité","Projection premium"],
    son:["Mono","Stéréo","Son immersif","Installation prestige"],
    decoration:["Murs nus","Moulures","Art déco","Décor prestige"],
    climatisation:["Aucune","Ventilation simple","Climatisation","Silencieuse"]
  };
  return (P[cle] || [])[Math.max(0, Math.min(3, niveau))] || "";
}
function effetsLisibles(cle, niveau){
  const E = {
    sieges:["Le public reste assis sans gigoter","Satisfaction en hausse"],
    ecran:["L'image gagne en éclat","Les spectateurs le remarquent"],
    son:["Le son remplit la salle","Les films d'action prennent de l'ampleur"],
    decoration:["La salle a du caractère","On la photographie en sortant"],
    climatisation:["Fini les manteaux gardés sur les genoux","Confort constant"]
  };
  return E[cle] || ["Amélioration de la salle"];
}

/* ---- exports ---- */
export {
  COULEURS_FAUTEUIL,
  MOTS_ZONES,
  NOMS_ZONES,
  apercuEquipement,
  brancheZonesSalle,
  effetsLisibles,
  fauteuil,
  fermeEquip,
  lanceTravaux,
  ouvrePanneauEquipement,
  palierNom,
  salleEnCoupe
};

/* ---- gestionnaires en attribut ---- */
/* Ces fonctions sont appelées depuis des attributs onclick écrits
   dans le HTML généré. Un module ES n'expose rien globalement :
   on les rend accessibles explicitement. */
Object.assign(window, {
  fermeEquip,
  lanceTravaux
});
