import { chargeStats, passeAuJourSuivant, xpDeLaJournee } from "../../engine/day.js";
import { bobBilan } from "../../engine/simulation.js";
import { Etat, fmtArgent } from "../../game-state.js";
import { sbFetch } from "../../supabase-client.js";
import { icone } from "../../ui/icons.js";

/* ============================================================
   BILAN DE FIN DE JOURNÉE
   Affiche TOUJOURS les données sauvegardées (jamais de recalcul).
   ============================================================ */
let bilanCourant = null;
let xpAttribuee = 0;
let recordBattu = false;

async function initBilan(){
  await chargeStats();
  const c = Etat.cinema;
  const d = await sbFetch(`journees?cinema_id=eq.${c.id}&jour=eq.${c.jour}&select=*`);
  const j = Array.isArray(d) && d[0];

  if(!j || !j.resultats){
    document.getElementById("contenuBilan").innerHTML = `
      <section class="carteEcran">
        <h2>Pas encore de bilan</h2>
        <div class="vide">La journée n'a pas été jouée.<br>Retourne à l'accueil pour ouvrir le cinéma.</div>
        <button class="btnRouge btnJourSuivant" onclick="location.href='jeu.html'">Retour au cinéma</button>
      </section>`;
    return;
  }
  if(j.statut === "completed"){
    /* bilan déjà validé : lecture seule */
    bilanCourant = j.resultats;
    rendBilan(bilanCourant, true);
    return;
  }

  bilanCourant = j.resultats;
  bilanCourant._jour = c.jour;
  /* l'XP a déjà été attribuée par simuler_journee() : on lit le total officiel */
  xpAttribuee = xpDeLaJournee(bilanCourant);
  recordBattu = Number(bilanCourant.total_spectateurs) > Number(Etat.stats?.meilleure_journee || 0)
                && Number(Etat.stats?.meilleure_journee || 0) > 0;
  rendBilan(bilanCourant, false);
}

function mentionSatisfaction(s){
  if(s < 40) return "très mauvais";
  if(s < 60) return "moyen";
  if(s < 75) return "satisfaisant";
  if(s < 90) return "très bon";
  return "exceptionnel";
}

