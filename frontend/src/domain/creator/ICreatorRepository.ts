import type { CreatorListFilters, PaginatedCreators } from "@/types/creator.types";

export interface ICreatorRepository {
  browseCreators(filters: CreatorListFilters): Promise<PaginatedCreators>;
}
