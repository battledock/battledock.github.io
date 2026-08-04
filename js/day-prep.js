import { ouvreCinema } from "./engine/day.js";
import { Etat, fmtArgent } from "./game-state.js";
import { toastSocial } from "./social.js";
import { appelSecurise, idOperation, messageErreur, rpc } from "./supabase-client.js";
import { echappe, texteSur } from "./ui/emblems.js";
import { icone } from "./ui/icons.js";

/* ============================================================
   LA PRÉPARATION DU MATIN
   Un écran, quatre temps : le journal, les réservations, le
   dossier du jour, le résumé. Tout vient du serveur — le client
   n'invente aucun chiffre et ne décide d'aucune option.
   ============================================================ */

let prep = null;          /* la réponse de preparer_journee */
let etape = "briefing";   /* briefing · previsions · dossier · resume */

async function initPreparation(){
  await chargePreparation();
}

async function chargePreparation(){
  const zone = document.getElementById("zonePrep");
  try{
    const r = await rpc("preparer_journee", {p_cinema_id: Etat.cinema.id});
    if(!r || r.success === false){
      /* journée déjà lancée ou terminée : on renvoie où il faut */
      zone.innerHTML = `<div class="prepRefus">
        <p>${echappe(r?.message || "Cette journée n'est plus en préparation.")}</p>
        <button class="btnOrProg" onclick="location.href='${
          r?.data?.statut === 'running' ? 'bilan.html' : 'jeu.html'}'">
          ${r?.data?.statut === 'running' ? 'Voir le bilan' : 'Retour au cinéma'}</button>
      </div>`;
      return;
    }
    prep = r.data;
    rendEtape();
  }catch(e){
    console.error("[Rex] préparation", e);
    zone.innerHTML = `<div class="prepRefus"><p>${echappe(messageErreur(e))}</p>
      <button class="btnVideProg" onclick="chargePreparation()">Réessayer</button></div>`;
  }
}

/* ------------------------------------------------------------
   L'enchaînement : on n'avance que d'un écran à la fois
   ------------------------------------------------------------ */
function rendEtape(){
  majFilAriane();
  if(etape === "briefing")   return rendBriefing();
  if(etape === "previsions") return rendPrevisions();
  if(etape === "dossier")    return rendDossier();
  return rendResume();
}

function vaA(e){ etape = e; rendEtape(); window.scrollTo({top:0, behavior:"smooth"}); }

function majFilAriane(){
  const ordre = ["briefing","previsions","dossier","resume"];
  const el = document.getElementById("filAriane");
  if(!el) return;
  const i = ordre.indexOf(etape);
  el.innerHTML = ordre.map((o,k)=>`<span class="faPoint ${k<=i?'fait':''} ${k===i?'ici':''}"></span>`).join("");
}

/* ------------------------------------------------------------
   1. LE JOURNAL DU MATIN
   ------------------------------------------------------------ */
function rendBriefing(){
  const lignes = prep.lignes || [];
  document.getElementById("zonePrep").innerHTML = `
    <div class="journalMatin">
      <div class="jmEntete">
        <span class="jmJour">Jour ${prep.jour}</span>
        <span class="jmStyle">${echappe(prep.memoire?.style_nom || "")}</span>
      </div>
      <div class="jmBob">
        <div class="jmTete">${teteBob()}</div>
        <p class="jmSalut" id="jmSalut"></p>
      </div>
      <ul class="jmLignes">
        ${lignes.map((l,i)=>`
          <li class="jmLigne" style="animation-delay:${(i*0.09).toFixed(2)}s"
              onclick="this.classList.toggle('ouverte')">
            ${icone(l.icone || "etoile")}
            <span><b>${echappe(l.texte)}</b><small>${echappe(l.detail || "")}</small></span>
          </li>`).join("")}
      </ul>
    </div>
    <button class="btnOrProg btnEtape" onclick="vaA('previsions')">
      Voir les réservations</button>`;
  texteSur(document.getElementById("jmSalut"), prep.salutation || "");
}

