import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsResponseDto } from "../dtos/analytics.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

@injectable()
export class AnalyticsServiceImp implements AnalyticsService {
  getFullStatsAnalytics = async (
    experimentId: number,
  ): Promise<AnalyticsResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<AnalyticsResponseDto[]>(
        `/experiments/${experimentId}/analytics`,
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
