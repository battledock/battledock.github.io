/* Programmation : mur d'affiches et grille des séances. */

import { CATALOGUE_FILMS } from "./data/films.js";
import {
  NETTOYAGE_MIN,
  compareHeures,
  filmDebloque,
  filmParId,
  fmtDuree,
  heureEnMinutes,
  horairesDisponibles,
  minutesEnHeure,
  obtenirLimiteSeances
} from "./data/films.js";
import { niveauEquipement } from "./data/upgrades.js";
import { chargeJournee, statutJournee } from "./engine/day.js";
import { Etat, fmtArgent } from "./game-state.js";
import { bobCompact } from "./navigation.js";
import { accomplitMission, debloque, declencheEvenement } from "./progression.js";
import { toastSocial } from "./social.js";
import { rpc, sbFetch } from "./supabase-client.js";
import { echappe, texteSur } from "./ui/emblems.js";
import { icone } from "./ui/icons.js";

/* ============================================================
   PROGRAMMATION DES SÉANCES
   Statuts : draft → validated → running → completed
   (running / completed seront utilisés par la simulation de journée)
   ============================================================ */
const PRIX_MIN = 4, PRIX_MAX = 20, PRIX_DEFAUT = 8;

let seancesJour = [];      /* séances du jour courant */
let sallesDispo  = [];     /* salles du cinéma */
let brouillon    = null;   /* séance en cours d'édition */

/* ---------- initialisation ---------- */
async function initProgrammation(){
  await chargeJournee();
  await chargeSallesProg();
  await chargeFilmsMaison();
  await chargeSeances();
  rendProgrammeDuJour();
  rendCatalogue();
  bulleConseil(conseilProg());
}

async function chargeSallesProg(){
  const d = await sbFetch(`salles?cinema_id=eq.${Etat.cinema.id}&select=*&order=cree_le`);
  sallesDispo = Array.isArray(d) ? d : [];
  Etat.salles = sallesDispo;
}

async function chargeSeances(){
  const c = Etat.cinema;
  const d = await sbFetch(`seances?cinema_id=eq.${c.id}&jour=eq.${c.jour}&select=*`);
  seancesJour = Array.isArray(d) ? d : [];
  trieSeances();
  Etat.seancesJour = seancesJour;
}
function trieSeances(){ seancesJour.sort((a,b)=>compareHeures(a.heure,b.heure)); }

/* films produits au studio : injectés au catalogue, licence gratuite */
/* Films produits par le joueur : le serveur donne l'identifiant officiel,
   la popularité et la durée. Aucun coût de licence. */
async function chargeFilmsMaison(){
  const c = Etat.cinema;
  let maison = [];
  try{
    const r = await rpc("get_my_available_productions", {p_cinema_id: c.id});
    maison = r?.entries || [];
  }catch(e){ maison = []; }
  Etat.filmsMaisonCat = maison.map(f=>({
    id: f.filmId, titre: f.titre, genre: f.genre, duree: Number(f.duree) || 20,
    popularite: Number(f.popularite) || 40, qualite: Number(f.qualite) || 50,
    coutLicence: 0, niveauRequis: 1, publicCible:["adultes","cinephiles"],
    couleurAffiche:"#8a6c2a", maison:true, affiche: f.affiche,
    resume:"Une production maison, tournée ici même. Aucune licence à payer."
  }));
}
function catalogueComplet(){ return [...(Etat.filmsMaisonCat||[]), ...CATALOGUE_FILMS]; }

/* ---------- règles métier ---------- */
function coutLicence(f){ return Math.round((f.coutLicence||0) * (debloque("partenariat") ? .8 : 1)); }
function limiteSeances(){ return obtenirLimiteSeances(Etat.cinema, sallesDispo); }
function programmeValide(){ return seancesJour.length > 0 && seancesJour.every(s=>s.statut === "validated"); }
function journeeLancee(){ return ["running","completed"].includes(statutJournee()); }

/* intervalle occupé par une séance : début → fin + nettoyage */
function intervalle(s){
  const deb = heureEnMinutes(s.heure);
  const fin = deb + (s.duree_min||0);
  return {deb, fin, libre: fin + (s.nettoyage_min ?? NETTOYAGE_MIN)};
}
/* renvoie la séance en conflit, ou null */
function chercheConflit({salle_id, heure, duree, ignorerId}){
  const deb = heureEnMinutes(heure);
  const libreNouveau = deb + duree + NETTOYAGE_MIN;
  for(const s of seancesJour){
    if(String(s.salle_id) !== String(salle_id)) continue;
    if(ignorerId && String(s.id) === String(ignorerId)) continue;
    const i = intervalle(s);
    if(deb < i.libre && i.deb < libreNouveau) return s;
  }
  return null;
}

