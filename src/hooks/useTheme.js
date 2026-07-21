import { useState } from 'react'

const THEME_STORAGE_KEY = 'social_app_theme'

// Il tema iniziale viene gia' applicato a <html> da uno script inline in
// index.html (eseguito prima del mount di React, per evitare il flash del
// tema sbagliato). Qui si legge quel valore invece di ricalcolarlo.
function getInitialTheme() {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-bs-theme', next)
      localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }

  return [theme, toggleTheme]
}
