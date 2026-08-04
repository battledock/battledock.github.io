/* L'accueil : façade vivante, héros, statut du jour. */

import { phraseFrequentation, phraseNiveau, phraseRecette } from "./ambiance.js";
import { compareHeures, filmParId } from "./data/films.js";
import { chargeJournee, ouvreCinema, statutJournee, verifieOuverture } from "./engine/day.js";
import { animeLeCinema, bobMeteo } from "./facade/life.js";
import { spawnPassant } from "./facade/pedestrians.js";
import { dessineFacadeEvolutive } from "./facade/render.js";
import { animeLaVitalite, remarqueVitalite } from "./facade/vitality.js";
import { Etat, chargeSallesEtat, fmtArgent, statutCinema } from "./game-state.js";
import { bandeauEvenement } from "./pages/parts/events.js";
import { niveauActuel } from "./progression.js";
import { salles } from "./rooms.js";
import { sbFetch } from "./supabase-client.js";
import { echappe, texteSur } from "./ui/emblems.js";
import { A } from "./ui/genre-posters.js";
import { icone } from "./ui/icons.js";

/* Accueil vivant du cinéma (jeu.html) */

const CONSEILS_BOB = [
  "La façade, c'est ton premier film. Les gens la regardent avant d'acheter le billet.",
  "Pense à programmer des séances. Un cinéma sans séance, c'est juste un couloir avec des fauteuils.",
  "Le popcorn se vend mieux quand ça sent le popcorn. Science exacte.",
  "Le quartier parle de toi. En bien pour l'instant. Faisons durer.",
  "Un jour tu produiras tes propres films. J'ai gardé ma caméra au chaud, au cas où.",
  "Balaye entre les rangs 3 et 4. C'est toujours entre les rangs 3 et 4.",
  "La réputation monte lentement et descend vite. Comme moi dans l'escalier de la cabine."
];

const EVENEMENTS_JOUR = [
  {ic:"journal", txt:"Le journal du quartier mentionne ton ouverture."},
  {ic:"cloche", txt:"Un pigeon a tenté d'entrer. Bob a géré. Fièrement."},
  {ic:"spectateurs", txt:"Beau temps : les gens flânent devant la façade."},
  {ic:"billet", txt:"Un enfant a demandé si le cinéma faisait aussi les anniversaires."},
  {ic:"outil", txt:"Bob a nettoyé le hall. Il précise : « à fond »."}
];

async function initAccueil(){
  const c = Etat.cinema;
  try{ await chargeSeancesAccueil(); }catch(e){ Etat.seancesJour = []; }
  try{ await chargeJournee(); }catch(e){}
  try{ await chargeSallesEtat(); }catch(e){}
  dessineFacade(c);
  rendStatut(c);
  rendActionPrincipale();
  rendResume(c);
  rendSeances();
  rendEvenement();
  if(typeof animeLeCinema === "function") rendBandeauMeteo(animeLeCinema());
  /* une fois sur trois, Bob parle du temps plutôt que du cinéma */
  const surEtat = (typeof remarqueVitalite === "function") ? remarqueVitalite() : null;
  const surMeteo = Math.random() < .3 && typeof bobMeteo === "function";
  parleBob("« " + (surEtat && Math.random() < .55 ? surEtat
           : surMeteo ? bobMeteo() : remarqueBob()) + " »");
  if(typeof bandeauEvenement === "function") bandeauEvenement();
  allumage(c);
  /* la rue vit au rythme du cinéma, pas à une cadence fixe */
  if(typeof animeLaVitalite === "function") animeLaVitalite();
  else { setInterval(spawnSpectateur, 1600);
         for(let i=0;i<4;i++) setTimeout(spawnSpectateur, 400 + i*550); }
  let phaseCourante = phaseSelonHeure();
  setInterval(()=>{
    const p = phaseSelonHeure();
    if(p !== phaseCourante){ phaseCourante = p; dessineFacade(Etat.cinema); }
  }, 60000);
  setInterval(()=>parleBob(CONSEILS_BOB[Math.floor(Math.random()*CONSEILS_BOB.length)]), 14000);
}

