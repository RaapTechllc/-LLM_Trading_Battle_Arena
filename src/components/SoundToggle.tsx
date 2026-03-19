'use client'

import { useState, useEffect } from 'react'
import { soundManager } from '@/lib/sounds'

export default function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled())
  }, [])

  const toggleSound = () => {
    const enabled = soundManager.toggle()
    setSoundEnabled(enabled)
  }

  return (
    <button
      onClick={toggleSound}
      className={`text-lg transition-all duration-300 hover:scale-110 flex items-center justify-center w-8 h-8 rounded-full ${soundEnabled ? 'text-neon-profit bg-neon-profit/10' : 'text-tertiary bg-white/5'}`}
      title={soundEnabled ? 'Disable Audio Feedback' : 'Enable Audio Feedback'}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  )
}
