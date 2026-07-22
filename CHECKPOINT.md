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

- **Widget "inClone Notizie" (feed, colonna destra)**: consuma
  `https://api.apitube.io/v1/news/everything` con una API key salvata in
  `.env.local` (non tracciato in git, coperto dal pattern `*.local` gia'
  presente in `.gitignore` — a differenza di `.env`, che invece e' tracciato
  e quindi non deve mai contenere segreti). La key fornita e' di livello
  trial: i campi `href`/`source.domain`/`image`/`description`/`body` tornano
  troncati con un suffisso letterale `[Upgrade subscription plan]` inserito
  dall'API stessa nel valore della stringa (verificato con richieste dirette,
  non e' un bug di parsing). Per questo il widget mostra solo titolo e data
  relativa (`published_at`), senza link cliccabile ne' nome della fonte: un
  `<a href>` verso quell'URL troncato porterebbe a una pagina inesistente.
  Se in futuro si passa a una key con piano superiore, si puo' reintrodurre
  il link esterno e la fonte in `NewsWidget.jsx`. Fetch diretta dal browser
  (nessun proxy server-side): la key finisce comunque nel bundle client,
  accettabile per una demo didattica ma da tenere a mente se il repo diventa
  pubblico con una key reale.
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

- **2026-07-22** — Popover profilo (`UserHoverCard.jsx`): `delay.hide`
  100ms troppo corto per raggiungere e cliccare "Vedi profilo" col mouse —
  react-bootstrap `OverlayTrigger` non tiene aperto l'overlay quando il
  mouse ci entra sopra (nessun listener su Popover, solo sul trigger), la
  hide programmata scatta comunque; portato a 400ms per lasciare il tempo
  di spostarsi e cliccare. Rimossi anche tutti i commenti da `index.css`
  su richiesta esplicita (unico file CSS del progetto). Lint/build puliti,
  non testato in browser.
- **2026-07-22** — Rollback `popperConfig={{ strategy: 'fixed' }}` su
  `ShareMenu.jsx`: staccava visivamente il menu dal bottone (posizionato
  contro il viewport invece che contro il trigger, "fluttuava" lontano
  invece di restare ancorato). Il containing-block gia' risolto rimuovendo
  l'animazione (voce precedente) toglie la causa originale del taglio ai
  bordi; `strategy: 'fixed'` non serve piu' e introduceva un problema
  peggiore del bug che doveva risolvere. `Dropdown.Menu` torna al
  comportamento standard react-bootstrap, ancorato al bottone. Lint/build
  puliti, non testato in browser.
- **2026-07-22** — Il fill-mode 'none' non bastava (transform presente
  comunque durante il playback, stesso problema al momento dell'apertura
  del menu). Su richiesta esplicita, animazione `fade-in-up` rimossa del
  tutto: `.empty-state-fade`/`.animate-fade-in` ora `animation: none`
  (unico punto in `index.css`, classi lasciate no-op nei 9 componenti che
  le usano invece di toccarli uno per uno). Card/elementi compaiono subito,
  fermi, senza transform — elimina la classe di bug alla radice invece di
  inseguirla. Non testato in browser, solo lint/build.
- **2026-07-22** — Il fix precedente (`strategy: 'fixed'` su Popper) non
  risolveva davvero il menu "Condividi" tagliato: la Card ha classe
  `animate-fade-in`, la cui animazione (`fade-in-up`) usava
  `animation-fill-mode: both`, lasciando `transform: translateY(0)`
  applicato per sempre a fine animazione. Un `transform` diverso da `none`
  (anche l'identita') rende l'elemento containing block per i discendenti
  `position: fixed` (spec CSS Transforms) — quindi il menu restava comunque
  vincolato alla Card invece che al viewport, stesso comportamento
  "tagliato" di prima. Fix in `index.css`: rimosso `both` da
  `.animate-fade-in`/`.empty-state-fade` (fill-mode torna al default
  `none`); il keyframe finale (opacity:1, transform:none) coincide gia'
  con lo stato base della card quindi nessun cambio visivo a fine
  animazione, ma il transform smette di persistere e Popper `fixed` ora
  funziona davvero. Non testato in browser (nessun tool di automazione
  disponibile in sessione), solo lint/build.