/* ================== FAÇADE VIVANTE (cycle du ciel + programme réel) ================== */
const PHASES = {
  matin:{
    ciel:["#7fb2d9","#b8d8ec","#eef6f2"],
    astre:{type:"soleil", x:78, y:56, r:15, c:"#fff3c2", halo:"#fff3c2"},
    voisins:"#c9bda6", fenVois:"#9ab0bf", fenOp:.5,
    mur:["#b06078","#96485e","#7c3a4e"],
    vitre:["#9cc0da","#c2dcea","#8cb0ca"],
    halo:0, lumieres:false, etoiles:false,
    trottoir:"#cbbda2", joint:"#a6947a", ombre:.14,
    ambiance:"oiseaux", note:"MATIN · 7h — le cinéma dort encore, le quartier s'éveille"
  },
  aprem:{
    ciel:["#5f9fd6","#8fc3e8","#d8ecf6"],
    astre:{type:"soleil", x:352, y:44, r:17, c:"#ffe9a0", halo:"#ffe9a0"},
    voisins:"#d8c9b0", fenVois:"#8fa8bc", fenOp:.7,
    mur:["#a8506a","#8c3a52","#742e42"],
    vitre:["#7fa8cc","#a8cce4","#6f98bc"],
    halo:0, lumieres:false, etoiles:false,
    trottoir:"#c9baa0", joint:"#a08c6a", ombre:.18,
    ambiance:"nuages", note:"APRÈS-MIDI · 15h — ouvert, séances de journée"
  },
  aube:{
    ciel:["#3a2c5e","#8a5484","#e8956a"],
    astre:{type:"soleil", x:215, y:118, r:22, c:"#ffd98a", halo:"#ff9a5c"},
    voisins:"#4b3852", fenVois:"#ffd98a", fenOp:.85,
    mur:["#7c3450","#61283e","#4c1f30"],
    vitre:["#6a5a8c","#9a7ca8","#54476e"],
    halo:.35, lumieres:true, etoiles:"peu",
    trottoir:"#5c4a54", joint:"#3f3340", ombre:.3,
    ambiance:"aucune", note:"CRÉPUSCULE · 20h — l'heure dorée, les enseignes s'allument"
  },
  nuit:{
    ciel:["#05070f","#141a38","#232c54"],
    astre:{type:"lune", x:374, y:44, r:16},
    voisins:"#10152b", fenVois:"#f2c96a", fenOp:.85,
    mur:["#4f2545","#341629","#26101e"],
    vitre:["#22305a","#3d548c","#1a2547"],
    halo:.5, lumieres:true, etoiles:"plein",
    trottoir:"#0a0d1c", joint:"#1c2440", ombre:0,
    ambiance:"aucune", note:"NUIT · 22h — la pleine séance, le quartier converge"
  }
};


function phaseSelonHeure(){
  const h = new Date().getHours();
  if(h>=6 && h<11) return "matin";
  if(h>=11 && h<18) return "aprem";
  if(h>=18 && h<21) return "aube";
  return "nuit";
}


const COULEURS_GENRE = {
  "Frisson":["#2a1535","#6a3d8c"], "Comédie":["#8c5a1f","#e8a04a"],
  "Drame":["#1f3a5c","#5c88b8"], "Action":["#6e1424","#c83a4a"],
  "SF":["#0f2a38","#2e8ca8"], "Classique":["#3a3126","#8a7a5c"],
  "défaut":["#8c2331","#c86a4a"]
};


/* séances converties pour la façade */
function seancesFacade(){
  return (Etat.seancesJour || []).map(s=>{
    const f = (typeof filmParId==="function" && filmParId(s.film_id)) || {titre:s.film_id, genre:"défaut"};
    return {heure:(s.heure||"").toUpperCase(), titre:f.titre, genre:f.genre||"défaut"};
  });
}

