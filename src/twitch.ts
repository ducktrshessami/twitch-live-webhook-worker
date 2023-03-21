import { Env } from ".";

export enum RequestHeaders {
    MessageId = "twitch-eventsub-message-id",
    MessageRetry = "twitch-eventsub-message-retry",
    MessageType = "twitch-eventsub-message-type",
    MessageSignature = "twitch-eventsub-message-signature",
    MessageTimestamp = "twitch-eventsub-message-timestamp",
    SubscriptionType = "twitch-eventsub-subscription-type",
    SubscriptionVersion = "twitch-eventsub-subscription-version"
}

export enum NotificationType {
    Notification = "notification",
    WebhookCallbackVerification = "webhook_callback_verification",
    Revocation = "revocation"
}

function stringBuffer(str: string): ArrayBuffer {
    return new TextEncoder()
        .encode(str);
}

function hexBuffer(hex: string): ArrayBuffer {
    const bytes = hex.match(/.{1,2}/g) ?? [];
    return Uint8Array.from(bytes.map(byte => parseInt(byte, 16)));
}

async function getKey(env: Env): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        "raw",
        stringBuffer(env.TWITCH_SECRET),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["verify"]
    );
}

function requestHeader(request: Request, header: string): string {
    return request.headers.get(header) ?? "";
}

async function getHmacMessage(request: Request, body: Blob): Promise<ArrayBuffer> {
    return await new Blob([
        requestHeader(request, RequestHeaders.MessageId),
        requestHeader(request, RequestHeaders.MessageTimestamp),
        body
    ])
        .arrayBuffer();
}

export async function verifyRequest(request: Request, body: Blob, env: Env): Promise<boolean> {
    const [key, message] = await Promise.all([
        getKey(env),
        getHmacMessage(request, body)
    ]);
    return await crypto.subtle.verify(
        "HMAC",
        key,
        hexBuffer(requestHeader(request, RequestHeaders.MessageSignature)),
        message
    );
}
