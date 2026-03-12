import type { Metadata } from 'next'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import ThemeToggle from '@/components/ThemeToggle'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLM ARENA — AI TRADING BATTLES',
  description: 'AI models compete in real-time trading simulations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('llm-arena-theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="scanline">
        <nav style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--nav-border)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
              <Link href="/" style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#00d4ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px', height: '8px',
                  background: '#00d4ff',
                  boxShadow: '0 0 8px #00d4ff',
                }} />
                LLM ARENA
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/simulate" className="nav-link">SIMULATE</Link>
                <Link href="/journal" className="nav-link">JOURNAL</Link>
                <Link href="/showdown" className="nav-link">SHOWDOWN</Link>
                <Link href="/leaderboard" className="nav-link" style={{ color: '#00d4ff' }}>LEADERBOARD</Link>
                <div style={{ width: '1px', height: '1rem', background: 'var(--grid-line)' }} />
                <ThemeToggle />
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.625rem',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  cursor: 'help',
                }} title="Alt+1-4 for quick nav">[KBD]</span>
              </div>
            </div>
          </div>
        </nav>
        <ErrorBoundary>
          <KeyboardShortcuts />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