/* estimation indicative d'audience — NE DISTRIBUE AUCUN ARGENT (temporaire) */
function estimeAudience(s){
  const f = filmParId(s.film_id); if(!f) return 0;
  const salle = sallesDispo.find(x=>String(x.id)===String(s.salle_id)) || {capacite:80, confort:1};
  const heure = heureEnMinutes(s.heure);
  let bonusHeure = 0.55;
  if(heure >= 17*60 && heure <= 21*60+30) bonusHeure = 1;
  else if(heure >= 13*60 && heure < 17*60) bonusHeure = .78;
  else if(heure > 21*60+30) bonusHeure = .68;
  const elast = Math.max(.35, Math.min(1.25, 1.35 - (s.prix||PRIX_DEFAUT)/16));
  const base = (f.popularite/100) * salle.capacite * bonusHeure * elast;
  return Math.max(0, Math.round(base * (Etat.cinema.mult_frequentation||1)));
}

/* ---------- Bob ---------- */
function bulleConseil(t){
  const z = document.getElementById("zoneBob");
  z.innerHTML = ""; z.appendChild(bobCompact(t));
}
function conseilProg(){
  if(journeeLancee()) return "Les portes sont ouvertes, on ne change plus rien. Le bilan arrive.";
  if(sallesDispo.length === 0) return "Pas encore de salle ? Passe par l'onglet Salles, je t'attends ici.";
  if(seancesJour.length === 0) return "Le marquee est vide. Commence par la séance de 20h30 : c'est là que le quartier sort.";
  if(programmeValide()) return "Programme validé ! Retourne à l'accueil et ouvre les portes quand tu veux.";
  if(seancesJour.length >= limiteSeances()) return "Journée complète. Valide le programme, et on allume le projecteur.";
  return "Bon début. Les séances de journée remplissent moins, mais elles font tourner la machine.";
}

/* ============================================================
   CATALOGUE
   ============================================================ */
/* Le catalogue devient un mur : des affiches punaisées, qu'on touche
   pour les faire grandir. Plus de liste de fiches. */
function rendCatalogue(){
  const el = document.getElementById("listeFilms");
  const films = catalogueComplet();
  el.innerHTML = films.map((f,i)=>afficheMur(f,i)).join("");
  [...el.querySelectorAll(".amTitre")].forEach(n=>texteSur(n, n.dataset.t));
}

function afficheMur(f, i){
  const ouvert = filmDebloque(f);
  const incline = ((i * 37) % 5 - 2) * 0.8;      /* chaque affiche pend un peu de travers */
  return `<button class="afficheMur ${ouvert?'':'verrouillee'} ${f.maison?'maison':''}"
    style="--incline:${incline.toFixed(1)}deg"
    onclick="${ouvert ? `agranditAffiche('${f.id}')` : `refuseFilm('${f.id}')`}"
    aria-label="${echappe(f.titre)}">
    <span class="amPunaise"></span>
    <span class="amPapier" style="background:${f.couleurAffiche}">
      ${f.maison ? `<span class="amMaison">Production maison</span>` : ""}
      <span class="amMotif">${motifAffiche(f.genre)}</span>
      <span class="amTitre" data-t="${echappe(f.titre)}"></span>
      <span class="amGenre">${echappe(f.genre)}</span>
      ${ouvert ? "" : `<span class="amCadenas">${icone("porte")}</span>`}
    </span>
    <span class="amPop"><i style="width:${Math.max(4,Math.min(100,f.popularite))}%"></i></span>
  </button>`;
}

