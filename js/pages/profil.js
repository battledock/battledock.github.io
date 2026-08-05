/* Point d'entrée de profil.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=5897dbca";
import { initAmbiance } from "../ambiance.js?v=5897dbca";
import { initialiserJeu } from "../game-state.js?v=5897dbca";
import { messageErreur } from "../supabase-client.js?v=5897dbca";
import { initProfil } from "./parts/profile.js?v=5897dbca";

demarreChargement();
filetChargement();
initAmbiance("communaute");

try{
  const etat = await initialiserJeu({ onglet: "plus" });
  if(etat){
  await initProfil();
  }
}catch(e){
  console.error("[Rex] profil", e);
  const zone = document.getElementById("zoneBob") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
