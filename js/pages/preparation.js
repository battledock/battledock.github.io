/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=b1e4da88";
import { initAmbiance } from "../ambiance.js?v=b1e4da88";
import { initialiserJeu } from "../game-state.js?v=b1e4da88";
import { messageErreur } from "../supabase-client.js?v=b1e4da88";
import { initPreparation } from "../day-prep.js?v=b1e4da88";
import "../facade/life.js?v=b1e4da88";

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
