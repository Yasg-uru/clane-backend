import { BrandModel, type BrandDocument } from "../../models/Brand.model";
import { CreatorModel } from "../../models/Creator.model";
import { BaseRepository } from "./BaseRepository";

export class BrandRepository extends BaseRepository<BrandDocument> {
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

  async emailExistsAcrossRoles(email: string): Promise<boolean> {
    const [brand, creator] = await Promise.all([
      BrandModel.exists({ email }),
      CreatorModel.exists({ email }),
    ]);
    return Boolean(brand ?? creator);
  }

  async findByGoogleId(googleId: string): Promise<BrandDocument | null> {
    return BrandModel.findOne({ googleId }).exec();
  }

  async create(data: Partial<Record<string, unknown>>): Promise<BrandDocument> {
    return BrandModel.create(data);
  }

  async updateById(
    id: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<BrandDocument | null> {
    return BrandModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await BrandModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