function rendBilan(b, dejaValide){
  const c = Etat.cinema;
  const incidents = b.resultats.filter(r=>r.incident_texte);
  const remplie = b.resultats.find(r=>String(r.seance_id) === String(b.seance_plus_remplie));

  document.getElementById("contenuBilan").innerHTML = `
    <div class="enteteBilan">
      <div class="ebJour">Jour ${b._jour || c.jour} terminé</div>
      <div class="ebSous">${b.evenement.nom}</div>
    </div>

    <section class="carteEcran">
      <h2>Les chiffres</h2>
      <div class="ligneRecit">${icone("spectateurs")}<span>Spectateurs : <b>${b.total_spectateurs}</b></span></div>
      <div class="ligneRecit">${icone("billet")}<span>Recettes billetterie : <b>${fmtArgent(b.recettes_brutes)}</b></span></div>
      ${b.recettes_confiserie ? `<div class="ligneRecit">${icone("billet")}<span>Confiserie : <b>+${fmtArgent(b.recettes_confiserie)}</b> <small>${b.articles_confiserie} articles · coût ${fmtArgent(b.cout_confiserie)}</small></span></div>` : ""}
      <div class="ligneRecit">${icone("pellicule")}<span>Licences : <b>−${fmtArgent(b.cout_licences)}</b> <small>(déjà payées à l'ouverture)</small></span></div>
      <div class="ligneRecit">${icone("piece")}<span>Bénéfice net : <b class="${b.benefice_net<0?'negatif':'positif'}">${b.benefice_net<0?"−":"+"}${fmtArgent(Math.abs(b.benefice_net))}</b></span></div>
      <div class="ligneRecit">${icone("etoile")}<span>Satisfaction moyenne : <b>${b.satisfaction_moyenne} %</b> <small>${mentionSatisfaction(b.satisfaction_moyenne)}</small></span></div>
      <div class="ligneRecit">${icone("journal")}<span>Réputation : <b class="${b.variation_reputation<0?'negatif':'positif'}">${b.variation_reputation>0?"+":""}${b.variation_reputation}</b></span></div>
      ${dejaValide ? "" : `<div class="ligneRecit">${icone("camera")}<span>XP gagnée : <b class="positif">+${xpAttribuee}</b></span></div>`}
    </section>

    <div class="blocBob bilanBob">
      <div class="bobMiniTete grand"><svg viewBox="30 40 60 60">
        <circle cx="60" cy="70" r="26" fill="#f0c9a0"/>
        <path d="M40 78 Q50 86 60 79 Q70 86 80 78 Q72 92 60 84 Q48 92 40 78" fill="#4a3527"/>
        <path d="M44 60 Q51 55 57 59 M63 59 Q69 55 76 60" stroke="#4a3527" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="51" cy="66" r="2.6" fill="#1c1210"/><circle cx="69" cy="66" r="2.6" fill="#1c1210"/>
        <path d="M34 56 Q60 34 86 56 L86 50 Q60 28 34 50 Z" fill="#571520"/>
        <rect x="52" y="44" width="16" height="7" rx="2" fill="#e8b84b"/>
      </svg></div>
      <div class="bulle"><b>Bob</b><span>${bobBilan(b, c)}</span></div>
    </div>

    ${recordBattu ? `<div class="bandeauRecord">${icone("etoile")} Nouveau record de fréquentation : ${b.total_spectateurs} spectateurs</div>` : ""}

    <section class="carteEcran">
      <h2>Séance par séance</h2>
      ${b.resultats.map(r=>`
        <div class="ligneBilanSeance">
          <div class="lbHeure">${r.heure}</div>
          <div class="lbCorps">
            <div class="lbTitre">${r.titre}</div>
            <div class="lbJauge"><i style="width:${Math.round(r.spectateurs/r.capacite*100)}%"></i></div>
            <div class="lbMeta">${r.spectateurs} / ${r.capacite} places · ${fmtArgent(r.brut)} · satisfaction ${r.satisfaction} %${r.confiserie?.articles?` · ${r.confiserie.articles} articles vendus` : ""}</div>
            ${r.incident_texte ? `<div class="lbIncident">${icone("cloche")} ${r.incident_texte}</div>` : ""}
          </div>
        </div>`).join("")}
    </section>

    <section class="carteEcran">
      <h2>Faits du jour</h2>
      <div class="ligneRecit">${icone("journal")}<span><b>${b.evenement.nom}</b><br><small>${b.evenement.description}</small></span></div>
      ${b.meilleur_film ? `<div class="ligneRecit">${icone("etoile")}<span>Meilleur accueil : <b>${b.meilleur_film}</b></span></div>` : ""}
      ${remplie ? `<div class="ligneRecit">${icone("fauteuil")}<span>Séance la plus remplie : <b>${remplie.heure} — ${remplie.titre}</b> <small>(${remplie.spectateurs}/${remplie.capacite})</small></span></div>` : ""}
      ${incidents.length === 0 ? `<div class="ligneRecit">${icone("outil")}<span>Aucun incident. Bob est presque déçu.</span></div>` : ""}
    </section>

    ${dejaValide
      ? `<button class="btnRouge btnJourSuivant" onclick="location.href='jeu.html'">Retour au cinéma</button>`
      : `<button class="btnRouge btnJourSuivant" id="btnSuivant" onclick="validerBilan()">Passer au jour ${(b._jour||c.jour)+1}</button>`}`;
}

async function validerBilan(){
  const b = document.getElementById("btnSuivant");
  if(b){ b.disabled = true; b.textContent = "Bob range la salle…"; }
  await passeAuJourSuivant(bilanCourant);
}

/* ---- exports ---- */
export {
  bilanCourant,
  initBilan,
  mentionSatisfaction,
  recordBattu,
  rendBilan,
  validerBilan,
  xpAttribuee
};

/* ---- gestionnaires en attribut ---- */
/* Ces fonctions sont appelées depuis des attributs onclick écrits
   dans le HTML généré. Un module ES n'expose rien globalement :
   on les rend accessibles explicitement. */
Object.assign(window, {
  validerBilan
});
