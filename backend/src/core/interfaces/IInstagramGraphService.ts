import type { InstagramRichProfile } from "../../modules/social-verification/social-verification.types";

export interface IInstagramGraphService {
  fetchRichProfile(decryptedAccessToken: string): Promise<InstagramRichProfile>;
}
