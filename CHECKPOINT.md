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
- **Niente upload reale di immagini**: il campo avatar/immagine e' un
  semplice URL testuale (con fallback a iniziali colorate se vuoto). Scelta
  esplicitamente fuori scope fin dalla fase di design.

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

- Nessun upload reale immagini, nessun WebSocket, nessuna notifica push/
  OAuth/pagamenti (fuori scope dichiarato).
- `json-server-auth` non mantenuto: dipende da una versione vulnerabile di
  `jsonwebtoken` senza fix disponibile (`npm audit`). Accettabile perche'
  e' solo un mock locale.
- Autorizzazione su `messages`/`conversations` enforced solo lato client
  (vedi sopra) — da rivedere se si passa a un backend reale.
- Nessuna modifica ai commenti (solo creazione/eliminazione).

## Prossimi passi possibili

- Upload reale immagini (profilo/post) con storage dedicato.
- Messaggi in tempo reale (WebSocket) al posto del polling manuale.
- Notifiche push per messaggi/commenti/like.
- Ricerca utenti/post, paginazione anche su commenti e messaggi.
- Backend reale con autorizzazione a grana fine per conversazioni private.

## Changelog

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