- **2026-07-22** — Fix menu "Condividi" tagliato ai bordi del viewport
  (`ShareMenu.jsx`): `Dropdown.Menu` di react-bootstrap usa Popper con
  `strategy: 'absolute'` di default, posizionato rispetto all'ancestor
  posizionato piu' vicino nel DOM invece che al viewport — con un post
  vicino al fondo pagina il flip su/giu' (gia' attivo di default,
  `flip: true`) sceglieva comunque il lato con meno spazio reale e il
  menu restava tagliato. Aggiunto `popperConfig={{ strategy: 'fixed' }}`:
  ora il flip valuta lo spazio disponibile rispetto al viewport, quindi il
  menu resta sempre interamente visibile (sopra o sotto il bottone a
  seconda dello spazio). Stesso rischio esiste sugli altri `Dropdown.Menu`
  del progetto (menu post a tre puntini, notifiche) ma non toccati:
  nessun report su quelli, fix applicato solo dove segnalato. Non testato
  in browser (nessun tool di automazione disponibile in sessione), solo
  lint/build.
- **2026-07-22** — Fix posizione toast (`ToastHost.jsx`): mancava
  `containerPosition="fixed"` su `ToastContainer` di react-bootstrap, quindi
  restava `position: static` (le classi utility `bottom-0`/`end-0` da sole
  non spostano nulla) e il toast si muoveva con lo scroll invece di restare
  fermo — bug unico dietro sia il caso "toast verde di conferma azione" sia
  "toast dopo Condividi" (stesso `ToastHost`, nessuna logica per-bottone).
  Ora fissato in basso a sinistra con nuova classe `.app-toast-container`
  (`src/index.css`), allineata al bordo della colonna sidebar (container
  centrato 1128px, non al bordo vivo della finestra) cosi' compare sotto la
  card "Elementi salvati" del feed. Non testato in browser (nessun tool di
  automazione disponibile in sessione), solo lint/build.
