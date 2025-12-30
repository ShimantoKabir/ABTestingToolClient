import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { TrafficService } from "./traffic.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { VariationResponseDto } from "../../variation/dtos/variation.dto";
import { TrafficAllocationRequestDto } from "../dtos/traffic.dto";

@injectable()
export class TrafficServiceImp implements TrafficService {
  updateTraffic = async (
    experimentId: number,
    req: TrafficAllocationRequestDto
  ): Promise<VariationResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.put<VariationResponseDto[]>(
        `/experiments/${experimentId}/traffic`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