/* un motif SVG simple, différent par genre */
function motifAffiche(genre){
  const M = {
    "Drame":`<circle cx="30" cy="26" r="13" fill="#fff" opacity=".2"/>`,
    "Aventure":`<path d="M8 44 L24 20 L38 34 L52 12" stroke="#fff" stroke-opacity=".28"
      stroke-width="3" fill="none"/>`,
    "Animation":`<circle cx="20" cy="28" r="9" fill="#fff" opacity=".22"/>
      <circle cx="40" cy="22" r="12" fill="#fff" opacity=".16"/>`,
    "Documentaire":`<rect x="12" y="14" width="36" height="28" fill="none" stroke="#fff"
      stroke-opacity=".28" stroke-width="2.5"/>`,
    "Comédie":`<path d="M14 22 Q30 44 46 22" stroke="#fff" stroke-opacity=".3"
      stroke-width="3" fill="none"/>`,
    "Romance":`<path d="M30 42 Q10 26 20 16 Q30 10 30 22 Q30 10 40 16 Q50 26 30 42Z"
      fill="#fff" opacity=".2"/>`
  };
  return `<svg viewBox="0 0 60 56" class="amSvg">${M[genre] ||
    `<path d="M14 40 L30 14 L46 40 Z" fill="#fff" opacity=".18"/>`}</svg>`;
}

function refuseFilm(id){
  const f = catalogueComplet().find(x=>String(x.id)===String(id));
  if(!f) return;
  toastSocial("Ce film se débloque au niveau " + (f.niveauRequis || "?") + ".");
}

/* ---------- l'affiche s'agrandit avant d'être punaisée ---------- */
function agranditAffiche(id){
  const f = catalogueComplet().find(x=>String(x.id)===String(id));
  if(!f) return;
  const o = document.createElement("div");
  o.className = "voileAffiche"; o.id = "voileAffiche";
  o.innerHTML = `
    <div class="afficheGrande">
      <button class="agFermer" onclick="fermeAffiche()" aria-label="Fermer">✕</button>
      <div class="agPapier" style="background:${f.couleurAffiche}">
        <span class="amMotif grand">${motifAffiche(f.genre)}</span>
        <span class="agTitre" id="agTitre"></span>
        <span class="agGenre">${echappe(f.genre)}</span>
      </div>
      <div class="agInfos">
        <div class="agResume" id="agResume"></div>
        <div class="agLignes">
          <span>${icone("horloge")} ${f.duree} min</span>
          <span>${icone("spectateurs")} popularité ${f.popularite}</span>
          <span>${icone("piece")} ${f.coutLicence ? fmtArgent(coutLicence(f)) : "aucune licence"}</span>
        </div>
      </div>
      <button class="btnRouge agPunaiser" onclick="fermeAffiche(); ouvrePanneau('${f.id}')">
        Punaiser au programme</button>
    </div>`;
  document.body.appendChild(o);
  texteSur(document.getElementById("agTitre"), f.titre);
  texteSur(document.getElementById("agResume"), f.resume || "");
}
function fermeAffiche(){
  const o = document.getElementById("voileAffiche");
  if(o){ o.classList.add("sortie"); setTimeout(()=>o.remove(), 260); }
}

function jaugePopularite(p){
  return `<span class="jaugePop"><i style="width:${Math.max(4,Math.min(100,p))}%"></i></span><span class="popVal">${p}</span>`;
}

function ficheFilm(f){
  const ouvert = filmDebloque(f);
  const cout = coutLicence(f);
  return `<div class="ficheFilm ${ouvert?'':'verrouille'}">
    <div class="ffAffiche" style="background:${f.couleurAffiche}">
      <span class="ffAffTitre">${f.titre}</span>
      <span class="ffAffGenre">${f.genre}</span>
      ${ouvert ? "" : `<span class="ffCadenas">${icone("porte")}</span>`}
    </div>
    <div class="ffCorps">
      <div class="ffHaut">
        <span class="ffTitre">${f.maison?"★ ":""}${f.titre}</span>
        <span class="ffGenre">${f.genre}</span>
      </div>
      <div class="ffResume">${f.resume}</div>
      <div class="ffMeta">
        <span>${icone("horloge")} ${fmtDuree(f.duree)}</span>
        <span>${icone("piece")} ${f.maison ? "licence offerte" : fmtArgent(cout)}</span>
      </div>
      <div class="ffPop">${icone("spectateurs")} Popularité ${jaugePopularite(f.popularite)}</div>
      ${ouvert
        ? `<button class="btnOr btnProg" onclick="ouvrePanneau('${f.id}')">Programmer</button>`
        : `<div class="ffVerrou">Verrouillé · disponible au niveau ${f.niveauRequis}</div>
           <button class="btnOr btnProg" disabled>Programmer</button>`}
    </div>
  </div>`;
}

