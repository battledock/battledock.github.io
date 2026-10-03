/* ===================== LE FACTEUR DU JEU =====================
   Chrome garde les grosses pages en mémoire et sert une vieille version
   pendant des heures. Ce petit programme s'installe une fois et se place
   entre le navigateur et le réseau : pour les pages du jeu, il va TOUJOURS
   demander au serveur, et ne se rabat sur sa copie que si le réseau tombe. */
const RESEAU_DABORD=[/\.html(\?|$)/i, /version\.json/i, /\.js(\?|$)/i];
const CACHE='bdl-secours-v2';   /* on change de nom : l'ancien cache est jeté à l'activation */
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const noms=await caches.keys();
  await Promise.all(noms.filter(n=>n!==CACHE).map(n=>caches.delete(n)));
  await self.clients.claim();
})());});
self.addEventListener('message',e=>{if(e.data==='vide')caches.delete(CACHE);});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin||e.request.method!=='GET')return;
  const frais=RESEAU_DABORD.some(r=>r.test(u.pathname+u.search));
  if(!frais)return;                       /* images, sons : le cache normal suffit */
  e.respondWith((async()=>{
    try{
      /* ON CONTOURNE LE CACHE DE GITHUB : dix minutes, c'est long quand on
         vient de publier. Une adresse jamais vue force le vrai fichier. */
      const frais2=new URL(e.request.url);
      frais2.searchParams.set('_f',Date.now().toString(36));
      const r=await fetch(new Request(frais2.toString(),{
        method:'GET',headers:e.request.headers,mode:'same-origin',credentials:'same-origin'}),{cache:'no-store'});
      if(r&&r.ok){const c=await caches.open(CACHE);c.put(e.request,r.clone());}
      return r;
    }catch(x){
      const c=await caches.open(CACHE);
      const vieux=await c.match(e.request);
      if(vieux)return vieux;              /* hors ligne : on sert la dernière copie */
      throw x;
    }
  })());
});
