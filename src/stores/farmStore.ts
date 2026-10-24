import { create } from 'zustand';
import {
  activitiesRepo,
  cropsRepo,
  harvestsRepo,
  inputsRepo,
  salesRepo,
  type Repo,
} from '../db/repository';
import type { Activity, Crop, Harvest, InputPurchase, New, Sale, Totals } from '../types';

export type RecordKind = 'inputs' | 'activities' | 'harvests' | 'sales';

type RecordMap = {
  inputs: InputPurchase;
  activities: Activity;
  harvests: Harvest;
  sales: Sale;
};

const repos: { [K in RecordKind]: Repo<RecordMap[K]> } = {
  inputs: inputsRepo,
  activities: activitiesRepo,
  harvests: harvestsRepo,
  sales: salesRepo,
};

const dateOf = (r: RecordMap[RecordKind]) => ('datePurchased' in r ? r.datePurchased : r.date);

function sortNewest<T extends RecordMap[RecordKind]>(rows: T[]): T[] {
  return [...rows].sort((a, b) => dateOf(b).localeCompare(dateOf(a)) || b.id - a.id);
}

interface FarmState {
  crops: Crop[];
  inputs: InputPurchase[];
  activities: Activity[];
  harvests: Harvest[];
  sales: Sale[];
  loadAll: () => Promise<void>;
  addCrop: (name: string, emoji: string) => Promise<Crop>;
  updateCrop: (crop: Crop) => Promise<void>;
  deleteCrop: (id: number) => Promise<void>;
  addRecord: <K extends RecordKind>(kind: K, row: New<RecordMap[K]>) => Promise<RecordMap[K]>;
  updateRecord: <K extends RecordKind>(kind: K, row: RecordMap[K]) => Promise<void>;
  deleteRecord: <K extends RecordKind>(kind: K, row: RecordMap[K]) => Promise<void>;
  restoreRecord: <K extends RecordKind>(kind: K, row: RecordMap[K]) => Promise<void>;
}

export const useFarmStore = create<FarmState>((set, get) => ({
  crops: [],
  inputs: [],
  activities: [],
  harvests: [],
  sales: [],

  async loadAll() {
    const [crops, inputs, activities, harvests, sales] = await Promise.all([
      cropsRepo.list(),
      inputsRepo.list(),
      activitiesRepo.list(),
      harvestsRepo.list(),
      salesRepo.list(),
    ]);
    set({ crops, inputs, activities, harvests, sales });
  },

  // Every write re-reads from SQLite so the store always mirrors what is on disk.
  async addCrop(name, emoji) {
    const crop = await cropsRepo.insert({ name: name.trim(), emoji, createdAt: new Date().toISOString() });
    set({ crops: await cropsRepo.list() });
    return crop;
  },

  async updateCrop(crop) {
    await cropsRepo.update(crop);
    set({ crops: await cropsRepo.list() });
  },

  async deleteCrop(id) {
    await cropsRepo.remove(id);
    // Deleting a crop cascades to its records, so reload everything.
    await get().loadAll();
  },

  async addRecord(kind, row) {
    if (!Number.isInteger(row.cropId)) throw new Error('No crop selected. Go back to the crop and try again.');
    const saved = await repos[kind].insert(row);
    await reloadKind(set, kind);
    return saved;
  },

  async updateRecord(kind, row) {
    await repos[kind].update(row);
    await reloadKind(set, kind);
  },

  async deleteRecord(kind, row) {
    await repos[kind].remove(row.id);
    await reloadKind(set, kind);
  },

  async restoreRecord(kind, row) {
    await repos[kind].restore(row);
    await reloadKind(set, kind);
  },
}));

async function reloadKind(set: (s: Partial<FarmState>) => void, kind: RecordKind) {
  const rows = await (repos[kind] as Repo<RecordMap[RecordKind]>).list();
  set({ [kind]: sortNewest(rows) } as Partial<FarmState>);
}

export function sumBy<T>(rows: T[], pick: (r: T) => number): number {
  return rows.reduce((acc, r) => acc + pick(r), 0);
}

export function cropTotals(
  s: Pick<FarmState, 'inputs' | 'activities' | 'sales'>,
  cropId?: number,
): Totals {
  const match = <T extends { cropId: number }>(r: T) => cropId === undefined || r.cropId === cropId;
  const sales = sumBy(s.sales.filter(match), (r) => r.total);
  const costs =
    sumBy(s.inputs.filter(match), (r) => r.cost) + sumBy(s.activities.filter(match), (r) => r.cost);
  return { sales, costs, net: sales - costs };
}
