/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=9c211464";
import { initAmbiance } from "../ambiance.js?v=9c211464";
import { initialiserJeu } from "../game-state.js?v=9c211464";
import { messageErreur } from "../supabase-client.js?v=9c211464";
import { initPreparation } from "../day-prep.js?v=9c211464";
import "../facade/life.js?v=9c211464";

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
