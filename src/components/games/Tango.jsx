import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { generatePuzzle, hasConflict, isSolved, SIZE, SUN, MOON } from '../../utils/tango'

const CELL_SIZE = '3rem'
const GAP_SIZE = '1rem'
const NEXT_VALUE = { [SUN]: MOON, [MOON]: null, null: SUN }
const SYMBOL_LABEL = { [SUN]: '☀️', [MOON]: '🌙' }

function createBoard() {
  const { puzzle, given, hEdges, vEdges } = generatePuzzle()
  return { grid: puzzle, given, hEdges, vEdges }
}

export default function Tango() {
  const [board, setBoard] = useState(createBoard)
  const [solved, setSolved] = useState(false)
  const { grid, given, hEdges, vEdges } = board

  const handleCellClick = (row, col) => {
    if (given[row][col]) return
    const nextGrid = grid.map((r) => [...r])
    nextGrid[row][col] = NEXT_VALUE[nextGrid[row][col]]
    setBoard({ ...board, grid: nextGrid })
    setSolved(isSolved(nextGrid, hEdges, vEdges))
  }

  const handleNewGame = () => {
    setBoard(createBoard())
    setSolved(false)
  }

  const trackSizes = Array.from({ length: SIZE * 2 - 1 }, (_, i) => (i % 2 === 0 ? CELL_SIZE : GAP_SIZE)).join(' ')

  const positions = []
  for (let row2 = 0; row2 < SIZE * 2 - 1; row2++) {
    for (let col2 = 0; col2 < SIZE * 2 - 1; col2++) {
      positions.push({ row2, col2 })
    }
  }

  return (
    <div>
      {solved && <div className="alert alert-success py-2 mb-3">Complimenti, rompicapo risolto!</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: trackSizes,
          gridTemplateRows: trackSizes,
          border: '2px solid #212529',
          width: 'fit-content',
        }}
      >
        {positions.map(({ row2, col2 }) => {
          const rowIsCell = row2 % 2 === 0
          const colIsCell = col2 % 2 === 0
          const key = `${row2}-${col2}`

          if (rowIsCell && colIsCell) {
            const row = row2 / 2
            const col = col2 / 2
            const value = grid[row][col]
            const conflict = value !== null && hasConflict(grid, hEdges, vEdges, row, col)
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellClick(row, col)}
                disabled={given[row][col]}
                className={`d-flex align-items-center justify-content-center fs-4 border-0 ${
                  given[row][col] ? 'bg-light' : 'bg-white'
                } ${conflict ? 'bg-danger-subtle' : ''}`}
                style={{ border: '1px solid #ced4da' }}
              >
                {SYMBOL_LABEL[value] || ''}
              </button>
            )
          }

          if (rowIsCell && !colIsCell) {
            const row = row2 / 2
            const col = (col2 - 1) / 2
            return (
              <div key={key} className="d-flex align-items-center justify-content-center text-secondary fw-bold">
                {hEdges[row][col] || ''}
              </div>
            )
          }

          if (!rowIsCell && colIsCell) {
            const row = (row2 - 1) / 2
            const col = col2 / 2
            return (
              <div key={key} className="d-flex align-items-center justify-content-center text-secondary fw-bold">
                {vEdges[row][col] || ''}
              </div>
            )
          }

          return <div key={key} />
        })}
      </div>

      <p className="text-secondary small mt-2 mb-0">
        Clicca una cella per alternare sole/luna/vuoto. Ogni riga e colonna: 3 soli e 3 lune, mai 3 uguali di fila,
        rispetta i vincoli = (uguale) e × (diverso).
      </p>

      <Button variant="outline-secondary" size="sm" className="mt-3" onClick={handleNewGame}>
        Nuova partita
      </Button>
    </div>
  )
}
