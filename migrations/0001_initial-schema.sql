-- Migration number: 0001 	 2026-10-09T04:25:38.304Z
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    sub_prefix TEXT NOT NULL,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    crc32 TEXT NOT NULL,
    status NUMBER NOT NULL CHECK (
        status BETWEEN 0
        AND 4
    ) DEFAULT 0,
    allowed_senders TEXT,
    allowed_domains TEXT,
    allowed_ips TEXT,
    rate_limit INTEGER DEFAULT 100,
    expiers_at TEXT,
    created_at TEXT NOT NULL DEFAULT (STRFTIME(
        '%Y-%m-%dT%H:%M:%SZ',
        'now'
    )),
    updated_at TEXT NOT NULL DEFAULT (STRFTIME(
        '%Y-%m-%dT%H:%M:%SZ',
        'now'
    )),
    last_used TEXT
);
CREATE INDEX IF NOT EXISTS idx_api_keys_allowed_domain
ON api_keys (allowed_domains);
CREATE INDEX IF NOT EXISTS idx_api_keys_expiration
ON api_keys (expires_at)
WHERE
    status = 0;

CREATE TRIGGER IF NOT EXISTS trig_api_keys_updated_at
AFTER UPDATE ON api_keys
FOR EACH ROW
BEGIN
    UPDATE api_keys
    SET updated_at = STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE id = new.id;
END;
