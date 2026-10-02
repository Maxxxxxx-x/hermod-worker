export interface InboundRequest {
    token: string;
    body: InBoundRequestBody;
}

interface InBoundRequestBody {
    rawMessage: string;
}