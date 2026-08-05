/* Point d'entrée de personnalisation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=0e9c6475";
import { initAmbiance } from "../ambiance.js?v=0e9c6475";
import { initialiserJeu } from "../game-state.js?v=0e9c6475";
import { messageErreur } from "../supabase-client.js?v=0e9c6475";
import { initPersonnalisation } from "./parts/customization-page.js?v=0e9c6475";

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
