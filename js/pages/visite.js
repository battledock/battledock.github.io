/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=92b49fe3";
import { initAmbiance } from "../ambiance.js?v=92b49fe3";
import { protegerPage } from "../auth.js?v=92b49fe3";
import { messageErreur } from "../supabase-client.js?v=92b49fe3";
import { initVisite } from "./parts/visit.js?v=92b49fe3";

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
