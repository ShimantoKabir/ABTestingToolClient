import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { MenuTemplateService } from "./menu-template.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  MenuTemplateCreateRequestDto,
  MenuTemplateCreateResponseDto,
  MenuTemplateResponseDto,
} from "../dtos/menu-template.dto";

@injectable()
export class MenuTemplateServiceImp implements MenuTemplateService {
  private cookieService = container.get<CookieService>(CookieServiceToken);

  getMenuTemplates = async (
    page: number,
    rows: number
  ): Promise<
    PaginationResponseDto<MenuTemplateResponseDto> | ErrorResponseDto
  > => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const orgId = loginInfo?.activeOrg?.id || 0;

      const response = await api.post<
        PaginationResponseDto<MenuTemplateResponseDto>
      >("/menu-templates/all", {
        orgId,
        page,
        rows,
      });
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createMenuTemplate = async (
    request: MenuTemplateCreateRequestDto
  ): Promise<MenuTemplateCreateResponseDto | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();

      // Auto-inject the active Org ID
      request.orgId = loginInfo?.activeOrg?.id || 0;

      const response = await api.post<MenuTemplateCreateResponseDto>(
        "/menu-templates/",
        request
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
