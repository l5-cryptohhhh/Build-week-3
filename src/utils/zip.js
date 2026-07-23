export const SIZE = 6
export const TOTAL_CELLS = SIZE * SIZE
// ponytail: numero fisso di checkpoint, nessuna difficolta' variabile
const CHECKPOINT_COUNT = 6
const MAX_GENERATION_ATTEMPTS = 200

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function neighborsOf(row, col) {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ].filter(([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE)
}

function countUnvisited(visited, row, col) {
  return neighborsOf(row, col).filter(([r, c]) => !visited[r][c]).length
}

// Percorso hamiltoniano (visita ogni cella della griglia una sola volta) via
// backtracking randomizzato con euristica di Warnsdorff (prova prima i
// vicini con meno vie d'uscita, riduce drasticamente i vicoli ciechi).
function attemptHamiltonianPath(startRow, startCol) {
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false))
  const path = []

  function step(row, col) {
    visited[row][col] = true
    path.push([row, col])
    if (path.length === TOTAL_CELLS) return true

    const candidates = shuffle(neighborsOf(row, col)).filter(([r, c]) => !visited[r][c])
    candidates.sort((a, b) => countUnvisited(visited, ...a) - countUnvisited(visited, ...b))

    for (const [r, c] of candidates) {
      if (step(r, c)) return true
    }

    visited[row][col] = false
    path.pop()
    return false
  }

  return step(startRow, startCol) ? path : null
}

function generateHamiltonianPath() {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const startRow = Math.floor(Math.random() * SIZE)
    const startCol = Math.floor(Math.random() * SIZE)
    const path = attemptHamiltonianPath(startRow, startCol)
    if (path) return path
  }
  throw new Error('Impossibile generare un percorso valido')
}

export function generatePuzzle() {
  const path = generateHamiltonianPath()
  const numberGrid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))

  for (let i = 0; i < CHECKPOINT_COUNT; i++) {
    const pathIndex = Math.round((i * (TOTAL_CELLS - 1)) / (CHECKPOINT_COUNT - 1))
    const [row, col] = path[pathIndex]
    numberGrid[row][col] = i + 1
  }

  return { numberGrid, checkpointCount: CHECKPOINT_COUNT }
}

export function isAdjacent([r1, c1], [r2, c2]) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
}
