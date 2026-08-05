/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=19ec6c6b";
import { initAmbiance } from "../ambiance.js?v=19ec6c6b";
import { initialiserJeu } from "../game-state.js?v=19ec6c6b";
import { messageErreur } from "../supabase-client.js?v=19ec6c6b";
import { initPreparation } from "../day-prep.js?v=19ec6c6b";
import "../facade/life.js?v=19ec6c6b";

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
