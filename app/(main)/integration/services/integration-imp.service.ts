import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { IntegrationService } from "./integration.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import {
  GtmToggleResponseDto,
  GtmToggleRequestDto,
} from "../dtos/integration.dto";

@injectable()
export class IntegrationServiceImp implements IntegrationService {
  private cookieService = container.get<CookieService>(CookieServiceToken);

  getGtm = async (): Promise<GtmToggleResponseDto | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const projectId = loginInfo?.activeProject?.id || 0;
      const response = await api.get<GtmToggleResponseDto>(
        `/projects/${projectId}/gtm`,
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updateGtm = async (
    req: GtmToggleRequestDto,
  ): Promise<GtmToggleResponseDto | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const projectId = loginInfo?.activeProject?.id || 0;
      const response = await api.patch<GtmToggleResponseDto>(
        `/projects/${projectId}/gtm`,
        req,
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
