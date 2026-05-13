import { useEffect, useRef, useState } from 'react'

// Cubic ease-in: starts slow, accelerates — counter speeds up as value grows
function easeIn(t: number): number {
  return t * t * t
}

export function useCountUp(target: number, duration = 1400): number {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    let startTime: number | null = null

    function tick(timestamp: number) {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplayed(easeIn(progress) * target)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayed(target)
      }
    }

    setDisplayed(0)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return displayed
}
