import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import EmptyState from '../components/common/EmptyState'
import JobCard from '../components/jobs/JobCard'
import JobCardSkeleton from '../components/jobs/JobCardSkeleton'
import useDebounce from '../hooks/useDebounce'
import {
  searchJobs,
  showMoreJobs,
  selectJobsQuery,
  selectVisibleJobs,
  selectJobsHasMore,
  selectJobsTotal,
  selectJobsStatus,
} from '../features/jobs/jobsSlice'

export default function JobsPage() {
  const dispatch = useDispatch()
  const query = useSelector(selectJobsQuery)
  const jobs = useSelector(selectVisibleJobs)
  const hasMore = useSelector(selectJobsHasMore)
  const total = useSelector(selectJobsTotal)
  const status = useSelector(selectJobsStatus)
  const [input, setInput] = useState(query)
  const debouncedInput = useDebounce(input, 400)

  useEffect(() => {
    if (!debouncedInput.trim()) return
    dispatch(searchJobs(debouncedInput.trim()))
  }, [dispatch, debouncedInput])

  const hasQuery = input.trim().length > 0

  return (
    <Row>
      <Col lg={8} className="mx-auto">
        <h1 className="h4 mb-3">Offerte di lavoro</h1>
        <Form.Control
          size="lg"
          placeholder="Cerca per titolo, azienda o competenza..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          autoFocus
          className="mb-4"
        />

        {!hasQuery ? (
          <EmptyState
            icon="bi-briefcase"
            title="Cerca la tua prossima opportunita'"
            description="Digita una parola chiave per vedere le offerte disponibili."
          />
        ) : (
          <>
            {status === 'loading' && jobs.length === 0 && (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            )}

            {status === 'failed' && (
              <EmptyState
                icon="bi-exclamation-triangle"
                title="Offerte non disponibili"
                description="Riprova piu' tardi."
              />
            )}

            {status === 'succeeded' && jobs.length === 0 && (
              <EmptyState icon="bi-briefcase" title="Nessuna offerta trovata" />
            )}

            {jobs.length > 0 && (
              <>
                <p className="text-secondary small mb-3">{total} offerte trovate</p>
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
                {hasMore && (
                  <div className="text-center mb-3">
                    <Button variant="outline-primary" onClick={() => dispatch(showMoreJobs())}>
                      Carica altre offerte
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Col>
    </Row>
  )
}
