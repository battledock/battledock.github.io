/* Point d'entrée de jeu.html */

import { demarreChargement, finChargement, filetChargement } from "../ui/loading.js?v=0e9c6475";
import { initAmbiance } from "../ambiance.js?v=0e9c6475";
import { initialiserJeu, Etat } from "../game-state.js?v=0e9c6475";
import { messageErreur } from "../supabase-client.js?v=0e9c6475";
import { initAccueil } from "../cinema.js?v=0e9c6475";
import { majStatutHeader } from "../navigation.js?v=0e9c6475";
import { majBarreXPHeader } from "../progression.js?v=0e9c6475";
import "../facade/lobby.js?v=0e9c6475";
import "../ui/room-view.js?v=0e9c6475";
import "../facade/life.js?v=0e9c6475";
import "../facade/vitality.js?v=0e9c6475";

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
