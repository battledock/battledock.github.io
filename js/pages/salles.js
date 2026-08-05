/* Point d'entrée de salles.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=3c723c08";
import { initAmbiance } from "../ambiance.js?v=3c723c08";
import { initialiserJeu } from "../game-state.js?v=3c723c08";
import { messageErreur } from "../supabase-client.js?v=3c723c08";
import { initSalles } from "../rooms.js?v=3c723c08";

demarreChargement();
filetChargement();
initAmbiance("salles");

try{
  const etat = await initialiserJeu({ onglet: "salles" });
  if(etat){
  await initSalles();
  }
}catch(e){
  console.error("[Rex] salles", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
