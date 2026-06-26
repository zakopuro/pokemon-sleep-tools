// サブスキルレベル定数
export const SUBSKILL_LEVELS = [10, 25, 50, 70, 80];

type SubskillByLevelRecord = Record<number, number | null>;

const LEGACY_SUBSKILL_LEVEL_MAP = new Map<number, number>([
  [75, 70],
  [100, 80],
]);

export const normalizeSubskillByLevel = (
  subskillByLevel: SubskillByLevelRecord | undefined,
): SubskillByLevelRecord => {
  const normalized = Object.fromEntries(
    SUBSKILL_LEVELS.map(level => [level, subskillByLevel?.[level] ?? null])
  ) as SubskillByLevelRecord;

  for (const [legacyLevel, currentLevel] of LEGACY_SUBSKILL_LEVEL_MAP) {
    const legacyValue = subskillByLevel?.[legacyLevel];
    if (legacyValue !== undefined && legacyValue !== null && normalized[currentLevel] === null) {
      normalized[currentLevel] = legacyValue;
    }
  }

  return normalized;
};
