/* Point d'entrée de jeu.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=d8ca144d";
import { initAmbiance } from "../ambiance.js?v=d8ca144d";
import { initialiserJeu, Etat } from "../game-state.js?v=d8ca144d";
import { messageErreur } from "../supabase-client.js?v=d8ca144d";
import { initAccueil } from "../cinema.js?v=d8ca144d";
import { majStatutHeader } from "../navigation.js?v=d8ca144d";
import { majBarreXPHeader } from "../progression.js?v=d8ca144d";
import "../facade/lobby.js?v=d8ca144d";
import "../ui/room-view.js?v=d8ca144d";
import "../facade/life.js?v=d8ca144d";
import "../facade/vitality.js?v=d8ca144d";

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
