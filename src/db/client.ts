import type { Context } from "hono";

export type AppBindings = {
    Bindings: {
        DB: D1Database;
    };
};

export function getDb(ctx: Context<AppBindings>): D1Database | null {
    return ctx.env?.DB ?? null;
}