/* ============================================================
   PANNEAU DE CRÉATION / MODIFICATION D'UNE SÉANCE
   ============================================================ */
function ouvrePanneau(filmId, seanceId){
  const f = filmParId(filmId);
  if(!f || !filmDebloque(f)) return;
  if(sallesDispo.length === 0){ bulleConseil("Il faut au moins une salle. Onglet Salles, deux minutes."); return; }
  if(!seanceId && seancesJour.length >= limiteSeances()){
    bulleConseil(`Limite atteinte : ${limiteSeances()} séances par jour avec ${sallesDispo.length} salle(s). Supprime-en une, ou agrandis le cinéma.`);
    return;
  }
  const dejaVue = seanceId ? seancesJour.find(s=>String(s.id)===String(seanceId)) : null;
  brouillon = {
    id: seanceId || null,
    film_id: filmId,
    salle_id: dejaVue ? dejaVue.salle_id : sallesDispo[0].id,
    heure: dejaVue ? dejaVue.heure : premierHoraireLibre(sallesDispo[0].id, f.duree),
    prix: dejaVue ? Number(dejaVue.prix) : PRIX_DEFAUT
  };
  afficherPanneau();
}

function premierHoraireLibre(salleId, duree){
  const h = horairesDisponibles().find(x=>!chercheConflit({salle_id:salleId, heure:x, duree}));
  return h || horairesDisponibles()[0];
}

function afficherPanneau(){
  const f = filmParId(brouillon.film_id);
  const anciens = document.getElementById("voilePanneau");
  if(anciens) anciens.remove();

  const o = document.createElement("div");
  o.className = "voilePanneau";
  o.id = "voilePanneau";
  o.innerHTML = `
    <div class="panneauSeance">
      <div class="pnEntete" style="background:${f.couleurAffiche}">
        <span class="pnTitre">${f.titre}</span>
        <span class="pnSous">${f.genre} · ${fmtDuree(f.duree)} · licence ${f.maison?"offerte":fmtArgent(coutLicence(f))}</span>
        <button class="pnFermer" onclick="fermePanneau()" aria-label="Fermer">✕</button>
      </div>
      <div class="pnCorps">
        <label class="lblProg">La salle</label>
        <div class="choixSalles" id="choixSalles"></div>

        <label class="lblProg">L'horaire</label>
        <div class="choixHoraires" id="choixHoraires"></div>

        <label class="lblProg">Le prix du billet</label>
        <div class="reglagePrix">
          <button class="btnPrix" onclick="changePrix(-1)">−</button>
          <span class="prixVal" id="prixVal">${brouillon.prix} €</span>
          <button class="btnPrix" onclick="changePrix(1)">+</button>
        </div>
        <input type="range" class="curseurPrix" id="curseurPrix"
          min="${PRIX_MIN}" max="${PRIX_MAX}" step="1" value="${brouillon.prix}"
          oninput="changePrixDirect(this.value)">

        <div class="pnRecap" id="pnRecap"></div>
        <div class="pnBob" id="pnBob"></div>
        <button class="btnRouge btnAjouter" id="btnAjouter" onclick="valideSeance()"></button>
      </div>
    </div>`;
  document.body.appendChild(o);
  rendChoixSalles(); rendChoixHoraires(); majPanneau();
}
function fermePanneau(){
  const o = document.getElementById("voilePanneau");
  if(o){ o.classList.add("sortie"); setTimeout(()=>o.remove(), 260); }
  brouillon = null;
}

function rendChoixSalles(){
  const f = filmParId(brouillon.film_id);
  document.getElementById("choixSalles").innerHTML = sallesDispo.map(s=>{
    const conflit = chercheConflit({salle_id:s.id, heure:brouillon.heure, duree:f.duree, ignorerId:brouillon.id});
    const travaux = s.travaux_fin && new Date(s.travaux_fin).getTime() > Date.now();
    const sel = String(s.id)===String(brouillon.salle_id);
    return `<button class="carteSalleChoix ${sel?'sel':''} ${travaux?'enTravaux':''}" onclick="choisitSalle('${s.id}')">
      <span class="csNom">${s.nom}</span>
      <span class="csMeta">${icone("fauteuil")} ${s.capacite} places · confort ${niveauEquipement(s,"sieges")}/3 · écran ${niveauEquipement(s,"ecran")}/3 · propreté ${Math.round(Number(s.proprete??100))} %</span>
      <span class="csEtat ${conflit?'occupee':travaux?'travaux':'libre'}">
        ${travaux ? "En travaux" : conflit ? "Occupée à " + brouillon.heure : "Libre à " + brouillon.heure}
      </span>
    </button>`;
  }).join("");
}

