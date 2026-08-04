/* Programmation : mur d'affiches et grille des séances. */

import { CATALOGUE_FILMS } from "./data/films.js";
import {
  NETTOYAGE_MIN,
  compareHeures,
  filmDebloque,
  filmParId,
  fmtDuree,
  fmtDureeHeures,
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
import { afficheDeGenre, genreConnu } from "./ui/genre-posters.js";
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
let vueProg = "affiche";
let evenementsProg = [];

async function initProgrammation(){
  await chargeJournee();
  await chargeSallesProg();
  await chargeFilmsMaison();
  await chargeSeances();
  brancheSegments();
  rendVue();
  installeFleches();
}

/* les trois onglets du haut */
function brancheSegments(){
  document.querySelectorAll("#segments button").forEach(b=>{
    b.addEventListener("click", ()=>{
      if(vueProg === b.dataset.vue) return;
      document.querySelectorAll("#segments button").forEach(x=>{
        x.classList.remove("on"); x.setAttribute("aria-selected","false");
      });
      b.classList.add("on"); b.setAttribute("aria-selected","true");
      vueProg = b.dataset.vue;
      rendVue();
      const piste = document.getElementById("pisteAffiches");
      if(piste) piste.scrollTo({left:0, behavior:"smooth"});
    });
  });
}

const SOUS_TITRES = {
  affiche:"À l'affiche aujourd'hui",
  catalogue:"Au catalogue cette semaine",
  evenements:"Ce qui se passe dans le quartier"
};
const PLAQUES = {affiche:"Aujourd'hui", catalogue:"Au catalogue", evenements:"Le quartier"};

/* rendu complet d'une vue : fronton, carrousel, tableau, Bob */
async function rendVue(){
  const st = document.getElementById("sousTitre");
  if(st) texteSur(st, SOUS_TITRES[vueProg]);
  const pl = document.getElementById("plaqueJour");
  if(pl) texteSur(pl, PLAQUES[vueProg]);
  const bj = document.getElementById("badgeJourTxt");
  if(bj) bj.textContent = "Jour " + (Etat.cinema?.jour || 1);

  if(vueProg === "affiche"){ rendVueAffiche(); }
  else if(vueProg === "catalogue"){ rendVueCatalogue(); }
  else{ await rendVueEvenements(); }

  bulleConseil(conseilDeLaVue());
  majFleches();
}

function conseilDeLaVue(){
  if(vueProg === "catalogue"){
    const dispo = catalogueComplet().filter(f=>filmDebloque(f)).length;
    return dispo > 0
      ? `${dispo} films sont à ta portée. Regarde la popularité avant le prix : un film cher qui remplit vaut mieux qu'un film gratuit qui vide la salle.`
      : "Le catalogue s'étoffera avec les niveaux. Pour l'instant, on fait avec ce qu'on a.";
  }
  if(vueProg === "evenements"){
    const actifs = evenementsProg.filter(e=>e.actif).length;
    return actifs > 0
      ? "Un événement est en cours dans le quartier. C'est le moment de remplir les salles."
      : "Rien en ce moment dans le quartier. Ça ne saurait tarder, il y a toujours quelque chose.";
  }
  return conseilProg();
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
  const nouvelle = document.getElementById("bulleProg");
  if(nouvelle){ texteSur(nouvelle, t); return; }
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
      <div class="agPapier">
        ${afficheDeGenre(genreConnu(f.genre))}
        <span class="agVoile"></span>
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
  rendVue();
  if((f.genre||"").toLowerCase() === "comédie") await accomplitMission("m_comedie");
}

async function supprimeSeance(id){
  const s = seancesJour.find(x=>String(x.id)===String(id));
  if(!s) return;
  const f = filmParId(s.film_id);
  await sbFetch("seances?id=eq."+id, {method:"DELETE", prefer:"return=minimal"});
  seancesJour = seancesJour.filter(x=>String(x.id)!==String(id));
  Etat.seancesJour = seancesJour;
  rendVue();
  bulleConseil(`« ${f?f.titre:"La séance"} » retirée du programme.`);
}
function modifieSeance(id){
  const s = seancesJour.find(x=>String(x.id)===String(id));
  if(s) ouvrePanneau(s.film_id, s.id);
}

/* ============================================================
   PROGRAMME DU JOUR
   ============================================================ */
/* ============================================================
   VUE 1 — À L'AFFICHE : les séances du jour
   ============================================================ */
function rendVueAffiche(){
  const limite = limiteSeances();
  const valide = programmeValide() || journeeLancee();

  /* le carrousel montre une affiche par séance */
  const piste = document.getElementById("pisteAffiches");
  if(seancesJour.length === 0){
    piste.innerHTML = `<div class="pisteVide">Le projecteur est froid.<br>
      <small>Aucune séance au programme.</small></div>`;
  }else{
    piste.innerHTML = seancesJour.map(s=>{
      const f = filmParId(s.film_id);
      const passee = seanceCommencee(s);
      return carteAffiche({
        genre: f ? f.genre : "Drame",
        titre: f ? f.titre : s.film_id,
        ligne: s.heure,
        etat: passee ? "En cours" : "À venir",
        classe: passee ? "cours" : "venir",
        action: valide ? "" : `modifieSeance('${s.id}')`
      });
    }).join("");
  }

  /* le tableau reprend le détail, ligne à ligne */
  const tab = document.getElementById("tableauProg");
  if(seancesJour.length === 0){
    tab.innerHTML = `<div class="videProg">Rien à l'affiche pour l'instant.<br>
      <small>Choisis un film dans « Prochains films » pour ouvrir ta première séance.</small></div>
      ${boutonsProg(valide)}`;
    document.getElementById("zoneValidation").innerHTML = "";
    return;
  }

  const totalLicence = seancesJour.reduce((t,s)=>t + Number(s.cout_licence||0), 0);
  const totalAudience = seancesJour.reduce((t,s)=>t + estimeAudience(s), 0);

  tab.innerHTML = seancesJour.map(s=>{
    const f = filmParId(s.film_id);
    const cap = capaciteSalle(s.salle_id);
    const taux = cap ? Math.min(100, Math.round(estimeAudience(s) / cap * 100)) : 0;
    return `<div class="rangProg ${valide?'verrouille':''}"
      onclick="${valide ? '' : `modifieSeance('${s.id}')`}">
      <span class="rpHeure">${echappe(s.heure)}</span>
      <span class="rpMid">
        <b>${echappe((f ? f.titre : s.film_id).toUpperCase())}</b>
        <span>${echappe(f ? f.genre : "")} • ${fmtDuree(s.duree_min||0)} • ${echappe(s.salle||"Salle")}</span>
      </span>
      <span class="rpDr">
        <b class="${classeTaux(taux)}">${taux}%</b>
        <span>${cap} places</span>
      </span>
      <span class="rpChev">${valide ? icone("etoile") : "›"}</span>
    </div>`;
  }).join("") + `
    <div class="bilanProg">
      <span>${seancesJour.length} / ${limite} séances</span>
      <span>Licences <b>${fmtArgent(totalLicence)}</b></span>
      <span>Potentiel <b>≈ ${totalAudience}</b></span>
    </div>
    ${boutonsProg(valide)}`;

  rendValidation(valide);
}

function boutonsProg(valide){
  if(valide) return "";
  const plein = seancesJour.length >= limiteSeances();
  return `<div class="actionsProg">
    <button class="btnOrProg" onclick="allerAuCatalogue()" ${plein?"disabled":""}>
      ${plein ? "Toutes les séances sont posées" : "+ Ajouter une séance"}</button>
    ${seancesJour.length ? `<button class="btnVideProg" onclick="validerProgramme()">
      Valider le programme</button>` : ""}
  </div>`;
}

function rendValidation(valide){
  const z = document.getElementById("zoneValidation");
  if(!z) return;
  if(journeeLancee()){
    z.innerHTML = `<div class="programmeValide">${icone("porte")}
      Le cinéma est ouvert — programme verrouillé.
      <button class="btnRouvrir" onclick="location.href='bilan.html'">Voir le bilan</button></div>`;
  }else if(valide){
    z.innerHTML = `<div class="programmeValide">${icone("etoile")}
      Programme validé — le cinéma peut ouvrir.
      <button class="btnRouvrir" onclick="repasseEnBrouillon()">Modifier encore</button></div>`;
  }else{
    z.innerHTML = "";
  }
}

function allerAuCatalogue(){
  const b = document.querySelector('#segments button[data-vue="catalogue"]');
  if(b) b.click();
}

/* une séance a-t-elle déjà commencé ? */
function seanceCommencee(s){
  if(!journeeLancee()) return false;
  const now = new Date();
  const [h,m] = String(s.heure||"0:0").split(/[h:]/).map(n=>parseInt(n,10)||0);
  return (now.getHours()*60 + now.getMinutes()) >= (h*60 + m);
}

function capaciteSalle(id){
  const s = (sallesDispo||[]).find(x=>String(x.id) === String(id));
  return s ? Number(s.capacite)||0 : 0;
}
function classeTaux(t){ return t >= 70 ? "haut" : t >= 40 ? "moyen" : "bas"; }

/* ============================================================
   VUE 2 — PROCHAINS FILMS : le catalogue
   ============================================================ */
function rendVueCatalogue(){
  const films = catalogueComplet();
  const ouverts = films.filter(f=>filmDebloque(f));
  const fermes  = films.filter(f=>!filmDebloque(f));

  document.getElementById("pisteAffiches").innerHTML =
    (ouverts.length ? ouverts : films).slice(0, 12).map(f=>carteAffiche({
      genre: f.genre, titre: f.titre,
      ligne: f.coutLicence ? fmtArgent(coutLicence(f)) : "Libre de droits",
      etat: filmDebloque(f) ? "Disponible" : "Niveau " + (f.niveauRequis||"?"),
      classe: filmDebloque(f) ? "libre" : "ferme",
      action: filmDebloque(f) ? `agranditAffiche('${f.id}')` : `refuseFilm('${f.id}')`,
      maison: !!f.maison
    })).join("");

  document.getElementById("tableauProg").innerHTML =
    ouverts.map(f=>`
      <div class="rangProg" onclick="ouvrePanneau('${f.id}')">
        <span class="rpHeure">${f.coutLicence ? fmtArgent(coutLicence(f)) : "—"}</span>
        <span class="rpMid"><b>${echappe(f.titre.toUpperCase())}</b>
          <span>${echappe(f.genre)} • ${fmtDuree(f.duree)}${f.maison ? " • production maison" : ""}</span></span>
        <span class="rpDr"><b class="${classeTaux(f.popularite)}">${f.popularite}</b>
          <span>Popularité</span></span>
        <span class="rpChev">›</span>
      </div>`).join("") +
    (fermes.length ? `<div class="aVenirProg">${icone("porte")}
      ${fermes.length} film${fermes.length>1?"s":""} se débloque${fermes.length>1?"nt":""}
      avec les niveaux suivants.</div>` : "") + `
    <div class="actionsProg">
      <button class="btnOrProg" onclick="allerAuProgramme()">Voir mon programme</button>
      <button class="btnVideProg" onclick="location.href='studio.html'">Mes productions</button>
    </div>`;
  document.getElementById("zoneValidation").innerHTML = "";
}

function allerAuProgramme(){
  const b = document.querySelector('#segments button[data-vue="affiche"]');
  if(b) b.click();
}

/* ============================================================
   VUE 3 — ÉVÉNEMENTS : ce qui se passe dans le quartier
   ============================================================ */
async function rendVueEvenements(){
  const piste = document.getElementById("pisteAffiches");
  const tab = document.getElementById("tableauProg");
  document.getElementById("zoneValidation").innerHTML = "";

  if(!evenementsProg.length){
    piste.innerHTML = `<div class="pisteVide">On regarde…</div>`;
    try{
      const r = await rpc("get_active_community_events", {p_cinema_id: Etat.cinema.id});
      evenementsProg = Array.isArray(r) ? r : (r?.evenements || []);
    }catch(e){ evenementsProg = []; }
  }

  if(!evenementsProg.length){
    piste.innerHTML = `<div class="pisteVide">Rien à l'horizon.<br>
      <small>Le quartier est calme cette semaine.</small></div>`;
    tab.innerHTML = `<div class="videProg">Aucun événement en cours.<br>
      <small>Les festivals reviennent régulièrement, reste à l'écoute.</small></div>
      <div class="actionsProg">
        <button class="btnOrProg" onclick="location.href='evenements.html'">
          Voir les festivals passés</button>
      </div>`;
    return;
  }

  piste.innerHTML = evenementsProg.slice(0, 8).map(e=>carteAffiche({
    genre: e.genre_favori || "Culte",
    titre: e.nom || "Événement",
    ligne: e.actif ? "En cours" : "Bientôt",
    etat: e.heures_restantes ? fmtDureeHeures(e.heures_restantes) : (e.actif ? "En cours" : "À venir"),
    classe: e.actif ? "cours" : "venir",
    action: `location.href='evenements.html'`
  })).join("");

  tab.innerHTML = evenementsProg.map(e=>`
    <div class="rangProg" onclick="location.href='evenements.html'">
      <span class="rpHeure">${e.actif ? "Actif" : "Bientôt"}</span>
      <span class="rpMid"><b>${echappe((e.nom||"Événement").toUpperCase())}</b>
        <span>${echappe(e.description || e.resume || "")}</span></span>
      <span class="rpDr"><b class="${e.actif ? "haut" : "moyen"}">
        ${Number(e.participants||0)}</b><span>participants</span></span>
      <span class="rpChev">›</span>
    </div>`).join("") + `
    <div class="actionsProg">
      <button class="btnOrProg" onclick="location.href='evenements.html'">Participer</button>
      <button class="btnVideProg" onclick="location.href='progression.html'">Mes récompenses</button>
    </div>`;
}

/* ============================================================
   LA CARTE D'AFFICHE, commune aux trois vues
   ============================================================ */
function carteAffiche(o){
  return `<button class="carteAff ${o.classe === "ferme" ? "verrouillee" : ""}"
    ${o.action ? `onclick="${o.action}"` : ""} aria-label="${echappe(o.titre)}">
    <span class="cadreAff">
      ${afficheDeGenre(genreConnu(o.genre))}
      <span class="genreEt">${echappe(o.genre)}</span>
      ${o.maison ? `<span class="maisonEt">Maison</span>` : ""}
      ${o.classe === "ferme" ? `<span class="voileVerrou">${icone("porte")}</span>` : ""}
    </span>
    <span class="titreAff">${echappe(o.titre)}</span>
    <span class="ligneAff">${echappe(o.ligne)}</span>
    <span class="etatAff ${o.classe}">${echappe(o.etat)}</span>
  </button>`;
}

/* ---------- les flèches du carrousel ---------- */
function installeFleches(){
  const piste = document.getElementById("pisteAffiches");
  const g = document.getElementById("flecheG"), d = document.getElementById("flecheD");
  if(!piste || !g || !d) return;
  g.addEventListener("click", ()=>piste.scrollBy({left:-138, behavior:"smooth"}));
  d.addEventListener("click", ()=>piste.scrollBy({left: 138, behavior:"smooth"}));
  piste.addEventListener("scroll", majFleches, {passive:true});
  window.addEventListener("resize", majFleches);
}

/* elles s'éteignent quand il n'y a rien à faire défiler */
function majFleches(){
  const p = document.getElementById("pisteAffiches");
  const g = document.getElementById("flecheG"), d = document.getElementById("flecheD");
  if(!p || !g || !d) return;
  const debord = p.scrollWidth > p.clientWidth + 4;
  g.classList.toggle("eteinte", !debord || p.scrollLeft < 6);
  d.classList.toggle("eteinte", !debord || p.scrollLeft > p.scrollWidth - p.clientWidth - 6);
}

/* la bulle de Bob */
function bulleProgTexte(t){
  const el = document.getElementById("bulleProg");
  if(el) texteSur(el, t);
}

/* ---------- validation du programme ---------- */
async function validerProgramme(){
  if(seancesJour.length === 0) return;
  const c = Etat.cinema;
  await sbFetch(`seances?cinema_id=eq.${c.id}&jour=eq.${c.jour}`,
    {method:"PATCH", body:{statut:"validated"}, prefer:"return=minimal"});
  seancesJour.forEach(s=>s.statut = "validated");
  Etat.seancesJour = seancesJour;
  rendVue();
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
  rendVue();
  bulleConseil("Programme rouvert. Tu peux encore tout changer.");
}

/* ---- exports ---- */
export {
  PLAQUES,
  PRIX_MIN,
  SOUS_TITRES,
  afficherPanneau,
  agranditAffiche,
  allerAuCatalogue,
  allerAuProgramme,
  boutonsProg,
  brancheSegments,
  brouillon,
  bulleConseil,
  bulleProgTexte,
  capaciteSalle,
  carteAffiche,
  catalogueComplet,
  changePrix,
  changePrixDirect,
  chargeFilmsMaison,
  chargeSallesProg,
  chargeSeances,
  chercheConflit,
  choisitHoraire,
  choisitSalle,
  classeTaux,
  conseilDeLaVue,
  conseilProg,
  coutLicence,
  estimeAudience,
  evenementsProg,
  fermeAffiche,
  fermePanneau,
  initProgrammation,
  installeFleches,
  intervalle,
  journeeLancee,
  limiteSeances,
  majFleches,
  majPanneau,
  modifieSeance,
  ouvrePanneau,
  premierHoraireLibre,
  programmeValide,
  refuseFilm,
  rendChoixHoraires,
  rendChoixSalles,
  rendValidation,
  rendVue,
  rendVueAffiche,
  rendVueCatalogue,
  rendVueEvenements,
  repasseEnBrouillon,
  sallesDispo,
  seanceCommencee,
  seancesJour,
  supprimeSeance,
  trieSeances,
  valideSeance,
  validerProgramme,
  verifieSeance,
  vueProg
};

/* ---- gestionnaires en attribut ---- */
/* Ces fonctions sont appelées depuis des attributs onclick écrits
   dans le HTML généré. Un module ES n'expose rien globalement :
   on les rend accessibles explicitement. */
Object.assign(window, {
  agranditAffiche,
  allerAuCatalogue,
  allerAuProgramme,
  changePrix,
  changePrixDirect,
  choisitHoraire,
  choisitSalle,
  fermeAffiche,
  fermePanneau,
  modifieSeance,
  ouvrePanneau,
  refuseFilm,
  repasseEnBrouillon,
  supprimeSeance,
  valideSeance,
  validerProgramme
});
