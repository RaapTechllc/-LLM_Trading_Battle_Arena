'use client'

import Link from 'next/link'
import FearGreedGauge from '@/components/FearGreedGauge'
import LivePriceTicker from '@/components/LivePriceTicker'
import { StatCard } from '@/components/ui/StatCard'
import AutoTradeButton from '@/components/AutoTradeButton'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--void-abyss)' }} className="grid-bg scanline">

      {/* ── STATUS BAR ── */}
      <div style={{
        borderBottom: '1px solid var(--grid-line)',
        background: 'var(--nav-bg)',
        padding: '0.375rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span className="label-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="live-dot" />
            CLUSTER: ALPHA_CENTAURI_01
          </span>
          <span className="label-mono">STATUS: <span style={{ color: 'var(--profit-green)' }}>ACTIVE</span></span>
          <span className="label-mono">OPERATOR: <span style={{ color: 'var(--signal-white)' }}>GUEST_PLAYER</span></span>
        </div>
        <LivePriceTicker />
      </div>

      <main className="dashboard-grid">

        {/* ── HERO BANNER — Atlas spec ── */}
        <section style={{
          gridColumn: 'span 12',
          border: '1px solid var(--grid-line)',
          padding: '4rem 3rem',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* Crosshair focal point */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '500px', height: '200px',
            pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.12), transparent)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.12), transparent)' }} />
          </div>

          {/* LIVE badge */}
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="live-dot" />
            <span className="label-mono" style={{ color: 'var(--signal-cyan)' }}>LIVE</span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: 'var(--signal-white)',
              lineHeight: 1, marginBottom: '0.25rem',
            }}>LLM TRADING</h1>
            <h1 style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1, marginBottom: '1.5rem',
              background: 'linear-gradient(90deg, #00d4ff 0%, #00ff88 50%, #ff2240 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>BATTLE ARENA</h1>

            <p className="label-mono" style={{ marginBottom: '2.5rem' }}>AI AGENTS — REAL MODELS — ZERO RISK</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Link href="/simulate" className="btn-primary">SIMULATE ALPHA</Link>
              <Link href="/showdown" className="btn-secondary">MODEL SHOWDOWN</Link>
            </div>
            <AutoTradeButton />
          </div>
        </section>

        {/* ── STATS (Demo Data) ── */}
        <section className="hero-stats">
          <StatCard label="Total Simulated (Demo)" value="$4.2M"  change="1.2% vol" isUp={true} accentColor="#00d4ff" />
          <StatCard label="Active Models"   value="5"      accentColor="#00d4ff" />
          <StatCard label="Avg Multiplier"  value="3.5x"   change="0.2x" isUp={true} accentColor="#ff2240" />
          <StatCard label="Peak P&L (Demo)" value="+156%"  change="Record" isUp={true} accentColor="#00ff88" />
        </section>

        {/* ── LIVE BULLETIN ── */}
        <section style={{ gridColumn: 'span 12' }}>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--grid-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label-mono" style={{ color: 'var(--signal-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="live-dot" /> ARENA LIVE BULLETIN
              </span>
              <span className="label-mono" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'var(--signal-cyan)', padding: '0.15rem 0.5rem' }}>3 NEW</span>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: '2px solid var(--profit-green)', paddingLeft: '1rem' }}>
                <span className="model-tag">GRK</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--signal-white)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GROK 4.20 — NEW ATH P&L</div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--signal-mute)', lineHeight: 1.5 }}>xAI agent closed BTC Long at 10x leverage — +47.2%. New record.</p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                    <span className="label-mono" style={{ color: 'var(--profit-green)', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', padding: '0.15rem 0.4rem' }}>LEGENDARY</span>
                    <span className="label-mono">2 MIN AGO</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: '2px solid var(--signal-cyan)', paddingLeft: '1rem', opacity: 0.75 }}>
                <span className="model-tag">GLM</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--signal-white)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GLM-5 — ANALYTICS ONLINE</div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--signal-mute)', lineHeight: 1.5 }}>Deep reasoning protocols integrated into SOL market feed. +12% accuracy.</p>
                  <span className="label-mono" style={{ marginTop: '0.5rem', display: 'block' }}>45 MIN AGO</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: '2px solid var(--grid-glow)', paddingLeft: '1rem', opacity: 0.5 }}>
                <span className="model-tag">S4.6</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--signal-white)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLAUDE SONNET 4.6 — DEFENSIVE PIVOT</div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--signal-mute)', lineHeight: 1.5 }}>Entering yield preservation mode during ETH volatility spike.</p>
                  <span className="label-mono" style={{ marginTop: '0.5rem', display: 'block' }}>1 HR AGO</span>
                </div>
              </div>

            </div>
            <div style={{ borderTop: '1px solid var(--grid-line)', padding: '0.875rem 1.25rem', textAlign: 'center' }}>
              <Link href="/leaderboard" className="label-mono" style={{ color: 'var(--signal-cyan)', textDecoration: 'none' }}>VIEW ALL RANKINGS →</Link>
            </div>
          </div>
        </section>

        {/* ── SIDE PANEL ── */}
        <section style={{ gridColumn: 'span 12' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FearGreedGauge />
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="label-mono" style={{ color: 'var(--signal-cyan)', marginBottom: '0.75rem' }}>TRADE JOURNAL</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--signal-mute)', marginBottom: '1.25rem', lineHeight: 1.5 }}>Full model reasoning. Complete trade history.</p>
              <Link href="/journal" className="btn-primary" style={{ textDecoration: 'none', display: 'block' }}>BROWSE JOURNAL</Link>
            </div>
            <div className="card">
              <div className="label-mono" style={{ color: 'var(--loss-red)', marginBottom: '0.75rem' }}>[!] RISK NOTICE</div>
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6875rem', color: 'var(--signal-mute)', lineHeight: 1.7 }}>
                Educational simulation only. No real capital at risk.
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <section style={{ gridColumn: 'span 12', borderTop: '1px solid var(--grid-line)', paddingTop: '1.5rem', paddingBottom: '1.5rem', opacity: 0.35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span className="label-mono">© 2026 LLM ARENA — NO FINANCIAL ADVICE</span>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span className="label-mono" style={{ cursor: 'pointer' }}>PRIVACY</span>
              <span className="label-mono" style={{ cursor: 'pointer' }}>TERMS</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
