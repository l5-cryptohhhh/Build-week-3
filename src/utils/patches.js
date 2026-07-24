export const SIZE = 6
export const TOTAL_CELLS = SIZE * SIZE
// ponytail: numero di tessere "a tendere", nessuna difficolta' variabile.
// Se lo split si blocca prima (regioni tutte 1x1) si accettano meno tessere
// invece di forzare il conteggio esatto — la griglia resta comunque una
// partizione valida.
const TARGET_PATCHES = 8

function randomInt(max) {
  return Math.floor(Math.random() * max)
}

function shapeOf(width, height) {
  if (width === height) return 'square'
  return width > height ? 'wide' : 'tall'
}

// Partizione ricorsiva della griglia in rettangoli (guillotine cut): parte
// da un'unica regione e la spacca a caso, in orizzontale o verticale, finche'
// non si raggiunge il numero di tessere desiderato.
function generateRegions() {
  const regions = [{ row: 0, col: 0, width: SIZE, height: SIZE }]

  while (regions.length < TARGET_PATCHES) {
    const splittableIndices = regions
      .map((region, index) => index)
      .filter((index) => regions[index].width * regions[index].height > 1)
    if (splittableIndices.length === 0) break

    const index = splittableIndices[randomInt(splittableIndices.length)]
    const region = regions[index]
    const canSplitVertical = region.width > 1
    const canSplitHorizontal = region.height > 1
    const splitVertical = canSplitVertical && (!canSplitHorizontal || Math.random() < 0.5)

    let first
    let second
    if (splitVertical) {
      const at = 1 + randomInt(region.width - 1)
      first = { row: region.row, col: region.col, width: at, height: region.height }
      second = { row: region.row, col: region.col + at, width: region.width - at, height: region.height }
    } else {
      const at = 1 + randomInt(region.height - 1)
      first = { row: region.row, col: region.col, width: region.width, height: at }
      second = { row: region.row + at, col: region.col, width: region.width, height: region.height - at }
    }

    regions.splice(index, 1, first, second)
  }

  return regions
}

export function generatePuzzle() {
  const regions = generateRegions()
  const clueGrid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))

  for (const region of regions) {
    const clueRow = region.row + randomInt(region.height)
    const clueCol = region.col + randomInt(region.width)
    clueGrid[clueRow][clueCol] = {
      value: region.width * region.height,
      shape: shapeOf(region.width, region.height),
    }
  }

  return { clueGrid, patchCount: regions.length }
}

export function shapeMatches(width, height, shape) {
  if (shape === 'square') return width === height
  if (shape === 'wide') return width > height
  if (shape === 'tall') return height > width
  return true
}

export function cluesInPiece(clueGrid, piece) {
  const clues = []
  for (let r = piece.row; r < piece.row + piece.height; r++) {
    for (let c = piece.col; c < piece.col + piece.width; c++) {
      if (clueGrid[r][c]) clues.push(clueGrid[r][c])
    }
  }
  return clues
}

export function isPieceValid(clueGrid, piece) {
  const clues = cluesInPiece(clueGrid, piece)
  if (clues.length !== 1) return false
  const [clue] = clues
  return clue.value === piece.width * piece.height && shapeMatches(piece.width, piece.height, clue.shape)
}
