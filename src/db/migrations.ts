import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_V1, SCHEMA_V2 } from './schema';

async function seedV1(db: SQLiteDatabase) {
  const now = new Date().toISOString();
  for (const [name, emoji] of [
    ['Tomatoes', '🍅'],
    ['Onions', '🧅'],
    ['Maize', '🌽'],
  ]) {
    await db.runAsync('INSERT INTO crops (name, emoji, createdAt) VALUES (?, ?, ?)', name, emoji, now);
  }
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
    await db.withExclusiveTransactionAsync(async (tx) => {
      await step(tx);
    });
    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}
