import { injectable } from "inversify";
import api from "@/app/network/interceptor";
import { ProjectService } from "./project.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  ProjectAssignUserRequestDto,
  ProjectAssignUserResponseDto,
  ProjectCreateRequestDto,
  ProjectCreateResponseDto,
  ProjectDeleteResponseDto,
  ProjectRemoveUserResponseDto,
  ProjectResponseDto,
  ProjectUpdateRequestDto,
  ProjectUpdateResponseDto,
} from "../dtos/project.dto";

@injectable()
export class ProjectServiceImp implements ProjectService {
  private cookieService = container.get<CookieService>(CookieServiceToken);

  getProjects = async (
    page: number,
    rows: number
  ): Promise<PaginationResponseDto<ProjectResponseDto> | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const orgId = loginInfo?.activeOrg?.id || 0;

      const response = await api.post<
        PaginationResponseDto<ProjectResponseDto>
      >("/projects/all", {
        orgId,
        page,
        rows,
      });
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  createProject = async (
    request: ProjectCreateRequestDto
  ): Promise<ProjectCreateResponseDto | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();

      // Auto-inject the active Org ID
      request.orgId = loginInfo?.activeOrg?.id || 0;

      const response = await api.post<ProjectCreateResponseDto>(
        "/projects/",
        request
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  getUserProjectsByUserIdAndOrgId = async (
    userId: number
  ): Promise<ProjectResponseDto[] | ErrorResponseDto> => {
    try {
      const loginInfo = this.cookieService.getJwtLoginInfo();
      const orgId = loginInfo?.activeOrg?.id || 0;

      // GET /projects/user/{userId}/org/{orgId}
      const response = await api.get<ProjectResponseDto[]>(
        `/projects/user/${userId}/org/${orgId}`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  assignUserToProject = async (
    projectId: number,
    request: ProjectAssignUserRequestDto
  ): Promise<ProjectAssignUserResponseDto | ErrorResponseDto> => {
    try {
      // POST /projects/{projectId}/users
      const response = await api.post<ProjectAssignUserResponseDto>(
        `/projects/${projectId}/users`,
        request
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  removeUserFromProject = async (
    projectId: number,
    userId: number
  ): Promise<ProjectRemoveUserResponseDto | ErrorResponseDto> => {
    try {
      // DELETE /projects/{projectId}/users/{userId}
      const response = await api.delete<ProjectRemoveUserResponseDto>(
        `/projects/${projectId}/users/${userId}`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  updateProject = async (
    projectId: number,
    request: ProjectUpdateRequestDto
  ): Promise<ProjectUpdateResponseDto | ErrorResponseDto> => {
    try {
      // PATCH /projects/{id}
      const response = await api.patch<ProjectUpdateResponseDto>(
        `/projects/${projectId}`,
        request
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };

  deleteProject = async (
    projectId: number
  ): Promise<ProjectDeleteResponseDto | ErrorResponseDto> => {
    try {
      // DELETE /projects/{id}
      const response = await api.delete<ProjectDeleteResponseDto>(
        `/projects/${projectId}`
      );
      return response.data;
    } catch (error) {
      return error as ErrorResponseDto;
    }
  };
}
