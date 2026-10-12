/* Momo service worker — offline shell + notification taps.
   Navigations: network-first, falling back to the cached page (or the cached home page).
   Static assets (/_next/static, fonts, icons): cache-first. */
const CACHE = "momo-v5";
// Works at the domain root or under a basePath (e.g. GitHub Pages "/momo/"): everything is relative to the scope.
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const SHELL = ["/", "/blister/", "/history/", "/inventory/", "/inventory/open-box/", "/settings/", "/settings/profile/", "/manifest.webmanifest"].map((p) => BASE + p);

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match(BASE + "/"))),
    );
    return;
  }

  const path = url.pathname.slice(BASE.length);
  if (path.startsWith("/_next/static/") || path.startsWith("/icons/") || path.startsWith("/mascot/") || (path.startsWith("/voice/") && path.endsWith(".mp3"))) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Everything else (RSC payloads, manifest): network, falling back to cache.
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req)),
  );
});

// Tapping a notification opens Momo's home screen. It never records a dose.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || BASE + "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(target).catch(() => {});
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
