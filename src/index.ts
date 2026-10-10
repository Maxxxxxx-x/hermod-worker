import { type Context, Hono } from "hono";
import { type RequestIdVariables, requestId } from "hono/request-id";

import { setupLogger } from "./logger/logger";
import { logger } from "./middlewares/logger.middleware";
import { v1 } from "./routes";

await setupLogger();

const app = new Hono<{
    Bindings: CloudflareBindings;
    Variables: RequestIdVariables;
}>();

app.use(
    "*",
    requestId({
        generator: (ctx: Context) => ctx.req.header("cf-ray") ?? crypto.randomUUID(),
    })
);

app.use(logger());

app.route("/v1", v1);

export default app;
