var CACHE_NAME = 'my-site-cache-v1';
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
  const url = new URL(event.request.url);

  // 如果请求的是一个视频文件，就将其缓存起来
  if (url.pathname.endsWith('.mp4')) {
    event.respondWith(
      caches.open('video-cache').then(cache => {
        return cache.match(event.request).then(response => {
          // 如果缓存中已经有这个视频，就直接返回
          if (response) return response;

          // 否则，就从网络获取并添加到缓存中
          return fetch(event.request.clone()).then(networkResponse => {
            if (networkResponse.clone().ok) {
              const responseToCache = networkResponse.clone();

              const clonedResponse = responseToCache.clone();
              const reader = clonedResponse.body.getReader();
              const stream = new ReadableStream({
                start(controller) {
                  function push() {
                    reader.read().then(({done, value}) => {
                      if (done) {
                        controller.close();
                        return;
                      }
                      controller.enqueue(value);
                      push();
                    })
                  };
                  push();
                }
              });

              cache.put(event.request, new Response(stream, { headers: responseToCache.headers }));
            }
            return networkResponse;
          });
        });
      })
    );
  } else {
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
  }
});
