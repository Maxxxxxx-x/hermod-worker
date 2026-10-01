export type ContentTransferEncoding = "7bit" | "8bit" | "binary" | "quoted-printable" | "base64";

export interface EmailAttachmentPayload {
    filename: string;
    mimeType: string;
    encoding: ContentTransferEncoding;
    content: string;
    contentId?: string;
    disposition?: "attachment" | "inline";
}

export interface SendEmailOpts {
    from: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    replyTo: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: EmailAttachmentPayload[];
}
