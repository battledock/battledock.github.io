/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=22580e0f";
import { initAmbiance } from "../ambiance.js?v=22580e0f";
import { initialiserJeu } from "../game-state.js?v=22580e0f";
import { messageErreur } from "../supabase-client.js?v=22580e0f";
import { initPreparation } from "../day-prep.js?v=22580e0f";
import "../facade/life.js?v=22580e0f";

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
