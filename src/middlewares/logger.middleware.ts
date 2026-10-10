import type { Context, Next, MiddlewareHandler } from "hono";

import { createLogger } from "../logger/logger";

const HTTP_STATUS = {
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export function logger(): MiddlewareHandler {
    const logger = createLogger("middleware/request-logger");

    return async (ctx: Context, next: Next) => {
        const startTime = performance.now();
        const { method, path } = ctx.req;
        const clientIp =
            ctx.req.header("x-forwarded-for") ?? ctx.req.header("cf-connecting-ip") ?? "unknown";

        const userAgent = ctx.req.header("User-Agent") ?? "unknown";
        const contentLength = ctx.req.header("Content-Length") ?? "0";
        const rayId = ctx.var.requestId ?? "not-found";

        try {
            await next();
        } finally {
            const latency = Math.round(performance.now() - startTime);
            const status = ctx.res.status;

            const rateLimitRemaining = ctx.res.headers.get("x-ratelimit-remaining") ?? "N/A";

            const logData = {
                rayId,
                method,
                path,
                latency,
                clientIp,
                userAgent,
                contentLength,
                rateLimitRemaining,
            };

            if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                logger.error("handled request", logData);
            } else if (status >= HTTP_STATUS.BAD_REQUEST) {
                logger.warn("handled request", logData);
            } else {
                logger.info("handled request", logData);
            }
        }
    };
}
