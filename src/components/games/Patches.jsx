import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { generatePuzzle, isPieceValid, SIZE, TOTAL_CELLS } from '../../utils/patches'

const CELL_SIZE = '2.75rem'
const PIECE_COLORS = ['#cfe8ff', '#ffe0b3', '#d4f5d4', '#f5d4e8', '#e0d4f5', '#f5f0d4', '#d4f5f0', '#f5d4d4']

function createBoard() {
  return generatePuzzle()
}

function rectsOverlap(a, b) {
  return !(
    a.col + a.width <= b.col ||
    b.col + b.width <= a.col ||
    a.row + a.height <= b.row ||
    b.row + b.height <= a.row
  )
}

function findPieceIndex(pieces, row, col) {
  return pieces.findIndex(
    (p) => row >= p.row && row < p.row + p.height && col >= p.col && col < p.col + p.width,
  )
}

function ShapeHint({ shape }) {
  const size = shape === 'square' ? { width: 9, height: 9 } : shape === 'wide' ? { width: 13, height: 6 } : { width: 6, height: 13 }
  return <div className="border border-dark mx-auto mt-1" style={size} />
}

export default function Patches() {
  const [board, setBoard] = useState(createBoard)
  const [pieces, setPieces] = useState([])
  const [pendingCell, setPendingCell] = useState(null)
  const { clueGrid } = board

  const coveredCells = pieces.reduce((sum, p) => sum + p.width * p.height, 0)
  const solved = coveredCells === TOTAL_CELLS && pieces.every((p) => isPieceValid(clueGrid, p))

  const handleCellClick = (row, col) => {
    const existingIndex = findPieceIndex(pieces, row, col)
    if (existingIndex !== -1) {
      setPieces(pieces.filter((_, i) => i !== existingIndex))
      setPendingCell(null)
      return
    }

    if (!pendingCell) {
      setPendingCell({ row, col })
      return
    }

    const rowStart = Math.min(pendingCell.row, row)
    const rowEnd = Math.max(pendingCell.row, row)
    const colStart = Math.min(pendingCell.col, col)
    const colEnd = Math.max(pendingCell.col, col)
    const candidate = { row: rowStart, col: colStart, width: colEnd - colStart + 1, height: rowEnd - rowStart + 1 }

    if (!pieces.some((p) => rectsOverlap(p, candidate))) {
      setPieces([...pieces, candidate])
    }
    setPendingCell(null)
  }

  const handleNewGame = () => {
    setBoard(createBoard())
    setPieces([])
    setPendingCell(null)
  }

  return (
    <div>
      {solved && <div className="alert alert-success py-2 mb-3">Complimenti, rompicapo risolto!</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, ${CELL_SIZE})`,
          gridTemplateRows: `repeat(${SIZE}, ${CELL_SIZE})`,
          border: '2px solid #212529',
          width: 'fit-content',
        }}
      >
        {clueGrid.map((rowValues, row) =>
          rowValues.map((clue, col) => {
            const pieceIndex = findPieceIndex(pieces, row, col)
            const piece = pieceIndex !== -1 ? pieces[pieceIndex] : null
            const invalid = piece && !isPieceValid(clueGrid, piece)
            const isPending = pendingCell && pendingCell.row === row && pendingCell.col === col
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                onClick={() => handleCellClick(row, col)}
                className="d-flex flex-column align-items-center justify-content-center p-0"
                style={{
                  border: invalid ? '2px solid #dc3545' : '1px solid #ced4da',
                  backgroundColor: piece ? PIECE_COLORS[pieceIndex % PIECE_COLORS.length] : '#fff',
                  outline: isPending ? '2px solid #0d6efd' : undefined,
                  outlineOffset: isPending ? '-2px' : undefined,
                }}
              >
                {clue && (
                  <>
                    <span className="fw-bold" style={{ fontSize: '1rem' }}>
                      {clue.value}
                    </span>
                    <ShapeHint shape={clue.shape} />
                  </>
                )}
              </button>
            )
          }),
        )}
      </div>

      <p className="text-secondary small mt-2 mb-0">
        Clicca due celle per definire il rettangolo che le racchiude: deve contenere esattamente un numero, con area e
        forma (quadrato/largo/alto, mostrata sotto il numero) corrispondenti. Clicca un rettangolo gia' piazzato per
        rimuoverlo. Copri tutta la griglia per vincere.
      </p>

      <Button variant="outline-secondary" size="sm" className="mt-3" onClick={handleNewGame}>
        Nuova partita
      </Button>
    </div>
  )
}
