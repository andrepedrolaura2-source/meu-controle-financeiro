const CACHE_NAME = "financas-v1";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];


/* ================================
   INSTALAÇÃO
================================ */

self.addEventListener("install", evento => {

    evento.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    ARQUIVOS
                );

            })

    );

    self.skipWaiting();

});


/* ================================
   ATIVAÇÃO
================================ */

self.addEventListener("activate", evento => {

    evento.waitUntil(

        caches.keys()
            .then(chaves => {

                return Promise.all(

                    chaves
                        .filter(
                            chave =>
                                chave !==
                                CACHE_NAME
                        )
                        .map(
                            chave =>
                                caches.delete(
                                    chave
                                )
                        )

                );

            })

    );

    self.clients.claim();

});


/* ================================
   FUNCIONAMENTO OFFLINE
================================ */

self.addEventListener(
    "fetch",
    evento => {

        evento.respondWith(

            caches.match(
                evento.request
            )
            .then(resposta => {

                if (resposta) {

                    return resposta;

                }


                return fetch(
                    evento.request
                );

            })

        );

    }
);