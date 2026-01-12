import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { ResultsService } from "./results.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  ResultsResponseDto,
  ResultsStatsDto,
} from "../dtos/results.dto";

@injectable()
export class ResultsServiceImp implements ResultsService {
  getResults = async (
    experimentId: number
  ): Promise<ResultsResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<ResultsResponseDto[]>(
        `/experiments/${experimentId}/results`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
