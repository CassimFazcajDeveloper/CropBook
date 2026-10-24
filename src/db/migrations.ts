import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_V1, SCHEMA_V2 } from './schema';

async function isEmpty(db: SQLiteDatabase, table: string) {
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return (row?.n ?? 0) === 0;
}

// Defaults only go into empty tables, so a re-run never duplicates the user's data.
async function seedV1(db: SQLiteDatabase) {
  const now = new Date().toISOString();
  if (await isEmpty(db, 'crops')) {
    for (const [name, emoji] of [
      ['Tomatoes', '🍅'],
      ['Onions', '🧅'],
      ['Maize', '🌽'],
    ]) {
      await db.runAsync('INSERT INTO crops (name, emoji, createdAt) VALUES (?, ?, ?)', name, emoji, now);
    }
  }
  if (!(await isEmpty(db, 'accounts'))) return;
  const accounts: [string, number][] = [
    ['Operations', 50],
    ['Profit', 10],
    ['My Salary', 30],
    ['Tax & Reserve', 10],
  ];
  for (let i = 0; i < accounts.length; i++) {
    await db.runAsync(
      'INSERT INTO accounts (name, targetPercent, sortOrder) VALUES (?, ?, ?)',
      accounts[i][0],
      accounts[i][1],
      i,
    );
  }
}

const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  async (db) => {
    await db.execAsync(SCHEMA_V1);
    await seedV1(db);
  },
  async (db) => {
    await db.execAsync(SCHEMA_V2);
  },
];

export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    const step = MIGRATIONS[version];
    const next = version + 1;
    // Bump user_version in the same transaction so a step and its version commit together.
    await db.withExclusiveTransactionAsync(async (tx) => {
      await step(tx);
      await tx.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