/* ------------------------------------------------------------
   2. LES RÉSERVATIONS PRÉVISIONNELLES
   ------------------------------------------------------------ */
function rendPrevisions(){
  const p = prep.previsions || [];
  const suite = prep.situation && prep.situation.statut === "en_attente" ? "dossier" : "resume";

  document.getElementById("zonePrep").innerHTML = `
    <div class="panneauResa">
      <div class="prEntete">
        <span>Réservations attendues</span>
        <b>${prep.total_bas} à ${prep.total_haut}</b>
      </div>
      ${p.length === 0 ? `
        <div class="videProg">Aucune séance au programme.<br>
          <small>Sans programme, il n'y a rien à ouvrir.</small></div>
        <button class="btnVideProg" onclick="location.href='programmation.html'">
          Programmer une séance</button>`
      : p.map(s=>ligneResa(s)).join("") + `
        <div class="prTotaux">
          <span>Licences <b>${fmtArgent(prep.cout_licences)}</b></span>
          <span>Recette estimée <b>${fmtArgent(prep.recette_estimee)}</b></span>
          <span class="${Number(prep.benefice_estime) < 0 ? 'negatif' : ''}">
            Bénéfice <b>${fmtArgent(prep.benefice_estime)}</b></span>
        </div>`}
    </div>
    ${p.length ? `<button class="btnOrProg btnEtape" onclick="vaA('${suite}')">
      ${suite === "dossier" ? "Un dossier attend" : "Voir le résumé"}</button>` : ""}
    <button class="btnVideProg btnEtape" onclick="vaA('briefing')">Revenir au journal</button>`;
}

function ligneResa(s){
  const taux = Number(s.taux_estime) || 0;
  const plus = (s.facteurs || []).filter(f=>f.signe === "+").slice(0, 2);
  const moins = (s.facteurs || []).filter(f=>f.signe === "-").slice(0, 2);
  return `<div class="ligneResa" onclick="this.classList.toggle('ouverte')">
    <div class="lrHaut">
      <span class="lrHeure">${echappe(s.heure)}</span>
      <span class="lrTitre"><b>${echappe(s.titre)}</b>
        <small>${echappe(s.salle || "")} · ${fmtArgent(s.prix)}</small></span>
      <span class="lrChiffre ${classeTendance(s.tendance)}">
        <b>${s.prevision_basse}–${s.prevision_haute}</b>
        <small>sur ${s.capacite}</small></span>
    </div>
    <div class="lrJauge"><i class="${classeTendance(s.tendance)}"
      style="width:${Math.min(100, taux)}%"></i></div>
    <div class="lrRaisons">
      ${plus.map(f=>`<span class="rPlus">+ ${echappe(f.texte)}</span>`).join("")}
      ${moins.map(f=>`<span class="rMoins">− ${echappe(f.texte)}</span>`).join("")}
      ${plus.length + moins.length === 0 ? `<span class="rNeutre">Rien de marquant</span>` : ""}
    </div>
  </div>`;
}

function classeTendance(t){
  if(t === "excellente" || t === "bonne") return "haut";
  if(t === "correcte") return "moyen";
  return "bas";
}

/* ------------------------------------------------------------
   3. LE DOSSIER DU JOUR
   ------------------------------------------------------------ */
