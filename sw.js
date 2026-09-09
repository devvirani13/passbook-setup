// Passbook app-shell cache. Caches only the static shell (HTML/CSS/JS/icons) —
// your actual entries are never cached here; they always come live from GitHub.
var CACHE_NAME = 'passbook-shell-v2';
var SHELL_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(SHELL_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  // Never intercept GitHub API calls — those must always hit the network live.
  if (url.indexOf('api.github.com') !== -1) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      var network = fetch(event.request).then(function(res){
        if (res && res.ok){
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
