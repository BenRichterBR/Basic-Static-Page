//add page files to cache
self.addEventListener("install", (event) => { 
    event.waitUntil(
        caches.open("my-cache").then((cache) => {
            return cache.addAll(["./main_page.html", "./main_style.css", "./main_script.js"]);
        })
    );
});

//get page files from cache
self.addEventListener("fetch", (event) => { 
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
