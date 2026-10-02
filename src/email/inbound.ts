import PostalMime, { Attachment } from "postal-mime";

import { logger } from "../utils/logger";
import type { Env } from "../types/env";
import type { IngressQueueMessage } from "../types/queue";
import { EmailAttachmentPayload } from "../types/email";

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
    // const parser = new PostalMime();
    // const parsedEmail = await parser.parse(message.raw);

    // const payload: IngressQueueMessage = {
    //     from: message.from,
    //     to: message.to,
    //     subject: parsedEmail.subject || "",
    //     text: parsedEmail.text,
    //     html: parsedEmail.html,
    //     headers: Object.fromEntries(message.headers.entries()),
    //     attachments: parsedEmail.attachments.map((att: Attachment): EmailAttachmentPayload => ({
    //         filename: att.filename ?? "unnamed_attachment",
    //         mimeType: att.mimeType,
    //         encoding: "base64",
    //         content: normalizeToBase64(att.content),
    //         disposition: att.disposition === "inline" ? "inline" : "attachment",
    //     })),
    // };

    // await env.INGRESS_QUEUE.send(payload);
    // logger.info(`Queued inbound email from ${message.from} into INGRESS_QUEUE`);
}
