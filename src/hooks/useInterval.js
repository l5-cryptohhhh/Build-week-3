import { useEffect, useRef } from 'react'

// Poll `callback` every `delay` ms. Pass `delay: null` to pause polling
// (es. tab non attiva / dati non ancora pronti) senza smontare l'effetto.
export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return undefined
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
