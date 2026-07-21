import Skeleton from './Skeleton'

// Riga generica avatar + testo, riusata per gli stati di caricamento di
// commenti, messaggi e conversazioni (layout identico, solo dimensioni diverse).
export default function RowSkeleton({ avatarSize = 28, lines = 2 }) {
  return (
    <div className="d-flex gap-2 mb-2">
      <Skeleton width={avatarSize} height={avatarSize} className="rounded-circle" />
      <div className="flex-grow-1">
        <Skeleton width="35%" height="0.8rem" className="mb-2" />
        {lines > 1 && <Skeleton width="65%" height="0.8rem" />}
      </div>
    </div>
  )
}
