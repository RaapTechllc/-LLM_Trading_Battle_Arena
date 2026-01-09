import TradeJournal from '@/components/TradeJournal'
import LivePriceTicker from '@/components/LivePriceTicker'

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Educational Disclaimer */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Educational Collection:</strong> These are simulated trading performance cards for learning purposes. No real trades or financial positions are represented.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Market Data Bar */}
        <div className="mb-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-200">Current Market Prices</span>
              <LivePriceTicker />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            🃏 Trade Journal
          </h1>
          <p className="text-blue-200 text-center mb-8">
            Browse AI model trading performance cards with holographic rarity effects
          </p>
          
          <TradeJournal />
        </div>
      </div>
    </div>
  )
}
