import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
  UserResponseDto,
} from "../dtos/user.dto";

export interface UserService {
  /**
   * Fetch paginated users for the active organization.
   * Endpoint: POST /users/all
   */
  getUsers: (
    page: number,
    rows: number
  ) => Promise<PaginationResponseDto<UserResponseDto> | ErrorResponseDto>;

  /**
   * Update a user's specific details (Role, Menu, Status).
   * Endpoint: PATCH /users/{userId}/organization/{orgId}
   */
  updateUser: (
    userId: number,
    request: UpdateUserRequestDto
  ) => Promise<UpdateUserResponseDto | ErrorResponseDto>;
}

export const UserServiceToken = Symbol("UserService");
