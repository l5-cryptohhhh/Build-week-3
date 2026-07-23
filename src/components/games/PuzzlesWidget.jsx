import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import { PUZZLES } from '../../data/puzzles'

export default function PuzzlesWidget() {
  return (
    <Card className="shadow-sm mt-3">
      <Card.Body>
        <Card.Title className="h6 mb-3">I rompicapo di oggi</Card.Title>
        <ul className="list-unstyled mb-0">
          {PUZZLES.map((puzzle) => (
            <li key={puzzle.slug} className="mb-1">
              <Link
                to={`/games/${puzzle.slug}`}
                className="d-flex align-items-center gap-2 text-decoration-none text-dark p-1 rounded"
              >
                <span
                  className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 36, height: 36, backgroundColor: puzzle.color }}
                >
                  <i className={`bi ${puzzle.icon} text-white`}></i>
                </span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="d-block fw-semibold" style={{ fontSize: '0.9rem' }}>
                    {puzzle.name} <span className="text-secondary fw-normal">#{puzzle.number}</span>
                  </span>
                  <span className="d-block text-secondary text-truncate" style={{ fontSize: '0.78rem' }}>
                    {puzzle.subtitle}
                  </span>
                </span>
                <i className="bi bi-chevron-right text-secondary flex-shrink-0"></i>
              </Link>
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  )
}