/* affiche de cinéma miniature avec titre réel */
function afficheFilm(x, seance){
  if(!seance){
    return `
    <path d="M${x+66} 224 L${x+62} 306 L${x+66} 310 Z" fill="#000" opacity=".3"/>
    <rect x="${x}" y="222" width="66" height="88" rx="4" fill="#241a12" stroke="#caa24a" stroke-width="3"/>
    <rect x="${x+7}" y="229" width="52" height="60" fill="#1c1626"/>
    <text x="${x+33}" y="255" text-anchor="middle" font-size="16" fill="#8a6c2a">?</text>
    <text x="${x+33}" y="272" text-anchor="middle" font-size="7" fill="#8a6c2a" font-family="Courier New" letter-spacing="1">PROCHAINEMENT</text>
    <text x="${x+33}" y="303" text-anchor="middle" font-size="8" fill="#f2e8d5" font-family="Courier New" letter-spacing="1">BIENTOT</text>`;
  }
  const cg = COULEURS_GENRE[seance.genre] || COULEURS_GENRE["défaut"];
  /* titre découpé en lignes de ~11 caractères */
  const mots = seance.titre.toUpperCase().split(" ");
  const lignes = [];
  let l = "";
  mots.forEach(m=>{ if((l+" "+m).trim().length<=11){ l=(l+" "+m).trim(); } else { lignes.push(l); l=m; } });
  if(l) lignes.push(l);
  const affTitre = lignes.slice(0,3).map((t,i)=>
    `<text x="${x+33}" y="${252+i*9}" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#fdf3d2" font-family="Georgia" letter-spacing=".5">${t}</text>`).join("");
  return `
    <path d="M${x+66} 224 L${x+62} 306 L${x+66} 310 Z" fill="#000" opacity=".3"/>
    <rect x="${x}" y="222" width="66" height="88" rx="4" fill="#241a12" stroke="#caa24a" stroke-width="3"/>
    <rect x="${x+7}" y="229" width="52" height="60" fill="${cg[0]}"/>
    <path d="M${x+7} 289 L${x+7} 269 Q${x+33} 258 ${x+59} 269 L${x+59} 289 Z" fill="${cg[1]}" opacity=".8"/>
    <circle cx="${x+18}" cy="238" r="4" fill="#f7dd9a" opacity=".9"/>
    ${affTitre}
    <path d="M${x+9} 231 L${x+26} 287" stroke="#fff" stroke-opacity=".13" stroke-width="7"/>
    <rect x="${x+11}" y="292" width="44" height="10" rx="2" fill="#fdf8ea"/>
    <text x="${x+33}" y="299.5" text-anchor="middle" font-size="7" font-weight="bold" fill="#241a12" font-family="Courier New" letter-spacing="1">${seance.heure}</text>
    <text x="${x+33}" y="318" text-anchor="middle" font-size="7.5" fill="#f2e8d5" font-family="Courier New" letter-spacing="1">A L'AFFICHE</text>`;
}


/* Rendu de la façade. Le dessin vit dans facade-evo.js ; ici on rassemble
   l'état du jeu et on choisit la cible.
   opts : {cible, seances, phase, niveau} */
function dessineFacade(c, opts = {}){
  const cible = document.getElementById(opts.cible || "facade");
  if(!cible) return;
  const seances = opts.seances
    ? opts.seances.map(x=>({heure:x.heure, titre:x.titre, genre:x.genre || "défaut"}))
    : seancesFacade();
  const niveau = opts.niveau != null ? opts.niveau
    : (typeof niveauActuel === "function" ? niveauActuel() : 1);
  cible.innerHTML = dessineFacadeEvolutive({
    phase: opts.phase || phaseSelonHeure(),
    niveau, nom: c.nom, logo: c.logo, seances
  });
}


