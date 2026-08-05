/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=9c211464";
import { initAmbiance } from "../ambiance.js?v=9c211464";
import { protegerPage } from "../auth.js?v=9c211464";
import { messageErreur } from "../supabase-client.js?v=9c211464";
import { initVisite } from "./parts/visit.js?v=9c211464";

demarreChargement();
filetChargement();
initAmbiance("communaute");

try{
  const garde = await protegerPage({ cinemaRequis: false });
  if(garde){
  await initVisite();
  }
}catch(e){
  console.error("[Rex] visite", e);
  document.getElementById("contenuVisite").textContent = messageErreur(e) + " Recharge la page.";
}finally{
  finChargement();
}
