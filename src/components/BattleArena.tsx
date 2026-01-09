'use client'

import { useState, useEffect } from 'react'
import { RARITY_COLORS, RARITY_EFFECTS } from '@/lib/constants'
import { soundManager } from '@/lib/sounds'
import { HolographicCard } from '@/components/ui/HolographicCard'
import { ASCIICardArt } from '@/components/ui/ASCIICardArt'
import AIOpponentSelector from '@/components/AIOpponentSelector'
import AchievementNotification from '@/components/AchievementNotification'

interface Card {
  id: string
  name: string
  attack: number
  defense: number
  health: number
  manaCost: number
  ability: string | null
  rarity: string
  cardType: string
  isFavorite: boolean
}

interface AIOpponent {
  id: string
  name: string
  difficulty: string
  strategy: string
  description: string
  avatar: string
}

interface BattleResult {
  battleId: string
  playerCards: Card[]
  aiCards: Card[]
  aiOpponent?: AIOpponent
  playerPower: number
  aiPower: number
  winner: string
  playerWins: boolean
  newAchievements?: string[]
}

interface GameState {
  playerHealth: number
  aiHealth: number
  playerMana: number
  aiMana: number
  turn: 'player' | 'ai'
  turnNumber: number
  gameOver: boolean
  winner?: 'player' | 'ai'
}

