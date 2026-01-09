'use client'

import { RARITY_COLORS, PNL_COLORS, ASSETS, Rarity } from '@/lib/constants';
import { HolographicCard } from '@/components/ui/HolographicCard';

interface TradeCardProps {
  id: string;
  modelName: string;
  modelAvatar: string;
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
  className = ''
}: TradeCardProps) {
  const isProfit = pnlPercent > 0;
  const pnlColor = isProfit ? PNL_COLORS.PROFIT : PNL_COLORS.LOSS;
  const assetInfo = ASSETS.find(a => a.symbol === asset);
  const rarityColor = RARITY_COLORS[rarity];

  // Format numbers for display
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPnl = (pnl: number) => {
    const sign = pnl > 0 ? '+' : '';
    return `${sign}${pnl.toFixed(1)}%`;
  };

  const formatPnlUsd = (pnl: number) => {
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      className={`trade-card ${rarity.toLowerCase()} ${isSelected ? 'ring-4 ring-white/70 ring-offset-2 ring-offset-void-deep' : ''} ${className} relative group/card`}
      style={{
        background: `linear-gradient(135deg, ${rarityColor}15 0%, transparent 50%, ${rarityColor}08 100%)`,
        '--rarity-glow': `${rarityColor}`,
        '--accent-color': rarityColor
      } as any}
      onClick={onClick}
    >
      {/* Holographic shimmer overlay */}
      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[16px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
      </div>

      <div className="trade-card-inner relative">
        {/* Premium accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-60" style={{color: rarityColor}}></div>

        {/* Header - Model + Rarity Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="text-2xl transform group-hover/card:scale-110 transition-transform">{modelAvatar}</div>
            <div>
              <span className="model-name-text text-sm block" style={{fontFamily: 'var(--font-display)'}}>{modelName}</span>
              <span className="text-[9px] font-mono text-tertiary uppercase tracking-wider">AI AGENT</span>
            </div>
          </div>
          <div
            className="text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full border-2 backdrop-blur-sm"
            style={{
              color: rarityColor,
              borderColor: `${rarityColor}40`,
              background: `${rarityColor}15`,
              fontFamily: 'var(--font-display)'
            }}
          >
            {rarity}
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

        {/* Asset + Direction + Leverage - Enhanced Brutalist */}
        <div className="text-center space-y-3 mb-6 bg-void-deep/50 p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-center gap-4">
            <span className="font-mono text-2xl font-black tracking-tighter text-white" style={{fontFamily: 'var(--font-mono)'}}>{asset}</span>
            <div className="flex flex-col gap-1">
              <span className="text-white/20 text-xs">━━━</span>
              <span className="text-white/20 text-xs">━━━</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`font-black text-lg ${direction === 'LONG' ? 'text-neon-profit' : 'text-neon-loss'}`} style={{fontFamily: 'var(--font-display)'}}>
                {direction}
              </span>
              <div className="h-[2px] w-full" style={{background: direction === 'LONG' ? 'var(--neon-profit)' : 'var(--neon-loss)'}}></div>
            </div>
          </div>
          <div className="font-mono text-xs text-secondary uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full inline-block">
            ⚡ {leverage}x LEVERAGE
          </div>
        </div>

        {/* P&L Display - MASSIVE, GLOWING, PREMIUM */}
        <div className="pnl-display relative py-6 mb-6">
          {/* Glow effect behind P&L */}
          <div className={`absolute inset-0 blur-3xl opacity-30 ${isProfit ? 'bg-neon-profit' : 'bg-neon-loss'}`}></div>

          <div className="relative z-10">
            <div className={`pnl-percent ${isProfit ? 'profit' : 'loss'} mb-2`} style={{fontFamily: 'var(--font-display)'}}>
              {formatPnl(pnlPercent)}
            </div>
            <div className="pnl-usd font-mono font-bold" style={{color: isProfit ? 'var(--neon-profit)' : 'var(--neon-loss)'}}>
              {formatPnlUsd(pnlUsd)}
            </div>
            {/* Luxury accent */}
            <div className="mt-3 text-[10px] italic text-tertiary" style={{fontFamily: 'var(--font-luxury)'}}>
              {isProfit ? 'Extraordinary Alpha' : 'Learning Experience'}
            </div>
          </div>
        </div>

        {/* Price Journey - Enhanced with Visual Flow */}
        <div className="bg-gradient-to-br from-void-deep/80 to-void-deep/50 rounded-xl p-4 border border-white/10 mb-4 backdrop-blur-sm relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center text-[9px] font-bold text-secondary mb-3 uppercase tracking-[0.2em]" style={{fontFamily: 'var(--font-display)'}}>
              <div className="flex flex-col items-start">
                <span className="text-white/40">ENTRY</span>
                <div className="h-[2px] w-8 bg-white/20 mt-1"></div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/40">EXIT</span>
                <div className="h-[2px] w-8 bg-white/20 mt-1"></div>
              </div>
            </div>
            <div className="flex justify-between items-center font-mono text-sm font-bold mb-3">
              <span className="text-white">{formatPrice(entryPrice)}</span>
              <div className="flex items-center gap-2">
                <div className={`h-[2px] w-12 ${isProfit ? 'bg-neon-profit' : 'bg-neon-loss'}`}></div>
                <span className={isProfit ? 'text-neon-profit' : 'text-neon-loss'}>→</span>
              </div>
              <span className="text-white">{formatPrice(exitPrice)}</span>
            </div>
            <div className="text-[10px] text-secondary text-center font-mono bg-white/5 py-2 px-3 rounded-lg border border-white/5">
              ⏱ HOLD: <span className="text-white font-bold">{holdingHours.toFixed(1)}</span> HOURS
            </div>
          </div>
        </div>

        {/* Reasoning - Luxury Quote Styling */}
        {reasoning && (
          <div className="relative p-4 bg-white/[0.02] rounded-lg border border-white/5">
            <div className="text-3xl text-white/10 absolute top-2 left-3" style={{fontFamily: 'var(--font-luxury)'}}>&ldquo;</div>
            <div className="text-[11px] text-tertiary italic leading-relaxed line-clamp-2 pl-4" style={{fontFamily: 'var(--font-luxury)'}}>
              {reasoning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
