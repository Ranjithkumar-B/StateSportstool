import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const PARTICLE_COUNT = 30
const COLORS = ['particle--gold', 'particle--orange', 'particle--blue']

export default function Particles() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const el = document.createElement('div')
        el.classList.add('particle', COLORS[i % COLORS.length])
        const size = Math.random() * 6 + 3
        el.style.width = size + 'px'
        el.style.height = size + 'px'
        el.style.left = Math.random() * 100 + '%'
        el.style.top = Math.random() * 100 + '%'
        container.appendChild(el)

        gsap.to(el, {
          opacity: Math.random() * 0.5 + 0.2,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })

        gsap.to(el, {
          y: (Math.random() - 0.5) * 120,
          x: (Math.random() - 0.5) * 80,
          duration: Math.random() * 6 + 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      }
    }, containerRef)

    return () => {
      ctx.revert()
      if (container) container.innerHTML = ''
    }
  }, [])

  return <div className="particles" ref={containerRef} />
}
