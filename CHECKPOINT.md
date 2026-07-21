# Checkpoint di progetto — SocialApp (Build Week 3)

> Questo file esiste per far riprendere il lavoro a chiunque apra una nuova
> conversazione con Claude Code su questo repository, senza dover
> ricostruire il contesto da zero. Se sei un collaboratore che riprende il
> progetto: leggi questo file per intero prima di chiedere modifiche.
>
> Se sei Claude Code e stai leggendo questo file in una nuova sessione:
> dopo aver completato modifiche significative (nuova funzionalita',
> refactor, fix di un bug non banale, cambio di una decisione architetturale),
> aggiungi una voce in fondo alla sezione **Changelog** con data e riepilogo,
> e aggiorna le sezioni sopra (stack, struttura, limiti noti, prossimi passi)
> se sono cambiate. Non serve chiedere il permesso per aggiornare *questo*
> file — fa parte del normale flusso di lavoro.

## Cos'e' questo progetto

Social network didattico (esercizio "Build Week 3", corso Epicode):
autenticazione, feed con post/commenti/like, profilo utente, messaggistica
privata. Frontend React + Redux Toolkit; backend fittizio JSON Server +
JSON Server Auth per prototipare senza un backend reale.

## Come riprendere il lavoro

```bash
npm install
npm run dev:all   # frontend su :5173, backend mock su :3001
```

Credenziali demo (password unica per tutti: `Password123!`):
`mario.rossi@example.com`, `giulia.bianchi@example.com`, `luca.verdi@example.com`.
E' anche possibile registrarsi da `/register`.

Comandi utili: `npm run lint` (oxlint), `npm run build` (vite build),
`npm run server` (solo backend mock).

Per i dettagli su endpoint, variabili ambiente e struttura cartelle vedi
[README.md](README.md) — qui ci concentriamo su *perche'* le cose sono
fatte cosi', non su *cosa* fanno (quello lo spiega gia' il codice/README).

## Stack e decisioni chiave (con motivazioni)

- **React 19 + Vite 8 + oxlint** invece di React 18 + ESLint come
  originariamente ipotizzato in fase di design: il progetto era gia' stato
  scaffoldato cosi' prima di iniziare l'implementazione: si e' scelto di
  adattarsi allo scaffold esistente invece di reinizializzare, dopo aver
  verificato che tutte le dipendenze (react-bootstrap, react-router-dom)
  sono compatibili con React 19.
- **react-router-dom v7** in modalita' "libreria" (`BrowserRouter`/`Routes`/
  `Route`), non in "framework mode": l'API usata e' la stessa di v6, quindi
  nessun impatto pratico.
- **`App.jsx` e' la radice logica dell'app** (Redux `Provider` + `BrowserRouter`
  ci vivono dentro), **`main.jsx` resta solo bootstrap tecnico** (crea il
  root DOM, importa i CSS globali, monta `<App />`). Questa separazione e'
  stata una richiesta esplicita: non spostare Provider/Router dentro
  `main.jsx`.
