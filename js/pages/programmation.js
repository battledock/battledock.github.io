/* Point d'entrée de programmation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=d6efe228";
import { initAmbiance } from "../ambiance.js?v=d6efe228";
import { initialiserJeu } from "../game-state.js?v=d6efe228";
import { messageErreur } from "../supabase-client.js?v=d6efe228";
import { initProgrammation } from "../screenings.js?v=d6efe228";
import "../ui/genre-posters.js?v=d6efe228";

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
