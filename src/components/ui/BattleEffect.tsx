'use client'

import { useState, useEffect } from 'react'
import { BATTLE_EFFECTS, RESULT_ANIMATIONS } from '@/lib/ascii-art'

interface BattleEffectProps {
  effect: 'ATTACK' | 'DEFEND' | 'MAGIC' | 'CRITICAL' | 'VICTORY' | 'DEFEAT'
  duration?: number
  onComplete?: () => void
}

export function BattleEffect({ effect, duration = 2000, onComplete }: BattleEffectProps) {
  const [visible, setVisible] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const phases = 4
    const phaseInterval = duration / phases

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % phases)
    }, phaseInterval)

    const timeout = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [duration, onComplete])

  if (!visible) return null

  const getEffectArt = () => {
    if (effect === 'VICTORY' || effect === 'DEFEAT') {
      return RESULT_ANIMATIONS[effect]
    }
    return BATTLE_EFFECTS[effect]
  }

  const getEffectColors = () => {
    switch (effect) {
      case 'ATTACK':
        return 'text-red-400'
      case 'DEFEND':
        return 'text-blue-400'
      case 'MAGIC':
        return 'text-purple-400'
      case 'CRITICAL':
        return 'text-yellow-400'
      case 'VICTORY':
        return 'text-green-400'
      case 'DEFEAT':
        return 'text-red-600'
      default:
        return 'text-white'
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 border border-white/20">
        <div 
          className={`font-mono text-lg leading-none select-none ${getEffectColors()} transition-all duration-300`}
          style={{
            transform: `scale(${1 + animationPhase * 0.1})`,
            opacity: 1 - animationPhase * 0.2
          }}
        >
          <pre className="whitespace-pre text-center">
            {getEffectArt()}
          </pre>
        </div>
      </div>
    </div>
  )
}
