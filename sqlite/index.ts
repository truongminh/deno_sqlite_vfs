import SQLiteESMFactory from './wa-sqlite.mjs';
import * as SQLite from './sqlite-api.js';
import { Base } from './VFS.ts';
import { createTag } from './tag.ts';

const SQLiteModule = await SQLiteESMFactory();
const sqlite3 = SQLite.Factory(SQLiteModule);

export function RegisterVFS(vfs: Base) {
    sqlite3.vfs_register(vfs as any);
}

export async function Open(db_name: string, vfs_name: string) {
    const db = await sqlite3.open_v2(
        db_name,
        SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE | SQLite.SQLITE_OPEN_URI,
        vfs_name
    );
    const sql = createTag(sqlite3, db);
    return { sql };
}