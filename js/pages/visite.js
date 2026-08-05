/* Point d'entrée de visite.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=cbbef1bf";
import { initAmbiance } from "../ambiance.js?v=cbbef1bf";
import { protegerPage } from "../auth.js?v=cbbef1bf";
import { messageErreur } from "../supabase-client.js?v=cbbef1bf";
import { initVisite } from "./parts/visit.js?v=cbbef1bf";

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
