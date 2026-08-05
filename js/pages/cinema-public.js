/* Point d'entrée de cinema-public.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=d8ca144d";
import { initAmbiance } from "../ambiance.js?v=d8ca144d";
import { protegerPage } from "../auth.js?v=d8ca144d";
import { messageErreur } from "../supabase-client.js?v=d8ca144d";
import { initCinemaPublic } from "./parts/public-cinema.js?v=d8ca144d";

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
