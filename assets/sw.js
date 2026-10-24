/* CanIPlay service worker — #358 offline cache (Steam/itch.io installed-PWA offline shell).
 * Scope: registered at <base> (= /caniplay/ on GH Pages, / in local QA / custom domains).
 * Strategy (static hosting, shell content-addressed by ?v=):
 *  - app shell (versioned CSS/JS/i18n + icons/manifest): CACHE-FIRST, precached on
 *    install from PRECACHE list; old caches purged on activate.
 *  - navigations (.html pages): NETWORK-FIRST with cache fallback → offline revisits
 *    of any visited page still render; first-visit offline falls back to cached
 *    index.html instead of the browser dead-end page.
 *  - data JSON (data.json/shards/rankmap/thr/pages/hw_suggest, 404 st_/lt_ shards):
 *    STALE-WHILE-REVALIDATE (offline-first, background refresh; never blocks render).
 *  - steamstatic images / external: network-only (never cached — heavy + volatile).
 * Safe on GH Pages (plain static file, no headers needed). Fail-open: every handler
 * wraps in try/catch; a broken SW never breaks page load — worst case it unregisters.
 */
var CACHE = 'caniplay-v1792872815';
var OFFLINE_FALLBACK = '/caniplay/index.html';
/* PRECACHE paths are scope-relative (/caniplay/…); sw.js ships stamped per build. */
var PRECACHE = [
  '/caniplay/',
  '/caniplay/index.html',
  '/caniplay/games.html',
  '/caniplay/assets/style.css?v=1792872815',
  '/caniplay/assets/app.js?v=1792872815',
  '/caniplay/assets/i18n.js?v=1792872815',
  '/caniplay/assets/manifest.webmanifest',
  '/caniplay/assets/icon-192.png',
  '/caniplay/assets/icon-512.png',
  '/caniplay/assets/apple-touch-icon.png'
];
var DATA_RE = /\/assets\/data(\.json|\/)/;
var NAV_RE = /\.html($|[?#])|\/$/;

self.addEventListener('install', function (e) {
  try {
    e.waitUntil(caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); }));
  } catch (err) {}
});

self.addEventListener('activate', function (e) {
  try {
    e.waitUntil(caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return (k.indexOf('caniplay-v') === 0 && k !== CACHE) ? caches.delete(k) : null;
      }));
    }).then(function () { return self.clients.claim(); }));
  } catch (err) {}
});

self.addEventListener('fetch', function (e) {
  try {
    var u = new URL(e.request.url);
    if (e.request.method !== 'GET') return;
    if (u.origin !== self.location.origin) return; // steamstatic/CDN: network-only
    var path = u.pathname;
    if (DATA_RE.test(path)) { // data JSON: stale-while-revalidate
      e.respondWith(caches.open(CACHE).then(function (c) {
        return c.match(e.request).then(function (hit) {
          var net = fetch(e.request).then(function (res) {
            if (res && res.ok) c.put(e.request, res.clone());
            return res;
          }).catch(function () { return hit || null; });
          return hit || net;
        });
      }));
      return;
    }
    if (e.request.mode === 'navigate' || NAV_RE.test(path)) { // pages: network-first
      e.respondWith(fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) {
          return hit || caches.match(OFFLINE_FALLBACK);
        });
      }));
      return;
    }
    // shell assets (versioned CSS/JS/img/manifest): cache-first, refresh in bg
    e.respondWith(caches.match(e.request).then(function (hit) {
      if (hit) {
        fetch(e.request).then(function (res) {
          if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(e.request, res); });
        }).catch(function () {});
        return hit;
      }
      return fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      });
    }));
  } catch (err) {}
});
