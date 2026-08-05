import { obtenirNiveauVisuelCinema } from "./upgrades.js?v=df10ae9b";
import { Etat, depense } from "../game-state.js?v=df10ae9b";
import { majHeaderArgent } from "../navigation.js?v=df10ae9b";
import { niveauActuel } from "../progression.js?v=df10ae9b";
import { salles } from "../rooms.js?v=df10ae9b";
import { sbFetch } from "../supabase-client.js?v=df10ae9b";

/* ============================================================
   PERSONNALISATION — catalogue, possession, sélection
   Cosmétique uniquement : aucun bonus de gameplay ici.
   ============================================================ */
const CATALOGUE_PERSO = {
  enseigne: {
    nom:"Enseigne", ic:"batiment", cleDeblocage:"enseigne", champ:"style_enseigne",
    items:[
      {id:"classic",  nom:"Classique dorée", desc:"Lettres d'or sur velours.",        niveauRequis:1, cout:0, couleur:"#f7dd9a", halo:"#f7dd9a"},
      {id:"rouge",    nom:"Lettres rouges",  desc:"Néon rubis, façon années 50.",     niveauRequis:2, cout:0, couleur:"#ff7a6a", halo:"#ff4a3a"},
      {id:"creme",    nom:"Enseigne crème",  desc:"Sobre, laiteuse, élégante.",       niveauRequis:2, cout:0, couleur:"#fdf6e0", halo:"#fff4c8"},
      {id:"turquoise",nom:"Néon turquoise",  desc:"Le quartier la verra de loin.",    niveauRequis:17,cout:400,couleur:"#7fe8dc", halo:"#3ad8c8"}
    ]
  },
  facade: {
    nom:"Façade", ic:"outil", cleDeblocage:"facade_couleurs", champ:"style_facade",
    items:[
      {id:"bordeaux", nom:"Bordeaux classique", desc:"La couleur d'origine du Rex.",  niveauRequis:1, cout:0, mur:["#a8506a","#8c3a52","#742e42"], murNuit:["#4f2545","#341629","#26101e"]},
      {id:"bleunuit", nom:"Bleu nuit",          desc:"Profond, avec détails dorés.",  niveauRequis:7, cout:0, mur:["#3a5a8c","#2a4268","#1e3050"], murNuit:["#243a5e","#182742","#101c30"]},
      {id:"vert",     nom:"Vert impérial",      desc:"Un vert sombre et cossu.",      niveauRequis:7, cout:0, mur:["#3a6b52","#2a5040","#1e3a2e"], murNuit:["#22402f","#16301f","#0e2016"]},
      {id:"creme",    nom:"Crème parisien",     desc:"Pierre claire et zinc.",        niveauRequis:7, cout:250,mur:["#d8c4a0","#c0aa86","#a8926e"], murNuit:["#6a5a44","#4c4030","#342a20"]},
      {id:"artdeco",  nom:"Art déco noir et or",desc:"Laque noire, filets dorés.",    niveauRequis:7, cout:600,mur:["#3a3436","#262224","#171416"], murNuit:["#241f22","#161314","#0c0a0b"], filetsOr:true}
    ]
  },
  hall: {
    nom:"Hall", ic:"maison", cleDeblocage:"deco_hall", champ:"hall",  emplacements:true,
    zones:[
      {id:"mur",      nom:"Mur principal", objets:[
        {id:"aucun", nom:"Mur nu", cout:0, niveauRequis:1},
        {id:"cadres", nom:"Cadres anciens", cout:0,  niveauRequis:3},
        {id:"affiches", nom:"Affiches d'époque", cout:120, niveauRequis:3},
        {id:"fresque", nom:"Fresque peinte", cout:450, niveauRequis:7}]},
      {id:"gauche",   nom:"Coin gauche", objets:[
        {id:"aucun", nom:"Rien", cout:0, niveauRequis:1},
        {id:"plante", nom:"Grande plante", cout:0, niveauRequis:3},
        {id:"fauteuil", nom:"Fauteuil d'attente", cout:180, niveauRequis:3}]},
      {id:"droite",   nom:"Coin droit", objets:[
        {id:"aucun", nom:"Rien", cout:0, niveauRequis:1},
        {id:"vitrine", nom:"Vitrine à souvenirs", cout:150, niveauRequis:3},
        {id:"horloge", nom:"Horloge murale", cout:90, niveauRequis:3}]},
      {id:"sol",      nom:"Sol", objets:[
        {id:"parquet", nom:"Parquet d'origine", cout:0, niveauRequis:1},
        {id:"tapis", nom:"Tapis d'entrée", cout:0, niveauRequis:3},
        {id:"damier", nom:"Carrelage damier", cout:300, niveauRequis:7}]},
      {id:"comptoir", nom:"Comptoir", objets:[
        {id:"bois", nom:"Comptoir en bois", cout:0, niveauRequis:1},
        {id:"laiton", nom:"Comptoir laiton", cout:220, niveauRequis:5},
        {id:"marbre", nom:"Comptoir marbre", cout:700, niveauRequis:17}]}
    ]
  },
  exterieur: {
    nom:"Extérieur", ic:"maison", cleDeblocage:"deco_exterieur", champ:"exterieur", multiple:true,
    items:[
      {id:"banc",       nom:"Banc",                desc:"Pour patienter avant la séance.", niveauRequis:6, cout:0},
      {id:"lampadaire", nom:"Lampadaire",          desc:"Lumière chaude sur le trottoir.", niveauRequis:6, cout:0},
      {id:"pot",        nom:"Pot de fleurs",       desc:"Bob l'arrose. Parfois.",          niveauRequis:6, cout:80},
      {id:"panneau",    nom:"Panneau sur trottoir",desc:"Le programme, écrit à la craie.", niveauRequis:6, cout:120},
      {id:"guirlande",  nom:"Guirlande lumineuse", desc:"Suspendue au-dessus de l'entrée.",niveauRequis:6, cout:200}
    ]
  },
  sieges: {
    nom:"Fauteuils", ic:"fauteuil", cleDeblocage:"couleurs_sieges", champ:"couleur_sieges",
    items:[
      {id:"rouge",    nom:"Velours rouge",  desc:"Le classique absolu.",     niveauRequis:4, cout:0, couleur:"#a82b3d"},
      {id:"bordeaux", nom:"Bordeaux",       desc:"Plus sombre, plus feutré.",niveauRequis:4, cout:0, couleur:"#6e1424"},
      {id:"bleu",     nom:"Bleu nuit",      desc:"Inattendu et chic.",       niveauRequis:4, cout:0, couleur:"#2a3a6b"},
      {id:"vert",     nom:"Vert bouteille", desc:"Comme un vieux fumoir.",   niveauRequis:4, cout:0, couleur:"#2a5a42"}
    ]
  },
  plaque: {
    nom:"Plaques", ic:"etoile", cleDeblocage:null, champ:"plaque",
    items:[
      {id:"aucune",          nom:"Aucune plaque", desc:"Discret.", niveauRequis:1, cout:0},
      {id:"plaque_quartier", nom:"Cinéma reconnu du quartier", desc:"Récompense du niveau 10.", niveauRequis:10, cout:0, reclamee:true}
    ]
  }
};

