/* Point d'entrée de cinema-public.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=5897dbca";
import { initAmbiance } from "../ambiance.js?v=5897dbca";
import { protegerPage } from "../auth.js?v=5897dbca";
import { messageErreur } from "../supabase-client.js?v=5897dbca";
import { initCinemaPublic } from "./parts/public-cinema.js?v=5897dbca";

demarreChargement();
filetChargement();
initAmbiance("communaute");

try{
  const garde = await protegerPage({ cinemaRequis: false });
  if(garde){
  await initCinemaPublic();
  }
}catch(e){
  console.error("[Rex] cinema-public", e);
  document.getElementById("contenuPublic").textContent = messageErreur(e) + " Recharge la page.";
}finally{
  finChargement();
}
