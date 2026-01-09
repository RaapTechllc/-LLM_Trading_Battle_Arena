import { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '@/lib/achievements';

interface AchievementNotificationProps {
  achievementIds: string[];
  onClose: () => void;
}

export default function AchievementNotification({ achievementIds, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievementIds.length > 0) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievementIds, onClose]);

  if (achievementIds.length === 0) return null;

  const achievements = achievementIds.map(id => 
    ACHIEVEMENTS.find(a => a.id === id)
  ).filter(Boolean);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">🏆 Achievement Unlocked!</h3>
          <button 
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
        {achievements.map((achievement, index) => (
          <div key={achievement?.id} className={`${index > 0 ? 'mt-2 pt-2 border-t border-white/20' : ''}`}>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{achievement?.icon}</span>
              <div>
                <div className="font-semibold">{achievement?.name}</div>
                <div className="text-sm opacity-90">{achievement?.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
