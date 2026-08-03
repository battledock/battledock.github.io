/* Point d'entrée de cinema-public.html — page publique, sans navigation privée */

import { initAmbiance } from "../ambiance.js";
import { protegerPage } from "../auth.js";
import { messageErreur } from "../supabase-client.js";
import { initCinemaPublic } from "./parts/public-cinema.js";

initAmbiance("communaute");

try{
  const garde = await protegerPage({ cinemaRequis: false });
  if(garde){
  await initCinemaPublic();
  }
}catch(e){
  console.error("[Rex] cinema-public", e);
  document.getElementById("contenuPublic").textContent = messageErreur(e) + " Recharge la page.";
}
