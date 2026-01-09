'use client'

import { useState, useEffect } from 'react'
import { TRADING_MODELS, ASSETS, Rarity } from '@/lib/constants'
import { TradeCard } from '@/components/cards/TradeCard'
import { PerformanceMonitor } from '@/lib/performance'

interface TradeCardData {
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
  createdAt: string
}

export default function TradeJournal() {
  const [tradeCards, setTradeCards] = useState<TradeCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [assetFilter, setAssetFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [profitFilter, setProfitFilter] = useState('')

  useEffect(() => {
    fetchTradeCards()
  }, [])

  const fetchTradeCards = async () => {
    PerformanceMonitor.startMeasurement('TradeJournal-fetchCards')
    try {
      const response = await fetch('/api/trade-cards')
      if (response.ok) {
        const data = await response.json()
        setTradeCards(data.tradeCards)
      }
    } catch (error) {
      console.error('Error fetching trade cards:', error)
    } finally {
      setLoading(false)
      PerformanceMonitor.endMeasurement('TradeJournal-fetchCards')
    }
  }

  const filteredCards = tradeCards.filter(card => {
    const matchesSearch = card.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.reasoning && card.reasoning.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesModel = !modelFilter || card.modelName === modelFilter
    const matchesAsset = !assetFilter || card.asset === assetFilter
    const matchesRarity = !rarityFilter || card.rarity === rarityFilter
    const matchesProfit = !profitFilter ||
      (profitFilter === 'profit' && card.pnlPercent > 0) ||
      (profitFilter === 'loss' && card.pnlPercent < 0)

    return matchesSearch && matchesModel && matchesAsset && matchesRarity && matchesProfit
  })

  const totalCards = tradeCards.length
  const profitableCards = tradeCards.filter(card => card.pnlPercent > 0).length
  const legendaryCards = tradeCards.filter(card => card.rarity === 'LEGENDARY').length
  const totalPnl = tradeCards.reduce((sum, card) => sum + card.pnlPercent, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-profit"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Collection Stats */}
      <div className="terminal-card overflow-hidden">
        <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-[10px] font-black tracking-widest uppercase text-tertiary">Inventory Quantization</h3>
          <div className="text-[10px] font-mono text-neon-profit">SYSTEM_READY</div>
        </div>
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-1">UNITS STORED</div>
            <div className="stat-value text-3xl">{totalCards}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-1">ALPHA POSITIVE</div>
            <div className="stat-value text-3xl text-neon-profit">{profitableCards}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-1">LEGENDARY CORE</div>
            <div className="stat-value text-3xl text-rarity-legendary" style={{ color: 'var(--rarity-legendary)' }}>{legendaryCards}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-1">NET PERFORMANCE</div>
            <div className={`stat-value text-3xl ${totalPnl >= 0 ? 'text-neon-profit' : 'text-neon-loss'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="terminal-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">Search Archive</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchTerm('')
                setModelFilter('')
                setAssetFilter('')
                setRarityFilter('')
                setProfitFilter('')
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-secondary hover:text-white uppercase transition-all"
            >
              Reset Multi-Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Search */}
          <div className="xl:col-span-1 space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Keyword</label>
            <input
              type="text"
              placeholder="MODEL / ASSET / LOGIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-neon-neutral transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Agent Provider</label>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
            >
              <option value="">ALL AGENTS</option>
              {TRADING_MODELS.map(model => (
                <option key={model.name} value={model.name}>{model.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Asset Category</label>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
            >
              <option value="">ALL ASSETS</option>
              {ASSETS.map(asset => (
                <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Rarity Tier</label>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
            >
              <option value="">ALL RARITIES</option>
              <option value="LEGENDARY">⭐ LEGENDARY</option>
              <option value="EPIC">🟣 EPIC</option>
              <option value="RARE">🔵 RARE</option>
              <option value="COMMON">⚪ COMMON</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Alpha Direction</label>
            <select
              value={profitFilter}
              onChange={(e) => setProfitFilter(e.target.value)}
              className="w-full h-12 px-4 bg-void-deep border border-white/10 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-neon-neutral transition-all appearance-none cursor-pointer"
            >
              <option value="">ALL FLOWS</option>
              <option value="profit">PROFIT ONLY</option>
              <option value="loss">LOSS ONLY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-tertiary uppercase border-b border-white/5 pb-4">
          <span>Displaying {filteredCards.length} matching units</span>
          <span className="text-secondary">Sorted by latest arrival</span>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-24 terminal-card border-dashed">
            <div className="text-6xl mb-6 grayscale opacity-20">📊</div>
            <h3 className="text-2xl font-bold text-white mb-2 uppercase">Archives Empty</h3>
            <p className="text-secondary text-sm max-w-md mx-auto mb-8 font-mono">
              No trade cards match the current filter parameters.
            </p>
            <a
              href="/simulate"
              className="inline-block bg-white text-black font-black py-4 px-10 rounded-full text-xs tracking-widest uppercase hover:scale-105 transition-all"
            >
              GENERATE NEW DATA
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 place-items-center stagger-in">
            {filteredCards.map((card) => (
              <TradeCard
                key={card.id}
                id={card.id}
                modelName={card.modelName}
                modelAvatar={card.modelAvatar}
                asset={card.asset}
                direction={card.direction}
                entryPrice={card.entryPrice}
                exitPrice={card.exitPrice}
                leverage={card.leverage}
                pnlPercent={card.pnlPercent}
                pnlUsd={card.pnlUsd}
                holdingHours={card.holdingHours}
                rarity={card.rarity as Rarity}
                reasoning={card.reasoning}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
