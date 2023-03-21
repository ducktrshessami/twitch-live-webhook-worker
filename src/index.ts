import {
	NotificationType,
	RequestHeaders,
	verifyRequest
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
		if (await verifyRequest(request, body, env)) {
			checkAge(request, env);
			switch (request.headers.get(RequestHeaders.MessageType)) {
				case NotificationType.Notification: return await handleNotification(request, body);
				default: return new Response(null, { status: 400 });
			}
		}
		else {
			return new Response(null, { status: 401 });
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

async function handleNotification(request: Request, body: Blob): Promise<Response> {
	// TODO: Forward notification
	return new Response(null, { status: 204 });
}
