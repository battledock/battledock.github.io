/* Les salles : vue en coupe et améliorations. */

import { activeConfiserieSiBesoin, inaugurationConfiserie } from "./data/concessions.js";
import {
  AMELIORATIONS,
  CONSTRUCTION_SALLES,
  COUT_NETTOYAGE,
  TYPES_SALLES,
  apercuSalle,
  coutReparation,
  libelleRisque,
  niveauEquipement,
  obtenirBonusSalle,
  prochaineAmelioration,
  prochaineExtension
} from "./data/upgrades.js";
import { Etat, chargeCinema, fmtArgent } from "./game-state.js";
import { bobCompact, majHeaderArgent } from "./navigation.js";
import {
  accomplitMission,
  bulleXP,
  chargeProgression,
  debloque,
  infoNiveau,
  majBarreXPHeader,
  montreMonteeNiveau,
  niveauActuel,
  niveauDe,
  sonNiveau,
  synchroniseDeblocages
} from "./progression.js";
import { idOperation, messageErreur, rpc, sbFetch } from "./supabase-client.js";
import { echappe, texteSur } from "./ui/emblems.js";
import { icone } from "./ui/icons.js";
import { brancheZonesSalle, salleEnCoupe } from "./ui/room-view.js";

/* ============================================================
   SALLES — consultation, gestion, achats
   Toute la configuration vit dans ameliorations.js
   ============================================================ */
let salles = [];
let salleOuverte = null;
let achatEnCours = false;

async function initSalles(){
  await chargeSalles();
  if(salles.length === 0) await creePremiereSalle();
  Etat.salles = salles;
  rendListeSalles();
  bulleSalles(conseilSalles());
}

async function chargeSalles(){
  const d = await sbFetch(`salles?cinema_id=eq.${Etat.cinema.id}&select=*&order=cree_le`);
  salles = Array.isArray(d) ? d : [];
  Etat.salles = salles;
}

/* la salle 1 est créée par le serveur (fonction reparer_partie) */
async function creePremiereSalle(){
  try{ await rpc("reparer_partie", {p_cinema_id: Etat.cinema.id}); }catch(e){}
  await chargeSalles();
}

function bulleSalles(t){
  const z = document.getElementById("zoneBob");
  z.innerHTML = ""; z.appendChild(bobCompact(t));
}
function conseilSalles(){
  const sale = salles.find(s=>Number(s.proprete ?? 100) < 60);
  if(sale) return "Entre les rangs 3 et 4. Toujours. Je ne veux même plus savoir pourquoi.";
  const abime = salles.find(s=>Number(s.etat ?? 100) < 60);
  if(abime) return `${abime.nom} fatigue. Une réparation avant que quelque chose lâche en pleine séance ?`;
  const s = salles[0];
  if(s && niveauEquipement(s,"sieges") === 0) return "Les fauteuils datent de l'ouverture. Le 12 grince, les autres réfléchissent à le faire.";
  return "Belle salle. Presque trop belle pour le quartier. Presque.";
}

/* ============================================================
   LISTE DES SALLES
   ============================================================ */
/* On ne liste plus les salles : on en visite une, en coupe.
   Les onglets servent à passer de l'une à l'autre. */
let salleCourante = null;

function rendListeSalles(){
  if(!salles.length){ rendConstruction(); return; }
  if(!salleCourante || !salles.some(s=>String(s.id) === String(salleCourante)))
    salleCourante = salles[0].id;
  rendOngletsSalles();
  rendVueSalle();
  rendConstruction();
}

function rendOngletsSalles(){
  const el = document.getElementById("ongletsSalles");
  if(!el) return;
  el.innerHTML = salles.map(s=>`
    <button class="ongletSalle ${String(s.id)===String(salleCourante)?'actif':''}"
      role="tab" aria-selected="${String(s.id)===String(salleCourante)}"
      onclick="changeSalle('${s.id}')">
      ${icone("fauteuil")}<span class="osNom" data-t="${echappe(s.nom)}"></span>
      <small>${Number(s.capacite)||0} pl.</small>
    </button>`).join("");
  [...el.querySelectorAll(".osNom")].forEach(n=>texteSur(n, n.dataset.t));
}
function changeSalle(id){
  salleCourante = id;
  rendOngletsSalles();
  rendVueSalle();
}

