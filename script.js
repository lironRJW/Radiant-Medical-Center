self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('my-cache').then(function(cache) {
        return cache.addAll([
          '/Radiant-Medical-Center/',
          '/Radiant-Medical-Center/index.html',
          '/Radiant-Medical-Center/styles/styles1.css',
          '/Radiant-Medical-Center/styles/styles2.css',
          '/Radiant-Medical-Center/script.js',
          '/Radiant-Medical-Center/favicon_package/android-chrome-32x32.png',
          '/Radiant-Medical-Center/favicon_package/android-chrome-16x16.png',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('ServiceWorker registered with scope: ', registration.scope);
      }).catch(function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
    });
  }
