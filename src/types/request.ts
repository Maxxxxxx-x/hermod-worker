export interface InboundRequest {
    token: string;
    body: InBoundRequestBody;
}

interface InBoundRequestBody {
    from: string;
    to: string;
    recipient: string;
    rawMessage: string;
}