/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=d8ca144d";
import { initAmbiance } from "../ambiance.js?v=d8ca144d";
import { protegerPage } from "../auth.js?v=d8ca144d";
import { messageErreur } from "../supabase-client.js?v=d8ca144d";
import { initVisite } from "./parts/visit.js?v=d8ca144d";

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
