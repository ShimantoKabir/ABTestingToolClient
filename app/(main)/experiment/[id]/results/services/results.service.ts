import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import { ResultDetailDto, ResultDetailRequestDto, ResultsResponseDto } from "../dtos/results.dto";

export interface ResultsService {
  getResults: (
    experimentId: number
  ) => Promise<ResultsResponseDto[] | ErrorResponseDto>;

  getResultDetails: (
    experimentId: number,
    request: ResultDetailRequestDto
  ) => Promise<PaginationResponseDto<ResultDetailDto> | ErrorResponseDto>;
}

export const ResultsServiceToken = Symbol("ResultsService");
