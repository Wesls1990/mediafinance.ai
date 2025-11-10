'use client'
import { useEffect } from 'react'

export default function ScrollEffects() {
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 24) {
        document.body.classList.add('nav-shrink')
      } else {
        document.body.classList.remove('nav-shrink')
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}