function rendVueSalle(){
  const s = salles.find(x=>String(x.id) === String(salleCourante));
  if(!s) return;
  salleOuverte = s;
  const el = document.getElementById("vueSalle");
  el.innerHTML = salleEnCoupe(s);
  brancheZonesSalle(el, s);
  rendEtatSalle(s);
}

/* sous la salle : propreté, état, entretien — en langage clair */
function rendEtatSalle(s){
  const el = document.getElementById("etatSalle");
  const prop = Number(s.proprete ?? 100), etat = Number(s.etat ?? 100);
  const motProp = prop >= 85 ? "Impeccable" : prop >= 70 ? "Correcte"
                : prop >= 45 ? "Ça se voit un peu" : "Il faut passer le balai";
  const motEtat = etat >= 85 ? "Comme neuve" : etat >= 70 ? "Bon état"
                : etat >= 50 ? "Quelques grincements" : "Réparations nécessaires";
  el.innerHTML = `
    <div class="carteSecondaire">
      <h3>L'état de la salle</h3>
      <div class="ligneEtatSalle">
        <span>${icone("outil")} Propreté</span>
        <span class="etPiste"><i class="${prop>=70?'bon':prop>=45?'moyen':'mauvais'}"
          style="width:${prop}%"></i></span>
        <b>${motProp}</b>
      </div>
      <div class="ligneEtatSalle">
        <span>${icone("batiment")} Usure</span>
        <span class="etPiste"><i class="${etat>=70?'bon':etat>=50?'moyen':'mauvais'}"
          style="width:${etat}%"></i></span>
        <b>${motEtat}</b>
      </div>
      <div class="actionsEntretien">
        ${prop < 100 ? `<button class="btnMiniOr" onclick="entretien('proprete', 25, 'nettoyage_salle',
          'Sol lavé, fauteuils époussetés. Ça sent le propre.')">Nettoyer · ${fmtArgent(25)}</button>` : ""}
        ${etat < 100 ? `<button class="btnMiniGris" onclick="entretien('etat', 0, 'reparation_salle',
          'Les grincements ont disparu. Provisoirement.')">Réparer</button>` : ""}
        ${(s.extensions||0) < 3 ? `<button class="btnMiniGris" onclick="acheteExtension()">
          Agrandir</button>` : ""}
      </div>
    </div>`;
}


function ligneEquip(salle, cle){
  const n = niveauEquipement(salle, cle);
  const a = AMELIORATIONS[cle];
  return `<div class="eqLigne">
    ${icone(a.icone)}
    <span class="eqNom">${a.nom}</span>
    <span class="eqJauge">${[0,1,2,3].slice(1).map(i=>`<i class="${i<=n?'plein':''}"></i>`).join("")}</span>
    <span class="eqNiv">${n===0?"—":"niv "+n}</span>
  </div>`;
}

function carteSalle(s){
  const bonus = obtenirBonusSalle(s);
  const travaux = s.travaux_fin && new Date(s.travaux_fin).getTime() > Date.now();
  const type = TYPES_SALLES[s.type || "standard"];
  return `<section class="carteEcran carteSalle">
    <h2>${s.nom}<span class="capBadge">${icone("fauteuil")} ${s.capacite} places</span></h2>
    <div class="salleType">${type.nom}</div>
    ${travaux ? `<div class="bandeauTravaux">${icone("outil")} Travaux en cours — disponible au jour suivant</div>` : ""}
    <div class="apercuBoite">${apercuSalle(s)}</div>
    <div class="grilleEquip">
      ${Object.keys(AMELIORATIONS).map(cle=>ligneEquip(s, cle)).join("")}
    </div>
    <div class="etatSalle">
      <div class="etLigne"><span>Propreté</span>
        <span class="etPiste"><i class="${classeEtat(s.proprete)}" style="width:${Number(s.proprete ?? 100)}%"></i></span>
        <b>${Math.round(Number(s.proprete ?? 100))} %</b></div>
      <div class="etLigne"><span>État général</span>
        <span class="etPiste"><i class="${classeEtat(s.etat)}" style="width:${Number(s.etat ?? 100)}%"></i></span>
        <b>${Math.round(Number(s.etat ?? 100))} %</b></div>
    </div>
    <div class="resumeBonus">
      <span>${icone("etoile")} satisfaction <b>+${bonus.satisfaction}</b></span>
      <span>${icone("cloche")} incident <b>${libelleRisque(bonus.risqueIncident)}</b></span>
    </div>
    <button class="btnOr btnGerer" onclick="ouvreSalle('${s.id}')">Gérer la salle</button>
  </section>`;
}
function classeEtat(v){
  const n = Number(v ?? 100);
  return n >= 70 ? "bon" : n >= 40 ? "moyen" : "mauvais";
}

/* ============================================================
   CONSTRUCTION D'UNE NOUVELLE SALLE
   ============================================================ */
function rendConstruction(){
  const el = document.getElementById("zoneConstruction");
  const suivante = CONSTRUCTION_SALLES.find(c=>c.index === salles.length + 1);
  if(!suivante){ el.innerHTML = `<div class="notePied">Le bâtiment est plein. Pour l'instant…</div>`; return; }
  const ok = debloque(suivante.cleProgression);
  el.innerHTML = ok
    ? `<section class="carteEcran carteConstruction">
        <h2>Salle ${suivante.index}</h2>
        <div class="ligneRecit">${icone("batiment")}<span>Type standard · <b>${suivante.capacite} places</b> · travaux immédiats</span></div>
        <div class="ligneRecit">${icone("piece")}<span>Coût de construction : <b>${fmtArgent(suivante.cout)}</b></span></div>
        <button class="btnRouge btnConstruire" onclick="confirmeConstruction()">Construire la salle ${suivante.index}</button>
      </section>`
    : `<div class="notePied">Salle ${suivante.index} : débloquée au niveau ${niveauDe(suivante.cleProgression)}.</div>
       <div class="typesVerrouilles">
         ${Object.entries(TYPES_SALLES).filter(([k,t])=>t.niveauRequis>1).map(([k,t])=>`
           <div class="typeVerrou">${icone("porte")}<span><b>Salle ${t.nom.toLowerCase()}</b><small>${t.desc}</small></span>
           <span class="badgeNiv">NIV ${t.niveauRequis}</span></div>`).join("")}
       </div>`;
}

