// Recetario Pretexto: funciona sin internet. Página y datos: red primero, copia si no hay red.
// Librerías (WebLLM, Whisper) de los CDN: copia primero. Los modelos los guarda cada librería.
const C = 'pretexto-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'index.html', 'datos.json', 'logo-pretexto.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin){
    e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(C).then(c => c.put(e.request, k)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
  } else if (/(^|\.)esm\.run$|cdn\.jsdelivr\.net$/.test(u.hostname) && !/\.(bin|onnx)$/.test(u.pathname)){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok){ const k = res.clone(); caches.open(C).then(c => c.put(e.request, k)); } return res; })));
  }
});
