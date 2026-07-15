export type AssetType = 'real_estate' | 'gold' | 'stocks' | 'mutual_funds';

export type AssetCategory = 'fixed_rate' | 'equity' | 'retirals';

export interface Asset {
  category: AssetCategory;
  subtype: string;
  identifier: string;
  value: number;
}

export interface Snapshot {
  _id: string;
  date: string;
  assets: Asset[];
  totalNetWorth: number;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthRates {
  real_estate: number;
  gold: number;
  stocks: number;
  mutual_funds: number;
}

export interface Settings {
  userId: string;
  growthRates: GrowthRates;
  updatedAt?: string;
}