/* ---------- état ---------- */
const PERSO_DEFAUT = {style_enseigne:"classic", style_facade:"bordeaux", couleur_sieges:"rouge",
  plaque:"aucune", hall:{}, exterieur:[]};

async function chargePersonnalisation(){
  try{
    const d = await sbFetch(`personnalisation?cinema_id=eq.${Etat.cinema.id}&select=*`);
    if(Array.isArray(d) && d.length) Etat.perso = normalisePerso(d[0]);
    else{
      const res = await sbFetch("personnalisation", {method:"POST",
        body:{cinema_id:Etat.cinema.id, user_id:Etat.session?.user_id, ...PERSO_DEFAUT}});
      Etat.perso = normalisePerso((Array.isArray(res)&&res[0]) || PERSO_DEFAUT);
    }
  }catch(e){ Etat.perso = normalisePerso(Etat.perso || PERSO_DEFAUT); }
  try{
    const p = await sbFetch(`possessions?cinema_id=eq.${Etat.cinema.id}&select=cle`);
    Etat.possessions = (Array.isArray(p)?p:[]).map(x=>x.cle);
  }catch(e){ Etat.possessions = Etat.possessions || []; }
  return Etat.perso;
}
/* tolère les anciennes parties sans état de personnalisation */
function normalisePerso(o){
  const r = {...PERSO_DEFAUT, ...(o||{})};
  if(typeof r.hall === "string"){ try{ r.hall = JSON.parse(r.hall); }catch(e){ r.hall = {}; } }
  if(typeof r.exterieur === "string"){ try{ r.exterieur = JSON.parse(r.exterieur); }catch(e){ r.exterieur = []; } }
  if(!r.hall || typeof r.hall !== "object") r.hall = {};
  if(!Array.isArray(r.exterieur)) r.exterieur = [];
  return r;
}

/* ---------- possession ---------- */
function possede(cat, id){
  const cle = cat + ":" + id;
  const item = itemPerso(cat, id);
  if(!item) return false;
  if(item.reclamee) return (Etat.possessions||[]).includes(cle);
  if((item.cout||0) === 0 && niveauActuel() >= item.niveauRequis) return true;   /* offert au déblocage */
  return (Etat.possessions||[]).includes(cle);
}
function itemPerso(cat, id){
  const c = CATALOGUE_PERSO[cat];
  if(!c) return null;
  if(c.emplacements) return c.zones.flatMap(z=>z.objets).find(o=>o.id===id) || null;
  return c.items.find(i=>i.id===id) || null;
}
function accessible(cat, id){
  const item = itemPerso(cat, id);
  if(!item) return {ok:false, raison:"inconnu"};
  if(niveauActuel() < item.niveauRequis) return {ok:false, raison:"niveau", niveau:item.niveauRequis};
  if(!possede(cat, id)) return {ok:false, raison:"achat", cout:item.cout};
  return {ok:true};
}

