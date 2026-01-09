'use client'

import { useState } from 'react'
import { TRADING_MODELS, ASSETS, DIRECTIONS, LEVERAGE_OPTIONS, getRarity, PNL_COLORS, Rarity } from '@/lib/constants'
import { soundManager } from '@/lib/sounds'
import { TradeCard } from '@/components/cards/TradeCard'

interface TradeFormData {
  modelName: string
  asset: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  leverage: number
  reasoning: string
}

export default function TradeSimulator() {
  const [formData, setFormData] = useState<TradeFormData>({
    modelName: TRADING_MODELS[0].name,
    asset: ASSETS[0].symbol,
    direction: 'LONG',
    entryPrice: 95420.50,
    exitPrice: 98120.25,
    leverage: 5,
    reasoning: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [holdingHours] = useState(() => Math.random() * 24 + 1)

  const calculatePnL = () => {
    const { entryPrice, exitPrice, direction, leverage } = formData
    let pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100
    if (direction === 'SHORT') pnlPercent = -pnlPercent
    pnlPercent *= leverage

    const positionSize = 10000
    const pnlUsd = (positionSize * pnlPercent) / 100

    return { pnlPercent, pnlUsd }
  }

  const { pnlPercent, pnlUsd } = calculatePnL()
  const rarity = getRarity(pnlPercent)
  const selectedModel = TRADING_MODELS.find(m => m.name === formData.modelName)!

  const handleInputChange = (field: keyof TradeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateRandomTrade = () => {
    const randomModel = TRADING_MODELS[Math.floor(Math.random() * TRADING_MODELS.length)]
    const randomAsset = ASSETS[Math.floor(Math.random() * ASSETS.length)]
    const randomDirection = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    const randomLeverage = LEVERAGE_OPTIONS[Math.floor(Math.random() * LEVERAGE_OPTIONS.length)]

    const basePrice = randomAsset.symbol === 'BTC' ? 95000 :
      randomAsset.symbol === 'ETH' ? 3500 :
        randomAsset.symbol === 'SOL' ? 250 : 100

    const entryPrice = basePrice * (0.95 + Math.random() * 0.1)
    const priceChange = (Math.random() - 0.4) * 0.2 // Slightly biased to profit for demo
    const exitPrice = entryPrice * (1 + priceChange)

    const reasoningOptions = [
      "RSI bounce + BTC dominance breakout confirmation",
      "Institutional order block mitigation play",
      "Fibonacci 61.8% golden pocket retracement",
      "Liquidty sweep above previous weekly high",
      "Twitter sentiment divergence detected / xAI feed",
      "MACD crossover on 4H timeframe",
      "Bearish engulfing candle rejection at supply zone",
      "Delta volume spike confirmed on Binance orderbook"
    ]

    setFormData({
      modelName: randomModel.name,
      asset: randomAsset.symbol,
      direction: randomDirection,
      entryPrice: Math.round(entryPrice * 100) / 100,
      exitPrice: Math.round(exitPrice * 100) / 100,
      leverage: randomLeverage,
      reasoning: reasoningOptions[Math.floor(Math.random() * reasoningOptions.length)]
    })
  }

  const generateAITrade = async () => {
    setIsGenerating(true)
    setSubmitMessage('')

    try {
      // Get current price for selected asset
      const pricesRes = await fetch('/api/market/live-prices')
      const pricesData = await pricesRes.json()
      
      const assetKey = formData.asset as 'BTC' | 'ETH' | 'SOL'
      const currentPrice = pricesData.data?.[assetKey]?.price || 
        (assetKey === 'BTC' ? 95000 : assetKey === 'ETH' ? 3500 : 250)

      // Call LLM to generate trade
      const response = await fetch('/api/generate-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: formData.modelName,
          asset: formData.asset,
          currentPrice
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Fallback to random generation if API unavailable
        if (data.configError) {
          generateRandomTrade()
          setSubmitMessage('AI UNAVAILABLE: Using randomized trade parameters')
          soundManager.click()
          return
        }
        throw new Error(data.error || 'Failed to generate trade')
      }

      const { decision } = data
      setFormData(prev => ({
        ...prev,
        direction: decision.direction,
        leverage: decision.leverage,
        entryPrice: Math.round(decision.entryPrice * 100) / 100,
        exitPrice: Math.round(decision.exitPrice * 100) / 100,
        reasoning: decision.reasoning
      }))

      setSubmitMessage(`AI GENERATED: ${formData.modelName} analyzed ${formData.asset}`)
      soundManager.cardCreated()

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'AI generation failed'
      setSubmitMessage(`ERROR: ${msg}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const { pnlPercent, pnlUsd } = calculatePnL()

      const response = await fetch('/api/trade-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: formData.modelName,
          asset: formData.asset,
          direction: formData.direction,
          entryPrice: formData.entryPrice,
          exitPrice: formData.exitPrice,
          leverage: formData.leverage,
          pnlPercent,
          pnlUsd,
          holdingHours,
          rarity: getRarity(pnlPercent),
          reasoning: formData.reasoning || null
        })
      })

      if (response.ok) {
        setSubmitMessage('GENERATED: Trade card synchronized with ledger.')
        if (rarity === 'LEGENDARY') soundManager.legendaryReveal()
        else if (rarity === 'EPIC') soundManager.rareReveal()
        else soundManager.cardCreated()
      } else {
        setSubmitMessage('ERROR: Data synchronization failed.')
      }
    } catch (error) {
      setSubmitMessage('STARKNET_ERROR: Connection timed out.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Form Section */}
      <div className="terminal-card overflow-hidden">
        <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xs font-black tracking-widest text-white uppercase">Initialize Alpha Protocol</h2>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-profit"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Select Agent</label>
            <select
              value={formData.modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
            >
              {TRADING_MODELS.map(model => (
                <option key={model.name} value={model.name}>
                  {model.avatar} {model.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Target Asset</label>
              <select
                value={formData.asset}
                onChange={(e) => handleInputChange('asset', e.target.value)}
                className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
              >
                {ASSETS.map(asset => (
                  <option key={asset.symbol} value={asset.symbol}>{asset.symbol} - {asset.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Vector</label>
              <select
                value={formData.direction}
                onChange={(e) => handleInputChange('direction', e.target.value as 'LONG' | 'SHORT')}
                className={`w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg font-black text-sm focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer ${formData.direction === 'LONG' ? 'text-neon-profit' : 'text-neon-loss'}`}
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Entry ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-neon-neutral transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Exit ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.exitPrice}
                onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value) || 0)}
                className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-neon-neutral transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Leverage Multiplier</label>
            <div className="flex gap-2 flex-wrap">
              {LEVERAGE_OPTIONS.map(lev => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => handleInputChange('leverage', lev)}
                  className={`px-4 py-2 rounded font-mono text-xs border transition-all ${formData.leverage === lev ? 'bg-white text-black border-white' : 'bg-void-deep text-secondary border-white/5'}`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Logic & Reasoning</label>
            <textarea
              value={formData.reasoning}
              onChange={(e) => handleInputChange('reasoning', e.target.value)}
              placeholder="Analysis of market signals..."
              className="w-full p-4 bg-void-deep border border-white/10 rounded-lg text-white text-xs h-24 resize-none transition-all placeholder:text-white/10"
              maxLength={100}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={generateRandomTrade}
              className="flex-1 h-14 bg-void-surface border border-white/10 text-white font-bold tracking-widest text-xs uppercase rounded-full hover:bg-void-hover transition-all"
            >
              RANDOMIZE
            </button>
            <button
              type="button"
              onClick={generateAITrade}
              disabled={isGenerating}
              className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold tracking-widest text-xs uppercase rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? '🤖 THINKING...' : '🤖 LET AI DECIDE'}
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-14 bg-white text-black font-black tracking-widest text-xs uppercase rounded-full hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'PROCESSING...' : 'SYNC LEDGER'}
            </button>
          </div>

          {submitMessage && (
            <div className={`text-center py-2 text-[10px] font-bold tracking-widest uppercase ${submitMessage.includes('ERROR') ? 'text-neon-loss' : 'text-neon-profit'}`}>
              {submitMessage}
            </div>
          )}
        </form>
      </div>

      {/* Preview Section */}
      <div className="flex flex-col items-center">
        <h2 className="text-[10px] font-black tracking-[0.3em] text-tertiary uppercase mb-8">Generated Result Card</h2>
        <div className="relative group">
          <div className="absolute -inset-4 bg-neon-neutral blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <TradeCard
            id="preview"
            modelName={selectedModel.name}
            modelAvatar={selectedModel.avatar}
            asset={formData.asset}
            direction={formData.direction}
            entryPrice={formData.entryPrice}
            exitPrice={formData.exitPrice}
            leverage={formData.leverage}
            pnlPercent={pnlPercent}
            pnlUsd={pnlUsd}
            holdingHours={holdingHours}
            rarity={rarity as Rarity}
            reasoning={formData.reasoning || undefined}
          />
        </div>

        <div className="mt-12 w-full terminal-card p-6 bg-void-deep/50 border-dashed">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-tertiary tracking-widest uppercase">Expected Projection</span>
            <span className={`text-xs font-mono font-bold ${pnlPercent > 0 ? 'text-neon-profit' : 'text-neon-loss'}`}>
              {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${pnlPercent > 0 ? 'bg-neon-profit' : 'bg-neon-loss'}`} style={{ width: `${Math.min(Math.abs(pnlPercent) * 2, 100)}%` }}></div>
            </div>
            <p className="text-[9px] text-tertiary font-mono leading-relaxed">
              SIMULATION PARAMETERS: 10K USD CAPITAL | REAL-TIME ASSET PRICE TRACKING | AGENT LOGIC APPLIED
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
