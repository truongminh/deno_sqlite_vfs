
function CSVtoArray(text: any) {
    let ret = [''], i = 0, p = '', s = true;
    for (let l in text) {
        l = text[l];
        if ('"' === l) {
            s = !s;
            if ('"' === p) {
                ret[i] += '"';
                l = '-';
            } else if ('' === p)
                l = '-';
        } else if (s && ',' === l)
            l = ret[++i] = '';
        else
            ret[i] += l;
        p = l;
    }
    return ret;
}

export function TemporalDataFromCSV(text: string, columns: string[]) {
    const [header, ...lines] = text.split('\n');
    const colMap = new Map<number, number>();
    {
        const arr = CSVtoArray(header);
        for (let ci = 0; ci < columns.length; ci++) {
            const c = columns[ci];
            const ai = arr.indexOf(c);
            if (ai >= 0) {
                colMap.set(ai, ci);
            }
        }
    }
    const rows: number[][] = [];
    for (const line of lines) {
        const arr = CSVtoArray(line);
        const row: number[] = [];
        for (let ai = 0; ai < arr.length; ai++) {
            const v = +arr[ai];
            if (isNaN(v)) {
                continue;
            }
            if (colMap.has(ai)) {
                const ci = colMap.get(ai) as number;
                row[ci] = v;
            }
        }
        rows.push(row);
    }
    return rows;
}