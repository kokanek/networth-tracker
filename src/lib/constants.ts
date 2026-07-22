import type { AssetCategory } from '@/types';

export const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'fixed_rate', label: 'Fixed Rate' },
  { value: 'equity', label: 'Equity' },
  { value: 'retirals', label: 'Retirals' },
  { value: 'debt', label: 'Debt' },
];

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  fixed_rate: '#1565C0', // blue
  equity: '#F9A825', // yellow
  retirals: '#2E7D32', // green
  debt: '#757575', // gray
};

// Shade of gray used only in the pie chart for the debt component derived from
// equity balance advantage funds, to distinguish it from explicitly invested debt.
export const DEBT_FROM_EQUITY_COLOR = '#BDBDBD'; // lighter gray

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  fixed_rate: 'Fixed Rate',
  equity: 'Equity',
  retirals: 'Retirals',
  debt: 'Debt',
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
  debt: [
    { value: 'liquid_fund', label: 'Liquid fund' },
    { value: 'bonds', label: 'Bonds' },
  ],
};

export const SUBTYPE_LABELS: Record<string, string> = Object.values(SUBTYPES)
  .flat()
  .reduce<Record<string, string>>((acc, { value, label }) => {
    acc[value] = label;
    return acc;
  }, {});

export const TIME_RANGES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: 0 },
] as const;

export const USERS = ['Kapeel', 'Shail'] as const;
export type User = (typeof USERS)[number];
