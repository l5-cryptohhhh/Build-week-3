export const SIZE = 6
export const SUN = 'sun'
export const MOON = 'moon'
const HALF = SIZE / 2
// ponytail: difficolta' fissa, no solver di unicita' — vittoria = griglia
// piena e valida (bilanciamento + no-3-di-fila + vincoli "=/x" rispettati),
// non match esatto con la soluzione generata, quindi soluzioni alternative
// valide contano comunque come vittoria
const EDGE_CLUES_COUNT = 8
const GIVEN_CELLS_COUNT = 4

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function countSymbol(line, symbol) {
  return line.filter((v) => v === symbol).length
}

function hasThreeConsecutive(line) {
  let run = 1
  for (let i = 1; i < line.length; i++) {
    if (line[i] !== null && line[i] === line[i - 1]) {
      run++
      if (run >= 3) return true
    } else {
      run = 1
    }
  }
  return false
}

function isLineValid(line) {
  return countSymbol(line, SUN) <= HALF && countSymbol(line, MOON) <= HALF && !hasThreeConsecutive(line)
}

function isSafe(grid, row, col, value) {
  const rowLine = [...grid[row]]
  rowLine[col] = value
  const colLine = grid.map((r) => r[col])
  colLine[row] = value
  return isLineValid(rowLine) && isLineValid(colLine)
}

function fill(grid, index = 0) {
  if (index === SIZE * SIZE) return true
  const row = Math.floor(index / SIZE)
  const col = index % SIZE
  for (const value of shuffle([SUN, MOON])) {
    if (isSafe(grid, row, col, value)) {
      grid[row][col] = value
      if (fill(grid, index + 1)) return true
      grid[row][col] = null
    }
  }
  return false
}

function generateSolvedGrid() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  fill(grid)
  return grid
}

export function generatePuzzle() {
  const solution = generateSolvedGrid()

  const edgeCandidates = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 1; c++) edgeCandidates.push({ type: 'h', r, c })
  }
  for (let r = 0; r < SIZE - 1; r++) {
    for (let c = 0; c < SIZE; c++) edgeCandidates.push({ type: 'v', r, c })
  }

  const hEdges = Array.from({ length: SIZE }, () => Array(SIZE - 1).fill(null))
  const vEdges = Array.from({ length: SIZE - 1 }, () => Array(SIZE).fill(null))

  for (const { type, r, c } of shuffle(edgeCandidates).slice(0, EDGE_CLUES_COUNT)) {
    const [a, b] = type === 'h' ? [solution[r][c], solution[r][c + 1]] : [solution[r][c], solution[r + 1][c]]
    const symbol = a === b ? '=' : '×'
    if (type === 'h') hEdges[r][c] = symbol
    else vEdges[r][c] = symbol
  }

  const given = Array.from({ length: SIZE }, () => Array(SIZE).fill(false))
  const cellPositions = shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE]))
  for (const [r, c] of cellPositions.slice(0, GIVEN_CELLS_COUNT)) {
    given[r][c] = true
  }

  const puzzle = solution.map((row, r) => row.map((value, c) => (given[r][c] ? value : null)))

  return { puzzle, given, hEdges, vEdges }
}

function edgeSatisfied(a, b, symbol) {
  if (a === null || b === null) return true
  const actual = a === b ? '=' : '×'
  return actual === symbol
}

export function hasConflict(grid, hEdges, vEdges, row, col) {
  if (grid[row][col] === null) return false
  if (!isLineValid(grid[row]) || !isLineValid(grid.map((r) => r[col]))) return true

  if (col > 0 && hEdges[row][col - 1] && !edgeSatisfied(grid[row][col - 1], grid[row][col], hEdges[row][col - 1])) {
    return true
  }
  if (col < SIZE - 1 && hEdges[row][col] && !edgeSatisfied(grid[row][col], grid[row][col + 1], hEdges[row][col])) {
    return true
  }
  if (row > 0 && vEdges[row - 1][col] && !edgeSatisfied(grid[row - 1][col], grid[row][col], vEdges[row - 1][col])) {
    return true
  }
  if (row < SIZE - 1 && vEdges[row][col] && !edgeSatisfied(grid[row][col], grid[row + 1][col], vEdges[row][col])) {
    return true
  }
  return false
}

export function isSolved(grid, hEdges, vEdges) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === null || hasConflict(grid, hEdges, vEdges, r, c)) return false
    }
  }
  return true
}
