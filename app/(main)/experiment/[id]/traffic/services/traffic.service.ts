import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { VariationResponseDto } from "../../variation/dtos/variation.dto"; // Reuse variation DTO response
import { TrafficAllocationRequestDto } from "../dtos/traffic.dto";

export interface TrafficService {
  updateTraffic: (
    experimentId: number,
    req: TrafficAllocationRequestDto
  ) => Promise<VariationResponseDto[] | ErrorResponseDto>;
}

export const TrafficServiceToken = Symbol("TrafficService");
