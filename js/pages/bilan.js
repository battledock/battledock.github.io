/* Point d'entrée de bilan.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=0e9c6475";
import { initAmbiance } from "../ambiance.js?v=0e9c6475";
import { initialiserJeu } from "../game-state.js?v=0e9c6475";
import { messageErreur } from "../supabase-client.js?v=0e9c6475";
import { initBilan } from "./parts/report.js?v=0e9c6475";

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
