/* ===================== LE FACTEUR EST PARTI =====================
   Ce fichier ne sert plus qu'à une chose : désinstaller l'ancien service
   worker chez les joueurs qui l'ont encore, vider ses caches, et s'effacer.
   Aucune requête n'est interceptée. À supprimer dans quelques semaines,
   quand plus personne ne l'aura. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  try{const n=await caches.keys();await Promise.all(n.map(k=>caches.delete(k)));}catch(x){}
  try{await self.registration.unregister();}catch(x){}
  try{const cs=await self.clients.matchAll({type:'window'});cs.forEach(c=>c.navigate(c.url));}catch(x){}
})());});
