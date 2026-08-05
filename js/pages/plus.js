/* Point d'entrée de plus.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=0e9c6475";
import { initAmbiance } from "../ambiance.js?v=0e9c6475";
import { initialiserJeu } from "../game-state.js?v=0e9c6475";
import { messageErreur } from "../supabase-client.js?v=0e9c6475";
import { initPlus } from "./parts/office.js?v=0e9c6475";
import { majBadgeNotifications } from "./parts/community-social.js?v=0e9c6475";

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
