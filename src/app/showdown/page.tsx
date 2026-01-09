import ModelShowdown from '@/components/ModelShowdown'
import LiveShowdown from '@/components/LiveShowdown'
import LivePriceTicker from '@/components/LivePriceTicker'

export default function ShowdownPage() {
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
              <strong>Simulated Competition:</strong> Model showdowns compare simulated trading performance for educational entertainment. No real trading or financial competition occurs.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Market Context */}
        <div className="mb-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-200">Live Market Context</span>
              <LivePriceTicker />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          <div>
            <h1 className="text-4xl font-bold text-white text-center mb-2">
              ⚔️ Model Showdown
            </h1>
            <p className="text-blue-200 text-center mb-8">
              Watch AI models battle head-to-head based on their trading performance
            </p>
          </div>

          {/* Live AI Battle */}
          <section>
            <LiveShowdown />
          </section>

          {/* Card-based Showdown */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-[10px] font-bold text-tertiary tracking-[0.3em] uppercase">OR COMPARE EXISTING CARDS</h2>
            </div>
            <ModelShowdown />
          </section>
        </div>
      </div>
    </div>
  )
}
