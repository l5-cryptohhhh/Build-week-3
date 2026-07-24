import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import { generatePuzzle, isAdjacent, SIZE, TOTAL_CELLS } from '../../utils/zip'

const CELL_SIZE = '2.75rem'
const GAP_SIZE = '0.6rem'

function createBoard() {
  const { numberGrid, checkpointCount } = generatePuzzle()
  return { numberGrid, checkpointCount }
}

function findIndexInPath(path, row, col) {
  return path.findIndex(([r, c]) => r === row && c === col)
}

function connectionKeys(path) {
  const keys = new Set()
  for (let i = 0; i < path.length - 1; i++) {
    const [r1, c1] = path[i]
    const [r2, c2] = path[i + 1]
    if (r1 === r2) keys.add(`h-${r1}-${Math.min(c1, c2)}`)
    else keys.add(`v-${Math.min(r1, r2)}-${c1}`)
  }
  return keys
}

export default function Zip() {
  const [board, setBoard] = useState(createBoard)
  const [path, setPath] = useState([])
  const { numberGrid } = board

  const solved = path.length === TOTAL_CELLS

  const handleCellClick = (row, col) => {
    const existingIndex = findIndexInPath(path, row, col)
    if (existingIndex !== -1) {
      setPath(path.slice(0, existingIndex + 1))
      return
    }

    if (path.length === 0) {
      if (numberGrid[row][col] === 1) setPath([[row, col]])
      return
    }

    const last = path[path.length - 1]
    if (!isAdjacent(last, [row, col])) return

    const number = numberGrid[row][col]
    if (number > 0) {
      const numbersVisited = path.filter(([r, c]) => numberGrid[r][c] > 0).length
      if (number !== numbersVisited + 1) return
    }

    setPath([...path, [row, col]])
  }

  const handleNewGame = () => {
    setBoard(createBoard())
    setPath([])
  }

  const connections = connectionKeys(path)
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
            const inPath = findIndexInPath(path, row, col) !== -1
            const isHead = path.length > 0 && path[path.length - 1][0] === row && path[path.length - 1][1] === col
            const number = numberGrid[row][col]
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellClick(row, col)}
                className={`d-flex align-items-center justify-content-center fw-bold border-0 ${
                  inPath ? 'bg-primary text-white' : 'bg-white text-dark'
                } ${isHead ? 'border border-2 border-dark' : ''}`}
                style={{ border: inPath ? undefined : '1px solid #ced4da' }}
              >
                {number > 0 ? number : ''}
              </button>
            )
          }

          if (rowIsCell && !colIsCell) {
            const row = row2 / 2
            const col = (col2 - 1) / 2
            const connected = connections.has(`h-${row}-${col}`)
            return (
              <div key={key} className="d-flex align-items-center justify-content-center">
                {connected && <div className="bg-primary" style={{ width: '100%', height: '0.5rem' }} />}
              </div>
            )
          }

          if (!rowIsCell && colIsCell) {
            const row = (row2 - 1) / 2
            const col = col2 / 2
            const connected = connections.has(`v-${row}-${col}`)
            return (
              <div key={key} className="d-flex align-items-center justify-content-center">
                {connected && <div className="bg-primary" style={{ width: '0.5rem', height: '100%' }} />}
              </div>
            )
          }

          return <div key={key} />
        })}
      </div>

      <p className="text-secondary small mt-2 mb-0">
        Parti dalla cella 1 e collega le celle adiacenti in ordine crescente, passando per ogni casella della griglia
        una sola volta. Clicca una cella gia' visitata per tornare indietro.
      </p>

      <Button variant="outline-secondary" size="sm" className="mt-3" onClick={handleNewGame}>
        Nuova partita
      </Button>
    </div>
  )
}
