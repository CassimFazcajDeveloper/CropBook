import * as SQLite from 'expo-sqlite';
import { migrate } from './migrations';

// The only place the database is opened. The promise is cached so every caller
// shares one native connection; it is never closed for the life of the app.
let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!opening) {
    opening = (async () => {
      const db = await SQLite.openDatabaseAsync('cropbook.db');
      await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      await migrate(db);
      return db;
    })().catch((e: unknown) => {
      opening = null;
      throw e;
    });
  }
  return opening;
}
