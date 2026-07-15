/* sw.js — офлайн-кеш «пілюлі».
   Стратегія: network-first. Онлайн — завжди свіжа версія (жодних застарілих стилів).
   Офлайн — віддаємо збережену копію. */
const CACHE = 'pilyuli-v4';
const ASSETS = [
  './',
  './index.html',
  './styles/tokens.css?v=2',
  './styles/app.css?v=2',
  './js/icons.js?v=2',
  './js/schedule.js?v=2',
  './js/store.js?v=2',
  './js/ui.js?v=2',
  './js/views/onboarding.js?v=2',
  './js/views/today.js?v=2',
  './js/views/addMed.js?v=2',
  './js/views/stats.js?v=2',
  './js/views/reminders.js?v=2',
  './js/views/settings.js?v=2',
  './js/main.js?v=2',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || caches.match('./index.html'))
      )
  );
});