- **2026-07-22** — Realtime esteso a post/commenti/like/follow (prima solo
  messaggi/notifiche/presenza). In `server/realtime.js`, `router.render`
  ora emette anche `post:new`/`post:updated`/`post:deleted`,
  `comment:new`/`comment:updated`/`comment:deleted`,
  `like:new`/`like:deleted`, `follow:new`/`follow:deleted` — broadcast a
  tutti i client connessi (`io.emit`, non scoped a room, a differenza dei
  messaggi che restano diretti ai soli partecipanti) perche' feed/profili
  sono dati pubblici tra utenti loggati. La cattura pre-delete del body
  (necessaria per sapere `postId`/`userId` dopo che json-server ha gia'
  rimosso la riga, stesso problema gia' risolto per i messaggi) e' stata
  generalizzata da un middleware specifico per `/messages/:id` a uno
  parametrico su `DELETE_CAPTURE_COLLECTIONS = ['messages', 'comments',
  'likes', 'follows']`. Lato client, nuovo hook `useActivitySocket`
  (montato in `App.jsx` accanto a `usePresenceSocket`/
  `useConversationSocket`) inoltra questi eventi a nuovi reducer plain in
  `postsSlice`/`commentsSlice`/`followSlice` (`*Received`/
  `*UpdatedFromSocket`/`*DeletedFromSocket`), tutti con dedup by id perche'
  chi compie l'azione riceve sia l'update ottimistico del proprio thunk sia
  l'eco del proprio evento broadcast. Corretto anche un gap preesistente:
  il server emetteva gia' `notification:new` ma nessun listener lo
  consumava lato client (azione `notificationReceived` orfana) — ora
  agganciato nello stesso hook. **Limite noto**: il broadcast e' globale a
  tutti gli utenti online, non filtrato per follower/visibilita' — accettabile
  per un feed pubblico in un progetto didattico, ma da rivedere se in
  futuro si introduce un feed privato o filtri di visibilita' per post.
- **2026-07-22** — Navbar riordinata stile LinkedIn: campo di ricerca spostato
  accanto al logo (`AppNavbar.jsx`), voce "Cerca" del menu rimossa (il vecchio
  link a `/search` era ridondante col nuovo campo). Il campo e' un `Form`
  controllato: al submit fa `dispatch(setSearchQuery(...))` poi `navigate('/search')`
  — riusa lo stesso stato Redux (`search.query`) gia' letto da `SearchPage` al
  mount, nessuna nuova rotta/query-param. Le altre voci (Home, Il mio profilo,
  Messaggi, tema, notifiche, avatar, logout) restano in un unico `<Nav>` ora
  spinto a destra con `ms-auto` invece di essere divise fra un gruppo
  `me-auto` e uno senza margine. Campo nascosto sotto `sm` (`d-none d-sm-block`)
  per non affollare la navbar mobile, dove resta comunque raggiungibile da
  `/search` tramite navigazione diretta. Lint e build puliti; nessun tool di
  automazione browser disponibile per uno screenshot in questa sessione.
- **2026-07-22** — Post salvati + card "Collegamenti" in home. Nuovo bottone
  segnalibro su ogni `PostCard` (accanto a "Condividi"): salva/rimuove il post
  aggiungendo/togliendo il suo `id` da un nuovo campo `savedPostIds` (array)
  sul record utente, stesso pattern gia' usato da `experiences` (thunk
  `updateProfile` esistente, nessuna nuova collection ne' permesso — il
  campo vive sull'utente proprietario, quindi il permesso `640` gia' su
  `users` copre il PATCH senza bisogno del workaround a `660` usato per
  `likes`/`follows`). Nuova voce "Elementi salvati" sotto la mini-card
  profilo nella sidebar della home (replica lo screenshot di riferimento,
  ma senza Gruppi/Newsletter/Eventi come richiesto — non implementati,
  fuori scope), porta a una nuova rotta `/saved` (`SavedPostsPage.jsx`) che
  elenca i post salvati riusando `PostCard`. Per recuperare i post salvati
  (possono appartenere a qualunque utente, non solo quelli gia' in cache)
  nuovo thunk `fetchSavedPosts` in `postsSlice` + `fetchPostsByIds` in
  `postsService` (`GET /posts?id=..&id=..`, json-server tratta id ripetuti
  come filtro OR, stessa tecnica gia' in uso per i like); l'ordine di
  ritorno del backend non rispetta l'ordine di `savedPostIds` (verificato
  con una chiamata diretta), quindi `SavedPostsPage` riordina lato client
  mappando su `savedPostIds` (piu' recente salvato per primo, l'array si
  aggiorna con `unshift` al salvataggio). Nuova card "Collegamenti" nella
  sidebar della home (`ConnectionsCard.jsx`, sotto "Elementi salvati"):
  mostra le persone che si seguono reciprocamente (nuovo selettore
  `selectMutualIds` in `followSlice`, intersezione tra chi l'utente segue e
  chi lo segue). Verificato lo scambio HTTP effettivo (PATCH
  `savedPostIds`, fetch multi-id, calcolo reciprocita' sui dati reali di
  `db.json`) con richieste dirette al backend mock gia' in esecuzione;
  nessun tool di automazione browser disponibile in questa sessione per una
  verifica visiva in-app, solo lint e build (puliti). Sezione "Elementi
  salvati"/"Collegamenti" aggiunta solo alla sidebar della home (`FeedPage`),
  non al profilo — non richiesto.
- **2026-07-22** — Fix menu "Condividi" + nuova sezione "Esperienze" in
  profilo. Il dropdown di `ShareMenu` (WhatsApp/Telegram/Instagram/TikTok/
  YouTube) apriva verso il basso: ogni `PostCard` ha classe `.animate-fade-in`
  che applica `transform: translateY(...)` (persistente a fine animazione,
  `animation-fill-mode: both`), e un `transform` crea un nuovo stacking
  context — il menu del post N, aprendosi sotto, finiva dentro lo stacking
  context del proprio Card e veniva coperto dal Card successivo (che in DOM
  arriva dopo, quindi dipinto sopra), invisibile/"rotto". Funzionava solo
  sull'ultimo post perche' li' non c'e' un Card successivo a coprirlo. Fix
  minimo: `<Dropdown drop="up">` in `ShareMenu.jsx`, il menu si apre sempre
  verso l'alto (sul post precedente, che essendo prima nel DOM viene comunque
  coperto correttamente) — nessun tocco alla CSS dell'animazione. Nuova
  `ExperienceSection.jsx` (profilo, sopra "I miei post"): card con titolo
  "Esperienze" + bottone "+" (solo sul proprio profilo) che apre un modale
  (ruolo/azienda/periodo/descrizione) e aggiunge una entry; ogni voce ha un
  bottone elimina. Dati salvati come nuovo campo `experiences` (array) sul
  record utente, tramite lo stesso thunk `updateProfile`/`usersService.
  updateUser` gia' usato da `ProfileEditForm` — nessuna nuova collection ne'
  route, il permesso `640` su `users` in `routes.json` copre gia' il PATCH
  dell'owner. Sezione nascosta sul profilo di altri utenti se non hanno
  esperienze (niente box vuoto), sempre visibile sul proprio profilo. Modifica
  della singola esperienza non implementata (solo aggiungi/elimina) — non
  richiesta, da aggiungere replicando il pattern di `ProfileEditForm` se serve.
  Verificato in browser reale (menu condividi su post non-ultimo, aggiunta
  esperienza con toast "Profilo aggiornato" e persistenza). Lint e build
  puliti.
