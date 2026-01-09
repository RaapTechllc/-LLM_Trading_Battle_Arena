'use client'

import { useState } from 'react'
import { soundManager } from '@/lib/sounds'

interface TradeResult {
  model: string
  success: boolean
  card?: { asset: string; direction: string; pnlPercent: number; rarity: string }
  error?: string
}

export default function AutoTradeButton() {
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<{ message: string; results: TradeResult[] } | null>(null)

  const runAutoTrade = async () => {
    setIsRunning(true)
    setLastResult(null)
    soundManager.battleStart()

    try {
      const response = await fetch('/api/auto-trade', { method: 'POST' })
      const data = await response.json()

      setLastResult({ message: data.message, results: data.results })
      
      if (data.success) {
        soundManager.victory()
      } else {
        soundManager.defeat()
      }
    } catch (error) {
      setLastResult({ message: 'Failed to run auto-trade', results: [] })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={runAutoTrade}
        disabled={isRunning}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black tracking-widest uppercase rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⚡</span> AI MODELS TRADING...
          </span>
        ) : (
          '🤖 RUN AI TRADING ROUND'
        )}
      </button>

      {lastResult && (
        <div className="text-center animate-fade-in">
          <div className="text-[10px] font-bold text-neon-profit tracking-widest uppercase mb-2">
            {lastResult.message}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {lastResult.results.filter(r => r.success).map((r, i) => (
              <span key={i} className={`text-[9px] px-2 py-1 rounded ${
                r.card?.pnlPercent && r.card.pnlPercent > 0 ? 'bg-neon-profit/20 text-neon-profit' : 'bg-neon-loss/20 text-neon-loss'
              }`}>
                {r.model.split(' ')[0]}: {r.card?.pnlPercent?.toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
