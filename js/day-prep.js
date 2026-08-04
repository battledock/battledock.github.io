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
let etape = "briefing";   /* briefing · dossier — le reste a migré */

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
  if(etape === "briefing") return rendBriefing();
  return rendDossier();
}

function vaA(e){ etape = e; rendEtape(); window.scrollTo({top:0, behavior:"smooth"}); }

function majFilAriane(){
  const ordre = ["briefing","dossier"];
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
    ${prep.situation && prep.situation.statut === "en_attente"
      ? `<button class="btnOrProg btnEtape" onclick="vaA('dossier')">
          Ouvrir le dossier du jour</button>`
      : `<button class="btnOrProg btnEtape" onclick="location.href='programmation.html'">
          Composer le programme</button>`}`;
  texteSur(document.getElementById("jmSalut"), prep.salutation || "");
}





/* ------------------------------------------------------------
   2. LE DOSSIER DU JOUR
   Les réservations et le résumé ont migré vers la programmation :
   ils n'ont de sens qu'une fois le programme composé.
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
      <button class="btnOrProg btnEtape"
        onclick="location.href='programmation.html'">Composer le programme</button>`;
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
  /* le dossier réglé, il ne reste qu'à composer */
  setTimeout(()=>{
    const b = document.querySelector(".dossier.resolu");
    if(b) b.scrollIntoView({behavior:"smooth", block:"center"});
  }, 120);
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

/* Il n'y a plus d'« après » où décider : le dossier se traite ou se
   refuse, mais ne se reporte plus. La fonction reste pour les parties
   en cours qui auraient une situation déjà mise de côté. */
async function ignoreDossier(){
  const appel = await appelSecurise(
    () => rpc("ignorer_situation", {p_situation_id: prep.situation.id}),
    {rechargeApresErreur: false});
  if(!appel.ok){ montreEchec(appel.message); return; }
  await chargePreparation();
  vaA("resume");
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
  etape,
  etiquetteCategorie,
  ignoreDossier,
  initPreparation,
  majFilAriane,
  montreEchec,
  prep,
  rendBriefing,
  rendDossier,
  rendEtape,
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
  vaA
});
