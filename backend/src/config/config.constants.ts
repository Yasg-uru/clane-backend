export const MAX_RETRIES = 5;
export const RABBITMQ_EXCHANGE_NAME = "creatorlane.events";
export const CAMPAIGN_EXCHANGE_NAME = "creatorlane.campaigns";
export const BID_EXCHANGE_NAME = "creatorlane.bids";
export const ESCROW_EXCHANGE_NAME = "creatorlane.escrow";
export const CREATOR_EXCHANGE_NAME = "creatorlane.creators";

// ─── Event routing keys ────────────────────────────────────────────────────
//
// Single source of truth for every RabbitMQ routing key. Publishers (services)
// and consumers (workers) must reference these enums — never inline the literal
// string — so the publish/consume contract cannot silently drift on a typo.
// Pattern: <noun>.<past-tense-verb>.

export enum AuthEvent {
  UserRegistered = "user.registered",
}

export enum CampaignEvent {
  Published = "campaign.published",
  Unpublished = "campaign.unpublished",
  Closed = "campaign.closed",
  Expired = "campaign.expired",
  Viewed = "campaign.viewed",
}

export enum BidEvent {
  Submitted = "bid.submitted",
  Shortlisted = "bid.shortlisted",
  Declined = "bid.declined",
  Withdrawn = "bid.withdrawn",
  Accepted = "bid.accepted",
  BulkDeclined = "bid.bulk_declined",
}

export enum EscrowEvent {
  Initiated = "escrow.initiated",
  Cancelled = "escrow.cancelled",
  Funded = "escrow.funded",
  RefundInitiated = "escrow.refund_initiated",
}

// Topic-binding wildcard for consumers that fan in on every bid event.
export const BID_EVENT_BINDING = "bid.*";

export enum CreatorEvent {
  InstagramConnected = "creator.instagram.connected",
  YoutubeConnected = "creator.youtube.connected",
  InstagramDataRefresh = "creator.instagram.data.refresh",
  YoutubeDataRefresh = "creator.youtube.data.refresh",
  InstagramDataReady = "creator.instagram.data.ready",
  YoutubeDataReady = "creator.youtube.data.ready",
}

export const CREATOR_INSTAGRAM_DATA_BINDING = "creator.instagram.*";
export const CREATOR_YOUTUBE_DATA_BINDING = "creator.youtube.*";
