import Card from 'react-bootstrap/Card'
import Skeleton from '../common/Skeleton'

export default function PostCardSkeleton() {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Skeleton width={40} height={40} className="rounded-circle" />
          <div className="flex-grow-1">
            <Skeleton width="40%" height="0.9rem" className="mb-2" />
            <Skeleton width="25%" height="0.75rem" />
          </div>
        </div>
        <Skeleton width="100%" height="0.9rem" className="mb-2" />
        <Skeleton width="70%" height="0.9rem" />
      </Card.Body>
    </Card>
  )
}
