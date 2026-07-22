export type AssetCategory = 'fixed_rate' | 'equity' | 'retirals' | 'debt';

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
