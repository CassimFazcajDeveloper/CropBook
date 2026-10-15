import type { SQLiteBindValue } from 'expo-sqlite';
import type {
  Account,
  Activity,
  Allocation,
  Crop,
  Harvest,
  InputPurchase,
  New,
  Sale,
} from '../types';
import { getDb } from './client';

export interface Repo<T extends { id: number }> {
  list(): Promise<T[]>;
  insert(row: New<T>): Promise<T>;
  restore(row: T): Promise<void>;
  update(row: T): Promise<void>;
  remove(id: number): Promise<void>;
}

function makeRepo<T extends { id: number }>(
  table: string,
  columns: readonly (keyof New<T> & string)[],
  orderBy: string,
): Repo<T> {
  const cols = columns.join(', ');
  const marks = columns.map(() => '?').join(', ');
  const sets = columns.map((c) => `${c} = ?`).join(', ');
  const values = (row: New<T>) => columns.map((c) => row[c] as SQLiteBindValue);

  return {
    list: () => getDb().getAllAsync<T>(`SELECT * FROM ${table} ORDER BY ${orderBy}`),
    async insert(row) {
      const res = await getDb().runAsync(`INSERT INTO ${table} (${cols}) VALUES (${marks})`, values(row));
      return { ...row, id: res.lastInsertRowId } as T;
    },
    async restore(row) {
      await getDb().runAsync(`INSERT INTO ${table} (id, ${cols}) VALUES (?, ${marks})`, [
        row.id,
        ...values(row),
      ]);
    },
    async update(row) {
      await getDb().runAsync(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...values(row), row.id]);
    },
    async remove(id) {
      await getDb().runAsync(`DELETE FROM ${table} WHERE id = ?`, id);
    },
  };
}

export const cropsRepo = makeRepo<Crop>('crops', ['name', 'emoji', 'createdAt'], 'createdAt, id');

export const inputsRepo = makeRepo<InputPurchase>(
  'input_purchases',
  ['cropId', 'item', 'quantity', 'unit', 'cost', 'datePurchased', 'note'],
  'datePurchased DESC, id DESC',
);

export const activitiesRepo = makeRepo<Activity>(
  'activities',
  ['cropId', 'type', 'description', 'cost', 'date', 'note'],
  'date DESC, id DESC',
);

export const harvestsRepo = makeRepo<Harvest>(
  'harvests',
  ['cropId', 'date', 'quantity', 'unit', 'note'],
  'date DESC, id DESC',
);

export const salesRepo = makeRepo<Sale>(
  'sales',
  ['cropId', 'date', 'quantity', 'unit', 'pricePerUnit', 'total', 'buyer', 'note'],
  'date DESC, id DESC',
);

export const accountsRepo = makeRepo<Account>(
  'accounts',
  ['name', 'targetPercent', 'sortOrder'],
  'sortOrder, id',
);

export const allocationsRepo = makeRepo<Allocation>(
  'allocations',
  ['accountId', 'amount', 'date', 'saleId', 'note'],
  'date DESC, id DESC',
);

export const settingsRepo = {
  async get(key: string): Promise<string | null> {
    const row = await getDb().getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
    return row?.value ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    await getDb().runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      value,
    );
  },
};

export async function inTransaction(task: () => Promise<void>) {
  await getDb().withTransactionAsync(task);
}
