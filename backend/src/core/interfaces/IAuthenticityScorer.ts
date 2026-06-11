import type {
  AuthenticityResult,
  InstagramAuthenticityMetrics,
  YoutubeAuthenticityMetrics,
} from "../../modules/social-verification/social-verification.types";

export interface IAuthenticityScorer {
  scoreInstagram(metrics: InstagramAuthenticityMetrics): AuthenticityResult;
  scoreYoutube(metrics: YoutubeAuthenticityMetrics): AuthenticityResult;
}
