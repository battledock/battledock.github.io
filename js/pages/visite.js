/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=22580e0f";
import { initAmbiance } from "../ambiance.js?v=22580e0f";
import { protegerPage } from "../auth.js?v=22580e0f";
import { messageErreur } from "../supabase-client.js?v=22580e0f";
import { initVisite } from "./parts/visit.js?v=22580e0f";

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
