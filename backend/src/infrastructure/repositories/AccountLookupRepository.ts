import { BrandModel } from "../../models/Brand.model";
import { CreatorModel } from "../../models/Creator.model";
import type { IAccountLookupRepository } from "../../core/interfaces/IAccountLookupRepository";

/**
 * Owns identity lookups that span both role collections, so that neither
 * BrandRepository nor CreatorRepository has to import the other's model.
 */
export class AccountLookupRepository implements IAccountLookupRepository {
  async emailExistsAcrossRoles(email: string): Promise<boolean> {
    const [brand, creator] = await Promise.all([
      BrandModel.exists({ email }),
      CreatorModel.exists({ email }),
    ]);
    return brand !== null || creator !== null;
  }
}