- **Collection `likes` separata** (non nell'array del post): necessaria
  perche' JSON Server Auth blocca la scrittura di un post da parte di
  chiunque non ne sia l'autore — un like/unlike di un altro utente
  modificherebbe altrimenti un campo del post altrui e verrebbe rifiutato
  con 403. Con `likes` come collection propria, ogni riga e' di proprieta'
  di chi mette il like.
- **Permesso `messages` a `660`** (loggato legge/scrive) invece di `640`
  (owner-only): scoperto con un test end-to-end reale che un destinatario
  non riusciva a segnare come letto un messaggio altrui (403), perche'
  JSON Server Auth valuta la proprieta' solo sul campo `userId` e quel
  campo, per i messaggi, rappresenta il mittente. L'unico modo semplice per
  sbloccare i "letto/non letto" era allentare il permesso a livello
  collection. Come conseguenza, l'autorizzazione fine (solo il mittente
  puo' modificare/eliminare un proprio messaggio) e' garantita **solo lato
  client** (bottoni visibili solo se `isOwn`), non dal backend mock.
- **Permesso `conversations` a `660`**: stesso motivo di fondo — una
  conversazione ha due partecipanti (`participant1Id`/`participant2Id`),
  ma JSON Server Auth sa riconoscere la proprieta' solo su un singolo campo
  `userId`. L'accesso "solo i due partecipanti" e' quindi enforced lato
  client in `ConversationView` (vedi sotto).
- **Guardia anti-URL-diretto sulle conversazioni**: `ConversationView`
  cerca la conversazione richiesta dentro l'elenco gia' caricato per
  l'utente corrente (`fetchConversationsForUser`); se non la trova, mostra
  "accesso non autorizzato" invece di scaricare comunque i messaggi. Senza
  questo controllo, digitare `/messages/<id>` di una conversazione altrui
  avrebbe comunque mostrato i messaggi, dato il permesso `660` sopra.
- **Upload reale solo per l'avatar profilo, non per i post**: `ProfileEditForm`
  usa un `<input type="file" accept="image/*">`, legge il file con
  `FileReader.readAsDataURL` e salva la data URL risultante in `avatarUrl`
  (limite 2MB lato client). I post invece restano a un campo URL testuale
  (spostato sopra al testo, etichettato come link generico: foto, video o
  sito/canale) — niente upload di file per i post, per non gonfiare
  `db.json` con base64 su ogni post. `PostCard` sceglie il rendering in
  base al tipo di link (`utils/linkPreview.js`): estensione immagine,
  estensione video, URL YouTube, o fallback a card-link cliccabile.
- **`socket.io` (non `ws` grezzo) per realtime**: agganciato sullo stesso
  `http.Server` di `server/server.js` (che ora lo espone esplicitamente
  invece di lasciarlo implicito in `server.listen()`), non un processo
  separato. Scelto per riconnessione automatica e gestione errori "gratis"
  lato client, requisiti espliciti del task. Autenticazione dei socket
  riusa lo stesso JWT/secret di JSON Server Auth (`socket.handshake.auth.token`
  verificato con lo stesso `JWT_SECRET_KEY` — vedi `server/realtime.js`),
  cosi' non serve un secondo sistema di login per i WebSocket.
- **Eventi realtime e notifiche via `router.render`** (`server/realtime.js`),
  non middleware separati: json-server espone ufficialmente questo hook per
  intercettare la risposta subito dopo che il router ha gia' eseguito la
  scrittura, cosi' si riusa la logica di CRUD/validazione/autorizzazione
  gia' presente invece di duplicarla. Attenzione: json-server esegue una
  scansione cascade-delete su ogni campo `*Id` in tutte le collection
  (`getRemovable` in `json-server/lib/server/mixins.js`) e va in crash se
  trova un valore `null` — per questo i campi opzionali di `notifications`
  (`postId`/`conversationId`) vengono omessi invece di essere impostati a
  `null` quando non applicabili.
- **Collection `notifications` a permesso `640`** (owner-only), a differenza
  di `messages`/`conversations`: qui `userId` rappresenta correttamente il
  destinatario, quindi il modello di ownership di JSON Server Auth calza
  senza bisogno del workaround a `660` usato altrove.
- **Paginazione messaggi in ordine invertito**: a differenza di post/commenti
  (pagina 1 = piu' vecchi, si accoda), una chat mostra prima i messaggi piu'
  recenti — `messagesService.fetchMessages` interroga `_order=desc` (pagina
  1 = ultimi N) e inverte l'ordine lato client; le pagine successive
  ("carica precedenti") vengono anteposte, non accodate, con lo scroll
  ripristinato manualmente per non far saltare la vista.
- **Ricerca senza nuova collection/endpoint dedicato**: riusa la full-text
  search integrata di json-server (`?q=`) gia' disponibile su ogni
  collection, combinata con `_page`/`_limit` gia' in uso per i post. I
  risultati di ricerca post vivono in uno slice `search` separato ma i
  relativi `likes` vengono comunque fusi in `state.posts.likes` (stesso
  meccanismo di `fetchPostsByUser`), altrimenti `PostCard` (che legge sempre
  da li') mostrerebbe conteggi a zero e rischierebbe di duplicare i like sul
  toggle.

## Stato attuale

Tutte le milestone della Fase 2 sono complete e verificate con un test
end-to-end reale in browser (Playwright headless): login, creazione/
modifica/eliminazione post, like, commenti, modifica profilo, invio/
modifica/eliminazione messaggi, logout — nessun errore in console, lint e
build puliti.

`server/db.json` contiene i dati demo iniziali **piu' quanto e' stato
creato durante l'uso reale dell'app** (nuove registrazioni, post, commenti,
conversazioni create dagli utenti). Questo e' normale e atteso per un
backend mock: non e' un "seed" da preservare intatto, e' lo stato corrente
del database di sviluppo. Se serve uno stato pulito per una demo, si puo'
rigenerare `db.json` partendo dai 3 utenti demo e dai contenuti descritti
nel README.

## Limiti noti (vedi anche README)

- Upload reale solo per avatar profilo e media dei post (foto/video), via
  base64 in `db.json` — nessun object storage dedicato, nessun
  OAuth/pagamenti (fuori scope dichiarato).
- `json-server-auth` non mantenuto: dipende da una versione vulnerabile di
  `jsonwebtoken` senza fix disponibile (`npm audit`). Accettabile perche'
  e' solo un mock locale. Lo stesso secret hardcoded viene ora riusato anche
  per autenticare i WebSocket (vedi sopra) — stesso rischio accettato, non
  nuovo.
- Autorizzazione su `messages`/`conversations` enforced solo lato client
  (vedi sopra) — da rivedere se si passa a un backend reale. Le notifiche
  invece hanno autorizzazione reale lato server (`640`, owner-only).
- CORS del WebSocket aperto a `origin: '*'` (`server/server.js`), coerente
  col CORS gia' permissivo di json-server di default — nessun cambio di
  postura, ma da restringere se si passa a un deployment reale.
- `GET /users` (usato da profilo, elenco conversazioni e ora anche dalla
  ricerca utenti) restituisce anche l'hash della password di ogni utente —
  limite preesistente di json-server (non filtra i campi), la ricerca lo
  rende solo piu' visibile. Non risolto in questo giro.
- Le notifiche di commento/mi-piace aprono la home (non esiste ancora una
  rotta di dettaglio del singolo post da linkare).

## Prossimi passi possibili

- Upload reale immagini (profilo/post) con storage dedicato.
- Backend reale con autorizzazione a grana fine per conversazioni private.
- Rotta di dettaglio del singolo post (per linkare le notifiche di
  commento/mi-piace al post esatto invece che alla home).
- Escludere l'hash password dalla risposta di `GET /users` (vedi limiti
  noti) — stessa infrastruttura di `router.render` gia' introdotta per le
  notifiche puo' essere riusata per questo.

## Changelog

- **2026-07-21** — Messaggistica realtime, notifiche, ricerca+paginazione,
  modifica commenti (le 4 milestone "prossimi passi" della voce precedente,
  ora implementate). Backend: `server/server.js` espone esplicitamente
  l'`http.Server` per agganciarci `socket.io`; nuovo `server/realtime.js`
  autentica i socket con lo stesso JWT di JSON Server Auth e usa
  `router.render` (hook ufficiale di json-server) per emettere
  `message:new/updated/deleted`, `conversation:new` e per creare righe nella
  nuova collection `notifications` (permesso `640`) su nuovo commento/like/
  messaggio, con relativo evento `notification:new`. Scoperto e corretto un
  bug di json-server (`getRemovable` va in crash su valori `null` in campi
  `*Id` durante il cascade-delete) omettendo le chiavi non applicabili
  invece di impostarle a `null`. Frontend: nuovo `src/socket.js` (client
  singleton, connesso/disconnesso in `App.jsx` in base allo stato di auth),
  `useConversationSocket` sostituisce la necessita' di polling (il vecchio
  `src/hooks/useInterval.js` non era comunque mai stato collegato a nulla —
  rimosso come dead code), nuovo slice `notifications` +
  `NotificationBell` in navbar, nuovo slice `search` con pagina dedicata
  `/search` (utenti + post, riusando `?q=` di json-server e il pattern di
  paginazione gia' in `postsSlice`), paginazione aggiunta a commenti
  (`commentsSlice`) e messaggi (`messagesSlice`, con ordine invertito e
  scroll preservato — vedi sopra), modifica commenti replicando 1:1 il
  pattern gia' esistente per la modifica messaggi (`editMessage`/
  `MessageBubble` → `editComment`/`CommentItem`). Verificato con script di
  smoke-test end-to-end reali (login, socket, notifiche incrociate tra due
  utenti, CRUD paginato, cleanup dati di test) — non e' stato possibile
  eseguire anche un test in browser reale in questa sessione (nessun tool
  di automazione browser disponibile); lint e build restano puliti.
- **2026-07-21** — Upload reale immagine profilo: `ProfileEditForm` sostituisce
  il campo URL testuale con `<input type="file">` (accetta immagini, max
  2MB) codificato in base64 e salvato come `avatarUrl` in `db.json`. Nel
  form dei post il campo URL resta testuale ma si sposta sopra al campo di
  testo e diventa un link generico (foto, video, sito/canale, non solo
  immagine); `PostCard` ora rileva il tipo di link (`src/utils/
  linkPreview.js`) e renderizza `<img>`, `<video>`, embed YouTube o una
  card-link a seconda del caso, invece di un `<img>` fisso.
- **2026-07-21** — `PostForm`: il campo link e' ora sempre visibile (non piu'
  dietro un toggle), sopra al campo testo obbligatorio. Il vecchio bottone
  "Aggiungi link" e' sostituito da due bottoni icona (fotocamera per le foto,
  play per i video) collegati a `<input type="file">` nascosti
  (`accept="image/*"` / `accept="video/*"`); il file scelto viene letto con
  `FileReader.readAsDataURL` e la data URL risultante riempie lo stesso
  campo link (limiti 3MB foto / 50MB video lato client, prima di finire in
  `db.json` come `imageUrl`).
