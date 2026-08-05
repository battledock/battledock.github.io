/* Point d'entrée de cinema-public.html — page publique, sans navigation privée */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=df10ae9b";
import { initAmbiance } from "../ambiance.js?v=df10ae9b";
import { protegerPage } from "../auth.js?v=df10ae9b";
import { messageErreur } from "../supabase-client.js?v=df10ae9b";
import { initCinemaPublic } from "./parts/public-cinema.js?v=df10ae9b";

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
