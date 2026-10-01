import type { EmailAttachmentPayload, SendEmailOpts } from "../types/email";

export async function sendOutboundEmail(
    binding: SendEmail,
    opts: SendEmailOpts,
): Promise<EmailSendResult> {
    const formattedAttachments: EmailAttachment[] | undefined = opts.attachments?.map(
        (att: EmailAttachmentPayload): EmailAttachment => {
            if (att.disposition === "inline") {
                return {
                    disposition: "inline" as const,
                    contentId: att.contentId ?? "",
                    filename: att.filename,
                    type: att.mimeType,
                    content: att.content,
                };
            }
            return {
                disposition: "attachment" as const,
                filename: att.filename,
                type: att.mimeType,
                content: att.content,
            };
        },
    );

    return await binding.send({
        from: opts.from,
        to: opts.to,
        cc: opts.cc,
        bcc: opts.bcc,
        replyTo: opts.replyTo,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        attachments: formattedAttachments,
    });
}
