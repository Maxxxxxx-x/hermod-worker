import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

import { getDb } from "../db/client";
import { createLogger } from "../logger/logger";
import { getValidApiKeyByHash, updateLastUsed } from "../repository/api-key.repository";
import { KeyPrincipal } from "../schema/api-key.schema";
import { validateChecksum } from "../utils/crc";
import { hashApiKey } from "../utils/hash-key";
import { isIpInCidr } from "../utils/ip-check";

const logger = createLogger("middleware/auth-api-key");

export const authenticateApiKey = createMiddleware(async (ctx: Context, next: Next) => {
    const authHeader = ctx.req.header("Authorization");
    const rayId = ctx.var.requestId ?? "not-found";

    if (!authHeader) {
        logger.warn("missing auth header in http request", { rayId });
        return ctx.json({ error: "Missing Auth header" }, 401);
    }

    const apiKey = authHeader.replace(/^Bearer\s+/i, "");

    if (!apiKey) {
        logger.warn("bearer token is empty", { rayId });
        return ctx.json({ error: "Missing Bearer apiKey" }, 401);
    }

    if (!validateChecksum(apiKey)) {
        logger.warn("invalid token checksum format", { rayId });
        return ctx.json({ error: "Unauthorized" }, 401);
    }

    const db = getDb(ctx);

    if (!db) {
        logger.error("cannot get database object", { rayId });
        return ctx.json({ error: "Internal server error" }, 500);
    }

    const keyRecord = await getValidApiKeyByHash(db, await hashApiKey(apiKey));

    if (!keyRecord) {
        logger.warn("invalid, expired, or inactive api key provided", { rayId });
        return ctx.json({ error: "Unauthorized" }, 401);
    }

    if (keyRecord.allowedIps) {
        const clientIp =
            ctx.req.header("cf-connecting-ip") || ctx.req.header("x-forwarded-for") || "";
        const allowedRules = keyRecord.allowedIps.split(",").map((rule) => rule.trim());

        let isAllowed = false;

        for (const allowedIp of allowedRules) {
            if (isIpInCidr(clientIp, allowedIp)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            logger.warn("client ip address blocked by key policy", {
                rayId,
                clientIp,
                keyId: keyRecord.id,
                allowedIps: keyRecord.allowedIps,
            });
            return ctx.json({ error: "forbidden: ip not allowed" }, 403);
        }
    }

    const principal: KeyPrincipal = {
        id: keyRecord.id,
        subPrefix: keyRecord.subPrefix,
        keyName: keyRecord.keyName,
        allowedIps: keyRecord.allowedIps,
        allowedDomains: keyRecord.allowedDomains,
        allowedSenders: keyRecord.allowedSenders,
    };

    ctx.set("principal", principal);
    ctx.executionCtx.waitUntil(updateLastUsed(db, keyRecord.id));

    return await next();
});
