import { green } from "https://deno.land/std@0.152.0/fmt/colors.ts";
import app from "./app.ts";
import config from "./config.ts";

console.log(green(`listening on port ${config.PORT}`));
await app.listen({ port: config.PORT });
