/* Point d'entrée de jeu.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=19ec6c6b";
import { initAmbiance } from "../ambiance.js?v=19ec6c6b";
import { initialiserJeu, Etat } from "../game-state.js?v=19ec6c6b";
import { messageErreur } from "../supabase-client.js?v=19ec6c6b";
import { initAccueil } from "../cinema.js?v=19ec6c6b";
import { majStatutHeader } from "../navigation.js?v=19ec6c6b";
import { majBarreXPHeader } from "../progression.js?v=19ec6c6b";
import "../facade/lobby.js?v=19ec6c6b";
import "../ui/room-view.js?v=19ec6c6b";
import "../facade/life.js?v=19ec6c6b";
import "../facade/vitality.js?v=19ec6c6b";

demarreChargement();
filetChargement();
initAmbiance("jeu");

try{
  const etat = await initialiserJeu({ onglet: "jeu" });
  if(etat){
  await initAccueil();
  majStatutHeader();
  majBarreXPHeader();
  /* la devise n'a plus de place sur l'accueil refondu : on ne l'écrit
     que si l'élément existe encore, pour ne pas casser la page */
  const dev = document.getElementById("deviseBas");
  if(dev && Etat.cinema.devise) dev.textContent = "« " + Etat.cinema.devise + " »";
  }
}catch(e){
  console.error("[Rex] jeu", e);
  const zone = document.getElementById("bulleTexteAccueil") || document.body;
  zone.textContent = messageErreur(e) + " Recharge la page.";
}finally{
  /* la page ne se montre qu'une fois entièrement dessinée */
  finChargement();
}
