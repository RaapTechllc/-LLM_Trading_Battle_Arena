export const AI_DIFFICULTIES = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM', 
  HARD: 'HARD'
} as const;

export const AI_STRATEGIES = {
  AGGRESSIVE: 'AGGRESSIVE',
  DEFENSIVE: 'DEFENSIVE',
  BALANCED: 'BALANCED',
  RARITY: 'RARITY'
} as const;

export const AI_OPPONENTS = [
  {
    id: 'rookie-fighter',
    name: 'Rookie Fighter',
    difficulty: AI_DIFFICULTIES.EASY,
    strategy: AI_STRATEGIES.BALANCED,
    description: 'A beginner warrior learning the ropes',
    avatar: 'RKI'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    difficulty: AI_DIFFICULTIES.MEDIUM,
    strategy: AI_STRATEGIES.AGGRESSIVE,
    description: 'Attacks relentlessly with high-power cards',
    avatar: 'SPD'
  },
  {
    id: 'guardian',
    name: 'Guardian',
    difficulty: AI_DIFFICULTIES.MEDIUM,
    strategy: AI_STRATEGIES.DEFENSIVE,
    description: 'Focuses on defense and outlasting opponents',
    avatar: 'DEF'
  },
  {
    id: 'treasure-hunter',
    name: 'Treasure Hunter',
    difficulty: AI_DIFFICULTIES.HARD,
    strategy: AI_STRATEGIES.RARITY,
    description: 'Seeks out the most powerful rare cards',
    avatar: 'GEM'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    difficulty: AI_DIFFICULTIES.HARD,
    strategy: AI_STRATEGIES.BALANCED,
    description: 'A master strategist with perfect balance',
    avatar: 'OVR'
  }
] as const;

export type AIDifficulty = typeof AI_DIFFICULTIES[keyof typeof AI_DIFFICULTIES];
export type AIStrategy = typeof AI_STRATEGIES[keyof typeof AI_STRATEGIES];
export type AIOpponent = typeof AI_OPPONENTS[number];
