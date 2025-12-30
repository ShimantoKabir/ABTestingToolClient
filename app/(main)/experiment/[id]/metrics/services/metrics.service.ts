import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  MetricsCreateRequestDto,
  MetricsResponseDto,
} from "../dtos/metrics.dto";

export interface MetricsService {
  getMetrics: (
    experimentId: number
  ) => Promise<MetricsResponseDto[] | ErrorResponseDto>;

  createMetric: (
    experimentId: number,
    req: MetricsCreateRequestDto
  ) => Promise<MetricsResponseDto | ErrorResponseDto>;
}

export const MetricsServiceToken = Symbol("MetricsService");
