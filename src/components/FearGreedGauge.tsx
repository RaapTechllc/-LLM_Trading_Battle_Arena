'use client'
import { useState, useEffect } from 'react'
interface IndicatorData { fearGreedIndex: number; fearGreedClassification: string; lastUpdated: string }
export default function FearGreedGauge({ className = '' }: { className?: string }) {
  const [data, setData] = useState<IndicatorData | null>(null)
  useEffect(() => {
    const f = async () => { try { const r = await fetch('/api/market/indicators'); const j = await r.json(); if (j.success) setData(j.data) } catch {} }
    f(); const i = setInterval(f, 60000); return () => clearInterval(i)
  }, [])
  if (!data) return null
  const { fearGreedIndex: v, fearGreedClassification: label } = data
  const c = v <= 25 ? { t: 'text-red-400', bg: 'from-red-500/20 to-red-900/10', b: 'border-red-500/30' }
    : v <= 45 ? { t: 'text-orange-400', bg: 'from-orange-500/20 to-orange-900/10', b: 'border-orange-500/30' }
    : v <= 55 ? { t: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-900/10', b: 'border-yellow-500/30' }
    : v <= 75 ? { t: 'text-lime-400', bg: 'from-lime-500/20 to-lime-900/10', b: 'border-lime-500/30' }
    : { t: 'text-green-400', bg: 'from-green-500/20 to-green-900/10', b: 'border-green-500/30' }
  return (
    <div className={`terminal-card bg-gradient-to-br ${c.bg} border ${c.b} p-6 overflow-hidden group transition-all ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase">Fear &amp; Greed</h3>
        <span className="text-[10px] font-mono text-tertiary">{new Date(data.lastUpdated).toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className={`text-5xl font-black ${c.t}`}>{v}</div>
        <div className="flex-1">
          <div className={`text-sm font-bold ${c.t} uppercase tracking-wider`}>{label}</div>
          <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000" style={{ width: `${v}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-red-400/60 font-mono">FEAR</span>
            <span className="text-[8px] text-green-400/60 font-mono">GREED</span>
          </div>
        </div>
      </div>
    </div>
  )
}
