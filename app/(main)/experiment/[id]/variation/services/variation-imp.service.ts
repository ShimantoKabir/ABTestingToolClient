import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { VariationService } from "./variation.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  VariationCreateRequestDto,
  VariationResponseDto,
  VariationUpdateRequestDto,
} from "../dtos/variation.dto";

@injectable()
export class VariationServiceImp implements VariationService {
  getVariations = async (
    experimentId: number
  ): Promise<VariationResponseDto[] | ErrorResponseDto> => {
    try {
      const response = await api.get<VariationResponseDto[]>(
        `/experiments/${experimentId}/variations`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createVariation = async (
    experimentId: number,
    req: VariationCreateRequestDto
  ): Promise<VariationResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.post<VariationResponseDto>(
        `/experiments/${experimentId}/variations`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updateVariation = async (
    id: number,
    req: VariationUpdateRequestDto
  ): Promise<VariationResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.patch<VariationResponseDto>(
        `/variations/${id}`,
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
