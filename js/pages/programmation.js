/* Point d'entrée de programmation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=0e9c6475";
import { initAmbiance } from "../ambiance.js?v=0e9c6475";
import { initialiserJeu } from "../game-state.js?v=0e9c6475";
import { messageErreur } from "../supabase-client.js?v=0e9c6475";
import { initProgrammation } from "../screenings.js?v=0e9c6475";
import "../ui/genre-posters.js?v=0e9c6475";

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
