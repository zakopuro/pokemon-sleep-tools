// Pokemon Sleep candy calculator logic.
// EXP and dream shard tables are aligned with nitoyon/pokesleep-tool.

type ExpType = 600 | 900 | 1080 | 1320;

// Total EXP required to reach each level. Index is the level number.
export const TOTAL_EXP_TO_LEVEL: number[] = [
  0, 0, 54, 125, 233, 361, 525, 727, 971, 1245, 1560,
  1905, 2281, 2688, 3107, 3536, 3976, 4430, 4899, 5382, 5879,
  6394, 6931, 7489, 8068, 8668, 9290, 9933, 10598, 11284, 11992,
  12721, 13469, 14235, 15020, 15823, 16644, 17483, 18340, 19215, 20108,
  21018, 21946, 22891, 23854, 24834, 25831, 26846, 27878, 28927, 29993,
  31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493,
  54358, 57280, 60257, 63286, 66363, 69458, 72574, 75718, 78907, 82162,
];

// Dream shards consumed per candy at each resulting level.
export const DREAM_SHARDS_PER_CANDY: number[] = [
  0, 0, 14, 18, 22, 27, 30, 34, 39, 44, 48,
  50, 52, 53, 56, 59, 62, 66, 68, 71, 74,
  78, 81, 85, 88, 92, 95, 100, 105, 111, 117,
  122, 126, 130, 136, 143, 151, 160, 167, 174, 184,
  192, 201, 211, 221, 227, 236, 250, 264, 279, 295,
  309, 323, 338, 356, 372, 391, 437, 486, 538, 593,
  651, 698, 750, 804, 866, 932, 1004, 1084, 1173, 1272,
];

const EXP_TYPE_RATE: Record<ExpType, number> = {
  600: 1,
  900: 1.5,
  1080: 1.8,
  1320: 2.2,
};

export const MAX_CANDY_LEVEL = 70;

export type BoostEvent = 'none' | 'mini' | 'unlimited';

export interface CandyCalculationInput {
  currentLevel: number;
  targetLevel: number;
  expType: ExpType;
  nature: 'up' | 'normal' | 'down';
  eventType: BoostEvent;
  expGot?: number;
  remainingExp?: number;
  evolutionCandies?: number;
  ownedCandies?: number;
}

export interface CandyCalculationResult {
  requiredCandies: number;
  requiredDreamShards: number;
  requiredExp: number;
  totalCandies: number;
  additionalCandiesNeeded: number;
  universalCandyS: number;
  universalCandyM: number;
  universalCandyL: number;
}

function calcExp(level1: number, level2: number, expType: ExpType): number {
  const ratio = EXP_TYPE_RATE[expType];
  return Math.round(TOTAL_EXP_TO_LEVEL[level2] * ratio) -
    Math.round(TOTAL_EXP_TO_LEVEL[level1] * ratio);
}

function calcExpFromCandy(
  level: number,
  nature: 'up' | 'normal' | 'down',
  boost: BoostEvent,
): number {
  const boostFactor = boost !== 'none' ? 2 : 1;
  let baseExp: number;

  if (level < 25) {
    baseExp = nature === 'up' ? 47 : nature === 'down' ? 33 : 40;
  } else if (level < 30) {
    baseExp = nature === 'up' ? 41 : nature === 'down' ? 29 : 35;
  } else {
    baseExp = nature === 'up' ? 30 : nature === 'down' ? 21 : 25;
  }

  return baseExp * boostFactor;
}

function calcExpGotFromRemainingExp(
  currentLevel: number,
  remainingExp: number,
  expType: ExpType,
): number {
  if (currentLevel >= MAX_CANDY_LEVEL) return 0;

  const nextLevelTotalExp = calcExp(currentLevel, currentLevel + 1, expType);
  return nextLevelTotalExp - remainingExp;
}

export function calculateRequiredCandy(input: CandyCalculationInput): CandyCalculationResult {
  const {
    currentLevel,
    targetLevel,
    expType,
    nature,
    eventType,
    expGot = 0,
    remainingExp,
    evolutionCandies = 0,
    ownedCandies = 0,
  } = input;

  const actualExpGot = remainingExp !== undefined
    ? calcExpGotFromRemainingExp(currentLevel, remainingExp, expType)
    : expGot;

  if (
    currentLevel < 0 ||
    currentLevel > MAX_CANDY_LEVEL ||
    targetLevel < 0 ||
    targetLevel > MAX_CANDY_LEVEL ||
    currentLevel >= targetLevel
  ) {
    const additionalCandiesNeeded = Math.max(0, evolutionCandies - ownedCandies);
    return {
      requiredCandies: 0,
      requiredDreamShards: 0,
      requiredExp: 0,
      totalCandies: evolutionCandies,
      additionalCandiesNeeded,
      universalCandyS: Math.ceil(additionalCandiesNeeded / 3),
      universalCandyM: Math.ceil(additionalCandiesNeeded / 20),
      universalCandyL: Math.ceil(additionalCandiesNeeded / 100),
    };
  }

  const totalRequiredExp = calcExp(currentLevel, targetLevel, expType);
  const requiredExp = totalRequiredExp - actualExpGot;
  let requiredDreamShards = 0;
  let requiredCandies = 0;
  let carry = actualExpGot;
  const shardRate = eventType === 'none' ? 1 : eventType === 'mini' ? 4 : 5;

  for (let i = currentLevel; i < targetLevel; i++) {
    const levelRequiredExp = calcExp(i, i + 1, expType) - carry;
    const candyExpWithEvent = calcExpFromCandy(i, nature, eventType);
    const levelRequiredCandy = Math.ceil(levelRequiredExp / candyExpWithEvent);

    requiredDreamShards += DREAM_SHARDS_PER_CANDY[i + 1] * levelRequiredCandy * shardRate;
    requiredCandies += levelRequiredCandy;
    carry = candyExpWithEvent * levelRequiredCandy - levelRequiredExp;
  }

  const totalCandies = requiredCandies + evolutionCandies;
  const additionalCandiesNeeded = Math.max(0, totalCandies - ownedCandies);

  return {
    requiredCandies,
    requiredDreamShards,
    requiredExp,
    totalCandies,
    additionalCandiesNeeded,
    universalCandyS: Math.ceil(additionalCandiesNeeded / 3),
    universalCandyM: Math.ceil(additionalCandiesNeeded / 20),
    universalCandyL: Math.ceil(additionalCandiesNeeded / 100),
  };
}

export function isValidLevelRange(currentLevel: number, targetLevel: number): boolean {
  return (
    currentLevel >= 1 &&
    currentLevel <= MAX_CANDY_LEVEL &&
    targetLevel >= 1 &&
    targetLevel <= MAX_CANDY_LEVEL &&
    currentLevel < targetLevel
  );
}

export function getExpToNextLevel(currentLevel: number, expType: ExpType): number {
  if (currentLevel >= MAX_CANDY_LEVEL) return 0;
  return calcExp(currentLevel, currentLevel + 1, expType);
}
