import {
	NotificationType,
	RequestHeaders,
	SubscriptionType,
	verifyRequest,
	WebhookBody,
	StreamOnlineCallbackVerificationBody,
	StreamOnlineNotificationBody,
	StreamOnlineRevocationBody,
	StreamOnlineWebhookBody
} from "./twitch";
import { requestHeader } from "./utils";

export interface Env {
	TWITCH_SECRET: string;
	TWITCH_AGE_WARNING?: string;
}

export default {
	async fetch(
		request: Request,
		env: Env
	): Promise<Response> {
		const body = await request.blob();
		if (!(await verifyRequest(request, body, env))) {
			return new Response(null, { status: 401 });
		}
		checkAge(request, env);
		const json: WebhookBody = JSON.parse(await body.text());
		if (!isStreamOnlineBody(json)) {
			return new Response(null, { status: 403 });
		}
		switch (request.headers.get(RequestHeaders.MessageType)) {
			case NotificationType.Notification: return await handleNotification(<StreamOnlineNotificationBody>json);
			case NotificationType.WebhookCallbackVerification: return handleChallenge(<StreamOnlineCallbackVerificationBody>json);
			case NotificationType.Revocation: return await handleRevocation(json);
			default: return new Response(null, { status: 400 });
		}
	},
};

function checkAge(request: Request, env: Env): void {
	const TWITCH_AGE_WARNING = env.TWITCH_AGE_WARNING ? parseInt(env.TWITCH_AGE_WARNING) : 300000;
	const timestamp = new Date(requestHeader(request, RequestHeaders.MessageTimestamp));
	const age = Date.now() - timestamp.getTime();
	if (age > TWITCH_AGE_WARNING) {
		// TODO: Age warning
	}
}

function isStreamOnlineBody(body: WebhookBody): body is StreamOnlineWebhookBody {
	return body.subscription.type === SubscriptionType.StreamOnline;
}

async function handleNotification(body: StreamOnlineNotificationBody): Promise<Response> {
	// TODO: Forward notification
	return new Response(null, { status: 204 });
}

function handleChallenge(body: StreamOnlineCallbackVerificationBody): Response {
	return new Response(body.challenge, { status: 200 });
}

async function handleRevocation(body: StreamOnlineRevocationBody): Promise<Response> {
	// TODO: Forward revocation
	return new Response(null, { status: 204 });
}
