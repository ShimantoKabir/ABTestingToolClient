import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { UserService } from "./user.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
  UserResponseDto,
} from "../dtos/user.dto";
import {
  UserJoinOrgRequestDto,
  UserJoinOrgResponseDto,
} from "@/app/(auth)/org/join/dtos/join-org.dto";

@injectable()
export class UserServiceImp implements UserService {
  private cookieService = container.get<CookieService>(CookieServiceToken);

  getUsers = async (
    page: number,
    rows: number
  ): Promise<PaginationResponseDto<UserResponseDto> | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const orgId = loginInfo?.activeOrg?.id || 0;

      const response = await api.post<PaginationResponseDto<UserResponseDto>>(
        "/users/all",
        {
          orgId,
          page,
          rows,
        }
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updateUser = async (
    userId: number,
    request: UpdateUserRequestDto
  ): Promise<UpdateUserResponseDto | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const orgId = loginInfo?.activeOrg?.id || 0;

      // Endpoint: /users/{userId}/organization/{orgId}
      const response = await api.patch<UpdateUserResponseDto>(
        `/users/${userId}/organization/${orgId}`,
        request
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  getUser = async (id: number): Promise<UserResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.get<UserResponseDto>(`/users/${id}`);
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  getUserDetails = async (
    userId: number,
    orgId: number
  ): Promise<UserResponseDto | ErrorResponseDto> => {
    try {
      // NEW ENDPOINT: /{userId}/orgs/{orgId}/details
      const response = await api.get<UserResponseDto>(
        `/${userId}/orgs/${orgId}/details`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  joinOrganization = async (
    req: UserJoinOrgRequestDto
  ): Promise<UserJoinOrgResponseDto | ErrorResponseDto> => {
    try {
      const response = await api.post<UserJoinOrgResponseDto>(
        "/users/join-organization",
        req
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
