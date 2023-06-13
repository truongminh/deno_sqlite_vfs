import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

// console.log([...router.values()].map(v => [v.path, v.methods.join(",")].join(" ")));


export default router;
