// Офлайн-кэш: всё, что игра однажды загрузила (картинки, озвучку), дальше берётся из кэша.
const CACHE = 'govorushka-v5';
const CORE = ['./', 'index.html', 'style.css', 'art.js', 'sound.js', 'game.js', 'content.json', 'phrases.json', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const fresh = /\.(html|json|js|css)$/.test(url.pathname) || url.pathname.endsWith('/');
  // html/json — сначала сеть (чтобы обновления доходили), остальное — сначала кэш
  e.respondWith(fresh
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
        return r;
      })));
});
