import * as v from "valibot";

import { createLogger } from "../logger/logger";
import { ApiKeySchema, type ApiKey } from "../schema/api-key.schema";

const logger = createLogger("repository/api-key");

export async function getApiKeyByHash(db: D1Database, keyHash: string): Promise<ApiKey | null> {
    const dbRecord = await db
        .prepare("SELECT * FROM api_keys WHERE key_hash = ? LIMIT 1;")
        .bind(keyHash)
        .first();

    if (!dbRecord) {
        logger.warn("no records was found with given hash");
        return null;
    }

    const parsedKey = v.safeParse(ApiKeySchema, dbRecord);

    if (!parsedKey.success) {
        logger.error("failed to safely parse key record", { error: parsedKey.issues });
        return null;
    }

    return parsedKey.output;
}

export async function getApiKeyById(db: D1Database, keyId: string): Promise<ApiKey | null> {
    const dbRecord = await db
        .prepare("SELECT * FROM api_keys WHERE id= ? LIMIT 1;")
        .bind(keyId)
        .first();

    if (!dbRecord) {
        logger.warn("no records was found with given id");
        return null;
    }

    const parsedKey = v.safeParse(ApiKeySchema, dbRecord);

    if (!parsedKey.success) {
        logger.error("failed to safely parse key record", { error: parsedKey.issues });
        return null;
    }

    return parsedKey.output;
}
