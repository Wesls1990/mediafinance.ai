'use client'
import { useEffect } from 'react'

const PASSCODE = 'demo123'; // 🔐 change this to whatever you want

export default function PassProtect() {
  useEffect(() => {
    const container = document.getElementById('demos')
    if (!container) return

    const onClick = (e: Event) => {
      const target = e.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement | null
      if (!link) return

      // Only protect links explicitly marked
      if (!link.dataset.protect) return

      // Optional: remember once per session
      const saved = sessionStorage.getItem('mfai-pass-ok')
      if (saved === '1') return

      e.preventDefault()
      const code = window.prompt('Enter demo passcode')
      if (!code) return
      if (code === PASSCODE) {
        sessionStorage.setItem('mfai-pass-ok', '1')
        window.location.href = link.href
      } else {
        alert('Incorrect passcode')
      }
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [])

  return null
}