function rendDossier(){
  const s = prep.situation;
  if(!s){ return vaA("resume"); }

  if(s.statut !== "en_attente"){
    document.getElementById("zonePrep").innerHTML = `
      <div class="dossier resolu">
        <div class="doEtiquette">Dossier classé</div>
        <h2>${echappe(s.titre || "")}</h2>
        <p class="doResume">${echappe(s.resultat?.resume || "Décision prise.")}</p>
        ${(s.resultat?.effets || []).map(e=>`<div class="doEffet">${icone("etoile")}
          <span>${echappe(e)}</span></div>`).join("")}
      </div>
      <button class="btnOrProg btnEtape" onclick="vaA('resume')">Continuer</button>`;
    return;
  }

  document.getElementById("zonePrep").innerHTML = `
    <div class="dossier">
      <div class="doEtiquette">${echappe(etiquetteCategorie(s.categorie))}</div>
      <h2 id="doTitre"></h2>
      <p class="doRecit" id="doRecit"></p>
      <div class="doBob">
        <span class="doTete">${teteBob()}</span>
        <span id="doBobMot"></span>
      </div>
      <div class="doOptions">
        ${(s.options || []).map(o=>`
          <button class="doOption" onclick="choisitOption('${echappe(o.cle)}')">
            <b>${echappe(o.titre)}</b>
            ${(o.effets || []).map(e=>`<span>${echappe(e)}</span>`).join("")}
            ${Number(o.cout) > 0 ? `<em>Coûte ${fmtArgent(o.cout)}</em>` : ""}
          </button>`).join("")}
      </div>
      <button class="doPlusTard" onclick="ignoreDossier()">Décider plus tard</button>
    </div>`;
  texteSur(document.getElementById("doTitre"), s.titre || "");
  texteSur(document.getElementById("doRecit"), s.recit || "");
  texteSur(document.getElementById("doBobMot"), s.bob || "");
}

function etiquetteCategorie(c){
  return {routine:"Le quotidien", opportunite:"Une occasion", dilemme:"Un choix difficile",
          incident:"Un ennui", exceptionnel:"C'est rare"}[c] || "Dossier du jour";
}

async function choisitOption(cle){
  const zone = document.querySelector(".doOptions");
  if(zone) zone.classList.add("enCours");

  /* appelSecurise attend une FONCTION à exécuter, pas un nom de RPC.
     L'identifiant d'opération rend l'appel rejouable sans double effet. */
  const appel = await appelSecurise(
    () => rpc("resolve_daily_situation", {
      p_situation_id: prep.situation.id,
      p_option_key: cle,
      p_operation_id: idOperation()
    }),
    {rechargeApresErreur: false}
  );

  if(zone) zone.classList.remove("enCours");

  /* deux niveaux d'échec : le réseau, puis le refus du serveur */
  if(!appel.ok){
    montreEchec(appel.message || "La connexion a lâché. Réessaie.");
    return;
  }
  const r = appel.data;
  if(!r || r.success !== true){
    montreEchec(r?.message || "Ce choix n'a pas pu être appliqué.");
    await chargePreparation();   /* l'état a changé : on repart du serveur */
    etape = "dossier"; rendEtape();
    return;
  }

  await chargePreparation();
  etape = "dossier";
  rendEtape();
}

/* un refus doit se voir : le bandeau reste jusqu'au prochain écran */
function montreEchec(message){
  const d = document.querySelector(".dossier");
  if(!d){ if(typeof toastSocial === "function") toastSocial(message, "cloche"); return; }
  let b = d.querySelector(".doEchec");
  if(!b){
    b = document.createElement("div");
    b.className = "doEchec";
    d.insertBefore(b, d.querySelector(".doOptions"));
  }
  b.textContent = message;
  b.scrollIntoView({behavior:"smooth", block:"center"});
}

async function ignoreDossier(){
  const appel = await appelSecurise(
    () => rpc("ignorer_situation", {p_situation_id: prep.situation.id}),
    {rechargeApresErreur: false});
  if(!appel.ok){ montreEchec(appel.message); return; }
  await chargePreparation();
  vaA("resume");
}

/* ------------------------------------------------------------
   4. LE RÉSUMÉ, PUIS LES PORTES
   ------------------------------------------------------------ */
