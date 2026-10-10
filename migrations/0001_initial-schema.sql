-- Migration number: 0001 	 2026-10-09T04:25:38.304Z
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    sub_prefix TEXT NOT NULL,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    crc32 TEXT NOT NULL,
    status NUMBER NOT NULL DEFAULT 0CHECK(status IN (
        0,
        1
    )),
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
