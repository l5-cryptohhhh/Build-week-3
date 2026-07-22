# SocialApp — Build Week 3

Social network didattico: registrazione/login, feed con post e commenti, like, profilo utente e messaggistica privata in tempo reale. Frontend React + Redux Toolkit, backend Firebase (Auth + Firestore + Storage).

## Stack

- React 19 + Vite 8 (JavaScript, no TypeScript)
- React Router 7 (in modalita' libreria/dichiarativa, non "framework mode")
- Redux Toolkit 2 + React Redux 9
- React Bootstrap 2 + Bootstrap 5 + Bootstrap Icons
- Firebase: Authentication (email/password), Firestore (dati + realtime via `onSnapshot`), Storage (solo per i video dei post — avatar/copertina/foto post sono base64 in Firestore, vedi sotto)
- Axios (solo per il widget notizie esterno, `src/api/newsService.js`)
- oxlint (linting)

## Installazione

```bash
npm install
```

## Configurazione Firebase (obbligatoria prima del primo avvio)

L'app si connette a un progetto Firebase reale, non a un backend incluso nel repo.

1. Crea un progetto su [console.firebase.google.com](https://console.firebase.google.com).
2. Abilita **Authentication -> Sign-in method -> Email/Password**.
3. Crea un database **Firestore** (modalita' produzione: le regole sono in `firestore.rules`).
4. **Storage e' opzionale**: serve solo per l'upload di video nei post (avatar,
   copertina e foto dei post funzionano gia' senza, salvati come base64 in
   Firestore — vedi "Upload immagini vs Storage" sotto). Dal 3 febbraio 2026
   Firebase richiede il piano **Blaze** (pay-as-you-go, carta di credito
   collegata) anche solo per abilitare Storage — resta comunque gratuito
   restando nei limiti "Always Free" di Google Cloud Storage (5GB storage,
   100GB di traffico/mese nelle region US). Se non vuoi collegare una carta,
   salta questo passaggio: l'app funziona lo stesso, semplicemente il
   bottone "Video" nel form dei post non avra' un vero object storage dietro
   (vedi limiti noti).
5. Nelle impostazioni del progetto, aggiungi un'app Web e copia i valori del `firebaseConfig` risultante nel file `.env` (gia' presente in repo e tracciato in git: sono valori pubblici, la sicurezza reale e' nelle Security Rules, non in questi campi):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. Pubblica le Security Rules (via [Firebase CLI](https://firebase.google.com/docs/cli) `firebase deploy --only firestore:rules,storage`, oppure incollandole a mano nella console sotto Firestore/Storage -> Regole).

Al primo utilizzo di ogni combinazione di filtri Firestore puo' comparire un errore "the query requires an index" con un link diretto nella console: e' normale, basta cliccarlo una volta e attendere la creazione dell'indice (circa un minuto).

### Dati demo (opzionale)

Per popolare il progetto con gli stessi utenti/post/messaggi usati in sviluppo:

1. Firebase Console -> Impostazioni progetto -> Account di servizio -> Genera nuova chiave privata, salvala come `scripts/serviceAccountKey.json` (gia' nel `.gitignore`, e' un segreto: da' accesso admin illimitato al progetto).
2. `npm run seed`

Crea gli utenti demo in Firebase Auth con password unica **Password123!** e popola Firestore con i post/commenti/like/conversazioni/messaggi corrispondenti (i dati sorgente sono in `scripts/demoData.json`).

## Avvio

```bash
npm run dev   # frontend su http://localhost:5173
```

Non serve piu' un secondo processo di backend: Firestore/Auth/Storage sono raggiunti direttamente dal client via SDK.

## Credenziali utenti demo

Valide solo dopo aver eseguito `npm run seed` (vedi sopra). Password per tutti: **Password123!**

| Email | Nome | Username |
|---|---|---|
| mario.rossi@example.com | Mario Rossi | marior |
| giulia.bianchi@example.com | Giulia Bianchi | giuliab |
| luca.verdi@example.com | Luca Verdi | lucav |

E' possibile anche registrare un nuovo account dalla pagina `/register`.

## Comandi disponibili

```bash
npm run lint       # oxlint
npm run build      # build di produzione (vite build)
npm run preview    # anteprima della build
npm run seed       # popola Firestore/Auth con i dati demo (richiede scripts/serviceAccountKey.json)
```

## Modello dati Firestore

Collection principali (vedi `firestore.rules` per i permessi esatti):

| Collection | Note |
|---|---|
| `users/{uid}` | doc id = uid di Firebase Auth; profilo esteso (username, bio, `savedPostIds`, `experiences`, ...) |
| `posts` | `userId`, `content`/`contentLower` (per la ricerca), `imageUrl`, timestamp |
| `comments` | `postId`, `userId`, `content` |
| `likes` | reaction sui post: id deterministico `postId_userId`, campo `type` (`like`/`celebrate`/`support`/`love`/`insightful`/`funny`, vedi `src/utils/reactions.js`) |
| `commentLikes` | reaction sui commenti: stesso schema di `likes`, id deterministico `commentId_userId` |
| `follows` | id deterministico `followerId_followingId` |
| `conversations` | `participant1Id`/`participant2Id` + `participantIds` (array, per query `array-contains`) |
| `messages` | `conversationId` + `participantIds` denormalizzato dalla conversazione (necessario perche' le Security Rules su query "list" non possono dipendere da un `get()` a un altro documento) |
| `notifications` | create **client-side** da chi compie l'azione (like/commento/follow/messaggio), non da un backend: nessuna Cloud Function in questo progetto (piano Firebase gratuito) |
| `presence/{uid}` | `lastActiveAt`, aggiornato a heartbeat (vedi limiti noti) |

### Upload immagini vs Storage

Per restare sul piano gratuito Spark (niente carta di credito), solo i
**video** dei post passano da Firebase Storage (`src/api/storageService.js`).
Avatar, copertina profilo e foto dei post sono invece salvati come **base64
direttamente nel documento Firestore** (`ProfileEditForm.jsx`/`PostForm.jsx`
leggono il file con `FileReader.readAsDataURL`, nessun upload). Firestore
impone un limite fisso di **1MB per documento**, quindi i limiti lato client
sono piu' stretti che con un vero object storage: 300KB per avatar/copertina
(condividono lo stesso documento utente), 700KB per le foto dei post. Se hai
bisogno di immagini piu' pesanti, comprimile/ridimensionale prima di
caricarle, oppure abilita Storage (vedi sopra) e riporta anche foto/avatar a
un vero upload — il codice per farlo (`uploadBytes`/`getDownloadURL`) e'
ancora in `storageService.js`, basta riattaccarlo negli stessi punti usati
oggi per i video.

### Realtime

Non c'e' piu' un server WebSocket: ogni lista rilevante (feed, commenti, like, follow, conversazioni, messaggi, notifiche) e' un listener `onSnapshot` di Firestore, montato nei hook in `src/hooks/` (`useActivityRealtime`, `useConversationsRealtime`, `useNotificationsRealtime`, `usePresence`). La paginazione ("carica altri...") resta invece a lettura singola (`getDocs`) con cursori basati sul campo `createdAt`.

## Struttura del progetto

```
firestore.rules            # Security Rules Firestore
storage.rules               # Security Rules Storage
firebase.json                # config Firebase CLI (rules + hosting)
scripts/
  demoData.json               # dati demo sorgente (ex server/db.seed.json)
  seedFirestore.js             # migrazione una tantum su Firebase Auth + Firestore
src/
  firebase.js                # inizializzazione app Firebase (Auth/Firestore/Storage)
  api/                        # servizi dati: un file per risorsa, parlano direttamente con l'SDK Firebase
  app/store.js                # configurazione store Redux
  features/                   # slice Redux (auth, posts, comments, users, messages, notifications, search, follow, presence)
  routes/                     # AppRouter, ProtectedRoute, PublicRoute
  components/
    layout/                    # AppNavbar, MainLayout
    common/                    # LoadingSpinner, ErrorAlert, EmptyState, Avatar
    posts/, comments/, messages/, profile/, notifications/, search/
  pages/                      # Login, Register, Feed, Profile, Messages, Search, NotFound
  hooks/                      # useActivityRealtime, useConversationsRealtime, useNotificationsRealtime, usePresence, useDebounce
  utils/                      # validators, formattazione date, anteprima link
  App.jsx                     # componente radice (Redux Provider + Router + sottoscrizione auth/realtime)
  main.jsx                    # bootstrap tecnico (mount su #root)
```

## Funzionalita' completate

- Registrazione, login, logout, ripristino sessione (Firebase Auth, refresh token automatico)
- Rotte pubbliche (`/login`, `/register`) e protette (tutto il resto)
- Layout con navbar responsive
- Profilo utente: visualizzazione e modifica (nome, username, bio, avatar/copertina con upload reale, salvati come base64 in Firestore)
- Feed con paginazione, creazione/modifica/eliminazione post in tempo reale, like in tempo reale
- Commenti sui post (creazione, modifica ed eliminazione da parte dell'autore) con paginazione e conteggio in tempo reale
- Conversazioni private e messaggi in tempo reale via Firestore (creazione, modifica, eliminazione, stato letto/non letto), con paginazione dei messaggi piu' vecchi
- Notifiche in tempo reale per nuovi messaggi, commenti, "mi piace" e nuovi follower, con badge contatore in navbar
- Ricerca utenti e post (prefix-match, risultati paginati)
- Stati di caricamento, errore e vuoto su ogni schermata con fetch
- Controlli di autorizzazione reali lato server via Firestore Security Rules (non solo lato client): un utente non partecipante non puo' leggere/scrivere una conversazione/messaggio altrui nemmeno bypassando la UI

## Limiti noti

- **Ricerca per prefisso, non full-text**: Firestore non ha un equivalente di `?q=` di json-server (substring-match). La ricerca utenti/post trova solo risultati che *iniziano* per il testo digitato (su username/nome per gli utenti, sul contenuto per i post), non corrispondenze a meta' stringa.
- **Feed "Chi segui" limitato a 10 utenti seguiti per pagina**: il filtro `where(..., 'in', ...)` di Firestore accetta al massimo 10 valori; chi segue piu' di 10 persone vede solo i post dei primi 10 in ogni pagina di query.
- **Notifiche create client-side, non da un backend**: chi compie l'azione (like/commento/follow/messaggio) scrive direttamente il documento di notifica per il destinatario. Le Security Rules impediscono di creare notifiche per se stessi o spacciandosi per un altro attore, ma non c'e' una vera validazione server-side (richiederebbe Cloud Functions, piano Blaze a pagamento).
- **Presenza online/offline via heartbeat, non `onDisconnect`**: Firestore non ha l'equivalente di Realtime Database `onDisconnect`. Ogni client aggiorna `presence/{uid}` ogni 25s; "online" e' definito come "aggiornato negli ultimi 45s". Una chiusura brusca (crash, rete che cade) lascia l'utente "online" fino al timeout, non e' istantaneo.
- **Avatar/copertina/foto dei post limitati a 300-700KB** (base64 in Firestore, non un vero object storage — vedi "Upload immagini vs Storage" sopra): niente OAuth/pagamento (fuori scope dichiarato).
- `GET` su `users` non filtra campi sensibili lato server: qualunque utente autenticato puo' leggere il profilo Firestore di un altro utente (email inclusa) — le password non sono piu' un problema (gestite da Firebase Auth, mai in Firestore), ma l'email sì.
- Le notifiche di commento/mi-piace aprono la home (non esiste ancora una rotta di dettaglio del singolo post da linkare).

## Possibili miglioramenti futuri

- Cloud Functions (piano Blaze) per spostare la creazione delle notifiche lato server, con validazione reale invece che affidarsi alle sole Security Rules
- Rotta di dettaglio del singolo post, per linkare le notifiche di commento/mi-piace al post esatto
- Presenza via Realtime Database (`onDisconnect`) invece dell'heartbeat Firestore, per una rilevazione offline istantanea
- Ricerca full-text reale con un servizio dedicato (es. Algolia/Typesense) al posto del prefix-match
