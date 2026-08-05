/* Point d'entrée de communaute.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=b3263716";
import { initAmbiance } from "../ambiance.js?v=b3263716";
import { initialiserJeu } from "../game-state.js?v=b3263716";
import { messageErreur } from "../supabase-client.js?v=b3263716";
import { initCommunaute } from "./parts/community.js?v=b3263716";

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
