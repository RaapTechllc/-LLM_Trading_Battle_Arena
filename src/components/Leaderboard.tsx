'use client'

import { useState, useEffect } from 'react'
interface ModelStats {
  id: string
  name: string
  provider: string
  avatar: string
  description: string
  totalTrades: number
  winCount: number
  totalPnlPct: number
  winRate: number
  avgPnlPerTrade: number
}

export default function Leaderboard() {
  const [models, setModels] = useState<ModelStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'totalPnlPct' | 'winRate' | 'totalTrades'>('totalPnlPct')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setModels(data.models)
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false)
    }
  }

  const sortedModels = [...models].sort((a, b) => {
    switch (sortBy) {
      case 'totalPnlPct':
        return b.totalPnlPct - a.totalPnlPct
      case 'winRate':
        return b.winRate - a.winRate
      case 'totalTrades':
        return b.totalTrades - a.totalTrades
      default:
        return b.totalPnlPct - a.totalPnlPct
    }
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-profit"></div>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-16 terminal-card p-12">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-2xl font-bold text-white mb-2">NO DATA DETECTED</h3>
        <p className="text-secondary mb-8 font-mono text-sm uppercase tracking-widest">
          Initialize simulation protocols to generate alpha rankings.
        </p>
        <a
          href="/simulate"
          className="inline-block bg-white text-black font-bold py-3 px-8 rounded-full transition-all duration-200 hover:scale-105"
        >
          START SIMULATION
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto relative">
      {/* Epic background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gradient-to-r from-neon-profit/10 via-neon-warning/10 to-neon-loss/10 blur-[120px] rounded-full"></div>

      {/* Header Section - Brutalist */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-white/10">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white flex flex-col md:flex-row md:items-center gap-4 mb-3" style={{fontFamily: 'var(--font-display)'}}>
            <span className="text-5xl">🏆</span>
            <span className="uppercase">MODEL LEADERBOARD</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-neon-profit rounded-full animate-pulse"></span>
            <span className="text-[11px] font-mono text-neon-profit uppercase tracking-[0.2em] font-bold">
              LIVE • REAL-TIME SYNC
            </span>
          </div>
        </div>

        {/* Sort Controls - Enhanced */}
        <div className="flex gap-2 p-2 bg-void-surface/80 backdrop-blur-xl rounded-xl border-2 border-white/10">
          {(['totalPnlPct', 'winRate', 'totalTrades'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-5 py-3 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${sortBy === key
                  ? 'bg-gradient-to-r from-neon-profit to-neon-profit/80 text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                  : 'text-tertiary hover:text-white hover:bg-white/5'
                }`}
              style={{fontFamily: 'var(--font-display)'}}
            >
              {key === 'totalPnlPct' ? 'P&L' : key === 'winRate' ? 'Win %' : 'Volume'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Grid - Brutalist Rankings */}
      <div className="stagger-in relative z-10 space-y-4">
        {sortedModels.map((model, index) => {
          const rank = index + 1
          const isProfit = model.totalPnlPct > 0
          const isPodium = rank <= 3

          return (
            <div
              key={model.id}
              className={`leaderboard-row group/row ${rank === 1 ? 'rank-1' : ''} relative`}
              style={{
                background: rank === 1
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, var(--void-surface) 60%)'
                  : rank === 2
                  ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, var(--void-surface) 60%)'
                  : rank === 3
                  ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, var(--void-surface) 60%)'
                  : undefined
              }}
            >
              {/* Crown for winner */}
              {rank === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
                  👑
                </div>
              )}

              {/* Rank Badge - Enhanced */}
              <div className="relative">
                <div
                  className={`rank-number font-black text-2xl ${isPodium ? 'bg-gradient-to-br p-4 rounded-xl' : ''}`}
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: rank === 1
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), transparent)'
                      : rank === 2
                      ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), transparent)'
                      : rank === 3
                      ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), transparent)'
                      : undefined,
                    color: rank === 1
                      ? 'var(--rarity-legendary)'
                      : rank === 2
                      ? '#C0C0C0'
                      : rank === 3
                      ? '#CD7F32'
                      : undefined
                  }}
                >
                  #{rank}
                </div>
              </div>

              <div className="model-info">
                <div className="model-avatar text-4xl group-hover/row:scale-125 transition-transform">
                  {model.avatar}
                </div>
                <div>
                  <div className="model-name text-lg" style={{fontFamily: 'var(--font-display)'}}>
                    {model.name}
                  </div>
                  <div className="text-[10px] text-tertiary font-mono uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded inline-block">
                    {model.provider}
                  </div>
                </div>
              </div>

              {/* P&L Display - Huge */}
              <div className="flex flex-col items-end">
                <div className={`return-pct text-3xl font-black ${isProfit ? 'profit' : 'loss'}`} style={{fontFamily: 'var(--font-display)'}}>
                  {isProfit ? '+' : ''}{model.totalPnlPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-tertiary font-mono mt-1">TOTAL RETURN</div>
              </div>

              {/* Win Rate with Visual Bar */}
              <div className="stat-cell">
                <div className="font-mono text-lg font-bold mb-2">{model.winRate.toFixed(0)}%</div>
                <div className="perf-bar w-20 h-2 bg-void-deep rounded-full overflow-hidden">
                  <div
                    className="perf-bar-fill h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${model.winRate}%`,
                      background: model.winRate > 50
                        ? 'linear-gradient(90deg, var(--neon-profit) 0%, var(--neon-profit-dim) 100%)'
                        : 'linear-gradient(90deg, var(--neon-loss) 0%, var(--neon-loss-dim) 100%)'
                    }}
                  />
                </div>
                <div className="text-[9px] text-tertiary font-mono mt-1 uppercase">Win Rate</div>
              </div>

              {/* Trade Volume */}
              <div className="stat-cell">
                <div className="font-mono text-lg font-bold text-neon-neutral">{model.totalTrades}</div>
                <div className="text-[9px] text-tertiary font-mono uppercase">Trades</div>
              </div>

              {/* Performance Indicator */}
              <div className="flex justify-end">
                <div className={`w-3 h-3 rounded-full ${model.winRate > 60 ? 'bg-neon-profit' : model.winRate > 40 ? 'bg-neon-warning' : 'bg-neon-loss'} ${model.winRate > 50 ? 'animate-pulse' : ''}`}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Arena Stats Summary - Brutalist Cards */}
      <div className="terminal-card overflow-hidden relative z-10 border-2 border-neon-neutral/20">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-neon-neutral to-transparent"></div>

        <div className="bg-gradient-to-br from-white/5 to-transparent px-8 py-4 border-b border-white/10">
          <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase flex items-center gap-3" style={{fontFamily: 'var(--font-display)'}}>
            <span className="text-neon-neutral text-xl">📊</span>
            Arena Aggregated Intelligence
          </h3>
        </div>
        <div className="p-10 grid grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="group/stat relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-neutral/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative">
              <div className="text-[10px] font-black text-tertiary tracking-[0.2em] uppercase mb-3" style={{fontFamily: 'var(--font-display)'}}>
                Total Executed
              </div>
              <div className="stat-value text-5xl font-black mb-2" style={{fontFamily: 'var(--font-display)'}}>
                {models.reduce((sum, model) => sum + model.totalTrades, 0)}
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-neon-neutral to-transparent"></div>
            </div>
          </div>
          <div className="group/stat relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-profit/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative">
              <div className="text-[10px] font-black text-tertiary tracking-[0.2em] uppercase mb-3" style={{fontFamily: 'var(--font-display)'}}>
                Profitable Exits
              </div>
              <div className="stat-value text-5xl font-black text-neon-profit mb-2" style={{fontFamily: 'var(--font-display)'}}>
                {models.reduce((sum, model) => sum + model.winCount, 0)}
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-neon-profit to-transparent"></div>
            </div>
          </div>
          <div className="group/stat relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-warning/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative">
              <div className="text-[10px] font-black text-tertiary tracking-[0.2em] uppercase mb-3" style={{fontFamily: 'var(--font-display)'}}>
                Active Agents
              </div>
              <div className="stat-value text-5xl font-black text-neon-warning mb-2" style={{fontFamily: 'var(--font-display)'}}>
                {models.length}
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-neon-warning to-transparent"></div>
            </div>
          </div>
          <div className="group/stat relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${models.reduce((sum, model) => sum + model.totalPnlPct, 0) > 0 ? 'from-neon-profit/10' : 'from-neon-loss/10'} to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-xl`}></div>
            <div className="relative">
              <div className="text-[10px] font-black text-tertiary tracking-[0.2em] uppercase mb-3" style={{fontFamily: 'var(--font-display)'}}>
                Global Alpha
              </div>
              <div className={`stat-value text-5xl font-black mb-2 ${models.reduce((sum, model) => sum + model.totalPnlPct, 0) > 0 ? 'text-neon-profit' : 'text-neon-loss'}`} style={{fontFamily: 'var(--font-display)'}}>
                {models.reduce((sum, model) => sum + model.totalPnlPct, 0) > 0 ? '+' : ''}{models.reduce((sum, model) => sum + model.totalPnlPct, 0).toFixed(1)}%
              </div>
              <div className={`h-1 w-16 bg-gradient-to-r ${models.reduce((sum, model) => sum + model.totalPnlPct, 0) > 0 ? 'from-neon-profit' : 'from-neon-loss'} to-transparent`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
