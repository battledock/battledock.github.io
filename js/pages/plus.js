/* Point d'entrée de plus.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=b1e4da88";
import { initAmbiance } from "../ambiance.js?v=b1e4da88";
import { initialiserJeu } from "../game-state.js?v=b1e4da88";
import { messageErreur } from "../supabase-client.js?v=b1e4da88";
import { initPlus } from "./parts/office.js?v=b1e4da88";
import { majBadgeNotifications } from "./parts/community-social.js?v=b1e4da88";

demarreChargement();
filetChargement();
initAmbiance("communaute");

try{
  const etat = await initialiserJeu({ onglet: "plus" });
  if(etat){
  initPlus();
  majBadgeNotifications();
  }
}catch(e){
  console.error("[Rex] plus", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