/* ---- séquence d'allumage à l'arrivée ---- */
function allumage(c){
  const ens = document.querySelector("#facade text");
  if(!ens || phaseSelonHeure()==="matin" || phaseSelonHeure()==="aprem"){ ditBonjour(c); spawnSpectateur(); return; }
  ens.style.opacity = "0";
  setTimeout(()=>{
    ens.style.transition = "opacity .18s";
    let n = 0;
    const t = setInterval(()=>{
      ens.style.opacity = ens.style.opacity === "1" ? ".25" : "1";
      if(++n >= 5){ clearInterval(t); ens.style.opacity = "1"; ditBonjour(c); }
    }, 160);
  }, 500);
  spawnSpectateur();
}

/* Les passants viennent de passants.js : silhouettes articulées,
   trois plans, reflet au sol quand il fait nuit. */
function spawnSpectateur(){
  const p = phaseSelonHeure();
  spawnPassant(p === "nuit" || p === "crepuscule");
}

/* ==== ÉTAT DU JOUR ==== */
async function chargeSeancesAccueil(){
  const c = Etat.cinema;
  const data = await sbFetch(`seances?cinema_id=eq.${c.id}&jour=eq.${c.jour}&select=*&order=heure`);
  Etat.seancesJour = Array.isArray(data) ? data : [];
}
function statsDuJour(){
  const seances = (Etat.seancesJour || [])
    .slice().sort((a,b)=>compareHeures(a.heure,b.heure))
    .map(s=>{
      const f = (typeof filmParId==="function" && filmParId(s.film_id)) || {titre:s.film_id, genre:"défaut"};
      return {heure:s.heure, titre:f.titre, genre:f.genre, salle:s.salle || "Salle 1",
              duree:s.duree_min, prix:s.prix, statut:s.statut};
    });
  const base = Etat.jourStats || { spectateurs:0, recettes:0, satisfaction:null, ouvert:false };
  return { ...base, seances };
}

/* ==== ACTION PRINCIPALE : évolue selon la situation ==== */
function actionPrincipale(){
  const st = statsDuJour();
  const rt = statutCinema();
  if(rt.code==="travaux_total")
    return {ic:"outil", titre:"Travaux en cours",
            sous:"Le cinéma rouvrira à la fin du chantier", url:"salles.html"};
  if(rt.code==="ferme" && st.seances.length>0)
    return {ic:"horloge", titre:"Le cinéma est fermé",
            sous:rt.libelle.replace("Fermé — ",""), url:null};
  if(st.seances.length === 0)
    return {ic:"pellicule", titre:"Programmer la première séance",
            sous:"Le marquee est vide, le quartier attend", url:"programmation.html"};
  const sj = (typeof statutJournee === "function") ? statutJournee() : "draft";
  if(sj === "running")
    return {ic:"journal", titre:"Voir le bilan de la journée",
            sous:"La journée est jouée — Bob t'attend", url:"bilan.html"};
  const valide = st.seances.every(s=>s.statut === "validated" || s.statut === "running" || s.statut === "completed");
  if(!valide)
    return {ic:"pellicule", titre:"Terminer le programme",
            sous:st.seances.length + " séance(s) en brouillon — à valider", url:"programmation.html"};
  const licences = (Etat.seancesJour||[]).reduce((t,x)=>t+Number(x.cout_licence||0),0);
  return {ic:"porte", titre:"Ouvrir le cinéma",
          sous:`${st.seances.length} séance(s) · licences ${fmtArgent(licences)}`,
          url:null, action:"ouvrir"};
  return {ic:"horloge", titre:"Lancer la journée",
          sous:"Les spectateurs arrivent", url:null, action:"journee"};
}
function rendActionPrincipale(){
  const a = actionPrincipale();
  rendHero(a);
  const el = document.getElementById("actionPrincipale");
  el.innerHTML = `${icone(a.ic,"icoAction")}<span class="apTxt"><span class="apTitre">${a.titre}</span><span class="apSous">${a.sous}</span></span>`;
  el.onclick = ()=>{
    if(a.url){ location.href = a.url; return; }
    if(a.action === "ouvrir") confirmeOuverture();
  };
}

