import { load } from "https://deno.land/std@0.177.1/dotenv/mod.ts";

const config = await load();
const getKey = (key: string) => config[key] || Deno.env.get(key) || '';
const DB_DIR = getKey('DB_DIR');
const PORT = +getKey('PORT') || 2345;

export default {
    PORT,
    DB_DIR
}