- **2026-07-21** — Sostituito l'avvio del backend mock via CLI
  (`json-server-auth ...`) con `server/server.js`, un bootstrap Express
  programmatico equivalente (stessi middleware: defaults di json-server,
  rewriter/guardie di json-server-auth), perche' sia `json-server` che
  `json-server-auth` hanno il proprio body-parser con limite **hardcoded a
  10MB**, non esposto da nessun flag CLI — troppo piccolo per un video da
  50MB codificato in base64 (~68MB). Il nuovo bootstrap disabilita il
  body-parser incorporato di json-server (`bodyParser: false`) e installa
  `express.json`/`express.urlencoded` con limite 70MB *prima* del
  rewriter/guardie; queste ultime, trovando il body gia' parsato
  (`req._body === true`), saltano il proprio parser da 10MB senza
  ri-applicare il limite. Verificato con richieste PATCH reali fino a 30MB
  di body e con un test di guardia (owner diverso -> 403 confermato
  invariato). `npm run server` / `npm run dev:all` restano gli stessi
  comandi, solo l'implementazione dietro `npm run server` e' cambiata.
- **2026-07-20** — Restyling grafico ispirato a LinkedIn ("inClone"): rebranding
  navbar/pagine auth, layout feed a 3 colonne (mini-profilo sticky + feed +
  card "Novità"), avatar di fallback con gradiente deterministico al posto
  del cerchio blu piatto, cover banner su profilo. Aggiunti campi minori
  visti negli screenshot di riferimento senza toccare funzionalità
  esistenti: `jobTitle` (titolo professionale, opzionale) su utente/
  registrazione/modifica profilo/visualizzazione post, split Nome/Cognome
  nel form di registrazione (uniti in `fullName` prima dell'invio, lo
  schema utente resta invariato), e supporto immagine nei post (il campo
  `imageUrl` esisteva già nello schema ma non era mai esposto in UI: ora
  "Aggiungi immagine" in creazione/modifica post e rendering nella card).
  Nessuna modifica a `server/db.json` (dati demo/runtime lasciati intatti).
