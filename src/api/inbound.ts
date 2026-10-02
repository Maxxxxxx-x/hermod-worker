import { logger } from "../utils/logger";

import type { Env } from "../types/env";
import type { InboundRequest } from "../types/request";

const ENDPOINTS = {
    "inbound": "/api/v1/webhook/inbound_emails",
}

export async function handleInboundRequest(message: ForwardableEmailMessage, env: Env): Promise<boolean> {
    const url = new URL(`${env.INBOUND_WEBHOOK_URL}${ENDPOINTS.inbound}`);
    const rawMessageString: string = await new Response(message.raw).text();
    const request: InboundRequest = {
        token: env.WEBHOOK_API_KEY,
        body: {
            rawMessage: rawMessageString,
        },
    };
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${request.token}`);
    const response = await fetch(url.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify(request.body),
    });
    if (!response.ok) {
        logger.error(`Failed to forward inbound email to webhook. Status: ${response.status}, StatusText: ${response.statusText}`);
        return false;
    }
    return true;
}