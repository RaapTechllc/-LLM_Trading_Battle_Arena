'use client'

import { ASCII_CARD_ART } from '@/lib/ascii-art'

interface ASCIICardArtProps {
  cardType: 'CREATURE' | 'SPELL' | 'ARTIFACT'
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  className?: string
}

export function ASCIICardArt({ cardType, rarity, className = '' }: ASCIICardArtProps) {
  const artData = ASCII_CARD_ART[cardType]?.[rarity] || ASCII_CARD_ART.CREATURE.COMMON
  
  return (
    <div className={`font-mono text-xs leading-none select-none ${className}`}>
      <pre className="whitespace-pre text-center opacity-70 group-hover:opacity-90 transition-opacity">
        {artData}
      </pre>
    </div>
  )
}