/* ==== CONFIRMATION D'OUVERTURE ==== */
function confirmeOuverture(){
  const v = verifieOuverture();
  if(!v.ok){
    parleBob("« " + v.msg + " »");
    if(v.code === "argent")
      parleBob("« " + v.msg + " Il faut " + fmtArgent(v.licences) + ", tu n'as que " + fmtArgent(Etat.cinema.argent) + ". »");
    return;
  }
  const n = (Etat.seancesJour||[]).length;
  const o = document.createElement("div");
  o.className = "voileConfirm";
  o.innerHTML = `
    <div class="carteConfirm">
      <div class="ccIco">${icone("porte","icoConfirm")}</div>
      <div class="ccTitre">Ouvrir le cinéma ?</div>
      <div class="ccTexte">Une fois le cinéma ouvert, le programme ne pourra plus être modifié.</div>
      <div class="ccResume">
        <span>${n} séance${n>1?"s":""} programmée${n>1?"s":""}</span>
        <span>Coûts de licence : <b>${fmtArgent(v.licences)}</b></span>
      </div>
      <div class="ccBoutons">
        <button class="btnAnnuler" id="ccAnnuler">Annuler</button>
        <button class="btnOr btnOuvrir" id="ccOuvrir">Ouvrir les portes</button>
      </div>
    </div>`;
  document.body.appendChild(o);
  o.querySelector("#ccAnnuler").onclick = ()=>{ o.classList.add("sortie"); setTimeout(()=>o.remove(),260); };
  o.querySelector("#ccOuvrir").onclick = async ()=>{
    o.querySelector("#ccOuvrir").disabled = true;
    o.querySelector("#ccOuvrir").textContent = "Bob ouvre…";
    o.remove();
    await ouvreCinema();
  };
}

/* ==== STATUT + RÉSUMÉ NARRATIF ==== */
function rendStatut(c){
  const st = statutCinema();
  document.getElementById("statutCine").innerHTML = `
    <span class="pastille ${st.pastille}"></span>
    ${st.libelle}
    <span class="statutJour">Jour ${c.jour}</span>`;
}
setInterval(()=>{ if(document.getElementById("statutCine")) rendStatut(Etat.cinema); }, 15000);
function rendResume(c){
  const st = statsDuJour();
  const j = Etat.journee;
  if(j && j.resultats){
    const b = j.resultats;
    document.getElementById("resumeJour").innerHTML =
      ligneResume("spectateurs", `<b>${b.total_spectateurs} spectateurs</b> sont venus aujourd'hui`) +
      ligneResume("piece", `<b>${fmtArgent(b.recettes_brutes)}</b> de recettes`) +
      ligneResume("etoile", `Satisfaction : <b>${b.satisfaction_moyenne} %</b>`) +
      ligneResume("journal", `Le bilan t'attend.`);
    return;
  }
  const lignes = [];
  lignes.push(ligneResume("spectateurs",
    st.spectateurs > 0 ? `<b>${st.spectateurs} spectateurs</b> sont venus aujourd'hui`
                       : `Personne n'est encore venu aujourd'hui`));
  lignes.push(ligneResume("piece",
    st.recettes > 0 ? `<b>${fmtArgent(st.recettes)}</b> de recettes`
                    : `La caisse contient <b>${fmtArgent(c.argent)}</b>`));
  if(st.satisfaction !== null)
    lignes.push(ligneResume("etoile", `Satisfaction : <b>${st.satisfaction} %</b>`));
  lignes.push(ligneResume("maison", `Le loyer du ${nomQuartier(c.quartier).toLowerCase()} coûte <b>${fmtArgent(c.loyer)}</b> par jour`));
  document.getElementById("resumeJour").innerHTML = lignes.join("");
}
function ligneResume(ic, html){
  return `<div class="ligneRecit">${icone(ic)}<span>${html}</span></div>`;
}
const NOMS_QUARTIERS = {centre:"Centre-ville",residentiel:"Quartier résidentiel",etudiant:"Quartier étudiant",populaire:"Quartier populaire",artistique:"Quartier artistique"};
function nomQuartier(q){ return NOMS_QUARTIERS[q] || q; }

