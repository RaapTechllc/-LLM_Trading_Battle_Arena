'use client'

import { useState } from 'react'
import { TRADING_MODELS, ASSETS } from '@/lib/constants'
import { soundManager } from '@/lib/sounds'

interface TradeDecision {
  direction: 'LONG' | 'SHORT'
  leverage: number
  entryPrice: number
  exitPrice: number
  reasoning: string
  confidence: number
}

interface BattleResult {
  asset: string
  marketMove: string
  finalPrice: number
  model1: { name: string; decision: TradeDecision; pnl: number; rarity: string }
  model2: { name: string; decision: TradeDecision; pnl: number; rarity: string }
  winner: 'model1' | 'model2' | 'tie'
}

export default function LiveShowdown() {
  const [model1, setModel1] = useState('')
  const [model2, setModel2] = useState('')
  const [asset, setAsset] = useState('BTC')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<BattleResult | null>(null)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState<'select' | 'thinking' | 'reveal'>('select')

  const cryptoAssets = ASSETS.filter(a => ['BTC', 'ETH', 'SOL'].includes(a.symbol))

  const startBattle = async () => {
    if (!model1 || !model2) { setError('SELECT BOTH MODELS'); return }
    if (model1 === model2) { setError('MODELS MUST BE DIFFERENT'); return }

    setIsLoading(true)
    setError('')
    setResult(null)
    setPhase('thinking')
    soundManager.battleStart()

    try {
      // Get current price
      const priceRes = await fetch('/api/market/live-prices')
      const priceData = await priceRes.json()
      const currentPrice = priceData.data?.[asset]?.price || 95000

      const response = await fetch('/api/live-showdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model1Name: model1, model2Name: model2, asset, currentPrice })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      // Dramatic reveal
      setTimeout(() => {
        setResult(data)
        setPhase('reveal')
        data.winner === 'tie' ? soundManager.defeat() : soundManager.victory()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Battle failed')
      setPhase('select')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setPhase('select')
    setModel1('')
    setModel2('')
  }

  const getModelAvatar = (name: string) => TRADING_MODELS.find(m => m.name === name)?.avatar || '🤖'

  if (phase === 'reveal' && result) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="text-[10px] font-bold text-tertiary tracking-[0.3em] uppercase mb-4">
            ⚡ LIVE BATTLE COMPLETE ⚡
          </div>
          <div className="text-secondary text-sm mb-2">
            {result.asset} moved {result.marketMove}% → ${result.finalPrice.toFixed(2)}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[result.model1, result.model2].map((m, i) => {
            const isWinner = result.winner === (i === 0 ? 'model1' : 'model2')
            return (
              <div key={i} className={`terminal-card p-6 ${isWinner ? 'ring-2 ring-neon-profit' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{getModelAvatar(m.name)}</span>
                  <div>
                    <div className="font-bold text-white">{m.name}</div>
                    {isWinner && <div className="text-[10px] text-neon-profit font-bold">🏆 WINNER</div>}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-tertiary">Direction</span>
                    <span className={m.decision.direction === 'LONG' ? 'text-neon-profit' : 'text-neon-loss'}>
                      {m.decision.direction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tertiary">Leverage</span>
                    <span className="text-white">{m.decision.leverage}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tertiary">Entry</span>
                    <span className="text-white font-mono">${m.decision.entryPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tertiary">P&L</span>
                    <span className={`font-bold ${m.pnl > 0 ? 'text-neon-profit' : 'text-neon-loss'}`}>
                      {m.pnl > 0 ? '+' : ''}{m.pnl.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-secondary italic border-t border-white/10 pt-3">
                  &ldquo;{m.decision.reasoning}&rdquo;
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <button onClick={reset} className="px-8 py-4 bg-white text-black font-black tracking-widest uppercase rounded-full hover:scale-105 transition-all">
            NEW BATTLE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="terminal-card p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-black tracking-widest text-white uppercase mb-2">⚡ LIVE AI BATTLE</h2>
        <p className="text-[10px] text-tertiary tracking-widest uppercase">Real-time trade generation via OpenRouter</p>
      </div>

      {phase === 'thinking' ? (
        <div className="text-center py-12">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl animate-pulse">{getModelAvatar(model1)}</div>
              <div className="text-[10px] text-secondary mt-2">ANALYZING...</div>
            </div>
            <div className="text-3xl text-white/20 self-center">⚔️</div>
            <div className="text-center">
              <div className="text-5xl animate-pulse">{getModelAvatar(model2)}</div>
              <div className="text-[10px] text-secondary mt-2">ANALYZING...</div>
            </div>
          </div>
          <div className="text-[10px] text-tertiary tracking-widest uppercase animate-pulse">
            AI MODELS GENERATING TRADES FOR {asset}...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-tertiary tracking-widest uppercase block mb-2">MODEL 1</label>
              <select value={model1} onChange={e => setModel1(e.target.value)}
                className="w-full h-12 px-3 bg-void-deep border border-white/10 rounded-lg text-white text-sm">
                <option value="">Select...</option>
                {TRADING_MODELS.map(m => <option key={m.name} value={m.name}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-tertiary tracking-widest uppercase block mb-2">ASSET</label>
              <select value={asset} onChange={e => setAsset(e.target.value)}
                className="w-full h-12 px-3 bg-void-deep border border-white/10 rounded-lg text-white text-sm">
                {cryptoAssets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-tertiary tracking-widest uppercase block mb-2">MODEL 2</label>
              <select value={model2} onChange={e => setModel2(e.target.value)}
                className="w-full h-12 px-3 bg-void-deep border border-white/10 rounded-lg text-white text-sm">
                <option value="">Select...</option>
                {TRADING_MODELS.map(m => <option key={m.name} value={m.name}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-center text-neon-loss text-[10px] font-bold tracking-widest uppercase">
              ERROR: {error}
            </div>
          )}

          <button onClick={startBattle} disabled={isLoading || !model1 || !model2}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black tracking-widest uppercase rounded-full hover:scale-105 transition-all disabled:opacity-50">
            ⚡ START LIVE BATTLE
          </button>
        </div>
      )}
    </div>
  )
}