function confirmeConstruction(){
  const suivante = CONSTRUCTION_SALLES.find(c=>c.index === salles.length + 1);
  if(!suivante) return;
  ouvreConfirmation({
    titre:`Construire la salle ${suivante.index} ?`,
    ico:"batiment",
    texte:`Type standard, ${suivante.capacite} places. Les travaux sont menés dans la journée.`,
    cout:suivante.cout,
    valider:"Lancer le chantier",
    action:()=>construitSalle(suivante)
  });
}

async function construitSalle(cfg){
  if(achatEnCours) return;
  achatEnCours = true;
  const op = idOperation();
  try{
    const r = await rpc("construire_salle", {p_cinema_id: Etat.cinema.id, p_operation_id: op});
    if(!r?.success){
      const M = {INSUFFICIENT_FUNDS:"Les fauteuils sont d'accord pour être remplacés. La caisse, beaucoup moins.",
                 LEVEL_TOO_LOW:"La salle se débloque au niveau " + (r?.data?.requis || "?") + ".",
                 MAX_ROOMS:"Le bâtiment est plein."};
      bulleSalles(M[r?.code] || "Le chantier n'a pas démarré."); return;
    }
    await chargeCinema(true); await chargeSalles();
    majHeaderArgent(); rendListeSalles();
    if(r.data?.xp > 0) await afficheXpServeur(r.data.xp, "Nouvelle salle");
    cinematiqueNouvelleSalle(r.data.index);
  }catch(e){
    await chargeSalles(); rendListeSalles(); bulleSalles(messageErreur(e));
  }finally{ achatEnCours = false; }
}

