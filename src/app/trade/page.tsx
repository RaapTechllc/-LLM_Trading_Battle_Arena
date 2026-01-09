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

interface Trade {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  message: string | null;
  createdAt: string;
  sender: { id: string; username: string | null };
  receiver: { id: string; username: string | null };
  offers: {
    id: string;
    fromSender: boolean;
    card: Card;
  }[];
}

interface TradePartner {
  id: string;
  username: string;
}

export default function TradePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<TradePartner | null>(null);
  const [offeringCards, setOfferingCards] = useState<string[]>([]);
  const [requestingCards, setRequestingCards] = useState<string[]>([]);
  const [partnerCards, setPartnerCards] = useState<Card[]>([]);
  const [tradeMessage, setTradeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'inbox'>('create');

  const tradePartners: TradePartner[] = [
    { id: 'default-user-2', username: 'Alex the Collector' },
    { id: 'default-user-3', username: 'Sam the Strategist' },
    { id: 'default-user-4', username: 'Jordan the Battler' },
    { id: 'default-user-5', username: 'Casey the Creator' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsResponse, tradesResponse] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/trades')
      ]);

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setCards(cardsData);
      }

      if (tradesResponse.ok) {
        const tradesData = await tradesResponse.json();
        setTrades(tradesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPartner = (partner: TradePartner) => {
    setSelectedPartner(partner);
    // Simulate partner's cards (use some of the existing cards)
    const simulatedPartnerCards = cards.slice(0, Math.min(8, cards.length)).map(card => ({
      ...card,
      id: `partner-${card.id}`,
      ownerId: partner.id
    }));
    setPartnerCards(simulatedPartnerCards);
  };

  const toggleOfferingCard = (cardId: string) => {
    setOfferingCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const toggleRequestingCard = (cardId: string) => {
    setRequestingCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const createTrade = async () => {
    if (!selectedPartner || offeringCards.length === 0 || requestingCards.length === 0) {
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedPartner.id,
          senderCardIds: offeringCards,
          receiverCardIds: requestingCards.map(id => id.replace('partner-', '')),
          message: tradeMessage || undefined
        })
      });

      if (response.ok) {
        await fetchData();
        setOfferingCards([]);
        setRequestingCards([]);
        setTradeMessage('');
        setSelectedPartner(null);
        setActiveTab('inbox');
      }
    } catch (error) {
      console.error('Error creating trade:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleTradeAction = async (tradeId: string, action: 'accept' | 'reject' | 'cancel') => {
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error(`Error ${action}ing trade:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading trading center...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            🔄 Card Trading Center
          </h1>

          {/* Educational Disclaimer */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">📚 Educational Paper Trading Only</p>
            <p>This trading system is for learning and entertainment. No real money or financial transactions involved. Practice fair trading and collection building!</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'create'
                    ? 'bg-white text-purple-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Create Trade
              </button>
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-white text-purple-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Trade Inbox ({trades.filter(t => t.status === 'PENDING').length})
              </button>
            </div>
          </div>

          {activeTab === 'create' ? (
            /* Create Trade Tab */
            <div className="space-y-8">
              {/* Partner Selection */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">Select Trading Partner</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tradePartners.map(partner => (
                    <button
                      key={partner.id}
                      onClick={() => selectPartner(partner)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPartner?.id === partner.id
                          ? 'border-green-400 bg-green-400/20'
                          : 'border-white/30 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-white font-bold">{partner.username}</div>
                      <div className="text-blue-200 text-sm">Simulated Trader</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPartner && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Your Cards (Offering) */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Your Cards (Offering: {offeringCards.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {cards.map(card => (
                        <HolographicCard
                          key={card.id}
                          rarity={card.rarity as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'}
                          onClick={() => toggleOfferingCard(card.id)}
                          className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border-2 cursor-pointer transition-all ${
                            offeringCards.includes(card.id)
                              ? 'border-green-400 ring-2 ring-green-400/50'
                              : 'border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {card.manaCost}
                            </div>
                            <div className="text-xs text-gray-400 uppercase">{card.rarity}</div>
                          </div>
                          <h4 className="text-white font-bold text-sm mb-1 truncate">{card.name}</h4>
                          <div className="bg-gray-700 rounded-md h-12 mb-2 flex items-center justify-center">
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
                        </HolographicCard>
                      ))}
                    </div>
                  </div>

                  {/* Partner's Cards (Requesting) */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {selectedPartner.username}&apos;s Cards (Requesting: {requestingCards.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {partnerCards.map(card => (
                        <HolographicCard
                          key={card.id}
                          rarity={card.rarity as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'}
                          onClick={() => toggleRequestingCard(card.id)}
                          className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border-2 cursor-pointer transition-all ${
                            requestingCards.includes(card.id)
                              ? 'border-blue-400 ring-2 ring-blue-400/50'
                              : 'border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {card.manaCost}
                            </div>
                            <div className="text-xs text-gray-400 uppercase">{card.rarity}</div>
                          </div>
                          <h4 className="text-white font-bold text-sm mb-1 truncate">{card.name}</h4>
                          <div className="bg-gray-700 rounded-md h-12 mb-2 flex items-center justify-center">
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
                        </HolographicCard>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedPartner && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Complete Trade</h3>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Add a message to your trade offer (optional)..."
                      value={tradeMessage}
                      onChange={(e) => setTradeMessage(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={createTrade}
                      disabled={offeringCards.length === 0 || requestingCards.length === 0 || creating}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      {creating ? 'Creating Trade...' : `Send Trade Offer (${offeringCards.length} ⇄ ${requestingCards.length})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Trade Inbox Tab */
            <div className="space-y-6">
              {trades.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
                  <div className="text-6xl mb-4">📬</div>
                  <h2 className="text-2xl font-bold text-white mb-4">No Trades Yet</h2>
                  <p className="text-blue-200">Create your first trade to start exchanging cards!</p>
                </div>
              ) : (
                trades.map(trade => (
                  <div key={trade.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Trade with {trade.senderId === 'default-user' ? trade.receiver.username : trade.sender.username}
                        </h3>
                        <p className="text-blue-200 text-sm">
                          {new Date(trade.createdAt).toLocaleDateString()} • Status: {trade.status}
                        </p>
                        {trade.message && (
                          <p className="text-gray-300 text-sm mt-2 italic">&quot;{trade.message}&quot;</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trade.status === 'PENDING' ? 'bg-yellow-600 text-white' :
                        trade.status === 'ACCEPTED' ? 'bg-green-600 text-white' :
                        trade.status === 'REJECTED' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {trade.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="text-white font-bold mb-2">
                          {trade.senderId === 'default-user' ? 'You offer:' : 'They offer:'}
                        </h4>
                        <div className="space-y-2">
                          {trade.offers.filter(o => o.fromSender).map(offer => (
                            <div key={offer.id} className="bg-black/20 rounded p-2 flex items-center space-x-2">
                              <div className="text-xs text-gray-400">{offer.card.rarity}</div>
                              <div className="text-white font-medium">{offer.card.name}</div>
                              <div className="text-blue-300 text-xs">({offer.card.attack}/{offer.card.defense}/{offer.card.health})</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-2">
                          {trade.senderId === 'default-user' ? 'You request:' : 'They request:'}
                        </h4>
                        <div className="space-y-2">
                          {trade.offers.filter(o => !o.fromSender).map(offer => (
                            <div key={offer.id} className="bg-black/20 rounded p-2 flex items-center space-x-2">
                              <div className="text-xs text-gray-400">{offer.card.rarity}</div>
                              <div className="text-white font-medium">{offer.card.name}</div>
                              <div className="text-blue-300 text-xs">({offer.card.attack}/{offer.card.defense}/{offer.card.health})</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {trade.status === 'PENDING' && (
                      <div className="flex gap-2">
                        {trade.receiverId === 'default-user' ? (
                          <>
                            <button
                              onClick={() => handleTradeAction(trade.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all"
                            >
                              Accept Trade
                            </button>
                            <button
                              onClick={() => handleTradeAction(trade.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all"
                            >
                              Reject Trade
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleTradeAction(trade.id, 'cancel')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all"
                          >
                            Cancel Trade
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
