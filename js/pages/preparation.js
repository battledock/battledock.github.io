/* Point d'entrée de preparation.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=cbbef1bf";
import { initAmbiance } from "../ambiance.js?v=cbbef1bf";
import { initialiserJeu } from "../game-state.js?v=cbbef1bf";
import { messageErreur } from "../supabase-client.js?v=cbbef1bf";
import { initPreparation } from "../day-prep.js?v=cbbef1bf";
import "../facade/life.js?v=cbbef1bf";

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
