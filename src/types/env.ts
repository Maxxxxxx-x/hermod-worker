import type { EgressQueueMessage, IngressQueueMessage } from "./queue";

export interface Env {
    API_SECRET: string;
    INBOUND_WEBHOOK_URL: string;
    WEBHOOK_API_KEY: string;
    EMAIL: SendEmail;
    INGRESS_QUEUE: Queue<IngressQueueMessage>;
    EGRESS_QUEUE: Queue<EgressQueueMessage>;
}
