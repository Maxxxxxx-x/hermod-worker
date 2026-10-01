import type { EmailAttachment, SendEmailOpts } from "./email";

export interface IngressQueueMessage {
    from: string;
    to: string;
    subject?: string;
    text?: string;
    html?: string;
    headers: Record<string, string>;
    attachments: EmailAttachment[];
}

export type EgressQueueMessage = SendEmailOpts;

export type QueueMessage = IngressQueueMessage | EgressQueueMessage;
