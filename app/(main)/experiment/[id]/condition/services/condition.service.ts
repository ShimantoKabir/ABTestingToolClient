import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  ConditionCreateRequestDto,
  ConditionResponseDto,
} from "../dtos/condition.dto";

export interface ConditionService {
  getConditions: (
    experimentId: number
  ) => Promise<ConditionResponseDto[] | ErrorResponseDto>;

  createCondition: (
    experimentId: number,
    req: ConditionCreateRequestDto
  ) => Promise<ConditionResponseDto | ErrorResponseDto>;

  deleteCondition: (
    conditionId: number
  ) => Promise<ConditionResponseDto | ErrorResponseDto>;
}

export const ConditionServiceToken = Symbol("ConditionService");
