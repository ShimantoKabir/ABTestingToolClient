import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  VariationCreateRequestDto,
  VariationResponseDto,
  VariationUpdateRequestDto,
} from "../dtos/variation.dto";

export interface VariationService {
  getVariations: (
    experimentId: number
  ) => Promise<VariationResponseDto[] | ErrorResponseDto>;

  createVariation: (
    experimentId: number,
    req: VariationCreateRequestDto
  ) => Promise<VariationResponseDto | ErrorResponseDto>;

  updateVariation: (
    id: number,
    req: VariationUpdateRequestDto
  ) => Promise<VariationResponseDto | ErrorResponseDto>;

  deleteVariation: (
    id: number
  ) => Promise<VariationResponseDto | ErrorResponseDto>;
}

export const VariationServiceToken = Symbol("VariationService");
