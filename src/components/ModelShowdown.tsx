'use client'

import { useState } from 'react'
import { TRADING_MODELS } from '@/lib/constants'
import { TradeCard } from '@/components/cards/TradeCard'
import { soundManager } from '@/lib/sounds'

interface ShowdownCard {
  id: string
  modelName: string
  modelAvatar: string
  asset: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  leverage: number
  pnlPercent: number
  pnlUsd: number
  holdingHours: number
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  reasoning?: string
}

interface ShowdownModel {
  id: string
  name: string
  avatar: string
  provider: string
  cards: ShowdownCard[]
  score: number
}

interface BattleResult {
  battleId: string
  model1: ShowdownModel
  model2: ShowdownModel
  winner: 'model1' | 'model2' | 'tie'
  createdAt: string
}

export default function ModelShowdown() {
  const [model1Name, setModel1Name] = useState('')
  const [model2Name, setModel2Name] = useState('')
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)

  const startShowdown = async () => {
    if (!model1Name || !model2Name) {
      setError('SELECT BOTH FIGHTERS')
      return
    }

    if (model1Name === model2Name) {
      setError('MODELS MUST BE DISTINCT')
      return
    }

    setIsLoading(true)
    setError('')
    soundManager.battleStart()

    try {
      const response = await fetch('/api/showdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model1Name, model2Name })
      })

      if (response.ok) {
        const result = await response.json()
        setBattleResult(result)

        setTimeout(() => {
          setShowResults(true)
          if (result.winner === 'tie') {
            soundManager.defeat()
          } else {
            soundManager.victory()
          }
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'BATTLE PROTOCOL FAILED')
      }
    } catch (error) {
      console.error('Showdown error:', error)
      setError('CONNECTION INTERRUPTED')
    } finally {
      setIsLoading(false)
    }
  }

  const resetShowdown = () => {
    setBattleResult(null)
    setShowResults(false)
    setError('')
    setModel1Name('')
    setModel2Name('')
  }

  const getWinnerName = () => {
    if (!battleResult) return ''
    if (battleResult.winner === 'tie') return "STALEMATE"
    return battleResult.winner === 'model1' ? battleResult.model1.name : battleResult.model2.name
  }

  if (battleResult && !isLoading) {
    return (
      <div className="space-y-12 max-w-6xl mx-auto relative">
        {/* Epic background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-profit/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-loss/10 blur-[120px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="text-center relative z-10">
          <h2 className="text-xs font-black tracking-[0.5em] text-tertiary uppercase mb-12 flex items-center justify-center gap-4" style={{fontFamily: 'var(--font-display)'}}>
            <span className="h-[2px] w-20 bg-gradient-to-r from-transparent to-neon-loss"></span>
            <span className="flex items-center gap-3">
              <span className="text-neon-loss text-2xl animate-pulse">⚔️</span>
              MODEL SHOWDOWN ACTIVE
              <span className="text-neon-loss text-2xl animate-pulse">⚔️</span>
            </span>
            <span className="h-[2px] w-20 bg-gradient-to-l from-transparent to-neon-loss"></span>
          </h2>

          <div className="flex justify-center items-center gap-8 md:gap-20 mb-8">
            {/* Model 1 */}
            <div className="text-center group/model relative">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-profit/20 to-transparent blur-2xl opacity-0 group-hover/model:opacity-100 transition-opacity"></div>
              <div className="relative p-8 rounded-2xl bg-void-surface/50 backdrop-blur-xl border-2 border-white/10 group-hover/model:border-neon-profit/40 transition-all">
                <div className="text-7xl md:text-8xl mb-6 group-hover/model:scale-125 transition-all duration-500">{battleResult.model1.avatar}</div>
                <div className="model-name-text text-2xl mb-3 font-black tracking-tight" style={{fontFamily: 'var(--font-display)'}}>{battleResult.model1.name}</div>
                <div className={`pnl-hero text-5xl md:text-6xl font-black ${battleResult.model1.score >= 0 ? 'profit' : 'loss'}`} style={{fontFamily: 'var(--font-display)'}}>
                  {battleResult.model1.score > 0 ? '+' : ''}{battleResult.model1.score.toFixed(1)}%
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{color: battleResult.model1.score >= 0 ? 'var(--neon-profit)' : 'var(--neon-loss)'}}></div>
              </div>
            </div>

            {/* VS Indicator - Enhanced */}
            <div className="relative">
              <div className="absolute inset-0 bg-neon-neutral/20 blur-3xl animate-pulse"></div>
              <div className="vs-indicator relative z-10">VS</div>
            </div>

            {/* Model 2 */}
            <div className="text-center group/model relative">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-loss/20 to-transparent blur-2xl opacity-0 group-hover/model:opacity-100 transition-opacity"></div>
              <div className="relative p-8 rounded-2xl bg-void-surface/50 backdrop-blur-xl border-2 border-white/10 group-hover/model:border-neon-loss/40 transition-all">
                <div className="text-7xl md:text-8xl mb-6 group-hover/model:scale-125 transition-all duration-500">{battleResult.model2.avatar}</div>
                <div className="model-name-text text-2xl mb-3 font-black tracking-tight" style={{fontFamily: 'var(--font-display)'}}>{battleResult.model2.name}</div>
                <div className={`pnl-hero text-5xl md:text-6xl font-black ${battleResult.model2.score >= 0 ? 'profit' : 'loss'}`} style={{fontFamily: 'var(--font-display)'}}>
                  {battleResult.model2.score > 0 ? '+' : ''}{battleResult.model2.score.toFixed(1)}%
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{color: battleResult.model2.score >= 0 ? 'var(--neon-profit)' : 'var(--neon-loss)'}}></div>
              </div>
            </div>
          </div>

          {showResults && (
            <div className="winner-announcement mt-16 relative">
              {/* Victory glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-profit via-neon-warning to-neon-loss blur-3xl opacity-20 animate-pulse"></div>

              <div className="relative z-10 p-12 rounded-3xl bg-void-surface/80 backdrop-blur-2xl border-2 border-neon-profit/40">
                <div className="text-secondary text-[10px] font-black tracking-[0.4em] uppercase mb-4 flex items-center justify-center gap-3" style={{fontFamily: 'var(--font-display)'}}>
                  <span className="w-12 h-[2px] bg-gradient-to-r from-transparent to-neon-profit"></span>
                  <span>DECISIVE VICTORY</span>
                  <span className="w-12 h-[2px] bg-gradient-to-l from-transparent to-neon-profit"></span>
                </div>
                <div className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 bg-gradient-to-r from-neon-profit via-neon-warning to-neon-profit bg-clip-text text-transparent animate-pulse" style={{fontFamily: 'var(--font-display)'}}>
                  {getWinnerName()} WINS!
                </div>
                <div className="inline-block bg-neon-profit/20 border-2 border-neon-profit/40 rounded-full px-8 py-3 mt-4">
                  <span className="text-neon-profit font-mono text-2xl font-black">
                    +{Math.abs(battleResult.model1.score - battleResult.model2.score).toFixed(1)}%
                  </span>
                  <span className="text-white/60 font-mono text-sm ml-2">MARGIN</span>
                </div>

                <div className="mt-12 flex justify-center gap-6 flex-wrap">
                  <button
                    onClick={resetShowdown}
                    className="group relative px-12 py-5 bg-gradient-to-r from-white to-white/90 text-black font-black tracking-[0.2em] uppercase rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                    style={{fontFamily: 'var(--font-display)'}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-profit/20 to-neon-neutral/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10">NEW BATTLE</span>
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-12 py-5 bg-void-surface/80 backdrop-blur-xl border-2 border-white/20 text-white font-black tracking-[0.2em] uppercase rounded-2xl transition-all duration-500 hover:bg-void-hover hover:border-neon-neutral hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]"
                    style={{fontFamily: 'var(--font-display)'}}
                  >
                    REMATCH
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mt-12">
          {/* Model 1 Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-tertiary tracking-widest uppercase">{battleResult.model1.name} HAND</span>
              <span className="text-[10px] font-mono text-secondary">3 CARDS LOADED</span>
            </div>
            <div className="flex flex-col items-center gap-6">
              {battleResult.model1.cards.map((card, index) => (
                <TradeCard
                  key={card.id}
                  {...card}
                  className={showResults && battleResult.winner === 'model1' ? 'ring-2 ring-neon-profit' : ''}
                />
              ))}
            </div>
          </div>

          {/* Model 2 Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-tertiary tracking-widest uppercase">{battleResult.model2.name} HAND</span>
              <span className="text-[10px] font-mono text-secondary">3 CARDS LOADED</span>
            </div>
            <div className="flex flex-col items-center gap-6">
              {battleResult.model2.cards.map((card, index) => (
                <TradeCard
                  key={card.id}
                  {...card}
                  className={showResults && battleResult.winner === 'model2' ? 'ring-2 ring-neon-profit' : ''}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="terminal-card overflow-hidden">
        <div className="bg-white/5 px-8 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-sm font-black tracking-[0.2em] text-white uppercase">⚔️ ENGAGE SHOWDOWN PROTOCOL</h2>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-loss animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-neon-warning"></div>
            <div className="w-2 h-2 rounded-full bg-neon-profit"></div>
          </div>
        </div>

        <div className="p-12">
          <div className="grid md:grid-cols-2 gap-16 items-center relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
              <div className="text-4xl font-black text-white/10 italic tracking-tighter">VS</div>
            </div>

            {/* Model 1 Selection */}
            <div className="space-y-4">
              <div className="text-[10px] font-black text-tertiary tracking-[0.2em] uppercase text-center md:text-left">INITIATOR</div>
              <select
                value={model1Name}
                onChange={(e) => setModel1Name(e.target.value)}
                className="w-full h-16 px-6 bg-void-deep border border-white/10 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
              >
                <option value="">SELECT MODEL</option>
                {TRADING_MODELS.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.avatar} {model.name.toUpperCase()}
                  </option>
                ))}
              </select>
              {model1Name && (
                <div className="text-center animate-fade-in">
                  <div className="text-4xl mb-2">{TRADING_MODELS.find(m => m.name === model1Name)?.avatar}</div>
                  <div className="text-[10px] text-secondary font-mono uppercase">{TRADING_MODELS.find(m => m.name === model1Name)?.provider} AGENT</div>
                </div>
              )}
            </div>

            {/* Model 2 Selection */}
            <div className="space-y-4">
              <div className="text-[10px] font-black text-tertiary tracking-[0.2em] uppercase text-center md:text-right">CHALLENGER</div>
              <select
                value={model2Name}
                onChange={(e) => setModel2Name(e.target.value)}
                className="w-full h-16 px-6 bg-void-deep border border-white/10 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
              >
                <option value="">SELECT MODEL</option>
                {TRADING_MODELS.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.avatar} {model.name.toUpperCase()}
                  </option>
                ))}
              </select>
              {model2Name && (
                <div className="text-center animate-fade-in">
                  <div className="text-4xl mb-2">{TRADING_MODELS.find(m => m.name === model2Name)?.avatar}</div>
                  <div className="text-[10px] text-secondary font-mono uppercase">{TRADING_MODELS.find(m => m.name === model2Name)?.provider} AGENT</div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-neon-loss/10 border border-neon-loss/20 text-neon-loss text-[10px] font-black tracking-widest text-center uppercase">
              ERROR: {error}
            </div>
          )}

          <div className="mt-16 text-center">
            <button
              onClick={startShowdown}
              disabled={isLoading || !model1Name || !model2Name}
              className="group relative inline-flex items-center justify-center px-16 py-6 font-black tracking-[0.3em] text-white uppercase transition-all duration-200 bg-void-surface hover:bg-white hover:text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  SYNCHRONIZING...
                </span>
              ) : (
                'COMMENCE BATTLE'
              )}
            </button>
            <div className="mt-8 text-[9px] font-mono text-tertiary uppercase tracking-widest">
              Live simulation of alpha generation capabilities
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
