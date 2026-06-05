import { apiClient } from "@/lib/api/client";
import { CREATOR_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types";
import type { CreatorListFilters, PaginatedCreators } from "@/types/creator.types";
import type { ICreatorRepository } from "./ICreatorRepository";

export class CreatorRepository implements ICreatorRepository {
  async browseCreators(filters: CreatorListFilters): Promise<PaginatedCreators> {
    const response = await apiClient.get<ApiResponse<PaginatedCreators>>(
      CREATOR_ENDPOINTS.browse,
      { params: filters },
    );
    return response.data.data;
  }
}
