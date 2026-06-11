import type { Brand, BrandDocument } from "../../models/Brand.model";
import type { IAuthRepository } from "./IRepository";

export interface IBrandRepository extends IAuthRepository<BrandDocument, Brand> {
  findByGoogleId(googleId: string): Promise<BrandDocument | null>;
  findByInstagramId(instagramId: string): Promise<BrandDocument | null>;
  linkSocialProvider(userId: string, data: Partial<Brand>): Promise<void>;
  markProfileComplete(userId: string): Promise<void>;
}
