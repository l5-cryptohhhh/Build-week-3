import { Link } from 'react-router-dom'
import jobSearchAd from '../../assets/job-search-ad.png'

export default function AdWidget() {
  return (
    <Link to="/jobs">
      <img src={jobSearchAd} className="w-100 mt-3 rounded" alt="Cerca offerte di lavoro" />
    </Link>
  )
}
