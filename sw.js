// Service Worker v2 - ระบบลางาน วัดมเหยงคณ์
// เพิ่มเลข version ทุกครั้งที่ deploy เพื่อ force refresh ทุกเครื่อง
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'wat-maheyong-' + CACHE_VERSION;

// ล้าง cache เก่าทั้งหมดทันทีเมื่อ SW ติดตั้ง
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      // cache หน้าหลักใหม่
      return caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll([
          '/leave-system/',
          '/leave-system/index.html',
          '/leave-system/manifest.json',
          '/leave-system/icon-192.png',
          '/leave-system/icon-512.png'
        ]).catch(function() {});
      });
    })
  );
  // บังคับใช้ SW ใหม่ทันที ไม่ต้องรอ tab ปิด
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // ล้าง cache เก่าทั้งหมด
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  // บังคับทุก tab ให้ใช้ SW ใหม่ทันที
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // GAS API = ไม่ cache เด็ดขาด (ต้องได้ข้อมูล realtime เสมอ)
  if (url.includes('script.google.com') || url.includes('action=read')) {
    return;
  }

  // Google Fonts/CDN = network first
  if (url.includes('googleapis.com') || url.includes('cdn.tailwindcss') || url.includes('jsdelivr')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // ไฟล์หลัก = network first (ได้ของใหม่เสมอ, fallback cache ถ้า offline)
  event.respondWith(
    fetch(event.request).then(function(response) {
      // cache สำเนาใหม่ไว้
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      // offline: ใช้ cache แทน
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('/leave-system/index.html');
      });
    })
  );
});
