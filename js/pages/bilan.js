/* Point d'entrée de bilan.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js";
import { initAmbiance } from "../ambiance.js";
import { initialiserJeu } from "../game-state.js";
import { messageErreur } from "../supabase-client.js";
import { initBilan } from "./parts/report.js";

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
