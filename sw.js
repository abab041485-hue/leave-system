// sw.js - Minimal Service Worker สำหรับ PWA installability เท่านั้น
// ไม่ cache, ไม่ reload, ไม่ทำอะไรที่จะรบกวนการใช้งาน

const CACHE_NAME = 'wat-maheyong-v3';

self.addEventListener('install', function(event) {
  // ล้าง cache เก่าทั้งหมด
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
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  // ใช้ SW ใหม่กับ tab ที่เปิดอยู่
  self.clients.claim();
  // ไม่ reload! ไม่มี window.location.reload()
});

// ทุก request ผ่าน network โดยตรง — ไม่ cache อะไรเลย
// ทำให้ข้อมูลจาก GAS เป็น realtime เสมอ
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
