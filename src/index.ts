import { Hono } from "hono";

import type { Env } from "./types/env";
import { setupLogger } from "./utils/logger";
import { handleInboundEmail } from "./email/inbound";
import { handleQueueBatch } from "./queue/consumer";

export const app = new Hono<{ Bindings: Env }>();

app.use("*", async (_, next) => {
    await setupLogger();
    await next();
});

console.log("hello world");

export default {
    fetch: app.fetch,

    async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
        ctx.waitUntil(
            (async () => {
                await setupLogger();
                await handleInboundEmail(message, env);
            })(),
        );
    },

    async queue(batch: MessageBatch<unknown>, env: Env, ctx: ExecutionContext): Promise<void> {
        ctx.waitUntil(
            (async () => {
                await setupLogger();
                await handleQueueBatch(batch, env);
            })(),
        );
    },
};
