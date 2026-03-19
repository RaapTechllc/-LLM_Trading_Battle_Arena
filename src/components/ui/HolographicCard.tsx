'use client'

import { ReactNode } from 'react'
import '../../styles/holographic-effects.css'

interface HolographicCardProps {
  children: ReactNode
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  className?: string
  onClick?: () => void
}

export function HolographicCard({ children, rarity, className = '', onClick }: HolographicCardProps) {
  const getRarityClasses = () => {
    const baseClasses = 'holographic-card relative overflow-hidden'
    
    switch (rarity) {
      case 'LEGENDARY':
        return `${baseClasses} holographic-legendary`
      case 'EPIC':
        return `${baseClasses} holographic-epic`
      case 'RARE':
        return `${baseClasses} holographic-rare`
      default:
        return `${baseClasses} holographic-common`
    }
  }

  return (
    <div 
      className={`${getRarityClasses()} ${className}`}
      onClick={onClick}
    >
      {/* Foil shine effect */}
      <div className="foil-shine" />
      
      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