- **2026-07-20** — Implementazione completa Fase 2 (milestone M0-M9):
  scaffold adattato, backend mock (JSON Server + JSON Server Auth) con dati
  demo, store Redux (auth/posts/comments/users/messages), autenticazione
  completa, layout/navbar, profilo utente, feed con CRUD post/commenti/
  like, messaggistica privata con CRUD completo, stati loading/errore/
  vuoto, autorizzazioni client-side. Verificato con test end-to-end in
  browser headless. Lint e build puliti. Creato questo file di checkpoint.
- **2026-07-21** — Risolto un conflitto di merge su `server/db.seed.json`
  durante l'allineamento del branch locale con `origin/main`. Causa: sia il
  branch locale che `origin/main` avevano aggiunto in locale un proprio
  utente di test riusando lo stesso id auto-incrementale gia' occupato da
  un utente demo esistente sull'altro lato (`mark97`/`ocram01` in locale
  contro `manuelnunziata_`/`SaltyGhosty` su `origin/main`, entrambi id 5 e
  6) — pattern gia' presente anche a monte in `origin/main` stesso (li'
  `mark97` e `manuel` condividevano gia' l'id 5), segno che questa
  collisione si autoalimenta ad ogni merge perche' ciascun collaboratore
  ha uno stato runtime locale diverso finito nel seed tracciato. Risolto
  manualmente confrontando le tre versioni (base comune, locale, remota)
  e riassegnando id univoci a tutti gli utenti/post/commenti/like/
  conversazioni/messaggi coinvolti, cosi' da conservare i dati di tutti e
  quattro gli utenti (nessuno scartato) invece di lasciare che il merge
  automatico di Git ne facesse sparire silenziosamente uno (come gia'
  successo in precedenza a `SaltyGhosty`, assente nel file prima di
  questo fix). Validato con uno script Node ad-hoc che verifica assenza
  di id duplicati per collezione e di riferimenti a chiavi esterne
  inesistenti. Nessun cambiamento di schema. Per evitare che il problema
  si ripresenti: evitare di committare `server/db.seed.json` dopo sessioni
  di test locali con account personali — e' pensato per restare stabile
  (vedi sezione su `db.json` sopra).
