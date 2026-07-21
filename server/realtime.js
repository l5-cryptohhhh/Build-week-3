import jwt from 'jsonwebtoken'
import { JWT_SECRET_KEY } from 'json-server-auth/dist/constants.js'

// json-server-auth firma i JWT con questo secret e usa `subject` (claim
// `sub`) come id utente (vedi node_modules/json-server-auth/dist/users.js).
// Riusiamo lo stesso secret per verificare il token nell'handshake dei
// socket, cosi' la sessione HTTP e quella WebSocket condividono la stessa
// autenticazione senza introdurre un secondo sistema di auth.

function nextId(server, collection) {
  const ids = server.db.get(collection).map('id').value()
  return ids.length ? Math.max(...ids) + 1 : 1
}

function createNotification(server, io, { userId, actorId, type, message, postId, conversationId }) {
  if (userId === actorId) return
  const notification = {
    id: nextId(server, 'notifications'),
    userId,
    actorId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  }
  // json-server esegue una scansione cascade-delete su ogni campo che
  // termina in "Id" in tutte le collection (vedi getRemovable in
  // node_modules/json-server/lib/server/mixins.js) e va in crash se il
  // valore e' null (lodash-id.getById non gestisce null). Per questo si
  // aggiunge la chiave solo quando applicabile, invece di impostarla a
  // null.
  if (postId !== undefined) notification.postId = postId
  if (conversationId !== undefined) notification.conversationId = conversationId
  server.db.get('notifications').push(notification).write()
  io.to(`user:${userId}`).emit('notification:new', notification)
}

function actorName(server, actorId) {
  const actor = server.db.get('users').find({ id: actorId }).value()
  return actor?.fullName || 'Qualcuno'
}

// Contatore di connessioni per utente (non booleano): lo stesso utente puo'
// avere piu' tab/dispositivi aperti, "offline" va emesso solo quando l'ultima
// connessione si chiude, non alla prima disconnessione di una tab qualsiasi.
const onlineConnections = new Map()

export function authenticateSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('unauthorized'))
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY)
      socket.userId = Number(decoded.sub)
      next()
    } catch {
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`)

    const count = (onlineConnections.get(socket.userId) || 0) + 1
    onlineConnections.set(socket.userId, count)
    if (count === 1) io.emit('presence:online', socket.userId)
    socket.emit('presence:list', [...onlineConnections.keys()])

    socket.on('disconnect', () => {
      const remaining = (onlineConnections.get(socket.userId) || 1) - 1
      if (remaining <= 0) {
        onlineConnections.delete(socket.userId)
        io.emit('presence:offline', socket.userId)
      } else {
        onlineConnections.set(socket.userId, remaining)
      }
    })
  })
}

// json-server espone `router.render` per intercettare le risposte prima
// dell'invio (vedi node_modules/json-server/README.md). Lo usiamo per
// emettere eventi realtime e creare notifiche subito dopo che il router
// ha gia' eseguito la scrittura effettiva su db.json, senza duplicare la
// logica di CRUD/validazione/autorizzazione gia' gestita da json-server e
// json-server-auth.
export function attachRealtime(server, router, io) {
  // DELETE /messages/:id risponde con {} di default: catturiamo la
  // risorsa prima che il router la elimini, per sapere conversationId
  // dentro router.render.
  server.use((req, res, next) => {
    if (req.method === 'DELETE' && /^\/messages\/\d+$/.test(req.path)) {
      const id = Number(req.path.split('/')[2])
      res.locals.deletedResource = server.db.get('messages').find({ id }).value()
    }
    next()
  })

  const defaultRender = (req, res) => res.jsonp(res.locals.data)

  router.render = (req, res) => {
    const { method, path } = req
    const data = res.locals.data

    if (method === 'POST' && path === '/messages' && res.statusCode === 201) {
      const conversation = server.db.get('conversations').find({ id: data.conversationId }).value()
      if (conversation) {
        io.to(`user:${conversation.participant1Id}`).emit('message:new', data)
        io.to(`user:${conversation.participant2Id}`).emit('message:new', data)
        const recipientId =
          conversation.participant1Id === data.userId
            ? conversation.participant2Id
            : conversation.participant1Id
        createNotification(server, io, {
          userId: recipientId,
          actorId: data.userId,
          type: 'message',
          message: `${actorName(server, data.userId)} ti ha inviato un messaggio`,
          conversationId: conversation.id,
        })
      }
      return defaultRender(req, res)
    }

    if (method === 'PATCH' && /^\/messages\/\d+$/.test(path) && res.statusCode === 200) {
      io.to(`user:${data.userId}`).emit('message:updated', data)
      const conversation = server.db.get('conversations').find({ id: data.conversationId }).value()
      if (conversation) {
        const otherId =
          conversation.participant1Id === data.userId
            ? conversation.participant2Id
            : conversation.participant1Id
        io.to(`user:${otherId}`).emit('message:updated', data)
      }
      return defaultRender(req, res)
    }

    if (method === 'DELETE' && /^\/messages\/\d+$/.test(path) && res.statusCode === 200) {
      const deleted = res.locals.deletedResource
      if (deleted) {
        const conversation = server.db.get('conversations').find({ id: deleted.conversationId }).value()
        const payload = { id: deleted.id, conversationId: deleted.conversationId }
        if (conversation) {
          io.to(`user:${conversation.participant1Id}`).emit('message:deleted', payload)
          io.to(`user:${conversation.participant2Id}`).emit('message:deleted', payload)
        }
      }
      return defaultRender(req, res)
    }

    if (method === 'POST' && path === '/conversations' && res.statusCode === 201) {
      // Il creatore riceve gia' la conversazione nella risposta REST; l'evento
      // arriva comunque a entrambi i partecipanti (il client ignora la propria
      // conversazione se gia' presente in stato, stesso dedup by id dei messaggi).
      io.to(`user:${data.participant1Id}`).to(`user:${data.participant2Id}`).emit('conversation:new', data)
      return defaultRender(req, res)
    }

    if (method === 'POST' && path === '/comments' && res.statusCode === 201) {
      const post = server.db.get('posts').find({ id: data.postId }).value()
      if (post) {
        createNotification(server, io, {
          userId: post.userId,
          actorId: data.userId,
          type: 'comment',
          message: `${actorName(server, data.userId)} ha commentato il tuo post`,
          postId: post.id,
        })
      }
      return defaultRender(req, res)
    }

    if (method === 'POST' && path === '/follows' && res.statusCode === 201) {
      createNotification(server, io, {
        userId: data.followingId,
        actorId: data.userId,
        type: 'follow',
        message: `${actorName(server, data.userId)} ha iniziato a seguirti`,
      })
      return defaultRender(req, res)
    }

    if (method === 'POST' && path === '/likes' && res.statusCode === 201) {
      const post = server.db.get('posts').find({ id: data.postId }).value()
      if (post) {
        createNotification(server, io, {
          userId: post.userId,
          actorId: data.userId,
          type: 'like',
          message: `${actorName(server, data.userId)} ha messo mi piace al tuo post`,
          postId: post.id,
        })
      }
      return defaultRender(req, res)
    }

    return defaultRender(req, res)
  }
}
