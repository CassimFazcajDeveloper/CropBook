export interface Crop {
  id: number;
  name: string;
  emoji: string;
  createdAt: string;
}

export interface InputPurchase {
  id: number;
  cropId: number;
  item: string;
  quantity: number;
  unit: string;
  cost: number;
  datePurchased: string;
  note: string;
}

export const ACTIVITY_TYPES = [
  'Land tilling',
  'Planting',
  'Irrigation',
  'Weeding',
  'Spraying',
  'Fertiliser application',
  'Harvesting labour',
  'Other',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Activity {
  id: number;
  cropId: number;
  type: ActivityType;
  description: string;
  cost: number;
  date: string;
  note: string;
}

export const HARVEST_UNITS = ['kg', 'bags', 'crates', 'pails'] as const;
export type HarvestUnit = (typeof HARVEST_UNITS)[number];

export interface Harvest {
  id: number;
  cropId: number;
  date: string;
  quantity: number;
  unit: HarvestUnit;
  note: string;
}

export interface Sale {
  id: number;
  cropId: number;
  date: string;
  quantity: number;
  unit: HarvestUnit;
  pricePerUnit: number;
  total: number;
  buyer: string;
  note: string;
}

export interface Account {
  id: number;
  name: string;
  targetPercent: number;
  sortOrder: number;
}

export interface Allocation {
  id: number;
  accountId: number;
  amount: number;
  date: string;
  saleId: number | null;
  note: string;
}

export interface Totals {
  sales: number;
  costs: number;
  net: number;
}

export type New<T extends { id: number }> = Omit<T, 'id'>;
