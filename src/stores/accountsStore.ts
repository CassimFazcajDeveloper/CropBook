import { create } from 'zustand';
import { accountsRepo, allocationsRepo, inTransaction } from '../db/repository';
import type { Account, Allocation, New } from '../types';

interface AccountsState {
  accounts: Account[];
  allocations: Allocation[];
  load: () => Promise<void>;
  saveAccounts: (accounts: Account[]) => Promise<void>;
  addAllocations: (rows: New<Allocation>[]) => Promise<void>;
  deleteAllocation: (row: Allocation) => Promise<void>;
  restoreAllocation: (row: Allocation) => Promise<void>;
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  allocations: [],

  async load() {
    const [accounts, allocations] = await Promise.all([accountsRepo.list(), allocationsRepo.list()]);
    set({ accounts, allocations });
  },

  async saveAccounts(accounts) {
    await inTransaction(async () => {
      for (const a of accounts) await accountsRepo.update(a);
    });
    set({ accounts: [...accounts].sort((a, b) => a.sortOrder - b.sortOrder) });
  },

  async addAllocations(rows) {
    await inTransaction(async () => {
      for (const r of rows) await allocationsRepo.insert(r);
    });
    set({ allocations: await allocationsRepo.list() });
  },

  async deleteAllocation(row) {
    await allocationsRepo.remove(row.id);
    set({ allocations: get().allocations.filter((a) => a.id !== row.id) });
  },

  async restoreAllocation(row) {
    await allocationsRepo.restore(row);
    set({ allocations: await allocationsRepo.list() });
  },
}));

export function balanceOf(allocations: Allocation[], accountId: number): number {
  return allocations.reduce((acc, a) => (a.accountId === accountId ? acc + a.amount : acc), 0);
}

export function splitByPercent(amount: number, accounts: Account[]): number[] {
  const raw = accounts.map((a) => Math.floor((amount * a.targetPercent) / 100));
  let remainder = amount - raw.reduce((x, y) => x + y, 0);
  const order = accounts
    .map((a, i) => ({ i, pct: a.targetPercent, frac: (amount * a.targetPercent) % 100 }))
    .filter((o) => o.pct > 0)
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; remainder > 0 && order.length > 0; k = (k + 1) % order.length, remainder--) {
    raw[order[k].i] += 1;
  }
  return raw;
}
