import Dropdown from 'react-bootstrap/Dropdown'
import { showToast } from '../../utils/toast'

// Instagram/TikTok/YouTube non espongono un'intent web per pre-compilare una
// condivisione di testo (a differenza di WhatsApp/Telegram): per queste si
// copia il link negli appunti e si apre l'app/sito, cosi' l'utente puo'
// incollarlo manualmente.
const CLIPBOARD_PLATFORMS = {
  instagram: { icon: 'bi-instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
  tiktok: { icon: 'bi-tiktok', label: 'TikTok', href: 'https://www.tiktok.com/upload' },
  youtube: { icon: 'bi-youtube', label: 'YouTube', href: 'https://studio.youtube.com/' },
}

export default function ShareMenu({ post }) {
  const shareUrl = window.location.origin
  const shareText = `${post.content}\n\n${shareUrl}`

  const handleClipboardShare = async (platform) => {
    try {
      await navigator.clipboard.writeText(shareText)
      showToast(`Link copiato: incollalo su ${CLIPBOARD_PLATFORMS[platform].label}.`)
    } catch {
      showToast('Impossibile copiare il link.', 'danger')
    }
    window.open(CLIPBOARD_PLATFORMS[platform].href, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dropdown drop="up" align="end" className="ms-auto">
      <Dropdown.Toggle variant="outline-secondary" size="sm" className="no-caret" id="share-menu">
        <i className="bi bi-share me-1"></i>
        Condividi
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-whatsapp me-2 text-success"></i>WhatsApp
        </Dropdown.Item>
        <Dropdown.Item
          href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.content)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-telegram me-2 text-info"></i>Telegram
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClipboardShare('instagram')}>
          <i className="bi bi-instagram me-2 text-danger"></i>Instagram
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClipboardShare('tiktok')}>
          <i className="bi bi-tiktok me-2"></i>TikTok
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleClipboardShare('youtube')}>
          <i className="bi bi-youtube me-2 text-danger"></i>YouTube
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
