self.addEventListener('install', e => {
  e.waitUntil(caches.open('aat-v9-pro').then(cache => cache.addAll(['./', './index.html', './styles.css', './app.js', './manifest.json'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
