const CACHE_NAME = 'pomodoro-cache-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // 네트워크를 우선 사용해 항상 최신 파일을 받아오고,
    // 오프라인일 때만 캐시된 파일로 대체한다.
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const cloned = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
