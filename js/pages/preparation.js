/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js";
import { initAmbiance } from "../ambiance.js";
import { initialiserJeu } from "../game-state.js";
import { messageErreur } from "../supabase-client.js";
import { initPreparation } from "../day-prep.js";
import "../facade/life.js";

demarreChargement();
filetChargement();
initAmbiance("jeu");

try{
  const etat = await initialiserJeu({ onglet: "jeu" });
  if(etat){
  await initPreparation();
  }
}catch(e){
  console.error("[Rex] preparation", e);
  const zone = document.getElementById("zonePrep") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
