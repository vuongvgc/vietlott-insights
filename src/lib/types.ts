export type ProductKey = 'power655' | 'mega645';

export interface ProductConfig {
  key: ProductKey;
  label: string;
  slug: string;
  range: [number, number]; // [min, max]
  pick: number;
  hasBonus: boolean;
  url: string; // raw github jsonl
  drawDays: string; // e.g. "T3, T5, T7"
}

export const PRODUCTS: Record<ProductKey, ProductConfig> = {
  power655: {
    key: 'power655',
    label: 'Power 6/55',
    slug: 'power-655',
    range: [1, 55],
    pick: 6,
    hasBonus: true,
    url: 'https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power655.jsonl',
    drawDays: 'Thứ 3, 5, 7',
  },
  mega645: {
    key: 'mega645',
    label: 'Mega 6/45',
    slug: 'mega-645',
    range: [1, 45],
    pick: 6,
    hasBonus: false,
    url: 'https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power645.jsonl',
    drawDays: 'Thứ 4, 6, CN',
  },
};

export interface Draw {
  date: string; // YYYY-MM-DD
  id: string;
  numbers: number[]; // 6 main numbers, sorted ASC
  bonus?: number;
}

export interface Suggestion {
  numbers: number[];
  rationale: string[];
}

export interface StrategyDef {
  key: string;
  name: string;
  description: string;
  emoji: string;
  generate: (draws: Draw[], config: ProductConfig) => Suggestion;
}

export interface BacktestResult {
  strategyKey: string;
  avgMatch: number;
  distribution: Record<number, number>; // {0: x, 1: y, ...}
  total: number;
}
