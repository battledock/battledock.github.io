/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=d8ca144d";
import { initAmbiance } from "../ambiance.js?v=d8ca144d";
import { initialiserJeu } from "../game-state.js?v=d8ca144d";
import { messageErreur } from "../supabase-client.js?v=d8ca144d";
import { initPreparation } from "../day-prep.js?v=d8ca144d";
import "../facade/life.js?v=d8ca144d";

demarreChargement();
filetChargement();
initAmbiance("jeu");

try{
  const etat = await initialiserJeu({ onglet: "jeu" });
  if(etat){
  await initPreparation();
  }
}catch(e){
  console.error("[Rex] preparation", e);
  const zone = document.getElementById("zonePrep") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
