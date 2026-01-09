import type { Metadata } from 'next'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import SoundToggle from '@/components/SoundToggle'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import DemoScript from '@/components/DemoScript'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLM Trading Battle Arena',
  description: 'Watch AI models compete in simulated trading battles - Educational simulation only',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-void-deep/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="text-white font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
                <span className="text-neon-profit">⚡</span> ARENA
              </Link>
              <div className="flex items-center space-x-8">
                <Link href="/simulate" className="text-[10px] font-bold tracking-[0.2em] text-secondary hover:text-neon-profit transition-all uppercase">
                  SIMULATE
                </Link>
                <Link href="/journal" className="text-[10px] font-bold tracking-[0.2em] text-secondary hover:text-neon-profit transition-all uppercase">
                  JOURNAL
                </Link>
                <Link href="/showdown" className="text-[10px] font-bold tracking-[0.2em] text-secondary hover:text-neon-profit transition-all uppercase">
                  SHOWDOWN
                </Link>
                <Link href="/leaderboard" className="text-[10px] font-bold tracking-[0.2em] text-white hover:text-neon-profit transition-all uppercase">
                  🏆 LEADERBOARD
                </Link>
                <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
                <SoundToggle />
                <div className="text-tertiary text-xs opacity-60 cursor-help" title="Keyboard shortcuts: Alt+1 (Home), Alt+2 (Simulate), Alt+3 (Journal), Alt+4 (Showdown)">
                  ⌨️
                </div>
              </div>
            </div>
          </div>
        </nav>
        <ErrorBoundary>
          <KeyboardShortcuts />
          <DemoScript />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
