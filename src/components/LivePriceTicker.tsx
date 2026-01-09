'use client'

import { useState, useEffect } from 'react'

interface PriceData {
  price: number
  change24h: number
  symbol: string
}

interface LivePricesData {
  BTC: PriceData
  ETH: PriceData
  SOL: PriceData
}

interface LivePriceTickerProps {
  symbols?: string[]
  updateInterval?: number
  className?: string
}

export default function LivePriceTicker({ 
  symbols = ['BTC', 'ETH', 'SOL'],
  updateInterval = 30000, // 30 seconds
  className = ''
}: LivePriceTickerProps) {
  const [prices, setPrices] = useState<LivePricesData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/market/live-prices')
      const result = await response.json()
      
      if (result.success || result.fallback) {
        setPrices(result.data)
        setLastUpdated(result.lastUpdated)
        setIsLive(!result.fallback)
      }
    } catch (error) {
      console.error('Failed to fetch live prices:', error)
      setIsLive(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchPrices()

    // Set up interval for updates
    const interval = setInterval(fetchPrices, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval])

  const formatPrice = (price: number, symbol: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '$--'
    }
    if (symbol === 'BTC') {
      return `$${price.toLocaleString()}`
    }
    return `$${price.toFixed(2)}`
  }

  const formatChange = (change: number) => {
    if (typeof change !== 'number' || isNaN(change)) {
      return '--'
    }
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="animate-pulse flex gap-4">
          {symbols.map(symbol => (
            <div key={symbol} className="flex items-center gap-2">
              <div className="w-8 h-4 bg-slate-600 rounded"></div>
              <div className="w-16 h-4 bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!prices) {
    return null
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Live indicator */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-xs text-slate-400">
          {isLive ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      {/* Price tickers */}
      {symbols.map(symbol => {
        const priceData = prices[symbol as keyof LivePricesData]
        if (!priceData || typeof priceData.price === 'undefined') return null

        return (
          <div key={symbol} className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold text-white">
              {symbol}
            </span>
            <span className="text-sm text-slate-200">
              {formatPrice(priceData.price, symbol)}
            </span>
            <span className={`text-xs font-medium ${getChangeColor(priceData.change24h)}`}>
              {formatChange(priceData.change24h)}
            </span>
          </div>
        )
      })}

      {/* Last updated */}
      {lastUpdated && (
        <div className="text-xs text-slate-500 ml-2">
          Updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
