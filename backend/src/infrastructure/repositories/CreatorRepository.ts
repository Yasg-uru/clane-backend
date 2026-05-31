import { CreatorModel, type Creator, type CreatorDocument } from "../../models/Creator.model";
import type {
  ICreatorRepository,
  InstagramPlatformData,
  YoutubePlatformData,
  YoutubeTokenData,
} from "../../core/interfaces/ICreatorRepository";
import type { AuthenticityRisk, WriteData } from "../../core/types";
import { BaseRepository } from "./BaseRepository";

const REFRESH_CUTOFF_MS = 24 * 60 * 60 * 1000; // 24 hours

export class CreatorRepository
  extends BaseRepository<CreatorDocument, Creator>
  implements ICreatorRepository
{
  async findById(id: string): Promise<CreatorDocument | null> {
    return CreatorModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<CreatorDocument | null> {
    return CreatorModel.findOne({ email }).exec();
  }

  async findByEmailWithSecrets(email: string): Promise<CreatorDocument | null> {
    return CreatorModel.findOne({ email }).select("+passwordHash +refreshToken").exec();
  }

  async findByIdWithRefreshToken(id: string): Promise<CreatorDocument | null> {
    return CreatorModel.findById(id).select("+refreshToken").exec();
  }

  async findByIdWithInstagramToken(id: string): Promise<CreatorDocument | null> {
    return CreatorModel.findById(id).select("+instagramAccessToken").exec();
  }

  async findByIdWithYoutubeTokens(id: string): Promise<CreatorDocument | null> {
    return CreatorModel.findById(id).select("+youtubeAccessToken +youtubeRefreshToken").exec();
  }

  async emailExists(email: string): Promise<boolean> {
    return Boolean(await CreatorModel.exists({ email }));
  }

  async findByGoogleId(googleId: string): Promise<CreatorDocument | null> {
    return CreatorModel.findOne({ googleId }).exec();
  }

  async findByInstagramId(instagramId: string): Promise<CreatorDocument | null> {
    return CreatorModel.findOne({ instagramId }).exec();
  }

  async findByYoutubeChannelId(channelId: string): Promise<CreatorDocument | null> {
    return CreatorModel.findOne({ youtubeChannelId: channelId }).exec();
  }

  async linkSocialProvider(userId: string, data: Partial<Creator>): Promise<void> {
    await CreatorModel.findByIdAndUpdate(userId, data).exec();
  }

  async markProfileComplete(userId: string): Promise<void> {
    await CreatorModel.findByIdAndUpdate(userId, { isProfileComplete: true }).exec();
  }

  async updateInstagramPlatformData(creatorId: string, data: InstagramPlatformData): Promise<void> {
    await CreatorModel.findByIdAndUpdate(creatorId, data).exec();
  }

  async updateYoutubePlatformData(creatorId: string, data: YoutubePlatformData): Promise<void> {
    await CreatorModel.findByIdAndUpdate(creatorId, data).exec();
  }

  async updateYoutubeTokens(creatorId: string, data: YoutubeTokenData): Promise<void> {
    await CreatorModel.findByIdAndUpdate(creatorId, data).exec();
  }

  async updateInstagramAuthenticityScore(
    creatorId: string,
    score: number,
    risk: AuthenticityRisk,
  ): Promise<void> {
    await CreatorModel.findByIdAndUpdate(creatorId, {
      instagramAuthenticityScore: score,
      instagramAuthenticityRisk: risk,
    }).exec();
  }

  async updateYoutubeAuthenticityScore(
    creatorId: string,
    score: number,
    risk: AuthenticityRisk,
  ): Promise<void> {
    await CreatorModel.findByIdAndUpdate(creatorId, {
      youtubeAuthenticityScore: score,
      youtubeAuthenticityRisk: risk,
    }).exec();
  }

  async findCreatorsForInstagramRefresh(): Promise<CreatorDocument[]> {
    const cutoff = new Date(Date.now() - REFRESH_CUTOFF_MS);
    return CreatorModel.find(
      {
        instagramConnected: true,
        instagramAccessToken: { $exists: true, $ne: null },
        $or: [
          { instagramDataFetchedAt: { $exists: false } },
          { instagramDataFetchedAt: { $lt: cutoff } },
        ],
      },
      { _id: 1 },
    ).exec();
  }

  async findCreatorsForYoutubeRefresh(): Promise<CreatorDocument[]> {
    const cutoff = new Date(Date.now() - REFRESH_CUTOFF_MS);
    return CreatorModel.find(
      {
        youtubeConnected: true,
        youtubeRefreshToken: { $exists: true, $ne: null },
        $or: [
          { youtubeDataFetchedAt: { $exists: false } },
          { youtubeDataFetchedAt: { $lt: cutoff } },
        ],
      },
      { _id: 1 },
    ).exec();
  }

  async create(data: WriteData<Creator>): Promise<CreatorDocument> {
    return CreatorModel.create(data);
  }

  async updateById(id: string, data: WriteData<Creator>): Promise<CreatorDocument | null> {
    return CreatorModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await CreatorModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findAllActive(): Promise<CreatorDocument[]> {
    return CreatorModel.find(
      { isEmailVerified: true },
      { instagramHandle: 1, instagramFollowers: 1, niche: 1, city: 1, instagramConnected: 1, location: 1 },
    ).exec();
  }

  async findByIds(ids: string[]): Promise<CreatorDocument[]> {
    return CreatorModel.find({ _id: { $in: ids } }).exec();
  }
}
