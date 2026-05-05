import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { ResultsService } from "./results.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import { ResultDetailDto, ResultDetailRequestDto, ResultsResponseDto } from "../dtos/results.dto";

@injectable()
export class ResultsServiceImp implements ResultsService {
  getResults = async (
    experimentId: number,
  ): Promise<ResultsResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<ResultsResponseDto[]>(
        `/experiments/${experimentId}/results`,
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  getResultDetails = async (
    experimentId: number,
    request: ResultDetailRequestDto,
  ): Promise<PaginationResponseDto<ResultDetailDto> | ErrorResponseDto> => {
    try {
      const response = await api.post<PaginationResponseDto<ResultDetailDto>>(
        `/experiments/${experimentId}/results/details`,
        request,
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
