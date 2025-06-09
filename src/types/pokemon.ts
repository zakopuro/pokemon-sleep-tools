// 管理状態の型定義
export type ManagementStatus = '未設定' | '完了' | '保留' | '中止' | '対象外';

// サブスキルレベルマップの型定義
export type SubskillByLevel = Record<number, number | null>;

// 睡眠タイプの型定義
export type SleepType = 'うとうと' | 'すやすや' | 'ぐっすり';

// 得意分野の型定義
export type Specialty = 'きのみ' | '食材' | 'スキル' | 'オール';

// サブスキルの色の型定義
export type SubskillColor = 'gold' | 'light blue' | 'gray';