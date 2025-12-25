import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  MenuTemplateCreateRequestDto,
  MenuTemplateCreateResponseDto,
  MenuTemplateResponseDto,
} from "../dtos/menu-template.dto";

export interface MenuTemplateService {
  /**
   * Fetches a paginated list of created menu templates.
   */
  getMenuTemplates: (
    page: number,
    rows: number
  ) => Promise<
    PaginationResponseDto<MenuTemplateResponseDto> | ErrorResponseDto
  >;

  /**
   * Creates a new menu template.
   * Returns specific CreateResponseDto
   */
  createMenuTemplate: (
    request: MenuTemplateCreateRequestDto
  ) => Promise<MenuTemplateCreateResponseDto | ErrorResponseDto>;
}

export const MenuTemplateServiceToken = Symbol("MenuTemplateService");
