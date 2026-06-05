import type { CreatorDocument } from "../../models/Creator.model";
import { CreatorPlatform, type CreatorBrowseView } from "./creator.types";

export class CreatorMapper {
  static toBrowseView(doc: CreatorDocument): CreatorBrowseView {
    return {
      id: doc._id.toString(),
      fullName: doc.fullName,
      instagramHandle: doc.instagramHandle,
      instagramFollowers: doc.instagramFollowers,
      niche: doc.niche,
      city: doc.city,
      platform: CreatorMapper.derivePlatform(doc.instagramConnected, doc.youtubeConnected),
      instagramProfilePicUrl: doc.instagramProfilePicUrl,
      instagramEngagementRate: doc.instagramEngagementRate,
      instagramAvgLikes: doc.instagramAvgLikes,
      instagramAuthenticityScore: doc.instagramAuthenticityScore,
      instagramAuthenticityRisk: doc.instagramAuthenticityRisk,
      youtubeSubscriberCount: doc.youtubeSubscriberCount,
      youtubeEngagementRate: doc.youtubeEngagementRate,
      youtubeAvgViews: doc.youtubeAvgViews,
      youtubeAuthenticityScore: doc.youtubeAuthenticityScore,
      youtubeAuthenticityRisk: doc.youtubeAuthenticityRisk,
      instagramConnected: doc.instagramConnected,
      instagramVerified: doc.instagramVerified,
      youtubeConnected: doc.youtubeConnected,
      isProfileComplete: doc.isProfileComplete,
      createdAt: doc.createdAt ?? new Date(),
    };
  }

  private static derivePlatform(
    instagramConnected: boolean,
    youtubeConnected: boolean,
  ): CreatorPlatform | "none" {
    if (instagramConnected && youtubeConnected) return CreatorPlatform.Both;
    if (instagramConnected) return CreatorPlatform.Instagram;
    if (youtubeConnected) return CreatorPlatform.YouTube;
    return "none";
  }
}
