/* Point d'entrée de evenements.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=9b3fc701";
import { initAmbiance } from "../ambiance.js?v=9b3fc701";
import { initialiserJeu } from "../game-state.js?v=9b3fc701";
import { messageErreur } from "../supabase-client.js?v=9b3fc701";
import { initEvenements } from "./parts/events.js?v=9b3fc701";
import { bobCompact } from "../navigation.js?v=9b3fc701";

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