/* ==== SÉANCES ==== */
/* Le programme du jour prend la forme d'un panneau lumineux :
   ampoules, heures en pastilles dorées, titres sur fond sombre. */
function rendSeances(){
  const amp = document.getElementById("psAmpoules");
  if(amp && !amp.children.length) amp.innerHTML = "<i></i>".repeat(9);

  const st = statsDuJour();
  const el = document.getElementById("listeSeances");
  if(st.seances.length === 0){
    el.innerHTML = `<div class="psVide">Le panneau est éteint.<br>
      <small>Aucune séance au programme aujourd'hui.</small></div>`;
    return;
  }
  el.innerHTML = st.seances.slice(0, 6).map(s =>
    `<div class="psLigne">
      <span class="psHeure">${echappe(s.heure)}</span>
      <span class="psTitre" data-t="${echappe(s.titre)}"></span>
      <span class="psSalle">${echappe(s.salle || "")}</span>
    </div>`).join("");
  [...el.querySelectorAll(".psTitre")].forEach(n=>texteSur(n, n.dataset.t));
}

/* ==== ÉVÉNEMENT ==== */
function rendEvenement(){
  const ev = EVENEMENTS_JOUR[Math.floor(Math.random()*EVENEMENTS_JOUR.length)];
  document.getElementById("listeEvenements").innerHTML =
    `<div class="ligneRecit">${icone(ev.ic)}<span>${ev.txt}</span></div>`;
}

/* ============================================================
   FAÇADE PUBLIQUE — même fonction, données du profil visité
   ============================================================ */
function rendreFacadePublique(cible, d){
  const cinema = {nom:d.nomCinema, logo:d.logo || "★", quartier:d.quartier};
  dessineFacade(cinema, {
    cible,
    niveau: Number(d.niveau) || 1,
    seances: (d.films || []).map(f=>({heure:f.heure, titre:f.titre, genre:f.genre}))
  });
}

/* décors du trottoir, choisis dans personnalisation.html */
function decorsExterieurs(A, lum){
  const d = A.exterieur || [];
  let out = "";
  if(d.includes("banc")) out += `
    <rect x="46" y="382" width="34" height="4" rx="2" fill="#6b4a2a"/>
    <rect x="49" y="386" width="3" height="9" fill="#4a3520"/><rect x="74" y="386" width="3" height="9" fill="#4a3520"/>
    <rect x="46" y="376" width="34" height="3" rx="1.5" fill="#7d5730"/>`;
  if(d.includes("lampadaire")) out += `
    <rect x="352" y="378" width="5" height="30" rx="2.5" fill="url(#orX)"/>
    <circle cx="354.5" cy="374" r="7" fill="${lum?'#ffdf9a':'#8a7a5c'}" opacity="${lum?'.95':'.5'}"/>
    ${lum?`<circle cx="354.5" cy="374" r="14" fill="#ffdf9a" opacity=".18"/>`:""}`;
  if(d.includes("pot")) out += `
    <ellipse cx="330" cy="396" rx="11" ry="5" fill="#5c4a2a"/>
    <path d="M330 392 q-6 -10 0 -14 q6 4 0 14" fill="#3d6b3a"/>
    <path d="M326 391 q-7 -6 -3 -11 q6 3 3 11" fill="#4a7d46"/>`;
  if(d.includes("panneau")) out += `
    <path d="M96 396 L110 366 L124 396 Z" fill="none" stroke="#5c4720" stroke-width="2.5"/>
    <rect x="99" y="370" width="22" height="20" rx="1.5" fill="#241a12"/>
    <path d="M102 375 h16 M102 380 h13 M102 385 h16" stroke="#caa24a" stroke-width="1"/>`;
  if(d.includes("guirlande")) out += `
    <path d="M120 202 Q167 220 215 206 Q263 220 310 202" stroke="${lum?'#caa24a':'#6e5a48'}" stroke-width="1.6" fill="none"/>
    ${[138,166,194,215,238,266,292].map((x,i)=>{
      const y = 209 + Math.round(7*Math.sin((i/6)*Math.PI));
      return lum ? `<circle cx="${x}" cy="${y}" r="2.8" fill="#ffdf9a" class="clignote" style="animation-delay:${i*.2}s"/>`
                 : `<circle cx="${x}" cy="${y}" r="2.8" fill="#6e5a48" opacity=".6"/>`;
    }).join("")}`;
  return out;
}