function rendChoixHoraires(){
  const f = filmParId(brouillon.film_id);
  document.getElementById("choixHoraires").innerHTML = horairesDisponibles().map(h=>{
    const conflit = chercheConflit({salle_id:brouillon.salle_id, heure:h, duree:f.duree, ignorerId:brouillon.id});
    const sel = h===brouillon.heure;
    return `<button class="pastHoraire ${sel?'sel':''} ${conflit?'occupe':''}" onclick="choisitHoraire('${h}')">
      ${h}${conflit?'<i></i>':''}
    </button>`;
  }).join("");
}

function choisitSalle(id){ brouillon.salle_id = id; rendChoixSalles(); rendChoixHoraires(); majPanneau(); }
function choisitHoraire(h){ brouillon.heure = h; rendChoixSalles(); rendChoixHoraires(); majPanneau(); }
function changePrix(d){
  brouillon.prix = Math.max(PRIX_MIN, Math.min(PRIX_MAX, brouillon.prix + d));
  document.getElementById("curseurPrix").value = brouillon.prix;
  majPanneau();
}
function changePrixDirect(v){ brouillon.prix = parseInt(v,10); majPanneau(); }

function majPanneau(){
  const f = filmParId(brouillon.film_id);
  const fin = heureEnMinutes(brouillon.heure) + f.duree;
  const libre = fin + NETTOYAGE_MIN;
  const conflit = chercheConflit({salle_id:brouillon.salle_id, heure:brouillon.heure, duree:f.duree, ignorerId:brouillon.id});
  const salle = sallesDispo.find(s=>String(s.id)===String(brouillon.salle_id));

  document.getElementById("prixVal").textContent = brouillon.prix + " €";
  document.getElementById("pnRecap").innerHTML = `
    <div class="recapLigne">${icone("horloge")} Début <b>${brouillon.heure}</b> · fin prévue <b>${minutesEnHeure(fin)}</b></div>
    <div class="recapLigne">${icone("outil")} Salle libérée à <b>${minutesEnHeure(libre)}</b> <small>(${NETTOYAGE_MIN} min de nettoyage)</small></div>
    <div class="recapLigne">${icone("spectateurs")} Potentiel indicatif <b>≈ ${estimeAudience({film_id:brouillon.film_id, salle_id:brouillon.salle_id, heure:brouillon.heure, prix:brouillon.prix})} spectateurs</b> <small>sur ${salle?salle.capacite:"—"} places</small></div>`;

  /* messages de Bob */
  let bob = "";
  if(conflit){
    const fc = filmParId(conflit.film_id);
    bob = `Deux films dans la même salle au même moment ? Même moi je ne sais pas monter une pellicule aussi vite.<br><small>« ${fc?fc.titre:conflit.film_id} » occupe ${salle?salle.nom:"la salle"} de ${conflit.heure} à ${minutesEnHeure(intervalle(conflit).libre)}.</small>`;
  }
  else if(brouillon.prix < 6) bob = "À ce prix-là, même les pigeons vont demander une place.";
  else if(brouillon.prix > 15) bob = "À ce tarif, j'espère que les fauteuils font aussi le café.";
  const zb = document.getElementById("pnBob");
  zb.className = "pnBob" + (conflit ? " conflit" : "");
  zb.innerHTML = bob ? `<span class="pnBobIco">${icone("cloche")}</span><span>${bob}</span>` : "";
  zb.style.display = bob ? "flex" : "none";

  const btn = document.getElementById("btnAjouter");
  btn.disabled = !!conflit;
  btn.textContent = conflit ? "Créneau occupé" : (brouillon.id ? "Enregistrer les modifications" : "Ajouter au programme");
}

