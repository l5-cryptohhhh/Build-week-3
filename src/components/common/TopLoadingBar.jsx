import { useEffect, useRef, useState } from 'react'

export default function TopLoadingBar() {
  const [visible, setVisible] = useState(false)
  const countRef = useRef(0)

  useEffect(() => {
    function start() {
      countRef.current += 1
      setVisible(true)
    }
    function stop() {
      countRef.current = Math.max(0, countRef.current - 1)
      if (countRef.current === 0) setVisible(false)
    }

    window.addEventListener('loadingbar:start', start)
    window.addEventListener('loadingbar:stop', stop)
    return () => {
      window.removeEventListener('loadingbar:start', start)
      window.removeEventListener('loadingbar:stop', stop)
    }
  }, [])

  if (!visible) return null

  return <div className="top-loading-bar" aria-hidden="true" />
}
