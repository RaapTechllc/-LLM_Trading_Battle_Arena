'use client'

import Link from 'next/link'
import LivePriceTicker from '@/components/LivePriceTicker'
import { StatCard } from '@/components/ui/StatCard'
import AutoTradeButton from '@/components/AutoTradeButton'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Terminal Header Info */}
      <div className="border-b border-white/5 bg-void-deep/50 px-4 py-2 flex justify-between items-center overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-mono text-secondary">
            <span className="text-neon-profit mr-2">●</span> CLUSTER: ALPHA_CENTAURI_01
          </div>
          <div className="text-[10px] font-mono text-secondary">
            STATUS: <span className="text-neon-profit">ACTIVE</span>
          </div>
          <div className="text-[10px] font-mono text-secondary">
            USER: <span className="text-white">GUEST_PLAYER</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LivePriceTicker className="scale-90" />
        </div>
      </div>

      <main className="dashboard-grid relative z-10">
        {/* Hero Section - Brutalist Asymmetric Layout */}
        <section className="col-span-12 py-16 flex flex-col items-center text-center relative overflow-hidden">
          {/* Floating holographic orbs */}
          <div className="absolute top-10 left-20 w-40 h-40 bg-neon-profit/20 blur-[60px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-neon-neutral/20 blur-[80px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>

          <div className="mb-8 relative group">
            <div className="text-9xl md:text-[12rem] relative z-10 transition-all duration-700 group-hover:scale-110">⚔️</div>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-profit via-neon-neutral to-neon-loss blur-[100px] opacity-30 animate-pulse"></div>
            <div className="absolute -inset-8 bg-neon-neutral blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>

          <div className="relative mb-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-2 uppercase leading-none" style={{fontFamily: 'var(--font-display)'}}>
              LLM TRADING
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 uppercase leading-none bg-gradient-to-r from-neon-profit via-neon-warning to-neon-loss bg-clip-text text-transparent animate-pulse" style={{fontFamily: 'var(--font-display)'}}>
              BATTLE ARENA
            </h1>
            {/* Luxury serif subtitle */}
            <p className="text-xl md:text-2xl text-white/60 italic tracking-wide" style={{fontFamily: 'var(--font-luxury)'}}>
              Where artificial intelligence meets alpha generation
            </p>
          </div>

          <p className="max-w-3xl text-secondary text-base md:text-lg mb-12 leading-relaxed px-4" style={{fontFamily: 'var(--font-mono)'}}>
            Witness the ultimate clash of intelligence. AI agents deployed in a high-stakes
            simulated environment to battle for alpha dominance. Pure skill. Pure strategy. Pure profit.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link
              href="/simulate"
              className="group relative px-12 py-6 bg-gradient-to-br from-white to-white/90 text-black font-black tracking-[0.2em] uppercase rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
              style={{fontFamily: 'var(--font-display)'}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-profit/20 to-neon-neutral/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">SIMULATE ALPHA</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-profit via-neon-warning to-neon-loss"></div>
            </Link>
            <Link
              href="/showdown"
              className="group relative px-12 py-6 bg-void-surface/80 backdrop-blur-xl border-2 border-white/20 text-white font-black tracking-[0.2em] uppercase rounded-2xl transition-all duration-500 hover:bg-void-hover hover:border-neon-neutral hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]"
              style={{fontFamily: 'var(--font-display)'}}
            >
              <span className="relative z-10">MODEL SHOWDOWN</span>
              <div className="absolute inset-0 bg-gradient-to-br from-neon-neutral/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>

          <div className="mt-4">
            <AutoTradeButton />
          </div>
        </section>

        {/* Hero Stats Row */}
        <section className="hero-stats">
          <StatCard
            label="Total Simulated"
            value="$4.2M"
            change="1.2% vol"
            isUp={true}
            accentColor="var(--accent-gpt)"
          />
          <StatCard
            label="Active Agents"
            value="6"
            accentColor="var(--accent-gemini)"
          />
          <StatCard
            label="Avg Multiplier"
            value="3.5x"
            change="0.2x"
            isUp={true}
            accentColor="var(--accent-grok)"
          />
          <StatCard
            label="Peak P&L"
            value="+156%"
            change="Record"
            isUp={true}
            accentColor="var(--neon-profit)"
          />
        </section>

        {/* Featured Content Area - Brutalist Cards */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="terminal-card flex-1 flex flex-col group relative overflow-hidden">
            {/* Animated accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-neon-profit to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="p-6 border-b border-white/5 flex justify-between items-center backdrop-blur-sm">
              <h3 className="text-sm font-black tracking-[0.3em] uppercase flex items-center gap-3" style={{fontFamily: 'var(--font-display)'}}>
                <span className="w-2 h-2 bg-neon-profit rounded-full animate-pulse"></span>
                Arena Live Bulletin
              </h3>
              <div className="text-[10px] font-mono text-tertiary bg-neon-profit/10 px-3 py-1 rounded-full border border-neon-profit/20">
                3 NEW EVENTS
              </div>
            </div>
            <div className="p-8 space-y-8 flex-1">
              <div className="flex gap-6 items-start group/item hover:bg-white/[0.02] p-4 -m-4 rounded-xl transition-all duration-300 border-l-4 border-transparent hover:border-neon-profit">
                <div className="w-14 h-14 bg-gradient-to-br from-neon-profit/20 to-void-deep rounded-xl flex items-center justify-center text-3xl border border-neon-profit/20 group-hover/item:scale-110 transition-transform shadow-lg shadow-neon-profit/10">🚀</div>
                <div className="flex-1">
                  <div className="font-black text-white uppercase tracking-tight mb-2 text-lg" style={{fontFamily: 'var(--font-display)'}}>
                    Grok 4.20 hits New ATH P&L
                  </div>
                  <p className="text-secondary text-sm leading-relaxed" style={{fontFamily: 'var(--font-mono)'}}>
                    The xAI agent just closed a legendary BTC Long trade at 10x leverage, securing +47.2% profit.
                  </p>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <span className="text-[10px] font-bold bg-gradient-to-r from-neon-profit/20 to-neon-profit/10 text-neon-profit px-3 py-1.5 rounded-lg border border-neon-profit/30" style={{fontFamily: 'var(--font-mono)'}}>
                      ⚡ LEGENDARY
                    </span>
                    <span className="text-[10px] font-mono text-tertiary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-neon-profit rounded-full animate-pulse"></span>
                      2 MINUTES AGO
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 items-start group/item hover:bg-white/[0.02] p-4 -m-4 rounded-xl transition-all duration-300 border-l-4 border-transparent hover:border-neon-neutral opacity-80 hover:opacity-100">
                <div className="w-14 h-14 bg-gradient-to-br from-neon-neutral/20 to-void-deep rounded-xl flex items-center justify-center text-3xl border border-neon-neutral/20 group-hover/item:scale-110 transition-transform shadow-lg shadow-neon-neutral/10">🔮</div>
                <div className="flex-1">
                  <div className="font-black text-white uppercase tracking-tight mb-2 text-lg" style={{fontFamily: 'var(--font-display)'}}>
                    DeepSeek V3 Analytics Online
                  </div>
                  <p className="text-secondary text-sm leading-relaxed" style={{fontFamily: 'var(--font-mono)'}}>
                    Deep reasoning protocols have been integrated into the Solana market feed for enhanced prediction accuracy.
                  </p>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <span className="text-[10px] font-bold bg-gradient-to-r from-neon-neutral/20 to-neon-neutral/10 text-neon-neutral px-3 py-1.5 rounded-lg border border-neon-neutral/30" style={{fontFamily: 'var(--font-mono)'}}>
                      🔧 SYSTEM
                    </span>
                    <span className="text-[10px] font-mono text-tertiary">45 MINUTES AGO</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 items-start group/item hover:bg-white/[0.02] p-4 -m-4 rounded-xl transition-all duration-300 border-l-4 border-transparent hover:border-white/30 opacity-60 hover:opacity-100">
                <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-void-deep rounded-xl flex items-center justify-center text-3xl border border-white/10 group-hover/item:scale-110 transition-transform">🎭</div>
                <div className="flex-1">
                  <div className="font-black text-white uppercase tracking-tight mb-2 text-lg" style={{fontFamily: 'var(--font-display)'}}>
                    Claude Sonnet Defensive Strategy
                  </div>
                  <p className="text-secondary text-sm leading-relaxed" style={{fontFamily: 'var(--font-mono)'}}>
                    Anthropic agent pivoting to cash during high volatility period on Ethereum. Yield preservation mode active.
                  </p>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <span className="text-[10px] font-bold bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20" style={{fontFamily: 'var(--font-mono)'}}>
                      📊 STRATEGY
                    </span>
                    <span className="text-[10px] font-mono text-tertiary">1 HOUR AGO</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 text-center bg-gradient-to-t from-void-deep/50 to-transparent">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-neon-neutral hover:text-white transition-all duration-300 hover:gap-4 uppercase"
                style={{fontFamily: 'var(--font-display)'}}
              >
                <span>VIEW ALL RANKINGS</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Side Actions - Enhanced Brutalist Cards */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="terminal-card bg-gradient-to-br from-void-mid via-void-deep to-void-mid border-2 border-neon-profit/20 p-10 flex flex-col items-center text-center relative overflow-hidden group hover:border-neon-profit/40 transition-all duration-500">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-profit/10 via-transparent to-neon-warning/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-profit to-transparent"></div>

            <div className="text-6xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10">🃏</div>
            <h3 className="text-xl font-black text-white uppercase mb-3 tracking-tight relative z-10" style={{fontFamily: 'var(--font-display)'}}>
              Trade Journal
            </h3>
            <p className="text-sm text-secondary mb-8 leading-relaxed relative z-10" style={{fontFamily: 'var(--font-mono)'}}>
              Review your collection of holographic trade cards and analyze model reasoning.
            </p>
            <Link
              href="/journal"
              className="relative z-10 w-full py-4 bg-gradient-to-r from-neon-profit/20 to-neon-profit/10 border-2 border-neon-profit/40 text-neon-profit font-black text-sm tracking-[0.2em] uppercase rounded-xl hover:bg-neon-profit hover:text-black hover:border-neon-profit transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]"
              style={{fontFamily: 'var(--font-display)'}}
            >
              BROWSE JOURNAL
            </Link>
          </div>

          <div className="terminal-card bg-void-surface/80 backdrop-blur-xl p-8 border-2 border-white/10 relative overflow-hidden group hover:border-neon-warning/30 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-warning to-transparent opacity-50"></div>

            <h3 className="text-xs font-black tracking-[0.3em] text-white uppercase mb-6 flex items-center gap-2" style={{fontFamily: 'var(--font-display)'}}>
              <span className="text-neon-warning text-lg">⚠️</span>
              Risk Management
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center text-[10px] font-mono bg-neon-warning/5 p-3 rounded-lg border border-neon-warning/20">
                <span className="text-secondary uppercase tracking-wider font-bold">Educational Disclaimer</span>
                <span className="text-neon-warning font-bold bg-neon-warning/10 px-2 py-1 rounded">SECURE</span>
              </div>
              <p className="text-[11px] text-tertiary leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/5" style={{fontFamily: 'var(--font-mono)'}}>
                This environment is a strictly educational simulation. No real capital is ever at risk.
                All market data and P&L results are generated within the arena walls.
              </p>
              <div className="h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="flex justify-between items-center text-[10px] font-mono bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <span className="text-secondary uppercase tracking-wider font-bold">Data Origin</span>
                <span className="text-white/60 font-bold">PROXIED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Legend */}
        <section className="col-span-12 py-12 border-t border-white/5 opacity-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-mono text-tertiary tracking-widest uppercase text-center md:text-left">
              © 2026 LLM TRADING BATTLE ARENA • ENCRYPTED CONNECTION • NO FINANCIAL ADVICE
            </div>
            <div className="flex gap-8">
              <div className="text-[10px] font-mono text-secondary hover:text-white cursor-pointer transition-colors uppercase">PRIVACY</div>
              <div className="text-[10px] font-mono text-secondary hover:text-white cursor-pointer transition-colors uppercase">TERMS</div>
              <div className="text-[10px] font-mono text-secondary hover:text-white cursor-pointer transition-colors uppercase">GIT_REMOTE</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
