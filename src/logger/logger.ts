import {
    getLogger,
    configure,
    getConsoleSink,
    type Logger,
    type LogRecord,
} from "@logtape/logtape";

let isConfigured = false;

function cloudflareConsoleFormatter(record: LogRecord): readonly unknown[] {
    const message = record.message
        .map((part) => {
            return typeof part === "string" ? part : String(part);
        })
        .join("");

    return [
        {
            level: record.level,
            logger: record.category.join("."),
            message: message,
            ...record.properties,
        },
    ];
}

export async function setupLogger() {
    if (isConfigured) {
        return;
    }

    await configure({
        loggers: [
            {
                category: ["logtape", "meta"],
                lowestLevel: "warning",
                sinks: ["console"],
            },
            {
                category: ["worker"],
                lowestLevel: "info",
                sinks: ["console"],
            },
        ],

        sinks: {
            console: getConsoleSink({
                formatter: cloudflareConsoleFormatter,
            }),
        },
    });

    isConfigured = true;
}

export function createLogger(name?: string): Logger {
    if (!name) {
        return getLogger(["worker"]);
    }
    return getLogger(["worker", name]);
}
