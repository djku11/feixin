/* ==========================================================
   微聊 · 媒体层（真·图片与定位）
   - IM.put / IM.get ：IndexedDB 图片库
     （聊天图片存这里，不占 localStorage，不怕撑爆）
   - IM.compress     ：选中的照片压缩到最长边 1080 / JPEG 72%
   - IM.grid         ：经纬度 → OpenStreetMap 瓦片网格（免费，无需 key）
   - IM.osmLink      ：跳转查看大地图的链接
   ========================================================== */
var IM = (function () {
  'use strict';

  /* ---------- IndexedDB 图片库 ---------- */
  var DB_NAME = 'weiliao_media', STORE = 'imgs';
  var dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbp;
  }
  function store(mode) {
    return open().then(function (db) {
      return db.transaction(STORE, mode).objectStore(STORE);
    });
  }
  function put(key, val, cb) {
    store('readwrite').then(function (st) {
      var r = st.put(val, key);
      r.onsuccess = function () { if (cb) cb(key); };
      r.onerror = function () { if (cb) cb(null); };
    }).catch(function () { if (cb) cb(null); });
  }
  function get(key, cb) {
    store('readonly').then(function (st) {
      var r = st.get(key);
      r.onsuccess = function () { if (cb) cb(r.result || null); };
      r.onerror = function () { if (cb) cb(null); };
    }).catch(function () { if (cb) cb(null); });
  }

  /* ---------- 选图 → 压缩 → 入库 ---------- */
  function compress(file, cb) {
    var fr = new FileReader();
    fr.onerror = function () { if (cb) cb(null); };
    fr.onload = function () {
      var img = new Image();
      img.onerror = function () { if (cb) cb(null); };
      img.onload = function () {
        try {
          var max = 1080;
          var k = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * k));
          c.height = Math.max(1, Math.round(img.height * k));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var key = 'm_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
          put(key, c.toDataURL('image/jpeg', 0.72), cb);
        } catch (e) { if (cb) cb(null); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ---------- Web 墨卡托：经纬度 → 瓦片坐标 ---------- */
  function lngToWorldPx(lng, z) {
    return (lng + 180) / 360 * Math.pow(2, z) * 256;
  }
  function latToWorldPx(lat, z) {
    var s = Math.sin(lat * Math.PI / 180);
    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * 256;
  }
  /* 3×3 瓦片网格（768×768 画布）+ 图钉在画布内的像素位置 */
  function grid(lat, lng, z) {
    z = z || 15;
    var wx = lngToWorldPx(lng, z), wy = latToWorldPx(lat, z);
    var cx = Math.floor(wx / 256), cy = Math.floor(wy / 256);
    var tiles = [];
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        tiles.push({
          x: cx + dx, y: cy + dy, z: z,
          left: 256 + dx * 256, top: 256 + dy * 256
        });
      }
    }
    return {
      size: 768,
      tiles: tiles,
      pin: { x: wx - cx * 256 + 256, y: wy - cy * 256 + 256 }
    };
  }
  /* 瓦片源：主源 OSM，失败自动换备用源（都免费、无需 key） */
  function tileUrl(z, x, y, idx) {
    idx = idx || 0;
    var srcs = [
      'https://tile.openstreetmap.org/' + z + '/' + x + '/' + y + '.png',
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/' + z + '/' + x + '/' + y + '@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/' + z + '/' + x + '/' + y + '@2x.png'
    ];
    return srcs[idx % srcs.length];
  }
  function osmLink(lat, lng, z) {
    return 'https://www.openstreetmap.org/#map=' + (z || 16) + '/' + lat + '/' + lng;
  }

  return { put: put, get: get, compress: compress, grid: grid, tileUrl: tileUrl, osmLink: osmLink };
})();
window.IM = IM;
