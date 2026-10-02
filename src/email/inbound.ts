import PostalMime, { Attachment } from "postal-mime";

import { logger } from "../utils/logger";
import type { Env } from "../types/env";
import type { IngressQueueMessage } from "../types/queue";
import { EmailAttachmentPayload } from "../types/email";

import { handleInboundRequest } from "../api/inbound";

function normalizeToBase64(content: string | ArrayBuffer | Uint8Array): string {
    if (typeof content === "string") {
        return btoa(content);
    }
    if (content instanceof ArrayBuffer) {
        return new Uint8Array(content).toBase64();
    }
    return content.toBase64();
}

export async function handleInboundEmail(
    message: ForwardableEmailMessage,
    env: Env,
): Promise<void> {
    const success = await handleInboundRequest(message, env);
    if (!success) {
        logger.error(`Failed to forward inbound email from ${message.from} to webhook.`);
        return;
    }

    logger.info(`Successfully forwarded inbound email from ${message.from} to webhook.`);
    return;
}
