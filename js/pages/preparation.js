/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=d6efe228";
import { initAmbiance } from "../ambiance.js?v=d6efe228";
import { initialiserJeu } from "../game-state.js?v=d6efe228";
import { messageErreur } from "../supabase-client.js?v=d6efe228";
import { initPreparation } from "../day-prep.js?v=d6efe228";
import "../facade/life.js?v=d6efe228";

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
