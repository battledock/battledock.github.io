/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=b3263716";
import { initAmbiance } from "../ambiance.js?v=b3263716";
import { protegerPage } from "../auth.js?v=b3263716";
import { messageErreur } from "../supabase-client.js?v=b3263716";
import { initVisite } from "./parts/visit.js?v=b3263716";

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
