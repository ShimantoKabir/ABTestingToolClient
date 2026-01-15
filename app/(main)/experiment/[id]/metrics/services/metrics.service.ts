import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  MetricsCreateRequestDto,
  MetricsResponseDto,
  MetricsPrimaryUpdateRequestDto,
  MetricsPrimaryUpdateResponseDto,
} from "../dtos/metrics.dto";

export interface MetricsService {
  getMetrics: (
    experimentId: number
  ) => Promise<MetricsResponseDto[] | ErrorResponseDto>;

  createMetric: (
    experimentId: number,
    req: MetricsCreateRequestDto
  ) => Promise<MetricsResponseDto | ErrorResponseDto>;

  deleteMetric: (id: number) => Promise<MetricsResponseDto | ErrorResponseDto>;

  updatePrimaryMetric: (
    id: number,
    req: MetricsPrimaryUpdateRequestDto
  ) => Promise<MetricsPrimaryUpdateResponseDto | ErrorResponseDto>;
}

export const MetricsServiceToken = Symbol("MetricsService");
