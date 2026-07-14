import type { AssetType, AssetCategory, GrowthRates } from '@/types';

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'gold', label: 'Gold' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
];

export const ASSET_COLORS: Record<AssetType, string> = {
  real_estate: '#2E7D32',
  gold: '#F9A825',
  stocks: '#1565C0',
  mutual_funds: '#7B1FA2',
};

export const ASSET_LABELS: Record<AssetType, string> = {
  real_estate: 'Real Estate',
  gold: 'Gold',
  stocks: 'Stocks',
  mutual_funds: 'Mutual Funds',
};

export const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'fixed_rate', label: 'Fixed Rate' },
  { value: 'equity', label: 'Equity' },
  { value: 'retirals', label: 'Retirals' },
];

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  fixed_rate: '#1565C0', // blue
  equity: '#F9A825', // yellow
  retirals: '#2E7D32', // green
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  fixed_rate: 'Fixed Rate',
  equity: 'Equity',
  retirals: 'Retirals',
};

export const SUBTYPES: Record<AssetCategory, { value: string; label: string }[]> = {
  fixed_rate: [
    { value: 'cash_in_bank', label: 'Cash in bank' },
    { value: 'fixed_deposit', label: 'Fixed deposit' },
    { value: 'debt_funds', label: 'Debt funds' },
  ],
  equity: [
    { value: 'indian_stocks', label: 'Indian stocks' },
    { value: 'indian_mutual_funds', label: 'Indian mutual funds' },
    { value: 'balance_advantage_funds', label: 'Balance advantage funds' },
    { value: 'us_stocks', label: 'US stocks' },
  ],
  retirals: [
    { value: 'provident_fund', label: 'Provident fund' },
    { value: 'npf', label: 'NPF' },
  ],
};

export const SUBTYPE_LABELS: Record<string, string> = Object.values(SUBTYPES)
  .flat()
  .reduce<Record<string, string>>((acc, { value, label }) => {
    acc[value] = label;
    return acc;
  }, {});

export const DEFAULT_GROWTH_RATES: GrowthRates = {
  real_estate: 8,
  gold: 10,
  stocks: 12,
  mutual_funds: 12,
};

export const TIME_RANGES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: 0 },
] as const;

export const USERS = ['kapeel', 'wife'] as const;
export type User = (typeof USERS)[number];
