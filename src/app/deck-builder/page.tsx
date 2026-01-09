'use client';

import { useState, useEffect } from 'react';
import { HolographicCard } from '@/components/ui/HolographicCard';
import { ASCIICardArt } from '@/components/ui/ASCIICardArt';

interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  health: number;
  manaCost: number;
  ability: string | null;
  rarity: string;
  cardType: string;
  isFavorite: boolean;
}

interface Deck {
  id: string;
  name: string;
  isActive: boolean;
  cards: { card: Card }[];
}

export default function DeckBuilderPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [deckName, setDeckName] = useState('');
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsResponse, decksResponse] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/decks')
      ]);

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setCards(cardsData);
      }

      if (decksResponse.ok) {
        const decksData = await decksResponse.json();
        setDecks(decksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else if (prev.length < 30) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  const saveDeck = async () => {
    if (!deckName.trim() || selectedCards.length < 10) return;

    setSaving(true);
    try {
      const url = editingDeck ? `/api/decks/${editingDeck.id}` : '/api/decks';
      const method = editingDeck ? 'PATCH' : 'POST';
      const body = editingDeck 
        ? { action: 'update', name: deckName, cardIds: selectedCards }
        : { name: deckName, cardIds: selectedCards };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchData();
        setDeckName('');
        setSelectedCards([]);
        setEditingDeck(null);
      }
    } catch (error) {
      console.error('Error saving deck:', error);
    } finally {
      setSaving(false);
    }
  };

  const editDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setDeckName(deck.name);
    setSelectedCards(deck.cards.map(dc => dc.card.id));
  };

  const setActiveDeck = async (deckId: string) => {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setActive' })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error setting active deck:', error);
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const getDeckStats = () => {
    const selectedCardData = cards.filter(c => selectedCards.includes(c.id));
    const manaCurve = selectedCardData.reduce((acc, card) => {
      acc[card.manaCost] = (acc[card.manaCost] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const avgMana = selectedCardData.length > 0 
      ? selectedCardData.reduce((sum, card) => sum + card.manaCost, 0) / selectedCardData.length
      : 0;

    return { manaCurve, avgMana: Math.round(avgMana * 10) / 10 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading deck builder...</div>
      </div>
    );
  }

  const stats = getDeckStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            🃏 Deck Builder
          </h1>

          {/* Educational Disclaimer */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">📚 Educational Simulation Only</p>
            <p>This deck building system is for learning and entertainment. No real money or trading involved.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Deck Builder */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {editingDeck ? 'Edit Deck' : 'Create New Deck'}
                </h2>
                
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Deck name..."
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveDeck}
                    disabled={!deckName.trim() || selectedCards.length < 10 || saving}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200"
                  >
                    {saving ? 'Saving...' : editingDeck ? 'Update' : 'Save'}
                  </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-white">
                    Cards: {selectedCards.length}/30 (min: 10)
                  </div>
                  <div className="text-white">
                    Avg Mana: {stats.avgMana}
                  </div>
                </div>

                {/* Mana Curve */}
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-2">Mana Curve</h3>
                  <div className="flex gap-1 h-20 items-end">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(mana => (
                      <div key={mana} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-blue-500 w-full rounded-t"
                          style={{ 
                            height: `${Math.max(4, (stats.manaCurve[mana] || 0) * 8)}px` 
                          }}
                        ></div>
                        <div className="text-white text-xs mt-1">{mana}</div>
                        <div className="text-white text-xs">{stats.manaCurve[mana] || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Selection */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Select Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards
                    .sort((a, b) => {
                      // Sort favorites first, then by mana cost
                      if (a.isFavorite && !b.isFavorite) return -1;
                      if (!a.isFavorite && b.isFavorite) return 1;
                      return a.manaCost - b.manaCost;
                    })
                    .map((card) => (
                    <HolographicCard
                      key={card.id}
                      rarity={card.rarity as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'}
                      onClick={() => toggleCardSelection(card.id)}
                      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border-2 cursor-pointer transition-all duration-200 ${
                        selectedCards.includes(card.id)
                          ? 'border-green-400 ring-2 ring-green-400/50'
                          : 'border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {card.manaCost}
                        </div>
                        <div className="flex items-center gap-1">
                          {card.isFavorite && <span className="text-yellow-400 text-xs">⭐</span>}
                          <div className="text-xs text-gray-400 uppercase">{card.rarity}</div>
                        </div>
                      </div>

                      <h4 className="text-white font-bold text-sm mb-1 truncate">{card.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">{card.cardType}</p>

                      <div className="bg-gray-700 rounded-md h-16 mb-2 flex items-center justify-center overflow-hidden">
                        <ASCIICardArt 
                          cardType={card.cardType as 'CREATURE' | 'SPELL' | 'ARTIFACT'}
                          rarity={card.rarity as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'}
                          className="text-gray-300 text-xs"
                        />
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-red-400">⚔️ {card.attack}</span>
                        <span className="text-blue-400">🛡️ {card.defense}</span>
                        <span className="text-green-400">❤️ {card.health}</span>
                      </div>

                      {selectedCards.includes(card.id) && (
                        <div className="mt-2 text-center">
                          <span className="bg-green-400 text-black text-xs px-2 py-1 rounded font-bold">
                            SELECTED
                          </span>
                        </div>
                      )}
                    </HolographicCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Deck List */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">My Decks</h3>
                
                {decks.length === 0 ? (
                  <p className="text-blue-200">No decks created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {decks.map((deck) => (
                      <div key={deck.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold">{deck.name}</h4>
                          {deck.isActive && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        
                        <p className="text-blue-200 text-sm mb-3">
                          {deck.cards.length} cards
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editDeck(deck)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          {!deck.isActive && (
                            <button
                              onClick={() => setActiveDeck(deck.id)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => deleteDeck(deck.id)}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
