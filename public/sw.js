// O BOXtoBOX não usa service worker.
// Este ficheiro existe só para desligar service workers de outros projetos que tenham corrido
// no mesmo endereço (ex.: localhost:3000). Esses serviam ficheiros antigos e impediam o site de arrancar
// ("module factory is not available"). Quando o browser procura uma versão nova de /sw.js, recebe esta,
// que apaga as caches, se desregista e recarrega as páginas abertas.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
