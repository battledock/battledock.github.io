/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { initAmbiance } from "../ambiance.js";
import { protegerPage } from "../auth.js";
import { messageErreur } from "../supabase-client.js";
import { initVisite } from "./parts/visit.js";

initAmbiance("communaute");

try{
  const garde = await protegerPage({ cinemaRequis: false });
  if(garde){
  await initVisite();
  }
}catch(e){
  console.error("[Rex] visite", e);
  document.getElementById("contenuVisite").textContent = messageErreur(e) + " Recharge la page.";
}
