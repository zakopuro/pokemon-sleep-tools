export interface Field {
  id: number;
  name: string;
  abbreviation: string;
  berries: number[];
  color: string;
}

export const FIELDS: Field[] = [
  {
    id: 1,
    name: "ワカクサ本島",
    abbreviation: "ワカクサ",
    berries: [],
    color: "#D5E569"
  },
  {
    id: 2,
    name: "シアンの砂浜",
    abbreviation: "シアン",
    berries: [3, 18, 10],
    color: "#81CFF5"
  },
  {
    id: 3,
    name: "トープ洞窟",
    abbreviation: "トープ",
    berries: [2, 9, 13],
    color: "#A8A6B1"
  },
  {
    id: 4,
    name: "ウノハナ雪原",
    abbreviation: "ウノハナ",
    berries: [6, 1, 16],
    color: "#E8EFF5"
  },
  {
    id: 5,
    name: "ラピスラズリ湖畔",
    abbreviation: "ラピス",
    berries: [5, 11, 7],
    color: "#A6BBE1"
  },
  {
    id: 6,
    name: "ゴールド旧発電所",
    abbreviation: "ゴル旧",
    berries: [4, 14, 17],
    color: "#F3CF60"
  },
  {
    id: 7,
    name: "ワカクサ本島EX",
    abbreviation: "ワカクサEX",
    berries: [],
    color: "#B8E569"
  },
  {
    id: 8,
    name: "アンバー渓谷",
    abbreviation: "アンバー",
    berries: [8, 12, 15],
    color: "#D2691E"
  }
];