/* Point d'entrée de communaute.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=45d24569";
import { initAmbiance } from "../ambiance.js?v=45d24569";
import { initialiserJeu } from "../game-state.js?v=45d24569";
import { messageErreur } from "../supabase-client.js?v=45d24569";
import { initCommunaute } from "./parts/community.js?v=45d24569";

demarreChargement();
filetChargement();
initAmbiance("communaute");

try{
  const etat = await initialiserJeu({ onglet: "plus" });
  if(etat){
  await initCommunaute();
  }
}catch(e){
  console.error("[Rex] communaute", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
