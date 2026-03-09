import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { AnalyticsResponseDto } from "../dtos/analytics.dto";

export interface AnalyticsService {
  getFullStatsAnalytics: (
    experimentId: number,
  ) => Promise<AnalyticsResponseDto[] | ErrorResponseDto>;
}

export const AnalyticsServiceToken = Symbol("AnalyticsService");
