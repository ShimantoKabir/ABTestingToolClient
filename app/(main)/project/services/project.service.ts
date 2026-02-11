import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";
import {
  ProjectAssignUserRequestDto,
  ProjectAssignUserResponseDto,
  ProjectCreateRequestDto,
  ProjectCreateResponseDto,
  ProjectRemoveUserResponseDto,
  ProjectResponseDto,
} from "../dtos/project.dto";

export interface ProjectService {
  /**
   * Fetch paginated projects for the active organization.
   * Endpoint: POST /projects/all
   */
  getProjects: (
    page: number,
    rows: number
  ) => Promise<PaginationResponseDto<ProjectResponseDto> | ErrorResponseDto>;

  /**
   * Create a new project.
   * Endpoint: POST /projects/
   */
  createProject: (
    request: ProjectCreateRequestDto
  ) => Promise<ProjectCreateResponseDto | ErrorResponseDto>;

  getUserProjectsByUserIdAndOrgId: (
    userId: number
  ) => Promise<ProjectResponseDto[] | ErrorResponseDto>;

  // NEW: Assign a user to a project
  assignUserToProject: (
    projectId: number,
    request: ProjectAssignUserRequestDto
  ) => Promise<ProjectAssignUserResponseDto | ErrorResponseDto>;

  // NEW: Remove a user from a project
  removeUserFromProject: (
    projectId: number,
    userId: number
  ) => Promise<ProjectRemoveUserResponseDto | ErrorResponseDto>;
}

export const ProjectServiceToken = Symbol("ProjectService");