async function donnePersonnalisation(cle, origine){
  const c = "plaque:" + cle;
  if((Etat.possessions||[]).includes(c)) return;
  try{
    await sbFetch("possessions", {method:"POST", prefer:"return=minimal", body:{
      cinema_id:Etat.cinema.id, user_id:Etat.session?.user_id, cle:c,
      categorie:"plaque", origine:origine||"niveau"}});
    Etat.possessions = [...(Etat.possessions||[]), c];
  }catch(e){}
}

/* achat d'un élément payant — enregistré comme transaction */
async function achetePersonnalisation(cat, id){
  const item = itemPerso(cat, id);
  if(!item || possede(cat, id)) return false;
  if(niveauActuel() < item.niveauRequis) return false;
  try{
    await depense({montant:item.cout, categorie:"personnalisation", details:{categorie:cat, item:id}});
  }catch(e){ return {erreur:"argent"}; }
  try{
    await sbFetch("possessions", {method:"POST", prefer:"return=minimal", body:{
      cinema_id:Etat.cinema.id, user_id:Etat.session?.user_id,
      cle:cat+":"+id, categorie:cat, origine:"achat"}});
  }catch(e){}
  Etat.possessions = [...(Etat.possessions||[]), cat+":"+id];
  majHeaderArgent();
  return true;
}

/* application d'un élément possédé — gratuite */
async function appliquePersonnalisation(cat, id, zone){
  const conf = CATALOGUE_PERSO[cat];
  if(!conf) return false;
  const a = accessible(cat, id);
  if(!a.ok) return a;

  let corps;
  if(conf.emplacements){
    Etat.perso.hall = {...Etat.perso.hall, [zone]: id};
    corps = {hall: Etat.perso.hall};
  }else if(conf.multiple){
    const liste = Etat.perso.exterieur.includes(id)
      ? Etat.perso.exterieur.filter(x=>x!==id)
      : [...Etat.perso.exterieur, id];
    Etat.perso.exterieur = liste;
    corps = {exterieur: liste};
  }else{
    Etat.perso[conf.champ] = id;
    corps = {[conf.champ]: id};
  }
  try{
    await sbFetch(`personnalisation?cinema_id=eq.${Etat.cinema.id}`, {method:"PATCH",
      prefer:"return=minimal", body:corps});
  }catch(e){ return {erreur:"reseau"}; }
  return {ok:true};
}

/* ============================================================
   APPARENCE DE LA FAÇADE — une seule fonction, lue par jeu.html
   ============================================================ */
function construireApparenceFacade(cinema, perso, salles){
  const p = normalisePerso(perso);
  const styleF = CATALOGUE_PERSO.facade.items.find(x=>x.id===p.style_facade) || CATALOGUE_PERSO.facade.items[0];
  const styleE = CATALOGUE_PERSO.enseigne.items.find(x=>x.id===p.style_enseigne) || CATALOGUE_PERSO.enseigne.items[0];
  const visuel = obtenirNiveauVisuelCinema(cinema, salles || []);
  return {
    mur: styleF.mur, murNuit: styleF.murNuit, filetsOr: !!styleF.filetsOr,
    enseigneCouleur: styleE.couleur, enseigneHalo: styleE.halo,
    exterieur: p.exterieur || [],
    plaque: p.plaque && p.plaque !== "aucune" ? p.plaque : null,
    aile: visuel.aile, affiches: visuel.affiches,
    eclairage: visuel.eclairage, entretien: visuel.entretien
  };
}
function couleurSieges(){
  const it = CATALOGUE_PERSO.sieges.items.find(x=>x.id===(Etat.perso?.couleur_sieges||"rouge"));
  return it ? it.couleur : "#a82b3d";
}

/* clé de couleur des fauteuils, pour les rendus qui ont besoin du nom */
function couleurSiegesCle(){
  return (Etat.perso && Etat.perso.couleur_sieges) || "rouge";
}

/* ---- exports ---- */
export {
  CATALOGUE_PERSO,
  PERSO_DEFAUT,
  accessible,
  achetePersonnalisation,
  appliquePersonnalisation,
  chargePersonnalisation,
  construireApparenceFacade,
  couleurSieges,
  couleurSiegesCle,
  donnePersonnalisation,
  itemPerso,
  normalisePerso,
  possede
};