function cinematiqueNouvelleSalle(index){
  const o = document.createElement("div");
  o.className = "voileNiveau";
  o.innerHTML = `
    <div class="carteNiveau palier">
      <div class="rayons"></div>
      <div class="niveauChiffre"><span>Salle ${index}</span><b>${icone("pellicule","icoGrandEcran")}</b></div>
      <div class="niveauTitre">Un nouvel écran s'allume</div>
      <div class="niveauCeremonie">Votre cinéma accueille une salle de plus</div>
      <div class="niveauBob">
        <span class="bobRond"><svg viewBox="30 40 60 60">
          <circle cx="60" cy="70" r="26" fill="#f0c9a0"/>
          <path d="M40 78 Q50 86 60 79 Q70 86 80 78 Q72 92 60 84 Q48 92 40 78" fill="#4a3527"/>
          <path d="M44 60 Q51 55 57 59 M63 59 Q69 55 76 60" stroke="#4a3527" stroke-width="4" fill="none" stroke-linecap="round"/>
          <circle cx="51" cy="66" r="2.6" fill="#1c1210"/><circle cx="69" cy="66" r="2.6" fill="#1c1210"/>
          <path d="M34 56 Q60 34 86 56 L86 50 Q60 28 34 50 Z" fill="#571520"/>
          <rect x="52" y="44" width="16" height="7" rx="2" fill="#e8b84b"/>
        </svg></span>
        <span class="bobDit">Deux projecteurs, deux salles et toujours un seul Bob. Il va falloir négocier. Ou trouver un stagiaire. Surtout un stagiaire.</span>
      </div>
      <button class="btnOr btnNiveau" onclick="this.closest('.voileNiveau').remove()">Continuer</button>
    </div>`;
  document.body.appendChild(o);
  if(typeof sonNiveau === "function") sonNiveau();
}

/* ============================================================
   PANNEAU DE GESTION D'UNE SALLE
   ============================================================ */
function ouvreSalle(id){
  salleOuverte = salles.find(s=>String(s.id)===String(id));
  if(!salleOuverte) return;
  afficheGestion();
}
function fermeGestion(){
  const o = document.getElementById("voileGestion");
  if(o){ o.classList.add("sortie"); setTimeout(()=>o.remove(), 260); }
  salleOuverte = null;
}

function afficheGestion(){
  const s = salleOuverte;
  const anciens = document.getElementById("voileGestion");
  if(anciens) anciens.remove();
  const bonus = obtenirBonusSalle(s);
  const type = TYPES_SALLES[s.type || "standard"];

  const o = document.createElement("div");
  o.className = "voilePanneau"; o.id = "voileGestion";
  o.innerHTML = `
    <div class="panneauSeance panneauSalle">
      <div class="pnEnteteSalle">
        <span class="pnTitre">${s.nom}</span>
        <span class="pnSous">${type.nom} · ${s.capacite} places</span>
        <button class="pnFermer" onclick="fermeGestion()" aria-label="Fermer">✕</button>
      </div>
      <div class="pnCorps">
        <div class="apercuBoite grand">${apercuSalle(s)}</div>

        <div class="valeurActuelle">
          <div><span>Capacité</span><b>${s.capacite}</b></div>
          <div><span>Satisfaction</span><b>+${bonus.satisfaction}</b></div>
          <div><span>Risque d'incident</span><b>${libelleRisque(bonus.risqueIncident)}</b></div>
        </div>

        <label class="lblProg">Entretien</label>
        <div class="entretienBloc">
          <div class="etLigne"><span>Propreté</span>
            <span class="etPiste"><i class="${classeEtat(s.proprete)}" style="width:${Number(s.proprete ?? 100)}%"></i></span>
            <b>${Math.round(Number(s.proprete ?? 100))} %</b></div>
          <button class="btnEntretien" ${Number(s.proprete??100)>=100?"disabled":""} onclick="confirmeNettoyage()">
            Nettoyer — ${fmtArgent(COUT_NETTOYAGE)}</button>
          <div class="etLigne"><span>État général</span>
            <span class="etPiste"><i class="${classeEtat(s.etat)}" style="width:${Number(s.etat ?? 100)}%"></i></span>
            <b>${Math.round(Number(s.etat ?? 100))} %</b></div>
          <button class="btnEntretien" ${Number(s.etat??100)>=100?"disabled":""} onclick="confirmeReparation()">
            Réparer — ${fmtArgent(coutReparation(s))}</button>
        </div>

        <label class="lblProg">Équipements</label>
        <div id="listeEquipements">${Object.keys(AMELIORATIONS).map(cle=>blocEquipement(s, cle)).join("")}</div>

        <label class="lblProg">Capacité</label>
        <div id="blocCapacite">${blocExtension(s)}</div>
      </div>
    </div>`;
  document.body.appendChild(o);
}

