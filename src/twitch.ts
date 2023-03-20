import { Env } from ".";

export enum RequestHeaders {
    MessageId = "twitch-eventsub-message-id",
    MessageTimestamp = "twitch-eventsub-message-timestamp",
    MessageSignature = "twitch-eventsub-message-signature",
    MessageType = "twitch-eventsub-message-type"
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

async function getHmacMessage(request: Request): Promise<ArrayBuffer> {
    return stringBuffer(
        requestHeader(request, RequestHeaders.MessageId) +
        requestHeader(request, RequestHeaders.MessageTimestamp) +
        await request.text()
    );
}

export async function verifyRequest(request: Request, env: Env): Promise<boolean> {
    const [key, message] = await Promise.all([
        getKey(env),
        getHmacMessage(request)
    ]);
    return await crypto.subtle.verify(
        "HMAC",
        key,
        stringBuffer(requestHeader(request, RequestHeaders.MessageSignature)),
        message
    );
}
