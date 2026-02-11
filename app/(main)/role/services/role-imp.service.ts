import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { RoleService } from "./role.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";

// DTO Imports based on your new structure
import { RoleResponseDto } from "../dtos/role-response.dto";
import { RoleCreateRequestDto } from "../dtos/role-create-request.dto"; // Assuming this maps to your provided class
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import { RoleCreateResponseDto } from "../dtos/role-create-response.dto";
import { RoleUpdateRequestDto } from "../dtos/role-update-request.dto";

@injectable()
export class RoleServiceImp implements RoleService {
  private cookieService = container.get<CookieService>(CookieServiceToken);

  private getOrgId(): number {
    const loginInfo = this.cookieService.getJwtLoginInfo();
    return loginInfo?.activeOrg ? loginInfo.activeOrg.id : 0;
  }

  getRoles = async (
    page: number,
    rows: number
  ): Promise<PaginationResponseDto<RoleResponseDto> | ErrorResponseDto> => {
    try {
      const orgId = this.getOrgId();

      // We expect the API to return the generic pagination structure
      const response = await api.post<PaginationResponseDto<RoleResponseDto>>(
        "/roles/all",
        {
          orgId: orgId,
          page: page,
          rows: rows,
        }
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createRole = async (
    roleCreateRequest: RoleCreateRequestDto
  ): Promise<RoleCreateResponseDto | ErrorResponseDto> => {
    try {
      const orgId = this.getOrgId();

      // Note: We use the 'name' from your DTO and inject the 'orgId'
      const response = await api.post<RoleCreateResponseDto>("/roles/", {
        name: roleCreateRequest.name,
        orgId: orgId,
      });
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updateRole = async (
    id: number,
    roleUpdateRequest: RoleUpdateRequestDto
  ): Promise<any | ErrorResponseDto> => {
    try {
      const response = await api.patch<any>(`/roles/${id}`, {
        name: roleUpdateRequest.name,
      });
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  deleteRole = async (id: number): Promise<any | ErrorResponseDto> => {
    try {
      const response = await api.delete<any>(`/roles/${id}`);
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
