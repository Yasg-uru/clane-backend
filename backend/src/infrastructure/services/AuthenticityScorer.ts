import { AuthenticityRisk } from "../../core/types";
import type { IAuthenticityScorer } from "../../core/interfaces/IAuthenticityScorer";
import type {
  AuthenticityResult,
  InstagramAuthenticityMetrics,
  YoutubeAuthenticityMetrics,
} from "../../modules/social-verification/social-verification.types";

export class AuthenticityScorer implements IAuthenticityScorer {
  scoreInstagram(metrics: InstagramAuthenticityMetrics): AuthenticityResult {
    const engagementScore = this.scoreInstagramEngagement(metrics.engagementRate);
    const audienceQualityScore = this.scoreFollowerRatio(
      metrics.followersCount,
      metrics.followingCount,
    );
    const activityScore = this.scoreInstagramActivity(metrics.mediaCount, metrics.avgLikes);

    const score = Math.min(100, engagementScore + audienceQualityScore + activityScore);

    return {
      score: Math.round(score),
      risk: this.toRisk(score),
      breakdown: { engagementScore, audienceQualityScore, activityScore },
    };
  }

  scoreYoutube(metrics: YoutubeAuthenticityMetrics): AuthenticityResult {
    const engagementScore = this.scoreYoutubeEngagement(metrics.engagementRate);
    const audienceQualityScore = this.scoreViewRate(metrics.subscriberCount, metrics.avgViews);
    const activityScore = this.scoreYoutubeActivity(metrics.videoCount);

    const score = Math.min(100, engagementScore + audienceQualityScore + activityScore);

    return {
      score: Math.round(score),
      risk: this.toRisk(score),
      breakdown: { engagementScore, audienceQualityScore, activityScore },
    };
  }

  // ─── Instagram sub-scorers (max 40 + 30 + 30 = 100) ─────────────────────────

  private scoreInstagramEngagement(er: number): number {
    // Authentic Instagram ER benchmarks: 1–6% is healthy
    if (er <= 0) return 0;
    if (er < 0.3) return 2;
    if (er < 0.5) return 8;
    if (er < 1.0) return 18;
    if (er < 3.0) return 32;
    if (er < 6.0) return 40;
    if (er < 10.0) return 34;
    if (er < 20.0) return 18;
    return 4; // >20%: very suspicious, likely purchased engagement
  }

  private scoreFollowerRatio(followers: number, following: number): number {
    if (followers <= 0) return 0;
    const safeFollowing = Math.max(following, 1);
    const ratio = followers / safeFollowing;
    if (ratio >= 5) return 30;
    if (ratio >= 2) return 25;
    if (ratio >= 1) return 18;
    if (ratio >= 0.5) return 10;
    return 3;
  }

  private scoreInstagramActivity(mediaCount: number, avgLikes: number): number {
    let score = 0;
    if (mediaCount >= 30) score += 20;
    else if (mediaCount >= 10) score += 14;
    else if (mediaCount >= 3) score += 8;
    else score += 3;

    if (avgLikes > 0) score += 10;
    return score;
  }

  // ─── YouTube sub-scorers (max 40 + 30 + 30 = 100) ───────────────────────────

  private scoreYoutubeEngagement(er: number): number {
    // YouTube video engagement ER: (likes + comments) / views × 100
    // Healthy range: 2–8%
    if (er <= 0) return 0;
    if (er < 0.5) return 4;
    if (er < 1.0) return 10;
    if (er < 2.0) return 20;
    if (er < 5.0) return 32;
    if (er < 8.0) return 40;
    if (er < 15.0) return 30;
    return 10; // >15%: suspiciously high
  }

  private scoreViewRate(subscriberCount: number, avgViews: number): number {
    // View rate = avgViews / subscribers × 100
    // Authentic: 3–30%
    if (subscriberCount <= 0) return 15; // hidden subs — neutral score
    const viewRate = (avgViews / subscriberCount) * 100;
    if (viewRate >= 20) return 30;
    if (viewRate >= 10) return 25;
    if (viewRate >= 5) return 18;
    if (viewRate >= 2) return 12;
    if (viewRate >= 1) return 6;
    return 2; // <1% view rate: ghost subs
  }

  private scoreYoutubeActivity(videoCount: number): number {
    if (videoCount >= 50) return 30;
    if (videoCount >= 20) return 25;
    if (videoCount >= 10) return 18;
    if (videoCount >= 5) return 12;
    return 5;
  }

  // ─── Risk classification ─────────────────────────────────────────────────────

  private toRisk(score: number): AuthenticityRisk {
    if (score >= 70) return AuthenticityRisk.Low;
    if (score >= 40) return AuthenticityRisk.Medium;
    return AuthenticityRisk.High;
  }
}
