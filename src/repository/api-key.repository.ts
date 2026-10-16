import * as vb from "valibot";

import { createLogger } from "../logger/logger";
import { ApiKeySchema, type ApiKeyD1Record, type ApiKey } from "../schema/api-key.schema";

const logger = createLogger("repository/api-key");

export class DatabaseError extends Error {
    public readonly cause?: unknown;
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "DatabaseError";
        this.cause = cause;
    }
}

export class SchemaValidationError extends Error {
    public readonly keyId: string;
    public readonly issues?: unknown;
    constructor(message: string, keyId: string, issues?: unknown) {
        super(message);
        this.name = "SchemaValidationError";
        this.keyId = keyId;
        this.issues = issues;
    }
}

async function fetchAndParseKey(
    stmt: D1PreparedStatement,
    identifierType: string
): Promise<ApiKey | null> {
    const record = await stmt.first<ApiKeyD1Record>();

    if (!record) {
        logger.warn("no record was found with given { identifierType }", { identifierType });
        return null;
    }

    const parsedKey = vb.safeParse(ApiKeySchema, record);

    if (!parsedKey.success) {
        logger.error("failed to safely parse key record { keyId }", {
            keyId: record.id,
            error: parsedKey.issues,
        });
        throw new SchemaValidationError(
            "failed to validate api key schema",
            record.id,
            parsedKey.issues
        );
    }

    return parsedKey.output;
}

async function fetchAndParseKeyList(stmt: D1PreparedStatement): Promise<ApiKey[] | null> {
    const result = await stmt.all<ApiKeyD1Record>();

    if (!result.success) {
        logger.error("failed to query database", { error: result.error });
        throw new DatabaseError("failed to query database for api keys", { error: result.error });
    }

    if (!result.results?.length) {
        return null;
    }

    const apiKeys: ApiKey[] = [];

    for (const record of result.results) {
        const parsedKey = vb.safeParse(ApiKeySchema, record);

        if (!parsedKey.success) {
            logger.error("failed to safely parse key record { keyId }", {
                keyId: record.id,
                error: parsedKey.issues,
            });

            throw new SchemaValidationError(
                "failed to validate schema for api key",
                record.id,
                parsedKey.issues
            );
        }

        apiKeys.push(parsedKey.output);
    }

    return apiKeys.length > 0 ? apiKeys : null;
}

export async function getApiKeyByHash(db: D1Database, keyHash: string): Promise<ApiKey | null> {
    const stmt = db.prepare("SELECT * FROM api_keys WHERE key_hash = ? LIMIT 1;").bind(keyHash);
    return fetchAndParseKey(stmt, "hash");
}

export async function getValidApiKeyByHash(
    db: D1Database,
    keyHash: string
): Promise<ApiKey | null> {
    const stmt = db
        .prepare(
            "SELECT * FROM api_keys WHERE key_hash = ? AND status = 0 AND (expires_at IS NULL OR expires_at >= STRFTIME('%Y-%m-%dT%H:%M:%SZ')) LIMIT 1;"
        )
        .bind(keyHash);
    return fetchAndParseKey(stmt, "hash");
}

export async function getApiKeyById(db: D1Database, keyId: string): Promise<ApiKey | null> {
    const stmt = db.prepare("SELECT * FROM api_keys WHERE id = ? LIMIT 1;").bind(keyId);
    return fetchAndParseKey(stmt, "id");
}

export async function getValidApiKeyById(db: D1Database, keyId: string): Promise<ApiKey | null> {
    const stmt = db
        .prepare(
            "SELECT * FROM api_keys WHERE id = ? AND status = 0 AND (expires_at IS NULL OR expires_at >= STRFTIME('%Y-%m-%dT%H:%M:%S')) LIMIT ;"
        )
        .bind(keyId);

    return fetchAndParseKey(stmt, "id");
}

export async function getAllApiKeys(db: D1Database): Promise<ApiKey[] | null> {
    const stmt = db.prepare("SELECT * FROM api_keys;");
    return fetchAndParseKeyList(stmt);
}

export async function getAllActiveApiKeys(db: D1Database): Promise<ApiKey[] | null> {
    const stmt = db.prepare(
        "SELECT * FROM api_keys WHERE status = 0 AND (expires_at IS NULL OR expires_at >= STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now'));"
    );
    return fetchAndParseKeyList(stmt);
}

export async function getInactiveApiKeys(db: D1Database): Promise<ApiKey[] | null> {
    const stmt = db.prepare(
        "SELECT * FROM api_keys WHERE status = 1 AND (expires_at IS NOT NULL AND expires_at < STRFTIEM('%Y-%m-%dT%H:%M:SZ', 'now'));"
    );

    return fetchAndParseKeyList(stmt);
}

export async function markExpiredKeys(db: D1Database): Promise<void> {
    const stmt = db.prepare(
        "UPDATE api_keys SET status = 2 WHERE status = 0 AND expires_at IS NOT NULL AND expires_at < STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now');"
    );

    await stmt.run();
}

export async function updateLastUsed(db: D1Database, keyId: string): Promise<void> {
    const stmt = db
        .prepare(
            "UPDATE api_keys SET last_used = STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?"
        )
        .bind(keyId);

    await stmt.run();
}
