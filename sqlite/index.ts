import SQLiteESMFactory from './wa-sqlite.mjs';
import SQLiteAsyncESMFactory from './wa-sqlite-async.mjs';

import * as SQLite from './sqlite-api.js';
import { Base } from './VFS.ts';
import { createTag, SQLiteResults } from './tag.ts';
import { SQLiteCompatibleType } from './interface.ts';
import { MemoryVFS } from './memory_vfs.ts';
import { MemoryAsyncVFS } from './memory_async_vfs.js';

const SQLiteModule = await SQLiteAsyncESMFactory();
const sqlite3 = SQLite.Factory(SQLiteModule);

export type SQLQueryTag = (
    sql: string | TemplateStringsArray,
    ...values: string[] | SQLiteCompatibleType[][][]
) => Promise<SQLiteResults[]>;

export function RegisterVFS(vfs: Base) {
    sqlite3.vfs_register(vfs as any);
}

export async function Open(db_name: string, vfs_name: string) {
    const db = await sqlite3.open_v2(
        db_name,
        SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE | SQLite.SQLITE_OPEN_URI,
        vfs_name
    );
    const sql: SQLQueryTag = createTag(sqlite3, db);
    return { sql, db };
}

export async function Close(db: number) {
    await sqlite3.close(db);
}

RegisterVFS(new MemoryAsyncVFS() as any);
