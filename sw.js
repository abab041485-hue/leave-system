// Service Worker สำหรับ PWA - ระบบลางาน วัดมเหยงคณ์
const CACHE_NAME = 'wat-maheyong-v1';
const STATIC_ASSETS = [
  '/leave-system/',
  '/leave-system/index.html',
  '/leave-system/manifest.json',
  '/leave-system/icon-192.png',
  '/leave-system/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function(err) {
        console.log('Cache install error (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // ถ้าเป็น GAS API ให้ไป network เสมอ (ไม่ cache)
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).catch(function() {
        return caches.match('/leave-system/index.html');
      });
    })
  );
});
