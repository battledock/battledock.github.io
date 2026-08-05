/* Point d'entrée de personnalisation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=19ec6c6b";
import { initAmbiance } from "../ambiance.js?v=19ec6c6b";
import { initialiserJeu } from "../game-state.js?v=19ec6c6b";
import { messageErreur } from "../supabase-client.js?v=19ec6c6b";
import { initPersonnalisation } from "./parts/customization-page.js?v=19ec6c6b";

demarreChargement();
filetChargement();
initAmbiance("progression");

try{
  const etat = await initialiserJeu({ onglet: "plus" });
  if(etat){
  await initPersonnalisation();
  }
}catch(e){
  console.error("[Rex] personnalisation", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
