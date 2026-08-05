import { Etat, chargeCampagnes, fmtArgent, rafraichirEtat } from "./game-state.js?v=7ec6c189";
import { toastSocial } from "./social.js?v=7ec6c189";
import { appelSecurise, idOperation, messageErreur, rpc } from "./supabase-client.js?v=7ec6c189";
import { echappe, texteSur } from "./ui/emblems.js?v=7ec6c189";
import { icone } from "./ui/icons.js?v=7ec6c189";

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
    rendMatin();
  }catch(e){
    console.error("[Rex] préparation", e);
    zone.innerHTML = `<div class="prepRefus"><p>${echappe(messageErreur(e))}</p>
      <button class="btnVideProg" onclick="chargePreparation()">Réessayer</button></div>`;
  }
}

/* ------------------------------------------------------------
   L'enchaînement : on n'avance que d'un écran à la fois
   ------------------------------------------------------------ */
/* nommée « rendMatin » et non « rendEtape » : le studio a déjà une
   fonction de ce nom, et deux homonymes finissent par se croiser. */
function rendMatin(){
  majFilAriane();
  if(etape === "briefing") return rendBriefing();
  return rendDossier();
}

function vaA(e){ etape = e; rendMatin(); window.scrollTo({top:0, behavior:"smooth"}); }

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
  /* Les charges tombent tous les jours, qu'il y ait du monde ou non.
     Bob les annonce en tête : une dépense connue le matin est une
     contrainte, la même découverte au bilan est une punition. */
  const camp = Etat.campagnes && Etat.campagnes.en_cours;
  const lignes = [
    ...(camp ? [{
      cle:"campagne", icone:"etoile",
      texte: camp.nom + " en cours",
      detail: "+" + Math.round((Number(camp.effet) - 1) * 100) + " % de fréquentation · "
              + camp.jours_restants + " jour" + (camp.jours_restants > 1 ? "s" : "") + " restant"
              + (camp.jours_restants > 1 ? "s" : "")
    }] : []),
    ...(prep.charges ? [{
      cle:"charges", icone:"piece",
      texte: fmtArgent(prep.charges.total) + " de charges aujourd'hui",
      detail: prep.charges.detail || ""
    }] : []),
    ...(prep.lignes || [])
  ];
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
    ${(Etat.campagnes && !Etat.campagnes.en_cours
       && (Etat.campagnes.formules || []).some(f=>f.accessible))
      ? `<button class="btnQuartier" onclick="ouvreCampagnes()">
          ${icone("journal")}
          <span><b>Faire venir du monde</b>
            <small>Tracts, affichage, radio — une campagne à la fois</small></span>
          <span class="bqChev">›</span></button>` : ""}

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
    () => rpc("resoudre_dossier", {
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
    /* le serveur enveloppe désormais ses pannes : s'il donne un état
       SQL, on le montre — c'est ce qui permet de me le rapporter. */
    if(r && r.sqlstate) console.warn("[Séance] dossier :", r.sqlstate, r.detail);
    montreEchec((r?.message || "Ce choix n'a pas pu être appliqué.")
      + (r?.sqlstate ? " (" + r.sqlstate + ")" : ""));
    await chargePreparation();   /* l'état a changé : on repart du serveur */
    etape = "dossier"; rendMatin();
    return;
  }

  await chargePreparation();
  etape = "dossier";
  rendMatin();
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
    () => rpc("ignorer_dossier", {p_situation_id: prep.situation.id}),
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


/* ============================================================
   LES CAMPAGNES D'AFFICHAGE

   Depuis que le loyer tombe tous les jours, le joueur subit une
   pression sans avoir de levier pour y répondre. Une campagne lui
   donne quelque chose à faire de son argent — payé d'avance, sans
   garantie. C'est un pari, et l'écran le dit.
   ============================================================ */

const SCENE = {
  /* Bob glisse un tract dans une boîte, le soir, sous un réverbère */
  tracts:`<svg viewBox="0 0 92 92" aria-hidden="true">
    <defs>
      <linearGradient id="tCiel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a3350"/><stop offset="1" stop-color="#6b5a63"/></linearGradient>
      <radialGradient id="tHalo" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#ffdf9a" stop-opacity=".55"/>
        <stop offset="1" stop-color="#ffdf9a" stop-opacity="0"/></radialGradient>
      <linearGradient id="tBoite" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#6d5238"/><stop offset=".45" stop-color="#a37c52"/>
        <stop offset="1" stop-color="#5e462f"/></linearGradient>
    </defs>
    <rect width="92" height="92" rx="14" fill="url(#tCiel)"/>
    <circle cx="66" cy="20" r="26" fill="url(#tHalo)"/>
    <g opacity=".5" fill="#1c2238">
      <rect x="0" y="30" width="14" height="46"/><rect x="76" y="24" width="16" height="52"/>
      <rect x="4" y="36" width="4" height="5" fill="#f0c96a" opacity=".7"/>
      <rect x="81" y="32" width="4" height="5" fill="#f0c96a" opacity=".6"/></g>
    <rect x="0" y="74" width="92" height="18" fill="#3d3a44"/>
    <path d="M0 74h92" stroke="#54505c" stroke-width="1.4"/>
    <g><rect x="63" y="8" width="2.6" height="30" fill="#20263a"/>
       <path d="M58 10h13l-2 5H60z" fill="#4a4a58"/>
       <circle cx="64.5" cy="14" r="3.4" fill="#ffe9b0"/></g>
    <g><rect x="26" y="44" width="30" height="24" rx="3" fill="url(#tBoite)"/>
       <rect x="26" y="44" width="30" height="6" rx="2.5" fill="#4a3626"/>
       <rect x="34" y="53" width="14" height="2.6" rx="1.3" fill="#241a12" opacity=".55"/>
       <circle cx="52" cy="61" r="1.6" fill="#e8b84b"/></g>
    <g transform="translate(14 40)">
      <ellipse cx="6" cy="34" rx="8" ry="2" fill="#000" opacity=".28"/>
      <path d="M2 12q4-2 8 0l1.5 22h-11z" fill="#3d4a6b"/>
      <path d="M9 16l7 4-1.5 3-7-4z" fill="#3d4a6b"/>
      <circle cx="6" cy="6.5" r="5" fill="#e4b892"/>
      <path d="M1 5.5q5-7 10 0 0 3-1 4H2q-1-1-1-4z" fill="#571520"/></g>
    <g class="tract t1"><rect x="34" y="24" width="17" height="12" rx="1.4" fill="#fdfbf3"
      stroke="#c9982f" stroke-width="1"/>
      <path d="M37 28h11M37 31h7" stroke="#a8895a" stroke-width="1.2" stroke-linecap="round"/></g>
    <g class="tract t2"><rect x="47" y="16" width="15" height="11" rx="1.4" fill="#fdfbf3"
      stroke="#c9982f" stroke-width="1" transform="rotate(13 54 21)"/></g>
    <g class="tract t3"><rect x="22" y="14" width="15" height="11" rx="1.4" fill="#fdfbf3"
      stroke="#c9982f" stroke-width="1" transform="rotate(-11 29 19)"/></g>
  </svg>`,

  /* un mur d'affiches, et un passant qui s'arrête */
  affichage:`<svg viewBox="0 0 92 92" aria-hidden="true">
    <defs>
      <linearGradient id="aCiel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9dc0da"/><stop offset="1" stop-color="#e8dcc4"/></linearGradient>
      <linearGradient id="aMur" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#c4b49a"/><stop offset=".5" stop-color="#ded0b8"/>
        <stop offset="1" stop-color="#bcab90"/></linearGradient>
      <linearGradient id="aRouge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a82c3c"/><stop offset="1" stop-color="#6d1522"/></linearGradient>
      <linearGradient id="aBleu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a6d92"/><stop offset="1" stop-color="#22415c"/></linearGradient>
    </defs>
    <rect width="92" height="92" rx="14" fill="url(#aCiel)"/>
    <rect x="0" y="14" width="92" height="58" fill="url(#aMur)"/>
    <g opacity=".13" stroke="#5a4a38">
      <path d="M0 30h92M0 48h92M20 14v58M52 14v58M74 14v58"/></g>
    <rect x="0" y="72" width="92" height="20" fill="#b0a894"/>
    <path d="M0 72h92" stroke="#8d8574" stroke-width="1.2"/>
    <g><rect x="10" y="26" width="27" height="38" rx="1.5" fill="url(#aRouge)"
        stroke="#8a6c2a" stroke-width="1.4"/>
      <circle cx="23.5" cy="38" r="7" fill="#f0d89a" opacity=".5"/>
      <path d="M13 56l10.5-11L34 56z" fill="#f0d89a" opacity=".32"/>
      <rect x="14" y="59" width="19" height="1.8" rx=".9" fill="#f0d89a" opacity=".75"/></g>
    <g><rect x="45" y="21" width="29" height="42" rx="1.5" fill="url(#aBleu)"
        stroke="#8a6c2a" stroke-width="1.4"/>
      <circle cx="59.5" cy="34" r="7.5" fill="#cfe4f0" opacity=".5"/>
      <path d="M48 54l11.5-12L71 54z" fill="#cfe4f0" opacity=".32"/>
      <rect x="49" y="57" width="21" height="1.8" rx=".9" fill="#cfe4f0" opacity=".75"/></g>
    <g class="colle"><ellipse cx="41" cy="20" rx="1.8" ry="2.4" fill="#e0d2a8"/></g>
    <g transform="translate(76 52)">
      <ellipse cx="4" cy="21" rx="6" ry="1.8" fill="#000" opacity=".2"/>
      <path d="M0 6q4-2 8 0l1 15H-1z" fill="#4a4038"/>
      <circle cx="4" cy="1.5" r="4.2" fill="#d9a97f"/>
      <path d="M0 .5q4-5.5 8 0" stroke="#3a2a1e" stroke-width="2.4" fill="none"/></g>
  </svg>`,

  /* le poste de radio dans la cuisine, le matin */
  radio:`<svg viewBox="0 0 92 92" aria-hidden="true">
    <defs>
      <linearGradient id="rFond" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4e7d0"/><stop offset="1" stop-color="#d9c7a8"/></linearGradient>
      <linearGradient id="rBois" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#6d4530"/><stop offset=".4" stop-color="#a8683f"/>
        <stop offset="1" stop-color="#5e3a28"/></linearGradient>
      <radialGradient id="rJour" cx=".5" cy=".2" r=".8">
        <stop offset="0" stop-color="#fff6dc" stop-opacity=".85"/>
        <stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="92" height="92" rx="14" fill="url(#rFond)"/>
    <rect x="8" y="6" width="30" height="34" rx="2" fill="#bcd4e4"/>
    <rect x="8" y="6" width="30" height="34" rx="2" fill="none" stroke="#a8895a" stroke-width="2"/>
    <path d="M23 6v34M8 23h30" stroke="#a8895a" stroke-width="1.6"/>
    <rect width="92" height="92" rx="14" fill="url(#rJour)"/>
    <rect x="0" y="66" width="92" height="26" fill="#b08a5e"/>
    <path d="M0 66h92" stroke="#8a6842" stroke-width="1.6"/>
    <g><rect x="24" y="40" width="46" height="27" rx="4" fill="url(#rBois)"/>
      <rect x="24" y="40" width="46" height="5" rx="2.5" fill="#4a2f20"/>
      <circle cx="38" cy="55" r="8.5" fill="#2a1a12"/>
      <g stroke="#5a4433" stroke-width="1"><circle cx="38" cy="55" r="6"/><circle cx="38" cy="55" r="3.4"/></g>
      <rect x="50" y="47" width="16" height="9" rx="1.4" fill="#e8d9a8"/>
      <path d="M52 51.5h12" stroke="#8a6c2a" stroke-width="1"/>
      <circle cx="58" cy="51.5" r="1.4" fill="#a82c3c"/>
      <rect x="50" y="59" width="16" height="3" rx="1.5" fill="#c9a882"/>
      <ellipse cx="46" cy="67" rx="24" ry="2" fill="#000" opacity=".18"/></g>
    <path d="M46 40V26" stroke="#6d4530" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="46" cy="25" r="2" fill="#c9982f"/>
    <g fill="none" stroke="#c9982f" stroke-width="2" stroke-linecap="round">
      <path class="onde o1" d="M53 20a13 13 0 0 1 0 14"/>
      <path class="onde o2" d="M59 14a22 22 0 0 1 0 26"/>
      <path class="onde o3" d="M39 20a13 13 0 0 0 0 14"/>
      <path class="onde o4" d="M33 14a22 22 0 0 0 0 26"/>
    </g>
  </svg>`
};

function ouvreCampagnes(){
  const d = Etat.campagnes;
  if(!d){ montreEchec("Les campagnes ne sont pas disponibles pour l'instant."); return; }

  const v = document.createElement("div");
  v.className = "voileCamp";
  v.id = "voileCamp";
  v.innerHTML = `<div class="feuilleCamp" id="feuilleCamp"></div>`;
  document.body.appendChild(v);
  v.addEventListener("click", e=>{ if(e.target === v) fermeCampagnes(); });
  rendCampagnes();
}

function fermeCampagnes(){
  const v = document.getElementById("voileCamp");
  if(v) v.remove();
}

let campagneChoisie = null;

function rendCampagnes(){
  const el = document.getElementById("feuilleCamp");
  if(!el) return;
  const d = Etat.campagnes || {};
  const formules = d.formules || [];
  const enCours = d.en_cours;

  if(enCours){ el.innerHTML = campagneEnCours(enCours); return; }

  const dispo = formules.filter(f=>f.accessible);
  if(!campagneChoisie && dispo.length) campagneChoisie = dispo[0].cle;
  const f = formules.find(x=>x.cle === campagneChoisie) || dispo[0];

  el.innerHTML = `
    <div class="poigneeCamp"></div>
    <h3>Faire venir du monde</h3>
    <div class="sousCamp">Une campagne à la fois</div>
    ${f ? `<div class="bobCamp"><span class="bobTeteCamp">${teteBob()}</span>
      <p>${echappe(f.description || "")}</p></div>` : ""}
    ${formules.map(x=>carteFormule(x, x.cle === (f && f.cle))).join("")}
    ${f ? estimationCampagne(f) : ""}
    <button class="btnCamp" ${f && Number(Etat.cinema.argent) >= Number(f.cout)
        ? `onclick="lanceCampagne('${f.cle}')"` : "disabled"}>
      ${!f ? "Aucune formule accessible"
        : Number(Etat.cinema.argent) >= Number(f.cout)
          ? "Lancer la campagne · " + fmtArgent(f.cout)
          : "Il manque " + fmtArgent(Number(f.cout) - Number(Etat.cinema.argent))}
    </button>
    <button class="lienCamp" onclick="fermeCampagnes()">Plus tard</button>`;
  requestAnimationFrame(compteChiffresCamp);
}

function carteFormule(f, choisie){
  const bloquee = !f.accessible;
  return `<button class="formuleCamp ${choisie ? "choisie" : ""} ${bloquee ? "bloquee" : ""}"
      ${bloquee ? "" : `onclick="choisitCampagne('${f.cle}')"`}>
    <span class="fcIco">${SCENE[f.cle] || ""}</span>
    <span class="fcTxt">
      <b>${echappe(f.nom)}</b>
      <span class="fcDesc">${echappe(f.description || "")}</span>
      <span class="fcChiffres">
        <span class="fcChip prix">${fmtArgent(f.cout)}</span>
        <span class="fcChip">${f.duree} jours</span>
        <span class="fcChip gain">${echappe(f.gain || "")}</span>
      </span>
    </span>
    ${bloquee ? `<span class="fcVerrou">Niveau ${f.niveau_requis}</span>` : ""}
  </button>`;
}

/* l'estimation se fait sur les vrais chiffres du joueur */
function estimationCampagne(f){
  const seances = (Etat.seancesJour || []).length || 2;
  const prev = prep && prep.previsions;
  const moyen = prev && prev.total_centre
    ? Math.round(Number(prev.total_centre) / Math.max(1, seances))
    : 24;
  const prix = (Etat.seancesJour || []).length
    ? Math.round((Etat.seancesJour.reduce((t,s)=>t + Number(s.prix||0), 0)) / seances)
    : 9;
  const pct = Number(String(f.gain || "").replace(/[^0-9]/g, "")) || 0;
  const enPlus = Math.max(1, Math.round(moyen * pct / 100));
  const parJour = enPlus * seances * prix;
  const total = parJour * Number(f.duree);
  const gain = total - Number(f.cout);

  return `<div class="calculCamp">
    <div class="calTitreCamp">Ce que ça devrait donner</div>
    <div class="calLigneCamp"><span>Spectateurs en plus par séance</span><b>+${enPlus}</b></div>
    <div class="calLigneCamp"><span>Recette supplémentaire par jour</span>
      <b>+${parJour} €</b></div>
    <div class="calLigneCamp"><span>Sur ${f.duree} jours</span><b>+${total} €</b></div>
    <div class="calLigneCamp"><span>Coût de la campagne</span><b>− ${f.cout} €</b></div>
    <div class="calLigneCamp total"><span>Gain attendu</span>
      <b class="${gain >= 0 ? "" : "perte"}">${gain >= 0 ? "+" : ""}${gain} €</b></div>
    <div class="calNoteCamp">Une estimation, pas une promesse. Un jour de grand soleil
      ou un film qui déplaît, et le compte n'y sera pas.</div>
  </div>`;
}

function campagneEnCours(c){
  const pct = Math.max(0, Math.min(100,
    100 - (Number(c.jours_restants) / Math.max(1, Number(c.jours_restants) + 1)) * 100));
  return `
    <div class="poigneeCamp"></div>
    <h3>Faire venir du monde</h3>
    <div class="sousCamp">Une campagne tourne</div>
    <div class="enCoursCamp">
      <div class="ecNomCamp">${echappe(c.nom)}</div>
      <div class="ecEffetCamp">+${Math.round((Number(c.effet) - 1) * 100)} % de fréquentation</div>
      <div class="ecAffichesCamp">${[1,2,3,4,5].map(i=>`<i class="a${i}"></i>`).join("")}</div>
      <div class="ecJoursCamp">${c.jours_restants} jour${c.jours_restants > 1 ? "s" : ""} restant${c.jours_restants > 1 ? "s" : ""}</div>
    </div>
    <div class="bobCamp" style="margin-top:14px"><span class="bobTeteCamp">${teteBob()}</span>
      <p>Les affiches sont posées. Maintenant on attend, et on programme quelque chose
         qui vaut le déplacement.</p></div>
    <button class="lienCamp" onclick="fermeCampagnes()">Retour</button>`;
}

function choisitCampagne(cle){ campagneChoisie = cle; rendCampagnes(); }

async function lanceCampagne(cle){
  const b = document.querySelector(".btnCamp");
  if(b){ b.disabled = true; b.textContent = "On colle les affiches…"; }

  const appel = await appelSecurise(
    () => rpc("lancer_campagne", {
      p_cinema_id: Etat.cinema.id, p_cle: cle, p_operation_id: idOperation()
    }), {rechargeApresErreur: false});

  if(!appel.ok){ montreEchec(appel.message); fermeCampagnes(); return; }
  const r = appel.data;
  if(!r || r.success !== true){
    montreEchec(r && r.message ? r.message : "La campagne n'a pas pu être lancée.");
    if(b){ b.disabled = false; }
    return;
  }
  await rafraichirEtat();
  if(typeof chargeCampagnes === "function") await chargeCampagnes();
  rendCampagnes();
  await chargePreparation();
  rendMatin();
}

/* les montants montent au lieu d'apparaître : on suit le calcul */
function compteChiffresCamp(){
  document.querySelectorAll(".calLigneCamp b").forEach(el=>{
    const brut = el.textContent;
    const m = brut.match(/-?[\d\s]+/);
    if(!m) return;
    const cible = parseInt(m[0].replace(/\s/g, ""), 10);
    if(isNaN(cible) || Math.abs(cible) < 2) return;
    const avant = brut.slice(0, m.index), apres = brut.slice(m.index + m[0].length);
    const debut = performance.now(), duree = 460;
    const pas = t=>{
      const p = Math.min(1, (t - debut) / duree);
      el.textContent = avant + Math.round(cible * (1 - Math.pow(1 - p, 3))) + apres;
      if(p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  });
}

/* ---- exports ---- */
export {
  SCENE,
  campagneChoisie,
  campagneEnCours,
  carteFormule,
  chargePreparation,
  choisitCampagne,
  choisitOption,
  compteChiffresCamp,
  estimationCampagne,
  etape,
  etiquetteCategorie,
  fermeCampagnes,
  ignoreDossier,
  initPreparation,
  lanceCampagne,
  majFilAriane,
  montreEchec,
  ouvreCampagnes,
  prep,
  rendBriefing,
  rendCampagnes,
  rendDossier,
  rendMatin,
  teteBob,
  vaA
};

/* ---- gestionnaires en attribut ---- */
/* Ces fonctions sont appelées depuis des attributs onclick écrits
   dans le HTML généré. Un module ES n'expose rien globalement :
   on les rend accessibles explicitement. */
Object.assign(window, {
  chargePreparation,
  choisitCampagne,
  choisitOption,
  fermeCampagnes,
  lanceCampagne,
  ouvreCampagnes,
  vaA
});