/* ---------- validations (préparées pour un futur passage côté serveur) ---------- */
function verifieSeance(b){
  const f = filmParId(b.film_id);
  if(!Etat.session?.user_id) return "Session expirée. Reconnecte-toi.";
  if(!f) return "Film introuvable.";
  if(!filmDebloque(f)) return `« ${f.titre} » se débloque au niveau ${f.niveauRequis}.`;
  const salle = sallesDispo.find(s=>String(s.id)===String(b.salle_id));
  if(!salle) return "Cette salle n'appartient pas à ton cinéma.";
  if(b.prix < PRIX_MIN || b.prix > PRIX_MAX) return `Le prix doit être entre ${PRIX_MIN} et ${PRIX_MAX} €.`;
  if(!horairesDisponibles().includes(b.heure)) return "Horaire non disponible.";
  if(chercheConflit({salle_id:b.salle_id, heure:b.heure, duree:f.duree, ignorerId:b.id})) return "Créneau déjà occupé dans cette salle.";
  if(!b.id && seancesJour.length >= limiteSeances()) return `Limite de ${limiteSeances()} séances par jour atteinte.`;
  return null;
}

async function valideSeance(){
  const erreur = verifieSeance(brouillon);
  if(erreur){ bulleConseil(erreur); return; }
  const f = filmParId(brouillon.film_id);
  const c = Etat.cinema;
  const salle = sallesDispo.find(s=>String(s.id)===String(brouillon.salle_id));

  const corps = {
    cinema_id: c.id,
    user_id: Etat.session.user_id,
    salle_id: brouillon.salle_id,
    salle: salle.nom,
    jour: c.jour,
    heure: brouillon.heure,
    film_id: brouillon.film_id,
    duree_min: f.duree,
    nettoyage_min: NETTOYAGE_MIN,
    prix: brouillon.prix,
    cout_licence: coutLicence(f),
    statut: "draft"
  };

  if(brouillon.id){
    await sbFetch("seances?id=eq."+brouillon.id, {method:"PATCH", body:corps, prefer:"return=minimal"});
    const i = seancesJour.findIndex(s=>String(s.id)===String(brouillon.id));
    seancesJour[i] = {...seancesJour[i], ...corps};
    bulleConseil(`« ${f.titre} » déplacé à ${brouillon.heure}. Le marquee suit.`);
  }else{
    const res = await sbFetch("seances", {method:"POST", body:corps});
    if(!Array.isArray(res) || !res.length){ bulleConseil("La machine a toussé. Réessaie."); return; }
    seancesJour.push(res[0]);
    bulleConseil(`« ${f.titre} » à ${brouillon.heure} en ${salle.nom}. ` +
      (seancesJour.length >= limiteSeances() ? "Journée complète, patron." : `Encore ${limiteSeances()-seancesJour.length} séance(s) possible(s).`));
  }
  trieSeances();
  fermePanneau();
  rendProgrammeDuJour();
  if((f.genre||"").toLowerCase() === "comédie") await accomplitMission("m_comedie");
}

async function supprimeSeance(id){
  const s = seancesJour.find(x=>String(x.id)===String(id));
  if(!s) return;
  const f = filmParId(s.film_id);
  await sbFetch("seances?id=eq."+id, {method:"DELETE", prefer:"return=minimal"});
  seancesJour = seancesJour.filter(x=>String(x.id)!==String(id));
  Etat.seancesJour = seancesJour;
  rendProgrammeDuJour();
  bulleConseil(`« ${f?f.titre:"La séance"} » retirée du programme.`);
}
function modifieSeance(id){
  const s = seancesJour.find(x=>String(x.id)===String(id));
  if(s) ouvrePanneau(s.film_id, s.id);
}

/* ============================================================
   PROGRAMME DU JOUR
   ============================================================ */
