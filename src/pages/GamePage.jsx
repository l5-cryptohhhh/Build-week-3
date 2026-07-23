import { useParams, Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import { getPuzzleBySlug } from '../data/puzzles'
import MiniSudoku from '../components/games/MiniSudoku'
import Tango from '../components/games/Tango'
import Zip from '../components/games/Zip'
import Patches from '../components/games/Patches'

export default function GamePage() {
  const { slug } = useParams()
  const puzzle = getPuzzleBySlug(slug)

  if (!puzzle) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <p className="mb-2">Rompicapo non trovato.</p>
          <Link to="/">Torna al feed</Link>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
            style={{ width: 44, height: 44, backgroundColor: puzzle.color }}
          >
            <i className={`bi ${puzzle.icon} text-white fs-5`}></i>
          </span>
          <div>
            <h1 className="h5 mb-0">
              {puzzle.name} <span className="text-secondary">#{puzzle.number}</span>
            </h1>
            <p className="text-secondary small mb-0">{puzzle.subtitle}</p>
          </div>
        </div>

        {puzzle.slug === 'mini-sudoku' && <MiniSudoku />}
        {puzzle.slug === 'tango' && <Tango />}
        {puzzle.slug === 'zip' && <Zip />}
        {puzzle.slug === 'patches' && <Patches />}
        {!puzzle.playable && <p className="text-secondary mb-0">Presto disponibile.</p>}
      </Card.Body>
    </Card>
  )
}
