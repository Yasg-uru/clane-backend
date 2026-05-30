import crypto from "crypto";
import type { CampaignDocument } from "../../models/Campaign.model";
import { CampaignDeliveryType } from "../../models/Campaign.model";
import { SLUG_SUFFIX_BYTES, MIN_DEADLINE_MS } from "./campaign.constants";

export class CampaignUtils {
  static generateUniqueSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
    // Timestamp (base36) + random bytes (hex) = guaranteed unique + SEO-friendly
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(SLUG_SUFFIX_BYTES).toString("hex");
    return `${base}-${timestamp}-${random}`;
  }

  static isReadyToPublish(campaign: CampaignDocument): boolean {
    const shootingLocationValid =
      campaign.deliveryType !== CampaignDeliveryType.Onsite || !!campaign.shootingLocation;

    return (
      !!campaign.title &&
      !!campaign.platform &&
      campaign.niche.length > 0 &&
      !!campaign.targetLocation &&
      !!campaign.targetGender &&
      !!campaign.contentBrief &&
      !!campaign.deadline &&
      campaign.deadline >= new Date(Date.now() + MIN_DEADLINE_MS) &&
      campaign.budgetAmount > 0 &&
      !!campaign.revisionRounds &&
      !!campaign.deliveryType &&
      shootingLocationValid
    );
  }
}
