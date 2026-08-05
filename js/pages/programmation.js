/* Point d'entrée de programmation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=1e9eaaa6";
import { initAmbiance } from "../ambiance.js?v=1e9eaaa6";
import { initialiserJeu } from "../game-state.js?v=1e9eaaa6";
import { messageErreur } from "../supabase-client.js?v=1e9eaaa6";
import { initProgrammation } from "../screenings.js?v=1e9eaaa6";
import "../ui/genre-posters.js?v=1e9eaaa6";

demarreChargement();
filetChargement();
initAmbiance("programmation");

try{
  const etat = await initialiserJeu({ onglet: "prog" });
  if(etat){
  await initProgrammation();
  }
}catch(e){
  console.error("[Rex] programmation", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
