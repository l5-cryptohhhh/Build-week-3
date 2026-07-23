import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { generatePuzzle, hasConflict, isSolved, GRID_SIZE, BOX_SIZE } from '../../utils/miniSudoku'

function createBoard() {
  const grid = generatePuzzle()
  const locked = grid.map((row) => row.map((value) => value !== 0))
  return { grid, locked }
}

export default function MiniSudoku() {
  const [board, setBoard] = useState(createBoard)
  const [solved, setSolved] = useState(false)
  const { grid, locked } = board

  const handleChange = (row, col, rawValue) => {
    const digit = rawValue.replace(/[^1-6]/g, '').slice(-1)
    const value = digit ? Number(digit) : 0
    const nextGrid = grid.map((r) => [...r])
    nextGrid[row][col] = value
    setBoard({ grid: nextGrid, locked })
    setSolved(isSolved(nextGrid))
  }

  const handleNewGame = () => {
    setBoard(createBoard())
    setSolved(false)
  }

  return (
    <div>
      {solved && <div className="alert alert-success py-2 mb-3">Complimenti, rompicapo risolto!</div>}

      <div
        className="d-inline-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 3rem)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 3rem)`,
          border: '2px solid #212529',
        }}
      >
        {grid.map((rowValues, row) =>
          rowValues.map((value, col) => {
            const conflict = value !== 0 && hasConflict(grid, row, col)
            return (
              <input
                key={`${row}-${col}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value || ''}
                readOnly={locked[row][col]}
                onChange={(event) => handleChange(row, col, event.target.value)}
                className={`text-center fs-5 ${locked[row][col] ? 'fw-bold bg-light' : 'bg-white'} ${
                  conflict ? 'text-danger' : 'text-dark'
                }`}
                style={{
                  border: '1px solid #ced4da',
                  borderRight:
                    (col + 1) % BOX_SIZE.cols === 0 && col !== GRID_SIZE - 1 ? '2px solid #212529' : undefined,
                  borderBottom:
                    (row + 1) % BOX_SIZE.rows === 0 && row !== GRID_SIZE - 1 ? '2px solid #212529' : undefined,
                }}
              />
            )
          }),
        )}
      </div>

      <div>
        <Button variant="outline-secondary" size="sm" className="mt-3" onClick={handleNewGame}>
          Nuova partita
        </Button>
      </div>
    </div>
  )
}