/* plaque de niveau apposée près de l'entrée */
function plaqueFacade(A){
  if(!A.plaque) return "";
  return `<g transform="translate(300 250)">
    <rect x="0" y="0" width="46" height="26" rx="3" fill="url(#orX)" stroke="#5c4720" stroke-width="1.5"/>
    <text x="23" y="11" text-anchor="middle" font-family="Courier New" font-size="5.5"
      letter-spacing=".6" fill="#3a2408">CINEMA RECONNU</text>
    <text x="23" y="20" text-anchor="middle" font-family="Courier New" font-size="5.5"
      letter-spacing=".6" fill="#3a2408">DU QUARTIER</text>
  </g>`;
}

/* ---- Bob ---- */
function parleBob(t){
  const b = document.getElementById("bulleAccueil");
  const txt = document.getElementById("bulleTexteAccueil");
  b.classList.add("fondu");
  setTimeout(()=>{txt.textContent = t; b.classList.remove("fondu")},180);
}
function ditBonjour(c){
  const st = statsDuJour();
  if(st.seances.length && !st.seances.every(s=>s.statut==="validated")){
    parleBob(`Le programme est prêt mais pas validé, ${c.directeur}. Un dernier coup d'œil et on allume ?`);
    return;
  }
  if(st.seances.length === 0)
    parleBob(`${c.directeur}… le marquee est vide. Un cinéma sans séance, c'est un couloir avec des fauteuils. On programme ?`);
  else
    parleBob(`Bienvenue chez toi, ${c.directeur}. ${c.nom}, jour ${c.jour}. Ça sonne bien, non ?`);
}


/* ============================================================
   LE HÉROS DE L'ACCUEIL
   Une phrase d'ambiance devant, les chiffres derrière.
   ============================================================ */
function rendHero(a){
  const c = Etat.cinema;
  const st = statutCinema();
  const seances = (Etat.seancesJour || []).length;
  const niveau = (typeof niveauActuel === "function") ? niveauActuel() : 1;

  texteSur(document.getElementById("heroSurtitre"), "Jour " + c.jour + " · " + st.libelle.split(" — ")[0]);
  texteSur(document.getElementById("heroTitre"), a.titre);

  let phrase;
  const j = Etat.journee;
  if(j?.statut === "running" && j.resultats){
    const r = j.resultats;
    phrase = phraseFrequentation(r.total_spectateurs, capaciteTotale())
           + " " + phraseRecette(r.benefice_net);
  }else if(seances === 0){
    phrase = "L'écran est encore éteint. Il attend un programme.";
  }else{
    phrase = seances + " séance" + (seances>1?"s":"") + " au programme. "
           + phraseNiveau(niveau);
  }
  texteSur(document.getElementById("heroPhrase"), phrase);

  document.getElementById("heroChiffres").innerHTML = `
    <div><b>${fmtArgent(c.argent)}</b><span>en caisse</span></div>
    <div><b>${c.reputation}</b><span>réputation</span></div>
    <div><b>${seances}</b><span>séance${seances>1?"s":""}</span></div>`;
}

function capaciteTotale(){
  return (Etat.salles || []).reduce((n,s)=>n + (Number(s.capacite)||0), 0) || 60;
}


/* ============================================================
   BOB VIT SA VIE — remarques d'ambiance selon le moment
   ============================================================ */
