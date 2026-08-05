/* Point d'entrée de plus.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=df10ae9b";
import { initAmbiance } from "../ambiance.js?v=df10ae9b";
import { initialiserJeu } from "../game-state.js?v=df10ae9b";
import { messageErreur } from "../supabase-client.js?v=df10ae9b";
import { initPlus } from "./parts/office.js?v=df10ae9b";
import { majBadgeNotifications } from "./parts/community-social.js?v=df10ae9b";

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
