import { useDispatch, useSelector } from 'react-redux'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import { formatRelativeTime } from '../../utils/dateFormat'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { updateProfile } from '../../features/users/usersSlice'

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatJobType(jobType) {
  if (!jobType) return null
  return jobType.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export default function JobCard({ job }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const description = stripHtml(job.description || '')
  const jobType = formatJobType(job.job_type)
  const savedJobs = currentUser?.savedJobs || []
  const isSaved = savedJobs.some((saved) => saved._id === job._id)

  const handleToggleSave = () => {
    const nextSavedJobs = isSaved
      ? savedJobs.filter((saved) => saved._id !== job._id)
      : [job, ...savedJobs]
    dispatch(updateProfile({ id: currentUser.id, changes: { savedJobs: nextSavedJobs } }))
  }

  return (
    <Card className="shadow-sm mb-3 animate-fade-in">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <Card.Title className="h6 mb-1">{job.title}</Card.Title>
            <div className="text-secondary small mb-2">
              {job.company_name}
              {job.candidate_required_location && ` · ${job.candidate_required_location}`}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 text-nowrap">
            <span className="text-secondary small">{formatRelativeTime(job.publication_date)}</span>
            {currentUser && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleToggleSave}
                aria-label={isSaved ? 'Rimuovi dai salvati' : 'Salva offerta'}
                title={isSaved ? 'Rimuovi dai salvati' : 'Salva offerta'}
              >
                <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
              </button>
            )}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-2">
          {jobType && (
            <Badge bg="secondary-subtle" text="secondary-emphasis">
              {jobType}
            </Badge>
          )}
          {job.category && (
            <Badge bg="secondary-subtle" text="secondary-emphasis">
              {job.category}
            </Badge>
          )}
          {job.salary && (
            <Badge bg="secondary-subtle" text="secondary-emphasis">
              {job.salary}
            </Badge>
          )}
        </div>

        {description && (
          <Card.Text className="small text-secondary mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </Card.Text>
        )}

        <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
          Vedi offerta
        </a>
      </Card.Body>
    </Card>
  )
}
