import * as vb from "valibot";

const STRING_MIN_LENGTH = 1;

const STATUS_MIN_VALUE = 0;
const STATUS_MAX_VALUE = 4;

const DOMAIN_REGEX = /^(?:\*\.)?(?:[a-zA-Z0-9*-]+\.)+[a-zA-Z]{2,}$/;

export const API_KEY_STATUS_CODE = {
    ACTIVE: 0,
    INACTIVE: 1,
    EXPIRED: 2,
    REVOKED: 3,
    SUSPENDED: 4,
};

const ApiKeyD1Schema = vb.object({
    id: vb.pipe(vb.string(), vb.ulid("invalid ulid for api key id")),
    sub_prefix: vb.pipe(vb.string(), vb.minLength(STRING_MIN_LENGTH)),
    key_name: vb.pipe(vb.string(), vb.minLength(STRING_MIN_LENGTH)),
    key_hash: vb.pipe(vb.string(), vb.hash(["sha256"], "invalid sha256 hash")),
    crc32: vb.pipe(vb.string(), vb.hash(["crc32"], "invalid crc32 checksum")),
    status: vb.pipe(vb.number(), vb.minValue(STATUS_MIN_VALUE), vb.maxValue(STATUS_MAX_VALUE)),
    allowed_ips: vb.nullable(vb.pipe(vb.string(), vb.ip("invalid IP address format"))),
    allowed_senders: vb.nullable(vb.pipe(vb.string(), vb.email("invalid email format"))),
    allowed_domains: vb.nullable(
        vb.pipe(vb.string(), vb.regex(DOMAIN_REGEX, "invalid domain format"))
    ),
    expires_at: vb.pipe(vb.string(), vb.isoTimestamp("invalid rfc3339 timestamp")),
    created_at: vb.pipe(vb.string(), vb.isoTimestamp("invalid rfc3339 timestamp")),
    updated_at: vb.pipe(vb.string(), vb.isoTimestamp("invalid rfc3339 timestamp")),
    last_used: vb.nullable(vb.pipe(vb.string(), vb.isoTimestamp("invalid rfc3339 timestamp"))),
});

export const ApiKeySchema = vb.pipe(
    ApiKeyD1Schema,
    vb.transform((dbRecord) => ({
        id: dbRecord.id,
        subPrefix: dbRecord.sub_prefix,
        keyName: dbRecord.key_name,
        keyHash: dbRecord.key_hash,
        crc32: dbRecord.crc32,
        status: dbRecord.status,
        allowedIps: dbRecord.allowed_ips,
        allowedSenders: dbRecord.allowed_senders,
        allowedDomains: dbRecord.allowed_domains,
        expiresAt: dbRecord.expires_at,
        createdAt: dbRecord.created_at,
        updatedAt: dbRecord.updated_at,
        lastUsed: dbRecord.last_used,
    }))
);

export type ApiKeyD1Record = vb.InferInput<typeof ApiKeySchema>;
export type ApiKey = vb.InferOutput<typeof ApiKeySchema>;

export type KeyPrincipal = {
    id: ApiKey["id"];
    subPrefix: ApiKey["subPrefix"];
    keyName: ApiKey["keyName"];
    allowedIps: ApiKey["allowedIps"];
    allowedDomains: ApiKey["allowedDomains"];
    allowedSenders: ApiKey["allowedSenders"];
};
