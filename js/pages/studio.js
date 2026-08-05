/* Point d'entrée de studio.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=22580e0f";
import { initAmbiance } from "../ambiance.js?v=22580e0f";
import { initialiserJeu } from "../game-state.js?v=22580e0f";
import { messageErreur } from "../supabase-client.js?v=22580e0f";
import { initStudio } from "../studio.js?v=22580e0f";

demarreChargement();
filetChargement();
initAmbiance("studio");

try{
  const etat = await initialiserJeu({ onglet: "studio" });
  if(etat){
  await initStudio();
  }
}catch(e){
  console.error("[Rex] studio", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
