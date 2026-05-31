import type { YoutubeChannelData } from "../../modules/social-verification/social-verification.types";

export interface YoutubeTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface IYoutubeDataService {
  fetchChannelData(decryptedAccessToken: string): Promise<YoutubeChannelData>;
  refreshAccessToken(decryptedRefreshToken: string): Promise<YoutubeTokens>;
}
