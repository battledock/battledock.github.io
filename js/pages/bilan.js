/* Point d'entrée de bilan.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=b1e4da88";
import { initAmbiance } from "../ambiance.js?v=b1e4da88";
import { initialiserJeu } from "../game-state.js?v=b1e4da88";
import { messageErreur } from "../supabase-client.js?v=b1e4da88";
import { initBilan } from "./parts/report.js?v=b1e4da88";

demarreChargement();
filetChargement();
initAmbiance("salles");

try{
  const etat = await initialiserJeu({ onglet: "jeu" });
  if(etat){
  await initBilan();
  }
}catch(e){
  console.error("[Rex] bilan", e);
  const zone = document.getElementById("contenuBilan") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
