'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BattleResult {
  id: string
  placement: number
  cashWon: number
  createdAt: string
}

interface Battle {
  id: string
  status: string
  winnerId: string | null
  battleType: string
  entryFee: number
  prizePool: number
  createdAt: string
  results: BattleResult[]
  player1: {
    id: string
    username: string | null
  } | null
}

export default function BattleHistory() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBattleHistory()
  }, [])

  const fetchBattleHistory = async () => {
    try {
      const response = await fetch('/api/battles/history')
      if (response.ok) {
        const data = await response.json()
        setBattles(data)
      }
    } catch (error) {
      console.error('Error fetching battle history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBattleResult = (battle: Battle) => {
    if (battle.status === 'COMPLETED' && battle.winnerId) {
      return battle.winnerId === 'player' ? 'Victory' : 'Defeat'
    }
    return battle.status
  }

  const getResultColor = (battle: Battle) => {
    const result = getBattleResult(battle)
    if (result === 'Victory') return 'text-green-400'
    if (result === 'Defeat') return 'text-red-400'
    return 'text-yellow-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading battle history...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Battle History</h1>
            <Link
              href="/battle"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              New Battle
            </Link>
          </div>

          {battles.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                No Battles Yet
              </h2>
              <p className="text-blue-200 mb-6">
                You haven&apos;t fought any battles yet. Start your first battle to see your history here!
              </p>
              <Link
                href="/battle"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Your First Battle
              </Link>
            </div>
          ) : (
            <>
              {/* Battle Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{battles.length}</div>
                    <div className="text-blue-200 text-sm">Total Battles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {battles.filter(b => getBattleResult(b) === 'Victory').length}
                    </div>
                    <div className="text-blue-200 text-sm">Victories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {battles.filter(b => getBattleResult(b) === 'Defeat').length}
                    </div>
                    <div className="text-blue-200 text-sm">Defeats</div>
                  </div>
                </div>
              </div>

              {/* Battle List */}
              <div className="space-y-4">
                {battles.map((battle) => (
                  <div
                    key={battle.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-lg font-bold ${getResultColor(battle)}`}>
                            {getBattleResult(battle)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            vs {battle.player1?.username || 'AI Opponent'}
                          </div>
                        </div>
                        <div className="text-blue-200 text-sm">
                          {battle.battleType} Battle • {formatDate(battle.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {battle.entryFee > 0 && (
                          <div className="text-yellow-400">
                            Entry: ${battle.entryFee}
                          </div>
                        )}
                        {battle.prizePool > 0 && (
                          <div className="text-green-400">
                            Prize: ${battle.prizePool}
                          </div>
                        )}
                        <div className="text-gray-400">
                          {battle.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Educational Disclaimer */}
          <div className="mt-8 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-xl">⚠️</div>
              <div>
                <h3 className="text-yellow-400 font-semibold mb-1">Educational Simulation</h3>
                <p className="text-yellow-200 text-sm">
                  This is a paper trading simulation for educational purposes only. 
                  No real money or financial transactions are involved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
