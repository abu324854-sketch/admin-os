const CACHE_NAME = 'project-os-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './manifest.json'
];

// O'rnatish va asosiy fayllarni keshlash
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Eski keshlarni tozalash
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// So'rovlarni boshqarish: avval tarmoqdan, uzilsa keshdan
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Firebase so'rovlarini Service Worker ushlab qolmasin (SDK o'zi boshqaradi)
  const url = event.request.url;
  if (url.includes('firebaseio.com') || url.includes('googleapis.com/identitytoolkit')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