function rendResume(){
  const c = prep.cinema || {};
  const sit = prep.situation;
  const alertes = (prep.alertes || []).filter(a=>Number(a.urgence) >= 3);
  const prete = prep.prete_a_ouvrir === true;

  document.getElementById("zonePrep").innerHTML = `
    <div class="resumePrep">
      <div class="rpTitre">Programme prêt</div>
      <div class="rpLigne">${icone("pellicule")}
        <span>${prep.previsions?.length || 0} séance(s) au programme</span></div>
      <div class="rpLigne">${icone("spectateurs")}
        <span>${prep.total_bas} à ${prep.total_haut} réservations attendues</span></div>
      <div class="rpLigne">${icone("piece")}
        <span>${fmtArgent(prep.cout_licences)} de licences à régler</span></div>
      ${sit ? `<div class="rpLigne">${icone("cloche")}
        <span>${sit.statut === "resolue" ? "Dossier traité" :
                sit.statut === "ignoree" ? "Dossier laissé de côté" :
                "Un dossier attend encore une réponse"}</span></div>` : ""}
      ${alertes.length ? alertes.map(a=>`<div class="rpLigne alerte">${icone("outil")}
        <span>${echappe(a.texte)}</span></div>`).join("")
        : `<div class="rpLigne">${icone("outil")}<span>Salles en état</span></div>`}
      ${Number(prep.ajustements_restants) >= 0 ? `<div class="rpLigne discret">${icone("outil")}
        <span>${prep.ajustements_restants} ajustement(s) gratuit(s) restant(s)</span></div>` : ""}
    </div>

    ${!prete ? `<div class="prepAvertit">${
      (prep.previsions?.length || 0) === 0
        ? "Aucune séance au programme — il n'y a rien à ouvrir."
        : "Les licences dépassent ce qu'il y a en caisse."}</div>` : ""}

    <button class="btnPortes" ${prete ? "" : "disabled"} onclick="ouvreLesPortes()">
      ${icone("porte")} Ouvrir les portes</button>
    <button class="btnVideProg btnEtape" onclick="location.href='programmation.html'">
      Modifier le programme</button>
    <button class="btnVideProg btnEtape" onclick="vaA('previsions')">
      Revoir les réservations</button>`;
}

async function ouvreLesPortes(){
  const b = document.querySelector(".btnPortes");
  if(b){ b.disabled = true; b.textContent = "On ouvre…"; }
  try{
    if(typeof ouvreCinema === "function"){ await ouvreCinema(); return; }
    location.href = "jeu.html";
  }catch(e){
    if(b){ b.disabled = false; }
    toastSocial(messageErreur(e), "cloche");
  }
}

/* la tête de Bob, la même que partout ailleurs */
function teteBob(){
  return `<svg viewBox="30 40 60 60" aria-hidden="true">
    <circle cx="60" cy="70" r="26" fill="#f0c9a0"/>
    <path d="M40 78 Q50 86 60 79 Q70 86 80 78 Q72 92 60 84 Q48 92 40 78" fill="#4a3527"/>
    <path d="M44 60 Q51 55 57 59 M63 59 Q69 55 76 60" stroke="#4a3527" stroke-width="4"
      fill="none" stroke-linecap="round"/>
    <circle cx="51" cy="66" r="2.6" fill="#1c1210"/><circle cx="69" cy="66" r="2.6" fill="#1c1210"/>
    <path d="M34 56 Q60 34 86 56 L86 50 Q60 28 34 50 Z" fill="#571520"/>
    <rect x="52" y="44" width="16" height="7" rx="2" fill="#e8b84b"/>
  </svg>`;
}

/* ---- exports ---- */
export {
  chargePreparation,
  choisitOption,
  classeTendance,
  etape,
  etiquetteCategorie,
  ignoreDossier,
  initPreparation,
  ligneResa,
  majFilAriane,
  montreEchec,
  ouvreLesPortes,
  prep,
  rendBriefing,
  rendDossier,
  rendEtape,
  rendPrevisions,
  rendResume,
  teteBob,
  vaA
};

/* ---- gestionnaires en attribut ---- */
/* Ces fonctions sont appelées depuis des attributs onclick écrits
   dans le HTML généré. Un module ES n'expose rien globalement :
   on les rend accessibles explicitement. */
Object.assign(window, {
  chargePreparation,
  choisitOption,
  ignoreDossier,
  ouvreLesPortes,
  vaA
});
