import { TemporalDB } from "./temporal/db.ts";

const db_map = new Map<string, TemporalDB>();

function mustGetDB(name: string) {
    const db = db_map.get(name);
    if (!db) {
        throw new Error(`db ${name} not exist`);
    }
    return db;
}

export async function NewDB(name: string, metrics: string[]) {
    if (db_map.has(name)) {
        throw new Error(`db ${name} existed`);
    }
    const db = new TemporalDB(name, metrics);
    await db.Open();
    db_map.set(name, db);
    return 1;
}

export async function ImportCSV(db_name: string, csv: string) {
    
}