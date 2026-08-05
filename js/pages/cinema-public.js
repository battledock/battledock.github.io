/* Point d'entrée de cinema-public.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=45d24569";
import { initAmbiance } from "../ambiance.js?v=45d24569";
import { protegerPage } from "../auth.js?v=45d24569";
import { messageErreur } from "../supabase-client.js?v=45d24569";
import { initCinemaPublic } from "./parts/public-cinema.js?v=45d24569";

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
