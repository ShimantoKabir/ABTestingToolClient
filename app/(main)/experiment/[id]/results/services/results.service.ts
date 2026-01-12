import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {ResultsResponseDto} from "../dtos/results.dto";

export interface ResultsService {
  getResults: (
    experimentId: number
  ) => Promise<ResultsResponseDto[] | ErrorResponseDto>;
}

export const ResultsServiceToken = Symbol("ResultsService");
