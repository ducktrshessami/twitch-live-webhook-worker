import { verifyRequest } from "./twitch";

export interface Env {
	TWITCH_SECRET: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const body = await request.blob();
		if (await verifyRequest(request, body, env)) {

		}
		return new Response("Hello World!");
	},
};
