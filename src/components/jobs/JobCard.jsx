import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import { formatRelativeTime } from '../../utils/dateFormat'

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatJobType(jobType) {
  if (!jobType) return null
  return jobType.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export default function JobCard({ job }) {
  const description = stripHtml(job.description || '')
  const jobType = formatJobType(job.job_type)

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
          <span className="text-secondary small text-nowrap">
            {formatRelativeTime(job.publication_date)}
          </span>
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
