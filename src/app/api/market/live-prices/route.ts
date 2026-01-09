import { NextResponse } from 'next/server'

// Cache for price data to avoid hitting API limits
let priceCache: {
  data: any
  timestamp: number
} | null = null

const CACHE_DURATION = 30000 // 30 seconds
const FALLBACK_PRICES = {
  BTC: {
    price: 95000,
    change24h: 2.5,
    symbol: 'BTC'
  },
  ETH: {
    price: 3500,
    change24h: 1.8,
    symbol: 'ETH'
  },
  SOL: {
    price: 250,
    change24h: -0.5,
    symbol: 'SOL'
  }
}

export async function GET() {
  // Check if live prices are enabled
  if (process.env.ENABLE_LIVE_PRICES !== 'true') {
    return NextResponse.json({
      success: false,
      data: FALLBACK_PRICES,
      cached: false,
      fallback: true,
      disabled: true,
      error: 'Live prices disabled',
      lastUpdated: new Date().toISOString()
    })
  }

  try {
    // Check cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: priceCache.data,
        cached: true,
        lastUpdated: new Date(priceCache.timestamp).toISOString()
      })
    }

    // Fetch from CoinGecko (free, no auth required)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Validate data structure
    if (!data.bitcoin || !data.ethereum || !data.solana) {
      throw new Error('Invalid data structure from CoinGecko')
    }

    // Format data for our UI
    const formattedData = {
      BTC: {
        price: data.bitcoin.current_price,
        change24h: data.bitcoin.price_change_percentage_24h,
        symbol: 'BTC'
      },
      ETH: {
        price: data.ethereum.current_price,
        change24h: data.ethereum.price_change_percentage_24h,
        symbol: 'ETH'
      },
      SOL: {
        price: data.solana.current_price,
        change24h: data.solana.price_change_percentage_24h,
        symbol: 'SOL'
      }
    }

    // Update cache
    priceCache = {
      data: formattedData,
      timestamp: Date.now()
    }

    return NextResponse.json({
      success: true,
      data: formattedData,
      cached: false,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Live prices API error:', error)
    
    // Return fallback data
    return NextResponse.json({
      success: false,
      data: FALLBACK_PRICES,
      cached: false,
      fallback: true,
      error: 'Using fallback prices',
      lastUpdated: new Date().toISOString()
    })
  }
}
