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
  base64 in `db.json` — nessun object storage dedicato, nessun WebSocket,
  nessuna notifica push/OAuth/pagamenti (fuori scope dichiarato).
  L'aggiornamento "quasi in tempo reale" di commenti e messaggi (vedi
  changelog 2026-07-21) e' realizzato con polling HTTP (`useInterval`),
  non WebSocket: un vero push resta nei prossimi passi.
- `json-server-auth` non mantenuto: dipende da una versione vulnerabile di
  `jsonwebtoken` senza fix disponibile (`npm audit`). Accettabile perche'
  e' solo un mock locale.
- Autorizzazione su `messages`/`conversations` enforced solo lato client
  (vedi sopra) — da rivedere se si passa a un backend reale.
- Nessuna modifica ai commenti (solo creazione/eliminazione).

## Prossimi passi possibili

- Upload reale immagini (profilo/post) con storage dedicato.
- Messaggi/commenti push via WebSocket al posto del polling introdotto
  il 2026-07-21 (il polling e' un compromesso ragionevole su json-server
  ma genera piu' richieste del necessario e non e' istantaneo).
- Badge "non letti" anche in navbar (oggi il pallino rosso c'e' solo
  nella sidebar di `/messages`, vedi changelog 2026-07-21).
- Notifiche push per messaggi/commenti/like.
- Ricerca utenti/post, paginazione anche su commenti e messaggi.
- Backend reale con autorizzazione a grana fine per conversazioni private.

## Changelog

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3070ec9 (button e url foto sistemate)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a6dfe14 (aggiornamento interfaccia e funzionalità)
=======
>>>>>>> 3070ec9 (button e url foto sistemate)
=======
- **2026-07-21** — Fix contatore commenti "in ritardo" + indicatore
  messaggi non letti. Il numero sul bottone "Commenti" veniva letto solo
  dallo slice Redux dei commenti, popolato esclusivamente quando l'utente
  apriva la sezione commenti di un post (`CommentList`): al primo
  caricamento del feed/profilo il contatore era quindi vuoto finche' non
  si cliccava almeno una volta. Aggiunto un fetch batch dei commenti per
  tutti i post visibili (`fetchCommentsForPosts`, stesso pattern gia' in
  uso per i like con `fetchLikesForPosts`), dispatchato al caricamento di
  `PostList`/`ProfilePage` e ripetuto ogni 6s con il nuovo hook
  `useInterval` per un aggiornamento quasi in tempo reale anche quando
  altri utenti commentano. Per i messaggi privati: aggiunto uno stato
  `unreadByConversationId` allo slice messaggi (query
  `/messages?read=false&userId_ne=<currentUserId>` filtrata per le
  conversazioni dell'utente), un pallino rosso sull'avatar + sfondo
  celeste sulla riga della chat in `ConversationList` quando ci sono
  messaggi non letti, e polling (5s per la lista conversazioni/unread
  count, 4s per i messaggi di una conversazione aperta) cosi' che nuovi
  messaggi/notifiche non letti compaiano senza reload manuale. Nessuna
  modifica allo schema dati: il campo `read` sui messaggi esisteva gia'.
  Verificato in browser con due sessioni Playwright (Mario/Giulia): invio
  messaggio da una sessione, comparsa automatica del pallino rosso
  sull'altra entro un ciclo di polling, nessun errore console.
>>>>>>> origin/main
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
