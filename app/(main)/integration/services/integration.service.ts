import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  GtmToggleResponseDto,
  GtmToggleRequestDto,
} from "../dtos/integration.dto";

export interface IntegrationService {
  getGtm: () => Promise<GtmToggleResponseDto | ErrorResponseDto>;
  updateGtm: (
    req: GtmToggleRequestDto,
  ) => Promise<GtmToggleResponseDto | ErrorResponseDto>;
}

export const IntegrationServiceToken = Symbol("IntegrationService");
