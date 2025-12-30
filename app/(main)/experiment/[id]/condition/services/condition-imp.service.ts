import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { ConditionService } from "./condition.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  ConditionCreateRequestDto,
  ConditionResponseDto,
} from "../dtos/condition.dto";

@injectable()
export class ConditionServiceImp implements ConditionService {
  getConditions = async (
    experimentId: number
  ): Promise<ConditionResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<ConditionResponseDto[]>(
        `/experiments/${experimentId}/conditions`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createCondition = async (
    experimentId: number,
    req: ConditionCreateRequestDto
  ): Promise<ConditionResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.post<ConditionResponseDto>(
        `/experiments/${experimentId}/conditions`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  deleteCondition = async (
    conditionId: number
  ): Promise<ConditionResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.delete<ConditionResponseDto>(
        `/conditions/${conditionId}`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
