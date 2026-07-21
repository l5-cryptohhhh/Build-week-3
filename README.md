# SocialApp — Build Week 3

Social network didattico: registrazione/login, feed con post e commenti, like, profilo utente e messaggistica privata. Frontend React + Redux Toolkit, backend fittizio JSON Server + JSON Server Auth.

## Stack

- React 19 + Vite 8 (JavaScript, no TypeScript)
- React Router 7 (in modalita' libreria/dichiarativa, non "framework mode")
- Redux Toolkit 2 + React Redux 9
- React Bootstrap 2 + Bootstrap 5 + Bootstrap Icons
- Axios
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
| GET/POST/PATCH/DELETE | `/posts` | scrittura solo dall'autore; supporta `?userId=`, `?_page=&_limit=&_sort=&_order=` |
| GET/POST/DELETE | `/comments` | scrittura/cancellazione solo dall'autore del commento; `?postId=` |
| GET/POST/DELETE | `/likes` | un record per (postId, userId) |
| GET/POST | `/conversations` | `?participant1Id=`, `?participant2Id=` |
| GET/POST/PATCH/DELETE | `/messages` | `?conversationId=`; il campo `userId` rappresenta il mittente |

Le regole di autorizzazione sono definite in `server/routes.json` (formato JSON Server Auth, notazione tipo Unix `rwx`).

## Struttura del progetto

```
server/
  db.seed.json            # dati demo iniziali (tracciato in git)
  db.json                 # database di sviluppo (gitignored, generato da db.seed.json al primo avvio)
  routes.json             # permessi JSON Server Auth
src/
  api/                    # client HTTP + servizi (uno per risorsa)
  app/store.js            # configurazione store Redux
  features/               # slice Redux (auth, posts, comments, users, messages)
  routes/                 # AppRouter, ProtectedRoute, PublicRoute
  components/
    layout/                # AppNavbar, MainLayout
    common/                # LoadingSpinner, ErrorAlert, EmptyState, Avatar
    posts/, comments/, messages/, profile/
  pages/                  # Login, Register, Feed, Profile, Messages, NotFound
  utils/                  # validators, formattazione date, decodifica JWT
  App.jsx                 # componente radice (Redux Provider + Router)
  main.jsx                # bootstrap tecnico (mount su #root)
```

## Funzionalita' completate

- Registrazione, login, logout, ripristino sessione (JWT in `localStorage`)
- Rotte pubbliche (`/login`, `/register`) e protette (tutto il resto)
- Layout con navbar responsive
- Profilo utente: visualizzazione e modifica (nome, username, bio, URL avatar)
- Feed con paginazione, creazione/modifica/eliminazione post, like
- Commenti sui post (creazione e cancellazione da parte dell'autore)
- Conversazioni private e messaggi (creazione, modifica, eliminazione, stato letto/non letto)
- Stati di caricamento, errore e vuoto su ogni schermata con fetch
- Controlli di autorizzazione lato client (pulsanti di modifica/eliminazione visibili solo al proprietario; accesso a una conversazione altrui via URL bloccato)

## Limiti noti

- **Upload immagini reale non supportato**: gli avatar si impostano incollando un URL diretto a un'immagine; senza URL viene mostrato un placeholder con le iniziali.
- **Nessun WebSocket**: i messaggi non arrivano in tempo reale, solo al refresh/nuova richiesta.
- **Nessuna notifica push, OAuth o sistema di pagamento** (fuori scope).
- **`json-server-auth` non mantenuto attivamente**: dipende da una versione datata di `jsonwebtoken` con una vulnerabilita' nota senza fix disponibile (visibile con `npm audit`). Accettabile perche' il backend e' solo un mock locale, mai esposto in produzione.
- **Permessi del backend mock limitati**: JSON Server Auth riconosce la proprieta' di una risorsa solo tramite un campo `userId`. Per `conversations` (che ha due partecipanti) e per la lettura dei `messages`, l'autorizzazione "solo i partecipanti possono vedere/scrivere" e' applicata lato client (nel componente `ConversationView`), non dal backend: chiamate dirette alle API bypassando la UI potrebbero in teoria leggere conversazioni altrui. Accettabile per un mock di sviluppo, da rivedere con un backend reale.
- Nessuna modifica ai commenti (solo creazione ed eliminazione).

## Possibili miglioramenti futuri

- Upload reale delle immagini (profilo e post) con storage dedicato
- Messaggi in tempo reale via WebSocket
- Notifiche push per nuovi messaggi/commenti/like
- Paginazione/scroll infinito anche per commenti e messaggi
- Ricerca utenti e post
- Backend reale con autorizzazione a grana fine (es. Postgres + policy per conversazione)
