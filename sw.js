/**
 * Service Worker for enhanced offline capabilities
 */

const CACHE_NAME = 'gausanskriti-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/ecomm.html',
  '/community1.html',
  '/ai.html',
  '/loginpage.html',
  '/createacc.html',
  '/logo.png',
  '/farmers.jpeg',
  '/js/api-client.js',
  '/js/offline-data.js',
  '/js/db-connection.js',
  '/js/api.js',
  '/js/auth-check.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }
  
  // For API requests, try network first, then cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response for future offline use
          if (response.ok && response.status < 400) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // When network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        
        // No cache match, get from network
        return fetch(event.request)
          .then(networkResponse => {
            // Add successful responses to cache for future
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        // For HTML requests, serve index as fallback (SPA approach)
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
