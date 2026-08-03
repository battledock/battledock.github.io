/* Point d'entrée de communaute.html */

import { initAmbiance } from "../ambiance.js";
import { initialiserJeu } from "../game-state.js";
import { messageErreur } from "../supabase-client.js";
import { initCommunaute } from "./parts/community.js";

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
}
