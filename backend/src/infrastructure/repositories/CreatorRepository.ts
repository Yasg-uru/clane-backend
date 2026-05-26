import { CreatorModel, type CreatorDocument } from "../../models/Creator.model";
import { BrandModel } from "../../models/Brand.model";
import { BaseRepository } from "./BaseRepository";

export class CreatorRepository extends BaseRepository<CreatorDocument> {
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

  async emailExists(email: string): Promise<boolean> {
    return Boolean(await CreatorModel.exists({ email }));
  }

  async emailExistsAcrossRoles(email: string): Promise<boolean> {
    const [brand, creator] = await Promise.all([
      BrandModel.exists({ email }),
      CreatorModel.exists({ email }),
    ]);
    return Boolean(brand ?? creator);
  }

  async findByInstagramId(instagramId: string): Promise<CreatorDocument | null> {
    return CreatorModel.findOne({ instagramId }).exec();
  }

  async create(data: Partial<Record<string, unknown>>): Promise<CreatorDocument> {
    return CreatorModel.create(data);
  }

  async updateById(
    id: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<CreatorDocument | null> {
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
}