- **2026-07-21** — Fix ai 3 problemi trovati con un audit degli stati Redux
  (nessun cambio di shape, solo correttezza/perf). (1) `authSlice`: `logout`
  chiamava `authService.logout()` (side effect, pulisce il token da
  localStorage) dentro il body del reducer — spostato in un thunk
  (`export function logout() { return (dispatch) => {...} }`), il reducer
  puro ora si chiama `sessionCleared`; nessun cambio ai call site
  (`dispatch(logout())` in `AppNavbar`/`App.jsx` resta identico). (2)
  `postsSlice`: modificare o eliminare un post sincronizzava `items` e
  `byUserId[userId]` ma non `followingFeed.items` (copia separata per la tab
  "Chi segui") — aggiunta la stessa sincronizzazione li'. Per la copia
  analoga in `search.posts.items` (slice diversa), invece di importare
  `updatePost`/`deletePost` da `postsSlice.js` in `searchSlice.js` (avrebbe
  creato un import circolare tra i due moduli: `postsSlice.js` importa gia'
  `searchPosts` da `searchSlice.js`, e con `extraReducers` valutati a
  module-load-time il ciclo rischia di leggere i thunk ancora `undefined` e
  far crashare l'app all'avvio), si e' usato `builder.addMatcher` con un
  controllo sulla stringa del tipo azione (`'posts/updatePost/fulfilled'` /
  `'posts/deletePost/fulfilled'`), che non richiede nessun import dall'altro
  modulo. (3) Selettori che restituivano un nuovo array ad ogni chiamata
  (`selectLikesForPost`, `selectFollowingIds`/`selectFollowerIds`,
  `selectPostsByUser`, `selectCommentsForPost`, `selectMessagesForConversation`)
  causavano il warning di React-Redux "Selector returned a different result"
  (visto dal vivo in console durante un test precedente) — invece di
  riscrivere le selector con `createSelector`/reselect (che per selettori
  parametrizzati per-id richiederebbe un refactor piu' ampio, con
  `useMemo` per istanza a ogni call site), si e' passato `shallowEqual` di
  `react-redux` come secondo argomento di `useSelector` nei call site
  interessati (`PostCard`, `ProfilePage`, `CommentList`, `ConversationView`):
  stessa semantica, fix piu' piccolo, warning sparito (verificato: 0
  occorrenze in console dopo il fix, prima 1 per pagina profilo). Verificato
  anche end-to-end con un post di prova: modificarlo aggiorna la copia in
  cache nella tab risultati di ricerca senza dover rifare la ricerca. Lint e
  build puliti.
