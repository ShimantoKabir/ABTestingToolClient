import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { RoleResponseDto } from "../dtos/role-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import { RoleCreateRequestDto } from "../dtos/role-create-request.dto";
import { RoleCreateResponseDto } from "../dtos/role-create-response.dto";
import { RoleUpdateRequestDto } from "../dtos/role-update-request.dto";

export interface RoleService {
  getRoles: (
    page: number,
    rows: number
  ) => Promise<PaginationResponseDto<RoleResponseDto> | ErrorResponseDto>;
  createRole: (
    roleCreateRequest: RoleCreateRequestDto
  ) => Promise<RoleCreateResponseDto | ErrorResponseDto>;
  updateRole: (
    id: number,
    roleUpdateRequest: RoleUpdateRequestDto
  ) => Promise<any | ErrorResponseDto>;
  deleteRole: (id: number) => Promise<any | ErrorResponseDto>;
}

export const RoleServiceToken = Symbol("RoleService");
