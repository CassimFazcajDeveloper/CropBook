import * as SQLite from 'expo-sqlite';
import { migrate } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;
let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export function initDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return Promise.resolve(db);
  if (!opening) {
    opening = (async () => {
      const conn = await SQLite.openDatabaseAsync('cropbook.db');
      await conn.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      await migrate(conn);
      db = conn;
      return conn;
    })();
  }
  return opening;
}

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialised');
  return db;
}
