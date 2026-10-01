import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

let isConfigured = false;

export async function setupLogger(): Promise<void> {
    if (isConfigured) {
        return;
    }

    await configure({
        sinks: {
            console: getConsoleSink(),
        },
        loggers: [
            {
                category: "hermod",
                lowestLevel: "debug",
                sinks: ["console"],
            },
        ],
    });

    isConfigured = true;
}

export const logger = getLogger(["hermod"]);
