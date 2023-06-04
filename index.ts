import * as sqlite from './sqlite/index.ts';

import { MemoryVFS } from './memory_vfs.ts';
import { FileVFS } from './file_vfs.ts';

sqlite.RegisterVFS(new MemoryVFS());
sqlite.RegisterVFS(new FileVFS());

const { sql } = await sqlite.Open('sample.db', 'file');

const queries = `
CREATE TABLE IF NOT EXISTS tbl (x PRIMARY KEY, y);
REPLACE INTO tbl VALUES ('foo', 1), ('bar', 2);
`.trim();

console.log(await sql`${queries}`);
let time = Date.now();
const results = await sql`SELECT * FROM tbl`;
time = Date.now() - time;
console.log(`>> ${time / 1000} seconds`);
console.log(results);