export default function BattleArena() {
  const [cards, setCards] = useState<Card[]>([])
  const [activeDeck, setActiveDeck] = useState<any>(null)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<AIOpponent | null>(null)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [battling, setBattling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerDeck, setPlayerDeck] = useState<Card[]>([])
  const [aiDeck, setAiDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [aiHand, setAiHand] = useState<Card[]>([])
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [showOpponentSelector, setShowOpponentSelector] = useState(false)

  useEffect(() => {
    fetchCardsAndDeck()
  }, [])

  const fetchCardsAndDeck = async () => {
    try {
      const [cardsResponse, decksResponse] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/decks')
      ])
      
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData)
      }

      if (decksResponse.ok) {
        const decksData = await decksResponse.json()
        const active = decksData.find((deck: any) => deck.isActive)
        setActiveDeck(active)
        
        // If there's an active deck, pre-select its cards
        if (active) {
          setSelectedCards(active.cards.map((dc: any) => dc.card.id))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCardSelection = (cardId: string) => {
    soundManager.cardSelect() // Play selection sound
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      } else if (prev.length < 3) {
        return [...prev, cardId]
      }
      return prev
    })
  }

  const startBattle = async () => {
    const requiredCards = activeDeck ? Math.min(3, activeDeck.cards.length) : 3;
    if (selectedCards.length !== requiredCards) return

    // Validate minimum cards for battle
    if (cards.length < 6) {
      setBattleLog(['❌ Need at least 6 cards total for battles.', '🎨 Create more cards first!']);
      return;
    }

    setBattling(true)
    soundManager.battleStart() // Play battle start sound
    
    const opponentName = selectedOpponent ? selectedOpponent.name : 'Random AI'
    const deckInfo = activeDeck ? ` using deck "${activeDeck.name}"` : '';
    setBattleLog(['⚔️ Battle begins!', `🎯 Facing: ${opponentName}${deckInfo}`, 'Calculating card powers...'])
    
    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerCardIds: selectedCards,
          aiOpponentId: selectedOpponent?.id 
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Play victory or defeat sound
        if (result.playerWins) {
          soundManager.victory()
        } else {
          soundManager.defeat()
        }
        
        // Add battle narrative
        const log = [
          '⚔️ Battle begins!',
          `🎯 Opponent: ${result.aiOpponent ? `${result.aiOpponent.avatar} ${result.aiOpponent.name}` : '🎲 Random AI'}`,
          result.aiOpponent ? `📋 Strategy: ${result.aiOpponent.strategy} (${result.aiOpponent.difficulty})` : '',
          `🃏 You played: ${result.playerCards.map((c: Card) => c.name).join(', ')}`,
          `🤖 AI played: ${result.aiCards.map((c: Card) => c.name).join(', ')}`,
          `⚡ Your total power: ${result.playerPower}`,
          `⚡ AI total power: ${result.aiPower}`,
          result.playerWins ? '🏆 Victory is yours!' : '💀 The AI emerges victorious!'
        ].filter(Boolean)
        
        setBattleLog(log)
        setBattleResult(result)
        
        // Handle new achievements
        if (result.newAchievements && result.newAchievements.length > 0) {
          setNewAchievements(result.newAchievements)
        }
      }
    } catch (error) {
      console.error('Error starting battle:', error)
      setBattleLog(['❌ Battle failed to start. Please try again.'])
    } finally {
      setBattling(false)
    }
  }

  const resetBattle = () => {
    setBattleResult(null)
    setSelectedCards([])
    setSelectedOpponent(null)
    setBattleLog([])
    setShowOpponentSelector(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading battle arena...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white text-center mb-8">
              Battle Arena
            </h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                No Cards Available
              </h2>
              <p className="text-blue-200 mb-6">
                You need cards to battle! Create some cards first.
              </p>
              <a
                href="/create-card"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Create Your First Card
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Achievement Notifications */}
      <AchievementNotification 
        achievementIds={newAchievements}
        onClose={() => setNewAchievements([])}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            ⚔️ Battle Arena
          </h1>

          {!battleResult ? (
            <>
              {/* Opponent Selection */}
              {!showOpponentSelector ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Choose Your Battle Style</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setSelectedOpponent(null)
                        setShowOpponentSelector(true)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="text-2xl mb-2">🎲</div>
                      <div>Quick Battle</div>
                      <div className="text-sm opacity-80">Random opponent</div>
                    </button>
                    <button
                      onClick={() => setShowOpponentSelector(true)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="text-2xl mb-2">🎯</div>
                      <div>Strategic Battle</div>
                      <div className="text-sm opacity-80">Choose your opponent</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
                  <AIOpponentSelector 
                    onSelect={setSelectedOpponent}
                    selectedOpponent={selectedOpponent}
                  />
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setShowOpponentSelector(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Back to Battle Style
                    </button>
                  </div>
                </div>
              )}

              {/* Card Selection - only show if opponent is selected or quick battle chosen */}
              {(selectedOpponent !== undefined) && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      {activeDeck ? `Using Deck: ${activeDeck.name}` : 'Select Your Battle Deck (Choose 3 Cards)'}
                    </h2>
                    {activeDeck && (
                      <div className="text-blue-200 text-sm">
                        Active Deck: {activeDeck.cards.length} cards
                      </div>
                    )}
                  </div>

                  {activeDeck ? (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                      <p className="font-bold">🃏 Using Active Deck</p>
                      <p>Your active deck &quot;{activeDeck.name}&quot; will be used for battle. You can change your active deck in the Deck Builder.</p>
                    </div>
                  ) : (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
                      <p className="font-bold">📚 No Active Deck</p>
                      <p>Select 3 cards manually, or create and activate a deck in the Deck Builder for strategic battles.</p>
                    </div>
                  )}
                  
                  {/* Show selected opponent info */}
                  {selectedOpponent && (
                    <div className="bg-black/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{selectedOpponent.avatar}</span>
                        <div>
                          <div className="text-white font-bold">{selectedOpponent.name}</div>
                          <div className="text-white/60 text-sm">{selectedOpponent.description}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-blue-200 mb-4">
                    Selected: {selectedCards.length}/{activeDeck ? Math.min(3, activeDeck.cards.length) : 3} cards
                    {activeDeck && activeDeck.cards.length < 3 && (
                      <span className="text-yellow-300 ml-2">(Deck has fewer than 3 cards)</span>
                    )}
                  </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-3 xl:grid-cols-4 gap-4 mb-6">
                  {cards.map((card) => (
                    <HolographicCard
                      key={card.id}
                      rarity={card.rarity as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'}
                      onClick={() => toggleCardSelection(card.id)}
                      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border-2 cursor-pointer transition-all duration-200 ${
                        selectedCards.includes(card.id)
                          ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-105'
                          : 'border-gray-400'
                      }`}
                    >
                      {/* Mana Cost and Favorite */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {card.manaCost}
                        </div>
                        <div className="flex items-center gap-1">
                          {card.isFavorite && (
                            <span className="text-yellow-400 text-xs" title="Favorite">⭐</span>
                          )}
                          <div className="text-xs text-gray-400 uppercase">
                            {card.rarity}
                          </div>
                        </div>
                      </div>

                      {/* Card Name */}
                      <h3 className="text-white font-bold text-sm mb-1 truncate">
                        {card.name}
                      </h3>

                      {/* Card Type */}
                      <p className="text-gray-400 text-xs mb-2">
                        {card.cardType}
                      </p>

                      {/* Stats */}
                      <div className="flex justify-between text-xs">
                        <span className="text-red-400">⚔️ {card.attack}</span>
                        <span className="text-blue-400">🛡️ {card.defense}</span>
                        <span className="text-green-400">❤️ {card.health}</span>
                      </div>

                      {selectedCards.includes(card.id) && (
                        <div className="mt-2 text-center">
                          <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">
                            SELECTED
                          </span>
                        </div>
                      )}
                    </HolographicCard>
                  ))}
                </div>

                  <div className="text-center">
                    <button
                      onClick={startBattle}
                      disabled={selectedCards.length !== (activeDeck ? Math.min(3, activeDeck.cards.length) : 3) || battling}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {battling ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Battling...
                        </span>
                      ) : `Battle ${selectedOpponent ? selectedOpponent.name : 'Random AI'}!`}
                    </button>
                    
                    {selectedCards.length !== 3 && (
                      <p className="text-yellow-400 text-sm mt-2">
                        Select exactly 3 cards to battle
                      </p>
                    )}
                  </div>

                  {/* Battle Log */}
                  {battleLog.length > 0 && (
                    <div className="mt-6 bg-black/30 rounded-lg p-4">
                      <h3 className="text-white font-bold mb-2">Battle Log</h3>
                      <div className="space-y-1">
                        {battleLog.map((log, index) => (
                          <p key={index} className="text-blue-200 text-sm">
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Battle Results */
            <div className="space-y-6">
              {/* Battle Outcome */}
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center ${
                battleResult.playerWins ? 'border-green-400' : 'border-red-400'
              }`}>
                <div className="text-6xl mb-4">
                  {battleResult.playerWins ? '🏆' : '💀'}
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${
                  battleResult.playerWins ? 'text-green-400' : 'text-red-400'
                }`}>
                  {battleResult.playerWins ? 'Victory!' : 'Defeat!'}
                </h2>
                <p className="text-blue-200 mb-4">
                  Your Power: {battleResult.playerPower} vs AI Power: {battleResult.aiPower}
                </p>
                <button
                  onClick={resetBattle}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Battle Again
                </button>
              </div>

              {/* Battle Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Player Cards */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    Your Cards
                  </h3>
                  <div className="space-y-3">
                    {battleResult.playerCards.map((card) => (
                      <div key={card.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-semibold">{card.name}</h4>
                          <p className="text-gray-400 text-sm">{card.cardType}</p>
                        </div>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-red-400">⚔️ {card.attack}</span>
                          <span className="text-blue-400">🛡️ {card.defense}</span>
                          <span className="text-green-400">❤️ {card.health}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-lg font-bold text-blue-400">
                      Total Power: {battleResult.playerPower}
                    </span>
                  </div>
                </div>

                {/* AI Cards */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    {battleResult.aiOpponent ? `${battleResult.aiOpponent.avatar} ${battleResult.aiOpponent.name}` : 'AI Opponent Cards'}
                  </h3>
                  {battleResult.aiOpponent && (
                    <div className="text-center mb-4">
                      <span className="text-sm text-white/60">
                        {battleResult.aiOpponent.strategy} Strategy • {battleResult.aiOpponent.difficulty} Difficulty
                      </span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {battleResult.aiCards.map((card) => (
                      <div key={card.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-semibold">{card.name}</h4>
                          <p className="text-gray-400 text-sm">{card.cardType}</p>
                        </div>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-red-400">⚔️ {card.attack}</span>
                          <span className="text-blue-400">🛡️ {card.defense}</span>
                          <span className="text-green-400">❤️ {card.health}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-lg font-bold text-red-400">
                      Total Power: {battleResult.aiPower}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
