const SIZE = 6
const BOX_ROWS = 2
const BOX_COLS = 3
// ponytail: 16 caselle rimosse su 36 (20 date), difficolta' fissa, nessuna
// modalita' facile/difficile richiesta
const CELLS_TO_REMOVE = 16

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function isSafe(grid, row, col, value) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === value || grid[i][col] === value) return false
  }
  const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS
  const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS
  for (let r = boxRow; r < boxRow + BOX_ROWS; r++) {
    for (let c = boxCol; c < boxCol + BOX_COLS; c++) {
      if (grid[r][c] === value) return false
    }
  }
  return true
}

function fill(grid, index = 0) {
  if (index === SIZE * SIZE) return true
  const row = Math.floor(index / SIZE)
  const col = index % SIZE
  for (const value of shuffle([1, 2, 3, 4, 5, 6])) {
    if (isSafe(grid, row, col, value)) {
      grid[row][col] = value
      if (fill(grid, index + 1)) return true
      grid[row][col] = 0
    }
  }
  return false
}

function generateSolvedGrid() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  fill(grid)
  return grid
}

export function generatePuzzle() {
  const solved = generateSolvedGrid()
  const puzzle = solved.map((row) => [...row])
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE]),
  )
  for (let i = 0; i < CELLS_TO_REMOVE; i++) {
    const [row, col] = positions[i]
    puzzle[row][col] = 0
  }
  return puzzle
}

export function hasConflict(grid, row, col) {
  const value = grid[row][col]
  if (!value) return false
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && grid[row][i] === value) return true
    if (i !== row && grid[i][col] === value) return true
  }
  const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS
  const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS
  for (let r = boxRow; r < boxRow + BOX_ROWS; r++) {
    for (let c = boxCol; c < boxCol + BOX_COLS; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) return true
    }
  }
  return false
}

export function isSolved(grid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (!grid[row][col] || hasConflict(grid, row, col)) return false
    }
  }
  return true
}

export const GRID_SIZE = SIZE
export const BOX_SIZE = { rows: BOX_ROWS, cols: BOX_COLS }
