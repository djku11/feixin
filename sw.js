/* 微聊 · Service Worker
   策略：应用外壳（HTML/CSS/JS/图标）预缓存，离线可用；
        网络请求走「缓存优先，后台更新」，保证秒开。 */
var CACHE = 'weiliao-v15';
var ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './css/native.css',
  './js/store.js',
  './js/media.js',
  './js/screens1.js',
  './js/screens2.js',
  './js/screens3.js',
  './js/app.js',
  './js/enhance.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS).catch(function () { /* 个别资源缺失不阻断安装 */ });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        /* 离线时 HTML 请求回落到首页 */
        if (req.mode === 'navigate') return caches.match('./index.html');
        return hit;
      });
      return hit || net;
    })
  );
});
