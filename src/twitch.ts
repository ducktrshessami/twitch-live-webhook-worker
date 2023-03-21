import { Env } from ".";
import {
    hexBuffer,
    requestHeader,
    stringBuffer
} from "./utils";

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

export enum SubscriptionType {
    ChannelUpdate = "channel.update",
    ChannelFollow = "channel.follow",
    ChannelSubscribe = "channel.subscribe",
    ChannelSubscriptionEnd = "channel.subscription.end",
    ChannelSubscriptionGift = "channel.subscription.gift",
    ChannelSubscriptionMessage = "channel.subscription.message",
    ChannelCheer = "channel.cheer",
    ChannelRaid = "channel.raid",
    ChannelBan = "channel.ban",
    ChannelUnban = "channel.unban",
    ChannelModeratorAdd = "channel.moderator.add",
    ChannelModeratorRemove = "channel.moderator.remove",
    ChannelPointsCustomRewardAdd = "channel.channel_points_custom_reward.add",
    ChannelPointsCustomRewardUpdate = "channel.channel_points_custom_reward.update",
    ChannelPointsCustomRewardRemove = "channel.channel_points_custom_reward.remove",
    ChannelPointsCustomRewardRedemptionAdd = "channel.channel_points_custom_reward_redemption.add",
    ChannelPointsCustomRewardRedemptionUpdate = "channel.channel_points_custom_reward_redemption.update",
    ChannelPollBegin = "channel.poll.begin",
    ChannelPollProgress = "channel.poll.progress",
    ChannelPollEnd = "channel.poll.end",
    ChannelPredictionBegin = "channel.prediction.begin",
    ChannelPredictionProgress = "channel.prediction.progress",
    ChannelPredictionLock = "channel.prediction.lock",
    ChannelPredictionEnd = "channel.prediction.end",
    CharityDonation = "channel.charity_campaign.donate",
    CharityCampaignStart = "channel.charity_campaign.start",
    CharityCampaignProgress = "channel.charity_campaign.progress",
    CharityCampaignStop = "channel.charity_campaign.stop",
    DropEntitlementGrant = "drop.entitlement.grant",
    ExtensionBitsTransactionCreate = "extension.bits_transaction.create",
    GoalBegin = "channel.goal.begin",
    GoalProgress = "channel.goal.progress",
    GoalEnd = "channel.goal.end",
    HypeTrainBegin = "channel.hype_train.begin",
    HypeTrainProgress = "channel.hype_train.progress",
    HypeTrainEnd = "channel.hype_train.end",
    ShieldModeBegin = "channel.shield_mode.begin",
    ShieldModeEnd = "channel.shield_mode.end",
    ShoutoutCreate = "channel.shoutout.create",
    ShoutoutReceived = "channel.shoutout.receive",
    StreamOnline = "stream.online",
    StreamOffline = "stream.offline",
    UserAuthorizationGrant = "user.authorization.grant",
    UserAuthorizationRevoke = "user.authorization.revoke",
    UserUpdate = "user.update"
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

export type BaseCondition = { broadcaster_user_id: string };
export type ChannelFollowCondition = BaseCondition & { moderator_user_id: string };
export type ChannelRaidCondition = {
    from_broadcaster_user_id: string;
    to_broadcaster_user_id: string;
};
export type ChannelPointsCustomSpecificRewardCondition = BaseCondition & { reward_id: string };
export type DropEntitlementGrantCondition = {
    organization_id: string;
    category_id: string;
    campaign_id: string;
};
export type ExtensionBitsTransactionCreateCondition = { extension_client_id: string };
export type UserAuthorizationCondition = { client_id: string };
export type UserUpdateCondition = { user_id: string };
export type Condition =
    BaseCondition |
    ChannelFollowCondition |
    ChannelRaidCondition |
    ChannelPointsCustomSpecificRewardCondition |
    DropEntitlementGrantCondition |
    ExtensionBitsTransactionCreateCondition |
    UserAuthorizationCondition |
    UserUpdateCondition;

export type Subscription<T extends Condition = Condition> = {
    id: string;
    type: `${SubscriptionType}`;
    version: string;
    status: string;
    cost: number;
    condition: T;
    created_at: string;
};

export type BaseWebhookBody = { subscription: Subscription };
export type WebhookCallbackVerificationBody = BaseWebhookBody & { challenge: string };
