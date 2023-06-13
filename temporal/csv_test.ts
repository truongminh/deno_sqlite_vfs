import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { TemporalDataFromCSV } from "./csv.ts";

Deno.test("CSV Test", () => {
    interface TestCase {
        text: string;
        columns: string[];
        result: number[][];
    }

    const cases: TestCase[] = [{
        text: 'ts,m1,m2\n1,1.1,1.2\n2,2.1,2.2',
        columns: ['ts', 'm1', 'm2'],
        result: [[1, 1.1, 1.2],[2, 2.1, 2.2]]
    }];

    for (const c of cases) {
        const result = TemporalDataFromCSV(c.text, c.columns);
        // console.log(result);
        assertEquals(result, c.result);
    }
});
