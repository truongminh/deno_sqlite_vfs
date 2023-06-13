import * as sqlite from '../sqlite/index.ts';
import { FileVFS } from '../vfs/file_vfs.ts';
import { S3VFS } from '../vfs/s3_vfs.ts';

interface TemporalRecord {
    id: number;
    [key: string]: number;
}

const s3VFS = new S3VFS();
sqlite.RegisterVFS(s3VFS);

const fileVFS = new FileVFS();
sqlite.RegisterVFS(fileVFS);

export class TemporalDB {
    constructor(
        private readonly name: string,
        private readonly metrics: string[],
        private readonly driver = "memory",
    ) {
        this.columns = ["ts", ...metrics];
    }

    async Open() {
        const { sql, db } = await sqlite.Open(this.name, this.driver);
        this.sql = sql;
        this.db = db;
        const metricstr = this.metrics.map(v => `${v} REAL`).join(',');
        await sql`CREATE TABLE IF NOT EXISTS data(ts INTEGER PRIMARY KEY, ${metricstr})`;
    }

    async Add(rows: number[][]) {
        const colstr = this.columns.join(',');
        const rowstr = rows.map(row => `(${row.join(',')})`).join(',');
        await this.sql`INSERT INTO data(${colstr}) VALUES ${rowstr}`;
    }

    async Range(from: number, to: number) {
        const [{ columns, rows }] = await this.sql`SELECT ts, wat FROM data`;
        return { columns, rows };
    }

    async Close() {
        await sqlite.Close(this.db);
    }

    get #db_name() {
        return `temporal_${this.name}.db`;
    };

    // @ts-ignore: sql tag
    private sql: sqlite.SQLQueryTag;

    // @ts-ignore: db
    private db: number;

    private columns: string[] = [];
}
