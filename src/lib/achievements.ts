export const ACHIEVEMENT_CATEGORIES = {
  CREATOR: 'CREATOR',
  WARRIOR: 'WARRIOR', 
  COLLECTOR: 'COLLECTOR',
  SPECIAL: 'SPECIAL'
} as const;

export const ACHIEVEMENTS = [
  {
    id: 'first-card',
    name: 'Card Creator',
    description: 'Create your first battle card',
    icon: 'ART',
    category: ACHIEVEMENT_CATEGORIES.CREATOR,
    requirement: 1
  },
  {
    id: 'card-master',
    name: 'Card Master',
    description: 'Create 10 battle cards',
    icon: 'WIN',
    category: ACHIEVEMENT_CATEGORIES.CREATOR,
    requirement: 10
  },
  {
    id: 'first-victory',
    name: 'First Victory',
    description: 'Win your first battle',
    icon: 'ATK',
    category: ACHIEVEMENT_CATEGORIES.WARRIOR,
    requirement: 1
  },
  {
    id: 'battle-veteran',
    name: 'Battle Veteran',
    description: 'Win 5 battles',
    icon: 'DEF',
    category: ACHIEVEMENT_CATEGORIES.WARRIOR,
    requirement: 5
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Win 10 battles',
    icon: 'CHM',
    category: ACHIEVEMENT_CATEGORIES.WARRIOR,
    requirement: 10
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Own 20 cards',
    icon: '📚',
    category: ACHIEVEMENT_CATEGORIES.COLLECTOR,
    requirement: 20
  },
  {
    id: 'rare-collector',
    name: 'Rare Collector',
    description: 'Own cards of all rarities',
    icon: 'LGD',
    category: ACHIEVEMENT_CATEGORIES.COLLECTOR,
    requirement: 4 // Common, Rare, Epic, Legendary
  },
  {
    id: 'legendary-owner',
    name: 'Legendary Owner',
    description: 'Own a Legendary card',
    icon: '✨',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    requirement: 1
  }
] as const;

export type Achievement = typeof ACHIEVEMENTS[number];
export type AchievementCategory = typeof ACHIEVEMENT_CATEGORIES[keyof typeof ACHIEVEMENT_CATEGORIES];
