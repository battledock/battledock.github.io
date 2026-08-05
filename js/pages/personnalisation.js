/* Point d'entrée de personnalisation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=7ec6c189";
import { initAmbiance } from "../ambiance.js?v=7ec6c189";
import { initialiserJeu } from "../game-state.js?v=7ec6c189";
import { messageErreur } from "../supabase-client.js?v=7ec6c189";
import { initPersonnalisation } from "./parts/customization-page.js?v=7ec6c189";

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
