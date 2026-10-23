/* Fairy English 7 offline support. */
"use strict";
const CACHE_NAME = "fairy-english-7-v2";
const APP_FILES = ["./", "./index.html", "./story.html", "./unit1.html", "./unit.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("fairy-english-7-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(async response => {
      if (response && response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const exact = await cache.match(request);
      if (exact) return exact;
      const url = new URL(request.url);
      if (url.pathname.endsWith("/unit.html")) return (await cache.match("./unit.html")) || (await cache.match("./index.html"));
      return (await cache.match("./index.html")) || Response.error();
    }));
    return;
  }
  event.respondWith(caches.match(request).then(async cached => {
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone());
    return response;
  }));
});
