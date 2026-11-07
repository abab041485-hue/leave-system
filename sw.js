// sw.js - Nuclear clear: ล้าง cache ทั้งหมดและ unregister ตัวเองออก
// ทำให้ทุกเครื่องกลับไปโหลดจาก network โดยตรง ไม่มี cache ขัด

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    }).then(function() {
      // ลบ Service Worker ตัวเองออก เพื่อไม่ให้ขัด network อีก
      return self.registration.unregister();
    }).then(function() {
      // บอกทุก tab ให้ reload หน้าใหม่
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.navigate(client.url);
      });
    })
  );
  self.clients.claim();
});

// ไม่ cache อะไรเลย ทุก request ผ่าน network โดยตรง
self.addEventListener('fetch', function(event) {
  // passthrough - ไม่ทำอะไร
});
