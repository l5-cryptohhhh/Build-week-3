import { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Skeleton from '../common/Skeleton'
import { fetchNews } from '../../api/newsService'
import { formatRelativeTime } from '../../utils/dateFormat'

const PER_PAGE = 3
const MAX_ITEMS = 7

export default function NewsWidget() {
  const [items, setItems] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    fetchNews({ page: 1, perPage: PER_PAGE })
      .then(({ results }) => {
        if (cancelled) return
        setItems(results)
        setStatus('succeeded')
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleShowMore = async () => {
    // Fino a MAX_ITEMS il bottone carica altre notizie (una sola pagina in
    // piu'); una volta raggiunto il tetto diventa un toggle mostra/nascondi
    // sui dati gia' scaricati, senza altre richieste.
    if (items.length >= MAX_ITEMS) {
      setExpanded((prev) => !prev)
      return
    }
    setStatus('loadingMore')
    try {
      const { results } = await fetchNews({ page: 2, perPage: MAX_ITEMS - PER_PAGE })
      setItems((prev) => [...prev, ...results].slice(0, MAX_ITEMS))
      setExpanded(true)
      setStatus('succeeded')
    } catch {
      setStatus('succeeded')
    }
  }

  const visibleItems = items.length > PER_PAGE && !expanded ? items.slice(0, PER_PAGE) : items
  const showToggle = items.length > PER_PAGE || (items.length === PER_PAGE && status !== 'failed')
  const isCollapseMode = items.length >= MAX_ITEMS

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="h6 d-flex align-items-center gap-2">
          inClone Notizie
          <i className="bi bi-info-circle text-secondary ms-auto" style={{ fontSize: '0.8rem' }}></i>
        </Card.Title>
        <p className="text-secondary small mb-2">Storie principali</p>

        {status === 'loading' && (
          <div>
            {[0, 1, 2].map((key) => (
              <div key={key} className="mb-3">
                <Skeleton width="90%" height="0.85rem" className="mb-2" />
                <Skeleton width="40%" height="0.7rem" />
              </div>
            ))}
          </div>
        )}

        {status === 'failed' && (
          <p className="text-secondary small mb-0">Notizie non disponibili al momento.</p>
        )}

        {(status === 'succeeded' || status === 'loadingMore') && (
          <>
            <ul className="list-unstyled mb-2">
              {visibleItems.map((item) => (
                <li key={item.id} className="mb-3">
                  <span
                    className="fw-semibold d-block mb-1"
                    style={{ fontSize: '0.85rem', lineHeight: 1.3 }}
                  >
                    {item.title}
                  </span>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    {formatRelativeTime(item.published_at)}
                  </div>
                </li>
              ))}
            </ul>

            {showToggle && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-secondary text-decoration-none d-flex align-items-center gap-1"
                onClick={handleShowMore}
                disabled={status === 'loadingMore'}
              >
                <i
                  className={`bi ${
                    status === 'loadingMore'
                      ? 'bi-arrow-repeat'
                      : isCollapseMode && expanded
                        ? 'bi-chevron-up'
                        : 'bi-chevron-down'
                  }`}
                ></i>
                {status === 'loadingMore'
                  ? 'Caricamento...'
                  : isCollapseMode && expanded
                    ? 'Mostra meno notizie'
                    : 'Mostra altre notizie'}
              </button>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  )
}
