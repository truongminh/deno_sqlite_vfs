import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import * as sqlite from './sqlite/index.ts';
import { MemoryVFS } from './memory_vfs.ts';

Deno.test("SQLite Memory VFS", { permissions: { read: true } }, async (t) => {
    sqlite.RegisterVFS(new MemoryVFS());
    const { sql } = await sqlite.Open('sample.db', 'memory');
    await t.step("create table", async () => {
        const queries = `
            CREATE TABLE IF NOT EXISTS tbl (x PRIMARY KEY, y);
            REPLACE INTO tbl VALUES ('foo', 1), ('bar', 2);
            `.trim();
        await sql`${queries}`;
    });
    await t.step("select value", async () => {
        const [{ columns, rows }] = await sql`SELECT x, y FROM tbl`;
        assertEquals(columns, ["x", "y"]);
        assertEquals(rows, [["foo", 1], ["bar", 2]]);
    });
});