import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  ExperimentCreateRequestDto,
  ExperimentCreateResponseDto,
  ExperimentResponseDto,
  ExperimentUpdateRequestDto,
} from "../dtos/experiment.dto";

export interface ExperimentService {
  getExperimentsByProjectAndOrg: (
    orgId: number,
    projectId: number,
    page: number,
    rows: number
  ) => Promise<PaginationResponseDto<ExperimentResponseDto> | ErrorResponseDto>;

  createExperiment: (
    req: ExperimentCreateRequestDto
  ) => Promise<ExperimentCreateResponseDto | ErrorResponseDto>;

  getExperimentById: (
    id: number
  ) => Promise<ExperimentResponseDto | ErrorResponseDto>;

  updateExperiment: (
    id: number,
    req: ExperimentUpdateRequestDto
  ) => Promise<ExperimentResponseDto | ErrorResponseDto>;
}

export const ExperimentServiceToken = Symbol("ExperimentService");
