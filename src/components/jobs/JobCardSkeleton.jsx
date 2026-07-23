import Card from 'react-bootstrap/Card'
import Skeleton from '../common/Skeleton'

export default function JobCardSkeleton() {
  return (
    <Card className="shadow-sm mb-3">
      <Card.Body>
        <Skeleton width="60%" height="0.9rem" className="mb-2" />
        <Skeleton width="35%" height="0.75rem" className="mb-3" />
        <Skeleton width="100%" height="0.75rem" className="mb-2" />
        <Skeleton width="80%" height="0.75rem" />
      </Card.Body>
    </Card>
  )
}