function rendProgrammeDuJour(){
  const el = document.getElementById("programmeJour");
  const limite = limiteSeances();
  const valide = programmeValide() || journeeLancee();

  if(seancesJour.length === 0){
    el.innerHTML = `<div class="vide">Le projecteur est froid.<br>Aucune séance au programme.</div>
      <div class="bilanProg"><span>0 / ${limite} séances</span></div>`;
    document.getElementById("zoneValidation").innerHTML = "";
    return;
  }

  const totalLicence = seancesJour.reduce((t,s)=>t + Number(s.cout_licence||0), 0);
  const totalAudience = seancesJour.reduce((t,s)=>t + estimeAudience(s), 0);

  el.innerHTML = seancesJour.map(s=>{
    const f = filmParId(s.film_id);
    const i = intervalle(s);
    return `<div class="ligneSeance ${valide?'validee':''}">
      <div class="lsHeure">${s.heure}</div>
      <div class="lsCorps">
        <div class="lsTitre">${f?f.titre:s.film_id}</div>
        <div class="lsMeta">${s.salle||"Salle"} · ${fmtDuree(s.duree_min||0)} · billet ${fmtArgent(s.prix)}</div>
        <div class="lsMeta2">Fin prévue ${minutesEnHeure(i.fin)} · licence ${fmtArgent(s.cout_licence)} · ≈ ${estimeAudience(s)} spectateurs</div>
      </div>
      ${valide ? `<span class="lsVerrou">${icone("etoile")}</span>` : `
      <div class="lsActions">
        <button class="btnMini" onclick="modifieSeance('${s.id}')" aria-label="Modifier">${icone("outil")}</button>
        <button class="btnMini danger" onclick="supprimeSeance('${s.id}')" aria-label="Supprimer">✕</button>
      </div>`}
    </div>`;
  }).join("") + `
    <div class="bilanProg">
      <span>${seancesJour.length} / ${limite} séances</span>
      <span>Licences : <b>${fmtArgent(totalLicence)}</b></span>
      <span>Potentiel : <b>≈ ${totalAudience}</b> spectateurs</span>
    </div>`;

  if(journeeLancee()){
    document.getElementById("zoneValidation").innerHTML =
      `<div class="programmeValide">${icone("porte")} Le cinéma est ouvert — programme verrouillé.
        <button class="btnRouvrir" onclick="location.href='bilan.html'">Voir le bilan</button></div>`;
    return;
  }
  document.getElementById("zoneValidation").innerHTML = valide
    ? `<div class="programmeValide">${icone("etoile")} Programme validé — le cinéma peut ouvrir.
         <button class="btnRouvrir" onclick="repasseEnBrouillon()">Modifier encore</button></div>`
    : `<button class="btnRouge btnValider" onclick="validerProgramme()">Valider le programme</button>`;
}

/* ---------- validation du programme ---------- */
async function validerProgramme(){
  if(seancesJour.length === 0) return;
  const c = Etat.cinema;
  await sbFetch(`seances?cinema_id=eq.${c.id}&jour=eq.${c.jour}`,
    {method:"PATCH", body:{statut:"validated"}, prefer:"return=minimal"});
  seancesJour.forEach(s=>s.statut = "validated");
  Etat.seancesJour = seancesJour;
  rendProgrammeDuJour();
  bulleConseil("Programme validé ! Retourne à l'accueil : le marquee est allumé, il ne reste qu'à ouvrir les portes.");
  /* XP : voir EVENEMENTS_XP — attribution branchée à l'étape suivante */
  await declencheEvenement("PROGRAMME_VALIDE");
  if(seancesJour.length >= 3) await declencheEvenement("TROIS_SEANCES_PROGRAMMEES");
}

async function repasseEnBrouillon(){
  const c = Etat.cinema;
  await sbFetch(`seances?cinema_id=eq.${c.id}&jour=eq.${c.jour}`,
    {method:"PATCH", body:{statut:"draft"}, prefer:"return=minimal"});
  seancesJour.forEach(s=>s.statut = "draft");
  rendProgrammeDuJour();
  bulleConseil("Programme rouvert. Tu peux encore tout changer.");
}

/* ---- exports ---- */
export {
  PRIX_MIN,
  afficheMur,
  afficherPanneau,
  agranditAffiche,
  brouillon,
  bulleConseil,
  catalogueComplet,
  changePrix,
  changePrixDirect,
  chargeFilmsMaison,
  chargeSallesProg,
  chargeSeances,
  chercheConflit,
  choisitHoraire,
  choisitSalle,
  conseilProg,
  coutLicence,
  estimeAudience,
  fermeAffiche,
  fermePanneau,
  ficheFilm,
  initProgrammation,
  intervalle,
  jaugePopularite,
  journeeLancee,
  limiteSeances,
  majPanneau,
  modifieSeance,
  motifAffiche,
  ouvrePanneau,
  premierHoraireLibre,
  programmeValide,
  refuseFilm,
  rendCatalogue,
  rendChoixHoraires,
  rendChoixSalles,
  rendProgrammeDuJour,
  repasseEnBrouillon,
  sallesDispo,
  seancesJour,
  supprimeSeance,
  trieSeances,
  valideSeance,
  validerProgramme,
  verifieSeance
};
