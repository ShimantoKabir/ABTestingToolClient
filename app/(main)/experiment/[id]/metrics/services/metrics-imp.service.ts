import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { MetricsService } from "./metrics.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  MetricsCreateRequestDto,
  MetricsResponseDto,
  MetricsPrimaryUpdateRequestDto,
  MetricsPrimaryUpdateResponseDto,
} from "../dtos/metrics.dto";

@injectable()
export class MetricsServiceImp implements MetricsService {
  getMetrics = async (
    experimentId: number
  ): Promise<MetricsResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<MetricsResponseDto[]>(
        `/experiments/${experimentId}/metrics`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createMetric = async (
    experimentId: number,
    req: MetricsCreateRequestDto
  ): Promise<MetricsResponseDto | ErrorResponseDto> => {
    try {
      // experimentId is in the path, req (body) contains title, custom, selector
      const response = await api.post<MetricsResponseDto>(
        `/experiments/${experimentId}/metrics`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  deleteMetric = async (
    id: number
  ): Promise<MetricsResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.delete<MetricsResponseDto>(`/metrics/${id}`);
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updatePrimaryMetric = async (
    id: number,
    req: MetricsPrimaryUpdateRequestDto
  ): Promise<MetricsPrimaryUpdateResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.patch<MetricsPrimaryUpdateResponseDto>(
        `/metrics/${id}/primary`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
