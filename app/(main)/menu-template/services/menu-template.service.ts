import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  MenuTemplateCreateRequestDto,
  MenuTemplateCreateResponseDto,
  MenuTemplateResponseDto,
} from "../dtos/menu-template.dto";
import { MenuTemplateUpdateRequestDto } from "../dtos/menu-template-update-request.dto";

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

  /**
   * Updates an existing menu template.
   */
  updateMenuTemplate: (
    id: number,
    request: MenuTemplateUpdateRequestDto
  ) => Promise<any | ErrorResponseDto>;
}

export const MenuTemplateServiceToken = Symbol("MenuTemplateService");