function blocEquipement(s, cle){
  const a = AMELIORATIONS[cle];
  const p = prochaineAmelioration(s, cle);
  const actuel = a.niveaux[p.actuel];

  let bas;
  if(p.raison === "max"){
    bas = `<div class="eqMax">${icone("etoile")} Niveau maximal atteint</div>`;
  }else if(p.raison === "niveau"){
    bas = `<div class="eqVerrou">
      <b>${p.prochain.nom}</b>
      <span>Verrouillé — disponible au niveau ${p.niveauRequis}</span>
    </div>`;
  }else{
    bas = `<div class="eqSuivant">
        <div class="eqSuivTitre">${p.prochain.nom}</div>
        <div class="eqSuivDesc">${p.prochain.desc}</div>
        <div class="eqCompare">
          <span>Avant : +${actuel.satisfaction} satisfaction</span>
          <span class="fleche">→</span>
          <span class="apres">Après : +${p.prochain.satisfaction} satisfaction</span>
        </div>
        ${p.prochain.prixAcceptable ? `<div class="eqPlus">Prix acceptable +${p.prochain.prixAcceptable} €</div>`:""}
        ${p.prochain.reputation ? `<div class="eqPlus">Réputation quotidienne +${p.prochain.reputation} possible</div>`:""}
        <button class="btnOr btnAmeliorer" onclick="confirmeAmelioration('${cle}')">
          Améliorer — ${fmtArgent(p.prochain.cout)}</button>
      </div>`;
  }

  return `<div class="blocEquip">
    <div class="beEntete">${icone(a.icone)}<span class="beNom">${a.nom}</span>
      <span class="beNiv">Niveau ${p.actuel}</span></div>
    <div class="beActuel">${actuel.nom} — <i>${actuel.desc}</i></div>
    ${bas}
  </div>`;
}

function blocExtension(s){
  const e = prochaineExtension(s);
  if(e.raison === "max") return `<div class="eqMax">${icone("etoile")} Toutes les extensions sont faites</div>`;
  if(e.raison === "capacite_max") return `<div class="eqVerrou"><b>Capacité maximale</b><span>Ce type de salle ne peut pas dépasser ${TYPES_SALLES[s.type||"standard"].capaciteMax} places.</span></div>`;
  if(e.raison === "niveau") return `<div class="eqVerrou"><b>Extension +${e.ext.places} places</b><span>Verrouillé — disponible au niveau ${e.niveauRequis}</span></div>`;
  return `<div class="eqSuivant">
    <div class="eqSuivTitre">Extension : +${e.ext.places} places</div>
    <div class="eqCompare"><span>Avant : ${s.capacite} places</span><span class="fleche">→</span>
      <span class="apres">Après : ${Number(s.capacite)+e.ext.places} places</span></div>
    <button class="btnOr btnAmeliorer" onclick="confirmeExtension()">Agrandir — ${fmtArgent(e.ext.cout)}</button>
  </div>`;
}

/* ============================================================
   CONFIRMATIONS ET ACHATS
   ============================================================ */
