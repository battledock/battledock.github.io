/* Point d'entrée de jeu.html */

import { initAmbiance } from "../ambiance.js";
import { initialiserJeu, Etat } from "../game-state.js";
import { messageErreur } from "../supabase-client.js";
import { initAccueil, remarqueBob } from "../cinema.js";
import { majStatutHeader } from "../navigation.js";
import { majBarreXPHeader } from "../progression.js";
import "../facade/life.js";
import "../facade/vitality.js";

initAmbiance("jeu");

try{
  const etat = await initialiserJeu({ onglet: "jeu" });
  if(etat){
  await initAccueil();
  majStatutHeader();
  majBarreXPHeader();
  document.getElementById("deviseBas").textContent = "« " + Etat.cinema.devise + " »";
  }
}catch(e){
  console.error("[Rex] jeu", e);
  const zone = document.getElementById("bulleTexteAccueil") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}
