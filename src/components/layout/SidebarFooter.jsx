const LINKS = [
  'Informazioni',
  'Accessibilità',
  'Centro assistenza',
  'Privacy e condizioni',
  'Opzioni per gli annunci pubblicitari',
  'Pubblicità',
  'Servizi alle aziende',
  'Scarica l’app inClone',
  'Altro',
]

export default function SidebarFooter() {
  return (
    <footer className="small text-secondary text-center mt-3 px-2">
      <nav className="d-flex flex-wrap justify-content-center gap-2 mb-2">
        {LINKS.map((label) => (
          <a key={label} href="#" onClick={(event) => event.preventDefault()} className="link-secondary">
            {label}
          </a>
        ))}
      </nav>
      <div className="d-flex align-items-center justify-content-center gap-1">
        <span className="brand-logo" style={{ fontSize: '0.9rem' }}>
          <span className="brand-in">in</span>
          <span className="brand-clone">Clone</span>
        </span>
        <span>inClone Corporation © {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
