import { useState, useEffect } from 'react';

interface AIOpponent {
  id: string;
  name: string;
  difficulty: string;
  strategy: string;
  description: string;
  avatar: string;
}

interface AIOpponentSelectorProps {
  onSelect: (opponent: AIOpponent | null) => void;
  selectedOpponent: AIOpponent | null;
}

export default function AIOpponentSelector({ onSelect, selectedOpponent }: AIOpponentSelectorProps) {
  const [opponents, setOpponents] = useState<AIOpponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpponents();
  }, []);

  const fetchOpponents = async () => {
    try {
      const response = await fetch('/api/ai-opponents');
      const data = await response.json();
      setOpponents(data);
    } catch (error) {
      console.error('Error fetching AI opponents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400 bg-green-400/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/20';
      case 'HARD': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'AGGRESSIVE': return '⚔️';
      case 'DEFENSIVE': return '🛡️';
      case 'BALANCED': return '⚖️';
      case 'RARITY': return '💎';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-white/60 mt-2">Loading opponents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Choose Your Opponent</h3>
      
      {/* Random Opponent Option */}
      <div
        onClick={() => onSelect(null)}
        className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all hover:bg-white/20 ${
          selectedOpponent === null ? 'ring-2 ring-blue-400' : ''
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="text-3xl">🎲</div>
          <div className="flex-1">
            <h4 className="font-bold text-white">Random Opponent</h4>
            <p className="text-white/60 text-sm">Face a random AI with unpredictable strategy</p>
          </div>
          <div className="text-gray-400 bg-gray-400/20 px-2 py-1 rounded text-xs">
            RANDOM
          </div>
        </div>
      </div>

      {/* AI Opponents */}
      {opponents.map(opponent => (
        <div
          key={opponent.id}
          onClick={() => onSelect(opponent)}
          className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all hover:bg-white/20 ${
            selectedOpponent?.id === opponent.id ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{opponent.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-white">{opponent.name}</h4>
                <span className="text-lg">{getStrategyIcon(opponent.strategy)}</span>
              </div>
              <p className="text-white/60 text-sm mb-2">{opponent.description}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(opponent.difficulty)}`}>
                  {opponent.difficulty}
                </span>
                <span className="text-white/40 text-xs">
                  {opponent.strategy.charAt(0) + opponent.strategy.slice(1).toLowerCase()} Strategy
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
