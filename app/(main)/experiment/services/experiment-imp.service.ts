import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { ExperimentService } from "./experiment.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  ExperimentCreateRequestDto,
  ExperimentCreateResponseDto,
  ExperimentResponseDto,
  ExperimentUpdateRequestDto,
} from "../dtos/experiment.dto";

@injectable()
export class ExperimentServiceImp implements ExperimentService {
  getExperiments = async (
    orgId: number,
    page: number,
    rows: number
  ): Promise<
    PaginationResponseDto<ExperimentResponseDto> | ErrorResponseDto
  > => {
    try {
      const response = await api.post<
        PaginationResponseDto<ExperimentResponseDto>
      >("/experiments/all", { orgId, page, rows });
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createExperiment = async (
    req: ExperimentCreateRequestDto
  ): Promise<ExperimentCreateResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.post<ExperimentCreateResponseDto>(
        "/experiments",
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  getExperimentById = async (
    id: number
  ): Promise<ExperimentResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.get<ExperimentResponseDto>(
        `/experiments/${id}`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updateExperiment = async (
    id: number,
    req: ExperimentUpdateRequestDto
  ): Promise<ExperimentResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.patch<ExperimentResponseDto>(
        `/experiments/${id}`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
