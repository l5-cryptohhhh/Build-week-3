import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import jsonServer from 'json-server'
import auth from 'json-server-auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'db.json')
const routesPath = path.join(__dirname, 'routes.json')
const port = process.env.PORT || 3001

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

server.use(jsonServer.defaults({ bodyParser: false }))
server.use(express.json({ limit: BODY_LIMIT }))
server.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }))
server.use(auth.rewriter(routes))
server.use(auth)
server.use(router)

server.listen(port, () => {
  console.log(`JSON Server (custom, body limit ${BODY_LIMIT}) is running on port ${port}`)
})
