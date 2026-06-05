import type { CreatorListFilters, PaginatedCreators } from "@/types/creator.types";
import type { ICreatorRepository } from "./ICreatorRepository";

export class CreatorService {
  constructor(private readonly repo: ICreatorRepository) {}

  async browseCreators(filters: CreatorListFilters): Promise<PaginatedCreators> {
    return this.repo.browseCreators(filters);
  }
}