function ouvreConfirmation({titre, ico, texte, cout, effets, valider, action}){
  const solde = Number(Etat.cinema.argent);
  const apres = solde - cout;
  const assez = apres >= 0;
  const o = document.createElement("div");
  o.className = "voileConfirm";
  o.innerHTML = `
    <div class="carteConfirm">
      <div class="ccIco">${icone(ico || "piece","icoConfirm")}</div>
      <div class="ccTitre">${titre}</div>
      ${texte ? `<div class="ccTexte">${texte}</div>` : ""}
      ${effets ? `<div class="ccEffets">${effets}</div>` : ""}
      <div class="ccResume">
        <span>Coût : <b>${fmtArgent(cout)}</b></span>
        <span>Votre caisse après achat : <b class="${assez?'':'negatif'}">${fmtArgent(Math.max(0,apres))}</b></span>
      </div>
      ${assez ? "" : `<div class="ccAlerte">Les fauteuils sont d'accord pour être remplacés. La caisse, beaucoup moins.</div>`}
      <div class="ccBoutons">
        <button class="btnAnnuler" id="cAnnuler">Annuler</button>
        <button class="btnOr btnOuvrir" id="cValider" ${assez?"":"disabled"}>${valider}</button>
      </div>
    </div>`;
  document.body.appendChild(o);
  o.querySelector("#cAnnuler").onclick = ()=>{ o.classList.add("sortie"); setTimeout(()=>o.remove(),240); };
  o.querySelector("#cValider").onclick = async ()=>{
    const b = o.querySelector("#cValider");
    if(b.disabled) return;
    b.disabled = true; b.textContent = "Bob s'en occupe…";
    o.remove();
    await action();
  };
}

function confirmeAmelioration(cle){
  const s = salleOuverte;
  const p = prochaineAmelioration(s, cle);
  if(!p.possible) return;
  ouvreConfirmation({
    titre:p.prochain.nom, ico:AMELIORATIONS[cle].icone,
    texte:p.prochain.desc,
    effets:`+${p.prochain.satisfaction} satisfaction<br>Nouvelle apparence de la salle`,
    cout:p.prochain.cout, valider:"Commencer les travaux",
    action:()=>acheteAmelioration(cle)
  });
}

/* Achat officiel : le serveur lit le tarif, vérifie le niveau, débite,
   applique l'amélioration et attribue l'XP dans une seule transaction. */
async function acheteAmelioration(cle){
  if(achatEnCours) return;
  achatEnCours = true;
  const op = idOperation();
  try{
    const r = await rpc("acheter_amelioration", {
      p_salle_id: salleOuverte.id, p_equipement: cle, p_operation_id: op});
    if(!r?.success){
      const M = {
        INSUFFICIENT_FUNDS:"Les fauteuils sont d'accord pour être remplacés. La caisse, beaucoup moins.",
        LEVEL_TOO_LOW:"Il faut le niveau " + (r?.data?.requis || "?") + " pour cette amélioration.",
        MAX_LEVEL:"Déjà au maximum. On ne peut pas faire mieux."
      };
      bulleSalles(M[r?.code] || "La machine a toussé. Réessaie.");
      return;
    }
    await rafraichirApresAchat();
    if(r.data?.xp > 0) await afficheXpServeur(r.data.xp, AMELIORATIONS[cle].nom);
    bulleSalles(phraseAchat(cle));
    if(cle === "sieges" && r.data?.niveau === 1) await accomplitMission("m_sieges");
    if(cle === "ecran"  && r.data?.niveau === 1) await accomplitMission("m_ecran");
  }catch(e){
    await rafraichirApresAchat();
    bulleSalles(messageErreur(e));
  }finally{ achatEnCours = false; }
}

/* recharge l'état officiel puis redessine */
async function rafraichirApresAchat(){
  await chargeCinema(true);
  await chargeProgression(true);
  await chargeSalles();
  const s = salles.find(x=>String(x.id)===String(salleOuverte?.id));
  if(s) salleOuverte = s;
  majHeaderArgent(); majBarreXPHeader();
  rendListeSalles();
  if(document.getElementById("voileGestion") && salleOuverte) afficheGestion();
}

/* la montée de niveau est décidée par le serveur : on l'affiche a posteriori */
async function afficheXpServeur(montant, raison){
  const avant = niveauActuel();
  bulleXP(montant, raison);
  await chargeProgression(true);
  majBarreXPHeader();
  const apres = niveauActuel();
  for(let n = avant + 1; n <= apres; n++){
    await montreMonteeNiveau(infoNiveau(n));
    await synchroniseDeblocages().catch(()=>null);
    if(infoNiveau(n).recompenses.some(r=>r.cle === "confiserie")){
      const ouvert = await activeConfiserieSiBesoin();
      if(ouvert) inaugurationConfiserie();
    }
  }
}

const PHRASES_ACHAT = {
  sieges:"Regarde-moi ça ! On pourrait presque s'asseoir sans entendre un ressort supplier.",
  ecran:"L'image est tellement nette que j'ai enfin vu la poussière sur l'objectif.",
  son:"Le son ! Les voisins vont se plaindre. Signe de qualité.",
  climatisation:"On respire. Littéralement. J'avais oublié l'effet que ça faisait.",
  decoration:"Superbe. On dirait presque un cinéma de la capitale. Presque."
};
function phraseAchat(cle){ return PHRASES_ACHAT[cle] || "Travaux terminés, patron."; }

function confirmeExtension(){
  const e = prochaineExtension(salleOuverte);
  if(!e.possible) return;
  ouvreConfirmation({
    titre:`Extension : +${e.ext.places} places`, ico:"batiment",
    texte:"On pousse le mur du fond. Enfin, des ouvriers le poussent.",
    effets:`Capacité ${salleOuverte.capacite} → ${Number(salleOuverte.capacite)+e.ext.places} places`,
    cout:e.ext.cout, valider:"Lancer les travaux",
    action:acheteExtension
  });
}
async function acheteExtension(){
  if(achatEnCours) return;
  achatEnCours = true;
  const op = idOperation();
  try{
    const r = await rpc("acheter_extension", {p_salle_id: salleOuverte.id, p_operation_id: op});
    if(!r?.success){
      const M = {INSUFFICIENT_FUNDS:"Pas assez en caisse pour pousser les murs.",
                 LEVEL_TOO_LOW:"Extension disponible au niveau " + (r?.data?.requis || "?") + ".",
                 MAX_LEVEL:"Toutes les extensions sont faites."};
      bulleSalles(M[r?.code] || "La machine a toussé."); return;
    }
    await rafraichirApresAchat();
    if(r.data?.xp > 0) await afficheXpServeur(r.data.xp, "Première extension");
    bulleSalles("+" + r.data.places + " places. J'ai supervisé. De loin, mais j'ai supervisé.");
  }catch(e){
    await rafraichirApresAchat(); bulleSalles(messageErreur(e));
  }finally{ achatEnCours = false; }
}

/* ---------- entretien ---------- */
function confirmeNettoyage(){
  ouvreConfirmation({
    titre:"Nettoyer la salle", ico:"outil",
    texte:"Bob sort le grand balai. Et la serpillière du rang 3.",
    effets:"Propreté restaurée à 100 %",
    cout:COUT_NETTOYAGE, valider:"Nettoyer",
    action:()=>entretien("proprete", COUT_NETTOYAGE, "nettoyage_salle", "Impeccable. Enfin, sauf entre les rangs 3 et 4.")
  });
}
function confirmeReparation(){
  const c = coutReparation(salleOuverte);
  if(c <= 0) return;
  ouvreConfirmation({
    titre:"Réparer la salle", ico:"outil",
    texte:"Sièges, moquette, ampoules, tout ce qui pendouille.",
    effets:"État général restauré à 100 %",
    cout:c, valider:"Réparer",
    action:()=>entretien("etat", c, "reparation_salle", "Tout retient à nouveau. Ça se sentira dès la prochaine séance.")
  });
}
async function entretien(champ, cout, categorie, phrase){
  if(achatEnCours) return;
  achatEnCours = true;
  const type = categorie === "reparation_salle" ? "reparation" : "nettoyage";
  const op = idOperation();
  try{
    const r = await rpc("entretenir_salle", {
      p_salle_id: salleOuverte.id, p_type: type, p_operation_id: op});
    if(!r?.success){
      const M = {INSUFFICIENT_FUNDS:"Même le balai coûte de l'argent, patron.",
                 ALREADY_CLEAN:"La salle est déjà impeccable.",
                 ALREADY_REPAIRED:"Rien à réparer pour l'instant."};
      bulleSalles(M[r?.code] || "La machine a toussé."); return;
    }
    await rafraichirApresAchat();
    if(r.data?.xp > 0) await afficheXpServeur(r.data.xp, "Première réparation");
    bulleSalles(phrase);
  }catch(e){
    await rafraichirApresAchat(); bulleSalles(messageErreur(e));
  }finally{ achatEnCours = false; }
}

/* ---- exports ---- */
export {
  PHRASES_ACHAT,
  achatEnCours,
  acheteAmelioration,
  acheteExtension,
  afficheGestion,
  afficheXpServeur,
  blocEquipement,
  blocExtension,
  bulleSalles,
  carteSalle,
  changeSalle,
  chargeSalles,
  cinematiqueNouvelleSalle,
  classeEtat,
  confirmeAmelioration,
  confirmeConstruction,
  confirmeExtension,
  confirmeNettoyage,
  confirmeReparation,
  conseilSalles,
  construitSalle,
  creePremiereSalle,
  entretien,
  fermeGestion,
  initSalles,
  ligneEquip,
  ouvreConfirmation,
  ouvreSalle,
  phraseAchat,
  rafraichirApresAchat,
  rendConstruction,
  rendEtatSalle,
  rendListeSalles,
  rendOngletsSalles,
  rendVueSalle,
  salleCourante,
  salleOuverte,
  salles
};

/* ---- gestionnaires en attribut ---- */
/* Ces fonctions sont appelées depuis des attributs onclick écrits
   dans le HTML généré. Un module ES n'expose rien globalement :
   on les rend accessibles explicitement. */
Object.assign(window, {
  acheteExtension,
  changeSalle,
  confirmeAmelioration,
  confirmeConstruction,
  confirmeExtension,
  confirmeNettoyage,
  confirmeReparation,
  entretien,
  fermeGestion,
  ouvreSalle
});
