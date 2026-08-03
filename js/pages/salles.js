/* Point d'entrée de salles.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js";
import { initAmbiance } from "../ambiance.js";
import { initialiserJeu } from "../game-state.js";
import { messageErreur } from "../supabase-client.js";
import { initSalles } from "../rooms.js";

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
