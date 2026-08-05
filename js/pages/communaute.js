/* Point d'entrée de communaute.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=cbbef1bf";
import { initAmbiance } from "../ambiance.js?v=cbbef1bf";
import { initialiserJeu } from "../game-state.js?v=cbbef1bf";
import { messageErreur } from "../supabase-client.js?v=cbbef1bf";
import { initCommunaute } from "./parts/community.js?v=cbbef1bf";

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
