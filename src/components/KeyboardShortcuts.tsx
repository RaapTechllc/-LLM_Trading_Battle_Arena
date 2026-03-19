'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger on Alt + key combinations
      if (!event.altKey) return

      switch (event.key) {
        case '1':
          event.preventDefault()
          router.push('/')
          break
        case '2':
          event.preventDefault()
          router.push('/simulate')
          break
        case '3':
          event.preventDefault()
          router.push('/journal')
          break
        case '4':
          event.preventDefault()
          router.push('/showdown')
          break
        case '5':
          event.preventDefault()
          router.push('/leaderboard')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [router])

  return null // This component doesn't render anything
}
