import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import jsonServer from 'json-server'
import auth from 'json-server-auth'
import { Server } from 'socket.io'
import { authenticateSocket, attachRealtime } from './realtime.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'db.json')
const seedPath = path.join(__dirname, 'db.seed.json')
const routesPath = path.join(__dirname, 'routes.json')
const port = process.env.PORT || 3001

// db.json is the local dev database: it mutates on every request (new users,
// posts, comments...) and is gitignored so those mutations never conflict
// between collaborators. db.seed.json is the tracked starting point.
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(seedPath, dbPath)
}

// json-server's own body-parser and json-server-auth's guard body-parser are
// both hardcoded to a 10MB limit (not configurable via CLI flags), which is
// too small for base64-encoded video uploads. We disable json-server's
// built-in one and install our own with a higher limit before anything else
// runs, so the guard middlewares (already-parsed body) just skip theirs.
// Base64 inflates the raw file by ~1.37x, so the body limit must be higher
// than the 50MB raw-file cap enforced client-side (see MAX_VIDEO_BYTES in
// PostForm.jsx) to actually fit an encoded 50MB video.
const BODY_LIMIT = '70mb'

const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'))

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
server.db = router.db

// Serve l'istanza http.Server esplicita (server.listen() la crea comunque
// internamente, ma non la esponeva) per potervi agganciare socket.io sulla
// stessa porta/processo, invece di aprire un secondo server.
const httpServer = server.listen(port, () => {
  console.log(`JSON Server (custom, body limit ${BODY_LIMIT}) is running on port ${port}`)
})
const io = new Server(httpServer, { cors: { origin: '*' } })
authenticateSocket(io)

server.use(jsonServer.defaults({ bodyParser: false }))
server.use(express.json({ limit: BODY_LIMIT }))
server.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }))
server.use(auth.rewriter(routes))
server.use(auth)
attachRealtime(server, router, io)
server.use(router)
