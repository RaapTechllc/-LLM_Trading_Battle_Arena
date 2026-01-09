'use client';

import { useState, useEffect } from 'react';
import { ACHIEVEMENT_CATEGORIES } from '@/lib/achievements';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      const data = await response.json();
      setAchievements(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = selectedCategory === 'ALL' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Oops!</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAchievements();
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Achievements</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
            <div className="text-2xl font-bold text-white">
              {unlockedCount} / {totalCount}
            </div>
            <div className="text-white/80">Achievements Unlocked</div>
            <div className="w-48 bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-white text-purple-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All
          </button>
          {Object.values(ACHIEVEMENT_CATEGORIES).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-white text-purple-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 transition-all hover:bg-white/20 ${
                achievement.unlocked 
                  ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' 
                  : 'opacity-60'
              }`}
            >
              <div className="text-center">
                <div className={`text-4xl mb-3 ${achievement.unlocked ? 'animate-pulse' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {achievement.name}
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  {achievement.description}
                </p>
                
                {achievement.unlocked ? (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Unlocked
                  </div>
                ) : (
                  <div className="bg-white/20 text-white/60 px-3 py-1 rounded-full text-sm">
                    Locked
                  </div>
                )}
                
                <div className="mt-3 text-xs text-white/60">
                  {achievement.category.charAt(0) + achievement.category.slice(1).toLowerCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center text-white/60 py-12">
            <div className="text-4xl mb-4">🎯</div>
            <p>No achievements found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
