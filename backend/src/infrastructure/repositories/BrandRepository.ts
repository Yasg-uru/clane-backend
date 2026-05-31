import { BrandModel, type Brand, type BrandDocument } from "../../models/Brand.model";
import type { IBrandRepository } from "../../core/interfaces/IBrandRepository";
import type { WriteData } from "../../core/types";
import { BaseRepository } from "./BaseRepository";

export class BrandRepository
  extends BaseRepository<BrandDocument, Brand>
  implements IBrandRepository
{
  async findById(id: string): Promise<BrandDocument | null> {
    return BrandModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<BrandDocument | null> {
    return BrandModel.findOne({ email }).exec();
  }

  async findByEmailWithSecrets(email: string): Promise<BrandDocument | null> {
    return BrandModel.findOne({ email }).select("+passwordHash +refreshToken").exec();
  }

  async findByIdWithRefreshToken(id: string): Promise<BrandDocument | null> {
    return BrandModel.findById(id).select("+refreshToken").exec();
  }

  async emailExists(email: string): Promise<boolean> {
    return Boolean(await BrandModel.exists({ email }));
  }

  async findByGoogleId(googleId: string): Promise<BrandDocument | null> {
    return BrandModel.findOne({ googleId }).exec();
  }

  async findByInstagramId(instagramId: string): Promise<BrandDocument | null> {
    return BrandModel.findOne({ instagramId }).exec();
  }

  async linkSocialProvider(userId: string, data: Partial<Brand>): Promise<void> {
    await BrandModel.findByIdAndUpdate(userId, data).exec();
  }

  async markProfileComplete(userId: string): Promise<void> {
    await BrandModel.findByIdAndUpdate(userId, { isProfileComplete: true }).exec();
  }

  async create(data: WriteData<Brand>): Promise<BrandDocument> {
    return BrandModel.create(data);
  }

  async updateById(id: string, data: WriteData<Brand>): Promise<BrandDocument | null> {
    return BrandModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await BrandModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
