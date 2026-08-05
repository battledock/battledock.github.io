/* Point d'entrée de programmation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=22580e0f";
import { initAmbiance } from "../ambiance.js?v=22580e0f";
import { initialiserJeu } from "../game-state.js?v=22580e0f";
import { messageErreur } from "../supabase-client.js?v=22580e0f";
import { initProgrammation } from "../screenings.js?v=22580e0f";
import "../ui/genre-posters.js?v=22580e0f";

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