- **2026-07-21** — Follow-up al giro precedente: tetto di 10 notizie con
  toggle mostra/nascondi, sidebar con scroll interno, chiarito un falso
  allarme sul player YouTube. `NewsWidget` non pagina piu' all'infinito:
  dopo il secondo batch (10 notizie totali) il bottone smette di scaricare
  altre pagine e diventa un toggle client-side sui dati gia' in memoria
  ("Mostra meno notizie" / freccia su per comprimere a 5, "Mostra altre
  notizie" / freccia giu per riespandere, senza nuove richieste). `.feed-sidebar`
  (`index.css`) ha ora `max-height: calc(100vh - 5.5rem - 5.5rem)` +
  `overflow-y: auto`: con la sidebar `position: sticky`, il contenuto in
  eccesso (es. il footer sotto le 10 notizie espanse) restava sotto il fold
  del viewport e irraggiungibile scrollando la pagina — la sticky resta
  ancorata a `top: 5.5rem` per quasi tutta la durata dello scroll del feed,
  quindi il proprio contenuto in eccesso non "scorre mai in vista" finche'
  non si arriva in fondo alla pagina, punto in cui il `MessengerWidget`
  (fixed, non si sposta con lo scroll) lo ricopriva comunque. Ora la sidebar
  scrolla al proprio interno, sempre staccata dall'area occupata dal widget
  messaggi. Verificato anche il presunto regresso "il video YouTube non si
  vede piu' diretto in app": non e' un bug introdotto — quel video specifico
  (`nZyQBKf4LbU`, highlights AS Roma) ha l'embedding disabilitato dal
  proprietario del canale (comportamento nativo di YouTube, errore 153 se
  aperto come URL diretto fuori da un iframe); confermato con un video di
  controllo notoriamente embeddabile che riproduce correttamente nello
  stesso identico componente `PostLinkPreview`, quindi nessuna modifica al
  codice per questo punto. Verificato in browser reale con Playwright.
- **2026-07-21** — Widget notizie (apitube), footer sidebar, sync banner
  profilo, conteggio commenti sempre visibile, condivisione post, messenger
  flottante. Feed: la card "Novita' della Build Week" nella colonna destra e'
  sostituita da `NewsWidget` (nuovo `src/api/newsService.js`), che mostra le
  ultime 5 notizie da apitube.io e un bottone "Mostra altre notizie" che ne
  aggiunge altre 5 per pagina (vedi limiti noti sopra sul livello della key);
  sotto, nuovo `SidebarFooter` replica i link statici in stile LinkedIn dello
  screenshot di riferimento. Il banner blu della mini-card profilo in
  `FeedPage` ora legge `currentUser.coverUrl` come gia' faceva `ProfileCard`:
  prima restava sempre il gradiente di default anche dopo aver caricato una
  copertina da `/profile/:id` (il dato in Redux era gia' sincronizzato via
  `updateProfile.fulfilled` in `authSlice`, mancava solo lo style nel
  componente). `PostCard` ora scarica la prima pagina di commenti al
  montaggio (non solo all'apertura di `CommentList`) cosi' il conteggio
  compare accanto ai like prima ancora di aprire i commenti, come per i like;
  nuovo bottone "Condividi" (`ShareMenu.jsx`) con WhatsApp/Telegram (intent
  web reali, precompilati con testo+link) e Instagram/TikTok/YouTube (nessun
  intent web di terze parti per condividere testo: si copia il link negli
  appunti e si apre il sito, con toast di conferma). Nuovo `MessengerWidget`
  (montato in `MainLayout`, nascosto sulla rotta `/messages` per non
  duplicare la UI della pagina dedicata): pillola in basso a destra con
  badge dei non letti, click apre l'elenco conversazioni (riusa i selettori
  di `messagesSlice`, gia' popolati globalmente in `App.jsx`); click su una
  conversazione apre un secondo pannello flottante a sinistra con la chat
  completa. Per questo, `ConversationView` accetta ora due prop opzionali
  (`compact`, `onClose`) che riducono l'altezza e aggiungono avatar+bottone
  di chiusura nell'header, riusando 1:1 la stessa logica di fetch/invio/
  paginazione/scroll della pagina messaggi a tutto schermo invece di
  duplicarla in un componente parallelo. Verificato in browser reale con
  Playwright (login, feed, paginazione notizie, apertura commenti, menu di
  condivisione, apertura/chiusura chat dal widget) — nessun errore in
  console, lint e build puliti.
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
