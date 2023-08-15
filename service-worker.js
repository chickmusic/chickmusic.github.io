var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
  '/',
  'styles.css'
];

self.addEventListener('install', function(event) {
  // 执行安装步骤
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 缓存中有匹配的则返回缓存，否则去请求网络
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
