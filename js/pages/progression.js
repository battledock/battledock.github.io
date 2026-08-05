/* Point d'entrée de progression.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=9b852109";
import { initAmbiance } from "../ambiance.js?v=9b852109";
import { initialiserJeu } from "../game-state.js?v=9b852109";
import { messageErreur } from "../supabase-client.js?v=9b852109";
import { initProgressionPage } from "./parts/progress-page.js?v=9b852109";

demarreChargement();
filetChargement();
initAmbiance("progression");

try{
  const etat = await initialiserJeu({ onglet: "plus" });
  if(etat){
  await initProgressionPage();
  }
}catch(e){
  console.error("[Rex] progression", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
