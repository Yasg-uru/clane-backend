import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { requireUser } from "../../utils/httpContext";
import type { CreatorService } from "./CreatorService";
import { creatorBrowseFiltersSchema } from "./creator.validator";

export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  browseCreators = AsyncHandler.wrap(async (req, res) => {
    requireUser(req);
    const parsed = creatorBrowseFiltersSchema.parse(req.query);
    const { page, limit, ...browseFilters } = parsed;
    const result = await this.creatorService.browseCreators(browseFilters, page, limit);
    res.status(200).json(new ApiResponse("Creators retrieved", result));
  });
}
