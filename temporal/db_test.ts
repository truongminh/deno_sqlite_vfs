import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { TemporalDB } from "./db.ts";

Deno.test("TemporalDB Test", { permissions: { write: true, read: true } }, async (t) => {
    const metrics = ["wat"];
    const db = new TemporalDB("./test.db", metrics);
    await db.Open();
    await db.Add([[1, 1], [2, 2]]);
    const { rows } = await db.Range(0, 1);
    assertEquals(rows, [[1, 1], [2, 2]]);
    await db.Close();
    Deno.removeSync("./test.db");
});
