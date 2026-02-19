'use client'

import { RARITY_COLORS, Rarity } from '@/lib/constants';

interface TradeCardProps {
  id: string;
  modelName: string;
  modelAvatar: string;   // now a text tag: [O4.6], [GRK], etc.
  asset: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  pnlPercent: number;
  pnlUsd: number;
  holdingHours: number;
  rarity: Rarity;
  reasoning?: string;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

const RARITY_BORDER: Record<Rarity, string> = {
  LEGENDARY: '#ffa500',
  EPIC:      '#a855f7',
  RARE:      '#00d4ff',
  COMMON:    '#1a1f2e',
};

function fmt$(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPct(n: number) {
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}
function fmtPnlUsd(n: number) {
  return `${n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TradeCard({
  modelName,
  modelAvatar,
  asset,
  direction,
  entryPrice,
  exitPrice,
  leverage,
  pnlPercent,
  pnlUsd,
  holdingHours,
  rarity,
  reasoning,
  onClick,
  isSelected = false,
}: TradeCardProps) {
  const isProfit   = pnlPercent > 0;
  const pnlColor   = isProfit ? 'var(--profit-green)' : 'var(--loss-red)';
  const rarityTop  = RARITY_BORDER[rarity];

  return (
    <div
      onClick={onClick}
      style={{
        background:   'var(--void-deep)',
        border:       `1px solid ${isSelected ? 'var(--signal-cyan)' : 'var(--grid-line)'}`,
        borderLeft:   `2px solid ${pnlColor}`,
        borderTop:    `2px solid ${rarityTop}`,
        borderRadius: 0,
        padding:      '1.25rem',
        cursor:       onClick ? 'pointer' : 'default',
        transition:   'border-color 0.2s ease',
        position:     'relative',
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--signal-cyan)';
      }}
      onMouseLeave={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--grid-line)';
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span className="model-tag">{modelAvatar}</span>
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--signal-white)',
              lineHeight: 1.2,
            }}>
              {modelName}
            </div>
            <div className="label-mono" style={{ marginTop: '0.125rem' }}>AI AGENT</div>
          </div>
        </div>
        <div className="label-mono" style={{
          border: `1px solid ${rarityTop}44`,
          color: rarityTop,
          background: `${rarityTop}11`,
          padding: '0.2rem 0.5rem',
        }}>
          {rarity}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'var(--grid-line)', marginBottom: '1rem' }} />

      {/* ── Asset / Direction / Leverage ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        background: 'var(--void-surface)',
        border: '1px solid var(--grid-dim)',
        padding: '0.625rem 0.75rem',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--signal-white)',
        }}>{asset}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: '0.8125rem',
          color: isProfit ? 'var(--profit-green)' : 'var(--loss-red)',
        }}>{direction}</span>
        <span className="label-mono">{leverage}X LEV</span>
      </div>

      {/* ── P&L ── */}
      <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--grid-line)' }}>
        <div className="label-mono" style={{ marginBottom: '0.375rem' }}>P&amp;L</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: '1.75rem',
          color: pnlColor,
          lineHeight: 1,
        }}>
          {fmtPct(pnlPercent)}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.875rem',
          color: pnlColor,
          opacity: 0.7,
          marginTop: '0.25rem',
        }}>
          {fmtPnlUsd(pnlUsd)}
        </div>
      </div>

      {/* ── Price journey ── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <div className="label-mono">ENTRY</div>
          <div className="label-mono">EXIT</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="data-value" style={{ fontSize: '0.8125rem', color: 'var(--signal-white)' }}>{fmt$(entryPrice)}</span>
          <div style={{ flex: 1, height: '1px', background: pnlColor, margin: '0 0.75rem', opacity: 0.4 }} />
          <span className="data-value" style={{ fontSize: '0.8125rem', color: 'var(--signal-white)' }}>{fmt$(exitPrice)}</span>
        </div>
        <div className="label-mono" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          HOLD: <span style={{ color: 'var(--signal-white)' }}>{holdingHours.toFixed(1)}H</span>
        </div>
      </div>

      {/* ── Reasoning ── */}
      {reasoning && (
        <div style={{
          background: 'var(--void-abyss)',
          border: '1px solid var(--grid-dim)',
          padding: '0.625rem 0.75rem',
        }}>
          <div className="label-mono" style={{ marginBottom: '0.25rem' }}>REASONING</div>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6875rem',
            color: 'var(--signal-mute)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
