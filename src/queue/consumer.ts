import { sendOutboundEmail } from "../email/outbound";
import { logger } from "../utils/logger";

import type { IngressQueueMessage, EgressQueueMessage } from "../types/queue";
import type { Env } from "../types/env";

export async function handleQueueBatch(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
        try {
            if (batch.queue === "ingress-queue") {
                const payload = msg.body as IngressQueueMessage;
                const res = await fetch(env.INBOUND_WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": env.WEBHOOK_API_KEY,
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    throw new Error(`Inbound webhook error: ${res.status} ${res.statusText}`);
                }
                msg.ack();
                continue;
            }
            if (batch.queue === "egress-queue") {
                const payload = msg.body as EgressQueueMessage;
                const result = await sendOutboundEmail(env.EMAIL, payload);
                logger.info(`Sent email with id ${result.messageId}`);
                msg.ack();
                continue;
            }
            if (batch.queue === "ingress-dlq" || batch.queue === "egress-dlq") {
                logger.error(
                    `Dropped message in DLQ (${batch.queue}): ${JSON.stringify(msg.body)}`,
                );
                msg.ack();
            }
        } catch (err) {
            logger.error(`Error processing message from ${batch.queue}: ${err}`);
            msg.retry();
        }
    }
}
