# SocialApp — Build Week 3

Social network didattico: registrazione/login, feed con post e commenti, like, profilo utente e messaggistica privata. Frontend React + Redux Toolkit, backend fittizio JSON Server + JSON Server Auth.

## Stack

- React 19 + Vite 8 (JavaScript, no TypeScript)
- React Router 7 (in modalita' libreria/dichiarativa, non "framework mode")
- Redux Toolkit 2 + React Redux 9
- React Bootstrap 2 + Bootstrap 5 + Bootstrap Icons
- Axios
- Socket.IO (client + server) per messaggistica/notifiche in tempo reale
- JSON Server 0.17 + JSON Server Auth 2.1 (backend mock con JWT)
- oxlint (linting)

## Installazione

```bash
npm install
```

## Avvio

Frontend (Vite, porta 5173) e backend mock (JSON Server Auth, porta 3001) insieme:

```bash
npm run dev:all
```

Oppure separatamente, in due terminali:

```bash
npm run dev      # frontend su http://localhost:5173
npm run server   # backend mock su http://localhost:3001
```

## Variabili ambiente

File `.env` (gia' incluso):

```
VITE_API_URL=http://localhost:3001
```

## Credenziali utenti demo

Password per tutti gli utenti demo: **Password123!**

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
npm run server     # solo backend mock
npm run dev:all    # frontend + backend insieme
```

## Endpoint del backend mock

Base URL: `http://localhost:3001`

| Metodo | Endpoint | Note |
|---|---|---|
| POST | `/register` | crea utente + ritorna `accessToken` |
| POST | `/login` | ritorna `accessToken` + `user` |
| GET/PATCH | `/users/:id` | lettura per utenti loggati, scrittura solo dal proprietario |
| GET | `/users?q=&_page=&_limit=` | ricerca full-text (nome, username, ...) |
| GET/POST/PATCH/DELETE | `/posts` | scrittura solo dall'autore; supporta `?userId=`, `?q=`, `?_page=&_limit=&_sort=&_order=` |
| GET/POST/PATCH/DELETE | `/comments` | scrittura/cancellazione solo dall'autore; `?postId=`, `?_page=&_limit=` |
| GET/POST/DELETE | `/likes` | un record per (postId, userId); crea una notifica per l'autore del post |
| GET/POST | `/conversations` | `?participant1Id=`, `?participant2Id=` |
| GET/POST/PATCH/DELETE | `/messages` | `?conversationId=`, `?_page=&_limit=`; il campo `userId` rappresenta il mittente |
| GET/PATCH | `/notifications` | `?userId=`; solo il destinatario puo' leggerle/segnarle come lette |

Le regole di autorizzazione sono definite in `server/routes.json` (formato JSON Server Auth, notazione tipo Unix `rwx`).

### WebSocket (Socket.IO)

Stesso host/porta del backend mock (`server/server.js` espone un unico
`http.Server` condiviso tra REST e Socket.IO). Handshake autenticato con lo
stesso JWT del login (`auth: { token }`); alla connessione ogni client entra
nella room `user:<id>` e riceve solo eventi diretti a lui. Eventi emessi dal
server (vedi `server/realtime.js`): `message:new`, `message:updated`,
`message:deleted`, `conversation:new`, `notification:new`.

## Struttura del progetto

```
server/
  db.json                 # dati demo + stato runtime
  routes.json             # permessi JSON Server Auth
  server.js               # bootstrap Express + Socket.IO
  realtime.js             # eventi realtime e notifiche (hook router.render)
src/
  socket.js               # client Socket.IO singleton
  api/                    # client HTTP + servizi (uno per risorsa)
  app/store.js            # configurazione store Redux
  features/               # slice Redux (auth, posts, comments, users, messages, notifications, search)
  routes/                 # AppRouter, ProtectedRoute, PublicRoute
  components/
    layout/                # AppNavbar, MainLayout
    common/                # LoadingSpinner, ErrorAlert, EmptyState, Avatar
    posts/, comments/, messages/, profile/, notifications/, search/
  pages/                  # Login, Register, Feed, Profile, Messages, Search, NotFound
  hooks/                  # useConversationSocket, useDebounce
  utils/                  # validators, formattazione date, decodifica JWT
  App.jsx                 # componente radice (Redux Provider + Router + ciclo di vita socket)
  main.jsx                # bootstrap tecnico (mount su #root)
```

## Funzionalita' completate

- Registrazione, login, logout, ripristino sessione (JWT in `localStorage`)
- Rotte pubbliche (`/login`, `/register`) e protette (tutto il resto)
- Layout con navbar responsive
- Profilo utente: visualizzazione e modifica (nome, username, bio, URL avatar)
- Feed con paginazione, creazione/modifica/eliminazione post, like
- Commenti sui post (creazione, modifica ed eliminazione da parte dell'autore) con paginazione
- Conversazioni private e messaggi in tempo reale via WebSocket (creazione, modifica, eliminazione, stato letto/non letto, riconnessione automatica), con paginazione dei messaggi piu' vecchi
- Notifiche in tempo reale per nuovi messaggi, commenti e "mi piace", con badge contatore in navbar
- Ricerca utenti e post (risultati parziali, paginati)
- Stati di caricamento, errore e vuoto su ogni schermata con fetch
- Controlli di autorizzazione lato client (pulsanti di modifica/eliminazione visibili solo al proprietario; accesso a una conversazione altrui via URL bloccato)

## Limiti noti

- **Upload immagini reale non supportato per i post**: solo l'avatar profilo supporta upload reale (`<input type="file">`, max 2MB, salvato come data URL). I post usano ancora un campo URL testuale generico (immagine/video/link).
- **Nessuna notifica push del sistema operativo, OAuth o sistema di pagamento** (fuori scope): le "notifiche" sono realtime in-app via WebSocket, non push del browser/OS.
- **`json-server-auth` non mantenuto attivamente**: dipende da una versione datata di `jsonwebtoken` con una vulnerabilita' nota senza fix disponibile (visibile con `npm audit`). Accettabile perche' il backend e' solo un mock locale, mai esposto in produzione. Lo stesso secret viene riusato per autenticare i WebSocket.
- **Permessi del backend mock limitati**: JSON Server Auth riconosce la proprieta' di una risorsa solo tramite un campo `userId`. Per `conversations` (che ha due partecipanti) e per la lettura dei `messages`, l'autorizzazione "solo i partecipanti possono vedere/scrivere" e' applicata lato client (nel componente `ConversationView`), non dal backend: chiamate dirette alle API bypassando la UI potrebbero in teoria leggere conversazioni altrui. Accettabile per un mock di sviluppo, da rivedere con un backend reale. Le `notifications` invece hanno autorizzazione reale lato server (owner-only).
- `GET /users` (usato anche dalla ricerca) restituisce anche l'hash della password di ogni utente — limite di json-server, non filtrato.

## Possibili miglioramenti futuri

- Upload reale delle immagini nei post (oggi solo l'avatar profilo lo supporta) con storage dedicato
- Rotta di dettaglio del singolo post, per linkare le notifiche di commento/mi-piace al post esatto
- Backend reale con autorizzazione a grana fine (es. Postgres + policy per conversazione)