const REMARQUES_BOB = {
  matin: ["Il est tôt. Le hall sent encore le produit d'entretien. J'aime bien.",
          "Les oiseaux sont déjà debout. Eux non plus n'ont pas de projecteur à régler.",
          "Café pris, bobines vérifiées. Enfin, café pris."],
  apresmidi: ["L'après-midi, c'est le public des habitués. Ils connaissent leur rang.",
              "Il fait bon dans la salle. Presque trop, on va en perdre un ou deux au rang 8.",
              "Le trottoir est calme. Ça viendra vers dix-huit heures."],
  soir: ["C'est l'heure. Les gens sortent, ils cherchent une lumière. On en a une.",
         "L'enseigne s'allume. Petit frisson à chaque fois, même après vingt ans.",
         "Belle soirée pour une séance. Je le dis toutes les soirées, mais là je le pense."],
  nuit: ["La dernière séance, c'est ma préférée. Moins de monde, plus de silence.",
         "À cette heure-ci, on ne vient pas par hasard. On vient pour le film.",
         "La ville dort. Nous, on projette."]
};
const REMARQUES_ETAT = {
  sale: "Le sol colle un peu au rang 4. Je dis ça, je ne dis rien.",
  usee: "Un fauteuil grince. Deux, en fait. Ils se répondent.",
  vide: "Aucune séance au programme. L'écran fait la tête.",
  pleine: "Hier soir on a refusé du monde. Le quartier parle de nous."
};

function remarqueBob(){
  const salles = Etat.salles || [];
  const propSale = salles.some(s=>Number(s.proprete||100) < 55);
  const usee = salles.some(s=>Number(s.etat||100) < 60);
  const vide = (Etat.seancesJour||[]).length === 0;
  const comble = Etat.journee?.resultats?.salle_complete;

  /* les remarques utiles passent devant les remarques d'ambiance */
  if(vide) return REMARQUES_ETAT.vide;
  if(propSale) return REMARQUES_ETAT.sale;
  if(usee) return REMARQUES_ETAT.usee;
  if(comble) return REMARQUES_ETAT.pleine;

  const h = new Date().getHours();
  const moment = h < 11 ? "matin" : h < 17 ? "apresmidi" : h < 22 ? "soir" : "nuit";
  const liste = REMARQUES_BOB[moment];
  return liste[Math.floor(Math.random() * liste.length)];
}


/* ---------- bandeau météo, discret sous la façade ---------- */
function rendBandeauMeteo(meteo){
  const el = document.getElementById("bandeauMeteo");
  if(!el || !meteo) return;
  const ICO = {clair:"etoile", nuages:"maison", pluie:"cloche", brume:"porte", vent:"pellicule"};
  const NOM = {clair:"Beau temps", nuages:"Ciel couvert", pluie:"Pluie",
               brume:"Brume", vent:"Vent"};
  el.innerHTML = icone(ICO[meteo] || "etoile") + "<span></span>";
  texteSur(el.querySelector("span"), NOM[meteo] || "");
}

/* ---- exports ---- */
export {
  CONSEILS_BOB,
  COULEURS_GENRE,
  EVENEMENTS_JOUR,
  NOMS_QUARTIERS,
  PHASES,
  REMARQUES_BOB,
  REMARQUES_ETAT,
  actionPrincipale,
  afficheFilm,
  allumage,
  capaciteTotale,
  chargeSeancesAccueil,
  confirmeOuverture,
  decorsExterieurs,
  dessineFacade,
  ditBonjour,
  initAccueil,
  ligneResume,
  nomQuartier,
  parleBob,
  phaseSelonHeure,
  plaqueFacade,
  remarqueBob,
  rendActionPrincipale,
  rendBandeauMeteo,
  rendEvenement,
  rendHero,
  rendResume,
  rendSeances,
  rendStatut,
  rendreFacadePublique,
  seancesFacade,
  spawnSpectateur,
  statsDuJour
};
