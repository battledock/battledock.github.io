/* Point d'entrée de evenements.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=5897dbca";
import { initAmbiance } from "../ambiance.js?v=5897dbca";
import { initialiserJeu } from "../game-state.js?v=5897dbca";
import { messageErreur } from "../supabase-client.js?v=5897dbca";
import { initEvenements } from "./parts/events.js?v=5897dbca";
import { bobCompact } from "../navigation.js?v=5897dbca";

demarreChargement();
filetChargement();
initAmbiance("evenements");

try{
  const etat = await initialiserJeu({ onglet: "plus" });
  if(etat){
  await initEvenements();
  document.getElementById("zoneBob").appendChild(bobCompact(
    "Tout le quartier participe. Même le Majestic. Essayons de faire mieux qu'eux tout en restant très polis."));
  }
}catch(e){
  console.error("[Rex] evenements", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
